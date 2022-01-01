import { Game, IUser } from '@tipovacka/models';
import express, { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { containsAdminKey, isLoggedIn } from '../utils/authMiddleware';
import logger from '../utils/logger';

const router = express.Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`[${req.method}] ${req.baseUrl}${req.path} from ${req.ip}.`);

  // If req.headers contains the admin key, continue
  if (containsAdminKey(req) || isLoggedIn(req)) {
    next();
    return;
  }

  logger.warn(
    `[${req.originalUrl}] Unauthorized request was made by user ${
      req.user && (req.user as IUser & { _id: Types.ObjectId })._id
    } from IP: ${req.ip}.`
  );
  res.status(401).send('Unauthorized request');
};

/**
 * Get a game
 *
 * Access: Protected (Logged-in)
 *
 * @param game ObjectId of the game to fetch
 */
router.get('/', authMiddleware, async (req, res) => {
  const gameId = req.query.game;

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      logger.warn(`Game with _id ${gameId} doesn't exist.`);
      res.status(404).json("The specified game doesn't exist.");
      return;
    }

    res.status(200).json(game);
  } catch (error) {
    logger.error(`Couldn't fetch a game with id ${gameId}. Error: ${error}`);
    res.status(500).json('Internal server error');
  }
});

export default router;
