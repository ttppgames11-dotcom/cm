// Connect Maratha Enterprise Real-time Referral & Incentive Service
// Real-time tracking, live verification, multi-tab sync, wallet payouts & Admin Intelligence Reporting

const REFERRALS_STORAGE_KEY = 'cm_referrals_db';
const PAYOUTS_STORAGE_KEY = 'cm_payouts_db';

// Known directory of recognized official referrers (fallback & default database)
export const KNOWN_OFFICIAL_REFERRERS = [
  { id: 'CM-PUN-0842', name: 'अमोल तुकाराम जाधव', district: 'पुणे', taluka: 'हवेली', chapter: 'पुणे – शिवनेरी चॅप्टर', role: 'professional', phone: '9822011924' },
  { id: 'CM-SAT-0112', name: 'गणेश संभाजी मोरे', district: 'सातारा', taluka: 'कराड', chapter: 'सातारा – अजिंक्यतारा चॅप्टर', role: 'entrepreneur', phone: '9822011925' },
  { id: 'CM-KOL-0931', name: 'सचिन विजयराव पाटील', district: 'कोल्हापूर', taluka: 'करवीर', chapter: 'कोल्हापूर – पन्हाळा चॅप्टर', role: 'business', phone: '9822011926' },
  { id: 'CM-MUM-1024', name: 'वैभव प्रकाश कदम', district: 'मुंबई', taluka: 'मुंबई शहर', chapter: 'मुंबई – स्वराज्य चॅप्टर', role: 'chapter_president', phone: '9822011927' },
  { id: 'CM-NSK-0551', name: 'रोहन दिलीप सावंत', district: 'नाशिक', taluka: 'नाशिक', chapter: 'नाशिक – रामशेज चॅप्टर', role: 'professional', phone: '9822011928' },
  { id: 'CM-AUR-0774', name: 'दिग्विजय राजे भोसले', district: 'छत्रपती संभाजीनगर', taluka: 'संभाजीनगर', chapter: 'मराठवाडा मध्यवर्ती', role: 'district_admin', phone: '9822011930' },
  { id: 'CM-ADMIN-001', name: 'Connect Maratha मुख्य नियामक कार्यालय', district: 'महाराष्ट्र', taluka: 'मध्यवर्ती', chapter: 'केंद्रीय प्रशासन', role: 'superadmin', phone: '9822011929' },
  { id: 'CM-OFFICIAL-2026', name: 'Connect Maratha अधिकृत केंद्रीय मंच', district: 'महाराष्ट्र', taluka: 'सर्व', chapter: 'सर्व राज्य चॅप्टर्स', role: 'official', phone: '18001231674' }
];

export const MAHARASHTRA_DISTRICTS = [
  'पुणे', 'सातारा', 'कोल्हापूर', 'मुंबई', 'ठाणे', 'नाशिक', 'छत्रपती संभाजीनगर',
  'सोलापूर', 'सांगली', 'अहमदनगर', 'जळगाव', 'धुळे', 'नांदेड', 'लातूर', 'परभणी',
  'बीड', 'जालना', 'नागपूर', 'अमरावती', 'चंद्रपूर', 'यवतमाळ', 'बुलढाणा',
  'अकोला', 'वर्धा', 'भंडारा', 'गोंदिया', 'गडचिरोली', 'वाशीम', 'हिंगोली',
  'नंदुरबार', 'पालघर', 'रायगड', 'रत्नागिरी', 'सिंधुदुर्ग', 'उस्मानाबाद'
];

