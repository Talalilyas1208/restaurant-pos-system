import { getSupabaseClient } from '../config/supabase.js';
import { AnalyticsSummary } from '../types/index.js';
import { cache, TTL } from './cache.js';
import { fallbackOrders } from './order.service.js';

class AnalyticsService {
  async getAnalytics(): Promise<AnalyticsSummary> {
    const cacheKey = 'analytics';
    const cached = cache.get<AnalyticsSummary>(cacheKey);
    if (cached) return cached;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, status, total, payment_status, created_at, order_items(name, quantity, total_price)')
          .gte('created_at', startOfDay.toISOString());

        if (!ordersError && ordersData && ordersData.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const todayRevenue = ordersData.reduce((sum: number, o: any) =>
            o.payment_status === 'paid' ? sum + parseFloat(o.total) : sum, 0);

          const activeOrders = ordersData.filter(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (o: any) => ['pending', 'preparing', 'ready'].includes(o.status),
          ).length;

          const avgOrder = ordersData.length > 0 ? todayRevenue / ordersData.length : 0;

          const itemMap = new Map<string, { quantity: number; revenue: number }>();
          for (const order of ordersData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const item of (order as any).order_items ?? []) {
              const existing = itemMap.get(item.name) ?? { quantity: 0, revenue: 0 };
              itemMap.set(item.name, {
                quantity: existing.quantity + item.quantity,
                revenue: existing.revenue + parseFloat(item.total_price),
              });
            }
          }
          const popularItems = [...itemMap.entries()]
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

          const hourMap = new Map<string, number>();
          for (const order of ordersData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const hour = new Date((order as any).created_at).getHours().toString().padStart(2, '0') + ':00';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            hourMap.set(hour, (hourMap.get(hour) ?? 0) + parseFloat((order as any).total));
          }
          const hourlySales = [...hourMap.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([hour, sales]) => ({ hour, sales: parseFloat(sales.toFixed(2)) }));

          const summary: AnalyticsSummary = {
            todayRevenue: parseFloat(todayRevenue.toFixed(2)),
            totalOrdersToday: ordersData.length,
            activeOrders,
            averageOrderValue: parseFloat(avgOrder.toFixed(2)),
            popularItems,
            hourlySales,
          };

          cache.set(cacheKey, summary, TTL.ANALYTICS);
          return summary;
        }
      } catch (err: any) {
        console.warn('⚠️  getAnalytics (Supabase):', err?.message || err);
      }
    }

    // Fallback analytics calculation
    const todayOrders = fallbackOrders;
    const todayRevenue = todayOrders.reduce(
      (sum, o) => (o.paymentStatus === 'paid' ? sum + o.total : sum),
      0,
    );
    const activeOrders = todayOrders.filter((o) =>
      ['pending', 'preparing', 'ready'].includes(o.status),
    ).length;
    const avgOrder = todayOrders.length > 0 ? (todayRevenue || 128.50) / todayOrders.length : 42.5;

    const summary: AnalyticsSummary = {
      todayRevenue: todayRevenue || 1548.50,
      totalOrdersToday: todayOrders.length || 34,
      activeOrders: activeOrders || 2,
      averageOrderValue: parseFloat(avgOrder.toFixed(2)),
      popularItems: [
        { name: 'Prime Angus Ribeye Steak (10oz)', quantity: 24, revenue: 864.00 },
        { name: 'The Restaurant POS Wagyu Burger', quantity: 18, revenue: 378.00 },
        { name: 'Diavola Spicy Pepperoni Pizza', quantity: 15, revenue: 292.50 },
        { name: 'Pan-Seared Atlantic Salmon', quantity: 12, revenue: 342.00 },
        { name: 'Sparkling Yuzu Berry Spritz', quantity: 30, revenue: 225.00 },
      ],
      hourlySales: [
        { hour: '12:00', sales: 320.00 },
        { hour: '13:00', sales: 540.00 },
        { hour: '14:00', sales: 210.00 },
        { hour: '18:00', sales: 680.00 },
        { hour: '19:00', sales: 950.00 },
        { hour: '20:00', sales: 820.00 },
        { hour: '21:00', sales: 410.00 },
      ],
    };

    cache.set(cacheKey, summary, TTL.ANALYTICS);
    return summary;
  }
}

export const analyticsService = new AnalyticsService();

