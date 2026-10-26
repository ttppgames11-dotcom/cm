import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { 
  validateBloodRequest, 
  validateBloodDonor, 
  validateMatrimony, 
  sanitize, 
  isValidPhone, 
  cleanPhone, 
  isValidBloodGroup 
} from '../utils/validator.js';

const router = Router();

const MODERATOR_ROLES = ['superadmin', 'admin', 'ceo', 'center_manager', 'center_admin', 'district_admin', 'taluka_admin'];
const isModerator = (user) => user && MODERATOR_ROLES.includes(user.role);

// ==========================================
// 1. EMERGENCY BLOOD PORTAL
// ==========================================

// GET /api/blood/requests - Active emergency requests with filter
router.get('/blood/requests', (req, res) => {
  const { bloodGroup, city, district, urgency, status } = req.query;
  let list = db.getCollection('bloodRequests');

  // By default, show active requests unless user asked for all or fulfilled
  const reqStatus = status || 'active';
  if (reqStatus !== 'all') {
    list = list.filter(r => (r.status || 'active') === reqStatus);
  }

  if (bloodGroup && bloodGroup !== 'सर्व') {
    list = list.filter(r => (r.bloodGroup || '').toLowerCase().includes(bloodGroup.toLowerCase()));
  }
  if (city && city !== 'सर्व') {
    list = list.filter(r => (r.city || '').toLowerCase().includes(city.toLowerCase()) || (r.district || '').toLowerCase().includes(city.toLowerCase()));
  }
  if (district && district !== 'सर्व') {
    list = list.filter(r => (r.district || '').toLowerCase().includes(district.toLowerCase()));
  }
  if (urgency && urgency !== 'सर्व') {
    list = list.filter(r => (r.urgency || '').toLowerCase().includes(urgency.toLowerCase()));
  }

  // Sort: newest first
  list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return sendSuccess(res, 'तातडीची रक्त मागणी यादी', { requests: list, count: list.length });
});

// GET /api/blood/requests/my - Patient family's own requests + live volunteer response counts
router.get('/blood/requests/my', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userPhone = req.user.phone ? cleanPhone(req.user.phone) : '';
  const allReqs = db.getCollection('bloodRequests');
  const allResponses = db.getCollection('bloodResponses');

  const myReqs = allReqs.filter(r => 
    r.submittedBy === userId || 
    (userPhone && r.contact && cleanPhone(r.contact) === userPhone)
  ).map(r => {
    const responseCount = allResponses.filter(res => res.requestId === r.id).length;
    return { ...r, responsesCount: responseCount };
  });

  return sendSuccess(res, 'माझ्या रक्त मागण्या व प्रतिसाद यादी', { requests: myReqs, count: myReqs.length });
});

// GET /api/blood/requests/admin/pending - Coordinator verification queue (Feature 26: Hospital slip check)
router.get('/blood/requests/admin/pending', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'प्रशासक किंवा आरोग्य समन्वयक परवानगी आवश्यक.', 'FORBIDDEN', 403);
  }

  const allReqs = db.getCollection('bloodRequests');
  const pending = allReqs.filter(r => r.status === 'active' && !r.verified);

  return sendSuccess(res, 'पडताळणी प्रलंबित रक्त मागण्या', { requests: pending, count: pending.length });
});

// GET /api/blood/requests/:id - Single request details
router.get('/blood/requests/:id', (req, res) => {
  const request = db.findById('bloodRequests', req.params.id);
  if (!request) {
    return sendError(res, 'रक्त मागणी सापडली नाही.', 'REQUEST_NOT_FOUND', 404);
  }
  return sendSuccess(res, 'रक्त मागणी तपशील', { request });
});

