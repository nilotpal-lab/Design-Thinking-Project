'use server';

import { revalidatePath } from 'next/cache';

import { cabinCsvRowSchema } from '@/lib/validations';
import { getAdminIfAuthorized } from '@/server/admin-guard';

export type CabinResult = { ok: boolean; message: string };

/**
 * Save one faculty member's cabin. `roomId` may be null (cabin unknown).
 */
export async function saveCabin(
  facultyId: string,
  roomId: string | null,
  note: string | null,
): Promise<CabinResult> {
  const admin = await getAdminIfAuthorized();
  if (!admin) return { ok: false, message: 'Admin access required.' };

  const { error } = await admin
    .from('faculty')
    .update({ cabin_room_id: roomId, cabin_note: note?.trim() || null })
    .eq('id', facultyId);

  if (error) return { ok: false, message: error.message };
  revalidatePath('/faculty');
  revalidatePath('/admin');
  return { ok: true, message: 'Cabin saved.' };
}

/**
 * CSV import. Expected header (case-insensitive, order-free):
 *   name, cabin, note
 * `name` must match a faculty row exactly; `cabin` must match a room code
 * ('121 A'). Rows that fail are reported, not silently dropped — the admin
 * fixes them and re-uploads.
 */
export async function importCabinsCsv(formData: FormData): Promise<CabinResult> {
  const admin = await getAdminIfAuthorized();
  if (!admin) return { ok: false, message: 'Admin access required.' };

  const file = formData.get('file');
  if (!(file instanceof File)) return { ok: false, message: 'Choose a CSV file.' };

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { ok: false, message: 'CSV is empty (needs header + rows).' };

  // Parse header
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  const col = (names: string[]) => header.findIndex((h) => names.includes(h));
  const iName = col(['name', 'faculty', 'teacher']);
  const iCabin = col(['cabin', 'cabin_room', 'room', 'cabin_code']);
  const iNote = col(['note', 'notes', 'cabin_note']);
  if (iName === -1 || iCabin === -1)
    return { ok: false, message: 'CSV needs "name" and "cabin" columns.' };

  // Lookup maps (rooms by code, faculty by lowercase name)
  const { data: rooms } = await admin.from('rooms').select('id, code');
  const { data: faculty } = await admin.from('faculty').select('id, full_name');
  const roomByCode = new Map((rooms ?? []).map((r) => [r.code.toLowerCase(), r.id]));
  const facultyByName = new Map((faculty ?? []).map((f) => [f.full_name.toLowerCase(), f.id]));

  let applied = 0;
  const errors: string[] = [];

  for (const line of lines.slice(1)) {
    const cells = line.split(',').map((c) => c.trim());
    const parsed = cabinCsvRowSchema.safeParse({
      name: cells[iName] ?? '',
      cabin: cells[iCabin] ?? '',
      note: iNote >= 0 ? (cells[iNote] ?? '') : '',
    });
    if (!parsed.success) {
      errors.push(`"${cells[iName]}": ${parsed.error.issues[0]?.message ?? 'invalid row'}`);
      continue;
    }
    const roomId = roomByCode.get(parsed.data.cabin.toLowerCase());
    const facultyId = facultyByName.get(parsed.data.name.toLowerCase());
    if (!roomId) {
      errors.push(`"${parsed.data.cabin}": no room with this code`);
      continue;
    }
    if (!facultyId) {
      errors.push(`"${parsed.data.name}": no faculty with this name`);
      continue;
    }
    const { error } = await admin
      .from('faculty')
      .update({ cabin_room_id: roomId, cabin_note: parsed.data.note || null })
      .eq('id', facultyId);
    if (error) errors.push(`"${parsed.data.name}": ${error.message}`);
    else applied += 1;
  }

  revalidatePath('/faculty');
  revalidatePath('/admin');

  const summary = `${applied} cabin${applied === 1 ? '' : 's'} saved.`;
  if (errors.length) return { ok: applied > 0, message: `${summary} ${errors.length} skipped: ${errors.slice(0, 5).join('; ')}${errors.length > 5 ? '…' : ''}` };
  return { ok: true, message: summary };
}
