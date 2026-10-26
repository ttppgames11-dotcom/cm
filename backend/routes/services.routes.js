import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize, isValidPhone, cleanPhone } from '../utils/validator.js';
import { all, get, runQuery } from '../../database/database.js';

const router = Router();

const MODERATOR_ROLES = ['superadmin', 'admin', 'ceo', 'center_manager', 'center_admin', 'district_admin', 'taluka_admin'];
const isModerator = (user) => user && MODERATOR_ROLES.includes(user.role);

async function ensureServicesTables() {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT,
      city TEXT,
      phone TEXT NOT NULL,
      experience TEXT,
      description TEXT,
      hourly_rate TEXT,
      rating TEXT DEFAULT '5.0 ★',
      status TEXT DEFAULT 'pending_approval',
      verified INTEGER DEFAULT 0,
      submitted_by TEXT,
      provider_name TEXT,
      moderation_notes TEXT,
      moderated_by TEXT,
      moderator_name TEXT,
      moderated_at TEXT,
      created_at TEXT
    )
  `);

  await runQuery(`
    CREATE TABLE IF NOT EXISTS service_bookings (
      id TEXT PRIMARY KEY,
      service_id TEXT,
      service_category TEXT,
      professional_name TEXT,
      provider_id TEXT,
      customer_name TEXT,
      customer_id TEXT,
      phone TEXT NOT NULL,
      address TEXT,
      requested_date TEXT,
      notes TEXT,
      status TEXT DEFAULT 'new_booking',
      created_at TEXT
    )
  `);
}

function mapServiceRow(s) {
  if (!s) return null;
  return {
    id: s.id,
    name: s.name,
    category: s.category,
    location: s.location,
    city: s.city,
    phone: s.phone,
    experience: s.experience,
    description: s.description,
    hourlyRate: s.hourly_rate || s.hourlyRate || 'वाजवी दर',
    rating: s.rating || '5.0 ★',
    status: s.status,
    verified: Boolean(s.verified),
    submittedBy: s.submitted_by || s.submittedBy,
    providerName: s.provider_name || s.providerName || s.name,
    moderationNotes: s.moderation_notes || s.moderationNotes,
    moderatedBy: s.moderated_by || s.moderatedBy,
    moderatorName: s.moderator_name || s.moderatorName,
    moderatedAt: s.moderated_at || s.moderatedAt,
    createdAt: s.created_at || s.createdAt
  };
}

function mapBookingRow(b) {
  if (!b) return null;
  return {
    id: b.id,
    serviceId: b.service_id || b.serviceId,
    serviceCategory: b.service_category || b.serviceCategory,
    professionalName: b.professional_name || b.professionalName,
    providerId: b.provider_id || b.providerId,
    customerName: b.customer_name || b.customerName,
    customerId: b.customer_id || b.customerId,
    phone: b.phone,
    address: b.address,
    requestedDate: b.requested_date || b.requestedDate,
    notes: b.notes,
    status: b.status,
    createdAt: b.created_at || b.createdAt
  };
}

// GET /api/services - List approved local service professionals from SQL DB
router.get('/', optionalToken, async (req, res) => {
  try {
    await ensureServicesTables();
    const { category, location, search, includePending } = req.query;

    const countRes = await get('SELECT COUNT(*) as count FROM services');
    if (!countRes || Number(countRes.count) === 0) {
      const seedServices = [
        { id: 'SRV-01', name: 'ॲड. संग्रामसिंह माने', category: 'कायदेशीर सल्ला (Legal)', location: 'पुणे जिल्हा न्यायालय', city: 'पुणे', phone: '+91 98220 88771', rating: '4.9 ★', verified: 1, status: 'approved' },
        { id: 'SRV-02', name: 'सीए. राहुल जाधव आणि असोसिएट्स', category: 'सीए व जीएसटी कन्सल्टंट', location: 'डेक्कन, पुणे', city: 'पुणे', phone: '+91 98900 11223', rating: '5.0 ★', verified: 1, status: 'approved' },
        { id: 'SRV-03', name: 'शिवशक्ती इलेक्ट्रिकल व होम सर्व्हिसेस', category: 'इलेक्ट्रिशियन व सोलर इन्स्टॉलेशन', location: 'सातारा', city: 'सातारा', phone: '+91 94220 33445', rating: '4.8 ★', verified: 1, status: 'approved' },
        { id: 'SRV-04', name: 'सह्याद्री इंटिरिअर व प्लंबिंग सोल्यूशन्स', category: 'प्लंबिंग व इंटिरिअर वर्क', location: 'नवी मुंबई', city: 'नवी मुंबई', phone: '+91 98200 44556', rating: '4.7 ★', verified: 1, status: 'approved' }
      ];

      for (const s of seedServices) {
        await runQuery(`
          INSERT INTO services (id, name, category, location, city, phone, rating, verified, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [s.id, s.name, s.category, s.location, s.city, s.phone, s.rating, s.verified, s.status, new Date().toISOString()]);
        db.insert('services', s);
      }
    }

    let sql = 'SELECT * FROM services WHERE 1=1';
    const params = [];

    const isMod = isModerator(req.user);
    if (!isMod || includePending !== 'true') {
      sql += " AND (status = 'approved' OR verified = 1)";
    }

    if (category && category !== 'सर्व') {
      sql += ' AND lower(category) LIKE ?';
      params.push(`%${category.toLowerCase()}%`);
    }

    if (location && location !== 'सर्व') {
      sql += ' AND (lower(location) LIKE ? OR lower(city) LIKE ?)';
      params.push(`%${location.toLowerCase()}%`, `%${location.toLowerCase()}%`);
    }

    if (search) {
      const q = `%${search.toLowerCase()}%`;
      sql += ' AND (lower(name) LIKE ? OR lower(category) LIKE ? OR lower(location) LIKE ? OR lower(city) LIKE ?)';
      params.push(q, q, q, q);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await all(sql, params);
    const services = (rows || []).map(mapServiceRow);

    return sendSuccess(res, 'स्थानिक सेवा व्यावसायिक यादी', { services, count: services.length });
  } catch (err) {
    console.error('[Services Get Error]:', err);
    return sendError(res, 'सेवा यादी लोड करताना त्रुटी आली: ' + err.message, 'SERVICES_FETCH_ERROR', 500);
  }
});

