import type { RmaPriority } from './rma';

export interface RmaFormInput {
  customerId: string;
  productId: string;
  serialNumber?: string;
  issueDescription: string;
  priority: RmaPriority;
  assignedToId?: string;
}
