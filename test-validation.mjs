// Dedicated Validation Verification Test Suite
const BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

let passed = 0;
let failed = 0;

function assert(condition, testName, data = null) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`, data);
    failed++;
  }
}

async function runValidationTests() {
  console.log('🛡️ Starting Validation & Security Rejection Tests...\n');

  // Login as admin or register a test user
  let token = null;
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'admin@connectmaratha.org', password: 'password123' })
  });

  if (adminLogin.ok) {
    token = adminLogin.data.data.token;
  } else {
    // Register temporary admin member
    const rnd = Math.floor(Math.random() * 90000);
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'ॲडमिन पाटील',
        email: `admin${rnd}@connectmaratha.org`,
        phone: `98990${rnd.toString().padStart(5, '0')}`,
        password: 'password123'
      })
    });
    token = regRes.data?.data?.token;
  }

  // 1. REJECT: Invalid email in registration
  const badEmailReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'संदीप पाटील', email: 'invalid-email-address', phone: '9822011111' })
  });
  assert(badEmailReg.status === 400 && badEmailReg.data.code === 'VALIDATION_ERROR', 'Reject invalid email in registration', badEmailReg.data);

  // 2. REJECT: Invalid phone in registration
  const badPhoneReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'संदीप पाटील', email: 'valid@maratha.org', phone: '12345' })
  });
  assert(badPhoneReg.status === 400 && badPhoneReg.data.code === 'VALIDATION_ERROR', 'Reject invalid phone in registration', badPhoneReg.data);

  // 3. REJECT: Empty name in registration
  const emptyNameReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: '', email: 'valid@maratha.org' })
  });
  assert(emptyNameReg.status === 400 && emptyNameReg.data.code === 'VALIDATION_ERROR', 'Reject empty name in registration', emptyNameReg.data);

  // 4. REJECT: Missing identifier in login
  const emptyLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: '', password: '' })
  });
  assert(emptyLogin.status === 400 && emptyLogin.data.code === 'VALIDATION_ERROR', 'Reject empty identifier in login', emptyLogin.data);

  // 5. REJECT: Invalid phone in business registration
  const badBiz = await request('/businesses', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name: 'सह्याद्री उद्योग', phone: '000000000000' })
  });
  assert(badBiz.status === 400 && badBiz.data.code === 'VALIDATION_ERROR', 'Reject invalid phone in business registration', badBiz.data);

  // 6. REJECT: Invalid review rating (>5)
  const bizList = await request('/businesses');
  const testBizId = bizList.data?.data?.businesses?.[0]?.id || 'BIZ-01';
  const badRating = await request(`/businesses/${testBizId}/reviews`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ rating: 10, text: 'अतिउत्कृष्ट' })
  });
  assert(badRating.status === 400 && badRating.data.code === 'VALIDATION_ERROR', 'Reject rating > 5 in business reviews', badRating.data);

  // 7. REJECT: Negative donation amount
  const negDonation = await request('/donations/donate', {
    method: 'POST',
    body: JSON.stringify({ amount: -500 })
  });
  assert(negDonation.status === 400 && negDonation.data.code === 'VALIDATION_ERROR', 'Reject negative donation amount', negDonation.data);

  // 8. REJECT: Invalid PAN card in donation
  const badPAN = await request('/donations/donate', {
    method: 'POST',
    body: JSON.stringify({ amount: 1000, pan: 'INVALID-PAN-NUMBER' })
  });
  assert(badPAN.status === 400 && badPAN.data.code === 'VALIDATION_ERROR', 'Reject invalid PAN card in donation', badPAN.data);

  // 9. REJECT: Underage (< 18) in Matrimony
  const underAgeMatrimony = await request('/matrimony', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name: 'राकेश पाटील', gender: 'वर', age: 16 })
  });
  assert(underAgeMatrimony.status === 400 && underAgeMatrimony.data.code === 'VALIDATION_ERROR', 'Reject underage (<18) matrimony candidate', underAgeMatrimony.data);

  // 10. REJECT: Invalid blood group in blood donor registration
  const badBlood = await request('/blood/donors', {
    method: 'POST',
    body: JSON.stringify({ name: 'अमोल मोहिते', bloodGroup: 'Z-POSITIVE', phone: '9822011111' })
  });
  assert(badBlood.status === 400 && badBlood.data.code === 'VALIDATION_ERROR', 'Reject invalid blood group in donor registration', badBlood.data);

  // 11. REJECT: Empty post in community feed
  const emptyPost = await request('/community/posts', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ content: '' })
  });
  assert(emptyPost.status === 400 && emptyPost.data.code === 'MISSING_CONTENT', 'Reject empty community post', emptyPost.data);

  // 12. REJECT: Invalid phone in doctor directory registration
  const badDocPhone = await request('/doctors', {
    method: 'POST',
    body: JSON.stringify({ name: 'डॉ. अजित कदम', phone: '123' })
  });
  assert(badDocPhone.status === 400 && badDocPhone.data.code === 'INVALID_PHONE', 'Reject invalid phone in doctor registration', badDocPhone.data);

  // 13. REJECT: Invalid speaker booking phone
  const badSpkBook = await request('/speakers/book', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ speakerName: 'वक्ते महोदय', eventDate: '२०२६-१०-१०', organizerPhone: '999' })
  });
  assert(badSpkBook.status === 400 && badSpkBook.data.code === 'VALIDATION_ERROR', 'Reject invalid phone in speaker booking', badSpkBook.data);

  // 14. REJECT: Invalid role in admin assign-role
  const badRole = await request('/admin/assign-role', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ memberId: 'CM-96K-0001', newRole: 'hacker_role' })
  });
  assert(badRole.status === 400 && badRole.data.code === 'INVALID_ROLE', 'Reject invalid role in admin assign-role', badRole.data);

  console.log(`\n========================================`);
  console.log(`🛡️ Validation Test Summary: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} tests`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runValidationTests();
