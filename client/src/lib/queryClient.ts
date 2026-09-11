import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// ─── Query Client ─────────────────────────────────────────────────────────────
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    },
    mutations: {
      retry: 0,
    },
  },
});

// ─── Persister ────────────────────────────────────────────────────────────────
export const persister = typeof window !== 'undefined'
  ? createSyncStoragePersister({
      storage: window.localStorage,
      key: 'hotel_pos_rq_cache',
      throttleTime: 1000,
    })
  : undefined;

// ─── Per-resource stale times ────────────────────────────────────────────────
export const STALE = {
  HOTEL:      60_000,
  MENU:       60_000,
  TABLES:     15_000,
  ORDERS:      8_000,
  ANALYTICS:  30_000,
} as const;

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const queryKeys = {
  hotel: {
    all: ['hotel'] as const,
    detail: (slug?: string) => ['hotel', slug ?? 'default'] as const,
  },
  tables: {
    all: ['tables'] as const,
    detail: (id: string) => ['tables', id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  menu: {
    all: ['menu'] as const,
    items: (categoryId?: string) => ['menu', 'items', categoryId ?? 'all'] as const,
    item: (id: string) => ['menu', 'item', id] as const,
  },
  orders: {
    all: ['orders'] as const,
    active: ['orders', 'active'] as const,
    detail: (id: string) => ['orders', id] as const,
  },
  staff: {
    all: ['staff'] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    summary: (period?: string) => ['analytics', period ?? 'today'] as const,
  },
} as const;
