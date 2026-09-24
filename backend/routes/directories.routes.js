import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { 
  sanitize, 
  isValidPhone, 
  cleanPhone, 
  isPositiveNumber, 
  validateLoan, 
  validateSpeakerBooking 
} from '../utils/validator.js';

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
  const cleanName = sanitize(name);
  const cleanedPhone = cleanPhone(phone);

  if (!cleanName || !cleanedPhone) {
    return sendError(res, 'कृपया नाव आणि फोन नंबर प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  if (!isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const newDoc = {
    id: `DOC-${Date.now().toString().slice(-4)}`,
    name: cleanName,
    specialty: sanitize(specialty) || 'सामान्य चिकित्सक',
    degree: sanitize(degree) || 'M.B.B.S.',
    category: sanitize(specialty) || 'सामान्य',
    hospital: sanitize(hospital) || 'सह्याद्री हॉस्पिटल',
    city: sanitize(city) || 'पुणे',
    phone: cleanedPhone,
    consultationFee: sanitize(consultationFee) || '₹५००',
    timing: sanitize(req.body.timing) || 'स. १० ते सायं. ६',
    experience: sanitize(req.body.experience) || '१० वर्षे अनुभव',
    rating: '5.0 ★ (नवीन नोंदणी)',
    icon: '🩺',
    verified: true,
    createdAt: new Date().toISOString()
  };

  db.insert('doctors', newDoc);
  db.addAuditLog('REGISTER_DOCTOR', req.user?.id || 'GUEST', { name: cleanName, phone: cleanedPhone });

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
  const cleanName = sanitize(name);

  if (!cleanName) {
    return sendError(res, 'कलाकाराचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const cleanedPhone = phone ? cleanPhone(phone) : '';
  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const item = {
    id: `ART-${Date.now().toString().slice(-4)}`,
    name: cleanName,
    field: sanitize(field) || 'नाट्य व चित्रपट / शाहिरी',
    awards: sanitize(awards) || 'महाराष्ट्र राज्य गौरव',
    city: sanitize(city) || 'पुणे/मुंबई',
    phone: cleanedPhone,
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
  const cleanName = sanitize(name);
  const cleanDesignation = sanitize(designation);

  if (!cleanName || !cleanDesignation) {
    return sendError(res, 'नाव व पद आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `OFF-${Date.now().toString().slice(-4)}`,
    name: cleanName,
    designation: cleanDesignation,
    department: sanitize(department) || 'सामान्य प्रशासन',
    batch: sanitize(batch) || 'IAS / IPS / MPSC',
    postingCity: sanitize(postingCity) || 'महाराष्ट्र शासन',
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
  const cleanName = sanitize(name);

  if (!cleanName) {
    return sendError(res, 'नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const cleanedPhone = contact ? cleanPhone(contact) : '';
  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const item = {
    id: `SPK-${Date.now().toString().slice(-4)}`,
    name: cleanName,
    expertise: sanitize(expertise) || 'शिवचरित्र व मराठा इतिहास',
    topics: sanitize(topics) || 'शिवकालीन व्यवस्थापन व स्वराज्य प्रेरणा',
    city: sanitize(city) || 'महाराष्ट्र',
    contact: cleanedPhone,
    photo: '🎤',
    createdAt: new Date().toISOString()
  };

  db.insert('speakers', item);
  return sendSuccess(res, 'वक्ते प्रोफाइल जोडले गेले!', { speaker: item }, 201);
});

router.post('/speakers/book', authenticateToken, (req, res) => {
  const { isValid, errors, sanitized } = validateSpeakerBooking(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'अवैध व्याख्यान बुकिंग माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
  }

  const { speakerName, eventDate, organizerPhone } = sanitized;
  const { speakerId, eventTopic, venue } = req.body;

  const booking = {
    id: `SBK-${Date.now().toString().slice(-4)}`,
    speakerId: sanitize(speakerId) || '',
    speakerName,
    requesterId: req.user.id,
    requesterName: req.user.name,
    eventDate,
    eventTopic: sanitize(eventTopic) || 'शिवजयंती व्याख्यान',
    venue: sanitize(venue) || 'महाराष्ट्र',
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
  const cleanName = sanitize(name);

  if (!cleanName) {
    return sendError(res, 'संस्थेचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const cleanedPhone = contact ? cleanPhone(contact) : '';
  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया संस्थेचा वैध संपर्क क्रमांक प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const item = {
    id: `ORG-${Date.now().toString().slice(-4)}`,
    name: cleanName,
    regNo: sanitize(regNo) || 'संस्था नोंदणी क्र.',
    president: sanitize(president) || 'मा. अध्यक्ष',
    city: sanitize(city) || 'पुणे',
    district: sanitize(district) || 'पुणे',
    contact: cleanedPhone,
    workScope: sanitize(workScope) || 'सामाजिक, शैक्षणिक व सांस्कृतिक',
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
  const cleanProj = sanitize(projectName);
  const cleanDev = sanitize(developer);

  if (!cleanProj || !cleanDev) {
    return sendError(res, 'प्रकल्प व विकासकाचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const cleanedPhone = phone ? cleanPhone(phone) : '';
  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const item = {
    id: `BLD-${Date.now().toString().slice(-4)}`,
    projectName: cleanProj,
    developer: cleanDev,
    location: sanitize(location) || 'पुणे / मुंबई',
    configuration: sanitize(configuration) || '2 & 3 BHK Premium Homes',
    priceRange: sanitize(priceRange) || '₹६५ लाख ते ₹१.५ कोटी',
    phone: cleanedPhone,
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
  const cleanCompany = sanitize(companyName);

  if (!cleanCompany) {
    return sendError(res, 'कंपनीचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const cleanedPhone = contact ? cleanPhone(contact) : '';
  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const item = {
    id: `MFG-${Date.now().toString().slice(-4)}`,
    companyName: cleanCompany,
    industry: sanitize(industry) || 'इंजिनिअरिंग / ऑटोमोबाईल',
    products: sanitize(products) || 'पार्ट्स व मेकॅनिकल उपकरणे',
    district: sanitize(district) || 'चाकण, पुणे',
    contact: cleanedPhone,
    turnover: sanitize(turnover) || '₹१० कोटी+',
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
  const cleanDairy = sanitize(dairyName);

  if (!cleanDairy) {
    return sendError(res, 'डेअरीचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const cleanedPhone = contact ? cleanPhone(contact) : '';
  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const item = {
    id: `DRY-${Date.now().toString().slice(-4)}`,
    dairyName: cleanDairy,
    centerHead: sanitize(centerHead) || 'केंद्र प्रमुख',
    dailyCollection: sanitize(dailyCollection) || '२,५०० लिटर/दिवस',
    district: sanitize(district) || 'कोल्हापूर/सांगली',
    milkRateCow: sanitize(milkRateCow) || '₹३६ / लिटर',
    milkRateBuffalo: sanitize(milkRateBuffalo) || '₹५४ / लिटर',
    contact: cleanedPhone,
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
  const { isValid, errors, sanitized } = validateLoan(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'अवैध कर्ज अर्ज माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
  }

  const { loanAmount, purpose } = sanitized;
  const { schemeName, businessName, annualIncome, contact } = req.body;

  const cleanedPhone = contact ? cleanPhone(contact) : (req.user.phone ? cleanPhone(req.user.phone) : '');
  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const item = {
    id: `LN-${Date.now().toString().slice(-4)}`,
    applicantId: req.user.id,
    applicantName: req.user.name,
    schemeName: sanitize(schemeName) || 'अण्णासाहेब पाटील महामंडळ बिनव्याजी कर्ज योजना',
    loanAmount,
    purpose,
    businessName: sanitize(businessName) || 'नवीन व्यवसाय',
    annualIncome: sanitize(annualIncome) || '₹५ लाख',
    contact: cleanedPhone,
    status: 'कागदपत्र पडताळणी अंतर्गत (In Review)',
    createdAt: new Date().toISOString()
  };

  db.insert('bankLoans', item);
  db.addAuditLog('APPLY_LOAN', req.user.id, { loanId: item.id, amount: loanAmount });

  return sendSuccess(res, 'कर्ज अर्ज यशस्वीरीत्या सादर केला गेला!', { loanApplication: item }, 201);
});

// ==========================================
// 10. HOTELS & HOSPITALITY DIRECTORY (/api/hotels)
// ==========================================
router.get('/hotels', (req, res) => {
  const { city, district, search } = req.query;
  let list = db.getCollection('hotels');

  if (city && city !== 'सर्व') {
    list = list.filter(h => (h.city || '').includes(city));
  }
  if (district && district !== 'सर्व') {
    list = list.filter(h => (h.district || '').includes(district));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(h => 
      (h.name || '').toLowerCase().includes(q) ||
      (h.city || '').toLowerCase().includes(q) ||
      (h.category || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'हॉटेल्स व लॉजिंग यादी प्राप्त झाली', { hotels: list, count: list.length });
});

router.get('/hotels/:id', (req, res) => {
  const hotel = db.findById('hotels', req.params.id);
  if (!hotel) {
    return sendError(res, 'हॉटेल सापडले नाही.', 'HOTEL_NOT_FOUND', 404);
  }
  return sendSuccess(res, 'हॉटेल तपशील', { hotel });
});

router.post('/hotels', optionalToken, (req, res) => {
  const { name, city, district, category, address, phone, website, rooms_count, price_range, star_rating } = req.body;
  const cleanName = sanitize(name);
  const cleanedPhone = cleanPhone(phone);

  if (!cleanName || !cleanedPhone) {
    return sendError(res, 'कृपया हॉटेलचे नाव आणि संपर्क नंबर प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const newHotel = {
    id: `HTL-${Date.now().toString().slice(-4)}`,
    name: cleanName,
    city: sanitize(city) || 'पुणे',
    district: sanitize(district) || 'पुणे',
    category: sanitize(category) || 'हॉटेल',
    star_rating: Number(star_rating) || 4.2,
    address: sanitize(address) || 'महाराष्ट्र',
    phone: cleanedPhone,
    website: sanitize(website) || '',
    rooms_count: Number(rooms_count) || 12,
    amenities: req.body.amenities || ['वायफाय', 'पार्किंग', 'भोजनालय'],
    price_range: sanitize(price_range) || '₹२,००० - ₹४,०००',
    photo: '🏨',
    verified: true,
    created_at: new Date().toISOString()
  };

  db.insert('hotels', newHotel);
  db.addAuditLog('ADD_HOTEL', req.user?.id || 'GUEST', { hotelId: newHotel.id, name: cleanName });

  return sendSuccess(res, 'नवीन हॉटेल यशस्वीरीत्या जोडण्यात आले!', { hotel: newHotel }, 201);
});

// ==========================================
// 11. INFORMATION & HERITAGE ARTICLES (/api/information)
// ==========================================
router.get('/information', (req, res) => {
  const { category, search } = req.query;
  let list = db.getCollection('information');

  if (category && category !== 'सर्व') {
    list = list.filter(i => (i.category || '').includes(category));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(i => 
      (i.title || '').toLowerCase().includes(q) ||
      (i.summary || '').toLowerCase().includes(q) ||
      (i.author || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'माहिती व ज्ञानकोश लेख यादी प्राप्त झाली', { information: list, count: list.length });
});

router.get('/information/:id', (req, res) => {
  const item = db.findById('information', req.params.id);
  if (!item) {
    return sendError(res, 'माहिती लेख सापडला नाही.', 'INFO_NOT_FOUND', 404);
  }
  return sendSuccess(res, 'माहिती लेख तपशील', { article: item });
});

router.post('/information', optionalToken, (req, res) => {
  const { title, category, author, summary, content, tags, image_url } = req.body;
  const cleanTitle = sanitize(title);

  if (!cleanTitle) {
    return sendError(res, 'कृपया लेखाचे शीर्षक प्रविष्ट करा.', 'MISSING_TITLE', 400);
  }

  const newArticle = {
    id: `INFO-${Date.now().toString().slice(-4)}`,
    title: cleanTitle,
    category: sanitize(category) || 'मराठा वारसा व इतिहास',
    author: sanitize(author) || req.user?.name || 'संपादकीय मंडळ',
    summary: sanitize(summary) || '',
    content: sanitize(content) || '',
    tags: Array.isArray(tags) ? tags : ['माहिती', 'इतिहास'],
    image_url: sanitize(image_url) || '/assets/images/real-raigad-panoramic.jpg',
    featured: req.body.featured ? 1 : 0,
    created_at: new Date().toISOString()
  };

  db.insert('information', newArticle);
  db.addAuditLog('ADD_INFORMATION', req.user?.id || 'GUEST', { articleId: newArticle.id, title: cleanTitle });

  return sendSuccess(res, 'नवीन माहिती लेख यशस्वीरीत्या जोडण्यात आला!', { article: newArticle }, 201);
});

export default router;
