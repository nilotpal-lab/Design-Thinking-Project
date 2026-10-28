import Link from 'next/link';
import {
  ArrowUpDown,
  Calendar,
  Clock,
  Layers,
  Plug,
  RotateCcw,
  Snowflake,
} from 'lucide-react';

import { RoomCard } from '@/components/spaces/room-card';
import { Card } from '@/components/ui/card';
import {
  CAMPUS_DAYS,
  CAMPUS_FLOORS,
  CAMPUS_PERIODS,
  filterRooms,
  getRoomsForDayAndPeriod,
  parseDaySelection,
  parsePeriodSelection,
} from '@/lib/campus-dataset';
import { cn } from '@/lib/utils';

export type Search = {
  floor?: string;
  status?: string;
  category?: string;
  sort?: string;
  day?: string;
  period?: string;
  ac?: string;
  charging?: string;
};

export const dynamic = 'force-dynamic';

function buildHref(current: Search, patch: Partial<Search>) {
  const next = { ...current, ...patch };
  const qs = Object.entries(next)
    .filter(([, v]) => v != null && v !== '' && v !== 'all')
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join('&');
  return qs ? `/spaces?${qs}` : '/spaces';
}

function SegmentTab({
  active,
  href,
  children,
  title,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <Link
      href={href}
      title={title}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium transition-all duration-instant whitespace-nowrap',
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
  const sort = params.sort ?? 'code';
  const ac = params.ac;
  const charging = params.charging;

  // Resolve day and period from query parameters or default to Monday (1) and Period 1
  const selectedDayNum = parseDaySelection(params.day);
  const selectedPeriodNum = parsePeriodSelection(params.period);

  const selectedDay = CAMPUS_DAYS.find((d) => d.value === selectedDayNum) ?? CAMPUS_DAYS[0];
  const selectedPeriod =
    CAMPUS_PERIODS.find((p) => p.value === selectedPeriodNum) ?? CAMPUS_PERIODS[0];

  // Load all rooms from the cleaned classroom inventory with availability evaluated for the selected day/period
  const allRooms = getRoomsForDayAndPeriod(selectedDayNum, selectedPeriodNum);

  // Live telemetry counts for the selected period
  const freeRooms = allRooms.filter((r) => r.status === 'free');
  const soonRooms = allRooms.filter((r) => r.status === 'soon');
  const busyRooms = allRooms.filter((r) => r.status === 'busy');

  // Filter based on floor, AC, charging, status, and sort
  const filtered = filterRooms(allRooms, {
    floor,
    status,
    ac,
    charging,
    sort,
  });

  const hasActiveFilters =
    floor !== 'all' ||
    status !== 'all' ||
    Boolean(ac) ||
    Boolean(charging) ||
    sort !== 'code';

  return (
    <div className="space-y-6">
      {/* Top Header & Telemetry Strip */}
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-end dark:border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Spaces Directory</h1>
          <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
            {allRooms.length} rooms mapped across 4 floors · {selectedDay.fullLabel} {selectedPeriod.label} ({selectedPeriod.time})
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{freeRooms.length} Free</span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>{soonRooms.length} Free Soon</span>
          </span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <span className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>{busyRooms.length} In Session</span>
          </span>
        </div>
      </div>

      {/* Filter Controls Track */}
      <div className="space-y-3">
        {/* Row 1: Day & Period Selection */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Day Selector */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              <Calendar className="h-3 w-3" />
              <span>Day:</span>
            </span>
            <div className="flex items-center rounded-lg border border-line bg-surface-sunken p-0.5 dark:border-white/[0.08] dark:bg-[#151518]">
              {CAMPUS_DAYS.map((d) => (
                <SegmentTab
                  key={d.value}
                  active={selectedDayNum === d.value}
                  href={buildHref(params, { day: String(d.value) })}
                  title={d.fullLabel}
                >
                  {d.label}
                </SegmentTab>
              ))}
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              <Clock className="h-3 w-3" />
              <span>Period:</span>
            </span>
            <div className="flex items-center rounded-lg border border-line bg-surface-sunken p-0.5 dark:border-white/[0.08] dark:bg-[#151518]">
              {CAMPUS_PERIODS.map((p) => (
                <SegmentTab
                  key={p.value}
                  active={selectedPeriodNum === p.value}
                  href={buildHref(params, { period: String(p.value) })}
                  title={`${p.label} (${p.time})`}
                >
                  <span>{p.label}</span>
                </SegmentTab>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Floor & Availability Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Floor Segmented Group: Ground (0), First (1), Second (2), Third (3), Fourth (4) */}
            <div className="flex items-center rounded-lg border border-line bg-surface-sunken p-0.5 dark:border-white/[0.08] dark:bg-[#151518]">
              <SegmentTab active={floor === 'all'} href={buildHref(params, { floor: undefined })}>
                All Floors
              </SegmentTab>
              {CAMPUS_FLOORS.map((f) => (
                <SegmentTab
                  key={f.value}
                  active={floor === String(f.value)}
                  href={buildHref(params, { floor: String(f.value) })}
                >
                  {f.label}
                </SegmentTab>
              ))}
            </div>

            {/* Status Segmented Group: Any Status, Free Rooms, Free Soon, In Session */}
            <div className="flex items-center rounded-lg border border-line bg-surface-sunken p-0.5 dark:border-white/[0.08] dark:bg-[#151518]">
              <SegmentTab active={status === 'all'} href={buildHref(params, { status: undefined })}>
                Any Status
              </SegmentTab>
              <SegmentTab
                active={status === 'free'}
                href={buildHref(params, { status: 'free' })}
              >
                Free Rooms
              </SegmentTab>
              <SegmentTab
                active={status === 'soon'}
                href={buildHref(params, { status: 'soon' })}
              >
                Free Soon
              </SegmentTab>
              <SegmentTab
                active={status === 'busy'}
                href={buildHref(params, { status: 'busy' })}
              >
                In Session
              </SegmentTab>
            </div>
          </div>

          {/* Row 3 / Right side: Amenities & Sort */}
          <div className="flex flex-wrap items-center gap-2">
            {/* AC Filter Toggle */}
            <Link
              href={buildHref(params, { ac: ac === 'true' ? undefined : 'true' })}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors',
                ac === 'true'
                  ? 'border-sky-600 bg-sky-50 text-sky-700 dark:border-sky-500 dark:bg-sky-950/60 dark:text-sky-300'
                  : 'border-line bg-surface text-zinc-600 hover:border-zinc-400 hover:text-ink dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400',
              )}
              title="Filter air-conditioned classrooms"
            >
              <Snowflake className="h-3.5 w-3.5 text-sky-500" />
              <span>AC Only</span>
            </Link>

            {/* Charging-Point Filter Toggle */}
            <Link
              href={buildHref(params, { charging: charging === 'true' ? undefined : 'true' })}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors',
                charging === 'true'
                  ? 'border-amber-600 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'border-line bg-surface text-zinc-600 hover:border-zinc-400 hover:text-ink dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400',
              )}
              title="Filter rooms with laptop charging points"
            >
              <Plug className="h-3.5 w-3.5 text-amber-500" />
              <span>Charging Points</span>
            </Link>

            {/* Sort Button */}
            <Link
              href={buildHref(params, { sort: sort === 'free' ? undefined : 'free' })}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors',
                sort === 'free'
                  ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                  : 'border-line bg-surface text-zinc-600 hover:border-zinc-400 hover:text-ink dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400',
              )}
              title="Sort free rooms first"
            >
              <ArrowUpDown className="h-3 w-3" />
              <span>Sort: Free First</span>
            </Link>

            {/* Reset Filters (if any filter active) */}
            {hasActiveFilters && (
              <Link
                href={buildHref(params, {
                  floor: undefined,
                  status: undefined,
                  ac: undefined,
                  charging: undefined,
                  sort: undefined,
                })}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-zinc-500 hover:text-ink dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400"
                title="Reset active filters"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Spaces Grid */}
      {filtered.length === 0 ? (
        <Card className="rounded-xl border-dashed p-10 text-center">
          <p className="text-sm font-semibold text-ink">No spaces match the selected filters</p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {floor === '0'
              ? 'No regular classrooms are located on Ground Floor (0). Try selecting First, Second, Third, or Fourth floor.'
              : `Try adjusting your floor, AC, charging, or status filters to see campus rooms.`}
          </p>
          <Link
            href={buildHref(params, {
              floor: undefined,
              status: undefined,
              ac: undefined,
              charging: undefined,
              sort: undefined,
            })}
            className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Active Filters</span>
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
