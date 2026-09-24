// Comprehensive Validation & Sanitization Engine for Connect Maratha System
import { sendError } from './response.js';

// 1. Sanitization & Stripping
export function sanitize(val) {
  if (val === null || val === undefined) return '';
  if (typeof val !== 'string') return val;
  return val
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/<[^>]+>/g, ''); // Strip HTML tags
}

export function sanitizeObject(obj, allowedKeys = null) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  const result = {};
  const keys = allowedKeys || Object.keys(obj);
  for (const k of keys) {
    if (obj[k] !== undefined) {
      if (typeof obj[k] === 'string') {
        result[k] = sanitize(obj[k]);
      } else {
        result[k] = obj[k];
      }
    }
  }
  return result;
}

// 2. Format Validators
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Cleans spaces, dashes, dots, parentheses
  const cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');
  // Matches 10 digits starting with 6-9, or prefixed with +91 or 91 or 0
  const re = /^(?:\+?91|0)?[6-9]\d{9}$/;
  return re.test(cleaned);
}

export function cleanPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+91')) return cleaned;
  if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
  if (cleaned.startsWith('0') && cleaned.length === 11) return `+91${cleaned.slice(1)}`;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return cleaned;
}

export function isValidPAN(pan) {
  if (!pan || typeof pan !== 'string') return false;
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(pan.trim().toUpperCase());
}

export function isValidBloodGroup(bg) {
  if (!bg || typeof bg !== 'string') return false;
  const normalized = bg.trim().toUpperCase().replace(/\s*\(.*\)/, '').replace(/\s*(POSITIVE|NEGATIVE)/i, '');
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validGroups.some(g => normalized.startsWith(g));
}

export function parseAmount(val) {
  if (val === null || val === undefined || val === '') return NaN;
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return NaN;
  
  // Convert Marathi / Devanagari numerals to English numerals
  const devanagariDigits = ['०','१','२','३','४','५','६','७','८','९'];
  let cleaned = val;
  devanagariDigits.forEach((d, idx) => {
    cleaned = cleaned.replaceAll(d, String(idx));
  });

  // Remove currency symbols, commas, spaces
  cleaned = cleaned.replace(/[^0-9.]/g, '');
  const num = Number(cleaned);
  return isNaN(num) ? NaN : num;
}

export function isPositiveNumber(val) {
  const num = parseAmount(val);
  return !isNaN(num) && isFinite(num) && num > 0;
}

export function isNonNegativeNumber(val) {
  const num = parseAmount(val);
  return !isNaN(num) && isFinite(num) && num >= 0;
}

export function isValidRating(rating) {
  const num = parseAmount(rating);
  return !isNaN(num) && num >= 1 && num <= 5;
}

export function isValidAge(age) {
  const num = parseAmount(age);
  return !isNaN(num) && Number.isInteger(num) && num >= 18 && num <= 100;
}

export function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

// 3. Domain Specific Payload Validators

