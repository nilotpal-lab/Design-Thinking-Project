import 'server-only';

import { createClient } from '@/lib/supabase/server';

export type CampusEvent = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  venueSlug: string | null;
  venueCode: string | null;
  venueText: string | null;
  /** ISO timestamps in UTC; the UI formats them in campus time. */
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  organizer: string | null;
  isCancelled: boolean;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  venue_room_id: string | null;
  venue_text: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  organizer: string | null;
  is_cancelled: boolean;
  rooms: { slug: string; code: string } | null;
};

function normalize(e: EventRow): CampusEvent {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.category,
    venueSlug: e.rooms?.slug ?? null,
    venueCode: e.rooms?.code ?? null,
    venueText: e.venue_text,
    startsAt: e.starts_at,
    endsAt: e.ends_at,
    allDay: e.all_day,
    organizer: e.organizer,
    isCancelled: e.is_cancelled,
  };
}

/** Events whose *end* falls on/after `dayIso` and whose start before the next day. */
export async function getEventsOnDay(dayIso: string): Promise<CampusEvent[]> {
  const supabase = await createClient();
  const nextDay = new Date(`${dayIso}T00:00:00+05:30`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const nextIso = nextDay.toISOString();

  const { data, error } = await supabase
    .from('events')
    .select('*, rooms (slug, code)')
    .eq('is_cancelled', false)
    .lt('starts_at', nextIso)
    .or(`ends_at.is.null,ends_at.gte.${dayIso}T00:00:00+05:30`)
    .order('starts_at');

  if (error) throw new Error(`Events query failed: ${error.message}`);
  return (data ?? []).map(normalize);
}

/** Next N events strictly after right now (campus time). */
export async function getUpcomingEvents(limit = 20): Promise<CampusEvent[]> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('events')
    .select('*, rooms (slug, code)')
    .eq('is_cancelled', false)
    .gte('starts_at', nowIso)
    .order('starts_at')
    .limit(limit);

  if (error) throw new Error(`Upcoming events query failed: ${error.message}`);
  return (data ?? []).map(normalize);
}

/** All events (admin view, includes cancelled + past). */
export async function getAllEvents(): Promise<CampusEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, rooms (slug, code)')
    .order('starts_at', { ascending: false })
    .limit(100);

  if (error) throw new Error(`Events query failed: ${error.message}`);
  return (data ?? []).map(normalize);
}
