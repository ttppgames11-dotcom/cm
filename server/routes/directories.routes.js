import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// ==========================================
// 1. DOCTORS DIRECTORY (/api/doctors)
// ==========================================
router.get('/doctors', (req, res) => {
  const { specialty, city, search } = req.query;
  let list = db.getCollection('doctors');

  if (specialty && specialty !== 'सर्व') {
    list = list.filter(d => (d.specialty || '').includes(specialty) || (d.category || '').includes(specialty));
  }
  if (city && city !== 'सर्व') {
    list = list.filter(d => (d.city || '').includes(city));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(d => 
      (d.name || '').toLowerCase().includes(q) ||
      (d.hospital || '').toLowerCase().includes(q) ||
      (d.specialty || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'डॉक्टर्स यादी प्राप्त झाली', { doctors: list, count: list.length });
});

router.post('/doctors', optionalToken, (req, res) => {
  const { name, specialty, hospital, city, phone, consultationFee, degree } = req.body;
  if (!name || !phone) {
    return sendError(res, 'कृपया नाव आणि फोन नंबर प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const newDoc = {
    id: `DOC-${Date.now().toString().slice(-4)}`,
    name,
    specialty: specialty || 'सामान्य चिकित्सक',
    degree: degree || 'M.B.B.S.',
    category: specialty || 'सामान्य',
    hospital: hospital || 'सह्याद्री हॉस्पिटल',
    city: city || 'पुणे',
    phone,
    consultationFee: consultationFee || '₹५००',
    timing: req.body.timing || 'स. १० ते सायं. ६',
    experience: req.body.experience || '१० वर्षे अनुभव',
    rating: '5.0 ★ (नवीन नोंदणी)',
    icon: '🩺',
    verified: true,
    createdAt: new Date().toISOString()
  };

  db.insert('doctors', newDoc);
  db.addAuditLog('REGISTER_DOCTOR', req.user?.id || 'GUEST', { name, phone });

  return sendSuccess(res, 'डॉक्टर प्रोफाइल यशस्वीरीत्या जोडले गेले!', { doctor: newDoc }, 201);
});

// ==========================================
// 2. ARTISTS DIRECTORY (/api/artists)
// ==========================================
router.get('/artists', (req, res) => {
  const list = db.getCollection('artists');
  return sendSuccess(res, 'कलाकार व शाहिरी परंपरा यादी', { artists: list, count: list.length });
});

router.post('/artists', optionalToken, (req, res) => {
  const { name, field, awards, city, phone } = req.body;
  if (!name) {
    return sendError(res, 'कलाकाराचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `ART-${Date.now().toString().slice(-4)}`,
    name,
    field: field || 'नाट्य व चित्रपट / शाहिरी',
    awards: awards || 'महाराष्ट्र राज्य गौरव',
    city: city || 'पुणे/मुंबई',
    phone: phone || '',
    photo: '🎭',
    createdAt: new Date().toISOString()
  };

  db.insert('artists', item);
  return sendSuccess(res, 'कलाकार प्रोफाइल यशस्वीरीत्या जोडले गेले!', { artist: item }, 201);
});

// ==========================================
// 3. GOVERNMENT OFFICERS (/api/officers)
// ==========================================
router.get('/officers', (req, res) => {
  const list = db.getCollection('officers');
  return sendSuccess(res, 'प्रशासकीय अधिकारी यादी', { officers: list, count: list.length });
});

router.post('/officers', optionalToken, (req, res) => {
  const { name, designation, department, batch, postingCity } = req.body;
  if (!name || !designation) {
    return sendError(res, 'नाव व पद आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `OFF-${Date.now().toString().slice(-4)}`,
    name,
    designation,
    department: department || 'सामान्य प्रशासन',
    batch: batch || 'IAS / IPS / MPSC',
    postingCity: postingCity || 'महाराष्ट्र शासन',
    photo: '🏛️',
    createdAt: new Date().toISOString()
  };

  db.insert('officers', item);
  return sendSuccess(res, 'अधिकारी प्रोफाइल यशस्वीरीत्या नोंदवले गेले!', { officer: item }, 201);
});

// ==========================================
// 4. SPEAKERS & BOOKINGS (/api/speakers)
// ==========================================
router.get('/speakers', (req, res) => {
  const list = db.getCollection('speakers');
  return sendSuccess(res, 'प्रबोधनकार व वक्ते यादी', { speakers: list, count: list.length });
});

router.post('/speakers', optionalToken, (req, res) => {
  const { name, expertise, topics, city, contact } = req.body;
  if (!name) {
    return sendError(res, 'नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `SPK-${Date.now().toString().slice(-4)}`,
    name,
    expertise: expertise || 'शिवचरित्र व मराठा इतिहास',
    topics: topics || 'शिवकालीन व्यवस्थापन व स्वराज्य प्रेरणा',
    city: city || 'महाराष्ट्र',
    contact: contact || '',
    photo: '🎤',
    createdAt: new Date().toISOString()
  };

  db.insert('speakers', item);
  return sendSuccess(res, 'वक्ते प्रोफाइल जोडले गेले!', { speaker: item }, 201);
});

router.post('/speakers/book', authenticateToken, (req, res) => {
  const { speakerId, speakerName, eventDate, eventTopic, venue, organizerPhone } = req.body;
  if (!speakerName || !eventDate || !organizerPhone) {
    return sendError(res, 'कृपया वक्त्याचे नाव, तारीख व संपर्क प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const booking = {
    id: `SBK-${Date.now().toString().slice(-4)}`,
    speakerId: speakerId || '',
    speakerName,
    requesterId: req.user.id,
    requesterName: req.user.name,
    eventDate,
    eventTopic: eventTopic || 'शिवजयंती व्याख्यान',
    venue: venue || 'महाराष्ट्र',
    organizerPhone,
    status: 'प्रलंबित (Pending Approval)',
    createdAt: new Date().toISOString()
  };

  db.insert('speakerBookings', booking);
  db.addAuditLog('BOOK_SPEAKER', req.user.id, { speakerName, eventDate });

  return sendSuccess(res, 'व्याख्यान आमंत्रण विनंती सादर झाली!', { booking }, 201);
});

// ==========================================
// 5. ORGANIZATIONS (/api/organizations)
// ==========================================
router.get('/organizations', (req, res) => {
  const list = db.getCollection('organizations');
  return sendSuccess(res, 'मराठा संस्था व संघटना यादी', { organizations: list, count: list.length });
});

router.post('/organizations', optionalToken, (req, res) => {
  const { name, regNo, president, city, district, contact, workScope } = req.body;
  if (!name) {
    return sendError(res, 'संस्थेचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `ORG-${Date.now().toString().slice(-4)}`,
    name,
    regNo: regNo || 'संस्था नोंदणी क्र.',
    president: president || 'मा. अध्यक्ष',
    city: city || 'पुणे',
    district: district || 'पुणे',
    contact: contact || '',
    workScope: workScope || 'सामाजिक, शैक्षणिक व सांस्कृतिक',
    logo: '🚩',
    createdAt: new Date().toISOString()
  };

  db.insert('organizations', item);
  return sendSuccess(res, 'संस्था नोंदणी यशस्वी झाली!', { organization: item }, 201);
});

// ==========================================
// 6. BUILDERS & REAL ESTATE (/api/builders)
// ==========================================
router.get('/builders', (req, res) => {
  const list = db.getCollection('builders');
  return sendSuccess(res, 'बिल्डर प्रकल्प यादी', { builders: list, count: list.length });
});

router.post('/builders', optionalToken, (req, res) => {
  const { projectName, developer, location, configuration, priceRange, phone } = req.body;
  if (!projectName || !developer) {
    return sendError(res, 'प्रकल्प व विकासकाचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `BLD-${Date.now().toString().slice(-4)}`,
    projectName,
    developer,
    location: location || 'पुणे / मुंबई',
    configuration: configuration || '2 & 3 BHK Premium Homes',
    priceRange: priceRange || '₹६५ लाख ते ₹१.५ कोटी',
    phone: phone || '',
    reraApproved: true,
    discountForMembers: 'मराठा महासंघ सदस्यांसाठी विशेष ३% सवलत',
    createdAt: new Date().toISOString()
  };

  db.insert('builders', item);
  return sendSuccess(res, 'बिल्डर प्रकल्प यशस्वीरीत्या नोंदवला गेला!', { project: item }, 201);
});

// ==========================================
// 7. MANUFACTURERS (/api/manufacturers)
// ==========================================
router.get('/manufacturers', (req, res) => {
  const list = db.getCollection('manufacturers');
  return sendSuccess(res, 'उद्योग व मॅन्युफॅक्चरर्स यादी', { manufacturers: list, count: list.length });
});

router.post('/manufacturers', optionalToken, (req, res) => {
  const { companyName, industry, products, district, contact, turnover } = req.body;
  if (!companyName) {
    return sendError(res, 'कंपनीचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `MFG-${Date.now().toString().slice(-4)}`,
    companyName,
    industry: industry || 'इंजिनिअरिंग / ऑटोमोबाईल',
    products: products || 'पार्ट्स व मेकॅनिकल उपकरणे',
    district: district || 'चाकण, पुणे',
    contact: contact || '',
    turnover: turnover || '₹१० कोटी+',
    createdAt: new Date().toISOString()
  };

  db.insert('manufacturers', item);
  return sendSuccess(res, 'उत्पादक उद्योग यशस्वीरीत्या जोडला गेला!', { manufacturer: item }, 201);
});

// ==========================================
// 8. DAIRY COOPERATIVES (/api/dairy)
// ==========================================
router.get('/dairy', (req, res) => {
  const list = db.getCollection('dairy');
  return sendSuccess(res, 'मराठा डेअरी व दुग्ध व्यवसाय केंद्र यादी', { dairy: list, count: list.length });
});

router.post('/dairy', optionalToken, (req, res) => {
  const { dairyName, centerHead, dailyCollection, district, milkRateCow, milkRateBuffalo, contact } = req.body;
  if (!dairyName) {
    return sendError(res, 'डेअरीचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `DRY-${Date.now().toString().slice(-4)}`,
    dairyName,
    centerHead: centerHead || 'केंद्र प्रमुख',
    dailyCollection: dailyCollection || '२,५०० लिटर/दिवस',
    district: district || 'कोल्हापूर/सांगली',
    milkRateCow: milkRateCow || '₹३६ / लिटर',
    milkRateBuffalo: milkRateBuffalo || '₹५४ / लिटर',
    contact: contact || '',
    createdAt: new Date().toISOString()
  };

  db.insert('dairy', item);
  return sendSuccess(res, 'डेअरी केंद्र जोडले गेले!', { dairyCenter: item }, 201);
});

// ==========================================
// 9. MARATHA BANK & LOANS (/api/bank/loans)
// ==========================================
router.get('/bank/loans', authenticateToken, (req, res) => {
  const list = db.getCollection('bankLoans');
  const userLoans = req.user.role === 'admin' ? list : list.filter(l => l.applicantId === req.user.id);

  return sendSuccess(res, 'कर्ज योजना व अर्ज स्थिती', {
    schemes: [
      { id: 'ANNABHAU-01', name: 'अण्णासाहेब पाटील महामंडळ बिनव्याजी कर्ज योजना', maxAmount: '₹१५,००,०००', interestSubsidy: '१२% व्याज परतावा', category: 'स्वयंरोजगार' },
      { id: 'AGRI-02', name: 'कृषी व प्रक्रिया उद्योग विस्तार योजना', maxAmount: '₹५०,००,०००', interestSubsidy: 'विशेष सवलत', category: 'कृषी उद्योग' },
      { id: 'STARTUP-03', name: 'मराठा युवा स्टार्ट-अप सीड कॅपिटल', maxAmount: '₹१०,००,०००', interestSubsidy: 'सुलभ हप्ते', category: 'स्टार्टअप' }
    ],
    myApplications: userLoans
  });
});

router.post('/bank/loans', authenticateToken, (req, res) => {
  const { schemeName, loanAmount, purpose, businessName, annualIncome, contact } = req.body;
  if (!loanAmount || !purpose) {
    return sendError(res, 'कृपया कर्जाची रक्कम व उद्देश प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `LN-${Date.now().toString().slice(-4)}`,
    applicantId: req.user.id,
    applicantName: req.user.name,
    schemeName: schemeName || 'अण्णासाहेब पाटील महामंडळ बिनव्याजी कर्ज योजना',
    loanAmount: loanAmount,
    purpose,
    businessName: businessName || 'नवीन व्यवसाय',
    annualIncome: annualIncome || '₹५ लाख',
    contact: contact || req.user.phone || '',
    status: 'कागदपत्र पडताळणी अंतर्गत (In Review)',
    createdAt: new Date().toISOString()
  };

  db.insert('bankLoans', item);
  db.addAuditLog('APPLY_LOAN', req.user.id, { loanId: item.id, amount: loanAmount });

  return sendSuccess(res, 'कर्ज अर्ज यशस्वीरीत्या सादर केला गेला!', { loanApplication: item }, 201);
});

export default router;