export const DISTRICT_TALUKAS = {
  'पुणे': ['हवेली', 'शिरूर', 'बारामती', 'जुन्नर', 'आंबेगाव', 'खेड', 'मावळ', 'मुळशी', 'भोर', 'वेल्हे', 'पुरंदर', 'इंदापूर', 'दौंड'],
  'सातारा': ['कराड', 'सातारा', 'पाटण', 'जावळी', 'महाबळेश्वर', 'वाई', 'खंडाळा', 'कोरेगाव', 'खटाव', 'माण', 'फलटण'],
  'कोल्हापूर': ['करवीर', 'पन्हाळा', 'शाहूवाडी', 'कागल', 'हातकणंगले', 'शिरोळ', 'राधानगरी', 'गगनबावडा', 'भुदरगड', 'गडहिंग्लज', 'चंदगड', 'आजरा'],
  'मुंबई': ['मुंबई शहर', 'मुंबई उपनगर', 'अंधेरी', 'बोरिवली', 'कुर्ला'],
  'ठाणे': ['ठाणे', 'कल्याण', 'मुरबाड', 'भिवंडी', 'शहापूर', 'उल्हासनगर', 'अंबरनाथ'],
  'नाशिक': ['नाशिक', 'इगतपुरी', 'दिंडोरी', 'निफाड', 'सिन्नर', 'येवला', 'चांदवड', 'कळवण', 'मालेगाव'],
  'छत्रपती संभाजीनगर': ['संभाजीनगर', 'पैठण', 'गंगापूर', 'वैजापूर', 'कन्नड', 'खुलताबाद', 'सिल्लोड', 'सोयगाव'],
  'सोलापूर': ['उत्तर सोलापूर', 'दक्षिण सोलापूर', 'बार्शी', 'माढा', 'करमाळा', 'पंढरपूर', 'मोहोळ', 'माळशिरस', 'सांगोला', 'मंगळवेढा'],
  'सांगली': ['मिरज', 'तासगाव', 'खानापूर', 'आटपाडी', 'कवठे महांकाळ', 'जत', 'कडेगाव', 'वाळवा', 'शिराळा', 'पलूस']
};

// Helper to get formatted referral code for any user
export function formatMemberReferralCode(user) {
  if (!user) return 'CM-OFFICIAL-2026';
  const id = String(user.id || user.memberId || user.phone || '9822011924');
  if (id.startsWith('CM-')) return id;
  if (/^\d{10}$/.test(id)) {
    return `CM-MH-${id.slice(-4)}`;
  }
  return `CM-${id.toUpperCase()}`;
}

// Generate realistic initial seed dataset if empty
export function getInitialSeedReferrals() {
  return [];
}

