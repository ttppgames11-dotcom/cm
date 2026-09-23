// Central Reactive Data Store for Connect Maratha System
// Handles initial data, dynamic CRUD, and localStorage persistence for all modules.

const STORAGE_KEYS = {
  DOCTORS: 'cm_doctors_data',
  BLOOD_REQUESTS: 'cm_blood_requests_data',
  DONORS: 'cm_donors_data',
  MATRIMONY: 'cm_matrimony_data',
  GRIEVANCES: 'cm_grievances_data',
  VOLUNTEERS: 'cm_volunteers_data',
  WOMEN_HELP: 'cm_women_help_data',
  WOMEN_MENTORS: 'cm_women_mentors_data',
  BUSINESSES: 'cm_businesses_data',
  JOBS: 'cm_jobs_data',
  EVENTS: 'cm_events_data',
  ORGANIZATIONS: 'cm_orgs_data',
  SPEAKER_BOOKINGS: 'cm_speaker_bookings_data',
  BUILDER_INQUIRIES: 'cm_builder_inquiries_data'
};

// Initial Seed Datasets
const INITIAL_DOCTORS = [
  {
    id: 'DOC-101',
    name: 'डॉ. अमित संभाजीराव पाटील',
    degree: 'M.B.B.S., M.S. (Orthopedics)',
    specialty: 'अस्थिरोग व सांधेप्रत्यारोपण तज्ज्ञ',
    experience: '१५ वर्षे अनुभव',
    hospital: 'सह्याद्री सुपरस्पेशालिटी हॉस्पिटल',
    city: 'पुणे (डेक्कन)',
    phone: '+91 98220 12345',
    consultationFee: '₹७००',
    availability: 'सोम ते शनि: स. १० ते सायं. ६',
    rating: '4.9 ★★★★★'
  },
  {
    id: 'DOC-102',
    name: 'डॉ. सौ. सानिका विक्रमराजे कदम',
    degree: 'M.B.B.S., M.D. (Gynecology)',
    specialty: 'स्त्रीरोग व प्रसूतीशास्त्र तज्ज्ञ',
    experience: '१२ वर्षे अनुभव',
    hospital: 'दीनानाथ मंगेशकर रुग्णालय',
    city: 'पुणे (एरंडवणे)',
    phone: '+91 98901 67890',
    consultationFee: '₹८००',
    availability: 'सोम ते शुक्र: स. ११ ते सायं. ५',
    rating: '4.8 ★★★★★'
  },
  {
    id: 'DOC-103',
    name: 'डॉ. प्रशांत जयसिंगराव गायकवाड',
    degree: 'M.B.B.S., M.D. (Cardiology), D.N.B.',
    specialty: 'हृदयरोग तज्ज्ञ (Cardiologist)',
    experience: '१८ वर्षे अनुभव',
    hospital: 'एशियन हार्ट इन्स्टिट्यूट',
    city: 'मुंबई (बीकेसी)',
    phone: '+91 98200 99887',
    consultationFee: '₹१,०००',
    availability: '२४×७ आणीबाणी / सोम ते शनि',
    rating: '5.0 ★★★★★'
  },
  {
    id: 'DOC-104',
    name: 'डॉ. राहुल प्रकाशराव शिंदे',
    degree: 'M.B.B.S., M.D. (Pediatrics)',
    specialty: 'बालरोग तज्ज्ञ (Pediatrician)',
    experience: '१० वर्षे अनुभव',
    hospital: 'अ‍ॅपल सरस्वती हॉस्पिटल',
    city: 'कोल्हापूर (कदमवाडी)',
    phone: '+91 94220 55443',
    consultationFee: '₹५००',
    availability: 'दररोज: स. ९ ते सायं. ७',
    rating: '4.7 ★★★★★'
  }
];

