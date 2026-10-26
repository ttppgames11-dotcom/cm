import { all } from '../../database/database.js';

async function listTestMembers() {
  const members = await all(`
    SELECT id, name, email, phone, role
    FROM members
    WHERE LOWER(name) LIKE '%test%'
       OR LOWER(name) LIKE '%refer%'
       OR LOWER(name) LIKE '%flutter%'
       OR LOWER(name) LIKE '%demo%'
       OR LOWER(email) LIKE '%test%'
       OR LOWER(email) LIKE '%example%'
       OR LOWER(id) LIKE '%test%'
       OR LOWER(id) LIKE '%demo%'
       OR id LIKE 'M-L%'
  `);
  console.log('Total test/dummy records in members table:', members.length);
  console.log(JSON.stringify(members, null, 2));
}
listTestMembers().catch(console.error);
