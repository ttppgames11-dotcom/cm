// Pure helpers for the Blood help page and the admin Blood Helpdesk (no React, so they are tested with
// `node --test src/pages/community/bloodHelp.test.js`). Time helpers take `now` last so tests can fix it.

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const STATE_LABELS = {
  open: 'सुरू',
  expired: 'मुदत संपली',
  fulfilled: 'रक्त मिळाले ✅',
  closed: 'बंद'
};

const MARATHI_DIGITS = '०१२३४५६७८९';
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function toMarathiDigits(n) {
  return String(n).replace(/[0-9]/g, (d) => MARATHI_DIGITS[Number(d)]);
}

// "आत्ताच", "५ मिनिटांपूर्वी", "३ तासांपूर्वी", "२ दिवसांपूर्वी".
export function timeAgo(iso, now = new Date()) {
  if (!iso) return '';
  const diff = now.getTime() - new Date(iso).getTime();
  if (diff < MINUTE) return 'आत्ताच';
  if (diff < HOUR) return `${toMarathiDigits(Math.floor(diff / MINUTE))} मिनिटांपूर्वी`;
  if (diff < DAY) return `${toMarathiDigits(Math.floor(diff / HOUR))} तासांपूर्वी`;
  return `${toMarathiDigits(Math.floor(diff / DAY))} दिवसांपूर्वी`;
}

// "५ दिवसांत बंद" (rounded up), "आज बंद" within 24 hours, "मुदत संपली" when past.
export function closesInText(iso, now = new Date()) {
  const left = new Date(iso).getTime() - now.getTime();
  if (left <= 0) return 'मुदत संपली';
  if (left < DAY) return 'आज बंद';
  return `${toMarathiDigits(Math.ceil(left / DAY))} दिवसांत बंद`;
}

export function donorBadge(donor) {
  if (donor.available) return { tone: 'green', text: 'उपलब्ध' };
  if (donor.can_donate_from) {
    const [y, m, d] = donor.can_donate_from.split('-');
    return { tone: 'amber', text: `${d}-${m}-${y} पासून उपलब्ध` };
  }
  return { tone: 'amber', text: 'सध्या उपलब्ध नाही' };
}

// The owner's buttons: only an open (or expired but still open) request can be changed.
export function requestActions(request) {
  return request.state === 'open' || request.state === 'expired' ? ['received', 'extend', 'close'] : [];
}

function matches(values, search) {
  const q = (search || '').trim().toLowerCase();
  return !q || values.some((v) => (v || '').toLowerCase().includes(q));
}

export function filterDonors(donors, { group = 'all', search = '' } = {}) {
  return (donors || []).filter((d) =>
    (group === 'all' || d.blood_group === group) && matches([d.name, d.city, d.district], search));
}

export function filterRequests(requests, { group = 'all', search = '' } = {}) {
  return (requests || []).filter((r) =>
    (group === 'all' || r.blood_group === group) && matches([r.patient_name, r.hospital, r.city, r.district], search));
}

// The request form as the server expects it: trimmed text, units as a number, no empty note.
export function requestPayload(form) {
  const t = (v) => (v == null ? '' : String(v).trim());
  const out = {
    patientName: t(form.patientName),
    bloodGroup: t(form.bloodGroup),
    units: Number(form.units) || 1,
    hospital: t(form.hospital),
    city: t(form.city),
    district: t(form.district),
    contactPhone: t(form.contactPhone),
    urgency: t(form.urgency)
  };
  if (t(form.note)) out.note = t(form.note);
  return out;
}
