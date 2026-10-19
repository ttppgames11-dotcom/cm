// Standard response envelope used by the website's API client:
//   success: { success: true, message, data, ...data's keys at top level }
//   error:   { success: false, error, code }
// Data keys are also surfaced at the top level for callers that read
// res.tickets / res.services instead of res.data.tickets.

export function sendSuccess(res, message = 'यशस्वीरीत्या पूर्ण झाले!', data = {}, statusCode = 200) {
  const payload = { success: true, message, data };
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const key of Object.keys(data)) {
      if (payload[key] === undefined) payload[key] = data[key];
    }
  }
  return res.status(statusCode).json(payload);
}

export function sendError(res, error = 'अयोग्य माहिती.', code = 'ERROR', statusCode = 400, extra = {}) {
  return res.status(statusCode).json({ success: false, error, code, ...extra });
}

export default { sendSuccess, sendError };
