import http from 'http';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './middleware/auth.js';

const PORT = 5000;

// Helper for tokens
function makeToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role || 'member', tier: 'Gold' },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

const adminToken = makeToken({ id: 'ADM-01', name: 'Admin Maratha', role: 'admin' });
const ownerToken = makeToken({ id: 'OWN-99', name: 'Balasaheb Owner', role: 'member' });
const memberToken1 = makeToken({ id: 'MEM-01', name: 'Kisan Patil', role: 'member' });
const memberToken2 = makeToken({ id: 'MEM-02', name: 'Ramesh Deshmukh', role: 'member' });

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: PORT,
        path: encodeURI(path),
        method,
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (_) {
            parsed = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting comprehensive Dairy feature tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  try {
    // 1. GET /dairy public list & filters
    const res1 = await request('GET', '/dairy');
    assert(res1.status === 200 && res1.data.success && Array.isArray(res1.data.dairy), '1. GET /dairy returns 200 with dairy list', JSON.stringify(res1.data));

    const res1b = await request('GET', '/dairy?kind=brand');
    const allBrands = (res1b.data.dairy || []).every(d => d.kind === 'brand');
    assert(res1b.status === 200 && allBrands && res1b.data.dairy.length >= 3, '2. GET /dairy?kind=brand filters brands properly');

    const res1c = await request('GET', '/dairy?district=कोल्हापूर');
    assert(res1c.status === 200 && res1c.data.dairy.length > 0, '3. GET /dairy?district=कोल्हापूर filters by district');

    // 2. GET /api/dairy/:id (success and 404)
    const existingId = res1.data.dairy[0]?.id;
    const res2 = await request('GET', `/api/dairy/${existingId}`);
    assert(res2.status === 200 && res2.data.success && res2.data.dairy.id === existingId, '4. GET /api/dairy/:id returns specific dairy record');

    const res2b = await request('GET', '/api/dairy/DRY-NOT-EXISTS-999');
    assert(res2b.status === 404 && res2b.data.code === 'DAIRY_NOT_FOUND', '5. GET /api/dairy/:id with invalid id returns 404 DAIRY_NOT_FOUND');

    // 3. POST /dairy create centre with required fields & NO fake defaults
    const newCentrePayload = {
      dairyName: 'संकलन केंद्र - आष्टा',
      village: 'आष्टा',
      taluka: 'वाळवा',
      district: 'सांगली',
      morningTiming: 'सकाळी ५:०० ते १०:००',
      eveningTiming: 'संध्याकाळी ५:०० ते ८:३०',
      registeredFarmers: 180,
      centerHead: 'बापूसाहेब कदम',
      contact: '9822012345',
      facilities: ['डिजिटल फॅट टेस्टिंग', 'बल्क कुलर'],
      milkRateCow: '₹३८',
      milkRateBuffalo: '₹५६',
      dailyCollection: '९०० लिटर'
    };

    const res3 = await request('POST', '/dairy', newCentrePayload, ownerToken);
    assert(
      res3.status === 201 &&
      res3.data.success &&
      res3.data.dairyCenter.kind === 'centre' &&
      res3.data.dairyCenter.verified === false &&
      res3.data.dairyCenter.ownerId === 'OWN-99' &&
      res3.data.dairyCenter.centerHead === 'बापूसाहेब कदम' &&
      res3.data.dairyCenter.village === 'आष्टा',
      '6. POST /dairy creates centre without fake defaults and sets ownerId & kind: centre'
    );
    const createdCentreId = res3.data.dairyCenter.id;

    // Validation test: missing dairyName or district or invalid phone
    const res3b = await request('POST', '/dairy', { dairyName: '', district: 'पुणे', contact: '9822012345' });
    assert(res3b.status === 400 && res3b.data.code === 'VALIDATION_ERROR', '7. POST /dairy validates required dairyName');

    const res3c = await request('POST', '/dairy', { dairyName: 'टेस्ट डेअरी', district: 'पुणे', contact: '1234' });
    assert(res3c.status === 400 && res3c.data.code === 'VALIDATION_ERROR', '8. POST /dairy validates Indian mobile contact');

    // 4. Products: GET /api/dairy/products (public)
    const res4 = await request('GET', '/api/dairy/products');
    assert(res4.status === 200 && res4.data.success && Array.isArray(res4.data.products), '9. GET /api/dairy/products returns public products list');

    // 5. Products: POST /api/dairy/products (login required; admin or seller dairy owner)
    // Unauthenticated should fail
    const res5a = await request('POST', '/api/dairy/products', { name: 'ताजी बासुंदी', price: 150 });
    assert(res5a.status === 401, '10. POST /api/dairy/products rejects unauthenticated request (401)');

    // Non-owner, non-admin should get 403
    const res5b = await request('POST', '/api/dairy/products', { name: 'ताजी बासुंदी', price: 150, sellerId: createdCentreId }, memberToken1);
    assert(res5b.status === 403, '11. POST /api/dairy/products rejects non-owner non-admin user (403)');

    // Owner of createdCentreId should succeed
    const res5c = await request('POST', '/api/dairy/products', {
      name: 'ताजी बासुंदी (५०० ग्रॅम)',
      category: 'इतर',
      packSize: '500 gm',
      price: 180,
      description: 'शुद्ध खवा व केशरयुक्त पारंपरिक बासुंदी',
      sellerId: createdCentreId,
      available: true
    }, ownerToken);
    assert(res5c.status === 201 && res5c.data.success && res5c.data.product.price === 180, '12. POST /api/dairy/products succeeds for dairy owner');
    const createdProductId = res5c.data.product.id;

    // 6. Product Enquiry: POST /api/dairy/products/:id/enquiries (optionalToken)
    const res6 = await request('POST', `/api/dairy/products/${createdProductId}/enquiries`, {
      name: 'संजय माने',
      phone: '9865432100',
      quantity: '२ किलो',
      deliveryCity: 'सांगली',
      message: 'घरगुती समारंभासाठी हवे आहे.'
    });
    assert(res6.status === 201 && res6.data.success && res6.data.enquiry.productId === createdProductId, '13. POST /api/dairy/products/:id/enquiries submits product enquiry');

    // 7. Farmer Registration: POST /api/dairy/:id/registrations (login required)
    const res7a = await request('POST', `/api/dairy/${createdCentreId}/registrations`, {
      farmerName: 'किसन पाटील',
      phone: '9822011223',
      village: 'आष्टा',
      cattleCount: 4,
      milkType: 'cow',
      expectedDailyLitres: 35
    }, memberToken1);
    assert(res7a.status === 201 && res7a.data.success && res7a.data.registration.memberId === 'MEM-01', '14. POST /api/dairy/:id/registrations registers farmer');

    // Duplicate registration for same member and centre must be rejected
    const res7b = await request('POST', `/api/dairy/${createdCentreId}/registrations`, {
      farmerName: 'किसन पाटील',
      phone: '9822011223',
      village: 'आष्टा',
      cattleCount: 4,
      milkType: 'cow',
      expectedDailyLitres: 35
    }, memberToken1);
    assert(res7b.status === 409 && res7b.data.code === 'DUPLICATE_REGISTRATION', '15. POST /api/dairy/:id/registrations rejects duplicate registration (409)');

    // 8. Registrations Read: GET /api/dairy/:id/registrations (only centre owner or admin)
    // Member 2 (not owner, not admin) should get 403
    const res8a = await request('GET', `/api/dairy/${createdCentreId}/registrations`, null, memberToken2);
    assert(res8a.status === 403 && res8a.data.code === 'FORBIDDEN', '16. GET /api/dairy/:id/registrations denies non-owner access (403)');

    // Centre owner should see the registration
    const res8b = await request('GET', `/api/dairy/${createdCentreId}/registrations`, null, ownerToken);
    assert(res8b.status === 200 && res8b.data.success && res8b.data.count >= 1, '17. GET /api/dairy/:id/registrations allows centre owner to read registrations');

    // Admin should also see registrations
    const res8c = await request('GET', `/api/dairy/${createdCentreId}/registrations`, null, adminToken);
    assert(res8c.status === 200 && res8c.data.success && res8c.data.count >= 1, '18. GET /api/dairy/:id/registrations allows admin to read registrations');

    // 9. Regression check: Builders endpoints still work perfectly
    const res9 = await request('GET', '/api/builders');
    assert(res9.status === 200 && res9.data.success && Array.isArray(res9.data.builders), '19. Regression: GET /api/builders works without interference');

    const res9b = await request('GET', '/builders');
    assert(res9b.status === 200 && res9b.data.success, '20. Regression: GET /builders works without interference');

  } catch (err) {
    console.error('💥 Test error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`🏁 Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================`);

  if (failed > 0) process.exit(1);
}

runTests();
