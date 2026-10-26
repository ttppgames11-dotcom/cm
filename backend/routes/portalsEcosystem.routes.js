// backend/routes/portalsEcosystem.routes.js
import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// ==========================================
// 1. HIGHER EDUCATION & CAREER GUIDANCE
// ==========================================

// GET /api/portals/colleges - Search & Filter Colleges
router.get('/colleges', async (req, res, next) => {
  try {
    const { stream, district, division, search, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM colleges_directory WHERE 1=1';
    const params = [];

    if (stream && stream !== 'all') {
      query += ' AND (stream = ? OR streams LIKE ?)';
      params.push(stream, `%"${stream}"%`);
    }
    if (district && district !== 'all') {
      query += ' AND district = ?';
      params.push(district);
    }
    if (division && division !== 'all') {
      query += ' AND division = ?';
      params.push(division);
    }
    if (search) {
      query += ' AND (name LIKE ? OR city LIKE ? OR stream_label LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countRow = await get(`SELECT COUNT(*) as total FROM (${query})`, params);
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    query += ' ORDER BY established_year ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), offset);

    const rows = await all(query, params);
    return sendSuccess(res, 'Colleges fetched successfully', {
      total: countRow?.total || rows.length,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      colleges: rows
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/portals/colleges/:id - College detail with comparison stats
router.get('/colleges/:id', async (req, res, next) => {
  try {
    const college = await get('SELECT * FROM colleges_directory WHERE id = ?', [req.params.id]);
    if (!college) return sendError(res, 'महाविद्यालय सापडले नाही', 404);
    return sendSuccess(res, 'College details', college);
  } catch (err) {
    next(err);
  }
});

// POST /api/portals/career-guidance/book - Book Career Consultation (Giver-Taker)
router.post('/career-guidance/book', async (req, res, next) => {
  try {
    const { student_name, phone, email, district, current_education, target_field, notes } = req.body;
    if (!student_name || !phone) {
      return sendError(res, 'विद्यार्थ्याचे नाव आणि मोबाईल नंबर आवश्यक आहे', 400);
    }

    const id = `counsel_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const userId = req.headers['x-user-id'] || null;

    await runQuery(
      `INSERT INTO career_guidance_bookings 
      (id, user_id, student_name, phone, email, district, current_education, target_field, notes, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [id, userId, student_name, phone, email || '', district || '', current_education || '', target_field || '', notes || '', new Date().toISOString()]
    );

    return sendSuccess(res, 'करिअर मार्गदर्शन सत्र यशस्वीरित्या बुक झाले! आमचे काउन्सिलर लवकरच संपर्क करतील.', { id, status: 'pending' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. SCHOLARSHIPS & STUDENT AID
// ==========================================

// GET /api/portals/scholarships - Directory of schemes
router.get('/scholarships', async (req, res, next) => {
  try {
    const { type, category, search } = req.query;
    let query = 'SELECT * FROM scholarships_directory WHERE status = "active"';
    const params = [];

    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (title LIKE ? OR eligible LIKE ? OR benefit LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const schemes = await all(query, params);
    return sendSuccess(res, 'Scholarships retrieved', schemes);
  } catch (err) {
    next(err);
  }
});

// POST /api/portals/scholarships/check-eligibility
router.post('/scholarships/check-eligibility', async (req, res, next) => {
  try {
    const { marks = 0, family_income = 800000, course = '' } = req.body;
    const allSchemes = await all('SELECT * FROM scholarships_directory WHERE status = "active"');

    const matched = allSchemes.filter(s => {
      const marksMatch = !s.min_marks || parseFloat(marks) >= s.min_marks;
      const incomeMatch = !s.max_income || parseFloat(family_income) <= s.max_income;
      return marksMatch && incomeMatch;
    });

    return sendSuccess(res, 'पात्रता विश्लेषण पूर्ण', {
      totalFound: matched.length,
      matchedSchemes: matched,
      status: matched.length > 0 ? 'Potentially Eligible' : 'Criteria Not Matching'
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/portals/scholarships/apply - Apply for CM Student Aid / Scheme
router.post('/scholarships/apply', async (req, res, next) => {
  try {
    const { scholarship_id, student_name, email, phone, district, current_course, family_income, marks_percentage } = req.body;
    if (!scholarship_id || !student_name || !phone) {
      return sendError(res, 'शिष्यवृत्ती आयडी, नाव व फोन नंबर अनिवार्य आहेत', 400);
    }

    const id = `app_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const userId = req.headers['x-user-id'] || `guest_${Date.now()}`;

    await runQuery(
      `INSERT INTO scholarship_applications
      (id, scholarship_id, user_id, student_name, email, phone, district, current_course, family_income, marks_percentage, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`,
      [
        id, scholarship_id, userId, student_name, email || '', phone, district || '',
        current_course || '', parseFloat(family_income) || 0, parseFloat(marks_percentage) || 0,
        new Date().toISOString(), new Date().toISOString()
      ]
    );

    return sendSuccess(res, 'शिष्यवृत्ती अर्ज यशस्वीरित्या सादर झाला! अर्जाचा क्रमांक जतन करा.', { application_id: id, status: 'submitted' });
  } catch (err) {
    next(err);
  }
});

// GET /api/portals/scholarships/my-applications
router.get('/scholarships/my-applications', async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return sendError(res, 'युझर आयडी आवश्यक आहे', 401);

    const apps = await all(
      `SELECT a.*, s.title as scholarship_title, s.org, s.benefit, s.badge 
       FROM scholarship_applications a
       LEFT JOIN scholarships_directory s ON a.scholarship_id = s.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );
    return sendSuccess(res, 'My applications', apps);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. MARATHA DNYANKOSH (ज्ञानकोश)
// ==========================================

// GET /api/portals/dnyankosh - Encyclopedia Articles
router.get('/dnyankosh', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM dnyankosh_articles WHERE status = "published"';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';
    const articles = await all(query, params);
    return sendSuccess(res, 'Dnyankosh articles', articles);
  } catch (err) {
    next(err);
  }
});

// GET /api/portals/dnyankosh/:slug - Full Article with Views Incremented
router.get('/dnyankosh/:slug', async (req, res, next) => {
  try {
    const article = await get('SELECT * FROM dnyankosh_articles WHERE slug = ? OR id = ?', [req.params.slug, req.params.slug]);
    if (!article) return sendError(res, 'ज्ञानकोश लेख सापडला नाही', 404);

    await runQuery('UPDATE dnyankosh_articles SET views_count = views_count + 1 WHERE id = ?', [article.id]);
    return sendSuccess(res, 'Article detail', article);
  } catch (err) {
    next(err);
  }
});

// POST /api/portals/dnyankosh/submit - Community Contributor submits article (Giver Flow)
router.post('/dnyankosh/submit', async (req, res, next) => {
  try {
    const { title, category, subcategory, icon = '📝', summary, content, author_name, sources } = req.body;
    if (!title || !content) return sendError(res, 'शीर्षक आणि मजकूर अनिवार्य आहे', 400);

    const id = `art_${Date.now()}`;
    const slug = title.trim().toLowerCase().replace(/[\s\W-]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
    const authorId = req.headers['x-user-id'] || 'contributor_anon';

    await runQuery(
      `INSERT INTO dnyankosh_articles
      (id, slug, title, category, subcategory, icon, summary, content, author_id, author_name, status, sources, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)`,
      [
        id, slug, title, category || 'मराठा इतिहास', subcategory || 'सामान्य', icon,
        summary || title, content, authorId, author_name || 'समाज सदस्य',
        JSON.stringify(sources || []), new Date().toISOString(), new Date().toISOString()
      ]
    );

    return sendSuccess(res, 'तुमचा ज्ञानकोश लेख संपादकीय तपासणीसाठी (Editorial Review) सादर झाला आहे!', { id, slug, status: 'draft' });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 4. MARATHA GRANTHALAYA & RARE BAKHARS
// ==========================================

// GET /api/portals/library - Catalogue & Bakhars
router.get('/library', async (req, res, next) => {
  try {
    const { category, is_rare_bakhar, search } = req.query;
    let query = 'SELECT * FROM library_catalog WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (is_rare_bakhar !== undefined && is_rare_bakhar !== '') {
      query += ' AND is_rare_bakhar = ?';
      params.push(parseInt(is_rare_bakhar, 10));
    }
    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY is_rare_bakhar DESC, created_at DESC';
    const books = await all(query, params);
    return sendSuccess(res, 'Library catalogue fetched', books);
  } catch (err) {
    next(err);
  }
});

// GET /api/portals/library/:id - Detail & Sections
router.get('/library/:id', async (req, res, next) => {
  try {
    const book = await get('SELECT * FROM library_catalog WHERE id = ?', [req.params.id]);
    if (!book) return sendError(res, 'ग्रंथ सापडला नाही', 404);
    return sendSuccess(res, 'Book detail', book);
  } catch (err) {
    next(err);
  }
});

// POST /api/portals/library/submit - User or admin uploads book/bakhar
router.post('/library/submit', async (req, res, next) => {
  try {
    const {
      title,
      original_title,
      author,
      category = 'बखर व ऐतिहासिक दस्तऐवज',
      level = 'प्रमाणित',
      pages = '150 पानं',
      language = 'मोडी / मराठी',
      description = '',
      highlight = '',
      preservation = 'डिजिटल जतन',
      is_rare_bakhar = 0,
      pdf_url = '',
      status = 'verified'
    } = req.body;

    if (!title || !author) {
      return sendError(res, 'ग्रंथाचे नाव व लेखक आवश्यक आहेत!', 'MISSING_FIELD', 400);
    }

    const id = 'BK_' + Date.now();
    await runQuery(`
      INSERT INTO library_catalog (
        id, title, original_title, author, category, level, pages,
        language, description, highlight, preservation, is_rare_bakhar,
        status, pdf_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      id, title, original_title || title, author, category, level, pages,
      language, description, highlight, preservation, is_rare_bakhar ? 1 : 0,
      status, pdf_url
    ]);

    return sendSuccess(res, 'ग्रंथ / बखर डिजिटल ग्रंथालयात यशस्वीरीत्या नोंदवला गेला!', { id, title });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 5. MAHARASHTRA TIME MACHINE
// ==========================================

// GET /api/portals/time-machine/events - Chronological timeline events
router.get('/time-machine/events', async (req, res, next) => {
  try {
    const { era, year, search } = req.query;
    let query = 'SELECT * FROM time_machine_events WHERE 1=1';
    const params = [];

    if (era && era !== 'all') {
      query += ' AND era_id = ?';
      params.push(era);
    }
    if (year) {
      query += ' AND year = ?';
      params.push(parseInt(year, 10));
    }
    if (search) {
      query += ' AND (title LIKE ? OR location LIKE ? OR summary LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY year ASC';
    const events = await all(query, params);
    return sendSuccess(res, 'Time Machine timeline events', events);
  } catch (err) {
    next(err);
  }
});

// POST /api/portals/time-machine/events/submit - Submit historic event
router.post('/time-machine/events/submit', async (req, res, next) => {
  try {
    const {
      year,
      approx_date = '',
      era_id = 'shivaji_maharaj',
      era_title = 'छत्रपती शिवाजी महाराज कालखंड',
      title,
      location = '',
      summary = '',
      details = '',
      historical_significance = '',
      source_reference = ''
    } = req.body;

    if (!title || !year) {
      return sendError(res, 'घटनेचे नाव व वर्ष आवश्यक आहे!', 'MISSING_FIELD', 400);
    }

    const id = 'EV_' + Date.now();
    await runQuery(`
      INSERT INTO time_machine_events (
        id, year, approx_date, era_id, era_title, title, location,
        summary, details, historical_significance, source_reference, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      id, parseInt(year, 10), approx_date, era_id, era_title, title, location,
      summary, details, historical_significance, source_reference
    ]);

    return sendSuccess(res, 'ऐतिहासिक प्रसंग टाईम मशीनमध्ये यशस्वीरीत्या नोंदवला गेला!', { id, title, year });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 6. CENTRAL ECOSYSTEM STATS & SEARCH
// ==========================================

// GET /api/portals/unified-stats - Dashboard stats for all 7 portals
router.get('/unified-stats', async (req, res, next) => {
  try {
    const colleges = await get('SELECT COUNT(*) as count FROM colleges_directory');
    const scholarships = await get('SELECT COUNT(*) as count FROM scholarships_directory');
    const quizCount = await get('SELECT COUNT(*) as count FROM quiz_questions');
    const dnyankosh = await get('SELECT COUNT(*) as count FROM dnyankosh_articles');
    const library = await get('SELECT COUNT(*) as count FROM library_catalog');
    const timeMachine = await get('SELECT COUNT(*) as count FROM time_machine_events');
    const applications = await get('SELECT COUNT(*) as count FROM scholarship_applications');

    return sendSuccess(res, 'Unified 7 Portals Stats', {
      collegesCount: colleges?.count || 0,
      scholarshipsCount: scholarships?.count || 0,
      quizQuestionsCount: quizCount?.count || 0,
      dnyankoshArticlesCount: dnyankosh?.count || 0,
      libraryBooksCount: library?.count || 0,
      timeMachineEventsCount: timeMachine?.count || 0,
      studentApplicationsCount: applications?.count || 0
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 7. SUPER ADMIN CMS & APPROVAL MATRIX (Phase 5)
// ==========================================

// GET /api/portals/admin/pending-approvals - Fetch pending items across 7 portals
router.get('/admin/pending-approvals', async (req, res, next) => {
  try {
    const pendingArticles = await all(
      'SELECT id, title, category, subcategory, author_name, status, created_at FROM dnyankosh_articles WHERE status != "published" ORDER BY created_at DESC'
    );
    const pendingApplications = await all(
      `SELECT a.*, s.title as scholarship_title, s.org, s.benefit 
       FROM scholarship_applications a
       LEFT JOIN scholarships_directory s ON a.scholarship_id = s.id
       ORDER BY a.created_at DESC`
    );
    const pendingGuidance = await all(
      'SELECT * FROM career_guidance_bookings ORDER BY created_at DESC'
    );
    const pendingOrganizations = await all(
      'SELECT id, name, category, district, city, phone, verification_status as status, created_at FROM organizations WHERE verification_status != "verified" ORDER BY created_at DESC'
    ).catch(() => []);
    const pendingHelpRequests = await all(
      'SELECT id, applicant_name, category, district, urgency, status, created_at FROM social_help_requests WHERE status != "सोडवले" ORDER BY created_at DESC'
    ).catch(() => []);
    const pendingNews = await all(
      'SELECT id, title, category, district, author_name as author, is_published, created_at FROM news_articles WHERE is_published = 0 ORDER BY created_at DESC'
    ).catch(() => []);

    return sendSuccess(res, 'Pending approvals list', {
      articles: pendingArticles,
      scholarshipApplications: pendingApplications,
      careerGuidance: pendingGuidance,
      organizations: pendingOrganizations,
      helpRequests: pendingHelpRequests,
      newsArticles: pendingNews
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/portals/admin/articles/:id/action - Publish or Reject Article
router.post('/admin/articles/:id/action', async (req, res, next) => {
  try {
    const { action } = req.body; // 'publish' | 'reject'
    const newStatus = action === 'publish' ? 'published' : 'rejected';

    await runQuery(
      'UPDATE dnyankosh_articles SET status = ?, updated_at = ? WHERE id = ?',
      [newStatus, new Date().toISOString(), req.params.id]
    );

    return sendSuccess(res, `ज्ञानकोश लेख ${action === 'publish' ? 'यशस्वीरीत्या प्रकाशित झाला!' : 'नाकारला गेला.'}`, {
      id: req.params.id,
      status: newStatus
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/portals/admin/scholarships/:id/action - Approve, Reject or Disburse Aid
router.post('/admin/scholarships/:id/action', async (req, res, next) => {
  try {
    const { status, notes } = req.body; // 'approved' | 'rejected' | 'disbursed'
    if (!['approved', 'rejected', 'disbursed', 'under_review'].includes(status)) {
      return sendError(res, 'अवैध स्थिती', 400);
    }

    await runQuery(
      'UPDATE scholarship_applications SET status = ?, reviewer_notes = ?, updated_at = ? WHERE id = ?',
      [status, notes || '', new Date().toISOString(), req.params.id]
    );

    return sendSuccess(res, `शिष्यवृत्ती अर्ज स्थिती बदलून "${status}" केली आहे!`, {
      id: req.params.id,
      status
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/portals/admin/guidance/:id/action - Update Career Guidance Session Status
router.post('/admin/guidance/:id/action', async (req, res, next) => {
  try {
    const { status, notes } = req.body; // 'scheduled' | 'completed' | 'cancelled'
    await runQuery(
      'UPDATE career_guidance_bookings SET status = ?, notes = ? WHERE id = ?',
      [status, notes || '', req.params.id]
    );

    return sendSuccess(res, 'करिअर मार्गदर्शन सत्र अद्ययावत केले!', {
      id: req.params.id,
      status
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 8. ADMIN DIRECT ENTRY: COLLEGES & SCHOLARSHIPS
// ==========================================

// POST /api/portals/admin/colleges - Directly add new college
router.post('/admin/colleges', async (req, res, next) => {
  try {
    const {
      name,
      code,
      type = 'private',
      affiliation = 'Savitribai Phule Pune University',
      district = 'Pune',
      city = 'Pune',
      division = 'Pune',
      address = '',
      website = '',
      phone = '',
      email = '',
      established_year = 2000,
      naac_grade = 'A',
      hostel_facility = 1,
      stream = 'Engineering',
      stream_label = 'अभियांत्रिकी व तंत्रज्ञान',
      courses = ['B.E.', 'B.Tech'],
      fee_range = '₹80,000 - ₹1,40,000'
    } = req.body;

    if (!name) {
      return sendError(res, 'महाविद्यालयाचे नाव आवश्यक आहे!', 'MISSING_FIELD', 400);
    }

    const id = 'COL_' + Date.now();
    const coursesJson = JSON.stringify(Array.isArray(courses) ? courses : courses.split(',').map(s => s.trim()));
    const streamsJson = JSON.stringify([stream]);

    await runQuery(`
      INSERT INTO colleges_directory (
        id, name, code, type, affiliation, district, city, division,
        address, website, phone, email, established_year, naac_grade,
        hostel_facility, stream, stream_label, streams, courses,
        fee_range, verification_status, is_partner, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', 0, datetime('now'))
    `, [
      id, name, code || id, type, affiliation, district, city, division,
      address, website, phone, email, parseInt(established_year, 10), naac_grade,
      hostel_facility ? 1 : 0, stream, stream_label, streamsJson, coursesJson,
      fee_range
    ]);

    return sendSuccess(res, 'नवीन महाविद्यालय यशस्वीरीत्या जोडले!', { id, name });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/portals/admin/colleges/:id - Delete college
router.delete('/admin/colleges/:id', async (req, res, next) => {
  try {
    await runQuery('DELETE FROM colleges_directory WHERE id = ?', [req.params.id]);
    return sendSuccess(res, 'महाविद्यालय यशस्वीरीत्या हटवले!');
  } catch (err) {
    next(err);
  }
});

// POST /api/portals/admin/scholarships - Directly add new scholarship
router.post('/admin/scholarships', async (req, res, next) => {
  try {
    const {
      title,
      org,
      type = 'govt',
      category = 'मराठा / EBC प्रवर्ग',
      eligible = 'मराठा व खुल्या प्रवर्गातील विद्यार्थी',
      benefit = '१००% शिक्षण शुल्क सवलत',
      courses = 'सर्व पदवी व पदव्युत्तर',
      min_marks = 50,
      max_income = 800000,
      district = 'All',
      portal_url = 'https://mahadbt.maharashtra.gov.in',
      last_date = '31 Dec 2026',
      badge = 'लोकप्रिय',
      documents_required = ['उत्पन्न दाखला', 'जात प्रमाणपत्र', 'गुणपत्रिका']
    } = req.body;

    if (!title || !org) {
      return sendError(res, 'योजनेचे नाव व संस्था आवश्यक आहे!', 'MISSING_FIELD', 400);
    }

    const id = 'SCH_' + Date.now();
    const docsJson = JSON.stringify(Array.isArray(documents_required) ? documents_required : documents_required.split(',').map(s => s.trim()));

    await runQuery(`
      INSERT INTO scholarships_directory (
        id, title, org, type, category, eligible, benefit, courses,
        min_marks, max_income, district, portal_url, last_date, badge,
        documents_required, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'))
    `, [
      id, title, org, type, category, eligible, benefit, courses,
      parseFloat(min_marks), parseFloat(max_income), district, portal_url,
      last_date, badge, docsJson
    ]);

    return sendSuccess(res, 'नवीन शिष्यवृत्ती योजना यशस्वीरीत्या जोडली!', { id, title });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/portals/admin/scholarships/:id - Delete scholarship
router.delete('/admin/scholarships/:id', async (req, res, next) => {
  try {
    await runQuery('DELETE FROM scholarships_directory WHERE id = ?', [req.params.id]);
    return sendSuccess(res, 'शिष्यवृत्ती योजना यशस्वीरीत्या हटवली!');
  } catch (err) {
    next(err);
  }
});

export default router;

