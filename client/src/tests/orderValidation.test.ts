import { describe, it, expect, vi } from 'vitest';
import { orderValidationMiddleware } from '../store/middleware/orderValidationMiddleware';
import { Order } from '../types';

describe('Order Validation Redux Middleware', () => {
  const dummyStore = {
    getState: () => ({}),
    dispatch: vi.fn(),
  };

  it('passes non-order actions through untouched', () => {
    const next = vi.fn();
    const action = { type: 'cart/addToCart', payload: {} };

    orderValidationMiddleware(dummyStore as any)(next)(action);

    expect(next).toHaveBeenCalledWith(action);
  });

  it('blocks orders with an empty items array', () => {
    const next = vi.fn();
    const action = {
      type: 'orders/placeOrderOptimistic',
      payload: {
        id: 'ord-test',
        items: [],
        total: 25.00,
      } as Partial<Order>,
    };

    orderValidationMiddleware(dummyStore as any)(next)(action);

    expect(next).not.toHaveBeenCalled();
  });

  it('blocks orders with non-positive or invalid item quantity', () => {
    const next = vi.fn();
    const action = {
      type: 'orders/placeOrderOptimistic',
      payload: {
        id: 'ord-test',
        items: [
          { name: 'Burger', quantity: 0, unitPrice: 15.00, totalPrice: 0 },
        ],
        total: 0,
      } as Partial<Order>,
    };

    orderValidationMiddleware(dummyStore as any)(next)(action);

    expect(next).not.toHaveBeenCalled();
  });

  it('blocks orders with negative or NaN total', () => {
    const next = vi.fn();
    const action = {
      type: 'orders/placeOrderOptimistic',
      payload: {
        id: 'ord-test',
        items: [
          { name: 'Burger', quantity: 1, unitPrice: 15.00, totalPrice: 15.00 },
        ],
        total: -5.00,
      } as Partial<Order>,
    };

    orderValidationMiddleware(dummyStore as any)(next)(action);

    expect(next).not.toHaveBeenCalled();
  });

  it('validates and auto-populates metadata for valid orders', () => {
    const next = vi.fn();
    const payload: Partial<Order> = {
      id: 'ord-valid-1',
      hotelId: 'h-1',
      items: [
        { id: 'oi-1', orderId: 'ord-valid-1', name: 'Pizza', quantity: 2, unitPrice: 19.50, totalPrice: 39.00 },
      ],
      subtotal: 39.00,
      total: 44.26,
    };
    const action = {
      type: 'orders/placeOrderOptimistic',
      payload,
    };

    orderValidationMiddleware(dummyStore as any)(next)(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(payload.orderNumber).toBeDefined();
    expect(payload.status).toBe('pending');
    expect(payload.createdAt).toBeDefined();
  });
});
