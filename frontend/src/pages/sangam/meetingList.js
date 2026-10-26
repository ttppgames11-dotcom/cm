// Pure helpers for the 1-to-1 meetings page (no React, so they are tested with
// `node --test src/pages/sangam/meetingList.test.js`).

export const STATUS_LABELS = {
  Requested: 'उत्तराची प्रतीक्षा (Requested)',
  Confirmed: 'निश्चित (Confirmed)',
  Declined: 'नाकारली (Declined)',
  Cancelled: 'रद्द (Cancelled)',
  Completed: 'पूर्ण (Completed)'
};

// 'requester', 'recipient' or null: from the ids on the row, falling back to the role the server sent.
export function roleOf(meeting, memberId) {
  if (memberId && meeting.requester_id === memberId) return 'requester';
  if (memberId && meeting.recipient_id === memberId) return 'recipient';
  return meeting.role === 'requester' || meeting.role === 'recipient' ? meeting.role : null;
}

const byWhen = (a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);

// Only a real YYYY-MM-DD date can be compared with today; older rows may hold Marathi text dates.
const isIsoDate = (text) => /^\d{4}-\d{2}-\d{2}$/.test(text || '');

// The member whose answer a Requested meeting waits for: the one the server names, else the recipient.
const awaitingOf = (meeting) => meeting.awaiting_id || meeting.recipient_id;

// The four lists the page shows. todayIso is today's date in India as YYYY-MM-DD.
//   waiting: requests to me that I have not answered; sent: my requests not answered yet;
//   confirmed: agreed and not yet past; past: everything else, newest first.
export function groupMeetings(list, memberId, todayIso) {
  const waiting = [];
  const sent = [];
  const confirmed = [];
  const past = [];
  for (const meeting of list) {
    const role = roleOf(meeting, memberId);
    if (!role) continue;
    if (meeting.status === 'Requested') (awaitingOf(meeting) === memberId ? waiting : sent).push(meeting);
    else if (meeting.status === 'Confirmed' && isIsoDate(meeting.date) && meeting.date >= todayIso) confirmed.push(meeting);
    else past.push(meeting);
  }
  waiting.sort(byWhen);
  sent.sort(byWhen);
  confirmed.sort(byWhen);
  past.sort((a, b) => byWhen(b, a));
  return { waiting, sent, confirmed, past };
}

// The buttons a person gets on a meeting. The server enforces the same rules; this only decides what to show.
export function actionsFor(meeting, memberId, todayIso) {
  const role = roleOf(meeting, memberId);
  if (!role) return [];
  if (meeting.status === 'Requested') {
    return awaitingOf(meeting) === memberId ? ['accept', 'decline', 'cancel', 'reschedule'] : ['cancel', 'reschedule'];
  }
  if (meeting.status === 'Confirmed') {
    const actions = isIsoDate(meeting.date) && meeting.date <= todayIso ? ['complete'] : [];
    return [...actions, 'cancel', 'reschedule', 'note'];
  }
  if (meeting.status === 'Completed') return ['note'];
  return [];
}

function isRealDate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text || '');
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

// One message for the first thing wrong with a booking, or '' when it is fine. nowIso is 'YYYY-MM-DDTHH:mm' in India.
export function validateBooking(form, nowIso) {
  if (!form.recipientId) return 'कृपया भेटायचा सदस्य निवडा (Choose who to meet).';
  if (!isRealDate(form.date)) return 'तारीख बरोबर नाही (Enter a real date).';
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.time || '')) return 'वेळ बरोबर नाही; उदा. 10:30 (Enter a time like 10:30).';
  if (`${form.date}T${form.time}` <= nowIso) return 'बैठकीची वेळ भविष्यातील असावी (Choose a time in the future).';
  if (form.mode !== 'Offline' && form.mode !== 'Online') return 'बैठकीचा प्रकार निवडा (Choose in person or online).';
  const place = (form.place || '').trim();
  if (!place) return 'ठिकाण किंवा लिंक द्या (Enter a place or a link).';
  if (form.mode === 'Online' && !/^https?:\/\/\S+$/i.test(place)) return 'ऑनलाइन बैठकीसाठी http:// किंवा https:// लिंक द्या (An online meeting needs a web link).';
  if ((form.topic || '').trim().length < 3) return 'विषय लिहा (Write the topic, at least 3 letters).';
  return '';
}

// A live "meeting.changed" event matters to a page only when its member is one of the two people.
export function eventConcernsMe(event, memberId) {
  return Boolean(memberId) && (event.requesterId === memberId || event.recipientId === memberId);
}

// Now in India as 'YYYY-MM-DDTHH:mm' (the date part is "today" for the page).
export function istNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}
