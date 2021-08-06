import { Game, Group, IGroup, IUser, User } from '@duchynko/tipovacka-models';
import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response, Router } from 'express';
import { isAdmin, validateInput } from '../utils/authMiddleware';
import * as FootballApi from '../utils/footballApi';
import { findUpcomingGame } from '../utils/games';
import { mapPlayers, mapStandings, mapTeamStatistics } from '../utils/groups';
import logger from '../utils/logger';

const router = Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`[${req.method}] ${req.baseUrl}${req.path} from ${req.ip}.`);

  // If req.headers contains the admin key, continue
  if (isAdmin(req)) {
    return next();
  }

  logger.warn(
    `[${req.originalUrl}] Unauthorized request was made by user ${
      req.user && (req.user as IUser & { _id: string })._id
    } from IP: ${req.ip}. The provided ADMIN_API_TOKEN was ${req.header(
      'tipovacka-auth-token'
    )}`
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
      throw new Error(
        `The group ${group.name} doesn't follow a team with the API id ${teamId}.`
      );
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
  } catch (error) {
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
 * @param username username of the newly created user
 * @param email email of the newly created user
 * @param password password of the newly created user
 * @param group ObjectId of the group the user will be part of
 */
router.post('/users', authMiddleware, async (req, res) => {
  const { group: groupId, username, email, password } = req.body;

  try {
    logger.info('Validating content of the request body.');
    // Check if data sent in the request body are valid
    validateInput(req.body);

    // Check if a user with this email already exist before proceeding
    const user = await User.findOne({ email });
    if (user) {
      logger.warn('User with specified email already exists in the database.');
      return res.status(400).send('Bad request');
    }

    logger.info(`Fetching group with id ${groupId}.`);
    const group = await Group.findById(groupId);

    if (!group) {
      logger.warn(`The specified group with id ${groupId} doesn't exist.`);
      return res.status(404).json("The specified resource doesn't exist");
    }

    logger.info('Hashing the password prior saving it to the database.');
    const salt = await bcrypt.genSalt();
    const encryptedPassword = await bcrypt.hash(password, salt);

    logger.info('The group was fetched successfully. Starting to create the new user.');
    const newUser = await User.create<IUser>({
      username: username,
      email: email,
      password: encryptedPassword,
      groupId: groupId,
    }).then((res) => {
      // Remove password from the object before returning it in the response
      const { password, ...user } = res.toObject();
      return user;
    });

    logger.info('The new user was created created successfully.');
    logger.info(JSON.stringify(newUser));

    res.status(200).json(newUser);
  } catch (error) {
    logger.error(`There was an error creting the user. Error: ${error}.`);
    res.status(500).json('Internal server error');
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
        .json(
          'Team information not found. Make sure the request body contains correct values.'
        );
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
        .json(
          'Team statistics not found. Make sure the request body contains correct values.'
        );
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
        .json(
          "Team's players not found. Make sure the request body contains correct values."
        );
    }

    const { team } = teamResponse.data.response[0];
    const competition = competitionResponse.data.response[0];
    const teamStatistics = statisticsResponse.data.response;
    const players = playersResponse.data.response;

    logger.info(
      'Data fetched successfully. Creating a new group document in the database.'
    );
    const group = await Group.create<IGroup>({
      name: body.name,
      email: body.email,
      website: body.website,
      upcomingGames: [],
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
        // Save the game in the database, push it into the upcomingGames array,
        // and save the group object with updated information .
        const game = await Game.create(upcomingGame);
        group.upcomingGames.push(game._id);

        await group.save();
      }
    } catch (error) {
      logger.error(
        `An error occured while fetching an upcoming game for the group. ` +
          `Error: ${error}`
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
