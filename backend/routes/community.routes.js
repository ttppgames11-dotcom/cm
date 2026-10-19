import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';

const router = Router();

// ---------- Moderation (report / block), required by Google Play for UGC ----------
const REPORT_TARGETS = { post: 'posts', comment: 'post_comments', member: 'members', business: 'businesses' };
const REPORT_REASONS = ['spam', 'abuse', 'harassment', 'hate', 'sexual', 'violence', 'misinformation', 'impersonation', 'other'];

// Creates the moderation tables on first use (no-op when migration 002 already
// made them). Portable across PostgreSQL and the SQLite fallback.
let moderationReady = null;
function ensureModerationTables() {
  if (!moderationReady) {
    moderationReady = (async () => {
      await runQuery(`CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY, reporter_id TEXT NOT NULL, target_type TEXT NOT NULL,
        target_id TEXT NOT NULL, reason TEXT NOT NULL, details TEXT,
        status TEXT DEFAULT 'open', created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
      await runQuery(`CREATE TABLE IF NOT EXISTS blocks (
        blocker_id TEXT NOT NULL, blocked_id TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (blocker_id, blocked_id))`);
    })().catch((err) => {
      moderationReady = null;
      throw err;
    });
  }
  return moderationReady;
}

// GET /api/community/posts
router.get('/posts', optionalToken, async (req, res, next) => {
  try {
    const { groupId } = req.query;
    const currentUserId = req.user?.id || null;
    let sql = `
      SELECT p.*, m.photo AS author_photo,
        CASE WHEN CAST(? AS TEXT) IS NOT NULL AND pl.id IS NOT NULL THEN 1 ELSE 0 END AS is_liked
      FROM posts p
      LEFT JOIN members m ON p.author_id = m.id
      LEFT JOIN post_likes pl ON pl.post_id = p.id AND pl.member_id = CAST(? AS TEXT)
      WHERE 1=1
    `;
    const params = [currentUserId, currentUserId];

    // Hide posts and comments from members the viewer has blocked.
    const blockedFilter = (column) => ` AND ${column} NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ?)`;
    if (currentUserId) {
      await ensureModerationTables();
      sql += blockedFilter('p.author_id');
      params.push(currentUserId);
    }

    if (groupId) {
      sql += ' AND p.group_id = ?';
      params.push(groupId);
    }

    sql += ' ORDER BY p.created_at DESC';
    const posts = await all(sql, params);

    // Fetch comments for each post
    for (const post of posts) {
      post.comments = await all(`
        SELECT c.*, COALESCE(m.name, c.author_name) AS author_name, m.photo AS author_photo
        FROM post_comments c
        LEFT JOIN members m ON c.author_id = m.id
        WHERE c.post_id = ?${currentUserId ? blockedFilter('c.author_id') : ''}
        ORDER BY c.created_at ASC
      `, currentUserId ? [post.id, currentUserId] : [post.id]);
    }

    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/posts
router.post('/posts', authenticateToken, async (req, res, next) => {
  try {
    const { author_avatar, group_id, text, image, image_id } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'मजकूर आवश्यक आहे.' });
    }

    const id = 'P-' + Date.now();
    // The author is always the logged-in member, never a client-sent author_id.
    let finalAuthorId = req.user.id;
    let finalAuthorName = req.user.name || 'समाज सदस्य';
    let finalAuthorAvatar = author_avatar || '👤';

    if (finalAuthorId) {
      const member = await get('SELECT name, avatar FROM members WHERE id = ?', [finalAuthorId]);
      if (member) {
        finalAuthorName = member.name || finalAuthorName;
        finalAuthorAvatar = member.avatar || finalAuthorAvatar;
      }
    }

    // Support both 'image' (/media/xxx) and 'image_id' (xxx)
    let postImage = image || null;
    const rawImgId = image_id || req.body.image_id;
    if (rawImgId) {
      postImage = rawImgId.startsWith('/media/') ? rawImgId : `/media/${rawImgId}`;
    }

    await runQuery(`
      INSERT INTO posts (id, author_id, author_name, author_avatar, group_id, text, image, likes_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `, [id, finalAuthorId, finalAuthorName, finalAuthorAvatar, group_id || 'G09', text, postImage]);

    const created = await get(`
      SELECT p.*, m.photo AS author_photo
      FROM posts p
      LEFT JOIN members m ON p.author_id = m.id
      WHERE p.id = ?
    `, [id]);
    created.comments = [];

    res.status(201).json({ success: true, message: 'पोस्ट प्रसिद्ध झाली!', post: created });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/posts/:id/like
router.post('/posts/:id/like', authenticateToken, async (req, res, next) => {
  try {
    const postId = req.params.id;
    const memberId = req.user?.id;

    if (!memberId) {
      return res.status(401).json({ success: false, error: 'कृपया लॉगिन करा.' });
    }

    // Verify post exists
    const post = await get('SELECT id, likes_count FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ success: false, error: 'पोस्ट आढळली नाही.' });
    }

    // Check if the user already liked this post
    const existingLike = await get(
      'SELECT id FROM post_likes WHERE post_id = ? AND member_id = ?',
      [postId, memberId]
    );

    let liked = false;
    if (existingLike) {
      // Unlike
      await runQuery(
        'DELETE FROM post_likes WHERE post_id = ? AND member_id = ?',
        [postId, memberId]
      );
      await runQuery(
        'UPDATE posts SET likes_count = CASE WHEN likes_count > 0 THEN likes_count - 1 ELSE 0 END WHERE id = ?',
        [postId]
      );
      liked = false;
    } else {
      // Like
      const likeId = 'PL-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      await runQuery(
        'INSERT INTO post_likes (id, post_id, member_id) VALUES (?, ?, ?)',
        [likeId, postId, memberId]
      );
      await runQuery(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?',
        [postId]
      );
      liked = true;
    }

    const updated = await get('SELECT likes_count FROM posts WHERE id = ?', [postId]);
    res.json({
      success: true,
      liked,
      likes_count: updated ? updated.likes_count : 0,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/posts/:id/comments
router.post('/posts/:id/comments', authenticateToken, async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'प्रतिक्रिया आवश्यक आहे.' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: 'टिप्पणी करण्यासाठी कृपया लॉगिन करा.' });
    }

    const id = 'CMM-' + Date.now();
    const finalAuthorId = req.user.id;
    let finalAuthorName = req.user.name || 'समाज सदस्य';

    const member = await get('SELECT name FROM members WHERE id = ?', [finalAuthorId]);
    if (member && member.name) {
      finalAuthorName = member.name;
    }

    await runQuery(`
      INSERT INTO post_comments (id, post_id, author_id, author_name, text, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `, [id, req.params.id, finalAuthorId, finalAuthorName, text.trim()]);

    const comments = await all(`
      SELECT c.*, COALESCE(m.name, c.author_name) AS author_name, m.photo AS author_photo
      FROM post_comments c
      LEFT JOIN members m ON c.author_id = m.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [req.params.id]);

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
      params.push(type);
    }
    if (district && district !== 'सर्व') {
      sql += ' AND district = ?';
      params.push(district);
    }

    sql += ' ORDER BY members_count DESC';
    const groups = await all(sql, params);
    res.json({ success: true, count: groups.length, groups });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/groups/:id/join
router.post('/groups/:id/join', async (req, res, next) => {
  try {
    await runQuery('UPDATE groups SET members_count = members_count + 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'गटात यशस्वीरित्या सामील झालात!' });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/report  { target_type, target_id, reason, details? }
router.post('/report', authenticateToken, async (req, res, next) => {
  try {
    const targetType = String(req.body?.target_type || '');
    const targetId = String(req.body?.target_id || '').slice(0, 60);
    const reason = String(req.body?.reason || '');
    const table = REPORT_TARGETS[targetType];
    if (!table || !targetId || !REPORT_REASONS.includes(reason)) {
      return res.status(400).json({ success: false, code: 'INVALID_REPORT', error: 'अवैध तक्रार. कृपया कारण निवडा.' });
    }
    if (targetType === 'member' && targetId === req.user.id) {
      return res.status(400).json({ success: false, code: 'INVALID_REPORT', error: 'आपण स्वतःची तक्रार करू शकत नाही.' });
    }
    const exists = await get(`SELECT id FROM ${table} WHERE id = ?`, [targetId]);
    if (!exists) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'सामग्री सापडली नाही.' });
    }

    await ensureModerationTables();
    const dup = await get(
      "SELECT id FROM reports WHERE reporter_id = ? AND target_type = ? AND target_id = ? AND status = 'open'",
      [req.user.id, targetType, targetId]
    );
    if (!dup) {
      const id = 'RPT-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      await runQuery(
        'INSERT INTO reports (id, reporter_id, target_type, target_id, reason, details) VALUES (?, ?, ?, ?, ?, ?)',
        [id, req.user.id, targetType, targetId, reason, String(req.body?.details || '').slice(0, 500)]
      );
    }
    res.status(201).json({ success: true, message: 'तक्रार नोंदवली गेली. आमची टीम ती तपासेल.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/community/blocks  -> members the caller has blocked
router.get('/blocks', authenticateToken, async (req, res, next) => {
  try {
    await ensureModerationTables();
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
router.post('/blocks/:memberId', authenticateToken, async (req, res, next) => {
  try {
    if (req.params.memberId === req.user.id) {
      return res.status(400).json({ success: false, code: 'INVALID_BLOCK', error: 'आपण स्वतःला ब्लॉक करू शकत नाही.' });
    }
    const target = await get('SELECT id FROM members WHERE id = ?', [req.params.memberId]);
    if (!target) {
      return res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'सदस्य आढळला नाही.' });
    }
    await ensureModerationTables();
    await runQuery('INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?) ON CONFLICT DO NOTHING', [req.user.id, target.id]);
    res.status(201).json({ success: true, message: 'सदस्य ब्लॉक केला.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/community/blocks/:memberId
router.delete('/blocks/:memberId', authenticateToken, async (req, res, next) => {
  try {
    await ensureModerationTables();
    await runQuery('DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?', [req.user.id, req.params.memberId]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
