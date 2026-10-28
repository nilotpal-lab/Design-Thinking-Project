'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, MapPin, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CalendarEvent {
  id: string;
  date: number; // day of month
  dayName: string;
  title: string;
  time: string;
  location: string;
  category: 'Academic' | 'Tech' | 'Workshop' | 'Exam';
  description: string;
}

const EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    date: 28,
    dayName: 'Wed',
    title: 'Design Thinking Prototype Review & User Testing',
    time: '11:00 AM – 1:00 PM',
    location: 'Room 301 · 3rd Floor [AC]',
    category: 'Academic',
    description: 'CA1 working sessions and peer heuristic critique for campus solutions.',
  },
  {
    id: 'e2',
    date: 29,
    dayName: 'Thu',
    title: 'Cloud Computing & Microservices Lab Exam',
    time: '08:45 AM – 10:45 AM',
    location: 'Computer Lab 214',
    category: 'Exam',
    description: 'Mid-term practical evaluation for Batch A and Batch B.',
  },
  {
    id: 'e3',
    date: 30,
    dayName: 'Fri',
    title: 'Student Developer Club: Full-Stack Next.js 16 Workshop',
    time: '01:50 PM – 03:50 PM',
    location: 'Seminar Hall A · 1st Floor',
    category: 'Workshop',
    description: 'Hands-on session on App Router, Turbopack, and server actions.',
  },
  {
    id: 'e4',
    date: 31,
    dayName: 'Sat',
    title: 'Autonomous Robotics Society Demo & Track Setup',
    time: '10:00 AM – 12:00 PM',
    location: 'Ground Floor Innovation Foyer',
    category: 'Tech',
    description: 'Testing obstacle detection and line follower prototypes.',
  },
  {
    id: 'e5',
    date: 2,
    dayName: 'Mon',
    title: 'Database Systems Architecture Lecture & Query Tuning',
    time: '09:45 AM – 10:45 AM',
    location: 'Room 203 · 2nd Floor [AC]',
    category: 'Academic',
    description: 'Postgres index structures and execution plan analysis.',
  },
];

export function CampusCalendarPreview() {
  const [selectedDate, setSelectedDate] = useState<number>(28);

  const selectedEvent = EVENTS.find((e) => e.date === selectedDate) || EVENTS[0];

  const getCategoryBadgeVariant = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'Academic':
        return 'pastelSky';
      case 'Tech':
        return 'pastelMint';
      case 'Workshop':
        return 'pastelButter';
      case 'Exam':
        return 'pastelCoral';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="campus-card overflow-hidden">
      {/* Top Banner / Bar */}
      <div className="flex flex-col gap-3 border-b border-line bg-surface-sunken/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1B4332] text-white dark:bg-[#2D6A4F]">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink tracking-tight">CAMPUS SCHEDULE & TIMETABLE</h3>
            <p className="text-[11px] text-ink-secondary">Official Fall 2026 Academic Term · Active Periods P1–P7</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:underline dark:text-[#74C69D]"
          >
            <span>Full Semester Calendar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-line">
        {/* Left Column: Date Selector Bar */}
        <div className="lg:col-span-5 p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-ink">
            <span>October 2026</span>
            <span className="font-mono text-[11px] text-ink-tertiary">Week 9</span>
          </div>

          {/* Days Strip */}
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { d: 28, name: 'Wed' },
              { d: 29, name: 'Thu' },
              { d: 30, name: 'Fri' },
              { d: 31, name: 'Sat' },
              { d: 2, name: 'Mon' },
            ].map((day) => {
              const active = selectedDate === day.d;
              const hasEv = EVENTS.some((e) => e.date === day.d);
              return (
                <button
                  key={day.d}
                  type="button"
                  onClick={() => setSelectedDate(day.d)}
                  className={`flex flex-col items-center justify-center rounded-md border p-2.5 text-center transition-all ${
                    active
                      ? 'border-[#1B4332] bg-[#E8EFEA] text-[#1B4332] font-bold shadow-sm dark:border-[#52B788] dark:bg-[#2D6A4F]/25 dark:text-[#74C69D]'
                      : 'border-line bg-surface text-ink hover:bg-surface-sunken dark:border-white/[0.08] dark:bg-[#1A1918]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono text-ink-secondary">{day.name}</span>
                  <span className="text-base font-bold tracking-tight mt-0.5">{day.d}</span>
                  {hasEv && (
                    <span
                      className={`mt-1 h-1 w-1 rounded-full ${
                        active ? 'bg-[#1B4332] dark:bg-[#52B788]' : 'bg-emerald-500'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Timetable Period Scheme Pill Bar */}
          <div className="rounded-md border border-line bg-surface p-2.5 space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-tertiary">
              Standard Daily Period Timings
            </span>
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-ink-secondary">
              <div className="rounded bg-surface-sunken p-1">P1<br/><span className="text-[8px] text-ink-tertiary">8:45</span></div>
              <div className="rounded bg-surface-sunken p-1">P2<br/><span className="text-[8px] text-ink-tertiary">9:45</span></div>
              <div className="rounded bg-surface-sunken p-1">P3<br/><span className="text-[8px] text-ink-tertiary">11:00</span></div>
              <div className="rounded bg-surface-sunken p-1">P4<br/><span className="text-[8px] text-ink-tertiary">12:00</span></div>
              <div className="rounded bg-surface-sunken p-1">P5<br/><span className="text-[8px] text-ink-tertiary">1:00</span></div>
              <div className="rounded bg-surface-sunken p-1">P6<br/><span className="text-[8px] text-ink-tertiary">1:50</span></div>
              <div className="rounded bg-surface-sunken p-1">P7<br/><span className="text-[8px] text-ink-tertiary">2:50</span></div>
            </div>
          </div>
        </div>

        {/* Right Column: Event Details for Selected Day */}
        <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={getCategoryBadgeVariant(selectedEvent.category)}>
                  {selectedEvent.category}
                </Badge>
                <span className="font-mono text-xs font-semibold text-ink">
                  {selectedEvent.dayName}, Oct {selectedEvent.date}
                </span>
              </div>
              <span className="text-[11px] font-mono text-ink-tertiary">Verified Academic Schedule</span>
            </div>

            <h4 className="text-base font-bold text-ink sm:text-lg">
              {selectedEvent.title}
            </h4>

            <p className="text-xs text-ink-secondary leading-relaxed">
              {selectedEvent.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-1 text-xs text-ink-secondary">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-ink-tertiary" />
                <span className="font-mono">{selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-ink-tertiary" />
                <span>{selectedEvent.location}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-line/60 flex items-center justify-between">
            <span className="text-[11px] text-ink-tertiary">2,646 slots mapped to room availability</span>
            <Link
              href="/spaces"
              className="text-xs font-semibold text-[#1B4332] hover:underline dark:text-[#74C69D] inline-flex items-center gap-1"
            >
              <span>Check room availability for this day</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
