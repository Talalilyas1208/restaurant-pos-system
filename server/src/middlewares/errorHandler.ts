import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Handle CORS policy rejection
  if (err.message && err.message.includes('CORS Security Policy')) {
    res.status(403).json({
      success: false,
      message: 'Access forbidden by CORS security policy',
    });
    return;
  }

  const isAppError = err instanceof AppError;
  const statusCode = (err as AppError).statusCode || 500;
  
  // Mask generic internal errors in production to avoid leaking internal topology
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production' && !isAppError
      ? 'An unexpected internal error occurred. Please contact system support.'
      : err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl} - Status: ${statusCode} - ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
