import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { RoomLiveStatus, FloorSummary } from '@/lib/supabase/types';
import type { RoomStatus } from '@/components/spaces/status-pill';

/**
 * Generated view types are conservative (every column nullable — PostgREST
 * can't see the NOT NULL constraints behind the view). We guarantee the core
 * identity fields exactly once, here, so no UI code needs null checks.
 */
export type LiveRoom = RoomLiveStatus & {
  status: RoomStatus;
  room_id: string;
  code: string;
  slug: string;
  name: string;
  category: string;
  capacity: number;
  floor_level: number;
};

function toStatus(s: string | null): RoomStatus {
  return s === 'free' || s === 'soon' || s === 'busy' ? s : 'unknown';
}

function normalize(r: RoomLiveStatus): LiveRoom | null {
  if (!r.room_id || !r.code || !r.slug || !r.name || !r.category) return null;
  return {
    ...r,
    status: toStatus(r.status),
    room_id: r.room_id,
    code: r.code,
    slug: r.slug,
    name: r.name,
    category: r.category,
    capacity: r.capacity ?? 0,
    floor_level: r.floor_level ?? 0,
  };
}

/**
 * One query feeds explorer, map and dashboard — the single source of truth
 * the plan promises. RLS-scoped; anon reads work with no session.
 */
export async function getLiveRooms(): Promise<LiveRoom[]> {
  const supabase = await createClient();
  const [{ data, error }, blockRes] = await Promise.all([
    supabase
      .from('v_room_live_status')
      .select('*')
      .order('floor_level')
      .order('code'),
    // Block identity for the floor map (the view doesn't expose it).
    supabase.from('rooms').select('id, blocks (name)'),
  ]);

  if (error) throw new Error(`Live status query failed: ${error.message}`);
  const blockById = new Map(
    (blockRes.data ?? []).map((r) => [r.id, (r.blocks as { name?: string } | null)?.name ?? null]),
  );

  return (data ?? [])
    .map((r) => {
      const n = normalize(r as RoomLiveStatus);
      return n ? { ...n, block_name: blockById.get(n.room_id) ?? null } : null;
    })
    .filter((r): r is LiveRoom => r !== null);
}

export async function getFloorSummary(): Promise<FloorSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('v_floor_summary')
    .select('*')
    .order('block_code')
    .order('floor_level');

  if (error) throw new Error(`Floor summary query failed: ${error.message}`);
  return data ?? [];
}

export async function getRoomBySlug(slug: string): Promise<LiveRoom | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('v_room_live_status')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`Room query failed: ${error.message}`);
  return data ? normalize(data as RoomLiveStatus) : null;
}

/** Day timeline rows for one room (fn_room_day RPC). */
export type DaySlot = {
  slot_start: string;
  slot_end: string;
  title: string;
  kind: string;
  source: string;
  course_code: string | null;
  faculty_name: string | null;
  is_past: boolean;
  is_current: boolean;
};

export async function getRoomDay(roomId: string): Promise<DaySlot[]> {
  const supabase = await createClient();
  // Generated args type requires p_date; pass today's date in campus time
  // (en-CA yields ISO YYYY-MM-DD for the given zone).
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const { data, error } = await supabase.rpc('fn_room_day', { p_date: today, p_room_id: roomId });

  if (error) throw new Error(`Day timeline query failed: ${error.message}`);
  return (data ?? []).map((d) => ({
    slot_start: (d.slot_start ?? '').slice(0, 5),
    slot_end: (d.slot_end ?? '').slice(0, 5),
    title: d.title ?? 'Scheduled session',
    kind: d.kind ?? 'session',
    source: d.source ?? 'timetable',
    course_code: d.course_code,
    faculty_name: d.faculty_name,
    is_past: d.is_past ?? false,
    is_current: d.is_current ?? false,
  }));
}
