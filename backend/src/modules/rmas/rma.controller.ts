import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as rmaService from './rma.service';
import * as rmaImageService from './rmaImage.service';
import type { ListRmasQuery } from './rma.dto';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await rmaService.listRmas(req.query as unknown as ListRmasQuery);
  res.json(result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const rma = await rmaService.getRmaById(req.params.id as string);
  res.json(rma);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const rma = await rmaService.createRma(req.body, req.user!.id);
  res.status(201).json(rma);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const rma = await rmaService.updateRma(req.params.id as string, req.body);
  res.json(rma);
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  const rma = await rmaService.changeRmaStatus(req.params.id as string, req.body, req.user!.id);
  res.json(rma);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await rmaService.deleteRma(req.params.id as string);
  res.status(204).send();
});

export const addImages = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const images = await rmaImageService.addRmaImages(req.params.id as string, files);
  res.status(201).json(images);
});

export const removeImage = asyncHandler(async (req: Request, res: Response) => {
  await rmaImageService.removeRmaImage(req.params.id as string, req.params.imageId as string);
  res.status(204).send();
});
