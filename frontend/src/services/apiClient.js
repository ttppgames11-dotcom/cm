// Central API Client connecting React Frontend to Express Backend Server (Port 5000)

const BASE_URL = '/api';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cm_jwt_token') : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {})
      }
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.error || `HTTP error! status: ${res.status}`);
    }
    return json;
  } catch (err) {
    console.warn(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const apiClient = {
  // Doctors API
  getDoctors: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/doctors${qs ? '?' + qs : ''}`);
    return res.data?.doctors || res.doctors || res.data || [];
  },
  addDoctor: async (doctor) => {
    return await fetchJson('/doctors', { method: 'POST', body: JSON.stringify(doctor) });
  },

  // Blood API
  getBloodRequests: async () => {
    const res = await fetchJson('/blood/requests');
    return res.data?.requests || res.requests || res.data || [];
  },
  addBloodRequest: async (req) => {
    return await fetchJson('/blood/requests', { method: 'POST', body: JSON.stringify(req) });
  },
  getDonors: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/blood/donors${qs ? '?' + qs : ''}`);
    return res.data?.donors || res.donors || res.data || [];
  },
  addDonor: async (donor) => {
    return await fetchJson('/blood/donors', { method: 'POST', body: JSON.stringify(donor) });
  },

  // Matrimony API
  getMatrimonyProfiles: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/matrimony${qs ? '?' + qs : ''}`);
    return res.data?.profiles || res.profiles || res.data || [];
  },
  addMatrimonyProfile: async (profile) => {
    return await fetchJson('/matrimony', { method: 'POST', body: JSON.stringify(profile) });
  },

  // Political Grievances API
  getGrievances: async () => {
    const res = await fetchJson('/political/grievances');
    return res.data?.grievances || res.grievances || res.data || [];
  },
  addGrievance: async (data) => {
    return await fetchJson('/political/grievances', { method: 'POST', body: JSON.stringify(data) });
  },

  // Social Volunteers API
  getVolunteers: async () => {
    const res = await fetchJson('/social/volunteers');
    return res.data?.volunteers || res.volunteers || res.data || [];
  },
  addVolunteer: async (data) => {
    return await fetchJson('/social/volunteers', { method: 'POST', body: JSON.stringify(data) });
  },

  // Women Help API
  getWomenHelpRequests: async () => {
    const res = await fetchJson('/women/help');
    return res.data?.requests || res.requests || res.data || [];
  },
  addWomenHelpRequest: async (data) => {
    return await fetchJson('/women/help', { method: 'POST', body: JSON.stringify(data) });
  },

  // Builders API
  getBuilders: async () => {
    const res = await fetchJson('/builders');
    return res.data?.builders || res.builders || res.data || [];
  },
  addBuilder: async (data) => {
    return await fetchJson('/builders', { method: 'POST', body: JSON.stringify(data) });
  },
  addBuilderInquiry: async (data) => {
    return await fetchJson('/builders/inquiry', { method: 'POST', body: JSON.stringify(data) });
  },

  // Artists API
  getArtists: async () => {
    const res = await fetchJson('/artists');
    return res.data?.artists || res.artists || res.data || [];
  },
  addArtist: async (data) => {
    return await fetchJson('/artists', { method: 'POST', body: JSON.stringify(data) });
  },

  // Officers API
  getOfficers: async () => {
    const res = await fetchJson('/officers');
    return res.data?.officers || res.officers || res.data || [];
  },
  addOfficer: async (data) => {
    return await fetchJson('/officers', { method: 'POST', body: JSON.stringify(data) });
  },

  // Speakers API
  getSpeakers: async () => {
    const res = await fetchJson('/speakers');
    return res.data?.speakers || res.speakers || res.data || [];
  },
  addSpeaker: async (data) => {
    return await fetchJson('/speakers', { method: 'POST', body: JSON.stringify(data) });
  },
  bookSpeaker: async (data) => {
    return await fetchJson('/speakers/book', { method: 'POST', body: JSON.stringify(data) });
  },

  // Organizations API
  getOrganizations: async () => {
    const res = await fetchJson('/organizations');
    return res.data?.organizations || res.organizations || res.data || [];
  },
  addOrganization: async (data) => {
    return await fetchJson('/organizations', { method: 'POST', body: JSON.stringify(data) });
  },

  // Manufacturers API
  getManufacturers: async () => {
    const res = await fetchJson('/manufacturers');
    return res.data?.manufacturers || res.manufacturers || res.data || [];
  },
  addManufacturer: async (data) => {
    return await fetchJson('/manufacturers', { method: 'POST', body: JSON.stringify(data) });
  },

  // Dairy API
  getDairy: async () => {
    const res = await fetchJson('/dairy');
    return res.data?.dairy || res.dairy || res.data || [];
  },
  addDairy: async (data) => {
    return await fetchJson('/dairy', { method: 'POST', body: JSON.stringify(data) });
  },

  // Bank Loans API
  getBankLoans: async () => {
    const res = await fetchJson('/bank/loans');
    return res.data?.loans || res.loans || res.data || [];
  },
  addLoanApplication: async (data) => {
    return await fetchJson('/bank/loans', { method: 'POST', body: JSON.stringify(data) });
  },

  // Sangam Referrals & Meetings API
  getReferrals: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/sangam/referrals${qs ? '?' + qs : ''}`);
    return res.data?.referrals || res.referrals || res.data || [];
  },
  createReferral: async (data) => {
    return await fetchJson('/sangam/referrals', { method: 'POST', body: JSON.stringify(data) });
  },
  updateReferralStatus: async (id, status, value) => {
    return await fetchJson(`/sangam/referrals/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, value }) });
  },
  getMeetings: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/sangam/meetings${qs ? '?' + qs : ''}`);
    return res.data?.meetings || res.meetings || res.data || [];
  },
  createMeeting: async (data) => {
    return await fetchJson('/sangam/meetings', { method: 'POST', body: JSON.stringify(data) });
  },

  // Site Content & CMS Management API
  getSiteContent: async () => {
    const res = await fetchJson('/admin/site-content');
    return res.data?.siteContent || res.siteContent || res.data || null;
  },
  updateSiteContent: async (content) => {
    const res = await fetchJson('/admin/site-content', { method: 'PUT', body: JSON.stringify(content) });
    return res.data?.siteContent || res.siteContent || res.data || content;
  },
  updateSiteSection: async (section, data) => {
    const res = await fetchJson(`/admin/site-content/${section}`, { method: 'PUT', body: JSON.stringify(data) });
    return res.data?.siteContent || res.siteContent || res.data || null;
  },
  resetSiteContent: async () => {
    const res = await fetchJson('/admin/site-content/reset', { method: 'POST' });
    return res.data?.siteContent || res.siteContent || res.data || null;
  },

  // =========================================================================
  // SUPERADMIN & ADMIN MASTER CRUD API
  // =========================================================================
  // Users CRUD
  getAdminUsers: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/admin/users${qs ? '?' + qs : ''}`);
    return res.data || { users: [], count: 0, stats: {} };
  },
  createAdminUser: async (data) => {
    return await fetchJson('/admin/users', { method: 'POST', body: JSON.stringify(data) });
  },
  getAdminUser: async (id) => {
    const res = await fetchJson(`/admin/users/${id}`);
    return res.data?.user || res.user || null;
  },
  updateAdminUser: async (id, data) => {
    return await fetchJson(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteAdminUser: async (id) => {
    return await fetchJson(`/admin/users/${id}`, { method: 'DELETE' });
  },
  assignAdminRole: async (memberId, newRole, assignedScope, remarks) => {
    return await fetchJson('/admin/assign-role', {
      method: 'PUT',
      body: JSON.stringify({ memberId, newRole, assignedScope, remarks })
    });
  },
  getRolesMatrix: async () => {
    const res = await fetchJson('/admin/roles-matrix');
    return res.data?.rolesMatrix || [];
  },

  // Doctors CRUD
  getAdminDoctors: async () => {
    const res = await fetchJson('/admin/doctors');
    return res.data?.doctors || res.doctors || [];
  },
  createAdminDoctor: async (data) => {
    return await fetchJson('/admin/doctors', { method: 'POST', body: JSON.stringify(data) });
  },
  updateAdminDoctor: async (id, data) => {
    return await fetchJson(`/admin/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteAdminDoctor: async (id) => {
    return await fetchJson(`/admin/doctors/${id}`, { method: 'DELETE' });
  },

  // Services & Providers CRUD
  getAdminServices: async () => {
    const res = await fetchJson('/admin/services');
    return res.data?.services || res.services || [];
  },
  createAdminService: async (data) => {
    return await fetchJson('/admin/services', { method: 'POST', body: JSON.stringify(data) });
  },
  updateAdminService: async (id, data) => {
    return await fetchJson(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteAdminService: async (id) => {
    return await fetchJson(`/admin/services/${id}`, { method: 'DELETE' });
  },

  // Hotels & Hospitality CRUD
  getAdminHotels: async () => {
    const res = await fetchJson('/admin/hotels');
    return res.data?.hotels || res.hotels || [];
  },
  createAdminHotel: async (data) => {
    return await fetchJson('/admin/hotels', { method: 'POST', body: JSON.stringify(data) });
  },
  updateAdminHotel: async (id, data) => {
    return await fetchJson(`/admin/hotels/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteAdminHotel: async (id) => {
    return await fetchJson(`/admin/hotels/${id}`, { method: 'DELETE' });
  },

  // Information & Articles CRUD
  getAdminInformation: async () => {
    const res = await fetchJson('/admin/information');
    return res.data?.information || res.information || [];
  },
  createAdminInformation: async (data) => {
    return await fetchJson('/admin/information', { method: 'POST', body: JSON.stringify(data) });
  },
  updateAdminInformation: async (id, data) => {
    return await fetchJson(`/admin/information/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteAdminInformation: async (id) => {
    return await fetchJson(`/admin/information/${id}`, { method: 'DELETE' });
  }
};

export default apiClient;
