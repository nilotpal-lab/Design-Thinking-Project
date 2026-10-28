import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const VARIANTS = {
  neutral:
    'bg-surface-sunken text-ink-secondary border border-line dark:border-white/[0.08] dark:bg-white/[0.04]',
  accent:
    'bg-[#1B4332] text-white dark:bg-[#2D6A4F] font-semibold border border-[#2D5A44]/40',
  free:
    'bg-[#EAF7EE] text-[#1B4332] border border-[#C3D9CB] font-medium dark:bg-[#2D6A4F]/20 dark:text-[#74C69D] dark:border-[#2D6A4F]/40',
  soon:
    'bg-[#FEF7E6] text-[#8C590E] border border-[#F9E4B5] font-medium dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
  busy:
    'bg-[#FDF2F4] text-[#BE123C] border border-[#FBCFE8] font-medium dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30',
  unknown:
    'bg-surface-sunken text-ink-tertiary border border-line',
  pastelMint:
    'bg-[#EAF5EE] text-[#1B4332] border border-[#C6E2CF] font-medium dark:bg-[#2D6A4F]/25 dark:text-[#74C69D] dark:border-[#2D6A4F]/40',
  pastelButter:
    'bg-[#FEF7E6] text-[#8C590E] border border-[#F9E4B5] font-medium dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  pastelSky:
    'bg-[#EBF4FB] text-[#165A8A] border border-[#C5E0F4] font-medium dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
  pastelLavender:
    'bg-[#F3EEF9] text-[#5E3A8C] border border-[#DDD0F0] font-medium dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
  pastelCoral:
    'bg-[#FDF0EE] text-[#992B1F] border border-[#F7CCC7] font-medium dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  pastelSage:
    'bg-[#EFF3EE] text-[#2E4D38] border border-[#C9D8CB] font-medium dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
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
