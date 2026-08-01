import { RmaPriority, RmaStatus } from '@prisma/client';
import { z } from 'zod';
import { paginationQuerySchema } from '../../utils/pagination';

export const createRmaSchema = z.object({
  customerId: z.string().uuid('Cliente inválido'),
  productId: z.string().uuid('Produto inválido'),
  serialNumber: z.string().max(100).optional(),
  issueDescription: z.string().min(10, 'Descreva o problema com ao menos 10 caracteres'),
  priority: z.nativeEnum(RmaPriority).default(RmaPriority.MEDIUM),
  assignedToId: z.string().uuid().optional(),
});

export const updateRmaSchema = z.object({
  customerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  serialNumber: z.string().max(100).optional(),
  issueDescription: z.string().min(10).optional(),
  priority: z.nativeEnum(RmaPriority).optional(),
  assignedToId: z.string().uuid().nullable().optional(),
});

export const changeRmaStatusSchema = z.object({
  status: z.nativeEnum(RmaStatus),
  note: z.string().max(500).optional(),
});

export const listRmasQuerySchema = paginationQuerySchema.extend({
  status: z.nativeEnum(RmaStatus).optional(),
  priority: z.nativeEnum(RmaPriority).optional(),
  customerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  search: z.string().trim().min(1).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateRmaInput = z.infer<typeof createRmaSchema>;
export type UpdateRmaInput = z.infer<typeof updateRmaSchema>;
export type ChangeRmaStatusInput = z.infer<typeof changeRmaStatusSchema>;
export type ListRmasQuery = z.infer<typeof listRmasQuerySchema>;
