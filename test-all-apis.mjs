// Comprehensive Realtime API Verification Test Suite
const BASE = 'http://localhost:5000/api';

let jwtToken = null;
let testMemberId = null;
let testBusinessId = null;
let testReferralId = null;
let testEventId = null;
let testJobId = null;
let testPostId = null;

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (jwtToken) headers['Authorization'] = `Bearer ${jwtToken}`;

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

async function runTests() {
  console.log('🚀 Starting Full Connect Maratha Realtime API Test Suite...\n');

  // 1. HEALTH
  const health = await request('/health');
  assert(health.ok && health.data.success, 'GET /api/health');

  // 2. AUTH: REGISTER
  const randomSuffix = Math.floor(Math.random() * 10000);
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: `यशवंतराव कदम ${randomSuffix}`,
      email: `yashwant${randomSuffix}@maratha.org`,
      phone: `98220${randomSuffix.toString().padStart(5, '0')}`,
      password: 'password123',
      district: 'सातारा',
      taluka: 'कराड',
      kul: '९६ कुळी मराठा कदम',
      gotra: 'भारद्वाज'
    })
  });
  assert(regRes.status === 201 && regRes.data.success && regRes.data.data.token, 'POST /api/auth/register', regRes.data);
  jwtToken = regRes.data.data.token;
  testMemberId = regRes.data.data.member.id;

  // 3. AUTH: LOGIN
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      identifier: `yashwant${randomSuffix}@maratha.org`,
      password: 'password123'
    })
  });
  assert(loginRes.ok && loginRes.data.data.token, 'POST /api/auth/login');

  // 4. AUTH: GET ME
  const meRes = await request('/auth/me');
  assert(meRes.ok && meRes.data.data.user.id === testMemberId, 'GET /api/auth/me');

  // 5. AUTH: FORGOT PASSWORD
  const forgotRes = await request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ identifier: `yashwant${randomSuffix}@maratha.org` })
  });
  assert(forgotRes.ok && forgotRes.data.data.otpSent, 'POST /api/auth/forgot-password');

  // 6. AUTH: VERIFY OTP
  const verifyRes = await request('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier: `yashwant${randomSuffix}@maratha.org`, otp: '123456' })
  });
  assert(verifyRes.ok && verifyRes.data.data.verified, 'POST /api/auth/verify-otp');

  // 7. MEMBERS: STATS SUMMARY
  const statsRes = await request('/members/stats/summary');
  assert(statsRes.ok && statsRes.data.data.totalMembers >= 1, 'GET /api/members/stats/summary');

  // 8. MEMBERS: LIST
  const membersRes = await request('/members?district=सातारा');
  assert(membersRes.ok && Array.isArray(membersRes.data.data.members), 'GET /api/members');

  // 9. MEMBERS: GET BY ID
  const memberById = await request(`/members/${testMemberId}`);
  assert(memberById.ok && memberById.data.data.member.id === testMemberId, 'GET /api/members/:id');

  // 10. MEMBERS: CARD
  const cardRes = await request(`/members/${testMemberId}/card`);
  assert(cardRes.ok && cardRes.data.data.cardData.qrVerificationToken, 'GET /api/members/:id/card');

  // 11. MEMBERS: UPDATE
  const updateRes = await request(`/members/${testMemberId}`, {
    method: 'PUT',
    body: JSON.stringify({ about: 'उद्योग व समाजकार्य' })
  });
  assert(updateRes.ok && updateRes.data.data.member.about === 'उद्योग व समाजकार्य', 'PUT /api/members/:id');

  // 12. MEMBERS: NOTIFICATIONS
  const notifRes = await request('/members/notifications');
  assert(notifRes.ok && Array.isArray(notifRes.data.data.notifications), 'GET /api/members/notifications');

  // 13. MEMBERS: SEND MESSAGE
  const sendMsgRes = await request('/members/messages', {
    method: 'POST',
    body: JSON.stringify({ recipientId: 'CM-96K-001', subject: 'जय जिजाऊ', message: 'महासंघ कार्यात सहभागाबाबत.' })
  });
  assert(sendMsgRes.status === 201 && sendMsgRes.data.data.message.id, 'POST /api/members/messages');

  // 14. MEMBERS: GET MESSAGES
  const getMsgs = await request('/members/messages');
  assert(getMsgs.ok && getMsgs.data.data.messages.length >= 1, 'GET /api/members/messages');

  // 15. BUSINESS: CREATE
  const bizCreate = await request('/businesses', {
    method: 'POST',
    body: JSON.stringify({
      name: `शिवशक्ती इंजिनिअरिंग वर्क्स ${randomSuffix}`,
      cat: 'मॅन्युफॅक्चरिंग व फॅब्रिकेशन',
      phone: '+91 98220 54321',
      city: 'कराड',
      district: 'सातारा'
    })
  });
  assert(bizCreate.status === 201 && bizCreate.data.data.business.id, 'POST /api/businesses');
  testBusinessId = bizCreate.data.data.business.id;

  // 16. BUSINESS: GET LIST
  const bizList = await request('/businesses');
  assert(bizList.ok && bizList.data.data.businesses.length >= 1, 'GET /api/businesses');

  // 17. BUSINESS: GET BY ID
  const bizById = await request(`/businesses/${testBusinessId}`);
  assert(bizById.ok && bizById.data.data.business.id === testBusinessId, 'GET /api/businesses/:id');

  // 18. BUSINESS: REVIEWS
  const reviewRes = await request(`/businesses/${testBusinessId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating: 5, text: 'अतिशय दर्जेदार काम!' })
  });
  assert(reviewRes.status === 201 && reviewRes.data.data.review.id, 'POST /api/businesses/:id/reviews');

  // 19. SANGAM: CREATE REFERRAL
  const refCreate = await request('/sangam/referrals', {
    method: 'POST',
    body: JSON.stringify({
      title: 'CNC मशीन फॅब्रिकेशन काम',
      clientName: 'महेश जाधव',
      clientPhone: '+91 98221 00000',
      value: 150000
    })
  });
  assert(refCreate.status === 201 && refCreate.data.data.referral.id, 'POST /api/sangam/referrals');
  testReferralId = refCreate.data.data.referral.id;

  // 20. SANGAM: GET REFERRALS
  const refList = await request('/sangam/referrals');
  assert(refList.ok && refList.data.data.referrals.length >= 1, 'GET /api/sangam/referrals');

  // 21. SANGAM: UPDATE STATUS
  const refStatus = await request(`/sangam/referrals/${testReferralId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'यशस्वी क्लोज (Success)', value: 150000 })
  });
  assert(refStatus.ok && refStatus.data.data.referral.status.includes('यशस्वी'), 'PUT /api/sangam/referrals/:id/status');

  // 22. SANGAM: MEETINGS
  const meetCreate = await request('/sangam/meetings', {
    method: 'POST',
    body: JSON.stringify({ recipientName: 'आनंदराव देशमुख', date: '२८ सप्टेंबर २०२६' })
  });
  assert(meetCreate.status === 201 && meetCreate.data.data.meeting.id, 'POST /api/sangam/meetings');

  // 23. SANGAM: METRICS
  const sangamMetrics = await request('/sangam/metrics');
  assert(sangamMetrics.ok && sangamMetrics.data.data.metrics.totalBusinessExchanged, 'GET /api/sangam/metrics');

  // 24. DIRECTORIES: DOCTORS
  const docCreate = await request('/doctors', {
    method: 'POST',
    body: JSON.stringify({ name: 'डॉ. विक्रम कदम', specialty: 'हृदयरोग', phone: '+91 98220 11111' })
  });
  assert(docCreate.status === 201 && docCreate.data.data.doctor.id, 'POST /api/doctors');
  const docList = await request('/doctors');
  assert(docList.ok && docList.data.data.doctors.length >= 1, 'GET /api/doctors');

  // 25. DIRECTORIES: ARTISTS
  const artList = await request('/artists');
  assert(artList.ok && Array.isArray(artList.data.data.artists), 'GET /api/artists');

  // 26. DIRECTORIES: OFFICERS
  const offList = await request('/officers');
  assert(offList.ok && Array.isArray(offList.data.data.officers), 'GET /api/officers');

  // 27. DIRECTORIES: SPEAKERS & BOOKINGS
  const spkList = await request('/speakers');
  assert(spkList.ok && Array.isArray(spkList.data.data.speakers), 'GET /api/speakers');
  const spkBook = await request('/speakers/book', {
    method: 'POST',
    body: JSON.stringify({ speakerName: 'प्रा. नितीन बानगुडे पाटील', eventDate: '१९ फेब्रुवारी', organizerPhone: '9822012345' })
  });
  assert(spkBook.status === 201 && spkBook.data.data.booking.id, 'POST /api/speakers/book');

  // 28. DIRECTORIES: ORGANIZATIONS
  const orgList = await request('/organizations');
  assert(orgList.ok && Array.isArray(orgList.data.data.organizations), 'GET /api/organizations');

  // 29. COMMERCIAL: BUILDERS
  const bldCreate = await request('/builders', {
    method: 'POST',
    body: JSON.stringify({ projectName: 'शिवतीर्थ हाइट्स', developer: 'कदम डेव्हलपर्स', location: 'सातारा' })
  });
  assert(bldCreate.status === 201 && bldCreate.data.data.project.id, 'POST /api/builders');
  const bldList = await request('/builders');
  assert(bldList.ok && bldList.data.data.builders.length >= 1, 'GET /api/builders');

  // 30. COMMERCIAL: MANUFACTURERS
  const mfgList = await request('/manufacturers');
  assert(mfgList.ok && Array.isArray(mfgList.data.data.manufacturers), 'GET /api/manufacturers');

  // 31. COMMERCIAL: DAIRY
  const dryList = await request('/dairy');
  assert(dryList.ok && Array.isArray(dryList.data.data.dairy), 'GET /api/dairy');

  // 32. COMMERCIAL: BANK LOANS
  const loanApply = await request('/bank/loans', {
    method: 'POST',
    body: JSON.stringify({ loanAmount: '₹१०,००,०००', purpose: 'नवीन फॅब्रिकेशन वर्कशॉप विस्तार' })
  });
  assert(loanApply.status === 201 && loanApply.data.data.loanApplication.id, 'POST /api/bank/loans');
  const loanList = await request('/bank/loans');
  assert(loanList.ok && loanList.data.data.myApplications.length >= 1, 'GET /api/bank/loans');

  // 33. EMERGENCY: BLOOD SOS & DONORS
  const bloodSOS = await request('/blood/requests', {
    method: 'POST',
    body: JSON.stringify({ patient: 'प्रशांत कदम', hospital: 'सिव्हिल हॉस्पिटल', bloodGroup: 'B+', contact: '9822011111' })
  });
  assert(bloodSOS.status === 201 && bloodSOS.data.data.request.id, 'POST /api/blood/requests');
  const bloodReqs = await request('/blood/requests');
  assert(bloodReqs.ok && bloodReqs.data.data.requests.length >= 1, 'GET /api/blood/requests');

  const donorReg = await request('/blood/donors', {
    method: 'POST',
    body: JSON.stringify({ name: 'संदीप सावंत', bloodGroup: 'O+', phone: '9822022222' })
  });
  assert(donorReg.status === 201 && donorReg.data.data.donor.id, 'POST /api/blood/donors');
  const donorList = await request('/blood/donors');
  assert(donorList.ok && donorList.data.data.donors.length >= 1, 'GET /api/blood/donors');

  // 34. EMERGENCY: MATRIMONY
  const matReg = await request('/matrimony', {
    method: 'POST',
    body: JSON.stringify({ name: 'इंजि. अनिकेत कदम', gender: 'वर (Groom)', age: 28, city: 'सातारा' })
  });
  assert(matReg.status === 201 && matReg.data.data.profile.id, 'POST /api/matrimony');
  const matList = await request('/matrimony');
  assert(matList.ok && matList.data.data.profiles.length >= 1, 'GET /api/matrimony');

  // 35. EMERGENCY: WOMEN HELP
  const womenHelp = await request('/women/help', {
    method: 'POST',
    body: JSON.stringify({ subject: 'स्वयंरोजगार मार्गदर्शन', description: 'महिला बचतगट गृहउद्योग कर्ज मार्गदर्शन.' })
  });
  assert(womenHelp.status === 201 && womenHelp.data.data.help.id, 'POST /api/women/help');

  // 36. EMERGENCY: SOCIAL VOLUNTEERS
  const volReg = await request('/social/volunteers', {
    method: 'POST',
    body: JSON.stringify({ name: 'अजिंक्य घोरपडे', phone: '9822033333' })
  });
  assert(volReg.status === 201 && volReg.data.data.volunteer.id, 'POST /api/social/volunteers');

  // 37. EMERGENCY: POLITICAL GRIEVANCES
  const grvSubmit = await request('/political/grievances', {
    method: 'POST',
    body: JSON.stringify({ title: 'दुर्ग संवर्धन निधी वाढवणेबाबत', description: 'स्थानिक किल्ल्यांच्या तटबंदी दुरुस्ती निधी.' })
  });
  assert(grvSubmit.status === 201 && grvSubmit.data.data.grievance.id, 'POST /api/political/grievances');

  // 38. COMMUNITY: POSTS & COMMENTS & LIKE
  const postCreate = await request('/community/posts', {
    method: 'POST',
    body: JSON.stringify({ content: 'जय भवानी जय शिवाजी! सर्व मराठा बांधवांना एकत्र आणणारा मंच.' })
  });
  assert(postCreate.status === 201 && postCreate.data.data.post.id, 'POST /api/community/posts');
  testPostId = postCreate.data.data.post.id;

  const postLike = await request(`/community/posts/${testPostId}/like`, { method: 'POST' });
  assert(postLike.ok && postLike.data.data.likes >= 1, 'POST /api/community/posts/:id/like');

  const postCmt = await request(`/community/posts/${testPostId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text: 'अतिशय सुंदर उपक्रम!' })
  });
  assert(postCmt.status === 201 && postCmt.data.data.comment.id, 'POST /api/community/posts/:id/comments');

  // 39. COMMUNITY: GROUPS & NEWS
  const grpList = await request('/community/groups');
  assert(grpList.ok && grpList.data.data.groups.length >= 1, 'GET /api/community/groups');
  const newsList = await request('/community/news');
  assert(newsList.ok && Array.isArray(newsList.data.data.news), 'GET /api/community/news');

  // 40. EVENTS: CREATE & RSVP
  const evtCreate = await request('/events', {
    method: 'POST',
    body: JSON.stringify({ title: 'कराड तालुका मराठा मेळावा', date: '१५ ऑक्टोबर २०२६', location: 'कराड' })
  });
  assert(evtCreate.status === 201 && evtCreate.data.data.event.id, 'POST /api/events');
  testEventId = evtCreate.data.data.event.id;

  const evtRsvp = await request(`/events/${testEventId}/rsvp`, { method: 'POST' });
  assert(evtRsvp.status === 201 && evtRsvp.data.data.qrPass, 'POST /api/events/:id/rsvp');

  // 41. DONATIONS: CAMPAIGNS & DONATE
  const campList = await request('/donations/campaigns');
  assert(campList.ok && campList.data.data.campaigns.length >= 1, 'GET /api/donations/campaigns');

  const donateRes = await request('/donations/donate', {
    method: 'POST',
    body: JSON.stringify({ amount: 5000, donorName: 'यशवंतराव कदम', pan: 'ABCDE1234F' })
  });
  assert(donateRes.status === 201 && donateRes.data.data.receiptNo, 'POST /api/donations/donate');

  const recentDonations = await request('/donations/recent');
  assert(recentDonations.ok && recentDonations.data.data.recentDonations.length >= 1, 'GET /api/donations/recent');

  // 42. JOBS: POST & APPLY
  const jobCreate = await request('/jobs', {
    method: 'POST',
    body: JSON.stringify({ title: 'उत्पादन व्यवस्थापक', company: 'कदम इंडस्ट्रीज', location: 'सातारा एमआयडीसी' })
  });
  assert(jobCreate.status === 201 && jobCreate.data.data.job.id, 'POST /api/jobs');
  testJobId = jobCreate.data.data.job.id;

  const jobApply = await request(`/jobs/${testJobId}/apply`, {
    method: 'POST',
    body: JSON.stringify({ resumeUrl: 'https://connectmaratha.org/resumes/kadam.pdf', coverNote: 'मी इच्छुक आहे' })
  });
  assert(jobApply.status === 201 && jobApply.data.data.application.id, 'POST /api/jobs/:id/apply');

  // 43. SERVICES & BOOKING
  const srvList = await request('/services');
  assert(srvList.ok && srvList.data.data.services.length >= 1, 'GET /api/services');

  const srvBooking = await request('/services/booking', {
    method: 'POST',
    body: JSON.stringify({ serviceCategory: 'इलेक्ट्रिशियन', phone: '9822012345', address: 'सातारा' })
  });
  assert(srvBooking.status === 201 && srvBooking.data.data.booking.id, 'POST /api/services/booking');

  // 44. CULTURE: ORAL HISTORY
  const oralCreate = await request('/culture/oral-history', {
    method: 'POST',
    body: JSON.stringify({ title: 'कराड परिसरातील मावळ्यांची परंपरा', story: 'आमच्या पूर्वजांनी शिवकाळात सैन्यात सेवा केली.' })
  });
  assert(oralCreate.status === 201 && oralCreate.data.data.story.id, 'POST /api/culture/oral-history');
  const oralList = await request('/culture/oral-history');
  assert(oralList.ok && Array.isArray(oralList.data.data), 'GET /api/culture/oral-history');

  // 45. CULTURE: DIALECTS, FOOD, GRAMDEVAT, FORTS, KNOWLEDGE GRAPH
  const dialects = await request('/culture/dialects');
  assert(dialects.ok && dialects.data.data.dialects.length >= 1, 'GET /api/culture/dialects');
  const food = await request('/culture/food');
  assert(food.ok && food.data.data.foodHeritage.length >= 1, 'GET /api/culture/food');
  const gramdevat = await request('/culture/gramdevat');
  assert(gramdevat.ok && gramdevat.data.data.gramdevats.length >= 1, 'GET /api/culture/gramdevat');
  const forts = await request('/culture/forts');
  assert(forts.ok && forts.data.data.forts.length >= 1, 'GET /api/culture/forts');
  const kg = await request('/culture/knowledge-graph');
  assert(kg.ok && kg.data.data.knowledgeGraph.nodes.length >= 1, 'GET /api/culture/knowledge-graph');

  // 46. QUIZ: STATS, QUESTIONS, SUBMIT, LEADERBOARD
  const quizStats = await request('/quiz/stats');
  assert(quizStats.ok && quizStats.data.data.total_questions >= 0, 'GET /api/quiz/stats');
  const quizQ = await request('/quiz/questions?count=5');
  assert(quizQ.ok && Array.isArray(quizQ.data.data.questions), 'GET /api/quiz/questions');
  const quizSub = await request('/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({ candidate_name: 'यशवंत कदम', score: 9, total: 10, points: 90 })
  });
  assert(quizSub.status === 201 && quizSub.data.data.submission.id, 'POST /api/quiz/submit');
  const quizLead = await request('/quiz/leaderboard');
  assert(quizLead.ok && Array.isArray(quizLead.data.data.leaderboard), 'GET /api/quiz/leaderboard');

  // 47. ADMIN: METRICS, AUDIT LOGS, ROLES MATRIX, VERIFY, ASSIGN ROLE, EXPORT
  // Give admin role to token for admin testing
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier: 'admin@connectmaratha.org', password: 'password123' })
  });
  if (adminLogin.ok) {
    jwtToken = adminLogin.data.data.token;
  }

  const adminMetrics = await request('/admin/metrics');
  assert(adminMetrics.ok && adminMetrics.data.data.metrics.overview.totalRegisteredMembers >= 1, 'GET /api/admin/metrics');

  const auditLogs = await request('/admin/audit-logs');
  assert(auditLogs.ok && Array.isArray(auditLogs.data.data.auditLogs), 'GET /api/admin/audit-logs');

  const rolesMatrix = await request('/admin/roles-matrix');
  assert(rolesMatrix.ok && Array.isArray(rolesMatrix.data.data.rolesMatrix), 'GET /api/admin/roles-matrix');

  const verifyMember = await request(`/admin/verify-member/${testMemberId}`, {
    method: 'POST',
    body: JSON.stringify({ status: 'approved', remarks: 'सर्व कागदपत्रे वैध आहेत' })
  });
  assert(verifyMember.ok && verifyMember.data.data.member.verified, 'POST /api/admin/verify-member/:id');

  const assignRole = await request('/admin/assign-role', {
    method: 'PUT',
    body: JSON.stringify({ memberId: testMemberId, newRole: 'chapter_president', assignedScope: 'सातारा' })
  });
  assert(assignRole.ok && assignRole.data.data.member.role === 'chapter_president', 'PUT /api/admin/assign-role');

  const exportRep = await request('/admin/reports/export?type=members');
  assert(exportRep.ok && exportRep.data.data.recordCount >= 1, 'GET /api/admin/reports/export');

  // 48. AUTH: LOGOUT
  const logoutRes = await request('/auth/logout', { method: 'POST' });
  assert(logoutRes.ok && logoutRes.data.data.loggedOut, 'POST /api/auth/logout');

  console.log(`\n========================================`);
  console.log(`🏁 Test Summary: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} tests`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
