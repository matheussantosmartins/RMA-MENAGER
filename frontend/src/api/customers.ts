import { api } from './client';
import type { PaginatedResult } from '../types/pagination';
import type { Customer, CustomerInput } from '../types/customer';

export interface ListCustomersParams {
  page: number;
  pageSize: number;
  search?: string;
}

export async function listCustomers(
  params: ListCustomersParams,
): Promise<PaginatedResult<Customer>> {
  const { data } = await api.get<PaginatedResult<Customer>>('/customers', { params });
  return data;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const { data } = await api.post<Customer>('/customers', input);
  return data;
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
  const { data } = await api.put<Customer>(`/customers/${id}`, input);
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await api.delete(`/customers/${id}`);
}