// GET /api/services/my - Service provider's own listings with booking lead counts
router.get('/my', authenticateToken, async (req, res) => {
  try {
    await ensureServicesTables();
    const userId = req.user.id;
    const userPhone = req.user.phone ? cleanPhone(req.user.phone) : '';

    let rows = await all(`
      SELECT * FROM services 
      WHERE submitted_by = ? OR phone = ? OR phone LIKE ?
      ORDER BY created_at DESC
    `, [userId, userPhone, `%${userPhone.slice(-10)}%`]);

    const myServices = [];
    for (const row of rows || []) {
      const mapped = mapServiceRow(row);
      const countRes = await get('SELECT COUNT(*) as cnt FROM service_bookings WHERE service_id = ?', [mapped.id]);
      mapped.bookingsCount = Number(countRes?.cnt || 0);
      myServices.push(mapped);
    }

    return sendSuccess(res, 'माझ्या सेवा प्रोफाइल्स व बुकिंग यादी', { services: myServices, count: myServices.length });
  } catch (err) {
    return sendError(res, 'माझ्या सेवा लोड करताना त्रुटी आली: ' + err.message, 'MY_SERVICES_ERROR', 500);
  }
});

// GET /api/services/admin/pending - Moderator review queue
router.get('/admin/pending', authenticateToken, async (req, res) => {
  try {
    if (!isModerator(req.user)) {
      return sendError(res, 'प्रशासक किंवा केंद्र व्यवस्थापक परवानगी आवश्यक.', 'FORBIDDEN', 403);
    }

    await ensureServicesTables();
    const rows = await all("SELECT * FROM services WHERE status = 'pending_approval' OR verified = 0 ORDER BY created_at DESC");
    const pending = (rows || []).map(mapServiceRow);

    return sendSuccess(res, 'प्रलंबित सेवा पडताळणी यादी', { services: pending, count: pending.length });
  } catch (err) {
    return sendError(res, 'पडताळणी यादी लोड करताना त्रुटी आली: ' + err.message, 'PENDING_SERVICES_ERROR', 500);
  }
});

