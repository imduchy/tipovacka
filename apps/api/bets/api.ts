import { IUserWithID } from '@tipovacka/models';
import { NextFunction, Request, Response, Router } from 'express';
import { validate } from '../middleware/schemaValidationMiddleware';
import { containsAdminKey, infoAuditLog, isLoggedIn, warnAuditLog } from '../utils/authMiddleware';
import { ResponseErrorCodes, ResponseMessages } from '../utils/httpResponses';
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
router.post('/', authMiddleware, Controller.postBet);

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
router.put('/', authMiddleware, Controller.putBet);

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
router.get('/top', validate({ query: getTopBetsSchema }), authMiddleware, Controller.getTopBets);

export default router;
