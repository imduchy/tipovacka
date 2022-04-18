import { Game, IBet, IBetWithID, IUserWithID, User } from '@tipovacka/models';
import { NextFunction, Request, Response, Router } from 'express';
import { Types } from 'mongoose';
import { containsAdminKey, isLoggedIn } from '../utils/authMiddleware';
import { alreadyBet } from '../utils/bets';
import logger from '../utils/logger';

const router = Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`[${req.method}] ${req.baseUrl}${req.path} from ${req.ip}.`);

  // If req.headers contains the admin key, continue
  if (containsAdminKey(req)) {
    return next();
  }

  if (isLoggedIn(req)) {
    return next();
  }

  logger.warn(
    `[${req.method} ${req.originalUrl}] Unauthorized request was made by user ${
      req.user && (req.user as IUserWithID)._id
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
router.post('/', authMiddleware, async (req, res) => {
  logger.info('Data received in the request body: ' + JSON.stringify(req.body));

  const { game: gameId, homeTeamScore, awayTeamScore, scorer } = req.body;
  const rawUser = req.user as IUserWithID;
  const userId = new Types.ObjectId(rawUser._id);

  if (
    gameId === undefined ||
    homeTeamScore === undefined ||
    awayTeamScore === undefined ||
    scorer === undefined
  ) {
    logger.warn("The request doesn't contain required request body. The bet won't be submitted.");
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
      homeTeamScore: homeTeamScore,
      awayTeamScore: awayTeamScore,
      scorer: scorer,
    };

    user.bets.push(bet);
    await user.save();
    logger.info(`A user ${user._id} submitted a bet on a game ${gameId}.`);

    res.status(200).json(user.bets);
  } catch (error) {
    logger.error(`Couldn't create a bet. Error: ${error}.`);
    res.status(500).json('Internal error occured');
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

  if (
    betId === undefined ||
    homeTeamScore === undefined ||
    awayTeamScore === undefined ||
    scorer === undefined
  ) {
    logger.warn("The request doesn't contain required request body. The bet won't be updated.");
    return res.status(400).send('Bad request');
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      logger.error(`The user ${userId} doesn't exist in the database.`);
      return res.status(400).json('Bad request');
    }

    const bet = user.bets.find((b) => (b as IBetWithID)._id.equals(betId));
    if (!bet) {
      logger.error(`The bet ${betId} doesn't exist in the user object.`);
      return res.status(400).json('Bad request');
    }

    const game = await Game.findById(bet.game);
    if (!game) {
      logger.error(`The game ${bet.game} doesn't exist in the database.`);
      return res.status(400).json('Bad request');
    }

    // Don't update the bet if the game has already started.
    if (new Date().getTime() > game.date.getTime()) {
      logger.error("The specified game has already started. The bet won't be updated.");
      return res.status(400).json('Bad request');
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
    res.status(500).json('Internal error occured');
  }
});

export default router;
