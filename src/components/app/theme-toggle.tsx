'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * High-taste Theme Toggle. The `.dark` class is set pre-paint by the bootstrap script in
 * the root layout; we read (not own) the resulting state to avoid any flash.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('jainspace-theme', next ? 'dark' : 'light');
    } catch {
      /* private mode — theme just won't persist */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-line/80 bg-surface/80 text-ink-secondary shadow-sm backdrop-blur-md transition-all duration-instant ease-spring hover:border-line-strong hover:bg-surface hover:text-ink hover:scale-105 active:scale-95 dark:border-white/10 dark:bg-surface/80 dark:hover:bg-surface-raised"
    >
      <Sun className="hidden h-4 w-4 text-amber-400 transition-transform duration-fast dark:block" aria-hidden />
      <Moon className="block h-4 w-4 text-indigo-500 transition-transform duration-fast dark:hidden" aria-hidden />
    </button>
  );
}
