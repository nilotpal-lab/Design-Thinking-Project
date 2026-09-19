'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building,
  User,
  Zap,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface LoginPageProps {
  onSuccessLogin?: () => void;
  onBrowseGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccessLogin,
  onBrowseGuest,
}) => {
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState('nilotpal@jainuniversity.ac.in');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login({
        name: role === 'student' ? 'Nilotpal Deb' : 'Dr. B. K. Sharma (Faculty)',
        email: email || 'nilotpal@jainuniversity.ac.in',
        role: role === 'student' ? 'Student' : 'Faculty / Lab Admin',
        semester: role === 'student' ? '3rd Sem' : 'Design Thinking Dept',
        avatar: role === 'student' ? 'ND' : 'BS',
      });
      setIsLoading(false);
      if (onSuccessLogin) onSuccessLogin();
    }, 500);
  };

  const handleQuickLoginStudent = () => {
    login({
      name: 'Nilotpal Deb',
      email: 'nilotpal@jainuniversity.ac.in',
      usn: '23BCSE1042',
      role: 'Student',
      semester: '3rd Sem',
      department: 'Faculty of Engineering & Technology (FET)',
      avatar: 'ND',
    });
    if (onSuccessLogin) onSuccessLogin();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F0F4FA] dark:bg-[#0A0E1A] text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/15 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Controls: Theme Switcher */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-white/80 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 shadow-sm cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
        </button>
      </div>

      {/* Main Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-[2.5rem] bg-white/85 dark:bg-[#11192E]/85 backdrop-blur-2xl border border-white/90 dark:border-white/[0.08] shadow-2xl shadow-blue-900/10 dark:shadow-black/60 relative z-10 space-y-6"
      >
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 shadow-lg shadow-blue-600/30 text-white mb-1">
            <div className="w-6 h-6 border-2 border-white rounded-sm rotate-45 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-2xs" />
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Jain<span className="text-blue-600 dark:text-cyan-400">Space</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            JAIN (Deemed-to-be University) • Campus Space Portal
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
              role === 'student'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            )}
          >
            Student Sign In
          </button>
          <button
            type="button"
            onClick={() => setRole('faculty')}
            className={cn(
              'flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
              role === 'faculty'
                ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            )}
          >
            Faculty & Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email / USN Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {role === 'student' ? 'University Email / Student USN' : 'Faculty Institutional Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. nilotpal@jainuniversity.ac.in"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <a href="#" className="text-[11px] text-blue-600 dark:text-cyan-400 font-semibold hover:underline">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to JainSpace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Fast Student Demo Login */}
        <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
          <button
            type="button"
            onClick={handleQuickLoginStudent}
            className="w-full p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 border border-blue-200/80 dark:border-blue-800/40 text-left flex items-center justify-between transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                ND
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Quick Login: Nilotpal Deb
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  3rd Sem CSE (FET) • nilotpal@jainuniversity.ac.in
                </p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
          </button>

          {onBrowseGuest && (
            <button
              type="button"
              onClick={onBrowseGuest}
              className="w-full py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            >
              Continue as Guest (View Campus Map & 52 Rooms) →
            </button>
          )}
        </div>

        {/* Academic Project Footnote */}
        <div className="text-center pt-2 text-[10px] text-slate-400 dark:text-slate-500">
          Faculty of Engineering & Technology (FET) • 3rd Sem Design Thinking Project
        </div>

      </motion.div>
    </div>
  );
};
