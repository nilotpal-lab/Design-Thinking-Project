import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 95 -> "1h 35m", 45 -> "45m" */
export function formatMinutes(m: number | null | undefined): string | null {
  if (m === null || m === undefined) return null;
  if (m < 1) return '<1m';
  if (m < 60) return `${Math.round(m)}m`;
  const h = Math.floor(m / 60);
  const rem = Math.round(m % 60);
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

/** "14:30:00" -> "2:30 PM" (campus timetable strings are plain times) */
export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** ISO timestamp -> "12s ago" / "4m ago" / "2h ago" */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export const CROWD_LABEL: Record<string, string> = {
  empty: 'Empty',
  light: 'Light',
  moderate: 'Moderate',
  crowded: 'Crowded',
  full: 'Full',
};

export const ROOM_CATEGORY_LABEL: Record<string, string> = {
  smart_classroom: 'Smart Classroom',
  computer_lab: 'Computer Lab',
  silent_study_pod: 'Silent Study Pod',
  seminar_amphitheatre: 'Seminar Amphitheatre',
  innovation_studio: 'Design & Innovation Studio',
};

export const WING_LABEL: Record<string, string> = {
  west: 'West Wing',
  central: 'Central Block',
  east: 'East Wing',
};

/** Deterministic room slug -> href, single definition used by every link. */
export function roomHref(slug: string) {
  return `/spaces/${slug}`;
}
