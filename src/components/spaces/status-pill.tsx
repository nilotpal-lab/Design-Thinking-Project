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

/**
 * The most-reused element in the app (DESIGN §4). Status is never colour
 * alone: every state pairs an icon + text label, with the optional duration
 * ("free for 1h 45m" / "until 2:30 PM").
 */
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
      ? `for ${formatMinutes(freeMinutes)}`
      : status === 'busy' && occupiedUntil
        ? `until ${formatTime(occupiedUntil)}`
        : null;

  return (
    <Badge variant={c.cls} className={cn('whitespace-nowrap', className)}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{c.label}</span>
      {detail && <span className="text-ink-secondary font-mono-tabular">{detail}</span>}
    </Badge>
  );
}
