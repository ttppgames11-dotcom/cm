import { runQuery } from '../../database/database.js';

// Tables behind the website's services, helpdesk tickets and community-centre
// features. Created on first use with SQL that works on both PostgreSQL and the
// SQLite fallback. They start empty: no sample providers or centres.
const TABLES = [
  `CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
    location TEXT, phone TEXT, experience TEXT, pricing TEXT, description TEXT,
    status TEXT DEFAULT 'active', created_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS service_bookings (
    id TEXT PRIMARY KEY, service_id TEXT, service_category TEXT NOT NULL,
    professional_name TEXT, customer_id TEXT, customer_name TEXT, phone TEXT NOT NULL,
    address TEXT, requested_date TEXT, notes TEXT, status TEXT DEFAULT 'new',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY, source TEXT DEFAULT 'helpdesk', title TEXT NOT NULL,
    description TEXT NOT NULL, category TEXT, subcategory TEXT, priority TEXT,
    district TEXT, taluka TEXT, division TEXT, assigned_center_id TEXT,
    current_owner_level TEXT DEFAULT 'taluka', status TEXT DEFAULT 'New',
    requester_id TEXT, requester_name TEXT, requester_phone TEXT, requester_email TEXT,
    language TEXT, sla_hours INTEGER, audit_trail TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS community_centers (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, tier TEXT, division TEXT, district TEXT,
    taluka TEXT, address TEXT, contact_person TEXT, phone TEXT,
    status TEXT DEFAULT 'active', created_at TEXT DEFAULT CURRENT_TIMESTAMP)`,
  `CREATE TABLE IF NOT EXISTS center_activities (
    id TEXT PRIMARY KEY, center_id TEXT NOT NULL, type TEXT NOT NULL,
    person_name TEXT, phone TEXT, purpose TEXT, desk TEXT, category TEXT,
    amount NUMERIC, payment_mode TEXT, recorded_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP)`,
];

let ready = null;
export function ensureWebsiteTables() {
  if (!ready) {
    ready = (async () => {
      for (const sql of TABLES) await runQuery(sql);
    })().catch((err) => {
      ready = null;
      throw err;
    });
  }
  return ready;
}

const ADMIN_ROLES = new Set(['admin', 'superadmin', 'ceo']);
// Website CRM roles that work tickets and centres, plus admins.
const STAFF_ROLES = new Set([
  ...ADMIN_ROLES,
  'staff', 'center_manager', 'helpdesk', 'pradesh_admin', 'division_admin', 'division_head',
  'district_admin', 'district_head', 'taluka_admin', 'taluka_head', 'branch_admin',
  'chapter_president', 'finance',
]);

const roleOf = (user) => String(user?.role || '').toLowerCase();
export const isAdmin = (user) => ADMIN_ROLES.has(roleOf(user));
export const isStaff = (user) => STAFF_ROLES.has(roleOf(user));

/** Last 10 digits of an Indian mobile number, or '' when it isn't one. */
export function cleanMobile(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const last10 = digits.slice(-10);
  return /^[6-9]\d{9}$/.test(last10) ? last10 : '';
}

/** Trimmed text with tags removed, cut to [max] characters. */
export function text(value, max = 500) {
  return String(value ?? '').replace(/<[^>]*>/g, '').trim().slice(0, max);
}

export function newId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
