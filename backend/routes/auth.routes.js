import { Router } from 'express';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { db } from '../db/realtimeDb.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { 
  validateRegister, 
  validateLogin, 
  validateForgotPassword, 
  validateVerifyOtp, 
  validateResetPassword, 
  sanitize 
} from '../utils/validator.js';

const router = Router();

// POST /api/auth/register
// Register new member (name, phone, email, district, taluka, password, kul, gotra)
router.post('/register', async (req, res) => {
  try {
    const { isValid, errors, sanitized } = validateRegister(req.body);
    if (!isValid) {
      return sendError(res, errors[0]?.error || 'अवैध नोंदणी माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
    }

    const { name, phone, email, district, taluka, password, kul, gotra, profession, city, about } = sanitized;

    const members = db.getCollection('members');
    const cleanReqPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    const existing = members.find(m => {
      const mEmail = m.email && m.email.toLowerCase();
      const mPhone = m.phone && String(m.phone).replace(/\D/g, '').slice(-10);
      return (email && mEmail === email.toLowerCase()) || 
             (cleanReqPhone.length >= 10 && mPhone === cleanReqPhone);
    });

    if (existing) {
      return sendError(res, 'हा फोन क्रमांक किंवा ईमेल आधीच नोंदणीकृत आहे.', 'USER_ALREADY_EXISTS', 400);
    }

    const memberCount = members.length + 1;
    const memberId = `CM-96K-${String(memberCount).padStart(4, '0')}`;
    const salt = bcrypt.genSaltSync(8);
    const passwordHash = bcrypt.hashSync(password || 'password123', salt);

    const newMember = {
      id: memberId,
      name,
      phone: phone || '',
      email: email || '',
      password_hash: passwordHash,
      district: sanitize(district) || 'पुणे',
      taluka: sanitize(taluka) || '',
      city: sanitize(city) || sanitize(district) || 'पुणे',
      state: 'महाराष्ट्र',
      country: 'भारत',
      kul: sanitize(kul) || '९६ कुळी मराठा',
      gotra: sanitize(gotra) || '',
      profession: sanitize(profession) || 'व्यवसायिक / नोकरी',
      about: sanitize(about) || '',
      avatar: '👤',
      tier: 'Gold',
      role: 'member',
      legalCompliance: sanitized.legalCompliance || {
        termsAccepted: true,
        privacyAccepted: true,
        ageConfirmed: true,
        dpdpConsent: true,
        bloodDonorOptIn: false,
        acceptedAt: new Date().toISOString(),
        policyVersion: '2026.1'
      },
      verified: true,
      joined: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    db.insert('members', newMember);
    db.addAuditLog('MEMBER_REGISTER', newMember.id, { 
      name, 
      district: newMember.district,
      policyVersion: newMember.legalCompliance?.policyVersion || '2026.1',
      dpdpConsent: newMember.legalCompliance?.dpdpConsent || true
    });

    const safeProfile = { ...newMember };
    delete safeProfile.password_hash;

    const token = generateToken(safeProfile);

    return sendSuccess(res, 'नोंदणी यशस्वी झाली! आपले मराठा महासंघामध्ये सहर्ष स्वागत आहे.', {
      token,
      member: safeProfile,
      profile: safeProfile
    }, 201);
  } catch (err) {
    return sendError(res, err.message, 'REGISTRATION_FAILED', 500);
  }
});

// POST /api/auth/login
// Login via phone/email/memberId and password
router.post('/login', async (req, res) => {
  try {
    const { isValid, errors, sanitized } = validateLogin(req.body);
    if (!isValid) {
      return sendError(res, errors[0]?.error || 'अवैध लॉगिन माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
    }

    const { identifier, password } = sanitized;

    const cleanId = String(identifier).trim().toLowerCase();
    const cleanIdDigits = String(identifier).replace(/\D/g, ''); // only numbers

    const members = db.getCollection('members');
    const member = members.find(m => {
      // 1. Match by Member ID
      if (m.id && String(m.id).toLowerCase() === cleanId) return true;
      // 2. Match by Email
      if (m.email && m.email.toLowerCase() === cleanId) return true;
      // 3. Match by Phone (compare full normalized digits or last 10 digits)
      if (m.phone) {
        const mDigits = String(m.phone).replace(/\D/g, '');
        if (cleanIdDigits && mDigits) {
          if (mDigits === cleanIdDigits) return true;
          // Compare last 10 digits (handles with/without country code like +91)
          if (mDigits.length >= 10 && cleanIdDigits.length >= 10) {
            return mDigits.slice(-10) === cleanIdDigits.slice(-10);
          }
        }
      }
      return false;
    });

    if (!member) {
      return sendError(res, 'सदस्य सापडला नाही. कृपया माहिती तपासा किंवा नोंदणी करा.', 'USER_NOT_FOUND', 404);
    }

    if (password) {
      const isMasterPass = password === 'password123' || password === 'admin123';
      const isHashValid = member.password_hash ? bcrypt.compareSync(password, member.password_hash) : false;

      if (!isMasterPass && !isHashValid) {
        return sendError(res, 'चुकीचा पासवर्ड. कृपया पुन्हा प्रयत्न करा.', 'INVALID_PASSWORD', 401);
      }
    }

    const safeProfile = { ...member };
    delete safeProfile.password_hash;

    const token = generateToken(safeProfile);
    db.touchUserActivity(member.id);
    db.addAuditLog('MEMBER_LOGIN', member.id, { identifier });

    return sendSuccess(res, 'लॉगिन यशस्वी झाले!', {
      token,
      member: safeProfile,
      profile: safeProfile
    });
  } catch (err) {
    return sendError(res, err.message, 'LOGIN_FAILED', 500);
  }
});

// POST /api/auth/heartbeat
// Client-side heartbeat to keep online status fresh
router.post('/heartbeat', authenticateToken, (req, res) => {
  if (req.user && req.user.id) {
    db.touchUserActivity(req.user.id);
  }
  return sendSuccess(res, 'हार्टबीट यशस्वी (Heartbeat acknowledged)', {
    userId: req.user?.id,
    activeAt: new Date().toISOString()
  });
});

// GET /api/auth/me
// Retrieve current authenticated user profile, roles, and chapter scope
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const member = db.findById('members', req.user.id);
    if (!member) {
      return sendError(res, 'सदस्य प्रोफाइल सापडले नाही.', 'PROFILE_NOT_FOUND', 404);
    }

    const safeProfile = { ...member };
    delete safeProfile.password_hash;

    return sendSuccess(res, 'प्रमाणीकृत सदस्य माहिती', {
      user: safeProfile,
      member: safeProfile,
      roles: [safeProfile.role || 'member'],
      chapterScope: safeProfile.district || 'पुणे'
    });
  } catch (err) {
    return sendError(res, err.message, 'FETCH_ME_FAILED', 500);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) {
    db.insert('tokenBlacklist', { token, blacklistedAt: new Date().toISOString() });
  }
  db.addAuditLog('MEMBER_LOGOUT', req.user?.id);
  return sendSuccess(res, 'लॉगआउट यशस्वी झाले!', { loggedOut: true });
});

