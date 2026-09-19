'use client';

import React from 'react';
import { Clock, Zap, Wind, Users, Sparkles, Sun, Coffee, BookOpen, Activity } from 'lucide-react';
import { Room, isRoomFreeAt } from '@/data/rooms';

interface LiveTimeBarProps {
  currentTime: string;
  setCurrentTime: (time: string) => void;
  rooms: Room[];
}

export const LiveTimeBar: React.FC<LiveTimeBarProps> = ({
  currentTime,
  setCurrentTime,
  rooms,
}) => {
  const freeRooms = rooms.filter((r) => isRoomFreeAt(r, currentTime));
  const freeSockets = freeRooms.reduce((acc, r) => acc + r.chargingPoints, 0);
  const freeACRooms = freeRooms.filter((r) => r.hasAC).length;
  const avgComfort = (
    rooms.reduce((acc, r) => acc + r.comfortScore, 0) / rooms.length
  ).toFixed(1);

  // Time preset definitions for Jain University lecture schedule
  const timePresets = [
    { label: '08:45 AM', sub: 'Morning Block', time: '08:45', icon: Sun },
    { label: '10:45 AM', sub: 'Mid-Morning Break', time: '10:45', icon: Coffee },
    { label: '12:45 PM', sub: 'Lunch Period', time: '12:45', icon: Coffee },
    { label: '02:15 PM', sub: 'Lab Block', time: '14:15', icon: BookOpen },
    { label: '04:15 PM', sub: 'Project Hour', time: '16:15', icon: Sparkles },
  ];

  // Slider conversion: minutes from 08:30 (510 mins) to 17:30 (1050 mins)
  const timeToMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const minutesToTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mins = Number(e.target.value);
    setCurrentTime(minutesToTime(mins));
  };

  const currentMins = timeToMinutes(currentTime);

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0d1322] border-b border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
        
        {/* Bento Quick Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Tile 1: Free Rooms */}
          <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/[0.07] hover:border-emerald-500/40 transition-all shadow-xs group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Vacant Classrooms
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {freeRooms.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                / {rooms.length} rooms free
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/[0.08] h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(freeRooms.length / rooms.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Tile 2: Charging Ports */}
          <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/[0.07] hover:border-blue-500/40 transition-all shadow-xs group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Available Power Sockets
              </span>
              <Zap className="w-4 h-4 text-amber-500 dark:text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                {freeSockets}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                plugs ready now
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
              3-pin 65W–300W laptop sockets in free rooms
            </p>
          </div>

          {/* Tile 3: AC Classrooms */}
          <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/[0.07] hover:border-sky-500/40 transition-all shadow-xs group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Climate Cooling
              </span>
              <Wind className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                {freeACRooms}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                AC rooms open
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Regulated 20°C–22°C active cooling
            </p>
          </div>

          {/* Tile 4: Comfort Health Index */}
          <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200/90 dark:border-white/[0.07] hover:border-indigo-500/40 transition-all shadow-xs group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Space Health Index
              </span>
              <Activity className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {avgComfort}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                / 10 (Optimal)
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Aggregated AC, noise & seating ergonomics
            </p>
          </div>

        </div>

        {/* Precision Interactive Timetable Controller */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200/90 dark:border-white/[0.08] shadow-xs backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Left: Current Time Label & Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-300 shrink-0 shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Simulate Academic Time:
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-cyan-300 font-mono text-xs font-bold border border-blue-200 dark:border-blue-400/30">
                    {currentTime} IST
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Scrub time slider to test classroom vacancy across today's academic timetable.
                </p>
              </div>
            </div>

            {/* Right: Quick Schedule Period Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {timePresets.map((preset) => {
                const isSelected = currentTime === preset.time;
                return (
                  <button
                    key={preset.time}
                    onClick={() => setCurrentTime(preset.time)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold border border-blue-400/40'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.06]'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="text-[10px] opacity-70 hidden sm:inline">({preset.sub})</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Time Scrubber Slider */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.06] space-y-2">
            <div className="relative flex items-center">
              <input
                type="range"
                min={510}
                max={1050}
                step={5}
                value={currentMins}
                onChange={handleSliderChange}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500 focus:outline-hidden"
              />
            </div>
            
            <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold px-0.5">
              <span>08:30 AM (Start)</span>
              <span className="hidden sm:inline">10:45 AM (Break)</span>
              <span className="hidden sm:inline">12:45 PM (Lunch)</span>
              <span className="hidden sm:inline">02:15 PM (Labs)</span>
              <span>05:30 PM (End)</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
