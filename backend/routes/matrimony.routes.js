import { Router } from 'express';
import { runQuery, get, all, saveDatabase } from '../../database/database.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize, cleanPhone, isValidPhone } from '../utils/validator.js';

const router = Router();

// Helper to check if current user is admin/superadmin/moderator
function isModerator(user) {
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  return ['superadmin', 'admin', 'moderator', 'chapter_president', 'center_manager'].includes(role);
}

// ── 1. GET /api/matrimony - Public / Member Search ───────────────────────
router.get('/', optionalToken, async (req, res, next) => {
  try {
    const {
      gender,
      district,
      caste,
      kul,
      minAge,
      maxAge,
      education,
      profession,
      search,
      includePending
    } = req.query;

    const isMod = isModerator(req.user);
    const conditions = [];
    const params = [];

    // Filter by approval status
    if (!isMod || includePending !== 'true') {
      conditions.push("(status = 'approved' OR status IS NULL OR verified = 1)");
    }

    if (gender && gender !== 'all' && gender !== 'सर्व') {
      const gTerm = gender.includes('वर') || gender.toLowerCase() === 'groom' ? '%वर%' : '%वधू%';
      conditions.push('gender LIKE ?');
      params.push(gTerm);
    }

    if (district && district !== 'all' && district !== 'सर्व') {
      conditions.push('(district LIKE ? OR city LIKE ?)');
      params.push(`%${district}%`, `%${district}%`);
    }

    if (caste && caste !== 'all' && caste !== 'सर्व') {
      conditions.push('caste LIKE ?');
      params.push(`%${caste}%`);
    }

    if (kul && kul !== 'all' && kul !== 'सर्व') {
      conditions.push('kul LIKE ?');
      params.push(`%${kul}%`);
    }

    if (minAge) {
      conditions.push('CAST(age AS INTEGER) >= ?');
      params.push(Number(minAge));
    }
    if (maxAge) {
      conditions.push('CAST(age AS INTEGER) <= ?');
      params.push(Number(maxAge));
    }

    if (education && education !== 'all' && education !== 'सर्व') {
      conditions.push('education LIKE ?');
      params.push(`%${education}%`);
    }

    if (profession && profession !== 'all' && profession !== 'सर्व') {
      conditions.push('profession LIKE ?');
      params.push(`%${profession}%`);
    }

    if (search) {
      const q = `%${search.trim()}%`;
      conditions.push('(name LIKE ? OR education LIKE ? OR profession LIKE ? OR kul LIKE ? OR city LIKE ? OR district LIKE ?)');
      params.push(q, q, q, q, q, q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM matrimony_profiles ${whereClause} ORDER BY created_at DESC LIMIT 100`;

    const rows = await all(sql, params);

    // Privacy Masking: Check accepted interests if logged in
    let acceptedProfileIds = new Set();
    if (req.user) {
      const myAccepted = await all(`
        SELECT receiver_profile_id, sender_profile_id 
        FROM matrimony_interests 
        WHERE (sender_id = ? OR receiver_profile_id IN (SELECT id FROM matrimony_profiles WHERE member_id = ?))
          AND status = 'accepted'
      `, [req.user.id, req.user.id]);
      
      myAccepted.forEach(row => {
        acceptedProfileIds.add(row.receiver_profile_id);
        acceptedProfileIds.add(row.sender_profile_id);
      });
    }

    const sanitizedProfiles = rows.map(p => {
      const isOwner = req.user && (p.member_id === req.user.id);
      const isContactUnlocked = isMod || isOwner || acceptedProfileIds.has(p.id);

      const rawPhone = p.contact || p.phone || '';
      const maskedContact = rawPhone ? rawPhone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : 'उपलब्ध नाही';

      return {
        ...p,
        contact: isContactUnlocked ? rawPhone : (req.user ? maskedContact : 'लॉगिन करा'),
        isContactUnlocked,
        isOwner
      };
    });

    return sendSuccess(res, 'विवाह परिचय स्थळे प्राप्त झाली', { profiles: sanitizedProfiles, count: sanitizedProfiles.length });
  } catch (err) {
    next(err);
  }
});

// ── 2. GET /api/matrimony/my - Member's Own Profiles & Sent/Received Interests ─
router.get('/my', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userPhone = req.user.phone ? cleanPhone(req.user.phone) : '';

    const myProfiles = await all(`
      SELECT * FROM matrimony_profiles 
      WHERE member_id = ? OR (contact != '' AND contact = ?)
      ORDER BY created_at DESC
    `, [userId, userPhone]);

    // Attach interest counts
    for (const p of myProfiles) {
      const incCount = await get('SELECT COUNT(*) as cnt FROM matrimony_interests WHERE receiver_profile_id = ?', [p.id]);
      p.interestsCount = incCount?.cnt || 0;
    }

    // Get interests sent by this user
    const sentInterests = await all(`
      SELECT i.*, p.name as target_name, p.gender as target_gender, p.education as target_education, p.city as target_city, p.photo as target_photo, p.contact as target_phone
      FROM matrimony_interests i
      LEFT JOIN matrimony_profiles p ON i.receiver_profile_id = p.id
      WHERE i.sender_id = ?
      ORDER BY i.created_at DESC
    `, [userId]);

    // Get interests received by user's profiles
    const profileIds = myProfiles.map(p => p.id);
    let receivedInterests = [];
    if (profileIds.length > 0) {
      const placeholders = profileIds.map(() => '?').join(',');
      receivedInterests = await all(`
        SELECT i.*, p.name as sender_profile_name, p.education as sender_profile_edu, p.city as sender_profile_city, p.photo as sender_profile_photo
        FROM matrimony_interests i
        LEFT JOIN matrimony_profiles p ON i.sender_profile_id = p.id
        WHERE i.receiver_profile_id IN (${placeholders})
        ORDER BY i.created_at DESC
      `, profileIds);
    }

    return sendSuccess(res, 'माझे विवाह बायो-डाटा प्रोफाईल व संपर्क विनंत्या', {
      profiles: myProfiles,
      sentInterests,
      receivedInterests
    });
  } catch (err) {
    next(err);
  }
});

// ── 3. GET /api/matrimony/admin/queue - Verification & Moderation Queue ──
router.get('/admin/queue', authenticateToken, async (req, res, next) => {
  try {
    if (!isModerator(req.user)) {
      return sendError(res, 'प्रशासक किंवा विवाह समिती परवानगी आवश्यक.', 'FORBIDDEN', 403);
    }

    const pending = await all(`
      SELECT * FROM matrimony_profiles 
      WHERE status = 'pending_approval' OR verified = 0
      ORDER BY created_at DESC
    `);

    const reports = await all(`
      SELECT r.*, p.name as reported_name, p.gender as reported_gender 
      FROM matrimony_reports r
      LEFT JOIN matrimony_profiles p ON r.reported_profile_id = p.id
      WHERE r.status = 'open'
      ORDER BY r.created_at DESC
    `);

    return sendSuccess(res, 'विवाह समिती पडताळणी रांग व तक्रारी', {
      pendingProfiles: pending,
      openReports: reports,
      pendingCount: pending.length,
      reportsCount: reports.length
    });
  } catch (err) {
    next(err);
  }
});

// ── 4. GET /api/matrimony/:id - Single Profile Full View ───────────────────
router.get('/:id', optionalToken, async (req, res, next) => {
  try {
    const profile = await get('SELECT * FROM matrimony_profiles WHERE id = ?', [req.params.id]);
    if (!profile) {
      return sendError(res, 'विवाह प्रोफाईल सापडले नाही.', 'PROFILE_NOT_FOUND', 404);
    }

    let isContactUnlocked = false;
    let isOwner = false;
    const isMod = isModerator(req.user);

    if (req.user) {
      isOwner = profile.member_id === req.user.id;
      if (isOwner || isMod) {
        isContactUnlocked = true;
      } else {
        const mutual = await get(`
          SELECT id FROM matrimony_interests 
          WHERE ((sender_id = ? AND receiver_profile_id = ?) OR (sender_profile_id = ? AND receiver_profile_id IN (SELECT id FROM matrimony_profiles WHERE member_id = ?)))
            AND status = 'accepted'
        `, [req.user.id, profile.id, profile.id, req.user.id]);
        if (mutual) isContactUnlocked = true;
      }
    }

    const rawContact = profile.contact || profile.phone || '';
    const maskedContact = rawContact ? rawContact.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : 'उपलब्ध नाही';

    const safeProfile = {
      ...profile,
      contact: isContactUnlocked ? rawContact : (req.user ? maskedContact : 'लॉगिन करा'),
      isContactUnlocked,
      isOwner
    };

    return sendSuccess(res, 'विवाह प्रोफाईल तपशील', { profile: safeProfile });
  } catch (err) {
    next(err);
  }
});

// ── 5. POST /api/matrimony - Register Bio-data Profile ─────────────────────
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const {
      name,
      gender,
      birthDate,
      birthTime,
      birthPlace,
      age,
      height,
      caste,
      kul,
      gotra,
      devak,
      rashi,
      nakshatra,
      mangal,
      education,
      profession,
      company,
      income,
      city,
      district,
      taluka,
      nativePlace,
      fatherName,
      fatherOccupation,
      motherMaherKul,
      mamaKul,
      siblingsInfo,
      expectations,
      about,
      phone,
      photo
    } = req.body;

    if (!name || !gender) {
      return sendError(res, 'नाव आणि लिंग आवश्यक आहे.', 'MISSING_FIELDS', 400);
    }

    const isGroom = (gender || '').includes('वर') || (gender || '').toLowerCase() === 'groom';
    const cleanPhoneNum = phone ? cleanPhone(phone) : (req.user.phone ? cleanPhone(req.user.phone) : '');
    const isMod = isModerator(req.user);

    const profileId = `CM-${isGroom ? 'M' : 'F'}-${Date.now().toString().slice(-4)}`;
    const calcAge = Number(age) || (birthDate ? Math.floor((new Date() - new Date(birthDate)) / (365.25 * 24 * 3600 * 1000)) : 26);

    const defaultPhoto = photo || (isGroom ? '/assets/images/matrimony/groom_abhishek.jpg' : '/assets/images/matrimony/bride_snehal.jpg');

    await runQuery(`
      INSERT INTO matrimony_profiles (
        id, member_id, name, gender, birth_date, birth_time, birth_place, age, height,
        caste, kul, gotra, devak, rashi, nakshatra, mangal,
        education, profession, company, income, city, district, taluka, native_place,
        father_name, father_occupation, mother_maher_kul, mama_kul, siblings_info,
        expectations, about, photo, contact, verified, status, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')
      )
    `, [
      profileId,
      req.user.id,
      sanitize(name),
      isGroom ? 'वर (Groom)' : 'वधू (Bride)',
      birthDate || null,
      sanitize(birthTime) || '',
      sanitize(birthPlace) || '',
      calcAge,
      sanitize(height) || "5' 8\"",
      sanitize(caste) || '९६ कुळी मराठा',
      sanitize(kul) || 'मराठा',
      sanitize(gotra) || 'कश्यप',
      sanitize(devak) || '',
      sanitize(rashi) || '',
      sanitize(nakshatra) || '',
      sanitize(mangal) || 'नाही',
      sanitize(education) || 'पदवीधर',
      sanitize(profession) || 'व्यवसाय / सेवा',
      sanitize(company) || '',
      sanitize(income) || 'उत्पन्न खुलासेवार',
      sanitize(city) || sanitize(district) || 'पुणे',
      sanitize(district) || sanitize(city) || 'पुणे',
      sanitize(taluka) || '',
      sanitize(nativePlace) || 'महाराष्ट्र',
      sanitize(fatherName) || '',
      sanitize(fatherOccupation) || '',
      sanitize(motherMaherKul) || '',
      sanitize(mamaKul) || '',
      sanitize(siblingsInfo) || '',
      sanitize(expectations) || 'सुशिक्षित व सुसंस्कृत अनुरूप जोडीदार.',
      sanitize(about) || '',
      defaultPhoto,
      cleanPhoneNum,
      isMod ? 1 : 0,
      isMod ? 'approved' : 'pending_approval'
    ]);

    saveDatabase();

    const created = await get('SELECT * FROM matrimony_profiles WHERE id = ?', [profileId]);
    return sendSuccess(res, '💍 विवाह प्रोफाइल यशस्वीरीत्या नोंदवले गेले! पडताळणीनंतर पोर्टलवर सक्रिय होईल.', { profile: created }, 201);
  } catch (err) {
    next(err);
  }
});

// ── 6. POST /api/matrimony/:id/interest - Express Interest / Connect Request ─
router.post('/:id/interest', authenticateToken, async (req, res, next) => {
  try {
    const profile = await get('SELECT * FROM matrimony_profiles WHERE id = ?', [req.params.id]);
    if (!profile) {
      return sendError(res, 'विवाह प्रोफाईल सापडले नाही.', 'PROFILE_NOT_FOUND', 404);
    }

    if (profile.member_id === req.user.id) {
      return sendError(res, 'स्वतःच्या प्रोफाईलला पसंती विनंती पाठवता येत नाही.', 'INVALID_REQUEST', 400);
    }

    // Check if interest already sent
    const existing = await get(`
      SELECT id FROM matrimony_interests 
      WHERE sender_id = ? AND receiver_profile_id = ?
    `, [req.user.id, profile.id]);

    if (existing) {
      return sendError(res, 'आपण या प्रोफाईलला आधीच पसंती विनंती पाठवली आहे.', 'ALREADY_SENT', 400);
    }

    const { senderProfileId, relation, message, phone } = req.body;
    const cleanPhoneNum = cleanPhone(phone || req.user.phone || '');

    const interestId = `INT-${Date.now().toString().slice(-4)}`;

    await runQuery(`
      INSERT INTO matrimony_interests (
        id, sender_id, sender_profile_id, receiver_profile_id,
        sender_name, receiver_name, sender_phone, relation, message, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `, [
      interestId,
      req.user.id,
      senderProfileId || null,
      profile.id,
      req.user.name || 'सभासद',
      profile.name,
      cleanPhoneNum,
      sanitize(relation) || 'स्वतः / पालक',
      sanitize(message) || 'आम्हाला आपल्या बायो-डाटा मध्ये आवड आहे. कृपया पसंती स्वीकारून संपर्क साधावा.'
    ]);

    saveDatabase();
    return sendSuccess(res, '❤️ पसंती विनंती (Interest Request) यशस्वीरीत्या पाठवली!', { interestId }, 201);
  } catch (err) {
    next(err);
  }
});

// ── 7. PATCH /api/matrimony/interests/:id - Accept / Decline Interest ─────
router.patch('/interests/:id', authenticateToken, async (req, res, next) => {
  try {
    const { action } = req.body; // 'accept' or 'decline'
    if (!['accept', 'decline'].includes(action)) {
      return sendError(res, 'अवैध कृती.', 'INVALID_ACTION', 400);
    }

    const interest = await get('SELECT * FROM matrimony_interests WHERE id = ?', [req.params.id]);
    if (!interest) {
      return sendError(res, 'विनंती सापडली नाही.', 'NOT_FOUND', 404);
    }

    // Verify current user owns the receiving profile
    const targetProfile = await get('SELECT member_id FROM matrimony_profiles WHERE id = ?', [interest.receiver_profile_id]);
    const isOwner = targetProfile && targetProfile.member_id === req.user.id;
    const isMod = isModerator(req.user);

    if (!isOwner && !isMod) {
      return sendError(res, 'केवळ संबंधित उमेदवार किंवा पालक ही विनंती स्वीकारू शकतात.', 'FORBIDDEN', 403);
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    await runQuery(`
      UPDATE matrimony_interests 
      SET status = ?, responded_at = datetime('now') 
      WHERE id = ?
    `, [newStatus, req.params.id]);

    saveDatabase();

    const msg = action === 'accept'
      ? '🤝 पसंती स्वीकारली! दोन्ही बाजूंचे संपर्क नंबर आता अनलॉक झाले आहेत.'
      : 'विनंती नाकारण्यात आली.';

    return sendSuccess(res, msg, { interestId: req.params.id, status: newStatus });
  } catch (err) {
    next(err);
  }
});

// ── 8. POST /api/matrimony/:id/report - Report Inappropriate Profile ───────
router.post('/:id/report', authenticateToken, async (req, res, next) => {
  try {
    const { reason, details } = req.body;
    if (!reason) {
      return sendError(res, 'तक्रारीचे कारण आवश्यक आहे.', 'REASON_REQUIRED', 400);
    }

    const reportId = `REP-${Date.now().toString().slice(-4)}`;
    await runQuery(`
      INSERT INTO matrimony_reports (
        id, reported_profile_id, reported_by_id, reporter_name, reason, details, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'open', datetime('now'))
    `, [
      reportId,
      req.params.id,
      req.user.id,
      req.user.name || 'सभासद',
      sanitize(reason),
      sanitize(details) || ''
    ]);

    saveDatabase();
    return sendSuccess(res, 'तक्रार नोंदवण्यात आली आहे. विवाह समिती त्वरित तपास करेल.', { reportId }, 201);
  } catch (err) {
    next(err);
  }
});

// ── 9. PATCH /api/matrimony/admin/verify - Verify / Suspend Profile ─────────
router.patch('/admin/verify', authenticateToken, async (req, res, next) => {
  try {
    if (!isModerator(req.user)) {
      return sendError(res, 'केवळ विवाह समिती किंवा प्रशासक पडताळणी करू शकतात.', 'FORBIDDEN', 403);
    }

    const { profileId, status, verified, notes } = req.body;
    if (!profileId) {
      return sendError(res, 'प्रोफाईल आयडी आवश्यक आहे.', 'ID_REQUIRED', 400);
    }

    const newStatus = status || 'approved';
    const isVer = verified !== undefined ? (verified ? 1 : 0) : 1;

    await runQuery(`
      UPDATE matrimony_profiles 
      SET status = ?, verified = ?, updated_at = datetime('now')
      WHERE id = ?
    `, [newStatus, isVer, profileId]);

    saveDatabase();
    return sendSuccess(res, `प्रोफाईल स्थिती '${newStatus}' अद्ययावत केली.`, { profileId, status: newStatus, verified: isVer });
  } catch (err) {
    next(err);
  }
});

export default router;
