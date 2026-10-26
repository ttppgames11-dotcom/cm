import { runQuery, saveDatabase, all } from '../database/database.js';

async function migrate() {
  const safeAlter = async (tbl, col, type) => {
    try {
      await runQuery(`ALTER TABLE ${tbl} ADD COLUMN ${col} ${type};`);
      console.log(`Added ${col} to ${tbl}`);
    } catch (_) {}
  };

  await safeAlter('matrimony_profiles', 'caste', "TEXT DEFAULT '९६ कुळी मराठा'");
  await safeAlter('matrimony_profiles', 'birth_time', 'TEXT');
  await safeAlter('matrimony_profiles', 'birth_place', 'TEXT');
  await safeAlter('matrimony_profiles', 'devak', 'TEXT');
  await safeAlter('matrimony_profiles', 'rashi', 'TEXT');
  await safeAlter('matrimony_profiles', 'nakshatra', 'TEXT');
  await safeAlter('matrimony_profiles', 'mangal', "TEXT DEFAULT 'नाही'");
  await safeAlter('matrimony_profiles', 'company', 'TEXT');
  await safeAlter('matrimony_profiles', 'taluka', 'TEXT');
  await safeAlter('matrimony_profiles', 'native_place', 'TEXT');
  await safeAlter('matrimony_profiles', 'father_name', 'TEXT');
  await safeAlter('matrimony_profiles', 'father_occupation', 'TEXT');
  await safeAlter('matrimony_profiles', 'mother_maher_kul', 'TEXT');
  await safeAlter('matrimony_profiles', 'mama_kul', 'TEXT');
  await safeAlter('matrimony_profiles', 'siblings_info', 'TEXT');
  await safeAlter('matrimony_profiles', 'expectations', 'TEXT');
  await safeAlter('matrimony_profiles', 'status', "TEXT DEFAULT 'approved'");
  await safeAlter('matrimony_profiles', 'updated_at', 'TEXT');

  await runQuery(`
    CREATE TABLE IF NOT EXISTS matrimony_reports (
      id TEXT PRIMARY KEY,
      reported_profile_id TEXT NOT NULL,
      reported_by_id TEXT,
      reporter_name TEXT,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'open',
      admin_notes TEXT,
      created_at TEXT
    );
  `);

  await safeAlter('matrimony_interests', 'sender_id', 'TEXT');
  await safeAlter('matrimony_interests', 'sender_phone', 'TEXT');
  await safeAlter('matrimony_interests', 'relation', 'TEXT');
  await safeAlter('matrimony_interests', 'responded_at', 'TEXT');

  saveDatabase();

  const cols = await all('PRAGMA table_info(matrimony_profiles)');
  console.log('matrimony_profiles updated columns:', cols.map(c => c.name).join(', '));
  console.log('Migration finished successfully.');
}

migrate().then(() => process.exit(0)).catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
