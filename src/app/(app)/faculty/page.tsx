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
  weekday: 'short',
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
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium', s.cls)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}

const inputCls =
  'h-9 rounded-lg border border-line bg-surface px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/[0.08] dark:bg-[#111113] dark:text-zinc-200';

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
    <div className="space-y-6">
      {/* Editorial Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Faculty Presence Tracker
          </h1>
          <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
            {todayLabel}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Find current lecture locations, office cabin rooms, and consultation hours for department faculty.
        </p>
      </div>

      {/* Search & Dept Filters */}
      <form
        className="flex flex-wrap items-center gap-2.5 rounded-xl border border-line bg-surface p-2.5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]"
        action="/faculty"
      >
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input
            name="q"
            aria-label="Search faculty by name, department or cabin"
            defaultValue={sp.q ?? ''}
            placeholder="Search professor name, dept, cabin…"
            className={cn(inputCls, 'w-full pl-8')}
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
          className="h-9 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Search
        </button>
        { (sp.q || sp.dept) && (
          <Link
            href="/faculty"
            className="text-xs font-medium text-zinc-500 hover:text-ink hover:underline dark:text-zinc-400"
          >
            Reset
          </Link>
        )}
      </form>

      {/* Faculty Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {ordered.map((f) => (
          <div
            key={f.id}
            className="rounded-xl border border-line bg-surface p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]"
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={f.name} className="h-9 w-9 text-xs font-bold" />
                  <div>
                    <h3 className="text-sm font-bold text-ink">{f.name}</h3>
                    <p className="text-[11px] text-zinc-400">
                      {f.department ?? 'Faculty Member'}
                    </p>
                  </div>
                </div>
                <StatusPill status={f.status} />
              </div>

              {/* Lecture Slots */}
              {f.slots.length > 0 ? (
                <div className="rounded-lg border border-line/60 bg-surface-sunken/40 p-2.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Today&apos;s Schedule
                  </p>
                  <ul className="mt-1.5 space-y-1 text-xs">
                    {f.slots.slice(0, 3).map((s, i) => (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-zinc-400">
                          {s.start}–{s.end}
                        </span>
                        <span className="truncate text-zinc-700 dark:text-zinc-300">{s.title}</span>
                        {s.roomSlug && (
                          <Link
                            href={`/spaces/${s.roomSlug}`}
                            className="font-mono text-[11px] font-semibold text-ink hover:underline dark:text-white"
                          >
                            {s.roomCode}
                          </Link>
                        )}
                      </li>
                    ))}
                    {f.slots.length > 3 && (
                      <li className="font-mono text-[10px] text-zinc-400">
                        +{f.slots.length - 3} more classes today
                      </li>
                    )}
                  </ul>
                </div>
              ) : (
                <p className="rounded-lg bg-surface-sunken/30 p-2 text-center text-[11px] text-zinc-400">
                  No lecture classes scheduled for today.
                </p>
              )}

              {/* Cabin & Office Hours */}
              <div className="border-t border-line/60 pt-2.5 text-[11px] dark:border-white/[0.06]">
                {f.cabin ? (
                  <p className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                    <DoorClosed className="h-3.5 w-3.5 text-zinc-400" />
                    <span>
                      Office Cabin:{' '}
                      <Link
                        href={`/spaces/${f.cabin.slug}`}
                        className="font-semibold text-ink hover:underline dark:text-white"
                      >
                        {f.cabin.code}
                      </Link>
                      <span className="text-zinc-400">
                        {' '}
                        · {f.cabin.block} L{f.cabin.floor}
                      </span>
                    </span>
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-zinc-400">
                    <MapPin className="h-3 w-3" /> Cabin unassigned
                  </p>
                )}
                {f.cabinNote && <p className="mt-0.5 text-[10px] text-zinc-400">{f.cabinNote}</p>}
                {f.officeHours && (
                  <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                    Consultation: <span className="font-semibold text-ink">{f.officeHours}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {ordered.length === 0 && (
        <div className="rounded-xl border border-dashed border-line p-8 text-center dark:border-white/[0.08]">
          <p className="text-xs font-semibold text-zinc-400">
            No faculty members matched those filters.
          </p>
        </div>
      )}
    </div>
  );
}
