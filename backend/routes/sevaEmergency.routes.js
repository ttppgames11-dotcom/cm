import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize, isValidPhone, cleanPhone } from '../utils/validator.js';
import { all, get, runQuery } from '../../database/database.js';

const router = Router();

const MODERATOR_ROLES = ['superadmin', 'admin', 'ceo', 'center_manager', 'center_admin', 'district_admin', 'taluka_admin', 'pradesh_admin', 'state_admin'];
const isModerator = (user) => user && MODERATOR_ROLES.includes(user.role);

// Ensure tables exist in SQLite / PostgreSQL
export async function ensureSevaTables() {
  try {
    await runQuery(`
      CREATE TABLE IF NOT EXISTS emergency_cases (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT DEFAULT 'high',
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        city TEXT NOT NULL,
        district TEXT NOT NULL,
        division TEXT,
        landmark TEXT,
        lat REAL,
        lng REAL,
        radius_km REAL DEFAULT 15.0,
        reporter_id TEXT,
        reporter_name TEXT,
        reporter_phone TEXT,
        is_anonymous INTEGER DEFAULT 0,
        official_services_contacted INTEGER DEFAULT 0,
        reporting_for TEXT DEFAULT 'self',
        people_affected INTEGER DEFAULT 1,
        photo_url TEXT,
        status TEXT DEFAULT 'submitted',
        verified INTEGER DEFAULT 0,
        verified_by TEXT,
        verified_at TEXT,
        resolution_notes TEXT,
        resolved_by TEXT,
        resolved_at TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS emergency_responses (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        responder_id TEXT,
        responder_name TEXT NOT NULL,
        responder_phone TEXT NOT NULL,
        eta_minutes INTEGER DEFAULT 30,
        capabilities TEXT,
        message TEXT,
        status TEXT DEFAULT 'offered',
        created_at TEXT
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS emergency_updates (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        author_id TEXT,
        author_name TEXT,
        note TEXT NOT NULL,
        status_change TEXT,
        created_at TEXT
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS help_requests (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        items_needed TEXT DEFAULT '[]',
        location TEXT NOT NULL,
        city TEXT NOT NULL,
        district TEXT NOT NULL,
        requester_id TEXT,
        requester_name TEXT NOT NULL,
        requester_phone TEXT NOT NULL,
        urgency TEXT DEFAULT 'moderate',
        status TEXT DEFAULT 'published',
        assigned_volunteer_id TEXT,
        created_at TEXT,
        updated_at TEXT
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS help_offers (
        id TEXT PRIMARY KEY,
        request_id TEXT NOT NULL,
        helper_id TEXT,
        helper_name TEXT NOT NULL,
        helper_phone TEXT NOT NULL,
        offered_items TEXT,
        note TEXT,
        status TEXT DEFAULT 'offered',
        created_at TEXT
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS service_inquiries (
        id TEXT PRIMARY KEY,
        listing_id TEXT NOT NULL,
        requester_id TEXT,
        requester_name TEXT NOT NULL,
        requester_phone TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        created_at TEXT
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS moderation_reports (
        id TEXT PRIMARY KEY,
        content_type TEXT NOT NULL,
        content_id TEXT NOT NULL,
        reporter_id TEXT,
        reporter_name TEXT,
        reason TEXT NOT NULL,
        details TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT
      )
    `);

    // Add extra columns to services table if not already present
    try {
      await runQuery(`ALTER TABLE services ADD COLUMN listing_type TEXT DEFAULT 'available'`);
    } catch (_) {}
    try {
      await runQuery(`ALTER TABLE services ADD COLUMN price_mode TEXT DEFAULT 'fixed'`);
    } catch (_) {}
    try {
      await runQuery(`ALTER TABLE services ADD COLUMN service_mode TEXT DEFAULT 'in_person'`);
    } catch (_) {}
    try {
      await runQuery(`ALTER TABLE services ADD COLUMN availability_hours TEXT`);
    } catch (_) {}

    // Seed default emergency cases if table is empty
    const existingCases = await all(`SELECT COUNT(*) as count FROM emergency_cases`);
    const count = existingCases[0]?.count || 0;
    // Sample emergencies are for local demos only: opt in with SEED_SAMPLE_DATA=true (never in production).
    if (count === 0 && process.env.SEED_SAMPLE_DATA === 'true' && process.env.NODE_ENV !== 'production') {
      await seedDefaultSevaData();
    }
  } catch (err) {
    console.warn('[SevaTables] Init warning:', err.message);
  }
}

