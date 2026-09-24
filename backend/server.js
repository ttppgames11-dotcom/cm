import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
import helmet from 'helmet';
import dotenv from 'dotenv';
import { get } from '../database/database.js';
import { requireAuth, ROLES } from './middleware/auth.js';
import { apiLimiter, writeLimiter } from './middleware/security.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'db.json');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const isProd = process.env.NODE_ENV === 'production';
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
app.disable('x-powered-by');
app.use(helmet());

// CORS: the mobile app does not need it; browsers may only call from the
// origins listed in CORS_ORIGINS (comma separated). Dev also allows localhost.
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // non-browser clients (mobile app, curl)
    if (allowedOrigins.includes(origin)) return cb(null, true);
    if (!isProd && origin.startsWith('http://localhost')) return cb(null, true);
    if (!isProd && origin.startsWith('http://127.0.0.1')) return cb(null, true);
    return cb(null, false);
  }
}));
app.use(express.json({ limit: '100kb' }));
app.use('/api', apiLimiter);
app.use('/api', (req, res, next) => (req.method === 'GET' ? next() : writeLimiter(req, res, next)));

// Reserved keys clients may not set on stored records; bounded size.
function sanitizeBody(req, res, next) {
  const body = req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {};
  if (Object.keys(body).length > 40 || JSON.stringify(body).length > 20000) {
    return res.status(413).json({ success: false, code: 'PAYLOAD_TOO_LARGE', error: 'विनंती खूप मोठी आहे.' });
  }
  for (const k of ['id', 'createdAt', 'submittedBy', '__proto__', 'constructor', 'prototype']) delete body[k];
  body.submittedBy = req.user.id;
  req.body = body;
  next();
}

// Reads return only the caller's own submissions unless they are staff.
function ownOrStaff(req, res, next) {
  if ([ROLES.ADMIN, ROLES.MODERATOR].includes(req.user.role)) return next();
  const json = res.json.bind(res);
  res.json = (body) => json(Array.isArray(body) ? body.filter((i) => i.submittedBy === req.user.id) : body);
  next();
}

// ==========================================
// MOUNT ALL CONNECT MARATHA REST API ROUTERS
// ==========================================
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/businesses', businessesRoutes);
app.use('/api/sangam', sangamRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/culture', cultureRoutes);

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
app.get('/api/health', async (req, res) => {
  try {
    await get('SELECT 1 AS ok');
    res.json({ status: 'OK', timestamp: new Date() });
  } catch {
    res.status(503).json({ status: 'DEGRADED' });
  }
});

// --- DOCTORS ---
app.get('/api/doctors', (req, res) => {
  const db = readData();
  res.json(db.doctors || []);
});

app.post('/api/doctors', requireAuth, sanitizeBody, (req, res) => {
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
app.get('/api/blood/requests', requireAuth, (req, res) => {
  const db = readData();
  res.json(db.bloodRequests || []);
});

app.post('/api/blood/requests', requireAuth, sanitizeBody, (req, res) => {
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

app.get('/api/blood/donors', requireAuth, (req, res) => {
  const db = readData();
  res.json(db.bloodDonors || []);
});

app.post('/api/blood/donors', requireAuth, sanitizeBody, (req, res) => {
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
app.get('/api/matrimony', requireAuth, (req, res) => {
  const db = readData();
  res.json(db.matrimony || []);
});

app.post('/api/matrimony', requireAuth, sanitizeBody, (req, res) => {
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
app.get('/api/political/grievances', requireAuth, ownOrStaff, (req, res) => {
  const db = readData();
  res.json(db.grievances || []);
});

app.post('/api/political/grievances', requireAuth, sanitizeBody, (req, res) => {
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
app.get('/api/social/volunteers', requireAuth, ownOrStaff, (req, res) => {
  const db = readData();
  res.json(db.volunteers || []);
});

app.post('/api/social/volunteers', requireAuth, sanitizeBody, (req, res) => {
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
app.get('/api/women/help', requireAuth, ownOrStaff, (req, res) => {
  const db = readData();
  res.json(db.womenHelp || []);
});

app.post('/api/women/help', requireAuth, sanitizeBody, (req, res) => {
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

// --- BUILDERS & REAL ESTATE ---
app.get('/api/builders', (req, res) => {
  const db = readData();
  res.json(db.builders || []);
});

app.post('/api/builders', requireAuth, sanitizeBody, (req, res) => {
  const db = readData();
  db.builders = db.builders || [];
  const item = { id: `BLD-${Date.now().toString().slice(-4)}`, ...req.body };
  db.builders.unshift(item);
  writeData(db);
  res.status(201).json({ success: true, message: '🏗️ बिल्डर प्रोजेक्ट चौकशी यशस्वीरीत्या नोंदवली गेली!', project: item });
});

// --- MARATHA BANK & LOANS ---
app.get('/api/bank/loans', requireAuth, ownOrStaff, (req, res) => {
  const db = readData();
  res.json(db.bankLoans || []);
});

app.post('/api/bank/loans', requireAuth, sanitizeBody, (req, res) => {
  const db = readData();
  db.bankLoans = db.bankLoans || [];
  const item = { id: `LN-${Date.now().toString().slice(-4)}`, ...req.body };
  db.bankLoans.unshift(item);
  writeData(db);
  res.status(201).json({ success: true, message: '🏦 कर्ज अर्ज यशस्वीरीत्या सादर केला गेला!', loan: item });
});

app.use('/api', notFound);
app.use(errorHandler);

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Connect Maratha Express REST API Server running on port ${PORT}`);
});
