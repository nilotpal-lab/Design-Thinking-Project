import Link from 'next/link';
import { Plug, Snowflake, Users } from 'lucide-react';

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
};

/**
 * Whole card is a link; no nested interactive elements (DESIGN §4).
 * Meta icons pair with numbers so meaning survives without colour.
 */
export function RoomCard({ room, className }: { room: RoomCardData; className?: string }) {
  return (
    <Link
      href={`/spaces/${room.slug}`}
      className={cn(
        'group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        className,
      )}
    >
      <Card className="h-full p-4 transition-all duration-fast ease-out-expo group-hover:-translate-y-px group-hover:shadow-e2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[13px] font-medium text-ink-secondary">{room.code}</p>
            <p className="mt-0.5 truncate text-[15px] font-semibold leading-6 tracking-[-0.01em]">
              {room.name}
            </p>
            <p className="mt-0.5 text-[13px] text-ink-secondary">
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

        <div className="mt-3 flex items-center gap-4 border-t border-line pt-3 text-[13px] text-ink-secondary">
          <span className="inline-flex items-center gap-1.5" title="Seats">
            <Users className="h-3.5 w-3.5" aria-hidden />
            <span className="font-mono-tabular">{room.capacity}</span>
          </span>
          {room.sockets_working != null && room.sockets_working > 0 && (
            <span className="inline-flex items-center gap-1.5" title="Working sockets">
              <Plug className="h-3.5 w-3.5" aria-hidden />
              <span className="font-mono-tabular">{room.sockets_working}</span>
            </span>
          )}
          {room.has_ac && (
            <span className="inline-flex items-center gap-1.5" title="Air conditioning">
              <Snowflake className="h-3.5 w-3.5" aria-hidden />
              AC
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
