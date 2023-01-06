import { ResponseStatusCodes } from '../utils/constants';

export class BaseError extends Error {
  public readonly message: string;
  public readonly methodName: string | undefined;
  public readonly httpCode: ResponseStatusCodes;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    methodName?: string,
    httpCode: ResponseStatusCodes = ResponseStatusCodes.INTERNAL_SERVER_ERROR,
    isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.message = message;
    methodName ? (this.methodName = methodName) : (this.methodName = undefined);
    this.httpCode = httpCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}

export class ApiError extends BaseError {
  constructor(
    message: string,
    methodName = '',
    httpCode = ResponseStatusCodes.INTERNAL_SERVER_ERROR,
    isOperational = true
  ) {
    super(message, methodName, httpCode, isOperational);
  }
}
