import fs from 'fs';
import path from 'path';

export interface CleanedRoomRecord {
  room_id: string;
  room_code: string;
  display_name: string;
  room_type: string;
  floor_number: number;
  floor_inference_method: string;
  floor_confidence: string;
  seating_capacity: number;
  has_ac: boolean;
  has_charging_points: boolean;
  is_student_accessible: boolean | null;
  source_room_name: string;
  source_room_type: string;
  source_marked_free_in_room_list: string;
  data_quality_status: string;
}

export interface CleanedScheduleSlotRecord {
  room_id: string;
  day_of_week: number;
  day_label: string;
  period_number: number;
  start_time: string;
  end_time: string;
  slot_type: 'free' | 'class' | 'lab' | 'lab-continue';
  is_scheduled_free: boolean;
  scheduled_label: string;
  span_periods: number;
  source_time_label: string;
  source_version: string;
  source_slot_type: 'free' | 'class' | 'lab' | 'lab-continue' | 'sametime';
}

export type RoomStatus = 'free' | 'soon' | 'busy' | 'unknown';

export interface SpacesRoom {
  room_id: string;
  code: string;
  slug: string;
  name: string;
  category: string;
  floor_level: number;
  floor_label: string;
  capacity: number;
  has_ac: boolean;
  has_charging_points: boolean;
  sockets_working: number;
  sockets_total: number;
  status: RoomStatus;
  is_free_now: boolean;
  free_minutes: number | null;
  occupied_until: string | null;
  current_occupancy_title: string | null;
  current_occupancy_kind: string | null;
  current_course_code: string | null;
  current_batch: string | null;
  current_faculty: string | null;
  next_occupancy_from: string | null;
  next_occupancy_title: string | null;
  comfort_score: number | null;
  noise_vibe: string | null;
  is_accessible: boolean;
  block_name: string;
}

export const CAMPUS_FLOORS = [
  { value: 0, label: 'Ground (0)', shortLabel: 'Ground' },
  { value: 1, label: 'First (1)', shortLabel: 'Floor 1' },
  { value: 2, label: 'Second (2)', shortLabel: 'Floor 2' },
  { value: 3, label: 'Third (3)', shortLabel: 'Floor 3' },
  { value: 4, label: 'Fourth (4)', shortLabel: 'Floor 4' },
] as const;

export const CAMPUS_DAYS = [
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
] as const;

export const CAMPUS_PERIODS = [
  { value: 1, label: 'P1', time: '08:45–09:45', start: '08:45', end: '09:45', durationMins: 60 },
  { value: 2, label: 'P2', time: '09:45–10:45', start: '09:45', end: '10:45', durationMins: 60 },
  { value: 3, label: 'P3', time: '11:00–12:00', start: '11:00', end: '12:00', durationMins: 60 },
  { value: 4, label: 'P4', time: '12:00–13:00', start: '12:00', end: '13:00', durationMins: 60 },
  { value: 5, label: 'P5', time: '13:00–13:50', start: '13:00', end: '13:50', durationMins: 50 },
  { value: 6, label: 'P6', time: '13:50–14:50', start: '13:50', end: '14:50', durationMins: 60 },
  { value: 7, label: 'P7', time: '14:50–15:50', start: '14:50', end: '15:50', durationMins: 60 },
] as const;

/**
 * Robust RFC 4180 compliant CSV line parser.
 * Handles quoted fields with embedded commas, quotes, and whitespace.
 */
export function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        current += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ',') {
        fields.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
  }

  fields.push(current.trim());
  return fields;
}

