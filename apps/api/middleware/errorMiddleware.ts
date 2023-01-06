import { NextFunction, Request, Response } from 'express';
import { BaseError } from '../errors/customErrors';
import { ErrorHandler } from '../errors/errorHandler';

export const errorHandler = new ErrorHandler();

export async function errorMiddleware(
  err: BaseError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!errorHandler.isTrustedError(err)) {
    return next(err);
  }

  await errorHandler.handleError(err);
}
