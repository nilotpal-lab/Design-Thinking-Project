import { describe, expect, it } from 'vitest';

import {
  checkInSchema,
  cabinCsvRowSchema,
  eventFormSchema,
  newIssueSchema,
} from '@/lib/validations';
import { emailToUsername, usernameSchema, usernameToEmail } from '@/lib/username-auth';

/**
 * The validation layer is the WHAT-well-formed trust boundary for every
 * mutation (the RLS layer is the WHO). These tests pin the boundaries a
 * hostile or careless client would probe.
 */

describe('checkInSchema', () => {
  const VALID = {
    room_id: '9a1b2c3d-0000-4000-8000-000000000000',
    crowd_density: 'light' as const,
  };

  it('accepts the minimal check-in', () => {
    const r = checkInSchema.safeParse(VALID);
    expect(r.success).toBe(true);
  });

  it('defaults is_anonymous to false', () => {
    const r = checkInSchema.parse(VALID);
    expect(r.is_anonymous).toBe(false);
  });

  it('rejects an invalid crowd value and a non-uuid room', () => {
    expect(checkInSchema.safeParse({ ...VALID, crowd_density: 'packed' }).success).toBe(false);
    expect(checkInSchema.safeParse({ ...VALID, room_id: 'room-101' }).success).toBe(false);
  });

  it('caps note length at 280 characters', () => {
    expect(checkInSchema.safeParse({ ...VALID, note: 'x'.repeat(281) }).success).toBe(false);
    expect(checkInSchema.safeParse({ ...VALID, note: 'x'.repeat(280) }).success).toBe(true);
  });
});

describe('newIssueSchema', () => {
  const VALID = {
    room_id: '9a1b2c3d-0000-4000-8000-000000000000',
    category: 'projector' as const,
    title: 'Projector will not power on',
    description: 'The projector in 301 shows no signal from any laptop since Monday.',
  };

  it('accepts a valid issue and defaults urgency to medium', () => {
    const r = newIssueSchema.parse(VALID);
    expect(r.urgency).toBe('medium');
  });

  it('enforces minimum lengths so the board stays readable', () => {
    expect(newIssueSchema.safeParse({ ...VALID, title: 'ab' }).success).toBe(false);
    expect(newIssueSchema.safeParse({ ...VALID, description: 'too short' }).success).toBe(false);
  });

  it('rejects unknown urgency values', () => {
    expect(newIssueSchema.safeParse({ ...VALID, urgency: 'whenever' }).success).toBe(false);
  });
});

describe('eventFormSchema', () => {
  const VALID = {
    title: 'TechFest 2026',
    category: 'fest' as const,
    starts_at: '2026-10-01T09:00',
  };

  it('accepts a plain event with no optional fields', () => {
    const r = eventFormSchema.safeParse(VALID);
    expect(r.success).toBe(true);
  });

  it('coerces an empty venue id to null instead of a bogus uuid error', () => {
    const r = eventFormSchema.parse({ ...VALID, venue_room_id: '' });
    expect(r.venue_room_id).toBeNull();
  });

  it('rejects a malformed datetime-local string', () => {
    expect(eventFormSchema.safeParse({ ...VALID, starts_at: 'tomorrow morning' }).success).toBe(false);
    expect(eventFormSchema.safeParse({ ...VALID, starts_at: '2026-10-01 09:00' }).success).toBe(false);
  });
});

describe('cabinCsvRowSchema', () => {
  it('accepts name+cabin with optional note defaulting to empty string', () => {
    const r = cabinCsvRowSchema.parse({ name: 'Dr. Rao', cabin: '305B' });
    expect(r.note).toBe('');
  });

  it('rejects a one-character name (CSV header drift or junk row)', () => {
    expect(cabinCsvRowSchema.safeParse({ name: 'D', cabin: '305B' }).success).toBe(false);
  });
});

describe('username auth mapping', () => {
  it('maps username -> hidden synthetic email, lowercased and trimmed', () => {
    expect(usernameToEmail('  Nilotpal  ')).toBe('nilotpal@jainspace.local');
  });

  it('maps back only synthetic-domain emails', () => {
    expect(emailToUsername('admin@jainspace.local')).toBe('admin');
    expect(emailToUsername('student@gmail.com')).toBeNull();
    expect(emailToUsername(null)).toBeNull();
  });

  it('round-trips', () => {
    expect(emailToUsername(usernameToEmail('some.user-01'))).toBe('some.user-01');
  });

  it('username pattern: 3–24 chars of lowercase, digits, dot, underscore, dash', () => {
    expect(usernameSchema.test('abc')).toBe(true);
    expect(usernameSchema.test('ab')).toBe(false); // too short
    expect(usernameSchema.test('a'.repeat(25))).toBe(false); // too long
    expect(usernameSchema.test('has space')).toBe(false);
    expect(usernameSchema.test('UPPER')).toBe(false);
  });
});
