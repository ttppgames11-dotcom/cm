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

test('job notifications open the right jobs tab', () => {
  assert.equal(notificationLink('job'), '/jobs?tab=mine');
  assert.equal(notificationLink('job_application'), '/jobs?tab=applied');
  assert.equal(notificationIcon('job'), '💼');
  assert.equal(notificationIcon('job_application'), '📋');
  assert.equal(notificationLink('job_alert'), '/jobs');
  assert.equal(notificationIcon('job_alert'), '💼');
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

import { NOTIFICATIONS_CHANGED, announceNotificationsChanged } from './notificationList.js';

test('announceNotificationsChanged tells listeners (the header bell) to re-count', () => {
  const target = new EventTarget();
  let heard = 0;
  target.addEventListener(NOTIFICATIONS_CHANGED, () => { heard += 1; });
  announceNotificationsChanged(target);
  announceNotificationsChanged(target);
  assert.equal(heard, 2);
  assert.equal(NOTIFICATIONS_CHANGED, 'cm:notifications-changed');
});

test('officer notifications open the right officers tab', () => {
  assert.equal(notificationLink('officer'), '/officers?tab=profile');
  assert.equal(notificationLink('officer_request'), '/officers?tab=incoming');
  assert.equal(notificationLink('officer_reply'), '/officers?tab=mine');
  assert.equal(notificationLink('officer_admin'), '/admin/officers');
  for (const type of ['officer', 'officer_request', 'officer_reply', 'officer_admin']) assert.equal(notificationIcon(type), '⭐');
});

test('admin blood notifications open the admin Blood Helpdesk', () => {
  assert.equal(notificationLink('blood_admin'), '/admin/seva');
  assert.equal(notificationIcon('blood_admin'), '🩸');
});
