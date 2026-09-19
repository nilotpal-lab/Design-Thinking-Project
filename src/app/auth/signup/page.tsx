'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BadgeCheck, IdCard, Lock, User, UserPlus } from 'lucide-react';

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

    router.push('/spaces');
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-6 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]">
      <div className="text-center">
        <h1 className="text-lg font-bold tracking-tight text-ink">Create Account</h1>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Instant access — no email verification needed
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-3.5">
        <div>
          <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Username
          </label>
          <div className="relative mt-1">
            <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              name="username"
              required
              autoComplete="username"
              placeholder="e.g. nilotpal"
              className="h-9 w-full rounded-lg border border-line bg-surface px-3 pl-8 text-xs font-medium outline-none transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/[0.08] dark:bg-[#141416] dark:text-zinc-200"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Full Name
          </label>
          <div className="relative mt-1">
            <BadgeCheck className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              name="full_name"
              required
              autoComplete="name"
              placeholder="e.g. Nilotpal Deb"
              className="h-9 w-full rounded-lg border border-line bg-surface px-3 pl-8 text-xs font-medium outline-none transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/[0.08] dark:bg-[#141416] dark:text-zinc-200"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            USN / Student ID <span className="font-normal text-zinc-400">(Optional)</span>
          </label>
          <div className="relative mt-1">
            <IdCard className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              name="usn"
              placeholder="e.g. 23BTRCN042"
              className="h-9 w-full rounded-lg border border-line bg-surface px-3 pl-8 text-xs font-medium outline-none transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/[0.08] dark:bg-[#141416] dark:text-zinc-200"
            />
          </div>
        </div>

        <div>
          <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Password
          </label>
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              className="h-9 w-full rounded-lg border border-line bg-surface px-3 pl-8 text-xs font-medium outline-none transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/[0.08] dark:bg-[#141416] dark:text-zinc-200"
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400"
          >
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full text-xs font-semibold">
          Create Account
        </Button>
      </form>

      <div className="mt-4 border-t border-line/60 pt-3 text-center dark:border-white/[0.06]">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-ink hover:underline dark:text-white">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
