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

export function applicationPayload(form) {
  return cleaned({ applicant_name: form.name, phone: form.phone, email: form.email, resume_summary: form.summary });
}
