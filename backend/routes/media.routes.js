import { Router } from 'express';
import express from 'express';
import crypto from 'crypto';
import { get, runQuery } from '../../database/database.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';

const router = Router();

// Configuration & Boundaries
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB (matches mobile ApiClient.maxImageBytes)
const MIN_FILE_SIZE = 64; // Minimum valid image size in bytes
const ALLOWED_KINDS = new Set(['profile', 'post', 'banner']);

/**
 * Validates file magic bytes (signatures) to guarantee true content type,
 * rather than relying on client-supplied extensions or Content-Type headers.
 */
function detectImageMime(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < MIN_FILE_SIZE) {
    return null;
  }

  // PNG Magic Number: 89 50 4E 47 0D 0A 1A 0A followed by IHDR chunk
  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    // Verify first chunk is IHDR (0x49, 0x48, 0x44, 0x52) at offset 12
    if (
      buffer[12] === 0x49 &&
      buffer[13] === 0x48 &&
      buffer[14] === 0x44 &&
      buffer[15] === 0x52
    ) {
      return 'image/png';
    }
  }

  // JPEG Magic Number: FF D8 FF
  if (
    buffer.length >= 64 &&
    buffer[0] === 0xFF &&
    buffer[1] === 0xD8 &&
    buffer[2] === 0xFF
  ) {
    return 'image/jpeg';
  }

  // WebP Magic Number: RIFF (bytes 0-3) + WEBP (bytes 8-11)
  if (
    buffer.length >= 16 &&
    buffer[0] === 0x52 && // R
    buffer[1] === 0x49 && // I
    buffer[2] === 0x46 && // F
    buffer[3] === 0x46 && // F
    buffer[8] === 0x57 && // W
    buffer[9] === 0x45 && // E
    buffer[10] === 0x42 && // B
    buffer[11] === 0x50    // P
  ) {
    return 'image/webp';
  }

  return null;
}

/**
 * Deep inspection to prevent polyglot attacks, XSS, and server-side code execution.
 * Checks for malicious script blocks, PHP tags, or embedded HTML.
 */
const FORBIDDEN_CONTENT_SIGNATURES = [
  Buffer.from('<?php', 'ascii'),
  Buffer.from('<? ', 'ascii'),
  Buffer.from('<?\r', 'ascii'),
  Buffer.from('<?\n', 'ascii'),
  Buffer.from('<?=', 'ascii'),
  Buffer.from('<script', 'ascii'),
  Buffer.from('<SCRIPT', 'ascii'),
  Buffer.from('<!DOCTYPE', 'ascii'),
  Buffer.from('<!doctype', 'ascii'),
  Buffer.from('<html', 'ascii'),
  Buffer.from('<HTML', 'ascii'),
  Buffer.from('<svg', 'ascii'),
  Buffer.from('<SVG', 'ascii'),
  Buffer.from('javascript:', 'ascii'),
  Buffer.from('base64_decode', 'ascii'),
  Buffer.from('shell_exec', 'ascii'),
  Buffer.from('eval(', 'ascii')
];

function containsMaliciousPayload(buffer) {
  for (const sig of FORBIDDEN_CONTENT_SIGNATURES) {
    if (buffer.indexOf(sig) !== -1) {
      return true;
    }
  }
  return false;
}

// ============================================================
// 1. GET /media/:id or /api/media/:id (Serve stored media)
// ============================================================
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    // Strip file extension if any (e.g., .jpg, .png, .webp)
    const cleanId = String(id || '').replace(/\.[^/.]+$/, '').trim().toLowerCase();

    // Enforce 32-character hexadecimal format (reject directory traversal, SQL injection, special characters)
    if (!/^[a-f0-9]{32}$/.test(cleanId)) {
      return res.status(400).json({ success: false, error: 'अवैध मीडिया आयडी (Invalid media ID format)' });
    }

    const item = await get('SELECT mime, bytes, size FROM media WHERE id = ?', [cleanId]);
    if (!item || !item.bytes) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    // Security Headers: Prevent MIME-sniffing, code execution, and cross-site scripting
    res.setHeader('Content-Type', item.mime || 'image/jpeg');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    const buffer = Buffer.isBuffer(item.bytes) ? item.bytes : Buffer.from(item.bytes);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// 2. POST /api/media/:kind (Upload raw image bytes)
