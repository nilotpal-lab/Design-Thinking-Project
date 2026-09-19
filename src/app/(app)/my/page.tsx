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
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-subtle text-accent dark:bg-accent/15">
          <User className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-ink md:text-3xl">
          Your Campus Space, Saved
        </h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
          Bookmark your favourite study corners, monitor your reported issues, and track your
          community karma points.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/auth/login"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-bold text-white shadow-glow-accent transition-all hover:bg-accent-hover active:scale-95"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-line/80 bg-surface px-6 text-sm font-bold text-ink shadow-sm transition-all hover:bg-surface-sunken active:scale-95 dark:border-white/10"
          >
            <UserPlus className="h-4 w-4" />
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
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Student Profile Bento Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-line/80 bg-surface/80 p-6 shadow-e2 backdrop-blur-xl md:p-8 dark:border-white/10 dark:bg-[#121215]">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Avatar
              name={profileRes.data?.full_name ?? 'Student'}
              className="h-16 w-16 text-xl font-extrabold shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight text-ink">
                  {profileRes.data?.full_name ?? 'Student Profile'}
                </h1>
                <Badge variant="accent" className="text-[10px] uppercase">
                  {profileRes.data?.role ?? 'student'}
                </Badge>
              </div>
              <p className="mt-0.5 font-mono text-xs font-semibold text-ink-tertiary">
                USN: {profileRes.data?.usn ?? '23BTRCN042'} · Jain (Deemed-to-be University)
              </p>
            </div>
          </div>

          {/* Karma Metric Pill */}
          <div className="flex items-center gap-3 rounded-2xl border border-accent/20 bg-accent-subtle/60 p-4 dark:bg-accent/10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-glow-accent">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-mono text-2xl font-black text-accent dark:text-accent-hover">
                {profileRes.data?.karma ?? 0}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-secondary">
                Karma Points
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmarked Favorites */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" />
          <h2 className="text-lg font-bold text-ink">Saved Favorite Spaces ({favorites.length})</h2>
        </div>

        {favorites.length === 0 ? (
          <Card className="rounded-2xl border-dashed p-8 text-center">
            <p className="text-[14px] font-semibold text-ink-secondary">
              No saved spaces yet. Open any room card and bookmark it for one-click access.
            </p>
          </Card>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((room) => (
              <li key={room.room_id}>
                <RoomCard room={room} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Reported Issues */}
      <section className="space-y-4 border-t border-line/60 pt-6 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-ink">Your Filed Reports</h2>
        </div>

        {(myIssues as MyIssue[] | null)?.length ? (
          <div className="space-y-3">
            {(myIssues as MyIssue[]).map((i) => (
              <Card
                key={i.id}
                className="flex items-center justify-between gap-4 rounded-2xl p-4 shadow-e1 dark:border-white/10"
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-ink">
                    <span className="mr-1.5 font-mono text-[12px] font-semibold text-ink-tertiary">
                      {i.ref}
                    </span>
                    {i.title}
                  </p>
                  <p className="mt-0.5 text-[12px] font-medium text-ink-secondary">
                    Room {i.rooms?.code ?? 'General'} · Filed {timeAgo(i.created_at)}
                  </p>
                </div>
                <Badge variant={i.status === 'resolved' ? 'free' : 'soon'}>
                  {STATUS_LABEL[i.status as keyof typeof STATUS_LABEL] ?? i.status}
                </Badge>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-dashed p-8 text-center">
            <p className="text-[14px] font-semibold text-ink-secondary">
              You haven&apos;t filed any facility reports yet. See something broken on campus?{' '}
              <Link href="/report" className="text-accent font-bold hover:underline dark:text-accent-hover">
                Report it here
              </Link>{' '}
              to earn +15 karma when confirmed.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
