const fs = require('fs');
const http = require('http');

async function get(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    }).on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   CONNECT MARATHA COMPREHENSIVE END-TO-END TEST    ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, info = '') {
    if (condition) {
      console.log(`[PASS] ${name} ${info ? '(' + info + ')' : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name} ${info ? '(' + info + ')' : ''}`);
      failed++;
    }
  }

  // 1. Backend Server & API Checks
  console.log('--- 1. BACKEND SERVER & DATABASE TESTS (Port 5000) ---');
  const healthRes = await get('http://localhost:5000/api/health');
  assert('Backend Health API', healthRes.status === 200, `HTTP ${healthRes.status}`);

  const membersRes = await get('http://localhost:5000/api/members');
  assert('API /api/members', membersRes.status === 200, `HTTP ${membersRes.status}`);

  const bizRes = await get('http://localhost:5000/api/businesses');
  assert('API /api/businesses', bizRes.status === 200, `HTTP ${bizRes.status}`);

  const sangamRes = await get('http://localhost:5000/api/sangam/referrals');
  assert('API /api/sangam/referrals', sangamRes.status === 200, `HTTP ${sangamRes.status}`);

  // 2. Vite Frontend Server & API Proxy
  console.log('\n--- 2. VITE DEV SERVER & PROXY TESTS (Port 3000) ---');
  const viteProxy = await get('http://localhost:3000/api/health');
  assert('Vite Proxy /api/health', viteProxy.status === 200, `HTTP ${viteProxy.status}`);

  // 3. Register Page & Core Authentication Routes
  console.log('\n--- 3. REGISTER & AUTHENTICATION UI ROUTES ---');
  const regRes = await get('http://localhost:3000/register');
  assert('Register Page /register', regRes.status === 200 && regRes.data.includes('id="root"'), 'HTTP 200');

  const loginRes = await get('http://localhost:3000/login');
  assert('Login Page /login', loginRes.status === 200 && loginRes.data.includes('id="root"'), 'HTTP 200');

  const cardRes = await get('http://localhost:3000/card');
  assert('Digital Card Page /card', cardRes.status === 200 && cardRes.data.includes('id="root"'), 'HTTP 200');

  const dashRes = await get('http://localhost:3000/dashboard');
  assert('Member Dashboard /dashboard', dashRes.status === 200 && dashRes.data.includes('id="root"'), 'HTTP 200');

  // 4. Test all 81 legacy .html files to ensure every single one resolves cleanly
  console.log('\n--- 4. ALL 81 LEGACY .HTML REDIRECTS & LINKS TEST ---');
  const legacyDir = 'legacy_html/archive';
  const htmlFiles = fs.readdirSync(legacyDir).filter(f => f.endsWith('.html'));

  console.log(`Auditing and fetching all ${htmlFiles.length} legacy .html URLs through Vite dev server...`);
  for (const file of htmlFiles) {
    const res = await get(`http://localhost:3000/${file}`);
    const ok = res.status === 200 && res.data.includes('id="root"');
    assert(`Legacy URL /${file}`, ok, `HTTP ${res.status}`);
  }

  // 5. Test all modern dedicated converted React routes
  console.log('\n--- 5. CONVERTED REACT FEATURE ROUTES TEST ---');
  const modernRoutes = [
    '/',
    '/search',
    '/dnyankosh',
    '/granthalaya',
    '/history',
    '/history/battles',
    '/history/warriors',
    '/history/navy',
    '/history/balidan-maas',
    '/history/dates',
    '/history/swarajya-administration',
    '/history/movements',
    '/forts',
    '/forts/trails',
    '/forts/raigad',
    '/forts/pratapgad',
    '/forts/shivneri',
    '/network',
    '/sangam',
    '/referrals',
    '/create-referral',
    '/business/directory',
    '/community',
    '/community/safety',
    '/news',
    '/notifications',
    '/messages',
    '/services/booking',
    '/blueprint',
    '/more',
    '/culture/symbols',
    '/culture/temples',
    '/gallery',
    '/governance',
    '/about',
    '/contact',
    '/admin',
    '/ceo'
  ];

  for (const r of modernRoutes) {
    const res = await get(`http://localhost:3000${r}`);
    const ok = res.status === 200 && res.data.includes('id="root"');
    assert(`Route ${r}`, ok, `HTTP ${res.status}`);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
