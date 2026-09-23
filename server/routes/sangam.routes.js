import { Router } from 'express';
import { all, get, runQuery } from '../db/database.js';

const router = Router();

// GET /api/sangam/referrals
router.get('/referrals', async (req, res, next) => {
  try {
    const { memberId, status } = req.query;
    let sql = 'SELECT * FROM referrals WHERE 1=1';
    const params = [];

    if (memberId) {
      sql += ' AND (giver_id = ? OR recipient_id = ?)';
      params.push(memberId, memberId);
    }
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';
    const referrals = await all(sql, params);
    res.json({ success: true, count: referrals.length, referrals });
  } catch (err) {
    next(err);
  }
});

// POST /api/sangam/referrals
router.post('/referrals', async (req, res, next) => {
  try {
    const { title, category, giver_id, giver_name, recipient_id, recipient_name, client_name, client_phone, client_email, value, notes } = req.body;

    if (!title || !client_name) {
      return res.status(400).json({ success: false, error: 'शीर्षक आणि ग्राहकाचे नाव आवश्यक आहे.' });
    }

    const id = 'REF-' + Math.floor(100 + Math.random() * 900);

    await runQuery(`
      INSERT INTO referrals (id, title, category, giver_id, giver_name, recipient_id, recipient_name, client_name, client_phone, client_email, status, value, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?, ?, datetime('now'))
    `, [id, title, category || 'सामान्य', giver_id || 'M1001', giver_name || 'अमोल जाधव', recipient_id || 'M1008', recipient_name || 'विकास गायकवाड', client_name, client_phone || '', client_email || '', value || 0, notes || '']);

    const created = await get('SELECT * FROM referrals WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'नवीन संदर्भ यशस्वीरित्या नोंदवला!', referral: created });
  } catch (err) {
    next(err);
  }
});

// PUT /api/sangam/referrals/:id/status
router.put('/referrals/:id/status', async (req, res, next) => {
  try {
    const { status, value } = req.body;
    await runQuery(`
      UPDATE referrals SET status = ?, value = COALESCE(?, value) WHERE id = ?
    `, [status, value, req.params.id]);

    const updated = await get('SELECT * FROM referrals WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'स्थिती अद्ययावत केली!', referral: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/sangam/meetings
router.get('/meetings', async (req, res, next) => {
  try {
    const { memberId } = req.query;
    let sql = 'SELECT * FROM meetings WHERE 1=1';
    const params = [];

    if (memberId) {
      sql += ' AND (requester_id = ? OR recipient_id = ?)';
      params.push(memberId, memberId);
    }

    sql += ' ORDER BY date DESC';
    const meetings = await all(sql, params);
    res.json({ success: true, count: meetings.length, meetings });
  } catch (err) {
    next(err);
  }
});

// POST /api/sangam/meetings
router.post('/meetings', async (req, res, next) => {
  try {
    const { requester_id, requester_name, recipient_id, recipient_name, date, time, topic, notes } = req.body;
    const id = 'MT-' + Date.now();

    await runQuery(`
      INSERT INTO meetings (id, requester_id, requester_name, recipient_id, recipient_name, date, time, topic, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?, datetime('now'))
    `, [id, requester_id || 'M1001', requester_name || 'अमोल जाधव', recipient_id || 'M1002', recipient_name || 'प्रिया देशमुख', date || date('now'), time || 'सकाळी ११:००', topic || 'व्यवसाय संगम १-टू-१ चर्चा', notes || '']);

    const created = await get('SELECT * FROM meetings WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'भेट नियोजित केली!', meeting: created });
  } catch (err) {
    next(err);
  }
});

// GET /api/sangam/metrics
router.get('/metrics', async (req, res, next) => {
  try {
    const totalReferrals = await get('SELECT COUNT(*) as count FROM referrals');
    const wonDeals = await get("SELECT COUNT(*) as count, SUM(value) as totalValue FROM referrals WHERE status = 'Deal Won'");
    const totalMeetings = await get('SELECT COUNT(*) as count FROM meetings');

    res.json({
      success: true,
      metrics: {
        totalReferrals: totalReferrals.count,
        wonDeals: wonDeals.count,
        totalBusinessValue: wonDeals.totalValue || 470000,
        totalMeetings: totalMeetings.count
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
