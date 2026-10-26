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
import { runQuery, all, get } from '../../database/database.js';

const router = Router();

const MODERATOR_ROLES = ['superadmin', 'admin', 'ceo', 'center_manager', 'center_admin', 'district_admin', 'taluka_admin'];
const isModerator = (user) => user && MODERATOR_ROLES.includes(user.role);

// ==========================================
// 1. DOCTORS DIRECTORY (/api/doctors)
// ==========================================
router.get('/doctors', (req, res) => {
  const { specialty, city, search, includePending } = req.query;
  let list = db.getCollection('doctors');

  const isMod = isModerator(req.user);
  if (!isMod || includePending !== 'true') {
    list = list.filter(d => d.status === 'approved' || d.verified === true || (!d.status && d.verified !== false));
  }

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
      (d.specialty || '').toLowerCase().includes(q) ||
      (d.city || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'डॉक्टर्स यादी प्राप्त झाली', { doctors: list, count: list.length });
});

// GET /api/doctors/my - Doctor's own profile and appointments count
router.get('/doctors/my', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userPhone = req.user.phone ? cleanPhone(req.user.phone) : '';
  const allDocs = db.getCollection('doctors');
  const allAppts = db.getCollection('doctorAppointments');

  const myDocs = allDocs.filter(d => 
    d.submittedBy === userId || 
    (userPhone && d.phone && cleanPhone(d.phone) === userPhone)
  ).map(d => {
    const apptCount = allAppts.filter(a => a.doctorId === d.id).length;
    return { ...d, appointmentsCount: apptCount };
  });

  return sendSuccess(res, 'माझे डॉक्टर प्रोफाइल व अपॉइंटमेंट्स यादी', { doctors: myDocs, count: myDocs.length });
});

// GET /api/doctors/admin/pending - Moderator review queue
router.get('/doctors/admin/pending', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'प्रशासक किंवा आरोग्य समिती परवानगी आवश्यक.', 'FORBIDDEN', 403);
  }

  const allDocs = db.getCollection('doctors');
  const pending = allDocs.filter(d => d.status === 'pending_approval' || (!d.status && d.verified === false));

  return sendSuccess(res, 'प्रलंबित डॉक्टर पडताळणी यादी', { doctors: pending, count: pending.length });
});

router.get('/doctors/:id', (req, res) => {
  const doctor = db.findById('doctors', req.params.id);
  if (!doctor) {
    return sendError(res, 'डॉक्टर सापडले नाहीत.', 'DOCTOR_NOT_FOUND', 404);
  }
  return sendSuccess(res, 'डॉक्टर तपशील', { doctor });
});

router.post('/doctors', optionalToken, (req, res) => {
  const { name, specialty, hospital, city, phone, consultationFee, degree, timing, experience } = req.body;
  const cleanName = sanitize(name);
  const cleanedPhone = cleanPhone(phone);

  if (!cleanName || !cleanedPhone) {
    return sendError(res, 'कृपया नाव आणि फोन नंबर प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  if (!isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const isMod = isModerator(req.user);
  const status = isMod ? 'approved' : 'pending_approval';
  const verified = isMod ? true : false;

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
    timing: sanitize(timing) || 'स. १० ते सायं. ६',
    experience: sanitize(experience) || '१० वर्षे अनुभव',
    rating: '5.0 ★ (नवीन नोंदणी)',
    icon: '🩺',
    status,
    verified,
    submittedBy: req.user?.id || 'GUEST',
    createdAt: new Date().toISOString()
  };

  db.insert('doctors', newDoc);
  db.addAuditLog('REGISTER_DOCTOR', req.user?.id || 'GUEST', { doctorId: newDoc.id, name: cleanName, status });

  return sendSuccess(res, isMod ? 'डॉक्टर प्रोफाइल यशस्वीरीत्या जोडले गेले!' : 'डॉक्टर प्रोफाइल नोंदणी सादर झाली! प्रशासकीय पडताळणीनंतर सक्रिय होईल.', { doctor: newDoc }, 201);
});

// PATCH /api/doctors/:id/moderation - Moderate doctor profile
router.patch('/doctors/:id/moderation', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'केवळ प्रशासक किंवा केंद्र व्यवस्थापक पडताळणी करू शकतात.', 'FORBIDDEN', 403);
  }

  const { status, notes, verified } = req.body;
  if (!['approved', 'rejected', 'pending_approval'].includes(status)) {
    return sendError(res, 'अवैध स्थिती मूल्य.', 'INVALID_STATUS', 400);
  }

  const doctor = db.findById('doctors', req.params.id);
  if (!doctor) {
    return sendError(res, 'डॉक्टर सापडले नाहीत.', 'NOT_FOUND', 404);
  }

  const updated = db.update('doctors', req.params.id, {
    status,
    verified: verified !== undefined ? !!verified : (status === 'approved'),
    moderationNotes: sanitize(notes) || '',
    moderatedBy: req.user.id,
    moderatorName: req.user.name,
    moderatedAt: new Date().toISOString()
  });

  db.addAuditLog('MODERATE_DOCTOR', req.user.id, { doctorId: req.params.id, status, verified: updated.verified });

  return sendSuccess(res, `डॉक्टर प्रोफाइल स्थिती '${status === 'approved' ? 'मंजूर' : 'अस्वीकृत'}' केली.`, { doctor: updated });
});

