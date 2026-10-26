// Run: node --test src/pages/admin/referralReport.test.js   (from the frontend folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PERIODS, formatRupees, formatWinRate, barWidths, reportPath } from './referralReport.js';

test('the three periods, in order', () => {
  assert.deepEqual(PERIODS.map((p) => p.key), ['30d', '90d', 'all']);
  for (const p of PERIODS) assert.ok(p.label.length > 0);
});

test('rupees with Indian digit grouping', () => {
  assert.equal(formatRupees(125000), '₹1,25,000');
  assert.equal(formatRupees(0), '₹0');
  assert.equal(formatRupees(999), '₹999');
  assert.equal(formatRupees(1234567), '₹12,34,567');
  assert.equal(formatRupees('abc'), '₹0');
  assert.equal(formatRupees(undefined), '₹0');
});

test('win rate shows a dash when nothing has closed', () => {
  assert.equal(formatWinRate(null), '—');
  assert.equal(formatWinRate(undefined), '—');
  assert.equal(formatWinRate('abc'), '—');
  assert.equal(formatWinRate(66.7), '66.7%');
  assert.equal(formatWinRate(50), '50%');
  assert.equal(formatWinRate(100), '100%');
  assert.equal(formatWinRate(0), '0%');
});

test('bars are relative to the largest stage', () => {
  const rows = barWidths([{ status: 'New', count: 2 }, { status: 'Won', count: 4 }, { status: 'Lost', count: 0 }]);
  assert.deepEqual(rows.map((r) => r.widthPercent), [50, 100, 0]);
  assert.deepEqual(rows.map((r) => r.status), ['New', 'Won', 'Lost']);
  assert.deepEqual(barWidths([{ status: 'New', count: 0 }, { status: 'Won', count: 0 }]).map((r) => r.widthPercent), [0, 0]);
  assert.deepEqual(barWidths([]), []);
});

test('the report address for a period', () => {
  assert.equal(reportPath('30d'), '/admin/referrals/report?period=30d');
  assert.equal(reportPath('90d'), '/admin/referrals/report?period=90d');
  assert.equal(reportPath('all'), '/admin/referrals/report?period=all');
  assert.equal(reportPath('bogus'), '/admin/referrals/report?period=all');
  assert.equal(reportPath(undefined), '/admin/referrals/report?period=all');
});
