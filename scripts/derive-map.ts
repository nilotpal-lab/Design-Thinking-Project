/**
 * Derive floor-plan geometry for every room (map_x/y/w/h, percentages 0-100).
 *
 * Layout model: three vertical wing bands per floor — West (left), Center
 * (middle), East (right) — with corridor gaps between them. Rooms stack
 * top-to-bottom within their band in code order. Deterministic, so a re-run
 * always reproduces the same map; edit specific rooms in SQL afterwards if a
 * real floor plan ever differs.
 *
 * Run: npx tsx scripts/derive-map.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';

type SeedRoom = {
  slug: string;
  code: string;
  block_id: string;
  floor_id: string;
  wing: string; // 'west' | 'central' | 'east' (lowercase in source data)
  category: string;
};

const SEED = JSON.parse(readFileSync('supabase/seed.rooms.json', 'utf8')) as {
  rooms: SeedRoom[];
  blocks?: Array<{ id: string; name: string }>;
  floors?: Array<{ id: string; level: number; block_id?: string }>;
};

type Rect = { x: number; y: number; w: number; h: number };

/** Band geometry in percentage space. Corridors are the gaps between bands. */
const BANDS: Record<string, { x: number; w: number }> = {
  West: { x: 2, w: 30 },
  Center: { x: 35, w: 30 },
  East: { x: 68, w: 30 },
};

const GAP = 2.5; // vertical gap between stacked rooms in a band

function bandFor(wing: string): keyof typeof BANDS {
  const w = wing.toLowerCase();
  return w.startsWith('west') ? 'West' : w.startsWith('east') ? 'East' : 'Center';
}

/**
 * Rooms that read as "big" on a floor plan get taller boxes: labs, studios,
 * large classrooms.
 */
function weightFor(code: string, seedRoom?: { category: string }): number {
  const cat = seedRoom?.category ?? '';
  if (/lab|studio|workshop/i.test(cat) || /lab|studio/i.test(code)) return 1.5;
  if (/conference|seminar/i.test(cat)) return 1.2;
  return 1;
}

function main() {
  // Resolve UUID references to human keys via the seed's own lookup tables.
  const blockName = new Map((SEED.blocks ?? []).map((b) => [b.id, b.name]));
  const floorLevel = new Map((SEED.floors ?? []).map((f) => [f.id, f.level]));

  const byFloor = new Map<string, SeedRoom[]>();
  for (const r of SEED.rooms) {
    const block = blockName.get(r.block_id) ?? r.block_id;
    const level = floorLevel.get(r.floor_id);
    if (level === undefined) throw new Error(`No floor row for ${r.slug} (floor_id ${r.floor_id})`);
    const key = `${block}|${level}`;
    const list = byFloor.get(key) ?? [];
    list.push(r);
    byFloor.set(key, list);
  }

  const geometry: Record<string, Rect> = {}; // slug → rect

  for (const [key, rooms] of byFloor) {
    const bands: Record<string, SeedRoom[]> = { West: [], Center: [], East: [] };
    for (const r of rooms) bands[bandFor(r.wing)].push(r);

    for (const [bandName, bandRooms] of Object.entries(bands)) {
      if (bandRooms.length === 0) continue;
      const band = BANDS[bandName];
      const weights = bandRooms.map((r) => weightFor(r.code, r));
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const usableH = 100 - GAP * (bandRooms.length - 1);

      let y = 0;
      bandRooms.forEach((r, i) => {
        // The last room absorbs the rounding remainder so the band ends at
        // exactly 100 instead of drifting past it.
        const h =
          i === bandRooms.length - 1
            ? round1(100 - y)
            : round1((usableH * weights[i]) / totalWeight);
        geometry[r.slug] = { x: band.x, y: round1(y), w: band.w, h };
        y += h + GAP;
      });
    }
    void key;
  }

  writeFileSync('supabase/map-geometry.json', JSON.stringify(geometry, null, 2));
  const count = Object.keys(geometry).length;
  console.log(`Derived geometry for ${count} rooms → supabase/map-geometry.json`);
  if (count !== SEED.rooms.length) throw new Error(`Expected ${SEED.rooms.length}, got ${count}`);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

main();
