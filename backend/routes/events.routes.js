import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';

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

// POST /api/events/:id/rsvp
router.post('/:id/rsvp', async (req, res, next) => {
  try {
    const { member_id, member_name, phone, seats } = req.body;
    const rsvpId = 'RSVP-' + Date.now();
    const count = parseInt(seats || 1, 10);

    await runQuery(`
      INSERT INTO event_rsvps (id, event_id, member_id, member_name, phone, seats, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, [rsvpId, req.params.id, member_id || 'M1001', member_name || 'सदस्य', phone || '', count]);

    await runQuery('UPDATE events SET rsvp_count = rsvp_count + ? WHERE id = ?', [count, req.params.id]);

    const updated = await get('SELECT id, rsvp_count FROM events WHERE id = ?', [req.params.id]);
    res.status(201).json({ success: true, message: 'उपस्थिती नोंदणी (RSVP) यशस्वी झाली!', rsvp_count: updated.rsvp_count });
  } catch (err) {
    next(err);
  }
});

// POST /api/events
router.post('/', async (req, res, next) => {
  try {
    const { title, category, date, time, venue, district, desc, organizer, banner } = req.body;

    if (!title || !date || !venue) {
      return res.status(400).json({ success: false, error: 'कार्यक्रमाचे नाव, तारीख आणि ठिकाण आवश्यक आहे.' });
    }

    const id = 'E' + Math.floor(10 + Math.random() * 90);

    await runQuery(`
      INSERT INTO events (id, title, category, date, time, venue, district, "desc", organizer, banner, rsvp_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `, [id, title, category || 'सामाजिक मेळावा', date, time || 'सकाळी १०:००', venue, district || 'पुणे', desc || '', organizer || 'अखिल भारतीय मराठा महासंघ', banner || '/assets/images/meeting.jpg']);

    const created = await get('SELECT * FROM events WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'कार्यक्रम यशस्वीरित्या जोडला!', event: created });
  } catch (err) {
    next(err);
  }
});

export default router;

