/**
 * Connect Maratha — Shared Client-Side Data Layer (CMDB)
 * A single localStorage-backed store that simulates a real backend so every
 * page (profiles, messaging, groups, business directory, donations, events,
 * moderation, admin panel) reads and writes consistent, shared demo data.
 *
 * NOTE: This is a front-end-only simulation. Data lives in the visitor's own
 * browser (localStorage) and is not shared across different people/devices.
 */

(function (global) {
  const DB_KEY = 'cm_db_v1';

  function uid(prefix) {
    return prefix + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function timeAgo(iso) {
    const diff = Math.max(0, Date.now() - new Date(iso).getTime());
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'आत्ताच';
    if (min < 60) return min + ' मिनिटांपूर्वी';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + ' तासांपूर्वी';
    const day = Math.floor(hr / 24);
    if (day < 30) return day + ' दिवसांपूर्वी';
    const mon = Math.floor(day / 30);
    return mon + ' महिन्यांपूर्वी';
  }

  // ---------------------------------------------------------------------
  // Seed data
  // ---------------------------------------------------------------------
  function seedData() {
    const members = [
      { id: 'M1001', name: 'अमोल जाधव', avatar: '👨', city: 'पुणे', district: 'पुणे', state: 'महाराष्ट्र', country: 'भारत', lang: 'मराठी', profession: 'Web Developer', business: '', skills: ['JavaScript', 'React', 'Node.js'], education: 'B.E. Computer Engineering', interests: ['गड-किल्ले भटकंती', 'मराठी उद्योजक'], about: 'फुल-स्टॅक वेब डेव्हलपर, समाजातील स्टार्टअप्सना मोफत मार्गदर्शन करतो.', social: { linkedin: '#', instagram: '#' }, volunteer: ['शिक्षण', 'रोजगार'], verified: { mobile: true, email: true, profile: true }, tier: 'Gold', joined: '2025-11-02', followers: ['M1002', 'M1003'], following: ['M1002'], connections: ['M1002'] },
      { id: 'M1002', name: 'प्रिया देशमुख', avatar: '👩', city: 'मुंबई', district: 'मुंबई उपनगर', state: 'महाराष्ट्र', country: 'भारत', lang: 'मराठी', profession: 'Chartered Accountant', business: 'देशमुख अँड असोसिएट्स', skills: ['Taxation', 'GST', 'Auditing'], education: 'CA, M.Com', interests: ['मराठी उद्योजक', 'महिला समुदाय'], about: 'GST व इन्कम टॅक्स सल्लागार. समाज बांधवांना विशेष सवलत दरात सेवा.', social: { linkedin: '#' }, volunteer: ['उद्योजकता मार्गदर्शन'], verified: { mobile: true, email: true, profile: true }, tier: 'Platinum', joined: '2025-08-14', followers: ['M1001'], following: ['M1001', 'M1004'], connections: ['M1001'] },
      { id: 'M1003', name: 'रोहित मोरे', avatar: '🧗', city: 'नाशिक', district: 'नाशिक', state: 'महाराष्ट्र', country: 'भारत', lang: 'मराठी', profession: 'Trekking Guide', business: 'सह्याद्री ट्रेकर्स क्लब', skills: ['Trekking', 'History Research'], education: 'B.A. History', interests: ['गड-किल्ले भटकंती', 'इतिहास अभ्यासक'], about: '१५०+ किल्ल्यांवर मोहीम आयोजित करणारा प्रमाणित गिर्यारोहण मार्गदर्शक.', social: { instagram: '#' }, volunteer: ['गड संवर्धन'], verified: { mobile: true, email: false, profile: true }, tier: 'Silver', joined: '2025-05-20', followers: ['M1001'], following: [], connections: [] },
      { id: 'M1004', name: 'स्वाती पाटील', avatar: '👩‍🏫', city: 'पुणे', district: 'पुणे', state: 'महाराष्ट्र', country: 'भारत', lang: 'मराठी', profession: 'शिक्षिका', business: '', skills: ['Teaching', 'Career Counselling'], education: 'B.Ed, M.A.', interests: ['शिक्षण', 'विद्यार्थी'], about: 'स्पर्धा परीक्षा मार्गदर्शन करणारी शिक्षिका.', social: {}, volunteer: ['शिक्षण'], verified: { mobile: true, email: true, profile: false }, tier: 'Basic', joined: '2026-01-10', followers: [], following: ['M1002'], connections: [] },
      { id: 'M1005', name: 'निखिल शिंदे', avatar: '💻', city: 'बेंगळुरू', district: '-', state: 'कर्नाटक', country: 'भारत', lang: 'मराठी', profession: 'IT प्रोफेशनल', business: '', skills: ['Cloud', 'DevOps'], education: 'B.Tech', interests: ['मराठी उद्योजक', 'युवा Connect'], about: 'महाराष्ट्राबाहेर राहणारा IT व्यावसायिक, समाज नेटवर्किंगमध्ये सक्रिय.', social: {}, volunteer: [], verified: { mobile: true, email: true, profile: true }, tier: 'Gold', joined: '2025-09-01', followers: [], following: [], connections: [] },
      { id: 'M1006', name: 'संकेत भोसले', avatar: '🎓', city: 'मुंबई', district: 'मुंबई', state: 'महाराष्ट्र', country: 'भारत', lang: 'मराठी', profession: 'विद्यार्थी', business: '', skills: ['Public Speaking'], education: 'B.Com (चालू)', interests: ['विद्यार्थी', 'रोजगार'], about: 'वाणिज्य शाखेचा विद्यार्थी, स्पर्धा परीक्षांची तयारी करत आहे.', social: {}, volunteer: ['रक्तदान'], verified: { mobile: true, email: false, profile: false }, tier: 'Basic', joined: '2026-02-18', followers: [], following: [], connections: [] },
      { id: 'M1007', name: 'मयुरी कदम', avatar: '🤝', city: 'नाशिक', district: 'नाशिक', state: 'महाराष्ट्र', country: 'भारत', lang: 'मराठी', profession: 'समाजसेविका', business: '', skills: ['Social Work', 'Event Management'], education: 'MSW', interests: ['समाजसेवा', 'महिला समुदाय'], about: 'ज्येष्ठ नागरिक व गरजू कुटुंबांसाठी काम करणारी समाजसेविका.', social: {}, volunteer: ['समाजसेवा', 'ज्येष्ठ नागरिक मदत'], verified: { mobile: true, email: true, profile: true }, tier: 'Silver', joined: '2025-07-07', followers: [], following: [], connections: [] },
      { id: 'M1008', name: 'विकास गायकवाड', avatar: '🏭', city: 'पुणे', district: 'पुणे', state: 'महाराष्ट्र', country: 'भारत', lang: 'मराठी', profession: 'उद्योजक', business: 'गायकवाड इंडस्ट्रीज', skills: ['Manufacturing', 'Export'], education: 'MBA', interests: ['मराठी उद्योजक'], about: 'ऑटो पार्ट्स उत्पादक व निर्यातदार.', social: {}, volunteer: ['रोजगार'], verified: { mobile: true, email: true, profile: true }, tier: 'Platinum', joined: '2025-03-11', followers: [], following: [], connections: [] }
    ];

    const groups = [
      { id: 'G01', name: 'पुणे Connect', type: 'location', category: 'शहर गट', district: 'पुणे', desc: 'पुणे शहर व परिसरातील समाज बांधवांचा अधिकृत गट.', members: ['M1001', 'M1004', 'M1008'], cover: '🏙️' },
      { id: 'G02', name: 'मुंबई Connect', type: 'location', category: 'शहर गट', district: 'मुंबई', desc: 'मुंबई महानगर परिसरातील बांधवांचा गट.', members: ['M1002', 'M1006'], cover: '🏙️' },
      { id: 'G03', name: 'नाशिक Connect', type: 'location', category: 'शहर गट', district: 'नाशिक', desc: 'नाशिक जिल्ह्यातील समाज बांधव.', members: ['M1003', 'M1007'], cover: '🏙️' },
      { id: 'G04', name: 'सातारा Connect', type: 'location', category: 'शहर गट', district: 'सातारा', desc: 'सातारा जिल्हा समाज नेटवर्क.', members: [], cover: '🏙️' },
      { id: 'G05', name: 'कोल्हापूर Connect', type: 'location', category: 'शहर गट', district: 'कोल्हापूर', desc: 'कोल्हापूर परिसरातील बांधवांचा गट.', members: [], cover: '🏙️' },
      { id: 'G06', name: 'औरंगाबाद/छत्रपती संभाजीनगर Connect', type: 'location', category: 'शहर गट', district: 'छत्रपती संभाजीनगर', desc: 'मराठवाडा विभागीय गट.', members: [], cover: '🏙️' },
      { id: 'G07', name: 'नागपूर Connect', type: 'location', category: 'शहर गट', district: 'नागपूर', desc: 'विदर्भ विभागीय समाज गट.', members: [], cover: '🏙️' },
      { id: 'G08', name: 'महाराष्ट्राबाहेरील मराठी Connect', type: 'location', category: 'शहर गट', district: '-', desc: 'महाराष्ट्राबाहेर वास्तव्यास असणाऱ्या बांधवांचा गट.', members: ['M1005'], cover: '🌍' },
      { id: 'G09', name: 'गड-किल्ले भटकंती', type: 'interest', category: 'आवड गट', district: '-', desc: 'दुर्गभ्रमंती व गिर्यारोहण करणाऱ्या बांधवांचा गट.', members: ['M1001', 'M1003'], cover: '⛰️' },
      { id: 'G10', name: 'इतिहास अभ्यासक', type: 'interest', category: 'आवड गट', district: '-', desc: 'मराठा इतिहास संशोधन व चर्चा गट.', members: ['M1003'], cover: '📚' },
      { id: 'G11', name: 'मराठी उद्योजक', type: 'interest', category: 'आवड गट', district: '-', desc: 'व्यवसाय नेटवर्किंग व सहकार्यासाठी उद्योजक गट.', members: ['M1002', 'M1005', 'M1008'], cover: '💼' },
      { id: 'G12', name: 'विद्यार्थी', type: 'interest', category: 'आवड गट', district: '-', desc: 'स्पर्धा परीक्षा व करिअर मार्गदर्शन गट.', members: ['M1006'], cover: '🎓' },
      { id: 'G13', name: 'रोजगार', type: 'interest', category: 'आवड गट', district: '-', desc: 'नोकरी व करिअर संधींची देवाणघेवाण.', members: [], cover: '🤝' },
      { id: 'G14', name: 'समाजसेवा', type: 'interest', category: 'आवड गट', district: '-', desc: 'सामाजिक उपक्रमांत सक्रिय सहभाग घेणारा गट.', members: ['M1007'], cover: '🙏' },
      { id: 'G15', name: 'रक्तदान', type: 'interest', category: 'आवड गट', district: '-', desc: 'रक्तदान शिबिरे व आणीबाणी रक्त पुरवठा नेटवर्क.', members: ['M1006'], cover: '🩸' },
      { id: 'G16', name: 'शिक्षण', type: 'interest', category: 'आवड गट', district: '-', desc: 'शैक्षणिक मदत व मार्गदर्शन गट.', members: ['M1004'], cover: '📖' },
      { id: 'G17', name: 'महिला समुदाय', type: 'interest', category: 'आवड गट', district: '-', desc: 'महिला सक्षमीकरण व नेटवर्किंग गट.', members: ['M1002', 'M1007'], cover: '👩' },
      { id: 'G18', name: 'युवा Connect', type: 'interest', category: 'आवड गट', district: '-', desc: 'युवा पिढीसाठी करिअर व नेतृत्व विकास गट.', members: ['M1005'], cover: '🔥' },
      { id: 'G19', name: 'मराठी कलाकार', type: 'interest', category: 'आवड गट', district: '-', desc: 'कला, संगीत व सांस्कृतिक कलाकारांचा गट.', members: [], cover: '🎨' }
    ];

    const groupPosts = [
      { id: uid('GP'), groupId: 'G09', authorId: 'M1003', text: 'पुढील महिन्यात रायगड ते तोरणा अशी २ दिवसांची मोहीम आयोजित करत आहोत. इच्छुकांनी नाव नोंदवावे! 🚩', ts: '2026-08-28T10:00:00.000Z', likes: ['M1001'], comments: [{ authorId: 'M1001', text: 'मी नक्की येणार!', ts: '2026-08-28T11:00:00.000Z' }] },
      { id: uid('GP'), groupId: 'G11', authorId: 'M1008', text: 'समाजातील नवउद्योजकांसाठी मोफत मार्गदर्शन सत्र — GST नोंदणीपासून निर्यातीपर्यंत सर्व माहिती.', ts: '2026-09-01T09:00:00.000Z', likes: ['M1002', 'M1005'], comments: [] },
      { id: uid('GP'), groupId: 'G01', authorId: 'M1004', text: 'पुणे परिसरात रक्तदान शिबिर आयोजित करत आहोत, कृपया सहभागी व्हा.', ts: '2026-09-05T08:00:00.000Z', likes: [], comments: [] }
    ];

    const feedPosts = [
      { id: uid('FP'), authorId: 'M1001', text: 'आज पुण्यात मराठी उद्योजक मेळाव्यात सहभागी झालो — खूप प्रेरणादायी अनुभव! 🚩', image: '', ts: '2026-09-06T12:00:00.000Z', likes: ['M1002', 'M1008'], comments: [{ authorId: 'M1002', text: 'मस्त उपक्रम!', ts: '2026-09-06T13:00:00.000Z' }] },
      { id: uid('FP'), authorId: 'M1007', text: 'ज्येष्ठ नागरिकांसाठी आरोग्य तपासणी शिबिर यशस्वीरीत्या पार पडले. सर्व स्वयंसेवकांचे आभार. 🙏', image: '', ts: '2026-09-04T09:30:00.000Z', likes: ['M1004'], comments: [] },
      { id: uid('FP'), authorId: 'M1003', text: 'राजगडाच्या पायथ्याशी सूर्योदय — शब्दात व्यक्त न होणारा अनुभव. 🏰', image: '', ts: '2026-09-02T06:00:00.000Z', likes: ['M1001', 'M1005', 'M1006'], comments: [{ authorId: 'M1005', text: 'सुंदर!', ts: '2026-09-02T07:00:00.000Z' }] }
    ];

    const businesses = [
      { id: 'B01', name: 'राजगड भोजनालय', owner: 'संदीप जगदाळे', cat: 'restaurant', city: 'पुणे', photo: '🍛', phone: '9876500011', whatsapp: '9876500011', website: 'https://example.com', hours: 'सकाळी ११ ते रात्री ११', services: ['मराठी थाळी', 'कॅटरिंग', 'होम डिलिव्हरी'], offers: 'समाज सदस्यांना १०% सवलत', rating: 4.6, reviews: [{ name: 'अमोल जाधव', rating: 5, text: 'अस्सल पुणेरी चव!' }] },
      { id: 'B02', name: 'सह्याद्री टेक', owner: 'रोहित जगताप', cat: 'it', city: 'पुणे', photo: '💻', phone: '9876500022', whatsapp: '9876500022', website: 'https://example.com', hours: 'सोम-शनि, सकाळी १० ते ६', services: ['वेब डेव्हलपमेंट', 'अ‍ॅप डेव्हलपमेंट', 'IT सल्ला'], offers: 'पहिल्या प्रकल्पावर मोफत सल्ला', rating: 4.9, reviews: [{ name: 'प्रिया देशमुख', rating: 5, text: 'वेळेत आणि दर्जेदार काम.' }] },
      { id: 'B03', name: 'स्वराज्य बिल्डर्स', owner: 'सुनील मोहिते', cat: 'realestate', city: 'नागपूर', photo: '🏗️', phone: '9876500033', whatsapp: '9876500033', website: '', hours: 'सोम-शनि, सकाळी ९ ते ६', services: ['निवासी प्रकल्प', 'व्यावसायिक बांधकाम'], offers: '', rating: 4.5, reviews: [] },
      { id: 'B04', name: 'विजय ऑटोमोटिव्ह', owner: 'विजय पवार', cat: 'manufacturer', city: 'कोल्हापूर', photo: '⚙️', phone: '9876500044', whatsapp: '9876500044', website: '', hours: 'सोम-शनि, सकाळी ९ ते ७', services: ['ऑटो पार्ट्स उत्पादन'], offers: '', rating: 4.4, reviews: [] },
      { id: 'B05', name: 'सिंहगड ट्रॅव्हल्स', owner: 'महेश कदम', cat: 'travel', city: 'पुणे', photo: '🚌', phone: '9876500055', whatsapp: '9876500055', website: '', hours: '२४x७ बुकिंग सहाय्य', services: ['ट्रेक आयोजन', 'टूर पॅकेजेस', 'ट्रान्सपोर्ट'], offers: 'ग्रुप बुकिंगवर विशेष सवलत', rating: 4.9, reviews: [{ name: 'रोहित मोरे', rating: 5, text: 'उत्तम नियोजन व सुरक्षितता.' }] },
      { id: 'B06', name: 'वीरशैली सॉफ्टवेअर', owner: 'निखिल शिंदे', cat: 'it', city: 'मुंबई', photo: '💻', phone: '9876500066', whatsapp: '9876500066', website: '', hours: 'सोम-शुक्र, सकाळी १० ते ६', services: ['IT कन्सल्टिंग', 'Cloud सेवा'], offers: '', rating: 4.7, reviews: [] },
      { id: 'B07', name: 'मावळा कट्टा', owner: 'गणेश शेळके', cat: 'restaurant', city: 'सातारा', photo: '🍽️', phone: '9876500077', whatsapp: '9876500077', website: '', hours: 'सकाळी ८ ते रात्री १०', services: ['कॅफे', 'स्नॅक्स'], offers: '', rating: 4.3, reviews: [] },
      { id: 'B08', name: 'भूमी पॉलिमर्स', owner: 'दत्तात्रय भोसले', cat: 'manufacturer', city: 'पुणे', photo: '🏭', phone: '9876500088', whatsapp: '9876500088', website: '', hours: 'सोम-शनि, सकाळी ९ ते ६', services: ['प्लास्टिक उत्पादने निर्मिती'], offers: '', rating: 4.2, reviews: [] }
    ];

    const campaigns = [
      {
        id: 'C01', cat: 'fort', title: 'रायगड संवर्धन अभियान', icon: '🏰', target: 1000000, collected: 672450, donors: 3240,
        cover: 'assets/images/real-raigad-panoramic.jpg',
        desc: 'दुर्गराज रायगडावरील ऐतिहासिक वास्तूंचे जतन, स्वच्छता मोहीम व पायवाट दुरुस्तीसाठी हा निधी वापरला जातो.',
        expenses: [ { item: 'तटबंदी दुरुस्ती साहित्य', amount: 210000 }, { item: 'स्वयंसेवक वाहतूक व निवास', amount: 95000 }, { item: 'सुरक्षा कठडे उभारणी', amount: 180000 }, { item: 'स्वच्छता मोहीम साधने', amount: 45000 } ],
        updates: [ { date: '2026-08-20', text: 'बालेकिल्ल्याजवळील तटबंदीचे प्रथम टप्प्यातील काम पूर्ण.' }, { date: '2026-07-05', text: '५०० स्वयंसेवकांसह स्वच्छता मोहीम यशस्वी.' } ],
        receipts: []
      },
      {
        id: 'C02', cat: 'edu', title: 'विद्यार्थी शिक्षण सहाय्य निधी', icon: '🎓', target: 500000, collected: 200000, donors: 890,
        cover: 'assets/images/real-shaniwar-wada.jpg',
        desc: 'गरजू व होतकरू विद्यार्थ्यांना शालेय/महाविद्यालयीन शुल्क, पुस्तके व स्पर्धा परीक्षा साहित्यासाठी मदत.',
        expenses: [ { item: 'शिष्यवृत्ती वितरण (४२ विद्यार्थी)', amount: 140000 }, { item: 'स्पर्धा परीक्षा पुस्तके', amount: 35000 }, { item: 'ऑनलाइन कोचिंग सहाय्य', amount: 25000 } ],
        updates: [ { date: '2026-08-10', text: '४२ विद्यार्थ्यांना शिष्यवृत्ती वितरित.' } ],
        receipts: []
      },
      {
        id: 'C03', cat: 'health', title: 'रक्तदान अभियान निधी', icon: '🩸', target: 100000, collected: 82000, donors: 410,
        cover: 'assets/images/real-raigad-panoramic.jpg',
        desc: 'रक्तदान शिबिरांचे आयोजन, रक्तपेढी सहकार्य व आणीबाणी रक्त पुरवठा नेटवर्कसाठी निधी.',
        expenses: [ { item: 'शिबिर आयोजन खर्च', amount: 32000 }, { item: 'वैद्यकीय तपासणी किट्स', amount: 28000 } ],
        updates: [ { date: '2026-08-25', text: '६ शहरांत एकाच दिवशी रक्तदान शिबिर.' } ],
        receipts: []
      },
      {
        id: 'C04', cat: 'relief', title: 'आपत्ती मदत निधी (पूरग्रस्त सहाय्य)', icon: '🏠', target: 800000, collected: 415000, donors: 1560,
        cover: 'assets/images/real-raigad-panoramic.jpg',
        desc: 'नैसर्गिक आपत्तीग्रस्त कुटुंबांना अन्नधान्य, कपडे व तात्पुरत्या निवाऱ्यासाठी मदत.',
        expenses: [ { item: 'अन्नधान्य किट वाटप', amount: 220000 }, { item: 'तात्पुरता निवारा साहित्य', amount: 130000 } ],
        updates: [ { date: '2026-07-15', text: '३०० कुटुंबांना अन्नधान्य किट वाटप पूर्ण.' } ],
        receipts: []
      }
    ];

    const events = [
      { id: 'E01', cat: 'seva', title: 'रक्तदान शिबिर', date: '2026-09-15', venue: 'पुणे', desc: 'शहरातील प्रमुख रक्तपेढीच्या सहकार्याने आयोजित रक्तदान शिबिर.', registrations: [] },
      { id: 'E02', cat: 'trek', title: 'गड संवर्धन मोहीम', date: '2026-09-22', venue: 'रायगड', desc: 'दुर्गराज रायगडावरील स्वच्छता व संवर्धन मोहीम.', registrations: [] },
      { id: 'E03', cat: 'career', title: 'विद्यार्थी मार्गदर्शन सत्र', date: '2026-09-28', venue: 'मुंबई', desc: 'स्पर्धा परीक्षा व करिअर मार्गदर्शन सत्र.', registrations: [] },
      { id: 'E04', cat: 'culture', title: 'शिवजयंती महोत्सव', date: '2027-02-19', venue: 'सर्व जिल्हे', desc: 'राज्यभर उत्साहात साजरा होणारा शिवजयंती महोत्सव.', registrations: [] },
      { id: 'E05', cat: 'career', title: 'उद्योजक मेळावा', date: '2026-10-05', venue: 'नाशिक', desc: 'नवउद्योजकांसाठी नेटवर्किंग व गुंतवणूकदार भेट मेळावा.', registrations: [] },
      { id: 'E06', cat: 'trek', title: 'तोरणा गडभ्रमंती', date: '2026-10-12', venue: 'पुणे जिल्हा', desc: 'प्रमाणित गाईडसह तोरणा किल्ला मोहीम.', registrations: [] }
    ];

    const conversations = [
      { id: uid('CONV'), participants: ['ME', 'M1002'], messages: [
        { from: 'M1002', text: 'नमस्कार! Connect Maratha वर स्वागत आहे. काही मदत हवी असल्यास कळवा.', ts: '2026-09-01T10:00:00.000Z' }
      ] }
    ];

    const chapters = [
      {
        id: 'CH01',
        slug: 'pune-shivneri-vyavsay-mandal',
        name: 'Pune Shivneri Business Mandal',
        marathiName: 'पुणे – शिवनेरी व्यवसाय मंडळ',
        city: 'पुणे',
        district: 'पुणे',
        territory: 'Pune West',
        meetingDay: 'बुधवार',
        meetingTime: 'सकाळी ७:३०',
        venue: 'शिवाजीनगर, पुणे',
        description: 'पुणेतील Marathi-first उद्योजकांसाठी विश्वासाधारित व्यवसाय नेटवर्क.',
        capacity: 32,
        openSeats: 11,
        visitors: 19,
        monthlyBusiness: 4875000,
        monthlyOpportunities: 47,
        totalClosedValue: 18500000,
        status: 'active',
        leaders: { president: 'M1002', vicePresident: 'M1008', secretary: 'M1001' }
      },
      {
        id: 'CH02',
        slug: 'kolhapur-raigad-vyavsay-mandal',
        name: 'Kolhapur Raigad Business Mandal',
        marathiName: 'कोल्हापूर – रायगड व्यवसाय मंडळ',
        city: 'कोल्हापूर',
        district: 'कोल्हापूर',
        territory: 'Kolhapur City',
        meetingDay: 'शुक्रवार',
        meetingTime: 'सकाळी ८:००',
        venue: 'महाद्वार रोड, कोल्हापूर',
        description: 'स्थानिक व्यवसाय वाढ, योग्य संधी आणि नियमित networking सभांसाठी मंडळ.',
        capacity: 28,
        openSeats: 9,
        visitors: 12,
        monthlyBusiness: 2610000,
        monthlyOpportunities: 35,
        totalClosedValue: 12600000,
        status: 'active',
        leaders: { president: 'M1008', vicePresident: 'M1007', secretary: 'M1005' }
      },
      {
        id: 'CH03',
        slug: 'nashik-jijau-vyavsay-sangam',
        name: 'Nashik Jijau Business Sangam',
        marathiName: 'नाशिक – जिजाऊ व्यवसाय संगम',
        city: 'नाशिक',
        district: 'नाशिक',
        territory: 'Nashik Central',
        meetingDay: 'मंगळवार',
        meetingTime: 'सकाळी ७:००',
        venue: 'गंगापूर रोड, नाशिक',
        description: 'नाशिक विभागातील उद्योग, सेवा आणि व्यावसायिक जोडणी मंच.',
        capacity: 38,
        openSeats: 6,
        visitors: 23,
        monthlyBusiness: 6240000,
        monthlyOpportunities: 58,
        totalClosedValue: 22400000,
        status: 'active',
        leaders: { president: 'M1003', vicePresident: 'M1007', secretary: 'M1002' }
      }
    ];

    const professionSeats = [
      { id: 'SEAT01', chapterId: 'CH01', category: 'CA / Tax', specialty: 'GST व Financial Advisory', memberId: 'M1002', maxMembers: 1, status: 'occupied', approvalRequired: false },
      { id: 'SEAT02', chapterId: 'CH01', category: 'Digital Marketing', specialty: 'Full Service Agency', memberId: 'M1001', maxMembers: 1, status: 'occupied', approvalRequired: false },
      { id: 'SEAT03', chapterId: 'CH01', category: 'Interior Designer', specialty: 'Residential Interior', memberId: '', maxMembers: 1, status: 'open', approvalRequired: false },
      { id: 'SEAT04', chapterId: 'CH01', category: 'Insurance Advisor', specialty: 'Life / Health / SME', memberId: '', maxMembers: 1, status: 'open', approvalRequired: false },
      { id: 'SEAT05', chapterId: 'CH01', category: 'HR Consultant', specialty: 'SME Hiring & Compliance', memberId: '', maxMembers: 1, status: 'open', approvalRequired: false },
      { id: 'SEAT06', chapterId: 'CH02', category: 'Digital Marketing', specialty: 'Full Service Agency', memberId: 'M1005', maxMembers: 1, status: 'occupied', approvalRequired: false },
      { id: 'SEAT07', chapterId: 'CH02', category: 'SEO Specialist', specialty: 'Search Growth', memberId: '', maxMembers: 1, status: 'approval', approvalRequired: true },
      { id: 'SEAT08', chapterId: 'CH03', category: 'Lawyer', specialty: 'Property Documentation', memberId: 'M1007', maxMembers: 1, status: 'occupied', approvalRequired: false },
      { id: 'SEAT09', chapterId: 'CH03', category: 'Architect', specialty: 'Commercial + Residential', memberId: '', maxMembers: 1, status: 'open', approvalRequired: false }
    ];

    const chapterMembers = [
      { id: 'CHM01', chapterId: 'CH01', memberId: 'M1001', role: 'डिजिटल समन्वयक', profession: 'Digital Marketing', specialty: 'Full Service Agency', joinedOn: '2026-04-15', mentorId: 'M1002' },
      { id: 'CHM02', chapterId: 'CH01', memberId: 'M1002', role: 'मंडळ अध्यक्ष', profession: 'CA / Tax', specialty: 'GST व Financial Advisory', joinedOn: '2026-03-01', mentorId: '' },
      { id: 'CHM03', chapterId: 'CH01', memberId: 'M1008', role: 'उपाध्यक्ष', profession: 'Manufacturer', specialty: 'Auto Components', joinedOn: '2026-03-12', mentorId: 'M1002' },
      { id: 'CHM04', chapterId: 'CH03', memberId: 'M1003', role: 'मंडळ अध्यक्ष', profession: 'Trekking Guide', specialty: 'Adventure & Heritage Tours', joinedOn: '2026-02-18', mentorId: '' },
      { id: 'CHM05', chapterId: 'CH03', memberId: 'M1007', role: 'व्यवसाय संधी प्रमुख', profession: 'Lawyer', specialty: 'Property Documentation', joinedOn: '2026-05-21', mentorId: 'M1003' }
    ];

    const oneToOneMeetings = [
      {
        id: 'OTO01',
        chapterId: 'CH01',
        requesterId: 'M1001',
        recipientId: 'M1002',
        purpose: 'SME clients आणि GST setup referrals',
        topics: 'Website leads, GST onboarding, builder network',
        date: '2026-09-12',
        time: '11:30 AM',
        location: 'शिवाजीनगर, पुणे',
        mode: 'Offline',
        status: 'upcoming',
        nextAction: '3 builders list exchange',
        notes: ''
      },
      {
        id: 'OTO02',
        chapterId: 'CH03',
        requesterId: 'M1003',
        recipientId: 'M1007',
        purpose: 'Property buyers, legal verification collaboration',
        topics: 'Documentation referrals, premium client introduction',
        date: '2026-09-15',
        time: '05:00 PM',
        location: 'Online Meet',
        mode: 'Online',
        status: 'scheduled',
        nextAction: 'Commercial buyer shortlist',
        notes: 'Potential A-grade opportunities'
      }
    ];

    const businessApplications = [
      {
        id: 'APP01',
        memberId: 'M1001',
        chapterId: 'CH01',
        fullName: 'अमोल जाधव',
        businessName: 'सह्याद्री ग्रोथ मीडिया',
        category: 'Digital Marketing',
        specialty: 'Full Service Agency',
        city: 'पुणे',
        idealCustomer: 'पुणे आणि मुंबईतील 10–100 कर्मचारी असलेल्या SMEs',
        referralsWanted: 'Website redesign, lead generation, branding retainers',
        canRefer: 'CA, Architect, Lawyer, HR Consultant',
        gstin: '27ABCDE1234F1Z5',
        website: 'www.sahyadrigrowth.in',
        status: 'approved',
        submittedOn: '2026-08-01'
      }
    ];

    const sevaRequests = [
      { id: 'SEV01', category: 'शिक्षण सहाय्य', requesterName: 'सचिन पवार', location: 'सातारा', description: '१२वी विद्यार्थ्यासाठी फी सहाय्य', status: 'Under Review', assignedVolunteer: 'M1004', ts: '2026-09-03T09:00:00.000Z' },
      { id: 'SEV02', category: 'आपत्कालीन वैद्यकीय मदत', requesterName: 'मनीषा कदम', location: 'नाशिक', description: 'औषध सहाय्य व हॉस्पिटल समन्वय', status: 'In Progress', assignedVolunteer: 'M1007', ts: '2026-09-05T10:30:00.000Z' }
    ];

    const volunteers = [
      { id: 'VOL01', memberId: 'M1004', skills: ['शिक्षण', 'Career Guidance'], city: 'पुणे', availability: 'Weekend', tasksCompleted: 14 },
      { id: 'VOL02', memberId: 'M1007', skills: ['Medical Coordination', 'Community Outreach'], city: 'नाशिक', availability: 'Flexible', tasksCompleted: 23 }
    ];

    const leads = [
      { id: 'LD01', source: 'Business Enquiry', type: 'व्यवसाय', name: 'Silver Arc Developers', mobile: '9876500999', email: 'contact@silverarc.in', location: 'पुणे', requirement: 'Project branding + digital launch', category: 'Marketing', assignedTo: 'Support Desk', priority: 'High', status: 'Qualified', expectedValue: 350000, followUpDate: '2026-09-14', notes: 'Interested in full launch campaign', ts: '2026-09-07T08:30:00.000Z' },
      { id: 'LD02', source: 'Event Enquiry', type: 'सदस्य', name: 'Prachi Kulkarni', mobile: '9876500888', email: 'prachi@example.com', location: 'मुंबई', requirement: 'Join business mandal', category: 'Membership', assignedTo: 'Business Admin', priority: 'Medium', status: 'Contacted', expectedValue: 0, followUpDate: '2026-09-13', notes: 'Interested in CA/Finance seat', ts: '2026-09-06T12:15:00.000Z' }
    ];

    const followups = [
      { id: 'FU01', leadId: 'LD01', memberId: 'M1001', assignedTo: 'Business Admin', date: '2026-09-14', purpose: 'Proposal review', outcome: '', status: 'Scheduled' },
      { id: 'FU02', leadId: 'LD02', memberId: 'M1002', assignedTo: 'Membership Desk', date: '2026-09-13', purpose: 'Seat availability discussion', outcome: '', status: 'Scheduled' }
    ];

    const opportunities = [
      {
        id: 'CM-000128',
        chapterId: 'CH01',
        creator: 'M1002',
        recipient: 'M1001',
        prospect: 'Kulkarni Residence',
        requirement: 'Premium 2BHK home interior with modular kitchen',
        category: 'Interior Design',
        location: 'पुणे',
        permissionToContact: true,
        estimatedValue: 650000,
        actualValue: 0,
        qualityGrade: 'A',
        priority: 'High',
        status: 'Proposal',
        followUpDate: '2026-09-14',
        notes: 'Client ready to finalize within 30 days',
        ts: '2026-09-05T09:45:00.000Z'
      },
      {
        id: 'CM-000141',
        chapterId: 'CH02',
        creator: 'M1001',
        recipient: 'M1002',
        prospect: 'SME GST Setup',
        requirement: 'GST registration + compliance setup for Kolhapur unit',
        category: 'CA / Tax',
        location: 'कोल्हापूर',
        permissionToContact: true,
        estimatedValue: 35000,
        actualValue: 0,
        qualityGrade: 'B',
        priority: 'Medium',
        status: 'New',
        followUpDate: '2026-09-13',
        notes: 'Warm introduction from existing supplier',
        ts: '2026-09-08T11:20:00.000Z'
      },
      {
        id: 'CM-000119',
        chapterId: 'CH03',
        creator: 'M1003',
        recipient: 'M1007',
        prospect: 'Commercial Property Verification',
        requirement: 'Legal verification for premium property purchase',
        category: 'Lawyer',
        location: 'नाशिक',
        permissionToContact: true,
        estimatedValue: 120000,
        actualValue: 120000,
        qualityGrade: 'A',
        priority: 'High',
        status: 'Won',
        followUpDate: '2026-09-10',
        notes: 'Closed successfully',
        ts: '2026-08-28T10:10:00.000Z'
      },
      {
        id: 'CM-000097',
        chapterId: 'CH01',
        creator: 'M1008',
        recipient: 'M1001',
        prospect: 'Basic Website Query',
        requirement: 'Budget website enquiry',
        category: 'Web Development',
        location: 'पुणे',
        permissionToContact: false,
        estimatedValue: 15000,
        actualValue: 0,
        qualityGrade: 'D',
        priority: 'Low',
        status: 'Lost',
        followUpDate: '2026-09-01',
        notes: 'Budget mismatch',
        ts: '2026-08-20T08:00:00.000Z'
      }
    ];

    const subscriptions = [
      { id: 'SUB01', memberId: 'M1001', memberName: 'अमोल जाधव', plan: 'Gold Member', membershipType: 'Membership', city: 'पुणे', district: 'पुणे', state: 'महाराष्ट्र', area: 'कोथरूड', status: 'Active', startDate: '2026-04-01', expiryDate: '2027-03-31', paymentDate: '2026-04-01', amount: 4999, tax: 900, gatewayFee: 145, recurring: 'Annual' },
      { id: 'SUB02', memberId: 'M1002', memberName: 'प्रिया देशमुख', plan: 'Platinum Business', membershipType: 'Business', city: 'मुंबई', district: 'मुंबई उपनगर', state: 'महाराष्ट्र', area: 'अंधेरी', status: 'Active', startDate: '2026-01-15', expiryDate: '2027-01-14', paymentDate: '2026-01-15', amount: 9999, tax: 1800, gatewayFee: 260, recurring: 'Annual' },
      { id: 'SUB03', memberId: 'M1003', memberName: 'रोहित मोरे', plan: 'Silver Professional', membershipType: 'Professional', city: 'नाशिक', district: 'नाशिक', state: 'महाराष्ट्र', area: 'गंगापूर', status: 'Pending', startDate: '2026-09-01', expiryDate: '2027-08-31', paymentDate: '2026-09-01', amount: 2499, tax: 450, gatewayFee: 75, recurring: 'Annual' },
      { id: 'SUB04', memberId: 'M1008', memberName: 'विकास गायकवाड', plan: 'Chapter Elite', membershipType: 'Business', city: 'पुणे', district: 'पुणे', state: 'महाराष्ट्र', area: 'भोसरी', status: 'Expired', startDate: '2025-06-01', expiryDate: '2026-05-31', paymentDate: '2025-06-01', amount: 12999, tax: 2340, gatewayFee: 315, recurring: 'Annual' }
    ];

    const fundAccounts = [
      { id: 'FUND01', name: 'General Community Fund', openingBalance: 125000, totalReceived: 250000, totalApproved: 120000, totalSpent: 98000, refunds: 5000, pendingExpenses: 22000 },
      { id: 'FUND02', name: 'Education Fund', openingBalance: 80000, totalReceived: 200000, totalApproved: 155000, totalSpent: 140000, refunds: 0, pendingExpenses: 10000 },
      { id: 'FUND03', name: 'Medical Assistance Fund', openingBalance: 50000, totalReceived: 132000, totalApproved: 70000, totalSpent: 56000, refunds: 2000, pendingExpenses: 9000 },
      { id: 'FUND04', name: 'Fort Heritage Fund', openingBalance: 215000, totalReceived: 672450, totalApproved: 530000, totalSpent: 530000, refunds: 0, pendingExpenses: 45000 },
      { id: 'FUND05', name: 'Emergency Fund', openingBalance: 60000, totalReceived: 415000, totalApproved: 250000, totalSpent: 220000, refunds: 10000, pendingExpenses: 30000 },
      { id: 'FUND06', name: 'Technology Fund', openingBalance: 40000, totalReceived: 90000, totalApproved: 32000, totalSpent: 28000, refunds: 0, pendingExpenses: 5000 }
    ];

    const commissions = [
      { id: 'COM01', source: 'Services', sourceRecord: 'SREQ-DEMO-01', memberId: 'M1001', businessId: 'B02', providerId: 'M1001', grossTransaction: 10000, commissionRule: 'Platform Fee 15%', commissionPercent: 15, commissionAmount: 1500, tax: 270, netCommission: 1230, status: 'Settled', payableTo: 'Connect Maratha', paymentDate: '2026-09-09', settlementDate: '2026-09-10', city: 'पुणे', district: 'पुणे', state: 'महाराष्ट्र' },
      { id: 'COM02', source: 'Opportunity', sourceRecord: 'CM-000119', memberId: 'M1007', businessId: '', providerId: 'M1007', grossTransaction: 120000, commissionRule: 'Opportunity Success 5%', commissionPercent: 5, commissionAmount: 6000, tax: 1080, netCommission: 4920, status: 'Pending', payableTo: 'Connect Maratha', paymentDate: '', settlementDate: '', city: 'नाशिक', district: 'नाशिक', state: 'महाराष्ट्र' },
      { id: 'COM03', source: 'Advertisement', sourceRecord: 'ADV-SEP-21', memberId: 'M1002', businessId: 'B01', providerId: '', grossTransaction: 25000, commissionRule: 'Ad Listing 100%', commissionPercent: 100, commissionAmount: 25000, tax: 4500, netCommission: 20500, status: 'Reconciled', payableTo: 'Connect Maratha', paymentDate: '2026-09-05', settlementDate: '2026-09-06', city: 'पुणे', district: 'पुणे', state: 'महाराष्ट्र' }
    ];

    const expenseLedger = [
      { id: 'EXP01', expenseDate: '2026-09-01', category: 'Technology', subcategory: 'Hosting', department: 'Technology', location: 'Pune Office', state: 'महाराष्ट्र', city: 'पुणे', area: 'शिवाजीनगर', vendor: 'CloudServe India', vendorId: 'VEN01', amount: 18500, tax: 3330, totalAmount: 21830, paymentMethod: 'Net Banking', bankAccount: 'HDFC Ops', invoiceNumber: 'INV-HOST-091', invoiceDate: '2026-09-01', description: 'Monthly hosting and CDN', purpose: 'Platform uptime', supportingDocument: 'hosting-sep.pdf', requestedBy: 'Tech Lead', approvedBy: 'Finance Head', paidBy: 'Accounts Executive', paymentDate: '2026-09-02', status: 'Approved', reconciliationStatus: 'Reconciled', notes: '' },
      { id: 'EXP02', expenseDate: '2026-09-03', category: 'Marketing', subcategory: 'Advertising', department: 'Marketing', location: 'Mumbai', state: 'महाराष्ट्र', city: 'मुंबई', area: 'अंधेरी', vendor: 'Meta Ads', vendorId: 'VEN02', amount: 12000, tax: 2160, totalAmount: 14160, paymentMethod: 'Card', bankAccount: 'Axis Media', invoiceNumber: 'INV-MKT-221', invoiceDate: '2026-09-03', description: 'Business sangam awareness ads', purpose: 'Lead generation', supportingDocument: 'ads-sep.png', requestedBy: 'Marketing Admin', approvedBy: 'Finance Admin', paidBy: 'Accounts Executive', paymentDate: '2026-09-03', status: 'Paid', reconciliationStatus: 'Pending', notes: 'Awaiting final gateway statement' },
      { id: 'EXP03', expenseDate: '2026-09-05', category: 'Campaign expenses', subcategory: 'Fort Restoration', department: 'Funds', location: 'Raigad', state: 'महाराष्ट्र', city: 'रायगड', area: 'महाड', vendor: 'Heritage Stone Works', vendorId: 'VEN03', amount: 45000, tax: 0, totalAmount: 45000, paymentMethod: 'Bank Transfer', bankAccount: 'Campaign Escrow', invoiceNumber: 'INV-RAI-510', invoiceDate: '2026-09-04', description: 'Safety railing and restoration material', purpose: 'Fort Heritage Fund', supportingDocument: 'raigad-bill.pdf', requestedBy: 'Fund Manager', approvedBy: 'Finance Head', paidBy: 'Accounts Executive', paymentDate: '2026-09-05', status: 'Settled', reconciliationStatus: 'Reconciled', notes: '' },
      { id: 'EXP04', expenseDate: '2026-09-08', category: 'Employee expenses', subcategory: 'Operations Support', department: 'Operations', location: 'Pune Office', state: 'महाराष्ट्र', city: 'पुणे', area: 'शिवाजीनगर', vendor: 'Internal Payroll', vendorId: 'VEN04', amount: 32000, tax: 0, totalAmount: 32000, paymentMethod: 'Bank Transfer', bankAccount: 'Salary Account', invoiceNumber: 'PAY-OPS-SEP', invoiceDate: '2026-09-08', description: 'Part operations payroll allocation', purpose: 'CRM support', supportingDocument: 'salary-sep.xlsx', requestedBy: 'HR', approvedBy: 'Finance Head', paidBy: 'Accounts Executive', paymentDate: '2026-09-08', status: 'Paid', reconciliationStatus: 'Pending', notes: '' }
    ];

    const financeApprovals = [
      { id: 'APR01', module: 'Expense', recordId: 'EXP03', amount: 45000, requestedBy: 'Fund Manager', currentLevel: 'Finance Head', requiredApproval: 'Finance Head', status: 'Approved', approvedBy: 'Finance Head', reason: 'Fort restoration phase 1', ts: '2026-09-05T10:00:00.000Z' },
      { id: 'APR02', module: 'Refund', recordId: 'TXN010', amount: 1500, requestedBy: 'Finance Admin', currentLevel: 'Finance Admin', requiredApproval: 'Finance Admin', status: 'Approved', approvedBy: 'Finance Admin', reason: 'Duplicate service payment', ts: '2026-09-09T14:00:00.000Z' },
      { id: 'APR03', module: 'Expense', recordId: 'EXP04', amount: 32000, requestedBy: 'Operations', currentLevel: 'Finance Head', requiredApproval: 'Finance Head', status: 'Pending', approvedBy: '', reason: 'Payroll allocation', ts: '2026-09-08T11:00:00.000Z' }
    ];

    const savedFilters = [
      { id: 'FLT01', module: 'members', name: 'Pune Business Owners', conditions: ['State = महाराष्ट्र', 'City = पुणे', 'Profession = उद्योजक', 'Membership = Active'] },
      { id: 'FLT02', module: 'finance', name: 'Mumbai Donors', conditions: ['City = मुंबई', 'Has Donation = Yes', 'Year = 2026'] },
      { id: 'FLT03', module: 'members', name: 'Trekking Members', conditions: ['Interest = गड-किल्ले भटकंती', 'State = महाराष्ट्र'] },
      { id: 'FLT04', module: 'subscriptions', name: 'Renewal Due', conditions: ['Subscription Expiry <= 30 Days'] }
    ];

    const transactionLedger = [
      { id: 'TXN001', transactionDate: '2026-09-10', transactionTime: '09:15', transactionType: 'Donation', transactionCategory: 'Fort Heritage Fund', transactionSubcategory: 'Campaign Donation', direction: 'Income', sourceModule: 'Funds', sourceRecordId: 'C01', memberId: 'M1001', userId: 'M1001', businessId: '', serviceId: '', campaignId: 'C01', eventId: '', chapterId: '', opportunityId: '', customerId: 'M1001', payerReceiverName: 'अमोल जाधव', mobile: '9876500011', email: 'amol@example.com', amount: 5000, discount: 0, tax: 0, gatewayFee: 145, commission: 0, refundAmount: 0, netAmount: 4855, paymentMethod: 'UPI', paymentGateway: 'Razorpay', bankAccount: 'Donation Escrow', upi: 'amol@upi', cash: false, card: false, netBanking: false, wallet: false, gatewayTransactionId: 'RPY-C01-101', bankReferenceNumber: 'HDFC101', upiReferenceNumber: 'UPI789101', invoiceNumber: '', receiptNumber: 'CM-REC-5101', paymentStatus: 'Payment Verified', settlementStatus: 'Settled', reconciliationStatus: 'Reconciled', state: 'महाराष्ट्र', city: 'पुणे', district: 'पुणे', area: 'कोथरूड', chapter: '', locationLabel: 'Online', createdBy: 'System', verifiedBy: 'Finance Admin', approvedBy: 'Finance Admin', notes: 'Campaign donation', attachments: [], invoice: '', receipt: 'CM-REC-5101', proof: 'screenshot-001.png', createdAt: '2026-09-10T09:15:00.000Z', updatedAt: '2026-09-10T09:30:00.000Z', verifiedAt: '2026-09-10T09:32:00.000Z' },
      { id: 'TXN002', transactionDate: '2026-09-10', transactionTime: '10:00', transactionType: 'Membership Subscription', transactionCategory: 'Subscription', transactionSubcategory: 'Gold Member', direction: 'Income', sourceModule: 'Subscriptions', sourceRecordId: 'SUB01', memberId: 'M1001', userId: 'M1001', businessId: '', serviceId: '', campaignId: '', eventId: '', chapterId: '', opportunityId: '', customerId: 'M1001', payerReceiverName: 'अमोल जाधव', mobile: '9876500011', email: 'amol@example.com', amount: 4999, discount: 0, tax: 900, gatewayFee: 145, commission: 0, refundAmount: 0, netAmount: 4854, paymentMethod: 'Card', paymentGateway: 'Stripe', bankAccount: 'Main Revenue', upi: '', cash: false, card: true, netBanking: false, wallet: false, gatewayTransactionId: 'STRP-2001', bankReferenceNumber: 'ICICI9081', upiReferenceNumber: '', invoiceNumber: 'INV-SUB-2001', receiptNumber: 'RCT-SUB-2001', paymentStatus: 'Reconciled', settlementStatus: 'Settled', reconciliationStatus: 'Reconciled', state: 'महाराष्ट्र', city: 'पुणे', district: 'पुणे', area: 'कोथरूड', chapter: '', locationLabel: 'Website', createdBy: 'System', verifiedBy: 'Finance Admin', approvedBy: 'Finance Admin', notes: 'Annual renewal', attachments: [], invoice: 'INV-SUB-2001', receipt: 'RCT-SUB-2001', proof: '', createdAt: '2026-09-10T10:00:00.000Z', updatedAt: '2026-09-10T10:20:00.000Z', verifiedAt: '2026-09-10T10:21:00.000Z' },
      { id: 'TXN003', transactionDate: '2026-09-09', transactionTime: '16:20', transactionType: 'Service Revenue', transactionCategory: 'Services', transactionSubcategory: 'IT Consultation', direction: 'Income', sourceModule: 'Services', sourceRecordId: 'SREQ-DEMO-01', memberId: 'M1004', userId: 'M1004', businessId: 'B02', serviceId: 'SRV-IT-01', campaignId: '', eventId: '', chapterId: '', opportunityId: '', customerId: 'M1004', payerReceiverName: 'स्वाती पाटील', mobile: '9876500777', email: 'swati@example.com', amount: 10000, discount: 0, tax: 1800, gatewayFee: 500, commission: 1500, refundAmount: 0, netAmount: 9500, paymentMethod: 'Net Banking', paymentGateway: 'Razorpay', bankAccount: 'Service Escrow', upi: '', cash: false, card: false, netBanking: true, wallet: false, gatewayTransactionId: 'RPY-SRV-01', bankReferenceNumber: 'AXIS2008', upiReferenceNumber: '', invoiceNumber: 'INV-SRV-3001', receiptNumber: 'RCT-SRV-3001', paymentStatus: 'Settlement Pending', settlementStatus: 'Settlement Pending', reconciliationStatus: 'Pending', state: 'महाराष्ट्र', city: 'पुणे', district: 'पुणे', area: 'शिवाजीनगर', chapter: '', locationLabel: 'Online', createdBy: 'System', verifiedBy: 'Finance Admin', approvedBy: '', notes: 'Provider share pending', attachments: [], invoice: 'INV-SRV-3001', receipt: 'RCT-SRV-3001', proof: '', createdAt: '2026-09-09T16:20:00.000Z', updatedAt: '2026-09-09T16:45:00.000Z', verifiedAt: '2026-09-09T16:46:00.000Z' },
      { id: 'TXN004', transactionDate: '2026-09-08', transactionTime: '13:10', transactionType: 'Opportunity Commission', transactionCategory: 'Commission', transactionSubcategory: 'Closed Business', direction: 'Income', sourceModule: 'Business', sourceRecordId: 'CM-000119', memberId: 'M1007', userId: 'M1007', businessId: '', serviceId: '', campaignId: '', eventId: '', chapterId: 'CH03', opportunityId: 'CM-000119', customerId: 'M1007', payerReceiverName: 'मयुरी कदम', mobile: '9876500555', email: 'mayuri@example.com', amount: 6000, discount: 0, tax: 1080, gatewayFee: 0, commission: 6000, refundAmount: 0, netAmount: 6000, paymentMethod: 'Bank Transfer', paymentGateway: '', bankAccount: 'Business Revenue', upi: '', cash: false, card: false, netBanking: true, wallet: false, gatewayTransactionId: '', bankReferenceNumber: 'SBI6601', upiReferenceNumber: '', invoiceNumber: 'INV-COM-4001', receiptNumber: 'RCT-COM-4001', paymentStatus: 'Payment Verified', settlementStatus: 'Pending', reconciliationStatus: 'Pending', state: 'महाराष्ट्र', city: 'नाशिक', district: 'नाशिक', area: 'गंगापूर', chapter: 'नाशिक – जिजाऊ व्यवसाय संगम', locationLabel: 'Chapter Office', createdBy: 'Business Admin', verifiedBy: 'Finance Admin', approvedBy: '', notes: 'Awaiting settlement entry', attachments: [], invoice: 'INV-COM-4001', receipt: 'RCT-COM-4001', proof: '', createdAt: '2026-09-08T13:10:00.000Z', updatedAt: '2026-09-08T14:10:00.000Z', verifiedAt: '2026-09-08T14:12:00.000Z' },
      { id: 'TXN005', transactionDate: '2026-09-07', transactionTime: '18:30', transactionType: 'Event Revenue', transactionCategory: 'Events', transactionSubcategory: 'Registration Fee', direction: 'Income', sourceModule: 'Events', sourceRecordId: 'E05', memberId: 'M1005', userId: 'M1005', businessId: '', serviceId: '', campaignId: '', eventId: 'E05', chapterId: '', opportunityId: '', customerId: 'M1005', payerReceiverName: 'निखिल शिंदे', mobile: '9876500666', email: 'nikhil@example.com', amount: 1499, discount: 0, tax: 270, gatewayFee: 42, commission: 0, refundAmount: 0, netAmount: 1457, paymentMethod: 'UPI', paymentGateway: 'PhonePe', bankAccount: 'Event Revenue', upi: 'nikhil@upi', cash: false, card: false, netBanking: false, wallet: false, gatewayTransactionId: 'PP-EVT-501', bankReferenceNumber: 'YES9011', upiReferenceNumber: 'UPI501990', invoiceNumber: 'INV-EVT-5001', receiptNumber: 'RCT-EVT-5001', paymentStatus: 'Settled', settlementStatus: 'Settled', reconciliationStatus: 'Reconciled', state: 'कर्नाटक', city: 'बेंगळुरू', district: '-', area: 'इलेक्ट्रॉनिक सिटी', chapter: '', locationLabel: 'Online', createdBy: 'System', verifiedBy: 'Finance Admin', approvedBy: 'Finance Admin', notes: '', attachments: [], invoice: 'INV-EVT-5001', receipt: 'RCT-EVT-5001', proof: '', createdAt: '2026-09-07T18:30:00.000Z', updatedAt: '2026-09-07T19:00:00.000Z', verifiedAt: '2026-09-07T19:02:00.000Z' },
      { id: 'TXN006', transactionDate: '2026-09-06', transactionTime: '12:30', transactionType: 'Expense', transactionCategory: 'Technology', transactionSubcategory: 'Hosting', direction: 'Expense', sourceModule: 'Finance', sourceRecordId: 'EXP01', memberId: '', userId: '', businessId: '', serviceId: '', campaignId: '', eventId: '', chapterId: '', opportunityId: '', customerId: '', payerReceiverName: 'CloudServe India', mobile: '', email: 'accounts@cloudserve.in', amount: 21830, discount: 0, tax: 3330, gatewayFee: 0, commission: 0, refundAmount: 0, netAmount: 21830, paymentMethod: 'Net Banking', paymentGateway: '', bankAccount: 'HDFC Ops', upi: '', cash: false, card: false, netBanking: true, wallet: false, gatewayTransactionId: '', bankReferenceNumber: 'HDFC-OPS-01', upiReferenceNumber: '', invoiceNumber: 'INV-HOST-091', receiptNumber: '', paymentStatus: 'Settled', settlementStatus: 'Settled', reconciliationStatus: 'Reconciled', state: 'महाराष्ट्र', city: 'पुणे', district: 'पुणे', area: 'शिवाजीनगर', chapter: '', locationLabel: 'Pune Office', createdBy: 'Accounts Executive', verifiedBy: 'Finance Admin', approvedBy: 'Finance Head', notes: 'Approved monthly hosting', attachments: [], invoice: 'INV-HOST-091', receipt: '', proof: 'hosting-sep.pdf', createdAt: '2026-09-06T12:30:00.000Z', updatedAt: '2026-09-06T12:50:00.000Z', verifiedAt: '2026-09-06T12:55:00.000Z' },
      { id: 'TXN007', transactionDate: '2026-09-05', transactionTime: '15:10', transactionType: 'Donation', transactionCategory: 'Education Fund', transactionSubcategory: 'Scholarship Support', direction: 'Income', sourceModule: 'Funds', sourceRecordId: 'C02', memberId: 'M1006', userId: 'M1006', businessId: '', serviceId: '', campaignId: 'C02', eventId: '', chapterId: '', opportunityId: '', customerId: 'M1006', payerReceiverName: 'संकेत भोसले', mobile: '9876500333', email: 'sanket@example.com', amount: 1000, discount: 0, tax: 0, gatewayFee: 28, commission: 0, refundAmount: 0, netAmount: 972, paymentMethod: 'Wallet', paymentGateway: 'Paytm', bankAccount: 'Donation Escrow', upi: '', cash: false, card: false, netBanking: false, wallet: true, gatewayTransactionId: 'PTM-7701', bankReferenceNumber: 'PTMREF7701', upiReferenceNumber: '', invoiceNumber: '', receiptNumber: 'CM-REC-5102', paymentStatus: 'Payment Verified', settlementStatus: 'Settlement Pending', reconciliationStatus: 'Pending', state: 'महाराष्ट्र', city: 'मुंबई', district: 'मुंबई', area: 'दादर', chapter: '', locationLabel: 'Mobile App', createdBy: 'System', verifiedBy: 'Finance Admin', approvedBy: '', notes: '', attachments: [], invoice: '', receipt: 'CM-REC-5102', proof: '', createdAt: '2026-09-05T15:10:00.000Z', updatedAt: '2026-09-05T15:20:00.000Z', verifiedAt: '2026-09-05T15:21:00.000Z' },
      { id: 'TXN008', transactionDate: '2026-09-04', transactionTime: '11:45', transactionType: 'Sponsorship', transactionCategory: 'Event Sponsorship', transactionSubcategory: 'Entrepreneur Meet', direction: 'Income', sourceModule: 'Events', sourceRecordId: 'E05-SP01', memberId: 'M1008', userId: 'M1008', businessId: 'B08', serviceId: '', campaignId: '', eventId: 'E05', chapterId: 'CH01', opportunityId: '', customerId: 'B08', payerReceiverName: 'गायकवाड इंडस्ट्रीज', mobile: '9876500888', email: 'sales@gaikwadind.in', amount: 50000, discount: 0, tax: 9000, gatewayFee: 0, commission: 0, refundAmount: 0, netAmount: 50000, paymentMethod: 'Bank Transfer', paymentGateway: '', bankAccount: 'Event Revenue', upi: '', cash: false, card: false, netBanking: true, wallet: false, gatewayTransactionId: '', bankReferenceNumber: 'ICICI-SP-771', upiReferenceNumber: '', invoiceNumber: 'INV-SP-7001', receiptNumber: 'RCT-SP-7001', paymentStatus: 'Reconciled', settlementStatus: 'Settled', reconciliationStatus: 'Reconciled', state: 'महाराष्ट्र', city: 'पुणे', district: 'पुणे', area: 'भोसरी', chapter: 'पुणे – शिवनेरी व्यवसाय मंडळ', locationLabel: 'Corporate Transfer', createdBy: 'Event Admin', verifiedBy: 'Finance Admin', approvedBy: 'Finance Head', notes: 'Title sponsor', attachments: [], invoice: 'INV-SP-7001', receipt: 'RCT-SP-7001', proof: '', createdAt: '2026-09-04T11:45:00.000Z', updatedAt: '2026-09-04T12:10:00.000Z', verifiedAt: '2026-09-04T12:15:00.000Z' },
      { id: 'TXN009', transactionDate: '2026-09-03', transactionTime: '14:40', transactionType: 'Service Refund', transactionCategory: 'Refund', transactionSubcategory: 'Duplicate Booking', direction: 'Expense', sourceModule: 'Services', sourceRecordId: 'SREQ-DEMO-02', memberId: 'M1004', userId: 'M1004', businessId: 'B02', serviceId: 'SRV-LGL-01', campaignId: '', eventId: '', chapterId: '', opportunityId: '', customerId: 'M1004', payerReceiverName: 'स्वाती पाटील', mobile: '9876500777', email: 'swati@example.com', amount: 1500, discount: 0, tax: 0, gatewayFee: 0, commission: 0, refundAmount: 1500, netAmount: 1500, paymentMethod: 'UPI', paymentGateway: 'Razorpay', bankAccount: 'Refund Account', upi: 'swati@upi', cash: false, card: false, netBanking: false, wallet: false, gatewayTransactionId: 'RPY-RFD-02', bankReferenceNumber: 'HDFCREF22', upiReferenceNumber: 'UPIREF2201', invoiceNumber: '', receiptNumber: 'RFD-2201', paymentStatus: 'Refunded', settlementStatus: 'Settled', reconciliationStatus: 'Reconciled', state: 'महाराष्ट्र', city: 'पुणे', district: 'पुणे', area: 'कर्वेनगर', chapter: '', locationLabel: 'Online', createdBy: 'Support Executive', verifiedBy: 'Finance Admin', approvedBy: 'Finance Admin', notes: 'Customer duplicate payment reversal', attachments: [], invoice: '', receipt: 'RFD-2201', proof: '', createdAt: '2026-09-03T14:40:00.000Z', updatedAt: '2026-09-03T15:00:00.000Z', verifiedAt: '2026-09-03T15:02:00.000Z' },
      { id: 'TXN010', transactionDate: '2026-09-02', transactionTime: '08:20', transactionType: 'Membership Subscription', transactionCategory: 'Subscription', transactionSubcategory: 'Silver Professional', direction: 'Income', sourceModule: 'Subscriptions', sourceRecordId: 'SUB03', memberId: 'M1003', userId: 'M1003', businessId: '', serviceId: '', campaignId: '', eventId: '', chapterId: '', opportunityId: '', customerId: 'M1003', payerReceiverName: 'रोहित मोरे', mobile: '9876500222', email: 'rohit@example.com', amount: 2499, discount: 0, tax: 450, gatewayFee: 75, commission: 0, refundAmount: 0, netAmount: 2424, paymentMethod: 'Card', paymentGateway: 'Stripe', bankAccount: 'Main Revenue', upi: '', cash: false, card: true, netBanking: false, wallet: false, gatewayTransactionId: 'STRP-4402', bankReferenceNumber: 'SBI4402', upiReferenceNumber: '', invoiceNumber: 'INV-SUB-4402', receiptNumber: 'RCT-SUB-4402', paymentStatus: 'Failed', settlementStatus: 'Pending', reconciliationStatus: 'Pending', state: 'महाराष्ट्र', city: 'नाशिक', district: 'नाशिक', area: 'गंगापूर', chapter: '', locationLabel: 'Website', createdBy: 'System', verifiedBy: '', approvedBy: '', notes: 'Payment retry pending', attachments: [], invoice: 'INV-SUB-4402', receipt: '', proof: '', createdAt: '2026-09-02T08:20:00.000Z', updatedAt: '2026-09-02T08:25:00.000Z', verifiedAt: '' },
      { id: 'TXN011', transactionDate: '2026-09-01', transactionTime: '17:05', transactionType: 'Chapter Fees', transactionCategory: 'Business Network', transactionSubcategory: 'व्यवसाय मंडळ शुल्क', direction: 'Income', sourceModule: 'Business', sourceRecordId: 'CH01-FEE-SEP', memberId: 'M1002', userId: 'M1002', businessId: '', serviceId: '', campaignId: '', eventId: '', chapterId: 'CH01', opportunityId: '', customerId: 'M1002', payerReceiverName: 'प्रिया देशमुख', mobile: '9876500111', email: 'priya@example.com', amount: 3500, discount: 0, tax: 630, gatewayFee: 0, commission: 0, refundAmount: 0, netAmount: 3500, paymentMethod: 'Cash', paymentGateway: '', bankAccount: 'Chapter Revenue', upi: '', cash: true, card: false, netBanking: false, wallet: false, gatewayTransactionId: '', bankReferenceNumber: '', upiReferenceNumber: '', invoiceNumber: 'INV-CH-9001', receiptNumber: 'RCT-CH-9001', paymentStatus: 'Payment Received', settlementStatus: 'Settlement Pending', reconciliationStatus: 'Pending', state: 'महाराष्ट्र', city: 'पुणे', district: 'पुणे', area: 'शिवाजीनगर', chapter: 'पुणे – शिवनेरी व्यवसाय मंडळ', locationLabel: 'Chapter Meeting', createdBy: 'Referral Admin', verifiedBy: 'Finance Admin', approvedBy: '', notes: 'Cash deposit pending bank settlement', attachments: [], invoice: 'INV-CH-9001', receipt: 'RCT-CH-9001', proof: '', createdAt: '2026-09-01T17:05:00.000Z', updatedAt: '2026-09-01T17:10:00.000Z', verifiedAt: '2026-09-01T17:30:00.000Z' },
      { id: 'TXN012', transactionDate: '2026-08-30', transactionTime: '10:40', transactionType: 'Advertisement', transactionCategory: 'Promotion', transactionSubcategory: 'Featured Directory Listing', direction: 'Income', sourceModule: 'Business', sourceRecordId: 'ADV-3002', memberId: 'M1002', userId: 'M1002', businessId: 'B01', serviceId: '', campaignId: '', eventId: '', chapterId: '', opportunityId: '', customerId: 'B01', payerReceiverName: 'राजगड भोजनालय', mobile: '9876500011', email: 'rajgad@example.com', amount: 25000, discount: 2000, tax: 4140, gatewayFee: 200, commission: 0, refundAmount: 0, netAmount: 22800, paymentMethod: 'Net Banking', paymentGateway: 'Razorpay', bankAccount: 'Marketing Revenue', upi: '', cash: false, card: false, netBanking: true, wallet: false, gatewayTransactionId: 'RPY-ADV-01', bankReferenceNumber: 'KOTAK3301', upiReferenceNumber: '', invoiceNumber: 'INV-ADV-3002', receiptNumber: 'RCT-ADV-3002', paymentStatus: 'Reconciled', settlementStatus: 'Settled', reconciliationStatus: 'Reconciled', state: 'महाराष्ट्र', city: 'पुणे', district: 'पुणे', area: 'डेक्कन', chapter: '', locationLabel: 'Website', createdBy: 'Marketing Admin', verifiedBy: 'Finance Admin', approvedBy: 'Finance Head', notes: 'Quarterly featured placement', attachments: [], invoice: 'INV-ADV-3002', receipt: 'RCT-ADV-3002', proof: '', createdAt: '2026-08-30T10:40:00.000Z', updatedAt: '2026-08-30T11:05:00.000Z', verifiedAt: '2026-08-30T11:06:00.000Z' }
    ];

    return { members, groups, groupPosts, feedPosts, businesses, campaigns, events, conversations, chapters, professionSeats, chapterMembers, oneToOneMeetings, businessApplications, leads, followups, opportunities, sevaRequests, volunteers, subscriptions, fundAccounts, commissions, expenseLedger, financeApprovals, savedFilters, transactionLedger, reports: [], notifications: [], memberBookmarks: {}, adminActions: [], auditLog: [] };
  }

  // ---------------------------------------------------------------------
  // Core load/save
  // ---------------------------------------------------------------------
  function load() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* fall through to reseed */ }
    const fresh = seedData();
    save(fresh);
    return fresh;
  }

  function save(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }

  let DB = load();

  function persist() {
    save(DB);
  }

  // ---------------------------------------------------------------------
  // Current user helpers (bridges to existing cm_user_* keys from app.js)
  // ---------------------------------------------------------------------
  function currentUserId() {
    return localStorage.getItem('cm_user_id') || 'ME';
  }

  function currentMember() {
    const id = currentUserId();
    let m = DB.members.find(x => x.id === id);
    if (!m) {
      m = {
        id: id,
        name: localStorage.getItem('cm_user_name') || 'नवीन सदस्य',
        avatar: '🙂',
        city: localStorage.getItem('cm_user_city') || 'पुणे',
        district: localStorage.getItem('cm_user_city') || 'पुणे',
        state: 'महाराष्ट्र',
        country: 'भारत',
        lang: 'मराठी',
        profession: '',
        business: '',
        skills: [],
        education: '',
        interests: [],
        about: '',
        social: {},
        volunteer: [],
        verified: { mobile: true, email: false, profile: false },
        tier: localStorage.getItem('cm_user_tier') || 'Basic',
        joined: nowISO(),
        followers: [],
        following: [],
        connections: []
      };
      DB.members.push(m);
      persist();
    }
    return m;
  }

  function upsertCurrentMember(patch) {
    const m = currentMember();
    Object.assign(m, patch);
    persist();
    return m;
  }

  function getMember(id) {
    if (id === 'ME' || id === currentUserId()) return currentMember();
    return DB.members.find(m => m.id === id);
  }

  // ---------------------------------------------------------------------
  // Connections: follow / connect
  // ---------------------------------------------------------------------
  function toggleFollow(targetId) {
    const me = currentMember();
    const target = getMember(targetId);
    if (!target) return false;
    me.following = me.following || [];
    target.followers = target.followers || [];
    const idx = me.following.indexOf(targetId);
    let nowFollowing;
    if (idx >= 0) {
      me.following.splice(idx, 1);
      target.followers = target.followers.filter(f => f !== me.id);
      nowFollowing = false;
    } else {
      me.following.push(targetId);
      target.followers.push(me.id);
      nowFollowing = true;
      addNotification(targetId, `${me.name} यांनी तुम्हाला Follow केले.`);
    }
    persist();
    return nowFollowing;
  }

  function toggleConnect(targetId) {
    const me = currentMember();
    const target = getMember(targetId);
    if (!target) return false;
    me.connections = me.connections || [];
    target.connections = target.connections || [];
    const idx = me.connections.indexOf(targetId);
    let nowConnected;
    if (idx >= 0) {
      me.connections.splice(idx, 1);
      target.connections = target.connections.filter(c => c !== me.id);
      nowConnected = false;
    } else {
      me.connections.push(targetId);
      target.connections.push(me.id);
      nowConnected = true;
      addNotification(targetId, `${me.name} यांनी तुम्हाला Connect विनंती स्वीकारली.`);
    }
    persist();
    return nowConnected;
  }

  function isFollowing(targetId) {
    const me = currentMember();
    return (me.following || []).includes(targetId);
  }

  function isConnected(targetId) {
    const me = currentMember();
    return (me.connections || []).includes(targetId);
  }

  // ---------------------------------------------------------------------
  // Messaging
  // ---------------------------------------------------------------------
  function getConversations() {
    const me = currentUserId();
    return DB.conversations.filter(c => c.participants.includes('ME') || c.participants.includes(me));
  }

  function getOrCreateConversation(targetId) {
    let conv = DB.conversations.find(c => c.participants.includes(targetId) && (c.participants.includes('ME') || c.participants.includes(currentUserId())));
    if (!conv) {
      conv = { id: uid('CONV'), participants: ['ME', targetId], messages: [] };
      DB.conversations.push(conv);
      persist();
    }
    return conv;
  }

  function sendMessage(targetId, text) {
    const conv = getOrCreateConversation(targetId);
    conv.messages.push({ from: 'ME', text: text, ts: nowISO() });
    persist();
    return conv;
  }

  function simulateReply(targetId, text) {
    const conv = getOrCreateConversation(targetId);
    conv.messages.push({ from: targetId, text: text, ts: nowISO() });
    persist();
    return conv;
  }

  // ---------------------------------------------------------------------
  // Groups
  // ---------------------------------------------------------------------
  function getGroup(id) {
    return DB.groups.find(g => g.id === id);
  }

  function toggleJoinGroup(id) {
    const g = getGroup(id);
    if (!g) return false;
    const me = currentUserId();
    g.members = g.members || [];
    const idx = g.members.indexOf(me);
    let joined;
    if (idx >= 0) {
      g.members.splice(idx, 1);
      joined = false;
    } else {
      g.members.push(me);
      joined = true;
    }
    persist();
    return joined;
  }

  function isGroupMember(id) {
    const g = getGroup(id);
    return !!g && (g.members || []).includes(currentUserId());
  }

  function getGroupPosts(groupId) {
    return DB.groupPosts.filter(p => p.groupId === groupId).sort((a, b) => new Date(b.ts) - new Date(a.ts));
  }

  function addGroupPost(groupId, text) {
    const post = { id: uid('GP'), groupId: groupId, authorId: currentUserId(), text: text, ts: nowISO(), likes: [], comments: [] };
    DB.groupPosts.unshift(post);
    persist();
    return post;
  }

  // ---------------------------------------------------------------------
  // Feed posts (community-wide)
  // ---------------------------------------------------------------------
  function getFeedPosts() {
    return DB.feedPosts.slice().sort((a, b) => new Date(b.ts) - new Date(a.ts));
  }

  function addFeedPost(text) {
    const post = { id: uid('FP'), authorId: currentUserId(), text: text, image: '', ts: nowISO(), likes: [], comments: [] };
    DB.feedPosts.unshift(post);
    persist();
    return post;
  }

  function findPost(id) {
    return DB.feedPosts.find(p => p.id === id) || DB.groupPosts.find(p => p.id === id);
  }

  function togglePostLike(id) {
    const post = findPost(id);
    if (!post) return false;
    const me = currentUserId();
    post.likes = post.likes || [];
    const idx = post.likes.indexOf(me);
    let liked;
    if (idx >= 0) { post.likes.splice(idx, 1); liked = false; }
    else { post.likes.push(me); liked = true; }
    persist();
    return liked;
  }

  function addComment(id, text) {
    const post = findPost(id);
    if (!post) return null;
    post.comments = post.comments || [];
    const c = { authorId: currentUserId(), text: text, ts: nowISO() };
    post.comments.push(c);
    persist();
    return c;
  }

  function deletePost(id) {
    DB.feedPosts = DB.feedPosts.filter(p => p.id !== id);
    DB.groupPosts = DB.groupPosts.filter(p => p.id !== id);
    persist();
  }

  // ---------------------------------------------------------------------
  // Businesses
  // ---------------------------------------------------------------------
  function getBusiness(id) {
    return DB.businesses.find(b => b.id === id);
  }

  function addBusinessReview(id, name, rating, text) {
    const biz = getBusiness(id);
    if (!biz) return;
    biz.reviews = biz.reviews || [];
    biz.reviews.unshift({ name: name, rating: rating, text: text });
    const total = biz.reviews.reduce((s, r) => s + r.rating, 0);
    biz.rating = Math.round((total / biz.reviews.length) * 10) / 10;
    persist();
  }

  function addBusiness(biz) {
    biz.id = uid('B');
    biz.reviews = biz.reviews || [];
    biz.rating = biz.rating || 5;
    DB.businesses.unshift(biz);
    persist();
    return biz;
  }

  // ---------------------------------------------------------------------
  // Campaigns / Donations
  // ---------------------------------------------------------------------
  function getCampaign(id) {
    return DB.campaigns.find(c => c.id === id);
  }

  function donate(id, amount, donorName) {
    const c = getCampaign(id);
    if (!c) return null;
    c.collected += amount;
    c.donors += 1;
    c.receipts = c.receipts || [];
    const receiptId = 'CM-REC-' + Math.floor(1000 + Math.random() * 9000);
    c.receipts.unshift({ id: receiptId, amount: amount, donor: donorName, date: new Date().toLocaleDateString('mr-IN') });
    persist();
    return receiptId;
  }

  // ---------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------
  function getEvent(id) {
    return DB.events.find(e => e.id === id);
  }

  function registerForEvent(id, name, phone, city) {
    const ev = getEvent(id);
    if (!ev) return null;
    const ticketId = 'CM-TKT-' + Math.floor(10000 + Math.random() * 90000);
    ev.registrations = ev.registrations || [];
    ev.registrations.push({ ticketId: ticketId, name: name, phone: phone, city: city, ts: nowISO() });
    persist();
    return ticketId;
  }

  // ---------------------------------------------------------------------
  // Reports / Moderation
  // ---------------------------------------------------------------------
  function fileReport(type, targetId, targetLabel, reason) {
    const report = { id: uid('RPT'), type: type, targetId: targetId, targetLabel: targetLabel, reason: reason, reporterId: currentUserId(), status: 'प्रलंबित', ts: nowISO() };
    DB.reports.unshift(report);
    persist();
    return report;
  }

  function setReportStatus(id, status) {
    const r = DB.reports.find(x => x.id === id);
    if (r) { r.status = status; persist(); }
  }

  // ---------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------
  function addNotification(userId, text) {
    DB.notifications.unshift({ id: uid('NTF'), userId: userId, text: text, ts: nowISO(), read: false });
    persist();
  }

  function getNotifications() {
    const me = currentUserId();
    return DB.notifications.filter(n => n.userId === me || n.userId === 'ME');
  }

  // ---------------------------------------------------------------------
  // Bookmarks (saved forts / articles)
  // ---------------------------------------------------------------------
  function toggleBookmark(kind, itemId, label) {
    const me = currentUserId();
    DB.memberBookmarks[me] = DB.memberBookmarks[me] || { forts: [], articles: [] };
    const list = DB.memberBookmarks[me][kind] || (DB.memberBookmarks[me][kind] = []);
    const idx = list.findIndex(x => x.id === itemId);
    let saved;
    if (idx >= 0) { list.splice(idx, 1); saved = false; }
    else { list.push({ id: itemId, label: label }); saved = true; }
    persist();
    return saved;
  }

  function isBookmarked(kind, itemId) {
    const me = currentUserId();
    const bucket = DB.memberBookmarks[me];
    if (!bucket || !bucket[kind]) return false;
    return bucket[kind].some(x => x.id === itemId);
  }

  function getBookmarks(kind) {
    const me = currentUserId();
    const bucket = DB.memberBookmarks[me];
    return (bucket && bucket[kind]) || [];
  }

  // ---------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------
  const CITY_ALIASES = {
    pune: 'पुणे', mumbai: 'मुंबई', bombay: 'मुंबई', nashik: 'नाशिक', nasik: 'नाशिक',
    kolhapur: 'कोल्हापूर', satara: 'सातारा', sangli: 'सांगली', solapur: 'सोलापूर',
    nagpur: 'नागपूर', aurangabad: 'छत्रपती संभाजीनगर', sambhajinagar: 'छत्रपती संभाजीनगर',
    thane: 'ठाणे', raigad: 'रायगड', bengaluru: 'बेंगळुरू', bangalore: 'बेंगळुरू'
  };

  function searchMembers(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return DB.members;
    const cleaned = q.replace(/मधील|शोधा|मध्ये/g, ' ');
    const tokens = cleaned.split(/\s+/).filter(Boolean).map(t => CITY_ALIASES[t] || t);
    return DB.members.filter(m => {
      const hay = [m.name, m.city, m.district, m.profession, m.business, (m.skills || []).join(' '), (m.interests || []).join(' ')].join(' ').toLowerCase();
      return tokens.every(t => hay.includes(t));
    });
  }

  // ---------------------------------------------------------------------
  // Admin / stats
  // ---------------------------------------------------------------------
  function stats() {
    const bookings = JSON.parse(localStorage.getItem('cm_booked_services') || '[]');
    return {
      totalMembers: DB.members.length,
      verifiedMembers: DB.members.filter(m => m.verified && m.verified.profile).length,
      businesses: DB.businesses.length,
      groups: DB.groups.length,
      events: DB.events.length,
      campaigns: DB.campaigns.length,
      totalDonations: DB.campaigns.reduce((s, c) => s + c.collected, 0),
      posts: DB.feedPosts.length + DB.groupPosts.length,
      pendingReports: DB.reports.filter(r => r.status === 'प्रलंबित').length,
      bookings: bookings.length
    };
  }

  function resetAll() {
    localStorage.removeItem(DB_KEY);
    DB = load();
  }

  // ---------------------------------------------------------------------
  // CRM / Admin ERP extensions (leads, followups, opportunities, seva,
  // volunteers, audit log). Additive only — does not touch anything above.
  // ---------------------------------------------------------------------
  function ensureCrmCollections() {
    DB.leads = DB.leads || [];
    DB.followups = DB.followups || [];
    DB.opportunities = DB.opportunities || [];
    DB.sevaRequests = DB.sevaRequests || [];
    DB.volunteers = DB.volunteers || [];
    DB.auditLog = DB.auditLog || [];
    DB.chapters = DB.chapters || [];
    DB.professionSeats = DB.professionSeats || [];
    DB.chapterMembers = DB.chapterMembers || [];
    DB.oneToOneMeetings = DB.oneToOneMeetings || [];
    DB.businessApplications = DB.businessApplications || [];
    DB.serviceEnquiries = DB.serviceEnquiries || [];
    DB.serviceRequests = DB.serviceRequests || [];
    DB.subscriptions = DB.subscriptions || [];
    DB.fundAccounts = DB.fundAccounts || [];
    DB.commissions = DB.commissions || [];
    DB.expenseLedger = DB.expenseLedger || [];
    DB.financeApprovals = DB.financeApprovals || [];
    DB.savedFilters = DB.savedFilters || [];
    DB.transactionLedger = DB.transactionLedger || [];
    // default `verified` flag on businesses (admin verify/feature toggle)
    (DB.businesses || []).forEach(b => { if (typeof b.verified === 'undefined') b.verified = false; });
  }
  ensureCrmCollections();

  function logAudit(action, entity, entityId, oldValue, newValue) {
    ensureCrmCollections();
    const who = (function () {
      try { return currentMember().name; } catch (e) { return 'Admin'; }
    })();
    const entry = {
      id: uid('AUD'), who: who, action: action, entity: entity, entityId: entityId || '',
      oldValue: oldValue === undefined ? null : oldValue,
      newValue: newValue === undefined ? null : newValue,
      ts: nowISO()
    };
    DB.auditLog.unshift(entry);
    persist();
    return entry;
  }

  // ---- Leads ----
  function listLeads() { ensureCrmCollections(); return DB.leads.slice().sort((a, b) => new Date(b.ts) - new Date(a.ts)); }
  function getLead(id) { ensureCrmCollections(); return DB.leads.find(l => l.id === id); }
  function createLead(data) {
    ensureCrmCollections();
    const lead = Object.assign({
      id: uid('LD'), source: 'Manual', type: 'सदस्य', name: '', mobile: '', email: '',
      location: '', requirement: '', category: '', assignedTo: '', priority: 'Medium',
      status: 'New', expectedValue: 0, followUpDate: '', notes: '', ts: nowISO()
    }, data);
    DB.leads.unshift(lead);
    persist();
    logAudit('create', 'lead', lead.id, null, lead);
    return lead;
  }
  function updateLead(id, patch) {
    const lead = getLead(id);
    if (!lead) return null;
    const oldValue = Object.assign({}, lead);
    Object.assign(lead, patch);
    persist();
    logAudit('update', 'lead', id, oldValue, patch);
    return lead;
  }
  function deleteLead(id) {
    ensureCrmCollections();
    const lead = getLead(id);
    DB.leads = DB.leads.filter(l => l.id !== id);
    persist();
    logAudit('delete', 'lead', id, lead, null);
  }
  function setLeadStatus(id, status) { return updateLead(id, { status: status }); }

  // ---- Follow-ups ----
  function listFollowups(leadId) {
    ensureCrmCollections();
    const all = DB.followups.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    return leadId ? all.filter(f => f.leadId === leadId) : all;
  }
  function createFollowup(data) {
    ensureCrmCollections();
    const f = Object.assign({
      id: uid('FU'), leadId: '', memberId: '', assignedTo: '', date: nowISO().slice(0, 10),
      purpose: '', outcome: '', status: 'Scheduled'
    }, data);
    DB.followups.unshift(f);
    persist();
    logAudit('create', 'followup', f.id, null, f);
    return f;
  }
  function updateFollowup(id, patch) {
    ensureCrmCollections();
    const f = DB.followups.find(x => x.id === id);
    if (!f) return null;
    const oldValue = Object.assign({}, f);
    Object.assign(f, patch);
    persist();
    logAudit('update', 'followup', id, oldValue, patch);
    return f;
  }
  function deleteFollowup(id) {
    ensureCrmCollections();
    const f = DB.followups.find(x => x.id === id);
    DB.followups = DB.followups.filter(x => x.id !== id);
    persist();
    logAudit('delete', 'followup', id, f, null);
  }

  // ---- Chapters / व्यवसाय मंडळे ----
  function getChapters() { ensureCrmCollections(); return DB.chapters.slice(); }
  function getChapter(idOrSlug) {
    ensureCrmCollections();
    return DB.chapters.find(c => c.id === idOrSlug || c.slug === idOrSlug) || null;
  }
  function getProfessionSeats(chapterId) {
    ensureCrmCollections();
    return DB.professionSeats.filter(s => !chapterId || s.chapterId === chapterId);
  }
  function getChapterMembers(chapterId) {
    ensureCrmCollections();
    return DB.chapterMembers.filter(m => m.chapterId === chapterId);
  }
  function getChapterMemberForUser(memberId) {
    ensureCrmCollections();
    const targetId = memberId || currentUserId();
    return DB.chapterMembers.find(m => m.memberId === targetId) || null;
  }
  function getOneToOneMeetings(memberId) {
    ensureCrmCollections();
    const targetId = memberId || currentUserId();
    return DB.oneToOneMeetings
      .filter(m => !targetId || m.requesterId === targetId || m.recipientId === targetId)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  function createOneToOneMeeting(data) {
    ensureCrmCollections();
    const meeting = Object.assign({
      id: uid('OTO'),
      chapterId: '',
      requesterId: currentUserId(),
      recipientId: '',
      purpose: '',
      topics: '',
      date: '',
      time: '',
      location: '',
      mode: 'Offline',
      status: 'requested',
      nextAction: '',
      notes: ''
    }, data);
    DB.oneToOneMeetings.unshift(meeting);
    persist();
    logAudit('create', 'oneToOneMeeting', meeting.id, null, meeting);
    return meeting;
  }
  function submitBusinessMembershipApplication(data) {
    ensureCrmCollections();
    const application = Object.assign({
      id: uid('APP'),
      memberId: currentUserId(),
      chapterId: '',
      fullName: currentMember().name,
      businessName: '',
      category: '',
      specialty: '',
      city: currentMember().city,
      idealCustomer: '',
      referralsWanted: '',
      canRefer: '',
      gstin: '',
      website: '',
      status: 'submitted',
      submittedOn: nowISO().slice(0, 10)
    }, data);
    DB.businessApplications.unshift(application);
    persist();
    logAudit('create', 'businessApplication', application.id, null, application);
    return application;
  }
  function getBusinessApplications(memberId) {
    ensureCrmCollections();
    return DB.businessApplications.filter(a => !memberId || a.memberId === memberId);
  }
  function updateBusinessApplication(id, patch) {
    ensureCrmCollections();
    const app = DB.businessApplications.find(a => a.id === id);
    if (!app) return null;
    const oldValue = Object.assign({}, app);
    Object.assign(app, patch);
    persist();
    logAudit('update', 'businessApplication', id, oldValue, patch);
    return app;
  }
  function assignProfessionSeat(seatId, memberId) {
    ensureCrmCollections();
    const seat = DB.professionSeats.find(s => s.id === seatId);
    if (!seat) return null;
    const oldSeat = Object.assign({}, seat);
    const existing = DB.chapterMembers.find(m => m.chapterId === seat.chapterId && m.memberId === memberId);
    seat.memberId = memberId;
    seat.status = 'occupied';
    seat.approvalRequired = false;
    if (!existing) {
      DB.chapterMembers.push({
        id: uid('CHM'),
        chapterId: seat.chapterId,
        memberId: memberId,
        role: 'सदस्य',
        profession: seat.category,
        specialty: seat.specialty,
        joinedOn: nowISO().slice(0, 10),
        mentorId: ''
      });
    }
    const chapter = DB.chapters.find(c => c.id === seat.chapterId);
    if (chapter) {
      chapter.openSeats = Math.max(0, DB.professionSeats.filter(s => s.chapterId === seat.chapterId && s.status !== 'occupied').length);
    }
    persist();
    logAudit('assign', 'professionSeat', seatId, oldSeat, { memberId: memberId, status: 'occupied' });
    return seat;
  }
  function releaseProfessionSeat(seatId) {
    ensureCrmCollections();
    const seat = DB.professionSeats.find(s => s.id === seatId);
    if (!seat) return null;
    const oldSeat = Object.assign({}, seat);
    const releasedMemberId = seat.memberId;
    seat.memberId = '';
    seat.status = seat.approvalRequired ? 'approval' : 'open';
    const chapter = DB.chapters.find(c => c.id === seat.chapterId);
    if (chapter) {
      chapter.openSeats = DB.professionSeats.filter(s => s.chapterId === seat.chapterId && s.status !== 'occupied').length;
    }
    if (releasedMemberId) {
      DB.chapterMembers = DB.chapterMembers.filter(m => !(m.chapterId === seat.chapterId && m.memberId === releasedMemberId && m.profession === oldSeat.category));
    }
    persist();
    logAudit('release', 'professionSeat', seatId, oldSeat, { memberId: '', status: seat.status });
    return seat;
  }
  function getMember360(memberId) {
    ensureCrmCollections();
    const member = getMember(memberId);
    if (!member) return null;
    return {
      member,
      chapterMember: getChapterMemberForUser(memberId),
      opportunitiesGiven: DB.opportunities.filter(o => o.creator === memberId),
      opportunitiesReceived: DB.opportunities.filter(o => o.recipient === memberId),
      meetings: DB.oneToOneMeetings.filter(m => m.requesterId === memberId || m.recipientId === memberId),
      applications: DB.businessApplications.filter(a => a.memberId === memberId),
      donations: DB.campaigns.flatMap(c => (c.receipts || []).filter(r => r.donor === member.name).map(r => Object.assign({ campaignTitle: c.title }, r))),
      sevaRequests: DB.sevaRequests.filter(s => s.assignedVolunteer === memberId || s.requesterName === member.name),
      serviceEnquiries: DB.serviceEnquiries.filter(s => s.memberId === memberId),
      serviceRequests: DB.serviceRequests.filter(s => s.memberId === memberId),
      volunteerRecord: DB.volunteers.find(v => v.memberId === memberId) || null
    };
  }
  function getChapterPublicDetail(idOrSlug) {
    ensureCrmCollections();
    const chapter = getChapter(idOrSlug);
    if (!chapter) return null;
    const members = getChapterMembers(chapter.id).map(cm => Object.assign({}, cm, { member: getMember(cm.memberId) }));
    const seats = getProfessionSeats(chapter.id);
    const opportunities = listOpportunities({ chapterId: chapter.id });
    const meetings = getOneToOneMeetings().filter(m => m.chapterId === chapter.id);
    return {
      chapter,
      members,
      seats,
      opportunities,
      meetings,
      openSeats: seats.filter(s => s.status !== 'occupied'),
      occupiedSeats: seats.filter(s => s.status === 'occupied')
    };
  }
  function getBusinessDashboard(memberId) {
    ensureCrmCollections();
    const targetId = memberId || currentUserId();
    const chapterMember = getChapterMemberForUser(targetId);
    const chapter = chapterMember ? getChapter(chapterMember.chapterId) : null;
    const mine = DB.opportunities.filter(o => o.creator === targetId || o.recipient === targetId);
    const given = DB.opportunities.filter(o => o.creator === targetId);
    const received = DB.opportunities.filter(o => o.recipient === targetId);
    const won = mine.filter(o => o.status === 'Won' || o.status === 'Completed');
    const meetings = getOneToOneMeetings(targetId);
    const contributionScore = (given.length * 8) + (won.length * 15) + (meetings.length * 5) + (chapter ? 20 : 0);
    return {
      chapter,
      chapterMember,
      totalOpportunities: mine.length,
      opportunitiesGiven: given.length,
      opportunitiesReceived: received.length,
      closedValue: won.reduce((s, o) => s + (o.actualValue || o.estimatedValue || 0), 0),
      meetings,
      contributionScore,
      pendingApplications: getBusinessApplications(targetId).filter(a => a.status !== 'approved').length
    };
  }
  function unifiedSearch(query) {
    ensureCrmCollections();
    const q = String(query || '').trim().toLowerCase();
    if (!q) return { members: [], businesses: [], chapters: [], events: [], campaigns: [] };
    const by = (arr, mapper) => arr.filter(item => mapper(item).toLowerCase().includes(q));
    return {
      members: by(DB.members, m => [m.name, m.city, m.profession, m.business].join(' ')),
      businesses: by(DB.businesses, b => [b.name, b.owner, b.city, b.cat, (b.services || []).join(' ')].join(' ')),
      chapters: by(DB.chapters, c => [c.marathiName, c.city, c.territory, c.description].join(' ')),
      events: by(DB.events, e => [e.title, e.venue, e.desc, e.cat].join(' ')),
      campaigns: by(DB.campaigns, c => [c.title, c.desc, c.cat].join(' '))
    };
  }

  // ---- Opportunities (व्यवसाय संधी) ----
  function listOpportunities(filters) {
    ensureCrmCollections();
    let list = DB.opportunities.slice().sort((a, b) => new Date(b.ts) - new Date(a.ts));
    if (filters && filters.memberId) list = list.filter(o => o.creator === filters.memberId || o.recipient === filters.memberId);
    if (filters && filters.chapterId) list = list.filter(o => o.chapterId === filters.chapterId);
    if (filters && filters.status) list = list.filter(o => String(o.status).toLowerCase() === String(filters.status).toLowerCase());
    return list;
  }
  function getOpportunity(id) { ensureCrmCollections(); return DB.opportunities.find(o => o.id === id); }
  function createOpportunity(data) {
    ensureCrmCollections();
    const o = Object.assign({
      id: 'CM-' + Math.floor(100000 + Math.random() * 900000),
      chapterId: '',
      creator: currentUserId(),
      recipient: '',
      prospect: '',
      category: '',
      requirement: '',
      location: '',
      permissionToContact: true,
      estimatedValue: 0,
      actualValue: 0,
      qualityGrade: 'B',
      priority: 'Medium',
      status: 'New',
      followUpDate: '',
      notes: '',
      ts: nowISO()
    }, data);
    DB.opportunities.unshift(o);
    persist();
    logAudit('create', 'opportunity', o.id, null, o);
    return o;
  }
  function updateOpportunity(id, patch) {
    const o = getOpportunity(id);
    if (!o) return null;
    const oldValue = Object.assign({}, o);
    Object.assign(o, patch);
    persist();
    logAudit('update', 'opportunity', id, oldValue, patch);
    return o;
  }
  function deleteOpportunity(id) {
    ensureCrmCollections();
    const o = getOpportunity(id);
    DB.opportunities = DB.opportunities.filter(x => x.id !== id);
    persist();
    logAudit('delete', 'opportunity', id, o, null);
  }

  // ---- Service enquiries / bookings ----
  function listServiceEnquiries(memberId) {
    ensureCrmCollections();
    let list = DB.serviceEnquiries.slice().sort((a, b) => new Date(b.ts) - new Date(a.ts));
    if (memberId) list = list.filter(x => x.memberId === memberId);
    return list;
  }
  function createServiceEnquiry(data) {
    ensureCrmCollections();
    const enquiry = Object.assign({
      id: uid('SENQ'),
      memberId: currentUserId(),
      service: '',
      provider: '',
      price: '',
      requirement: '',
      budget: '',
      location: currentMember().city,
      preferredDate: '',
      preferredTime: '',
      status: 'Enquiry',
      ts: nowISO()
    }, data);
    DB.serviceEnquiries.unshift(enquiry);
    DB.serviceRequests.unshift({
      id: uid('SREQ'),
      enquiryId: enquiry.id,
      memberId: enquiry.memberId,
      service: enquiry.service,
      provider: enquiry.provider,
      status: 'Booked',
      preferredDate: enquiry.preferredDate,
      preferredTime: enquiry.preferredTime,
      ts: enquiry.ts
    });
    persist();
    logAudit('create', 'serviceEnquiry', enquiry.id, null, enquiry);
    return enquiry;
  }
  function updateServiceEnquiry(id, patch) {
    ensureCrmCollections();
    const enquiry = DB.serviceEnquiries.find(x => x.id === id);
    if (!enquiry) return null;
    const oldValue = Object.assign({}, enquiry);
    Object.assign(enquiry, patch);
    persist();
    logAudit('update', 'serviceEnquiry', id, oldValue, patch);
    return enquiry;
  }
  function listServiceRequests(memberId) {
    ensureCrmCollections();
    let list = DB.serviceRequests.slice().sort((a, b) => new Date(b.ts) - new Date(a.ts));
    if (memberId) list = list.filter(x => x.memberId === memberId);
    return list;
  }
  function updateServiceRequest(id, patch) {
    ensureCrmCollections();
    const req = DB.serviceRequests.find(x => x.id === id);
    if (!req) return null;
    const oldValue = Object.assign({}, req);
    Object.assign(req, patch);
    persist();
    logAudit('update', 'serviceRequest', id, oldValue, patch);
    return req;
  }

  // ---- Seva requests ----
  function listSevaRequests() {
    ensureCrmCollections();
    return DB.sevaRequests.slice().sort((a, b) => new Date(b.ts) - new Date(a.ts));
  }
  function getSevaRequest(id) { ensureCrmCollections(); return DB.sevaRequests.find(s => s.id === id); }
  function createSevaRequest(data) {
    ensureCrmCollections();
    const s = Object.assign({
      id: uid('SEV'), category: '', requesterName: '', location: '', description: '',
      status: 'New', assignedVolunteer: '', ts: nowISO()
    }, data);
    DB.sevaRequests.unshift(s);
    persist();
    logAudit('create', 'sevaRequest', s.id, null, s);
    return s;
  }
  function updateSevaRequest(id, patch) {
    const s = getSevaRequest(id);
    if (!s) return null;
    const oldValue = Object.assign({}, s);
    Object.assign(s, patch);
    persist();
    logAudit('update', 'sevaRequest', id, oldValue, patch);
    return s;
  }
  function setSevaStatus(id, status) { return updateSevaRequest(id, { status: status }); }
  function deleteSevaRequest(id) {
    ensureCrmCollections();
    const s = getSevaRequest(id);
    DB.sevaRequests = DB.sevaRequests.filter(x => x.id !== id);
    persist();
    logAudit('delete', 'sevaRequest', id, s, null);
  }

  // ---- Volunteers ----
  function listVolunteers() { ensureCrmCollections(); return DB.volunteers.slice(); }
  function getVolunteer(id) { ensureCrmCollections(); return DB.volunteers.find(v => v.id === id); }
  function createVolunteer(data) {
    ensureCrmCollections();
    const v = Object.assign({ id: uid('VOL'), memberId: '', skills: [], city: '', availability: '', tasksCompleted: 0 }, data);
    DB.volunteers.unshift(v);
    persist();
    logAudit('create', 'volunteer', v.id, null, v);
    return v;
  }
  function updateVolunteer(id, patch) {
    const v = getVolunteer(id);
    if (!v) return null;
    const oldValue = Object.assign({}, v);
    Object.assign(v, patch);
    persist();
    logAudit('update', 'volunteer', id, oldValue, patch);
    return v;
  }
  function deleteVolunteer(id) {
    ensureCrmCollections();
    const v = getVolunteer(id);
    DB.volunteers = DB.volunteers.filter(x => x.id !== id);
    persist();
    logAudit('delete', 'volunteer', id, v, null);
  }

  // ---- Business verify/feature toggle (admin) ----
  function setBusinessVerified(id, verified) {
    const b = getBusiness(id);
    if (!b) return null;
    const oldValue = !!b.verified;
    b.verified = !!verified;
    persist();
    logAudit('update', 'business', id, { verified: oldValue }, { verified: b.verified });
    return b;
  }

  // ---- Member admin update (verified/tier) ----
  function adminUpdateMember(id, patch) {
    const m = getMember(id);
    if (!m) return null;
    const oldValue = { verified: m.verified, tier: m.tier };
    Object.assign(m, patch);
    persist();
    logAudit('update', 'member', id, oldValue, patch);
    return m;
  }

  // ---- Audit log ----
  function getAuditLog() { ensureCrmCollections(); return DB.auditLog.slice(); }

  // ---- Finance / Funds analytics ----
  function monthKeyFromDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }
  function getYearsFromTransactions() {
    ensureCrmCollections();
    return Array.from(new Set(DB.transactionLedger.map(t => String(new Date(t.transactionDate).getFullYear())))).sort();
  }
  function matchDateQuick(dateStr, quick) {
    if (!quick) return true;
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const test = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.floor((today - test) / 86400000);
    if (quick === 'today') return diffDays === 0;
    if (quick === 'yesterday') return diffDays === 1;
    if (quick === '7d') return diffDays >= 0 && diffDays < 7;
    if (quick === '30d') return diffDays >= 0 && diffDays < 30;
    if (quick === 'thisMonth') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    if (quick === 'lastMonth') {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getFullYear() === prev.getFullYear() && d.getMonth() === prev.getMonth();
    }
    if (quick === 'thisYear') return d.getFullYear() === now.getFullYear();
    if (quick === 'lastYear') return d.getFullYear() === now.getFullYear() - 1;
    return true;
  }
  function inAmountRange(amount, bucket) {
    const val = Number(amount) || 0;
    if (!bucket) return true;
    if (bucket === '0-1000') return val >= 0 && val <= 1000;
    if (bucket === '1000-5000') return val > 1000 && val <= 5000;
    if (bucket === '5000-10000') return val > 5000 && val <= 10000;
    if (bucket === '10000-50000') return val > 10000 && val <= 50000;
    if (bucket === '50000+') return val > 50000;
    return true;
  }
  function filterTransactions(filters) {
    ensureCrmCollections();
    filters = filters || {};
    return DB.transactionLedger.filter(t => {
      const hay = [t.id, t.transactionType, t.transactionCategory, t.transactionSubcategory, t.payerReceiverName, t.city, t.district, t.state, t.sourceModule, t.paymentStatus, t.settlementStatus, t.reconciliationStatus].join(' ').toLowerCase();
      if (filters.query && !hay.includes(String(filters.query).toLowerCase())) return false;
      if (filters.quick && !matchDateQuick(t.transactionDate, filters.quick)) return false;
      if (filters.month && String(new Date(t.transactionDate).getMonth() + 1) !== String(filters.month)) return false;
      if (filters.year && String(new Date(t.transactionDate).getFullYear()) !== String(filters.year)) return false;
      if (filters.state && t.state !== filters.state) return false;
      if (filters.district && t.district !== filters.district) return false;
      if (filters.city && t.city !== filters.city) return false;
      if (filters.direction && t.direction !== filters.direction) return false;
      if (filters.type && t.transactionType !== filters.type) return false;
      if (filters.category && t.transactionCategory !== filters.category) return false;
      if (filters.sourceModule && t.sourceModule !== filters.sourceModule) return false;
      if (filters.paymentStatus && t.paymentStatus !== filters.paymentStatus) return false;
      if (filters.settlementStatus && t.settlementStatus !== filters.settlementStatus) return false;
      if (filters.reconciliationStatus && t.reconciliationStatus !== filters.reconciliationStatus) return false;
      if (!inAmountRange(t.amount, filters.amountRange)) return false;
      return true;
    }).slice().sort((a, b) => new Date(b.createdAt || b.transactionDate) - new Date(a.createdAt || a.transactionDate));
  }
  function listExpenses(filters) {
    ensureCrmCollections();
    filters = filters || {};
    return DB.expenseLedger.filter(e => {
      const hay = [e.id, e.category, e.subcategory, e.vendor, e.city, e.state, e.description, e.status].join(' ').toLowerCase();
      if (filters.query && !hay.includes(String(filters.query).toLowerCase())) return false;
      if (filters.quick && !matchDateQuick(e.expenseDate, filters.quick)) return false;
      if (filters.month && String(new Date(e.expenseDate).getMonth() + 1) !== String(filters.month)) return false;
      if (filters.year && String(new Date(e.expenseDate).getFullYear()) !== String(filters.year)) return false;
      if (filters.category && e.category !== filters.category) return false;
      if (filters.city && e.city !== filters.city) return false;
      if (filters.state && e.state !== filters.state) return false;
      if (filters.status && e.status !== filters.status) return false;
      if (!inAmountRange(e.totalAmount, filters.amountRange)) return false;
      return true;
    }).slice().sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
  }
  function listSubscriptions(filters) {
    ensureCrmCollections();
    filters = filters || {};
    return DB.subscriptions.filter(s => {
      const hay = [s.id, s.memberName, s.plan, s.membershipType, s.city, s.state, s.status].join(' ').toLowerCase();
      if (filters.query && !hay.includes(String(filters.query).toLowerCase())) return false;
      if (filters.quick && !matchDateQuick(s.paymentDate || s.startDate, filters.quick)) return false;
      if (filters.month && String(new Date(s.paymentDate || s.startDate).getMonth() + 1) !== String(filters.month)) return false;
      if (filters.year && String(new Date(s.paymentDate || s.startDate).getFullYear()) !== String(filters.year)) return false;
      if (filters.status && s.status !== filters.status) return false;
      if (filters.membershipType && s.membershipType !== filters.membershipType) return false;
      if (filters.city && s.city !== filters.city) return false;
      if (filters.state && s.state !== filters.state) return false;
      return true;
    }).slice().sort((a, b) => new Date(b.paymentDate || b.startDate) - new Date(a.paymentDate || a.startDate));
  }
  function listCommissions(filters) {
    ensureCrmCollections();
    filters = filters || {};
    return DB.commissions.filter(c => {
      const hay = [c.id, c.source, c.sourceRecord, c.payableTo, c.city, c.state, c.status].join(' ').toLowerCase();
      if (filters.query && !hay.includes(String(filters.query).toLowerCase())) return false;
      if (filters.status && c.status !== filters.status) return false;
      if (filters.source && c.source !== filters.source) return false;
      if (filters.city && c.city !== filters.city) return false;
      if (filters.state && c.state !== filters.state) return false;
      if (!inAmountRange(c.commissionAmount, filters.amountRange)) return false;
      return true;
    }).slice().sort((a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0));
  }
  function listFundAccounts() { ensureCrmCollections(); return DB.fundAccounts.slice(); }
  function getSavedFilters(moduleName) {
    ensureCrmCollections();
    return DB.savedFilters.filter(f => !moduleName || f.module === moduleName);
  }
  function saveFilter(moduleName, name, conditions) {
    ensureCrmCollections();
    const rec = { id: uid('FLT'), module: moduleName, name: name, conditions: conditions || [] };
    DB.savedFilters.unshift(rec);
    persist();
    logAudit('create', 'savedFilter', rec.id, null, rec);
    return rec;
  }
  function getFinanceDashboard(filters) {
    const txns = filterTransactions(filters);
    const todayTxns = txns.filter(t => matchDateQuick(t.transactionDate, 'today'));
    const monthTxns = txns.filter(t => matchDateQuick(t.transactionDate, 'thisMonth'));
    const yearTxns = txns.filter(t => matchDateQuick(t.transactionDate, 'thisYear'));
    const income = arr => arr.filter(t => t.direction === 'Income' && !['Failed', 'Cancelled', 'Refunded'].includes(t.paymentStatus));
    const expense = arr => arr.filter(t => t.direction === 'Expense');
    const sum = (arr, fn) => arr.reduce((s, x) => s + (fn ? fn(x) : Number(x.amount || 0)), 0);
    const revByType = (arr, type) => sum(income(arr).filter(t => t.transactionType === type), t => t.netAmount || t.amount || 0);
    const todayIncome = income(todayTxns);
    const monthIncome = income(monthTxns);
    const yearIncome = income(yearTxns);
    const todayExpense = expense(todayTxns);
    const monthExpense = expense(monthTxns);
    const yearExpense = expense(yearTxns);
    const byMonth = {};
    income(yearTxns).forEach(t => {
      const key = monthKeyFromDate(t.transactionDate);
      byMonth[key] = (byMonth[key] || 0) + (t.netAmount || t.amount || 0);
    });
    return {
      today: {
        collection: sum(todayIncome, t => t.netAmount || t.amount),
        expenses: sum(todayExpense, t => t.netAmount || t.amount),
        donations: revByType(todayTxns, 'Donation'),
        subscriptions: revByType(todayTxns, 'Membership Subscription'),
        services: revByType(todayTxns, 'Service Revenue'),
        commission: revByType(todayTxns, 'Opportunity Commission'),
        refunds: sum(todayTxns.filter(t => t.paymentStatus === 'Refunded'), t => t.refundAmount || 0),
        pendingSettlements: todayTxns.filter(t => t.settlementStatus === 'Settlement Pending' || t.settlementStatus === 'Pending').length,
        failedTransactions: todayTxns.filter(t => t.paymentStatus === 'Failed').length,
        netCollection: sum(todayIncome, t => t.netAmount || t.amount) - sum(todayExpense, t => t.netAmount || t.amount)
      },
      month: {
        grossRevenue: sum(monthIncome, t => t.amount || 0),
        netRevenue: sum(monthIncome, t => t.netAmount || t.amount),
        donations: revByType(monthTxns, 'Donation'),
        subscriptions: revByType(monthTxns, 'Membership Subscription'),
        services: revByType(monthTxns, 'Service Revenue'),
        commission: revByType(monthTxns, 'Opportunity Commission'),
        events: revByType(monthTxns, 'Event Revenue'),
        sponsorship: revByType(monthTxns, 'Sponsorship'),
        expenses: sum(monthExpense, t => t.netAmount || t.amount),
        refunds: sum(monthTxns.filter(t => t.paymentStatus === 'Refunded'), t => t.refundAmount || 0),
        gatewayCharges: sum(monthTxns, t => t.gatewayFee || 0),
        tax: sum(monthTxns, t => t.tax || 0),
        netBalance: sum(monthIncome, t => t.netAmount || t.amount) - sum(monthExpense, t => t.netAmount || t.amount)
      },
      year: {
        totalRevenue: sum(yearIncome, t => t.netAmount || t.amount),
        totalExpenses: sum(yearExpense, t => t.netAmount || t.amount),
        totalDonations: revByType(yearTxns, 'Donation'),
        totalSubscriptions: revByType(yearTxns, 'Membership Subscription'),
        totalCommission: revByType(yearTxns, 'Opportunity Commission'),
        totalServiceRevenue: revByType(yearTxns, 'Service Revenue'),
        netSurplus: sum(yearIncome, t => t.netAmount || t.amount) - sum(yearExpense, t => t.netAmount || t.amount),
        monthWise: Object.keys(byMonth).sort().map(k => ({ month: k, amount: byMonth[k] }))
      }
    };
  }
  function getDonationFinance(filters) {
    const donations = filterTransactions(Object.assign({}, filters, { type: 'Donation' }));
    const campaignMap = Object.fromEntries(DB.campaigns.map(c => [c.id, c]));
    return {
      totalDonations: donations.reduce((s, d) => s + (d.netAmount || d.amount || 0), 0),
      todayDonations: donations.filter(d => matchDateQuick(d.transactionDate, 'today')).reduce((s, d) => s + (d.netAmount || d.amount || 0), 0),
      monthDonations: donations.filter(d => matchDateQuick(d.transactionDate, 'thisMonth')).reduce((s, d) => s + (d.netAmount || d.amount || 0), 0),
      anonymousDonations: 0,
      memberDonations: donations.filter(d => d.memberId).length,
      businessDonations: donations.filter(d => d.businessId).length,
      recurringDonations: 0,
      failedDonations: donations.filter(d => d.paymentStatus === 'Failed').length,
      refundedDonations: donations.filter(d => d.paymentStatus === 'Refunded').reduce((s, d) => s + (d.refundAmount || 0), 0),
      pendingSettlement: donations.filter(d => d.settlementStatus === 'Settlement Pending' || d.settlementStatus === 'Pending').length,
      campaignWise: DB.campaigns.map(c => ({ id: c.id, title: c.title, collected: c.collected, donors: c.donors, utilized: (c.expenses || []).reduce((s, x) => s + x.amount, 0), unutilized: c.collected - (c.expenses || []).reduce((s, x) => s + x.amount, 0) })),
      entries: donations.map(d => Object.assign({}, d, { campaignTitle: (campaignMap[d.campaignId] || {}).title || d.transactionCategory }))
    };
  }
  function getLocationFinanceReport(filters) {
    const txns = filterTransactions(filters);
    const membersByCity = {};
    DB.members.forEach(m => { membersByCity[m.city] = (membersByCity[m.city] || 0) + 1; });
    const buckets = {};
    txns.forEach(t => {
      const key = t.city || 'Unknown';
      if (!buckets[key]) buckets[key] = { location: key, members: membersByCity[key] || 0, subscription: 0, services: 0, commission: 0, donations: 0, expenses: 0, net: 0 };
      const b = buckets[key];
      const val = t.netAmount || t.amount || 0;
      if (t.direction === 'Expense') b.expenses += val;
      else {
        if (t.transactionType === 'Membership Subscription') b.subscription += val;
        if (t.transactionType === 'Service Revenue') b.services += val;
        if (t.transactionType === 'Opportunity Commission') b.commission += val;
        if (t.transactionType === 'Donation') b.donations += val;
      }
    });
    Object.values(buckets).forEach(b => { b.net = b.subscription + b.services + b.commission + b.donations - b.expenses; });
    return Object.values(buckets).sort((a, b) => b.net - a.net);
  }
  function memberFinancialSummary(memberId) {
    const txns = filterTransactions({}).filter(t => t.memberId === memberId || t.userId === memberId);
    return {
      totalPaid: txns.filter(t => t.direction === 'Income').reduce((s, t) => s + (t.netAmount || t.amount || 0), 0),
      subscriptionPaid: txns.filter(t => t.transactionType === 'Membership Subscription').reduce((s, t) => s + (t.netAmount || t.amount || 0), 0),
      donationAmount: txns.filter(t => t.transactionType === 'Donation').reduce((s, t) => s + (t.netAmount || t.amount || 0), 0),
      serviceAmount: txns.filter(t => t.transactionType === 'Service Revenue').reduce((s, t) => s + (t.netAmount || t.amount || 0), 0),
      commissionGenerated: txns.filter(t => t.transactionType === 'Opportunity Commission').reduce((s, t) => s + (t.netAmount || t.amount || 0), 0),
      eventPayments: txns.filter(t => t.transactionType === 'Event Revenue').reduce((s, t) => s + (t.netAmount || t.amount || 0), 0),
      refunds: txns.filter(t => t.paymentStatus === 'Refunded').reduce((s, t) => s + (t.refundAmount || 0), 0),
      outstanding: txns.filter(t => ['Pending', 'Settlement Pending'].includes(t.settlementStatus) || t.paymentStatus === 'Pending').reduce((s, t) => s + (t.netAmount || t.amount || 0), 0)
    };
  }
  function getMemberIntelligence(filters) {
    ensureCrmCollections();
    filters = filters || {};
    const members = DB.members.filter(m => {
      const hay = [m.id, m.name, m.city, m.district, m.state, m.profession, m.business, (m.interests || []).join(' '), (m.skills || []).join(' ')].join(' ').toLowerCase();
      if (filters.query && !hay.includes(String(filters.query).toLowerCase())) return false;
      if (filters.state && m.state !== filters.state) return false;
      if (filters.district && m.district !== filters.district) return false;
      if (filters.city && m.city !== filters.city) return false;
      if (filters.profession && String(m.profession || '').toLowerCase() !== String(filters.profession).toLowerCase()) return false;
      if (filters.interest && !(m.interests || []).some(i => String(i).toLowerCase().includes(String(filters.interest).toLowerCase()))) return false;
      if (filters.interests && filters.interests.length && !filters.interests.some(i => (m.interests || []).includes(i))) return false;
      return true;
    }).map(m => {
      const fin = memberFinancialSummary(m.id);
      const subs = DB.subscriptions.find(s => s.memberId === m.id);
      const eventsAttended = DB.events.reduce((s, ev) => s + (ev.registrations || []).filter(r => r.name === m.name).length, 0);
      return Object.assign({}, m, {
        subscriptionStatus: subs ? subs.status : 'None',
        membershipPlan: subs ? subs.plan : (m.tier || 'Basic'),
        posts: DB.feedPosts.filter(p => p.authorId === m.id).length + DB.groupPosts.filter(p => p.authorId === m.id).length,
        comments: DB.feedPosts.reduce((s, p) => s + (p.comments || []).filter(c => c.authorId === m.id).length, 0) + DB.groupPosts.reduce((s, p) => s + (p.comments || []).filter(c => c.authorId === m.id).length, 0),
        groupsJoined: DB.groups.filter(g => (g.members || []).includes(m.id)).length,
        eventsAttended,
        businessesAdded: DB.businesses.filter(b => b.owner === m.name || b.owner.includes(m.name.split(' ')[0])).length,
        opportunitiesGiven: DB.opportunities.filter(o => o.creator === m.id).length,
        opportunitiesReceived: DB.opportunities.filter(o => o.recipient === m.id).length,
        donations: fin.donationAmount,
        servicesUsed: fin.serviceAmount,
        totalPaid: fin.totalPaid,
        subscriptionPaid: fin.subscriptionPaid,
        commissionGenerated: fin.commissionGenerated,
        refunds: fin.refunds,
        outstanding: fin.outstanding
      });
    });
    return members;
  }
  function getFinanceRoleDefinition() {
    return {
      role: 'Finance & Funds Administrator',
      responsibility: 'Track → Verify → Reconcile → Categorize → Approve → Report → Audit',
      restricted: ['Change Super Admin', 'Delete members', 'Delete transactions', 'Delete donation records', 'Delete audit logs', 'Change gateway credentials', 'Silent modification of completed records'],
      approvalLevels: [
        { range: '₹0–₹10,000', flow: 'Finance Admin → Approve' },
        { range: '₹10,001–₹50,000', flow: 'Finance Admin → Finance Head' },
        { range: '₹50,001–₹2,00,000', flow: 'Finance Head → Senior Management' },
        { range: '₹2,00,000+', flow: 'Finance Head → Authorized Executive Approval' }
      ]
    };
  }

  // ---- Admin dashboard stats (extends base stats()) ----
  function adminStats() {
    ensureCrmCollections();
    const base = stats();
    const finance = getFinanceDashboard();
    return Object.assign({}, base, {
      openLeads: DB.leads.filter(l => l.status !== 'Converted' && l.status !== 'Closed').length,
      totalLeads: DB.leads.length,
      openSeva: DB.sevaRequests.filter(s => s.status !== 'Resolved' && s.status !== 'Closed').length,
      totalSeva: DB.sevaRequests.length,
      pendingReports: base.pendingReports,
      upcomingEvents: DB.events.filter(e => new Date(e.date) >= new Date(new Date().toDateString())).length,
      totalOpportunities: DB.opportunities.length,
      openOpportunities: DB.opportunities.filter(o => ['New','Contacted','Qualified','Discussion','Proposal','Negotiation','Open','InProgress'].includes(o.status)).length,
      volunteers: DB.volunteers.length,
      verifiedBusinesses: DB.businesses.filter(b => b.verified).length,
      chapters: DB.chapters.length,
      oneToOnes: DB.oneToOneMeetings.length,
      businessApplications: DB.businessApplications.length,
      serviceEnquiries: DB.serviceEnquiries.length,
      serviceRequests: DB.serviceRequests.length,
      transactionCount: DB.transactionLedger.length,
      fundAccounts: DB.fundAccounts.length,
      monthlyNetRevenue: finance.month.netRevenue,
      monthlyExpenses: finance.month.expenses,
      pendingSettlements: finance.today.pendingSettlements
    });
  }

  // ---------------------------------------------------------------------
  // Referral Engine & Global Intelligence Additions
  // ---------------------------------------------------------------------
  function listReferrals(filter = {}) {
    ensureCrmCollections();
    let res = DB.opportunities || [];
    if (filter.creator) res = res.filter(r => r.creator === filter.creator);
    if (filter.recipient) res = res.filter(r => r.recipient === filter.recipient);
    if (filter.status) res = res.filter(r => r.status.toLowerCase() === filter.status.toLowerCase());
    return res;
  }

  function getReferral(id) {
    ensureCrmCollections();
    return (DB.opportunities || []).find(r => r.id === id);
  }

  function createReferral(data) {
    ensureCrmCollections();
    const id = 'CM-' + Math.floor(100000 + Math.random() * 900000);
    const newRef = Object.assign({
      id: id,
      chapterId: 'CH01',
      creator: currentUserId(),
      recipient: 'M1002',
      prospect: 'नवीन संदर्भ client',
      requirement: '',
      category: 'General',
      location: 'पुणे',
      permissionToContact: true,
      estimatedValue: 50000,
      actualValue: 0,
      qualityGrade: 'A',
      priority: 'High',
      status: 'New',
      followUpDate: new Date().toISOString().split('T')[0],
      notes: '',
      ts: nowISO()
    }, data);

    DB.opportunities = DB.opportunities || [];
    DB.opportunities.unshift(newRef);
    persist();
    logAudit('Create Referral', 'Created business referral ' + id);
    return newRef;
  }

  function updateReferralStatus(id, status, actualValue = 0, notes = '') {
    ensureCrmCollections();
    const ref = (DB.opportunities || []).find(r => r.id === id);
    if (ref) {
      ref.status = status;
      if (actualValue > 0) ref.actualValue = actualValue;
      if (notes) ref.notes = notes;
      persist();
      logAudit('Update Referral', 'Updated referral ' + id + ' status to ' + status);
      return ref;
    }
    return null;
  }

  function whoCanHelpMe(query) {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/).filter(w => w.length > 0);
    const currentUser = currentMember() || { connections: [] };

    const results = [];
    (DB.members || []).forEach(m => {
      let score = 0;
      const haystack = (m.name + ' ' + m.profession + ' ' + (m.business || '') + ' ' + m.city + ' ' + (m.skills || []).join(' ') + ' ' + (m.about || '')).toLowerCase();
      words.forEach(w => { if (haystack.includes(w)) score += 15; });
      if (score > 0) {
        const mutual = (m.connections || []).filter(c => (currentUser.connections || []).includes(c)).length;
        results.push({
          type: 'member',
          id: m.id,
          name: m.name,
          title: m.profession + (m.business ? ' (' + m.business + ')' : ''),
          location: m.city + ', ' + m.district,
          skills: m.skills || [],
          score: score + (mutual * 5),
          mutualConnections: mutual,
          rating: 4.8,
          verified: m.verified ? m.verified.profile : true,
          avatar: m.avatar || '👤',
          item: m
        });
      }
    });

    (DB.businesses || []).forEach(b => {
      let score = 0;
      const haystack = (b.name + ' ' + b.owner + ' ' + b.cat + ' ' + b.city + ' ' + (b.services || []).join(' ')).toLowerCase();
      words.forEach(w => { if (haystack.includes(w)) score += 15; });
      if (score > 0) {
        results.push({
          type: 'business',
          id: b.id,
          name: b.name,
          title: 'संचालक: ' + b.owner + ' (' + b.cat + ')',
          location: b.city,
          services: b.services || [],
          score: score + 10,
          mutualConnections: 3,
          rating: b.rating || 4.7,
          verified: true,
          photo: b.photo || '🏢',
          item: b
        });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return results;
  }

  function getCeoMetrics() {
    ensureCrmCollections();
    return {
      totalMembers: 24820,
      totalBusinesses: 8421,
      totalMandals: 184,
      activeMembers: 17420,
      totalReferrals: 32841,
      totalBusinessGenerated: 1846000000,
      totalJobs: 4280,
      totalEvents: 328,
      districtHierarchy: [
        {
          district: 'पुणे',
          mandalsCount: 42,
          membersCount: 6840,
          referralsCount: 9420,
          businessGenerated: 584000000,
          mandals: [
            { name: 'पुणे – शिवनेरी व्यवसाय मंडळ', members: 48, referrals: 1420, business: 84000000 },
            { name: 'पुणे – सिंहगड व्यवसाय संगम', members: 42, referrals: 1180, business: 72000000 },
            { name: 'पिंपरी-चिंचवड औद्योगिक मंडळ', members: 55, referrals: 1890, business: 125000000 }
          ]
        },
        {
          district: 'मुंबई उपनगर & शहर',
          mandalsCount: 38,
          membersCount: 5920,
          referralsCount: 8150,
          businessGenerated: 492000000,
          mandals: [
            { name: 'मुंबई – दादर व्यवसाय मंडळ', members: 45, referrals: 1290, business: 91000000 },
            { name: 'ठाणे – आनंद दिघे व्यापार संगम', members: 50, referrals: 1540, business: 108000000 }
          ]
        },
        {
          district: 'नाशिक',
          mandalsCount: 24,
          membersCount: 3150,
          referralsCount: 4280,
          businessGenerated: 245000000,
          mandals: [
            { name: 'नाशिक – जिजाऊ व्यवसाय संगम', members: 38, referrals: 980, business: 62400000 }
          ]
        },
        {
          district: 'कोल्हापूर & सांगली',
          mandalsCount: 28,
          membersCount: 3890,
          referralsCount: 4920,
          businessGenerated: 285000000,
          mandals: [
            { name: 'कोल्हापूर – शाहू महाराज व्यापार मंडळ', members: 46, referrals: 1350, business: 89000000 }
          ]
        },
        {
          district: 'छत्रपती संभाजीनगर & लातूर',
          mandalsCount: 22,
          membersCount: 2820,
          referralsCount: 3120,
          businessGenerated: 142000000,
          mandals: [
            { name: 'संभाजीनगर – देवगिरी व्यवसाय मंडळ', members: 34, referrals: 840, business: 48000000 }
          ]
        }
      ]
    };
  }

  // ---------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------
  global.CMDB = {
    raw: () => DB,
    persist,
    uid, timeAgo,
    currentUserId, currentMember, upsertCurrentMember, getMember,
    toggleFollow, toggleConnect, isFollowing, isConnected,
    getConversations, getOrCreateConversation, sendMessage, simulateReply,
    getGroup, toggleJoinGroup, isGroupMember, getGroupPosts, addGroupPost,
    getFeedPosts, addFeedPost, togglePostLike, addComment, deletePost, findPost,
    getBusiness, addBusinessReview, addBusiness,
    getCampaign, donate,
    getEvent, registerForEvent,
    fileReport, setReportStatus,
    addNotification, getNotifications,
    toggleBookmark, isBookmarked, getBookmarks,
    searchMembers,
    stats, resetAll,
    // CRM / Admin ERP & Networking Engine additions
    logAudit, getAuditLog, adminStats,
    listLeads, getLead, createLead, updateLead, deleteLead, setLeadStatus,
    listFollowups, createFollowup, updateFollowup, deleteFollowup,
    getChapters, getChapter, getProfessionSeats, getChapterMembers, getChapterMemberForUser, getChapterPublicDetail,
    getOneToOneMeetings, createOneToOneMeeting, submitBusinessMembershipApplication, getBusinessApplications, updateBusinessApplication, assignProfessionSeat, releaseProfessionSeat, getMember360, getBusinessDashboard, unifiedSearch,
    listOpportunities, getOpportunity, createOpportunity, updateOpportunity, deleteOpportunity,
    listReferrals, getReferral, createReferral, updateReferralStatus, whoCanHelpMe, getCeoMetrics,
    listServiceEnquiries, createServiceEnquiry, updateServiceEnquiry, listServiceRequests, updateServiceRequest,
    listSevaRequests, getSevaRequest, createSevaRequest, updateSevaRequest, setSevaStatus, deleteSevaRequest,
    listVolunteers, getVolunteer, createVolunteer, updateVolunteer, deleteVolunteer,
    setBusinessVerified, adminUpdateMember,
    filterTransactions, listExpenses, listSubscriptions, listCommissions, listFundAccounts, getSavedFilters, saveFilter,
    getFinanceDashboard, getDonationFinance, getLocationFinanceReport, getMemberIntelligence, getFinanceRoleDefinition, getYearsFromTransactions
  };
})(window);
