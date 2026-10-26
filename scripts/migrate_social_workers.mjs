import { runQuery, saveDatabaseNow } from '../database/database.js';

export async function migrateSocialWorkersSuite() {
  console.log('Migrating Nishthavant Social Workers (निष्ठावंत समाजसेवक) suite in SQLite...');

  const safeAlter = async (tbl, col, type) => {
    try {
      await runQuery(`ALTER TABLE ${tbl} ADD COLUMN ${col} ${type};`);
    } catch (_) {}
  };

  // 1. Upgrade / Create social_workers table
  await runQuery(`
    CREATE TABLE IF NOT EXISTS social_workers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      field TEXT NOT NULL,                   -- 'जलसंधारण व दुष्काळ मुक्ती', 'ग्रामीण आरोग्य व रुग्णमित्र', 'शेतकरी कुटुंब पुनर्वसन', 'मोफत विधी साहाय्य', 'अनाथ बालसंगोपन व शिक्षण', 'आपत्कालीन रक्त मदत व अवयवदान', 'गडकिल्ले संवर्धन'
      category TEXT NOT NULL DEFAULT 'social',-- 'water', 'health', 'farmers', 'legal', 'education', 'blood', 'heritage', 'emergency'
      district TEXT NOT NULL DEFAULT 'पुणे',
      taluka TEXT,
      location TEXT NOT NULL,
      experience TEXT NOT NULL,              -- '१५ वर्षे अविरत समाजसेवा'
      impact TEXT NOT NULL,                  -- परिणाम / साध्य केलेले कार्य
      icon TEXT DEFAULT '🤝',
      phone TEXT NOT NULL,
      email TEXT,
      organization TEXT,                     -- संलग्न सामाजिक संस्था / ट्रस्ट
      skills TEXT,                           -- 'आपत्ती बचाव, समुपदेशन, कायदेशीर मार्गदर्शन'
      availability TEXT DEFAULT 'पूर्णवेळ (Full-time)', -- 'पूर्णवेळ', 'शनिवार-रविवार', 'आपत्कालीन २४x७'
      volunteer_hours INTEGER DEFAULT 500,   -- समर्पित कामाचे तास
      cases_resolved INTEGER DEFAULT 50,     -- सोडवलेली मदत प्रकरणे
      rating REAL DEFAULT 4.9,
      is_verified INTEGER DEFAULT 1,
      verification_status TEXT DEFAULT 'सत्यापित समाजसेवक (Verified)',
      awards TEXT,                           -- पुरस्कार व सन्मान
      bio TEXT,
      created_at TEXT NOT NULL
    )
  `);

  await safeAlter('social_workers', 'taluka', 'TEXT');
  await safeAlter('social_workers', 'organization', 'TEXT');
  await safeAlter('social_workers', 'skills', 'TEXT');
  await safeAlter('social_workers', 'availability', "TEXT DEFAULT 'पूर्णवेळ (Full-time)'");
  await safeAlter('social_workers', 'volunteer_hours', 'INTEGER DEFAULT 500');
  await safeAlter('social_workers', 'cases_resolved', 'INTEGER DEFAULT 50');
  await safeAlter('social_workers', 'rating', 'REAL DEFAULT 4.9');
  await safeAlter('social_workers', 'verification_status', "TEXT DEFAULT 'सत्यापित समाजसेवक (Verified)'");
  await safeAlter('social_workers', 'bio', 'TEXT');

  // 2. Citizen Help Requests & Task Assignments (मदत मागणी व समाजसेवक कार्य वाटप)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS social_help_requests (
      id TEXT PRIMARY KEY,
      case_number TEXT UNIQUE NOT NULL,
      citizen_name TEXT NOT NULL,
      citizen_phone TEXT NOT NULL,
      district TEXT NOT NULL,
      taluka TEXT,
      category TEXT NOT NULL,                -- 'वैद्यकीय उपचार मदत', 'शेतकरी कुटुंब मदत', 'कायदेशीर सल्ला', 'शैक्षणिक फी सहाय्य', 'आपत्कालीन रक्तदान', 'राशन व अन्नछत्र'
      urgency TEXT NOT NULL DEFAULT 'मध्यम',  -- 'तातडीचे (Emergency)', 'उच्च (High)', 'मध्यम', 'सामान्य'
      description TEXT NOT NULL,
      assigned_worker_id TEXT,
      assigned_worker_name TEXT,
      status TEXT NOT NULL DEFAULT 'प्रलंबित (Pending)', -- 'प्रलंबित (Pending)', 'नियुक्त (Assigned)', 'प्रगतीपथावर (In Progress)', 'यशस्वी पूर्ण (Resolved)', 'रद्द'
      outcome_notes TEXT,                    -- परिणाम व मदतीचा तपशील
      resolved_at TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (assigned_worker_id) REFERENCES social_workers(id)
    )
  `);
  await runQuery(`CREATE INDEX IF NOT EXISTS idx_social_help_worker ON social_help_requests(assigned_worker_id);`);
  await runQuery(`CREATE INDEX IF NOT EXISTS idx_social_help_status ON social_help_requests(status);`);

  // 3. Social Campaigns & Shramdaan Missions (सामाजिक मोहिमा व प्रकल्प)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS social_missions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      lead_worker_id TEXT,
      lead_worker_name TEXT NOT NULL,
      category TEXT NOT NULL,
      district TEXT NOT NULL,
      target_goal TEXT NOT NULL,
      beneficiaries_count INTEGER DEFAULT 0,
      volunteers_engaged INTEGER DEFAULT 0,
      hours_invested INTEGER DEFAULT 0,
      start_date TEXT NOT NULL,
      end_date TEXT,
      status TEXT DEFAULT 'सक्रिय मोहीम (Active)',
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (lead_worker_id) REFERENCES social_workers(id)
    )
  `);

  // 4. Testimonials & Citizen Appreciation (नागरिकांची प्रशंसापत्रे व अनुभव)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS social_testimonials (
      id TEXT PRIMARY KEY,
      worker_id TEXT NOT NULL,
      citizen_name TEXT NOT NULL,
      citizen_city TEXT NOT NULL,
      testimonial TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      impact_story TEXT,
      verified INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      FOREIGN KEY (worker_id) REFERENCES social_workers(id)
    )
  `);
  await runQuery(`CREATE INDEX IF NOT EXISTS idx_social_testi_worker ON social_testimonials(worker_id);`);

  saveDatabaseNow();
  console.log('✅ Nishthavant Social Workers suite migrated successfully in SQLite!');
}

if (process.argv[1] && process.argv[1].endsWith('migrate_social_workers.mjs')) {
  migrateSocialWorkersSuite()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration error:', err);
      process.exit(1);
    });
}
