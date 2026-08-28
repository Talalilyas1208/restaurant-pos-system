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

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || 'API request failed');
  }
  return json.data;
}

export const api = {
  // Hotel
  getHotel: (slug = 'grand-horizon') => fetcher<Hotel>(`/hotels/${slug}`),
  updateHotel: (data: Partial<Hotel>) =>
    fetcher<Hotel>('/hotels', { method: 'PUT', body: JSON.stringify(data) }),

  // Tables
  getTables: () => fetcher<DiningTable[]>('/tables'),
  getTableByToken: (token: string) => fetcher<DiningTable>(`/tables/token/${token}`),
  updateTableStatus: (id: string, status: TableStatus, activeOrderId?: string | null) =>
    fetcher<DiningTable>(`/tables/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, activeOrderId }),
    }),
  createTable: (table: Omit<DiningTable, 'id'>) =>
    fetcher<DiningTable>('/tables', {
      method: 'POST',
      body: JSON.stringify(table),
    }),

  // Categories & Menu
  getCategories: () => fetcher<Category[]>('/menu/categories'),
  createCategory: (cat: Partial<Category>) =>
    fetcher<Category>('/menu/categories', {
      method: 'POST',
      body: JSON.stringify(cat),
    }),
  getMenuItems: (categoryId?: string) =>
    fetcher<MenuItem[]>(`/menu/items${categoryId ? `?categoryId=${categoryId}` : ''}`),
  getMenuItem: (id: string) => fetcher<MenuItem>(`/menu/items/${id}`),
  createMenuItem: (item: Partial<MenuItem>) =>
    fetcher<MenuItem>('/menu/items', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  updateMenuItem: (id: string, updates: Partial<MenuItem>) =>
    fetcher<MenuItem>(`/menu/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Orders
  getOrders: (status?: string) =>
    fetcher<Order[]>(`/orders${status ? `?status=${status}` : ''}`),
  getOrder: (id: string) => fetcher<Order>(`/orders/${id}`),
  createOrder: (order: Partial<Order>) =>
    fetcher<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  updateOrderStatus: (id: string, status: OrderStatus) =>
    fetcher<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Payments
  processPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) =>
    fetcher<{ payment: Payment; order: Order }>('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    }),

  // Analytics
  getAnalytics: () => fetcher<AnalyticsSummary>('/analytics/dashboard'),
};
