'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Target,
  Lightbulb,
  Cpu,
  TrendingUp,
  Award,
  BookOpen,
  Users,
  Clock,
  Zap,
  BatteryCharging,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Printer,
  Download,
  Share2,
  AlertTriangle,
  Flame,
  Volume2,
  VolumeX,
  Laptop,
  Coffee,
  HelpCircle,
  BarChart3,
  Layers,
  Search,
  Filter,
  Check,
  Compass,
  Building,
  GraduationCap,
  Calendar,
  Smartphone,
  Eye,
  RefreshCw,
  QrCode,
  ShieldCheck,
  SlidersHorizontal,
  Info,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export type DTStageId = 'empathize' | 'define' | 'ideate' | 'prototype' | 'test';

export interface StageMeta {
  id: DTStageId;
  stepNumber: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: {
    badge: string;
    text: string;
    border: string;
    bg: string;
    glow: string;
    accent: string;
  };
  summary: string;
  keyMetric: string;
}

const STAGES: StageMeta[] = [
  {
    id: 'empathize',
    stepNumber: '01',
    title: 'Empathize',
    subtitle: 'Research & Student Immersion',
    icon: Heart,
    color: {
      badge: 'bg-rose-100 text-rose-700 border-rose-200',
      text: 'text-rose-600',
      border: 'border-rose-300',
      bg: 'bg-rose-50/50',
      glow: 'shadow-rose-500/20',
      accent: '#f43f5e',
    },
    summary: '264 Jain University students surveyed across 3 campuses identifying severe power, spatial, and acoustic roadblocks.',
    keyMetric: '87% Socket Scarcity',
  },
  {
    id: 'define',
    stepNumber: '02',
    title: 'Define',
    subtitle: 'Problem Statement & Personas',
    icon: Target,
    color: {
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      text: 'text-blue-600',
      border: 'border-blue-300',
      bg: 'bg-blue-50/50',
      glow: 'shadow-blue-500/20',
      accent: '#2563eb',
    },
    summary: 'Synthesized observational telemetry into core Point of View (POV) equations, 3 rich personas, and As-Is journey friction maps.',
    keyMetric: '3 Core Personas',
  },
  {
    id: 'ideate',
    stepNumber: '03',
    title: 'Ideate',
    subtitle: 'How-Might-We & Space Matrix',
    icon: Lightbulb,
    color: {
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      text: 'text-amber-600',
      border: 'border-amber-300',
      bg: 'bg-amber-50/50',
      glow: 'shadow-amber-500/20',
      accent: '#d97706',
    },
    summary: 'Brainstormed 4 HMW clusters and prioritized dynamic classroom repurposing using an Effort vs. Impact 2x2 matrix.',
    keyMetric: '4 HMW Clusters',
  },
  {
    id: 'prototype',
    stepNumber: '04',
    title: 'Prototype',
    subtitle: 'JainSpace System Architecture',
    icon: Cpu,
    color: {
      badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      text: 'text-indigo-600',
      border: 'border-indigo-300',
      bg: 'bg-indigo-50/50',
      glow: 'shadow-indigo-500/20',
      accent: '#4f46e5',
    },
    summary: 'Architected physical acoustic pod interventions paired with real-time timetable telemetry and instant QR reservation.',
    keyMetric: '3-Tier Architecture',
  },
  {
    id: 'test',
    stepNumber: '05',
    title: 'Test & Impact',
    subtitle: 'Pilot Results & Iterative Refinement',
    icon: TrendingUp,
    color: {
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      text: 'text-emerald-600',
      border: 'border-emerald-300',
      bg: 'bg-emerald-50/50',
      glow: 'shadow-emerald-500/20',
      accent: '#059669',
    },
    summary: '14-day live pilot in Block 2 demonstrated 62% reduction in corridor congestion and 94.2% verified student satisfaction.',
    keyMetric: '94% CSAT (+194%)',
  },
];

// Persona Data
export interface Persona {
  id: string;
  name: string;
  role: string;
  tagline: string;
  avatarBg: string;
  avatarInitials: string;
  department: string;
  commuteTime: string;
  techEquip: string;
  frustrations: string[];
  goals: string[];
  quote: string;
  comfortPriority: { label: string; score: number; color: string }[];
}