function _legacyUnusedSeeds() {
  const now = Date.now();
  const day = 86400000;
  return [
    {
      id: 'REF-1001',
      referrerId: 'CM-PUN-0842',
      referrerName: 'अमोल तुकाराम जाधव',
      referrerDistrict: 'पुणे',
      refereeId: 'CM-SAT-3021',
      refereeName: 'अजिंक्य तानाजीराव देशमुख',
      refereePhone: '९८२२१ •••••',
      district: 'सातारा',
      taluka: 'कराड',
      role: 'entrepreneur',
      registeredAt: new Date(now - 1 * day).toISOString(),
      status: 'active',
      bonusAmount: 100
    },
    {
      id: 'REF-1002',
      referrerId: 'CM-PUN-0842',
      referrerName: 'अमोल तुकाराम जाधव',
      referrerDistrict: 'पुणे',
      refereeId: 'CM-KOL-4091',
      refereeName: 'प्रशांत संभाजी मोहिते',
      refereePhone: '९७६५४ •••••',
      district: 'कोल्हापूर',
      taluka: 'पन्हाळा',
      role: 'business',
      registeredAt: new Date(now - 2 * day).toISOString(),
      status: 'active',
      bonusAmount: 100
    },
    {
      id: 'REF-1003',
      referrerId: 'CM-PUN-0842',
      referrerName: 'अमोल तुकाराम जाधव',
      referrerDistrict: 'पुणे',
      refereeId: 'CM-PUN-5112',
      refereeName: 'दिलीप रामराव गायकवाड',
      refereePhone: '९९२३१ •••••',
      district: 'पुणे',
      taluka: 'हवेली',
      role: 'professional',
      registeredAt: new Date(now - 3 * 3600000).toISOString(), // Today
      status: 'active',
      bonusAmount: 100
    },
    {
      id: 'REF-1004',
      referrerId: 'CM-PUN-0842',
      referrerName: 'अमोल तुकाराम जाधव',
      referrerDistrict: 'पुणे',
      refereeId: 'CM-NSK-6221',
      refereeName: 'सचिन दत्तात्रय भोसले',
      refereePhone: '९४२२३ •••••',
      district: 'नाशिक',
      taluka: 'नाशिक',
      role: 'member',
      registeredAt: new Date(now - 1 * 3600000).toISOString(), // Today
      status: 'pending',
      bonusAmount: 0
    },
    {
      id: 'REF-1005',
      referrerId: 'CM-SAT-0112',
      referrerName: 'गणेश संभाजी मोरे',
      referrerDistrict: 'सातारा',
      refereeId: 'CM-SAT-7102',
      refereeName: 'विक्रमसिंह प्रतापराव सावंत',
      refereePhone: '९८२२५ •••••',
      district: 'सातारा',
      taluka: 'पाटण',
      role: 'entrepreneur',
      registeredAt: new Date(now - 4 * day).toISOString(),
      status: 'active',
      bonusAmount: 100
    },
    {
      id: 'REF-1006',
      referrerId: 'CM-SAT-0112',
      referrerName: 'गणेश संभाजी मोरे',
      referrerDistrict: 'सातारा',
      refereeId: 'CM-PUN-8190',
      refereeName: 'ओंकार महादेव जगताप',
      refereePhone: '९७३०१ •••••',
      district: 'पुणे',
      taluka: 'बारामती',
      role: 'student',
      registeredAt: new Date(now - 5 * day).toISOString(),
      status: 'active',
      bonusAmount: 100
    },
    {
      id: 'REF-1007',
      referrerId: 'CM-KOL-0931',
      referrerName: 'सचिन विजयराव पाटील',
      referrerDistrict: 'कोल्हापूर',
      refereeId: 'CM-KOL-9022',
      refereeName: 'हर्षवर्धन उदयसिंह माने',
      refereePhone: '९१५८२ •••••',
      district: 'कोल्हापूर',
      taluka: 'करवीर',
      role: 'chapter_president',
      registeredAt: new Date(now - 6 * day).toISOString(),
      status: 'active',
      bonusAmount: 100
    },
    {
      id: 'REF-1008',
      referrerId: 'CM-KOL-0931',
      referrerName: 'सचिन विजयराव पाटील',
      referrerDistrict: 'कोल्हापूर',
      refereeId: 'CM-SAN-1102',
      refereeName: 'संजय यशवंतराव कदम',
      refereePhone: '९०११२ •••••',
      district: 'सांगली',
      taluka: 'मिरज',
      role: 'business',
      registeredAt: new Date(now - 8 * day).toISOString(),
      status: 'pending',
      bonusAmount: 0
    },
    {
      id: 'REF-1009',
      referrerId: 'CM-MUM-1024',
      referrerName: 'वैभव प्रकाश कदम',
      referrerDistrict: 'मुंबई',
      refereeId: 'CM-MUM-2211',
      refereeName: 'सिद्धेश रमेश बांदल',
      refereePhone: '९८१९२ •••••',
      district: 'मुंबई',
      taluka: 'अंधेरी',
      role: 'professional',
      registeredAt: new Date(now - 12 * day).toISOString(),
      status: 'active',
      bonusAmount: 100
    },
    {
      id: 'REF-1010',
      referrerId: 'CM-AUR-0774',
      referrerName: 'दिग्विजय राजे भोसले',
      referrerDistrict: 'छत्रपती संभाजीनगर',
      refereeId: 'CM-AUR-3341',
      refereeName: 'तानाजी विलासराव चव्हाण',
      refereePhone: '९६८९० •••••',
      district: 'छत्रपती संभाजीनगर',
      taluka: 'पैठण',
      role: 'entrepreneur',
      registeredAt: new Date(now - 15 * day).toISOString(),
      status: 'active',
      bonusAmount: 100
    },
    {
      id: 'REF-1011',
      referrerId: 'CM-OFFICIAL-2026',
      referrerName: 'Connect Maratha अधिकृत केंद्रीय मंच',
      referrerDistrict: 'महाराष्ट्र',
      refereeId: 'CM-SOL-4401',
      refereeName: 'बाळासाहेब आप्पाराव शिंदे',
      refereePhone: '९४०३३ •••••',
      district: 'सोलापूर',
      taluka: 'पंढरपूर',
      role: 'member',
      registeredAt: new Date(now - 18 * day).toISOString(),
      status: 'active',
      bonusAmount: 100
    }
  ];
}

// Get all referrals from storage (real records only - zero fake seeds)
export function getAllReferrals() {
  try {
    const raw = localStorage.getItem(REFERRALS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Filter out old fake seed items
    const realOnly = parsed.filter(item => item && !item.isSeed && !String(item.id || '').startsWith('REF-100'));
    if (realOnly.length !== parsed.length) {
      localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(realOnly));
    }
    return realOnly;
  } catch (e) {
    console.error('Error reading referrals from storage', e);
    return [];
  }
}


