import { Game } from '@tipovacka/models';
import express, { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/customErrors';
import { validate } from '../middleware/schemaValidationMiddleware';
import { containsAdminKey, isLoggedIn } from '../utils/authMiddleware';
import { ResponseErrorCodes, ResponseMessages, ResponseStatusCodes } from '../utils/constants';
import { getGameSchema } from './schema';

const router = express.Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // If req.headers contains the admin key, continue
  if (containsAdminKey(req) || !isLoggedIn(req)) {
    return next();
  }

  return res.status(401).json({
    message: ResponseMessages.UNAUTHORIZED_REQUEST,
    code: ResponseErrorCodes.UNAUTHORIZED_REQUEST,
  });
};

/**
 * Get a game object from the database, based on the provided ObjectId
 *
 * Access: Protected (Logged-in)
 *
 * @param game An ObjectId of the game
 */
router.get('/', validate({ query: getGameSchema }), authMiddleware, async (req, res, next) => {
  const gameId = req.query.game;

  try {
    const game = await Game.findById(gameId);

    if (!game) {
      res.status(404).json({
        message: ResponseMessages.GAME_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a game ID '${gameId}' in the query parameter. A game object with the provided ID doesn't exist in the database.`,
          `${req.method} /games`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    return res.status(ResponseStatusCodes.OK).json(game);
  } catch (error) {
    res.status(ResponseStatusCodes.INTERNAL_SERVER_ERROR).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });

    return next(error);
  }
});

export default router;
