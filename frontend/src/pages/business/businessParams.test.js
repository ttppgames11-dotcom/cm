// Run: node --test src/pages/business/businessParams.test.js   (from the frontend folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listParams } from './businessParams.js';

test('all filters are left out, so "undefined" is never sent', () => {
  assert.deepEqual(listParams({ cat: 'all', district: 'सर्व' }), {});
  assert.deepEqual(listParams({}), {});
  assert.deepEqual(listParams({ cat: 'it', district: 'पुणे' }), { cat: 'it', district: 'पुणे' });
  assert.deepEqual(listParams({ cat: 'all', district: 'नाशिक' }), { district: 'नाशिक' });
  assert.deepEqual(listParams({ cat: '', district: '' }), {});
  assert.deepEqual(listParams(), {});
});
