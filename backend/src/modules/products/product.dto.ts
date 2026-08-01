import { z } from 'zod';
import { paginationQuerySchema } from '../../utils/pagination';

export const createProductSchema = z.object({
  sku: z.string().min(2, 'SKU deve ter ao menos 2 caracteres').toUpperCase(),
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  brand: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductsQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
