'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
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
    <div className="rounded-lg border border-line bg-surface p-6 shadow-e1">
      <h1 className="text-[17px] font-semibold">Sign in</h1>
      <p className="mt-1 text-[13px] text-ink-secondary">Welcome back.</p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <label className="block">
          <span className="text-[13px] font-medium">Username</span>
          <input
            name="username"
            required
            autoComplete="username"
            placeholder="e.g. nilotpal"
            className="mt-1 h-10 w-full rounded border border-line-strong bg-canvas px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-1 h-10 w-full rounded border border-line-strong bg-canvas px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>

        {error && (
          <p role="alert" className="rounded-sm bg-status-busy-bg px-3 py-2 text-[13px] text-status-busy">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-4 text-center text-[13px] text-ink-secondary">
        New here?{' '}
        <Link href="/auth/signup" className="font-medium text-accent hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
