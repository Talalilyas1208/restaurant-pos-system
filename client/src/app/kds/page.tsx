'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Badge,
  Tag,
  Button,
  Switch,
  Segmented,
  Space,
  Typography,
  Divider,
  message,
  Tooltip,
} from 'antd';
import {
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  RollbackOutlined,
  SoundOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { ChefHat } from 'lucide-react';
import { api } from '../../lib/api';
import { STALE } from '../../lib/queryClient';
import { Order, OrderStatus } from '../../types';

const { Title, Text } = Typography;

export default function KitchenDisplayPage() {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Track the count of pending orders from the previous fetch to detect NEW ones
  const prevPendingCount = useRef(0);
  const isInitialLoad = useRef(true);
  const hasUserInteracted = useRef(false);

  // Mark user interaction on click or touch so AudioContext is allowed by browser
  useEffect(() => {
    const handleGesture = () => {
      hasUserInteracted.current = true;
    };
    window.addEventListener('click', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });
    return () => {
      window.removeEventListener('click', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);

  // ── useEffect: Clock tick (every 10 s) ───────────────────────────────────────
  // Updates the `now` timestamp so elapsed-time labels refresh automatically.
  // Cleanup stops the interval on unmount to prevent memory leaks.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, []);

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: orders = [], refetch, isFetching } = useQuery({
    queryKey: ['orders'],
    queryFn: ({ signal }) => api.getOrders(undefined, signal),
    staleTime: STALE.ORDERS,
    refetchInterval: STALE.ORDERS, // auto-poll every 8 s for live kitchen sync
  });

  // ── useEffect: Audio alert on new pending tickets ────────────────────────────
  // Plays a short beep using Web Audio API whenever a NEW order arrives after page load.
  // Only fires after initial load and after user has interacted with the page.
  useEffect(() => {
    const pendingCount = orders.filter((o) => o.status === 'pending').length;

    // Skip playing sound on initial mount to satisfy browser autoplay policy
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      prevPendingCount.current = pendingCount;
      return;
    }

    if (soundEnabled && hasUserInteracted.current && pendingCount > prevPendingCount.current) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();

          oscillator.connect(gain);
          gain.connect(ctx.destination);

          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, ctx.currentTime);       // A5 — alert tone
          oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1); // E5 — resolve
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.35);

          oscillator.onended = () => {
            ctx.close().catch(() => {});
          };
        }
      } catch {
        // AudioContext may be unavailable or blocked — silently ignore
      }
    }

    prevPendingCount.current = pendingCount;
  }, [orders, soundEnabled]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api.updateOrderStatus(id, status),
    onSuccess: (_, variables) => {
      message.success(`Ticket status updated to ${variables.status}`);
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
      {/* KDS Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white flex items-center gap-2">
              Kitchen Display System (KDS)
              <Tag color="orange" className="!font-bold">
                {activeOrders.length} Active Tickets
              </Tag>
            </h1>
            <p className="text-xs text-slate-400">Live Kitchen Line & Ticket Flow Manager</p>
          </div>
        </div>

        {/* Filter & Controls */}
        <div className="flex items-center gap-3">
          <Segmented
            size="middle"
            value={filterType}
            onChange={(val) => setFilterType(val as string)}
            options={[
              { label: 'All', value: 'all' },
              { label: 'Dine In', value: 'dine_in' },
              { label: 'Room Service', value: 'room_service' },
              { label: 'Takeaway', value: 'takeaway' },
            ]}
            className="!bg-slate-800 !p-1 !rounded-xl"
          />

          <Button
            shape="circle"
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={() => refetch()}
            className="!bg-slate-800 !border-slate-700 !text-slate-300"
          />

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300">
            <SoundOutlined className={soundEnabled ? 'text-emerald-400' : 'text-slate-500'} />
            <Switch
              size="small"
              checked={soundEnabled}
              onChange={(val) => setSoundEnabled(val)}
            />
          </div>
        </div>
      </div>

      {/* Kanban Ticket Columns */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {/* COLUMN 1: PENDING / NEW */}
        <div className="flex flex-col bg-slate-900/70 rounded-2xl border border-amber-500/30 overflow-hidden shadow-xl">
          <div className="p-3.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
            <span className="font-bold text-sm text-amber-400 flex items-center gap-2">
              <Badge status="processing" color="#f59e0b" />
              1. NEW TICKETS ({pendingOrders.length})
            </span>
            <Tag color="warning" className="!m-0 font-semibold text-[11px]">Action Required</Tag>
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
                  <Card
                    key={order.id}
                    className={`!rounded-2xl shadow-lg transition-all ${
                      isOverdue
                        ? '!bg-rose-950/40 !border-rose-500 animate-pulse'
                        : '!bg-slate-900 !border-amber-500/40'
                    }`}
                    styles={{ body: { padding: '16px' } }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <div>
                        <div className="font-black text-base text-white">{order.orderNumber}</div>
                        <span className="text-xs text-orange-400 font-bold">
                          {order.tableNumber || 'Takeaway'} ({order.orderType.replace('_', ' ')})
                        </span>
                      </div>

                      <div className="text-right">
                        <Tag color={isOverdue ? 'error' : 'warning'} className="!font-mono !font-bold">
                          <ClockCircleOutlined className="mr-1" /> {elapsed}m ago
                        </Tag>
                        <div className="text-[10px] text-slate-400 uppercase mt-0.5">{order.source}</div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between font-semibold">
                            <span className="text-slate-100">
                              <span className="text-amber-400 font-bold mr-1.5">{item.quantity}x</span>{' '}
                              {item.name}
                            </span>
                          </div>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[11px] text-orange-300 pl-4 !m-0">
                              {item.selectedModifiers.map((m) => m.optionName).join(', ')}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="text-[11px] text-amber-300 italic pl-4 !m-0">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {order.customerNotes && (
                      <div className="text-[11px] bg-slate-800/80 p-2 rounded-lg text-amber-300 italic mt-2">
                        &ldquo;{order.customerNotes}&rdquo;
                      </div>
                    )}

                    <Button
                      type="primary"
                      block
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      className="!mt-3 !h-9 !rounded-xl !bg-blue-600 hover:!bg-blue-500 !font-bold !shadow-md"
                    >
                      Start Preparing
                    </Button>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: IN PREPARATION */}
        <div className="flex flex-col bg-slate-900/70 rounded-2xl border border-blue-500/30 overflow-hidden shadow-xl">
          <div className="p-3.5 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
            <span className="font-bold text-sm text-blue-400 flex items-center gap-2">
              <Badge status="processing" color="#3b82f6" />
              2. COOKING ON LINE ({preparingOrders.length})
            </span>
            <Tag color="processing" className="!m-0 font-semibold text-[11px]">In Kitchen</Tag>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-slate-500 italic">
                No orders currently cooking
              </div>
            ) : (
              preparingOrders.map((order) => {
                const elapsed = getElapsedMinutes(order.createdAt);
                const isOverdue = elapsed >= 20;

                return (
                  <Card
                    key={order.id}
                    className={`!rounded-2xl shadow-lg ${
                      isOverdue
                        ? '!bg-rose-950/40 !border-rose-500 animate-pulse'
                        : '!bg-slate-900 !border-blue-500/40'
                    }`}
                    styles={{ body: { padding: '16px' } }}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <div>
                        <div className="font-black text-base text-white">{order.orderNumber}</div>
                        <span className="text-xs text-blue-400 font-bold">
                          {order.tableNumber || 'Takeaway'}
                        </span>
                      </div>
                      <Tag color="processing" className="!font-mono !font-bold">
                        <ClockCircleOutlined className="mr-1" /> {elapsed}m
                      </Tag>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx}>
                          <span className="text-blue-400 font-bold mr-1.5">{item.quantity}x</span>{' '}
                          {item.name}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button
                        icon={<RollbackOutlined />}
                        onClick={() => handleUpdateStatus(order.id, 'pending')}
                        className="!rounded-xl !bg-slate-800 !border-slate-700 !text-slate-300"
                      >
                        Back
                      </Button>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                        className="!rounded-xl !bg-emerald-600 hover:!bg-emerald-500 !font-bold !shadow-md"
                      >
                        Mark Ready
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: READY FOR SERVING */}
        <div className="flex flex-col bg-slate-900/70 rounded-2xl border border-emerald-500/30 overflow-hidden shadow-xl">
          <div className="p-3.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
            <span className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <Badge status="success" color="#10b981" />
              3. READY FOR SERVER ({readyOrders.length})
            </span>
            <Tag color="success" className="!m-0 font-semibold text-[11px]">Pass Table</Tag>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {readyOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-slate-500 italic">
                No orders waiting for pickup
              </div>
            ) : (
              readyOrders.map((order) => (
                <Card
                  key={order.id}
                  className="!bg-slate-900 !border-emerald-500/40 !rounded-2xl shadow-lg"
                  styles={{ body: { padding: '16px' } }}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                    <div>
                      <div className="font-black text-base text-white">{order.orderNumber}</div>
                      <span className="text-xs text-emerald-400 font-bold">
                        {order.tableNumber || 'Takeaway'}
                      </span>
                    </div>
                    <Tag color="success" className="!font-bold">
                      Ready to Serve
                    </Tag>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        <span className="font-bold text-white mr-1.5">{item.quantity}x</span>{' '}
                        {item.name}
                      </div>
                    ))}
                  </div>

                  <Button
                    block
                    icon={<CheckCircleOutlined className="text-emerald-400" />}
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                    className="!mt-3 !h-9 !rounded-xl !bg-slate-800 !border-slate-700 !text-slate-200 hover:!text-white !font-semibold"
                  >
                    Complete & Clear Ticket
                  </Button>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

