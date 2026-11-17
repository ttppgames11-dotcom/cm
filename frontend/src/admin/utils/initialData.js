// Mock Data Store for Connect Maratha Magazine Admin Panel

export const INITIAL_ISSUES = [
  {
    id: "issue-2026-11",
    title: "युवा उद्योजक विशेषांक",
    slug: "nov-2026",
    month: "नोव्हेंबर",
    year: 2026,
    volume: "वर्ष ३",
    issueNo: "अंक ११",
    publishDate: "2026-11-01",
    status: "published", // published, draft, archived
    coverImage: "/assets/images/user-yuva-udyojak-visheshank.jpg",
    description: "महाराष्ट्रातील नवउद्योजक, शेती प्रक्रिया, ॲग्री-टेक व मराठा व्यवस्थापनशास्त्रावरील सर्वसमावेशक विशेषांक.",
    totalPages: 10,
    articlesCount: 14,
    views: 12450,
    downloads: 3820
  },
  {
    id: "issue-2026-10",
    title: "Startup Maharashtra & Innovation",
    slug: "oct-2026",
    month: "ऑक्टोबर",
    year: 2026,
    volume: "वर्ष ३",
    issueNo: "अंक १०",
    publishDate: "2026-10-01",
    status: "archived",
    coverImage: "/assets/images/startup-maharashtra-hd.jpg",
    description: "कमी भांडवलात सुरू होणारे हाय-प्रॉफिट स्टार्टअप्स आणि सरकारी सबसिडी मार्गदर्शन.",
    totalPages: 10,
    articlesCount: 12,
    views: 18920,
    downloads: 5120
  },
  {
    id: "issue-2026-12",
    title: "भविष्य महाराष्ट्र व ग्लोबल ब्रँड्स (वार्षिक महाविशेषांक)",
    slug: "dec-2026",
    month: "डिसेंबर",
    year: 2026,
    volume: "वर्ष ३",
    issueNo: "अंक १२",
    publishDate: "2026-12-01",
    status: "draft",
    coverImage: "/assets/images/future-maharashtra-hd.jpg",
    description: "AI, तंत्रज्ञान, जागतिक निर्यात आणि मराठमोळ्या बहुराष्ट्रीय कंपन्यांची वार्षिक यशोगाथा.",
    totalPages: 10,
    articlesCount: 8,
    views: 0,
    downloads: 0
  }
];

