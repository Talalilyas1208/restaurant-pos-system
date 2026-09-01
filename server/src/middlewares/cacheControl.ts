import { Request, Response, NextFunction } from 'express';

/**
 * cacheControl middleware factory.
 *
 * Sets the Cache-Control and Surrogate-Control response headers for GET requests.
 * Non-GET requests (POST, PATCH, DELETE) are always set to no-store.
 *
 * @param maxAgeSeconds — how long (in seconds) browsers may cache the response
 * @param staleWhileRevalidate — how many extra seconds stale content may be served while revalidating
 *
 * Usage:
 *   router.get('/items', cacheControl(60), getMenuItems);      // cache 60 s
 *   router.get('/orders', cacheControl(10), getOrders);        // cache 10 s
 */
export const cacheControl =
  (maxAgeSeconds: number, staleWhileRevalidate = 0) =>
  (_req: Request, res: Response, next: NextFunction): void => {
    const swr = staleWhileRevalidate > 0 ? `, stale-while-revalidate=${staleWhileRevalidate}` : '';
    res.set('Cache-Control', `public, max-age=${maxAgeSeconds}${swr}`);
    res.set('Surrogate-Control', `max-age=${maxAgeSeconds}`);
    next();
  };

/**
 * noCache — always prevents caching (for mutations / volatile state).
 */
export const noCache = (_req: Request, res: Response, next: NextFunction): void => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
};

/**
 * requestId — attaches a unique X-Request-ID header to every request/response.
 * Useful for distributed tracing and client-side error correlation.
 */
export const requestId = (_req: Request, res: Response, next: NextFunction): void => {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  res.set('X-Request-ID', id);
  next();
};

