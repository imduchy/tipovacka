import { IUser } from '@duchynko/tipovacka-models';
import { Request } from 'express';

export const isLoggedIn = (req: Request): boolean => {
  return req.user !== undefined;
};

export const containsAdminKey = (req: Request): boolean => {
  return req.header('tipovacka-auth-token') === process.env.ADMIN_API_TOKEN;
};

export const hasAdminRole = (user: IUser | undefined): boolean => {
  return user ? user.scope.includes('admin') : false;
};
