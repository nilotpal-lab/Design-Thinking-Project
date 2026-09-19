import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const VARIANTS = {
  neutral:
    'bg-surface-sunken text-ink-secondary ring-1 ring-inset ring-line/60 dark:ring-white/[0.06]',
  accent:
    'bg-accent-subtle text-accent ring-1 ring-inset ring-accent/20 dark:text-accent-hover',
  free:
    'bg-status-free-bg text-status-free ring-1 ring-inset ring-status-free/20 font-semibold',
  soon:
    'bg-status-soon-bg text-status-soon ring-1 ring-inset ring-status-soon/20 font-semibold',
  busy:
    'bg-status-busy-bg text-status-busy ring-1 ring-inset ring-status-busy/20 font-semibold',
  unknown:
    'bg-status-unknown-bg text-status-unknown ring-1 ring-inset ring-status-unknown/20',
} as const;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof VARIANTS;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant = 'neutral', ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-micro uppercase tracking-wide',
        'transition-colors duration-fast',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
});
