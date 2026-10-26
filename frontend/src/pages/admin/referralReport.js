// Pure helpers for the admin referral report (no React, so they are tested with
// `node --test src/pages/admin/referralReport.test.js`).

export const PERIODS = [
  { key: '30d', label: 'गेले ३० दिवस (Last 30 days)' },
  { key: '90d', label: 'गेले ९० दिवस (Last 90 days)' },
  { key: 'all', label: 'सर्व काळ (All time)' }
];

// ₹ with Indian digit grouping: 125000 -> ₹1,25,000. Anything that is not a number counts as 0.
export function formatRupees(value) {
  const n = Number(value);
  return '₹' + (Number.isFinite(n) ? n : 0).toLocaleString('en-IN');
}

// The win rate as the server sends it (one decimal, or null while nothing has closed): "66.7%", or a dash.
export function formatWinRate(rate) {
  if (rate === null || rate === undefined || typeof rate !== 'number' || !Number.isFinite(rate)) return '—';
  return rate + '%';
}

// The stage rows with a bar width in percent, relative to the largest count (all 0 when every count is 0).
export function barWidths(byStatus) {
  const rows = Array.isArray(byStatus) ? byStatus : [];
  const largest = rows.reduce((max, row) => Math.max(max, Number(row.count) || 0), 0);
  return rows.map((row) => ({
    ...row,
    widthPercent: largest > 0 ? Math.round(((Number(row.count) || 0) / largest) * 100) : 0
  }));
}

// The report address for a period; an unknown or missing period means all time.
export function reportPath(period) {
  const known = PERIODS.some((p) => p.key === period) ? period : 'all';
  return '/admin/referrals/report?period=' + known;
}
