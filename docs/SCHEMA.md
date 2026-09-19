# JainSpace — Data Model

> 17 operational tables + 6 content tables · RLS on every table · default-deny grants.
> Migrations: `supabase/migrations/0001_init.sql`, `0002_rls.sql`, `0003_views.sql`

---

## 1. Entity relationships

```
                          auth.users  ①
                               │ 1:1 (trigger)
                               ▼
                          profiles ──────────────┐
                               │                  │
    blocks ①───* floors        │                  │ reported_by / assigned_to
       │          │            │                  │
       └────* rooms *──────────┴───────* issues ② *───* issue_votes
                │                            │
                │                            └───* issue_events  (append-only)
                │
                ├──1:1── room_infrastructure
                ├──*──── room_features *──── features
                ├──*──── timetable_slots ──▶ courses / faculty
                ├──*──── schedule_exceptions   (room_id NULL = campus-wide)
                ├──*──── check_ins *──── check_in_votes
                └──*──── favorites

  CONTENT (Design Thinking showcase)
  dt_stages · dt_personas · dt_empathy_maps · dt_survey_metrics
  · dt_impact_metrics · dt_problem_statements
```

**① `auth.users`** is Supabase-managed. `profiles` mirrors it 1:1; the
`on_auth_user_created` trigger keeps them in sync. We never write to `auth.users`.

**② `issues.ref`** is a human ticket (`JS-1042`) generated from a sequence. Room
codes are `text`, not integers, because the real inventory is `'121 A'`, `'301B'`,
`'305A'` — the current codebase's `parseInt`-style assumptions break on those.

---

## 2. Tables

### Physical campus

| Table | Purpose | Key columns |
|---|---|---|
| `blocks` | Block A / Block B | `code`, `name` |
| `floors` | Floor per block | `block_id`, `level`, `label` — unique `(block_id, level)` |
| `rooms` | Inventory | `code` (unique), `slug`, `capacity`, `category`, `wing`, `map_x/y/w/h` |
| `room_infrastructure` | 1:1 with rooms | `sockets_total`, `sockets_working`, `has_ac`, `noise_vibe`, `comfort_score` |
| `features` | Amenity / best-for vocabulary | `slug`, `label`, `kind ∈ {amenity, best_for}` |
| `room_features` | M:N join | `(room_id, feature_id)` |

**Why `room_infrastructure` is separate.** Room *identity* (code, capacity, position)
never changes. Infrastructure changes weekly — a socket breaks, an AC is serviced —
and is maintained by facilities staff, not whoever curates the room list. Splitting
them means a socket repair touches one narrow row and cannot accidentally corrupt
the inventory.

**Why `features` is a table.** The current `amenities: string[]` and `bestFor: string[]`
are free-text arrays. You cannot index them, you cannot spell them consistently
(`'Smart Board'` vs `'smart board'`), and "find me a room with a smart board" becomes
a linear scan with a string comparison. Normalised, it is a join on an index.

**Map geometry is stored as percentages**, not pixels, so the same SVG floor plan
renders correctly on a phone and a projector.

### Timetable

| Table | Purpose | Key columns |
|---|---|---|
| `faculty` | Instructor records | `full_name`, `department` |
| `courses` | Course catalogue | `code`, `title`, `credits` |
| `timetable_slots` | **Recurring weekly** pattern | `day_of_week` (ISO 1–7), `start_time`, `end_time`, `kind`, `valid_from/to` |
| `schedule_exceptions` | **Dated one-offs** | `exception_date`, `kind`, times nullable for whole-day, `room_id NULL` = campus-wide |

Two constraints encode real-world rules that would otherwise be bugs:

```sql
-- Times must be both-present or both-absent (no half-specified windows).
constraint exception_time_pair check ((start_time is null) = (end_time is null))

-- Only a holiday may occupy a whole day. "Campus closed" is whole-day;
-- nothing else legitimately is.
constraint whole_day_only_holiday check (start_time is not null or kind = 'holiday')
```

### Identity

| Table | Purpose | Key columns |
|---|---|---|
| `profiles` | Mirrors `auth.users` | `usn`, `full_name`, `role`, `karma` |

`role ∈ {student, faculty, staff, admin}`, default `student`.

`day_of_week` uses **ISO numbering (1 = Monday)** via `extract(isodow …)`, not
`0 = Sunday`. The current app has `day_of_week`-shaped logic in three places that
disagree; picking one convention and enforcing it in the type system ends that.

