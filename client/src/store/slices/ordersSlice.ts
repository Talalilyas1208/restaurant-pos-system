import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order, OrderStatus } from '../../types';

export interface OrdersState {
  orders: Order[];
  activePlacedOrder: Order | null;
  isSyncing: boolean;
  lastSyncError: string | null;
  syncQueue: Order[];
}

const initialState: OrdersState = {
  orders: [],
  activePlacedOrder: null,
  isSyncing: false,
  lastSyncError: null,
  syncQueue: [],
};

export const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    // Instant optimistic order placement into Redux & localStorage
    placeOrderOptimistic: (state, action: PayloadAction<Order>) => {
      const newOrder = action.payload;
      // Prepend to orders list
      state.orders.unshift(newOrder);
      // Keep only most recent 50 orders in local cache to prevent storage bloat
      if (state.orders.length > 50) {
        state.orders = state.orders.slice(0, 50);
      }
      state.activePlacedOrder = newOrder;
      state.syncQueue.push(newOrder);
      state.isSyncing = true;
      state.lastSyncError = null;
    },

    // When backend successfully confirms and persists the order
    syncOrderSuccess: (
      state,
      action: PayloadAction<{ tempId: string; serverOrder: Order }>
    ) => {
      const { tempId, serverOrder } = action.payload;

      // Update in orders list
      const index = state.orders.findIndex((o) => o.id === tempId);
      if (index !== -1) {
        state.orders[index] = serverOrder;
      } else if (!state.orders.some((o) => o.id === serverOrder.id)) {
        state.orders.unshift(serverOrder);
      }

      // Update active order if matched
      if (state.activePlacedOrder && (state.activePlacedOrder.id === tempId || state.activePlacedOrder.id === serverOrder.id)) {
        state.activePlacedOrder = serverOrder;
      }

      // Remove from sync queue
      state.syncQueue = state.syncQueue.filter((o) => o.id !== tempId && o.id !== serverOrder.id);
      state.isSyncing = state.syncQueue.length > 0;
      state.lastSyncError = null;
    },

    // Background sync failure (offline resilience)
    syncOrderFailure: (
      state,
      action: PayloadAction<{ orderId: string; error: string }>
    ) => {
      state.lastSyncError = action.payload.error;
      state.isSyncing = false;
    },

    // Real-time status update for KDS / Kitchen line
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: string; status: OrderStatus }>
    ) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
      }
      if (state.activePlacedOrder && state.activePlacedOrder.id === orderId) {
        state.activePlacedOrder.status = status;
        state.activePlacedOrder.updatedAt = new Date().toISOString();
      }
    },

    // Update active placed order directly
    setActivePlacedOrder: (state, action: PayloadAction<Order | null>) => {
      state.activePlacedOrder = action.payload;
    },

    // Clear active order
    clearActiveOrder: (state) => {
      state.activePlacedOrder = null;
    },

    // Mass-set orders from server query
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
  },
});

export const {
  placeOrderOptimistic,
  syncOrderSuccess,
  syncOrderFailure,
  updateOrderStatus,
  setActivePlacedOrder,
  clearActiveOrder,
  setOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;
