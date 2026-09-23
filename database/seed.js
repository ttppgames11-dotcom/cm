import bcrypt from 'bcryptjs';
import { getDatabase, runQuery, all, saveDatabase } from './database.js';

export async function seed() {
  console.log('🌱 Seeding Connect Maratha SQLite database...');
  await getDatabase();

  // Check if members already exist
  const existing = await all('SELECT COUNT(*) as count FROM members');
  if (existing[0] && existing[0].count > 0) {
    console.log(`Database already has ${existing[0].count} members. Skipping seed.`);
    return;
  }

  const defaultPasswordHash = bcrypt.hashSync('password123', 8);

  // 1. Seed Members
  const members = [
    {
      id: 'M1001',
      name: 'अमोल जाधव',
      email: 'amol.jadhav@example.com',
      phone: '9876500011',
      password_hash: defaultPasswordHash,
      avatar: '👨',
      city: 'पुणे',
      district: 'पुणे',
      state: 'महाराष्ट्र',
      profession: 'Web Developer',
      business: 'स्वराज्य टेक सोल्यूशन्स',
      skills: JSON.stringify(['JavaScript', 'React', 'Node.js', 'Full Stack']),
      education: 'B.E. Computer Engineering',
      interests: JSON.stringify(['गड-किल्ले भटकंती', 'मराठी उद्योजक']),
      about: 'फुल-स्टॅक वेब डेव्हलपर, समाजातील स्टार्टअप्सना मोफत मार्गदर्शन करतो.',
      tier: 'Gold',
      role: 'admin',
      joined: '2025-11-02'
    },
    {
      id: 'M1002',
      name: 'प्रिया देशमुख',
      email: 'priya.deshmukh@example.com',
      phone: '9876500022',
      password_hash: defaultPasswordHash,
      avatar: '👩',
      city: 'मुंबई',
      district: 'मुंबई उपनगर',
      state: 'महाराष्ट्र',
      profession: 'Chartered Accountant',
      business: 'देशमुख अँड असोसिएट्स',
      skills: JSON.stringify(['Taxation', 'GST', 'Auditing']),
      education: 'CA, M.Com',
      interests: JSON.stringify(['मराठी उद्योजक', 'महिला समुदाय']),
      about: 'GST व इन्कम टॅक्स सल्लागार. समाज बांधवांना विशेष सवलत दरात सेवा.',
      tier: 'Platinum',
      role: 'member',
      joined: '2025-08-14'
    },
    {
      id: 'M1003',
      name: 'रोहित मोरे',
      email: 'rohit.more@example.com',
      phone: '9876500033',
      password_hash: defaultPasswordHash,
      avatar: '🧗',
      city: 'नाशिक',
      district: 'नाशिक',
      state: 'महाराष्ट्र',
      profession: 'Trekking Guide',
      business: 'सह्याद्री ट्रेकर्स क्लब',
      skills: JSON.stringify(['Trekking', 'History Research']),
      education: 'B.A. History',
      interests: JSON.stringify(['गड-किल्ले भटकंती', 'इतिहास अभ्यासक']),
      about: '१५०+ किल्ल्यांवर मोहीम आयोजित करणारा प्रमाणित गिर्यारोहण मार्गदर्शक.',
      tier: 'Silver',
      role: 'member',
      joined: '2025-05-20'
    },
    {
      id: 'M1004',
      name: 'स्वाती पाटील',
      email: 'swati.patil@example.com',
      phone: '9876500044',
      password_hash: defaultPasswordHash,
      avatar: '👩‍🏫',
      city: 'पुणे',
      district: 'पुणे',
      state: 'महाराष्ट्र',
      profession: 'शिक्षिका',
      business: 'जिजाऊ स्पर्धा परीक्षा अकॅडमी',
      skills: JSON.stringify(['Teaching', 'Career Counselling']),
      education: 'B.Ed, M.A.',
      interests: JSON.stringify(['शिक्षण', 'विद्यार्थी']),
      about: 'स्पर्धा परीक्षा मार्गदर्शन करणारी शिक्षिका.',
      tier: 'Basic',
      role: 'member',
      joined: '2026-01-10'
    },
    {
      id: 'M1005',
      name: 'निखिल शिंदे',
      email: 'nikhil.shinde@example.com',
      phone: '9876500055',
      password_hash: defaultPasswordHash,
      avatar: '💻',
      city: 'बेंगळुरू',
      district: 'इतर',
      state: 'कर्नाटक',
      profession: 'IT प्रोफेशनल',
      business: 'वीरशैली सॉफ्टवेअर',
      skills: JSON.stringify(['Cloud', 'DevOps', 'Kubernetes']),
      education: 'B.Tech',
      interests: JSON.stringify(['मराठी उद्योजक', 'युवा Connect']),
      about: 'महाराष्ट्राबाहेर राहणारा IT व्यावसायिक, समाज नेटवर्किंगमध्ये सक्रिय.',
      tier: 'Gold',
      role: 'member',
      joined: '2025-09-01'
    },
    {
      id: 'M1006',
      name: 'संकेत भोसले',
      email: 'sanket.bhosale@example.com',
      phone: '9876500066',
      password_hash: defaultPasswordHash,
      avatar: '🎓',
      city: 'मुंबई',
      district: 'मुंबई',
      state: 'महाराष्ट्र',
      profession: 'विद्यार्थी',
      business: '',
      skills: JSON.stringify(['Public Speaking', 'Marketing']),
      education: 'B.Com (चालू)',
      interests: JSON.stringify(['विद्यार्थी', 'रोजगार', 'रक्तदान']),
      about: 'वाणिज्य शाखेचा विद्यार्थी, स्पर्धा परीक्षांची तयारी करत आहे.',
      tier: 'Basic',
      role: 'member',
      joined: '2026-02-18'
    },
    {
      id: 'M1007',
      name: 'मयुरी कदम',
      email: 'mayuri.kadam@example.com',
      phone: '9876500077',
      password_hash: defaultPasswordHash,
      avatar: '🤝',
      city: 'नाशिक',
      district: 'नाशिक',
      state: 'महाराष्ट्र',
      profession: 'समाजसेविका',
      business: 'शिवकार्य फाउंडेशन',
      skills: JSON.stringify(['Social Work', 'Event Management']),
      education: 'MSW',
      interests: JSON.stringify(['समाजसेवा', 'महिला समुदाय']),
      about: 'ज्येष्ठ नागरिक व गरजू कुटुंबांसाठी काम करणारी समाजसेविका.',
      tier: 'Silver',
      role: 'member',
      joined: '2025-07-07'
    },
    {
      id: 'M1008',
      name: 'विकास गायकवाड',
      email: 'vikas.gaikwad@example.com',
      phone: '9876500088',
      password_hash: defaultPasswordHash,
      avatar: '🏭',
      city: 'पुणे',
      district: 'पुणे',
      state: 'महाराष्ट्र',
      profession: 'उद्योजक',
      business: 'गायकवाड इंडस्ट्रीज',
      skills: JSON.stringify(['Manufacturing', 'Export', 'Automotive']),
      education: 'MBA',
      interests: JSON.stringify(['मराठी उद्योजक']),
      about: 'ऑटो पार्ट्स उत्पादक व निर्यातदार.',
      tier: 'Platinum',
      role: 'member',
      joined: '2025-03-11'
    }
  ];

  for (const m of members) {
    await runQuery(`
      INSERT INTO members (id, name, email, phone, password_hash, avatar, city, district, state, profession, business, skills, education, interests, about, tier, role, joined, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [m.id, m.name, m.email, m.phone, m.password_hash, m.avatar, m.city, m.district, m.state, m.profession, m.business, m.skills, m.education, m.interests, m.about, m.tier, m.role, m.joined]);
  }

  // 2. Seed Businesses
  const businesses = [
    { id: 'B01', name: 'राजगड भोजनालय', owner: 'संदीप जगदाळे', cat: 'restaurant', city: 'पुणे', district: 'पुणे', photo: '🍛', phone: '9876500011', whatsapp: '9876500011', website: 'https://example.com', hours: 'सकाळी ११ ते रात्री ११', services: JSON.stringify(['मराठी थाळी', 'कॅटरिंग', 'होम डिलिव्हरी']), offers: 'समाज सदस्यांना १०% सवलत', rating: 4.8 },
    { id: 'B02', name: 'सह्याद्री टेक', owner: 'रोहित जगताप', cat: 'it', city: 'पुणे', district: 'पुणे', photo: '💻', phone: '9876500022', whatsapp: '9876500022', website: 'https://example.com', hours: 'सोम-शनि, सकाळी १० ते ६', services: JSON.stringify(['वेब डेव्हलपमेंट', 'अ‍ॅप डेव्हलपमेंट', 'IT सल्ला']), offers: 'पहिल्या प्रकल्पावर मोफत सल्ला', rating: 4.9 },
    { id: 'B03', name: 'स्वराज्य बिल्डर्स', owner: 'सुनील मोहिते', cat: 'realestate', city: 'नागपूर', district: 'नागपूर', photo: '🏗️', phone: '9876500033', whatsapp: '9876500033', website: '', hours: 'सोम-शनि, सकाळी ९ ते ६', services: JSON.stringify(['निवासी प्रकल्प', 'व्यावसायिक बांधकाम']), offers: 'बुकिंगवर विशेष सवलत', rating: 4.6 },
    { id: 'B04', name: 'विजय ऑटोमोटिव्ह', owner: 'विजय पवार', cat: 'manufacturing', city: 'कोल्हापूर', district: 'कोल्हापूर', photo: '⚙️', phone: '9876500044', whatsapp: '9876500044', website: '', hours: 'सोम-शनि, सकाळी ९ ते ७', services: JSON.stringify(['ऑटो पार्ट्स उत्पादन', 'CNC मशिनिंग']), offers: 'OEM दर उपलब्ध', rating: 4.7 },
    { id: 'B05', name: 'सिंहगड ट्रॅव्हल्स', owner: 'महेश कदम', cat: 'travel', city: 'पुणे', district: 'पुणे', photo: '🚌', phone: '9876500055', whatsapp: '9876500055', website: '', hours: '२४x७ बुकिंग सहाय्य', services: JSON.stringify(['ट्रेक आयोजन', 'टूर पॅकेजेस', 'लक्झरी बस']), offers: 'ग्रुप बुकिंगवर १५% सवलत', rating: 4.9 },
    { id: 'B06', name: 'वीरशैली सॉफ्टवेअर', owner: 'निखिल शिंदे', cat: 'it', city: 'मुंबई', district: 'मुंबई', photo: '💻', phone: '9876500066', whatsapp: '9876500066', website: '', hours: 'सोम-शुक्र, सकाळी १० ते ६', services: JSON.stringify(['IT कन्सल्टिंग', 'Cloud इन्फ्रास्ट्रक्चर', 'AI सोल्युशन्स']), offers: 'मोफत क्लाऊड ऑडिट', rating: 4.8 },
    { id: 'B07', name: 'मावळा कट्टा', owner: 'गणेश शेळके', cat: 'restaurant', city: 'सातारा', district: 'सातारा', photo: '🍽️', phone: '9876500077', whatsapp: '9876500077', website: '', hours: 'सकाळी ८ ते रात्री १०', services: JSON.stringify(['कॅफे', 'स्नॅक्स', 'पारंपारिक चहा']), offers: '', rating: 4.5 },
    { id: 'B08', name: 'भूमी पॉलिमर्स', owner: 'दत्तात्रय भोसले', cat: 'manufacturing', city: 'पुणे', district: 'पुणे', photo: '🏭', phone: '9876500088', whatsapp: '9876500088', website: '', hours: 'सोम-शनि, सकाळी ९ ते ६', services: JSON.stringify(['प्लास्टिक उत्पादने निर्मिती', 'औद्योगिक मोल्डिंग']), offers: '', rating: 4.4 }
  ];

  for (const b of businesses) {
    await runQuery(`
      INSERT INTO businesses (id, name, owner, cat, city, district, photo, phone, whatsapp, website, hours, services, offers, rating, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [b.id, b.name, b.owner, b.cat, b.city, b.district, b.photo, b.phone, b.whatsapp, b.website, b.hours, b.services, b.offers, b.rating]);
  }

  // 3. Seed Groups
  const groups = [
    { id: 'G01', name: 'पुणे Connect', type: 'location', category: 'शहर गट', district: 'पुणे', desc: 'पुणे शहर व परिसरातील समाज बांधवांचा अधिकृत गट.', cover: '🏙️', members_count: 1420 },
    { id: 'G02', name: 'मुंबई Connect', type: 'location', category: 'शहर गट', district: 'मुंबई', desc: 'मुंबई महानगर परिसरातील बांधवांचा गट.', cover: '🏙️', members_count: 1850 },
    { id: 'G03', name: 'नाशिक Connect', type: 'location', category: 'शहर गट', district: 'नाशिक', desc: 'नाशिक जिल्ह्यातील समाज बांधव.', cover: '🏙️', members_count: 890 },
    { id: 'G04', name: 'सातारा Connect', type: 'location', category: 'शहर गट', district: 'सातारा', desc: 'सातारा जिल्हा समाज नेटवर्क.', cover: '🏙️', members_count: 760 },
    { id: 'G05', name: 'कोल्हापूर Connect', type: 'location', category: 'शहर गट', district: 'कोल्हापूर', desc: 'कोल्हापूर परिसरातील बांधवांचा गट.', cover: '🏙️', members_count: 1100 },
    { id: 'G06', name: 'छत्रपती संभाजीनगर Connect', type: 'location', category: 'शहर गट', district: 'छत्रपती संभाजीनगर', desc: 'मराठवाडा विभागीय गट.', cover: '🏙️', members_count: 940 },
    { id: 'G07', name: 'नागपूर Connect', type: 'location', category: 'शहर गट', district: 'नागपूर', desc: 'विदर्भ विभागीय समाज गट.', cover: '🏙️', members_count: 620 },
    { id: 'G08', name: 'गड-किल्ले भटकंती', type: 'interest', category: 'आवड गट', district: 'सर्व', desc: 'दुर्गभ्रमंती व सह्याद्री संवर्धन करणारा बांधवांचा गट.', cover: '⛰️', members_count: 2450 },
    { id: 'G09', name: 'मराठी उद्योजक', type: 'interest', category: 'आवड गट', district: 'सर्व', desc: 'व्यवसाय नेटवर्किंग, संगम व सहकार्यासाठी उद्योजक गट.', cover: '💼', members_count: 3200 },
    { id: 'G10', name: 'विद्यार्थी व करिअर', type: 'interest', category: 'आवड गट', district: 'सर्व', desc: 'MPSC/UPSC स्पर्धा परीक्षा व करिअर मार्गदर्शन मंच.', cover: '🎓', members_count: 1980 }
  ];

  for (const g of groups) {
    await runQuery(`
      INSERT INTO groups (id, name, type, category, district, desc, cover, members_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [g.id, g.name, g.type, g.category, g.district, g.desc, g.cover, g.members_count]);
  }

  // 4. Seed Posts
  const posts = [
    { id: 'P01', author_id: 'M1001', author_name: 'अमोल जाधव', author_avatar: '👨', group_id: 'G09', text: 'आज पुण्यात मराठी उद्योजक संगम मेळाव्यात ५०+ व्यावसायिकांनी सहभाग घेतला. अत्यंत ऊर्जादायी संवाद! 🚩', image: '/assets/images/meeting.jpg', likes_count: 34 },
    { id: 'P02', author_id: 'M1003', author_name: 'रोहित मोरे', author_avatar: '🧗', group_id: 'G08', text: 'पुढील आठवड्यात दुर्गराज रायगड ते तोरणा अशी २ दिवसांची पायी मोहीम आयोजित करत आहोत. इच्छुकांनी संपर्क साधावा! 🏰', image: '/assets/images/real-raigad-panoramic.jpg', likes_count: 68 },
    { id: 'P03', author_id: 'M1007', author_name: 'मयुरी कदम', author_avatar: '🤝', group_id: 'G03', text: 'नाशिक येथील गरजू विद्यार्थ्यांसाठी मोफत वह्या-पुस्तके वाटप उपक्रम यशस्वीपणे संपन्न झाला. 🙏', image: '/assets/images/library.jpg', likes_count: 42 }
  ];

  for (const p of posts) {
    await runQuery(`
      INSERT INTO posts (id, author_id, author_name, author_avatar, group_id, text, image, likes_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [p.id, p.author_id, p.author_name, p.author_avatar, p.group_id, p.text, p.image, p.likes_count]);
  }

  // 5. Seed Campaigns (Donations)
  const campaigns = [
    {
      id: 'C01',
      cat: 'fort',
      title: 'रायगड संवर्धन व स्वच्छता अभियान',
      icon: '🏰',
      target: 1000000,
      collected: 745000,
      donors: 3420,
      cover: '/assets/images/real-raigad-panoramic.jpg',
      desc: 'दुर्गराज रायगडावरील ऐतिहासिक वास्तूंचे जतन, स्वच्छता मोहीम व पायवाट दुरुस्तीसाठी निधी.'
    },
    {
      id: 'C02',
      cat: 'education',
      title: 'मराठा विद्यार्थी उच्च शिक्षण शिष्यवृत्ती निधी',
      icon: '🎓',
      target: 1500000,
      collected: 1120000,
      donors: 4180,
      cover: '/assets/images/library.jpg',
      desc: 'आर्थिकदृष्ट्या दुर्बल घटकातील गुणवंत मराठा विद्यार्थ्यांना उच्च शिक्षणासाठी थेट शिष्यवृत्ती.'
    },
    {
      id: 'C03',
      cat: 'farmer',
      title: 'बळीराजा आपत्कालीन शेतकरी साहाय्यता',
      icon: '🌾',
      target: 2000000,
      collected: 1480000,
      donors: 5890,
      cover: '/assets/images/real-farmer-field.jpg',
      desc: 'अतिवृष्टी व दुष्काळग्रस्त शेतकरी कुटुंबांना तात्काळ आर्थिक व कृषी अवजारे साहाय्य.'
    }
  ];

  for (const c of campaigns) {
    await runQuery(`
      INSERT INTO campaigns (id, cat, title, icon, target, collected, donors, cover, desc, active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
    `, [c.id, c.cat, c.title, c.icon, c.target, c.collected, c.donors, c.cover, c.desc]);
  }

  // 6. Seed Events
  const events = [
    {
      id: 'E01',
      title: 'अखिल भारतीय शिवराज्याभिषेक सोहळा (शक ३५२)',
      category: 'ऐतिहासिक महोत्सव',
      date: '२०२६-०६-०६',
      time: 'सकाळी ७:०० वा.',
      venue: 'दुर्गराज रायगड, राजसभा',
      district: 'रायगड',
      desc: '३२ मण सुवर्ण सिंहासनावर संपन्न झालेला ऐतिहासिक शिवराज्याभिषेक स्मृती सोहळा.',
      organizer: 'अखिल भारतीय मराठा महासंघ',
      banner: '/assets/images/real-shivaji-coronation.jpg',
      rsvp_count: 840
    },
    {
      id: 'E02',
      title: 'महाराष्ट्र राज्य मराठा उद्योजक महाअधिवेशन',
      category: 'उद्योग संगम',
      date: '२०२६-१०-१५',
      time: 'सकाळी ९:३० वा.',
      venue: 'बालेवाडी क्रीडा संकुल, पुणे',
      district: 'पुणे',
      desc: '५,०००+ मराठा उद्योजक, गुंतवणूकदार व स्टार्टअप्सचे भव्य महाअधिवेशन.',
      organizer: 'कनेक्ट मराठा व्यवसाय संगम',
      banner: '/assets/images/meeting.jpg',
      rsvp_count: 420
    },
    {
      id: 'E03',
      title: 'सह्याद्री गडकोट संवर्धन व स्वच्छता महामोहीम',
      category: 'दुर्ग संवर्धन',
      date: '२०२६-११-०८',
      time: 'सकाळी ६:०० वा.',
      venue: 'किल्ले तोरणा व राजगड',
      district: 'पुणे',
      desc: 'सह्याद्रीतील गडकिल्ल्यांची स्वच्छता व निसर्ग संवर्धन मोहीम.',
      organizer: 'सह्याद्री ट्रेकर्स क्लब',
      banner: '/assets/images/real-rajgad-fort.jpg',
      rsvp_count: 260
    }
  ];

  for (const e of events) {
    await runQuery(`
      INSERT INTO events (id, title, category, date, time, venue, district, desc, organizer, banner, rsvp_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [e.id, e.title, e.category, e.date, e.time, e.venue, e.district, e.desc, e.organizer, e.banner, e.rsvp_count]);
  }

  // 7. Seed Referrals
  const referrals = [
    {
      id: 'REF-101',
      title: 'व्यावसायिक कार्यालयाचे इंटिरियर डिझाइन',
      category: 'बांधकाम व इंटिरियर',
      giver_id: 'M1001',
      giver_name: 'अमोल जाधव',
      recipient_id: 'M1008',
      recipient_name: 'विकास गायकवाड',
      client_name: 'प्रशांत कदम',
      client_phone: '9822012345',
      client_email: 'prashant@example.com',
      status: 'Deal Won',
      value: 350000,
      notes: 'पुण्यातील नवीन IT ऑफिसचे काम यशस्वीरित्या पूर्ण झाले.'
    },
    {
      id: 'REF-102',
      title: 'ई-कॉमर्स पोर्टल व मोबाईल अ‍ॅप',
      category: 'IT व सॉफ्टवेअर',
      giver_id: 'M1002',
      giver_name: 'प्रिया देशमुख',
      recipient_id: 'M1001',
      recipient_name: 'अमोल जाधव',
      client_name: 'राजेश जगदाळे',
      client_phone: '9822054321',
      client_email: 'rajesh@example.com',
      status: 'Discussion',
      value: 120000,
      notes: 'मराठी ब्रँडसाठी डिजिटल स्टोअर तयार करण्याची आवश्यकता.'
    }
  ];

  for (const r of referrals) {
    await runQuery(`
      INSERT INTO referrals (id, title, category, giver_id, giver_name, recipient_id, recipient_name, client_name, client_phone, client_email, status, value, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [r.id, r.title, r.category, r.giver_id, r.giver_name, r.recipient_id, r.recipient_name, r.client_name, r.client_phone, r.client_email, r.status, r.value, r.notes]);
  }

  // 8. Seed Jobs
  const jobs = [
    {
      id: 'JOB-01',
      title: 'Full Stack React & Node.js Developer',
      company: 'वीरशैली सॉफ्टवेअर',
      district: 'पुणे',
      category: 'IT & Software',
      salary: '₹६,००,००० – ₹१०,००,००० / वर्ष',
      job_type: 'Full-time',
      experience: '२-४ वर्षे',
      desc: 'React, Node.js आणि आधुनिक वेब अ‍ॅप्लिकेशन्स विकसित करण्यासाठी अनुभवी डेव्हलपर पाहिजे.',
      contact_email: 'careers@veershaily.com',
      phone: '9876500066'
    },
    {
      id: 'JOB-02',
      title: 'सिनियर अकाउंटंट व GST एक्झिक्युटिव्ह',
      company: 'देशमुख अँड असोसिएट्स',
      district: 'मुंबई',
      category: 'Finance & Accounts',
      salary: '₹४,००,००० – ₹६,००,००० / वर्ष',
      job_type: 'Full-time',
      experience: '३+ वर्षे',
      desc: 'Tally Prime, GST रिटर्न्स आणि ऑडिटिंग कामाचा दांडगा अनुभव असणारा उमेदवार हवा.',
      contact_email: 'hr@deshmukhca.com',
      phone: '9876500022'
    },
    {
      id: 'JOB-03',
      title: 'CNC मशीन ऑपरेटर व क्वालिटी सुपरवायझर',
      company: 'गायकवाड इंडस्ट्रीज',
      district: 'पुणे',
      category: 'Manufacturing',
      salary: '₹२,५०,००० – ₹४,००,००० / वर्ष',
      job_type: 'Full-time',
      experience: '१-३ वर्षे',
      desc: 'ऑटोमोबाईल पार्ट्स उत्पादन आणि अचूक मापन कौशल्याची आवश्यकता.',
      contact_email: 'jobs@gaikwadind.com',
      phone: '9876500088'
    }
  ];

  for (const j of jobs) {
    await runQuery(`
      INSERT INTO jobs (id, title, company, district, category, salary, job_type, experience, desc, contact_email, phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [j.id, j.title, j.company, j.district, j.category, j.salary, j.job_type, j.experience, j.desc, j.contact_email, j.phone]);
  }

  saveDatabase();
  console.log('✅ Connect Maratha database successfully seeded with Marathi records!');
}

// Run standalone if executed directly
if (process.argv[1]?.endsWith('seed.js')) {
  seed().then(() => process.exit(0)).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
