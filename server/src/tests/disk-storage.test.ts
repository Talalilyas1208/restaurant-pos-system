import { describe, it, expect } from 'vitest';
import { diskStorage } from '../services/disk-storage.service.js';
import { Order, DiningTable, Payment } from '../types/index.js';

describe('DiskStorageService Persistence', () => {
  const seedOrders: Order[] = [
    {
      id: 'test-ord-1',
      hotelId: 'h-1',
      orderNumber: '#TEST-01',
      orderType: 'dine_in',
      source: 'pos',
      status: 'pending',
      customerName: 'Test Customer',
      items: [],
      subtotal: 50,
      tax: 4.25,
      serviceCharge: 2.5,
      discountAmount: 0,
      total: 56.75,
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const seedTables: DiningTable[] = [
    {
      id: 'test-tbl-1',
      hotelId: 'h-1',
      tableNumber: 'T-99',
      section: 'Terrace',
      capacity: 4,
      qrCodeToken: 'gh-test-99',
      status: 'available',
      activeOrderId: null,
    },
  ];

  it('should initialize and return initial store state', () => {
    const state = diskStorage.init({
      orders: seedOrders,
      tables: seedTables,
      payments: [],
    });

    expect(state).toBeDefined();
    expect(state.orders.length).toBeGreaterThanOrEqual(1);
    expect(state.tables.length).toBeGreaterThanOrEqual(1);
  });

  it('should update orders and reflect in getState', () => {
    const updatedOrders = [
      ...seedOrders,
      {
        ...seedOrders[0],
        id: 'test-ord-2',
        orderNumber: '#TEST-02',
      },
    ];

    diskStorage.updateOrders(updatedOrders);
    const state = diskStorage.getState();
    expect(state?.orders.length).toBe(updatedOrders.length);
  });

  it('should update tables and add payments', () => {
    const updatedTables: DiningTable[] = [
      ...seedTables,
      {
        ...seedTables[0],
        id: 'test-tbl-2',
        tableNumber: 'T-100',
      },
    ];

    diskStorage.updateTables(updatedTables);
    expect(diskStorage.getState()?.tables.length).toBe(updatedTables.length);

    const newPayment: Payment = {
      id: 'pay-test-1',
      orderId: 'test-ord-1',
      hotelId: 'h-1',
      paymentMethod: 'cash',
      amount: 56.75,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    diskStorage.addPayment(newPayment);
    expect(diskStorage.getState()?.payments.some((p) => p.id === 'pay-test-1')).toBe(true);
  });
});
