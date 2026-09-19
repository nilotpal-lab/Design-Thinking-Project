'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Zap, 
  Wind, 
  Tv, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Send,
  Wrench
} from 'lucide-react';
import { Room } from '@/data/rooms';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  initialRoom?: Room | null;
}

interface IssueTicket {
  id: string;
  roomCode: string;
  category: string;
  description: string;
  status: 'Pending Review' | 'Technician Assigned' | 'Resolved';
  timeAgo: string;
  urgency: 'Low' | 'Medium' | 'High';
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  rooms,
  initialRoom,
}) => {
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>(
    initialRoom?.code || '301B'
  );
  const [category, setCategory] = useState<string>('Power Sockets');
  const [description, setDescription] = useState<string>('');
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [activeTickets, setActiveTickets] = useState<IssueTicket[]>([
    {
      id: 't-1',
      roomCode: '121 A',
      category: 'Power Sockets',
      description: 'Socket #4 on row 2 left side does not deliver power.',
      status: 'Technician Assigned',
      timeAgo: '1 hour ago',
      urgency: 'Medium',
    },
    {
      id: 't-2',
      roomCode: '301B',
      category: 'AC / Cooling',
      description: 'AC remote battery empty, temperature stuck at 25°C.',
      status: 'Pending Review',
      timeAgo: '2 hours ago',
      urgency: 'High',
    },
    {
      id: 't-3',
      roomCode: '402',
      category: 'Smart Board / Projector',
      description: 'HDMI cable connector is slightly loose on podium.',
      status: 'Resolved',
      timeAgo: 'Yesterday',
      urgency: 'Low',
    },
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const newTicket: IssueTicket = {
      id: `t-${Date.now()}`,
      roomCode: selectedRoomCode,
      category: category,
      description: description,
      status: 'Pending Review',
      timeAgo: 'Just now',
      urgency: urgency,
    };

    setActiveTickets([newTicket, ...activeTickets]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDescription('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 flex items-center justify-center border border-rose-200 dark:border-rose-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Report Campus Infrastructure Issue
              </h2>
              <p className="text-xs text-slate-500">
                Direct dispatch to Jain University Campus Facility Maintenance
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                Ticket Logged & Dispatched!
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                Your report for Room {selectedRoomCode} has been queued. Campus housekeeping & electrical teams have been alerted.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Room Select */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Room Number
                  </label>
                  <select
                    value={selectedRoomCode}
                    onChange={(e) => setSelectedRoomCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.code}>
                        Room {r.code} ({r.block} • {r.floorLabel})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Select */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Issue Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="Power Sockets">Power Socket / Multi-plug Fault</option>
                    <option value="AC / Cooling">AC Not Cooling / Fan Fault</option>
                    <option value="Smart Board / Projector">Projector / Smart Board Issue</option>
                    <option value="Whiteboard Marker">Dry Marker / Dirty Board</option>
                    <option value="Cleanliness">Desk Cleanliness / Waste Bin</option>
                    <option value="Wi-Fi Signal">Wi-Fi / Network Speed Drop</option>
                  </select>
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Severity / Urgency
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Low', label: 'Low (Minor)' },
                    { id: 'Medium', label: 'Medium (Standard)' },
                    { id: 'High', label: 'High (Immediate Fix)' },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        urgency === u.id
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Issue Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Socket in row 3 does not turn on when switch is pressed, or AC remote is missing..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Maintenance Report</span>
              </button>
            </form>
          )}

          {/* Active Campus Tickets Feed */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-blue-500" />
              Recent Campus Maintenance Tickets
            </h3>

            <div className="space-y-2.5">
              {activeTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Room {ticket.roomCode}
                      </span>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.2 rounded font-semibold text-slate-700 dark:text-slate-300">
                        {ticket.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block ${
                        ticket.status === 'Resolved'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : ticket.status === 'Technician Assigned'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {ticket.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-1">
                      {ticket.timeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
