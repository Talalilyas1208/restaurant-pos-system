import { io, Socket } from 'socket.io-client';
import { Order, DiningTable } from '@/types';

let socket: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
  'http://localhost:5001';

export function getSocket(role: string = 'pos', tableId?: string): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  if (typeof window === 'undefined') {
    // SSR safe no-op
    return null as unknown as Socket;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      query: {
        role,
        ...(tableId ? { tableId } : {}),
      },
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to real-time WebSocket server:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ WebSocket connection notice:', err.message);
    });
  }

  return socket;
}

export function subscribeToOrders(
  onOrderCreated?: (order: Order) => void,
  onOrderStatusUpdated?: (order: Order) => void
): () => void {
  const s = getSocket('kds');
  if (!s) return () => {};

  if (onOrderCreated) {
    s.on('order:created', onOrderCreated);
  }
  if (onOrderStatusUpdated) {
    s.on('order:status_updated', onOrderStatusUpdated);
  }

  return () => {
    if (onOrderCreated) s.off('order:created', onOrderCreated);
    if (onOrderStatusUpdated) s.off('order:status_updated', onOrderStatusUpdated);
  };
}

export function subscribeToTables(onTableUpdated: (table: DiningTable) => void): () => void {
  const s = getSocket('pos');
  if (!s) return () => {};

  s.on('table:updated', onTableUpdated);

  return () => {
    s.off('table:updated', onTableUpdated);
  };
}
