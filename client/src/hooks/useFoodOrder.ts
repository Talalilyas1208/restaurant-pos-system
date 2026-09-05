'use client';

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useAppDispatch, useAppSelector } from '../store';
import {
  placeOrderOptimistic,
  syncOrderSuccess,
  syncOrderFailure,
  updateOrderStatus,
  clearActiveOrder,
} from '../store/slices/ordersSlice';
import { Order, OrderItem, PaymentMethod, PaymentStatus } from '../types';
import { api } from '../lib/api';

export interface PlaceFoodOrderParams {
  hotelId: string;
  tableId?: string;
  tableNumber: string;
  orderType?: 'dine_in' | 'room_service' | 'takeaway' | 'delivery';
  source?: 'pos' | 'qr_customer' | 'kiosk';
  customerName: string;
  customerPhone?: string;
  customerNotes?: string;
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  serviceCharge?: number;
  discountAmount?: number;
  total: number;
  paymentMethod: 'cash' | 'credit_card' | 'easypaisa' | 'jazzcash';
  paymentDetails?: {
    senderMobile?: string;
    transactionRef?: string;
    cardholderName?: string;
    cardLast4?: string;
  };
}

export function useFoodOrder() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // Redux cached state (persisted across browser reloads)
  const activePlacedOrder = useAppSelector((state) => state.orders.activePlacedOrder);
  const allCachedOrders = useAppSelector((state) => state.orders.orders);
  const isSyncing = useAppSelector((state) => state.orders.isSyncing);
  const lastSyncError = useAppSelector((state) => state.orders.lastSyncError);

  // Background mutation to sync with remote API
  const syncOrderMutation = useMutation({
    mutationFn: (orderPayload: Partial<Order>) => api.createOrder(orderPayload),
    onSuccess: (serverOrder, variables) => {
      const tempId = (variables as any)?._tempId;
      if (tempId) {
        dispatch(syncOrderSuccess({ tempId, serverOrder }));
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (err: any, variables) => {
      const tempId = (variables as any)?._tempId || 'temp';
      console.warn('[useFoodOrder] Background sync deferred (saved in persistent cache):', err?.message || err);
      dispatch(syncOrderFailure({ orderId: tempId, error: err?.message || 'Network sync deferred' }));
    },
  });

  /**
   * High-speed instant order submission:
   * 1. Validates via middleware
   * 2. Writes to Redux Toolkit cache & localStorage via Redux Persist (< 5ms)
   * 3. Syncs with backend API in background asynchronously
   */
  const placeFoodOrder = useCallback(
    async (params: PlaceFoodOrderParams): Promise<Order> => {
      const tempId = `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const generatedOrderNumber = `#POS-${Math.floor(1000 + Math.random() * 9000)}`;

      // Payment status determination: cash is unpaid until collected; online payments marked paid
      const paymentStatus: PaymentStatus = params.paymentMethod === 'cash' ? 'unpaid' : 'paid';

      // Assemble human-readable payment attribution notes
      let paymentSummary = '';
      if (params.paymentMethod === 'cash') {
        paymentSummary = '[Payment: Cash on Delivery / Counter]';
      } else if (params.paymentMethod === 'credit_card') {
        paymentSummary = `[Payment: Online Card • Ending ${params.paymentDetails?.cardLast4 || '4242'} | Holder: ${params.paymentDetails?.cardholderName || params.customerName}]`;
      } else if (params.paymentMethod === 'easypaisa') {
        paymentSummary = `[Payment: Easypaisa | Mobile: ${params.paymentDetails?.senderMobile || '03XX-XXXXXXX'} | TID: ${params.paymentDetails?.transactionRef || 'EP-PAID'}]`;
      } else if (params.paymentMethod === 'jazzcash') {
        paymentSummary = `[Payment: JazzCash | Mobile: ${params.paymentDetails?.senderMobile || '03XX-XXXXXXX'} | TID: ${params.paymentDetails?.transactionRef || 'JC-PAID'}]`;
      }

      const combinedNotes = [params.customerNotes, paymentSummary].filter(Boolean).join(' • ');

      const optimisticOrder: Order = {
        id: tempId,
        hotelId: params.hotelId,
        tableId: params.tableId,
        tableNumber: params.tableNumber,
        orderNumber: generatedOrderNumber,
        orderType: params.orderType || 'dine_in',
        source: params.source || 'qr_customer',
        status: 'pending',
        customerName: params.customerName || 'Table Guest',
        customerPhone: params.customerPhone,
        customerNotes: combinedNotes,
        items: params.items.map((it, idx) => ({
          ...it,
          id: it.id || `oi-${Date.now()}-${idx}`,
          status: 'pending' as const,
        })),
        subtotal: params.subtotal,
        tax: params.tax || 0,
        serviceCharge: params.serviceCharge || 0,
        discountAmount: params.discountAmount || 0,
        total: params.total,
        paymentStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 1. Instant Cache Write (Triggering orderValidationMiddleware)
      dispatch(placeOrderOptimistic(optimisticOrder));
      message.success({ content: 'Order sent to the kitchen line!', duration: 2 });

      // 2. Non-blocking Background API Sync
      const apiPayload: any = {
        _tempId: tempId,
        hotelId: params.hotelId,
        tableId: params.tableId,
        tableNumber: params.tableNumber,
        orderNumber: generatedOrderNumber,
        orderType: params.orderType || 'dine_in',
        source: params.source || 'qr_customer',
        customerName: params.customerName || 'Table Guest',
        customerPhone: params.customerPhone,
        customerNotes: combinedNotes,
        subtotal: params.subtotal,
        tax: params.tax || 0,
        serviceCharge: params.serviceCharge || 0,
        discountAmount: params.discountAmount || 0,
        total: params.total,
        paymentStatus,
        items: params.items.map((it) => ({
          menuItemId: it.menuItemId,
          name: it.name,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          totalPrice: it.totalPrice,
          selectedModifiers: it.selectedModifiers,
          specialInstructions: it.specialInstructions,
        })),
      };

      syncOrderMutation.mutate(apiPayload);

      return optimisticOrder;
    },
    [dispatch, syncOrderMutation]
  );

  const resetActiveOrder = useCallback(() => {
    dispatch(clearActiveOrder());
  }, [dispatch]);

  const updateStatus = useCallback(
    (orderId: string, status: any) => {
      dispatch(updateOrderStatus({ orderId, status }));
    },
    [dispatch]
  );

  return {
    activePlacedOrder,
    allCachedOrders,
    isSyncing,
    lastSyncError,
    placeFoodOrder,
    resetActiveOrder,
    updateStatus,
  };
}
