import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { api } from '../lib/api';
import { Order, OrderStatus } from '../types';

export function useKDSOrders() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [now, setNow] = useState<number>(Date.now());

  // Tick for wait timer calculation
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  const { data: orders = [], isFetching, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders(),
    refetchInterval: 6000,
  });

  // Instant Optimistic Update Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.updateOrderStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previousOrders = queryClient.getQueryData<Order[]>(['orders']);

      // Optimistically move ticket to new column instantly (< 1ms)
      queryClient.setQueryData<Order[]>(['orders'], (old) => {
        if (!old) return [];
        return old.map((order) =>
          order.id === id
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        );
      });

      return { previousOrders };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
      message.error('Could not sync ticket status with server.');
    },
    onSuccess: (updatedOrder) => {
      message.success({
        content: `Ticket #${updatedOrder.id.slice(-4)} updated to ${updatedOrder.status}!`,
        duration: 1.5,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const activeOrders = useMemo(() => {
    return orders.filter((o) => {
      const isNotDone = ['pending', 'preparing', 'ready'].includes(o.status);
      const matchesFilter = filterType === 'all' || o.orderType === filterType;
      return isNotDone && matchesFilter;
    });
  }, [orders, filterType]);

  const pendingOrders = useMemo(() => activeOrders.filter((o) => o.status === 'pending'), [activeOrders]);
  const preparingOrders = useMemo(() => activeOrders.filter((o) => o.status === 'preparing'), [activeOrders]);
  const readyOrders = useMemo(() => activeOrders.filter((o) => o.status === 'ready'), [activeOrders]);

  const getElapsedMinutes = (dateStr: string) => {
    const diff = now - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / 60000));
  };

  return {
    filterType,
    setFilterType,
    soundEnabled,
    setSoundEnabled,
    isFetching,
    refetch,
    activeOrders,
    pendingOrders,
    preparingOrders,
    readyOrders,
    getElapsedMinutes,
    handleUpdateStatus,
    isUpdating: updateStatusMutation.isPending,
  };
}

