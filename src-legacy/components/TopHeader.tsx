'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Bell,
  ChevronDown,
  Menu,
  GraduationCap,
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Zap,
  LogOut,
  LogIn,
  Settings,
  Info
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface TopHeaderProps {
  onOpenMobileMenu?: () => void;
  onOpenNotifications?: () => void;
  onOpenBookings?: () => void;
  onOpenSettings?: () => void;
  onOpenLogin?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileMenu,
  onOpenNotifications,
  onOpenBookings,
  onOpenSettings,
  onOpenLogin,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Click Outside Listener: Automatically closes dropdowns when clicking anywhere else on screen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const notifications = [
    { id: '1', title: 'Room 318B is now Free', time: '2 mins ago', type: 'free', icon: CheckCircle2 },
    { id: '2', title: 'Power Spike resolved in Lab 202', time: '15 mins ago', type: 'resolved', icon: Zap },
    { id: '3', title: 'Upcoming: 2:15 PM Lab Block begins', time: '30 mins ago', type: 'info', icon: Calendar },
  ];

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    if (onOpenLogin) onOpenLogin();
  };

  return (
    <header className="w-full flex items-center justify-between py-3.5 px-4 sm:px-8 bg-transparent">
      {/* Left: Mobile Menu Toggle or Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-2xl bg-white/80 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 shadow-xs cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/70 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/[0.06] shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
            JAIN University • FET Campus
          </span>
        </div>
      </div>

      {/* Right Controls: Theme Toggle + Notifications Bell + User Profile */}
      <div className="flex items-center gap-3 relative">
        
        {/* Sun / Moon Theme Pill Toggle */}
        <div className="flex items-center p-1 rounded-full bg-white/80 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
          <button
            onClick={toggleTheme}
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer',
              !isDark
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            )}
            title="Light Mode"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleTheme}
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer',
              isDark
                ? 'bg-cyan-400 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-slate-700'
            )}
            title="Dark Mode"
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notification Bell Icon */}
        <div ref={notificationsRef} className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-9 h-9 rounded-full bg-white/80 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors shadow-xs relative cursor-pointer"
            title="Campus Notifications"
          >
            <Bell className="w-4 h-4" />
            {/* Live Blue Unread Dot */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900" />
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 top-full mt-2 w-80 p-4 rounded-3xl bg-white/95 dark:bg-[#121A2F]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.1] shadow-xl z-50 space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-500" />
                    Campus Telemetry Alerts
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold">3 New</span>
                </div>

                <div className="space-y-2">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.04] flex items-start gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Avatar Pill / Sign In Button */}
        {user.isLoggedIn ? (
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-full bg-white/80 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.15] transition-all shadow-xs cursor-pointer select-none"
            >
              {/* Initials Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-400 via-slate-500 to-slate-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.avatar || 'ND'}
              </div>

              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight block">
                  {user.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
                  {user.role}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown with Auto Click-Outside & Logout Option */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-64 p-3.5 rounded-3xl bg-white/95 dark:bg-[#121A2F]/95 backdrop-blur-2xl border border-slate-200/80 dark:border-white/[0.1] shadow-2xl z-50 space-y-2.5 text-xs"
                >
                  {/* Student Details Header */}
                  <div className="p-2 border-b border-slate-100 dark:border-white/[0.06]">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{user.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono break-all">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800/60">
                        {user.semester} CSE (FET)
                      </span>
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 text-[10px] font-mono">
                        {user.usn}
                      </span>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        if (onOpenBookings) onOpenBookings();
                      }}
                      className="w-full text-left p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] font-semibold flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>My Active Bookings</span>
                    </button>

                    {onOpenSettings && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onOpenSettings();
                        }}
                        className="w-full text-left p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] font-semibold flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Platform Settings</span>
                      </button>
                    )}
                  </div>

                  {/* Logout Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left p-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </div>
                      <span className="text-[10px] font-normal text-slate-400">Exit</span>
                    </button>
                  </div>

                  <div className="px-2 pt-1 text-[10px] text-slate-400">
                    Design Thinking CA1 • 20/20 Project
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/30 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

      </div>
    </header>
  );
};
