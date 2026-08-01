import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';
import { buildPaginatedResult, getSkipTake } from '../../utils/pagination';
import { toApiError } from '../../utils/prismaErrors';
import { generateRmaNumber } from './rmaNumber';
import { canTransition } from './rma.statusMachine';
import type {
  ChangeRmaStatusInput,
  CreateRmaInput,
  ListRmasQuery,
  UpdateRmaInput,
} from './rma.dto';

const listInclude = {
  customer: { select: { id: true, name: true, email: true } },
  product: { select: { id: true, name: true, sku: true } },
  assignedTo: { select: { id: true, name: true } },
} satisfies Prisma.RmaInclude;

const detailInclude = {
  ...listInclude,
  createdBy: { select: { id: true, name: true } },
  images: { orderBy: { createdAt: 'asc' } },
  statusHistory: {
    orderBy: { createdAt: 'asc' },
    include: { changedBy: { select: { id: true, name: true } } },
  },
} satisfies Prisma.RmaInclude;

export async function listRmas(query: ListRmasQuery) {
  const {
    page,
    pageSize,
    status,
    priority,
    customerId,
    productId,
    assignedToId,
    search,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
  } = query;
  const { skip, take } = getSkipTake(page, pageSize);

  const where: Prisma.RmaWhereInput = {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(customerId ? { customerId } : {}),
    ...(productId ? { productId } : {}),
    ...(assignedToId ? { assignedToId } : {}),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom ? { gte: dateFrom } : {}),
            ...(dateTo ? { lte: dateTo } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { rmaNumber: { contains: search, mode: 'insensitive' } },
            { serialNumber: { contains: search, mode: 'insensitive' } },
            { issueDescription: { contains: search, mode: 'insensitive' } },
            { customer: { name: { contains: search, mode: 'insensitive' } } },
            { product: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.rma.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
      include: listInclude,
    }),
    prisma.rma.count({ where }),
  ]);

  return buildPaginatedResult(items, total, page, pageSize);
}

export async function getRmaById(id: string) {
  const rma = await prisma.rma.findUnique({ where: { id }, include: detailInclude });

  if (!rma) {
    throw ApiError.notFound('RMA não encontrado');
  }

  return rma;
}

export async function createRma(data: CreateRmaInput, createdById: string) {
  const [customer, product] = await Promise.all([
    prisma.customer.findUnique({ where: { id: data.customerId } }),
    prisma.product.findUnique({ where: { id: data.productId } }),
  ]);

  if (!customer) throw ApiError.badRequest('Cliente informado não existe');
  if (!product) throw ApiError.badRequest('Produto informado não existe');

  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const rmaNumber = await generateRmaNumber(tx);

        const rma = await tx.rma.create({
          data: {
            rmaNumber,
            customerId: data.customerId,
            productId: data.productId,
            serialNumber: data.serialNumber,
            issueDescription: data.issueDescription,
            priority: data.priority,
            assignedToId: data.assignedToId,
            createdById,
          },
          include: detailInclude,
        });

        await tx.rmaStatusHistory.create({
          data: {
            rmaId: rma.id,
            fromStatus: null,
            toStatus: rma.status,
            changedById: createdById,
            note: 'RMA criado.',
          },
        });

        return rma;
      });
    } catch (err) {
      const isLastAttempt = attempt === MAX_ATTEMPTS;
      const isUniqueRmaNumberClash =
        err instanceof Object && 'code' in err && (err as { code?: string }).code === 'P2002';

      if (!isUniqueRmaNumberClash || isLastAttempt) {
        throw toApiError(err);
      }
    }
  }

  throw ApiError.conflict('Não foi possível gerar um número de RMA único, tente novamente');
}

export async function updateRma(id: string, data: UpdateRmaInput) {
  await getRmaById(id);

  try {
    return await prisma.rma.update({ where: { id }, data, include: detailInclude });
  } catch (err) {
    throw toApiError(err);
  }
}

export async function changeRmaStatus(
  id: string,
  input: ChangeRmaStatusInput,
  changedById: string,
) {
  const rma = await getRmaById(id);

  if (rma.status === input.status) {
    throw ApiError.badRequest('O RMA já está neste status');
  }

  if (!canTransition(rma.status, input.status)) {
    throw ApiError.badRequest(`Transição de status inválida: ${rma.status} -> ${input.status}`);
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.rma.update({
      where: { id },
      data: {
        status: input.status,
        ...(input.note ? { resolutionNotes: input.note } : {}),
      },
      include: detailInclude,
    });

    await tx.rmaStatusHistory.create({
      data: {
        rmaId: id,
        fromStatus: rma.status,
        toStatus: input.status,
        changedById,
        note: input.note,
      },
    });

    return updated;
  });
}

export async function deleteRma(id: string) {
  await getRmaById(id);

  try {
    await prisma.rma.delete({ where: { id } });
  } catch (err) {
    throw toApiError(err);
  }
}
