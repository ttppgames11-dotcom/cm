import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { requireStaff, requireAdmin, auditLog, revokeAllSessions } from '../middleware/auth.js';
import { str, int, bad } from '../middleware/validate.js';

const router = Router();

// GET /api/admin/metrics  (staff)
router.get('/metrics', requireStaff, async (req, res, next) => {
  try {
    const count = async (sql) => (await get(sql)).count;
    const donationsSum = await get('SELECT COALESCE(SUM(collected), 0) as "totalCollected", COALESCE(SUM(donors), 0) as "totalDonors" FROM campaigns');

    res.json({
      success: true,
      metrics: {
        totalMembers: await count('SELECT COUNT(*) as count FROM members'),
        totalBusinesses: await count('SELECT COUNT(*) as count FROM businesses'),
        totalReferrals: await count('SELECT COUNT(*) as count FROM referrals'),
        totalDonationsAmount: donationsSum.totalCollected,
        totalDonors: donationsSum.totalDonors,
        totalEvents: await count('SELECT COUNT(*) as count FROM events'),
        totalPosts: await count('SELECT COUNT(*) as count FROM posts'),
        openReports: await count("SELECT COUNT(*) as count FROM reports WHERE status = 'open'"),
        serverStatus: 'Online',
        dbEngine: 'PostgreSQL',
        uptime: process.uptime()
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/audit-logs  (admin)
router.get('/audit-logs', requireAdmin, async (req, res, next) => {
  try {
    const logs = await all('SELECT id, user_id, user_name, action, details, created_at FROM audit_logs ORDER BY created_at DESC LIMIT 200');
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/verify-member/:id  { status }  (admin)
router.post('/verify-member/:id', requireAdmin, async (req, res, next) => {
  try {
    const member = await get('SELECT id FROM members WHERE id = ?', [req.params.id]);
    if (!member) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'सदस्य आढळला नाही.' });
    const status = req.body.status === true || req.body.status === 1;
    await runQuery('UPDATE members SET verified_profile = ? WHERE id = ?', [status ? 1 : 0, member.id]);
    await auditLog(req.user.id, req.user.name, 'verify_member', `${member.id} verified_profile=${status}`);
    res.json({ success: true, message: 'सदस्य पडताळणी स्थिती बदलली!' });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/reports?status=open  (staff moderation queue)
router.get('/reports', requireStaff, async (req, res, next) => {
  try {
    const status = str(req.query.status, 20) || 'open';
    const reports = await all(
      'SELECT * FROM reports WHERE status = ? ORDER BY created_at ASC LIMIT ?',
      [status, int(req.query.limit, { min: 1, max: 200, fallback: 50 })]
    );
    res.json({ success: true, count: reports.length, reports });
  } catch (err) {
    next(err);
  }
});

const HIDE_TABLE = { post: 'posts', comment: 'post_comments', business: 'businesses' };

// POST /api/admin/reports/:id/resolve  { action: dismiss | hide_content | suspend_user, note }
router.post('/reports/:id/resolve', requireStaff, async (req, res, next) => {
  try {
    const action = str(req.body.action, 20);
    if (!['dismiss', 'hide_content', 'suspend_user'].includes(action)) {
      return bad(res, 'अवैध कृती.', 'INVALID_ACTION');
    }
    const report = await get("SELECT * FROM reports WHERE id = ? AND status = 'open'", [req.params.id]);
    if (!report) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'तक्रार सापडली नाही.' });

    if (action === 'hide_content') {
      const table = HIDE_TABLE[report.target_type];
      if (!table) return bad(res, 'हा घटक लपवता येत नाही.', 'INVALID_ACTION');
      await runQuery(`UPDATE ${table} SET status = 'hidden' WHERE id = ?`, [report.target_id]);
    }

    if (action === 'suspend_user') {
      // Resolve the responsible member for the reported target.
      let memberId = null;
      if (report.target_type === 'member') memberId = report.target_id;
      else if (report.target_type === 'post') memberId = (await get('SELECT author_id AS m FROM posts WHERE id = ?', [report.target_id]))?.m;
      else if (report.target_type === 'comment') memberId = (await get('SELECT author_id AS m FROM post_comments WHERE id = ?', [report.target_id]))?.m;
      else if (report.target_type === 'business') memberId = (await get('SELECT owner_id AS m FROM businesses WHERE id = ?', [report.target_id]))?.m;
      const target = memberId ? await get('SELECT id, role FROM members WHERE id = ?', [memberId]) : null;
      if (!target) return bad(res, 'संबंधित सदस्य सापडला नाही.', 'INVALID_ACTION');
      if (target.role === 'admin' || target.id === req.user.id) {
        return res.status(403).json({ success: false, code: 'FORBIDDEN', error: 'या सदस्यावर कारवाई करता येत नाही.' });
      }
      await runQuery("UPDATE members SET status = 'suspended' WHERE id = ?", [target.id]);
      await revokeAllSessions(target.id);
      await auditLog(req.user.id, req.user.name, 'suspend_member', `${target.id} via report ${report.id}`);
    }

    await runQuery(
      "UPDATE reports SET status = ?, resolution = ?, resolved_by = ?, resolved_at = now() WHERE id = ?",
      [action === 'dismiss' ? 'dismissed' : 'actioned', `${action}: ${str(req.body.note, 300)}`, req.user.id, report.id]
    );
    await auditLog(req.user.id, req.user.name, 'resolve_report', `${report.id} (${report.target_type}:${report.target_id}) -> ${action}`);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/members/:id/suspend | unsuspend  (admin)
router.post('/members/:id/:action(suspend|unsuspend)', requireAdmin, async (req, res, next) => {
  try {
    const target = await get('SELECT id, role FROM members WHERE id = ?', [req.params.id]);
    if (!target) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'सदस्य आढळला नाही.' });
    if (target.id === req.user.id) return bad(res, 'आपण स्वतःवर ही कृती करू शकत नाही.', 'INVALID_ACTION');
    const suspend = req.params.action === 'suspend';
    await runQuery('UPDATE members SET status = ? WHERE id = ?', [suspend ? 'suspended' : 'active', target.id]);
    if (suspend) await revokeAllSessions(target.id);
    await auditLog(req.user.id, req.user.name, suspend ? 'suspend_member' : 'unsuspend_member', target.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