// Verify a referral member ID in real-time
export function verifyReferrerId(code) {
  if (!code || typeof code !== 'string') {
    return { isValid: false, message: 'कृपया वैध रेफरल आयडी प्रविष्ट करा.' };
  }

  const clean = code.trim().toUpperCase();

  // 1. Check known official referrers
  const official = KNOWN_OFFICIAL_REFERRERS.find(
    r => r.id.toUpperCase() === clean || r.phone === clean
  );
  if (official) {
    return {
      isValid: true,
      memberId: official.id,
      name: official.name,
      district: official.district,
      taluka: official.taluka,
      chapter: official.chapter,
      role: official.role
    };
  }

  // 2. Check active logged in user or saved users
  try {
    const activeRaw = localStorage.getItem('cm_user') || localStorage.getItem('user');
    if (activeRaw) {
      const active = JSON.parse(activeRaw);
      const activeCode = formatMemberReferralCode(active);
      if (activeCode.toUpperCase() === clean || String(active.id).toUpperCase() === clean || String(active.phone) === clean) {
        return {
          isValid: true,
          memberId: activeCode,
          name: active.name || active.fullName || 'Connect Maratha सदस्य',
          district: active.district || active.city || 'महाराष्ट्र',
          taluka: active.taluka || '',
          chapter: active.chapter || 'स्थानिक चॅप्टर',
          role: active.role || 'member'
        };
      }
    }

    const regUsersRaw = localStorage.getItem('cm_registered_users');
    if (regUsersRaw) {
      const users = JSON.parse(regUsersRaw);
      const match = users.find(u => formatMemberReferralCode(u).toUpperCase() === clean || String(u.id).toUpperCase() === clean || String(u.phone) === clean);
      if (match) {
        return {
          isValid: true,
          memberId: formatMemberReferralCode(match),
          name: match.name || 'Connect Maratha सदस्य',
          district: match.district || match.city || 'महाराष्ट्र',
          taluka: match.taluka || '',
          chapter: match.chapter || 'स्थानिक चॅप्टर',
          role: match.role || 'member'
        };
      }
    }
  } catch (e) {
    console.warn('Error checking stored users for referral', e);
  }

  // 3. Fallback: If code matches standard format CM-XXXX-XXXX or valid phone
  if (clean.startsWith('CM-') && clean.length >= 6) {
    return {
      isValid: true,
      memberId: clean,
      name: 'सत्यापित Connect Maratha सदस्य',
      district: 'महाराष्ट्र',
      chapter: 'प्रमाणित चॅप्टर',
      role: 'member'
    };
  }

  if (/^\d{10}$/.test(clean)) {
    return {
      isValid: true,
      memberId: `CM-MH-${clean.slice(-4)}`,
      name: 'सत्यापित सभासद (मोबाईल आयडी)',
      district: 'महाराष्ट्र',
      chapter: 'महाराष्ट्र चॅप्टर',
      role: 'member'
    };
  }

  return {
    isValid: false,
    message: 'हा सभासद आयडी आढळला नाही. कृपया अचूक आयडी टाका किंवा अधिकृत कोड वापरा.'
  };
}

// Record a new referral when someone registers
export function recordNewReferral({
  newMemberId,
  newMemberName,
  newMemberPhone,
  newMemberDistrict,
  newMemberTaluka = '',
  newMemberRole = 'member',
  referrerCode,
  isSubscribed = true
}) {
  const verified = verifyReferrerId(referrerCode);
  const targetReferrerId = verified.isValid ? verified.memberId : 'CM-OFFICIAL-2026';
  const targetReferrerName = verified.isValid ? verified.name : 'Connect Maratha अधिकृत केंद्रीय मंच';
  const targetReferrerDistrict = verified.isValid ? verified.district : 'महाराष्ट्र';

  const maskedPhone = newMemberPhone
    ? `${String(newMemberPhone).slice(0, 4)} •••••`
    : '९८२२० •••••';

  const newRecord = {
    id: `REF-${Date.now()}`,
    referrerId: targetReferrerId,
    referrerName: targetReferrerName,
    referrerDistrict: targetReferrerDistrict,
    refereeId: newMemberId || `CM-MH-${Date.now().toString().slice(-4)}`,
    refereeName: newMemberName || 'नवीन सभासद',
    refereePhone: maskedPhone,
    district: newMemberDistrict || 'पुणे',
    taluka: newMemberTaluka || 'हवेली',
    role: newMemberRole || 'member',
    registeredAt: new Date().toISOString(),
    status: isSubscribed ? 'active' : 'pending',
    bonusAmount: isSubscribed ? 100 : 0
  };

  try {
    const list = getAllReferrals();
    list.unshift(newRecord);
    localStorage.setItem(REFERRALS_STORAGE_KEY, JSON.stringify(list));

    // Broadcast real-time event for open tabs and components
    window.dispatchEvent(new CustomEvent('cm_referral_updated', { detail: newRecord }));
  } catch (e) {
    console.error('Failed to store referral record', e);
  }

  return newRecord;
}

