import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { sendError } from '../utils/response.js';
import { db } from '../db/realtimeDb.js';

// No hardcoded fallback: a known secret would let anyone forge admin tokens.
// Production must set JWT_SECRET (32+ chars). In development a random per-process secret is used.
function resolveJwtSecret() {
  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv && fromEnv.length >= 32) return fromEnv;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to at least 32 characters in production');
  }
  console.warn('[auth] JWT_SECRET missing or shorter than 32 chars: using a random secret for this process (tokens reset on restart)');
  return randomBytes(48).toString('hex');
}
export const JWT_SECRET = resolveJwtSecret();

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'प्रमाणीकरण आवश्यक आहे (Authorization token is missing)', 'AUTH_TOKEN_MISSING', 401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return sendError(res, 'अवैध किंवा मुदत संपलेले टोकन (Invalid or expired token)', 'AUTH_TOKEN_INVALID', 403);
    }
    req.user = user;
    if (user && user.id) {
      // Staff-managed accounts live in db.json. Check them fresh on every request: a disabled account,
      // a password change or a role change takes effect immediately instead of waiting for the token to expire.
      const member = db.findById('members', user.id);
      if (member) {
        if (member.status === 'disabled' || member.disabled === true) {
          return sendError(res, 'हे खाते बंद केले आहे (Account disabled)', 'ACCOUNT_DISABLED', 403);
        }
        if ((member.tokenVersion || 0) !== (user.tv || 0)) {
          return sendError(res, 'कृपया पुन्हा लॉगिन करा (Session expired)', 'AUTH_TOKEN_INVALID', 401);
        }
        req.user = { ...user, role: member.role || user.role, unitId: member.unitId || null, unitRole: member.unitRole || null };
      }
      try {
        db.touchUserActivity(user.id);
      } catch (e) {
        // Silently continue
      }
    }
    next();
  });
}

export function optionalToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err && user) {
        // Same freshness rule as authenticateToken: a disabled account or revoked token counts as a guest
        const member = user.id ? db.findById('members', user.id) : null;
        if (member && (member.status === 'disabled' || member.disabled === true || (member.tokenVersion || 0) !== (user.tv || 0))) {
          return next();
        }
        req.user = member ? { ...user, role: member.role || user.role } : user;
        if (user.id) {
          try {
            db.touchUserActivity(user.id);
          } catch (e) {
            // Silently continue
          }
        }
      }
      next();
    });
  } else {
    next();
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'प्रमाणीकरण आवश्यक आहे', 'AUTH_REQUIRED', 401);
    }
    const userRole = (req.user.role || 'member').toLowerCase();
    const allowed = roles.map(r => r.toLowerCase());

    // 1. Explicitly authorized roles pass
    if (allowed.includes(userRole)) {
      return next();
    }

    // 2. Full platform admins (superadmin, admin) pass
    if (userRole === 'superadmin' || userRole === 'admin') {
      return next();
    }

    // 3. CEO has read-only executive privileges; only passes mutating routes if explicitly listed
    if (userRole === 'ceo' && (req.method === 'GET' || req.method === 'HEAD' || allowed.includes('ceo'))) {
      return next();
    }

    return sendError(res, 'या कृतीसाठी आपल्याकडे पुरेसे अधिकार नाहीत (Forbidden: Role not authorized)', 'PERMISSION_DENIED', 403);
  };
}


export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role || 'member',
      tier: user.tier || 'Gold',
      district: user.district || 'पुणे',
      tv: user.tokenVersion || 0
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export default { authenticateToken, optionalToken, requireRole, generateToken };
