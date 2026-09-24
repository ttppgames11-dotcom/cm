import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken, requireRole } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize } from '../utils/validator.js';

const router = Router();

// GET /api/community/posts
// Community discussion feed (with optional ?groupId= filter)
router.get('/posts', (req, res) => {
  const { groupId, tag } = req.query;
  let posts = db.getCollection('posts');

  if (posts.length === 0) {
    // Seed initial welcome discussion
    const seedPost = {
      id: 'POST-001',
      author: 'अखिल भारतीय मराठा महासंघ',
      authorId: 'CM-96K-001',
      avatar: '🏛️',
      role: 'admin',
      content: 'महाराष्ट्रातील सर्व मराठा उद्योजक, विद्यार्थी व समाजबांधवांचे महासंघाच्या डिजिटल मंचावर हार्दिक स्वागत!',
      likes: 128,
      likedBy: [],
      comments: [
        { id: 'C1', author: 'प्रदीप कदम', text: 'जय जिजाऊ! जय शिवराय!', createdAt: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString()
    };
    db.insert('posts', seedPost);
    posts = [seedPost];
  }

  if (groupId) {
    posts = posts.filter(p => p.groupId === groupId);
  }
  if (tag) {
    posts = posts.filter(p => (p.tag || '').toLowerCase() === tag.toLowerCase());
  }

  return sendSuccess(res, 'चर्चा मंच पोस्ट्स प्राप्त झाल्या', { posts, count: posts.length });
});

// POST /api/community/posts
// Create rich post with media, tag, category
router.post('/posts', authenticateToken, (req, res) => {
  const content = sanitize(req.body.content);
  const mediaUrl = sanitize(req.body.mediaUrl);
  const tag = sanitize(req.body.tag);
  const groupId = req.body.groupId ? sanitize(req.body.groupId) : null;

  if (!content || content.length < 2) {
    return sendError(res, 'कृपया पोस्टचा योग्य मजकूर प्रविष्ट करा (किमान २ अक्षरे).', 'MISSING_CONTENT', 400);
  }

  const newPost = {
    id: `POST-${Date.now().toString().slice(-5)}`,
    author: req.user.name,
    authorId: req.user.id,
    avatar: req.user.avatar || '👤',
    role: req.user.role || 'member',
    content,
    mediaUrl: mediaUrl || '',
    tag: tag || 'सामान्य चर्चा',
    groupId,
    likes: 0,
    likedBy: [],
    comments: [],
    createdAt: new Date().toISOString()
  };

  db.insert('posts', newPost);
  db.addAuditLog('CREATE_POST', req.user.id, { postId: newPost.id });

  return sendSuccess(res, 'आपली पोस्ट यशस्वीरीत्या प्रकाशित झाली!', { post: newPost }, 201);
});

// POST /api/community/posts/:id/like
// Toggle like on a community post
router.post('/posts/:id/like', authenticateToken, (req, res) => {
  const post = db.findById('posts', req.params.id);
  if (!post) {
    return sendError(res, 'पोस्ट सापडली नाही.', 'POST_NOT_FOUND', 404);
  }

  post.likedBy = post.likedBy || [];
  const index = post.likedBy.indexOf(req.user.id);

  let liked = false;
  if (index === -1) {
    post.likedBy.push(req.user.id);
    post.likes = (post.likes || 0) + 1;
    liked = true;
  } else {
    post.likedBy.splice(index, 1);
    post.likes = Math.max(0, (post.likes || 1) - 1);
    liked = false;
  }

  db.update('posts', req.params.id, { likes: post.likes, likedBy: post.likedBy });
  return sendSuccess(res, liked ? 'पोस्ट पसंत केली (Liked)' : 'पसंती मागे घेतली (Unliked)', {
    likes: post.likes,
    liked
  });
});

// POST /api/community/posts/:id/comments
// Add discussion comment to a post
router.post('/posts/:id/comments', authenticateToken, (req, res) => {
  const post = db.findById('posts', req.params.id);
  if (!post) {
    return sendError(res, 'पोस्ट सापडली नाही.', 'POST_NOT_FOUND', 404);
  }

  const text = sanitize(req.body.text);
  if (!text) {
    return sendError(res, 'कृपया प्रतिक्रिया प्रविष्ट करा.', 'MISSING_COMMENT', 400);
  }

  const newComment = {
    id: `CMT-${Date.now().toString().slice(-4)}`,
    author: req.user.name,
    authorId: req.user.id,
    text,
    createdAt: new Date().toISOString()
  };

  post.comments = post.comments || [];
  post.comments.push(newComment);
  db.update('posts', req.params.id, { comments: post.comments });

  return sendSuccess(res, 'प्रतिक्रिया यशस्वीरीत्या जोडली गेली!', {
    comment: newComment,
    comments: post.comments
  }, 201);
});

// GET /api/community/groups
// List district mandals, taluka samitis, interest groups
router.get('/groups', (req, res) => {
  let groups = db.getCollection('groups');
  if (groups.length === 0) {
    const defaultGroups = [
      { id: 'GRP-PUNE', name: 'पुणे जिल्हा मराठा महासंघ', district: 'पुणे', membersCount: 1420, desc: 'पुणे जिल्ह्यातील सर्व तालुके व मंडळांचे अधिकृत व्यासपीठ' },
      { id: 'GRP-THANE', name: 'ठाणे-मुंबई मराठा बिझनेस फोरम', district: 'ठाणे', membersCount: 980, desc: 'एमएमआर परिसरातील उद्योजक व व्यापारी बंधूंचे संघटन' },
      { id: 'GRP-KOLHAPUR', name: 'कोल्हापूर ऐतिहासिक दुर्ग व वारसा संवर्धन', district: 'कोल्हापूर', membersCount: 750, desc: 'किल्ले संवर्धन, इतिहास संशोधन व सामाजिक कार्य' }
    ];
    for (const g of defaultGroups) db.insert('groups', g);
    groups = defaultGroups;
  }

  return sendSuccess(res, 'मंडळे व समूह यादी', { groups, count: groups.length });
});

// POST /api/community/groups/:id/join
// Join a group or apply for membership
router.post('/groups/:id/join', authenticateToken, (req, res) => {
  const group = db.findById('groups', req.params.id);
  if (!group) {
    return sendError(res, 'समूह सापडला नाही.', 'GROUP_NOT_FOUND', 404);
  }

  group.membersCount = (group.membersCount || 0) + 1;
  db.update('groups', req.params.id, { membersCount: group.membersCount });
  db.addAuditLog('JOIN_GROUP', req.user.id, { groupId: req.params.id });

  return sendSuccess(res, `आपण "${group.name}" मध्ये यशस्वीरीत्या सामील झाला आहात!`, { group });
});

// GET /api/community/news
// Official press releases and verified Mahasangh news articles
router.get('/news', (req, res) => {
  const news = db.getCollection('news');
  return sendSuccess(res, 'महासंघ वृत्त व घोषणा', { news, count: news.length });
});

// POST /api/community/news
// Admin creates news announcement
router.post('/news', authenticateToken, requireRole('admin', 'ceo'), (req, res) => {
  const { title, summary, content, category, imageUrl } = req.body;
  const cleanTitle = sanitize(title);
  const cleanContent = sanitize(content);

  if (!cleanTitle || !cleanContent) {
    return sendError(res, 'शीर्षक व बातमीचा मजकूर आवश्यक आहे.', 'MISSING_FIELDS', 400);
  }

  const item = {
    id: `NEWS-${Date.now().toString().slice(-4)}`,
    title: cleanTitle,
    summary: sanitize(summary) || cleanTitle,
    content: cleanContent,
    category: sanitize(category) || 'अधिकृत घोषणा',
    imageUrl: sanitize(imageUrl) || '',
    publishedBy: req.user.name,
    publishedAt: new Date().toISOString()
  };

  db.insert('news', item);
  db.addAuditLog('PUBLISH_NEWS', req.user.id, { newsId: item.id, title: cleanTitle });

  return sendSuccess(res, 'वृत्त यशस्वीरीत्या प्रकाशित केले!', { news: item }, 201);
});

export default router;
