import { Router } from 'express';
import crypto from 'crypto';
import { all, get, runQuery } from '../../database/database.js';
import { requireAuth, ROLES } from '../middleware/auth.js';
import { str, bad } from '../middleware/validate.js';

const router = Router();

const REFERRAL_STATUSES = ['New', 'Contacted', 'In Progress', 'Deal Won', 'Deal Lost'];
const isAdmin = (user) => user.role === ROLES.ADMIN;

// GET /api/sangam/referrals  (only referrals the caller gave or received)
router.get('/referrals', requireAuth, async (req, res, next) => {
  try {
    const status = str(req.query.status, 30);
    let sql = 'SELECT * FROM referrals WHERE 1=1';
    const params = [];
    if (!isAdmin(req.user)) {
      sql += ' AND (giver_id = ? OR recipient_id = ?)';
      params.push(req.user.id, req.user.id);
    }
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC LIMIT 200';
    const referrals = await all(sql, params);
    res.json({ success: true, count: referrals.length, referrals });
  } catch (err) {
    next(err);
  }
});

// POST /api/sangam/referrals  (giver is always the caller; no money moves through this API)
router.post('/referrals', requireAuth, async (req, res, next) => {
  try {
    const title = str(req.body.title, 150);
    const clientName = str(req.body.client_name, 100);
    if (!title || !clientName) {
      return bad(res, 'शीर्षक आणि ग्राहकाचे नाव आवश्यक आहे.');
    }
    const recipient = await get("SELECT id, name FROM members WHERE id = ? AND status = 'active'", [str(req.body.recipient_id, 40)]);
    if (!recipient) return bad(res, 'प्राप्तकर्ता सदस्य सापडला नाही.', 'RECIPIENT_NOT_FOUND');
    if (recipient.id === req.user.id) return bad(res, 'आपण स्वतःला संदर्भ देऊ शकत नाही.');

    const value = Math.min(Math.max(parseFloat(req.body.value) || 0, 0), 1e9);
    const id = 'REF-' + crypto.randomBytes(5).toString('hex');
    await runQuery(`
      INSERT INTO referrals (id, title, category, giver_id, giver_name, recipient_id, recipient_name, client_name, client_phone, client_email, status, value, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?, ?, datetime('now'))
    `, [id, title, str(req.body.category, 60) || 'सामान्य', req.user.id, req.user.name, recipient.id, recipient.name,
        clientName, str(req.body.client_phone, 20), str(req.body.client_email, 200), value, str(req.body.notes, 1000)]);
    const created = await get('SELECT * FROM referrals WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'नवीन संदर्भ यशस्वीरित्या नोंदवला!', referral: created });
  } catch (err) {
    next(err);
  }
});

// PUT /api/sangam/referrals/:id/status  (only the recipient updates the outcome)
router.put('/referrals/:id/status', requireAuth, async (req, res, next) => {
  try {
    const referral = await get('SELECT * FROM referrals WHERE id = ?', [req.params.id]);
    if (!referral) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'संदर्भ सापडला नाही.' });
    if (referral.recipient_id !== req.user.id && !isAdmin(req.user)) {
      return res.status(403).json({ success: false, code: 'FORBIDDEN', error: 'ही कृती करण्याची आपल्याला परवानगी नाही.' });
    }
    const status = str(req.body.status, 30);
    if (!REFERRAL_STATUSES.includes(status)) return bad(res, 'अवैध स्थिती.', 'INVALID_STATUS');
    const value = req.body.value === undefined ? null : Math.min(Math.max(parseFloat(req.body.value) || 0, 0), 1e9);

    await runQuery('UPDATE referrals SET status = ?, value = COALESCE(?, value) WHERE id = ?', [status, value, referral.id]);
    const updated = await get('SELECT * FROM referrals WHERE id = ?', [referral.id]);
    res.json({ success: true, message: 'स्थिती अद्ययावत केली!', referral: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/sangam/meetings  (only the caller's meetings)
router.get('/meetings', requireAuth, async (req, res, next) => {
  try {
    let sql = 'SELECT * FROM meetings WHERE 1=1';
    const params = [];
    if (!isAdmin(req.user)) {
      sql += ' AND (requester_id = ? OR recipient_id = ?)';
      params.push(req.user.id, req.user.id);
    }
    sql += ' ORDER BY date DESC LIMIT 200';
    const meetings = await all(sql, params);
    res.json({ success: true, count: meetings.length, meetings });
  } catch (err) {
    next(err);
  }
});

// POST /api/sangam/meetings  (requester is always the caller)
router.post('/meetings', requireAuth, async (req, res, next) => {
  try {
    const recipient = await get("SELECT id, name FROM members WHERE id = ? AND status = 'active'", [str(req.body.recipient_id, 40)]);
    if (!recipient) return bad(res, 'सदस्य सापडला नाही.', 'RECIPIENT_NOT_FOUND');
    if (recipient.id === req.user.id) return bad(res, 'आपण स्वतःशी भेट नियोजित करू शकत नाही.');

    const id = 'MT-' + crypto.randomBytes(6).toString('hex');
    await runQuery(`
      INSERT INTO meetings (id, requester_id, requester_name, recipient_id, recipient_name, date, time, topic, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?, datetime('now'))
    `, [id, req.user.id, req.user.name, recipient.id, recipient.name,
        str(req.body.date, 20) || new Date().toISOString().slice(0, 10), str(req.body.time, 30) || 'सकाळी ११:००',
        str(req.body.topic, 200) || 'व्यवसाय संगम १-टू-१ चर्चा', str(req.body.notes, 500)]);
    const created = await get('SELECT * FROM meetings WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'भेट नियोजित केली!', meeting: created });
  } catch (err) {
    next(err);
  }
});

// GET /api/sangam/metrics  (aggregate, real numbers only)
router.get('/metrics', async (req, res, next) => {
  try {
    const totalReferrals = await get('SELECT COUNT(*) as count FROM referrals');
    const wonDeals = await get("SELECT COUNT(*) as count, COALESCE(SUM(value), 0) as \"totalValue\" FROM referrals WHERE status = 'Deal Won'");
    const totalMeetings = await get('SELECT COUNT(*) as count FROM meetings');

    res.json({
      success: true,
      metrics: {
        totalReferrals: totalReferrals.count,
        wonDeals: wonDeals.count,
        totalBusinessValue: wonDeals.totalValue,
        totalMeetings: totalMeetings.count
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
