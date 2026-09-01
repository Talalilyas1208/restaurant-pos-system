import {
  Hotel,
  DiningTable,
  Category,
  MenuItem,
  Order,
  Payment,
  AnalyticsSummary,
  TableStatus,
  OrderStatus,
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

// ─── Core Fetcher ─────────────────────────────────────────────────────────────
// The `signal` parameter is provided automatically by React Query when a query
// is cancelled (e.g. component unmounts, query key changes). This prevents
// responses from in-flight stale requests from being processed.
async function fetcher<T>(
  url: string,
  options?: RequestInit & { signal?: AbortSignal },
): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || `API error: ${res.status} ${res.statusText}`);
  }
  return json.data as T;
}

// ─── API Methods ──────────────────────────────────────────────────────────────
// Each queryFn receives a `{ signal }` from React Query — pass it through
// to fetcher so in-flight requests can be aborted on unmount or key change.

export const api = {
  // ── Hotel ──────────────────────────────────────────────────────────────────
  getHotel: (slug = 'grand-horizon', signal?: AbortSignal) =>
    fetcher<Hotel>(`/hotels/${slug}`, { signal }),

  updateHotel: (data: Partial<Hotel>) =>
    fetcher<Hotel>('/hotels', { method: 'PUT', body: JSON.stringify(data) }),

  // ── Tables ─────────────────────────────────────────────────────────────────
  getTables: (signal?: AbortSignal) =>
    fetcher<DiningTable[]>('/tables', { signal }),

  getTableByToken: (token: string, signal?: AbortSignal) =>
    fetcher<DiningTable>(`/tables/token/${token}`, { signal }),

  updateTableStatus: (id: string, status: TableStatus, activeOrderId?: string | null) =>
    fetcher<DiningTable>(`/tables/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, activeOrderId }),
    }),

  createTable: (table: Omit<DiningTable, 'id' | 'createdAt'>) =>
    fetcher<DiningTable>('/tables', { method: 'POST', body: JSON.stringify(table) }),

  // ── Categories & Menu ──────────────────────────────────────────────────────
  getCategories: (signal?: AbortSignal) =>
    fetcher<Category[]>('/menu/categories', { signal }),

  createCategory: (cat: Partial<Category>) =>
    fetcher<Category>('/menu/categories', { method: 'POST', body: JSON.stringify(cat) }),

  getMenuItems: (categoryId?: string, signal?: AbortSignal) =>
    fetcher<MenuItem[]>(`/menu/items${categoryId ? `?categoryId=${categoryId}` : ''}`, { signal }),

  getMenuItem: (id: string, signal?: AbortSignal) =>
    fetcher<MenuItem>(`/menu/items/${id}`, { signal }),

  createMenuItem: (item: Partial<MenuItem>) =>
    fetcher<MenuItem>('/menu/items', { method: 'POST', body: JSON.stringify(item) }),

  updateMenuItem: (id: string, updates: Partial<MenuItem>) =>
    fetcher<MenuItem>(`/menu/items/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),

  // ── Orders ─────────────────────────────────────────────────────────────────
  getOrders: (status?: string, signal?: AbortSignal) =>
    fetcher<Order[]>(`/orders${status ? `?status=${status}` : ''}`, { signal }),

  getOrder: (id: string, signal?: AbortSignal) =>
    fetcher<Order>(`/orders/${id}`, { signal }),

  createOrder: (order: Partial<Order>) =>
    fetcher<Order>('/orders', { method: 'POST', body: JSON.stringify(order) }),

  updateOrderStatus: (id: string, status: OrderStatus) =>
    fetcher<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // ── Payments ───────────────────────────────────────────────────────────────
  processPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) =>
    fetcher<{ payment: Payment; order: Order }>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    }),

  // ── Analytics ──────────────────────────────────────────────────────────────
  getAnalytics: (signal?: AbortSignal) =>
    fetcher<AnalyticsSummary>('/analytics/dashboard', { signal }),
};

