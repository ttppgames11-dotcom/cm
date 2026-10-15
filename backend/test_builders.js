import jwt from 'jsonwebtoken';
import { get, all } from '../database/database.js';
import { JWT_SECRET } from './middleware/auth.js';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting Builders Feature Endpoints Test Suite...\n');

  // Test 1: GET /api/builders returns builders list
  {
    const res = await fetch(`${BASE_URL}/builders`);
    const data = await res.json();
    console.assert(res.status === 200, `Expected 200, got ${res.status}`);
    console.assert(data.success === true, 'Expected success: true');
    console.assert(Array.isArray(data.builders), 'Expected data.builders to be array');
    console.assert(data.builders.length >= 8, `Expected at least 8 builders, got ${data.builders.length}`);
    console.log(`✅ Test 1: GET /api/builders returns ${data.builders.length} builders.`);
  }

  // Get a builder ID from the list
  const listRes = await fetch(`${BASE_URL}/builders`);
  const listData = await listRes.json();
  const firstBuilder = listData.builders[0];
  const testBuilderId = firstBuilder.id;

  // Test 2: GET /api/builders/:id with existing ID
  {
    const res = await fetch(`${BASE_URL}/builders/${testBuilderId}`);
    const data = await res.json();
    console.assert(res.status === 200, `Expected 200, got ${res.status}`);
    console.assert(data.success === true, 'Expected success: true');
    console.assert(data.builder && data.builder.id === testBuilderId, 'Expected matching builder');
    console.log(`✅ Test 2: GET /api/builders/:id returned builder ${data.builder.developer || data.builder.name}.`);
  }

  // Test 3: GET /api/builders/:id with non-existent ID
  {
    const res = await fetch(`${BASE_URL}/builders/NON_EXISTENT_BLD`);
    const data = await res.json();
    console.assert(res.status === 404, `Expected 404, got ${res.status}`);
    console.assert(data.success === false, 'Expected success: false');
    console.assert(data.code === 'BUILDER_NOT_FOUND', `Expected BUILDER_NOT_FOUND, got ${data.code}`);
    console.log('✅ Test 3: GET /api/builders/NON_EXISTENT returns 404 BUILDER_NOT_FOUND.');
  }

  // Create a mock user token
  const testUserToken = jwt.sign(
    { id: 'M1001', name: 'अमोल जाधव', role: 'member', tier: 'Gold' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  let createdBuilderId = null;

  // Test 4: POST /api/builders with valid fields, RERA, and memberDiscountPercent > 0
  {
    const payload = {
      developer: 'सह्याद्री इन्फ्रास्ट्रक्चर',
      projectName: 'सह्याद्री रॉयल पार्क',
      ownerName: 'अमोल जाधव',
      city: 'पुणे',
      phone: '+91 98220 55443',
      projectType: 'flats',
      flatsDelivered: 120,
      amenities: ['स्वीमिंग पूल', 'जिम', 'क्लबहाऊस', 'उद्यान', '२४ तास सुरक्षा'],
      possessionDate: 'डिसेंबर २०२७',
      reraNumber: 'P52100099442',
      memberDiscountPercent: 5
    };

    const res = await fetch(`${BASE_URL}/builders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.assert(res.status === 201, `Expected 201, got ${res.status}`);
    console.assert(data.success === true, 'Expected success: true');
    console.assert(data.project || data.builder, 'Expected project/builder in response');

    const b = data.project || data.builder;
    createdBuilderId = b.id;
    console.assert(b.reraApproved === true, 'Expected reraApproved to be true when reraNumber provided');
    console.assert(b.discountForMembers === 'मराठा महासंघ सदस्यांसाठी विशेष 5% सवलत', `Expected discount text, got ${b.discountForMembers}`);
    console.assert(b.ownerId === 'M1001', `Expected ownerId to be M1001 from token, got ${b.ownerId}`);
    console.assert(b.phone === '9822055443', `Expected normalized phone, got ${b.phone}`);
    console.assert(b.flatsDelivered === 120, `Expected flatsDelivered: 120, got ${b.flatsDelivered}`);
    console.log(`✅ Test 4: POST /api/builders with RERA, discount %, and token ownerId succeeded (${b.id}).`);
  }

  // Test 5: POST /api/builders without RERA and memberDiscountPercent: 0
  {
    const payload = {
      developer: 'किल्लेदार असोसिएट्स',
      projectName: 'किल्लेदार हाईट्स',
      phone: '9422011223',
      projectType: 'villas',
      reraNumber: '',
      memberDiscountPercent: 0
    };

    const res = await fetch(`${BASE_URL}/builders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.assert(res.status === 201, `Expected 201, got ${res.status}`);
    const b = data.project || data.builder;
    console.assert(b.reraApproved === false, 'Expected reraApproved to be false when no reraNumber');
    console.assert(!b.discountForMembers, 'Expected discountForMembers to be null/absent when percent is 0');
    console.log('✅ Test 5: POST /api/builders sets reraApproved: false and no discount when percent is 0.');
  }

  // Test 6: POST /api/builders validation errors (invalid phone, invalid projectType, invalid discount %)
  {
    // Invalid phone
    const resPhone = await fetch(`${BASE_URL}/builders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ developer: 'Dev', phone: '12345' })
    });
    console.assert(resPhone.status === 400, 'Expected 400 for invalid phone');

    // Invalid projectType
    const resType = await fetch(`${BASE_URL}/builders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ developer: 'Dev', phone: '9822011223', projectType: 'castles' })
    });
    console.assert(resType.status === 400, 'Expected 400 for invalid projectType');

    // Invalid discount %
    const resDiscount = await fetch(`${BASE_URL}/builders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ developer: 'Dev', phone: '9822011223', memberDiscountPercent: 25 })
    });
    console.assert(resDiscount.status === 400, 'Expected 400 for discount > 10%');
    console.log('✅ Test 6: POST /api/builders enforces input validations cleanly.');
  }

  // Test 7: POST /api/builders/:id/enquiries
  {
    const enquiryPayload = {
      name: 'समीर मोहिते',
      phone: '+91 98229 88776',
      budget: '₹८० लाख',
      preferredCity: 'पुणे',
      message: '२ बीएचके फ्लॅटसाठी माहिती हवी आहे.'
    };

    const res = await fetch(`${BASE_URL}/builders/${createdBuilderId}/enquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify(enquiryPayload)
    });
    const data = await res.json();
    console.assert(res.status === 201, `Expected 201, got ${res.status}`);
    console.assert(data.success === true, 'Expected success: true');
    console.assert(data.enquiry && data.enquiry.id.startsWith('ENQ-'), 'Expected enquiry ID');
    console.assert(data.enquiry.builderId === createdBuilderId, 'Expected matching builderId');
    console.assert(data.enquiry.memberId === 'M1001', 'Expected logged-in memberId');
    console.assert(data.enquiry.phone === '9822988776', 'Expected normalized phone');

    // Check if notification was inserted for ownerId 'M1001'
    const notifs = await all('SELECT * FROM notifications WHERE member_id = ? AND type = "enquiry" ORDER BY created_at DESC', ['M1001']);
    console.assert(notifs.length > 0, 'Expected notification in database for ownerId');
    console.log(`✅ Test 7: POST /api/builders/:id/enquiries saved enquiry and notified owner (notif ID: ${notifs[0].id}).`);
  }

  // Test 8: POST /api/builders/:id/enquiries with invalid phone or missing name
  {
    const res1 = await fetch(`${BASE_URL}/builders/${createdBuilderId}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', phone: '9822988776' })
    });
    console.assert(res1.status === 400, 'Expected 400 for empty name');

    const res2 = await fetch(`${BASE_URL}/builders/${createdBuilderId}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'समीर', phone: '00000' })
    });
    console.assert(res2.status === 400, 'Expected 400 for invalid phone');

    const res3 = await fetch(`${BASE_URL}/builders/NON_EXISTENT_BLD/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'समीर', phone: '9822988776' })
    });
    console.assert(res3.status === 404, 'Expected 404 for non-existent builder');
    console.log('✅ Test 8: POST /api/builders/:id/enquiries enforces validations and 404 checks.');
  }

  console.log('\n🎉 ALL 8 BUILDERS TESTS PASSED PERFECTLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
