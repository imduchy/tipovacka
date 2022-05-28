import { Group, ICompetition, IUser, IUserWithID } from '@tipovacka/models';
import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { containsAdminKey, isLoggedIn } from '../utils/authMiddleware';
import { getLatestSeason } from '../utils/groups';
import logger from '../utils/logger';

const router = Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`[${req.method}] ${req.baseUrl}${req.path} from ${req.ip}.`);

  const group = req.query.group;
  if (!group) {
    logger.warn("The query parameter 'group' wasn't specified.");
    return res.status(400).send('Bad request');
  }

  // If req.headers contains the admin key, continue
  if (containsAdminKey(req)) {
    return next();
  }

  if (isLoggedIn(req)) {
    const user = req.user as IUser;
    // Only allow users to access Group document of a group they're part of
    if (user.groupId.equals(group.toString())) {
      return next();
    }
  }

  logger.warn(
    `[${req.originalUrl}] Unauthorized request was made by user ${
      req.user && (req.user as IUserWithID)._id
    } from IP: ${req.ip}.`
  );
  res.status(401).send('Unauthorized request');
};

/**
 * Get a group without the competition array
 *
 * Access: Protected (Logged-in & Part of the group)
 *
 * @param group ObjectId of the group to fetch
 */
router.get('/', authMiddleware, async (req, res) => {
  const groupId = req.query.group;

  try {
    const group = await Group.findById(groupId)
      .populate('upcomingGame')
      .select('-followedTeams.seasons.competitions');

    if (!group) {
      logger.warn(`Group with _id ${groupId} doesn't exist.`);
      return res.status(404).json("The provided group doesn't exist");
    }

    res.status(200).json(group);
  } catch (error) {
    logger.error(`Couldn't fetch a group ${groupId}. Error: ${error}`);
    res.status(500).json('Internal server error');
  }
});

/**
 * Get a group's users.
 *
 * Access: Protected (Logged-in & Part of the group)
 *
 * @param username username of the newly created user
 * @param email email of the newly created user
 * @param password password of the newly created user
 * @param group ObjectId of the group the user will be part of
 */
router.get('/users', authMiddleware, async (req, res) => {
  const groupId = req.query.group;

  try {
    const group = await Group.findById(groupId).populate('users');
    if (group) {
      res.status(200).json(group.users);
    } else {
      res.status(404).send("The specified group doesn't exist.");
    }
  } catch (error) {
    logger.error(`An error occured while fetching the group ${groupId}. Error: ${error}.`);
    res.status(500).send('Internal server error.');
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
router.get('/competition', authMiddleware, async (req, res) => {
  const q = req.query;

  if (!q.group || !q.team || !q.season) {
    logger.warn('Not all required query parameters were specified. ');
    logger.warn(JSON.stringify({ ...q }));
    return res
      .status(400)
      .json('Query parameters group, team, competition and season are required!');
  }

  try {
    const groupId = q.group.toString();
    const teamApiId = parseInt(q.team.toString());
    const season = parseInt(q.season.toString());
    let competitionApiId = q.competition ? parseInt(q.competition.toString()) : undefined;

    if (!Types.ObjectId.isValid(groupId)) {
      logger.info('Provided group id is of a wrong format. Provided value: ' + q.group);
      return res.status(403).json('Invalid value for the group parameter.');
    }

    // If no competition is specified in the request, pick the first competition
    // TODO: Should the competition object be mandatory?
    if (!competitionApiId) {
      const group = await Group.findById(groupId).orFail(
        new Error(`Group with _id ${groupId} doesn't exist`)
      );

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
      logger.warn('No competition found for the specified parameters. ');
      logger.warn(JSON.stringify({ ...q }));
      return res.status(404).json('Competition not found.');
    }

    res.status(200).json(aggrResult[0]);
  } catch (error) {
    logger.error(`Couldn't fetch group ${req.params.groupId}. Error: ${error}.`);
    res.status(500).json('Internal server error');
  }
});

export default router;
