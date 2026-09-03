'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tag,
  Button,
  Segmented,
  Switch,
  message,
} from 'antd';
import {
  ReloadOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import { ChefHat } from 'lucide-react';
import { api } from '../../lib/api';
import { Order, OrderStatus } from '../../types';
import { PageHeader, KDSTicketCard, EmptyState } from '../../components/ui';

export default function KDSPage() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [now, setNow] = useState<number>(Date.now());

  // Timer tick for order wait times
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Queries
  const { data: orders = [], isFetching, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders(),
    refetchInterval: 5000,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.updateOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      message.success(`Ticket #${updatedOrder.id.slice(-4)} updated to ${updatedOrder.status}!`);
    },
  });

  const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  // Filter orders
  const activeOrders = orders.filter((o) => {
    const isNotDone = ['pending', 'preparing', 'ready'].includes(o.status);
    const matchesFilter = filterType === 'all' || o.orderType === filterType;
    return isNotDone && matchesFilter;
  });

  const pendingOrders = activeOrders.filter((o) => o.status === 'pending');
  const preparingOrders = activeOrders.filter((o) => o.status === 'preparing');
  const readyOrders = activeOrders.filter((o) => o.status === 'ready');

  const getElapsedMinutes = (dateStr: string) => {
    const diff = now - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / 60000));
  };

  return (
    <div className="flex-1 bg-slate-100 text-slate-900 flex flex-col h-full overflow-hidden">
      {/* KDS Header */}
      <PageHeader
        title="Kitchen Display System (KDS)"
        subtitle="Live kitchen tickets, order modifiers, prep timers & station routing"
        icon={<ChefHat className="w-5 h-5" />}
        badge={
          <Tag color="orange" className="!font-black !rounded-md">
            {activeOrders.length} Active Tickets
          </Tag>
        }
        actions={
          <div className="flex items-center gap-3">
            <Segmented
              size="middle"
              value={filterType}
              onChange={(val) => setFilterType(val as string)}
              options={[
                { label: 'All Orders', value: 'all' },
                { label: 'Dine In', value: 'dine_in' },
                { label: 'Room Service', value: 'room_service' },
                { label: 'Takeaway', value: 'takeaway' },
              ]}
              className="!bg-slate-100 !p-1 !rounded-2xl !border !border-slate-200 font-bold text-slate-700"
            />

            <Button
              shape="circle"
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              className="!bg-white !border-slate-200 !text-slate-700 font-bold"
            />

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
              <SoundOutlined className={soundEnabled ? 'text-emerald-600' : 'text-slate-400'} />
              <span className="text-[11px] hidden sm:inline">Audio</span>
              <Switch
                size="small"
                checked={soundEnabled}
                onChange={(val) => setSoundEnabled(val)}
              />
            </div>
          </div>
        }
      />

      {/* Kanban Ticket Columns */}
      <div className="flex-1 p-3 md:p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto md:overflow-hidden">
        {/* COLUMN 1: PENDING / NEW */}
        <div className="flex flex-col bg-amber-50/70 rounded-3xl border-2 border-amber-200 overflow-hidden shadow-xs">
          <div className="p-3.5 bg-amber-100/90 border-b border-amber-200 flex items-center justify-between">
            <span className="font-black text-sm text-amber-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              1. NEW TICKETS ({pendingOrders.length})
            </span>
            <Tag color="warning" className="!m-0 font-bold text-[11px] !rounded-md">Action Required</Tag>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {pendingOrders.length === 0 ? (
              <EmptyState
                title="No new tickets"
                description="New guest and waiter orders will pop up here."
                className="!p-6 !bg-amber-50/40 !border-amber-100"
              />
            ) : (
              pendingOrders.map((order) => (
                <KDSTicketCard
                  key={order.id}
                  order={order}
                  elapsedMinutes={getElapsedMinutes(order.createdAt)}
                  onUpdateStatus={handleUpdateStatus}
                  isUpdating={updateStatusMutation.isPending}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: IN PREPARATION */}
        <div className="flex flex-col bg-blue-50/70 rounded-3xl border-2 border-blue-200 overflow-hidden shadow-xs">
          <div className="p-3.5 bg-blue-100/90 border-b border-blue-200 flex items-center justify-between">
            <span className="font-black text-sm text-blue-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              2. IN KITCHEN ({preparingOrders.length})
            </span>
            <Tag color="processing" className="!m-0 font-bold text-[11px] !rounded-md">Cooking</Tag>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {preparingOrders.length === 0 ? (
              <EmptyState
                title="No dishes cooking"
                description="Move tickets here when preparation begins."
                className="!p-6 !bg-blue-50/40 !border-blue-100"
              />
            ) : (
              preparingOrders.map((order) => (
                <KDSTicketCard
                  key={order.id}
                  order={order}
                  elapsedMinutes={getElapsedMinutes(order.createdAt)}
                  onUpdateStatus={handleUpdateStatus}
                  isUpdating={updateStatusMutation.isPending}
                />
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: READY FOR SERVING */}
        <div className="flex flex-col bg-emerald-50/70 rounded-3xl border-2 border-emerald-200 overflow-hidden shadow-xs">
          <div className="p-3.5 bg-emerald-100/90 border-b border-emerald-200 flex items-center justify-between">
            <span className="font-black text-sm text-emerald-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              3. READY TO SERVE ({readyOrders.length})
            </span>
            <Tag color="success" className="!m-0 font-bold text-[11px] !rounded-md">Ready</Tag>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {readyOrders.length === 0 ? (
              <EmptyState
                title="No ready orders"
                description="Orders ready for waiter pickup will appear here."
                className="!p-6 !bg-emerald-50/40 !border-emerald-100"
              />
            ) : (
              readyOrders.map((order) => (
                <KDSTicketCard
                  key={order.id}
                  order={order}
                  elapsedMinutes={getElapsedMinutes(order.createdAt)}
                  onUpdateStatus={handleUpdateStatus}
                  isUpdating={updateStatusMutation.isPending}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
