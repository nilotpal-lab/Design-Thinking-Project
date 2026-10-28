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
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

import { SharedHeader } from '@/components/app/shared-header';
import { CampusSearch } from '@/components/home/campus-search';
import { CampusCalendarPreview } from '@/components/home/campus-calendar-preview';
import { Badge } from '@/components/ui/badge';
import { getLiveRooms } from '@/server/queries/rooms';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const rooms = await getLiveRooms();
  const freeCount = rooms.filter((r) => r.status === 'free').length;
  const busyCount = rooms.filter((r) => r.status === 'busy').length;
  const acCount = rooms.filter((r) => r.has_ac).length;

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
      department: 'School of CS & Engineering',
      description: 'Live interactive demonstrations of student prototypes solving campus comfort and resource allocation.',
    },
    {
      id: 'ev-2',
      dateMonth: 'NOV',
      dateDay: '12',
      category: 'Tech' as const,
      categoryBadge: 'pastelMint' as const,
      title: 'Jain University 36-Hour Hackathon 2026',
      time: '09:00 AM Kickoff',
      location: 'Central Auditorium & Lab 214',
      department: 'Robotics & Dev Societies',
      description: 'Collaborative development marathon tackling sustainability, smart campus automation, and AI tooling.',
    },
    {
      id: 'ev-3',
      dateMonth: 'NOV',
      dateDay: '18',
      category: 'Workshop' as const,
      categoryBadge: 'pastelButter' as const,
      title: 'Industry Keynote: High-Performance Distributed Systems',
      time: '02:00 PM – 04:00 PM',
      location: 'Seminar Hall A · 1st Floor',
      department: 'Alumni Tech Network',
      description: 'Architectural case studies on scale, low-latency APIs, and cloud infrastructure best practices.',
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
      department: 'Student Affairs Council',
      description: 'Music, theatrical production, and arts audition rounds for the university festival delegation.',
    },
  ];

  return (
    <div className="min-h-dvh bg-canvas text-ink antialiased">
      {/* Shared CAMPUS Navigation */}
      <SharedHeader />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
        <div className="mx-auto max-w-4xl text-center space-y-5">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C6E2CF] bg-[#EAF5EE] px-3.5 py-1 text-[11px] font-semibold text-[#1B4332] dark:border-[#2D6A4F]/40 dark:bg-[#2D6A4F]/20 dark:text-[#74C69D]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
            </span>
            <span>JAIN UNIVERSITY · REAL-TIME TIMETABLE & FACILITY HUB</span>
          </div>

          {/* Large Bold Condensed Editorial Heading */}
          <h1 className="heading-editorial text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-ink font-extrabold">
            FIND YOUR NEXT SPOT.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-ink-secondary sm:text-base">
            Live availability for 63 verified classrooms, labs, and seminar halls across Ground to 4th Floor.
            Calculated directly from the official timetable with real-time AC and socket tracking.
          </p>

          {/* Prominent Campus-Wide Search */}
          <div className="pt-2">
            <CampusSearch initialRooms={rooms} />
          </div>

          {/* Live Campus Telemetry Strip */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-6 rounded-lg border border-line bg-surface px-6 py-3 shadow-sm dark:border-white/[0.08] dark:bg-[#1A1918]">
            <div className="flex items-center gap-2 text-xs font-medium text-ink">
              <span className="font-mono text-sm font-bold text-[#1B4332] dark:text-[#74C69D]">63</span>
              <span className="text-ink-secondary">Rooms Tracked</span>
            </div>
            <div className="h-3 w-px bg-line" />
            <div className="flex items-center gap-2 text-xs font-medium text-ink">
              <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {freeCount}
              </span>
              <span className="text-ink-secondary">Free Right Now</span>
            </div>
            <div className="h-3 w-px bg-line" />
            <div className="flex items-center gap-2 text-xs font-medium text-ink">
              <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400">
                {acCount}
              </span>
              <span className="text-ink-secondary">Air Conditioned</span>
            </div>
            <div className="h-3 w-px bg-line" />
            <div className="flex items-center gap-2 text-xs font-medium text-ink">
              <span className="font-mono text-sm font-bold text-ink">2,646</span>
              <span className="text-ink-secondary">Timetable Slots</span>
            </div>
          </div>
        </div>
      </section>

      {/* Six Feature Cards Section */}
      <section className="border-t border-line bg-surface-sunken/40 py-16 dark:border-white/[0.08] dark:bg-black/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#1B4332] dark:bg-[#52B788]" />
                <span className="font-mono text-xs uppercase tracking-wider text-ink-secondary">
                  Core Campus Modules
                </span>
              </div>
              <h2 className="heading-editorial mt-1 text-2xl sm:text-3xl text-ink">
                EVERYTHING ON CAMPUS, AT A GLANCE.
              </h2>
            </div>
            <p className="text-xs text-ink-secondary max-w-md">
              Integrated academic tools designed to eliminate guesswork, double-bookings, and lost study time.
            </p>
          </div>

          {/* 6 Feature Cards Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Card 1: Spaces Directory */}
            <div className="campus-card flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1B4332] text-white dark:bg-[#2D6A4F]">
                    <DoorOpen className="h-5 w-5" />
                  </div>
                  <Badge variant="pastelMint">63 Rooms · Live</Badge>
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Spaces Directory</h3>
                  <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
                    Check live room occupancy, daily timetables, AC availability, and power sockets across all 4 engineering floors.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-line/60">
                <Link
                  href="/spaces"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:underline dark:text-[#74C69D]"
                >
                  <span>Explore Live Spaces</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Interactive Floor Map */}
            <div className="campus-card flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1B4332] text-white dark:bg-[#2D6A4F]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <Badge variant="pastelSky">Architectural Plan</Badge>
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Floor Maps</h3>
                  <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
                    Interactive navigation using the official Ground Floor architectural blueprint, with schematic floor-selectors for upper levels.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-line/60">
                <Link
                  href="/map"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:underline dark:text-[#74C69D]"
                >
                  <span>Open Interactive Map</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Campus Calendar */}
            <div className="campus-card flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1B4332] text-white dark:bg-[#2D6A4F]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <Badge variant="pastelButter">Fall 2026</Badge>
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Campus Calendar</h3>
                  <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
                    Full academic schedule with period-by-period breakdowns (P1–P7), examination dates, club workshops, and holiday notices.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-line/60">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:underline dark:text-[#74C69D]"
                >
                  <span>View Full Schedule</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 4: Faculty Directory */}
            <div className="campus-card flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1B4332] text-white dark:bg-[#2D6A4F]">
                    <Users className="h-5 w-5" />
                  </div>
                  <Badge variant="pastelLavender">Staff Cabins</Badge>
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Faculty Directory</h3>
                  <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
                    Search professors by name, department, or subject. Look up cabin locations, office hours, and student consultation times.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-line/60">
                <Link
                  href="/faculty"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:underline dark:text-[#74C69D]"
                >
                  <span>Search Faculty</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 5: Issues & Maintenance */}
            <div className="campus-card flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1B4332] text-white dark:bg-[#2D6A4F]">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <Badge variant="pastelCoral">Facility Helpdesk</Badge>
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Issues & Maintenance</h3>
                  <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
                    Report non-functional air conditioning, faulty projectors, or furniture damage. Track work-order status in real time.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-line/60">
                <Link
                  href="/report"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:underline dark:text-[#74C69D]"
                >
                  <span>Report an Issue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 6: Marketplace & Lost/Found */}
            <div className="campus-card flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#1B4332] text-white dark:bg-[#2D6A4F]">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <Badge variant="pastelSage">Student Hub</Badge>
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Marketplace & Lost/Found</h3>
                  <p className="mt-1.5 text-xs text-ink-secondary leading-relaxed">
                    Buy and sell textbooks, drawing tools, and Arduino kits with fellow students, or trace lost items across campus desks.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-line/60">
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:underline dark:text-[#74C69D]"
                >
                  <span>Explore Marketplace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1B4332] dark:bg-[#52B788]" />
              <span className="font-mono text-xs uppercase tracking-wider text-ink-secondary">
                Campus Happenings
              </span>
            </div>
            <h2 className="heading-editorial mt-1 text-2xl sm:text-3xl text-ink">
              UPCOMING EVENTS & WORKSHOPS
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B4332] hover:underline dark:text-[#74C69D]"
          >
            <span>View All Events ({UPCOMING_EVENTS.length})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Event Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {UPCOMING_EVENTS.map((event) => (
            <div key={event.id} className="campus-card flex flex-col justify-between p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-[10px] uppercase font-bold text-[#1B4332] dark:text-[#74C69D]">
                      {event.dateMonth}
                    </span>
                    <span className="text-xl font-extrabold text-ink">{event.dateDay}</span>
                  </div>
                  <Badge variant={event.categoryBadge}>{event.category}</Badge>
                </div>

                <h3 className="text-sm font-bold text-ink leading-snug line-clamp-2">
                  {event.title}
                </h3>

                <p className="text-xs text-ink-secondary leading-relaxed line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-1 pt-1 text-[11px] text-ink-secondary font-mono">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-ink-tertiary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-ink-tertiary" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-line/60">
                <Link
                  href="/events"
                  className="inline-flex w-full items-center justify-center rounded-md border border-line bg-surface py-1.5 text-xs font-medium text-ink transition-colors hover:bg-surface-sunken dark:border-white/[0.08]"
                >
                  Event Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Calendar Widget Section */}
      <section className="border-t border-line bg-surface-sunken/40 py-16 dark:border-white/[0.08] dark:bg-black/20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1B4332] dark:bg-[#52B788]" />
              <span className="font-mono text-xs uppercase tracking-wider text-ink-secondary">
                Weekly Rhythm
              </span>
            </div>
            <h2 className="heading-editorial mt-1 text-2xl sm:text-3xl text-ink">
              CAMPUS CALENDAR & TIMETABLE
            </h2>
          </div>

          <CampusCalendarPreview />
        </div>
      </section>

      {/* Shared Campus Footer */}
      <footer className="border-t border-line bg-surface py-12 dark:border-white/[0.08] dark:bg-[#121211]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1B4332] text-white font-mono text-xs font-bold dark:bg-[#2D6A4F]">
                  CP
                </span>
                <span className="heading-editorial text-lg tracking-editorial text-ink">
                  CAMPUS
                </span>
              </div>
              <p className="text-xs text-ink-secondary max-w-sm leading-relaxed">
                Centralized academic spaces, timetable intelligence, and facility tracking platform for students and faculty of Jain (Deemed-to-be University).
              </p>
              <div className="flex items-center gap-2 text-[11px] text-ink-tertiary font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Verified Cleaned Dataset · 63 Rooms · 2,646 Slots</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold mb-3">
                Spaces
              </h4>
              <ul className="space-y-2 text-xs text-ink-secondary">
                <li><Link href="/spaces" className="hover:text-ink">Live Classroom Directory</Link></li>
                <li><Link href="/spaces?ac=true" className="hover:text-ink">AC Available Rooms</Link></li>
                <li><Link href="/spaces?sockets=true" className="hover:text-ink">Charging Point Desks</Link></li>
                <li><Link href="/map" className="hover:text-ink">Ground Floor Plan</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold mb-3">
                Campus Life
              </h4>
              <ul className="space-y-2 text-xs text-ink-secondary">
                <li><Link href="/events" className="hover:text-ink">Academic Calendar</Link></li>
                <li><Link href="/faculty" className="hover:text-ink">Faculty Cabins</Link></li>
                <li><Link href="/marketplace" className="hover:text-ink">Marketplace</Link></li>
                <li><Link href="/lost-found" className="hover:text-ink">Lost & Found</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-ink font-semibold mb-3">
                Operations
              </h4>
              <ul className="space-y-2 text-xs text-ink-secondary">
                <li><Link href="/report" className="hover:text-ink">Report an Issue</Link></li>
                <li><Link href="/admin" className="hover:text-ink">Maintenance Portal</Link></li>
                <li><Link href="/my" className="hover:text-ink">My Check-ins</Link></li>
                <li><Link href="/case-study" className="hover:text-ink">Design Thinking CA1</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-tertiary">
            <p>© 2026 Jain (Deemed-to-be University). Built for 3rd Sem Design Thinking & Innovation.</p>
            <p className="font-mono">Next.js 16 · React 19 · Offline-Ready Demo Mode</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
