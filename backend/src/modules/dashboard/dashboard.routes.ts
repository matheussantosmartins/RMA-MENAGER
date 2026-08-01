import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import * as dashboardController from './dashboard.controller';

export const dashboardRouter = Router();

/**
 * @openapi
 * /dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Retorna indicadores agregados de RMAs para o dashboard
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Estatísticas do dashboard (totais, por status, por prioridade, RMAs por mês, tempo médio de resolução, últimos RMAs)
 */
dashboardRouter.get('/stats', requireAuth, dashboardController.getStats);
