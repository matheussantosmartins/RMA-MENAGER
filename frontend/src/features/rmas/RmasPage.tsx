import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { listRmas } from '../../api/rmas';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import {
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
  STATUS_LABELS,
  STATUS_OPTIONS,
} from '../../constants/rma';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatDate } from '../../utils/format';
import type { RmaPriority, RmaStatus } from '../../types/rma';

const PAGE_SIZE = 10;

export function RmasPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<RmaStatus | ''>('');
  const [priority, setPriority] = useState<RmaPriority | ''>('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['rmas', page, search, status, priority],
    queryFn: () =>
      listRmas({
        page,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined,
      }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">RMAs</h1>
          <p className="text-sm text-slate-500">Acompanhe as devoluções e garantias em andamento</p>
        </div>
        <Button onClick={() => navigate('/rmas/new')}>
          <Plus className="h-4 w-4" />
          Novo RMA
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <SearchInput
          placeholder="Buscar por número, cliente, produto..."
          onSearch={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
        <div className="w-44">
          <Select
            aria-label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as RmaStatus | '');
              setPage(1);
            }}
          >
            <option value="">Todos os status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {STATUS_LABELS[option]}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-40">
          <Select
            aria-label="Prioridade"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as RmaPriority | '');
              setPage(1);
            }}
          >
            <option value="">Todas as prioridades</option>
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {PRIORITY_LABELS[option]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner className="h-6 w-6" />
          </div>
        ) : isError ? (
          <div className="p-4">
            <Alert variant="error">{getErrorMessage(error)}</Alert>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-2">RMA</th>
                    <th className="px-4 py-2">Cliente</th>
                    <th className="px-4 py-2">Produto</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Prioridade</th>
                    <th className="px-4 py-2">Criado em</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.items.map((rma) => (
                    <tr key={rma.id} className="cursor-pointer hover:bg-slate-50">
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
                  {data?.items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        Nenhum RMA encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && <Pagination meta={data.meta} onPageChange={setPage} />}
          </>
        )}
      </div>
    </div>
  );
}
