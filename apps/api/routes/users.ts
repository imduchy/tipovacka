import { IUserWithID, User } from '@tipovacka/models';
import express, { NextFunction, Request, Response } from 'express';
import { containsAdminKey, infoAuditLog, isLoggedIn, warnAuditLog } from '../utils/authMiddleware';
import { ResponseErrorCodes, ResponseMessages } from '../utils/constants';
import logger from '../utils/logger';

const router = express.Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  infoAuditLog(req);

  const user = req.user as IUserWithID | undefined;

  // If req.headers contains the admin key,continue
  if (containsAdminKey(req)) {
    return next();
  }

  if (isLoggedIn(req)) {
    const user = req.user as IUserWithID;
    // Allow users to only access their own User document.
    if (user._id.equals(req.params.userId)) {
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
      res.status(404).json({
        message: ResponseMessages.USER_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    logger.error(`Couldn't fetch a user with id ${userId}. Error: ${error}.`);
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });
  }
});

export default router;
