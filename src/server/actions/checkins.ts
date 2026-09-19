'use server';

import { revalidatePath } from 'next/cache';

import { checkInSchema, voteCheckInSchema } from '@/lib/validations';
import { createClient } from '@/lib/supabase/server';

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; code?: string };

/**
 * Create a check-in. All validation happens here, server-side; the client
 * sends a plain FormData. Rate limiting is enforced by the DB (unique
 * room/user/20-min bucket) and returned as a friendly error here.
 */
export async function createCheckIn(formData: FormData): Promise<ActionResult> {
  const parsed = checkInSchema.safeParse({
    room_id: formData.get('room_id'),
    crowd_density: formData.get('crowd_density'),
    ac_comfort: formData.get('ac_comfort') ?? '',
    socket_availability: formData.get('socket_availability') ?? '',
    purpose: formData.get('purpose') ?? '',
    note: formData.get('note') ?? '',
    is_anonymous: formData.get('is_anonymous') === 'on',
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid check-in' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: 'Sign in to check in — it takes 10 seconds.', code: 'auth' };
  }

  const v = parsed.data;
  const { error } = await supabase.from('check_ins').insert({
    room_id: v.room_id,
    user_id: user.id,
    crowd_density: v.crowd_density,
    ac_comfort: v.ac_comfort === '' ? null : v.ac_comfort,
    socket_availability: v.socket_availability === '' ? null : v.socket_availability,
    purpose: v.purpose === '' ? null : v.purpose,
    note: v.note === '' ? null : v.note,
    is_anonymous: v.is_anonymous,
  });

  if (error) {
    // 23505 = unique_violation on (room_id, user_id, rate_bucket): the
    // database-enforced 20-minute rate limit.
    if (error.code === '23505') {
      return { ok: false, error: 'You already checked in here in the last 20 minutes.' };
    }
    return { ok: false, error: `Could not save your check-in (${error.code ?? 'unknown'})` };
  }

  revalidatePath('/spaces');
  revalidatePath(`/spaces/${slugFor(v.room_id)}`);
  return { ok: true };
}

/** "This is still accurate" — confirm someone else's report. */
export async function markCheckInHelpful(formData: FormData): Promise<ActionResult> {
  const parsed = voteCheckInSchema.safeParse({ check_in_id: formData.get('check_in_id') });
  if (!parsed.success) return { ok: false, error: 'Invalid check-in reference' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sign in to confirm reports.', code: 'auth' };

  const { error } = await supabase
    .from('check_in_votes')
    .insert({ check_in_id: parsed.data.check_in_id, user_id: user.id });

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'You already confirmed this one.' };
    return { ok: false, error: 'Could not confirm — try again.' };
  }

  revalidatePath('/spaces');
  return { ok: true };
}

/**
 * The last 90 minutes of reports, via the anon-safe feed view (raw
 * `check_ins` rows are NOT readable by anon; the aggregate + pseudonymous
 * feed is). Identity is resolved server-side only when not anonymous.
 */
export type FeedItem = {
  id: string;
  room_id: string;
  room_code: string | null;
  room_name: string | null;
  crowd_density: string | null;
  ac_comfort: string | null;
  socket_availability: string | null;
  purpose: string | null;
  note: string | null;
  is_simulated: boolean | null;
  helpful_count: number | null;
  display_name: string | null;
  created_at: string | null;
  is_live: boolean | null;
};

export async function getCheckinFeed(limit = 12): Promise<FeedItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('v_checkin_feed')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Feed query failed: ${error.message}`);
  return data as FeedItem[];
}

/** Reports for one room, newest first (anon-safe feed view). */
export async function getRoomFeed(roomId: string, limit = 5): Promise<FeedItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('v_checkin_feed')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Room feed query failed: ${error.message}`);
  return data as FeedItem[];
}

// Map room_id -> slug without a second query in the common path: slugs are
// unique and this action revalidates by path, so a cheap lookup is fine.
async function slugFor(roomId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.from('rooms').select('slug').eq('id', roomId).maybeSingle();
  return data?.slug ?? roomId;
}
