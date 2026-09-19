# JainSpace — Design System

> Modern light SaaS. Off-white canvas, tight rhythm, one accent, soft shadows.
> Reference points: Linear, Notion, Vercel dashboard. **Not** a dark ops dashboard.

---

## 1. Principles

1. **The answer is above the fold.** A student opens this to find a seat. Free rooms and
   their status appear before any explanation of the system.
2. **Status is never colour alone.** Green/amber/red are always paired with a label and an
   icon, so the ~8% of male students with red-green colour blindness read it correctly.
3. **Calm by default.** Motion only where it communicates a change in state. No confetti.
4. **Density without clutter.** Tables and lists breathe; chrome (borders, shadows) stays quiet.
5. **Staleness is visible.** Any live number shows when it was last updated. A stale number
   with no timestamp is a lie.

---

## 2. Design tokens

### Colour — light (default)

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#FAFAF9` | Page background (warm off-white, not pure white) |
| `--surface` | `#FFFFFF` | Cards, panels, popovers |
| `--surface-sunken` | `#F4F4F2` | Table headers, inset areas |
| `--border` | `#E7E5E4` | Hairlines — 1px only, never 2px |
| `--border-strong` | `#D6D3D1` | Input borders, focus rings' base |
| `--text-primary` | `#1C1917` | Headings, body |
| `--text-secondary` | `#57534E` | Metadata, captions |
| `--text-tertiary` | `#A8A29E` | Placeholders, disabled |
| `--accent` | `#4338CA` | Primary actions, links, active nav (indigo — institutional without being a stock bootstrap blue) |
| `--accent-hover` | `#3730A3` | Hover state |
| `--accent-subtle` | `#EEF2FF` | Selected rows, active nav background |

### Colour — status semantics

| Token | Value | Label | Icon |
|---|---|---|---|
| `--status-free` | `#059669` | Free now | `CircleCheck` |
| `--status-free-bg` | `#ECFDF5` | | |
| `--status-soon` | `#D97706` | Free soon | `Clock` |
| `--status-soon-bg` | `#FFFBEB` | | |
| `--status-busy` | `#DC2626` | In session | `CircleSlash` |
| `--status-busy-bg` | `#FEF2F2` | | |
| `--status-unknown` | `#78716C` | No data | `CircleHelp` |
| `--status-unknown-bg` | `#F5F5F4` | | |

> Contrast check: every status colour is ≥ 4.5:1 on its own tinted background, and all four
> background tints are ≥ 4.5:1 against `--text-primary`. All four pairs are distinguishable
> under deuteranopia/protanopia simulation because green↔red also differ in lightness.

### Colour — dark

