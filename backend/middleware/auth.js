import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { get, runQuery } from '../../database/database.js';

const DEV_FALLBACK_SECRET = 'connect_maratha_dev_only_secret';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production');
}
const JWT_SECRET = process.env.JWT_SECRET || DEV_FALLBACK_SECRET;

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_TTL_DAYS = 30;

export const ROLES = { MEMBER: 'member', MODERATOR: 'moderator', ADMIN: 'admin' };

function fail(res, status, code, error) {
  return res.status(status).json({ success: false, code, error });
}

/** Short-lived access token. Only the member id is trusted from the token;
 *  role/status are always re-read from the database. */
export function generateToken(user) {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
}

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

/** Creates a refresh token (stored hashed) and returns both tokens. */
export async function issueTokens(member, req) {
  const refreshToken = crypto.randomBytes(48).toString('base64url');
  const id = 'RT-' + crypto.randomBytes(8).toString('hex');
  await runQuery(
    `INSERT INTO refresh_tokens (id, member_id, token_hash, expires_at, user_agent)
     VALUES (?, ?, ?, now() + (? || ' days')::interval, ?)`,
    [id, member.id, sha256(refreshToken), String(REFRESH_TOKEN_TTL_DAYS), String(req?.get?.('user-agent') || '').slice(0, 200)]
  );
  return {
    token: generateToken(member),
    refreshToken,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS
  };
}

/** Rotates a refresh token. Re-use of an already-rotated token is treated as
 *  theft and revokes every session of that member. */
export async function rotateRefreshToken(refreshToken, req) {
  const row = await get('SELECT * FROM refresh_tokens WHERE token_hash = ?', [sha256(String(refreshToken))]);
  if (!row) return null;
  if (row.revoked_at) {
    await runQuery('UPDATE refresh_tokens SET revoked_at = now() WHERE member_id = ? AND revoked_at IS NULL', [row.member_id]);
    return null;
  }
  if (new Date(row.expires_at) < new Date()) return null;

  const member = await get('SELECT id, name, role, status FROM members WHERE id = ?', [row.member_id]);
  if (!member || member.status !== 'active') return null;

  const tokens = await issueTokens(member, req);
  await runQuery('UPDATE refresh_tokens SET revoked_at = now() WHERE id = ?', [row.id]);
  return { member, ...tokens };
}

export async function revokeRefreshToken(refreshToken) {
  await runQuery('UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = ? AND revoked_at IS NULL', [sha256(String(refreshToken))]);
}

export async function revokeAllSessions(memberId) {
  await runQuery('UPDATE refresh_tokens SET revoked_at = now() WHERE member_id = ? AND revoked_at IS NULL', [memberId]);
}

async function loadUser(req) {
  const header = req.headers['authorization'];
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return { error: 'missing' };
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return { error: err.name === 'TokenExpiredError' ? 'expired' : 'invalid' };
  }
  const member = await get('SELECT id, name, role, tier, status FROM members WHERE id = ?', [payload.id]);
  if (!member) return { error: 'invalid' };
  if (member.status !== 'active') return { error: 'suspended' };
  return { user: { id: member.id, name: member.name, role: member.role || ROLES.MEMBER, tier: member.tier } };
}

/** Requires a valid access token. Sets req.user = { id, name, role, tier }. */
export async function requireAuth(req, res, next) {
  try {
    const { user, error } = await loadUser(req);
    if (error === 'suspended') return fail(res, 403, 'ACCOUNT_SUSPENDED', 'आपले खाते निलंबित करण्यात आले आहे.');
    if (error === 'expired') return fail(res, 401, 'TOKEN_EXPIRED', 'सत्र संपले आहे. कृपया पुन्हा लॉगिन करा.');
    if (error) return fail(res, 401, 'UNAUTHORIZED', 'प्रमाणीकरण आवश्यक आहे.');
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/** Sets req.user when a valid token is present, otherwise continues anonymously. */
export async function optionalAuth(req, res, next) {
  try {
    const { user } = await loadUser(req);
    if (user) req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/** Use after requireAuth. Role comes from the database, never from the client. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, 403, 'FORBIDDEN', 'ही कृती करण्याची आपल्याला परवानगी नाही.');
    }
    next();
  };
}

export const requireStaff = [requireAuth, requireRole(ROLES.ADMIN, ROLES.MODERATOR)];
export const requireAdmin = [requireAuth, requireRole(ROLES.ADMIN)];

/** Records a staff/system action for accountability. */
export async function auditLog(userId, userName, action, details) {
  await runQuery(
    `INSERT INTO audit_logs (id, user_id, user_name, action, details, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    ['LOG-' + crypto.randomBytes(6).toString('hex'), userId || null, userName || null, action, details || '']
  );
}

// Kept for backward compatibility with existing imports.
export const authenticateToken = requireAuth;
export default { requireAuth, optionalAuth, requireRole, generateToken, authenticateToken };
