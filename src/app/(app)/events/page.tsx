import Link from 'next/link';
import { CalendarClock, CalendarDays, MapPin, Sparkles } from 'lucide-react';

import { getEventsOnDay, getUpcomingEvents, type CampusEvent } from '@/server/queries/events';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Campus Events & Workshops' };

const CATEGORY_STYLE: Record<string, string> = {
  fest: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 ring-1 ring-fuchsia-500/20',
  workshop: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500/20',
  seminar: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20',
  exam: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/20',
  club: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20',
  sports: 'bg-orange-500/10 text-orange-700 dark:text-orange-300 ring-1 ring-orange-500/20',
  cultural: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 ring-1 ring-purple-500/20',
  other: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 ring-1 ring-zinc-500/20',
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
    <Card
      className={cn(
        'rounded-2xl p-5 shadow-e1 transition-all duration-base hover:border-accent/40 hover:shadow-e2 dark:border-white/10',
        ev.isCancelled && 'opacity-60',
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Time Stamp Tile */}
        <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-line/80 bg-surface-sunken/60 py-2 dark:border-white/[0.06] dark:bg-white/[0.02]">
          {ev.allDay ? (
            <span className="font-mono text-micro font-extrabold uppercase tracking-wider text-ink-tertiary">
              All Day
            </span>
          ) : (
            <>
              <span className="font-mono text-sm font-extrabold text-ink">{fmtTime(ev.startsAt)}</span>
              {ev.endsAt && (
                <span className="font-mono text-[11px] font-semibold text-ink-tertiary">
                  {fmtTime(ev.endsAt)}
                </span>
              )}
            </>
          )}
        </div>

        {/* Event Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={cn('text-base font-bold text-ink', ev.isCancelled && 'line-through')}>
              {ev.title}
            </h3>
            <span
              className={cn(
                'rounded-lg px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
                CATEGORY_STYLE[ev.category] ?? CATEGORY_STYLE.other,
              )}
            >
              {ev.category}
            </span>
            {ev.isCancelled && <Badge variant="neutral">Cancelled</Badge>}
            {dayLabel && <span className="font-mono text-micro text-ink-tertiary">· {dayLabel}</span>}
          </div>

          {ev.description && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-secondary">
              {ev.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line/60 pt-3 text-[12px] font-medium text-ink-secondary dark:border-white/[0.06]">
            {ev.venueSlug ? (
              <span className="inline-flex items-center gap-1.5 text-accent dark:text-accent-hover">
                <MapPin className="h-3.5 w-3.5" />
                <Link href={`/spaces/${ev.venueSlug}`} className="font-semibold hover:underline">
                  {ev.venueCode}
                </Link>
              </span>
            ) : ev.venueText ? (
              <span className="inline-flex items-center gap-1.5 text-ink-tertiary">
                <MapPin className="h-3.5 w-3.5" /> {ev.venueText}
              </span>
            ) : null}
            {ev.organizer && <span className="text-ink-tertiary">Organized by {ev.organizer}</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}

const inputCls =
  'h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:bg-surface/80';

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
    <div className="mx-auto w-full max-w-4xl space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-subtle px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent dark:text-accent-hover">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Campus Life & Schedules</span>
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink md:text-3xl">
          Campus Events & Workshops
        </h1>
        <p className="mt-1 text-[13px] text-ink-secondary">
          Fests, hackathons, guest lectures, and student club meets happening across Jain University.
        </p>
      </div>

      {/* Date jump form */}
      <form
        action="/events"
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-line/80 bg-surface/80 p-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#121215]"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-ink-secondary">
          <CalendarDays className="h-4 w-4 text-accent" />
          <span>Select Date:</span>
          <input type="date" name="date" defaultValue={viewDate} className={inputCls} />
        </div>
        <button
          type="submit"
          className="h-10 rounded-xl bg-accent px-5 text-sm font-bold text-white shadow-glow-accent transition-all hover:bg-accent-hover active:scale-95"
        >
          View Events
        </button>
        {!isToday && (
          <Link
            href="/events"
            className="text-[13px] font-semibold text-accent hover:underline dark:text-accent-hover"
          >
            Jump to Today
          </Link>
        )}
      </form>

      {/* Events on Selected Date */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-tertiary">
          <CalendarClock className="h-4 w-4 text-accent" />
          <span>{fmtDayLabel(viewDate)} ({dayEvents.length})</span>
        </h2>
        {dayEvents.length ? (
          <div className="space-y-3">
            {dayEvents.map((ev) => (
              <EventCard key={ev.id} ev={ev} />
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl p-10 text-center">
            <p className="text-sm font-semibold text-ink-secondary">
              No campus events scheduled on this day.
            </p>
          </Card>
        )}
      </section>

      {/* Upcoming Events */}
      {isToday && upcoming.length > 0 && (
        <section className="space-y-4 border-t border-line/60 pt-6 dark:border-white/[0.06]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
            Coming Up This Week
          </h2>
          <div className="space-y-3">
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
