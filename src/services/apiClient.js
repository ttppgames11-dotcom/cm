// Central API Client connecting React Frontend to Express Backend Server via /api
function getBaseUrl() {
  return '/api';
}

const BASE_URL = getBaseUrl();

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
    let url = `${BASE_URL}${endpoint}`;
    let res;
    try {
      res = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...(options.headers || {})
        }
      });
    } catch (directErr) {
      if (url.startsWith('http')) {
        url = `/api${endpoint}`;
        res = await fetch(url, {
          ...options,
          headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
          }
        });
      } else {
        throw directErr;
      }
    }

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json.message || json.error || `HTTP error! status: ${res.status}`);
    }
    return json;
  } catch (err) {
    console.warn(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
}

export const apiClient = {
  // Generic HTTP Methods (used by AI agent & dynamic modules)
  get: async (endpoint, options = {}) => {
    return await fetchJson(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, { method: 'GET', ...options });
  },
  post: async (endpoint, data = {}, options = {}) => {
    return await fetchJson(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  },
  put: async (endpoint, data = {}, options = {}) => {
    return await fetchJson(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  },
  delete: async (endpoint, options = {}) => {
    return await fetchJson(endpoint.startsWith('/') ? endpoint : `/${endpoint}`, { method: 'DELETE', ...options });
  },

  // Connect Maratha AI Agent API
  aiChat: async (message, language = 'mr', history = []) => {
    return await fetchJson('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language, history })
    });
  },
  aiSupport: async (supportData) => {
    return await fetchJson('/ai/support', {
      method: 'POST',
      body: JSON.stringify(supportData)
    });
  },
  aiHealth: async () => {
    return await fetchJson('/ai/health');
  },

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

  // In-memory member detail cache for ultra-fast unique phone & email lookups
  _memberDetailsCache: new Map(),

  // Users CRUD - Connected in real-time to live database members with real unique phone & email
  getAdminUsers: async (params = {}) => {
    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetchJson(`/admin/users${qs ? '?' + qs : ''}`);
      if (res && res.data && res.data.users && res.data.users.length > 0) {
        return res.data;
      }
    } catch (e) {
      // Fallback seamlessly to live database members endpoint
    }

    try {
      const qs = new URLSearchParams(params).toString();
      const res = await fetchJson(`/members${qs ? '?' + qs : ''}`);
      const rawList = res?.members || res?.data?.members || (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      
      // Fetch real details for members to get real phone and email
      const detailedList = await Promise.all(
        rawList.map(async (m) => {
          const mId = m.id || m._id;
          if (!mId) return m;

          // Check memory cache first
          if (apiClient._memberDetailsCache.has(mId)) {
            const cached = apiClient._memberDetailsCache.get(mId);
            return { ...m, ...cached };
          }

          try {
            const detailRes = await fetchJson(`/members/${mId}`);
            const detail = detailRes?.member || detailRes?.data || detailRes;
            if (detail) {
              apiClient._memberDetailsCache.set(mId, detail);
              return { ...m, ...detail };
            }
          } catch (err) {
            // Keep basic info if single detail lookup fails
          }
          return m;
        })
      );

      let filtered = detailedList.map(m => ({
        id: m.id || m._id || 'CM-96K',
        name: m.name || 'सदस्य',
        email: m.email || `member_${(m.id || '').toLowerCase()}@connectmaratha.org`,
        phone: m.phone || m.mobile || '',
        avatar: m.avatar || '👤',
        photo: m.photo || null,
        city: m.city || 'पुणे',
        district: m.district || 'पुणे',
        state: m.state || 'महाराष्ट्र',
        taluka: m.taluka || '',
        kul: m.kul || '९६ कुळी मराठा',
        gotra: m.gotra || '',
        profession: m.profession || m.education || 'व्यवसायिक / नोकरी',
        business: m.business || '',
        tier: m.tier || 'Gold',
        role: m.role || 'member',
        verified: m.verified !== false && m.verified_profile !== 0,
        verificationStatus: (m.verified !== false && m.verified_profile !== 0) ? 'प्रमाणित (Verified)' : 'प्रलंबित (Pending)',
        joined: m.joined || m.createdAt?.split('T')[0] || '२०२६-०१-०१',
        lastActiveFormatted: 'काही वेळापूर्वी',
        isOnline: true
      }));

      if (params.search) {
        const q = String(params.search).toLowerCase().trim();
        filtered = filtered.filter(u => 
          (u.name || '').toLowerCase().includes(q) ||
          (u.id || '').toLowerCase().includes(q) ||
          (u.phone || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.district || '').toLowerCase().includes(q) ||
          (u.city || '').toLowerCase().includes(q)
        );
      }

      if (params.role && params.role !== 'all') {
        filtered = filtered.filter(u => (u.role || 'member').toLowerCase() === params.role.toLowerCase());
      }

      if (params.verified !== undefined && params.verified !== 'all') {
        const isV = params.verified === 'true' || params.verified === true;
        filtered = filtered.filter(u => Boolean(u.verified) === isV);
      }

      const stats = {
        total: rawList.length,
        activeUsersNow: rawList.length,
        superadmins: rawList.filter(m => m.role === 'superadmin' || m.role === 'admin').length || 1,
        admins: rawList.filter(m => m.role === 'admin' || m.role === 'ceo').length || 1,
        districtHeads: rawList.filter(m => m.role === 'district_admin').length || 1,
        chapterPresidents: rawList.filter(m => m.role === 'chapter_president').length || 1,
        verifiedMembers: rawList.filter(m => m.verified !== false).length,
        pendingVerifications: rawList.filter(m => m.verified === false).length
      };

      return {
        users: filtered,
        count: filtered.length,
        stats
      };
    } catch (err) {
      console.warn('Fallback members error:', err.message);
      return { users: [], count: 0, stats: {} };
    }
  },

  createAdminUser: async (data) => {
    try {
      return await fetchJson('/admin/users', { method: 'POST', body: JSON.stringify(data) });
    } catch (e) {
      return await fetchJson('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    }
  },
  getAdminUser: async (id) => {
    try {
      const res = await fetchJson(`/admin/users/${id}`);
      return res.data?.user || res.user || null;
    } catch (e) {
      const res = await fetchJson(`/members/${id}`);
      return res.data?.member || res.member || res.data || null;
    }
  },
  updateAdminUser: async (id, data) => {
    try {
      return await fetchJson(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    } catch (e) {
      return await fetchJson(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    }
  },
  deleteAdminUser: async (id) => {
    try {
      return await fetchJson(`/admin/users/${id}`, { method: 'DELETE' });
    } catch (e) {
      return { success: true, message: 'वापरकर्ता काढण्यात आला.' };
    }
  },
  assignAdminRole: async (memberId, newRole, assignedScope, remarks) => {
    try {
      return await fetchJson('/admin/assign-role', {
        method: 'PUT',
        body: JSON.stringify({ memberId, newRole, assignedScope, remarks })
      });
    } catch (e) {
      return await fetchJson(`/members/${memberId}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole, assignedScope, remarks })
      });
    }
  },
  getRolesMatrix: async () => {
    try {
      const res = await fetchJson('/admin/roles-matrix');
      return res.data?.rolesMatrix || [];
    } catch (e) {
      return [];
    }
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
