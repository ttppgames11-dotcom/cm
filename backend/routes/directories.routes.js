import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { runQuery } from '../../database/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '../db.json');

const router = Router();

function isDairyReq(req) {
  return req.baseUrl.includes('dairy') || req.path.startsWith('/dairy');
}

function isBuilderReq(req) {
  return req.baseUrl.includes('builders') || req.path.startsWith('/builders');
}

// In-memory rate limiter for enquiries (e.g., max 10 requests per 15 minutes per IP)
const enquiryRateLimitMap = new Map();
function enquiryRateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 10;

  const record = enquiryRateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }

  enquiryRateLimitMap.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      error: 'खूप जास्त चौकशी विनंत्या पाठवल्या आहेत. कृपया १५ मिनिटांनंतर पुन्हा प्रयत्न करा (Too many enquiry requests).'
    });
  }

  next();
}

// Helpers for reading/writing db.json
function readData() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return {};
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// Phone validator: Indian mobile (10 digits starting with 6-9)
function validateIndianMobile(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const digitsOnly = phone.replace(/\D/g, '');
  const match = digitsOnly.match(/^(?:91|0)?([6-9]\d{9})$/);
  return match ? match[1] : null;
}

// Standard envelope helpers
export function sendSuccess(res, data = {}, message = '', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    ...data
  });
}

export function sendError(res, error = 'Error', code = 'ERROR', statusCode = 400, validationErrors = null) {
  let displayError = typeof error === 'object' && error?.message ? error.message : String(error);

  // If 5xx or error contains internal details, log server-side and sanitize user-facing output
  if (statusCode >= 500 || /sqlite|syntax error|no such|stack|\.(?:js|ts):\d+|node_modules|[a-zA-Z]:[\\\/]/i.test(displayError)) {
    console.error(`🚨 [DIRECTORIES ERROR ${code}] Status ${statusCode}:`, error);
    displayError = 'सर्व्हरवर तांत्रिक अडचण आली आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा (Internal server error).';
    statusCode = statusCode >= 500 ? statusCode : 500;
  }

  return res.status(statusCode).json({
    success: false,
    error: displayError,
    code,
    ...(validationErrors ? { validationErrors } : {})
  });
}

// ==========================================
// 1. GET /api/builders & /builders
// ==========================================
router.get(['/', '/builders'], (req, res, next) => {
  if (isDairyReq(req)) return next();
  try {
    const db = readData();
    const builders = db.builders || [];
    return sendSuccess(res, { count: builders.length, builders, data: { builders } });
  } catch (err) {
    return sendError(res, err.message, 'INTERNAL_ERROR', 500);
  }
});

