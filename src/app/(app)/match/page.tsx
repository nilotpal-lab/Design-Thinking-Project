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
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Editorial Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Space Recommendation Engine
          </h1>
          <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
            Matcher
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          Rank campus study spaces matching your group size, duration, and amenity requirements.
        </p>
      </div>

      {/* Matcher Form Card */}
      <div className="rounded-xl border border-line bg-surface p-5 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]">
        <form method="get" action="/match" className="space-y-5">
          {/* Question 1: Group Size */}
          <fieldset>
            <legend className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              1. Group Size
            </legend>
            <div className="mt-2.5 flex flex-wrap gap-1.5 rounded-lg border border-line bg-surface-sunken p-1 dark:border-white/[0.08] dark:bg-[#141416]">
              {SIZES.map((s) => (
                <label key={s} className="flex-1 cursor-pointer min-w-10">
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    defaultChecked={(params.size ?? '1') === s}
                    className="peer sr-only"
                  />
                  <span className="flex h-8 items-center justify-center rounded-md font-mono text-xs font-medium text-zinc-500 transition-all peer-checked:bg-white peer-checked:text-zinc-900 peer-checked:shadow-sm dark:text-zinc-400 dark:peer-checked:bg-white dark:peer-checked:text-zinc-900 dark:peer-checked:font-semibold">
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Question 2: Duration */}
          <fieldset className="border-t border-line/60 pt-4 dark:border-white/[0.06]">
            <legend className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              2. Target Duration
            </legend>
            <div className="mt-2.5 flex flex-wrap gap-1.5 rounded-lg border border-line bg-surface-sunken p-1 dark:border-white/[0.08] dark:bg-[#141416]">
              {DURATIONS.map((d) => (
                <label key={d.value} className="flex-1 cursor-pointer min-w-16">
                  <input
                    type="radio"
                    name="duration"
                    value={d.value}
                    defaultChecked={(params.duration ?? '60') === d.value}
                    className="peer sr-only"
                  />
                  <span className="flex h-8 items-center justify-center rounded-md text-xs font-medium text-zinc-500 transition-all peer-checked:bg-white peer-checked:text-zinc-900 peer-checked:shadow-sm dark:text-zinc-400 dark:peer-checked:bg-white dark:peer-checked:text-zinc-900 dark:peer-checked:font-semibold">
                    {d.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Question 3: Amenities */}
          <fieldset className="border-t border-line/60 pt-4 dark:border-white/[0.06]">
            <legend className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              3. Required Amenities (Optional)
            </legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {WANT_OPTIONS.map((w) => (
                <label key={w.key} className="cursor-pointer" title={w.hint}>
                  <input
                    type="checkbox"
                    name="wants"
                    value={w.key}
                    defaultChecked={wants.includes(w.key)}
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-8 items-center justify-center rounded-lg border border-line bg-surface px-3 text-xs font-medium text-zinc-600 transition-all peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-checked:text-white dark:border-white/[0.08] dark:bg-[#141416] dark:text-zinc-400 dark:peer-checked:border-white dark:peer-checked:bg-white dark:peer-checked:text-zinc-900 dark:peer-checked:font-semibold">
                    {w.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Submit Button */}
          <div className="border-t border-line/60 pt-4 dark:border-white/[0.06]">
            <button
              type="submit"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <span>Calculate Matches</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {submitted && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">
              Top Matches ({results.length})
            </h2>
            <span className="font-mono text-[11px] text-zinc-400">
              {size} {size === 1 ? 'person' : 'people'} · {duration} min
            </span>
          </div>

          <ol className="space-y-2.5">
            {results.map((r, i) => (
              <li key={r.room.room_id}>
                <div className="rounded-xl border border-line bg-surface p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#111113]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-400">
                          #{i + 1}
                        </span>
                        <span className="font-mono text-xs font-bold text-ink">
                          {r.room.code}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-400">
                          · Floor {r.room.floor_level}
                        </span>
                      </div>
                      <Link
                        href={`/spaces/${r.room.slug}`}
                        className="mt-1 block text-sm font-bold text-ink hover:underline"
                      >
                        {r.room.name}
                      </Link>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusPill
                        status={r.room.status}
                        freeMinutes={r.room.free_minutes}
                        occupiedUntil={r.room.occupied_until}
                      />
                      <span className="rounded bg-surface-sunken px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-700 dark:bg-white/[0.06] dark:text-zinc-200">
                        {r.score}% Match
                      </span>
                    </div>
                  </div>

                  {/* Reasons checklist */}
                  <div className="mt-3 border-t border-line/60 pt-2.5 dark:border-white/[0.06]">
                    <ul className="space-y-1">
                      {r.reasons.map((reason) => (
                        <li key={reason} className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {results.length === 0 && (
            <div className="rounded-xl border border-dashed border-line p-8 text-center dark:border-white/[0.08]">
              <p className="text-sm font-semibold text-ink">No spaces matched all requested criteria</p>
              <p className="mt-1 text-xs text-zinc-400">
                Try deselecting some amenity filters or reducing your requested duration.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
