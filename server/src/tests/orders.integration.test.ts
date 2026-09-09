import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import { signToken } from '../utils/jwt.js';

describe('Orders Integration API', { timeout: 15000 }, () => {
  const staffToken = signToken({
    userId: 'W-101',
    name: 'Marco Rossi',
    role: 'waiter',
    hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  });

  it('GET /api/v1/orders should return 200 with orders array', async () => {
    const res = await request(app).get('/api/v1/orders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/orders/mock should generate an on-demand order on an available table', async () => {
    const res = await request(app).post('/api/v1/orders/mock').send({});
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.tableId).toBeDefined();
  });

  it('POST /api/v1/orders should validate and create a new order', async () => {
    const payload = {
      orderType: 'dine_in',
      source: 'pos',
      customerName: 'Integration Test Guest',
      tableNumber: 'T-01',
      items: [
        {
          name: 'The Restaurant POS Wagyu Burger',
          unitPrice: 21.0,
          quantity: 2,
          totalPrice: 42.0,
        },
      ],
      discountAmount: 0,
    };

    const res = await request(app).post('/api/v1/orders').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.customerName).toBe('Integration Test Guest');
    expect(res.body.data.items.length).toBe(1);
  });

  it('PATCH /api/v1/orders/:id/status should return 401 without Bearer token', async () => {
    const listRes = await request(app).get('/api/v1/orders');
    const orderId = listRes.body.data[0].id;

    const res = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .send({ status: 'preparing' });
    expect(res.status).toBe(401);
  });

  it('PATCH /api/v1/orders/:id/status should succeed with authenticated staff token', async () => {
    const listRes = await request(app).get('/api/v1/orders');
    const orderId = listRes.body.data[0].id;

    const res = await request(app)
      .patch(`/api/v1/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'preparing' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('preparing');
  });

  it('GET /api/v1/orders/:id should return 404 for unknown order ID', async () => {
    const res = await request(app).get('/api/v1/orders/ord-unknown-9999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

