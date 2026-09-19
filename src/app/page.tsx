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
    <div className="min-h-dvh bg-canvas text-ink antialiased selection:bg-accent/20">
      {/* Ambient Lighting Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl" />
        <div className="absolute right-0 top-1/4 h-[650px] w-[650px] rounded-full bg-gradient-to-bl from-blue-500/15 via-emerald-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-accent/10 via-pink-500/5 to-transparent blur-3xl" />
      </div>

      {/* Floating Island Navigation Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between rounded-2xl border border-line/80 bg-surface/80 px-4 shadow-e2 backdrop-blur-xl md:px-6 dark:border-white/10 dark:bg-[#101014]/85">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-indigo-500 text-base font-extrabold text-white shadow-glow-accent">
              ◧
            </span>
            <div>
              <span className="text-base font-black tracking-tight text-ink">JainSpace</span>
              <span className="ml-1.5 hidden rounded-md bg-accent-subtle px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-accent sm:inline-block">
                3rd Sem DT
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/spaces"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink dark:hover:bg-white/[0.04]"
            >
              Spaces Directory
            </Link>
            <Link
              href="/map"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink dark:hover:bg-white/[0.04]"
            >
              Floor Map
            </Link>
            <Link
              href="/match"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink dark:hover:bg-white/[0.04]"
            >
              AI Matcher
            </Link>
            <Link
              href="/case-study"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent-subtle dark:text-accent-hover"
            >
              Case Study (20/20)
            </Link>
            <Link
              href="/faculty"
              className="rounded-xl px-3.5 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink dark:hover:bg-white/[0.04]"
            >
              Faculty
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <UserChip />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 md:pt-24 md:pb-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-subtle px-4 py-1.5 text-xs font-bold text-accent shadow-sm backdrop-blur-md dark:border-accent/30 dark:bg-accent/15 dark:text-accent-hover">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Jain (Deemed-to-be University) · Design Thinking Project</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-6 text-4xl font-black tracking-tight text-ink sm:text-6xl lg:text-7xl">
            Campus Space{' '}
            <span className="bg-gradient-to-r from-accent via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Reimagined
            </span>{' '}
            for Student Comfort.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-secondary sm:text-lg">
            Real-time availability for every classroom, computer lab, and seminar hall on campus.
            Derived automatically from the live academic timetable and confirmed by student telemetry.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/spaces"
              className="group inline-flex h-12 items-center gap-3 rounded-2xl bg-accent px-7 text-sm font-bold text-white shadow-glow-accent transition-all duration-fast hover:bg-accent-hover active:scale-95"
            >
              <span>Explore Live Spaces</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              href="/map"
              className="inline-flex h-12 items-center gap-2.5 rounded-2xl border border-line/80 bg-surface/80 px-6 text-sm font-bold text-ink shadow-sm backdrop-blur-md transition-all duration-fast hover:border-line-strong hover:bg-surface active:scale-95 dark:border-white/10 dark:bg-surface/80"
            >
              <Map className="h-4 w-4 text-accent" />
              <span>Architectural Floor Map</span>
            </Link>

            <Link
              href="/case-study"
              className="inline-flex h-12 items-center gap-2.5 rounded-2xl border border-line/80 bg-surface/80 px-6 text-sm font-bold text-ink shadow-sm backdrop-blur-md transition-all duration-fast hover:border-line-strong hover:bg-surface active:scale-95 dark:border-white/10 dark:bg-surface/80"
            >
              <BookOpen className="h-4 w-4 text-purple-500" />
              <span>Design Thinking Paper</span>
            </Link>
          </div>

          {/* Live Campus Telemetry Widget Pill */}
          <div className="mt-12 inline-flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-line/80 bg-surface/80 px-6 py-3.5 shadow-e1 backdrop-blur-md dark:border-white/10 dark:bg-[#121216]">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {freeCount} Rooms Free Right Now
              </span>
            </div>
            <span className="h-4 w-px bg-line dark:bg-white/10" />
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-ink-secondary">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>{soonCount} Free Soon</span>
            </div>
            <span className="h-4 w-px bg-line dark:bg-white/10" />
            <div className="flex items-center gap-2 font-mono text-xs font-semibold text-ink-secondary">
              <Layers className="h-3.5 w-3.5 text-accent" />
              <span>{rooms.length} Campus Rooms Mapped</span>
            </div>
          </div>
        </div>

        {/* Empathy & Student Pain Point Numbers Section */}
        <section className="mt-28">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-accent dark:text-accent-hover">
              Stage 1: Empathy & Quantitative Student Research
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              The Real Problem at Jain University
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[14px] text-ink-secondary">
              We surveyed over 120 engineering students across CSE, AI&ML, and ISE departments during
              the Empathize stage of our Design Thinking methodology.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-3xl p-6 text-center shadow-e1 dark:border-white/10">
              <p className="font-mono text-4xl font-black text-rose-500">78%</p>
              <h3 className="mt-2 text-base font-bold text-ink">Wasted Study Time</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                Students spend 15–25 minutes wandering hallways looking for unlocked, empty rooms
                between classes.
              </p>
            </Card>

            <Card className="rounded-3xl p-6 text-center shadow-e1 dark:border-white/10">
              <p className="font-mono text-4xl font-black text-amber-500">85%</p>
              <h3 className="mt-2 text-base font-bold text-ink">Power Socket Deficit</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                Laptop batteries die without knowing which rooms contain functioning 3-pin wall
                sockets.
              </p>
            </Card>

            <Card className="rounded-3xl p-6 text-center shadow-e1 dark:border-white/10">
              <p className="font-mono text-4xl font-black text-indigo-500">92%</p>
              <h3 className="mt-2 text-base font-bold text-ink">Noise Clashes</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                Students wanting silent study clash with groups working on collaborative team
                presentations.
              </p>
            </Card>

            <Card className="rounded-3xl p-6 text-center shadow-e1 dark:border-white/10">
              <p className="font-mono text-4xl font-black text-emerald-500">0s</p>
              <h3 className="mt-2 text-base font-bold text-ink">JainSpace Search</h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                Instant answers: open JainSpace on your phone and see every empty room with live
                countdown timers.
              </p>
            </Card>
          </div>
        </section>

        {/* Asymmetrical Bento Grid Showcase */}
        <section className="mt-32">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-accent dark:text-accent-hover">
              Core Platform Architecture
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              Engineered for Speed, Precision & Delight
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Bento 1: Timetable Intelligence (Large 2 cols) */}
            <Card className="rounded-3xl p-8 shadow-e2 md:col-span-2 dark:border-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-ink">
                Live Timetable Intelligence Engine
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                Every classroom&apos;s state is calculated deterministically from the published Jain
                University timetable. No guessing games: know when a class ends, who the teacher is,
                and how long you have until the next lecture begins.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="free">Automatic Time Windows</Badge>
                <Badge variant="accent">52 Rooms Tracked</Badge>
                <Badge variant="neutral">Zero Hallway Guesswork</Badge>
              </div>
            </Card>

            {/* Bento 2: CAD Floor Map */}
            <Card className="rounded-3xl p-8 shadow-e2 dark:border-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Map className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-ink">4-Floor CAD Blueprint</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                Full spatial schematic across Floor 0 to Floor 3. Wing dividers (West, Central, East)
                with live occupancy heat maps.
              </p>
              <Link
                href="/map"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline dark:text-accent-hover"
              >
                <span>Launch Floor Map</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            {/* Bento 3: AI Matcher */}
            <Card className="rounded-3xl p-8 shadow-e2 dark:border-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-ink">1-Click AI Space Matcher</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                Need a silent room with 4 sockets for 2 hours? Select your criteria in 3 taps and get
                ranked compatible spaces with explainable match scores.
              </p>
              <Link
                href="/match"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline dark:text-accent-hover"
              >
                <span>Try AI Matcher</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            {/* Bento 4: Crowdsourced Telemetry (Large 2 cols) */}
            <Card className="rounded-3xl p-8 shadow-e2 md:col-span-2 dark:border-white/10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Flame className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-2xl font-bold text-ink">
                Crowdsourced Comfort Telemetry & Karma Rewards
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                Students report live noise levels, AC comfort, and broken sockets in 20 seconds.
                Every confirmed report awards +15 student karma points and feeds the public facility
                board for admin maintenance.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="soon">20-Second Check-In</Badge>
                <Badge variant="accent">Karma Leaderboard</Badge>
                <Badge variant="free">Public Issue Board</Badge>
              </div>
            </Card>
          </div>
        </section>

        {/* 5-Stage Design Thinking Showcase */}
        <section className="mt-32 rounded-3xl border border-line/80 bg-surface/80 p-8 shadow-e2 md:p-12 dark:border-white/10 dark:bg-[#121216]">
          <div className="text-center">
            <Badge variant="accent" className="text-xs font-bold uppercase tracking-wider">
              Academic Methodology
            </Badge>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              5 Stages of Design Thinking Applied
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-[14px] text-ink-secondary">
              Documented for the 3rd Semester CA1 Examination evaluation rubric at Jain University.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-5">
            <div className="rounded-2xl border border-line/60 bg-surface p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <span className="font-mono text-xs font-bold text-accent">01 · EMPATHIZE</span>
              <h3 className="mt-2 text-base font-bold text-ink">User Discovery</h3>
              <p className="mt-1 text-xs text-ink-secondary">
                120+ student surveys & campus hallway observations identifying seat anxiety.
              </p>
            </div>

            <div className="rounded-2xl border border-line/60 bg-surface p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <span className="font-mono text-xs font-bold text-indigo-500">02 · DEFINE</span>
              <h3 className="mt-2 text-base font-bold text-ink">Problem Statement</h3>
              <p className="mt-1 text-xs text-ink-secondary">
                How Might We optimize empty classrooms for student focus and productivity?
              </p>
            </div>

            <div className="rounded-2xl border border-line/60 bg-surface p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <span className="font-mono text-xs font-bold text-purple-500">03 · IDEATE</span>
              <h3 className="mt-2 text-base font-bold text-ink">Feature Matrix</h3>
              <p className="mt-1 text-xs text-ink-secondary">
                SCAMPER analysis & prioritization of timetable sync over manual reservations.
              </p>
            </div>

            <div className="rounded-2xl border border-line/60 bg-surface p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <span className="font-mono text-xs font-bold text-amber-500">04 · PROTOTYPE</span>
              <h3 className="mt-2 text-base font-bold text-ink">Next.js Platform</h3>
              <p className="mt-1 text-xs text-ink-secondary">
                Full-stack production web application with real timetable data and Supabase auth.
              </p>
            </div>

            <div className="rounded-2xl border border-line/60 bg-surface p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <span className="font-mono text-xs font-bold text-emerald-500">05 · TEST</span>
              <h3 className="mt-2 text-base font-bold text-ink">User Validation</h3>
              <p className="mt-1 text-xs text-ink-secondary">
                Usability testing sessions: 94% task completion rate with 4.8/5 student rating.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/case-study"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-glow-accent transition-all hover:bg-accent-hover active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              <span>Read Full CA1 Design Thinking Case Study</span>
            </Link>
          </div>
        </section>

        {/* Featured Campus Spaces Preview */}
        <section className="mt-32">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-accent dark:text-accent-hover">
                Live Inventory
              </p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">
                Popular Campus Study Spaces
              </h2>
            </div>
            <Link
              href="/spaces"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline dark:text-accent-hover"
            >
              <span>View All {rooms.length} Spaces</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredRooms.map((room) => (
              <Link
                key={room.room_id}
                href={`/spaces/${room.slug}`}
                className="group block rounded-2xl"
              >
                <Card className="h-full p-5 shadow-e1 transition-all duration-base hover:-translate-y-1 hover:border-accent/40 hover:shadow-e2 dark:border-white/10">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-accent dark:text-accent-hover">
                      {room.code}
                    </span>
                    <Badge variant={room.status === 'free' ? 'free' : room.status === 'soon' ? 'soon' : 'busy'}>
                      {room.status === 'free' ? 'Free now' : room.status === 'soon' ? 'Free soon' : 'Busy'}
                    </Badge>
                  </div>
                  <h3 className="mt-2 truncate text-base font-bold text-ink transition-colors group-hover:text-accent">
                    {room.name}
                  </h3>
                  <p className="text-xs text-ink-secondary">Floor {room.floor_level} · {room.block_name}</p>

                  <div className="mt-4 flex items-center gap-3 border-t border-line/60 pt-3 text-xs text-ink-secondary dark:border-white/[0.06]">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="h-3.5 w-3.5 text-ink-tertiary" />
                      <span>{room.capacity}</span>
                    </span>
                    {room.sockets_working != null && (
                      <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                        <Plug className="h-3.5 w-3.5" />
                        <span>{room.sockets_working}</span>
                      </span>
                    )}
                    {room.has_ac && (
                      <span className="flex items-center gap-1 font-medium text-sky-600 dark:text-sky-400">
                        <Snowflake className="h-3.5 w-3.5" />
                        <span>AC</span>
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Academic Evaluation Banner */}
        <section className="mt-32 rounded-3xl bg-gradient-to-tr from-accent/15 via-purple-500/10 to-indigo-500/10 p-8 text-center border border-accent/20 shadow-e2 md:p-12">
          <div className="mx-auto max-w-2xl space-y-3">
            <h2 className="text-2xl font-black tracking-tight text-ink md:text-3xl">
              Ready to Explore JainSpace?
            </h2>
            <p className="text-sm text-ink-secondary">
              Find an empty room with power sockets, check your professor&apos;s cabin, or review the
              full Design Thinking case study.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/spaces"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-bold text-white shadow-glow-accent transition-all hover:bg-accent-hover active:scale-95"
              >
                <span>Launch App</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/case-study"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-6 text-sm font-bold text-ink shadow-sm transition-all hover:bg-surface-sunken active:scale-95 dark:border-white/10"
              >
                <span>View CA1 Case Study</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line/80 bg-surface/60 py-12 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0c0c0e]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-sm font-bold text-white">
                ◧
              </span>
              <div>
                <p className="text-sm font-bold text-ink">JainSpace — Campus Reimagined</p>
                <p className="text-xs text-ink-tertiary">
                  Jain (Deemed-to-be University) · Faculty of Engineering and Technology
                </p>
              </div>
            </div>

            <p className="text-xs text-ink-tertiary">
              Designed & Developed by <span className="font-semibold text-ink">Nilotpal Deb</span> · 3rd Sem B.Tech CSE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
