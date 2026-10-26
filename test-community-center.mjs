// Comprehensive Community Center Test Suite
import { fileURLToPath } from 'url';

const BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
}

async function runCommunityCenterTests() {
  console.log('🚀 Starting Community Center CRM & Database API Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, name, data = null) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`, data);
      failed++;
    }
  }

  // 1. Health
  const health = await request('/health');
  assert(health.ok, 'Backend server is running on :5000');
  if (!health.ok) {
    console.error('⚠️ Backend server is not running on :5000. Start backend first.');
    return;
  }

  // 2. Auth Login as Superadmin
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: '9876500000', password: 'superadmin1674' })
  });
  assert(loginRes.ok && loginRes.data?.data?.token, 'Login as Super Admin');
  const adminToken = loginRes.data?.data?.token;

  // 3. Auth Login as Center Manager
  const mgrLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: '9876500099', password: 'center1674' })
  });
  assert(mgrLoginRes.ok && mgrLoginRes.data?.data?.token, 'Login as Center Manager (सचिन मोहिते)');
  const mgrToken = mgrLoginRes.data?.data?.token || adminToken;

  // 4. GET /api/admin/community-centers
  const getCentersRes = await request('/admin/community-centers', {}, mgrToken);
  assert(getCentersRes.ok && Array.isArray(getCentersRes.data?.data?.centers), 'GET /api/admin/community-centers returns centers list');
  const centers = getCentersRes.data?.data?.centers || [];
  console.log(`   Found ${centers.length} seeded/active community centers across Maharashtra.`);

  const hasStateCenter = centers.some(c => c.tier === 'state');
  const hasDivisionCenter = centers.some(c => c.tier === 'division');
  const hasDistrictCenter = centers.some(c => c.tier === 'district');
  const hasTalukaCenter = centers.some(c => c.tier === 'taluka');
  assert(hasStateCenter && hasDivisionCenter && hasDistrictCenter && hasTalukaCenter, 'Multi-tier coverage (State, Division, District, Taluka) present');

  // 5. POST /api/admin/community-centers (Create new center)
  const testCenterPayload = {
    name: 'सोलापूर पंढरपूर स्वराज्य सेवा व व्यापार केंद्र',
    tier: 'taluka',
    division: 'पुणे विभाग',
    district: 'सोलापूर',
    taluka: 'पंढरपूर',
    address: 'विठ्ठल मंदिर परिसर, स्टेशन रोड, पंढरपूर ४१३३०४',
    contactPerson: 'श्री. समाधान कदम',
    contactPhone: '9822099771',
    partnerName: 'विठ्ठल-रुक्मिणी मराठा प्रतिष्ठान',
    investmentTier: '₹३,६०,००० (तालुका मॉडेल)',
    initialMembers: 120,
    initialVisitors: 15
  };

  const createRes = await request('/admin/community-centers', {
    method: 'POST',
    body: JSON.stringify(testCenterPayload)
  }, mgrToken);
  assert(createRes.status === 201 && createRes.data?.data?.center?.id, 'POST /api/admin/community-centers creates new center', createRes.data);
  const createdCenterId = createRes.data?.data?.center?.id;

  // 6. POST /api/admin/center-action (Visitor Checkin)
  const visitorActionRes = await request('/admin/center-action', {
    method: 'POST',
    body: JSON.stringify({
      centerId: createdCenterId,
      actionType: 'visitor_checkin',
      notes: 'अभ्यागत: विजयसिंह जाधव - हेतू: FPO धान्य थेट विक्री नोंदणी'
    })
  }, mgrToken);
  assert(visitorActionRes.ok && visitorActionRes.data?.data?.center?.todayVisitors > 0, 'POST /api/admin/center-action (visitor_checkin)', visitorActionRes.data);

  // 7. POST /api/admin/center-action (Daily Collection)
  const collectionActionRes = await request('/admin/center-action', {
    method: 'POST',
    body: JSON.stringify({
      centerId: createdCenterId,
      actionType: 'collection',
      amount: 1500,
      notes: 'वार्षिक सभासद वर्गणी पावती'
    })
  }, mgrToken);
  assert(collectionActionRes.ok && collectionActionRes.data?.data?.center?.dailyCollection >= 1500, 'POST /api/admin/center-action (collection)', collectionActionRes.data);

  // 8. PUT /api/admin/community-centers/:id (Update Center)
  const updateRes = await request(`/admin/community-centers/${createdCenterId}`, {
    method: 'PUT',
    body: JSON.stringify({
      address: 'छत्रपती शिवाजी महाराज चौक, पंढरपूर ४१३३०४',
      contactPhone: '9822099888',
      status: 'सक्रिय (Active)'
    })
  }, mgrToken);
  assert(updateRes.ok && updateRes.data?.data?.center?.address?.includes('शिवाजी महाराज चौक'), 'PUT /api/admin/community-centers/:id updates details', updateRes.data);

  // 9. DELETE /api/admin/community-centers/:id (Archive Center)
  const deleteRes = await request(`/admin/community-centers/${createdCenterId}`, {
    method: 'DELETE'
  }, adminToken);
  assert(deleteRes.ok, 'DELETE /api/admin/community-centers/:id removes/archives center', deleteRes.data);

  console.log(`\n========================================`);
  console.log(`🎉 Community Center Tests Finished: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);
}

runCommunityCenterTests();
