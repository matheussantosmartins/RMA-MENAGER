import type { Prisma } from '@prisma/client';

type TransactionClient = Prisma.TransactionClient;

/** Gera o próximo número de RMA no formato RMA-<ano>-<sequencial5>. */
export async function generateRmaNumber(tx: TransactionClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RMA-${year}-`;

  const count = await tx.rma.count({ where: { rmaNumber: { startsWith: prefix } } });

  return `${prefix}${String(count + 1).padStart(5, '0')}`;
}
