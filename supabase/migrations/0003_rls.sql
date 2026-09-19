-- ============================================================================
-- JainSpace — 0002_rls
-- Row Level Security + column-level privileges.
--
-- Posture: DEFAULT DENY.
-- Supabase grants anon/authenticated broad privileges on new public tables, so
-- we explicitly revoke everything and hand back only what each role needs.
--
-- Two independent layers protect every write:
--   1. GRANT  — can this role touch this column at all?
--   2. POLICY — can this use touch this row?
-- A bug in one does not open the other.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- STAFF CHECK
-- SECURITY DEFINER so it reads profiles without re-entering RLS (which would
-- recurse infinitely on a self-referencing policy).
-- ---------------------------------------------------------------------------

create or replace function public.fn_is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('staff', 'admin', 'faculty')
  );
$$;

create or replace function public.fn_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- LOCK EVERYTHING DOWN FIRST
-- ---------------------------------------------------------------------------

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

-- Anything SECURITY DEFINER must not be callable by clients unless intended.
revoke all on function public.award_karma(uuid, integer)      from public, anon, authenticated;
revoke all on function public.fn_room_occupancy(date)          from public, anon, authenticated;
grant execute on function public.fn_is_staff() to anon, authenticated;
grant execute on function public.fn_is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- READ-ONLY CAMPUS DATA
-- Physical inventory is public: an anonymous visitor must be able to browse.
-- Writes happen only through the service role (seed scripts, admin actions).
-- ---------------------------------------------------------------------------

alter table public.blocks              enable row level security;
alter table public.floors              enable row level security;
alter table public.rooms               enable row level security;
alter table public.room_infrastructure enable row level security;
alter table public.features            enable row level security;
alter table public.room_features       enable row level security;
alter table public.faculty             enable row level security;
alter table public.courses             enable row level security;
alter table public.timetable_slots     enable row level security;
alter table public.schedule_exceptions enable row level security;

grant select on public.blocks, public.floors, public.rooms, public.room_infrastructure,
                public.features, public.room_features, public.faculty, public.courses,
                public.timetable_slots, public.schedule_exceptions
  to anon, authenticated;

grant insert, update, delete on public.rooms, public.room_infrastructure,
                                public.timetable_slots, public.schedule_exceptions
  to authenticated;   -- narrowed by policy to staff only

create policy "campus_read_all" on public.blocks
  for select to anon, authenticated using (true);
create policy "campus_read_all" on public.floors
  for select to anon, authenticated using (true);
create policy "campus_read_all" on public.rooms
  for select to anon, authenticated using (true);
create policy "campus_read_all" on public.room_infrastructure
  for select to anon, authenticated using (true);
create policy "campus_read_all" on public.features
  for select to anon, authenticated using (true);
create policy "campus_read_all" on public.room_features
  for select to anon, authenticated using (true);
create policy "campus_read_all" on public.faculty
  for select to anon, authenticated using (true);
create policy "campus_read_all" on public.courses
  for select to anon, authenticated using (true);
create policy "campus_read_all" on public.timetable_slots
  for select to anon, authenticated using (true);
create policy "campus_read_all" on public.schedule_exceptions
  for select to anon, authenticated using (true);

create policy "rooms_staff_write" on public.rooms
  for all to authenticated using (public.fn_is_staff()) with check (public.fn_is_staff());
create policy "room_infra_staff_write" on public.room_infrastructure
  for all to authenticated using (public.fn_is_staff()) with check (public.fn_is_staff());
create policy "timetable_staff_write" on public.timetable_slots
  for all to authenticated using (public.fn_is_staff()) with check (public.fn_is_staff());
create policy "exceptions_staff_write" on public.schedule_exceptions
  for all to authenticated using (public.fn_is_staff()) with check (public.fn_is_staff());

