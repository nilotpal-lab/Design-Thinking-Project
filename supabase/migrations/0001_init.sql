-- ============================================================================
-- JainSpace — 0001_init
-- Core schema: enums, tables, indexes, triggers.
-- Target: Supabase Postgres 15+
--
-- Design rule: we store FACTS (what rooms exist, what runs weekly, what broke
-- today). We never store what a student sees, because that is a function of
-- time. Availability is derived — see 0003_views.sql.
-- ============================================================================

begin;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- ENUMS
-- The current codebase types almost every union as `| string`, which is why
-- three incompatible Room shapes coexist. Postgres enums make that impossible.
-- ---------------------------------------------------------------------------

create type user_role          as enum ('student', 'faculty', 'staff', 'admin');
create type room_category      as enum ('smart_classroom', 'computer_lab', 'silent_study_pod',
                                        'seminar_amphitheatre', 'innovation_studio');
create type wing_type          as enum ('west', 'central', 'east');
create type noise_vibe         as enum ('silent', 'moderate', 'collaborative', 'quick_break');
create type wifi_band          as enum ('wifi_6e', 'wifi_5', 'wifi_4');
create type crowd_density      as enum ('empty', 'light', 'moderate', 'crowded', 'full');
create type ac_comfort         as enum ('freezing', 'comfortable', 'warm', 'off');
create type socket_availability as enum ('plenty', 'limited', 'none');
create type checkin_purpose    as enum ('study', 'group', 'charging', 'break', 'class');
create type slot_kind          as enum ('lecture', 'lab', 'tutorial', 'workshop', 'seminar', 'exam');
create type exception_kind     as enum ('holiday', 'maintenance', 'event', 'exam', 'blocked');
create type issue_category     as enum ('power', 'ac', 'wifi', 'projector', 'noise',
                                        'cleanliness', 'seating', 'furniture', 'other');
create type issue_urgency      as enum ('low', 'medium', 'high', 'critical');
create type issue_status       as enum ('open', 'acknowledged', 'assigned', 'in_progress',
                                        'resolved', 'rejected');
create type feature_kind       as enum ('amenity', 'best_for');

-- ---------------------------------------------------------------------------
-- SHARED TRIGGER FUNCTIONS
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- IDENTITY
-- ---------------------------------------------------------------------------

