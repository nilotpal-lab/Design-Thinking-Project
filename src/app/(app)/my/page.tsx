import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { RoomCard } from '@/components/spaces/room-card';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { getLiveRooms } from '@/server/queries/rooms';
import { getMyFavoriteIds } from '@/server/actions/favorites';
import { timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS_LABEL = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  assigned: 'Assigned',
  in_progress: 'In progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
} as const;

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="text-[22px] font-semibold tracking-[-0.01em]">Your space, saved</h1>
        <p className="mt-2 text-[14px] leading-6 text-ink-secondary">
          Favourites, your reports and karma live here. Browsing is always open — an account is
          only needed to keep things.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/auth/login" className="inline-flex h-10 items-center rounded bg-accent px-5 text-sm font-medium text-white hover:bg-accent-hover">
            Sign in
          </Link>
          <Link href="/auth/signup" className="inline-flex h-10 items-center rounded border border-line bg-surface px-5 text-sm font-medium hover:bg-surface-sunken">
            Create account
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
    id: string; ref: string; title: string; status: string; created_at: string;
    rooms: { code: string | null; slug: string | null } | null;
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.01em]">
            {profileRes.data?.full_name ?? 'Student'}
          </h1>
          <p className="mt-0.5 text-[13px] text-ink-secondary">
            {profileRes.data?.usn ? `${profileRes.data.usn} · ` : ''}
            {profileRes.data?.role ?? 'student'}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface px-5 py-3 text-center shadow-e1">
          <p className="font-mono-tabular text-[22px] font-semibold text-accent">
            {profileRes.data?.karma ?? 0}
          </p>
          <p className="text-micro text-ink-tertiary">karma</p>
        </div>
      </header>

      <section>
        <h2 className="text-[15px] font-semibold">Favourites</h2>
        {favorites.length === 0 ? (
          <p className="mt-2 rounded-lg border border-dashed border-line bg-surface p-8 text-center text-[13px] text-ink-secondary">
            No favourites yet — open any room and save it for quick access.
          </p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((room) => (
              <li key={room.room_id}>
                <RoomCard room={room} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-[15px] font-semibold">Your reports</h2>
        {(myIssues as MyIssue[] | null)?.length ? (
          <ul className="mt-3 space-y-2">
            {(myIssues as MyIssue[]).map((i) => (
              <li key={i.id}>
                <Card className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium">
                      <span className="font-mono text-[12px] text-ink-tertiary">{i.ref}</span>{' '}
                      {i.title}
                    </p>
                    <p className="text-[13px] text-ink-secondary">
                      {i.rooms?.code ?? 'room'} · {timeAgo(i.created_at)}
                    </p>
                  </div>
                  <Badge variant={i.status === 'resolved' ? 'free' : 'soon'}>
                    {STATUS_LABEL[i.status as keyof typeof STATUS_LABEL] ?? i.status}
                  </Badge>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 rounded-lg border border-dashed border-line bg-surface p-8 text-center text-[13px] text-ink-secondary">
            No reports yet. See a broken socket?{' '}
            <Link href="/report" className="text-accent hover:underline">
              File it
            </Link>{' '}
            — it earns karma when the community confirms it.
          </p>
        )}
      </section>
    </div>
  );
}