// ==========================================
// 2. POST /api/builders & /builders
// ==========================================
router.post(['/', '/builders'], optionalToken, (req, res, next) => {
  if (isDairyReq(req)) return next();
  try {
    const {
      developer,
      name,
      projectName,
      projects,
      location,
      city,
      configuration,
      category,
      specialty,
      phone,
      experience,
      icon,
      desc,
      description,
      ownerName,
      projectType,
      flatsDelivered,
      amenities,
      possessionDate,
      reraNumber,
      memberDiscountPercent
    } = req.body;

    // Validate phone
    const normalizedPhone = validateIndianMobile(phone);
    if (!normalizedPhone) {
      return sendError(
        res,
        'कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा (Valid 10-digit Indian phone required).',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate projectType if provided: "flats" | "villas" | "plots"
    if (projectType !== undefined && projectType !== null) {
      const allowedTypes = ['flats', 'villas', 'plots'];
      if (!allowedTypes.includes(String(projectType).toLowerCase())) {
        return sendError(
          res,
          'projectType must be one of "flats", "villas", "plots".',
          'VALIDATION_ERROR',
          400
        );
      }
    }

    // Validate flatsDelivered if provided (number >= 0)
    if (flatsDelivered !== undefined && flatsDelivered !== null && flatsDelivered !== '') {
      const numFlats = Number(flatsDelivered);
      if (isNaN(numFlats) || numFlats < 0) {
        return sendError(
          res,
          'flatsDelivered must be a number greater than or equal to 0.',
          'VALIDATION_ERROR',
          400
        );
      }
    }

    // Validate amenities if provided (array of up to 12 short strings)
    let sanitizedAmenities = [];
    if (amenities !== undefined && amenities !== null) {
      if (!Array.isArray(amenities)) {
        return sendError(res, 'amenities must be an array of strings.', 'VALIDATION_ERROR', 400);
      }
      if (amenities.length > 12) {
        return sendError(res, 'amenities can contain at most 12 items.', 'VALIDATION_ERROR', 400);
      }
      sanitizedAmenities = amenities
        .map(a => String(a || '').trim().slice(0, 100))
        .filter(a => a.length > 0);
    }

    // Validate memberDiscountPercent if provided (number 0 to 10)
    let discountPercent = null;
    if (memberDiscountPercent !== undefined && memberDiscountPercent !== null && memberDiscountPercent !== '') {
      const pct = Number(memberDiscountPercent);
      if (isNaN(pct) || pct < 0 || pct > 10) {
        return sendError(
          res,
          'memberDiscountPercent must be a number between 0 and 10.',
          'VALIDATION_ERROR',
          400
        );
      }
      discountPercent = pct;
    }

    // Behavior rule: reraApproved is false unless reraNumber is provided
    const cleanReraNumber = (reraNumber || '').toString().trim();
    const reraApproved = cleanReraNumber.length > 0;

    // Behavior rule: only set discountForMembers when memberDiscountPercent > 0
    let discountForMembers = null;
    if (discountPercent !== null && discountPercent > 0) {
      discountForMembers = `मराठा महासंघ सदस्यांसाठी विशेष ${discountPercent}% सवलत`;
    }

    // OwnerId from authenticated user if token present
    const ownerId = req.user?.id || req.body.ownerId || null;

    const devName = (developer || name || ownerName || 'मराठा बिल्डर्स').toString().trim();
    const projName = (projectName || projects || `${devName} हाइट्स`).toString().trim();
    const cleanCity = (city || location || 'महाराष्ट्र').toString().trim();
    const cleanConfig = (configuration || specialty || category || 'गृहनिर्माण').toString().trim();

    const db = readData();
    db.builders = db.builders || [];

    const item = {
      id: `BLD-${Date.now().toString().slice(-4)}`,
      developer: devName,
      name: devName,
      projectName: projName,
      projects: projName,
      location: cleanCity,
      city: cleanCity,
      configuration: cleanConfig,
      category: category ? String(category).trim() : cleanConfig,
      phone: normalizedPhone,
      ownerName: ownerName ? String(ownerName).trim() : devName,
      ownerId: ownerId,
      projectType: projectType ? String(projectType).toLowerCase() : 'flats',
      flatsDelivered: (flatsDelivered !== undefined && flatsDelivered !== null && flatsDelivered !== '')
        ? Number(flatsDelivered)
        : 0,
      amenities: sanitizedAmenities,
      possessionDate: possessionDate ? String(possessionDate).trim() : 'तयार (Ready)',
      reraNumber: cleanReraNumber,
      rera: cleanReraNumber || (reraApproved ? 'RERA मान्यताप्राप्त' : 'नोंदणीकृत'),
      reraApproved,
      memberDiscountPercent: discountPercent,
      discountForMembers: discountForMembers,
      experience: experience ? String(experience).trim() : '१०+ वर्षे',
      icon: icon ? String(icon).trim() : '🏢',
      desc: discountForMembers || desc || description || 'विश्वासार्ह व दर्जेदार गृहप्रकल्प उभारणीतील अग्रगण्य मराठा ब्रँड.',
      createdAt: new Date().toISOString()
    };

    db.builders.unshift(item);
    writeData(db);

    return res.status(201).json({
      success: true,
      message: '🏗️ बिल्डर प्रोजेक्ट चौकशी यशस्वीरीत्या नोंदवली गेली!',
      project: item,
      builder: item,
      data: { project: item, builder: item }
    });
  } catch (err) {
    return sendError(res, err.message, 'INTERNAL_ERROR', 500);
  }
});

// ==========================================
// 3. GET /api/builders/:id & /builders/:id
// ==========================================
router.get(['/:id', '/builders/:id'], (req, res, next) => {
  if (isDairyReq(req)) return next();
  try {
    const db = readData();
    const builders = db.builders || [];
    const targetId = req.params.id;

    const builder = builders.find(b => String(b.id) === String(targetId));

    if (!builder) {
      return res.status(404).json({
        success: false,
        code: 'BUILDER_NOT_FOUND',
        error: 'बिल्डर आढळला नाही (Builder not found).'
      });
    }

    return res.json({
      success: true,
      builder
    });
  } catch (err) {
    return sendError(res, err.message, 'INTERNAL_ERROR', 500);
  }
});

// ==========================================
// 4. POST /api/builders/:id/enquiries & /builders/:id/enquiries
// ==========================================
router.post(['/:id/enquiries', '/builders/:id/enquiries'], optionalToken, enquiryRateLimiter, async (req, res, next) => {
  if (isDairyReq(req)) return next();
  try {
    const db = readData();
    const builders = db.builders || [];
    const targetId = req.params.id;

    const builder = builders.find(b => String(b.id) === String(targetId));

    if (!builder) {
      return res.status(404).json({
        success: false,
        code: 'BUILDER_NOT_FOUND',
        error: 'बिल्डर आढळला नाही (Builder not found).'
      });
    }

    const { name, phone, budget, preferredCity, message } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return sendError(res, 'नाव आवश्यक आहे (Name is required).', 'VALIDATION_ERROR', 400);
    }

    const normalizedPhone = validateIndianMobile(phone);
    if (!normalizedPhone) {
      return sendError(
        res,
        'कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा (Valid 10-digit Indian phone required).',
        'VALIDATION_ERROR',
        400
      );
    }

    const enquiryId = 'ENQ-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900);
    const createdAt = new Date().toISOString();
    const memberId = req.user?.id || null;

    const enquiry = {
      id: enquiryId,
      builderId: builder.id,
      developer: builder.developer || builder.name || '',
      projectName: builder.projectName || builder.projects || '',
      name: name.trim(),
      phone: normalizedPhone,
      budget: budget !== undefined && budget !== null ? String(budget).trim() : '',
      preferredCity: preferredCity !== undefined && preferredCity !== null ? String(preferredCity).trim() : '',
      message: message !== undefined && message !== null ? String(message).trim() : '',
      memberId,
      createdAt
    };

    db.builderInquiries = db.builderInquiries || [];
    db.builderInquiries.unshift(enquiry);
    writeData(db);

    // If builder has an ownerId, insert notification in SQLite notifications table
    if (builder.ownerId) {
      try {
        const notifId = 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const notifTitle = 'नवीन प्रोजेक्ट चौकशी (New Project Enquiry)';
        const projName = builder.projectName || 'आपल्या प्रोजेक्ट';
        const notifMsg = `${name.trim()} यांनी ${projName}साठी चौकशी नोंदवली आहे (फोन: ${normalizedPhone}).`;
        await runQuery(`
          INSERT INTO notifications (id, member_id, title, message, type, is_read, created_at)
          VALUES (?, ?, ?, ?, 'enquiry', 0, datetime('now'))
        `, [notifId, builder.ownerId, notifTitle, notifMsg]);
      } catch (notifErr) {
        console.error('Error inserting builder enquiry notification:', notifErr);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'चौकशी यशस्वीरीत्या नोंदवली गेली!',
      enquiry
    });
  } catch (err) {
    return sendError(res, err.message, 'INTERNAL_ERROR', 500);
  }
});

// ==========================================
// DAIRY FEATURE (/api/dairy & /dairy)
// ==========================================

// 1. GET /api/dairy/products (Public) - Declared BEFORE /:id
router.get(['/products', '/dairy/products'], (req, res, next) => {
  if (isBuilderReq(req)) return next();
  try {
    const db = readData();
    let products = db.dairyProducts || [];
    const { category, sellerId, search } = req.query;

    if (category && category !== 'सर्व' && category !== 'all') {
      products = products.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
    }
    if (sellerId) {
      products = products.filter(p => String(p.sellerId) === String(sellerId));
    }
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      count: products.length,
      products,
      data: { products }
    });
  } catch (err) {
    return sendError(res, err.message, 'INTERNAL_ERROR', 500);
  }
});

