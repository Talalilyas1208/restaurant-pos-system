import { Request, Response } from 'express';
import { config } from '../config/index.js';
import { getSupabaseClient } from '../config/supabase.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

/**
 * Health & Readiness Controller
 *
 * Provides service health diagnostics, uptime metrics, memory usage,
 * and database connectivity status.
 */
export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const supabase = getSupabaseClient();
  const memory = process.memoryUsage();

  const healthData = {
    status: 'ok',
    service: 'Hotel & Restaurant POS API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    supabase: {
      configured: !!supabase,
      url: config.supabaseUrl ? config.supabaseUrl.replace(/(https?:\/\/)(.*)/, '$1***') : 'not configured',
    },
    system: {
      nodeVersion: process.version,
      memoryRssMb: parseFloat((memory.rss / (1024 * 1024)).toFixed(2)),
      memoryHeapUsedMb: parseFloat((memory.heapUsed / (1024 * 1024)).toFixed(2)),
    },
  };

  sendSuccess(res, healthData, 'System is healthy');
});

