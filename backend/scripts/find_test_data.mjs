import { all } from '../../database/database.js';

async function findTestData() {
  const members = await all(`
    SELECT id, name, email, phone, role, created_at
    FROM members
    WHERE LOWER(name) LIKE '%test%'
       OR LOWER(name) LIKE '%refer%'
       OR LOWER(name) LIKE '%flutter%'
       OR LOWER(name) LIKE '%demo%'
       OR LOWER(email) LIKE '%test%'
       OR LOWER(email) LIKE '%example%'
       OR LOWER(id) LIKE '%test%'
       OR LOWER(id) LIKE '%demo%'
  `);
  console.log('=== TEST MEMBERS FOUND IN SQLITE (' + members.length + ') ===');
  console.log(JSON.stringify(members, null, 2));

  try {
    const refs = await all(`
      SELECT id, referrer_name, referee_name, created_at
      FROM member_referrals
      WHERE LOWER(referee_name) LIKE '%test%'
         OR LOWER(referrer_name) LIKE '%test%'
         OR LOWER(referee_name) LIKE '%refer%'
         OR LOWER(referrer_name) LIKE '%refer%'
         OR LOWER(referee_id) LIKE '%test%'
         OR LOWER(referrer_id) LIKE '%test%'
    `);
    console.log('\n=== TEST MEMBER REFERRALS FOUND (' + refs.length + ') ===');
    console.log(JSON.stringify(refs, null, 2));
  } catch(e) {
    console.log('Referrals query error:', e.message);
  }

  // Check all member_referrals
  try {
    const allRefs = await all('SELECT * FROM member_referrals');
    console.log('\n=== ALL MEMBER REFERRALS (' + allRefs.length + ') ===');
    console.log(JSON.stringify(allRefs, null, 2));
  } catch(e) {}
}

findTestData().catch(console.error);