Inverted, not merely dimmed. Elevation goes *lighter* as you rise (Linear's model), because
on dark surfaces shadows are invisible.

| Token | Value |
|---|---|
| `--canvas` | `#0C0A09` |
| `--surface` | `#1C1917` (raised: `#292524`) |
| `--border` | `#292524` (strong: `#44403C`) |
| `--text-primary` | `#FAFAF9` |
| `--text-secondary` | `#A8A29E` |
| `--accent` | `#818CF8` (lightened for dark-surface contrast) |
| `--status-free` | `#34D399` |
| `--status-soon` | `#FBBF24` |
| `--status-busy` | `#F87171` |

### Type

- **Family:** Geist Sans (UI) + Geist Mono (room codes, ticket IDs, timestamps). Self-hosted
  via `next/font/local` — no external request, no layout shift, no Google Fonts dependency.
- **Fallback:** `system-ui, -apple-system, 'Segoe UI', sans-serif`.

| Role | Size / line-height | Weight | Tracking |
|---|---|---|---|
| Display | 40 / 44 | 600 | -0.02em |
| H1 | 30 / 36 | 600 | -0.02em |
| H2 | 22 / 28 | 600 | -0.01em |
| H3 | 17 / 24 | 600 | -0.01em |
| Body | 15 / 24 | 400 | 0 |
| Small | 13.5 / 20 | 400 | 0 |
| Micro | 12 / 16 | 500 | 0.01em |
| Mono | 13 / 20 | 450 | 0 |

Rule: type scale is **1.2–1.25**, and only four weights exist (400 / 450 / 500 / 600).
No 700 — bold-heavy UI reads as a template.

### Spacing, radius, elevation

- **Spacing:** 4px base. Allowed: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Nothing else.
- **Radius:** `sm` 6px (inputs, badges) · `md` 8px (buttons) · `lg` 12px (cards) ·
  `xl` 16px (modals, floor map).
- **Elevation:** three levels only, and borders do most of the work.
  - `e0` — flat + 1px `--border`
  - `e1` — `0 1px 2px rgb(0 0 0 / 0.04)` (cards)
  - `e2` — `0 4px 12px rgb(0 0 0 / 0.06)` (popovers, modals)
  Never stack shadows on nested surfaces.

### Motion

| Token | Duration | Easing | Applied to |
|---|---|---|---|
| `instant` | 100ms | `ease-out` | Hover, focus |
| `fast` | 150ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Toggles, pills |
| `base` | 220ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Modals, drawers, list reorder |
| `slow` | 400ms | `ease-in-out` | Stage transitions in case study |

Every duration collapses to `0ms` under `prefers-reduced-motion: reduce`. Non-negotiable.

---

## 3. Layout

### Shell

```
┌─────────────────────────────────────────────────────────────┐
│  ◧ JainSpace   [Learn ▾] ────────────────  ⌘K   ☾   Avatar  │  56px
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│  Spaces      │   ≤ 1200px content, 24px gutters             │
│  Floor Map   │   Optional right rail at ≥ 1280px:           │
│  Match       │     • Live activity feed                     │
│  Reports     │     • Your recent rooms                      │
│  ──────────  │                                              │
│  My Space    │                                              │
│  Case Study  │                                              │
│  Admin       │                                              │
│  240px       │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

- Sidebar 240px fixed at ≥ 1024px; collapses to icon rail 64px at 640–1024px; becomes a
  bottom sheet (not a hamburger drawer) below 640px — students hold phones one-handed.
- `⌘K` / `Ctrl+K` command palette: jump to any room by code, any page, any action.
  This is the feature that makes the app feel professional, and it loads from the room list
  already in memory — cheap to build, high impact.
- Filters live in the **URL**, not component state. `?floor=2&free=1&sockets=8&sort=walk`
  is shareable in a WhatsApp group, which is exactly how students would spread this.

### Responsive breakpoints

`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536

---

## 4. Component inventory

**`components/ui/`** (shadcn/ui, adapted to our tokens)
Button · Input · Select · Dialog · Sheet · Tabs · Badge · Card · Table · Tooltip · Toast ·
Popover · Command (palette) · Skeleton · Avatar · Progress · Toggle Group

**Domain components**

| Component | Notes |
|---|---|
| `StatusPill` | The single most-reused element. Status + label + icon + optional "free for 1h 45m". Never colour-only. |
| `RoomCard` | Code (mono), name, status pill, headroom (seats), sockets, AC, walking time. Whole card is a link; no nested interactive elements. |
| `RoomRow` | Dense table variant for `/spaces?view=table`. |
| `TodayTimeline` | Horizontal 9-slot band for `/spaces/[code]`. Occupied slots are `--surface-sunken`; the *current* slot has a 2px accent left edge, so "now" is findable at a glance. |
| `FloorPlan` | SVG from `map_x/y/w/h`. Rooms are `<a>` with `aria-label`; keyboard-navigable. Legend is always visible, never a tooltip-only affordance. |
| `MatchWizard` | 3 steps: who / how long / what matters. Results show a score *and the three reasons why* — an unexplanable score is worse than no score. |
| `CheckInForm` | 20-second target. Crowd, AC, sockets, purpose, optional note. |
| `IssueCard` | Category, room, urgency, status, upvote count, reporter. |
| `IssueTimeline` | Renders `issue_events` — this is what makes the admin side look real. |
| `LiveBadge` | "Live · updated 12s ago", degrades to "Live · reconnecting…" then "Last updated 4m ago" |
| `DemoDataBadge` | Renders whenever any visible row has `is_simulated = true` (see PLAN §7) |

**Case study components:** `StageRail` · `SurveyChart` · `PersonaCard` · `EmpathyQuadrant` ·
`FiveWhysTree` · `ImpactStat` · `PersonaTabs`

---

## 5. State design

Every data surface defines all five states. Most student projects ship only the first.

| State | Treatment |
|---|---|
| **Loading** | Skeletons matching final layout geometry — never a centred spinner |
| **Empty** | One sentence explaining *why* it's empty + one primary action. Never "No data." |
| **Error** | Plain language, a retry control, and the underlying code in a tooltip |
| **Partial** | Show what loaded, mark what didn't. Never blank the whole page |
| **Offline** | Banner + cached last-known availability, with the timestamp visible |

---

## 6. Accessibility targets (WCAG 2.2 AA)

- Focus ring: 2px `--accent` at 2px offset on **every** interactive element. Never
  `outline: none`. Radix `Dialog`/`Popover` give focus trapping and restore for free —
  the current hand-rolled modals have neither.
- All icons paired with text or `aria-label`. Decorative icons `aria-hidden`.
- Semantic landmarks: `header` / `nav` / `main` / `aside`, one `h1` per page.
- Live-updating counts in an `aria-live="polite"` region so screen readers announce them.
- Target size ≥ 24×24 CSS px (2.2 AA), aiming for 44×44 on touch.
- Verified with `axe-core` in the Playwright suite — a test failure, not a manual check.
