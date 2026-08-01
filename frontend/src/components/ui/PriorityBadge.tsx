import { clsx } from 'clsx';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../../constants/rma';
import type { RmaPriority } from '../../types/rma';

export function PriorityBadge({ priority }: { priority: RmaPriority }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        PRIORITY_COLORS[priority],
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
