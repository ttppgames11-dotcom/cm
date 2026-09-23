import { Router } from 'express';
import { all, get, runQuery } from '../db/database.js';

const router = Router();

// GET /api/community/posts
router.get('/posts', async (req, res, next) => {
  try {
    const { groupId } = req.query;
    let sql = 'SELECT * FROM posts WHERE 1=1';
    const params = [];

    if (groupId) {
      sql += ' AND group_id = ?';
      params.push(groupId);
    }

    sql += ' ORDER BY created_at DESC';
    const posts = await all(sql, params);

    // Fetch comments for each post
    for (const post of posts) {
      post.comments = await all('SELECT * FROM post_comments WHERE post_id = ? ORDER BY created_at ASC', [post.id]);
    }

    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/posts
router.post('/posts', async (req, res, next) => {
  try {
    const { author_id, author_name, author_avatar, group_id, text, image } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, error: 'मजकूर आवश्यक आहे.' });
    }

    const id = 'P-' + Date.now();

    await runQuery(`
      INSERT INTO posts (id, author_id, author_name, author_avatar, group_id, text, image, likes_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `, [id, author_id || 'M1001', author_name || 'अमोल जाधव', author_avatar || '👨', group_id || 'G09', text, image || '']);

    const created = await get('SELECT * FROM posts WHERE id = ?', [id]);
    created.comments = [];

    res.status(201).json({ success: true, message: 'पोस्ट प्रसिद्ध झाली!', post: created });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/posts/:id/like
router.post('/posts/:id/like', async (req, res, next) => {
  try {
    await runQuery('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [req.params.id]);
    const updated = await get('SELECT id, likes_count FROM posts WHERE id = ?', [req.params.id]);
    res.json({ success: true, likes_count: updated.likes_count });
  } catch (err) {
    next(err);
  }
});

// POST /api/community/posts/:id/comments
router.post('/posts/:id/comments', async (req, res, next) => {
  try {
    const { author_id, author_name, text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'प्रतिक्रिया आवश्यक आहे.' });
    }

    const id = 'CMM-' + Date.now();
    await runQuery(`
      INSERT INTO post_comments (id, post_id, author_id, author_name, text, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `, [id, req.params.id, author_id || 'M1001', author_name || 'अमोल जाधव', text]);

    const comments = await all('SELECT * FROM post_comments WHERE post_id = ? ORDER BY created_at ASC', [req.params.id]);
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

export default router;
