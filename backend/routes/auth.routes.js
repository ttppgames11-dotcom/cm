import { Router } from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { runQuery, get, all, saveDatabase } from '../../database/database.js';
import { db } from '../db/realtimeDb.js';
import { generateToken, authenticateToken, JWT_SECRET } from '../middleware/auth.js';
import { sendPasswordResetOtpEmail } from '../utils/mailer.js';
import { validateLocationHierarchy } from './locations.routes.js';
import { sendError } from '../utils/response.js';
import { isValidEmail, isValidPhone } from '../utils/validator.js';
import { findAccountForLogin, findJsonAccount, isDisabled, publicAccount } from '../utils/accounts.js';


const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    // 🛡️ Platform Control Check: Registration Open/Closed/Invite-only
    const siteContent = db.getSiteContent ? db.getSiteContent() : (db.data?.siteContent || {});
    const regControl = siteContent.platformControls?.registration || { status: 'open' };
    if (regControl.status === 'closed') {
      const closedMsg = regControl.customMessage || 'सध्या नवीन सदस्य नोंदणी बंद आहे. कृपया नंतर प्रयत्न करा.';
      return res.status(403).json({ success: false, error: closedMsg, code: 'REGISTRATION_CLOSED' });
    }
    if (regControl.status === 'maintenance') {
      const maintMsg = regControl.customMessage || 'नोंदणी प्रणाली सध्या देखभाल (Maintenance) मोडमध्ये आहे.';
      return res.status(503).json({ success: false, error: maintMsg, code: 'REGISTRATION_MAINTENANCE' });
    }
    if (regControl.status === 'invite_only' && !req.body.referredBy && !req.body.referrerCode && !req.body.referralCode) {
      return res.status(403).json({ success: false, error: 'नोंदणी केवळ निमंत्रण (Invite / Referral) कोडद्वारेच सुरू आहे.', code: 'INVITE_ONLY_REQUIRED' });
    }

    const {
      name,
      email,
      phone,
      mobile,
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
      business,
      education,
      skills,
      about,
      kul,
      referredBy,
      referrerCode,
      referralCode
    } = req.body;

    const rawPhone = String(phone || mobile || '').trim();
    const finalEmail = String(email || '').trim().toLowerCase();

    if (typeof name !== 'string' || name.trim().length < 2 || (!finalEmail && !rawPhone)) {
      return res.status(400).json({ success: false, error: 'नाव आणि ईमेल किंवा फोन नंबर आवश्यक आहे.' });
    }
    if (finalEmail && !isValidEmail(finalEmail)) {
      return res.status(400).json({ success: false, error: 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.' });
    }
    if (rawPhone && !isValidPhone(rawPhone)) {
      return res.status(400).json({ success: false, error: 'कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.' });
    }
    // Stored as the bare 10 digits, like existing members
    const finalPhone = rawPhone ? rawPhone.replace(/[\s\-().]/g, '').replace(/^(\+?91|0)(?=[6-9]\d{9}$)/, '') : '';

    // Validate hierarchical location if provided
    if (countryId || stateId || districtId || talukaId || villageId) {
      try {
        const validation = await validateLocationHierarchy({ countryId, stateId, districtId, talukaId, villageId });
        if (!validation.valid) {
          return res.status(400).json({ success: false, error: validation.error });
        }
      } catch (_) {}
    }

    // Check if user already exists (SQLite or realtimeDb)
    let existing = null;
    try {
      existing = await get(`
        SELECT id FROM members 
        WHERE (? != '' AND LOWER(email) = ?) 
           OR (? != '' AND phone = ?)
      `, [finalEmail || '', finalEmail || '', finalPhone || '', finalPhone || '']);
    } catch (_) {}

    if (!existing) {
      const members = db.getCollection('members');
      const cleanReqPhone = String(finalPhone || '').replace(/\D/g, '').slice(-10);
      existing = members.find(m => {
        const mEmail = m.email && m.email.toLowerCase();
        const mPhone = m.phone && String(m.phone).replace(/\D/g, '').slice(-10);
        return (finalEmail && mEmail === finalEmail) || 
               (cleanReqPhone.length >= 10 && mPhone === cleanReqPhone);
      });
    }

    if (existing) {
      return res.status(400).json({ success: false, error: 'या ईमेल किंवा फोन क्रमांकासह सदस्य आधीच नोंदणीकृत आहे.' });
    }

    // 6-digit user ID (100000 - 999999) or custom passed 6-digit ID
    // The server always chooses the ID: a client-supplied id/memberId or VIP flag is ignored (vanity IDs go through change-id).
    let memberId = null;
    for (let attempt = 0; attempt < 20 && !memberId; attempt++) {
      const candidate = `M${Math.floor(100000 + Math.random() * 900000)}`;
      let taken = !!db.findById('members', candidate);
      if (!taken) {
        try { taken = !!(await get('SELECT id FROM members WHERE id = ?', [candidate])); } catch (_) { /* SQLite unavailable */ }
      }
      if (!taken) memberId = candidate;
    }
    if (!memberId) {
      return res.status(503).json({ success: false, error: 'सदस्य आयडी तयार करता आला नाही. कृपया पुन्हा प्रयत्न करा.' });
    }

    const isVip = /^(.)\1{5}$|^(123456|654321|100000|999000|000007|777777|999999|111111|555555|888888)$/.test(String(memberId).replace(/\D/g, '')) ? 1 : 0;
    const vipNumber = isVip ? memberId : null;

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, error: 'पासवर्ड किमान ८ अक्षरांचा असणे आवश्यक आहे.' });
    }
    const passwordHash = bcrypt.hashSync(password, 8);
    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify(skills ? [skills] : []);

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
    const finalKul = kul || '९६ कुळी मराठा';

    // Referrers are resolved from the members table only; there is no built-in list.
    const KNOWN_OFFICIAL_REFERRERS = [];

    const rawRef = String(referredBy || referrerCode || referralCode || '').trim();
    let resolvedReferrer = null;
    let savedReferredBy = null;

    if (rawRef) {
      const cleanRef = rawRef.toUpperCase();
      const officialMatch = KNOWN_OFFICIAL_REFERRERS.find(
        r => r.id.toUpperCase() === cleanRef || r.phone === rawRef || (r.phone && cleanRef.endsWith(r.phone.slice(-4)))
      );
      if (officialMatch) {
        resolvedReferrer = {
          id: officialMatch.id,
          name: officialMatch.name,
          phone: officialMatch.phone,
          district: officialMatch.district,
          taluka: officialMatch.taluka
        };
      } else {
        const stripped = cleanRef.replace(/^CM-/, '').replace(/^MH-/, '').replace(/^PUN-/, '');
        const cleanDigits = rawRef.replace(/\D/g, '');
        resolvedReferrer = await get(`
          SELECT id, name, phone, district, taluka 
          FROM members 
          WHERE UPPER(id) = ? 
             OR UPPER(id) = ? 
             OR phone = ? 
             OR (phone != '' AND ? != '' AND phone LIKE ?)
             OR (id != '' AND ? != '' AND UPPER(id) LIKE ?)
          LIMIT 1
        `, [cleanRef, stripped, rawRef, cleanDigits, `%${cleanDigits.slice(-10)}`, stripped, `%${stripped}`]);
      }
      // FIX: Only set savedReferredBy if referrer was actually resolved
      savedReferredBy = resolvedReferrer ? resolvedReferrer.id : null;
    }

    await runQuery(`
      INSERT INTO members (
        id, name, email, phone, password_hash, avatar, city, district, state, country,
        country_id, state_id, district_id, taluka_id, village_id, taluka, village,
        profession, business, education, skills, about, tier, role, kul, joined, created_at, referred_by,
        is_vip, vip_number
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Basic', 'member', ?, date('now'), datetime('now'), ?, ?, ?)
    `, [
      memberId, name, finalEmail, finalPhone, passwordHash, '👤', computedCity, finalDistrict, finalState, finalCountry,
      countryId || null, stateId || null, districtId || null, talukaId || null, villageId || null, finalTaluka, finalVillage,
      profession || '', business || '', education || '', skillsJson, about || '', finalKul, savedReferredBy,
      isVip, vipNumber
    ]);

    if (savedReferredBy) {
      try {
        const refRecordId = `REF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const refId = resolvedReferrer ? resolvedReferrer.id : savedReferredBy;
        const refName = resolvedReferrer ? resolvedReferrer.name : (savedReferredBy === 'CM-OFFICIAL-2026' ? 'Connect Maratha अधिकृत केंद्रीय मंच' : 'Connect Maratha सभासद');
        const refPhone = resolvedReferrer ? (resolvedReferrer.phone || '') : '';

        await runQuery(`
          INSERT INTO member_referrals (
            id, referrer_id, referrer_name, referrer_phone,
            referee_id, referee_name, referee_phone, district, taluka,
            status, bonus_amount, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 100, datetime('now'))
        `, [
          refRecordId,
          refId,
          refName,
          refPhone,
          memberId,
          name,
          finalPhone,
          finalDistrict,
          finalTaluka
        ]);
        saveDatabase();
        console.log(`🤝 [REFERRAL RECORDED] Member ${memberId} (${name}) registered via referrer ${refId} (${refName})`);
      } catch (refErr) {
        console.warn('Could not record referral:', refErr.message);
      }
    }

    const newMember = await get(`
      SELECT id, name, email, phone, avatar, city, district, state, country,
             country_id, state_id, district_id, taluka_id, village_id, taluka, village,
             profession, business, education, skills, about, tier, role, kul, joined
      FROM members WHERE id = ?
    `, [memberId]);
    
    try {
      newMember.skills = JSON.parse(newMember.skills || '[]');
    } catch {
      newMember.skills = [];
    }

    // Also sync to realtimeDb
    try {
      db.insert('members', {
        ...newMember,
        phone: finalPhone,
        email: finalEmail,
        password_hash: passwordHash,
        status: 'active'
      });
    } catch (_) {}

    const token = generateToken(newMember);

    res.status(201).json({
      success: true,
      message: 'नोंदणी यशस्वी झाली!',
      token,
      member: newMember,
      data: { token, member: newMember }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    // 🛡️ Platform Control Check: Login Enabled / Maintenance
    const siteContent = db.getSiteContent ? db.getSiteContent() : (db.data?.siteContent || {});
    const loginControl = siteContent.platformControls?.login || { status: 'enabled' };
    if (loginControl.status === 'maintenance' && req.body.identifier !== 'admin' && req.body.identifier !== 'superadmin') {
      return res.status(503).json({
        success: false,
        code: 'LOGIN_MAINTENANCE',
        error: loginControl.customMessage || 'लॉगिन प्रणाली सध्या देखभाल मोडमध्ये आहे. कृपया थोड्या वेळाने प्रयत्न करा.'
      });
    }

    const { identifier, phone, mobile, email, password } = req.body;
    const cleanId = String(identifier || phone || mobile || email || '').trim();

    if (!cleanId) {
      return res.status(400).json({ success: false, error: 'कृपया आयडी, ईमेल किंवा फोन प्रविष्ट करा.' });
    }

    // A password is always required. There are no built-in accounts or master passwords.
    if (typeof password !== 'string' || !password) {
      return res.status(400).json({ success: false, error: 'कृपया पासवर्ड प्रविष्ट करा.' });
    }

    // Staff-managed accounts (db.json) first, then self-registered members (SQLite)
    const found = await findAccountForLogin(cleanId);
    const member = found.member ? { ...found.member } : null;

    if (!member || !member.password_hash || !bcrypt.compareSync(password, member.password_hash)) {
      // Same answer for unknown user, missing hash and wrong password, so accounts cannot be probed
      return res.status(401).json({ success: false, error: 'आयडी किंवा संकेतशब्द चुकीचा आहे (Incorrect ID or password).' });
    }
    if (isDisabled(member)) {
      return res.status(403).json({ success: false, code: 'ACCOUNT_DISABLED', error: 'हे खाते बंद केले आहे. कृपया प्रशासकाशी संपर्क साधा.' });
    }

    // Clean sensitive data
    delete member.password_hash;
    try {
      member.skills = JSON.parse(member.skills || '[]');
      member.interests = JSON.parse(member.interests || '[]');
    } catch {
      member.skills = [];
      member.interests = [];
    }

    // Dynamic resolution of assigned Community Center tier if member has unit_id
    if (member.unit_id) {
      try {
        const center = await get('SELECT id, name, tier, district, taluka FROM community_centers WHERE id = ?', [member.unit_id]);
        if (center) {
          member.center_tier = center.tier;
          member.center_name = center.name;
          member.center_district = center.district;
          member.center_taluka = center.taluka;
        }
      } catch (_) {}
    }

    const token = generateToken(member);
    delete member.tokenVersion;

    res.json({
      success: true,
      message: 'लॉगिन यशस्वी झाले!',
      token,
      member,
      data: { token, member }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/google
router.post('/google', async (req, res, next) => {
  try {
    // The email must come from a Google ID token that Google itself vouches for; a bare email proves nothing.
    const { idToken } = req.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(503).json({ success: false, code: 'GOOGLE_LOGIN_DISABLED', error: 'Google लॉगिन सध्या उपलब्ध नाही.' });
    }
    if (typeof idToken !== 'string' || idToken.length < 20) {
      return res.status(400).json({ success: false, error: 'Google खात्याची माहिती मिळाली नाही.' });
    }
    let claims;
    try {
      const gr = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      claims = gr.ok ? await gr.json() : null;
    } catch (_) { claims = null; }
    const issuerOk = claims && ['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss);
    if (!claims || claims.aud !== googleClientId || !issuerOk || String(claims.email_verified) !== 'true' || !claims.email) {
      return res.status(401).json({ success: false, error: 'Google पडताळणी अयशस्वी झाली.' });
    }
    const email = claims.email;

    let member = await get('SELECT * FROM members WHERE LOWER(email) = ?', [String(email).toLowerCase()]);

    if (!member) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_REGISTERED',
        error: 'वापरकर्ता तपशील आढळले नाहीत. कृपया आधी नोंदणी करा.'
      });
    }

    delete member.password_hash;
    try {
      member.skills = JSON.parse(member.skills || '[]');
      member.interests = JSON.parse(member.interests || '[]');
    } catch {
      member.skills = [];
      member.interests = [];
    }

    const token = generateToken(member);

    res.json({
      success: true,
      message: 'Google लॉगिन यशस्वी झाले!',
      token,
      member,
      data: { token, member }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    // Staff-managed accounts (admin-created users, CRM unit owners and staff) live in db.json
    const jsonMember = findJsonAccount(req.user.id);
    if (jsonMember) {
      const safe = publicAccount(jsonMember);
      return res.json({ success: true, member: safe, data: safe });
    }
    const member = await get(`
      SELECT id, name, email, phone, avatar, photo, city, district, state, country,
             country_id, state_id, district_id, taluka_id, village_id, taluka, village,
             profession, business, skills, education, interests, about, tier, role, kul,
             verified_mobile, verified_email, verified_profile, joined, unit_id, unit_role 
      FROM members WHERE id = ?
    `, [req.user.id]);

    if (!member) {
      return res.status(404).json({ success: false, error: 'सदस्य आढळला नाही.' });
    }

    try {
      member.skills = JSON.parse(member.skills || '[]');
      member.interests = JSON.parse(member.interests || '[]');
    } catch {
      member.skills = [];
      member.interests = [];
    }

    if (member.unit_id) {
      try {
        const center = await get('SELECT id, name, tier, district, taluka FROM community_centers WHERE id = ?', [member.unit_id]);
        if (center) {
          member.center_tier = center.tier;
          member.center_name = center.name;
          member.center_district = center.district;
          member.center_taluka = center.taluka;
        }
      } catch (_) {}
    }

    res.json({ success: true, member, data: member });
  } catch (err) {
    next(err);
  }
});

// ====================================================
// PASSWORD RESET WORKFLOW (EMAIL OTP VIA NOREPLY)
// ====================================================

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: 'कृपया नोंदणीकृत ईमेल पत्ता प्रविष्ट करा.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const member = await get('SELECT id, name, email FROM members WHERE LOWER(email) = ?', [cleanEmail]);
    if (!member) {
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_FOUND',
        error: 'या ईमेल आयडीसह कोणताही वापरकर्ता आढळला नाही. कृपया नोंदणीकृत ईमेल तपासा.'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = bcrypt.hashSync(otp, 8);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await runQuery(`
      INSERT OR REPLACE INTO password_resets (email, otp_hash, expires_at, attempts, created_at)
      VALUES (?, ?, ?, 0, datetime('now'))
    `, [cleanEmail, otpHash, expiresAt]);

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
router.post('/verify-reset-otp', async (req, res, next) => {
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

    if (new Date() > new Date(record.expires_at)) {
      await runQuery('DELETE FROM password_resets WHERE LOWER(email) = ?', [cleanEmail]);
      return res.status(400).json({
        success: false,
        code: 'OTP_EXPIRED',
        error: 'हा OTP कालबाह्य झाला आहे (१० मिनिटांची मुदत संपली). कृपया नवीन OTP मागवा.'
      });
    }

    if (record.attempts >= 5) {
      await runQuery('DELETE FROM password_resets WHERE LOWER(email) = ?', [cleanEmail]);
      return res.status(400).json({
        success: false,
        code: 'TOO_MANY_ATTEMPTS',
        error: 'अनेक चुकीचे प्रयत्न झाले आहेत. सुरक्षेसाठी हा OTP रद्द केला आहे. कृपया नवीन OTP मागवा.'
      });
    }

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
router.post('/reset-password', async (req, res, next) => {
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

    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch {
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

    const member = await get('SELECT id FROM members WHERE LOWER(email) = ?', [cleanEmail]);
    if (!member) {
      return res.status(404).json({ success: false, error: 'वापरकर्ता आढळला नाही.' });
    }

    const newPasswordHash = bcrypt.hashSync(newPassword, 8);
    await runQuery('UPDATE members SET password_hash = ? WHERE LOWER(email) = ?', [newPasswordHash, cleanEmail]);
    await runQuery('DELETE FROM password_resets WHERE LOWER(email) = ?', [cleanEmail]);

    res.json({
      success: true,
      message: 'पासवर्ड यशस्वीरीत्या बदलला गेला आहे! आता आपण नवीन पासवर्डने लॉगिन करू शकता.'
    });
  } catch (err) {
    next(err);
  }
});

// Unified Account Deletion Handler supporting both Mobile App and Web Portal
const handleDeleteAccount = async (req, res) => {
  try {
    const { identifier, phone, email, id, reason, password, confirmation, confirm } = req.body || {};
    
    const isConfirmed = confirmation === true || confirm === 'DELETE' || String(confirm || '').toUpperCase() === 'DELETE';
    if (!isConfirmed) {
      return sendError(res, 'कृपया खाते हटवण्याची पुष्टी करा (Please confirm account deletion with confirm: DELETE).', 'CONFIRMATION_REQUIRED', 400);
    }

    const members = db.getCollection('members');
    let member = null;

    // 1. If authenticated via token (either from req.user or directly from Authorization header)
    let authUser = req.user;
    if (!authUser && req.headers['authorization']) {
      try {
        const token = req.headers['authorization'].split(' ')[1];
        if (token) {
          const jwtModule = await import('jsonwebtoken').catch(() => null);
          const jwt = jwtModule?.default || jwtModule;
          authUser = jwt.verify(token, JWT_SECRET);
        }
      } catch (e) {
        // Continue if token invalid or expired
      }
    }

    if (authUser && authUser.id) {
      member = members.find(m => String(m.id).toLowerCase() === String(authUser.id).toLowerCase());
    }

    // 2. Lookup by id, phone, email, or identifier
    const searchTargets = [id, identifier, phone, email].filter(Boolean).map(x => String(x).trim());

    if (!member && searchTargets.length > 0) {
      for (const target of searchTargets) {
        const cleanTarget = target.toLowerCase();
        const targetDigits = cleanTarget.replace(/\D/g, '');
        const target10 = targetDigits.slice(-10);

        member = members.find(m => {
          if (!m) return false;
          // ID match
          if (m.id && String(m.id).toLowerCase() === cleanTarget) {
            return true;
          }
          // Email match
          if (m.email && m.email.toLowerCase() === cleanTarget) {
            return true;
          }
          // Phone match (checks full digits, last 10 digits)
          if (m.phone) {
            const mDigits = String(m.phone).replace(/\D/g, '');
            const m10 = mDigits.slice(-10);
            if (targetDigits && mDigits === targetDigits) return true;
            if (target10.length === 10 && m10.length === 10 && m10 === target10) return true;
          }
          return false;
        });

        if (member) break;
      }
    }

    // 3. If not found in JSON and PostgreSQL is configured, look up in PostgreSQL
    if (!member && process.env.DATABASE_URL && searchTargets.length > 0) {
      try {
        const pgModule = await import('pg').catch(() => null);
        const PgClient = pgModule?.default?.Client || pgModule?.Client;
        if (PgClient) {
          const client = new PgClient({ connectionString: process.env.DATABASE_URL });
          await client.connect();
          for (const target of searchTargets) {
            const digits = target.replace(/\D/g, '').slice(-10);
            const q = await client.query(
              'SELECT id, name, email, phone, password_hash FROM members WHERE id = $1 OR LOWER(email) = $2 OR phone ILIKE $3 LIMIT 1',
              [target, target.toLowerCase(), digits.length >= 8 ? `%${digits}%` : `%${target}%`]
            ).catch(() => null);
            if (q && q.rows && q.rows.length > 0) {
              member = q.rows[0];
              break;
            }
          }
          await client.end().catch(() => {});
        }
      } catch (e) {
        // Continue silently
      }
    }

    // Deleting an account needs proof of ownership: the owner's own session, or the account password.
    // Anyone else who only knows an id, phone or email is refused.
    const isSelf = !!(authUser && authUser.id && member && String(authUser.id).toLowerCase() === String(member.id).toLowerCase());
    if (!isSelf) {
      let target = member;
      if (!target && searchTargets[0]) {
        target = (await findAccountForLogin(searchTargets[0])).member;
      }
      if (!target || !target.password_hash || typeof password !== 'string' || !password || !bcrypt.compareSync(password, target.password_hash)) {
        return sendError(res, 'खाते हटवण्यासाठी खात्याचा पासवर्ड आवश्यक आहे (Account password required).', 'OWNERSHIP_PROOF_REQUIRED', 401);
      }
      member = member || target;
    }

    const requestId = `DEL-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    let deletedFromAnyDb = false;
    let deletedId = member ? member.id : (id || identifier);

    // A. Delete from primary backend/db.json
    if (member) {
      // If user provided password, verify it
      if (password && member.password_hash) {
        const isMatch = bcrypt.compareSync(password, member.password_hash);
        if (!isMatch) {
          return sendError(res, 'प्रविष्ट केलेला पासवर्ड चुकीचा आहे (Incorrect password).', 'INVALID_PASSWORD', 400);
        }
      }

      deletedId = member.id;
      db.delete('members', member.id);

      // Clean related collections in backend/db.json
      const cleanSubCollection = (colName, filterFn) => {
        const col = db.getCollection(colName);
        if (Array.isArray(col)) {
          db.data[colName] = col.filter(item => !filterFn(item));
        }
      };

      cleanSubCollection('matrimony', item => String(item.memberId) === String(deletedId) || String(item.id) === String(deletedId));
      cleanSubCollection('bloodDonors', item => String(item.memberId) === String(deletedId));
      cleanSubCollection('notifications', item => String(item.recipientId) === String(deletedId));
      cleanSubCollection('messages', item => String(item.senderId) === String(deletedId) || String(item.recipientId) === String(deletedId));
      cleanSubCollection('posts', item => String(item.authorId) === String(deletedId));
      cleanSubCollection('businesses', item => String(item.ownerId) === String(deletedId));

      db.save();
      deletedFromAnyDb = true;
    }

    // B. Also delete from server/db.json if it exists
    try {
      const serverDbPath = path.resolve('server/db.json');
      if (fs.existsSync(serverDbPath)) {
        const raw = fs.readFileSync(serverDbPath, 'utf8');
        const sDb = JSON.parse(raw);
        if (Array.isArray(sDb.members)) {
          const initLen = sDb.members.length;
          sDb.members = sDb.members.filter(m => {
            if (deletedId && String(m.id).toLowerCase() === String(deletedId).toLowerCase()) return false;
            for (const t of searchTargets) {
              const ct = t.toLowerCase();
              const td = ct.replace(/\D/g, '').slice(-10);
              if (m.email && m.email.toLowerCase() === ct) return false;
              if (m.phone && td.length === 10 && String(m.phone).replace(/\D/g, '').slice(-10) === td) return false;
            }
            return true;
          });
          if (sDb.members.length < initLen) {
            fs.writeFileSync(serverDbPath, JSON.stringify(sDb, null, 2));
            deletedFromAnyDb = true;
          }
        }
      }
    } catch (e) {
      // Continue silently
    }

    // C. Also delete from PostgreSQL if DATABASE_URL is set
    if (process.env.DATABASE_URL) {
      try {
        const pgModule = await import('pg').catch(() => null);
        const PgClient = pgModule?.default?.Client || pgModule?.Client;
        if (PgClient) {
          const client = new PgClient({ connectionString: process.env.DATABASE_URL });
          await client.connect();
          const delTargets = [deletedId, ...searchTargets].filter(Boolean);
          for (const t of delTargets) {
            const digits = String(t).replace(/\D/g, '').slice(-10);
            const res = await client.query(
              'DELETE FROM members WHERE id = $1 OR LOWER(email) = $2 OR phone ILIKE $3',
              [String(t), String(t).toLowerCase(), digits.length >= 8 ? `%${digits}%` : `%${t}%`]
            ).catch(() => null);
            if (res && res.rowCount > 0) {
              deletedFromAnyDb = true;
            }
          }
          if (deletedId) {
            await client.query('DELETE FROM notifications WHERE member_id = $1', [deletedId]).catch(() => {});
            await client.query('DELETE FROM event_rsvps WHERE member_id = $1', [deletedId]).catch(() => {});
            await client.query('DELETE FROM group_members WHERE member_id = $1', [deletedId]).catch(() => {});
          }
          await client.end().catch(() => {});
        }
      } catch (e) {
        // Continue silently
      }
    }

    // D. Also delete from SQLite connect_maratha.db if it exists
    try {
      const { runQuery } = await import('../../database/database.js').catch(() => ({}));
      if (runQuery) {
        for (const t of searchTargets) {
          const digits = t.replace(/\D/g, '').slice(-10);
          await runQuery('DELETE FROM members WHERE id = ? OR LOWER(email) = ? OR phone LIKE ?', [
            t, t.toLowerCase(), digits.length >= 8 ? `%${digits}%` : t
          ]).catch(() => {});
        }
        deletedFromAnyDb = true;
      }
    } catch (e) {
      // Continue silently
    }

    // E. Log audit log
    db.addAuditLog(deletedFromAnyDb ? 'ACCOUNT_DELETED' : 'ACCOUNT_DELETION_REQUESTED', deletedId || 'unmatched', {
      reason: sanitize(reason) || 'Self requested deletion',
      requestId,
      deletedFromDb: deletedFromAnyDb,
      deletedAt: new Date().toISOString()
    });

    if (deletedFromAnyDb) {
      return sendSuccess(res, 'आपले खाते आणि सर्व संबंधित डेटा डेटाबेसमधून यशस्वीरित्या कायमस्वरूपी हटवण्यात आला आहे.', {
        deleted: true,
        requestId,
        memberId: deletedId
      });
    }

    // If not found in any database at all, inform user clearly
    return sendError(res, 'हा सदस्य किंवा मोबाईल नंबर कोणत्याही डेटाबेसमध्ये आढळला नाही. कृपया अचूक माहिती तपासा.', 'MEMBER_NOT_FOUND', 404, {
      requestId
    });
  } catch (err) {
    return sendError(res, err.message || 'खाते हटवताना त्रुटी आली.', 'DELETE_FAILED', 500);
  }
};

// 1. Mobile App (Flutter) endpoint: DELETE /api/auth/account (with confirm: 'DELETE')
router.delete('/account', handleDeleteAccount);
// 2. Web Portal endpoints: POST & DELETE /api/auth/delete-account
router.post('/delete-account', handleDeleteAccount);
router.delete('/delete-account', handleDeleteAccount);

export default router;
