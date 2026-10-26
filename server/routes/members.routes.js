import { Router } from 'express';
import { all, get, runQuery } from '../../database/database.js';
import { db } from '../db/realtimeDb.js';
import { authenticateToken, optionalToken } from '../middleware/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { sanitize } from '../utils/validator.js';

const router = Router();

// GET /api/members/stats/summary
// Summary statistics from SQLite
router.get('/stats/summary', async (req, res) => {
  try {
    const totalCount = await get('SELECT COUNT(*) as count FROM members');
    const districtCount = await get('SELECT COUNT(DISTINCT district) as count FROM members');
    const goldCount = await get("SELECT COUNT(*) as count FROM members WHERE tier = 'Gold'");
    const platCount = await get("SELECT COUNT(*) as count FROM members WHERE tier = 'Platinum'");
    const businesses = await get('SELECT COUNT(*) as count FROM businesses');
    const donors = db.getCollection('bloodDonors') || [];
    const mandals = await get('SELECT COUNT(*) as count FROM groups');

    return sendSuccess(res, 'एकत्रित सांख्यिकी माहिती', {
      totalMembers: totalCount?.count || 0,
      verifiedMembers: totalCount?.count || 0,
      activeMandals: mandals?.count || 16,
      districtSpread: districtCount?.count || 36,
      bloodDonorsCount: donors.length,
      registeredBusinesses: businesses?.count || 8,
      goldMembers: goldCount?.count || 0,
      platinumMembers: platCount?.count || 0
    });
  } catch (err) {
    return sendError(res, err.message, 'FETCH_STATS_FAILED', 500);
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalCount = await get('SELECT COUNT(*) as count FROM members');
    const goldCount = await get("SELECT COUNT(*) as count FROM members WHERE tier = 'Gold'");
    const platCount = await get("SELECT COUNT(*) as count FROM members WHERE tier = 'Platinum'");
    const districtCount = await get('SELECT COUNT(DISTINCT district) as count FROM members');

    res.json({
      success: true,
      stats: {
        totalMembers: totalCount?.count || 0,
        goldMembers: goldCount?.count || 0,
        platinumMembers: platCount?.count || 0,
        activeDistricts: districtCount?.count || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/members
// List registered members directly from SQLite
router.get('/', async (req, res) => {
  try {
    const { district, profession, search, tier, role, limit = 500, page = 1 } = req.query;
    let sql = `
      SELECT id, name, email, phone, avatar, photo, city, district, state, country,
             profession, business, skills, education, about, tier, role, kul, joined, created_at 
      FROM members 
      WHERE 1=1
    `;
    const params = [];

    if (district && district !== 'सर्व') {
      sql += ' AND district = ?';
      params.push(district);
    }
    if (tier) {
      sql += ' AND tier = ?';
      params.push(tier);
    }
    if (role && role !== 'सर्व' && role !== 'all') {
      sql += ' AND LOWER(role) = ?';
      params.push(role.toLowerCase());
    }
    if (profession && profession !== 'सर्व') {
      sql += ' AND profession LIKE ?';
      params.push(`%${profession}%`);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR profession LIKE ? OR business LIKE ? OR city LIKE ? OR district LIKE ? OR id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY id ASC';
    const rows = await all(sql, params);

    const formatted = rows.map(m => {
      let skills = [];
      try {
        skills = JSON.parse(m.skills || '[]');
      } catch {
        skills = m.skills ? [m.skills] : [];
      }
      return {
        ...m,
        skills,
        photoUrl: m.photo || '',
        location: [m.city, m.district].filter(Boolean).join(', ') || 'महाराष्ट्र'
      };
    });

    const start = (Number(page) - 1) * Number(limit);
    const paginated = formatted.slice(start, start + Number(limit));

    res.json({
      success: true,
      count: paginated.length,
      total: formatted.length,
      members: paginated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/members/referrals/my - Logged-in user's referral history & earnings from SQLite
router.get('/referrals/my', optionalToken, async (req, res) => {
  try {
    const rawId = req.user?.id || req.headers['x-user-id'] || req.query.member_id || req.query.id;
    const phone = req.user?.phone || req.headers['x-user-phone'] || req.query.phone;

    if (!rawId && !phone) {
      return res.json({
        success: true,
        memberCode: 'CM-GUEST',
        metrics: {
          totalReferred: 0,
          activeSubscribed: 0,
          pendingSubscription: 0,
          totalEarnings: 0,
          totalPaidOut: 0,
          withdrawableBalance: 0
        },
        referrals: [],
        payouts: []
      });
    }

    const KNOWN_OFFICIAL_REFERRERS = [
      { id: 'CM-PUN-0842', name: 'अमोल तुकाराम जाधव', district: 'पुणे', taluka: 'हवेली', role: 'professional', phone: '9822011924' },
      { id: 'CM-SAT-0112', name: 'गणेश संभाजी मोरे', district: 'सातारा', taluka: 'कराड', role: 'entrepreneur', phone: '9822011925' },
      { id: 'CM-KOL-0931', name: 'सचिन विजयराव पाटील', district: 'कोल्हापूर', taluka: 'करवीर', role: 'business', phone: '9822011926' },
      { id: 'CM-MUM-1024', name: 'वैभव प्रकाश कदम', district: 'मुंबई', taluka: 'मुंबई शहर', role: 'chapter_president', phone: '9822011927' },
      { id: 'CM-NSK-0551', name: 'रोहन दिलीप सावंत', district: 'नाशिक', taluka: 'नाशिक', role: 'professional', phone: '9822011928' },
      { id: 'CM-AUR-0774', name: 'दिग्विजय राजे भोसले', district: 'छत्रपती संभाजीनगर', taluka: 'संभाजीनगर', role: 'district_admin', phone: '9822011930' },
      { id: 'CM-ADMIN-001', name: 'Connect Maratha मुख्य नियामक कार्यालय', district: 'महाराष्ट्र', taluka: 'मध्यवर्ती', role: 'superadmin', phone: '9822011929' },
      { id: 'CM-OFFICIAL-2026', name: 'Connect Maratha अधिकृत केंद्रीय मंच', district: 'महाराष्ट्र', taluka: 'सर्व', role: 'official', phone: '18001231674' }
    ];

    let member = null;
    if (rawId) {
      member = await get('SELECT id, name, phone, district FROM members WHERE id = ? OR UPPER(id) = UPPER(?)', [rawId, rawId]);
    }
    if (!member && phone && String(phone).trim().length >= 10) {
      member = await get('SELECT id, name, phone, district FROM members WHERE phone = ? OR phone LIKE ?', [phone, `%${phone.slice(-10)}`]);
    }

    const memberId = member?.id || rawId;
    const memberPhone = member?.phone || phone || '';
    const phoneSuffix = memberPhone && memberPhone.length >= 4 ? memberPhone.slice(-4) : '';
    const strippedId = String(memberId).replace(/^CM-/i, '').replace(/^M/i, '');
    const cmCode = memberId.startsWith('CM-') ? memberId : `CM-${memberId}`;
    const cmMCode = `CM-M${strippedId}`;
    const phoneCode = phoneSuffix ? `CM-MH-${phoneSuffix}` : '';
    const formattedCode = cmCode;

    // 1. Fetch from explicit member_referrals table joined with members
    const explicitRefs = await all(`
      SELECT 
        r.*,
        m.email as referee_email,
        m.tier as referee_package,
        m.joined as referee_joined,
        m.created_at as referee_created_at,
        m.phone as referee_full_phone
      FROM member_referrals r
      LEFT JOIN members m ON r.referee_id = m.id
      WHERE r.referrer_id = ? 
         OR r.referrer_id = ? 
         OR r.referrer_id = ? 
         OR r.referrer_id = ? 
         OR UPPER(r.referrer_id) = UPPER(?)
         OR (r.referrer_id = ? AND ? != '')
         OR (r.referrer_phone != '' AND ? != '' AND (r.referrer_phone = ? OR r.referrer_phone LIKE ?))
      ORDER BY r.created_at DESC
    `, [memberId, cmCode, cmMCode, phoneCode, rawId || '', strippedId, strippedId, memberPhone, memberPhone, `%${memberPhone.slice(-10)}`]);

    // 2. Fetch directly from members table where referred_by was saved during registration
    const directMembers = await all(`
      SELECT id, name, phone, email, tier, district, taluka, created_at, joined, referred_by
      FROM members
      WHERE referred_by IS NOT NULL 
        AND referred_by != ''
        AND (
          referred_by = ?
          OR referred_by = ?
          OR referred_by = ?
          OR referred_by = ?
          OR UPPER(referred_by) = UPPER(?)
          OR (referred_by = ? AND ? != '')
        )
      ORDER BY created_at DESC
    `, [memberId, cmCode, cmMCode, phoneCode, rawId || '', strippedId, strippedId]);

    // 3. Merge deduplicated referrals with standard 12 columns
    const referralsMap = new Map();
    for (const r of explicitRefs) {
      const refereeId = r.referee_id || r.id;
      const refName = r.referee_name || 'Connect Maratha सभासद';
      const refEmail = r.referee_email || 'सभासद@connectmaratha.com';
      const refPhone = r.referee_full_phone || r.referee_phone || '-';
      const refPkg = r.referee_package || 'Basic (प्राथमिक)';
      const joinDt = (r.referee_joined || r.created_at || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
      const actDt = (r.referee_created_at || r.created_at || r.referee_joined || '').slice(0, 10) || joinDt;
      const stat = r.status === 'active' || !r.status ? 'Active' : r.status;

      referralsMap.set(refereeId, {
        id: r.id,
        memberId: refereeId,
        refereeId: refereeId,
        name: refName,
        refereeName: refName,
        referralId: r.referrer_id || formattedCode,
        referrerId: r.referrer_id || formattedCode,
        referralName: r.referrer_name || member?.name || 'Connect Maratha सभासद',
        referrerName: r.referrer_name || member?.name || 'Connect Maratha सभासद',
        joiningDate: joinDt,
        registeredAt: r.created_at || joinDt,
        mobileNo: refPhone,
        refereePhone: refPhone,
        email: refEmail,
        package: refPkg,
        activDate: actDt,
        status: stat,
        district: r.district || 'महाराष्ट्र',
        taluka: r.taluka || '',
        bonusAmount: Number(r.bonus_amount) || 100,
        created_at: r.created_at || joinDt
      });
    }

    for (const m of directMembers) {
      if (!referralsMap.has(m.id)) {
        const joinDt = (m.joined || m.created_at || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
        const actDt = (m.created_at || m.joined || '').slice(0, 10) || joinDt;
        referralsMap.set(m.id, {
          id: `REF-${m.id}`,
          memberId: m.id,
          refereeId: m.id,
          name: m.name,
          refereeName: m.name,
          referralId: memberId || formattedCode,
          referrerId: memberId || formattedCode,
          referralName: member?.name || 'Connect Maratha सभासद',
          referrerName: member?.name || 'Connect Maratha सभासद',
          joiningDate: joinDt,
          registeredAt: m.created_at || joinDt,
          mobileNo: m.phone || '-',
          refereePhone: m.phone || '-',
          email: m.email || 'सभासद@connectmaratha.com',
          package: m.tier || 'Basic (प्राथमिक)',
          activDate: actDt,
          status: 'Active',
          district: m.district || 'महाराष्ट्र',
          taluka: m.taluka || '',
          bonusAmount: 100,
          created_at: m.created_at || joinDt
        });
      }
    }

    const mergedReferrals = Array.from(referralsMap.values())
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .map((item, idx) => ({ ...item, sno: idx + 1 }));

    const payouts = await all(`
      SELECT * FROM referral_payouts
      WHERE member_id = ? OR member_id = ? OR member_id = ?
      ORDER BY created_at DESC
    `, [memberId, formattedCode, strippedId]);

    const totalReferred = mergedReferrals.length;
    const activeSubscribed = mergedReferrals.filter(r => r.status === 'Active' || r.status === 'active').length;
    const pendingSubscription = mergedReferrals.filter(r => r.status === 'Pending' || r.status === 'pending').length;
    const totalEarnings = activeSubscribed * 100;
    const totalPaidOut = payouts
      .filter(p => p.status === 'SUCCESS' || p.status === 'PROCESSING')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const withdrawableBalance = Math.max(0, totalEarnings - totalPaidOut);

    return res.json({
      success: true,
      memberCode: formattedCode,
      metrics: {
        totalReferred,
        activeSubscribed,
        pendingSubscription,
        totalEarnings,
        totalPaidOut,
        withdrawableBalance
      },
      referrals: mergedReferrals,
      payouts
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/members/referrals/all - Master referral registry for Admin & CRM
router.get('/referrals/all', async (req, res) => {
  try {
    const rows = await all(`
      SELECT 
        mr.*,
        m.email as referee_email,
        m.tier as referee_package,
        m.joined as referee_joined,
        m.created_at as referee_created_at,
        m.phone as referee_full_phone
      FROM member_referrals mr
      LEFT JOIN members m ON mr.referee_id = m.id
      ORDER BY mr.created_at DESC
    `);

    const directRows = await all(`
      SELECT id, name, phone, email, tier, district, taluka, created_at, joined, referred_by
      FROM members
      WHERE referred_by IS NOT NULL AND referred_by != ''
      ORDER BY created_at DESC
    `);

    const map = new Map();
    for (const r of rows) {
      const refereeId = r.referee_id || r.id;
      map.set(refereeId, {
        id: r.id,
        memberId: refereeId,
        refereeId: refereeId,
        name: r.referee_name,
        refereeName: r.referee_name,
        referralId: r.referrer_id,
        referrerId: r.referrer_id,
        referralName: r.referrer_name || 'Connect Maratha सभासद',
        referrerName: r.referrer_name || 'Connect Maratha सभासद',
        joiningDate: (r.referee_joined || r.created_at || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
        mobileNo: r.referee_full_phone || r.referee_phone || '-',
        email: r.referee_email || '-',
        package: r.referee_package || 'Basic (प्राथमिक)',
        activDate: (r.referee_created_at || r.created_at || r.referee_joined || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
        status: r.status === 'active' || !r.status ? 'Active' : r.status,
        district: r.district || 'महाराष्ट्र',
        taluka: r.taluka || '',
        created_at: r.created_at
      });
    }

    for (const m of directRows) {
      if (!map.has(m.id)) {
        map.set(m.id, {
          id: `REF-${m.id}`,
          memberId: m.id,
          refereeId: m.id,
          name: m.name,
          refereeName: m.name,
          referralId: m.referred_by,
          referrerId: m.referred_by,
          referralName: 'Connect Maratha सभासद',
          referrerName: 'Connect Maratha सभासद',
          joiningDate: (m.joined || m.created_at || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
          mobileNo: m.phone || '-',
          email: m.email || '-',
          package: m.tier || 'Basic (प्राथमिक)',
          activDate: (m.created_at || m.joined || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
          status: 'Active',
          district: m.district || 'महाराष्ट्र',
          taluka: m.taluka || '',
          created_at: m.created_at
        });
      }
    }

    const referrals = Array.from(map.values())
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
      .map((r, i) => ({ ...r, sno: i + 1 }));

    return res.json({ success: true, count: referrals.length, referrals });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/members/referrals/verify/:code - Verify referral code against SQLite
router.get('/referrals/verify/:code', async (req, res) => {
  try {
    const rawCode = String(req.params.code || '').trim();
    if (!rawCode) {
      return res.status(400).json({ success: false, valid: false, message: 'कोड आवश्यक आहे.' });
    }

    const KNOWN_OFFICIAL_REFERRERS = [
      { id: 'CM-PUN-0842', name: 'अमोल तुकाराम जाधव', district: 'पुणे', taluka: 'हवेली', role: 'professional', phone: '9822011924' },
      { id: 'CM-SAT-0112', name: 'गणेश संभाजी मोरे', district: 'सातारा', taluka: 'कराड', role: 'entrepreneur', phone: '9822011925' },
      { id: 'CM-KOL-0931', name: 'सचिन विजयराव पाटील', district: 'कोल्हापूर', taluka: 'करवीर', role: 'business', phone: '9822011926' },
      { id: 'CM-MUM-1024', name: 'वैभव प्रकाश कदम', district: 'मुंबई', taluka: 'मुंबई शहर', role: 'chapter_president', phone: '9822011927' },
      { id: 'CM-NSK-0551', name: 'रोहन दिलीप सावंत', district: 'नाशिक', taluka: 'नाशिक', role: 'professional', phone: '9822011928' },
      { id: 'CM-AUR-0774', name: 'दिग्विजय राजे भोसले', district: 'छत्रपती संभाजीनगर', taluka: 'संभाजीनगर', role: 'district_admin', phone: '9822011930' },
      { id: 'CM-ADMIN-001', name: 'Connect Maratha मुख्य नियामक कार्यालय', district: 'महाराष्ट्र', taluka: 'मध्यवर्ती', role: 'superadmin', phone: '9822011929' },
      { id: 'CM-OFFICIAL-2026', name: 'Connect Maratha अधिकृत केंद्रीय मंच', district: 'महाराष्ट्र', taluka: 'सर्व', role: 'official', phone: '18001231674' }
    ];

    const clean = rawCode.toUpperCase();
    const officialMatch = KNOWN_OFFICIAL_REFERRERS.find(
      r => r.id.toUpperCase() === clean || r.phone === rawCode || (r.phone && clean.endsWith(r.phone.slice(-4)))
    );
    if (officialMatch) {
      return res.json({
        success: true,
        valid: true,
        memberId: officialMatch.id,
        name: officialMatch.name,
        district: officialMatch.district,
        taluka: officialMatch.taluka,
        role: officialMatch.role || 'official'
      });
    }

    const stripped = clean.replace(/^CM-/, '').replace(/^MH-/, '').replace(/^PUN-/, '');
    const cleanDigits = rawCode.replace(/\D/g, '');

    const member = await get(`
      SELECT id, name, phone, district, taluka, city, role 
      FROM members 
      WHERE UPPER(id) = ? 
         OR UPPER(id) = ? 
         OR phone = ? 
         OR (phone != '' AND ? != '' AND phone LIKE ?)
         OR (id != '' AND ? != '' AND UPPER(id) LIKE ?)
      LIMIT 1
    `, [clean, stripped, rawCode, cleanDigits, `%${cleanDigits.slice(-10)}`, stripped, `%${stripped}`]);

    if (member) {
      return res.json({
        success: true,
        valid: true,
        memberId: member.id,
        name: member.name,
        district: member.district || member.city || 'महाराष्ट्र',
        taluka: member.taluka || '',
        role: member.role || 'member'
      });
    }

    return res.json({
      success: false,
      valid: false,
      message: 'हा सभासद आयडी आढळला नाही. कृपया अचूक आयडी टाका किंवा अधिकृत कोड वापरा.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/members/referrals/payout - Submit UPI payout request
router.post('/referrals/payout', optionalToken, async (req, res) => {
  try {
    const { upi_id, amount, member_id } = req.body;
    const userId = req.user?.id || member_id;
    const payoutAmount = Number(amount) || 0;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'सभासद प्रमाणीकरण आवश्यक आहे.' });
    }
    if (payoutAmount <= 0) {
      return res.status(400).json({ success: false, error: 'रक्कम शून्य किंवा त्याहून अधिक असावी.' });
    }
    if (!upi_id || !upi_id.includes('@')) {
      return res.status(400).json({ success: false, error: 'कृपया वैध UPI ID प्रविष्ट करा (उदा. name@upi).' });
    }

    const payoutId = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await runQuery(`
      INSERT INTO referral_payouts (id, member_id, upi_id, amount, status, created_at)
      VALUES (?, ?, ?, ?, 'PENDING', datetime('now'))
    `, [payoutId, userId, upi_id.trim(), payoutAmount]);

    return res.json({
      success: true,
      message: 'पेआउट विनंती नोंदवली गेली आहे! २४ तासांत UPI द्वारे जमा केली जाईल.',
      payout: {
        id: payoutId,
        memberId: userId,
        upiId: upi_id,
        amount: payoutAmount,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/members/:id/referrals - Get specific member's referrals
router.get('/:id/referrals', async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await get('SELECT id, name, phone, district FROM members WHERE id = ?', [memberId]);
    if (!member) {
      return res.status(404).json({ success: false, error: 'सदस्य आढळला नाही.' });
    }
    const phoneSuffix = member.phone ? member.phone.slice(-4) : '';
    const referrals = await all(`
      SELECT * FROM member_referrals 
      WHERE referrer_id = ? OR referrer_phone = ? OR (referrer_phone != '' AND referrer_phone LIKE ?)
      ORDER BY created_at DESC
    `, [memberId, member.phone || '', `%${phoneSuffix}`]);

    return res.json({
      success: true,
      member: { id: member.id, name: member.name },
      count: referrals.length,
      referrals
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/members/:id
router.get('/:id', async (req, res) => {
  try {
    const member = await get(`
      SELECT id, name, email, phone, avatar, photo, city, district, state, country,
             country_id, state_id, district_id, taluka_id, village_id, taluka, village,
             profession, business, skills, education, interests, about, tier, role, kul,
             verified_mobile, verified_email, verified_profile, joined 
      FROM members WHERE id = ?
    `, [req.params.id]);

    if (!member) {
      return res.status(404).json({ success: false, error: 'सदस्य आढळला नाही.' });
    }

    try {
      member.skills = JSON.parse(member.skills || '[]');
      member.interests = JSON.parse(member.interests || '[]');
    } catch {
      member.skills = [];
      member.interests = [];
    }

    res.json({ success: true, member, data: member });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/members/:id/card
router.get('/:id/card', async (req, res) => {
  try {
    const member = await get('SELECT id, name, phone, email, avatar, photo, district, city, role, tier, kul, joined FROM members WHERE id = ?', [req.params.id]);
    if (!member) {
      return res.status(404).json({ success: false, error: 'सदस्य ओळखपत्र सापडले नाही.' });
    }
    return res.json({
      success: true,
      card: {
        ...member,
        cardNumber: `CM-96K-${String(member.id).replace(/\D/g, '').slice(-4).padStart(4, '0')}`,
        validUntil: '2030-12-31',
        membershipType: member.tier || 'Gold',
        state: 'महाराष्ट्र',
        organization: 'अखिल भारतीय मराठा महासंघ'
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/members/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      avatar,
      photo,
      city,
      district,
      state,
      country,
      taluka,
      village,
      countryId,
      stateId,
      districtId,
      talukaId,
      villageId,
      profession,
      business,
      skills,
      education,
      interests,
      about,
      kul
    } = req.body;

    const member = await get('SELECT id, name, phone FROM members WHERE id = ? OR phone = ? OR email = ?', [req.params.id, req.params.id, req.params.id]);

    if (!member) {
      return res.status(404).json({ success: false, error: 'सदस्य सापडला नाही.' });
    }
    const targetId = member.id;

    const skillsJson = skills !== undefined
      ? (Array.isArray(skills) ? JSON.stringify(skills) : JSON.stringify([skills]))
      : undefined;

    const interestsJson = interests !== undefined
      ? (Array.isArray(interests) ? JSON.stringify(interests) : JSON.stringify([interests]))
      : undefined;

    await runQuery(`
      UPDATE members SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        avatar = COALESCE(?, avatar),
        photo = COALESCE(?, photo),
        city = COALESCE(?, city),
        district = COALESCE(?, district),
        state = COALESCE(?, state),
        country = COALESCE(?, country),
        taluka = COALESCE(?, taluka),
        village = COALESCE(?, village),
        country_id = COALESCE(?, country_id),
        state_id = COALESCE(?, state_id),
        district_id = COALESCE(?, district_id),
        taluka_id = COALESCE(?, taluka_id),
        village_id = COALESCE(?, village_id),
        profession = COALESCE(?, profession),
        business = COALESCE(?, business),
        skills = COALESCE(?, skills),
        education = COALESCE(?, education),
        interests = COALESCE(?, interests),
        about = COALESCE(?, about),
        kul = COALESCE(?, kul)
      WHERE id = ?
    `, [
      name, email, phone, avatar, photo, city, district, state, country,
      taluka, village, countryId, stateId, districtId, talukaId, villageId,
      profession, business, skillsJson, education, interestsJson, about, kul,
      targetId
    ]);

    const updated = await get(`
      SELECT id, name, email, phone, avatar, photo, city, district, state, country,
             country_id, state_id, district_id, taluka_id, village_id, taluka, village,
             profession, business, skills, education, interests, about, tier, role, kul,
             verified_mobile, verified_email, verified_profile, joined
      FROM members WHERE id = ?
    `, [targetId]);

    try {
      updated.skills = JSON.parse(updated.skills || '[]');
    } catch {
      updated.skills = [];
    }

    try {
      updated.interests = JSON.parse(updated.interests || '[]');
    } catch {
      updated.interests = [];
    }

    // Mirror to realtimeDb
    db.update('members', targetId, updated);

    // Sync avatar to posts created by this author
    if (avatar) {
      try {
        await runQuery('UPDATE posts SET author_avatar = ? WHERE author_id = ? OR author_id = ? OR author_name = ?', [avatar, targetId, member.phone, member.name]);
      } catch (_) {}
    }

    res.json({ success: true, message: 'माहिती अद्ययावत केली!', member: updated, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/members/:id - Admin or user self-deletion from SQLite database & memory
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const isMod = ['superadmin', 'admin', 'ceo', 'center_manager', 'center_admin', 'district_admin'].includes(req.user?.role?.toLowerCase());
    const isSelf = req.user?.id === id;

    if (!isMod && !isSelf) {
      return res.status(403).json({ success: false, error: 'प्रशासकीय परवानगी आवश्यक.' });
    }

    if (id === 'CM-SUPER-001') {
      return res.status(403).json({ success: false, error: 'मूळ सर्वोच्च प्रशासक खाते हटवता येत नाही.' });
    }

    const member = await get('SELECT id, name, phone FROM members WHERE id = ? OR phone = ? OR email = ?', [id, id, id]);
    const inMem = db.findById('members', id) || db.getCollection('members').find(m => m.id === id || m.phone === id);

    if (!member && !inMem) {
      return res.status(404).json({ success: false, error: 'सदस्य सापडला नाही.' });
    }

    const targetId = member?.id || inMem?.id || id;
    const targetPhone = member?.phone || inMem?.phone;
    const memberName = member?.name || inMem?.name || 'सदस्य';

    // 1. Permanently delete from SQLite Database
    await runQuery('DELETE FROM members WHERE id = ?', [targetId]);
    if (targetPhone) {
      await runQuery('DELETE FROM members WHERE phone = ?', [targetPhone]);
    }

    try {
      await runQuery('DELETE FROM users WHERE id = ?', [targetId]);
      if (targetPhone) await runQuery('DELETE FROM users WHERE phone = ?', [targetPhone]);
    } catch (_) {}

    try {
      await runQuery('DELETE FROM digital_id_cards WHERE member_id = ?', [targetId]);
    } catch (_) {}

    try {
      await runQuery('DELETE FROM matrimony_profiles WHERE user_id = ? OR member_id = ?', [targetId, targetId]);
    } catch (_) {}

    // 2. Remove from memory / db.json
    db.remove('members', targetId);
    if (inMem && inMem.id !== targetId) db.remove('members', inMem.id);

    // 3. Security Audit Log
    db.addAuditLog('DELETE_MEMBER', req.user?.id || 'ADMIN', {
      deletedId: targetId,
      deletedName: memberName,
      deletedBy: req.user?.name || req.user?.id
    });

    console.log(`🗑️ [MEMBER PURGED] ${memberName} (${targetId}) removed from SQLite and memory.`);

    return res.json({
      success: true,
      message: `सदस्य "${memberName}" डेटाबेसमधून यशस्वीरीत्या काढून टाकण्यात आला!`,
      deletedId: targetId,
      deletedFromDatabase: true
    });
  } catch (err) {
    console.error('Error deleting member:', err);
    return res.status(500).json({ success: false, error: 'सदस्य हटवताना त्रुटी आली: ' + err.message });
  }
});

// PUT /api/members/:id/change-id
router.put('/:id/change-id', authenticateToken, async (req, res) => {
  try {
    const isSuper = req.user && ['admin', 'ceo', 'superadmin'].includes(req.user.role);
    if (!isSuper) {
      return res.status(403).json({ success: false, error: 'केवळ प्रशासकाला सदस्य आयडी बदलण्याची परवानगी आहे.' });
    }

    const oldId = req.params.id;
    let newId = req.body.newId || req.body.id;
    if (!newId || !String(newId).trim()) {
      return res.status(400).json({ success: false, error: 'कृपया नवीन सदस्य आयडी प्रविष्ट करा.' });
    }
    newId = String(newId).trim();

    if (newId === oldId) {
      return res.json({ success: true, message: 'सदस्य आयडी आधीच हाच आहे.', oldId, newId });
    }

    const existing = await get('SELECT id, name FROM members WHERE id = ?', [newId]);
    if (existing && existing.id !== oldId) {
      return res.status(409).json({ success: false, error: `हा आयडी आधीच "${existing.name}" (ID: ${existing.id}) या सदस्यासाठी नोंदणीकृत आहे.` });
    }

    const currentMember = await get('SELECT * FROM members WHERE id = ?', [oldId]);
    if (!currentMember) {
      return res.status(404).json({ success: false, error: 'सदस्य डेटाबेसमध्ये सापडला नाही.' });
    }

    const isVip = (req.body.isVip !== undefined) 
      ? (req.body.isVip ? 1 : 0)
      : (/^(.)\1{5}$|^(123456|654321|100000|999000|000007|777777|999999|111111|555555|888888)$/.test(newId.replace(/\D/g, '')) ? 1 : (currentMember.is_vip || 0));
    const vipNumber = isVip ? (req.body.vipNumber || newId) : null;

    // 1. Update in SQLite
    await runQuery('UPDATE members SET id = ?, is_vip = ?, vip_number = ? WHERE id = ?', [newId, isVip, vipNumber, oldId]);

    // 2. Cascade across child tables
    try { await runQuery('UPDATE users SET id = ? WHERE id = ?', [newId, oldId]); } catch (_) {}
    try { await runQuery('UPDATE digital_id_cards SET member_id = ? WHERE member_id = ?', [newId, oldId]); } catch (_) {}
    try { await runQuery('UPDATE matrimony_profiles SET member_id = ? WHERE member_id = ?', [newId, oldId]); } catch (_) {}
    try { await runQuery('UPDATE matrimony_profiles SET user_id = ? WHERE user_id = ?', [newId, oldId]); } catch (_) {}
    try { await runQuery('UPDATE blood_donors SET user_id = ? WHERE user_id = ?', [newId, oldId]); } catch (_) {}
    try { await runQuery('UPDATE member_referrals SET referrer_id = ? WHERE referrer_id = ?', [newId, oldId]); } catch (_) {}
    try { await runQuery('UPDATE member_referrals SET referee_id = ? WHERE referee_id = ?', [newId, oldId]); } catch (_) {}
    try { await runQuery('UPDATE direct_messages SET sender_id = ? WHERE sender_id = ?', [newId, oldId]); } catch (_) {}
    try { await runQuery('UPDATE direct_messages SET recipient_id = ? WHERE recipient_id = ?', [newId, oldId]); } catch (_) {}
    try { await runQuery('UPDATE posts SET author_id = ? WHERE author_id = ?', [newId, oldId]); } catch (_) {}
    try { await runQuery('UPDATE post_comments SET author_id = ? WHERE author_id = ?', [newId, oldId]); } catch (_) {}
    try { await runQuery('UPDATE post_likes SET member_id = ? WHERE member_id = ?', [newId, oldId]); } catch (_) {}
    try { await runQuery('UPDATE businesses SET owner_id = ? WHERE owner_id = ?', [newId, oldId]); } catch (_) {}

    // 3. Memory store update
    try {
      const inMem = db.findById('members', oldId);
      if (inMem) {
        db.remove('members', oldId);
        db.insert('members', { ...inMem, id: newId, is_vip: isVip, vip_number: vipNumber });
      }
    } catch (_) {}

    db.addAuditLog('ADMIN_CHANGE_USER_ID', req.user?.id || 'ADMIN', {
      oldId, newId, memberName: currentMember.name, admin: req.user?.name || 'प्रशासक'
    });

    const updatedMember = await get('SELECT * FROM members WHERE id = ?', [newId]);

    return res.json({
      success: true,
      message: `सदस्य "${currentMember.name}" यांचा आयडी यशस्वीरित्या बदलला गेला (${oldId} ➔ ${newId})!`,
      oldId,
      newId,
      member: updatedMember || { ...currentMember, id: newId }
    });
  } catch (err) {
    console.error('Error changing member ID in members router:', err);
    return res.status(500).json({ success: false, error: 'आयडी बदलताना त्रुटी: ' + err.message });
  }
});

export default router;