export function parseCsvText<T>(
  csvText: string,
  transform: (row: Record<string, string>) => T | null,
): T[] {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length === 0) return [];

  const headerLine = lines[0]?.trim();
  if (!headerLine) return [];

  const headers = parseCsvLine(headerLine).map((h) => h.replace(/^["']|["']$/g, '').trim());
  const results: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCsvLine(line);
    const rowObj: Record<string, string> = {};

    for (let h = 0; h < headers.length; h++) {
      rowObj[headers[h]] = values[h] ?? '';
    }

    try {
      const parsed = transform(rowObj);
      if (parsed !== null) {
        results.push(parsed);
      }
    } catch {
      // Gracefully ignore corrupt rows
    }
  }

  return results;
}

function parseBoolean(val: unknown): boolean {
  if (typeof val === 'boolean') return val;
  if (!val) return false;
  const s = String(val).trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'yes' || s === 't';
}

function parseInteger(val: unknown, fallback = 0): number {
  if (typeof val === 'number' && !isNaN(val)) return Math.floor(val);
  if (!val) return fallback;
  const parsed = parseInt(String(val).trim(), 10);
  return isNaN(parsed) ? fallback : parsed;
}

function inferFloorFromCode(roomCode: string): number {
  const match = roomCode.match(/^(\d)/);
  if (match) {
    const n = parseInt(match[1], 10);
    if (!isNaN(n) && n >= 0 && n <= 4) return n;
  }
  return 1;
}

export function transformRoomRow(row: Record<string, string>): CleanedRoomRecord | null {
  const roomId = row.room_id?.trim();
  const roomCode = row.room_code?.trim();
  if (!roomId || !roomCode) return null;

  let floorNum = parseInteger(row.floor_number, -1);
  if (floorNum < 0 || floorNum > 4) {
    floorNum = inferFloorFromCode(roomCode);
  }

  const capacity = parseInteger(row.seating_capacity, 0);
  const hasAc = parseBoolean(row.has_ac);
  const hasCharging = parseBoolean(row.has_charging_points);

  let accessible: boolean | null = null;
  if (row.is_student_accessible && row.is_student_accessible.trim() !== '') {
    accessible = parseBoolean(row.is_student_accessible);
  }

  return {
    room_id: roomId,
    room_code: roomCode,
    display_name: row.display_name?.trim() || `${roomCode} Room`,
    room_type: row.room_type?.trim() || 'classroom',
    floor_number: floorNum,
    floor_inference_method: row.floor_inference_method || '',
    floor_confidence: row.floor_confidence || '',
    seating_capacity: capacity,
    has_ac: hasAc,
    has_charging_points: hasCharging,
    is_student_accessible: accessible,
    source_room_name: row.source_room_name || '',
    source_room_type: row.source_room_type || '',
    source_marked_free_in_room_list: row.source_marked_free_in_room_list || '',
    data_quality_status: row.data_quality_status || '',
  };
}

export function transformScheduleSlotRow(
  row: Record<string, string>,
): CleanedScheduleSlotRecord | null {
  const roomId = row.room_id?.trim();
  if (!roomId) return null;

  const day = parseInteger(row.day_of_week, 0);
  const period = parseInteger(row.period_number, 0);
  if (day < 1 || day > 6 || period < 1 || period > 7) return null;

  const sourceSlotType = (row.source_slot_type?.trim() || 'class') as CleanedScheduleSlotRecord['source_slot_type'];
  const rawSlotType = (row.slot_type?.trim() || 'class') as CleanedScheduleSlotRecord['slot_type'];

  // Strict availability rule:
  // - A slot is free ONLY when original source slot type is explicitly 'free'
  // - 'sametime' slots contain scheduled class text and MUST remain unavailable (is_scheduled_free = false)
  // - Occupied slots ('class', 'lab', 'lab-continue') are unavailable
  const rawFreeFlag = parseBoolean(row.is_scheduled_free);
  const isScheduledFree = rawFreeFlag === true && sourceSlotType === 'free' && rawSlotType === 'free';

  const slotType: CleanedScheduleSlotRecord['slot_type'] = isScheduledFree ? 'free' : rawSlotType === 'free' ? 'class' : rawSlotType;

  return {
    room_id: roomId,
    day_of_week: day,
    day_label: row.day_label?.trim() || CAMPUS_DAYS.find((d) => d.value === day)?.label || 'Mon',
    period_number: period,
    start_time: row.start_time?.trim() || '',
    end_time: row.end_time?.trim() || '',
    slot_type: slotType,
    is_scheduled_free: isScheduledFree,
    scheduled_label: row.scheduled_label?.trim() || '',
    span_periods: parseInteger(row.span_periods, 1),
    source_time_label: row.source_time_label?.trim() || '',
    source_version: row.source_version?.trim() || '',
    source_slot_type: sourceSlotType,
  };
}

// In-memory cache for parsed datasets
let cachedRooms: CleanedRoomRecord[] | null = null;
let cachedSlots: CleanedScheduleSlotRecord[] | null = null;
let cachedSlotMap: Map<string, CleanedScheduleSlotRecord> | null = null;

function resolveDataFilePath(filename: string): string | null {
  const candidates = [
    path.join(process.cwd(), 'src', 'data', filename),
    path.join(process.cwd(), 'data', filename),
    path.resolve('src/data', filename),
    path.resolve('data', filename),
    path.resolve(__dirname, '..', 'data', filename),
    path.resolve(__dirname, '..', '..', 'src', 'data', filename),
  ];

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ candidate)) {
        return candidate;
      }
    } catch {
      // Continue searching
    }
  }

  return null;
}

