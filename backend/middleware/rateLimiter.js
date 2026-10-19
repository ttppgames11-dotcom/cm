import { optionalToken } from './auth.js';

/**
 * Connect Maratha - Tiered Rate Limiting Middleware
 * 
 * Provides 3 distinct tiers:
 * 1. Strict Auth Routes (Login, Register, Forgot Password, Reset Password, OTP):
 *    - Combination of per-IP and per-account limits.
 *    - Exponential backoff rather than a hard lockout.
 *    - Automatic reset on successful authentication.
 * 2. Moderate Public Endpoints (Directory, culture, forts, locations, blood requests, etc.):
 *    - Per-IP sliding window.
 * 3. Looser Authenticated Actions (Feed, referrals, CRM, chat, profile updates):
 *    - Per-user (JWT sub/id) sliding window.
 * 
 * All thresholds are fully configurable via environment variables with sensible defaults.
 */

// Helper to parse integer with fallback
function getEnvInt(name, fallback) {
  const val = process.env[name];
  if (!val) return fallback;
  const parsed = parseInt(val, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// Helper to parse float with fallback
function getEnvFloat(name, fallback) {
  const val = process.env[name];
  if (!val) return fallback;
  const parsed = parseFloat(val);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// Configuration getters (read at request time to support dynamic env changes/tests)
export const config = {
  get publicWindowMs() {
    return getEnvInt('RATE_LIMIT_PUBLIC_WINDOW_MS', 15 * 60 * 1000); // 15 mins
  },
  get publicMax() {
    return getEnvInt('RATE_LIMIT_PUBLIC_MAX', 100); // 100 requests / 15m
  },
  get userWindowMs() {
    return getEnvInt('RATE_LIMIT_USER_WINDOW_MS', 15 * 60 * 1000); // 15 mins
  },
  get userMax() {
    return getEnvInt('RATE_LIMIT_USER_MAX', 600); // 600 requests / 15m
  },
  get authIpWindowMs() {
    return getEnvInt('RATE_LIMIT_AUTH_IP_WINDOW_MS', 15 * 60 * 1000); // 15 mins
  },
  get authIpMax() {
    return getEnvInt('RATE_LIMIT_AUTH_IP_MAX', 20); // 20 attempts per IP / 15m
  },
  get authAccountWindowMs() {
    return getEnvInt('RATE_LIMIT_AUTH_ACCOUNT_WINDOW_MS', 15 * 60 * 1000); // 15 mins
  },
  get authAccountMax() {
    return getEnvInt('RATE_LIMIT_AUTH_ACCOUNT_MAX', 5); // 5 attempts before backoff
  },
  get authBackoffBaseSec() {
    return getEnvInt('RATE_LIMIT_AUTH_BACKOFF_BASE_SEC', 2); // 2 seconds base
  },
  get authBackoffMaxSec() {
    return getEnvInt('RATE_LIMIT_AUTH_BACKOFF_MAX_SEC', 900); // 15 minutes max backoff
  },
  get authBackoffFactor() {
    return getEnvFloat('RATE_LIMIT_AUTH_BACKOFF_FACTOR', 2.0); // 2x multiplier
  }
};

// In-memory sliding stores
const generalStore = new Map(); // key -> [timestamp1, timestamp2, ...]
const authIpStore = new Map();  // ip -> [timestamp1, timestamp2, ...]
const authAccountStore = new Map(); // accountKey -> { attempts: [], consecutiveFailures: 0, backoffUntil: 0, lastFailure: 0 }

/**
 * Extracts normalized client IP address from request.
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded && typeof forwarded === 'string') {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return sanitizeIp(firstIp);
  }
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return sanitizeIp(realIp.trim());
  }
  return sanitizeIp(req.socket?.remoteAddress || req.ip || '127.0.0.1');
}

function sanitizeIp(ip) {
  if (ip.startsWith('::ffff:')) {
    return ip.slice(7);
  }
  return ip;
}

/**
 * Normalizes account identifier (email, phone, or member ID).
 */
export function getAccountIdentifier(req) {
  const body = req.body || {};
  const raw = body.identifier || body.email || body.phone || body.memberId || body.userId;
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase();
}

/**
 * Periodic memory cleanup to prevent unbounded growth
 */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let cleanupTimer = setInterval(() => {
  const now = Date.now();

  // Clean general store
  const maxGeneralWindow = Math.max(config.publicWindowMs, config.userWindowMs);
  for (const [key, timestamps] of generalStore.entries()) {
    const valid = timestamps.filter(t => now - t < maxGeneralWindow);
    if (valid.length === 0) {
      generalStore.delete(key);
    } else {
      generalStore.set(key, valid);
    }
  }

  // Clean auth IP store
  for (const [ip, timestamps] of authIpStore.entries()) {
    const valid = timestamps.filter(t => now - t < config.authIpWindowMs);
    if (valid.length === 0) {
      authIpStore.delete(ip);
    } else {
      authIpStore.set(ip, valid);
    }
  }

  // Clean auth account store
  for (const [acct, record] of authAccountStore.entries()) {
    const isBackoffExpired = now >= (record.backoffUntil || 0);
    const validAttempts = (record.attempts || []).filter(t => now - t < config.authAccountWindowMs);
    if (isBackoffExpired && validAttempts.length === 0 && record.consecutiveFailures === 0) {
      authAccountStore.delete(acct);
    } else {
      record.attempts = validAttempts;
    }
  }
}, CLEANUP_INTERVAL_MS);

// Allow Node process to exit cleanly during tests
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

/**
 * Reset all stores (useful for unit tests)
 */
export function resetRateLimiterState() {
  generalStore.clear();
  authIpStore.clear();
  authAccountStore.clear();
}

/**
 * Reset an account's failed attempts and backoff upon successful authentication.
 */
export function recordAuthSuccess(identifier, ip) {
  if (identifier) {
    const acctKey = identifier.toLowerCase();
    authAccountStore.delete(acctKey);
  }
  if (ip) {
    authIpStore.delete(ip);
  }
}

/**
 * Record an authentication failure and recalculate exponential backoff.
 */
export function recordAuthFailure(identifier, ip) {
  const now = Date.now();

  if (identifier) {
    const acctKey = identifier.toLowerCase();
    let record = authAccountStore.get(acctKey);
    if (!record) {
      record = {
        attempts: [],
        consecutiveFailures: 0,
        backoffUntil: 0,
        lastFailure: 0
      };
      authAccountStore.set(acctKey, record);
    }

    record.consecutiveFailures = (record.consecutiveFailures || 0) + 1;
    record.lastFailure = now;

    // Apply exponential backoff once failures exceed allowed threshold
    if (record.consecutiveFailures >= config.authAccountMax) {
      const exponent = record.consecutiveFailures - config.authAccountMax;
      const delaySec = Math.min(
        config.authBackoffMaxSec,
        Math.round(config.authBackoffBaseSec * Math.pow(config.authBackoffFactor, exponent))
      );
      record.backoffUntil = now + (delaySec * 1000);
    }
  }
}

/**
 * Middleware: Strict Rate Limiter for Authentication Routes
 * Implements combined per-IP and per-account limiting with exponential backoff.
 */
export function authRateLimiter(req, res, next) {
  const now = Date.now();
  const ip = getClientIp(req);
  const identifier = getAccountIdentifier(req);

  // 1. Check Account-level Exponential Backoff
  if (identifier) {
    const acctKey = identifier.toLowerCase();
    const acctRecord = authAccountStore.get(acctKey);

    if (acctRecord && acctRecord.backoffUntil > now) {
      const remainingSeconds = Math.ceil((acctRecord.backoffUntil - now) / 1000);
      res.setHeader('Retry-After', remainingSeconds);
      res.setHeader('X-RateLimit-Backoff', 'true');
      res.setHeader('X-RateLimit-Failures', acctRecord.consecutiveFailures);

      return res.status(429).json({
        success: false,
        code: 'RATE_LIMIT_EXCEEDED',
        error: `वारंवार चुकीचे प्रयत्न झाल्याने कृपया ${remainingSeconds} सेकंदांनंतर पुन्हा प्रयत्न करा. (Too many failed attempts. Exponential backoff active. Try again in ${remainingSeconds}s.)`,
        retryAfter: remainingSeconds,
        backoff: true,
        failures: acctRecord.consecutiveFailures
      });
    }

    // Track attempt timestamps for this account
    if (!acctRecord) {
      authAccountStore.set(acctKey, {
        attempts: [now],
        consecutiveFailures: 0,
        backoffUntil: 0,
        lastFailure: 0
      });
    } else {
      acctRecord.attempts = (acctRecord.attempts || []).filter(t => now - t < config.authAccountWindowMs);
      acctRecord.attempts.push(now);
    }
  }

  // 2. Check IP-level limits for Auth Routes
  let ipTimestamps = authIpStore.get(ip) || [];
  ipTimestamps = ipTimestamps.filter(t => now - t < config.authIpWindowMs);

  if (ipTimestamps.length >= config.authIpMax) {
    const oldestTimestamp = ipTimestamps[0];
    const resetTimeMs = oldestTimestamp + config.authIpWindowMs;
    const remainingSeconds = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));

    res.setHeader('Retry-After', remainingSeconds);
    res.setHeader('X-RateLimit-Limit', config.authIpMax);
    res.setHeader('X-RateLimit-Remaining', 0);
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetTimeMs / 1000));

    return res.status(429).json({
      success: false,
      code: 'AUTH_IP_RATE_LIMIT_EXCEEDED',
      error: `या आयपी पत्त्यावरून प्रमाणीकरणाचे अनेक प्रयत्न झाले आहेत. कृपया ${remainingSeconds} सेकंदांनंतर प्रयत्न करा. (Too many authentication requests from this IP. Please try again in ${remainingSeconds}s.)`,
      retryAfter: remainingSeconds
    });
  }

  // Record this attempt under IP
  ipTimestamps.push(now);
  authIpStore.set(ip, ipTimestamps);

  // Hook response to automatically detect auth success vs failure
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // 2xx indicates success (login, register, reset successful)
    if (res.statusCode >= 200 && res.statusCode < 300 && body && body.success !== false) {
      recordAuthSuccess(identifier, ip);
    } 
    // 400, 401, 404, or explicit failure indicates invalid credentials / bad OTP
    else if (res.statusCode === 401 || res.statusCode === 400 || res.statusCode === 404 || (body && body.success === false)) {
      recordAuthFailure(identifier, ip);
    }
    return originalJson(body);
  };

  next();
}

