import { Game, Group, IBet, IBetWithID, IGameWithID, IUserWithID, User } from '@tipovacka/models';
import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { containsAdminKey, infoAuditLog, isLoggedIn, warnAuditLog } from '../utils/authMiddleware';
import { alreadyBet } from '../utils/bets';
import { ResponseErrorCodes, ResponseMessages } from '../utils/constants';
import { getLatestSeason } from '../utils/groups';
import logger from '../utils/logger';

const router = Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  infoAuditLog(req);

  const user = req.user as IUserWithID | undefined;

  // If req.headers contains the admin key, continue
  if (containsAdminKey(req)) {
    return next();
  }

  if (isLoggedIn(req)) {
    return next();
  }

  warnAuditLog(req, user);
  return res.status(401).json({
    message: ResponseMessages.UNAUTHORIZED_REQUEST,
    code: ResponseErrorCodes.UNAUTHORIZED_REQUEST,
  });
};

/**
 * Create a bet
 *
 * Access: Protected (Logged-in & User ids match)
 *
 * @param game ObjectId of the game to fetch
 */
router.post('/', authMiddleware, async (req, res) => {
  logger.info('Data received in the request body: ' + JSON.stringify(req.body));

  const { game: gameId, homeTeamScore, awayTeamScore, scorer } = req.body;
  const rawUser = req.user as IUserWithID;
  const userId = new Types.ObjectId(rawUser._id);

  if (gameId === undefined || homeTeamScore === undefined || awayTeamScore === undefined) {
    logger.warn("The request doesn't contain required request body.");
    return res.status(400).json({
      message: ResponseMessages.REQUIRED_ATTRIBUTES_MISSING,
      code: ResponseErrorCodes.INVALID_REQUEST_BODY,
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      logger.warn("The specified user doesn't exist.");
      return res.status(404).json({
        message: ResponseMessages.USER_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });
    }

    if (alreadyBet(user, gameId)) {
      logger.warn('The specified user has already placed a bet on this game.');
      return res.status(400).json({
        message: ResponseMessages.USER_ALREADY_PLACED_BET,
        code: ResponseErrorCodes.RESOURCE_ALREADY_EXISTS,
      });
    }

    const game = await Game.findById(gameId);
    if (!game) {
      logger.warn("The specified game doesn't exist.");
      return res.status(404).json({
        message: ResponseMessages.GAME_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });
    }

    // Don't submit the bet if the game already started.
    if (new Date().getTime() > game.date.getTime()) {
      logger.warn('The specified game has already started.');
      return res.status(400).json({
        message: ResponseMessages.GAME_ALREADY_STARTED,
        code: ResponseErrorCodes.BAD_REQUEST,
      });
    }

    const bet: IBet = {
      game: gameId,
      user: userId,
      homeTeamScore: homeTeamScore,
      awayTeamScore: awayTeamScore,
      scorer: scorer,
      points: 0,
    };

    user.bets.push(bet);
    await user.save();
    logger.info(`A user ${user._id} submitted a bet on a game ${gameId}.`);

    res.status(200).json(user.bets);
  } catch (error) {
    logger.error(`Couldn't create a bet. Error: ${error}.`);
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * Update a bet
 *
 * Access: Protected (Logged-in)
 *
 * @param bet
 * @param homeTeamScore
 * @param awayTeamScore
 * @param scorer
 */
router.put('/', authMiddleware, async (req, res) => {
  logger.info('Data received in the request body: ' + JSON.stringify(req.body));

  const { bet: betId, homeTeamScore, awayTeamScore, scorer } = req.body;
  const userId = (req.user as IUserWithID)._id;

  if (betId === undefined || homeTeamScore === undefined || awayTeamScore === undefined) {
    logger.warn("The request doesn't contain required request body.");
    return res.status(400).json({
      message: ResponseMessages.REQUIRED_ATTRIBUTES_MISSING,
      code: ResponseErrorCodes.INVALID_REQUEST_BODY,
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      logger.error(`The user ${userId} doesn't exist in the database.`);
      return res.status(400).json({
        message: ResponseMessages.USER_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });
    }

    const bet = user.bets.find((b) => (b as IBetWithID)._id.equals(betId));
    if (!bet) {
      logger.error(`The bet ${betId} doesn't exist in the user object.`);
      return res.status(400).json({
        message: ResponseMessages.BET_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });
    }

    const game = await Game.findById(bet.game);
    if (!game) {
      logger.error(`The game ${bet.game} doesn't exist in the database.`);
      return res.status(400).json({
        message: ResponseMessages.GAME_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });
    }

    // Don't update the bet if the game has already started.
    if (new Date().getTime() > game.date.getTime()) {
      logger.error("The specified game has already started. The bet won't be updated.");
      return res.status(400).json({
        message: ResponseMessages.GAME_ALREADY_STARTED,
        code: ResponseErrorCodes.UNAUTHORIZED_REQUEST,
      });
    }

    bet.awayTeamScore = awayTeamScore;
    bet.homeTeamScore = homeTeamScore;
    bet.scorer = scorer;
    user.markModified('bets');
    await user.save();
    logger.info(`The user ${user.username} (${userId}) updated a bet on the game ${game._id}.`);

    res.status(200).json(bet);
  } catch (error) {
    logger.error(`Couldn't update the bet. Error: ${error}.`);
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

/**
 * Get the most accurate bets for a given season, competition and round
 *
 * Access: Protected (Logged-in)
 *
 * @param team
 * @param season
 * @param competition
 * @param round
 * @param limit
 */
router.get('/top', authMiddleware, async (req, res) => {
  logger.info('Data received in the request query: ' + JSON.stringify(req.query));

  if (
    req.query.team === undefined ||
    typeof req.query.team !== 'string' ||
    req.query.season === undefined ||
    typeof req.query.season !== 'string' ||
    req.query.round === undefined ||
    typeof req.query.round !== 'string' ||
    (req.query.competition !== undefined && typeof req.query.competition !== 'string')
  ) {
    logger.warn("The request doesn't contain required request query.");
    return res.status(400).send({
      message: ResponseMessages.REQUIRED_ATTRIBUTES_MISSING,
      code: ResponseErrorCodes.INVALID_REQUEST_BODY,
    });
  }

  const userId = (req.user as IUserWithID)._id;
  const team = parseInt(req.query.team);
  const season = parseInt(req.query.season);
  const round = parseInt(req.query.round);
  let competition = req.query.competition ? parseInt(req.query.competition) : undefined;

  try {
    logger.info('Fetching the user by user ID.');
    const user = await User.findById(userId);
    if (!user) {
      logger.error(`The user ${userId} doesn't exist in the database.`);
      return res.status(400).json({
        message: ResponseMessages.USER_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });
    }

    // If no competition is specified in the request, pick the first competition
    // TODO: Should the competition object be mandatory?
    if (!competition) {
      logger.info('Fetching the group by group ID.');
      const group = await Group.findById(user.groupId).orFail(
        new Error(`Group with _id ${user.groupId} doesn't exist`)
      );

      logger.info('Getting the latest season object from the group.');
      const latestSeason = getLatestSeason(group.followedTeams[0]);
      competition = latestSeason.competitions[0].apiId;
    }

    const gamesAggregate = await Game.aggregate([
      {
        $match: {
          season: season,
          competitionId: competition,
          $or: [{ 'homeTeam.teamId': team }, { 'awayTeam.teamId': team }],
        },
      },
    ]);

    const games = gamesAggregate.flat() as IGameWithID[];
    const game = round >= 0 ? games[round] : games[games.length + round];
    logger.info('The game object: ' + game);

    if (!game) {
      logger.info('No games found. Returning an empty list back.');
      return res.status(200).json([]);
    }

    const users = await User.aggregate([
      { $match: { groupId: user.groupId, 'bets.game': game._id } },
      { $unwind: '$bets' },
      { $match: { groupId: user.groupId, 'bets.game': game._id, 'bets.points': { $gt: 0 } } },
      {
        $lookup: {
          from: 'games',
          localField: 'bets.game',
          foreignField: '_id',
          as: 'bets.game',
        },
      },
      { $sort: { 'bets.points': -1 } },
    ]);

    // TODO: This should be idealy moved to the aggregation pipeline
    users.forEach((user) => (user.bets = [user.bets]));
    users.forEach((user) => (user.bets[0].game = user.bets[0].game[0]));

    // Returns
    // [{ username, ..., bets: [{}] }, { username, ..., bets: [{}] }, { username, ..., bets: [{}] }]
    res.status(200).json(users);
  } catch (error) {
    logger.error(`Couldn't find bets. Error: ${error}.`);
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

export default router;