### Live layer

| Table | Purpose | Integrity rules |
|---|---|---|
| `check_ins` | Crowd/AC/socket reports | `expires_at = created_at + 90min`; **unique `(room_id, user_id, rate_bucket)`** |
| `check_in_votes` | "Still accurate?" | PK `(check_in_id, user_id)`; self-vote blocked by trigger |
| `issues` | Maintenance tickets | `resolved_fields_consistent`: status `resolved` ⇔ `resolved_at` set |
| `issue_votes` | "Me too" | PK `(issue_id, user_id)` |
| `issue_events` | Append-only audit trail | Written by trigger only — no client grants |
| `favorites` | Private bookmarks | PK `(user_id, room_id)` |

**The rate limit is structural, not application logic:**

```sql
rate_bucket timestamp generated always as (
  date_trunc('hour', created_at at time zone 'UTC')
  + floor(extract(minute from created_at at time zone 'UTC') / 20) * interval '20 minutes'
) stored,
unique (room_id, user_id, rate_bucket)
```

One check-in per student, per room, per 20-minute window — enforced by an index, so
it holds even if someone calls the REST API directly with a valid token.

**`upvotes` + `upvotedByMe` are gone.** The old model stored a denormalised counter
*and* a per-user boolean in `localStorage`, so the count could drift and the boolean
reset on every reload. Two vote tables with composite primary keys make double-voting
impossible and make "have I voted?" a single indexed lookup.

**`issue_events`** is what turns a status dropdown into a facilities workflow: who
changed what, when, and why. Nothing else in the current app records history.

### Content (Design Thinking showcase)

`dt_stages` · `dt_personas` · `dt_empathy_maps` · `dt_survey_metrics` ·
`dt_impact_metrics` · `dt_problem_statements`

Ported verbatim from the existing `data/designThinking.ts` (1,013 lines) and
`DesignThinkingShowcase.tsx` (1,926 lines). Putting them in the database means a
statistic can be corrected the night before submission with an `UPDATE`, instead of
a code edit, a rebuild, and a redeploy — and the same `SurveyChart` component renders
every chart instead of ~20 bespoke JSX blocks.

---

## 3. Derived layer

Nothing here is stored. These are the app's actual intelligence.

### `fn_room_occupancy(p_date) → setof intervals`

The primitive. Returns every interval during which a room is unavailable:

1. Recurring `timetable_slots` for that weekday, within `valid_from`/`valid_to`,
   **unless** a campus-wide holiday applies or the room is specifically closed.
2. Room-specific dated exceptions (exam block, maintenance, event) — `kind <> 'holiday'`.
3. Campus-wide dated exceptions, expanded across every active room.

```sql
occupied(room, t) = (recurring slots for t.weekday) − (holidays) + (dated exceptions)
```

`security definer`, so it reads the timetable without re-entering RLS, and `stable`,
so Postgres can inline it into the calling query.

### `v_room_live_status` — one row per room

The workhorse. Backs the explorer, floor map, matcher, room detail, and dashboard.

| Output | Meaning |
|---|---|
| `status` | `'free'` · `'soon'` (< 20 min of freedom left) · `'busy'` |
| `is_free_now` | boolean, for indexing/filtering |
| `free_minutes` | uninterrupted minutes remaining; `NULL` = free till end of day; `0` = busy |
| `occupied_until` | when the current session ends |
| `next_occupancy_from` / `next_occupancy_title` | what's coming |
| `current_occupancy_title`, `current_course_code`, `current_faculty`, `current_batch` | what's happening now |
| `crowd_density`, `report_count`, `confidence` | from non-expired check-ins only |
| `open_issue_count` | unresolved tickets for this room |
| `computed_at`, `as_of_date`, `as_of_time` | so the UI can show staleness honestly |

`confidence` is `high` at ≥ 3 live reports, `medium` at 1–2, `low` at 0 — the current
app's `confidenceScore` is computed but never surfaced, so students cannot tell a
well-attested room from a guess.

**One source of truth.** Today, `DashboardHome`, `FloorMap`, `RoomCard`, and
`SmartMatcher` each derive status differently from different data, so the same room
can read "Free" on one screen and "In session" on another. They now all read this view.