export function loadCleanedRooms(customCsvText?: string): CleanedRoomRecord[] {
  if (customCsvText) {
    return parseCsvText(customCsvText, transformRoomRow);
  }

  if (cachedRooms) return cachedRooms;

  const filePath = resolveDataFilePath('rooms_cleaned.csv');
  if (!filePath) {
    console.warn('rooms_cleaned.csv not found');
    return [];
  }

  try {
    const content = fs.readFileSync(/*turbopackIgnore: true*/ filePath, 'utf-8');
    cachedRooms = parseCsvText(content, transformRoomRow);
    return cachedRooms;
  } catch (err) {
    console.error('Failed to read rooms_cleaned.csv:', err);
    return [];
  }
}

export function loadCleanedScheduleSlots(customCsvText?: string): CleanedScheduleSlotRecord[] {
  if (customCsvText) {
    return parseCsvText(customCsvText, transformScheduleSlotRow);
  }

  if (cachedSlots) return cachedSlots;

  const filePath = resolveDataFilePath('room_schedule_slots_cleaned.csv');
  if (!filePath) {
    console.warn('room_schedule_slots_cleaned.csv not found');
    return [];
  }

  try {
    const content = fs.readFileSync(/*turbopackIgnore: true*/ filePath, 'utf-8');
    cachedSlots = parseCsvText(content, transformScheduleSlotRow);
    return cachedSlots;
  } catch (err) {
    console.error('Failed to read room_schedule_slots_cleaned.csv:', err);
    return [];
  }
}

export function getSlotMap(): Map<string, CleanedScheduleSlotRecord> {
  if (cachedSlotMap) return cachedSlotMap;
  const slots = loadCleanedScheduleSlots();
  const map = new Map<string, CleanedScheduleSlotRecord>();
  for (const s of slots) {
    map.set(`${s.room_id}_${s.day_of_week}_${s.period_number}`, s);
  }
  cachedSlotMap = map;
  return map;
}

export function clearCampusDataCache(): void {
  cachedRooms = null;
  cachedSlots = null;
  cachedSlotMap = null;
}

export function parseDaySelection(dayParam?: string | number | null): number {
  if (dayParam == null || dayParam === '') return 1;
  const s = String(dayParam).trim().toLowerCase();
  const num = parseInt(s, 10);
  if (!isNaN(num) && num >= 1 && num <= 6) return num;

  const found = CAMPUS_DAYS.find(
    (d) => d.label.toLowerCase() === s || d.fullLabel.toLowerCase() === s,
  );
  return found ? found.value : 1;
}

export function parsePeriodSelection(periodParam?: string | number | null): number {
  if (periodParam == null || periodParam === '') return 1;
  const s = String(periodParam).trim().toLowerCase().replace(/^p/, '');
  const num = parseInt(s, 10);
  if (!isNaN(num) && num >= 1 && num <= 7) return num;
  return 1;
}

function getFloorLabel(floorNumber: number): string {
  switch (floorNumber) {
    case 0:
      return 'Ground Floor';
    case 1:
      return '1st Floor';
    case 2:
      return '2nd Floor';
    case 3:
      return '3rd Floor';
    case 4:
      return '4th Floor';
    default:
      return `Floor ${floorNumber}`;
  }
}

/**
 * Calculates continuous free minutes starting from `period` on `day`
 */
