import { Request, Response, NextFunction } from 'express';

interface IdempotentResponse {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
  createdAt: number;
}

const idempotencyStore = new Map<string, IdempotentResponse | 'IN_FLIGHT'>();
const TTL_MS = 60_000;

// Periodic cleanup of expired entries
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, val] of idempotencyStore.entries()) {
      if (val !== 'IN_FLIGHT' && now - val.createdAt > TTL_MS) {
        idempotencyStore.delete(key);
      }
    }
  }, 30_000);
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

export function idempotency(req: Request, res: Response, next: NextFunction): void {
  const idempotencyKey = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string | undefined;

  if (!idempotencyKey || req.method === 'GET' || req.method === 'HEAD') {
    return next();
  }

  const existing = idempotencyStore.get(idempotencyKey);

  if (existing === 'IN_FLIGHT') {
    res.status(409).json({
      success: false,
      error: 'Conflict: A request with this idempotency key is currently being processed.',
    });
    return;
  }

  if (existing) {
    res.setHeader('X-Cache-Lookup', 'HIT (Idempotent replay)');
    res.setHeader('X-Idempotency-Key', idempotencyKey);
    res.status(existing.statusCode).json(existing.body);
    return;
  }

  // Mark as in-flight
  idempotencyStore.set(idempotencyKey, 'IN_FLIGHT');

  const originalJson = res.json.bind(res);

  res.json = function (body: unknown): Response {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyStore.set(idempotencyKey, {
        statusCode: res.statusCode,
        body,
        headers: {},
        createdAt: Date.now(),
      });
    } else {
      idempotencyStore.delete(idempotencyKey);
    }

    res.setHeader('X-Idempotency-Key', idempotencyKey);
    return originalJson(body);
  };

  next();
}
