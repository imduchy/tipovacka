import { Game, IUserWithID } from '@tipovacka/models';
import express, { NextFunction, Request, Response } from 'express';
import { containsAdminKey, infoAuditLog, isLoggedIn, warnAuditLog } from '../utils/authMiddleware';
import { ResponseErrorCodes, ResponseMessages } from '../utils/constants';
import logger from '../utils/logger';

const router = express.Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  infoAuditLog(req);

  const user = req.user as IUserWithID | undefined;

  // If req.headers contains the admin key, continue
  if (containsAdminKey(req) || isLoggedIn(req)) {
    next();
  }

  warnAuditLog(req, user);
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
      res.status(404).json({
        message: ResponseMessages.GAME_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });
      return;
    }

    res.status(200).json(game);
  } catch (error) {
    logger.error(`Couldn't fetch a game with id ${gameId}. Error: ${error}`);
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

export default router;
