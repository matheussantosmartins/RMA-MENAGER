import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as productService from './product.service';
import type { ListProductsQuery } from './product.dto';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.listProducts(req.query as unknown as ListProductsQuery);
  res.json(result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id as string);
  res.json(product);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json(product);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id as string, req.body);
  res.json(product);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await productService.deleteProduct(req.params.id as string);
  res.status(204).send();
});
