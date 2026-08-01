import type { RmaStatus } from '../types/rma';

export const RMA_STATUS_TRANSITIONS: Record<RmaStatus, RmaStatus[]> = {
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['IN_REPAIR', 'REJECTED', 'CANCELLED'],
  IN_REPAIR: ['REPAIRED', 'REPLACED', 'REFUNDED', 'CANCELLED'],
  REPAIRED: ['CLOSED'],
  REPLACED: ['CLOSED'],
  REFUNDED: ['CLOSED'],
  REJECTED: ['CLOSED'],
  CANCELLED: [],
  CLOSED: [],
};
