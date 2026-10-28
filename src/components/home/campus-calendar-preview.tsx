'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  DoorOpen,
  ArrowRight,
  Snowflake,
  Plug,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { WeeklyTimetableSummary } from '@/lib/campus-dataset';

interface CampusCalendarPreviewProps {
  weeklySummary: WeeklyTimetableSummary;
  initialDay?: number;
  initialPeriod?: number;
}

const SUPPORTED_DAYS = [
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
] as const;

const PERIODS = [
  { value: 1, label: 'P1', time: '8:45–9:45' },
  { value: 2, label: 'P2', time: '9:45–10:45' },
  { value: 3, label: 'P3', time: '11:00–12:00' },
  { value: 4, label: 'P4', time: '12:00–1:00' },
  { value: 5, label: 'P5', time: '1:00–1:50' },
  { value: 6, label: 'P6', time: '1:50–2:50' },
  { value: 7, label: 'P7', time: '2:50–3:50' },
] as const;

export function CampusCalendarPreview({
  weeklySummary,
  initialDay,
  initialPeriod,
}: CampusCalendarPreviewProps) {
  // Check if today is Sunday (JS getDay() === 0)
  const isSunday = typeof window !== 'undefined' ? new Date().getDay() === 0 : false;

  // Determine initial day: 1-6 (Mon-Sat); if Sunday, default to Monday (1)
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    if (initialDay && initialDay >= 1 && initialDay <= 6) return initialDay;
    if (typeof window !== 'undefined') {
      const jsDay = new Date().getDay();
      return jsDay === 0 ? 1 : jsDay;
    }
    return 1;
  });

  const [selectedPeriod, setSelectedPeriod] = useState<number>(() => {
    if (initialPeriod && initialPeriod >= 1 && initialPeriod <= 7) return initialPeriod;
    return 1;
  });

  // Current slot data from real weekly schedule
  const currentSlot = useMemo(() => {
    const dayData = weeklySummary[selectedDay];
    if (dayData && dayData[selectedPeriod]) {
      return dayData[selectedPeriod];
    }
    // Fallback if data missing
    return {
      dayNumber: selectedDay,
      dayLabel: SUPPORTED_DAYS.find((d) => d.value === selectedDay)?.label ?? 'Mon',
      dayFullLabel: SUPPORTED_DAYS.find((d) => d.value === selectedDay)?.fullLabel ?? 'Monday',
      periodNumber: selectedPeriod,
      periodLabel: `P${selectedPeriod}`,
      periodTime: PERIODS.find((p) => p.value === selectedPeriod)?.time ?? '',
      totalRooms: 63,
      freeCount: 0,
      busyCount: 63,
      freeRooms: [],
      occupiedSessions: [],
    };
  }, [weeklySummary, selectedDay, selectedPeriod]);

  return (
    <div className="space-y-4">
      {/* Sunday Notification Banner */}
      {isSunday && (
        <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>No regular timetable scheduled today (Sunday).</strong> Select Monday through Saturday below to view scheduled classroom availability.
          </span>
        </div>
      )}

      {/* Weekday Selector Strip (Mon - Sat only, 6 supported days) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-tertiary">
            Select Weekday (Monday – Saturday)
          </span>
          <span className="font-mono text-[11px] text-ink-secondary">
            {currentSlot.dayFullLabel}
          </span>
        </div>

        <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
          {SUPPORTED_DAYS.map((day) => {
            const active = selectedDay === day.value;
            // Get day total free rooms for currently selected period
            const daySlot = weeklySummary[day.value]?.[selectedPeriod];
            const freeCountForDay = daySlot?.freeCount ?? 0;

            return (
              <button
                key={day.value}
                type="button"
                onClick={() => setSelectedDay(day.value)}
                className={`flex flex-col items-center justify-center rounded-md border py-2 px-1 text-center transition-all ${
                  active
                    ? 'border-[#1B4332] bg-[#E8EFEA] text-[#1B4332] shadow-sm dark:border-[#52B788] dark:bg-[#2D6A4F]/25 dark:text-[#74C69D]'
                    : 'border-line bg-surface text-ink hover:bg-surface-sunken dark:border-white/[0.08] dark:bg-[#1A1918]'
                }`}
              >
                <span className="font-mono text-xs font-bold">{day.label}</span>
                <span className="text-[10px] text-ink-secondary mt-0.5 font-mono">
                  {freeCountForDay} free
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Period Selector Strip (P1 – P7) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-tertiary">
            Timetable Period (P1 – P7)
          </span>
          <span className="font-mono text-[11px] text-ink-secondary">
            {currentSlot.periodLabel} ({currentSlot.periodTime})
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {PERIODS.map((period) => {
            const active = selectedPeriod === period.value;
            const slot = weeklySummary[selectedDay]?.[period.value];
            const freeCount = slot?.freeCount ?? 0;

            return (
              <button
                key={period.value}
                type="button"
                onClick={() => setSelectedPeriod(period.value)}
                className={`flex flex-col items-center justify-center rounded-md border py-2 px-0.5 text-center transition-all ${
                  active
                    ? 'border-[#1B4332] bg-[#1B4332] text-white shadow-sm dark:bg-[#2D6A4F] dark:border-[#52B788]'
                    : 'border-line bg-surface text-ink hover:bg-surface-sunken dark:border-white/[0.08] dark:bg-[#1A1918]'
                }`}
              >
                <span className="font-mono text-xs font-bold">{period.label}</span>
                <span
                  className={`text-[9px] font-mono leading-tight mt-0.5 ${
                    active ? 'text-white/80' : 'text-ink-secondary'
                  }`}
                >
                  {period.time.split('–')[0]}
                </span>
                <span
                  className={`text-[9px] font-mono mt-0.5 ${
                    active ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {freeCount}f
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day & Period Results Card */}
      <div className="rounded-lg border border-line bg-surface p-4 space-y-4 dark:border-white/[0.08] dark:bg-[#1A1918]">
        {/* Availability Count Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-ink">
                {currentSlot.dayFullLabel} · {currentSlot.periodLabel} ({currentSlot.periodTime})
              </span>
              <Badge variant="pastelMint">
                {currentSlot.freeCount} Classrooms Free
              </Badge>
            </div>
            <p className="mt-1 text-xs text-ink-secondary">
              Out of 63 regular classrooms, {currentSlot.freeCount} are scheduled free and {currentSlot.busyCount} are in session.
            </p>
          </div>

          <Link
            href={`/spaces?day=${selectedDay}&period=${selectedPeriod}&status=free`}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#1B4332] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#143326] dark:bg-[#2D6A4F] dark:hover:bg-[#40916C] self-start sm:self-auto"
          >
            <span>View Free Rooms</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Free Classrooms Quick List */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-secondary uppercase tracking-wider mb-2">
            <span>Free Classrooms ({currentSlot.freeRooms.length})</span>
            <span className="text-[10px] text-ink-tertiary">63 Regular Classrooms Inventory</span>
          </div>

          {currentSlot.freeRooms.length === 0 ? (
            <div className="rounded border border-line/60 bg-surface-sunken p-3 text-center text-xs text-ink-secondary">
              No regular classrooms scheduled free during {currentSlot.periodLabel} on {currentSlot.dayFullLabel}.
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {currentSlot.freeRooms.map((room) => (
                <Link
                  key={room.code}
                  href={`/spaces/${room.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#C6E2CF] bg-[#EAF5EE] px-2 py-1 text-xs font-medium text-[#1B4332] transition-colors hover:bg-[#D8EDE0] dark:border-[#2D6A4F]/40 dark:bg-[#2D6A4F]/20 dark:text-[#74C69D]"
                >
                  <span className="font-mono font-bold">{room.code}</span>
                  <span className="text-[10px] text-[#1B4332]/70 dark:text-[#74C69D]/70">Fl.{room.floor_level}</span>
                  {room.has_ac && <Snowflake className="h-2.5 w-2.5 text-sky-600" />}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sample Scheduled Sessions Occupying Classrooms */}
        {currentSlot.occupiedSessions.length > 0 && (
          <div className="pt-2 border-t border-line/60">
            <span className="text-[11px] font-mono text-ink-secondary uppercase tracking-wider block mb-2">
              Sample Scheduled Sessions in Session ({currentSlot.occupiedSessions.length} total)
            </span>
            <div className="grid gap-1 sm:grid-cols-2 text-xs">
              {currentSlot.occupiedSessions.slice(0, 4).map((session, idx) => (
                <div
                  key={idx}
                  className="rounded border border-line/60 bg-surface-sunken/60 px-2 py-1.5 flex items-center justify-between gap-2"
                >
                  <span className="font-mono font-semibold text-ink shrink-0">{session.roomCode}</span>
                  <span className="text-ink-secondary truncate text-[11px]" title={session.label}>
                    {session.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
