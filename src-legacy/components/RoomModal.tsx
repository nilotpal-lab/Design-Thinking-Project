'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Zap,
  Wind,
  Wifi,
  Tv,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Navigation,
  Copy,
  Check,
  ShieldCheck,
  Users,
  Volume2,
  Sparkles,
  Layers,
  Share2,
  BookOpen,
} from 'lucide-react';
import { Room, ScheduleSlot, RoomAmenities } from '@/types/campus';
import { formatMinutesToTime, parseTimeToMinutes, cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

export interface RoomModalProps {
  room: Room | null;
  isOpen?: boolean;
  onClose: () => void;
  currentTime?: string;
  currentSimulatedMinutes?: number;
  onCheckIn?: (room: any) => void;
  onReportIssue?: (room?: any) => void;
  onOpenReport?: (room?: any) => void;
  isCheckedIn?: boolean;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  room,
  isOpen = true,
  onClose,
  currentTime,
  currentSimulatedMinutes = 576, // 09:36 AM default
  onCheckIn,
  onReportIssue,
  onOpenReport,
  isCheckedIn = false,
}) => {
  const [copiedDirections, setCopiedDirections] = useState(false);
  const [localCheckedIn, setLocalCheckedIn] = useState(isCheckedIn);
  const [checkInCount, setCheckInCount] = useState(room?.liveCheckIns || 0);

  // Sync state when room changes
  useEffect(() => {
    if (room) {
      setLocalCheckedIn(isCheckedIn);
      setCheckInCount(room.liveCheckIns || 0);
    }
  }, [room, isCheckedIn]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (isOpen && room)) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, room, onClose]);

  if (!isOpen || !room) return null;

  const amenityObj: RoomAmenities | undefined =
    room.amenities && typeof room.amenities === 'object' && !Array.isArray(room.amenities)
      ? (room.amenities as RoomAmenities)
      : undefined;

  // Safe data extraction
  const roomBlock = room.block || 'Block A - Tech Tower';
  const totalSeats = room.capacity ?? room.seatsTotal ?? 60;
  const availableSeats =
    room.seatsAvailable ??
    (room.seatsTotal !== undefined && room.seatsOccupied !== undefined
      ? Math.max(0, room.seatsTotal - room.seatsOccupied)
      : Math.round(totalSeats * 0.45));

  const totalSockets =
    room.socketCount ?? room.totalSockets ?? amenityObj?.powerSockets ?? 18;
  const workingSockets =
    room.workingSockets ??
    room.chargingPoints ??
    amenityObj?.availableSockets ??
    Math.min(totalSockets, 14);

  const rawComfort = room.comfortScore ?? (room.rating ? Math.round(room.rating * 20) : 92);
  const comfortScore = Math.min(100, Math.max(10, Math.round(rawComfort)));

  const acStatusStr =
    room.acStatus ??
    (amenityObj?.acTemperature
      ? `${amenityObj.acTemperature}°C Optimal`
      : room.hasAC || amenityObj?.hasAC
      ? '21°C Optimal'
      : 'Fan Cooled');

  const wifiSpeedStr =
    room.wifiSpeed ??
    (amenityObj?.wifiSpeedMbps
      ? `${amenityObj.wifiSpeedMbps} Mbps JU-5G`
      : '350 Mbps JU-5G');

  const isOccupied =
    room.isOccupied ?? (room.status === 'busy' || room.status === 'occupied');

  const activeMinutes = currentTime
    ? parseTimeToMinutes(currentTime)
    : currentSimulatedMinutes;

  const roomSchedule: ScheduleSlot[] =
    room.schedule ||
    room.todaySchedule || [
      {
        id: 'slot-1',
        startTime: '08:30',
        endTime: '10:00',
        timeSlot: '08:30 - 10:00 AM',
        status: 'occupied',
        title: 'Design Thinking & Innovation Lecture',
        instructor: 'Dr. Priya Sundaram',
        department: 'FET Computer Science',
      },
      {
        id: 'slot-2',
        startTime: '10:00',
        endTime: '10:30',
        timeSlot: '10:00 - 10:30 AM',
        status: 'break',
        title: 'Campus Tea & Discussion Break',
      },
      {
        id: 'slot-3',
        startTime: '10:30',
        endTime: '13:00',
        timeSlot: '10:30 - 01:00 PM',
        status: 'free',
        title: 'Open Self-Study & Group Project Sprint',
      },
      {
        id: 'slot-4',
        startTime: '13:00',
        endTime: '14:00',
        timeSlot: '01:00 - 02:00 PM',
        status: 'break',
        title: 'Lunch Hour & Walk-in Access',
      },
      {
        id: 'slot-5',
        startTime: '14:00',
        endTime: '15:30',
        timeSlot: '02:00 - 03:30 PM',
        status: 'occupied',
        title: 'Advanced Data Structures & Algorithms Lab',
        instructor: 'Prof. Ramesh K.',
        department: 'B.Tech CSE 3rd Sem',
      },
      {
        id: 'slot-6',
        startTime: '15:30',
        endTime: '17:30',
        timeSlot: '03:30 - 05:30 PM',
        status: 'free',
        title: 'Open Prototype & Brainstorming Hours',
      },
    ];

  const directionsText =
    room.directions ||
    room.directionsHint ||
    `Take the main elevators to Floor ${room.floor} in ${roomBlock}. Room ${room.code} is situated next to the Faculty Lounge in the West Wing.`;

  const handleCopyDirections = () => {
    navigator.clipboard.writeText(
      `Directions to ${room.code} (${room.name}, ${roomBlock}): ${directionsText}`
    );
    setCopiedDirections(true);
    setTimeout(() => setCopiedDirections(false), 2500);
  };

  const handleReport = () => {
    if (onReportIssue) {
      onReportIssue(room);
    } else if (onOpenReport) {
      onOpenReport(room);
    }
  };

  const handleCheckInToggle = () => {
    const nextState = !localCheckedIn;
    setLocalCheckedIn(nextState);
    setCheckInCount((prev: number) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    if (nextState) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#0c85eb', '#10b981', '#f59e0b', '#8b5cf6'],
        });
      } catch (e) {
        // Confetti fallback
      }
    }

    if (onCheckIn) {
      onCheckIn(room);
    }
  };

  // Helper to determine if slot matches current time
  const isSlotCurrent = (slot: ScheduleSlot): boolean => {
    const startMins = parseTimeToMinutes(slot.startTime);
    const endMins = parseTimeToMinutes(slot.endTime);
    return activeMinutes >= startMins && activeMinutes < endMins;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-10"
        >
          {/* Modal Header */}
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 pb-5">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-8">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                    Room {room.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {roomBlock} • Floor {room.floor}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {comfortScore}% Comfort Index
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-semibold text-slate-300">
                  {room.name}
                </h2>
              </div>

              {/* Status Badge */}
              <div>
                {isOccupied ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span>Occupied Now</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Open for Study</span>
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar inside Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>
                  <strong className="text-white">{availableSeats}</strong>
                  <span className="text-slate-400">/{totalSeats} Seats</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>
                  <strong className="text-white">{workingSockets}</strong>
                  <span className="text-slate-400"> Sockets Ready</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span className="truncate text-slate-300" title={room.acType || acStatusStr}>
                  {acStatusStr}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">{wifiSpeedStr.split(' ')[0]} Mbps</span>
              </div>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Section 1: Complete 8:30 - 17:30 Day Schedule Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Full Day Schedule & Availability Timeline
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  8:30 AM – 5:30 PM (FET Timetable)
                </span>
              </div>

              {/* Schedule List */}
              <div className="space-y-2">
                {roomSchedule.map((slot) => {
                  const isCurrent = isSlotCurrent(slot);
                  const isFree =
                    slot.status === 'free' ||
                    slot.type === 'free' ||
                    slot.type === 'study' ||
                    slot.isOccupied === false;
                  const isBreak = slot.status === 'break';
                  const isReserved = slot.status === 'reserved';

                  return (
                    <div
                      key={slot.id}
                      className={cn(
                        'p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2',
                        isCurrent
                          ? 'ring-2 ring-blue-500 shadow-md bg-blue-50/60 border-blue-300'
                          : isFree
                          ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                          : isBreak
                          ? 'bg-amber-50/40 border-amber-200'
                          : isReserved
                          ? 'bg-purple-50/40 border-purple-200'
                          : 'bg-slate-50 border-slate-200'
                      )}
                    >
                      {/* Time & Current Pill */}
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {slot.timeSlot || `${slot.startTime} - ${slot.endTime}`}
                          </span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-700 uppercase tracking-wider mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                              Active Now ({formatMinutesToTime(activeMinutes)})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Class / Activity Title & Instructor */}
                      <div className="flex-1 sm:px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {slot.title}
                          </span>
                        </div>
                        {(slot.instructor || slot.faculty) && (
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {slot.instructor || slot.faculty}{' '}
                            {(slot.department || slot.batch) &&
                              `• ${slot.department || slot.batch}`}
                          </div>
                        )}
                      </div>

                      {/* Status Pill */}
                      <div>
                        {isFree ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Free / Open Walk-in</span>
                          </span>
                        ) : isBreak ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <span>Tea / Lunch Break</span>
                          </span>
                        ) : isReserved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                            <span>Reserved Event</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <span>Class in Session</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Infrastructure Inspection Checklist */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Infrastructure & Comfort Inspection
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                  Verified: {room.infrastructureChecklist?.lastInspectedTime || 'Today, 08:15 AM'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Sockets */}
                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Power & Charging</div>
                    <div className="text-slate-600 font-medium mt-0.5">
                      {room.infrastructureChecklist?.socketsDetail ||
                        `${workingSockets}/${totalSockets} Sockets verified working.`}
                    </div>
                  </div>
                </div>

                {/* AC Climate */}
                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                  <Wind className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Air Conditioning & Airflow</div>
                    <div className="text-slate-600 font-medium mt-0.5">
                      {room.infrastructureChecklist?.acDetail ||
                        `${room.acType || 'Dual AC System'} running at ${acStatusStr}.`}
                    </div>
                  </div>
                </div>

                {/* Smart Projector */}
                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                  <Tv className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Smart Display & AV</div>
                    <div className="text-slate-600 font-medium mt-0.5">
                      {room.infrastructureChecklist?.projectorDetail ||
                        (room.projector || room.hasProjector || amenityObj?.hasProjector
                          ? 'Epson 4K Laser Display with HDMI & Wireless casting active.'
                          : 'Standard whiteboard & podium mic installed.')}
                    </div>
                  </div>
                </div>

                {/* Hygiene & Seating */}
                <div className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-900">Cleanliness & Readiness</div>
                    <div className="text-slate-600 font-medium mt-0.5">
                      {room.infrastructureChecklist?.cleanliness ||
                        'Sanitized 40m ago by Floor Housekeeping.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Directions & Wayfinding */}
            <div className="bg-blue-50/50 rounded-2xl p-4 sm:p-5 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Directions & Campus Wayfinding
                  </h3>
                </div>

                <button
                  onClick={handleCopyDirections}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                >
                  {copiedDirections ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Route</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {directionsText}
              </p>

              {room.landmarks && room.landmarks.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {room.landmarks.map((landmark: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white text-slate-700 border border-blue-200 shadow-2xs"
                    >
                      📍 {landmark}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer Bar */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">
                👥 {checkInCount} student{checkInCount === 1 ? '' : 's'} currently study here
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Report Issue Button */}
              {(onReportIssue || onOpenReport) && (
                <button
                  onClick={handleReport}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report Issue</span>
                </button>
              )}

              {/* Spot Check-In CTA */}
              <button
                onClick={handleCheckInToggle}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer select-none',
                  localCheckedIn
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                )}
              >
                {localCheckedIn ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Checked In • Release Seat</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Spot Check-In (I&apos;m Here)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
