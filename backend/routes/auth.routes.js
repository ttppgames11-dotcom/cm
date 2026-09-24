import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { runQuery, get, transaction } from '../../database/database.js';
import {
  requireAuth, issueTokens, rotateRefreshToken, revokeRefreshToken, revokeAllSessions, auditLog
} from '../middleware/auth.js';
import { loginLimiter, registerLimiter } from '../middleware/security.js';
import { str, bad } from '../middleware/validate.js';

const router = Router();

const MIN_PASSWORD_LENGTH = 8;
const PUBLIC_MEMBER_COLUMNS =
  'id, name, email, phone, avatar, city, district, state, country, profession, business, education, skills, interests, about, tier, role, verified_mobile, verified_email, verified_profile, joined';

function parseJsonList(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function withParsedLists(member) {
  member.skills = parseJsonList(member.skills);
  member.interests = parseJsonList(member.interests);
  return member;
}

function toJsonList(value) {
  if (Array.isArray(value)) return JSON.stringify(value.slice(0, 30).map((v) => str(v, 60)));
  return JSON.stringify(value ? [str(value, 200)] : []);
}

async function generateMemberId() {
  for (let i = 0; i < 20; i++) {
    const id = 'M' + Math.floor(1000 + Math.random() * 9000);
    if (!(await get('SELECT id FROM members WHERE id = ?', [id]))) return id;
  }
  return 'M' + Date.now().toString().slice(-8);
}

async function sessionResponse(req, res, status, message, member, extra = {}) {
  const tokens = await issueTokens(member, req);
  await runQuery("UPDATE members SET last_login_at = datetime('now') WHERE id = ?", [member.id]);
  res.status(status).json({ success: true, message, ...tokens, member, ...extra });
}

// POST /api/auth/register
router.post('/register', registerLimiter, async (req, res, next) => {
  try {
    const { password } = req.body;
    const name = str(req.body.name, 100);
    const email = str(req.body.email, 200).toLowerCase();
    const mobile = str(req.body.phone, 20);

    if (!name || (!email && !mobile)) {
      return bad(res, 'नाव आणि ईमेल किंवा फोन नंबर आवश्यक आहे.', 'MISSING_FIELDS');
    }
    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return bad(res, 'कृपया वैध ईमेल प्रविष्ट करा.', 'INVALID_EMAIL');
    }
    if (mobile && !/^[+0-9][0-9\s-]{6,18}$/.test(mobile)) {
      return bad(res, 'कृपया वैध मोबाईल नंबर प्रविष्ट करा.', 'INVALID_PHONE');
    }
    if (!password || String(password).length < MIN_PASSWORD_LENGTH || String(password).length > 128) {
      return bad(res, 'संकेतशब्द किमान ८ अक्षरांचा असावा (Password must be at least 8 characters).', 'WEAK_PASSWORD');
    }

    const existing = await get(
      "SELECT id FROM members WHERE (? <> '' AND lower(email) = ?) OR (? <> '' AND phone = ?)",
      [email, email, mobile, mobile]
    );
    if (existing) {
      return res.status(409).json({ success: false, code: 'ALREADY_REGISTERED', error: 'या ईमेल किंवा फोन क्रमांकासह सदस्य आधीच नोंदणीकृत आहे. कृपया लॉगिन करा.' });
    }

    const memberId = await generateMemberId();
    const passwordHash = bcrypt.hashSync(String(password), 10);

    await runQuery(`
      INSERT INTO members (id, name, email, phone, password_hash, avatar, city, district, profession, business, education, skills, interests, about, tier, role, status, auth_provider, joined, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Basic', 'member', 'active', 'password', date('now'), datetime('now'))
    `, [memberId, name, email, mobile, passwordHash, '👤', str(req.body.city, 100), str(req.body.district, 60) || 'पुणे',
        str(req.body.profession, 100), str(req.body.business, 100), str(req.body.education, 100),
        toJsonList(req.body.skills), toJsonList(req.body.interests), str(req.body.about, 1000)]);

    const member = withParsedLists(await get(`SELECT ${PUBLIC_MEMBER_COLUMNS} FROM members WHERE id = ?`, [memberId]));
    await sessionResponse(req, res, 201, 'नोंदणी यशस्वी झाली!', member);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { password } = req.body;
    const id = str(req.body.identifier, 200);

    if (!id) {
      return bad(res, 'कृपया आयडी, ईमेल किंवा फोन प्रविष्ट करा.', 'MISSING_FIELDS');
    }

    const member = await get(
      'SELECT * FROM members WHERE id = ? OR lower(email) = lower(?) OR phone = ?',
      [id, id, id]
    );

    if (!member) {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', error: 'वापरकर्त्याची माहिती आढळली नाही. कृपया नोंदणी करा.' });
    }

    if (!password || !member.password_hash || member.auth_provider === 'google' ||
        !bcrypt.compareSync(String(password), member.password_hash)) {
      return res.status(401).json({ success: false, code: 'INVALID_PASSWORD', error: 'अवैध संकेतशब्द (Incorrect password).' });
    }
    if (member.status !== 'active') {
      return res.status(403).json({ success: false, code: 'ACCOUNT_SUSPENDED', error: 'आपले खाते निलंबित करण्यात आले आहे.' });
    }

    delete member.password_hash;
    await sessionResponse(req, res, 200, 'लॉगिन यशस्वी झाले!', withParsedLists(member));
  } catch (err) {
    next(err);
  }
});

