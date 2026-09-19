'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  Calendar,
  BarChart2,
  Map,
  Clock,
  Settings,
  Sparkles,
  ArrowRight,
  Sprout,
  X,
  Compass,
  Layers,
  GraduationCap,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export type NavTabType = 'home' | 'explorer' | 'bookings' | 'telemetry' | 'map' | 'analytics' | 'settings' | 'matcher';

interface SidebarProps {
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  onOpenLogin?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen = false,
  setMobileOpen,
  onOpenLogin,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: NavTabType; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explorer', label: 'Find a Room', icon: Search },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'telemetry', label: 'Live Availability', icon: BarChart2 },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'analytics', label: 'Analytics', icon: Clock },
  ];

  const handleSelect = (tab: NavTabType) => {
    setActiveTab(tab);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen && setMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out',
          'bg-[#F8FAFC]/90 dark:bg-[#0E1526]/90 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/[0.08] shadow-sm',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Top Logo & Navigation Section */}
        <div className="space-y-7">
          {/* Logo & Close for Mobile */}
          <div className="flex items-center justify-between px-2 pt-1">
            <button
              onClick={() => handleSelect('home')}
              className="flex items-center gap-3 group text-left cursor-pointer"
            >
              {/* 3D-styled Cube Glass Icon */}
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white">
                  <div className="w-4 h-4 border-2 border-white/90 rounded-sm rotate-45 transform flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-2xs" />
                  </div>
                </div>
              </div>

              <div>
                <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white flex items-center">
                  Jain<span className="text-blue-600 dark:text-cyan-400">Space</span>
                </span>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400 leading-none mt-0.5">
                  Find space. Fuel ideas.
                </p>
              </div>
            </button>

            {/* Mobile Close Button */}
            {setMobileOpen && (
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all cursor-pointer select-none text-left relative',
                    isActive
                      ? 'bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-cyan-300 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-400'
                    )}
                  />
                  <span>{item.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarIndicator"
                      className="absolute right-2 w-1.5 h-5 bg-blue-600 dark:bg-cyan-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: User Session / Settings & Promo Sprout Card */}
        <div className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-white/[0.06]">
          
          {/* Settings Nav Item */}
          <button
            onClick={() => handleSelect('settings')}
            className={cn(
              'w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer text-left',
              activeTab === 'settings'
                ? 'bg-blue-600/10 dark:bg-blue-500/15 text-blue-600 dark:text-cyan-300 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
            )}
          >
            <Settings className="w-5 h-5 text-slate-400 dark:text-slate-400" />
            <span>Settings</span>
          </button>

          {/* User Sign In / Profile Quick Button */}
          {!user.isLoggedIn && onOpenLogin && (
            <button
              onClick={onOpenLogin}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              <span>Student Sign In</span>
            </button>
          )}

          {/* Sprout Promo Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-white/90 to-blue-50/60 dark:from-white/[0.04] dark:to-blue-950/20 border border-slate-200/80 dark:border-white/[0.08] shadow-xs relative overflow-hidden">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-3 shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>

            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Better Spaces<br />A Brighter Campus
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Optimizing spaces for a smarter tomorrow.
            </p>

            <button
              onClick={() => handleSelect('analytics')}
              className="mt-3 w-7 h-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center hover:scale-105 transition-transform shadow-sm cursor-pointer"
              title="Learn about Jain University Campus Optimization"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
