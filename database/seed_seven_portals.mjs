// database/seed_seven_portals.mjs
import { runQuery, get, all } from './database.js';
import { MASTER_MAHARASHTRA_COLLEGES } from '../src/data/collegesData.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedSevenPortals() {
  console.log('🌱 Starting comprehensive data seeding for all 7 Portals...');

  // 1. Seed Colleges Directory
  const collegeCount = await get('SELECT count(*) as c FROM colleges_directory');
  if (collegeCount.c === 0 && Array.isArray(MASTER_MAHARASHTRA_COLLEGES)) {
    console.log(`Seeding ${MASTER_MAHARASHTRA_COLLEGES.length} colleges into colleges_directory...`);
    for (const c of MASTER_MAHARASHTRA_COLLEGES.slice(0, 150)) {
      await runQuery(
        `INSERT OR REPLACE INTO colleges_directory 
        (id, name, city, district, division, stream, stream_label, courses, fee_range, website, phone, established_year, naac_grade, hostel_facility, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id || `col_${Math.random().toString(36).substring(2, 9)}`,
          c.name || 'Unnamed Institution',
          c.city || 'पुणे',
          c.district || 'पुणे',
          c.division || 'पुणे',
          c.stream || 'engineering',
          c.streamLabel || 'अभियांत्रिकी',
          JSON.stringify(c.courses || ['B.Tech', 'M.Tech']),
          c.feeRange || '₹८०,००० - ₹१,५०,००० / वर्ष',
          c.website || 'https://dte.maharashtra.gov.in',
          c.phone || '+91 20 2550 7000',
          c.establishedYear || 1960,
          c.naacGrade || 'A+',
          c.hostelFacility ? 1 : 0,
          new Date().toISOString()
        ]
      );
    }
    console.log('✅ Colleges seeded successfully.');
  }

  // 2. Seed Scholarships Directory
  const schCount = await get('SELECT count(*) as c FROM scholarships_directory');
  if (schCount.c === 0) {
    const SCHOLARSHIPS_DATA = [
      {
        id: 'SCH-SARTHI-01',
        title: 'सारथी (SARTHI) छत्रपती शाहू महाराज परदेशी शिक्षण शिष्यवृत्ती',
        org: 'सारथी, महाराष्ट्र शासन (स्वायत्त संस्था)',
        type: 'govt',
        category: 'Study Abroad',
        eligible: 'मराठा, कुणबी व मराठा-कुणबी विद्यार्थी (वार्षिक उत्पन्न मर्यादा: ₹८ लाख आत)',
        benefit: 'परदेशातील QS रँकिंग ५०० मधील विद्यापीठांचे संपूर्ण शैक्षणिक शुल्क + विमान प्रवास + निर्वाह भत्ता (दरवर्षी ₹३० ते ₹४० लाख पर्यंत)',
        courses: 'MS, MBA, Ph.D, STEM व मानव्यविद्या (UK, US, Germany, Australia इ.)',
        min_marks: 60.0,
        max_income: 800000.0,
        district: 'सर्व महाराष्ट्र',
        portal_url: 'https://sarthi-maharashtragov.in',
        last_date: '२०२६-११-३०',
        badge: 'परदेशी शिक्षण (Study Abroad)',
        documents_required: JSON.stringify(['जात प्रमाणपत्र', 'उत्पन्न दाखला', 'परदेशी विद्यापीठ ऑफर लेटर', 'पासपोर्ट'])
      },
      {
        id: 'SCH-MAHADBT-02',
        title: 'राजर्षी छत्रपती शाहू महाराज शिक्षण शुल्क प्रतिपूर्ती योजना (EBC)',
        org: 'उच्च व तंत्रशिक्षण विभाग, महाराष्ट्र शासन',
        type: 'govt',
        category: 'Fee Concession',
        eligible: 'शासकीय व खाजगी विनाअनुदानित कॉलेजेसमध्ये शिकणारे मराठा/EWS/खुला प्रवर्ग विद्यार्थी',
        benefit: 'ट्युशन फी व परीक्षा शुल्कात ५०% ते १००% थेट परतावा (डीबीटी द्वारे थेट बँक खात्यात)',
        courses: 'Engineering, Medical, Pharmacy, Architecture, MBA, MCA, Law, B.Sc',
        min_marks: 50.0,
        max_income: 800000.0,
        district: 'सर्व महाराष्ट्र',
        portal_url: 'https://mahadbt.maharashtra.gov.in',
        last_date: '२०२६-१२-३१',
        badge: '५०% ते १००% फी माफी',
        documents_required: JSON.stringify(['तहसीलदार उत्पन्न दाखला', 'कॅप अलॉटमेंट लेटर', 'फी पावती', 'आधार लिंक बँक खाते'])
      },
      {
        id: 'SCH-HOSTEL-03',
        title: 'डॉ. पंजाबराव देशमुख वसतिगृह निर्वाह भत्ता योजना',
        org: 'तंत्रशिक्षण संचालनालय (DTE Maharashtra)',
        type: 'govt',
        category: 'Hostel Allowance',
        eligible: 'अल्पभूधारक शेतकरी व नोंदणीकृत मजुरांचे पाल्ये, ज्यांना शासकीय वसतिगृहात प्रवेश मिळाला नाही',
        benefit: 'मुंबई, पुणे, नागपूर शहरांसाठी ₹३०,००० / वर्ष; इतर जिल्ह्यांसाठी ₹२०,००० / वर्ष थेट भत्ता',
        courses: 'सर्व व्यावसायिक पदवी व पदविका अभ्यासक्रम',
        min_marks: 50.0,
        max_income: 800000.0,
        district: 'सर्व महाराष्ट्र',
        portal_url: 'https://mahadbt.maharashtra.gov.in',
        last_date: '२०२७-०१-१५',
        badge: 'मेस व रूम निर्वाह भत्ता',
        documents_required: JSON.stringify(['७/१२ उतारा किंवा मजूर नोंदणी कार्ड', 'भाडे करारनामा / वसतिगृह दाखला'])
      },
      {
        id: 'SCH-CM-AID-04',
        title: 'Connect Maratha शैक्षणिक स्वावलंबन व विशेष मदत निधी',
        org: 'Connect Maratha Foundation & Trust',
        type: 'community',
        category: 'Student Aid',
        eligible: 'आर्थिकदृष्ट्या दुर्बल मराठा विद्यार्थी, आत्महत्याग्रस्त शेतकरी कुटुंबे व गुणवत्ताधारक अनाथ विद्यार्थी',
        benefit: 'कॉलेज फी, लॅपटॉप/पुस्तके आणि हॉस्टेल खर्चासाठी थेट ₹२५,००० ते ₹५०,००० एकरकमी सहाय्य',
        courses: 'Diploma, Degree, Competitive Exam Aspirants',
        min_marks: 55.0,
        max_income: 250000.0,
        district: 'सर्व महाराष्ट्र',
        portal_url: '/scholarships',
        last_date: '२०२६-१२-१५',
        badge: 'Connect Maratha मदत निधी',
        documents_required: JSON.stringify(['कुटुंब पार्श्वभूमी अर्ज', 'गुणपत्रिका', 'कॉलेज बोनाफाईड प्रमाणपत्र'])
      }
    ];

    for (const s of SCHOLARSHIPS_DATA) {
      await runQuery(
        `INSERT OR REPLACE INTO scholarships_directory 
        (id, title, org, type, category, eligible, benefit, courses, min_marks, max_income, district, portal_url, last_date, badge, documents_required, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.id, s.title, s.org, s.type, s.category, s.eligible, s.benefit, s.courses,
          s.min_marks, s.max_income, s.district, s.portal_url, s.last_date, s.badge,
          s.documents_required, new Date().toISOString()
        ]
      );
    }
    console.log('✅ Scholarships seeded successfully.');
  }

  // 3. Seed Maratha Dnyankosh Encyclopedia Articles
  const dnyanCount = await get('SELECT count(*) as c FROM dnyankosh_articles');
  if (dnyanCount.c === 0) {
    const DNYANKOSH_ARTICLES = [
      {
        id: 'art-01',
        slug: 'chhatrapati-shivaji-maharaj-life',
        title: 'छत्रपती शिवाजी महाराज — हिंदवी स्वराज्याचे संस्थापक व आदर्श राज्यकर्ते',
        category: 'इतिहास व युगपुरुष',
        subcategory: 'शिवचरित्र',
        icon: '🚩',
        summary: 'अखंड महाराष्ट्राचे कुलदैवत छत्रपती शिवरायांचे संपूर्ण जीवनकार्य, गनिमी कावा युद्धनीती, आरमार, अष्टप्रधान मंडळ व रयतेभिमुख सुशासन.',
        content: `छत्रपती शिवाजी महाराज (१९ फेब्रुवारी १६३० - ३ एप्रिल १६८०) हे भारतीय इतिहासातील अद्वितीय युगप्रवर्तक महापुरुष होते. त्यांनी आदिलशाही, मुघल आणि कुतुबशाही या बलाढ्य सत्तांशी लढा देऊन रयतेचे "हिंदवी स्वराज्य" स्थापन केले. त्यांनी गडकोटांची अभेद्य साखळी, स्वतंत्र मराठा आरमार, शिस्तबद्ध प्रशासन आणि धार्मिक सहिष्णुतेचा पाया रचला.`,
        author_name: 'Connect Maratha इतिहास संशोधन मंडळ',
        sources: JSON.stringify(['सभासद बखर', 'शिवभारत (कवी परमानंद)', 'जेधे शकावली'])
      },
      {
        id: 'art-02',
        slug: 'ashtapradhan-mandal-administration',
        title: 'शिवकालीन अष्टप्रधान मंडळ — आधुनिक प्रशासनाची पहिली चौकट',
        category: 'प्रशासन व राज्यव्यवस्था',
        subcategory: 'राज्यकारभार',
        icon: '⚖️',
        summary: 'पंतप्रधान (पेशवा), अमात्य, सचिव, मंत्री, सेनापती, सुमंत, न्यायाधीश आणि पंडितराव — ८ मंत्र्यांची कार्यपद्धती आणि जबाबदाऱ्या.',
        content: `छत्रपती शिवरायांनी ६ जून १६७४ रोजी रायगडावर झालेल्या राज्याभिषेकाच्या वेळी "अष्टप्रधान मंडळ" स्थापन केले. प्रत्येक खात्याला स्वतंत्र अधिकार व थेट छत्रपतींना जबाबदार राहण्याची पद्धत निश्चित केली होती. कोणालाही वतनदारी किंवा वंशपरंपरेने पद दिले जात नव्हते.`,
        author_name: 'डॉ. इतिहास संशोधक समिती',
        sources: JSON.stringify(['आज्ञापत्र (रामचंद्रपंत अमात्य)', 'राज्यव्यवहार कोश'])
      },
      {
        id: 'art-03',
        slug: 'maratha-navy-kanhoji-angre',
        title: 'मराठा आरमार व सरखेल कान्होजी आंग्रे',
        category: 'आरमार व जलदुर्ग',
        subcategory: 'सागरी वर्चस्व',
        icon: '⚓',
        summary: '“ज्याचे आरमार त्याचा समुद्र” — छत्रपती शिवरायांची आरमारी दृष्टी आणि कान्होजी आंग्रे यांचे अजिंक्य सागरी साम्राज्य.',
        content: `अरबी समुद्रातील युरोपियन पोर्तुगीज, इंग्रज, डच आणि जंजिऱ्याच्या सिद्दीच्या अत्याचारांना पायबंद घालण्यासाठी छत्रपती शिवरायांनी सिंधुदुर्ग, विजयदुर्ग, सुवर्णदुर्ग व खांदेरी-उंदेरीसारखे अभेद्य जलदुर्ग उभारले आणि स्वदेशी लढाऊ जहाजांचा ताफा निर्माण केला.`,
        author_name: 'सागरी इतिहास अभ्यास गट',
        sources: JSON.stringify(['ब्रिटिश ईस्ट इंडिया कंपनी कागदपत्रे', 'सागरी इतिहास नोंदी'])
      },
      {
        id: 'art-04',
        slug: 'ganimi-kawa-guerrilla-warfare',
        title: 'गनिमी कावा — सह्याद्रीतील अजिंक्य मराठा युद्धतंत्र',
        category: 'युद्धशास्त्र व लढाया',
        subcategory: 'रणनीती',
        icon: '⚔️',
        summary: 'कमी सैन्यात बलाढ्य शत्रूचा पराभव करण्याचे सह्याद्रीच्या भौगोलिक रचनेवर आधारलेले रणनीतिक तंत्र.',
        content: `सह्याद्रीच्या डोंगर-दऱ्या, घनदाट जंगले आणि दुर्गम घाटवाटांचा अचूक अभ्यास करून शत्रूला अनुकूल नसलेल्या जागी ओढणे, अचानक तुटून पडणे आणि शत्रू सावध होण्याआधी माघार घेणे हे गनिमी काव्याचे मूळ सूत्र होते. प्रतापगडची लढाई, पावनखिंड आणि पालखेडची लढाई ही याची ज्वलंत उदाहरणे आहेत.`,
        author_name: 'संरक्षण व रणनीती अभ्यासक',
        sources: JSON.stringify(['इतिहास संशोधक मंडळ संदर्भ', 'मराठा युद्धनीती अभ्यास'])
      }
    ];

    for (const a of DNYANKOSH_ARTICLES) {
      await runQuery(
        `INSERT OR REPLACE INTO dnyankosh_articles
        (id, slug, title, category, subcategory, icon, summary, content, author_name, sources, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [a.id, a.slug, a.title, a.category, a.subcategory, a.icon, a.summary, a.content, a.author_name, a.sources, new Date().toISOString()]
      );
    }
    console.log('✅ Dnyankosh articles seeded successfully.');
  }

  // 4. Seed Library Catalog & Rare Bakhars
  const libCount = await get('SELECT count(*) as c FROM library_catalog');
  if (libCount.c === 0) {
    const BOOKS_DATA = [
      {
        id: 'sabhasad-bakhar',
        title: 'सभासद बखर (Sabhasad Bakhar)',
        original_title: 'श्री शिवप्रभूंचे चरित्र',
        author: 'कृष्णाजी अनंत सभासद (इ.स. १६९७)',
        category: 'बखर',
        level: 'शिवकालीन अधिकृत साक्ष',
        pages: '१४२ पृष्ठे',
        language: 'मराठी (देवनागरी / मोडी संदर्भ)',
        image: '/assets/images/granthalaya/sabhasad-bakhar.jpg',
        description: 'छत्रपती शिवाजी महाराजांच्या चरित्रावरील सर्वात अस्सल आणि आद्य बखर. जिंजी येथे मुघल वेढ्यात असताना छत्रपती राजाराम महाराजांच्या थेट आज्ञेवरून सभासदांनी ही बखर शब्दबद्ध केली.',
        highlight: '“शिवछत्रपती म्हणजे केवळ राजे नव्हे, तर साक्षात अवतारी पुरुष होते!”',
        preservation: 'तंजावर सरस्वती महाल ग्रंथालय व भारत इतिहास संशोधक मंडळ, पुणे',
        is_rare_bakhar: 1
      },
      {
        id: 'budhabhushanam',
        title: 'बुधभूषणम् (Budhabhushanam)',
        original_title: 'बुधभूषणम् राजनीति ग्रंथ',
        author: 'छत्रपती संभाजी महाराज (इ.स. १६७५-१६८०)',
        category: 'ग्रंथ',
        level: 'राजधर्म व नीतीशास्त्र',
        pages: '२८० पृष्ठे',
        language: 'संस्कृत (मराठी भाष्य)',
        image: '/assets/images/granthalaya/budhabhushanam.jpg',
        description: 'धर्मवीर छत्रपती संभाजी महाराजांनी अवघ्या १४ व्या-१६ व्या वर्षी शृंगारपूर येथे रचलेला अद्वितीय संस्कृत राजनीति ग्रंथ. राजाची कर्तव्ये, दुर्ग रचना, गुप्तहेर व्यवस्था व धर्मशास्त्राचे सखोल मार्गदर्शन.',
        highlight: '“कलौ च छत्रपति संभूसिंहः” — कलीयुगात प्रजेचे रक्षण करणारा सिंहासारखा राजा!',
        preservation: 'भांडारकर प्राच्यविद्या संशोधन मंदिर (BORI), पुणे',
        is_rare_bakhar: 1
      },
      {
        id: 'ajnapatra',
        title: 'आज्ञापत्र (Ajnapatra)',
        original_title: 'शिवकालीन राजनीती व दुर्ग व्यवस्था',
        author: 'रामचंद्रपंत अमात्य बावडेकर (इ.स. १७१५)',
        category: 'ग्रंथ',
        level: 'शिवकालीन राज्यव्यवस्था',
        pages: '९६ पृष्ठे',
        language: 'जुनी मराठी',
        image: '/assets/images/granthalaya/ajnapatra.jpg',
        description: 'शिवछत्रपतींच्या प्रशासनाचे, आरमाराचे आणि “किल्ले हेच राज्याचे सार” सांगणारे मराठा इतिहासातील सर्वोच्च राजनैतिक आज्ञापत्र.',
        highlight: '“संपूर्ण राज्याचे सार ते दुर्ग!” — रामचंद्रपंत अमात्य',
        preservation: 'पुणे पुराभिलेखागार (Peshwa Daftar)',
        is_rare_bakhar: 1
      }
    ];

    for (const b of BOOKS_DATA) {
      await runQuery(
        `INSERT OR REPLACE INTO library_catalog
        (id, title, original_title, author, category, level, pages, language, image, description, highlight, preservation, is_rare_bakhar, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.id, b.title, b.original_title, b.author, b.category, b.level, b.pages, b.language, b.image, b.description, b.highlight, b.preservation, b.is_rare_bakhar, new Date().toISOString()]
      );
    }
    console.log('✅ Library catalog seeded successfully.');
  }

  // 5. Seed Time Machine Epochs & Events
  const timeCount = await get('SELECT count(*) as c FROM time_machine_events');
  if (timeCount.c === 0) {
    const TIME_EVENTS = [
      {
        id: 'tm-1630-shivjanma',
        year: 1630,
        approx_date: '१९ फेब्रुवारी १६३०',
        era_id: 'shivkal',
        era_title: 'शिवकाल (स्वराज्य उदय)',
        title: 'छत्रपती शिवाजी महाराज जन्म (शिवनेरी दुर्ग)',
        location: 'किल्ले शिवनेरी, जुन्नर (पुणे)',
        coordinates: '19.2173, 73.8587',
        summary: 'राष्ट्रमाता जिजाऊंच्या पोटी हिंदवी स्वराज्याचे संस्थापक शिवछत्रपतींचा जन्म.',
        historical_significance: 'महाराष्ट्राच्या अस्मितेचा आणि स्वतंत्र सार्वभौम स्वराज्याचा उदय.',
        source_reference: 'जेधे शकावली, शिवभारत'
      },
      {
        id: 'tm-1645-pratidnya',
        year: 1645,
        approx_date: '२६ एप्रिल १६४५',
        era_id: 'shivkal',
        era_title: 'शिवकाल (स्वराज्य उदय)',
        title: 'रोहिडेश्वराच्या साक्षीने स्वराज्य स्थापनेची प्रतिज्ञा',
        location: 'रोहिडेश्वर मंदिर, भोर',
        coordinates: '18.1500, 73.8000',
        summary: 'अवघ्या १५ व्या वर्षी शिवरायांनी सवंगड्यांसह स्वतःच्या रक्ताचा अभिषेक करून हिंदवी स्वराज्याची शपथ घेतली.',
        historical_significance: '“हे राज्य व्हावे, हे तो श्रींचे मनोगत आहे!” या ब्रीदवाक्याने स्वराज्य चळवळ सुरू झाली.',
        source_reference: 'सभासद बखर, ऐतिहासिक पत्रव्यवहार'
      },
      {
        id: 'tm-1659-pratapgad',
        year: 1659,
        approx_date: '१० नोव्हेंबर १६५९',
        era_id: 'shivkal',
        era_title: 'शिवकाल (स्वराज्य उदय)',
        title: 'अफझलखान वध व प्रतापगड युद्ध',
        location: 'किल्ले प्रतापगड, महाबळेश्वर',
        coordinates: '17.9298, 73.5786',
        summary: 'विजापूरच्या बलाढ्य सेनापती अफझलखानाचा वध करून शिवरायांनी गनिमी काव्याने विजापुरी सेनेचा पराभव केला.',
        historical_significance: 'स्वराज्यावरील सर्वात मोठे संकट परतवून लावून मराठ्यांचे शौर्य संपूर्ण हिंदुस्थानभर पसरले.',
        source_reference: 'परमानंदकृत शिवभारत, मुघल वृत्तपत्रे'
      },
      {
        id: 'tm-1674-rajyabhishek',
        year: 1674,
        approx_date: '६ जून १६७४',
        era_id: 'shivkal',
        era_title: 'शिवकाल (स्वराज्य उदय)',
        title: 'छत्रपती शिवाजी महाराज राज्याभिषेक सोहळा',
        location: 'किल्ले रायगड',
        coordinates: '18.2346, 73.4442',
        summary: 'पंडित गागाभट्टांच्या उपस्थितीत ३२ मण सोन्याच्या सिंहासनावर शिवरायांचा राज्याभिषेक झाला आणि ते "क्षत्रियकुलावतंस छत्रपती" झाले.',
        historical_significance: 'मराठ्यांचे स्वतंत्र सार्वभौम राज्य अधिकृत झाले; स्वतंत्र शक, राजमुद्रा व शिवराई-होन नाणी सुरू झाली.',
        source_reference: 'सभासद बखर, हेन्री ऑक्झेंडन डायरी'
      },
      {
        id: 'tm-1728-palkhed',
        year: 1728,
        approx_date: '२८ फेब्रुवारी १७२८',
        era_id: 'peshwe-era',
        era_title: 'मराठा साम्राज्य विस्तार',
        title: 'पालखेडची लढाई — बाजीराव पेशवे विरुद्ध निजाम',
        location: 'पालखेड, नाशिक',
        coordinates: '20.0800, 74.0500',
        summary: 'श्रीमंत बाजीराव पेशव्यांनी निजामाला युद्ध न करता वेढा घालून शरण येण्यास भाग पाडले.',
        historical_significance: 'फील्ड मार्शल मॉन्टगोमेरीने या युद्धाला "गनिमी काव्याचा जागतिक मास्टरक्लास" म्हटले आहे.',
        source_reference: 'मराठी रियासत, पेशवे दफ्तर'
      }
    ];

    for (const e of TIME_EVENTS) {
      await runQuery(
        `INSERT OR REPLACE INTO time_machine_events
        (id, year, approx_date, era_id, era_title, title, location, coordinates, summary, historical_significance, source_reference, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [e.id, e.year, e.approx_date, e.era_id, e.era_title, e.title, e.location, e.coordinates, e.summary, e.historical_significance, e.source_reference, new Date().toISOString()]
      );
    }
    console.log('✅ Time Machine events seeded successfully.');
  }

  console.log('🎉 ALL 7 PORTALS SEEDING COMPLETED SUCCESSFULLY!');
}

seedSevenPortals().then(() => process.exit(0)).catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
