import { Request, Response, NextFunction } from 'express';
import { storeService } from '../services/store.service.js';
import { sendSuccess } from '../utils/response.js';

export const getHotelProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const hotel = await storeService.getHotel(slug);
    sendSuccess(res, hotel, 'Hotel profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateHotelProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await storeService.updateHotel(req.body);
    sendSuccess(res, updated, 'Hotel profile updated successfully');
  } catch (error) {
    next(error);
  }
};