const DEFAULT_CATEGORIES = [
  { id: 'home_repairs', name: 'इलेक्ट्रिशियन व घरगुती दुरुस्ती', icon: '⚡', description: 'प्लंबिंग, वायरिंग, एसी, सुतारकाम व गृहदुरुस्ती' },
  { id: 'healthcare', name: 'आरोग्य व वैद्यकीय सेवा', icon: '🩺', description: 'होम नर्सिंग, पॅथॉलॉजी, फिजिओथेरपी व औषध पुरवठा' },
  { id: 'education', name: 'शिक्षक, ट्यूटर व करिअर मार्गदर्शक', icon: '🎓', description: 'शालेय ट्यूशन, स्पर्धा परीक्षा, संगीत व भाषा वर्ग' },
  { id: 'transport', name: 'ड्रायव्हर्स व वाहतूक सेवा', icon: '🚗', description: 'कॅब, मालवाहतूक, ट्रॅव्हल्स व ड्रायव्हर सेवा' },
  { id: 'legal_finance', name: 'वकील, सीए व कर सल्लागार', icon: '⚖️', description: 'कायदेशीर सल्ला, जीएसटी, इन्कम टॅक्स व ऑडिट' },
  { id: 'technology', name: 'सॉफ्टवेअर, डिझाइन व आयटी', icon: '💻', description: 'वेबसाईट, ॲप डेव्हलपमेंट, डिजिटल मार्केटिंग' },
  { id: 'agriculture', name: 'कृषी, ट्रॅक्टर व शेती सेवा', icon: '🌾', description: 'ट्रॅक्टर भाडे, खते, कीटकनाशके व शेती मार्गदर्शन' },
  { id: 'events_volunteers', name: 'इव्हेंट, केटरिंग व स्वयंसेवक', icon: '🤝', description: 'मंडप, ध्वनी, जेवण व्यवस्था, छायाचित्रण' },
  { id: 'b2b_consulting', name: 'B2B उद्योग व कन्सल्टिंग', icon: '💼', description: 'उद्योग उभारणी, परवाने व व्यावसायिक मार्गदर्शन' },
  { id: 'general_seva', name: 'सामान्य जनसेवा व मदत', icon: '🛠️', description: 'इतर सर्व स्थानिक सेवा व सामाजिक सहकार्य' }
];

