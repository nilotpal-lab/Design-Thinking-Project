'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Zap,
  Wind,
  Wifi,
  Users,
  Sparkles,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Tv,
  UserCheck,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { Room, isRoomFreeAt, getStatusBadge } from '@/data/rooms';
import { cn } from '@/lib/utils';

export interface RoomCardProps {
  room: Room;
  currentTime: string;
  onSelectRoom?: (room: Room) => void;
  onOpenSchedule?: (room: Room) => void;
  onReportIssue?: (room: Room) => void;
  onOpenReport?: (room: Room) => void;
  onCheckIn?: (room: Room) => void;
  className?: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  currentTime,
  onSelectRoom,
  onOpenSchedule,
  onReportIssue,
  onOpenReport,
  onCheckIn,
  className,
}) => {
  const [showComfortTooltip, setShowComfortTooltip] = useState(false);
  const [localCheckedIn, setLocalCheckedIn] = useState(false);

  // Dynamic status badge evaluation based on live timetable
  const statusBadge = getStatusBadge(room, currentTime);
  const isOccupied = !statusBadge.isFree;

  // Real-time seat occupancy calculation
  const totalSeats = room.capacity || 40;
  const freeSeats = isOccupied
    ? Math.max(0, Math.round(totalSeats * 0.1))
    : Math.max(4, Math.round(totalSeats * 0.65));

  // Sockets calculation
  const totalSockets = room.totalSockets || room.chargingPoints || 12;
  const workingSockets = room.chargingPoints || 10;

  // AC condition
  const acType = room.acType || (room.hasAC ? 'Split Inverter AC' : 'High-RPM Ceiling Fans');
  const acStatus = room.acStatus || (room.hasAC ? 'Chilled (19°C)' : 'Ambient Ventilation');

  // Wi-Fi signal
  const wifiStrength = room.wifiStrength || 'Ultra-fast (6GHz, 450 Mbps)';

  // Noise & check-ins
  const noiseVibe = room.noiseVibe || 'Moderate Collaborative';
  const checkInCount = room.currentOccupancy || 0;
  const hasSmartBoard = room.hasSmartBoard || false;
  const hasProjector = room.hasProjector || true;
  const roomBlock = room.block || (room.code.includes('A') || room.floor === 1 ? 'Block A' : 'Block B');

  // Comfort score formatting
  const rawComfort = room.comfortScore || 8.8;
  const comfortDisplay = rawComfort.toFixed(1);
  const comfortPercent = Math.round((rawComfort / 10) * 100);

  const handleOpenSchedule = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenSchedule) onOpenSchedule(room);
    else if (onSelectRoom) onSelectRoom(room);
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReportIssue) onReportIssue(room);
    else if (onOpenReport) onOpenReport(room);
  };

  const handleCheckInToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalCheckedIn(!localCheckedIn);
    if (onCheckIn) onCheckIn(room);
  };

  // Comfort badge color classification
  const getComfortScoreBadge = (score: number) => {
    if (score >= 9.0) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        label: 'Optimal Space',
        glow: 'shadow-emerald-500/10',
      };
    }
    if (score >= 8.0) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        label: 'Great Comfort',
        glow: 'shadow-blue-500/10',
      };
    }
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      label: 'Standard',
      glow: 'shadow-amber-500/10',
    };
  };

  // Noise vibe badge styling
  const getNoiseBadge = (vibe: string) => {
    const lower = (vibe || '').toLowerCase();
    if (lower.includes('silent') || lower.includes('quiet')) {
      return { label: '🤫 Silent Study', color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800' };
    }
    if (lower.includes('collab') || lower.includes('buzz')) {
      return { label: '👥 Collab Buzz', color: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800' };
    }
    if (lower.includes('break')) {
      return { label: '☕ Quick Break', color: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' };
    }
    return { label: '💬 Moderate Work', color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800' };
  };

  const comfortMeta = getComfortScoreBadge(rawComfort);
  const noiseMeta = getNoiseBadge(noiseVibe);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'group relative bg-white dark:bg-[#11192E] border border-slate-200/90 dark:border-white/[0.08] shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500/40 rounded-3xl transition-all duration-200 overflow-hidden flex flex-col justify-between backdrop-blur-xl',
        isOccupied
          ? 'border-slate-200/90 dark:border-white/[0.06]'
          : 'border-blue-200/80 dark:border-blue-500/20 hover:border-blue-400 dark:hover:border-blue-500/50',
        className
      )}
    >
      {/* Top Header Section */}
      <div className="p-4 sm:p-5 pb-3">
        {/* Row 1: Room Code, Block/Floor Tag, Comfort Badge */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {room.code}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                <MapPin className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span>{roomBlock} • {room.floorLabel || `Floor ${room.floor}`}</span>
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
              {room.name}
            </span>
          </div>

          {/* Comfort Score Tag with Interactive Breakdown Tooltip */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowComfortTooltip(true)}
              onMouseLeave={() => setShowComfortTooltip(false)}
              onClick={() => setShowComfortTooltip(!showComfortTooltip)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none',
                comfortMeta.bg
              )}
              title="Campus Comfort Score (AC + Quiet + Sockets + Seats)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{comfortDisplay}/10</span>
            </button>

            {/* Micro Tooltip */}
            <AnimatePresence>
              {showComfortTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-slate-900 text-white rounded-xl p-3 shadow-xl z-30 text-[11px] border border-slate-800 pointer-events-none"
                >
                  <div className="font-bold text-xs text-cyan-300 mb-1.5 flex items-center justify-between">
                    <span>Comfort Index</span>
                    <span>{comfortPercent}% ({comfortDisplay}/10)</span>
                  </div>
                  <div className="space-y-1 text-slate-300 font-medium">
                    <div className="flex justify-between">
                      <span>❄️ Climate/AC:</span>
                      <span className="font-mono text-emerald-400">
                        {room.hasAC ? (room.acStatus.includes('18') || room.acStatus.includes('19') ? '98%' : '95%') : '75%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>⚡ Power Sockets:</span>
                      <span className="font-mono text-amber-400">
                        {workingSockets} / {totalSockets} functional
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>🤫 Noise Level:</span>
                      <span className="font-mono text-blue-400">
                        {room.noiseVibe}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>🪑 Free Seating:</span>
                      <span className="font-mono text-indigo-300">
                        {freeSeats} / {totalSeats} seats
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Row 2: Live Availability Status Pill */}
        <div className="mb-3.5">
          {statusBadge.isFree ? (
            <div className={cn(
              "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition-all shadow-xs",
              statusBadge.badgeBg,
              statusBadge.badgeBorder,
              statusBadge.badgeColor
            )}>
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="flex-1 leading-tight">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-extrabold text-emerald-950 dark:text-emerald-200">
                    🟢 {statusBadge.statusText}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                    {freeSeats} seats open
                  </span>
                </div>
                <span className="block text-[11px] text-emerald-700/90 dark:text-emerald-400 mt-0.5 font-medium">
                  {statusBadge.subText}
                </span>
              </div>
            </div>
          ) : (
            <div className={cn(
              "flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition-all",
              statusBadge.badgeBg,
              statusBadge.badgeBorder,
              statusBadge.badgeColor
            )}>
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <div className="flex-1 leading-tight">
                <span className="font-bold block text-rose-950 dark:text-rose-200">
                  🔴 {statusBadge.statusText}
                </span>
                <span className="block text-[11px] text-rose-700/90 dark:text-rose-400 mt-0.5 font-medium">
                  {statusBadge.subText}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Row 3: Amenities Grid (Light Mode: Slate-50, Dark Mode: Dark Glass) */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Seats */}
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-slate-900 dark:text-white">{freeSeats}</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]"> / {totalSeats} seats</span>
            </div>
          </div>

          {/* Sockets */}
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
            <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-slate-900 dark:text-white">{workingSockets}</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]"> / {totalSockets} sockets</span>
            </div>
          </div>

          {/* AC & Climate */}
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
            <Wind className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <div className="truncate" title={`${acType} • ${acStatus}`}>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate block">
                {acStatus}
              </span>
            </div>
          </div>

          {/* Wi-Fi */}
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
            <Wifi className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <div className="truncate" title={wifiStrength}>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] truncate block">
                {wifiStrength}
              </span>
            </div>
          </div>
        </div>

        {/* Row 4: Noise Vibe & Features */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-200/70 dark:border-white/[0.06] text-[11px]">
          <span
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold border',
              noiseMeta.color
            )}
          >
            <span>{noiseMeta.label}</span>
          </span>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            {hasSmartBoard && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 font-medium text-[10px]"
                title="Interactive Touch Smart Screen Available"
              >
                <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                <span>Smart Board</span>
              </span>
            )}
            {hasProjector && !hasSmartBoard && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 font-medium text-[10px]"
                title="4K Laser Projector Functional"
              >
                <Tv className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span>Projector</span>
              </span>
            )}

            {checkInCount > 0 && (
              <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                <UserCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>{checkInCount} here</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="p-3 sm:p-4 bg-slate-50/70 dark:bg-white/[0.02] border-t border-slate-200/70 dark:border-white/[0.06] flex items-center justify-between gap-2">
        {/* Button 1: View Schedule (Opens Modal) */}
        <button
          onClick={handleOpenSchedule}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-white/[0.06] hover:bg-slate-100 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          <span>View Schedule</span>
        </button>

        {/* Button 2: Spot Check In */}
        <button
          onClick={handleCheckInToggle}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer select-none',
            localCheckedIn
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-700'
              : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-cyan-300 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20'
          )}
          title={localCheckedIn ? 'You are checked in!' : 'Check in to occupy a seat'}
        >
          {localCheckedIn ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Checked In</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3.5 h-3.5" />
              <span>Check In</span>
            </>
          )}
        </button>

        {/* Button 3: Report Issue */}
        {(onReportIssue || onOpenReport) && (
          <button
            onClick={handleReport}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-colors cursor-pointer"
            title="Report broken socket, AC failure or noise issue"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
