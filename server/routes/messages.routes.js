import { Router } from 'express';
import { runQuery, get, all } from '../../database/database.js';
import { optionalToken, authenticateToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize } from '../utils/validator.js';

const router = Router();

// Helper to resolve user ID from token or query/body/header
function resolveUserId(req) {
  return req.user?.id || req.headers['x-user-id'] || req.query.user_id || req.query.member_id || req.body?.sender_id || req.body?.senderId || null;
}

// GET /api/messages/search/members - Search registered members to start a new chat
router.get('/search/members', optionalToken, async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const currentUserId = resolveUserId(req);
    let sql = `
      SELECT id, name, avatar, photo, profession, business, city, district, role 
      FROM members 
      WHERE 1=1
    `;
    const params = [];
    if (currentUserId) {
      sql += ' AND id != ?';
      params.push(currentUserId);
    }
    if (q) {
      sql += ` AND (name LIKE ? OR profession LIKE ? OR city LIKE ? OR district LIKE ? OR id LIKE ?)`;
      const queryPattern = `%${q}%`;
      params.push(queryPattern, queryPattern, queryPattern, queryPattern, queryPattern);
    }
    sql += ' ORDER BY name ASC LIMIT 25';
    const members = await all(sql, params);
    return sendSuccess(res, 'सदस्य शोध निकाल', { members });
  } catch (err) {
    return sendError(res, err.message, 'SEARCH_MEMBERS_FAILED', 500);
  }
});

// GET /api/messages/conversations OR GET /api/messages
// Returns all active conversation threads for the user
router.get(['/', '/conversations'], optionalToken, async (req, res) => {
  try {
    const currentUserId = resolveUserId(req);

    if (!currentUserId) {
      return sendSuccess(res, 'संभाषण यादी', { conversations: [] });
    }

    // Find all distinct partner IDs
    const partners = await all(`
      SELECT 
        CASE WHEN sender_id = ? THEN recipient_id ELSE sender_id END AS partner_id,
        MAX(created_at) AS last_message_at
      FROM direct_messages
      WHERE sender_id = ? OR recipient_id = ?
      GROUP BY partner_id
      ORDER BY last_message_at DESC
    `, [currentUserId, currentUserId, currentUserId]);

    const conversations = [];

    for (const p of partners) {
      const partnerId = p.partner_id;
      if (!partnerId) continue;

      // Get partner profile from members
      const partner = await get(`
        SELECT id, name, avatar, photo, profession, business, city, district, role 
        FROM members 
        WHERE id = ? OR phone = ?
      `, [partnerId, partnerId]);

      // Get last message
      const lastMsg = await get(`
        SELECT * FROM direct_messages
        WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
        ORDER BY created_at DESC LIMIT 1
      `, [currentUserId, partnerId, partnerId, currentUserId]);

      // Count unread messages sent by this partner to current user
      const unreadRow = await get(`
        SELECT COUNT(*) as unread_count FROM direct_messages
        WHERE sender_id = ? AND recipient_id = ? AND is_read = 0
      `, [partnerId, currentUserId]);

      conversations.push({
        id: partnerId,
        partnerId: partnerId,
        name: partner?.name || lastMsg?.recipient_name || lastMsg?.sender_name || 'मराठा सदस्य',
        role: partner?.profession || (partner?.district ? `${partner.district} · समाज सदस्य` : 'मराठा सदस्य'),
        avatar: partner?.avatar || '👤',
        photo: partner?.photo || '',
        online: true,
        lastMsg: lastMsg?.text || 'संभाषण सुरू करा...',
        time: lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }) : 'आत्ताच',
        rawTime: lastMsg?.created_at || '',
        unread: unreadRow?.unread_count || 0
      });
    }

    return sendSuccess(res, 'संभाषण यादी', { conversations });
  } catch (err) {
    return sendError(res, err.message, 'FETCH_CONVERSATIONS_FAILED', 500);
  }
});

// GET /api/messages/:partnerId
// Retrieve full message thread with a specific member
router.get('/:partnerId', optionalToken, async (req, res) => {
  try {
    const currentUserId = resolveUserId(req);
    const partnerId = req.params.partnerId;

    if (!partnerId) {
      return sendError(res, 'जोडीदार सभासद आयडी आवश्यक आहे.', 'PARTNER_ID_REQUIRED', 400);
    }

    // Retrieve partner profile
    const partner = await get(`
      SELECT id, name, avatar, photo, profession, city, district, role
      FROM members WHERE id = ? OR phone = ?
    `, [partnerId, partnerId]);

    // Mark messages sent by partner to current user as read
    await runQuery(`
      UPDATE direct_messages 
      SET is_read = 1 
      WHERE sender_id = ? AND recipient_id = ? AND is_read = 0
    `, [partnerId, currentUserId]);

    // Fetch messages
    const rawMessages = await all(`
      SELECT * FROM direct_messages
      WHERE (sender_id = ? AND recipient_id = ?) 
         OR (sender_id = ? AND recipient_id = ?)
      ORDER BY created_at ASC
    `, [currentUserId, partnerId, partnerId, currentUserId]);

    const messages = rawMessages.map(m => ({
      id: m.id,
      sender: m.sender_id === currentUserId ? 'me' : 'them',
      senderId: m.sender_id,
      senderName: m.sender_name,
      recipientId: m.recipient_id,
      text: m.text,
      time: m.created_at ? new Date(m.created_at).toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }) : 'आत्ताच',
      createdAt: m.created_at,
      read: m.is_read === 1,
      status: m.status || 'sent'
    }));

    return sendSuccess(res, 'संदेश इतिहास', {
      partner: partner || { id: partnerId, name: 'मराठा सदस्य', avatar: '👤' },
      messages
    });
  } catch (err) {
    return sendError(res, err.message, 'FETCH_MESSAGES_FAILED', 500);
  }
});

