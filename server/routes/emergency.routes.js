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

// ==========================================
// 1. EMERGENCY BLOOD PORTAL
// ==========================================
router.get('/blood/requests', (req, res) => {
  const list = db.getCollection('bloodRequests');
  return sendSuccess(res, 'तातडीची रक्त मागणी यादी', { requests: list, count: list.length });
});

router.post('/blood/requests', optionalToken, (req, res) => {
  const { isValid, errors, sanitized } = validateBloodRequest(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'अवैध रक्त मागणी माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
  }

  const { patient, hospital, bloodGroup, contact, units } = sanitized;
  const { urgency, city } = req.body;

  const newReq = {
    id: `REQ-${Date.now().toString().slice(-4)}`,
    patient,
    hospital,
    bloodGroup,
    units: units || 1,
    urgency: sanitize(urgency) || 'तात्काळ (Emergency)',
    city: sanitize(city) || 'पुणे/महाराष्ट्र',
    contact,
    time: 'आत्ताच',
    createdAt: new Date().toISOString()
  };

  db.insert('bloodRequests', newReq);
  db.addAuditLog('SOS_BLOOD_REQUEST', req.user?.id || 'ANONYMOUS', { bloodGroup, hospital });

  return sendSuccess(res, '🚨 तातडीची रक्त मागणी प्रसारित करण्यात आली!', { request: newReq }, 201);
});

router.get('/blood/donors', (req, res) => {
  const { bloodGroup, city } = req.query;
  let list = db.getCollection('bloodDonors');

  if (bloodGroup && bloodGroup !== 'सर्व') {
    list = list.filter(d => (d.group || d.bloodGroup || '').toLowerCase().includes(bloodGroup.toLowerCase()));
  }
  if (city && city !== 'सर्व') {
    list = list.filter(d => (d.city || '').toLowerCase().includes(city.toLowerCase()));
  }

  return sendSuccess(res, 'रक्तदाते यादी प्राप्त झाली', { donors: list, count: list.length });
});

router.post('/blood/donors', optionalToken, (req, res) => {
  const { isValid, errors, sanitized } = validateBloodDonor(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'अवैध रक्तदाता माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
  }

  const { name, bloodGroup, phone } = sanitized;
  const { city, lastDonated } = req.body;

  const newDonor = {
    id: `DON-${Date.now().toString().slice(-4)}`,
    name,
    group: bloodGroup,
    city: sanitize(city) || 'पुणे',
    phone,
    lastDonated: sanitize(lastDonated) || 'नवीन नोंदणी',
    totalDonations: 1,
    verified: true,
    createdAt: new Date().toISOString()
  };

  db.insert('bloodDonors', newDonor);
  db.addAuditLog('REGISTER_BLOOD_DONOR', req.user?.id || 'GUEST', { bloodGroup });

  return sendSuccess(res, '❤️ रक्तदाता नोंदणी यशस्वी झाली!', { donor: newDonor }, 201);
});

// ==========================================
// 2. MATRIMONY PORTAL (/api/matrimony)
// ==========================================
router.get('/matrimony', authenticateToken, (req, res) => {
  const { gender, caste, city, minAge, maxAge } = req.query;
  let list = db.getCollection('matrimony');

  if (gender && gender !== 'सर्व') {
    list = list.filter(m => (m.gender || '').toLowerCase().includes(gender.toLowerCase()));
  }
  if (caste && caste !== 'सर्व') {
    list = list.filter(m => (m.caste || '').toLowerCase().includes(caste.toLowerCase()));
  }
  if (city && city !== 'सर्व') {
    list = list.filter(m => (m.city || '').toLowerCase().includes(city.toLowerCase()));
  }

  return sendSuccess(res, 'विवाह परिचय स्थळे प्राप्त झाली', { profiles: list, count: list.length });
});

router.post('/matrimony', authenticateToken, (req, res) => {
  const { isValid, errors, sanitized } = validateMatrimony(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'अवैध विवाह प्रोफाइल माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
  }

  const { name, age } = sanitized;
  const { gender, height, education, profession, income, city, kul, gotra, expectations, phone } = req.body;

  const isGroom = (gender || '').includes('वर');
  const cleanPhoneNum = phone ? cleanPhone(phone) : (req.user.phone ? cleanPhone(req.user.phone) : '');

  const newProfile = {
    id: `CM-${isGroom ? 'M' : 'F'}-${Date.now().toString().slice(-4)}`,
    memberId: req.user.id,
    name,
    gender: isGroom ? 'वर (Groom)' : 'वधू (Bride)',
    age,
    height: sanitize(height) || "5' 8\"",
    caste: '९६ कुळी मराठा',
    kul: sanitize(kul) || 'पाटील / कदम / जाधव',
    gotra: sanitize(gotra) || 'कश्यप',
    education: sanitize(education) || 'पदवीधर',
    profession: sanitize(profession) || 'व्यवसायिक / सेवा',
    income: sanitize(income) || 'उत्पन्न खुलासेवार',
    city: sanitize(city) || req.user.district || 'पुणे',
    verified: true,
    photo: isGroom ? '👨‍💼' : '👩‍💼',
    expectations: sanitize(expectations) || 'सुशिक्षित, सुसंस्कृत अनुरूप जोडीदार.',
    contact: cleanPhoneNum,
    createdAt: new Date().toISOString()
  };

  db.insert('matrimony', newProfile);
  db.addAuditLog('REGISTER_MATRIMONY', req.user.id, { profileId: newProfile.id });

  return sendSuccess(res, '💍 विवाह प्रोफाइल यशस्वीरीत्या नोंदवले गेले!', { profile: newProfile }, 201);
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
