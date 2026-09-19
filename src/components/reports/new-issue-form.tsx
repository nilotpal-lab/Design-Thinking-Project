'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { createIssue } from '@/server/actions/issues';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { v: 'power', l: 'Power / sockets' },
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

/**
 * Issue form. Reporters pick the room by code — the select is fed by the
 * server-rendered room list, so there is no client fetch at all.
 */
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
      <label className="block">
        <span className="text-[13px] font-medium">Where?</span>
        <select
          name="room_id"
          required
          defaultValue=""
          className="mt-1 h-10 w-full rounded border border-line-strong bg-canvas px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <option value="" disabled>
            Pick the room…
          </option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.code} — {r.name}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className="text-[13px] font-medium">What&apos;s wrong?</legend>
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
                  'inline-flex h-8 items-center rounded border border-line px-3 text-[13px] text-ink-secondary',
                  'transition-colors peer-checked:border-accent peer-checked:bg-accent-subtle peer-checked:font-medium peer-checked:text-accent',
                )}
              >
                {c.l}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-[13px] font-medium">Title</span>
        <input
          name="title"
          required
          minLength={4}
          maxLength={120}
          placeholder="e.g. Half the sockets dead on the north wall"
          className="mt-1 h-10 w-full rounded border border-line-strong bg-canvas px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </label>

      <label className="block">
        <span className="text-[13px] font-medium">Details</span>
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          placeholder="What happened, where in the room, since when…"
          className="mt-1 w-full rounded border border-line-strong bg-canvas p-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </label>

      <fieldset>
        <legend className="text-[13px] font-medium">Urgency</legend>
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
                  'inline-flex h-8 items-center rounded border border-line px-3 text-[13px] text-ink-secondary',
                  'transition-colors peer-checked:border-accent peer-checked:bg-accent-subtle peer-checked:font-medium peer-checked:text-accent',
                )}
              >
                {u.l}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-sm bg-status-busy-bg px-3 py-2 text-[13px] text-status-busy">
          {error}
        </p>
      )}

      {doneRef ? (
        <div className="rounded-lg bg-status-free-bg p-4">
          <p className="text-[14px] font-medium text-status-free">
            Filed as {doneRef} — +25 karma
          </p>
          <p className="mt-1 text-[13px] text-ink-secondary">
            Facilities sees it on the board below. Track progress there.
          </p>
        </div>
      ) : (
        <Button type="submit" loading={busy} className="w-full">
          File report
        </Button>
      )}
    </form>
  );
}
