import { all, get, runQuery } from './database/database.js';
import { db } from './backend/db/realtimeDb.js';

async function seedSqlite() {
  const memBiz = db.getCollection('businesses') || [];
  for (const b of memBiz) {
    try {
      await runQuery(
        `INSERT OR REPLACE INTO businesses (id, name, owner, cat, city, district, phone, rating)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.id, b.name || b.businessName || 'मराठा उद्योग', b.owner || b.contactPerson || 'उद्योजक', b.category || b.cat || 'उद्योग', b.city || b.taluka || 'पुणे', b.district || 'पुणे', b.phone || '9822011921', b.rating || 4.8]
      );
    } catch (e) {
      console.warn('Biz err:', e.message);
    }
  }

  const memJobs = db.getCollection('jobs') || [];
  for (const j of memJobs) {
    try {
      await runQuery(
        `INSERT OR REPLACE INTO jobs (id, title, company, district, category, salary, job_type, experience, desc, phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [j.id, j.title, j.company || 'सह्याद्री उद्योग', j.district || 'पुणे', j.category || 'इंजिनिअरिंग', j.salary || '₹३५,०००', j.type || 'Full Time', j.experience || '१-३ वर्षे', j.description || j.desc || 'मराठा युवांसाठी भरती', j.phone || '9822011922']
      );
    } catch (e) {
      console.warn('Job err:', e.message);
    }
  }

  const m = await get('SELECT COUNT(*) as c FROM members');
  const b = await get('SELECT COUNT(*) as c FROM businesses');
  const j = await get('SELECT COUNT(*) as c FROM jobs');
  const r = await get('SELECT COUNT(*) as c FROM referrals');
  const cc = await get('SELECT COUNT(*) as c FROM community_centers');
  console.log('✅ SQLite counts:', {
    members: m?.c,
    businesses: b?.c,
    jobs: j?.c,
    referrals: r?.c,
    community_centers: cc?.c
  });
}

seedSqlite().catch(console.error);