// POST /api/doctors/:id/appointment - Book doctor consultation appointment
router.post('/doctors/:id/appointment', optionalToken, async (req, res) => {
  const doctor = db.findById('doctors', req.params.id);
  if (!doctor) {
    return sendError(res, 'डॉक्टर सापडले नाहीत.', 'NOT_FOUND', 404);
  }

  const { patientName, phone, date, timeSlot, symptomsNotes } = req.body;
  const cleanedPhone = cleanPhone(phone || req.user?.phone || '');

  if (!cleanedPhone || !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const appointment = {
    id: `APT-${Date.now().toString().slice(-4)}`,
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorPhone: doctor.phone,
    patientName: sanitize(patientName) || req.user?.name || 'सन्माननीय रुग्ण',
    patientId: req.user?.id || 'GUEST',
    phone: cleanedPhone,
    date: sanitize(date) || 'लवकरच (ASAP)',
    timeSlot: sanitize(timeSlot) || 'सकाळी १०:००',
    notes: sanitize(symptomsNotes) || '',
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };

  db.insert('doctorAppointments', appointment);
  try {
    await runQuery(`
      INSERT INTO doctor_appointments (id, doctor_id, doctor_name, patient_name, patient_phone, preferred_date, preferred_time, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      appointment.id,
      appointment.doctorId,
      appointment.doctorName,
      appointment.patientName,
      appointment.phone,
      appointment.date,
      appointment.timeSlot,
      appointment.notes,
      appointment.status,
      appointment.createdAt
    ]);
  } catch (err) {
    console.error('Failed to sync appointment to SQLite:', err.message);
  }

  db.addAuditLog('BOOK_DOCTOR', req.user?.id || 'GUEST', { doctorId: doctor.id, appointmentId: appointment.id });

  return sendSuccess(res, 'डॉक्टर भेट वेळ (Appointment) नोंदणी यशस्वी!', { appointment }, 201);
});

// GET /api/doctors/:id/appointments - View appointments for doctor
router.get('/doctors/:id/appointments', authenticateToken, async (req, res) => {
  const doctor = db.findById('doctors', req.params.id);
  if (!doctor) {
    return sendError(res, 'डॉक्टर सापडले नाहीत.', 'NOT_FOUND', 404);
  }

  const isOwner = doctor.submittedBy === req.user.id || 
                  (req.user.phone && doctor.phone && cleanPhone(doctor.phone) === cleanPhone(req.user.phone));

  if (!isOwner && !isModerator(req.user)) {
    return sendError(res, 'केवळ संबंधित डॉक्टर किंवा प्रशासक भेट यादी पाहू शकतात.', 'FORBIDDEN', 403);
  }

  let appointments = [];
  try {
    const rows = await all(`SELECT * FROM doctor_appointments WHERE doctor_id = ? ORDER BY created_at DESC`, [req.params.id]);
    if (rows && rows.length > 0) {
      appointments = rows.map(r => ({
        id: r.id,
        doctorId: r.doctor_id,
        doctorName: r.doctor_name,
        patientName: r.patient_name,
        patientPhone: r.patient_phone,
        phone: r.patient_phone,
        date: r.preferred_date,
        timeSlot: r.preferred_time,
        notes: r.notes,
        status: r.status,
        createdAt: r.created_at
      }));
    }
  } catch (err) {
    console.error('Error querying doctor_appointments from SQLite:', err.message);
  }

  if (!appointments.length) {
    appointments = db.getCollection('doctorAppointments').filter(a => a.doctorId === req.params.id);
  }

  return sendSuccess(res, 'डॉक्टर अपॉइंटमेंट्स यादी', { appointments, count: appointments.length });
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
  const { location, search, includePending } = req.query;
  let list = db.getCollection('builders');

  const isMod = isModerator(req.user);
  if (!isMod || includePending !== 'true') {
    list = list.filter(b => b.status === 'approved' || b.verified === true || (!b.status && b.reraApproved));
  }

  if (location && location !== 'सर्व') {
    list = list.filter(b => (b.location || '').includes(location));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(b => 
      (b.projectName || '').toLowerCase().includes(q) ||
      (b.developer || '').toLowerCase().includes(q) ||
      (b.location || '').toLowerCase().includes(q) ||
      (b.configuration || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'बिल्डर प्रकल्प यादी', { builders: list, count: list.length });
});

// GET /api/builders/my - Developer's own projects and buyer leads count
router.get('/builders/my', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userPhone = req.user.phone ? cleanPhone(req.user.phone) : '';
  const allBuilders = db.getCollection('builders');
  const allInquiries = db.getCollection('builderInquiries');

  const myBuilders = allBuilders.filter(b => 
    b.submittedBy === userId || 
    (userPhone && b.phone && cleanPhone(b.phone) === userPhone)
  ).map(b => {
    const inqCount = allInquiries.filter(i => i.builderId === b.id).length;
    return { ...b, inquiriesCount: inqCount };
  });

  return sendSuccess(res, 'माझे बांधकाम प्रकल्प व ग्राहक चौकशी यादी', { builders: myBuilders, count: myBuilders.length });
});

// GET /api/builders/admin/pending - Moderator review queue
router.get('/builders/admin/pending', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'प्रशासक परवानगी आवश्यक.', 'FORBIDDEN', 403);
  }

  const allBuilders = db.getCollection('builders');
  const pending = allBuilders.filter(b => b.status === 'pending_approval' || (!b.status && !b.reraApproved && !b.verified));

  return sendSuccess(res, 'प्रलंबित बांधकाम प्रकल्प पडताळणी यादी', { builders: pending, count: pending.length });
});

router.get('/builders/:id', (req, res) => {
  const project = db.findById('builders', req.params.id);
  if (!project) {
    return sendError(res, 'प्रकल्प सापडला नाही.', 'PROJECT_NOT_FOUND', 404);
  }
  return sendSuccess(res, 'प्रकल्प तपशील', { project });
});

router.post('/builders', optionalToken, (req, res) => {
  const { projectName, developer, location, configuration, priceRange, phone, reraNo, amenities, description } = req.body;
  const cleanProj = sanitize(projectName);
  const cleanDev = sanitize(developer);

  if (!cleanProj || !cleanDev) {
    return sendError(res, 'प्रकल्प व विकासकाचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const cleanedPhone = phone ? cleanPhone(phone) : '';
  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const isMod = isModerator(req.user);
  const status = isMod ? 'approved' : 'pending_approval';
  const verified = isMod ? true : false;

  const item = {
    id: `BLD-${Date.now().toString().slice(-4)}`,
    projectName: cleanProj,
    developer: cleanDev,
    location: sanitize(location) || 'पुणे / मुंबई',
    configuration: sanitize(configuration) || '2 & 3 BHK Premium Homes',
    priceRange: sanitize(priceRange) || '₹६५ लाख ते ₹१.५ कोटी',
    phone: cleanedPhone,
    reraNo: sanitize(reraNo) || 'P521000XXXXX',
    reraApproved: true,
    discountForMembers: 'मराठा महासंघ सदस्यांसाठी विशेष ३% सवलत',
    amenities: amenities || ['क्लबहाऊस', 'जिम', 'लँडस्केप गार्डन', 'सुरक्षा'],
    description: sanitize(description) || 'मराठा उद्योजकांचे प्रतिष्ठित गृहनिर्माण प्रकल्प.',
    status,
    verified,
    submittedBy: req.user?.id || 'GUEST',
    createdAt: new Date().toISOString()
  };

  db.insert('builders', item);
  db.addAuditLog('REGISTER_BUILDER_PROJECT', req.user?.id || 'GUEST', { projectId: item.id, projectName: cleanProj, status });

  return sendSuccess(res, isMod ? 'बिल्डर प्रकल्प यशस्वीरीत्या नोंदवला गेला!' : 'प्रकल्प नोंदणी विनंती सादर झाली! प्रशासकीय पडताळणीनंतर सक्रिय होईल.', { project: item }, 201);
});

// PATCH /api/builders/:id/moderation - Moderate builder project
router.patch('/builders/:id/moderation', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'केवळ प्रशासक पडताळणी करू शकतात.', 'FORBIDDEN', 403);
  }

  const { status, notes, verified } = req.body;
  if (!['approved', 'rejected', 'pending_approval'].includes(status)) {
    return sendError(res, 'अवैध स्थिती मूल्य.', 'INVALID_STATUS', 400);
  }

  const project = db.findById('builders', req.params.id);
  if (!project) {
    return sendError(res, 'प्रकल्प सापडला नाही.', 'NOT_FOUND', 404);
  }

  const updated = db.update('builders', req.params.id, {
    status,
    verified: verified !== undefined ? !!verified : (status === 'approved'),
    moderationNotes: sanitize(notes) || '',
    moderatedBy: req.user.id,
    moderatorName: req.user.name,
    moderatedAt: new Date().toISOString()
  });

  db.addAuditLog('MODERATE_BUILDER_PROJECT', req.user.id, { projectId: req.params.id, status, verified: updated.verified });

  return sendSuccess(res, `प्रकल्प स्थिती '${status === 'approved' ? 'मंजूर' : 'अस्वीकृत'}' केली.`, { project: updated });
});

// POST /api/builders/:id/inquiry - Home buyer inquiry / Site visit request
router.post('/builders/:id/inquiry', optionalToken, (req, res) => {
  const project = db.findById('builders', req.params.id);
  if (!project) {
    return sendError(res, 'प्रकल्प सापडला नाही.', 'NOT_FOUND', 404);
  }

  const { buyerName, phone, email, budget, interestedConfiguration, message } = req.body;
  const cleanedPhone = cleanPhone(phone || req.user?.phone || '');

  if (!cleanedPhone || !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const inquiry = {
    id: `BINQ-${Date.now().toString().slice(-4)}`,
    builderId: project.id,
    projectName: project.projectName,
    developer: project.developer,
    buyerName: sanitize(buyerName) || req.user?.name || 'सन्माननीय ग्राहक',
    buyerId: req.user?.id || 'GUEST',
    phone: cleanedPhone,
    email: sanitize(email) || req.user?.email || '',
    budget: sanitize(budget) || project.priceRange,
    configuration: sanitize(interestedConfiguration) || project.configuration,
    message: sanitize(message) || 'साइट व्हिजिट व माहिती हवी आहे.',
    status: 'new_lead',
    createdAt: new Date().toISOString()
  };

  db.insert('builderInquiries', inquiry);
  db.addAuditLog('INQUIRE_BUILDER_PROJECT', req.user?.id || 'GUEST', { projectId: project.id, inquiryId: inquiry.id });

  return sendSuccess(res, 'गृहप्रकल्प चौकशी यशस्वीपणे पाठवली! विकासक प्रतिनिधी लवकरच संपर्क साधतील.', { inquiry }, 201);
});

// GET /api/builders/:id/inquiries - View inquiries for builder project
router.get('/builders/:id/inquiries', authenticateToken, (req, res) => {
  const project = db.findById('builders', req.params.id);
  if (!project) {
    return sendError(res, 'प्रकल्प सापडला नाही.', 'NOT_FOUND', 404);
  }

  const isOwner = project.submittedBy === req.user.id || 
                  (req.user.phone && project.phone && cleanPhone(project.phone) === cleanPhone(req.user.phone));

  if (!isOwner && !isModerator(req.user)) {
    return sendError(res, 'केवळ संबंधित विकासक किंवा प्रशासक ग्राहक चौकशी पाहू शकतात.', 'FORBIDDEN', 403);
  }

  const inquiries = db.getCollection('builderInquiries').filter(i => i.builderId === req.params.id);
  return sendSuccess(res, 'प्रकल्प ग्राहक चौकशी यादी', { inquiries, count: inquiries.length });
});

// ==========================================
// 7. MANUFACTURERS (/api/manufacturers)
// ==========================================
router.get('/manufacturers', (req, res) => {
  const { industry, district, search, includePending } = req.query;
  let list = db.getCollection('manufacturers');

  const isMod = isModerator(req.user);
  if (!isMod || includePending !== 'true') {
    list = list.filter(m => m.status === 'approved' || m.verified === true || (!m.status && m.verified !== false));
  }

  if (industry && industry !== 'सर्व') {
    list = list.filter(m => (m.industry || '').includes(industry));
  }
  if (district && district !== 'सर्व') {
    list = list.filter(m => (m.district || '').includes(district));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(m => 
      (m.companyName || '').toLowerCase().includes(q) ||
      (m.industry || '').toLowerCase().includes(q) ||
      (m.products || '').toLowerCase().includes(q) ||
      (m.district || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'उद्योग व मॅन्युफॅक्चरर्स यादी', { manufacturers: list, count: list.length });
});

// GET /api/manufacturers/my - Manufacturer's own units and B2B quotation inquiries count
router.get('/manufacturers/my', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userPhone = req.user.phone ? cleanPhone(req.user.phone) : '';
  const allMfg = db.getCollection('manufacturers');
  const allInq = db.getCollection('manufacturerInquiries');

  const myMfg = allMfg.filter(m => 
    m.submittedBy === userId || 
    (userPhone && m.contact && cleanPhone(m.contact) === userPhone)
  ).map(m => {
    const inqCount = allInq.filter(i => i.manufacturerId === m.id).length;
    return { ...m, inquiriesCount: inqCount };
  });

  return sendSuccess(res, 'माझे मॅन्युफॅक्चरिंग युनिट्स व कोटेशन चौकशी यादी', { manufacturers: myMfg, count: myMfg.length });
});

// GET /api/manufacturers/admin/pending - Moderator review queue
router.get('/manufacturers/admin/pending', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'प्रशासक किंवा उद्योग मंच परवानगी आवश्यक.', 'FORBIDDEN', 403);
  }

  const allMfg = db.getCollection('manufacturers');
  const pending = allMfg.filter(m => m.status === 'pending_approval' || (!m.status && m.verified === false));

  return sendSuccess(res, 'प्रलंबित उद्योग नोंदणी पडताळणी यादी', { manufacturers: pending, count: pending.length });
});

router.get('/manufacturers/:id', (req, res) => {
  const manufacturer = db.findById('manufacturers', req.params.id);
  if (!manufacturer) {
    return sendError(res, 'उद्योग सापडला नाही.', 'MANUFACTURER_NOT_FOUND', 404);
  }
  return sendSuccess(res, 'उद्योग तपशील', { manufacturer });
});

router.post('/manufacturers', optionalToken, (req, res) => {
  const { companyName, industry, products, district, contact, turnover, address, certs } = req.body;
  const cleanCompany = sanitize(companyName);

  if (!cleanCompany) {
    return sendError(res, 'कंपनीचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const cleanedPhone = contact ? cleanPhone(contact) : '';
  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const isMod = isModerator(req.user);
  const status = isMod ? 'approved' : 'pending_approval';
  const verified = isMod ? true : false;

  const item = {
    id: `MFG-${Date.now().toString().slice(-4)}`,
    companyName: cleanCompany,
    industry: sanitize(industry) || 'इंजिनिअरिंग / ऑटोमोबाईल',
    products: sanitize(products) || 'पार्ट्स व मेकॅनिकल उपकरणे',
    district: sanitize(district) || 'चाकण, पुणे',
    address: sanitize(address) || 'MIDC औद्योगिक वसाहत',
    contact: cleanedPhone,
    turnover: sanitize(turnover) || '₹१० कोटी+',
    certs: certs || ['ISO 9001:2015', 'MSME Udyam'],
    status,
    verified,
    submittedBy: req.user?.id || 'GUEST',
    createdAt: new Date().toISOString()
  };

  db.insert('manufacturers', item);
  db.addAuditLog('REGISTER_MANUFACTURER', req.user?.id || 'GUEST', { manufacturerId: item.id, companyName: cleanCompany, status });

  return sendSuccess(res, isMod ? 'उत्पादक उद्योग यशस्वीरीत्या जोडला गेला!' : 'उद्योग नोंदणी विनंती सादर झाली! पडताळणीनंतर सक्रिय होईल.', { manufacturer: item }, 201);
});

// PATCH /api/manufacturers/:id/moderation - Moderate manufacturer
router.patch('/manufacturers/:id/moderation', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'केवळ प्रशासक पडताळणी करू शकतात.', 'FORBIDDEN', 403);
  }

  const { status, notes, verified } = req.body;
  if (!['approved', 'rejected', 'pending_approval'].includes(status)) {
    return sendError(res, 'अवैध स्थिती मूल्य.', 'INVALID_STATUS', 400);
  }

  const mfg = db.findById('manufacturers', req.params.id);
  if (!mfg) {
    return sendError(res, 'उद्योग युनिट सापडले नाही.', 'NOT_FOUND', 404);
  }

  const updated = db.update('manufacturers', req.params.id, {
    status,
    verified: verified !== undefined ? !!verified : (status === 'approved'),
    moderationNotes: sanitize(notes) || '',
    moderatedBy: req.user.id,
    moderatorName: req.user.name,
    moderatedAt: new Date().toISOString()
  });

  db.addAuditLog('MODERATE_MANUFACTURER', req.user.id, { manufacturerId: req.params.id, status, verified: updated.verified });

  return sendSuccess(res, `उद्योग स्थिती '${status === 'approved' ? 'मंजूर' : 'अस्वीकृत'}' केली.`, { manufacturer: updated });
});

// POST /api/manufacturers/:id/inquiry - B2B RFQ quotation inquiry
router.post('/manufacturers/:id/inquiry', optionalToken, (req, res) => {
  const mfg = db.findById('manufacturers', req.params.id);
  if (!mfg) {
    return sendError(res, 'उद्योग युनिट सापडले नाही.', 'NOT_FOUND', 404);
  }

  const { companyName, contactPerson, phone, email, requiredProducts, quantity, targetTimeline, rfqNotes } = req.body;
  const cleanedPhone = cleanPhone(phone || req.user?.phone || '');

  if (!cleanedPhone || !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const inquiry = {
    id: `RFQ-${Date.now().toString().slice(-4)}`,
    manufacturerId: mfg.id,
    manufacturerName: mfg.companyName,
    buyerCompanyName: sanitize(companyName) || 'संबंधित खरेदीदार उद्योग',
    contactPerson: sanitize(contactPerson) || req.user?.name || 'खरेदी व्यवस्थापक',
    buyerId: req.user?.id || 'GUEST',
    phone: cleanedPhone,
    email: sanitize(email) || req.user?.email || '',
    requiredProducts: sanitize(requiredProducts) || mfg.products,
    quantity: sanitize(quantity) || 'बल्क प्रमाण',
    targetTimeline: sanitize(targetTimeline) || '३० दिवसांत',
    notes: sanitize(rfqNotes) || '',
    status: 'new_rfq',
    createdAt: new Date().toISOString()
  };

  db.insert('manufacturerInquiries', inquiry);
  db.addAuditLog('SUBMIT_RFQ', req.user?.id || 'GUEST', { manufacturerId: mfg.id, inquiryId: inquiry.id });

  return sendSuccess(res, 'B2B कोटेशन मागणी (RFQ) यशस्वीपणे सादर झाली!', { inquiry }, 201);
});

// GET /api/manufacturers/:id/inquiries - View RFQ inquiries for manufacturer
router.get('/manufacturers/:id/inquiries', authenticateToken, (req, res) => {
  const mfg = db.findById('manufacturers', req.params.id);
  if (!mfg) {
    return sendError(res, 'उद्योग युनिट सापडले नाही.', 'NOT_FOUND', 404);
  }

  const isOwner = mfg.submittedBy === req.user.id || 
                  (req.user.phone && mfg.contact && cleanPhone(mfg.contact) === cleanPhone(req.user.phone));

  if (!isOwner && !isModerator(req.user)) {
    return sendError(res, 'केवळ संबंधित उत्पादक किंवा प्रशासक B2B कोटेशन्स पाहू शकतात.', 'FORBIDDEN', 403);
  }

  const inquiries = db.getCollection('manufacturerInquiries').filter(i => i.manufacturerId === req.params.id);
  return sendSuccess(res, 'B2B कोटेशन चौकशी यादी', { inquiries, count: inquiries.length });
});


// ==========================================
// 8. DAIRY COOPERATIVES & AGRO COLLECTION (/api/dairy)
// ==========================================
router.get('/dairy', (req, res) => {
  const { district, search } = req.query;
  let list = db.getCollection('dairy') || [];

  if (district && district !== 'सर्व') {
    list = list.filter(d => (d.district || '').includes(district) || (d.location || '').includes(district));
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(d =>
      (d.dairyName || '').toLowerCase().includes(q) ||
      (d.centerHead || '').toLowerCase().includes(q) ||
      (d.district || '').toLowerCase().includes(q) ||
      (d.location || '').toLowerCase().includes(q)
    );
  }

  // Daily dynamic rate chart
  const rateChart = {
    date: new Date().toLocaleDateString('mr-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
    cow: {
      standardFat: 3.5,
      standardSnf: 8.5,
      baseRate: 36.0,
      govtSubsidy: 1.5,
      totalEffectiveRate: 37.5,
      fatDiffPerPoint: 0.35
    },
    buffalo: {
      standardFat: 6.5,
      standardSnf: 9.0,
      baseRate: 58.0,
      totalEffectiveRate: 58.0,
      fatDiffPerPoint: 0.60
    }
  };

  return sendSuccess(res, 'मराठा डेअरी व दुग्ध व्यवसाय केंद्र यादी', {
    dairy: list,
    count: list.length,
    rateChart
  });
});

// Register Dairy Collection Center / BMC
router.post('/dairy', optionalToken, (req, res) => {
  const { dairyName, centerHead, dailyCollection, district, location, milkRateCow, milkRateBuffalo, contact, facility, timing } = req.body;
  const cleanDairy = sanitize(dairyName);

  if (!cleanDairy) {
    return sendError(res, 'डेअरीचे नाव आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const cleanedPhone = contact ? cleanPhone(contact) : (req.user?.phone ? cleanPhone(req.user.phone) : '');
  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const item = {
    id: `DRY-${Date.now().toString().slice(-4)}`,
    dairyName: cleanDairy,
    centerHead: sanitize(centerHead) || (req.user?.name || 'केंद्र प्रमुख'),
    dailyCollection: sanitize(dailyCollection) || '२,५०० लिटर/दिवस',
    district: sanitize(district || location) || 'कोल्हापूर',
    location: sanitize(location || district) || 'महाराष्ट्र',
    milkRateCow: sanitize(milkRateCow) || '₹३७.५० / लिटर',
    milkRateBuffalo: sanitize(milkRateBuffalo) || '₹५८.०० / लिटर',
    facility: sanitize(facility) || 'ऑटोमॅटिक मिल्क ॲनालायझर व बल्क कुलर',
    timing: sanitize(timing) || 'सकाळी ५:३० ते १०:३० | संध्या. ५:०० ते ८:००',
    contact: cleanedPhone,
    status: 'active',
    verificationBadge: req.user?.isVerified ? '🟢 पडताळणीकृत संकलन केंद्र' : '🟡 समुदाय संकलन केंद्र',
    submittedBy: req.user?.id || 'anonymous',
    createdAt: new Date().toISOString()
  };

  db.insert('dairy', item);
  db.addAuditLog('ADD_DAIRY_CENTER', req.user?.id || 'public', { dairyId: item.id, name: cleanDairy });

  return sendSuccess(res, 'डेअरी संकलन केंद्र यशस्वीरीत्या जोडले गेले!', { dairyCenter: item }, 201);
});

// Register Milk Producer Farmer
router.post('/dairy/farmers', optionalToken, (req, res) => {
  const { name, phone, village, district, cattleCount, dailyLiters, milkType } = req.body;
  const cleanName = sanitize(name);
  const cleanP = cleanPhone(phone);

  if (!cleanName || !cleanP || !isValidPhone(cleanP)) {
    return sendError(res, 'कृपया शेतकऱ्याचे पूर्ण नाव आणि वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.', 'INVALID_INPUT', 400);
  }

  const farmerIdStr = Date.now().toString().slice(-4);
  const farmer = {
    id: `FARM-${farmerIdStr}`,
    producerCode: `CM-FARM-${farmerIdStr}`,
    name: cleanName,
    phone: cleanP,
    village: sanitize(village) || 'महाराष्ट्र',
    district: sanitize(district || village) || 'कोल्हापूर',
    cattleCount: Number(cattleCount) || 5,
    dailyLiters: Number(dailyLiters) || 30,
    milkType: sanitize(milkType) || 'गाय व म्हैस',
    status: 'नोंदणीकृत (Registered)',
    verificationBadge: '🟢 अधिकृत दूध उत्पादक शेतकरी',
    createdAt: new Date().toISOString()
  };

  db.insert('dairyFarmers', farmer);
  db.addAuditLog('REGISTER_DAIRY_FARMER', req.user?.id || cleanP, { farmerId: farmer.id, name: cleanName });

  if (req.user?.id) {
    db.insert('notifications', {
      recipientId: req.user.id,
      title: '🥛 दूध उत्पादक शेतकरी नोंदणी यशस्वी!',
      message: `आपली शेतकरी नोंदणी क्र. ${farmer.id} यशस्वी झाली आहे. जवळचे संकलन केंद्र लवकरच भेट देईल.`,
      type: 'dairy_farmer',
      read: false,
      timestamp: new Date().toISOString()
    });
  }

  return sendSuccess(res, 'दूध उत्पादक शेतकरी नोंदणी यशस्वीरीत्या पूर्ण झाली!', { farmer }, 201);
});

// Place Fresh Dairy Product Order
router.post('/dairy/orders', optionalToken, (req, res) => {
  const { customerName, name, phone, deliveryAddress, address, productName, quantity, price, deliverySlot } = req.body;
  const cleanName = sanitize(customerName || name);
  const cleanP = cleanPhone(phone);

  if (!cleanName || !cleanP || !isValidPhone(cleanP)) {
    return sendError(res, 'कृपया ग्राहकाचे नाव आणि वैध मोबाईल नंबर प्रविष्ट करा.', 'INVALID_INPUT', 400);
  }

  const numericQty = Number(quantity) || 1;
  const priceStr = sanitize(price) || '₹५४';
  const numericPrice = Number(String(priceStr).replace(/[^\d.]/g, '')) || 54;
  const totalAmount = `₹${numericPrice * numericQty}`;

  const order = {
    id: `ORD-DRY-${Date.now().toString().slice(-4)}`,
    customerName: cleanName,
    phone: cleanP,
    deliveryAddress: sanitize(deliveryAddress || address) || 'महाराष्ट्र',
    productName: sanitize(productName) || 'ताजे दूध',
    quantity: numericQty,
    price: priceStr,
    totalAmount,
    deliverySlot: sanitize(deliverySlot) || 'सकाळी ६:३० ते ८:००',
    status: 'स्वीकृत (Order Confirmed)',
    createdAt: new Date().toISOString()
  };

  db.insert('dairyOrders', order);
  db.addAuditLog('CREATE_DAIRY_ORDER', req.user?.id || cleanP, { orderId: order.id, product: order.productName, totalAmount });

  if (req.user?.id) {
    db.insert('notifications', {
      recipientId: req.user.id,
      title: '🥛 डेअरी ऑर्डर निश्चित झाली!',
      message: `आपली ऑर्डर क्र. ${order.id} (${order.productName}) स्वीकारली गेली आहे. ताजे उत्पादन लवकरच पोहोचवले जाईल.`,
      type: 'dairy_order',
      read: false,
      timestamp: new Date().toISOString()
    });
  }

  return sendSuccess(res, 'डेअरी उत्पादन ऑर्डर यशस्वीरीत्या नोंदवली गेली!', { order }, 201);
});

// Apply for Collection Center Franchise / BMC Partnership
router.post('/dairy/partner', optionalToken, (req, res) => {
  const { applicantName, name, phone, proposedLocation, location, district, landArea, investmentBudget, existingExperience, estimatedCollection, hasSpace, hasElectricity } = req.body;
  const cleanName = sanitize(applicantName || name);
  const cleanP = cleanPhone(phone);

  if (!cleanName || !cleanP || !isValidPhone(cleanP)) {
    return sendError(res, 'कृपया अर्जदाराचे नाव आणि वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.', 'INVALID_INPUT', 400);
  }

  const application = {
    id: `BMC-APP-${Date.now().toString().slice(-4)}`,
    applicantName: cleanName,
    name: cleanName,
    phone: cleanP,
    proposedLocation: sanitize(proposedLocation || location || district) || 'महाराष्ट्र',
    district: sanitize(district || location) || 'महाराष्ट्र',
    landArea: sanitize(landArea) || '५०० चौ.फूट',
    investmentBudget: sanitize(investmentBudget) || '₹१ ते ₹३ लाख',
    existingExperience: sanitize(existingExperience) || 'उद्योजक',
    estimatedCollection: sanitize(estimatedCollection) || '१,००० लिटर/दिवस',
    hasSpace: hasSpace !== false,
    hasElectricity: hasElectricity !== false,
    status: 'पडताळणी अंतर्गत (In Review)',
    createdAt: new Date().toISOString()
  };

  db.insert('dairyPartners', application);
  db.addAuditLog('APPLY_DAIRY_PARTNER', req.user?.id || cleanP, { appId: application.id, name: cleanName });

  return sendSuccess(res, 'संकलन केंद्र भागीदारी अर्ज यशस्वीरीत्या सादर केला गेला!', { partnerApplication: application, application }, 201);
});

// ==========================================
// 9. MARATHA BANK, ACCOUNTS & LOANS (/api/bank)
// ==========================================
// Get banking schemes, credit societies, rates and user applications
router.get('/bank/loans', (req, res) => {
  const list = db.getCollection('bankLoans') || [];
  const creditSocieties = [
    { id: 'PAT-01', name: 'राजमाता जिजाऊ ग्रामीण बिगरशेती सहकारी पतसंस्था', city: 'पुणे', branches: 14, deposits: '₹१४० कोटी', rating: 'A+', contact: '+91 98221 44550' },
    { id: 'PAT-02', name: 'छत्रपती शिवाजी महाराज नागरी सहकारी बँक लि.', city: 'कोल्हापूर', branches: 28, deposits: '₹४५० कोटी', rating: 'A++', contact: '+91 98230 45566' },
    { id: 'PAT-03', name: 'स्वराज्य महिला औद्योगिक व कृषी पतसंस्था', city: 'सातारा', branches: 8, deposits: '₹७५ कोटी', rating: 'A+', contact: '+91 98224 88712' },
    { id: 'PAT-04', name: 'अखिल मराठा मल्टिस्टेट को-ऑपरेटिव्ह क्रेडिट सोसायटी', city: 'नाशिक', branches: 22, deposits: '₹३१० कोटी', rating: 'A+', contact: '+91 98902 33441' }
  ];

  const userLoans = req.user ? (req.user.role === 'admin' ? list : list.filter(l => l.applicantId === req.user.id)) : [];

  return sendSuccess(res, 'बँकिंग सेवा व कर्ज योजना', {
    schemes: [
      { id: 'ANNABHAU-01', name: 'अण्णासाहेब पाटील महामंडळ बिनव्याजी कर्ज योजना', maxAmount: '₹१५,००,०००', interestSubsidy: '१२% व्याज परतावा', category: 'स्वयंरोजगार', subsidyBadge: 'शासन अनुदानित बिनव्याजी' },
      { id: 'AGRI-02', name: 'कृषी व प्रक्रिया उद्योग विस्तार योजना', maxAmount: '₹५०,००,०००', interestSubsidy: 'विशेष सवलत (४% प्रभावी व्याज)', category: 'कृषी उद्योग', subsidyBadge: 'अग्रक्रम क्षेत्र' },
      { id: 'STARTUP-03', name: 'मराठा युवा स्टार्ट-अप सीड कॅपिटल', maxAmount: '₹१०,००,०००', interestSubsidy: 'सुलभ हप्ते (९.२५%)', category: 'स्टार्टअप', subsidyBadge: 'उद्योजकता प्रोत्साहन' },
      { id: 'HOME-04', name: 'मराठा गृह समृद्धी कर्ज योजना', maxAmount: '₹७५,००,०००', interestSubsidy: '८.४०% वार्षिक', category: 'गृह कर्ज', subsidyBadge: 'किमान प्रक्रिया शुल्क' }
    ],
    creditSocieties,
    myApplications: userLoans
  });
});

// Submit loan application
router.post('/bank/loans', authenticateToken, (req, res) => {
  const { isValid, errors, sanitized } = validateLoan(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'अवैध कर्ज अर्ज माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
  }

  const { loanAmount, purpose } = sanitized;
  const { schemeName, businessName, annualIncome, contact, city, district } = req.body;

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
    city: sanitize(city) || 'पुणे',
    district: sanitize(district) || 'पुणे',
    status: 'कागदपत्र पडताळणी अंतर्गत (In Review)',
    verificationBadge: '🟡 प्राथमिक अर्ज प्राप्त',
    createdAt: new Date().toISOString()
  };

  db.insert('bankLoans', item);
  db.addAuditLog('APPLY_LOAN', req.user.id, { loanId: item.id, amount: loanAmount });

  db.insert('notifications', {
    recipientId: req.user.id,
    title: '🏦 कर्ज अर्ज यशस्वीरीत्या प्राप्त झाला!',
    message: `आपला "${item.schemeName}" साठी ₹${Number(loanAmount).toLocaleString('en-IN')} चा अर्ज क्र. ${item.id} पडताळणीसाठी पाठवला आहे.`,
    type: 'loan_application',
    read: false,
    timestamp: new Date().toISOString()
  });

  return sendSuccess(res, 'कर्ज अर्ज यशस्वीरीत्या सादर केला गेला!', { loanApplication: item }, 201);
});

// Admin / Branch Coordinator reviews loan status (Approved / In Verification / Disbursed)
router.patch('/bank/loans/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'ceo' && req.user.role !== 'branch_admin') {
    return sendError(res, 'केवळ बँक समन्वयक किंवा प्रशासक कर्ज स्थिती बदलू शकतात.', 'FORBIDDEN', 403);
  }

  const loan = db.findById('bankLoans', req.params.id);
  if (!loan) {
    return sendError(res, 'कर्ज अर्ज सापडला नाही.', 'LOAN_NOT_FOUND', 404);
  }

  const { status, remarks, sanctionedAmount } = req.body;
  const updates = { updatedAt: new Date().toISOString() };
  if (status) updates.status = sanitize(status);
  if (remarks) updates.remarks = sanitize(remarks);
  if (sanctionedAmount) updates.sanctionedAmount = Number(sanctionedAmount);

  if (updates.status && (updates.status.includes('मंजूर') || updates.status.toLowerCase().includes('approved'))) {
    updates.verificationBadge = '🟢 कर्ज पात्रता मंजूर (Sanctioned)';
  }

  const updated = db.update('bankLoans', req.params.id, updates);
  db.addAuditLog('UPDATE_LOAN_STATUS', req.user.id, { loanId: req.params.id, status: updates.status });

  // Notify applicant
  if (loan.applicantId) {
    db.insert('notifications', {
      recipientId: loan.applicantId,
      title: `🏦 कर्ज अर्ज अद्यतन: ${updates.status}`,
      message: `आपल्या अर्ज क्र. ${loan.id} ची स्थिती "${updates.status}" अशी अद्यतनित झाली आहे.`,
      type: 'loan_status',
      read: false,
      timestamp: new Date().toISOString()
    });
  }

  return sendSuccess(res, 'कर्ज अर्ज स्थिती अद्यतनित झाली!', { loanApplication: updated });
});

// Digital Bank Account Opening Application
router.post('/bank/accounts/apply', (req, res) => {
  const { name, phone, aadharOrPan, accountType, city } = req.body;
  const cleanP = cleanPhone(phone);
  if (!name || !cleanP || !isValidPhone(cleanP)) {
    return sendError(res, 'कृपया संपूर्ण नाव आणि वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.', 'INVALID_INPUT', 400);
  }

  const newAcc = {
    id: `ACC-APP-${Date.now().toString().slice(-4)}`,
    name: sanitize(name),
    phone: cleanP,
    aadharOrPan: sanitize(aadharOrPan) || 'पडताळणी अंतर्गत',
    accountType: sanitize(accountType) || 'बचत खाते (Savings Account)',
    city: sanitize(city) || 'महाराष्ट्र',
    status: 'KYC भेटीसाठी नियोजित (KYC In Progress)',
    createdAt: new Date().toISOString()
  };

  db.insert('auditLogs', {
    action: 'BANK_ACCOUNT_APPLICATION',
    meta: { appId: newAcc.id, name: newAcc.name, accountType: newAcc.accountType },
    timestamp: new Date().toISOString()
  });

  return sendSuccess(res, 'बँक खाते उघडण्याचा अर्ज यशस्वीरीत्या नोंदवला गेला!', { accountApplication: newAcc }, 201);
});

// Financial Institute Course Enrollment
router.post('/bank/institute/enroll', (req, res) => {
  const { studentName, phone, email, courseTitle, qualification } = req.body;
  const cleanP = cleanPhone(phone);
  if (!studentName || !cleanP || !isValidPhone(cleanP)) {
    return sendError(res, 'कृपया विद्यार्थ्याचे नाव आणि वैध मोबाईल नंबर प्रविष्ट करा.', 'INVALID_INPUT', 400);
  }

  const enrollment = {
    id: `FIN-CRS-${Date.now().toString().slice(-4)}`,
    studentName: sanitize(studentName),
    phone: cleanP,
    email: sanitize(email) || '',
    courseTitle: sanitize(courseTitle) || 'शेअर बाजार ट्रेडिंग कोर्स',
    qualification: sanitize(qualification) || 'पदवीधर',
    status: 'प्रवेश निश्चित (Enrolled)',
    scholarshipGranted: 'मराठा विद्यार्थी २५% विशेष सवलत लागू',
    createdAt: new Date().toISOString()
  };

  db.insert('auditLogs', {
    action: 'COURSE_ENROLLMENT',
    meta: { enrollmentId: enrollment.id, studentName: enrollment.studentName, course: enrollment.courseTitle },
    timestamp: new Date().toISOString()
  });

  return sendSuccess(res, 'कोर्स प्रवेश नोंदणी यशस्वीरीत्या पूर्ण झाली!', { enrollment }, 201);
});

// ==========================================
// 10. HOTELS & HOSPITALITY DIRECTORY (/api/hotels)
// ==========================================
router.get('/hotels', (req, res) => {
  const { city, district, category, search, includePending } = req.query;
  let list = db.getCollection('hotels');

  // Filter public items unless explicitly requesting pending and authorized
  const isMod = isModerator(req.user);
  if (!isMod || includePending !== 'true') {
    list = list.filter(h => h.status === 'approved' || h.verified === true || h.status === 'active' || (!h.status && h.verified !== false));
  }

  if (city && city !== 'सर्व') {
    list = list.filter(h => (h.city || '').includes(city));
  }
  if (district && district !== 'सर्व') {
    list = list.filter(h => (h.district || '').includes(district));
  }
  if (category && category !== 'सर्व') {
    list = list.filter(h => (h.category || '').includes(category));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(h => 
      (h.name || '').toLowerCase().includes(q) ||
      (h.city || '').toLowerCase().includes(q) ||
      (h.category || '').toLowerCase().includes(q) ||
      (h.district || '').toLowerCase().includes(q) ||
      (h.address || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'हॉटेल्स व लॉजिंग यादी प्राप्त झाली', { hotels: list, count: list.length });
});

// GET /api/hotels/my - List hotels submitted by authenticated user with booking lead counts
router.get('/hotels/my', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userPhone = req.user.phone ? cleanPhone(req.user.phone) : '';
  const allHotels = db.getCollection('hotels');
  const allBookings = db.getCollection('hotelBookings');

  const myHotels = allHotels.filter(h => 
    h.submittedBy === userId || 
    h.ownerId === userId || 
    (userPhone && h.phone && cleanPhone(h.phone) === userPhone)
  ).map(h => {
    const bookingCount = allBookings.filter(b => b.hotelId === h.id).length;
    return { ...h, bookingsCount: bookingCount };
  });

  return sendSuccess(res, 'माझी हॉटेल्स व बुकिंग चौकशी यादी', { hotels: myHotels, count: myHotels.length });
});

// GET /api/hotels/admin/pending - Moderator review queue
router.get('/hotels/admin/pending', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'प्रशासक किंवा केंद्र व्यवस्थापक परवानगी आवश्यक.', 'FORBIDDEN', 403);
  }

  const allHotels = db.getCollection('hotels');
  const pending = allHotels.filter(h => h.status === 'pending_approval' || (!h.status && h.verified === false));

  return sendSuccess(res, 'प्रलंबित हॉटेल्स पडताळणी यादी', { hotels: pending, count: pending.length });
});

router.get('/hotels/:id', (req, res) => {
  const hotel = db.findById('hotels', req.params.id);
  if (!hotel) {
    return sendError(res, 'हॉटेल सापडले नाही.', 'HOTEL_NOT_FOUND', 404);
  }
  return sendSuccess(res, 'हॉटेल तपशील', { hotel });
});

router.post('/hotels', optionalToken, (req, res) => {
  const { name, city, district, category, address, phone, website, rooms_count, price_range, star_rating, amenities, description, fortNearby } = req.body;
  const cleanName = sanitize(name);
  const cleanedPhone = cleanPhone(phone);

  if (!cleanName || !cleanedPhone) {
    return sendError(res, 'कृपया हॉटेलचे नाव आणि संपर्क नंबर प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  if (!isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const isMod = isModerator(req.user);
  const status = isMod ? 'approved' : 'pending_approval';
  const verified = isMod ? true : false;

  const newHotel = {
    id: `HTL-${Date.now().toString().slice(-4)}`,
    name: cleanName,
    city: sanitize(city) || 'पुणे',
    district: sanitize(district) || 'पुणे',
    category: sanitize(category) || 'हॉटेल / लॉज',
    star_rating: Number(star_rating) || 4.2,
    address: sanitize(address) || 'महाराष्ट्र',
    phone: cleanedPhone,
    website: sanitize(website) || '',
    rooms_count: Number(rooms_count) || 12,
    amenities: Array.isArray(amenities) ? amenities : ['वायफाय', 'पार्किंग', 'भोजनालय'],
    price_range: sanitize(price_range) || '₹२,००० - ₹४,०००',
    fortNearby: sanitize(fortNearby) || 'सह्याद्री दुर्ग परिसर',
    description: sanitize(description) || 'मराठा बांधवांचे व पर्यटकांचे स्वागत आहे.',
    photo: '🏨',
    status,
    verified,
    submittedBy: req.user?.id || 'GUEST',
    ownerName: req.user?.name || cleanName,
    ownerPhone: cleanedPhone,
    created_at: new Date().toISOString()
  };

  db.insert('hotels', newHotel);
  db.addAuditLog('ADD_HOTEL', req.user?.id || 'GUEST', { hotelId: newHotel.id, name: cleanName, status });

  return sendSuccess(res, isMod ? 'हॉटेल यशस्वीरीत्या जोडण्यात आले!' : 'हॉटेल नोंदणी विनंती सादर झाली! प्रशासकीय पडताळणीनंतर पोर्टलवर दिसेल.', { hotel: newHotel }, 201);
});

// PATCH /api/hotels/:id/moderation - Approve or reject hotel listing
router.patch('/hotels/:id/moderation', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'केवळ प्रशासक किंवा केंद्र व्यवस्थापक हॉटेल पडताळणी करू शकतात.', 'FORBIDDEN', 403);
  }

  const { status, notes, verified } = req.body;
  if (!['approved', 'rejected', 'pending_approval'].includes(status)) {
    return sendError(res, 'अवैध स्थिती मूल्य. (approved, rejected, pending_approval)', 'INVALID_STATUS', 400);
  }

  const hotel = db.findById('hotels', req.params.id);
  if (!hotel) {
    return sendError(res, 'हॉटेल सापडले नाही.', 'NOT_FOUND', 404);
  }

  const updated = db.update('hotels', req.params.id, {
    status,
    verified: verified !== undefined ? !!verified : (status === 'approved'),
    moderationNotes: sanitize(notes) || '',
    moderatedBy: req.user.id,
    moderatorName: req.user.name,
    moderatedAt: new Date().toISOString()
  });

  db.addAuditLog('MODERATE_HOTEL', req.user.id, { hotelId: req.params.id, status, verified: updated.verified });

  return sendSuccess(res, `हॉटेल स्थिती यशस्वीरीत्या '${status === 'approved' ? 'मंजूर' : 'अस्वीकृत'}' केली.`, { hotel: updated });
});

// POST /api/hotels/:id/booking - Guest booking inquiry
router.post('/hotels/:id/booking', optionalToken, async (req, res) => {
  const hotel = db.findById('hotels', req.params.id);
  if (!hotel) {
    return sendError(res, 'हॉटेल सापडले नाही.', 'HOTEL_NOT_FOUND', 404);
  }

  const { guestName, phone, email, checkInDate, checkOutDate, guestsCount, roomsCount, roomType, notes } = req.body;
  const cleanedPhone = cleanPhone(phone || req.user?.phone || '');

  if (!cleanedPhone || !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const booking = {
    id: `HBK-${Date.now().toString().slice(-4)}`,
    hotelId: hotel.id,
    hotelName: hotel.name,
    hotelOwnerId: hotel.submittedBy || hotel.ownerId || '',
    hotelPhone: hotel.phone,
    guestName: sanitize(guestName) || req.user?.name || 'सन्माननीय पर्यटक',
    guestId: req.user?.id || 'GUEST',
    phone: cleanedPhone,
    email: sanitize(email) || req.user?.email || '',
    checkInDate: sanitize(checkInDate) || 'लवकरच (ASAP)',
    checkOutDate: sanitize(checkOutDate) || '',
    guestsCount: Number(guestsCount) || 2,
    roomsCount: Number(roomsCount) || 1,
    roomType: sanitize(roomType) || 'डीलक्स रूम',
    notes: sanitize(notes) || '',
    status: 'new_inquiry',
    createdAt: new Date().toISOString()
  };

  db.insert('hotelBookings', booking);
  try {
    await runQuery(`
      INSERT INTO hotel_bookings (id, hotel_id, hotel_name, guest_name, guest_phone, check_in, check_out, rooms, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      booking.id,
      booking.hotelId,
      booking.hotelName,
      booking.guestName,
      booking.phone,
      booking.checkInDate,
      booking.checkOutDate,
      booking.roomsCount,
      booking.status,
      booking.createdAt
    ]);
  } catch (err) {
    console.error('Failed to sync hotel booking to SQLite:', err.message);
  }

  db.addAuditLog('BOOK_HOTEL', req.user?.id || 'GUEST', { hotelId: hotel.id, bookingId: booking.id });

  return sendSuccess(res, 'हॉटेल बुकिंग चौकशी यशस्वी! व्यवस्थापक लवकरच आपल्याशी संपर्क साधतील.', { booking }, 201);
});

// GET /api/hotels/:id/bookings - Owner / Admin views bookings for this hotel
router.get('/hotels/:id/bookings', authenticateToken, async (req, res) => {
  const hotel = db.findById('hotels', req.params.id);
  if (!hotel) {
    return sendError(res, 'हॉटेल सापडले नाही.', 'HOTEL_NOT_FOUND', 404);
  }

  const isOwner = hotel.submittedBy === req.user.id || 
                  hotel.ownerId === req.user.id || 
                  (req.user.phone && hotel.phone && cleanPhone(hotel.phone) === cleanPhone(req.user.phone));

  if (!isOwner && !isModerator(req.user)) {
    return sendError(res, 'केवळ हॉटेल मालक किंवा प्रशासक चौकशी पाहू शकतात.', 'FORBIDDEN', 403);
  }

  let bookings = [];
  try {
    const rows = await all(`SELECT * FROM hotel_bookings WHERE hotel_id = ? ORDER BY created_at DESC`, [req.params.id]);
    if (rows && rows.length > 0) {
      bookings = rows.map(r => ({
        id: r.id,
        hotelId: r.hotel_id,
        hotelName: r.hotel_name,
        guestName: r.guest_name,
        phone: r.guest_phone,
        checkInDate: r.check_in,
        checkOutDate: r.check_out,
        roomsCount: r.rooms,
        status: r.status,
        createdAt: r.created_at
      }));
    }
  } catch (err) {
    console.error('Error querying hotel_bookings from SQLite:', err.message);
  }

  if (!bookings.length) {
    bookings = db.getCollection('hotelBookings').filter(b => b.hotelId === req.params.id);
  }

  return sendSuccess(res, 'हॉटेल बुकिंग चौकशी यादी', { bookings, count: bookings.length });
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

// ==========================================
// 12. CLIENT ENQUIRIES & B2B LEADS (/api/enquiries)
// ==========================================
router.get('/enquiries', (req, res) => {
  const { category, district, search, status } = req.query;
  // Auto-seed removed: CRM only uses genuine user submitted entries
  let list = db.getCollection('clientEnquiries') || [];

  if (category && category !== 'सर्व') {
    list = list.filter(e => (e.category || '').toLowerCase().includes(category.toLowerCase()));
  }
  if (district && district !== 'सर्व') {
    list = list.filter(e => (e.district || '').toLowerCase().includes(district.toLowerCase()));
  }
  if (status && status !== 'all') {
    list = list.filter(e => (e.status || '').toLowerCase().includes(status.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(e => 
      (e.title || '').toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q) ||
      (e.district || '').toLowerCase().includes(q) ||
      (e.city || '').toLowerCase().includes(q)
    );
  }

  // Newest first
  list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return sendSuccess(res, 'ग्राहक Enquiries व Leads यादी', { enquiries: list, totalCount: list.length });
});

// GET /api/enquiries/my - Current user's posted enquiries and submitted quotes
router.get('/enquiries/my', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const userPhone = req.user.phone ? cleanPhone(req.user.phone) : '';
  const allEnquiries = db.getCollection('clientEnquiries');
  const allQuotes = db.getCollection('businessQuotes');

  const myPosted = allEnquiries.filter(e => 
    e.submittedBy === userId || 
    (userPhone && e.phone && cleanPhone(e.phone) === userPhone)
  ).map(e => {
    const count = allQuotes.filter(q => q.enquiryId === e.id).length;
    return { ...e, quotesCount: count };
  });

  const mySubmittedQuotes = allQuotes.filter(q => q.userId === userId).map(q => {
    const parentEnquiry = allEnquiries.find(e => e.id === q.enquiryId);
    return { ...q, enquiryTitle: parentEnquiry?.title || 'व्यावसायिक मागणी', parentStatus: parentEnquiry?.status };
  });

  return sendSuccess(res, 'माझ्या व्यवसाय इन्क्वायरीज व कोट्स', {
    enquiries: myPosted,
    myQuotes: mySubmittedQuotes,
    postedCount: myPosted.length,
    quotesCount: mySubmittedQuotes.length
  });
});

// GET /api/enquiries/:id - Single enquiry details
router.get('/enquiries/:id', (req, res) => {
  const enquiry = db.findById('clientEnquiries', req.params.id);
  if (!enquiry) {
    return sendError(res, 'इन्क्वायरी सापडली नाही.', 'ENQUIRY_NOT_FOUND', 404);
  }
  return sendSuccess(res, 'इन्क्वायरी तपशील', { enquiry });
});

// POST /api/enquiries - Post new B2B Lead / Commercial Demand
router.post('/enquiries', optionalToken, (req, res) => {
  const { title, category, city, district, budget, description, phone, contactName } = req.body;
  const cleanTitle = sanitize(title);
  const cleanP = cleanPhone(phone || req.user?.phone || '');

  if (!cleanTitle) {
    return sendError(res, 'कृपया इन्क्वायरीचे शीर्षक प्रविष्ट करा.', 'MISSING_TITLE', 400);
  }

  const isMod = isModerator(req.user);

  const newEnq = {
    id: `ENQ-${Date.now().toString().slice(-4)}`,
    title: cleanTitle,
    category: sanitize(category) || 'सामान्य व्यवसाय',
    city: sanitize(city) || sanitize(district) || 'पुणे',
    district: sanitize(district) || sanitize(city) || 'पुणे',
    budget: sanitize(budget) || 'चर्चेनुसार',
    description: sanitize(description) || '',
    postedBy: sanitize(contactName) || req.user?.name || 'संबंधित ग्राहक',
    phone: cleanP || '9800000000',
    status: 'सक्रिय (Active)',
    verified: isMod ? true : false,
    verificationBadge: isMod ? '🟢 पडताळणीकृत मागणी (Verified Demand)' : '🟡 समुदाय नोंद (Community Posted)',
    quotesCount: 0,
    submittedBy: req.user?.id || 'GUEST',
    createdAt: new Date().toISOString()
  };

  db.insert('clientEnquiries', newEnq);
  db.addAuditLog('POST_ENQUIRY', req.user?.id || 'GUEST', { enquiryId: newEnq.id, title: cleanTitle });

  return sendSuccess(res, 'नवीन व्यवसाय इन्क्वायरी यशस्वीरीत्या नोंदवली गेली!', { enquiry: newEnq }, 201);
});

// PATCH /api/enquiries/:id/verify - Coordinator requirement verification (Feature 26)
router.patch('/enquiries/:id/verify', authenticateToken, (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'केवळ चॅप्टर समन्वयक किंवा प्रशासक पडताळणी करू शकतात.', 'FORBIDDEN', 403);
  }

  const enquiry = db.findById('clientEnquiries', req.params.id);
  if (!enquiry) {
    return sendError(res, 'इन्क्वायरी सापडली नाही.', 'ENQUIRY_NOT_FOUND', 404);
  }

  const { verificationNotes, isValid } = req.body;
  const updated = db.update('clientEnquiries', req.params.id, {
    verified: isValid !== false,
    verificationBadge: isValid !== false ? '🟢 पडताळणीकृत मागणी (Verified Demand)' : '🟡 समुदाय नोंद (Community Posted)',
    verifiedBy: req.user.id,
    verifierName: req.user.name,
    verificationNotes: sanitize(verificationNotes) || 'चॅप्टर समन्वयकांकडून व्यावसायिक गरज व बजेट पडताळले.',
    verifiedAt: new Date().toISOString()
  });

  db.addAuditLog('VERIFY_ENQUIRY', req.user.id, { enquiryId: req.params.id, verified: updated.verified });

  return sendSuccess(res, 'व्यवसाय मागणी चॅप्टर पडताळणी यशस्वी!', { enquiry: updated });
});

// POST /api/enquiries/:id/quote - Submit proposal quote
router.post('/enquiries/:id/quote', authenticateToken, (req, res) => {
  const enquiry = db.findById('clientEnquiries', req.params.id);
  if (!enquiry) {
    return sendError(res, 'इन्क्वायरी सापडली नाही.', 'ENQUIRY_NOT_FOUND', 404);
  }

  if (enquiry.status && (enquiry.status.includes('पूर्ण') || enquiry.status.includes('Closed'))) {
    return sendError(res, 'या मागणीसाठी सौदेबाजी प्रक्रिया आधीच पूर्ण झाली आहे.', 'ALREADY_CLOSED', 400);
  }

  const { quotedPrice, quoteAmount, proposalNote, proposalNotes, businessName, phone } = req.body;
  const quote = {
    id: `QTE-${Date.now().toString().slice(-4)}`,
    enquiryId: req.params.id,
    userId: req.user.id,
    businessName: sanitize(businessName) || req.user.business || req.user.name,
    ownerName: req.user.name,
    phone: cleanPhone(phone || req.user.phone),
    quotedPrice: sanitize(quotedPrice || quoteAmount) || 'चर्चेनुसार',
    proposalNote: sanitize(proposalNote || proposalNotes) || '',
    status: 'सादर केले (Submitted)',
    submittedAt: new Date().toISOString()
  };

  db.insert('businessQuotes', quote);
  db.update('clientEnquiries', req.params.id, {
    quotesCount: (enquiry.quotesCount || 0) + 1
  });

  db.addAuditLog('SUBMIT_QUOTE', req.user.id, { enquiryId: req.params.id, quoteId: quote.id });

  return sendSuccess(res, 'आपले कोटेशन संबंधित ग्राहकास यशस्वीरीत्या पाठवले गेले!', { quote }, 201);
});

// GET /api/enquiries/:id/quotes - View proposal quotes for this lead
router.get('/enquiries/:id/quotes', optionalToken, (req, res) => {
  const enquiry = db.findById('clientEnquiries', req.params.id);
  if (!enquiry) {
    return sendError(res, 'इन्क्वायरी सापडली नाही.', 'ENQUIRY_NOT_FOUND', 404);
  }

  const isOwner = req.user && (enquiry.submittedBy === req.user.id || (req.user.phone && cleanPhone(enquiry.phone) === cleanPhone(req.user.phone)));
  const isMod = isModerator(req.user);

  const allQuotes = db.getCollection('businessQuotes').filter(q => q.enquiryId === req.params.id);

  if (!isOwner && !isMod) {
    // Mask details for anonymous visitors
    const masked = allQuotes.map(q => ({
      id: q.id,
      businessName: q.businessName,
      quotedPrice: q.quotedPrice,
      status: q.status,
      submittedAt: q.submittedAt,
      isMasked: true
    }));
    return sendSuccess(res, 'सादर केलेल्या कोटेशन्सची संख्या', { quotes: masked, count: masked.length, isMasked: true });
  }

  return sendSuccess(res, 'प्राप्त कोटेशन्स यादी', { quotes: allQuotes, count: allQuotes.length, isMasked: false });
});

// PATCH /api/enquiries/:id/quotes/:quoteId/accept - Poster accepts proposal
router.patch('/enquiries/:id/quotes/:quoteId/accept', authenticateToken, (req, res) => {
  const enquiry = db.findById('clientEnquiries', req.params.id);
  if (!enquiry) {
    return sendError(res, 'इन्क्वायरी सापडली नाही.', 'ENQUIRY_NOT_FOUND', 404);
  }

  const isOwner = enquiry.submittedBy === req.user.id || (req.user.phone && cleanPhone(enquiry.phone) === cleanPhone(req.user.phone));
  if (!isOwner && !isModerator(req.user)) {
    return sendError(res, 'केवळ मागणी नोंदवणारे ग्राहक कोटेशन स्वीकारू शकतात.', 'FORBIDDEN', 403);
  }

  const quote = db.findById('businessQuotes', req.params.quoteId);
  if (!quote || quote.enquiryId !== req.params.id) {
    return sendError(res, 'कोटेशन सापडले नाही.', 'NOT_FOUND', 404);
  }

  const updatedQuote = db.update('businessQuotes', req.params.quoteId, {
    status: 'स्वीकृत (Accepted)',
    acceptedAt: new Date().toISOString()
  });

  const updatedEnquiry = db.update('clientEnquiries', req.params.id, {
    status: 'सौद्यावर चर्चा सुरू (In Deal Discussion)',
    acceptedQuoteId: quote.id,
    acceptedBusinessName: quote.businessName
  });

  db.addAuditLog('ACCEPT_QUOTE', req.user.id, { enquiryId: req.params.id, quoteId: quote.id });

  return sendSuccess(res, 'कोटेशन स्वीकारण्यात आले! संबंधित उद्योजकांशी थेट संपर्क साधा.', {
    quote: updatedQuote,
    enquiry: updatedEnquiry
  });
});

// PATCH /api/enquiries/:id/status - Update lead status (e.g. Deal Closed / Won)
router.patch('/enquiries/:id/status', authenticateToken, (req, res) => {
  const enquiry = db.findById('clientEnquiries', req.params.id);
  if (!enquiry) {
    return sendError(res, 'इन्क्वायरी सापडली नाही.', 'ENQUIRY_NOT_FOUND', 404);
  }

  const isOwner = enquiry.submittedBy === req.user.id || (req.user.phone && cleanPhone(enquiry.phone) === cleanPhone(req.user.phone));
  if (!isOwner && !isModerator(req.user)) {
    return sendError(res, 'केवळ मागणी नोंदवणारे ग्राहक स्थिती बदलू शकतात.', 'FORBIDDEN', 403);
  }

  const { status, closingNotes, finalDealValue } = req.body;
  const updated = db.update('clientEnquiries', req.params.id, {
    status: sanitize(status) || 'यशस्वी सौदा पूर्ण (Deal Closed / Won)',
    closingNotes: sanitize(closingNotes) || 'मराठा व्यावसायिक बांधवांसोबत यशस्वी व्यवहार पूर्ण.',
    finalDealValue: Number(finalDealValue) || undefined,
    closedAt: new Date().toISOString()
  });

  db.addAuditLog('UPDATE_ENQUIRY_STATUS', req.user.id, { enquiryId: req.params.id, status: updated.status });

  return sendSuccess(res, 'व्यवसायिक मागणी स्थिती अद्यतनित झाली!', { enquiry: updated });
});

// ==========================================
// 12. BOOKS & LITERATURE DIRECTORY (/api/books)
// ==========================================
router.get('/books', (req, res) => {
  const { category, search } = req.query;
  let list = db.getCollection('books');

  if (category && category !== 'सर्व') {
    list = list.filter(b => (b.category || '').toLowerCase().includes(category.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(b => 
      (b.title || '').toLowerCase().includes(q) ||
      (b.author || '').toLowerCase().includes(q) ||
      (b.category || '').toLowerCase().includes(q) ||
      (b.desc || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'मराठा ग्रंथ व संदर्भ साहित्य यादी', { books: list, count: list.length });
});

router.get('/books/:id', (req, res) => {
  const book = db.findById('books', req.params.id);
  if (!book) return sendError(res, 'पुस्तक सापडले नाही.', 'NOT_FOUND', 404);
  return sendSuccess(res, 'पुस्तक तपशील', { book });
});

router.post('/books', optionalToken, (req, res) => {
  const { title, author, category, price, pages, desc, image } = req.body;
  if (!title) return sendError(res, 'पुस्तकाचे शीर्षक आवश्यक आहे.', 'MISSING_TITLE', 400);

  const item = {
    id: `BK-${Date.now().toString().slice(-4)}`,
    title: sanitize(title),
    author: sanitize(author) || 'संपादक मंडळ',
    category: sanitize(category) || 'मराठा इतिहास',
    price: sanitize(price) || '₹३५०',
    pages: sanitize(pages) || '३५० पृष्ठे',
    rating: '⭐ ५.० (नवीन संदर्भग्रंथ)',
    desc: sanitize(desc) || 'ऐतिहासिक व सांस्कृतिक संदर्भग्रंथ.',
    image: image || '/assets/images/books/book_shivaji.jpg',
    createdAt: new Date().toISOString()
  };

  db.insert('books', item);
  return sendSuccess(res, 'ग्रंथ यशस्वीरीत्या नोंदवला गेला!', { book: item }, 201);
});

// ==========================================
// 13. MARATHI MOVIES & CINEMA DIRECTORY (/api/movies)
// ==========================================
router.get('/movies', (req, res) => {
  const { category, genre, search } = req.query;
  let list = db.getCollection('movies');

  if (category && category !== 'सर्व') {
    list = list.filter(m => (m.category || '').toLowerCase().includes(category.toLowerCase()));
  }
  if (genre && genre !== 'सर्व') {
    list = list.filter(m => (m.genre || '').toLowerCase().includes(genre.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(m => 
      (m.title || '').toLowerCase().includes(q) ||
      (m.cast || '').toLowerCase().includes(q) ||
      (m.desc || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'दर्जेदार मराठी चित्रपट यादी', { movies: list, count: list.length });
});

router.get('/movies/:id', (req, res) => {
  const movie = db.findById('movies', req.params.id);
  if (!movie) return sendError(res, 'चित्रपट सापडला नाही.', 'NOT_FOUND', 404);
  return sendSuccess(res, 'चित्रपट तपशील', { movie });
});

router.post('/movies', optionalToken, (req, res) => {
  const { title, year, category, genre, cast, desc, trailerId, badge } = req.body;
  if (!title) return sendError(res, 'चित्रपटाचे नाव आवश्यक आहे.', 'MISSING_TITLE', 400);

  const item = {
    id: `MOV-${Date.now().toString().slice(-4)}`,
    title: sanitize(title),
    year: sanitize(year) || '२०२६',
    category: sanitize(category) || 'ऐतिहासिक',
    genre: sanitize(genre) || 'ऐतिहासिक, शौर्यगाथा',
    cast: sanitize(cast) || 'मराठी कलाकार संच',
    desc: sanitize(desc) || 'दर्जेदार मराठी चित्रपट.',
    rating: '⭐ ५.०',
    badge: sanitize(badge) || 'विशेष गौरव',
    trailerId: sanitize(trailerId) || '',
    createdAt: new Date().toISOString()
  };

  db.insert('movies', item);
  return sendSuccess(res, 'चित्रपट यशस्वीरीत्या जोडला गेला!', { movie: item }, 201);
});

// ==========================================
// 14. SOCIAL WORKERS DIRECTORY (/api/social-workers)
// ==========================================
router.get('/social-workers', (req, res) => {
  const { sector, district, search } = req.query;
  let list = db.getCollection('socialWorkers');

  if (sector && sector !== 'सर्व') {
    list = list.filter(s => (s.sector || s.field || '').toLowerCase().includes(sector.toLowerCase()));
  }
  if (district && district !== 'सर्व') {
    list = list.filter(s => (s.district || s.city || '').toLowerCase().includes(district.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(s => 
      (s.name || '').toLowerCase().includes(q) ||
      (s.organization || '').toLowerCase().includes(q) ||
      (s.work || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'मराठा निष्ठावंत समाजसेवक यादी', { socialWorkers: list, count: list.length });
});

router.post('/social-workers', optionalToken, (req, res) => {
  const { name, sector, district, city, phone, work, organization } = req.body;
  if (!name) return sendError(res, 'नाव आवश्यक आहे.', 'MISSING_NAME', 400);

  const item = {
    id: `SW-${Date.now().toString().slice(-4)}`,
    name: sanitize(name),
    sector: sanitize(sector) || 'सामाजिक न्याय व मदत',
    district: sanitize(district) || 'महाराष्ट्र',
    city: sanitize(city) || sanitize(district) || 'महाराष्ट्र',
    phone: phone ? cleanPhone(phone) : '',
    organization: sanitize(organization) || 'मराठा समाजकार्य मंच',
    work: sanitize(work) || 'अविरत समाजसेवा व जनसाहाय्य.',
    verified: true,
    createdAt: new Date().toISOString()
  };

  db.insert('socialWorkers', item);
  return sendSuccess(res, 'समाजसेवक नोंदणी यशस्वी!', { socialWorker: item }, 201);
});

// ==========================================
// 15. HIGHER EDUCATION & SCHOLARSHIPS (/api/scholarships, /api/colleges)
// ==========================================
router.get('/scholarships', (req, res) => {
  const { category, search } = req.query;
  let list = db.getCollection('scholarships');

  if (category && category !== 'सर्व') {
    list = list.filter(s => (s.category || '').toLowerCase().includes(category.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(s => 
      (s.name || s.title || '').toLowerCase().includes(q) ||
      (s.eligibility || '').toLowerCase().includes(q) ||
      (s.provider || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'मराठा विद्यार्थी शिष्यवृत्ती योजना यादी', { scholarships: list, count: list.length });
});

router.get('/colleges', (req, res) => {
  const { stream, city } = req.query;
  let list = db.getCollection('colleges');

  if (stream && stream !== 'सर्व') {
    list = list.filter(c => (c.stream || '').toLowerCase().includes(stream.toLowerCase()));
  }
  if (city && city !== 'सर्व') {
    list = list.filter(c => (c.city || '').toLowerCase().includes(city.toLowerCase()));
  }

  return sendSuccess(res, 'नामांकित महाविद्यालये यादी', { colleges: list, count: list.length });
});

export default router;

