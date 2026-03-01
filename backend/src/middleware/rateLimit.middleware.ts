import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Too many requests, please try again later',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Too many authentication attempts, please try again later',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});

export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    code: 'RATE_LIMIT',
    message: 'Too many uploads, please try again later',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});
