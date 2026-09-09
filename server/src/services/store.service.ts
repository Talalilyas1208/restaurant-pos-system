import { hotelService } from './hotel.service.js';
import { tableService } from './table.service.js';
import { menuService } from './menu.service.js';
import { staffService } from './staff.service.js';
import { orderService } from './order.service.js';
import { paymentService } from './payment.service.js';
import { analyticsService } from './analytics.service.js';
import { mockOrderService } from './mock-order.service.js';

export const storeService = {
  // Hotel
  getHotel: hotelService.getHotel.bind(hotelService),
  updateHotel: hotelService.updateHotel.bind(hotelService),

  // Tables
  getTables: tableService.getTables.bind(tableService),
  getTableByTokenOrId: tableService.getTableByTokenOrId.bind(tableService),
  updateTableStatus: tableService.updateTableStatus.bind(tableService),
  addTable: tableService.addTable.bind(tableService),
  deleteTable: tableService.deleteTable.bind(tableService),

  // Categories
  getCategories: menuService.getCategories.bind(menuService),
  addCategory: menuService.addCategory.bind(menuService),

  // Menu Items
  getMenuItems: menuService.getMenuItems.bind(menuService),
  getMenuItemById: menuService.getMenuItemById.bind(menuService),
  addMenuItem: menuService.addMenuItem.bind(menuService),
  updateMenuItem: menuService.updateMenuItem.bind(menuService),
  deleteMenuItem: menuService.deleteMenuItem.bind(menuService),

  // Staff & Waiters
  getStaffUsers: staffService.getStaffUsers.bind(staffService),
  addStaffUser: staffService.addStaffUser.bind(staffService),
  deleteStaffUser: staffService.deleteStaffUser.bind(staffService),

  // Orders
  getOrders: orderService.getOrders.bind(orderService),
  getOrderById: orderService.getOrderById.bind(orderService),
  createOrder: orderService.createOrder.bind(orderService),
  updateOrderStatus: orderService.updateOrderStatus.bind(orderService),
  createMockOrder: mockOrderService.createMockOrder.bind(mockOrderService),
  clearOrders: mockOrderService.clearOrders.bind(mockOrderService),

  // Payments & Checkout
  processPayment: paymentService.processPayment.bind(paymentService),
  checkoutOrder: paymentService.checkoutOrder.bind(paymentService),

  // Analytics
  getAnalytics: analyticsService.getAnalytics.bind(analyticsService),
};

export {
  hotelService,
  tableService,
  menuService,
  staffService,
  orderService,
  paymentService,
  analyticsService,
  mockOrderService,
};