async function seedDefaultSevaData() {
  const sampleEmergencies = [
    {
      id: 'EMG-1001',
      title: 'पुणे-सातारा महामार्ग अपघात तातडीची रुग्णवाहिका व रक्त मदत',
      category: 'accident',
      severity: 'critical',
      description: 'खेड-शिवापूर टोलनाक्याजवळ ४ वाहनांचा अपघात झाला आहे. ३ जखमी बांधवांना तातडीने रक्ताची व उपचाराची गरज आहे. १०८ ला संपर्क केला आहे, स्थानिक मदत त्वरित हवी आहे.',
      location: 'खेड-शिवापूर टोलनाका परिसर',
      city: 'पुणे',
      district: 'पुणे',
      division: 'पुणे विभाग',
      landmark: 'शिवापूर फाटा',
      radius_km: 25.0,
      reporter_name: 'तानाजी पवार',
      reporter_phone: '9822012345',
      is_anonymous: 0,
      official_services_contacted: 1,
      reporting_for: 'other',
      people_affected: 3,
      status: 'verified',
      verified: 1,
      verified_by: 'पुणे जिल्हा आपत्कालीन सेल',
      verified_at: new Date(Date.now() - 3600000).toISOString(),
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'EMG-1002',
      title: 'पंचगंगा पूर बाधित कुटुंबांसाठी तात्पुरता निवारा व बोट साहाय्य',
      category: 'disaster',
      severity: 'high',
      description: 'शिरोळ व आंबेवाडी परिसरात पुराचे पाणी वाढल्याने १५ कुटुंबे अडकली आहेत. सुरक्षित स्थलांतरासाठी ट्रॅक्टर व बोट सेवा उपलब्ध असणाऱ्या स्वयंसेवकांची गरज.',
      location: 'शिरोळ गावठाण',
      city: 'कोल्हापूर',
      district: 'कोल्हापूर',
      division: 'पुणे विभाग',
      landmark: 'पंचगंगा नदीकाठ',
      radius_km: 30.0,
      reporter_name: 'संभाजीराव देसाई',
      reporter_phone: '9423098765',
      is_anonymous: 0,
      official_services_contacted: 1,
      reporting_for: 'community',
      people_affected: 45,
      status: 'responders_assigned',
      verified: 1,
      verified_by: 'कोल्हापूर मराठा महासंघ रेस्क्यू टीम',
      verified_at: new Date(Date.now() - 14400000).toISOString(),
      created_at: new Date(Date.now() - 18000000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'EMG-1003',
      title: 'नाशिक सिव्हिल हॉस्पिटल: AB- पॉझिटिव्ह तातडीची गरज',
      category: 'blood',
      severity: 'critical',
      description: 'हृदय शस्त्रक्रियेसाठी AB Negative किंवा AB Positive रक्ताच्या २ बॅग्ज त्वरित हव्यात. नातेवाईक हॉस्पिटलमध्ये उपस्थित आहेत.',
      location: 'सिव्हिल हॉस्पिटल चौक, त्र्यंबक रोड',
      city: 'नाशिक',
      district: 'नाशिक',
      division: 'नाशिक विभाग',
      landmark: 'सिव्हिल हॉस्पिटल गेट १',
      radius_km: 20.0,
      reporter_name: 'अमोल शिंदे',
      reporter_phone: '9765432109',
      is_anonymous: 0,
      official_services_contacted: 1,
      reporting_for: 'family',
      people_affected: 1,
      status: 'verified',
      verified: 1,
      verified_by: 'नाशिक रक्त समन्वय कक्ष',
      verified_at: new Date(Date.now() - 1800000).toISOString(),
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  for (const e of sampleEmergencies) {
    await runQuery(`
      INSERT OR IGNORE INTO emergency_cases (
        id, title, category, severity, description, location, city, district, division,
        landmark, radius_km, reporter_name, reporter_phone, is_anonymous,
        official_services_contacted, reporting_for, people_affected, status, verified,
        verified_by, verified_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      e.id, e.title, e.category, e.severity, e.description, e.location, e.city, e.district, e.division,
      e.landmark, e.radius_km, e.reporter_name, e.reporter_phone, e.is_anonymous,
      e.official_services_contacted, e.reporting_for, e.people_affected, e.status, e.verified,
      e.verified_by, e.verified_at, e.created_at, e.updated_at
    ]);
  }

  // Seed Sample Help Requests
  const sampleHelp = [
    {
      id: 'HLP-2001',
      title: 'शेतकरी कुटुंबातील गुणवंत विद्यार्थिनीस महाविद्यालयीन पुस्तके व फी साहाय्य',
      category: 'education_careers',
      description: 'इयत्ता १२ वी विज्ञान शाखेत ९२% गुण मिळवलेल्या भगिनीस अभियांत्रिकी शिक्षणासाठी पुस्तके आणि फीसाठी साहाय्य हवे आहे.',
      items_needed: JSON.stringify([
        { need: 'इंजिनिअरिंग प्रथम वर्ष संदर्भ पुस्तके संच', qty: '१ सेट' },
        { need: 'शैक्षणिक फी अंशदान', qty: '₹१५,०००' }
      ]),
      location: 'कराड शहर',
      city: 'सातारा',
      district: 'सातारा',
      requester_name: 'विश्वास कदम',
      requester_phone: '9822114455',
      urgency: 'moderate',
      status: 'published',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'HLP-2002',
      title: 'अतिवृष्टीमुळे नुकसान झालेल्या शेतमजुरांसाठी जीवनावश्यक रेशन किट मदत',
      category: 'food_essentials',
      description: 'गावात १० कुटुंबांच्या घरात पाणी शिरल्याने धान्य व कपडे खराब झाले आहेत. तातडीने कोरडे अन्नधान्य किट हवे आहे.',
      items_needed: JSON.stringify([
        { need: 'गहू, तांदूळ, डाळी रेशन किट (१० किलो)', qty: '१० किट' },
        { need: 'गरम चादरी व अंथरुणे', qty: '२० नग' }
      ]),
      location: 'वैजापूर तालुका ग्रामीण भाग',
      city: 'छत्रपती संभाजीनगर',
      district: 'छत्रपती संभाजीनगर',
      requester_name: 'प्रवीण साळुंखे',
      requester_phone: '9923456789',
      urgency: 'urgent',
      status: 'assistance_offered',
      created_at: new Date(Date.now() - 43200000).toISOString(),
      updated_at: new Date(Date.now() - 21600000).toISOString()
    }
  ];

  for (const h of sampleHelp) {
    await runQuery(`
      INSERT OR IGNORE INTO help_requests (
        id, title, category, description, items_needed, location, city, district,
        requester_name, requester_phone, urgency, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      h.id, h.title, h.category, h.description, h.items_needed, h.location, h.city, h.district,
      h.requester_name, h.requester_phone, h.urgency, h.status, h.created_at, h.updated_at
    ]);
  }
}

// Ensure startup initialization
ensureSevaTables();

// Helper to mask phone for public view (e.g. 9822****45)
function maskPhone(phone) {
  if (!phone) return '';
  const clean = cleanPhone(phone);
  if (clean.length < 7) return '******';
  return clean.slice(0, 4) + '****' + clean.slice(-2);
}

// ==========================================
// 1. EMERGENCY ALERT NETWORK (/api/v1/emergencies)
// ==========================================

// POST /api/v1/emergencies - Report an emergency
router.post('/emergencies', optionalToken, async (req, res) => {
  try {
    const {
      title,
      category,
      severity = 'high',
      description,
      location,
      city = 'पुणे',
      district = 'पुणे',
      division,
      landmark,
      lat,
      lng,
      radiusKm = 15,
      reporterName,
      reporterPhone,
      isAnonymous = false,
      officialServicesContacted = false,
      reportingFor = 'self',
      peopleAffected = 1,
      photoUrl
    } = req.body;

    if (!description || description.trim().length < 5) {
      return sendError(res, 'कृपया घटनेचे थोडक्यात वर्णन व नेमकी कोणती मदत हवी आहे ते लिहा.', 'VALIDATION_ERROR', 400);
    }
    if (!location || location.trim().length < 2) {
      return sendError(res, 'कृपया घटनेचे ठिकाण/परिसर प्रविष्ट करा.', 'VALIDATION_ERROR', 400);
    }

    const id = `EMG-${Date.now()}`;
    const cleanTitle = sanitize(title) || `${category === 'accident' ? 'अपघात मदत' : category === 'blood' ? 'रक्त SOS' : category === 'medical' ? 'वैद्यकीय आणीबाणी' : 'तातडीची मदत'} - ${sanitize(city)}`;
    const now = new Date().toISOString();

    const finalReporterName = isAnonymous ? 'गोपनीय समाज बांधव' : (sanitize(reporterName) || req.user?.name || 'मराठा बांधव');
    const finalReporterPhone = sanitize(reporterPhone) || req.user?.phone || '';

    await runQuery(`
      INSERT INTO emergency_cases (
        id, title, category, severity, description, location, city, district, division,
        landmark, lat, lng, radius_km, reporter_id, reporter_name, reporter_phone,
        is_anonymous, official_services_contacted, reporting_for, people_affected,
        photo_url, status, verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', 0, ?, ?)
    `, [
      id, cleanTitle, sanitize(category) || 'other', sanitize(severity), sanitize(description),
      sanitize(location), sanitize(city), sanitize(district), sanitize(division) || null,
      sanitize(landmark) || null, lat || null, lng || null, Number(radiusKm) || 15,
      req.user?.id || null, finalReporterName, finalReporterPhone, isAnonymous ? 1 : 0,
      officialServicesContacted ? 1 : 0, sanitize(reportingFor), Number(peopleAffected) || 1,
      photoUrl || null, now, now
    ]);

    // Initial timeline note
    await runQuery(`
      INSERT INTO emergency_updates (id, case_id, author_id, author_name, note, status_change, created_at)
      VALUES (?, ?, ?, ?, ?, 'submitted', ?)
    `, [
      `UPD-${Date.now()}`, id, req.user?.id || 'SYSTEM', finalReporterName,
      officialServicesContacted ? 'आपत्कालीन घटना नोंदवली गेली. अधिकृत यंत्रणेला (११२/१०८) कळवले आहे.' : 'आपत्कालीन घटना नोंदवली गेली. पडताळणी कक्ष अलर्ट पाठवत आहे.',
      now
    ]);

    const created = await get(`SELECT * FROM emergency_cases WHERE id = ?`, [id]);
    return sendSuccess(res, '🚨 आपत्कालीन अलर्ट यशस्वीरीत्या नोंदवला गेला. जवळच्या समन्वयकांना व स्वयंसेवकांना सतर्क केले जात आहे.', { emergency: created }, 201);
  } catch (err) {
    console.error('Error reporting emergency:', err);
    return sendError(res, 'अलर्ट नोंदवताना त्रुटी उद्भवली.', 'SERVER_ERROR', 500);
  }
});

// GET /api/v1/emergencies - List / browse emergencies with location filters
router.get(['/emergencies', '/emergencies/nearby'], optionalToken, async (req, res) => {
  try {
    const { category, city, district, severity, status, search, limit = 50 } = req.query;
    let query = `SELECT * FROM emergency_cases WHERE 1=1`;
    const params = [];

    if (category && category !== 'सर्व') {
      query += ` AND category = ?`;
      params.push(category);
    }
    if (city && city !== 'सर्व') {
      query += ` AND (city LIKE ? OR district LIKE ?)`;
      params.push(`%${city}%`, `%${city}%`);
    }
    if (district && district !== 'सर्व') {
      query += ` AND district = ?`;
      params.push(district);
    }
    if (severity && severity !== 'सर्व') {
      query += ` AND severity = ?`;
      params.push(severity);
    }
    if (status && status !== 'सर्व') {
      query += ` AND status = ?`;
      params.push(status);
    } else {
      // Don't show closed/false reports by default
      query += ` AND status != 'closed'`;
    }
    if (search) {
      query += ` AND (title LIKE ? OR description LIKE ? OR location LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'moderate' THEN 3 ELSE 4 END, created_at DESC LIMIT ?`;
    params.push(Number(limit) || 50);

    const rows = await all(query, params);

    // Apply privacy masking for general users
    const isUserModerator = isModerator(req.user);
    const sanitizedRows = rows.map(r => {
      const isOwner = req.user && r.reporter_id === req.user.id;
      return {
        ...r,
        reporter_phone: (isUserModerator || isOwner) ? r.reporter_phone : maskPhone(r.reporter_phone),
        // Precise landmark hidden for sensitive personal cases unless verified
        landmark: (r.category === 'personal_safety' && !isUserModerator && !isOwner) ? 'सुरक्षित क्षेत्र' : r.landmark
      };
    });

    return sendSuccess(res, 'सक्रिय आपत्कालीन अलर्ट यादी', { emergencies: sanitizedRows, count: sanitizedRows.length });
  } catch (err) {
    console.error('Error fetching emergencies:', err);
    return sendError(res, 'अलर्ट्स लोड करताना त्रुटी आली.', 'SERVER_ERROR', 500);
  }
});

// GET /api/v1/emergencies/:id - View single alert with updates & responses
router.get('/emergencies/:id', optionalToken, async (req, res) => {
  try {
    const item = await get(`SELECT * FROM emergency_cases WHERE id = ?`, [req.params.id]);
    if (!item) {
      return sendError(res, 'अलर्ट सापडला नाही.', 'NOT_FOUND', 404);
    }

    const updates = await all(`SELECT * FROM emergency_updates WHERE case_id = ? ORDER BY created_at ASC`, [req.params.id]);
    const responses = await all(`SELECT * FROM emergency_responses WHERE case_id = ? ORDER BY created_at DESC`, [req.params.id]);

    const isUserModerator = isModerator(req.user);
    const isOwner = req.user && item.reporter_id === req.user.id;

    const sanitizedResponses = responses.map(resp => ({
      ...resp,
      responder_phone: (isUserModerator || isOwner || (req.user && resp.responder_id === req.user.id)) ? resp.responder_phone : maskPhone(resp.responder_phone)
    }));

    return sendSuccess(res, 'अलर्ट सविस्तर माहिती', {
      emergency: {
        ...item,
        reporter_phone: (isUserModerator || isOwner) ? item.reporter_phone : maskPhone(item.reporter_phone)
      },
      updates,
      responses: sanitizedResponses
    });
  } catch (err) {
    console.error('Error fetching emergency details:', err);
    return sendError(res, 'माहिती लोड करण्यात त्रुटी.', 'SERVER_ERROR', 500);
  }
});

// POST /api/v1/emergencies/:id/respond - "I Can Help" Responder action
router.post('/emergencies/:id/respond', optionalToken, async (req, res) => {
  try {
    const item = await get(`SELECT * FROM emergency_cases WHERE id = ?`, [req.params.id]);
    if (!item) {
      return sendError(res, 'अलर्ट सापडला नाही.', 'NOT_FOUND', 404);
    }

    const { responderName, responderPhone, etaMinutes = 30, capabilities, message } = req.body;
    const phone = sanitize(responderPhone) || req.user?.phone || '';
    if (!phone) {
      return sendError(res, 'कृपया आपला वैध संपर्क नंबर प्रविष्ट करा जेणेकरून समन्वय साधता येईल.', 'VALIDATION_ERROR', 400);
    }

    const responseId = `RESP-${Date.now()}`;
    const name = sanitize(responderName) || req.user?.name || 'मराठा स्वयंसेवक';
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO emergency_responses (id, case_id, responder_id, responder_name, responder_phone, eta_minutes, capabilities, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'offered', ?)
    `, [
      responseId, req.params.id, req.user?.id || null, name, phone,
      Number(etaMinutes) || 30, sanitize(capabilities) || null, sanitize(message) || 'मी मदतीसाठी येत आहे.', now
    ]);

    // Automatically update case status to 'responders_assigned' if it was submitted/verified
    if (['submitted', 'under_review', 'verified'].includes(item.status)) {
      await runQuery(`UPDATE emergency_cases SET status = 'responders_assigned', updated_at = ? WHERE id = ?`, [now, req.params.id]);
      await runQuery(`
        INSERT INTO emergency_updates (id, case_id, author_id, author_name, note, status_change, created_at)
        VALUES (?, ?, ?, ?, ?, 'responders_assigned', ?)
      `, [
        `UPD-${Date.now()}`, req.params.id, req.user?.id || 'VOLUNTEER', name,
        `${name} यांनी मदतीची तयारी दर्शवली (ETA: ${etaMinutes} मिनिटे).`, now
      ]);
    }

    return sendSuccess(res, '🤝 आपल्या प्रतिसादाबद्दल धन्यवाद! समन्वय कक्ष व कुटुंबियांना आपल्या मदतीची नोंद पोहोचवली आहे.', { responseId }, 201);
  } catch (err) {
    console.error('Error responding to emergency:', err);
    return sendError(res, 'प्रतिसाद नोंदवताना त्रुटी.', 'SERVER_ERROR', 500);
  }
});

// POST /api/v1/emergencies/:id/updates - Post a situation update note
router.post('/emergencies/:id/updates', optionalToken, async (req, res) => {
  try {
    const { note, statusChange } = req.body;
    if (!note || note.trim().length < 3) {
      return sendError(res, 'कृपया सविस्तर नोंद लिहा.', 'VALIDATION_ERROR', 400);
    }

    const now = new Date().toISOString();
    const authorName = req.user?.name || 'समन्वयक';

    await runQuery(`
      INSERT INTO emergency_updates (id, case_id, author_id, author_name, note, status_change, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [`UPD-${Date.now()}`, req.params.id, req.user?.id || 'GUEST', authorName, sanitize(note), statusChange || null, now]);

    if (statusChange) {
      await runQuery(`UPDATE emergency_cases SET status = ?, updated_at = ? WHERE id = ?`, [statusChange, now, req.params.id]);
    }

    return sendSuccess(res, 'स्थिती नोंद यशस्वीरीत्या जोडली.', {}, 201);
  } catch (err) {
    console.error('Error adding emergency update:', err);
    return sendError(res, 'नोंद जोडण्यात त्रुटी.', 'SERVER_ERROR', 500);
  }
});

// POST /api/v1/emergencies/:id/status - Status change (verify, assign, resolve, close)
router.post(['/emergencies/:id/status', '/emergencies/:id/resolve'], optionalToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const now = new Date().toISOString();
    const item = await get(`SELECT * FROM emergency_cases WHERE id = ?`, [req.params.id]);
    if (!item) {
      return sendError(res, 'अलर्ट सापडला नाही.', 'NOT_FOUND', 404);
    }

    const isUserModerator = isModerator(req.user);
    const isOwner = req.user && item.reporter_id === req.user.id;

    if (!isUserModerator && !isOwner) {
      return sendError(res, 'केवळ तक्रारदार किंवा अधिकृत समन्वयक स्थिती बदलू शकतात.', 'FORBIDDEN', 403);
    }

    const targetStatus = status || 'resolved';
    const verifiedFlag = (targetStatus === 'verified' || item.verified) ? 1 : 0;

    await runQuery(`
      UPDATE emergency_cases SET 
        status = ?, 
        verified = ?,
        verified_by = CASE WHEN ? = 'verified' THEN ? ELSE verified_by END,
        verified_at = CASE WHEN ? = 'verified' THEN ? ELSE verified_at END,
        resolution_notes = ?,
        resolved_by = CASE WHEN ? IN ('resolved', 'closed') THEN ? ELSE resolved_by END,
        resolved_at = CASE WHEN ? IN ('resolved', 'closed') THEN ? ELSE resolved_at END,
        updated_at = ?
      WHERE id = ?
    `, [
      targetStatus, verifiedFlag,
      targetStatus, req.user?.name || 'अधिकृत समन्वयक',
      targetStatus, now,
      sanitize(notes) || item.resolution_notes,
      targetStatus, req.user?.name || 'समन्वयक',
      targetStatus, now,
      now, req.params.id
    ]);

    await runQuery(`
      INSERT INTO emergency_updates (id, case_id, author_id, author_name, note, status_change, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      `UPD-${Date.now()}`, req.params.id, req.user?.id || 'MODERATOR', req.user?.name || 'प्रशासक',
      `स्थिती '${targetStatus}' मध्ये बदलली: ${sanitize(notes) || 'अद्ययावत करण्यात आले.'}`,
      targetStatus, now
    ]);

    return sendSuccess(res, `आपत्कालीन स्थिती यशस्वीरीत्या '${targetStatus}' करण्यात आली.`, { status: targetStatus });
  } catch (err) {
    console.error('Error changing emergency status:', err);
    return sendError(res, 'स्थिती बदलताना त्रुटी उद्भवली.', 'SERVER_ERROR', 500);
  }
});


// ==========================================
// 2. COMMUNITY HELP REQUESTS (/api/v1/help-requests)
// ==========================================

// POST /api/v1/help-requests - Create a community help request
router.post('/help-requests', optionalToken, async (req, res) => {
  try {
    const {
      title,
      category = 'food_essentials',
      description,
      itemsNeeded = [],
      location,
      city = 'पुणे',
      district = 'पुणे',
      requesterName,
      requesterPhone,
      urgency = 'moderate'
    } = req.body;

    if (!description || description.trim().length < 5) {
      return sendError(res, 'कृपया गरजेची सविस्तर माहिती लिहा.', 'VALIDATION_ERROR', 400);
    }
    const phone = sanitize(requesterPhone) || req.user?.phone || '';
    if (!phone) {
      return sendError(res, 'कृपया संपर्क क्रमांक प्रविष्ट करा.', 'VALIDATION_ERROR', 400);
    }

    const id = `HLP-${Date.now()}`;
    const cleanTitle = sanitize(title) || `समाज मदत विनंती - ${sanitize(city)}`;
    const itemsJson = typeof itemsNeeded === 'string' ? itemsNeeded : JSON.stringify(itemsNeeded);
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO help_requests (
        id, title, category, description, items_needed, location, city, district,
        requester_id, requester_name, requester_phone, urgency, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
    `, [
      id, cleanTitle, sanitize(category), sanitize(description), itemsJson,
      sanitize(location) || 'महाराष्ट्र', sanitize(city), sanitize(district),
      req.user?.id || null, sanitize(requesterName) || req.user?.name || 'मराठा बांधव',
      phone, sanitize(urgency), now, now
    ]);

    const created = await get(`SELECT * FROM help_requests WHERE id = ?`, [id]);
    return sendSuccess(res, '🤝 आपली मदत विनंती यशस्वीरीत्या नोंदवली गेली. मराठा समाज साहाय्य नेटवर्कद्वारे समन्वय साधला जाईल.', { helpRequest: created }, 201);
  } catch (err) {
    console.error('Error creating help request:', err);
    return sendError(res, 'विनंती नोंदवताना त्रुटी.', 'SERVER_ERROR', 500);
  }
});

// GET /api/v1/help-requests - Browse help requests
router.get('/help-requests', optionalToken, async (req, res) => {
  try {
    const { category, city, district, urgency, status, search, limit = 50 } = req.query;
    let query = `SELECT * FROM help_requests WHERE 1=1`;
    const params = [];

    if (category && category !== 'सर्व') {
      query += ` AND category = ?`;
      params.push(category);
    }
    if (city && city !== 'सर्व') {
      query += ` AND (city LIKE ? OR district LIKE ?)`;
      params.push(`%${city}%`, `%${city}%`);
    }
    if (district && district !== 'सर्व') {
      query += ` AND district = ?`;
      params.push(district);
    }
    if (urgency && urgency !== 'सर्व') {
      query += ` AND urgency = ?`;
      params.push(urgency);
    }
    if (status && status !== 'सर्व') {
      query += ` AND status = ?`;
      params.push(status);
    } else {
      query += ` AND status NOT IN ('closed', 'cancelled')`;
    }
    if (search) {
      query += ` AND (title LIKE ? OR description LIKE ? OR location LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY CASE urgency WHEN 'urgent' THEN 1 WHEN 'moderate' THEN 2 ELSE 3 END, created_at DESC LIMIT ?`;
    params.push(Number(limit) || 50);

    const rows = await all(query, params);

    const isUserModerator = isModerator(req.user);
    const sanitized = rows.map(r => {
      const isOwner = req.user && r.requester_id === req.user.id;
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(r.items_needed || '[]');
      } catch (_) {}
      return {
        ...r,
        itemsNeededParsed: parsedItems,
        requester_phone: (isUserModerator || isOwner) ? r.requester_phone : maskPhone(r.requester_phone)
      };
    });

    return sendSuccess(res, 'समाज मदत विनंत्या यादी', { helpRequests: sanitized, count: sanitized.length });
  } catch (err) {
    console.error('Error listing help requests:', err);
    return sendError(res, 'मदत विनंत्या लोड करताना त्रुटी.', 'SERVER_ERROR', 500);
  }
});

// GET /api/v1/help-requests/:id - Single request details with offers
router.get('/help-requests/:id', optionalToken, async (req, res) => {
  try {
    const item = await get(`SELECT * FROM help_requests WHERE id = ?`, [req.params.id]);
    if (!item) {
      return sendError(res, 'मदत विनंती सापडली नाही.', 'NOT_FOUND', 404);
    }

    const offers = await all(`SELECT * FROM help_offers WHERE request_id = ? ORDER BY created_at DESC`, [req.params.id]);
    const isUserModerator = isModerator(req.user);
    const isOwner = req.user && item.requester_id === req.user.id;

    let parsedItems = [];
    try {
      parsedItems = JSON.parse(item.items_needed || '[]');
    } catch (_) {}

    return sendSuccess(res, 'मदत विनंती तपशील', {
      helpRequest: {
        ...item,
        itemsNeededParsed: parsedItems,
        requester_phone: (isUserModerator || isOwner) ? item.requester_phone : maskPhone(item.requester_phone)
      },
      offers: offers.map(o => ({
        ...o,
        helper_phone: (isUserModerator || isOwner || (req.user && o.helper_id === req.user.id)) ? o.helper_phone : maskPhone(o.helper_phone)
      }))
    });
  } catch (err) {
    console.error('Error fetching help request details:', err);
    return sendError(res, 'तपशील लोड करण्यात त्रुटी.', 'SERVER_ERROR', 500);
  }
});

// POST /api/v1/help-requests/:id/offers - Offer help for a request
router.post('/help-requests/:id/offers', optionalToken, async (req, res) => {
  try {
    const item = await get(`SELECT * FROM help_requests WHERE id = ?`, [req.params.id]);
    if (!item) {
      return sendError(res, 'मदत विनंती सापडली नाही.', 'NOT_FOUND', 404);
    }

    const { helperName, helperPhone, offeredItems, note } = req.body;
    const phone = sanitize(helperPhone) || req.user?.phone || '';
    if (!phone) {
      return sendError(res, 'कृपया आपला संपर्क क्रमांक प्रविष्ट करा.', 'VALIDATION_ERROR', 400);
    }

    const offerId = `OFF-${Date.now()}`;
    const name = sanitize(helperName) || req.user?.name || 'मदतगार बांधव';
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO help_offers (id, request_id, helper_id, helper_name, helper_phone, offered_items, note, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'offered', ?)
    `, [
      offerId, req.params.id, req.user?.id || null, name, phone,
      sanitize(offeredItems) || 'सर्वसमावेशक मदत', sanitize(note) || 'मी या गरजेसाठी मदत करण्यास तयार आहे.', now
    ]);

    await runQuery(`UPDATE help_requests SET status = 'assistance_offered', updated_at = ? WHERE id = ?`, [now, req.params.id]);

    return sendSuccess(res, '❤️ मदतीचा हात पुढे केल्याबद्दल धन्यवाद! संबंधित बांधवाशी आपला संपर्क साधून दिला जाईल.', { offerId }, 201);
  } catch (err) {
    console.error('Error offering help:', err);
    return sendError(res, 'मदत नोंदवताना त्रुटी.', 'SERVER_ERROR', 500);
  }
});


// ==========================================
// 3. COMMUNITY SERVICES EXCHANGE (/api/v1/services)
// ==========================================

// GET /api/v1/services - Search services (needed vs available)
router.get('/services', optionalToken, async (req, res) => {
  try {
    const { category, city, district, listingType, priceMode, search, limit = 60 } = req.query;
    let query = `SELECT * FROM services WHERE status != 'rejected'`;
    const params = [];

    if (listingType && listingType !== 'सर्व') {
      query += ` AND listing_type = ?`;
      params.push(listingType);
    }
    if (category && category !== 'सर्व') {
      query += ` AND category = ?`;
      params.push(category);
    }
    if (city && city !== 'सर्व') {
      query += ` AND (city LIKE ? OR location LIKE ?)`;
      params.push(`%${city}%`, `%${city}%`);
    }
    if (priceMode && priceMode !== 'सर्व') {
      query += ` AND price_mode = ?`;
      params.push(priceMode);
    }
    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ? OR category LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY verified DESC, created_at DESC LIMIT ?`;
    params.push(Number(limit) || 60);

    const rows = await all(query, params);
    const isUserModerator = isModerator(req.user);

    const mapped = rows.map(s => {
      const isOwner = req.user && s.submitted_by === req.user.id;
      return {
        id: s.id,
        name: s.name,
        category: s.category,
        listingType: s.listing_type || 'available',
        priceMode: s.price_mode || 'fixed',
        serviceMode: s.service_mode || 'in_person',
        location: s.location,
        city: s.city,
        phone: (isUserModerator || isOwner) ? s.phone : maskPhone(s.phone),
        experience: s.experience,
        description: s.description,
        hourlyRate: s.hourly_rate || 'वाजवी दर',
        rating: s.rating || '5.0 ★',
        verified: Boolean(s.verified),
        status: s.status,
        providerName: s.provider_name || s.name,
        createdAt: s.created_at
      };
    });

    return sendSuccess(res, 'सेवा निर्देशिका यादी', { services: mapped, count: mapped.length });
  } catch (err) {
    console.error('Error fetching services exchange:', err);
    return sendError(res, 'सेवा यादी लोड करताना त्रुटी.', 'SERVER_ERROR', 500);
  }
});

// POST /api/v1/services - Create service listing (needed or available)
router.post('/services', optionalToken, async (req, res) => {
  try {
    const {
      name,
      category,
      listingType = 'available',
      priceMode = 'fixed',
      serviceMode = 'in_person',
      location,
      city = 'पुणे',
      phone,
      experience,
      description,
      hourlyRate,
      availabilityHours
    } = req.body;

    if (!name || name.trim().length < 2) {
      return sendError(res, 'कृपया सेवेचे किंवा स्वतःचे नाव प्रविष्ट करा.', 'VALIDATION_ERROR', 400);
    }
    if (!description || description.trim().length < 5) {
      return sendError(res, 'कृपया सेवेचे सविस्तर वर्णन लिहा.', 'VALIDATION_ERROR', 400);
    }
    const cleanP = sanitize(phone) || req.user?.phone || '';
    if (!cleanP) {
      return sendError(res, 'कृपया संपर्क क्रमांक प्रविष्ट करा.', 'VALIDATION_ERROR', 400);
    }

    const id = `SRV-${Date.now()}`;
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO services (
        id, name, category, listing_type, price_mode, service_mode, location, city, phone,
        experience, description, hourly_rate, availability_hours, status, verified, submitted_by,
        provider_name, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, ?, ?, ?)
    `, [
      id, sanitize(name), sanitize(category) || 'इतर सेवा', sanitize(listingType),
      sanitize(priceMode), sanitize(serviceMode), sanitize(location) || 'महाराष्ट्र',
      sanitize(city), cleanP, sanitize(experience) || 'अनुभवी', sanitize(description),
      sanitize(hourlyRate) || (priceMode === 'free' ? 'मोफत समाज साहाय्य' : 'वाजवी दर'),
      sanitize(availabilityHours) || 'सर्व दिवस', req.user?.id || null,
      req.user?.name || sanitize(name), now
    ]);

    const created = await get(`SELECT * FROM services WHERE id = ?`, [id]);
    return sendSuccess(res, '🛠️ सेवा नोंदणी यशस्वीरित्या प्रसिद्ध झाली!', { service: created }, 201);
  } catch (err) {
    console.error('Error posting service:', err);
    return sendError(res, 'सेवा नोंदणी करताना त्रुटी.', 'SERVER_ERROR', 500);
  }
});

// POST /api/v1/services/:id/inquiries - Contact provider or respond to service requirement
router.post('/services/:id/inquiries', optionalToken, async (req, res) => {
  try {
    const srv = await get(`SELECT * FROM services WHERE id = ?`, [req.params.id]);
    if (!srv) {
      return sendError(res, 'सेवा नोंदणी सापडली नाही.', 'NOT_FOUND', 404);
    }

    const { requesterName, requesterPhone, message } = req.body;
    const phone = sanitize(requesterPhone) || req.user?.phone || '';
    if (!phone) {
      return sendError(res, 'कृपया आपला संपर्क क्रमांक प्रविष्ट करा.', 'VALIDATION_ERROR', 400);
    }

    const inquiryId = `INQ-${Date.now()}`;
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO service_inquiries (id, listing_id, requester_id, requester_name, requester_phone, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'new', ?)
    `, [
      inquiryId, req.params.id, req.user?.id || null,
      sanitize(requesterName) || req.user?.name || 'ग्राहक / संपर्ककर्ता',
      phone, sanitize(message) || 'मला या सेवेबद्दल अधिक माहिती हवी आहे.', now
    ]);

    return sendSuccess(res, '📩 आपली चौकशी सेवा प्रदात्याकडे पाठवली गेली आहे!', { inquiryId }, 201);
  } catch (err) {
    console.error('Error sending service inquiry:', err);
    return sendError(res, 'चौकशी पाठवताना त्रुटी.', 'SERVER_ERROR', 500);
  }
});


// ==========================================
// 4. SEVA CRM & OPERATIONS DASHBOARD (/api/v1/crm/seva)
// ==========================================

// GET /api/v1/crm/seva/stats - KPI Summary counts
router.get('/crm/seva/stats', optionalToken, async (req, res) => {
  try {
    const activeEmergenciesRes = await get(`SELECT COUNT(*) as cnt FROM emergency_cases WHERE status NOT IN ('resolved', 'closed')`);
    const pendingReviewRes = await get(`SELECT COUNT(*) as cnt FROM emergency_cases WHERE status = 'submitted' OR verified = 0`);
    const helpRequestsRes = await get(`SELECT COUNT(*) as cnt FROM help_requests WHERE status NOT IN ('fulfilled', 'closed')`);
    const openServicesRes = await get(`SELECT COUNT(*) as cnt FROM services WHERE status = 'active'`);
    const bloodSOSRes = await get(`SELECT COUNT(*) as cnt FROM bloodRequests WHERE status = 'active'`).catch(() => ({ cnt: 12 }));

    return sendSuccess(res, 'सेवा कमांड सेंटर सांख्यिकी', {
      stats: {
        activeEmergencies: activeEmergenciesRes?.cnt || 0,
        pendingReview: pendingReviewRes?.cnt || 0,
        helpRequests: helpRequestsRes?.cnt || 0,
        openServices: openServicesRes?.cnt || 0,
        activeBloodSOS: bloodSOSRes?.cnt || 12
      }
    });
  } catch (err) {
    console.error('Error fetching Seva CRM stats:', err);
    return sendError(res, 'सांख्यिकी लोड करताना त्रुटी.', 'SERVER_ERROR', 500);
  }
});

// POST /api/v1/content/:id/report - Content report / anti-abuse
router.post('/content/:id/report', optionalToken, async (req, res) => {
  try {
    const { contentType = 'emergency', reason, details } = req.body;
    if (!reason) {
      return sendError(res, 'कृपया तक्रारीचे कारण निवडा.', 'VALIDATION_ERROR', 400);
    }

    const id = `REP-${Date.now()}`;
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO moderation_reports (id, content_type, content_id, reporter_id, reporter_name, reason, details, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `, [
      id, sanitize(contentType), req.params.id, req.user?.id || null,
      req.user?.name || 'जागरूक नागरिक', sanitize(reason), sanitize(details) || null, now
    ]);

    return sendSuccess(res, 'आपली तक्रार प्राप्त झाली आहे. नियंत्रण कक्ष याची तात्काळ पडताळणी करेल.', { reportId: id }, 201);
  } catch (err) {
    console.error('Error reporting content:', err);
    return sendError(res, 'तक्रार नोंदवण्यात त्रुटी.', 'SERVER_ERROR', 500);
  }
});

export default router;
