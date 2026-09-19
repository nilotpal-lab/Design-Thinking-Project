import { describe, expect, it } from 'vitest';

import {
  CROWD_LABEL,
  ROOM_CATEGORY_LABEL,
  cn,
  formatMinutes,
  formatTime,
  roomHref,
  timeAgo,
} from '@/lib/utils';

describe('formatMinutes', () => {
  it('formats under an hour as minutes', () => {
    expect(formatMinutes(45)).toBe('45m');
  });

  it('formats hours with remainder', () => {
    expect(formatMinutes(95)).toBe('1h 35m');
  });

  it('drops a zero remainder', () => {
    expect(formatMinutes(120)).toBe('2h');
  });

  it('handles sub-minute and null', () => {
    expect(formatMinutes(0.4)).toBe('<1m');
    expect(formatMinutes(null)).toBeNull();
    expect(formatMinutes(undefined)).toBeNull();
  });
});

describe('formatTime', () => {
  it('converts 24h timetable strings to 12h display', () => {
    expect(formatTime('14:30:00')).toBe('2:30 PM');
    expect(formatTime('09:05:00')).toBe('9:05 AM');
    expect(formatTime('00:00:00')).toBe('12:00 AM');
    expect(formatTime('12:00:00')).toBe('12:00 PM');
  });
});

describe('timeAgo', () => {
  it('buckets seconds, minutes, hours', () => {
    const now = Date.now();
    expect(timeAgo(new Date(now - 30_000).toISOString())).toBe('30s ago');
    expect(timeAgo(new Date(now - 5 * 60_000).toISOString())).toBe('5m ago');
    expect(timeAgo(new Date(now - 3 * 3_600_000).toISOString())).toBe('3h ago');
  });

  it('never shows negative time or garbage for missing input', () => {
    expect(timeAgo(null)).toBe('never');
    expect(timeAgo(undefined)).toBe('never');
    expect(timeAgo(new Date(Date.now() + 60_000).toISOString())).toBe('0s ago');
  });
});

describe('label maps', () => {
  it('covers every enum value the DB can emit', () => {
    for (const key of ['empty', 'light', 'moderate', 'crowded', 'full']) {
      expect(CROWD_LABEL[key], `crowd: ${key}`).toBeTruthy();
    }
    for (const key of ['smart_classroom', 'computer_lab', 'silent_study_pod', 'seminar_amphitheatre', 'innovation_studio']) {
      expect(ROOM_CATEGORY_LABEL[key], `category: ${key}`).toBeTruthy();
    }
  });
});

describe('small helpers', () => {
  it('cn merges tailwind classes with later-wins conflict resolution', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-sm', false && 'hidden', 'font-medium')).toBe('text-sm font-medium');
  });

  it('roomHref is the single link definition', () => {
    expect(roomHref('121a')).toBe('/spaces/121a');
  });
});
