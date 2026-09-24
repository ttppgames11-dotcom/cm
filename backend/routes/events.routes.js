import { Router } from 'express';
import crypto from 'crypto';
import { all, get, runQuery, transaction } from '../../database/database.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';
import { str, int, bad } from '../middleware/validate.js';

const router = Router();

// GET /api/events
router.get('/', async (req, res, next) => {
  try {
    const { district, category } = req.query;
    let sql = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (district && district !== 'सर्व') {
      sql += ' AND district = ?';
      params.push(district);
    }
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY date ASC';
    const events = await all(sql, params);
    res.json({ success: true, count: events.length, events });
  } catch (err) {
    next(err);
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res, next) => {
  try {
    const event = await get('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!event) {
      return res.status(404).json({ success: false, error: 'कार्यक्रम आढळला नाही.' });
    }
    res.json({ success: true, event });
  } catch (err) {
    next(err);
  }
});

// POST /api/events/:id/rsvp  (member is always the caller; one RSVP per event)
router.post('/:id/rsvp', requireAuth, async (req, res, next) => {
  try {
    const event = await get('SELECT id FROM events WHERE id = ?', [req.params.id]);
    if (!event) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'कार्यक्रम सापडला नाही.' });
    const seats = int(req.body.seats, { min: 1, max: 10, fallback: 1 });

    const already = await get('SELECT id FROM event_rsvps WHERE event_id = ? AND member_id = ?', [event.id, req.user.id]);
    if (already) return res.status(409).json({ success: false, code: 'ALREADY_RSVPED', error: 'आपण या कार्यक्रमासाठी आधीच नोंदणी केली आहे.' });

    await transaction(async (t) => {
      await t.runQuery(`
        INSERT INTO event_rsvps (id, event_id, member_id, member_name, phone, seats, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `, ['RSVP-' + crypto.randomBytes(6).toString('hex'), event.id, req.user.id, req.user.name, str(req.body.phone, 20), seats]);
      await t.runQuery('UPDATE events SET rsvp_count = rsvp_count + ? WHERE id = ?', [seats, event.id]);
    });

    const updated = await get('SELECT id, rsvp_count FROM events WHERE id = ?', [event.id]);
    res.status(201).json({ success: true, message: 'उपस्थिती नोंदणी (RSVP) यशस्वी झाली!', rsvp_count: updated.rsvp_count });
  } catch (err) {
    next(err);
  }
});

// POST /api/events  (organisers: staff only)
router.post('/', ...requireStaff, async (req, res, next) => {
  try {
    const title = str(req.body.title, 200);
    const date = str(req.body.date, 30);
    const venue = str(req.body.venue, 200);
    if (!title || !date || !venue) {
      return bad(res, 'कार्यक्रमाचे नाव, तारीख आणि ठिकाण आवश्यक आहे.');
    }

    const id = 'E-' + crypto.randomBytes(5).toString('hex');
    await runQuery(`
      INSERT INTO events (id, title, category, date, time, venue, district, "desc", organizer, banner, rsvp_count, creator_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, datetime('now'))
    `, [id, title, str(req.body.category, 60) || 'सामाजिक मेळावा', date, str(req.body.time, 30) || 'सकाळी १०:००', venue,
        str(req.body.district, 60) || 'पुणे', str(req.body.desc, 2000), str(req.body.organizer, 150) || 'अखिल भारतीय मराठा महासंघ',
        str(req.body.banner, 300) || '/assets/images/meeting.jpg', req.user.id]);

    const created = await get('SELECT * FROM events WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'कार्यक्रम यशस्वीरित्या जोडला!', event: created });
  } catch (err) {
    next(err);
  }
});

export default router;

