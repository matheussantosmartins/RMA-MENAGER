import { STATUS_LABELS } from '../../constants/rma';
import { formatDateTime } from '../../utils/format';
import type { RmaStatusHistoryEntry } from '../../types/rma';

export function RmaStatusHistoryList({ history }: { history: RmaStatusHistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-slate-400">Sem histórico registrado</p>;
  }

  const entries = history.slice().reverse();

  return (
    <ol className="flex flex-col gap-5 border-l border-slate-200 pl-4">
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-white" />
          <p className="text-sm text-slate-800">
            {entry.fromStatus && (
              <>
                <span className="font-medium">{STATUS_LABELS[entry.fromStatus]}</span>
                {' → '}
              </>
            )}
            <span className="font-medium">{STATUS_LABELS[entry.toStatus]}</span>
          </p>
          {entry.note && <p className="mt-0.5 text-sm text-slate-600">{entry.note}</p>}
          <p className="mt-0.5 text-xs text-slate-400">
            {entry.changedBy.name} · {formatDateTime(entry.createdAt)}
          </p>
        </li>
      ))}
    </ol>
  );
}
