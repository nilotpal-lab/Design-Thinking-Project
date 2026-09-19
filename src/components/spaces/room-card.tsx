import Link from 'next/link';
import { ArrowUpRight, Plug, Snowflake, Sparkles, Users, Wifi } from 'lucide-react';

import { StatusPill, type RoomStatus } from '@/components/spaces/status-pill';
import { Card } from '@/components/ui/card';
import { cn, ROOM_CATEGORY_LABEL } from '@/lib/utils';

export type RoomCardData = {
  slug: string;
  code: string;
  name: string;
  category: string;
  floor_label: string | null;
  capacity: number;
  sockets_working: number | null;
  has_ac: boolean | null;
  status: RoomStatus;
  free_minutes: number | null;
  occupied_until: string | null;
  comfort_score?: number | null;
  noise_vibe?: string | null;
};

export function RoomCard({ room, className }: { room: RoomCardData; className?: string }) {
  return (
    <Link
      href={`/spaces/${room.slug}`}
      className={cn(
        'group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        className,
      )}
    >
      <Card className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-5 transition-all duration-base ease-spring hover:-translate-y-1 hover:border-accent/40 hover:shadow-e2 active:scale-[0.99] dark:hover:border-accent/40 dark:hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]">
        {/* Subtle Ambient Glow on Hover */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/5 opacity-0 blur-2xl transition-opacity duration-base group-hover:opacity-100 dark:bg-accent/10" />

        <div>
          {/* Header with Room Code & Status */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-block font-mono text-[13px] font-bold tracking-tight text-accent dark:text-accent-hover">
                {room.code}
              </span>
              <h3 className="mt-1 truncate text-[16px] font-bold tracking-[-0.01em] text-ink transition-colors group-hover:text-accent dark:group-hover:text-accent-hover">
                {room.name}
              </h3>
              <p className="mt-0.5 text-[12px] font-medium text-ink-secondary">
                {ROOM_CATEGORY_LABEL[room.category] ?? room.category}
                {room.floor_label ? ` · ${room.floor_label}` : ''}
              </p>
            </div>
            <StatusPill
              status={room.status}
              freeMinutes={room.free_minutes}
              occupiedUntil={room.occupied_until}
            />
          </div>
        </div>

        {/* Amenities & Footer Meta */}
        <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3.5 text-[12px] text-ink-secondary dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-md bg-surface-sunken/80 px-2 py-1 font-medium text-ink dark:bg-white/[0.04]"
              title="Seating capacity"
            >
              <Users className="h-3.5 w-3.5 text-ink-tertiary" aria-hidden />
              <span className="font-mono-tabular font-semibold">{room.capacity}</span>
            </span>

            {room.sockets_working != null && room.sockets_working > 0 && (
              <span
                className="inline-flex items-center gap-1.5 rounded-md bg-surface-sunken/80 px-2 py-1 font-medium text-ink dark:bg-white/[0.04]"
                title="Working power sockets"
              >
                <Plug className="h-3.5 w-3.5 text-amber-500" aria-hidden />
                <span className="font-mono-tabular font-semibold">{room.sockets_working}</span>
              </span>
            )}

            {room.has_ac && (
              <span
                className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/10 px-2 py-1 font-semibold text-sky-600 dark:text-sky-400"
                title="Air conditioning enabled"
              >
                <Snowflake className="h-3.5 w-3.5" aria-hidden />
                AC
              </span>
            )}
          </div>

          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-sunken text-ink-tertiary transition-all duration-instant ease-spring group-hover:bg-accent group-hover:text-white dark:bg-white/[0.06]">
            <ArrowUpRight className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