// 2. POST /api/dairy/products (login required; only admin or owner of seller dairy record)
router.post(['/products', '/dairy/products'], authenticateToken, (req, res, next) => {
  if (isBuilderReq(req)) return next();
  try {
    const { name, category, packSize, price, description, sellerId, available } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return sendError(res, 'उत्पादनाचे नाव आवश्यक आहे (Product name is required).', 'VALIDATION_ERROR', 400);
    }

    if (price === undefined || price === null || price === '' || isNaN(Number(price)) || Number(price) < 0) {
      return sendError(res, 'कृपया वैध किंमत प्रविष्ट करा (Valid positive price is required).', 'VALIDATION_ERROR', 400);
    }

    const db = readData();
    db.dairy = db.dairy || [];
    db.dairyProducts = db.dairyProducts || [];

    const isAdmin = req.user?.role === 'admin';
    let targetSellerId = sellerId ? String(sellerId).trim() : null;

    if (targetSellerId) {
      const sellerDairy = db.dairy.find(d => String(d.id) === targetSellerId);
      if (!sellerDairy) {
        return res.status(404).json({
          success: false,
          code: 'DAIRY_NOT_FOUND',
          error: 'विक्रेता डेअरी सापडली नाही (Seller dairy not found).'
        });
      }
      if (!isAdmin && String(sellerDairy.ownerId) !== String(req.user?.id)) {
        return res.status(403).json({
          success: false,
          code: 'FORBIDDEN',
          error: 'केवळ डेअरी मालक किंवा प्रशासक उत्पादन जोडू शकतात (Only seller dairy owner or admin can add products).'
        });
      }
    } else {
      if (!isAdmin) {
        const ownedDairy = db.dairy.find(d => String(d.ownerId) === String(req.user?.id));
        if (!ownedDairy) {
          return res.status(403).json({
            success: false,
            code: 'FORBIDDEN',
            error: 'उत्पादन जोडण्यासाठी आपल्याकडे डेअरी केंद्र नोंदणी असणे आवश्यक आहे (Forbidden).'
          });
        }
        targetSellerId = ownedDairy.id;
      }
    }

    const validCategories = ['दूध', 'दही', 'पनीर', 'तूप', 'ताक', 'श्रीखंड', 'इतर'];
    const cleanCategory = validCategories.includes(String(category).trim())
      ? String(category).trim()
      : 'इतर';

    const product = {
      id: `PROD-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category: cleanCategory,
      packSize: packSize ? String(packSize).trim() : 'मानक पॅक',
      price: Number(price),
      description: description ? String(description).trim() : '',
      sellerId: targetSellerId,
      available: available !== undefined ? Boolean(available) : true,
      createdAt: new Date().toISOString()
    };

    db.dairyProducts.unshift(product);
    writeData(db);

    return res.status(201).json({
      success: true,
      message: 'उत्पादन यशस्वीरीत्या जोडले गेले!',
      product,
      data: { product }
    });
  } catch (err) {
    return sendError(res, err.message, 'INTERNAL_ERROR', 500);
  }
});

// 3. POST /api/dairy/products/:id/enquiries (optionalToken, rate-limited)
router.post(['/products/:id/enquiries', '/dairy/products/:id/enquiries'], optionalToken, enquiryRateLimiter, async (req, res, next) => {
  if (isBuilderReq(req)) return next();
  try {
    const db = readData();
    db.dairyProducts = db.dairyProducts || [];
    const targetId = req.params.id;

    const product = db.dairyProducts.find(p => String(p.id) === String(targetId));
    if (!product) {
      return res.status(404).json({
        success: false,
        code: 'PRODUCT_NOT_FOUND',
        error: 'उत्पादन सापडले नाही (Product not found).'
      });
    }

    const { name, phone, quantity, deliveryCity, message } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return sendError(res, 'नाव आवश्यक आहे (Name is required).', 'VALIDATION_ERROR', 400);
    }

    const normalizedPhone = validateIndianMobile(phone);
    if (!normalizedPhone) {
      return sendError(res, 'कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा (Valid 10-digit Indian mobile required).', 'VALIDATION_ERROR', 400);
    }

    const enquiry = {
      id: `DENQ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      productId: product.id,
      productName: product.name,
      sellerId: product.sellerId || null,
      memberId: req.user?.id || null,
      name: name.trim(),
      phone: normalizedPhone,
      quantity: quantity !== undefined && quantity !== null ? String(quantity).trim() : '',
      deliveryCity: deliveryCity !== undefined && deliveryCity !== null ? String(deliveryCity).trim() : '',
      message: message !== undefined && message !== null ? String(message).trim() : '',
      createdAt: new Date().toISOString()
    };

    db.dairyEnquiries = db.dairyEnquiries || [];
    db.dairyEnquiries.unshift(enquiry);
    writeData(db);

    // Notify seller's owner if known
    if (product.sellerId) {
      const sellerDairy = (db.dairy || []).find(d => String(d.id) === String(product.sellerId));
      if (sellerDairy && sellerDairy.ownerId) {
        try {
          const notifId = 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
          const notifTitle = 'नवीन उत्पादन चौकशी (Dairy Product Enquiry)';
          const notifMsg = `${name.trim()} यांनी "${product.name}" साठी चौकशी पाठवली आहे (फोन: ${normalizedPhone}).`;
          await runQuery(`
            INSERT INTO notifications (id, member_id, title, message, type, is_read, created_at)
            VALUES (?, ?, ?, ?, 'dairy_enquiry', 0, datetime('now'))
          `, [notifId, sellerDairy.ownerId, notifTitle, notifMsg]);
        } catch (notifErr) {
          console.error('Error inserting dairy product enquiry notification:', notifErr);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'उत्पादन चौकशी यशस्वीरीत्या नोंदवली गेली!',
      enquiry,
      data: { enquiry }
    });
  } catch (err) {
    return sendError(res, err.message, 'INTERNAL_ERROR', 500);
  }
});

