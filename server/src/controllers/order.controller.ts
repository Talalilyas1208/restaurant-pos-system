import { Request, Response } from 'express';
import { storeService } from '../services/store.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { notifyOrderCreated, notifyOrderStatusUpdated } from '../services/socket.service.js';

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const orders = await storeService.getOrders(status as string | undefined);
  sendSuccess(res, orders, 'Orders retrieved successfully');
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await storeService.getOrderById(id);
  if (!order) {
    sendError(res, 'Order not found', 404);
    return;
  }
  sendSuccess(res, order, 'Order details retrieved successfully');
});

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await storeService.createOrder(req.body);
  notifyOrderCreated(order);
  sendSuccess(res, order, 'Order created successfully', 201);
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = await storeService.updateOrderStatus(id, status);
  if (!order) {
    sendError(res, 'Order not found', 404);
    return;
  }
  notifyOrderStatusUpdated(order);
  sendSuccess(res, order, `Order status updated to ${status}`);
});

export const checkoutOrder = asyncHandler(async (req: Request, res: Response) => {
  const { order: orderData, payment: paymentData } = req.body;
  const result = await storeService.checkoutOrder(orderData, paymentData);
  notifyOrderCreated(result.order);
  notifyOrderStatusUpdated(result.order);
  sendSuccess(res, result, 'Order checked out and paid successfully', 201);
});