// GET /api/services/categories - List available service categories
router.get('/categories', async (req, res) => {
  try {
    await runQuery(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        description TEXT
      )
    `);
    let rows = await all('SELECT * FROM service_categories');
    if (!rows || rows.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await runQuery('INSERT OR IGNORE INTO service_categories (id, name, icon, description) VALUES (?, ?, ?, ?)', [cat.id, cat.name, cat.icon, cat.description]);
      }
      rows = await all('SELECT * FROM service_categories');
    }
    return sendSuccess(res, 'सेवा प्रवर्ग यादी', { categories: rows.length ? rows : DEFAULT_CATEGORIES, count: rows.length || DEFAULT_CATEGORIES.length });
  } catch (err) {
    return sendSuccess(res, 'सेवा प्रवर्ग यादी (डिफॉल्ट)', { categories: DEFAULT_CATEGORIES, count: DEFAULT_CATEGORIES.length });
  }
});

// GET /api/services/enquiries - List service enquiries
router.get('/enquiries', optionalToken, async (req, res) => {
  try {
    const rows = await all('SELECT * FROM client_enquiries ORDER BY created_at DESC LIMIT 50');
    return sendSuccess(res, 'सेवा विचारणा यादी', { enquiries: rows || [], count: (rows || []).length });
  } catch (err) {
    return sendError(res, 'विचारणा यादी लोड करताना त्रुटी: ' + err.message, 'ENQUIRIES_FETCH_ERROR', 500);
  }
});

// POST /api/services/enquiries - Client posts general service enquiry
router.post('/enquiries', optionalToken, async (req, res) => {
  try {
    const { clientName, clientPhone, clientEmail, serviceCategory, location, district, message } = req.body;
    if (!clientName || !clientPhone || !message) {
      return sendError(res, 'नाव, संपर्क क्रमांक आणि विचारणा आवश्यक आहेत.', 'FIELDS_REQUIRED', 400);
    }

    const enquiryId = `ENQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO client_enquiries (id, client_name, client_phone, client_email, service_category, location, district, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
    `, [enquiryId, clientName, cleanPhone(clientPhone), clientEmail || '', serviceCategory || 'General', location || '', district || 'महाराष्ट्र', message, now]);

    db.insert('clientEnquiries', {
      id: enquiryId,
      clientName,
      clientPhone,
      clientEmail,
      serviceCategory,
      location,
      district,
      message,
      status: 'open',
      createdAt: now
    });

    return sendSuccess(res, 'आपली सेवा विचारणा यशस्वीरित्या पाठवली गेली! संबंधित व्यावसायिक लवकरच संपर्क करतील.', {
      enquiryId,
      status: 'open'
    }, 201);
  } catch (err) {
    return sendError(res, 'विचारणा नोंदवताना त्रुटी: ' + err.message, 'ENQUIRY_ERROR', 500);
  }
});

// POST /api/services/quotes - Submit business quote
router.post('/quotes', authenticateToken, async (req, res) => {
  try {
    const { enquiryId, businessId, businessName, amount, details } = req.body;
    if (!enquiryId || !amount) {
      return sendError(res, 'enquiryId आणि रक्कम देणे आवश्यक आहे.', 'FIELDS_REQUIRED', 400);
    }

    const quoteId = `QTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO business_quotes (id, enquiry_id, business_id, business_name, amount, details, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'submitted', ?)
    `, [quoteId, enquiryId, businessId || req.user.id, businessName || req.user.name, Number(amount), details || '', now]);

    db.insert('businessQuotes', {
      id: quoteId,
      enquiryId,
      businessId: businessId || req.user.id,
      businessName: businessName || req.user.name,
      amount: Number(amount),
      details,
      status: 'submitted',
      createdAt: now
    });

    return sendSuccess(res, 'आपला व्यावसायिक दरपत्रक कोटेशन (Quote) यशस्वीरीत्या सादर केला गेला!', { quoteId }, 201);
  } catch (err) {
    return sendError(res, 'कोटेशन नोंदवताना त्रुटी: ' + err.message, 'QUOTE_ERROR', 500);
  }
});

// GET /api/services/quotes/:enquiryId - Get quotes for an enquiry
router.get('/quotes/:enquiryId', optionalToken, async (req, res) => {
  try {
    const rows = await all(
      'SELECT * FROM business_quotes WHERE enquiry_id = ? ORDER BY created_at DESC',
      [req.params.enquiryId]
    );
    return sendSuccess(res, 'कोटेशन्स यादी', { quotes: rows || [], count: (rows || []).length });
  } catch (err) {
    return sendError(res, 'कोटेशन लोड करताना त्रुटी: ' + err.message, 'QUOTES_FETCH_ERROR', 500);
  }
});

// GET /api/services/:id - Get specific service
router.get('/:id', async (req, res) => {
  try {
    await ensureServicesTables();
    const row = await get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!row) {
      return sendError(res, 'सेवा व्यावसायिक सापडला नाही.', 'SERVICE_NOT_FOUND', 404);
    }
    return sendSuccess(res, 'सेवा व्यावसायिक तपशील', { service: mapServiceRow(row) });
  } catch (err) {
    return sendError(res, 'सेवा तपशील मिळवताना त्रुटी: ' + err.message, 'SERVICE_FETCH_ERROR', 500);
  }
});

// POST /api/services - Submit new service listing to SQL DB
router.post('/', optionalToken, async (req, res) => {
  try {
    const { name, category, location, city, phone, experience, description, hourlyRate } = req.body;
    const cleanName = sanitize(name);
    const cleanCat = sanitize(category);
    const cleanedPhone = cleanPhone(phone);

    if (!cleanName || !cleanCat || !cleanedPhone) {
      return sendError(res, 'कृपया नाव, सेवा प्रकार आणि संपर्क नंबर प्रविष्ट करा.', 'MISSING_FIELDS', 400);
    }

    if (!isValidPhone(cleanedPhone)) {
      return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
    }

    await ensureServicesTables();
    const isMod = isModerator(req.user);
    const status = isMod ? 'approved' : 'pending_approval';
    const verified = isMod ? 1 : 0;
    const id = `SRV-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const loc = sanitize(location) || 'महाराष्ट्र';
    const cty = sanitize(city) || sanitize(location) || 'पुणे';
    const exp = sanitize(experience) || '५+ वर्षे अनुभव';
    const desc = sanitize(description) || 'विश्वासू व प्रामाणिक मराठा सेवा व्यावसायिक.';
    const rate = sanitize(hourlyRate) || 'वाजवी दर';
    const rating = '5.0 ★ (नवीन व्यावसायिक)';
    const submittedBy = req.user?.id || 'GUEST';
    const providerName = req.user?.name || cleanName;

    await runQuery(`
      INSERT INTO services (
        id, name, category, location, city, phone, experience, description,
        hourly_rate, rating, status, verified, submitted_by, provider_name, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, cleanName, cleanCat, loc, cty, cleanedPhone, exp, desc, rate, rating, status, verified, submittedBy, providerName, now]);

    const created = await get('SELECT * FROM services WHERE id = ?', [id]);
    const mapped = mapServiceRow(created);

    // Sync to realtimeDb
    db.insert('services', mapped);
    db.addAuditLog('REGISTER_SERVICE', submittedBy, { serviceId: id, name: cleanName, status });

    return sendSuccess(res, isMod ? 'सेवा प्रोफाइल डेटाबेसमध्ये यशस्वीरीत्या जोडले गेले!' : 'सेवा नोंदणी विनंती डेटाबेसमध्ये सुरक्षित सेव्ह झाली! प्रशासकीय पडताळणीनंतर सक्रिय होईल.', { service: mapped }, 201);
  } catch (err) {
    console.error('Service insert error:', err);
    return sendError(res, 'सेवा नोंदणी करताना अडचण आली: ' + err.message, 'SERVICE_INSERT_ERROR', 500);
  }
});

// PATCH /api/services/:id/moderation - Moderate service provider in SQL DB
router.patch('/:id/moderation', authenticateToken, async (req, res) => {
  try {
    if (!isModerator(req.user)) {
      return sendError(res, 'केवळ प्रशासक किंवा केंद्र व्यवस्थापक सेवा पडताळणी करू शकतात.', 'FORBIDDEN', 403);
    }

    const { status, notes, verified } = req.body;
    if (!['approved', 'rejected', 'pending_approval'].includes(status)) {
      return sendError(res, 'अवैध स्थिती मूल्य. (approved, rejected, pending_approval)', 'INVALID_STATUS', 400);
    }

    await ensureServicesTables();
    const service = await get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!service) {
      return sendError(res, 'सेवा व्यावसायिक सापडला नाही.', 'NOT_FOUND', 404);
    }

    const verifiedVal = verified !== undefined ? (verified ? 1 : 0) : (status === 'approved' ? 1 : 0);
    const modNotes = sanitize(notes) || '';
    const now = new Date().toISOString();

    await runQuery(`
      UPDATE services
      SET status = ?, verified = ?, moderation_notes = ?, moderated_by = ?, moderator_name = ?, moderated_at = ?
      WHERE id = ?
    `, [status, verifiedVal, modNotes, req.user.id, req.user.name, now, req.params.id]);

    const updated = await get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    const mapped = mapServiceRow(updated);

    // Sync to realtimeDb
    db.update('services', req.params.id, mapped);
    db.addAuditLog('MODERATE_SERVICE', req.user.id, { serviceId: req.params.id, status, verified: Boolean(verifiedVal) });

    return sendSuccess(res, `सेवा स्थिती यशस्वीरीत्या '${status === 'approved' ? 'मंजूर' : 'अस्वीकृत'}' केली.`, { service: mapped });
  } catch (err) {
    return sendError(res, 'पडताळणी करताना त्रुटी आली: ' + err.message, 'MODERATION_ERROR', 500);
  }
});

// POST /api/services/booking or /api/services/:id/booking - Book a service and persist in SQL DB
router.post(['/booking', '/:id/booking'], optionalToken, async (req, res) => {
  try {
    const serviceIdParam = req.params.id || req.body.serviceId || '';
    const { serviceCategory, professionalName, requestedDate, address, phone, requirementNotes, customerName } = req.body;
    const cleanCat = sanitize(serviceCategory);
    const cleanedPhone = cleanPhone(phone || req.user?.phone || '');

    if (!cleanedPhone) {
      return sendError(res, 'कृपया संपर्क नंबर प्रविष्ट करा.', 'MISSING_FIELDS', 400);
    }

    if (!isValidPhone(cleanedPhone)) {
      return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
    }

    await ensureServicesTables();
    let service = null;
    if (serviceIdParam) {
      service = await get('SELECT * FROM services WHERE id = ?', [serviceIdParam]);
    }

    const bookingId = `SBK-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();
    const finalServiceId = service?.id || serviceIdParam || 'GEN';
    const finalCategory = cleanCat || service?.category || 'सामान्य सेवा';
    const finalProfName = service?.name || sanitize(professionalName) || 'नजीकचा मराठा सेवा व्यावसायिक';
    const providerId = service?.submitted_by || '';
    const custName = sanitize(customerName) || req.user?.name || 'सन्माननीय ग्राहक';
    const custId = req.user?.id || 'GUEST';
    const addr = sanitize(address) || 'महाराष्ट्र';
    const reqDate = sanitize(requestedDate) || 'लवकरात लवकर (ASAP)';
    const notes = sanitize(requirementNotes) || '';

    await runQuery(`
      INSERT INTO service_bookings (
        id, service_id, service_category, professional_name, provider_id,
        customer_name, customer_id, phone, address, requested_date, notes, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new_booking', ?)
    `, [bookingId, finalServiceId, finalCategory, finalProfName, providerId, custName, custId, cleanedPhone, addr, reqDate, notes, now]);

    const createdBooking = await get('SELECT * FROM service_bookings WHERE id = ?', [bookingId]);
    const mapped = mapBookingRow(createdBooking);

    // Sync to realtimeDb
    db.insert('serviceBookings', mapped);
    db.addAuditLog('BOOK_SERVICE', custId, { bookingId, serviceId: finalServiceId });

    return sendSuccess(res, 'सेवा बुकिंग डेटाबेसमध्ये यशस्वीरित्या साठवले! व्यावसायिक लवकरच आपल्याशी संपर्क करतील.', { booking: mapped }, 201);
  } catch (err) {
    return sendError(res, 'सेवा बुकिंग करताना अडचण आली: ' + err.message, 'BOOKING_ERROR', 500);
  }
});

// GET /api/services/:id/bookings - View bookings from SQL DB
router.get('/:id/bookings', authenticateToken, async (req, res) => {
  try {
    await ensureServicesTables();
    const service = await get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!service) {
      return sendError(res, 'सेवा व्यावसायिक सापडला नाही.', 'SERVICE_NOT_FOUND', 404);
    }

    const userPhone = req.user.phone ? cleanPhone(req.user.phone) : '';
    const isOwner = service.submitted_by === req.user.id || 
                    (userPhone && service.phone && cleanPhone(service.phone) === userPhone);

    if (!isOwner && !isModerator(req.user)) {
      return sendError(res, 'केवळ सेवा प्रदाता किंवा प्रशासक बुकिंग चौकशी पाहू शकतात.', 'FORBIDDEN', 403);
    }

    const rows = await all('SELECT * FROM service_bookings WHERE service_id = ? ORDER BY created_at DESC', [req.params.id]);
    const bookings = (rows || []).map(mapBookingRow);

    return sendSuccess(res, 'सेवा बुकिंग चौकशी यादी', { bookings, count: bookings.length });
  } catch (err) {
    return sendError(res, 'बुकिंग यादी लोड करताना अडचण: ' + err.message, 'BOOKINGS_FETCH_ERROR', 500);
  }
});

// GET /api/services/categories - List all service categories
router.get('/categories', async (req, res) => {
  try {
    let rows = await all('SELECT * FROM service_categories WHERE status = "active" ORDER BY name ASC');
    if (!rows || rows.length === 0) {
      const defaults = [
        { id: 'SCAT-01', name: 'कायदेशीर सल्ला (Legal)', name_en: 'Legal Counsel', icon: '⚖️' },
        { id: 'SCAT-02', name: 'सीए, कर व ऑडिट (Tax & Audit)', name_en: 'CA & Tax Audit', icon: '📊' },
        { id: 'SCAT-03', name: 'प्लंबिंग व जलव्यवस्थापन', name_en: 'Plumbing & Water', icon: '🚰' },
        { id: 'SCAT-04', name: 'इलेक्ट्रिशियन व सोलर इन्स्टॉलेशन', name_en: 'Electrician & Solar', icon: '⚡' },
        { id: 'SCAT-05', name: 'बांधकाम, आर्किटेक्ट व इंटिरिअर', name_en: 'Construction & Interior', icon: '🏗️' },
        { id: 'SCAT-06', name: 'कृषी सल्ला व आधुनिक अवजारे', name_en: 'Agri Advisory & Machinery', icon: '🌾' },
        { id: 'SCAT-07', name: 'वाहतूक, ट्रॅव्हल्स व मालवाहतूक', name_en: 'Transport & Logistics', icon: '🚚' },
        { id: 'SCAT-08', name: 'आरोग्य, परिचारिका व रुग्णसेवा', name_en: 'Healthcare & Nursing', icon: '🏥' },
        { id: 'SCAT-09', name: 'शिक्षण, करिअर व कोचिंग', name_en: 'Education & Coaching', icon: '🎓' },
        { id: 'SCAT-10', name: 'इव्हेंट, मांडव व कॅटरिंग', name_en: 'Events & Catering', icon: '🎪' }
      ];
      for (const d of defaults) {
        await runQuery(
          'INSERT OR IGNORE INTO service_categories (id, name, name_en, icon, status, created_at) VALUES (?, ?, ?, ?, "active", ?)',
          [d.id, d.name, d.name_en, d.icon, new Date().toISOString()]
        );
      }
      rows = await all('SELECT * FROM service_categories WHERE status = "active" ORDER BY name ASC');
    }
    return sendSuccess(res, 'सेवा प्रवर्ग यादी', { categories: rows, count: rows.length });
  } catch (err) {
    return sendError(res, 'प्रवर्ग यादी मिळवताना त्रुटी: ' + err.message, 'CATEGORIES_ERROR', 500);
  }
});

// GET /api/services/:id/reviews - Get reviews for a service
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await all(
      'SELECT * FROM service_reviews WHERE service_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );
    return sendSuccess(res, 'सेवा परीक्षणे (Reviews)', { reviews: reviews || [], count: (reviews || []).length });
  } catch (err) {
    return sendError(res, 'परीक्षणे मिळवताना त्रुटी: ' + err.message, 'REVIEWS_ERROR', 500);
  }
});

// POST /api/services/:id/reviews - Submit review for a service
router.post('/:id/reviews', optionalToken, async (req, res) => {
  try {
    const { rating, comment, reviewerName } = req.body;
    if (!rating) return sendError(res, 'रेटिंग देणे आवश्यक आहे (१ ते ५).', 'RATING_REQUIRED', 400);

    const reviewId = `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const reviewer = reviewerName || req.user?.name || 'नागरिक / ग्राहक';
    const reviewerId = req.user?.id || 'anonymous';
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO service_reviews (id, service_id, reviewer_id, reviewer_name, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [reviewId, req.params.id, reviewerId, reviewer, Number(rating) || 5, comment || '', now]);

    return sendSuccess(res, 'आपले मत/परीक्षण यशस्वीरीत्या नोंदवले गेले! धन्यवाद.', {
      review: { id: reviewId, serviceId: req.params.id, rating, comment, reviewerName: reviewer, createdAt: now }
    }, 201);
  } catch (err) {
    return sendError(res, 'परीक्षण नोंदवताना त्रुटी: ' + err.message, 'REVIEW_SUBMIT_ERROR', 500);
  }
});

export default router;