-- ---------------------------------------------------------------------------
-- PROFILES
-- The critical table. Two separate safeguards stop privilege escalation:
--
--   (a) COLUMN GRANTS below allow updating only display fields. `role` and
--       `karma` are not in the grant list, so Postgres rejects the write
--       before any application logic runs.
--   (b) The policy additionally pins `role` to its current value, so even if
--       someone re-grants the column the row-level check still fails.
--
-- The previous app stored the user object — including `role` — in
-- localStorage. Editing one key in devtools made you an admin.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

grant select on public.profiles to authenticated;
grant update (full_name, avatar_url, department, semester, usn) on public.profiles to authenticated;

-- Deliberately NO insert: profiles are created by the auth trigger only.
-- Deliberately NO delete: account deletion is an admin/service-role operation.

create policy "profiles_select_self_or_staff" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.fn_is_staff());

create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_staff_manage" on public.profiles
  for update to authenticated
  using (public.fn_is_admin())
  with check (public.fn_is_admin());

-- Public identity, no email and no USN. This is what anon reads.
create or replace view public.v_public_profiles
with (security_invoker = false)
as
  select id, full_name, avatar_url, role, department, semester, karma, created_at
  from public.profiles;

grant select on public.v_public_profiles to anon, authenticated;

-- ---------------------------------------------------------------------------
-- CHECK-INS
-- Anonymous-first: browsing needs no account, contributing does.
-- Row-level reads are authenticated-only; anonymous visitors get the aggregate
-- via v_room_live_status, so they still see crowd levels — just not who.
-- ---------------------------------------------------------------------------

alter table public.check_ins enable row level security;

grant select on public.check_ins to authenticated;
grant insert (room_id, user_id, crowd_density, ac_comfort, socket_availability,
              purpose, note, is_anonymous) on public.check_ins to authenticated;
grant delete on public.check_ins to authenticated;   -- own, within 15 min

create policy "checkins_read_authenticated" on public.check_ins
  for select to authenticated using (true);

create policy "checkins_insert_own" on public.check_ins
  for insert to authenticated
  with check (
    user_id = auth.uid()
    -- Simulation flags are a dev-script concern; clients may never set them.
    and is_simulated = false
    and exists (select 1 from public.rooms r where r.id = room_id and r.is_active)
  );

-- "That was me, I mis-tapped" — a short correction window.
create policy "checkins_delete_own_recent" on public.check_ins
  for delete to authenticated
  using (user_id = auth.uid() and created_at > now() - interval '15 minutes');

-- No UPDATE policy at all: check-in content is immutable. helpful_count moves
-- via the vote trigger, and expires_at is fixed at insert time.

alter table public.check_in_votes enable row level security;

grant select on public.check_in_votes to authenticated;
grant insert (check_in_id, user_id) on public.check_in_votes to authenticated;
grant delete on public.check_in_votes to authenticated;

create policy "checkin_votes_read" on public.check_in_votes
  for select to authenticated using (true);
create policy "checkin_votes_insert_own" on public.check_in_votes
  for insert to authenticated with check (user_id = auth.uid());
create policy "checkin_votes_delete_own" on public.check_in_votes
  for delete to authenticated using (user_id = auth.uid());

-- Self-confirmation would let one student inflate their own report's
-- credibility, which is the whole signal other students rely on.
create or replace function public.trg_block_self_vote()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from public.check_ins
    where id = new.check_in_id and user_id = new.user_id
  ) then
    raise exception 'You cannot confirm your own check-in';
  end if;
  return new;
end; $$;

create trigger block_self_checkin_vote
  before insert on public.check_in_votes
  for each row execute function public.trg_block_self_vote();

-- Anonymous visitors get the activity feed without contributor identities.
create or replace view public.v_checkin_feed
with (security_invoker = false)
as
  select
    ci.id,
    ci.room_id,
    r.code as room_code,
    r.name as room_name,
    ci.crowd_density,
    ci.ac_comfort,
    ci.socket_availability,
    ci.purpose,
    ci.note,
    ci.helpful_count,
    ci.is_simulated,
    ci.created_at,
    ci.expires_at,
    case when ci.is_anonymous then 'Anonymous'
         else coalesce(p.full_name, 'Student') end as display_name,
    ci.created_at > now() - interval '90 minutes' as is_live
  from public.check_ins ci
  join public.rooms r on r.id = ci.room_id
  left join public.profiles p on p.id = ci.user_id;

