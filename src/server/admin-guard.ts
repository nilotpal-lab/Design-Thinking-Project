import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

import { createAdminClient } from '@/lib/supabase/admin';

export type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Single trust boundary for every admin action: re-verifies `role = 'admin'`
 * from the live session on each call. UI-hidden buttons are cosmetic; this is
 * the actual gate. Returns null when the caller is not an admin.
 */
export async function getAdminIfAuthorized(): Promise<AdminClient | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return null;
  return admin;
}
