export type RmaStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_REPAIR'
  | 'REPAIRED'
  | 'REPLACED'
  | 'REFUNDED'
  | 'CLOSED'
  | 'CANCELLED';

export type RmaPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface RmaCustomerRef {
  id: string;
  name: string;
  email?: string;
}

export interface RmaProductRef {
  id: string;
  name: string;
  sku?: string;
}

export interface RmaUserRef {
  id: string;
  name: string;
}

export interface RmaListItem {
  id: string;
  rmaNumber: string;
  serialNumber: string | null;
  issueDescription: string;
  status: RmaStatus;
  priority: RmaPriority;
  createdAt: string;
  updatedAt: string;
  customer: RmaCustomerRef;
  product: RmaProductRef;
  assignedTo: RmaUserRef | null;
}

export interface RmaImage {
  id: string;
  url: string;
  filename: string;
  createdAt: string;
}

export interface RmaStatusHistoryEntry {
  id: string;
  fromStatus: RmaStatus | null;
  toStatus: RmaStatus;
  note: string | null;
  createdAt: string;
  changedBy: RmaUserRef;
}

export interface RmaDetail extends RmaListItem {
  resolutionNotes: string | null;
  createdBy: RmaUserRef;
  images: RmaImage[];
  statusHistory: RmaStatusHistoryEntry[];
}
