import express from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import {
  generalRateLimiter,
  authRateLimiter,
  recordAuthFailure,
  recordAuthSuccess,
  resetRateLimiterState,
  config
} from './middleware/rateLimiter.js';
import { optionalToken, JWT_SECRET } from './middleware/auth.js';

// Helper for making HTTP requests in tests
function request(port, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: '127.0.0.1',
      port,
      path: options.path || '/',
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  console.log('========================================================');
  console.log('🧪 CONNECT MARATHA RATE LIMITER TEST SUITE');
  console.log('========================================================');

  // Override environment config for fast and deterministic test runs
  process.env.RATE_LIMIT_PUBLIC_WINDOW_MS = '5000';
  process.env.RATE_LIMIT_PUBLIC_MAX = '3';

  process.env.RATE_LIMIT_USER_WINDOW_MS = '5000';
  process.env.RATE_LIMIT_USER_MAX = '6';

  process.env.RATE_LIMIT_AUTH_IP_WINDOW_MS = '5000';
  process.env.RATE_LIMIT_AUTH_IP_MAX = '4';

  process.env.RATE_LIMIT_AUTH_ACCOUNT_WINDOW_MS = '5000';
  process.env.RATE_LIMIT_AUTH_ACCOUNT_MAX = '2'; // 2 allowed failures before backoff
  process.env.RATE_LIMIT_AUTH_BACKOFF_BASE_SEC = '1';
  process.env.RATE_LIMIT_AUTH_BACKOFF_MAX_SEC = '10';
  process.env.RATE_LIMIT_AUTH_BACKOFF_FACTOR = '2.0';

  resetRateLimiterState();

  // Create test express app
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(optionalToken);
  app.use(generalRateLimiter);

  // Health endpoint (exempt)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
  });

  // Public endpoint
  app.get('/api/locations/countries', (req, res) => {
    res.json({ success: true, data: ['India'] });
  });

  // Authenticated endpoint
  app.get('/api/community/feed', (req, res) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    res.json({ success: true, posts: [] });
  });

  // Sensitive Auth Login endpoint
  app.post('/api/auth/login', authRateLimiter, (req, res) => {
    const { identifier, password } = req.body || {};
    if (password === 'correct123') {
      return res.json({ success: true, message: 'Login successful' });
    }
    return res.status(401).json({ success: false, error: 'Invalid password' });
  });

  const server = app.listen(0);
  const port = server.address().port;

  try {
    // -----------------------------------------------------------
    // TEST 1: Health check endpoint is exempt from rate limiting
    // -----------------------------------------------------------
    console.log('\n--- Test 1: Health check exemption ---');
    for (let i = 0; i < 5; i++) {
      const res = await request(port, { path: '/api/health' });
      assert(res.statusCode === 200, `Health request ${i + 1} passed with 200`);
    }

    // -----------------------------------------------------------
    // TEST 2: Moderate Public Endpoint Rate Limiting (per-IP)
    // -----------------------------------------------------------
    console.log('\n--- Test 2: Public endpoint rate limiting (Max 3) ---');
    resetRateLimiterState();

    const clientIp = '203.0.113.19';
    const ipHeaders = { 'x-forwarded-for': clientIp };

    for (let i = 1; i <= 3; i++) {
      const res = await request(port, { path: '/api/locations/countries', headers: ipHeaders });
      assert(res.statusCode === 200, `Public request ${i} allowed (200)`);
      assert(res.headers['x-ratelimit-limit'] === '3', 'X-RateLimit-Limit is 3');
      assert(res.headers['x-ratelimit-remaining'] == 3 - i, `X-RateLimit-Remaining is ${3 - i}`);
    }

    // 4th request from same IP should be blocked with 429
    const blockedRes = await request(port, { path: '/api/locations/countries', headers: ipHeaders });
    assert(blockedRes.statusCode === 429, 'Public request 4 rejected with 429 Too Many Requests');
    assert(blockedRes.body.code === 'RATE_LIMIT_EXCEEDED', 'Response code is RATE_LIMIT_EXCEEDED');
    assert(Number(blockedRes.headers['retry-after']) > 0, 'Retry-After header present');

    // -----------------------------------------------------------
    // TEST 3: Looser limits for Authenticated User Actions
    // -----------------------------------------------------------
    console.log('\n--- Test 3: Authenticated user quota (Max 6) ---');
    resetRateLimiterState();

    const userToken = jwt.sign({ id: 'M5578', name: 'Abhay' }, JWT_SECRET);
    const authHeaders = {
      'x-forwarded-for': '203.0.113.25',
      'authorization': `Bearer ${userToken}`
    };

    // User can make up to 6 requests (even though public max was 3)
    for (let i = 1; i <= 6; i++) {
      const res = await request(port, { path: '/api/community/feed', headers: authHeaders });
      assert(res.statusCode === 200, `User request ${i} allowed with 200`);
      assert(res.headers['x-ratelimit-limit'] === '6', 'Authenticated limit is 6');
    }

    // 7th request blocked
    const userBlockedRes = await request(port, { path: '/api/community/feed', headers: authHeaders });
    assert(userBlockedRes.statusCode === 429, 'Authenticated user request 7 rejected with 429');
    assert(userBlockedRes.body.tier === 'authenticated', 'Reported tier is authenticated');

    // -----------------------------------------------------------
    // TEST 4: Auth Routes - Strict Per-IP Limiting (Max 4)
    // -----------------------------------------------------------
    console.log('\n--- Test 4: Auth routes IP limiting (Max 4) ---');
    resetRateLimiterState();

    const attackerIp = '198.51.100.88';
    const authIpHeaders = { 'x-forwarded-for': attackerIp };

    for (let i = 1; i <= 4; i++) {
      const res = await request(port, {
        path: '/api/auth/login',
        method: 'POST',
        headers: authIpHeaders
      }, { identifier: `user_${i}@example.com`, password: 'wrong' });
      assert(res.statusCode === 401, `Attempt ${i} processed by auth handler (401)`);
    }

    // 5th attempt from attacker IP should be blocked by IP auth limit
    const ipBlockedRes = await request(port, {
      path: '/api/auth/login',
      method: 'POST',
      headers: authIpHeaders
    }, { identifier: 'another_user@example.com', password: 'wrong' });

    assert(ipBlockedRes.statusCode === 429, '5th attempt from attacker IP blocked with 429');
    assert(ipBlockedRes.body.code === 'AUTH_IP_RATE_LIMIT_EXCEEDED', 'Error code is AUTH_IP_RATE_LIMIT_EXCEEDED');

    // -----------------------------------------------------------
    // TEST 5: Auth Routes - Per-Account Exponential Backoff
    // -----------------------------------------------------------
    console.log('\n--- Test 5: Per-Account Exponential Backoff ---');
    resetRateLimiterState();

    const victimAccount = 'target_member@connectmaratha.com';
    const userHeaders = { 'x-forwarded-for': '198.51.100.99' };

    // Attempt 1: Fail (within limit of 2)
    const att1 = await request(port, { path: '/api/auth/login', method: 'POST', headers: userHeaders }, {
      identifier: victimAccount, password: 'wrong'
    });
    assert(att1.statusCode === 401, 'Attempt 1 failed with 401 (allowed)');

    // Attempt 2: Fail (reaches limit of 2)
    const att2 = await request(port, { path: '/api/auth/login', method: 'POST', headers: userHeaders }, {
      identifier: victimAccount, password: 'wrong'
    });
    assert(att2.statusCode === 401, 'Attempt 2 failed with 401 (reaches threshold)');

    // Attempt 3: Immediate attempt beyond threshold -> Exponential backoff kicks in!
    const att3 = await request(port, { path: '/api/auth/login', method: 'POST', headers: userHeaders }, {
      identifier: victimAccount, password: 'wrong'
    });
    assert(att3.statusCode === 429, 'Attempt 3 rejected with 429 (Exponential backoff active)');
    assert(att3.body.backoff === true, 'Response indicates backoff is active');
    assert(att3.body.failures === 2, 'Consecutive failures tracked accurately');
    const delay1 = Number(att3.headers['retry-after']);
    assert(delay1 >= 1, `Retry-After header received: ${delay1}s`);

    // Wait for the backoff duration (1s) to pass
    console.log(`Waiting ${delay1}s for exponential backoff window...`);
    await new Promise(r => setTimeout(r, (delay1 * 1000) + 100));

    // After waiting, user can attempt again!
    // If they now provide the correct credentials, it should succeed AND reset backoff
    const attSuccess = await request(port, { path: '/api/auth/login', method: 'POST', headers: userHeaders }, {
      identifier: victimAccount, password: 'correct123'
    });
    assert(attSuccess.statusCode === 200, 'Attempt after backoff delay with correct password SUCCEEDS with 200');

    // Verify backoff state is completely cleared on success
    const attAfterSuccess = await request(port, { path: '/api/auth/login', method: 'POST', headers: userHeaders }, {
      identifier: victimAccount, password: 'wrong'
    });
    assert(attAfterSuccess.statusCode === 401, 'Subsequent failed attempt starts from fresh counter (not blocked with 429)');

    console.log('\n========================================================');
    console.log('🎉 ALL 5 RATE LIMITING TESTS PASSED PERFECTLY!');
    console.log('========================================================\n');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
