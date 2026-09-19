'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BookOpen, Command, Compass, DoorOpen, Flame, Layers, MapPin, Search, Sparkles, User, X } from 'lucide-react';

import { StatusPill } from '@/components/spaces/status-pill';
import { cn } from '@/lib/utils';

export type SearchItem = {
  id: string;
  title: string;
  subtitle: string;
  category: 'space' | 'faculty' | 'feature' | 'navigation';
  href: string;
  badge?: string;
  status?: 'free' | 'soon' | 'busy' | 'unknown';
};

const DEFAULT_ITEMS: SearchItem[] = [
  {
    id: 'nav-spaces',
    title: 'Explore All Spaces',
    subtitle: 'Browse 52 classrooms, labs & seminar halls across campus',
    category: 'navigation',
    href: '/spaces',
    badge: 'Directory',
  },
  {
    id: 'nav-map',
    title: 'Architectural Floor Map',
    subtitle: 'Interactive 4-floor blueprint schematic with live room occupancy',
    category: 'navigation',
    href: '/map',
    badge: 'Blueprint',
  },
  {
    id: 'nav-match',
    title: 'AI Space Matcher',
    subtitle: 'Instant space matching for group size, duration & power sockets',
    category: 'navigation',
    href: '/match',
    badge: 'AI Engine',
  },
  {
    id: 'nav-faculty',
    title: 'Faculty Presence Tracker',
    subtitle: 'Locate professors lecturing right now & find office cabins',
    category: 'navigation',
    href: '/faculty',
    badge: 'Directory',
  },
  {
    id: 'nav-events',
    title: 'Campus Events & Workshops',
    subtitle: 'Fests, hackathons, seminars & student club schedules',
    category: 'navigation',
    href: '/events',
    badge: 'Schedule',
  },
  {
    id: 'nav-report',
    title: 'Campus Facility Reports',
    subtitle: 'Report broken sockets or AC issues & earn community karma',
    category: 'navigation',
    href: '/report',
    badge: 'Crowdsource',
  },
  {
    id: 'space-1',
    title: 'Seminar Hall 1 (SH-01)',
    subtitle: 'Floor 1 · 120 seats · AC · Projector & Smart Board',
    category: 'space',
    href: '/spaces/sh-01',
    status: 'free',
  },
  {
    id: 'space-2',
    title: 'Computer Lab 2 (CL-02)',
    subtitle: 'Floor 2 · 60 seats · 48 Working Sockets · Wi-Fi 6E',
    category: 'space',
    href: '/spaces/cl-02',
    status: 'free',
  },
  {
    id: 'space-3',
    title: 'Classroom 101 (CR-101)',
    subtitle: 'Floor 1 · 70 seats · AC · Whiteboard',
    category: 'space',
    href: '/spaces/cr-101',
    status: 'soon',
  },
  {
    id: 'space-4',
    title: 'Innovation Hub (IH-01)',
    subtitle: 'Floor 3 · 45 seats · Group Collaboration · Power Sockets',
    category: 'space',
    href: '/spaces/ih-01',
    status: 'free',
  },
  {
    id: 'faculty-1',
    title: 'Dr. Anand Kumar',
    subtitle: 'Computer Science & Engineering · Office Cabin: CB-304',
    category: 'faculty',
    href: '/faculty?q=anand',
    badge: 'Professor',
  },
  {
    id: 'faculty-2',
    title: 'Prof. Priya Sharma',
    subtitle: 'Artificial Intelligence & ML · Office Cabin: CB-212',
    category: 'faculty',
    href: '/faculty?q=priya',
    badge: 'Assoc. Prof',
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Keyboard shortcut listener (Cmd + K or Ctrl + K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filtered = query.trim()
    ? DEFAULT_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()),
      )
    : DEFAULT_ITEMS;

  function selectItem(item: SearchItem) {
    setOpen(false);
    setQuery('');
    router.push(item.href);
  }

  // Keyboard navigation within list
  useEffect(() => {
    function handleNavigation(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          selectItem(filtered[selectedIndex]);
        }
      }
    }

    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [open, filtered, selectedIndex]);

  return (
    <>
      {/* Quick Search Trigger Pill for Header */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-3 rounded-xl border border-line/80 bg-surface/80 px-3.5 py-1.5 text-xs font-medium text-ink-secondary shadow-sm backdrop-blur-md transition-all duration-instant ease-spring hover:border-line-strong hover:bg-surface hover:text-ink md:flex dark:border-white/10 dark:bg-surface/80"
      >
        <Search className="h-3.5 w-3.5 text-ink-tertiary" />
        <span>Quick search spaces, faculty, map...</span>
        <kbd className="rounded-md border border-line bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] font-bold text-ink-tertiary dark:border-white/10 dark:bg-white/[0.04]">
          ⌘K
        </kbd>
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16 backdrop-blur-md animate-in fade-in duration-fast sm:pt-24">
          {/* Backdrop dismiss */}
          <div className="fixed inset-0" onClick={() => setOpen(false)} aria-hidden />

          {/* Dialog Container */}
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-line/80 bg-surface/95 shadow-e3 backdrop-blur-2xl animate-in zoom-in-95 duration-fast dark:border-white/15 dark:bg-[#121216]/95 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
            {/* Input Bar */}
            <div className="relative flex items-center border-b border-line/70 px-4 py-3.5 dark:border-white/[0.08]">
              <Search className="h-5 w-5 text-accent" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search by room code, lab name, professor, or feature..."
                className="w-full bg-transparent px-3.5 text-base font-semibold text-ink placeholder:text-ink-tertiary outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="rounded-lg p-1 text-ink-tertiary hover:bg-surface-sunken hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <kbd className="hidden rounded-md border border-line bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-bold text-ink-tertiary sm:inline-block dark:border-white/10 dark:bg-white/[0.04]">
                  ESC
                </kbd>
              )}
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-semibold text-ink">No results found for &ldquo;{query}&rdquo;</p>
                  <p className="mt-1 text-xs text-ink-tertiary">
                    Try searching for &quot;Seminar Hall&quot;, &quot;Floor 2&quot;, &quot;Sockets&quot; or &quot;Faculty&quot;.
                  </p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {filtered.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => selectItem(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={cn(
                            'flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-instant',
                            isSelected
                              ? 'bg-accent text-white shadow-sm'
                              : 'hover:bg-surface-sunken text-ink dark:hover:bg-white/[0.05]',
                          )}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div
                              className={cn(
                                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold',
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-surface-sunken text-ink-secondary dark:bg-white/[0.04]',
                              )}
                            >
                              {item.category === 'space' && <DoorOpen className="h-4 w-4" />}
                              {item.category === 'faculty' && <User className="h-4 w-4" />}
                              {item.category === 'navigation' && <Compass className="h-4 w-4" />}
                              {item.category === 'feature' && <Sparkles className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[14px] font-bold tracking-tight">
                                {item.title}
                              </p>
                              <p
                                className={cn(
                                  'truncate text-[12px]',
                                  isSelected ? 'text-white/80' : 'text-ink-secondary',
                                )}
                              >
                                {item.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {item.status && (
                              <StatusPill
                                status={item.status}
                                className={isSelected ? 'bg-white/20 text-white' : ''}
                              />
                            )}
                            {item.badge && (
                              <span
                                className={cn(
                                  'rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
                                  isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-surface-sunken text-ink-tertiary dark:bg-white/[0.04]',
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                            <ArrowRight
                              className={cn(
                                'h-4 w-4 transition-transform',
                                isSelected ? 'translate-x-0.5 text-white' : 'text-ink-tertiary',
                              )}
                            />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer info */}
            <div className="flex items-center justify-between border-t border-line/60 bg-surface-sunken/40 px-4 py-2.5 text-[11px] text-ink-tertiary dark:border-white/[0.06] dark:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span>Navigate: <kbd className="font-mono font-bold">↑</kbd> <kbd className="font-mono font-bold">↓</kbd></span>
                <span>Select: <kbd className="font-mono font-bold">↵</kbd></span>
              </div>
              <span>JainSpace Campus Navigator</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
