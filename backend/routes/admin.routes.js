import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/metrics
router.get('/metrics', async (req, res, next) => {
  try {
    const membersCount = await get('SELECT COUNT(*) as count FROM members');
    const businessesCount = await get('SELECT COUNT(*) as count FROM businesses');
    const referralsCount = await get('SELECT COUNT(*) as count FROM referrals');
    const donationsSum = await get('SELECT SUM(collected) as totalCollected, SUM(donors) as totalDonors FROM campaigns');
    const eventsCount = await get('SELECT COUNT(*) as count FROM events');
    const postsCount = await get('SELECT COUNT(*) as count FROM posts');

    res.json({
      success: true,
      metrics: {
        totalMembers: membersCount.count || 24000,
        totalBusinesses: businessesCount.count || 2540,
        totalReferrals: referralsCount.count || 480,
        totalDonationsAmount: donationsSum.totalCollected || 3345000,
        totalDonors: donationsSum.totalDonors || 13490,
        totalEvents: eventsCount.count || 48,
        totalPosts: postsCount.count || 120,
        serverStatus: 'Online',
        dbEngine: 'SQLite3 (Pure SQL Native / ACID Compliant)',
        uptime: process.uptime()
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = [
      { id: 'LOG-01', user_name: 'अमोल जाधव (Admin)', action: 'सदस्य पडताळणी मंजूर', details: 'M1008 - विकास गायकवाड यांचे KYC मंजूर केले', created_at: '२ तासांपूर्वी' },
      { id: 'LOG-02', user_name: 'प्रिया देशमुख', action: 'व्यवसाय नोंदणी', details: 'B06 - वीरशैली सॉफ्टवेअर लिस्टिंग मंजूर', created_at: '५ तासांपूर्वी' },
      { id: 'LOG-03', user_name: 'सिस्टम', action: 'स्वयंचलित बॅकअप', details: 'SQLite डेटाबेस बॅकअप यशस्वीरित्या पूर्ण', created_at: 'काल रात्री १२:००' }
    ];
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/verify-member/:id
router.post('/verify-member/:id', authenticateToken, async (req, res, next) => {
  try {
    const role = String(req.user?.role || '').toLowerCase();
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(403).json({ success: false, error: 'फक्त प्रशासकांना परवानगी आहे. (Admins only)' });
    }
    const { status } = req.body;
    await runQuery('UPDATE members SET verified_profile = ? WHERE id = ?', [status ? 1 : 0, req.params.id]);
    res.json({ success: true, message: 'सदस्य पडताळणी स्थिती बदलली!' });
  } catch (err) {
    next(err);
  }
});

// ---------- Admin user list (website admin dashboard) ----------
// Admins only: these replies include members' email and phone.
const ADMIN_ROLES = ['admin', 'superadmin', 'ceo'];
function requireAdmin(req, res, next) {
  const role = String(req.user?.role || '').toLowerCase();
  if (!ADMIN_ROLES.includes(role)) {
    return res.status(403).json({ success: false, code: 'ADMIN_ONLY', error: 'फक्त प्रशासकांना परवानगी आहे. (Admins only)' });
  }
  next();
}


// Every column except the password hash (column sets differ between the SQLite and PostgreSQL databases).
function adminUserJson(row) {
  const { password_hash: _omit, ...m } = row;
  const verified = Number(m.verified_profile) === 1;
  return { ...m, verified, verificationStatus: verified ? 'प्रमाणित (Verified)' : 'प्रलंबित (Pending)' };
}

// GET /api/admin/users?search=&role=&verified=
router.get('/users', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const rows = (await all(`SELECT * FROM members ORDER BY created_at DESC`)).map(adminUserJson);

    let users = rows;
    const search = String(req.query.search || '').trim().toLowerCase();
    if (search) {
      users = users.filter((u) => [u.id, u.name, u.email, u.phone, u.district, u.city]
        .some((v) => String(v || '').toLowerCase().includes(search)));
    }
    const role = String(req.query.role || '');
    if (role && role !== 'all') users = users.filter((u) => String(u.role || 'member').toLowerCase() === role.toLowerCase());
    const verified = String(req.query.verified || '');
    if (verified === 'true' || verified === 'false') users = users.filter((u) => u.verified === (verified === 'true'));

    const countRole = (...r) => rows.filter((u) => r.includes(String(u.role || '').toLowerCase())).length;
    const stats = {
      total: rows.length,
      activeUsersNow: rows.length,
      superadmins: countRole('superadmin'),
      admins: countRole('admin', 'ceo'),
      districtHeads: countRole('district_admin', 'district_head'),
      chapterPresidents: countRole('chapter_president', 'chapter_head'),
      verifiedMembers: rows.filter((u) => u.verified).length,
      pendingVerifications: rows.filter((u) => !u.verified).length,
    };
    res.json({ success: true, data: { users, stats } });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/users/:id
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const m = await get(`SELECT * FROM members WHERE id = ?`, [req.params.id]);
    if (!m) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'सदस्य आढळला नाही.' });
    res.json({ success: true, data: { user: adminUserJson(m) }, user: adminUserJson(m) });
  } catch (err) {
    next(err);
  }
});

export default router;