export const INITIAL_ARTICLES = [
  {
    id: "art-1",
    title: "कमी भांडवलात सुरू करता येणारे ५ हाय-प्रॉफिट स्टार्टअप्स",
    shortDesc: "₹२५,००० ते ₹५०,००० मध्ये स्वतःचा व्यवसाय सुरू करण्याचे प्रॅक्टिकल मॉडेल्स.",
    content: "आजच्या काळात व्यवसाय सुरू करण्यासाठी कोट्यवधींच्या भांडवलाची गरज नसते. ॲग्रो-व्हॅल्यू ॲडिशन, हायपरलोकल डिलिव्हरी नेटवर्क, क्लाउड किचन, डिजिटल मार्केटिंग कन्सल्टिंग आणि वेस्ट-टू-वेल्थ हे ५ उद्योग अत्यंत कमी गुंतवणुकीत दरमहा ₹४०,००० ते ₹१ लाखांपर्यंत नियमित उत्पन्न देऊ शकतात.",
    category: "Startup Maharashtra",
    issueId: "issue-2026-11",
    authorId: "auth-1",
    authorName: "संपादकीय मंडळ",
    featuredImage: "/assets/images/startup-maharashtra-hd.jpg",
    publishDate: "2026-11-12",
    status: "published", // draft, pending, approved, published, rejected
    readTime: "५ मिनिटे",
    pageNo: 2,
    views: 4520,
    likes: 312,
    revisions: [
      { date: "2026-11-05", author: "संपादकीय मंडळ", note: "प्रारंभिक मसुदा तयार केला." },
      { date: "2026-11-10", author: "मुख्य संपादक", note: "तथ्य तपासणी व पेज २ वर जागा निश्चित." }
    ]
  },
  {
    id: "art-2",
    title: "किचनपासून कॉर्पोरेटपर्यंत: कोल्हापूरच्या मसाले उद्योगाची जागतिक भरारी",
    shortDesc: "महिला उद्योजिकेने घरगुती मसाल्यांना थेट लंडन व दुबईच्या बाजारात कसे पोहोचवले?",
    content: "पारंपारिक कला आणि खाद्यसंस्कृतीला आधुनिक पॅकेजिंग आणि FSSAI मानके जोडून कोल्हापूरच्या स्नेहल सावंत यांनी सुरू केलेल्या मसाले उद्योगाची प्रेरक यशोगाथा.",
    category: "महिला उद्योजिका",
    issueId: "issue-2026-11",
    authorId: "auth-2",
    authorName: "स्नेहल सावंत",
    featuredImage: "/assets/images/women-entrepreneur-hub.jpg",
    publishDate: "2026-11-10",
    status: "published",
    readTime: "४ मिनिटे",
    pageNo: 5,
    views: 3890,
    likes: 275,
    revisions: [
      { date: "2026-11-08", author: "स्नेहल सावंत", note: "मुलाखत आधारित लेख सादर." }
    ]
  },
  {
    id: "art-3",
    title: "माझा पहिला ₹१ लाख नफा: व्यवसायातील कॅश-फ्लो कसा मॅनेज करावा?",
    shortDesc: "नफा आणि गल्ला यातील फरक समजून व्यवसायाची आर्थिक शिस्त कशी टिकवावी?",
    content: "व्यवसाय सुरू झाल्यावर येणारा पैसा हा संपूर्ण नफा नसतो. बिझनेस अकाउंट वेगळे ठेवणे, नफ्यातील ठरावीक रक्कम पुन्हा व्यवसायात गुंतवणे आणि सुरक्षित भांडवल उभारणीचे मूलभूत नियम.",
    category: "पैसा आणि प्रगती",
    issueId: "issue-2026-11",
    authorId: "auth-3",
    authorName: "रोहित गायकवाड",
    featuredImage: "/assets/images/paisa-ani-pragati-hd.jpg",
    publishDate: "2026-11-08",
    status: "published",
    readTime: "६ मिनिटे",
    pageNo: 6,
    views: 5210,
    likes: 410,
    revisions: []
  },
  {
    id: "art-4",
    title: "शिवरायांचे व्यवस्थापनशास्त्र: दुर्ग, आरमार आणि आर्थिक स्वावलंबन",
    shortDesc: "छत्रपती शिवरायांचे दुर्गव्यवस्थापन, आरमार निर्मिती आणि आधुनिक उद्योजकांसाठी बिझनेस गव्हर्नन्सचे धडे.",
    content: "छत्रपती शिवाजी महाराजांनी स्थापन केलेले स्वराज्य हे केवळ लष्करी विजय नसून ते उत्कृष्ट प्रशासन, संसाधन नियोजन आणि आर्थिक दूरदृष्टीचे जागतिक उदाहरण होते.",
    category: "मराठा वारसा",
    issueId: "issue-2026-11",
    authorId: "auth-4",
    authorName: "प्रा. विजय देशमुख",
    featuredImage: "/assets/images/maratha-varsa-hd.jpg",
    publishDate: "2026-11-05",
    status: "published",
    readTime: "७ मिनिटे",
    pageNo: 9,
    views: 6840,
    likes: 620,
    revisions: []
  },
  {
    id: "art-5",
    title: "AI आणि ऑटोमेशन: महाराष्ट्रातील लघुउद्योगांसाठी क्रांतिकारी संधी",
    shortDesc: "आर्टिफिशिअल इंटेलिजन्सचा वापर करून स्थानिक फॅक्टरी आणि दुकानांचे ऑपरेशन कसे ऑटोमेट करावे?",
    content: "आधुनिक कृत्रिम बुद्धिमत्ता (AI) आता केवळ मोठ्या टेक कंपन्यांपुरती मर्यादित राहिलेली नाही. अकाउंटिंग, इन्व्हेंटरी मॅनेजमेंट, कस्टमर सर्व्हिस यासाठी उपयुक्त टूल्स.",
    category: "Future Maharashtra",
    issueId: "issue-2026-12",
    authorId: "auth-1",
    authorName: "संपादकीय मंडळ",
    featuredImage: "/assets/images/future-maharashtra-hd.jpg",
    publishDate: "2026-12-01",
    status: "pending",
    readTime: "५ मिनिटे",
    pageNo: 4,
    views: 0,
    likes: 0,
    revisions: [
      { date: "2026-11-15", author: "संपादकीय मंडळ", note: "डिसेंबर अंकासाठी पुनरावलोकनासाठी पाठवला." }
    ]
  }
];

