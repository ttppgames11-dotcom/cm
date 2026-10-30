// Pure helpers for the officers page and the admin officers view (no React, so they are tested with
// `node --test src/pages/governance/officersHelp.test.js`). The codes match the server's OfficerSchemas.
import { cleanPhone } from '../community/bloodHelp.js';

export const SERVICES = [
  { value: 'ias', label: 'IAS' },
  { value: 'ips', label: 'IPS' },
  { value: 'ifs', label: 'IFS' },
  { value: 'irs', label: 'IRS' },
  { value: 'central', label: 'इतर केंद्रीय सेवा' },
  { value: 'mpsc_1', label: 'MPSC वर्ग १' },
  { value: 'mpsc_2', label: 'MPSC वर्ग २' },
  { value: 'mpsc_psi', label: 'PSI / STI / ASO' },
  { value: 'other', label: 'इतर' }
];

export const SERVICE_STATUSES = [
  { value: 'serving', label: '🟢 कार्यरत' },
  { value: 'retired', label: '🔵 निवृत्त' }
];

export const EXAMS = [
  { value: 'upsc_cse', label: 'UPSC नागरी सेवा' },
  { value: 'mpsc_rajyaseva', label: 'MPSC राज्यसेवा' },
  { value: 'mpsc_group_b', label: 'MPSC गट ब' },
  { value: 'mpsc_group_c', label: 'MPSC गट क' },
  { value: 'other_exam', label: 'इतर स्पर्धा परीक्षा' }
];

export const STAGES = [
  { value: 'start', label: 'सुरुवात' },
  { value: 'prelims', label: 'पूर्व परीक्षा' },
  { value: 'mains', label: 'मुख्य परीक्षा' },
  { value: 'interview', label: 'मुलाखत' }
];

export const MODES = [
  { value: 'phone', label: '📞 फोन' },
  { value: 'meeting', label: '🤝 प्रत्यक्ष भेट' },
  { value: 'online', label: '💻 ऑनलाइन' }
];

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

// The label of a code in one of the lists above (unknown codes shown as they are).
export function label(list, code) {
  const found = list.find((x) => x.value === code);
  return found ? found.label : String(code);
}

export function statusInfo(list, value) {
  return list.find((s) => s.value === value) || { value, label: String(value), icon: '•' };
}

// The exam codes as labels, joined with " · ".
export function examList(codes) {
  return (codes || []).map((c) => label(EXAMS, c)).join(' · ');
}

// Which button an officer card shows: 'login' | 'own' | 'paused' | 'requested' | 'request'.
export function requestButton(officer, loggedIn) {
  if (!loggedIn) return 'login';
  if (officer.mine) return 'own';
  if (!officer.accepting) return 'paused';
  if (officer.requested) return 'requested';
  return 'request';
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

export function officerPayload(form) {
  const { name, service, service_status, post, department, city, intro, phone } = form;
  const out = { ...cleaned({ name, service, service_status, post, department, city, intro, phone }), exams: [...(form.exams || [])] };
  const year = parseInt(t(form.batch_year), 10);
  if (Number.isFinite(year)) out.batch_year = year;
  return out;
}

// Only the request's own fields, trimmed and without empty ones.
export function requestPayload(form) {
  const { exam, stage, question, mode, message } = form;
  return cleaned({ exam, stage, question, mode, message });
}

// The list's query: leaves out "all" and empty values.
export function officerQuery(exam, service, search) {
  const q = {};
  if (exam && exam !== 'all') q.exam = exam;
  if (service && service !== 'all') q.service = service;
  if (t(search)) q.search = t(search);
  return q;
}
