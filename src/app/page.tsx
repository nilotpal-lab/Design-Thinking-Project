import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Clock,
  DoorOpen,
  MapPin,
  Users,
  AlertCircle,
  ShoppingBag,
  Snowflake,
  Plug,
} from 'lucide-react';

import { SharedHeader } from '@/components/app/shared-header';
import { CampusSearch } from '@/components/home/campus-search';
import { CampusCalendarPreview } from '@/components/home/campus-calendar-preview';
import { Badge } from '@/components/ui/badge';
import { getLiveRooms, getCurrentCampusDayAndPeriod } from '@/server/queries/rooms';
import { getWeeklyTimetableSummary } from '@/lib/campus-dataset';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const current = getCurrentCampusDayAndPeriod();
  const rooms = await getLiveRooms();
  const weeklySummary = getWeeklyTimetableSummary();

  const UPCOMING_EVENTS = [
    {
      id: 'ev-1',
      dateMonth: 'NOV',
      dateDay: '04',
      category: 'Academic' as const,
      categoryBadge: 'pastelSky' as const,
      title: 'Design Thinking CA1 Demo Day & Project Showcase',
      time: '10:00 AM – 1:00 PM',
      location: 'Room 301 · 3rd Floor [AC]',
      description: 'Student prototype demonstrations solving campus comfort and resource allocation.',
    },
    {
      id: 'ev-2',
      dateMonth: 'NOV',
      dateDay: '12',
      category: 'Tech Fest' as const,
      categoryBadge: 'pastelMint' as const,
      title: 'Jain University 36-Hour Hackathon 2026',
      time: '09:00 AM Kickoff',
      location: 'Central Auditorium',
      description: 'Collaborative development sprint focused on smart campus automation and developer tools.',
    },
    {
      id: 'ev-3',
      dateMonth: 'NOV',
      dateDay: '18',
      category: 'Keynote' as const,
      categoryBadge: 'pastelButter' as const,
      title: 'Industry Keynote: High-Performance Distributed Systems',
      time: '02:00 PM – 04:00 PM',
      location: 'Room 201 · 2nd Floor [AC]',
      description: 'Case studies on low-latency infrastructure, distributed databases, and cloud scaling.',
    },
    {
      id: 'ev-4',
      dateMonth: 'NOV',
      dateDay: '25',
      category: 'Cultural' as const,
      categoryBadge: 'pastelLavender' as const,
      title: 'Annual Inter-College Cultural Auditions & Setup',
      time: '03:30 PM – 06:30 PM',
      location: 'Open Amphitheatre',
      description: 'Music, theatrical production, and arts audition rounds for the university festival delegation.',
    },
  ];

  const FEATURE_CARDS = [
    {
      title: 'Spaces',
      tag: 'Classrooms',
      badgeVariant: 'pastelMint' as const,
      bgClass: 'bg-[#EAF5EE]/50 border-[#C6E2CF] dark:bg-[#2D6A4F]/15 dark:border-[#2D6A4F]/30',
      description: 'Live availability for 63 regular classrooms. Check scheduled free periods, AC, and sockets.',
      href: '/spaces',
      cta: 'Explore Spaces',
    },
    {
      title: 'Floor Map',
      tag: 'Ground Floor',
      badgeVariant: 'pastelSky' as const,
      bgClass: 'bg-[#EBF4FB]/50 border-[#C5E0F4] dark:bg-sky-500/10 dark:border-sky-500/30',
      description: 'Official Ground Floor architectural plan with interactive room markers and floor selectors.',
      href: '/map',
      cta: 'View Map',
    },
    {
      title: 'Calendar',
      tag: 'Schedule',
      badgeVariant: 'pastelButter' as const,
      bgClass: 'bg-[#FEF7E6]/50 border-[#F9E4B5] dark:bg-amber-500/10 dark:border-amber-500/30',
      description: 'Official Fall 2026 academic timetable with periods P1–P7, exam dates, and workshops.',
      href: '/events',
      cta: 'View Calendar',
    },
    {
      title: 'Faculty',
      tag: 'Directory',
      badgeVariant: 'pastelLavender' as const,
      bgClass: 'bg-[#F3EEF9]/50 border-[#DDD0F0] dark:bg-purple-500/10 dark:border-purple-500/30',
      description: 'Search faculty members by name, department, or subject. Look up cabin locations.',
      href: '/faculty',
      cta: 'Search Faculty',
    },
    {
      title: 'Issues',
      tag: 'Helpdesk',
      badgeVariant: 'pastelCoral' as const,
      bgClass: 'bg-[#FDF0EE]/50 border-[#F7CCC7] dark:bg-rose-500/10 dark:border-rose-500/30',
      description: 'Report classroom maintenance issues—AC faults, projector glitches, or seating repairs.',
      href: '/report',
      cta: 'Report Issue',
    },
    {
      title: 'Marketplace',
      tag: 'Student Hub',
      badgeVariant: 'pastelSage' as const,
      bgClass: 'bg-[#EFF3EE]/50 border-[#C9D8CB] dark:bg-emerald-500/10 dark:border-emerald-500/30',
      description: 'Buy and sell textbooks and study gear, or report and recover lost personal belongings.',
      href: '/marketplace',
      cta: 'Open Hub',
    },
  ];

  return (
    <div className="min-h-dvh bg-canvas text-ink antialiased">
      {/* Shared CAMPUS Navigation */}
      <SharedHeader />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
        {/* HERO SECTION: Left-aligned heading on left, wide search bar on right */}
        <section className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Left-aligned Headline & Subtitle */}
          <div className="lg:col-span-5 space-y-3">
            <h1 className="heading-editorial text-4xl sm:text-5xl md:text-6xl xl:text-7xl tracking-tight text-ink font-extrabold leading-[0.92]">
              FIND YOUR NEXT<br />
              <span className="text-[#1B4332] dark:text-[#52B788]">SPOT.</span>
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed max-w-md pt-1">
              Scheduled availability for 63 regular classrooms across campus, derived from the official timetable.
            </p>
          </div>

          {/* Right Column: Wide Campus Search Bar aligned vertically with center */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <CampusSearch initialRooms={rooms} />
          </div>
        </section>

        {/* SIX FEATURE CARDS IN ONE HORIZONTAL ROW DIRECTLY UNDERNEATH HERO */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {FEATURE_CARDS.map((card) => (
              <div
                key={card.title}
                className={`flex flex-col justify-between rounded-lg border p-4 transition-all duration-fast hover:shadow-sm ${card.bgClass}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={card.badgeVariant} className="text-[10px] px-1.5 py-0.5">
                      {card.tag}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-ink">{card.title}</h3>
                  <p className="text-[11px] text-ink-secondary leading-snug line-clamp-3">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-line/60">
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1B4332] hover:underline dark:text-[#74C69D]"
                  >
                    <span>{card.cta}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TWO-COLUMN SECTION: Upcoming Events on Left, Campus Calendar on Right */}
        <section className="border-t border-line pt-8">
          <div className="grid lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-line">
            {/* LEFT COLUMN: UPCOMING EVENTS */}
            <div className="lg:col-span-5 pb-8 lg:pb-0 lg:pr-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="heading-editorial text-xl font-bold tracking-tight text-ink">
                    UPCOMING EVENTS
                  </h2>
                  <p className="text-[11px] text-ink-secondary mt-0.5">
                    Campus workshops, demo days, and keynote sessions
                  </p>
                </div>

                <Link
                  href="/events"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] hover:underline dark:text-[#74C69D]"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Vertical Stack of Event Cards */}
              <div className="space-y-3">
                {UPCOMING_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="campus-card p-3.5 flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={event.categoryBadge} className="text-[10px]">
                            {event.category}
                          </Badge>
                          <span className="font-mono text-xs font-bold text-ink">
                            {event.dateMonth} {event.dateDay}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-ink leading-snug">
                          {event.title}
                        </h4>
                        <p className="text-[11px] text-ink-secondary line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-line/60 text-[10px] text-ink-tertiary font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-[160px]">{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: CAMPUS CALENDAR & TIMETABLE */}
            <div className="lg:col-span-7 pt-8 lg:pt-0 lg:pl-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="heading-editorial text-xl font-bold tracking-tight text-ink">
                    CAMPUS CALENDAR
                  </h2>
                  <p className="text-[11px] text-ink-secondary mt-0.5">
                    Official weekly timetable (Mon–Sat, P1–P7) with dynamic room availability
                  </p>
                </div>

                <Link
                  href="/spaces"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B4332] hover:underline dark:text-[#74C69D]"
                >
                  <span>Spaces Directory</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Interactive Calendar & Weekday Preview */}
              <CampusCalendarPreview
                weeklySummary={weeklySummary}
                initialDay={current.isSunday ? 1 : current.day}
                initialPeriod={current.period}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Shared Campus Footer */}
      <footer className="border-t border-line bg-surface py-10 mt-12 dark:border-white/[0.08] dark:bg-[#121211]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-secondary">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#1B4332] text-white font-mono text-[10px] font-bold dark:bg-[#2D6A4F]">
                CP
              </span>
              <span className="heading-editorial font-bold text-ink">CAMPUS</span>
              <span>· Jain (Deemed-to-be University)</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-ink-tertiary font-mono">
              <span>63 Regular Classrooms</span>
              <span>·</span>
              <span>2,646 Schedule Slots</span>
              <span>·</span>
              <span>Monday–Saturday P1–P7</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
