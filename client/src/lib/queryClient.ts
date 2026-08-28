import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10, // 10 seconds cache validity
      refetchInterval: 15000, // auto poll every 15s for live table & order synchronization
      refetchOnWindowFocus: true,
      retry: 2,
    },
  },
});
