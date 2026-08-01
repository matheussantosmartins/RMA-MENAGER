import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/roles.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { idParamSchema } from '../../utils/commonSchemas';
import { createUserSchema, listUsersQuerySchema, updateUserSchema } from './user.dto';
import * as userController from './user.controller';

export const userRouter = Router();

userRouter.use(requireAuth, requireRole('ADMIN'));

/**
 * @openapi
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Lista usuários (somente ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista paginada de usuários }
 *   post:
 *     tags: [Users]
 *     summary: Cria um novo usuário (somente ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Usuário criado }
 */
userRouter
  .route('/')
  .get(validate({ query: listUsersQuerySchema }), userController.list)
  .post(validate({ body: createUserSchema }), userController.create);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtém um usuário pelo ID (somente ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Usuário encontrado }
 *   put:
 *     tags: [Users]
 *     summary: Atualiza um usuário (somente ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Usuário atualizado }
 *   delete:
 *     tags: [Users]
 *     summary: Remove um usuário (somente ADMIN)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Usuário removido }
 */
userRouter
  .route('/:id')
  .get(validate({ params: idParamSchema }), userController.getById)
  .put(validate({ params: idParamSchema, body: updateUserSchema }), userController.update)
  .delete(validate({ params: idParamSchema }), userController.remove);
