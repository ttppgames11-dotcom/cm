import { Router } from 'express';
import { all, get, runQuery } from '../db/database.js';

const router = Router();

// GET /api/businesses
router.get('/', async (req, res, next) => {
  try {
    const { cat, district, search } = req.query;
    let sql = 'SELECT * FROM businesses WHERE 1=1';
    const params = [];

    if (cat && cat !== 'all') {
      sql += ' AND cat = ?';
      params.push(cat);
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

    res.json({ success: true, count: formatted.length, businesses: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/businesses/:id
router.get('/:id', async (req, res, next) => {
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

    res.json({ success: true, business });
  } catch (err) {
    next(err);
  }
});

// POST /api/businesses
router.post('/', async (req, res, next) => {
  try {
    const { name, owner, cat, city, district, phone, whatsapp, website, hours, services, offers } = req.body;

    if (!name || !owner || !cat) {
      return res.status(400).json({ success: false, error: 'व्यवसायाचे नाव, मालकाचे नाव आणि वर्गवारी आवश्यक आहे.' });
    }

    const id = 'B' + Math.floor(10 + Math.random() * 90);
    const servicesJson = Array.isArray(services) ? JSON.stringify(services) : JSON.stringify(services ? [services] : []);
    const photo = cat === 'restaurant' ? '🍛' : cat === 'it' ? '💻' : cat === 'manufacturing' ? '⚙️' : cat === 'travel' ? '🚌' : '🏢';

    await runQuery(`
      INSERT INTO businesses (id, name, owner, cat, city, district, photo, phone, whatsapp, website, hours, services, offers, rating, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, datetime('now'))
    `, [id, name, owner, cat, city || 'पुणे', district || 'पुणे', photo, phone || '', whatsapp || '', website || '', hours || 'सकाळी ९ ते रात्री ८', servicesJson, offers || '']);

    const created = await get('SELECT * FROM businesses WHERE id = ?', [id]);
    try {
      created.services = JSON.parse(created.services || '[]');
    } catch {
      created.services = [];
    }

    res.status(201).json({ success: true, message: 'व्यवसाय यशस्वीरित्या नोंदवला गेला!', business: created });
  } catch (err) {
    next(err);
  }
});

// POST /api/businesses/:id/reviews
router.post('/:id/reviews', async (req, res, next) => {
  try {
    const { member_name, rating, text } = req.body;
    const reviewId = 'REV-' + Date.now();

    await runQuery(`
      INSERT INTO business_reviews (id, business_id, member_name, rating, text, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `, [reviewId, req.params.id, member_name || 'सदस्य', rating || 5, text || '']);

    res.status(201).json({ success: true, message: 'अभिप्राय नोंदवला गेला!' });
  } catch (err) {
    next(err);
  }
});

export default router;
