import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { logger } from '../config/logger';
import { StatusCodes } from 'http-status-codes';

interface ErrorResponse {
  status: 'error';
  code: string;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  logger.error(`${req.method} ${req.path} - ${err.message}`, {
    error: err.name,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (err instanceof ValidationError) {
    const response: ErrorResponse = {
      status: 'error',
      code: err.code,
      message: err.message,
      errors: err.errors,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      status: 'error',
      code: err.code,
      message: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Unhandled errors
  const response: ErrorResponse = {
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
