// Pure helpers for the notifications page and the header bell (no React, so they are tested with
// `node --test src/pages/member/notificationList.test.js`).

const LINKS = { blood: '/blood-help', chapter: '/sangam', meeting: '/meetings' };
const ICONS = { blood: '🩸', chapter: '🤝', meeting: '📅', enquiry: '📩' };

// The page a notification opens, or null when it has none.
export function notificationLink(type) {
  return LINKS[type] || null;
}

export function notificationIcon(type) {
  return ICONS[type] || '🔔';
}

// The bell's red count: empty at 0, "9+" above 9.
export function unreadBadge(count) {
  if (!count) return '';
  return count > 9 ? '9+' : String(count);
}

// A copy of the list with one notification (by id) or all of them marked read.
export function markedRead(list, id) {
  return (list || []).map((n) => (id === undefined || n.id === id ? { ...n, read: true } : n));
}

// Sent after marking notifications read, so the header bell re-counts without a page change.
export const NOTIFICATIONS_CHANGED = 'cm:notifications-changed';

export function announceNotificationsChanged(target = typeof window !== 'undefined' ? window : null) {
  if (target) target.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
}
