import { RmaStatus } from '@prisma/client';

/** Grafo de transições de status permitidas para um RMA. */
export const RMA_STATUS_TRANSITIONS: Record<RmaStatus, RmaStatus[]> = {
  [RmaStatus.PENDING]: [RmaStatus.APPROVED, RmaStatus.REJECTED, RmaStatus.CANCELLED],
  [RmaStatus.APPROVED]: [RmaStatus.IN_REPAIR, RmaStatus.REJECTED, RmaStatus.CANCELLED],
  [RmaStatus.IN_REPAIR]: [
    RmaStatus.REPAIRED,
    RmaStatus.REPLACED,
    RmaStatus.REFUNDED,
    RmaStatus.CANCELLED,
  ],
  [RmaStatus.REPAIRED]: [RmaStatus.CLOSED],
  [RmaStatus.REPLACED]: [RmaStatus.CLOSED],
  [RmaStatus.REFUNDED]: [RmaStatus.CLOSED],
  [RmaStatus.REJECTED]: [RmaStatus.CLOSED],
  [RmaStatus.CANCELLED]: [],
  [RmaStatus.CLOSED]: [],
};

export function canTransition(from: RmaStatus, to: RmaStatus): boolean {
  return RMA_STATUS_TRANSITIONS[from].includes(to);
}

export const TERMINAL_STATUSES: RmaStatus[] = [RmaStatus.CLOSED, RmaStatus.CANCELLED];