export const INITIAL_AUTHORS = [
  {
    id: "auth-1",
    name: "संपादकीय मंडळ, Connect Maratha",
    designation: "Chief Editorial Desk",
    district: "पुणे",
    email: "editor@connectmaratha.com",
    mobile: "+91 98220 12345",
    avatar: "/assets/images/connect-maratha-cover-story-hd.jpg",
    bio: "Connect Maratha मासिकाचे अधिकृत संपादकीय मंडळ जे राज्यातील अग्रगण्य तज्ज्ञ व विचारवंतांच्या मार्गदर्शनाखाली चालते.",
    articlesCount: 42,
    status: "active"
  },
  {
    id: "auth-2",
    name: "स्नेहल सावंत",
    designation: "महिला उद्योग प्रतिनिधी",
    district: "कोल्हापूर",
    email: "snehal.sawant@gmail.com",
    mobile: "+91 98221 54321",
    avatar: "/assets/images/women-entrepreneur-hub.jpg",
    bio: "महिला बचत गट चळवळ व खाद्य प्रक्रिया उद्योगातील तज्ज्ञ लेखक आणि जिल्हा प्रतिनिधी.",
    articlesCount: 8,
    status: "active"
  },
  {
    id: "auth-3",
    name: "रोहित गायकवाड",
    designation: "चार्टर्ड अकाउंटंट & फायनान्स मेंटॉर",
    district: "मुंबई",
    email: "rohit.finance@gmail.com",
    mobile: "+91 98222 99887",
    avatar: "/assets/images/paisa-ani-pragati-hd.jpg",
    bio: "लघु व मध्यम उद्योगांसाठी कॅश-फ्लो प्लॅनिंग व टॅक्स कन्सल्टंट.",
    articlesCount: 12,
    status: "active"
  },
  {
    id: "auth-4",
    name: "प्रा. विजय देशमुख",
    designation: "शिवकालीन इतिहास संशोधक",
    district: "छत्रपती संभाजीनगर",
    email: "vijay.deshmukh@history.org",
    mobile: "+91 98223 77665",
    avatar: "/assets/images/maratha-varsa-hd.jpg",
    bio: "मराठा आरमार, दुर्ग स्थापत्य व शिवकालीन प्रशासन प्रणालीचे गाढे अभ्यासक.",
    articlesCount: 19,
    status: "active"
  }
];

export const INITIAL_PAGES_10 = [
  { pageNo: 1, title: "Cover Story (मुख्य कव्हर स्टोरी)", category: "युवा उद्योजक", image: "/assets/images/user-yuva-udyojak-visheshank.jpg", desc: "महाराष्ट्रातील तरुण उद्योजकांची धडाकेबाज यशोगाथा.", status: "published" },
  { pageNo: 2, title: "Startup Maharashtra", category: "स्टार्टअप्स", image: "/assets/images/startup-maharashtra-hd.jpg", desc: "कमी भांडवलात सुरू होणारे हाय-प्रॉफिट मॉडेल्स.", status: "published" },
  { pageNo: 3, title: "Business Blueprint", category: "उद्योग मार्गदर्शन", image: "/assets/images/business-strategy-zero-budget.jpg", desc: "व्यवसाय नोंदणी, जीएसटी, ट्रेडमार्क व झिरो बजेट मार्केटिंग.", status: "published" },
  { pageNo: 4, title: "Future Maharashtra", category: "तंत्रज्ञान व AI", image: "/assets/images/future-maharashtra-hd.jpg", desc: "AI, ऑटोमेशन आणि स्थानिक उद्योगांचे आधुनिकीकरण.", status: "published" },
  { pageNo: 5, title: "महिला उद्योजिका", category: "महिला नेतृत्व", image: "/assets/images/women-entrepreneur-hub.jpg", desc: "किचनपासून आंतरराष्ट्रीय निर्यातीपर्यंत महिलांची झेप.", status: "published" },
  { pageNo: 6, title: "पैसा आणि प्रगती", category: "आर्थिक नियोजन", image: "/assets/images/paisa-ani-pragati-hd.jpg", desc: "कॅश-फ्लो, वर्किंग कॅपिटल आणि बॅलन्स शीट नियोजन.", status: "published" },
  { pageNo: 7, title: "जिल्हा उद्योग संगम", category: "स्थानिक उद्योग", image: "/assets/images/maratha-business-sangam.jpg", desc: "३६ जिल्ह्यांमधील स्थानिक MIDC संधी व बिझनेस नेटवर्क.", status: "published" },
  { pageNo: 8, title: "युवा करिअर & Tech", category: "करिअर व नोकऱ्या", image: "/assets/images/yuva-career-tech-hd.jpg", desc: "हाय-डिमांड टेक करिअर्स व मराठी तरुणांसाठी जागतिक संधी.", status: "published" },
  { pageNo: 9, title: "मराठा वारसा & व्यवस्थापन", category: "इतिहास व प्रशासन", image: "/assets/images/maratha-varsa-hd.jpg", desc: "शिवकालीन दुर्ग, आरमार आणि आर्थिक स्वावलंबन.", status: "published" },
  { pageNo: 10, title: "यशोगाथा & आभार", category: "यशस्वी प्रेरणा", image: "/assets/images/success-stories-hd.jpg", desc: "शून्यातून निर्माण केलेल्या प्रेरणादायी यशोगाथा व संपर्क.", status: "published" }
];

