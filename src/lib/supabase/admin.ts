import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/types/database';

/**
 * Admin client — BYPASSES ALL RLS. Only for server-side privileged work
 * (e.g. seeding the demo admin profile). The `server-only` import makes any
 * client-bundle import a hard build error.
 */
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error('SUPABASE_SECRET_KEY is not set — admin operations are unavailable.');
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
