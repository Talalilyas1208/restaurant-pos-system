export interface Hotel {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  logoUrl?: string;
  currency: string;
  currencySymbol: string;
  taxRate: number;
  serviceChargeRate: number;
  address?: string;
  phone?: string;
  email?: string;
}

export type TableStatus = 'available' | 'occupied' | 'billed' | 'reserved';

export interface DiningTable {
  id: string;
  hotelId: string;
  tableNumber: string;
  section: string;
  capacity: number;
  qrCodeToken: string;
  status: TableStatus;
  activeOrderId?: string | null;
}

export interface Category {
  id: string;
  hotelId: string;
  name: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ItemModifierOption {
  name: string;
  price: number;
}

export interface ItemModifier {
  id: string;
  menuItemId: string;
  name: string;
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
  options: ItemModifierOption[];
}

export interface MenuItem {
  id: string;
  hotelId: string;
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  imageUrl?: string;
  isAvailable: boolean;
  isVeg: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  isChefSpecial: boolean;
  preparationTime: number;
  calories?: number;
  allergens?: string[];
  modifiers?: ItemModifier[];
}

export type OrderType = 'dine_in' | 'room_service' | 'takeaway' | 'delivery';
export type OrderSource = 'pos' | 'qr_customer' | 'kiosk';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';

export interface SelectedModifier {
  groupName: string;
  optionName: string;
  price: number;
}

export interface OrderItem {
  id?: string;
  menuItemId?: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  selectedModifiers?: SelectedModifier[];
  specialInstructions?: string;
  status?: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface Order {
  id: string;
  hotelId: string;
  tableId?: string;
  tableNumber?: string;
  orderNumber: string;
  orderType: OrderType;
  source: OrderSource;
  status: OrderStatus;
  customerName: string;
  customerPhone?: string;
  customerNotes?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discountAmount: number;
  total: number;
  paymentStatus: PaymentStatus;
  serverStaffId?: string;
  serverStaffName?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'room_charge' | 'qr_upi' | 'apple_pay';

export interface Payment {
  id: string;
  orderId: string;
  hotelId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  tenderedAmount?: number;
  changeDue?: number;
  transactionRef?: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  roomNumber?: string;
  guestName?: string;
  processedBy?: string;
  createdAt: string;
}

export interface StaffUser {
  id: string;
  hotelId: string;
  name: string;
  email?: string;
  role: 'admin' | 'manager' | 'cashier' | 'waiter' | 'kitchen';
  pinCode: string;
  isActive: boolean;
  createdAt?: string;
}

export interface AnalyticsSummary {
  todayRevenue: number;
  totalOrdersToday: number;
  activeOrders: number;
  averageOrderValue: number;
  popularItems: { name: string; quantity: number; revenue: number }[];
  hourlySales: { hour: string; sales: number }[];
}

