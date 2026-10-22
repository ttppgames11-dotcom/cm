// Public pages for shared links. Mounted at the site root (not under /api):
//   GET /post/:id                      -> the shared community post
//   GET /.well-known/assetlinks.json   -> lets Android open /post links in the app
import { Router } from 'express';
import { get } from '../../database/database.js';
import { str } from '../middleware/validate.js';
import { assetLinks, renderPostPage, renderPostNotFoundPage } from '../utils/share_page.js';

const router = Router();

const PUBLIC_ORIGIN = (process.env.PUBLIC_ORIGIN || 'https://api.connectmaratha.com').replace(/\/+$/, '');

router.get('/.well-known/assetlinks.json', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.json(assetLinks());
});

// Only posts that are visible in the app are shown; a deleted or moderated
// post answers 404, so a link stops working as soon as the post is removed.
router.get(['/post/:id', '/post/:id/'], async (req, res, next) => {
  try {
    const id = str(req.params.id, 60);
    const post = await get("SELECT id, author_name, text, image, likes_count, created_at FROM posts WHERE id = ? AND status = 'visible'", [id]);
    res.set('Content-Type', 'text/html; charset=utf-8');
    if (!post) {
      res.set('Cache-Control', 'no-store');
      return res.status(404).send(renderPostNotFoundPage());
    }
    const comments = await get("SELECT COUNT(*) AS count FROM post_comments WHERE post_id = ? AND status = 'visible'", [post.id]);
    res.set('Cache-Control', 'public, max-age=60');
    res.send(renderPostPage({
      post,
      commentsCount: Number(comments?.count) || 0,
      url: `${PUBLIC_ORIGIN}/post/${encodeURIComponent(post.id)}`,
      origin: PUBLIC_ORIGIN
    }));
  } catch (err) {
    next(err);
  }
});

export default router;
