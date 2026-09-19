'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { createIssue } from '@/server/actions/issues';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { v: 'power', l: 'Power / Sockets' },
  { v: 'ac', l: 'AC' },
  { v: 'wifi', l: 'Wi-Fi' },
  { v: 'projector', l: 'Projector' },
  { v: 'noise', l: 'Noise' },
  { v: 'cleanliness', l: 'Cleanliness' },
  { v: 'seating', l: 'Seating' },
  { v: 'furniture', l: 'Furniture' },
  { v: 'other', l: 'Other' },
];

const URGENCIES = [
  { v: 'low', l: 'Low' },
  { v: 'medium', l: 'Medium' },
  { v: 'high', l: 'High' },
  { v: 'critical', l: 'Critical' },
];

const inputCls =
  'h-9 w-full rounded-lg border border-line bg-surface px-3 text-xs font-medium outline-none transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/[0.08] dark:bg-[#141416] dark:text-zinc-200';

export function NewIssueForm({ rooms }: { rooms: { id: string; code: string; name: string }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneRef, setDoneRef] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await createIssue(new FormData(e.currentTarget));
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDoneRef('ref' in res ? (res as { ref?: string }).ref ?? 'JS-????' : 'JS-????');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Room Location
        </label>
        <select
          name="room_id"
          required
          defaultValue=""
          className={cn(inputCls, 'mt-1')}
        >
          <option value="" disabled>
            Select room…
          </option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.code} — {r.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Category
        </legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c, idx) => (
            <label key={c.v} className="cursor-pointer">
              <input
                type="radio"
                name="category"
                value={c.v}
                required={idx === 0 ? true : undefined}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'inline-flex h-7 items-center rounded-md border border-line bg-surface px-2.5 text-[11px] font-medium text-zinc-500',
                  'transition-all peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-checked:text-white dark:border-white/[0.08] dark:bg-[#141416] dark:text-zinc-400 dark:peer-checked:border-white dark:peer-checked:bg-white dark:peer-checked:text-zinc-900 dark:peer-checked:font-semibold',
                )}
              >
                {c.l}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Issue Summary
        </label>
        <input
          name="title"
          required
          minLength={4}
          maxLength={120}
          placeholder="e.g. Broken wall socket near whiteboard"
          className={cn(inputCls, 'mt-1')}
        />
      </div>

      <div>
        <label className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Details
        </label>
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={2000}
          rows={3}
          placeholder="Describe what is broken or malfunctioning…"
          className="mt-1 w-full rounded-lg border border-line bg-surface p-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/[0.08] dark:bg-[#141416] dark:text-zinc-200"
        />
      </div>

      <fieldset>
        <legend className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Urgency
        </legend>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {URGENCIES.map((u) => (
            <label key={u.v} className="cursor-pointer">
              <input
                type="radio"
                name="urgency"
                value={u.v}
                defaultChecked={u.v === 'medium'}
                className="peer sr-only"
              />
              <span
                className={cn(
                  'inline-flex h-7 items-center rounded-md border border-line bg-surface px-2.5 text-[11px] font-medium text-zinc-500',
                  'transition-all peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-checked:text-white dark:border-white/[0.08] dark:bg-[#141416] dark:text-zinc-400 dark:peer-checked:border-white dark:peer-checked:bg-white dark:peer-checked:text-zinc-900 dark:peer-checked:font-semibold',
                )}
              >
                {u.l}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      {doneRef ? (
        <div className="rounded-lg border border-line bg-surface-sunken p-3 dark:border-white/[0.08] dark:bg-[#141416]">
          <p className="font-mono text-xs font-bold text-ink dark:text-white">
            Filed as {doneRef} · +25 karma
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            Report logged to community facilities board.
          </p>
        </div>
      ) : (
        <Button type="submit" loading={busy} className="w-full text-xs font-semibold">
          File Report
        </Button>
      )}
    </form>
  );
}