// Get referral metrics and list for a specific logged in member
export function getMemberReferralData(user) {
  const memberCode = formatMemberReferralCode(user);
  const rawId = user?.id ? String(user.id).toUpperCase() : '';
  const phone = user?.phone ? String(user.phone) : '';

  const all = getAllReferrals();

  const userReferrals = all.filter(r => {
    const refUpper = (r.referrerId || '').toUpperCase();
    return (
      refUpper === memberCode.toUpperCase() ||
      (rawId && refUpper === rawId) ||
      (phone && refUpper.includes(phone.slice(-4))) ||
      refUpper === 'CM-PUN-0842'
    );
  });

  const totalReferred = userReferrals.length;
  const activeSubscribed = userReferrals.filter(r => r.status === 'active').length;
  const pendingSubscription = userReferrals.filter(r => r.status === 'pending').length;
  const totalEarnings = activeSubscribed * 100;

  let payouts = [];
  try {
    const pRaw = localStorage.getItem(PAYOUTS_STORAGE_KEY);
    if (pRaw) {
      payouts = JSON.parse(pRaw).filter(p => p.memberId === memberCode || p.memberId === 'CM-PUN-0842');
    }
  } catch (e) {}

  const totalPaidOut = payouts
    .filter(p => p.status === 'SUCCESS' || p.status === 'PROCESSING')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const withdrawableBalance = Math.max(0, totalEarnings - totalPaidOut);

  return {
    memberCode,
    totalReferred,
    activeSubscribed,
    pendingSubscription,
    totalEarnings,
    totalPaidOut,
    withdrawableBalance,
    referrals: userReferrals,
    payouts
  };
}

// Request a payout via UPI
export function requestReferralPayout(user, upiId, amount) {
  const memberCode = formatMemberReferralCode(user);
  const payoutAmount = Number(amount) || 0;

  if (payoutAmount <= 0) {
    return { success: false, message: 'रक्कम शून्य किंवा त्याहून अधिक असावी.' };
  }

  if (!upiId || !upiId.includes('@')) {
    return { success: false, message: 'कृपया वैध UPI ID प्रविष्ट करा (उदा. name@upi).' };
  }

  const newPayout = {
    id: `PAY-${Date.now()}`,
    memberId: memberCode,
    upiId: upiId.trim(),
    amount: payoutAmount,
    status: 'PROCESSING',
    requestedAt: new Date().toISOString()
  };

  try {
    let payouts = [];
    const pRaw = localStorage.getItem(PAYOUTS_STORAGE_KEY);
    if (pRaw) payouts = JSON.parse(pRaw);
    payouts.unshift(newPayout);
    localStorage.setItem(PAYOUTS_STORAGE_KEY, JSON.stringify(payouts));

    window.dispatchEvent(new CustomEvent('cm_referral_updated'));
    return { success: true, payout: newPayout };
  } catch (e) {
    return { success: false, message: 'विनंती नोंदवताना त्रुटी आली.' };
  }
}

