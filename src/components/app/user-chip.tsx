'use client';

import { ChevronDown, Flag, Heart, LogOut, Sparkles, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { emailToUsername } from '@/lib/username-auth';

export type SessionUser = {
  email: string | null;
  fullName: string;
  role: string;
  karma: number;
  usn?: string | null;
};

/**
 * User profile chip with auto-closing dropdown popover (Linear/Apple aesthetic).
 * Clicking outside immediately dismisses the popover.
 */
export function UserChip() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role, karma, usn')
          .eq('id', data.user.id)
          .single();
        setUser({
          email: emailToUsername(data.user.email) ?? data.user.email ?? null,
          fullName: profile?.full_name ?? 'Student',
          role: profile?.role ?? 'student',
          karma: profile?.karma ?? 0,
          usn: profile?.usn ?? null,
        });
      }
      setReady(true);
    }
    void load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => void load());
    return () => sub.subscription.unsubscribe();
  }, []);

  // Auto-close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  async function signOut() {
    await createClient().auth.signOut();
    setIsOpen(false);
    window.location.href = '/spaces';
  }

  if (!ready) {
    return <div className="h-9 w-9 animate-pulse rounded-xl bg-surface-sunken" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="inline-flex h-9 items-center gap-2 rounded-xl border border-line/80 bg-surface/80 px-3.5 text-[13px] font-semibold text-ink shadow-sm backdrop-blur-md transition-all duration-instant ease-spring hover:border-line-strong hover:bg-surface hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-surface/80"
      >
        <UserRound className="h-4 w-4 text-accent" aria-hidden />
        <span>Sign in</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
        className="flex items-center gap-2 rounded-xl border border-line/80 bg-surface/80 p-1 pr-2.5 text-left shadow-sm backdrop-blur-md transition-all duration-instant ease-spring hover:border-line-strong hover:bg-surface hover:scale-[1.02] active:scale-[0.98] dark:border-white/10 dark:bg-surface/80"
      >
        <Avatar name={user.fullName} className="h-7 w-7 text-[10px]" />
        <span className="hidden max-w-[120px] truncate text-[13px] font-semibold text-ink sm:inline-block">
          {user.fullName}
        </span>
        <span className="hidden rounded-md bg-accent-subtle px-1.5 py-0.5 font-mono text-[11px] font-bold text-accent sm:inline-block">
          {user.karma}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-ink-tertiary transition-transform duration-fast ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {/* Auto-closing Profile Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right animate-in fade-in zoom-in-95 duration-fast rounded-2xl border border-line/90 bg-surface/95 p-4 shadow-e3 backdrop-blur-xl dark:border-white/10 dark:bg-[#121215]/95 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
          {/* User Details Header */}
          <div className="flex items-start gap-3 border-b border-line/60 pb-3.5 dark:border-white/[0.08]">
            <Avatar name={user.fullName} className="h-10 w-10 text-sm font-bold shadow-sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-ink">{user.fullName}</p>
              <p className="font-mono text-[12px] text-ink-tertiary">
                {user.usn ? `${user.usn}` : user.email ?? 'Student'}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <Badge variant="accent" className="text-[10px] uppercase">
                  {user.role}
                </Badge>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-2.5 w-2.5" />
                  {user.karma} pts
                </span>
              </div>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="mt-2 space-y-1">
            <Link
              href="/my"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink dark:hover:bg-white/[0.06]"
            >
              <Heart className="h-4 w-4 text-rose-500" />
              <span>My Saved Spaces</span>
            </Link>
            <Link
              href="/report"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink dark:hover:bg-white/[0.06]"
            >
              <Flag className="h-4 w-4 text-amber-500" />
              <span>File Room Issue</span>
            </Link>
          </div>

          {/* Logout Action Button */}
          <div className="mt-3 border-t border-line/60 pt-2 dark:border-white/[0.08]">
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-status-busy-bg px-3 py-2 text-[13px] font-semibold text-status-busy transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
