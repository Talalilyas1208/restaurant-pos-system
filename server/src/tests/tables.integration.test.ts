import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';

describe('Tables Integration API', { timeout: 15000 }, () => {
  it('GET /api/v1/tables should return 200 with dining tables array', async () => {
    const res = await request(app).get('/api/v1/tables');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/tables should create a new dining table', async () => {
    const newTable = {
      hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      tableNumber: 'T-99',
      section: 'Rooftop Lounge',
      capacity: 4,
      qrCodeToken: 'gh-t99-test',
      status: 'available',
    };

    const res = await request(app).post('/api/v1/tables').send(newTable);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tableNumber).toBe('T-99');

    // Clean up
    if (res.body.data.id) {
      await request(app).delete(`/api/v1/tables/${res.body.data.id}`);
    }
  });

  it('DELETE /api/v1/tables/:id should return 404 for non-existent table', async () => {
    const res = await request(app).delete('/api/v1/tables/tbl-non-existent-999');
    expect(res.status).toBe(404);
  });
});

