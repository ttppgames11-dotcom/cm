// Run: node --test src/pages/governance/officersHelp.test.js   (from the frontend folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SERVICES, EXAMS, STAGES, MODES, REQUEST_STATUSES, PROFILE_STATUSES, label, statusInfo, examList, requestButton,
  officerPayload, requestPayload, officerQuery
} from './officersHelp.js';

test('the code lists match the server', () => {
  assert.deepEqual(SERVICES.map((s) => s.value), ['ias', 'ips', 'ifs', 'irs', 'central', 'mpsc_1', 'mpsc_2', 'mpsc_psi', 'other']);
  assert.deepEqual(EXAMS.map((s) => s.value), ['upsc_cse', 'mpsc_rajyaseva', 'mpsc_group_b', 'mpsc_group_c', 'other_exam']);
  assert.deepEqual(STAGES.map((s) => s.value), ['start', 'prelims', 'mains', 'interview']);
  assert.deepEqual(MODES.map((s) => s.value), ['phone', 'meeting', 'online']);
});

test('labels for codes', () => {
  assert.equal(label(SERVICES, 'mpsc_psi'), 'PSI / STI / ASO');
  assert.equal(label(EXAMS, 'mpsc_group_b'), 'MPSC गट ब');
  assert.equal(label(SERVICES, 'odd'), 'odd');
  assert.equal(examList(['upsc_cse', 'mpsc_group_b']), 'UPSC नागरी सेवा · MPSC गट ब');
  assert.equal(examList([]), '');
});

test('requestButton picks the card button', () => {
  const o = { mine: false, requested: false, accepting: true };
  assert.equal(requestButton(o, false), 'login');
  assert.equal(requestButton({ ...o, mine: true }, true), 'own');
  assert.equal(requestButton({ ...o, accepting: false }, true), 'paused');
  assert.equal(requestButton({ ...o, accepting: false, requested: true }, true), 'paused');
  assert.equal(requestButton({ ...o, requested: true }, true), 'requested');
  assert.equal(requestButton(o, true), 'request');
});

test('officerPayload cleans the form', () => {
  const p = officerPayload({
    name: ' Zo Rahul ', service: 'mpsc_1', service_status: 'serving', batch_year: '2018', post: 'उपजिल्हाधिकारी',
    department: '', city: 'सातारा', exams: ['mpsc_group_b'], intro: '', phone: '98765-00021'
  });
  assert.equal(p.name, 'Zo Rahul');
  assert.equal(p.batch_year, 2018);
  assert.equal(p.phone, '9876500021');
  assert.deepEqual(p.exams, ['mpsc_group_b']);
  assert.equal('department' in p, false);
  assert.equal('batch_year' in officerPayload({ batch_year: '', exams: [] }), false);
});

test('requestPayload keeps only the request fields', () => {
  assert.deepEqual(requestPayload({ exam: 'upsc_cse', stage: 'start', question: ' Zo ', mode: 'online', place: 'x', message: '' }), {
    exam: 'upsc_cse', stage: 'start', question: 'Zo', mode: 'online'
  });
});

test('officerQuery drops "all" and empty values', () => {
  assert.deepEqual(officerQuery('all', 'all', ' IAS '), { search: 'IAS' });
  assert.deepEqual(officerQuery('upsc_cse', 'ias', ''), { exam: 'upsc_cse', service: 'ias' });
});

test('status labels', () => {
  assert.equal(statusInfo(REQUEST_STATUSES, 'accepted').label, 'स्वीकारली');
  assert.equal(statusInfo(PROFILE_STATUSES, 'pending').label, 'मंजुरीच्या प्रतीक्षेत');
  assert.equal(statusInfo(PROFILE_STATUSES, 'odd').label, 'odd');
});
