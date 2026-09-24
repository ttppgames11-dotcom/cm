import { Router } from 'express';
import crypto from 'crypto';
import { all, get, runQuery } from '../../database/database.js';
import { requireAuth } from '../middleware/auth.js';
import { str, bad } from '../middleware/validate.js';

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
      sql += ' AND (title LIKE ? OR company LIKE ? OR "desc" LIKE ?)';
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
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const title = str(req.body.title, 150);
    const company = str(req.body.company, 150);
    if (!title || !company) {
      return bad(res, 'पदाचे नाव आणि कंपनी आवश्यक आहे.');
    }

    const id = 'JOB-' + crypto.randomBytes(5).toString('hex');
    await runQuery(`
      INSERT INTO jobs (id, title, company, district, category, salary, job_type, experience, "desc", contact_email, phone, poster_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [id, title, company, str(req.body.district, 60) || 'पुणे', str(req.body.category, 60) || 'सामान्य', str(req.body.salary, 60) || 'चर्चेनुसार',
        str(req.body.job_type, 30) || 'Full-time', str(req.body.experience, 60) || '१-३ वर्षे', str(req.body.desc, 3000),
        str(req.body.contact_email, 200), str(req.body.phone, 20), req.user.id]);

    const created = await get('SELECT * FROM jobs WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'नोकरी जाहिरात प्रसिद्ध झाली!', job: created });
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs/:id/apply  (applicant is the logged-in member)
router.post('/:id/apply', requireAuth, async (req, res, next) => {
  try {
    const job = await get('SELECT id FROM jobs WHERE id = ?', [req.params.id]);
    if (!job) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'नोकरी सापडली नाही.' });
    const phone = str(req.body.phone, 20);
    if (!phone) return bad(res, 'फोन नंबर आवश्यक आहे.');
    const dup = await get('SELECT id FROM job_applications WHERE job_id = ? AND member_id = ?', [job.id, req.user.id]);
    if (dup) return res.status(409).json({ success: false, code: 'ALREADY_APPLIED', error: 'आपण या नोकरीसाठी आधीच अर्ज केला आहे.' });

    await runQuery(`
      INSERT INTO job_applications (id, job_id, member_id, applicant_name, phone, email, resume_summary, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, ['APP-' + crypto.randomBytes(6).toString('hex'), job.id, req.user.id, req.user.name, phone, str(req.body.email, 200), str(req.body.resume_summary, 2000)]);

    res.status(201).json({ success: true, message: 'आपला नोकरी अर्ज यशस्वीरित्या सादर करण्यात आला!' });
  } catch (err) {
    next(err);
  }
});

export default router;

