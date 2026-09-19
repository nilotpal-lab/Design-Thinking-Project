'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Sun,
  Moon,
  Bell,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Database,
  Cpu
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

export const SettingsView: React.FC = () => {
  const { isDark, setTheme } = useTheme();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Platform Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize JainSpace theme, campus telemetry sync, and student profile preferences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Appearance Card */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            Appearance & Interface Theme
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2',
                !isDark
                  ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300'
              )}
            >
              <Sun className="w-6 h-6 text-amber-500" />
              <span className="text-xs">Light Mode</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2',
                isDark
                  ? 'bg-blue-950/40 border-cyan-400 text-cyan-300 font-bold shadow-xs'
                  : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-300'
              )}
            >
              <Moon className="w-6 h-6 text-cyan-400" />
              <span className="text-xs">Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Academic Project Info Card */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-500" />
            Academic Project Accreditation
          </h2>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Institution:</span>
              <span className="font-bold text-slate-900 dark:text-white">Jain (Deemed-to-be University)</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Course & Sem:</span>
              <span className="font-bold text-slate-900 dark:text-white">3rd Semester • Design Thinking</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Campus Total Capacity:</span>
              <span className="font-bold text-slate-900 dark:text-white">52 Rooms Across 4 Floors</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
