import { IUser, IUserWithID } from '@tipovacka/models';
import { Request } from 'express';
import getLogger from './logger';

const logger = getLogger();

export const isLoggedIn = (req: Request): boolean => {
  return req.user !== undefined;
};

export const containsAdminKey = (req: Request): boolean => {
  return req.header('tipovacka-auth-token') === process.env.API_ADMIN_TOKEN;
};

export const hasAdminRole = (user: IUser | undefined): boolean => {
  return user ? user.scope.includes('admin') : false;
};

export const infoAuditLog = (req: Request): void => {
  logger.info(`[${req.method}] ${req.baseUrl}${req.path} from ${req.ip}.`);
};

export const warnAuditLog = (req: Request, user: IUserWithID | undefined): void => {
  logger.warn(
    `[${req.originalUrl}] Unauthorized request was made by user ` +
      `${user && user._id} from IP: ${req.ip}. The provided API_ADMIN_TOKEN ` +
      `was ${req.header('tipovacka-auth-token')}`
  );
};
