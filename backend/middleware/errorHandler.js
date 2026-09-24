import crypto from 'crypto';

export function notFound(req, res) {
  res.status(404).json({ success: false, code: 'NOT_FOUND', error: 'विनंती केलेला मार्ग सापडला नाही.' });
}

/**
 * Central error handler. Never returns stack traces or internal error text
 * for server errors; the full error is logged server-side with a reference ID
 * that the user can quote to support.
 */
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Malformed JSON body / payload too large -> client errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, code: 'INVALID_JSON', error: 'अवैध विनंती (malformed JSON).' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, code: 'PAYLOAD_TOO_LARGE', error: 'विनंती खूप मोठी आहे.' });
  }

  const ref = crypto.randomBytes(4).toString('hex');
  console.error(`[${ref}] ${req.method} ${req.originalUrl.split('?')[0]} ->`, err.message);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  res.status(500).json({
    success: false,
    code: 'SERVER_ERROR',
    error: 'सर्व्हर त्रुटी. कृपया पुन्हा प्रयत्न करा.',
    reference: ref
  });
}

export default errorHandler;
