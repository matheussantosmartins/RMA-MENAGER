import { Prisma } from '@prisma/client';
import { ApiError } from './apiError';

interface PrismaErrorMessages {
  conflictMessage?: string;
  fkMessage?: string;
}

/** Converte erros conhecidos do Prisma (ex: violação de unicidade, FK) em ApiError apropriado. */
export function toApiError(err: unknown, messages: PrismaErrorMessages | string = {}): ApiError {
  const {
    conflictMessage = 'Registro já existe',
    fkMessage = 'Não é possível concluir: existem registros vinculados',
  } = typeof messages === 'string' ? { conflictMessage: messages } : messages;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return ApiError.conflict(conflictMessage);
    }
    if (err.code === 'P2025') {
      return ApiError.notFound('Registro não encontrado');
    }
    if (err.code === 'P2003') {
      return ApiError.conflict(fkMessage);
    }
  }

  if (err instanceof ApiError) {
    return err;
  }

  throw err;
}
