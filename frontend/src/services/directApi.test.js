// Run: node --test src/services/directApi.test.js   (from the frontend folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';

// A stand-in browser window (no fetch, so the module does not patch anything).
globalThis.window = { location: { hostname: 'localhost' } };
const { apiUrl } = await import('./directApi.js');

test('local development keeps the relative /api path (Vite proxy)', () => {
  window.location.hostname = 'localhost';
  assert.equal(apiUrl('/api/enquiries/stream'), '/api/enquiries/stream');
});

test('the live site calls the API server directly', () => {
  for (const host of ['www.connectmaratha.com', 'connectmaratha.com']) {
    window.location.hostname = host;
    assert.equal(apiUrl('/api/enquiries/stream'), 'https://api.connectmaratha.com/api/enquiries/stream');
  }
});
