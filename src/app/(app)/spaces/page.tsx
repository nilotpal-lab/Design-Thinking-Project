import Link from 'next/link';
import { ArrowUpDown, CheckCircle2, Clock, Filter, Sparkles, Zap } from 'lucide-react';

import { RoomCard } from '@/components/spaces/room-card';
import { Card } from '@/components/ui/card';
import { getLiveRooms } from '@/server/queries/rooms';
import { cn } from '@/lib/utils';

type Search = {
  floor?: string;
  status?: string;
  category?: string;
  sort?: string;
};

export const dynamic = 'force-dynamic';

function buildHref(current: Search, patch: Partial<Search>) {
  const next = { ...current, ...patch };
  const qs = Object.entries(next)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&');
  return qs ? `/spaces?${qs}` : '/spaces';
}

function Chip({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'inline-flex h-8 items-center rounded-xl px-3.5 text-[13px] font-medium transition-all duration-instant ease-spring',
        active
          ? 'bg-accent text-white shadow-sm shadow-accent/20 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]'
          : 'border border-line/80 bg-surface/80 text-ink-secondary hover:border-line-strong hover:bg-surface hover:text-ink dark:border-white/10 dark:bg-surface/60',
      )}
    >
      {children}
    </Link>
  );
}

export default async function SpacesPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const floor = params.floor ?? 'all';
  const status = params.status ?? 'all';
  const category = params.category ?? 'all';
  const sort = params.sort ?? 'code';

  const rooms = await getLiveRooms();

  const floors = [...new Set(rooms.map((r) => r.floor_level))].sort((a, b) => a - b);
  const freeRooms = rooms.filter((r) => r.status === 'free');
  const soonRooms = rooms.filter((r) => r.status === 'soon');
  const busyRooms = rooms.filter((r) => r.status === 'busy');

  let filtered = rooms;
  if (floor !== 'all') filtered = filtered.filter((r) => String(r.floor_level) === floor);
  if (status !== 'all') filtered = filtered.filter((r) => r.status === status);
  if (category !== 'all') filtered = filtered.filter((r) => r.category === category);

  if (sort === 'free') {
    const rank = { free: 0, soon: 1, busy: 2, unknown: 3 } as const;
    filtered = [...filtered].sort(
      (a, b) => rank[a.status] - rank[b.status] || (a.free_minutes ?? -1) * -1 - (b.free_minutes ?? -1) * -1,
    );
  } else {
    filtered = [...filtered].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }

  return (
    <div className="space-y-8">
      {/* Hero Bento Section */}
      <div className="relative overflow-hidden rounded-3xl border border-line/80 bg-surface/80 p-6 shadow-e2 backdrop-blur-xl md:p-8 dark:border-white/10 dark:bg-[#121215]/80 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/10 blur-3xl dark:bg-accent/15" />

        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-subtle px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent dark:text-accent-hover">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Campus Space Reimagined</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              Find a seat, not a fight.
            </h1>
            <p className="text-[14px] leading-relaxed text-ink-secondary md:text-[15px]">
              Live availability across {rooms.length} rooms & labs at Jain University. Calibrated
              with real-time class timetables and verified student reports.
            </p>
          </div>

          {/* KPI Stats Pill Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-center dark:bg-emerald-500/10">
              <p className="font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {freeRooms.length}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-ink-secondary">Free now</p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-center dark:bg-amber-500/10">
              <p className="font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
                {soonRooms.length}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-ink-secondary">Free soon</p>
            </div>
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3.5 text-center dark:bg-rose-500/10">
              <p className="font-mono text-2xl font-black text-rose-600 dark:text-rose-400">
                {busyRooms.length}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-ink-secondary">In session</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Sorting Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-ink-tertiary" />
            <span className="text-[13px] font-semibold uppercase tracking-wider text-ink-tertiary">
              Filters
            </span>
          </div>
          <span className="text-[13px] font-medium text-ink-secondary">
            Showing <span className="font-bold text-ink">{filtered.length}</span> of {rooms.length} spaces
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filters">
          <Chip active={floor === 'all'} href={buildHref(params, { floor: undefined })}>
            All Floors
          </Chip>
          {floors.map((f) => (
            <Chip key={f} active={floor === String(f)} href={buildHref(params, { floor: String(f) })}>
              Floor {f}
            </Chip>
          ))}
          <span className="mx-1 h-5 w-px bg-line/80 dark:bg-white/10" aria-hidden />
          <Chip active={status === 'all'} href={buildHref(params, { status: undefined })}>
            Any Status
          </Chip>
          <Chip active={status === 'free'} href={buildHref(params, { status: 'free' })}>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Free Now
          </Chip>
          <Chip active={status === 'soon'} href={buildHref(params, { status: 'soon' })}>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-500" />
            Free Soon
          </Chip>
          <Chip active={status === 'busy'} href={buildHref(params, { status: 'busy' })}>
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-rose-500" />
            In Session
          </Chip>
          <span className="mx-1 h-5 w-px bg-line/80 dark:bg-white/10" aria-hidden />
          <Chip
            active={sort === 'free'}
            href={buildHref(params, { sort: sort === 'free' ? undefined : 'free' })}
          >
            <ArrowUpDown className="mr-1.5 h-3.5 w-3.5" />
            Sort: Free First
          </Chip>
        </div>
      </div>

      {/* Spaces Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-3xl border-dashed p-12 text-center">
          <p className="text-[16px] font-semibold text-ink">No spaces match the selected filters</p>
          <p className="mt-1 text-[13px] text-ink-secondary">
            Try adjusting your floor or status filter to see all {rooms.length} available rooms.
          </p>
          <Link
            href="/spaces"
            className="mt-5 inline-flex h-10 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-white shadow-glow-accent transition-all hover:bg-accent-hover active:scale-95"
          >
            Reset Filters
          </Link>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((room) => (
            <li key={room.room_id}>
              <RoomCard room={room} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
