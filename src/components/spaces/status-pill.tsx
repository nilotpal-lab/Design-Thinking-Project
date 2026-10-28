import { CircleCheck, CircleSlash, Clock, CircleHelp } from 'lucide-react';

import { cn, formatMinutes, formatTime } from '@/lib/utils';

export type RoomStatus = 'free' | 'soon' | 'busy' | 'unknown';

const CONFIG = {
  free: {
    label: 'Free now',
    dot: 'bg-emerald-500',
    cls: 'text-[#1B4332] bg-[#EAF7EE] border-[#C3D9CB] dark:text-[#74C69D] dark:bg-[#2D6A4F]/25 dark:border-[#2D6A4F]/40 font-medium',
  },
  soon: {
    label: 'Free soon',
    dot: 'bg-amber-500',
    cls: 'text-[#8C590E] bg-[#FEF7E6] border-[#F9E4B5] dark:text-amber-300 dark:bg-amber-500/15 dark:border-amber-500/30 font-medium',
  },
  busy: {
    label: 'In session',
    dot: 'bg-rose-500',
    cls: 'text-[#BE123C] bg-[#FDF2F4] border-[#FBCFE8] dark:text-rose-300 dark:bg-rose-500/15 dark:border-rose-500/30 font-medium',
  },
  unknown: {
    label: 'No data',
    dot: 'bg-zinc-400',
    cls: 'text-ink-tertiary bg-surface-sunken border-line',
  },
} as const;

export function StatusPill({
  status,
  freeMinutes,
  occupiedUntil,
  className,
}: {
  status: RoomStatus;
  freeMinutes?: number | null;
  occupiedUntil?: string | null;
  className?: string;
}) {
  const c = CONFIG[status] ?? CONFIG.unknown;

  const detail =
    status === 'free' && freeMinutes != null
      ? `${formatMinutes(freeMinutes)}`
      : status === 'busy' && occupiedUntil
        ? `until ${formatTime(occupiedUntil)}`
        : null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors',
        c.cls,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      <span>{c.label}</span>
      {detail && <span className="opacity-70 font-mono">({detail})</span>}
    </span>
  );
}
