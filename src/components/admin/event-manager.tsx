'use client';

import { useState, useTransition } from 'react';

import { cancelEvent, createEvent, deleteEvent } from '@/server/actions/events';
import { Button } from '@/components/ui/button';

export type AdminEvent = {
  id: string;
  title: string;
  category: string;
  startsAt: string;
  isCancelled: boolean;
};

const inputCls =
  'h-9 rounded border border-line-strong bg-canvas px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent';

export function EventManager({
  events,
  rooms,
}: {
  events: AdminEvent[];
  rooms: { id: string; label: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <div className="space-y-4">
      {toast && (
        <p
          className={`rounded-md border px-3 py-2 text-xs ${
            toast.ok
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
          }`}
        >
          {toast.message}
        </p>
      )}

      {/* Create */}
      <form
        className="grid gap-2 rounded-lg border border-line bg-surface-sunken p-3 sm:grid-cols-2"
        action={(fd: FormData) => {
          startTransition(async () => {
            const res = await createEvent(fd);
            setToast(res);
          });
        }}
      >
        <input name="title" required placeholder="Event title" className={inputCls} />
        <select name="category" className={inputCls} defaultValue="other">
          {['fest', 'workshop', 'seminar', 'exam', 'club', 'sports', 'cultural', 'other'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-ink-tertiary">
          starts
          <input type="datetime-local" name="starts_at" required className={inputCls} />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-ink-tertiary">
          ends (optional)
          <input type="datetime-local" name="ends_at" className={inputCls} />
        </label>
        <select name="venue_room_id" className={inputCls} defaultValue="">
          <option value="">— venue: untracked location —</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>{r.label}</option>
          ))}
        </select>
        <input name="venue_text" placeholder="venue text (if not a tracked room)" className={inputCls} />
        <input name="organizer" placeholder="organizer (optional)" className={inputCls} />
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" name="all_day" className="h-3.5 w-3.5" /> all-day event
        </label>
        <textarea
          name="description"
          placeholder="description (optional)"
          rows={2}
          className="rounded border border-line-strong bg-canvas px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent sm:col-span-2"
        />
        <Button type="submit" size="sm" disabled={pending} className="sm:col-span-2">
          {pending ? 'Saving…' : 'Create event'}
        </Button>
      </form>

      {/* Existing */}
      <div className="divide-y rounded-lg border">
        {events.map((ev) => (
          <div key={ev.id} className="flex flex-wrap items-center gap-2 p-2.5">
            <div className="min-w-40 flex-1">
              <p className={`text-sm font-medium leading-tight ${ev.isCancelled ? 'line-through opacity-60' : ''}`}>
                {ev.title}
              </p>
              <p className="text-xs text-ink-tertiary">
                {new Date(ev.startsAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} · {ev.category}
              </p>
            </div>
            {!ev.isCancelled && (
              <Button
                size="sm"
                variant="secondary"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => setToast(await cancelEvent(ev.id)));
                }}
              >
                Cancel event
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                startTransition(async () => setToast(await deleteEvent(ev.id)));
              }}
            >
              Delete
            </Button>
          </div>
        ))}
        {events.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-tertiary">
            No events yet — create the first one above.
          </p>
        )}
      </div>
    </div>
  );
}
