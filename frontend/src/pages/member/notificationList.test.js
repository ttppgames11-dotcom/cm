// Run: node --test src/pages/member/notificationList.test.js   (from the frontend folder)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { notificationLink, notificationIcon, unreadBadge, markedRead } from './notificationList.js';

test('notificationLink opens the right page by type', () => {
  assert.equal(notificationLink('blood'), '/blood-help');
  assert.equal(notificationLink('chapter'), '/sangam');
  assert.equal(notificationLink('meeting'), '/meetings');
  assert.equal(notificationLink('enquiry'), null);
  assert.equal(notificationLink(undefined), null);
});

test('notificationIcon by type', () => {
  assert.equal(notificationIcon('blood'), '🩸');
  assert.equal(notificationIcon('chapter'), '🤝');
  assert.equal(notificationIcon('meeting'), '📅');
  assert.equal(notificationIcon('enquiry'), '📩');
  assert.equal(notificationIcon('other'), '🔔');
});

test('unreadBadge text', () => {
  assert.equal(unreadBadge(0), '');
  assert.equal(unreadBadge(undefined), '');
  assert.equal(unreadBadge(3), '3');
  assert.equal(unreadBadge(9), '9');
  assert.equal(unreadBadge(10), '9+');
});

test('markedRead updates one or all without changing the rest', () => {
  const list = [{ id: 'a', read: false }, { id: 'b', read: false }, { id: 'c', read: true }];
  assert.deepEqual(markedRead(list, 'a').map((n) => n.read), [true, false, true]);
  assert.deepEqual(markedRead(list).map((n) => n.read), [true, true, true]);
  assert.equal(list[0].read, false);
});
