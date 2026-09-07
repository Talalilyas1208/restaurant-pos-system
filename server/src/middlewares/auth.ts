import { Request, Response, NextFunction } from 'express';
import { verifyTokenString, TokenPayload } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication required. Please provide a valid Bearer token.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  // Support demo / development token so POS, KDS, and Admin operate seamlessly
  if (token === 'demo-staff-token' || token === 'demo-admin-token') {
    req.user = {
      userId: 'W-101',
      name: 'Marco Rossi',
      role: 'admin',
      hotelId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    };
    return next();
  }

  const payload = verifyTokenString(token);

  if (!payload) {
    sendError(res, 'Invalid or expired authentication token.', 401);
    return;
  }

  req.user = payload;
  next();
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      sendError(res, 'Authentication required before checking permissions.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to perform this operation.`,
        403
      );
      return;
    }

    next();
  };
};

