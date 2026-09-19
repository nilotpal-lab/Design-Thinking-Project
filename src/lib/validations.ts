import { z } from 'zod';

/**
 * Every mutation passes through one of these schemas before it reaches the
 * database. The RLS layer constrains WHO can write; this constrains WHAT a
 * well-formed write looks like. Errors are re-rendered as plain language.
 */

export const checkInSchema = z.object({
  room_id: z.string().uuid('Unknown room'),
  crowd_density: z.enum(['empty', 'light', 'moderate', 'crowded', 'full']),
  ac_comfort: z.enum(['freezing', 'comfortable', 'warm', 'off']).optional().or(z.literal('')),
  socket_availability: z.enum(['plenty', 'limited', 'none']).optional().or(z.literal('')),
  purpose: z.enum(['study', 'group', 'charging', 'break', 'class']).optional().or(z.literal('')),
  note: z.string().max(280, 'Keep notes under 280 characters').optional().or(z.literal('')),
  is_anonymous: z.coerce.boolean().optional().default(false),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

export const newIssueSchema = z.object({
  room_id: z.string().uuid('Unknown room'),
  category: z.enum(['power', 'ac', 'wifi', 'projector', 'noise', 'cleanliness', 'seating', 'furniture', 'other']),
  title: z.string().min(4, 'Give it a short title (4+ characters)').max(120, 'Keep the title under 120 characters'),
  description: z
    .string()
    .min(10, 'Describe the problem in at least 10 characters')
    .max(2000, 'Keep the description under 2000 characters'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
});

export type NewIssueInput = z.infer<typeof newIssueSchema>;

export const eventFormSchema = z.object({
  title: z.string().min(3).max(140),
  category: z.enum(['fest', 'workshop', 'seminar', 'exam', 'club', 'sports', 'cultural', 'other']),
  /** Naive campus-local datetime strings from <input type="datetime-local">. */
  starts_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Start time required'),
  ends_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null)),
  all_day: z.boolean().optional().default(false),
  venue_room_id: z.string().uuid().nullable().optional().or(z.literal('').transform(() => null)),
  venue_text: z.string().max(120).nullable().optional().or(z.literal('').transform(() => null)),
  organizer: z.string().max(120).nullable().optional().or(z.literal('').transform(() => null)),
  description: z.string().max(2000).nullable().optional().or(z.literal('').transform(() => null)),
});
export type EventFormInput = z.infer<typeof eventFormSchema>;

export const cabinCsvRowSchema = z.object({
  name: z.string().min(2).max(120),
  cabin: z.string().min(1).max(40),
  note: z.string().max(200).optional().default(''),
});
export type CabinCsvRow = z.infer<typeof cabinCsvRowSchema>;

export const voteIssueSchema = z.object({ issue_id: z.string().uuid() });
export const voteCheckInSchema = z.object({ check_in_id: z.string().uuid() });
export const toggleFavoriteSchema = z.object({ room_id: z.string().uuid() });
