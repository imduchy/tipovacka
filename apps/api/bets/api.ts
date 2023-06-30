import { Game, Group, IGameWithID, IUserWithID, User } from '@tipovacka/models';
import { NextFunction, Request, Response, Router } from 'express';
import { ApiError } from '../errors/customErrors';
import { getLatestSeason } from '../groups/utils';
import { validate } from '../middleware/schemaValidationMiddleware';
import { containsAdminKey, infoAuditLog, isLoggedIn, warnAuditLog } from '../utils/authMiddleware';
import { ResponseErrorCodes, ResponseMessages, ResponseStatusCodes } from '../utils/httpResponses';
import logger from '../utils/logger';
import * as Controller from './controllers';
import { getTopBetsSchema, postBetSchema, putBetSchema } from './schemas';

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
router.post('/', validate({ body: postBetSchema }), authMiddleware, Controller.postBet);

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
router.put('/', validate({ body: putBetSchema }), authMiddleware, Controller.putBet);

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
router.get(
  '/top',
  validate({ query: getTopBetsSchema }),
  authMiddleware,
  async (req, res, next) => {
    logger.info('Data received in the request query: ' + JSON.stringify(req.query));

    const userId = (req.user as IUserWithID)._id;
    const team = parseInt(req.query.team as string);
    const season = parseInt(req.query.season as string);
    const round = parseInt(req.query.round as string);
    let competition = req.query.competition ? parseInt(req.query.competition as string) : undefined;

    try {
      logger.info('Fetching the user by user ID.');
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          message: ResponseMessages.USER_ID_DOESNT_EXIST,
          code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
        });

        return next(
          new ApiError(
            `A user has specified a user ID '${userId}' in the query parameter. A user object with the provided ID doesn't exist in the database.`,
            `${req.method} /bets/top`,
            ResponseStatusCodes.NOT_FOUND
          )
        );
      }

      // If no competition is specified in the request, pick the first competition
      // TODO: Should the competition object be mandatory?
      if (!competition) {
        logger.info('Fetching the group by group ID.');
        const group = await Group.findById(user.groupId);

        if (!group) {
          res.status(404).json({
            message: ResponseMessages.GROUP_ID_DOESNT_EXIST,
            code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
          });

          return next(
            new ApiError(
              `A user has specified a group ID '${user.groupId}' in the query parameter. A group object with the provided ID doesn't exist in the database.`,
              `${req.method} /bets/top`,
              ResponseStatusCodes.NOT_FOUND
            )
          );
        }

        logger.info('Getting the latest season object from the group.');
        const latestSeason = getLatestSeason(group.followedTeams[0]);
        if (!latestSeason) {
          return next(
            new ApiError(
              `The group object of the user doesn't contain any seasons objects.`,
              `${req.method} /groups/competition`,
              ResponseStatusCodes.NOT_FOUND
            )
          );
        }

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

      console.log(users);

      // Returns
      // [{ username, ..., bets: [{}] }, { username, ..., bets: [{}] }, { username, ..., bets: [{}] }]
      res.status(200).json(users);
    } catch (error) {
      logger.error(`Couldn't find bets. Error: ${error}.`);
      res.status(500).json({
        message: ResponseMessages.INTERNAL_SERVER_ERROR,
        code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
      });

      return next(error);
    }
  }
);

export default router;
