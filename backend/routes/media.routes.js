import { Router } from 'express';
import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { get, runQuery } from '../../database/database.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'connect_maratha_secret_key_2026';

function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (!err && user) req.user = user;
    next();
  });
}

// GET /media/:id or /api/media/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    // Strip file extension if any (e.g., .jpg, .png)
    const cleanId = id.replace(/\.[^/.]+$/, '');
    
    const item = await get('SELECT mime, bytes FROM media WHERE id = ?', [cleanId]);
    if (!item || !item.bytes) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    res.setHeader('Content-Type', item.mime || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(item.bytes);
  } catch (err) {
    next(err);
  }
});

// POST /api/media/:kind (upload raw image bytes)
router.post('/:kind', optionalAuth, express.raw({ type: '*/*', limit: '10mb' }), async (req, res, next) => {
  try {
    const { kind } = req.params;
    const bytes = req.body;
    if (!bytes || !Buffer.isBuffer(bytes) || bytes.length === 0) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    // Detect MIME type by magic bytes
    let mime = 'image/jpeg';
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
      mime = 'image/png';
    } else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      mime = 'image/webp';
    }

    // 32-character hexadecimal ID matching ApiConfig._mediaPath regex
    const id = crypto.randomBytes(16).toString('hex');
    const ownerId = req.user?.id || 'anonymous';
    const mediaPath = `/media/${id}`;

    await runQuery(`
      INSERT INTO media (id, owner_id, kind, mime, bytes, size, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `, [id, ownerId, kind, mime, bytes, bytes.length]);

    // If uploading profile picture and user is authenticated, link to members table
    if (kind === 'profile' && req.user?.id) {
      await runQuery('UPDATE members SET photo = ? WHERE id = ?', [mediaPath, req.user.id]);
    }

    res.status(201).json({
      success: true,
      id,
      path: mediaPath
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/media/profile
router.delete('/profile', optionalAuth, async (req, res, next) => {
  try {
    const ownerId = req.user?.id;
    if (ownerId) {
      await runQuery('DELETE FROM media WHERE owner_id = ? AND kind = ?', [ownerId, 'profile']);
      await runQuery('UPDATE members SET photo = NULL WHERE id = ?', [ownerId]);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
