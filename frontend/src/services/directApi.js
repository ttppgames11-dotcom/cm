// On the live site, send "/api/..." requests straight to the API server instead of
// through Vercel's /api rewrite. Behind the rewrite every visitor reached the server
// from Vercel's address, so all visitors shared one rate limit (100 requests per
// 15 minutes): once it ran out, referral checks and admin data failed for everyone.
// Called directly, each visitor is counted separately. The API allows any origin (CORS).
// Local development keeps "/api" (Vite proxy).

const API_ORIGIN = 'https://api.connectmaratha.com';
const LIVE_HOSTS = ['www.connectmaratha.com', 'connectmaratha.com'];

// For connections that do not go through fetch(), such as EventSource (live updates):
// the API server's full address on the live site, the plain "/api/..." path elsewhere.
export function apiUrl(path) {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  return LIVE_HOSTS.includes(host) ? API_ORIGIN + path : path;
}

if (typeof window !== 'undefined' && LIVE_HOSTS.includes(window.location.hostname) && window.fetch) {
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      return originalFetch(API_ORIGIN + input, init);
    }
    return originalFetch(input, init);
  };
}
