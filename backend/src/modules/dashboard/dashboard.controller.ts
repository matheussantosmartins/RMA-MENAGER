import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as dashboardService from './dashboard.service';

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getDashboardStats();
  res.json(stats);
});
