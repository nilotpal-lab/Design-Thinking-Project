'use client';

import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Zap, 
  Wind, 
  Users, 
  Sparkles, 
  MapPin, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Search,
  SlidersHorizontal,
  Compass,
  X,
  ArrowRight,
  Volume2,
  Building
} from 'lucide-react';
import { Room, isRoomFreeAt, getStatusBadge } from '@/data/rooms';

interface FloorMapProps {
  rooms: Room[];
  currentTime: string;
  onSelectRoom: (room: Room) => void;
}

type WingFilter = 'all' | 'West Wing' | 'Central Block' | 'East Wing';

export const FloorMap: React.FC<FloorMapProps> = ({
  rooms,
  currentTime,
  onSelectRoom,
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedWing, setSelectedWing] = useState<WingFilter>('all');
  const [floorSearch, setFloorSearch] = useState<string>('');

  // Dynamic Floor Tabs with dynamically counted rooms per floor
  const floorTabs = useMemo(() => {
    const definitions = [
      { floor: 1, label: '1st Floor', title: 'Ground & Foundations Wing' },
      { floor: 2, label: '2nd Floor', title: 'Core CS & Lecture Amphitheatres' },
      { floor: 3, label: '3rd Floor', title: 'AI Labs & Design Studios' },
      { floor: 4, label: '4th Floor', title: 'Rooftop Solarium & Advanced Research' },
    ];
    return definitions.map((tab) => ({
      ...tab,
      count: rooms.filter((r) => r.floor === tab.floor).length,
    }));
  }, [rooms]);

  // All rooms on the selected floor (13 rooms per floor)
  const currentFloorRooms = useMemo(() => {
    return rooms.filter((r) => r.floor === selectedFloor);
  }, [rooms, selectedFloor]);

  // Dynamic wing counts for the active floor
  const wingCounts = useMemo(() => {
    return {
      all: currentFloorRooms.length,
      'West Wing': currentFloorRooms.filter((r) => r.wing === 'West Wing').length,
      'Central Block': currentFloorRooms.filter((r) => r.wing === 'Central Block').length,
      'East Wing': currentFloorRooms.filter((r) => r.wing === 'East Wing').length,
    };
  }, [currentFloorRooms]);

  // Active rooms filtered by wing
  const activeWingRooms = useMemo(() => {
    return currentFloorRooms.filter((r) => {
      if (selectedWing !== 'all' && r.wing !== selectedWing) return false;
      return true;
    });
  }, [currentFloorRooms, selectedWing]);

  // Displayed rooms filtered by wing AND search query
  const displayedRooms = useMemo(() => {
    return activeWingRooms.filter((r) => {
      if (floorSearch.trim()) {
        const q = floorSearch.toLowerCase().trim();
        const cleanQ = q.replace(/\s+/g, '');
        const cleanCode = r.code.toLowerCase().replace(/\s+/g, '');
        const matchesCode = r.code.toLowerCase().includes(q) || cleanCode.includes(cleanQ);
        const matchesName = r.name.toLowerCase().includes(q);
        const matchesCategory = r.category.toLowerCase().includes(q);
        const matchesBlock = r.block.toLowerCase().includes(q);
        const matchesVibe = r.noiseVibe.toLowerCase().includes(q);
        const matchesAmenities = r.amenities?.some((a) => a.toLowerCase().includes(q));
        const matchesDescription = r.description?.toLowerCase().includes(q);
        return matchesCode || matchesName || matchesCategory || matchesBlock || matchesVibe || matchesAmenities || matchesDescription;
      }
      return true;
    });
  }, [activeWingRooms, floorSearch]);

  // Floor Quick Statistics dynamically calculated for the active floor & wing scope at currentTime
  const freeRooms = useMemo(() => {
    return activeWingRooms.filter((r) => isRoomFreeAt(r, currentTime));
  }, [activeWingRooms, currentTime]);

  const availableSockets = useMemo(() => {
    return freeRooms.reduce((acc, r) => acc + r.chargingPoints, 0);
  }, [freeRooms]);

  const totalSockets = useMemo(() => {
    return activeWingRooms.reduce((acc, r) => acc + r.chargingPoints, 0);
  }, [activeWingRooms]);

  const acRoomsCount = useMemo(() => {
    return activeWingRooms.filter((r) => r.hasAC).length;
  }, [activeWingRooms]);

  const totalSeats = useMemo(() => {
    return activeWingRooms.reduce((acc, r) => acc + r.capacity, 0);
  }, [activeWingRooms]);

  const activeFloorTheme = floorTabs.find((f) => f.floor === selectedFloor);

  return (
    <div className="space-y-6">
      {/* Floor Selection & Overview Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Interactive Campus Floor Map ({rooms.length} Total Rooms)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Architectural floor blueprint for Jain University FET Campus. Select a floor and wing to inspect live power and seating telemetry.
            </p>
          </div>

          {/* Floor Switcher Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {floorTabs.map((f) => (
              <button
                key={f.floor}
                onClick={() => {
                  setSelectedFloor(f.floor);
                  setSelectedWing('all');
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                  selectedFloor === f.floor
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span>{f.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  selectedFloor === f.floor ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Floor Quick Stats Bar (Dynamically updates on currentTime, floor, or wing changes) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
          {/* Stat 1: Free Rooms */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
              {freeRooms.length}/{activeWingRooms.length}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Free on Floor {selectedFloor} {selectedWing !== 'all' ? `(${selectedWing.split(' ')[0]})` : ''}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {freeRooms.length > 0 ? `${freeRooms.length} Open Spot(s)` : 'All Occupied'}
              </span>
            </div>
          </div>

          {/* Stat 2: Free Power Sockets */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Free Power Sockets</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {availableSockets} Available ({totalSockets} Total)
              </span>
            </div>
          </div>

          {/* Stat 3: Air Conditioning */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Air Conditioning</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {acRoomsCount} of {activeWingRooms.length} AC Rooms
              </span>
            </div>
          </div>

          {/* Stat 4: Active Wing & Capacity */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
              <Building className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block truncate">
                {selectedWing === 'all' ? 'All Wings Active' : selectedWing}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {totalSeats} Total Seats
              </span>
            </div>
          </div>
        </div>

        {/* Wing Filters & Mini Search inside Floor */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 flex items-center gap-1">
              <Compass className="w-3 h-3 text-slate-400" />
              Wing:
            </span>
            {(['all', 'West Wing', 'Central Block', 'East Wing'] as const).map((wing) => (
              <button
                key={wing}
                onClick={() => setSelectedWing(wing)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedWing === wing
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{wing === 'all' ? 'All Wings' : wing}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedWing === wing 
                    ? 'bg-white/20 text-white dark:bg-slate-800 dark:text-slate-200' 
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300'
                }`}>
                  {wingCounts[wing]}
                </span>
              </button>
            ))}
          </div>

          {/* In-Floor Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search Floor ${selectedFloor} (code, name, lab)...`}
              value={floorSearch}
              onChange={(e) => setFloorSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-medium text-slate-900 dark:text-white placeholder-slate-400"
            />
            {floorSearch && (
              <button
                onClick={() => setFloorSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear Search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visual Architectural Grid Blueprint */}
      <div className="bg-slate-100/90 dark:bg-[#0c1324] rounded-3xl border border-slate-200/90 dark:border-white/[0.08] p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-colors">
        {/* Architectural Grid Background Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 dark:opacity-30 pointer-events-none" />

        {/* Blueprint Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-200 uppercase tracking-widest block">
                Jain University Floor {selectedFloor} Blueprint Architecture ({displayedRooms.length} of {currentFloorRooms.length} Rooms Shown)
              </span>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium block">
                {activeFloorTheme?.title}
              </span>
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
              <span>Available Now</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Busy Soon (&lt;20m)</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Class in Session</span>
            </div>
          </div>
        </div>

        {/* Dynamic Architectural Floor Plan Layout */}
        <div className="relative z-10 bg-white/95 dark:bg-[#080d19]/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 min-h-[380px] flex flex-col justify-between shadow-xs">
          {/* North Corridor Label */}
          <div className="text-center pb-3 border-b border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2">
            <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-widest font-bold">
              ▲ North Academic Corridor (Stairwell, Elevators & Main Concourse)
            </span>
          </div>

          {/* Interactive Classrooms Grid */}
          {displayedRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-6">
              {displayedRooms.map((room) => {
                const status = getStatusBadge(room, currentTime);
                return (
                  <div
                    key={room.id}
                    onClick={() => onSelectRoom(room)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectRoom(room);
                      }
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] relative group shadow-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                      status.urgency === 'free'
                        ? 'bg-white dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/50 hover:border-emerald-500 hover:shadow-md'
                        : status.urgency === 'soon'
                        ? 'bg-white dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/50 hover:border-amber-500 hover:shadow-md'
                        : 'bg-white dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 hover:border-rose-500 hover:shadow-md'
                    }`}
                  >
                    {/* Room Header: Code, Wing & Live Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {room.code}
                          </span>
                          <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {room.wing.split(' ')[0]}
                          </span>
                          <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 px-1 py-0.5 rounded">
                            {room.block}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mt-0.5 line-clamp-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                          {room.name}
                        </p>
                      </div>

                      {/* Live Badge (🟢 Free, 🟡 Soon, 🔴 Busy) */}
                      <div className="text-right shrink-0">
                        {status.urgency === 'free' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Free
                          </span>
                        ) : status.urgency === 'soon' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            Soon
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-500/30">
                            <AlertCircle className="w-3 h-3" />
                            Busy
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status & SubText */}
                    <div className="mb-2.5">
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {status.statusText}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {status.subText}
                      </div>
                    </div>

                    {/* Category pill */}
                    <div className="mb-2.5">
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 inline-block truncate max-w-full">
                        {room.category}
                      </span>
                    </div>

                    {/* Specifications row: Seats, Sockets, AC */}
                    <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 text-[10px]">
                      {/* Seats */}
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400" title={`${room.capacity} Total Seats`}>
                        <Users className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{room.capacity} seats</span>
                      </div>

                      {/* Sockets */}
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400" title={`${room.chargingPoints} Functional Charging Sockets`}>
                        <Zap className="w-3 h-3 text-amber-500 dark:text-amber-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{room.chargingPoints}p</span>
                      </div>

                      {/* AC Status */}
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate" title={room.acStatus || (room.hasAC ? 'AC Cooled' : 'Fan Cooled')}>
                        <Wind className="w-3 h-3 text-sky-500 dark:text-sky-400 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200 truncate">{room.hasAC ? 'AC' : 'Fan'}</span>
                      </div>
                    </div>

                    {/* Inspect Link */}
                    <div className="mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/40 text-[10px] text-blue-600 dark:text-blue-400 font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300 flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-normal">{room.noiseVibe}</span>
                      <span className="inline-flex items-center gap-1">
                        Inspect Room <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State for Filter/Search */
            <div className="my-12 text-center py-10 px-4 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800">
              <Compass className="w-10 h-10 text-slate-500 mx-auto mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-200">
                No rooms match &ldquo;{floorSearch}&rdquo; in {selectedWing === 'all' ? 'All Wings' : selectedWing} on Floor {selectedFloor}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Try clearing your search query or selecting &ldquo;All Wings&rdquo; to view all 13 rooms on Floor {selectedFloor}.
              </p>
              <button
                onClick={() => {
                  setFloorSearch('');
                  setSelectedWing('all');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/30"
              >
                Reset Floor Filters ({currentFloorRooms.length} Rooms)
              </button>
            </div>
          )}

          {/* South Corridor Label */}
          <div className="text-center pt-3 border-t border-dashed border-slate-800 flex items-center justify-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              ▼ South Quadrangle & Canteen Walkway Access
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

