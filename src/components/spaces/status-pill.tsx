import { CircleCheck, CircleSlash, Clock, CircleHelp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn, formatMinutes, formatTime } from '@/lib/utils';

export type RoomStatus = 'free' | 'soon' | 'busy' | 'unknown';

const CONFIG = {
  free: { label: 'Free now', icon: CircleCheck, cls: 'free' as const },
  soon: { label: 'Free soon', icon: Clock, cls: 'soon' as const },
  busy: { label: 'In session', icon: CircleSlash, cls: 'busy' as const },
  unknown: { label: 'No data', icon: CircleHelp, cls: 'unknown' as const },
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
  const Icon = c.icon;

  const detail =
    status === 'free' && freeMinutes != null
      ? `(${formatMinutes(freeMinutes)})`
      : status === 'busy' && occupiedUntil
        ? `(${formatTime(occupiedUntil)})`
        : null;

  return (
    <Badge
      variant={c.cls}
      className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11px] normal-case tracking-normal', className)}
    >
      {status === 'free' ? (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      ) : (
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      )}
      <span className="font-semibold">{c.label}</span>
      {detail && <span className="font-mono text-[11px] font-normal opacity-85">{detail}</span>}
    </Badge>
  );
}