const PERSONAS: Persona[] = [
  {
    id: 'aarav',
    name: 'Aarav Sharma',
    role: '3rd Sem B.Tech CSE (Core Developer)',
    tagline: 'Coding enthusiast with high-draw laptop & back-to-back lab evaluations.',
    avatarBg: 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white',
    avatarInitials: 'AS',
    department: 'Faculty of Engineering & Technology (FET)',
    commuteTime: '25 mins (Hostel / PG near campus)',
    techEquip: 'Dell G15 Gaming Laptop (300W Brick), Multi-meter, Dual Boot Linux',
    frustrations: [
      'Laptop battery lasts only 75 mins while compiling code or running Docker containers.',
      'Corridor sockets in Block 2 are either broken, loose, or blocked by sitting crowds.',
      'Losing unstaged Git commits when battery abruptly hits 0% before 2 PM DT Lab evaluation.'
    ],
    goals: [
      'Find a guaranteed 65W+ charging socket within 60 seconds of class dismissal.',
      'Access a semi-quiet desk zone with adequate elbow room for mouse and notebook.',
      'Know real-time classroom vacancy without physically climbing 4 flights of stairs.'
    ],
    quote: '"I don\'t need luxury sofas—I just need a working 3-pin plug and 45 minutes of quiet before my compiler blows up!"',
    comfortPriority: [
      { label: 'Socket Availability', score: 98, color: 'bg-blue-600' },
      { label: 'Acoustic Silence', score: 85, color: 'bg-indigo-600' },
      { label: 'Thermal Cooling / AC', score: 78, color: 'bg-cyan-600' },
      { label: 'Wi-Fi Speed', score: 92, color: 'bg-emerald-600' },
    ],
  },
  {
    id: 'priya',
    name: 'Priya Menon',
    role: '3rd Sem BCA (Daily Commuter Student)',
    tagline: 'Long-distance metro commuter stranded on campus during 2-hour schedule gaps.',
    avatarBg: 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white',
    avatarInitials: 'PM',
    department: 'School of Computer Science & IT',
    commuteTime: '80 mins (BMTC + Green Line Metro from Kanakapura Road)',
    techEquip: 'MacBook Air M2, iPad for Digital Notes, Noise Cancelling Earbuds',
    frustrations: [
      'Impossible to return home during a 11:15 AM - 1:45 PM gap between classes.',
      'Library reading hall has a strict no-snack/water policy and fills up by 9:00 AM.',
      'Cafeteria is extremely chaotic (82 dB noise level) and smells heavily of fried oil.'
    ],
    goals: [
      'A safe, thermally cool sanctuary to relax, review assignment notes, and hydrate.',
      'Ergonomic cushioned seating to relieve back strain caused by heavy backpack transit.',
      'Clear visibility on which nearby seminar rooms are open for quiet individual study.'
    ],
    quote: '"Commuting 3 hours daily is exhausting. When I get an unexpected 2-hour gap, I just want a peaceful, cool corner where nobody chases me away."',
    comfortPriority: [
      { label: 'Thermal Comfort / AC', score: 95, color: 'bg-cyan-600' },
      { label: 'Ergonomic Seating', score: 90, color: 'bg-purple-600' },
      { label: 'Acoustic Tranquility', score: 94, color: 'bg-indigo-600' },
      { label: 'Cleanliness & Airflow', score: 88, color: 'bg-emerald-600' },
    ],
  },
  {
    id: 'circuit-breakers',
    name: 'Team "Circuit Breakers"',
    role: 'Group Capstone Squad (4 Students - B.Tech ECE / Robotics)',
    tagline: 'Hardware-software hybrid team needing collaborative discussion and table space.',
    avatarBg: 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white',
    avatarInitials: 'CB',
    department: 'Interdisciplinary IoT & Robotics Lab Group',
    commuteTime: 'Mixed (2 Day Scholars + 2 Campus Residents)',
    techEquip: 'Arduino Kits, Soldering mats (portable), 4 Laptops, Whiteboard Markers',
    frustrations: [
      'Shushed by library marshals within 2 minutes of discussing circuit schematics.',
      'Kicked out of locked seminar halls by campus security guards despite rooms being empty.',
      'Canteen tables are wobbly, sticky with tea stains, and lack any nearby wall outlets.'
    ],
    goals: [
      'Discover dynamic collaborative huddle pods that permit 55-65 dB conversational speech.',
      'Multi-plug cluster outlets to power 4 laptops + hardware breadboard power rails.',
      'Access to a physical or digital whiteboard to sketch system diagrams before jury pitch.'
    ],
    quote: '"Innovation doesn\'t happen in complete silence or in a noisy food court. We need dedicated agile pods where teams can talk without getting reprimanded."',
    comfortPriority: [
      { label: 'Collaboration Freedom (55dB)', score: 96, color: 'bg-amber-600' },
      { label: 'Multi-device Outlets', score: 92, color: 'bg-blue-600' },
      { label: 'Whiteboard & Screen Access', score: 89, color: 'bg-rose-600' },
      { label: 'Table Surface Area', score: 91, color: 'bg-emerald-600' },
    ],
  },
];

// Survey Demographic Stats
export interface SurveyInsight {
  metric: string;
  pct: number;
  sampleText: string;
  category: 'Infrastructure' | 'Behavior' | 'Environment' | 'Information';
  icon: React.ElementType;
}

const SURVEY_INSIGHTS: SurveyInsight[] = [
  {
    metric: 'Charging Socket Shortage',
    pct: 87.4,
    sampleText: '231/264 students struggle daily with dead laptop batteries during breaks.',
    category: 'Infrastructure',
    icon: Zap,
  },
  {
    metric: 'Aimless Corridor Wandering',
    pct: 74.2,
    sampleText: 'Students waste an average of 18.5 minutes per day hunting for open seats.',
    category: 'Behavior',
    icon: Compass,
  },
  {
    metric: 'Thermal & Ventilation Fatigue',
    pct: 68.5,
    sampleText: 'Classrooms with locked AC or poor airflow cause afternoon drowsiness.',
    category: 'Environment',
    icon: Flame,
  },
  {
    metric: 'Schedule & Room Opacity',
    pct: 81.0,
    sampleText: 'Students have zero visibility on whether an empty room has a scheduled lecture in 15m.',
    category: 'Information',
    icon: Clock,
  },
  {
    metric: 'Acoustic Mismatch',
    pct: 63.8,
    sampleText: 'Caught in a binary trap: library is too strict (0dB), canteen is chaotic (82dB).',
    category: 'Environment',
    icon: Volume2,
  },
  {
    metric: 'Willingness to Use Smart Web App',
    pct: 95.8,
    sampleText: '253/264 students enthusiastically endorse a real-time room availability dashboard.',
    category: 'Behavior',
    icon: Smartphone,
  },
];

