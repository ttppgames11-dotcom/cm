import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// GET /api/services
// List local service professionals (electricians, legal, CA, plumbing, etc.)
router.get('/', (req, res) => {
  let list = db.getCollection('services');

  if (list.length === 0) {
    const seedServices = [
      { id: 'SRV-01', name: 'ॲड. संग्रामसिंह माने', category: 'कायदेशीर सल्ला (Legal)', location: 'पुणे जिल्हा न्यायालय', phone: '+91 98220 88771', rating: '4.9 ★' },
      { id: 'SRV-02', name: 'सीए. राहुल जाधव आणि असोसिएट्स', category: 'सीए व जीएसटी कन्सल्टंट', location: 'डेक्कन, पुणे', phone: '+91 98900 11223', rating: '5.0 ★' },
      { id: 'SRV-03', name: 'शिवशक्ती इलेक्ट्रिकल व होम सर्व्हिसेस', category: 'इलेक्ट्रिशियन व सोलर इन्स्टॉलेशन', location: 'सातारा', phone: '+91 94220 33445', rating: '4.8 ★' },
      { id: 'SRV-04', name: 'सह्याद्री इंटिरिअर व प्लंबिंग सोल्यूशन्स', category: 'प्लंबिंग व इंटिरिअर वर्क', location: 'नवी मुंबई', phone: '+91 98200 44556', rating: '4.7 ★' }
    ];
    for (const s of seedServices) db.insert('services', s);
    list = seedServices;
  }

  return sendSuccess(res, 'स्थानिक सेवा व्यावसायिक यादी', { services: list, count: list.length });
});

// POST /api/services/booking
// Book a local professional service for home/office
router.post('/booking', optionalToken, (req, res) => {
  const { serviceId, serviceCategory, professionalName, requestedDate, address, phone, requirementNotes } = req.body;

  if (!phone || !serviceCategory) {
    return sendError(res, 'कृपया सेवा प्रकार व संपर्क नंबर प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const booking = {
    id: `SBK-${Date.now().toString().slice(-4)}`,
    serviceId: serviceId || '',
    serviceCategory,
    professionalName: professionalName || 'नजीकचा मराठा सेवा व्यावसायिक',
    customerName: req.user?.name || req.body.customerName || 'सन्माननीय ग्राहक',
    customerId: req.user?.id || 'GUEST',
    phone,
    address: address || 'महाराष्ट्र',
    requestedDate: requestedDate || 'लवकरात लवकर (ASAP)',
    notes: requirementNotes || '',
    status: 'बुकिंग निश्चित - व्यावसायिक संपर्क साधतील',
    createdAt: new Date().toISOString()
  };

  db.insert('serviceBookings', booking);
  db.addAuditLog('BOOK_SERVICE', req.user?.id || 'GUEST', { bookingId: booking.id, serviceCategory });

  return sendSuccess(res, 'सेवा बुकिंग यशस्वी! आमचे व्यावसायिक लवकरच आपल्याशी संपर्क करतील.', { booking }, 201);
});

export default router;
