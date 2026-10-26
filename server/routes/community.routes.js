import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize } from '../utils/validator.js';
import { runQuery, all, get } from '../../database/database.js';

const router = Router();

// Helper to query all posts with author profile, likers and comments from SQLite
async function fetchEnrichedPosts(groupId = null, currentUserId = null) {
  try {
    let sql = `
      SELECT p.*, 
             COALESCE(m.name, p.author_name) AS m_name, 
             COALESCE(m.avatar, p.author_avatar) AS m_avatar, 
             m.photo AS author_photo, 
             m.city AS author_city, 
             m.district AS author_district, 
             m.kul AS author_kul, 
             m.role AS author_role,
             m.is_vip AS author_is_vip,
             m.vip_number AS author_vip_number
      FROM posts p
      LEFT JOIN members m ON m.id = (
        SELECT id FROM members 
        WHERE id = p.author_id OR phone = p.author_id OR name = p.author_name 
        LIMIT 1
      )
      WHERE 1=1
    `;
    const params = [];

    if (groupId) {
      sql += ' AND (p.group_id = ? OR p.group_id = ?)';
      params.push(groupId, groupId);
    }

    sql += ' ORDER BY p.created_at DESC';
    const rawPosts = await all(sql, params);

    const posts = [];
    for (const p of rawPosts) {
      // Comments with commenter profiles
      const rawComments = await all(`
        SELECT c.*, 
               COALESCE(m.name, c.author_name) AS m_name, 
               COALESCE(m.avatar, '👤') AS m_avatar, 
               m.photo AS author_photo, 
               m.city AS author_city, 
               m.district AS author_district, 
               m.kul AS author_kul
        FROM post_comments c
        LEFT JOIN members m ON m.id = (
          SELECT id FROM members 
          WHERE id = c.author_id OR phone = c.author_id OR name = c.author_name 
          LIMIT 1
        )
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
      `, [p.id]);

      const comments = rawComments.map(c => ({
        id: c.id,
        post_id: c.post_id,
        author_id: c.author_id,
        authorId: c.author_id,
        author: c.author_name || c.m_name || 'मराठा बांधव',
        author_name: c.author_name || c.m_name || 'मराठा बांधव',
        author_avatar: c.m_avatar || '👤',
        author_photo: c.author_photo || '',
        author_city: c.author_city || c.author_district || 'महाराष्ट्र',
        author_kul: c.author_kul || '९६ कुळी',
        text: c.text,
        createdAt: c.created_at,
        created_at: c.created_at
      }));

      // Likers profiles
      const rawLikers = await all(`
        SELECT l.member_id as id, m.name, m.avatar, m.photo, m.city, m.district, m.kul, m.role
        FROM post_likes l
        LEFT JOIN members m ON m.id = (
          SELECT id FROM members 
          WHERE id = l.member_id OR phone = l.member_id 
          LIMIT 1
        )
        WHERE l.post_id = ?
      `, [p.id]);

      const liked_by = rawLikers.map(l => ({
        id: l.id,
        name: l.name || 'मराठा सदस्य',
        avatar: l.avatar || '👤',
        photo: l.photo || '',
        city: l.city || l.district || 'महाराष्ट्र',
        district: l.district || 'पुणे',
        kul: l.kul || '९६ कुळी मराठा',
        role: l.role || 'member'
      }));

      const likedBy = liked_by.map(x => x.id);
      const likesCount = Math.max(liked_by.length, p.likes_count || 0);

      const isLiked = currentUserId ? likedBy.some(id => String(id).toLowerCase() === String(currentUserId).toLowerCase()) : false;
      const isMine = currentUserId ? (String(p.author_id).toLowerCase() === String(currentUserId).toLowerCase()) : false;

      posts.push({
        id: p.id,
        authorId: p.author_id,
        author_id: p.author_id,
        author: p.author_name || p.m_name || 'मराठा सदस्य',
        author_name: p.author_name || p.m_name || 'मराठा सदस्य',
        avatar: p.author_avatar || p.m_avatar || '👤',
        author_avatar: p.author_avatar || p.m_avatar || '👤',
        author_photo: p.author_photo || '',
        author_city: p.author_city || p.author_district || 'महाराष्ट्र',
        city: p.author_city || p.author_district || 'महाराष्ट्र',
        author_kul: p.author_kul || '९६ कुळी मराठा',
        kul: p.author_kul || '९६ कुळी मराठा',
        role: p.author_role || 'member',
        content: p.text || '',
        text: p.text || '',
        mediaUrl: p.image || '',
        image: p.image || '',
        groupId: p.group_id,
        group_id: p.group_id,
        likes: likesCount,
        likes_count: likesCount,
        shares: p.shares_count || 0,
        shares_count: p.shares_count || 0,
        likedBy,
        liked_by,
        isLiked,
        is_liked_by_me: isLiked,
        isMine,
        comments_count: comments.length,
        comments,
        createdAt: p.created_at,
        created_at: p.created_at
      });
    }

    return posts;
  } catch (err) {
    console.warn('[Community] SQLite fetch warning, falling back to JSON db:', err.message);
    const jsonPosts = db.getCollection('posts') || [];
    return jsonPosts;
  }
}

