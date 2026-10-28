'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Search,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
  ShoppingBag,
  HelpCircle,
  DoorOpen,
  LogIn,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { UserChip } from '@/components/app/user-chip';
import { CommandPalette } from '@/components/app/command-palette';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: DoorOpen },
  { href: '/spaces', label: 'Spaces', icon: DoorOpen },
  { href: '/map', label: 'Floor Map', icon: MapPin },
  { href: '/events', label: 'Calendar', icon: Calendar },
  { href: '/faculty', label: 'Faculty', icon: Users },
  { href: '/report', label: 'Issues', icon: AlertCircle },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  { href: '/lost-found', label: 'Lost & Found', icon: HelpCircle },
];

export function SharedHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-surface/95 backdrop-blur-md transition-colors duration-fast dark:border-white/[0.08] dark:bg-[#121211]/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Identity */}
        <div className="flex items-center">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1B4332] text-white shadow-sm transition-transform duration-fast group-hover:scale-105 dark:bg-[#2D6A4F]">
              <span className="font-mono text-xs font-bold tracking-wider">CP</span>
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="heading-editorial text-lg tracking-editorial text-ink font-bold">
                  CAMPUS
                </span>
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              </div>
              <span className="hidden text-[9px] font-mono uppercase tracking-wider text-ink-tertiary sm:inline-block">
                Jain University
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Centered Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center justify-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-fast select-none',
                  active
                    ? 'bg-[#E8EFEA] text-[#1B4332] font-bold dark:bg-[#2D6A4F]/25 dark:text-[#74C69D]'
                    : 'text-ink-secondary hover:bg-surface-sunken hover:text-ink dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-200',
                )}
              >
                <span>{link.label}</span>
                {active && (
                  <span className="absolute inset-x-2 -bottom-[15px] h-[2px] bg-[#1B4332] rounded-full dark:bg-[#52B788]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Search Icon, Sign In & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger Icon / Command Palette */}
          <CommandPalette />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Sign In / Profile */}
          <UserChip />

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-surface text-ink lg:hidden hover:bg-surface-sunken dark:border-white/[0.08] dark:bg-[#1A1918]"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="border-b border-line bg-surface px-4 py-4 lg:hidden dark:border-white/[0.08] dark:bg-[#121211]">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors',
                    active
                      ? 'bg-[#E8EFEA] text-[#1B4332] font-semibold dark:bg-[#2D6A4F]/25 dark:text-[#74C69D]'
                      : 'text-ink-secondary hover:bg-surface-sunken hover:text-ink dark:text-zinc-400',
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