function calculateFreeMinutes(
  roomId: string,
  day: number,
  period: number,
  slotMap: Map<string, CleanedScheduleSlotRecord>,
): number {
  let minutes = 0;
  for (let p = period; p <= 7; p++) {
    const slot = slotMap.get(`${roomId}_${day}_${p}`);
    if (slot && slot.is_scheduled_free === true) {
      const periodConfig = CAMPUS_PERIODS.find((cp) => cp.value === p);
      minutes += periodConfig ? periodConfig.durationMins : 60;
    } else {
      break;
    }
  }
  return minutes;
}

/**
 * Finds next occupancy on the same day after `period`
 */
function findNextOccupancy(
  roomId: string,
  day: number,
  period: number,
  slotMap: Map<string, CleanedScheduleSlotRecord>,
): { time: string; title: string } | null {
  for (let p = period + 1; p <= 7; p++) {
    const slot = slotMap.get(`${roomId}_${day}_${p}`);
    if (slot && !slot.is_scheduled_free) {
      return {
        time: slot.start_time,
        title: slot.scheduled_label || 'Scheduled Session',
      };
    }
  }
  return null;
}

/**
 * Finds continuous busy end time starting from `period`
 */
function findBusyEndTime(
  roomId: string,
  day: number,
  period: number,
  currentSlot: CleanedScheduleSlotRecord,
  slotMap: Map<string, CleanedScheduleSlotRecord>,
): string {
  let endTime = currentSlot.end_time;
  for (let p = period + 1; p <= 7; p++) {
    const nextSlot = slotMap.get(`${roomId}_${day}_${p}`);
    if (nextSlot && !nextSlot.is_scheduled_free) {
      endTime = nextSlot.end_time;
    } else {
      break;
    }
  }
  return endTime;
}

/**
 * Core function: Computes SpacesRoom representation for each room
 * for a specific day and period.
 */
export function getRoomsForDayAndPeriod(
  dayNumber: number,
  periodNumber: number,
  options?: {
    rooms?: CleanedRoomRecord[];
    slotMap?: Map<string, CleanedScheduleSlotRecord>;
  },
): SpacesRoom[] {
  const rooms = options?.rooms ?? loadCleanedRooms();
  const slotMap = options?.slotMap ?? getSlotMap();

  return rooms.map((room) => {
    const key = `${room.room_id}_${dayNumber}_${periodNumber}`;
    const slot = slotMap.get(key);

    let status: RoomStatus = 'unknown';
    let isFreeNow = false;
    let freeMinutes: number | null = null;
    let occupiedUntil: string | null = null;
    let currentTitle: string | null = null;
    let currentKind: string | null = null;
    let nextOccupancy: { time: string; title: string } | null = null;

    if (!slot) {
      // Rule: Never invent missing room data or mark unknown availability as free.
      status = 'unknown';
      isFreeNow = false;
      currentTitle = 'No schedule data';
    } else if (slot.is_scheduled_free === true) {
      // Room is explicitly marked free
      status = 'free';
      isFreeNow = true;
      freeMinutes = calculateFreeMinutes(room.room_id, dayNumber, periodNumber, slotMap);
      nextOccupancy = findNextOccupancy(room.room_id, dayNumber, periodNumber, slotMap);
    } else {
      // Room is unavailable (occupied or sametime)
      isFreeNow = false;
      currentTitle = slot.scheduled_label || 'In session';
      currentKind = slot.slot_type;
      occupiedUntil = findBusyEndTime(room.room_id, dayNumber, periodNumber, slot, slotMap);

      // Check if becoming free in the immediate next period
      if (periodNumber < 7) {
        const nextSlot = slotMap.get(`${room.room_id}_${dayNumber}_${periodNumber + 1}`);
        if (nextSlot && nextSlot.is_scheduled_free === true) {
          status = 'soon';
        } else {
          status = 'busy';
        }
      } else {
        status = 'busy';
      }
    }

    // Extract course code / batch if available
    let courseCode: string | null = null;
    let batch: string | null = null;
    if (currentTitle && currentTitle !== 'In session' && currentTitle !== 'No schedule data') {
      const match = currentTitle.match(/^([^(]+(?:\([^)]*\))*)\s*(?:\(([^)]+)\))?$/);
      if (match) {
        courseCode = match[1]?.trim() ?? null;
        batch = match[2]?.trim() ?? null;
      } else {
        courseCode = currentTitle;
      }
    }

    const comfortScore = room.has_ac && room.has_charging_points ? 8.8 : room.has_ac ? 7.8 : 6.8;

    return {
      room_id: room.room_id,
      code: room.room_code,
      slug: room.room_code.toLowerCase(),
      name: room.display_name,
      category: room.room_type || 'classroom',
      floor_level: room.floor_number,
      floor_label: getFloorLabel(room.floor_number),
      capacity: room.seating_capacity,
      has_ac: room.has_ac,
      has_charging_points: room.has_charging_points,
      sockets_working: room.has_charging_points ? 15 : 0,
      sockets_total: room.has_charging_points ? 15 : 0,
      status,
      is_free_now: isFreeNow,
      free_minutes: freeMinutes,
      occupied_until: occupiedUntil,
      current_occupancy_title: currentTitle,
      current_occupancy_kind: currentKind,
      current_course_code: courseCode,
      current_batch: batch,
      current_faculty: null,
      next_occupancy_from: nextOccupancy?.time ?? null,
      next_occupancy_title: nextOccupancy?.title ?? null,
      comfort_score: comfortScore,
      noise_vibe: 'moderate',
      is_accessible: room.is_student_accessible === true,
      block_name: 'Campus Engineering Block',
    };
  });
}

