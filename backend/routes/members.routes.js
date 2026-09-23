import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';

const router = Router();

// GET /api/members
router.get('/', async (req, res, next) => {
  try {
    const { district, profession, search, tier } = req.query;
    let sql = 'SELECT id, name, avatar, city, district, state, profession, business, skills, education, about, tier, role, joined FROM members WHERE 1=1';
    const params = [];

    if (district && district !== 'सर्व') {
      sql += ' AND district = ?';
      params.push(district);
    }
    if (tier) {
      sql += ' AND tier = ?';
      params.push(tier);
    }
    if (profession) {
      sql += ' AND profession LIKE ?';
      params.push(`%${profession}%`);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR profession LIKE ? OR business LIKE ? OR city LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY id ASC';
    const members = await all(sql, params);

    const formatted = members.map(m => {
      try {
        m.skills = JSON.parse(m.skills || '[]');
      } catch {
        m.skills = [];
      }
      return m;
    });

    res.json({ success: true, count: formatted.length, members: formatted });
  } catch (err) {
    next(err);
  }
});

// GET /api/members/stats and /api/members/stats/summary
const getStatsHandler = async (req, res, next) => {
  try {
    const totalCount = await get('SELECT COUNT(*) as count FROM members');
    const goldCount = await get("SELECT COUNT(*) as count FROM members WHERE tier = 'Gold'");
    const platCount = await get("SELECT COUNT(*) as count FROM members WHERE tier = 'Platinum'");
    const districtCount = await get('SELECT COUNT(DISTINCT district) as count FROM members');

    res.json({
      success: true,
      stats: {
        totalMembers: totalCount.count,
        goldMembers: goldCount.count,
        platinumMembers: platCount.count,
        activeDistricts: districtCount.count
      }
    });
  } catch (err) {
    next(err);
  }
};

router.get('/stats', getStatsHandler);
router.get('/stats/summary', getStatsHandler);

// GET /api/members/:id
router.get('/:id', async (req, res, next) => {
  try {
    const member = await get(`
      SELECT id, name, email, phone, avatar, city, district, state, country, profession, business, skills, education, interests, about, tier, role, verified_mobile, verified_email, verified_profile, joined 
      FROM members WHERE id = ?
    `, [req.params.id]);

    if (!member) {
      return res.status(404).json({ success: false, error: 'सदस्य आढळला नाही.' });
    }

    try {
      member.skills = JSON.parse(member.skills || '[]');
      member.interests = JSON.parse(member.interests || '[]');
    } catch {
      member.skills = [];
      member.interests = [];
    }

    res.json({ success: true, member });
  } catch (err) {
    next(err);
  }
});

// PUT /api/members/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, city, district, profession, business, skills, education, about, phone } = req.body;
    const member = await get('SELECT id FROM members WHERE id = ?', [req.params.id]);

    if (!member) {
      return res.status(404).json({ success: false, error: 'सदस्य सापडला नाही.' });
    }

    const skillsJson = Array.isArray(skills) ? JSON.stringify(skills) : undefined;

    await runQuery(`
      UPDATE members SET
        name = COALESCE(?, name),
        city = COALESCE(?, city),
        district = COALESCE(?, district),
        profession = COALESCE(?, profession),
        business = COALESCE(?, business),
        skills = COALESCE(?, skills),
        education = COALESCE(?, education),
        about = COALESCE(?, about),
        phone = COALESCE(?, phone)
      WHERE id = ?
    `, [name, city, district, profession, business, skillsJson, education, about, phone, req.params.id]);

    const updated = await get('SELECT id, name, email, phone, avatar, city, district, profession, business, skills, education, about, tier, role FROM members WHERE id = ?', [req.params.id]);
    try {
      updated.skills = JSON.parse(updated.skills || '[]');
    } catch {
      updated.skills = [];
    }

    res.json({ success: true, message: 'माहिती अद्ययावत केली!', member: updated });
  } catch (err) {
    next(err);
  }
});

export default router;

