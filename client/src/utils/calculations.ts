import { SelectedModifier } from '../types';

export interface OrderTotals {
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discountAmount: number;
  total: number;
}

export function calculateItemUnitPrice(basePrice: number, modifiers: SelectedModifier[] = []): number {
  const modSum = modifiers.reduce((acc, m) => acc + (m.price || 0), 0);
  return parseFloat((basePrice + modSum).toFixed(2));
}

export function calculateLineItemTotal(unitPrice: number, quantity: number): number {
  return parseFloat((unitPrice * Math.max(1, quantity)).toFixed(2));
}

export function calculateOrderTotals(
  items: Array<{ totalPrice: number }>,
  taxRate: number = 8.5,
  serviceChargeRate: number = 5.0,
  discountPercent: number = 0
): OrderTotals {
  const subtotal = parseFloat(
    items.reduce((sum, item) => sum + (item.totalPrice || 0), 0).toFixed(2)
  );

  const discountAmount = parseFloat(
    ((subtotal * Math.max(0, Math.min(100, discountPercent))) / 100).toFixed(2)
  );

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = parseFloat(((taxableAmount * taxRate) / 100).toFixed(2));
  const serviceCharge = parseFloat(((taxableAmount * serviceChargeRate) / 100).toFixed(2));
  const total = parseFloat((taxableAmount + tax + serviceCharge).toFixed(2));

  return {
    subtotal,
    tax,
    serviceCharge,
    discountAmount,
    total,
  };
}