### `fn_room_day(p_date, room_id?)` → the timeline

Nine 60-minute slots with `is_past` / `is_current` computed in campus time. Replaces
the hardcoded `createSlots()` generator that builds the same fake day for every room.

### `v_floor_summary`

Per-floor roll-up for the map header chips.

---

## 4. Access control

### Posture

Supabase grants `anon` and `authenticated` broad privileges on new `public` tables.
Both migrations therefore start with:

```sql
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
```

then grant back explicitly. **Default deny, permanent.**

### Permission matrix

| Object | `anon` | `authenticated` | staff/admin | service role |
|---|---|---|---|---|
| `rooms`, `blocks`, `floors`, `features`, `room_features` | read | read | read + write | full |
| `room_infrastructure` | read | read | read + write | full |
| `faculty`, `courses` | read | read | read | full |
| `timetable_slots`, `schedule_exceptions` | read | read | read + write | full |
| `v_room_live_status`, `v_floor_summary` | read | read | read | — |
| `fn_room_day` | execute | execute | execute | — |
| `profiles` | **no access** | read own + write 5 own columns | read all; admin writes | full |
| `v_public_profiles` | read | read | read | — |
| `check_ins` | **no access** | read all, insert own, delete own < 15 min | same | full |
| `v_checkin_feed` | read (names masked) | read | read | — |
| `check_in_votes` | no access | read all, insert/delete own | same | full |
| `issues` | read | read, insert own, withdraw own | triage all | full |
| `issue_votes` | read | read, insert/delete own | same | full |
| `issue_events` | read | read | read | write (trigger only) |
| `favorites` | no access | own only | own only | full |
| `award_karma` | **no execute** | **no execute** | no execute | yes |
| `fn_is_staff` / `fn_is_admin` | execute | execute | execute | — |

### Privilege escalation — blocked twice

The old app put the whole user object, `role` included, in `localStorage`. Changing
one key in devtools made you an admin. Two independent layers now prevent that:

1. **Column-level grant.** `grant update (full_name, avatar_url, department, semester, usn)`
   is the *only* update privilege `authenticated` holds on `profiles`. `role` and
   `karma` are not in that list, so Postgres rejects the statement before any
   application code runs.
2. **Row policy.** `profiles_update_self` pins `with check (id = auth.uid())`, so even
   after re-granting the column, the row check still fails for another user.

`fn_is_staff()` is `security definer` specifically so it can read `profiles` without
re-entering RLS — a self-referencing policy would otherwise recurse forever.

**Consequence to know about:** changing a user's `role` is a service-role/dashboard
operation, not something the admin console can do. That is deliberate — an admin who
can promote themselves is not a boundary. Promote via the Supabase table editor or a
service-role script.

### Other invariants enforced in the database

| Invariant | Mechanism |
|---|---|
| A student cannot confirm their own check-in | `trg_block_self_vote` raises |
| Clients cannot forge demo data | insert policy requires `is_simulated = false` |
| Clients cannot self-assign karma | `award_karma` revoked; triggers award 15/25/2/5 pts |
| An issue cannot be created pre-resolved | insert policy requires `status = 'open'`, `resolved_at is null` |
| `resolved` status and `resolved_at` cannot disagree | `resolved_fields_consistent` check |
| You cannot check in to a deactivated room | insert policy `exists (… and r.is_active)` |
| The audit trail cannot be edited | no insert/update/delete grants on `issue_events` |

---

## 5. Known limitations (state these in the report)

1. **Timetable data is invented.** We cannot reach Jain's ERP, so `timetable_slots`
   is modelled from the published slot structure. This is a *stated assumption* —
   in Design Thinking terms it is a documented constraint, not a hidden flaw.
2. **Campus-wide exceptions only support `holiday` as whole-day.** Other campus-wide
   kinds require times. Deliberate: it keeps the constraint
   `whole_day_only_holiday` meaningful.
3. **No waitlist or booking.** `rooms.is_bookable` exists as a hook, but there is no
   `bookings` table, because the university's actual policy on room booking is unknown
   and inventing one would be worse than omitting it.
4. **Presence is voluntary.** Availability is exact (timetable-derived); *crowd level*
   depends on students checking in, and is `NULL` when nobody has. We show "no data"
   rather than guessing — which the current app does not do.
5. **Free tier pauses after 7 days idle** (see PLAN §9 R1).
