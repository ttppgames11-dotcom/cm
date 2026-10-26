// verify_career_6_portals.mjs
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Verifying 6 Recruitment & Career Portals Endpoints ---');

  const tests = [
    { name: '1. Jobs Portal (GET /api/jobs)', url: `${BASE_URL}/jobs` },
    { name: '2. Professionals Directory (GET /api/businesses)', url: `${BASE_URL}/businesses` },
    { name: '3. Doctors Directory (GET /api/doctors)', url: `${BASE_URL}/doctors` },
    { name: '4. Services Marketplace (GET /api/services)', url: `${BASE_URL}/services` },
    { name: '5. Civil Services & Officers (GET /api/officers)', url: `${BASE_URL}/officers` },
    { name: '6. Motivational Speakers (GET /api/speakers)', url: `${BASE_URL}/speakers` },
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const res = await fetch(t.url);
      const data = await res.json();
      console.log(`[PASS] ${t.name} -> HTTP ${res.status}, items/data length:`, Array.isArray(data) ? data.length : (data.data?.length || data.jobs?.length || data.services?.length || Object.keys(data).length));
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${t.name}:`, err.message);
    }
  }

  console.log(`\nResults: ${passed}/${tests.length} career portal endpoints verified successfully!`);
}

runTests();
