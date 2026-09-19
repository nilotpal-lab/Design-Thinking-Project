import { Sparkles } from 'lucide-react';

import { StatusPill } from '@/components/spaces/status-pill';
import { Card } from '@/components/ui/card';
import { matchRooms, type MatcherWants } from '@/lib/matcher';
import { getLiveRooms } from '@/server/queries/rooms';
import { cn, ROOM_CATEGORY_LABEL } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * The wizard without a wizard: a plain GET form (works without JS, shareable
 * URLs like /spaces) whose params drive the scoring on the server. Three
 * questions — who / how long / what matters — per the plan.
 */
type Search = { size?: string; duration?: string; wants?: string | string[] };

const WANT_OPTIONS: { key: MatcherWants; label: string; hint: string }[] = [
  { key: 'sockets', label: 'Power sockets', hint: 'laptops need charging' },
  { key: 'ac', label: 'Air conditioning', hint: 'cool room' },
  { key: 'silent', label: 'Silent zone', hint: 'pin-drop focus' },
  { key: 'group', label: 'Group-friendly', hint: 'talking allowed' },
  { key: 'presentation', label: 'Presentation gear', hint: 'projector or smart board' },
];

const DURATIONS = [
  { value: '30', label: '30 min' },
  { value: '60', label: '1 hour' },
  { value: '120', label: '2 hours' },
  { value: '180', label: '3+ hours' },
];

const SIZES = ['1', '2', '3', '4', '6', '8', '12'];

export default async function MatchPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const submitted = params.size !== undefined || params.duration !== undefined || params.wants !== undefined;

  const size = Math.max(1, Math.min(60, Number(params.size ?? 1) || 1));
  const duration = Math.max(15, Math.min(480, Number(params.duration ?? 60) || 60));
  const wantsRaw = params.wants === undefined ? [] : Array.isArray(params.wants) ? params.wants : [params.wants];
  const wants = wantsRaw.filter((w): w is MatcherWants =>
    (['sockets', 'ac', 'silent', 'group', 'presentation'] as const).includes(w as MatcherWants),
  );

  const rooms = await getLiveRooms();
  const results = submitted ? matchRooms(rooms, { size, duration, wants }).slice(0, 6) : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold leading-7 tracking-[-0.01em]">Match me a space</h1>
        <p className="mt-0.5 text-[13px] text-ink-secondary">
          Three questions. Every result explains itself — no black-box scores.
        </p>
      </div>

      <Card className="p-5">
        <form method="get" action="/match" className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <fieldset>
            <legend className="text-micro uppercase tracking-wide text-ink-tertiary">Who&apos;s studying?</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SIZES.map((s) => (
                <label key={s} className="cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    defaultChecked={(params.size ?? '1') === s}
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-8 min-w-10 items-center justify-center rounded border border-line px-2.5 text-[13px] text-ink-secondary transition-colors peer-checked:border-accent peer-checked:bg-accent-subtle peer-checked:font-medium peer-checked:text-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-micro uppercase tracking-wide text-ink-tertiary">For how long?</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {DURATIONS.map((d) => (
                <label key={d.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="duration"
                    value={d.value}
                    defaultChecked={(params.duration ?? '60') === d.value}
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-8 items-center justify-center rounded border border-line px-3 text-[13px] text-ink-secondary transition-colors peer-checked:border-accent peer-checked:bg-accent-subtle peer-checked:font-medium peer-checked:text-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                    {d.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-micro uppercase tracking-wide text-ink-tertiary">What matters?</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {WANT_OPTIONS.map((w) => (
                <label key={w.key} className="cursor-pointer" title={w.hint}>
                  <input type="checkbox" name="wants" value={w.key} defaultChecked={wants.includes(w.key)} className="peer sr-only" />
                  <span className="inline-flex h-8 items-center justify-center rounded border border-line px-3 text-[13px] text-ink-secondary transition-colors peer-checked:border-accent peer-checked:bg-accent-subtle peer-checked:font-medium peer-checked:text-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                    {w.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Find my space
            </button>
          </div>
        </form>
      </Card>

      {submitted && (
        <>
          <h2 className="text-[15px] font-semibold">
            Top {results.length} matches for {size} {size === 1 ? 'person' : 'people'} · {duration} min
          </h2>
          <ol className="space-y-3">
            {results.map((r, i) => (
              <li key={r.room.room_id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-mono text-[13px] text-ink-secondary">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-subtle text-[11px] font-semibold text-accent">
                          {i + 1}
                        </span>
                        {r.room.code}
                      </p>
                      <a
                        href={`/spaces/${r.room.slug}`}
                        className="mt-0.5 block text-[15px] font-semibold leading-6 tracking-[-0.01em] hover:text-accent"
                      >
                        {r.room.name}
                      </a>
                      <p className="text-[13px] text-ink-secondary">
                        {ROOM_CATEGORY_LABEL[r.room.category] ?? r.room.category} · Floor {r.room.floor_level}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StatusPill
                        status={r.room.status}
                        freeMinutes={r.room.free_minutes}
                        occupiedUntil={r.room.occupied_until}
                      />
                      <span
                        className={cn(
                          'font-mono-tabular text-[13px] font-semibold',
                          r.score >= 70 ? 'text-status-free' : r.score >= 40 ? 'text-status-soon' : 'text-ink-tertiary',
                        )}
                      >
                        {r.score}/100
                      </span>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1 border-t border-line pt-3">
                    {r.reasons.map((reason) => (
                      <li key={reason} className="flex items-start gap-2 text-[13px] text-ink-secondary">
                        <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-tertiary" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </Card>
              </li>
            ))}
          </ol>
          {results.length === 0 && (
            <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center">
              <p className="text-[15px] font-medium">No rooms to score</p>
              <p className="mt-1 text-[13px] text-ink-secondary">
                The room inventory appears empty — try reloading.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
