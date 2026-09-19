'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Wind,
  Users,
  Compass,
  Layers,
  Sparkles,
  BookOpen,
  Calendar,
  X,
  LayoutGrid,
  Table,
  Clock,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronRight,
  Info,
  ArrowLeft
} from 'lucide-react';
import { JAIN_ROOMS, Room, isRoomFreeAt, getRemainingFreeMinutes, RoomCategory } from '@/data/rooms';
import { useAuth } from '@/context/AuthContext';
import { Sidebar, NavTabType } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { DashboardHome } from '@/components/DashboardHome';
import { RoomCard } from '@/components/RoomCard';
import { RoomModal } from '@/components/RoomModal';
import { FloorMap } from '@/components/FloorMap';
import { SmartMatcher } from '@/components/SmartMatcher';
import { CrowdCheckIn } from '@/components/CrowdCheckIn';
import { ReportIssueModal } from '@/components/ReportIssueModal';
import { BookingsModal } from '@/components/BookingsModal';
import { CA1EmpathyRubricPackage } from '@/components/CA1EmpathyRubricPackage';
import { DesignThinkingShowcase } from '@/components/DesignThinkingShowcase';
import { SettingsView } from '@/components/SettingsView';
import { LoginPage } from '@/components/LoginPage';

export default function Home() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTabType>('home');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('10:45'); // Peak break time in timetable
  const [showLoginView, setShowLoginView] = useState<boolean>(false);
  
  // Explorer View Filters
  const [viewMode, setViewMode] = useState<'grid' | 'matrix'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<'all' | 1 | 2 | 3 | 4>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyAvailableNow, setOnlyAvailableNow] = useState<boolean>(false);
  const [acRequired, setAcRequired] = useState<boolean>(false);
  const [highPowerSockets, setHighPowerSockets] = useState<boolean>(false);
  const [silentStudyOnly, setSilentStudyOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'sockets' | 'comfort' | 'freeTime' | 'capacity'>('recommended');

  // Analytics subview
  const [caseStudySubView, setCaseStudySubView] = useState<'rubric' | 'full-case-study'>('rubric');

  // Modals
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetRoom, setReportTargetRoom] = useState<Room | null>(null);
  const [bookingsModalOpen, setBookingsModalOpen] = useState(false);

  // Available room counts
  const freeRoomsCount = useMemo(() => {
    return JAIN_ROOMS.filter((r) => isRoomFreeAt(r, currentTime)).length;
  }, [currentTime]);

  // Categories list with counts
  const categories = useMemo(() => {
    return [
      { id: 'all', label: 'All Spaces', count: JAIN_ROOMS.length },
      { id: 'Smart Classroom', label: 'Classrooms', count: JAIN_ROOMS.filter(r => r.category === 'Smart Classroom').length },
      { id: 'Computer / Tech Lab', label: 'Labs', count: JAIN_ROOMS.filter(r => r.category === 'Computer / Tech Lab').length },
      { id: 'Silent Study Pod', label: 'Project Pods', count: JAIN_ROOMS.filter(r => r.category === 'Silent Study Pod').length },
      { id: 'Design & Innovation Studio', label: 'Innovation Studios', count: JAIN_ROOMS.filter(r => r.category === 'Design & Innovation Studio').length },
      { id: 'Seminar Amphitheatre', label: 'Seminar Halls', count: JAIN_ROOMS.filter(r => r.category === 'Seminar Amphitheatre').length },
    ];
  }, []);

  // Filtered & Sorted rooms engine
  const filteredRooms = useMemo(() => {
    let result = [...JAIN_ROOMS];

    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cleanQ = q.replace(/\s+/g, '');
      result = result.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.code.toLowerCase().replace(/\s+/g, '').includes(cleanQ) ||
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.wing.toLowerCase().includes(q) ||
          r.block.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.noiseVibe.toLowerCase().includes(q) ||
          r.floorLabel.toLowerCase().includes(q) ||
          (r.bestFor && r.bestFor.some(tag => tag.toLowerCase().includes(q))) ||
          (r.amenities && r.amenities.some(a => a.toLowerCase().includes(q)))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    // 3. Floor Filter
    if (selectedFloor !== 'all') {
      result = result.filter((r) => r.floor === selectedFloor);
    }

    // 4. Availability Filter
    if (onlyAvailableNow) {
      result = result.filter((r) => isRoomFreeAt(r, currentTime));
    }

    // 5. AC Climate Control Filter
    if (acRequired) {
      result = result.filter((r) => r.hasAC);
    }

    // 6. High-Power Sockets Filter (18+ sockets)
    if (highPowerSockets) {
      result = result.filter((r) => r.chargingPoints >= 18);
    }

    // 7. Silent Study Filter
    if (silentStudyOnly) {
      result = result.filter((r) => r.noiseVibe === 'Silent Study');
    }

    // 8. Sorting Engine
    result.sort((a, b) => {
      if (sortBy === 'sockets') {
        return b.chargingPoints - a.chargingPoints;
      }
      if (sortBy === 'comfort') {
        return b.comfortScore - a.comfortScore;
      }
      if (sortBy === 'freeTime') {
        return getRemainingFreeMinutes(b, currentTime) - getRemainingFreeMinutes(a, currentTime);
      }
      if (sortBy === 'capacity') {
        return b.capacity - a.capacity;
      }
      const aFree = isRoomFreeAt(a, currentTime) ? 1 : 0;
      const bFree = isRoomFreeAt(b, currentTime) ? 1 : 0;
      if (aFree !== bFree) return bFree - aFree;
      return b.comfortScore - a.comfortScore;
    });

    return result;
  }, [
    searchQuery,
    selectedCategory,
    selectedFloor,
    onlyAvailableNow,
    acRequired,
    highPowerSockets,
    silentStudyOnly,
    sortBy,
    currentTime,
  ]);

  const handleNavigationFromDashboard = (tab: NavTabType, param?: string) => {
    setActiveTab(tab);
    if (param) {
      if (param === 'all') {
        setSelectedCategory('all');
        setSearchQuery('');
      } else if (param === 'sockets') {
        setHighPowerSockets(true);
      } else if (categories.some(c => c.id === param)) {
        setSelectedCategory(param);
      } else {
        setSearchQuery(param);
      }
    }
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedFloor('all');
    setSelectedCategory('all');
    setOnlyAvailableNow(false);
    setAcRequired(false);
    setHighPowerSockets(false);
    setSilentStudyOnly(false);
    setSortBy('recommended');
  };

  const handleOpenReport = (room?: Room) => {
    setReportTargetRoom(room || null);
    setReportModalOpen(true);
  };

  const timeSlotsHeaders = [
    { start: '08:30', end: '09:30', label: '08:30 - 09:30 AM' },
    { start: '09:30', end: '10:30', label: '09:30 - 10:30 AM' },
    { start: '10:30', end: '11:30', label: '10:30 - 11:30 AM' },
    { start: '11:30', end: '12:30', label: '11:30 AM - 12:30 PM' },
    { start: '12:30', end: '13:30', label: '12:30 - 01:30 PM' },
    { start: '13:30', end: '14:30', label: '01:30 - 02:30 PM' },
    { start: '14:30', end: '15:30', label: '02:30 - 03:30 PM' },
    { start: '15:30', end: '16:30', label: '03:30 - 04:30 PM' },
    { start: '16:30', end: '17:30', label: '04:30 - 05:30 PM' },
  ];

  // If user opened the full-screen Login view
  if (showLoginView) {
    return (
      <LoginPage
        onSuccessLogin={() => setShowLoginView(false)}
        onBrowseGuest={() => setShowLoginView(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F4FA] dark:bg-[#0A0E1A] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white flex transition-colors duration-300">
      
      {/* Left Glassmorphic Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onOpenLogin={() => setShowLoginView(true)}
      />

      {/* Main Content Workspace (Offset by 16rem for sidebar on large screens) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Top Floating Glass Header with Theme Pill & Profile */}
        <TopHeader
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onOpenBookings={() => setBookingsModalOpen(true)}
          onOpenSettings={() => setActiveTab('settings')}
          onOpenLogin={() => setShowLoginView(true)}
        />

        {/* Dynamic View Switcher */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          
          {/* ================================================================= */}
          {/* VIEW 1: HOME (EXACT MATCH TO ATTACHED SCREENSHOT)                 */}
          {/* ================================================================= */}
          {activeTab === 'home' && (
            <DashboardHome
              currentTime={currentTime}
              setCurrentTime={setCurrentTime}
              onNavigateTab={handleNavigationFromDashboard}
              onSelectRoom={setSelectedRoom}
              onOpenBookings={() => setBookingsModalOpen(true)}
            />
          )}

          {/* ================================================================= */}
          {/* VIEW 2: FIND A ROOM (52-ROOM EXPLORER & TIMETABLE MATRIX)        */}
          {/* ================================================================= */}
          {activeTab === 'explorer' && (
            <div className="space-y-6 max-w-7xl mx-auto pb-12">
              
              {/* Header Title with Back Button to Home */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('home')}
                    className="p-2.5 rounded-2xl bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:text-blue-600 shadow-xs cursor-pointer"
                    title="Back to Dashboard Home"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Find a Room & Master Timetable
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Explore 52 campus rooms across 4 floors with live socket, AC & seat telemetry
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
                    {freeRoomsCount} of 52 Rooms Free ({currentTime} IST)
                  </span>
                </div>
              </div>

              {/* Unified Command & Filter Center */}
              <div className="p-5 sm:p-6 rounded-[2rem] bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-sm space-y-4 backdrop-blur-xl">
                
                {/* Search Bar + Sort + Grid/Matrix Switcher */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search 52 rooms by code (e.g. 121 A, 201B, 301, 402), lab name, wing..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] focus:border-blue-500 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Sort Dropdown */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-2xl px-3 py-2">
                      <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
                      >
                        <option value="recommended" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">⚡ Recommended (Free First)</option>
                        <option value="sockets" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">⚡ Most Sockets</option>
                        <option value="comfort" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">⭐ Highest Space Score</option>
                        <option value="freeTime" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">⏳ Most Free Time</option>
                        <option value="capacity" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">👥 Largest Capacity</option>
                      </select>
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] p-1 rounded-2xl border border-slate-200 dark:border-white/[0.08]">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          viewMode === 'grid'
                            ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Cards</span>
                      </button>
                      <button
                        onClick={() => setViewMode('matrix')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          viewMode === 'matrix'
                            ? 'bg-white dark:bg-blue-600 text-blue-600 dark:text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>Matrix</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Categories & Floor Filter Tabs */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-blue-600 text-white shadow-xs font-bold'
                            : 'bg-slate-100 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.06]'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className="text-[10px] opacity-80">({cat.count})</span>
                      </button>
                    ))}
                  </div>

                  {/* Floor Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
                      Floor:
                    </span>
                    {(['all', 1, 2, 3, 4] as const).map((floor) => (
                      <button
                        key={floor}
                        onClick={() => setSelectedFloor(floor)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          selectedFloor === floor
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                            : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {floor === 'all' ? 'All' : `F${floor}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenity Quick Toggles */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/80 dark:border-white/[0.06]">
                  <button
                    onClick={() => setOnlyAvailableNow(!onlyAvailableNow)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      onlyAvailableNow
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Free Now</span>
                  </button>

                  <button
                    onClick={() => setAcRequired(!acRequired)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      acRequired
                        ? 'bg-sky-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Wind className="w-3.5 h-3.5 text-sky-500" />
                    <span>AC Climate</span>
                  </button>

                  <button
                    onClick={() => setHighPowerSockets(!highPowerSockets)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      highPowerSockets
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>18+ Sockets</span>
                  </button>

                  <button
                    onClick={() => setSilentStudyOnly(!silentStudyOnly)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      silentStudyOnly
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Silent Study</span>
                  </button>

                  <button
                    onClick={handleResetAllFilters}
                    className="ml-auto text-xs text-slate-400 hover:text-rose-500 underline cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>

              </div>

              {/* Results Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map((room) => (
                    <RoomCard
                      key={room.code}
                      room={room}
                      currentTime={currentTime}
                      onSelectRoom={setSelectedRoom}
                      onReportIssue={handleOpenReport}
                      onCheckIn={() => setBookingsModalOpen(true)}
                    />
                  ))}
                </div>
              )}

              {/* Master Matrix Heatmap View */}
              {viewMode === 'matrix' && (
                <div className="rounded-[2rem] bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      52-Room Schedule Matrix (Click row to inspect)
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400">🟢 Free</span>
                      <span className="text-rose-600 dark:text-rose-400">🔴 Lecture</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/[0.08]">
                          <th className="p-3 sticky left-0 z-20 bg-slate-50 dark:bg-[#0c1220] min-w-[180px] font-bold">
                            Room
                          </th>
                          {timeSlotsHeaders.map((slot, idx) => (
                            <th key={slot.label} className="p-3 text-center min-w-[110px] font-semibold border-r border-slate-200/60 dark:border-white/[0.05]">
                              {slot.start} - {slot.end}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-white/[0.05]">
                        {filteredRooms.map((room) => (
                          <tr
                            key={room.code}
                            onClick={() => setSelectedRoom(room)}
                            className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
                          >
                            <td className="p-3 sticky left-0 z-10 bg-white dark:bg-[#0c1220] border-r border-slate-200/60 dark:border-white/[0.08]">
                              <span className="font-bold font-mono text-slate-900 dark:text-white">{room.code}</span>
                              <span className="text-[10px] text-slate-400 block truncate">{room.name}</span>
                            </td>
                            {timeSlotsHeaders.map((slot) => {
                              const isFree = isRoomFreeAt(room, slot.start);
                              return (
                                <td key={slot.label} className="p-2 text-center border-r border-slate-200/60 dark:border-white/[0.04]">
                                  <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold ${
                                    isFree
                                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                  }`}>
                                    {isFree ? 'Free' : 'Class'}
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW: 1-CLICK AI SMART MATCHER                                    */}
          {/* ================================================================= */}
          {activeTab === 'matcher' && (
            <SmartMatcher
              rooms={JAIN_ROOMS}
              currentTime={currentTime}
              onSelectRoom={setSelectedRoom}
            />
          )}

          {/* ================================================================= */}
          {/* VIEW 3: MY BOOKINGS                                               */}
          {/* ================================================================= */}
          {activeTab === 'bookings' && (
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    My Workspace Reservations
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage active room bookings and instant reservations
                  </p>
                </div>
                <button
                  onClick={() => setBookingsModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  + New Reservation
                </button>
              </div>

              <div className="p-8 rounded-[2rem] bg-white/80 dark:bg-[#11192E]/80 border border-slate-200/80 dark:border-white/[0.08] shadow-xs text-center space-y-3">
                <Calendar className="w-12 h-12 text-blue-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  2 Active Reservations on Campus
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Room 318B (Silent Pod) at 10:45 AM and Lab 202 (Computer Lab) at 2:15 PM today.
                </p>
                <button
                  onClick={() => setBookingsModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
                >
                  Open Booking Manager
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 4: LIVE AVAILABILITY & TELEMETRY                             */}
          {/* ================================================================= */}
          {activeTab === 'telemetry' && (
            <CrowdCheckIn
              rooms={JAIN_ROOMS}
              onReportIssue={handleOpenReport}
            />
          )}

          {/* ================================================================= */}
          {/* VIEW 5: INTERACTIVE 4-FLOOR ARCHITECTURAL MAP                    */}
          {/* ================================================================= */}
          {activeTab === 'map' && (
            <FloorMap
              rooms={JAIN_ROOMS}
              currentTime={currentTime}
              onSelectRoom={setSelectedRoom}
            />
          )}

          {/* ================================================================= */}
          {/* VIEW 6: DESIGN THINKING & 20/20 RUBRIC ANALYTICS                 */}
          {/* ================================================================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6 max-w-7xl mx-auto pb-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 dark:bg-[#11192E]/80 p-4 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Academic Showcase Mode:
                </span>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/[0.04] p-1 rounded-2xl border border-slate-200 dark:border-white/[0.08]">
                  <button
                    onClick={() => setCaseStudySubView('rubric')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      caseStudySubView === 'rubric'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🏆 CA1 – 20/20 Empathy Rubric Package
                  </button>
                  <button
                    onClick={() => setCaseStudySubView('full-case-study')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      caseStudySubView === 'full-case-study'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🔬 5-Stage d.school Case Study
                  </button>
                </div>
              </div>

              {caseStudySubView === 'rubric' ? (
                <CA1EmpathyRubricPackage />
              ) : (
                <DesignThinkingShowcase />
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 7: SETTINGS                                                 */}
          {/* ================================================================= */}
          {activeTab === 'settings' && <SettingsView />}

        </main>

      </div>

      {/* LIGHTBOX MODALS */}
      {/* 1. Full Room Schedule & Amenities Modal */}
      {selectedRoom && (
        <RoomModal
          room={selectedRoom}
          currentTime={currentTime}
          onClose={() => setSelectedRoom(null)}
          onReportIssue={() => {
            const r = selectedRoom;
            setSelectedRoom(null);
            handleOpenReport(r);
          }}
          onCheckIn={() => {
            setSelectedRoom(null);
            setBookingsModalOpen(true);
          }}
        />
      )}

      {/* 2. Issue Reporting Modal */}
      {reportModalOpen && (
        <ReportIssueModal
          isOpen={reportModalOpen}
          rooms={JAIN_ROOMS}
          initialRoom={reportTargetRoom}
          onClose={() => {
            setReportModalOpen(false);
            setReportTargetRoom(null);
          }}
        />
      )}

      {/* 3. Bookings Modal */}
      {bookingsModalOpen && (
        <BookingsModal
          isOpen={bookingsModalOpen}
          onClose={() => setBookingsModalOpen(false)}
          onSelectRoom={setSelectedRoom}
        />
      )}

    </div>
  );
}
