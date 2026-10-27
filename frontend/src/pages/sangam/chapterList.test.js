// Run: node --test src/pages/sangam/chapterList.test.js   (from the frontend folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SEAT_STATUS_LABELS, CATEGORY_LABELS, seatsText, isFull, seatActions, joinableBusinesses, filterChapters, summary
} from './chapterList.js';

const chapter = (over) => ({ id: 'CH1', name: 'पुणे पश्चिम', city: 'पुणे', area: 'हिंजवडी', businesses: 12, open_seats: 8, ...over });
const seat = (over) => ({ id: 'CS1', member_id: 'M1', business_id: 'B1', status: 'waiting', ...over });

test('labels cover every seat status and business category', () => {
  for (const s of ['waiting', 'approved', 'declined', 'cancelled', 'left', 'removed']) assert.ok(SEAT_STATUS_LABELS[s], s);
  for (const c of ['it', 'restaurant', 'realestate', 'manufacturing', 'travel', 'services']) assert.ok(CATEGORY_LABELS[c], c);
});

test('seatsText shows businesses and open seats', () => {
  assert.equal(seatsText(chapter()), '12 व्यवसाय · 8 जागा उपलब्ध');
  assert.equal(seatsText(chapter({ open_seats: null })), '12 व्यवसाय');
  assert.equal(seatsText(chapter({ open_seats: undefined })), '12 व्यवसाय');
  assert.equal(seatsText(chapter({ open_seats: 0 })), '12 व्यवसाय · जागा पूर्ण');
});

test('isFull only when no seats are open', () => {
  assert.equal(isFull(chapter({ open_seats: 0 })), true);
  assert.equal(isFull(chapter({ open_seats: 1 })), false);
  assert.equal(isFull(chapter({ open_seats: null })), false);
});

test('seatActions follow who is looking and the status', () => {
  assert.deepEqual(seatActions(seat(), { memberId: 'M9', isCoordinator: true }), ['approve', 'decline']);
  assert.deepEqual(seatActions(seat({ status: 'approved' }), { memberId: 'M9', isCoordinator: true }), ['remove']);
  assert.deepEqual(seatActions(seat(), { memberId: 'M1', isCoordinator: false }), ['cancel']);
  assert.deepEqual(seatActions(seat({ status: 'approved' }), { memberId: 'M1', isCoordinator: false }), ['leave']);
  assert.deepEqual(seatActions(seat(), { memberId: 'M1', isCoordinator: true }), ['approve', 'decline', 'cancel']);
  assert.deepEqual(seatActions(seat(), { memberId: 'M9', isCoordinator: false }), []);
  for (const s of ['declined', 'cancelled', 'left', 'removed']) {
    assert.deepEqual(seatActions(seat({ status: s }), { memberId: 'M1', isCoordinator: true }), [], s);
  }
});

test('joinableBusinesses keeps visible businesses without an active seat', () => {
  const mine = [{ id: 'B1' }, { id: 'B2', status: 'hidden' }, { id: 'B3', status: 'visible' }, { id: 'B4' }];
  const seats = [seat({ business_id: 'B3', status: 'approved' }), seat({ business_id: 'B4', status: 'declined' })];
  assert.deepEqual(joinableBusinesses(mine, seats).map((b) => b.id), ['B1', 'B4']);
  assert.deepEqual(joinableBusinesses(null, null), []);
});

test('filterChapters matches name, city or area, and the city tab', () => {
  const list = [chapter(), chapter({ id: 'CH2', name: 'Satara', city: 'सातारा', area: '' })];
  assert.deepEqual(filterChapters(list, { search: 'हिंजवडी', city: 'all' }).map((c) => c.id), ['CH1']);
  assert.deepEqual(filterChapters(list, { search: 'SATARA', city: 'all' }).map((c) => c.id), ['CH2']);
  assert.deepEqual(filterChapters(list, { search: '', city: 'सातारा' }).map((c) => c.id), ['CH2']);
  assert.equal(filterChapters(list, { search: '', city: 'all' }).length, 2);
});

test('summary counts chapters, businesses and distinct cities', () => {
  const list = [chapter(), chapter({ id: 'CH2', businesses: 3 }), chapter({ id: 'CH3', city: 'सातारा', businesses: 0 })];
  assert.deepEqual(summary(list), { chapters: 3, businesses: 15, cities: 2 });
  assert.deepEqual(summary([]), { chapters: 0, businesses: 0, cities: 0 });
});
