import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from '@/types/database';

/**
 * Server-side Supabase client (Server Components + Server Actions).
 *
 * Reads/writes the auth session through Next's cookie store so the session
 * survives SSR, client navigation and Server Actions alike. `getAll`/`setAll`
 * is the current @supabase/ssr API (the old get/set/remove pattern is
 * deprecated and breaks on Next 16).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Publishable key is the public identifier; RLS is the real guard.
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render pass — cookies are
            // read-only there. The middleware session-refresh path handles
            // rotation; this is safe to swallow.
          }
        },
      },
    },
  );
}
