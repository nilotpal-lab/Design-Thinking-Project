/**
 * Apply .sql files to the Supabase project via the Management API.
 * No Docker / psql / CLI required — runs anywhere Node runs.
 *
 * Usage:  node scripts/apply-sql.mjs supabase/migrations/0001_init.sql [...]
 * Env:    SUPABASE_PROJECT_REF, SUPABASE_ACCESS_TOKEN (see .env.local)
 */

import { readFileSync } from 'node:fs';

const REF = process.env.SUPABASE_PROJECT_REF;
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!REF || !TOKEN) {
  console.error('Missing SUPABASE_PROJECT_REF or SUPABASE_ACCESS_TOKEN (source .env.local first)');
  process.exit(1);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('usage: node scripts/apply-sql.mjs <file.sql> [more.sql ...]');
  process.exit(1);
}

for (const file of files) {
  const sql = readFileSync(file, 'utf8');
  process.stdout.write(`${file} (${(sql.length / 1024).toFixed(1)} kB) ... `);

  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
    signal: AbortSignal.timeout(180_000),
  }).catch((e) => {
    console.log(`NETWORK ERROR: ${e.message}`);
    process.exit(1);
  });

  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  if (!res.ok || (body && typeof body === 'object' && body.error)) {
    console.log(`FAILED (HTTP ${res.status})`);
    console.log(typeof body === 'string' ? body.slice(0, 2000) : JSON.stringify(body, null, 2).slice(0, 2000));
    process.exit(1);
  }

  const rows = Array.isArray(body) ? body : null;
  console.log(`ok${rows ? ` (${rows.length} rows)` : ''}`);
  if (rows && rows.length > 0 && rows.length <= 30) {
    console.log(JSON.stringify(rows, null, 2));
  }
}