export const INITIAL_ADVERTISEMENTS = [
  {
    id: "ad-1",
    advertiserName: "सह्याद्री ॲग्रो फूड्स प्रा. लि.",
    title: "ऑर्गेनिक गूळ व प्रक्रिया उत्पादने",
    type: "Magazine Advertisement",
    position: "Back Cover (अंतिम पृष्ठ)",
    issueId: "issue-2026-11",
    bannerImage: "/assets/images/agrotech-kranti-hd.jpg",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    status: "active",
    amount: "₹७,५००",
    clicks: 1420
  },
  {
    id: "ad-2",
    advertiserName: "स्वराज्य टेक सोल्युशन्स",
    title: "GST बिलिंग व ERP सॉफ्टवेअर",
    type: "Sponsored Articles",
    position: "Page 3 Inside Feature",
    issueId: "issue-2026-11",
    bannerImage: "/assets/images/business-blueprint-hd.jpg",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    status: "active",
    amount: "₹२,९९९",
    clicks: 980
  },
  {
    id: "ad-3",
    advertiserName: "रॉयल मराठा ज्वेलर्स",
    title: "पारंपारिक मराठमोळे दागिने संग्रह",
    type: "Brand Partnerships",
    position: "Inside Front Cover (पान २ स्लॉट)",
    issueId: "issue-2026-11",
    bannerImage: "/assets/images/maratha-vyavasthapan-hd.jpg",
    startDate: "2026-11-01",
    endDate: "2027-10-31",
    status: "active",
    amount: "₹२५,०००",
    clicks: 2840
  }
];

export const INITIAL_PACKAGES = [
  { id: "pkg-1", name: "Digital Business Listing", price: "₹४९९", period: "/ वर्ष", proposedPriceNum: 499, desc: "Connect Maratha च्या अधिकृत बिझनेस नेटवर्क व डिरेक्टरीमध्ये थेट नोंदणी.", status: "active", salesCount: 142 },
  { id: "pkg-2", name: "Featured Business Profile", price: "₹१,४९९", period: "एकवेळ", proposedPriceNum: 1499, desc: "पोर्टलवर हायलाइट प्रोफाइल व सोशल मीडिया विशेष प्रसिद्धी.", status: "active", salesCount: 56 },
  { id: "pkg-3", name: "Sponsored Article", price: "₹२,९९९", period: "/ लेख", proposedPriceNum: 2999, desc: "८०० शब्दांचा संपादकीय लेख, फोटो व कंपनी संपर्क तपशील.", status: "active", salesCount: 88 },
  { id: "pkg-4", name: "Founder Interview Package", price: "₹४,९९९", period: "/ मुलाखत", proposedPriceNum: 4999, desc: "संपादकीय विशेष मुलाखत, डिजिटल कव्हर स्टोरी व व्हिडिओ बाइट.", status: "active", salesCount: 24 },
  { id: "pkg-5", name: "Website Banner Monthly", price: "₹२,०००", period: "/ महिना", proposedPriceNum: 2000, desc: "वेबसाइट मुख्य पृष्ठावर १ महिना टॉप बॅनर प्रदर्शन.", status: "active", salesCount: 38 },
  { id: "pkg-6", name: "Magazine + Website Bundle", price: "₹७,५००", period: "अंकानुसार", proposedPriceNum: 7500, desc: "१० पानी अंकात पूर्ण/अर्ध्या पानाची प्रिंट जाहिरात + डिजिटल आवृत्ती.", status: "active", salesCount: 65 },
  { id: "pkg-7", name: "Annual Media Partner", price: "₹२५,०००", period: "/ वर्ष", proposedPriceNum: 25000, desc: "Connect Maratha च्या संपूर्ण डिजिटल व प्रिंट परिसंस्थेचे वार्षिक अधिकृत भागीदार.", status: "active", salesCount: 18 }
];

