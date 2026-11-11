// Pure helpers for the speakers page and the admin speakers view (no React, so they are tested with
// `node --test src/pages/culture/speakersHelp.test.js`).
import { cleanPhone } from '../community/bloodHelp.js';

export const SPEAKER_CATEGORIES = ['प्रेरणादायी वक्ते', 'व्यवसाय मार्गदर्शन', 'यशस्वी उद्योजक', 'युवा प्रेरणा', 'शिक्षण तज्ञ', 'इतर'];

export const ALL_CATEGORIES = 'सर्व वक्ते';

export const REQUEST_STATUSES = [
  { value: 'new', label: 'उत्तराची प्रतीक्षा', icon: '⏳' },
  { value: 'accepted', label: 'स्वीकारली', icon: '✅' },
  { value: 'declined', label: 'नाकारली', icon: '❌' },
  { value: 'cancelled', label: 'रद्द केली', icon: '⛔' }
];

export const PROFILE_STATUSES = [
  { value: 'pending', label: 'मंजुरीच्या प्रतीक्षेत', icon: '⏳' },
  { value: 'approved', label: 'प्रकाशित', icon: '✅' },
  { value: 'rejected', label: 'नामंजूर', icon: '❌' }
];

// The label and icon of a status from one of the lists above (unknown values shown as they are).
export function statusInfo(list, value) {
  return list.find((s) => s.value === value) || { value, label: String(value), icon: '•' };
}

// Which button a speaker card shows: 'login' | 'own' | 'requested' | 'request'.
export function requestButton(speaker, loggedIn) {
  if (!loggedIn) return 'login';
  if (speaker.mine) return 'own';
  if (speaker.requested) return 'requested';
  return 'request';
}

// The request kinds a speaker offers, talk first.
export function offeredKinds(speaker) {
  const kinds = [];
  if (speaker.offers_talks) kinds.push('talk');
  if (speaker.offers_guidance) kinds.push('guidance');
  return kinds;
}

const t = (v) => (v == null ? '' : String(v).trim());

// Copies the non-empty text fields, trimmed; the phone without spaces and dashes.
function cleaned(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    const v = key === 'phone' ? cleanPhone(value) : t(value);
    if (v) out[key] = v;
  }
  return out;
}

export function speakerPayload(form) {
  const { name, title, category, city, topics, intro, phone } = form;
  return {
    ...cleaned({ name, title, category, city, topics, intro, phone }),
    offers_talks: Boolean(form.offers_talks),
    offers_guidance: Boolean(form.offers_guidance)
  };
}

// Only the fields of that kind, trimmed and without empty ones; the audience as a number.
export function requestPayload(kind, form) {
  if (kind === 'talk') {
    const { event_date, place, event_type, message } = form;
    const out = { kind, ...cleaned({ event_date, place, event_type, message }) };
    const audience = parseInt(t(form.audience), 10);
    if (Number.isFinite(audience)) out.audience = audience;
    return out;
  }
  const { topic, mode, message } = form;
  return { kind, ...cleaned({ topic, mode, message }) };
}

// The list's query: leaves out "सर्व वक्ते" and empty values.
export function speakerQuery(category, city, search) {
  const q = {};
  if (category && category !== ALL_CATEGORIES) q.category = category;
  if (t(city)) q.city = t(city);
  if (t(search)) q.search = t(search);
  return q;
}
