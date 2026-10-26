import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// GET /api/events
// Fetch all events with optional filters (district, category)
router.get('/', async (req, res, next) => {
  try {
    const { district, category, search } = req.query;
    let sql = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (district && district !== 'सर्व' && district !== 'all') {
      sql += ' AND district LIKE ?';
      params.push(`%${district}%`);
    }
    if (category && category !== 'all' && category !== 'सर्व') {
      sql += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR venue LIKE ? OR desc LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY date ASC';
    const events = await all(sql, params);

    // Provide dual payload so both mobile app (events) and web API consumers (data.events) work seamlessly
    res.json({
      success: true,
      count: events.length,
      events,
      data: {
        events,
        count: events.length
      }
    });
  } catch (err) {
    // Fallback to realtimeDb if SQLite has any issue
    try {
      const list = db.getCollection('events') || [];
      return res.json({ success: true, count: list.length, events: list, data: { events: list } });
    } catch {
      next(err);
    }
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res, next) => {
  try {
    const event = await get('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!event) {
      const fallback = db.findById('events', req.params.id);
      if (!fallback) {
        return res.status(404).json({ success: false, error: 'कार्यक्रम आढळला नाही.' });
      }
      return res.json({ success: true, event: fallback, data: { event: fallback } });
    }

    const rsvps = await all('SELECT * FROM event_rsvps WHERE event_id = ? ORDER BY created_at DESC', [req.params.id]);
    event.rsvps = rsvps;
    event.attendeesCount = event.rsvp_count || rsvps.length;

    res.json({
      success: true,
      event,
      data: {
        event,
        rsvpsCount: rsvps.length
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/events/:id/rsvp
router.post('/:id/rsvp', optionalToken, async (req, res, next) => {
  try {
    const member_id = req.user?.id || req.body.member_id || 'M1001';
    const member_name = req.user?.name || req.body.member_name || 'सदस्य';
    const phone = req.user?.phone || req.body.phone || '';
    const seats = parseInt(req.body.seats || 1, 10);
    const rsvpId = 'RSVP-' + Date.now().toString().slice(-6);

    await runQuery(`
      INSERT INTO event_rsvps (id, event_id, member_id, member_name, phone, seats, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, [rsvpId, req.params.id, member_id, member_name, phone, seats]);

    await runQuery('UPDATE events SET rsvp_count = COALESCE(rsvp_count, 0) + ? WHERE id = ?', [seats, req.params.id]);

    const updated = await get('SELECT id, rsvp_count FROM events WHERE id = ?', [req.params.id]);

    // Mirror to realtimeDb
    db.insert('eventRsvps', { id: rsvpId, eventId: req.params.id, memberId: member_id, memberName: member_name, phone, seats, timestamp: new Date().toISOString() });

    res.status(201).json({
      success: true,
      message: 'उपस्थिती नोंदणी (RSVP) यशस्वी झाली!',
      rsvpId,
      rsvp_count: updated?.rsvp_count || seats,
      qrPass: `PASS-${rsvpId}`
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/events
router.post('/', optionalToken, async (req, res, next) => {
  try {
    const { title, category, date, time, venue, location, district, desc, description, organizer, banner } = req.body;

    if (!title || !date) {
      return res.status(400).json({ success: false, error: 'कार्यक्रमाचे नाव आणि तारीख आवश्यक आहे.' });
    }

    const id = 'E' + Math.floor(10 + Math.random() * 90);
    const eventVenue = venue || location || 'पुणे';
    const eventDesc = desc || description || '';

    await runQuery(`
      INSERT INTO events (id, title, category, date, time, venue, district, desc, organizer, banner, rsvp_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `, [
      id,
      title,
      category || 'सामाजिक मेळावा',
      date,
      time || 'सकाळी १०:००',
      eventVenue,
      district || 'पुणे',
      eventDesc,
      organizer || 'अखिल भारतीय मराठा महासंघ',
      banner || '/assets/images/meeting.jpg'
    ]);

    const created = await get('SELECT * FROM events WHERE id = ?', [id]);
    
    // Mirror to realtimeDb
    db.insert('events', created);

    res.status(201).json({
      success: true,
      message: 'कार्यक्रम यशस्वीरित्या जोडला!',
      event: created,
      data: { event: created }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
