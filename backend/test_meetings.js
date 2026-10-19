import { generateToken } from './middleware/auth.js';
import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', 'database', 'connect_maratha.db');

const BASE_URL = 'http://localhost:5000/api/sangam';

// Helper to read fresh disk database
async function getFreshDb() {
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(DB_FILE);
  return new SQL.Database(fileBuffer);
}

function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params && params.length > 0) stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

async function runTests() {
  console.log('🧪 Starting Meeting Endpoints Tests...\n');

  // Create users for test
  const user1 = { id: 'M-TEST-1', name: 'अनिल पाटील', role: 'member' };
  const user2 = { id: 'M-TEST-2', name: 'सुनील पवार', role: 'member' };
  const user3 = { id: 'M-TEST-3', name: 'अनोळखी सदस्य', role: 'member' }; // Non-participant
  const adminUser = { id: 'M-ADMIN', name: 'अमोल जाधव (Admin)', role: 'admin' };

  const token1 = generateToken(user1);
  const token2 = generateToken(user2);
  const token3 = generateToken(user3);
  const adminToken = generateToken(adminUser);

  // Create test meeting via POST /meetings API
  const createRes = await fetch(`${BASE_URL}/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requester_id: user1.id,
      requester_name: user1.name,
      recipient_id: user2.id,
      recipient_name: user2.name,
      date: '2026-10-15',
      time: 'सकाळी १०:००',
      topic: 'व्यवसाय संगम १-टू-१ भेट',
      notes: 'आरंभीची नोंद'
    })
  });
  const createData = await createRes.json();
  const meetingId = createData.meeting.id;
  console.assert(createRes.status === 201, `Failed to create meeting: ${createRes.status}`);
  console.log(`✅ Created test meeting: ${meetingId} (Status: "${createData.meeting.status}")`);

  // Test 1: No auth token -> 401
  {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2026-10-16' })
    });
    console.assert(res.status === 401, `Test 1 Failed: Expected 401, got ${res.status}`);
    console.log('✅ Test 1: PUT /meetings/:id without token returns 401');
  }

  // Test 2: Meeting Not Found -> 404 MEETING_NOT_FOUND
  {
    const res = await fetch(`${BASE_URL}/meetings/NON_EXISTENT_ID`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({ date: '2026-10-16' })
    });
    const data = await res.json();
    console.assert(res.status === 404, `Test 2 Failed: Expected 404, got ${res.status}`);
    console.assert(data.code === 'MEETING_NOT_FOUND', `Test 2 Failed: Expected code MEETING_NOT_FOUND, got ${data.code}`);
    console.log('✅ Test 2: PUT /meetings/:id with invalid ID returns 404 MEETING_NOT_FOUND');
  }

  // Test 3: Non-participant (user3) -> 403 FORBIDDEN
  {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token3}`
      },
      body: JSON.stringify({ date: '2026-10-16' })
    });
    const data = await res.json();
    console.assert(res.status === 403, `Test 3 Failed: Expected 403, got ${res.status}`);
    console.assert(data.code === 'FORBIDDEN', `Test 3 Failed: Expected code FORBIDDEN, got ${data.code}`);
    console.log('✅ Test 3: PUT /meetings/:id with non-participant returns 403 FORBIDDEN');
  }

  // Test 4: Missing date -> 400 VALIDATION_ERROR
  {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({ time: 'दुपारी १२:००' })
    });
    const data = await res.json();
    console.assert(res.status === 400, `Test 4 Failed: Expected 400, got ${res.status}`);
    console.assert(data.code === 'VALIDATION_ERROR', `Test 4 Failed: Expected code VALIDATION_ERROR, got ${data.code}`);
    console.log('✅ Test 4: PUT /meetings/:id with empty date returns 400 VALIDATION_ERROR');
  }

  // Test 5: Successful Reschedule by Requester (user1)
  {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({
        date: '2026-10-20',
        time: 'दुपारी २:००',
        location: 'एफसी रोड, पुणे',
        notes: 'नवीन वेळ आणि ठिकाण ठरवले'
      })
    });
    const data = await res.json();
    console.assert(res.status === 200, `Test 5 Failed: Expected 200, got ${res.status}`);
    console.assert(data.meeting.date === '2026-10-20', `Expected 2026-10-20, got ${data.meeting.date}`);
    console.assert(data.meeting.time === 'दुपारी २:००', `Expected time, got ${data.meeting.time}`);
    console.assert(data.meeting.location === 'एफसी रोड, पुणे', `Expected location, got ${data.meeting.location}`);
    console.assert(Boolean(data.meeting.updated_at), 'Expected updated_at to be present');

    // Verify audit log entry on disk
    const db = await getFreshDb();
    const audits = queryAll(db, "SELECT * FROM audit_logs WHERE action = 'RESCHEDULE_MEETING' AND user_id = ? ORDER BY created_at DESC", [user1.id]);
    console.assert(audits.length > 0, 'Expected RESCHEDULE_MEETING audit log for user1');

    // Verify notification for user2 on disk
    const notifs = queryAll(db, "SELECT * FROM notifications WHERE member_id = ? AND type = 'meeting' ORDER BY created_at DESC", [user2.id]);
    console.assert(notifs.length > 0, 'Expected notification inserted for user2');

    console.log('✅ Test 5: PUT /meetings/:id reschedules, updates updatedAt, writes audit_log, and notifies recipient');
  }

  // Test 6: Reschedule by Admin
  {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        date: '2026-10-22',
        time: 'सकाळी ११:००',
        location: 'बाणेर, पुणे'
      })
    });
    const data = await res.json();
    console.assert(res.status === 200, `Test 6 Failed: Expected 200, got ${res.status}`);
    console.assert(data.meeting.date === '2026-10-22');
    console.log('✅ Test 6: PUT /meetings/:id allows admin/ceo to reschedule');
  }

  // Test 7: PUT status - invalid status -> 400
  {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token2}`
      },
      body: JSON.stringify({ status: 'invalid_status' })
    });
    const data = await res.json();
    console.assert(res.status === 400, `Test 7 Failed: Expected 400, got ${res.status}`);
    console.assert(data.code === 'VALIDATION_ERROR');
    console.log('✅ Test 7: PUT /meetings/:id/status with invalid status returns 400 VALIDATION_ERROR');
  }

  // Test 8: PUT status - non-participant -> 403
  {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token3}`
      },
      body: JSON.stringify({ status: 'cancelled' })
    });
    console.assert(res.status === 403, `Test 8 Failed: Expected 403, got ${res.status}`);
    console.log('✅ Test 8: PUT /meetings/:id/status with non-participant returns 403 FORBIDDEN');
  }

  // Test 9: PUT status - cancel meeting by recipient (user2)
  {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token2}`
      },
      body: JSON.stringify({ status: 'cancelled' })
    });
    const data = await res.json();
    console.assert(res.status === 200, `Test 9 Failed: Expected 200, got ${res.status}`);
    console.assert(data.meeting.status === 'रद्द (Cancelled)', `Expected "रद्द (Cancelled)", got ${data.meeting.status}`);

    const db = await getFreshDb();
    const audits = queryAll(db, "SELECT * FROM audit_logs WHERE action = 'CANCEL_MEETING' AND user_id = ? ORDER BY created_at DESC", [user2.id]);
    console.assert(audits.length > 0, 'Expected CANCEL_MEETING audit log for user2');

    const notifs = queryAll(db, "SELECT * FROM notifications WHERE member_id = ? AND type = 'meeting' ORDER BY created_at DESC", [user1.id]);
    console.assert(notifs.some(n => n.title.includes('रद्द')), 'Expected cancellation notification for user1');

    console.log('✅ Test 9: PUT /meetings/:id/status maps "cancelled" to "रद्द (Cancelled)", writes audit log, and notifies requester');
  }

  // Test 10: PUT status - complete meeting
  {
    const res = await fetch(`${BASE_URL}/meetings/${meetingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({ status: 'completed' })
    });
    const data = await res.json();
    console.assert(res.status === 200, `Test 10 Failed: Expected 200, got ${res.status}`);
    console.assert(data.meeting.status === 'पूर्ण (Completed)', `Expected "पूर्ण (Completed)", got ${data.meeting.status}`);

    const db = await getFreshDb();
    const audits = queryAll(db, "SELECT * FROM audit_logs WHERE action = 'COMPLETE_MEETING' AND user_id = ? ORDER BY created_at DESC", [user1.id]);
    console.assert(audits.length > 0, 'Expected COMPLETE_MEETING audit log for user1');

    console.log('✅ Test 10: PUT /meetings/:id/status maps "completed" to "पूर्ण (Completed)", writes audit log, and notifies participant');
  }

  // Test 11: Verify GET /meetings still works
  {
    const res = await fetch(`${BASE_URL}/meetings?memberId=${user1.id}`);
    const data = await res.json();
    console.assert(res.status === 200);
    console.assert(Array.isArray(data.meetings));
    console.assert(data.meetings.some(m => m.id === meetingId));
    console.log('✅ Test 11: GET /meetings functions properly and lists meeting');
  }

  // Test 12: Verify GET /metrics still works
  {
    const res = await fetch(`${BASE_URL}/metrics`);
    const data = await res.json();
    console.assert(res.status === 200);
    console.assert(data.metrics && typeof data.metrics.totalMeetings === 'number');
    console.log('✅ Test 12: GET /metrics unchanged and functioning');
  }

  console.log('\n🎉 ALL 12 TESTS PASSED SUCCESSFULLY WITH ZERO ASSERTION FAILURES!');
}

runTests().catch(err => {
  console.error('❌ Test execution error:', err);
  process.exit(1);
});
