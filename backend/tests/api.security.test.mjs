// Integration tests for auth, authorization, moderation and account deletion.
// Run against a running API + seeded database:
//   npm run dev --prefix backend        (in another terminal)
//   npm test --prefix backend
// Set API_URL to test another environment (never point this at production data).
import test from 'node:test';
import assert from 'node:assert/strict';

const API = process.env.API_URL || 'http://localhost:5000/api';
const stamp = Date.now().toString().slice(-7);

async function call(method, path, { token, body, headers } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers },
    body: body && method !== 'GET' ? JSON.stringify(body) : undefined
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, json };
}

async function register(tag) {
  const phone = `9${stamp}${tag}`.slice(0, 10).padEnd(10, '0');
  const r = await call('POST', '/auth/register', {
    body: { name: `Test ${tag}`, phone, password: 'Passw0rd!x', city: 'Pune' }
  });
  assert.equal(r.status, 201, JSON.stringify(r.json));
  return { ...r.json, phone };
}

const state = { cleanup: [] };

test('setup: two members + admin login', async () => {
  state.a = await register('1');
  state.b = await register('2');
  state.cleanup.push(state.a.phone, state.b.phone);
  const admin = await call('POST', '/auth/login', { body: { identifier: 'M1001', password: 'password123' } });
  assert.equal(admin.status, 200);
  state.admin = admin.json;
});

test('login: not found vs wrong password vs missing password', async () => {
  assert.equal((await call('POST', '/auth/login', { body: { identifier: 'nobody@x.com', password: 'x' } })).json.code, 'USER_NOT_FOUND');
  const wrong = await call('POST', '/auth/login', { body: { identifier: state.a.phone, password: 'wrong' } });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.json.code, 'INVALID_PASSWORD');
  const none = await call('POST', '/auth/login', { body: { identifier: state.a.phone } });
  assert.equal(none.status, 401);
});

test('register: weak password and duplicate are rejected', async () => {
  assert.equal((await call('POST', '/auth/register', { body: { name: 'x', phone: '9000000099', password: '123' } })).json.code, 'WEAK_PASSWORD');
  assert.equal((await call('POST', '/auth/register', { body: { name: 'x', phone: state.a.phone, password: 'Passw0rd!x' } })).status, 409);
});

test('unauthenticated writes are rejected', async () => {
  for (const [m, p] of [
    ['POST', '/community/posts'], ['POST', '/businesses'], ['POST', '/jobs'], ['POST', '/events'],
    ['POST', '/sangam/referrals'], ['PUT', '/members/M1001'], ['POST', '/admin/verify-member/M1002'],
    ['POST', '/quiz/submit'], ['POST', '/doctors'], ['GET', '/bank/loans'], ['GET', '/members'], ['GET', '/admin/metrics']
  ]) {
    const r = await call(m, p, { body: {} });
    assert.equal(r.status, 401, `${m} ${p} -> ${r.status}`);
  }
});

test('members cannot use staff/admin endpoints or escalate privileges', async () => {
  const t = state.a.token;
  assert.equal((await call('GET', '/admin/metrics', { token: t })).status, 403);
  assert.equal((await call('GET', '/admin/reports', { token: t })).status, 403);
  assert.equal((await call('POST', '/admin/verify-member/M1002', { token: t, body: { status: true } })).status, 403);
  assert.equal((await call('POST', '/events', { token: t, body: { title: 't', date: '2030-01-01', venue: 'v' } })).status, 403);
  // Editing someone else's profile is forbidden
  assert.equal((await call('PUT', `/members/${state.b.member.id}`, { token: t, body: { name: 'hacked' } })).status, 403);
  // role/tier in the body are ignored on self-update
  const self = await call('PUT', `/members/${state.a.member.id}`, { token: t, body: { about: 'hi', role: 'admin', tier: 'Platinum' } });
  assert.equal(self.status, 200);
  assert.equal(self.json.member.role, 'member');
  assert.equal(self.json.member.tier, 'Basic');
});

test('member contact details are private', async () => {
  const other = await call('GET', `/members/${state.b.member.id}`, { token: state.a.token });
  assert.equal(other.status, 200);
  assert.equal(other.json.member.phone, undefined);
  const own = await call('GET', `/members/${state.a.member.id}`, { token: state.a.token });
  assert.equal(own.json.member.phone, state.a.phone);
});

