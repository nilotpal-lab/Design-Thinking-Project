# JainSpace — Rebuild Plan

> JAIN (Deemed-to-be University) · 3rd Semester Design Thinking & Innovation
> A production-grade campus space-finding platform. **100% free tier, no paid services anywhere.**

---

## 1. What we're building

Today JainSpace is a beautiful but hollow shell: 14,350 lines of client-side React where
auth is a hardcoded object, the "live" activity is `Math.random()` on a timer, and the room
inventory is duplicated across three files with three incompatible shapes.

The rebuild keeps everything that made the current app presentable — the 52-room inventory,
the floor map, the matcher, the five-stage Design Thinking case study — and puts a real
system underneath it: a normalised Postgres schema, real authentication, real-time data,
enforced access control, and a UI that looks like software a university would actually run.

**The one-sentence pitch:** an availability engine driven by the real timetable, augmented by
crowdsourced student reports, wrapped in an interface students actually open.

---

## 2. Decisions locked

| Decision | Choice | Consequence |
|---|---|---|
| Scope | Full rebuild, port content | New `src/` tree; DT content becomes data, not JSX |
| Look & feel | Modern light SaaS + dark mode | Off-white canvas, tight spacing, one accent, soft shadows |
| Auth | Anonymous-first | Browse with zero friction; login only to contribute |
| Database | Supabase Postgres | Free tier, RLS enforced in the database, not the app |
| Hosting | Vercel Hobby | Free, Git-driven, first-class Next.js |

---

## 3. Stack & free-tier budget

Every service below is free forever with **no credit card required**. Limits are real and
listed so nothing surprises you during the demo.

| Service | Role | Free limits | Risk |
|---|---|---|---|
| **Supabase** | Postgres, Auth, Realtime, Storage | 500 MB DB · 1 GB storage · 2 GB egress/mo · 50k MAU · 200 concurrent realtime · 7-day log retention | ⚠️ **Projects pause after 7 days of inactivity.** See §10 R1. |
| **Vercel Hobby** | Hosting, CI/CD, edge CDN | 100 GB bandwidth/mo · 100 builds/day · serverless + edge functions | Hobby is **non-commercial only** — fine for coursework, must be disclosed on the DT poster |
| **GitHub** | Source, Actions | Unlimited public repos · 2,000 CI min/mo | None |
| **Supabase CLI** | Local dev, migrations | Free, open source, runs on Docker | Needs Docker Desktop locally |

> **Framework version — revised mid-build.** The plan originally targeted Next.js 14.
> `next@14.2.5` carries **CVE-2026-75604**, a critical unauthenticated path-traversal RCE
> (CVSS 3.1 `AV:N/AC:H/PR:N/UI:N/S:C/C:H/I:H/A:H`, EPSS 84th percentile). It is affected
> across `>= 13.4.0, < 15.5.24` and patched only in **15.5.24 / 16.3.3+**, so Next 14 and 15
> cannot be made safe. Because the rebuild writes `src/` from scratch anyway, the migration
> cost was effectively zero. We now run **Next 16.3.5 + React 19.3**, which clears `npm
> audit` completely (0 vulnerabilities, down from 1 critical + 1 high).
> The advisory specifically targets **Windows-hosted servers** with no known workaround, so
> this mattered directly: the dev machine here is Windows. Vercel's Linux runtime was never
> in scope for that particular CVE, but several of the other ~35 advisories were.
| **Google Fonts** | Typography | Free, self-hosted via `next/font` | None |

**Our realistic footprint:** 52 rooms × ~9 timetable slots ≈ 500 rows of seed data. The whole
database will be **under 5 MB** — about 1% of the free tier. We are nowhere near any limit.

**Costs: ₹0.** There is no paid tier anywhere in this architecture and no service that
requires a card to start.

### Third-party libraries (all MIT / Apache-2.0)

| Package | Why | Replaces |
|---|---|---|
| `@supabase/supabase-js` + `@supabase/ssr` | DB, auth, realtime, cookie-aware SSR client | hand-rolled `AuthContext` |
| `shadcn/ui` (Radix primitives) | Accessible dialog, select, tabs, toast — copied into the repo, not a dependency you can't edit | 6 hand-rolled modals with no focus trapping |
| `zod` | Validate every Server Action input at the trust boundary | nothing — currently zero validation |
| `date-fns` + `date-fns-tz` | Campus-timezone availability maths | `parseTimeToMinutes` string hacking |
| `recharts` | Survey visualisations in the DT showcase | ad-hoc CSS bars |
| `lucide-react` | Already in use — keep | — |
| `framer-motion` | Already in use — keep, but restrict to meaningful motion | — |

