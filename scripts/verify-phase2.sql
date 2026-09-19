-- =============================================================================
-- Phase 2 verification battery. Each result row is one assertion:
--   pass = true means the invariant holds. Any pass=false row is a failure.
-- =============================================================================

-- 1. Schema sanity: 52 rooms, 52 infra, 515 slots, 49 features
select 'rooms_52' as assertion, (select count(*) = 52 from public.rooms)                          as pass
union all
select 'infra_52',        (select count(*) = 52 from public.room_infrastructure)
union all
select 'slots_515',       (select count(*) = 515 from public.timetable_slots)
union all
select 'features_49',     (select count(*) = 49 from public.features)
union all
select 'room_features_393',(select count(*) = 393 from public.room_features)
union all
select 'blocks_2',        (select count(*) = 2 from public.blocks)
union all
select 'floors_7',        (select count(*) = 7 from public.floors);

-- 2. The availability view works and covers every active room
select 'view_covers_52_active_rooms' as assertion,
       (select count(*) = 52 from public.v_room_live_status) as pass;

-- 3. Every room resolved a status (null status would mean the engine broke)
select 'no_null_status' as assertion,
       (select bool_and(status is not null) from public.v_room_live_status) as pass;

-- 4. free_minutes is exactly 0 when busy, and positive or null when free
select 'free_minutes_consistent' as assertion,
       (select bool_and(
         (status = 'busy' and free_minutes = 0) or
         (status in ('free','soon') and (free_minutes > 0 or free_minutes is null))
       ) from public.v_room_live_status) as pass;

-- 5. Consistency proof: counting busy rooms from the raw timetable must equal
--    what the view reports. Uses the same "today" date the view computed.
select 'busy_count_matches_raw_timetable' as assertion,
       (select count(*) = (select count(*) from public.v_room_live_status where status = 'busy')
        from public.fn_room_occupancy((select (now() at time zone public.fn_campus_tz())::date from ctx2))
        where (start_time, end_time) overlaps ((select local_time from ctx2), (select local_time from ctx2))
       ) as pass
from (select (now() at time zone public.fn_campus_tz())::date as d,
             (now() at time zone public.fn_campus_tz())::time as local_time
      ) ctx2;

-- 6. "Change the timetable, the UI follows": insert a slot NOW on today's
--    weekday inside the remaining waking hours (23:00-23:59 to avoid
--    colliding with real classes), then prove the room flips to busy.
with ctx as (
  select (now() at time zone public.fn_campus_tz())::date as d,
         extract(isodow from (now() at time zone public.fn_campus_tz())::date)::smallint as dow
)
insert into public.timetable_slots
      (id, room_id, day_of_week, start_time, end_time, kind, title_override)
select gen_random_uuid(), r.id, ctx.dow, '23:00'::time, '23:59'::time, 'lecture', 'VERIFY: engine flips on insert'
from public.rooms r, ctx
where r.slug = '121a'
  and not exists (select 1 from public.timetable_slots s
                  where s.room_id = r.id and s.day_of_week = ctx.dow
                    and s.start_time < '23:59' and s.end_time > '23:00');
