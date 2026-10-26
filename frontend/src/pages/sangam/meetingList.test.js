// Run: node --test src/pages/sangam/meetingList.test.js   (from the frontend folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STATUS_LABELS, roleOf, groupMeetings, actionsFor, validateBooking, eventConcernsMe, istNow
} from './meetingList.js';

const meeting = (over) => ({
  id: 'MT-1', requester_id: 'M1', recipient_id: 'M2', status: 'Requested', date: '2026-11-10', time: '10:30', mode: 'Offline', ...over
});
const TODAY = '2026-11-01';

test('every status has a label', () => {
  for (const s of ['Requested', 'Confirmed', 'Declined', 'Cancelled', 'Completed']) assert.ok(STATUS_LABELS[s].length > 0);
});

test('role comes from the ids, then from the role the server sent', () => {
  assert.equal(roleOf(meeting(), 'M1'), 'requester');
  assert.equal(roleOf(meeting(), 'M2'), 'recipient');
  assert.equal(roleOf(meeting(), 'M3'), null);
  assert.equal(roleOf(meeting({ role: 'recipient' }), undefined), 'recipient');
  assert.equal(roleOf(meeting(), undefined), null);
});

test('requests to me wait, my own requests are sent, confirmed ones are upcoming', () => {
  const list = [
    meeting({ id: 'a' }),
    meeting({ id: 'b', requester_id: 'M2', recipient_id: 'M1' }),
    meeting({ id: 'c', status: 'Confirmed', date: '2026-11-05' }),
    meeting({ id: 'd', status: 'Confirmed', date: '2026-10-20' }),
    meeting({ id: 'e', status: 'Declined' }),
    meeting({ id: 'f', status: 'Completed', date: '2026-10-25' }),
    meeting({ id: 'g', requester_id: 'M8', recipient_id: 'M9' })
  ];
  const g = groupMeetings(list, 'M1', TODAY);
  assert.deepEqual(g.sent.map((m) => m.id), ['a']);
  assert.deepEqual(g.waiting.map((m) => m.id), ['b']);
  assert.deepEqual(g.confirmed.map((m) => m.id), ['c']);
  assert.deepEqual(g.past.map((m) => m.id), ['e', 'f', 'd']); // newest date first; a confirmed one in the past is past
});

test('upcoming groups are soonest first', () => {
  const list = [meeting({ id: 'late', date: '2026-12-01' }), meeting({ id: 'soon', date: '2026-11-03' })];
  assert.deepEqual(groupMeetings(list, 'M1', TODAY).sent.map((m) => m.id), ['soon', 'late']);
});

test('what each person may do', () => {
  assert.deepEqual(actionsFor(meeting(), 'M2', TODAY), ['accept', 'decline', 'cancel', 'reschedule']);
  assert.deepEqual(actionsFor(meeting(), 'M1', TODAY), ['cancel', 'reschedule']);
  assert.deepEqual(actionsFor(meeting(), 'M3', TODAY), []);
  const confirmed = meeting({ status: 'Confirmed' });
  assert.deepEqual(actionsFor(confirmed, 'M1', TODAY), ['cancel', 'reschedule', 'note']);
  const today = meeting({ status: 'Confirmed', date: TODAY });
  assert.deepEqual(actionsFor(today, 'M2', TODAY), ['complete', 'cancel', 'reschedule', 'note']);
  assert.deepEqual(actionsFor(meeting({ status: 'Completed' }), 'M1', TODAY), ['note']);
  assert.deepEqual(actionsFor(meeting({ status: 'Declined' }), 'M1', TODAY), []);
  assert.deepEqual(actionsFor(meeting({ status: 'Cancelled' }), 'M2', TODAY), []);
});

const NOW = '2026-11-01T09:00';
const form = (over) => ({ recipientId: 'M2', date: '2026-11-05', time: '10:30', mode: 'Offline', place: 'Pune office', topic: 'Product demo', ...over });

test('a good booking has no message', () => {
  assert.equal(validateBooking(form(), NOW), '');
  assert.equal(validateBooking(form({ mode: 'Online', place: 'https://meet.google.com/abc' }), NOW), '');
});

test('each wrong field gets its own message', () => {
  const bad = [
    form({ recipientId: '' }),
    form({ date: '2026-02-30' }),
    form({ date: '' }),
    form({ time: '25:00' }),
    form({ time: '10.30' }),
    form({ date: '2026-11-01', time: '08:59' }),
    form({ date: '2026-10-31' }),
    form({ mode: 'Teleport' }),
    form({ place: '   ' }),
    form({ mode: 'Online', place: 'javascript:alert(1)' }),
    form({ mode: 'Online', place: 'meet' }),
    form({ topic: 'ab' })
  ];
  const messages = bad.map((f) => validateBooking(f, NOW));
  for (const m of messages) assert.ok(m.length > 0);
  assert.equal(new Set(messages).size >= 8, true);
  assert.equal(validateBooking(form({ date: '2026-11-01', time: '09:01' }), NOW), '');
});

test('a live event matters only to the two people', () => {
  const event = { id: 'MT-1', requesterId: 'M1', recipientId: 'M2', status: 'Requested' };
  assert.equal(eventConcernsMe(event, 'M1'), true);
  assert.equal(eventConcernsMe(event, 'M2'), true);
  assert.equal(eventConcernsMe(event, 'M3'), false);
  assert.equal(eventConcernsMe(event, undefined), false);
  assert.equal(eventConcernsMe(event, ''), false);
});

test('now in India, as date and time', () => {
  assert.equal(istNow(new Date('2026-10-27T18:31:00Z')), '2026-10-28T00:01');
  assert.equal(istNow(new Date('2026-10-27T04:00:00Z')), '2026-10-27T09:30');
});
