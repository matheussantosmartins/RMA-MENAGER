import { clsx } from 'clsx';
import { STATUS_COLORS, STATUS_LABELS } from '../../constants/rma';
import type { RmaStatus } from '../../types/rma';

export function StatusBadge({ status }: { status: RmaStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_COLORS[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
