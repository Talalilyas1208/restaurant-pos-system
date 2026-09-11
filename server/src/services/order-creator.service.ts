import { getSupabaseClient } from '../config/supabase.js';
import { Order, OrderItem } from '../types/index.js';
import { cache, TTL } from './cache.js';
import { diskStorage } from './disk-storage.service.js';
import { hotelService } from './hotel.service.js';
import { tableService } from './table.service.js';
import { fallbackOrders } from './order.service.js';

export async function createOrderInternal(orderData: Partial<Order>): Promise<Order> {
  const hotel = await hotelService.getHotel();
  const subtotal = (orderData.items || []).reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = parseFloat(((subtotal * hotel.taxRate) / 100).toFixed(2));
  const serviceCharge = parseFloat(((subtotal * hotel.serviceChargeRate) / 100).toFixed(2));
  const discountAmount = orderData.discountAmount || 0;
  const total = parseFloat((subtotal + tax + serviceCharge - discountAmount).toFixed(2));
  const orderNumber = orderData.orderNumber || `#POS-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowIso = new Date().toISOString();

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
          status: 'pending',
          customer_name: orderData.customerName || 'Guest',
          customer_phone: orderData.customerPhone ?? null,
          customer_notes: orderData.customerNotes ?? null,
          subtotal,
          tax,
          service_charge: serviceCharge,
          discount_amount: discountAmount,
          total,
          payment_status: 'unpaid',
          server_staff_id: orderData.serverStaffId ?? null,
          server_staff_name: orderData.serverStaffName ?? null,
        })
        .select()
        .single();

      if (!orderError && orderRow) {
        const items = orderData.items || [];
        if (items.length > 0) {
          const itemRows = items.map((item) => ({
            order_id: orderRow.id,
            menu_item_id: item.menuItemId ?? null,
            name: item.name,
            unit_price: item.unitPrice ?? 0,
            quantity: item.quantity ?? 1,
            total_price: item.totalPrice ?? (item.unitPrice ?? 0) * (item.quantity ?? 1),
            selected_modifiers: item.selectedModifiers ?? [],
            special_instructions: item.specialInstructions ?? null,
            status: 'pending',
          }));
          try {
            await supabase.from('order_items').insert(itemRows);
          } catch (err: any) {
            console.warn('⚠️ order_items insert:', err?.message || err);
          }
        }

        if (orderRow.table_id) {
          tableService.updateTableStatus(orderRow.table_id, 'occupied', orderRow.id).catch(() => {});
        }

        cache.invalidate('orders:');
        cache.invalidate('analytics');

        const mappedItems: OrderItem[] = items.map((i, idx) => ({
          id: `oi-${orderRow.id}-${idx}`,
          orderId: orderRow.id,
          menuItemId: i.menuItemId,
          name: i.name,
          unitPrice: i.unitPrice ?? 0,
          quantity: i.quantity ?? 1,
          totalPrice: i.totalPrice ?? (i.unitPrice ?? 0) * (i.quantity ?? 1),
          selectedModifiers: i.selectedModifiers,
          specialInstructions: i.specialInstructions,
          status: 'pending',
        }));

        const createdOrder: Order = {
          id: orderRow.id,
          hotelId: orderRow.hotel_id,
          tableId: orderRow.table_id ?? undefined,
          tableNumber: orderData.tableNumber,
          orderNumber: orderRow.order_number,
          orderType: orderRow.order_type,
          source: orderRow.source,
          status: orderRow.status,
          customerName: orderRow.customer_name,
          customerPhone: orderRow.customer_phone ?? undefined,
          customerNotes: orderRow.customer_notes ?? undefined,
          items: mappedItems,
          subtotal,
          tax,
          serviceCharge,
          discountAmount,
          total,
          paymentStatus: orderRow.payment_status,
          amountPaid: 0,
          balanceRemaining: total,
          version: 1,
          idempotencyKey: orderData.idempotencyKey,
          kotRounds: [{ roundNumber: 1, createdAt: nowIso, items: mappedItems }],
          serverStaffId: orderRow.server_staff_id ?? undefined,
          serverStaffName: orderRow.server_staff_name ?? undefined,
          createdAt: orderRow.created_at,
          updatedAt: orderRow.updated_at,
        };

        cache.set(`order:${orderRow.id}`, createdOrder, TTL.ORDERS);
        return createdOrder;
      }
    } catch (err: any) {
      console.warn('⚠️  createOrder (Supabase):', err?.message || err);
    }
  }

  // Fallback in-memory
  const newId = `ord-${Date.now()}`;
  const mappedItems: OrderItem[] = (orderData.items || []).map((i, idx) => ({
    id: `oi-${Date.now()}-${idx}`,
    orderId: newId,
    menuItemId: i.menuItemId,
    name: i.name,
    unitPrice: i.unitPrice ?? 0,
    quantity: i.quantity ?? 1,
    totalPrice: i.totalPrice ?? (i.unitPrice ?? 0) * (i.quantity ?? 1),
    selectedModifiers: i.selectedModifiers,
    specialInstructions: i.specialInstructions,
    status: 'pending',
  }));

  const newOrder: Order = {
    id: newId,
    hotelId: orderData.hotelId || hotel.id,
    tableId: orderData.tableId,
    tableNumber: orderData.tableNumber,
    orderNumber,
    orderType: orderData.orderType || 'dine_in',
    source: orderData.source || 'pos',
    status: 'pending',
    customerName: orderData.customerName || 'Guest',
    customerPhone: orderData.customerPhone,
    customerNotes: orderData.customerNotes,
    serverStaffId: orderData.serverStaffId || 'W-101',
    serverStaffName: orderData.serverStaffName || 'Marco Rossi',
    items: mappedItems,
    subtotal, tax, serviceCharge, discountAmount, total,
    paymentStatus: 'unpaid',
    amountPaid: 0,
    balanceRemaining: total,
    version: 1,
    idempotencyKey: orderData.idempotencyKey,
    kotRounds: [{ roundNumber: 1, createdAt: nowIso, items: mappedItems }],
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  fallbackOrders.unshift(newOrder);
  if (newOrder.tableId) {
    await tableService.updateTableStatus(newOrder.tableId, 'occupied', newId);
  }
  diskStorage.updateOrders(fallbackOrders);
  cache.invalidate('orders:');
  cache.invalidate('analytics');
  return newOrder;
}
