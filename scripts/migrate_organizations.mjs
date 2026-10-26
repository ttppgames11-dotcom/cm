import { runQuery, saveDatabaseNow } from '../database/database.js';

export async function migrateOrganizationsSuite() {
  console.log('Migrating Maratha Organizations (सामाजिक संस्था व संघटना) suite in SQLite...');

  const safeAlter = async (tbl, col, type) => {
    try {
      await runQuery(`ALTER TABLE ${tbl} ADD COLUMN ${col} ${type};`);
    } catch (_) {}
  };

  // 1. Upgrade / Create organizations table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'सामाजिक', -- 'सामाजिक', 'शैक्षणिक', 'युवक', 'महिला', 'उद्योग व सहकार', 'इतिहास व दुर्ग', 'आरोग्य व रक्तपेढी'
      type TEXT NOT NULL DEFAULT 'सामाजिक संस्था',   -- 'नोंदणीकृत ट्रस्ट (Trust)', 'सोसायटी (Society)', 'मंडळ / प्रतिष्ठान (Foundation)', 'महासंघ (Federation)'
      reg_no TEXT,                               -- अधिकृत धर्मादाय आयुक्त / सोसायटी नोंदणी क्रमांक (Charity Reg No)
      pan_number TEXT,
      tax_80g_12a TEXT,                          -- 12A / 80G कर सवलत प्रमाणपत्र
      established TEXT,
      hq TEXT,
      district TEXT NOT NULL DEFAULT 'पुणे',
      taluka TEXT,
      state TEXT DEFAULT 'महाराष्ट्र',
      presence TEXT,                             -- 'तालुका पातळी', 'जिल्हा पातळी', 'राज्यव्यापी', 'राष्ट्रीय (अखिल भारत)'
      members TEXT,
      members_count INTEGER DEFAULT 100,
      focus TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '🚩',
      cover_image TEXT,
      contact TEXT NOT NULL,
      email TEXT,
      website TEXT,
      president_name TEXT,
      president_phone TEXT,
      secretary_name TEXT,
      secretary_phone TEXT,
      verification_status TEXT DEFAULT 'सत्यापित (Verified)', -- 'समीक्षेत (Pending)', 'सत्यापित (Verified)', 'कागदपत्रे अपूर्ण', 'नाकारले'
      is_verified INTEGER DEFAULT 1,
      doc_reg_certificate TEXT,                  -- नोंदणी प्रमाणपत्र URL / मार्ग
      doc_audited_balance_sheet TEXT,            -- ताळेबंद URL
      activity_score INTEGER DEFAULT 85,         -- सक्रियता गुण (Activity Index 1-100)
      created_at TEXT NOT NULL
    )
  `);

  // Alter safe columns in case table was pre-existing
  await safeAlter('organizations', 'taluka', 'TEXT');
  await safeAlter('organizations', 'reg_no', 'TEXT');
  await safeAlter('organizations', 'pan_number', 'TEXT');
  await safeAlter('organizations', 'tax_80g_12a', 'TEXT');
  await safeAlter('organizations', 'description', 'TEXT');
  await safeAlter('organizations', 'cover_image', 'TEXT');
  await safeAlter('organizations', 'email', 'TEXT');
  await safeAlter('organizations', 'website', 'TEXT');
  await safeAlter('organizations', 'president_name', 'TEXT');
  await safeAlter('organizations', 'president_phone', 'TEXT');
  await safeAlter('organizations', 'secretary_name', 'TEXT');
  await safeAlter('organizations', 'secretary_phone', 'TEXT');
  await safeAlter('organizations', 'verification_status', "TEXT DEFAULT 'सत्यापित (Verified)'");
  await safeAlter('organizations', 'doc_reg_certificate', 'TEXT');
  await safeAlter('organizations', 'doc_audited_balance_sheet', 'TEXT');
  await safeAlter('organizations', 'activity_score', 'INTEGER DEFAULT 85');
  await safeAlter('organizations', 'members_count', 'INTEGER DEFAULT 100');

  // 2. Organization Office Bearers / Committee (पदाधिकारी व कार्यकारिणी)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS org_office_bearers (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      name TEXT NOT NULL,
      designation TEXT NOT NULL,   -- 'अध्यक्ष', 'उपाध्यक्ष', 'कार्याध्यक्ष', 'सरचिटणीस', 'खजिनदार', 'प्रवक्ता', 'जिल्हाध्यक्ष'
      phone TEXT NOT NULL,
      email TEXT,
      district TEXT,
      term_period TEXT DEFAULT '२०२४ - २०२७',
      is_primary INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (org_id) REFERENCES organizations(id)
    )
  `);
  await runQuery(`CREATE INDEX IF NOT EXISTS idx_org_bearers_org ON org_office_bearers(org_id);`);

  // 3. Organization Events & Programs (संस्था उपक्रम व कार्यक्रम)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS org_events (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'सामाजिक परिषद', -- 'मेळावा', 'रक्तदान शिबिर', 'व्याख्यानमाला', 'आंदोलन / हक्क परिषद', 'दुर्ग संवर्धन'
      event_date TEXT NOT NULL,
      venue TEXT NOT NULL,
      district TEXT NOT NULL,
      attendees_expected INTEGER DEFAULT 500,
      description TEXT,
      coordinator_name TEXT,
      coordinator_phone TEXT,
      status TEXT DEFAULT 'आगामी (Upcoming)', -- 'आगामी (Upcoming)', 'सुरू (Ongoing)', 'यशस्वी संपन्न (Completed)'
      created_at TEXT NOT NULL,
      FOREIGN KEY (org_id) REFERENCES organizations(id)
    )
  `);
  await runQuery(`CREATE INDEX IF NOT EXISTS idx_org_events_org ON org_events(org_id);`);

  // 4. Collaboration & Joint Initiative Requests (सहकार्य व संयुक्त उपक्रम विनंत्या)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS org_collaborations (
      id TEXT PRIMARY KEY,
      requesting_org_id TEXT,
      requesting_org_name TEXT NOT NULL,
      target_org_id TEXT NOT NULL,
      target_org_name TEXT NOT NULL,
      initiative_title TEXT NOT NULL,
      proposal_summary TEXT NOT NULL,
      district TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      status TEXT DEFAULT 'प्रलंबित (Pending)', -- 'प्रलंबित (Pending)', 'स्वीकृत (Accepted)', 'पूर्ण (Completed)', 'अस्वीकृत'
      created_at TEXT NOT NULL,
      FOREIGN KEY (target_org_id) REFERENCES organizations(id)
    )
  `);
  await runQuery(`CREATE INDEX IF NOT EXISTS idx_org_collab_target ON org_collaborations(target_org_id);`);

  // 5. Work Reports & Annual Activity Audits (कार्य अहवाल व वार्षिक प्रगती अहवाल)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS org_work_reports (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      report_year TEXT NOT NULL,
      title TEXT NOT NULL,
      beneficiaries_count INTEGER DEFAULT 0,
      events_conducted INTEGER DEFAULT 0,
      total_spend REAL DEFAULT 0,
      summary TEXT NOT NULL,
      report_file_url TEXT,
      submitted_by TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (org_id) REFERENCES organizations(id)
    )
  `);
  await runQuery(`CREATE INDEX IF NOT EXISTS idx_org_work_reports_org ON org_work_reports(org_id);`);

  saveDatabaseNow();
  console.log('✅ Maratha Organizations suite migration completed successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('migrate_organizations.mjs')) {
  migrateOrganizationsSuite()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration error:', err);
      process.exit(1);
    });
}
