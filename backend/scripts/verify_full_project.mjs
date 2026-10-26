// verify_full_project.mjs
import { all, get } from '../../database/database.js';

const BASE_URL = 'http://localhost:5000/api';

async function verifyFullProject() {
  console.log('========================================================================');
  console.log('         CONNECT MARATHA — COMPREHENSIVE FULL PROJECT AUDIT             ');
  console.log('========================================================================\n');

  // 1. DATABASE AUDIT
  console.log('--- 1. DATABASE INTEGRITY AUDIT ---');
  try {
    const tables = await all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    console.log(`[PASS] Total Database Tables: ${tables.length}`);
    
    // Check row counts on critical tables
    const keyTables = [
      'users', 'members', 'colleges_directory', 'scholarships_directory',
      'dnyankosh_articles', 'library_catalog', 'time_machine_events',
      'quiz_questions', 'blood_donors', 'businesses', 'news_articles',
      'social_workers', 'government_officers', 'jobs'
    ];

    for (const t of keyTables) {
      try {
        const count = await get(`SELECT COUNT(*) as c FROM ${t}`);
        console.log(`  • Table '${t.padEnd(25)}' -> Rows: ${count?.c ?? 0}`);
      } catch (err) {
        console.log(`  ! Table '${t.padEnd(25)}' -> Check: ${err.message}`);
      }
    }
  } catch (dbErr) {
    console.error('[FAIL] Database connection error:', dbErr.message);
  }

  // 2. BACKEND API ENDPOINTS AUDIT
  console.log('\n--- 2. BACKEND API ENDPOINTS AUDIT ---');
  const endpoints = [
    // Core & Auth
    { name: 'System Health Check', url: `${BASE_URL}/health` },
    { name: 'Colleges Directory', url: `${BASE_URL}/colleges` },
    { name: 'Scholarships Portal', url: `${BASE_URL}/portals/scholarships` },
    { name: 'Dnyankosh Articles', url: `${BASE_URL}/portals/dnyankosh` },
    { name: 'Library & Bakhars', url: `${BASE_URL}/portals/library` },
    { name: 'Time Machine Timeline', url: `${BASE_URL}/portals/time-machine/events` },
    { name: 'Quiz Questions', url: `${BASE_URL}/quiz/questions` },
    { name: 'Blood Help Portal', url: `${BASE_URL}/blood/donors` },
    { name: 'Matrimony Directory', url: `${BASE_URL}/matrimony` },
    { name: 'Women Empowerment Hub', url: `${BASE_URL}/women/programs` },
    { name: 'Donations & Forts', url: `${BASE_URL}/donations/campaigns` },
    { name: 'Social Organizations', url: `${BASE_URL}/organizations` },
    { name: 'Political Grievances', url: `${BASE_URL}/political/grievances` },
    { name: 'Social Workers Directory', url: `${BASE_URL}/social-workers` },
    { name: 'Civil Services Officers', url: `${BASE_URL}/officers` },
    { name: 'Maratha News Media', url: `${BASE_URL}/maratha-news` },
    { name: 'Jobs Portal', url: `${BASE_URL}/jobs` },
    { name: 'Businesses Directory', url: `${BASE_URL}/businesses` },
    { name: 'Doctors Directory', url: `${BASE_URL}/doctors` },
    { name: 'Services Marketplace', url: `${BASE_URL}/services` },
    { name: 'Speakers Network', url: `${BASE_URL}/speakers` },
    { name: 'Unified Ecosystem Stats', url: `${BASE_URL}/portals/unified-stats` },
    { name: 'Admin Pending Approvals', url: `${BASE_URL}/portals/admin/pending-approvals` }
  ];

  let passedApis = 0;
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url);
      const data = await res.json();
      let count = 0;
      if (Array.isArray(data)) count = data.length;
      else if (data && typeof data === 'object') {
        const pk = Object.keys(data).find(k => Array.isArray(data[k]));
        if (pk) count = data[pk].length;
        else if (data.data && Array.isArray(data.data)) count = data.data.length;
        else count = Object.keys(data).length;
      }
      if (res.ok) {
        console.log(`[PASS] ${ep.name.padEnd(30)} -> HTTP ${res.status} | Data items: ${count}`);
        passedApis++;
      } else {
        console.log(`[FAIL] ${ep.name.padEnd(30)} -> HTTP ${res.status}`);
      }
    } catch (err) {
      console.error(`[FAIL] ${ep.name.padEnd(30)} -> Error: ${err.message}`);
    }
  }

  // 3. FRONTEND PORT RUNTIME CHECK
  console.log('\n--- 3. FRONTEND DEV SERVER AUDIT ---');
  try {
    const fRes = await fetch('http://localhost:3001');
    console.log(`[PASS] Frontend Vite Dev Server running on http://localhost:3001 -> HTTP ${fRes.status}`);
  } catch (fErr) {
    console.log(`[WARN] Frontend server on 3001: ${fErr.message}`);
  }

  console.log('\n========================================================================');
  console.log(`Full Audit Complete: ${passedApis}/${endpoints.length} API modules active and passing!`);
  console.log('========================================================================\n');
}

verifyFullProject();
