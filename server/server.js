import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import quizRoutes from './routes/quiz.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

// Mount 20,000-Question Maratha History Quiz Routes
app.use('/api/quiz', quizRoutes);

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

app.post('/api/doctors', (req, res) => {
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

app.post('/api/blood/requests', (req, res) => {
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

// --- BUILDERS & REAL ESTATE ---
app.get('/api/builders', (req, res) => {
  const db = readData();
  res.json(db.builders || []);
});

app.post('/api/builders', (req, res) => {
  const db = readData();
  db.builders = db.builders || [];
  const item = { id: `BLD-${Date.now().toString().slice(-4)}`, ...req.body };
  db.builders.unshift(item);
  writeData(db);
  res.status(201).json({ success: true, message: '🏗️ बिल्डर प्रोजेक्ट चौकशी यशस्वीरीत्या नोंदवली गेली!', project: item });
});

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

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Connect Maratha Express REST API Server running on port ${PORT}`);
});
