import { clsx } from 'clsx';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface AlertProps {
  variant?: 'error' | 'success';
  children: ReactNode;
}

export function Alert({ variant = 'error', children }: AlertProps) {
  const Icon = variant === 'error' ? AlertTriangle : CheckCircle2;

  return (
    <div
      className={clsx(
        'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
        variant === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700',
      )}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
