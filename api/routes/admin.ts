import { NextFunction, Request, Response, Router } from 'express';
import { User, IUser, Group, IGroupCompetition, Game } from '@duchynko/tipovacka-models';
import logger from '../utils/logger';
import { findUpcomingGame } from '../utils/games';
import { isAdmin } from '../utils/authMiddleware';

const router = Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // If req.headers contains the admin key, continue
  if (isAdmin(req)) {
    next();
    return;
  }

  logger.warn(
    `[${req.originalUrl}] Unauthorized request was made by user ${
      req.user && (req.user as IUser & { _id: string })._id
    } from IP: ${req.ip}. The provided ADMIN_API_TOKEN was ${JSON.stringify(
      req.header('tipovacka-auth-token')
    )}`
  );
  res.status(401).send('Unauthorized request');
};

/**
 * Intended for testing the adminAuth middleware
 */
router.get('/test', (req, res) => {
  res.status(200).send(req.originalUrl);
});

/**
 * Get upcoming game
 * Access: ADMIN
 */
router.get('/:groupId/upcomingGame', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('upcomingGame');

    if (!group) {
      throw new Error(`Group with id ${req.params.groupId} doesn't exist.`);
    }

    const competitions = group.competitions.map((c) => c.competitionId);
    const newUpcomingGame = await findUpcomingGame(group.teamId, competitions);

    if (!newUpcomingGame) {
      logger.warn(
        `Didn't find an upcoming game for the team ${group.teamId} ` +
          `in the following competitions ${competitions}.`
      );
      return res.status(200).json("Didn't find any upcoming games.");
    }

    if (newUpcomingGame.gameId === group.upcomingGame?.gameId) {
      res.status(304).json('The current upcoming game is correct. No changes needed.');
      return;
    }
    newUpcomingGame.groupId = group._id;
    const game = await Game.create(newUpcomingGame);

    const response = await Group.findByIdAndUpdate(
      group._id,
      {
        upcomingGame: game._id,
      },
      { new: true }
    );
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

/**
 * Create a user
 * Access: ADMIN
 */
router.post('/users', authMiddleware, async ({ body }, res) => {
  try {
    const group = await Group.findById(body.groupId);
    if (!group) {
      logger.warn(`Group with _id ${body.groupId} doesn't exist.`);
      res.status(404).json("We couldn't find this group");
      return;
    }

    const user = await User.create({
      username: body.username,
      email: body.email,
      password: body.password,
      groupId: body.groupId,
      totalScore: Array.from(group.competitions, (competition) => ({
        competitionId: competition.competitionId,
        season: competition.season,
        score: 0,
      })),
    });
    logger.info(`User ${user._id} created.`);

    group.users.addToSet(user._id);
    await group.save();
    logger.info(`User ${user._id} added to the group ${group.name} (${group._id}).`);

    res.status(200).json(user);
  } catch (error) {
    logger.error(`Couldn't create a user in a group ${body.groupId}. Error: ${error}.`);
    res.status(500).json('Internal server error');
  }
});

/**
 * Create game
 * Access: ADMIN
 */
router.post('/games', authMiddleware, async ({ body }, res) => {
  try {
    const game = await Game.create({
      gameId: body.gameId,
      groupId: body.groupId,
      date: body.date,
      venue: body.venue,
      awayTeam: body.awayTeam,
      homeTeam: body.homeTeam,
      competitionId: body.competition,
      competitionName: body.competitionName,
      season: body.season,
      status: body.status,
    });
    logger.info(`Game ${game.gameId} (${game._id}) created.`);

    res.status(200).json(game);
  } catch (error) {
    logger.error(`Couldn't create a new game. Error: ${error}`);
    res.status(500).json('Internal server error');
  }
});

/**
 * Create a new group, populate a specified competition object
 * with standings and team statistics fetched from the Football API.
 *
 * Access: ADMIN
 *
 * @param name name of the new group
 * @param email email of the new group
 * @param website website of the new group
 * @param team API id of the team that will be initialized as the followedTeam
 * @param league API id of the league for which standings and team statistics will be fetched
 * @param season year of the season for which competition standings and team statistics will be fetched
 *
 */
router.post('/groups', authMiddleware, async ({ body, route, method, ip }, res) => {
  logger.info(`${Date.now()} [${method}] ${route} from ${ip}.`);
  logger.info(`Request body: ${JSON.stringify(body)}.`);
  try {
    logger.info('Fetching team information from the API.');
    const teamInformationResponse = await FootballApi.getTeam({
      id: body.team,
      league: body.league,
      season: body.season,
    });

    logger.info('Fetching team statistics from the API.');
    const teamStatisticsResponse = await FootballApi.getTeamStatistics({
      team: body.team,
      season: body.season,
      league: body.league,
    });

    logger.info('Fetching competition standings from the API.');
    const competitionInformationResponse = await FootballApi.getStandings({
      league: body.league,
      season: body.season,
    });
    // TODO: Check if all above calls fetched data successfully

    const { team, venue } = teamInformationResponse.data.response[0];
    const competition = competitionInformationResponse.data.response[0];
    const teamStatistics = teamStatisticsResponse.data.response;

    logger.info('Creating a new group document.');
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
                  games: [],
                  logo: competition.league.logo,
                  name: competition.league.name,
                  players: [],
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
      // Group _id needs to be set manually, as that's not known from the API call
      upcomingGame.groupId = group._id;

      // Save the game in the database, push it into the upcomingGames array,
      // and save the group object with updated information.
      const game = await Game.create(upcomingGame);
      group.upcomingGames.push(game._id);
    } catch (error) {
      logger.error(
        `An error occured while fetching an upcoming game for the group. ` +
          `Error: ${error}`
      );
      throw error;
    }

    console.log(group.upcomingGames);
    await group.save();

    logger.info(`A new group ${group.name} (${group._id}) was created.`);
    res.status(200).json(group);
  } catch (error) {
    logger.error(`Couldn't create a new group. Error: ${error}`);
    res.status(500).json('Internal server error');
  }
});

/**
 * Delete a group
 * Access: ADMIN
 */
router.delete('/users', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.body.userId });
    logger.info(`A user with id ${req.body.userId} successfully removed.`);
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Couldn't remove a user with id ${req.body.userId}. Error: ${error}`);
    res.status(500).json('Internal server error');
  }
});

export default router;
