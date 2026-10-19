import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

export { JWT_SECRET };

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'प्रमाणीकरण आवश्यक आहे (Token missing)' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'अवैध टोकन (Invalid or expired token)' });
    }
    req.user = user;
    next();
  });
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role || 'member', tier: user.tier || 'Gold' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function optionalToken(req, res, next) {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) {
      req.user = user;
    }
    next();
  });
}

export default { JWT_SECRET, authenticateToken, optionalToken, generateToken };

export const optionalAuth = optionalToken;
