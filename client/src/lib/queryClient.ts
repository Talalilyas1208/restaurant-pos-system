import { QueryClient } from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// ─── Query Client ─────────────────────────────────────────────────────────────
// staleTime  — how long cached data is considered "fresh" (no refetch triggered)
// gcTime     — how long unused data stays in memory before garbage collection
// retry      — number of automatic retries on network failure
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,      // 30 s default — overridden per-query where needed
      gcTime: 5 * 60_000,    // Keep unused cache entries in memory for 5 min
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,  // Refetch when coming back online
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000), // Exponential backoff
    },
    mutations: {
      retry: 0, // Never retry mutations automatically — let the UI handle errors
    },
  },
});

// ─── Persister ────────────────────────────────────────────────────────────────
// Persists the React Query cache to localStorage using synchronous storage.
// This means on a hard page refresh, cached data is instantly available before
// the first network response arrives — resulting in zero loading spinners.
export const persister = typeof window !== 'undefined'
  ? createSyncStoragePersister({
      storage: window.localStorage,
      key: 'hotel_pos_rq_cache',
      throttleTime: 1000, // Write to localStorage at most once per second
    })
  : undefined;

// ─── Per-resource stale times (exported for use in useQuery calls) ────────────
export const STALE = {
  HOTEL:      60_000,  // Hotel info rarely changes
  MENU:       60_000,  // Menu items and categories
  TABLES:     15_000,  // Table statuses change moderately
  ORDERS:      8_000,  // Orders change very frequently (kitchen updates)
  ANALYTICS:  30_000,  // Dashboard stats
} as const;

