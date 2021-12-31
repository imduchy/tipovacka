import { Game, Group, IUser, User } from '@tipovacka/models';
import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { containsAdminKey, hasAdminRole } from '../utils/authMiddleware';
import * as FootballApi from '../utils/footballApi';
import { findUpcomingGame } from '../utils/games';
import { mapPlayers, mapStandings, mapTeamStatistics } from '../utils/groups';
import logger from '../utils/logger';
import multer from 'multer';
import xlsx from 'node-xlsx';

const router = Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`[${req.method}] ${req.baseUrl}${req.path} from ${req.ip}.`);

  if (containsAdminKey(req) || hasAdminRole(req.user as IUser | undefined)) {
    return next();
  }

  logger.warn(
    `[${req.originalUrl}] Unauthorized request was made by user ${
      req.user && (req.user as IUser & { _id: string })._id
    } from IP: ${req.ip}. The provided ADMIN_API_TOKEN was ${req.header('tipovacka-auth-token')}`
  );
  res.status(401).send('Unauthorized request');
};

/**
 * Enroll a group in a competition
 *
 * Access: Admin
 *
 * @param group an ObjectId of the group for which upcoming games should be fetched
 * @param team an API ID of the followed team for which upcoming games should be fetched
 * @param amount number of upcoming games that should be fetched (e.g., next 3 games of the team)
 */
router.post('/groups/competition', authMiddleware, async (req, res) => {
  const groupId: string = req.body.group;
  const teamId: number = req.body.team;
  const season: number = req.body.season;
  const competitionId: number = req.body.competition;

  try {
    logger.info('Fetching the group with id ' + groupId);
    const group = await Group.findById(groupId);
    if (!group) {
      throw new Error(`Group with id ${groupId} doesn't exist.`);
    }

    logger.info('Finding the team with id ' + teamId + 'in the group record.');
    const team = group.followedTeams.find((t) => t.apiId === teamId);
    if (!team) {
      throw new Error(`The group ${group.name} doesn't follow a team with the API id ${teamId}.`);
    }

    // The API doesn't track competition standings before the season starts.
    // Therefore, we don't fetch that information and initialize the standings
    // field as an empty array. To get information about the leage, we fetch
    // information from the /league endpoint.
    logger.info('Fetching the league information from the API.');
    const leagueResponse = await FootballApi.getLeagues({
      id: competitionId,
      season: season,
    });

    logger.info('Fetching the players information from the API.');
    const playersResponse = await FootballApi.getPlayers({
      league: competitionId,
      season: season,
      team: teamId,
    });

    const league = leagueResponse.data.response[0].league;
    const seasonObj = {
      season: season,
      competitions: [
        {
          apiId: league.id,
          name: league.name,
          logo: league.logo,
          standings: [],
          teamStatistics: undefined,
          players: mapPlayers(playersResponse.data.response),
        },
      ],
    };

    logger.info('Pushing the new season and competition object to the group record.');
    team.seasons.push(seasonObj);

    logger.info('Saving the updated group object to the database.');
    await group.save();

    res.status(200).json(seasonObj);
  } catch (error: any) {
    logger.error(
      `An error occured while enrolling a group in a new competition. Error: ${error.message}`
    );
    res.status(400).json(error.message);
  }
});

/**
 * Create a new user in a specified group.
 *
 * Access: Admin
 *
 * @param username username of the new user
 * @param email email of the new user
 * @param password password of the new user
 * @param group ID of the group that the user will be assiged to
 * @param scope roles assigned to the user (e.g., [admin] or [user])
 */
