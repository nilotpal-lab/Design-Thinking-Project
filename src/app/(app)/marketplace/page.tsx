import Link from 'next/link';
import { ShoppingBag, Tag, Search, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Campus Marketplace · CAMPUS',
  description: 'Buy and sell textbooks, electronics, engineering kits, and study materials within the university community.',
};

const SAMPLE_LISTINGS = [
  {
    id: 'm1',
    title: 'Design Thinking & Innovation Textbook (3rd Sem)',
    category: 'Books',
    price: '₹350',
    condition: 'Like New',
    seller: 'Aditya D. (CSE 3rd Year)',
    location: 'Eng Block · 2nd Floor',
    status: 'Available',
    time: '2 hours ago',
  },
  {
    id: 'm2',
    title: 'Arduino Starter Kit with Sensor Modules',
    category: 'Electronics',
    price: '₹1,200',
    condition: 'Excellent',
    seller: 'Kavya S. (Robotics Club)',
    location: 'Lab 114 · Ground Floor',
    status: 'Available',
    time: 'Yesterday',
  },
  {
    id: 'm3',
    title: 'Casio fx-991EX Scientific Calculator',
    category: 'Calculators',
    price: '₹600',
    condition: 'Good',
    seller: 'Rahul M. (Mechanical)',
    location: 'Campus Canteen Area',
    status: 'Reserved',
    time: '2 days ago',
  },
  {
    id: 'm4',
    title: 'Engineering Mechanics by Timoshenko (Hardcover)',
    category: 'Books',
    price: '₹400',
    condition: 'Very Good',
    seller: 'Pooja V. (Civil Dept)',
    location: 'Library Common Room',
    status: 'Available',
    time: '3 days ago',
  },
];

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#1B4332]" />
            <span className="font-mono text-xs uppercase tracking-wider text-ink-secondary">Peer-to-Peer Hub</span>
          </div>
          <h1 className="heading-editorial mt-2 text-3xl sm:text-4xl text-ink">
            CAMPUS MARKETPLACE
          </h1>
          <p className="mt-1 text-sm text-ink-secondary max-w-xl">
            Verified student-to-student exchange for course books, hardware kits, drawing boards, and academic gear.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="md">
            + Post a Listing
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-3">
        <div className="flex flex-1 items-center gap-2 min-w-[240px]">
          <Search className="h-4 w-4 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Search items, textbooks, calculators, kits..."
            className="w-full bg-transparent text-xs text-ink placeholder:text-ink-tertiary focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="pastelMint">All (4)</Badge>
          <Badge variant="neutral">Books</Badge>
          <Badge variant="neutral">Electronics</Badge>
          <Badge variant="neutral">Calculators</Badge>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SAMPLE_LISTINGS.map((item) => (
          <div key={item.id} className="campus-card flex flex-col justify-between p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={item.status === 'Available' ? 'pastelMint' : 'pastelButter'}>
                  {item.status}
                </Badge>
                <span className="font-mono text-xs font-bold text-ink">{item.price}</span>
              </div>
              <h3 className="text-sm font-semibold text-ink line-clamp-2">{item.title}</h3>
              <p className="text-xs text-ink-secondary">{item.condition} · {item.category}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-ink-tertiary">
              <span>{item.seller.split(' ')[0]}</span>
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
