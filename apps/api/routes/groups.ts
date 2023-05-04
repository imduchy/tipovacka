import { Game, Group, ICompetition, IGameWithID, IUserWithID, User } from '@tipovacka/models';
import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { ApiError } from '../errors/customErrors';
import { containsAdminKey, infoAuditLog, isLoggedIn, warnAuditLog } from '../utils/authMiddleware';
import { ResponseErrorCodes, ResponseMessages, ResponseStatusCodes } from '../utils/constants';
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

  if (isLoggedIn(req) && user) {
    const group = req.query.group;
    if (!group) {
      logger.warn("The query parameter 'group' wasn't specified.");
      return res.status(400).send({
        message: ResponseMessages.REQUIRED_ATTRIBUTES_MISSING,
        code: ResponseErrorCodes.INVALID_REQUEST_BODY,
      });
    }

    // Only allow users to access Group document of a group they're part of
    if (user.groupId.equals(group.toString())) {
      return next();
    }
  }

  warnAuditLog(req, user);
  return res.status(401).json({
    message: ResponseMessages.UNAUTHORIZED_REQUEST,
    code: ResponseErrorCodes.UNAUTHORIZED_REQUEST,
  });
};

/**
 * Get a group without the competition array
 *
 * Access: Protected (Logged-in & Part of the group)
 *
 * @param group ObjectId of the group to fetch
 */
