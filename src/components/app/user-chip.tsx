'use client';

import { LogOut, UserRound } from 'lucide-react';

import { emailToUsername } from '@/lib/username-auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';

export type SessionUser = {
  email: string | null;
  fullName: string;
  role: string;
  karma: number;
};

/**
 * Session chip + sign in/out. Anonymous-first: browsing needs nothing; this is
 * only ever a prompt to contribute.
 */
export function UserChip() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role, karma')
          .eq('id', data.user.id)
          .single();
        setUser({
          // Synthetic-domain auth: show the username, never the fake email.
          email: emailToUsername(data.user.email) ?? data.user.email ?? null,
          fullName: profile?.full_name ?? 'Student',
          role: profile?.role ?? 'student',
          karma: profile?.karma ?? 0,
        });
      }
      setReady(true);
    }
    void load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => void load());
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
  }

  if (!ready) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-surface-sunken" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="inline-flex h-8 items-center gap-1.5 rounded px-3 text-[13px] font-medium text-ink-secondary transition-colors duration-instant hover:bg-surface-sunken hover:text-ink"
      >
        <UserRound className="h-4 w-4" aria-hidden />
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href="/my"
        className="flex items-center gap-2 rounded px-1.5 py-1 transition-colors duration-instant hover:bg-surface-sunken"
      >
        <Avatar name={user.fullName} />
        <span className="hidden text-[13px] font-medium sm:block">{user.fullName}</span>
        <span className="hidden rounded-sm bg-accent-subtle px-1.5 py-0.5 text-micro text-accent sm:block">
          {user.karma} karma
        </span>
      </Link>
      <button
        type="button"
        onClick={signOut}
        aria-label="Sign out"
        className="inline-flex h-8 w-8 items-center justify-center rounded text-ink-secondary transition-colors duration-instant hover:bg-surface-sunken hover:text-ink"
      >
        <LogOut className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
