import { Game, IBet, IBetWithID, IUserWithID, User } from '@tipovacka/models';
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { ApiError } from '../errors/customErrors';
import { ResponseErrorCodes, ResponseMessages, ResponseStatusCodes } from '../utils/httpResponses';
import logger from '../utils/logger';
import { PostBetParams, PutBetParams } from './schemas';
import { hasPlacedBet } from './utils';

export const postBet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { game: gameId, homeTeamScore, awayTeamScore, scorer }: PostBetParams = req.body;
  const userId = new Types.ObjectId((req.user as IUserWithID)._id);

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        message: ResponseMessages.USER_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a user ID '${userId}' in the request body. A user object with the provided ID doesn't exist in the database.`,
          `${req.method} /bets`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    if (hasPlacedBet(user, gameId)) {
      res.status(400).json({
        message: ResponseMessages.USER_ALREADY_PLACED_BET,
        code: ResponseErrorCodes.RESOURCE_ALREADY_EXISTS,
      });

      return next(
        new ApiError(
          `A user has already placed a bet for the game ${gameId}.`,
          `${req.method} /bets`,
          ResponseStatusCodes.ALREADY_EXISTS
        )
      );
    }

    const game = await Game.findById(gameId);
    if (!game) {
      res.status(404).json({
        message: ResponseMessages.GAME_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a game ID '${gameId}' in the request body. A game object with the provided ID doesn't exist in the database.`,
          `${req.method} /bets`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    // Don't submit the bet if the game already started.
    if (new Date().getTime() > game.date.getTime()) {
      res.status(400).json({
        message: ResponseMessages.GAME_ALREADY_STARTED,
        code: ResponseErrorCodes.BAD_REQUEST,
      });

      return next(
        new ApiError(
          `The specified game has already started.`,
          `${req.method} /bets`,
          ResponseStatusCodes.BAD_REQUEST
        )
      );
    }

    const bet: IBet = {
      game: new Types.ObjectId(gameId),
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
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });

    return next(error);
  }
};

export const putBet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { bet: betId, homeTeamScore, awayTeamScore, scorer }: PutBetParams = req.body;
  const userId = new Types.ObjectId((req.user as IUserWithID)._id);

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        message: ResponseMessages.USER_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a user ID '${userId}' in the request body. A user object with the provided ID doesn't exist in the database.`,
          `${req.method} /bets`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    const bet = user.bets.find((b) => (b as IBetWithID)._id.equals(betId));
    if (!bet) {
      res.status(404).json({
        message: ResponseMessages.BET_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a bet ID '${betId}' in the request body. A bet object with the provided ID doesn't exist in the database.`,
          `${req.method} /bets`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    const game = await Game.findById(bet.game);
    if (!game) {
      res.status(404).json({
        message: ResponseMessages.GAME_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a game ID '${bet.game}' in the request body. A game object with the provided ID doesn't exist in the database.`,
          `${req.method} /bets`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    // Don't update the bet if the game has already started.
    if (new Date().getTime() > game.date.getTime()) {
      res.status(400).json({
        message: ResponseMessages.GAME_ALREADY_STARTED,
        code: ResponseErrorCodes.UNAUTHORIZED_REQUEST,
      });

      return next(
        new ApiError(
          `The specified game has already started.`,
          `${req.method} /bets`,
          ResponseStatusCodes.BAD_REQUEST
        )
      );
    }

    bet.awayTeamScore = awayTeamScore;
    bet.homeTeamScore = homeTeamScore;
    bet.scorer = scorer;
    user.markModified('bets');
    await user.save();
    logger.info(`The user ${user.username} (${userId}) updated a bet on the game ${game._id}.`);

    res.status(200).json(bet);
  } catch (error) {
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });

    return next(error);
  }
};
