import { runQuery, saveDatabaseNow } from '../database/database.js';

export async function seedOrganizationsData() {
  console.log('Seeding authentic Maratha Organizations into SQLite...');

  const now = new Date().toISOString();

  // Clear pre-existing
  await runQuery('DELETE FROM organizations');
  await runQuery('DELETE FROM org_office_bearers');
  await runQuery('DELETE FROM org_events');
  await runQuery('DELETE FROM org_collaborations');
  await runQuery('DELETE FROM org_work_reports');

  // 1. Core Organizations
  const orgs = [
    {
      id: 'ORG-01',
      name: 'अखिल भारतीय मराठा महासंघ',
      category: 'सामाजिक',
      type: 'महासंघ (Federation)',
      reg_no: 'MAH/MUM/F-1234/1981',
      pan_number: 'AAATA1981M',
      tax_80g_12a: '12A & 80G Certified',
      established: '१९८१',
      hq: 'दादर, मुंबई / पुणे',
      district: 'मुंबई',
      taluka: 'मुंबई शहर',
      presence: 'राष्ट्रीय (अखिल भारत व ३६ जिल्हे)',
      members: '३५ लाख+ सदस्य',
      members_count: 3500000,
      focus: 'मराठा आरक्षण, आर्थिक व शैक्षणिक हक्क, समाज प्रबोधन व सर्वसमावेशक न्याय हक्क लढा.',
      description: 'कै. शशिकांत पवार व मावळ्यांनी स्थापन केलेली देशातील सर्वात मोठी व ऐतिहासिक मराठा शिखर संघटना. महाराष्ट्रभर शाखा व कायदेशीर हक्क संरक्षण कक्ष.',
      icon: '🚩',
      cover_image: '/assets/images/real-raigad-panoramic.jpg',
      contact: '022-24301674',
      email: 'contact@marathamahasangh.org',
      website: 'www.marathamahasangh.org',
      president_name: 'अ‍ॅड. शशिकांत पवार (संस्थापक मार्गदर्शक) / दिलीप जगताप',
      president_phone: '9822016740',
      secretary_name: 'राजेंद्र कोंढरे',
      secretary_phone: '9822055667',
      verification_status: 'सत्यापित (Verified)',
      is_verified: 1,
      doc_reg_certificate: 'CERT-MAHASANGH-81.pdf',
      doc_audited_balance_sheet: 'AUDIT-MAHASANGH-2025.pdf',
      activity_score: 98,
      created_at: now
    },
    {
      id: 'ORG-02',
      name: 'मराठा क्रांती मोर्चा समन्वय समिती',
      category: 'सामाजिक',
      type: 'मंडळ / प्रतिष्ठान (Foundation)',
      reg_no: 'PUN/SOC/2016-MKM',
      pan_number: 'AABTM2016K',
      tax_80g_12a: '80G Registered',
      established: '२०१६',
      hq: 'पुणे, महाराष्ट्र',
      district: 'पुणे',
      taluka: 'हवेली',
      presence: 'राज्यव्यापी (३६ जिल्हे)',
      members: '५८ मूक मोर्चे समन्वयक',
      members_count: 5000000,
      focus: 'मराठा आरक्षण न्यायालयीन पाठपुरावा, सारथी संस्था स्वायत्तता, वसतिगृहे व विद्यार्थी हक्क.',
      description: 'जगातील ऐतिहासिक ५८ शिस्तबद्ध मूक मोर्चे आयोजित करणारी राज्यव्यापी समन्वय समिती. सारथी, अण्णासाहेब पाटील महामंडळ व शैक्षणिक योजनांचे सनियंत्रण.',
      icon: '✊',
      cover_image: '/assets/images/real-raigad-panoramic.jpg',
      contact: '9822055443',
      email: 'samnvay@marathakrantimorcha.org',
      website: 'www.marathakrantimorcha.org',
      president_name: 'संभाजीराव कदम (मुख्य समन्वयक)',
      president_phone: '9822055443',
      secretary_name: 'अतुल लोंढे / नानासाहेब कुटे',
      secretary_phone: '9822188991',
      verification_status: 'सत्यापित (Verified)',
      is_verified: 1,
      doc_reg_certificate: 'CERT-MKM-16.pdf',
      doc_audited_balance_sheet: 'AUDIT-MKM-2025.pdf',
      activity_score: 96,
      created_at: now
    },
    {
      id: 'ORG-03',
      name: 'मराठा सेवा संघ (जिजाऊ ब्रिगेड व संभाजी ब्रिगेड)',
      category: 'सामाजिक',
      type: 'नोंदणीकृत ट्रस्ट (Trust)',
      reg_no: 'MAH/AUR/F-4589/1990',
      pan_number: 'AAATM1990S',
      tax_80g_12a: '12A & 80G Certified',
      established: '१९९०',
      hq: 'छत्रपती संभाजीनगर, महाराष्ट्र',
      district: 'छत्रपती संभाजीनगर',
      taluka: 'संभाजीनगर',
      presence: 'राष्ट्रीय (अखिल भारत व ३६ जिल्हे)',
      members: '१५ लाख+ सदस्य',
      members_count: 1500000,
      focus: 'शिव-शाहू-फुले-आंबेडकर विचारप्रसार, जिजाऊ जन्मोत्सव सिंदखेडराजा, संभाजी ब्रिगेड युवा आघाडी.',
      description: 'पुरुषोत्तम खेडेकर प्रणित वैचारिक व सामाजिक प्रबोधन चळवळ. ३२ कक्ष (जिजाऊ ब्रिगेड, संभाजी ब्रिगेड, मराठा ब्रिगेड, वीर भगतसिंग विद्यार्थी परिषद).',
      icon: '⚔️',
      cover_image: '/assets/images/library.jpg',
      contact: '0240-2334455',
      email: 'central@marathasevasangh.in',
      website: 'www.marathasevasangh.in',
      president_name: 'कामाजी पवार (केंद्रीय अध्यक्ष)',
      president_phone: '9422033445',
      secretary_name: 'सुभाष जाधव',
      secretary_phone: '9422066778',
      verification_status: 'सत्यापित (Verified)',
      is_verified: 1,
      doc_reg_certificate: 'CERT-MSS-90.pdf',
      doc_audited_balance_sheet: 'AUDIT-MSS-2025.pdf',
      activity_score: 94,
      created_at: now
    },
    {
      id: 'ORG-04',
      name: 'श्री शिवाजी शिक्षण प्रसारक मंडळ',
      category: 'शैक्षणिक',
      type: 'सोसायटी (Society)',
      reg_no: 'AMT/EDU/1962/F-99',
      pan_number: 'AAASS1962E',
      tax_80g_12a: '100% Tax Exemption 80G',
      established: '१९६२',
      hq: 'अमरावती, विदर्भ',
      district: 'अमरावती',
      taluka: 'अमरावती',
      presence: 'विदर्भ व मराठवाडा (८ जिल्हे)',
      members: '१२०+ शाळा, महाविद्यालये व कृषी संस्था',
      members_count: 250000,
      focus: 'शेतकरी कुटुंबातील विद्यार्थ्यांना दर्जेदार तांत्रिक, वैद्यकीय, कृषी व उच्च शिक्षण.',
      description: 'डॉ. पंजाबराव देशमुख यांच्या शिक्षण क्रांतीच्या प्रेरणेने चालवली जाणारी पश्चिम विदर्भातील अग्रगण्य मराठा शैक्षणिक संस्था.',
      icon: '🎓',
      cover_image: '/assets/images/library.jpg',
      contact: '0721-2563344',
      email: 'info@shivajiedu.ac.in',
      website: 'www.shivajiedu.ac.in',
      president_name: 'हर्षवर्धन देशमुख',
      president_phone: '9422156334',
      secretary_name: 'डॉ. महेंद्र ढोरे',
      secretary_phone: '9422177889',
      verification_status: 'सत्यापित (Verified)',
      is_verified: 1,
      doc_reg_certificate: 'CERT-SSES-62.pdf',
      doc_audited_balance_sheet: 'AUDIT-SSES-2025.pdf',
      activity_score: 92,
      created_at: now
    },
    {
      id: 'ORG-05',
      name: 'सह्याद्री प्रतिष्ठान (महाराष्ट्र राज्य)',
      category: 'इतिहास व दुर्ग',
      type: 'मंडळ / प्रतिष्ठान (Foundation)',
      reg_no: 'MAH/PUN/F-3342/2010',
      pan_number: 'AAATS2010D',
      tax_80g_12a: '80G Approved',
      established: '२०१०',
      hq: 'पुणे / रायगड',
      district: 'पुणे',
      taluka: 'पुणे शहर',
      presence: 'राज्यव्यापी (३६ जिल्हे)',
      members: '७५,०००+ गड संवर्धन मावळे',
      members_count: 75000,
      focus: 'सह्याद्रीतील गडकोट संवर्धन, तोफांचे जतन, स्वच्छता मोहीम, ऐतिहासिक शस्त्र प्रदर्शन.',
      description: 'श्रमिक मावळ्यांचे गडकोट संवर्धन आंदोलन. १००+ गडकिल्ल्यांवर प्रत्यक्ष श्रमदान शिबिरे व शिवकालीन ऐतिहासिक शस्त्र जतन कार्य.',
      icon: '🏰',
      cover_image: '/assets/images/real-raigad-panoramic.jpg',
      contact: '9822011234',
      email: 'sahyadri@gadkot.org',
      website: 'www.sahyadripratishthan.org',
      president_name: 'श्रमिक गोजमगुंडे (संस्थापक)',
      president_phone: '9822011234',
      secretary_name: 'गणेश कदम',
      secretary_phone: '9822044556',
      verification_status: 'सत्यापित (Verified)',
      is_verified: 1,
      doc_reg_certificate: 'CERT-SAHYADRI-10.pdf',
      doc_audited_balance_sheet: 'AUDIT-SAHYADRI-2025.pdf',
      activity_score: 95,
      created_at: now
    },
    {
      id: 'ORG-06',
      name: 'मराठा चेंबर ऑफ कॉमर्स, इंडस्ट्रीज अँड ॲग्रिकल्चर (MCCIA - मराठा विंग)',
      category: 'उद्योग व सहकार',
      type: 'नोंदणीकृत ट्रस्ट (Trust)',
      reg_no: 'MAH/PUN/B-998/1934',
      pan_number: 'AAATC1934C',
      tax_80g_12a: '12A & 80G Certified',
      established: '१९३४',
      hq: 'सेनापती बापट रस्ता, पुणे',
      district: 'पुणे',
      taluka: 'हवेली',
      presence: 'राज्यव्यापी व आंतरराष्ट्रीय',
      members: '४,०००+ मराठा उद्योजक व कारखाने',
      members_count: 45000,
      focus: 'मराठा नवउद्योजक मार्गदर्शन, B2B व्यापार संगम, स्टार्टअप इन्क्युबेशन व जागतिक निर्यात.',
      description: 'महाराष्ट्रातील उद्योजक व कृषी प्रक्रिया उद्योगांना एकत्र आणून आंतरराष्ट्रीय पातळीवर व्यापार संधी उपलब्ध करून देणारी शिखर संस्था.',
      icon: '💼',
      cover_image: '/assets/images/real-farmer-field.jpg',
      contact: '020-25709000',
      email: 'b2b@marathachamber.org',
      website: 'www.marathachamber.org',
      president_name: 'प्रशांत गिरबने (महासंचालक) / विक्रमसिंह शिंदे',
      president_phone: '9822090001',
      secretary_name: 'आनंदराव देशमुख',
      secretary_phone: '9822090002',
      verification_status: 'सत्यापित (Verified)',
      is_verified: 1,
      doc_reg_certificate: 'CERT-MCCIA-34.pdf',
      doc_audited_balance_sheet: 'AUDIT-MCCIA-2025.pdf',
      activity_score: 91,
      created_at: now
    }
  ];

  for (const o of orgs) {
    await runQuery(`
      INSERT INTO organizations (
        id, name, category, type, reg_no, pan_number, tax_80g_12a, established, hq,
        district, taluka, state, presence, members, members_count, focus, description,
        icon, cover_image, contact, email, website, president_name, president_phone,
        secretary_name, secretary_phone, verification_status, is_verified,
        doc_reg_certificate, doc_audited_balance_sheet, activity_score, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      o.id, o.name, o.category, o.type, o.reg_no, o.pan_number, o.tax_80g_12a, o.established, o.hq,
      o.district, o.taluka, o.state, o.presence, o.members, o.members_count, o.focus, o.description,
      o.icon, o.cover_image, o.contact, o.email, o.website, o.president_name, o.president_phone,
      o.secretary_name, o.secretary_phone, o.verification_status, o.is_verified,
      o.doc_reg_certificate, o.doc_audited_balance_sheet, o.activity_score, o.created_at
    ]);
  }

  // 2. Office Bearers
  const bearers = [
    { id: 'BR-01', org_id: 'ORG-01', name: 'दिलीप जगताप', designation: 'राष्ट्रीय अध्यक्ष', phone: '9822016740', email: 'president@marathamahasangh.org', district: 'मुंबई' },
    { id: 'BR-02', org_id: 'ORG-01', name: 'राजेंद्र कोंढरे', designation: 'महासचिव', phone: '9822055667', email: 'general.sec@marathamahasangh.org', district: 'पुणे' },
    { id: 'BR-03', org_id: 'ORG-01', name: 'संभाजी मोरे', designation: 'खजिनदार', phone: '9822099112', email: 'treasurer@marathamahasangh.org', district: 'सातारा' },

    { id: 'BR-04', org_id: 'ORG-02', name: 'संभाजीराव कदम', designation: 'मुख्य राज्य समन्वयक', phone: '9822055443', email: 'kadam@mkm.org', district: 'पुणे' },
    { id: 'BR-05', org_id: 'ORG-02', name: 'अतुल लोंढे', designation: 'प्रवक्ता व समन्वयक', phone: '9822188991', email: 'atullondhe@mkm.org', district: 'नागपूर' },

    { id: 'BR-06', org_id: 'ORG-05', name: 'श्रमिक गोजमगुंडे', designation: 'संस्थापक अध्यक्ष', phone: '9822011234', email: 'shramik@gadkot.org', district: 'पुणे' },
    { id: 'BR-07', org_id: 'ORG-05', name: 'गणेश कदम', designation: 'राज्य कार्यवाह', phone: '9822044556', email: 'kadam@gadkot.org', district: 'रायगड' }
  ];

  for (const b of bearers) {
    await runQuery(`
      INSERT INTO org_office_bearers (
        id, org_id, name, designation, phone, email, district, term_period, is_primary, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, '२०२४ - २०२७', 1, ?)
    `, [b.id, b.org_id, b.name, b.designation, b.phone, b.email, b.district, now]);
  }

  // 3. Organization Events
  const events = [
    {
      id: 'EVT-01',
      org_id: 'ORG-01',
      title: 'राज्यव्यापी मराठा विचारमंथन परिषद २०२६',
      category: 'सामाजिक परिषद',
      event_date: '२०२६-११-१५',
      venue: 'यशवंतराव चव्हाण प्रतिष्ठान सभागृह, नरिमन पॉईंट, मुंबई',
      district: 'मुंबई',
      attendees_expected: 1500,
      description: 'उच्च शिक्षण, व्यावसायिक आरक्षण आणि उद्योजकता विकासासाठी राज्यभरातील प्रतिनिधींची शिखर परिषद.',
      coordinator_name: 'राजेंद्र कोंढरे',
      coordinator_phone: '9822055667'
    },
    {
      id: 'EVT-02',
      org_id: 'ORG-05',
      title: 'दुर्गराज रायगड महादरवाजा श्रमदान व स्वच्छता मोहीम',
      category: 'दुर्ग संवर्धन',
      event_date: '२०२६-१०-२६',
      venue: 'किल्ले रायगड महादरवाजा परिसर',
      district: 'रायगड',
      attendees_expected: 500,
      description: 'तटबंदी स्वच्छता, ऐतिहासिक पायऱ्यांची डागडूजी आणि प्लास्टिक मुक्ती अभियान.',
      coordinator_name: 'गणेश कदम',
      coordinator_phone: '9822044556'
    },
    {
      id: 'EVT-03',
      org_id: 'ORG-06',
      title: 'मराठा नवउद्योजक B2B एक्सपो व निधी सहाय्य परिषद',
      category: 'मेळावा',
      event_date: '२०२६-१२-०५',
      venue: 'ऑटो क्लस्टर एक्झिबिशन सेंटर, चिंचवड, पुणे',
      district: 'पुणे',
      attendees_expected: 3000,
      description: 'कृषी प्रक्रिया उद्योग, आयटी स्टार्टअप्स आणि मॅन्युफॅक्चरिंग उद्योगांसाठी व्हेंचर कॅपिटल गुंतवणूकदार परिषद.',
      coordinator_name: 'विक्रमसिंह शिंदे',
      coordinator_phone: '9822090001'
    }
  ];

  for (const e of events) {
    await runQuery(`
      INSERT INTO org_events (
        id, org_id, title, category, event_date, venue, district, attendees_expected, description, coordinator_name, coordinator_phone, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'आगामी (Upcoming)', ?)
    `, [e.id, e.org_id, e.title, e.category, e.event_date, e.venue, e.district, e.attendees_expected, e.description, e.coordinator_name, e.coordinator_phone, now]);
  }

  // 4. Joint Collaborations
  const collabs = [
    {
      id: 'COL-01',
      requesting_org_id: 'ORG-02',
      requesting_org_name: 'मराठा क्रांती मोर्चा समन्वय समिती',
      target_org_id: 'ORG-04',
      target_org_name: 'श्री शिवाजी शिक्षण प्रसारक मंडळ',
      initiative_title: 'गरजू शेतकरी पाल्यांसाठी मोफत यूपीएससी/एमपीएससी निवासी प्रशिक्षण केंद्र',
      proposal_summary: 'विदर्भ व मराठवाड्यातील अल्पभूधारक मराठा कुटुंबातील ५०० होतकरू विद्यार्थ्यांसाठी अमरावती येथे मोफत भोजन व अभ्यासिका केंद्र सुरू करणे.',
      district: 'अमरावती',
      contact_person: 'संभाजीराव कदम',
      contact_phone: '9822055443',
      status: 'स्वीकृत (Accepted)'
    },
    {
      id: 'COL-02',
      requesting_org_id: 'ORG-05',
      requesting_org_name: 'सह्याद्री प्रतिष्ठान',
      target_org_id: 'ORG-01',
      target_org_name: 'अखिल भारतीय मराठा महासंघ',
      initiative_title: 'सह्याद्रीतील २५ दुर्लक्षित गडांवर माहिती फलक व सुरक्षा रेलिंग उभारणी मोहीम',
      proposal_summary: 'पुरातत्व विभागाच्या नियमानुसार पारंपरिक पद्धतीने गडकिल्ल्यांवर अभ्यासपूर्ण माहिती फलक लावणे व आपत्कालीन बचाव पथके तयार करणे.',
      district: 'पुणे',
      contact_person: 'श्रमिक गोजमगुंडे',
      contact_phone: '9822011234',
      status: 'प्रलंबित (Pending)'
    }
  ];

  for (const c of collabs) {
    await runQuery(`
      INSERT INTO org_collaborations (
        id, requesting_org_id, requesting_org_name, target_org_id, target_org_name, initiative_title, proposal_summary, district, contact_person, contact_phone, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [c.id, c.requesting_org_id, c.requesting_org_name, c.target_org_id, c.target_org_name, c.initiative_title, c.proposal_summary, c.district, c.contact_person, c.contact_phone, c.status, now]);
  }

  // 5. Work Reports
  const reports = [
    {
      id: 'REP-01',
      org_id: 'ORG-01',
      report_year: '२०२४-२५',
      title: 'अखिल भारतीय मराठा महासंघ वार्षिक कार्य अहवाल व मदत निधी विवरण',
      beneficiaries_count: 85000,
      events_conducted: 142,
      total_spend: 3450000,
      summary: 'राज्यभरात १०,०००+ विद्यार्थ्यांना शैक्षणिक शिष्यवृत्ती, ५२ रक्तदान शिबिरे, व २४ न्यायालयीन आरक्षण याचिकांमध्ये विधी साहाय्य.'
    },
    {
      id: 'REP-02',
      org_id: 'ORG-05',
      report_year: '२०२४-२५',
      title: 'सह्याद्री प्रतिष्ठान गडकोट संवर्धन व श्रमदान वार्षिक अहवाल',
      beneficiaries_count: 42000,
      events_conducted: 64,
      total_spend: 1820000,
      summary: '१८ गडकोटांवर स्वच्छता मोहीम, रायगड-सिंहगड-राजगडवर १०,००० किलो कचरा विल्हेवाट, आणि ३२ ऐतिहासिक तोफांची शास्त्रोक्त जपणूक.'
    }
  ];

  for (const r of reports) {
    await runQuery(`
      INSERT INTO org_work_reports (
        id, org_id, report_year, title, beneficiaries_count, events_conducted, total_spend, summary, report_file_url, submitted_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ANNUAL_REP_2025.pdf', 'केंद्रीय कार्यकारिणी', ?)
    `, [r.id, r.org_id, r.report_year, r.title, r.beneficiaries_count, r.events_conducted, r.total_spend, r.summary, now]);
  }

  saveDatabaseNow();
  console.log('✅ Seeded 6 historic Maratha Organizations, office bearers, events, collaborations, and work reports in SQLite!');
}

if (process.argv[1] && process.argv[1].endsWith('seed_sqlite_organizations.mjs')) {
  seedOrganizationsData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
