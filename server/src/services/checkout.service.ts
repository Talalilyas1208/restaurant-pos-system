import { getSupabaseClient } from '../config/supabase.js';
import { Order, Payment } from '../types/index.js';
import { cache, TTL } from './cache.js';
import { diskStorage } from './disk-storage.service.js';
import { hotelService } from './hotel.service.js';
import { tableService } from './table.service.js';
import { fallbackOrders, fallbackPayments } from './order.service.js';

export async function checkoutOrderInternal(
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
  const hotel = await hotelService.getHotel();
  const subtotal = orderData.subtotal ?? (orderData.items || []).reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = orderData.tax ?? parseFloat(((subtotal * hotel.taxRate) / 100).toFixed(2));
  const serviceCharge = orderData.serviceCharge ?? parseFloat(((subtotal * hotel.serviceChargeRate) / 100).toFixed(2));
  const discountAmount = orderData.discountAmount || 0;
  const total = orderData.total ?? parseFloat((subtotal + tax + serviceCharge - discountAmount).toFixed(2));
  const orderNumber = orderData.orderNumber || `#POS-${Math.floor(1000 + Math.random() * 9000)}`;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert({
          hotel_id: orderData.hotelId || hotel.id,
          table_id: orderData.tableId ?? null,
          order_number: orderNumber,
          order_type: orderData.orderType || 'dine_in',
          source: orderData.source || 'pos',
          status: 'completed',
          customer_name: orderData.customerName || 'Guest',
          customer_phone: orderData.customerPhone ?? null,
          customer_notes: orderData.customerNotes ?? null,
          subtotal, tax, service_charge: serviceCharge, discount_amount: discountAmount, total,
          payment_status: 'paid',
          server_staff_id: orderData.serverStaffId ?? null,
          server_staff_name: orderData.serverStaffName ?? null,
        })
        .select().single();

      if (!orderError && orderRow) {
        const itemRows = (orderData.items || []).map((item) => ({
          order_id: orderRow.id,
          menu_item_id: item.menuItemId ?? null,
          name: item.name,
          unit_price: item.unitPrice ?? 0,
          quantity: item.quantity ?? 1,
          total_price: item.totalPrice ?? (item.unitPrice ?? 0) * (item.quantity ?? 1),
          selected_modifiers: item.selectedModifiers ?? [],
          special_instructions: item.specialInstructions ?? null,
          status: 'completed',
        }));

        const { data: paymentRow } = await supabase
          .from('payments')
          .insert({
            order_id: orderRow.id,
            hotel_id: paymentData.hotelId || hotel.id,
            payment_method: paymentData.paymentMethod,
            amount: paymentData.amount,
            tendered_amount: paymentData.tenderedAmount ?? null,
            change_due: paymentData.changeDue ?? 0,
            transaction_ref: paymentData.transactionRef ?? null,
            status: 'completed',
            room_number: paymentData.roomNumber ?? null,
            guest_name: paymentData.guestName ?? null,
            processed_by: paymentData.processedBy ?? null,
          })
          .select().single();

        if (itemRows.length > 0) {
          try {
            await supabase.from('order_items').insert(itemRows);
          } catch (err: any) {
            console.warn('⚠️ order_items checkout insert:', err?.message || err);
          }
        }

        if (orderRow.table_id) {
          tableService.updateTableStatus(orderRow.table_id, 'available', null).catch(() => {});
        }

        cache.invalidate('orders:');
        cache.invalidate('analytics');

        const order: Order = {
          id: orderRow.id, hotelId: orderRow.hotel_id, tableId: orderRow.table_id ?? undefined,
          tableNumber: orderData.tableNumber, orderNumber: orderRow.order_number, orderType: orderRow.order_type,
          source: orderRow.source, status: 'completed', customerName: orderRow.customer_name,
          customerPhone: orderRow.customer_phone ?? undefined, customerNotes: orderRow.customer_notes ?? undefined,
          items: (orderData.items || []).map((i, idx) => ({
            id: `oi-${orderRow.id}-${idx}`, orderId: orderRow.id, menuItemId: i.menuItemId,
            name: i.name, unitPrice: i.unitPrice ?? 0, quantity: i.quantity ?? 1,
            totalPrice: i.totalPrice ?? (i.unitPrice ?? 0) * (i.quantity ?? 1),
            selectedModifiers: i.selectedModifiers, specialInstructions: i.specialInstructions, status: 'served' as const,
          })),
          subtotal, tax, serviceCharge, discountAmount, total, paymentStatus: 'paid',
          serverStaffId: orderRow.server_staff_id ?? undefined, serverStaffName: orderRow.server_staff_name ?? undefined,
          createdAt: orderRow.created_at, updatedAt: orderRow.updated_at,
        };

        const payment: Payment = {
          id: paymentRow?.id || `pay-${Date.now()}`, orderId: orderRow.id, hotelId: paymentRow?.hotel_id || hotel.id,
          paymentMethod: (paymentRow?.payment_method as any) || paymentData.paymentMethod,
          amount: paymentRow?.amount ? parseFloat(paymentRow.amount) : paymentData.amount,
          tenderedAmount: paymentData.tenderedAmount, changeDue: paymentData.changeDue,
          transactionRef: paymentData.transactionRef, status: 'completed',
          roomNumber: paymentData.roomNumber, guestName: paymentData.guestName,
          processedBy: paymentData.processedBy, createdAt: paymentRow?.created_at || new Date().toISOString(),
        };

        cache.set(`order:${orderRow.id}`, order, TTL.ORDERS);
        return { order, payment };
      }
    } catch (err: any) {
      console.warn('⚠️  checkoutOrder (Supabase):', err?.message || err);
    }
  }

  // Fallback in-memory
  const newId = `ord-${Date.now()}`;
  const newOrder: Order = {
    id: newId,
    hotelId: orderData.hotelId || hotel.id,
    tableId: orderData.tableId,
    tableNumber: orderData.tableNumber,
    orderNumber,
    orderType: orderData.orderType || 'dine_in',
    source: orderData.source || 'pos',
    status: 'completed',
    customerName: orderData.customerName || 'Guest',
    customerPhone: orderData.customerPhone,
    customerNotes: orderData.customerNotes,
    serverStaffId: orderData.serverStaffId || 'W-101',
    serverStaffName: orderData.serverStaffName || 'Marco Rossi',
    items: (orderData.items || []).map((i, idx) => ({
      id: `oi-${Date.now()}-${idx}`,
      orderId: newId,
      menuItemId: i.menuItemId,
      name: i.name,
      unitPrice: i.unitPrice ?? 0,
      quantity: i.quantity ?? 1,
      totalPrice: i.totalPrice ?? (i.unitPrice ?? 0) * (i.quantity ?? 1),
      selectedModifiers: i.selectedModifiers,
      specialInstructions: i.specialInstructions,
      status: 'served' as const,
    })),
    subtotal, tax, serviceCharge, discountAmount, total,
    paymentStatus: 'paid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  fallbackOrders.unshift(newOrder);
  diskStorage.updateOrders(fallbackOrders);

  const payment: Payment = {
    id: `pay-${Date.now()}`,
    orderId: newId,
    hotelId: paymentData.hotelId || hotel.id,
    paymentMethod: paymentData.paymentMethod as any,
    amount: paymentData.amount,
    tenderedAmount: paymentData.tenderedAmount,
    changeDue: paymentData.changeDue,
    transactionRef: paymentData.transactionRef,
    status: 'completed',
    roomNumber: paymentData.roomNumber,
    guestName: paymentData.guestName,
    processedBy: paymentData.processedBy,
    createdAt: new Date().toISOString(),
  };
  fallbackPayments.push(payment);
  diskStorage.addPayment(payment);

  return { order: newOrder, payment };
}
