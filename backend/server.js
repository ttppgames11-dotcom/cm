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
import crmOperationsRoutes from './routes/crmOperations.routes.js';
import crmHierarchyRoutes from './routes/crmHierarchy.routes.js';
import locationsRoutes from './routes/locations.routes.js';
import mediaRoutes from './routes/media.routes.js';
import sevaEmergencyRoutes from './routes/sevaEmergency.routes.js';
import legalRoutes from './routes/legal.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import matrimonyRoutes from './routes/matrimony.routes.js';
import womenRoutes from './routes/women.routes.js';
import aiRoutes from './routes/ai.routes.js';
import portalsEcosystemRoutes from './routes/portalsEcosystem.routes.js';
import errorHandler from './middleware/errorHandler.js';
import { sendSuccess } from './utils/response.js';
import { db } from './db/realtimeDb.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './middleware/auth.js';

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
app.use('/api/matrimony', matrimonyRoutes);
app.use('/api/women', womenRoutes);

// 5. Community Safety, Seva & Emergency
app.use('/api', emergencyRoutes);
app.use('/api/v1', sevaEmergencyRoutes);
app.use('/api/seva', sevaEmergencyRoutes);

// 6. Community Social Feed & Direct Messages
app.use('/api/community', communityRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/members/messages', messagesRoutes);

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
app.use('/api/portals', portalsEcosystemRoutes);
app.use('/api/v1/portals', portalsEcosystemRoutes);

// 11. Role-Based CRM & Admin ERP
app.use('/api/admin', adminRoutes);
app.use('/api/crm-hierarchy', crmHierarchyRoutes);
app.use('/api/crm', crmOperationsRoutes);
app.use('/api/admin/crm', crmOperationsRoutes);


// 13. Abhay App Media & Dynamic Hierarchical Location APIs (44,810+ Maharashtra LGD Locations)
app.use('/media', mediaRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/locations', locationsRoutes);

// 14. Google Play Child Safety Standards & Legal Compliance
app.use('/api/legal', legalRoutes);
app.use('/api/safety', legalRoutes);

// 15. Connect Maratha AI Agent (Chhatrapati AI Assistant & Knowledge RAG)
app.use('/api/ai', aiRoutes);

// High-Speed Static Assets Serving with 1-Year Immutable Caching & ETag
const distPath = path.join(__dirname, '../dist');
const publicPath = path.join(__dirname, '../frontend/public');
const assetsPath = path.join(__dirname, '../assets');

const staticCacheOptions = {
  maxAge: '365d',
  immutable: true,
  etag: true,
  lastModified: true
};

app.use('/assets', express.static(path.join(publicPath, 'assets'), staticCacheOptions));
app.use('/assets', express.static(assetsPath, staticCacheOptions));
app.use(express.static(distPath, {
  maxAge: '1d',
  setHeaders: (res, pathUrl) => {
    if (pathUrl.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (/\.(js|css|webp|jpg|jpeg|png|svg|woff2|avif)$/.test(pathUrl)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// ==========================================
// 📡 REALTIME LIVE DATA STREAM (SSE for Web & Mobile APK)
// ==========================================
app.get('/api/realtime/stream', (req, res) => {
  // EventSource cannot send headers, so the token may come in the query string. Only a valid, current login may listen.
  const bearer = (req.headers['authorization'] || '').split(' ')[1];
  const raw = bearer || (typeof req.query.token === 'string' ? req.query.token : '');
  let viewer = null;
  try { viewer = raw ? jwt.verify(raw, JWT_SECRET) : null; } catch (_) { viewer = null; }
  const account = viewer?.id ? db.findById('members', viewer.id) : null;
  if (!account || account.status === 'disabled' || (account.tokenVersion || 0) !== (viewer.tv || 0)) {
    return res.status(401).json({ success: false, error: 'प्रमाणीकरण आवश्यक आहे.', code: 'AUTH_REQUIRED' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  if (res.flushHeaders) res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Connect Maratha Realtime Live Stream Active', timestamp: new Date().toISOString() })}

`);

  // Only say what changed, never the record itself.
  const onDbChange = (event) => {
    res.write(`data: ${JSON.stringify({ type: 'DB_CHANGE', collection: event.collection, action: event.action, id: event.item?.id ?? event.id ?? null, timestamp: event.timestamp })}

`);
  };

  db.on('change', onDbChange);

  const heartbeat = setInterval(() => {
    res.write(`: heartbeat\n\n`);
  }, 15000);

  req.on('close', () => {
    db.off('change', onDbChange);
    clearInterval(heartbeat);
  });
});

// Realtime Health & Sync Diagnostics
app.get('/api/realtime/health', (req, res) => {
  return sendSuccess(res, 'Realtime Database Engine Active', {
    status: 'ONLINE',
    totalMembers: db.getCollection('members').length,
    timestamp: new Date().toISOString()
  });
});

// Centralized Secure Error Handler (No stack trace leaks)
app.use(errorHandler);

const HOST = process.env.HOST || '0.0.0.0';

// Start Express Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    console.log(`🛡️ Connect Maratha Protected Enterprise Server running on http://${HOST}:${PORT}`);
    console.log(`📡 Realtime SSE Live Stream at http://${HOST}:${PORT}/api/realtime/stream`);
    console.log(`🔒 Active Defenses: Helmet CSP | Rate Limiter | Data Isolation Guard | Anti-XSS/SQLi`);
  });
}

export default app;
