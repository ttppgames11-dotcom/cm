const fs = require('fs');
const path = require('path');

async function runDeepAudit() {
  console.log('====================================================');
  console.log('       CONNECT MARATHA FULL PROJECT DEEP AUDIT      ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function report(name, isPass, details = '') {
    if (isPass) {
      passed++;
      console.log(`[PASS] ${name} ${details}`);
    } else {
      failed++;
      console.error(`[FAIL] ${name} ${details}`);
    }
  }

  // 1. Filesystem & Environment Checks
  console.log('--- 1. FILE STRUCTURE & INTEGRITY ---');
  const requiredFiles = [
    'index.html',
    'vite.config.js',
    'package.json',
    'src/main.jsx',
    'src/App.jsx',
    'src/styles/home.css',
    'assets/css/style.css',
    'assets/images/logo.png',
    'assets/videos/bhagwa-flag-waving.mp4',
    'server/server.js',
    'server/db/database.js',
    'server/db/schema.sql',
    'server/db/seed.js',
    'server/db/connect_maratha.db'
  ];

  for (const f of requiredFiles) {
    const exists = fs.existsSync(f);
    report(`File exists: ${f}`, exists, exists ? `(${fs.statSync(f).size} bytes)` : 'MISSING!');
  }

  // 2. Database Schema & Tables
  console.log('\n--- 2. DATABASE SCHEMA & DATA TABLES ---');
  try {
    const { pathToFileURL } = require('url');
    const dbUrl = pathToFileURL(path.resolve('server/db/database.js')).href;
    const dbModule = await import(dbUrl);
    const tables = [
      'members',
      'businesses',
      'business_reviews',
      'referrals',
      'meetings',
      'groups',
      'group_members',
      'posts',
      'campaigns',
      'donations',
      'events',
      'event_rsvps',
      'jobs',
      'job_applications',
      'audit_logs'
    ];

    const validTables = new Set(tables);
    for (const tbl of tables) {
      if (!validTables.has(tbl)) continue;
      try {
        const rows = await dbModule.all(`SELECT count(*) as cnt FROM sqlite_master WHERE type='table' AND name = ?`, [tbl]);
        const exists = rows && rows[0] && rows[0].cnt > 0;
        if (exists) {
          // Count records safely with static table mapping
          const countQueryMap = {
            members: 'SELECT count(*) as cnt FROM members',
            businesses: 'SELECT count(*) as cnt FROM businesses',
            business_reviews: 'SELECT count(*) as cnt FROM business_reviews',
            referrals: 'SELECT count(*) as cnt FROM referrals',
            meetings: 'SELECT count(*) as cnt FROM meetings',
            groups: 'SELECT count(*) as cnt FROM groups',
            group_members: 'SELECT count(*) as cnt FROM group_members',
            posts: 'SELECT count(*) as cnt FROM posts',
            campaigns: 'SELECT count(*) as cnt FROM campaigns',
            donations: 'SELECT count(*) as cnt FROM donations',
            events: 'SELECT count(*) as cnt FROM events',
            event_rsvps: 'SELECT count(*) as cnt FROM event_rsvps',
            jobs: 'SELECT count(*) as cnt FROM jobs',
            job_applications: 'SELECT count(*) as cnt FROM job_applications',
            audit_logs: 'SELECT count(*) as cnt FROM audit_logs'
          };
          const countRows = await dbModule.all(countQueryMap[tbl]);
          const count = countRows && countRows[0] ? countRows[0].cnt : 0;
          report(`Table '${tbl}'`, true, `(${count} records)`);
        } else {
          report(`Table '${tbl}'`, false, 'Table not found in database');
        }
      } catch (err) {
        report(`Table '${tbl}'`, false, err.message);
      }
    }
  } catch (err) {
    report('Database connection', false, err.message);
  }

  // 3. Backend REST API (Direct: Port 5000)
  console.log('\n--- 3. BACKEND API ENDPOINTS (http://localhost:5000) ---');
  const apiEndpoints = [
    { ep: '/api/health', method: 'GET', expect: 200 },
    { ep: '/api/members', method: 'GET', expect: 200 },
    { ep: '/api/members/stats', method: 'GET', expect: 200 },
    { ep: '/api/businesses', method: 'GET', expect: 200 },
    { ep: '/api/businesses?category=IT%20%26%20Software', method: 'GET', expect: 200 },
    { ep: '/api/sangam/referrals', method: 'GET', expect: 200 },
    { ep: '/api/sangam/meetings', method: 'GET', expect: 200 },
    { ep: '/api/community/posts', method: 'GET', expect: 200 },
    { ep: '/api/community/groups', method: 'GET', expect: 200 },
    { ep: '/api/events', method: 'GET', expect: 200 },
    { ep: '/api/donations/campaigns', method: 'GET', expect: 200 },
    { ep: '/api/jobs', method: 'GET', expect: 200 },
    { ep: '/api/admin/metrics', method: 'GET', expect: 200 }
  ];

  for (const item of apiEndpoints) {
    try {
      const res = await fetch(`http://localhost:5000${item.ep}`);
      const ok = res.status === item.expect;
      let countText = '';
      if (ok) {
        const json = await res.json();
        if (Array.isArray(json)) countText = `[${json.length} items]`;
        else if (json.data && Array.isArray(json.data)) countText = `[${json.data.length} items]`;
      }
      report(`API ${item.ep}`, ok, `HTTP ${res.status} ${countText}`);
    } catch (err) {
      report(`API ${item.ep}`, false, err.message);
    }
  }

  // 4. Vite Proxy API (Port 3000 -> 5000)
  console.log('\n--- 4. VITE DEV SERVER PROXY (/api via port 3000) ---');
  try {
    const res = await fetch('http://localhost:3000/api/health');
    const data = await res.json();
    report('Vite Proxy /api/health', res.status === 200, `Status: ${data.status} | DB: ${data.database}`);
  } catch (err) {
    report('Vite Proxy /api/health', false, err.message);
  }

  // 5. Clean React Routes (Port 3000)
  console.log('\n--- 5. FRONTEND ROUTES RESOLUTION (38 Routes) ---');
  const routes = [
    '/',
    '/history',
    '/history/shivaji-maharaj',
    '/history/sambhaji-maharaj',
    '/history/rajmata-jijau',
    '/history/bajirao-peshwa',
    '/history/battles',
    '/forts',
    '/forts/raigad',
    '/forts/shivneri',
    '/network',
    '/card',
    '/register',
    '/login',
    '/dashboard',
    '/profile',
    '/sangam',
    '/referrals',
    '/create-referral',
    '/business',
    '/business/directory',
    '/community',
    '/events',
    '/donation',
    '/directory',
    '/jobs',
    '/gallery',
    '/culture',
    '/governance',
    '/about',
    '/contact',
    '/admin',
    '/ceo',
    '/search',
    '/dnyankosh',
    '/granthalaya',
    '/history/balidan-maas',
    '/history/warriors',
    '/history/navy',
    '/history/dates',
    '/history/swarajya-administration',
    '/forts/trails',
    '/community/safety',
    '/history/movements',
    '/news',
    '/notifications',
    '/messages',
    '/services/booking',
    '/blueprint',
    '/more',
    '/culture/symbols',
    '/culture/temples'
  ];

  for (const r of routes) {
    try {
      const res = await fetch(`http://localhost:3000${r}`);
      const text = await res.text();
      const hasRoot = text.includes('id="root"');
      report(`Route '${r}'`, res.status === 200 && hasRoot, `HTTP ${res.status}`);
    } catch (err) {
      report(`Route '${r}'`, false, err.message);
    }
  }

  // 6. Legacy .html URL Automatic Redirects
  console.log('\n--- 6. LEGACY .HTML AUTO-REDIRECTS ---');
  const legacyLinks = [
    '/index.html',
    '/cm-home.html',
    '/cm-history.html',
    '/cm-forts-map.html',
    '/cm-network.html',
    '/cm-card.html',
    '/cm-business-directory.html',
    '/cm-community.html',
    '/cm-events.html',
    '/cm-donation.html',
    '/cm-search.html',
    '/cm-dnyankosh.html',
    '/cm-granthalaya.html',
    '/cm-balidan-maas.html',
    '/cm-battles.html',
    '/cm-warriors.html',
    '/cm-maratha-navy.html',
    '/cm-historical-dates.html',
    '/cm-swarajya-administration.html',
    '/cm-heritage-trails.html',
    '/cm-community-safety.html',
    '/cm-movements.html',
    '/cm-news.html',
    '/cm-notifications.html',
    '/cm-messages.html',
    '/cm-service-booking.html',
    '/cm-blueprint.html',
    '/cm-more.html',
    '/cm-symbols.html',
    '/cm-temples.html'
  ];

  for (const l of legacyLinks) {
    try {
      const res = await fetch(`http://localhost:3000${l}`);
      report(`Legacy URL '${l}' handled`, res.status === 200, `HTTP ${res.status}`);
    } catch (err) {
      report(`Legacy URL '${l}'`, false, err.message);
    }
  }

  // 7. Key Visual & Asset Checks
  console.log('\n--- 7. KEY VISUAL ASSETS & IMAGERY ---');
  const keyImages = [
    'assets/images/logo.png',
    'assets/images/real-shivaji-portrait.jpg',
    'assets/images/real-shivaji-coronation.jpg',
    'assets/images/real-raigad-panoramic.jpg',
    'assets/images/real-sindhudurg-fort.jpg',
    'assets/images/real-maratha-army-panoramic.jpg',
    'assets/images/real-maratha-peak-map.jpg',
    'assets/images/maratha-samrajya.jpg',
    'assets/videos/bhagwa-flag-waving.mp4'
  ];

  for (const img of keyImages) {
    const exists = fs.existsSync(img);
    report(`Asset file '${img}'`, exists, exists ? `(${Math.round(fs.statSync(img).size / 1024)} KB)` : 'MISSING');
  }

  console.log('\n====================================================');
  console.log(`AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runDeepAudit().catch(err => {
  console.error('Fatal error during deep audit:', err);
  process.exit(1);
});
