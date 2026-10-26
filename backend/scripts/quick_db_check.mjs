import initSqlJs from 'sql.js';
import fs from 'fs';

async function main() {
  const SQL = await initSqlJs();
  const filebuffer = fs.readFileSync('c:/Users/Yashraj Sathe/Downloads/cm/database/connect_maratha.db');
  const db = new SQL.Database(filebuffer);

  const last5 = db.exec("SELECT id, name, phone, role, created_at, status FROM members ORDER BY id DESC LIMIT 5");
  console.log('Last 5 members in local DB:', JSON.stringify(last5[0]?.values, null, 2));

  const totalLocal = db.exec("SELECT count(*) FROM members")[0].values[0][0];
  console.log('Total local members:', totalLocal);

  const roles = db.exec("SELECT role, count(*) FROM members GROUP BY role");
  console.log('Roles breakdown in local DB:', JSON.stringify(roles[0]?.values, null, 2));

  // Check live API
  try {
    const res = await fetch('https://api.connectmaratha.com/api/members');
    const data = await res.json();
    const liveMembers = Array.isArray(data) ? data : (data.members || data.data || []);
    console.log('Live API total members count:', liveMembers.length);
    if (liveMembers.length > 0) {
      console.log('Live API first 2 members:', JSON.stringify(liveMembers.slice(0, 2), null, 2));
      console.log('Live API last 2 members:', JSON.stringify(liveMembers.slice(-2), null, 2));
    }
  } catch (e) {
    console.log('Live API fetch error:', e.message);
  }
}
main().catch(console.error);
