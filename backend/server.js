import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

import express from 'express';
import cors from 'cors';
import quizRoutes from './routes/quiz.routes.js';
import authRoutes from './routes/auth.routes.js';
import membersRoutes from './routes/members.routes.js';
import businessesRoutes from './routes/businesses.routes.js';
import sangamRoutes from './routes/sangam.routes.js';
import eventsRoutes from './routes/events.routes.js';
import donationsRoutes from './routes/donations.routes.js';
import jobsRoutes from './routes/jobs.routes.js';
import communityRoutes from './routes/community.routes.js';
import adminRoutes from './routes/admin.routes.js';
import cultureRoutes from './routes/culture.routes.js';
import locationsRoutes from './routes/locations.routes.js';
import mediaRoutes from './routes/media.routes.js';
import directoriesRoutes from './routes/directories.routes.js';
import aiRoutes from './routes/ai.routes.js';
import servicesRoutes, { adminServicesRouter } from './routes/services.routes.js';
import crmRoutes from './routes/crm.routes.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';
import { optionalToken } from './middleware/auth.js';
import { validateBody } from './middleware/validator.js';
import { doctorSchema, bloodRequestSchema } from './schemas/general.schemas.js';
import { errorHandler } from './middleware/errorHandler.js';
// Old-style lists (doctors, blood, matrimony, ...) live in the database, not in db.json.
import { listRecords, insertRecord, freeShortId } from './utils/directoryStore.js';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Optional JWT inspection to classify requests for Tier 2 (Public) vs Tier 3 (Authenticated User) rate limits
app.use(optionalToken);
app.use(generalRateLimiter);

