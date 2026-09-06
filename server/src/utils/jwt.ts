import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hotel-pos-secure-jwt-key-2026-secret';

export interface TokenPayload {
  userId: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier' | 'kitchen' | 'waiter' | 'guest';
  hotelId: string;
  tableId?: string;
  tableNumber?: string;
}

export const signToken = (payload: TokenPayload, expiresIn = '12h'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
};

export const verifyTokenString = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return null;
  }
};
