import { runQuery, saveDatabaseNow } from '../database/database.js';

export async function migrateWomenTables() {
  console.log('Migrating enhanced Women Empowerment tables in SQLite...');

  const safeAlter = async (tbl, col, type) => {
    try {
      await runQuery(`ALTER TABLE ${tbl} ADD COLUMN ${col} ${type};`);
    } catch (_) {}
  };

  // 1. Women Entrepreneurs Directory
  await runQuery(`
    CREATE TABLE IF NOT EXISTS women_entrepreneurs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      business_name TEXT NOT NULL,
      category TEXT NOT NULL,
      sub_category TEXT,
      district TEXT NOT NULL,
      taluka TEXT,
      city TEXT,
      description TEXT,
      products_services TEXT,
      contact_phone TEXT NOT NULL,
      whatsapp TEXT,
      email TEXT,
      website TEXT,
      instagram TEXT,
      photo TEXT,
      shg_name TEXT,
      is_shg INTEGER DEFAULT 0,
      employees_count INTEGER DEFAULT 1,
      annual_turnover TEXT,
      verified INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL
    )
  `);

  // 2. Ensure all columns exist in women_programs
  await runQuery(`
    CREATE TABLE IF NOT EXISTS women_programs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'scheme',
      category TEXT,
      provider TEXT,
      description TEXT,
      eligibility TEXT,
      benefits TEXT,
      duration TEXT,
      district TEXT DEFAULT 'सर्व महाराष्ट्र',
      contact_phone TEXT,
      apply_url TEXT,
      deadline TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL
    )
  `);

  await safeAlter('women_programs', 'type', "TEXT DEFAULT 'scheme'");
  await safeAlter('women_programs', 'provider', 'TEXT');
  await safeAlter('women_programs', 'eligibility', 'TEXT');
  await safeAlter('women_programs', 'duration', 'TEXT');
  await safeAlter('women_programs', 'apply_url', 'TEXT');
  await safeAlter('women_programs', 'deadline', 'TEXT');
  await safeAlter('women_programs', 'status', "TEXT DEFAULT 'active'");

  // 3. Women Mentors & Directory
  await runQuery(`
    CREATE TABLE IF NOT EXISTS women_mentors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      field TEXT NOT NULL,
      experience TEXT,
      district TEXT,
      about TEXT,
      photo TEXT,
      contact_phone TEXT,
      email TEXT,
      available_modes TEXT DEFAULT 'फोन / व्हिडिओ कॉल / प्रत्यक्ष भेट',
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `);

  // 4. Confidential Women Help Cases & Grievances (मदत प्रकरणे)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS women_help_cases (
      id TEXT PRIMARY KEY,
      case_number TEXT UNIQUE NOT NULL,
      applicant_id TEXT,
      applicant_name TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      district TEXT NOT NULL,
      taluka TEXT,
      category TEXT NOT NULL,
      urgency TEXT DEFAULT 'सामान्य',
      description TEXT NOT NULL,
      preferred_time TEXT,
      assigned_coordinator TEXT,
      coordinator_phone TEXT,
      status TEXT DEFAULT 'समीक्षेत',
      counselor_notes TEXT,
      resolved_at TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // 5. NEW: Women Self-Help Groups (बचत गट फेडरेशन व खाती)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS women_shgs (
      id TEXT PRIMARY KEY,
      shg_name TEXT NOT NULL,
      president_name TEXT NOT NULL,
      secretary_name TEXT,
      phone TEXT NOT NULL,
      district TEXT NOT NULL,
      taluka TEXT NOT NULL,
      village TEXT,
      members_count INTEGER DEFAULT 10,
      bank_name TEXT,
      bank_branch TEXT,
      monthly_savings TEXT DEFAULT '₹५०० / महिना',
      activity_type TEXT NOT NULL,
      loan_status TEXT DEFAULT 'पात्र (Eligible)',
      revolving_fund_received INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `);

  // 6. NEW: B2B Product Showcase & Marketplace (महिला उत्पादने विक्री)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS women_products (
      id TEXT PRIMARY KEY,
      entrepreneur_id TEXT NOT NULL,
      seller_name TEXT NOT NULL,
      product_name TEXT NOT NULL,
      category TEXT NOT NULL,
      price TEXT NOT NULL,
      unit TEXT DEFAULT 'प्रति किलो / नग',
      district TEXT NOT NULL,
      photo TEXT,
      description TEXT,
      contact_phone TEXT NOT NULL,
      whatsapp TEXT,
      is_available INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    )
  `);

  // 7. NEW: 1-on-1 Mentorship Session Bookings (मार्गदर्शन सत्र नोंदणी)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS women_mentor_bookings (
      id TEXT PRIMARY KEY,
      mentor_id TEXT NOT NULL,
      mentor_name TEXT NOT NULL,
      applicant_id TEXT,
      applicant_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      district TEXT NOT NULL,
      topic TEXT NOT NULL,
      preferred_date TEXT,
      preferred_time TEXT,
      notes TEXT,
      status TEXT DEFAULT 'confirmed',
      created_at TEXT NOT NULL
    )
  `);

  saveDatabaseNow();
  console.log('✓ All 7 Women Empowerment tables migrated & ready in SQLite!');
}
