import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize, isValidEmail } from '../utils/validator.js';
import { runQuery, all } from '../../database/database.js';

const router = Router();

const MODERATOR_ROLES = ['superadmin', 'admin', 'ceo', 'center_manager', 'center_admin', 'district_admin', 'taluka_admin'];
const isModerator = (user) => user && MODERATOR_ROLES.includes(user.role);

// Ensure moderation_reports table exists
async function ensureModerationReportsTable() {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS moderation_reports (
      id TEXT PRIMARY KEY,
      content_type TEXT NOT NULL,
      content_id TEXT NOT NULL,
      reporter_id TEXT,
      reporter_name TEXT,
      reporter_email TEXT,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT DEFAULT 'pending_urgent',
      created_at TEXT
    )
  `);
  try {
    await runQuery(`ALTER TABLE moderation_reports ADD COLUMN reporter_email TEXT`);
  } catch (_) {}
}

// POST /api/legal/child-safety-report
// Priority intake for Google Play Child Safety Standards (CSAE / CSAM Zero-Tolerance)
router.post('/child-safety-report', optionalToken, async (req, res) => {
  try {
    await ensureModerationReportsTable();

    const {
      reporterName,
      reporterEmail,
      evidenceUrl,
      description,
      contentType = 'csae_child_safety_violation'
    } = req.body;

    const cleanEvidence = sanitize(evidenceUrl);
    const cleanDesc = sanitize(description);

    if (!cleanEvidence || !cleanDesc) {
      return sendError(res, 'कृपया संशयास्पद संदर्भ (URL/ID) आणि सविस्तर माहिती प्रविष्ट करा.', 'MISSING_FIELDS', 400);
    }

    const cleanReporterEmail = reporterEmail ? sanitize(reporterEmail) : (req.user?.email || null);
    if (cleanReporterEmail && !isValidEmail(cleanReporterEmail)) {
      return sendError(res, 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.', 'INVALID_EMAIL', 400);
    }

    const reportId = `CSAE-REP-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();
    const finalReporterName = sanitize(reporterName) || req.user?.name || 'जागरूक नागरिक (Anonymous)';
    const reporterId = req.user?.id || 'ANONYMOUS';

    // 1. Insert into unified SQLite database
    await runQuery(`
      INSERT INTO moderation_reports (
        id, content_type, content_id, reporter_id, reporter_name, reporter_email, reason, details, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_urgent', ?)
    `, [
      reportId,
      'CSAE_CHILD_SAFETY_REPORT',
      cleanEvidence,
      reporterId,
      finalReporterName,
      cleanReporterEmail,
      'CSAE_PROHIBITION_VIOLATION',
      cleanDesc,
      now
    ]);

    // 2. Also register in memory / audit logs for real-time alerting
    const inMemReport = {
      id: reportId,
      type: 'CSAE_CHILD_SAFETY',
      evidenceUrl: cleanEvidence,
      reporterName: finalReporterName,
      reporterEmail: cleanReporterEmail,
      reporterId,
      details: cleanDesc,
      status: 'pending_urgent',
      priority: 'CRITICAL_URGENT',
      createdAt: now
    };

    db.insert('moderationReports', inMemReport);
    db.addAuditLog('CHILD_SAFETY_REPORT_FILED', reporterId, {
      reportId,
      priority: 'CRITICAL_CSAE',
      evidenceUrl: cleanEvidence
    });

    console.log(`🚨 [CHILD SAFETY ALERT] Priority CSAE report filed: ${reportId} for: ${cleanEvidence}`);

    return sendSuccess(res, 'बाल सुरक्षा तक्रार तात्काळ नोंदवली गेली आहे. आमची सुरक्षा समिती प्राधान्याने कारवाई करत आहे.', {
      reportId,
      status: 'RECEIVED_URGENT',
      actionSLA: 'Immediate Review within 1 hour',
      supportContact: 'child-safety@connectmaratha.com'
    }, 201);
  } catch (err) {
    console.error('Error handling child safety report:', err);
    return sendError(res, 'तक्रार नोंदवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.', 'SERVER_ERROR', 500);
  }
});

// GET /api/legal/child-safety-status
// Verification status and designated compliance contact info
router.get('/child-safety-status', (req, res) => {
  return sendSuccess(res, 'Connect Maratha बाल सुरक्षा धोरण स्थिती', {
    compliance: {
      status: 'FULLY_COMPLIANT',
      policyStandard: 'Google Play Child Safety Standards (Explicit CSAE/CSAM Prohibition)',
      designatedDesk: 'Child Safety & Compliance Team',
      email: 'child-safety@connectmaratha.com',
      backupEmail: 'support@connectmaratha.com',
      helplines: {
        indiaChildline: '1098',
        nationalEmergency: '112',
        cyberCrimeHelpline: '1930',
        cyberCrimePortal: 'https://cybercrime.gov.in'
      },
      publishedUrl: 'https://connectmaratha.com/child-safety'
    }
  });
});

// GET /api/legal/reports
// Moderator/Admin viewing reports queue
router.get('/reports', authenticateToken, async (req, res) => {
  if (!isModerator(req.user)) {
    return sendError(res, 'प्रशासकीय परवानगी आवश्यक.', 'FORBIDDEN', 403);
  }

  try {
    await ensureModerationReportsTable();
    const rows = await all(`SELECT * FROM moderation_reports ORDER BY created_at DESC LIMIT 100`);
    return sendSuccess(res, 'सर्व तक्रार व सुरक्षा अहवाल यादी', { reports: rows, count: rows.length });
  } catch (err) {
    console.error('Error fetching reports:', err);
    const inMem = db.getCollection('moderationReports') || [];
    return sendSuccess(res, 'सर्व तक्रार अहवाल यादी (कॅशे)', { reports: inMem, count: inMem.length });
  }
});

export default router;
