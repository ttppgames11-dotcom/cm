import { runQuery, get, all, saveDatabaseNow } from '../database/database.js';
import { migrateWomenTables } from './migrate_women.mjs';

async function seedWomenData() {
  await migrateWomenTables();

  console.log('Seeding rich authentic Women Empowerment data into SQLite...');

  // 1. Women Entrepreneurs
  const entrepreneurs = [
    {
      id: 'WENT-01',
      name: 'सौ. रोहिणी तानाजी मोरे',
      business_name: 'शिवमुद्रा ऑरगॅनिक ॲग्रो फूड्स',
      category: 'खाद्यपदार्थ व कृषी प्रक्रिया',
      sub_category: 'गावरान हळद, सेंद्रिय गूळ व मसाले',
      district: 'सातारा',
      taluka: 'कराड',
      city: 'कराड',
      description: 'कराड परिसरातील २०० हून अधिक महिला शेतकऱ्यांशी समन्वय साधून शुद्ध सेंद्रिय हळद पावडर, गूळ पावडर आणि पारंपरिक खलबत्त्यातील मसाल्यांचे उत्पादन व संपूर्ण महाराष्ट्रात विक्री.',
      products_services: 'सेंद्रिय हळद, रसायनमुक्त काकवी, गूळ पावडर, कांदा लसूण मसाला',
      contact_phone: '9822119933',
      whatsapp: '9822119933',
      email: 'shivmudra.foods@gmail.com',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      shg_name: 'जिजाऊ महिला स्वावलंबन बचत गट',
      is_shg: 1,
      employees_count: 18,
      annual_turnover: '₹२४ लाख',
      verified: 1,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'WENT-02',
      name: 'सौ. वैशाली विक्रम भोसले',
      business_name: 'पैठणी वैभव व पारंपरिक हातमाग',
      category: 'वस्त्रोद्योग व फॅशन',
      sub_category: 'शुद्ध रेशमी येवला व पैठणी साड्या',
      district: 'नाशिक',
      taluka: 'येवला',
      city: 'नाशिक',
      description: 'येवला परिसरातील महिला विणकरांना रोजगार पुरवणारा ब्रँड. पारंपरिक काठापदराच्या अस्सल जरीच्या पैठण्या, शेले आणि कुर्त्यांचे थेट ग्राहकांना वाजवी दरात वितरण.',
      products_services: 'अस्सल रेशमी पैठणी, ब्रॉकेड साड्या, पेशवाई फेटे व शेले',
      contact_phone: '9850224411',
      whatsapp: '9850224411',
      email: 'vaibhavpaithani@gmail.com',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
      shg_name: 'महारानी ताराबाई हातमाग संघ',
      is_shg: 1,
      employees_count: 25,
      annual_turnover: '₹४५ लाख',
      verified: 1,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'WENT-03',
      name: 'कु. स्नेहल राजेंद्र पाटील',
      business_name: 'सह्याद्री डिजिटल सोल्यूशन्स व आयटी टेक',
      category: 'IT व व्यावसायिक सेवा',
      sub_category: 'वेबसाईट डेव्हलपमेंट, ॲप्स व डिजिटल मार्केटिंग',
      district: 'पुणे',
      taluka: 'हवेली',
      city: 'पुणे',
      description: 'ग्रामीण भागातील हुशार मराठा मुलींना कोडिंग व डिजिटल डिझाइनचे प्रशिक्षण देऊन आयटी कंपन्यांचे प्रोजेक्ट्स पूर्ण करणारी महिला स्टार्ट-अप संस्था.',
      products_services: 'Custom Web Apps, ERP Systems, SEO, Social Media Marketing',
      contact_phone: '9823447788',
      whatsapp: '9823447788',
      email: 'snehal@sahyadridigital.in',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
      shg_name: '',
      is_shg: 0,
      employees_count: 12,
      annual_turnover: '₹३५ लाख',
      verified: 1,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'WENT-04',
      name: 'सौ. अनिता संभाजी गायकवाड',
      business_name: 'महालक्ष्मी गृहउद्योग व बेकरी',
      category: 'खाद्यपदार्थ व गृहउद्योग',
      sub_category: 'पारंपरिक फराळ, शेवया, पापड व कुकीज',
      district: 'कोल्हापूर',
      taluka: 'करवीर',
      city: 'कोल्हापूर',
      description: 'घरगुती चवीचे अस्सल कोल्हापुरी मसाले, चकल्या, डाळीचे पापड व नाचणीची पौष्टिक उत्पादने. ५० हून अधिक महिलांना घरबसल्या सन्माननीय उत्पन्न.',
      products_services: 'कोल्हापुरी तांबडा-पांढरा रस्सा मसाला, नाचणी पापड, ज्वारी शेवया',
      contact_phone: '9890112244',
      whatsapp: '9890112244',
      email: 'mahalaxmi.grih@gmail.com',
      photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80',
      shg_name: 'अहिल्याबाई होळकर महिला बचत गट',
      is_shg: 1,
      employees_count: 30,
      annual_turnover: '₹२० लाख',
      verified: 1,
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'WENT-05',
      name: 'डॉ. प्रज्ञा आनंदराव देशमुख',
      business_name: 'संस्कार क्लिनिक व निसर्गोपचार केंद्र',
      category: 'आरोग्य व निसर्गोपचार',
      sub_category: 'आयुर्वेद, गर्भसंस्कार व महिला समुपदेशन',
      district: 'छत्रपती संभाजीनगर',
      taluka: 'संभाजीनगर',
      city: 'छत्रपती संभाजीनगर',
      description: 'महिलांच्या शारीरिक व मानसिक आरोग्यासाठी समर्पित केंद्र. विशेषतः ग्रामीण भागातील महिलांसाठी मोफत तपासणी व आयुर्वेदिक औषधोपचार.',
      products_services: 'आयुर्वेदिक उपचार, पंचकर्म, गर्भसंस्कार वर्ग, पौष्टिक आहाराचा सल्ला',
      contact_phone: '9822778800',
      whatsapp: '9822778800',
      email: 'drpragya.deshmukh@gmail.com',
      photo: 'https://images.unsplash.com/photo-1594824813626-d62f4b005e83?auto=format&fit=crop&w=600&q=80',
      shg_name: '',
      is_shg: 0,
      employees_count: 6,
      annual_turnover: '₹१५ लाख',
      verified: 1,
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];

  for (const ent of entrepreneurs) {
    const existing = await get('SELECT id FROM women_entrepreneurs WHERE id = ?', [ent.id]);
    if (!existing) {
      await runQuery(`
        INSERT INTO women_entrepreneurs (
          id, user_id, name, business_name, category, sub_category, district, taluka, city,
          description, products_services, contact_phone, whatsapp, email, photo,
          shg_name, is_shg, employees_count, annual_turnover, verified, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        ent.id, null, ent.name, ent.business_name, ent.category, ent.sub_category, ent.district, ent.taluka, ent.city,
        ent.description, ent.products_services, ent.contact_phone, ent.whatsapp, ent.email, ent.photo,
        ent.shg_name, ent.is_shg, ent.employees_count, ent.annual_turnover, ent.verified, ent.status, ent.created_at
      ]);
    }
  }

  // 2. Training, Courses & Government Schemes
  const programs = [
    {
      id: 'WPRG-01',
      title: 'अण्णासाहेब पाटील महामंडळ - महिला वैयक्तिक कर्ज व्याज परतावा योजना',
      type: 'scheme',
      category: 'उद्योग व कर्ज',
      provider: 'महाराष्ट्र शासन व अण्णासाहेब पाटील आर्थिक मागास विकास महामंडळ',
      description: 'मराठा समाजातील महिला उद्योजकांना नवीन व्यवसाय सुरू करण्यासाठी किंवा विस्तार करण्यासाठी ₹१५ लाखांपर्यंतच्या बँकेच्या कर्जावर पूर्ण व्याज परतावा (Interest Subvention).',
      eligibility: '१८ ते ५० वर्षे वयोगट, मराठा समाजाचा दाखला, व्यवसायाचा प्रकल्प अहवाल (DPR).',
      benefits: '₹१५ लाखांपर्यंतच्या कर्जावर १२% पर्यंत व्याज शासनाकडून थेट बँक खात्यात परतावा.',
      duration: '५ वर्षे परतफेड मुदत',
      district: 'सर्व महाराष्ट्र',
      contact_phone: '1800-120-8040',
      apply_url: 'https://mahapratit.org',
      deadline: '३१ डिसेंबर २०२६ पर्यंत खुले',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'WPRG-02',
      title: 'उमेद - महाराष्ट्र राज्य ग्रामीण जीवनोन्नती अभियान (बचत गट खेळते भांडवल)',
      type: 'scheme',
      category: 'बचत गट अनुदान',
      provider: 'ग्रामविकास विभाग, महाराष्ट्र शासन',
      description: 'ग्रामीण महिला बचत गटांना स्वावलंबी बनवण्यासाठी ₹१५,००० फिरता निधी (Revolving Fund) व ₹१.५ लाखांपर्यंत समुदाय गुंतवणूक निधी (CIF) सुलभ व्याजदराने.',
      eligibility: 'किमान ३ महिने सक्रिय असलेला नोंदणीकृत महिला बचत गट.',
      benefits: 'सुलभ खेळते भांडवल, बँक लिंकेज आणि बाजारपेठ मेळावे.',
      duration: 'सतत चालू योजना',
      district: 'सर्व ग्रामीण जिल्हे',
      contact_phone: '022-27562540',
      apply_url: 'https://umed.maharashtra.gov.in',
      deadline: 'खुली योजना',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'WPRG-03',
      title: 'जिजाऊ कन्या IT व कोडिंग मोफत बूटकॅम्प (React & Python Full-Stack)',
      type: 'training',
      category: 'IT व डिजिटल कौशल्ये',
      provider: 'कनेक्ट मराठा नॉलेज सेंटर व टेक फाउंडेशन',
      description: 'मराठा विद्यार्थिनी व तरुणींना आधुनिक सॉफ्टवेअर इंजिनीअरिंग, डेटा सायन्स आणि वेब डेव्हलपमेंटचे ३ महिन्यांचे प्रात्यक्षिकांसह ऑनलाइन प्रशिक्षण व थेट नोकरी मार्गदर्शन.',
      eligibility: 'पदवीधर / अंतिम वर्षातील विद्यार्थिनी (कोणतीही शाखा), बेसिक संगणक ज्ञान.',
      benefits: 'मोफत प्रशिक्षण, थेट कंपनी इंटरव्ह्यू, इंडस्ट्री मेंटॉरशिप व प्रमाणपत्र.',
      duration: '१२ आठवडे (शनिवार-रविवार)',
      district: 'सर्व महाराष्ट्र (Online / Live)',
      contact_phone: '9822001122',
      apply_url: 'https://connectmaratha.com/women/bootcamp',
      deadline: '१५ नोव्हेंबर २०२६',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'WPRG-04',
      title: 'कृषी व फळप्रक्रिया लघुउद्योग व्यावसायिक प्रशिक्षण (FSSAI लायसन्ससह)',
      type: 'training',
      category: 'कृषी प्रक्रिया',
      provider: 'वसंतदादा शुगर इन्स्टिट्यूट व कृषी विज्ञान केंद्र',
      description: 'जॅम, जेली, लोणची, फळांचे रस, मसाला पावडर निर्मिती आणि पॅकेजिंगचे शास्त्रीय प्रशिक्षण. सोबत FSSAI नोंदणी व ब्रँडिंग मार्गदर्शन.',
      eligibility: '१८ वर्षांवरील महिला, बचत गट सदस्यांना प्राधान्य.',
      benefits: 'हँड्स-ऑन ट्रेनिंग, उद्योग उभारणीसाठी मार्गदर्शन किट व सरकारी अनुदान माहिती.',
      duration: '६ दिवस निवासी शिबिर',
      district: 'पुणे, सातारा, सांगली, सोलापूर',
      contact_phone: '9850113355',
      apply_url: 'https://connectmaratha.com/women/agri-training',
      deadline: '३० ऑक्टोबर २०२६',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'WPRG-05',
      title: 'मराठा महिला उद्योजकता महापरिषद व महा-एक्झिबिशन २०२६',
      type: 'workshop',
      category: 'उद्योग व नेटवर्किंग',
      provider: 'कनेक्ट मराठा महिला कक्ष व मराठा चेंबर ऑफ कॉमर्स',
      description: 'राज्यभरातील १,००० हून अधिक महिला उद्योजिका, बँक अधिकारी, व्हेंचर कॅपिटलिस्ट आणि सरकारी धोरणकर्ते यांचे एकत्रित अधिवेशन. स्टॉल्स व थेट B2B व्यवसाय संधी.',
      eligibility: 'सर्व महिला उद्योजक, व्यावसायिक व बचत गट प्रतिनिधी.',
      benefits: 'उत्पादनांचे प्रदर्शन स्टॉल, इन्व्हेस्टर पिचिंग, कायदेशीर व निर्यात मार्गदर्शन.',
      duration: '२ दिवस (२१ व २२ नोव्हेंबर २०२६)',
      district: 'पुणे (बालेवाडी क्रीडा संकुल)',
      contact_phone: '9866442200',
      apply_url: 'https://connectmaratha.com/women/summit',
      deadline: '१० नोव्हेंबर २०२६',
      status: 'active',
      created_at: new Date().toISOString()
    }
  ];

  for (const prg of programs) {
    const existing = await get('SELECT id FROM women_programs WHERE id = ?', [prg.id]);
    if (!existing) {
      await runQuery(`
        INSERT INTO women_programs (
          id, title, type, category, provider, description, eligibility, benefits,
          duration, district, contact_phone, apply_url, deadline, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        prg.id, prg.title, prg.type, prg.category, prg.provider, prg.description, prg.eligibility, prg.benefits,
        prg.duration, prg.district, prg.contact_phone, prg.apply_url, prg.deadline, prg.status, prg.created_at
      ]);
    }
  }

  // 3. Women Mentors
  const mentors = [
    {
      id: 'WMT-01',
      name: 'अॅड. जयश्री पाटील-कदम (वरिष्ठ विधिज्ञ)',
      title: 'महिला हक्क, कौटुंबिक न्यायालय व मालमत्ता विधीतज्ज्ञ',
      field: 'विधी व कायदेशीर सल्ला',
      experience: '२२ वर्षे उच्च न्यायालय मुंबई व कौटुंबिक न्यायालयात प्रदीर्घ सराव',
      district: 'मुंबई / ठाणे',
      about: 'महिलांवरील अन्याय, हुंडा प्रतिबंध, वारसा हक्क व वैवाहिक तंटे सामोपचाराने सोडवण्यासाठी नि:शुल्क सल्ला व विधी साहाय्य पुरवतात.',
      photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
      contact_phone: '9820112233',
      email: 'adv.jayshree.patil@gmail.com',
      available_modes: 'शनिवार-रविवार (सायं. ५ ते ७) / ऑनलाइन सल्ला',
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'WMT-02',
      name: 'सौ. सुलभा संभाजी गायकवाड (उद्योजक)',
      title: 'संस्थापिका, सह्याद्री महिला मॅन्युफॅक्चरिंग व एक्सपोर्ट',
      field: 'उद्योग व व्यवसाय मार्गदर्शन',
      experience: '१५ वर्षे मॅन्युफॅक्चरिंग, बँकिंग कर्ज प्रक्रिया व आंतरराष्ट्रीय निर्यात अनुभव',
      district: 'पुणे / कोल्हापूर',
      about: 'शून्य भांडवलातून गृहउद्योग कसा सुरू करावा, बँकेचे प्रकल्प अहवाल (DPR) कसे बनवावेत आणि महिला बचत गटांना मोठी बाजारपेठ कशी मिळवून द्यावी याचे प्रत्यक्ष मार्गदर्शन.',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
      contact_phone: '9822334455',
      email: 'sulabha.gaikwad@sahgroup.in',
      available_modes: 'फोन व प्रत्यक्ष भेट (पूर्वनोंदणीने)',
      is_active: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'WMT-03',
      name: 'प्रा. डॉ. मीनाक्षी विश्वासराव मोरे',
      title: 'माजी सदस्य MPSC समन्वय समिती व वरिष्ठ करिअर समुपदेशक',
      field: 'सनदी सेवा व उच्च शिक्षण',
      experience: '१८ वर्षे UPSC / MPSC आणि स्पर्धा परीक्षा मार्गदर्शन',
      district: 'सातारा / पुणे',
      about: 'मराठा विद्यार्थिनींना वर्ग १ व २ च्या सरकारी प्रशासकीय पदांवर संधी मिळवून देण्यासाठी अभ्यासाचे नियोजन, मुलाखत तंत्र आणि व्यक्तिमत्व विकास मार्गदर्शन.',
      photo: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80',
      contact_phone: '9850667788',
      email: 'dr.meenakshi.more@gmail.com',
      available_modes: 'दर बुधवारी सायंकाळी ऑनलाइन वेबिनार',
      is_active: 1,
      created_at: new Date().toISOString()
    }
  ];

  for (const m of mentors) {
    const existing = await get('SELECT id FROM women_mentors WHERE id = ?', [m.id]);
    if (!existing) {
      await runQuery(`
        INSERT INTO women_mentors (
          id, name, title, field, experience, district, about, photo,
          contact_phone, email, available_modes, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        m.id, m.name, m.title, m.field, m.experience, m.district, m.about, m.photo,
        m.contact_phone, m.email, m.available_modes, m.is_active, m.created_at
      ]);
    }
  }

  // 4. Confidential Help Cases
  const sampleCases = [
    {
      id: 'WCS-101',
      case_number: 'WH-2026-001',
      applicant_id: 'MEM-089',
      applicant_name: 'सौ. सविता रमेश भोसले',
      contact_phone: '9822334411',
      district: 'सातारा',
      taluka: 'कोरेगाव',
      category: 'आर्थिक साहाय्य व उद्योग कर्ज',
      urgency: 'सामान्य',
      description: '१० महिलांचा बचत गट असून शेवया व पापड बनवण्याचे मशिन खरेदीसाठी अण्णासाहेब पाटील महामंडळाकडून कर्ज मंजुरी व कागदपत्रे पडताळणीमध्ये मार्गदर्शन हवे आहे.',
      preferred_time: 'दुपारी २ ते ५',
      assigned_coordinator: 'सौ. सुलभा गायकवाड (जिल्हा महिला कक्ष प्रमुख)',
      coordinator_phone: '9822334455',
      status: 'प्रगतीपथावर',
      counselor_notes: 'बँक ऑफ महाराष्ट्र कोरेगाव शाखेत कर्ज प्रकरणाची फाईल दाखल केली असून जिल्हा समन्वयकांनी बँक व्यवस्थापकांशी बोलणी केली आहे.',
      resolved_at: null,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'WCS-102',
      case_number: 'WH-2026-002',
      applicant_id: 'MEM-142',
      applicant_name: 'कु. अंकिता दिलीप शिंदे',
      contact_phone: '9860112299',
      district: 'पुणे',
      taluka: 'पुणे शहर',
      category: 'कौटुंबिक व कायदेशीर सल्ला',
      urgency: '🟠 तातडीने (२४ तास)',
      description: 'वडिलोपार्जित शेतजमीन व वारसा हक्कातून भाऊ व चुलते बेकायदेशीरपणे नाव वगळत आहेत. कायदेशीर नोटीस व हक्क संरक्षणासाठी विधी सल्ला हवा आहे.',
      preferred_time: 'सकाळी १० ते दुपारी १२',
      assigned_coordinator: 'अॅड. जयश्री पाटील (विधी कक्ष)',
      coordinator_phone: '9820112233',
      status: 'समीक्षेत',
      counselor_notes: 'दस्तऐवज मागवून घेण्यात आले असून ७/१२ उतारा व फेरफार तपासणी चालू आहे.',
      resolved_at: null,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  for (const c of sampleCases) {
    const existing = await get('SELECT id FROM women_help_cases WHERE id = ?', [c.id]);
    if (!existing) {
      await runQuery(`
        INSERT INTO women_help_cases (
          id, case_number, applicant_id, applicant_name, contact_phone, district, taluka,
          category, urgency, description, preferred_time, assigned_coordinator, coordinator_phone,
          status, counselor_notes, resolved_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        c.id, c.case_number, c.applicant_id, c.applicant_name, c.contact_phone, c.district, c.taluka,
        c.category, c.urgency, c.description, c.preferred_time, c.assigned_coordinator, c.coordinator_phone,
        c.status, c.counselor_notes, c.resolved_at, c.created_at
      ]);
    }
  }

  // 5. Seed Women SHGs
  const sampleShgs = [
    {
      id: 'SHG-01',
      shg_name: 'जिजाऊ महिला स्वावलंबन बचत गट',
      president_name: 'सौ. रोहिणी तानाजी मोरे',
      secretary_name: 'सौ. सुनिता पवार',
      phone: '9822119933',
      district: 'सातारा',
      taluka: 'कराड',
      village: 'मलकापूर',
      members_count: 18,
      bank_name: 'बँक ऑफ महाराष्ट्र',
      bank_branch: 'कराड मुख्य शाखा',
      monthly_savings: '₹५०० / महिना',
      activity_type: 'सेंद्रिय हळद व कृषी प्रक्रिया',
      loan_status: 'मंजूर (₹१० लाख फिरता निधी)',
      revolving_fund_received: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'SHG-02',
      shg_name: 'महारानी ताराबाई हातमाग संघ',
      president_name: 'सौ. वैशाली विक्रम भोसले',
      secretary_name: 'सौ. मीना जाधव',
      phone: '9850224411',
      district: 'नाशिक',
      taluka: 'येवला',
      village: 'येवला शहर',
      members_count: 25,
      bank_name: 'स्टेट बँक ऑफ इंडिया',
      bank_branch: 'येवला',
      monthly_savings: '₹१००० / महिना',
      activity_type: 'अस्सल रेशमी पैठणी विणकाम',
      loan_status: 'मंजूर (₹१५ लाख मुदत कर्ज)',
      revolving_fund_received: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'SHG-03',
      shg_name: 'पुण्यश्लोक अहिल्याबाई महिला गृहउद्योग गट',
      president_name: 'सौ. अनिता संभाजी गायकवाड',
      secretary_name: 'सौ. सविता शिंदे',
      phone: '9890112244',
      district: 'कोल्हापूर',
      taluka: 'करवीर',
      village: 'उचगाव',
      members_count: 30,
      bank_name: 'कोल्हापूर जिल्हा मध्यवर्ती बँक',
      bank_branch: 'करवीर शाखा',
      monthly_savings: '₹५०० / महिना',
      activity_type: 'कोल्हापुरी मसाले, पापड व फराळ निर्मिती',
      loan_status: 'मंजूर (₹८ लाख भांडवल)',
      revolving_fund_received: 1,
      created_at: new Date().toISOString()
    }
  ];

  for (const s of sampleShgs) {
    const existing = await get('SELECT id FROM women_shgs WHERE id = ?', [s.id]);
    if (!existing) {
      await runQuery(`
        INSERT INTO women_shgs (
          id, shg_name, president_name, secretary_name, phone, district, taluka, village,
          members_count, bank_name, bank_branch, monthly_savings, activity_type, loan_status,
          revolving_fund_received, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        s.id, s.shg_name, s.president_name, s.secretary_name, s.phone, s.district, s.taluka, s.village,
        s.members_count, s.bank_name, s.bank_branch, s.monthly_savings, s.activity_type, s.loan_status,
        s.revolving_fund_received, s.created_at
      ]);
    }
  }

  // 6. Seed Women Marketplace Products
  const sampleProducts = [
    {
      id: 'WPRD-01',
      entrepreneur_id: 'WENT-01',
      seller_name: 'शिवमुद्रा ऑरगॅनिक ॲग्रो (सौ. रोहिणी मोरे)',
      product_name: 'गावरान कडक सेंद्रिय हळद पावडर (Natural Curcumin 5%+)',
      category: 'कृषी व खाद्यपदार्थ',
      price: '₹२८०',
      unit: 'प्रति १ किलो पॅक',
      district: 'सातारा',
      photo: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
      description: 'कराड परिसरातील रसायनमुक्त शुद्ध शेतातील हळद. रोगप्रतिकारक शक्ती वाढवण्यासाठी व स्वयंपाकासाठी अत्यंत गुणकारी.',
      contact_phone: '9822119933',
      whatsapp: '9822119933',
      is_available: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'WPRD-02',
      entrepreneur_id: 'WENT-02',
      seller_name: 'पैठणी वैभव (सौ. वैशाली भोसले)',
      product_name: 'अस्सल येवला रेशमी काठापदराची पेशवाई पैठणी',
      category: 'वस्त्रोद्योग व फॅशन',
      price: '₹८,५००',
      unit: 'प्रति साडी (ब्लाउज पीससह)',
      district: 'नाशिक',
      photo: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      description: 'शुद्ध रेशीम धाग्यात विणलेली, पारंपारिक मोराची व पोपटाची नक्षी असणारी अस्सल कारागिरांची पैठणी.',
      contact_phone: '9850224411',
      whatsapp: '9850224411',
      is_available: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'WPRD-03',
      entrepreneur_id: 'WENT-04',
      seller_name: 'महालक्ष्मी गृहउद्योग (सौ. अनिता गायकवाड)',
      product_name: 'अस्सल कोल्हापुरी कांदा-लसूण चटणी व तांबडा रस्सा मसाला',
      category: 'कृषी व खाद्यपदार्थ',
      price: '₹३५०',
      unit: '१ किलो कॉम्बो पॅक',
      district: 'कोल्हापूर',
      photo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
      description: 'पारंपरिक खलबत्त्यात कुटलेला, घरगुती तेलातील अस्सल कोल्हापुरी तिखट मसाला. शून्य भेसळ हमी.',
      contact_phone: '9890112244',
      whatsapp: '9890112244',
      is_available: 1,
      created_at: new Date().toISOString()
    }
  ];

  for (const p of sampleProducts) {
    const existing = await get('SELECT id FROM women_products WHERE id = ?', [p.id]);
    if (!existing) {
      await runQuery(`
        INSERT INTO women_products (
          id, entrepreneur_id, seller_name, product_name, category, price, unit,
          district, photo, description, contact_phone, whatsapp, is_available, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        p.id, p.entrepreneur_id, p.seller_name, p.product_name, p.category, p.price, p.unit,
        p.district, p.photo, p.description, p.contact_phone, p.whatsapp, p.is_available, p.created_at
      ]);
    }
  }

  saveDatabaseNow();
  console.log('✓ Women Empowerment comprehensive sample data seeded successfully!');
}

seedWomenData().catch(err => {
  console.error('Error seeding women data:', err);
  process.exit(1);
});
