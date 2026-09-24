// test-ai-agent.mjs - Connect Maratha AI Agent Integration Verification
import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api/ai';

async function runAITests() {
  console.log('\n======================================================');
  console.log('🤖 CONNECT MARATHA AI AGENT INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Healthcheck
  await check('GET /api/ai/health returns online status and 84 knowledge items', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.status, 'online');
    assert.strictEqual(data.data.knowledgeBaseItems, 84);
    assert.ok(data.data.languages.includes('mr'));
  });

  // 2. Marathi Chat Query
  await check('POST /api/ai/chat returns accurate Marathi knowledge response for Raigad / Coronation', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'शिवराज्याभिषेक सोहळा कधी झाला?',
        language: 'mr'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    const text = data.data.response || data.response;
    assert.ok(text.length > 20, 'Response should not be empty');
    assert.ok(text.includes('१६७४') || text.includes('रायगड') || text.includes('शिवराज्याभिषेक'), 'Response should mention Shivrajyabhishek / 1674');
  });

  // 3. Hindi Chat Query
  await check('POST /api/ai/chat returns Hindi knowledge response', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'रायगढ़ किले के बारे में जानकारी दीजिए',
        language: 'hi'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    const text = data.data.response || data.response;
    assert.ok(text.length > 20);
  });

  // 4. English Chat Query
  await check('POST /api/ai/chat returns English knowledge response for Pratapgad', async () => {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Tell me about the Battle of Pratapgad',
        language: 'en'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    const text = data.data.response || data.response;
    assert.ok(text.length > 20);
  });

  // 5. Technical Support Ticket creation
  await check('POST /api/ai/support registers technical support ticket with validation', async () => {
    const res = await fetch(`${BASE_URL}/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile: '9876543210',
        email: 'member@connectmaratha.org',
        name: 'संभाजी मोरे',
        issue: 'सिंधुदुर्ग किल्ल्याच्या ऐतिहासिक तोफांची नोंद सापडत नाही.',
        language: 'mr'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.data.ticket.id.startsWith('TECH-REQ-'));
    assert.ok(data.data.ticket.mobile.includes('9876543210'));
  });

  console.log('\n======================================================');
  console.log(`🏁 AI TEST RESULTS: ${passed} PASSED, ${failed} FAILED out of ${passed + failed}`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runAITests().catch(err => {
  console.error('Fatal AI test error:', err);
  process.exit(1);
});
