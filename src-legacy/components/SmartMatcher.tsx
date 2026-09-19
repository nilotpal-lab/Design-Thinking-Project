'use client';

import React, { useState } from 'react';
import { 
  Zap, 
  Wind, 
  BookOpen, 
  Users, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Layers,
  Flame,
  ThumbsUp,
  RotateCcw,
  Award
} from 'lucide-react';
import { Room, isRoomFreeAt, getRemainingFreeMinutes, getStatusBadge } from '@/data/rooms';

interface SmartMatcherProps {
  rooms: Room[];
  currentTime: string;
  onSelectRoom: (room: Room) => void;
}

// Designated quiet pods & collaborative studio sets for deep matching
const SILENT_POD_CODES = new Set(['110', '111', '208', '209', '310B', '311A', '405', '410', '415']);
const DESIGN_STUDIO_CODES = new Set(['121 A', '107', '214', '318B', '308B', '315B', '411']);

export const SmartMatcher: React.FC<SmartMatcherProps> = ({
  rooms,
  currentTime,
  onSelectRoom,
}) => {
  const [priority, setPriority] = useState<'charging' | 'ac' | 'silent' | 'group'>('charging');
  const [duration, setDuration] = useState<number>(60); // in minutes
  const [groupSize, setGroupSize] = useState<'solo' | 'pair' | 'group'>('solo');
  const [floorPref, setFloorPref] = useState<'any' | number>('any');

  const handleResetFilters = () => {
    setPriority('charging');
    setDuration(60);
    setGroupSize('solo');
    setFloorPref('any');
  };

  // High-Precision AI Spot Recommendation & Match Algorithm
  const rankedRooms = rooms
    .map((room) => {
      const isFree = isRoomFreeAt(room, currentTime);
      const freeMinutes = getRemainingFreeMinutes(room, currentTime);
      let score = 25; // Balanced base calibration score
      const reasons: string[] = [];

      // -------------------------------------------------------------
      // 1. AVAILABILITY & DURATION FIT (CRITICAL DIMENSION)
      // -------------------------------------------------------------
      if (isFree) {
        score += 25;
        if (freeMinutes >= duration) {
          score += 20;
          const durationText = freeMinutes >= 180 ? 'Rest of Day' : `${freeMinutes}m free`;
          reasons.push(`Free for entire ${duration}m requirement (${durationText})`);
        } else if (freeMinutes >= 30) {
          score += (freeMinutes / duration) * 12;
          reasons.push(`Free for ${freeMinutes}m (${duration}m requested)`);
        } else {
          score += 3;
          reasons.push(`Free for ${freeMinutes}m (class starting soon)`);
        }
      } else {
        score -= 50; // Heavy penalty for currently occupied classrooms
        reasons.push('Class currently in session');
      }

      // -------------------------------------------------------------
      // 2. PRIMARY USER PRIORITY DIMENSION
      // -------------------------------------------------------------
      if (priority === 'charging') {
        if (room.chargingPoints >= 24) {
          score += 24 + (room.chargingPoints - 24) * 0.4;
          reasons.push(`Massive power setup with ${room.chargingPoints} sockets in ${room.name}`);
        } else if (room.chargingPoints >= 18) {
          score += 18 + (room.chargingPoints - 18) * 0.3;
          reasons.push(`High-power charging setup (${room.chargingPoints} functional sockets)`);
        } else if (room.chargingPoints >= 12) {
          score += 10;
          reasons.push(`${room.chargingPoints} functional charging sockets available`);
        } else {
          score -= 10;
          reasons.push(`Limited sockets (${room.chargingPoints} available)`);
        }
      } else if (priority === 'ac') {
        if (room.hasAC) {
          score += 22;
          const isChilled = 
            room.acStatus.toLowerCase().includes('chilled') || 
            room.acStatus.includes('18') || 
            room.acStatus.includes('19') || 
            room.acStatus.includes('20');
          if (isChilled) {
            score += 4;
            reasons.push(`Active climate cooling: ${room.acType} • ${room.acStatus} (Ultra-cool)`);
          } else {
            reasons.push(`Active climate cooling: ${room.acType} • ${room.acStatus}`);
          }
        } else {
          score -= 35;
          reasons.push('No active AC (Natural/Ceiling fan airflow only)');
        }
      } else if (priority === 'silent') {
        const isPod = SILENT_POD_CODES.has(room.code) || room.category === 'Silent Study Pod';
        if (room.noiseVibe === 'Silent Study') {
          score += 20;
          if (isPod) {
            score += 6;
            reasons.push('Designated pin-drop silent pod / focus sanctuary');
          } else {
            reasons.push('Designated pin-drop silent study zone');
          }
        } else if (room.noiseVibe === 'Quick Break') {
          score += 4;
        } else if (room.noiseVibe === 'Moderate / Group Work') {
          score -= 10;
        } else if (room.noiseVibe === 'Collaborative Buzz') {
          score -= 25;
        }
      } else if (priority === 'group') {
        const isStudio = DESIGN_STUDIO_CODES.has(room.code) || room.category === 'Design & Innovation Studio';
        if (room.noiseVibe === 'Collaborative Buzz' || room.noiseVibe === 'Moderate / Group Work') {
          score += 16;
          reasons.push('Collaborative buzz & active group discussion friendly');
        } else if (room.noiseVibe === 'Silent Study') {
          score -= 18;
        }
        if (room.hasSmartBoard) {
          score += 6;
          reasons.push('Equipped with interactive Smart Board for presentations');
        }
        if (isStudio) {
          score += 4;
          reasons.push('Design Studio layout with movable team tables');
        }
      }

      // -------------------------------------------------------------
      // 3. GROUP SIZE & CAPACITY SCALING
      // -------------------------------------------------------------
      if (groupSize === 'group') {
        if (room.capacity >= 50) {
          score += 8;
          reasons.push(`Spacious group capacity (${room.capacity} seats)`);
        } else if (room.capacity >= 30) {
          score += 5;
          reasons.push(`Ample group seating (${room.capacity} seats)`);
        } else if (room.capacity < 20) {
          score -= 20;
        }
      } else if (groupSize === 'solo') {
        const isPod = SILENT_POD_CODES.has(room.code) || room.category === 'Silent Study Pod';
        if (isPod) {
          score += 8;
          reasons.push('Individual focus pod tailored for solo study');
        } else if (room.capacity <= 35) {
          score += 5;
          reasons.push('Quiet individual study space');
        } else {
          score += 2;
        }
      } else if (groupSize === 'pair') {
        if (room.capacity >= 15 && room.capacity <= 45) {
          score += 7;
          reasons.push('Ideal side-by-side desk setup for 2 people');
        } else {
          score += 3;
        }
      }

      // -------------------------------------------------------------
      // 4. FLOOR PREFERENCE MATCHING
      // -------------------------------------------------------------
      if (floorPref !== 'any') {
        if (room.floor === floorPref) {
          score += 12;
          reasons.push(`Exact floor match (${room.floorLabel})`);
        } else {
          score -= 50; // Dominant filter penalty to ensure target floor ranks at the top
        }
      }

      // -------------------------------------------------------------
      // 5. COMFORT & INFRASTRUCTURE BONUSES
      // -------------------------------------------------------------
      score += (room.comfortScore / 10) * 4;
      if (room.wifiStrength && room.wifiStrength.includes('Ultra')) {
        score += 1.5;
      }

      // Normalized match percentage (clamped between 15% and 99%)
      const matchPercentage = Math.min(99, Math.max(15, Math.round(score)));

      return {
        room,
        rawScore: score,
        matchPercentage,
        reasons: reasons.slice(0, 3), // Top 3 most compelling justifications
        isFree,
        freeMinutes,
      };
    })
    .sort((a, b) => b.rawScore - a.rawScore);

  const topRecommendations = rankedRooms.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Wizard Selector Header */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl border border-blue-800/60 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              AI-Powered Spot Matcher • Jain University
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Find Your Ideal Campus Study Nook in 1-Click
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Tell us your immediate requirement and our multi-variable ranking engine will score all 52 campus rooms for live power, AC cooling, quiet pods, and available duration at <span className="font-mono font-bold text-blue-300">{currentTime}</span>.
            </p>
          </div>

          {/* Quick Reset Controls */}
          <button
            onClick={handleResetFilters}
            className="self-start lg:self-center px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-slate-200 rounded-2xl transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
            <span>Reset Preferences</span>
          </button>
        </div>

        {/* Wizard Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 relative z-10">
          {/* Step 1: Priority */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xs">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              1. Top Priority
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'charging', label: 'Laptop Charging (18-35 Sockets)', icon: Zap },
                { id: 'ac', label: 'AC & Climate Cooling', icon: Wind },
                { id: 'silent', label: 'Silent Deep Study (Pods)', icon: BookOpen },
                { id: 'group', label: 'Group Project & Smart Board', icon: Users },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setPriority(item.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    priority === item.id
                      ? 'bg-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-400/40'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Duration Needed */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xs">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              2. Duration Needed
            </label>
            <div className="space-y-1.5">
              {[
                { mins: 30, label: '30 Minutes (Quick Break)' },
                { mins: 60, label: '1 Hour (Full Free Period)' },
                { mins: 120, label: '2 Hours (Extended Study)' },
                { mins: 180, label: '3+ Hours (All Afternoon)' },
              ].map((item) => (
                <button
                  key={item.mins}
                  onClick={() => setDuration(item.mins)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    duration === item.mins
                      ? 'bg-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-400/40'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {duration === item.mins && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Group Size */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xs">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              3. Group Size
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'solo', label: 'Solo (Individual Focus)' },
                { id: 'pair', label: 'Pair (2 People Study)' },
                { id: 'group', label: 'Group Team (3 - 6+ People)' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setGroupSize(item.id as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    groupSize === item.id
                      ? 'bg-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-400/40'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {groupSize === item.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Floor Preference */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-xs">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              4. Floor Preference
            </label>
            <div className="space-y-1.5">
              {[
                { val: 'any', label: 'Any Floor (Best Spot)' },
                { val: 1, label: '1st Floor (Ground Level)' },
                { val: 2, label: '2nd Floor (Lecture Wing)' },
                { val: 3, label: '3rd Floor (Design Hub)' },
                { val: 4, label: '4th Floor (Terrace View)' },
              ].map((item) => (
                <button
                  key={String(item.val)}
                  onClick={() => setFloorPref(item.val as any)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                    floorPref === item.val
                      ? 'bg-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-400/40'
                      : 'bg-slate-900/60 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{item.label}</span>
                  {floorPref === item.val && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Results Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Top Ranked Spot Matches Right Now
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Evaluated across 52 Jain University rooms
          </span>
        </div>

        {topRecommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topRecommendations.map(({ room, matchPercentage, reasons }, index) => {
              const status = getStatusBadge(room, currentTime);
              const isWinner = index === 0;
              const rankTitles = ['🏆 #1 Best Match', '🥈 #2 Top Alternative', '🥉 #3 Great Choice'];

              return (
                <div
                  key={room.id}
                  className={`bg-white dark:bg-slate-800 rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between shadow-md relative overflow-hidden ${
                    isWinner
                      ? 'border-blue-500 ring-4 ring-blue-500/10 shadow-xl dark:shadow-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Top Rank Badge */}
                  <div className={`absolute top-0 right-0 text-[10px] font-extrabold uppercase px-3.5 py-1 rounded-bl-xl tracking-wider shadow-xs flex items-center gap-1 ${
                    isWinner 
                      ? 'bg-gradient-to-l from-blue-600 to-indigo-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}>
                    {isWinner ? <ThumbsUp className="w-3 h-3 text-yellow-300" /> : <Award className="w-3 h-3 text-blue-400" />}
                    {rankTitles[index]}
                  </div>

                  <div>
                    {/* Match Percentage & Room Header */}
                    <div className="flex items-start justify-between gap-2 mb-3 mt-1">
                      <div>
                        <span className="text-2xl font-black text-slate-900 dark:text-white block">
                          Room {room.code}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 rounded-full font-semibold text-slate-600 dark:text-slate-300">
                            {room.floorLabel}
                          </span>
                          <span className="text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium truncate max-w-[140px]">
                            {room.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                          {matchPercentage}%
                        </span>
                        <span className="text-[10px] text-slate-400 block font-semibold">MATCH</span>
                      </div>
                    </div>

                    {/* Room Name */}
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3 truncate" title={room.name}>
                      {room.name}
                    </p>

                    {/* Status Pill */}
                    <div className={`p-2.5 rounded-xl border text-xs font-bold ${status.badgeBg} ${status.badgeBorder} ${status.badgeColor} mb-3.5`}>
                      <div className="flex items-center justify-between">
                        <span>{status.statusText}</span>
                        {status.urgency === 'free' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                      </div>
                      <div className="text-[11px] font-normal opacity-90 mt-0.5 truncate">
                        {status.subText}
                      </div>
                    </div>

                    {/* Reasons list (Bulleted Justifications) */}
                    <div className="space-y-2 mb-4 bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Why this spot fits:
                      </span>
                      {reasons.map((reason, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Spec pills */}
                    <div className="grid grid-cols-3 gap-2 text-[11px] p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 mb-4">
                      <div className="flex items-center gap-1" title={`${room.chargingPoints} Functional Outlets`}>
                        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white">{room.chargingPoints}</span> Sockets
                      </div>
                      <div className="flex items-center gap-1" title={room.hasAC ? room.acType : 'Ceiling Fan Cooling'}>
                        <Wind className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white">{room.hasAC ? 'AC' : 'Fan'}</span>
                      </div>
                      <div className="flex items-center gap-1" title={`${room.capacity} Total Seats`}>
                        <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white">{room.capacity}</span> Seats
                      </div>
                    </div>
                  </div>

                  {/* Direct Action Button to Open Full Room Modal */}
                  <button
                    onClick={() => onSelectRoom(room)}
                    className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                      isWinner
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 hover:shadow-md hover:scale-[1.02]'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white'
                    }`}
                  >
                    <span>View Timetable & Select Room {room.code}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No matching rooms found for the active criteria.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
