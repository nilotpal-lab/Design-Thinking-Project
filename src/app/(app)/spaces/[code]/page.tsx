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
    <div className="mx-auto w-full max-w-4xl space-y-7">
      {/* Back Button */}
      <Link
        href="/spaces"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-secondary transition-colors hover:text-accent dark:hover:text-accent-hover"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        <span>Back to All Spaces</span>
      </Link>

      {/* Room Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-line/80 bg-surface/80 p-6 shadow-e2 backdrop-blur-xl md:p-8 dark:border-white/10 dark:bg-[#121215]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-accent dark:text-accent-hover">
              {room.code}
            </span>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-ink md:text-3xl">
              {room.name}
            </h1>
            <p className="mt-1 text-[13px] font-medium text-ink-secondary">
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
        <div className="mt-6 rounded-2xl border border-line/60 bg-surface-sunken/60 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
          {room.status === 'busy' && room.current_occupancy_title ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                In Session · Occupied Until {room.occupied_until ? room.occupied_until.slice(0, 5) : ''}
              </p>
              <p className="mt-1 text-base font-bold text-ink">{room.current_occupancy_title}</p>
              <p className="text-xs text-ink-secondary">
                {room.current_course_code ? `${room.current_course_code} · ` : ''}
                Faculty: {room.current_faculty ?? 'Instructor'}
              </p>
            </div>
          ) : room.next_occupancy_from ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Next Session At {room.next_occupancy_from.slice(0, 5)}
              </p>
              <p className="mt-1 text-base font-bold text-ink">{room.next_occupancy_title}</p>
              <p className="text-xs text-ink-secondary">
                {room.free_minutes != null
                  ? `Free for another ${formatMinutes(room.free_minutes)}`
                  : 'Free for the rest of today'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Open Access
              </p>
              <p className="mt-1 text-base font-bold text-ink">Free for the rest of today</p>
              <p className="text-xs text-ink-secondary">
                No further lecture classes scheduled for today.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Today Timeline */}
      <Card className="rounded-3xl p-6 shadow-e1 dark:border-white/10 dark:bg-[#121215]">
        <h2 className="mb-4 text-base font-bold text-ink">Today&apos;s Class Timetable</h2>
        {slots.length === 0 ? (
          <p className="text-sm text-ink-secondary">
            No scheduled sessions today — the space is open all day for self-study.
          </p>
        ) : (
          <TodayTimeline slots={slots} nowTime={room.as_of_time ?? ''} />
        )}
      </Card>

      {/* Infrastructure Bento Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card className="rounded-3xl p-6 shadow-e1 dark:border-white/10 dark:bg-[#121215]">
          <h2 className="mb-4 text-base font-bold text-ink">Room Equipment & Amenities</h2>
          <div className="space-y-3.5 text-[13px] font-medium">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-ink-secondary">
                <Users className="h-4 w-4 text-accent" />
                <span>Seating Capacity</span>
              </span>
              <span className="font-mono text-sm font-bold text-ink">{room.capacity} seats</span>
            </div>

            <div className="flex items-center justify-between border-t border-line/60 pt-2.5 dark:border-white/[0.06]">
              <span className="flex items-center gap-2.5 text-ink-secondary">
                <Plug className="h-4 w-4 text-amber-500" />
                <span>Power Sockets</span>
              </span>
              <span className="font-mono text-sm font-bold text-ink">
                {room.sockets_working ?? 0} of {room.sockets_total ?? 0} working
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-line/60 pt-2.5 dark:border-white/[0.06]">
              <span className="flex items-center gap-2.5 text-ink-secondary">
                <Snowflake className="h-4 w-4 text-sky-500" />
                <span>Air Conditioning</span>
              </span>
              <span className="font-semibold text-ink">
                {room.has_ac ? room.ac_type ?? 'Air Conditioned' : 'No AC'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-line/60 pt-2.5 dark:border-white/[0.06]">
              <span className="flex items-center gap-2.5 text-ink-secondary">
                <Wifi className="h-4 w-4 text-emerald-500" />
                <span>Campus Wi-Fi</span>
              </span>
              <span className="font-semibold text-ink">
                {room.wifi_band === 'wifi_6e'
                  ? 'Wi-Fi 6E (High-Speed)'
                  : room.wifi_band === 'wifi_5'
                    ? 'Wi-Fi 5'
                    : 'Campus Wi-Fi'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-line/60 pt-2.5 dark:border-white/[0.06]">
              <span className="flex items-center gap-2.5 text-ink-secondary">
                {room.has_projector ? (
                  <Projector className="h-4 w-4 text-indigo-500" />
                ) : (
                  <Monitor className="h-4 w-4 text-indigo-500" />
                )}
                <span>Presentation Gear</span>
              </span>
              <span className="font-semibold text-ink">
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
        </Card>

        {/* Space Environment & Noise Vibe */}
        <Card className="rounded-3xl p-6 shadow-e1 dark:border-white/10 dark:bg-[#121215]">
          <h2 className="mb-4 text-base font-bold text-ink">Space Environment</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-tertiary">
                Current Crowd Density
              </p>
              <p className="mt-1 text-base font-bold text-ink">{crowd}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">
                {room.noise_vibe === 'silent'
                  ? 'Silent Zone'
                  : room.noise_vibe === 'collaborative'
                    ? 'Group-Friendly'
                    : room.noise_vibe === 'quick_break'
                      ? 'Quick Breaks OK'
                      : 'Moderate Noise'}
              </Badge>
              {room.is_accessible && <Badge variant="neutral">Step-Free Accessible</Badge>}
            </div>

            {room.comfort_score != null && (
              <div className="rounded-2xl border border-line/60 bg-surface-sunken/60 p-3.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
                    Comfort Index
                  </span>
                  <span className="font-mono text-base font-extrabold text-accent dark:text-accent-hover">
                    {room.comfort_score}/10
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Live Check-in & Recent Activity */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card className="rounded-3xl p-6 shadow-e1 dark:border-white/10 dark:bg-[#121215]">
          <h2 className="text-base font-bold text-ink">Check In Here</h2>
          <p className="mt-1 text-xs text-ink-secondary">
            Your 20-second report updates the live map for fellow students (+15 karma).
          </p>
          <div className="mt-5">
            <CheckInForm roomId={room.room_id} roomCode={room.code} />
          </div>
        </Card>

        <Card className="rounded-3xl p-6 shadow-e1 dark:border-white/10 dark:bg-[#121215]">
          <h2 className="text-base font-bold text-ink">Recent Student Reports</h2>
          <div className="mt-4 space-y-3">
            {feed.length === 0 ? (
              <p className="text-sm text-ink-secondary">
                No check-ins in the last 90 minutes. Be the first to check in!
              </p>
            ) : (
              feed.map((f) => (
                <div
                  key={f.id}
                  className="rounded-xl border border-line/60 bg-surface-sunken/40 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={
                        f.crowd_density === 'crowded' || f.crowd_density === 'full'
                          ? 'busy'
                          : f.crowd_density === 'empty' || f.crowd_density === 'light'
                            ? 'free'
                            : 'soon'
                      }
                    >
                      {f.crowd_density ? (CROWD_LABEL[f.crowd_density] ?? f.crowd_density) : 'Report'}
                    </Badge>
                    <span className="font-mono text-micro text-ink-tertiary">
                      {timeAgo(f.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] font-medium text-ink">
                    {f.note ? `“${f.note}”` : 'Checked in and confirmed status.'}
                  </p>
                  <p className="mt-1 text-micro text-ink-tertiary">
                    by {f.display_name ?? 'Student'}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
