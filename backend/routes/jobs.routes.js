import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';

const router = Router();

// GET /api/jobs
router.get('/', async (req, res, next) => {
  try {
    const { category, district, search } = req.query;
    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (district && district !== 'सर्व') {
      sql += ' AND district = ?';
      params.push(district);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR company LIKE ? OR desc LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const jobs = await all(sql, params);
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const job = await get('SELECT * FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) {
      return res.status(404).json({ success: false, error: 'नोकरी संधी आढळली नाही.' });
    }
    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs
router.post('/', async (req, res, next) => {
  try {
    const { title, company, district, category, salary, job_type, experience, desc, contact_email, phone } = req.body;

    if (!title || !company) {
      return res.status(400).json({ success: false, error: 'पदाचे नाव आणि कंपनी आवश्यक आहे.' });
    }

    const id = 'JOB-' + Math.floor(10 + Math.random() * 90);

    await runQuery(`
      INSERT INTO jobs (id, title, company, district, category, salary, job_type, experience, desc, contact_email, phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [id, title, company, district || 'पुणे', category || 'सामान्य', salary || 'चर्चेनुसार', job_type || 'Full-time', experience || '१-३ वर्षे', desc || '', contact_email || '', phone || '']);

    const created = await get('SELECT * FROM jobs WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'नोकरी जाहिरात प्रसिद्ध झाली!', job: created });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/apply
router.post('/:id/apply', async (req, res, next) => {
  try {
    const { applicant_name, phone, email, resume_summary } = req.body;

    if (!applicant_name || !phone) {
      return res.status(400).json({ success: false, error: 'अर्जदाराचे नाव आणि फोन नंबर आवश्यक आहे.' });
    }

    const id = 'APP-' + Date.now();

    await runQuery(`
      INSERT INTO job_applications (id, job_id, applicant_name, phone, email, resume_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, [id, req.params.id, applicant_name, phone, email || '', resume_summary || '']);

    res.status(201).json({ success: true, message: 'आपला नोकरी अर्ज यशस्वीरित्या सादर करण्यात आला!' });
  } catch (err) {
    next(err);
  }
});

export default router;

