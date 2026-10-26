// Central API Client connecting React Frontend to Express Backend Server via /api
export const API_SERVER_ORIGIN = (typeof window !== 'undefined' && window.__CM_API_ORIGIN) || 
  (import.meta.env?.VITE_API_ORIGIN) || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '3000' || window.location.port === '5173') ? 'http://localhost:5000' : 'https://api.connectmaratha.com');

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    if (window.__CM_API_URL) return window.__CM_API_URL;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '3000' || window.location.port === '5173') {
      return '/api';
    }
  }
  return (import.meta.env?.VITE_API_URL) || `${API_SERVER_ORIGIN}/api`;
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cm_jwt_token') : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (typeof window !== 'undefined') {
    try {
      const uStr = localStorage.getItem('cm_user_data');
      if (uStr) {
        const u = JSON.parse(uStr);
        if (u?.id) headers['X-User-Id'] = u.id;
        if (u?.phone) headers['X-User-Phone'] = u.phone;
      }
    } catch (_) {}
  }
  return headers;
}

async function fetchJson(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const candidates = [
    `${getBaseUrl()}${cleanEndpoint}`,
    `/api${cleanEndpoint}`,
    `http://localhost:5000/api${cleanEndpoint}`,
    `https://api.connectmaratha.com/api${cleanEndpoint}`
  ];

  let lastError = null;
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...(options.headers || {})
        }
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || json.error || `HTTP error! status: ${res.status}`);
      }
      return json;
    } catch (err) {
      lastError = err;
    }
  }

  console.warn(`API Error [${endpoint}]:`, lastError?.message);
  throw lastError;
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

  // Member Registration Referrals API (Persistent SQLite)
  getMemberReferrals: async () => {
    try {
      const res = await fetchJson('/members/referrals/my');
      return res.data || res;
    } catch (e) {
      return null;
    }
  },
  getAllMemberReferrals: async () => {
    try {
      const res = await fetchJson('/crm/member-referrals');
      return res.data?.referrals || res.referrals || [];
    } catch (e) {
      return [];
    }
  },
  verifyMemberReferralCode: async (code) => {
    try {
      const res = await fetchJson(`/members/referrals/verify/${encodeURIComponent(code)}`);
      return res.data || res;
    } catch (e) {
      return { valid: false };
    }
  },
  requestMemberReferralPayout: async (data) => {
    return await fetchJson('/members/referrals/payout', { method: 'POST', body: JSON.stringify(data) });
  },

  // Direct Messages & Interconnection API (Persistent SQLite)
  getConversations: async () => {
    try {
      const res = await fetchJson('/messages/conversations');
      return res.data?.conversations || res.conversations || [];
    } catch (e) {
      return [];
    }
  },
  getMessageThread: async (partnerId) => {
    try {
      const res = await fetchJson(`/messages/${encodeURIComponent(partnerId)}`);
      return res.data || res;
    } catch (e) {
      return { partner: null, messages: [] };
    }
  },
  sendDirectMessage: async (partnerId, text) => {
    return await fetchJson(`/messages/${encodeURIComponent(partnerId)}`, {
      method: 'POST',
      body: JSON.stringify({ recipientId: partnerId, text })
    });
  },
  deleteDirectMessage: async (id) => {
    return await fetchJson(`/messages/${id}`, { method: 'DELETE' });
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

  // Admin Metrics API (supports CEO macro view & admin dashboard)
  getAdminMetrics: async () => {
    try {
      const res = await fetchJson('/admin/metrics');
      return res.data?.metrics || res.metrics || res.data || null;
    } catch (e) {
      return null;
    }
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

      let filtered = detailedList.map(m => {
        const cleanPhone = (m.phone || m.mobile || '').trim();
        const cleanEmail = (m.email || '').trim();
        return {
          id: m.id || m._id || 'CM-96K',
          name: m.name || 'सदस्य',
          email: cleanEmail || (cleanPhone ? `${cleanPhone}@connectmaratha.com` : 'ईमेल नोंदणीकृत नाही'),
          rawEmail: cleanEmail,
          phone: cleanPhone || 'फोन नोंदणीकृत नाही',
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
        };
      });

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
      const payload = {
        name: data.name,
        phone: data.phone,
        email: data.email || `${data.phone}@connectmaratha.com`,
        password: data.password || 'password123',
        district: data.district || 'पुणे',
        taluka: data.taluka || '',
        role: data.role || 'member',
        kul: data.kul || '९६ कुळी मराठा',
        gotra: data.gotra || '',
        tier: data.tier || 'Gold',
        profession: data.profession || 'व्यवसायिक / नोकरी',
        business: data.business || ''
      };
      const res = await fetchJson('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
      if (res && res.member) {
        apiClient._memberDetailsCache.set(res.member.id, res.member);
      }
      return res;
    } catch (e) {
      throw e;
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
      return await fetchJson(`/members/${id}`, { method: 'DELETE' });
    }
  },
  deleteMember: async (id) => {
    try {
      return await fetchJson(`/admin/users/${id}`, { method: 'DELETE' });
    } catch (e) {
      return await fetchJson(`/members/${id}`, { method: 'DELETE' });
    }
  },
  deleteUser: async (id) => {
    try {
      return await fetchJson(`/admin/users/${id}`, { method: 'DELETE' });
    } catch (e) {
      return await fetchJson(`/members/${id}`, { method: 'DELETE' });
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
  },

  // Multi-tier Hierarchy & Community Centers API
  getHierarchyMetrics: async () => {
    const res = await fetchJson('/admin/hierarchy-metrics');
    return res.data || res;
  },
  getCommunityCenters: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/admin/community-centers${query ? `?${query}` : ''}`;
    const res = await fetchJson(endpoint);
    const list = res.data?.centers || res.centers || [];
    if (res.data?.realStats) {
      list.realStats = res.data.realStats;
    }
    return list;
  },
  createCommunityCenter: async (data) => {
    return await fetchJson('/admin/community-centers', { method: 'POST', body: JSON.stringify(data) });
  },
  updateCommunityCenter: async (id, data) => {
    return await fetchJson(`/admin/community-centers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteCommunityCenter: async (id) => {
    return await fetchJson(`/admin/community-centers/${id}`, { method: 'DELETE' });
  },
  getBranches: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    const res = await fetchJson(`/crm/branches${q ? `?${q}` : ''}`).catch(async () => {
      return await fetchJson(`/admin/branches${q ? `?${q}` : ''}`);
    });
    return res.data?.branches || res.branches || [];
  },
  createBranch: async (branchData) => {
    return await fetchJson('/crm/branches', {
      method: 'POST',
      body: JSON.stringify(branchData)
    });
  },
  getMembers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetchJson(`/members${query ? `?${query}` : ''}`);
    return res.members || res.data?.members || res.data || [];
  },
  getBusinesses: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetchJson(`/businesses${query ? `?${query}` : ''}`);
    return res.businesses || res.data?.businesses || res.data || [];
  },
  getJobs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetchJson(`/jobs${query ? `?${query}` : ''}`);
    return res.jobs || res.data?.jobs || res.data || [];
  },
  verifyMemberKyc: async (id) => {
    return await fetchJson(`/admin/members/${id}/verify-kyc`, { method: 'POST' });
  },

  // Local Branch (Shakha) APIs
  getBranches: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/admin/branches${query ? `?${query}` : ''}`;
    const res = await fetchJson(endpoint);
    return res.data?.branches || res.branches || [];
  },
  recordBranchAction: async (data) => {
    return await fetchJson('/admin/branch-action', { method: 'POST', body: JSON.stringify(data) });
  },

  // 🚩 Unified CRM Operations & 12 Golden Rules APIs
  getUnifiedCRMDashboard: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/crm/unified-dashboard${query ? `?${query}` : ''}`;
    const res = await fetchJson(endpoint);
    return res.data || res;
  },
  getUnifiedTickets: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/crm/tickets${query ? `?${query}` : ''}`;
    const res = await fetchJson(endpoint);
    return res.data?.tickets || res.tickets || [];
  },
  createUnifiedTicket: async (data) => {
    return await fetchJson('/crm/tickets', { method: 'POST', body: JSON.stringify(data) });
  },
  escalateUnifiedTicket: async (id, reason) => {
    return await fetchJson(`/crm/tickets/${id}/escalate`, { method: 'PATCH', body: JSON.stringify({ reason }) });
  },
  updateUnifiedTicketStatus: async (id, status, note = '') => {
    return await fetchJson(`/crm/tickets/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) });
  },
  checkinCommunityVisitor: async (centerId, data) => {
    return await fetchJson(`/crm/community-centers/${centerId}/checkin`, { method: 'POST', body: JSON.stringify(data) });
  },
  recordCenterLedgerTransaction: async (centerId, data) => {
    return await fetchJson(`/crm/community-centers/${centerId}/transaction`, { method: 'POST', body: JSON.stringify(data) });
  },
  getStaffRoster: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/crm/staff${query ? `?${query}` : ''}`;
    const res = await fetchJson(endpoint);
    return res.data?.staff || res.staff || [];
  },
  getOrganizationUnits: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/crm/organization-units${query ? `?${query}` : ''}`;
    const res = await fetchJson(endpoint);
    return res.data?.units || res.units || [];
  },

  // 🩸 24x7 Emergency Blood & Donor API
  getBloodRequests: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetchJson(`/blood/requests${query ? `?${query}` : ''}`);
    return res.data?.requests || res.requests || [];
  },
  getMyBloodRequests: async () => {
    const res = await fetchJson('/blood/requests/my');
    return res.data?.requests || res.requests || [];
  },
  getPendingBloodRequests: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetchJson(`/blood/requests/admin/pending${query ? `?${query}` : ''}`);
    return res.data?.requests || res.requests || [];
  },
  getBloodRequestById: async (id) => {
    const res = await fetchJson(`/blood/requests/${id}`);
    return res.data?.request || res.request || null;
  },
  postBloodSOS: async (data) => {
    return await fetchJson('/blood/requests', { method: 'POST', body: JSON.stringify(data) });
  },
  createBloodRequest: async (data) => {
    return await fetchJson('/blood/requests', { method: 'POST', body: JSON.stringify(data) });
  },
  addBloodRequest: async (data) => {
    return await fetchJson('/blood/requests', { method: 'POST', body: JSON.stringify(data) });
  },
  verifyBloodRequest: async (id, data = {}) => {
    return await fetchJson(`/blood/requests/${id}/verify`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  fulfillBloodRequest: async (id, data = {}) => {
    return await fetchJson(`/blood/requests/${id}/fulfill`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  respondToBloodRequest: async (id, data) => {
    return await fetchJson(`/blood/requests/${id}/respond`, { method: 'POST', body: JSON.stringify(data) });
  },
  getBloodRequestResponses: async (id) => {
    const res = await fetchJson(`/blood/requests/${id}/responses`);
    return res.data?.responses || res.responses || [];
  },
  getDonors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetchJson(`/blood/donors${query ? `?${query}` : ''}`);
    return res.data?.donors || res.donors || [];
  },
  getBloodDonors: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetchJson(`/blood/donors${query ? `?${query}` : ''}`);
    return res.data?.donors || res.donors || [];
  },
  getMyDonorProfile: async () => {
    const res = await fetchJson('/blood/donors/my');
    return res.data?.donor || res.donor || null;
  },
  registerBloodDonor: async (data) => {
    return await fetchJson('/blood/donors', { method: 'POST', body: JSON.stringify(data) });
  },
  addDonor: async (data) => {
    return await fetchJson('/blood/donors', { method: 'POST', body: JSON.stringify(data) });
  },
  updateDonorAvailability: async (id, data) => {
    return await fetchJson(`/blood/donors/${id}/availability`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  // Maratha Bank & Finance
  getBankLoans: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/bank/loans${qs ? '?' + qs : ''}`);
    return res.data || res;
  },
  applyBankLoan: async (data) => {
    return await fetchJson('/bank/loans', { method: 'POST', body: JSON.stringify(data) });
  },
  updateBankLoanStatus: async (id, data) => {
    return await fetchJson(`/bank/loans/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  applyBankAccount: async (data) => {
    return await fetchJson('/bank/accounts/apply', { method: 'POST', body: JSON.stringify(data) });
  },
  enrollBankCourse: async (data) => {
    return await fetchJson('/bank/institute/enroll', { method: 'POST', body: JSON.stringify(data) });
  },

  // Maratha Dairy & Agro Collection
  getDairy: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/dairy${qs ? '?' + qs : ''}`);
    return res.data?.dairy || res.dairy || res.data || [];
  },
  getDairyFull: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/dairy${qs ? '?' + qs : ''}`);
    return res.data || res;
  },
  addDairy: async (data) => {
    return await fetchJson('/dairy', { method: 'POST', body: JSON.stringify(data) });
  },
  registerDairyFarmer: async (data) => {
    return await fetchJson('/dairy/farmers', { method: 'POST', body: JSON.stringify(data) });
  },
  createDairyOrder: async (data) => {
    return await fetchJson('/dairy/orders', { method: 'POST', body: JSON.stringify(data) });
  },
  applyDairyPartner: async (data) => {
    return await fetchJson('/dairy/partner', { method: 'POST', body: JSON.stringify(data) });
  },

  // Digital Community & Groups (/api/community)
  getCommunityPosts: async (params = {}) => {
    const qs = typeof params === 'string' ? `groupId=${params}` : new URLSearchParams(params).toString();
    const res = await fetchJson(`/community/posts${qs ? '?' + qs : ''}`);
    return res.data?.posts || res.posts || res.data || [];
  },
  createCommunityPost: async (data) => {
    return await fetchJson('/community/posts', { method: 'POST', body: JSON.stringify(data) });
  },
  likeCommunityPost: async (postId) => {
    return await fetchJson(`/community/posts/${postId}/like`, { method: 'POST' });
  },
  addCommunityComment: async (postId, data) => {
    return await fetchJson(`/community/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(data) });
  },
  deleteCommunityPost: async (postId) => {
    return await fetchJson(`/community/posts/${postId}`, { method: 'DELETE' });
  },
  reportCommunityPost: async (postId, data) => {
    return await fetchJson(`/community/posts/${postId}/report`, { method: 'POST', body: JSON.stringify(data) });
  },
  getCommunityGroups: async () => {
    const res = await fetchJson('/community/groups');
    return res.data?.groups || res.groups || res.data || [];
  },
  joinCommunityGroup: async (groupId) => {
    return await fetchJson(`/community/groups/${groupId}/join`, { method: 'POST' });
  },
  getCommunityNews: async () => {
    const res = await fetchJson('/community/news');
    return res.data?.news || res.news || res.data || [];
  },

  // Unified Approvals Command Center (/api/admin)
  getUnifiedApprovals: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/admin/unified-approvals${qs ? '?' + qs : ''}`);
    return res.data || res;
  },
  actionUnifiedApproval: async (data) => {
    return await fetchJson('/admin/unified-approvals/action', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 🩸 Blood SOS & Donors Directory API
  getBloodRequests: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/blood/requests${qs ? '?' + qs : ''}`);
    return res.data?.requests || res.requests || res.data || [];
  },
  getMyBloodRequests: async () => {
    const res = await fetchJson('/blood/requests/my');
    return res.data?.requests || res.requests || res.data || [];
  },
  getDonors: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/blood/donors${qs ? '?' + qs : ''}`);
    return res.data?.donors || res.donors || res.data || [];
  },
  addBloodRequest: async (data) => {
    return await fetchJson('/blood/requests', { method: 'POST', body: JSON.stringify(data) });
  },
  registerDonor: async (data) => {
    return await fetchJson('/blood/donors', { method: 'POST', body: JSON.stringify(data) });
  },
  respondToBloodRequest: async (id, data) => {
    return await fetchJson(`/blood/requests/${id}/respond`, { method: 'POST', body: JSON.stringify(data) });
  },

  // 💍 Matrimony Portal API
  getMatrimonyProfiles: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/matrimony${qs ? '?' + qs : ''}`);
    return res.data?.profiles || res.profiles || res.data || [];
  },
  getMatrimonyProfileById: async (id) => {
    const res = await fetchJson(`/matrimony/${id}`);
    return res.data?.profile || res.profile || res.data;
  },
  registerMatrimony: async (data) => {
    return await fetchJson('/matrimony', { method: 'POST', body: JSON.stringify(data) });
  },
  sendMatrimonyInterest: async (id, data) => {
    return await fetchJson(`/matrimony/${id}/connect`, { method: 'POST', body: JSON.stringify(data) });
  },

  // 📚 Books & Literature API
  getBooks: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/books${qs ? '?' + qs : ''}`);
    return res.data?.books || res.books || res.data || [];
  },
  addBook: async (data) => {
    return await fetchJson('/books', { method: 'POST', body: JSON.stringify(data) });
  },

  // 🎬 Marathi Movies & Cinema API
  getMovies: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/movies${qs ? '?' + qs : ''}`);
    return res.data?.movies || res.movies || res.data || [];
  },
  addMovie: async (data) => {
    return await fetchJson('/movies', { method: 'POST', body: JSON.stringify(data) });
  },

  // 🤝 Social Workers Directory API
  getSocialWorkers: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/social-workers${qs ? '?' + qs : ''}`);
    return res.data?.socialWorkers || res.socialWorkers || res.data || [];
  },

  // 🎓 Higher Education & Scholarships API
  getScholarships: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/scholarships${qs ? '?' + qs : ''}`);
    return res.data?.scholarships || res.scholarships || res.data || [];
  },
  getColleges: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/colleges${qs ? '?' + qs : ''}`);
    return res.data?.colleges || res.colleges || res.data || [];
  },

  // 🎙️ Speakers & Orators API
  getSpeakers: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/speakers${qs ? '?' + qs : ''}`);
    return res.data?.speakers || res.speakers || res.data || [];
  },
  addSpeaker: async (data) => {
    return await fetchJson('/speakers', { method: 'POST', body: JSON.stringify(data) });
  },

  // 🏛️ Government Officers API
  getOfficers: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/officers${qs ? '?' + qs : ''}`);
    return res.data?.officers || res.officers || res.data || [];
  },
  addOfficer: async (data) => {
    return await fetchJson('/officers', { method: 'POST', body: JSON.stringify(data) });
  },

  // 🏢 Organizations Directory API
  getOrganizations: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/organizations${qs ? '?' + qs : ''}`);
    return res.data?.organizations || res.organizations || res.data || [];
  },
  addOrganization: async (data) => {
    return await fetchJson('/organizations', { method: 'POST', body: JSON.stringify(data) });
  },

  // 🛠️ Local Community Services & Commercial Exchange API
  getServiceCategories: async () => {
    const res = await fetchJson('/services/categories');
    return res.data?.categories || res.categories || res.data || [];
  },
  getServices: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/services${qs ? '?' + qs : ''}`);
    return res.data?.services || res.services || res.data || [];
  },
  getServiceById: async (id) => {
    const res = await fetchJson(`/services/${id}`);
    return res.data?.service || res.service || res.data;
  },
  addService: async (data) => {
    return await fetchJson('/services', { method: 'POST', body: JSON.stringify(data) });
  },
  bookService: async (id, data) => {
    return await fetchJson(`/services/${id}/booking`, { method: 'POST', body: JSON.stringify(data) });
  },
  getServiceBookings: async (id) => {
    const res = await fetchJson(`/services/${id}/bookings`);
    return res.data?.bookings || res.bookings || res.data || [];
  },
  getServiceReviews: async (id) => {
    const res = await fetchJson(`/services/${id}/reviews`);
    return res.data?.reviews || res.reviews || res.data || [];
  },
  addServiceReview: async (id, data) => {
    return await fetchJson(`/services/${id}/reviews`, { method: 'POST', body: JSON.stringify(data) });
  },
  postServiceEnquiry: async (data) => {
    return await fetchJson('/services/enquiries', { method: 'POST', body: JSON.stringify(data) });
  },
  getServiceEnquiries: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/services/enquiries${qs ? '?' + qs : ''}`);
    return res.data?.enquiries || res.enquiries || res.data || [];
  },
  submitBusinessQuote: async (data) => {
    return await fetchJson('/services/quotes', { method: 'POST', body: JSON.stringify(data) });
  },
  getBusinessQuotes: async (enquiryId) => {
    const res = await fetchJson(`/services/quotes/${enquiryId}`);
    return res.data?.quotes || res.quotes || res.data || [];
  },

  // 🏨 Hotels & Hospitality Booking API
  getHotels: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/hotels${qs ? '?' + qs : ''}`);
    return res.data?.hotels || res.hotels || res.data || [];
  },
  addHotel: async (data) => {
    return await fetchJson('/hotels', { method: 'POST', body: JSON.stringify(data) });
  },
  bookHotel: async (hotelId, data) => {
    return await fetchJson(`/hotels/${hotelId}/booking`, { method: 'POST', body: JSON.stringify(data) });
  },
  getHotelBookings: async (hotelId) => {
    const res = await fetchJson(`/hotels/${hotelId}/bookings`);
    return res.data?.bookings || res.bookings || res.data || [];
  },

  // 🩺 Doctor Consultations & Appointments API
  bookDoctorAppointment: async (doctorId, data) => {
    return await fetchJson(`/doctors/${doctorId}/appointment`, { method: 'POST', body: JSON.stringify(data) });
  },
  getDoctorAppointments: async (doctorId) => {
    const res = await fetchJson(`/doctors/${doctorId}/appointments`);
    return res.data?.appointments || res.appointments || res.data || [];
  },

  // 👥 CRM Field Staff & Operations API
  getCrmStaff: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/crm/staff${qs ? '?' + qs : ''}`);
    return res.data?.staff || res.staff || res.data || [];
  },
  addCrmStaff: async (data) => {
    return await fetchJson('/crm/staff', { method: 'POST', body: JSON.stringify(data) });
  },
  getCrmBranches: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/crm/branches${qs ? '?' + qs : ''}`);
    return res.data?.branches || res.branches || res.data || [];
  },
  addCrmBranch: async (data) => {
    return await fetchJson('/crm/branches', { method: 'POST', body: JSON.stringify(data) });
  },
  getCrmBranchActivities: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/crm/branch-activities${qs ? '?' + qs : ''}`);
    return res.data?.activities || res.activities || res.data || [];
  },
  addCrmBranchActivity: async (data) => {
    return await fetchJson('/crm/branch-activities', { method: 'POST', body: JSON.stringify(data) });
  },
  getCrmTerritoryOfficers: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    const res = await fetchJson(`/crm/territory-officers${qs ? '?' + qs : ''}`);
    return res.data?.officers || res.officers || res.data || [];
  },
  addCrmTerritoryOfficer: async (data) => {
    return await fetchJson('/crm/territory-officers', { method: 'POST', body: JSON.stringify(data) });
  },

  // 🛡️ Legal & Google Play Child Safety Standards API
  submitChildSafetyReport: async (data) => {
    return await fetchJson('/legal/child-safety-report', { method: 'POST', body: JSON.stringify(data) });
  },
  getChildSafetyStatus: async () => {
    return await fetchJson('/legal/child-safety-status');
  },
  getLegalReports: async () => {
    return await fetchJson('/legal/reports');
  },

  changeMemberId: async (id, newId, isVip, vipNumber) => {
    return await fetchJson(`/admin/members/${id}/change-id`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newId, isVip, vipNumber })
    });
  },

  // 👥 Member Referrals & Viral Growth Network (Central SQLite Sync)
  getMemberReferrals: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return await fetchJson(`/members/referrals/my${qs ? '?' + qs : ''}`);
  },
  verifyReferralCode: async (code) => {
    return await fetchJson(`/members/referrals/verify/${encodeURIComponent(code)}`);
  },
  requestReferralPayout: async (upi_id, amount) => {
    return await fetchJson('/members/referrals/payout', {
      method: 'POST',
      body: JSON.stringify({ upi_id, amount })
    });
  },

  // 💬 User-to-User Direct Messaging & Interconnection
  getConversations: async () => {
    return await fetchJson('/messages/conversations');
  },
  getChatThread: async (partnerId) => {
    return await fetchJson(`/messages/${encodeURIComponent(partnerId)}`);
  },
  sendChatMessage: async (partnerId, text) => {
    return await fetchJson(`/messages/${encodeURIComponent(partnerId)}`, {
      method: 'POST',
      body: JSON.stringify({ recipientId: partnerId, text })
    });
  },
  searchMembersForChat: async (q) => {
    return await fetchJson(`/messages/search/members${q ? '?q=' + encodeURIComponent(q) : ''}`);
  },

  // 🗺️ Location & State/District APIs
  getLocationsStates: async (countryId) => {
    return await fetchJson(`/locations/states${countryId ? `?countryId=${encodeURIComponent(countryId)}` : ''}`);
  },
  getLocationsDistricts: async (stateId) => {
    return await fetchJson(`/locations/districts?stateId=${encodeURIComponent(stateId)}`);
  },
  getLocationsTalukas: async (districtId) => {
    return await fetchJson(`/locations/talukas?districtId=${encodeURIComponent(districtId)}`);
  },

  // 🏛️ CRM Unit Hierarchy (Multi-State & Multi-Branch Engine)
  getCrmHierarchyMe: async () => {
    return await fetchJson('/crm-hierarchy/me');
  },
  getCrmUnits: async (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return await fetchJson(`/crm-hierarchy/units${q ? `?${q}` : ''}`);
  },
  getCrmUnitDetail: async (id) => {
    return await fetchJson(`/crm-hierarchy/units/${encodeURIComponent(id)}`);
  },
  createCrmUnit: async (unitData) => {
    return await fetchJson('/crm-hierarchy/units', {
      method: 'POST',
      body: JSON.stringify(unitData)
    });
  },
  updateCrmUnit: async (id, updates) => {
    return await fetchJson(`/crm-hierarchy/units/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  addCrmUnitStaff: async (unitId, staffData) => {
    return await fetchJson(`/crm-hierarchy/units/${encodeURIComponent(unitId)}/staff`, {
      method: 'POST',
      body: JSON.stringify(staffData)
    });
  },
  getCrmUnitStaff: async (unitId) => {
    return await fetchJson(`/crm-hierarchy/units/${encodeURIComponent(unitId)}/staff`);
  },
  getCrmUnitActivities: async (unitId, year = 2026) => {
    return await fetchJson(`/crm-hierarchy/units/${encodeURIComponent(unitId)}/activities?year=${year}`);
  },
  updateCrmUnitActivity: async (unitId, type, data) => {
    return await fetchJson(`/crm-hierarchy/units/${encodeURIComponent(unitId)}/activities/${encodeURIComponent(type)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 📡 Realtime Live SSE Stream Subscription (Instant Live Push)
  subscribeToRealtime: (callback) => {
    try {
      if (typeof window === 'undefined' || !window.EventSource) return () => {};
      const es = new EventSource('/api/realtime/stream');
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (callback) callback(data);
        } catch (e) {}
      };
      es.onerror = () => {
        // Silently close if backend doesn't support SSE stream
        try { es.close(); } catch (_) {}
      };
      return () => {
        try { es.close(); } catch (_) {}
      };
    } catch (err) {
      return () => {};
    }
  }
};

export default apiClient;
