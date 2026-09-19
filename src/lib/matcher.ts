import type { LiveRoom } from '@/server/queries/rooms';

/**
 * Matcher scoring — pure and explainable.
 *
 * An unexplainable score is worse than no score (DESIGN §4): every result
 * ships with the reasons that produced it. Weights are visible constants so
 * a viva panel can audit them, and `explain` lists the components in plain
 * language, biggest contribution first.
 */

export type MatcherWants = 'sockets' | 'ac' | 'silent' | 'group' | 'presentation';

export type MatcherInput = {
  /** People who need seats. */
  size: number;
  /** Minutes of undisturbed availability required. */
  duration: number;
  wants: MatcherWants[];
};

export type MatchResult = {
  room: LiveRoom;
  score: number;
  /** Plain-language reasons, strongest contribution first. */
  reasons: string[];
};

const WANT_LABEL: Record<MatcherWants, string> = {
  sockets: 'power sockets',
  ac: 'air conditioning',
  silent: 'a silent zone',
  group: 'group-friendly seating',
  presentation: 'presentation equipment',
};

/** Free for at least `duration` minutes? "Free until end of day" = null. */
function coversDuration(freeMinutes: number | null, duration: number): boolean {
  return freeMinutes === null || freeMinutes >= duration;
}

export function matchRooms(rooms: LiveRoom[], input: MatcherInput): MatchResult[] {
  const results = rooms.map((room) => scoreRoom(room, input));
  return results.sort((a, b) => b.score - a.score || a.room.code.localeCompare(b.room.code, undefined, { numeric: true }));
}

function scoreRoom(room: LiveRoom, input: MatcherInput): MatchResult {
  const reasons: { text: string; weight: number }[] = [];
  let score = 0;

  // --- Availability (45) — the dominant factor -------------------------------
  if (room.status === 'free' && coversDuration(room.free_minutes, input.duration)) {
    score += 45;
    reasons.push({
      text:
        room.free_minutes === null
          ? 'Free for the rest of the day'
          : `Free for ${Math.round(room.free_minutes)} min — covers your ${input.duration} min`,
      weight: 45,
    });
  } else if (room.status === 'free') {
    score += 18;
    reasons.push({
      text: `Free now, but only ~${Math.round(room.free_minutes ?? 0)} min before the next session`,
      weight: 18,
    });
  } else if (room.status === 'soon') {
    score += 8;
    reasons.push({ text: 'In session now, but freeing up shortly', weight: 8 });
  } else {
    reasons.push({ text: 'In session right now', weight: 0 });
  }

  // --- Capacity fit (20) ------------------------------------------------------
  if (room.capacity >= input.size) {
    const spare = room.capacity - input.size;
    // Exact-ish fits score highest; huge rooms are fine but not "designed for you".
    const fit = spare <= Math.max(4, input.size) ? 20 : 14;
    score += fit;
    reasons.push({
      text:
        spare === 0
          ? `Exactly ${room.capacity} seats — full fit for your group of ${input.size}`
          : `${room.capacity} seats for ${input.size} people`,
      weight: fit,
    });
  } else {
    score -= 15;
    reasons.push({
      text: `Too small: ${room.capacity} seats for ${input.size} people`,
      weight: -15,
    });
  }

  // --- Requirement satisfaction (12 each) -------------------------------------
  const satisfied: MatcherWants[] = [];
  for (const want of input.wants) {
    let ok = false;
    let detail = '';
    switch (want) {
      case 'sockets':
        ok = (room.sockets_working ?? 0) >= Math.max(2, Math.ceil(input.size / 2));
        detail = `${room.sockets_working ?? 0} working sockets`;
        break;
      case 'ac':
        ok = room.has_ac === true;
        detail = room.ac_type ?? 'Air conditioned';
        break;
      case 'silent':
        ok = room.noise_vibe === 'silent';
        detail = 'designated silent zone';
        break;
      case 'group':
        ok = room.noise_vibe === 'moderate' || room.noise_vibe === 'collaborative';
        detail = room.noise_vibe === 'collaborative' ? 'collaborative buzz atmosphere' : 'group work allowed';
        break;
      case 'presentation':
        // `||` on two booleans-that-might-be-null yields null, not boolean.
        ok = room.has_projector === true || room.has_smart_board === true;
        detail = [room.has_projector && 'projector', room.has_smart_board && 'smart board'].filter(Boolean).join(' + ');
        break;
    }
    if (ok) {
      score += 12;
      satisfied.push(want);
      reasons.push({ text: `Has ${WANT_LABEL[want]} — ${detail}`, weight: 12 });
    } else {
      score -= 8;
      reasons.push({ text: `Missing ${WANT_LABEL[want]}`, weight: -8 });
    }
  }

  // --- Crowd sanity (8) — skip only when we have real evidence -----------------
  if (room.crowd_density === 'crowded' || room.crowd_density === 'full') {
    score -= 8;
    reasons.push({ text: 'Students report it is crowded right now', weight: -8 });
  } else if (room.crowd_density === 'empty' || room.crowd_density === 'light') {
    score += 8;
    reasons.push({ text: 'Student reports say it is quiet right now', weight: 8 });
  }

  // Clamp to 0..100 and sort reasons by actual weight, strongest first.
  score = Math.max(0, Math.min(100, Math.round(score)));
  const reasonsSorted = reasons
    .filter((r) => r.text)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4)
    .map((r) => r.text);

  return { room, score, reasons: reasonsSorted };
}
