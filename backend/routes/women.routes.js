import { Router } from 'express';
import { runQuery, get, all, saveDatabaseNow } from '../../database/database.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize, cleanPhone, isValidPhone } from '../utils/validator.js';

const router = Router();

function isModerator(user) {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  return ['superadmin', 'admin', 'moderator', 'chapter_president', 'center_manager', 'district_admin'].includes(role);
}

// =========================================================================
// 1. ENTREPRENEURS & SHG DIRECTORY (/api/women/entrepreneurs)
// =========================================================================

// GET /api/women/entrepreneurs - Browse & search women entrepreneurs & SHGs
router.get('/entrepreneurs', optionalToken, async (req, res, next) => {
  try {
    const { category, district, search, isShg } = req.query;
    const conditions = ["status = 'active'"];
    const params = [];

    if (category && category !== 'all' && category !== 'सर्व') {
      conditions.push('(category LIKE ? OR sub_category LIKE ?)');
      params.push(`%${category}%`, `%${category}%`);
    }

    if (district && district !== 'all' && district !== 'सर्व') {
      conditions.push('(district LIKE ? OR city LIKE ?)');
      params.push(`%${district}%`, `%${district}%`);
    }

    if (isShg === 'true' || isShg === '1') {
      conditions.push('is_shg = 1');
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      conditions.push('(name LIKE ? OR business_name LIKE ? OR description LIKE ? OR products_services LIKE ? OR shg_name LIKE ?)');
      params.push(s, s, s, s, s);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM women_entrepreneurs ${whereClause} ORDER BY verified DESC, created_at DESC`;
    const entrepreneurs = await all(sql, params);

    return sendSuccess(res, 'महिला उद्योजक यादी', {
      entrepreneurs,
      total: entrepreneurs.length
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/women/entrepreneurs - Register new entrepreneur / SHG
router.post('/entrepreneurs', optionalToken, async (req, res, next) => {
  try {
    const {
      name,
      businessName,
      category,
      subCategory,
      district,
      taluka,
      city,
      description,
      productsServices,
      contactPhone,
      whatsapp,
      email,
      website,
      instagram,
      photo,
      shgName,
      isShg,
      employeesCount,
      annualTurnover
    } = req.body;

    if (!name || !businessName || !category || !district || !contactPhone) {
      return sendError(res, 'कृपया नाव, व्यवसायाचे नाव, श्रेणी, जिल्हा आणि संपर्क क्रमांक प्रविष्ट करा.', 'MISSING_FIELDS', 400);
    }

    const cleanNum = cleanPhone(contactPhone);
    if (!isValidPhone(cleanNum)) {
      return sendError(res, 'कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
    }

    const id = `WENT-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO women_entrepreneurs (
        id, user_id, name, business_name, category, sub_category, district, taluka, city,
        description, products_services, contact_phone, whatsapp, email, website, instagram, photo,
        shg_name, is_shg, employees_count, annual_turnover, verified, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      req.user?.id || null,
      sanitize(name),
      sanitize(businessName),
      sanitize(category),
      sanitize(subCategory) || null,
      sanitize(district),
      sanitize(taluka) || null,
      sanitize(city) || null,
      sanitize(description) || null,
      sanitize(productsServices) || null,
      cleanNum,
      whatsapp ? cleanPhone(whatsapp) : cleanNum,
      sanitize(email) || null,
      sanitize(website) || null,
      sanitize(instagram) || null,
      photo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      sanitize(shgName) || null,
      isShg ? 1 : 0,
      parseInt(employeesCount, 10) || 1,
      sanitize(annualTurnover) || 'नोंदवलेले नाही',
      1,
      'active',
      now
    ]);

    saveDatabaseNow();

    return sendSuccess(res, '🎉 महिला उद्योजक / बचत गट नोंदणी यशस्वी!', { id }, 201);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 2. TRAINING, COURSES & GOVERNMENT SCHEMES (/api/women/programs)
// =========================================================================

// GET /api/women/programs - Schemes, skill workshops, jobs
router.get('/programs', async (req, res, next) => {
  try {
    const { type, category, district } = req.query;
    const conditions = ["status = 'active'"];
    const params = [];

    if (type && type !== 'all' && type !== 'सर्व') {
      conditions.push('type = ?');
      params.push(type);
    }

    if (category && category !== 'all' && category !== 'सर्व') {
      conditions.push('category LIKE ?');
      params.push(`%${category}%`);
    }

    if (district && district !== 'all' && district !== 'सर्व') {
      conditions.push("(district LIKE ? OR district = 'सर्व महाराष्ट्र')");
      params.push(`%${district}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const programs = await all(`SELECT * FROM women_programs ${whereClause} ORDER BY created_at DESC`, params);

    return sendSuccess(res, 'योजना व प्रशिक्षण यादी', { programs, total: programs.length });
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 3. MENTORS & DIRECTORY (/api/women/mentors)
// =========================================================================

// GET /api/women/mentors - Connect with experienced women leaders & experts
router.get('/mentors', async (req, res, next) => {
  try {
    const { field, district } = req.query;
    const conditions = ['is_active = 1'];
    const params = [];

    if (field && field !== 'all' && field !== 'सर्व') {
      conditions.push('field LIKE ?');
      params.push(`%${field}%`);
    }

    if (district && district !== 'all' && district !== 'सर्व') {
      conditions.push('district LIKE ?');
      params.push(`%${district}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const mentors = await all(`SELECT * FROM women_mentors ${whereClause} ORDER BY created_at DESC`, params);

    return sendSuccess(res, 'मार्गदर्शक (Mentors) यादी', { mentors, total: mentors.length });
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 4. CONFIDENTIAL HELP CASES & GRIEVANCES (/api/women/help)
// =========================================================================

// GET /api/women/help - Member's own confidential cases
router.get('/help', authenticateToken, async (req, res, next) => {
  try {
    const isMod = isModerator(req.user);
    let cases = [];

    if (isMod) {
      cases = await all(`SELECT * FROM women_help_cases ORDER BY CASE WHEN urgency LIKE '%SOS%' THEN 1 WHEN urgency LIKE '%तातडीने%' THEN 2 ELSE 3 END, created_at DESC`);
    } else {
      cases = await all(`SELECT * FROM women_help_cases WHERE applicant_id = ? OR contact_phone = ? ORDER BY created_at DESC`, [
        req.user.id,
        req.user.phone || ''
      ]);
    }

    return sendSuccess(res, 'मदत प्रकरणे यादी', { cases, total: cases.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/women/help - File confidential grievance / assistance request
router.post('/help', optionalToken, async (req, res, next) => {
  try {
    const {
      name,
      contactPhone,
      district,
      taluka,
      category,
      urgency,
      description,
      preferredTime
    } = req.body;

    if (!description || !description.trim()) {
      return sendError(res, 'कृपया समस्येची किंवा आवश्यक मदतीची माहिती प्रविष्ट करा.', 'MISSING_FIELDS', 400);
    }

    const cleanNum = contactPhone ? cleanPhone(contactPhone) : (req.user?.phone || '');
    if (cleanNum && !isValidPhone(cleanNum)) {
      return sendError(res, 'कृपया वैध १०-अंकी संपर्क क्रमांक प्रविष्ट करा.', 'INVALID_PHONE', 400);
    }

    const caseId = `WCS-${Date.now().toString().slice(-4)}`;
    const caseNumber = `WH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO women_help_cases (
        id, case_number, applicant_id, applicant_name, contact_phone, district, taluka,
        category, urgency, description, preferred_time, assigned_coordinator, coordinator_phone,
        status, counselor_notes, resolved_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      caseId,
      caseNumber,
      req.user?.id || 'GUEST',
      sanitize(name) || req.user?.name || 'भगिनी',
      cleanNum,
      sanitize(district) || 'पुणे',
      sanitize(taluka) || null,
      sanitize(category) || 'कौटुंबिक व कायदेशीर सल्ला',
      urgency || 'सामान्य',
      sanitize(description),
      sanitize(preferredTime) || 'सकाळी ११ ते दुपारी २',
      'महिला समन्वय कक्ष (प्रतीक्षेत)',
      '1800-120-9900',
      'समीक्षेत',
      'नवीन प्रकरण दाखल झाले असून संबंधित जिल्हा महिला समन्वयकांकडे पाठवले जात आहे.',
      null,
      now
    ]);

    saveDatabaseNow();

    return sendSuccess(res, '🌸 आपली मदत विनंती सुरक्षितरीत्या अधिकृत महिला कक्षाकडे दाखल झाली आहे!', {
      id: caseId,
      caseNumber
    }, 201);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 5. WOMEN SHGS FEDERATION (/api/women/shgs)
// =========================================================================

// GET /api/women/shgs - Browse & filter Self-Help Groups
router.get('/shgs', async (req, res, next) => {
  try {
    const { district, search } = req.query;
    const conditions = [];
    const params = [];

    if (district && district !== 'all' && district !== 'सर्व') {
      conditions.push('district LIKE ?');
      params.push(`%${district}%`);
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      conditions.push('(shg_name LIKE ? OR president_name LIKE ? OR activity_type LIKE ? OR village LIKE ?)');
      params.push(s, s, s, s);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const shgs = await all(`SELECT * FROM women_shgs ${whereClause} ORDER BY created_at DESC`, params);

    return sendSuccess(res, 'महिला बचत गट यादी', { shgs, total: shgs.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/women/shgs - Register new SHG into federation
router.post('/shgs', optionalToken, async (req, res, next) => {
  try {
    const {
      shgName,
      presidentName,
      secretaryName,
      phone,
      district,
      taluka,
      village,
      membersCount,
      bankName,
      bankBranch,
      monthlySavings,
      activityType
    } = req.body;

    if (!shgName || !presidentName || !phone || !district || !activityType) {
      return sendError(res, 'कृपया बचत गट नाव, अध्यक्ष नाव, संपर्क, जिल्हा आणि व्यवसाय माहिती भरा.', 'MISSING_FIELDS', 400);
    }

    const id = `SHG-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO women_shgs (
        id, shg_name, president_name, secretary_name, phone, district, taluka, village,
        members_count, bank_name, bank_branch, monthly_savings, activity_type, loan_status,
        revolving_fund_received, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      sanitize(shgName),
      sanitize(presidentName),
      sanitize(secretaryName) || null,
      cleanPhone(phone),
      sanitize(district),
      sanitize(taluka) || 'हवेली',
      sanitize(village) || null,
      parseInt(membersCount, 10) || 10,
      sanitize(bankName) || 'राष्ट्रीयीकृत बँक',
      sanitize(bankBranch) || null,
      sanitize(monthlySavings) || '₹५०० / महिना',
      sanitize(activityType),
      'पात्र (Eligible)',
      1,
      now
    ]);

    saveDatabaseNow();

    return sendSuccess(res, '🎉 महिला बचत गट नोंदणी यशस्वी!', { id }, 201);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 6. WOMEN MARKETPLACE PRODUCTS (/api/women/products)
// =========================================================================

// GET /api/women/products - Browse products produced by women entrepreneurs
router.get('/products', async (req, res, next) => {
  try {
    const { category, district, search } = req.query;
    const conditions = ['is_available = 1'];
    const params = [];

    if (category && category !== 'all' && category !== 'सर्व') {
      conditions.push('category LIKE ?');
      params.push(`%${category}%`);
    }

    if (district && district !== 'all' && district !== 'सर्व') {
      conditions.push('district LIKE ?');
      params.push(`%${district}%`);
    }

    if (search && search.trim()) {
      const s = `%${search.trim()}%`;
      conditions.push('(product_name LIKE ? OR seller_name LIKE ? OR description LIKE ?)');
      params.push(s, s, s);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const products = await all(`SELECT * FROM women_products ${whereClause} ORDER BY created_at DESC`, params);

    return sendSuccess(res, 'महिला उत्पादने यादी', { products, total: products.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/women/products - Add product to showcase
router.post('/products', optionalToken, async (req, res, next) => {
  try {
    const {
      entrepreneurId,
      sellerName,
      productName,
      category,
      price,
      unit,
      district,
      photo,
      description,
      contactPhone,
      whatsapp
    } = req.body;

    if (!productName || !price || !contactPhone) {
      return sendError(res, 'कृपया उत्पादनाचे नाव, किंमत व संपर्क नंबर भरा.', 'MISSING_FIELDS', 400);
    }

    const id = `WPRD-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO women_products (
        id, entrepreneur_id, seller_name, product_name, category, price, unit,
        district, photo, description, contact_phone, whatsapp, is_available, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      entrepreneurId || 'WENT-GEN',
      sanitize(sellerName) || 'मराठा महिला उद्योजक',
      sanitize(productName),
      sanitize(category) || 'गृहउद्योग व खाद्यपदार्थ',
      sanitize(price),
      sanitize(unit) || 'प्रति नग',
      sanitize(district) || 'पुणे',
      photo || 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      sanitize(description) || null,
      cleanPhone(contactPhone),
      whatsapp ? cleanPhone(whatsapp) : cleanPhone(contactPhone),
      1,
      now
    ]);

    saveDatabaseNow();

    return sendSuccess(res, '🎉 उत्पादन यशस्वीरीत्या बाजारात सूचीबद्ध झाले!', { id }, 201);
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// 7. 1-ON-1 MENTORSHIP SESSION BOOKINGS (/api/women/mentors/book)
// =========================================================================

// POST /api/women/mentors/book - Book a guidance session with an expert mentor
router.post('/mentors/book', optionalToken, async (req, res, next) => {
  try {
    const {
      mentorId,
      mentorName,
      applicantName,
      phone,
      district,
      topic,
      preferredDate,
      preferredTime,
      notes
    } = req.body;

    if (!mentorName || !phone || !topic) {
      return sendError(res, 'कृपया मेंटॉर नाव, आपला फोन आणि मार्गदर्शनाचा विषय भरा.', 'MISSING_FIELDS', 400);
    }

    const id = `WMB-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO women_mentor_bookings (
        id, mentor_id, mentor_name, applicant_id, applicant_name, phone, district,
        topic, preferred_date, preferred_time, notes, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      mentorId || 'WMT-01',
      sanitize(mentorName),
      req.user?.id || 'GUEST',
      sanitize(applicantName) || req.user?.name || 'भगिनी',
      cleanPhone(phone),
      sanitize(district) || 'पुणे',
      sanitize(topic),
      sanitize(preferredDate) || 'लवकरच उपलब्ध वेळ',
      sanitize(preferredTime) || 'दुपारी २ ते ५',
      sanitize(notes) || null,
      'confirmed',
      now
    ]);

    saveDatabaseNow();

    return sendSuccess(res, `🎉 मेंटॉर ${mentorName} यांच्यासोबत मार्गदर्शन सत्र यशस्वीरित्या निश्चित झाले!`, { id }, 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/women/admin/stats - CRM high-level statistics
router.get('/admin/stats', authenticateToken, async (req, res, next) => {
  try {
    if (!isModerator(req.user)) {
      return sendError(res, 'केवळ महिला कक्ष व ॲडमिन अधिकाऱ्यांसाठी राखीव.', 'FORBIDDEN', 403);
    }

    const totalEntrepreneurs = await get(`SELECT COUNT(*) as count FROM women_entrepreneurs`);
    const totalShgs = await get(`SELECT COUNT(*) as count FROM women_entrepreneurs WHERE is_shg = 1`);
    const activeCases = await get(`SELECT COUNT(*) as count FROM women_help_cases WHERE status != 'सोडवले' AND status != 'बंद'`);
    const resolvedCases = await get(`SELECT COUNT(*) as count FROM women_help_cases WHERE status = 'सोडवले'`);
    const totalPrograms = await get(`SELECT COUNT(*) as count FROM women_programs`);
    const totalMentors = await get(`SELECT COUNT(*) as count FROM women_mentors WHERE is_active = 1`);

    const openCases = await all(`SELECT * FROM women_help_cases ORDER BY created_at DESC LIMIT 50`);
    const pendingEntrepreneurs = await all(`SELECT * FROM women_entrepreneurs WHERE verified = 0 OR status = 'pending'`);

    return sendSuccess(res, 'महिला कक्ष CRM विश्लेषण व सांख्यिकी', {
      stats: {
        totalEntrepreneurs: totalEntrepreneurs?.count || 0,
        totalShgs: totalShgs?.count || 0,
        activeCases: activeCases?.count || 0,
        resolvedCases: resolvedCases?.count || 0,
        totalPrograms: totalPrograms?.count || 0,
        totalMentors: totalMentors?.count || 0
      },
      openCases,
      pendingEntrepreneurs
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/women/admin/cases/:id - Update case status & assign coordinator
router.patch('/admin/cases/:id', authenticateToken, async (req, res, next) => {
  try {
    if (!isModerator(req.user)) {
      return sendError(res, 'केवळ महिला कक्ष अधिकाऱ्यांसाठी राखीव.', 'FORBIDDEN', 403);
    }

    const { id } = req.params;
    const { status, coordinator, coordinatorPhone, notes } = req.body;

    const existing = await get('SELECT * FROM women_help_cases WHERE id = ?', [id]);
    if (!existing) {
      return sendError(res, 'मदत प्रकरण आढळले नाही.', 'NOT_FOUND', 404);
    }

    const newStatus = status || existing.status;
    const resolvedAt = (newStatus === 'सोडवले' || newStatus === 'यशस्वीरीत्या सोडवले') ? new Date().toISOString() : existing.resolved_at;

    await runQuery(`
      UPDATE women_help_cases
      SET status = ?, assigned_coordinator = ?, coordinator_phone = ?, counselor_notes = ?, resolved_at = ?
      WHERE id = ?
    `, [
      newStatus,
      coordinator || existing.assigned_coordinator,
      coordinatorPhone || existing.coordinator_phone,
      notes || existing.counselor_notes,
      resolvedAt,
      id
    ]);

    saveDatabaseNow();

    return sendSuccess(res, `✓ प्रकरण #${existing.case_number} अद्यतनित केले.`);
  } catch (err) {
    next(err);
  }
});

export default router;
