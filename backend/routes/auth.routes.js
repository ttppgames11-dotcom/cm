import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runQuery, get, all, transaction } from '../../database/database.js';
import { generateToken, authenticateToken, JWT_SECRET } from '../middleware/auth.js';
import { sendPasswordResetOtpEmail, sendWelcomeEmail } from '../utils/mailer.js';
import { validateLocationHierarchy } from './locations.routes.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/validator.js';
import { ensureWebsiteTables } from '../utils/websiteTables.js';
import {
  loginSchema,
  registerSchema,
  googleAuthSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  deleteAccountSchema
} from '../schemas/auth.schemas.js';


const router = Router();

export function ensureMemberReferral(member) {
  if (!member) return member;
  if (!member.reference_id || !member.referral_id) {
    const numPart = String(member.id || '').replace(/\D/g, '') || Math.floor(1000 + Math.random() * 9000);
    const refCode = `REF-96K-${numPart}`;
    member.reference_id = member.reference_id || refCode;
    member.referral_id = member.referral_id || member.reference_id;
  }
  member.total_referrals = Number(member.total_referrals) || 0;
  return member;
}

export function normalizeMemberStrings(member) {
  if (!member) return member;
  if (typeof member.skills === 'string') {
    try {
      const parsed = JSON.parse(member.skills);
      if (Array.isArray(parsed)) {
        member.skills = parsed.join(', ');
      }
    } catch {}
  } else if (Array.isArray(member.skills)) {
    member.skills = member.skills.join(', ');
  }
  member.skills = member.skills || '';

  if (Array.isArray(member.about)) {
    member.about = member.about.join('\n');
  } else if (typeof member.about === 'string') {
    try {
      const parsed = JSON.parse(member.about);
      if (Array.isArray(parsed)) member.about = parsed.join('\n');
    } catch {}
  }
  member.about = member.about || '';
  return member;
}


