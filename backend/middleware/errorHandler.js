import crypto from 'crypto';

/**
 * Checks if an error message contains internal system paths, database details,
 * or stack trace fragments that should never be shown to end users.
 */
function containsInternalDetails(message) {
  if (!message || typeof message !== 'string') return false;
  
  // Database signatures
  if (/sqlite|sql|syntax error|no such table|no such column|constraint failed|database disk|foreign key/i.test(message)) {
    return true;
  }

  // Filesystem and OS error codes
  if (/\b(ENOENT|EACCES|EPERM|ENOSPC|EISDIR|EEXIST|EMFILE)\b/.test(message)) {
    return true;
  }

  // Windows or Unix filesystem paths
  if (/[a-zA-Z]:[\\\/]|\/(?:Users|home|var|tmp|etc|usr|node_modules)[\\\/]/i.test(message)) {
    return true;
  }

  // Code line/column or stack trace fragments
  if (/\.(?:js|ts|mjs|cjs):\d+:\d+|\bat (?:Object|async|Function)\b/i.test(message)) {
    return true;
  }

  return false;
}

/**
 * Central Express Error Handler
 * 
 * Rules:
 * 1. Logs full error details (timestamp, route, method, user, IP, stack) server-side for debugging.
 * 2. Assigns a unique error tracking ID (e.g., ERR-XXXX-YYYY).
 * 3. NEVER sends stack traces, file paths, or raw database queries/errors to the client.
 * 4. Returns localized, generic, user-friendly messages for 5xx/unexpected errors.
 */
export function errorHandler(err, req, res, next) {
  // Generate unique error correlation ID
  const errorId = `ERR-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  // Log full error details server-side
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || 'unknown';
  const userId = req.user?.id ? `${req.user.id} (${req.user.name || 'User'})` : 'Unauthenticated';

  console.error(`\n🚨 [SERVER ERROR ${errorId}] -----------------------------`);
  console.error(`Timestamp : ${new Date().toISOString()}`);
  console.error(`Endpoint  : ${req.method} ${req.originalUrl || req.url}`);
  console.error(`Client IP : ${clientIp}`);
  console.error(`User      : ${userId}`);
  console.error(`Error Name: ${err?.name || 'Error'}`);
  console.error(`Message   : ${err?.message || 'No message provided'}`);
  if (err?.stack) {
    console.error(`Stack Trace:\n${err.stack}`);
  }
  console.error(`---------------------------------------------------------\n`);

  // 1. Handle JSON Body-Parser Syntax Errors
  if (err instanceof SyntaxError && (err.status === 400 || err.statusCode === 400) && 'body' in err) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_JSON_BODY',
      error: 'अवैध JSON डेटा स्वरूप (Invalid JSON payload format).'
    });
  }

  // 2. Handle Payload Too Large
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      success: false,
      code: 'PAYLOAD_TOO_LARGE',
      error: 'पाठवलेला डेटा खूप मोठा आहे (Payload exceeds size limit).'
    });
  }

  // 3. Determine HTTP Status Code
  let status = err.status || err.statusCode;
  if (!status || status < 400 || status > 599) {
    status = 500;
  }

  // 4. Sanitize user-facing message
  let userMessage = 'सर्व्हरवर तांत्रिक अडचण आली आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.';
  let errorCode = err.code || (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR');

  if (status < 500) {
    // Client-side errors (4xx): preserve message only if it is clean and does not leak internal details
    if (err.message && !containsInternalDetails(err.message)) {
      userMessage = err.message;
    } else {
      userMessage = 'अवैध विनंती. कृपया इनपुट तपासा (Invalid request input).';
    }
  } else {
    // 5xx Server errors: ALWAYS mask to generic message
    userMessage = 'सर्व्हरवर तांत्रिक अडचण आली आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा (Internal server error).';
  }

  // 5. Send sanitized response (NEVER include stack trace)
  const response = {
    success: false,
    code: errorCode,
    error: userMessage,
    errorId: status >= 500 ? errorId : undefined,
    ...(err.validationErrors ? { validationErrors: err.validationErrors } : {})
  };

  return res.status(status).json(response);
}

export default errorHandler;