// GET /api/community/posts
// Fetch all posts with rich likers and comments from SQLite & realtimeDb
router.get('/posts', optionalToken, async (req, res) => {
  try {
    const { groupId } = req.query;
    const currentUserId = req.user?.id || null;
    const posts = await fetchEnrichedPosts(groupId, currentUserId);

    return sendSuccess(res, 'चर्चा मंच पोस्ट्स प्राप्त झाल्या', { posts, count: posts.length });
  } catch (err) {
    return sendError(res, err.message, 'FETCH_POSTS_FAILED', 500);
  }
});

// GET /api/community/posts/:id
// Single post with details
router.get('/posts/:id', optionalToken, async (req, res) => {
  try {
    const currentUserId = req.user?.id || null;
    const allPosts = await fetchEnrichedPosts(null, currentUserId);
    const post = allPosts.find(p => p.id === req.params.id);

    if (!post) {
      return sendError(res, 'पोस्ट सापडली नाही.', 'POST_NOT_FOUND', 404);
    }

    return sendSuccess(res, 'पोस्ट तपशील प्राप्त झाला', { post });
  } catch (err) {
    return sendError(res, err.message, 'FETCH_POST_FAILED', 500);
  }
});

// GET /api/community/posts/:id/likes
// List of all members who liked this post
router.get('/posts/:id/likes', optionalToken, async (req, res) => {
  try {
    const currentUserId = req.user?.id || null;
    const allPosts = await fetchEnrichedPosts(null, currentUserId);
    const post = allPosts.find(p => p.id === req.params.id);

    if (!post) {
      return sendError(res, 'पोस्ट सापडली नाही.', 'POST_NOT_FOUND', 404);
    }

    return sendSuccess(res, 'पोस्ट लाईक करणाऱ्यांची यादी', {
      postId: post.id,
      count: post.liked_by.length,
      likers: post.liked_by,
      members: post.liked_by
    });
  } catch (err) {
    return sendError(res, err.message, 'FETCH_LIKES_FAILED', 500);
  }
});