**Dropped:** `canvas-confetti` (gimmick; it fires on check-in today and undercuts the
"serious institutional tool" goal).

---

## 4. Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  NEXT.JS 16 APP ROUTER + REACT 19 (Vercel Hobby)                 │
│                                                                  │
│  Server Components          Client Components                    │
│  ─────────────────          ─────────────────                    │
│  • fetch room lists         • live status pills (Realtime)       │
│  • availability engine      • check-in / issue forms             │
│  • DT showcase content      • floor map interaction              │
│  • no client JS for        • matcher wizard                      │
│    static pages                                                  │
│         │                            │                           │
│         └──────────┬─────────────────┘                           │
│                    ▼                                             │
│        Server Actions  ← zod-validated mutation boundary         │
│                    │                                             │
│         ┌──────────┴──────────┐                                  │
│         ▼                     ▼                                  │
│   supabase (SSR)        supabase (browser)                       │
│   anon key + cookies    anon key, RLS-scoped                     │
└─────────┬───────────────────────┬────────────────────────────────┘
          ▼                       ▼
┌─────────────────────────────────┴────────────────────────────────┐
│  SUPABASE                                                        │
│                                                                  │
│  Postgres                Auth            Realtime      Storage   │
│  ─────────               ────            ────────      ───────   │
│  17 tables               email/pw        check_ins     issue     │
│  12 enum types           sessions        issues        photos    │
│  RLS on every table      profiles         room_status            │
│  column-level grants     (role)                                  │
│                                                                  │
│  DERIVED LAYER (the heart of the app)                            │
│  fn_room_occupancy(date)  → timetable + exceptions               │
│  v_room_live_status       → is_free_now, free_until, crowd       │
│  v_room_daily_schedule    → the "today" timeline per room        │
└──────────────────────────────────────────────────────────────────┘
```

### Why "derived" is the whole point

The current app stores `currentOccupancy: 25` and `crowdLevel: 'Light (15-35%)'` as literal
numbers in a source file, plus a `currentTime` state hardcoded to `'10:45'`, plus a
`FLOORS_DATA` array claiming 13 rooms free with no relation to reality. None of it can ever
be correct, because **availability is not a property of a room — it's a function of time,
the timetable, and today's exceptions.**

The rebuild encodes that properly:

```
is_free_now(room, t) = ¬∃ occupied interval covering t
occupied intervals   = recurring timetable slots for t.weekday
                       − campus-wide holidays
                       + dated exceptions (maintenance, exams, events)
