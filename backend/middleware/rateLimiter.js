// Connect Maratha Enterprise High-Throughput Rate Limiter & Anti-DDoS Shield

class SlidingWindowLimiter {
  constructor(windowMs, maxRequests, options = {}) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = options.message || 'अतिप्रमाणात विनंत्या आल्या आहेत. कृपया थोड्या वेळाने प्रयत्न करा. (Too many requests, please slow down.)';
    this.code = options.code || 'RATE_LIMIT_EXCEEDED';
    this.records = new Map(); // ip -> { count, resetTime, lockedUntil }
    this.blacklistedIps = new Set();

    // Auto-clean stale records every 60 seconds to prevent memory leaks with millions of visitors
    setInterval(() => this.cleanup(), 60000).unref();
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, entry] of this.records.entries()) {
      if (now > entry.resetTime && (!entry.lockedUntil || now > entry.lockedUntil)) {
        this.records.delete(ip);
      }
    }
  }

  getClientIp(req) {
    return (
      req.headers['cf-connecting-ip'] ||
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    );
  }

  blacklistIp(ip, durationMs = 3600000) {
    this.blacklistedIps.add(ip);
    setTimeout(() => this.blacklistedIps.delete(ip), durationMs).unref();
  }

  middleware() {
    return (req, res, next) => {
      const ip = this.getClientIp(req);
      const now = Date.now();

      // Check if IP is permanently or temporarily blacklisted
      if (this.blacklistedIps.has(ip)) {
        return res.status(403).json({
          success: false,
          error: 'सुरक्षा कारणास्तव आपला IP पत्ता तात्पुरता प्रतिबंधित करण्यात आला आहे. (Access forbidden: IP blacklisted for security violations)',
          code: 'IP_BLACKLISTED'
        });
      }

      let record = this.records.get(ip);
      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + this.windowMs,
          lockedUntil: 0
        };
        this.records.set(ip, record);
      } else {
        record.count++;
      }

      // Check if IP is locked out
      if (record.lockedUntil && now < record.lockedUntil) {
        const retryAfterSec = Math.ceil((record.lockedUntil - now) / 1000);
        res.setHeader('Retry-After', retryAfterSec);
        return res.status(429).json({
          success: false,
          error: `अतिप्रमाणात प्रयत्न झाल्याने आपले खाते ${retryAfterSec} सेकंदांसाठी लॉक केले आहे.`,
          code: this.code,
          retryAfter: retryAfterSec
        });
      }

      if (record.count > this.maxRequests) {
        // Lock out on repeated violations
        const lockoutTime = 15 * 60 * 1000; // 15 minutes lockout
        record.lockedUntil = now + lockoutTime;
        const retryAfterSec = Math.ceil(lockoutTime / 1000);
        res.setHeader('Retry-After', retryAfterSec);
        console.warn(`[SECURITY WARNING] Rate limit exceeded by IP: ${ip} on ${req.originalUrl}`);

        return res.status(429).json({
          success: false,
          error: this.message,
          code: this.code,
          retryAfter: retryAfterSec
        });
      }

      // Append standard rate limiting headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - record.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

      next();
    };
  }
}

// 1. Strict Auth Rate Limiter (Brute force protection for login, register, OTP)
// 15 attempts per 10 minutes
export const authRateLimiter = new SlidingWindowLimiter(10 * 60 * 1000, 15, {
  message: 'लॉगिनचे वारंवार अयशस्वी प्रयत्न झाल्याने सुरक्षिततेसाठी तात्पुरते निर्बंध लादण्यात आले आहेत. १५ मिनिटांनी पुन्हा प्रयत्न करा.',
  code: 'AUTH_RATE_LIMIT_EXCEEDED'
}).middleware();

// 2. Global API Rate Limiter (High-throughput for general endpoints)
// 600 requests per minute per IP
export const globalRateLimiter = new SlidingWindowLimiter(60 * 1000, 600, {
  message: 'सर्व्हरवरील भार नियंत्रित करण्यासाठी विनंत्यांची मर्यादा गाठली आहे.',
  code: 'API_RATE_LIMIT_EXCEEDED'
}).middleware();

// 3. Strict Mutation / Creation Limiter (Prevents spamming POST/PUT)
// 60 write requests per minute per IP
export const mutationRateLimiter = new SlidingWindowLimiter(60 * 1000, 60, {
  message: 'नवीन माहिती नोंदवण्याची गती खूप जास्त आहे. कृपया क्षणभर थांबा.',
  code: 'WRITE_LIMIT_EXCEEDED'
}).middleware();

export default {
  authRateLimiter,
  globalRateLimiter,
  mutationRateLimiter,
  SlidingWindowLimiter
};
