'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  ArrowRight,
  Snowflake,
  Plug,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { LiveRoom } from '@/server/queries/rooms';

interface CampusSearchProps {
  initialRooms: LiveRoom[];
}

export function CampusSearch({ initialRooms }: CampusSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isFocused, setIsFocused] = useState(false);

  const filteredRooms = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return initialRooms
      .filter((r) => {
        return (
          r.code.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          (q === 'ac' && r.has_ac) ||
          (q === 'free' && r.status === 'free') ||
          (q === 'charging' && (r.sockets_working ?? 0) > 0) ||
          `floor ${r.floor_level}`.includes(q)
        );
      })
      .slice(0, 6);
  }, [query, initialRooms]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      router.push('/spaces');
      return;
    }
    startTransition(() => {
      router.push(`/spaces?q=${encodeURIComponent(query.trim())}`);
    });
  };

  const handleChipClick = (filterQuery: string) => {
    startTransition(() => {
      router.push(filterQuery);
    });
  };

  return (
    <div className="relative w-full">
      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center rounded-lg border border-line bg-surface p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all focus-within:border-[#1B4332] focus-within:ring-2 focus-within:ring-[#1B4332]/10 dark:border-white/[0.12] dark:bg-[#1A1918] dark:focus-within:border-[#52B788]"
      >
        <div className="flex h-10 w-10 items-center justify-center text-ink-tertiary">
          <Search className="h-4 w-4 text-[#1B4332] dark:text-[#74C69D]" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search 63 regular classrooms, floors, AC, or subject (e.g. '201', 'AC', 'Floor 3')..."
          className="flex-1 bg-transparent px-2 text-sm text-ink placeholder:text-ink-tertiary focus:outline-none"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-1.5 text-ink-tertiary hover:text-ink mr-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          className="flex h-9 items-center gap-1.5 rounded-md bg-[#1B4332] px-4 text-xs font-semibold text-white transition-all hover:bg-[#143326] active:scale-[0.98] dark:bg-[#2D6A4F] dark:hover:bg-[#40916C]"
        >
          <span>Search</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* Instant Dropdown Preview */}
      {isFocused && query.trim().length > 0 && (
        <div
          onMouseDown={(e) => e.preventDefault()} // prevent blur before click
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-lg border border-line bg-surface p-2 shadow-lg dark:border-white/[0.12] dark:bg-[#1A1918]"
        >
          <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-ink-tertiary">
            Matching Campus Spaces ({filteredRooms.length})
          </div>

          {filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-xs text-ink-secondary">
              No rooms matching &ldquo;{query}&rdquo;. Press Enter to view full directory.
            </div>
          ) : (
            <div className="divide-y divide-line/40">
              {filteredRooms.map((room) => (
                <Link
                  key={room.room_id}
                  href={`/spaces/${room.slug}`}
                  onClick={() => setIsFocused(false)}
                  className="flex items-center justify-between p-2.5 rounded-md hover:bg-surface-sunken transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-ink">
                      {room.code}
                    </span>
                    <div>
                      <div className="text-xs font-medium text-ink flex items-center gap-1.5">
                        <span>{room.name}</span>
                        {room.has_ac && (
                          <span title="Air Conditioned" className="inline-flex">
                            <Snowflake className="h-3 w-3 text-sky-500" />
                          </span>
                        )}
                        {(room.sockets_working ?? 0) > 0 && (
                          <span title="Charging Points" className="inline-flex">
                            <Plug className="h-3 w-3 text-amber-500" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-secondary">
                        Floor {room.floor_level} · Capacity: {room.capacity} seats
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        room.status === 'free'
                          ? 'pastelMint'
                          : room.status === 'soon'
                          ? 'pastelButter'
                          : 'neutral'
                      }
                    >
                      {room.status === 'free' ? 'Free Now' : room.status === 'soon' ? 'Free Soon' : 'Occupied'}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-1 border-t border-line/60 pt-2 text-right">
            <Link
              href={`/spaces?q=${encodeURIComponent(query.trim())}`}
              onClick={() => setIsFocused(false)}
              className="text-xs font-medium text-[#1B4332] hover:underline dark:text-[#74C69D] inline-flex items-center gap-1"
            >
              <span>View all matching spaces</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Filter Tags / Chips */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <span className="text-[11px] font-medium text-ink-tertiary mr-1 hidden sm:inline">
          Quick filters:
        </span>

        <button
          type="button"
          onClick={() => handleChipClick('/spaces?status=free')}
          className="inline-flex items-center gap-1 rounded-md border border-[#C6E2CF] bg-[#EAF5EE] px-2.5 py-1 text-[11px] font-medium text-[#1B4332] transition-colors hover:bg-[#D8EDE0] dark:border-[#2D6A4F]/40 dark:bg-[#2D6A4F]/20 dark:text-[#74C69D]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          <span>Free Right Now</span>
        </button>

        <button
          type="button"
          onClick={() => handleChipClick('/spaces?ac=true')}
          className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink dark:border-white/[0.08] dark:bg-[#1A1918]"
        >
          <Snowflake className="h-3 w-3 text-sky-500" />
          <span>AC Available</span>
        </button>

        <button
          type="button"
          onClick={() => handleChipClick('/spaces?sockets=true')}
          className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink dark:border-white/[0.08] dark:bg-[#1A1918]"
        >
          <Plug className="h-3 w-3 text-amber-500" />
          <span>Charging Points</span>
        </button>

        <button
          type="button"
          onClick={() => handleChipClick('/spaces?floor=1')}
          className="rounded-md border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink dark:border-white/[0.08] dark:bg-[#1A1918]"
        >
          Floor 1
        </button>

        <button
          type="button"
          onClick={() => handleChipClick('/spaces?floor=2')}
          className="rounded-md border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink dark:border-white/[0.08] dark:bg-[#1A1918]"
        >
          Floor 2
        </button>

        <button
          type="button"
          onClick={() => handleChipClick('/spaces?floor=3')}
          className="rounded-md border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink dark:border-white/[0.08] dark:bg-[#1A1918]"
        >
          Floor 3
        </button>

        <button
          type="button"
          onClick={() => handleChipClick('/spaces?floor=4')}
          className="rounded-md border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink dark:border-white/[0.08] dark:bg-[#1A1918]"
        >
          Floor 4
        </button>
      </div>
    </div>
  );
}
