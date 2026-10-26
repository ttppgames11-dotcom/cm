// Pure helpers for the referral pages (no React, so they are tested with
// `node --test src/pages/sangam/referralList.test.js`).

// The pipeline a receiver moves a referral through, in order. Lost is the one ending that means "not interested".
export const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];

// 'giver', 'receiver' or null: from the ids on the row, falling back to the role the server sent.
export function roleOf(referral, memberId) {
  if (memberId && referral.giver_id === memberId) return 'giver';
  if (memberId && referral.recipient_id === memberId) return 'receiver';
  return referral.role === 'giver' || referral.role === 'receiver' ? referral.role : null;
}

export function splitByRole(list, memberId) {
  const given = [];
  const received = [];
  for (const referral of list) {
    const role = roleOf(referral, memberId);
    if (role === 'giver') given.push(referral);
    else if (role === 'receiver') received.push(referral);
  }
  return { given, received };
}

// Only the receiver (and admins) move a referral forward; the giver just watches.
export function canChangeStatus(referral, memberId, isAdmin) {
  return Boolean(isAdmin) || roleOf(referral, memberId) === 'receiver';
}

// Only a won referral asks for the deal value.
export function needsValue(status) {
  return status === 'Won';
}

// A live "referral.changed" event matters to a page only when its member gave or received the referral.
export function eventConcernsMe(event, memberId) {
  return Boolean(memberId) && (event.giverId === memberId || event.recipientId === memberId);
}

// A typed amount as a number, or undefined when it is empty, not a number, or negative.
// Commas, spaces and the rupee sign are allowed, the way people write amounts: "₹ 1,25,000".
export function asNumberOrUndefined(text) {
  if (text === undefined || text === null) return undefined;
  const cleaned = String(text).replace(/[,\s₹]/g, '');
  if (cleaned === '') return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

// True when something was typed but it is not a usable amount (so the page asks again instead of sending nothing).
export function isAmountTypedButUnreadable(text) {
  if (text === undefined || text === null || String(text).trim() === '') return false;
  return asNumberOrUndefined(text) === undefined && String(text).replace(/[,\s₹]/g, '') !== '';
}
