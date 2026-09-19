'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarClock, Flag, Map, ShieldCheck, Sparkles, User, UserRound, Waypoints } from 'lucide-react';

import { cn } from '@/lib/utils';

const NAV = [
  { href: '/spaces', label: 'Spaces', icon: Waypoints },
  { href: '/map', label: 'Floor Map', icon: Map },
  { href: '/match', label: 'Match', icon: Sparkles },
  { href: '/faculty', label: 'Faculty', icon: User },
  { href: '/events', label: 'Events', icon: CalendarClock },
  { href: '/report', label: 'Reports', icon: Flag },
  { href: '/my', label: 'My Space', icon: UserRound },
];

const SECONDARY = [{ href: '/admin', label: 'Admin', icon: ShieldCheck }];

function NavItems({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();

  const item = (n: (typeof NAV)[number]) => {
    const active = pathname === n.href || pathname.startsWith(n.href + '/');
    const Icon = n.icon;
    return (
      <Link
        key={n.href}
        href={n.href}
        aria-current={active ? 'page' : undefined}
        aria-label={compact ? n.label : undefined}
        className={cn(
          'flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors duration-instant',
          active
            ? 'bg-accent-subtle font-medium text-accent'
            : 'text-ink-secondary hover:bg-surface-sunken hover:text-ink',
          compact && 'justify-center px-0',
        )}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        {!compact && <span>{n.label}</span>}
      </Link>
    );
  };

  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {NAV.map(item)}
      <div className="my-3 border-t border-line" role="presentation" />
      {SECONDARY.map(item)}
    </nav>
  );
}

export function Sidebar() {
  return (
    <>
      {/* Full sidebar ≥ lg */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface px-3 py-4 lg:flex">
        <Brand />
        <div className="mt-6 flex-1 overflow-y-auto">
          <NavItems />
        </div>
        <p className="px-3 text-micro text-ink-tertiary">
          Design Thinking & Innovation · 3rd Sem
        </p>
      </aside>

      {/* Icon rail 640–1023px */}
      <aside className="sticky top-0 hidden h-dvh w-16 shrink-0 flex-col items-center border-r border-line bg-surface py-4 max-lg:max-md:flex md:flex lg:hidden">
        <Link href="/" aria-label="JainSpace home" className="flex h-8 w-8 items-center justify-center rounded bg-accent text-sm font-semibold text-white">
          ◧
        </Link>
        <div className="mt-6">
          <NavItems compact />
        </div>
      </aside>
      {/* Below 640px: bottom bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-line bg-surface md:hidden"
      >
        {NAV.map((n) => (
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
        'flex min-w-[64px] flex-col items-center gap-1 px-2 py-2.5 text-micro',
        active ? 'text-accent' : 'text-ink-secondary',
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
      {label}
    </Link>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-3">
      <span className="flex h-8 w-8 items-center justify-center rounded bg-accent text-sm font-semibold text-white">
        ◧
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.01em]">JainSpace</span>
    </Link>
  );
}
