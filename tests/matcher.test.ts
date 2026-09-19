import { describe, expect, it } from 'vitest';

import { matchRooms, type MatcherInput } from '@/lib/matcher';

import { makeRoom } from './factories';

/**
 * Matcher contract tests (DESIGN §4 — "explainable or nothing").
 *
 * The weights are documented, auditable constants: availability 45,
 * capacity fit 20, requirements 12 each, crowd sanity ±8, small-room
 * penalty −15, missing-requirement penalty −8. These tests pin the
 * *decisions*, not the arithmetic — if a weight changes deliberately,
 * the assertion numbers change with it and the diff shows why.
 */

const BASE_INPUT: MatcherInput = { size: 4, duration: 60, wants: [] };

describe('matchRooms — availability dominates', () => {
  it('ranks a free room above one in session, all else equal', () => {
    const free = makeRoom({ code: '101', status: 'free', free_minutes: 120 });
    const busy = makeRoom({ code: '102', status: 'busy', free_minutes: 0 });

    const [first] = matchRooms([busy, free], BASE_INPUT);
    expect(first.room.code).toBe('101');
  });

  it('caps the availability bonus when the free window is shorter than requested', () => {
    const longFree = makeRoom({ code: '101', free_minutes: 120 });
    const shortFree = makeRoom({ code: '102', free_minutes: 10 });

    const results = matchRooms([longFree, shortFree], BASE_INPUT);
    const byCode = Object.fromEntries(results.map((r) => [r.room.code, r.score]));
    expect(byCode['101']).toBeGreaterThan(byCode['102']);
    expect(results.find((r) => r.room.code === '102')?.reasons.join(' ')).toMatch(/only/i);
  });

  it('treats "free for the rest of the day" (null free_minutes) as full availability', () => {
    const allDay = makeRoom({ code: '101', free_minutes: null, status: 'free' });
    const capped = makeRoom({ code: '102', free_minutes: 90, status: 'free' });

    const [first] = matchRooms([capped, allDay], BASE_INPUT);
    expect(first.room.code).toBe('101');
    expect(first.reasons.join(' ')).toMatch(/rest of the day/i);
  });
});

describe('matchRooms — capacity fit', () => {
  it('prefers an exact fit over a huge hall', () => {
    const exact = makeRoom({ code: '101', capacity: 4 });
    const hall = makeRoom({ code: '102', capacity: 200 });

    const [first] = matchRooms([hall, exact], BASE_INPUT);
    expect(first.room.code).toBe('101');
  });

  it('heavily penalizes rooms too small for the group', () => {
    const tooSmall = makeRoom({ capacity: 2 });
    const fits = makeRoom({ room_id: '00000000-0000-0000-0000-000000000002', code: '102', slug: '102', capacity: 10 });

    const [first] = matchRooms([tooSmall, fits], BASE_INPUT);
    expect(first.room.code).toBe('102');
    expect(first.score).toBeGreaterThan(0);
  });
});

describe('matchRooms — requirements are explainable', () => {
  it('grants 12 per satisfied want and says so', () => {
    const room = makeRoom({ has_ac: true, sockets_working: 8 });
    const input: MatcherInput = { size: 4, duration: 60, wants: ['ac', 'sockets'] };

    const [first] = matchRooms([room], input);
    // 45 availability + 20 capacity + 12 + 12 = 89
    expect(first.score).toBe(89);
    expect(first.reasons.some((r) => /air conditioning/i.test(r))).toBe(true);
    expect(first.reasons.some((r) => /power sockets/i.test(r))).toBe(true);
  });

  it('demerits a missing requirement rather than dropping the room', () => {
    const noAc = makeRoom({ has_ac: false });
    const input: MatcherInput = { size: 4, duration: 60, wants: ['ac'] };

    const [first] = matchRooms([noAc], input);
    expect(first.score).toBe(45 + 20 - 8); // 57
    expect(first.reasons.join(' ')).toMatch(/missing air conditioning/i);
  });

  it('requires sockets scaled to group size', () => {
    const twoSockets = makeRoom({ sockets_working: 2 });
    const solo: MatcherInput = { size: 1, duration: 30, wants: ['sockets'] };
    const sixPack: MatcherInput = { size: 6, duration: 60, wants: ['sockets'] };

    // ceil(1/2)=1 → max(2,1)=2 sockets is enough for one person…
    expect(matchRooms([twoSockets], solo)[0].score).toBeGreaterThan(70);
    // …but ceil(6/2)=3 is not for six.
    expect(matchRooms([twoSockets], sixPack)[0].reasons.join(' ')).toMatch(/missing power sockets/i);
  });

  it('presentation is satisfied by projector OR smart board', () => {
    const projectorOnly = makeRoom({ has_projector: true, has_smart_board: false });
    const input: MatcherInput = { size: 4, duration: 60, wants: ['presentation'] };

    expect(matchRooms([projectorOnly], input)[0].score).toBe(45 + 20 + 12);
  });
});

describe('matchRooms — crowd sanity', () => {
  it('rewards quiet rooms and demerits crowded ones only on real evidence', () => {
    const quiet = makeRoom({ crowd_density: 'light' });
    const packed = makeRoom({ room_id: '00000000-0000-0000-0000-000000000002', code: '102', slug: '102', crowd_density: 'crowded' });

    const results = matchRooms([packed, quiet], BASE_INPUT);
    const byCode = Object.fromEntries(results.map((r) => [r.room.code, r.score]));
    expect(byCode['101']).toBe(byCode['102'] + 16); // +8 vs −8
  });

  it('stays neutral when no check-ins exist', () => {
    const noReports = makeRoom({ crowd_density: null });
    expect(matchRooms([noReports], BASE_INPUT)[0].score).toBe(45 + 20);
  });
});

describe('matchRooms — output contract', () => {
  it('clamps scores to 0..100', () => {
    const awful = makeRoom({
      status: 'busy',
      free_minutes: 0,
      capacity: 1,
      has_ac: false,
      sockets_working: 0,
      crowd_density: 'full',
    });
    const input: MatcherInput = { size: 8, duration: 120, wants: ['ac', 'sockets', 'silent', 'group', 'presentation'] };

    expect(matchRooms([awful], input)[0].score).toBe(0);
  });

  it('sorts by score desc, then code asc for stable ties', () => {
    const b = makeRoom({ code: 'B', slug: 'b', room_id: '00000000-0000-0000-0000-000000000002' });
    const a = makeRoom({ code: 'A', slug: 'a', room_id: '00000000-0000-0000-0000-000000000003' });
    const c = makeRoom({ code: 'C', slug: 'c', room_id: '00000000-0000-0000-0000-000000000004', status: 'busy' });

    const order = matchRooms([c, b, a], BASE_INPUT).map((r) => r.room.code);
    expect(order).toEqual(['A', 'B', 'C']);
  });

  it('never returns more than 4 reasons, strongest first', () => {
    const room = makeRoom({ crowd_density: 'crowded' });
    const input: MatcherInput = { size: 99, duration: 60, wants: ['ac', 'sockets', 'silent', 'group', 'presentation'] };

    const [first] = matchRooms([room], input);
    expect(first.reasons.length).toBeLessThanOrEqual(4);
  });
});
