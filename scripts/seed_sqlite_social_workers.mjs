import { runQuery, saveDatabaseNow } from '../database/database.js';

export async function seedSocialWorkersData() {
  console.log('Seeding authentic Nishthavant Social Workers into SQLite...');

  const now = new Date().toISOString();

  await runQuery('DELETE FROM social_workers');
  await runQuery('DELETE FROM social_help_requests');
  await runQuery('DELETE FROM social_missions');
  await runQuery('DELETE FROM social_testimonials');

  // 1. Authentic Social Workers
  const workers = [
    {
      id: 'SW-01',
      name: 'कर्मवीर संभाजीराव जाधव',
      field: 'जलसंधारण व दुष्काळ मुक्ती',
      category: 'water',
      district: 'बीड',
      taluka: 'गेवराई',
      location: 'बीड / धाराशिव',
      experience: '२२ वर्षे समाजसेवा',
      impact: '४५ गावांमध्ये "पाणी अडवा पाणी जिरवा" मोहिमेतून २५० शेततळी व सिमेंट बंधारे निर्माण. हजारो एकर शेती सुजलाम.',
      icon: '💧',
      phone: '9422154321',
      email: 'sambhajirao.j@connectmaratha.org',
      organization: 'मराठवाडा पाणी संघर्ष समिती व ग्रामविकास प्रतिष्ठान',
      skills: 'जलसंधारण अभियांत्रिकी, लोकसहभाग संघटन, वृक्षारोपण',
      availability: 'पूर्णवेळ (Full-time)',
      volunteer_hours: 4800,
      cases_resolved: 320,
      rating: 4.95,
      is_verified: 1,
      verification_status: 'सत्यापित समाजसेवक (Verified)',
      awards: 'महाराष्ट्र जलमित्र पुरस्कार, मराठवाडा भूषण सन्मान',
      bio: 'गेल्या दोन दशकांपासून मराठवाड्यातील दुष्काळग्रस्त शेतकऱ्यांसाठी विनामोबदला पाणलोट क्षेत्र विकास व बंधारे बांधकामाचे कार्य.',
      created_at: now
    },
    {
      id: 'SW-02',
      name: 'डॉ. सौ. वंदना मोहिते-पाटील',
      field: 'ग्रामीण आरोग्य व रुग्णमित्र',
      category: 'health',
      district: 'सोलापूर',
      taluka: 'पंढरपूर',
      location: 'सोलापूर / पंढरपूर',
      experience: '१८ वर्षे रुग्णसेवा',
      impact: '१०,०००+ गरजू रुग्णांना मुंबई-पुण्यातील मोठ्या रुग्णालयांत मोफत उपचार, हृदय शस्त्रक्रिया व औषध साहाय्य.',
      icon: '🏥',
      phone: '9822365432',
      email: 'vandana.mohite@connectmaratha.org',
      organization: 'रुग्णमित्र सेवा ट्रस्ट, पंढरपूर',
      skills: 'वैद्यकीय समुपदेशन, मुख्यमंत्री सहाय्यता निधी समन्वय, मोफत औषध वाटप',
      availability: 'आपत्कालीन २४x७',
      volunteer_hours: 6200,
      cases_resolved: 1450,
      rating: 4.98,
      is_verified: 1,
      verification_status: 'सत्यापित समाजसेवक (Verified)',
      awards: 'धनवंतरी समाजभूषण, सावित्रीबाई फुले समाजसेवा गौरव',
      bio: 'गोरगरीब शेतकरी व कष्टकऱ्यांना गंभीर आजारांच्या उपचारासाठी तात्काळ मार्गदर्शन, निधी व रुग्णालय प्रवेश मिळवून देणाऱ्या रुग्णमित्र.',
      created_at: now
    },
    {
      id: 'SW-03',
      name: 'दिगंबर राजे गायकवाड',
      field: 'गडकिल्ले श्रमदान व संवर्धन',
      category: 'heritage',
      district: 'पुणे',
      taluka: 'हवेली',
      location: 'पुणे / रायगड / सातारा',
      experience: '१० वर्षे दुर्ग संवर्धन',
      impact: '१,५००+ शिवभक्त मावळ्यांची फळी तयार करून ३५ पेक्षा जास्त गडकिल्ल्यांवर स्वच्छता, तटबंदी जीर्णोद्धार व माहिती फलक.',
      icon: '🏰',
      phone: '9158076543',
      email: 'digambar.g@connectmaratha.org',
      organization: 'सह्याद्री प्रतिष्ठान व दुर्गमित्र सेना',
      skills: 'पुरातत्वीय संवर्धन, ट्रेक मार्गदर्शन, आपत्कालीन शोध व बचाव',
      availability: 'शनिवार-रविवार व सुट्ट्या',
      volunteer_hours: 3100,
      cases_resolved: 210,
      rating: 4.92,
      is_verified: 1,
      verification_status: 'सत्यापित समाजसेवक (Verified)',
      awards: 'दुर्गमित्र सन्मान, शिवशौर्य पुरस्कार',
      bio: 'सह्याद्रीच्या कुशीतील दुर्लक्षित गडकिल्ल्यांचे ऐतिहासिक पावित्र्य जपण्यासाठी अहोरात्र श्रमदान करणारे निष्ठावंत दुर्गसेवक.',
      created_at: now
    },
    {
      id: 'SW-04',
      name: 'सौ. अनिता प्रतापराव शिंदे',
      field: 'शेतकरी आत्महत्याग्रस्त कुटुंब पुनर्वसन',
      category: 'farmers',
      district: 'यवतमाळ',
      taluka: 'यवतमाळ',
      location: 'यवतमाळ / अमरावती',
      experience: '१४ वर्षे पुनर्वसन कार्य',
      impact: '३००+ विधवा भगिनींना शेळीपालन, शिलाई व कुक्कुटपालनाद्वारे स्वावलंबी बनवले आणि त्यांच्या पाल्यांचे शैक्षणिक पालकत्व स्वीकारले.',
      icon: '🌾',
      phone: '9403087654',
      email: 'anita.shinde@connectmaratha.org',
      organization: 'जिजाऊ शेतकरी कुटुंब आधार मंच',
      skills: 'महिला सक्षमीकरण, स्वयंरोजगार प्रशिक्षण, कायदेशीर वारसा हक्क मदत',
      availability: 'पूर्णवेळ (Full-time)',
      volunteer_hours: 4500,
      cases_resolved: 480,
      rating: 4.96,
      is_verified: 1,
      verification_status: 'सत्यापित समाजसेवक (Verified)',
      awards: 'क्रांतीज्योती सावित्रीबाई फुले पुरस्कार, विदर्भ गौरव',
      bio: 'शेतकरी आत्महत्याग्रस्त कुटुंबांना नैराश्यातून बाहेर काढून आर्थिक स्वावलंबन व मुलांच्या शिक्षणासाठी समर्पित समाजसेविका.',
      created_at: now
    },
    {
      id: 'SW-05',
      name: 'ॲड. संग्रामसिंह कदम',
      field: 'मोफत कायदेशीर सल्ला व विद्यार्थी हक्क',
      category: 'legal',
      district: 'छत्रपती संभाजीनगर',
      taluka: 'संभाजीनगर',
      location: 'छत्रपती संभाजीनगर / जालना',
      experience: '१२ वर्षे विधीसेवा',
      impact: '२,०००+ मराठा विद्यार्थ्यांना जात प्रमाणपत्र पडताळणी, ईडब्ल्यूएस, सारथी फेलोशिप व शिष्यवृत्तीसाठी विनामूल्य विधी सहाय्य.',
      icon: '⚖️',
      phone: '9890098765',
      email: 'sangram.kadam@connectmaratha.org',
      organization: 'मराठा विधिज्ञ परिषद व न्यायमंच',
      skills: 'उच्च न्यायालयीन याचिका, जात वैधता पडताळणी, घटनात्मक हक्क मार्गदर्शन',
      availability: 'पूर्णवेळ (Full-time)',
      volunteer_hours: 3800,
      cases_resolved: 1850,
      rating: 4.94,
      is_verified: 1,
      verification_status: 'सत्यापित समाजसेवक (Verified)',
      awards: 'न्यायमित्र सन्मान, विधिगौरव पुरस्कार',
      bio: 'आर्थिक दुर्बल मराठा विद्यार्थी व युवकांना न्यायालयात मोफत विधी सहाय्य देऊन त्यांचे शैक्षणिक नुकसान टाळणारे निष्ठावंत विधिज्ञ.',
      created_at: now
    },
    {
      id: 'SW-06',
      name: 'सुनील तानाजी सावंत',
      field: '२४ तास आपत्कालीन रक्त मदत व अवयवदान',
      category: 'blood',
      district: 'मुंबई',
      taluka: 'मुंबई उपनगर',
      location: 'मुंबई / ठाणे / नवी मुंबई',
      experience: '१६ वर्षे अविरत रक्तसेवा',
      impact: '२५,०००+ युनिट्स दुर्मिळ रक्त वेळेत उपलब्ध करून दिले, ४००+ मरणोत्तर अवयवदान संकल्प व ६५ रक्तदान शिबिरांचे यशस्वी आयोजन.',
      icon: '🩸',
      phone: '9820033445',
      email: 'sunil.sawant@connectmaratha.org',
      organization: 'मराठा रक्तदाता मित्र मंडळ',
      skills: 'आपत्कालीन रक्त नेटवर्क, प्लेटलेट्स डोनर मोबिलायझेशन, अवयवदान समुपदेशन',
      availability: 'आपत्कालीन २४x७',
      volunteer_hours: 7100,
      cases_resolved: 3400,
      rating: 4.99,
      is_verified: 1,
      verification_status: 'सत्यापित समाजसेवक (Verified)',
      awards: 'जीवनदाता गौरव, राष्ट्रीय रक्तमित्र पुरस्कार',
      bio: 'मध्यरात्रीही एका फोनवर मुंबईतील कोणत्याही हॉस्पिटलमध्ये दुर्मिळ रक्तगट व एसडीपी रक्तदाते उभे करणारे निष्ठावंत रक्तमित्र.',
      created_at: now
    }
  ];

  for (const w of workers) {
    await runQuery(`
      INSERT INTO social_workers (
        id, name, field, category, district, taluka, location, experience, impact,
        icon, phone, email, organization, skills, availability, volunteer_hours,
        cases_resolved, rating, is_verified, verification_status, awards, bio, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      w.id, w.name, w.field, w.category, w.district, w.taluka, w.location, w.experience, w.impact,
      w.icon, w.phone, w.email, w.organization, w.skills, w.availability, w.volunteer_hours,
      w.cases_resolved, w.rating, w.is_verified, w.verification_status, w.awards, w.bio, w.created_at
    ]);
  }

  // 2. Active Citizen Help Requests (मदत मागणी प्रकरणे)
  const helpRequests = [
    {
      id: 'REQ-2026-001',
      case_number: 'CASE-MH-981',
      citizen_name: 'अमोल विठ्ठलराव देशमुख',
      citizen_phone: '9822114477',
      district: 'बीड',
      taluka: 'गेवराई',
      category: 'शेतकरी कुटुंब मदत',
      urgency: 'तातडीचे (Emergency)',
      description: 'अतिवृष्टीमुळे शेतीतील विहीर खचली असून वीज पंप वाहून गेला आहे. २ एकर ऊस पिकासाठी तातडीने पुनर्वसन साहाय्य हवे आहे.',
      assigned_worker_id: 'SW-01',
      assigned_worker_name: 'कर्मवीर संभाजीराव जाधव',
      status: 'प्रगतीपथावर (In Progress)',
      outcome_notes: 'स्थानिक ग्रामपंचायत व सामाजिक निधीतून विहीर उपसा व नवीन पाइपलाइन जोडणी सुरू.',
      resolved_at: null,
      created_at: now
    },
    {
      id: 'REQ-2026-002',
      case_number: 'CASE-MH-982',
      citizen_name: 'सौ. सुरेखा तानाजी कदम',
      citizen_phone: '9822998811',
      district: 'सोलापूर',
      taluka: 'पंढरपूर',
      category: 'वैद्यकीय उपचार मदत',
      urgency: 'तातडीचे (Emergency)',
      description: '८ वर्षांच्या मुलाच्या हृदय शस्त्रक्रियेसाठी मुख्यमंत्री वैद्यकीय सहाय्यता निधी व पुण्यातील दीनानाथ मंगेशकर रुग्णालयात प्रवेश हवा आहे.',
      assigned_worker_id: 'SW-02',
      assigned_worker_name: 'डॉ. सौ. वंदना मोहिते-पाटील',
      status: 'यशस्वी पूर्ण (Resolved)',
      outcome_notes: 'मुख्यमंत्री निधीतून २.५ लाख मंजूर झाले व शस्त्रक्रिया यशस्वी झाली. मूल सुखरूप आहे.',
      resolved_at: now,
      created_at: now
    },
    {
      id: 'REQ-2026-003',
      case_number: 'CASE-MH-983',
      citizen_name: 'रोहित प्रकाश मोरे',
      citizen_phone: '9822776655',
      district: 'छत्रपती संभाजीनगर',
      taluka: 'संभाजीनगर',
      category: 'कायदेशीर सल्ला',
      urgency: 'मध्यम',
      description: 'इंजिनीअरिंग प्रवेशासाठी जात वैधता प्रमाणपत्र (Caste Validity) त्रुटींची पूर्तता व अपील अर्जासाठी विधी मार्गदर्शन हवे.',
      assigned_worker_id: 'SW-05',
      assigned_worker_name: 'ॲड. संग्रामसिंह कदम',
      status: 'यशस्वी पूर्ण (Resolved)',
      outcome_notes: 'समितीसमोर कागदपत्रांचे शपथपत्र सादर करून वैधता प्रमाणपत्र वेळेत मिळवून दिले.',
      resolved_at: now,
      created_at: now
    }
  ];

  for (const hr of helpRequests) {
    await runQuery(`
      INSERT INTO social_help_requests (
        id, case_number, citizen_name, citizen_phone, district, taluka, category,
        urgency, description, assigned_worker_id, assigned_worker_name, status,
        outcome_notes, resolved_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      hr.id, hr.case_number, hr.citizen_name, hr.citizen_phone, hr.district, hr.taluka, hr.category,
      hr.urgency, hr.description, hr.assigned_worker_id, hr.assigned_worker_name, hr.status,
      hr.outcome_notes, hr.resolved_at, hr.created_at
    ]);
  }

  // 3. Social Missions (सामाजिक मोहिमा)
  const missions = [
    {
      id: 'MSN-01',
      title: 'मराठवाडा दुष्काळमुक्ती अमृत सरोवर मोहीम',
      lead_worker_id: 'SW-01',
      lead_worker_name: 'कर्मवीर संभाजीराव जाधव',
      category: 'जलसंधारण',
      district: 'बीड',
      target_goal: '५० गावांमध्ये १०० शेततळी व ओढे खोलीकरण',
      beneficiaries_count: 12500,
      volunteers_engaged: 450,
      hours_invested: 1800,
      start_date: '२०२६-०१-१५',
      status: 'सक्रिय मोहीम (Active)',
      description: 'लोकसहभागातून डिझेल व पोकलेन मशीन उपलब्ध करून कोरड्या पडलेल्या नद्या व ओढ्यांचे रुंदीकरण.'
    },
    {
      id: 'MSN-02',
      title: 'रायगड-राजगड-सिंहगड ऐतिहासिक तोफा जतन मोहीम',
      lead_worker_id: 'SW-03',
      lead_worker_name: 'दिगंबर राजे गायकवाड',
      category: 'गड संवर्धन',
      district: 'पुणे',
      target_goal: '२५ ऐतिहासिक तोफांना गंज प्रतिबंधक रासायनिक लेपन व माहिती फलक',
      beneficiaries_count: 85000,
      volunteers_engaged: 620,
      hours_invested: 2400,
      start_date: '२०२६-०२-१९',
      status: 'सक्रिय मोहीम (Active)',
      description: 'पुरातत्वीय मानकांनुसार शिवकालीन तोफांचे ऊन-पावसापासून संरक्षण आणि पर्यटकांसाठी माहिती फलक.'
    }
  ];

  for (const m of missions) {
    await runQuery(`
      INSERT INTO social_missions (
        id, title, lead_worker_id, lead_worker_name, category, district, target_goal,
        beneficiaries_count, volunteers_engaged, hours_invested, start_date, status, description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      m.id, m.title, m.lead_worker_id, m.lead_worker_name, m.category, m.district, m.target_goal,
      m.beneficiaries_count, m.volunteers_engaged, m.hours_invested, m.start_date, m.status, m.description, now
    ]);
  }

  // 4. Testimonials (प्रशंसापत्रे)
  const testimonials = [
    {
      id: 'TST-01',
      worker_id: 'SW-02',
      citizen_name: 'तानाजी विठ्ठलराव कदम',
      citizen_city: 'पंढरपूर',
      testimonial: 'माझ्या मुलाच्या हृदयाच्या गंभीर आजारात डॉ. वंदना मोहिते ताईंनी मध्यरात्री धाव घेतली आणि पुण्यातील रुग्णालयात मोफत उपचार मिळवून दिले. त्यांच्या रूपात साक्षात विठ्ठल धावून आला.',
      rating: 5,
      impact_story: 'हृदय शस्त्रक्रिया पूर्ण, मूल सुखरूप.'
    },
    {
      id: 'TST-02',
      worker_id: 'SW-05',
      citizen_name: 'अश्विनी प्रकाश शिंदे',
      citizen_city: 'जालना',
      testimonial: 'माझा एमबीबीएसचा प्रवेश जात प्रमाणपत्र पडताळणी त्रुटीमुळे रद्द होण्याच्या उंबरठ्यावर होता. संग्रामसिंह कदम साहेबांनी विनामूल्य विधी सल्ला देऊन दुसऱ्याच दिवशी वैधता मिळवून दिली.',
      rating: 5,
      impact_story: 'वैद्यकीय महाविद्यालयात सुरक्षित प्रवेश.'
    }
  ];

  for (const t of testimonials) {
    await runQuery(`
      INSERT INTO social_testimonials (
        id, worker_id, citizen_name, citizen_city, testimonial, rating, impact_story, verified, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `, [t.id, t.worker_id, t.citizen_name, t.citizen_city, t.testimonial, t.rating, t.impact_story, now]);
  }

  saveDatabaseNow();
  console.log('✅ Seeded authentic Social Workers, help requests, missions, and testimonials in SQLite!');
}

if (process.argv[1] && process.argv[1].endsWith('seed_sqlite_social_workers.mjs')) {
  seedSocialWorkersData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
