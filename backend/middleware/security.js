import rateLimit from 'express-rate-limit';

// Test-only escape hatch (never honoured in production) so integration tests
// can exercise many requests from one IP. The login limiter is never skipped.
const skipInTests = () =>
  process.env.DISABLE_RATE_LIMITS === 'true' && process.env.NODE_ENV !== 'production';

const tooMany = (code, error) => (req, res) =>
  res.status(429).json({ success: false, code, error });

/** Generic per-IP limiter for the whole API. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  skip: skipInTests,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooMany('RATE_LIMITED', 'खूप विनंत्या. कृपया थोड्या वेळाने प्रयत्न करा.')
});

/** Brute-force protection: keyed by IP + the login identifier being tried. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${req.ip}|${String(req.body?.identifier || '').toLowerCase().slice(0, 100)}`,
  validate: { keyGeneratorIpFallback: false },
  handler: tooMany('TOO_MANY_LOGIN_ATTEMPTS', 'खूप चुकीचे प्रयत्न. १५ मिनिटांनी पुन्हा प्रयत्न करा.')
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  skip: skipInTests,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooMany('RATE_LIMITED', 'खूप नोंदणी प्रयत्न. कृपया नंतर प्रयत्न करा.')
});

/** Limits content creation (posts, comments, reports...) per IP. */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  skip: skipInTests,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooMany('RATE_LIMITED', 'खूप विनंत्या. कृपया थोड्या वेळाने प्रयत्न करा.')
});