router.get('/', authMiddleware, async (req, res, next) => {
  const groupId = req.query.group;

  try {
    const group = await Group.findById(groupId)
      .populate('upcomingGame')
      .select('-followedTeams.seasons.competitions');

    if (!group) {
      res.status(404).json({
        message: ResponseMessages.GROUP_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a group ID '${groupId}' in the query parameter. A group object with the provided ID doesn't exist in the database.`,
          `${req.method} /groups`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });

    return next(error);
  }
});

/**
 * Get a group's users.
 *
 * Access: Protected (Logged-in & Part of the group)
 *
 * @param group ObjectId of the group
 * @param season Filter for a season in which a users is enrolled
 */
router.get('/users', authMiddleware, async (req, res, next) => {
  const groupId = req.query.group as string;
  const season = parseInt(req.query.season as string);

  try {
    const query = User.find({ groupId: groupId }).populate({ path: 'bets.game' });

    if (season) {
      query.where('competitionScore.season').equals(season);
    }

    const users = await query;

    // The filtering should be performed in an aggregation pipeline instead
    if (season) {
      for (const user of users) {
        user.bets = user.bets.filter((bet) => (bet.game as IGameWithID).season === season);
      }
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).send({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });

    return next(error);
  }
});

/**
 * Get a specified competition
 *
 * Access: Protected (Logged-in & Part of the group)
 *
 * @param group ObjectId of the group to be fetched
 * @param team team API Id to filter on
 * @param season season to filter on
 * @param competition competition API Id to filter on
 */
router.get('/competition', authMiddleware, async (req, res, next) => {
  const q = req.query;

  if (!q.group || !q.team || !q.season) {
    res.status(400).json({
      message: ResponseMessages.REQUIRED_ATTRIBUTES_MISSING,
      code: ResponseErrorCodes.INVALID_REQUEST_BODY,
    });

    return next(
      new ApiError(
        `A user has not specified all the required query parameters. Provided query parameters ${{
          ...q,
        }}`,
        `${req.method} /groups/competition`,
        ResponseStatusCodes.BAD_REQUEST
      )
    );
  }

  try {
    const groupId = q.group.toString();
    const teamApiId = parseInt(q.team.toString());
    const season = parseInt(q.season.toString());
    let competitionApiId = q.competition ? parseInt(q.competition.toString()) : undefined;

    // If no competition is specified in the request, pick the first competition
    // TODO: Should the competition object be mandatory?
    if (!competitionApiId) {
      const group = await Group.findById(groupId);

      if (!group) {
        res.status(404).json({
          message: ResponseMessages.GROUP_ID_DOESNT_EXIST,
          code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
        });

        return next(
          new ApiError(
            `A user has specified a group ID '${groupId}' in the query parameter. A group object with the provided ID doesn't exist in the database.`,
            `${req.method} /groups/competition`,
            ResponseStatusCodes.NOT_FOUND
          )
        );
      }

      const latestSeason = getLatestSeason(group.followedTeams[0]);
      competitionApiId = latestSeason.competitions[0].apiId;
    }

    // Result of the aggregation pipeline returns a competition object matching
    // the provided query details
    const aggrResult = await Group.aggregate<ICompetition>()
      .match({ _id: new Types.ObjectId(groupId) })
      .unwind('followedTeams')
      .unwind('followedTeams.seasons')
      .unwind('followedTeams.seasons.competitions')
      .match({ 'followedTeams.apiId': teamApiId })
      .match({ 'followedTeams.seasons.season': season })
      .match({ 'followedTeams.seasons.competitions.apiId': competitionApiId })
      .replaceRoot('$followedTeams.seasons.competitions');

    if (!aggrResult[0]) {
      res.status(404).json({
        message: ResponseMessages.INTERNAL_SERVER_ERROR,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `No competition object for the provided parameters exists in the database. Provided query parameters ${{
            ...q,
          }}.`,
          `${req.method} /games/competition`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    res.status(200).json(aggrResult[0]);
  } catch (error) {
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });

    return next(error);
  }
});

/**
 * Get the specified number of last games
 *
 * Access: Protected (Logged-in & Part of the group)
 *
 * @param group ObjectId of the group to be fetched
 * @param team team API Id to filter on
 * @param season season to filter on
 * @param competition competition API Id to filter on (defaults to undefined)
 * @param amount number of last games to fetch (defaults to 1)
 */
router.get('/games', authMiddleware, async (req, res, next) => {
  const q = req.query;

  if (!q.group || !q.team || !q.season) {
    res.status(400).json({
      message: ResponseMessages.REQUIRED_ATTRIBUTES_MISSING,
      code: ResponseErrorCodes.INVALID_REQUEST_BODY,
    });

    return next(
      new ApiError(
        `A user has not specified all the required query parameters. Provided query parameters ${{
          ...q,
        }}`,
        `${req.method} /groups/games`,
        ResponseStatusCodes.BAD_REQUEST
      )
    );
  }

  try {
    const groupId = q.group.toString();
    const teamApiId = parseInt(q.team.toString());
    const season = parseInt(q.season.toString());
    const amount = q.amount ? parseInt(q.amount.toString()) : 1;
    let competitionsFilter = q.competition ? [parseInt(q.competition.toString())] : [];

    // If no competition is specified in the request, choose games from all competitions
    if (competitionsFilter.length === 0) {
      const group = await Group.findById(groupId);

      if (!group) {
        res.status(404).json({
          message: ResponseMessages.GROUP_ID_DOESNT_EXIST,
          code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
        });

        return next(
          new ApiError(
            `A user has specified a group ID '${groupId}' in the query parameter. A group object with the provided ID doesn't exist in the database.`,
            `${req.method} /groups/games`,
            ResponseStatusCodes.NOT_FOUND
          )
        );
      }

      const latestSeason = getLatestSeason(group.followedTeams[0]);
      competitionsFilter = latestSeason.competitions.map((c) => c.apiId);
    }

    const games = await Game.find({
      competitionId: { $in: competitionsFilter },
      season: season,
      $or: [{ 'homeTeam.teamId': { $eq: teamApiId } }, { 'awayTeam.teamId': { $eq: teamApiId } }],
    });

    if (!games) {
      res.status(404).json({
        message: ResponseMessages.INTERNAL_SERVER_ERROR,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `No games object for the provided parameters exists in the database. Provided query parameters ${{
            ...q,
          }}.`,
          `${req.method} /groups/games`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    const sortedGames = games.sort((a, b) => a.date.getTime() - b.date.getTime());
    const subArray = sortedGames.slice(0, amount);

    res.status(200).json(subArray);
  } catch (error) {
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });

    return next(error);
  }
});

export default router;