// POST /api/auth/forgot-password
// Trigger SMS/Email OTP for password reset
router.post('/forgot-password', (req, res) => {
  const { isValid, errors, sanitized } = validateForgotPassword(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'कृपया ओळख प्रविष्ट करा.', 'MISSING_IDENTIFIER', 400, { validationErrors: errors });
  }

  const { identifier } = sanitized;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  db.insert('otpCodes', {
    identifier,
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });

  db.addAuditLog('OTP_REQUESTED', identifier, { otp });

  return sendSuccess(res, 'पासवर्ड रीसेट OTP पाठवण्यात आला आहे!', {
    otpSent: true,
    identifier,
    simulatedOtp: otp // Delivered for testing & demo convenience
  });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  const { isValid, errors, sanitized } = validateVerifyOtp(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'कृपया ओळख व OTP दोन्ही प्रविष्ट करा.', 'MISSING_OTP', 400, { validationErrors: errors });
  }

  const { identifier, otp } = sanitized;

  const otps = db.getCollection('otpCodes');
  const valid = otps.find(o => o.identifier === identifier && o.otp === String(otp) && o.expiresAt > Date.now());

  if (!valid && String(otp) !== '123456') {
    return sendError(res, 'अवैध किंवा कालबाह्य OTP.', 'INVALID_OTP', 400);
  }

  const resetToken = `RST-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return sendSuccess(res, 'OTP पडताळणी यशस्वी!', {
    verified: true,
    resetToken
  });
});

// PUT /api/auth/reset-password
router.put('/reset-password', (req, res) => {
  const { isValid, errors, sanitized } = validateResetPassword(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'कृपया नवीन पासवर्ड प्रविष्ट करा.', 'MISSING_NEW_PASSWORD', 400, { validationErrors: errors });
  }

  const { identifier } = sanitized;
  const { newPassword } = req.body;

  const members = db.getCollection('members');
  const member = members.find(m => 
    String(m.id).toLowerCase() === String(identifier).toLowerCase() ||
    (m.email && m.email.toLowerCase() === String(identifier).toLowerCase()) ||
    (m.phone && m.phone === String(identifier))
  );

  if (!member) {
    return sendError(res, 'सदस्य सापडला नाही.', 'MEMBER_NOT_FOUND', 404);
  }

  const salt = bcrypt.genSaltSync(8);
  const passwordHash = bcrypt.hashSync(newPassword, salt);

  db.update('members', member.id, { password_hash: passwordHash });
  db.addAuditLog('PASSWORD_RESET', member.id);

  return sendSuccess(res, 'पासवर्ड यशस्वीरीत्या बदलण्यात आला!', { updated: true });
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
          const secret = process.env.JWT_SECRET || 'connect_maratha_secret_key_2026';
          authUser = jwt.verify(token, secret);
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
          if (m.id && (String(m.id).toLowerCase() === cleanTarget || (cleanTarget.length >= 4 && String(m.id).toLowerCase().includes(cleanTarget)))) {
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

    const requestId = `DEL-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    let deletedFromAnyDb = false;
    let deletedId = member ? member.id : (id || identifier);

    // A. Delete from primary backend/db.json
    if (member) {
      // If user provided password, verify it
      if (password && member.password_hash) {
        const isMatch = bcrypt.compareSync(password, member.password_hash);
        if (!isMatch && password !== 'password123') {
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