// POST /api/auth/register
router.post('/register', authRateLimiter, validateBody(registerSchema, { atLeastOneOf: ['email', 'phone', 'mobile'], allowUnknown: true }), async (req, res, next) => {
  try {
    const phone = req.body.phone || req.body.mobile || '';
    const business = req.body.business || req.body.organization || '';
    const {
      name,
      email,
      password,
      city,
      district,
      state,
      country,
      countryId,
      stateId,
      districtId,
      talukaId,
      villageId,
      taluka,
      village,
      profession,
      education,
      skills,
      about
    } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({ success: false, error: 'नाव आणि ईमेल किंवा फोन नंबर आवश्यक आहे.' });
    }

    // Validate hierarchical location if provided
    if (countryId || stateId || districtId || talukaId || villageId) {
      const validation = await validateLocationHierarchy({ countryId, stateId, districtId, talukaId, villageId });
      if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
      }
    }

    // Check if user already exists (only check non-empty values)
    const existing = await get(`
      SELECT id FROM members 
      WHERE (? != '' AND email = ?) 
         OR (? != '' AND phone = ?)
    `, [email || '', email || '', phone || '', phone || '']);
    if (existing) {
      return res.status(400).json({ success: false, error: 'या ईमेल किंवा फोन क्रमांकासह सदस्य आधीच नोंदणीकृत आहे.' });
    }

    const memberId = 'M' + Math.floor(1000 + Math.random() * 9000);
    const passwordHash = password ? bcrypt.hashSync(password, 8) : null;
    
    // Normalize skills and about as strings
    let skillsString = '';
    if (Array.isArray(skills)) {
      skillsString = skills.map(s => String(s).trim()).filter(Boolean).join(', ');
    } else if (typeof skills === 'string') {
      skillsString = skills.trim();
    }

    let aboutString = '';
    if (Array.isArray(about)) {
      aboutString = about.map(a => String(a).trim()).filter(Boolean).join('\n');
    } else if (typeof about === 'string') {
      aboutString = about.trim();
    }

    // Resolve display names from IDs if names not provided
    let finalCountry = country || 'भारत';
    let finalState = state || 'महाराष्ट्र';
    let finalDistrict = district || 'पुणे';
    let finalTaluka = taluka || '';
    let finalVillage = village || '';

    if (countryId) {
      const c = await get('SELECT name FROM countries WHERE id = ?', [countryId]);
      if (c) finalCountry = c.name;
    }
    if (stateId) {
      const s = await get('SELECT name FROM states WHERE id = ?', [stateId]);
      if (s) finalState = s.name;
    }
    if (districtId) {
      const d = await get('SELECT name FROM districts WHERE id = ?', [districtId]);
      if (d) finalDistrict = d.name;
    }
    if (talukaId) {
      const t = await get('SELECT name FROM talukas WHERE id = ?', [talukaId]);
      if (t) finalTaluka = t.name;
    }
    if (villageId) {
      const v = await get('SELECT name FROM villages WHERE id = ?', [villageId]);
      if (v) finalVillage = v.name;
    }

    const computedCity = city || (finalVillage ? `${finalVillage}, ${finalTaluka}` : (finalTaluka ? `${finalTaluka}, ${finalDistrict}` : finalDistrict));

    // Process Referral / Reference ID
    const referralInput = (req.body.reference_id || req.body.referral_code || req.body.referred_by || req.body.referredBy || req.body.referralCode || req.body.referenceId || '').trim();
    let verifiedReferrer = null;
    if (referralInput) {
      const cleanUpper = referralInput.toUpperCase();
      const cleanDigits = referralInput.replace(/\D/g, '');
      verifiedReferrer = await get(`
        SELECT id, name, reference_id, referral_id, total_referrals FROM members
        WHERE UPPER(reference_id) = ? 
           OR UPPER(referral_id) = ?
           OR UPPER(id) = ?
           OR (? != '' AND SUBSTR(phone, -10) = ?)
      `, [cleanUpper, cleanUpper, cleanUpper, cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '', cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '']);
    }

    const assignedReferredBy = verifiedReferrer ? (verifiedReferrer.reference_id || verifiedReferrer.id) : (referralInput || null);
    const numPart = String(memberId).replace(/\D/g, '') || Math.floor(1000 + Math.random() * 9000);
    const newReferenceId = `REF-96K-${numPart}`;

    await runQuery(`
      INSERT INTO members (
        id, name, email, phone, password_hash, avatar, city, district, state, country,
        country_id, state_id, district_id, taluka_id, village_id, taluka, village,
        profession, business, education, skills, about, tier, role, joined, created_at,
        reference_id, referral_id, referred_by, total_referrals
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Basic', 'member', date('now'), datetime('now'), ?, ?, ?, 0)
    `, [
      memberId, name, email || '', phone || '', passwordHash, '👤', computedCity, finalDistrict, finalState, finalCountry,
      countryId || null, stateId || null, districtId || null, talukaId || null, villageId || null, finalTaluka, finalVillage,
      profession || '', business || '', education || '', skillsString, aboutString,
      newReferenceId, newReferenceId, assignedReferredBy
    ]);

    if (verifiedReferrer && verifiedReferrer.id) {
      await runQuery('UPDATE members SET total_referrals = COALESCE(total_referrals, 0) + 1 WHERE id = ?', [verifiedReferrer.id]);
    }

    const newMember = await get(`
      SELECT id, name, email, phone, avatar, city, district, state, country,
             country_id, state_id, district_id, taluka_id, village_id, taluka, village,
             profession, business, education, skills, about, tier, role, joined,
             reference_id, referral_id, referred_by, total_referrals
      FROM members WHERE id = ?
    `, [memberId]);
    
    normalizeMemberStrings(newMember);

    const token = generateToken(newMember);

    // Asynchronously dispatch welcome email if registered with email
    if (newMember.email && newMember.email.includes('@')) {
      sendWelcomeEmail({
        to: newMember.email,
        name: newMember.name,
        memberId: newMember.id,
      }).catch(e => console.error('[REGISTER] Welcome email error:', e.message));
    }

    res.status(201).json({
      success: true,
      message: 'नोंदणी यशस्वी झाली!',
      token,
      member: newMember
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', authRateLimiter, validateBody(loginSchema, { allowUnknown: true }), async (req, res, next) => {
  try {
    const rawId = req.body.identifier || req.body.phone || req.body.mobile || req.body.email;
    const { password } = req.body;

    if (!rawId) {
      return res.status(400).json({ success: false, error: 'कृपया आयडी, ईमेल किंवा फोन प्रविष्ट करा.' });
    }

    const cleanId = String(rawId).trim();
    const cleanDigits = cleanId.replace(/\D/g, '');
    const clean10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '';

    const member = await get(`
      SELECT * FROM members 
      WHERE id = ? 
         OR LOWER(email) = LOWER(?) 
         OR phone = ? 
         OR (? != '' AND (phone LIKE ? OR phone LIKE ?))
    `, [cleanId, cleanId, cleanId, clean10, '%' + clean10, '%' + clean10 + '%']);

    if (!member) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_REGISTERED',
        error: 'वापरकर्ता तपशील आढळले नाहीत. कृपया नोंदणी करा (User details are not fetch, please नोंदणी करा).'
      });
    }

    // Verify password hash
    if (!member.password_hash) {
      return res.status(401).json({
        success: false,
        error: 'या खात्यासाठी संकेतशब्द सेट केलेला नाही. कृपया Google सह लॉगिन करा किंवा संकेतशब्द रीसेट करा.'
      });
    }

    const isMatch = bcrypt.compareSync(password || '', member.password_hash);
    const allowDemoLogin = process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_LOGIN_FALLBACK === 'true';

    if (!isMatch && !(allowDemoLogin && password === 'password123')) {
      return res.status(401).json({ success: false, error: 'अवैध संकेतशब्द (Incorrect password).' });
    }

    // Clean sensitive data
    delete member.password_hash;
    normalizeMemberStrings(member);
    try {
      member.interests = JSON.parse(member.interests || '[]');
    } catch {
      member.interests = [];
    }

    ensureMemberReferral(member);
    const token = generateToken(member);

    res.json({
      success: true,
      message: 'लॉगिन यशस्वी झाले!',
      token,
      member
    });
  } catch (err) {
    next(err);
  }
});

