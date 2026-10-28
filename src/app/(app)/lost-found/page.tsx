import Link from 'next/link';
import { Search, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Lost & Found · CAMPUS',
  description: 'Report lost or misplaced personal items across campus facilities and trace recovered belongings.',
};

const SAMPLE_REPORTS = [
  {
    id: 'lf1',
    type: 'Lost',
    item: 'Blue Dell Laptop Charger (65W USB-C)',
    location: 'Room 201 · 2nd Floor [AC]',
    date: 'Today, 11:30 AM',
    contact: 'Engineering Reception',
    status: 'Active',
  },
  {
    id: 'lf2',
    type: 'Found',
    item: 'Casio Scientific Calculator fx-82MS',
    location: 'Room 312 · 3rd Floor',
    date: 'Yesterday, 3:45 PM',
    contact: 'Security Desk (Ground Floor)',
    status: 'Recovered',
  },
  {
    id: 'lf3',
    type: 'Lost',
    item: 'Black Wireframe Optical Glasses in Case',
    location: 'Library Reading Hall',
    date: '26 Oct 2026',
    contact: 'Librarian Desk',
    status: 'Active',
  },
  {
    id: 'lf4',
    type: 'Found',
    item: 'Student ID Card (CSE Batch 2024)',
    location: 'Cafeteria Ground Floor',
    date: '25 Oct 2026',
    contact: 'Admin Block Office',
    status: 'Awaiting Owner',
  },
];

export default function LostFoundPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#1B4332]" />
            <span className="font-mono text-xs uppercase tracking-wider text-ink-secondary">Campus Property Recovery</span>
          </div>
          <h1 className="heading-editorial mt-2 text-3xl sm:text-4xl text-ink">
            LOST & FOUND
          </h1>
          <p className="mt-1 text-sm text-ink-secondary max-w-xl">
            Recover lost items or hand over found belongings to campus security and reception desks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="md">
            + Report Lost/Found Item
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3">
        <div className="flex flex-1 items-center gap-2 min-w-[240px]">
          <Search className="h-4 w-4 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Search lost items, locations, dates..."
            className="w-full bg-transparent text-xs text-ink placeholder:text-ink-tertiary focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="pastelMint">All Records (4)</Badge>
          <Badge variant="neutral">Lost Items</Badge>
          <Badge variant="neutral">Found Items</Badge>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SAMPLE_REPORTS.map((item) => (
          <div key={item.id} className="campus-card flex flex-col justify-between p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={item.type === 'Lost' ? 'pastelCoral' : 'pastelSky'}>
                  {item.type}
                </Badge>
                <span className="text-[11px] font-mono text-ink-secondary">{item.status}</span>
              </div>
              <h3 className="text-sm font-semibold text-ink line-clamp-2">{item.item}</h3>
              <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
                <MapPin className="h-3 w-3 text-ink-tertiary shrink-0" />
                <span className="truncate">{item.location}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-ink-tertiary">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
