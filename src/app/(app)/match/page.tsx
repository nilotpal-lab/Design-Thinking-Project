import { ArrowRight, CheckCircle2, Flame, Sparkles, Users, Zap } from 'lucide-react';
import Link from 'next/link';

import { StatusPill } from '@/components/spaces/status-pill';
import { Card } from '@/components/ui/card';
import { matchRooms, type MatcherWants } from '@/lib/matcher';
import { getLiveRooms } from '@/server/queries/rooms';
import { cn, ROOM_CATEGORY_LABEL } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'AI Space Matcher' };

type Search = { size?: string; duration?: string; wants?: string | string[] };

const WANT_OPTIONS: { key: MatcherWants; label: string; hint: string }[] = [
  { key: 'sockets', label: 'Power Sockets', hint: 'Charging laptops & devices' },
  { key: 'ac', label: 'Air Conditioning', hint: 'Cool, temperature-controlled' },
  { key: 'silent', label: 'Silent Zone', hint: 'Deep pin-drop concentration' },
  { key: 'group', label: 'Group Discussion', hint: 'Collaboration & talking allowed' },
  { key: 'presentation', label: 'Display Screen', hint: 'Projector / Smart Board' },
];

const DURATIONS = [
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3+ hours' },
];

const SIZES = ['1', '2', '4', '6', '8', '12+'];

export default async function MatchPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const submitted = params.size !== undefined || params.duration !== undefined || params.wants !== undefined;

  const size = Math.max(1, Math.min(60, Number(params.size?.replace('+', '') ?? 1) || 1));
  const duration = Math.max(15, Math.min(480, Number(params.duration ?? 60) || 60));
  const wantsRaw = params.wants === undefined ? [] : Array.isArray(params.wants) ? params.wants : [params.wants];
  const wants = wantsRaw.filter((w): w is MatcherWants =>
    (['sockets', 'ac', 'silent', 'group', 'presentation'] as const).includes(w as MatcherWants),
  );

  const rooms = await getLiveRooms();
  const results = submitted ? matchRooms(rooms, { size, duration, wants }).slice(0, 6) : [];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-subtle px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent dark:text-accent-hover">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Smart Recommendation Engine</span>
        </div>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink md:text-3xl">
          Match Me a Space
        </h1>
        <p className="mt-1 text-[13px] text-ink-secondary">
          Tell us what you need in 3 quick taps. Transparent matching calibrated against timetable
          schedules and amenity capacity.
        </p>
      </div>

      {/* Matcher Form Card */}
      <Card className="rounded-3xl p-6 shadow-e2 dark:border-white/10 dark:bg-[#121215]">
        <form method="get" action="/match" className="space-y-6">
          {/* Question 1: Group Size */}
          <fieldset>
            <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              <Users className="h-4 w-4 text-accent" />
              <span>1. How many people in your group?</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <label key={s} className="cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    defaultChecked={(params.size ?? '1') === s}
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-9 min-w-12 items-center justify-center rounded-xl border border-line/80 bg-surface/80 px-3.5 font-mono text-[13px] font-semibold text-ink-secondary transition-all duration-instant ease-spring peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-checked:shadow-sm dark:border-white/10 dark:bg-surface/60">
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Question 2: Duration */}
          <fieldset className="border-t border-line/60 pt-5 dark:border-white/[0.06]">
            <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>2. How long do you plan to study?</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <label key={d.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="duration"
                    value={d.value}
                    defaultChecked={(params.duration ?? '60') === d.value}
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-9 items-center justify-center rounded-xl border border-line/80 bg-surface/80 px-4 text-[13px] font-semibold text-ink-secondary transition-all duration-instant ease-spring peer-checked:border-accent peer-checked:bg-accent peer-checked:text-white peer-checked:shadow-sm dark:border-white/10 dark:bg-surface/60">
                    {d.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Question 3: Amenities */}
          <fieldset className="border-t border-line/60 pt-5 dark:border-white/[0.06]">
            <legend className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-tertiary">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span>3. What matters most? (Select all that apply)</span>
            </legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {WANT_OPTIONS.map((w) => (
                <label key={w.key} className="cursor-pointer" title={w.hint}>
                  <input
                    type="checkbox"
                    name="wants"
                    value={w.key}
                    defaultChecked={wants.includes(w.key)}
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-9 items-center justify-center rounded-xl border border-line/80 bg-surface/80 px-4 text-[13px] font-medium text-ink-secondary transition-all duration-instant ease-spring peer-checked:border-accent peer-checked:bg-accent-subtle peer-checked:font-semibold peer-checked:text-accent dark:border-white/10 dark:bg-surface/60 dark:peer-checked:bg-accent/15 dark:peer-checked:text-accent-hover">
                    {w.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Submit Button */}
          <div className="border-t border-line/60 pt-5 dark:border-white/[0.06]">
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2.5 rounded-xl bg-accent px-6 text-sm font-bold text-white shadow-glow-accent transition-all duration-fast hover:bg-accent-hover active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              <span>Find Best Matched Spaces</span>
            </button>
          </div>
        </form>
      </Card>

      {/* Results Section */}
      {submitted && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">
              Top Matches for {size} {size === 1 ? 'person' : 'people'} ({duration} min)
            </h2>
            <span className="font-mono text-xs font-semibold text-ink-tertiary">
              {results.length} results
            </span>
          </div>

          <ol className="space-y-4">
            {results.map((r, i) => (
              <li key={r.room.room_id}>
                <Card className="rounded-2xl p-5 shadow-e1 transition-all duration-base hover:border-accent/40 hover:shadow-e2 dark:border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-accent-subtle font-mono text-xs font-extrabold text-accent dark:bg-accent/20">
                          #{i + 1}
                        </span>
                        <span className="font-mono text-[13px] font-bold text-ink-secondary">
                          {r.room.code}
                        </span>
                      </div>
                      <Link
                        href={`/spaces/${r.room.slug}`}
                        className="mt-1 block text-lg font-bold text-ink transition-colors hover:text-accent"
                      >
                        {r.room.name}
                      </Link>
                      <p className="text-[12px] font-medium text-ink-secondary">
                        {ROOM_CATEGORY_LABEL[r.room.category] ?? r.room.category} · Floor {r.room.floor_level}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <StatusPill
                        status={r.room.status}
                        freeMinutes={r.room.free_minutes}
                        occupiedUntil={r.room.occupied_until}
                      />
                      <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <Flame className="h-3.5 w-3.5" />
                        <span>{r.score}% Match</span>
                      </div>
                    </div>
                  </div>

                  {/* Explainability reasons */}
                  <div className="mt-4 border-t border-line/60 pt-3.5 dark:border-white/[0.06]">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-ink-tertiary">
                      Why this space matches:
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {r.reasons.map((reason) => (
                        <li key={reason} className="flex items-center gap-2 text-[13px] font-medium text-ink-secondary">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </li>
            ))}
          </ol>

          {results.length === 0 && (
            <Card className="rounded-3xl border-dashed p-10 text-center">
              <p className="text-[15px] font-semibold text-ink">No spaces matched all criteria</p>
              <p className="mt-1 text-[13px] text-ink-secondary">
                Try relaxing one of your preference filters or reducing the requested duration.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
