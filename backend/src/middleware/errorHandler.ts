import { Request, Response, NextFunction } from 'express';
import { HttpException, InternalServerError } from '../utils/httpException';
import { logger } from '../utils/logger';
import { isDevelopment } from '../config/environment';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Request error', error);

  if (error instanceof HttpException) {
    return res.status(error.statusCode).json({
      success: false,
      statusCode: error.statusCode,
      message: error.message,
      errors: error.errors,
      ...(isDevelopment && { stack: error.stack }),
    });
  }

  const internalError = new InternalServerError('An unexpected error occurred');
  res.status(internalError.statusCode).json({
    success: false,
    statusCode: internalError.statusCode,
    message: internalError.message,
    ...(isDevelopment && { stack: error.stack }),
  });
};
