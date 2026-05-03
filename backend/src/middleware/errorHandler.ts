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

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: Object.values(error.errors).map((err: any) => err.message).join(', ') || 'Validation Error',
      ...(isDevelopment && { stack: error.stack }),
    });
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      success: false,
      statusCode: 409,
      message: `An account with that ${field} already exists.`,
      ...(isDevelopment && { stack: error.stack }),
    });
  }

  const internalError = new InternalServerError('An unexpected error occurred');
  res.status(internalError.statusCode).json({
    success: false,
    statusCode: internalError.statusCode,
    message: error.message || internalError.message,
    ...(isDevelopment && { stack: error.stack }),
  });
};
