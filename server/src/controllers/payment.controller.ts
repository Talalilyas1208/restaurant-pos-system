import { Request, Response, NextFunction } from 'express';
import { storeService } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';

export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await storeService.processPayment(req.body);
    sendSuccess(res, result, 'Payment processed successfully', 201);
  } catch (error) {
    next(error);
  }
};
