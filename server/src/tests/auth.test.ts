import { describe, it, expect, vi } from 'vitest';
import { signToken, verifyTokenString, TokenPayload } from '../utils/jwt.js';
import { verifyToken, requireRole, AuthenticatedRequest } from '../middlewares/auth.js';
import { Response, NextFunction } from 'express';

describe('Auth & JWT Utilities', () => {
  const samplePayload: TokenPayload = {
    userId: 'W-101',
    name: 'Marco Rossi',
    role: 'waiter',
    hotelId: 'hotel-001',
  };

  it('should sign and successfully verify a JWT token', () => {
    const token = signToken(samplePayload);
    expect(typeof token).toBe('string');

    const decoded = verifyTokenString(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe('W-101');
    expect(decoded?.name).toBe('Marco Rossi');
    expect(decoded?.role).toBe('waiter');
  });

  it('should return null when verifying a malformed token', () => {
    const decoded = verifyTokenString('invalid.token.payload');
    expect(decoded).toBeNull();
  });
});

describe('Auth Middleware (verifyToken)', () => {
  const mockResponse = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should reject requests without Authorization header', () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should accept valid Bearer tokens and attach user to req', () => {
    const payload: TokenPayload = {
      userId: 'A-001',
      name: 'Admin User',
      role: 'admin',
      hotelId: 'hotel-001',
    };
    const token = signToken(payload);

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthenticatedRequest;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user?.userId).toBe('A-001');
    expect(req.user?.role).toBe('admin');
  });
});

describe('RBAC Middleware (requireRole)', () => {
  const mockResponse = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  it('should forbid unauthorized roles with 403', () => {
    const guard = requireRole('admin', 'manager');
    const req = {
      user: { userId: 'W-101', name: 'Waiter', role: 'waiter', hotelId: 'h1' },
    } as AuthenticatedRequest;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    guard(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow authorized roles and proceed', () => {
    const guard = requireRole('admin', 'manager');
    const req = {
      user: { userId: 'M-001', name: 'Manager', role: 'manager', hotelId: 'h1' },
    } as AuthenticatedRequest;
    const res = mockResponse();
    const next = vi.fn() as NextFunction;

    guard(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
