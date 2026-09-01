import { Request, Response, NextFunction } from 'express';

/**
 * asyncHandler — wraps async Express controllers to eliminate repetitive try/catch boilerplate.
 * Any thrown error is forwarded to the next() error handler automatically.
 *
 * Usage:
 *   router.get('/items', asyncHandler(getMenuItems));
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

