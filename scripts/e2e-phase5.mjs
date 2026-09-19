/**
 * End-to-end test of the Phase 5 data plane, against the LIVE project.
 *
 *  1. Create a confirmed test user (admin API, secret key)
 *  2. Sign in with password (publishable key) -> access token
 *  3. INSERT a check-in as `authenticated` via PostgREST (RLS insert policy)
 *  4. Verify the karma trigger fired (+15)
 *  5. Verify rate limit: second immediate check-in must 409
 *  6. Verify anon cannot insert (401/403)
 *  7. Verify role escalation is impossible (update profiles.role)
 *  8. Delete the test user (cascades profile + check-ins + karma)
 */

const REF = process.env.SUPABASE_PROJECT_REF;
const SECRET = process.env.SUPABASE_SECRET_KEY;
const PUB = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const BASE = `https://${REF}.supabase.co`;

const results = [];
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? '  PASS' : '✗ FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const email = `e2e-${Date.now()}@jainspace-test.local`;
const password = 'e2e-Test-Passw0rd!';

// --- 1. create confirmed user ----------------------------------------------
const created = await fetch(`${BASE}/auth/v1/admin/users`, {
  method: 'POST',
  headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name: 'E2E Tester', usn: 'E2E001' } }),
});
const createdBody = await created.json().catch(() => ({}));
const userId = createdBody.id;
check('admin: create confirmed test user', created.ok && !!userId, created.ok ? userId : JSON.stringify(createdBody).slice(0, 200));

try {
  if (!userId) throw new Error('no user; skipping dependent steps');

  // --- 2. sign in ------------------------------------------------------------
  const signin = await fetch(`${BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: PUB, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const session = await signin.json();
  const token = session.access_token;
  check('auth: password sign-in returns access token', signin.ok && !!token);

  // --- profile trigger --------------------------------------------------------
  const prof = await fetch(`${BASE}/rest/v1/profiles?id=eq.${userId}&select=full_name,usn,role,karma`, {
    headers: { apikey: PUB, Authorization: `Bearer ${token}` },
  });
  const profBody = await prof.json();
  check(
    'trigger: handle_new_user created profile with metadata',
    prof.ok && profBody[0]?.full_name === 'E2E Tester' && profBody[0]?.usn === 'E2E001',
    JSON.stringify(profBody).slice(0, 120),
  );

  // --- room id ----------------------------------------------------------------
  const rooms = await fetch(`${BASE}/rest/v1/rooms?slug=eq.121a&select=id`, {
    headers: { apikey: PUB, Authorization: `Bearer ${token}` },
  });
  const roomId = (await rooms.json())[0]?.id;
  check('reference: room 121a readable by authenticated', !!roomId);

  // --- 3. insert check-in as authenticated -------------------------------------
  const ci = await fetch(`${BASE}/rest/v1/check_ins`, {
    method: 'POST',
    headers: { apikey: PUB, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ room_id: roomId, user_id: userId, crowd_density: 'light', ac_comfort: 'comfortable', purpose: 'study', note: 'E2E probe check-in' }),
  });
  const ciBody = await ci.json();
  check('RLS: authenticated can insert own check-in', ci.ok, ci.ok ? '' : JSON.stringify(ciBody).slice(0, 200));

  // --- 4. karma trigger ----------------------------------------------------------
  const prof2 = await prof.json && await (await fetch(`${BASE}/rest/v1/profiles?id=eq.${userId}&select=karma`, {
    headers: { apikey: PUB, Authorization: `Bearer ${token}` },
  })).json();
  check('trigger: check-in awarded +15 karma', prof2[0]?.karma === 15, `karma=${prof2[0]?.karma}`);

  // --- 5. rate limit ------------------------------------------------------------
  const ci2 = await fetch(`${BASE}/rest/v1/check_ins`, {
    method: 'POST',
    headers: { apikey: PUB, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id: roomId, user_id: userId, crowd_density: 'full' }),
  });
  check('RLS: duplicate check-in within 20 min is rejected', ci2.status === 409, `status=${ci2.status}`);

  // --- 6. anon cannot insert ----------------------------------------------------
  const ci3 = await fetch(`${BASE}/rest/v1/check_ins`, {
    method: 'POST',
    headers: { apikey: PUB, 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id: roomId, user_id: userId, crowd_density: 'empty' }),
  });
  check('RLS: anon cannot insert check-ins', ci3.status === 401 || ci3.status === 403, `status=${ci3.status}`);

  // --- 7. escalation attempts ----------------------------------------------------
  const esc = await fetch(`${BASE}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: { apikey: PUB, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'admin' }),
  });
  check('RLS: authenticated cannot set own role to admin', !esc.ok, `status=${esc.status}`);

  const esc2 = await fetch(`${BASE}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: { apikey: PUB, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ karma: 99999 }),
  });
  check('RLS: authenticated cannot set own karma', !esc2.ok, `status=${esc2.status}`);

  // --- feed view shows the report ------------------------------------------------
  const feed = await fetch(`${BASE}/rest/v1/v_checkin_feed?select=note,display_name&limit=5`, {
    headers: { apikey: PUB },
  });
  const feedBody = await feed.json();
  check('anon: v_checkin_feed exposes the report pseudonymously', feed.ok && feedBody.some((r) => r.note === 'E2E probe check-in'), JSON.stringify(feedBody).slice(0, 120));

  // --- issues data plane ----------------------------------------------------------
  const iss = await fetch(`${BASE}/rest/v1/issues`, {
    method: 'POST',
    headers: { apikey: PUB, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ room_id: roomId, reported_by: userId, category: 'power', title: 'E2E probe socket issue', description: 'E2E probe: two sockets on the north wall are dead.', urgency: 'low' }),
  });
  const issBody = await iss.json();
  check('RLS: authenticated can file an issue (ref assigned)', iss.ok && /^JS-\d+$/.test(issBody[0]?.ref ?? ''), JSON.stringify(issBody).slice(0, 160));

  const prof3 = await (await fetch(`${BASE}/rest/v1/profiles?id=eq.${userId}&select=karma`, {
    headers: { apikey: PUB, Authorization: `Bearer ${token}` },
  })).json();
  check('trigger: issue awarded +25 karma', prof3[0]?.karma === 40, `karma=${prof3[0]?.karma}`);

  // audit trail
  if (issBody[0]?.id) {
    const ev = await fetch(`${BASE}/rest/v1/issue_events?issue_id=eq.${issBody[0].id}&select=event_type,to_status,note`, {
      headers: { apikey: PUB },
    });
    const evBody = await ev.json();
    check('trigger: issues_audit logged the created event', ev.ok && evBody[0]?.event_type === 'created', JSON.stringify(evBody).slice(0, 120));
  }
} finally {
  // --- 8. cleanup -----------------------------------------------------------------
  if (userId) {
    const del = await fetch(`${BASE}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
    });
    console.log(del.ok ? 'cleanup: test user deleted (cascades profile/check-ins/issues)' : `cleanup FAILED: ${del.status}`);
  }
}

const fails = results.filter((r) => !r.pass);
console.log(`\n${results.length - fails.length}/${results.length} passed`);
process.exit(fails.length ? 1 : 0);
