// Connect Maratha Frontend API Service Client
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
  // Auth
  auth: {
    login: async (identifier, password) => {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });
      if (res.token) {
        localStorage.setItem('cm_jwt_token', res.token);
      }
      return res;
    },
    register: async (formData) => {
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.token) {
        localStorage.setItem('cm_jwt_token', res.token);
      }
      return res;
    },
    getMe: () => request('/auth/me'),
    logout: () => {
      localStorage.removeItem('cm_jwt_token');
    }
  },

  // Members
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
    getStats: () => request('/members/stats/summary')
  },

  // Businesses
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
    addReview: (id, review) => request(`/businesses/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review)
    })
  },

  // Business Sangam & Referrals
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

  // Community & Social
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
    getGroups: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/community/groups${qs ? '?' + qs : ''}`);
    },
    joinGroup: (id) => request(`/community/groups/${id}/join`, { method: 'POST' })
  },

  // Events & Gatherings
  events: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/events${qs ? '?' + qs : ''}`);
    },
    getById: (id) => request(`/events/${id}`),
    rsvp: (id, data) => request(`/events/${id}/rsvp`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    create: (data) => request('/events', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Donations & Campaigns
  donations: {
    getCampaigns: () => request('/donations/campaigns'),
    getCampaignById: (id) => request(`/donations/campaigns/${id}`),
    donate: (data) => request('/donations/donate', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getRecent: () => request('/donations/recent')
  },

  // Jobs & Employment
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
    })
  },

  // Admin & Analytics
  admin: {
    getMetrics: () => request('/admin/metrics'),
    getAuditLogs: () => request('/admin/audit-logs'),
    verifyMember: (id, status) => request(`/admin/verify-member/${id}`, {
      method: 'POST',
      body: JSON.stringify({ status })
    })
  }
};

export default api;
