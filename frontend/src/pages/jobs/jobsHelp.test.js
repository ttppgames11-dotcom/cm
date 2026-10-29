// Run: node --test src/pages/jobs/jobsHelp.test.js   (from the frontend folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  APPLICATION_STATUSES, STATE_LABELS, closesInText, applyButton, whatsappText, whatsappLink, jobPayload, applicationPayload, statusInfo, jobQuery,
  alertLabel, canSaveAlert, alertPayload
} from './jobsHelp.js';

test('alertLabel names district and category, "any" in Marathi', () => {
  assert.equal(alertLabel({ district: 'पुणे', category: 'Finance & Accounts' }), 'पुणे · Finance & Accounts');
  assert.equal(alertLabel({ district: null, category: 'IT & Software' }), 'सर्व जिल्हे · IT & Software');
  assert.equal(alertLabel({ district: 'सातारा', category: null }), 'सातारा · सर्व क्षेत्रे');
});

test('canSaveAlert decides the alert button', () => {
  const one = [{ district: ' Pune ', category: 'IT & Software' }];
  assert.equal(canSaveAlert([], 'IT & Software', 'पुणे', false), 'login');
  assert.equal(canSaveAlert([], 'all', 'सर्व', true), 'pick');
  assert.equal(canSaveAlert(one, 'IT & Software', 'pune', true), 'exists');
  assert.equal(canSaveAlert([{ district: null, category: 'Manufacturing' }], 'Manufacturing', 'सर्व', true), 'exists');
  const three = [{ district: 'a', category: null }, { district: 'b', category: null }, { district: 'c', category: null }];
  assert.equal(canSaveAlert(three, 'all', 'पुणे', true), 'limit');
  assert.equal(canSaveAlert(one, 'all', 'पुणे', true), 'ok');
});

test('alertPayload leaves out "any"', () => {
  assert.deepEqual(alertPayload('all', 'पुणे'), { district: 'पुणे' });
  assert.deepEqual(alertPayload('IT & Software', 'सर्व'), { category: 'IT & Software' });
});

const NOW = new Date('2026-10-28T10:00:00Z');
const HOUR = 60 * 60 * 1000;
const at = (ms) => new Date(NOW.getTime() + ms).toISOString();

test('the four application statuses in order', () => {
  assert.deepEqual(APPLICATION_STATUSES.map((s) => s.value), ['new', 'shortlisted', 'rejected', 'hired']);
  assert.equal(statusInfo('hired').label, 'नोकरी मिळाली');
  assert.equal(statusInfo('shortlisted').icon, '✅');
  assert.equal(statusInfo('rejected').label, 'निवड नाही');
  assert.equal(statusInfo('new').label, 'नवीन');
  assert.equal(statusInfo('odd').label, 'odd');
});

test('job state labels', () => {
  assert.equal(STATE_LABELS.open, 'खुली');
  assert.equal(STATE_LABELS.expired, 'मुदत संपली');
  assert.equal(STATE_LABELS.closed, 'जागा बंद');
});

test('closesInText for 30-day jobs', () => {
  assert.equal(closesInText(at(27.5 * 24 * HOUR), NOW), '२८ दिवसांत बंद');
  assert.equal(closesInText(at(3 * HOUR), NOW), 'आज बंद');
  assert.equal(closesInText(at(-60 * 1000), NOW), 'मुदत संपली');
});

test('applyButton picks the right button', () => {
  const open = { state: 'open', mine: false, applied: false };
  assert.equal(applyButton(open, false), 'login');
  assert.equal(applyButton({ ...open, state: 'closed' }, false), 'closed');
  assert.equal(applyButton({ ...open, mine: true }, true), 'own');
  assert.equal(applyButton({ ...open, applied: true }, true), 'applied');
  assert.equal(applyButton({ ...open, state: 'expired' }, true), 'closed');
  assert.equal(applyButton(open, true), 'apply');
});

test('whatsappText is the three-line share message', () => {
  const job = { id: 'JOB-12', title: 'Accountant', company: 'Patil Traders', district: 'पुणे', salary: '₹25,000' };
  assert.equal(
    whatsappText(job, 'https://connectmaratha.com'),
    '💼 नोकरी: Accountant — Patil Traders (पुणे)\nपगार: ₹25,000\nअर्ज करा 👉 https://connectmaratha.com/jobs/JOB-12'
  );
  assert.equal(
    whatsappText({ ...job, salary: '' }, 'https://connectmaratha.com'),
    '💼 नोकरी: Accountant — Patil Traders (पुणे)\nअर्ज करा 👉 https://connectmaratha.com/jobs/JOB-12'
  );
});

test('whatsappLink opens WhatsApp with the message', () => {
  const job = { id: 'JOB-12', title: 'Accountant', company: 'Patil Traders', district: 'पुणे', salary: '₹25,000' };
  const link = whatsappLink(job, 'https://connectmaratha.com');
  assert.ok(link.startsWith('https://wa.me/?text='));
  assert.equal(decodeURIComponent(link.slice('https://wa.me/?text='.length)), whatsappText(job, 'https://connectmaratha.com'));
});

test('jobPayload cleans the form', () => {
  const p = jobPayload({ title: ' Accountant ', company: 'Patil', district: 'पुणे', phone: '98765 00001', contact_email: '', desc: '' });
  assert.equal(p.title, 'Accountant');
  assert.equal(p.phone, '9876500001');
  assert.equal('contact_email' in p, false);
  assert.equal('desc' in p, false);
});

test('jobQuery sends the typed search and drops "all" filters', () => {
  assert.deepEqual(jobQuery('all', 'सर्व', ' Tally '), { search: 'Tally' });
  assert.deepEqual(jobQuery('IT & Software', 'पुणे', ''), { category: 'IT & Software', district: 'पुणे' });
  assert.deepEqual(jobQuery('all', 'सर्व', '   '), {});
});

test('applicationPayload maps the apply form to the server names', () => {
  assert.deepEqual(applicationPayload({ name: ' Rahul ', phone: '98765-00002', email: '', summary: ' Tally ' }), {
    applicant_name: 'Rahul', phone: '9876500002', resume_summary: 'Tally'
  });
});
