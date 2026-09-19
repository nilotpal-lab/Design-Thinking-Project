import type { LiveRoom } from '@/server/queries/rooms';

/**
 * Deterministic test fixture for the live-status view row. Every optional
 * field defaults to something sensible for a "free room with nothing
 * happening"; tests override only what they assert on.
 *
 * Typed as `unknown`-ish on purpose: LiveRoom is RoomLiveStatus & {...}, and
 * a full literal of the generated Row is brittle. This factory produces an
 * object the compiler still checks structurally at the call site.
 */
export function makeRoom(overrides: Partial<Record<string, unknown>> = {}): LiveRoom {
  const base: Record<string, unknown> = {
    // Identity — required by LiveRoom.
    room_id: '00000000-0000-0000-0000-000000000001',
    code: '101',
    slug: '101',
    name: 'Room 101',
    category: 'smart_classroom',
    // Exact-ish fit for the default group of 4 (spare 4 ≤ max(4, 4)) so the
    // capacity branch contributes its full 20 in most tests.
    capacity: 8,
    floor_level: 1,
    status: 'free',

    // Engine output.
    free_minutes: 120,
    is_free_now: true,
    occupied_until: null,
    as_of_date: '2026-09-19',
    as_of_time: '10:00:00',
    computed_at: null,
    confidence: 'timetable',

    // Context.
    block_code: 'A',
    block_name: 'Block A',
    floor_label: 'Level 1',
    current_batch: null,
    current_course_code: null,
    current_faculty: null,
    current_occupancy_kind: null,
    current_occupancy_title: null,
    next_occupancy_from: null,
    next_occupancy_title: null,

    // Infrastructure.
    ac_type: 'split',
    has_ac: true,
    has_projector: true,
    has_smart_board: false,
    has_whiteboard: true,
    is_accessible: true,
    noise_vibe: 'moderate',
    sockets_total: 20,
    sockets_working: 18,
    wifi_band: '5GHz',
    comfort_score: 0.8,

    // Community signal.
    crowd_density: null,
    report_count: 0,
    open_issue_count: 0,
    last_report_at: null,
    map_x: null,
    map_y: null,
    map_w: null,
    map_h: null,
  };

  return { ...base, ...overrides } as unknown as LiveRoom;
}
