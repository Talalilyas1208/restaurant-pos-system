import { z } from 'zod';

export const orderItemModifierSchema = z.object({
  groupName: z.string().optional().default(''),
  optionName: z.string().optional().default(''),
  price: z.number().min(0).optional().default(0),
  name: z.string().optional(),
});

export const orderItemSchema = z.object({
  menuItemId: z.string().optional(),
  name: z.string().min(1).max(200),
  unitPrice: z.number().min(0).optional(),
  quantity: z.number().int().positive().default(1),
  totalPrice: z.number().min(0).optional(),
  selectedModifiers: z.array(z.any()).optional(),
  specialInstructions: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  hotelId: z.string().optional(),
  tableId: z.string().optional(),
  tableNumber: z.string().optional(),
  orderType: z.enum(['dine_in', 'room_service', 'takeaway', 'delivery']).default('dine_in'),
  source: z.enum(['pos', 'qr_customer', 'kiosk']).default('pos'),
  customerName: z.string().max(100).optional().default('Guest'),
  customerPhone: z.string().max(50).optional(),
  customerNotes: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  subtotal: z.number().min(0).optional(),
  tax: z.number().min(0).optional().default(0),
  serviceCharge: z.number().min(0).optional().default(0),
  discountAmount: z.number().min(0).optional().default(0),
  total: z.number().min(0).optional(),
  serverStaffId: z.string().optional(),
  serverStaffName: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled']),
});

export const processPaymentSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  hotelId: z.string().optional(),
  paymentMethod: z.string().default('cash'),
  amount: z.number().min(0, 'Payment amount must be non-negative'),
  tenderedAmount: z.number().min(0).optional(),
  changeDue: z.number().min(0).optional(),
  transactionRef: z.string().max(100).optional(),
  roomNumber: z.string().max(50).optional(),
  guestName: z.string().max(100).optional(),
  processedBy: z.string().max(100).optional(),
});

export const createTableSchema = z.object({
  hotelId: z.string().optional(),
  tableNumber: z.string().min(1, 'Table number is required').max(50),
  section: z.string().max(100).default('Main Dining'),
  capacity: z.number().int().positive().default(4),
  qrCodeToken: z.string().max(100).optional(),
  status: z.enum(['available', 'occupied', 'billed', 'reserved']).default('available'),
});

export const updateTableStatusSchema = z.object({
  status: z.enum(['available', 'occupied', 'billed', 'reserved']),
  activeOrderId: z.string().nullable().optional(),
});

export const createCategorySchema = z.object({
  hotelId: z.string().optional(),
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  imageUrl: z.string().url().or(z.literal('')).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const createMenuItemSchema = z.object({
  hotelId: z.string().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  name: z.string().min(1, 'Item name is required').max(200),
  description: z.string().max(1000).optional(),
  price: z.number().positive('Price must be greater than 0'),
  costPrice: z.number().min(0).optional(),
  imageUrl: z.string().url().or(z.literal('')).optional(),
  isAvailable: z.boolean().default(true),
  isVeg: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  isChefSpecial: z.boolean().default(false),
  preparationTime: z.number().int().positive().default(15),
  calories: z.number().int().positive().optional(),
  allergens: z.array(z.string()).optional(),
  modifiers: z.array(z.any()).optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export const createStaffSchema = z.object({
  hotelId: z.string().optional(),
  name: z.string().min(1, 'Staff name is required').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  role: z.enum(['admin', 'manager', 'cashier', 'waiter', 'kitchen']).default('waiter'),
  pinCode: z.string().min(4, 'PIN code must be at least 4 digits').max(10),
  isActive: z.boolean().default(true),
});

export const updateHotelSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  tagline: z.string().max(255).optional(),
  logoUrl: z.string().url().or(z.literal('')).optional(),
  currency: z.string().max(10).optional(),
  currencySymbol: z.string().max(5).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  serviceChargeRate: z.number().min(0).max(100).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional(),
});
