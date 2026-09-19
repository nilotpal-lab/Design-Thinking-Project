import { CircleCheck, CircleSlash, Clock, CircleHelp } from 'lucide-react';

import { cn, formatMinutes, formatTime } from '@/lib/utils';

export type RoomStatus = 'free' | 'soon' | 'busy' | 'unknown';

const CONFIG = {
  free: {
    label: 'Free now',
    dot: 'bg-emerald-500',
    cls: 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400',
  },
  soon: {
    label: 'Free soon',
    dot: 'bg-amber-500',
    cls: 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-400',
  },
  busy: {
    label: 'In session',
    dot: 'bg-rose-500',
    cls: 'text-rose-700 bg-rose-500/10 border-rose-500/20 dark:text-rose-400',
  },
  unknown: {
    label: 'No data',
    dot: 'bg-zinc-400',
    cls: 'text-zinc-600 bg-zinc-500/10 border-zinc-500/20 dark:text-zinc-400',
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
