import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

/**
 * TodayTimeline (DESIGN §4): the 9-slot band on the room detail page.
 * Occupied hours are sunken; the CURRENT hour carries a 2px accent edge so
 * "now" is findable at a glance. Pure server component — no client JS.
 */
export function TodayTimeline({
  slots,
  nowTime,
}: {
  slots: { slot_start: string; slot_end: string; title: string; kind: string; source: string }[];
  nowTime: string;
}) {
  const now = nowTime.slice(0, 5);

  return (
    <ol className="flex gap-1.5 overflow-x-auto pb-1" aria-label="Today's schedule">
      {slots.map((s) => {
        const occupied = s.kind !== 'free' && s.source !== 'free';
        const current = now >= s.slot_start && now < s.slot_end;
        return (
          <li
            key={`${s.slot_start}-${s.slot_end}`}
            className={cn(
              'min-w-[104px] flex-1 rounded-sm p-2 text-left',
              occupied
                ? 'bg-surface-sunken text-ink-secondary'
                : 'bg-status-free-bg text-status-free',
              current && 'ring-2 ring-accent ring-offset-1 ring-offset-surface',
            )}
            aria-current={current ? 'time' : undefined}
          >
            <p className="font-mono text-[11px] leading-4 text-ink-tertiary">
              {s.slot_start}–{s.slot_end}
            </p>
            <p className="mt-1 line-clamp-2 text-[12px] font-medium leading-4">
              {occupied ? s.title : 'Free'}
            </p>
            {current && (
              <p className="mt-1 text-[11px] font-semibold text-accent">now</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
