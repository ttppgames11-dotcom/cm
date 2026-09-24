import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.js';
import { db } from '../db/realtimeDb.js';

const JWT_SECRET = process.env.JWT_SECRET || 'connect_maratha_secret_key_2026';

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
        req.user = user;
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
    if (allowed.includes(userRole) || userRole === 'admin' || userRole === 'ceo' || userRole === 'superadmin') {
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
      district: user.district || 'पुणे'
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export default { authenticateToken, optionalToken, requireRole, generateToken };
