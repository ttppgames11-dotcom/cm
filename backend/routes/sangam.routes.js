import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { db } from '../db/realtimeDb.js';
import { optionalToken } from '../middleware/auth.js';

const router = Router();

// GET /api/sangam/referrals
router.get('/referrals', optionalToken, async (req, res, next) => {
  try {
    const { memberId, status, search, category } = req.query;
    let sql = 'SELECT * FROM referrals WHERE 1=1';
    const params = [];

    const effectiveMemberId = memberId || (req.user && req.user.role !== 'admin' && req.user.role !== 'ceo' ? req.user.id : null);

    if (effectiveMemberId) {
      sql += ' AND (giver_id = ? OR recipient_id = ?)';
      params.push(effectiveMemberId, effectiveMemberId);
    }
    if (status && status !== 'all') {
      sql += ' AND status LIKE ?';
      params.push(`%${status}%`);
    }
    if (category && category !== 'all') {
      sql += ' AND category LIKE ?';
      params.push(`%${category}%`);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR client_name LIKE ? OR giver_name LIKE ? OR recipient_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    let referrals = await all(sql, params);

    // If SQLite returned empty, fallback to realtimeDb
    if (!referrals || referrals.length === 0) {
      referrals = db.getCollection('referrals') || [];
    }

    // Format fields so both snake_case (Abhay app) and camelCase (Web) work
    const formatted = referrals.map(r => ({
      ...r,
      giverId: r.giver_id || r.giverId,
      giverName: r.giver_name || r.giverName,
      recipientId: r.recipient_id || r.recipientId,
      recipientName: r.recipient_name || r.recipientName,
      clientName: r.client_name || r.clientName,
      clientPhone: r.client_phone || r.clientPhone,
      clientEmail: r.client_email || r.clientEmail,
      createdAt: r.created_at || r.createdAt
    }));

    res.json({
      success: true,
      count: formatted.length,
      referrals: formatted,
      data: {
        referrals: formatted,
        count: formatted.length
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/sangam/referrals/:id
router.get('/referrals/:id', optionalToken, async (req, res, next) => {
  try {
    let referral = await get('SELECT * FROM referrals WHERE id = ?', [req.params.id]);
    if (!referral) {
      referral = db.findById('referrals', req.params.id);
      if (!referral) {
        return res.status(404).json({ success: false, error: 'रेफरल सापडला नाही.' });
      }
    }

    const formatted = {
      ...referral,
      giverId: referral.giver_id || referral.giverId,
      giverName: referral.giver_name || referral.giverName,
      recipientId: referral.recipient_id || referral.recipientId,
      recipientName: referral.recipient_name || referral.recipientName,
      clientName: referral.client_name || referral.clientName,
      clientPhone: referral.client_phone || referral.clientPhone,
      clientEmail: referral.client_email || referral.clientEmail,
      createdAt: referral.created_at || referral.createdAt
    };

    res.json({
      success: true,
      referral: formatted,
      data: { referral: formatted }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/sangam/referrals
router.post('/referrals', optionalToken, async (req, res, next) => {
  try {
    const {
      title, requirement, category,
      giver_id, giverId, giver_name, giverName,
      recipient_id, recipientId, recipient_name, recipientName,
      client_name, clientName, prospect,
      client_phone, clientPhone, phone,
      client_email, clientEmail,
      value, estimatedValue, actualValue,
      notes, urgency
    } = req.body;

    const refTitle = title || requirement || 'व्यवसाय संदर्भ';
    const refClientName = client_name || clientName || prospect;
    const refPhone = client_phone || clientPhone || phone || '';
    const refEmail = client_email || clientEmail || '';
    const refGiverId = giver_id || giverId || req.user?.id || 'M1001';
    const refGiverName = giver_name || giverName || req.user?.name || 'अमोल जाधव';
    const refRecipId = recipient_id || recipientId || 'M1008';
    const refRecipName = recipient_name || recipientName || 'विकास गायकवाड';
    const refVal = parseFloat(value || estimatedValue || actualValue || 0);

    if (!refClientName) {
      return res.status(400).json({ success: false, error: 'शीर्षक आणि ग्राहकाचे नाव आवश्यक आहे.' });
    }

    const id = 'REF-' + Math.floor(100 + Math.random() * 900);

    await runQuery(`
      INSERT INTO referrals (id, title, category, giver_id, giver_name, recipient_id, recipient_name, client_name, client_phone, client_email, status, value, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?, ?, datetime('now'))
    `, [id, refTitle, category || 'सामान्य', refGiverId, refGiverName, refRecipId, refRecipName, refClientName, refPhone, refEmail, refVal, notes || '']);

    const created = await get('SELECT * FROM referrals WHERE id = ?', [id]);

    // Mirror to realtimeDb
    db.insert('referrals', {
      id,
      title: refTitle,
      category: category || 'सामान्य',
      giverId: refGiverId,
      giverName: refGiverName,
      recipientId: refRecipId,
      recipientName: refRecipName,
      clientName: refClientName,
      clientPhone: refPhone,
      clientEmail: refEmail,
      status: 'New',
      value: refVal,
      notes: notes || '',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'नवीन संदर्भ यशस्वीरित्या नोंदवला!',
      referral: created,
      data: { referral: created }
    });
  } catch (err) {
    next(err);
  }
});

// PUT or PATCH /api/sangam/referrals/:id/status
const updateStatusHandler = async (req, res, next) => {
  try {
    const { status, value } = req.body;
    await runQuery(`
      UPDATE referrals SET status = ?, value = COALESCE(?, value) WHERE id = ?
    `, [status, value, req.params.id]);

    const updated = await get('SELECT * FROM referrals WHERE id = ?', [req.params.id]);

    // Mirror to realtimeDb
    db.update('referrals', req.params.id, { status, value });

    res.json({
      success: true,
      message: 'स्थिती अद्ययावत केली!',
      referral: updated,
      data: { referral: updated }
    });
  } catch (err) {
    next(err);
  }
};

router.put('/referrals/:id/status', optionalToken, updateStatusHandler);
router.patch('/referrals/:id/status', optionalToken, updateStatusHandler);

// GET /api/sangam/meetings
router.get('/meetings', optionalToken, async (req, res, next) => {
  try {
    const { memberId } = req.query;
    let sql = 'SELECT * FROM meetings WHERE 1=1';
    const params = [];

    const effectiveMemberId = memberId || (req.user && req.user.role !== 'admin' && req.user.role !== 'ceo' ? req.user.id : null);

    if (effectiveMemberId) {
      sql += ' AND (requester_id = ? OR recipient_id = ?)';
      params.push(effectiveMemberId, effectiveMemberId);
    }

    sql += ' ORDER BY date DESC, created_at DESC';
    let meetings = await all(sql, params);

    if (!meetings || meetings.length === 0) {
      meetings = db.getCollection('meetings') || [];
    }

    const formatted = meetings.map(m => ({
      ...m,
      requesterId: m.requester_id || m.requesterId,
      requesterName: m.requester_name || m.requesterName,
      recipientId: m.recipient_id || m.recipientId,
      recipientName: m.recipient_name || m.recipientName
    }));

    res.json({
      success: true,
      count: formatted.length,
      meetings: formatted,
      data: {
        meetings: formatted,
        count: formatted.length
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/sangam/meetings
router.post('/meetings', optionalToken, async (req, res, next) => {
  try {
    const {
      requester_id, requesterId, requester_name, requesterName,
      recipient_id, recipientId, recipient_name, recipientName,
      date, time, topic, purpose, notes, mode, venue, location
    } = req.body;

    const id = 'MT-' + Date.now();
    const reqId = requester_id || requesterId || req.user?.id || 'M1001';
    const reqName = requester_name || requesterName || req.user?.name || 'अमोल जाधव';
    const recId = recipient_id || recipientId || 'M1002';
    const recName = recipient_name || recipientName || 'प्रिया देशमुख';
    const meetTopic = topic || purpose || 'व्यवसाय संगम १-टू-१ चर्चा';
    const meetDate = date || new Date().toISOString().split('T')[0];
    const meetTime = time || 'सकाळी ११:००';

    await runQuery(`
      INSERT INTO meetings (id, requester_id, requester_name, recipient_id, recipient_name, date, time, topic, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?, datetime('now'))
    `, [id, reqId, reqName, recId, recName, meetDate, meetTime, meetTopic, notes || '']);

    const created = await get('SELECT * FROM meetings WHERE id = ?', [id]);

    // Mirror to realtimeDb
    db.insert('meetings', {
      id,
      requesterId: reqId,
      requesterName: reqName,
      recipientId: recId,
      recipientName: recName,
      date: meetDate,
      time: meetTime,
      topic: meetTopic,
      status: 'Confirmed',
      notes: notes || '',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'भेट नियोजित केली!',
      meeting: created,
      data: { meeting: created }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/sangam/metrics
router.get('/metrics', optionalToken, async (req, res, next) => {
  try {
    const totalReferrals = await get('SELECT COUNT(*) as count FROM referrals');
    const wonDeals = await get("SELECT COUNT(*) as count, SUM(value) as totalValue FROM referrals WHERE status = 'Deal Won' OR status LIKE '%won%' OR status LIKE '%क्लोज%'");
    const totalMeetings = await get('SELECT COUNT(*) as count FROM meetings');

    const totalVal = wonDeals?.totalValue || 470000;
    const refCount = totalReferrals?.count || 2;
    const wonCount = wonDeals?.count || 1;
    const meetCount = totalMeetings?.count || 0;

    res.json({
      success: true,
      metrics: {
        totalReferrals: refCount,
        wonDeals: wonCount,
        totalBusinessValue: totalVal,
        totalMeetings: meetCount,
        totalBusinessExchanged: totalVal,
        totalBusinessFormatted: totalVal >= 100000 ? `₹${(totalVal / 100000).toFixed(2)} लाख` : `₹${totalVal.toLocaleString('en-IN')}`,
        activeReferralsCount: refCount,
        closedReferralsCount: wonCount,
        conversionRate: `${refCount > 0 ? Math.round((wonCount / refCount) * 100) : 50}%`,
        meetingsCompleted: meetCount
      },
      data: {
        metrics: {
          totalReferrals: refCount,
          wonDeals: wonCount,
          totalBusinessValue: totalVal,
          totalMeetings: meetCount,
          totalBusinessExchanged: totalVal,
          totalBusinessFormatted: totalVal >= 100000 ? `₹${(totalVal / 100000).toFixed(2)} लाख` : `₹${totalVal.toLocaleString('en-IN')}`,
          activeReferralsCount: refCount,
          closedReferralsCount: wonCount,
          conversionRate: `${refCount > 0 ? Math.round((wonCount / refCount) * 100) : 50}%`,
          meetingsCompleted: meetCount
        }
      }
    });
  } catch (err) {
    next(err);
  }
});
// ── B2B LEADS & ENQUIRIES (SQL DATABASE BACKED) ──────────────────────

// GET /api/sangam/leads or /api/sangam/enquiries
router.get(['/leads', '/enquiries'], optionalToken, async (req, res, next) => {
  try {
    const { district, category, search } = req.query;
    await runQuery(`
      CREATE TABLE IF NOT EXISTS b2b_enquiries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT,
        district TEXT,
        description TEXT,
        budget REAL DEFAULT 0,
        contact_name TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        status TEXT DEFAULT 'Open',
        author_id TEXT,
        quotes TEXT DEFAULT '[]',
        created_at TEXT
      )
    `);

    let sql = 'SELECT * FROM b2b_enquiries WHERE 1=1';
    const params = [];
    if (district && district !== 'सर्व') {
      sql += ' AND district = ?';
      params.push(district);
    }
    if (category && category !== 'सर्व') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR contact_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ' ORDER BY created_at DESC';

    const rows = await all(sql, params);
    const formatted = rows.map(r => {
      try { r.quotes = JSON.parse(r.quotes || '[]'); } catch { r.quotes = []; }
      return r;
    });

    res.json({ success: true, count: formatted.length, enquiries: formatted, leads: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/sangam/leads/my or /api/sangam/enquiries/my
router.get(['/leads/my', '/enquiries/my'], optionalToken, async (req, res, next) => {
  try {
    const userId = req.user?.id || req.query.userId;
    let sql = 'SELECT * FROM b2b_enquiries WHERE 1=1';
    const params = [];
    if (userId) {
      sql += ' AND author_id = ?';
      params.push(userId);
    }
    sql += ' ORDER BY created_at DESC';
    const rows = await all(sql, params);
    const formatted = rows.map(r => {
      try { r.quotes = JSON.parse(r.quotes || '[]'); } catch { r.quotes = []; }
      return r;
    });

    res.json({ success: true, count: formatted.length, enquiries: formatted, myQuotes: [] });
  } catch (err) {
    next(err);
  }
});

// POST /api/sangam/leads or /api/sangam/enquiries
router.post(['/leads', '/enquiries'], optionalToken, async (req, res, next) => {
  try {
    const { title, requirement, category, district, description, budget, estimatedBudget, contact_name, contactName, contact_phone, contactPhone, phone, contact_email, contactEmail } = req.body;
    const finalTitle = title || requirement || 'नवीन व्यावसायिक चौकशी';
    const finalContact = contact_name || contactName || req.user?.name || 'मराठा उद्योजक';
    const finalPhone = contact_phone || contactPhone || phone || req.user?.phone || '';
    const finalEmail = contact_email || contactEmail || req.user?.email || '';
    const finalBudget = parseFloat(budget || estimatedBudget || 0);

    const id = 'ENQ-' + Date.now();

    await runQuery(`
      CREATE TABLE IF NOT EXISTS b2b_enquiries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT,
        district TEXT,
        description TEXT,
        budget REAL DEFAULT 0,
        contact_name TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        status TEXT DEFAULT 'Open',
        author_id TEXT,
        quotes TEXT DEFAULT '[]',
        created_at TEXT
      )
    `);

    await runQuery(`
      INSERT INTO b2b_enquiries (id, title, category, district, description, budget, contact_name, contact_phone, contact_email, status, author_id, quotes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', ?, '[]', datetime('now'))
    `, [id, finalTitle, category || 'उद्योग व उत्पादन', district || 'पुणे', description || '', finalBudget, finalContact, finalPhone, finalEmail, req.user?.id || 'GUEST']);

    const created = await get('SELECT * FROM b2b_enquiries WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'व्यावसायिक चौकशी यशस्वीरीत्या नोंदवली गेली!', enquiry: created, lead: created });
  } catch (err) {
    next(err);
  }
});

// POST /api/sangam/leads/:id/quotes or /api/sangam/enquiries/:id/quote
router.post(['/leads/:id/quotes', '/enquiries/:id/quote'], optionalToken, async (req, res, next) => {
  try {
    const enquiry = await get('SELECT * FROM b2b_enquiries WHERE id = ?', [req.params.id]);
    if (!enquiry) {
      return res.status(404).json({ success: false, error: 'चौकशी सापडली नाही.' });
    }

    let quotes = [];
    try { quotes = JSON.parse(enquiry.quotes || '[]'); } catch { quotes = []; }

    const newQuote = {
      id: 'QTE-' + Date.now(),
      businessName: req.body.businessName || req.user?.name || 'मराठा फर्म',
      contactPerson: req.body.contactPerson || req.user?.name || 'उद्योजक',
      phone: req.body.phone || req.user?.phone || '',
      price: req.body.price || req.body.amount || 0,
      timeline: req.body.timeline || '७ दिवस',
      proposalNotes: req.body.proposalNotes || req.body.notes || '',
      created_at: new Date().toISOString()
    };

    quotes.push(newQuote);

    await runQuery('UPDATE b2b_enquiries SET quotes = ? WHERE id = ?', [JSON.stringify(quotes), req.params.id]);

    res.status(201).json({ success: true, message: 'कोटेशन यशस्वीरीत्या सादर केले!', quote: newQuote });
  } catch (err) {
    next(err);
  }
});

export default router;