// POST /api/community/posts
// Create post: stores directly in SQLite and syncs to JSON DB
router.post('/posts', optionalToken, async (req, res) => {
  const content = sanitize(req.body.content || req.body.text);
  let mediaUrl = sanitize(req.body.mediaUrl || req.body.media_url || req.body.image || '');
  const rawImgId = req.body.image_id;
  if (rawImgId) {
    mediaUrl = rawImgId.startsWith('/media/') ? rawImgId : `/media/${rawImgId}`;
  }

  const groupId = req.body.groupId || req.body.group_id ? sanitize(req.body.groupId || req.body.group_id) : 'G01';

  if (!content || content.length < 2) {
    return sendError(res, 'कृपया पोस्टचा योग्य मजकूर प्रविष्ट करा (किमान २ अक्षरे).', 'MISSING_CONTENT', 400);
  }

  const authorId = req.user?.id || sanitize(req.body.author_id || req.body.authorId) || 'M8416';
  let authorName = req.user?.name || sanitize(req.body.author_name || req.body.author) || 'मराठा सदस्य';
  let authorAvatar = req.user?.avatar || sanitize(req.body.author_avatar || req.body.avatar) || '👤';

  // Lookup author profile from SQLite members if available
  try {
    const member = await get('SELECT name, avatar, photo, district, city, kul FROM members WHERE id = ?', [authorId]);
    if (member) {
      authorName = member.name || authorName;
      authorAvatar = member.avatar || authorAvatar;
    }
  } catch (_) {}

  const rawPremiumNumber = req.body.premium_number || req.body.premiumNumber;
  const isPremium = (req.body.is_premium || req.body.isPremium || rawPremiumNumber) ? 1 : 0;
  const premiumNumber = rawPremiumNumber ? String(rawPremiumNumber).trim() : (isPremium ? `#${Math.floor(100000 + Math.random() * 900000)}` : null);

  const postId = `POST-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  // 1. Insert into SQLite
  try {
    await runQuery(`
      INSERT OR REPLACE INTO posts (id, author_id, author_name, author_avatar, group_id, text, image, likes_count, is_premium, premium_number, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `, [postId, authorId, authorName, authorAvatar, groupId, content, mediaUrl, isPremium, premiumNumber, now]);
  } catch (err) {
    console.warn('[Community] SQLite post insert warning:', err.message);
  }

  // 2. Sync to JSON db for SSE broadcast
  const newPost = {
    id: postId,
    author: authorName,
    authorId,
    author_id: authorId,
    author_name: authorName,
    avatar: authorAvatar,
    author_avatar: authorAvatar,
    content,
    text: content,
    mediaUrl,
    image: mediaUrl,
    groupId,
    is_premium: isPremium,
    premium_number: premiumNumber,
    group_id: groupId,
    likes: 0,
    likes_count: 0,
    likedBy: [],
    liked_by: [],
    comments: [],
    createdAt: now,
    created_at: now
  };

  db.insert('posts', newPost);
  db.addAuditLog('CREATE_POST', authorId, { postId });

  return sendSuccess(res, 'आपली पोस्ट यशस्वीरीत्या प्रकाशित झाली!', { post: newPost }, 201);
});

// POST /api/community/posts/:id/like
// Toggle like on a community post, store in SQLite post_likes and update likes_count
router.post('/posts/:id/like', optionalToken, async (req, res) => {
  const memberId = req.user?.id || req.body.member_id || 'M8416';
  const postId = req.params.id;

  try {
    // Check if user already liked this post in SQLite
    const existingLike = await get('SELECT * FROM post_likes WHERE post_id = ? AND member_id = ?', [postId, memberId]);

    let liked = false;
    if (existingLike) {
      // Unlike
      await runQuery('DELETE FROM post_likes WHERE post_id = ? AND member_id = ?', [postId, memberId]);
      await runQuery('UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?', [postId]);
      liked = false;
    } else {
      // Like
      const likeId = `PL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await runQuery('INSERT OR REPLACE INTO post_likes (id, post_id, member_id) VALUES (?, ?, ?)', [likeId, postId, memberId]);
      await runQuery('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', [postId]);
      liked = true;
    }

    // Get updated likers and count
    const postRow = await get('SELECT likes_count FROM posts WHERE id = ?', [postId]);
    const rawLikers = await all(`
      SELECT l.member_id as id, m.name, m.avatar, m.photo, m.city, m.district, m.kul, m.role
      FROM post_likes l
      LEFT JOIN members m ON l.member_id = m.id
      WHERE l.post_id = ?
    `, [postId]);

    const likers = rawLikers.map(l => ({
      id: l.id,
      name: l.name || 'मराठा सदस्य',
      avatar: l.avatar || '👤',
      photo: l.photo || '',
      city: l.city || l.district || 'महाराष्ट्र',
      district: l.district || 'पुणे',
      kul: l.kul || '९६ कुळी मराठा',
      role: l.role || 'member'
    }));

    const likesCount = postRow?.likes_count || likers.length;

    // Sync to JSON DB
    const jsonPost = db.findById('posts', postId);
    if (jsonPost) {
      jsonPost.likes = likesCount;
      jsonPost.likes_count = likesCount;
      jsonPost.likedBy = likers.map(x => x.id);
      jsonPost.liked_by = likers;
      db.update('posts', postId, jsonPost);
    }

    return sendSuccess(res, liked ? 'पोस्ट पसंत केली (Liked)' : 'पसंती मागे घेतली (Unliked)', {
      liked,
      likes: likesCount,
      likes_count: likesCount,
      isLiked: liked,
      is_liked_by_me: liked,
      liked_by: likers,
      likedBy: likers.map(x => x.id)
    });
  } catch (err) {
    return sendError(res, err.message, 'LIKE_FAILED', 500);
  }
});

