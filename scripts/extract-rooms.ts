/**
 * Phase 1 — data extraction.
 *
 * Reads the legacy `src/data/rooms.ts` (one flat 52-room array with
 * `todaySchedule`, `amenities: string[]`, `bestFor: string[]`) and emits
 * `supabase/seed.rooms.json` shaped exactly like the schema in
 * `supabase/migrations/`.
 *
 * Design rules applied here:
 *   - UUIDs are DETERMINISTIC (UUIDv5) so re-running is idempotent and the
 *     seed can be applied with `on conflict (id) do update`.
 *   - We import only FACTS. `currentOccupancy`, `crowdLevel` and `acStatus`
 *     are deliberately NOT imported as room properties: occupancy/crowd are a
 *     function of time (derived in 0003_views.sql) and comfort is a
 *     crowdsourced check-in measurement, not a fixed attribute.
 *   - `acStatus` DOES carry a real fact inside it — the setpoint temperature
 *     ("Optimal (21°C)" -> 21). That extraction happens explicitly below.
 *   - Anything we cannot map is recorded in `warnings`, never invented.
 *
 * Run:  npx tsx scripts/extract-rooms.ts
 */

import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';

import { JAIN_ROOMS, type Room } from '../src-legacy/data/rooms';

// ---------------------------------------------------------------------------
// Deterministic UUIDv5
// ---------------------------------------------------------------------------

/** Stable namespace for this project. Never change it or all IDs change. */
const NAMESPACE = '6f1d9e2a-3c54-4b7e-9a11-0d5f8c2b7e40';

