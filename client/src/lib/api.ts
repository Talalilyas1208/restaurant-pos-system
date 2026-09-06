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
  StaffUser,
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

// ─── Core Fetcher ─────────────────────────────────────────────────────────────
const getAuthHeader = (): Record<string, string> => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pos_auth_token') || 'demo-staff-token';
    if (token) return { Authorization: `Bearer ${token}` };
  }
  return {};
};

async function fetcher<T>(
  url: string,
  options?: RequestInit & { signal?: AbortSignal },
): Promise<T> {
  const authHeaders = getAuthHeader();
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options?.headers,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.success) {
    const errorDetails = Array.isArray(json.errors) && json.errors.length > 0
      ? `: ${json.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ')}`
      : '';
    throw new Error((json.message || `API error: ${res.status} ${res.statusText}`) + errorDetails);
  }
  return json.data as T;
}

// ─── API Methods ──────────────────────────────────────────────────────────────
export const api = {
  // ── Hotel / Brand Profile ──────────────────────────────────────────────────
  getHotel: (slug = 'pos-project', signal?: AbortSignal) =>
    fetcher<Hotel>(slug ? `/hotels/${slug}` : '/hotels', { signal }),

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

  deleteTable: (id: string) =>
    fetcher<{ success: boolean }>(`/tables/${id}`, { method: 'DELETE' }),

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

  deleteMenuItem: (id: string) =>
    fetcher<{ success: boolean }>(`/menu/items/${id}`, { method: 'DELETE' }),

  // ── Staff Users / Waiters ──────────────────────────────────────────────────
  getStaff: (signal?: AbortSignal) =>
    fetcher<StaffUser[]>('/staff', { signal }),

  createStaff: (staff: Omit<StaffUser, 'id' | 'createdAt'>) =>
    fetcher<StaffUser>('/staff', { method: 'POST', body: JSON.stringify(staff) }),

  deleteStaff: (id: string) =>
    fetcher<{ success: boolean }>(`/staff/${id}`, { method: 'DELETE' }),

  // ── Orders ─────────────────────────────────────────────────────────────────
  getOrders: (status?: string, signal?: AbortSignal) =>
    fetcher<Order[]>(`/orders${status ? `?status=${status}` : ''}`, { signal }),

  getOrder: (id: string, signal?: AbortSignal) =>
    fetcher<Order>(`/orders/${id}`, { signal }),

  createOrder: (order: Partial<Order>) =>
    fetcher<Order>('/orders', { method: 'POST', body: JSON.stringify(order) }),

  checkoutOrder: (payload: { order: Partial<Order>; payment: any }) =>
    fetcher<{ order: Order; payment: Payment }>('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

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

  // ── Auth ───────────────────────────────────────────────────────────────────
  loginWithPin: (pin: string) =>
    fetcher<{ token: string; user: StaffUser }>('/auth/pin-login', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    }),

  createGuestSession: (tableToken: string) =>
    fetcher<{ token: string; table: DiningTable }>('/auth/guest-session', {
      method: 'POST',
      body: JSON.stringify({ tableToken }),
    }),

  getMe: () => fetcher<any>('/auth/me'),
};