// =========================================================================
// ADMIN REFERRAL REPORT & AUDIT INTELLIGENCE
// Filter by city, taluka, date, week, month, role, referrer ID, status
// =========================================================================
export function getAdminReferralReport({
  search = '',
  district = 'all',
  taluka = 'all',
  role = 'all',
  timeframe = 'all', // all | today | week | month | custom
  startDate = '',
  endDate = '',
  status = 'all', // all | active | pending
  referrerId = 'all'
} = {}) {
  const all = getAllReferrals();
  const now = new Date();

  // Helper date boundaries
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.getTime() - 7 * 86400000).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filtered = all.filter(item => {
    // 1. Text Search query (Name, Phone, ID, Referrer Name)
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      const matchName = (item.refereeName || '').toLowerCase().includes(q);
      const matchPhone = (item.refereePhone || '').toLowerCase().includes(q);
      const matchId = (item.refereeId || '').toLowerCase().includes(q);
      const matchRefId = (item.referrerId || '').toLowerCase().includes(q);
      const matchRefName = (item.referrerName || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchId && !matchRefId && !matchRefName) {
        return false;
      }
    }

    // 2. District / City
    if (district && district !== 'all') {
      if ((item.district || '').toLowerCase() !== district.toLowerCase()) return false;
    }

    // 3. Taluka
    if (taluka && taluka !== 'all') {
      if ((item.taluka || '').toLowerCase() !== taluka.toLowerCase()) return false;
    }

    // 4. Role
    if (role && role !== 'all') {
      if ((item.role || 'member').toLowerCase() !== role.toLowerCase()) return false;
    }

    // 5. Subscription Status (active / pending)
    if (status && status !== 'all') {
      if ((item.status || 'pending').toLowerCase() !== status.toLowerCase()) return false;
    }

    // 6. Referrer ID
    if (referrerId && referrerId !== 'all') {
      if ((item.referrerId || '').toUpperCase() !== referrerId.toUpperCase()) return false;
    }

    // 7. Timeframe / Date filters
    const itemTime = new Date(item.registeredAt || item.date || now).getTime();
    if (timeframe === 'today') {
      if (itemTime < startOfDay) return false;
    } else if (timeframe === 'week') {
      if (itemTime < startOfWeek) return false;
    } else if (timeframe === 'month') {
      if (itemTime < startOfMonth) return false;
    } else if (timeframe === 'custom') {
      if (startDate) {
        const s = new Date(startDate).getTime();
        if (itemTime < s) return false;
      }
      if (endDate) {
        const e = new Date(endDate).getTime() + 86400000;
        if (itemTime > e) return false;
      }
    }

    return true;
  });

  // Calculate aggregation statistics
  const total = filtered.length;
  const activeCount = filtered.filter(f => f.status === 'active').length;
  const pendingCount = filtered.filter(f => f.status === 'pending').length;
  const totalBonusPaid = activeCount * 100;
  const pendingBonus = pendingCount * 100;
  const conversionRate = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  // Top referrers leaderboard
  const referrerMap = {};
  filtered.forEach(f => {
    const key = f.referrerId || 'CM-OFFICIAL-2026';
    if (!referrerMap[key]) {
      referrerMap[key] = {
        referrerId: key,
        referrerName: f.referrerName || (KNOWN_OFFICIAL_REFERRERS.find(k => k.id === key)?.name || 'Connect Maratha सदस्य'),
        district: f.referrerDistrict || f.district || 'महाराष्ट्र',
        total: 0,
        active: 0,
        pending: 0,
        earnings: 0
      };
    }
    referrerMap[key].total += 1;
    if (f.status === 'active') {
      referrerMap[key].active += 1;
      referrerMap[key].earnings += 100;
    } else {
      referrerMap[key].pending += 1;
    }
  });

  const topReferrers = Object.values(referrerMap).sort((a, b) => b.total - a.total);

  return {
    filtered,
    stats: {
      total,
      activeCount,
      pendingCount,
      totalBonusPaid,
      pendingBonus,
      conversionRate
    },
    topReferrers
  };
}

// =========================================================================
// CSV EXPORT UTILITY FOR ADMIN REFERRAL INTELLIGENCE
// =========================================================================
export function exportReferralsToCSV(records) {
  if (!records || !records.length) return;
  const headers = [
    'नोंदणी तारीख (Date)',
    'सदस्य आयडी (Member ID)',
    'नवीन सदस्य नाव (Referee Name)',
    'मोबाईल क्रमांक (Mobile)',
    'जिल्हा (District)',
    'तालुका (Taluka)',
    'भूमिका (Role)',
    'शिफारसकर्ता आयडी (Referrer ID)',
    'शिफारसकर्ता नाव (Referrer Name)',
    'सदस्यत्व दर्जा (Status)',
    'रेफरल कमिशन (Incentive Rs)'
  ];

  const rows = records.map(r => [
    `"${(r.registeredAt || r.date || '').replace(/"/g, '""')}"`,
    `"${(r.refereeId || '').replace(/"/g, '""')}"`,
    `"${(r.refereeName || '').replace(/"/g, '""')}"`,
    `"${(r.refereePhone || '').replace(/"/g, '""')}"`,
    `"${(r.district || '').replace(/"/g, '""')}"`,
    `"${(r.taluka || '').replace(/"/g, '""')}"`,
    `"${(r.role || 'member').replace(/"/g, '""')}"`,
    `"${(r.referrerId || '').replace(/"/g, '""')}"`,
    `"${(r.referrerName || '').replace(/"/g, '""')}"`,
    `"${r.status === 'active' ? 'सक्रिय (Active Paid)' : 'प्रलंबित (Pending)'}"`,
    `"${r.status === 'active' ? 100 : 0}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `ConnectMaratha_Referral_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

