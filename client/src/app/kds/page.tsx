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
    <div className="flex-1 bg-slate-100 text-slate-900 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* KDS Header (Clean White & High Contrast) */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-lg text-slate-900 flex items-center gap-2">
              Kitchen Display System (KDS)
              <Tag color="orange" className="!font-black !rounded-md">
                {activeOrders.length} Active Tickets
              </Tag>
            </h1>
            <p className="text-xs font-semibold text-slate-500">Live Kitchen Line & Ticket Flow Manager</p>
          </div>
        </div>

        {/* Filter & Controls */}
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

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm">
            <SoundOutlined className={soundEnabled ? 'text-emerald-600' : 'text-slate-400'} />
            <span className="text-[11px]">Audio</span>
            <Switch
              size="small"
              checked={soundEnabled}
              onChange={(val) => setSoundEnabled(val)}
            />
          </div>
        </div>
      </div>

      {/* Kanban Ticket Columns (White surface + Vibrant RGB Accents) */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
        {/* COLUMN 1: PENDING / NEW (Solar Amber / Orange RGB Theme) */}
        <div className="flex flex-col bg-amber-50/70 rounded-3xl border-2 border-amber-200 overflow-hidden shadow-sm">
          <div className="p-3.5 bg-amber-100/90 border-b border-amber-200 flex items-center justify-between">
            <span className="font-black text-sm text-amber-900 flex items-center gap-2">
              <Badge status="processing" color="#f59e0b" />
              1. NEW TICKETS ({pendingOrders.length})
            </span>
            <Tag color="warning" className="!m-0 font-bold text-[11px] !rounded-md">Action Required</Tag>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {pendingOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-slate-400 font-bold italic">
                No new pending tickets
              </div>
            ) : (
              pendingOrders.map((order) => {
                const elapsed = getElapsedMinutes(order.createdAt);
                const isOverdue = elapsed >= 15;

                return (
                  <Card
                    key={order.id}
                    className={`!rounded-3xl shadow-sm transition-all overflow-hidden ${
                      isOverdue
                        ? '!bg-rose-50 !border-2 !border-rose-400 animate-pulse'
                        : '!bg-white !border !border-amber-200/90'
                    }`}
                    styles={{ body: { padding: '16px' } }}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <div>
                        <div className="font-black text-base text-slate-900">{order.orderNumber}</div>
                        <span className="text-xs text-orange-600 font-black">
                          {order.tableNumber || 'Takeaway'} ({order.orderType.replace('_', ' ')})
                        </span>
                      </div>

                      <div className="text-right">
                        <Tag color={isOverdue ? 'error' : 'warning'} className="!font-mono !font-bold !rounded-md">
                          <ClockCircleOutlined className="mr-1" /> {elapsed}m ago
                        </Tag>
                        <div className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">{order.source}</div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1.5 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-800">
                              <span className="text-orange-600 font-black mr-1.5">{item.quantity}x</span>{' '}
                              {item.name}
                            </span>
                          </div>
                          {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                            <p className="text-[11px] text-orange-600 pl-4 !m-0 font-semibold">
                              {item.selectedModifiers.map((m) => m.optionName).join(', ')}
                            </p>
                          )}
                          {item.specialInstructions && (
                            <p className="text-[11px] text-amber-800 italic pl-4 !m-0">
                              Note: {item.specialInstructions}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Waiter & Notes */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl mt-2 border border-slate-200">
                      <span>Server: <strong className="text-orange-600">{order.serverStaffName || 'Marco Rossi'}</strong></span>
                      <Tag color="orange" className="!m-0 !font-mono !text-[10px] !rounded-md font-bold">
                        {order.serverStaffId || 'W-101'}
                      </Tag>
                    </div>

                    {order.customerNotes && (
                      <div className="text-[11px] bg-amber-50 p-2 rounded-xl text-amber-900 italic mt-2 border border-amber-200">
                        &ldquo;{order.customerNotes}&rdquo;
                      </div>
                    )}

                    <Button
                      type="primary"
                      block
                      icon={<PlayCircleOutlined />}
                      onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      className="!mt-3 !h-9 !rounded-xl !bg-gradient-to-r !from-blue-600 !to-indigo-600 hover:!from-blue-700 !font-bold !shadow-md border-0 text-white"
                    >
                      Start Preparing
                    </Button>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: IN PREPARATION (Cobalt Blue RGB Theme) */}
        <div className="flex flex-col bg-blue-50/70 rounded-3xl border-2 border-blue-200 overflow-hidden shadow-sm">
          <div className="p-3.5 bg-blue-100/90 border-b border-blue-200 flex items-center justify-between">
            <span className="font-black text-sm text-blue-900 flex items-center gap-2">
              <Badge status="processing" color="#3b82f6" />
              2. COOKING ON LINE ({preparingOrders.length})
            </span>
            <Tag color="processing" className="!m-0 font-bold text-[11px] !rounded-md">In Kitchen</Tag>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {preparingOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-slate-400 font-bold italic">
                No orders currently cooking
              </div>
            ) : (
              preparingOrders.map((order) => {
                const elapsed = getElapsedMinutes(order.createdAt);
                const isOverdue = elapsed >= 20;

                return (
                  <Card
                    key={order.id}
                    className={`!rounded-3xl shadow-sm overflow-hidden ${
                      isOverdue
                        ? '!bg-rose-50 !border-2 !border-rose-400 animate-pulse'
                        : '!bg-white !border !border-blue-200/90'
                    }`}
                    styles={{ body: { padding: '16px' } }}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                      <div>
                        <div className="font-black text-base text-slate-900">{order.orderNumber}</div>
                        <span className="text-xs text-blue-600 font-black">
                          {order.tableNumber || 'Takeaway'}
                        </span>
                      </div>
                      <Tag color="processing" className="!font-mono !font-bold !rounded-md">
                        <ClockCircleOutlined className="mr-1" /> {elapsed}m
                      </Tag>
                    </div>

                    <div className="space-y-1.5 text-xs font-bold text-slate-800">
                      {order.items.map((item, idx) => (
                        <div key={idx}>
                          <span className="text-blue-600 font-black mr-1.5">{item.quantity}x</span>{' '}
                          {item.name}
                        </div>
                      ))}
                    </div>

                    {/* Waiter info */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl mt-2 border border-slate-200">
                      <span>Server: <strong className="text-blue-700">{order.serverStaffName || 'Marco Rossi'}</strong></span>
                      <Tag color="blue" className="!m-0 !font-mono !text-[10px] !rounded-md font-bold">
                        {order.serverStaffId || 'W-101'}
                      </Tag>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button
                        icon={<RollbackOutlined />}
                        onClick={() => handleUpdateStatus(order.id, 'pending')}
                        className="!rounded-xl !bg-slate-100 !border-slate-200 !text-slate-700 font-bold"
                      >
                        Back
                      </Button>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                        className="!rounded-xl !bg-gradient-to-r !from-emerald-600 !to-teal-600 hover:!from-emerald-700 !font-bold !shadow-md border-0 text-white"
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

        {/* COLUMN 3: READY FOR SERVING (Emerald Green RGB Theme) */}
        <div className="flex flex-col bg-emerald-50/70 rounded-3xl border-2 border-emerald-200 overflow-hidden shadow-sm">
          <div className="p-3.5 bg-emerald-100/90 border-b border-emerald-200 flex items-center justify-between">
            <span className="font-black text-sm text-emerald-900 flex items-center gap-2">
              <Badge status="success" color="#10b981" />
              3. READY FOR SERVER ({readyOrders.length})
            </span>
            <Tag color="success" className="!m-0 font-bold text-[11px] !rounded-md">Pass Table</Tag>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {readyOrders.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-xs text-slate-400 font-bold italic">
                No orders waiting for pickup
              </div>
            ) : (
              readyOrders.map((order) => (
                <Card
                  key={order.id}
                  className="!bg-white !border !border-emerald-200/90 !rounded-3xl shadow-sm overflow-hidden"
                  styles={{ body: { padding: '16px' } }}
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <div>
                      <div className="font-black text-base text-slate-900">{order.orderNumber}</div>
                      <span className="text-xs text-emerald-700 font-black">
                        {order.tableNumber || 'Takeaway'}
                      </span>
                    </div>
                    <Tag color="success" className="!font-bold !rounded-md">
                      Ready to Serve
                    </Tag>
                  </div>

                  <div className="space-y-1 text-xs text-slate-800 font-bold">
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        <span className="font-black text-emerald-700 mr-1.5">{item.quantity}x</span>{' '}
                        {item.name}
                      </div>
                    ))}
                  </div>

                  {/* Waiter info */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl mt-2 border border-slate-200">
                    <span>Server: <strong className="text-emerald-700">{order.serverStaffName || 'Marco Rossi'}</strong></span>
                    <Tag color="success" className="!m-0 !font-mono !text-[10px] !rounded-md font-bold">
                      {order.serverStaffId || 'W-101'}
                    </Tag>
                  </div>

                  <Button
                    block
                    icon={<CheckCircleOutlined className="text-emerald-600" />}
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                    className="!mt-3 !h-9 !rounded-xl !bg-slate-100 hover:!bg-slate-200 !border-slate-200 !text-slate-800 !font-bold"
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