// POST /api/blood/requests - Submit instant live SOS request
router.post('/blood/requests', optionalToken, (req, res) => {
  const { isValid, errors, sanitized } = validateBloodRequest(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'अवैध रक्त मागणी माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
  }

  const { patient, hospital, bloodGroup, contact, units } = sanitized;
  const { urgency, city, district, patientRelation, requirementNotes, hospitalBedNo } = req.body;

  const isMod = isModerator(req.user);

  const newReq = {
    id: `REQ-${Date.now().toString().slice(-4)}`,
    patient,
    hospital,
    hospitalBedNo: sanitize(hospitalBedNo) || '',
    bloodGroup,
    units: Number(units) || 1,
    urgency: sanitize(urgency) || 'तात्काळ (Emergency)',
    city: sanitize(city) || 'पुणे',
    district: sanitize(district) || sanitize(city) || 'पुणे',
    contact,
    patientRelation: sanitize(patientRelation) || 'नातेवाईक',
    notes: sanitize(requirementNotes) || '',
    status: 'active', // Instantly active to save lives!
    verified: isMod ? true : false,
    verificationBadge: isMod ? '🟢 सप्रमाण पुरावा (Hospital Verified)' : '🟡 समुदाय नोंद (Community SOS)',
    submittedBy: req.user?.id || 'GUEST',
    createdAt: new Date().toISOString()
  };

  db.insert('bloodRequests', newReq);
  db.addAuditLog('SOS_BLOOD_REQUEST', req.user?.id || 'GUEST', { requestId: newReq.id, bloodGroup, hospital });

  return sendSuccess(res, '🚨 तातडीची रक्त मागणी थेट लाईव्ह प्रसारित करण्यात आली!', { request: newReq }, 201);
});

// PATCH /api/blood/requests/:id/verify - Coordinator hospital slip verification (Feature 26)
router.patch('/blood/requests/:id/verify', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'केवळ केंद्र समन्वयक किंवा प्रशासक पडताळणी करू शकतात.', 'FORBIDDEN', 403);
  }

  const request = db.findById('bloodRequests', req.params.id);
  if (!request) {
    return sendError(res, 'रक्त मागणी सापडली नाही.', 'NOT_FOUND', 404);
  }

  const { verificationNotes, isHospitalSlipValid } = req.body;

  const updated = db.update('bloodRequests', req.params.id, {
    verified: isHospitalSlipValid !== false,
    verificationBadge: isHospitalSlipValid !== false ? '🟢 सप्रमाण पुरावा (Hospital Verified)' : '⚪ अपूर्ण संदर्भ (Needs Verification)',
    verifiedBy: req.user.id,
    verifierName: req.user.name,
    verificationNotes: sanitize(verificationNotes) || 'रुग्णालय रक्तपेढी स्लिप तपासली व अधिकृत केली.',
    verifiedAt: new Date().toISOString()
  });

  db.addAuditLog('VERIFY_BLOOD_REQUEST', req.user.id, { requestId: req.params.id, verified: updated.verified });

  return sendSuccess(res, 'रक्त मागणी रुग्णालय पडताळणी यशस्वी!', { request: updated });
});

// PATCH /api/blood/requests/:id/fulfill - Mark request as fulfilled / closed
router.patch('/blood/requests/:id/fulfill', optionalToken, (req, res) => {
  const request = db.findById('bloodRequests', req.params.id);
  if (!request) {
    return sendError(res, 'रक्त मागणी सापडली नाही.', 'NOT_FOUND', 404);
  }

  const isOwner = req.user && (request.submittedBy === req.user.id || (req.user.phone && cleanPhone(request.contact) === cleanPhone(req.user.phone)));
  const isMod = isModerator(req.user);

  const { confirmationPhone, fulfillmentNotes } = req.body;
  const phoneMatches = confirmationPhone && cleanPhone(confirmationPhone) === cleanPhone(request.contact);

  if (!isOwner && !isMod && !phoneMatches) {
    return sendError(res, 'केवळ रुग्ण कुटुंब किंवा समन्वयक मागणी बंद करू शकतात.', 'FORBIDDEN', 403);
  }

  const updated = db.update('bloodRequests', req.params.id, {
    status: 'fulfilled',
    fulfillmentNotes: sanitize(fulfillmentNotes) || 'रक्त मिळाले, रुग्ण सुरक्षित. सर्व दात्यांचे मनःपूर्वक आभार!',
    fulfilledAt: new Date().toISOString()
  });

  db.addAuditLog('FULFILL_BLOOD_REQUEST', req.user?.id || 'GUEST', { requestId: req.params.id });

  return sendSuccess(res, '✅ रक्त मागणी यशस्वीरीत्या पूर्ण (Fulfilled) म्हणून बंद करण्यात आली!', { request: updated });
});

