import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';

const router = Router();

// GET /api/businesses
router.get('/', async (req, res) => {
  try {
    const { cat, category, district, search } = req.query;
    let sql = 'SELECT * FROM businesses WHERE 1=1';
    const params = [];

    const finalCat = cat || category;
    if (finalCat && finalCat !== 'all' && finalCat !== 'सर्व') {
      sql += ' AND cat = ?';
      params.push(finalCat);
    }
    if (district && district !== 'सर्व') {
      sql += ' AND district = ?';
      params.push(district);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR owner LIKE ? OR services LIKE ? OR city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY rating DESC';
    const rows = await all(sql, params);

    const formatted = rows.map(b => {
      try {
        b.services = JSON.parse(b.services || '[]');
      } catch {
        b.services = [];
      }
      return b;
    });

    res.json({ success: true, count: formatted.length, businesses: formatted, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/businesses/:id
router.get('/:id', async (req, res) => {
  try {
    const business = await get('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    if (!business) {
      return res.status(404).json({ success: false, error: 'व्यवसाय सापडला नाही.' });
    }

    try {
      business.services = JSON.parse(business.services || '[]');
    } catch {
      business.services = [];
    }

    const reviews = await all('SELECT * FROM business_reviews WHERE business_id = ? ORDER BY created_at DESC', [req.params.id]);
    business.reviews = reviews;

    res.json({ success: true, business, data: business });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/businesses
router.post('/', async (req, res) => {
  try {
    const { name, owner, cat, category, city, district, phone, whatsapp, website, hours, services, offers } = req.body;
    const finalCat = cat || category;

    if (!name || (!owner && !req.body.ownerName) || !finalCat) {
      return res.status(400).json({ success: false, error: 'व्यवसायाचे नाव, मालकाचे नाव आणि वर्गवारी आवश्यक आहे.' });
    }

    const id = 'B' + Math.floor(10 + Math.random() * 90);
    const servicesJson = Array.isArray(services) ? JSON.stringify(services) : JSON.stringify(services ? [services] : []);
    const photo = finalCat === 'restaurant' ? '🍛' : finalCat === 'it' ? '💻' : finalCat === 'manufacturing' ? '⚙️' : finalCat === 'travel' ? '🚌' : '🏢';

    await runQuery(`
      INSERT INTO businesses (id, name, owner, cat, city, district, photo, phone, whatsapp, website, hours, services, offers, rating, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, datetime('now'))
    `, [id, name, owner || req.body.ownerName || 'मराठा उद्योजक', finalCat, city || 'पुणे', district || 'पुणे', photo, phone || '', whatsapp || '', website || '', hours || 'सकाळी ९ ते रात्री ८', servicesJson, offers || '']);

    const created = await get('SELECT * FROM businesses WHERE id = ?', [id]);
    try {
      created.services = JSON.parse(created.services || '[]');
    } catch {
      created.services = [];
    }

    res.status(201).json({ success: true, message: 'व्यवसाय यशस्वीरित्या नोंदवला गेला!', business: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/businesses/my - Fetch my businesses
router.get('/my', async (req, res) => {
  try {
    const ownerId = req.user?.id || req.query.owner_id;
    let sql = 'SELECT * FROM businesses WHERE 1=1';
    const params = [];
    if (ownerId) {
      sql += ' AND (owner_id = ? OR owner = ?)';
      params.push(ownerId, req.user?.name || ownerId);
    }
    sql += ' ORDER BY created_at DESC';
    const rows = await all(sql, params);
    const formatted = rows.map(b => {
      try { b.services = JSON.parse(b.services || '[]'); } catch { b.services = []; }
      return b;
    });
    res.json({ success: true, count: formatted.length, businesses: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/businesses/admin/pending - Fetch pending businesses for moderation
router.get('/admin/pending', async (req, res) => {
  try {
    const rows = await all("SELECT * FROM businesses WHERE status = 'pending' ORDER BY created_at DESC");
    const formatted = rows.map(b => {
      try { b.services = JSON.parse(b.services || '[]'); } catch { b.services = []; }
      return b;
    });
    res.json({ success: true, count: formatted.length, businesses: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/businesses/:id/moderation - Moderate business (approve, reject, verify)
router.patch('/:id/moderation', async (req, res) => {
  try {
    const { status, rejectionReason, verifiedPartner } = req.body;
    await runQuery(`
      UPDATE businesses 
      SET status = COALESCE(?, status), 
          verified_partner = COALESCE(?, verified_partner), 
          rejection_reason = COALESCE(?, rejection_reason)
      WHERE id = ?
    `, [status || null, verifiedPartner ? 1 : 0, rejectionReason || null, req.params.id]);

    const updated = await get('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'व्यवसाय पडताळणी स्थिती यशस्वीपणे अद्ययावत केली!', business: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/businesses/:id - Update business details
router.put('/:id', async (req, res) => {
  try {
    const { name, owner, cat, category, city, district, phone, whatsapp, website, hours, services, offers } = req.body;
    const finalCat = cat || category;
    const servicesJson = Array.isArray(services) ? JSON.stringify(services) : (services ? JSON.stringify([services]) : '[]');

    await runQuery(`
      UPDATE businesses
      SET name = COALESCE(?, name),
          owner = COALESCE(?, owner),
          cat = COALESCE(?, cat),
          city = COALESCE(?, city),
          district = COALESCE(?, district),
          phone = COALESCE(?, phone),
          whatsapp = COALESCE(?, whatsapp),
          website = COALESCE(?, website),
          hours = COALESCE(?, hours),
          services = COALESCE(?, services),
          offers = COALESCE(?, offers)
      WHERE id = ?
    `, [name || null, owner || null, finalCat || null, city || null, district || null, phone || null, whatsapp || null, website || null, hours || null, servicesJson, offers || null, req.params.id]);

    const updated = await get('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'व्यवसाय तपशील यशस्वीपणे अद्ययावत केले!', business: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/businesses/:id/enquiry - Send customer enquiry to business
router.post('/:id/enquiry', async (req, res) => {
  try {
    const { name, phone, email, message, requirement } = req.body;
    const enquiryId = 'ENQ-' + Date.now();
    await runQuery(`
      CREATE TABLE IF NOT EXISTS business_enquiries (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        sender_phone TEXT,
        sender_email TEXT,
        message TEXT,
        status TEXT DEFAULT 'New',
        created_at TEXT
      )
    `);

    await runQuery(`
      INSERT INTO business_enquiries (id, business_id, sender_name, sender_phone, sender_email, message, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'New', datetime('now'))
    `, [enquiryId, req.params.id, name || 'ग्राहक', phone || '', email || '', message || requirement || '']);

    res.status(201).json({ success: true, message: 'चौकशी यशस्वीरीत्या पाठवली गेली!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/businesses/:id/enquiries - View enquiries for a business
router.get('/:id/enquiries', async (req, res) => {
  try {
    const enquiries = await all('SELECT * FROM business_enquiries WHERE business_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json({ success: true, count: enquiries.length, enquiries });
  } catch (err) {
    res.json({ success: true, count: 0, enquiries: [] });
  }
});

export default router;
