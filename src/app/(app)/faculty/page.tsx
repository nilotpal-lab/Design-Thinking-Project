import Link from 'next/link';
import { DoorClosed, MapPin, Search, Sparkles, User } from 'lucide-react';

import { getFacultyTracker } from '@/server/queries/faculty';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Faculty Presence Tracker' };

const todayLabel = new Date().toLocaleDateString('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'long',
  day: 'numeric',
  month: 'short',
});

const STATUS = {
  busy: { dot: 'bg-rose-500', label: 'Teaching Now', cls: 'text-rose-600 bg-rose-500/10 dark:text-rose-400' },
  soon: { dot: 'bg-amber-500', label: 'Free Soon', cls: 'text-amber-600 bg-amber-500/10 dark:text-amber-400' },
  free: { dot: 'bg-emerald-500', label: 'Available', cls: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' },
} as const;

function StatusPill({ status }: { status: keyof typeof STATUS }) {
  const s = STATUS[status] ?? STATUS.free;
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold', s.cls)}>
      <span className={cn('h-2 w-2 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}

const inputCls =
  'h-10 rounded-xl border border-line/80 bg-surface px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:bg-surface/80';

export default async function FacultyTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string; show?: string }>;
}) {
  const sp = await searchParams;
  const all = await getFacultyTracker();

  const withCabin = all.filter((f) => f.cabin);
  const withoutCabin = all.filter((f) => !f.cabin);
  let ordered = [...withCabin, ...withoutCabin];
  if (sp.show === 'cabin') ordered = ordered.filter((f) => f.cabin);

  const q = sp.q?.toLowerCase().trim();
  if (q) {
    ordered = ordered.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.department ?? '').toLowerCase().includes(q) ||
        (f.cabin?.code ?? '').toLowerCase().includes(q),
    );
  }
  const depts = [...new Set(all.map((f) => f.department).filter((d): d is string => !!d))].sort();
  if (sp.dept) ordered = ordered.filter((f) => f.department === sp.dept);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-subtle px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent dark:text-accent-hover">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Faculty & Staff Navigation</span>
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink md:text-3xl">
          Faculty Presence Tracker
        </h1>
        <p className="mt-1 text-[13px] text-ink-secondary">
          Know exactly where your professors are lecturing right now, their cabin rooms, and office
          consultation hours.
          <span className="mx-1.5">·</span>
          {todayLabel}
        </p>
      </div>

      {/* Search & Dept Filters */}
      <form
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-line/80 bg-surface/80 p-3 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#121215]"
        action="/faculty"
      >
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          <input
            name="q"
            aria-label="Search faculty by name, department or cabin"
            defaultValue={sp.q ?? ''}
            placeholder="Search professor name, dept, cabin…"
            className={cn(inputCls, 'w-full pl-9')}
          />
        </div>
        <select name="dept" aria-label="Filter by department" defaultValue={sp.dept ?? ''} className={inputCls}>
          <option value="">All Departments</option>
          {depts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 rounded-xl bg-accent px-5 text-sm font-bold text-white shadow-glow-accent transition-all hover:bg-accent-hover active:scale-95"
        >
          Search
        </button>
        <Link
          href="/faculty"
          className="text-[13px] font-semibold text-ink-secondary hover:text-ink hover:underline"
        >
          Reset
        </Link>
      </form>

      {/* Faculty Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {ordered.map((f) => (
          <Card
            key={f.id}
            className="rounded-2xl p-5 shadow-e1 transition-all duration-base hover:border-accent/40 hover:shadow-e2 dark:border-white/10"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={f.name} className="h-11 w-11 text-sm font-bold shadow-sm" />
                  <div>
                    <h3 className="text-base font-bold text-ink">{f.name}</h3>
                    <p className="text-[12px] font-medium text-ink-tertiary">
                      {f.department ?? 'Faculty Member'}
                    </p>
                  </div>
                </div>
                <StatusPill status={f.status} />
              </div>

              {/* Lecture Slots */}
              {f.slots.length > 0 ? (
                <div className="rounded-xl border border-line/60 bg-surface-sunken/50 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-tertiary">
                    Today&apos;s Classes
                  </p>
                  <ul className="mt-2 space-y-1.5 text-[13px]">
                    {f.slots.slice(0, 3).map((s, i) => (
                      <li key={i} className="flex items-center justify-between gap-2 font-medium">
                        <span className="font-mono text-xs text-ink-secondary">
                          {s.start}–{s.end}
                        </span>
                        <span className="truncate text-ink">{s.title}</span>
                        {s.roomSlug && (
                          <Link
                            href={`/spaces/${s.roomSlug}`}
                            className="font-mono text-xs font-bold text-accent hover:underline dark:text-accent-hover"
                          >
                            {s.roomCode}
                          </Link>
                        )}
                      </li>
                    ))}
                    {f.slots.length > 3 && (
                      <li className="font-mono text-micro text-ink-tertiary">
                        +{f.slots.length - 3} more classes today
                      </li>
                    )}
                  </ul>
                </div>
              ) : (
                <p className="rounded-xl bg-surface-sunken/40 p-2.5 text-center text-[12px] text-ink-tertiary">
                  No lecture classes scheduled for today.
                </p>
              )}

              {/* Cabin & Office Hours */}
              <div className="border-t border-line/60 pt-3 text-[12px] font-medium dark:border-white/[0.06]">
                {f.cabin ? (
                  <p className="flex items-center gap-2 text-ink">
                    <DoorClosed className="h-4 w-4 text-accent" />
                    <span>
                      Office Cabin:{' '}
                      <Link
                        href={`/spaces/${f.cabin.slug}`}
                        className="font-bold text-accent hover:underline dark:text-accent-hover"
                      >
                        {f.cabin.code}
                      </Link>
                      <span className="text-ink-tertiary">
                        {' '}
                        · {f.cabin.block} L{f.cabin.floor}
                      </span>
                    </span>
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-ink-tertiary">
                    <MapPin className="h-3.5 w-3.5" /> Cabin room unassigned
                  </p>
                )}
                {f.cabinNote && <p className="mt-1 text-micro text-ink-tertiary">{f.cabinNote}</p>}
                {f.officeHours && (
                  <p className="mt-1 text-micro text-ink-secondary">
                    Consultation Hours: <span className="font-semibold">{f.officeHours}</span>
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {ordered.length === 0 && (
        <Card className="rounded-3xl border-dashed p-10 text-center">
          <p className="text-sm font-semibold text-ink-secondary">
            No faculty members matched those filters.
          </p>
        </Card>
      )}
    </div>
  );
}
