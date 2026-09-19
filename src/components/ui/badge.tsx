import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const VARIANTS = {
  neutral:
    'bg-surface-sunken text-ink-secondary border border-line dark:border-white/[0.08] dark:bg-white/[0.04]',
  accent:
    'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold',
  free:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium',
  soon:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium',
  busy:
    'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium',
  unknown:
    'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20',
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
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-micro tracking-normal',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
});
