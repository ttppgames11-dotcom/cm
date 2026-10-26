import { all, runQuery, get } from '../database/database.js';

async function seedHierarchy() {
  const l1Members = [
    { id: 'M-L1-001', name: 'अमोल तुकाराम जाधव', phone: '9822100001', email: 'amol.jadhav@example.com', district: 'पुणे', taluka: 'हवेली', tier: 'Gold', status: 'Active', joined: '2026-09-10', referred_by: 'M474782' },
    { id: 'M-L1-002', name: 'गणेश संभाजी मोरे', phone: '9822100002', email: 'ganesh.more@example.com', district: 'सातारा', taluka: 'कराड', tier: 'Platinum', status: 'Active', joined: '2026-09-15', referred_by: 'M474782' },
    { id: 'M-L1-003', name: 'सचिन विजयराव पाटील', phone: '9822100003', email: 'sachin.patil@example.com', district: 'कोल्हापूर', taluka: 'करवीर', tier: 'Silver', status: 'Active', joined: '2026-09-22', referred_by: 'M474782' }
  ];

  const l2Members = [
    { id: 'M-L2-101', name: 'राहुल विलासराव मोरे', phone: '9822100011', email: 'rahul.more@example.com', district: 'पुणे', taluka: 'शिरूर', tier: 'Gold', status: 'Active', joined: '2026-09-28', referred_by: 'M-L1-001' },
    { id: 'M-L2-102', name: 'विकास भानुदास शिंदे', phone: '9822100012', email: 'vikas.shinde@example.com', district: 'पुणे', taluka: 'बारामती', tier: 'Gold', status: 'Active', joined: '2026-10-02', referred_by: 'M-L1-001' },
    { id: 'M-L2-201', name: 'सौ. सुप्रिया प्रशांत देशमुख', phone: '9822100021', email: 'supriya.d@example.com', district: 'सातारा', taluka: 'फलटण', tier: 'Silver', status: 'Active', joined: '2026-10-05', referred_by: 'M-L1-002' },
    { id: 'M-L2-301', name: 'अजिंक्य तानाजी सावंत', phone: '9822100031', email: 'ajinkya.s@example.com', district: 'कोल्हापूर', taluka: 'हातकणंगले', tier: 'Gold', status: 'Active', joined: '2026-10-08', referred_by: 'M-L1-003' }
  ];

  const l3Members = [
    { id: 'M-L3-501', name: 'दिगंबर महादेव कदम', phone: '9822100051', email: 'digambar.k@example.com', district: 'पुणे', taluka: 'दौंड', tier: 'Basic', status: 'Active', joined: '2026-10-12', referred_by: 'M-L2-101' },
    { id: 'M-L3-502', name: 'अनिकेत बाबासाहेब जगताप', phone: '9822100052', email: 'aniket.j@example.com', district: 'सातारा', taluka: 'कोरेगाव', tier: 'Gold', status: 'Active', joined: '2026-10-14', referred_by: 'M-L2-201' }
  ];

  const allToSeed = [...l1Members, ...l2Members, ...l3Members];

  for (const m of allToSeed) {
    await runQuery(
      `INSERT INTO members (id, name, phone, email, district, taluka, tier, status, joined, referred_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET 
         name = excluded.name, 
         phone = excluded.phone,
         referred_by = excluded.referred_by`,
      [m.id, m.name, m.phone, m.email, m.district, m.taluka, m.tier, m.status, m.joined, m.referred_by]
    );

    await runQuery(
      `INSERT INTO member_referrals (id, referrer_id, referrer_name, referrer_phone, referee_id, referee_name, referee_phone, district, taluka, status, bonus_amount, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 100, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET referrer_id = excluded.referrer_id`,
      [`REF-${m.id}`, m.referred_by, 'Connect Maratha Referrer', '', m.id, m.name, m.phone, m.district, m.taluka]
    );
  }

  console.log('Successfully seeded 3-tier hierarchy members!');
}

seedHierarchy();
