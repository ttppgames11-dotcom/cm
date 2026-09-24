import { Router } from 'express';
import crypto from 'crypto';
import { all, get, runQuery } from '../../database/database.js';
import { requireAuth } from '../middleware/auth.js';
import { str, bad } from '../middleware/validate.js';

const router = Router();

// GET /api/businesses
router.get('/', async (req, res, next) => {
  try {
    const { cat, district, search } = req.query;
    let sql = "SELECT * FROM businesses WHERE status = 'visible'";
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
    const business = await get("SELECT * FROM businesses WHERE id = ? AND status = 'visible'", [req.params.id]);
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
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const name = str(req.body.name, 150);
    const cat = str(req.body.cat, 40);
    const owner = str(req.body.owner, 100) || req.user.name;
    if (!name || !cat) {
      return bad(res, 'व्यवसायाचे नाव आणि वर्गवारी आवश्यक आहे.');
    }

    const id = 'B-' + crypto.randomBytes(5).toString('hex');
    const services = Array.isArray(req.body.services) ? req.body.services.slice(0, 30).map((x) => str(x, 80)) : (req.body.services ? [str(req.body.services, 200)] : []);
    const photo = cat === 'restaurant' ? '🍛' : cat === 'it' ? '💻' : cat === 'manufacturing' ? '⚙️' : cat === 'travel' ? '🚌' : '🏢';

    await runQuery(`
      INSERT INTO businesses (id, name, owner, owner_id, cat, city, district, photo, phone, whatsapp, website, hours, services, offers, rating, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 'visible', datetime('now'))
    `, [id, name, owner, req.user.id, cat, str(req.body.city, 100) || 'पुणे', str(req.body.district, 60) || 'पुणे', photo,
        str(req.body.phone, 20), str(req.body.whatsapp, 20), str(req.body.website, 200),
        str(req.body.hours, 100) || 'सकाळी ९ ते रात्री ८', JSON.stringify(services), str(req.body.offers, 300)]);

    const created = await get('SELECT * FROM businesses WHERE id = ?', [id]);
    created.services = services;

    res.status(201).json({ success: true, message: 'व्यवसाय यशस्वीरित्या नोंदवला गेला!', business: created });
  } catch (err) {
    next(err);
  }
});

// POST /api/businesses/:id/reviews
router.post('/:id/reviews', requireAuth, async (req, res, next) => {
  try {
    const business = await get("SELECT id, owner_id FROM businesses WHERE id = ? AND status = 'visible'", [req.params.id]);
    if (!business) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'व्यवसाय सापडला नाही.' });
    if (business.owner_id === req.user.id) return bad(res, 'आपण स्वतःच्या व्यवसायाचे परीक्षण करू शकत नाही.', 'INVALID_REVIEW');

    const rating = Math.min(5, Math.max(1, parseInt(req.body.rating, 10) || 5));
    const dup = await get('SELECT id FROM business_reviews WHERE business_id = ? AND member_id = ?', [business.id, req.user.id]);
    if (dup) return res.status(409).json({ success: false, code: 'ALREADY_REVIEWED', error: 'आपण या व्यवसायाचे आधीच परीक्षण केले आहे.' });

    await runQuery(`
      INSERT INTO business_reviews (id, business_id, member_id, member_name, rating, text, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, ['REV-' + crypto.randomBytes(6).toString('hex'), business.id, req.user.id, req.user.name, rating, str(req.body.text, 1000)]);

    res.status(201).json({ success: true, message: 'अभिप्राय नोंदवला गेला!' });
  } catch (err) {
    next(err);
  }
});

export default router;

