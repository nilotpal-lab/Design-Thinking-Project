import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const VARIANTS = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-e1 shadow-accent/20 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]',
  secondary:
    'bg-surface text-ink border border-line/90 hover:bg-surface-sunken hover:border-line-strong dark:border-white/10 dark:hover:bg-surface-raised',
  ghost:
    'text-ink-secondary hover:bg-surface-sunken hover:text-ink dark:hover:bg-surface-raised',
  danger:
    'bg-status-busy text-white hover:opacity-90 shadow-e1 shadow-status-busy/20',
} as const;

const SIZES = {
  sm: 'h-8 px-3 text-[13px] rounded-lg',
  md: 'h-9 px-4 text-sm rounded-lg',
  lg: 'h-11 px-5 text-[15px] rounded-xl',
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
        'transition-all duration-instant ease-spring active:scale-[0.98]',
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
