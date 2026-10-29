// Pure helpers for the jobs pages and the admin jobs view (no React, so they are tested with
// `node --test src/pages/jobs/jobsHelp.test.js`). Time helpers take `now` last so tests can fix it.
import { closesInText, cleanPhone } from '../community/bloodHelp.js';

export { closesInText };

export const APPLICATION_STATUSES = [
  { value: 'new', label: 'नवीन', icon: '⏳' },
  { value: 'shortlisted', label: 'शॉर्टलिस्ट', icon: '✅' },
  { value: 'rejected', label: 'निवड नाही', icon: '❌' },
  { value: 'hired', label: 'नोकरी मिळाली', icon: '🎉' }
];

export const STATE_LABELS = { open: 'खुली', expired: 'मुदत संपली', closed: 'जागा बंद' };

// The label and icon of an application status (unknown values shown as they are).
export function statusInfo(value) {
  return APPLICATION_STATUSES.find((s) => s.value === value) || { value, label: String(value), icon: '•' };
}

// Which button a job card shows: 'login' | 'own' | 'applied' | 'closed' | 'apply'.
export function applyButton(job, loggedIn) {
  if (job.state !== 'open') return 'closed';
  if (!loggedIn) return 'login';
  if (job.mine) return 'own';
  if (job.applied) return 'applied';
  return 'apply';
}

// The message a member shares on WhatsApp; the salary line is left out when there is none.
export function whatsappText(job, origin) {
  const lines = [`💼 नोकरी: ${job.title} — ${job.company} (${job.district})`];
  if (job.salary) lines.push(`पगार: ${job.salary}`);
  lines.push(`अर्ज करा 👉 ${origin}/jobs/${job.id}`);
  return lines.join('\n');
}

export function whatsappLink(job, origin) {
  return 'https://wa.me/?text=' + encodeURIComponent(whatsappText(job, origin));
}

const t = (v) => (v == null ? '' : String(v).trim());

// Copies the non-empty fields, trimmed; phone spaces and dashes removed.
function cleaned(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields)) {
    const v = key === 'phone' ? cleanPhone(value) : t(value);
    if (v) out[key] = v;
  }
  return out;
}

export function jobPayload(form) {
  const { title, company, district, category, salary, job_type, experience, desc, phone, contact_email } = form;
  return cleaned({ title, company, district, category, salary, job_type, experience, desc, phone, contact_email });
}

// The board's query: the typed search (trimmed) and the filters, leaving out "all" / "सर्व" and empty values.
export function jobQuery(category, district, search) {
  const q = {};
  if (category && category !== 'all') q.category = category;
  if (district && district !== 'सर्व') q.district = district;
  if (t(search)) q.search = t(search);
  return q;
}

export function applicationPayload(form) {
  return cleaned({ applicant_name: form.name, phone: form.phone, email: form.email, resume_summary: form.summary });
}

// ---- job alerts (district / category; null = any)

export const MAX_ALERTS = 3;

export function alertLabel(alert) {
  return `${alert.district || 'सर्व जिल्हे'} · ${alert.category || 'सर्व क्षेत्रे'}`;
}

// The alert to save for the current filters ("all" / "सर्व" left out).
export function alertPayload(category, district) {
  return jobQuery(category, district, '');
}

const same = (a, b) => t(a).toLowerCase() === t(b).toLowerCase();

// What the alert button does for the current filters: 'login' | 'pick' | 'exists' | 'limit' | 'ok'.
export function canSaveAlert(alerts, category, district, loggedIn) {
  if (!loggedIn) return 'login';
  const wanted = alertPayload(category, district);
  if (!wanted.district && !wanted.category) return 'pick';
  if ((alerts || []).some((a) => same(a.district, wanted.district) && same(a.category, wanted.category))) return 'exists';
  if ((alerts || []).length >= MAX_ALERTS) return 'limit';
  return 'ok';
}