function uuidv5(name: string): string {
  const ns = Buffer.from(NAMESPACE.replace(/-/g, ''), 'hex');
  const digest = createHash('sha1')
    .update(Buffer.concat([ns, Buffer.from(name, 'utf8')]))
    .digest();
  const b = Buffer.from(digest.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x50; // version 5
  b[8] = (b[8] & 0x3f) | 0x80; // RFC 4122 variant
  const h = b.toString('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

// ---------------------------------------------------------------------------
// Enum mapping (legacy display strings -> schema enums)
// ---------------------------------------------------------------------------

const CATEGORY: Record<string, string> = {
  'Smart Classroom': 'smart_classroom',
  'Computer / Tech Lab': 'computer_lab',
  'Silent Study Pod': 'silent_study_pod',
  'Seminar Amphitheatre': 'seminar_amphitheatre',
  'Design & Innovation Studio': 'innovation_studio',
};

const WING: Record<string, string> = {
  'West Wing': 'west',
  'Central Block': 'central',
  'East Wing': 'east',
};

const NOISE: Record<string, string> = {
  'Silent Study': 'silent',
  'Moderate / Group Work': 'moderate',
  'Collaborative Buzz': 'collaborative',
  'Quick Break': 'quick_break',
};

/**
 * `wifiStrength` is qualitative; the schema wants a band. Only ONE of the four
 * values actually names a frequency, so we map that one and leave the other
 * three NULL rather than invent a band. The original label is preserved in
 * `wifi_label_raw` so nothing is lost.
 */
const WIFI_BAND: Record<string, string | null> = {
  'Ultra-fast (6GHz)': 'wifi_6e',
  Excellent: null,
  Good: null,
  Fair: null,
};

const SLOT_KIND = new Set(['lecture', 'lab', 'tutorial', 'workshop', 'seminar']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const roomSlug = (code: string) => code.toLowerCase().replace(/[^a-z0-9]+/g, '');

/** "Optimal (21°C)" | "Chilled (19°C)" -> 21 | 19 | null */
function parseSetpoint(acStatus: string): number | null {
  const m = /\(\s*(-?\d+(?:\.\d+)?)\s*°?\s*C\s*\)/i.exec(acStatus);
  return m ? Number(m[1]) : null;
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
/** "08:30" -> "08:30:00" (schema is `time`) */
function toSqlTime(hhmm: string): string | null {
  if (!TIME_RE.test(hhmm)) return null;
  return `${hhmm}:00`;
}

const warnings: string[] = [];

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

// Blocks come from the `block` field ("Block A" -> code "A").
const blockCodes = [...new Set(JAIN_ROOMS.map((r) => r.block))].sort();
const blocks = blockCodes.map((b) => {
  const code = b.replace(/^Block\s+/i, '').toUpperCase();
  return { id: uuidv5(`block:${code}`), code, name: `Block ${code}` };
});
const blockIdByLabel = new Map(blockCodes.map((b, i) => [b, blocks[i].id]));

// Floors are per (block, level) since the schema has `unique (block_id, level)`.
const floorKey = (blockId: string, level: number) => `${blockId}:${level}`;
const floors = new Map<string, { id: string; block_id: string; level: number; label: string }>();
for (const r of JAIN_ROOMS) {
  const blockId = blockIdByLabel.get(r.block)!;
  const key = floorKey(blockId, r.floor);
  if (!floors.has(key)) {
    floors.set(key, {
      id: uuidv5(`floor:${blockId}:${r.floor}`),
      block_id: blockId,
      level: r.floor,
      label: r.floorLabel,
    });
  }
}

const features = new Map<string, { id: string; slug: string; label: string; kind: string }>();
const roomFeatures: { room_id: string; feature_id: string }[] = [];
const faculty = new Map<string, { id: string; full_name: string }>();
const courses = new Map<string, { id: string; code: string; title: string }>();
const timetable_slots: Record<string, unknown>[] = [];

function featureIdFor(slug: string, label: string, kind: 'amenity' | 'best_for') {
  const key = `${kind}:${slug}`;
  if (!features.has(key)) {
    features.set(key, { id: uuidv5(`feature:${key}`), slug, label, kind });
  }
  return features.get(key)!.id;
}

/**
 * Canonical AMENITY vocabulary.
 *
 * The legacy dataset has 147 distinct amenity strings, nearly all of them
 * one-off catalogue copy ("30 High-Power Workstations", "PyTorch /
 * Transformers Environments"). Emitting one `features` row per string gives
 * 147 rows and makes the table useless for its stated job — answering "which
 * rooms have a smart board?" without a string scan.
 *
 * So each string is mapped onto a small controlled vocabulary by keyword.
 * ALL matching rules apply (an amenity really can be both a projector and a
 * smart board); unmatched strings are reported, never silently dropped.
 */
const AMENITY_RULES: ReadonlyArray<readonly [string, string, RegExp]> = [
  ['air_conditioning', 'Air conditioning', /(\bac\b|climate control|air condition|high-ventilation)/i],
  ['smart_board', 'Smart / interactive board', /(smart (board|screen|touch|interactive|display|podium)|interactive (touch|smart)|touch screen|presentation screen)/i],
  ['projector', 'Projector', /projector/i],
  ['whiteboard', 'Whiteboard', /whiteboard/i],
  ['power_access', 'Power sockets', /(socket|outlet|multi-?plug|power point)/i],
  ['tiered_seating', 'Tiered / stepped seating', /(tiered|stepped)/i],
  ['private_carrel', 'Private carrel', /carrel/i],
  ['conference_table', 'Conference table', /conference table/i],
  ['presentation_stage', 'Presentation stage', /(demo stage|\bstage\b)/i],
  ['interview_pod', 'Interview pod', /interview pod/i],
  ['isolated_network', 'Isolated / cyber-range network', /(isolated|cyber range)/i],
  ['audio_system', 'Audio / PA system', /(surround|mic podium|speaker|sound system)/i],
  ['soundproofing', 'Acoustic treatment', /(sound insulat|acoustic|noise (isolating|absorbing)|soundproof|double glazed)/i],
  ['natural_light', 'Natural daylight', /(natural daylight|natural light|daylight)/i],
  ['wifi', 'High-speed Wi-Fi', /(wi-?fi|fiber|gigabit|ethernet)/i],
  ['workstation_display', 'Displays / workstations', /(workstation|dual (monitor|display|4k|screen)|monitors?|displays?|screens?|desk lamp|keyboard)/i],
  ['specialist_hardware', 'Specialist lab hardware', /(3d printer|robotic|soldering|logic analyz|trainer kit|simulator|wacom|device hub|circuit)/i],
  ['specialist_software', 'Specialist software', /(autocad|solidworks|node\.js|react|pytorch|transformers|aws|postgres|oracle|selenium|jenkins|flutter|swift|spring boot|linux|docker|hadoop|spark|kubernetes|k8s|qiskit|solidity|web3|\bsdks?\b)/i],
  ['data_pipeline', 'Data / time-series feeds', /(time-series|\bfeeds?\b)/i],
  ['vr_equipment', 'VR / AR equipment', /(\bvr\b|virtual reality|meta quest)/i],
  ['scenic_view', 'Scenic view / terrace', /(panoramic|terrace|scenic|\bview\b)/i],
  ['spacious_desks', 'Spacious / modular desks', /(wide desk|spacious|modular|hexagon)/i],
  ['ergonomic_seating', 'Ergonomic seating', /(ergonomic|cushioned|padded|mesh chair|swivel|sofa|bench)/i],
  ['high_ceilings', 'High ceilings', /high ceiling/i],
  // Derivable from the timetable (zero rows = no fixed classes), but shown as
  // a badge because "this room is effectively always free" is the single most
  // useful fact a student can be told.
  ['no_fixed_classes', 'No fixed scheduled classes', /zero scheduled lectures/i],
  ['near_canteen', 'Near canteen', /canteen/i],
];

/**
 * Canonical BEST-FOR vocabulary — the use-case tags the matcher scores on.
 * 155 raw phrases collapse to these.
 */
const BEST_FOR_RULES: ReadonlyArray<readonly [string, string, RegExp]> = [
  ['deep_focus', 'Deep focus / silent study', /(pin-?drop|zero distraction|no distraction|deep (silent )?(focus|reading|work)|silent (study|reading|focus)|focus study|focus work|all-day focus|extreme quiet|uninterrupted|\bquiet\b)/i],
  ['exam_revision', 'Exam revision', /(exam (revision|cramming|prep)|cramming|revision)/i],
  ['group_work', 'Group work / teamwork', /(group|team|brainstorm|miro|meeting|discussion|collaborat)/i],
  ['coding', 'Coding / development', /(coding|programming|leetcode|codeforces|development|developer|c\/c\+\+|linux kernel|assembly|embedded|next\.js|web dev|ai\/nlp|backend|full-?stack|database design|docker|spring|github)/i],
  ['charging', 'Charging / power-hungry devices', /(charg|recharge|power-?hungry|high-?power|high-?current)/i],
  ['presentations', 'Presentations / rehearsals', /(presentation|slide|rehearsal|dry run|pitch|talks)/i],
  ['hardware_lab', 'Hardware / prototyping', /(hardware|sensor|circuit|robotic|microcontroller|3d modeling|rendering)/i],
  ['interviews', 'Interviews / placement prep', /(interview|placement|resume)/i],
  ['reading_writing', 'Reading & writing', /(reading|writing|note (taking|revision)|assignment|thesis|math|graph theory|research)/i],
  ['audio_study', 'Audio / video study', /(listening|podcast|audio|headphone)/i],
  ['cybersecurity', 'Cybersecurity practice', /(cybersecurity|ctf|cyber)/i],
  ['cloud_devops', 'Cloud & DevOps', /(cloud|deployment|certification)/i],
  ['comfort_break', 'Comfortable breaks', /(staying cool|comfortable|short 30m break|quick (recharge|food)|between lectures|relax)/i],
  ['solo_study', 'Solo study', /(solo|individual|1-?on-?1)/i],
  ['design_prototyping', 'Design & prototyping', /(prototyping|ui\/ux|design thinking|figma|wirefram|ui design)/i],
  ['laptop_work', 'Laptop work', /laptop/i],
  ['heavy_compute', 'Heavy compute / ML', /(heavy comput|machine learning|model training|big data|data analysis|data pipeline|sequence analysis)/i],
  ['software_testing', 'Software testing', /(testing|\btest\b)/i],
  ['quant_finance', 'Quantitative finance', /(quantitative|financ)/i],
  ['blockchain', 'Blockchain / Web3', /(smart contract|web3|solidity|blockchain)/i],
  ['game_dev', 'Game development', /(game dev|unity|unreal)/i],
  ['vr_ar', 'VR / AR', /(\bvr\b|virtual reality|augmented reality)/i],
  ['scenic_study', 'Study with a view', /(scenic|daylight|\bview\b)/i],
];

/** Raw strings that matched no rule — must be reviewed, not ignored. */
const unmapped = { amenity: new Set<string>(), best_for: new Set<string>() };
const coverage = { amenity: { hit: 0, total: 0 }, best_for: { hit: 0, total: 0 } };

function canonicalise(
  raw: string,
  rules: ReadonlyArray<readonly [string, string, RegExp]>,
  kind: 'amenity' | 'best_for',
): string[] {
  coverage[kind].total++;
  const hits = rules.filter(([, , re]) => re.test(raw));
  if (hits.length === 0) {
    unmapped[kind].add(raw);
    return [];
  }
  coverage[kind].hit++;
  return hits.map(([slug, label]) => featureIdFor(slug, label, kind));
}

const rooms: Record<string, unknown>[] = [];
const infrastructure: Record<string, unknown>[] = [];
const seenCodes = new Set<string>();
const seenSlugs = new Set<string>();

for (const r of JAIN_ROOMS as Room[]) {
  if (!r.code || !r.name) throw new Error(`Room missing code/name: ${JSON.stringify(r.id)}`);
  if (seenCodes.has(r.code)) throw new Error(`Duplicate room code: ${r.code}`);
  seenCodes.add(r.code);

  const slug = roomSlug(r.code);
  if (seenSlugs.has(slug)) throw new Error(`Slug collision: ${r.code} -> ${slug}`);
  seenSlugs.add(slug);

  const blockId = blockIdByLabel.get(r.block);
  if (!blockId) throw new Error(`Unknown block "${r.block}" on ${r.code}`);
  const floorId = floors.get(floorKey(blockId, r.floor))!.id;
  const roomId = uuidv5(`room:${r.code}`);

  const category = CATEGORY[r.category];
  if (!category) throw new Error(`Unmapped category "${r.category}" on ${r.code}`);
  const wing = WING[r.wing];
  if (!wing) throw new Error(`Unmapped wing "${r.wing}" on ${r.code}`);
  const noise = NOISE[r.noiseVibe];
  if (!noise) throw new Error(`Unmapped noiseVibe "${r.noiseVibe}" on ${r.code}`);
  if (!(r.wifiStrength in WIFI_BAND)) {
    throw new Error(`Unmapped wifiStrength "${r.wifiStrength}" on ${r.code}`);
  }

  rooms.push({
    id: roomId,
    code: r.code,
    slug,
    name: r.name,
    block_id: blockId,
    floor_id: floorId,
    wing,
    category,
    capacity: r.capacity,
    description: r.description ?? null,
    directions: null,
    map_x: null,
    map_y: null,
    map_w: null,
    map_h: null,
    is_accessible: true,
    is_bookable: false,
    is_active: true,
    // Display-only catalogue copy, kept verbatim so the room detail page can
    // still say '75" Interactive Touch Screen' instead of a generic tag.
    catalog_amenities: r.amenities ?? [],
    catalog_best_for: r.bestFor ?? [],
  });

  if (r.chargingPoints > r.totalSockets) {
    warnings.push(`${r.code}: chargingPoints (${r.chargingPoints}) > totalSockets (${r.totalSockets}); clamped`);
  }

  infrastructure.push({
    room_id: roomId,
    sockets_total: r.totalSockets,
    sockets_working: Math.min(r.chargingPoints, r.totalSockets),
    has_ac: r.hasAC,
    ac_type: r.acType ?? null,
    ac_setpoint_c: parseSetpoint(r.acStatus ?? ''),
    has_projector: r.hasProjector,
    has_smart_board: r.hasSmartBoard,
    has_whiteboard: false,
    has_natural_light: false,
    wifi_band: WIFI_BAND[r.wifiStrength],
    wifi_mbps: null,
    wifi_label_raw: r.wifiStrength,
    noise_vibe: noise,
    comfort_score: r.comfortScore ?? null,
    last_inspected_at: null,
    inspected_by: null,
  });

  // Canonical tags drive filtering; dedupe because several raw strings can
  // collapse onto the same tag (and room_features has a composite PK).
  const canonicalTags = new Set<string>();
  for (const a of r.amenities ?? []) {
    for (const id of canonicalise(a, AMENITY_RULES, 'amenity')) canonicalTags.add(id);
  }
  for (const b of r.bestFor ?? []) {
    for (const id of canonicalise(b, BEST_FOR_RULES, 'best_for')) canonicalTags.add(id);
  }
  for (const id of canonicalTags) {
    roomFeatures.push({ room_id: roomId, feature_id: id });
  }

  // --- timetable -----------------------------------------------------------
  // The legacy data only knows ONE day ("todaySchedule"). We treat it as the
  // recurring Mon-Fri pattern. This is an explicit, documented assumption.
  for (const slot of r.todaySchedule ?? []) {
    const start = toSqlTime(slot.startTime);
    const end = toSqlTime(slot.endTime);
    if (!start || !end) {
      warnings.push(`${r.code}: unparseable slot time "${slot.startTime}"-${slot.endTime}`);
      continue;
    }
    if (!slot.isOccupied) continue; // free periods are the absence of a slot

    let courseId: string | null = null;
    let facultyId: string | null = null;
    let titleOverride: string | null = null;

    if (slot.courseCode) {
      if (!courses.has(slot.courseCode)) {
        courses.set(slot.courseCode, {
          id: uuidv5(`course:${slot.courseCode}`),
          code: slot.courseCode,
          title: slot.title,
        });
      }
      courseId = courses.get(slot.courseCode)!.id;
    } else {
      titleOverride = slot.title;
    }

    if (slot.faculty) {
      if (!faculty.has(slot.faculty)) {
        faculty.set(slot.faculty, { id: uuidv5(`faculty:${slot.faculty}`), full_name: slot.faculty });
      }
      facultyId = faculty.get(slot.faculty)!.id;
    }

    let kind = SLOT_KIND.has(slot.type) ? slot.type : null;
    if (!kind) {
      warnings.push(`${r.code}: unmapped slot type "${slot.type}", defaulting to 'lecture'`);
      kind = 'lecture';
    }

    for (let dow = 1; dow <= 5; dow++) {
      timetable_slots.push({
        id: uuidv5(`slot:${r.code}:${dow}:${start}`),
        room_id: roomId,
        course_id: courseId,
        faculty_id: facultyId,
        day_of_week: dow,
        start_time: start,
        end_time: end,
        kind,
        batch: slot.batch ?? null,
        title_override: titleOverride,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Validate
// ---------------------------------------------------------------------------

const seedSchema = z.object({
  rooms: z.array(z.object({ code: z.string(), slug: z.string(), capacity: z.number().int().positive() })).length(52),
  infrastructure: z.array(z.object({ room_id: z.string().uuid() })).length(52),
  timetable_slots: z.array(z.object({ day_of_week: z.number().int().min(1).max(7) })),
  // Guard rail: `features` is a CONTROLLED vocabulary. If this ever climbs
  // back toward the source's 302 one-off strings, the run must fail loudly
  // rather than quietly regress into an unqueryable table.
  features: z
    .array(z.object({ slug: z.string(), kind: z.enum(['amenity', 'best_for']) }))
    .max(60, 'features exploded past 60 rows — the vocabulary is no longer controlled'),
  // Every canonical feature must actually be attached to at least one room.
  room_features: z.array(z.object({ room_id: z.string().uuid(), feature_id: z.string().uuid() })).min(1),
});

const payload = {
  generated_at: new Date().toISOString(),
  namespace: NAMESPACE,
  blocks,
  floors: [...floors.values()],
  rooms,
  infrastructure,
  features: [...features.values()],
  room_features: roomFeatures,
  faculty: [...faculty.values()],
  courses: [...courses.values()],
  timetable_slots,
  warnings,
};

seedSchema.parse(payload);

const outPath = resolve('supabase/seed.rooms.json');
writeFileSync(outPath, JSON.stringify(payload, null, 2) + '\n', 'utf8');

// ---------------------------------------------------------------------------
// Report — this is the point of the script: it must PROVE the shape is right.
// ---------------------------------------------------------------------------

const pad = (s: string | number, n: number) => String(s).padEnd(n);

console.log(`\nWrote ${outPath}\n`);
console.log('Counts');
console.log('  rooms            ', rooms.length);
console.log('  infrastructure   ', infrastructure.length);
console.log('  blocks           ', blocks.length);
console.log('  floors           ', floors.size);
console.log('  features         ', features.size);
console.log('  room_features    ', roomFeatures.length);
console.log('  courses          ', courses.size);
console.log('  faculty          ', faculty.size);
console.log('  timetable_slots  ', timetable_slots.length);

console.log('\nBlock x Floor cross-tab (is the grid orthogonal?)');
const tab = new Map<string, number>();
for (const r of rooms) {
  const b = blocks.find((x) => x.id === r.block_id)!.code;
  const key = `${b}|${r.floor_id}`;
  tab.set(key, (tab.get(key) ?? 0) + 1);
}
for (const b of blocks) {
  const row = [...floors.values()]
    .filter((f) => f.block_id === b.id)
    .sort((x, y) => x.level - y.level)
    .map((f) => `L${f.level}=${tab.get(`${b.code}|${f.id}`) ?? 0}`);
  console.log(`  Block ${b.code}: ${row.join('  ')}   total=${JAIN_ROOMS.filter((r) => (r.block.replace(/^Block\s+/i, '').toUpperCase()) === b.code).length}`);
}

console.log('\nWing distribution');
const wings = new Map<string, number>();
for (const r of rooms) wings.set(String(r.wing), (wings.get(String(r.wing)) ?? 0) + 1);
for (const [k, v] of [...wings].sort()) console.log(`  ${pad(k, 12)} ${v}`);

console.log('\nwifi_band mapping (NULL = source did not specify a band)');
const bands = new Map<string, number>();
for (const i of infrastructure) {
  const key = i.wifi_band === null ? `NULL  (raw: ${i.wifi_label_raw})` : String(i.wifi_band);
  bands.set(key, (bands.get(key) ?? 0) + 1);
}
for (const [k, v] of [...bands].sort()) console.log(`  ${pad(k, 24)} ${v}`);
const nullBands = infrastructure.filter((i) => i.wifi_band === null).length;
console.log(`  -> ${nullBands}/52 rooms have no determinable wifi band`);

console.log('\nSetpoint extracted from acStatus');
const setpoints = infrastructure.filter((i) => i.ac_setpoint_c !== null).length;
console.log(`  ${setpoints}/52 rooms yielded a numeric setpoint`);

console.log('\nCanonical feature vocabulary (vs 302 raw strings in the source)');
for (const kind of ['amenity', 'best_for'] as const) {
  const n = [...features.values()].filter((f) => f.kind === kind).length;
  const c = coverage[kind];
  console.log(
    `  ${pad(kind, 10)} ${pad(n, 3)} canonical rows   raw strings matched: ${c.hit}/${c.total}  (${c.total - c.hit} unmapped)`,
  );
}

for (const kind of ['amenity', 'best_for'] as const) {
  if (unmapped[kind].size === 0) continue;
  console.log(`\n  UNMAPPED ${kind} (${unmapped[kind].size}) — each needs a rule or a deliberate skip:`);
  for (const u of [...unmapped[kind]].sort()) console.log(`    - ${u}`);
}

if (warnings.length) {
  console.log(`\nWarnings (${warnings.length})`);
  const counts = new Map<string, number>();
  for (const w of warnings) {
    const k = w.replace(/^\S+:\s*/, '');
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  for (const [k, v] of counts) console.log(`  x${pad(v, 4)} ${k}`);
} else {
  console.log('\nNo warnings.');
}
console.log('');
