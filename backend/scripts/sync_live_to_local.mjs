import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runQuery, getDatabase, saveDatabase, all } from '../../database/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

async function syncLiveToLocal() {
  console.log('🔄 Fetching live members from https://api.connectmaratha.com/api/members ...');
  
  const res = await fetch('https://api.connectmaratha.com/api/members');
  if (!res.ok) {
    throw new Error(`Live API returned HTTP ${res.status}`);
  }
  const data = await res.json();
  const liveMembers = data.members || (Array.isArray(data) ? data : []);
  console.log(`✅ Fetched ${liveMembers.length} members from live server.`);

  // Initialize SQLite database
  await getDatabase();

  let insertedCount = 0;
  let updatedCount = 0;

  for (const m of liveMembers) {
    try {
      const existing = await all('SELECT id FROM members WHERE id = ?', [m.id]);
      if (existing.length === 0) {
        await runQuery(`
          INSERT INTO members (
            id, name, email, phone, avatar, photo, city, district, state, country,
            taluka, village, profession, business, skills, education, about, tier, role,
            verified_profile, status, joined, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          m.id,
          m.name || '',
          m.email || '',
          m.phone || '',
          m.avatar || '👤',
          m.photo || null,
          m.city || '',
          m.district || '',
          m.state || 'महाराष्ट्र',
          m.country || 'भारत',
          m.taluka || '',
          m.village || '',
          m.profession || '',
          m.business || '',
          typeof m.skills === 'string' ? m.skills : JSON.stringify(m.skills || []),
          m.education || '',
          m.about || '',
          m.tier || 'Basic',
          m.role || 'member',
          m.verified ? 1 : 0,
          m.status || 'active',
          m.joined || (m.created_at || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
          m.created_at || (m.joined ? `${m.joined}T00:00:00.000Z` : new Date().toISOString())
        ]);
        insertedCount++;
      } else {
        await runQuery(`
          UPDATE members SET
            name = COALESCE(?, name),
            district = COALESCE(?, district),
            state = COALESCE(?, state),
            role = COALESCE(?, role)
          WHERE id = ?
        `, [m.name, m.district, m.state, m.role, m.id]);
        updatedCount++;
      }
    } catch (err) {
      console.warn(`Error syncing member ${m.id}:`, err.message);
    }
  }

  await saveDatabase();

  const totalAfter = await all('SELECT COUNT(*) as count FROM members');
  console.log(`\n🎉 SQLite Sync Completed!`);
  console.log(`Newly inserted: ${insertedCount}`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Total members in local SQLite database now: ${totalAfter[0].count}`);

  // Also update backend/db.json
  const dbJsonPath = path.join(rootDir, 'backend', 'db.json');
  if (fs.existsSync(dbJsonPath)) {
    const raw = fs.readFileSync(dbJsonPath, 'utf8');
    const json = JSON.parse(raw);
    const existingIds = new Set((json.members || []).map(m => m.id));
    let jsonAdded = 0;
    for (const m of liveMembers) {
      if (!existingIds.has(m.id)) {
        json.members.push({
          id: m.id,
          name: m.name || '',
          email: m.email || '',
          phone: m.phone || '',
          avatar: m.avatar || '👤',
          photo: m.photo || null,
          city: m.city || '',
          district: m.district || '',
          state: m.state || 'महाराष्ट्र',
          profession: m.profession || '',
          business: m.business || '',
          skills: m.skills || [],
          education: m.education || '',
          about: m.about || '',
          tier: m.tier || 'Basic',
          role: m.role || 'member',
          verified: !!m.verified,
          status: m.status || 'active',
          joined: m.joined || new Date().toISOString().slice(0, 10),
          created_at: m.created_at || new Date().toISOString()
        });
        jsonAdded++;
      }
    }
    fs.writeFileSync(dbJsonPath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`✅ Added ${jsonAdded} missing live members to backend/db.json! Total in db.json: ${json.members.length}`);
  }
}

syncLiveToLocal().catch(console.error);
