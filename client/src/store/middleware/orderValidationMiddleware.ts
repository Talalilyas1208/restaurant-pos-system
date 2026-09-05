import { Middleware } from '@reduxjs/toolkit';
import { message } from 'antd';
import { Order } from '../../types';

/**
 * Custom Redux Middleware to validate food orders before mutating state or syncing with API.
 * Ensures data integrity, prevents zero-item orders, catches invalid quantities, and verifies totals.
 */
export const orderValidationMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  // Check if this action is an order placement action
  if (action?.type === 'orders/placeOrderOptimistic') {
    const order = action.payload as Order;

    // 1. Validation: Must have at least 1 line item
    if (!order || !order.items || !Array.isArray(order.items) || order.items.length === 0) {
      console.error('[OrderValidationMiddleware] Rejected: Cart is empty.');
      if (typeof window !== 'undefined') {
        message.error('Cannot place an empty order. Please select at least one dish.');
      }
      return; // Stop action from propagating
    }

    // 2. Validation: Every item must have positive quantity and non-negative price
    for (const item of order.items) {
      if (!item.name || item.quantity <= 0 || item.unitPrice < 0) {
        console.error('[OrderValidationMiddleware] Rejected: Invalid item in order', item);
        if (typeof window !== 'undefined') {
          message.error(`Invalid item data for "${item.name || 'Dish'}". Quantity must be greater than 0.`);
        }
        return; // Stop action from propagating
      }
    }

    // 3. Validation: Total amount must be non-negative
    if (typeof order.total !== 'number' || order.total < 0 || isNaN(order.total)) {
      console.error('[OrderValidationMiddleware] Rejected: Invalid grand total', order.total);
      if (typeof window !== 'undefined') {
        message.error('Order total calculation error. Please review your cart.');
      }
      return;
    }

    // 4. Sanitization: Ensure required metadata fields are defined
    if (!order.orderNumber) {
      order.orderNumber = `#POS-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!order.status) {
      order.status = 'pending';
    }
    if (!order.createdAt) {
      order.createdAt = new Date().toISOString();
    }
    if (!order.updatedAt) {
      order.updatedAt = new Date().toISOString();
    }

    console.info(`[OrderValidationMiddleware] ✅ Validated order ${order.orderNumber} with ${order.items.length} items. Total: $${order.total.toFixed(2)}`);
  }

  return next(action);
};

