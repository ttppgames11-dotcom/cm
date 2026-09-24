import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateBusiness, validateBusinessReview, sanitize, isValidPhone, cleanPhone } from '../utils/validator.js';

const router = Router();

// GET /api/businesses
// Search businesses by category, district, keywords, ratings
router.get('/', (req, res) => {
  const { cat, district, search, rating } = req.query;
  let list = db.getCollection('businesses');

  if (cat && cat !== 'all') {
    list = list.filter(b => (b.cat || b.category || '').toLowerCase().includes(cat.toLowerCase()));
  }

  if (district && district !== 'सर्व') {
    list = list.filter(b => (b.district || '').toLowerCase() === district.toLowerCase());
  }

  if (rating) {
    list = list.filter(b => Number(b.rating || 0) >= Number(rating));
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(b => 
      (b.name || '').toLowerCase().includes(q) ||
      (b.owner || '').toLowerCase().includes(q) ||
      (b.city || '').toLowerCase().includes(q) ||
      (b.district || '').toLowerCase().includes(q) ||
      (b.offers || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'व्यवसाय सूची प्राप्त झाली', {
    businesses: list,
    count: list.length
  });
});

// POST /api/businesses
// Register new business entity, GST/Udyam details, catalog
router.post('/', authenticateToken, (req, res) => {
  const { isValid, errors, sanitized } = validateBusiness(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'अवैध व्यवसाय माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
  }

  const { name, phone } = sanitized;
  const { owner, cat, city, district, whatsapp, website, services, offers, gstNumber, udyamNo } = req.body;

  const newBusiness = {
    id: `BIZ-${Date.now().toString().slice(-5)}`,
    name,
    owner: sanitize(owner) || req.user.name,
    ownerId: req.user.id,
    cat: sanitize(cat) || 'उद्योग / व्यापार',
    city: sanitize(city) || req.user.district || 'पुणे',
    district: sanitize(district) || req.user.district || 'पुणे',
    phone,
    whatsapp: whatsapp ? cleanPhone(whatsapp) : phone,
    website: sanitize(website) || '',
    services: Array.isArray(services) ? services.map(s => sanitize(s)) : (services ? [sanitize(services)] : []),
    offers: sanitize(offers) || '',
    gstNumber: sanitize(gstNumber) || '',
    udyamNo: sanitize(udyamNo) || '',
    rating: 5.0,
    reviewCount: 0,
    photo: '🏢',
    verified: true,
    createdAt: new Date().toISOString()
  };

  db.insert('businesses', newBusiness);
  db.addAuditLog('REGISTER_BUSINESS', req.user.id, { businessId: newBusiness.id, name });

  return sendSuccess(res, 'व्यवसाय यशस्वीरीत्या जोडला गेला!', { business: newBusiness }, 201);
});

// GET /api/businesses/:id
// Get single business portfolio, gallery, reviews, contact
router.get('/:id', (req, res) => {
  const business = db.findById('businesses', req.params.id);
  if (!business) {
    return sendError(res, 'व्यवसाय सापडला नाही.', 'BUSINESS_NOT_FOUND', 404);
  }

  const allReviews = db.getCollection('businessReviews');
  const reviews = allReviews.filter(r => r.businessId === req.params.id);

  return sendSuccess(res, 'व्यवसाय तपशील प्राप्त झाला', {
    business,
    reviews
  });
});

// PUT /api/businesses/:id
// Update business info, operating hours, offerings
router.put('/:id', authenticateToken, (req, res) => {
  const business = db.findById('businesses', req.params.id);
  if (!business) {
    return sendError(res, 'व्यवसाय सापडला नाही.', 'BUSINESS_NOT_FOUND', 404);
  }

  if (business.ownerId && business.ownerId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'ceo') {
    return sendError(res, 'आपणास हा व्यवसाय अपडेट करण्याची परवानगी नाही.', 'FORBIDDEN', 403);
  }

  const updates = {};
  if (req.body.phone !== undefined) {
    const cleaned = cleanPhone(req.body.phone);
    if (!isValidPhone(cleaned)) {
      return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
    }
    updates.phone = cleaned;
  }

  const allowed = ['name', 'cat', 'city', 'district', 'whatsapp', 'website', 'services', 'offers', 'gstNumber', 'udyamNo'];
  for (const k of allowed) {
    if (req.body[k] !== undefined) {
      updates[k] = typeof req.body[k] === 'string' ? sanitize(req.body[k]) : req.body[k];
    }
  }

  const updated = db.update('businesses', req.params.id, updates);
  db.addAuditLog('UPDATE_BUSINESS', req.user.id, { businessId: req.params.id });

  return sendSuccess(res, 'व्यवसाय माहिती यशस्वीरीत्या अद्यतनित झाली!', { business: updated });
});

// POST /api/businesses/:id/reviews
// Submit verified customer review & star rating
router.post('/:id/reviews', authenticateToken, (req, res) => {
  const business = db.findById('businesses', req.params.id);
  if (!business) {
    return sendError(res, 'व्यवसाय सापडला नाही.', 'BUSINESS_NOT_FOUND', 404);
  }

  const { isValid, errors, sanitized } = validateBusinessReview(req.body);
  if (!isValid) {
    return sendError(res, errors[0]?.error || 'अवैध रिव्ह्यू माहिती.', 'VALIDATION_ERROR', 400, { validationErrors: errors });
  }

  const { rating, text } = sanitized;
  const memberName = sanitize(req.body.member_name) || req.user.name;

  const newReview = {
    id: `REV-${Date.now().toString().slice(-4)}`,
    businessId: req.params.id,
    reviewerId: req.user.id,
    memberName,
    rating,
    text: text || 'उत्कृष्ट सेवा!',
    createdAt: new Date().toISOString()
  };

  db.insert('businessReviews', newReview);

  // Recalculate average rating
  const reviews = db.getCollection('businessReviews').filter(r => r.businessId === req.params.id);
  const avg = reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviews.length;

  db.update('businesses', req.params.id, {
    rating: parseFloat(avg.toFixed(1)),
    reviewCount: reviews.length
  });

  return sendSuccess(res, 'पुनरावलोकन (Review) यशस्वीरीत्या जोडले गेले!', {
    review: newReview,
    newRating: parseFloat(avg.toFixed(1))
  }, 201);
});

export default router;
