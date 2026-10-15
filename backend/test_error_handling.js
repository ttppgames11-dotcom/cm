import assert from 'assert';
import http from 'http';
import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';

console.log('========================================================');
console.log('🧪 CONNECT MARATHA ERROR HANDLING & DATA PROTECTION SUITE');
console.log('========================================================\n');

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
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = {};
        try { json = JSON.parse(data); } catch (_) {}
        resolve({ statusCode: res.statusCode, headers: res.headers, body: json, rawBody: data });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  const app = express();
  app.use(express.json());

  // Capture console.error output to verify server-side logging
  let serverLogOutput = '';
  const originalConsoleError = console.error;
  console.error = (...args) => {
    serverLogOutput += args.join(' ') + '\n';
    originalConsoleError(...args);
  };

  // Test Route 1: Throws error containing sensitive internal filesystem path and stack trace
  app.get('/test/file-path-leak', (req, res, next) => {
    const err = new Error("Failed to read file from 'E:\\community_mobile\\backend\\secrets\\keys.pem': Permission denied");
    err.name = 'FileSystemError';
    next(err);
  });

  // Test Route 2: Throws error containing raw database query & schema internals
  app.get('/test/database-leak', (req, res, next) => {
    const err = new Error("SQLITE_ERROR: no such column: password_hash in SELECT id, password_hash FROM members WHERE id = 'M1001'");
    err.name = 'SqliteError';
    next(err);
  });

  // Test Route 3: Standard 400 user input validation error (should remain readable)
  app.get('/test/safe-client-error', (req, res, next) => {
    const err = new Error('फोन नंबर चुकीचा आहे (Invalid phone format)');
    err.status = 400;
    err.code = 'INVALID_PHONE';
    next(err);
  });

  // 404 Handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      code: 'ROUTE_NOT_FOUND',
      error: 'विनंती केलेला मार्ग आढळला नाही (Requested endpoint not found).'
    });
  });

  // Mount central errorHandler
  app.use(errorHandler);

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;

  try {
    // --- Test 1: Filesystem path leak prevention ---
    console.log('--- Test 1: Preventing internal filesystem path leaks ---');
    serverLogOutput = '';
    const fileRes = await request(port, { path: '/test/file-path-leak' });
    
    assert.strictEqual(fileRes.statusCode, 500, 'Returns HTTP 500 status code');
    assert.strictEqual(fileRes.body.success, false, 'Reports success: false');
    assert(fileRes.body.errorId, 'Includes unique error tracking ID');
    assert(!fileRes.rawBody.includes('E:\\community_mobile'), 'Response NEVER contains internal Windows path');
    assert(!fileRes.rawBody.includes('keys.pem'), 'Response NEVER contains internal filename');
    assert(!fileRes.body.stack, 'Response NEVER contains stack trace');
    assert(fileRes.body.error.includes('तांत्रिक अडचण'), 'Response contains safe generic localized message');
    
    // Verify server-side logged full details
    assert(serverLogOutput.includes('E:\\community_mobile\\backend\\secrets\\keys.pem'), 'Server log captured the full internal file path for debugging');
    assert(serverLogOutput.includes(fileRes.body.errorId), 'Server log contains the matching errorId');
    console.log('✅ PASSED: Filesystem paths masked from user and logged server-side');

    // --- Test 2: Raw database error & SQL query leak prevention ---
    console.log('\n--- Test 2: Preventing raw database errors & SQL query leaks ---');
    serverLogOutput = '';
    const dbRes = await request(port, { path: '/test/database-leak' });
    
    assert.strictEqual(dbRes.statusCode, 500, 'Returns HTTP 500 status code');
    assert(!fileRes.rawBody.includes('SQLITE_ERROR'), 'Response NEVER contains SQL driver name');
    assert(!fileRes.rawBody.includes('password_hash'), 'Response NEVER contains database column names');
    assert(!fileRes.rawBody.includes('SELECT id'), 'Response NEVER contains SQL query statements');
    assert(!dbRes.body.stack, 'Response NEVER contains database stack trace');
    assert(dbRes.body.error.includes('तांत्रिक अडचण'), 'Response contains safe generic localized message');

    // Verify server-side logged full details
    assert(serverLogOutput.includes('SQLITE_ERROR: no such column'), 'Server log captured the full raw database error for debugging');
    assert(serverLogOutput.includes(dbRes.body.errorId), 'Server log contains the matching errorId');
    console.log('✅ PASSED: Raw SQL queries & table schemas masked from user and logged server-side');

    // --- Test 3: Malformed JSON body handling ---
    console.log('\n--- Test 3: Malformed JSON body handling ---');
    const malformedRes = await request(port, {
      path: '/test/file-path-leak',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, '{ malformed_json: true, missing_quotes ');
    
    assert.strictEqual(malformedRes.statusCode, 400, 'Returns HTTP 400 for malformed JSON');
    assert.strictEqual(malformedRes.body.code, 'INVALID_JSON_BODY', 'Returns machine-readable code');
    assert(!malformedRes.body.stack, 'Response NEVER contains JSON parser stack trace');
    console.log('✅ PASSED: Malformed JSON returns clean 400 without internal parser dumps');

    // --- Test 4: Safe client errors preservation ---
    console.log('\n--- Test 4: Safe client operational errors are preserved ---');
    const safeRes = await request(port, { path: '/test/safe-client-error' });
    assert.strictEqual(safeRes.statusCode, 400, 'Returns HTTP 400');
    assert.strictEqual(safeRes.body.code, 'INVALID_PHONE', 'Preserves clean client code');
    assert(safeRes.body.error.includes('फोन नंबर चुकीचा आहे'), 'Preserves friendly client validation message');
    assert(!safeRes.body.stack, 'Response NEVER contains stack trace');
    console.log('✅ PASSED: Safe client validation errors preserved cleanly');

    // --- Test 5: Unmatched 404 Route handling ---
    console.log('\n--- Test 5: Unmatched route 404 handler ---');
    const notFoundRes = await request(port, { path: '/non-existent-api-endpoint' });
    assert.strictEqual(notFoundRes.statusCode, 404, 'Returns HTTP 404');
    assert.strictEqual(notFoundRes.body.code, 'ROUTE_NOT_FOUND', 'Returns ROUTE_NOT_FOUND code');
    assert(!notFoundRes.body.stack, 'Response NEVER contains stack trace');
    console.log('✅ PASSED: 404 returns clean JSON without framework defaults');

    console.log('\n========================================================');
    console.log('🎉 ALL ERROR HANDLING & DATA PROTECTION TESTS PASSED!');
    console.log('========================================================');
  } finally {
    console.error = originalConsoleError;
    await new Promise(resolve => server.close(resolve));
  }
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
