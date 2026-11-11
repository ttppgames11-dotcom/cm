// Run: node --test src/pages/culture/speakersHelp.test.js   (from the frontend folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SPEAKER_CATEGORIES, REQUEST_STATUSES, PROFILE_STATUSES, statusInfo, requestButton, offeredKinds,
  speakerPayload, requestPayload, speakerQuery
} from './speakersHelp.js';

test('the six categories', () => {
  assert.deepEqual(SPEAKER_CATEGORIES, ['प्रेरणादायी वक्ते', 'व्यवसाय मार्गदर्शन', 'यशस्वी उद्योजक', 'युवा प्रेरणा', 'शिक्षण तज्ञ', 'इतर']);
});

test('requestButton picks the card button', () => {
  const s = { mine: false, requested: false };
  assert.equal(requestButton(s, false), 'login');
  assert.equal(requestButton({ ...s, mine: true }, true), 'own');
  assert.equal(requestButton({ ...s, requested: true }, true), 'requested');
  assert.equal(requestButton(s, true), 'request');
});

test('offeredKinds lists what the speaker offers', () => {
  assert.deepEqual(offeredKinds({ offers_talks: true, offers_guidance: false }), ['talk']);
  assert.deepEqual(offeredKinds({ offers_talks: true, offers_guidance: true }), ['talk', 'guidance']);
  assert.deepEqual(offeredKinds({ offers_talks: false, offers_guidance: true }), ['guidance']);
});

test('requestPayload keeps only that kind\'s fields', () => {
  assert.deepEqual(requestPayload('guidance', { topic: ' Zs ', mode: 'phone', place: 'x', message: '' }), {
    kind: 'guidance', topic: 'Zs', mode: 'phone'
  });
  assert.deepEqual(requestPayload('talk', { event_date: '2026-12-15', place: ' Satara ', audience: '300', topic: 'x' }), {
    kind: 'talk', event_date: '2026-12-15', place: 'Satara', audience: 300
  });
  assert.equal('audience' in requestPayload('talk', { place: 'Satara', audience: '' }), false);
});

test('speakerPayload cleans the form', () => {
  const p = speakerPayload({
    name: ' Zs Rahul ', category: 'शिक्षण तज्ञ', city: 'पुणे', topics: 'MPSC', intro: '', phone: '98765-00011',
    offers_talks: true, offers_guidance: false
  });
  assert.equal(p.name, 'Zs Rahul');
  assert.equal(p.phone, '9876500011');
  assert.equal('intro' in p, false);
  assert.equal(p.offers_talks, true);
  assert.equal(p.offers_guidance, false);
});

test('speakerQuery drops "all" and empty values', () => {
  assert.deepEqual(speakerQuery('सर्व वक्ते', '', ' MPSC '), { search: 'MPSC' });
  assert.deepEqual(speakerQuery('शिक्षण तज्ञ', 'पुणे', ''), { category: 'शिक्षण तज्ञ', city: 'पुणे' });
});

test('status labels', () => {
  assert.equal(statusInfo(REQUEST_STATUSES, 'accepted').label, 'स्वीकारली');
  assert.equal(statusInfo(REQUEST_STATUSES, 'new').icon, '⏳');
  assert.equal(statusInfo(REQUEST_STATUSES, 'cancelled').label, 'रद्द केली');
  assert.equal(statusInfo(PROFILE_STATUSES, 'pending').label, 'मंजुरीच्या प्रतीक्षेत');
  assert.equal(statusInfo(PROFILE_STATUSES, 'rejected').icon, '❌');
  assert.equal(statusInfo(PROFILE_STATUSES, 'odd').label, 'odd');
});
