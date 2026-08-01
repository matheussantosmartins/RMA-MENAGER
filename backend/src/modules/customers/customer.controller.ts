import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as customerService from './customer.service';
import type { ListCustomersQuery } from './customer.dto';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await customerService.listCustomers(req.query as unknown as ListCustomersQuery);
  res.json(result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.getCustomerById(req.params.id as string);
  res.json(customer);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.createCustomer(req.body);
  res.status(201).json(customer);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.updateCustomer(req.params.id as string, req.body);
  res.json(customer);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await customerService.deleteCustomer(req.params.id as string);
  res.status(204).send();
});
