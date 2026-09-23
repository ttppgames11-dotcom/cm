import http from 'http';

const cleanReactRoutes = [
  '/',
  '/history',
  '/history/shivaji-maharaj',
  '/history/sambhaji-maharaj',
  '/history/rajmata-jijau',
  '/history/bajirao-peshwa',
  '/history/warriors',
  '/forts',
  '/forts/raigad',
  '/forts/pratapgad',
  '/forts/rajgad',
  '/forts/shivneri',
  '/forts/torna',
  '/network',
  '/card',
  '/register',
  '/login',
  '/dashboard',
  '/sangam',
  '/referrals',
  '/create-referral',
  '/admin',
  '/ceo',
  '/about',
  '/contact',
  '/community',
  '/events',
  '/services',
  '/donation',
  '/governance',
  '/leaders',
  '/business/directory',
  '/business',
  '/directory',
  '/jobs',
  '/gallery',
  '/culture',
  '/profile'
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      resolve({ path, status: res.statusCode, ok: res.statusCode === 200 });
    }).on('error', (err) => {
      resolve({ path, error: err.message, ok: false });
    });
  });
}

async function run() {
  console.log('Testing Connect Maratha 100% React Routes (No HTML format)...');
  let allPass = true;
  for (const path of cleanReactRoutes) {
    const result = await checkRoute(path);
    if (result.ok) {
      console.log(`[PASS] ${result.path} => HTTP ${result.status}`);
    } else {
      console.log(`[FAIL] ${result.path} => ${result.error || result.status}`);
      allPass = false;
    }
  }
  if (allPass) {
    console.log(`\nSUCCESS: All ${cleanReactRoutes.length} clean React routes responded with HTTP 200 OK!`);
  } else {
    console.log('\nSome routes failed.');
    process.exit(1);
  }
}

run();
