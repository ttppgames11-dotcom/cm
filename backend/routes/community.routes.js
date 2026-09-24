import { Router } from 'express';
import crypto from 'crypto';
import { all, get, runQuery, transaction } from '../../database/database.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { str, bad } from '../middleware/validate.js';

const router = Router();

const REPORT_TARGETS = ['post', 'comment', 'member', 'business'];
const REPORT_REASONS = ['spam', 'abuse', 'harassment', 'hate', 'sexual', 'violence', 'misinformation', 'impersonation', 'other'];

// Content from users the viewer blocked (or who blocked the viewer) is hidden.
const HIDE_BLOCKED = `
  AND author_id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ?)
  AND author_id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = ?)`;

// GET /api/community/posts  (public feed; personalised when logged in)
router.get('/posts', optionalAuth, async (req, res, next) => {
  try {
    const groupId = str(req.query.groupId, 40);
    let sql = "SELECT * FROM posts WHERE status = 'visible'";
    const params = [];
    if (groupId) {
      sql += ' AND group_id = ?';
      params.push(groupId);
    }
    if (req.user) {
      sql += HIDE_BLOCKED;
      params.push(req.user.id, req.user.id);
    }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const posts = await all(sql, params);

    for (const post of posts) {
      let csql = "SELECT * FROM post_comments WHERE post_id = ? AND status = 'visible'";
      const cparams = [post.id];
      if (req.user) {
        csql += HIDE_BLOCKED;
        cparams.push(req.user.id, req.user.id);
      }
      post.comments = await all(csql + ' ORDER BY created_at ASC', cparams);
    }
    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/posts  (author is always the logged-in member)
router.post('/posts', requireAuth, async (req, res, next) => {
  try {
    const text = str(req.body.text, 2000);
    if (!text) {
      return bad(res, 'मजकूर आवश्यक आहे.');
    }
    const groupId = str(req.body.group_id, 40) || 'G09';
    const group = await get('SELECT id FROM groups WHERE id = ?', [groupId]);
    if (!group) return bad(res, 'गट सापडला नाही.', 'GROUP_NOT_FOUND');

    const author = await get('SELECT avatar FROM members WHERE id = ?', [req.user.id]);
    const id = 'P-' + crypto.randomBytes(6).toString('hex');
    await runQuery(`
      INSERT INTO posts (id, author_id, author_name, author_avatar, group_id, text, image, likes_count, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 'visible', datetime('now'))
    `, [id, req.user.id, req.user.name, author?.avatar || '👤', groupId, text, str(req.body.image, 500)]);
    const created = await get('SELECT * FROM posts WHERE id = ?', [id]);
    created.comments = [];
    res.status(201).json({ success: true, message: 'पोस्ट प्रसिद्ध झाली!', post: created });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/community/posts/:id  (author, or staff via /api/admin)
router.delete('/posts/:id', requireAuth, async (req, res, next) => {
  try {
    const post = await get('SELECT id, author_id FROM posts WHERE id = ?', [req.params.id]);
    if (!post) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'पोस्ट सापडली नाही.' });
    if (post.author_id !== req.user.id) {
      return res.status(403).json({ success: false, code: 'FORBIDDEN', error: 'ही कृती करण्याची आपल्याला परवानगी नाही.' });
    }
    await transaction(async (t) => {
      await t.runQuery('DELETE FROM post_likes WHERE post_id = ?', [post.id]);
      await t.runQuery('DELETE FROM post_comments WHERE post_id = ?', [post.id]);
      await t.runQuery('DELETE FROM posts WHERE id = ?', [post.id]);
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/posts/:id/like  (toggle; one like per member)
router.post('/posts/:id/like', requireAuth, async (req, res, next) => {
  try {
    const post = await get("SELECT id FROM posts WHERE id = ? AND status = 'visible'", [req.params.id]);
    if (!post) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'पोस्ट सापडली नाही.' });

    const liked = await transaction(async (t) => {
      const existing = await t.get('SELECT id FROM post_likes WHERE post_id = ? AND member_id = ?', [post.id, req.user.id]);
      if (existing) {
        await t.runQuery('DELETE FROM post_likes WHERE id = ?', [existing.id]);
        await t.runQuery('UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?', [post.id]);
        return false;
      }
      await t.runQuery('INSERT INTO post_likes (id, post_id, member_id) VALUES (?, ?, ?)', ['L-' + crypto.randomBytes(6).toString('hex'), post.id, req.user.id]);
      await t.runQuery('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [post.id]);
      return true;
    });
    const updated = await get('SELECT id, likes_count FROM posts WHERE id = ?', [post.id]);
    res.json({ success: true, liked, likes_count: updated.likes_count });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/posts/:id/comments
router.post('/posts/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const text = str(req.body.text, 1000);
    if (!text) {
      return bad(res, 'प्रतिक्रिया आवश्यक आहे.');
    }
    const post = await get("SELECT id FROM posts WHERE id = ? AND status = 'visible'", [req.params.id]);
    if (!post) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'पोस्ट सापडली नाही.' });

    await runQuery(`
      INSERT INTO post_comments (id, post_id, author_id, author_name, text, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'visible', datetime('now'))
    `, ['CMM-' + crypto.randomBytes(6).toString('hex'), post.id, req.user.id, req.user.name, text]);
    const comments = await all("SELECT * FROM post_comments WHERE post_id = ? AND status = 'visible' ORDER BY created_at ASC", [post.id]);
    res.status(201).json({ success: true, message: 'प्रतिक्रिया जोडली!', comments });
  } catch (err) {
    next(err);
  }
});

// GET /api/community/groups
router.get('/groups', async (req, res, next) => {
  try {
    const { type, district } = req.query;
    let sql = 'SELECT * FROM groups WHERE 1=1';
    const params = [];
    if (type) {
      sql += ' AND type = ?';
      params.push(str(type, 30));
    }
    if (district && district !== 'सर्व') {
      sql += ' AND district = ?';
      params.push(str(district, 60));
    }
    sql += ' ORDER BY members_count DESC';
    const groups = await all(sql, params);
    res.json({ success: true, count: groups.length, groups });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/groups/:id/join  (idempotent)
router.post('/groups/:id/join', requireAuth, async (req, res, next) => {
  try {
    const group = await get('SELECT id FROM groups WHERE id = ?', [req.params.id]);
    if (!group) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'गट सापडला नाही.' });

    await transaction(async (t) => {
      const already = await t.get('SELECT id FROM group_members WHERE group_id = ? AND member_id = ?', [group.id, req.user.id]);
      if (already) return;
      await t.runQuery("INSERT INTO group_members (id, group_id, member_id, joined_at) VALUES (?, ?, ?, datetime('now'))", ['GM-' + crypto.randomBytes(6).toString('hex'), group.id, req.user.id]);
      await t.runQuery('UPDATE groups SET members_count = members_count + 1 WHERE id = ?', [group.id]);
    });
    res.json({ success: true, message: 'गटात यशस्वीरित्या सामील झालात!' });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/report  { target_type, target_id, reason, details }
router.post('/report', requireAuth, async (req, res, next) => {
  try {
    const targetType = str(req.body.target_type, 20);
    const targetId = str(req.body.target_id, 60);
    const reason = str(req.body.reason, 30);
    if (!REPORT_TARGETS.includes(targetType) || !targetId || !REPORT_REASONS.includes(reason)) {
      return bad(res, 'अवैध तक्रार. कृपया कारण निवडा.', 'INVALID_REPORT');
    }
    if (targetType === 'member' && targetId === req.user.id) {
      return bad(res, 'आपण स्वतःची तक्रार करू शकत नाही.', 'INVALID_REPORT');
    }
    const table = { post: 'posts', comment: 'post_comments', member: 'members', business: 'businesses' }[targetType];
    const idColumn = 'id';
    const exists = await get(`SELECT ${idColumn} FROM ${table} WHERE id = ?`, [targetId]);
    if (!exists) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'सामग्री सापडली नाही.' });

    const dup = await get("SELECT id FROM reports WHERE reporter_id = ? AND target_type = ? AND target_id = ? AND status = 'open'", [req.user.id, targetType, targetId]);
    if (!dup) {
      await runQuery(
        'INSERT INTO reports (id, reporter_id, target_type, target_id, reason, details) VALUES (?, ?, ?, ?, ?, ?)',
        ['RPT-' + crypto.randomBytes(6).toString('hex'), req.user.id, targetType, targetId, reason, str(req.body.details, 500)]
      );
    }
    res.status(201).json({ success: true, message: 'तक्रार नोंदवली गेली. आमची टीम ती तपासेल.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/community/blocks  -> members the caller has blocked
router.get('/blocks', requireAuth, async (req, res, next) => {
  try {
    const blocks = await all(
      'SELECT m.id, m.name, m.avatar FROM blocks b JOIN members m ON m.id = b.blocked_id WHERE b.blocker_id = ? ORDER BY b.created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, count: blocks.length, blocks });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/blocks/:memberId
router.post('/blocks/:memberId', requireAuth, async (req, res, next) => {
  try {
    if (req.params.memberId === req.user.id) return bad(res, 'आपण स्वतःला ब्लॉक करू शकत नाही.', 'INVALID_BLOCK');
    const target = await get('SELECT id FROM members WHERE id = ?', [req.params.memberId]);
    if (!target) return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'सदस्य आढळला नाही.' });
    await runQuery('INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?) ON CONFLICT DO NOTHING', [req.user.id, target.id]);
    res.status(201).json({ success: true, message: 'सदस्य ब्लॉक केला.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/community/blocks/:memberId
router.delete('/blocks/:memberId', requireAuth, async (req, res, next) => {
  try {
    await runQuery('DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?', [req.user.id, req.params.memberId]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
