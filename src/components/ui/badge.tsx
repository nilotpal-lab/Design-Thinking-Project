import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const VARIANTS = {
  neutral: 'bg-surface-sunken text-ink-secondary',
  accent: 'bg-accent-subtle text-accent dark:text-accent',
  free: 'bg-status-free-bg text-status-free',
  soon: 'bg-status-soon-bg text-status-soon',
  busy: 'bg-status-busy-bg text-status-busy',
  unknown: 'bg-status-unknown-bg text-status-unknown',
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
        'inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-micro font-medium',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
});
