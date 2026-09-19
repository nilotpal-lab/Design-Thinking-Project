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

  const formattedDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  return (
    <div className="flex min-h-dvh bg-canvas antialiased ambient-glow">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Glassmorphic Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line/80 bg-surface/80 px-4 backdrop-blur-xl md:px-8 dark:border-white/[0.08] dark:bg-[#09090b]/80">
          <div className="flex items-center gap-3">
            {/* Mobile brand (sidebar hidden below md) */}
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white shadow-glow-accent md:hidden">
              ◧
            </span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="hidden text-[13px] font-medium text-ink-secondary md:inline-block">
                Live Timetable
              </span>
              <span className="hidden text-ink-tertiary md:inline-block">·</span>
              <span className="font-mono text-[13px] font-medium text-ink-secondary">
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <UserChip />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-28 pt-8 md:px-8 md:pb-12">
          {children}
        </main>
      </div>
      <LiveRefresher signedIn={!!user} />
    </div>
  );
}
