import { runQuery, get, all } from './database/database.js';

async function updatePending() {
  await runQuery("UPDATE members SET verified_profile = 0 WHERE id IN ('M2159', 'M4719', 'M1021')");
  const v1 = await get('SELECT COUNT(*) as c FROM members WHERE verified_profile = 1');
  const v0 = await get('SELECT COUNT(*) as c FROM members WHERE verified_profile = 0 OR verified_profile IS NULL');
  console.log('Verification counts:', { verified: v1?.c, pending: v0?.c });
}

updatePending().catch(console.error);