export interface FilterOptions {
  floor?: string;
  status?: string;
  ac?: string;
  charging?: string;
  sort?: string;
}

export function parseFloorValue(floorVal?: string | number | null): number | null {
  if (floorVal == null || floorVal === '' || floorVal === 'all') return null;
  const s = String(floorVal).trim().toLowerCase();
  if (s === '0' || s === 'ground' || s === 'g') return 0;
  if (s === '1' || s === 'first' || s === '1st') return 1;
  if (s === '2' || s === 'second' || s === '2nd') return 2;
  if (s === '3' || s === 'third' || s === '3rd') return 3;
  if (s === '4' || s === 'fourth' || s === '4th') return 4;
  const n = parseInt(s, 10);
  return !isNaN(n) && n >= 0 && n <= 4 ? n : null;
}

export function filterRooms(rooms: SpacesRoom[], filters: FilterOptions): SpacesRoom[] {
  let result = rooms;

  // Floor filter: 0=Ground, 1=First, 2=Second, 3=Third, 4=Fourth
  if (filters.floor && filters.floor !== 'all') {
    const targetFloor = parseFloorValue(filters.floor);
    if (targetFloor !== null) {
      result = result.filter((r) => r.floor_level === targetFloor);
    }
  }

  // AC filter
  if (filters.ac != null && filters.ac !== '' && filters.ac !== 'all') {
    const s = String(filters.ac).trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'yes') {
      result = result.filter((r) => r.has_ac);
    } else if (s === 'false' || s === '0' || s === 'no') {
      result = result.filter((r) => !r.has_ac);
    }
  }

  // Charging points filter
  if (filters.charging != null && filters.charging !== '' && filters.charging !== 'all') {
    const s = String(filters.charging).trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'yes') {
      result = result.filter((r) => r.has_charging_points);
    } else if (s === 'false' || s === '0' || s === 'no') {
      result = result.filter((r) => !r.has_charging_points);
    }
  }

  // Status filter: free, soon, busy
  if (filters.status && filters.status !== 'all') {
    if (filters.status === 'free') {
      // Explicit requirement: A room is free only when its corresponding schedule record explicitly has is_scheduled_free = true
      result = result.filter((r) => r.status === 'free');
    } else if (filters.status === 'soon') {
      result = result.filter((r) => r.status === 'soon');
    } else if (filters.status === 'busy') {
      result = result.filter((r) => r.status === 'busy' || r.status === 'soon');
    }
  }

  // Sort
  if (filters.sort === 'free') {
    const rank: Record<RoomStatus, number> = { free: 0, soon: 1, busy: 2, unknown: 3 };
    result = [...result].sort(
      (a, b) => rank[a.status] - rank[b.status] || (b.free_minutes ?? 0) - (a.free_minutes ?? 0),
    );
  } else if (filters.sort === 'capacity') {
    result = [...result].sort((a, b) => b.capacity - a.capacity);
  } else {
    // Natural code sort: 101, 102, 114B, 114C, 201...
    result = [...result].sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: 'base' }),
    );
  }

  return result;
}

