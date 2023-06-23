import { Validator, ValidationError } from 'express-json-validator-middleware';
import addFormats from 'ajv-formats';
import { NextFunction, Request, Response } from 'express';

const { validate, ajv } = new Validator({});

addFormats(ajv);

/**
 * Error handler middleware for handling errors of the `ValidationError` type which are
 * created by `express-json-validator-middleware`. Will pass on any other type of error
 * to be handled by subsequent error handling middleware.
 *
 * @see https://expressjs.com/en/guide/error-handling.html
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function schemaValidationMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  /**
   * If response headers have already been sent, delegate to
   * the default Express error handler.
   */
  if (res.headersSent) {
    return next(err);
  }

  /**
   * If the `error` object is not a `ValidationError` created
   * by `express-json-validator-middleware`, pass it in to the
   * `next()` Express function and let any other error handler
   * middleware take care of it.
   *
   * @see https://expressjs.com/en/guide/error-handling.html#the-default-error-handler
   */
  const isValidationError = err instanceof ValidationError;
  if (!isValidationError) {
    return next(err);
  }

  /**
   * Otherwise send a 400 HTTP status code in the response with the
   * `validationErrors` array in the response body.
   *
   * @see https://httpstatuses.com/400
   */
  res.status(400).json({
    errors: err.validationErrors,
  });

  next();
}

export { validate, schemaValidationMiddleware };
