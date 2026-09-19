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
  { href: '/case-study', label: 'Case Study', icon: BookOpen },
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
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-instant ease-spring',
          active
            ? 'bg-accent text-white shadow-sm shadow-accent/20 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]'
            : 'text-ink-secondary hover:bg-surface-sunken hover:text-ink dark:hover:bg-white/[0.04]',
          compact && 'justify-center px-0 py-3',
        )}
      >
        <Icon
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-fast ease-spring group-hover:scale-110',
            active ? 'text-white' : 'text-ink-tertiary group-hover:text-ink',
          )}
          aria-hidden
        />
        {!compact && <span className="tracking-[-0.01em]">{n.label}</span>}
      </Link>
    );
  };

  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {NAV.map(item)}
      <div className="my-3 border-t border-line/60 dark:border-white/[0.08]" role="presentation" />
      {SECONDARY.map(item)}
    </nav>
  );
}

export function Sidebar() {
  return (
    <>
      {/* Full sidebar ≥ lg */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line/80 bg-surface/90 px-3.5 py-5 backdrop-blur-xl lg:flex dark:border-white/[0.08] dark:bg-[#0c0c0e]/90">
        <Brand />
        <div className="mt-7 flex-1 overflow-y-auto pr-1">
          <NavItems />
        </div>
        <Link
          href="/case-study"
          className="group block rounded-xl border border-accent/20 bg-accent-subtle/50 p-3 transition-colors hover:bg-accent-subtle dark:bg-accent/10"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent dark:text-accent-hover">
              CA1 20/20 Package
            </span>
            <BookOpen className="h-3.5 w-3.5 text-accent" />
          </div>
          <p className="mt-0.5 text-micro font-medium text-ink-secondary">
            Design Thinking & Innovation
          </p>
        </Link>
      </aside>

      {/* Icon rail 640–1023px */}
      <aside className="sticky top-0 hidden h-dvh w-20 shrink-0 flex-col items-center border-r border-line/80 bg-surface/90 py-5 backdrop-blur-xl max-lg:max-md:flex md:flex lg:hidden dark:border-white/[0.08] dark:bg-[#0c0c0e]/90">
        <Link
          href="/"
          aria-label="JainSpace home"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-base font-bold text-white shadow-glow-accent transition-transform hover:scale-105 active:scale-95"
        >
          ◧
        </Link>
        <div className="mt-7">
          <NavItems compact />
        </div>
      </aside>

      {/* Below 640px: bottom bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-line/80 bg-surface/95 px-1 py-1 shadow-e3 backdrop-blur-xl md:hidden dark:border-white/[0.08] dark:bg-[#0c0c0e]/95"
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
        'flex min-w-[50px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-all duration-instant',
        active
          ? 'bg-accent text-white font-bold'
          : 'text-ink-secondary hover:text-ink',
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-3 px-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-indigo-500 text-base font-bold text-white shadow-glow-accent transition-all duration-fast ease-spring group-hover:scale-105 active:scale-95">
        ◧
      </span>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[16px] font-bold tracking-[-0.02em] text-ink">JainSpace</span>
          <span className="rounded-full bg-accent-subtle px-1.5 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider text-accent">
            Live
          </span>
        </div>
        <p className="text-[11px] font-medium text-ink-tertiary">Campus Reimagined</p>
      </div>
    </Link>
  );
}