// POST /api/blood/requests/:id/respond - Volunteer donor steps up ("I want to donate")
router.post('/blood/requests/:id/respond', optionalToken, (req, res) => {
  const request = db.findById('bloodRequests', req.params.id);
  if (!request) {
    return sendError(res, 'रक्त मागणी सापडली नाही.', 'NOT_FOUND', 404);
  }

  if (request.status === 'fulfilled') {
    return sendError(res, 'या रुग्णाची रक्ताची गरज आधीच पूर्ण झाली आहे.', 'ALREADY_FULFILLED', 400);
  }

  const { donorName, phone, bloodGroup, etaMinutes, message } = req.body;
  const cleanedPhone = cleanPhone(phone || req.user?.phone || '');

  if (!cleanedPhone || !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया आपला वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const response = {
    id: `BRES-${Date.now().toString().slice(-4)}`,
    requestId: request.id,
    patientName: request.patient,
    hospital: request.hospital,
    donorId: req.user?.id || 'GUEST',
    donorName: sanitize(donorName) || req.user?.name || 'रक्तदाता बांधव',
    donorPhone: cleanedPhone,
    bloodGroup: sanitize(bloodGroup) || request.bloodGroup,
    etaMinutes: Number(etaMinutes) || 45,
    message: sanitize(message) || 'मी रुग्णालयात रक्तदानासाठी येत आहे.',
    status: 'offered',
    createdAt: new Date().toISOString()
  };

  db.insert('bloodResponses', response);
  db.addAuditLog('DONOR_RESPOND_BLOOD', req.user?.id || 'GUEST', { requestId: request.id, responseId: response.id });

  return sendSuccess(res, '❤️ आपण पुढे आल्याबद्दल धन्यवाद! रुग्णाच्या कुटुंबास आपल्या मदतीची माहिती पोहोचवली आहे.', { response }, 201);
});

// GET /api/blood/requests/:id/responses - View donor responses for this SOS request
router.get('/blood/requests/:id/responses', optionalToken, (req, res) => {
  const request = db.findById('bloodRequests', req.params.id);
  if (!request) {
    return sendError(res, 'रक्त मागणी सापडली नाही.', 'NOT_FOUND', 404);
  }

  const isOwner = req.user && (request.submittedBy === req.user.id || (req.user.phone && cleanPhone(request.contact) === cleanPhone(req.user.phone)));
  const isMod = isModerator(req.user);

  if (!isOwner && !isMod) {
    const responses = db.getCollection('bloodResponses')
      .filter(r => r.requestId === req.params.id)
      .map(r => ({
        id: r.id,
        donorName: (r.donorName || 'रक्तदाता').slice(0, 3) + '***',
        bloodGroup: r.bloodGroup,
        etaMinutes: r.etaMinutes,
        createdAt: r.createdAt
      }));
    return sendSuccess(res, 'मदतीसाठी पुढे आलेल्या दात्यांची संख्या', { responses, count: responses.length, isMasked: true });
  }

  const responses = db.getCollection('bloodResponses').filter(r => r.requestId === req.params.id);
  return sendSuccess(res, 'दात्यांचे प्रतिसाद यादी', { responses, count: responses.length, isMasked: false });
});

// GET /api/blood/donors - Directory of available donors
router.get('/blood/donors', (req, res) => {
  const { bloodGroup, city, district, readyEmergency } = req.query;
  let list = db.getCollection('bloodDonors');

  if (bloodGroup && bloodGroup !== 'सर्व') {
    list = list.filter(d => (d.group || d.bloodGroup || '').toLowerCase().includes(bloodGroup.toLowerCase()));
  }
  if (city && city !== 'सर्व') {
    list = list.filter(d => (d.city || '').toLowerCase().includes(city.toLowerCase()));
  }
  if (district && district !== 'सर्व') {
    list = list.filter(d => (d.district || d.city || '').toLowerCase().includes(district.toLowerCase()));
  }
  if (readyEmergency === 'true') {
    list = list.filter(d => d.isReadyEmergency !== false);
  }

  list = list.filter(d => d.isAvailable !== false);

  return sendSuccess(res, 'रक्तदाते यादी प्राप्त झाली', { donors: list, count: list.length });
});

// GET /api/blood/donors/my - Authenticated donor profile
router.get('/blood/donors/my', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userPhone = req.user.phone ? cleanPhone(req.user.phone) : '';
  const allDonors = db.getCollection('bloodDonors');

  const myDonor = allDonors.find(d => 
    d.userId === userId || 
    d.submittedBy === userId || 
    (userPhone && d.phone && cleanPhone(d.phone) === userPhone)
  );

  return sendSuccess(res, 'माझे रक्तदाता प्रोफाइल', { donor: myDonor || null });
});

