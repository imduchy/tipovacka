import { NextFunction, Request, Response, Router } from 'express';
import { IBet, Game, User, IUser, Bet } from '@duchynko/tipovacka-models';
import { Types } from 'mongoose';
import { isAdmin, isLoggedIn } from '../utils/authMiddleware';
import { alreadyBet } from '../utils/bets';
import logger from '../utils/logger';

const router = Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`[${req.method}] ${req.baseUrl}${req.path} from ${req.ip}.`);

  // If req.headers contains the admin key, continue
  if (isAdmin(req)) {
    return next();
  }

  if (isLoggedIn(req)) {
    const user = req.user as IUser & { _id: Types.ObjectId };
    // Only allow user to create bet if user ids match
    if (user._id.equals(req.body.user)) {
      return next();
    }
  }

  logger.warn(
    `[${req.method} ${req.originalUrl}] Unauthorized request was made by user ${
      req.user && (req.user as IUser & { _id: Types.ObjectId })._id
    } from IP: ${req.ip}.`
  );
  res.status(401).send('Unauthorized request');
};

/**
 * Create a bet
 *
 * Access: Protected (Logged-in & User ids match)
 *
 * @param game ObjectId of the game to fetch
 */
router.post('/', authMiddleware, async ({ body }, res) => {
  logger.info('Data received in the request body: ' + JSON.stringify(body));

  const { user: userId, game: gameId, homeTeamScore, awayTeamScore, scorer } = body;

  console.log('REQ', gameId, userId, homeTeamScore, awayTeamScore, scorer);
  if (
    gameId === undefined ||
    userId === undefined ||
    homeTeamScore === undefined ||
    awayTeamScore === undefined ||
    scorer === undefined
  ) {
    logger.warn(
      "The request doesn't contain required request body. The bet won't be submitted."
    );
    return res.status(400).send('Bad request');
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      logger.warn("The specified user doesn't exist. The bet won't be submitted.");
      return res.status(404).json("The specified resource doesn't exist");
    }

    if (alreadyBet(user, gameId)) {
      logger.warn(
        "The specified user has already placed a bet on this game. The bet won't be submitted."
      );
      return res.status(400).json('Bad request');
    }

    const game = await Game.findById(gameId);
    if (!game) {
      logger.warn("The specified game doesn't exist. The bet won't be submitted.");
      return res.status(404).json("The specified resource doesn't exist");
    }

    // Don't submit the bet if the game already started.
    if (new Date().getTime() > game.date.getTime()) {
      logger.warn("The specified game has already started. The bet won't be submitted.");
      return res.status(400).json('Bad request');
    }

    const bet: IBet = {
      game: gameId,
      user: userId,
      homeTeamScore: body.homeTeamScore,
      awayTeamScore: body.awayTeamScore,
      scorer: body.scorer,
    };

    user.bets.addToSet(bet);
    await user.save();
    logger.info(`A user ${user._id} submitted a bet on a game ${gameId}.`);

    res.status(200).json(user.bets);
  } catch (error) {
    logger.error(`Couldn't create a bet. Error: ${error}.`);
    res.status(500).json('Internal error occured');
  }
});

export default router;
