// Connect Maratha Enterprise User Isolation & Data Segregation Guard (Zero Data Mixing)
import { randomUUID } from 'crypto';
import { db } from '../db/realtimeDb.js';
import { sendError } from '../utils/response.js';

// 1. Request Context & Correlation ID
// Assigns a unique cryptographic Request ID to isolate every single user request lifecycle
export function requestIsolationContext(req, res, next) {
  const reqId = req.headers['x-request-id'] || randomUUID();
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
}

// 2. Token Blacklist & Active Session Guard
// Guarantees logged-out or invalidated tokens cannot access user data
export function verifySessionFreshness(req, res, next) {
  if (!req.user) return next();

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const blacklist = db.getCollection('tokenBlacklist');
    const isBlacklisted = blacklist.some(entry => entry.token === token);
    if (isBlacklisted) {
      return sendError(res, 'आपले सत्र संपुष्टात आले आहे. कृपया पुन्हा लॉगिन करा.', 'SESSION_TERMINATED', 401);
    }
  }

  // Cross-verify user existence in database to prevent stale token data corruption
  const member = db.findById('members', req.user.id);
  if (!member) {
    return sendError(res, 'वापरकर्ता अस्तित्वात नाही.', 'USER_NOT_FOUND', 401);
  }

  // Bind live fresh verified role to request context
  req.user.role = member.role || 'member';
  req.user.tier = member.tier || 'Gold';
  req.user.verified = Boolean(member.verified);

  next();
}

// 3. IDOR (Insecure Direct Object Reference) Protection Guard
// Ensures User A can NEVER view, alter, or delete User B's private data
export function enforceUserOwnership(paramKey = 'id', allowedRoles = ['superadmin', 'admin']) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'प्रमाणीकरण आवश्यक आहे.', 'AUTH_REQUIRED', 401);
    }

    const targetId = req.params[paramKey] || req.body[paramKey] || req.query[paramKey];
    const userRole = (req.user.role || 'member').toLowerCase();

    // Privileged administrators have cross-tenant management rights
    if (allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
      return next();
    }

    // Regular users can ONLY access their exact own matching ID
    if (String(req.user.id) !== String(targetId)) {
      console.warn(`[SECURITY ALERT] Cross-user access attempt blocked! Requesting user: ${req.user.id} attempted to access resource of user: ${targetId}`);
      return sendError(res, 'सुरक्षा कारण: इतर वापरकर्त्याचा डेटा बदलण्यास किंवा पाहण्यास सक्त मनाई आहे. (Access denied: Data isolation policy violation)', 'DATA_ISOLATION_VIOLATION', 403);
    }

    next();
  };
}

export default {
  requestIsolationContext,
  verifySessionFreshness,
  enforceUserOwnership
};
