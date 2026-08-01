import { api } from './client';
import type { PaginatedResult } from '../types/pagination';
import type { CreateUserInput, Role, UpdateUserInput, User } from '../types/user';

export interface ListUsersParams {
  page: number;
  pageSize: number;
  search?: string;
  role?: Role;
}

export async function listUsers(params: ListUsersParams): Promise<PaginatedResult<User>> {
  const { data } = await api.get<PaginatedResult<User>>('/users', { params });
  return data;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { data } = await api.post<User>('/users', input);
  return data;
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const { data } = await api.put<User>(`/users/${id}`, input);
  return data;
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`);
}
