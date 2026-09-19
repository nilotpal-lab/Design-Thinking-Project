import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type FacultySlot = {
  start: string;
  end: string;
  title: string;
  roomSlug: string | null;
  roomCode: string | null;
  kind: string;
};

export type FacultyEntry = {
  id: string;
  name: string;
  department: string | null;
  email: string | null;
  cabin: {
    code: string;
    slug: string;
    name: string;
    floor: number;
    block: string;
  } | null;
  cabinNote: string | null;
  officeHours: string | null;
  /** Today's teaching commitments, ordered by start time. */
  slots: FacultySlot[];
  /** 'busy' inside a slot, 'soon' ≤60 min before the next one, else 'free'. */
  status: 'busy' | 'soon' | 'free';
  nextAt: { start: string; roomCode: string | null } | null;
};

type SlotRow = {
  faculty_id: string;
  day_of_week: number;
  valid_from: string | null;
  valid_to: string | null;
  start_time: string;
  end_time: string;
  kind: string;
  title_override: string | null;
  batch: string | null;
  rooms: { slug: string; code: string } | null;
  courses: { code: string; title: string } | null;
};

/**
 * Faculty tracker. All reads are anon-safe (`campus_read_all` RLS). Live
 * location derives purely from the timetable — the same source of truth as
 * the room availability engine, so the two can never disagree.
 *
 * "Now" uses campus time (Asia/Kolkata), matching the availability view.
 */
export async function getFacultyTracker(): Promise<FacultyEntry[]> {
  const supabase = await createClient();

  // Campus-local "now" pieces, derived deterministically: en-CA yields ISO
  // YYYY-MM-DD, and the weekday comes from Date.UTC over those Y/M/D parts —
  // no locale-string parsing anywhere.
  const now = new Date();
  const todayIso = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const [y, m, d] = todayIso.split('-').map(Number);
  const jsDow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Sun..6=Sat
  const todayDow = jsDow === 0 ? 7 : jsDow; // ISO 1..7 (Mon=1)
  const hm = now.toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
  const minutesNow = Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3, 5));

  const [facultyRes, slotsRes, roomsRes] = await Promise.all([
    supabase.from('faculty').select('*').order('full_name'),
    supabase
      .from('timetable_slots')
      .select('faculty_id, day_of_week, start_time, end_time, kind, title_override, batch, valid_from, valid_to, rooms (slug, code), courses (code, title)')
      .not('faculty_id', 'is', null),
    supabase
      .from('rooms')
      .select('id, code, slug, name, floors (level), blocks (name)'),
  ]);

  if (facultyRes.error) throw new Error(`Faculty query failed: ${facultyRes.error.message}`);
  if (slotsRes.error) throw new Error(`Timetable query failed: ${slotsRes.error.message}`);
  if (roomsRes.error) throw new Error(`Cabin rooms query failed: ${roomsRes.error.message}`);

  const cabinById = new Map(
    (roomsRes.data ?? []).map((r) => [
      r.id,
      {
        code: r.code,
        slug: r.slug,
        name: r.name,
        floor: r.floors?.level ?? 0,
        block: r.blocks?.name ?? '',
      },
    ]),
  );

  const slotsByFaculty = new Map<string, SlotRow[]>();
  for (const s of (slotsRes.data ?? []) as SlotRow[]) {
    if (!s.faculty_id || s.day_of_week !== todayDow) continue;
    if (s.valid_from && s.valid_from > todayIso) continue;
    if (s.valid_to && s.valid_to < todayIso) continue;
    const list = slotsByFaculty.get(s.faculty_id) ?? [];
    list.push(s);
    slotsByFaculty.set(s.faculty_id, list);
  }

  return (facultyRes.data ?? []).map((f) => {
    const todaySlots = (slotsByFaculty.get(f.id) ?? [])
      .map((s) => {
        const startMin = Number(s.start_time.slice(0, 2)) * 60 + Number(s.start_time.slice(3, 5));
        const endMin = Number(s.end_time.slice(0, 2)) * 60 + Number(s.end_time.slice(3, 5));
        return {
          start: s.start_time.slice(0, 5),
          end: s.end_time.slice(0, 5),
          startMin,
          endMin,
          title: s.title_override ?? (s.courses ? `${s.courses.code} · ${s.courses.title}` : 'Session'),
          roomSlug: s.rooms?.slug ?? null,
          roomCode: s.rooms?.code ?? null,
          kind: s.kind,
        };
      })
      .sort((a, b) => a.startMin - b.startMin);

    const current = todaySlots.find((s) => minutesNow >= s.startMin && minutesNow < s.endMin);
    const upcoming = todaySlots.find((s) => s.startMin > minutesNow);

    const status: FacultyEntry['status'] = current
      ? 'busy'
      : upcoming && upcoming.startMin - minutesNow <= 60
        ? 'soon'
        : 'free';

    const cabin = f.cabin_room_id ? (cabinById.get(f.cabin_room_id) ?? null) : null;

    return {
      id: f.id,
      name: f.full_name,
      department: f.department,
      email: f.email,
      cabin,
      cabinNote: f.cabin_note,
      officeHours: f.office_hours,
      slots: todaySlots.map(({ startMin: _s, endMin: _e, ...rest }) => rest),
      status,
      nextAt: upcoming ? { start: upcoming.start, roomCode: upcoming.roomCode } : null,
    };
  });
}
