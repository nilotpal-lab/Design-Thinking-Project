import Link from 'next/link';
import { ArrowUpRight, Monitor, Plug, Snowflake, Users, Wifi } from 'lucide-react';

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
        'group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        className,
      )}
    >
      <Card className="flex h-full flex-col justify-between rounded-xl p-4.5 transition-all duration-instant hover:border-zinc-400 dark:hover:border-white/20">
        <div>
          {/* Top Bar: Code Pill + Status */}
          <div className="flex items-center justify-between gap-2">
            <span className="rounded border border-line bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">
              {room.code}
            </span>
            <StatusPill
              status={room.status}
              freeMinutes={room.free_minutes}
              occupiedUntil={room.occupied_until}
            />
          </div>

          {/* Title & Metadata */}
          <h3 className="mt-2.5 truncate text-[15px] font-semibold tracking-tight text-ink transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-200">
            {room.name}
          </h3>
          <p className="mt-0.5 text-[12px] text-zinc-500 dark:text-zinc-400">
            {ROOM_CATEGORY_LABEL[room.category] ?? room.category}
            {room.floor_label ? ` · ${room.floor_label}` : ''}
          </p>
        </div>

        {/* Amenities Row */}
        <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-[12px] text-zinc-500 dark:border-white/[0.06] dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5" title="Seating capacity">
              <Users className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
              <span className="font-mono-tabular font-medium text-ink">{room.capacity}</span>
            </span>

            {room.sockets_working != null && room.sockets_working > 0 && (
              <span className="flex items-center gap-1.5" title="Working sockets">
                <Plug className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-mono-tabular font-medium text-ink">{room.sockets_working}</span>
              </span>
            )}

            {room.has_ac && (
              <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium" title="Air conditioning">
                <Snowflake className="h-3.5 w-3.5" />
                <span>AC</span>
              </span>
            )}
          </div>

          <span className="text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-zinc-500">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
