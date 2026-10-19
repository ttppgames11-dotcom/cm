// src/services/adminApi.js
import apiClient from './apiClient';

// -----------------------------------------------------------
// CENTRALIZED ADMIN API LAYER
// A failed call returns the fallback so the page still renders, and its name is
// recorded in adminLoadFailures so the page can say the data did not load
// (instead of showing an empty or made-up number as if it were real).
// -----------------------------------------------------------

export const adminLoadFailures = new Set();

const safe = async (promise, fallback = null, name = null, pick = (res) => res?.data) => {
  try {
    const res = await promise;
    if (name) adminLoadFailures.delete(name);
    return pick(res) ?? fallback;
  } catch (err) {
    console.warn('[adminApi fallback]', err?.message);
    if (name) adminLoadFailures.add(name);
    return fallback;
  }
};

export const adminApi = {
  // ---- Dashboard / Metrics ----
  getMetrics: () =>
    safe(apiClient.get('/admin/metrics'), null, 'metrics', (res) => res?.metrics || res?.data),

  // ---- People ----
  getMembers: (params) => safe(apiClient.get('/admin/users', { params }), [], 'members'),
  verifyMember: (id, verified) =>
    safe(apiClient.put(`/admin/users/${id}/verify`, { verified }), { ok: true }),

  // ---- Leads ----
  getLeads: () => safe(apiClient.get('/admin/leads'), []),
  updateLeadStage: (id, stage) =>
    safe(apiClient.put(`/admin/leads/${id}`, { stage }), { ok: true }),

  // ---- Businesses & Referrals ----
  getBusinesses: () => safe(apiClient.get('/businesses'), [], 'businesses', (res) => res?.businesses || res?.data),
  getReferrals: () => safe(apiClient.get('/sangam/referrals'), [], 'referrals', (res) => res?.referrals || res?.data),
  createReferral: (payload) =>
    safe(apiClient.post('/sangam/referrals', payload), { ok: true }),

  // ---- Content CMS ----
  getContent: (type) => safe(apiClient.get(`/admin/content/${type}`), []),
  saveContent: (payload) =>
    safe(apiClient.post('/admin/content', payload), { ok: true }),
  publishContent: (id) =>
    safe(apiClient.put(`/admin/content/${id}/publish`), { ok: true }),

  // ---- Media Library ----
  getMedia: () => safe(apiClient.get('/admin/media'), []),
  uploadMedia: (formData) =>
    safe(apiClient.post('/admin/media', formData), { ok: true }),

  // ---- Events ----
  getEvents: () => safe(apiClient.get('/admin/events'), []),
  createEvent: (payload) =>
    safe(apiClient.post('/admin/events', payload), { ok: true }),

  // ---- Communication ----
  getCampaigns: () => safe(apiClient.get('/admin/campaigns'), []),
  sendCampaign: (payload) =>
    safe(apiClient.post('/admin/campaigns/send', payload), { ok: true }),

  // ---- Complaints / Tickets ----
  getTickets: () => safe(apiClient.get('/admin/tickets'), []),
  updateTicket: (id, payload) =>
    safe(apiClient.put(`/admin/tickets/${id}`, payload), { ok: true }),

  // ---- Workflows ----
  getWorkflows: () => safe(apiClient.get('/admin/workflows'), []),

  // ---- Master Data ----
  getMasterData: (type) => safe(apiClient.get(`/admin/master/${type}`), []),

  // ---- Roles & Permissions ----
  getRoles: () => safe(apiClient.get('/admin/roles'), []),
  getPermissions: () => safe(apiClient.get('/admin/permissions'), []),

  // ---- Audit ----
  getAuditLogs: (params) => safe(apiClient.get('/admin/audit-logs', { params }), []),

  // ---- Blood / Seva ----
  getBloodRequests: () => safe(apiClient.get('/blood/requests'), [])
};

export default adminApi;
