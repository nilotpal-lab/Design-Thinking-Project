import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

import { CabinEditor, type AdminFaculty, type AdminRoomOption } from '@/components/admin/cabin-editor';
import { EventManager, type AdminEvent } from '@/components/admin/event-manager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createAdminClient } from '@/lib/supabase/admin';
import { emailToUsername } from '@/lib/username-auth';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin' };

export default async function AdminPage() {
  // Server-side gate: a non-admin never receives admin data at all.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/admin');

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Signed in as <b>{emailToUsername(user.email) ?? user.email}</b> — this account
          isn&apos;t a head-admin. Roles are set by an existing admin in SQL:
        </p>
        <code className="mt-3 inline-block rounded bg-surface-sunken px-2 py-1 text-xs">
          update profiles set role=&apos;admin&apos; where email=&apos;…@jainspace.local&apos;;
        </code>
      </div>
    );
  }

  const [facultyRes, roomsRes, eventsRes] = await Promise.all([
    admin.from('faculty').select('id, full_name, department, cabin_room_id, cabin_note').order('full_name'),
    admin
      .from('rooms')
      .select('id, code, name, floors (level), blocks (name)')
      .order('code'),
    admin.from('events').select('id, title, category, starts_at, is_cancelled').order('starts_at', { ascending: false }).limit(50),
  ]);

  const faculty: AdminFaculty[] = (facultyRes.data ?? []).map((f) => ({
    id: f.id,
    name: f.full_name,
    department: f.department,
    cabinRoomId: f.cabin_room_id,
    cabinNote: f.cabin_note,
  }));

  const roomOptions: AdminRoomOption[] = (roomsRes.data ?? []).map((r) => {
    const b = r.blocks as { name?: string } | null;
    const fl = r.floors as { level?: number } | null;
    return { id: r.id, label: `${r.code} · ${b?.name ?? '?'} L${fl?.level ?? '?'}` };
  });

  const events: AdminEvent[] = (eventsRes.data ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    startsAt: e.starts_at,
    isCancelled: e.is_cancelled,
  }));

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Admin console</h1>
        <p className="text-sm text-ink-secondary">
          Head-admin tools: faculty cabins, CSV import, campus events.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Faculty cabins</CardTitle>
        </CardHeader>
        <CardContent>
          <CabinEditor faculty={faculty} rooms={roomOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campus events</CardTitle>
        </CardHeader>
        <CardContent>
          <EventManager events={events} rooms={roomOptions} />
        </CardContent>
      </Card>
    </div>
  );
}