// POST /api/community/posts/:id/share
// Record post share in SQL post_shares and increment shares_count
router.post('/posts/:id/share', optionalToken, async (req, res) => {
  const memberId = req.user?.id || req.body.member_id || 'M8416';
  const postId = req.params.id;
  const platform = req.body.platform || 'internal';

  try {
    await runQuery(`
      CREATE TABLE IF NOT EXISTS post_shares (
        id TEXT PRIMARY KEY,
        post_id TEXT,
        member_id TEXT,
        platform TEXT DEFAULT 'internal',
        created_at TEXT
      )
    `);

    const shareId = `PS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();

    await runQuery(`
      INSERT INTO post_shares (id, post_id, member_id, platform, created_at)
      VALUES (?, ?, ?, ?, ?)
    `, [shareId, postId, memberId, platform, now]);

    try {
      await runQuery('UPDATE posts SET shares_count = coalesce(shares_count, 0) + 1 WHERE id = ?', [postId]);
    } catch (_) {}

    const postRow = await get('SELECT shares_count FROM posts WHERE id = ?', [postId]);
    const sharesCount = postRow?.shares_count || 1;

    // Sync to JSON DB
    const jsonPost = db.findById('posts', postId);
    if (jsonPost) {
      jsonPost.shares = sharesCount;
      jsonPost.shares_count = sharesCount;
      db.update('posts', postId, jsonPost);
    }

    return sendSuccess(res, 'पोस्ट यशस्वीरीत्या शेअर केली!', {
      postId,
      shares: sharesCount,
      shares_count: sharesCount
    });
  } catch (err) {
    return sendError(res, err.message, 'SHARE_FAILED', 500);
  }
});


// POST /api/community/posts/:id/comments
// Add comment to post in SQLite and sync to JSON DB
router.post('/posts/:id/comments', optionalToken, async (req, res) => {
  const text = sanitize(req.body.text || req.body.comment);
  if (!text || text.length < 1) {
    return sendError(res, 'कृपया प्रतिक्रिया प्रविष्ट करा.', 'MISSING_COMMENT', 400);
  }

  const postId = req.params.id;
  const authorId = req.user?.id || sanitize(req.body.author_id || req.body.authorId) || 'M8416';
  let authorName = req.user?.name || sanitize(req.body.author_name || req.body.author) || 'मराठा सदस्य';
  let authorAvatar = req.user?.avatar || sanitize(req.body.author_avatar || req.body.avatar) || '👤';

  try {
    const member = await get('SELECT name, avatar, district, city, kul FROM members WHERE id = ?', [authorId]);
    if (member) {
      authorName = member.name || authorName;
      authorAvatar = member.avatar || authorAvatar;
    }
  } catch (_) {}

  const commentId = `CMT-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();

  // 1. Insert into SQLite
  try {
    await runQuery(`
      INSERT INTO post_comments (id, post_id, author_id, author_name, text, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [commentId, postId, authorId, authorName, text, now]);
  } catch (err) {
    console.warn('[Community] SQLite comment insert warning:', err.message);
  }

  // 2. Fetch all comments for this post
  let comments = [];
  try {
    const rawComments = await all(`
      SELECT c.*, m.name AS m_name, m.avatar AS m_avatar, m.photo AS author_photo,
             m.city AS author_city, m.district AS author_district, m.kul AS author_kul
      FROM post_comments c
      LEFT JOIN members m ON c.author_id = m.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);

    comments = rawComments.map(c => ({
      id: c.id,
      post_id: c.post_id,
      author_id: c.author_id,
      authorId: c.author_id,
      author: c.author_name || c.m_name || 'मराठा बांधव',
      author_name: c.author_name || c.m_name || 'मराठा बांधव',
      author_avatar: c.m_avatar || '👤',
      author_photo: c.author_photo || '',
      author_city: c.author_city || c.author_district || 'महाराष्ट्र',
      author_kul: c.author_kul || '९६ कुळी',
      text: c.text,
      createdAt: c.created_at,
      created_at: c.created_at
    }));
  } catch (_) {}

  // 3. Sync to JSON db
  const jsonPost = db.findById('posts', postId);
  if (jsonPost) {
    jsonPost.comments = comments;
    db.update('posts', postId, jsonPost);
  }

  return sendSuccess(res, 'प्रतिक्रिया यशस्वीरीत्या जोडली गेली!', { comments }, 201);
});

// DELETE /api/community/posts/:id
// Author or moderator deletes post
router.delete('/posts/:id', optionalToken, async (req, res) => {
  const postId = req.params.id;

  try {
    await runQuery('DELETE FROM posts WHERE id = ?', [postId]);
    await runQuery('DELETE FROM post_likes WHERE post_id = ?', [postId]);
    await runQuery('DELETE FROM post_comments WHERE post_id = ?', [postId]);
    db.remove('posts', postId);

    return sendSuccess(res, 'पोस्ट यशस्वीरीत्या हटवण्यात आली!', { deletedPostId: postId });
  } catch (err) {
    return sendError(res, err.message, 'DELETE_FAILED', 500);
  }
});

// GET /api/community/groups
// Query real groups from SQLite database
router.get('/groups', async (req, res) => {
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

    return sendSuccess(res, 'मंडळे व समूह यादी', { groups, count: groups.length });
  } catch (err) {
    const jsonGroups = db.getCollection('groups') || [];
    return sendSuccess(res, 'मंडळे व समूह यादी', { groups: jsonGroups, count: jsonGroups.length });
  }
});

