import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import { TtlCache } from '../services/cache.js';

describe('Fast Cache and Concurrency System', { timeout: 15000 }, () => {
  describe('TtlCache Unit Capabilities', () => {
    it('supports tag-based invalidation and hit/miss statistics', () => {
      const cache = new TtlCache(false);
      cache.set('item:1', { name: 'Burger' }, 5000, ['menu', 'food']);
      cache.set('item:2', { name: 'Fries' }, 5000, ['menu', 'sides']);
      cache.set('hotel:1', { name: 'Grand Resort' }, 5000, ['hotel']);

      expect(cache.get('item:1')).toEqual({ name: 'Burger' });
      expect(cache.get('item:nonexistent')).toBeNull();

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.size).toBe(3);

      cache.invalidateTag('menu');
      expect(cache.get('item:1')).toBeNull();
      expect(cache.get('item:2')).toBeNull();
      expect(cache.get('hotel:1')).toEqual({ name: 'Grand Resort' });

      cache.destroy();
    });

    it('sweeper purges expired entries correctly', () => {
      const cache = new TtlCache(false);
      cache.set('expiring', 'old-val', -100);
      cache.set('fresh', 'new-val', 10000);

      const purgedCount = cache.sweep();
      expect(purgedCount).toBe(1);
      expect(cache.get('expiring')).toBeNull();
      expect(cache.get('fresh')).toBe('new-val');

      cache.destroy();
    });
  });

  describe('HTTP Cache & 304 Not Modified', () => {
    it('returns ETag and Cache-Control headers on GET /api/v1/menu/items', async () => {
      const res = await request(app).get('/api/v1/menu/items');
      expect(res.status).toBe(200);
      expect(res.headers['etag']).toBeDefined();
      expect(res.headers['cache-control']).toContain('max-age=30');

      const etag = res.headers['etag'];
      const cachedRes = await request(app)
        .get('/api/v1/menu/items')
        .set('If-None-Match', etag);

      expect(cachedRes.status).toBe(304);
    });
  });

  describe('Idempotency & Order Concurrency', () => {
    it('blocks duplicate submissions and returns idempotent replay', async () => {
      const idempotencyKey = `idemp-${Date.now()}-${Math.random()}`;
      const payload = {
        orderType: 'dine_in',
        source: 'pos',
        customerName: 'Idempotent Guest',
        tableNumber: 'T-02',
        items: [{ name: 'Test Pizza', unitPrice: 18.0, quantity: 1, totalPrice: 18.0 }],
        discountAmount: 0,
      };

      const firstRes = await request(app)
        .post('/api/v1/orders')
        .set('Idempotency-Key', idempotencyKey)
        .send(payload);

      expect(firstRes.status).toBe(201);
      expect(firstRes.body.success).toBe(true);
      expect(firstRes.body.data.version).toBe(1);
      expect(firstRes.body.data.kotRounds).toBeDefined();
      expect(firstRes.body.data.kotRounds.length).toBe(1);
      expect(firstRes.body.data.balanceRemaining).toBe(firstRes.body.data.total);

      const createdId = firstRes.body.data.id;

      // Duplicate submission with the same idempotency key
      const duplicateRes = await request(app)
        .post('/api/v1/orders')
        .set('Idempotency-Key', idempotencyKey)
        .send(payload);

      expect(duplicateRes.status).toBe(201);
      expect(duplicateRes.headers['x-cache-lookup']).toContain('HIT (Idempotent replay)');
      expect(duplicateRes.body.data.id).toBe(createdId);
    });
  });
});
