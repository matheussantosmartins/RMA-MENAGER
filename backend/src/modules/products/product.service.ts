import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';
import { buildPaginatedResult, getSkipTake } from '../../utils/pagination';
import { toApiError } from '../../utils/prismaErrors';
import type { CreateProductInput, ListProductsQuery, UpdateProductInput } from './product.dto';

export async function listProducts(query: ListProductsQuery) {
  const { page, pageSize, search } = query;
  const { skip, take } = getSkipTake(page, pageSize);

  const where: Prisma.ProductWhereInput = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ]);

  return buildPaginatedResult(items, total, page, pageSize);
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    throw ApiError.notFound('Produto não encontrado');
  }

  return product;
}

export async function createProduct(data: CreateProductInput) {
  try {
    return await prisma.product.create({ data });
  } catch (err) {
    throw toApiError(err, 'Já existe um produto com este SKU');
  }
}

export async function updateProduct(id: string, data: UpdateProductInput) {
  await getProductById(id);

  try {
    return await prisma.product.update({ where: { id }, data });
  } catch (err) {
    throw toApiError(err, 'Já existe um produto com este SKU');
  }
}

export async function deleteProduct(id: string) {
  await getProductById(id);

  try {
    await prisma.product.delete({ where: { id } });
  } catch (err) {
    throw toApiError(err, {
      fkMessage: 'Não é possível excluir: existem RMAs vinculados a este produto',
    });
  }
}
