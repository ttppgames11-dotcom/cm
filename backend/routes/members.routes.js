import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { requireAuth, ROLES } from '../middleware/auth.js';
import { str, bad } from '../middleware/validate.js';

const router = Router();

const isStaff = (user) => [ROLES.ADMIN, ROLES.MODERATOR].includes(user.role);

function parseList(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// GET /api/members  (members only; no contact details, blocked users hidden)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { district, profession, search, tier } = req.query;
    let sql = `SELECT id, name, avatar, city, district, state, profession, business, skills, education, about, tier, role, joined
               FROM members WHERE status = 'active'
               AND id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ?)
               AND id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = ?)`;
    const params = [req.user.id, req.user.id];

    if (district && district !== 'सर्व') {
      sql += ' AND district = ?';
      params.push(str(district, 60));
    }
    if (tier) {
      sql += ' AND tier = ?';
      params.push(str(tier, 30));
    }
    if (profession) {
      sql += ' AND profession LIKE ?';
      params.push(`%${str(profession, 60)}%`);
    }
    if (search) {
      const q = `%${str(search, 60)}%`;
      sql += ' AND (name LIKE ? OR profession LIKE ? OR business LIKE ? OR city LIKE ?)';
      params.push(q, q, q, q);
    }

    sql += ' ORDER BY id ASC LIMIT 200';
    const members = (await all(sql, params)).map((m) => ({ ...m, skills: parseList(m.skills) }));

    res.json({ success: true, count: members.length, members });
  } catch (err) {
    next(err);
  }
});

// GET /api/members/stats and /api/members/stats/summary (aggregate counts, public)
const getStatsHandler = async (req, res, next) => {
  try {
    const totalCount = await get("SELECT COUNT(*) as count FROM members WHERE status = 'active'");
    const goldCount = await get("SELECT COUNT(*) as count FROM members WHERE tier = 'Gold' AND status = 'active'");
    const platCount = await get("SELECT COUNT(*) as count FROM members WHERE tier = 'Platinum' AND status = 'active'");
    const districtCount = await get("SELECT COUNT(DISTINCT district) as count FROM members WHERE status = 'active'");

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

// GET /api/members/:id  (email/phone only for the owner or staff)
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const member = await get(`
      SELECT id, name, email, phone, avatar, city, district, state, country, profession, business, skills, education, interests, about, tier, role, verified_mobile, verified_email, verified_profile, joined, status
      FROM members WHERE id = ?
    `, [req.params.id]);

    if (!member || (member.status !== 'active' && !isStaff(req.user) && member.id !== req.user.id)) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'सदस्य आढळला नाही.' });
    }

    const blocked = await get(
      'SELECT 1 AS x FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)',
      [req.user.id, member.id, member.id, req.user.id]
    );
    if (blocked && !isStaff(req.user)) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'सदस्य आढळला नाही.' });
    }

    if (member.id !== req.user.id && !isStaff(req.user)) {
      delete member.email;
      delete member.phone;
    }
    delete member.status;
    member.skills = parseList(member.skills);
    member.interests = parseList(member.interests);

    res.json({ success: true, member });
  } catch (err) {
    next(err);
  }
});

// PUT /api/members/:id  (own profile only; role/tier/status can never be set here)
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    if (req.params.id !== req.user.id && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ success: false, code: 'FORBIDDEN', error: 'ही कृती करण्याची आपल्याला परवानगी नाही.' });
    }
    const member = await get('SELECT id FROM members WHERE id = ?', [req.params.id]);
    if (!member) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'सदस्य सापडला नाही.' });
    }

    const b = req.body;
    const text = (v, max) => (v === undefined ? null : str(v, max));
    const name = text(b.name, 100);
    if (name !== null && !name) return bad(res, 'नाव रिकामे असू शकत नाही.');
    const phone = text(b.phone, 20);
    if (phone) {
      if (!/^[+0-9][0-9\s-]{6,18}$/.test(phone)) return bad(res, 'कृपया वैध मोबाईल नंबर प्रविष्ट करा.', 'INVALID_PHONE');
      const taken = await get('SELECT id FROM members WHERE phone = ? AND id <> ?', [phone, req.params.id]);
      if (taken) return res.status(409).json({ success: false, code: 'PHONE_IN_USE', error: 'हा मोबाईल नंबर आधीच वापरात आहे.' });
    }
    const skillsJson = Array.isArray(b.skills) ? JSON.stringify(b.skills.slice(0, 30).map((s) => str(s, 60))) : null;

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
    `, [name, text(b.city, 100), text(b.district, 60), text(b.profession, 100), text(b.business, 100),
        skillsJson, text(b.education, 100), text(b.about, 1000), phone, req.params.id]);

    const updated = await get('SELECT id, name, email, phone, avatar, city, district, profession, business, skills, education, about, tier, role FROM members WHERE id = ?', [req.params.id]);
    updated.skills = parseList(updated.skills);

    res.json({ success: true, message: 'माहिती अद्ययावत केली!', member: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