test('posts use the token identity, likes are deduplicated', async () => {
  const p = await call('POST', '/community/posts', {
    token: state.a.token, body: { text: 'hello', author_id: 'M1001', author_name: 'Impostor' }
  });
  assert.equal(p.status, 201);
  assert.equal(p.json.post.author_id, state.a.member.id);
  assert.notEqual(p.json.post.author_name, 'Impostor');
  state.postId = p.json.post.id;
  const l1 = await call('POST', `/community/posts/${state.postId}/like`, { token: state.b.token });
  const l2 = await call('POST', `/community/posts/${state.postId}/like`, { token: state.b.token });
  assert.equal(l1.json.likes_count, 1);
  assert.equal(l2.json.likes_count, 0); // toggled off, not double counted
});

test('report + block + moderation flow', async () => {
  const bad = await call('POST', '/community/report', { token: state.b.token, body: { target_type: 'post', target_id: state.postId, reason: 'nonsense' } });
  assert.equal(bad.status, 400);
  const rep = await call('POST', '/community/report', { token: state.b.token, body: { target_type: 'post', target_id: state.postId, reason: 'spam' } });
  assert.equal(rep.status, 201);

  // Block hides the other user's content from the feed
  assert.equal((await call('POST', `/community/blocks/${state.a.member.id}`, { token: state.b.token })).status, 201);
  const feed = await call('GET', '/community/posts', { token: state.b.token });
  assert.ok(!feed.json.posts.some((x) => x.id === state.postId), 'blocked author still visible');
  assert.equal((await call('DELETE', `/community/blocks/${state.a.member.id}`, { token: state.b.token })).status, 200);

  // Staff sees the report and hides the post
  const queue = await call('GET', '/admin/reports?status=open', { token: state.admin.token });
  const mine = queue.json.reports.find((r) => r.target_id === state.postId);
  assert.ok(mine, 'report missing from queue');
  const resolve = await call('POST', `/admin/reports/${mine.id}/resolve`, { token: state.admin.token, body: { action: 'hide_content', note: 'test' } });
  assert.equal(resolve.status, 200);
  const feed2 = await call('GET', '/community/posts');
  assert.ok(!feed2.json.posts.some((x) => x.id === state.postId), 'hidden post still public');
  const logs = await call('GET', '/admin/audit-logs', { token: state.admin.token });
  assert.ok(logs.json.logs.some((l) => l.action === 'resolve_report'), 'moderation action not audited');
});

test('refresh token rotation, reuse detection and logout', async () => {
  const login = await call('POST', '/auth/login', { body: { identifier: state.a.phone, password: 'Passw0rd!x' } });
  const r1 = login.json.refreshToken;
  const rot = await call('POST', '/auth/refresh', { body: { refreshToken: r1 } });
  assert.equal(rot.status, 200);
  assert.ok(rot.json.token && rot.json.refreshToken && rot.json.refreshToken !== r1);
  // Re-using the rotated token is treated as theft: everything is revoked
  assert.equal((await call('POST', '/auth/refresh', { body: { refreshToken: r1 } })).status, 401);
  assert.equal((await call('POST', '/auth/refresh', { body: { refreshToken: rot.json.refreshToken } })).status, 401);

  const fresh = await call('POST', '/auth/login', { body: { identifier: state.a.phone, password: 'Passw0rd!x' } });
  await call('POST', '/auth/logout', { body: { refreshToken: fresh.json.refreshToken } });
  assert.equal((await call('POST', '/auth/refresh', { body: { refreshToken: fresh.json.refreshToken } })).status, 401);
});

test('suspended members lose access immediately', async () => {
  const c = await register('3');
  state.cleanup.push(c.phone);
  assert.equal((await call('POST', `/admin/members/${c.member.id}/suspend`, { token: state.admin.token })).status, 200);
  assert.equal((await call('GET', '/auth/me', { token: c.token })).status, 403);
  assert.equal((await call('POST', '/auth/login', { body: { identifier: c.phone, password: 'Passw0rd!x' } })).status, 403);
  assert.equal((await call('POST', '/auth/refresh', { body: { refreshToken: c.refreshToken } })).status, 401);
  await call('POST', `/admin/members/${c.member.id}/unsuspend`, { token: state.admin.token });
});

