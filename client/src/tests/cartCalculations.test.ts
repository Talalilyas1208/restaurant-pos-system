import { describe, it, expect } from 'vitest';
import {
  calculateItemUnitPrice,
  calculateLineItemTotal,
  calculateOrderTotals,
} from '../utils/calculations';
import { SelectedModifier } from '../types';

describe('Cart Calculations Engine', () => {
  it('calculates unit price without modifiers correctly', () => {
    const unitPrice = calculateItemUnitPrice(14.50);
    expect(unitPrice).toBe(14.50);
  });

  it('calculates unit price with multiple paid modifiers', () => {
    const modifiers: SelectedModifier[] = [
      { groupName: 'Sauce Choice', optionName: 'Truffle Mushroom Jus', price: 4.00 },
      { groupName: 'Add-on', optionName: 'Extra Cheese', price: 2.50 },
    ];
    const unitPrice = calculateItemUnitPrice(36.00, modifiers);
    expect(unitPrice).toBe(42.50);
  });

  it('calculates line item total multiplying unit price and quantity', () => {
    const lineTotal = calculateLineItemTotal(21.00, 3);
    expect(lineTotal).toBe(63.00);
  });

  it('computes subtotal, tax, service charge, and total for standard order', () => {
    const items = [
      { totalPrice: 36.00 },
      { totalPrice: 14.50 },
    ];
    // Subtotal: 50.50
    // Tax (8.5%): 4.29
    // Service Charge (5.0%): 2.53
    // Discount: 0
    // Total: 50.50 + 4.29 + 2.53 = 57.32
    const totals = calculateOrderTotals(items, 8.5, 5.0, 0);

    expect(totals.subtotal).toBe(50.50);
    expect(totals.tax).toBe(4.29);
    expect(totals.serviceCharge).toBe(2.52);
    expect(totals.discountAmount).toBe(0);
    expect(totals.total).toBe(57.31);
  });

  it('correctly applies a discount percentage before computing tax & service charge', () => {
    const items = [{ totalPrice: 100.00 }];
    // Subtotal: 100
    // 10% Discount: 10.00 -> Taxable: 90.00
    // Tax (8.5% of 90): 7.65
    // Service Charge (5.0% of 90): 4.50
    // Total: 90 + 7.65 + 4.50 = 102.15
    const totals = calculateOrderTotals(items, 8.5, 5.0, 10);

    expect(totals.subtotal).toBe(100.00);
    expect(totals.discountAmount).toBe(10.00);
    expect(totals.tax).toBe(7.65);
    expect(totals.serviceCharge).toBe(4.50);
    expect(totals.total).toBe(102.15);
  });

  it('handles empty items array gracefully', () => {
    const totals = calculateOrderTotals([], 8.5, 5.0, 0);
    expect(totals.subtotal).toBe(0);
    expect(totals.tax).toBe(0);
    expect(totals.serviceCharge).toBe(0);
    expect(totals.total).toBe(0);
  });
});
