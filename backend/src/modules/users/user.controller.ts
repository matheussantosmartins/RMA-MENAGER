import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as userService from './user.service';
import type { ListUsersQuery } from './user.dto';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.listUsers(req.query as unknown as ListUsersQuery);
  res.json(result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id as string);
  res.json(user);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id as string, req.body);
  res.json(user);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id as string, req.user!.id);
  res.status(204).send();
});
