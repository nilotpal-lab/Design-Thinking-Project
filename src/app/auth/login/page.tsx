'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { KeyRound, Lock, LogIn, Sparkles, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { usernameSchema, usernameToEmail } from '@/lib/username-auth';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const username = String(fd.get('username') ?? '').trim().toLowerCase();
    if (!usernameSchema.test(username)) {
      setError('Usernames are 3–24 chars: letters, numbers, dot, dash, underscore.');
      setLoading(false);
      return;
    }

    const { error } = await createClient().auth.signInWithPassword({
      email: usernameToEmail(username),
      password: String(fd.get('password') ?? ''),
    });

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Wrong username or password.'
          : error.message,
      );
      setLoading(false);
      return;
    }

    // Full refresh so server components re-render with the new session cookie.
    router.push('/spaces');
    router.refresh();
  }

  return (
    <Card className="rounded-3xl border border-line/80 bg-surface/90 p-8 shadow-e3 backdrop-blur-xl dark:border-white/10 dark:bg-[#121215]">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-subtle text-accent shadow-sm dark:bg-accent/15">
          <LogIn className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-ink">Welcome Back</h1>
        <p className="mt-1 text-[13px] font-medium text-ink-secondary">
          Sign in to your student account
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary">
            Username / USN
          </label>
          <div className="relative mt-1.5">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              name="username"
              required
              autoComplete="username"
              placeholder="e.g. nilotpal"
              className="h-11 w-full rounded-xl border border-line/80 bg-surface px-3.5 pl-10 text-sm font-medium outline-none transition-all duration-instant focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:bg-surface/80"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-tertiary">
            Password
          </label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-tertiary" />
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-line/80 bg-surface px-3.5 pl-10 text-sm font-medium outline-none transition-all duration-instant focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent dark:border-white/10 dark:bg-surface/80"
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2.5 text-[13px] font-semibold text-rose-600 dark:text-rose-400"
          >
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="h-11 w-full text-sm font-bold shadow-glow-accent">
          Sign In
        </Button>
      </form>

      <div className="mt-6 border-t border-line/60 pt-4 text-center dark:border-white/[0.06]">
        <p className="text-[13px] font-medium text-ink-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="font-bold text-accent hover:underline dark:text-accent-hover">
            Create an Account
          </Link>
        </p>
      </div>
    </Card>
  );
}
