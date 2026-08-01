import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { idParamSchema } from '../../utils/commonSchemas';
import { createProductSchema, listProductsQuerySchema, updateProductSchema } from './product.dto';
import * as productController from './product.controller';

export const productRouter = Router();

productRouter.use(requireAuth);

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Lista produtos com busca e paginação
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
 *       200: { description: Lista paginada de produtos }
 *   post:
 *     tags: [Products]
 *     summary: Cria um novo produto
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Produto criado }
 */
productRouter
  .route('/')
  .get(validate({ query: listProductsQuerySchema }), productController.list)
  .post(validate({ body: createProductSchema }), productController.create);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Obtém um produto pelo ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Produto encontrado }
 *       404: { description: Produto não encontrado }
 *   put:
 *     tags: [Products]
 *     summary: Atualiza um produto
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Produto atualizado }
 *   delete:
 *     tags: [Products]
 *     summary: Remove um produto
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Produto removido }
 */
productRouter
  .route('/:id')
  .get(validate({ params: idParamSchema }), productController.getById)
  .put(validate({ params: idParamSchema, body: updateProductSchema }), productController.update)
  .delete(validate({ params: idParamSchema }), productController.remove);
