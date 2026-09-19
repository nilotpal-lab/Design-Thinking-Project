-- One-time fix applied 2026-09-17: the blanket default-deny revoke in
-- 0003_rls.sql stripped the view grants made in 0002_views.sql (Postgres
-- `revoke all on all tables` includes views). Grants now live canonically at
-- the end of 0003_rls.sql; this file re-establishes them on the live project.
-- Future rebuilds from the migration files do NOT need this script.

grant select on public.v_room_live_status to anon, authenticated;
grant select on public.v_floor_summary    to anon, authenticated;
grant execute on function public.fn_room_day(date, uuid) to anon, authenticated;
grant execute on function public.fn_room_occupancy(date) to anon, authenticated;
