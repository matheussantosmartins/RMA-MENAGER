import { api } from './client';
import type { PaginatedResult } from '../types/pagination';
import type { RmaDetail, RmaImage, RmaListItem, RmaPriority, RmaStatus } from '../types/rma';
import type { RmaFormInput } from '../types/rmaForm';

export interface ListRmasParams {
  page: number;
  pageSize: number;
  status?: RmaStatus;
  priority?: RmaPriority;
  customerId?: string;
  productId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function listRmas(params: ListRmasParams): Promise<PaginatedResult<RmaListItem>> {
  const { data } = await api.get<PaginatedResult<RmaListItem>>('/rmas', { params });
  return data;
}

export async function getRma(id: string): Promise<RmaDetail> {
  const { data } = await api.get<RmaDetail>(`/rmas/${id}`);
  return data;
}

export async function createRma(input: RmaFormInput): Promise<RmaDetail> {
  const { data } = await api.post<RmaDetail>('/rmas', input);
  return data;
}

export async function updateRma(id: string, input: RmaFormInput): Promise<RmaDetail> {
  const { data } = await api.put<RmaDetail>(`/rmas/${id}`, input);
  return data;
}

export async function changeRmaStatus(
  id: string,
  input: { status: RmaStatus; note?: string },
): Promise<RmaDetail> {
  const { data } = await api.patch<RmaDetail>(`/rmas/${id}/status`, input);
  return data;
}

export async function deleteRma(id: string): Promise<void> {
  await api.delete(`/rmas/${id}`);
}

export async function uploadRmaImages(id: string, files: File[]): Promise<RmaImage[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const { data } = await api.post<RmaImage[]>(`/rmas/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteRmaImage(id: string, imageId: string): Promise<void> {
  await api.delete(`/rmas/${id}/images/${imageId}`);
}
