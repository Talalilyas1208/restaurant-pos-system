import { Request, Response, NextFunction } from 'express';
import { storeService } from '../services/store.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    const orders = await storeService.getOrders(status as string | undefined);
    sendSuccess(res, orders, 'Orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await storeService.getOrderById(id);
    if (!order) {
      sendError(res, 'Order not found', 404);
      return;
    }
    sendSuccess(res, order, 'Order details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = await storeService.createOrder(req.body);
    sendSuccess(res, order, 'Order created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await storeService.updateOrderStatus(id, status);
    if (!order) {
      sendError(res, 'Order not found', 404);
      return;
    }
    sendSuccess(res, order, `Order status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};
