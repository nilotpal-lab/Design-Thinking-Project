'use server';

import { revalidatePath } from 'next/cache';

import { toggleFavoriteSchema } from '@/lib/validations';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/server/actions/checkins';

/** Toggle a room in the user's favourites. Returns the new state. */
export async function toggleFavorite(formData: FormData): Promise<ActionResult & { favorited?: boolean }> {
  const parsed = toggleFavoriteSchema.safeParse({ room_id: formData.get('room_id') });
  if (!parsed.success) return { ok: false, error: 'Invalid room reference' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Sign in to save favourites.', code: 'auth' };

  const { data: existing } = await supabase
    .from('favorites')
    .select('room_id')
    .eq('user_id', user.id)
    .eq('room_id', parsed.data.room_id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('room_id', parsed.data.room_id);
    if (error) return { ok: false, error: 'Could not remove favourite.' };
    revalidatePath('/my');
    return { ok: true, favorited: false };
  }

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, room_id: parsed.data.room_id });
  if (error) return { ok: false, error: 'Could not save favourite.' };

  revalidatePath('/my');
  revalidatePath('/spaces');
  return { ok: true, favorited: true };
}

/** Ids of rooms the current user has favourited (empty for anon). */
export async function getMyFavoriteIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase.from('favorites').select('room_id').eq('user_id', user.id);
  return (data ?? []).map((r) => r.room_id);
}
