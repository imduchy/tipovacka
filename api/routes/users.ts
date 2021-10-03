import { IUser, User } from '@duchynko/tipovacka-models';
import express, { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { isAdmin, isLoggedIn } from '../utils/authMiddleware';
import logger from '../utils/logger';

const router = express.Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`[${req.method}] ${req.baseUrl}${req.path} from ${req.ip}.`);

  // If req.headers contains the admin key, continue
  if (isAdmin(req)) {
    next();
    return;
  }

  if (isLoggedIn(req)) {
    const user = req.user as IUser & { _id: Types.ObjectId };
    // Allow users to only access their own User document.
    // E.g., Alice can't fetch Bob's User document
    if (user._id!.equals(req.params.userId)) {
      next();
      return;
    }
  }

  logger.warn(
    `[${req.originalUrl}] Unauthorized request was made by user ${
      req.user && (req.user as IUser & { _id: Types.ObjectId })._id
    } from IP: ${req.ip}.`
  );
  res.status(401).send('Unauthorized request');
};

/**
 * Get a user
 *
 * Access: Protected (Logged-in & Requests its own user object)
 *
 * @param user ObjectId of the user to fetch
 */
router.get('/', authMiddleware, async (req, res) => {
  const userId = req.query.user;

  try {
    const user = await User.findById(userId)
      .populate({
        path: 'bets',
        model: 'bet',
        populate: { path: 'game', model: 'game' },
      })
      .lean();

    if (!user) {
      logger.warn(`User with _id ${userId} doesn't exist.`);
      res.status(404).json("The specified user doesn't exist.");
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error(`Couldn't fetch a user with id ${userId}. Error: ${error}.`);
    res.status(500).json('Internal server error');
  }
});

export default router;
