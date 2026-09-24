import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

// Security & Isolation Suite
import { securityHeaders, corsOptions, responseDataMasker } from './middleware/security.js';
import { sanitizationMiddleware } from './middleware/sanitizer.js';
import { authRateLimiter, globalRateLimiter } from './middleware/rateLimiter.js';
import { requestIsolationContext } from './middleware/dataIsolation.js';

// Route Handlers
import authRoutes from './routes/auth.routes.js';
import membersRoutes from './routes/members.routes.js';
import businessesRoutes from './routes/businesses.routes.js';
import sangamRoutes from './routes/sangam.routes.js';
import directoriesRoutes from './routes/directories.routes.js';
import emergencyRoutes from './routes/emergency.routes.js';
import communityRoutes from './routes/community.routes.js';
import eventsRoutes from './routes/events.routes.js';
import donationsRoutes from './routes/donations.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import servicesRoutes from './routes/services.routes.js';
import cultureRoutes from './routes/culture.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import adminRoutes from './routes/admin.routes.js';
import errorHandler from './middleware/errorHandler.js';
import { sendSuccess } from './utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (for Load Balancers, Nginx, Cloudflare)
app.set('trust proxy', 1);

// 1. High-Performance Gzip/Brotli Compression (Cuts bandwidth by ~80% for 1M users)
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// 2. HTTP Security Headers (OWASP Top 10, HSTS, CSP, Frameguard, NoSniff, Anti-Clickjacking)
app.use(securityHeaders);

// 3. Strict CORS Policy
app.use(cors(corsOptions));

// 4. Request Payload Size Limiters (Anti-Heap Exhaustion DDoS)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 5. Unique Request Correlation & User Isolation Context (Zero Data Mixing)
app.use(requestIsolationContext);

// 6. Deep Input Sanitization (Anti-XSS, Anti-SQLi, Anti-Prototype Pollution)
app.use(sanitizationMiddleware);

// 7. Automatic Sensitive Data Masking (Strips password_hash, tokens, and secrets from JSON outputs)
app.use(responseDataMasker);

// 8. Global API Rate Limiter
app.use('/api', globalRateLimiter);

// 9. Strict Brute-Force Rate Limiter for Authentication
app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);
app.use('/api/auth/forgot-password', authRateLimiter);
app.use('/api/auth/verify-otp', authRateLimiter);
app.use('/api/auth/reset-password', authRateLimiter);

// Global Health & Scalability Metrics Endpoint
app.get('/api/health', (req, res) => {
  const mem = process.memoryUsage();
  return sendSuccess(res, 'Connect Maratha Protected API Server is Healthy and Operational', {
    status: 'SECURE_AND_OPERATIONAL',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    security: {
      headers: 'ENFORCED (OWASP CSP + HSTS)',
      rateLimiter: 'ACTIVE (Sliding Window)',
      sanitization: 'ACTIVE (Anti-XSS + Anti-SQLi)',
      dataIsolation: 'STRICT_ZERO_DATA_MIXING',
      masking: 'AUTOMATIC_PII_REMOVAL'
    },
    systemMetrics: {
      uptimeSeconds: Math.floor(process.uptime()),
      heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (mem.heapTotal / 1024 / 1024).toFixed(2),
      rssMB: (mem.rss / 1024 / 1024).toFixed(2)
    }
  });
});

// ==========================================
// CONNECT MARATHA REST API ROUTERS (11 MODULES)
// ==========================================

// 1. Authentication & Member Identity
app.use('/api/auth', authRoutes);

// 2. Member Profile & Digital ID Card
app.use('/api/members', membersRoutes);

// 3. Business Sangam & Commerce Ecosystem
app.use('/api/businesses', businessesRoutes);
app.use('/api/sangam', sangamRoutes);

// 4. Specialized Community Directories & Commercial Verticals
app.use('/api', directoriesRoutes);

// 5. Community Safety, Seva & Emergency
app.use('/api', emergencyRoutes);

// 6. Community Social Feed & Forums
app.use('/api/community', communityRoutes);

// 7. Events, Gatherings & Shivjayanti Utsav
app.use('/api/events', eventsRoutes);

// 8. Donations & Crowdfunding Campaigns
app.use('/api/donations', donationsRoutes);

// 9. Jobs Portal & Service Bookings
app.use('/api/jobs', jobsRoutes);
app.use('/api/services', servicesRoutes);

// 10. History, Culture & Knowledge Graph
app.use('/api/culture', cultureRoutes);
app.use('/api/quiz', quizRoutes);

// 11. Role-Based CRM & Admin ERP
app.use('/api/admin', adminRoutes);

// Centralized Secure Error Handler (No stack trace leaks)
app.use(errorHandler);

// Start Express Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🛡️ Connect Maratha Protected Enterprise Server running on port ${PORT}`);
    console.log(`🔒 Active Defenses: Helmet CSP | Rate Limiter | Data Isolation Guard | Anti-XSS/SQLi`);
  });
}

export default app;
