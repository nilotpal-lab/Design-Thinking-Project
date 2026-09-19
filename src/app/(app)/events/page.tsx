import Link from 'next/link';
import { CalendarClock, CalendarDays, MapPin } from 'lucide-react';

import { getEventsOnDay, getUpcomingEvents, type CampusEvent } from '@/server/queries/events';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Campus Events & Workshops' };

const CATEGORY_STYLE: Record<string, string> = {
  fest: 'bg-zinc-200/80 text-zinc-800 dark:bg-white/10 dark:text-zinc-200',
  workshop: 'bg-zinc-200/80 text-zinc-800 dark:bg-white/10 dark:text-zinc-200',
  seminar: 'bg-zinc-200/80 text-zinc-800 dark:bg-white/10 dark:text-zinc-200',
  exam: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
  club: 'bg-zinc-200/80 text-zinc-800 dark:bg-white/10 dark:text-zinc-200',
  sports: 'bg-zinc-200/80 text-zinc-800 dark:bg-white/10 dark:text-zinc-200',
  cultural: 'bg-zinc-200/80 text-zinc-800 dark:bg-white/10 dark:text-zinc-200',
  other: 'bg-zinc-200/80 text-zinc-800 dark:bg-white/10 dark:text-zinc-200',
};

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function fmtDayLabel(iso: string): string {
  const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const tomorrow = new Date(`${todayIso}T00:00:00+05:30`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  if (iso === todayIso) return 'Today';
  if (iso === tomorrow.toISOString().slice(0, 10)) return 'Tomorrow';
  return new Date(`${iso}T00:00:00+05:30`).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function EventCard({ ev, dayLabel }: { ev: CampusEvent; dayLabel?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-line bg-surface p-4 shadow-sm transition-all dark:border-white/[0.08] dark:bg-[#111113]',
        ev.isCancelled && 'opacity-60',
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Time Stamp Tile */}
        <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-line/60 bg-surface-sunken/60 py-1.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
          {ev.allDay ? (
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              All Day
            </span>
          ) : (
            <>
              <span className="font-mono text-xs font-bold text-ink">{fmtTime(ev.startsAt)}</span>
              {ev.endsAt && (
                <span className="font-mono text-[10px] font-medium text-zinc-400">
                  {fmtTime(ev.endsAt)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Event Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn('text-sm font-bold text-ink', ev.isCancelled && 'line-through')}>
              {ev.title}
            </h3>
            <span
              className={cn(
                'rounded px-1.5 py-0.2 font-mono text-[10px] font-medium uppercase tracking-wider',
                CATEGORY_STYLE[ev.category] ?? CATEGORY_STYLE.other,
              )}
            >
              {ev.category}
            </span>
            {ev.isCancelled && <span className="rounded bg-rose-500/10 px-1.5 py-0.2 font-mono text-[10px] text-rose-500">Cancelled</span>}
            {dayLabel && <span className="font-mono text-[10px] text-zinc-400">· {dayLabel}</span>}
          </div>

          {ev.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {ev.description}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line/60 pt-2 text-[11px] text-zinc-500 dark:border-white/[0.06] dark:text-zinc-400">
            {ev.venueSlug ? (
              <span className="inline-flex items-center gap-1 font-semibold text-ink dark:text-white">
                <MapPin className="h-3 w-3 text-zinc-400" />
                <Link href={`/spaces/${ev.venueSlug}`} className="hover:underline">
                  {ev.venueCode}
                </Link>
              </span>
            ) : ev.venueText ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 text-zinc-400" /> {ev.venueText}
              </span>
            ) : null}
            {ev.organizer && <span>· Organized by {ev.organizer}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  'h-9 rounded-lg border border-line bg-surface px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/[0.08] dark:bg-[#111113] dark:text-zinc-200';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const todayIso = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const viewDate = /^\d{4}-\d{2}-\d{2}$/.test(sp.date ?? '') ? sp.date! : todayIso;
  const isToday = viewDate === todayIso;

  const [dayEvents, upcoming] = await Promise.all([
    getEventsOnDay(viewDate),
    isToday ? getUpcomingEvents(10) : Promise.resolve([] as CampusEvent[]),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Editorial Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Campus Events & Workshops
          </h1>
          <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
            Schedule
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Workshops, fests, hackathons, and student club meets happening across campus.
        </p>
      </div>

      {/* Date jump form */}
      <form
        action="/events"
        className="flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]"
      >
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <CalendarDays className="h-3.5 w-3.5" />
          <span>Date:</span>
          <input type="date" name="date" defaultValue={viewDate} className={inputCls} />
        </div>
        <button
          type="submit"
          className="h-9 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          View Events
        </button>
        {!isToday && (
          <Link
            href="/events"
            className="text-xs font-medium text-zinc-500 hover:text-ink hover:underline dark:text-zinc-400"
          >
            Jump to Today
          </Link>
        )}
      </form>

      {/* Events on Selected Date */}
      <section className="space-y-3">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {fmtDayLabel(viewDate)} ({dayEvents.length})
        </h2>
        {dayEvents.length ? (
          <div className="space-y-2.5">
            {dayEvents.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line p-8 text-center dark:border-white/[0.08]">
            <p className="text-xs font-semibold text-zinc-400">
              No campus events scheduled on this day.
            </p>
          </div>
        )}
      </section>

      {/* Upcoming Events */}
      {isToday && upcoming.length > 0 && (
        <section className="space-y-3 border-t border-line/60 pt-6 dark:border-white/[0.06]">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Coming Up This Week
          </h2>
          <div className="space-y-2.5">
            {upcoming.map((ev) => {
              const evDate = new Date(ev.startsAt).toLocaleDateString('en-CA', {
                timeZone: 'Asia/Kolkata',
              });
              return <EventCard key={ev.id} ev={ev} dayLabel={fmtDayLabel(evDate)} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