router.post('/users', authMiddleware, async (req, res) => {
  const { group: groupId, username, email, password, password2, scope } = req.body;

  try {
    logger.info('Starting to process the request.');

    if (password !== password2) {
      logger.error('Passwords provided in the request do not match.');
      return res.status(400).json({
        message: 'Passwords provided in the request do not match.',
        code: 'PASSWORDS_DONT_MATCH',
      });
    }

    if (password.length < 6) {
      logger.error('Password provided in the request is shorther than 6 characters.');
      return res.status(400).json({
        message: 'Password provided in the request is shorther than 6 characters.',
        code: 'PASSWORD_TOO_SHORT',
      });
    }

    // Check if a user with this email already exists
    if (await User.findOne({ email })) {
      logger.error('User with specified email already exists in the database.');
      return res.status(400).json({
        message: 'User with this email already exists',
        code: 'USER_ALREADY_EXISTS',
      });
    }

    // Check if a group with the provided ID exists
    if (!(await Group.findById(groupId))) {
      logger.error(`The specified group with id ${groupId} doesn't exist.`);
      return res.status(404).json({
        message: "Group with provided ID doesn't exist",
        code: 'GROUP_DOESNT_EXIST',
      });
    }

    logger.info('Hashing the password.');
    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, salt);

    logger.info('Creating the user in the database.');
    const newUser = await User.create<IUser>({
      username: username,
      bets: [],
      email: email,
      password: encryptedPassword,
      groupId: groupId,
      scope: scope,
    }).then((res) => {
      // Remove password from the object before returning it in the response
      const { password, ...user } = res.toObject();
      return user;
    });

    logger.info('The new user was created created successfully.');
    logger.info(JSON.stringify(newUser));

    res.status(200).json({
      response: newUser,
      code: 'SUCCESS',
    });
  } catch (error) {
    logger.error(`There was an error creting the user. Error: ${error}.`);
    res.status(500).json({
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * Create new users using an Excel sheet
 *
 * Access: Admin
 *
 * @param username username of the new user
 * @param email email of the new user
 * @param password password of the new user
 * @param group ID of the group that the user will be assiged to
 * @param scope roles assigned to the user (e.g., [admin] or [user])
 */
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/users/import', authMiddleware, upload.single('importFile'), async (req, res) => {
  if (!req.file) {
    logger.error("The request doesn't contain an import file.");
    return res.status(400).send("The request doesn't contain an import file.");
  }

  logger.info('Starting to process the request.');
  try {
    const groupId = (req.user as IUser).groupId;
    const fileBuffer = req.file.buffer;
    const workSheet = xlsx.parse(fileBuffer);
    // Remove the "headers" row
    const users = workSheet[0].data
      .slice(1)
      .filter((row) => row[0] != undefined && row[1] != undefined);

    const results = [];

    logger.info(`The excel sheet contains ${users.length} users.`);
    for (const user of users) {
      const email = user[0] as string;
      const username = user[1] as string;

      logger.info(`Adding user ${username} (${email}) to the database.`);

      // Check if a user with this email already exists
      if (await User.findOne({ email })) {
        logger.error('User with specified email already exists in the database.');
        results.push({
          username,
          email,
          error: 'User with this email already exists',
        });
        continue;
      }

      // The initial password of a user will be set to their username.
      // If length of the username is not at least 6 characters (password limit),
      // append "123" at the end of the password.
      const password = username.length >= 6 ? username : username + '123';
      logger.info(`The initial password of the user is set to ${password}.`);
      const salt = await bcrypt.genSalt();
      const encryptedPassword = await bcrypt.hash(password, salt);

      logger.info('Adding the new user in to the database.');
      await User.create<IUser>({
        username: username,
        bets: [],
        email: email,
        password: encryptedPassword,
        groupId: groupId,
        scope: ['user'],
      })
        .then((_) => {
          logger.info('The new user was added successfully to the database.');
          results.push({
            username,
            email,
            error: null,
          });
        })
        .catch((error) => {
          logger.error('An error occured while adding the user to the database.');
          logger.error(error);
          results.push({
            username,
            email,
            error: 'Internal server error.',
          });
        });
    }

    const failed = results.filter((r) => r.error != null);
    if (failed.length !== 0) {
      logger.error(`Failed to create ${failed.length} users. Errors: ${JSON.stringify(failed)}`);
      return res.status(400).json({
        message: `Failed to create ${failed.length} of ${users.length} users.`,
        code: 'IMPORT_NOT_SUCCESSFUL',
      });
    }

    return res.status(200).json({
      response: `Successfully added ${users.length} users.`,
      code: 'SUCCESS',
    });
  } catch (error: any) {
    logger.error(`There was an error creating users. Error: ${error}.`);

    if (error.message) {
      if ((error.message as string).includes('Unsupported')) {
        return res.status(400).json({
          message: error.message,
          code: 'UNSUPPORTED_FILE_FORMAT',
        });
      }
    }

    return res.status(400).json({
      message: `Internal server error.`,
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * Create a new group, populate a specified competition object
 * with standings and team statistics fetched from the Football API.
 *
 * Access: Admin
 *
 * @param name name of the new group
 * @param email email of the new group
 * @param website website of the new group
 * @param team API id of the team that will be initialized as the followedTeam
 * @param league API id of the league for which standings and team statistics will be fetched
 * @param season year of the season for which competition standings and team statistics will be fetched
 *
 */
router.post('/groups', authMiddleware, async ({ body }, res) => {
  try {
    logger.info('Fetching team information from the API.');
    const teamResponse = await FootballApi.getTeam({
      id: body.team,
      league: body.league,
      season: body.season,
    });
    logger.info(JSON.stringify(teamResponse.data));

    if (teamResponse.data.results === 0) {
      logger.error(
        'The team response object contains 0 results. Make sure that the request ' +
          'body contains correct values.'
      );
      return res
        .status(404)
        .json('Team information not found. Make sure the request body contains correct values.');
    }

    logger.info('Fetching team statistics from the API.');
    const statisticsResponse = await FootballApi.getTeamStatistics({
      team: body.team,
      season: body.season,
      league: body.league,
    });
    logger.info(JSON.stringify(statisticsResponse.data));

    if (statisticsResponse.data.results === 0) {
      logger.error(
        'The team statistics response object contains 0 results. Make sure that the ' +
          'request body contains correct values.'
      );
      return res
        .status(404)
        .json('Team statistics not found. Make sure the request body contains correct values.');
    }

    logger.info('Fetching competition standings from the API.');
    const competitionResponse = await FootballApi.getStandings({
      league: body.league,
      season: body.season,
    });
    logger.info(JSON.stringify(competitionResponse.data));

    if (competitionResponse.data.results === 0) {
      logger.error(
        'The competition standings response object contains 0 results. Make sure that the ' +
          'request body contains correct values.'
      );
      return res
        .status(404)
        .json(
          'Team competition standings not found. Make sure the request body contains correct values.'
        );
    }

    logger.info("Fetching team's players from the API.");
    const playersResponse = await FootballApi.getPlayers({
      league: body.league,
      team: body.team,
      season: body.season,
    });
    logger.info(JSON.stringify(playersResponse.data));

    if (playersResponse.data.results === 0) {
      logger.error(
        'The players response object contains 0 results. Make sure that the ' +
          'request body contains correct values.'
      );
      return res
        .status(404)
        .json("Team's players not found. Make sure the request body contains correct values.");
    }

    const { team } = teamResponse.data.response[0];
    const competition = competitionResponse.data.response[0];
    const teamStatistics = statisticsResponse.data.response;
    const players = playersResponse.data.response;

    logger.info('Data fetched successfully. Creating a new group document in the database.');
    const group = await Group.create({
      name: body.name,
      email: body.email,
      website: body.website,
      upcomingGame: undefined,
      users: [],
      followedTeams: [
        {
          apiId: team.id,
          name: team.name,
          logo: team.logo,
          seasons: [
            {
              season: body.season,
              competitions: [
                {
                  apiId: body.league,
                  logo: competition.league.logo,
                  name: competition.league.name,
                  games: [],
                  players: mapPlayers(players),
                  standings: mapStandings(competition),
                  teamStatistics: mapTeamStatistics(teamStatistics),
                },
              ],
            },
          ],
        },
      ],
    });

    try {
      logger.info('Fetching an upcoming game for the group.');
      const upcomingGame = await findUpcomingGame(body.team, [body.league]);

      if (upcomingGame) {
        // Save the game in the database, and update the upcomingGame of the group.
        const game = await Game.create(upcomingGame);
        group.upcomingGame = game._id as Types.ObjectId;
        await group.save();
      }
    } catch (error) {
      logger.error(
        `An error occured while fetching an upcoming game for the group. ` + `Error: ${error}`
      );
      throw error;
    }

    logger.info(`A new group ${group.name} (${group._id}) was created.`);
    res.status(200).json(group);
  } catch (error) {
    logger.error(`Couldn't create a new group. Error: ${error}`);
    res.status(500).json('Internal server error');
  }
});

export default router;
