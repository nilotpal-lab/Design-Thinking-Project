import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Monitor, Plug, Projector, Snowflake, Sparkles, Users, Wifi } from 'lucide-react';

import { StatusPill } from '@/components/spaces/status-pill';
import { TodayTimeline } from '@/components/spaces/today-timeline';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckInForm } from '@/components/spaces/check-in-form';
import { getRoomBySlug, getRoomDay } from '@/server/queries/rooms';
import { getRoomFeed } from '@/server/actions/checkins';
import { CROWD_LABEL, formatMinutes, ROOM_CATEGORY_LABEL, timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const room = await getRoomBySlug(code);
  if (!room) notFound();

  const [slots, feed] = await Promise.all([getRoomDay(room.room_id), getRoomFeed(room.room_id)]);

  const crowd = room.crowd_density
    ? CROWD_LABEL[room.crowd_density] ?? room.crowd_density
    : 'No reports yet';

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Back Link */}
      <Link
        href="/spaces"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-ink dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        <span>Back to Spaces Directory</span>
      </Link>

      {/* Room Hero Header */}
      <div className="rounded-xl border border-line bg-surface p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500">
              {room.code}
            </span>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
              {room.name}
            </h1>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {ROOM_CATEGORY_LABEL[room.category] ?? room.category} · {room.block_name} · Floor{' '}
              {room.floor_level} ({room.floor_label})
            </p>
          </div>
          <StatusPill
            status={room.status}
            freeMinutes={room.free_minutes}
            occupiedUntil={room.occupied_until}
            className="self-start text-xs"
          />
        </div>

        {/* Current / Next occupancy summary banner */}
        <div className="mt-4 rounded-lg border border-line/60 bg-surface-sunken p-3 dark:border-white/[0.06] dark:bg-[#141416]">
          {room.status === 'busy' && room.current_occupancy_title ? (
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                In Session · Occupied Until {room.occupied_until ? room.occupied_until.slice(0, 5) : ''}
              </p>
              <p className="mt-0.5 text-sm font-bold text-ink">{room.current_occupancy_title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {room.current_course_code ? `${room.current_course_code} · ` : ''}
                Faculty: {room.current_faculty ?? 'Instructor'}
              </p>
            </div>
          ) : room.next_occupancy_from ? (
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Next Lecture At {room.next_occupancy_from.slice(0, 5)}
              </p>
              <p className="mt-0.5 text-sm font-bold text-ink">{room.next_occupancy_title}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {room.free_minutes != null
                  ? `Free for another ${formatMinutes(room.free_minutes)}`
                  : 'Free for the rest of today'}
              </p>
            </div>
          ) : (
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Open Access
              </p>
              <p className="mt-0.5 text-sm font-bold text-ink">Free for the rest of today</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                No further lecture classes scheduled for today.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Today Timeline */}
      <div className="rounded-xl border border-line bg-surface p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]">
        <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Today&apos;s Class Timetable
        </h2>
        {slots.length === 0 ? (
          <p className="text-xs text-zinc-400">
            No scheduled sessions today — open all day for self-study.
          </p>
        ) : (
          <TodayTimeline slots={slots} nowTime={room.as_of_time ?? ''} />
        )}
      </div>

      {/* Infrastructure Bento Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]">
          <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Room Amenities
          </h2>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Users className="h-3.5 w-3.5" />
                <span>Seating Capacity</span>
              </span>
              <span className="font-mono font-semibold text-ink">{room.capacity} seats</span>
            </div>

            <div className="flex items-center justify-between border-t border-line/60 pt-2 dark:border-white/[0.06]">
              <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Plug className="h-3.5 w-3.5" />
                <span>Power Sockets</span>
              </span>
              <span className="font-mono font-semibold text-ink">
                {room.sockets_working ?? 0} of {room.sockets_total ?? 0} working
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-line/60 pt-2 dark:border-white/[0.06]">
              <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Snowflake className="h-3.5 w-3.5" />
                <span>Air Conditioning</span>
              </span>
              <span className="font-medium text-ink">
                {room.has_ac ? room.ac_type ?? 'Air Conditioned' : 'No AC'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-line/60 pt-2 dark:border-white/[0.06]">
              <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Wifi className="h-3.5 w-3.5" />
                <span>Campus Wi-Fi</span>
              </span>
              <span className="font-medium text-ink">
                {room.wifi_band === 'wifi_6e'
                  ? 'Wi-Fi 6E'
                  : room.wifi_band === 'wifi_5'
                    ? 'Wi-Fi 5'
                    : 'Campus Wi-Fi'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-line/60 pt-2 dark:border-white/[0.06]">
              <span className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                {room.has_projector ? (
                  <Projector className="h-3.5 w-3.5" />
                ) : (
                  <Monitor className="h-3.5 w-3.5" />
                )}
                <span>Display Gear</span>
              </span>
              <span className="font-medium text-ink">
                {[
                  room.has_projector && 'Projector',
                  room.has_smart_board && 'Smart Board',
                  room.has_whiteboard && 'Whiteboard',
                ]
                  .filter(Boolean)
                  .join(' · ') || 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Space Environment & Noise Vibe */}
        <div className="rounded-xl border border-line bg-surface p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]">
          <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Environment & Vibe
          </h2>
          <div className="space-y-3">
            <div>
              <p className="font-mono text-[10px] uppercase text-zinc-400">
                Live Crowd Density
              </p>
              <p className="mt-0.5 text-sm font-bold text-ink">{crowd}</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                {room.noise_vibe === 'silent'
                  ? 'Silent Zone'
                  : room.noise_vibe === 'collaborative'
                    ? 'Group-Friendly'
                    : room.noise_vibe === 'quick_break'
                      ? 'Quick Breaks'
                      : 'Moderate Noise'}
              </span>
              {room.is_accessible && (
                <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                  Step-Free Accessible
                </span>
              )}
            </div>

            {room.comfort_score != null && (
              <div className="rounded-lg border border-line/60 bg-surface-sunken p-2.5 dark:border-white/[0.06] dark:bg-[#141416]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase text-zinc-400">
                    Comfort Index
                  </span>
                  <span className="font-mono text-sm font-bold text-ink">
                    {room.comfort_score} / 10
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Check-in & Recent Activity */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]">
          <h2 className="text-sm font-bold text-ink">Check In Here</h2>
          <p className="mt-0.5 text-[11px] text-zinc-400">
            Your report updates the live map for fellow students (+15 karma).
          </p>
          <div className="mt-4">
            <CheckInForm roomId={room.room_id} roomCode={room.code} />
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]">
          <h2 className="text-sm font-bold text-ink">Recent Student Reports</h2>
          <div className="mt-3 space-y-2">
            {feed.length === 0 ? (
              <p className="text-xs text-zinc-400">
                No check-ins in the last 90 minutes.
              </p>
            ) : (
              feed.map((f) => (
                <div
                  key={f.id}
                  className="rounded-lg border border-line/60 bg-surface-sunken p-2.5 dark:border-white/[0.06] dark:bg-[#141416]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-semibold uppercase text-zinc-500 dark:text-zinc-400">
                      {f.crowd_density ? (CROWD_LABEL[f.crowd_density] ?? f.crowd_density) : 'Report'}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {timeAgo(f.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink">
                    {f.note ? `“${f.note}”` : 'Checked in and confirmed status.'}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-400">
                    by {f.display_name ?? 'Student'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