// ============================================================
router.post(
  '/:kind',
  optionalToken,
  express.raw({ type: () => true, limit: '5mb' }),
  async (req, res, next) => {
    try {
      const { kind } = req.params;

      // 1. Validate 'kind' against allowed whitelist
      if (!ALLOWED_KINDS.has(kind)) {
        return res.status(400).json({
          success: false,
          error: `अवैध प्रकार (Invalid media kind. Allowed kinds: ${Array.from(ALLOWED_KINDS).join(', ')})`
        });
      }

      // 2. Require authentication for profile uploads
      if (kind === 'profile' && !req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'प्रोफाइल फोटो अपलोड करण्यासाठी लॉगिन आवश्यक आहे (Authentication required)'
        });
      }

      const bytes = req.body;

      // 3. Validate existence & minimum file size
      if (!bytes || !Buffer.isBuffer(bytes) || bytes.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'कोणताही फोटो डेटा मिळाला नाही (No image data provided)'
        });
      }

      if (bytes.length < MIN_FILE_SIZE) {
        return res.status(400).json({
          success: false,
          error: 'फोटो फाइल अमान्य किंवा खूप लहान आहे (File too small or corrupted)'
        });
      }

      // 4. Validate maximum file size
      if (bytes.length > MAX_FILE_SIZE) {
        return res.status(413).json({
          success: false,
          error: 'फोटो खूप मोठा आहे. कमाल मर्यादा ५ MB आहे. (File too large. Maximum size is 5MB)'
        });
      }

      // 5. Deep Magic-Bytes Content Validation (not extension or Content-Type header)
      const mime = detectImageMime(bytes);
      if (!mime) {
        return res.status(400).json({
          success: false,
          error: 'अवैध फाइल स्वरूप. फक्त JPEG, PNG आणि WebP फाइल्स स्वीकारल्या जातील. (Invalid image format. Only JPEG, PNG, and WebP are allowed.)'
        });
      }

      // 6. Deep Content Sanitization (Polyglot / Embedded Code Detection)
      if (containsMaliciousPayload(bytes)) {
        console.warn(`[SECURITY] Blocked potentially malicious upload attempt from IP ${req.ip}`);
        return res.status(400).json({
          success: false,
          error: 'अवैध सामग्री आढळली (Executable code, scripts, or embedded HTML are forbidden)'
        });
      }

      // 7. Store in isolated SQLite storage outside web root with cryptographically random ID
      const id = crypto.randomBytes(16).toString('hex');
      const ownerId = req.user?.id || 'anonymous';
      const mediaPath = `/media/${id}`;

      await runQuery(`
        INSERT INTO media (id, owner_id, kind, mime, bytes, size, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `, [id, ownerId, kind, mime, bytes, bytes.length]);

      // 8. If uploading profile picture and user is authenticated, link to members table
      if (kind === 'profile' && req.user?.id) {
        await runQuery('UPDATE members SET photo = ? WHERE id = ?', [mediaPath, req.user.id]);
      }

      // 9. Return safe response matching mobile app & web client contracts
      res.status(201).json({
        success: true,
        id,
        path: mediaPath,
        photo: mediaPath,
        image: mediaPath
      });
    } catch (err) {
      next(err);
    }
  }
);

// ============================================================
// 3. DELETE /api/media/profile (Delete current user's profile photo)
// ============================================================
router.delete('/profile', authenticateToken, async (req, res, next) => {
  try {
    const ownerId = req.user?.id;
    if (ownerId) {
      await runQuery('DELETE FROM media WHERE owner_id = ? AND kind = ?', [ownerId, 'profile']);
      await runQuery('UPDATE members SET photo = NULL WHERE id = ?', [ownerId]);
    }
    res.json({ success: true, message: 'प्रोफाइल फोटो हटवला (Profile photo removed)' });
  } catch (err) {
    next(err);
  }
});

export default router;
