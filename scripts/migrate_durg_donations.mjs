import { runQuery, saveDatabaseNow } from '../database/database.js';

export async function migrateDurgDonationsTables() {
  console.log('Migrating Durg Sanvardhan & Donations suite tables in SQLite...');

  const safeAlter = async (tbl, col, type) => {
    try {
      await runQuery(`ALTER TABLE ${tbl} ADD COLUMN ${col} ${type};`);
    } catch (_) {}
  };

  // 1. Fort Conservation & Heritage Restoration Projects (दुर्ग संवर्धन प्रकल्प)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS durg_projects (
      id TEXT PRIMARY KEY,
      fort_name TEXT NOT NULL,
      title TEXT NOT NULL,
      district TEXT NOT NULL,
      taluka TEXT,
      category TEXT DEFAULT 'तटबंदी व बुरुज संवर्धन', -- 'तटबंदी व बुरुज संवर्धन', 'पाण्याची टाकी व पायऱ्या स्वच्छता', 'माहिती फलक व दिशादर्शक', 'वृक्षारोपण व प्लास्टिक मुक्ती', 'ऐतिहासिक वास्तू उत्खनन'
      target_amount REAL NOT NULL,
      collected_amount REAL DEFAULT 0,
      spent_amount REAL DEFAULT 0,
      donors_count INTEGER DEFAULT 0,
      volunteers_count INTEGER DEFAULT 0,
      phase TEXT DEFAULT 'काम सुरू (Phase 1)',
      completion_percentage INTEGER DEFAULT 0,
      cover_image TEXT,
      description TEXT NOT NULL,
      asi_approval_ref TEXT,               -- ASI / पुरातत्व विभाग अधिकृत परवानगी संदर्भ क्रमांक
      lead_organization TEXT,              -- आयोजक / संवर्धन संस्था (उदा. दुर्गवीर प्रतिष्ठान, सह्याद्री प्रतिष्ठान)
      coordinator_name TEXT NOT NULL,
      coordinator_phone TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL
    )
  `);

  // Ensure columns in campaigns table if needed
  await safeAlter('campaigns', 'bank_account_name', "TEXT DEFAULT 'Connect Maratha Heritage Foundation'");
  await safeAlter('campaigns', 'bank_account_no', "TEXT DEFAULT '50200098765432'");
  await safeAlter('campaigns', 'bank_ifsc', "TEXT DEFAULT 'MAHB0001234'");
  await safeAlter('campaigns', 'tax_exemption_80g', "TEXT DEFAULT '80G(5)(vi) Reg No: AAATC80G20261'");

  // 2. Verified Donations, Receipts & 80G Tax History (पावत्या व देणगी कोष)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS donations (
      id TEXT PRIMARY KEY,
      campaign_id TEXT,
      project_id TEXT,
      campaign_title TEXT,
      donor_name TEXT NOT NULL,
      donor_id TEXT,
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'UPI',  -- 'UPI', 'NetBanking', 'Cheque', 'NEFT'
      phone TEXT,
      email TEXT,
      pan_number TEXT,
      is_anonymous INTEGER DEFAULT 0,
      tx_id TEXT UNIQUE NOT NULL,
      receipt_no TEXT UNIQUE NOT NULL,
      tax_80g_eligible INTEGER DEFAULT 1,
      payment_status TEXT DEFAULT 'SUCCESS',
      created_at TEXT NOT NULL
    )
  `);

  await safeAlter('donations', 'project_id', 'TEXT');
  await safeAlter('donations', 'email', 'TEXT');
  await safeAlter('donations', 'pan_number', 'TEXT');
  await safeAlter('donations', 'receipt_no', 'TEXT');
  await safeAlter('donations', 'tax_80g_eligible', 'INTEGER DEFAULT 1');
  await safeAlter('donations', 'payment_status', "TEXT DEFAULT 'SUCCESS'");

  // 3. Project Expenses & Financial Audit Vouchers (खर्च मंजुरी व लेखापरीक्षण)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS durg_expenses (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      voucher_number TEXT UNIQUE NOT NULL,
      expense_title TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,              -- 'बांधकाम साहित्य व चुना', 'मजूर व कारागीर', 'पाण्याचे पंप व यंत्रसामग्री', 'सुरक्षा रेलिंग', 'ऑडिट व कायदेशीर फी'
      invoice_ref TEXT,
      payment_mode TEXT DEFAULT 'Bank Transfer (NEFT)',
      approved_by TEXT NOT NULL,
      approval_date TEXT,
      audit_status TEXT DEFAULT 'Verified (Audited)',
      notes TEXT,
      created_at TEXT NOT NULL
    )
  `);

  // 4. Fort Shramdaan & Volunteer Enlistment (श्रमदान व स्वयंसेवक मोहीम)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS durg_volunteers (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      fort_name TEXT NOT NULL,
      volunteer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      district TEXT NOT NULL,
      blood_group TEXT,
      trek_experience TEXT,               -- 'नवशिके (Beginner)', 'मध्यम (Moderate)', 'अनुभवी गिर्यारोहक (Expert)'
      participated_camps INTEGER DEFAULT 1,
      skills TEXT,                        -- 'प्रथमोपचार', 'दगडी बांधकाम', 'फोटोग्राफी', 'इतिहास अभ्यासक'
      status TEXT DEFAULT 'active',
      created_at TEXT NOT NULL
    )
  `);

  // 5. Historical Audit Reports & Financial Transparency (वार्षिक लेखापरीक्षण अहवाल)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS donation_audits (
      id TEXT PRIMARY KEY,
      financial_year TEXT NOT NULL,
      ca_firm_name TEXT NOT NULL,
      ca_membership_no TEXT NOT NULL,
      total_receipts REAL NOT NULL,
      total_expenditure REAL NOT NULL,
      surplus_balance REAL NOT NULL,
      audit_report_url TEXT,
      certificate_status TEXT DEFAULT 'Unqualified (Clean Audit)',
      created_at TEXT NOT NULL
    )
  `);

  saveDatabaseNow();
  console.log('✓ All 5 Durg Sanvardhan & Donations tables migrated successfully in SQLite!');
}
