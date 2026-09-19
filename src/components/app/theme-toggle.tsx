'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Theme toggle. The `.dark` class is set pre-paint by the bootstrap script in
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
      className="inline-flex h-8 w-8 items-center justify-center rounded text-ink-secondary transition-colors duration-instant hover:bg-surface-sunken hover:text-ink"
    >
      {/* Render both icons server-side; CSS picks one — no hydration mismatch. */}
      <Sun className="hidden h-4 w-4 dark:block" aria-hidden />
      <Moon className="block h-4 w-4 dark:hidden" aria-hidden />
    </button>
  );
}
