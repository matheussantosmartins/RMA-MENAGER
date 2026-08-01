import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';
import { buildPaginatedResult, getSkipTake } from '../../utils/pagination';
import { toApiError } from '../../utils/prismaErrors';
import type { CreateCustomerInput, ListCustomersQuery, UpdateCustomerInput } from './customer.dto';

export async function listCustomers(query: ListCustomersQuery) {
  const { page, pageSize, search } = query;
  const { skip, take } = getSkipTake(page, pageSize);

  const where: Prisma.CustomerWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.customer.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.customer.count({ where }),
  ]);

  return buildPaginatedResult(items, total, page, pageSize);
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({ where: { id } });

  if (!customer) {
    throw ApiError.notFound('Cliente não encontrado');
  }

  return customer;
}

export async function createCustomer(data: CreateCustomerInput) {
  try {
    return await prisma.customer.create({ data });
  } catch (err) {
    throw toApiError(err, 'Já existe um cliente com este e-mail');
  }
}

export async function updateCustomer(id: string, data: UpdateCustomerInput) {
  await getCustomerById(id);

  try {
    return await prisma.customer.update({ where: { id }, data });
  } catch (err) {
    throw toApiError(err, 'Já existe um cliente com este e-mail');
  }
}

export async function deleteCustomer(id: string) {
  await getCustomerById(id);

  try {
    await prisma.customer.delete({ where: { id } });
  } catch (err) {
    throw toApiError(err, {
      fkMessage: 'Não é possível excluir: existem RMAs vinculados a este cliente',
    });
  }
}
