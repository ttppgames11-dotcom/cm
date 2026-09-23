import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { runQuery, get, all } from '../db/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

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
      return res.status(401).json({ success: false, error: 'वापरकर्ता आढळला नाही. कृपया माहिती तपासा.' });
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

export default router;
