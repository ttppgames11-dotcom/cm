import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path in backend folder
const DB_FILE = path.join(__dirname, '..', 'db.json');
const ORAL_HISTORY_FILE = path.join(__dirname, '..', 'data_oral_history.json');

class RealtimeDatabase {
  constructor() {
    this.data = {};
    this.isSaving = false;
    this.saveTimeout = null;
    this.memberIdMap = new Map();
    this.memberEmailMap = new Map();
    this.memberPhoneMap = new Map();
    this.load();
    this.rebuildIndices();

    // Ensure pending writes flush synchronously on process termination
    process.on('beforeExit', () => this.flushSync());
    process.on('SIGINT', () => { this.flushSync(); process.exit(0); });
    process.on('SIGTERM', () => { this.flushSync(); process.exit(0); });
  }

  rebuildIndices() {
    this.memberIdMap.clear();
    this.memberEmailMap.clear();
    this.memberPhoneMap.clear();

    const members = this.data.members || [];
    for (const m of members) {
      if (m.id) this.memberIdMap.set(String(m.id).toLowerCase(), m);
      if (m.email) this.memberEmailMap.set(String(m.email).toLowerCase(), m);
      if (m.phone) {
        const cleanP = String(m.phone).replace(/[\s-]/g, '');
        this.memberPhoneMap.set(cleanP, m);
      }
    }
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = {};
      }
    } catch (err) {
      console.error('[RealtimeDB] Error reading db.json, initializing empty:', err.message);
      this.data = {};
    }

    // Ensure all 11 domains have initialized collections
    const collections = [
      'members',
      'businesses',
      'businessReviews',
      'referrals',
      'meetings',
      'groups',
      'posts',
      'postComments',
      'events',
      'eventRsvps',
      'campaigns',
      'donations',
      'jobs',
      'jobApplications',
      'services',
      'serviceBookings',
      'doctors',
      'artists',
      'officers',
      'speakers',
      'speakerBookings',
      'organizations',
      'bloodRequests',
      'bloodDonors',
      'matrimony',
      'womenHelp',
      'volunteers',
      'grievances',
      'builders',
      'builderInquiries',
      'manufacturers',
      'dairy',
      'bankLoans',
      'news',
      'oralHistory',
      'quizQuestions',
      'quizSubmissions',
      'quizLeaderboard',
      'auditLogs',
      'notifications',
      'messages',
      'otpCodes',
      'tokenBlacklist',
      'hotels',
      'information'
    ];

    for (const col of collections) {
      if (!Array.isArray(this.data[col])) {
        this.data[col] = [];
      }
    }

    // Sync oral history file if available
    try {
      if (fs.existsSync(ORAL_HISTORY_FILE)) {
        const oralRaw = fs.readFileSync(ORAL_HISTORY_FILE, 'utf8');
        const oralList = JSON.parse(oralRaw);
        if (Array.isArray(oralList) && this.data.oralHistory.length === 0) {
          this.data.oralHistory = oralList;
        }
      }
    } catch (e) {
      console.warn('[RealtimeDB] Oral history sync warning:', e.message);
    }

    // Seed default admin if members empty
    if (this.data.members.length === 0) {
      this.data.members.push({
        id: 'CM-96K-001',
        name: 'अखिल भारतीय मराठा महासंघ मुख्य कार्यालय',
        email: 'admin@connectmaratha.org',
        phone: '+91 98220 96000',
        password_hash: '$2a$08$91qQjU8XbF44O059O57DseK6yY44oXo7M9r/9lqB0n0yCqD9gq1ee', // 'password123'
        avatar: '🏛️',
        city: 'मुंबई',
        district: 'मुंबई शहर',
        state: 'महाराष्ट्र',
        taluka: 'दक्षिण मुंबई',
        kul: '९६ कुळी मराठा',
        gotra: 'कश्यप',
        profession: 'प्रशासन व संघटन',
        business: 'अखिल भारतीय मराठा महासंघ',
        tier: 'Royal Patron',
        role: 'admin',
        joined: new Date().toISOString().split('T')[0],
        verified: true,
        created_at: new Date().toISOString()
      });
    }

    // Ensure dedicated SuperAdmin account exists
    const hasSuperAdmin = this.data.members.some(m => m.role === 'superadmin' || m.email === 'superadmin@connectmaratha.org');
    if (!hasSuperAdmin) {
      this.data.members.push({
        id: 'CM-SUPER-001',
        name: 'छत्रपती शासन सर्वोच्च प्रशासक (SuperAdmin)',
        email: 'superadmin@connectmaratha.org',
        phone: '+91 98220 99999',
        password_hash: '$2a$08$91qQjU8XbF44O059O57DseK6yY44oXo7M9r/9lqB0n0yCqD9gq1ee', // 'password123'
        avatar: '👑',
        city: 'पुणे',
        district: 'पुणे',
        state: 'महाराष्ट्र',
        taluka: 'हवेली',
        kul: '९६ कुळी भोसले',
        gotra: 'कौशिक',
        profession: 'सर्वोच्च प्रशासकीय नियामक',
        business: 'कनेक्ट मराठा केंद्रीय नियामक मंडळ',
        tier: 'Supreme Council',
        role: 'superadmin',
        joined: new Date().toISOString().split('T')[0],
        verified: true,
        verificationStatus: 'प्रमाणित (Verified)',
        created_at: new Date().toISOString()
      });
    }

    // Seed default hotels if empty
    if (!this.data.hotels || this.data.hotels.length === 0) {
      this.data.hotels = [
        {
          id: 'HTL-001',
          name: 'शिवसमर्थ हेरिटेज पॅलेस',
          city: 'पुणे',
          district: 'पुणे',
          category: 'हेरिटेज हॉटेल व रिसॉर्ट',
          star_rating: 4.8,
          address: 'शिवाजीनगर, जंगली महाराज रोड, पुणे',
          phone: '+91 98220 11001',
          email: 'contact@shivsamarthhotel.com',
          website: 'https://shivsamarthhotel.com',
          rooms_count: 45,
          amenities: ['शाही मराठा भोजनालय', 'स्विमिंग पूल', 'कॉन्फरन्स हॉल', 'मोफत वायफाय'],
          price_range: '₹२,५०० - ₹६,००० प्रति रात्र',
          photo: '🏨',
          verified: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'HTL-002',
          name: 'दुर्गराज रायगड व्हॅली रिसॉर्ट',
          city: 'महाड',
          district: 'रायगड',
          category: 'किल्ले पर्यटन रिसॉर्ट',
          star_rating: 4.6,
          address: 'पाचाड पायथा, किल्ले रायगड रोड, महाड',
          phone: '+91 98220 11002',
          email: 'info@raigadresort.in',
          website: 'https://raigadresort.in',
          rooms_count: 28,
          amenities: ['ट्रेकिंग गाइड', 'पारंपरिक चूल जेवण', 'पार्किंग', 'एसी रूम्स'],
          price_range: '₹१,८०० - ₹४,००० प्रति रात्र',
          photo: '🏰',
          verified: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'HTL-003',
          name: 'राजमाता जिजाऊ एक्झिक्युटिव्ह लॉज',
          city: 'छत्रपती संभाजीनगर',
          district: 'छत्रपती संभाजीनगर',
          category: 'बिझनेस हॉटेल',
          star_rating: 4.5,
          address: 'जालना रोड, सिडको, छ. संभाजीनगर',
          phone: '+91 98220 11003',
          email: 'stay@jijauhotel.com',
          website: 'https://jijauhotel.com',
          rooms_count: 35,
          amenities: ['बिझनेस सेंटर', 'शुद्ध शाकाहारी रेस्टॉरंट', 'जिम', '२४x७ रूम सर्व्हिस'],
          price_range: '₹२,००० - ₹४,५०० प्रति रात्र',
          photo: '🏨',
          verified: true,
          created_at: new Date().toISOString()
        }
      ];
    }

    // Seed default information articles if empty
    if (!this.data.information || this.data.information.length === 0) {
      this.data.information = [
        {
          id: 'INFO-001',
          title: 'दुर्गराज रायगड: मराठा साम्राज्याची राजधानी व स्थापत्य वैभव',
          category: 'गड-किल्ले इतिहास',
          author: 'इतिहास संशोधन मंडळ',
          summary: 'रायगडाची अभेद्य तटबंदी, महादरवाजा आणि ३२ मण सुवर्ण सिंहासनावर झालेला शिवराज्याभिषेक सोहळा.',
          content: 'दुर्गराज रायगड हा सह्याद्रीच्या पर्वतरांगेतील सार्वभौम मराठा साम्राज्याची राजधानी असलेला अद्वितीय दुर्ग आहे. छत्रपती शिवाजी महाराजांनी १६७४ मध्ये याच गडावर वैदिक शिवराज्याभिषेक केला.',
          tags: ['रायगड', 'शिवराज्याभिषेक', 'सह्याद्री', 'इतिहास'],
          image_url: '/assets/images/real-raigad-panoramic.jpg',
          featured: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 'INFO-002',
          title: 'मराठा नवउद्योजक मार्गदर्शन व एमएसएमई योजना',
          category: 'उद्योग व वित्त',
          author: 'बिझनेस संगम प्रकोष्ठ',
          summary: 'महाराष्ट्र शासनाच्या अण्णासाहेब पाटील आर्थिक मागास विकास महामंडळाच्या व्याज परतावा योजना व लाभ घेण्याची प्रक्रिया.',
          content: 'मराठा समाजातील तरुणांना उद्योग व व्यवसायात स्वतःच्या पायावर उभे राहण्यासाठी शासन व महासंघ विविध अर्थसाहाय्य व कौशल्य प्रशिक्षण योजना राबवत आहे.',
          tags: ['उद्योग', 'कर्ज', 'अनुदान', 'स्टार्टअप'],
          image_url: '/assets/images/generated/business_sangam_hero.jpg',
          featured: 1,
          created_at: new Date().toISOString()
        }
      ];
    }

    this.save();
  }

  save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.flushAsync();
    }, 50);
    return true;
  }

  flushAsync() {
    try {
      const tmpFile = `${DB_FILE}.${Date.now()}.${Math.floor(Math.random() * 10000)}.tmp`;
      const payload = JSON.stringify(this.data, null, 2);
      fs.writeFile(tmpFile, payload, 'utf8', (err) => {
        if (err) {
          console.error('[RealtimeDB] Error writing temp db file:', err.message);
          return;
        }
        fs.rename(tmpFile, DB_FILE, (renameErr) => {
          if (renameErr) {
            console.error('[RealtimeDB] Error atomically updating db.json:', renameErr.message);
          }
        });
      });
      return true;
    } catch (err) {
      console.error('[RealtimeDB] Async flush error:', err.message);
      return false;
    }
  }

  flushSync() {
    try {
      if (this.saveTimeout) {
        clearTimeout(this.saveTimeout);
        this.saveTimeout = null;
      }
      const tmpFile = `${DB_FILE}.sync.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tmpFile, DB_FILE);
      return true;
    } catch (err) {
      console.error('[RealtimeDB] Error flushing sync:', err.message);
      return false;
    }
  }

  getCollection(name) {
    if (!Array.isArray(this.data[name])) {
      this.data[name] = [];
    }
    return this.data[name];
  }

  findById(name, id) {
    if (!id) return null;
    if (name === 'members') {
      const indexed = this.memberIdMap.get(String(id).toLowerCase());
      if (indexed) return indexed;
    }
    const col = this.getCollection(name);
    return col.find(item => String(item.id) === String(id) || String(item._id) === String(id));
  }

  insert(name, item) {
    const col = this.getCollection(name);
    if (!item.id) {
      item.id = `${name.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;
    }
    if (!item.createdAt && !item.created_at) {
      item.createdAt = new Date().toISOString();
    }
    col.unshift(item);

    if (name === 'members') {
      if (item.id) this.memberIdMap.set(String(item.id).toLowerCase(), item);
      if (item.email) this.memberEmailMap.set(String(item.email).toLowerCase(), item);
      if (item.phone) this.memberPhoneMap.set(String(item.phone).replace(/[\s-]/g, ''), item);
    }

    this.save();
    return item;
  }

  update(name, id, updates) {
    const col = this.getCollection(name);
    const index = col.findIndex(item => String(item.id) === String(id) || String(item._id) === String(id));
    if (index === -1) return null;

    col[index] = {
      ...col[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (name === 'members') {
      const updated = col[index];
      if (updated.id) this.memberIdMap.set(String(updated.id).toLowerCase(), updated);
      if (updated.email) this.memberEmailMap.set(String(updated.email).toLowerCase(), updated);
      if (updated.phone) this.memberPhoneMap.set(String(updated.phone).replace(/[\s-]/g, ''), updated);
    }

    this.save();
    return col[index];
  }

  delete(name, id) {
    const col = this.getCollection(name);
    const index = col.findIndex(item => String(item.id) === String(id) || String(item._id) === String(id));
    if (index === -1) return false;

    const removed = col.splice(index, 1)[0];
    if (name === 'members' && removed) {
      if (removed.id) this.memberIdMap.delete(String(removed.id).toLowerCase());
      if (removed.email) this.memberEmailMap.delete(String(removed.email).toLowerCase());
      if (removed.phone) this.memberPhoneMap.delete(String(removed.phone).replace(/[\s-]/g, ''));
    }

    this.save();
    return true;
  }

  remove(name, id) {
    return this.delete(name, id);
  }

  findOne(name, predicate) {
    const col = this.getCollection(name);
    return col.find(predicate);
  }

  addAuditLog(action, performedBy, details = {}) {
    const log = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      performedBy: performedBy || 'SYSTEM',
      details,
      timestamp: new Date().toISOString()
    };
    this.getCollection('auditLogs').unshift(log);
    this.save();
    return log;
  }

  getDefaultSiteContent() {
    return {
      header: {
        brandTitle: "CONNECT मराठा",
        brandSubtitle: "एक लढा! एक समाज! एक भविष्य!",
        logoIcon: "🚩",
        logoUrl: "/assets/images/maratha_samrajya_logo.png",
        ctaButtonText: "सदस्य व्हा",
        ctaButtonLink: "/register",
        ctaButtonVisible: true
      },
      hero: {
        badgeText: "🚩 CONNECT मराठा — एक लढा! एक समाज! एक भविष्य!",
        title: "मराठा समाजाचे जागतिक डिजिटल व्यासपीठ",
        subtitle: "एकत्र येऊया, संघटित होऊया, समृद्ध होऊया || जय भवानी ! जय शिवाजी !",
        description: "व्यापार, संस्कृती, रोजगार, सामाजिक साहाय्य आणि गड-किल्ले संवर्धन — संपूर्ण मराठा समाजाला एका सशक्त डिजिटल सूत्रात बांधणारे सर्वोच्च नेटवर्क.",
        bannerImageUrl: "/assets/images/maratha-samrajya.jpg",
        primaryButtonText: "डिजिटल सदस्य व्हा 🚩",
        primaryButtonLink: "/register",
        primaryButtonVisible: true,
        secondaryButtonText: "बिझनेस संगम (B2B)",
        secondaryButtonLink: "/sangam",
        secondaryButtonVisible: true,
        announcementMarquee: "🚩 सर्व मराठा बांधवांना डिजिटल जोडणारा महा-प्लॅटफॉर्म — आजच आपले अधिकृत डिजिटल ओळखपत्र मिळवा!"
      },
      buttons: {
        joinMember: { label: "डिजिटल सदस्य व्हा 🚩", link: "/register", color: "#E65100", visible: true },
        businessSangam: { label: "बिझनेस संगम (B2B)", link: "/sangam", color: "#1B5E20", visible: true },
        bloodSos: { label: "तातडीने रक्त हवे (SOS)", link: "/community/blood", color: "#C62828", visible: true },
        donate: { label: "देणगी द्या", link: "/donation", color: "#F57C00", visible: true },
        jobs: { label: "रोजगार शोधा", link: "/jobs", color: "#0277BD", visible: true },
        matrimony: { label: "मराठा वधू-वर", link: "/community/matrimony", color: "#AD1457", visible: true },
        emergencyHelpline: { label: "हेल्पलाइन डायल करा", link: "tel:18002091674", color: "#D84315", visible: true }
      },
      images: {
        heroBanner: "/assets/images/maratha-samrajya.jpg",
        brandLogo: "/assets/images/maratha_samrajya_logo.png",
        fortsBanner: "/assets/images/generated/forts_hero_banner.jpg",
        cultureHero: "/assets/images/generated/maratha_culture_hero.jpg",
        sangamHero: "/assets/images/generated/business_sangam_hero.jpg",
        donationHero: "/assets/images/generated/donation_campaigns_hero.jpg",
        emergencyBanner: "/assets/images/generated/emergency_blood_hero.jpg",
        dairyHero: "/assets/images/generated/maratha_dairy_hero.jpg",
        buildersHero: "/assets/images/generated/maratha_builders_hero.jpg",
        speakersHero: "/assets/images/generated/maratha_speakers_hero.jpg",
        manufacturersHero: "/assets/images/generated/maratha_manufacturers_hero.jpg"
      },
      texts: {
        tagline: "अखिल भारतीय मराठा समाजाचे अधिकृत डिजिटल व्यासपीठ",
        missionStatement: "मराठा समाजातील प्रत्येक घटकाचा सर्वांगीण आर्थिक, शैक्षणिक, सांस्कृतिक व सामाजिक विकास साधणे.",
        visionStatement: "जागतिक पातळीवर संघटित, स्वाभिमानी व आत्मनिर्भर मराठा समाज आणि उद्योजक पिढीची निर्मिती करणे.",
        emergencyNotice: "२४x७ मराठा समाज साहाय्य व आपत्कालीन रक्तदाता समन्वय कक्ष सदैव तत्पर.",
        footerAbout: "Connect Maratha हे जागतिक मराठा बांधवांना व्यापार, समाजकार्य, संस्कृती आणि रोजगार क्षेत्रात एकत्र आणणारे सर्वोच्च व्यासपीठ आहे."
      },
      links: {
        navigation: [
          { id: 'nav-home', label: 'मुखपृष्ठ', path: '/', visible: true },
          { id: 'nav-sangam', label: 'बिझनेस संगम', path: '/sangam', visible: true },
          { id: 'nav-directory', label: 'निर्देशिका', path: '/directory', visible: true },
          { id: 'nav-culture', label: 'संस्कृती', path: '/culture', visible: true },
          { id: 'nav-forts', label: 'दुर्ग व किल्ले', path: '/forts', visible: true },
          { id: 'nav-history', label: 'इतिहास', path: '/history', visible: true },
          { id: 'nav-donation', label: 'देणगी', path: '/donation', visible: true },
          { id: 'nav-safety', label: 'मदत कक्ष', path: '/community/safety', visible: true }
        ],
        social: {
          facebook: "https://facebook.com/connectmaratha",
          twitter: "https://twitter.com/connectmaratha",
          instagram: "https://instagram.com/connectmaratha",
          youtube: "https://youtube.com/connectmaratha",
          whatsapp: "+919822011223",
          telegram: "https://t.me/connectmaratha"
        },
        footerLinks: [
          { label: "डिजिटल ओळखपत्र", path: "/card" },
          { label: "व्यवसाय नोंदणी", path: "/business" },
          { label: "नोकरी व करिअर", path: "/jobs" },
          { label: "रक्तदान साहाय्य", path: "/community/blood" },
          { label: "मराठा वधू-वर", path: "/community/matrimony" },
          { label: "गोपनीयता धोरण", path: "/privacy" },
          { label: "नियम व अटी", path: "/terms" }
        ]
      },
      forms: {
        memberRegistration: {
          title: "महासंघ अधिकृत डिजिटल सदस्यता नोंदणी",
          enabled: true,
          instructions: "कृपया आधार/ओळखपत्रावरील नाव आणि अचूक तपशील प्रविष्ट करा.",
          welcomeNotice: "नोंदणीनंतर लगेच डिजिटल ओळखपत्र सक्रिय होईल."
        },
        bloodSosForm: {
          title: "तातडीने रक्त मागणी (SOS)",
          enabled: true,
          helpline: "1800-209-1674",
          urgentNotice: "तातडीच्या रक्त गरजेसाठी थेट रुग्णालय तपशील भरा. समन्वय कक्ष २४x७ कार्यरत आहे."
        },
        businessRegistration: {
          title: "मराठा व्यवसाय / फर्म नोंदणी",
          enabled: true,
          approvalRequired: true,
          discountNotice: "मराठा महासंघ सदस्यांसाठी विशेष व्यावसायिक सवलत."
        },
        contactSupport: {
          email: "support@connectmaratha.org",
          phone: "+91 98220 11223",
          emergencyHelpline: "1800-209-1674",
          address: "छत्रपती संभाजी महाराज भवन, एफसी रोड, शिवाजीनगर, पुणे, महाराष्ट्र - ४११००४"
        }
      },
      footer: {
        copyright: "© २०२६ Connect Maratha (कनेक्ट मराठा) • सर्व हक्क राखीव",
        poweredBy: "अखिल भारतीय मराठा महासंघ डिजिटल मिशन"
      }
    };
  }

  getSiteContent() {
    if (!this.data.siteContent || typeof this.data.siteContent !== 'object' || Object.keys(this.data.siteContent).length === 0) {
      this.data.siteContent = this.getDefaultSiteContent();
      this.save();
    }
    return this.data.siteContent;
  }

  updateSiteContent(updates) {
    const current = this.getSiteContent();
    this.data.siteContent = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    this.syncSiteContentToSqlite(this.data.siteContent);
    return this.data.siteContent;
  }

  async syncSiteContentToSqlite(content) {
    try {
      const dbModulePath = path.join(__dirname, '..', '..', 'database', 'database.js');
      if (fs.existsSync(dbModulePath)) {
        const { getDatabase, saveDatabase } = await import(fileURLToPath(new URL(`file://${dbModulePath}`)));
        const sqlite = await getDatabase();
        sqlite.run('CREATE TABLE IF NOT EXISTS site_content (key TEXT PRIMARY KEY, section TEXT NOT NULL, value_json TEXT NOT NULL, updated_at TEXT);');
        const now = new Date().toISOString();
        for (const [section, val] of Object.entries(content)) {
          if (section === 'updatedAt') continue;
          sqlite.run('INSERT OR REPLACE INTO site_content (key, section, value_json, updated_at) VALUES (?, ?, ?, ?);', [
            `section_${section}`,
            section,
            JSON.stringify(val),
            now
          ]);
        }
        saveDatabase();
      }
    } catch (e) {
      // Non-blocking SQLite background synchronization
    }
  }
}

export const db = new RealtimeDatabase();
export default db;
