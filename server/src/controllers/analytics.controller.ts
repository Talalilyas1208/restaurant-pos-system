import { Request, Response, NextFunction } from 'express';
import { storeService } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';

export const getDashboardAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = await storeService.getAnalytics();
    sendSuccess(res, analytics, 'Analytics data retrieved successfully');
  } catch (error) {
    next(error);
  }
};
