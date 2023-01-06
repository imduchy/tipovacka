import { BaseError } from './customErrors';
import getLogger from '../utils/logger';

const logger = getLogger();

export class ErrorHandler {
  public async handleError(error: Error): Promise<void> {
    logger.error(error);
  }

  public isTrustedError(error: Error) {
    return error instanceof BaseError && error.isOperational;
  }
}
