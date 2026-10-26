// Connect Maratha Frontend Unified Realtime API Service Client
export const API_SERVER_ORIGIN = (typeof window !== 'undefined' && window.__CM_API_ORIGIN) || 
  (import.meta.env?.VITE_API_ORIGIN) || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '3000' || window.location.port === '5173') ? 'http://localhost:5000' : 'https://api.connectmaratha.com');

function getApiBase() {
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

async function request(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const candidates = [
    `${getApiBase()}${cleanEndpoint}`,
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

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errorMsg = data.error || data.message || `HTTP Error ${res.status}`;
        throw new Error(errorMsg);
      }
      return data;
    } catch (err) {
      lastError = err;
    }
  }

  console.warn(`[API Error] ${cleanEndpoint}:`, lastError?.message);
  throw lastError;
}

export const api = {
  // 1. Authentication & Member Identity
  auth: {
    login: async (identifier, password) => {
      const cleanId = String(identifier || '').trim();
      const digitsOnly = cleanId.replace(/\D/g, '');
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: cleanId,
          phone: digitsOnly.length >= 10 ? digitsOnly : cleanId,
          mobile: digitsOnly.length >= 10 ? digitsOnly : cleanId,
          email: cleanId,
          password
        })
      });
      const token = res.data?.token || res.token;
      if (token) {
        localStorage.setItem('cm_jwt_token', token);
      }
      return res;
    },
    register: async (formData) => {
      const cleanPhone = String(formData.phone || formData.mobile || '').trim();
      const digitsOnly = cleanPhone.replace(/\D/g, '');
      const res = await request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          phone: digitsOnly.length >= 10 ? digitsOnly : cleanPhone,
          mobile: digitsOnly.length >= 10 ? digitsOnly : cleanPhone
        })
      });
      const token = res.data?.token || res.token;
      if (token) {
        localStorage.setItem('cm_jwt_token', token);
      }
      return res;
    },
    getMe: () => request('/auth/me'),
    logout: () => {
      localStorage.removeItem('cm_jwt_token');
    },
    forgotPassword: (email) => request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier: email, email })
    }),
    verifyOtp: (email, otp) => request('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ identifier: email, email, otp })
    }),
    resetPassword: (email, resetToken, newPassword) => request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier: email, email, resetToken, newPassword })
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
    getMyReferrals: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/members/referrals/my${qs ? '?' + qs : ''}`);
    },
    verifyReferralCode: (code) => request(`/members/referrals/verify/${encodeURIComponent(code)}`),
    requestReferralPayout: (upi_id, amount) => request('/members/referrals/payout', {
      method: 'POST',
      body: JSON.stringify({ upi_id, amount })
    }),
    getMessages: () => request('/messages/conversations'),
    sendMessage: (recipientId, text) => request(`/messages/${encodeURIComponent(recipientId)}`, {
      method: 'POST',
      body: JSON.stringify({ recipientId, text })
    })
  },

  // Messages & Direct Interconnection
  messages: {
    getConversations: () => request('/messages/conversations'),
    getThread: (partnerId) => request(`/messages/${encodeURIComponent(partnerId)}`),
    sendMessage: (partnerId, text) => request(`/messages/${encodeURIComponent(partnerId)}`, {
      method: 'POST',
      body: JSON.stringify({ recipientId: partnerId, text })
    }),
    searchMembers: (q) => request(`/messages/search/members${q ? '?q=' + encodeURIComponent(q) : ''}`),
    editMessage: (id, text) => request(`/messages/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ text })
    }),
    deleteMessage: (id) => request(`/messages/${id}`, {
      method: 'DELETE'
    })
  },

  // 3. Businesses & Commercial Verticals
  businesses: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/businesses${qs ? '?' + qs : ''}`);
    },
    getById: (id) => request(`/businesses/${id}`),
    getMyBusinesses: () => request('/businesses/my'),
    getPendingBusinesses: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/businesses/admin/pending${qs ? '?' + qs : ''}`);
    },
    create: (data) => request('/businesses', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    moderateBusiness: (id, data) => request(`/businesses/${id}/moderation`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    getEnquiries: (id) => request(`/businesses/${id}/enquiries`),
    sendEnquiry: (id, data) => request(`/businesses/${id}/enquiry`, {
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
    getMetrics: () => request('/sangam/metrics'),
    getLeads: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/sangam/leads${qs ? '?' + qs : ''}`);
    },
    createLead: (data) => request('/sangam/leads', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 4b. B2B Leads & Customer Enquiries
  enquiries: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/sangam/enquiries${qs ? '?' + qs : ''}`);
    },
    getMy: () => request('/sangam/enquiries/my'),
    create: (data) => request('/sangam/enquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    submitQuote: (id, quoteData) => request(`/sangam/enquiries/${id}/quote`, {
      method: 'POST',
      body: JSON.stringify(quoteData)
    })
  },

  // 5. Directories (Hotels, Doctors, Artists, Officers, Speakers, Orgs, Builders, Manufacturers, Dairy, Bank)
  directories: {
    // Hotels & Tourism
    getHotels: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/hotels${qs ? '?' + qs : ''}`);
    },
    getHotelById: (id) => request(`/hotels/${id}`),
    getMyHotels: () => request('/hotels/my'),
    getPendingHotels: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/hotels/admin/pending${qs ? '?' + qs : ''}`);
    },
    addHotel: (data) => request('/hotels', { method: 'POST', body: JSON.stringify(data) }),
    moderateHotel: (id, data) => request(`/hotels/${id}/moderation`, { method: 'PATCH', body: JSON.stringify(data) }),
    bookHotel: (id, data) => request(`/hotels/${id}/booking`, { method: 'POST', body: JSON.stringify(data) }),
    getHotelBookings: (id) => request(`/hotels/${id}/bookings`),

    // Doctors & Clinics
    getDoctors: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/doctors${qs ? '?' + qs : ''}`);
    },
    getDoctorById: (id) => request(`/doctors/${id}`),
    getMyDoctors: () => request('/doctors/my'),
    getPendingDoctors: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/doctors/admin/pending${qs ? '?' + qs : ''}`);
    },
    addDoctor: (data) => request('/doctors', { method: 'POST', body: JSON.stringify(data) }),
    moderateDoctor: (id, data) => request(`/doctors/${id}/moderation`, { method: 'PATCH', body: JSON.stringify(data) }),
    bookAppointment: (id, data) => request(`/doctors/${id}/appointment`, { method: 'POST', body: JSON.stringify(data) }),
    getDoctorAppointments: (id) => request(`/doctors/${id}/appointments`),

    // Builders & Real Estate
    getBuilders: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/builders${qs ? '?' + qs : ''}`);
    },
    getBuilderById: (id) => request(`/builders/${id}`),
    getMyBuilders: () => request('/builders/my'),
    getPendingBuilders: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/builders/admin/pending${qs ? '?' + qs : ''}`);
    },
    addBuilder: (data) => request('/builders', { method: 'POST', body: JSON.stringify(data) }),
    moderateBuilder: (id, data) => request(`/builders/${id}/moderation`, { method: 'PATCH', body: JSON.stringify(data) }),
    sendBuilderInquiry: (id, data) => request(`/builders/${id}/inquiry`, { method: 'POST', body: JSON.stringify(data) }),
    getBuilderInquiries: (id) => request(`/builders/${id}/inquiries`),

    // Manufacturers & Industrial Units
    getManufacturers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/manufacturers${qs ? '?' + qs : ''}`);
    },
    getManufacturerById: (id) => request(`/manufacturers/${id}`),
    getMyManufacturers: () => request('/manufacturers/my'),
    getPendingManufacturers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/manufacturers/admin/pending${qs ? '?' + qs : ''}`);
    },
    addManufacturer: (data) => request('/manufacturers', { method: 'POST', body: JSON.stringify(data) }),
    moderateManufacturer: (id, data) => request(`/manufacturers/${id}/moderation`, { method: 'PATCH', body: JSON.stringify(data) }),
    sendManufacturerInquiry: (id, data) => request(`/manufacturers/${id}/inquiry`, { method: 'POST', body: JSON.stringify(data) }),
    getManufacturerInquiries: (id) => request(`/manufacturers/${id}/inquiries`),

    // Artists, Officers, Speakers, Dairy, Bank
    getArtists: () => request('/artists'),
    addArtist: (data) => request('/artists', { method: 'POST', body: JSON.stringify(data) }),
    getOfficers: () => request('/officers'),
    addOfficer: (data) => request('/officers', { method: 'POST', body: JSON.stringify(data) }),
    getSpeakers: () => request('/speakers'),
    bookSpeaker: (data) => request('/speakers/book', { method: 'POST', body: JSON.stringify(data) }),
    getOrganizations: () => request('/organizations'),
    addOrganization: (data) => request('/organizations', { method: 'POST', body: JSON.stringify(data) }),
    getDairy: () => request('/dairy'),
    getBankLoans: () => request('/bank/loans'),
    applyBankLoan: (data) => request('/bank/loans', { method: 'POST', body: JSON.stringify(data) }),
    reviewBankLoanStatus: (id, data) => request(`/bank/loans/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
    applyBankAccount: (data) => request('/bank/accounts/apply', { method: 'POST', body: JSON.stringify(data) }),
    enrollInstituteCourse: (data) => request('/bank/institute/enroll', { method: 'POST', body: JSON.stringify(data) }),
    getBooks: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/books${qs ? '?' + qs : ''}`);
    },
    addBook: (data) => request('/books', { method: 'POST', body: JSON.stringify(data) }),
    getMovies: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/movies${qs ? '?' + qs : ''}`);
    },
    addMovie: (data) => request('/movies', { method: 'POST', body: JSON.stringify(data) }),
    getSocialWorkers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/social-workers${qs ? '?' + qs : ''}`);
    },
    getScholarships: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/scholarships${qs ? '?' + qs : ''}`);
    },
    getColleges: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/colleges${qs ? '?' + qs : ''}`);
    }
  },

  // 6. Emergency & Community Care (including Matrimony)
  emergency: {
    getBloodRequests: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/blood/requests${qs ? '?' + qs : ''}`);
    },
    getMyBloodRequests: () => request('/blood/requests/my'),
    getPendingBloodRequests: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/blood/requests/admin/pending${qs ? '?' + qs : ''}`);
    },
    getBloodRequestById: (id) => request(`/blood/requests/${id}`),
    postBloodSOS: (data) => request('/blood/requests', { method: 'POST', body: JSON.stringify(data) }),
    verifyBloodRequest: (id, data = {}) => request(`/blood/requests/${id}/verify`, { method: 'PATCH', body: JSON.stringify(data) }),
    fulfillBloodRequest: (id, data = {}) => request(`/blood/requests/${id}/fulfill`, { method: 'PATCH', body: JSON.stringify(data) }),
    respondToBloodRequest: (id, data) => request(`/blood/requests/${id}/respond`, { method: 'POST', body: JSON.stringify(data) }),
    getBloodRequestResponses: (id) => request(`/blood/requests/${id}/responses`),

    getBloodDonors: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/blood/donors${qs ? '?' + qs : ''}`);
    },
    getMyDonorProfile: () => request('/blood/donors/my'),
    registerBloodDonor: (data) => request('/blood/donors', { method: 'POST', body: JSON.stringify(data) }),
    updateDonorAvailability: (id, data) => request(`/blood/donors/${id}/availability`, { method: 'PATCH', body: JSON.stringify(data) }),
    
    // Matrimony Directory
    getMatrimonyProfiles: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/matrimony${qs ? '?' + qs : ''}`);
    },
    getMatrimonyProfileById: (id) => request(`/matrimony/${id}`),
    getMyMatrimonyProfile: () => request('/matrimony/my'),
    getPendingMatrimonyProfiles: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/matrimony/admin/pending${qs ? '?' + qs : ''}`);
    },
    registerMatrimony: (data) => request('/matrimony', { method: 'POST', body: JSON.stringify(data) }),
    moderateMatrimonyProfile: (id, data) => request(`/matrimony/${id}/moderation`, { method: 'PATCH', body: JSON.stringify(data) }),
    sendMatrimonyInterest: (id, data) => request(`/matrimony/${id}/connect`, { method: 'POST', body: JSON.stringify(data) }),
    getMatrimonyInterests: (id) => request(`/matrimony/${id}/interests`),

    getWomenHelp: () => request('/women/help'),
    requestWomenHelp: (data) => request('/women/help', { method: 'POST', body: JSON.stringify(data) }),
    getVolunteers: () => request('/social/volunteers'),
    registerVolunteer: (data) => request('/social/volunteers', { method: 'POST', body: JSON.stringify(data) }),
    getGrievances: () => request('/political/grievances'),
    submitGrievance: (data) => request('/political/grievances', { method: 'POST', body: JSON.stringify(data) }),

    // Emergency Alert Network Module
    getEmergencies: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/v1/emergencies${qs ? '?' + qs : ''}`);
    },
    getEmergencyById: (id) => request(`/v1/emergencies/${id}`),
    reportEmergency: (data) => request('/v1/emergencies', { method: 'POST', body: JSON.stringify(data) }),
    respondToEmergency: (id, data) => request(`/v1/emergencies/${id}/respond`, { method: 'POST', body: JSON.stringify(data) }),
    addEmergencyUpdate: (id, data) => request(`/v1/emergencies/${id}/updates`, { method: 'POST', body: JSON.stringify(data) }),
    updateEmergencyStatus: (id, data) => request(`/v1/emergencies/${id}/status`, { method: 'POST', body: JSON.stringify(data) }),

    // Community Help Requests Module
    getHelpRequests: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/v1/help-requests${qs ? '?' + qs : ''}`);
    },
    getHelpRequestById: (id) => request(`/v1/help-requests/${id}`),
    createHelpRequest: (data) => request('/v1/help-requests', { method: 'POST', body: JSON.stringify(data) }),
    offerHelp: (id, data) => request(`/v1/help-requests/${id}/offers`, { method: 'POST', body: JSON.stringify(data) }),

    // Community Services Exchange Module
    getServicesExchange: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/v1/services${qs ? '?' + qs : ''}`);
    },
    postServiceListing: (data) => request('/v1/services', { method: 'POST', body: JSON.stringify(data) }),
    sendServiceInquiry: (id, data) => request(`/v1/services/${id}/inquiries`, { method: 'POST', body: JSON.stringify(data) }),

    // Seva Command Center CRM & Content Moderation
    getSevaStats: () => request('/v1/crm/seva/stats'),
    reportContent: (id, data) => request(`/v1/content/${id}/report`, { method: 'POST', body: JSON.stringify(data) })
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
    getMyJobs: () => request('/jobs/my'),
    getPendingJobs: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/jobs/admin/pending${qs ? '?' + qs : ''}`);
    },
    create: (data) => request('/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    moderateJob: (id, data) => request(`/jobs/${id}/moderation`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    closeJob: (id) => request(`/jobs/${id}/close`, {
      method: 'PATCH'
    }),
    getApplications: (id) => request(`/jobs/${id}/applications`),
    apply: (id, data) => request(`/jobs/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getServices: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/services${qs ? '?' + qs : ''}`);
    },
    bookService: (data) => request('/services/booking', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 10a. Local Professional Services
  services: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/services${qs ? '?' + qs : ''}`);
    },
    getById: (id) => request(`/services/${id}`),
    getMyServices: () => request('/services/my'),
    getPendingServices: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/services/admin/pending${qs ? '?' + qs : ''}`);
    },
    create: (data) => request('/services', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    moderateService: (id, data) => request(`/services/${id}/moderation`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    bookService: (id, data) => request(`/services/${id}/booking`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getBookings: (id) => request(`/services/${id}/bookings`),
    getCategories: () => request('/services/categories'),
    getReviews: (id) => request(`/services/${id}/reviews`),
    addReview: (id, data) => request(`/services/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    submitEnquiry: (data) => request('/services/enquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getEnquiries: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/services/enquiries${qs ? '?' + qs : ''}`);
    },
    submitQuote: (data) => request('/services/quotes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getQuotes: (enquiryId) => request(`/services/quotes/${enquiryId}`)
  },


  // 10b. Business Enquiries & Leads
  enquiries: {
    getAll: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/enquiries${qs ? '?' + qs : ''}`);
    },
    getMy: () => request('/enquiries/my'),
    getById: (id) => request(`/enquiries/${id}`),
    create: (data) => request('/enquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    verify: (id, data = {}) => request(`/enquiries/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),
    submitQuote: (id, quoteData) => request(`/enquiries/${id}/quote`, {
      method: 'POST',
      body: JSON.stringify(quoteData)
    }),
    getQuotes: (id) => request(`/enquiries/${id}/quotes`),
    acceptQuote: (id, quoteId) => request(`/enquiries/${id}/quotes/${quoteId}/accept`, {
      method: 'PATCH'
    }),
    updateStatus: (id, data = {}) => request(`/enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  },

  // 11. Sangam B2B Referrals, 1-on-1 Meetings & Chapter Metrics
  sangam: {
    getReferrals: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/sangam/referrals${qs ? '?' + qs : ''}`);
    },
    getReferral: (id) => request(`/sangam/referrals/${id}`),
    createReferral: (data) => request('/sangam/referrals', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    updateReferralStatus: (id, status, value, notes) => request(`/sangam/referrals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, actualValue: value, value, notes })
    }),
    submitTyfcb: (id, data) => request(`/sangam/referrals/${id}/tyfcb`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getMeetings: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/sangam/meetings${qs ? '?' + qs : ''}`);
    },
    createMeeting: (data) => request('/sangam/meetings', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    updateMeetingStatus: (id, status, notes, minutes) => request(`/sangam/meetings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes, minutes })
    }),
    rsvpChapterMeeting: (chapterId, chapterName) => request('/sangam/meetings/rsvp-chapter', {
      method: 'POST',
      body: JSON.stringify({ chapterId, chapterName })
    }),
    getMetrics: () => request('/sangam/metrics')
  },

  // 12. Maratha Bank & Finance
  bank: {
    getLoans: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/bank/loans${qs ? '?' + qs : ''}`);
    },
    applyLoan: (data) => request('/bank/loans', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    updateLoanStatus: (id, status, remarks, sanctionedAmount) => request(`/bank/loans/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks, sanctionedAmount })
    }),
    applyAccount: (data) => request('/bank/accounts/apply', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    enrollCourse: (data) => request('/bank/institute/enroll', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 13. Maratha Dairy & Agro Collection
  dairy: {
    getCenters: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/dairy${qs ? '?' + qs : ''}`);
    },
    addCenter: (data) => request('/dairy', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    registerFarmer: (data) => request('/dairy/farmers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    createOrder: (data) => request('/dairy/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    applyPartner: (data) => request('/dairy/partner', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // 14. Digital Community & Groups (/api/community)
  community: {
    getPosts: async (groupId, tag) => {
      const params = {};
      if (groupId) params.groupId = groupId;
      if (tag) params.tag = tag;
      const qs = new URLSearchParams(params).toString();
      const res = await request(`/community/posts${qs ? '?' + qs : ''}`);
      return res.data || res;
    },
    createPost: async (postData) => {
      const res = await request('/community/posts', {
        method: 'POST',
        body: JSON.stringify(postData)
      });
      return res.data || res;
    },
    likePost: async (postId) => {
      const res = await request(`/community/posts/${postId}/like`, {
        method: 'POST'
      });
      return res.data || res;
    },
    addComment: async (postId, commentData) => {
      const res = await request(`/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData)
      });
      return res.data || res;
    },
    deletePost: async (postId) => {
      const res = await request(`/community/posts/${postId}`, {
        method: 'DELETE'
      });
      return res.data || res;
    },
    sharePost: async (postId, platform = 'internal') => {
      const res = await request(`/community/posts/${postId}/share`, {
        method: 'POST',
        body: JSON.stringify({ platform })
      });
      return res.data || res;
    },
    connectMember: async (memberId) => {
      const res = await request(`/community/members/${memberId}/connect`, {
        method: 'POST'
      });
      return res.data || res;
    },
    getConnectedMembers: async () => {
      const res = await request('/community/members/connected');
      return res.data || res;
    },
    getConnectedDirectory: async () => {
      const res = await request('/community/connected-directory');
      return res.data || res;
    },
    reportPost: async (postId, reason) => {
      const res = await request(`/community/posts/${postId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      return res.data || res;
    },
    getGroups: async () => {
      const res = await request('/community/groups');
      return res.data || res;
    },
    joinGroup: async (groupId) => {
      const res = await request(`/community/groups/${groupId}/join`, {
        method: 'POST'
      });
      return res.data || res;
    },
    getNews: async () => {
      const res = await request('/community/news');
      return res.data || res;
    },
    createNews: async (newsData) => {
      const res = await request('/community/news', {
        method: 'POST',
        body: JSON.stringify(newsData)
      });
      return res.data || res;
    }
  },

  // 15. Culture, History & Quiz
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

  // 16. Unified CRM Operations & 12 Golden Rules (/api/crm)
  crm: {
    getDashboard: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/crm/unified-dashboard${qs ? '?' + qs : ''}`);
    },
    getTickets: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/crm/tickets${qs ? '?' + qs : ''}`);
    },
    createTicket: (data) => request('/crm/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    escalateTicket: (id, reason) => request(`/crm/tickets/${id}/escalate`, {
      method: 'PATCH',
      body: JSON.stringify({ reason })
    }),
    updateTicketStatus: (id, status, note) => request(`/crm/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note })
    }),
    getCommunityCenters: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/crm/community-centers${qs ? '?' + qs : ''}`);
    },
    checkinVisitor: (centerId, data) => request(`/crm/community-centers/${centerId}/checkin`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    recordTransaction: (centerId, data) => request(`/crm/community-centers/${centerId}/transaction`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getStaff: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/crm/staff${qs ? '?' + qs : ''}`);
    },
    addStaff: (data) => request('/crm/staff', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getBranches: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/crm/branches${qs ? '?' + qs : ''}`);
    },
    addBranch: (data) => request('/crm/branches', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getBranchActivities: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/crm/branch-activities${qs ? '?' + qs : ''}`);
    },
    addBranchActivity: (data) => request('/crm/branch-activities', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getTerritoryOfficers: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/crm/territory-officers${qs ? '?' + qs : ''}`);
    },
    addTerritoryOfficer: (data) => request('/crm/territory-officers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getOrganizationUnits: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/crm/organization-units${qs ? '?' + qs : ''}`);
    }
  },

  // 17. Admin ERP & CRM Suite
  admin: {
    getMetrics: () => request('/admin/metrics'),
    getAuditLogs: () => request('/admin/audit-logs'),
    getRolesMatrix: () => request('/admin/roles-matrix'),
    getJobApplications: () => request('/admin/job-applications'),
    getEnquiriesSummary: () => request('/admin/enquiries-summary'),
    verifyMember: (id, status, remarks) => request(`/admin/verify-member/${id}`, {
      method: 'POST',
      body: JSON.stringify({ status, remarks })
    }),
    assignRole: (memberId, newRole, assignedScope, remarks) => request('/admin/assign-role', {
      method: 'PUT',
      body: JSON.stringify({ memberId, newRole, assignedScope, remarks })
    }),
    exportReports: (type = 'members') => request(`/admin/reports/export?type=${type}`),
    getUnifiedApprovals: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/admin/unified-approvals${qs ? '?' + qs : ''}`);
    },
    actionUnifiedApproval: (data) => request('/admin/unified-approvals/action', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
    deleteMember: (id) => request(`/admin/members/${id}`, { method: 'DELETE' })
  },

  // 18. Google Play Child Safety Standards & Legal Compliance
  legal: {
    submitChildSafetyReport: (data) => request('/legal/child-safety-report', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getChildSafetyStatus: () => request('/legal/child-safety-status'),
    getReports: () => request('/legal/reports')
  },

  // 19. Seven Portals Ecosystem (Education, Colleges, Scholarships, Quiz, Dnyankosh, Granthalaya, Time Machine)
  portals: {
    getStats: () => request('/portals/unified-stats'),
    getColleges: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/portals/colleges${qs ? '?' + qs : ''}`);
    },
    getCollege: (id) => request(`/portals/colleges/${id}`),
    bookCareerGuidance: (data) => request('/portals/career-guidance/book', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getScholarships: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/portals/scholarships${qs ? '?' + qs : ''}`);
    },
    checkScholarshipEligibility: (data) => request('/portals/scholarships/check-eligibility', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    applyScholarship: (data) => request('/portals/scholarships/apply', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getMyApplications: () => request('/portals/scholarships/my-applications'),
    getDnyankosh: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/portals/dnyankosh${qs ? '?' + qs : ''}`);
    },
    getDnyankoshArticle: (slug) => request(`/portals/dnyankosh/${slug}`),
    submitDnyankoshArticle: (data) => request('/portals/dnyankosh/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getLibraryCatalog: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/portals/library${qs ? '?' + qs : ''}`);
    },
    getLibraryBook: (id) => request(`/portals/library/${id}`),
    submitLibraryBook: (data) => request('/portals/library/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getTimeMachineEvents: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/portals/time-machine/events${qs ? '?' + qs : ''}`);
    },
    submitTimeMachineEvent: (data) => request('/portals/time-machine/events/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    // Admin CMS & Approvals
    getPendingApprovals: () => request('/portals/admin/pending-approvals'),
    actionArticle: (id, action) => request(`/portals/admin/articles/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action })
    }),
    actionScholarship: (id, status, notes = '') => request(`/portals/admin/scholarships/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ status, notes })
    }),
    // Admin Direct Creation & Management
    addCollege: (data) => request('/portals/admin/colleges', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    deleteCollege: (id) => request(`/portals/admin/colleges/${id}`, {
      method: 'DELETE'
    }),
    addScholarship: (data) => request('/portals/admin/scholarships', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    deleteScholarship: (id) => request(`/portals/admin/scholarships/${id}`, {
      method: 'DELETE'
    }),
    actionNewsArticle: (id, action) => request(`/maratha-news/${id}/action`, {
      method: 'PATCH',
      body: JSON.stringify({ action })
    }),
    submitNewsArticle: (data) => request('/maratha-news/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    getNewsArticles: (params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/maratha-news${qs ? '?' + qs : ''}`);
    }
  }
};

export default api;
