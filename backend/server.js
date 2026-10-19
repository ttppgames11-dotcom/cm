import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

import express from 'express';
import cors from 'cors';
import fs from 'fs';
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

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'db.json');

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

// Helper functions for reading and writing to DB
function readData() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return {};
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

// System Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'Connect Maratha Express REST API Server', timestamp: new Date() });
});

// --- DOCTORS ---
app.get('/api/doctors', (req, res) => {
  const db = readData();
  res.json(db.doctors || []);
});

app.post('/api/doctors', validateBody(doctorSchema), (req, res) => {
  const db = readData();
  db.doctors = db.doctors || [];
  const newDoctor = {
    id: `DOC-${Date.now().toString().slice(-4)}`,
    rating: '5.0 ★ (नवीन नोंदणी)',
    icon: '🩺',
    ...req.body
  };
  db.doctors.unshift(newDoctor);
  writeData(db);
  res.status(201).json({ success: true, message: 'डॉक्टर प्रोफाइल यशस्वीरीत्या जोडले गेले!', doctor: newDoctor });
});

// --- BLOOD REQUESTS & DONORS ---
app.get('/api/blood/requests', (req, res) => {
  const db = readData();
  res.json(db.bloodRequests || []);
});

app.post('/api/blood/requests', validateBody(bloodRequestSchema), (req, res) => {
  const db = readData();
  db.bloodRequests = db.bloodRequests || [];
  const newReq = {
    id: `REQ-${Date.now().toString().slice(-3)}`,
    time: 'आत्ताच',
    ...req.body
  };
  db.bloodRequests.unshift(newReq);
  writeData(db);
  res.status(201).json({ success: true, message: '🚨 तातडीची रक्त मागणी प्रसारित करण्यात आली!', request: newReq });
});

app.get('/api/blood/donors', (req, res) => {
  const db = readData();
  res.json(db.bloodDonors || []);
});

app.post('/api/blood/donors', (req, res) => {
  const db = readData();
  db.bloodDonors = db.bloodDonors || [];
  const newDonor = {
    id: `DON-${Date.now().toString().slice(-4)}`,
    totalDonations: 1,
    lastDonated: 'नवीन नोंदणी',
    ...req.body
  };
  db.bloodDonors.unshift(newDonor);
  writeData(db);
  res.status(201).json({ success: true, message: '❤️ रक्तदाता नोंदणी यशस्वी झाली!', donor: newDonor });
});

// --- MATRIMONY ---
app.get('/api/matrimony', (req, res) => {
  const db = readData();
  res.json(db.matrimony || []);
});

app.post('/api/matrimony', (req, res) => {
  const db = readData();
  db.matrimony = db.matrimony || [];
  const newProfile = {
    id: `CM-${(req.body.gender || '').includes('वर') ? 'M' : 'F'}-${Date.now().toString().slice(-3)}`,
    verified: true,
    photo: (req.body.gender || '').includes('वर') ? '👨‍💼' : '👩‍💼',
    caste: '९६ कुळी मराठा',
    ...req.body
  };
  db.matrimony.unshift(newProfile);
  writeData(db);
  res.status(201).json({ success: true, message: '💍 विवाह प्रोफाइल यशस्वीरीत्या नोंदवले गेले!', profile: newProfile });
});

// --- POLITICAL GRIEVANCES / REPRESENTATIONS ---
app.get('/api/political/grievances', (req, res) => {
  const db = readData();
  res.json(db.grievances || []);
});

app.post('/api/political/grievances', (req, res) => {
  const db = readData();
  db.grievances = db.grievances || [];
  const item = {
    id: `GRV-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toLocaleDateString('mr-IN'),
    ...req.body
  };
  db.grievances.unshift(item);
  writeData(db);
  res.status(201).json({ success: true, message: '📜 मागणी/निवेदन यशस्वीरीत्या सादर केले गेले!', grievance: item });
});

// --- SOCIAL WORKERS & VOLUNTEERS ---
app.get('/api/social/volunteers', (req, res) => {
  const db = readData();
  res.json(db.volunteers || []);
});

app.post('/api/social/volunteers', (req, res) => {
  const db = readData();
  db.volunteers = db.volunteers || [];
  const item = {
    id: `VOL-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toLocaleDateString('mr-IN'),
    ...req.body
  };
  db.volunteers.unshift(item);
  writeData(db);
  res.status(201).json({ success: true, message: '🤝 स्वयंसेवक नोंदणी यशस्वीरीत्या पूर्ण झाली!', volunteer: item });
});

// --- WOMEN EMPOWERMENT HELP & MENTORS ---
app.get('/api/women/help', (req, res) => {
  const db = readData();
  res.json(db.womenHelp || []);
});

app.post('/api/women/help', (req, res) => {
  const db = readData();
  db.womenHelp = db.womenHelp || [];
  const item = {
    id: `WHELP-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toLocaleDateString('mr-IN'),
    ...req.body
  };
  db.womenHelp.unshift(item);
  writeData(db);
  res.status(201).json({ success: true, message: '🌸 मदत व मार्गदर्शनाची विनंती नोंदवली गेली!', help: item });
});

// --- BUILDERS & REAL ESTATE: Handled by directoriesRoutes (routes/directories.routes.js) ---

// --- MARATHA BANK & LOANS ---
app.get('/api/bank/loans', (req, res) => {
  const db = readData();
  res.json(db.bankLoans || []);
});

app.post('/api/bank/loans', (req, res) => {
  const db = readData();
  db.bankLoans = db.bankLoans || [];
  const item = { id: `LN-${Date.now().toString().slice(-4)}`, ...req.body };
  db.bankLoans.unshift(item);
  writeData(db);
  res.status(201).json({ success: true, message: '🏦 कर्ज अर्ज यशस्वीरीत्या सादर केला गेला!', loan: item });
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
