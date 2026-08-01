import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { uploadRmaImages } from '../../middlewares/upload.middleware';
import { idParamSchema } from '../../utils/commonSchemas';
import {
  changeRmaStatusSchema,
  createRmaSchema,
  listRmasQuerySchema,
  updateRmaSchema,
} from './rma.dto';
import * as rmaController from './rma.controller';

export const rmaRouter = Router();

rmaRouter.use(requireAuth);

const rmaImageParamSchema = idParamSchema.extend({
  imageId: z.string().uuid('ID de imagem inválido'),
});

/**
 * @openapi
 * /rmas:
 *   get:
 *     tags: [RMAs]
 *     summary: Lista RMAs com busca, filtros e paginação
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: priority
 *         schema: { type: string }
 *       - in: query
 *         name: customerId
 *         schema: { type: string }
 *       - in: query
 *         name: productId
 *         schema: { type: string }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date }
 *     responses:
 *       200: { description: Lista paginada de RMAs }
 *   post:
 *     tags: [RMAs]
 *     summary: Cria um novo RMA
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: RMA criado }
 */
rmaRouter
  .route('/')
  .get(validate({ query: listRmasQuerySchema }), rmaController.list)
  .post(validate({ body: createRmaSchema }), rmaController.create);

/**
 * @openapi
 * /rmas/{id}:
 *   get:
 *     tags: [RMAs]
 *     summary: Obtém um RMA pelo ID, incluindo imagens e histórico de status
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: RMA encontrado }
 *       404: { description: RMA não encontrado }
 *   put:
 *     tags: [RMAs]
 *     summary: Atualiza dados de um RMA (não altera status)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: RMA atualizado }
 *   delete:
 *     tags: [RMAs]
 *     summary: Remove um RMA
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: RMA removido }
 */
rmaRouter
  .route('/:id')
  .get(validate({ params: idParamSchema }), rmaController.getById)
  .put(validate({ params: idParamSchema, body: updateRmaSchema }), rmaController.update)
  .delete(validate({ params: idParamSchema }), rmaController.remove);

/**
 * @openapi
 * /rmas/{id}/status:
 *   patch:
 *     tags: [RMAs]
 *     summary: Altera o status do RMA respeitando a máquina de estados e grava o histórico
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Status atualizado }
 *       400: { description: Transição de status inválida }
 */
rmaRouter.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: changeRmaStatusSchema }),
  rmaController.changeStatus,
);

/**
 * @openapi
 * /rmas/{id}/images:
 *   post:
 *     tags: [RMAs]
 *     summary: Envia imagens (multipart/form-data, campo "images", até 5 arquivos)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201: { description: Imagens enviadas }
 */
rmaRouter.post(
  '/:id/images',
  validate({ params: idParamSchema }),
  uploadRmaImages,
  rmaController.addImages,
);

/**
 * @openapi
 * /rmas/{id}/images/{imageId}:
 *   delete:
 *     tags: [RMAs]
 *     summary: Remove uma imagem do RMA
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Imagem removida }
 */
rmaRouter.delete(
  '/:id/images/:imageId',
  validate({ params: rmaImageParamSchema }),
  rmaController.removeImage,
);
