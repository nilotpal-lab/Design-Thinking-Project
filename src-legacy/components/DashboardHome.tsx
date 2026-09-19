'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ArrowRight,
  DoorOpen,
  Users,
  Calendar,
  Zap,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  Layers,
  BookOpen,
  FlaskConical,
  Flame,
  CheckCircle2,
  Tv,
  Monitor,
  Presentation,
  Lightbulb,
  Building,
  Activity,
  Compass,
  CornerRightUp
} from 'lucide-react';
import { JAIN_ROOMS, Room, isRoomFreeAt } from '@/data/rooms';
import { cn } from '@/lib/utils';
import { NavTabType } from '@/components/Sidebar';

interface DashboardHomeProps {
  currentTime: string;
  setCurrentTime: (time: string) => void;
  onNavigateTab: (tab: NavTabType, filterParam?: string) => void;
  onSelectRoom: (room: Room) => void;
  onOpenBookings: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  currentTime,
  setCurrentTime,
  onNavigateTab,
  onSelectRoom,
  onOpenBookings,
}) => {
  const [heroSearch, setHeroSearch] = useState('');

  // Calculate live dynamic metrics from the 52-room dataset
  const freeRooms = JAIN_ROOMS.filter((r) => isRoomFreeAt(r, currentTime));
  const totalFreeSeats = freeRooms.reduce((acc, r) => acc + Math.round(r.capacity * 0.65), 0);
  const onDemandRoomsCount = freeRooms.filter((r) => r.chargingPoints >= 18).length;
  const occupancyPercent = Math.round(((JAIN_ROOMS.length - freeRooms.length) / JAIN_ROOMS.length) * 100);
  const availabilityPercent = 100 - occupancyPercent; // e.g. 69%

  // Handlers for search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateTab('explorer', heroSearch);
  };

  // Popular representative spaces from our dataset
  const popularSpaces: { roomCode: string; name: string; type: string; isFree: boolean; image: string }[] = [
    {
      roomCode: '201B',
      name: '201B',
      type: 'Smart Classroom',
      isFree: true,
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=300&q=80',
    },
    {
      roomCode: '202',
      name: 'Lab 3',
      type: 'Computer Lab',
      isFree: true,
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=300&q=80',
    },
    {
      roomCode: '201',
      name: 'Seminar Hall',
      type: 'Auditorium',
      isFree: false,
      image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=300&q=80',
    },
    {
      roomCode: '121 A',
      name: 'Innovation Studio',
      type: 'Project Space',
      isFree: true,
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80',
    },
  ];

  // Today's schedule timeline slots
  const scheduleSlots = [
    { time: '08:30', label: 'Classes', isFree: false },
    { time: '10:45', label: 'Free', isFree: true, isNow: currentTime === '10:45' },
    { time: '12:45', label: 'Classes', isFree: false },
    { time: '02:15', label: 'Labs', isFree: false },
    { time: '04:15', label: 'Free', isFree: true },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* ========================================================================= */}
      {/* 1. HERO CARD BANNER WITH CAMPUS ARCHITECTURE & ANNOTATION                 */}
      {/* ========================================================================= */}
      <div className="relative rounded-[2.2rem] bg-gradient-to-br from-white/90 via-blue-50/70 to-indigo-50/50 dark:from-white/[0.04] dark:via-blue-950/20 dark:to-indigo-950/30 border border-slate-200/80 dark:border-white/[0.08] p-6 sm:p-10 shadow-sm overflow-hidden backdrop-blur-2xl">
        
        {/* Ambient subtle light orb */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-400/10 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          
          {/* Left Text & Search Area */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Tagline Badge */}
            <span className="inline-block text-[11px] font-bold font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              WELCOME TO JAINSPACE
            </span>

            {/* Main Big Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-slate-900 dark:text-white leading-[1.15] tracking-tight">
              Find the right space<br />
              for your next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">big idea.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg font-normal leading-relaxed">
              Real-time availability. Smarter allocation. A more productive campus.
            </p>

            {/* Floating Glassmorphic Search Bar */}
            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 absolute left-4 text-slate-400 dark:text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by room name, block, type (e.g. lab, classroom)..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full pl-12 pr-14 py-3.5 sm:py-4 rounded-full bg-white/95 dark:bg-[#11192E]/90 border border-slate-200/90 dark:border-white/[0.12] text-slate-900 dark:text-white text-xs sm:text-sm font-medium placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-md shadow-blue-500/5 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-600/30 transition-all hover:scale-105 cursor-pointer"
                  title="Search Spaces"
                >
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </form>

          </div>

          {/* Right Campus Building Photo with "Ideas happen here" Annotation */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
            
            {/* Handwritten Note Annotation */}
            <div className="absolute -top-3 left-4 sm:left-12 lg:-left-6 z-20 flex items-center gap-1.5 pointer-events-none">
              <span className="font-handwriting text-2xl text-blue-600 dark:text-cyan-400 transform -rotate-12 select-none">
                Ideas happen here
              </span>
              <CornerRightUp className="w-6 h-6 text-blue-500 dark:text-cyan-400 transform rotate-12 stroke-[1.5]" />
            </div>

            {/* Campus Photo Container */}
            <div className="relative w-full max-w-sm rounded-3xl overflow-hidden border border-white/60 dark:border-white/[0.1] shadow-xl shadow-blue-900/10 group">
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"
                alt="Jain University Faculty of Engineering & Technology Campus Building"
                className="w-full h-56 sm:h-64 object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Jain University Overlay Banner Badge */}
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-white/[0.1] shadow-sm flex items-center gap-1.5">
                <span className="font-black text-xs text-blue-950 dark:text-white tracking-wider">
                  JAIN
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">
                  DEEMED-TO-BE UNIVERSITY
                </span>
              </div>

              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-slate-950/80 to-transparent text-white text-xs font-semibold">
                FET Knowledge Campus • Bangalore
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 4 STAT BENTO CARDS ROW                                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Stat 1: Vacant Rooms */}
        <div
          onClick={() => onNavigateTab('explorer')}
          className="p-5 rounded-3xl bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {freeRooms.length}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              Vacant Rooms
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              / {JAIN_ROOMS.length} total rooms
            </p>
          </div>
        </div>

        {/* Stat 2: Total Seats Free */}
        <div
          onClick={() => onNavigateTab('explorer')}
          className="p-5 rounded-3xl bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
              {totalFreeSeats || 751}
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              Total Seats Free
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              across all rooms
            </p>
          </div>
        </div>

        {/* Stat 3: Bookings Today */}
        <div
          onClick={onOpenBookings}
          className="p-5 rounded-3xl bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:border-purple-500/40 hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                12
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                +2
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              Bookings Today
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              from yesterday
            </p>
          </div>
        </div>

        {/* Stat 4: On-Demand Rooms */}
        <div
          onClick={() => onNavigateTab('explorer', 'sockets')}
          className="p-5 rounded-3xl bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:border-amber-500/40 hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
              {onDemandRoomsCount || 9}
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              On-Demand Rooms
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Plug & Play
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN DASHBOARD SPLIT: LEFT (SCHEDULE + ACTIONS) & RIGHT (GAUGE + LIST) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (8 SPANS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Middle Split: Today's Schedule & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Today's Schedule Timeline Widget (7 cols) */}
            <div className="md:col-span-7 p-6 rounded-3xl bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Today's Schedule
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTab('explorer')}
                  className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Day</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Timeline Horizontal Bar & Indicators */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {scheduleSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => setCurrentTime(slot.time)}
                      className="group text-left cursor-pointer focus:outline-hidden"
                    >
                      <div className="text-[11px] font-bold font-mono text-slate-800 dark:text-slate-200">
                        {slot.time}
                      </div>
                      <div className={cn(
                        'text-[10px] font-semibold',
                        slot.isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      )}>
                        {slot.label}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Visual Pill Track */}
                <div className="grid grid-cols-5 gap-1.5 h-7 relative items-center">
                  {scheduleSlots.map((slot, idx) => {
                    const isSelected = currentTime === slot.time;
                    return (
                      <button
                        key={slot.time}
                        onClick={() => setCurrentTime(slot.time)}
                        className={cn(
                          'h-full rounded-xl transition-all relative flex items-center justify-center text-[10px] font-bold cursor-pointer',
                          slot.isFree
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-slate-200/70 dark:bg-white/[0.04] text-slate-400 border border-slate-200 dark:border-white/[0.06] hover:bg-slate-300/70',
                          isSelected && 'ring-2 ring-blue-500'
                        )}
                      >
                        {isSelected && (
                          <span className="absolute -bottom-6 px-2 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-bold shadow-xs">
                            Now
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions Widget (5 cols) */}
            <div className="md:col-span-5 p-6 rounded-3xl bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Quick Actions
                </h3>
              </div>

              <div className="space-y-2">
                <button
                  onClick={onOpenBookings}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-blue-50/80 dark:hover:bg-blue-900/20 border border-slate-200/70 dark:border-white/[0.06] hover:border-blue-300 dark:hover:border-blue-700/50 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>Book a Room</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigateTab('map')}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-blue-50/80 dark:hover:bg-blue-900/20 border border-slate-200/70 dark:border-white/[0.06] hover:border-blue-300 dark:hover:border-blue-700/50 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    <span>View Campus Map</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => onNavigateTab('matcher')}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-blue-50/80 dark:hover:bg-blue-900/20 border border-slate-200/70 dark:border-white/[0.06] hover:border-blue-300 dark:hover:border-blue-700/50 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-300">
                    <Sparkles className="w-4 h-4 text-rose-500" />
                    <span>Find Nearest Free Room</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Split: Find Your Space (2x3 Grid) & Inspiration Quote */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            {/* Find Your Space 6 Category Cards (8 cols) */}
            <div className="md:col-span-8 p-6 rounded-3xl bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Find Your Space
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                {/* 1. All Rooms */}
                <button
                  onClick={() => onNavigateTab('explorer', 'all')}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-blue-50/80 dark:hover:bg-blue-900/20 border border-slate-200/70 dark:border-white/[0.06] hover:border-blue-300 text-left transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center mb-2">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">All Rooms</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">52</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 2. Labs */}
                <button
                  onClick={() => onNavigateTab('explorer', 'Computer / Tech Lab')}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-purple-50/80 dark:hover:bg-purple-900/20 border border-slate-200/70 dark:border-white/[0.06] hover:border-purple-300 text-left transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Labs</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">14</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 3. Project Rooms */}
                <button
                  onClick={() => onNavigateTab('explorer', 'Silent Study Pod')}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-amber-50/80 dark:hover:bg-amber-900/20 border border-slate-200/70 dark:border-white/[0.06] hover:border-amber-300 text-left transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Project Rooms</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">8</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 4. Classrooms */}
                <button
                  onClick={() => onNavigateTab('explorer', 'Smart Classroom')}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20 border border-slate-200/70 dark:border-white/[0.06] hover:border-emerald-300 text-left transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Classrooms</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">18</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 5. Seminar Halls */}
                <button
                  onClick={() => onNavigateTab('explorer', 'Seminar Amphitheatre')}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-rose-50/80 dark:hover:bg-rose-900/20 border border-slate-200/70 dark:border-white/[0.06] hover:border-rose-300 text-left transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
                    <Presentation className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Seminar Halls</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">6</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

                {/* 6. Innovation Studios */}
                <button
                  onClick={() => onNavigateTab('explorer', 'Design & Innovation Studio')}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] hover:bg-cyan-50/80 dark:hover:bg-cyan-900/20 border border-slate-200/70 dark:border-white/[0.06] hover:border-cyan-300 text-left transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Innovation Studios</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">6</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>

              </div>
            </div>

            {/* Inspiration Quote Card (4 cols) */}
            <div className="md:col-span-4 p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/60 dark:border-white/[0.08] shadow-xs flex flex-col justify-between">
              <span className="text-4xl text-blue-500 dark:text-cyan-400 font-serif leading-none">
                “
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed italic my-3">
                Spaces don't just host classes, they build ideas.
              </p>
              <div className="w-10 h-1 bg-blue-600 dark:bg-cyan-400 rounded-full" />
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (4 SPANS) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Live Availability Donut Gauge */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Availability
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold font-mono">
                ● Real-time
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative w-36 h-36 flex items-center justify-center">
                
                {/* SVG Donut Circle */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-slate-200 dark:stroke-white/[0.08]"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Available Value Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="stroke-emerald-500"
                    strokeWidth="10"
                    strokeDasharray={`${(availabilityPercent / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {availabilityPercent}%
                  </span>
                </div>
              </div>

              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2">
                {freeRooms.length} / {JAIN_ROOMS.length}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Rooms Free
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between text-[11px] font-medium border-t border-slate-100 dark:border-white/[0.06] pt-3 text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{freeRooms.length} Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{JAIN_ROOMS.length - freeRooms.length} Occupied</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                <span>4 Maint.</span>
              </span>
            </div>
          </div>

          {/* Popular Spaces List */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Popular Spaces
              </h3>
            </div>

            <div className="space-y-2.5">
              {popularSpaces.map((item) => {
                const roomData = JAIN_ROOMS.find((r) => r.code === item.roomCode) || JAIN_ROOMS[0];

                return (
                  <div
                    key={item.roomCode}
                    onClick={() => onSelectRoom(roomData)}
                    className="p-2.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-between gap-3 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {item.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full text-[10px] font-bold',
                          item.isFree
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        )}
                      >
                        {item.isFree ? 'Free' : 'Occupied'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
