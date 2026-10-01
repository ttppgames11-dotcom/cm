import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runQuery, get, all } from '../../database/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { sendPasswordResetOtpEmail } from '../utils/mailer.js';

const JWT_SECRET = process.env.JWT_SECRET || 'connect_maratha_secret_key_2026';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password, city, district, profession, business, education, skills, about } = req.body;

    if (!name || (!email && !phone)) {
      return res.status(400).json({ success: false, error: 'नाव आणि ईमेल किंवा फोन नंबर आवश्यक आहे.' });
    }

    // Check if user already exists
    const existing = await get('SELECT id FROM members WHERE email = ? OR phone = ?', [email || '', phone || '']);
    if (existing) {
      return res.status(400).json({ success: false, error: 'या ईमेल किंवा फोन क्रमांकासह सदस्य आधीच नोंदणीकृत आहे.' });
    }

    const memberId = 'M' + Math.floor(1000 + Math.random() * 9000);
    const passwordHash = password ? bcrypt.hashSync(password, 8) : bcrypt.hashSync('password123', 8);
    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify(skills ? [skills] : []);

    await runQuery(`
      INSERT INTO members (id, name, email, phone, password_hash, avatar, city, district, profession, business, education, skills, about, tier, role, joined, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Basic', 'member', date('now'), datetime('now'))
    `, [memberId, name, email || '', phone || '', passwordHash, '👤', city || '', district || 'पुणे', profession || '', business || '', education || '', skillsJson, about || '']);

    const newMember = await get('SELECT id, name, email, phone, avatar, city, district, profession, business, education, skills, about, tier, role, joined FROM members WHERE id = ?', [memberId]);
    
    try {
      newMember.skills = JSON.parse(newMember.skills || '[]');
    } catch {
      newMember.skills = [];
    }

    const token = generateToken(newMember);

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
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier can be email, phone or ID

    if (!identifier) {
      return res.status(400).json({ success: false, error: 'कृपया आयडी, ईमेल किंवा फोन प्रविष्ट करा.' });
    }

    const member = await get(`
      SELECT * FROM members 
      WHERE id = ? OR email = ? OR phone = ?
    `, [identifier, identifier, identifier]);

    if (!member) {
      return res.status(401).json({
        success: false,
        code: 'USER_NOT_REGISTERED',
        error: 'वापरकर्ता तपशील आढळले नाहीत. कृपया नोंदणी करा (User details are not fetch, please नोंदणी करा).'
      });
    }

    // If password provided, verify hash
    if (password && member.password_hash) {
      const isMatch = bcrypt.compareSync(password, member.password_hash);
      // If default demo password or exact match
      if (!isMatch && password !== 'password123') {
        return res.status(401).json({ success: false, error: 'अवैध संकेतशब्द (Incorrect password).' });
      }
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

// POST /api/auth/google
router.post('/google', async (req, res, next) => {
  try {
    const { googleId, name, email, photoUrl } = req.body;

    if (!email && !googleId) {
      return res.status(400).json({ success: false, error: 'Google खात्याची माहिती मिळाली नाही.' });
    }

    // Check if user already exists by email
    let member = await get('SELECT * FROM members WHERE email = ?', [email || '']);

    if (!member) {
      // User is not registered in the database
      return res.status(404).json({
        success: false,
        code: 'USER_NOT_REGISTERED',
        error: 'वापरकर्ता तपशील आढळले नाहीत. कृपया आधी नोंदणी करा.'
      });
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

    try {
      member.skills = JSON.parse(member.skills || '[]');
      member.interests = JSON.parse(member.interests || '[]');
    } catch {
      member.skills = [];
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
router.post('/forgot-password', async (req, res, next) => {
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
      INSERT OR REPLACE INTO password_resets (email, otp_hash, expires_at, attempts, created_at)
      VALUES (?, ?, ?, 0, datetime('now'))
    `, [cleanEmail, otpHash, expiresAt]);

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

export default router;

