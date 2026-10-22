// Forgot-password (email OTP) flow. Run against a local API started with
//   EXPOSE_TEST_OTP=true DISABLE_RATE_LIMITS=true (never in production)
// so the test can read the OTP instead of a mailbox.
import test from 'node:test';
import assert from 'node:assert/strict';

const API = process.env.API_URL || 'http://localhost:5000/api';
const stamp = Date.now().toString().slice(-7);
const email = `reset${stamp}@example.test`;
const phone = `8${stamp}00`.slice(0, 10);

async function call(method, path, body, token) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON */ }
  return { status: res.status, json };
}

const state = {};

test('setup: register a password account with an email', async () => {
  const r = await call('POST', '/auth/register', { name: 'Reset Tester', email, phone, password: 'OldPassw0rd!' });
  assert.equal(r.status, 201, JSON.stringify(r.json));
  state.oldRefresh = r.json.refreshToken;
});

test('unknown email is reported as not found', async () => {
  const r = await call('POST', '/auth/forgot-password', { email: `nobody${stamp}@example.test` });
  assert.equal(r.status, 404);
  assert.equal(r.json.code, 'USER_NOT_FOUND');
});

test('OTP is issued (email case-insensitive) and resend is throttled', async () => {
  const r = await call('POST', '/auth/forgot-password', { email: email.toUpperCase() });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.match(r.json.testOtp, /^\d{6}$/, 'start the API with EXPOSE_TEST_OTP=true');
  state.otp = r.json.testOtp;
  const again = await call('POST', '/auth/forgot-password', { email });
  assert.equal(again.status, 429);
  assert.equal(again.json.code, 'OTP_RECENTLY_SENT');
});

test('wrong OTP is rejected and counted', async () => {
  const wrong = state.otp === '111111' ? '222222' : '111111';
  const r = await call('POST', '/auth/verify-reset-otp', { email, otp: wrong });
  assert.equal(r.status, 400);
  assert.equal(r.json.code, 'INVALID_OTP');
  assert.match(r.json.error, /4/); // 4 attempts left
});

test('reset without a verified OTP is refused', async () => {
  const r = await call('POST', '/auth/reset-password', { email, resetToken: 'f'.repeat(64), newPassword: 'NewPassw0rd!' });
  assert.equal(r.status, 403);
  assert.equal(r.json.code, 'INVALID_RESET_TOKEN');
});

test('correct OTP gives a reset token and the OTP cannot be reused', async () => {
  const r = await call('POST', '/auth/verify-reset-otp', { email, otp: state.otp });
  assert.equal(r.status, 200, JSON.stringify(r.json));
  assert.match(r.json.resetToken, /^[0-9a-f]{64}$/);
  state.resetToken = r.json.resetToken;
  const reuse = await call('POST', '/auth/verify-reset-otp', { email, otp: state.otp });
  assert.equal(reuse.status, 400);
});

test('weak new password is rejected', async () => {
  const r = await call('POST', '/auth/reset-password', { email, resetToken: state.resetToken, newPassword: 'short' });
  assert.equal(r.json.code, 'WEAK_PASSWORD');
});

test('password is reset, token is single-use, old password and sessions stop working', async () => {
  const r = await call('POST', '/auth/reset-password', { email, resetToken: state.resetToken, newPassword: 'NewPassw0rd!' });
  assert.equal(r.status, 200, JSON.stringify(r.json));

  const again = await call('POST', '/auth/reset-password', { email, resetToken: state.resetToken, newPassword: 'Another0ne!' });
  assert.equal(again.status, 403);

  assert.equal((await call('POST', '/auth/login', { identifier: email, password: 'OldPassw0rd!' })).status, 401);
  const login = await call('POST', '/auth/login', { identifier: email, password: 'NewPassw0rd!' });
  assert.equal(login.status, 200);
  state.token = login.json.token;

  const refresh = await call('POST', '/auth/refresh', { refreshToken: state.oldRefresh });
  assert.equal(refresh.status, 401, 'sessions from before the reset must be revoked');
});

test('cleanup: delete the test account', async () => {
  const r = await call('DELETE', '/auth/account', { confirm: 'DELETE', password: 'NewPassw0rd!' }, state.token);
  assert.equal(r.status, 200, JSON.stringify(r.json));
});
