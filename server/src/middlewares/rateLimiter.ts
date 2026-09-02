import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum allowed requests within the window
  message?: string;
}

export const createRateLimiter = (options: RateLimiterOptions) => {
  const { windowMs, max, message = 'Too many requests, please try again later.' } = options;
  const ipStore = new Map<string, RateLimitRecord>();

  // Periodically clean up expired IP entries every 2 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      if (now > record.resetTime) {
        ipStore.delete(ip);
      }
    }
  }, 120_000);

  // Allow Node process to terminate without waiting on cleanup interval
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req: Request, res: Response, next: NextFunction): void => {
    // Get client IP address
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    const record = ipStore.get(clientIp);

    if (!record || now > record.resetTime) {
      ipStore.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      next();
      return;
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      sendError(res, message, 429);
      return;
    }

    record.count += 1;
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - record.count);
    next();
  };
};

// General rate limiter: 200 requests per minute per IP
export const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 200,
  message: 'API rate limit exceeded. Please wait a moment before sending more requests.',
});

// Stricter rate limiter for write/sensitive mutations: 60 requests per minute per IP
export const mutationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many transaction requests submitted. Please slow down.',
});