// POST /api/community/groups/:id/join
// Join group and increment member count
router.post('/groups/:id/join', optionalToken, async (req, res) => {
  const groupId = req.params.id;

  try {
    await runQuery('UPDATE groups SET members_count = members_count + 1 WHERE id = ?', [groupId]);
    const group = await get('SELECT * FROM groups WHERE id = ?', [groupId]);

    const jsonGroup = db.findById('groups', groupId);
    if (jsonGroup) {
      jsonGroup.members_count = (jsonGroup.members_count || 0) + 1;
      db.update('groups', groupId, jsonGroup);
    }

    return sendSuccess(res, 'गटात यशस्वीरीत्या सामील झालात!', { group });
  } catch (err) {
    return sendError(res, err.message, 'JOIN_FAILED', 500);
  }
});

// GET /api/community/members
// List registered community members directly from database with search and district filtering
router.get('/members', async (req, res) => {
  try {
    const { district, search } = req.query;
    let sql = `
      SELECT id, name, avatar, photo, city, district, state, profession, business, skills, tier, role, joined 
      FROM members 
      WHERE 1=1
    `;
    const params = [];

    if (district && district !== 'सर्व') {
      sql += ' AND district = ?';
      params.push(district);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR profession LIKE ? OR city LIKE ? OR district LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY id ASC';
    const rawMembers = await all(sql, params);

    const members = rawMembers.map(m => {
      let skills = [];
      try {
        skills = JSON.parse(m.skills || '[]');
      } catch {
        skills = m.skills ? [m.skills] : [];
      }
      return {
        ...m,
        skills,
        photoUrl: m.photo || '',
        avatar: m.avatar || '👤',
        roleOrTitle: m.profession || 'समाज सदस्य',
        location: [m.city, m.district].filter(Boolean).join(', ') || 'महाराष्ट्र'
      };
    });

    return sendSuccess(res, 'समाज बांधव यादी', { members, count: members.length });
  } catch (err) {
    return sendError(res, err.message, 'FETCH_MEMBERS_FAILED', 500);
  }
});

// POST /api/community/report
// Submit report against post or member
router.post('/report', optionalToken, (req, res) => {
  const { target_type, target_id, reason, details } = req.body;
  const reportItem = {
    id: `REP-${Date.now().toString().slice(-4)}`,
    target_type: sanitize(target_type),
    target_id: sanitize(target_id),
    reporter_id: req.user?.id || 'M8416',
    reason: sanitize(reason) || 'इतर',
    details: sanitize(details) || '',
    status: 'तपासणी अंतर्गत',
    created_at: new Date().toISOString()
  };

  db.insert('postReports', reportItem);
  return sendSuccess(res, 'तक्रार नोंदवली गेली. आमची टीम ती तपासेल.', { report: reportItem }, 201);
});

// GET /api/community/members/connected
// Fetch all member IDs that the logged-in user is following/connected to from SQL
router.get('/members/connected', optionalToken, async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.query.member_id || 'M8416';
    await runQuery(`
      CREATE TABLE IF NOT EXISTS member_connections (
        id TEXT PRIMARY KEY,
        follower_id TEXT NOT NULL,
        following_id TEXT NOT NULL,
        status TEXT DEFAULT 'connected',
        created_at TEXT
      )
    `);

    const rows = await all('SELECT following_id FROM member_connections WHERE follower_id = ?', [currentUserId]);
    const connectedIds = (rows || []).map(r => r.following_id);

    return sendSuccess(res, 'जोडलेले सदस्य', { connectedIds });
  } catch (err) {
    return sendError(res, err.message, 'FETCH_CONNECTIONS_FAILED', 500);
  }
});

