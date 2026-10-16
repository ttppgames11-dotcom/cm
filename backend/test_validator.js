import express from 'express';
import http from 'http';
import { validateBody, validateQuery, FORMATS } from './middleware/validator.js';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  deleteAccountSchema
} from './schemas/auth.schemas.js';
import { bloodRequestSchema } from './schemas/general.schemas.js';

// HTTP request helper for tests
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
      const data = typeof body === 'string' ? body : JSON.stringify(body);
      req.setHeader('Content-Length', Buffer.byteLength(data));
      req.write(data);
    } else {
      req.setHeader('Content-Length', 0);
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
  console.log('🧪 CONNECT MARATHA STRICT SCHEMA VALIDATOR TEST SUITE');
  console.log('========================================================');

  const app = express();
  app.use(express.json());

  // Test endpoints mounting validators
  app.post('/test/login', validateBody(loginSchema), (req, res) => {
    res.json({ success: true, received: req.body });
  });

  app.post('/test/register', validateBody(registerSchema, { atLeastOneOf: ['email', 'phone'] }), (req, res) => {
    res.json({ success: true, received: req.body });
  });

  app.post('/test/forgot-password', validateBody(forgotPasswordSchema), (req, res) => {
    res.json({ success: true, received: req.body });
  });

  app.post('/test/verify-otp', validateBody(verifyResetOtpSchema), (req, res) => {
    res.json({ success: true, received: req.body });
  });

  app.post('/test/reset-password', validateBody(resetPasswordSchema), (req, res) => {
    res.json({ success: true, received: req.body });
  });

  app.delete('/test/account', validateBody(deleteAccountSchema), (req, res) => {
    res.json({ success: true, received: req.body });
  });

  app.post('/test/blood-request', validateBody(bloodRequestSchema), (req, res) => {
    res.json({ success: true, received: req.body });
  });

  const server = app.listen(0);
  const port = server.address().port;

  try {
    // -----------------------------------------------------------
    // TEST 1: Strict rejection of unknown / unauthorized fields
    // -----------------------------------------------------------
    console.log('\n--- Test 1: Rejection of unknown/unexpected injected properties ---');
    const unknownFieldRes = await request(port, { path: '/test/login', method: 'POST' }, {
      identifier: 'M1001',
      password: 'mypassword',
      is_admin: true,       // Injected unknown field!
      role: 'superadmin'    // Injected unknown field!
    });
    assert(unknownFieldRes.statusCode === 400, 'Rejects unknown fields with 400 Bad Request');
    assert(unknownFieldRes.body.code === 'VALIDATION_ERROR', 'Validation error code returned');
    assert(
      JSON.stringify(unknownFieldRes.body.errors).includes('is_admin') &&
      JSON.stringify(unknownFieldRes.body.errors).includes('role'),
      'Identifies unrecognized fields in error response'
    );

    // -----------------------------------------------------------
    // TEST 2: Type validation (Reject wrong data types)
    // -----------------------------------------------------------
    console.log('\n--- Test 2: Strict type checking (Rejecting numbers/arrays where strings required) ---');
    const wrongTypeRes = await request(port, { path: '/test/login', method: 'POST' }, {
      identifier: ['M1001'], // Array instead of string!
      password: 12345        // Number instead of string!
    });
    assert(wrongTypeRes.statusCode === 400, 'Rejects array identifier and number password with 400');
    assert(JSON.stringify(wrongTypeRes.body.errors).includes('string अपेक्षित'), 'Errors report expected type');

    // -----------------------------------------------------------
    // TEST 3: Format validation (RFC 5322 Email)
    // -----------------------------------------------------------
    console.log('\n--- Test 3: Strict email format validation ---');
    const invalidEmails = ['plainaddress', 'missing@domain', '@missingusername.com', 'test..test@domain.com'];
    for (const badEmail of invalidEmails) {
      const res = await request(port, { path: '/test/forgot-password', method: 'POST' }, { email: badEmail });
      assert(res.statusCode === 400, `Rejects invalid email '${badEmail}' with 400`);
    }

    const validEmailRes = await request(port, { path: '/test/forgot-password', method: 'POST' }, {
      email: 'member@connectmaratha.com'
    });
    assert(validEmailRes.statusCode === 200, 'Accepts valid email with 200 OK');

    // -----------------------------------------------------------
    // TEST 4: Format validation (6-Digit Numeric OTP)
    // -----------------------------------------------------------
    console.log('\n--- Test 4: Strict 6-digit OTP format validation ---');
    const invalidOtps = ['123', '12345', '1234567', 'abcdef', '12345a', ''];
    for (const badOtp of invalidOtps) {
      const res = await request(port, { path: '/test/verify-otp', method: 'POST' }, {
        email: 'member@connectmaratha.com',
        otp: badOtp
      });
      assert(res.statusCode === 400, `Rejects invalid OTP '${badOtp}' with 400`);
    }

    const validOtpRes = await request(port, { path: '/test/verify-otp', method: 'POST' }, {
      email: 'member@connectmaratha.com',
      otp: '654321'
    });
    assert(validOtpRes.statusCode === 200, 'Accepts valid 6-digit numeric OTP with 200 OK');

    // -----------------------------------------------------------
    // TEST 5: Format validation (Indian / E.164 Phone)
    // -----------------------------------------------------------
    console.log('\n--- Test 5: Strict Phone Number format validation ---');
    const badPhones = ['12345', '0000000000', '1234567890', 'abc12345678'];
    for (const badPhone of badPhones) {
      const res = await request(port, { path: '/test/register', method: 'POST' }, {
        name: 'संभाजी राजे',
        phone: badPhone
      });
      assert(res.statusCode === 400, `Rejects invalid phone '${badPhone}' with 400`);
    }

    const validPhones = ['9822012345', '+919822012345', '09822012345'];
    for (const goodPhone of validPhones) {
      const res = await request(port, { path: '/test/register', method: 'POST' }, {
        name: 'संभाजी राजे',
        phone: goodPhone,
        skills: ['प्रशासन', 'किल्ले भ्रमंती']
      });
      assert(res.statusCode === 200, `Accepts valid phone '${goodPhone}' with 200 OK`);
    }

    // Test skills and about as strings
    console.log('\n--- Test 5b: String skills and about validation ---');
    const stringSkillsRes = await request(port, { path: '/test/register', method: 'POST' }, {
      name: 'संभाजी राजे',
      phone: '9822012345',
      skills: 'प्रशासन, दुर्ग संवर्धन, इतिहास संशोधन',
      about: 'मी एक निष्ठावंत समाज सेवक आहे.'
    });
    assert(stringSkillsRes.statusCode === 200, 'Accepts skills and about as strings with 200 OK');
    assert(stringSkillsRes.body.received.skills === 'प्रशासन, दुर्ग संवर्धन, इतिहास संशोधन', 'Preserves skills string value');
    assert(stringSkillsRes.body.received.about === 'मी एक निष्ठावंत समाज सेवक आहे.', 'Preserves about string value');

    // Mirrors the Flutter registration payload: skills, about and interests all sent as strings
    const appPayloadRes = await request(port, { path: '/test/register', method: 'POST' }, {
      name: 'संभाजी राजे',
      phone: '9822012345',
      skills: 'Flutter, Node.js',
      about: 'समाज सेवक',
      interests: 'दुर्ग संवर्धन व गडभ्रमण (Fort Conservation & Trekking)'
    });
    assert(appPayloadRes.statusCode === 200, 'Accepts mobile app payload with string interests with 200 OK');

    const arrayPayloadRes = await request(port, { path: '/test/register', method: 'POST' }, {
      name: 'संभाजी राजे',
      phone: '9822012345',
      skills: ['Flutter', 'Node.js'],
      about: ['समाज सेवक'],
      interests: ['Forts', 'History']
    });
    assert(arrayPayloadRes.statusCode === 200, 'Accepts skills, about and interests as arrays with 200 OK');

    // -----------------------------------------------------------
    // TEST 6: Length limits (Min & Max length enforcement)
    // -----------------------------------------------------------
    console.log('\n--- Test 6: Min and Max length enforcement ---');
    // Name too short (min 2)
    const shortNameRes = await request(port, { path: '/test/register', method: 'POST' }, {
      name: 'A',
      phone: '9822012345'
    });
    assert(shortNameRes.statusCode === 400, 'Rejects 1-char name with 400');

    // Password too short (min 6)
    const shortPassRes = await request(port, { path: '/test/reset-password', method: 'POST' }, {
      email: 'member@connectmaratha.com',
      resetToken: 'valid-token-length-greater-than-twenty-characters-here',
      newPassword: '123'
    });
    assert(shortPassRes.statusCode === 400, 'Rejects 3-char password with 400');

    // -----------------------------------------------------------
    // TEST 7: Enum Validation
    // -----------------------------------------------------------
    console.log('\n--- Test 7: Enum and allowed values validation ---');
    // Invalid Blood Group
    const badBloodRes = await request(port, { path: '/test/blood-request', method: 'POST' }, {
      patientName: 'तानाजी मालुसरे',
      bloodGroup: 'Z+', // Invalid blood group
      hospital: 'ससून रुग्णालय',
      city: 'पुणे',
      district: 'पुणे',
      contactPhone: '9822012345'
    });
    assert(badBloodRes.statusCode === 400, 'Rejects invalid blood group Z+ with 400');

    const validBloodRes = await request(port, { path: '/test/blood-request', method: 'POST' }, {
      patientName: 'तानाजी मालुसरे',
      bloodGroup: 'O+',
      units: 2,
      hospital: 'ससून रुग्णालय',
      city: 'पुणे',
      district: 'पुणे',
      contactPhone: '9822012345'
    });
    assert(validBloodRes.statusCode === 200, 'Accepts valid blood group O+ with 200 OK');

    // Delete Account confirmation must be exact "DELETE"
    const badConfirmRes = await request(port, { path: '/test/account', method: 'DELETE' }, {
      confirm: 'delete' // lowercase, must be uppercase "DELETE"
    });
    assert(badConfirmRes.statusCode === 400, 'Rejects lowercase confirm delete with 400');

    const goodConfirmRes = await request(port, { path: '/test/account', method: 'DELETE' }, {
      confirm: 'DELETE'
    });
    assert(goodConfirmRes.statusCode === 200, 'Accepts exact DELETE confirmation with 200 OK');

    // -----------------------------------------------------------
    // TEST 8: Cross-field validation (atLeastOneOf)
    // -----------------------------------------------------------
    console.log('\n--- Test 8: Cross-field validation (atLeastOneOf) ---');
    const noContactRes = await request(port, { path: '/test/register', method: 'POST' }, {
      name: 'संभाजी राजे'
      // Neither email nor phone provided
    });
    assert(noContactRes.statusCode === 400, 'Rejects registration without email or phone');

    console.log('\n========================================================');
    console.log('🎉 ALL 8 STRICT SCHEMA VALIDATION TESTS PASSED!');
    console.log('========================================================\n');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Validation test error:', err);
  process.exit(1);
});
