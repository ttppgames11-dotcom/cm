import initSqlJs from 'sql.js';
import fs from 'fs';

async function main() {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('c:/Users/Yashraj Sathe/Downloads/cm/database/connect_maratha.db'));
  const res = db.exec("SELECT id, name, email, phone, role FROM members WHERE role IN ('superadmin', 'admin', 'ceo')");
  console.log('Admins in local SQLite:');
  console.log(JSON.stringify(res[0]?.values, null, 2));

  // Check backend/db.json
  if (fs.existsSync('c:/Users/Yashraj Sathe/Downloads/cm/backend/db.json')) {
    const json = JSON.parse(fs.readFileSync('c:/Users/Yashraj Sathe/Downloads/cm/backend/db.json', 'utf8'));
    const jsonAdmins = (json.members || []).filter(m => ['superadmin', 'admin', 'ceo'].includes(m.role));
    console.log('Admins in db.json:', jsonAdmins.map(a => ({ id: a.id, name: a.name, email: a.email, role: a.role })));
  }
}
main().catch(console.error);
