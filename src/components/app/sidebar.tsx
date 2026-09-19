'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  CalendarClock,
  Flag,
  Map,
  ShieldCheck,
  Sparkles,
  User,
  UserRound,
  Waypoints,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const NAV = [
  { href: '/spaces', label: 'Spaces', icon: Waypoints },
  { href: '/map', label: 'Floor Map', icon: Map },
  { href: '/match', label: 'AI Matcher', icon: Sparkles },
  { href: '/case-study', label: 'Case Study (20/20)', icon: BookOpen },
  { href: '/faculty', label: 'Faculty', icon: User },
  { href: '/events', label: 'Events', icon: CalendarClock },
  { href: '/report', label: 'Reports', icon: Flag },
  { href: '/my', label: 'My Space', icon: UserRound },
];

const SECONDARY = [{ href: '/admin', label: 'Admin Panel', icon: ShieldCheck }];

function NavItems({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  const item = (n: (typeof NAV)[number]) => {
    const active = pathname === n.href || (n.href !== '/' && pathname.startsWith(n.href + '/'));
    const Icon = n.icon;
    return (
      <Link
        key={n.href}
        href={n.href}
        aria-current={active ? 'page' : undefined}
        aria-label={compact ? n.label : undefined}
        className={cn(
          'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-instant',
          active
            ? 'bg-zinc-150 text-zinc-900 font-semibold dark:bg-white/[0.08] dark:text-white dark:border dark:border-white/[0.08]'
            : 'text-zinc-500 hover:bg-surface-sunken hover:text-ink dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-200',
          compact && 'justify-center px-0 py-2.5',
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4 shrink-0 transition-colors',
            active ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300',
          )}
          aria-hidden
        />
        {!compact && <span>{n.label}</span>}
      </Link>
    );
  };

  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {NAV.map(item)}
      <div className="my-2.5 border-t border-line/60 dark:border-white/[0.06]" role="presentation" />
      {SECONDARY.map(item)}
    </nav>
  );
}

export function Sidebar() {
  return (
    <>
      {/* Full sidebar ≥ lg */}
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-line bg-surface px-3 py-4 lg:flex dark:border-white/[0.08] dark:bg-[#0c0c0d]">
        <Brand />
        <div className="mt-6 flex-1 overflow-y-auto">
          <NavItems />
        </div>
        <div className="rounded-lg border border-line/70 bg-surface-sunken/50 p-2.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Design Thinking CA1
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            Jain University · 3rd Sem
          </p>
        </div>
      </aside>

      {/* Icon rail 640–1023px */}
      <aside className="sticky top-0 hidden h-dvh w-14 shrink-0 flex-col items-center border-r border-line bg-surface py-4 max-lg:max-md:flex md:flex lg:hidden dark:border-white/[0.08] dark:bg-[#0c0c0d]">
        <Link
          href="/"
          aria-label="JainSpace home"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900"
        >
          ◧
        </Link>
        <div className="mt-6">
          <NavItems compact />
        </div>
      </aside>

      {/* Below 640px: bottom bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-line bg-surface/95 px-1 py-1 shadow-sm backdrop-blur-xl md:hidden dark:border-white/[0.08] dark:bg-[#0c0c0d]/95"
      >
        {NAV.slice(0, 5).map((n) => (
          <BottomItem key={n.href} {...n} />
        ))}
      </nav>
    </>
  );
}

function BottomItem({ href, label, icon: Icon }: (typeof NAV)[number]) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-w-[52px] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors',
        active
          ? 'text-zinc-900 font-bold dark:text-white'
          : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200',
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 px-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white transition-transform duration-fast group-hover:scale-105 dark:bg-white dark:text-zinc-900">
        ◧
      </span>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-bold tracking-tight text-ink">JainSpace</span>
          <span className="rounded bg-zinc-200/80 px-1 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-700 dark:bg-white/10 dark:text-zinc-300">
            Live
          </span>
        </div>
        <p className="text-[10px] text-zinc-400">Campus Reimagined</p>
      </div>
    </Link>
  );
}
