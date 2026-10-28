import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadCleanedRooms,
  loadCleanedScheduleSlots,
  getRoomsForDayAndPeriod,
  filterRooms,
  getCleanedRoomSchedule,
  getCleanedRoomBySlug,
  parseDaySelection,
  parsePeriodSelection,
  parseFloorValue,
  parseCsvLine,
  parseCsvText,
  transformRoomRow,
  transformScheduleSlotRow,
  clearCampusDataCache,
  getWeeklyTimetableSummary,
  CAMPUS_FLOORS,
  CAMPUS_DAYS,
  CAMPUS_PERIODS,
} from '@/lib/campus-dataset';

describe('CAMPUS Classroom Dataset Integration', () => {
  beforeEach(() => {
    clearCampusDataCache();
  });

  describe('CSV Parsing & Data Integrity', () => {
    it('correctly loads all 63 cleaned rooms from rooms_cleaned.csv', () => {
      const rooms = loadCleanedRooms();
      expect(rooms).toHaveLength(63);

      for (const r of rooms) {
        expect(r.room_id).toBeDefined();
        expect(r.room_code).toBeDefined();
        expect(r.floor_number).toBeGreaterThanOrEqual(1);
        expect(r.floor_number).toBeLessThanOrEqual(4);
        expect(typeof r.has_ac).toBe('boolean');
        expect(typeof r.has_charging_points).toBe('boolean');
        expect(typeof r.seating_capacity).toBe('number');
      }
    });

    it('correctly loads all 2646 schedule slots from room_schedule_slots_cleaned.csv', () => {
      const slots = loadCleanedScheduleSlots();
      expect(slots).toHaveLength(2646); // 63 rooms * 6 days * 7 periods
    });

    it('handles CSV lines with commas inside quotes and escaped quotes', () => {
      const parsed = parseCsvLine('room_101,"101 [AC] Room, North Wing",52,"He said ""hello"""');
      expect(parsed).toEqual(['room_101', '101 [AC] Room, North Wing', '52', 'He said "hello"']);
    });

    it('handles malformed room CSV rows gracefully without crashing', () => {
      const corruptCsv = `room_id,room_code,display_name,room_type,floor_number,seating_capacity,has_ac,has_charging_points
room_corrupt,,Corrupt Room,classroom,invalid,not_a_number,maybe,unknown
,missing_id,No ID Room,classroom,1,40,True,True
room_valid,101,Valid Room,classroom,1,50,True,True`;

      const parsed = parseCsvText(corruptCsv, transformRoomRow);
      // Only room_valid should pass transformRoomRow (room_corrupt has empty room_code, missing_id has empty room_id)
      expect(parsed).toHaveLength(1);
      expect(parsed[0].room_id).toBe('room_valid');
      expect(parsed[0].floor_number).toBe(1);
      expect(parsed[0].seating_capacity).toBe(50);
      expect(parsed[0].has_ac).toBe(true);
    });

    it('handles malformed schedule slot CSV rows gracefully without crashing', () => {
      const corruptCsv = `room_id,day_of_week,period_number,slot_type,is_scheduled_free,source_slot_type
room_101,invalid,1,free,True,free
room_101,1,invalid,free,True,free
room_101,1,1,free,True,free`;

      const parsed = parseCsvText(corruptCsv, transformScheduleSlotRow);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].room_id).toBe('room_101');
      expect(parsed[0].day_of_week).toBe(1);
      expect(parsed[0].period_number).toBe(1);
      expect(parsed[0].is_scheduled_free).toBe(true);
    });
  });

  describe('Floor Filters (Ground 0, First 1, Second 2, Third 3, Fourth 4)', () => {
    it('defines all 5 campus floor options including Ground (0)', () => {
      expect(CAMPUS_FLOORS).toHaveLength(5);
      const floorValues = CAMPUS_FLOORS.map((f) => f.value);
      expect(floorValues).toEqual([0, 1, 2, 3, 4]);
    });

    it('returns empty results for Ground Floor (0) filter without crashing', () => {
      const rooms = getRoomsForDayAndPeriod(1, 1);
      const filtered = filterRooms(rooms, { floor: '0' });
      expect(filtered).toHaveLength(0);
    });

    it('filters First Floor (1) correctly (22 rooms)', () => {
      const rooms = getRoomsForDayAndPeriod(1, 1);
      const filtered = filterRooms(rooms, { floor: '1' });
      expect(filtered).toHaveLength(22);
      expect(filtered.every((r) => r.floor_level === 1)).toBe(true);
    });

    it('filters Second Floor (2) correctly (15 rooms)', () => {
      const rooms = getRoomsForDayAndPeriod(1, 1);
      const filtered = filterRooms(rooms, { floor: '2' });
      expect(filtered).toHaveLength(15);
      expect(filtered.every((r) => r.floor_level === 2)).toBe(true);
    });

    it('filters Third Floor (3) correctly (25 rooms)', () => {
      const rooms = getRoomsForDayAndPeriod(1, 1);
      const filtered = filterRooms(rooms, { floor: '3' });
      expect(filtered).toHaveLength(25);
      expect(filtered.every((r) => r.floor_level === 3)).toBe(true);
    });

    it('filters Fourth Floor (4) correctly (1 room: 411)', () => {
      const rooms = getRoomsForDayAndPeriod(1, 1);
      const filtered = filterRooms(rooms, { floor: '4' });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].code).toBe('411');
      expect(filtered[0].floor_level).toBe(4);
    });

    it('parses floor values accurately with parseFloorValue', () => {
      expect(parseFloorValue('0')).toBe(0);
      expect(parseFloorValue('ground')).toBe(0);
      expect(parseFloorValue('Ground')).toBe(0);
      expect(parseFloorValue('1')).toBe(1);
      expect(parseFloorValue('first')).toBe(1);
      expect(parseFloorValue('2')).toBe(2);
      expect(parseFloorValue('second')).toBe(2);
      expect(parseFloorValue('3')).toBe(3);
      expect(parseFloorValue('third')).toBe(3);
      expect(parseFloorValue('4')).toBe(4);
      expect(parseFloorValue('fourth')).toBe(4);
      expect(parseFloorValue('all')).toBeNull();
      expect(parseFloorValue('invalid')).toBeNull();
      expect(parseFloorValue(null)).toBeNull();
    });

    it('filters using named floor strings like "ground" or "first"', () => {
      const rooms = getRoomsForDayAndPeriod(1, 1);
      expect(filterRooms(rooms, { floor: 'ground' })).toHaveLength(0);
      expect(filterRooms(rooms, { floor: 'first' })).toHaveLength(22);
      expect(filterRooms(rooms, { floor: 'second' })).toHaveLength(15);
      expect(filterRooms(rooms, { floor: 'third' })).toHaveLength(25);
      expect(filterRooms(rooms, { floor: 'fourth' })).toHaveLength(1);
    });

    it('returns all 63 rooms when floor is "all" or undefined', () => {
      const rooms = getRoomsForDayAndPeriod(1, 1);
      expect(filterRooms(rooms, { floor: 'all' })).toHaveLength(63);
      expect(filterRooms(rooms, {})).toHaveLength(63);
    });
  });

  describe('AC and Charging-Point Filters', () => {
    it('filters AC rooms correctly (35 rooms with AC, 28 non-AC)', () => {
      const rooms = getRoomsForDayAndPeriod(1, 1);
      const acRooms = filterRooms(rooms, { ac: 'true' });
      const nonAcRooms = filterRooms(rooms, { ac: 'false' });

      expect(acRooms).toHaveLength(35);
      expect(nonAcRooms).toHaveLength(28);
      expect(acRooms.every((r) => r.has_ac === true)).toBe(true);
      expect(nonAcRooms.every((r) => r.has_ac === false)).toBe(true);

      // Verify display names of AC rooms contain [AC] as per rule
      expect(acRooms.every((r) => r.name.includes('[AC]'))).toBe(true);
    });

    it('filters charging point rooms correctly (35 rooms with charging points)', () => {
      const rooms = getRoomsForDayAndPeriod(1, 1);
      const chargingRooms = filterRooms(rooms, { charging: 'true' });
      const noChargingRooms = filterRooms(rooms, { charging: 'false' });

      expect(chargingRooms).toHaveLength(35);
      expect(noChargingRooms).toHaveLength(28);
      expect(chargingRooms.every((r) => r.has_charging_points === true)).toBe(true);
      expect(noChargingRooms.every((r) => r.has_charging_points === false)).toBe(true);
    });

    it('combines floor, AC, and charging filters correctly', () => {
      const rooms = getRoomsForDayAndPeriod(1, 1);
      // Floor 1 has 22 rooms total: let's check how many AC
      const floor1Ac = filterRooms(rooms, { floor: '1', ac: 'true' });
      expect(floor1Ac.length).toBeGreaterThan(0);
      expect(floor1Ac.every((r) => r.floor_level === 1 && r.has_ac && r.has_charging_points)).toBe(true);
    });
  });

  describe('Room Availability & Day/Period Selection', () => {
    it('parses day selection accurately (defaults to 1)', () => {
      expect(parseDaySelection('1')).toBe(1);
      expect(parseDaySelection('Mon')).toBe(1);
      expect(parseDaySelection('Monday')).toBe(1);
      expect(parseDaySelection('2')).toBe(2);
      expect(parseDaySelection('Tue')).toBe(2);
      expect(parseDaySelection('6')).toBe(6);
      expect(parseDaySelection('Sat')).toBe(6);
      expect(parseDaySelection(null)).toBe(1);
      expect(parseDaySelection('invalid')).toBe(1);
    });

    it('parses period selection accurately (defaults to 1)', () => {
      expect(parsePeriodSelection('1')).toBe(1);
      expect(parsePeriodSelection('p1')).toBe(1);
      expect(parsePeriodSelection('P5')).toBe(5);
      expect(parsePeriodSelection('7')).toBe(7);
      expect(parsePeriodSelection(null)).toBe(1);
      expect(parsePeriodSelection('invalid')).toBe(1);
    });

    it('calculates free rooms strictly based on is_scheduled_free = true for selected day & period', () => {
      // Day 1 (Mon), Period 1: exactly 7 rooms are free
      const roomsMonP1 = getRoomsForDayAndPeriod(1, 1);
      const freeMonP1 = filterRooms(roomsMonP1, { status: 'free' });
      expect(freeMonP1).toHaveLength(7);
      expect(freeMonP1.every((r) => r.status === 'free' && r.is_free_now === true)).toBe(true);

      // Day 6 (Sat), Period 1: exactly 36 rooms are free
      const roomsSatP1 = getRoomsForDayAndPeriod(6, 1);
      const freeSatP1 = filterRooms(roomsSatP1, { status: 'free' });
      expect(freeSatP1).toHaveLength(36);
      expect(freeSatP1.every((r) => r.status === 'free')).toBe(true);
    });

    it('treats all 82 sametime slots as unavailable (never free)', () => {
      const slots = loadCleanedScheduleSlots();
      const sametimeSlots = slots.filter((s) => s.source_slot_type === 'sametime');
      expect(sametimeSlots).toHaveLength(82);

      // Every single sametime slot must have is_scheduled_free = false
      expect(sametimeSlots.every((s) => s.is_scheduled_free === false)).toBe(true);
      expect(sametimeSlots.every((s) => s.slot_type === 'class')).toBe(true);

      // For every sametime slot, verify the room's status is NOT free for that day/period
      for (const slot of sametimeSlots) {
        const rooms = getRoomsForDayAndPeriod(slot.day_of_week, slot.period_number);
        const room = rooms.find((r) => r.room_id === slot.room_id);
        expect(room).toBeDefined();
        expect(room?.status).not.toBe('free');
        expect(room?.is_free_now).toBe(false);
      }
    });

    it('treats occupied slots (class, lab, lab-continue) as unavailable', () => {
      const slots = loadCleanedScheduleSlots();
      const occupied = slots.filter((s) => s.slot_type !== 'free');
      expect(occupied.every((s) => s.is_scheduled_free === false)).toBe(true);
    });

    it('never marks unknown or missing schedule slots as free', () => {
      // Simulate a synthetic room with NO schedule slots
      const fakeRooms = [
        {
          room_id: 'room_fake_missing',
          room_code: '999',
          display_name: 'Fake Room',
          room_type: 'classroom',
          floor_number: 1,
          floor_inference_method: '',
          floor_confidence: '',
          seating_capacity: 50,
          has_ac: false,
          has_charging_points: false,
          is_student_accessible: null,
          source_room_name: 'Fake Room',
          source_room_type: 'Class',
          source_marked_free_in_room_list: '',
          data_quality_status: '',
        },
      ];

      // Provide an empty slot map
      const emptySlotMap = new Map();
      const result = getRoomsForDayAndPeriod(1, 1, { rooms: fakeRooms, slotMap: emptySlotMap });

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('unknown');
      expect(result[0].is_free_now).toBe(false);
      expect(result[0].free_minutes).toBeNull();

      // Free filter must NOT include it
      const freeFiltered = filterRooms(result, { status: 'free' });
      expect(freeFiltered).toHaveLength(0);
    });

    it('retrieves room details and timetable by slug / code', () => {
      const res = getCleanedRoomBySlug('101', 1, 1);
      expect(res).not.toBeNull();
      expect(res?.room.code).toBe('101');
      expect(res?.room.has_ac).toBe(true);
      expect(res?.room.has_charging_points).toBe(true);
      expect(res?.slots).toHaveLength(7); // 7 periods for Day 1
    });

    it('retrieves room schedule by either room_id or room_code', () => {
      const byId = getCleanedRoomSchedule('room_101', 1);
      const byCode = getCleanedRoomSchedule('101', 1);
      const byCodeLower = getCleanedRoomSchedule('114b', 1);
      const byCodeUpper = getCleanedRoomSchedule('114B', 1);

      expect(byId).toHaveLength(7);
      expect(byCode).toHaveLength(7);
      expect(byId).toEqual(byCode);
      expect(byCodeLower).toHaveLength(7);
      expect(byCodeUpper).toHaveLength(7);
      expect(byCodeLower).toEqual(byCodeUpper);
    });

    it('returns null for unknown room slug without crashing', () => {
      const res = getCleanedRoomBySlug('nonexistent_room', 1, 1);
      expect(res).toBeNull();
    });

    it('handles sorting by free rooms first, capacity, and natural room code', () => {
      const rooms = getRoomsForDayAndPeriod(1, 1);

      // Sort: free first
      const sortedFree = filterRooms(rooms, { sort: 'free' });
      expect(sortedFree[0].status).toBe('free');
      expect(sortedFree[sortedFree.length - 1].status).not.toBe('free');

      // Sort: capacity descending
      const sortedCap = filterRooms(rooms, { sort: 'capacity' });
      for (let i = 0; i < sortedCap.length - 1; i++) {
        expect(sortedCap[i].capacity).toBeGreaterThanOrEqual(sortedCap[i + 1].capacity);
      }

      // Sort: natural code ascending (101, 102, ... 114B, 114C, ... 411)
      const sortedCode = filterRooms(rooms, { sort: 'code' });
      expect(sortedCode[0].code).toBe('101');
      expect(sortedCode[sortedCode.length - 1].code).toBe('411');
    });

    it('combines floor, AC, charging, and free status simultaneously', () => {
      // Day 1, Period 1
      const rooms = getRoomsForDayAndPeriod(1, 1);

      // Filter Floor 3 + AC + Free
      const floor3AcFree = filterRooms(rooms, {
        floor: '3',
        ac: 'true',
        charging: 'true',
        status: 'free',
      });

      expect(
        floor3AcFree.every(
          (r) =>
            r.floor_level === 3 &&
            r.has_ac === true &&
            r.has_charging_points === true &&
            r.status === 'free',
        ),
      ).toBe(true);

      // Filter Ground floor + Free -> always 0 results, no error
      const groundFree = filterRooms(rooms, { floor: '0', status: 'free' });
      expect(groundFree).toHaveLength(0);
    });

    it('verifies free status updates across different periods for the same room', () => {
      // Room 101:
      // Mon P1 (08:45): lab -> NOT free
      // Mon P5 (13:00): free -> free = true
      const roomsP1 = getRoomsForDayAndPeriod(1, 1);
      const room101P1 = roomsP1.find((r) => r.code === '101');
      expect(room101P1?.status).not.toBe('free');
      expect(room101P1?.is_free_now).toBe(false);

      const roomsP5 = getRoomsForDayAndPeriod(1, 5);
      const room101P5 = roomsP5.find((r) => r.code === '101');
      expect(room101P5?.status).toBe('free');
      expect(room101P5?.is_free_now).toBe(true);
    });

    it('verifies exact free room counts across days and periods', () => {
      // Mon (1), P1: 7 free
      const monP1 = filterRooms(getRoomsForDayAndPeriod(1, 1), { status: 'free' });
      expect(monP1).toHaveLength(7);

      // Mon (1), P5: 56 free (lunch break hour)
      const monP5 = filterRooms(getRoomsForDayAndPeriod(1, 5), { status: 'free' });
      expect(monP5).toHaveLength(56);

      // Sat (6), P1: 36 free
      const satP1 = filterRooms(getRoomsForDayAndPeriod(6, 1), { status: 'free' });
      expect(satP1).toHaveLength(36);

      // Sat (6), P7: 60 free
      const satP7 = filterRooms(getRoomsForDayAndPeriod(6, 7), { status: 'free' });
      expect(satP7).toHaveLength(60);
    });

    it('guarantees that every free room in getRoomsForDayAndPeriod has explicit is_scheduled_free = true', () => {
      for (let day = 1; day <= 6; day++) {
        for (let period = 1; period <= 7; period++) {
          const rooms = getRoomsForDayAndPeriod(day, period);
          const free = filterRooms(rooms, { status: 'free' });

          for (const r of free) {
            expect(r.status).toBe('free');
            expect(r.is_free_now).toBe(true);
            expect(r.free_minutes).toBeGreaterThan(0);
          }
        }
      }
    });

    it('handles contradictory or impossible filter criteria gracefully with empty results', () => {
      const rooms = getRoomsForDayAndPeriod(1, 1);
      // Floor 4 has only 1 room (411), which has AC=false, Charging=false
      const floor4WithAc = filterRooms(rooms, { floor: '4', ac: 'true' });
      expect(floor4WithAc).toHaveLength(0);

      const floor4WithCharging = filterRooms(rooms, { floor: '4', charging: 'true' });
      expect(floor4WithCharging).toHaveLength(0);

      // Ground floor has 0 rooms
      const groundFloor = filterRooms(rooms, { floor: '0' });
      expect(groundFloor).toHaveLength(0);
    });

    it('generates accurate weekly timetable summary for all 6 days (Mon-Sat) and 7 periods (P1-P7)', () => {
      const summary = getWeeklyTimetableSummary();

      // Check all 6 days exist
      for (let day = 1; day <= 6; day++) {
        expect(summary[day]).toBeDefined();
        for (let p = 1; p <= 7; p++) {
          const slot = summary[day][p];
          expect(slot).toBeDefined();
          expect(slot.dayNumber).toBe(day);
          expect(slot.periodNumber).toBe(p);
          expect(slot.totalRooms).toBe(63);
          expect(slot.freeCount + slot.busyCount).toBe(63);
          expect(slot.freeRooms.length).toBe(slot.freeCount);
        }
      }

      // Monday P1 should have exactly 7 free
      expect(summary[1][1].freeCount).toBe(7);
      // Monday P5 should have exactly 56 free
      expect(summary[1][5].freeCount).toBe(56);
      // Saturday P5 should have exactly 63 free
      expect(summary[6][5].freeCount).toBe(63);
    });
  });
});

