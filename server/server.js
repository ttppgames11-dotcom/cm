import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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

app.use(cors());
app.use(express.json());

// Global Healthcheck Endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, 'Connect Maratha Express REST API Server is Healthy and Operational', {
    status: 'OK',
    version: '2.0.0',
    timestamp: new Date().toISOString()
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
// (/api/doctors, /api/artists, /api/officers, /api/speakers, /api/organizations, /api/builders, /api/manufacturers, /api/dairy, /api/bank)
app.use('/api', directoriesRoutes);

// 5. Community Safety, Seva & Emergency
// (/api/blood, /api/matrimony, /api/women, /api/social, /api/political)
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

// Central Error Handler
app.use(errorHandler);

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Connect Maratha Express REST API Server running on port ${PORT}`);
});

export default app;
