import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * HTTP Caching Middleware
 * Sets Cache-Control headers, generates ETag, and supports 304 Not Modified.
 */
export function httpCache(maxAge = 30, staleWhileRevalidate = 120) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    const originalJson = res.json.bind(res);

    res.json = function (body: unknown): Response {
      const payload = JSON.stringify(body);
      const hash = crypto.createHash('md5').update(payload).digest('hex');
      const etag = `"${hash}"`;

      res.setHeader('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`);
      res.setHeader('ETag', etag);

      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && (ifNoneMatch === etag || ifNoneMatch === hash)) {
        return res.status(304).end();
      }

      return originalJson(body);
    };

    next();
  };
}
