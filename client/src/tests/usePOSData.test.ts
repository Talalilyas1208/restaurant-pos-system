import { describe, it, expect } from 'vitest';
import { calculateOrderTotals, calculateItemUnitPrice, calculateLineItemTotal } from '../utils/calculations';

describe('usePOSData Calculations Unit Tests', () => {
  it('correctly calculates subtotal, tax, service charge, and grand total', () => {
    const items = [
      { totalPrice: 36.0 },
      { totalPrice: 14.0 },
    ];
    // Subtotal: 50.00
    // Tax (8.5%): 4.25
    // Service Charge (5.0%): 2.50
    // Discount (0%): 0.00
    // Total: 56.75
    const totals = calculateOrderTotals(items, 8.5, 5.0, 0);
    expect(totals.subtotal).toBe(50.0);
    expect(totals.tax).toBe(4.25);
    expect(totals.serviceCharge).toBe(2.5);
    expect(totals.discountAmount).toBe(0);
    expect(totals.total).toBe(56.75);
  });

  it('correctly applies percentage discounts before computing tax and service charge', () => {
    const items = [{ totalPrice: 100.0 }];
    // Subtotal: 100
    // 10% discount: 10.00
    // Taxable: 90.00
    // Tax (10%): 9.00
    // Service (5%): 4.50
    // Total: 90 + 9 + 4.50 = 103.50
    const totals = calculateOrderTotals(items, 10, 5, 10);
    expect(totals.discountAmount).toBe(10.0);
    expect(totals.tax).toBe(9.0);
    expect(totals.serviceCharge).toBe(4.5);
    expect(totals.total).toBe(103.5);
  });

  it('clamps discount between 0 and 100 percent', () => {
    const items = [{ totalPrice: 100.0 }];
    const negativeDiscount = calculateOrderTotals(items, 10, 5, -20);
    expect(negativeDiscount.discountAmount).toBe(0);

    const overDiscount = calculateOrderTotals(items, 10, 5, 150);
    expect(overDiscount.discountAmount).toBe(100.0);
    expect(overDiscount.total).toBe(0);
  });

  it('handles empty item list gracefully with zeroes', () => {
    const totals = calculateOrderTotals([]);
    expect(totals.subtotal).toBe(0);
    expect(totals.tax).toBe(0);
    expect(totals.serviceCharge).toBe(0);
    expect(totals.discountAmount).toBe(0);
    expect(totals.total).toBe(0);
  });

  it('calculates item unit price with multiple selected modifiers', () => {
    const unitPrice = calculateItemUnitPrice(25.0, [
      { groupName: 'Side', optionName: 'Truffle Fries', price: 4.5 },
      { groupName: 'Sauce', optionName: 'Bearnaise', price: 2.0 },
    ]);
    expect(unitPrice).toBe(31.5);
  });

  it('calculates line item total multiplying by positive quantity', () => {
    expect(calculateLineItemTotal(15.5, 3)).toBe(46.5);
    expect(calculateLineItemTotal(10.0, 0)).toBe(10.0); // minimum quantity 1
  });
});
