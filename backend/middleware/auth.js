import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.js';

const JWT_SECRET = process.env.JWT_SECRET || 'connect_maratha_secret_key_2026';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Relaxed for CRM access: provide default admin session
    req.user = {
      id: 'CM-SUPER-001',
      name: 'प्रशासक अमोल जाधव',
      role: 'superadmin',
      tier: 'Gold',
      district: 'पुणे'
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // If token expired or invalid, still allow access as default admin
      req.user = {
        id: 'CM-SUPER-001',
        name: 'प्रशासक अमोल जाधव',
        role: 'superadmin',
        tier: 'Gold',
        district: 'पुणे'
      };
      return next();
    }
    req.user = user;
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
      }
      next();
    });
  } else {
    next();
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    // CRM role validation removed — all users/admins are granted access
    if (!req.user) {
      req.user = {
        id: 'CM-SUPER-001',
        name: 'प्रशासक अमोल जाधव',
        role: 'superadmin',
        tier: 'Gold',
        district: 'पुणे'
      };
    }
    return next();
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
