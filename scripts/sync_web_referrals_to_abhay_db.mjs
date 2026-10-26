import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runQuery, getDatabase, saveDatabase, all } from '../database/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function syncWebReferralsToAbhayDb() {
  await getDatabase();

  const dbJsonPath = path.join(rootDir, 'backend', 'db.json');
  if (!fs.existsSync(dbJsonPath)) {
    console.error('backend/db.json not found');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dbJsonPath, 'utf8'));
  const members = data.members || [];
  console.log(`Found ${members.length} members in backend/db.json`);

  let insertedMembers = 0;
  let insertedRefs = 0;

  for (const m of members) {
    try {
      await runQuery(`
        INSERT INTO members (
          id, name, email, phone, city, district, state,
          profession, business, tier, role, joined,
          referred_by, created_at, photo, country, taluka, village, kul
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          referred_by = COALESCE(excluded.referred_by, members.referred_by),
          name = COALESCE(excluded.name, members.name),
          phone = COALESCE(excluded.phone, members.phone),
          district = COALESCE(excluded.district, members.district),
          taluka = COALESCE(excluded.taluka, members.taluka)
      `, [
        m.id,
        m.name || '',
        m.email || '',
        m.phone || '',
        m.city || '',
        m.district || '',
        m.state || 'महाराष्ट्र',
        m.profession || '',
        m.business || '',
        m.tier || 'Basic',
        m.role || 'member',
        m.joined || (m.created_at || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
        m.referred_by || null,
        m.created_at || new Date().toISOString(),
        m.photo || '',
        m.country || 'भारत',
        m.taluka || '',
        m.village || '',
        m.kul || '९६ कुळी मराठा'
      ]);
      insertedMembers++;
    } catch (err) {
      console.warn('Member upsert error:', m.id, err.message);
    }

    if (m.referred_by) {
      const referrerId = m.referred_by;
      const referrer = members.find(x => x.id === referrerId || x.phone === referrerId);
      const referrerName = referrer ? referrer.name : (referrerId === 'CM-OFFICIAL-2026' ? 'Connect Maratha अधिकृत केंद्रीय मंच' : 'Connect Maratha सभासद');
      const referrerPhone = referrer ? (referrer.phone || '') : '';
      const refRecordId = `REF-${m.id}`;

      try {
        await runQuery(`
          INSERT INTO member_referrals (
            id, referrer_id, referrer_name, referrer_phone,
            referee_id, referee_name, referee_phone, district, taluka,
            status, bonus_amount, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 100, ?)
          ON CONFLICT(id) DO UPDATE SET
            referrer_id = excluded.referrer_id,
            referrer_name = excluded.referrer_name,
            referee_name = excluded.referee_name,
            referee_phone = excluded.referee_phone
        `, [
          refRecordId,
          referrerId,
          referrerName,
          referrerPhone,
          m.id,
          m.name,
          m.phone,
          m.district || 'महाराष्ट्र',
          m.taluka || '',
          m.created_at || new Date().toISOString()
        ]);
        insertedRefs++;
      } catch (refErr) {
        console.warn('Referral upsert error:', m.id, refErr.message);
      }
    }
  }

  saveDatabase();

  // Copy updated connect_maratha.db to server/db/
  const dbSrc = path.join(rootDir, 'database', 'connect_maratha.db');
  const dbDst = path.join(rootDir, 'server', 'db', 'connect_maratha.db');
  fs.copyFileSync(dbSrc, dbDst);

  console.log(`✅ Successfully synced ${insertedMembers} members and ${insertedRefs} referrals into Abhay App Database!`);

  const totalMembers = await all('SELECT count(*) as c FROM members');
  const totalRefs = await all('SELECT count(*) as c FROM member_referrals');
  console.log(`📊 Total members in DB: ${totalMembers[0].c}`);
  console.log(`📊 Total member_referrals in DB: ${totalRefs[0].c}`);

  const sample = await all('SELECT id, referrer_id, referrer_name, referee_id, referee_name, bonus_amount, created_at FROM member_referrals');
  console.log('Synced referrals list:');
  console.log(sample);
}

syncWebReferralsToAbhayDb().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});
