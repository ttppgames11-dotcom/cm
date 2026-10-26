import { runQuery, all, saveDatabase, getDatabase } from '../../database/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

const testIds = [
  'M-L1-001', 'M-L1-002', 'M-L1-003',
  'M-L2-101', 'M-L2-102', 'M-L2-201', 'M-L2-301',
  'M-L3-501', 'M-L3-502',
  'M741118', 'M362638', 'M599707', 'M388229', 'M757782',
  'M293832', 'M2866', 'M9782', 'M9927'
];

const testRefIds = [
  'REF-M-L1-001', 'REF-M-L1-002', 'REF-M-L1-003',
  'REF-M-L2-101', 'REF-M-L2-102', 'REF-M-L2-201', 'REF-M-L2-301',
  'REF-M-L3-501', 'REF-M-L3-502'
];

async function main() {
  console.log('Starting permanent purge of test data...');
  await getDatabase();

  for (const id of testIds) {
    await runQuery('DELETE FROM members WHERE id = ?', [id]);
  }
  for (const rId of testRefIds) {
    await runQuery('DELETE FROM member_referrals WHERE id = ?', [rId]);
  }
  await saveDatabase();

  const mCount = await all('SELECT COUNT(*) as count FROM members');
  const rCount = await all('SELECT COUNT(*) as count FROM member_referrals');
  console.log(`SQLite: Members count = ${mCount[0].count}, Referrals count = ${rCount[0].count}`);

  // Purge from backend/db.json
  const dbJsonPath = path.join(rootDir, 'backend', 'db.json');
  if (fs.existsSync(dbJsonPath)) {
    const raw = fs.readFileSync(dbJsonPath, 'utf8');
    const json = JSON.parse(raw);
    const testSet = new Set(testIds);
    const testRefSet = new Set(testRefIds);

    const initialM = json.members.length;
    json.members = (json.members || []).filter(m => {
      if (testSet.has(m.id)) return false;
      const lowerName = (m.name || '').toLowerCase();
      const lowerEmail = (m.email || '').toLowerCase();
      if (lowerName.includes('flutter test') || lowerName.includes('referee member') || lowerName.includes('referrer member')) return false;
      if (lowerEmail.includes('@test.com') || lowerEmail.includes('flowtest_temp')) return false;
      if (m.id.startsWith('M-L')) return false;
      return true;
    });

    json.referrals = (json.referrals || []).filter(r => !testRefSet.has(r.id) && !testSet.has(r.memberId) && !testSet.has(r.referralId));

    fs.writeFileSync(dbJsonPath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`backend/db.json: Cleaned from ${initialM} to ${json.members.length} members.`);
  }
}

main().catch(console.error);
