-- =============================================================================
-- Phase 2 CLEANUP — removes everything verify-setup.sql inserted.
-- Run AFTER verify-assertions.sql. Never touches real data.
-- =============================================================================

delete from public.timetable_slots where title_override like 'VERIFY:%';

delete from public.schedule_exceptions where reason like 'VERIFY:%';
