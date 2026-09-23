// Central API Client connecting React Frontend to Express Backend Server (Port 5000)

const BASE_URL = '/api';

async function fetchJson(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API Error [${endpoint}], using fallback:`, err.message);
    throw err;
  }
}

export const apiClient = {
  // Doctors API
  getDoctors: () => fetchJson('/doctors'),
  addDoctor: (doctor) => fetchJson('/doctors', { method: 'POST', body: JSON.stringify(doctor) }),

  // Blood API
  getBloodRequests: () => fetchJson('/blood/requests'),
  addBloodRequest: (req) => fetchJson('/blood/requests', { method: 'POST', body: JSON.stringify(req) }),
  getDonors: () => fetchJson('/blood/donors'),
  addDonor: (donor) => fetchJson('/blood/donors', { method: 'POST', body: JSON.stringify(donor) }),

  // Matrimony API
  getMatrimonyProfiles: () => fetchJson('/matrimony'),
  addMatrimonyProfile: (profile) => fetchJson('/matrimony', { method: 'POST', body: JSON.stringify(profile) }),

  // Political Grievances API
  getGrievances: () => fetchJson('/political/grievances'),
  addGrievance: (data) => fetchJson('/political/grievances', { method: 'POST', body: JSON.stringify(data) }),

  // Social Volunteers API
  getVolunteers: () => fetchJson('/social/volunteers'),
  addVolunteer: (data) => fetchJson('/social/volunteers', { method: 'POST', body: JSON.stringify(data) }),

  // Women Help API
  getWomenHelpRequests: () => fetchJson('/women/help'),
  addWomenHelpRequest: (data) => fetchJson('/women/help', { method: 'POST', body: JSON.stringify(data) }),

  // Builders API
  addBuilderInquiry: (data) => fetchJson('/builders', { method: 'POST', body: JSON.stringify(data) }),

  // Bank Loans API
  addLoanApplication: (data) => fetchJson('/bank/loans', { method: 'POST', body: JSON.stringify(data) })
};

export default apiClient;
