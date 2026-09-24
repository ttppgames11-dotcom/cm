import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateJob, sanitize, isValidPhone, cleanPhone } from '../utils/validator.js';

const router = Router();

// GET /api/jobs
// Search job openings by district, industry, salary, experience
router.get('/', (req, res) => {
  const { district, industry, search } = req.query;
  let list = db.getCollection('jobs');

  if (list.length === 0) {
    const seedJobs = [
      {
        id: 'JOB-001',
        title: 'सिनिअर सॉफ्टवेअर इंजिनिअर (React / Node.js)',
        company: 'सह्याद्री टेक सोल्यूशन्स',
        location: 'बाणेर, पुणे',
        district: 'पुणे',
        industry: 'आयटी व सॉफ्टवेअर',
        salary: '₹१२ - १८ लाख वार्षिक',
        type: 'पूर्णवेळ (Full-time)',
        experience: '३-५ वर्षे',
        description: 'वेब प्लॅटफॉर्म्स व क्लाउड ॲप्लिकेशन्स डेव्हलपमेंटसाठी अनुभवी तंत्रज्ञांची गरज.',
        postedAt: new Date().toISOString()
      },
      {
        id: 'JOB-002',
        title: 'अकाउंटंट व टॅक्सेशन मॅनेजर (CA Inter / B.Com)',
        company: 'राजमुद्रा फायनान्शिअल ग्रुप',
        location: 'दादर, मुंबई',
        district: 'मुंबई',
        industry: 'वित्त व कर सल्लागार',
        salary: '₹४०,००० - ६०,००० दरमहा',
        type: 'पूर्णवेळ',
        experience: '२+ वर्षे',
        description: 'जीएसटी, इन्कम टॅक्स रिटर्न व बॅलन्स शीट फायनलायझेशन सांभाळण्यासाठी.',
        postedAt: new Date().toISOString()
      },
      {
        id: 'JOB-003',
        title: 'उत्पादन पर्यवेक्षक (Production Supervisor)',
        company: 'मराठा ऑटोपार्ट्स प्रायव्हेट लिमिटेड',
        location: 'चाकण एमआयडीसी, पुणे',
        district: 'पुणे',
        industry: 'ऑटोमोबाईल व मॅन्युफॅक्चरिंग',
        salary: '₹३५,००० - ५०,००० दरमहा',
        type: 'पूर्णवेळ',
        experience: 'डिप्लोमा / डिग्री मेकॅनिकल, ३ वर्षे',
        description: 'शॉप फ्लोअर व्यवस्थापन, क्वालिटी कंट्रोल व शिफ्ट सुपरव्हिजन.',
        postedAt: new Date().toISOString()
      }
    ];
    for (const j of seedJobs) db.insert('jobs', j);
    list = seedJobs;
  }

  if (district && district !== 'सर्व') {
    list = list.filter(j => (j.district || '').toLowerCase() === district.toLowerCase());
  }
  if (industry && industry !== 'सर्व') {
    list = list.filter(j => (j.industry || '').toLowerCase().includes(industry.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(j => 
      (j.title || '').toLowerCase().includes(q) ||
      (j.company || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'नोकरीच्या संधी प्राप्त झाल्या', { jobs: list, count: list.length });
});

// GET /api/jobs/:id
// Detailed job requirements, company profile, perks
router.get('/:id', (req, res) => {
  const job = db.findById('jobs', req.params.id);
  if (!job) {
    return sendError(res, 'नोकरीची जाहिरात सापडली नाही.', 'JOB_NOT_FOUND', 404);
  }
  return sendSuccess(res, 'नोकरीचा सविस्तर तपशील', { job });
});

// POST /api/jobs
// Post job listing by Maratha entrepreneur/business
router.post('/', authenticateToken, (req, res) => {
  const { isValid, errors, sanitized } = validateJob(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'अवैध नोकरी जाहिरात माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
  }

  const { title, company, location, contactEmail } = sanitized;
  const { district, industry, salary, type, experience, description } = req.body;

  const newJob = {
    id: `JOB-${Date.now().toString().slice(-4)}`,
    title,
    company,
    location,
    district: sanitize(district) || req.user.district || 'पुणे',
    industry: sanitize(industry) || 'इतर उद्योग',
    salary: sanitize(salary) || 'चर्चेनुसार (Negotiable)',
    type: sanitize(type) || 'पूर्णवेळ',
    experience: sanitize(experience) || '१-३ वर्षे',
    description: sanitize(description) || '',
    contactEmail: contactEmail || req.user.email || '',
    posterId: req.user.id,
    posterName: req.user.name,
    postedAt: new Date().toISOString()
  };

  db.insert('jobs', newJob);
  db.addAuditLog('POST_JOB', req.user.id, { jobId: newJob.id, title });

  return sendSuccess(res, 'नोकरीची जाहिरात यशस्वीरीत्या प्रसिद्ध झाली!', { job: newJob }, 201);
});

// POST /api/jobs/:id/apply
// Submit application with resume URL, contact, cover note
router.post('/:id/apply', authenticateToken, (req, res) => {
  const job = db.findById('jobs', req.params.id);
  if (!job) {
    return sendError(res, 'नोकरीची जाहिरात सापडली नाही.', 'JOB_NOT_FOUND', 404);
  }

  const { resumeUrl, coverNote, phone } = req.body;
  const cleanedPhone = phone ? cleanPhone(phone) : (req.user.phone ? cleanPhone(req.user.phone) : '');

  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
    return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
  }

  const application = {
    id: `APP-${Date.now().toString().slice(-4)}`,
    jobId: req.params.id,
    jobTitle: job.title,
    company: job.company,
    applicantId: req.user.id,
    applicantName: req.user.name,
    applicantEmail: req.user.email || '',
    applicantPhone: cleanedPhone,
    resumeUrl: sanitize(resumeUrl) || 'बायोडाटा संलग्न',
    coverNote: sanitize(coverNote) || '',
    status: 'अर्ज सादर झाला (Applied)',
    appliedAt: new Date().toISOString()
  };

  db.insert('jobApplications', application);
  db.addAuditLog('APPLY_JOB', req.user.id, { jobId: req.params.id, applicationId: application.id });

  return sendSuccess(res, 'नोकरीसाठी आपला अर्ज यशस्वीरीत्या सादर केला गेला!', { application }, 201);
});

export default router;
