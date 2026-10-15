import http from 'http';
import assert from 'assert';
import express from 'express';
import crypto from 'crypto';
import mediaRoutes from './routes/media.routes.js';
import { generateToken } from './middleware/auth.js';
import { get, runQuery } from '../database/database.js';

// Setup isolated test express instance
const app = express();
app.use('/api/media', mediaRoutes);
app.use('/media', mediaRoutes);

let server;
let baseUrl;

function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { ...headers }
    };

    if (body) {
      if (Buffer.isBuffer(body)) {
        options.headers['Content-Length'] = body.length;
      } else if (typeof body === 'string') {
        options.headers['Content-Length'] = Buffer.byteLength(body);
      }
    }

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const rawBuffer = Buffer.concat(chunks);
        let json = null;
        try {
          json = JSON.parse(rawBuffer.toString('utf8'));
        } catch (_) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
          rawBuffer
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Helpers to craft test files
function createValidJpeg() {
  const buf = Buffer.alloc(128);
  // JPEG SOI marker
  buf[0] = 0xFF;
  buf[1] = 0xD8;
  buf[2] = 0xFF;
  buf[3] = 0xE0; // APP0
  buf.fill(0xAA, 4, 126);
  // JPEG EOI marker
  buf[126] = 0xFF;
  buf[127] = 0xD9;
  return buf;
}

function createValidPng() {
  const buf = Buffer.alloc(128);
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  const sig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  for (let i = 0; i < sig.length; i++) buf[i] = sig[i];
  // IHDR chunk at offset 12
  buf[12] = 0x49; // I
  buf[13] = 0x48; // H
  buf[14] = 0x44; // D
  buf[15] = 0x52; // R
  return buf;
}

function createValidWebp() {
  const buf = Buffer.alloc(128);
  // 'RIFF'
  buf.write('RIFF', 0, 'ascii');
  buf.writeUInt32LE(120, 4);
  // 'WEBP'
  buf.write('WEBP', 8, 'ascii');
  buf.write('VP8 ', 12, 'ascii');
  return buf;
}

