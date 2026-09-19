import { ThemeToggle } from '@/components/app/theme-toggle';
import { Sidebar } from '@/components/app/sidebar';
import { UserChip } from '@/components/app/user-chip';
import { CommandPalette } from '@/components/app/command-palette';
import { LiveRefresher } from '@/components/app/live-refresher';
import { createClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
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
    <div className="flex min-h-dvh bg-canvas antialiased text-ink">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Minimalist Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur-xl md:px-6 dark:border-white/[0.08] dark:bg-[#0c0c0d]/90">
          <div className="flex items-center gap-3">
            {/* Mobile brand */}
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white md:hidden dark:bg-white dark:text-zinc-900">
              ◧
            </span>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="hidden sm:inline-block">Live Timetable</span>
              <span className="hidden sm:inline-block text-zinc-300 dark:text-zinc-700">·</span>
              <span className="font-mono text-[11px]">{formattedDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CommandPalette />
            <ThemeToggle />
            <UserChip />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 pb-20 pt-6 md:px-6 md:pb-10">
          {children}
        </main>
      </div>
      <LiveRefresher signedIn={!!user} />
    </div>
  );
}
