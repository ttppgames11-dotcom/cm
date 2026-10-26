// backend/scripts/seed_knowledge_portals.mjs
import { runQuery, get, saveDatabaseNow } from '../../database/database.js';

async function seedKnowledgePortals() {
  console.log('Seeding initial data for Dnyankosh, Scholarships, Library, and Time Machine...');

  // 1. Scholarships
  const existingScholarships = await get('SELECT COUNT(*) as c FROM scholarships_directory');
  if (existingScholarships.c === 0) {
    const scholarships = [
      {
        id: 'sch_sarathi_01',
        title: 'छत्रपती शाहू महाराज राष्ट्रीय संशोधन अधिछात्रवृत्ती (CSMNRF)',
        org: 'सारथी (SARTHI), पुणे',
        type: 'govt',
        category: 'मराठा व कुणबी विद्यार्थी',
        eligible: 'M.Phil / Ph.D. चे शिक्षण घेणारे मराठा, कुणबी, मराठा-कुणबी विद्यार्थी',
        benefit: '₹३१,००० ते ₹३५,००० प्रतिमहिना + वार्षिक आकस्मिक निधी',
        courses: 'Ph.D, M.Phil',
        min_marks: 55,
        max_income: 800000,
        district: 'सर्व महाराष्ट्र',
        portal_url: 'https://sarthi-maharashtragov.in',
        last_date: '३१ डिसेंबर २०२६',
        badge: 'उच्च संशोधन'
      },
      {
        id: 'sch_ebc_02',
        title: 'राजर्षी छत्रपती शाहू महाराज शिक्षण शुल्क शिष्यवृत्ती (EBC)',
        org: 'उच्च व तंत्रशिक्षण विभाग, महाराष्ट्र शासन',
        type: 'govt',
        category: 'EBC / मराठा प्रवर्ग',
        eligible: 'कुटुंबाचे वार्षिक उत्पन्न ८ लाखांपर्यंत असणारे खुल्या व मराठा प्रवर्गातील विद्यार्थी',
        benefit: '५०% शिक्षण शुल्क व परीक्षा शुल्क परतावा',
        courses: 'अभियांत्रिकी, वैद्यकीय, कृषी, फार्मसी, विधी, व्यवस्थापन',
        min_marks: 50,
        max_income: 800000,
        district: 'सर्व महाराष्ट्र',
        portal_url: 'https://mahadbt.maharashtra.gov.in',
        last_date: '३१ मार्च २०२७',
        badge: 'सर्वाधिक लोकप्रिय'
      },
      {
        id: 'sch_punyashlok_03',
        title: 'पुण्यश्लोक अहिल्यादेवी होळकर मुलींचे मोफत उच्च शिक्षण योजना',
        org: 'महाराष्ट्र शासन',
        type: 'govt',
        category: 'मुलींचे उच्च शिक्षण',
        eligible: '८ लाखांपेक्षा कमी कौटुंबिक उत्पन्न असलेल्या सर्व विद्यार्थिनी',
        benefit: '१००% मोफत उच्च व व्यावसायिक शिक्षण शुल्क',
        courses: 'सर्व व्यावसायिक पदवी व पदव्युत्तर कोर्सेस',
        min_marks: 45,
        max_income: 800000,
        district: 'सर्व महाराष्ट्र',
        portal_url: 'https://mahadbt.maharashtra.gov.in',
        last_date: 'चालू योजना',
        badge: '१००% मोफत'
      },
      {
        id: 'sch_swadhar_04',
        title: 'डॉ. बाबासाहेब आंबेडकर स्वाधार व पंडित दीनदयाळ वसतिगृह भत्ता योजना',
        org: 'सामाजिक न्याय विभाग',
        type: 'govt',
        category: 'वसतिगृह व भोजन भत्ता',
        eligible: 'शासकीय वसतिगृहात प्रवेश न मिळालेले उच्च शिक्षण घेणारे विद्यार्थी',
        benefit: 'वार्षिक ₹५१,००० ते ₹६०,००० भोजन व निवास भत्ता थेट खात्यात',
        courses: 'सर्व पदवी व उच्च शिक्षण',
        min_marks: 50,
        max_income: 250000,
        district: 'महानगर व जिल्हे',
        portal_url: 'https://mahadbt.maharashtra.gov.in',
        last_date: 'वार्षिक प्रवेश सत्र',
        badge: 'वसतिगृह साहाय्य'
      }
    ];

    for (const s of scholarships) {
      await runQuery(`
        INSERT INTO scholarships_directory (
          id, title, org, type, category, eligible, benefit, courses,
          min_marks, max_income, district, portal_url, last_date, badge,
          documents_required, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'))
      `, [
        s.id, s.title, s.org, s.type, s.category, s.eligible, s.benefit, s.courses,
        s.min_marks, s.max_income, s.district, s.portal_url, s.last_date, s.badge,
        JSON.stringify(['उत्पन्न दाखला', 'अधिवास प्रमाणपत्र', 'गुणपत्रिका'])
      ]);
    }
    console.log(`[+] Seeded ${scholarships.length} scholarships into scholarships_directory`);
  }

  // 2. Dnyankosh Articles
  const existingArticles = await get('SELECT COUNT(*) as c FROM dnyankosh_articles');
  if (existingArticles.c === 0) {
    const articles = [
      {
        id: 'art_shivaji_coronation',
        slug: 'chhatrapati-shivaji-maharaj-rajyabhisheka-1674',
        title: 'छत्रपती शिवाजी महाराज राज्याभिषेक सोहळा (६ जून १६७४) — एक युगप्रवर्तक क्रांती',
        category: 'मराठा इतिहास',
        subcategory: 'शिवचरित्र',
        icon: '👑',
        summary: '६ जून १६७४ रोजी दुर्गराज रायगडावर संपन्न झालेला राज्याभिषेक सोहळा, हिंदवी स्वराज्याची सार्वभौम घोषणा आणि शिवशक निर्मिती.',
        content: `हिंदवी स्वराज्याचे संस्थापक छत्रपती शिवाजी महाराज यांचा ज्येष्ठ शुद्ध त्रयोदशी, आनंद नाम संवत्सर, शके १५९६ म्हणजेच ६ जून १६७४ रोजी रायगड किल्ल्यावर विधिपूर्वक राज्याभिषेक संपन्न झाला.

या ऐतिहासिक दिनी महाराजांनी 'छत्रपती' हे पद धारण केले, 'शिवछत्रपती' या नावाने नवीन नाणी पाडली आणि 'शिवशक' ही स्वतंत्र कालगणना सुरू केली. रायगडावरील सुवर्ण सिंहासनावर आरूढ होऊन महाराजांनी परकीय जुलमी सत्तेला पायबंद घालत रयतेचे सार्वभौम स्वराज्य स्थापन केले.

राज्याभिषेकामुळे मराठा सत्ता ही कायदेशीर, स्वतंत्र आणि सार्वभौम राज्य म्हणून जगाच्या नकाशावर मान्य झाली. इंग्रज प्रतिनिधी हेन्री ऑक्झिंडेन याने या सोहळ्याचे प्रत्यक्ष वर्णन आपल्या दैनंदिनीत नोंदवले आहे.`,
        author_name: 'इतिहास संशोधन मंडळ'
      },
      {
        id: 'art_maratha_navy_kanhoji',
        slug: 'maratha-navy-sarkhel-kanhoji-angre',
        title: 'मराठा आरमार व सरखेल कान्होजी आंग्रे यांचे नौदल नेतृत्व',
        category: 'मराठा नौदल',
        subcategory: 'आरमार व किल्ले',
        icon: '⚓',
        summary: 'सिंधुदुर्ग, विजयदुर्ग, सुवर्णदुर्ग या जलदुर्गांच्या आधारे मराठा आरमाराने पश्चिमेकडील अरबी समुद्रावर निर्माण केलेले अढळ वर्चस्व.',
        content: `छत्रपती शिवाजी महाराजांनी समुद्राचे सामरिक महत्त्व ओळखून "ज्याचे आरमार त्याचा समुद्र" हे नौदल धोरण राबवले. महाराजांनंतर सरखेल कान्होजी आंग्रे यांनी मराठा आरमाराचे नेतृत्व करत इंग्रज, पोर्तुगीज आणि डच आरमाराला सळो की पळो करून सोडले.

मराठा लढाऊ जहाजे — गुराब, गलबत, पाल आणि मचवा — स्थानिक सागरी हवामानास अत्यंत अनुकूल होती. विजयदुर्ग हे आरमाराचे मुख्य केंद्र होते, जिथे जहाजांची दुरुस्ती, गोदी (Dockyard) आणि शस्त्रागार होते. कान्होजी आंग्रे यांनी आपल्या कारकिर्दीत अजिंक्य राहून समुद्रावरील स्वराज्याचे सार्वभौमत्व कायम राखले.`,
        author_name: 'प्रा. वा. सी. बेंद्रे अभ्यास गट'
      },
      {
        id: 'art_fort_architecture',
        slug: 'maharashtra-fort-architecture-ramchandra-pant',
        title: 'रामचंद्रपंत अमात्य यांचे आज्ञापत्र आणि शिवकालीन दुर्गबांधणीचे शास्त्र',
        category: 'गड-किल्ले',
        subcategory: 'प्रशासन व संरक्षण',
        icon: '🏰',
        summary: 'किल्ल्यांचे रक्षण, चिलखती बुरूज, नैसर्गिक कडे आणि पाण्याची तळी यांचे व्यवस्थापन सांगणारे शिवकालीन आज्ञापत्र.',
        content: `रामचंद्रपंत अमात्य विरचित 'आज्ञापत्र' हा मराठा राजकारभार आणि दुर्गसंरक्षणाचा सर्वश्रेष्ठ ग्रंथ मानला जातो. "दुर्ग म्हणजे स्वराज्याचे मूळ, दुर्ग म्हणजे खजिना, दुर्ग म्हणजे सैन्याचे बळ, दुर्ग म्हणजे राज्य" असे आज्ञापत्रात नमूद आहे.

शिवकालीन किल्ल्यांची मुख्य वैशिष्ट्ये:
१. गोमुखी रचना: दरवाजा दुरून शत्रूला दिसू नये अशी बुरुजांमागे लपलेली रचना.
२. पाण्याची मुबलकता: गडावर बारमाही पाण्याचे पाझर व टाक्यांची निर्मिती.
३. दुहेरी तटबंदी व चिलखती बुरूज: तोफांच्या माऱ्याला तोंड देण्यासाठी दगडी चिरेबंदी बांधकाम.`,
        author_name: 'दुर्गसंवर्धन व्यासपीठ'
      }
    ];

    for (const a of articles) {
      await runQuery(`
        INSERT INTO dnyankosh_articles (
          id, slug, title, category, subcategory, icon, summary, content,
          author_id, author_name, status, sources, related_links, views_count, likes_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'system_editor', ?, 'published', ?, ?, 125, 45, datetime('now'), datetime('now'))
      `, [
        a.id, a.slug, a.title, a.category, a.subcategory, a.icon, a.summary, a.content,
        a.author_name, JSON.stringify(['शिवकालीन आज्ञापत्र', 'हेन्री ऑक्झिंडेन डायरी']), JSON.stringify([])
      ]);
    }
    console.log(`[+] Seeded ${articles.length} articles into dnyankosh_articles`);
  }

  // 3. Digital Library (Granthalaya)
  const existingBooks = await get('SELECT COUNT(*) as c FROM library_catalog');
  if (existingBooks.c === 0) {
    const books = [
      {
        id: 'bk_sabhasad_bakhar',
        title: 'श्री शिवछत्रपतींचे चरित्र (सभासद बखर)',
        original_title: 'कृष्णाजी अनंत सभासद कृत बखर',
        author: 'कृष्णाजी अनंत सभासद',
        category: 'बखर व ऐतिहासिक दस्तऐवज',
        level: 'मूळ ऐतिहासिक साधन',
        pages: '११२ पाने',
        language: 'मराठी (प्राचीन मोडी आधारित)',
        description: 'छत्रपती राजाराम महाराजांच्या आज्ञेवरून जिंजीच्या किल्ल्यावर इ.स. १६९७ मध्ये लिहिलेली सर्वात अस्सल व अधिकृत शिवचरित्र बखर.',
        highlight: '"या युगी असा राजा जाहला नाही" — सभासदांचे उद्गार',
        preservation: 'डिजिटल जतन व मोडी उतारा',
        is_rare_bakhar: 1,
        pdf_url: '/assets/docs/sabhasad_bakhar_archived.pdf'
      },
      {
        id: 'bk_ajnapatra',
        title: 'शिवकालीन आज्ञापत्र (मराठ्यांचे राजनीतिशास्त्र)',
        original_title: 'रामचंद्रपंत अमात्य विरचित आज्ञापत्र',
        author: 'रामचंद्रपंत अमात्य बावडेकर',
        category: 'राजनीती व प्रशासन',
        level: 'प्रमाणित संदर्भग्रंथ',
        pages: '८४ पाने',
        language: 'मराठी',
        description: 'मराठा प्रशासकीय व्यवस्था, जलदुर्ग संरक्षण, आरमार आणि परकीय व्यापार यांविषयीचे अचूक मार्गदर्शन.',
        highlight: 'दुर्ग म्हणजे राज्याचे मूळ, आरमार म्हणजे समुद्रावरील सत्ता.',
        preservation: 'डिजिटल प्रत उपलब्ध',
        is_rare_bakhar: 1,
        pdf_url: '/assets/docs/ajnapatra_reference.pdf'
      },
      {
        id: 'bk_panipat_bakhar',
        title: 'भाऊसाहेबांची बखर (पानिपत महायुद्ध १६६१)',
        original_title: 'भाऊसाहेबांची बखर',
        author: 'समकालीन लेखक',
        category: 'बखर व ऐतिहासिक दस्तऐवज',
        level: 'ऐतिहासिक दस्तऐवज',
        pages: '१४८ पाने',
        language: 'मराठी',
        description: '१४ जानेवारी १७६१ रोजी घडलेल्या तिसऱ्या पानिपत युद्धाचे सविस्तर व हृदयद्रावक समकालीन वर्णन.',
        highlight: 'लाख बांगडी फुटली, दोन मोत्ये गळाली, सत्तावीस मोहरा हरवल्या!',
        preservation: 'डिजिटल संदर्भ प्रत',
        is_rare_bakhar: 1,
        pdf_url: '/assets/docs/bhausaheb_bakhar.pdf'
      }
    ];

    for (const b of books) {
      await runQuery(`
        INSERT INTO library_catalog (
          id, title, original_title, author, category, level, pages,
          language, description, highlight, preservation, is_rare_bakhar,
          status, pdf_url, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verified', ?, datetime('now'))
      `, [
        b.id, b.title, b.original_title, b.author, b.category, b.level, b.pages,
        b.language, b.description, b.highlight, b.preservation, b.is_rare_bakhar,
        b.pdf_url
      ]);
    }
    console.log(`[+] Seeded ${books.length} books into library_catalog`);
  }

  // 4. Time Machine Events
  const existingEvents = await get('SELECT COUNT(*) as c FROM time_machine_events');
  if (existingEvents.c === 0) {
    const events = [
      {
        id: 'ev_1630_birth',
        year: 1630,
        approx_date: '१९ फेब्रुवारी १६३०',
        era_id: 'shivaji_maharaj',
        era_title: 'छत्रपती शिवाजी महाराज कालखंड',
        title: 'छत्रपती शिवाजी महाराजांचा शिवनेरी किल्ल्यावर जन्म',
        location: 'किल्ले शिवनेरी, जुन्नर (पुणे)',
        summary: 'राष्ट्रमाता जिजाऊ माँसाहेबांच्या पोटी शिवनेरीवर युगप्रवर्तक शिवरायांचा जन्म झाला.',
        details: 'महाराष्ट्राच्या अस्मितेचा आणि हिंदवी स्वराज्याचा पाया घालणाऱ्या शिवछत्रपतींचा जन्म जुन्नर येथील शिवनेरी गडावर शिवाई देवीच्या आशीर्वादाने झाला.',
        historical_significance: 'स्वराज्याची पहाट आणि दास्यातून महाराष्ट्राची मुक्ती',
        source_reference: 'जेधे शकावली, शिवभारत'
      },
      {
        id: 'ev_1645_torana',
        year: 1645,
        approx_date: '२६ एप्रिल १६४५',
        era_id: 'shivaji_maharaj',
        era_title: 'छत्रपती शिवाजी महाराज कालखंड',
        title: 'तोरणा किल्ला जिंकून स्वराज्याचे तोरण बांधले',
        location: 'किल्ले तोरणा (प्रचंडगड), पुणे',
        summary: 'वय अवघे १५-१६ वर्षे असताना महाराजांनी तोरणा किल्ला घेऊन हिंदवी स्वराज्याची अधिकृत मुहूर्तमेढ रोवली.',
        details: 'तोरणा किल्ल्याच्या डागडुजी दरम्यान सापडलेल्या सोन्याच्या घागरींचा वापर महाराजांनी राजगड किल्ला बांधण्यासाठी केला.',
        historical_significance: 'स्वराज्य स्थापनेची प्रत्यक्ष रणधुमाळी सुरू',
        source_reference: 'सभासद बखर'
      },
      {
        id: 'ev_1659_pratapgad',
        year: 1659,
        approx_date: '१० नोव्हेंबर १६५९',
        era_id: 'shivaji_maharaj',
        era_title: 'छत्रपती शिवाजी महाराज कालखंड',
        title: 'प्रतापगड युद्ध — अफजलखानाचा वध',
        location: 'किल्ले प्रतापगड, महाबळेश्वर',
        summary: 'विजापूरचा बलाढ्य सेनापती अफजलखान याचा महाराजांनी वाघनखांनी कोथळा बाहेर काढून पराभव केला.',
        details: 'अफजलखानाच्या ३०,००० फौजेचा जावळीच्या खोऱ्यात मराठ्यांनी संपूर्ण धुव्वा उडवला. स्वराज्याला प्रचंड युद्धसामग्री, हत्ती आणि खजिना मिळाला.',
        historical_significance: 'स्वराज्याचे सार्वभौम सामर्थ्य संपूर्ण हिंदुस्थानात गाजले',
        source_reference: 'अफजलखान वध बखर, शिवभारत'
      },
      {
        id: 'ev_1674_rajyabhisheka',
        year: 1674,
        approx_date: '६ जून १६७४',
        era_id: 'shivaji_maharaj',
        era_title: 'छत्रपती शिवाजी महाराज कालखंड',
        title: 'दुर्गराज रायगडावर छत्रपती शिवरायांचा भव्य राज्याभिषेक',
        location: 'किल्ले रायगड, महाड',
        summary: 'गागाभट्टांच्या पौरोहित्याखाली शिवरायांचा राज्याभिषेक संपन्न झाला व स्वतंत्र हिंदवी स्वराज्य अस्तित्वात आले.',
        details: 'शिवशक सुरू झाला, होन व शिवराई नाणी पाडली गेली आणि ३२ मणांचे सुवर्णसिंहासन स्थापन झाले.',
        historical_significance: 'हिंदवी स्वराज्याला आंतरराष्ट्रीय व सार्वभौम राजमान्यता',
        source_reference: 'हेन्री ऑक्झिंडेन रिपोर्ट, जेधे शकावली'
      }
    ];

    for (const ev of events) {
      await runQuery(`
        INSERT INTO time_machine_events (
          id, year, approx_date, era_id, era_title, title, location,
          summary, details, historical_significance, source_reference, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `, [
        ev.id, ev.year, ev.approx_date, ev.era_id, ev.era_title, ev.title, ev.location,
        ev.summary, ev.details, ev.historical_significance, ev.source_reference
      ]);
    }
    console.log(`[+] Seeded ${events.length} events into time_machine_events`);
  }

  saveDatabaseNow();
  console.log('Knowledge and Heritage portals seeded and persisted to disk successfully!');
}

seedKnowledgePortals().catch(console.error);
