-- =============================================================================
-- Phase 2 SETUP — inserts clearly-labelled probe rows that the assertions read.
-- Every row carries a 'VERIFY:' marker and is removed by verify-cleanup.sql.
-- =============================================================================

-- Probe 1: a timetable slot TONIGHT (23:00-23:59) on today's weekday for room
-- 121 A. Proves "change the timetable, the UI follows": a room free all day
-- must flip to busy purely because a row was inserted.
with ctx as (
  select (now() at time zone public.fn_campus_tz())::date as d,
         extract(isodow from (now() at time zone public.fn_campus_tz())::date)::smallint as dow
)
insert into public.timetable_slots
      (id, room_id, day_of_week, start_time, end_time, kind, title_override)
select gen_random_uuid(), r.id, ctx.dow, '23:00'::time, '23:59'::time, 'lecture', 'VERIFY: engine flips on insert'
from public.rooms r, ctx
where r.slug = '121a'
  and not exists (
    select 1 from public.timetable_slots s
    where s.room_id = r.id and s.day_of_week = ctx.dow
      and s.start_time < '23:59'::time and s.end_time > '23:00'::time
      and s.title_override like 'VERIFY:%'
  );

-- Probe 2: a campus-wide HOLIDAY for next year (far future, no collision with
-- real usage). fn_room_occupancy must drop every timetable slot for that date.
insert into public.schedule_exceptions (exception_date, kind, reason)
select (current_date + interval '200 days')::date, 'holiday', 'VERIFY: campus-wide holiday probe'
where not exists (
  select 1 from public.schedule_exceptions
  where exception_date = (current_date + interval '200 days')::date
    and reason like 'VERIFY:%'
);

-- Probe 3: a room-specific MAINTENANCE window on the same future date, 09:00
-- to 17:00, on room 121 A. On that date the holiday already frees everything;
-- the maintenance row must re-occupy 121 A for its window (exception beats
-- holiday when both are dated).
insert into public.schedule_exceptions (room_id, exception_date, start_time, end_time, kind, reason)
select r.id, (current_date + interval '200 days')::date, '09:00'::time, '17:00'::time, 'maintenance', 'VERIFY: maintenance re-occupies on holiday-free date'
from public.rooms r
where r.slug = '121a'
  and not exists (
    select 1 from public.schedule_exceptions e
    where e.exception_date = (current_date + interval '200 days')::date
      and e.reason like 'VERIFY:%maintenance%'
  );
