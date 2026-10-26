// Replaces well-known default passwords on staff accounts with random ones.
// Run with the backend STOPPED (it keeps both databases in memory and would overwrite these edits):
//   node backend/scripts/reset_staff_passwords.mjs
// New passwords are written to backend/data/staff_credentials.txt (git-ignored), never printed.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { runQuery, saveDatabase } from '../../database/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jsonPath = path.join(__dirname, '..', 'db.json');
const outDir = path.join(__dirname, '..', 'data');
const outFile = path.join(outDir, 'staff_credentials.txt');

const KNOWN_DEFAULTS = [
  'password123', 'admin123', 'admin1674', 'superadmin1674', 'ceo1674', 'center1674',
  'division1674', 'district1674', 'taluka1674'
];

function randomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#%';
  const bytes = crypto.randomBytes(16);
  return Array.from(bytes, b => chars[b % chars.length]).join('');
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const lines = [];

for (const m of data.members) {
  if (m.role === 'member' || !m.password_hash) continue;
  const weak = KNOWN_DEFAULTS.some(p => bcrypt.compareSync(p, m.password_hash));
  if (!weak) continue;

  const password = randomPassword();
  const hash = bcrypt.hashSync(password, 10);
  m.password_hash = hash;
  m.tokenVersion = (m.tokenVersion || 0) + 1; // invalidates tokens issued with the old password
  await runQuery('UPDATE members SET password_hash = ? WHERE id = ?', [hash, m.id], false);
  lines.push(`${m.id}\t${m.role}\t${password}`);
}

if (!lines.length) {
  console.log('No staff accounts with known default passwords. Nothing changed.');
  process.exit(0);
}

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
saveDatabase();
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, `id\trole\tpassword\n${lines.join('\n')}\n`, 'utf8');
console.log(`Reset ${lines.length} account(s). Passwords saved to ${outFile}`);
process.exit(0);
