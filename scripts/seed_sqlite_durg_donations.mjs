import { runQuery, get, all, saveDatabaseNow } from '../database/database.js';
import { migrateDurgDonationsTables } from './migrate_durg_donations.mjs';

async function seedDurgDonationsData() {
  await migrateDurgDonationsTables();

  console.log('Seeding rich authentic Durg Sanvardhan and Donations data into SQLite...');

  // 1. Durg Projects
  const projects = [
    {
      id: 'DURG-01',
      fort_name: 'दुर्गराज रायगड',
      title: 'रायगड महादरवाजा तटबंदी जीर्णोद्धार व ऐतिहासिक पाण्याचे तलाव स्वच्छता मोहीम',
      district: 'रायगड',
      taluka: 'महाड',
      category: 'तटबंदी व बुरुज संवर्धन',
      target_amount: 2500000,
      collected_amount: 1845000,
      spent_amount: 1220000,
      donors_count: 684,
      volunteers_count: 320,
      phase: 'काम प्रगतीपथावर (Phase 2)',
      completion_percentage: 74,
      cover_image: '/assets/images/real-raigad-panoramic.jpg',
      description: 'शिवराज्याभिषेकाची राजधानी दुर्गराज रायगडावरील महादरवाजा परिसरातील ढासळलेली दगडी तटबंदी पारंपारिक चुना व गुळाच्या मिश्रणात पुनरुज्जीवित करणे. सोबत गंगासागर व हत्ती तलावातील गाळ उपसून स्वच्छ पाण्याची पुनर्स्थापना करणे.',
      asi_approval_ref: 'ASI/MUM/RAIGAD/2026/894-B',
      lead_organization: 'श्री शिवाजी रायगड स्मारक मंडळ व दुर्गवीर',
      coordinator_name: 'संभाजीराव कदम (महाड)',
      coordinator_phone: '9822114400',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'DURG-02',
      fort_name: 'किल्ले सिंहगड',
      title: 'तानाजी कडा सुरक्षा कठडे, कल्याण दरवाजा पुनरुत्थान व माहिती फलक प्रकल्प',
      district: 'पुणे',
      taluka: 'हवेली',
      category: 'माहिती फलक व दिशादर्शक',
      target_amount: 1500000,
      collected_amount: 1120000,
      spent_amount: 810000,
      donors_count: 495,
      volunteers_count: 210,
      phase: 'अंतिम टप्पा (Phase 3)',
      completion_percentage: 82,
      cover_image: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=1200&q=80',
      description: 'नरवीर तानाजी मालुसरे यांच्या पराक्रमाची साक्ष देणाऱ्या तानाजी कड्यावर सुरक्षितता कठडे उभारणे. किल्ल्यावरील ऐतिहासिक पायऱ्यांची दुरुस्ती आणि प्रत्येक ऐतिहासिक जागेवर QR कोडयुक्त माहिती फलक बसवणे.',
      asi_approval_ref: 'MS-ARCH/PUN/SINH/2026/112',
      lead_organization: 'सह्याद्री प्रतिष्ठान व पुणे गिर्यारोहक संघ',
      coordinator_name: 'विक्रम तानाजी भोसले',
      coordinator_phone: '9850332211',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'DURG-03',
      fort_name: 'किल्ले राजगड',
      title: 'पद्मावती माची पाण्याची टाकी पुनरुज्जीवन व तोरणा-राजगड ऐतिहासिक मार्ग संवर्धन',
      district: 'पुणे',
      taluka: 'वेल्हे',
      category: 'पाण्याची टाकी व पायऱ्या स्वच्छता',
      target_amount: 1800000,
      collected_amount: 950000,
      spent_amount: 540000,
      donors_count: 360,
      volunteers_count: 180,
      phase: 'सुरुवात (Phase 1)',
      completion_percentage: 52,
      cover_image: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=80',
      description: 'शिवरायांच्या पहिल्या राजधानीतील पद्मावती तलावातील जलसाठा गाळमुक्त करून पिण्यायोग्य करणे. सुवेळा माची व संजीवनी माचीवरील कोसळलेल्या दगडी जिन्यांची पुनर्बांधणी.',
      asi_approval_ref: 'ASI/MUM/RAJGAD/2026/410',
      lead_organization: 'वेल्हे दुर्ग संवर्धन समिती',
      coordinator_name: 'अमोल मोहिते (वेल्हे)',
      coordinator_phone: '9822445588',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'DURG-04',
      fort_name: 'जलदुर्ग सिंधुदुर्ग',
      title: 'सिंधुदुर्ग छत्रपती मंदिर संवर्धन व सागरी लाटांपासून संरक्षण भिंत मजबुतीकरण',
      district: 'सिंधुदुर्ग',
      taluka: 'मालवण',
      category: 'तटबंदी व बुरुज संवर्धन',
      target_amount: 3000000,
      collected_amount: 2150000,
      spent_amount: 1650000,
      donors_count: 820,
      volunteers_count: 140,
      phase: 'प्रगतीपथावर (Phase 2)',
      completion_percentage: 71,
      cover_image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
      description: 'अरबी समुद्रातील अजिंक्य जलदुर्ग सिंधुदुर्गच्या तटबंदीच्या खाऱ्या पाण्याच्या माऱ्याने क्षीण झालेल्या दगडांची शास्त्रीय डागडुजी आणि शिवकालीन मंदिराचे छत संवर्धन.',
      asi_approval_ref: 'ASI/GOA-MUM/SINDHU/2026/099',
      lead_organization: 'कोकण दुर्ग संवर्धन परिषद',
      coordinator_name: 'प्रमोद सावंत (मालवण)',
      coordinator_phone: '9867112233',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];

  for (const prj of projects) {
    const existing = await get('SELECT id FROM durg_projects WHERE id = ?', [prj.id]);
    if (!existing) {
      await runQuery(`
        INSERT INTO durg_projects (
          id, fort_name, title, district, taluka, category, target_amount, collected_amount,
          spent_amount, donors_count, volunteers_count, phase, completion_percentage, cover_image,
          description, asi_approval_ref, lead_organization, coordinator_name, coordinator_phone,
          status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prj.id, prj.fort_name, prj.title, prj.district, prj.taluka, prj.category, prj.target_amount, prj.collected_amount,
        prj.spent_amount, prj.donors_count, prj.volunteers_count, prj.phase, prj.completion_percentage, prj.cover_image,
        prj.description, prj.asi_approval_ref, prj.lead_organization, prj.coordinator_name, prj.coordinator_phone,
        prj.status, prj.created_at
      ]);
    }
  }

  // 2. Project Expenses & Audited Vouchers
  const sampleExpenses = [
    {
      id: 'EXP-101',
      project_id: 'DURG-01',
      voucher_number: 'VCH-RAIGAD-081',
      expense_title: 'पारंपरिक चुना, गूळ व वाळू मिश्रण सामग्री खरेदी',
      vendor_name: 'महाड हेरिटेज कन्स्ट्रक्शन सप्लायर्स',
      amount: 145000,
      category: 'बांधकाम साहित्य व चुना',
      invoice_ref: 'INV-2026-904',
      payment_mode: 'Bank Transfer (NEFT)',
      approved_by: 'सीए आनंदराव जोशी (लेखा परीक्षक)',
      approval_date: '२०२६-०९-१४',
      audit_status: 'Verified (Audited)',
      notes: 'महादरवाजा पायऱ्या व तटबंदी जोडकामासाठी प्रमाणित चुना.',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'EXP-102',
      project_id: 'DURG-01',
      voucher_number: 'VCH-RAIGAD-082',
      expense_title: 'स्थानिक कुशल कारागीर व दगड घडवणारे मजूर वेतन (१५ दिवस)',
      vendor_name: 'सह्याद्री कारागीर गट, महाड',
      amount: 98000,
      category: 'मजूर व कारागीर',
      invoice_ref: 'WAGE-SHEET-89',
      payment_mode: 'Direct Bank Transfer',
      approved_by: 'संभाजीराव कदम (प्रकल्प प्रमुख)',
      approval_date: '२०२६-०९-२०',
      audit_status: 'Verified (Audited)',
      notes: '८ अनुभवी पाथरवट व १२ मदतनीस यांचे दैनिक भत्ते.',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'EXP-103',
      project_id: 'DURG-02',
      voucher_number: 'VCH-SINH-045',
      expense_title: 'स्टेनलेस स्टील सुरक्षितता रेलिंग व सुरक्षा जाळी',
      vendor_name: 'सह्याद्री स्टील वर्क्स, हवेली पुणे',
      amount: 85000,
      category: 'सुरक्षा रेलिंग',
      invoice_ref: 'INV-SS-118',
      payment_mode: 'Bank Transfer (NEFT)',
      approved_by: 'विक्रम तानाजी भोसले (समन्वयक)',
      approval_date: '२०२६-०९-२२',
      audit_status: 'Verified (Audited)',
      notes: 'तानाजी कडा व्ह्यू पॉईंटसाठी अपघात प्रतिबंधक सुरक्षा जाळी.',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ];

  for (const exp of sampleExpenses) {
    const existing = await get('SELECT id FROM durg_expenses WHERE id = ?', [exp.id]);
    if (!existing) {
      await runQuery(`
        INSERT INTO durg_expenses (
          id, project_id, voucher_number, expense_title, vendor_name, amount, category,
          invoice_ref, payment_mode, approved_by, approval_date, audit_status, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        exp.id, exp.project_id, exp.voucher_number, exp.expense_title, exp.vendor_name, exp.amount, exp.category,
        exp.invoice_ref, exp.payment_mode, exp.approved_by, exp.approval_date, exp.audit_status, exp.notes, exp.created_at
      ]);
    }
  }

  // 3. Fort Volunteers
  const sampleVolunteers = [
    {
      id: 'VOL-01',
      project_id: 'DURG-01',
      fort_name: 'दुर्गराज रायगड',
      volunteer_name: 'अमित संभाजी कदम',
      phone: '9822119900',
      district: 'पुणे',
      blood_group: 'O+',
      trek_experience: 'अनुभवी गिर्यारोहक (Expert)',
      participated_camps: 8,
      skills: 'प्रथमोपचार व रोप क्लायंबिंग',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'VOL-02',
      project_id: 'DURG-02',
      fort_name: 'किल्ले सिंहगड',
      volunteer_name: 'रोहित बाजीराव शिंदे',
      phone: '9850223344',
      district: 'सातारा',
      blood_group: 'B+',
      trek_experience: 'मध्यम (Moderate)',
      participated_camps: 4,
      skills: 'इतिहास फलक मांडणी व स्वच्छता',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];

  for (const v of sampleVolunteers) {
    const existing = await get('SELECT id FROM durg_volunteers WHERE id = ?', [v.id]);
    if (!existing) {
      await runQuery(`
        INSERT INTO durg_volunteers (
          id, project_id, fort_name, volunteer_name, phone, district, blood_group,
          trek_experience, participated_camps, skills, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        v.id, v.project_id, v.fort_name, v.volunteer_name, v.phone, v.district, v.blood_group,
        v.trek_experience, v.participated_camps, v.skills, v.status, v.created_at
      ]);
    }
  }

  // 4. Financial Audit Record
  const auditExisting = await get('SELECT id FROM donation_audits WHERE id = ?', ['AUDIT-2026']);
  if (!auditExisting) {
    await runQuery(`
      INSERT INTO donation_audits (
        id, financial_year, ca_firm_name, ca_membership_no, total_receipts, total_expenditure,
        surplus_balance, audit_report_url, certificate_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'AUDIT-2026',
      '२०२५-२०२६ (Audit Completed)',
      'एम. एस. जोशी अँड असोसिएट्स (Chartered Accountants, पुणे)',
      'ICAI Reg No: 104238W / M.No 048291',
      7845000,
      5620000,
      2225000,
      '/assets/documents/audit-report-2026.pdf',
      'Clean & Unqualified - 100% Tax Compliant (80G)',
      new Date().toISOString()
    ]);
  }

  saveDatabaseNow();
  console.log('✓ Durg Sanvardhan & Donations data seeded successfully!');
}

seedDurgDonationsData().catch(err => {
  console.error('Error seeding durg data:', err);
  process.exit(1);
});
