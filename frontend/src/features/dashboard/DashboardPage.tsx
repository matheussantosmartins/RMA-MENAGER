import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ClipboardList, Clock, PackageSearch, TimerReset } from 'lucide-react';
import { getDashboardStats } from '../../api/dashboard';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { STATUS_CHART_COLORS, STATUS_LABELS } from '../../constants/rma';
import type { RmaStatus } from '../../types/rma';
import { formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errorMessage';

export function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="error">
        {getErrorMessage(error, 'Não foi possível carregar o dashboard')}
      </Alert>
    );
  }

  const statusData = Object.entries(data.byStatus).map(([status, count]) => ({
    status: status as RmaStatus,
    name: STATUS_LABELS[status as RmaStatus],
    value: count ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Visão geral dos RMAs da operação</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de RMAs" value={data.totalRmas} icon={PackageSearch} />
        <StatCard label="RMAs este mês" value={data.rmasThisMonth} icon={ClipboardList} />
        <StatCard
          label="Pendentes"
          value={data.byStatus.PENDING ?? 0}
          icon={Clock}
          hint="Aguardando triagem"
        />
        <StatCard
          label="Tempo médio de resolução"
          value={`${data.avgResolutionDays} dias`}
          icon={TimerReset}
          hint="RMAs encerrados"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">RMAs por mês</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.rmasPerMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" name="RMAs" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">RMAs por status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          Últimos RMAs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">RMA</th>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Produto</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Prioridade</th>
                <th className="px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentRmas.map((rma) => (
                <tr key={rma.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-brand-700">
                    <Link to={`/rmas/${rma.id}`}>{rma.rmaNumber}</Link>
                  </td>
                  <td className="px-4 py-2 text-slate-700">{rma.customer.name}</td>
                  <td className="px-4 py-2 text-slate-700">{rma.product.name}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={rma.status} />
                  </td>
                  <td className="px-4 py-2">
                    <PriorityBadge priority={rma.priority} />
                  </td>
                  <td className="px-4 py-2 text-slate-500">{formatDate(rma.createdAt)}</td>
                </tr>
              ))}
              {data.recentRmas.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    Nenhum RMA cadastrado ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
