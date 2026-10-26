// One-off cleanup of test rows and broken image links. Run with the backend STOPPED:
//   node backend/scripts/cleanup_mock_data.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runQuery, saveDatabase } from '../../database/database.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const jsonPath = path.join(root, 'backend', 'db.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const report = [];

const FAKE_PHONES = new Set(['+919876543210', '+917777777777', '9999988881']);
const isFake = (v) => typeof v === 'string' && FAKE_PHONES.has(v.replace(/\s/g, ''));

// 1. Rows carrying a test phone number
for (const [col, rows] of Object.entries(data)) {
  if (!Array.isArray(rows) || col === 'members') continue;
  const kept = rows.filter(r => !(r && typeof r === 'object' && Object.entries(r).some(([k, v]) => /phone|contact|mobile/i.test(k) && isFake(v))));
  if (kept.length !== rows.length) { report.push(`${col}: removed ${rows.length - kept.length} test rows`); data[col] = kept; }
}
const before = data.members.length;
const fakeMembers = data.members.filter(m => isFake(m.phone)).map(m => m.id);
data.members = data.members.filter(m => !fakeMembers.includes(m.id));
for (const id of fakeMembers) await runQuery('DELETE FROM members WHERE id = ?', [id], false);
report.push(`members: removed ${before - data.members.length} (${fakeMembers.join(', ')})`);

// 2. RERA placeholder
let rera = 0;
for (const b of data.builders || []) if (/X{3,}/i.test(b.reraNo || '')) { b.reraNo = 'दिलेले नाही'; b.reraApproved = false; rera++; }
report.push(`builders: ${rera} placeholder RERA numbers replaced`);

// 3. Runtime/test noise (blacklisted tokens are kept so revoked sessions stay revoked)
for (const col of ['auditLogs', 'notifications', 'otpCodes']) { report.push(`${col}: cleared ${data[col]?.length || 0}`); data[col] = []; }
for (const t of ['audit_logs', 'notifications']) { try { await runQuery(`DELETE FROM ${t}`, [], false); } catch (_) {} }

// 4. Broken image links: re-point to the same picture under its real name, otherwise blank
const MAP = {
  '/assets/images/books/book_shriman_yogi.jpg': '/assets/images/books/book_shriman.jpg',
  '/assets/images/books/book_chhaava.jpg': '/assets/images/books/book_chhava.jpg',
  '/assets/images/generated/business_sangam_hero.jpg': '/assets/images/maratha-business-sangam.jpg'
};
const exists = (v) => fs.existsSync(path.join(root, 'frontend', 'public', v)) || fs.existsSync(path.join(root, 'frontend', v.replace(/^\//, '')));
let fixed = 0, blanked = 0;
for (const rows of Object.values(data)) {
  if (!Array.isArray(rows)) continue;
  for (const r of rows) {
    if (!r || typeof r !== 'object') continue;
    for (const [k, v] of Object.entries(r)) {
      if (typeof v !== 'string' || !/^\/assets\/images\/.+\.(jpe?g|png|webp|avif)$/i.test(v) || exists(v)) continue;
      if (MAP[v] && exists(MAP[v])) { r[k] = MAP[v]; fixed++; } else { r[k] = ''; blanked++; }
    }
  }
}
report.push(`images: ${fixed} re-pointed, ${blanked} blanked`);

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
saveDatabase();
console.log(report.join('\n'));
process.exit(0);
