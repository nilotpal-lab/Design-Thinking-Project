import Link from 'next/link';
import { DoorClosed, MapPin, Search } from 'lucide-react';

import { getFacultyTracker } from '@/server/queries/faculty';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Faculty Tracker' };

const todayLabel = new Date().toLocaleDateString('en-IN', {
  timeZone: 'Asia/Kolkata',
  weekday: 'long',
  day: 'numeric',
  month: 'short',
});

const STATUS = {
  busy: { dot: 'bg-status-busy', label: 'Teaching now' },
  soon: { dot: 'bg-status-soon', label: 'Free soon' },
  free: { dot: 'bg-status-free', label: 'Free' },
} as const;

function StatusDot({ status }: { status: keyof typeof STATUS }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-micro font-medium">
      <span className={cn('h-2 w-2 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}

const inputCls =
  'h-9 rounded border border-line-strong bg-canvas px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent';

export default async function FacultyTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string; show?: string }>;
}) {
  const sp = await searchParams;
  const all = await getFacultyTracker();

  // Faculty without cabins go last so the page leads with the answerable rows.
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
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-[22px] font-semibold tracking-tight">Faculty Tracker</h1>
        <p className="text-[13px] text-ink-secondary">
          Where every teacher is right now — from the timetable — and where their cabin is.
          <span className="mx-1.5">·</span>
          {todayLabel}
        </p>
      </header>

      {/* Filters: URL-driven like /spaces, works without JS */}
      <form className="flex flex-wrap items-center gap-2" action="/faculty">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
          <input
            name="q"
            aria-label="Search faculty by name, department or cabin"
            defaultValue={sp.q ?? ''}
            placeholder="Search name, department, cabin…"
            className={cn(inputCls, 'w-full pl-8')}
          />
        </div>
        <select name="dept" aria-label="Filter by department" defaultValue={sp.dept ?? ''} className={inputCls}>
          <option value="">All departments</option>
          {depts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-9 rounded bg-accent px-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        >
          Filter
        </button>
        <Link href="/faculty" className="text-[13px] text-ink-tertiary hover:text-ink hover:underline">
          Reset
        </Link>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        {ordered.map((f) => (
          <Card key={f.id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[15px] font-medium leading-tight">{f.name}</p>
                  <p className="text-micro text-ink-tertiary">{f.department ?? 'Faculty'}</p>
                </div>
                <StatusDot status={f.status} />
              </div>

              {f.slots.length > 0 ? (
                <ul className="space-y-1 text-[13px]">
                  {f.slots.slice(0, 3).map((s, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="font-mono text-micro">{s.start}–{s.end}</span>
                      <span className="truncate">{s.title}</span>
                      {s.roomSlug && (
                        <Link
                          href={`/spaces/${s.roomSlug}`}
                          className="text-accent hover:underline"
                        >
                          {s.roomCode}
                        </Link>
                      )}
                    </li>
                  ))}
                  {f.slots.length > 3 && (
                    <li className="text-micro text-ink-tertiary">
                      +{f.slots.length - 3} more today
                    </li>
                  )}
                </ul>
              ) : (
                <p className="text-[13px] text-ink-tertiary">No classes today.</p>
              )}

              <div className="border-t border-line pt-2.5 text-[13px]">
                {f.cabin ? (
                  <p className="flex items-center gap-1.5">
                    <DoorClosed className="h-3.5 w-3.5 text-ink-tertiary" />
                    <span>
                      Cabin{' '}
                      <Link
                        href={`/spaces/${f.cabin.slug}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {f.cabin.code}
                      </Link>
                      <span className="text-ink-tertiary">
                        {' '}· {f.cabin.block} L{f.cabin.floor}
                      </span>
                    </span>
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-ink-tertiary">
                    <MapPin className="h-3.5 w-3.5" /> Cabin not recorded — admin can add it
                  </p>
                )}
                {f.cabinNote && <p className="mt-1 text-micro text-ink-tertiary">{f.cabinNote}</p>}
                {f.officeHours && (
                  <p className="mt-1 text-micro text-ink-tertiary">
                    Office hours: {f.officeHours}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ordered.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-ink-secondary">
            No faculty match those filters.
          </CardContent>
        </Card>
      )}

      <p className="text-micro text-ink-tertiary">
        Showing {ordered.length} of {all.length} faculty. Locations derive from the published
        timetable; cabins are maintained by the head admin.
        <Badge variant="neutral" className="ml-1.5">live</Badge>
      </p>
    </div>
  );
}
