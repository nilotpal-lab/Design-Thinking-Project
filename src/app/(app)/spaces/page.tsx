import Link from 'next/link';
import { ArrowUpDown, CheckCircle2, Clock, Filter, Layers } from 'lucide-react';

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

function SegmentTab({
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
        'inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium transition-all duration-instant',
        active
          ? 'bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900'
          : 'text-zinc-500 hover:text-ink dark:text-zinc-400 dark:hover:text-white',
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
    <div className="space-y-6">
      {/* Top Header & Telemetry Strip */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end dark:border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Spaces Directory</h1>
          <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
            {rooms.length} rooms mapped across 4 floors · Timetable synced in real time
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{freeRooms.length} Free Now</span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>{soonRooms.length} Free Soon</span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>{busyRooms.length} In Session</span>
          </span>
        </div>
      </div>

      {/* Segmented Filter Track (Linear Style) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Floors Segmented Group */}
          <div className="flex items-center rounded-lg border border-line bg-surface-sunken p-0.5 dark:border-white/[0.08] dark:bg-[#151518]">
            <SegmentTab active={floor === 'all'} href={buildHref(params, { floor: undefined })}>
              All Floors
            </SegmentTab>
            {floors.map((f) => (
              <SegmentTab key={f} active={floor === String(f)} href={buildHref(params, { floor: String(f) })}>
                Floor {f}
              </SegmentTab>
            ))}
          </div>

          {/* Status Segmented Group */}
          <div className="flex items-center rounded-lg border border-line bg-surface-sunken p-0.5 dark:border-white/[0.08] dark:bg-[#151518]">
            <SegmentTab active={status === 'all'} href={buildHref(params, { status: undefined })}>
              Any Status
            </SegmentTab>
            <SegmentTab active={status === 'free'} href={buildHref(params, { status: 'free' })}>
              Free Now
            </SegmentTab>
            <SegmentTab active={status === 'soon'} href={buildHref(params, { status: 'soon' })}>
              Free Soon
            </SegmentTab>
            <SegmentTab active={status === 'busy'} href={buildHref(params, { status: 'busy' })}>
              In Session
            </SegmentTab>
          </div>
        </div>

        {/* Sort Button */}
        <Link
          href={buildHref(params, { sort: sort === 'free' ? undefined : 'free' })}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
            sort === 'free'
              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
              : 'border-line bg-surface text-zinc-600 hover:border-zinc-400 hover:text-ink dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400',
          )}
        >
          <ArrowUpDown className="h-3 w-3" />
          <span>Sort: Free First</span>
        </Link>
      </div>

      {/* Spaces Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-xl border-dashed p-10 text-center">
          <p className="text-sm font-semibold text-ink">No spaces match the selected filters</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Try adjusting your floor or status selection to see all {rooms.length} campus rooms.
          </p>
          <Link
            href="/spaces"
            className="mt-4 inline-flex h-8 items-center rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            Reset Filters
          </Link>
        </Card>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
