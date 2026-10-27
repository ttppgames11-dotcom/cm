// Pure helpers for the Business Sangam chapters page and the admin chapters view (no React, so they are
// tested with `node --test src/pages/sangam/chapterList.test.js`).

export const SEAT_STATUS_LABELS = {
  waiting: 'निर्णयाची प्रतीक्षा (Waiting)',
  approved: 'सदस्य (Approved)',
  declined: 'नाकारले (Declined)',
  cancelled: 'रद्द केले (Cancelled)',
  left: 'चॅप्टर सोडला (Left)',
  removed: 'काढले (Removed)'
};

// The same categories as the business directory.
export const CATEGORY_LABELS = {
  it: 'IT व सॉफ्टवेअर',
  restaurant: 'भोजनालय / रेस्टॉरंट',
  realestate: 'रिअल इस्टेट व बांधकाम',
  manufacturing: 'उत्पादन व उद्योग',
  travel: 'प्रवास, पर्यटन व ट्रेक',
  services: 'व्यावसायिक सेवा'
};

const hasLimit = (chapter) => chapter.open_seats !== null && chapter.open_seats !== undefined;

// "12 व्यवसाय · 8 जागा उपलब्ध"; without a maximum only the business count.
export function seatsText(chapter) {
  const base = `${chapter.businesses || 0} व्यवसाय`;
  if (!hasLimit(chapter)) return base;
  return chapter.open_seats > 0 ? `${base} · ${chapter.open_seats} जागा उपलब्ध` : `${base} · जागा पूर्ण`;
}

export function isFull(chapter) {
  return hasLimit(chapter) && chapter.open_seats <= 0;
}

// What the viewer may do with a seat: the coordinator (or an admin) decides, the member who asked cancels or leaves.
export function seatActions(seat, { memberId, isCoordinator }) {
  const out = [];
  if (isCoordinator) {
    if (seat.status === 'waiting') out.push('approve', 'decline');
    if (seat.status === 'approved') out.push('remove');
  }
  if (memberId && seat.member_id === memberId) {
    if (seat.status === 'waiting') out.push('cancel');
    if (seat.status === 'approved') out.push('leave');
  }
  return out;
}

// The member's visible businesses that are not already waiting for or holding a seat.
export function joinableBusinesses(myBusinesses, mySeats) {
  const taken = new Set((mySeats || []).filter((s) => s.status === 'waiting' || s.status === 'approved').map((s) => s.business_id));
  return (myBusinesses || []).filter((b) => b.status !== 'hidden' && !taken.has(b.id));
}

// The member's waiting or approved seat in this chapter, if any (one per member per chapter).
export function activeSeatIn(mySeats, chapterId) {
  return (mySeats || []).find((s) => s.chapter_id === chapterId && (s.status === 'waiting' || s.status === 'approved'));
}

export function filterChapters(chapters, { search = '', city = 'all' } = {}) {
  const q = search.trim().toLowerCase();
  return (chapters || []).filter((c) => {
    if (city !== 'all' && c.city !== city) return false;
    if (!q) return true;
    return [c.name, c.city, c.area].some((v) => (v || '').toLowerCase().includes(q));
  });
}

export function summary(chapters) {
  const list = chapters || [];
  return {
    chapters: list.length,
    businesses: list.reduce((n, c) => n + (c.businesses || 0), 0),
    cities: new Set(list.map((c) => c.city).filter(Boolean)).size
  };
}
