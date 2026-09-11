import { getSupabaseClient } from '../config/supabase.js';
import { Order, Payment } from '../types/index.js';
import { cache } from './cache.js';
import { mapOrder } from './mappers.js';
import { diskStorage } from './disk-storage.service.js';
import { tableService } from './table.service.js';
import { orderService, fallbackOrders, fallbackPayments } from './order.service.js';
import { checkoutOrderInternal } from './checkout.service.js';

class PaymentService {
  async checkoutOrder(
    orderData: Partial<Order>,
    paymentData: {
      hotelId?: string;
      paymentMethod: string;
      amount: number;
      tenderedAmount?: number;
      changeDue?: number;
      transactionRef?: string;
      roomNumber?: string;
      guestName?: string;
      processedBy?: string;
    }
  ): Promise<{ order: Order; payment: Payment }> {
    return checkoutOrderInternal(orderData, paymentData);
  }

  async processPayment(
    paymentData: Omit<Payment, 'id' | 'createdAt'>,
  ): Promise<{ payment: Payment; order: Order }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: paymentRow, error: paymentError } = await supabase
          .from('payments')
          .insert({
            order_id: paymentData.orderId,
            hotel_id: paymentData.hotelId,
            payment_method: paymentData.paymentMethod,
            amount: paymentData.amount,
            tendered_amount: paymentData.tenderedAmount ?? null,
            change_due: paymentData.changeDue ?? 0,
            transaction_ref: paymentData.transactionRef ?? null,
            status: paymentData.status,
            room_number: paymentData.roomNumber ?? null,
            guest_name: paymentData.guestName ?? null,
            processed_by: paymentData.processedBy ?? null,
          })
          .select().single();

        if (!paymentError && paymentRow) {
          const { data: updatedOrderRow } = await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'completed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', paymentData.orderId)
            .select('*, order_items(*)')
            .single();

          if (updatedOrderRow) {
            const payment: Payment = {
              id: paymentRow.id,
              orderId: paymentRow.order_id,
              hotelId: paymentRow.hotel_id,
              paymentMethod: paymentRow.payment_method,
              amount: parseFloat(paymentRow.amount),
              tenderedAmount: paymentRow.tendered_amount != null ? parseFloat(paymentRow.tendered_amount) : undefined,
              changeDue: paymentRow.change_due != null ? parseFloat(paymentRow.change_due) : undefined,
              transactionRef: paymentRow.transaction_ref ?? undefined,
              status: paymentRow.status,
              roomNumber: paymentRow.room_number ?? undefined,
              guestName: paymentRow.guest_name ?? undefined,
              processedBy: paymentRow.processed_by ?? undefined,
              createdAt: paymentRow.created_at,
            };

            const order = mapOrder(updatedOrderRow);
            if (order.tableId) {
              await tableService.updateTableStatus(order.tableId, 'available', null);
            }

            cache.invalidate('orders:');
            cache.invalidate(`order:${paymentData.orderId}`);
            cache.invalidate('analytics');
            return { payment, order };
          }
        }
      } catch (err: any) {
        console.warn('⚠️  processPayment (Supabase):', err?.message || err);
      }
    }

    // Fallback in-memory
    const payment: Payment = {
      id: `pay-${Date.now()}`,
      orderId: paymentData.orderId,
      hotelId: paymentData.hotelId,
      paymentMethod: paymentData.paymentMethod,
      amount: paymentData.amount,
      tenderedAmount: paymentData.tenderedAmount,
      changeDue: paymentData.changeDue,
      transactionRef: paymentData.transactionRef,
      status: paymentData.status,
      roomNumber: paymentData.roomNumber,
      guestName: paymentData.guestName,
      processedBy: paymentData.processedBy,
      createdAt: new Date().toISOString(),
    };

    let targetOrder: Order | null | undefined = fallbackOrders.find((o) => o.id === paymentData.orderId);
    if (targetOrder) {
      const prevPaid = targetOrder.amountPaid || 0;
      const totalPaid = parseFloat((prevPaid + paymentData.amount).toFixed(2));
      const balanceRemaining = Math.max(0, parseFloat((targetOrder.total - totalPaid).toFixed(2)));

      targetOrder.amountPaid = totalPaid;
      targetOrder.balanceRemaining = balanceRemaining;
      targetOrder.version = (targetOrder.version || 1) + 1;
      targetOrder.updatedAt = new Date().toISOString();

      if (balanceRemaining <= 0.01) {
        targetOrder.paymentStatus = 'paid';
        targetOrder.status = 'completed';
        if (targetOrder.tableId) {
          await tableService.updateTableStatus(targetOrder.tableId, 'available', null);
        }
      } else {
        targetOrder.paymentStatus = 'partially_paid';
      }
      diskStorage.updateOrders(fallbackOrders);
    } else {
      targetOrder = await orderService.updateOrderStatus(paymentData.orderId, 'completed');
      if (targetOrder) targetOrder.paymentStatus = 'paid';
    }

    fallbackPayments.push(payment);
    diskStorage.addPayment(payment);

    cache.invalidate('orders:');
    cache.invalidate('analytics');
    return { payment, order: targetOrder || fallbackOrders[0] };
  }
}

export const paymentService = new PaymentService();

