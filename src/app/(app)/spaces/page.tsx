import Link from 'next/link';

import { RoomCard } from '@/components/spaces/room-card';
import { getLiveRooms } from '@/server/queries/rooms';
import { cn, ROOM_CATEGORY_LABEL, WING_LABEL } from '@/lib/utils';

/**
 * Filters live in the URL (DESIGN §3) — every option is a plain link, so the
 * view is shareable in a WhatsApp group, works without JS, and the back
 * button behaves. 52 rows filter in memory; a database would be premature.
 */
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
        'inline-flex h-8 items-center rounded border px-3 text-[13px] transition-colors duration-instant',
        active
          ? 'border-accent bg-accent-subtle font-medium text-accent'
          : 'border-line bg-surface text-ink-secondary hover:border-line-strong hover:text-ink',
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
  const categories = [...new Set(rooms.map((r) => r.category))].sort();

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
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-7 tracking-[-0.01em]">Spaces</h1>
        <p className="mt-0.5 text-[13px] text-ink-secondary">
          {rooms.filter((r) => r.status === 'free').length} of {rooms.length} rooms free right now
          · derived from today&apos;s timetable
        </p>
      </div>

      {/* Filter bar — URL state, plain links */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filters">
        <Chip active={floor === 'all'} href={buildHref(params, { floor: undefined })}>
          All floors
        </Chip>
        {floors.map((f) => (
          <Chip key={f} active={floor === String(f)} href={buildHref(params, { floor: String(f) })}>
            Floor {f}
          </Chip>
        ))}
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <Chip active={status === 'all'} href={buildHref(params, { status: undefined })}>
          Any status
        </Chip>
        <Chip active={status === 'free'} href={buildHref(params, { status: 'free' })}>
          Free now
        </Chip>
        <Chip active={status === 'soon'} href={buildHref(params, { status: 'soon' })}>
          Free soon
        </Chip>
        <Chip active={status === 'busy'} href={buildHref(params, { status: 'busy' })}>
          In session
        </Chip>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <Chip
          active={sort === 'free'}
          href={buildHref(params, { sort: sort === 'free' ? undefined : 'free' })}
        >
          Sort: free first
        </Chip>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center">
          <p className="text-[15px] font-medium">No rooms match these filters</p>
          <p className="mt-1 text-[13px] text-ink-secondary">
            Try clearing the floor or status filter — there are {rooms.length} rooms across campus.
          </p>
          <Link
            href="/spaces"
            className="mt-4 inline-flex h-9 items-center rounded bg-accent px-4 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Clear filters
          </Link>
        </div>
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
