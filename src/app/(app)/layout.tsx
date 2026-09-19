import { ThemeToggle } from '@/components/app/theme-toggle';
import { Sidebar } from '@/components/app/sidebar';
import { UserChip } from '@/components/app/user-chip';
import { LiveRefresher } from '@/components/app/live-refresher';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Drives the realtime-vs-polling split in LiveRefresher.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* bg-surface (not /90): token vars are plain hex, opacity modifiers silently no-op */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Mobile brand (sidebar hidden below md) */}
            <span className="flex h-8 w-8 items-center justify-center rounded bg-accent text-sm font-semibold text-white md:hidden">
              ◧
            </span>
            <span className="hidden text-sm text-ink-tertiary md:block">
              {new Intl.DateTimeFormat('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
              }).format(new Date())}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserChip />
          </div>
        </header>

        {/* pb for the mobile bottom nav bar */}
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-24 pt-6 md:px-6 md:pb-10">
          {children}
        </main>
      </div>
      <LiveRefresher signedIn={!!user} />
    </div>
  );
}
