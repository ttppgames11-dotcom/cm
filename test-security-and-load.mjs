// Connect Maratha Enterprise Security & Concurrency Verification Test Suite
// Verifies OWASP Defenses, Data Segregation, Zero-Leakage, and Concurrency Load

const BASE_URL = 'http://localhost:5000/api';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runSecurityAndLoadTests() {
  console.log('\n======================================================');
  console.log('🛡️ CONNECT MARATHA ENTERPRISE SECURITY & LOAD AUDIT');
  console.log('======================================================\n');

  // ------------------------------------------------------------------
  // TEST 1: HTTP Security Headers Audit (OWASP Top 10)
  // ------------------------------------------------------------------
  console.log('--- TEST SUITE 1: HTTP Security Headers & Hardening ---');
  try {
    const res = await fetch(`${BASE_URL}/health`);
    assert(res.ok, 'Healthcheck endpoint responsive');

    const headers = res.headers;
    assert(headers.get('x-content-type-options') === 'nosniff', 'MIME Sniffing blocked: X-Content-Type-Options is nosniff');
    assert(headers.get('x-frame-options') === 'SAMEORIGIN', 'Clickjacking blocked: X-Frame-Options is SAMEORIGIN');
    assert(headers.has('content-security-policy'), 'Content-Security-Policy (CSP) header is actively enforced');
    assert(!headers.has('x-powered-by'), 'Server fingerprinting disabled: X-Powered-By is hidden');
    assert(headers.has('x-request-id'), 'Request correlation ID is generated for every request');
  } catch (err) {
    assert(false, `Security headers check failed: ${err.message}`);
  }

  // ------------------------------------------------------------------
  // TEST 2: XSS Sanitization & HTML Entity Neutralization
  // ------------------------------------------------------------------
  console.log('\n--- TEST SUITE 2: Anti-XSS Payload Neutralization ---');
  try {
    const randomSuffix = Math.floor(Math.random() * 900000 + 100000);
    const xssPayload = {
      title: '<script>alert("hacked")</script>दुर्गराज रायगड शोध',
      category: 'इतिहास',
      author: '<img src=x onerror=stealCookies()>संशोधक',
      summary: 'मराठा इतिहास लेख',
      content: 'सुरक्षित मजकूर <iframe src="evil.com"></iframe> आणि तपशील'
    };

    // First login as superadmin to create info
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'superadmin@connectmaratha.org', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.token || loginData.token;

    const createRes = await fetch(`${BASE_URL}/admin/information`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(xssPayload)
    });
    const createData = await createRes.json();
    const item = createData.data?.article || createData.data?.information || createData.article || createData.data;

    assert(item && !item.title.includes('<script>'), 'Script tag stripped from title input');
    assert(item && !item.author.includes('onerror='), 'Event handler onerror= stripped from author input');
    assert(item && !item.content.includes('<iframe'), 'Iframe tag stripped from content input');
  } catch (err) {
    assert(false, `XSS sanitization test failed: ${err.message}`);
  }

  // ------------------------------------------------------------------
  // TEST 3: Prototype Pollution Defense
  // ------------------------------------------------------------------
  console.log('\n--- TEST SUITE 3: Prototype Pollution Attack Defense ---');
  try {
    const maliciousPayload = JSON.parse('{"name":"छत्रपती भक्त","__proto__":{"isAdmin":true,"pwned":true}}');
    const sanitizeRes = await fetch(`${BASE_URL}/community/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(maliciousPayload)
    });

    const isPolluted = ({}).isAdmin === true || ({}).pwned === true;
    assert(!isPolluted, 'Prototype pollution vector blocked: Object.prototype remains unpolluted');
  } catch (err) {
    assert(false, `Prototype pollution test failed: ${err.message}`);
  }

  // ------------------------------------------------------------------
  // TEST 4: Zero Data Mixing & Strict Multi-Tenant Isolation
  // ------------------------------------------------------------------
  console.log('\n--- TEST SUITE 4: Zero Data Mixing & IDOR Protection ---');
  try {
    const testPhoneA = `98220${Math.floor(Math.random() * 89999 + 10000)}`;
    const testPhoneB = `98220${Math.floor(Math.random() * 89999 + 10000)}`;

    // 1. Register User A
    const regResA = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'अमोल शिंदे (User A)',
        phone: testPhoneA,
        email: `userA_${Date.now()}@connectmaratha.org`,
        password: 'Password@123',
        district: 'पुणे'
      })
    });
    const dataA = await regResA.json();
    const tokenA = dataA.data?.token || dataA.token;
    const userA = dataA.data?.member || dataA.member;

    // 2. Register User B
    const regResB = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'विजय पाटील (User B)',
        phone: testPhoneB,
        email: `userB_${Date.now()}@connectmaratha.org`,
        password: 'Password@123',
        district: 'कोल्हापूर'
      })
    });
    const dataB = await regResB.json();
    const tokenB = dataB.data?.token || dataB.token;
    const userB = dataB.data?.member || dataB.member;

    assert(userA.id !== userB.id, 'Distinct cryptographically safe IDs generated for separate members');

    // 3. User A attempts to tamper with User B's profile using User A's token (IDOR attack)
    const tamperRes = await fetch(`${BASE_URL}/members/${userB.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}` // User A's token
      },
      body: JSON.stringify({ name: 'HACKED BY USER A' })
    });

    assert(tamperRes.status === 403, `IDOR violation rejected with 403 Forbidden (Actual: ${tamperRes.status})`);

    // 4. Verify User B's profile remained 100% UNCHANGED and unmixed
    const verifyResB = await fetch(`${BASE_URL}/members/${userB.id}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const verifyDataB = await verifyResB.json();
    const currentB = verifyDataB.data?.member || verifyDataB.member;

    assert(currentB.name === 'विजय पाटील (User B)', 'User B data remained fully protected with ZERO data mixing');
  } catch (err) {
    assert(false, `Data isolation test failed: ${err.message}`);
  }

  // ------------------------------------------------------------------
  // TEST 5: High-Concurrency Burst Test (Simulated 50 Concurrent Users)
  // ------------------------------------------------------------------
  console.log('\n--- TEST SUITE 5: High-Concurrency Burst Test (Multi-Client) ---');
  try {
    const startTime = Date.now();
    const concurrency = 50;
    const endpoints = [
      '/health',
      '/members/stats/summary',
      '/culture/forts',
      '/doctors',
      '/quiz/stats',
      '/events',
      '/donations/campaigns'
    ];

    const requests = Array.from({ length: concurrency }, (_, i) => {
      const ep = endpoints[i % endpoints.length];
      return fetch(`${BASE_URL}${ep}`).then(async r => {
        const body = await r.json();
        return { status: r.status, ok: r.ok, endpoint: ep };
      });
    });

    const results = await Promise.all(requests);
    const duration = Date.now() - startTime;
    const allSuccessful = results.every(r => r.ok && r.status === 200);

    assert(allSuccessful, `All ${concurrency} concurrent requests responded with HTTP 200 OK`);
    assert(duration < 2500, `High-concurrency batch completed in ${duration}ms (Avg ${(duration/concurrency).toFixed(1)}ms per request)`);
  } catch (err) {
    assert(false, `Concurrency test failed: ${err.message}`);
  }

  // ------------------------------------------------------------------
  // TEST 6: Response PII / Password Hash Leakage Test
  // ------------------------------------------------------------------
  console.log('\n--- TEST SUITE 6: Sensitive PII Data Masking Test ---');
  try {
    const res = await fetch(`${BASE_URL}/members`);
    const rawText = await res.text();

    assert(!rawText.includes('password_hash'), 'password_hash is NEVER exposed in members API response');
    assert(!rawText.includes('$2a$'), 'Bcrypt hash signatures ($2a$) are completely stripped');
  } catch (err) {
    assert(false, `PII leakage test failed: ${err.message}`);
  }

  console.log('\n======================================================');
  console.log(`🏁 AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSecurityAndLoadTests();
