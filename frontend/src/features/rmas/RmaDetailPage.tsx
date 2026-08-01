import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { deleteRma, getRma } from '../../api/rmas';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PriorityBadge } from '../../components/ui/PriorityBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RmaStatusChanger } from './RmaStatusChanger';
import { RmaStatusHistoryList } from './RmaStatusHistoryList';
import { RmaImageGallery } from './RmaImageGallery';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatDateTime } from '../../utils/format';

export function RmaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: rma,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['rma', id],
    queryFn: () => getRma(id!),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteRma(id!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rmas'] });
      navigate('/rmas');
    },
    onError: (err) => setDeleteError(getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError || !rma) {
    return <Alert variant="error">{getErrorMessage(error, 'RMA não encontrado')}</Alert>;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          to="/rmas"
          className="flex w-fit items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para RMAs
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(`/rmas/${rma.id}/edit`)}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      {deleteError && <Alert variant="error">{deleteError}</Alert>}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-slate-900">{rma.rmaNumber}</h1>
          <div className="flex gap-2">
            <StatusBadge status={rma.status} />
            <PriorityBadge priority={rma.priority} />
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Cliente</dt>
            <dd className="font-medium text-slate-800">{rma.customer.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Produto</dt>
            <dd className="font-medium text-slate-800">{rma.product.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Número de série</dt>
            <dd className="font-medium text-slate-800">{rma.serialNumber ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Atribuído a</dt>
            <dd className="font-medium text-slate-800">
              {rma.assignedTo?.name ?? 'Não atribuído'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Criado por</dt>
            <dd className="font-medium text-slate-800">{rma.createdBy.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Criado em</dt>
            <dd className="font-medium text-slate-800">{formatDateTime(rma.createdAt)}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <dt className="text-sm text-slate-500">Descrição do problema</dt>
          <dd className="mt-1 text-sm text-slate-800">{rma.issueDescription}</dd>
        </div>

        {rma.resolutionNotes && (
          <div className="mt-4">
            <dt className="text-sm text-slate-500">Notas de resolução</dt>
            <dd className="mt-1 text-sm text-slate-800">{rma.resolutionNotes}</dd>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Alterar status</h2>
          <RmaStatusChanger rmaId={rma.id} status={rma.status} />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Imagens</h2>
          <RmaImageGallery rmaId={rma.id} images={rma.images} />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Histórico de status</h2>
        <RmaStatusHistoryList history={rma.statusHistory} />
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir RMA"
          description={`Tem certeza que deseja excluir o RMA "${rma.rmaNumber}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          isLoading={deleteMutation.isPending}
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => deleteMutation.mutate()}
        />
      )}
    </div>
  );
}