const INITIAL_BLOOD_REQUESTS = [
  {
    id: 'REQ-101',
    patient: 'प्रशांत संभाजी जाधव',
    hospital: 'ससून सर्वोपचार रुग्णालय, पुणे',
    bloodGroup: 'O-',
    units: 2,
    urgency: 'तात्काळ (Emergency)',
    time: '१० मिनिटांपूर्वी',
    contact: '+91 98221 11223'
  },
  {
    id: 'REQ-102',
    patient: 'सौ. सुमित्रा बाजीराव गायकवाड',
    hospital: 'के.ई.एम. रुग्णालय, परळ, मुंबई',
    bloodGroup: 'AB+',
    units: 3,
    urgency: 'पुढील ४ तासांत',
    time: '२५ मिनिटांपूर्वी',
    contact: '+91 99203 44556'
  },
  {
    id: 'REQ-103',
    patient: 'मास्टर आरव विक्रम मोरे',
    hospital: 'छत्रपती प्रमिलाराजे रुग्णालय (CPR), कोल्हापूर',
    bloodGroup: 'B+',
    units: 1,
    urgency: 'आज रात्रीपर्यंत',
    time: '१ तासापूर्वी',
    contact: '+91 94220 88991'
  }
];

const INITIAL_DONORS = [
  { name: 'रोहन प्रकाश देशमुख', group: 'O+', city: 'पुणे (कोथरूड)', lastDonated: '४ महिन्यांपूर्वी', totalDonations: 8, phone: '+91 98220 XXXXX' },
  { name: 'अजिंक्य तानाजी सावंत', group: 'O-', city: 'सातारा', lastDonated: '५ महिन्यांपूर्वी', totalDonations: 12, phone: '+91 94211 XXXXX' },
  { name: 'प्रतीक संभाजी पाटील', group: 'B+', city: 'कोल्हापूर', lastDonated: '६ महिन्यांपूर्वी', totalDonations: 6, phone: '+91 98900 XXXXX' },
  { name: 'योगेश विठ्ठल चव्हाण', group: 'A+', city: 'मुंबई (दादर)', lastDonated: '३ महिन्यांपूर्वी', totalDonations: 15, phone: '+91 98201 XXXXX' }
];

const INITIAL_MATRIMONY = [
  {
    id: 'CM-M-801',
    name: 'इंजि. रोहन संभाजीराव कदम',
    gender: 'वर (Groom)',
    age: 28,
    height: "5' 10\"",
    caste: '९६ कुळी मराठा',
    kul: 'कदम (भारद्वाज गोत्र)',
    education: 'B.Tech (Computer Science), COEP',
    profession: 'Senior Software Engineer, MNC Pune',
    income: '₹२२ लाख वार्षिक',
    city: 'पुणे (मूळ: कराड, सातारा)',
    verified: true,
    photo: '👨‍💼',
    expectations: 'सुशिक्षित, पदवीधर, कौटुंबिक मूल्यांची जाण असणारी अनुरूप वधू.'
  },
  {
    id: 'CM-F-802',
    name: 'डॉ. स्नेहल विक्रमराव पाटील',
    gender: 'वधू (Bride)',
    age: 26,
    height: "5' 5\"",
    caste: '९६ कुळी मराठा',
    kul: 'पाटील (वसिष्ठ गोत्र)',
    education: 'M.B.B.S., D.G.O. (Gynecologist)',
    profession: 'वैद्यकीय अधिकारी, शासकीय रुग्णालय',
    income: '₹१५ लाख वार्षिक',
    city: 'कोल्हापूर',
    verified: true,
    photo: '👩‍⚕️',
    expectations: 'डॉक्टर किंवा उच्चशिक्षित मराठा वर, व्यसनमुक्त, सुसंस्कृत.'
  },
  {
    id: 'CM-M-803',
    name: 'अभिषेक जयसिंगराव मोरे',
    gender: 'वर (Groom)',
    age: 30,
    height: "5' 11\"",
    caste: '९६ कुळी मराठा',
    kul: 'मोरे (गौतम गोत्र)',
    education: 'M.B.A. (Finance) & B.E.',
    profession: 'उद्योजक (ऑटोमोबाईल स्पेअर पार्ट्स फॅक्टरी)',
    income: '₹४५ लाख वार्षिक',
    city: 'नाशिक (मूळ: धुळे)',
    verified: true,
    photo: '🏢',
    expectations: 'पदवीधर, व्यवसाय समजून घेणारी, सुसंस्कृत वधू.'
  }
];

