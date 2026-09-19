import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMinutesToTime(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const paddedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours12}:${paddedMinutes} ${period}`;
}

export function parseTimeToMinutes(timeStr: string): number {
  // e.g. "08:30" or "8:30 AM" or "17:30"
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const timeOnly = clean.replace(/(AM|PM)/g, '').trim();
  const [hourStr, minStr] = timeOnly.split(':');
  let hours = parseInt(hourStr, 10) || 0;
  const minutes = parseInt(minStr, 10) || 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}
