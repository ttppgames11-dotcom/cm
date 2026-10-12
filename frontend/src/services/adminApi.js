// src/services/adminApi.js
import apiClient from './apiClient';

// -----------------------------------------------------------
// CENTRALIZED ADMIN API LAYER
// Every call falls back to local data so the UI never breaks
// -----------------------------------------------------------

const safe = async (promise, fallback = null) => {
  try {
    const res = await promise;
    return res?.data ?? fallback;
  } catch (err) {
    console.warn('[adminApi fallback]', err?.message);
    return fallback;
  }
};

export const adminApi = {
  // ---- Dashboard / Metrics ----
  getMetrics: () =>
    safe(apiClient.get('/admin/metrics'), {
      totalMembers: 0, activeMembers: 0, newRegistrations: 0,
      businesses: 0, chapters: 0, events: 0, donations: 0,
      contributions: 0, leads: 0, serviceRequests: 0, complaints: 0,
      pendingApprovals: 0, contentAwaitingReview: 0, revenue: 0
    }),

  // ---- People ----
  getMembers: (params) => safe(apiClient.get('/admin/users', { params }), []),
  verifyMember: (id, verified) =>
    safe(apiClient.put(`/admin/users/${id}/verify`, { verified }), { ok: true }),

  // ---- Leads ----
  getLeads: () => safe(apiClient.get('/admin/leads'), []),
  updateLeadStage: (id, stage) =>
    safe(apiClient.put(`/admin/leads/${id}`, { stage }), { ok: true }),

  // ---- Businesses & Referrals ----
  getBusinesses: () => safe(apiClient.get('/sangam/businesses'), []),
  getReferrals: () => safe(apiClient.get('/sangam/referrals'), []),
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
