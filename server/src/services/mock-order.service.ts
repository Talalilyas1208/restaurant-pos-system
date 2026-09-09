import { Order, DiningTable } from '../types/index.js';
import { tableService, fallbackTables } from './table.service.js';
import { menuService } from './menu.service.js';
import { orderService, fallbackOrders, fallbackPayments } from './order.service.js';
import { diskStorage } from './disk-storage.service.js';
import { cache } from './cache.js';

export interface CreateMockOrderOptions {
  tableId?: string;
  customerName?: string;
  customerNotes?: string;
}

class MockOrderService {
  async createMockOrder(options: CreateMockOrderOptions = {}): Promise<Order> {
    const tables = await tableService.getTables();
    let targetTable: DiningTable | undefined;

    if (options.tableId) {
      targetTable = tables.find((t) => t.id === options.tableId);
    }
    if (!targetTable) {
      targetTable = tables.find((t) => t.status === 'available') || tables[0];
    }

    const allDishes = await menuService.getMenuItems();
    const availableDishes = allDishes.filter((d) => d.isAvailable);
    const pool = availableDishes.length > 0 ? availableDishes : allDishes;

    // Pick 2-3 dishes
    const numItems = Math.min(pool.length, Math.floor(Math.random() * 2) + 2);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const chosen = shuffled.slice(0, numItems);

    const items = chosen.map((dish, idx) => {
      const quantity = Math.floor(Math.random() * 2) + 1;
      return {
        id: `oi-mock-${idx}`,
        orderId: '',
        menuItemId: dish.id,
        name: dish.name,
        unitPrice: dish.price,
        quantity,
        totalPrice: parseFloat((dish.price * quantity).toFixed(2)),
        status: 'pending' as const,
      };
    });

    const guestNumber = Math.floor(100 + Math.random() * 900);
    const customerName = options.customerName || (targetTable ? `Guest #${targetTable.tableNumber}` : `Guest #${guestNumber}`);

    const newOrder = await orderService.createOrder({
      tableId: targetTable?.id,
      tableNumber: targetTable?.tableNumber,
      orderType: 'dine_in',
      source: 'pos',
      customerName,
      customerNotes: options.customerNotes || 'On-demand order',
      serverStaffId: 'W-101',
      serverStaffName: 'Marco Rossi',
      items,
      discountAmount: 0,
    });

    return newOrder;
  }

  async clearOrders(): Promise<void> {
    fallbackOrders.splice(0, fallbackOrders.length);
    fallbackPayments.splice(0, fallbackPayments.length);

    // Reset all tables to available
    for (const tbl of fallbackTables) {
      tbl.status = 'available';
      tbl.activeOrderId = null;
    }

    diskStorage.updateOrders(fallbackOrders);
    diskStorage.updateTables(fallbackTables);

    cache.invalidate('orders:');
    cache.invalidate('tables');
    cache.invalidate('analytics');
  }
}

export const mockOrderService = new MockOrderService();