-- Mirrors auth.users. Role lives here and is NEVER client-writable
-- (see 0002_rls.sql — column-level grants, not a UI check).
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  usn         text unique,
  full_name   text not null default 'Student',
  role        user_role not null default 'student',
  department  text,
  semester    text,
  avatar_url  text,
  karma       integer not null default 0 check (karma >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.profiles.karma is
  'Server-awarded only, via triggers. Never settable from the client.';

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, usn, department, semester)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'usn', ''),
    nullif(new.raw_user_meta_data ->> 'department', ''),
    nullif(new.raw_user_meta_data ->> 'semester', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- PHYSICAL CAMPUS
-- ---------------------------------------------------------------------------

create table public.blocks (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  name       text not null,
  created_at timestamptz not null default now()
);

create table public.floors (
  id         uuid primary key default gen_random_uuid(),
  block_id   uuid not null references public.blocks (id) on delete cascade,
  level      smallint not null check (level between -2 and 20),
  label      text not null,
  unique (block_id, level)
);

create table public.rooms (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,          -- '121 A', '301B', '412'
  slug          text not null unique,          -- '121a', '301b'  (URL-safe)
  name          text not null,
  block_id      uuid not null references public.blocks (id) on delete restrict,
  floor_id      uuid not null references public.floors (id) on delete restrict,
  wing          wing_type not null,
  category      room_category not null,
  capacity      integer not null check (capacity > 0),
  description   text,
  directions    text,
  -- Floor-map geometry as percentages, so the SVG scales to any viewport.
  map_x         numeric(5,2) check (map_x between 0 and 100),
  map_y         numeric(5,2) check (map_y between 0 and 100),
  map_w         numeric(5,2) check (map_w between 0 and 100),
  map_h         numeric(5,2) check (map_h between 0 and 100),
  is_accessible boolean not null default true,
  is_bookable   boolean not null default false,
  is_active     boolean not null default true,
  -- Display-only catalogue copy carried over from the legacy dataset: free-text
  -- strings like '75" Interactive Touch Screen' or 'AWS Cloud Sandbox'.
  -- Deliberately NOT modelled as `features` rows: 302 distinct one-off strings
  -- is a controlled-vocabulary failure, not a lookup table, and turning them
  -- into rows would make `features` useless for the filtering it exists for.
  -- Filtering uses features/room_features; these arrays only render the UI.
  catalog_amenities text[] not null default '{}',
  catalog_best_for  text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index rooms_floor_idx    on public.rooms (floor_id) where is_active;
create index rooms_category_idx on public.rooms (category) where is_active;

create trigger rooms_updated_at
  before update on public.rooms
  for each row execute function public.set_updated_at();

-- Split out from rooms on purpose: infrastructure changes weekly (a socket
-- breaks, an AC is serviced) while room identity never changes, and the two
-- are maintained by different people.
create table public.room_infrastructure (
  room_id           uuid primary key references public.rooms (id) on delete cascade,
  sockets_total     integer not null default 0 check (sockets_total >= 0),
  sockets_working   integer not null default 0 check (sockets_working >= 0),
  has_ac            boolean not null default false,
  ac_type           text,
  ac_setpoint_c     numeric(4,1),
  has_projector     boolean not null default false,
  has_smart_board   boolean not null default false,
  has_whiteboard    boolean not null default false,
  has_natural_light boolean not null default false,
  wifi_band         wifi_band,
  wifi_mbps         integer check (wifi_mbps is null or wifi_mbps > 0),
  noise_vibe        noise_vibe not null default 'moderate',
  comfort_score     numeric(3,1) check (comfort_score between 0 and 10),
  last_inspected_at timestamptz,
  inspected_by      uuid references public.profiles (id) on delete set null,
  updated_at        timestamptz not null default now(),
  constraint sockets_working_lte_total check (sockets_working <= sockets_total)
);

create trigger room_infrastructure_updated_at
  before update on public.room_infrastructure
  for each row execute function public.set_updated_at();

-- Normalises the unqueryable `amenities: string[]` / `bestFor: string[]`
-- arrays. Now 'find me a room with a smart board' is an index scan, not a
-- string comparison in JavaScript.
create table public.features (
  id    uuid primary key default gen_random_uuid(),
  slug  text not null unique,
  label text not null,
  kind  feature_kind not null
);

create table public.room_features (
  room_id    uuid not null references public.rooms (id) on delete cascade,
  feature_id uuid not null references public.features (id) on delete cascade,
  primary key (room_id, feature_id)
);

-- ---------------------------------------------------------------------------
-- TIMETABLE
-- ---------------------------------------------------------------------------

create table public.faculty (
  id         uuid primary key default gen_random_uuid(),
  full_name  text not null,
  department text,
  email      text unique
);

create table public.courses (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,      -- 'CSE301'
  title      text not null,
  department text,
  credits    smallint
);

-- Recurring weekly pattern. day_of_week is ISO: 1 = Monday … 7 = Sunday.
create table public.timetable_slots (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references public.rooms (id) on delete cascade,
  course_id      uuid references public.courses (id) on delete set null,
  faculty_id     uuid references public.faculty (id) on delete set null,
  day_of_week    smallint not null check (day_of_week between 1 and 7),
  start_time     time not null,
  end_time       time not null,
  kind           slot_kind not null default 'lecture',
  batch          text,
  title_override text,                   -- for non-course bookings
  valid_from     date,                   -- semester bounds; null = always
  valid_to       date,
  created_at     timestamptz not null default now(),
  constraint slot_time_order check (end_time > start_time),
  constraint slot_valid_range check (valid_to is null or valid_from is null or valid_to >= valid_from)
);

create index timetable_slots_lookup_idx
  on public.timetable_slots (room_id, day_of_week, start_time);
create index timetable_slots_covering_idx
  on public.timetable_slots (day_of_week, start_time, end_time);

-- Dated one-offs: holidays, exam blocks, maintenance windows, events.
-- room_id IS NULL means campus-wide.
create table public.schedule_exceptions (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid references public.rooms (id) on delete cascade,
  exception_date date not null,
  start_time     time,
  end_time       time,
  kind           exception_kind not null,
  reason         text not null,
  created_by     uuid references public.profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  -- Times must be both-present or both-absent.
  constraint exception_time_pair  check ((start_time is null) = (end_time is null)),
  constraint exception_time_order check (end_time is null or end_time > start_time),
  -- Only a holiday may be whole-day. "Campus closed" is whole-day; nothing else is.
  constraint whole_day_only_holiday check (start_time is not null or kind = 'holiday')
);

create index schedule_exceptions_lookup_idx
  on public.schedule_exceptions (exception_date, room_id);

-- ---------------------------------------------------------------------------
-- CROWDSOURCED LIVE LAYER
-- ---------------------------------------------------------------------------

create table public.check_ins (
  id                  uuid primary key default gen_random_uuid(),
  room_id             uuid not null references public.rooms (id) on delete cascade,
  user_id             uuid not null references auth.users (id) on delete cascade,
  crowd_density       crowd_density not null,
  ac_comfort          ac_comfort,
  socket_availability socket_availability,
  purpose             checkin_purpose,
  note                text check (char_length(note) <= 280),
  is_anonymous        boolean not null default false,   -- display flag, not auth bypass
  is_simulated        boolean not null default false,    -- demo data, surfaced in UI
  helpful_count       integer not null default 0 check (helpful_count >= 0),
  created_at          timestamptz not null default now(),
  expires_at          timestamptz not null default (now() + interval '90 minutes'),
  -- Rate limit: one check-in per user, per room, per 20-minute bucket.
  -- Enforced by the database so it holds even if the API is bypassed.
  rate_bucket         timestamp generated always as (
                        date_trunc('hour', created_at at time zone 'UTC')
                        + floor(extract(minute from created_at at time zone 'UTC') / 20)
                          * interval '20 minutes'
                      ) stored,
  unique (room_id, user_id, rate_bucket)
);

-- NOTE: a partial-index predicate here (`where expires_at > now()`) is illegal —
-- now() is not IMMUTABLE, and Postgres rejects index predicates that call it
-- (error 42P17, caught on first apply). A plain composite index serves the
-- live lookup (`room_id = $1 and expires_at > now()`) just as well.
create index check_ins_room_recent_idx on public.check_ins (room_id, created_at desc);
create index check_ins_live_idx        on public.check_ins (room_id, expires_at);

comment on column public.check_ins.is_simulated is
  'True for rows written by scripts/simulate-activity.ts. The UI must render a demo badge.';

-- Unique per user per check-in: replaces the old `upvotedByMe` boolean, which
-- lost its value on every page reload.
create table public.check_in_votes (
  check_in_id uuid not null references public.check_ins (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (check_in_id, user_id)
);

-- ---------------------------------------------------------------------------
-- MAINTENANCE
-- ---------------------------------------------------------------------------

create sequence if not exists public.issue_ref_seq start 1000;

create table public.issues (
  id               uuid primary key default gen_random_uuid(),
  ref              text not null unique default ('JS-' || nextval('public.issue_ref_seq')::text),
  room_id          uuid not null references public.rooms (id) on delete cascade,
  reported_by      uuid not null references auth.users (id) on delete cascade,
  category         issue_category not null,
  title            text not null check (char_length(title) between 4 and 120),
  description      text not null check (char_length(description) between 10 and 2000),
  urgency          issue_urgency not null default 'medium',
  status           issue_status not null default 'open',
  assigned_to      uuid references public.profiles (id) on delete set null,
  photo_path       text,                                 -- Supabase Storage object path
  is_anonymous     boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  resolved_at      timestamptz,
  resolution_note  text,
  constraint resolved_fields_consistent check (
    (status = 'resolved') = (resolved_at is not null)
  )
);

create index issues_room_idx   on public.issues (room_id, status);
create index issues_status_idx on public.issues (status, urgency, created_at desc);
create index issues_mine_idx   on public.issues (reported_by, created_at desc);

create trigger issues_updated_at
  before update on public.issues
  for each row execute function public.set_updated_at();

create table public.issue_votes (
  issue_id   uuid not null references public.issues (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (issue_id, user_id)
);

-- Immutable audit trail. This is what makes the admin console look like a real
-- facilities system rather than a status dropdown.
create table public.issue_events (
  id          bigserial primary key,
  issue_id    uuid not null references public.issues (id) on delete cascade,
  actor_id    uuid references auth.users (id) on delete set null,
  event_type  text not null,                 -- 'created' | 'status_change' | 'assigned' | 'commented'
  from_status issue_status,
  to_status   issue_status,
  note        text,
  created_at  timestamptz not null default now()
);

create index issue_events_timeline_idx on public.issue_events (issue_id, created_at);

create or replace function public.log_issue_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.issue_events (issue_id, actor_id, event_type, to_status, note)
    values (new.id, new.reported_by, 'created', new.status, 'Issue reported');
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.issue_events (issue_id, actor_id, event_type, from_status, to_status, note)
    values (new.id, auth.uid(), 'status_change', old.status, new.status, new.resolution_note);
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    insert into public.issue_events (issue_id, actor_id, event_type, note)
    values (new.id, auth.uid(), 'assigned',
            'Assigned to ' || coalesce((select full_name from public.profiles where id = new.assigned_to), 'nobody'));
  end if;

  return new;
end;
$$;

create trigger issues_audit
  after insert or update on public.issues
  for each row execute function public.log_issue_change();

-- ---------------------------------------------------------------------------
-- PERSONALISATION
-- ---------------------------------------------------------------------------

create table public.favorites (
  user_id    uuid not null references auth.users (id) on delete cascade,
  room_id    uuid not null references public.rooms (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, room_id)
);

-- ---------------------------------------------------------------------------
-- KARMA
-- Awarded only by triggers, never by the client. The old app kept karma in
-- localStorage, so "145 points" was a number the user could edit in devtools.
-- ---------------------------------------------------------------------------

create or replace function public.award_karma(p_user uuid, p_points integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles set karma = greatest(0, karma + p_points) where id = p_user;
$$;

create or replace function public.trg_karma_checkin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.award_karma(new.user_id, 15);
  return new;
end; $$;

create or replace function public.trg_karma_issue()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.award_karma(new.reported_by, 25);
  return new;
end; $$;

create or replace function public.trg_karma_vote()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_author uuid;
begin
  update public.check_ins
     set helpful_count = helpful_count + 1
   where id = new.check_in_id
  returning user_id into v_author;

  -- The reporter earns karma for a confirmation; self-votes are blocked in RLS.
  perform public.award_karma(v_author, 2);
  return new;
end; $$;

create trigger karma_on_checkin
  after insert on public.check_ins
  for each row execute function public.trg_karma_checkin();

create trigger karma_on_issue
  after insert on public.issues
  for each row execute function public.trg_karma_issue();

create trigger count_on_checkin_vote
  after insert on public.check_in_votes
  for each row execute function public.trg_karma_vote();

create or replace function public.trg_count_issue_vote()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.award_karma((select reported_by from public.issues where id = new.issue_id), 5);
  return new;
end; $$;

create trigger count_on_issue_vote
  after insert on public.issue_votes
  for each row execute function public.trg_count_issue_vote();

commit;
