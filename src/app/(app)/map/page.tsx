import Link from 'next/link';
import { Layers, MapPin } from 'lucide-react';

import { getLiveRooms, type LiveRoom } from '@/server/queries/rooms';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Architectural Floor Map' };

const STATUS_STYLE: Record<
  string,
  { fill: string; stroke: string; label: string; dot: string }
> = {
  free: {
    fill: 'fill-emerald-500/10 hover:fill-emerald-500/25 dark:fill-emerald-500/15 dark:hover:fill-emerald-500/30',
    stroke: 'stroke-emerald-600/70 dark:stroke-emerald-400/60',
    label: 'Free now',
    dot: 'bg-emerald-500',
  },
  soon: {
    fill: 'fill-amber-500/10 hover:fill-amber-500/25 dark:fill-amber-500/15 dark:hover:fill-amber-500/30',
    stroke: 'stroke-amber-600/70 dark:stroke-amber-400/60',
    label: 'Free soon (<45m)',
    dot: 'bg-amber-500',
  },
  busy: {
    fill: 'fill-rose-500/10 hover:fill-rose-500/25 dark:fill-rose-500/15 dark:hover:fill-rose-500/30',
    stroke: 'stroke-rose-600/70 dark:stroke-rose-400/60',
    label: 'In session',
    dot: 'bg-rose-500',
  },
  unknown: {
    fill: 'fill-zinc-500/10 hover:fill-zinc-500/20 dark:fill-zinc-700/20 dark:hover:fill-zinc-700/30',
    stroke: 'stroke-zinc-400 dark:stroke-zinc-600',
    label: 'No data',
    dot: 'bg-zinc-400',
  },
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ block?: string; floor?: string }>;
}) {
  const sp = await searchParams;
  const rooms = await getLiveRooms();

  const mapped = rooms.filter(
    (r): r is LiveRoom & { map_x: number; map_y: number; map_w: number; map_h: number } =>
      r.map_x != null && r.map_y != null && r.map_w != null && r.map_h != null,
  );

  const blockOf = (r: LiveRoom): string =>
    (r as { block_name?: string | null }).block_name ?? 'Academic Block';

  const allBlocks = [...new Set(mapped.map(blockOf))].sort();
  const activeBlock = allBlocks.includes(sp.block ?? '') ? sp.block! : allBlocks[0] ?? 'Academic Block';
  const floors = [...new Set(mapped.filter((r) => blockOf(r) === activeBlock).map((r) => r.floor_level))].sort(
    (a, b) => a - b,
  );
  const activeFloor = floors.includes(Number(sp.floor)) ? Number(sp.floor) : floors[0] ?? 1;

  const floorRooms = mapped
    .filter((r) => blockOf(r) === activeBlock && r.floor_level === activeFloor)
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  const counts = {
    free: floorRooms.filter((r) => r.status === 'free').length,
    soon: floorRooms.filter((r) => r.status === 'soon').length,
    busy: floorRooms.filter((r) => r.status === 'busy').length,
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header & Segmented Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Floor Map Navigator
            </h1>
            <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
              CAD Schematic
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Spatial occupancy blueprint for {activeBlock}, Floor {activeFloor}. Click any room for full schedule.
          </p>
        </div>

        {/* Segmented Control Track */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line bg-surface-sunken p-1 dark:border-white/[0.08] dark:bg-[#141416]">
          {allBlocks.map((b) => (
            <Link
              key={b}
              href={`/map?block=${encodeURIComponent(b)}&floor=${floors[0] ?? 1}`}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-all',
                b === activeBlock
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-white dark:text-zinc-900 font-semibold'
                  : 'text-zinc-500 hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-200',
              )}
            >
              {b}
            </Link>
          ))}
          <span className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
          {floors.map((f) => (
            <Link
              key={f}
              href={`/map?block=${encodeURIComponent(activeBlock)}&floor=${f}`}
              className={cn(
                'rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-all',
                f === activeFloor
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-white dark:text-zinc-900 font-semibold'
                  : 'text-zinc-500 hover:text-ink dark:text-zinc-400 dark:hover:text-zinc-200',
              )}
            >
              L{f}
            </Link>
          ))}
        </div>
      </div>

      {/* Blueprint Card */}
      <div className="rounded-xl border border-line bg-surface p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]">
        {/* Top Legend Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line/60 pb-3.5 dark:border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            {(['free', 'soon', 'busy'] as const).map((k) => (
              <span key={k} className="inline-flex items-center gap-1.5">
                <span className={cn('h-2 w-2 rounded-full', STATUS_STYLE[k].dot)} />
                <span className="text-ink">{STATUS_STYLE[k].label}</span>
                <span className="font-mono text-[11px] text-zinc-400">({counts[k]})</span>
              </span>
            ))}
          </div>

          <span className="font-mono text-[11px] text-zinc-400">
            Level {activeFloor} · {floorRooms.length} Spaces Mapped
          </span>
        </div>

        {/* SVG Blueprint Canvas */}
        <div className="relative overflow-x-auto rounded-lg border border-line/60 bg-surface-sunken/40 p-4 dark:border-white/[0.06] dark:bg-[#09090b]">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-[480px] w-full min-w-[580px]"
            role="img"
            aria-label={`${activeBlock} level ${activeFloor} floor plan`}
          >
            {/* Wing Headers */}
            <text x="17" y="4" textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500 text-[2.8px] font-mono font-semibold uppercase tracking-widest">
              West Wing
            </text>
            <text x="50" y="4" textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500 text-[2.8px] font-mono font-semibold uppercase tracking-widest">
              Central Atrium
            </text>
            <text x="83" y="4" textAnchor="middle" className="fill-zinc-400 dark:fill-zinc-500 text-[2.8px] font-mono font-semibold uppercase tracking-widest">
              East Wing
            </text>

            {/* Corridors */}
            <rect x="32" y="0" width="3" height="100" className="fill-zinc-200/50 dark:fill-white/[0.02]" />
            <rect x="65" y="0" width="3" height="100" className="fill-zinc-200/50 dark:fill-white/[0.02]" />

            {/* Rooms Geometry */}
            {floorRooms.map((r) => {
              const s = STATUS_STYLE[r.status] ?? STATUS_STYLE.unknown;
              return (
                <g key={r.slug} className="group/room">
                  <title>{`${r.code} (${r.name}) — ${s.label}`}</title>
                  <Link href={`/spaces/${r.slug}`}>
                    <rect
                      x={r.map_x}
                      y={r.map_y}
                      width={r.map_w}
                      height={r.map_h}
                      rx="1"
                      strokeWidth="0.5"
                      className={cn(
                        'cursor-pointer transition-colors duration-fast',
                        s.fill,
                        s.stroke,
                      )}
                    />
                  </Link>
                  <text
                    x={r.map_x + r.map_w / 2}
                    y={r.map_y + r.map_h / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="pointer-events-none select-none fill-zinc-900 text-[3px] font-mono font-bold tracking-tight dark:fill-zinc-100"
                  >
                    {r.code}
                  </text>
                </g>
              );
            })}

            {floorRooms.length === 0 && (
              <text x="50" y="50" textAnchor="middle" className="fill-zinc-400 text-[3.5px] font-medium">
                No rooms mapped on this floor
              </text>
            )}
          </svg>
        </div>

        <p className="mt-3 text-[11px] text-zinc-400">
          Schematic floor coordinates derived from academic block layout. Room availability syncs automatically with active lecture timetables.
        </p>
      </div>
    </div>
  );
}
