import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const VARIANTS = {
  primary:
    'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200',
  secondary:
    'bg-surface text-ink border border-line hover:bg-surface-sunken dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]',
  ghost:
    'text-ink-secondary hover:bg-surface-sunken hover:text-ink dark:hover:bg-white/[0.06]',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-500',
} as const;

const SIZES = {
  sm: 'h-8 px-3 text-xs rounded-lg',
  md: 'h-9 px-4 text-sm rounded-lg',
  lg: 'h-10 px-5 text-sm rounded-xl',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium select-none',
        'transition-all duration-instant active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-50 disabled:scale-100',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
