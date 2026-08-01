import bcrypt from 'bcrypt';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';
import { buildPaginatedResult, getSkipTake } from '../../utils/pagination';
import { toApiError } from '../../utils/prismaErrors';
import { sanitizeUser } from '../../utils/sanitizeUser';
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from './user.dto';

const SALT_ROUNDS = 10;

export async function listUsers(query: ListUsersQuery) {
  const { page, pageSize, search, role } = query;
  const { skip, take } = getSkipTake(page, pageSize);

  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);

  return buildPaginatedResult(items.map(sanitizeUser), total, page, pageSize);
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw ApiError.notFound('Usuário não encontrado');
  }

  return sanitizeUser(user);
}

export async function createUser(data: CreateUserInput) {
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, role: data.role, passwordHash },
    });
    return sanitizeUser(user);
  } catch (err) {
    throw toApiError(err, 'Já existe um usuário com este e-mail');
  }
}

export async function updateUser(id: string, data: UpdateUserInput) {
  await getUserById(id);

  const { password, ...rest } = data;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(password ? { passwordHash: await bcrypt.hash(password, SALT_ROUNDS) } : {}),
      },
    });
    return sanitizeUser(user);
  } catch (err) {
    throw toApiError(err, 'Já existe um usuário com este e-mail');
  }
}

export async function deleteUser(id: string, requesterId: string) {
  if (id === requesterId) {
    throw ApiError.badRequest('Você não pode remover a própria conta');
  }

  await getUserById(id);

  try {
    await prisma.user.delete({ where: { id } });
  } catch (err) {
    throw toApiError(err, {
      fkMessage: 'Não é possível excluir: existem RMAs vinculados a este usuário',
    });
  }
}