// POST /api/messages/:partnerId OR POST /api/messages
// Send direct message to a user
router.post(['/', '/:partnerId'], optionalToken, async (req, res) => {
  try {
    const currentUserId = resolveUserId(req);
    const targetId = req.params.partnerId || req.body.recipientId || req.body.partnerId;
    const rawText = req.body.text || req.body.message || '';

    if (!currentUserId) {
      return sendError(res, 'संदेश पाठवण्यासाठी प्रथम लॉगिन करणे आवश्यक आहे.', 'AUTH_REQUIRED', 401);
    }
    if (!targetId) {
      return sendError(res, 'प्राप्तकर्ता सभासद आयडी आवश्यक आहे.', 'RECIPIENT_REQUIRED', 400);
    }
    if (String(currentUserId).toUpperCase() === String(targetId).toUpperCase()) {
      return sendError(res, 'स्वतःला संदेश पाठवता येत नाही.', 'SELF_MESSAGE', 400);
    }
    if (!rawText.trim()) {
      return sendError(res, 'संदेश मजकूर रिकामा असू शकत नाही.', 'EMPTY_MESSAGE', 400);
    }

    const cleanText = sanitize(rawText);

    // Resolve sender and recipient details from members
    const sender = await get('SELECT id, name, avatar FROM members WHERE id = ? OR phone = ?', [currentUserId, currentUserId]);
    const recipient = await get('SELECT id, name, avatar FROM members WHERE id = ? OR phone = ?', [targetId, targetId]);

    const senderName = sender?.name || req.user?.name || req.body.sender_name || 'मराठा सदस्य';
    const senderAvatar = sender?.avatar || '👤';
    const recipientName = recipient?.name || req.body.recipient_name || 'मराठा सदस्य';
    const recipientAvatar = recipient?.avatar || '👤';

    const msgId = `MSG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const convId = [currentUserId, targetId].sort().join('_');
    const nowIso = new Date().toISOString();

    await runQuery(`
      INSERT INTO direct_messages (
        id, conversation_id, sender_id, sender_name, sender_avatar,
        recipient_id, recipient_name, recipient_avatar, text, status, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'sent', 0, ?)
    `, [
      msgId, convId, currentUserId, senderName, senderAvatar,
      targetId, recipientName, recipientAvatar, cleanText, nowIso
    ]);

    const createdMsg = {
      id: msgId,
      sender: 'me',
      senderId: currentUserId,
      senderName,
      recipientId: targetId,
      recipientName,
      text: cleanText,
      time: new Date(nowIso).toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: nowIso,
      read: false,
      status: 'sent'
    };

    return sendSuccess(res, 'संदेश यशस्वीरीत्या पाठवला!', { message: createdMsg, data: createdMsg }, 201);
  } catch (err) {
    return sendError(res, err.message, 'SEND_MESSAGE_FAILED', 500);
  }
});

// PUT /api/messages/:id - Edit message
router.put('/:id', optionalToken, async (req, res) => {
  try {
    const currentUserId = resolveUserId(req);
    const msgId = req.params.id;
    const newText = sanitize(req.body.text || '');

    if (!newText.trim()) {
      return sendError(res, 'नवीन संदेश मजकूर आवश्यक आहे.', 'EMPTY_TEXT', 400);
    }

    const existing = await get('SELECT * FROM direct_messages WHERE id = ?', [msgId]);
    if (!existing) {
      return sendError(res, 'संदेश आढळला नाही.', 'MESSAGE_NOT_FOUND', 404);
    }

    if (existing.sender_id !== currentUserId && req.user?.role !== 'superadmin') {
      return sendError(res, 'केवळ पाठवणारा हा संदेश संपादित करू शकतो.', 'FORBIDDEN', 403);
    }

    await runQuery('UPDATE direct_messages SET text = ? WHERE id = ?', [newText, msgId]);
    return sendSuccess(res, 'संदेश अद्ययावत केला!', { id: msgId, text: newText, edited: true });
  } catch (err) {
    return sendError(res, err.message, 'UPDATE_MESSAGE_FAILED', 500);
  }
});

// DELETE /api/messages/:id - Delete message
router.delete('/:id', optionalToken, async (req, res) => {
  try {
    const currentUserId = resolveUserId(req);
    const msgId = req.params.id;

    const existing = await get('SELECT * FROM direct_messages WHERE id = ?', [msgId]);
    if (!existing) {
      return sendError(res, 'संदेश आढळला नाही.', 'MESSAGE_NOT_FOUND', 404);
    }

    if (existing.sender_id !== currentUserId && req.user?.role !== 'superadmin') {
      return sendError(res, 'हा संदेश हटवण्याची परवानगी नाही.', 'FORBIDDEN', 403);
    }

    await runQuery('DELETE FROM direct_messages WHERE id = ?', [msgId]);
    return sendSuccess(res, 'संदेश यशस्वीरीत्या हटवला गेला!', { deletedId: msgId });
  } catch (err) {
    return sendError(res, err.message, 'DELETE_MESSAGE_FAILED', 500);
  }
});

export default router;
