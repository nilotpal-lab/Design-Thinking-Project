'use client';

import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/types/database';

/**
 * Browser client. Singleton: realtime needs ONE connection per tab, and
 * goTrueClient reuse avoids duplicated session storage listeners.
 */
let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Checks whether valid Supabase configuration is available in client environment.
 * Ensures we don't attempt to create a client with missing or placeholder keys.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;
  if (url.includes('your-project-ref') || key.includes('your-anon-key')) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function createClient(): ReturnType<typeof createBrowserClient<Database>> | null {
  if (client) return client;

  if (!isSupabaseConfigured()) {
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    client = createBrowserClient<Database>(url, key);
    return client;
  } catch (err) {
    console.warn('Failed to initialize Supabase browser client:', err);
    return null;
  }
}
