import { getSupabaseClient } from '../config/supabase.js';
import { Order, OrderStatus, Payment } from '../types/index.js';
import { cache, TTL } from './cache.js';
import { mapOrder } from './mappers.js';
import { diskStorage } from './disk-storage.service.js';
import { tableService, fallbackTables, setFallbackTables } from './table.service.js';
import { initialOrders } from './order.seed.js';
import { createOrderInternal } from './order-creator.service.js';

export let fallbackOrders: Order[] = [...initialOrders];
export let fallbackPayments: Payment[] = [];

// Disk initialization
const diskState = diskStorage.init({
  orders: fallbackOrders,
  tables: fallbackTables,
  payments: fallbackPayments,
});
fallbackOrders = diskState.orders;
fallbackPayments = diskState.payments;
setFallbackTables(diskState.tables);

class OrderService {
  async getOrders(status?: string): Promise<Order[]> {
    const cacheKey = `orders:${status ?? 'all'}`;
    const cached = cache.get<Order[]>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (status && status !== 'all') query = query.eq('status', status);

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const orders = data.map(mapOrder);
          cache.set(cacheKey, orders, TTL.ORDERS);
          return orders;
        }
      } catch (err: any) {
        console.warn('⚠️  getOrders (Supabase):', err?.message || err);
      }
    }

    const filtered = status && status !== 'all'
      ? fallbackOrders.filter((o) => o.status === status)
      : fallbackOrders;

    cache.set(cacheKey, filtered, TTL.ORDERS);
    return filtered;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const cacheKey = `order:${id}`;
    const cached = cache.get<Order>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .or(`id.eq.${id},order_number.eq.${id}`)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const order = mapOrder(data);
          cache.set(cacheKey, order, TTL.ORDERS);
          return order;
        }
      } catch (err: any) {
        console.warn('⚠️  getOrderById (Supabase):', err?.message || err);
      }
    }

    const order = fallbackOrders.find((o) => o.id === id || o.orderNumber === id);
    if (order) cache.set(cacheKey, order, TTL.ORDERS);
    return order;
  }

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    return createOrderInternal(orderData);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update({ status, updated_at: new Date().toISOString() })
          .or(`id.eq.${orderId},order_number.eq.${orderId}`)
          .select('*, order_items(*)')
          .maybeSingle();

        if (!error && data) {
          const order = mapOrder(data);
          if ((status === 'completed' || status === 'cancelled') && order.tableId) {
            await tableService.updateTableStatus(order.tableId, 'available', null);
          }
          cache.invalidate('orders:');
          cache.invalidate(`order:${orderId}`);
          cache.invalidate('analytics');
          return order;
        }
      } catch (err: any) {
        console.warn('⚠️  updateOrderStatus (Supabase):', err?.message || err);
      }
    }

    const idx = fallbackOrders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx > -1) {
      fallbackOrders[idx].status = status;
      fallbackOrders[idx].updatedAt = new Date().toISOString();
      if ((status === 'completed' || status === 'cancelled') && fallbackOrders[idx].tableId) {
        await tableService.updateTableStatus(fallbackOrders[idx].tableId!, 'available', null);
      }
      diskStorage.updateOrders(fallbackOrders);
      cache.invalidate('orders:');
      cache.invalidate(`order:${orderId}`);
      cache.invalidate('analytics');
      return fallbackOrders[idx];
    }
    return null;
  }
}

export const orderService = new OrderService();

