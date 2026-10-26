// Run: node --test src/pages/sangam/referralList.test.js   (from the frontend folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STATUSES, roleOf, splitByRole, canChangeStatus, needsValue, eventConcernsMe, asNumberOrUndefined
} from './referralList.js';

const given = { id: 'REF-100', giver_id: 'M1', recipient_id: 'M2', status: 'New' };
const received = { id: 'REF-101', giver_id: 'M3', recipient_id: 'M1', status: 'Contacted' };
const other = { id: 'REF-102', giver_id: 'M3', recipient_id: 'M4', status: 'New' };

test('the six status words, in pipeline order', () => {
  assert.deepEqual(STATUSES, ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost']);
});

test('role of a member on a referral', () => {
  assert.equal(roleOf(given, 'M1'), 'giver');
  assert.equal(roleOf(received, 'M1'), 'receiver');
  assert.equal(roleOf(other, 'M1'), null);
  // the server's own role is used when the ids are not on the row
  assert.equal(roleOf({ id: 'REF-9', role: 'receiver' }, 'M1'), 'receiver');
});

test('split into given and received', () => {
  const { given: g, received: r } = splitByRole([given, received, other], 'M1');
  assert.deepEqual(g.map((x) => x.id), ['REF-100']);
  assert.deepEqual(r.map((x) => x.id), ['REF-101']);
});

test('only the receiver or an admin changes the status', () => {
  assert.equal(canChangeStatus(received, 'M1', false), true);
  assert.equal(canChangeStatus(given, 'M1', false), false);
  assert.equal(canChangeStatus(other, 'M1', false), false);
  assert.equal(canChangeStatus(other, 'M1', true), true);
});

test('only Won asks for a deal value', () => {
  assert.equal(needsValue('Won'), true);
  for (const status of STATUSES.filter((s) => s !== 'Won')) assert.equal(needsValue(status), false);
});

test('a live event concerns a member when they gave or received it', () => {
  assert.equal(eventConcernsMe({ giverId: 'M1', recipientId: 'M2' }, 'M1'), true);
  assert.equal(eventConcernsMe({ giverId: 'M3', recipientId: 'M1' }, 'M1'), true);
  assert.equal(eventConcernsMe({ giverId: 'M3', recipientId: 'M4' }, 'M1'), false);
  assert.equal(eventConcernsMe({ giverId: 'M3', recipientId: 'M4' }, undefined), false);
});

test('a typed amount becomes a non-negative number or nothing', () => {
  assert.equal(asNumberOrUndefined(''), undefined);
  assert.equal(asNumberOrUndefined('abc'), undefined);
  assert.equal(asNumberOrUndefined('-5'), undefined);
  assert.equal(asNumberOrUndefined('50000'), 50000);
  assert.equal(asNumberOrUndefined('0'), 0);
  assert.equal(asNumberOrUndefined(undefined), undefined);
});
