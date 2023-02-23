import { BaseError } from './customErrors';
import logger from '../utils/logger';

export class ErrorHandler {
  public async handleError(error: Error): Promise<void> {
    logger.error(error);
  }

  public isTrustedError(error: Error) {
    return error instanceof BaseError && error.isOperational;
  }
}