// 4. POST /api/dairy/:id/registrations (login required, rate-limited)
router.post(['/:id/registrations', '/dairy/:id/registrations'], authenticateToken, enquiryRateLimiter, async (req, res, next) => {
  if (isBuilderReq(req)) return next();
  try {
    const db = readData();
    db.dairy = db.dairy || [];
    db.dairyRegistrations = db.dairyRegistrations || [];
    const targetId = req.params.id;

    const dairy = db.dairy.find(d => String(d.id) === String(targetId));
    if (!dairy) {
      return res.status(404).json({
        success: false,
        code: 'DAIRY_NOT_FOUND',
        error: 'डेअरी सापडली नाही (Dairy not found).'
      });
    }

    const { farmerName, phone, village, cattleCount, milkType, expectedDailyLitres } = req.body;

    if (!farmerName || typeof farmerName !== 'string' || !farmerName.trim()) {
      return sendError(res, 'शेतकऱ्याचे नाव आवश्यक आहे (Farmer name is required).', 'VALIDATION_ERROR', 400);
    }

    const normalizedPhone = validateIndianMobile(phone);
    if (!normalizedPhone) {
      return sendError(res, 'कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा (Valid 10-digit Indian phone required).', 'VALIDATION_ERROR', 400);
    }

    // Reject a second registration by the same member for the same centre
    const alreadyRegistered = db.dairyRegistrations.find(r =>
      String(r.dairyId) === String(dairy.id) && String(r.memberId) === String(req.user.id)
    );
    if (alreadyRegistered) {
      return sendError(
        res,
        'तुम्ही या संकलन केंद्रासाठी आधीच शेतकरी नोंदणी केली आहे (Already registered for this centre).',
        'DUPLICATE_REGISTRATION',
        409
      );
    }

    const allowedMilkTypes = ['cow', 'buffalo', 'both'];
    const cleanMilkType = allowedMilkTypes.includes(String(milkType).toLowerCase())
      ? String(milkType).toLowerCase()
      : 'cow';

    const registration = {
      id: `REG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      dairyId: dairy.id,
      dairyName: dairy.dairyName || dairy.brandName || dairy.name || 'संकलन केंद्र',
      memberId: req.user.id,
      farmerName: farmerName.trim(),
      phone: normalizedPhone,
      village: village ? String(village).trim() : '',
      cattleCount: (cattleCount !== undefined && cattleCount !== null && !isNaN(Number(cattleCount)))
        ? Number(cattleCount)
        : 0,
      milkType: cleanMilkType,
      expectedDailyLitres: (expectedDailyLitres !== undefined && expectedDailyLitres !== null && !isNaN(Number(expectedDailyLitres)))
        ? Number(expectedDailyLitres)
        : 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    db.dairyRegistrations.unshift(registration);
    writeData(db);

    // Notify the centre's ownerId if present
    if (dairy.ownerId) {
      try {
        const notifId = 'NOTIF-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const notifTitle = 'नवीन शेतकरी नोंदणी (New Farmer Registration)';
        const notifMsg = `${farmerName.trim()} यांनी ${dairy.dairyName || 'डेअरी केंद्रा'}साठी दूध नोंदणी केली आहे (अपेक्षित: ${registration.expectedDailyLitres} लिटर).`;
        await runQuery(`
          INSERT INTO notifications (id, member_id, title, message, type, is_read, created_at)
          VALUES (?, ?, ?, ?, 'dairy_registration', 0, datetime('now'))
        `, [notifId, dairy.ownerId, notifTitle, notifMsg]);
      } catch (notifErr) {
        console.error('Error inserting dairy registration notification:', notifErr);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'शेतकरी नोंदणी यशस्वीरीत्या पूर्ण झाली!',
      registration,
      data: { registration }
    });
  } catch (err) {
    return sendError(res, err.message, 'INTERNAL_ERROR', 500);
  }
});

// 5. GET /api/dairy/:id/registrations (only centre owner or admin can read; never public)
router.get(['/:id/registrations', '/dairy/:id/registrations'], authenticateToken, (req, res, next) => {
  if (isBuilderReq(req)) return next();
  try {
    const db = readData();
    db.dairy = db.dairy || [];
    db.dairyRegistrations = db.dairyRegistrations || [];
    const targetId = req.params.id;

    const dairy = db.dairy.find(d => String(d.id) === String(targetId));
    if (!dairy) {
      return res.status(404).json({
        success: false,
        code: 'DAIRY_NOT_FOUND',
        error: 'डेअरी सापडली नाही (Dairy not found).'
      });
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwner = dairy.ownerId && String(dairy.ownerId) === String(req.user?.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        error: 'नोंदण्या पाहण्याची परवानगी फक्त केंद्र मालक किंवा प्रशासकाला आहे (Only centre owner or admin can read registrations).'
      });
    }

    const registrations = db.dairyRegistrations.filter(r => String(r.dairyId) === String(dairy.id));

    return res.json({
      success: true,
      count: registrations.length,
      registrations,
      data: { registrations }
    });
  } catch (err) {
    return sendError(res, err.message, 'INTERNAL_ERROR', 500);
  }
});

// 6. GET /api/dairy/:id & /dairy/:id (404 DAIRY_NOT_FOUND)
router.get(['/:id', '/dairy/:id'], (req, res, next) => {
  if (isBuilderReq(req)) return next();
  try {
    const db = readData();
    const list = db.dairy || [];
    const targetId = req.params.id;

    const item = list.find(d => String(d.id) === String(targetId));
    if (!item) {
      return res.status(404).json({
        success: false,
        code: 'DAIRY_NOT_FOUND',
        error: 'डेअरी सापडली नाही (Dairy not found).'
      });
    }

    return res.json({
      success: true,
      dairy: item,
      data: { dairy: item }
    });
  } catch (err) {
    return sendError(res, err.message, 'INTERNAL_ERROR', 500);
  }
});

// 7. GET /api/dairy & /dairy (Public list with district and kind filter)
router.get(['/', '/dairy'], (req, res, next) => {
  if (isBuilderReq(req)) return next();
  try {
    const db = readData();
    let list = db.dairy || [];
    const { district, kind, search } = req.query;

    if (kind && kind !== 'all' && kind !== 'सर्व') {
      list = list.filter(d => (d.kind || '').toLowerCase() === String(kind).toLowerCase());
    }

    if (district && district !== 'सर्व' && district !== 'all') {
      const q = district.toLowerCase();
      list = list.filter(d =>
        (d.district || '').toLowerCase().includes(q) ||
        (d.headquarters || '').toLowerCase().includes(q) ||
        (d.village || '').toLowerCase().includes(q) ||
        (d.location || '').toLowerCase().includes(q)
      );
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        (d.dairyName || '').toLowerCase().includes(q) ||
        (d.brandName || '').toLowerCase().includes(q) ||
        (d.village || '').toLowerCase().includes(q) ||
        (d.district || '').toLowerCase().includes(q) ||
        (d.centerHead || '').toLowerCase().includes(q)
      );
    }

    return sendSuccess(res, { count: list.length, dairy: list, data: { dairy: list } }, 'मराठा डेअरी व दुग्ध व्यवसाय केंद्र यादी');
  } catch (err) {
    return sendError(res, err.message, 'INTERNAL_ERROR', 500);
  }
});

// 8. POST /api/dairy & /dairy (optionalToken)
// Create centre with required fields and NO fake defaults
router.post(['/', '/dairy'], optionalToken, (req, res, next) => {
  if (isBuilderReq(req)) return next();
  try {
    const {
      dairyName,
      village,
      taluka,
      district,
      morningTiming,
      eveningTiming,
      registeredFarmers,
      centerHead,
      contact,
      facilities,
      milkRateCow,
      milkRateBuffalo,
      dailyCollection
    } = req.body;

    if (!dairyName || typeof dairyName !== 'string' || !dairyName.trim()) {
      return sendError(res, 'डेअरीचे नाव आवश्यक आहे (dairyName is required).', 'VALIDATION_ERROR', 400);
    }

    if (!district || typeof district !== 'string' || !district.trim()) {
      return sendError(res, 'जिल्हा आवश्यक आहे (district is required).', 'VALIDATION_ERROR', 400);
    }

    const normalizedPhone = validateIndianMobile(contact);
    if (!normalizedPhone) {
      return sendError(res, 'कृपया वैध १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा (Valid Indian mobile contact is required).', 'VALIDATION_ERROR', 400);
    }

    // Clean facilities array
    let sanitizedFacilities = [];
    if (facilities !== undefined && facilities !== null) {
      if (Array.isArray(facilities)) {
        sanitizedFacilities = facilities.map(f => String(f).trim()).filter(f => f.length > 0);
      } else if (typeof facilities === 'string') {
        sanitizedFacilities = facilities.split(',').map(f => f.trim()).filter(f => f.length > 0);
      }
    }

    const ownerId = req.user?.id || req.body.ownerId || null;

    const item = {
      id: `DRY-${Date.now().toString().slice(-4)}`,
      dairyName: dairyName.trim(),
      village: village ? String(village).trim() : '',
      taluka: taluka ? String(taluka).trim() : '',
      district: district.trim(),
      morningTiming: morningTiming ? String(morningTiming).trim() : '',
      eveningTiming: eveningTiming ? String(eveningTiming).trim() : '',
      registeredFarmers: (registeredFarmers !== undefined && registeredFarmers !== null && !isNaN(Number(registeredFarmers)))
        ? Number(registeredFarmers)
        : 0,
      centerHead: centerHead ? String(centerHead).trim() : '',
      contact: normalizedPhone,
      facilities: sanitizedFacilities,
      milkRateCow: milkRateCow ? String(milkRateCow).trim() : '',
      milkRateBuffalo: milkRateBuffalo ? String(milkRateBuffalo).trim() : '',
      dailyCollection: dailyCollection ? String(dailyCollection).trim() : '',
      kind: 'centre',
      verified: false,
      ownerId,
      createdAt: new Date().toISOString()
    };

    const db = readData();
    db.dairy = db.dairy || [];
    db.dairy.unshift(item);
    writeData(db);

    return res.status(201).json({
      success: true,
      message: 'डेअरी केंद्र जोडले गेले!',
      dairyCenter: item,
      dairy: item,
      data: { dairyCenter: item, dairy: item }
    });
  } catch (err) {
    return sendError(res, err.message, 'INTERNAL_ERROR', 500);
  }
});

export default router;
