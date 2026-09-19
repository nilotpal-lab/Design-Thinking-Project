-- ============================================================================
-- JainSpace — 0003_views
-- The availability engine.
--
-- Everything a student sees is computed here, never stored.
--
--   occupied(room, t) = (recurring weekly slots for t's weekday)
--                       − (campus-wide holidays)
--                       + (dated exceptions: exams, maintenance, events)
--
-- The current app hardcodes `currentTime = '10:45'` and `currentOccupancy: 25`
-- as literals. This file replaces both with a derivation, so availability can
-- never drift from the timetable.
-- ============================================================================

begin;

-- Campus timezone. Jain University is in Bangalore; all availability maths is
-- local so a server in another region cannot shift the answer.
create or replace function public.fn_campus_tz()
returns text language sql immutable as $$ select 'Asia/Kolkata'::text $$;

-- ---------------------------------------------------------------------------
-- OCCUPANCY INTERVALS
-- Every interval during which a given room is NOT available on a given date.
-- ---------------------------------------------------------------------------

create or replace function public.fn_room_occupancy(p_date date)
returns table (
  room_id      uuid,
  start_time   time,
  end_time     time,
  title        text,
  kind         text,
  source       text,
  course_code  text,
  faculty_name text,
  batch        text
)
language sql
stable
security definer
set search_path = public
as $$
  with holiday as (
    select
      -- A campus-wide whole-day holiday frees every room.
      exists (
        select 1 from public.schedule_exceptions e
        where e.exception_date = p_date
          and e.kind = 'holiday'
          and e.room_id is null
          and e.start_time is null
      ) as campus_wide,
      -- Room-specific whole-day closures.
      (select coalesce(array_agg(e.room_id), '{}')
         from public.schedule_exceptions e
        where e.exception_date = p_date
          and e.kind = 'holiday'
          and e.room_id is not null
          and e.start_time is null) as closed_rooms
  )

  -- 1. Recurring weekly timetable, unless the campus or room is closed.
  select
    s.room_id,
    s.start_time,
    s.end_time,
    coalesce(s.title_override, c.title, 'Scheduled Session')::text,
    s.kind::text,
    'timetable'::text,
    c.code,
    fac.full_name,
    s.batch
  from public.timetable_slots s
  cross join holiday h
  left join public.courses c   on c.id = s.course_id
  left join public.faculty fac on fac.id = s.faculty_id
  where not h.campus_wide
    and s.day_of_week = extract(isodow from p_date)::smallint
    and (s.valid_from is null or p_date >= s.valid_from)
    and (s.valid_to   is null or p_date <= s.valid_to)
    and not (s.room_id = any (h.closed_rooms))

  union all

  -- 2. Dated, room-specific exceptions (exam block, maintenance, event).
  select
    e.room_id,
    e.start_time,
    e.end_time,
    e.reason,
    e.kind::text,
    'exception'::text,
    null::text,
    null::text,
    null::text
  from public.schedule_exceptions e
  where e.exception_date = p_date
    and e.room_id is not null
    and e.start_time is not null
    and e.kind <> 'holiday'

  union all

  -- 3. Dated, campus-wide exceptions expanded across every active room.
  select
    r.id,
    e.start_time,
    e.end_time,
    e.reason,
    e.kind::text,
    'exception'::text,
    null::text,
    null::text,
    null::text
  from public.schedule_exceptions e
  cross join public.rooms r
  where e.exception_date = p_date
    and e.room_id is null
    and e.start_time is not null
    and e.kind <> 'holiday'
    and r.is_active;
$$;

-- ---------------------------------------------------------------------------
-- WHAT'S THE ROOM DOING RIGHT NOW?
-- One row per active room. This single view backs the explorer, the floor map,
-- the matcher, the room detail page, and the dashboard counters — so they can
-- never disagree with each other, which they currently do.
-- ---------------------------------------------------------------------------

create or replace view public.v_room_live_status
with (security_invoker = false)
as
with ctx as (
  select
    (now() at time zone public.fn_campus_tz())::date as local_date,
    (now() at time zone public.fn_campus_tz())::time as local_time
),
occ as (
  select o.* from ctx, lateral public.fn_room_occupancy(ctx.local_date) o
)
select
  r.id     as room_id,
  r.code,
  r.slug,
  r.name,
  r.category,
  r.capacity,
  r.wing,
  r.is_accessible,
  b.code   as block_code,
  b.name   as block_name,
  f.level  as floor_level,
  f.label  as floor_label,
  r.map_x, r.map_y, r.map_w, r.map_h,

  inf.sockets_total,
  inf.sockets_working,
  inf.has_ac,
  inf.ac_type,
  inf.has_projector,
  inf.has_smart_board,
  inf.has_whiteboard,
  inf.wifi_band,
  inf.wifi_mbps,
  inf.noise_vibe,
  inf.comfort_score,

  cur.title        as current_occupancy_title,
  cur.kind         as current_occupancy_kind,
  cur.course_code  as current_course_code,
  cur.faculty_name as current_faculty,
  cur.batch        as current_batch,
  cur.end_time     as occupied_until,
  nxt.start_time   as next_occupancy_from,
  nxt.title        as next_occupancy_title,

  -- 'free' | 'soon' (< 20 min of freedom left) | 'busy'
  case
    when cur.room_id is not null then 'busy'
    when nxt.start_time is not null
     and (nxt.start_time - ctx.local_time) <= interval '20 minutes' then 'soon'
    else 'free'
  end as status,

  (cur.room_id is null) as is_free_now,

  -- Minutes of uninterrupted freedom remaining; null when busy.
  case
    when cur.room_id is null and nxt.start_time is not null
      then floor(extract(epoch from (nxt.start_time - ctx.local_time)) / 60)::integer
    when cur.room_id is null
      then null            -- free until end of day
    else 0
  end as free_minutes,

  crowd.report_count,
  crowd.crowd_density,
  crowd.last_report_at,
  crowd.confidence,

  coalesce(issues.open_issue_count, 0) as open_issue_count,

  ctx.local_date as as_of_date,
  ctx.local_time as as_of_time,
  now()          as computed_at
from public.rooms r
join public.blocks b on b.id = r.block_id
join public.floors f on f.id = r.floor_id
left join public.room_infrastructure inf on inf.room_id = r.id
cross join ctx
left join lateral (
  select o.room_id, o.title, o.kind, o.end_time, o.course_code, o.faculty_name, o.batch
  from occ o
  where o.room_id = r.id
    and o.start_time <= ctx.local_time
    and o.end_time   >  ctx.local_time
  order by o.start_time desc
  limit 1
) cur on true
left join lateral (
  select o.start_time, o.title
  from occ o
  where o.room_id = r.id
    and o.start_time > ctx.local_time
  order by o.start_time
  limit 1
) nxt on true
left join lateral (
  select
    count(*)                                          as report_count,
    mode() within group (order by ci.crowd_density)   as crowd_density,
    max(ci.created_at)                                as last_report_at,
    case when count(*) >= 3 then 'high'
         when count(*) >= 1 then 'medium'
         else 'low' end                               as confidence
  from public.check_ins ci
  where ci.room_id = r.id
    and ci.expires_at > now()
) crowd on true
left join lateral (
  select count(*) as open_issue_count
  from public.issues i
  where i.room_id = r.id
    and i.status not in ('resolved', 'rejected')
) issues on true
where r.is_active;

-- ---------------------------------------------------------------------------
-- TODAY'S TIMELINE for one room or a whole floor.
-- Drives the 9-slot band on the room detail page.
-- ---------------------------------------------------------------------------

create or replace function public.fn_room_day(p_date date, p_room_id uuid default null)
returns table (
  room_id      uuid,
  code         text,
  slot_start   time,
  slot_end     time,
  title        text,
  kind         text,
  source       text,
  course_code  text,
  faculty_name text,
  batch        text,
  is_past      boolean,
  is_current   boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with ctx as (
    select (now() at time zone public.fn_campus_tz())::time as local_time
  )
  select
    o.room_id,
    r.code,
    o.start_time,
    o.end_time,
    o.title,
    o.kind,
    o.source,
    o.course_code,
    o.faculty_name,
    o.batch,
    o.end_time <= ctx.local_time                            as is_past,
    (o.start_time <= ctx.local_time and o.end_time > ctx.local_time) as is_current
  from public.fn_room_occupancy(p_date) o
  join public.rooms r on r.id = o.room_id
  cross join ctx
  where (p_room_id is null or o.room_id = p_room_id)
    and r.is_active
  order by r.code, o.start_time;
$$;

-- ---------------------------------------------------------------------------
-- FLOOR ROLL-UP for the map header chips.
-- ---------------------------------------------------------------------------

create or replace view public.v_floor_summary
with (security_invoker = false)
as
select
  s.floor_level,
  s.floor_label,
  s.block_code,
  count(*)                                            as total_rooms,
  count(*) filter (where s.status = 'free')            as free_rooms,
  count(*) filter (where s.status = 'soon')            as soon_rooms,
  count(*) filter (where s.status = 'busy')            as busy_rooms,
  sum(coalesce(s.sockets_working, 0))                  as working_sockets,
  round(avg(s.comfort_score), 1)                       as avg_comfort
from public.v_room_live_status s
group by s.floor_level, s.floor_label, s.block_code;

-- ---------------------------------------------------------------------------
-- GRANTS live in 0003_rls.sql: the blanket default-deny revoke there covers
-- every relation in `public` INCLUDING views, so any grant made here would be
-- silently stripped when RLS runs after this file. Single home for access
-- control, applied last.
-- ---------------------------------------------------------------------------

commit;
