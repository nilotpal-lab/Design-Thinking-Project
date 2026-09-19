'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative p-2 sm:px-3 sm:py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer select-none border focus:outline-hidden',
        isDark
          ? 'bg-white/[0.06] hover:bg-white/[0.12] text-cyan-300 border-white/[0.1] shadow-inner'
          : 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-200 shadow-sm',
        className
      )}
      title={isDark ? 'Switch to Light Mode ☀️' : 'Switch to Dark Mode 🌙'}
      aria-label="Toggle theme"
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-cyan-300 fill-cyan-400/20" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 fill-amber-400/30" />
        )}
      </motion.div>

      <span className="hidden md:inline text-xs font-bold font-mono">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};
