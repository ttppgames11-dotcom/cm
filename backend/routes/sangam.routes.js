import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { uniqueRandomId } from '../utils/ids.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/sangam/referrals
router.get('/referrals', async (req, res, next) => {
  try {
    const { memberId, status } = req.query;
    let sql = 'SELECT * FROM referrals WHERE 1=1';
    const params = [];

    if (memberId) {
      sql += ' AND (giver_id = ? OR recipient_id = ?)';
      params.push(memberId, memberId);
    }
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';
    const referrals = await all(sql, params);
    res.json({ success: true, count: referrals.length, referrals });
  } catch (err) {
    next(err);
  }
});

// POST /api/sangam/referrals
router.post('/referrals', async (req, res, next) => {
  try {
    const title = req.body.title;
    const category = req.body.category || 'सामान्य';
    const giver_id = req.body.giver_id || req.body.giverId || (req.user && req.user.id) || 'M1001';
    const giver_name = req.body.giver_name || req.body.giverName || (req.user && req.user.name) || 'अमोल जाधव';
    const recipient_id = req.body.recipient_id || req.body.recipientId || 'M1008';
    const recipient_name = req.body.recipient_name || req.body.recipientName || 'विकास गायकवाड';
    const client_name = req.body.client_name || req.body.clientName;
    const client_phone = req.body.client_phone || req.body.clientPhone || '';
    const client_email = req.body.client_email || req.body.clientEmail || '';
    const value = req.body.value || 0;
    const notes = req.body.notes || '';

    if (!title || !client_name) {
      return res.status(400).json({ success: false, error: 'शीर्षक आणि ग्राहकाचे नाव आवश्यक आहे.' });
    }

    const id = await uniqueRandomId('referrals', () => 'REF-' + Math.floor(100 + Math.random() * 900));

    await runQuery(`
      INSERT INTO referrals (id, title, category, giver_id, giver_name, recipient_id, recipient_name, client_name, client_phone, client_email, status, value, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?, ?, datetime('now'))
    `, [id, title, category, giver_id, giver_name, recipient_id, recipient_name, client_name, client_phone, client_email, value, notes]);

    const created = await get('SELECT * FROM referrals WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'नवीन संदर्भ यशस्वीरित्या नोंदवला!', referral: created });
  } catch (err) {
    next(err);
  }
});

// PUT /api/sangam/referrals/:id/status
router.put('/referrals/:id/status', async (req, res, next) => {
  try {
    const { status, value } = req.body;
    await runQuery(`
      UPDATE referrals SET status = ?, value = COALESCE(?, value) WHERE id = ?
    `, [status, value, req.params.id]);

    const updated = await get('SELECT * FROM referrals WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'स्थिती अद्ययावत केली!', referral: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/sangam/meetings
router.get('/meetings', async (req, res, next) => {
  try {
    const { memberId } = req.query;
    let sql = 'SELECT * FROM meetings WHERE 1=1';
    const params = [];

    if (memberId) {
      sql += ' AND (requester_id = ? OR recipient_id = ?)';
      params.push(memberId, memberId);
    }

    sql += ' ORDER BY date DESC';
    const meetings = await all(sql, params);
    res.json({ success: true, count: meetings.length, meetings });
  } catch (err) {
    next(err);
  }
});

// POST /api/sangam/meetings
router.post('/meetings', async (req, res, next) => {
  try {
    const requester_id = req.body.requester_id || req.body.requesterId || (req.user && req.user.id) || 'M1001';
    const requester_name = req.body.requester_name || req.body.requesterName || (req.user && req.user.name) || 'अमोल जाधव';
    const recipient_id = req.body.recipient_id || req.body.recipientId || 'M1002';
    const recipient_name = req.body.recipient_name || req.body.recipientName || 'प्रिया देशमुख';
    const date = req.body.date || '२० ऑक्टोबर २०२६';
    const time = req.body.time || 'सकाळी ११:००';
    const topic = req.body.topic || 'व्यवसाय संगम १-टू-१ चर्चा';
    const location = req.body.location || '';
    const notes = req.body.notes || '';

    const id = 'MT-' + Date.now();

    await runQuery(`
      INSERT INTO meetings (id, requester_id, requester_name, recipient_id, recipient_name, date, time, topic, location, status, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?, datetime('now'))
    `, [id, requester_id, requester_name, recipient_id, recipient_name, date, time, topic, location, notes]);

    if (recipient_id) {
      const notifId = 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      const notifTitle = 'नवीन व्यवसाय बैठक विनंती (New Meeting Request)';
      const notifMsg = `${requester_name} यांनी आपल्यासोबत बैठकीची विनंती केली आहे (${date} ${time}).`;
      await runQuery(`
        INSERT INTO notifications (id, member_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, ?, 'meeting', 0, datetime('now'))
      `, [notifId, recipient_id, notifTitle, notifMsg]);
    }

    const created = await get('SELECT * FROM meetings WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'भेट नियोजित केली!', meeting: created });
  } catch (err) {
    next(err);
  }
});

// PUT /api/sangam/meetings/:id (Reschedule)
router.put('/meetings/:id', authenticateToken, async (req, res, next) => {
  try {
    const meeting = await get('SELECT * FROM meetings WHERE id = ?', [req.params.id]);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        code: 'MEETING_NOT_FOUND',
        error: 'बैठक आढळली नाही (Meeting not found).'
      });
    }

    const currentUserId = req.user?.id;
    const userRole = (req.user?.role || '').toLowerCase();
    const isAdminOrCeo = userRole === 'admin' || userRole === 'ceo';
    const isRequester = currentUserId && meeting.requester_id === currentUserId;
    const isRecipient = currentUserId && meeting.recipient_id === currentUserId;
    const isParticipant = isRequester || isRecipient;

    if (!isParticipant && !isAdminOrCeo) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        error: 'परवानगी नाकारली (Access forbidden).'
      });
    }

    const { date, time, location, notes } = req.body;

    if (!date || typeof date !== 'string' || !date.trim()) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        error: 'बैठकीची तारीख आवश्यक आहे (Meeting date is required).'
      });
    }

    const cleanDate = date.trim();
    const cleanTime = (time !== undefined && time !== null) ? String(time).trim() : (meeting.time || '');
    const cleanLocation = (location !== undefined && location !== null) ? String(location).trim() : (meeting.location || '');
    const cleanNotes = (notes !== undefined && notes !== null) ? String(notes).trim() : (meeting.notes || '');
    const updatedAt = new Date().toISOString();

    await runQuery(`
      UPDATE meetings
      SET date = ?, time = ?, location = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [cleanDate, cleanTime, cleanLocation, cleanNotes, updatedAt, req.params.id]);

    const updated = await get('SELECT * FROM meetings WHERE id = ?', [req.params.id]);

    // Write audit log entry (RESCHEDULE_MEETING)
    const logId = 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const currentUserName = req.user?.name || (isRequester ? meeting.requester_name : (isRecipient ? meeting.recipient_name : 'Admin'));
    const auditDetails = JSON.stringify({
      meetingId: req.params.id,
      oldDate: meeting.date,
      newDate: cleanDate,
      oldTime: meeting.time,
      newTime: cleanTime,
      location: cleanLocation
    });

    await runQuery(`
      INSERT INTO audit_logs (id, user_id, user_name, action, details, created_at)
      VALUES (?, ?, ?, 'RESCHEDULE_MEETING', ?, datetime('now'))
    `, [logId, currentUserId || 'system', currentUserName, auditDetails]);

    // Notify the other participant(s)
    const notifyTargetIds = [];
    if (isRequester && meeting.recipient_id) {
      notifyTargetIds.push(meeting.recipient_id);
    } else if (isRecipient && meeting.requester_id) {
      notifyTargetIds.push(meeting.requester_id);
    } else if (isAdminOrCeo) {
      if (meeting.recipient_id && meeting.recipient_id !== currentUserId) notifyTargetIds.push(meeting.recipient_id);
      if (meeting.requester_id && meeting.requester_id !== currentUserId) notifyTargetIds.push(meeting.requester_id);
    }

    const notifTitle = 'व्यवसाय बैठक पुनर्नियोजित (Meeting Rescheduled)';
    const notifMsg = `आपली बैठक नवीन वेळेसाठी (${cleanDate}${cleanTime ? ' ' + cleanTime : ''}) पुनर्नियोजित करण्यात आली आहे.`;

    for (const targetId of notifyTargetIds) {
      const notifId = 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      await runQuery(`
        INSERT INTO notifications (id, member_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, ?, 'meeting', 0, datetime('now'))
      `, [notifId, targetId, notifTitle, notifMsg]);
    }

    res.json({
      success: true,
      message: 'बैठक पुनर्नियोजित केली!',
      meeting: updated
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/sangam/meetings/:id/status
router.put('/meetings/:id/status', authenticateToken, async (req, res, next) => {
  try {
    const meeting = await get('SELECT * FROM meetings WHERE id = ?', [req.params.id]);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        code: 'MEETING_NOT_FOUND',
        error: 'बैठक आढळली नाही (Meeting not found).'
      });
    }

    const currentUserId = req.user?.id;
    const userRole = (req.user?.role || '').toLowerCase();
    const isAdminOrCeo = userRole === 'admin' || userRole === 'ceo';
    const isRequester = currentUserId && meeting.requester_id === currentUserId;
    const isRecipient = currentUserId && meeting.recipient_id === currentUserId;
    const isParticipant = isRequester || isRecipient;

    if (!isParticipant && !isAdminOrCeo) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        error: 'परवानगी नाकारली (Access forbidden).'
      });
    }

    const rawStatus = (req.body.status || '').toLowerCase().trim();
    let mappedStatus;
    let auditAction;

    if (rawStatus === 'cancelled' || rawStatus === 'रद्द (cancelled)' || rawStatus === 'रद्द') {
      mappedStatus = 'रद्द (Cancelled)';
      auditAction = 'CANCEL_MEETING';
    } else if (rawStatus === 'completed' || rawStatus === 'पूर्ण (completed)' || rawStatus === 'पूर्ण') {
      mappedStatus = 'पूर्ण (Completed)';
      auditAction = 'COMPLETE_MEETING';
    } else {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        error: 'अवैध स्थिती. स्थिती "cancelled" किंवा "completed" असणे आवश्यक आहे (Status must be "cancelled" or "completed").'
      });
    }

    const updatedAt = new Date().toISOString();

    await runQuery(`
      UPDATE meetings
      SET status = ?, updated_at = ?
      WHERE id = ?
    `, [mappedStatus, updatedAt, req.params.id]);

    const updated = await get('SELECT * FROM meetings WHERE id = ?', [req.params.id]);

    // Write audit log entry
    const logId = 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const currentUserName = req.user?.name || (isRequester ? meeting.requester_name : (isRecipient ? meeting.recipient_name : 'Admin'));
    const auditDetails = JSON.stringify({
      meetingId: req.params.id,
      oldStatus: meeting.status,
      newStatus: mappedStatus
    });

    await runQuery(`
      INSERT INTO audit_logs (id, user_id, user_name, action, details, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `, [logId, currentUserId || 'system', currentUserName, auditAction, auditDetails]);

    // Notify the other participant(s)
    const notifyTargetIds = [];
    if (isRequester && meeting.recipient_id) {
      notifyTargetIds.push(meeting.recipient_id);
    } else if (isRecipient && meeting.requester_id) {
      notifyTargetIds.push(meeting.requester_id);
    } else if (isAdminOrCeo) {
      if (meeting.recipient_id && meeting.recipient_id !== currentUserId) notifyTargetIds.push(meeting.recipient_id);
      if (meeting.requester_id && meeting.requester_id !== currentUserId) notifyTargetIds.push(meeting.requester_id);
    }

    const notifTitle = mappedStatus === 'रद्द (Cancelled)'
      ? 'व्यवसाय बैठक रद्द केली (Meeting Cancelled)'
      : 'व्यवसाय बैठक पूर्ण झाली (Meeting Completed)';
    const notifMsg = mappedStatus === 'रद्द (Cancelled)'
      ? `आपली बैठक (${meeting.date || ''}) रद्द करण्यात आली आहे.`
      : `आपली बैठक (${meeting.date || ''}) यशस्वीरीत्या पूर्ण झाली म्हणून नोंदवली गेली आहे.`;

    for (const targetId of notifyTargetIds) {
      const notifId = 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      await runQuery(`
        INSERT INTO notifications (id, member_id, title, message, type, is_read, created_at)
        VALUES (?, ?, ?, ?, 'meeting', 0, datetime('now'))
      `, [notifId, targetId, notifTitle, notifMsg]);
    }

    res.json({
      success: true,
      message: 'बैठक स्थिती अद्ययावत केली!',
      meeting: updated
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/sangam/metrics
router.get('/metrics', async (req, res, next) => {
  try {
    const totalReferrals = await get('SELECT COUNT(*) as count FROM referrals');
    const wonDeals = await get("SELECT COUNT(*) as count, SUM(value) as totalValue FROM referrals WHERE status = 'Deal Won'");
    const totalMeetings = await get('SELECT COUNT(*) as count FROM meetings');

    res.json({
      success: true,
      metrics: {
        totalReferrals: Number(totalReferrals?.count) || 0,
        wonDeals: Number(wonDeals?.count) || 0,
        // Real total only (it used to show a made-up 470000 when there were no won deals).
        totalBusinessValue: Number(wonDeals?.totalValue) || 0,
        totalMeetings: Number(totalMeetings?.count) || 0
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;

