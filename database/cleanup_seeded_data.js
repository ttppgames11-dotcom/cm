import { runQuery, saveDatabase } from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanup() {
  console.log('🧹 Cleaning up seeded dummy / test records from SQLite (connect_maratha.db)...');

  // 1. Drop test_chk table if exists
  await runQuery('DROP TABLE IF EXISTS test_chk', [], false);

  // 2. Remove test/dummy records from SQLite
  await runQuery("DELETE FROM referrals WHERE id LIKE '%TEST%' OR title = 'nnnnn'", [], false);
  await runQuery("DELETE FROM tickets WHERE id LIKE '%TEST%'", [], false);
  await runQuery("DELETE FROM posts WHERE id LIKE '%TEST%'", [], false);
  await runQuery("DELETE FROM services WHERE id LIKE '%TEST%'", [], false);
  await runQuery("DELETE FROM members WHERE id LIKE '%TEST%' OR name LIKE '%Test%' OR email LIKE '%example.com%' OR phone LIKE '98765000%'", [], false);
  await runQuery("DELETE FROM businesses WHERE phone LIKE '98765000%'", [], false);
  await runQuery("DELETE FROM jobs WHERE phone LIKE '98765000%'", [], false);

  saveDatabase();
  console.log('✅ SQLite cleanup complete.');

  // 3. Clean backend/db.json
  const dbJsonPath = path.join(__dirname, '..', 'backend', 'db.json');
  if (fs.existsSync(dbJsonPath)) {
    console.log('🧹 Cleaning seeded dummy / test records from backend/db.json...');
    const data = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));

    if (Array.isArray(data.members)) {
      data.members = data.members.filter(m => 
        !String(m.name).includes('Test') && 
        !String(m.email).includes('example.com') && 
        !String(m.phone).startsWith('98765000') &&
        !String(m.id).includes('TEST')
      );
    }

    if (Array.isArray(data.referrals)) {
      data.referrals = data.referrals.filter(r => 
        !String(r.id).includes('TEST') && 
        r.title !== 'nnnnn'
      );
    }

    if (Array.isArray(data.tickets)) {
      data.tickets = data.tickets.filter(t => !String(t.id).includes('TEST'));
    }

    if (Array.isArray(data.posts)) {
      data.posts = data.posts.filter(p => !String(p.id).includes('TEST'));
    }

    if (Array.isArray(data.services)) {
      data.services = data.services.filter(s => !String(s.id).includes('TEST'));
    }

    if (Array.isArray(data.businesses)) {
      data.businesses = data.businesses.filter(b => !String(b.phone).startsWith('98765000'));
    }

    if (Array.isArray(data.jobs)) {
      data.jobs = data.jobs.filter(j => !String(j.phone).startsWith('98765000'));
    }

    fs.writeFileSync(dbJsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ db.json cleanup complete.');
  }
}

cleanup().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
