'use server';

import { revalidatePath } from 'next/cache';

import { eventFormSchema } from '@/lib/validations';
import { getAdminIfAuthorized } from '@/server/admin-guard';

export type EventResult = { ok: boolean; message: string };

/**
 * Create an event. Datetimes are interpreted in campus time (Asia/Kolkata) —
 * the form sends naive local strings, we convert to ISO here so the DB always
 * stores UTC.
 */
export async function createEvent(formData: FormData): Promise<EventResult> {
  const admin = await getAdminIfAuthorized();
  if (!admin) return { ok: false, message: 'Admin access required.' };

  const parsed = eventFormSchema.safeParse({
    title: formData.get('title'),
    category: formData.get('category'),
    starts_at: formData.get('starts_at'),
    ends_at: formData.get('ends_at') || null,
    all_day: formData.get('all_day') === 'on',
    venue_room_id: formData.get('venue_room_id') || null,
    venue_text: formData.get('venue_text') || null,
    organizer: formData.get('organizer') || null,
    description: formData.get('description') || null,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid event.' };
  }

  const e = parsed.data;
  const { error } = await admin.from('events').insert({
    title: e.title,
    category: e.category,
    starts_at: new Date(`${e.starts_at}:00+05:30`).toISOString(),
    ends_at: e.ends_at ? new Date(`${e.ends_at}:00+05:30`).toISOString() : null,
    all_day: e.all_day,
    venue_room_id: e.venue_room_id,
    venue_text: e.venue_text,
    organizer: e.organizer,
    description: e.description,
  });

  if (error) return { ok: false, message: error.message };
  revalidatePath('/events');
  revalidatePath('/admin');
  return { ok: true, message: 'Event created.' };
}

/** Soft-cancel keeps the row for the audit trail; the UI renders it struck through. */
export async function cancelEvent(eventId: string): Promise<EventResult> {
  const admin = await getAdminIfAuthorized();
  if (!admin) return { ok: false, message: 'Admin access required.' };

  const { error } = await admin.from('events').update({ is_cancelled: true }).eq('id', eventId);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/events');
  revalidatePath('/admin');
  return { ok: true, message: 'Event cancelled.' };
}

export async function deleteEvent(eventId: string): Promise<EventResult> {
  const admin = await getAdminIfAuthorized();
  if (!admin) return { ok: false, message: 'Admin access required.' };

  const { error } = await admin.from('events').delete().eq('id', eventId);
  if (error) return { ok: false, message: error.message };

  revalidatePath('/events');
  revalidatePath('/admin');
  return { ok: true, message: 'Event deleted.' };
}