// Google client IDs (comma separated) that may issue ID tokens for this API:
// the Web client ID used as `serverClientId` by the mobile app, plus any web
// app client IDs. Required in production.
const GOOGLE_CLIENT_IDS = (process.env.GOOGLE_CLIENT_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

async function verifyGoogleIdToken(idToken) {
  if (!idToken) return null;
  const resp = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  if (!resp.ok) return null;
  const info = await resp.json();
  if (info.email_verified !== 'true' && info.email_verified !== true) return null;
  if (GOOGLE_CLIENT_IDS.length > 0) {
    if (!GOOGLE_CLIENT_IDS.includes(info.aud)) return null;
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('GOOGLE_CLIENT_IDS must be set in production');
  }
  return info;
}

// POST /api/auth/google  { idToken }
// Verifies the Google ID token, then logs in the member with that email or
// creates a new one (stored in the members table) on first sign-in.
router.post('/google', loginLimiter, async (req, res, next) => {
  try {
    const idToken = str(req.body.idToken, 5000);
    if (!idToken) {
      return bad(res, 'Google टोकन आवश्यक आहे.', 'MISSING_FIELDS');
    }

    const info = await verifyGoogleIdToken(idToken);
    if (!info || !info.email) {
      return res.status(401).json({ success: false, code: 'INVALID_GOOGLE_TOKEN', error: 'Google खाते सत्यापित करता आले नाही.' });
    }

    const email = String(info.email).trim().toLowerCase();
    let member = await get(`SELECT ${PUBLIC_MEMBER_COLUMNS}, status FROM members WHERE lower(email) = ?`, [email]);
    let isNewUser = false;

    if (member && member.status !== 'active') {
      return res.status(403).json({ success: false, code: 'ACCOUNT_SUSPENDED', error: 'आपले खाते निलंबित करण्यात आले आहे.' });
    }

    if (!member) {
      isNewUser = true;
      const memberId = await generateMemberId();
      // Google members have no password; store an unguessable hash so the
      // password login path can never succeed for them.
      const unusableHash = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 10);
      await runQuery(`
        INSERT INTO members (id, name, email, phone, password_hash, avatar, city, district, skills, interests, tier, role, status, auth_provider, joined, created_at)
        VALUES (?, ?, ?, '', ?, '👤', '', 'पुणे', '[]', '[]', 'Basic', 'member', 'active', 'google', date('now'), datetime('now'))
      `, [memberId, str(info.name, 100) || email.split('@')[0], email, unusableHash]);
      member = await get(`SELECT ${PUBLIC_MEMBER_COLUMNS} FROM members WHERE id = ?`, [memberId]);
    }

    delete member.status;
    await sessionResponse(req, res, isNewUser ? 201 : 200,
      isNewUser ? 'नोंदणी यशस्वी झाली!' : 'लॉगिन यशस्वी झाले!', withParsedLists(member), { isNewUser });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh  { refreshToken } -> new access + refresh token (rotation)
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = str(req.body.refreshToken, 500);
    const result = refreshToken ? await rotateRefreshToken(refreshToken, req) : null;
    if (!result) {
      return res.status(401).json({ success: false, code: 'SESSION_EXPIRED', error: 'सत्र संपले आहे. कृपया पुन्हा लॉगिन करा.' });
    }
    res.json({ success: true, token: result.token, refreshToken: result.refreshToken, expiresIn: result.expiresIn });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout  { refreshToken } -> invalidates that session server-side
router.post('/logout', async (req, res, next) => {
  try {
    const refreshToken = str(req.body.refreshToken, 500);
    if (refreshToken) await revokeRefreshToken(refreshToken);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout-all -> invalidates every session of the caller
router.post('/logout-all', requireAuth, async (req, res, next) => {
  try {
    await revokeAllSessions(req.user.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const member = await get(`SELECT ${PUBLIC_MEMBER_COLUMNS} FROM members WHERE id = ?`, [req.user.id]);
    if (!member) {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', error: 'सदस्य आढळला नाही.' });
    }
    res.json({ success: true, member: withParsedLists(member) });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/auth/account  { password | idToken, confirm: "DELETE" }
 *
 * Permanently deletes the caller's account. Re-authentication is required
 * (password, or a fresh Google ID token for Google accounts) and the caller
 * must type the confirmation word. Runs in one transaction.
 *
 * Retention policy (documented in docs/ACCOUNT_DELETION.md):
 *  - DELETED: profile, posts, comments, likes, group memberships, RSVPs,
 *    notifications, blocks, business listings + reviews, job posts and
 *    applications, sessions.
 *  - ANONYMISED (kept for other users' records / accounting): referrals and
 *    meetings involving other members, donation records (financial),
 *    audit-log entries, quiz leaderboard entries, moderation reports.
 */
router.delete('/account', requireAuth, loginLimiter, async (req, res, next) => {
  try {
    if (str(req.body.confirm, 20) !== 'DELETE') {
      return bad(res, 'खाते हटवण्यासाठी DELETE टाइप करा.', 'CONFIRMATION_REQUIRED');
    }
    const member = await get('SELECT id, name, email, phone, password_hash, auth_provider FROM members WHERE id = ?', [req.user.id]);
    if (!member) {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', error: 'सदस्य आढळला नाही.' });
    }

    if (member.auth_provider === 'google') {
      const info = await verifyGoogleIdToken(str(req.body.idToken, 5000));
      if (!info || String(info.email).toLowerCase() !== String(member.email).toLowerCase()) {
        return res.status(401).json({ success: false, code: 'REAUTH_REQUIRED', error: 'खाते हटवण्यासाठी Google द्वारे पुन्हा सत्यापन आवश्यक आहे.' });
      }
    } else if (!req.body.password || !bcrypt.compareSync(String(req.body.password), member.password_hash || '')) {
      return res.status(401).json({ success: false, code: 'INVALID_PASSWORD', error: 'अवैध संकेतशब्द (Incorrect password).' });
    }

    const id = member.id;
    await transaction(async (t) => {
      // Community content
      await t.runQuery('UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id IN (SELECT post_id FROM post_likes WHERE member_id = ?)', [id]);
      await t.runQuery('DELETE FROM post_likes WHERE member_id = ?', [id]);
      await t.runQuery('DELETE FROM post_likes WHERE post_id IN (SELECT id FROM posts WHERE author_id = ?)', [id]);
      await t.runQuery('DELETE FROM post_comments WHERE author_id = ? OR post_id IN (SELECT id FROM posts WHERE author_id = ?)', [id, id]);
      await t.runQuery('DELETE FROM posts WHERE author_id = ?', [id]);
      await t.runQuery('UPDATE groups SET members_count = GREATEST(members_count - 1, 0) WHERE id IN (SELECT group_id FROM group_members WHERE member_id = ?)', [id]);
      await t.runQuery('DELETE FROM group_members WHERE member_id = ?', [id]);
      // Events, notifications, moderation
      await t.runQuery('UPDATE events e SET rsvp_count = GREATEST(e.rsvp_count - r.seats, 0) FROM event_rsvps r WHERE r.event_id = e.id AND r.member_id = ?', [id]);
      await t.runQuery('DELETE FROM event_rsvps WHERE member_id = ?', [id]);
      await t.runQuery('UPDATE events SET creator_id = NULL WHERE creator_id = ?', [id]);
      await t.runQuery('DELETE FROM notifications WHERE member_id = ?', [id]);
      await t.runQuery('DELETE FROM blocks WHERE blocker_id = ? OR blocked_id = ?', [id, id]);
      await t.runQuery("UPDATE reports SET status = 'dismissed', resolution = 'target_deleted', resolved_at = now() WHERE target_id = ? AND target_type = 'member' AND status = 'open'", [id]);
      await t.runQuery("UPDATE reports SET reporter_id = 'deleted-' || id WHERE reporter_id = ?", [id]);
      // Business + jobs
      await t.runQuery('DELETE FROM business_reviews WHERE member_id = ? OR business_id IN (SELECT id FROM businesses WHERE owner_id = ?)', [id, id]);
      await t.runQuery('DELETE FROM businesses WHERE owner_id = ?', [id]);
      await t.runQuery('DELETE FROM job_applications WHERE member_id = ? OR job_id IN (SELECT id FROM jobs WHERE poster_id = ?)', [id, id]);
      await t.runQuery('DELETE FROM jobs WHERE poster_id = ?', [id]);
      // Records shared with other members / accounting: anonymise, keep
      await t.runQuery("UPDATE referrals SET giver_id = 'deleted', giver_name = 'Deleted member' WHERE giver_id = ?", [id]);
      await t.runQuery("UPDATE referrals SET recipient_id = 'deleted', recipient_name = 'Deleted member' WHERE recipient_id = ?", [id]);
      await t.runQuery("UPDATE meetings SET requester_id = 'deleted', requester_name = 'Deleted member' WHERE requester_id = ?", [id]);
      await t.runQuery("UPDATE meetings SET recipient_id = 'deleted', recipient_name = 'Deleted member' WHERE recipient_id = ?", [id]);
      await t.runQuery("UPDATE donations SET donor_id = 'deleted', donor_name = 'Deleted donor', phone = '' WHERE donor_id = ?", [id]);
      await t.runQuery("UPDATE quiz_submissions SET member_id = NULL, candidate_name = 'Deleted user' WHERE member_id = ?", [id]);
      await t.runQuery("UPDATE audit_logs SET user_name = 'Deleted user' WHERE user_id = ?", [id]);
      // Sessions and the account itself
      await t.runQuery('DELETE FROM refresh_tokens WHERE member_id = ?', [id]);
      await t.runQuery('DELETE FROM members WHERE id = ?', [id]);
    });

    await auditLog(null, 'system', 'account_deleted', `member ${id} deleted by the account owner`);
    res.json({ success: true, message: 'आपले खाते व वैयक्तिक माहिती कायमची हटवण्यात आली.' });
  } catch (err) {
    next(err);
  }
});

export default router;
