'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Order, OrderStatus } from '../../types';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function KitchenDisplayPage() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Update clock every 10s for elapsed time indicators
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const { data: orders = [], refetch, isFetching } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders(),
    refetchInterval: 8000, // Real-time poll every 8 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const handleUpdateStatus = (id: string, status: OrderStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const activeOrders = orders.filter((o) => {
    if (o.status === 'completed' || o.status === 'cancelled') return false;
    if (filterType === 'all') return true;
    return o.orderType === filterType;
  });

  const pendingOrders = activeOrders.filter((o) => o.status === 'pending');
  const preparingOrders = activeOrders.filter((o) => o.status === 'preparing');
  const readyOrders = activeOrders.filter((o) => o.status === 'ready');

  const getElapsedMinutes = (dateStr: string) => {
    const diff = now - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diff / 60000));
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* KDS Header Bar */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white flex items-center gap-2">
              Kitchen Display System (KDS)
              <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
                {activeOrders.length} Active Tickets
              </span>
            </h1>
            <p className="text-xs text-slate-400">Live Kitchen Line & Ticket Manager</p>
          </div>
        </div>

        {/* Filter & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-800 rounded-xl p-1 text-xs">
            {['all', 'dine_in', 'room_service', 'takeaway'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filterType === type
                    ? 'bg-orange-500 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Tickets"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-orange-400' : ''}`} />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Toggle Alert Sounds"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Kanban Ticket Columns */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {/* COLUMN 1: PENDING / NEW */}
        <div className="flex flex-col bg-slate-900/60 rounded-2xl border border-amber-500/30 overflow-hidden">
          <div className="p-3.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
            <span className="font-bold text-sm text-amber-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              1. NEW TICKETS ({pendingOrders.length})
            </span>
            <span className="text-xs text-amber-300 font-mono">Action Required</span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-slate-500 italic">
                No new pending tickets
              </div>
            ) : (
              pendingOrders.map((order) => {
                const elapsed = getElapsedMinutes(order.createdAt);
                const isOverdue = elapsed >= 15;

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl p-4 border shadow-lg space-y-3 transition-all ${
                      isOverdue
                        ? 'bg-rose-950/40 border-rose-500 text-rose-100 animate-pulse'
                        : 'bg-slate-900 border-amber-500/40 text-slate-100'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <div className="font-black text-base text-white">{order.orderNumber}</div>
                        <span className="text-xs text-orange-400 font-bold">
                          {order.tableNumber || 'Takeaway'} ({order.orderType.replace('_', ' ')})
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{elapsed} min ago</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase">{order.source}</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-100">
                              <span className="text-amber-400 font-bold mr-1">{item.quantity}x</span>{' '}
                              {item.name}
                            </span>
                          </div>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[11px] text-orange-300 pl-4">
                              {item.selectedModifiers.map((m) => m.optionName).join(', ')}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="text-[11px] text-amber-300 italic pl-4">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Customer Notes */}
                    {order.customerNotes && (
                      <div className="text-[11px] bg-slate-800/80 p-2 rounded-lg text-amber-300 italic">
                        &ldquo;{order.customerNotes}&rdquo;
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Preparing</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: IN PREPARATION */}
        <div className="flex flex-col bg-slate-900/60 rounded-2xl border border-blue-500/30 overflow-hidden">
          <div className="p-3.5 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
            <span className="font-bold text-sm text-blue-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              2. COOKING ON LINE ({preparingOrders.length})
            </span>
            <span className="text-xs text-blue-300 font-mono">In Kitchen</span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-slate-500 italic">
                No orders currently in preparation
              </div>
            ) : (
              preparingOrders.map((order) => {
                const elapsed = getElapsedMinutes(order.createdAt);
                const isOverdue = elapsed >= 20;

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl p-4 border shadow-lg space-y-3 ${
                      isOverdue
                        ? 'bg-rose-950/40 border-rose-500 text-rose-100 animate-pulse'
                        : 'bg-slate-900 border-blue-500/40 text-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <div className="font-black text-base text-white">{order.orderNumber}</div>
                        <span className="text-xs text-blue-400 font-bold">
                          {order.tableNumber || 'Takeaway'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-blue-300">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsed} mins</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="font-semibold text-slate-100">
                            <span className="text-blue-400 font-bold mr-1">{item.quantity}x</span>{' '}
                            {item.name}
                          </div>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[11px] text-slate-300 pl-4">
                              {item.selectedModifiers.map((m) => m.optionName).join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'pending')}
                        className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                        className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Ready</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: READY FOR SERVING */}
        <div className="flex flex-col bg-slate-900/60 rounded-2xl border border-emerald-500/30 overflow-hidden">
          <div className="p-3.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
            <span className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              3. READY FOR SERVER / RUNNER ({readyOrders.length})
            </span>
            <span className="text-xs text-emerald-300 font-mono">Pass Table</span>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {readyOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-slate-500 italic">
                No orders ready for pickup
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl p-4 border border-emerald-500/40 bg-slate-900 shadow-lg space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <div className="font-black text-base text-white">{order.orderNumber}</div>
                      <span className="text-xs text-emerald-400 font-bold">
                        {order.tableNumber || 'Takeaway'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                      Ready to Serve
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        <span className="font-bold text-white">{item.quantity}x</span> {item.name}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Complete & Clear Ticket</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
