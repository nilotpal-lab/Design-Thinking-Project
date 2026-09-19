import Link from 'next/link';

import { getLiveRooms, type LiveRoom } from '@/server/queries/rooms';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Floor Map' };

const STATUS_STYLE: Record<string, { fill: string; stroke: string; label: string; dot: string }> = {
  free: { fill: 'fill-emerald-500/20', stroke: 'stroke-emerald-600 dark:stroke-emerald-400', label: 'Free', dot: '●' },
  soon: { fill: 'fill-amber-500/20', stroke: 'stroke-amber-600 dark:stroke-amber-400', label: 'Free soon', dot: '◐' },
  busy: { fill: 'fill-red-500/20', stroke: 'stroke-red-600 dark:stroke-red-400', label: 'In session', dot: '○' },
  unknown: { fill: 'fill-zinc-500/15', stroke: 'stroke-zinc-500', label: 'Unknown', dot: '' },
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ block?: string; floor?: string }>;
}) {
  const sp = await searchParams;
  const rooms = await getLiveRooms();

  // Which rooms actually have geometry? Without it a floor is empty — filter
  // to mapped rooms only so the plan never renders invisible boxes.
  const mapped = rooms.filter(
    (r): r is LiveRoom & { map_x: number; map_y: number; map_w: number; map_h: number } =>
      r.map_x != null && r.map_y != null && r.map_w != null && r.map_h != null,
  );

  // Block identity comes from the query layer (joined via rooms.blocks).
  const blockOf = (r: LiveRoom): string =>
    (r as { block_name?: string | null }).block_name ?? 'Unknown block';

  const allBlocks = [...new Set(mapped.map(blockOf))].sort();
  const activeBlock = allBlocks.includes(sp.block ?? '') ? sp.block! : allBlocks[0] ?? 'Block A';
  const floors = [...new Set(mapped.filter((r) => blockOf(r) === activeBlock).map((r) => r.floor_level))].sort((a, b) => a - b);
  const activeFloor = floors.includes(Number(sp.floor)) ? Number(sp.floor) : floors[0] ?? 1;

  const floorRooms = mapped
    .filter((r) => blockOf(r) === activeBlock && r.floor_level === activeFloor)
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

  // Corridor strip between the wing bands (x 32-35 and 65-68 by derivation).
  const counts = {
    free: floorRooms.filter((r) => r.status === 'free').length,
    soon: floorRooms.filter((r) => r.status === 'soon').length,
    busy: floorRooms.filter((r) => r.status === 'busy').length,
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Floor Map</h1>
        <p className="text-[13px] text-ink-secondary">
          Live availability across {activeBlock}, level {activeFloor}. Tap a room for details.
        </p>
      </header>

      {/* Floor + block selector — URL-driven, works without JS */}
      <div className="flex flex-wrap items-center gap-1.5">
        {allBlocks.map((b) => (
          <Link
            key={b}
            href={`/map?block=${encodeURIComponent(b)}&floor=${floors[0] ?? 1}`}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium',
              b === activeBlock ? 'bg-accent text-white' : 'border border-line hover:bg-surface-sunken',
            )}
          >
            {b}
          </Link>
        ))}
        <span className="mx-2 h-5 w-px bg-border" />
        {floors.map((f) => (
          <Link
            key={f}
            href={`/map?block=${encodeURIComponent(activeBlock)}&floor=${f}`}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium',
              f === activeFloor ? 'bg-accent text-white' : 'border border-line hover:bg-surface-sunken',
            )}
          >
            L{f}
          </Link>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-micro text-ink-secondary">
        {(['free', 'soon', 'busy'] as const).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span
              className={cn(
                'inline-block h-3 w-6 rounded-sm border-2',
                STATUS_STYLE[k].fill,
                STATUS_STYLE[k].stroke,
              )}
            />
            {STATUS_STYLE[k].label} — {counts[k]}
          </span>
        ))}
      </div>

      {/* Plan */}
      <div className="overflow-x-auto rounded-lg border bg-canvas p-3">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-[480px] w-full min-w-[560px]"
          role="img"
          aria-label={`${activeBlock} level ${activeFloor} floor plan`}
        >
          {/* Wing band headers */}
          <text x="17" y="3.5" textAnchor="middle" className="fill-ink-tertiary text-[3px] uppercase tracking-widest">
            West wing
          </text>
          <text x="50" y="3.5" textAnchor="middle" className="fill-ink-tertiary text-[3px] uppercase tracking-widest">
            Center
          </text>
          <text x="83" y="3.5" textAnchor="middle" className="fill-ink-tertiary text-[3px] uppercase tracking-widest">
            East wing
          </text>
          {/* Corridors */}
          <rect x="32" y="0" width="3" height="100" className="fill-surface-sunken" />
          <rect x="65" y="0" width="3" height="100" className="fill-surface-sunken" />

          {floorRooms.map((r) => {
            const s = STATUS_STYLE[r.status] ?? STATUS_STYLE.unknown;
            return (
              <g key={r.slug}>
                <title>{`${r.code} — ${s.label}`}</title>
                <Link href={`/spaces/${r.slug}`}>
                  <rect
                    x={r.map_x}
                    y={r.map_y}
                    width={r.map_w}
                    height={r.map_h}
                    rx="1.2"
                    strokeWidth="0.6"
                    className={cn('cursor-pointer transition-opacity hover:opacity-75', s.fill, s.stroke)}
                  />
                </Link>
                <text
                  x={r.map_x + r.map_w / 2}
                  y={r.map_y + r.map_h / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-current text-[3.2px] font-semibold pointer-events-none select-none"
                >
                  {r.code}
                  {r.map_h >= 8 ? ` ${s.dot}` : ''}
                </text>
              </g>
            );
          })}

          {floorRooms.length === 0 && (
            <text x="50" y="50" textAnchor="middle" className="fill-ink-tertiary text-[4px]">
              No mapped rooms on this floor
            </text>
          )}
        </svg>
      </div>

      <p className="text-micro text-ink-tertiary">
        {counts.free} free · {counts.soon} free soon · {counts.busy} in session — across{' '}
        {floorRooms.length} rooms. Layout is schematic (wing bands, not surveyed geometry);
        statuses are live from the timetable + student check-ins.
      </p>
    </div>
  );
}
