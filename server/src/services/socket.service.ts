import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Order, DiningTable } from '../types/index.js';
import { config } from '../config/index.js';

let io: Server | null = null;

export interface SocketEvents {
  'order:created': (order: Order) => void;
  'order:status_updated': (order: Order) => void;
  'table:updated': (table: DiningTable) => void;
  'item:status_updated': (data: { orderId: string; itemId: string; status: string }) => void;
}

export function initSocketService(httpServer: HttpServer): Server {
  const allowedOrigins = config.corsOrigin && config.corsOrigin !== '*'
    ? config.corsOrigin.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3002', 'http://127.0.0.1:3002'];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (config.nodeEnv === 'development' || !allowedOrigins || allowedOrigins.includes('*')) {
          return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.on('connection', (socket: Socket) => {
    const role = (socket.handshake.query.role as string) || 'guest';

    if (role === 'kitchen' || role === 'kds') {
      socket.join('room:kds');
    } else if (role === 'pos' || role === 'cashier' || role === 'admin') {
      socket.join('room:pos');
    }

    const tableId = socket.handshake.query.tableId as string;
    if (tableId) {
      socket.join(`table:${tableId}`);
    }

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  console.log('⚡ Socket.io real-time engine initialized.');
  return io;
}

export function getIO(): Server | null {
  return io;
}

export function notifyOrderCreated(order: Order): void {
  if (!io) return;
  io.emit('order:created', order);
}

export function notifyOrderStatusUpdated(order: Order): void {
  if (!io) return;
  io.emit('order:status_updated', order);
  if (order.tableId) {
    io.to(`table:${order.tableId}`).emit('order:status_updated', order);
  }
}

export function notifyTableUpdated(table: DiningTable): void {
  if (!io) return;
  io.emit('table:updated', table);
}

export function notifyItemStatusUpdated(orderId: string, itemId: string, status: string): void {
  if (!io) return;
  io.emit('item:status_updated', { orderId, itemId, status });
}