// GET /api/community/connected-directory
// Comprehensive unified directory: Connected Members, Group Members, and Enquired Users
router.get('/connected-directory', optionalToken, async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.headers['x-user-id'] || req.query.member_id || 'M8416';

    // 1. Direct Connected / Followed Members
    const connectedRows = await all(`
      SELECT m.id, m.name, m.email, m.phone, m.avatar, m.photo, m.city, m.district, 
             m.profession, m.business, m.skills, m.tier, m.role, m.kul, mc.created_at as connected_at
      FROM member_connections mc
      JOIN members m ON mc.following_id = m.id
      WHERE mc.follower_id = ?
      ORDER BY mc.created_at DESC
    `, [currentUserId]);

    const connectedMembers = connectedRows.map(m => {
      let skills = [];
      try { skills = JSON.parse(m.skills || '[]'); } catch { skills = m.skills ? [m.skills] : []; }
      return {
        ...m,
        source: 'connection',
        sourceLabel: 'जोडलेले समाजबांधव',
        skills,
        location: [m.city, m.district].filter(Boolean).join(', ') || 'महाराष्ट्र'
      };
    });

    // 2. Members from Connected Community Groups
    // Find all groups the user is in or popular groups, and their members
    const groupMembersRows = await all(`
      SELECT DISTINCT m.id, m.name, m.email, m.phone, m.avatar, m.photo, m.city, m.district, 
             m.profession, m.business, m.skills, m.tier, m.role, m.kul, g.name as group_name, g.id as group_id
      FROM group_members gm
      JOIN members m ON gm.member_id = m.id
      JOIN groups g ON gm.group_id = g.id
      WHERE m.id != ?
      ORDER BY gm.joined_at DESC
    `, [currentUserId]);

    const groupMembers = groupMembersRows.map(m => {
      let skills = [];
      try { skills = JSON.parse(m.skills || '[]'); } catch { skills = m.skills ? [m.skills] : []; }
      return {
        ...m,
        source: 'group',
        sourceLabel: `समुदाय गट (${m.group_name})`,
        skills,
        location: [m.city, m.district].filter(Boolean).join(', ') || 'महाराष्ट्र'
      };
    });

    // 3. Users from Enquiries (Client & B2B Enquiries)
    const enqRows = await all(`
      SELECT ce.id as enquiry_id, ce.client_name as name, ce.client_phone as phone, 
             ce.client_email as email, ce.service_category, ce.location, ce.district, 
             ce.message, ce.status, ce.created_at,
             m.id as member_id, m.avatar, m.photo, m.profession
      FROM client_enquiries ce
      LEFT JOIN members m ON ce.client_phone = m.phone OR ce.client_name = m.name
      ORDER BY ce.created_at DESC
    `);

    const enquiredUsers = enqRows.map(e => ({
      id: e.member_id || `ENQ-USER-${e.enquiry_id}`,
      name: e.name,
      phone: e.phone,
      email: e.email || '',
      avatar: e.avatar || '🏢',
      photo: e.photo || '',
      profession: e.service_category || 'व्यावसायिक चौकशीदार',
      location: e.location || e.district || 'महाराष्ट्र',
      district: e.district || 'पुणे',
      enquiry_id: e.enquiry_id,
      enquiryMessage: e.message,
      enquiryCategory: e.service_category,
      status: e.status || 'open',
      source: 'enquiry',
      sourceLabel: `थेट चौकशी (Enquiry: ${e.service_category || 'सेवा'})`,
      created_at: e.created_at
    }));

    return sendSuccess(res, 'जोडलेले युजर्स, गट सदस्य व चौकशीदार यादी', {
      connectedMembers,
      groupMembers,
      enquiredUsers,
      totalConnected: connectedMembers.length,
      totalGroupMembers: groupMembers.length,
      totalEnquiries: enquiredUsers.length
    });
  } catch (err) {
    return sendError(res, err.message, 'FETCH_CONNECTED_DIRECTORY_FAILED', 500);
  }
});

