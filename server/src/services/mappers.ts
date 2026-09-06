import {
  Hotel, DiningTable, Category, MenuItem, OrderItem, Order, StaffUser, TableStatus, OrderStatus,
} from '../types/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapHotel(row: any): Hotel {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    currency: row.currency,
    currencySymbol: row.currency_symbol,
    taxRate: parseFloat(row.tax_rate) || 8.5,
    serviceChargeRate: parseFloat(row.service_charge_rate) || 5.0,
    address: row.address ?? undefined,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapTable(row: any): DiningTable {
  return {
    id: row.id,
    hotelId: row.hotel_id,
    tableNumber: row.table_number,
    section: row.section,
    capacity: row.capacity,
    qrCodeToken: row.qr_code_token,
    status: row.status as TableStatus,
    activeOrderId: row.active_order_id ?? null,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCategory(row: any): Category {
  return {
    id: row.id,
    hotelId: row.hotel_id,
    name: row.name,
    description: row.description ?? undefined,
    icon: row.icon ?? undefined,
    imageUrl: row.image_url ?? undefined,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapMenuItem(row: any): MenuItem {
  return {
    id: row.id,
    hotelId: row.hotel_id,
    categoryId: row.category_id,
    name: row.name,
    description: row.description ?? undefined,
    price: parseFloat(row.price),
    costPrice: row.cost_price != null ? parseFloat(row.cost_price) : undefined,
    imageUrl: row.image_url ?? undefined,
    isAvailable: row.is_available,
    isVeg: row.is_veg,
    isVegan: row.is_vegan,
    isGlutenFree: row.is_gluten_free,
    isSpicy: row.is_spicy,
    isChefSpecial: row.is_chef_special,
    preparationTime: row.preparation_time ?? 15,
    calories: row.calories ?? undefined,
    allergens: Array.isArray(row.allergens) ? row.allergens : [],
    modifiers: Array.isArray(row.item_modifiers)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? row.item_modifiers.map((m: any) => ({
          id: m.id,
          menuItemId: m.menu_item_id,
          name: m.name,
          isRequired: m.is_required,
          minSelection: m.min_selection,
          maxSelection: m.max_selection,
          options: typeof m.options === 'string' ? JSON.parse(m.options) : m.options,
        }))
      : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapOrderItem(row: any): OrderItem {
  return {
    id: row.id,
    orderId: row.order_id,
    menuItemId: row.menu_item_id ?? undefined,
    name: row.name,
    unitPrice: parseFloat(row.unit_price),
    quantity: row.quantity,
    totalPrice: parseFloat(row.total_price),
    selectedModifiers: row.selected_modifiers ?? undefined,
    specialInstructions: row.special_instructions ?? undefined,
    status: row.status,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapOrder(row: any): Order {
  return {
    id: row.id,
    hotelId: row.hotel_id,
    tableId: row.table_id ?? undefined,
    tableNumber: row.table_number ?? undefined,
    orderNumber: row.order_number,
    orderType: row.order_type,
    source: row.source,
    status: row.status as OrderStatus,
    customerName: row.customer_name,
    customerPhone: row.customer_phone ?? undefined,
    customerNotes: row.customer_notes ?? undefined,
    items: Array.isArray(row.order_items) ? row.order_items.map(mapOrderItem) : [],
    subtotal: parseFloat(row.subtotal),
    tax: parseFloat(row.tax),
    serviceCharge: parseFloat(row.service_charge),
    discountAmount: parseFloat(row.discount_amount),
    total: parseFloat(row.total),
    paymentStatus: row.payment_status,
    serverStaffId: row.server_staff_id ?? undefined,
    serverStaffName: row.server_staff_name ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapStaffUser(row: any): StaffUser {
  return {
    id: row.id,
    hotelId: row.hotel_id,
    name: row.name,
    email: row.email ?? undefined,
    role: row.role,
    pinCode: row.pin_code,
    isActive: row.is_active,
    createdAt: row.created_at ?? undefined,
  };
}