// POST /api/blood/donors - Register as voluntary donor
router.post('/blood/donors', optionalToken, (req, res) => {
  const { isValid, errors, sanitized } = validateBloodDonor(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'अवैध रक्तदाता माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
  }

  const { name, bloodGroup, phone } = sanitized;
  const { city, district, lastDonated, age, weight, isReadyEmergency } = req.body;

  const newDonor = {
    id: `DON-${Date.now().toString().slice(-4)}`,
    userId: req.user?.id || '',
    submittedBy: req.user?.id || 'GUEST',
    name,
    group: bloodGroup,
    city: sanitize(city) || 'पुणे',
    district: sanitize(district) || sanitize(city) || 'पुणे',
    phone,
    age: Number(age) || 25,
    weight: Number(weight) || 65,
    lastDonated: sanitize(lastDonated) || 'नवीन नोंदणी',
    totalDonations: 1,
    isReadyEmergency: isReadyEmergency !== false,
    isAvailable: true,
    verified: true,
    createdAt: new Date().toISOString()
  };

  db.insert('bloodDonors', newDonor);
  db.addAuditLog('REGISTER_BLOOD_DONOR', req.user?.id || 'GUEST', { donorId: newDonor.id, bloodGroup });

  return sendSuccess(res, '❤️ रक्तदाता नोंदणी यशस्वी झाली! गरजूंसाठी आपले योगदान अमूल्य ठरेल.', { donor: newDonor }, 201);
});

// PATCH /api/blood/donors/:id/availability - Toggle donor availability
router.patch('/blood/donors/:id/availability', authenticateToken, (req, res) => {
  const donor = db.findById('bloodDonors', req.params.id);
  if (!donor) {
    return sendError(res, 'रक्तदाता नोंदणी सापडली नाही.', 'NOT_FOUND', 404);
  }

  const isOwner = donor.userId === req.user.id || 
                  donor.submittedBy === req.user.id || 
                  (req.user.phone && cleanPhone(donor.phone) === cleanPhone(req.user.phone));

  if (!isOwner && !isModerator(req.user)) {
    return sendError(res, 'केवळ संबंधित रक्तदाता किंवा प्रशासक ही स्थिती बदलू शकतात.', 'FORBIDDEN', 403);
  }

  const { isAvailable } = req.body;
  const updated = db.update('bloodDonors', req.params.id, {
    isAvailable: !!isAvailable
  });

  return sendSuccess(res, `रक्तदान उपलब्धता स्थिती '${updated.isAvailable ? 'सक्रिय (Available)' : 'व्यस्त (Not Available)'}' केली.`, { donor: updated });
});


// ==========================================
// 2. MATRIMONY PORTAL (/api/matrimony)
// ==========================================
router.get('/matrimony', authenticateToken, (req, res) => {
  const { gender, caste, city, search, includePending } = req.query;
  let list = db.getCollection('matrimony');

  const isMod = isModerator(req.user);
  if (!isMod || includePending !== 'true') {
    list = list.filter(m => m.status === 'approved' || m.verified === true || (!m.status && m.verified !== false));
  }

  if (gender && gender !== 'सर्व') {
    list = list.filter(m => (m.gender || '').toLowerCase().includes(gender.toLowerCase()));
  }
  if (caste && caste !== 'सर्व') {
    list = list.filter(m => (m.caste || '').toLowerCase().includes(caste.toLowerCase()));
  }
  if (city && city !== 'सर्व') {
    list = list.filter(m => (m.city || '').toLowerCase().includes(city.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(m => 
      (m.name || '').toLowerCase().includes(q) ||
      (m.education || '').toLowerCase().includes(q) ||
      (m.profession || '').toLowerCase().includes(q) ||
      (m.kul || '').toLowerCase().includes(q) ||
      (m.city || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'विवाह परिचय स्थळे प्राप्त झाली', { profiles: list, count: list.length });
});

// GET /api/matrimony/my - Member's own matrimony bio-data + interest requests count
router.get('/matrimony/my', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userPhone = req.user.phone ? cleanPhone(req.user.phone) : '';
  const allProfiles = db.getCollection('matrimony');
  const allInterests = db.getCollection('matrimonyInterests');

  const myProfiles = allProfiles.filter(m => 
    m.memberId === userId || 
    m.submittedBy === userId || 
    (userPhone && m.contact && cleanPhone(m.contact) === userPhone)
  ).map(m => {
    const interestCount = allInterests.filter(i => i.profileId === m.id).length;
    return { ...m, interestsCount: interestCount };
  });

  return sendSuccess(res, 'माझे विवाह बायो-डाटा प्रोफाईल व संपर्क विनंत्या', { profiles: myProfiles, count: myProfiles.length });
});

// GET /api/matrimony/admin/pending - Community Center / Admin review queue
router.get('/matrimony/admin/pending', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'प्रशासक किंवा विवाह समिती परवानगी आवश्यक.', 'FORBIDDEN', 403);
  }

  const allProfiles = db.getCollection('matrimony');
  const pending = allProfiles.filter(m => m.status === 'pending_approval' || (!m.status && m.verified === false));

  return sendSuccess(res, 'प्रलंबित विवाह परिचय बायो-डाटा पडताळणी यादी', { profiles: pending, count: pending.length });
});

