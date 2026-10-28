import { SharedHeader } from '@/components/app/shared-header';
import { LiveRefresher } from '@/components/app/live-refresher';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const res = await supabase.auth.getUser();
      user = res.data.user;
    } catch {
      user = null;
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-canvas antialiased text-ink">
      <SharedHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <LiveRefresher signedIn={!!user} />
    </div>
  );
}