```

Stored data is only *facts*: what rooms exist, what runs in them weekly, what's broken today.
Everything a student sees is computed. This is what makes the app defensible in a viva —
you can change one timetable row and every screen updates correctly.

---

## 5. Target file tree

```
jainspace/
├─ .env.example                    ← committed (placeholders only)
├─ .env.local                      ← gitignored (real keys)
├─ docs/
│  ├─ PLAN.md                      ← this file
│  ├─ DESIGN.md                    ← design system spec
│  └─ SCHEMA.md                    ← data model + RLS matrix
├─ supabase/
│  ├─ config.toml
│  ├─ migrations/
│  │  ├─ 0001_init.sql             ← enums, tables, indexes, triggers
│  │  ├─ 0002_rls.sql              ← policies + column grants
│  │  └─ 0003_views.sql            ← availability engine
│  └─ seed.sql                     ← generated, 52 rooms + timetable
├─ scripts/
│  ├─ extract-rooms.ts             ← rooms.ts → normalised JSON (run once)
│  ├─ gen-seed.ts                  ← normalised JSON → seed.sql
│  └─ simulate-activity.ts         ← DEV ONLY: writes is_simulated=true rows
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                ← fonts, theme provider, toaster
│  │  ├─ page.tsx                  ← landing (public, static)
│  │  ├─ (app)/
│  │  │  ├─ layout.tsx             ← authed-or-anon shell + sidebar
│  │  │  ├─ spaces/page.tsx        ← explorer + filters (URL state)
│  │  │  ├─ spaces/[code]/page.tsx ← room detail + today timeline
│  │  │  ├─ map/page.tsx           ← floor map
│  │  │  ├─ match/page.tsx         ← smart matcher
│  │  │  ├─ report/page.tsx        ← issue reporting + board
│  │  │  ├─ my/page.tsx            ← favourites, my reports, karma
│  │  │  └─ admin/page.tsx         ← admin console (role-gated)
│  │  ├─ case-study/page.tsx       ← Design Thinking showcase (public)
│  │  └─ auth/                     ← login, signup, callback, signout
│  ├─ components/
│  │  ├─ ui/                       ← shadcn primitives
│  │  ├─ spaces/                   ← RoomCard, StatusPill, FilterBar…
│  │  ├─ map/                      ← FloorPlan, RoomShape, Legend
│  │  ├─ reports/                  ← IssueCard, IssueTimeline, NewIssueForm
│  │  └─ case-study/               ← StageRail, SurveyChart, PersonaCard…
│  ├─ lib/
│  │  ├─ supabase/{client,server,admin}.ts
│  │  ├─ availability.ts           ← shared TS mirror of the SQL logic
│  │  ├─ validations.ts            ← zod schemas
│  │  └─ utils.ts
│  ├─ server/
│  │  ├─ actions/{checkins,issues,favorites,profile,rooms}.ts
│  │  └─ queries/{rooms,dt}.ts
│  ├─ types/database.ts            ← generated: supabase gen types
│  └─ styles/globals.css
```

**Deleted:** `data/rooms.ts`, `data/mockRooms.ts`, `data/mockCampusData.ts`,
`context/AuthContext.tsx`, `hooks/useCampusState.ts`, `utils/matcherAlgorithm.ts`,
`types/campus.ts`, `types/designThinking.ts`, all 20 existing components.
Content is ported; structure is not.

---

## 6. Phases

`[CORE]` = required for a complete, presentable project. `[STRETCH]` = only if time allows.

### Phase 0 — Supabase project `[CORE]`
1. You create a free project at supabase.com (no card).
2. You paste 3 values into `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
3. I verify the connection with a smoke-test query before writing any features.
**Done when:** `select count(*) from rooms` returns 0 without error.

### Phase 1 — Data extraction `[CORE]`
Write `scripts/extract-rooms.ts`, run it once against the existing `rooms.ts`, emit
`supabase/seed.rooms.json`. It must:
- Assign stable UUIDs from the room code (deterministic, so re-running is idempotent).
- Split the flat `Room` record into `rooms` + `room_infrastructure` + `features`.
- Convert `amenities: string[]` / `bestFor: string[]` into a **controlled** `features`
  vocabulary. Do **not** emit one row per string: the source holds 302 distinct one-off
  phrases, which would leave `features` useless for the filtering it exists for.
  Canonicalise by keyword onto ~49 tags, and keep the verbatim copy on the room in
  `catalog_amenities` / `catalog_best_for` so the detail page still reads faithfully.
- Convert `todaySchedule` recurring slots into `day_of_week` 1–5 rows (Mon–Fri).
- Validate the output with zod and fail loudly on any room missing a code, floor, or capacity.
**Done when:** JSON contains exactly 52 rooms, 52 infrastructure rows, and every room's
slots parse to `HH:MM:SS` times.

> ✅ **Phase 1 complete.** Actual output: 52 rooms, 52 infrastructure rows, **2 blocks /
> 7 floors** (not 4), 49 canonical features, 393 `room_features`, 76 courses, 52 faculty,
> 515 timetable slots, 0 warnings, 0 unmapped strings. Floors are still 13 rooms each:
> A-L1 13, A-L2 1 + B-L2 12, A-L3 6 + B-L3 7, A-L4 6 + B-L4 7. Block B has no ground
> floor, which is why 2 blocks cannot give 8 floors.

> ✅ Data integrity verified (corrected from an earlier note in this plan): `rooms.ts` is
> clean. Raw `block` counts read 27 A / 26 B = 53 for 52 rooms, but that extra match is the
> **interface declaration line itself** (`block: 'Block A' | 'Block B';`), not a room. Same
> artifact inflated `wing` (53→52) and `noiseVibe` (53→52). True distribution is
> **26 Block A + 26 Block B, exactly 13 rooms per floor across 4 floors.**
>
> ⚠️ The one real mapping problem: `wifiStrength` is qualitative
> (`'Ultra-fast (6GHz)' | 'Excellent' | 'Good' | 'Fair'`) while the schema's `wifi_band`
> enum needs a band (`wifi_6e`/`wifi_5`/`wifi_4`). Only `'Ultra-fast (6GHz)'` names a band;
> the other three say nothing about frequency. Phase 1 must **not** invent a mapping —
> 'Excellent'/'Good'/'Fair' are recorded as unknown band with the qualitative label kept in
> `room_infrastructure`, and the limitation is stated in the DT report.