// ==========================================
// MOUNT ALL CONNECT MARATHA REST API ROUTERS
// ==========================================
app.use('/media', mediaRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/locations', locationsRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/businesses', businessesRoutes);
app.use('/api/sangam', sangamRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/community', communityRoutes);
// Website features (AI assistant, services, helpdesk/CRM); admin paths before /api/admin.
app.use('/api/ai', aiRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/admin/services', adminServicesRouter);
app.use('/api/admin/crm', crmRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/culture', cultureRoutes);
app.use('/api/builders', directoriesRoutes);
app.use('/api/dairy', directoriesRoutes);

// Fallback route aliases for local dev & legacy paths
app.use('/sangam', sangamRoutes);
app.use('/businesses', businessesRoutes);
app.use('/members', membersRoutes);
app.use('/builders', directoriesRoutes);
app.use('/dairy', directoriesRoutes);

// System Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'Connect Maratha Express REST API Server', timestamp: new Date() });
});

// --- DOCTORS ---
app.get('/api/doctors', async (req, res, next) => {
  try {
    res.json(await listRecords('doctors'));
  } catch (err) {
    next(err);
  }
});

app.post('/api/doctors', validateBody(doctorSchema), async (req, res, next) => {
  try {
    const newDoctor = {
      id: await freeShortId('doctors', 'DOC-'),
      rating: '5.0 ★ (नवीन नोंदणी)',
      icon: '🩺',
      ...req.body
    };
    await insertRecord('doctors', newDoctor);
    res.status(201).json({ success: true, message: 'डॉक्टर प्रोफाइल यशस्वीरीत्या जोडले गेले!', doctor: newDoctor });
  } catch (err) {
    next(err);
  }
});

// --- BLOOD REQUESTS & DONORS ---
app.get('/api/blood/requests', async (req, res, next) => {
  try {
    res.json(await listRecords('bloodRequests'));
  } catch (err) {
    next(err);
  }
});

app.post('/api/blood/requests', validateBody(bloodRequestSchema), async (req, res, next) => {
  try {
    const newReq = {
      id: await freeShortId('bloodRequests', 'REQ-', 3),
      time: 'आत्ताच',
      ...req.body
    };
    await insertRecord('bloodRequests', newReq);
    res.status(201).json({ success: true, message: '🚨 तातडीची रक्त मागणी प्रसारित करण्यात आली!', request: newReq });
  } catch (err) {
    next(err);
  }
});

app.get('/api/blood/donors', async (req, res, next) => {
  try {
    res.json(await listRecords('bloodDonors'));
  } catch (err) {
    next(err);
  }
});

app.post('/api/blood/donors', async (req, res, next) => {
  try {
    const newDonor = {
      id: await freeShortId('bloodDonors', 'DON-'),
      totalDonations: 1,
      lastDonated: 'नवीन नोंदणी',
      ...req.body
    };
    await insertRecord('bloodDonors', newDonor);
    res.status(201).json({ success: true, message: '❤️ रक्तदाता नोंदणी यशस्वी झाली!', donor: newDonor });
  } catch (err) {
    next(err);
  }
});

// --- MATRIMONY ---
app.get('/api/matrimony', async (req, res, next) => {
  try {
    res.json(await listRecords('matrimony'));
  } catch (err) {
    next(err);
  }
});

app.post('/api/matrimony', async (req, res, next) => {
  try {
    const isGroom = (req.body.gender || '').includes('वर');
    const newProfile = {
      id: await freeShortId('matrimony', `CM-${isGroom ? 'M' : 'F'}-`, 3),
      verified: true,
      photo: isGroom ? '👨‍💼' : '👩‍💼',
      caste: '९६ कुळी मराठा',
      ...req.body
    };
    await insertRecord('matrimony', newProfile);
    res.status(201).json({ success: true, message: '💍 विवाह प्रोफाइल यशस्वीरीत्या नोंदवले गेले!', profile: newProfile });
  } catch (err) {
    next(err);
  }
});

// --- POLITICAL GRIEVANCES / REPRESENTATIONS ---
app.get('/api/political/grievances', async (req, res, next) => {
  try {
    res.json(await listRecords('grievances'));
  } catch (err) {
    next(err);
  }
});

app.post('/api/political/grievances', async (req, res, next) => {
  try {
    const item = {
      id: await freeShortId('grievances', 'GRV-'),
      createdAt: new Date().toLocaleDateString('mr-IN'),
      ...req.body
    };
    await insertRecord('grievances', item);
    res.status(201).json({ success: true, message: '📜 मागणी/निवेदन यशस्वीरीत्या सादर केले गेले!', grievance: item });
  } catch (err) {
    next(err);
  }
});

// --- SOCIAL WORKERS & VOLUNTEERS ---
app.get('/api/social/volunteers', async (req, res, next) => {
  try {
    res.json(await listRecords('volunteers'));
  } catch (err) {
    next(err);
  }
});

app.post('/api/social/volunteers', async (req, res, next) => {
  try {
    const item = {
      id: await freeShortId('volunteers', 'VOL-'),
      createdAt: new Date().toLocaleDateString('mr-IN'),
      ...req.body
    };
    await insertRecord('volunteers', item);
    res.status(201).json({ success: true, message: '🤝 स्वयंसेवक नोंदणी यशस्वीरीत्या पूर्ण झाली!', volunteer: item });
  } catch (err) {
    next(err);
  }
});

// --- WOMEN EMPOWERMENT HELP & MENTORS ---
app.get('/api/women/help', async (req, res, next) => {
  try {
    res.json(await listRecords('womenHelp'));
  } catch (err) {
    next(err);
  }
});

app.post('/api/women/help', async (req, res, next) => {
  try {
    const item = {
      id: await freeShortId('womenHelp', 'WHELP-'),
      createdAt: new Date().toLocaleDateString('mr-IN'),
      ...req.body
    };
    await insertRecord('womenHelp', item);
    res.status(201).json({ success: true, message: '🌸 मदत व मार्गदर्शनाची विनंती नोंदवली गेली!', help: item });
  } catch (err) {
    next(err);
  }
});

// --- BUILDERS & REAL ESTATE: Handled by directoriesRoutes (routes/directories.routes.js) ---

// --- MARATHA BANK & LOANS ---
app.get('/api/bank/loans', async (req, res, next) => {
  try {
    res.json(await listRecords('bankLoans'));
  } catch (err) {
    next(err);
  }
});

app.post('/api/bank/loans', async (req, res, next) => {
  try {
    const item = { id: await freeShortId('bankLoans', 'LN-'), ...req.body };
    await insertRecord('bankLoans', item);
    res.status(201).json({ success: true, message: '🏦 कर्ज अर्ज यशस्वीरीत्या सादर केला गेला!', loan: item });
  } catch (err) {
    next(err);
  }
});

// 404 Not Found Catch-All Handler for API Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'ROUTE_NOT_FOUND',
    error: 'विनंती केलेला मार्ग आढळला नाही (Requested endpoint not found).'
  });
});

// Centralized Error Handling Middleware (Catches all sync & async errors, logs server-side, returns sanitized responses)
app.use(errorHandler);

// Global Uncaught / Unhandled Safety Guards
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 [CRITICAL] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🚨 [CRITICAL] Uncaught Exception:', err);
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Connect Maratha Express REST API Server running on port ${PORT}`);
});