export function validateRegister(body) {
  const errors = [];
  const name = sanitize(body.name);
  const email = body.email ? sanitize(body.email).toLowerCase() : '';
  const phone = body.phone ? cleanPhone(body.phone) : '';
  const password = body.password;

  if (!name || name.length < 2) {
    errors.push({ field: 'name', error: 'कृपया संपूर्ण नाव प्रविष्ट करा (किमान २ अक्षरे).' });
  }

  if (!phone && !email) {
    errors.push({ field: 'phone', error: 'मोबाईल नंबर किंवा ईमेल यापैकी किमान एक आवश्यक आहे.' });
  }

  if (phone && !isValidPhone(phone)) {
    errors.push({ field: 'phone', error: 'कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.' });
  }

  if (email && !isValidEmail(email)) {
    errors.push({ field: 'email', error: 'कृपया वैध ईमेल पत्ता प्रविष्ट करा (उदा. name@example.com).' });
  }

  if (password && !isValidPassword(password)) {
    errors.push({ field: 'password', error: 'पासवर्ड किमान ६ वर्णांचा असावा.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, name, email, phone } };
}

export function validateLogin(body) {
  const errors = [];
  const identifier = sanitize(body.identifier);
  const password = body.password;

  if (!identifier) {
    errors.push({ field: 'identifier', error: 'कृपया सदस्य आयडी, ईमेल किंवा मोबाईल नंबर प्रविष्ट करा.' });
  }

  if (!password) {
    errors.push({ field: 'password', error: 'कृपया पासवर्ड प्रविष्ट करा.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, identifier } };
}

export function validateForgotPassword(body) {
  const errors = [];
  const identifier = sanitize(body.identifier);

  if (!identifier) {
    errors.push({ field: 'identifier', error: 'कृपया आपला फोन, ईमेल किंवा सदस्य आयडी प्रविष्ट करा.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, identifier } };
}

export function validateVerifyOtp(body) {
  const errors = [];
  const identifier = sanitize(body.identifier);
  const otp = sanitize(String(body.otp || ''));

  if (!identifier) {
    errors.push({ field: 'identifier', error: 'कृपया ओळख (फोन किंवा ईमेल) प्रविष्ट करा.' });
  }

  if (!otp || otp.length < 4 || otp.length > 8) {
    errors.push({ field: 'otp', error: 'कृपया वैध OTP प्रविष्ट करा.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, identifier, otp } };
}

export function validateResetPassword(body) {
  const errors = [];
  const identifier = sanitize(body.identifier);
  const newPassword = body.newPassword;

  if (!identifier) {
    errors.push({ field: 'identifier', error: 'कृपया ओळख प्रविष्ट करा.' });
  }

  if (!newPassword || !isValidPassword(newPassword)) {
    errors.push({ field: 'newPassword', error: 'नवीन पासवर्ड किमान ६ वर्णांचा असावा.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, identifier } };
}

export function validateBusiness(body) {
  const errors = [];
  const name = sanitize(body.name);
  const phone = cleanPhone(body.phone);

  if (!name || name.length < 2) {
    errors.push({ field: 'name', error: 'व्यवसायाचे नाव किमान २ अक्षरांचे असावे.' });
  }
  if (!phone || !isValidPhone(phone)) {
    errors.push({ field: 'phone', error: 'कृपया व्यवसायाचा वैध १० अंकी संपर्क नंबर प्रविष्ट करा.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, name, phone } };
}

export function validateBusinessReview(body) {
  const errors = [];
  const text = sanitize(body.text);
  const rating = Number(body.rating);

  if (body.rating !== undefined && !isValidRating(rating)) {
    errors.push({ field: 'rating', error: 'रेटिंग १ ते ५ दरम्यान असावे.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, text, rating: rating || 5 } };
}

export function validateReferral(body) {
  const errors = [];
  const title = sanitize(body.title);
  const clientName = sanitize(body.clientName);
  const clientPhone = cleanPhone(body.clientPhone);

  if (!title) errors.push({ field: 'title', error: 'संदर्भ विषय / शीर्षक आवश्यक आहे.' });
  if (!clientName) errors.push({ field: 'clientName', error: 'क्लायंटचे नाव आवश्यक आहे.' });
  if (!clientPhone || !isValidPhone(clientPhone)) {
    errors.push({ field: 'clientPhone', error: 'क्लायंटचा वैध १० अंकी फोन नंबर आवश्यक आहे.' });
  }
  if (body.value !== undefined && !isNonNegativeNumber(body.value)) {
    errors.push({ field: 'value', error: 'रेफरल मूल्य अयोग्य आहे.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, title, clientName, clientPhone } };
}

export function validateBloodRequest(body) {
  const errors = [];
  const patient = sanitize(body.patient);
  const hospital = sanitize(body.hospital);
  const bloodGroup = sanitize(body.bloodGroup);
  const contact = cleanPhone(body.contact || body.phone);
  const units = Number(body.units || 1);

  if (!patient) errors.push({ field: 'patient', error: 'रुग्णाचे नाव आवश्यक आहे.' });
  if (!hospital) errors.push({ field: 'hospital', error: 'रुग्णालयाचे नाव व पत्ता आवश्यक आहे.' });
  if (!bloodGroup || !isValidBloodGroup(bloodGroup)) {
    errors.push({ field: 'bloodGroup', error: 'कृपया वैध रक्तगट निवडा (उदा. A+, B+, O+, AB+).' });
  }
  if (!contact || !isValidPhone(contact)) {
    errors.push({ field: 'contact', error: 'आणीबाणी संपर्क नंबर वैध १० अंकी असावा.' });
  }
  if (units < 1) {
    errors.push({ field: 'units', error: 'रक्त पिशव्यांची संख्या किमान १ असावी.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, patient, hospital, bloodGroup, contact, units } };
}

export function validateBloodDonor(body) {
  const errors = [];
  const name = sanitize(body.name);
  const bloodGroup = sanitize(body.bloodGroup || body.group);
  const phone = cleanPhone(body.phone);

  if (!name) errors.push({ field: 'name', error: 'रक्तदात्याचे नाव आवश्यक आहे.' });
  if (!bloodGroup || !isValidBloodGroup(bloodGroup)) {
    errors.push({ field: 'bloodGroup', error: 'कृपया वैध रक्तगट निवडा (A+, A-, B+, B-, O+, O-, AB+, AB-).' });
  }
  if (!phone || !isValidPhone(phone)) {
    errors.push({ field: 'phone', error: 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, name, bloodGroup, phone } };
}

export function validateMatrimony(body) {
  const errors = [];
  const name = sanitize(body.name);
  const age = Number(body.age);

  if (!name) errors.push({ field: 'name', error: 'उमेदवाराचे नाव आवश्यक आहे.' });
  if (!body.gender) errors.push({ field: 'gender', error: 'कृपया वर किंवा वधू निवडा.' });
  if (!age || !isValidAge(age)) {
    errors.push({ field: 'age', error: 'कृपया वैध वय प्रविष्ट करा (१८ ते १०० वर्षे).' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, name, age } };
}

export function validateDonation(body) {
  const errors = [];
  const amount = parseAmount(body.amount);
  const pan = body.pan ? sanitize(body.pan).toUpperCase() : '';
  const email = body.email ? sanitize(body.email) : '';

  if (!body.amount || !isPositiveNumber(body.amount)) {
    errors.push({ field: 'amount', error: 'कृपया योग्य देणगी रक्कम प्रविष्ट करा (किमान ₹१).' });
  }
  if (pan && !isValidPAN(pan)) {
    errors.push({ field: 'pan', error: '८०-जी सवलतीसाठी पॅन कार्ड क्रमांक वैध असावा (उदा. ABCDE1234F).' });
  }
  if (email && !isValidEmail(email)) {
    errors.push({ field: 'email', error: 'कृपया देणगी पावतीसाठी वैध ईमेल पत्ता प्रविष्ट करा.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, amount, pan, email } };
}

export function validateJob(body) {
  const errors = [];
  const title = sanitize(body.title);
  const company = sanitize(body.company);
  const location = sanitize(body.location);
  const contactEmail = body.contactEmail ? sanitize(body.contactEmail) : '';

  if (!title) errors.push({ field: 'title', error: 'नोकरीचे पद / शीर्षक आवश्यक आहे.' });
  if (!company) errors.push({ field: 'company', error: 'कंपनी / आस्थापनेचे नाव आवश्यक आहे.' });
  if (!location) errors.push({ field: 'location', error: 'नोकरीचे ठिकाण आवश्यक आहे.' });
  if (contactEmail && !isValidEmail(contactEmail)) {
    errors.push({ field: 'contactEmail', error: 'संपर्क ईमेल अयोग्य आहे.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, title, company, location, contactEmail } };
}

export function validateEvent(body) {
  const errors = [];
  const title = sanitize(body.title);
  const date = sanitize(body.date);
  const location = sanitize(body.location);

  if (!title) errors.push({ field: 'title', error: 'कार्यक्रमाचे नाव आवश्यक आहे.' });
  if (!date) errors.push({ field: 'date', error: 'कार्यक्रमाची तारीख आवश्यक आहे.' });
  if (!location) errors.push({ field: 'location', error: 'कार्यक्रमाचे ठिकाण आवश्यक आहे.' });
  if (body.capacity !== undefined && !isPositiveNumber(body.capacity)) {
    errors.push({ field: 'capacity', error: 'उपस्थिती क्षमता योग्य संख्या असावी.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, title, date, location } };
}

export function validateLoan(body) {
  const errors = [];
  const purpose = sanitize(body.purpose);

  if (!body.loanAmount || !isPositiveNumber(body.loanAmount)) {
    errors.push({ field: 'loanAmount', error: 'कृपया कर्जाची वैध रक्कम प्रविष्ट करा.' });
  }
  if (!purpose) {
    errors.push({ field: 'purpose', error: 'कर्जाचा उद्देश आवश्यक आहे.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, loanAmount: body.loanAmount, purpose } };
}

export function validateSpeakerBooking(body) {
  const errors = [];
  const speakerName = sanitize(body.speakerName);
  const eventDate = sanitize(body.eventDate);
  const organizerPhone = cleanPhone(body.organizerPhone);

  if (!speakerName) errors.push({ field: 'speakerName', error: 'वक्त्याचे नाव आवश्यक आहे.' });
  if (!eventDate) errors.push({ field: 'eventDate', error: 'कार्यक्रमाची तारीख आवश्यक आहे.' });
  if (!organizerPhone || !isValidPhone(organizerPhone)) {
    errors.push({ field: 'organizerPhone', error: 'आयोजकाचा वैध १० अंकी संपर्क नंबर आवश्यक आहे.' });
  }

  return { isValid: errors.length === 0, errors, sanitized: { ...body, speakerName, eventDate, organizerPhone } };
}

// Express Middleware Creator for automatic request validation
export function validateRequest(validatorFn) {
  return (req, res, next) => {
    const { isValid, errors, sanitized } = validatorFn(req.body);
    if (!isValid) {
      return sendError(res, errors[0]?.error || 'अवैध माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
    }
    req.body = { ...req.body, ...sanitized };
    next();
  };
}

export default {
  sanitize,
  sanitizeObject,
  isValidEmail,
  isValidPhone,
  cleanPhone,
  isValidPAN,
  isValidBloodGroup,
  isPositiveNumber,
  isNonNegativeNumber,
  isValidRating,
  isValidAge,
  isValidPassword,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateVerifyOtp,
  validateResetPassword,
  validateBusiness,
  validateBusinessReview,
  validateReferral,
  validateBloodRequest,
  validateBloodDonor,
  validateMatrimony,
  validateDonation,
  validateJob,
  validateEvent,
  validateLoan,
  validateSpeakerBooking,
  validateRequest
};
