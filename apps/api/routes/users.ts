import { IUserWithID, User } from '@tipovacka/models';
import express, { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors/customErrors';
import { containsAdminKey, infoAuditLog, isLoggedIn, warnAuditLog } from '../utils/authMiddleware';
import { ResponseErrorCodes, ResponseMessages, ResponseStatusCodes } from '../utils/constants';
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
router.get('/', authMiddleware, async (req, res, next) => {
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
      res.status(404).json({
        message: ResponseMessages.USER_ID_DOESNT_EXIST,
        code: ResponseErrorCodes.RESOURCE_NOT_FOUND,
      });

      return next(
        new ApiError(
          `A user has specified a user ID '${userId}' in the query parameter. A user object with the provided ID doesn't exist in the database.`,
          `${req.method} /users`,
          ResponseStatusCodes.NOT_FOUND
        )
      );
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: ResponseMessages.INTERNAL_SERVER_ERROR,
      code: ResponseErrorCodes.INTERNAL_SERVER_ERROR,
    });

    return next(error);
  }
});

export default router;
