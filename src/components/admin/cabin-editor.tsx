'use client';

import { useMemo, useState, useTransition } from 'react';
import { Upload } from 'lucide-react';

import { importCabinsCsv, saveCabin } from '@/server/actions/admin';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type AdminFaculty = {
  id: string;
  name: string;
  department: string | null;
  cabinRoomId: string | null;
  cabinNote: string | null;
};

export type AdminRoomOption = {
  id: string;
  label: string; // "121 A · Block A L1"
};

const inputCls =
  'h-9 rounded border border-line-strong bg-canvas px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent';

export function CabinEditor({
  faculty,
  rooms,
}: {
  faculty: AdminFaculty[];
  rooms: AdminRoomOption[];
}) {
  const [q, setQ] = useState('');
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState(faculty);
  const [toast, setToast] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      rows.filter(
        (f) =>
          f.name.toLowerCase().includes(q.toLowerCase()) ||
          (f.department ?? '').toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q],
  );

  function update(id: string, cabinRoomId: string | null, cabinNote: string | null) {
    setRows((rs) => rs.map((f) => (f.id === id ? { ...f, cabinRoomId, cabinNote } : f)));
  }

  return (
    <div className="space-y-3">
      {toast && (
        <p
          className={cn(
            'rounded-md border px-3 py-2 text-xs',
            toast.toLowerCase().includes('saved') || /^\d+ cabin/.test(toast)
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
          )}
        >
          {toast}
        </p>
      )}

      {/* CSV import — headers: name,cabin,note */}
      <form
        className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-surface-sunken p-3"
        action={(fd: FormData) => {
          startTransition(async () => {
            const res = await importCabinsCsv(fd);
            setToast(res.message);
          });
        }}
      >
        <Upload className="h-4 w-4 text-ink-tertiary" />
        <input type="file" name="file" accept=".csv,text/csv" required className="text-xs" />
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          {pending ? 'Importing…' : 'Import CSV'}
        </Button>
        <code className="text-[10px] text-ink-tertiary">
          headers: name,cabin,note — cabin must match a room code (e.g. &quot;121 A&quot;)
        </code>
      </form>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search faculty…"
        className={cn(inputCls, 'w-full max-w-sm')}
      />

      <div className="divide-y rounded-lg border">
        {visible.map((f) => (
          <div key={f.id} className="flex flex-wrap items-center gap-2 p-2.5">
            <div className="min-w-40 flex-1">
              <p className="text-sm font-medium leading-tight">{f.name}</p>
              <p className="text-xs text-ink-tertiary">{f.department ?? '—'}</p>
            </div>
            <select
              value={f.cabinRoomId ?? ''}
              onChange={(e) => {
                const roomId = e.target.value || null;
                update(f.id, roomId, f.cabinNote);
                startTransition(async () => {
                  const res = await saveCabin(f.id, roomId, f.cabinNote);
                  setToast(res.message);
                });
              }}
              className={cn(inputCls, 'w-56')}
            >
              <option value="">— no cabin —</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
            <input
              defaultValue={f.cabinNote ?? ''}
              placeholder="note (optional)"
              onBlur={(e) => {
                const note = e.target.value;
                if (note !== (f.cabinNote ?? '')) {
                  update(f.id, f.cabinRoomId, note || null);
                  startTransition(async () => {
                    const res = await saveCabin(f.id, f.cabinRoomId, note || null);
                    setToast(res.message);
                  });
                }
              }}
              className={cn(inputCls, 'w-44')}
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-ink-tertiary">
        {visible.length} shown · changes save automatically
      </p>
    </div>
  );
}