### Phase 2 — Schema, RLS, availability engine `[CORE]`
Apply `0001_init.sql`, `0002_rls.sql`, `0003_views.sql`. Generate `types/database.ts`.
Write SQL-level tests (pgTAP or plain assertions in a scratch script) proving:
- A room with a free slot reads `is_free_now = true`.
- A room mid-lecture reads `false` with the correct `free_until`.
- A campus holiday flips every room to free.
- A dated maintenance exception makes a free room read occupied.
**Done when:** all four assertions pass.

### Phase 3 — App shell & design system `[CORE]`
Theme tokens, fonts, `(app)` layout, sidebar, dark-mode toggle, toaster, empty/error states.
Wire the Supabase SSR client with correct cookie handling.
**Done when:** a page renders room count from the database, in both themes, with no
hydration mismatch warnings.

### Phase 4 — Browse, detail, map, matcher `[CORE]`
- `/spaces`: filter bar backed by **URL search params** (shareable, back-button correct),
  server-rendered list, status pill per room.
- `/spaces/[code]`: today's timeline, infrastructure checklist, best-for tags, directions.
- `/map`: floor plan driven by stored `map_x/y/w/h`, statuses from the view.
- `/match`: the wizard, but scoring runs in TS off a single typed `Room` — no more
  `getRoomAmenityInfo` guessing fields that may or may not exist.
**Done when:** changing a timetable row in the DB changes the UI without a code change.

### Phase 5 — Anonymous-first live layer `[CORE]`
- Sign up / login (email + password), profile creation trigger.
- Check-in modal (crowd, AC, sockets, purpose, note) → Server Action → Realtime broadcast.
- "Confirm this is still accurate" → `check_in_votes`, unique per user.
- Issue reporting with urgency, photo upload to Storage, and a public board.
**Done when:** two browsers side by side see a check-in appear without a refresh, and a
logged-out visitor can browse everything but is prompted to log in to contribute.

### Phase 5b — Faculty tracker + campus events `[CORE — added per user request]`
Decision log: check-in "still accurate" voting UI also dropped by user — low
engagement expected, karma trigger stays in DB but no UI.

- `/faculty`: where every teacher is *right now* (derived from the timetable, same
  source of truth as the availability engine) + their cabin, maintained by the
  head admin via inline editor or CSV import (`name,cabin,note`).
- `/events`: campus event tracker — today / upcoming / any-date views, category
  badges, venue links into room pages. Admin writes via `/admin`, everyone reads.
- `/admin`: cabin editor + CSV import + event manager. Role-gated server-side
  (non-admins never receive admin data); RLS `events_admin_write` is the DB gate.
**Done when:** cabin assignment renders on `/faculty` without a code change and
anon inserts into `events` are rejected. ✅ verified live.

### Phase 6 — Admin console `[STRETCH]`
Role-gated `/admin`: triage issues, change status (audit-logged to `issue_events`), edit
room infrastructure, add dated exceptions ("this lab is booked for exams all week").
**Done when:** a `student` account receives an auth error, not a hidden button.

### Phase 7 — Design Thinking showcase `[DROPPED — user decision]`
The case study is submitted separately to the professor; the website is the
outcome of the DT process, not its documentation. Content stays in
`src-legacy/data/designThinking.ts` for the report.

### Phase 7 (original) — Design Thinking showcase `[SUPERSEDED]`
Port all of it as **database rows**, rendered by generic components:
`SURVEY_METRICS`, `DEMOGRAPHIC_BREAKDOWN`, `USER_PERSONAS`, `EMPATHY_MAPS`,
`PROBLEM_STATEMENTS`, `ROOT_CAUSE_FIVE_WHYS`, `DESIGN_THINKING_STAGES`, `IMPACT_METRICS`.
Charts move to `recharts`. Content is editable via SQL, so you can correct a statistic the
night before submission without a redeploy.
**Done when:** `/case-study` shows all 5 stages with real charts and no hardcoded JSX blocks.