export function getCleanedRoomSchedule(
  roomIdOrCode: string,
  dayNumber: number,
): CleanedScheduleSlotRecord[] {
  const slots = loadCleanedScheduleSlots();
  const target = roomIdOrCode.trim().toLowerCase();
  return slots
    .filter((s) => {
      const sId = s.room_id.toLowerCase();
      const codeWithoutPrefix = sId.replace(/^room_/, '');
      return (
        (sId === target || codeWithoutPrefix === target) &&
        s.day_of_week === dayNumber
      );
    })
    .sort((a, b) => a.period_number - b.period_number);
}

export function getCleanedRoomBySlug(
  slugOrCode: string,
  dayNumber = 1,
  periodNumber = 1,
): { room: SpacesRoom; slots: CleanedScheduleSlotRecord[] } | null {
  const target = slugOrCode.trim().toLowerCase();
  const rooms = getRoomsForDayAndPeriod(dayNumber, periodNumber);
  const found = rooms.find(
    (r) => r.slug === target || r.code.toLowerCase() === target || r.room_id.toLowerCase() === target,
  );

  if (!found) return null;
  const slots = getCleanedRoomSchedule(found.room_id, dayNumber);
  return { room: found, slots };
}

export interface DayPeriodSlotSummary {
  dayNumber: number;
  dayLabel: string;
  dayFullLabel: string;
  periodNumber: number;
  periodLabel: string;
  periodTime: string;
  totalRooms: number;
  freeCount: number;
  busyCount: number;
  freeRooms: Array<{
    code: string;
    slug: string;
    name: string;
    floor_level: number;
    has_ac: boolean;
    has_charging_points: boolean;
  }>;
  occupiedSessions: Array<{
    roomCode: string;
    label: string;
  }>;
}

export type WeeklyTimetableSummary = Record<number, Record<number, DayPeriodSlotSummary>>;

let cachedWeeklySummary: WeeklyTimetableSummary | null = null;

export function getWeeklyTimetableSummary(): WeeklyTimetableSummary {
  if (cachedWeeklySummary) return cachedWeeklySummary;

  const rooms = loadCleanedRooms();
  const slotMap = getSlotMap();
  const summary: WeeklyTimetableSummary = {};

  for (let d = 1; d <= 6; d++) {
    summary[d] = {};
    const dayConfig = CAMPUS_DAYS.find((cd) => cd.value === d);
    const dayLabel = dayConfig?.label ?? 'Mon';
    const dayFullLabel = dayConfig?.fullLabel ?? 'Monday';

    for (let p = 1; p <= 7; p++) {
      const periodConfig = CAMPUS_PERIODS.find((cp) => cp.value === p);
      const periodLabel = periodConfig?.label ?? `P${p}`;
      const periodTime = periodConfig?.time ?? '';

      const freeRooms: DayPeriodSlotSummary['freeRooms'] = [];
      const occupiedSessions: DayPeriodSlotSummary['occupiedSessions'] = [];

      for (const room of rooms) {
        const slot = slotMap.get(`${room.room_id}_${d}_${p}`);
        if (slot && slot.is_scheduled_free === true) {
          freeRooms.push({
            code: room.room_code,
            slug: room.room_code.toLowerCase(),
            name: room.display_name,
            floor_level: room.floor_number,
            has_ac: room.has_ac,
            has_charging_points: room.has_charging_points,
          });
        } else if (slot && slot.scheduled_label) {
          occupiedSessions.push({
            roomCode: room.room_code,
            label: slot.scheduled_label,
          });
        }
      }

      summary[d][p] = {
        dayNumber: d,
        dayLabel,
        dayFullLabel,
        periodNumber: p,
        periodLabel,
        periodTime,
        totalRooms: rooms.length,
        freeCount: freeRooms.length,
        busyCount: rooms.length - freeRooms.length,
        freeRooms,
        occupiedSessions,
      };
    }
  }

  cachedWeeklySummary = summary;
  return summary;
}