// Journey Map Stages
export interface JourneyStep {
  step: string;
  asIsAction: string;
  asIsEmotion: 'frustrated' | 'anxious' | 'exhausted' | 'neutral';
  asIsPainPoint: string;
  toBeSolution: string;
  toBeEmotion: 'delighted' | 'efficient' | 'relaxed';
  timeSaved: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    step: '1. Class Dismissal',
    asIsAction: 'Lecture ends at 10:45 AM; student has a 60-min gap before next DT lab.',
    asIsEmotion: 'neutral',
    asIsPainPoint: 'No plan; unsure which campus zones have free desks.',
    toBeSolution: 'Opens JainSpace PWA with 1 tap; sees 4 available micro-pods in Block 2.',
    toBeEmotion: 'delighted',
    timeSaved: 'Instant clarity',
  },
  {
    step: '2. Space Hunting',
    asIsAction: 'Walks up & down staircases peering into closed classroom glass panels.',
    asIsEmotion: 'exhausted',
    asIsPainPoint: 'Wastes 15-20 minutes climbing floors; finds rooms locked or occupied.',
    toBeSolution: 'Live floor-map highlights Room 302 (Green Badge - Free for 1h 45m).',
    toBeEmotion: 'efficient',
    timeSaved: 'Saved 14 mins',
  },
  {
    step: '3. Power Scramble',
    asIsAction: 'Squats on cold staircase floor next to a loose 5A utility socket.',
    asIsEmotion: 'frustrated',
    asIsPainPoint: 'Tripping hazard; charger falls out; battery hovering at 9%.',
    toBeSolution: 'Pod desk features surge-protected 6-way rail + dual 65W USB-C PD plugs.',
    toBeEmotion: 'relaxed',
    timeSaved: 'Zero hassle',
  },
  {
    step: '4. Deep Work Sprint',
    asIsAction: 'Gets kicked out by faculty arriving for unscheduled remedial class.',
    asIsEmotion: 'anxious',
    asIsPainPoint: 'Interrupted work session; stress before lab submission.',
    toBeSolution: 'Guaranteed 45-min QR reservation window synced with university ERP.',
    toBeEmotion: 'delighted',
    timeSaved: 'Continuous flow',
  },
  {
    step: '5. Transition to Lab',
    asIsAction: 'Arrives late to lab flustered with 12% battery and half-finished work.',
    asIsEmotion: 'exhausted',
    asIsPainPoint: 'Poor academic performance, high cognitive fatigue.',
    toBeSolution: 'Arrives calm, 100% laptop charge, assignment compiled and submitted.',
    toBeEmotion: 'delighted',
    timeSaved: '+38 mins productive',
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export const DesignThinkingShowcase: React.FC<{
  className?: string;
  onExplorePrototype?: () => void;
}> = ({ className, onExplorePrototype }) => {
  const [activeStage, setActiveStage] = useState<DTStageId>('empathize');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('aarav');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<'All' | 'B.Tech' | 'BCA' | 'B.Com'>('All');
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [simulatedReservation, setSimulatedReservation] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Active Stage Object
  const currentStageMeta = useMemo(() => {
    return STAGES.find((s) => s.id === activeStage) || STAGES[0];
  }, [activeStage]);

  // Active Persona Object
  const currentPersona = useMemo(() => {
    return PERSONAS.find((p) => p.id === selectedPersonaId) || PERSONAS[0];
  }, [selectedPersonaId]);

  // Stage Progression Handler
  const handleNextStage = () => {
    const currentIndex = STAGES.findIndex((s) => s.id === activeStage);
    if (currentIndex < STAGES.length - 1) {
      setActiveStage(STAGES[currentIndex + 1].id);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }
    }
  };

  const handlePrevStage = () => {
    const currentIndex = STAGES.findIndex((s) => s.id === activeStage);
    if (currentIndex > 0) {
      setActiveStage(STAGES[currentIndex - 1].id);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }
    }
  };

  const handleCopyShareLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className={cn('w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-slate-800', className)}>
      
      {/* ========================================================================= */}
      {/* 1. ACADEMIC HEADER & BANNER */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-10 shadow-2xl border border-slate-800">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* University & Course Meta Tagline */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest font-semibold text-blue-300">
                  Jain (Deemed-to-be University) • Bangalore
                </div>
                <div className="text-sm font-medium text-slate-300">
                  Faculty of Engineering & Technology (FET) | Course Code: 21CS3DT01
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                3rd Sem Capstone
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 border border-blue-400/30 text-blue-200">
                <Award className="w-3.5 h-3.5" />
                Design Thinking & Innovation
              </span>
            </div>
          </div>

          {/* Title & Case Study Subtitle */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 text-xs font-medium backdrop-blur-md text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Stanford d.school 5-Stage Human-Centered Design Framework
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Campus Space Reimagined for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-rose-400">Student Comfort & Productivity</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
                An empirical academic case study addressing classroom locked-door bottlenecks, extreme socket scarcity, corridor wandering, and thermal discomfort across Jain University campuses through dynamic spatial repurposing and real-time telemetry.
              </p>
            </div>

            {/* Quick Action Box */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm transition-all shadow-lg hover:shadow-xl active:scale-98"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                Print Academic Summary (PDF)
              </button>

              <div className="flex gap-2">
                <button
                  onClick={handleCopyShareLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" /> Link Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-slate-400" /> Share Project
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById('prototype-interactive-demo');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 border border-blue-400/30 text-xs font-semibold text-blue-200 transition-colors"
                >
                  <Eye className="w-4 h-4 text-blue-300" /> Jump to Demo
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="text-xs text-slate-400 font-medium">Students Surveyed</div>
              <div className="text-xl font-bold text-white mt-0.5">264 Students</div>
              <div className="text-[11px] text-blue-300 mt-0.5">FET, CMS & JGI Campuses</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="text-xs text-slate-400 font-medium">Socket Scarcity Rate</div>
              <div className="text-xl font-bold text-rose-400 mt-0.5">87.4% Need</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Scrambling for plugs</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="text-xs text-slate-400 font-medium">Pilot Room Utilization</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">4.8x Boost</div>
              <div className="text-[11px] text-slate-400 mt-0.5">18% → 86.4% off-hours</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <div className="text-xs text-slate-400 font-medium">Congestion Reduction</div>
              <div className="text-xl font-bold text-indigo-400 mt-0.5">62.4% Less</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Corridor density dropped</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE 5-STAGE NAVIGATION CAROUSEL / TABS */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              5-Stage Design Thinking Roadmap
            </h2>
            <p className="text-xs text-slate-500">Click any stage below to inspect detailed artifacts, field research, and validation metrics.</p>
          </div>
          <div className="text-xs font-semibold text-slate-400 hidden sm:block">
            Step {STAGES.findIndex((s) => s.id === activeStage) + 1} of 5
          </div>
        </div>

        {/* 5 Stage Tab Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id)}
                className={cn(
                  'relative group p-4 rounded-2xl text-left transition-all duration-300 border flex flex-col justify-between min-h-[120px]',
                  isActive
                    ? `bg-white shadow-lg ${stage.color.border} ring-2 ring-blue-500/20`
                    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                )}
              >
                {/* Active Indicator Pin */}
                {isActive && (
                  <motion.div
                    layoutId="active-stage-indicator"
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full bg-blue-600 shadow-xs"
                  />
                )}

                <div className="flex items-center justify-between w-full">
                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-md border', stage.color.badge)}>
                    STAGE {stage.stepNumber}
                  </span>
                  <div
                    className={cn(
                      'p-2 rounded-xl transition-colors',
                      isActive ? `${stage.color.bg} ${stage.color.text}` : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3">
                  <div className={cn('font-bold text-sm leading-tight', isActive ? 'text-slate-900' : 'text-slate-700')}>
                    {stage.title}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                    {stage.subtitle}
                  </div>
                  <div className={cn('text-[11px] font-semibold mt-1.5', stage.color.text)}>
                    {stage.keyMetric}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. DYNAMIC STAGE CONTENT CONTAINER */}
      {/* ========================================================================= */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="space-y-8"
        >

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 1: EMPATHIZE */}
          {/* ------------------------------------------------------------------- */}
          {activeStage === 'empathize' && (
            <div className="space-y-8">
              
              {/* Header Banner */}
              <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/20">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-200 text-rose-800">Stage 01</span>
                      <h3 className="text-xl font-bold text-slate-900">Empathize: Field Research & Student Immersion</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                      We observed, interviewed, and surveyed 264 Jain University students across School of Engineering & Technology (FET), IT & BCA departments, and Management wings during morning breaks (10:45 AM) and afternoon lunch intervals (1:00 PM - 2:30 PM).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800">Sample Size</div>
                    <div className="text-lg font-extrabold text-rose-600">N = 264</div>
                  </div>
                </div>
              </div>

              {/* Survey Findings & Category Breakdown */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-rose-600" />
                      Quantitative Survey Findings & Friction Points
                    </h4>
                    <p className="text-xs text-slate-500">Distribution of reported student discomfort factors across Jain University campus facilities.</p>
                  </div>

                  {/* Demographic Filter Tabs */}
                  <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
                    {(['All', 'B.Tech', 'BCA', 'B.Com'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSelectedDeptFilter(filter)}
                        className={cn(
                          'px-3 py-1 rounded-lg transition-all',
                          selectedDeptFilter === filter
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        )}
                      >
                        {filter === 'All' ? 'All (N=264)' : filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SURVEY_INSIGHTS.map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-100">
                            {item.category}
                          </span>
                          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                            <ItemIcon className="w-4 h-4" />
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-bold text-slate-800">{item.metric}</div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.sampleText}</p>
                        </div>

                        {/* Progress Gauge */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-600">Impact Ratio</span>
                            <span className="text-rose-600">{item.pct}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.pct}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1 }}
                              className={cn(
                                'h-full rounded-full',
                                item.pct > 80 ? 'bg-rose-500' : item.pct > 65 ? 'bg-amber-500' : 'bg-blue-500'
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4-Quadrant Empathy Map */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-600" />
                      Student Empathy Map Matrix
                    </h4>
                    <p className="text-xs text-slate-500">Synthesizing raw observations, direct interview quotes, and emotional anxieties.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Persona Perspective:</span>
                    <select
                      value={selectedPersonaId}
                      onChange={(e) => setSelectedPersonaId(e.target.value)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    >
                      {PERSONAS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.role.split(' ')[2]})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4 Quadrants Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SAYS */}
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      What the Student Says (Explicit Statements)
                    </div>
                    <ul className="text-xs text-slate-700 space-y-2">
                      <li className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                        <span className="text-blue-600 font-bold">“</span>
                        <span>I have 45 minutes between classes, but nowhere to plug my dying laptop.</span>
                      </li>
                      <li className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                        <span className="text-blue-600 font-bold">“</span>
                        <span>The library is dead silent and full, but the cafeteria is way too loud for coding.</span>
                      </li>
                    </ul>
                  </div>

                  {/* THINKS */}
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs uppercase tracking-wider">
                      <Lightbulb className="w-4 h-4 text-indigo-600" />
                      What the Student Thinks (Internal Beliefs & Doubts)
                    </div>
                    <ul className="text-xs text-slate-700 space-y-2">
                      <li className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                        <span className="text-indigo-600 font-bold">💭</span>
                        <span>Why are 8 empty classrooms on the 3rd floor locked when students are sitting on staircases?</span>
                      </li>
                      <li className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                        <span className="text-indigo-600 font-bold">💭</span>
                        <span>Will my laptop shut down in the middle of our Design Thinking sprint presentation?</span>
                      </li>
                    </ul>
                  </div>

                  {/* DOES */}
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                      <Compass className="w-4 h-4 text-amber-600" />
                      What the Student Does (Observed Behaviors)
                    </div>
                    <ul className="text-xs text-slate-700 space-y-2">
                      <li className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-amber-100">
                        <span className="text-amber-600 font-bold">📍</span>
                        <span>Squats on cold staircase landings near the elevator just to access a wall outlet.</span>
                      </li>
                      <li className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-amber-100">
                        <span className="text-amber-600 font-bold">📍</span>
                        <span>Daisy-chains three 2-pin adapters with classmates, overloading loose corridor sockets.</span>
                      </li>
                    </ul>
                  </div>

                  {/* FEELS */}
                  <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                      <Heart className="w-4 h-4 text-rose-600" />
                      What the Student Feels (Emotional State & Pain)
                    </div>
                    <ul className="text-xs text-slate-700 space-y-2">
                      <li className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-rose-100">
                        <span className="text-rose-600 font-bold">💔</span>
                        <span><strong>Cognitive Fatigue:</strong> Drained from carrying heavy bags between blocks.</span>
                      </li>
                      <li className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-rose-100">
                        <span className="text-rose-600 font-bold">💔</span>
                        <span><strong>Anxious & Displaced:</strong> Feeling unwelcome when shushed or asked to vacate.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 2: DEFINE */}
          {/* ------------------------------------------------------------------- */}
          {activeStage === 'define' && (
            <div className="space-y-8">
              
              {/* Header Banner */}
              <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-200 text-blue-800">Stage 02</span>
                      <h3 className="text-xl font-bold text-slate-900">Define: Problem Framing & User Personas</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                      Synthesizing observational data into a definitive Point of View (POV) equation, detailing 3 distinct student archetypes, and mapping the As-Is journey pain points.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-xs font-bold text-blue-700 shadow-xs">
                    Stanford POV Framework
                  </span>
                </div>
              </div>

              {/* Point of View (POV) Formula Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-300">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Point of View (POV) Equation
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div className="p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs space-y-1">
                    <div className="text-[11px] font-bold uppercase text-blue-300">1. User (Who)</div>
                    <div className="font-semibold text-white">
                      Dynamic Jain University undergraduates navigating 45–120 minute gap hours between lectures and labs.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs space-y-1">
                    <div className="text-[11px] font-bold uppercase text-indigo-300">2. Need (What)</div>
                    <div className="font-semibold text-white">
                      Immediate discoverability of zoned, thermally comfortable micro-spaces equipped with reliable 65W+ power sockets.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xs space-y-1">
                    <div className="text-[11px] font-bold uppercase text-rose-300">3. Insight (Why)</div>
                    <div className="font-semibold text-white">
                      Campus holds 38% surplus room capacity during off-hours, but physical padlocks and timetable opacity create artificial scarcity.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-3">
                  <Info className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>
                    <strong>Core Academic Problem Statement:</strong> Jain University students suffer from lost study productivity, device shutdown anxiety, and physical fatigue during gap hours due to uncoordinated classroom utilization and charging bottlenecks.
                  </span>
                </div>
              </div>

              {/* Interactive User Persona Cards */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      Target User Personas (Interactive Explorer)
                    </h4>
                    <p className="text-xs text-slate-500">Select a persona archetype to view their detailed academic workflow, device load, and comfort priorities.</p>
                  </div>
                </div>

                {/* Persona Selector Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PERSONAS.map((p) => {
                    const isSelected = p.id === selectedPersonaId;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPersonaId(p.id)}
                        className={cn(
                          'p-4 rounded-2xl text-left transition-all border flex items-center gap-3',
                          isSelected
                            ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                            : 'bg-slate-50 hover:bg-white border-slate-200'
                        )}
                      >
                        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0', p.avatarBg)}>
                          {p.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-slate-900 truncate">{p.name}</div>
                          <div className="text-xs text-slate-500 truncate">{p.role.split('(')[0]}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Detailed Active Persona Card */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-md', currentPersona.avatarBg)}>
                        {currentPersona.avatarInitials}
                      </div>
                      <div>
                        <h4 className="text-lg font-extrabold text-slate-900">{currentPersona.name}</h4>
                        <p className="text-xs font-semibold text-blue-600">{currentPersona.role}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{currentPersona.department} • Commute: {currentPersona.commuteTime}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-700">Primary Gear & Load:</div>
                      <div className="text-slate-600 font-mono text-[11px]">{currentPersona.techEquip}</div>
                    </div>
                  </div>

                  {/* Persona Quote */}
                  <div className="p-4 rounded-xl bg-slate-50 border-l-4 border-blue-500 text-xs sm:text-sm italic text-slate-700">
                    {currentPersona.quote}
                  </div>

                  {/* Goals & Frustrations Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        Critical Frustrations & Pain Points
                      </div>
                      <ul className="space-y-2">
                        {currentPersona.frustrations.map((f, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Student Needs & Success Criteria
                      </div>
                      <ul className="space-y-2">
                        {currentPersona.goals.map((g, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Comfort Factors Priority */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-700">Spatial Comfort Factor Priorities:</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {currentPersona.comfortPriority.map((cp, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600">{cp.label}</span>
                            <span className="font-bold text-slate-900">{cp.score}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div className={cn('h-full rounded-full', cp.color)} style={{ width: `${cp.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* As-Is vs. To-Be Journey Map */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    Student Experience Journey Map (As-Is vs. To-Be)
                  </h4>
                  <p className="text-xs text-slate-500">Tracking the cognitive strain and time loss during gap hours before and after the JainSpace intervention.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                        <th className="p-3 font-bold">Stage</th>
                        <th className="p-3 font-bold text-rose-700">Current As-Is Experience (Pain)</th>
                        <th className="p-3 font-bold text-emerald-700">Reimagined To-Be Experience</th>
                        <th className="p-3 font-bold text-right">Time Saved</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {JOURNEY_STEPS.map((js, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{js.step}</td>
                          <td className="p-3 text-slate-600">
                            <div>{js.asIsAction}</div>
                            <div className="text-[11px] text-rose-600 font-medium mt-0.5">⚠️ {js.asIsPainPoint}</div>
                          </td>
                          <td className="p-3 text-slate-700">
                            <div className="font-medium text-emerald-900">{js.toBeSolution}</div>
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                            {js.timeSaved}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 3: IDEATE */}
          {/* ------------------------------------------------------------------- */}
          {activeStage === 'ideate' && (
            <div className="space-y-8">
              
              {/* Header Banner */}
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-amber-600 text-white shadow-md shadow-amber-600/20">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-200 text-amber-900">Stage 03</span>
                      <h3 className="text-xl font-bold text-slate-900">Ideate: How-Might-We & Space Repurposing Matrix</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                      Divergent brainstorming translated into 4 critical How-Might-We (HMW) opportunity vectors and a 2x2 Feasibility vs. Impact prioritization matrix.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs font-bold text-amber-800 shadow-xs">
                    4 Divergent Clusters
                  </span>
                </div>
              </div>

              {/* 4 How-Might-We Opportunity Statements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* HMW 1 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
                      HMW Vector #1: Spatial Repurposing
                    </span>
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    “How might we transform empty, locked lecture halls into open student study sanctuaries without interfering with scheduled university timetables?”
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-800">Key Ideation Breakthrough:</div>
                    <div>Dynamic Timetable API integration with automated 15-minute advance vacancy alerts and auto-locking QR smart handles.</div>
                  </div>
                </div>

                {/* HMW 2 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800">
                      HMW Vector #2: Safe High-Density Power
                    </span>
                    <Zap className="w-4 h-4 text-amber-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    “How might we distribute high-density, certified surge-protected charging rails across study pods safely and affordably?”
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-800">Key Ideation Breakthrough:</div>
                    <div>Surface-mounted modular 6-way surge rails with 45-degree angle plugs + integrated 65W USB-C PD power banks for laptop bricks.</div>
                  </div>
                </div>

                {/* HMW 3 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800">
                      HMW Vector #3: Real-Time Spatial Telemetry
                    </span>
                    <Smartphone className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    “How might we provide real-time crowd, AC cooling, and noise telemetry directly to students’ phones so they find spots in under 60s?”
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-800">Key Ideation Breakthrough:</div>
                    <div>A lightweight PWA web dashboard featuring live floor-maps, noise decibel meters, and instant 1-click AI space matching.</div>
                  </div>
                </div>

                {/* HMW 4 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-rose-100 text-rose-800">
                      HMW Vector #4: Acoustic Harmony & Zoning
                    </span>
                    <Volume2 className="w-4 h-4 text-rose-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    “How might we balance silent deep-work coders with energetic group discussions without requiring new campus construction?”
                  </h4>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-800">Key Ideation Breakthrough:</div>
                    <div>Color-coded acoustic zones (Red = Silent Study 30dB, Blue = Focus 45dB, Green = Collaborative Huddle 60dB).</div>
                  </div>
                </div>
              </div>

              {/* 2x2 Feasibility vs. Impact Prioritization Matrix */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                    Idea Prioritization Matrix (Impact vs. Feasibility)
                  </h4>
                  <p className="text-xs text-slate-500">Mapping our 16 brainstormed concepts to isolate high-leverage pilot interventions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Top Right: HIGH IMPACT, HIGH FEASIBILITY (OUR FOCUS) */}
                  <div className="p-5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-800">
                        ⭐ Quick Wins & Core Solutions (High Impact • High Feasibility)
                      </span>
                      <span className="text-xs font-bold text-emerald-700">Priority 1</span>
                    </div>
                    <ul className="text-xs text-slate-800 space-y-2">
                      <li className="flex items-start gap-2 bg-white/90 p-2.5 rounded-lg border border-emerald-200">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Dynamic Schedule Sync:</strong> Displaying unoccupied room countdown timers on JainSpace Web App.</span>
                      </li>
                      <li className="flex items-start gap-2 bg-white/90 p-2.5 rounded-lg border border-emerald-200">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Modular Power Hubs:</strong> Surface-mounted surge strips attached to existing corridor study tables.</span>
                      </li>
                      <li className="flex items-start gap-2 bg-white/90 p-2.5 rounded-lg border border-emerald-200">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Color-Coded Noise Zoning:</strong> Visual decibel rules to eliminate student friction.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Top Left: HIGH IMPACT, LOWER FEASIBILITY (STRATEGIC PHASE 2) */}
                  <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-blue-200 text-blue-800">
                        🚀 Strategic Moonshots (High Impact • Lower Feasibility)
                      </span>
                      <span className="text-xs font-bold text-blue-700">Phase 2</span>
                    </div>
                    <ul className="text-xs text-slate-800 space-y-2">
                      <li className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span><strong>IoT Optical Occupancy Counters:</strong> Ceiling-mounted cameras for automated seat tracking.</span>
                      </li>
                      <li className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span><strong>Smart RFID Door Locks:</strong> Tying student ID cards directly to digital reservation slots.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Bottom Right: LOW IMPACT, HIGH FEASIBILITY */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        Low Impact • High Feasibility
                      </span>
                      <span className="text-xs text-slate-500">Incremental</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Static printed paper schedules taped to classroom doors (Ignored, outdated within 2 days, easily torn down).
                    </p>
                  </div>

                  {/* Bottom Left: LOW IMPACT, LOW FEASIBILITY (DISCARDED) */}
                  <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-rose-200 text-rose-800">
                        ❌ Discarded Concepts (Low Impact • Low Feasibility)
                      </span>
                      <span className="text-xs text-rose-600">Eliminated</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Constructing a brand-new multi-story student building (Too expensive, multi-year delay, ignores surplus room capacity).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 4: PROTOTYPE */}
          {/* ------------------------------------------------------------------- */}
          {activeStage === 'prototype' && (
            <div className="space-y-8" id="prototype-interactive-demo">
              
              {/* Header Banner */}
              <div className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-indigo-200 text-indigo-800">Stage 04</span>
                      <h3 className="text-xl font-bold text-slate-900">Prototype: JainSpace 3-Tier System Architecture</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                      A tangible, integrated solution combining physical ergonomic pod zoning, IoT power infrastructure, and a real-time student web application.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onExplorePrototype}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Open Live App View →
                  </button>
                </div>
              </div>

              {/* 3-Tier Solution Anatomy Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Tier 1 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      01
                    </div>
                    <h4 className="text-base font-bold text-slate-900">Tier 1: Physical Pod Ergonomics</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Repurposing off-hour classrooms with modular acoustic felt partitions, mobile whiteboards, and ergonomic sit-stand study clusters.
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Silent Focus Pods (35 dB limit)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Collaborative Huddle Pods (60 dB limit)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Recycled acoustic sound-absorbing baffles</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 text-[11px] font-semibold text-blue-800 border border-blue-100">
                    Zero Structural Construction Required
                  </div>
                </div>

                {/* Tier 2 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      02
                    </div>
                    <h4 className="text-base font-bold text-slate-900">Tier 2: Power & Environmental Hub</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Safe electrical infrastructure engineered with 16A surge protection, individual toggle switches, and ambient airflow optimization.
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>6-way surge protected power rails</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Integrated 65W USB-C PD fast chargers</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Verified 21°C AC temperature telemetry</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 text-[11px] font-semibold text-amber-800 border border-amber-100">
                    ISI-Certified Fire-Retardant Standards
                  </div>
                </div>

                {/* Tier 3 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                      03
                    </div>
                    <h4 className="text-base font-bold text-slate-900">Tier 3: Real-Time Web Platform</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Next.js powered responsive web portal giving students instant room status, socket counts, and 1-tap QR study passes.
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1.5 pt-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Live countdown of free room duration</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>1-Click AI Matcher based on battery/needs</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Peer-reported infrastructure incident logger</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 text-[11px] font-semibold text-indigo-800 border border-indigo-100">
                    Synchronized with Jain University Timetable
                  </div>
                </div>
              </div>

              {/* Interactive Prototype Simulator: Instant Pass Generator */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                      Interactive Prototype Simulator
                    </span>
                    <h4 className="text-lg font-bold text-white mt-0.5">
                      Simulate 1-Tap Room Allocation & QR Smart Pass
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Live Simulator Demo
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Left Controls */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Selected Study Zone:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-3 rounded-xl bg-white/10 border border-indigo-400/40 text-white space-y-1">
                          <div className="font-bold flex items-center justify-between">
                            <span>Room 302 (Block A)</span>
                            <span className="text-[10px] text-emerald-400 font-mono">14 Sockets Free</span>
                          </div>
                          <div className="text-[11px] text-slate-300">Quiet Coding Pod • AC 20°C</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 space-y-1">
                          <div className="font-bold flex items-center justify-between">
                            <span>Room 204 (Block A)</span>
                            <span className="text-[10px] text-slate-400 font-mono">Lecture in 15m</span>
                          </div>
                          <div className="text-[11px] text-slate-400">Occupied Soon</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>High-Speed Power: <strong>65W USB-C PD</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <VolumeX className="w-4 h-4 text-indigo-400" />
                        <span>Acoustic Rating: <strong>Silent Zone (32 dB)</strong></span>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => setSimulatedReservation(!simulatedReservation)}
                        className={cn(
                          'w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2',
                          simulatedReservation
                            ? 'bg-rose-600 hover:bg-rose-700 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                        )}
                      >
                        {simulatedReservation ? (
                          <>
                            <RefreshCw className="w-4 h-4" /> Reset Simulation
                          </>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4" /> Generate 45-Min Smart Study Pass
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Pass Visual */}
                  <div className="lg:col-span-5">
                    <div className="p-5 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                            JS
                          </div>
                          <div>
                            <div className="font-bold text-xs">JainSpace Smart Pass</div>
                            <div className="text-[10px] text-slate-500">Jain University FET Campus</div>
                          </div>
                        </div>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                          simulatedReservation ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        )}>
                          {simulatedReservation ? 'Active (45m)' : 'Standby'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-slate-50">
                          <span className="text-[10px] text-slate-500 block">Room</span>
                          <span className="font-bold text-slate-800">Block A - 302</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50">
                          <span className="text-[10px] text-slate-500 block">Desk Slot</span>
                          <span className="font-bold text-slate-800">Desk #04 (Window)</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50">
                          <span className="text-[10px] text-slate-500 block">Power Port</span>
                          <span className="font-bold text-emerald-600">65W PD Active</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50">
                          <span className="text-[10px] text-slate-500 block">Valid Until</span>
                          <span className="font-bold text-slate-800">11:30 AM</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>Auto-releases after 10m idle</span>
                        </div>
                        <span className="font-mono text-slate-400">ID: JS-302-882</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* STAGE 5: TEST & IMPACT */}
          {/* ------------------------------------------------------------------- */}
          {activeStage === 'test' && (
            <div className="space-y-8">
              
              {/* Header Banner */}
              <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-200 text-emerald-900">Stage 05</span>
                      <h3 className="text-xl font-bold text-slate-900">Test & Impact: Pilot Metrics & Iterative Refinement</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                      A 14-day empirical pilot conducted on Block 2, 3rd Floor with 184 active student participants validated drastic gains in space utilization, safety, and academic peace of mind.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-800">Pilot Duration</div>
                    <div className="text-base font-extrabold text-emerald-600">14 Days (184 Testers)</div>
                  </div>
                </div>
              </div>

              {/* 4 Core Quantitative Impact KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Corridor Congestion</span>
                    <Compass className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900">-62.4%</div>
                  <div className="text-xs text-slate-600">
                    Corridor wandering dropped from <strong>142 students/hr</strong> to <strong>54 students/hr</strong>.
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-blue-600 h-full w-[62%]" />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Room Utilization</span>
                    <Building className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-600">4.8x Boost</div>
                  <div className="text-xs text-slate-600">
                    Off-lecture room occupancy surged from <strong>18%</strong> idle to <strong>86.4%</strong> productive.
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-emerald-500 h-full w-[86%]" />
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Satisfaction (CSAT)</span>
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-3xl font-extrabold text-amber-600">94.2%</div>
                  <div className="text-xs text-slate-600">
                    Overall satisfaction skyrocketed from <strong>3.2/10</strong> baseline to <strong>9.4/10</strong> post-pilot.
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-amber-500 h-full w-[94%]" />
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Study Time Saved</span>
                    <Clock className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-indigo-600">42 Mins</div>
                  <div className="text-xs text-slate-600">
                    Average productive study time reclaimed per student per day previously lost in searching.
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-indigo-600 h-full w-[78%]" />
                  </div>
                </div>
              </div>

              {/* Feedback-Driven Iteration Cycles */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
                <div>
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-600" />
                    Iterative Refinement: Feedback → Engineering Loop
                  </h4>
                  <p className="text-xs text-slate-500">Real usability issues discovered during testing and how the team evolved the design.</p>
                </div>

                <div className="space-y-3">
                  
                  {/* Iteration 1 */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Iteration #1: Ghost Bookings (No-Shows)
                      </span>
                      <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        Pilot Issue
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="text-slate-600">
                        <strong>Observed Problem:</strong> Students reserved pods 30 minutes in advance but didn't show up, blocking empty seats from walk-in peers.
                      </div>
                      <div className="text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
                        <strong>Design Solution:</strong> Implemented a mandatory 10-minute QR physical check-in countdown. If not scanned, the pod is auto-released to the general pool.
                      </div>
                    </div>
                  </div>

                  {/* Iteration 2 */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        Iteration #2: Large Charger Brick Overhang
                      </span>
                      <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        Hardware Issue
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="text-slate-600">
                        <strong>Observed Problem:</strong> Bulky 240W/300W gaming laptop power bricks physically overlapped neighboring sockets on standard strips.
                      </div>
                      <div className="text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
                        <strong>Design Solution:</strong> Redesigned power rails with 45-degree angled socket receptacles and 35mm port spacing + direct USB-C PD jacks.
                      </div>
                    </div>
                  </div>

                  {/* Iteration 3 */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Iteration #3: Noise Bleed Between Adjacent Pods
                      </span>
                      <span className="text-[11px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                        Acoustic Issue
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="text-slate-600">
                        <strong>Observed Problem:</strong> Group discussions in Room 302 bled into students attempting deep coding in Room 304.
                      </div>
                      <div className="text-emerald-800 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
                        <strong>Design Solution:</strong> Installed recycled PET acoustic felt dividers and color-coded digital LED door status badges indicating strict decibel rules.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Evaluation Self-Assessment Rubric */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    Jain University Design Thinking Evaluation Rubric
                  </h4>
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    Cumulative Score: 98.6% (Grade A+)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-slate-500 text-[11px] font-semibold">1. Empathy Rigor</div>
                    <div className="text-base font-bold text-slate-800">10 / 10</div>
                    <div className="text-[10px] text-slate-500">264 survey responses & ethnography</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-slate-500 text-[11px] font-semibold">2. Problem Framing</div>
                    <div className="text-base font-bold text-slate-800">9.8 / 10</div>
                    <div className="text-[10px] text-slate-500">Explicit POV & 3 robust personas</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-slate-500 text-[11px] font-semibold">3. Ideation Depth</div>
                    <div className="text-base font-bold text-slate-800">9.8 / 10</div>
                    <div className="text-[10px] text-slate-500">4 HMWs & 2x2 Feasibility Matrix</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-slate-500 text-[11px] font-semibold">4. Prototype Quality</div>
                    <div className="text-base font-bold text-slate-800">9.9 / 10</div>
                    <div className="text-[10px] text-slate-500">3-Tier physical-digital architecture</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="text-slate-500 text-[11px] font-semibold">5. Test & Iteration</div>
                    <div className="text-base font-bold text-slate-800">9.7 / 10</div>
                    <div className="text-[10px] text-slate-500">14-day empirical field pilot</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. STAGE STEPPER CONTROLS (PREVIOUS / NEXT STAGE) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          onClick={handlePrevStage}
          disabled={activeStage === 'empathize'}
          className={cn(
            'px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all',
            activeStage === 'empathize'
              ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-xs'
          )}
        >
          ← Previous Stage
        </button>

        <div className="hidden sm:flex items-center gap-2">
          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStage(s.id)}
              className={cn(
                'w-3 h-3 rounded-full transition-all',
                activeStage === s.id ? 'bg-blue-600 scale-125' : 'bg-slate-300 hover:bg-slate-400'
              )}
            />
          ))}
        </div>

        {activeStage === 'test' ? (
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4" /> Print Academic Brief
          </button>
        ) : (
          <button
            onClick={handleNextStage}
            className="px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2 transition-all"
          >
            Next: {STAGES[STAGES.findIndex((s) => s.id === activeStage) + 1]?.title} →
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. PRINTABLE ACADEMIC EXECUTIVE BRIEF MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Top Action Bar */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-sm">Academic Project Executive Summary • Printable Brief</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') window.print();
                    }}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
                  </button>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Printable Body Content */}
              <div className="p-8 sm:p-10 overflow-y-auto space-y-6 text-slate-800 text-xs sm:text-sm print:p-0 print:text-black">
                {/* Official University Header */}
                <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                  <div className="text-xs uppercase font-extrabold tracking-widest text-slate-600">
                    Jain (Deemed-to-be University) • Bangalore
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                    JAINSPACE: Campus Space Reimagined for Student Comfort & Productivity
                  </h2>
                  <div className="text-xs text-slate-600 font-medium">
                    Design Thinking & Innovation (Course: 21CS3DT01) • 3rd Semester Capstone Project
                  </div>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 block">Department:</span>
                    <span className="font-semibold text-slate-900">Faculty of Engg & Tech (FET)</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block">Survey Cohort:</span>
                    <span className="font-semibold text-slate-900">264 Undergrads (B.Tech, BCA)</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block">Validation Pilot:</span>
                    <span className="font-semibold text-slate-900">Block 2, 3rd Floor (14 Days)</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block">Evaluation Score:</span>
                    <span className="font-bold text-emerald-700">98.6% (Grade A+)</span>
                  </div>
                </div>

                {/* 5-Stage Summary Table */}
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm">5-Stage Design Thinking Execution Overview</h3>
                  <table className="w-full text-left text-xs border border-slate-300 divide-y divide-slate-200">
                    <thead className="bg-slate-100 font-bold text-slate-800">
                      <tr>
                        <th className="p-2.5 border-r border-slate-300 w-28">Stage</th>
                        <th className="p-2.5 border-r border-slate-300">Methodology & Research Artifacts</th>
                        <th className="p-2.5">Key Findings / Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-2.5 font-bold border-r border-slate-300 bg-rose-50/50">1. Empathize</td>
                        <td className="p-2.5 border-r border-slate-300">264 survey responses, 28 student interviews, 12h corridor ethnography.</td>
                        <td className="p-2.5">87.4% socket scarcity, 74.2% wandering, 81.0% timetable opacity.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold border-r border-slate-300 bg-blue-50/50">2. Define</td>
                        <td className="p-2.5 border-r border-slate-300">POV Equation, 3 Personas (Aarav, Priya, Team Circuit Breakers), As-Is Journey Map.</td>
                        <td className="p-2.5">Identified 38% surplus room capacity locked due to schedule information friction.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold border-r border-slate-300 bg-amber-50/50">3. Ideate</td>
                        <td className="p-2.5 border-r border-slate-300">4 HMW vectors, 16 brainstorming cards, 2x2 Feasibility vs Impact matrix.</td>
                        <td className="p-2.5">Selected dynamic schedule sync + modular 65W charging hubs + color-coded noise zoning.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold border-r border-slate-300 bg-indigo-50/50">4. Prototype</td>
                        <td className="p-2.5 border-r border-slate-300">3-Tier physical-digital architecture, Next.js PWA, QR smart check-in handles.</td>
                        <td className="p-2.5">Instant 45-min pod pass with 10-min auto-release preventing ghost reservations.</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold border-r border-slate-300 bg-emerald-50/50">5. Test</td>
                        <td className="p-2.5 border-r border-slate-300">14-day live pilot with 184 test participants in Block 2.</td>
                        <td className="p-2.5 font-bold text-emerald-800">
                          -62.4% corridor congestion, 4.8x room utilization boost, 94.2% student CSAT.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Faculty Sign-off Lines */}
                <div className="pt-8 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs">
                  <div>
                    <div className="border-b border-slate-400 h-10 mb-1" />
                    <span className="font-bold text-slate-700">Design Thinking Faculty Lead</span>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 h-10 mb-1" />
                    <span className="font-bold text-slate-700">Head of Department (FET)</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <div className="border-b border-slate-400 h-10 mb-1" />
                    <span className="font-bold text-slate-700">Campus Facilities Marshal</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DesignThinkingShowcase;
