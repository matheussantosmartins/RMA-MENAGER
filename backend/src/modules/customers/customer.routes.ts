import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { idParamSchema } from '../../utils/commonSchemas';
import {
  createCustomerSchema,
  listCustomersQuerySchema,
  updateCustomerSchema,
} from './customer.dto';
import * as customerController from './customer.controller';

export const customerRouter = Router();

customerRouter.use(requireAuth);

/**
 * @openapi
 * /customers:
 *   get:
 *     tags: [Customers]
 *     summary: Lista clientes com busca e paginação
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
 *     responses:
 *       200: { description: Lista paginada de clientes }
 *   post:
 *     tags: [Customers]
 *     summary: Cria um novo cliente
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Cliente criado }
 */
customerRouter
  .route('/')
  .get(validate({ query: listCustomersQuerySchema }), customerController.list)
  .post(validate({ body: createCustomerSchema }), customerController.create);

/**
 * @openapi
 * /customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Obtém um cliente pelo ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cliente encontrado }
 *       404: { description: Cliente não encontrado }
 *   put:
 *     tags: [Customers]
 *     summary: Atualiza um cliente
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Cliente atualizado }
 *   delete:
 *     tags: [Customers]
 *     summary: Remove um cliente
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Cliente removido }
 */
customerRouter
  .route('/:id')
  .get(validate({ params: idParamSchema }), customerController.getById)
  .put(validate({ params: idParamSchema, body: updateCustomerSchema }), customerController.update)
  .delete(validate({ params: idParamSchema }), customerController.remove);