router.get('/matrimony/:id', authenticateToken, (req, res) => {
  const profile = db.findById('matrimony', req.params.id);
  if (!profile) {
    return sendError(res, 'विवाह प्रोफाईल सापडले नाही.', 'PROFILE_NOT_FOUND', 404);
  }
  return sendSuccess(res, 'विवाह प्रोफाईल तपशील', { profile });
});

router.post('/matrimony', authenticateToken, (req, res) => {
  const { isValid, errors, sanitized } = validateMatrimony(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'अवैध विवाह प्रोफाइल माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
  }

  const { name, age } = sanitized;
  const { gender, height, education, profession, income, city, kul, gotra, expectations, phone, nativePlace, subcaste } = req.body;

  const isGroom = (gender || '').includes('वर');
  const cleanPhoneNum = phone ? cleanPhone(phone) : (req.user.phone ? cleanPhone(req.user.phone) : '');

  const isMod = isModerator(req.user);
  const status = isMod ? 'approved' : 'pending_approval';
  const verified = isMod ? true : false;

  const newProfile = {
    id: `CM-${isGroom ? 'M' : 'F'}-${Date.now().toString().slice(-4)}`,
    memberId: req.user.id,
    submittedBy: req.user.id,
    name,
    gender: isGroom ? 'वर (Groom)' : 'वधू (Bride)',
    age,
    height: sanitize(height) || "5' 8\"",
    caste: sanitize(subcaste) || '९६ कुळी मराठा',
    kul: sanitize(kul) || 'पाटील / कदम / जाधव',
    gotra: sanitize(gotra) || 'कश्यप',
    nativePlace: sanitize(nativePlace) || 'महाराष्ट्र',
    education: sanitize(education) || 'पदवीधर',
    profession: sanitize(profession) || 'व्यवसायिक / सेवा',
    income: sanitize(income) || 'उत्पन्न खुलासेवार',
    city: sanitize(city) || req.user.district || 'पुणे',
    status,
    verified,
    photo: isGroom ? '👨‍💼' : '👩‍💼',
    expectations: sanitize(expectations) || 'सुशिक्षित, सुसंस्कृत अनुरूप जोडीदार.',
    contact: cleanPhoneNum,
    createdAt: new Date().toISOString()
  };

  db.insert('matrimony', newProfile);
  db.addAuditLog('REGISTER_MATRIMONY', req.user.id, { profileId: newProfile.id, status });

  return sendSuccess(res, isMod ? '💍 विवाह प्रोफाइल यशस्वीरीत्या नोंदवले गेले!' : '💍 विवाह बायो-डाटा नोंदणी यशस्वी! समाज पडताळणीनंतर पोर्टलवर सक्रिय होईल.', { profile: newProfile }, 201);
});

