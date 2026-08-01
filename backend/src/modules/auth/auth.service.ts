import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { ApiError } from '../../utils/apiError';
import { sanitizeUser } from '../../utils/sanitizeUser';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import type { LoginInput } from './auth.dto';

async function issueTokens(userId: string, role: 'ADMIN' | 'TECHNICIAN') {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId });
  return { accessToken, refreshToken };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw ApiError.unauthorized('E-mail ou senha inválidos');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw ApiError.unauthorized('E-mail ou senha inválidos');
  }

  const tokens = await issueTokens(user.id, user.role);

  return { user: sanitizeUser(user), ...tokens };
}

export async function refreshSession(refreshToken: string) {
  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Refresh token inválido ou expirado');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  if (!user) {
    throw ApiError.unauthorized('Usuário não encontrado');
  }

  const tokens = await issueTokens(user.id, user.role);

  return { user: sanitizeUser(user), ...tokens };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw ApiError.notFound('Usuário não encontrado');
  }

  return sanitizeUser(user);
}
