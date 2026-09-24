// Connect Maratha Enterprise Security Suite - Input Sanitization & Anti-Injection Middleware

// Prevent prototype pollution attacks
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// Strip harmful HTML/XSS vectors while preserving legitimate Marathi and English unicode text
export function sanitizeString(val) {
  if (typeof val !== 'string') return val;
  return val
    .replace(/\0/g, '') // Remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Strip script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Strip iframe tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Strip embed tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Strip object tags
    .replace(/javascript\s*:/gi, '') // Strip javascript: pseudo-protocols
    .replace(/data\s*:\s*text\/html/gi, '') // Strip malicious data URIs
    .replace(/on\w+\s*=/gi, '') // Strip inline event handlers like onerror=, onload=, onclick=
    .trim();
}

// Check for SQL injection patterns
const SQLI_PATTERNS = [
  /(\b(UNION(\s+ALL)?)\b.*?\bSELECT\b)/i,
  /(\bSELECT\b.*?\bFROM\b.*?\bWHERE\b.*?\bOR\b.*?(1=1|'1'='1'|"1"="1"))/i,
  /(\bDROP\s+TABLE\b|\bALTER\s+TABLE\b|\bTRUNCATE\s+TABLE\b)/i,
  /(\bEXEC(\s+XP_|\s+SP_)\b)/i,
  /(--|#|\/\*).*?$/m
];

export function hasSqlInjection(str) {
  if (typeof str !== 'string') return false;
  return SQLI_PATTERNS.some(p => p.test(str));
}

// Deep sanitize any object, array, or primitive recursively
export function deepSanitize(obj, depth = 0) {
  if (depth > 15) return obj; // Prevent circular reference stack overflows
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item, depth + 1));
  }

  if (typeof obj === 'object') {
    const clean = {};
    for (const key of Object.keys(obj)) {
      if (FORBIDDEN_KEYS.has(key)) {
        console.warn(`[SECURITY ALERT] Prototype pollution attempt blocked on key "${key}"`);
        continue; // Drop prototype pollution keys entirely
      }
      clean[key] = deepSanitize(obj[key], depth + 1);
    }
    return clean;
  }

  return obj;
}

// Express Middleware for Input Sanitization
export function sanitizationMiddleware(req, res, next) {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = deepSanitize(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = deepSanitize(req.query);
    }
    if (req.params && typeof req.params === 'object') {
      req.params = deepSanitize(req.params);
    }
    next();
  } catch (err) {
    console.error('[SECURITY] Sanitization error:', err.message);
    res.status(400).json({
      success: false,
      error: 'अवैध इनपुट डेटा आढळला (Malformed input payload detected)',
      code: 'MALFORMED_INPUT'
    });
  }
}

export default sanitizationMiddleware;
