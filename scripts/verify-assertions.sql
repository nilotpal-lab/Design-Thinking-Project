-- =============================================================================
-- Phase 2 ASSERTIONS — one SELECT; every row is pass=true/false.
-- The probe rows from verify-setup.sql must be present for A7-A9.
-- =============================================================================

with

-- Today in campus time
ctx as (
  select (now() at time zone public.fn_campus_tz())::date as today,
         (now() at time zone public.fn_campus_tz())::time as now_t,
         extract(isodow from (now() at time zone public.fn_campus_tz())::date)::smallint as dow
),

-- A7 control: room 121 A busy status TONIGHT (probe slot 23:00-23:59 exists
-- on today's weekday) vs busy status NOW.
engine_flip as (
  select
    (select count(*) from public.fn_room_occupancy((select today from ctx) + 0)
     where room_id = (select id from public.rooms where slug = '121a')
       and (start_time, end_time) overlaps ((select now_t from ctx), (select now_t from ctx))) as busy_now,
    (select count(*) from public.fn_room_occupancy((select today from ctx))
     where room_id = (select id from public.rooms where slug = '121a')
       and (start_time, end_time) overlaps ('23:30'::time, '23:30'::time)) as busy_tonight
),

-- A8: on the probe date, the holiday must erase ALL timetable occupancy
-- (515 slots exist per week -> ~103 on any given weekday).
holiday as (
  select
    (select count(*) from public.fn_room_occupancy((current_date + interval '200 days')::date)) as occupied_rows_on_holiday,
    (select count(*) from public.timetable_slots
      where day_of_week = extract(isodow from (current_date + interval '200 days')::date)::smallint) as slots_that_weekday
),

-- A9: on the probe date, maintenance re-occupies 121 A 09:00-17:00 even
-- though the campus-wide holiday frees everyone else.
maintenance as (
  select
    (select count(*) from public.fn_room_occupancy((current_date + interval '200 days')::date)
      where room_id = (select id from public.rooms where slug = '121a')
        and start_time <= '12:00'::time and end_time > '12:00'::time) as room_occupied_at_noon,
    (select count(*) from public.rooms where is_active) as active_rooms
)

select 'A1_rooms_52'             as assertion, ((select count(*) from public.rooms) = 52)                          as pass
union all
select 'A2_view_rows_52',          (select count(*) = 52 from public.v_room_live_status)
union all
select 'A3_no_null_status',        (select bool_and(status is not null) from public.v_room_live_status)
union all
select 'A4_free_minutes_sane',     (select bool_and(
                                     (status = 'busy' and free_minutes = 0) or
                                     (status in ('free','soon') and (free_minutes > 0 or free_minutes is null))
                                   ) from public.v_room_live_status)
union all
select 'A5_busy_matches_engine',   (
  (select count(*) from public.v_room_live_status where status = 'busy') =
  (select count(*) from public.fn_room_occupancy((select (now() at time zone public.fn_campus_tz())::date))
    where (start_time, end_time) overlaps
      ((select (now() at time zone public.fn_campus_tz())::time),
       (select (now() at time zone public.fn_campus_tz())::time)))
)
union all
select 'A6_status_domain_ok',      (select bool_and(status in ('free','soon','busy')) from public.v_room_live_status)
union all
select 'A7_timetable_insert_flips_engine', (
  (select busy_tonight from engine_flip) = 1
)
union all
select 'A8_holiday_clears_all',    (
  (select occupied_rows_on_holiday from holiday) = 1  -- exactly one row: the maintenance exception
  and (select slots_that_weekday from holiday) > 0
)
union all
select 'A9_maintenance_beats_holiday', (
  (select room_occupied_at_noon from maintenance) = 1
)
union all
select 'A10_floor_summary_sane',   (
  (select coalesce(sum(free_rooms + soon_rooms + busy_rooms), 0) from public.v_floor_summary) =
  (select count(*) from public.v_room_live_status)
)
union all
-- A11: RLS posture — every user-data table must have RLS enabled
select 'A11_rls_enabled_everywhere', (
  select bool_and(relrowsecurity) from pg_class
  where relnamespace = 'public'::regnamespace
    and relkind = 'r'
    and relname in ('profiles','check_ins','check_in_votes','issues','issue_events','issue_upvotes','room_favorites')
)
union all
-- A12: privilege guard — clients must not be able to WRITE identity/role.
-- Reads are intentional (users see their own karma); only writes escalate.
select 'A12_role_not_writable', (
  not exists (
    select 1 from information_schema.column_privileges
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name in ('role','karma','id')
      and privilege_type in ('INSERT','UPDATE','DELETE')
      and grantee in ('anon','authenticated')
  )
)
union all
-- A13: the occupancy primitive is hidden from clients
select 'A13_occupancy_fn_hidden', (
  not exists (
    select 1 from information_schema.routine_privileges
    where routine_schema = 'public'
      and routine_name = 'fn_room_occupancy'
      and grantee in ('anon','authenticated')
  )
)
union all
-- A14: seed is idempotent in shape — no duplicate room codes or slugs
select 'A14_no_duplicate_codes', (
  (select count(distinct code) from public.rooms) = (select count(*) from public.rooms)
  and (select count(distinct slug) from public.rooms) = (select count(*) from public.rooms)
);
