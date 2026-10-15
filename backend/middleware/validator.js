/**
 * Connect Maratha - Strict Input Validation Middleware
 * 
 * Strict Schema Validation Engine:
 * - Validates input types, lengths, formats (regex/patterns), and allowed values.
 * - Rejects non-conforming inputs with HTTP 400 Bad Request.
 * - Enforces strict property whitelisting (rejects unexpected/unknown fields).
 * - Never blindly sanitizes or coerces bad types — rejects immediately.
 */

// Common Regex Patterns for strict format validation
export const FORMATS = {
  // Strict RFC 5322 email regex (no leading/trailing dot, no consecutive dots)
  email: /^[a-zA-Z0-9_!#$%&'*+/=?^`{|}~-]+(?:\.[a-zA-Z0-9_!#$%&'*+/=?^`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
  
  // 10-digit Indian phone (starts with 6-9, optional +91/0 prefix), or international E.164 (must start with +)
  phone: /^(?:(?:\+?91|0)?[6-9]\d{9}|\+[1-9]\d{9,14})$/,
  
  // 6-digit numeric OTP
  otp: /^\d{6}$/,
  
  // Standard JWT token structure (3 base64url segments separated by dots)
  jwt: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/,
  
  // Connect Maratha Member ID: e.g. M1001, M5578
  memberId: /^M\d{3,8}$/i,
  
  // Connect Maratha Reference ID: e.g. REF-96K-5578
  referenceId: /^REF-[A-Z0-9]{2,5}-\d{3,8}$/i,
  
  // Safe alphanumeric string with basic punctuation (letters, digits, space, hyphen, underscore, Marathi/Devanagari Unicode)
  safeText: /^[\p{L}\p{N}\s.,_@#()'"\/-]*$/u,
  
  // Alphanumeric code without spaces
  code: /^[A-Za-z0-9_-]+$/,
  
  // HTTP/HTTPS URL
  url: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/
};

/**
 * Validate a single value against a field rule definition.
 * Returns null if valid, or an error string if invalid.
 */
function validateField(field, value, rule) {
  // 1. Check undefined / null
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    if (rule.required) {
      return `${field} आवश्यक आहे (${field} is required)`;
    }
    return null; // Optional and omitted
  }

  // 2. Type validation
  const actualType = Array.isArray(value) ? 'array' : typeof value;
  const expectedType = rule.type || 'string';

  if (actualType !== expectedType) {
    return `${field} चे स्वरूप अयोग्य आहे: ${expectedType} अपेक्षित, ${actualType} मिळाले (${field} must be of type ${expectedType})`;
  }

  // 3. String validation
  if (expectedType === 'string') {
    const str = value.trim();

    if (rule.minLength !== undefined && str.length < rule.minLength) {
      return `${field} ची लांबी किमान ${rule.minLength} अक्षरे असावी (${field} must be at least ${rule.minLength} characters)`;
    }

    if (rule.maxLength !== undefined && str.length > rule.maxLength) {
      return `${field} ची लांबी कमाल ${rule.maxLength} अक्षरे असावी (${field} must not exceed ${rule.maxLength} characters)`;
    }

    // Format check (pre-defined)
    if (rule.format && FORMATS[rule.format]) {
      if (!FORMATS[rule.format].test(str)) {
        return `${field} चे फॉरमॅट अवैध आहे (${field} has an invalid ${rule.format} format)`;
      }
    }

    // Custom Regex Pattern
    if (rule.pattern instanceof RegExp) {
      if (!rule.pattern.test(str)) {
        return rule.patternMessage || `${field} चे स्वरूप अवैध आहे (${field} format is invalid)`;
      }
    }

    // Enum values check
    if (Array.isArray(rule.enum)) {
      if (!rule.enum.includes(str)) {
        return `${field} चे मूल्य अनुमत पर्यायांपैकी असावे (${field} must be one of: ${rule.enum.join(', ')})`;
      }
    }
  }

  // 4. Number validation
  if (expectedType === 'number') {
    if (isNaN(value) || !Number.isFinite(value)) {
      return `${field} वैध संख्या असावी (${field} must be a valid number)`;
    }

    if (rule.integer && !Number.isInteger(value)) {
      return `${field} पूर्णांक संख्या असावी (${field} must be an integer)`;
    }

    if (rule.min !== undefined && value < rule.min) {
      return `${field} चे किमान मूल्य ${rule.min} असावे (${field} must be at least ${rule.min})`;
    }

    if (rule.max !== undefined && value > rule.max) {
      return `${field} चे कमाल मूल्य ${rule.max} असावे (${field} must not exceed ${rule.max})`;
    }

    if (Array.isArray(rule.enum)) {
      if (!rule.enum.includes(value)) {
        return `${field} चे मूल्य अनुमत पर्यायांपैकी असावे (${field} must be one of: ${rule.enum.join(', ')})`;
      }
    }
  }

  // 5. Array validation
  if (expectedType === 'array') {
    if (rule.minItems !== undefined && value.length < rule.minItems) {
      return `${field} मध्ये किमान ${rule.minItems} आयटम असावेत (${field} must contain at least ${rule.minItems} items)`;
    }

    if (rule.maxItems !== undefined && value.length > rule.maxItems) {
      return `${field} मध्ये कमाल ${rule.maxItems} आयटम असावेत (${field} must contain at most ${rule.maxItems} items)`;
    }

    // Validate each element if itemRule is provided
    if (rule.itemRule) {
      for (let i = 0; i < value.length; i++) {
        const itemErr = validateField(`${field}[${i}]`, value[i], rule.itemRule);
        if (itemErr) return itemErr;
      }
    }
  }

  // 6. Boolean validation
  if (expectedType === 'boolean') {
    if (typeof value !== 'boolean') {
      return `${field} बुलियन (true/false) असावे (${field} must be boolean)`;
    }
  }

  return null;
}

/**
 * Validates a data object against a schema definition.
 * 
 * @param {Object} data - The data to validate (e.g., req.body)
 * @param {Object} schema - Field definitions
 * @param {Object} [options] - Options (allowUnknown: boolean, atLeastOneOf: string[])
 * @returns {Array<string>} List of validation error messages, or empty array if valid
 */
export function validate(data, schema, options = {}) {
  const errors = [];
  const input = data || {};
  const allowUnknown = options.allowUnknown === true; // Strict by default!

  // 1. Check for unknown properties (strict rejection of unauthorized fields)
  if (!allowUnknown) {
    const allowedKeys = new Set(Object.keys(schema));
    for (const key of Object.keys(input)) {
      if (!allowedKeys.has(key)) {
        errors.push(`अनाधिकृत किंवा अज्ञात फील्ड: '${key}' (Unrecognized field '${key}' is not allowed)`);
      }
    }
  }

  // 2. Validate all schema fields
  for (const [field, rule] of Object.entries(schema)) {
    const val = input[field];
    const err = validateField(field, val, rule);
    if (err) {
      errors.push(err);
    }
  }

  // 3. Check cross-field requirements (e.g. at least one of email or phone)
  if (Array.isArray(options.atLeastOneOf)) {
    const hasAny = options.atLeastOneOf.some(field => {
      const v = input[field];
      return v !== undefined && v !== null && (typeof v === 'string' ? v.trim() !== '' : true);
    });

    if (!hasAny) {
      errors.push(
        `किमान एक पर्याय आवश्यक आहे: [${options.atLeastOneOf.join(', ')}] (At least one of [${options.atLeastOneOf.join(', ')}] is required)`
      );
    }
  }

  return errors;
}

/**
 * Express Middleware factory to validate req.body against a strict schema.
 */
export function validateBody(schema, options = {}) {
  return (req, res, next) => {
    // Ensure request body exists
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        error: 'विनंती डेटा (body) JSON स्वरूपात आवश्यक आहे. (Request body is required and must be JSON)',
        errors: ['Request body missing or not an object']
      });
    }

    const errors = validate(req.body, schema, options);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        error: errors[0], // First primary error message
        errors           // Complete list of validation issues
      });
    }

    next();
  };
}

/**
 * Express Middleware factory to validate req.query against a strict schema.
 */
export function validateQuery(schema, options = {}) {
  return (req, res, next) => {
    const errors = validate(req.query || {}, schema, { ...options, allowUnknown: options.allowUnknown ?? true });
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        error: errors[0],
        errors
      });
    }
    next();
  };
}

/**
 * Express Middleware factory to validate req.params against a strict schema.
 */
export function validateParams(schema, options = {}) {
  return (req, res, next) => {
    const errors = validate(req.params || {}, schema, options);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        error: errors[0],
        errors
      });
    }
    next();
  };
}

export default {
  FORMATS,
  validate,
  validateBody,
  validateQuery,
  validateParams
};