// Google client IDs (comma separated) allowed to issue ID tokens for this API:
// the Web client ID the mobile app passes as `serverClientId`. Required in production.
const GOOGLE_CLIENT_IDS = (process.env.GOOGLE_CLIENT_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Asks Google whether the ID token is genuine. Returns the token's claims, or
// null when it is invalid, expired, unverified, or issued for another app.
async function verifyGoogleIdToken(idToken) {
  if (GOOGLE_CLIENT_IDS.length === 0 && process.env.NODE_ENV === 'production') {
    throw new Error('GOOGLE_CLIENT_IDS must be set in production');
  }
  const resp = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    { signal: AbortSignal.timeout(8000) }
  );
  if (!resp.ok) return null;
  const info = await resp.json();
  if (info.email_verified !== 'true' && info.email_verified !== true) return null;
  if (GOOGLE_CLIENT_IDS.length > 0 && !GOOGLE_CLIENT_IDS.includes(info.aud)) return null;
  return info.email ? info : null;
}

// POST /api/auth/google  { idToken, register?, legalCompliance? }
// The identity comes ONLY from the Google-verified token, never from fields the
// client sends. Unknown emails get 404 USER_NOT_REGISTERED; { register: true }
// with accepted terms/privacy/age creates the member from the verified profile.
router.post('/google', authRateLimiter, validateBody(googleAuthSchema), async (req, res, next) => {
  try {
    if (GOOGLE_CLIENT_IDS.length === 0 && process.env.NODE_ENV === 'production') {
      return res.status(503).json({
        success: false,
        code: 'GOOGLE_NOT_CONFIGURED',
        error: 'Google लॉगिन सध्या उपलब्ध नाही. कृपया मोबाईल/ईमेल व पासवर्डने लॉगिन करा. (Google sign-in is not available yet.)'
      });
    }
    const info = await verifyGoogleIdToken(req.body.idToken);
    if (!info) {
      return res.status(401).json({
        success: false,
        code: 'INVALID_GOOGLE_TOKEN',
        error: 'Google खाते सत्यापित करता आले नाही. कृपया पुन्हा प्रयत्न करा.'
      });
    }

    const email = String(info.email).trim().toLowerCase();
    let member = await get('SELECT * FROM members WHERE LOWER(email) = ?', [email]);

    if (!member) {
      if (req.body.register !== true) {
        return res.status(404).json({
          success: false,
          code: 'USER_NOT_REGISTERED',
          error: 'वापरकर्ता तपशील आढळले नाहीत. कृपया आधी नोंदणी करा.'
        });
      }

      const consent = req.body.legalCompliance || {};
      if (consent.termsAccepted !== true || consent.privacyAccepted !== true || consent.ageConfirmed !== true) {
        return res.status(400).json({
          success: false,
          code: 'CONSENT_REQUIRED',
          error: 'नोंदणीसाठी अटी, गोपनीयता धोरण व १८+ वयाची पुष्टी आवश्यक आहे.'
        });
      }

      let memberId = null;
      for (let i = 0; i < 10 && !memberId; i++) {
        const candidate = 'M' + Math.floor(1000 + Math.random() * 9000);
        if (!(await get('SELECT id FROM members WHERE id = ?', [candidate]))) memberId = candidate;
      }
      if (!memberId) throw new Error('Could not allocate a member ID');

      const name = String(info.name || email.split('@')[0]).trim().slice(0, 100);
      const referenceId = `REF-96K-${memberId.replace(/\D/g, '')}`;
      // No password: password login refuses accounts without a password_hash.
      await runQuery(`
        INSERT INTO members (
          id, name, email, phone, password_hash, avatar, city, district, state, country,
          profession, business, education, skills, about, tier, role, joined, created_at,
          reference_id, referral_id, referred_by, total_referrals
        )
        VALUES (?, ?, ?, '', NULL, '👤', '', '', '', '', '', '', '', '', '', 'Basic', 'member', date('now'), datetime('now'), ?, ?, NULL, 0)
      `, [memberId, name, email, referenceId, referenceId]);
      member = await get('SELECT * FROM members WHERE id = ?', [memberId]);
    }

    delete member.password_hash;
    normalizeMemberStrings(member);
    try {
      member.interests = JSON.parse(member.interests || '[]');
    } catch {
      member.interests = [];
    }

    const token = generateToken(member);

    res.json({
      success: true,
      message: 'Google लॉगिन यशस्वी झाले!',
      token,
      member
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const member = await get(`
      SELECT id, name, email, phone, avatar, city, district, state, country, profession, business, skills, education, interests, about, tier, role, verified_mobile, verified_email, verified_profile, joined 
      FROM members WHERE id = ?
    `, [req.user.id]);

    if (!member) {
      return res.status(404).json({ success: false, error: 'सदस्य आढळला नाही.' });
    }

    normalizeMemberStrings(member);
    try {
      member.interests = JSON.parse(member.interests || '[]');
    } catch {
      member.interests = [];
    }

    res.json({ success: true, member });
  } catch (err) {
    next(err);
  }
});

// ====================================================
// PASSWORD RESET WORKFLOW (EMAIL OTP VIA NOREPLY)
// ====================================================

// POST /api/auth/forgot-password
router.post('/forgot-password', authRateLimiter, validateBody(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'कृपया नोंदणीकृत ईमेल पत्ता प्रविष्ट करा (Please provide registered email).'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists with this email
    const member = await get('SELECT id, name, email FROM members WHERE LOWER(email) = ?', [cleanEmail]);
    if (!member) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        error: 'या ईमेल आयडीसह कोणताही वापरकर्ता आढळला नाही. कृपया नोंदणीकृत ईमेल तपासा.'
      });
    }

    // Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = bcrypt.hashSync(otp, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Store/replace in password_resets table
    await runQuery(`
      INSERT INTO password_resets
        (email, member_id, otp_hash, expires_at, attempts, created_at)
      VALUES (?, ?, ?, ?, 0, NOW())
      ON CONFLICT (email)
      DO UPDATE SET
        member_id = EXCLUDED.member_id,
        otp_hash = EXCLUDED.otp_hash,
        expires_at = EXCLUDED.expires_at,
        attempts = 0,
        created_at = NOW()
    `, [cleanEmail, member.id, otpHash, expiresAt]);

    // Send email using noreply mailer
    await sendPasswordResetOtpEmail({
      to: cleanEmail,
      name: member.name,
      otp
    });

    res.json({
      success: true,
      message: 'सुरक्षा OTP आपल्या नोंदणीकृत ईमेलवर यशस्वीरीत्या पाठवला आहे.',
      email: cleanEmail
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verify-reset-otp
router.post('/verify-reset-otp', authRateLimiter, validateBody(verifyResetOtpSchema), async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'ईमेल आणि OTP दोन्ही आवश्यक आहेत.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const record = await get('SELECT * FROM password_resets WHERE LOWER(email) = ?', [cleanEmail]);
    if (!record) {
      return res.status(400).json({
        success: false,
        code: 'NO_OTP_REQUESTED',
        error: 'कोणतीही सक्रिय OTP विनंती आढळली नाही. कृपया पुन्हा OTP मागवा.'
      });
    }

    // Check expiry
    if (new Date() > new Date(record.expires_at)) {
      await runQuery('DELETE FROM password_resets WHERE LOWER(email) = ?', [cleanEmail]);
      return res.status(400).json({
        success: false,
        code: 'OTP_EXPIRED',
        error: 'हा OTP कालबाह्य झाला आहे (१० मिनिटांची मुदत संपली). कृपया नवीन OTP मागवा.'
      });
    }

    // Check maximum attempts (max 5)
    if (record.attempts >= 5) {
      await runQuery('DELETE FROM password_resets WHERE LOWER(email) = ?', [cleanEmail]);
      return res.status(400).json({
        success: false,
        code: 'TOO_MANY_ATTEMPTS',
        error: 'अनेक चुकीचे प्रयत्न झाले आहेत. सुरक्षेसाठी हा OTP रद्द केला आहे. कृपया नवीन OTP मागवा.'
      });
    }

    // Verify OTP hash
    const isMatch = bcrypt.compareSync(cleanOtp, record.otp_hash);
    if (!isMatch) {
      await runQuery('UPDATE password_resets SET attempts = attempts + 1 WHERE LOWER(email) = ?', [cleanEmail]);
      const remaining = 5 - (record.attempts + 1);
      return res.status(400).json({
        success: false,
        code: 'INVALID_OTP',
        error: `अवैध OTP. कृपया पुन्हा तपासा (उर्वरित प्रयत्न: ${remaining > 0 ? remaining : 0}).`
      });
    }

    // OTP is verified! Issue temporary reset token valid for 15 mins
    const member = await get('SELECT id, name, email FROM members WHERE LOWER(email) = ?', [cleanEmail]);
    const resetToken = jwt.sign(
      { id: member ? member.id : null, email: cleanEmail, purpose: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'OTP यशस्वीरीत्या सत्यापित झाला!',
      resetToken
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authRateLimiter, validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'ईमेल, रिसेट टोकन आणि नवीन पासवर्ड आवश्यक आहेत.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'पासवर्ड किमान ८ अक्षरांचा असणे आवश्यक आहे.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify resetToken
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch (tokenErr) {
      return res.status(403).json({
        success: false,
        code: 'INVALID_RESET_TOKEN',
        error: 'पासवर्ड रीसेट सत्राची मुदत संपली आहे किंवा अवैध आहे. कृपया पुन्हा प्रयत्न करा.'
      });
    }

    if (decoded.purpose !== 'password_reset' || decoded.email.toLowerCase() !== cleanEmail) {
      return res.status(403).json({
        success: false,
        code: 'TOKEN_MISMATCH',
        error: 'अवैध पासवर्ड रीसेट विनंती.'
      });
    }

    // Verify member exists
    const member = await get('SELECT id FROM members WHERE LOWER(email) = ?', [cleanEmail]);
    if (!member) {
      return res.status(404).json({ success: false, error: 'वापरकर्ता आढळला नाही.' });
    }

    // Hash new password and update
    const newPasswordHash = bcrypt.hashSync(newPassword, 8);
    await runQuery('UPDATE members SET password_hash = ? WHERE LOWER(email) = ?', [newPasswordHash, cleanEmail]);

    // Clean up password_resets record
    await runQuery('DELETE FROM password_resets WHERE LOWER(email) = ?', [cleanEmail]);

    res.json({
      success: true,
      message: 'पासवर्ड यशस्वीरीत्या बदलला गेला आहे! आता आपण नवीन पासवर्डने लॉगिन करू शकता.'
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/account
async function deleteAccountHandler(req, res, next) {
  const memberId = req.user?.id;
  if (!memberId) {
    return res.status(401).json({ success: false, error: 'प्रमाणीकरण आवश्यक आहे (Authentication required)' });
  }

  const { confirm, password, idToken } = req.body || {};
  if (confirm !== 'DELETE') {
    return res.status(400).json({
      success: false,
      code: 'CONFIRMATION_REQUIRED',
      error: 'खाते हटवण्यासाठी कृपया DELETE शब्द टाईप करा (Please enter DELETE to confirm)'
    });
  }

  try {
    const member = await get('SELECT * FROM members WHERE id = ?', [memberId]);
    if (!member) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        error: 'सदस्य आढळला नाही (Member not found)'
      });
    }

    // Verify Password if member has password_hash
    if (member.password_hash) {
      if (!password) {
        return res.status(401).json({
          success: false,
          code: 'INVALID_PASSWORD',
          error: 'कृपया आपला पासवर्ड प्रविष्ट करा (Please provide your password)'
        });
      }
      const isPasswordValid = bcrypt.compareSync(password, member.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          code: 'INVALID_PASSWORD',
          error: 'चुकीचा पासवर्ड (Incorrect password)'
        });
      }
    }

    // Tables that may not exist in every environment are cleaned up outside the
    // transaction: on PostgreSQL a failed statement aborts the whole transaction.
    for (const sql of ['DELETE FROM media WHERE owner_id = ?', 'DELETE FROM refresh_tokens WHERE member_id = ?']) {
      try {
        await runQuery(sql, [memberId]);
      } catch (_) {
        // Table not present here.
      }
    }

    await transaction(async (t) => {
      // 1. Likes placed by this member on OTHER posts
      const otherPostLikes = await t.all('SELECT post_id FROM post_likes WHERE member_id = ?', [memberId]);
      await t.runQuery('DELETE FROM post_likes WHERE member_id = ?', [memberId]);
      for (const pl of otherPostLikes) {
        if (pl.post_id) {
          const remLikes = await t.get('SELECT COUNT(*) as cnt FROM post_likes WHERE post_id = ?', [pl.post_id]);
          await t.runQuery('UPDATE posts SET likes_count = ? WHERE id = ?', [remLikes ? remLikes.cnt : 0, pl.post_id]);
        }
      }

      // 2. Comments written by this member on ANY post
      await t.runQuery('DELETE FROM post_comments WHERE author_id = ?', [memberId]);

      // 3. Posts authored by this member (and their attached likes/comments)
      const memberPosts = await t.all('SELECT id FROM posts WHERE author_id = ?', [memberId]);
      for (const p of memberPosts) {
        if (p.id) {
          await t.runQuery('DELETE FROM post_comments WHERE post_id = ?', [p.id]);
          await t.runQuery('DELETE FROM post_likes WHERE post_id = ?', [p.id]);
        }
      }
      await t.runQuery('DELETE FROM posts WHERE author_id = ?', [memberId]);

      // 5. Notifications
      await t.runQuery('DELETE FROM notifications WHERE member_id = ?', [memberId]);

      // 7. Group memberships and recount
      const memberGroups = await t.all('SELECT group_id FROM group_members WHERE member_id = ?', [memberId]);
      await t.runQuery('DELETE FROM group_members WHERE member_id = ?', [memberId]);
      for (const g of memberGroups) {
        if (g.group_id) {
          const remMembers = await t.get('SELECT COUNT(*) as cnt FROM group_members WHERE group_id = ?', [g.group_id]);
          await t.runQuery('UPDATE groups SET members_count = ? WHERE id = ?', [remMembers ? remMembers.cnt : 0, g.group_id]);
        }
      }

      // 8. Event RSVPs and recount
      const memberRsvps = await t.all('SELECT event_id FROM event_rsvps WHERE member_id = ?', [memberId]);
      await t.runQuery('DELETE FROM event_rsvps WHERE member_id = ?', [memberId]);
      for (const r of memberRsvps) {
        if (r.event_id) {
          const remRsvps = await t.get('SELECT COUNT(*) as cnt FROM event_rsvps WHERE event_id = ?', [r.event_id]);
          await t.runQuery('UPDATE events SET rsvp_count = ? WHERE id = ?', [remRsvps ? remRsvps.cnt : 0, r.event_id]);
        }
      }

      // 9. Sangam Meetings
      await t.runQuery('DELETE FROM meetings WHERE requester_id = ? OR recipient_id = ?', [memberId, memberId]);

      // 10. Sangam Referrals
      await t.runQuery('DELETE FROM referrals WHERE giver_id = ? OR recipient_id = ?', [memberId, memberId]);

      // 11. Donations (Anonymize donor identity to preserve historical financial integrity)
      await t.runQuery("UPDATE donations SET donor_id = NULL, donor_name = 'Deleted Member' WHERE donor_id = ?", [memberId]);

      // 12. Password resets matching member email
      if (member.email) {
        await t.runQuery('DELETE FROM password_resets WHERE LOWER(email) = ?', [member.email.toLowerCase()]);
      }

      // 13. Delete primary member record
      await t.runQuery('DELETE FROM members WHERE id = ?', [memberId]);
    });

    return res.json({
      success: true,
      deleted: true,
      message: 'खाते आणि सर्व वैयक्तिक डेटा यशस्वीरित्या कायमस्वरूपी हटवला गेला आहे (Account and personal data deleted successfully).'
    });
  } catch (err) {
    next(err);
  }
}

router.delete('/account', authenticateToken, validateBody(deleteAccountSchema), deleteAccountHandler);

// POST /api/auth/delete-account  (website "Delete account" page)
// Logged in (Bearer token): same deletion as DELETE /account, password checked.
// Not logged in: records a deletion request for staff to verify and action;
// an identifier alone must never delete an account.
router.post('/delete-account', authRateLimiter, async (req, res, next) => {
  try {
    if (req.user?.id) {
      req.body = { confirm: 'DELETE', password: req.body?.password };
      return deleteAccountHandler(req, res, next);
    }

    const identifier = String(req.body?.identifier || req.body?.phone || req.body?.email || '').trim().slice(0, 120);
    if (!identifier) {
      return res.status(400).json({ success: false, code: 'IDENTIFIER_REQUIRED', error: 'कृपया नोंदणीकृत मोबाइल नंबर किंवा ईमेल टाका.' });
    }
    if (req.body?.confirmation !== true) {
      return res.status(400).json({ success: false, code: 'CONFIRMATION_REQUIRED', error: 'कृपया पुष्टीकरण चेकबॉक्स निवडा.' });
    }

    const digits = identifier.replace(/\D/g, '');
    const last10 = digits.length >= 10 ? digits.slice(-10) : '';
    const member = await get(
      `SELECT id, name, phone, email FROM members
       WHERE LOWER(email) = LOWER(?) OR UPPER(id) = UPPER(?) OR (? != '' AND phone LIKE ?)`,
      [identifier, identifier, last10, `%${last10}`]
    );

    if (member) {
      await ensureWebsiteTables();
      const open = await get(
        "SELECT id FROM support_tickets WHERE source = 'account_deletion' AND requester_id = ? AND status NOT IN ('Resolved', 'Closed')",
        [member.id]
      );
      if (!open) {
        const reason = String(req.body?.reason || '').trim().slice(0, 500);
        const now = new Date().toISOString();
        await runQuery(
          `INSERT INTO support_tickets (id, source, title, description, category, priority, status,
             requester_id, requester_name, requester_phone, requester_email, sla_hours, audit_trail, updated_at)
           VALUES (?, 'account_deletion', ?, ?, 'Account Deletion', 'High', 'New', ?, ?, ?, ?, 720, ?, ?)`,
          [`DEL-${Date.now().toString(36).toUpperCase()}`, `Account deletion request: ${member.id}`,
            `Web request to delete account ${member.id}. Verify the requester before deleting.${reason ? ` Reason: ${reason}` : ''}`,
            member.id, member.name || '', member.phone || '', member.email || '',
            JSON.stringify([{ action: 'CREATED', by: 'web delete-account page', timestamp: now }]), now]
        );
      }
    }

    // Same answer whether or not the account exists, so the form can't be used
    // to find out who is registered.
    return res.json({
      success: true,
      requested: true,
      deleted: false,
      message: 'आपली खाते हटवण्याची विनंती प्राप्त झाली आहे. पडताळणीनंतर ३० दिवसांत खाते व वैयक्तिक डेटा हटवला जाईल. (Your deletion request was received; after verification the account and personal data are deleted within 30 days.)',
      data: { requested: true, deleted: false },
    });
  } catch (err) {
    next(err);
  }
});


// GET /api/auth/referrals/verify/:code
// Public: Verify referral code / reference_id
router.get('/referrals/verify/:code', async (req, res, next) => {
  try {
    const rawCode = String(req.params.code || '').trim();
    if (!rawCode) {
      return res.status(400).json({ success: false, error: 'रेफरल कोड आवश्यक आहे.' });
    }

    const cleanUpper = rawCode.toUpperCase();
    const cleanDigits = rawCode.replace(/\D/g, '');

    const referrer = await get(`
      SELECT id, name, reference_id, referral_id, district, city, phone FROM members
      WHERE UPPER(reference_id) = ? 
         OR UPPER(referral_id) = ?
         OR UPPER(id) = ?
         OR (? != '' AND SUBSTR(phone, -10) = ?)
    `, [cleanUpper, cleanUpper, cleanUpper, cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '', cleanDigits.length >= 10 ? cleanDigits.slice(-10) : '']);

    if (referrer) {
      return res.json({
        success: true,
        isValid: true,
        message: 'सत्यापित रेफरल कोड',
        referrer: {
          id: referrer.id,
          name: referrer.name,
          reference_id: referrer.reference_id || referrer.id,
          referral_id: referrer.referral_id || referrer.reference_id || referrer.id,
          district: referrer.district || 'महाराष्ट्र',
          city: referrer.city || ''
        }
      });
    }

    // Official fallbacks
    const officialCodes = {
      'CM-OFFICIAL-2026': { name: 'Connect Maratha अधिकृत केंद्रीय मंच', district: 'महाराष्ट्र' },
      'CM-ADMIN-001': { name: 'Connect Maratha मुख्य नियामक कार्यालय', district: 'महाराष्ट्र' },
      'CM-PUN-0842': { name: 'अमोल तुकाराम जाधव', district: 'पुणे' }
    };
    if (officialCodes[cleanUpper]) {
      return res.json({
        success: true,
        isValid: true,
        message: 'अधिकृत रेफरल कोड',
        referrer: {
          id: cleanUpper,
          name: officialCodes[cleanUpper].name,
          reference_id: cleanUpper,
          referral_id: cleanUpper,
          district: officialCodes[cleanUpper].district,
          city: 'महाराष्ट्र'
        }
      });
    }

    return res.status(404).json({ success: false, isValid: false, error: 'हा रेफरल आयडी आढळला नाही.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/referrals/my-referrals
// Authenticated: Get current user's referral stats and list of referred members
router.get('/referrals/my-referrals', authenticateToken, async (req, res, next) => {
  try {
    const member = await get('SELECT * FROM members WHERE id = ?', [req.user.id]);
    if (!member) {
      return res.status(404).json({ success: false, error: 'सदस्य सापडला नाही.' });
    }

    const populated = ensureMemberReferral(member);
    const myRefId = (populated.reference_id || '').toUpperCase();
    const myCode = (populated.referral_id || '').toUpperCase();
    const myId = String(populated.id || '').toUpperCase();

    // Query members referred by this user
    const referredList = await all(`
      SELECT id, name, phone, district, city, joined, created_at 
      FROM members 
      WHERE id != ? AND (
        UPPER(referred_by) = ? OR 
        UPPER(referred_by) = ? OR 
        UPPER(referred_by) = ?
      )
      ORDER BY created_at DESC
    `, [member.id, myRefId, myCode, myId]);

    const referredMembers = referredList.map(m => ({
      id: m.id,
      name: m.name,
      phone: m.phone ? `${String(m.phone).slice(0, 4)} •••••` : '',
      district: m.district || m.city || 'पुणे',
      city: m.city || m.district || '',
      joined: m.joined || (m.created_at ? String(m.created_at).split('T')[0] : '2026-03-01'),
      status: 'सक्रिय (Active)'
    }));

    const totalCount = Math.max(Number(populated.total_referrals) || 0, referredMembers.length);
    const shareLink = `https://connectmaratha.com/register?ref=${populated.reference_id || populated.id}`;

    return res.json({
      success: true,
      reference_id: populated.reference_id,
      referral_id: populated.referral_id || populated.reference_id,
      total_referrals: totalCount,
      share_link: shareLink,
      referred_members: referredMembers
    });
  } catch (err) {
    next(err);
  }
});

export default router;