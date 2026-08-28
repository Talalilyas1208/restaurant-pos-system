import { getSupabaseClient } from '../config/supabase.js';
import {
  Hotel,
  DiningTable,
  Category,
  MenuItem,
  Order,
  Payment,
  AnalyticsSummary,
  TableStatus,
  OrderStatus,
} from '../types/index.js';

// Default initial state matching supabase/seed.sql
const DEFAULT_HOTEL: Hotel = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'Grand Horizon Hotel & Bistro',
  slug: 'grand-horizon',
  tagline: 'Fine Dining & Luxury Hospitality',
  logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 8.5,
  serviceChargeRate: 5.0,
  address: '742 Evergreen Terrace, Suite 100',
  phone: '+1 (555) 234-5678',
  email: 'dining@grandhorizon.com',
  createdAt: new Date().toISOString(),
};

const DEFAULT_TABLES: DiningTable[] = [
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b01', hotelId: DEFAULT_HOTEL.id, tableNumber: 'T-01', section: 'Main Dining', capacity: 2, qrCodeToken: 'gh-tbl-01', status: 'available' },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02', hotelId: DEFAULT_HOTEL.id, tableNumber: 'T-02', section: 'Main Dining', capacity: 4, qrCodeToken: 'gh-tbl-02', status: 'occupied' },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b03', hotelId: DEFAULT_HOTEL.id, tableNumber: 'T-03', section: 'Main Dining', capacity: 4, qrCodeToken: 'gh-tbl-03', status: 'available' },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04', hotelId: DEFAULT_HOTEL.id, tableNumber: 'T-04', section: 'Patio Garden', capacity: 6, qrCodeToken: 'gh-tbl-04', status: 'billed' },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b05', hotelId: DEFAULT_HOTEL.id, tableNumber: 'T-05', section: 'Patio Garden', capacity: 2, qrCodeToken: 'gh-tbl-05', status: 'available' },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b06', hotelId: DEFAULT_HOTEL.id, tableNumber: 'R-101', section: 'Room Service', capacity: 2, qrCodeToken: 'gh-rm-101', status: 'available' },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b07', hotelId: DEFAULT_HOTEL.id, tableNumber: 'R-204', section: 'Room Service', capacity: 4, qrCodeToken: 'gh-rm-204', status: 'available' },
  { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b08', hotelId: DEFAULT_HOTEL.id, tableNumber: 'Bar-01', section: 'Lounge & Bar', capacity: 2, qrCodeToken: 'gh-bar-01', status: 'available' },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01', hotelId: DEFAULT_HOTEL.id, name: 'Appetizers & Starters', description: 'Crispy bites and gourmet starters', icon: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=300', sortOrder: 1, isActive: true },
  { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02', hotelId: DEFAULT_HOTEL.id, name: 'Chef Signature Mains', description: 'Prime meats, seafood & artisan pasta', icon: 'UtensilsCrossed', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300', sortOrder: 2, isActive: true },
  { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03', hotelId: DEFAULT_HOTEL.id, name: 'Wood-Fired Pizza & Burgers', description: 'Artisan sourdough pizzas & gourmet burgers', icon: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300', sortOrder: 3, isActive: true },
  { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04', hotelId: DEFAULT_HOTEL.id, name: 'Desserts & Pastries', description: 'Handcrafted sweet delicacies', icon: 'Cake', imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300', sortOrder: 4, isActive: true },
  { id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05', hotelId: DEFAULT_HOTEL.id, name: 'Beverages & Mocktails', description: 'Refreshing craft drinks, smoothies & coffees', icon: 'GlassWater', imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300', sortOrder: 5, isActive: true },
];

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
    hotelId: DEFAULT_HOTEL.id,
    categoryId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
    name: 'Truffle Burrata Bruschetta',
    description: 'Toasted sourdough, heirloom cherry tomatoes, creamy burrata, balsamic glaze & fresh basil',
    price: 14.5,
    costPrice: 4.0,
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=400',
    isAvailable: true,
    isVeg: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isChefSpecial: true,
    preparationTime: 10,
    calories: 420,
    allergens: ['Dairy', 'Gluten'],
    modifiers: [
      {
        id: 'mod-1',
        menuItemId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d01',
        name: 'Extra Toppings',
        isRequired: false,
        minSelection: 0,
        maxSelection: 2,
        options: [
          { name: 'Extra Truffle Shavings', price: 3.5 },
          { name: 'Prosciutto di Parma', price: 4.0 },
        ],
      },
    ],
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d02',
    hotelId: DEFAULT_HOTEL.id,
    categoryId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c01',
    name: 'Crispy Calamari Fritti',
    description: 'Tender squid rings, lemon garlic aioli, smoked paprika dust & charred lemon',
    price: 16.0,
    costPrice: 5.2,
    imageUrl: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=400',
    isAvailable: true,
    isVeg: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isChefSpecial: false,
    preparationTime: 12,
    calories: 480,
    allergens: ['Seafood', 'Egg'],
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d03',
    hotelId: DEFAULT_HOTEL.id,
    categoryId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02',
    name: 'Prime Angus Ribeye Steak (10oz)',
    description: 'Grass-fed beef, rosemary garlic butter, roasted asparagus & truffle potato mash',
    price: 36.0,
    costPrice: 14.0,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400',
    isAvailable: true,
    isVeg: false,
    isVegan: false,
    isGlutenFree: true,
    isSpicy: false,
    isChefSpecial: true,
    preparationTime: 22,
    calories: 850,
    allergens: ['Dairy'],
    modifiers: [
      {
        id: 'mod-2',
        menuItemId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d03',
        name: 'Doneness',
        isRequired: true,
        minSelection: 1,
        maxSelection: 1,
        options: [
          { name: 'Medium Rare (Recommended)', price: 0 },
          { name: 'Medium', price: 0 },
          { name: 'Medium Well', price: 0 },
          { name: 'Well Done', price: 0 },
        ],
      },
    ],
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d04',
    hotelId: DEFAULT_HOTEL.id,
    categoryId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02',
    name: 'Pan-Seared Atlantic Salmon',
    description: 'Wild salmon fillet, lemon dill beurre blanc, quinoa pilaf & baby carrots',
    price: 28.5,
    costPrice: 9.5,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    isAvailable: true,
    isVeg: false,
    isVegan: false,
    isGlutenFree: true,
    isSpicy: false,
    isChefSpecial: false,
    preparationTime: 18,
    calories: 620,
    allergens: ['Fish', 'Dairy'],
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d05',
    hotelId: DEFAULT_HOTEL.id,
    categoryId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c02',
    name: 'Wild Mushroom Tagliatelle',
    description: 'Fresh hand-cut pasta, porcini mushrooms, black truffle cream, aged parmesan',
    price: 22.0,
    costPrice: 6.0,
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281061?w=400',
    isAvailable: true,
    isVeg: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isChefSpecial: false,
    preparationTime: 15,
    calories: 590,
    allergens: ['Gluten', 'Dairy'],
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d06',
    hotelId: DEFAULT_HOTEL.id,
    categoryId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03',
    name: 'Diavola Spicy Pepperoni Pizza',
    description: 'San Marzano tomato, fior di latte mozzarella, spicy soppressata, hot chili honey',
    price: 19.5,
    costPrice: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    isAvailable: true,
    isVeg: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: true,
    isChefSpecial: true,
    preparationTime: 14,
    calories: 780,
    allergens: ['Gluten', 'Dairy'],
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d07',
    hotelId: DEFAULT_HOTEL.id,
    categoryId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c03',
    name: 'The Grand Horizon Wagyu Burger',
    description: 'Brioche bun, 8oz Wagyu patty, aged white cheddar, caramelized onion jam, truffle fries',
    price: 21.0,
    costPrice: 7.2,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    isAvailable: true,
    isVeg: false,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isChefSpecial: true,
    preparationTime: 16,
    calories: 920,
    allergens: ['Gluten', 'Dairy'],
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d08',
    hotelId: DEFAULT_HOTEL.id,
    categoryId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04',
    name: 'Molten Belgian Chocolate Lava Cake',
    description: 'Warm molten center, vanilla bean gelato, raspberry coulis & gold leaf',
    price: 11.5,
    costPrice: 3.1,
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    isAvailable: true,
    isVeg: true,
    isVegan: false,
    isGlutenFree: false,
    isSpicy: false,
    isChefSpecial: true,
    preparationTime: 12,
    calories: 540,
    allergens: ['Dairy', 'Gluten', 'Egg'],
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d09',
    hotelId: DEFAULT_HOTEL.id,
    categoryId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c04',
    name: 'Madagascar Vanilla Bean Panna Cotta',
    description: 'Silky infused cream, passionfruit gel, fresh berries & mint',
    price: 9.5,
    costPrice: 2.5,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    isAvailable: true,
    isVeg: true,
    isVegan: false,
    isGlutenFree: true,
    isSpicy: false,
    isChefSpecial: false,
    preparationTime: 8,
    calories: 320,
    allergens: ['Dairy'],
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d10',
    hotelId: DEFAULT_HOTEL.id,
    categoryId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05',
    name: 'Sparkling Yuzu Berry Spritz',
    description: 'Japanese yuzu, wild berry puree, sparkling mineral water, fresh rosemary sprig',
    price: 7.5,
    costPrice: 1.2,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400',
    isAvailable: true,
    isVeg: true,
    isVegan: true,
    isGlutenFree: true,
    isSpicy: false,
    isChefSpecial: true,
    preparationTime: 5,
    calories: 110,
    allergens: [],
  },
  {
    id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11',
    hotelId: DEFAULT_HOTEL.id,
    categoryId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c05',
    name: 'Artisan Nitro Cold Brew Coffee',
    description: 'Single-origin Ethiopian beans, cascading crema, choice of oat milk or vanilla',
    price: 6.0,
    costPrice: 1.0,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400',
    isAvailable: true,
    isVeg: true,
    isVegan: true,
    isGlutenFree: true,
    isSpicy: false,
    isChefSpecial: false,
    preparationTime: 4,
    calories: 45,
    allergens: [],
  },
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-001',
    hotelId: DEFAULT_HOTEL.id,
    tableId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b02',
    tableNumber: 'T-02',
    orderNumber: '#GH-1001',
    orderType: 'dine_in',
    source: 'pos',
    status: 'preparing',
    customerName: 'Alice Johnson',
    subtotal: 57.0,
    tax: 4.85,
    serviceCharge: 2.85,
    discountAmount: 0.0,
    total: 64.7,
    paymentStatus: 'unpaid',
    items: [
      {
        id: 'oi-01',
        orderId: 'ord-001',
        menuItemId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d03',
        name: 'Prime Angus Ribeye Steak (10oz)',
        unitPrice: 36.0,
        quantity: 1,
        totalPrice: 36.0,
        selectedModifiers: [{ groupName: 'Doneness', optionName: 'Medium Rare', price: 0 }],
        status: 'preparing',
      },
      {
        id: 'oi-02',
        orderId: 'ord-001',
        menuItemId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d07',
        name: 'The Grand Horizon Wagyu Burger',
        unitPrice: 21.0,
        quantity: 1,
        totalPrice: 21.0,
        status: 'preparing',
      },
    ],
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ord-002',
    hotelId: DEFAULT_HOTEL.id,
    tableId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b04',
    tableNumber: 'T-04',
    orderNumber: '#GH-1002',
    orderType: 'dine_in',
    source: 'qr_customer',
    status: 'ready',
    customerName: 'Robert Smith',
    subtotal: 41.5,
    tax: 3.53,
    serviceCharge: 2.08,
    discountAmount: 0.0,
    total: 47.11,
    paymentStatus: 'unpaid',
    items: [
      {
        id: 'oi-03',
        orderId: 'ord-002',
        menuItemId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d06',
        name: 'Diavola Spicy Pepperoni Pizza',
        unitPrice: 19.5,
        quantity: 1,
        totalPrice: 19.5,
        status: 'ready',
      },
      {
        id: 'oi-04',
        orderId: 'ord-002',
        menuItemId: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d05',
        name: 'Wild Mushroom Tagliatelle',
        unitPrice: 22.0,
        quantity: 1,
        totalPrice: 22.0,
        status: 'ready',
      },
    ],
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class StoreService {
  private hotel: Hotel = DEFAULT_HOTEL;
  private tables: DiningTable[] = [...DEFAULT_TABLES];
  private categories: Category[] = [...DEFAULT_CATEGORIES];
  private menuItems: MenuItem[] = [...DEFAULT_MENU_ITEMS];
  private orders: Order[] = [...DEFAULT_ORDERS];
  private payments: Payment[] = [];

  // Hotel info
  async getHotel(slugOrId?: string): Promise<Hotel> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const query = supabase.from('hotels').select('*');
      if (slugOrId) {
        query.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`);
      }
      const { data, error } = await query.single();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          tagline: data.tagline,
          logoUrl: data.logo_url,
          currency: data.currency,
          currencySymbol: data.currency_symbol,
          taxRate: parseFloat(data.tax_rate) || 8.5,
          serviceChargeRate: parseFloat(data.service_charge_rate) || 5.0,
          address: data.address,
          phone: data.phone,
          email: data.email,
        };
      }
    }
    return this.hotel;
  }

  async updateHotel(updates: Partial<Hotel>): Promise<Hotel> {
    this.hotel = { ...this.hotel, ...updates, updatedAt: new Date().toISOString() };
    return this.hotel;
  }

  // Tables
  async getTables(hotelId?: string): Promise<DiningTable[]> {
    return this.tables;
  }

  async getTableByTokenOrId(tokenOrId: string): Promise<DiningTable | undefined> {
    return this.tables.find((t) => t.qrCodeToken === tokenOrId || t.id === tokenOrId || t.tableNumber.toLowerCase() === tokenOrId.toLowerCase());
  }

  async updateTableStatus(tableId: string, status: TableStatus, activeOrderId?: string | null): Promise<DiningTable | null> {
    const tableIndex = this.tables.findIndex((t) => t.id === tableId || t.tableNumber === tableId);
    if (tableIndex === -1) return null;

    this.tables[tableIndex] = {
      ...this.tables[tableIndex],
      status,
      activeOrderId: activeOrderId !== undefined ? activeOrderId : this.tables[tableIndex].activeOrderId,
      updatedAt: new Date().toISOString(),
    };
    return this.tables[tableIndex];
  }

  async addTable(table: Omit<DiningTable, 'id' | 'createdAt'>): Promise<DiningTable> {
    const newTable: DiningTable = {
      ...table,
      id: `tbl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.tables.push(newTable);
    return newTable;
  }

  // Categories
  async getCategories(hotelId?: string): Promise<Category[]> {
    return this.categories.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async addCategory(category: Omit<Category, 'id'>): Promise<Category> {
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
    };
    this.categories.push(newCat);
    return newCat;
  }

  // Menu Items
  async getMenuItems(hotelId?: string, categoryId?: string): Promise<MenuItem[]> {
    let items = this.menuItems;
    if (categoryId) {
      items = items.filter((item) => item.categoryId === categoryId);
    }
    return items;
  }

  async getMenuItemById(id: string): Promise<MenuItem | undefined> {
    return this.menuItems.find((item) => item.id === id);
  }

  async addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    this.menuItems.push(newItem);
    return newItem;
  }

  async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    const index = this.menuItems.findIndex((i) => i.id === id);
    if (index === -1) return null;
    this.menuItems[index] = { ...this.menuItems[index], ...updates };
    return this.menuItems[index];
  }

  // Orders
  async getOrders(status?: string): Promise<Order[]> {
    if (status && status !== 'all') {
      return this.orders.filter((o) => o.status === status);
    }
    return this.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const orderNumber = `#GH-${1000 + this.orders.length + 1}`;
    const subtotal = (orderData.items || []).reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = parseFloat(((subtotal * this.hotel.taxRate) / 100).toFixed(2));
    const serviceCharge = parseFloat(((subtotal * this.hotel.serviceChargeRate) / 100).toFixed(2));
    const discountAmount = orderData.discountAmount || 0;
    const total = parseFloat((subtotal + tax + serviceCharge - discountAmount).toFixed(2));

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      hotelId: orderData.hotelId || this.hotel.id,
      tableId: orderData.tableId,
      tableNumber: orderData.tableNumber || 'Takeaway',
      orderNumber,
      orderType: orderData.orderType || 'dine_in',
      source: orderData.source || 'pos',
      status: 'pending',
      customerName: orderData.customerName || 'Guest',
      customerPhone: orderData.customerPhone,
      customerNotes: orderData.customerNotes,
      items: (orderData.items || []).map((i, idx) => ({
        ...i,
        id: i.id || `oi-${Date.now()}-${idx}`,
        orderId: `ord-${Date.now()}`,
        status: 'pending',
      })),
      subtotal,
      tax,
      serviceCharge,
      discountAmount,
      total,
      paymentStatus: 'unpaid',
      serverStaffId: orderData.serverStaffId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);

    // If assigned to a table, update table status to occupied
    if (newOrder.tableId) {
      await this.updateTableStatus(newOrder.tableId, 'occupied', newOrder.id);
    }

    return newOrder;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const index = this.orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (index === -1) return null;

    this.orders[index] = {
      ...this.orders[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    // If order is completed or cancelled and linked to a table, free up the table
    if ((status === 'completed' || status === 'cancelled') && this.orders[index].tableId) {
      await this.updateTableStatus(this.orders[index].tableId!, 'available', null);
    }

    return this.orders[index];
  }

  // Payments
  async processPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<{ payment: Payment; order: Order }> {
    const orderIndex = this.orders.findIndex((o) => o.id === paymentData.orderId);
    if (orderIndex === -1) {
      throw new Error('Order not found for payment processing');
    }

    const order = this.orders[orderIndex];
    const newPayment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    this.payments.push(newPayment);

    // Mark order as paid and completed
    this.orders[orderIndex] = {
      ...order,
      paymentStatus: 'paid',
      status: 'completed',
      updatedAt: new Date().toISOString(),
    };

    if (order.tableId) {
      await this.updateTableStatus(order.tableId, 'available', null);
    }

    return {
      payment: newPayment,
      order: this.orders[orderIndex],
    };
  }

  // Analytics
  async getAnalytics(): Promise<AnalyticsSummary> {
    const todayOrders = this.orders;
    const todayRevenue = todayOrders.reduce((sum, o) => (o.paymentStatus === 'paid' ? sum + o.total : sum), 0);
    const activeOrders = todayOrders.filter((o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready').length;
    const avgOrder = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0;

    return {
      todayRevenue: parseFloat(todayRevenue.toFixed(2)),
      totalOrdersToday: todayOrders.length,
      activeOrders,
      averageOrderValue: parseFloat(avgOrder.toFixed(2)),
      popularItems: [
        { name: 'Prime Angus Ribeye Steak', quantity: 24, revenue: 864.0 },
        { name: 'The Grand Horizon Wagyu Burger', quantity: 38, revenue: 798.0 },
        { name: 'Diavola Spicy Pepperoni Pizza', quantity: 32, revenue: 624.0 },
        { name: 'Truffle Burrata Bruschetta', quantity: 29, revenue: 420.5 },
        { name: 'Sparkling Yuzu Berry Spritz', quantity: 45, revenue: 337.5 },
      ],
      hourlySales: [
        { hour: '11:00', sales: 120 },
        { hour: '12:00', sales: 480 },
        { hour: '13:00', sales: 750 },
        { hour: '14:00', sales: 340 },
        { hour: '18:00', sales: 620 },
        { hour: '19:00', sales: 1100 },
        { hour: '20:00', sales: 1350 },
        { hour: '21:00', sales: 890 },
      ],
    };
  }
}

export const storeService = new StoreService();
