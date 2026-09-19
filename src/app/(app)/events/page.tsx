import Link from 'next/link';
import { CalendarDays, CalendarClock, MapPin } from 'lucide-react';

import { getEventsOnDay, getUpcomingEvents, type CampusEvent } from '@/server/queries/events';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Campus Events' };

/* Category chips have no semantic tokens; Tailwind palette tints are the
   accepted exception for data-viz-style distinctions (solid palette colors,
   so /15 opacity works — unlike the hex CSS vars). */
const CATEGORY_STYLE: Record<string, string> = {
  fest: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300',
  workshop: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  seminar: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300',
  exam: 'bg-red-500/15 text-red-700 dark:text-red-300',
  club: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  sports: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
  cultural: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
  other: 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-300',
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
    <Card className={ev.isCancelled ? 'opacity-60' : ''}>
      <CardContent className="flex gap-3 p-4">
        <div className="w-14 shrink-0 text-center">
          {ev.allDay ? (
            <p className="pt-1 text-micro font-semibold uppercase tracking-wide text-ink-tertiary">
              All day
            </p>
          ) : (
            <>
              <p className="font-mono text-sm font-semibold">{fmtTime(ev.startsAt)}</p>
              {ev.endsAt && (
                <p className="font-mono text-micro text-ink-tertiary">{fmtTime(ev.endsAt)}</p>
              )}
            </>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={`text-[15px] font-medium leading-tight ${ev.isCancelled ? 'line-through' : ''}`}>
              {ev.title}
            </p>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-micro font-semibold uppercase tracking-wide',
                CATEGORY_STYLE[ev.category] ?? CATEGORY_STYLE.other,
              )}
            >
              {ev.category}
            </span>
            {ev.isCancelled && <Badge variant="neutral" className="text-micro">cancelled</Badge>}
            {dayLabel && <span className="text-micro text-ink-tertiary">· {dayLabel}</span>}
          </div>
          {ev.description && (
            <p className="mt-1 line-clamp-2 text-[13px] text-ink-secondary">{ev.description}</p>
          )}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-ink-tertiary">
            {ev.venueSlug ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <Link
                  href={`/spaces/${ev.venueSlug}`}
                  className="font-medium text-accent hover:underline"
                >
                  {ev.venueCode}
                </Link>
              </span>
            ) : ev.venueText ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {ev.venueText}
              </span>
            ) : null}
            {ev.organizer && <span>by {ev.organizer}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const inputCls =
  'h-9 rounded border border-line-strong bg-canvas px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent';

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
      <header className="space-y-1">
        <h1 className="text-[22px] font-semibold tracking-tight">Campus Events</h1>
        <p className="text-[13px] text-ink-secondary">
          Fests, workshops, exams and club meets — what&apos;s on, and what&apos;s coming.
        </p>
      </header>

      {/* Date jump: plain GET form, no JS needed */}
      <form action="/events" className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-[13px] text-ink-secondary">
          <CalendarDays className="h-4 w-4 text-ink-tertiary" />
          Events on
          <input type="date" name="date" defaultValue={viewDate} className={inputCls} />
        </label>
        <button
          type="submit"
          className="h-9 rounded bg-accent px-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Go
        </button>
        {!isToday && (
          <Link
            href="/events"
            className="text-[13px] text-ink-tertiary hover:text-ink hover:underline"
          >
            Back to today
          </Link>
        )}
      </form>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-micro font-semibold uppercase tracking-wide text-ink-tertiary">
          <CalendarClock className="h-4 w-4" /> {fmtDayLabel(viewDate)}
        </h2>
        {dayEvents.length ? (
          dayEvents.map((ev) => <EventCard key={ev.id} ev={ev} />)
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-sm text-ink-secondary">
              Nothing scheduled on this day.
            </CardContent>
          </Card>
        )}
      </section>

      {isToday && upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-micro font-semibold uppercase tracking-wide text-ink-tertiary">
            Coming up next
          </h2>
          {upcoming.map((ev) => {
            const evDate = new Date(ev.startsAt).toLocaleDateString('en-CA', {
              timeZone: 'Asia/Kolkata',
            });
            return <EventCard key={ev.id} ev={ev} dayLabel={fmtDayLabel(evDate)} />;
          })}
        </section>
      )}
    </div>
  );
}
