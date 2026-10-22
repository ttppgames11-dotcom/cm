// Integration tests: posting to the general feed, profile photos and post photos.
// Run against a running API (an empty, migrated database is enough):
//   npm run dev --prefix backend        (in another terminal)
//   npm test --prefix backend
// Set API_URL to test another environment (never point this at production data).
import test from 'node:test';
import assert from 'node:assert/strict';

const API = process.env.API_URL || 'http://localhost:5000/api';
const ROOT = API.replace(/\/api\/?$/, '');
const stamp = Date.now().toString().slice(-7);
const PASSWORD = 'Passw0rd!x';

// A real 1x1 PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

async function call(method, path, { token, body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body && method !== 'GET' ? JSON.stringify(body) : undefined
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, json };
}

async function upload(kind, bytes, { token, type = 'image/jpeg' } = {}) {
  const res = await fetch(`${API}/media/${kind}`, {
    method: 'POST',
    headers: { 'content-type': type, ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: bytes
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, json };
}

const picture = (path) => fetch(`${ROOT}${path}`);

async function register(tag) {
  const phone = `8${stamp}${tag}`.slice(0, 10).padEnd(10, '0');
  const r = await call('POST', '/auth/register', { body: { name: `Photo ${tag}`, phone, password: PASSWORD, city: 'Pune' } });
  assert.equal(r.status, 201, JSON.stringify(r.json));
  return r.json;
}

const s = {};

test('setup: two members', async () => {
  s.a = await register('1');
  s.b = await register('2');
});

test('a post without a group goes to the general feed', async () => {
  const r = await call('POST', '/community/posts', { token: s.a.token, body: { text: 'जय शिवराय' } });
  assert.equal(r.status, 201, JSON.stringify(r.json));
  assert.equal(r.json.post.group_id, null);
  s.textPost = r.json.post.id;

  const feed = await call('GET', '/community/posts', { token: s.b.token });
  assert.ok(feed.json.posts.some((p) => p.id === s.textPost), 'another member sees the post');
});

test('an unknown group and an empty post are rejected', async () => {
  const group = await call('POST', '/community/posts', { token: s.a.token, body: { text: 'x', group_id: 'G-none' } });
  assert.equal(group.json.code, 'GROUP_NOT_FOUND');
  assert.equal((await call('POST', '/community/posts', { token: s.a.token, body: { text: '  ' } })).status, 400);
});

test('uploads need a login and a real picture', async () => {
  assert.equal((await upload('profile', PNG)).status, 401);
  assert.equal((await upload('post', PNG)).status, 401);
  const fake = await upload('profile', Buffer.from('<script>alert(1)</script> not a picture'), { token: s.a.token });
  assert.equal(fake.status, 400);
  assert.equal(fake.json.code, 'INVALID_IMAGE');
  const big = await upload('post', Buffer.concat([PNG, Buffer.alloc(5 * 1024 * 1024)]), { token: s.a.token });
  assert.equal(big.status, 413);
});

test('a profile photo is visible to other members', async () => {
  const up = await upload('profile', PNG, { token: s.a.token });
  assert.equal(up.status, 201, JSON.stringify(up.json));
  assert.match(up.json.photo, /^\/media\/[a-f0-9]{32}$/);
  s.photo = up.json.photo;

  const file = await picture(s.photo);
  assert.equal(file.status, 200);
  assert.equal(file.headers.get('content-type'), 'image/png'); // from the bytes, not the header sent
  assert.deepEqual(Buffer.from(await file.arrayBuffer()), PNG);

  assert.equal((await call('GET', '/auth/me', { token: s.a.token })).json.member.photo, s.photo);
  const members = await call('GET', '/members', { token: s.b.token });
  assert.equal(members.json.members.find((m) => m.id === s.a.member.id).photo, s.photo);
  const feed = await call('GET', '/community/posts', { token: s.b.token });
  assert.equal(feed.json.posts.find((p) => p.id === s.textPost).author_photo, s.photo);
});

test('a new profile photo replaces the old one; it can be removed', async () => {
  const up = await upload('profile', PNG, { token: s.a.token });
  assert.notEqual(up.json.photo, s.photo);
  assert.equal((await picture(s.photo)).status, 404);

  const removed = await call('DELETE', '/media/profile', { token: s.a.token });
  assert.equal(removed.status, 200);
  assert.equal((await picture(up.json.photo)).status, 404);
  assert.equal((await call('GET', '/auth/me', { token: s.a.token })).json.member.photo, null);
});

test('a post can carry a photo the author uploaded', async () => {
  const up = await upload('post', PNG, { token: s.a.token });
  assert.equal(up.status, 201, JSON.stringify(up.json));

  // Someone else's picture cannot be attached.
  const stolen = await call('POST', '/community/posts', { token: s.b.token, body: { text: 'x', image_id: up.json.id } });
  assert.equal(stolen.json.code, 'IMAGE_NOT_FOUND');

  const r = await call('POST', '/community/posts', { token: s.a.token, body: { text: '', image_id: up.json.id } });
  assert.equal(r.status, 201, JSON.stringify(r.json));
  assert.equal(r.json.post.image, up.json.image);
  s.photoPost = r.json.post;

  const again = await call('POST', '/community/posts', { token: s.a.token, body: { text: 'x', image_id: up.json.id } });
  assert.equal(again.json.code, 'IMAGE_NOT_FOUND');

  const seen = await call('GET', `/community/posts/${s.photoPost.id}`, { token: s.b.token });
  assert.equal(seen.json.post.image, up.json.image);
  assert.equal((await picture(up.json.image)).status, 200);
});

test('a client cannot set an arbitrary picture address', async () => {
  const r = await call('POST', '/community/posts', { token: s.a.token, body: { text: 'x', image: 'https://evil.example/x.png' } });
  assert.equal(r.status, 201);
  assert.equal(r.json.post.image, null);
});

test('the shared link page shows the photo', async () => {
  const html = await (await fetch(`${ROOT}/post/${s.photoPost.id}`)).text();
  assert.match(html, new RegExp(`<img class="photo" src="${s.photoPost.image}"`));
  assert.match(html, new RegExp(`og:image" content="https?://[^"]+${s.photoPost.image}"`));
});

test('deleting a post deletes its photo', async () => {
  assert.equal((await call('DELETE', `/community/posts/${s.photoPost.id}`, { token: s.a.token })).status, 200);
  assert.equal((await picture(s.photoPost.image)).status, 404);
});

test('deleting the account deletes the member\'s pictures', async () => {
  const profile = await upload('profile', PNG, { token: s.b.token });
  const post = await upload('post', PNG, { token: s.b.token });
  for (const m of [s.a, s.b]) {
    const r = await call('DELETE', '/auth/account', { token: m.token, body: { password: PASSWORD, confirm: 'DELETE' } });
    assert.equal(r.status, 200, JSON.stringify(r.json));
  }
  assert.equal((await picture(profile.json.photo)).status, 404);
  assert.equal((await picture(post.json.image)).status, 404);
});