async function runTestSuite() {
  console.log('========================================================');
  console.log('🧪 CONNECT MARATHA FILE UPLOAD SECURITY TEST SUITE');
  console.log('========================================================\n');

  // Start test server on random port
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  const memberToken = generateToken({ id: 'M-TEST-UPLOAD', role: 'member' });

  try {
    // -------------------------------------------------------------
    console.log('--- Test 1: Content & Magic-Byte Validation (Not Extension) ---');
    // -------------------------------------------------------------
    // A: Valid JPEG accepted
    const resJpeg = await makeRequest('POST', '/api/media/post', {
      'Content-Type': 'application/octet-stream',
      'Authorization': `Bearer ${memberToken}`
    }, createValidJpeg());
    assert.strictEqual(resJpeg.status, 201, 'Valid JPEG must return 201');
    assert.strictEqual(resJpeg.body.success, true);
    assert.ok(resJpeg.body.path.startsWith('/media/'));
    console.log('✅ PASSED: Genuine JPEG with correct magic bytes is accepted');

    // B: Valid PNG accepted
    const resPng = await makeRequest('POST', '/api/media/post', {
      'Content-Type': 'application/octet-stream',
      'Authorization': `Bearer ${memberToken}`
    }, createValidPng());
    assert.strictEqual(resPng.status, 201, 'Valid PNG must return 201');
    assert.strictEqual(resPng.body.success, true);
    console.log('✅ PASSED: Genuine PNG with 8-byte signature is accepted');

    // C: Valid WebP accepted
    const resWebp = await makeRequest('POST', '/api/media/post', {
      'Content-Type': 'application/octet-stream',
      'Authorization': `Bearer ${memberToken}`
    }, createValidWebp());
    assert.strictEqual(resWebp.status, 201, 'Valid WebP must return 201');
    assert.strictEqual(resWebp.body.success, true);
    console.log('✅ PASSED: Genuine WebP with RIFF/WEBP signature is accepted');

    // D: Text file disguised as JPEG rejected
    const fakeJpeg = Buffer.from('Hello world this is not a real image at all!');
    const resFake = await makeRequest('POST', '/api/media/post', {
      'Content-Type': 'image/jpeg',
      'Authorization': `Bearer ${memberToken}`
    }, fakeJpeg);
    assert.strictEqual(resFake.status, 400, 'Non-image payload must be rejected with 400');
    assert.strictEqual(resFake.body.success, false);
    console.log('✅ PASSED: Fake JPEG (plain text with image/jpeg header) rejected');

    // E: Shell script / Executable disguised as image rejected
    const scriptPayload = Buffer.from('#!/bin/bash\necho "pwned"\nexit 0\n');
    const resScript = await makeRequest('POST', '/api/media/post', {
      'Content-Type': 'image/png',
      'Authorization': `Bearer ${memberToken}`
    }, scriptPayload);
    assert.strictEqual(resScript.status, 400);
    console.log('✅ PASSED: Shell script with image/png header rejected');

    // -------------------------------------------------------------
    console.log('\n--- Test 2: File Size & Empty Payload Validation ---');
    // -------------------------------------------------------------
    // A: 0-byte file rejected
    const resEmpty = await makeRequest('POST', '/api/media/post', {
      'Content-Type': 'application/octet-stream',
      'Authorization': `Bearer ${memberToken}`
    }, Buffer.alloc(0));
    assert.strictEqual(resEmpty.status, 400);
    console.log('✅ PASSED: Empty payload rejected');

    // B: Truncated tiny file (< 64 bytes) rejected
    const resTiny = await makeRequest('POST', '/api/media/post', {
      'Content-Type': 'application/octet-stream',
      'Authorization': `Bearer ${memberToken}`
    }, Buffer.from([0xFF, 0xD8, 0xFF]));
    assert.strictEqual(resTiny.status, 400);
    console.log('✅ PASSED: Tiny corrupted header (< 64 bytes) rejected');

    // C: Oversized file (> 5MB) rejected with 413
    const oversized = Buffer.alloc(5 * 1024 * 1024 + 100);
    oversized[0] = 0xFF; oversized[1] = 0xD8; oversized[2] = 0xFF;
    const resOversized = await makeRequest('POST', '/api/media/post', {
      'Content-Type': 'application/octet-stream',
      'Authorization': `Bearer ${memberToken}`
    }, oversized);
    assert.ok(resOversized.status === 413 || resOversized.status === 400, `Expected 413 or 400, got ${resOversized.status}`);
    console.log('✅ PASSED: File exceeding 5MB limit rejected');

    // -------------------------------------------------------------
    console.log('\n--- Test 3: Polyglot & Code Execution Prevention ---');
    // -------------------------------------------------------------
    // A: JPEG containing embedded PHP payload
    const phpPolyglot = Buffer.concat([
      createValidJpeg().subarray(0, 32),
      Buffer.from('<?php system($_GET["c"]); ?>'),
      createValidJpeg().subarray(32)
    ]);
    const resPhp = await makeRequest('POST', '/api/media/post', {
      'Content-Type': 'image/jpeg',
      'Authorization': `Bearer ${memberToken}`
    }, phpPolyglot);
    assert.strictEqual(resPhp.status, 400);
    assert.ok(resPhp.body.error.includes('अवैध सामग्री') || resPhp.body.error.includes('forbidden'));
    console.log('✅ PASSED: Polyglot image with embedded <?php tag detected and rejected');

    // B: JPEG containing embedded <script> tag
    const xssPolyglot = Buffer.concat([
      createValidJpeg().subarray(0, 32),
      Buffer.from('<script>alert(document.cookie)</script>'),
      createValidJpeg().subarray(32)
    ]);
    const resXss = await makeRequest('POST', '/api/media/post', {
      'Content-Type': 'image/jpeg',
      'Authorization': `Bearer ${memberToken}`
    }, xssPolyglot);
    assert.strictEqual(resXss.status, 400);
    console.log('✅ PASSED: Polyglot image with embedded <script> tag rejected');

    // C: SVG with XML scripts rejected
    const svgFile = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"></svg>');
    const resSvg = await makeRequest('POST', '/api/media/post', {
      'Content-Type': 'image/svg+xml',
      'Authorization': `Bearer ${memberToken}`
    }, svgFile);
    assert.strictEqual(resSvg.status, 400);
    console.log('✅ PASSED: SVG with executable vector scripts rejected');

    // -------------------------------------------------------------
    console.log('\n--- Test 4: Isolated Storage & Path Traversal Immunity ---');
    // -------------------------------------------------------------
    // Client cannot specify file path or name; server allocates 32-hex ID
    const uploadRes = await makeRequest('POST', '/api/media/post', {
      'Authorization': `Bearer ${memberToken}`
    }, createValidJpeg());
    assert.strictEqual(uploadRes.status, 201);
    const mediaId = uploadRes.body.id;
    assert.ok(/^[a-f0-9]{32}$/.test(mediaId), 'Media ID must be a secure 32-hex string');

    // Verify record exists in SQLite media table
    const row = await get('SELECT id, mime, size FROM media WHERE id = ?', [mediaId]);
    assert.ok(row, 'File must be stored in database media table');
    assert.strictEqual(row.mime, 'image/jpeg');
    console.log('✅ PASSED: Media stored in isolated database storage with random hex UUID');

    // -------------------------------------------------------------
    console.log('\n--- Test 5: Safe Media Delivery & Non-Executable Headers ---');
    // -------------------------------------------------------------
    const getRes = await makeRequest('GET', `/media/${mediaId}`);
    assert.strictEqual(getRes.status, 200);
    assert.ok(getRes.headers['content-type'].startsWith('image/jpeg'), 'Content-Type must be image/jpeg');
    assert.strictEqual(getRes.headers['x-content-type-options'], 'nosniff');
    assert.ok(getRes.headers['content-security-policy'].includes("default-src 'none'"));
    assert.ok(getRes.headers['content-security-policy'].includes("sandbox"));
    assert.strictEqual(getRes.headers['content-disposition'], 'inline');
    assert.strictEqual(getRes.headers['cross-origin-resource-policy'], 'cross-origin');
    console.log('✅ PASSED: Strict security headers (nosniff, CSP sandbox, inline) enforced on delivery');

    // Path traversal attempt in GET rejected
    const getTraversal = await makeRequest('GET', '/media/..%2F..%2Fetc%2Fpasswd');
    assert.strictEqual(getTraversal.status, 400);
    console.log('✅ PASSED: Path traversal attack in media ID rejected');

    // -------------------------------------------------------------
    console.log('\n--- Test 6: Authentication & Profile Photo Lifecycle ---');
    // -------------------------------------------------------------
    // Unauthenticated profile upload blocked
    const unauthProfile = await makeRequest('POST', '/api/media/profile', {}, createValidPng());
    assert.strictEqual(unauthProfile.status, 401);
    console.log('✅ PASSED: Unauthenticated profile upload rejected with 401');

    // Authenticated profile upload accepted
    const authProfile = await makeRequest('POST', '/api/media/profile', {
      'Authorization': `Bearer ${memberToken}`
    }, createValidPng());
    assert.strictEqual(authProfile.status, 201);
    assert.ok(authProfile.body.photo.startsWith('/media/'));
    console.log('✅ PASSED: Authenticated profile upload succeeded');

    // Authenticated profile deletion
    const delProfile = await makeRequest('DELETE', '/api/media/profile', {
      'Authorization': `Bearer ${memberToken}`
    });
    assert.strictEqual(delProfile.status, 200);
    console.log('✅ PASSED: Profile photo deletion succeeded');

    console.log('\n========================================================');
    console.log('🎉 ALL FILE UPLOAD SECURITY TESTS PASSED!');
    console.log('========================================================\n');
  } finally {
    if (server) server.close();
  }
}

runTestSuite().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  if (server) server.close();
  process.exit(1);
});
