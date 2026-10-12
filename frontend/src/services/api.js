// Connect Maratha Frontend Unified Realtime API Service Client
const API_BASE = '/api';

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cm_jwt_token') : null;
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {})
      }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP Error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.warn(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // 1. Authentication & Member Identity
  auth: {
    login: async (identifier, password) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });
      const token = res.data?.token || res.token;
      if (token) {
        localStorage.setItem('cm_jwt_token', token);
      }
      return res;
    },
    register: async (formData) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      const token = res.data?.token || res.token;
      if (token) {
        localStorage.setItem('cm_jwt_token', token);
      }
      return res;
    },
    getMe: () => request('/auth/me'),
    logout: async () => {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        localStorage.removeItem('cm_jwt_token');
      }
    },
    forgotPassword: (identifier) => request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    }),
    verifyOtp: (identifier, otp) => request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier, otp })
    }),
    resetPassword: (identifier, newPassword, otp) => request('/auth/reset-password', {
      method: 'PUT',
      body: JSON.stringify({ identifier, newPassword, otp })
    })
  },

  // 2. Members & Profiles
  members: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/members${qs ? '?' + qs : ''}`);
    },
    getById: (id) => request(`/members/${id}`),
    update: (id, data) => request(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    getCard: (id) => request(`/members/${id}/card`),
    getStats: () => request('/members/stats/summary'),
    getNotifications: () => request('/members/notifications'),
    getMessages: () => request('/members/messages'),
    sendMessage: (recipientId, subject, message) => request('/members/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, subject, message })
    })
  },

  // 3. Businesses & Commercial Verticals
  businesses: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/businesses${qs ? '?' + qs : ''}`);
    },
    getById: (id) => request(`/businesses/${id}`),
    create: (data) => request('/businesses', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id, data) => request(`/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    addReview: (id, review) => request(`/businesses/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review)
    })
  },

  // 4. Business Sangam & Networking
  sangam: {
    getReferrals: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/sangam/referrals${qs ? '?' + qs : ''}`);
    },
    createReferral: (data) => request('/sangam/referrals', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    updateReferralStatus: (id, status, value) => request(`/sangam/referrals/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, value })
    }),
    getMeetings: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/sangam/meetings${qs ? '?' + qs : ''}`);
    },
    createMeeting: (data) => request('/sangam/meetings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getMetrics: () => request('/sangam/metrics')
  },

  // 5. Directories (Doctors, Artists, Officers, Speakers, Orgs, Builders, Manufacturers, Dairy, Bank)
  directories: {
    getDoctors: (params = {}) => request(`/doctors${new URLSearchParams(params).toString() ? '?' + new URLSearchParams(params) : ''}`),
    addDoctor: (data) => request('/doctors', { method: 'POST', body: JSON.stringify(data) }),
    getArtists: () => request('/artists'),
    addArtist: (data) => request('/artists', { method: 'POST', body: JSON.stringify(data) }),
    getOfficers: () => request('/officers'),
    addOfficer: (data) => request('/officers', { method: 'POST', body: JSON.stringify(data) }),
    getSpeakers: () => request('/speakers'),
    bookSpeaker: (data) => request('/speakers/book', { method: 'POST', body: JSON.stringify(data) }),
    getOrganizations: () => request('/organizations'),
    addOrganization: (data) => request('/organizations', { method: 'POST', body: JSON.stringify(data) }),
    getBuilders: () => request('/builders'),
    addBuilder: (data) => request('/builders', { method: 'POST', body: JSON.stringify(data) }),
    getManufacturers: () => request('/manufacturers'),
    addManufacturer: (data) => request('/manufacturers', { method: 'POST', body: JSON.stringify(data) }),
    getDairy: () => request('/dairy'),
    addDairy: (data) => request('/dairy', { method: 'POST', body: JSON.stringify(data) }),
    getBankLoans: () => request('/bank/loans'),
    applyBankLoan: (data) => request('/bank/loans', { method: 'POST', body: JSON.stringify(data) })
  },

  // 6. Emergency & Community Care
  emergency: {
    getBloodRequests: () => request('/blood/requests'),
    postBloodSOS: (data) => request('/blood/requests', { method: 'POST', body: JSON.stringify(data) }),
    getBloodDonors: (params = {}) => request(`/blood/donors${new URLSearchParams(params).toString() ? '?' + new URLSearchParams(params) : ''}`),
    registerBloodDonor: (data) => request('/blood/donors', { method: 'POST', body: JSON.stringify(data) }),
    getMatrimonyProfiles: (params = {}) => request(`/matrimony${new URLSearchParams(params).toString() ? '?' + new URLSearchParams(params) : ''}`),
    registerMatrimony: (data) => request('/matrimony', { method: 'POST', body: JSON.stringify(data) }),
    getWomenHelp: () => request('/women/help'),
    requestWomenHelp: (data) => request('/women/help', { method: 'POST', body: JSON.stringify(data) }),
    getVolunteers: () => request('/social/volunteers'),
    registerVolunteer: (data) => request('/social/volunteers', { method: 'POST', body: JSON.stringify(data) }),
    getGrievances: () => request('/political/grievances'),
    submitGrievance: (data) => request('/political/grievances', { method: 'POST', body: JSON.stringify(data) })
  },

  // 7. Community & Social
  community: {
    getPosts: (groupId) => request(`/community/posts${groupId ? '?groupId=' + groupId : ''}`),
    createPost: (data) => request('/community/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    likePost: (id) => request(`/community/posts/${id}/like`, { method: 'POST' }),
    addComment: (id, data) => request(`/community/posts/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getGroups: () => request('/community/groups'),
    joinGroup: (id) => request(`/community/groups/${id}/join`, { method: 'POST' }),
    getNews: () => request('/community/news'),
    publishNews: (data) => request('/community/news', { method: 'POST', body: JSON.stringify(data) })
  },

  // 8. Events
  events: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/events${qs ? '?' + qs : ''}`);
    },
    getById: (id) => request(`/events/${id}`),
    rsvp: (id) => request(`/events/${id}/rsvp`, { method: 'POST' }),
    create: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) })
  },

  // 9. Donations & Campaigns
  donations: {
    getCampaigns: () => request('/donations/campaigns'),
    getCampaignById: (id) => request(`/donations/campaigns/${id}`),
    donate: (data) => request('/donations/donate', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getRecent: () => request('/donations/recent')
  },

  // 10. Jobs & Services
  jobs: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/jobs${qs ? '?' + qs : ''}`);
    },
    getById: (id) => request(`/jobs/${id}`),
    create: (data) => request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    apply: (id, data) => request(`/jobs/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getServices: () => request('/services'),
    bookService: (data) => request('/services/booking', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 11. Culture, History & Quiz
  culture: {
    getOralHistory: () => request('/culture/oral-history'),
    submitOralHistory: (data) => request('/culture/oral-history', { method: 'POST', body: JSON.stringify(data) }),
    getDialects: () => request('/culture/dialects'),
    getFoodCulture: () => request('/culture/food'),
    getGramdevat: () => request('/culture/gramdevat'),
    getForts: () => request('/culture/forts'),
    getKnowledgeGraph: () => request('/culture/knowledge-graph')
  },
  quiz: {
    getStats: () => request('/quiz/stats'),
    getQuestions: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/quiz/questions${qs ? '?' + qs : ''}`);
    },
    submit: (data) => request('/quiz/submit', { method: 'POST', body: JSON.stringify(data) }),
    getLeaderboard: () => request('/quiz/leaderboard')
  },

  // 12. Admin ERP & CRM Suite
  admin: {
    getMetrics: () => request('/admin/metrics'),
    getAuditLogs: () => request('/admin/audit-logs'),
    getRolesMatrix: () => request('/admin/roles-matrix'),
    verifyMember: (id, status, remarks) => request(`/admin/verify-member/${id}`, {
      method: 'POST',
      body: JSON.stringify({ status, remarks })
    }),
    assignRole: (memberId, newRole, assignedScope, remarks) => request('/admin/assign-role', {
      method: 'PUT',
      body: JSON.stringify({ memberId, newRole, assignedScope, remarks })
    }),
    exportReports: (type = 'members') => request(`/admin/reports/export?type=${type}`)
  }
};

export default api;
