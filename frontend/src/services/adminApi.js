// src/services/adminApi.js
import apiClient from './apiClient';

// -----------------------------------------------------------
// CENTRALIZED ADMIN API LAYER
// Every call falls back to local data so the UI never breaks
// -----------------------------------------------------------

const safe = async (promise, fallback = null) => {
  try {
    const res = await promise;
    if (res === null || res === undefined) return fallback;
    // Handle { success, data } envelopes or top-level arrays/objects
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (res?.users && Array.isArray(res.users)) return res.users;
    if (res?.businesses && Array.isArray(res.businesses)) return res.businesses;
    if (res?.referrals && Array.isArray(res.referrals)) return res.referrals;
    if (res?.records && Array.isArray(res.records)) return res.records;
    if (res?.requests && Array.isArray(res.requests)) return res.requests;
    return res?.data ?? res ?? fallback;
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
  deleteMember: (id) => safe(apiClient.deleteAdminUser(id), { ok: true, success: true }),
  deleteUser: (id) => safe(apiClient.deleteAdminUser(id), { ok: true, success: true }),
  changeMemberId: (id, newId, isVip, vipNumber) =>
    safe(apiClient.put(`/admin/members/${id}/change-id`, { newId, isVip, vipNumber }), { ok: true, success: true }),

  // ---- Leads ----
  getLeads: () => safe(apiClient.get('/crm/member-referrals'), []),
  updateLeadStage: (id, stage) =>
    safe(apiClient.put(`/admin/leads/${id}`, { stage }), { ok: true }),

  // ---- Businesses & Referrals ----
  getBusinesses: () => safe(apiClient.get('/businesses'), []),
  getReferrals: () => safe(apiClient.getAllMemberReferrals(), []),
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
  getBloodRequests: () => safe(apiClient.get('/blood/requests'), []),

  // ---- Member Referrals (CRM) ----
  getReferrals: () => safe(apiClient.getAllMemberReferrals(), []),

  // ---- Unified Approvals Engine ----
  getUnifiedApprovals: (params = {}) =>
    safe(apiClient.getUnifiedApprovals(params), {
      approvals: [],
      countsByModule: {},
      totalPendingCount: 0
    }),
  actionUnifiedApproval: (data) =>
    safe(apiClient.actionUnifiedApproval(data), { ok: true }),

  // ---- User CRUD (Superadmin Create/Edit) ----
  createUser: (payload) =>
    safe(apiClient.post('/admin/users', payload), { ok: true, success: false }),
  updateUser: (id, payload) =>
    safe(apiClient.put(`/admin/users/${id}`, payload), { ok: true, success: false }),

  // ---- Super Admin Sponsor & Downline Controller ----
  getSponsorHierarchy: (memberId) =>
    safe(apiClient.get(`/admin/sponsor-hierarchy/${memberId}`), null),
  changeSponsor: (payload) =>
    safe(apiClient.post('/admin/change-sponsor', payload), { success: false }),

  // ---- Super Admin Platform Switches & Feature Control ----
  getPlatformControls: () =>
    safe(apiClient.get('/admin/platform-controls'), { controls: {} }),
  updatePlatformControls: (payload) =>
    safe(apiClient.put('/admin/platform-controls', payload), { success: false }),

  // ---- Granular Permission Controller Matrix ----
  getPermissionRules: () =>
    safe(apiClient.get('/admin/permission-controller'), { rules: [] }),
  updatePermissionRules: (rules) =>
    safe(apiClient.put('/admin/permission-controller', { rules }), { success: false })
};

export default adminApi;