### Phase 8 — Quality `[CORE]`
- Vitest unit tests for the matcher and availability mirror.
- Playwright happy paths: browse → check in → report issue → admin resolves.
- Lighthouse ≥ 90 on Performance, Accessibility, Best Practices, SEO.
- Keyboard-only pass; axe scan clean; AA contrast verified.
**Done when:** the test suite runs green from a clean clone.

> ✅ **Phase 8 complete.** 40 Vitest unit tests (matcher contract, utils,
> validation boundary, username auth) — and they **caught a real matcher bug**:
> the "too small" (−15) and "missing requirement" (−8) reasons were displayed
> but never subtracted from the score, so bad rooms scored too high. Fixed.
> 19 Playwright E2E tests over the production build with axe scans on all 9
> pages (0 critical violations). Lighthouse on /spaces: Performance 92,
> Accessibility 100, Best-Practices 96, SEO 100. A11y fixes shipped along the
> way: faculty filter controls labeled, compact nav icons given accessible
> names, room-card `h3` demoted to `p` (heading order), dark-mode
> `--accent-subtle` contrast 3.8:1 → 5.3:1.

### Phase 9 — Ship `[STRETCH]`
Vercel deploy, GitHub Actions running typecheck + tests on push, seed SQL checked in so the
project can be rebuilt from scratch in one command.

---

## 7. Honesty in the demo

The current app fakes live activity: `useCampusState` runs a `setInterval` that invents a
student check-in every 45 seconds with `Math.random()`, and `SimulatedStudentNames` invents
people. During a viva, a panel member who reads the code will find this, and it undermines
every number on the slide.

**Replacement:** `scripts/simulate-activity.ts` is a **dev-only script you run deliberately**.
It writes to the same tables with `is_simulated = true`. The UI renders a small "demo data"
badge whenever any visible row carries that flag. So:

- Live activity is genuinely live — it arrives over Supabase Realtime from a real insert.
- Fabricated data is always labelled as fabricated, on screen, at the point of display.
- `is_simulated` stays out of production paths entirely.

That's a much stronger answer to "is this real?" than a hidden timer.

---

## 8. What I need from you

| # | Item | When |
|---|---|---|
| 1 | Create free Supabase project, paste the 3 keys | Phase 0 (I'll ask) |
| 2 | Confirm `shadcn/ui` as the component base (§3) | Before Phase 3 |
| 3 | Campus timezone confirm — assuming **Asia/Kolkata** | Before Phase 2 |
| 4 | Semester end date / real timetable, if you have it | Optional, improves Phase 1 realism |
| 5 | Your USN + correct name for the seeded admin account | Phase 5 |

---

## 9. Risks & mitigations

| # | Risk | Mitigation |
|---|---|---|
| R1 | **Supabase pauses free projects after 7 days idle**, and restore is a manual dashboard click — could bite you the morning of a presentation | Restore 48h before any demo; optionally a scheduled GitHub Action pinging the DB twice weekly (free) |
| R2 | "Real" timetable data is invented, because we can't access Jain's ERP | Say so explicitly in the DT report as a stated assumption/limitation — that's a *strength* in Design Thinking, not a weakness |
| R3 | Anonymous-first + no email verification = spam risk | Enable Supabase's built-in email confirmations; rate-limit check-ins to 1 per room per user per 20 min via a unique index |
| R4 | Scope is genuinely large for one semester | `[CORE]` phases 0–5 + 7 give a complete, coherent, defensible product. 6, 8, 9 are additive |
| R5 | Vercel Hobby forbids commercial use | Fine for coursework; declare it on the poster |
| R6 | Realtime needs a persistent connection that flaky campus Wi-Fi will drop | Client falls back to polling every 30s on disconnect; status pill shows "last updated" so staleness is never silent |

---

## 10. Definition of done

- [ ] A logged-out visitor sees real, correct availability with no account.
- [ ] A logged-in student can check in and report an issue in under 30 seconds.
- [ ] Two browsers show the same live state without a refresh.
- [ ] Availability is computed from the timetable — change the DB, the UI follows.
- [ ] Every table has RLS; a student cannot escalate their own role.
- [ ] `/case-study` presents all 5 stages with real charts.
- [ ] Dark mode, keyboard navigation, and AA contrast across the app.
- [ ] Typecheck, tests, and Lighthouse all pass from a clean clone.
- [ ] Nothing in the build calls a paid service — verified against §3.
