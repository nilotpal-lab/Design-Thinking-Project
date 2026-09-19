import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Plug, Projector, Snowflake, Users, Wifi, Monitor } from 'lucide-react';

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
    <div className="space-y-5">
      <Link
        href="/spaces"
        className="inline-flex items-center gap-1.5 text-[13px] text-ink-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> All spaces
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[13px] text-ink-secondary">{room.code}</p>
          <h1 className="mt-0.5 text-[22px] font-semibold leading-7 tracking-[-0.01em]">
            {room.name}
          </h1>
          <p className="mt-1 text-[13px] text-ink-secondary">
            {ROOM_CATEGORY_LABEL[room.category] ?? room.category} · {room.block_name} ·{' '}
            {room.floor_label}
          </p>
        </div>
        <StatusPill
          status={room.status}
          freeMinutes={room.free_minutes}
          occupiedUntil={room.occupied_until}
        />
      </header>

      {/* Current / next session context */}
      <Card>
        <CardContent className="p-5">
          {room.status === 'busy' && room.current_occupancy_title ? (
            <div>
              <p className="text-micro uppercase tracking-wide text-ink-tertiary">In session until {room.occupied_until ? room.occupied_until.slice(0,5) : ''}</p>
              <p className="mt-1 text-[15px] font-medium">{room.current_occupancy_title}</p>
              <p className="text-[13px] text-ink-secondary">
                {room.current_course_code ? `${room.current_course_code} · ` : ''}
                {room.current_faculty ?? ''}
              </p>
            </div>
          ) : room.next_occupancy_from ? (
            <div>
              <p className="text-micro uppercase tracking-wide text-ink-tertiary">
                Next session at {room.next_occupancy_from.slice(0, 5)}
              </p>
              <p className="mt-1 text-[15px] font-medium">{room.next_occupancy_title}</p>
              <p className="text-[13px] text-ink-secondary">
                {room.free_minutes != null ? `Free for another ${formatMinutes(room.free_minutes)}` : 'Free for the rest of the day'}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-micro uppercase tracking-wide text-ink-tertiary">Rest of today</p>
              <p className="mt-1 text-[15px] font-medium">Free for the rest of the day</p>
              <p className="text-[13px] text-ink-secondary">No further sessions scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <p className="text-[13px] text-ink-secondary">
              No scheduled sessions today — the room is open all day.
            </p>
          ) : (
            <TodayTimeline
              slots={slots}
              nowTime={room.as_of_time ?? ''}
            />
          )}
        </CardContent>
      </Card>

      {/* Infrastructure */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>The room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-[13px]">
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4 text-ink-tertiary" aria-hidden />
              <span className="font-mono-tabular font-medium">{room.capacity}</span> seats
            </p>
            <p className="flex items-center gap-2">
              <Plug className="h-4 w-4 text-ink-tertiary" aria-hidden />
              <span className="font-mono-tabular font-medium">{room.sockets_working ?? 0}</span> of{' '}
              <span className="font-mono-tabular">{room.sockets_total ?? 0}</span> sockets working
            </p>
            <p className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-ink-tertiary" aria-hidden />
              {room.has_ac ? (room.ac_type ?? 'Air conditioned') : 'No AC'}
            </p>
            <p className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-ink-tertiary" aria-hidden />
              {room.wifi_band === 'wifi_6e'
                ? 'Wi-Fi 6E (6GHz)'
                : room.wifi_band === 'wifi_5'
                  ? 'Wi-Fi 5'
                  : 'Wi-Fi (band unspecified)'}
            </p>
            <p className="flex items-center gap-2">
              {room.has_projector ? <Projector className="h-4 w-4 text-ink-tertiary" aria-hidden /> : <Monitor className="h-4 w-4 text-ink-tertiary" aria-hidden />}
              {[room.has_projector && 'Projector', room.has_smart_board && 'Smart board', room.has_whiteboard && 'Whiteboard']
                .filter(Boolean)
                .join(' · ') || 'No display equipment'}
            </p>
            {room.comfort_score != null && (
              <p className="text-ink-secondary">
                Comfort score <span className="font-mono-tabular font-medium">{room.comfort_score}</span>/10
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Good to know</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-[13px] text-ink-secondary">{crowd} crowd reported right now.</p>
            <div className="flex flex-wrap gap-1.5" aria-label="Noise vibe">
              <Badge variant="neutral">{room.noise_vibe === 'silent' ? 'Silent zone' : room.noise_vibe === 'collaborative' ? 'Group-friendly' : room.noise_vibe === 'quick_break' ? 'Quick breaks OK' : 'Moderate noise'}</Badge>
              {room.is_accessible && <Badge variant="neutral">Step-free access</Badge>}
            </div>
            <p className="border-t border-line pt-3 text-[13px] leading-6 text-ink-secondary">
              Crowd levels come from student check-ins made in the last 90 minutes — the more
              people report, the more you can trust the number. Be the first to{' '}
              <Link href="/report" className="text-accent hover:underline">
                report how it looks
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live layer: check-in + recent reports */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Check in here</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-[13px] text-ink-secondary">
              Your report helps the next student find a seat — and lasts 90 minutes.
            </p>
            <CheckInForm roomId={room.room_id} roomCode={room.code} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feed.length === 0 ? (
              <p className="text-[13px] text-ink-secondary">
                No reports in the last 90 minutes. Be the first — it takes 20 seconds.
              </p>
            ) : (
              feed.map((f) => (
                <div key={f.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                  <p className="flex flex-wrap items-center gap-2 text-[13px]">
                    <Badge variant={f.crowd_density === 'crowded' || f.crowd_density === 'full' ? 'busy' : f.crowd_density === 'empty' || f.crowd_density === 'light' ? 'free' : 'soon'}>
                      {f.crowd_density ? (CROWD_LABEL[f.crowd_density] ?? f.crowd_density) : 'no data'}
                    </Badge>
                    <span className="text-ink-tertiary">{timeAgo(f.created_at)}</span>
                    {f.is_simulated && <Badge variant="unknown">demo data</Badge>}
                  </p>
                  <p className="mt-1 text-[13px] text-ink-secondary">
                    {f.note ? `“${f.note}”` : 'No note.'}{' '}
                    <span className="text-ink-tertiary">— {f.display_name ?? 'anonymous'}</span>
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