class ConnectMarathaStore {
  getItem(key, initialValue) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (e) {
      return initialValue;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  // Doctors
  getDoctors() {
    return this.getItem(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS);
  }
  addDoctor(doctor) {
    const list = this.getDoctors();
    const newDoc = { id: `DOC-${Date.now().toString().slice(-4)}`, rating: '5.0 ★ New', ...doctor };
    const updated = [newDoc, ...list];
    this.setItem(STORAGE_KEYS.DOCTORS, updated);
    return updated;
  }

  // Blood Requests
  getBloodRequests() {
    return this.getItem(STORAGE_KEYS.BLOOD_REQUESTS, INITIAL_BLOOD_REQUESTS);
  }
  addBloodRequest(req) {
    const list = this.getBloodRequests();
    const newReq = { id: `REQ-${Date.now().toString().slice(-3)}`, time: 'आत्ताच', ...req };
    const updated = [newReq, ...list];
    this.setItem(STORAGE_KEYS.BLOOD_REQUESTS, updated);
    return updated;
  }

  // Donors
  getDonors() {
    return this.getItem(STORAGE_KEYS.DONORS, INITIAL_DONORS);
  }
  addDonor(donor) {
    const list = this.getDonors();
    const newDonor = { totalDonations: 1, lastDonated: 'नवीन नोंदणी', ...donor };
    const updated = [newDonor, ...list];
    this.setItem(STORAGE_KEYS.DONORS, updated);
    return updated;
  }

  // Matrimony
  getMatrimonyProfiles() {
    return this.getItem(STORAGE_KEYS.MATRIMONY, INITIAL_MATRIMONY);
  }
  addMatrimonyProfile(profile) {
    const list = this.getMatrimonyProfiles();
    const newProfile = {
      id: `CM-${profile.gender.includes('वर') ? 'M' : 'F'}-${Date.now().toString().slice(-3)}`,
      verified: true,
      photo: profile.gender.includes('वर') ? '👨‍💼' : '👩‍💼',
      caste: '९६ कुळी मराठा',
      ...profile
    };
    const updated = [newProfile, ...list];
    this.setItem(STORAGE_KEYS.MATRIMONY, updated);
    return updated;
  }

  // Grievances / Representations
  getGrievances() {
    return this.getItem(STORAGE_KEYS.GRIEVANCES, []);
  }
  addGrievance(grievance) {
    const list = this.getGrievances();
    const item = { id: `GRV-${Date.now().toString().slice(-4)}`, createdAt: new Date().toLocaleDateString('mr-IN'), ...grievance };
    const updated = [item, ...list];
    this.setItem(STORAGE_KEYS.GRIEVANCES, updated);
    return updated;
  }

  // Social Volunteers
  getVolunteers() {
    return this.getItem(STORAGE_KEYS.VOLUNTEERS, []);
  }
  addVolunteer(volunteer) {
    const list = this.getVolunteers();
    const item = { id: `VOL-${Date.now().toString().slice(-4)}`, createdAt: new Date().toLocaleDateString('mr-IN'), ...volunteer };
    const updated = [item, ...list];
    this.setItem(STORAGE_KEYS.VOLUNTEERS, updated);
    return updated;
  }

  // Women Helpline Requests
  getWomenHelpRequests() {
    return this.getItem(STORAGE_KEYS.WOMEN_HELP, []);
  }
  addWomenHelpRequest(req) {
    const list = this.getWomenHelpRequests();
    const item = { id: `WHELP-${Date.now().toString().slice(-4)}`, createdAt: new Date().toLocaleDateString('mr-IN'), ...req };
    const updated = [item, ...list];
    this.setItem(STORAGE_KEYS.WOMEN_HELP, updated);
    return updated;
  }
}

export const dataStore = new ConnectMarathaStore();
export default dataStore;
