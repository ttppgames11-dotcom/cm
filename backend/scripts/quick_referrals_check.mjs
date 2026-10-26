import { all } from '../../database/database.js';

async function check() {
  const refs = await all('SELECT * FROM member_referrals');
  console.log('member_referrals count:', refs.length);
  console.log(JSON.stringify(refs, null, 2));

  const referredMembers = await all("SELECT id, name, phone, referred_by FROM members WHERE referred_by IS NOT NULL AND referred_by != ''");
  console.log('\nMembers with referred_by count:', referredMembers.length);
  console.log(JSON.stringify(referredMembers, null, 2));
}

check().catch(console.error);
