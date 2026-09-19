-- ============================================================================
-- JainSpace — 0005_cabins_events
-- 1. Faculty cabins: where each teacher's office is, fed by head admin
--    (manual entry or CSV import). `cabin_room_id` links to a real room so
--    the cabin inherits live availability from the existing engine.
-- 2. Events: campus event tracker (fests, workshops, exams) with venue links.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Faculty cabin columns
-- ---------------------------------------------------------------------------
alter table public.faculty
  add column if not exists cabin_room_id uuid references public.rooms (id) on delete set null,
  add column if not exists cabin_note    text,
  add column if not exists office_hours  text;

comment on column public.faculty.cabin_room_id is
  'Room where this faculty member''s cabin/office is. Admin-maintained.';
comment on column public.faculty.cabin_note is
  'Free-text detail, e.g. "Cabin shared with Dr. Rao, ask at Block A reception".';
comment on column public.faculty.office_hours is
  'Display-only string, e.g. "Mon–Fri 14:00–16:00".';

-- ---------------------------------------------------------------------------
-- 2. Events
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.event_category as enum
    ('fest', 'workshop', 'seminar', 'exam', 'club', 'sports', 'cultural', 'other');
exception
  when duplicate_object then null;
end $$;

create table public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  category    public.event_category not null default 'other',
  venue_room_id uuid references public.rooms (id) on delete set null,
  venue_text  text,                            -- fallback when venue isn't a tracked room
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  all_day     boolean not null default false,
  organizer   text,
  is_cancelled boolean not null default false,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint event_time_order check (ends_at is null or ends_at > starts_at)
);

create index events_starts_idx   on public.events (starts_at);
create index events_window_idx   on public.events (starts_at, ends_at);
create index events_venue_idx    on public.events (venue_room_id) where venue_room_id is not null;

comment on table public.events is
  'Campus events: fests, workshops, exams, club meets. Admin writes, everyone reads.';

-- ---------------------------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;

create policy "events_read_all" on public.events
  for select using (true);

create policy "events_admin_write" on public.events
  for all using (public.fn_is_admin()) with check (public.fn_is_admin());

-- Faculty cabin columns are admin-maintained; reads stay public (campus_read_all
-- already covers faculty selects). Explicit update policy for admins:
create policy "faculty_cabin_admin_write" on public.faculty
  for update using (public.fn_is_admin()) with check (public.fn_is_admin());

-- ---------------------------------------------------------------------------
-- 4. Grants (canonical place: end of file, matching 0003 convention)
-- ---------------------------------------------------------------------------
grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;

grant update (cabin_room_id, cabin_note, office_hours) on public.faculty to authenticated;

commit;
