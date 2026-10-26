import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { db } from '../db/realtimeDb.js';
import { optionalToken, authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/jobs
router.get('/', optionalToken, async (req, res, next) => {
  try {
    const { category, district, search } = req.query;
    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (category && category !== 'all' && category !== 'सर्व') {
      sql += ' AND (category LIKE ? OR industry LIKE ?)';
      params.push(`%${category}%`, `%${category}%`);
    }
    if (district && district !== 'सर्व' && district !== 'all') {
      sql += ' AND district LIKE ?';
      params.push(`%${district}%`);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR company LIKE ? OR desc LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    let jobs = await all(sql, params);

    // If SQLite returns rows, enrich with application count
    if (jobs && jobs.length > 0) {
      jobs = jobs.map(j => ({
        ...j,
        location: j.district || j.location || 'महाराष्ट्र',
        industry: j.category || j.industry || 'सामान्य',
        type: j.job_type || j.type || 'Full-time',
        description: j.desc || j.description || ''
      }));
    } else {
      // Fallback to realtimeDb
      const fallback = db.getCollection('jobs') || [];
      jobs = fallback;
    }

    res.json({
      success: true,
      count: jobs.length,
      jobs,
      data: {
        jobs,
        count: jobs.length
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id
router.get('/:id', optionalToken, async (req, res, next) => {
  try {
    let job = await get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) {
      job = db.findById('jobs', req.params.id);
      if (!job) {
        return res.status(404).json({ success: false, error: 'नोकरी संधी आढळली नाही.' });
      }
    } else {
      job = {
        ...job,
        location: job.district || job.location || 'महाराष्ट्र',
        industry: job.category || job.industry || 'सामान्य',
        type: job.job_type || job.type || 'Full-time',
        description: job.desc || job.description || ''
      };
    }

    res.json({
      success: true,
      job,
      data: {
        job
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs
router.post('/', optionalToken, async (req, res, next) => {
  try {
    const { title, company, district, location, category, industry, salary, job_type, type, experience, desc, description, contact_email, contactEmail, phone, contactPhone } = req.body;

    if (!title || !company) {
      return res.status(400).json({ success: false, error: 'पदाचे नाव आणि कंपनी आवश्यक आहे.' });
    }

    const id = 'JOB-' + Math.floor(10 + Math.random() * 90);
    const resolvedDistrict = district || location || 'पुणे';
    const resolvedCat = category || industry || 'सामान्य';
    const resolvedType = job_type || type || 'Full-time';
    const resolvedDesc = desc || description || '';
    const resolvedEmail = contact_email || contactEmail || '';
    const resolvedPhone = phone || contactPhone || '';

    await runQuery(`
      INSERT INTO jobs (id, title, company, district, category, salary, job_type, experience, desc, contact_email, phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [id, title, company, resolvedDistrict, resolvedCat, salary || 'चर्चेनुसार', resolvedType, experience || '१-३ वर्षे', resolvedDesc, resolvedEmail, resolvedPhone]);

    const created = await get('SELECT * FROM jobs WHERE id = ?', [id]);

    // Mirror to realtimeDb
    db.insert('jobs', {
      ...created,
      location: resolvedDistrict,
      industry: resolvedCat,
      type: resolvedType,
      description: resolvedDesc,
      contactEmail: resolvedEmail,
      contactPhone: resolvedPhone,
      status: 'approved',
      verified: true
    });

    res.status(201).json({
      success: true,
      message: 'नोकरी जाहिरात प्रसिद्ध झाली!',
      job: created,
      data: { job: created }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/apply
router.post('/:id/apply', optionalToken, async (req, res, next) => {
  try {
    const { applicant_name, applicantName, phone, email, resume_summary, resumeSummary } = req.body;
    const name = applicant_name || applicantName || req.user?.name;
    const contact = phone || req.user?.phone;

    if (!name || !contact) {
      return res.status(400).json({ success: false, error: 'अर्जदाराचे नाव आणि फोन नंबर आवश्यक आहे.' });
    }

    const id = 'APP-' + Date.now();

    await runQuery(`
      INSERT INTO job_applications (id, job_id, applicant_name, phone, email, resume_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, [id, req.params.id, name, contact, email || req.user?.email || '', resume_summary || resumeSummary || '']);

    // Mirror to realtimeDb
    db.insert('jobApplications', {
      id,
      jobId: req.params.id,
      applicantName: name,
      phone: contact,
      email: email || '',
      resumeSummary: resume_summary || resumeSummary || '',
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'आपला नोकरी अर्ज यशस्वीरित्या सादर करण्यात आला!',
      data: { applicationId: id }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
