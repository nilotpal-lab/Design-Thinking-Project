'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  X,
  CheckCircle2,
  Trash2,
  Plus,
  Zap,
  Users,
  Sparkles
} from 'lucide-react';
import { JAIN_ROOMS, Room } from '@/data/rooms';

interface BookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom?: (room: Room) => void;
}

interface BookingItem {
  id: string;
  roomCode: string;
  roomName: string;
  floor: number;
  timeSlot: string;
  purpose: string;
  status: 'Confirmed' | 'Pending';
}

export const BookingsModal: React.FC<BookingsModalProps> = ({
  isOpen,
  onClose,
  onSelectRoom,
}) => {
  const [activeBookings, setActiveBookings] = useState<BookingItem[]>([
    {
      id: 'b-1',
      roomCode: '318B',
      roomName: 'Silent Study Pod 3B',
      floor: 3,
      timeSlot: '10:45 AM - 12:30 PM',
      purpose: 'Design Thinking Assignment & PPT Prep',
      status: 'Confirmed',
    },
    {
      id: 'b-2',
      roomCode: '202',
      roomName: 'Computer Network Lab',
      floor: 2,
      timeSlot: '02:15 PM - 04:00 PM',
      purpose: 'Team Circuit Breakers Coding Sprint',
      status: 'Confirmed',
    },
  ]);

  const [newRoomCode, setNewRoomCode] = useState(JAIN_ROOMS[0].code);
  const [newTimeSlot, setNewTimeSlot] = useState('11:30 AM - 12:30 PM');
  const [newPurpose, setNewPurpose] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const selected = JAIN_ROOMS.find((r) => r.code === newRoomCode) || JAIN_ROOMS[0];
    
    const newBooking: BookingItem = {
      id: `b-${Date.now()}`,
      roomCode: selected.code,
      roomName: selected.name,
      floor: selected.floor,
      timeSlot: newTimeSlot,
      purpose: newPurpose || 'Student Study Session',
      status: 'Confirmed',
    };

    setActiveBookings([newBooking, ...activeBookings]);
    setNewPurpose('');
    setSuccessNotice(true);
    setTimeout(() => setSuccessNotice(false), 3000);
  };

  const handleCancelBooking = (id: string) => {
    setActiveBookings(activeBookings.filter((b) => b.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-white dark:bg-[#11192E] border border-slate-200 dark:border-white/[0.1] rounded-[2rem] shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-cyan-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                My Workspace Bookings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reserve campus rooms for self-study, lab work or group hackathons
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successNotice && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Room successfully booked! Added to your schedule.</span>
          </div>
        )}

        {/* Active Bookings List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Active Reservations ({activeBookings.length})
          </h3>

          {activeBookings.length > 0 ? (
            <div className="space-y-2.5">
              {activeBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black font-mono text-sm text-slate-900 dark:text-white">
                        {booking.roomCode}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-cyan-300 font-bold">
                        Floor {booking.floor}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {booking.roomName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{booking.timeSlot}</span>
                      <span>•</span>
                      <span>{booking.purpose}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Cancel Booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No active bookings right now.</p>
          )}
        </div>

        {/* Quick New Reservation Form */}
        <form onSubmit={handleCreateBooking} className="p-5 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-white/[0.08] space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-blue-500" />
            Quick Instant Reservation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Select Space (52 Rooms)
              </label>
              <select
                value={newRoomCode}
                onChange={(e) => setNewRoomCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white font-medium focus:outline-hidden"
              >
                {JAIN_ROOMS.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.code} - {r.name} (F{r.floor})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">
                Time Slot
              </label>
              <select
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white font-medium focus:outline-hidden"
              >
                <option>10:45 AM - 12:30 PM (Mid-Morning Break)</option>
                <option>12:45 PM - 02:00 PM (Lunch Break)</option>
                <option>02:15 PM - 04:00 PM (Lab Session)</option>
                <option>04:15 PM - 06:00 PM (Project Work)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1 text-xs">
              Purpose / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Design Thinking Team Discussion, Coding, Study"
              value={newPurpose}
              onChange={(e) => setNewPurpose(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.1] text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            Confirm & Reserve Space
          </button>
        </form>

      </motion.div>
    </div>
  );
};
