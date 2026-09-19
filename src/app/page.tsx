import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  DoorOpen,
  Flame,
  Globe,
  GraduationCap,
  HeartHandshake,
  Layers,
  Lightbulb,
  Map,
  MapPin,
  Plug,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Users,
  Wifi,
  Zap,
} from 'lucide-react';

import { ThemeToggle } from '@/components/app/theme-toggle';
import { UserChip } from '@/components/app/user-chip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getLiveRooms } from '@/server/queries/rooms';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const rooms = await getLiveRooms();
  const freeCount = rooms.filter((r) => r.status === 'free').length;
  const soonCount = rooms.filter((r) => r.status === 'soon').length;
  const busyCount = rooms.filter((r) => r.status === 'busy').length;

  const featuredRooms = rooms.slice(0, 4);

  return (
    <div className="min-h-dvh bg-canvas text-ink antialiased selection:bg-white/20">
      {/* Floating Island Navigation Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between rounded-xl border border-line bg-surface/90 px-4 shadow-sm backdrop-blur-xl md:px-5 dark:border-white/[0.08] dark:bg-[#0c0c0d]/90">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
              ◧
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold tracking-tight text-ink">JainSpace</span>
              <span className="hidden rounded bg-zinc-200/80 px-1 py-0.2 font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-700 sm:inline-block dark:bg-white/10 dark:text-zinc-300">
                3rd Sem DT
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/spaces"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-surface-sunken hover:text-ink dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-200"
            >
              Spaces
            </Link>
            <Link
              href="/map"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-surface-sunken hover:text-ink dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-200"
            >
              Floor Map
            </Link>
            <Link
              href="/match"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-surface-sunken hover:text-ink dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-200"
            >
              AI Matcher
            </Link>
            <Link
              href="/case-study"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-900 transition-colors hover:bg-surface-sunken dark:text-white dark:hover:bg-white/[0.04]"
            >
              Case Study (20/20)
            </Link>
            <Link
              href="/faculty"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-surface-sunken hover:text-ink dark:text-zinc-400 dark:hover:bg-white/[0.04] dark:hover:text-zinc-200"
            >
              Faculty
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserChip />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative mx-auto max-w-5xl px-4 pt-16 pb-20 sm:px-6 md:pt-24 md:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          {/* Subtle Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-sunken/80 px-3 py-1 text-[11px] font-medium text-zinc-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Jain (Deemed-to-be University) · Design Thinking CA1</span>
          </div>

          {/* Headline */}
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Campus space intelligence for student comfort.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-zinc-500 sm:text-base dark:text-zinc-400">
            Real-time availability for 52 classrooms, computer labs, and seminar halls across 4 floors.
            Calculated automatically from the live academic timetable and confirmed by student telemetry.
          </p>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/spaces"
              className="group inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-5 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <span>Explore Live Spaces</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/map"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-xs font-semibold text-ink transition-all hover:bg-surface-sunken active:scale-[0.98] dark:border-white/[0.08] dark:bg-[#111113] dark:hover:bg-white/[0.04]"
            >
              <Map className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>Architectural Map</span>
            </Link>

            <Link
              href="/case-study"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-xs font-semibold text-ink transition-all hover:bg-surface-sunken active:scale-[0.98] dark:border-white/[0.08] dark:bg-[#111113] dark:hover:bg-white/[0.04]"
            >
              <BookOpen className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>CA1 Case Study</span>
            </Link>
          </div>

          {/* Telemetry Counter Bar */}
          <div className="mt-10 inline-flex flex-wrap items-center justify-center gap-4 rounded-xl border border-line bg-surface px-4 py-2.5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]">
            <div className="flex items-center gap-2 font-mono text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-zinc-900 dark:text-zinc-200">{freeCount} Free Now</span>
            </div>
            <span className="h-3 w-px bg-line dark:bg-white/[0.08]" />
            <div className="flex items-center gap-2 font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>{soonCount} Free Soon</span>
            </div>
            <span className="h-3 w-px bg-line dark:bg-white/[0.08]" />
            <div className="flex items-center gap-2 font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
              <span>{rooms.length} Mapped</span>
            </div>
          </div>
        </div>

        {/* Problem Metrics Grid (Stage 1 Research) */}
        <section className="mt-24 border-t border-line/60 pt-16 dark:border-white/[0.06]">
          <div className="text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Stage 1 · Empathy & User Research
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              The Reality of Campus Hallway Congestion
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Survey data gathered from 120+ engineering students at Jain University during the Empathize phase.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-line bg-surface p-5 dark:border-white/[0.08] dark:bg-[#111113]">
              <p className="font-mono text-3xl font-extrabold tracking-tight text-ink">78%</p>
              <h3 className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Wasted Time</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                15–25 minutes lost every break wandering corridors to find an unlocked room.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5 dark:border-white/[0.08] dark:bg-[#111113]">
              <p className="font-mono text-3xl font-extrabold tracking-tight text-ink">85%</p>
              <h3 className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Socket Deficit</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Laptop batteries die without knowing which classrooms have working wall sockets.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5 dark:border-white/[0.08] dark:bg-[#111113]">
              <p className="font-mono text-3xl font-extrabold tracking-tight text-ink">92%</p>
              <h3 className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Noise Clashes</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Silent individual study clashes with collaborative group discussions.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5 dark:border-white/[0.08] dark:bg-[#111113]">
              <p className="font-mono text-3xl font-extrabold tracking-tight text-ink">&lt; 1s</p>
              <h3 className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Lookup Time</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Instant answers with JainSpace: check room status and amenities instantly.
              </p>
            </div>
          </div>
        </section>

        {/* Core Platform Pillars Bento Grid */}
        <section className="mt-24 border-t border-line/60 pt-16 dark:border-white/[0.06]">
          <div className="text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              System Architecture
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Engineered for Precision & Clarity
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Bento 1: Timetable Engine */}
            <div className="rounded-xl border border-line bg-surface p-6 md:col-span-2 dark:border-white/[0.08] dark:bg-[#111113]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-sunken text-ink dark:bg-white/[0.06] dark:text-white">
                <Cpu className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">
                Live Timetable Intelligence Engine
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Every classroom&apos;s state is calculated deterministically from the published Jain
                University timetable. Know exactly when a class ends, who the teacher is, and how long
                you have until the next lecture begins.
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                  52 Rooms Mapped
                </span>
                <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                  Automatic Slots
                </span>
                <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                  Deterministic Logic
                </span>
              </div>
            </div>

            {/* Bento 2: Architectural CAD Blueprint */}
            <div className="rounded-xl border border-line bg-surface p-6 dark:border-white/[0.08] dark:bg-[#111113]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-sunken text-ink dark:bg-white/[0.06] dark:text-white">
                <Map className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">4-Floor CAD Map</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Full spatial schematic across Floor 0 to Floor 3 with West, Central, and East wings.
              </p>
              <Link
                href="/map"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline dark:text-white"
              >
                <span>Launch Map</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Bento 3: AI Matcher */}
            <div className="rounded-xl border border-line bg-surface p-6 dark:border-white/[0.08] dark:bg-[#111113]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-sunken text-ink dark:bg-white/[0.06] dark:text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">Smart Matcher</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Filter by group size, study duration, AC, sockets, and silent zone requirements.
              </p>
              <Link
                href="/match"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline dark:text-white"
              >
                <span>Find Room</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Bento 4: Crowdsourced Telemetry */}
            <div className="rounded-xl border border-line bg-surface p-6 md:col-span-2 dark:border-white/[0.08] dark:bg-[#111113]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-sunken text-ink dark:bg-white/[0.06] dark:text-white">
                <Flame className="h-4 w-4" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">
                Crowdsourced Comfort Telemetry & Karma
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Students report live noise levels, AC status, and broken sockets in 20 seconds.
                Confirmed reports earn +15 karma points and auto-feed the public facility repair board.
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                  20s Check-In
                </span>
                <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                  Karma Points
                </span>
                <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-600 dark:bg-white/[0.06] dark:text-zinc-300">
                  Facility Board
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Stages of Design Thinking Framework */}
        <section className="mt-24 border-t border-line/60 pt-16 dark:border-white/[0.06]">
          <div className="text-center">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Methodology
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              The 5-Stage Design Thinking Process
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Evaluated under the 20/20 CA1 Academic Rubric for 3rd Semester B.Tech.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl border border-line bg-surface p-4 dark:border-white/[0.08] dark:bg-[#111113]">
              <span className="font-mono text-[11px] font-bold text-zinc-400">01</span>
              <h3 className="mt-1 text-sm font-bold text-ink">Empathize</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                120+ student surveys & campus hallway observation logs.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-4 dark:border-white/[0.08] dark:bg-[#111113]">
              <span className="font-mono text-[11px] font-bold text-zinc-400">02</span>
              <h3 className="mt-1 text-sm font-bold text-ink">Define</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                POV & HMW statements tackling underutilized academic capacity.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-4 dark:border-white/[0.08] dark:bg-[#111113]">
              <span className="font-mono text-[11px] font-bold text-zinc-400">03</span>
              <h3 className="mt-1 text-sm font-bold text-ink">Ideate</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                SCAMPER analysis prioritizing automatic timetable synchronization.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-4 dark:border-white/[0.08] dark:bg-[#111113]">
              <span className="font-mono text-[11px] font-bold text-zinc-400">04</span>
              <h3 className="mt-1 text-sm font-bold text-ink">Prototype</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Full-stack Next.js web application deployed with real timetable data.
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-4 dark:border-white/[0.08] dark:bg-[#111113]">
              <span className="font-mono text-[11px] font-bold text-zinc-400">05</span>
              <h3 className="mt-1 text-sm font-bold text-ink">Test</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                94% task completion rate and 4.8/5 student usability score.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/case-study"
              className="inline-flex items-center gap-2 text-xs font-semibold text-ink hover:underline dark:text-white"
            >
              <span>Read complete 20/20 Case Study Documentation</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </section>

        {/* Featured Campus Spaces Preview */}
        <section className="mt-24 border-t border-line/60 pt-16 dark:border-white/[0.06]">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                Live Inventory
              </span>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Featured Campus Spaces
              </h2>
            </div>
            <Link
              href="/spaces"
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink hover:underline dark:text-white"
            >
              <span>View all {rooms.length} spaces</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredRooms.map((room) => (
              <Link
                key={room.room_id}
                href={`/spaces/${room.slug}`}
                className="group block"
              >
                <div className="rounded-xl border border-line bg-surface p-4 transition-all hover:border-zinc-400 dark:border-white/[0.08] dark:bg-[#111113] dark:hover:border-white/20">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-ink">{room.code}</span>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          room.status === 'free'
                            ? 'bg-emerald-500'
                            : room.status === 'soon'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                      />
                      {room.status === 'free' ? 'Free' : room.status === 'soon' ? 'Soon' : 'Busy'}
                    </span>
                  </div>
                  <h3 className="mt-2 truncate text-sm font-semibold text-ink group-hover:text-zinc-900 dark:group-hover:text-white">
                    {room.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400">Floor {room.floor_level} · {room.block_name}</p>

                  <div className="mt-3 flex items-center gap-3 border-t border-line/60 pt-2.5 text-[11px] font-mono text-zinc-500 dark:border-white/[0.06] dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-zinc-400" />
                      <span>{room.capacity}</span>
                    </span>
                    {room.sockets_working != null && (
                      <span className="flex items-center gap-1">
                        <Plug className="h-3 w-3 text-zinc-400" />
                        <span>{room.sockets_working}</span>
                      </span>
                    )}
                    {room.has_ac && (
                      <span className="flex items-center gap-1">
                        <Snowflake className="h-3 w-3 text-zinc-400" />
                        <span>AC</span>
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Action Callout */}
        <section className="mt-24 rounded-xl border border-line bg-surface p-8 text-center dark:border-white/[0.08] dark:bg-[#111113]">
          <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Start Exploring Campus Spaces
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs text-zinc-500 dark:text-zinc-400">
            Check real-time room occupancy, verify professor cabins, or inspect the CA1 Design Thinking case study.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/spaces"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <span>Launch Directory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/case-study"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-xs font-semibold text-ink transition-all hover:bg-surface-sunken active:scale-[0.98] dark:border-white/[0.08] dark:bg-surface-sunken"
            >
              <span>View Case Study</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-surface py-8 dark:border-white/[0.08] dark:bg-[#0c0c0d]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-zinc-900 text-[10px] font-bold text-white dark:bg-white dark:text-zinc-900">
                ◧
              </span>
              <span className="text-xs font-bold text-ink">JainSpace</span>
              <span className="text-xs text-zinc-400">· Campus Reimagined</span>
            </div>

            <p className="text-[11px] text-zinc-400">
              Nilotpal Deb (23BTRCN042) · 3rd Sem B.Tech CSE · Jain (Deemed-to-be University)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
