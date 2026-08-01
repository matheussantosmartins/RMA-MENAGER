import { api } from './client';
import type { PaginatedResult } from '../types/pagination';
import type { Product, ProductInput } from '../types/product';

export interface ListProductsParams {
  page: number;
  pageSize: number;
  search?: string;
}

export async function listProducts(params: ListProductsParams): Promise<PaginatedResult<Product>> {
  const { data } = await api.get<PaginatedResult<Product>>('/products', { params });
  return data;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await api.post<Product>('/products', input);
  return data;
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const { data } = await api.put<Product>(`/products/${id}`, input);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}
