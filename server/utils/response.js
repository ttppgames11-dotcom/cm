// Standard Response Envelope Helper for Connect Maratha API
// Envelope format:
// Success: { success: true, message: string, data: any, ...dataProperties }
// Error: { success: false, error: string, code: string }

export function sendSuccess(res, message = 'यशस्वीरीत्या पूर्ण झाले!', data = {}, statusCode = 200) {
  const payload = {
    success: true,
    message,
    data
  };

  // If data is a plain non-null object (and not an array), also surface top-level keys
  // for backwards-compatibility with existing frontend callers expecting res.token or res.members
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const key of Object.keys(data)) {
      if (payload[key] === undefined) {
        payload[key] = data[key];
      }
    }
  }

  return res.status(statusCode).json(payload);
}

export function sendError(res, error = 'अनधिकृत प्रवेश किंवा अयोग्य माहिती!', code = 'ERROR', statusCode = 400, extra = {}) {
  return res.status(statusCode).json({
    success: false,
    error,
    code,
    ...extra
  });
}

export default { sendSuccess, sendError };