test('donations cannot be faked', async () => {
  const r = await call('POST', '/donations/donate', { token: state.a.token, body: { amount: 5000, campaign_id: 'C01' } });
  assert.equal(r.status, 503);
});

test('errors never leak internals', async () => {
  const bad = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{oops' });
  assert.equal(bad.status, 400);
  const nf = await call('GET', '/does-not-exist');
  assert.equal(nf.status, 404);
  assert.equal(nf.json.stack, undefined);
});

test('login brute force is rate limited', async () => {
  const victim = await register('5');
  state.cleanup.push(victim.phone);
  let last;
  for (let i = 0; i < 10; i++) last = await call('POST', '/auth/login', { body: { identifier: victim.phone, password: 'bad' } });
  assert.equal(last.status, 429);
});

test('account deletion: wrong password / no confirmation are refused', async () => {
  const c = await register('4');
  assert.equal((await call('DELETE', '/auth/account', { token: c.token, body: { password: 'Passw0rd!x' } })).json.code, 'CONFIRMATION_REQUIRED');
  assert.equal((await call('DELETE', '/auth/account', { token: c.token, body: { password: 'nope', confirm: 'DELETE' } })).status, 401);
  state.c = c;
});

test('account deletion end-to-end', async () => {
  const d = state.c;
  // Create data across tables for this member
  const post = await call('POST', '/community/posts', { token: d.token, body: { text: 'to be deleted' } });
  assert.equal(post.status, 201);
  await call('POST', `/community/posts/${post.json.post.id}/comments`, { token: d.token, body: { text: 'c' } });
  await call('POST', '/community/groups/G01/join', { token: d.token });
  await call('POST', `/community/blocks/${state.b.member.id}`, { token: d.token });
  const biz = await call('POST', '/businesses', { token: d.token, body: { name: 'Del Biz', cat: 'it' } });
  assert.equal(biz.status, 201);
  const ref = await call('POST', '/sangam/referrals', { token: d.token, body: { title: 'r', client_name: 'client', recipient_id: state.b.member.id } });
  assert.equal(ref.status, 201);

  const del = await call('DELETE', '/auth/account', { token: d.token, body: { password: 'Passw0rd!x', confirm: 'DELETE' } });
  assert.equal(del.status, 200, JSON.stringify(del.json));

  // Session and identity are gone
  assert.equal((await call('GET', '/auth/me', { token: d.token })).status, 401);
  assert.equal((await call('POST', '/auth/login', { body: { identifier: d.phone, password: 'Passw0rd!x' } })).json.code, 'USER_NOT_FOUND');
  assert.equal((await call('POST', '/auth/refresh', { body: { refreshToken: d.refreshToken } })).status, 401);
  // Content is gone; shared records are anonymised, not orphaned with PII
  const feed = await call('GET', '/community/posts');
  assert.ok(!feed.json.posts.some((p) => p.id === post.json.post.id));
  const bizGet = await call('GET', `/businesses/${biz.json.business.id}`);
  assert.equal(bizGet.status, 404);
  const refs = await call('GET', '/sangam/referrals', { token: state.b.token });
  const kept = refs.json.referrals.find((r) => r.id === ref.json.referral.id);
  assert.equal(kept.giver_id, 'deleted');
  assert.equal(kept.giver_name, 'Deleted member');
  // The phone number can be registered again
  assert.equal((await call('POST', '/auth/register', { body: { name: 'Again', phone: d.phone, password: 'Passw0rd!x' } })).status, 201);
  state.cleanup.push(d.phone);
});

test('cleanup: remove test members', async () => {
  for (const phone of state.cleanup) {
    const login = await call('POST', '/auth/login', { body: { identifier: phone, password: 'Passw0rd!x' } });
    if (login.status !== 200) continue; // e.g. rate-limited victim: removed by the DB reset
    const r = await call('DELETE', '/auth/account', { token: login.json.token, body: { password: 'Passw0rd!x', confirm: 'DELETE' } });
    assert.equal(r.status, 200);
  }
});
