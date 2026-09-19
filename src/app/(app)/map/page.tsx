import Link from 'next/link';
import { Layers, MapPin, Sparkles } from 'lucide-react';

import { getLiveRooms, type LiveRoom } from '@/server/queries/rooms';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Architectural Floor Map' };

const STATUS_STYLE: Record<
  string,
  { fill: string; stroke: string; label: string; dot: string; glow: string }
> = {
  free: {
    fill: 'fill-emerald-500/20 hover:fill-emerald-500/35',
    stroke: 'stroke-emerald-600 dark:stroke-emerald-400',
    label: 'Free now',
    dot: '●',
    glow: 'bg-emerald-500',
  },
  soon: {
    fill: 'fill-amber-500/20 hover:fill-amber-500/35',
    stroke: 'stroke-amber-600 dark:stroke-amber-400',
    label: 'Free soon (<45m)',
    dot: '◐',
    glow: 'bg-amber-500',
  },
  busy: {
    fill: 'fill-rose-500/20 hover:fill-rose-500/35',
    stroke: 'stroke-rose-600 dark:stroke-rose-400',
    label: 'In session',
    dot: '○',
    glow: 'bg-rose-500',
  },
  unknown: {
    fill: 'fill-zinc-500/15 hover:fill-zinc-500/25',
    stroke: 'stroke-zinc-400 dark:stroke-zinc-600',
    label: 'No data',
    dot: '',
    glow: 'bg-zinc-400',
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
    <div className="mx-auto w-full max-w-6xl space-y-7">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-subtle px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent dark:text-accent-hover">
            <Layers className="h-3.5 w-3.5" />
            <span>Interactive Blueprint</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-ink md:text-3xl">
            Floor Map Navigator
          </h1>
          <p className="mt-1 text-[13px] text-ink-secondary">
            Live spatial occupancy schematic for {activeBlock}, Floor {activeFloor}. Click any space
            for full schedule.
          </p>
        </div>

        {/* Floor & Block Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-line/80 bg-surface/80 p-1.5 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#121215]/80">
          {allBlocks.map((b) => (
            <Link
              key={b}
              href={`/map?block=${encodeURIComponent(b)}&floor=${floors[0] ?? 1}`}
              className={cn(
                'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-instant',
                b === activeBlock
                  ? 'bg-accent text-white shadow-sm shadow-accent/20'
                  : 'text-ink-secondary hover:bg-surface-sunken hover:text-ink dark:hover:bg-white/[0.04]',
              )}
            >
              {b}
            </Link>
          ))}
          <span className="h-4 w-px bg-line/80 dark:bg-white/10" />
          {floors.map((f) => (
            <Link
              key={f}
              href={`/map?block=${encodeURIComponent(activeBlock)}&floor=${f}`}
              className={cn(
                'rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition-all duration-instant',
                f === activeFloor
                  ? 'bg-accent text-white shadow-sm shadow-accent/20'
                  : 'text-ink-secondary hover:bg-surface-sunken hover:text-ink dark:hover:bg-white/[0.04]',
              )}
            >
              L{f}
            </Link>
          ))}
        </div>
      </div>

      {/* Blueprint Container */}
      <Card className="overflow-hidden rounded-3xl border-line/80 p-6 shadow-e2 dark:border-white/10 dark:bg-[#101014]">
        {/* Top Blueprint Legend Bar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-line/60 pb-4 dark:border-white/[0.06]">
          <div className="flex flex-wrap gap-4 text-[12px] font-medium text-ink-secondary">
            {(['free', 'soon', 'busy'] as const).map((k) => (
              <span key={k} className="inline-flex items-center gap-2">
                <span className={cn('h-2.5 w-2.5 rounded-full ring-2 ring-white/20', STATUS_STYLE[k].glow)} />
                <span className="text-ink font-semibold">{STATUS_STYLE[k].label}</span>
                <span className="font-mono text-micro text-ink-tertiary">({counts[k]})</span>
              </span>
            ))}
          </div>

          <span className="font-mono text-[12px] font-medium text-ink-tertiary">
            Floor {activeFloor} · {floorRooms.length} Spaces Mapped
          </span>
        </div>

        {/* SVG Blueprint Canvas */}
        <div className="relative overflow-x-auto rounded-2xl border border-line/70 bg-canvas/60 p-4 dark:border-white/[0.06] dark:bg-[#09090b]">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-[500px] w-full min-w-[620px]"
            role="img"
            aria-label={`${activeBlock} level ${activeFloor} floor plan`}
          >
            {/* Wing Headers */}
            <text x="17" y="4" textAnchor="middle" className="fill-ink-tertiary text-[3px] font-bold uppercase tracking-widest">
              West Wing
            </text>
            <text x="50" y="4" textAnchor="middle" className="fill-ink-tertiary text-[3px] font-bold uppercase tracking-widest">
              Central Atrium
            </text>
            <text x="83" y="4" textAnchor="middle" className="fill-ink-tertiary text-[3px] font-bold uppercase tracking-widest">
              East Wing
            </text>

            {/* Corridors */}
            <rect x="32" y="0" width="3" height="100" className="fill-surface-sunken opacity-60 dark:fill-white/[0.03]" />
            <rect x="65" y="0" width="3" height="100" className="fill-surface-sunken opacity-60 dark:fill-white/[0.03]" />

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
                      rx="1.5"
                      strokeWidth="0.7"
                      className={cn(
                        'cursor-pointer transition-all duration-instant',
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
                    className="pointer-events-none select-none fill-ink text-[3.2px] font-bold tracking-tight dark:fill-white"
                  >
                    {r.code}
                  </text>
                </g>
              );
            })}

            {floorRooms.length === 0 && (
              <text x="50" y="50" textAnchor="middle" className="fill-ink-tertiary text-[4px] font-medium">
                No rooms mapped on this floor
              </text>
            )}
          </svg>
        </div>

        <p className="mt-4 text-micro text-ink-tertiary">
          Schematic floor coordinates derived from campus building layout. Real-time room occupancy
          refreshes automatically via timetable feeds and student check-ins.
        </p>
      </Card>
    </div>
  );
}