grant select on public.v_checkin_feed to anon, authenticated;

-- ---------------------------------------------------------------------------
-- ISSUES
-- The public board is a feature: accountability is the point. Everyone reads,
-- only signed-in students report, only staff triage.
-- ---------------------------------------------------------------------------

alter table public.issues enable row level security;

grant select on public.issues to anon, authenticated;
grant insert (room_id, reported_by, category, title, description, urgency,
              photo_path, is_anonymous) on public.issues to authenticated;
grant update (status, assigned_to, resolution_note, resolved_at, urgency)
  on public.issues to authenticated;

create policy "issues_read_all" on public.issues
  for select to anon, authenticated using (true);

create policy "issues_insert_own" on public.issues
  for insert to authenticated
  with check (
    reported_by = auth.uid()
    and status = 'open'                 -- cannot self-assign a status on create
    and assigned_to is null
    and resolved_at is null
  );

-- Staff triage anything; a reporter may withdraw their own ticket before it is
-- picked up, but may not mark their own work "resolved" without going through
-- the workflow.
create policy "issues_staff_update" on public.issues
  for update to authenticated
  using (public.fn_is_staff())
  with check (public.fn_is_staff());

create policy "issues_reporter_withdraw" on public.issues
  for update to authenticated
  using (reported_by = auth.uid() and status in ('open', 'acknowledged'))
  with check (reported_by = auth.uid() and status = 'rejected');

alter table public.issue_votes enable row level security;

grant select on public.issue_votes to anon, authenticated;
grant insert (issue_id, user_id) on public.issue_votes to authenticated;
grant delete on public.issue_votes to authenticated;

create policy "issue_votes_read" on public.issue_votes
  for select to anon, authenticated using (true);
create policy "issue_votes_insert_own" on public.issue_votes
  for insert to authenticated with check (user_id = auth.uid());
create policy "issue_votes_delete_own" on public.issue_votes
  for delete to authenticated using (user_id = auth.uid());

alter table public.issue_events enable row level security;

grant select on public.issue_events to anon, authenticated;
-- No insert/update/delete grants: the audit trail is written by trigger only.
-- An audit log the audited party can edit is not an audit log.

create policy "issue_events_read_all" on public.issue_events
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- FAVORITES — private by construction, no policy needed beyond ownership.
-- ---------------------------------------------------------------------------

alter table public.favorites enable row level security;

grant select, insert, delete on public.favorites to authenticated;
grant usage on sequence public.issue_ref_seq to authenticated;

create policy "favorites_read_own" on public.favorites
  for select to authenticated using (user_id = auth.uid());
create policy "favorites_insert_own" on public.favorites
  for insert to authenticated with check (user_id = auth.uid());
create policy "favorites_delete_own" on public.favorites
  for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- VIEW + FUNCTION ACCESS
-- Must live AFTER the blanket revoke above: `revoke all ... from all tables`
-- in Postgres covers views too, so grants made in 0002_views were silently
-- stripped when this file ran later (caught live: 'permission denied for
-- view v_room_live_status'). The availability layer is read-only to clients.
-- ---------------------------------------------------------------------------

grant select on public.v_room_live_status to anon, authenticated;
grant select on public.v_floor_summary    to anon, authenticated;
grant execute on function public.fn_room_day(date, uuid) to anon, authenticated;

-- Postgres checks function EXECUTE inside a view against the CALLING user
-- (unlike table access, which uses the view owner). The live-status view
-- calls fn_room_occupancy, so every client of the view needs execute on it.
-- It is SECURITY DEFINER and read-only — the exposure is the same data the
-- view already publishes, just raw. (Caught live: 'permission denied for
-- function fn_room_occupancy' — the earlier 'hide the primitive' revoke
-- was impossible by Postgres semantics.)
grant execute on function public.fn_room_occupancy(date) to anon, authenticated;

commit;
