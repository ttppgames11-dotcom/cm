// Run: node --test src/pages/community/bloodHelp.test.js   (from the frontend folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  BLOOD_GROUPS, STATE_LABELS, toMarathiDigits, timeAgo, closesInText, donorBadge, requestActions,
  filterDonors, filterRequests, requestPayload
} from './bloodHelp.js';

const NOW = new Date('2026-10-28T12:00:00Z');
const before = (ms) => new Date(NOW.getTime() - ms).toISOString();
const after = (ms) => new Date(NOW.getTime() + ms).toISOString();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

test('blood groups and state labels', () => {
  assert.deepEqual(BLOOD_GROUPS, ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
  assert.equal(STATE_LABELS.open, 'सुरू');
  assert.equal(STATE_LABELS.expired, 'मुदत संपली');
  assert.equal(STATE_LABELS.fulfilled, 'रक्त मिळाले ✅');
  assert.equal(STATE_LABELS.closed, 'बंद');
});

test('toMarathiDigits', () => {
  assert.equal(toMarathiDigits(2026), '२०२६');
  assert.equal(toMarathiDigits(0), '०');
});

test('timeAgo in Marathi', () => {
  assert.equal(timeAgo(before(30 * 1000), NOW), 'आत्ताच');
  assert.equal(timeAgo(before(5 * MIN), NOW), '५ मिनिटांपूर्वी');
  assert.equal(timeAgo(before(3 * HOUR), NOW), '३ तासांपूर्वी');
  assert.equal(timeAgo(before(2 * DAY), NOW), '२ दिवसांपूर्वी');
  assert.equal(timeAgo(null, NOW), '');
});

test('closesInText', () => {
  assert.equal(closesInText(after(4.5 * DAY), NOW), '५ दिवसांत बंद');
  assert.equal(closesInText(after(3 * HOUR), NOW), 'आज बंद');
  assert.equal(closesInText(before(MIN), NOW), 'मुदत संपली');
});

test('donorBadge', () => {
  assert.deepEqual(donorBadge({ available: true }), { tone: 'green', text: 'उपलब्ध' });
  assert.deepEqual(donorBadge({ available: false, can_donate_from: '2026-12-01' }), { tone: 'amber', text: '01-12-2026 पासून उपलब्ध' });
  assert.deepEqual(donorBadge({ available: false, can_donate_from: null }), { tone: 'amber', text: 'सध्या उपलब्ध नाही' });
});

test('requestActions by state', () => {
  assert.deepEqual(requestActions({ state: 'open' }), ['received', 'extend', 'close']);
  assert.deepEqual(requestActions({ state: 'expired' }), ['received', 'extend', 'close']);
  assert.deepEqual(requestActions({ state: 'fulfilled' }), []);
  assert.deepEqual(requestActions({ state: 'closed' }), []);
});

test('filters on group and search', () => {
  const donors = [
    { id: 1, name: 'Rahul', blood_group: 'O+', city: 'Pune', district: 'पुणे' },
    { id: 2, name: 'Sneha', blood_group: 'A+', city: 'Karad', district: 'सातारा' }
  ];
  assert.deepEqual(filterDonors(donors, { group: 'O+', search: '' }).map((d) => d.id), [1]);
  assert.deepEqual(filterDonors(donors, { group: 'all', search: 'सातारा' }).map((d) => d.id), [2]);
  assert.deepEqual(filterDonors(donors, { group: 'all', search: 'KARAD' }).map((d) => d.id), [2]);
  assert.equal(filterDonors(null, {}).length, 0);

  const requests = [
    { id: 'a', patient_name: 'Zb', blood_group: 'B-', hospital: 'Ruby Hall', city: 'Pune', district: 'पुणे' },
    { id: 'b', patient_name: 'Yy', blood_group: 'O+', hospital: 'Sassoon', city: 'Pune', district: 'पुणे' }
  ];
  assert.deepEqual(filterRequests(requests, { group: 'B-', search: '' }).map((r) => r.id), ['a']);
  assert.deepEqual(filterRequests(requests, { group: 'all', search: 'sassoon' }).map((r) => r.id), ['b']);
});

test('requestPayload uses the server field names', () => {
  const p = requestPayload({
    patientName: ' Ram ', bloodGroup: 'O+', units: '2', hospital: 'Ruby', city: ' Pune ', district: 'पुणे',
    contactPhone: '9876543210', urgency: 'तात्काळ', note: '  '
  });
  assert.deepEqual(p, {
    patientName: 'Ram', bloodGroup: 'O+', units: 2, hospital: 'Ruby', city: 'Pune', district: 'पुणे',
    contactPhone: '9876543210', urgency: 'तात्काळ'
  });
  assert.equal(requestPayload({ note: ' needs 2 units ', units: 1 }).note, 'needs 2 units');
});

// ---- final review fixes ----
import { donorDistrict, canCall, cleanPhone, donorPayload, requestsFromReply } from './bloodHelp.js';

test('donorDistrict keeps only a district from the list', () => {
  const list = ['पुणे', 'सातारा', 'मुंबई'];
  assert.equal(donorDistrict('सातारा', list), 'सातारा');
  assert.equal(donorDistrict(' मुंबई ', list), 'मुंबई');
  assert.equal(donorDistrict('Pune', list), 'पुणे');
  assert.equal(donorDistrict('महाराष्ट्र', list), 'पुणे');
  assert.equal(donorDistrict(undefined, list), 'पुणे');
});

test('canCall only with a login and a phone number', () => {
  assert.equal(canCall(true, '9822055443'), true);
  assert.equal(canCall(true, undefined), false);
  assert.equal(canCall(true, ''), false);
  assert.equal(canCall(false, '9822055443'), false);
});

test('phones are sent without spaces or dashes', () => {
  assert.equal(cleanPhone('98220 55443'), '9822055443');
  assert.equal(cleanPhone(' +91-98220-55443 '), '+919822055443');
  assert.equal(cleanPhone(undefined), '');
  assert.equal(requestPayload({ contactPhone: '98220 55443', units: 1 }).contactPhone, '9822055443');
  assert.deepEqual(donorPayload({
    name: ' Ram ', bloodGroup: 'O+', city: ' Pune ', district: 'पुणे', phone: '98220-55443', available: false, lastDonated: ''
  }), { name: 'Ram', bloodGroup: 'O+', city: 'Pune', district: 'पुणे', phone: '9822055443', available: false, lastDonated: null });
  assert.equal(donorPayload({ available: undefined, lastDonated: '2026-10-01' }).available, true);
  assert.equal(donorPayload({ lastDonated: '2026-10-01' }).lastDonated, '2026-10-01');
});

test('requestsFromReply reads the server list', () => {
  assert.deepEqual(requestsFromReply({ success: true, count: 1, requests: [{ id: 'a' }] }), [{ id: 'a' }]);
  assert.deepEqual(requestsFromReply({ data: [{ id: 'b' }] }), [{ id: 'b' }]);
  assert.deepEqual(requestsFromReply(null), []);
});
