import type { RmaPriority, RmaStatus } from './rma';

export interface DashboardRecentRma {
  id: string;
  rmaNumber: string;
  status: RmaStatus;
  priority: RmaPriority;
  createdAt: string;
  customer: { name: string };
  product: { name: string };
}

export interface DashboardStats {
  totalRmas: number;
  rmasThisMonth: number;
  avgResolutionDays: number;
  byStatus: Partial<Record<RmaStatus, number>>;
  byPriority: Partial<Record<RmaPriority, number>>;
  recentRmas: DashboardRecentRma[];
  rmasPerMonth: Array<{ month: string; count: number }>;
}
