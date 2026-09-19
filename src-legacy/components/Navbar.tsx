'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Layers,
  Zap,
  Users,
  Lightbulb,
  Search,
  Menu,
  X,
  Clock,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

export interface NavbarProps {
  activeTab: string;
  setActiveTab?: (tab: any) => void;
  onSelectTab?: (tab: any) => void;
  currentTime?: string;
  freeRoomsCount?: number;
  totalRoomsCount?: number;
  avgComfortScore?: number;
  onOpenSearch?: () => void;
  onOpenReportIssue?: () => void;
  className?: string;
}

interface NavItem {
  id: string;
  aliases: string[];
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badge?: string;
  badgeType?: 'live' | 'ai' | 'score' | 'neutral';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  currentTime,
  freeRoomsCount = 36,
  totalRoomsCount = 52,
  onOpenSearch,
  onOpenReportIssue,
  className,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelect = (tabId: string) => {
    if (onSelectTab) onSelectTab(tabId);
    if (setActiveTab) setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const navItems: NavItem[] = [
    {
      id: 'explorer',
      aliases: ['explorer', 'rooms'],
      label: 'Room Explorer',
      shortLabel: 'Explorer',
      icon: Compass,
      badge: `${freeRoomsCount} Free`,
      badgeType: 'live',
    },
    {
      id: 'floor-map',
      aliases: ['floor-map', 'map', 'maps'],
      label: 'Floor Map',
      shortLabel: 'Blueprint',
      icon: Layers,
    },
    {
      id: 'matcher',
      aliases: ['matcher', 'ai-matcher'],
      label: '1-Click Matcher',
      shortLabel: 'AI Matcher',
      icon: Zap,
      badge: 'AI',
      badgeType: 'ai',
    },
    {
      id: 'crowd-issues',
      aliases: ['crowd-issues', 'crowd', 'issues'],
      label: 'Crowd Telemetry',
      shortLabel: 'Telemetry',
      icon: Users,
    },
    {
      id: 'case-study',
      aliases: ['case-study', 'design-thinking', 'rubric'],
      label: 'Design Thinking',
      shortLabel: '20/20 Rubric',
      icon: Lightbulb,
      badge: '20/20 Score',
      badgeType: 'score',
    },
  ];

  const isTabActive = (item: NavItem): boolean => {
    return item.id === activeTab || item.aliases.includes(activeTab);
  };

  return (
    <header className={cn('sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0a0f1d]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white transition-colors duration-200', className)}>
      {/* Top Micro Header: Jain University Academic Banner */}
      <div className="border-b border-slate-200/80 dark:border-white/[0.05] bg-slate-50/80 dark:bg-gradient-to-r dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-slate-950/40 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
              <GraduationCap className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              JAIN (Deemed-to-be University)
            </span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-600">•</span>
            <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              FET • 3rd Sem Design Thinking Project
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span><strong>{freeRoomsCount}</strong> of {totalRoomsCount} Rooms Free</span>
            </div>

            {currentTime && (
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px] font-mono bg-slate-200/60 dark:bg-white/[0.04] px-2 py-0.5 rounded-md border border-slate-300/60 dark:border-white/[0.06]">
                <Clock className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                <span>{currentTime} IST</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Name */}
          <button
            onClick={() => handleSelect('explorer')}
            className="flex items-center gap-3 group focus:outline-hidden text-left cursor-pointer select-none shrink-0"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-md shadow-blue-600/30 group-hover:shadow-blue-500/50 transition-all border border-white/20">
              <span className="font-black text-white text-base tracking-tight">JS</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Jain<span className="text-blue-600 dark:text-cyan-400">Space</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-300 text-[10px] font-mono font-bold border border-blue-400/30">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                Campus Space Reimagined
              </p>
            </div>
          </button>

          {/* Center: Sleek Segmented Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center bg-slate-100 dark:bg-white/[0.04] p-1.5 rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isTabActive(item);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={cn(
                    'relative px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all select-none cursor-pointer',
                    active
                      ? 'text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/[0.04]'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md shadow-blue-600/40 -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <Icon className={cn('w-4 h-4 transition-colors', active ? 'text-white' : 'text-slate-500 dark:text-slate-400')} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-[9px] px-1.5 py-0.5 rounded-full font-bold font-mono uppercase tracking-wider',
                        active
                          ? 'bg-white/20 text-white'
                          : item.badgeType === 'live'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                          : item.badgeType === 'score'
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                          : 'bg-blue-100 dark:bg-cyan-500/20 text-blue-700 dark:text-cyan-300 border border-blue-300 dark:border-cyan-500/30'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Theme Toggle & Issue Report */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle (Moon / Sun Icon Button) */}
            <ThemeToggle />

            {onOpenReportIssue && (
              <button
                onClick={onOpenReportIssue}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 text-xs font-semibold transition-all cursor-pointer"
                title="Report broken socket or infrastructure issue"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>Report Issue</span>
              </button>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-2xl px-4 py-4 space-y-2 overflow-hidden"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isTabActive(item);

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={cn(
                    'w-full p-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-all text-left cursor-pointer',
                    active
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
