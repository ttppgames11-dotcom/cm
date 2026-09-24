import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

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
  const { name, owner, cat, city, district, phone, whatsapp, website, services, offers, gstNumber, udyamNo } = req.body;

  if (!name || !phone) {
    return sendError(res, 'कृपया व्यवसायाचे नाव व फोन नंबर प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const newBusiness = {
    id: `BIZ-${Date.now().toString().slice(-5)}`,
    name,
    owner: owner || req.user.name,
    ownerId: req.user.id,
    cat: cat || 'उद्योग / व्यापार',
    city: city || req.user.district || 'पुणे',
    district: district || req.user.district || 'पुणे',
    phone,
    whatsapp: whatsapp || phone,
    website: website || '',
    services: Array.isArray(services) ? services : (services ? [services] : []),
    offers: offers || '',
    gstNumber: gstNumber || '',
    udyamNo: udyamNo || '',
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

  const updated = db.update('businesses', req.params.id, req.body);
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

  const { rating, text, member_name } = req.body;
  const numRating = Number(rating) || 5;

  const newReview = {
    id: `REV-${Date.now().toString().slice(-4)}`,
    businessId: req.params.id,
    reviewerId: req.user.id,
    memberName: member_name || req.user.name,
    rating: numRating,
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
