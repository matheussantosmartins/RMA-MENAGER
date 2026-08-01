import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeRmaStatus } from '../../api/rmas';
import { RMA_STATUS_TRANSITIONS } from '../../constants/rmaStatusMachine';
import { STATUS_LABELS } from '../../constants/rma';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { getErrorMessage } from '../../utils/errorMessage';
import type { RmaStatus } from '../../types/rma';

export function RmaStatusChanger({ rmaId, status }: { rmaId: string; status: RmaStatus }) {
  const queryClient = useQueryClient();
  const nextStatuses = RMA_STATUS_TRANSITIONS[status];
  const [nextStatus, setNextStatus] = useState<RmaStatus | ''>('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      changeRmaStatus(rmaId, { status: nextStatus as RmaStatus, note: note || undefined }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rma', rmaId] });
      void queryClient.invalidateQueries({ queryKey: ['rmas'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setNextStatus('');
      setNote('');
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  if (nextStatuses.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Este RMA está em um status final e não admite novas transições.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (nextStatus) mutation.mutate();
      }}
      className="flex flex-col gap-3"
    >
      {error && <Alert variant="error">{error}</Alert>}

      <Select
        label="Novo status"
        value={nextStatus}
        onChange={(e) => setNextStatus(e.target.value as RmaStatus | '')}
      >
        <option value="">Selecione o próximo status</option>
        {nextStatuses.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABELS[option]}
          </option>
        ))}
      </Select>

      <Textarea
        label="Observação (opcional)"
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Detalhe o motivo da mudança de status"
      />

      <Button
        type="submit"
        disabled={!nextStatus}
        isLoading={mutation.isPending}
        className="self-end"
      >
        Atualizar status
      </Button>
    </form>
  );
}
