// Connect Maratha Security Shield - Headers, CORS, and Data Masking

import helmet from 'helmet';

// 1. Helmet configuration for strict HTTP headers & CSP
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'http://localhost:5000', 'http://localhost:3000', 'ws://localhost:3000', 'ws://localhost:5000', 'https:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'sameorigin' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
});

// 2. Strict CORS Configuration
export const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, curl, mobile apps (no origin) or localhost / domain origins
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000'
    ];
    if (allowed.includes(origin) || origin.endsWith('.connectmaratha.org') || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('सुरक्षा धोरणानुसार बाह्य विनंती नाकारली (CORS Origin blocked by security policy)'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Forwarded-For']
};

// 3. Response Data Masking Interceptor
// Automatically removes password_hash, token secrets, and internal fields from all JSON outputs
const SENSITIVE_FIELDS = new Set(['password_hash', 'password', 'tokenSecret', 'salt', 'otpCode', 'resetToken']);

function maskSensitiveData(data) {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.has(key)) {
      continue; // Strip completely
    }
    sanitized[key] = maskSensitiveData(value);
  }
  return sanitized;
}

export function responseDataMasker(req, res, next) {
  const originalJson = res.json;
  res.json = function (body) {
    if (body && typeof body === 'object') {
      body = maskSensitiveData(body);
    }
    return originalJson.call(this, body);
  };
  next();
}

// 4. Cache Control for Sensitive User Data
export function noCacheHeaders(req, res, next) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
}

export default {
  securityHeaders,
  corsOptions,
  responseDataMasker,
  noCacheHeaders
};
