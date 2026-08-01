import type { RmaPriority, RmaStatus } from '../types/rma';

export const STATUS_LABELS: Record<RmaStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  IN_REPAIR: 'Em reparo',
  REPAIRED: 'Reparado',
  REPLACED: 'Substituído',
  REFUNDED: 'Reembolsado',
  CLOSED: 'Encerrado',
  CANCELLED: 'Cancelado',
};

export const STATUS_COLORS: Record<RmaStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-red-100 text-red-800',
  IN_REPAIR: 'bg-indigo-100 text-indigo-800',
  REPAIRED: 'bg-teal-100 text-teal-800',
  REPLACED: 'bg-cyan-100 text-cyan-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  CLOSED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-slate-200 text-slate-700',
};

export const STATUS_CHART_COLORS: Record<RmaStatus, string> = {
  PENDING: '#f59e0b',
  APPROVED: '#3b82f6',
  REJECTED: '#ef4444',
  IN_REPAIR: '#6366f1',
  REPAIRED: '#14b8a6',
  REPLACED: '#06b6d4',
  REFUNDED: '#a855f7',
  CLOSED: '#10b981',
  CANCELLED: '#94a3b8',
};

export const PRIORITY_LABELS: Record<RmaPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const PRIORITY_COLORS: Record<RmaPriority, string> = {
  LOW: 'bg-slate-100 text-slate-700',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export const STATUS_OPTIONS = Object.keys(STATUS_LABELS) as RmaStatus[];
export const PRIORITY_OPTIONS = Object.keys(PRIORITY_LABELS) as RmaPriority[];
