// Run: node --test src/pages/business/enquiryList.test.js   (from the frontend folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STATUS_LABELS, statusLabel, matchesFilters, listParams, FILTER_DISTRICTS, FORM_DISTRICTS, OTHER_DISTRICT, addEnquiry, updateEnquiry, concernsMe, isNewQuoteForMe
} from './enquiryList.js';

test('labels', () => {
  assert.equal(statusLabel('open'), 'सक्रिय (Open)');
  assert.equal(statusLabel('closed'), 'पूर्ण (Closed)');
  assert.equal(statusLabel('x'), 'सक्रिय (Open)');
  assert.equal(statusLabel(undefined), STATUS_LABELS.open);
});

test('all-filters', () => {
  const pune = { id: 'E1', district: 'पुणे', category: 'IT' };
  const nashik = { id: 'E2', district: 'नाशिक', category: 'IT' };
  for (const all of ['सर्व', '', undefined]) {
    assert.equal(matchesFilters(pune, { district: all, category: all }), true);
    assert.equal(matchesFilters(nashik, { district: all, category: all }), true);
  }
  assert.equal(matchesFilters(pune, { district: 'पुणे' }), true);
  assert.equal(matchesFilters(nashik, { district: 'पुणे' }), false);
  assert.equal(matchesFilters(pune, { category: 'Food' }), false);
  assert.equal(matchesFilters(pune, {}), true);
});

test('add prepends a new matching card', () => {
  const a = { id: 'E1', district: 'पुणे', category: 'IT' };
  const b = { id: 'E2', district: 'पुणे', category: 'IT' };
  assert.deepEqual(addEnquiry([b], a, {}), [a, b]);
});

test('add ignores a duplicate id and a card outside the filter', () => {
  const list = [{ id: 'E1', district: 'पुणे', category: 'IT' }];
  assert.equal(addEnquiry(list, { id: 'E1', district: 'पुणे', category: 'IT' }, {}), list);
  assert.equal(addEnquiry(list, { id: 'E2', district: 'नाशिक', category: 'IT' }, { district: 'पुणे' }), list);
});

test('update merges status and count only', () => {
  const list = [
    { id: 'E1', title: 'Office', status: 'open', quotesCount: 0, isMine: true },
    { id: 'E2', title: 'Shop', status: 'open', quotesCount: 3, isMine: false }
  ];
  const next = updateEnquiry(list, { id: 'E1', status: 'closed', quotesCount: 1, title: 'ignored' });
  assert.notEqual(next, list);
  assert.deepEqual(next[0], { id: 'E1', title: 'Office', status: 'closed', quotesCount: 1, isMine: true });
  assert.equal(next[1], list[1]);
  assert.equal(updateEnquiry(list, { id: 'E9', status: 'closed', quotesCount: 1 }), list);
});

test('new quote for me only when mine and the count went up', () => {
  const list = [{ id: 'E1', isMine: true, quotesCount: 1 }, { id: 'E2', isMine: false, quotesCount: 0 }];
  assert.equal(isNewQuoteForMe(list, { id: 'E1', status: 'open', quotesCount: 2 }), true);
  assert.equal(isNewQuoteForMe(list, { id: 'E1', status: 'closed', quotesCount: 1 }), false);
  assert.equal(isNewQuoteForMe(list, { id: 'E2', status: 'open', quotesCount: 1 }), false);
  assert.equal(isNewQuoteForMe(list, { id: 'E9', status: 'open', quotesCount: 5 }), false);
  assert.equal(concernsMe(list, { id: 'E1', status: 'closed', quotesCount: 1 }), true);
  assert.equal(concernsMe(list, { id: 'E2', status: 'closed', quotesCount: 0 }), false);
});

test('list params leave out the "all" filters', () => {
  // URLSearchParams would turn an undefined value into the text "undefined"
  assert.deepEqual(listParams({ district: 'सर्व', category: 'सर्व' }), {});
  assert.deepEqual(listParams({ district: 'पुणे', category: 'सर्व' }), { district: 'पुणे' });
  assert.deepEqual(listParams({ district: '', category: 'IT' }), { category: 'IT' });
  assert.deepEqual(listParams({}), {});
});

test('the post form offers the filter districts, so every post can be found under its own district button', () => {
  assert.deepEqual(FILTER_DISTRICTS, ['सर्व', ...FORM_DISTRICTS]);
  assert.ok(FORM_DISTRICTS.includes('पुणे'));
  assert.ok(FORM_DISTRICTS.includes(OTHER_DISTRICT));
  for (const district of FORM_DISTRICTS) {
    const card = { id: 'E1', district, category: 'IT' };
    const buttons = FILTER_DISTRICTS.filter((f) => matchesFilters(card, { district: f }));
    assert.deepEqual(buttons, ['सर्व', district]);
  }
});