/**
 * Middleware: Tiered Rate Limiter for General API Endpoints
 * - Unauthenticated requests -> Tier 2 (Moderate Public Limits, per-IP)
 * - Authenticated requests (JWT) -> Tier 3 (Looser Limits, per-user ID)
 */
export function generalRateLimiter(req, res, next) {
  // Bypass health checks, CORS preflight, and dedicated auth routes (governed by authRateLimiter)
  if (
    req.method === 'OPTIONS' ||
    req.path === '/api/health' ||
    req.path === '/health' ||
    req.path.startsWith('/api/auth/login') ||
    req.path.startsWith('/api/auth/register') ||
    req.path.startsWith('/api/auth/google') ||
    req.path.startsWith('/api/auth/forgot-password') ||
    req.path.startsWith('/api/auth/verify-reset-otp') ||
    req.path.startsWith('/api/auth/reset-password')
  ) {
    return next();
  }

  const now = Date.now();
  const isAuthenticated = Boolean(req.user && req.user.id);

  const windowMs = isAuthenticated ? config.userWindowMs : config.publicWindowMs;
  const maxRequests = isAuthenticated ? config.userMax : config.publicMax;
  const key = isAuthenticated ? `user:${req.user.id}` : `ip:${getClientIp(req)}`;

  let timestamps = generalStore.get(key) || [];
  timestamps = timestamps.filter(t => now - t < windowMs);

  const remaining = Math.max(0, maxRequests - timestamps.length);
  const resetTimeMs = timestamps.length > 0 ? timestamps[0] + windowMs : now + windowMs;
  const resetSeconds = Math.ceil(resetTimeMs / 1000);

  // Set standard rate limit headers
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', remaining > 0 ? remaining - 1 : 0);
  res.setHeader('X-RateLimit-Reset', resetSeconds);
  res.setHeader('RateLimit-Limit', maxRequests);
  res.setHeader('RateLimit-Remaining', remaining > 0 ? remaining - 1 : 0);
  res.setHeader('RateLimit-Reset', resetSeconds);

  if (timestamps.length >= maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((resetTimeMs - now) / 1000));
    res.setHeader('Retry-After', retryAfter);

    return res.status(429).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      error: 'विनंत्यांची मर्यादा संपली आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा. (Rate limit exceeded. Please try again later.)',
      retryAfter,
      tier: isAuthenticated ? 'authenticated' : 'public'
    });
  }

  timestamps.push(now);
  generalStore.set(key, timestamps);
  next();
}

/**
 * Export unified middleware chain
 */
export default {
  config,
  authRateLimiter,
  generalRateLimiter,
  getClientIp,
  getAccountIdentifier,
  recordAuthSuccess,
  recordAuthFailure,
  resetRateLimiterState
};
