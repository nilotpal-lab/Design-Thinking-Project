'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { usernameSchema, usernameToEmail } from '@/lib/username-auth';

export default function SignupPage() {
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

    const { error } = await createClient().auth.signUp({
      email: usernameToEmail(username),
      password: String(fd.get('password') ?? ''),
      options: {
        // The handle_new_user trigger turns these into a profile row.
        data: {
          full_name: String(fd.get('full_name') ?? ''),
          usn: String(fd.get('usn') ?? ''),
        },
      },
    });

    if (error) {
      setError(
        error.message.includes('already registered')
          ? 'That username is taken — try another.'
          : error.message,
      );
      setLoading(false);
      return;
    }

    // Email confirmation is disabled for the synthetic domain; sign straight in.
    router.push('/spaces');
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-6 shadow-e1">
      <h1 className="text-[17px] font-semibold">Create your account</h1>
      <p className="mt-1 text-[13px] text-ink-secondary">
        No email needed — just a username and password.
      </p>

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
          <span className="mt-1 block text-micro text-ink-tertiary">
            3–24 characters: letters, numbers, dot, dash, underscore
          </span>
        </label>
        <label className="block">
          <span className="text-[13px] font-medium">Full name</span>
          <input
            name="full_name"
            required
            autoComplete="name"
            className="mt-1 h-10 w-full rounded border border-line-strong bg-canvas px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium">
            USN <span className="font-normal text-ink-tertiary">(optional)</span>
          </span>
          <input
            name="usn"
            placeholder="e.g. 23103001"
            className="mt-1 h-10 w-full rounded border border-line-strong bg-canvas px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium">Password</span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1 h-10 w-full rounded border border-line-strong bg-canvas px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <span className="mt-1 block text-micro text-ink-tertiary">At least 8 characters</span>
        </label>

        {error && (
          <p role="alert" className="rounded-sm bg-status-busy-bg px-3 py-2 text-[13px] text-status-busy">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-4 text-center text-[13px] text-ink-secondary">
        Already have one?{' '}
        <Link href="/auth/login" className="font-medium text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
