// Shared account helpers: lookup, validation and creation of member accounts.
// Accounts that staff create (admin Users tab, CRM units) live in backend/db.json (collection "members").
// Self-registered members live in SQLite. Login and /me look in both.
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { db } from '../db/realtimeDb.js';
import { get } from '../../database/database.js';
import { sanitize, isValidEmail, isValidPhone, cleanPhone } from './validator.js';

export const MIN_PASSWORD_LENGTH = 8;

// Roles a platform admin may hand out from the Users tab. Unit owners/staff get theirs from the CRM unit endpoints.
export const ASSIGNABLE_ROLES = [
  'member', 'chapter_president', 'seva_helpdesk', 'finance_officer',
  'state_admin', 'branch_admin', 'division_admin', 'district_admin', 'taluka_admin',
  'center_manager', 'center_staff',
  'admin', 'ceo', 'superadmin'
];

export const GLOBAL_ROLES = ['superadmin', 'admin'];

export function phoneDigits(p) {
  return String(p || '').replace(/\D/g, '').slice(-10);
}

export function isDisabled(m) {
  return !!m && (m.status === 'disabled' || m.disabled === true);
}

export function validatePassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `पासवर्ड किमान ${MIN_PASSWORD_LENGTH} अक्षरांचा असणे आवश्यक आहे.`;
  }
  if (password.length > 128) return 'पासवर्ड खूप मोठा आहे.';
  return null;
}

// Find a member in db.json by id, email or phone (last 10 digits).
export function findJsonAccount(identifier) {
  const raw = String(identifier || '').trim();
  if (!raw) return null;
  const byId = db.findById('members', raw);
  if (byId) return byId;
  const lower = raw.toLowerCase();
  const digits = phoneDigits(raw);
  const members = db.getCollection('members');
  return members.find(m =>
    (m.email && String(m.email).toLowerCase() === lower) ||
    (digits.length === 10 && /^\+?[\d\s-]+$/.test(String(m.phone || '')) && phoneDigits(m.phone) === digits)
  ) || null;
}

// Login lookup: db.json first (staff-managed accounts), then SQLite (self-registered members).
export async function findAccountForLogin(identifier) {
  const json = findJsonAccount(identifier);
  if (json) return { member: json, source: 'json' };
  const clean = String(identifier || '').trim();
  const row = await get(
    'SELECT * FROM members WHERE id = ? OR LOWER(email) = ? OR phone = ?',
    [clean, clean.toLowerCase(), clean]
  );
  return row ? { member: row, source: 'sql' } : { member: null, source: null };
}

export async function phoneOrEmailTaken(phone, email, exceptId = null) {
  const digits = phoneDigits(phone);
  const lowerEmail = String(email || '').toLowerCase();
  const clash = db.getCollection('members').find(m =>
    m.id !== exceptId &&
    ((digits && phoneDigits(m.phone) === digits) || (lowerEmail && String(m.email || '').toLowerCase() === lowerEmail))
  );
  if (clash) {
    return digits && phoneDigits(clash.phone) === digits ? 'PHONE_EXISTS' : 'EMAIL_EXISTS';
  }
  try {
    const row = await get(
      'SELECT id, phone, email FROM members WHERE (phone != \'\' AND phone LIKE ?) OR (? != \'\' AND LOWER(email) = ?)',
      [`%${digits || 'x-none'}`, lowerEmail, lowerEmail]
    );
    if (row && row.id !== exceptId) {
      return digits && phoneDigits(row.phone) === digits ? 'PHONE_EXISTS' : 'EMAIL_EXISTS';
    }
  } catch (_) { /* SQLite unavailable: db.json check above stands */ }
  return null;
}

export function newMemberId() {
  return `CM-96K-${Date.now().toString().slice(-5)}${randomBytes(2).toString('hex').toUpperCase()}`;
}

export function publicAccount(m) {
  if (!m) return m;
  const { password_hash, password, otp, tokenVersion, ...safe } = m;
  return safe;
}

// Validates and creates a member with a bcrypt password. Returns { ok, user } or { ok:false, code, error, status }.
export async function createMemberAccount(input, { role, unitId = null, unitRole = null, createdBy = null, verified = true } = {}) {
  const name = sanitize(input.name);
  const phoneRaw = typeof input.phone === 'string' ? input.phone : String(input.phone || '');
  if (!name || !phoneRaw) {
    return { ok: false, status: 400, code: 'MISSING_FIELDS', error: 'कृपया नाव आणि संपर्क नंबर प्रविष्ट करा.' };
  }
  if (!isValidPhone(phoneRaw)) {
    return { ok: false, status: 400, code: 'INVALID_PHONE', error: 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.' };
  }
  const phone = cleanPhone(phoneRaw);
  const email = sanitize(input.email) || '';
  if (email && !isValidEmail(email)) {
    return { ok: false, status: 400, code: 'INVALID_EMAIL', error: 'कृपया वैध ई-मेल प्रविष्ट करा.' };
  }
  const pwErr = validatePassword(input.password);
  if (pwErr) return { ok: false, status: 400, code: 'WEAK_PASSWORD', error: pwErr };
  if (!role || !ASSIGNABLE_ROLES.includes(role)) {
    return { ok: false, status: 400, code: 'INVALID_ROLE', error: 'अवैध भूमिका (role).' };
  }
  const taken = await phoneOrEmailTaken(phone, email);
  if (taken) {
    return {
      ok: false, status: 409, code: taken,
      error: taken === 'PHONE_EXISTS' ? 'हा फोन नंबर अगोदरच नोंदणीकृत आहे.' : 'हा ई-मेल अगोदरच नोंदणीकृत आहे.'
    };
  }

  const district = sanitize(input.district) || 'पुणे';
  const member = {
    id: newMemberId(),
    name,
    email: email || `${phoneDigits(phone)}@connectmaratha.org`,
    phone,
    password_hash: bcrypt.hashSync(input.password, 10),
    avatar: '👤',
    city: district,
    district,
    taluka: sanitize(input.taluka) || '',
    division: sanitize(input.division) || '',
    state: 'महाराष्ट्र',
    country: 'भारत',
    kul: sanitize(input.kul) || '९६ कुळी मराठा',
    gotra: sanitize(input.gotra) || '',
    profession: sanitize(input.profession) || '',
    business: sanitize(input.business) || '',
    tier: sanitize(input.tier) || 'Gold',
    role,
    status: 'active',
    unitId,
    unitRole,
    verified,
    verificationStatus: verified ? 'प्रमाणित (Verified)' : 'पडताळणी प्रलंबित',
    tokenVersion: 0,
    createdBy,
    joined: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };
  db.insert('members', member);
  return { ok: true, user: member };
}

// Changing the password or disabling bumps tokenVersion so tokens issued earlier stop working.
export function setPassword(memberId, password) {
  const hash = bcrypt.hashSync(password, 10);
  const m = db.findById('members', memberId);
  return db.update('members', memberId, { password_hash: hash, tokenVersion: (m?.tokenVersion || 0) + 1 });
}

export function setDisabled(memberId, disabled) {
  const m = db.findById('members', memberId);
  return db.update('members', memberId, {
    status: disabled ? 'disabled' : 'active',
    tokenVersion: (m?.tokenVersion || 0) + (disabled ? 1 : 0)
  });
}
