// database/migrations/005_seven_portals_schema.mjs
import { runQuery, all } from '../database.js';

export async function up() {
  console.log('🚀 Running 005_seven_portals_schema migration...');

  // 1. Colleges & Educational Institutions Directory
  await runQuery(`
    CREATE TABLE IF NOT EXISTS colleges_directory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      type TEXT,
      affiliation TEXT,
      district TEXT,
      city TEXT,
      division TEXT,
      address TEXT,
      website TEXT,
      phone TEXT,
      email TEXT,
      established_year INTEGER,
      naac_grade TEXT,
      hostel_facility INTEGER DEFAULT 0,
      stream TEXT,
      stream_label TEXT,
      streams TEXT DEFAULT '[]',
      courses TEXT DEFAULT '[]',
      fee_range TEXT,
      scholarships_supported TEXT DEFAULT '[]',
      verification_status TEXT DEFAULT 'verified',
      is_partner INTEGER DEFAULT 0,
      created_at TEXT
    );
  `);

  // 2. Scholarships Directory
  await runQuery(`
    CREATE TABLE IF NOT EXISTS scholarships_directory (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      org TEXT NOT NULL,
      type TEXT DEFAULT 'govt',
      category TEXT,
      eligible TEXT,
      benefit TEXT,
      courses TEXT,
      min_marks REAL DEFAULT 0,
      max_income REAL,
      district TEXT,
      portal_url TEXT,
      last_date TEXT,
      badge TEXT,
      documents_required TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active',
      created_at TEXT
    );
  `);

  // 3. Scholarship Applications & Assistance Fund Tracker
  await runQuery(`
    CREATE TABLE IF NOT EXISTS scholarship_applications (
      id TEXT PRIMARY KEY,
      scholarship_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      district TEXT,
      current_course TEXT,
      family_income REAL,
      marks_percentage REAL,
      status TEXT DEFAULT 'submitted',
      documents TEXT DEFAULT '[]',
      reviewer_notes TEXT,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // 4. Career Guidance Bookings & Mentorship
  await runQuery(`
    CREATE TABLE IF NOT EXISTS career_guidance_bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      student_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      district TEXT,
      current_education TEXT,
      target_field TEXT,
      counsellor_id TEXT,
      session_type TEXT DEFAULT 'online',
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TEXT
    );
  `);

  // 5. Maratha Dnyankosh Encyclopedia Articles
  await runQuery(`
    CREATE TABLE IF NOT EXISTS dnyankosh_articles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      icon TEXT,
      summary TEXT,
      content TEXT,
      author_id TEXT,
      author_name TEXT,
      status TEXT DEFAULT 'published',
      sources TEXT DEFAULT '[]',
      related_links TEXT DEFAULT '[]',
      views_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  // 6. Digital Library & Rare Bakhars Catalog
  await runQuery(`
    CREATE TABLE IF NOT EXISTS library_catalog (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      original_title TEXT,
      author TEXT NOT NULL,
      category TEXT NOT NULL,
      level TEXT,
      pages TEXT,
      language TEXT,
      image TEXT,
      description TEXT,
      highlight TEXT,
      preservation TEXT,
      is_rare_bakhar INTEGER DEFAULT 0,
      status TEXT DEFAULT 'verified',
      pdf_url TEXT,
      table_of_contents TEXT DEFAULT '[]',
      detailed_sections TEXT DEFAULT '[]',
      created_at TEXT
    );
  `);

  // 7. Maharashtra Time Machine Epochs & Events
  await runQuery(`
    CREATE TABLE IF NOT EXISTS time_machine_events (
      id TEXT PRIMARY KEY,
      year INTEGER,
      approx_date TEXT,
      era_id TEXT NOT NULL,
      era_title TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT,
      coordinates TEXT,
      personalities TEXT DEFAULT '[]',
      summary TEXT,
      details TEXT,
      historical_significance TEXT,
      source_reference TEXT,
      related_forts TEXT DEFAULT '[]',
      created_at TEXT
    );
  `);

  console.log('✅ 005_seven_portals_schema migration successfully applied!');
}

if (process.argv[1]?.endsWith('005_seven_portals_schema.mjs')) {
  up().then(() => process.exit(0)).catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
