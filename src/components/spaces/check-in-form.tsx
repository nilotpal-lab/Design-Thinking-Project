'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { createCheckIn } from '@/server/actions/checkins';
import { cn } from '@/lib/utils';

/**
 * CheckInForm — 20-second target (DESIGN §4). Radio rows, optional note,
 * anonymous toggle. Calls the Server Action directly; errors render inline.
 */
export function CheckInForm({ roomId, roomCode }: { roomId: string; roomCode: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const CROWD = [
    { v: 'empty', l: 'Empty' },
    { v: 'light', l: 'Light' },
    { v: 'moderate', l: 'Moderate' },
    { v: 'crowded', l: 'Crowded' },
    { v: 'full', l: 'Full' },
  ];
  const AC = [
    { v: 'freezing', l: 'Freezing' },
    { v: 'comfortable', l: 'Comfortable' },
    { v: 'warm', l: 'Warm' },
    { v: 'off', l: 'No AC' },
  ];
  const SOCKETS = [
    { v: 'plenty', l: 'Plenty free' },
    { v: 'limited', l: 'A few left' },
    { v: 'none', l: 'All taken' },
  ];
  const PURPOSE = [
    { v: 'study', l: 'Self study' },
    { v: 'group', l: 'Group work' },
    { v: 'charging', l: 'Charging' },
    { v: 'break', l: 'Break' },
    { v: 'class', l: 'In class' },
  ];

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await createCheckIn(new FormData(e.currentTarget));
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="rounded-lg bg-status-free-bg p-4 text-center">
        <p className="text-[14px] font-medium text-status-free">Checked in — thanks!</p>
        <p className="mt-1 text-[13px] text-ink-secondary">
          Your report is live for 90 minutes. +15 karma.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input type="hidden" name="room_id" value={roomId} />

      <ChoiceRow name="crowd_density" label="How busy is it right now?" options={CROWD} required />
      <ChoiceRow name="ac_comfort" label="How does the AC feel?" options={AC} />
      <ChoiceRow name="socket_availability" label="Sockets?" options={SOCKETS} />
      <ChoiceRow name="purpose" label="What are you up to?" options={PURPOSE} />

      <label className="block">
        <span className="text-[13px] font-medium">
          Note <span className="font-normal text-ink-tertiary">(optional)</span>
        </span>
        <textarea
          name="note"
          maxLength={280}
          rows={2}
          placeholder="e.g. AC dripping near window seats"
          className="mt-1 w-full rounded border border-line-strong bg-canvas p-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </label>

      <label className="flex items-center gap-2 text-[13px] text-ink-secondary">
        <input type="checkbox" name="is_anonymous" className="h-4 w-4 rounded" />
        Post anonymously
      </label>

      {error && (
        <p role="alert" className="rounded-sm bg-status-busy-bg px-3 py-2 text-[13px] text-status-busy">
          {error}
        </p>
      )}

      <Button type="submit" loading={busy} className="w-full">
        Check in to {roomCode}
      </Button>
    </form>
  );
}

function ChoiceRow({
  name,
  label,
  options,
  required,
}: {
  name: string;
  label: string;
  options: { v: string; l: string }[];
  required?: boolean;
}) {
  return (
    <fieldset>
      <legend className="text-[13px] font-medium">{label}</legend>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <label key={o.v} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={o.v}
              required={required}
              className="peer sr-only"
            />
            <span
              className={cn(
                'inline-flex h-8 items-center rounded border border-line px-3 text-[13px] text-ink-secondary',
                'transition-colors peer-checked:border-accent peer-checked:bg-accent-subtle peer-checked:font-medium peer-checked:text-accent',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-accent',
              )}
            >
              {o.l}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