// POST /api/community/members/:id/connect
// Toggle follow/connect with a member in SQL database
router.post('/members/:id/connect', optionalToken, async (req, res) => {
  try {
    const targetMemberId = req.params.id;
    const followerId = req.user?.id || req.body.follower_id || 'M8416';

    await runQuery(`
      CREATE TABLE IF NOT EXISTS member_connections (
        id TEXT PRIMARY KEY,
        follower_id TEXT NOT NULL,
        following_id TEXT NOT NULL,
        status TEXT DEFAULT 'connected',
        created_at TEXT
      )
    `);

    const existing = await get(
      'SELECT * FROM member_connections WHERE follower_id = ? AND following_id = ?',
      [followerId, targetMemberId]
    );

    let connected = false;
    if (existing) {
      await runQuery('DELETE FROM member_connections WHERE id = ?', [existing.id]);
      connected = false;
    } else {
      const connId = `CONN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await runQuery(
        'INSERT INTO member_connections (id, follower_id, following_id, status, created_at) VALUES (?, ?, ?, "connected", ?)',
        [connId, followerId, targetMemberId, new Date().toISOString()]
      );
      connected = true;
    }

    const countRes = await get('SELECT COUNT(*) as cnt FROM member_connections WHERE following_id = ?', [targetMemberId]);

    return sendSuccess(res, connected ? 'कनेक्ट विनंती यशस्वीरीत्या पाठवली!' : 'कनेक्ट मागे घेतले.', {
      connected,
      targetMemberId,
      followersCount: countRes?.cnt || 0
    });
  } catch (err) {
    return sendError(res, err.message, 'CONNECT_FAILED', 500);
  }
});

export default router;


