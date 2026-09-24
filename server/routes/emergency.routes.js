import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// ==========================================
// 1. EMERGENCY BLOOD PORTAL
// ==========================================
router.get('/blood/requests', (req, res) => {
  const list = db.getCollection('bloodRequests');
  return sendSuccess(res, 'तातडीची रक्त मागणी यादी', { requests: list, count: list.length });
});

router.post('/blood/requests', optionalToken, (req, res) => {
  const { patient, hospital, bloodGroup, units, urgency, contact, city } = req.body;
  if (!patient || !hospital || !bloodGroup || !contact) {
    return sendError(res, 'कृपया रुग्ण, रुग्णालय, रक्तगट आणि संपर्क क्रमांक प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const newReq = {
    id: `REQ-${Date.now().toString().slice(-4)}`,
    patient,
    hospital,
    bloodGroup,
    units: units || 1,
    urgency: urgency || 'तात्काळ (Emergency)',
    city: city || 'पुणे/महाराष्ट्र',
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
  const { name, bloodGroup, city, phone, lastDonated } = req.body;
  if (!name || !phone) {
    return sendError(res, 'नाव आणि फोन नंबर आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const newDonor = {
    id: `DON-${Date.now().toString().slice(-4)}`,
    name,
    group: bloodGroup || 'O+',
    city: city || 'पुणे',
    phone,
    lastDonated: lastDonated || 'नवीन नोंदणी',
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
  const { name, gender, age, height, education, profession, income, city, kul, gotra, expectations, phone } = req.body;
  if (!name || !gender || !age) {
    return sendError(res, 'नाव, लिंग आणि वय आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const isGroom = (gender || '').includes('वर');
  const newProfile = {
    id: `CM-${isGroom ? 'M' : 'F'}-${Date.now().toString().slice(-4)}`,
    memberId: req.user.id,
    name,
    gender: isGroom ? 'वर (Groom)' : 'वधू (Bride)',
    age: Number(age) || 26,
    height: height || "5' 8\"",
    caste: '९६ कुळी मराठा',
    kul: kul || 'पाटील / कदम / जाधव',
    gotra: gotra || 'कश्यप',
    education: education || 'पदवीधर',
    profession: profession || 'व्यवसायिक / सेवा',
    income: income || 'उत्पन्न खुलासेवार',
    city: city || req.user.district || 'पुणे',
    verified: true,
    photo: isGroom ? '👨‍💼' : '👩‍💼',
    expectations: expectations || 'सुशिक्षित, सुसंस्कृत अनुरूप जोडीदार.',
    contact: phone || req.user.phone || '',
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

router.post('/women/help', authenticateToken, (req, res) => {
  const { subject, category, description, phone, preferredTime, urgent } = req.body;
  if (!subject || !description) {
    return sendError(res, 'कृपया विषय व माहिती प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `WHELP-${Date.now().toString().slice(-4)}`,
    applicantId: req.user.id,
    applicantName: req.user.name,
    subject,
    category: category || 'कायदेशीर व समुपदेशन',
    description,
    phone: phone || req.user.phone || '',
    preferredTime: preferredTime || 'सकाळी ११ ते दुपारी २',
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
  if (!name || !phone) {
    return sendError(res, 'नाव व संपर्क नंबर आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `VOL-${Date.now().toString().slice(-4)}`,
    name,
    field: field || 'आपत्ती व्यवस्थापन व सामाजिक मदत',
    district: district || 'पुणे',
    phone,
    bloodGroup: bloodGroup || 'O+',
    availability: availability || 'आणीबाणी / वीकेंड',
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
  if (!title || !description) {
    return sendError(res, 'कृपया निवेदनाचे शीर्षक व सविस्तर माहिती प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `GRV-${Date.now().toString().slice(-4)}`,
    applicantId: req.user.id,
    applicantName: req.user.name,
    title,
    targetAuthority: targetAuthority || 'जिल्हाधिकारी / लोकप्रतिनिधी',
    district: district || req.user.district || 'पुणे',
    description,
    phone: phone || req.user.phone || '',
    status: 'सादर केले (Forwarded to Cell)',
    createdAt: new Date().toISOString()
  };

  db.insert('grievances', item);
  db.addAuditLog('SUBMIT_GRIEVANCE', req.user.id, { grievanceId: item.id, title });

  return sendSuccess(res, '📜 मागणी/निवेदन यशस्वीरीत्या सादर केले गेले!', { grievance: item }, 201);
});

export default router;