// PATCH /api/matrimony/:id/moderation - Moderate matrimony bio-data
router.patch('/matrimony/:id/moderation', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'केवळ विवाह समिती किंवा प्रशासक पडताळणी करू शकतात.', 'FORBIDDEN', 403);
  }

  const { status, notes, verified } = req.body;
  if (!['approved', 'rejected', 'pending_approval'].includes(status)) {
    return sendError(res, 'अवैध स्थिती मूल्य.', 'INVALID_STATUS', 400);
  }

  const profile = db.findById('matrimony', req.params.id);
  if (!profile) {
    return sendError(res, 'विवाह प्रोफाईल सापडले नाही.', 'NOT_FOUND', 404);
  }

  const updated = db.update('matrimony', req.params.id, {
    status,
    verified: verified !== undefined ? !!verified : (status === 'approved'),
    moderationNotes: sanitize(notes) || '',
    moderatedBy: req.user.id,
    moderatorName: req.user.name,
    moderatedAt: new Date().toISOString()
  });

  db.addAuditLog('MODERATE_MATRIMONY', req.user.id, { profileId: req.params.id, status, verified: updated.verified });

  return sendSuccess(res, `विवाह प्रोफाइल स्थिती '${status === 'approved' ? 'मंजूर' : 'अस्वीकृत'}' केली.`, { profile: updated });
});

