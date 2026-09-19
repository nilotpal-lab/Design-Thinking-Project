'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Zap, 
  Wind, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Clock, 
  ThumbsUp, 
  ShieldAlert,
  Send,
  Radio
} from 'lucide-react';
import { Room } from '@/data/rooms';

interface CrowdCheckInProps {
  rooms: Room[];
  onOpenReportModal?: (room?: Room) => void;
  onReportIssue?: (room?: Room) => void;
}

interface CheckInRecord {
  id: string;
  roomCode: string;
  crowd: 'Empty' | 'Moderate' | 'Crowded';
  socketStatus: 'Abundant Power' | 'Few Sockets' | 'All Sockets Full';
  acStatus: 'Chilled (20°C)' | 'Comfortable' | 'Warm';
  timeAgo: string;
  studentBatch: string;
}

export const CrowdCheckIn: React.FC<CrowdCheckInProps> = ({
  rooms,
  onOpenReportModal,
  onReportIssue,
}) => {
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>('318B');
  const [crowdLevel, setCrowdLevel] = useState<'Empty' | 'Moderate' | 'Crowded'>('Moderate');
  const [socketStatus, setSocketStatus] = useState<'Abundant Power' | 'Few Sockets' | 'All Sockets Full'>('Abundant Power');
  const [acStatus, setAcStatus] = useState<'Chilled (20°C)' | 'Comfortable' | 'Warm'>('Comfortable');
  const [submitted, setSubmitted] = useState(false);

  const [feed, setFeed] = useState<CheckInRecord[]>([
    {
      id: '1',
      roomCode: '318B',
      crowd: 'Moderate',
      socketStatus: 'Abundant Power',
      acStatus: 'Chilled (20°C)',
      timeAgo: '4 mins ago',
      studentBatch: '3rd Sem CSE (Sec A)',
    },
    {
      id: '2',
      roomCode: '121 A',
      crowd: 'Empty',
      socketStatus: 'Abundant Power',
      acStatus: 'Comfortable',
      timeAgo: '12 mins ago',
      studentBatch: '3rd Sem IS',
    },
    {
      id: '3',
      roomCode: '201',
      crowd: 'Empty',
      socketStatus: 'Abundant Power',
      acStatus: 'Chilled (20°C)',
      timeAgo: '24 mins ago',
      studentBatch: 'Design Thinking Team 4',
    },
    {
      id: '4',
      roomCode: '402',
      crowd: 'Moderate',
      socketStatus: 'Few Sockets',
      acStatus: 'Comfortable',
      timeAgo: '38 mins ago',
      studentBatch: '3rd Sem ECE',
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: CheckInRecord = {
      id: Date.now().toString(),
      roomCode: selectedRoomCode,
      crowd: crowdLevel,
      socketStatus: socketStatus,
      acStatus: acStatus,
      timeAgo: 'Just now',
      studentBatch: 'Verified Student (You)',
    };
    setFeed([newRecord, ...feed]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Live Student Telemetry & Crowd Meter
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Crowdsourced by Jain University students in real-time. Check in from your seat to keep campus space data accurate.
            </p>
          </div>

          <button
            onClick={() => {
              if (onReportIssue) onReportIssue();
              else if (onOpenReportModal) onOpenReportModal();
            }}
            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-2 self-start md:self-auto"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Report Infrastructure Issue</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Check-In Widget */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Broadcast Your Room Check-In
            </h3>
          </div>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Check-in Broadcasted Successfully!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Thank you for contributing to the Jain University space telemetry system.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Room */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  1. Which Room Are You In?
                </label>
                <select
                  value={selectedRoomCode}
                  onChange={(e) => setSelectedRoomCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.code}>
                      Room {r.code} ({r.block} • {r.floorLabel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Crowd Density */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  2. Current Seating / Crowd Density
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Empty', label: 'Empty (<15%)', color: 'text-emerald-500' },
                    { id: 'Moderate', label: 'Moderate', color: 'text-blue-500' },
                    { id: 'Crowded', label: 'Packed', color: 'text-rose-500' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCrowdLevel(lvl.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        crowdLevel === lvl.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Power Socket Status */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  3. Charging Socket Availability
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Abundant Power', label: 'Free Sockets' },
                    { id: 'Few Sockets', label: 'Few Left' },
                    { id: 'All Sockets Full', label: 'All Full' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSocketStatus(s.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        socketStatus === s.id
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AC Comfort */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  4. AC / Temperature Feeling
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Chilled (20°C)', label: '❄️ Chilled' },
                    { id: 'Comfortable', label: '🍃 Ideal' },
                    { id: 'Warm', label: '☀️ Warm' },
                  ].map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAcStatus(a.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all ${
                        acStatus === a.id
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Live Check-In</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Feed: Real-time Campus Check-Ins */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Real-Time Student Activity Feed
                </h3>
              </div>
              <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Auto-refreshing
              </span>
            </div>

            <div className="space-y-3">
              {feed.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-blue-600/30 shrink-0">
                      {item.roomCode}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Room {item.roomCode}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          by {item.studentBatch}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                        <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {item.crowd}
                        </span>
                        <span className="bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {item.socketStatus}
                        </span>
                        <span className="bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                          <Wind className="w-3 h-3" />
                          {item.acStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {item.timeAgo}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-500">
            <span>Verified against Jain University campus network</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">9 Active Check-ins Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
