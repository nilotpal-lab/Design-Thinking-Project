/**
 * Run a SQL file (argv) or stdin against the project and print result rows.
 * Usage:  node scripts/db-query.mjs file.sql
 *         echo "select 1" | node scripts/db-query.mjs
 */

import { readFileSync } from 'node:fs';

const REF = process.env.SUPABASE_PROJECT_REF;
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!REF || !TOKEN) {
  console.error('Missing SUPABASE_PROJECT_REF or SUPABASE_ACCESS_TOKEN');
  process.exit(1);
}

const sql = process.argv[2] ? readFileSync(process.argv[2], 'utf8') : readFileSync(0, 'utf8');

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql }),
  signal: AbortSignal.timeout(120_000),
});

const text = await res.text();
let body;
try { body = JSON.parse(text); } catch { body = text; }

if (!res.ok || (body && typeof body === 'object' && body.error)) {
  console.error(`FAILED (HTTP ${res.status})`);
  console.error(typeof body === 'string' ? body.slice(0, 3000) : JSON.stringify(body, null, 2).slice(0, 3000));
  process.exit(1);
}

console.log(JSON.stringify(body, null, 2));