export const INITIAL_SUBSCRIPTIONS = [
  { id: "sub-101", subscriberName: "आनंदराव मोहिते", email: "anand.mohite@gmail.com", mobile: "+91 94220 11223", type: "Print + Digital Subscription", district: "सातारा", startDate: "2026-01-15", expiryDate: "2027-01-14", status: "active", paymentStatus: "Paid (डेमो)" },
  { id: "sub-102", subscriberName: "सुप्रिया जगताप", email: "supriya.jagtap@yahoo.com", mobile: "+91 98811 44556", type: "Annual Digital Subscription", district: "पुणे", startDate: "2026-06-01", expiryDate: "2027-05-31", status: "active", paymentStatus: "Paid (डेमो)" },
  { id: "sub-103", subscriberName: "तानाजी भोसले", email: "tanaji.bhosale@rediffmail.com", mobile: "+91 97654 32109", type: "Annual Print Subscription", district: "नागपूर", startDate: "2025-10-10", expiryDate: "2026-10-09", status: "expired", paymentStatus: "Expired" },
  { id: "sub-104", subscriberName: "दिलीप कदम", email: "dilip.kadam@outlook.com", mobile: "+91 99234 56789", type: "Annual Digital Subscription", district: "नाशिक", startDate: "2026-09-01", expiryDate: "2027-08-31", status: "active", paymentStatus: "Paid (डेमो)" }
];

export const INITIAL_APPROVALS = [
  { id: "appr-1", articleTitle: "AI आणि ऑटोमेशन: महाराष्ट्रातील लघुउद्योगांसाठी संधी", author: "संपादकीय मंडळ", category: "Future Maharashtra", submittedDate: "2026-11-15", targetIssue: "डिसेंबर २०२६", currentStage: "Editor Review", status: "pending", editorNotes: "तथ्य तपासणी सुरू आहे. दोन स्थानिक केस स्टडीज जोडणे आवश्यक." },
  { id: "appr-2", articleTitle: "कोल्हापूर गूळ उद्योग: जीआय टॅग ते जागतिक बाजारपेठ", author: "स्नेहल सावंत", category: "ॲग्रो-टेक", submittedDate: "2026-11-14", targetIssue: "डिसेंबर २०२६", currentStage: "Fact Check", status: "pending", editorNotes: "प्रस्तावित निर्यात आकडेवारीचे प्रमाणीकरण चालू." },
  { id: "appr-3", articleTitle: "ग्रामीण तरुणांसाठी ड्रोन पायलट लायसन्स व व्यवसाय संधी", author: "रोहित गायकवाड", category: "युवा करिअर", submittedDate: "2026-11-12", targetIssue: "डिसेंबर २०२६", currentStage: "Approved", status: "approved", editorNotes: "अंतिम मान्यता मिळाली. लेआउट डिझाईनसाठी पाठवला." }
];

export const INITIAL_MEDIA = [
  { id: "med-1", name: "user-yuva-udyojak-visheshank.jpg", url: "/assets/images/user-yuva-udyojak-visheshank.jpg", type: "Magazine Cover", size: "2.4 MB", uploadDate: "2026-11-01", copyright: "Connect Maratha Official", attribution: "Editorial Design Team", usedIn: "नोव्हेंबर २०२६ अंक" },
  { id: "med-2", name: "startup-maharashtra-hd.jpg", url: "/assets/images/startup-maharashtra-hd.jpg", type: "Article Image", size: "1.8 MB", uploadDate: "2026-11-02", copyright: "Licensed Stock", attribution: "Design Desk", usedIn: "Startup Maharashtra स्तंभ" },
  { id: "med-3", name: "business-blueprint-hd.jpg", url: "/assets/images/business-blueprint-hd.jpg", type: "Page Artwork", size: "2.1 MB", uploadDate: "2026-11-03", copyright: "Original Vector", attribution: "CM Creative", usedIn: "Business Blueprint पान ३" },
  { id: "med-4", name: "women-entrepreneur-hub.jpg", url: "/assets/images/women-entrepreneur-hub.jpg", type: "Portrait", size: "1.6 MB", uploadDate: "2026-11-04", copyright: "Subject Permission", attribution: "स्नेहल सावंत", usedIn: "महिला उद्योजिका लेख" },
  { id: "med-5", name: "maratha-varsa-hd.jpg", url: "/assets/images/maratha-varsa-hd.jpg", type: "Historical Heritage", size: "3.2 MB", uploadDate: "2026-11-05", copyright: "Public Heritage / CM Archive", attribution: "इतिहास संशोधन कक्ष", usedIn: "मराठा वारसा पान ९" }
];

