import { Router } from 'express';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = Router();

// GET /api/events
// Calendar of Shivjayanti, conventions, webinars, rallies
router.get('/', (req, res) => {
  const { district, category, search } = req.query;
  let list = db.getCollection('events');

  if (list.length === 0) {
    const seedEvents = [
      {
        id: 'EVT-001',
        title: 'अखिल भारतीय मराठा महासंघ महाअधिवेशन २०२६',
        date: '२५ नोव्हेंबर २०२६',
        time: 'स. १० ते सायं. ६',
        location: 'शिवछत्रपती क्रीडानगरी, बालेवाडी, पुणे',
        district: 'पुणे',
        category: 'महाअधिवेशन',
        chiefGuests: 'मा. प्रदेशाध्यक्ष व ज्येष्ठ सामाजिक नेतृत्व',
        description: 'महाराष्ट्रातील ३६ जिल्हे व इतर राज्यांतील मराठा प्रतिनिधींचे भव्य संमेलन.',
        attendeesCount: 4200,
        capacity: 5000,
        createdAt: new Date().toISOString()
      },
      {
        id: 'EVT-002',
        title: 'शिवजयंती भव्य पदयात्रा व गडदर्शन मोहीम',
        date: '१९ फेब्रुवारी २०२७',
        time: 'पहाटे ५:०० वा.',
        location: 'किल्ले रायगड, महाड',
        district: 'रायगड',
        category: 'दुर्ग मोहीम',
        chiefGuests: 'इतिहास संशोधक व शिवप्रेमी',
        description: 'किल्ले रायगडावर पारंपरिक पोषाखात शिवरायांना अभिवादन व दुर्ग स्वच्छता मोहीम.',
        attendeesCount: 1850,
        capacity: 2500,
        createdAt: new Date().toISOString()
      }
    ];
    for (const e of seedEvents) db.insert('events', e);
    list = seedEvents;
  }

  if (district && district !== 'सर्व') {
    list = list.filter(e => (e.district || '').toLowerCase() === district.toLowerCase());
  }
  if (category && category !== 'सर्व') {
    list = list.filter(e => (e.category || '').toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(e => 
      (e.title || '').toLowerCase().includes(q) ||
      (e.location || '').toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q)
    );
  }

  return sendSuccess(res, 'कार्यक्रमांची यादी प्राप्त झाली', { events: list, count: list.length });
});

// GET /api/events/:id
// Event itinerary, venue map, speakers, chief guests
router.get('/:id', (req, res) => {
  const event = db.findById('events', req.params.id);
  if (!event) {
    return sendError(res, 'कार्यक्रम सापडला नाही.', 'EVENT_NOT_FOUND', 404);
  }

  const rsvps = db.getCollection('eventRsvps').filter(r => r.eventId === req.params.id);

  return sendSuccess(res, 'कार्यक्रमाचा सविस्तर तपशील', {
    event,
    rsvpsCount: rsvps.length
  });
});

// POST /api/events
// Create sanctioned event with registration capacity
router.post('/', authenticateToken, (req, res) => {
  const { title, date, time, location, district, category, description, capacity, chiefGuests } = req.body;
  if (!title || !date || !location) {
    return sendError(res, 'कृपया कार्यक्रमाचे नाव, तारीख व ठिकाण प्रविष्ट करा.', 'MISSING_FIELDS', 400);
  }

  const newEvent = {
    id: `EVT-${Date.now().toString().slice(-4)}`,
    title,
    date,
    time: time || 'सकाळी १०:००',
    location,
    district: district || req.user.district || 'पुणे',
    category: category || 'सामाजिक व सांस्कृतिक',
    description: description || '',
    chiefGuests: chiefGuests || 'स्थानिक महासंघ पदाधिकारी',
    capacity: Number(capacity) || 500,
    attendeesCount: 0,
    createdBy: req.user.id,
    creatorName: req.user.name,
    createdAt: new Date().toISOString()
  };

  db.insert('events', newEvent);
  db.addAuditLog('CREATE_EVENT', req.user.id, { eventId: newEvent.id, title });

  return sendSuccess(res, 'कार्यक्रम यशस्वीरीत्या नियोजित करण्यात आला!', { event: newEvent }, 201);
});

// POST /api/events/:id/rsvp
// Confirm attendance / download entry QR pass
router.post('/:id/rsvp', authenticateToken, (req, res) => {
  const event = db.findById('events', req.params.id);
  if (!event) {
    return sendError(res, 'कार्यक्रम सापडला नाही.', 'EVENT_NOT_FOUND', 404);
  }

  const rsvps = db.getCollection('eventRsvps');
  const existing = rsvps.find(r => r.eventId === req.params.id && r.memberId === req.user.id);

  if (existing) {
    return sendSuccess(res, 'आपण आधीच या कार्यक्रमासाठी उपस्थिती नोंदवली आहे.', {
      rsvp: existing,
      qrPass: `PASS-${existing.id}`
    });
  }

  const newRsvp = {
    id: `RSVP-${Date.now().toString().slice(-4)}`,
    eventId: req.params.id,
    eventTitle: event.title,
    memberId: req.user.id,
    memberName: req.user.name,
    phone: req.user.phone || '',
    timestamp: new Date().toISOString()
  };

  db.insert('eventRsvps', newRsvp);
  event.attendeesCount = (event.attendeesCount || 0) + 1;
  db.update('events', req.params.id, { attendeesCount: event.attendeesCount });
  db.addAuditLog('EVENT_RSVP', req.user.id, { eventId: req.params.id });

  return sendSuccess(res, 'कार्यक्रमासाठी उपस्थिती नोंदणी यशस्वी! आपला डिजिटल प्रवेश पास तयार झाला आहे.', {
    rsvp: newRsvp,
    qrPass: `PASS-${newRsvp.id}`,
    attendeesCount: event.attendeesCount
  }, 201);
});

export default router;
