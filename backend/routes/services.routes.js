import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { ensureWebsiteTables, isAdmin, cleanMobile, text, newId } from '../utils/websiteTables.js';

// Local service professionals (legal, CA, electrician, ...) and bookings.
// Public: /api/services. Admin CRUD: /api/admin/services (adminServicesRouter).
const router = Router();
export const adminServicesRouter = Router();

const toService = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  location: row.location || '',
  phone: row.phone || '',
  experience: row.experience || '',
  pricing: row.pricing || '',
  description: row.description || '',
  status: row.status,
  createdAt: row.created_at,
});

// GET /api/services  -> active providers (empty until an admin adds real ones)
router.get('/', async (req, res, next) => {
  try {
    await ensureWebsiteTables();
    const rows = await all("SELECT * FROM services WHERE status = 'active' ORDER BY created_at DESC");
    const services = rows.map(toService);
    return sendSuccess(res, 'स्थानिक सेवा व्यावसायिक यादी', { services, count: services.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/services/booking  { serviceId?, serviceCategory, professionalName?, requestedDate?, address?, phone, requirementNotes?, customerName? }
router.post('/booking', async (req, res, next) => {
  try {
    const category = text(req.body?.serviceCategory, 100);
    const phone = cleanMobile(req.body?.phone);
    if (!category || !req.body?.phone) {
      return sendError(res, 'कृपया सेवा प्रकार व संपर्क नंबर प्रविष्ट करा.', 'MISSING_FIELDS', 400);
    }
    if (!phone) {
      return sendError(res, 'कृपया वैध १० अंकी संपर्क नंबर प्रविष्ट करा.', 'INVALID_PHONE', 400);
    }

    await ensureWebsiteTables();
    const booking = {
      id: newId('SBK'),
      serviceId: text(req.body?.serviceId, 60),
      serviceCategory: category,
      professionalName: text(req.body?.professionalName, 120) || 'नजीकचा मराठा सेवा व्यावसायिक',
      customerName: req.user?.name || text(req.body?.customerName, 100) || 'सन्माननीय ग्राहक',
      customerId: req.user?.id || 'GUEST',
      phone,
      address: text(req.body?.address, 300) || 'महाराष्ट्र',
      requestedDate: text(req.body?.requestedDate, 60) || 'लवकरात लवकर (ASAP)',
      notes: text(req.body?.requirementNotes, 1000),
      status: 'बुकिंग नोंदवली - व्यावसायिक संपर्क साधतील',
      createdAt: new Date().toISOString(),
    };
    await runQuery(
      `INSERT INTO service_bookings (id, service_id, service_category, professional_name, customer_id,
         customer_name, phone, address, requested_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [booking.id, booking.serviceId, category, booking.professionalName, booking.customerId,
        booking.customerName, phone, booking.address, booking.requestedDate, booking.notes]
    );
    return sendSuccess(res, 'सेवा बुकिंग यशस्वी! आमचे व्यावसायिक लवकरच आपल्याशी संपर्क करतील.', { booking }, 201);
  } catch (err) {
    next(err);
  }
});

// ---------- Admin: /api/admin/services ----------
adminServicesRouter.use(authenticateToken, (req, res, next) =>
  isAdmin(req.user) ? next() : sendError(res, 'फक्त प्रशासकांना परवानगी आहे. (Admins only)', 'FORBIDDEN', 403)
);

function serviceFields(body = {}) {
  return {
    name: text(body.name, 150),
    category: text(body.category, 100),
    location: text(body.location, 150),
    phone: text(body.phone, 30),
    experience: text(body.experience, 60),
    pricing: text(body.pricing, 100),
    description: text(body.description, 1000),
  };
}

adminServicesRouter.get('/', async (req, res, next) => {
  try {
    await ensureWebsiteTables();
    const services = (await all('SELECT * FROM services ORDER BY created_at DESC')).map(toService);
    return sendSuccess(res, 'सेवा व व्यावसायिक यादी', { services, count: services.length });
  } catch (err) {
    next(err);
  }
});

adminServicesRouter.post('/', async (req, res, next) => {
  try {
    const f = serviceFields(req.body);
    if (!f.name || !f.category) {
      return sendError(res, 'नाव व सेवा प्रकार आवश्यक आहे.', 'VALIDATION_ERROR', 400);
    }
    await ensureWebsiteTables();
    const id = newId('SRV');
    await runQuery(
      `INSERT INTO services (id, name, category, location, phone, experience, pricing, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, f.name, f.category, f.location, f.phone, f.experience, f.pricing, f.description, req.user.id]
    );
    const service = toService(await get('SELECT * FROM services WHERE id = ?', [id]));
    return sendSuccess(res, 'सेवा व्यावसायिक जोडले!', { service }, 201);
  } catch (err) {
    next(err);
  }
});

adminServicesRouter.put('/:id', async (req, res, next) => {
  try {
    await ensureWebsiteTables();
    const existing = await get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!existing) return sendError(res, 'सेवा सापडली नाही.', 'NOT_FOUND', 404);
    const f = serviceFields({ ...existing, ...req.body });
    const status = ['active', 'hidden'].includes(req.body?.status) ? req.body.status : existing.status;
    await runQuery(
      `UPDATE services SET name = ?, category = ?, location = ?, phone = ?, experience = ?, pricing = ?,
         description = ?, status = ?, updated_at = ? WHERE id = ?`,
      [f.name, f.category, f.location, f.phone, f.experience, f.pricing, f.description, status,
        new Date().toISOString(), req.params.id]
    );
    const service = toService(await get('SELECT * FROM services WHERE id = ?', [req.params.id]));
    return sendSuccess(res, 'सेवा माहिती अद्ययावत केली!', { service });
  } catch (err) {
    next(err);
  }
});

adminServicesRouter.delete('/:id', async (req, res, next) => {
  try {
    await ensureWebsiteTables();
    await runQuery('DELETE FROM services WHERE id = ?', [req.params.id]);
    return sendSuccess(res, 'सेवा हटवली.', { id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
