'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { createCheckIn } from '@/server/actions/checkins';
import { cn } from '@/lib/utils';

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
    { v: 'plenty', l: 'Plenty' },
    { v: 'limited', l: 'A few' },
    { v: 'none', l: 'None free' },
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
      <div className="rounded-lg border border-line bg-surface-sunken p-3 text-center dark:border-white/[0.08] dark:bg-[#141416]">
        <p className="font-mono text-xs font-bold text-ink dark:text-white">Checked in · +15 karma</p>
        <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
          Live for 90 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <input type="hidden" name="room_id" value={roomId} />

      <ChoiceRow name="crowd_density" label="Crowd Density" options={CROWD} required />
      <ChoiceRow name="ac_comfort" label="AC Comfort" options={AC} />
      <ChoiceRow name="socket_availability" label="Sockets" options={SOCKETS} />
      <ChoiceRow name="purpose" label="Purpose" options={PURPOSE} />

      <div>
        <label className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Note (Optional)
        </label>
        <textarea
          name="note"
          maxLength={280}
          rows={2}
          placeholder="e.g. AC working well, plenty of seats on left side…"
          className="mt-1 w-full rounded-lg border border-line bg-surface p-2 text-xs font-medium outline-none transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/[0.08] dark:bg-[#141416] dark:text-zinc-200"
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <input type="checkbox" name="is_anonymous" className="h-3.5 w-3.5 rounded border-line" />
        <span>Post anonymously</span>
      </label>

      {error && (
        <p role="alert" className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}

      <Button type="submit" loading={busy} className="w-full text-xs font-semibold">
        Check In to {roomCode}
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
      <legend className="font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{label}</legend>
      <div className="mt-1 flex flex-wrap gap-1">
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
                'inline-flex h-6 items-center rounded border border-line bg-surface px-2 font-mono text-[10px] text-zinc-500',
                'transition-all peer-checked:border-zinc-900 peer-checked:bg-zinc-900 peer-checked:text-white dark:border-white/[0.08] dark:bg-[#141416] dark:text-zinc-400 dark:peer-checked:border-white dark:peer-checked:bg-white dark:peer-checked:text-zinc-900 dark:peer-checked:font-semibold',
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