// POST /api/matrimony/:id/connect - Send matrimonial interest & contact request
router.post('/matrimony/:id/connect', authenticateToken, (req, res) => {
  const profile = db.findById('matrimony', req.params.id);
  if (!profile) {
    return sendError(res, 'विवाह प्रोफाईल सापडले नाही.', 'NOT_FOUND', 404);
  }

  const { senderName, phone, relation, note } = req.body;
  const cleanedPhone = cleanPhone(phone || req.user.phone || '');

  if (!cleanedPhone || !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const interest = {
    id: `MINQ-${Date.now().toString().slice(-4)}`,
    profileId: profile.id,
    candidateName: profile.name,
    candidateMemberId: profile.memberId,
    senderId: req.user.id,
    senderName: sanitize(senderName) || req.user.name,
    phone: cleanedPhone,
    relation: sanitize(relation) || 'स्वतः / पालक',
    note: sanitize(note) || 'आम्हाला आपल्या बायो-डाटा मध्ये आवड आहे. कृपया संपर्क साधावा.',
    status: 'interest_sent',
    createdAt: new Date().toISOString()
  };

  db.insert('matrimonyInterests', interest);
  db.addAuditLog('SEND_MATRIMONY_INTEREST', req.user.id, { profileId: profile.id, interestId: interest.id });

  return sendSuccess(res, 'विवाह स्थळाशी संपर्क विनंती (Interest Request) यशस्वीपणे पाठवली!', { interest }, 201);
});

// GET /api/matrimony/:id/interests - View interest requests received for profile
router.get('/matrimony/:id/interests', authenticateToken, (req, res) => {
  const profile = db.findById('matrimony', req.params.id);
  if (!profile) {
    return sendError(res, 'विवाह प्रोफाईल सापडले नाही.', 'NOT_FOUND', 404);
  }

  const isOwner = profile.memberId === req.user.id || 
                  profile.submittedBy === req.user.id || 
                  (req.user.phone && profile.contact && cleanPhone(profile.contact) === cleanPhone(req.user.phone));

  if (!isOwner && !isModerator(req.user)) {
    return sendError(res, 'केवळ संबंधित उमेदवार/पालक किंवा प्रशासक संपर्क विनंत्या पाहू शकतात.', 'FORBIDDEN', 403);
  }

  const interests = db.getCollection('matrimonyInterests').filter(i => i.profileId === req.params.id);
  return sendSuccess(res, 'विवाह संपर्क विनंत्या यादी', { interests, count: interests.length });
});


// ==========================================
// 3. WOMEN EMPOWERMENT HELPLINE (/api/women/help)
// ==========================================
router.get('/women/help', authenticateToken, (req, res) => {
  const list = db.getCollection('womenHelp');
  const userHelp = req.user.role === 'admin' ? list : list.filter(h => h.applicantId === req.user.id);
  return sendSuccess(res, 'महिला मदत व मार्गदर्शन विनंत्या', { requests: userHelp });
});

router.post('/women/help', optionalToken, (req, res) => {
  const { name, subject, category, description, phone, preferredTime, urgent } = req.body;
  const cleanSubject = sanitize(subject) || sanitize(name) || 'महिला साहाय्य विनंती';
  const cleanDesc = sanitize(description);

  if (!cleanDesc) {
    return sendError(res, 'कृपया मदतीची सविस्तर माहिती प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  let cleanPhoneNum = phone ? cleanPhone(phone) : (req.user?.phone || '');
  if (cleanPhoneNum && !isValidPhone(cleanPhoneNum)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const item = {
    id: `WHELP-${Date.now().toString().slice(-4)}`,
    applicantId: req.user?.id || 'GUEST',
    applicantName: req.user?.name || sanitize(name) || 'नागरिक',
    subject: cleanSubject,
    category: sanitize(category) || 'कायदेशीर व समुपदेशन',
    description: cleanDesc,
    phone: cleanPhoneNum,
    preferredTime: sanitize(preferredTime) || 'सकाळी ११ ते दुपारी २',
    urgent: Boolean(urgent),
    status: 'समीक्षेत (Under Counselor Review)',
    createdAt: new Date().toISOString()
  };

  db.insert('womenHelp', item);
  db.addAuditLog('WOMEN_HELP_REQUEST', req.user.id, { helpId: item.id });

  return sendSuccess(res, '🌸 महिला मदत व मार्गदर्शनाची विनंती नोंदवली गेली!', { help: item }, 201);
});

// ==========================================
// 4. SOCIAL WORKERS & VOLUNTEERS (/api/social/volunteers)
// ==========================================
router.get('/social/volunteers', (req, res) => {
  const list = db.getCollection('volunteers');
  return sendSuccess(res, 'स्वयंसेवक व समाजसेवक यादी', { volunteers: list, count: list.length });
});

router.post('/social/volunteers', optionalToken, (req, res) => {
  const { name, field, district, phone, bloodGroup, availability } = req.body;
  const cleanName = sanitize(name);
  const cleanedPhone = cleanPhone(phone);

  if (!cleanName || !cleanedPhone) {
    return sendError(res, 'नाव व संपर्क नंबर आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  if (!isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  if (bloodGroup && !isValidBloodGroup(bloodGroup)) {
    return sendError(res, 'कृपया वैध रक्तगट निवडा.', 'INVALID_BLOOD_GROUP', 400);
  }

  const item = {
    id: `VOL-${Date.now().toString().slice(-4)}`,
    name: cleanName,
    field: sanitize(field) || 'आपत्ती व्यवस्थापन व सामाजिक मदत',
    district: sanitize(district) || 'पुणे',
    phone: cleanedPhone,
    bloodGroup: bloodGroup ? sanitize(bloodGroup) : 'O+',
    availability: sanitize(availability) || 'आणीबाणी / वीकेंड',
    createdAt: new Date().toISOString()
  };

  db.insert('volunteers', item);
  return sendSuccess(res, '🤝 स्वयंसेवक नोंदणी यशस्वीरीत्या पूर्ण झाली!', { volunteer: item }, 201);
});

// ==========================================
// 5. POLITICAL GRIEVANCES & PETITIONS (/api/political/grievances)
// ==========================================
router.get('/political/grievances', authenticateToken, (req, res) => {
  const list = db.getCollection('grievances');
  const userGrievances = req.user.role === 'admin' ? list : list.filter(g => g.applicantId === req.user.id);
  return sendSuccess(res, 'मागणी व निवेदन यादी', { grievances: userGrievances, count: userGrievances.length });
});

router.post('/political/grievances', authenticateToken, (req, res) => {
  const { title, targetAuthority, district, description, phone } = req.body;
  const cleanTitle = sanitize(title);
  const cleanDesc = sanitize(description);

  if (!cleanTitle || !cleanDesc) {
    return sendError(res, 'कृपया निवेदनाचे शीर्षक व सविस्तर माहिती प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const cleanedPhone = phone ? cleanPhone(phone) : (req.user.phone || '');
  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const item = {
    id: `GRV-${Date.now().toString().slice(-4)}`,
    applicantId: req.user.id,
    applicantName: req.user.name,
    title: cleanTitle,
    targetAuthority: sanitize(targetAuthority) || 'जिल्हाधिकारी / लोकप्रतिनिधी',
    district: sanitize(district) || req.user.district || 'पुणे',
    description: cleanDesc,
    phone: cleanedPhone,
    status: 'सादर केले (Forwarded to Cell)',
    createdAt: new Date().toISOString()
  };

  db.insert('grievances', item);
  db.addAuditLog('SUBMIT_GRIEVANCE', req.user.id, { grievanceId: item.id, title: cleanTitle });

  return sendSuccess(res, '📜 मागणी/निवेदन यशस्वीरीत्या सादर केले गेले!', { grievance: item }, 201);
});

export default router;
