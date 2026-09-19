import Link from 'next/link';
import { Heart, LogIn, ShieldAlert, Sparkles, User, UserPlus } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { RoomCard } from '@/components/spaces/room-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getLiveRooms } from '@/server/queries/rooms';
import { getMyFavoriteIds } from '@/server/actions/favorites';
import { timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Space & Profile' };

const STATUS_LABEL = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
} as const;

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-sunken text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
          <User className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-ink">
          My Space
        </h1>
        <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          Sign in to bookmark favorite spaces, monitor filed issue reports, and track community karma points.
        </p>
        <div className="mt-5 flex justify-center gap-2.5">
          <Link
            href="/auth/login"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-4 text-xs font-semibold text-ink transition-all hover:bg-surface-sunken active:scale-[0.98] dark:border-white/[0.08]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create Account</span>
          </Link>
        </div>
      </div>
    );
  }

  const [profileRes, favIds, rooms] = await Promise.all([
    supabase.from('profiles').select('full_name, karma, usn, role').eq('id', user.id).single(),
    getMyFavoriteIds(),
    getLiveRooms(),
  ]);

  const favorites = rooms.filter((r) => favIds.includes(r.room_id));

  const { data: myIssues } = await supabase
    .from('issues')
    .select('id, ref, title, status, created_at, rooms ( code, slug )')
    .eq('reported_by', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  type MyIssue = {
    id: string;
    ref: string;
    title: string;
    status: string;
    created_at: string;
    rooms: { code: string | null; slug: string | null } | null;
  };

  return (
    <div className="space-y-6">
      {/* Student Profile Card */}
      <div className="rounded-xl border border-line bg-surface p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <Avatar
              name={profileRes.data?.full_name ?? 'Student'}
              className="h-12 w-12 text-sm font-bold"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-ink">
                  {profileRes.data?.full_name ?? 'Student Profile'}
                </h1>
                <span className="rounded bg-surface-sunken px-1.5 py-0.2 font-mono text-[10px] uppercase text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
                  {profileRes.data?.role ?? 'student'}
                </span>
              </div>
              <p className="mt-0.5 font-mono text-xs text-zinc-400">
                USN: {profileRes.data?.usn ?? '23BTRCN042'} · Jain (Deemed-to-be University)
              </p>
            </div>
          </div>

          {/* Karma Metric */}
          <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-sunken px-3.5 py-2 dark:border-white/[0.08] dark:bg-[#141416]">
            <div>
              <p className="font-mono text-xl font-bold text-ink">
                {profileRes.data?.karma ?? 0}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                Karma Points
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarked Favorites */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-zinc-400" />
          <h2 className="text-sm font-bold text-ink">Saved Favorite Spaces ({favorites.length})</h2>
        </div>

        {favorites.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-6 text-center dark:border-white/[0.08]">
            <p className="text-xs text-zinc-400">
              No saved spaces yet. Open any room page and bookmark it for quick access.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((room) => (
              <li key={room.room_id}>
                <RoomCard room={room} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Reported Issues */}
      <section className="space-y-3 border-t border-line/60 pt-5 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-zinc-400" />
          <h2 className="text-sm font-bold text-ink">Your Filed Reports</h2>
        </div>

        {(myIssues as MyIssue[] | null)?.length ? (
          <div className="space-y-2">
            {(myIssues as MyIssue[]).map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-ink">
                    <span className="mr-1.5 font-mono text-[11px] font-normal text-zinc-400">
                      {i.ref}
                    </span>
                    {i.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    Room {i.rooms?.code ?? 'General'} · Filed {timeAgo(i.created_at)}
                  </p>
                </div>
                <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[10px] text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
                  {STATUS_LABEL[i.status as keyof typeof STATUS_LABEL] ?? i.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line p-6 text-center dark:border-white/[0.08]">
            <p className="text-xs text-zinc-400">
              You haven&apos;t filed any facility reports yet.{' '}
              <Link href="/report" className="font-semibold text-ink hover:underline dark:text-white">
                File a report
              </Link>{' '}
              to earn +25 karma.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
