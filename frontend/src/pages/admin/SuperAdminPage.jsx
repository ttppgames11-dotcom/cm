// src/pages/admin/SuperAdminPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

/* ============================================================
   SUPER ADMIN COMMAND CENTER - WHITE & SAFFRON ORANGE THEME
   ============================================================ */
const S = {
  bg: '#FFFDF9',          // Warm light background
  cardBg: '#FFFFFF',      // Crisp white card panel
  cardSoft: '#FFF7ED',    // Soft orange tint fill
  border: '#FED7AA',      // Soft orange border
  saffron: '#EA580C',     // Primary Saffron Orange
  orange: '#F97316',      // Bright Orange accent
  amber: '#D97706',       // Warm Amber
  deep: '#431407',        // Deep Maratha Ink
  text: '#1E293B',        // High contrast slate text
  muted: '#64748B',       // Muted text
  green: '#16A34A',       // Success Green
  blue: '#2563EB',        // Info Blue
  purple: '#9333EA',      // Purple accent
  red: '#DC2626',         // Danger Red
  gradient: 'linear-gradient(135deg, #EA580C, #F97316)',
  gradientSoft: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)'
};

/* ============================================================
   REUSABLE UI COMPONENTS
   ============================================================ */
const Card = ({ children, style, className = '' }) => (
  <div className={className} style={{
    background: S.cardBg, border: `1px solid ${S.border}`,
    borderRadius: 12, padding: 18, boxShadow: '0 4px 15px rgba(234,88,12,0.06)',
    color: S.text, ...style
  }}>{children}</div>
);

const Badge = ({ children, tone = 'saffron' }) => {
  const tones = {
    saffron: { bg: '#FFEDD5', fg: S.deep, bd: S.border },
    green: { bg: '#DCFCE7', fg: '#166534', bd: '#86EFAC' },
    red: { bg: '#FEE2E2', fg: '#991B1B', bd: '#FCA5A5' },
    blue: { bg: '#DBEAFE', fg: '#1E40AF', bd: '#93C5FD' },
    purple: { bg: '#F3E8FF', fg: '#6B21A8', bd: '#D8B4FE' },
    amber: { bg: '#FEF3C7', fg: '#92400E', bd: '#FDE68A' }
  };
  const t = tones[tone] || tones.saffron;
  return (
    <span style={{
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      padding: '3px 10px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 800,
      display: 'inline-flex', alignItems: 'center', gap: 4
    }}>{children}</span>
  );
};

const Btn = ({ children, variant = 'primary', onClick, style, ...rest }) => {
  const vMap = {
    primary: { background: S.gradient, color: '#FFFFFF', border: 'none' },
    ghost: { background: S.cardSoft, color: S.saffron, border: `1px solid ${S.saffron}` },
    plain: { background: S.cardBg, color: S.deep, border: `1px solid ${S.border}` },
    danger: { background: '#FEE2E2', color: S.red, border: '1px solid #FCA5A5' },
    success: { background: '#DCFCE7', color: S.green, border: '1px solid #86EFAC' }
  };
  return (
    <button onClick={onClick} {...rest} style={{
      padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem',
      fontWeight: 800, cursor: 'pointer', display: 'inline-flex',
      alignItems: 'center', gap: 6, transition: 'all 0.15s ease',
      boxShadow: variant === 'primary' ? '0 4px 12px rgba(234,88,12,0.2)' : 'none',
      ...vMap[variant], ...style
    }}>{children}</button>
  );
};

const Modal = ({ title, children, onClose, width = 640 }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(67, 20, 7, 0.4)',
    backdropFilter: 'blur(4px)', zIndex: 9999,
    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20
  }}>
    <div style={{
      background: S.cardBg, border: `2px solid ${S.saffron}`,
      borderRadius: 16, padding: 24, width: '100%', maxWidth: width,
      maxHeight: '90vh', overflowY: 'auto', color: S.text,
      boxShadow: '0 20px 50px rgba(234,88,12,0.25)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: `1px solid ${S.border}`, paddingBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: S.deep }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: S.saffron, fontSize: '1.2rem', cursor: 'pointer', fontWeight: 900 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

/* ============================================================
   SUPER ADMIN MAIN COMPONENT
   ============================================================ */
export default function SuperAdminPage() {
  const { user } = useAuth();
  
  // Navigation & Responsiveness State
  const [activeTab, setActiveTab] = useState('command');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inlineNotice, setInlineNotice] = useState(null);

  // Global Geographic & From-To Date Filters
  const [filters, setFilters] = useState({
    state: 'Maharashtra',
    division: 'All',
    district: 'All',
    city: 'All',
    fromDate: '2026-09-01',
    toDate: '2026-09-30'
  });
  const [globalSearch, setGlobalSearch] = useState('');

  // Active Modals & Selection States
  const [activeModal, setActiveModal] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const triggerInlineNotice = (msg) => {
    setInlineNotice({ msg, time: new Date().toLocaleTimeString() });
  };

  /* ============================================================
     REAL-TIME RICH DATASETS FOR ALL 17 SUPER ADMIN MODULES
     ============================================================ */
  const [users, setUsers] = useState([
    { id: 'CM-USR-K9X1A2-8412', photo: '👤', name: 'अमोल तुकाराम जाधव', mobile: '+91 98220 11924', email: 'amol.jadhav@connectmaratha.org', role: 'District Coordinator', permissions: '✅ District User CRUD + KYC Review', geography: 'पुणे (हवेली)', status: 'Active', lastLogin: '१० मिनिटांपूर्वी', kyc: 'Verified', date: '2026-09-10', isCreatedByAdmin: true },
    { id: 'CM-USR-L8B3C4-9105', photo: '👩', name: 'प्रियंका सुरेश शिर्के', mobile: '+91 98221 44589', email: 'priyanka.shirke@connectmaratha.org', role: 'State Secretary', permissions: '👁️ Strategic Read + Regional Approval', geography: 'सातारा (कराड)', status: 'Active', lastLogin: '१ तासापूर्वी', kyc: 'Verified', date: '2026-09-12', isCreatedByAdmin: true },
    { id: 'CM-MH-7712398451', photo: '👨', name: 'निलेश भगवान देशमुख', mobile: '+91 98901 23456', email: 'nilesh.deshmukh@connectmaratha.org', role: 'Taluka Lead', permissions: '✅ Taluka Scope Access', geography: 'नाशिक (मालेगाव)', status: 'Pending', lastLogin: '३ दिवसांपूर्वी', kyc: 'Pending', date: '2026-09-15', isCreatedByAdmin: false },
    { id: 'CM-MH-1102938475', photo: '👤', name: 'विक्रम संभाजी शेलार', mobile: '+91 97654 32109', email: 'vikram.shelar@connectmaratha.org', role: 'Chapter Head', permissions: '👁️ Chapter Members View', geography: 'कोल्हापूर (कागल)', status: 'Active', lastLogin: '५ मिनिटांपूर्वी', kyc: 'Verified', date: '2026-09-18', isCreatedByAdmin: false }
  ]);

  const [roles, setRoles] = useState([
    { id: 'ROL-01', code: 'SUPER_ADMIN', name: 'सर्वोच्च प्रशासक (Super Admin)', dept: 'Executive Governance', gate1Req: 'Not Applicable', rank: 1, permissions: 'Full System Control (CRUD + Settings + Audit)', system: 'Yes' },
    { id: 'ROL-02', code: 'CEO_MACRO', name: 'कार्याध्यक्ष / राज्य अध्यक्ष (CEO)', dept: 'State Leadership', gate1Req: '५० थेट रेफरल्स', rank: 2, permissions: 'Executive Visibility + Strategic Edits', system: 'Yes' },
    { id: 'ROL-03', code: 'DISTRICT_COORD', name: 'जिल्हा समन्वयक (District Admin)', dept: 'District Operations', gate1Req: '२५ थेट रेफरल्स', rank: 3, permissions: 'District User CRUD + KYC Review', system: 'No' }
  ]);

  const [permissionsMatrix, setPermissionsMatrix] = useState([
    { id: 'PERM-01', role: 'Super Admin', roleCode: 'SUPER_ADMIN', userCrud: '✅ Full System Control', bizCrud: '✅ Full Access', b2bApprove: '✅ Full Approve', sevaForceClose: '✅ Full Force Close', exportReport: '✅ Unlimited Export', geoScope: 'Statewide', approvalRequired: 'No' },
    { id: 'PERM-02', role: 'CEO (कार्याध्यक्ष)', roleCode: 'CEO_MACRO', userCrud: '👁️ Strategic Read', bizCrud: '✅ Full Access', b2bApprove: '✅ Executive Approve', sevaForceClose: '👁️ High Priority Review', exportReport: '✅ Executive Export', geoScope: 'Statewide', approvalRequired: 'Yes' },
    { id: 'PERM-03', role: 'District Coordinator', roleCode: 'DISTRICT_COORD', userCrud: '✅ District Scope', bizCrud: '✅ District Scope', b2bApprove: '✅ Regional Review', sevaForceClose: '✅ District Case Close', exportReport: '✅ District Export', geoScope: 'District Only', approvalRequired: 'Yes' },
    { id: 'PERM-04', role: 'Taluka Coordinator', roleCode: 'TALUKA_LEAD', userCrud: '✅ Taluka Scope', bizCrud: '👁️ Taluka Read', b2bApprove: '❌ No Access', sevaForceClose: '✅ Emergency Alert Only', exportReport: '✅ Limited CSV', geoScope: 'Taluka Only', approvalRequired: 'Yes' }
  ]);

  const [hierarchy, setHierarchy] = useState([
    { id: 'NODE-MH', level: 'State', name: 'महाराष्ट्र राज्य (Maharashtra State)', code: 'MH', parent: 'India', status: 'Active', population: '12.5 Cr', chapters: 184 },
    { id: 'NODE-PUNE-DIV', level: 'Division', name: 'पुणे विभाग (Pune Division)', code: 'PUNE-DIV', parent: 'Maharashtra State', status: 'Active', population: '2.4 Cr', chapters: 42 },
    { id: 'NODE-PUNE-DIST', level: 'District', name: 'पुणे जिल्हा (Pune District)', code: 'PUNE-DIST', parent: 'Pune Division', status: 'Active', population: '94 Lakhs', chapters: 18 }
  ]);

  const [appointments, setAppointments] = useState([
    { id: 'APT-101', candidate: 'अ‍ॅड. विक्रम तावडे', role: 'जिल्हा उपाध्यक्ष (पुणे)', geography: 'पुणे शहर', recommendedBy: 'मा. खा. खासदार पवार साहब', referrals: '३२ / २५', status: 'Active', tenure: '01 Oct 2024 - 30 Sep 2026' },
    { id: 'APT-102', candidate: 'डॉ. स्नेहल देशमुख', role: 'महिला आघाडी राज्य प्रमुख', geography: 'नाशिक उत्तर', recommendedBy: 'प्रियंका शिर्के', referrals: '२८ / २५', status: 'Approved', tenure: '15 Oct 2026 - 14 Oct 2028' },
    { id: 'APT-103', candidate: 'इंजि. राहुल कदम', role: 'युवा आघाडी अध्यक्ष (सातारा)', geography: 'सातारा जिल्हा', recommendedBy: 'अमोल जाधव', referrals: '१९ / २५', status: 'Under Review', tenure: 'Pending Final Approvals' },
    { id: 'APT-104', candidate: 'मा. राजेश सावंत', role: 'राज्य मुख्य संघटक', geography: 'कोल्हापूर', recommendedBy: 'नागपूर कोर कमिटी', referrals: '५४ / ५०', status: 'Pending Nominations', tenure: 'Upcoming 2026' }
  ]);

  const [geographyMaster, setGeographyMaster] = useState([
    { id: 'GEO-01', level: 'District', name: 'पुणे जिल्हा (Pune District)', code: 'MH-PUN', parent: 'Pune Division', population: '94.3 Lakhs', pincodes: '411001-411060', chapters: 42, status: 'Active' },
    { id: 'GEO-02', level: 'Taluka', name: 'कराड तालुका (Karad Taluka)', code: 'MH-SAT-KRD', parent: 'Satara District', population: '6.2 Lakhs', pincodes: '415110', chapters: 12, status: 'Active' },
    { id: 'GEO-03', level: 'Division', name: 'नाशिक विभाग (Nashik Div)', code: 'MH-NSK-DIV', parent: 'Maharashtra State', population: '1.85 Cr', pincodes: '422001-422100', chapters: 28, status: 'Active' },
    { id: 'GEO-04', level: 'City/Ward', name: 'कोल्हापूर महानगर (Kolhapur City)', code: 'MH-KOP-CT', parent: 'Kolhapur District', population: '6.8 Lakhs', pincodes: '416001-416012', chapters: 15, status: 'Active' }
  ]);

  const [b2bDeals, setB2bDeals] = useState([
    { id: 'B2B-901', title: 'पुणे एमआयडीसी सोलर प्रोजेक्ट सप्लाय', source: 'Member Referral', stage: 'Negotiation', valueCr: 4.5, probability: '85%', assignedTo: 'अमित कदम', date: '2026-09-20' },
    { id: 'B2B-902', title: 'नागपूर टेक्स्टाईल पार्क व्हेन्डर करार', source: 'Sangam Meet', stage: 'Opportunity', valueCr: 2.8, probability: '60%', assignedTo: 'संजय काळे', date: '2026-09-22' }
  ]);

  const [sevaCases, setSevaCases] = useState([
    { id: 'SEVA-441', beneficiary: 'गणेश तुकाराम शिंदे', category: 'Emergency Blood (A+ve)', priority: 'Emergency', status: 'Open', district: 'पुणे', age: '3 Hrs', sla: '1 Hr Remaining', date: '2026-09-28' },
    { id: 'SEVA-442', beneficiary: 'सुनीता बाळकृष्ण कदम', category: 'Hospital Bill Support', priority: 'High', status: 'Resolved', district: 'सोलापूर', age: '18 Hrs', sla: 'Within SLA', date: '2026-09-25' }
  ]);

  const [tickets, setTickets] = useState([
    { id: 'TCK-201', subject: 'व्यावसायिक श्रेणी अद्ययावत होत नाही (B2B Listing)', category: 'Technical', priority: 'High', status: 'Open', user: 'अमोल जाधव', assignedTo: 'IT Desk #2', sla: '4 Hrs (SLA: 24 Hrs)', date: '2026-09-26' },
    { id: 'TCK-202', subject: 'KYC दस्तऐवज आधार पडताळणी रिजेक्शन तक्रार', category: 'KYC', priority: 'Normal', status: 'In Progress', user: 'निलेश देशमुख', assignedTo: 'KYC Team A', sla: '12 Hrs (SLA: 48 Hrs)', date: '2026-09-24' },
    { id: 'TCK-203', subject: 'B2B रेफरल कमिशन/पॉइंट्स क्रेडिट झाले नाहीत', category: 'B2B Dispute', priority: 'Critical', status: 'Escalated', user: 'सचिन गायकवाड', assignedTo: 'Finance Admin', sla: '2 Hrs (SLA Breach Risk)', date: '2026-09-27' },
    { id: 'TCK-204', subject: 'चॅप्टर मीटिंग उपस्थिती हजेरी चुकीची नोंदवली गेली', category: 'Operations', priority: 'Low', status: 'Resolved', user: 'प्रियंका शिर्के', assignedTo: 'District Support', sla: 'Resolved', date: '2026-09-20' }
  ]);

  const [events, setEvents] = useState([
    { id: 'EV-101', title: 'जागतिक मराठी उद्योजक परिषद २०२६ (Global Business Expo)', type: 'Statewide Expo', date: '2026-10-15', venue: 'बालेवाडी क्रीडा संकुल, पुणे', expected: 5000, confirmed: 3420, status: 'Upcoming' },
    { id: 'EV-102', title: 'महाराष्ट्रातील प्रमुख गडकोट संवर्धन मोहीम', type: 'Seva Event', date: '2026-10-28', venue: 'किल्ले रायगड परिसर', expected: 1500, confirmed: 1180, status: 'Upcoming' },
    { id: 'EV-103', title: 'मोफत भव्य महा-रक्तदान व आरोग्य तपासणी शिबीर', type: 'Seva Camp', date: '2026-10-05', venue: 'नाशिक जिल्हा रुग्णालय', expected: 2000, confirmed: 1850, status: 'Upcoming' },
    { id: 'EV-104', title: 'मराठा युवा बी२बी नेटवर्किंग संगम २०२६', type: 'Business Conclave', date: '2026-09-20', venue: 'हॉटेल सायाजी, कोल्हापूर', expected: 800, confirmed: 795, status: 'Completed' }
  ]);

  const [articles, setArticles] = useState([
    { id: 'ART-01', title: 'मराठा साम्राज्य इतिहास व प्रशासकीय अष्टप्रधान व्यवस्था', author: 'प्रणाली देसाई', category: 'History', status: 'Published', views: '14,250', date: '2026-09-05', modStatus: 'Verified' },
    { id: 'ART-02', title: 'शिवछत्रपतींचे दुर्ग संवर्धन व जलप्रबंधन सिद्धांत', author: 'अमोल जाधव', category: 'Forts', status: 'Published', views: '9,820', date: '2026-09-12', modStatus: 'Verified' },
    { id: 'ART-03', title: '२०२६ मधील ग्रामीण मराठा महिला उद्योजकता यशोगाथा', author: 'प्रियंका शिर्के', category: 'Business', status: 'Fact-Check Pending', views: '0', date: '2026-09-28', modStatus: 'Review Required' },
    { id: 'ART-04', title: 'ऐतिहासिक तुळजापूर तुळजाभवानी मंदिर स्थापत्यकला', author: 'डॉ. महेश भोसले', category: 'Temples', status: 'Published', views: '18,400', date: '2026-08-20', modStatus: 'Verified' }
  ]);

  const [financeRecords, setFinanceRecords] = useState([
    { id: 'TXN-8801', desc: 'जागतिक परिषद २०२६ टायटल स्पॉन्सरशिप रक्कम्', category: 'Event Sponsorship', type: 'Income', amount: '₹ 25,00,000', gateway: 'HDFC Bank Ltd (A/c 9912)', date: '2026-09-28', status: 'Approved' },
    { id: 'TXN-8802', desc: 'सेवा हेल्पडेस्क रुग्णवाहिका आपत्कालीन अनुदान वितरण', category: 'Seva Fund', type: 'Expense', amount: '₹ 4,50,000', gateway: 'ICICI Bank (Seva A/c)', date: '2026-09-27', status: 'Approved' },
    { id: 'TXN-8803', desc: 'वार्षिक डिजिटल सर्व्हर व क्लाउड इन्फ्रास्ट्रक्चर बिल', category: 'Operations', type: 'Expense', amount: '₹ 1,85,000', gateway: 'Razorpay Gateway', date: '2026-09-25', status: 'Approved' },
    { id: 'TXN-8804', desc: 'जिल्हास्तरीय बी२बी प्रीमियम सभासदत्व फी संकलन', category: 'Membership Fees', type: 'Income', amount: '₹ 12,40,000', gateway: 'UPI Gateway Central', date: '2026-09-29', status: 'Pending Audit' }
  ]);

  const [workflows, setWorkflows] = useState([
    { id: 'WFL-01', title: 'उच्च मूल्य B2B करार मंजुरी प्रक्रिया (B2B Deals > ₹ 1 Cr)', trigger: 'High-Value B2B', approvers: 'District Coord → CEO → Super Admin', conditions: 'Deal Value ≥ 1.0 Crore', status: 'Active', avgTime: '4.2 Hours' },
    { id: 'WFL-02', title: 'जिल्हास्तरीय पदाधिकारी नियुक्ती साखळी (Leadership Approval)', trigger: 'Role Appointment', approvers: 'Gate-1 Verified → State Sec → CEO', conditions: 'Referrals ≥ Gate-1 Requirement', status: 'Active', avgTime: '18 Hours' },
    { id: 'WFL-03', title: 'आपत्कालीन वैद्यकीय अर्थसहाय्य (Seva Emergency Fund > 50k)', trigger: 'Seva Expense', approvers: 'Seva Desk Lead → Super Admin Finance', conditions: 'Medical SLA < 2 Hours', status: 'Active', avgTime: '45 Mins' },
    { id: 'WFL-04', title: 'ऐतिहासिक व शैक्षणिक मजकूर पडताळणी workflow', trigger: 'Content Publish', approvers: 'Editorial Board → History Expert → Mod', conditions: 'Fact-Check Required = True', status: 'Active', avgTime: '1.5 Days' }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 'AUD-901', who: 'Super Admin Central', action: 'ROLE_ASSIGN', target: 'User #CM-MH-9876543210 (Promoted to District Coordinator)', diff: 'Member → District Coordinator', ip: '103.21.124.5', timestamp: '30 Sep 2026 15:32', severity: 'High' },
    { id: 'AUD-902', who: 'Super Admin Central', action: 'APPROVE_KYC', target: 'User #CM-MH-4458129012 (Documents Verified)', diff: 'KYC Pending → Verified', ip: '103.21.124.5', timestamp: '30 Sep 2026 15:28', severity: 'Medium' },
    { id: 'AUD-903', who: 'CEO Macro Gateway', action: 'FINANCE_APPROVE', target: 'TXN-8801 (Sponsorship ₹ 2,50,00,000)', diff: 'Pending → Approved', ip: '49.36.12.98', timestamp: '30 Sep 2026 14:15', severity: 'Critical' },
    { id: 'AUD-904', who: 'System Auto Guard', action: 'SECURITY_LOCKOUT', target: 'IP 185.220.101.4 (Automated Script Attack)', diff: '5 Failed Passwords → Blacklisted', ip: '185.220.101.4', timestamp: '30 Sep 2026 11:05', severity: 'High' }
  ]);

  const [systemSettings, setSystemSettings] = useState([
    { id: 'SET-01', key: 'SYS_APP_NAME', category: 'General', title: 'प्रणालीचे नाव (Platform Title)', value: 'Connect Maratha — Global Portal', updated: '2026-09-01' },
    { id: 'SET-02', key: 'GATE1_MIN_REF', category: 'Gate-1 Referrals', title: 'पदाधिकारी होण्यासाठी किमान गेट-१ रेफरल्स', value: '25 Direct Referrals', updated: '2026-09-15' },
    { id: 'SET-03', key: 'BACKUP_SCHEDULE', category: 'Backup', title: 'स्वयंचलित डेटाबेस बॅकअप वारंवारता', value: 'Daily 03:00 AM IST (AWS S3 + GCS)', updated: '2026-09-20' },
    { id: 'SET-04', key: 'NOTIF_WHATSAPP_GW', category: 'Notification', title: 'व्हॉट्सॲप मेसेजिंग गेटवे स्टेटस', value: 'Active (GupShup API Enterprise)', updated: '2026-09-25' },
    { id: 'SET-05', key: 'MAINTENANCE_MODE', category: 'Security', title: 'सिस्टीम मेंटेनन्स मोड', value: 'Disabled (Normal Operations)', updated: '2026-09-29' }
  ]);

  const [securityLogs, setSecurityLogs] = useState([
    { id: 'SEC-101', metric: '2FA दुहेरी पडताळणी सक्ती Enforcement', status: 'Secure', ip: 'System-Wide', actionTaken: '100% Admin Accounts Enforced', timestamp: '30 Sep 2026', risk: 'Low Risk' },
    { id: 'SEC-102', metric: 'अनधिकृत लॉगइन प्रयत्न (Failed Login Burst)', status: 'Blocked', ip: '185.220.101.4 (Tor Exit Node)', actionTaken: 'IP Blacklisted for 30 Days', timestamp: '30 Sep 2026 11:05', risk: 'High Risk' },
    { id: 'SEC-103', metric: 'GDPR / डेटा गोपनीयता संमती ऑडिट', status: 'Compliant', ip: 'All Active Users', actionTaken: 'Data Encryption at Rest (AES-256)', timestamp: '30 Sep 2026', risk: 'Low Risk' },
    { id: 'SEC-104', metric: 'प्रशासकीय सेशन कालावधी (Session Timeout)', status: 'Configured', ip: 'Internal Policy', actionTaken: 'Auto Logout after 30 Mins Idle', timestamp: '30 Sep 2026', risk: 'Low Risk' }
  ]);

  const [reportsCenter, setReportsCenter] = useState([
    { id: 'RPT-2026-09', title: 'महाराष्ट्र राज्य सर्वसमावेशक मासिक एमआयएस अहवाल (Comprehensive Monthly MIS)', category: 'Executive MIS', date: '30 Sep 2026', size: '4.8 MB (PDF)' },
    { id: 'RPT-B2B-Q3', title: 'तृतीय तिमाही B2B व्यवसाय व गुंतवणूक अहवाल (Q3 B2B Deal Conversion)', category: 'B2B Pipeline', date: '28 Sep 2026', size: '2.1 MB (XLSX)' },
    { id: 'RPT-SLA-SEP', title: '२४×७ सेवा व मदत केंद्र SLA पालन अहवाल (Seva SLA Compliance)', category: 'SLA Compliance', date: '25 Sep 2026', size: '1.4 MB (PDF)' },
    { id: 'RPT-GEO-PUNE', title: 'पुणे विभाग सदस्यत्व नोंदणी व चॅप्टर कामगिरी अहवाल', category: 'Geography Performance', date: '22 Sep 2026', size: '3.2 MB (XLSX)' }
  ]);

  const [unregisteredUsers, setUnregisteredUsers] = useState([
    { id: 'UNREG-801', mobile: '+91 98330 44112', email: 'sachin.kadam@temp.org', name: 'सचिन मारुती कदम', stage: 'KYC Document Pending', dropOff: 'Aadhaar Upload Step', geography: 'पुणे (हवेली)', date: '2026-09-29' },
    { id: 'UNREG-802', mobile: '+91 97112 88901', email: 'pooja.more@gmail.com', name: 'पूजा विजय मोरे', stage: 'Mobile OTP Verified Only', dropOff: 'Personal Details Step', geography: 'सातारा', date: '2026-09-30' },
    { id: 'UNREG-803', mobile: '+91 99221 55670', email: 'rahul.patil@yahoo.com', name: 'राहुल अशोक पाटील', stage: 'Referral Code Pending', dropOff: 'Gate-1 Referral Step', geography: 'कोल्हापूर', date: '2026-09-28' }
  ]);

  const [registeredBusinesses, setRegisteredBusinesses] = useState([
    { id: 'BIZ-101', name: 'सह्याद्री इन्फ्रास्ट्रक्चर व कन्स्ट्रक्शन', owner: 'मा. तुकाराम जाधव', category: 'Civil Construction', turnover: '₹ 15 - 25 Cr', gst: '27AAAAA0000A1Z5', district: 'पुणे', tier: 'Gold Enterprise', status: 'Verified', date: '2026-08-15' },
    { id: 'BIZ-102', name: 'शिवशक्ती ॲग्रो फूड प्रॉडक्ट्स', owner: 'प्रियंका शिर्के', category: 'Agro Processing', turnover: '₹ 2 - 5 Cr', gst: '27BBBBB1111B2Z6', district: 'सातारा', tier: 'Silver Business', status: 'Verified', date: '2026-09-01' },
    { id: 'BIZ-103', name: 'महा-टेक सोलर सिस्टीम्स लि.', owner: 'विक्रम शेलार', category: 'Renewable Energy', turnover: '₹ 50+ Cr', gst: '27CCCCC2222C3Z7', district: 'कोल्हापूर', tier: 'Platinum Enterprise', status: 'Verified', date: '2026-07-20' }
  ]);

  const [registeredServices, setRegisteredServices] = useState([
    { id: 'SRV-01', serviceName: '२४×७ आपत्कालीन मोफत रक्तदाते नेटवर्क', category: 'Healthcare / Blood Bank', district: 'सर्व ३६ जिल्हा', lead: 'अमोल जाधव', activeCount: '4,250 Donors', status: 'Active (24×7 Available)', sla: '30 Mins Response' },
    { id: 'SRV-02', serviceName: 'रुग्णवाहिका व आपत्कालीन वैद्यकीय मदत कक्ष', category: 'Ambulance & Hospital Aid', district: 'पुणे व सातारा', lead: 'डॉ. स्नेहल देशमुख', activeCount: '85 Ambulances', status: 'Active', sla: '15 Mins Response' },
    { id: 'SRV-03', serviceName: 'कायदेशीर सल्ला व संरक्षण सेल (Legal Helpline)', category: 'Legal Assistance', district: 'महाराष्ट्र राज्य', lead: 'अ‍ॅड. विक्रम तावडे', activeCount: '120 Lawyers', status: 'Active', sla: '24 Hours SLA' },
    { id: 'SRV-04', serviceName: 'मराठा विद्यार्थी उच्च शिक्षण शिष्यवृत्ती कक्ष', category: 'Educational Aid', district: 'नाशिक व औरंगाबाद', lead: 'निलेश देशमुख', activeCount: '1,500 Beneficiaries', status: 'Active', sla: '48 Hours SLA' }
  ]);

  const [activityStream, setActivityStream] = useState([
    { id: 'ACT-9901', time: '16:45:12', actor: 'Super Admin Central', type: 'USER_CREATED', details: 'नवीन युझर #CM-USR-L9X1A2 तयार केला (पदभार: District Coordinator)', module: 'User Management', ip: '103.21.124.5' },
    { id: 'ACT-9902', time: '16:30:05', actor: 'अमोल जाधव', type: 'SEVA_CASE_RAISED', details: 'नवीन रक्त पुरवठा केस #SEVA-441 उघडली (रक्त गट: A+ve, पुणे)', module: 'Seva Helpdesk', ip: '49.36.12.98' },
    { id: 'ACT-9903', time: '16:15:40', actor: 'संजय काळे', type: 'B2B_DEAL_UPDATED', details: 'B2B करार #B2B-901 टप्पा बदलला (Negotiation → ₹ 4.5 Cr)', module: 'B2B CRM', ip: '157.33.10.42' },
    { id: 'ACT-9904', time: '15:50:22', actor: 'System Gatekeeper', type: 'KYC_VERIFIED', details: 'सदस्य #CM-MH-4458129012 चे आधार पडताळणी पूर्ण झाले', module: 'KYC System', ip: 'Automated' }
  ]);

  /* ============================================================
     CRUD SAVE & DELETE HANDLERS
     ============================================================ */
  const handleSaveModalRecord = (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    if (activeModal === 'user') {
      if (editingItem) {
        setUsers(users.map(u => u.id === editingItem.id ? { ...u, ...formData } : u));
        triggerInlineNotice(`सदस्य "${formData.name || editingItem.name}" माहिती अद्ययावत केली गेली.`);
      } else {
        const uniqueId = `CM-USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const item = {
          id: uniqueId,
          photo: '👤',
          name: formData.name || 'नवीन सदस्य',
          mobile: formData.mobile || '+91 98000 00000',
          email: formData.email || 'user@connectmaratha.org',
          role: formData.role || 'District Coordinator',
          permissions: formData.permissions || '✅ District User CRUD + KYC Review',
          geography: formData.geography || 'पुणे (हवेली)',
          status: 'Active',
          lastLogin: 'नुकतेच तयार केले',
          kyc: formData.kyc || 'Verified',
          date: today,
          isCreatedByAdmin: true
        };
        setUsers([item, ...users]);
        triggerInlineNotice(`नवीन सदस्य "${item.name}" (ID: ${uniqueId}) पदभार व परमिशन सह तयार केला गेला.`);
      }
    } else if (activeModal === 'role') {
      if (editingItem) {
        setRoles(roles.map(r => r.id === editingItem.id ? { ...r, ...formData } : r));
        triggerInlineNotice(`पदभार "${formData.name || editingItem.name}" सुधारित केला गेला.`);
      } else {
        const item = { id: `ROL-${Math.floor(10 + Math.random() * 90)}`, code: formData.code || 'NEW_ROLE', name: formData.name || 'नवीन प्रशासकीय पदभार', dept: formData.dept || 'Governance', gate1Req: '१० थेट रेफरल्स', rank: 4, permissions: 'Custom Configured', system: 'No' };
        setRoles([item, ...roles]);
        triggerInlineNotice(`नवीन पदभार "${item.name}" तयार करण्यात आला.`);
      }
    } else if (activeModal === 'hierarchy') {
      if (editingItem) {
        setHierarchy(hierarchy.map(h => h.id === editingItem.id ? { ...h, ...formData } : h));
        triggerInlineNotice(`प्रशासकीय रचना घटक "${editingItem.id}" अद्ययावत केला.`);
      } else {
        const item = { id: `NODE-${Math.floor(100 + Math.random() * 900)}`, level: formData.level || 'District', name: formData.name || 'नवीन प्रशासकीय क्षेत्र', code: formData.code || 'DIST-NEW', parent: 'Maharashtra State', status: 'Active', population: '10 Lakhs', chapters: 5 };
        setHierarchy([item, ...hierarchy]);
        triggerInlineNotice(`नवीन प्रशासकीय क्षेत्र "${item.name}" जोडले गेले.`);
      }
    } else if (activeModal === 'appointment') {
      if (editingItem) {
        setAppointments(appointments.map(a => a.id === editingItem.id ? { ...a, ...formData } : a));
        triggerInlineNotice(`नियुक्ती नोंद "${editingItem.id}" अद्ययावत केली गेली.`);
      } else {
        const item = { id: `APT-${Math.floor(100 + Math.random() * 900)}`, candidate: formData.candidate || 'नवीन उमेदवार', role: formData.role || 'पदाधिकारी', geography: formData.geography || 'महाराष्ट्र', recommendedBy: 'Super Admin Direct', referrals: '२५ / २५', status: 'Approved', tenure: '2026 - 2028' };
        setAppointments([item, ...appointments]);
        triggerInlineNotice(`नवीन नियुक्ती शिफारस जोडली गेली.`);
      }
    } else if (activeModal === 'geography') {
      if (editingItem) {
        setGeographyMaster(geographyMaster.map(g => g.id === editingItem.id ? { ...g, ...formData } : g));
        triggerInlineNotice(`भौगोलिक क्षेत्र "${editingItem.id}" अद्ययावत केले गेले.`);
      } else {
        const item = { id: `GEO-${Math.floor(10 + Math.random() * 90)}`, level: formData.level || 'Taluka', name: formData.name || 'नवीन क्षेत्र', code: formData.code || 'MH-NEW', parent: 'Pune Division', population: '5.0 Lakhs', pincodes: '411000', chapters: 2, status: 'Active' };
        setGeographyMaster([item, ...geographyMaster]);
        triggerInlineNotice(`नवीन भौगोलिक क्षेत्र नोंद जोडली गेली.`);
      }
    } else if (activeModal === 'b2b') {
      if (editingItem) {
        setB2bDeals(b2bDeals.map(b => b.id === editingItem.id ? { ...b, ...formData } : b));
      } else {
        const item = { id: `B2B-${Math.floor(100 + Math.random() * 900)}`, title: formData.title || 'नवीन B2B करार', source: 'SuperAdmin Direct', stage: 'Opportunity', valueCr: Number(formData.valueCr) || 1.5, probability: '75%', assignedTo: 'B2B Admin', date: today };
        setB2bDeals([item, ...b2bDeals]);
        triggerInlineNotice(`नवीन B2B करार संधी ₹ ${item.valueCr} Cr जोडण्यात आली.`);
      }
    } else if (activeModal === 'event') {
      if (editingItem) {
        setEvents(events.map(ev => ev.id === editingItem.id ? { ...ev, ...formData } : ev));
        triggerInlineNotice(`कार्यक्रम "${editingItem.id}" अपडेट केला गेला.`);
      } else {
        const item = { id: `EV-${Math.floor(100 + Math.random() * 900)}`, title: formData.title || 'नवीन उपक्रम', type: formData.type || 'Statewide Expo', date: formData.date || today, venue: formData.venue || 'महाराष्ट्र', expected: 1000, confirmed: 500, status: 'Upcoming' };
        setEvents([item, ...events]);
        triggerInlineNotice(`नवीन उपक्रम कार्यक्रम जोडला गेला.`);
      }
    } else if (activeModal === 'article') {
      if (editingItem) {
        setArticles(articles.map(art => art.id === editingItem.id ? { ...art, ...formData } : art));
        triggerInlineNotice(`लेख "${editingItem.id}" अद्ययावत केला.`);
      } else {
        const item = { id: `ART-${Math.floor(10 + Math.random() * 90)}`, title: formData.title || 'नवीन लेख', author: formData.author || 'Super Admin Editorial', category: formData.category || 'History', status: 'Published', views: '0', date: today, modStatus: 'Verified' };
        setArticles([item, ...articles]);
        triggerInlineNotice(`नवीन CMS लेख प्रकाशित केला गेला.`);
      }
    } else if (activeModal === 'finance') {
      if (editingItem) {
        setFinanceRecords(financeRecords.map(f => f.id === editingItem.id ? { ...f, ...formData } : f));
        triggerInlineNotice(`आर्थिक नोंद "${editingItem.id}" अपडेट केली.`);
      } else {
        const item = { id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`, desc: formData.desc || 'नवीन व्यवहार', category: formData.category || 'Operations', type: formData.type || 'Income', amount: formData.amount || '₹ 50,000', gateway: 'Central HDFC A/c', date: today, status: 'Approved' };
        setFinanceRecords([item, ...financeRecords]);
        triggerInlineNotice(`नवीन आर्थिक व्यवहार नोंदणीकृत केला गेला.`);
      }
    } else if (activeModal === 'setting') {
      if (editingItem) {
        setSystemSettings(systemSettings.map(s => s.id === editingItem.id ? { ...s, ...formData } : s));
        triggerInlineNotice(`सिस्टीम सेटिंग "${editingItem.key}" अद्ययावत केली.`);
      }
    } else if (activeModal === 'permission') {
      if (editingItem) {
        setPermissionsMatrix(permissionsMatrix.map(p => p.id === editingItem.id ? { ...p, ...formData } : p));
        triggerInlineNotice(`परमिशन मॅट्रिक्स नियम "${formData.role || editingItem.role}" अद्ययावत केला.`);
      } else {
        const item = { id: `PERM-${Math.floor(10 + Math.random() * 90)}`, role: formData.role || 'Custom Role', roleCode: formData.roleCode || 'CUSTOM_ROLE', userCrud: formData.userCrud || '✅ Custom Access', bizCrud: formData.bizCrud || '✅ Custom Access', b2bApprove: formData.b2bApprove || '👁️ Review Only', sevaForceClose: formData.sevaForceClose || '❌ No Access', exportReport: formData.exportReport || '✅ Basic Export', geoScope: formData.geoScope || 'Regional', approvalRequired: 'Yes' };
        setPermissionsMatrix([item, ...permissionsMatrix]);
        triggerInlineNotice(`नवीन परमिशन मॅट्रिक्स नियम "${item.role}" तयार केला गेला.`);
      }
    }

    setActiveModal(null);
    setEditingItem(null);
    setFormData({});
  };

  /* ============================================================
     17 MASTER MODULE NAVIGATION MENU
     ============================================================ */
  const SIDEBAR_ITEMS = [
    { id: 'command', label: '🏠 Super Admin Dashboard', badge: 'MAIN' },
    { id: 'users', label: '👥 User & Role Management', badge: users.length },
    { id: 'permissions', label: '🔐 Permissions & Access Control' },
    { id: 'hierarchy', label: '🏛️ Organization Hierarchy', badge: hierarchy.length },
    { id: 'appointments', label: '👑 Leadership & Appointments', badge: appointments.length },
    { id: 'geography', label: '📍 Geography Master', badge: geographyMaster.length },
    { id: 'b2b', label: '🤝 B2B CRM Admin', badge: b2bDeals.length },
    { id: 'seva', label: '🩸 Seva & Helpdesk Admin', badge: sevaCases.length },
    { id: 'tickets', label: '🎫 Complaints & Tickets', badge: tickets.length },
    { id: 'events', label: '📅 Events & Programs', badge: events.length },
    { id: 'cms', label: '📚 Content / CMS Admin', badge: articles.length },
    { id: 'finance', label: '💰 Finance Administration', badge: financeRecords.length },
    { id: 'workflows', label: '📋 Workflows & Approvals', badge: workflows.length },
    { id: 'audit', label: '📝 Audit Logs', badge: auditLogs.length },
    { id: 'settings', label: '⚙️ System Settings', badge: systemSettings.length },
    { id: 'security', label: '🛡️ Security & Compliance', badge: securityLogs.length },
    { id: 'reports', label: '📊 Reports Center', badge: reportsCenter.length },
    { id: 'transparency', label: '🔍 Transparency Register', badge: '100%' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: S.bg, color: S.text, fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* ============================================================
         1. STICKY TOP HEADER
         ============================================================ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#FFFFFF', borderBottom: `1.5px solid ${S.border}`,
        boxShadow: '0 2px 10px rgba(234, 88, 12, 0.05)', padding: '10px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ padding: '8px', borderRadius: 8, border: `1px solid ${S.border}`, background: S.cardSoft, cursor: 'pointer' }}>
              ☰
            </button>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.1rem', color: S.deep, display: 'flex', alignItems: 'center', gap: 6 }}>
                👑 CONNECT MARATHA <span style={{ fontSize: '0.75rem', background: S.saffron, color: '#FFF', padding: '2px 8px', borderRadius: 999 }}>SUPER ADMIN CONTROL</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: S.muted }}>System Status: 🟢 Healthy | Backup: Today 03:00 AM</div>
            </div>
          </div>

          <div style={{ flex: '1 1 240px', maxWidth: 360 }}>
            <input
              type="text"
              placeholder="🔍 Global Search (Users, Roles, Geography)..."
              value={globalSearch}
              onChange={e => setGlobalSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 14px', borderRadius: 10, border: `1px solid ${S.border}`, background: S.cardSoft, color: S.deep, outline: 'none', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setActiveTab('workflows')} style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: S.red, padding: '6px 12px', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
              🔔 System Alerts <span style={{ background: S.red, color: '#FFF', padding: '1px 6px', borderRadius: 999, marginLeft: 4 }}>5</span>
            </button>

            <button onClick={() => setActiveTab('workflows')} style={{ background: S.cardSoft, border: `1px solid ${S.border}`, color: S.saffron, padding: '6px 12px', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
              📋 Pending Approvals <span style={{ background: S.saffron, color: '#FFF', padding: '1px 6px', borderRadius: 999, marginLeft: 4 }}>47</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8, borderLeft: `1px solid ${S.border}` }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: S.deep }}>{user?.name || 'सर्वोच्च प्रशासक (SuperAdmin)'}</div>
                <div style={{ fontSize: '0.7rem', color: S.green, fontWeight: 800 }}>● Full System Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* FROM DATE TO DATE FILTER MATRIX */}
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid #FFF7ED', display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: S.saffron, whiteSpace: 'nowrap' }}>📍 Filter Matrix:</span>
          
          <select value={filters.state} onChange={e => setFilters({ ...filters, state: e.target.value })} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${S.border}`, background: S.cardSoft, fontSize: '0.8rem', color: S.deep, fontWeight: 600 }}>
            <option value="Maharashtra">Maharashtra (State)</option>
          </select>

          <select value={filters.district} onChange={e => setFilters({ ...filters, district: e.target.value })} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${S.border}`, background: '#FFFFFF', fontSize: '0.8rem', color: S.text }}>
            <option value="All">All 36 Districts</option>
            <option value="Pune">Pune</option>
            <option value="Satara">Satara</option>
            <option value="Nashik">Nashik</option>
            <option value="Kolhapur">Kolhapur</option>
          </select>

          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: S.saffron }}>From:</span>
          <input type="date" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${S.border}`, fontSize: '0.78rem' }} />
          <span style={{ fontSize: '0.8rem', color: S.muted }}>to</span>
          <input type="date" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${S.border}`, fontSize: '0.78rem' }} />

          <button onClick={() => triggerInlineNotice('फिल्टर्स सर्व डेटा वर लागू केले गेले.')} style={{ padding: '4px 12px', borderRadius: 6, background: S.saffron, color: '#FFF', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Apply Filter
          </button>
        </div>
      </header>

      {/* PERSISTENT INLINE NOTICE BANNER (NO TOAST MESSAGES) */}
      {inlineNotice && (
        <div style={{
          position: 'fixed', top: 105, left: 0, right: 0, zIndex: 99,
          background: S.cardSoft, borderBottom: `2px solid ${S.saffron}`,
          padding: '10px 24px', display: 'flex', justifyContent: 'space-between',
          color: S.deep, fontWeight: 700, fontSize: '0.88rem'
        }}>
          <div><span>⚡ SYSTEM NOTICE ({inlineNotice.time}):</span> {inlineNotice.msg}</div>
          <button onClick={() => setInlineNotice(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 900, color: S.saffron }}>✕</button>
        </div>
      )}

      {/* ============================================================
         MAIN CONTAINER (LEFT SIDEBAR + CONTENT AREA)
         ============================================================ */}
      <div style={{ display: 'flex', flex: 1, marginTop: 105 }}>
        
        {/* LEFT SIDEBAR */}
        <aside style={{
          width: sidebarCollapsed ? 72 : 270, transition: 'width 0.2s ease',
          background: '#FFFFFF', borderRight: `1.5px solid ${S.border}`,
          display: mobileMenuOpen ? 'block' : 'flex', flexDirection: 'column',
          position: 'sticky', top: 105, height: 'calc(100vh - 105px)', overflowY: 'auto'
        }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #FFF7ED', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {!sidebarCollapsed && <span style={{ fontSize: '0.75rem', fontWeight: 800, color: S.saffron }}>17 SYSTEM MODULES</span>}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} style={{ background: S.cardSoft, border: `1px solid ${S.border}`, borderRadius: 6, cursor: 'pointer', padding: '2px 8px' }}>
              {sidebarCollapsed ? '➔' : '◀'}
            </button>
          </div>

          <div style={{ padding: 8, flex: 1 }}>
            {SIDEBAR_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer',
                    background: active ? S.cardSoft : 'transparent',
                    border: active ? `1.5px solid ${S.border}` : '1px solid transparent',
                    color: active ? S.saffron : S.text, fontWeight: active ? 900 : 600, fontSize: '0.86rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>{item.label}</span>
                  </div>
                  {!sidebarCollapsed && item.badge !== undefined && (
                    <Badge tone={active ? 'amber' : 'saffron'}>{item.badge}</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* RIGHT CONTENT WORKSPACE */}
        <main style={{ flex: 1, padding: 24, background: S.bg, overflowX: 'hidden' }}>
          
          {/* 1. 🏠 SUPER ADMIN DASHBOARD */}
          {activeTab === 'command' && (
            <div>
              <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: S.deep, margin: 0 }}>
                    CONNECT MARATHA — SUPER ADMIN COMMAND CENTER
                  </h1>
                  <p style={{ color: S.muted, fontSize: '0.9rem', margin: '4px 0 0' }}>
                    Welcome, <strong>{user?.name || 'Super Admin'}</strong> • Uptime: 99.97% • Status: 🟢 Healthy
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn variant="primary" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('user'); }}>+ Create User</Btn>
                  <Btn variant="ghost" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('role'); }}>+ Create Role</Btn>
                </div>
              </div>

              {/* HEALTH & SYSTEM KPI CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                <Card style={{ borderLeft: `4px solid ${S.saffron}` }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: S.muted }}>Total Users</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: S.saffron, margin: '4px 0' }}>1,28,450</div>
                  <div style={{ fontSize: '0.75rem', color: S.green, fontWeight: 700 }}>1,25,480 Active</div>
                </Card>

                <Card style={{ borderLeft: `4px solid ${S.amber}` }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: S.muted }}>Pending Approvals</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: S.amber, margin: '4px 0' }}>47</div>
                  <div style={{ fontSize: '0.75rem', color: S.red, fontWeight: 700 }}>3 Critical Priority</div>
                </Card>

                <Card style={{ borderLeft: `4px solid ${S.red}` }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: S.muted }}>Open Seva Cases</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: S.red, margin: '4px 0' }}>1,248</div>
                  <div style={{ fontSize: '0.75rem', color: S.red, fontWeight: 700 }}>8 SLA Breach</div>
                </Card>

                <Card style={{ borderLeft: `4px solid ${S.blue}` }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: S.muted }}>Storage & System</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: S.blue, margin: '4px 0' }}>68% Used</div>
                  <div style={{ fontSize: '0.75rem', color: S.green, fontWeight: 700 }}>99.97% Uptime</div>
                </Card>
              </div>

              {/* QUICK ACTION BAR */}
              <Card style={{ marginBottom: 24, background: S.cardSoft }}>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: S.deep, marginBottom: 10 }}>⚡ Quick Actions:</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Btn variant="primary" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('user'); }}>+ New User</Btn>
                  <Btn variant="ghost" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('role'); }}>+ New Role</Btn>
                  <Btn variant="plain" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('hierarchy'); }}>+ New Hierarchy Node</Btn>
                  <Btn variant="plain" onClick={() => triggerInlineNotice('सर्व सिस्टीम कॅशे रिफ्रेश केली गेली.')}>⚡ Clear Cache</Btn>
                  <Btn variant="plain" onClick={() => triggerInlineNotice('डेटाबेस बॅकअप स्वयंचलित सुरू झाला.')}>🔄 Run DB Backup</Btn>
                </div>
              </Card>
            </div>
          )}

          {/* 2. 👥 USER & ROLE MANAGEMENT */}
          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: S.deep, margin: 0 }}>👥 User & Role Administration</h2>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn variant="primary" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('user'); }}>+ Create User</Btn>
                  <Btn variant="ghost" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('role'); }}>+ Create Role</Btn>
                </div>
              </div>

              {/* SUPERADMIN CREATED USERS SEPARATE DIRECTORY */}
              <Card style={{ marginBottom: 24, border: `1.5px solid ${S.saffron}`, background: S.cardSoft }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '1.05rem', color: S.deep, display: 'flex', alignItems: 'center', gap: 8 }}>
                      👑 सुपर अ‍ॅडमिन निर्मित विशेष सदस्य (SuperAdmin Created Users)
                      <Badge tone="saffron">{users.filter(u => u.isCreatedByAdmin).length} Created</Badge>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: S.muted, marginTop: 2 }}>
                      नॉन-रिपिंटेबल युनिक आयडी, नियुक्त पदभार (Role) आणि स्वतंत्र परमिशन सह निर्मित केलेले सदस्य.
                    </div>
                  </div>
                  <Btn variant="primary" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('user'); }}>+ Create User</Btn>
                </div>

                <div style={{ overflowX: 'auto', background: '#FFFFFF', borderRadius: 8, border: `1px solid ${S.border}`, padding: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: '#FFF7ED', color: S.saffron }}>
                        <th style={{ padding: 10 }}>Unique User ID</th>
                        <th style={{ padding: 10 }}>नाव (Name)</th>
                        <th style={{ padding: 10 }}>नियुक्त पदभार (Assigned Role)</th>
                        <th style={{ padding: 10 }}>नियुक्त परमिशन (Assigned Permissions)</th>
                        <th style={{ padding: 10 }}>क्षेत्र (Geography)</th>
                        <th style={{ padding: 10 }}>KYC</th>
                        <th style={{ padding: 10 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => u.isCreatedByAdmin).map(u => (
                        <tr key={u.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                          <td style={{ padding: 10, fontWeight: 900, color: S.saffron, fontFamily: 'monospace' }}>{u.id}</td>
                          <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{u.name}</td>
                          <td style={{ padding: 10 }}><Badge tone="saffron">{u.role}</Badge></td>
                          <td style={{ padding: 10, fontSize: '0.8rem', color: S.text, fontWeight: 600 }}>{u.permissions || '✅ Standard Permissions'}</td>
                          <td style={{ padding: 10 }}>{u.geography}</td>
                          <td style={{ padding: 10 }}><Badge tone={u.kyc === 'Verified' ? 'green' : 'amber'}>{u.kyc}</Badge></td>
                          <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                            <Btn variant="plain" onClick={() => { setEditingItem(u); setFormData(u); setActiveModal('user'); }}>✏️ Edit</Btn>
                            <Btn variant="danger" onClick={() => { setUsers(users.filter(x => x.id !== u.id)); triggerInlineNotice(`सदस्य ${u.name} हटवला गेला.`); }}>🗑️ Delete</Btn>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* MASTER USER TABLE WITH FULL CRUD */}
              <Card style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: S.deep, marginBottom: 12 }}>📁 सर्व सदस्य मास्टर डायरेक्टरी (Master Directory)</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: S.cardSoft, color: S.saffron }}>
                        <th style={{ padding: 10 }}>Photo</th>
                        <th style={{ padding: 10 }}>User ID</th>
                        <th style={{ padding: 10 }}>नाव (Name)</th>
                        <th style={{ padding: 10 }}>मोबाईल</th>
                        <th style={{ padding: 10 }}>पदभार (Role)</th>
                        <th style={{ padding: 10 }}>जिल्हा</th>
                        <th style={{ padding: 10 }}>KYC</th>
                        <th style={{ padding: 10 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                          <td style={{ padding: 10 }}>{u.photo}</td>
                          <td style={{ padding: 10, fontWeight: 800, fontFamily: 'monospace', fontSize: '0.8rem' }}>{u.id}</td>
                          <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{u.name}</td>
                          <td style={{ padding: 10 }}>{u.mobile}</td>
                          <td style={{ padding: 10, color: S.saffron, fontWeight: 800 }}>{u.role}</td>
                          <td style={{ padding: 10 }}>{u.geography}</td>
                          <td style={{ padding: 10 }}><Badge tone={u.kyc === 'Verified' ? 'green' : 'amber'}>{u.kyc}</Badge></td>
                          <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                            <Btn variant="plain" onClick={() => { setEditingItem(u); setFormData(u); setActiveModal('user'); }}>✏️ Edit</Btn>
                            <Btn variant="danger" onClick={() => { setUsers(users.filter(x => x.id !== u.id)); triggerInlineNotice(`सदस्य ${u.name} हटवला गेला.`); }}>🗑️ Delete</Btn>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* ROLE MANAGEMENT TABLE */}
              <Card>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: S.deep, marginBottom: 12 }}>प्रशासकीय पदभार मॅट्रिक्स (Role Matrix)</div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: S.cardSoft, color: S.saffron }}>
                        <th style={{ padding: 10 }}>Code</th>
                        <th style={{ padding: 10 }}>पदभार नाव</th>
                        <th style={{ padding: 10 }}>विभाग</th>
                        <th style={{ padding: 10 }}>गेट-१ अट</th>
                        <th style={{ padding: 10 }}>Rank</th>
                        <th style={{ padding: 10 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map(r => (
                        <tr key={r.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                          <td style={{ padding: 10, fontWeight: 800 }}>{r.code}</td>
                          <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{r.name}</td>
                          <td style={{ padding: 10 }}>{r.dept}</td>
                          <td style={{ padding: 10, color: S.saffron, fontWeight: 700 }}>{r.gate1Req}</td>
                          <td style={{ padding: 10, fontWeight: 900 }}>#{r.rank}</td>
                          <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                            <Btn variant="plain" onClick={() => { setEditingItem(r); setFormData(r); setActiveModal('role'); }}>✏️ Edit</Btn>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* 3. 🔐 PERMISSIONS & ACCESS CONTROL */}
          {activeTab === 'permissions' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, margin: 0 }}>🔐 Permission & Access Control Matrix</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: S.muted }}>Manage role-based module permissions, geography scoping, and action privileges.</p>
                </div>
                <Btn variant="primary" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('permission'); }}>+ Create Permission Rule</Btn>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: S.cardSoft, color: S.saffron }}>
                      <th style={{ padding: 10 }}>Role Name</th>
                      <th style={{ padding: 10 }}>User CRUD</th>
                      <th style={{ padding: 10 }}>Business CRUD</th>
                      <th style={{ padding: 10 }}>B2B Approve</th>
                      <th style={{ padding: 10 }}>Seva Power</th>
                      <th style={{ padding: 10 }}>Export Rights</th>
                      <th style={{ padding: 10 }}>Geo Scope</th>
                      <th style={{ padding: 10 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissionsMatrix.map((p) => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                        <td style={{ padding: 10, fontWeight: 800, color: S.deep }}>
                          {p.role} <div style={{ fontSize: '0.72rem', color: S.saffron }}>{p.roleCode}</div>
                        </td>
                        <td style={{ padding: 10 }}>{p.userCrud}</td>
                        <td style={{ padding: 10 }}>{p.bizCrud}</td>
                        <td style={{ padding: 10 }}>{p.b2bApprove}</td>
                        <td style={{ padding: 10 }}>{p.sevaForceClose}</td>
                        <td style={{ padding: 10 }}>{p.exportReport}</td>
                        <td style={{ padding: 10 }}><Badge tone="saffron">{p.geoScope}</Badge></td>
                        <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                          <Btn variant="plain" onClick={() => { setEditingItem(p); setFormData(p); setActiveModal('permission'); }}>✏️ Edit</Btn>
                          <Btn variant="ghost" onClick={() => {
                            const clone = { ...p, id: `PERM-${Math.floor(10 + Math.random() * 90)}`, role: `${p.role} (Cloned)`, roleCode: `${p.roleCode}_CLONE` };
                            setPermissionsMatrix([...permissionsMatrix, clone]);
                            triggerInlineNotice(`परमिशन मॅट्रिक्स क्लोन केले गेले.`);
                          }}>📋 Clone</Btn>
                          <Btn variant="danger" onClick={() => {
                            setPermissionsMatrix(permissionsMatrix.filter(x => x.id !== p.id));
                            triggerInlineNotice(`परमिशन नियम ${p.role} हटवला.`);
                          }}>🗑️ Delete</Btn>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* 4. 🏛️ ORGANIZATION HIERARCHY */}
          {activeTab === 'hierarchy' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, margin: 0 }}>🏛️ Organization Hierarchy Tree</h2>
                <Btn variant="primary" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('hierarchy'); }}>+ Add Node</Btn>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Node ID</th>
                    <th style={{ padding: 10 }}>Level</th>
                    <th style={{ padding: 10 }}>क्षेत्र नाव</th>
                    <th style={{ padding: 10 }}>Parent Node</th>
                    <th style={{ padding: 10 }}>Chapters</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hierarchy.map(h => (
                    <tr key={h.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{h.id}</td>
                      <td style={{ padding: 10, color: S.saffron, fontWeight: 800 }}>{h.level}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{h.name}</td>
                      <td style={{ padding: 10 }}>{h.parent}</td>
                      <td style={{ padding: 10, fontWeight: 800 }}>{h.chapters} Chapters</td>
                      <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                        <Btn variant="plain" onClick={() => { setEditingItem(h); setFormData(h); setActiveModal('hierarchy'); }}>✏️ Edit</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 5. 👑 LEADERSHIP & APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, margin: 0 }}>👑 Leadership & Appointments Pipeline</h2>
                <Btn variant="primary" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('appointment'); }}>+ New Appointment</Btn>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Appointment ID</th>
                    <th style={{ padding: 10 }}>उमेदवार नाव</th>
                    <th style={{ padding: 10 }}>प्रस्तावित पदभार</th>
                    <th style={{ padding: 10 }}>क्षेत्र</th>
                    <th style={{ padding: 10 }}>गेट-१ रेफरल्स</th>
                    <th style={{ padding: 10 }}>Status</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{a.id}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{a.candidate}</td>
                      <td style={{ padding: 10, color: S.saffron, fontWeight: 800 }}>{a.role}</td>
                      <td style={{ padding: 10 }}>{a.geography}</td>
                      <td style={{ padding: 10, fontWeight: 800, color: S.green }}>{a.referrals}</td>
                      <td style={{ padding: 10 }}><Badge tone={a.status === 'Active' ? 'green' : 'amber'}>{a.status}</Badge></td>
                      <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                        <Btn variant="plain" onClick={() => { setEditingItem(a); setFormData(a); setActiveModal('appointment'); }}>✏️ Edit</Btn>
                        <Btn variant="danger" onClick={() => { setAppointments(appointments.filter(x => x.id !== a.id)); triggerInlineNotice(`नियुक्ती नोंद ${a.id} हटवली गेली.`); }}>🗑️ Delete</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 6. 📍 GEOGRAPHY MASTER */}
          {activeTab === 'geography' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, margin: 0 }}>📍 Geography Master Directory</h2>
                <Btn variant="primary" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('geography'); }}>+ Add Geo Location</Btn>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Geo ID</th>
                    <th style={{ padding: 10 }}>प्रकार (Level)</th>
                    <th style={{ padding: 10 }}>नाव (Name)</th>
                    <th style={{ padding: 10 }}>Code</th>
                    <th style={{ padding: 10 }}>लोकसंख्या</th>
                    <th style={{ padding: 10 }}>पिनकोड सूची</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {geographyMaster.map(g => (
                    <tr key={g.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{g.id}</td>
                      <td style={{ padding: 10, color: S.saffron, fontWeight: 800 }}>{g.level}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{g.name}</td>
                      <td style={{ padding: 10 }}>{g.code}</td>
                      <td style={{ padding: 10 }}>{g.population}</td>
                      <td style={{ padding: 10, fontSize: '0.8rem', color: S.muted }}>{g.pincodes}</td>
                      <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                        <Btn variant="plain" onClick={() => { setEditingItem(g); setFormData(g); setActiveModal('geography'); }}>✏️ Edit</Btn>
                        <Btn variant="danger" onClick={() => { setGeographyMaster(geographyMaster.filter(x => x.id !== g.id)); triggerInlineNotice(`क्षेत्र नोंद ${g.id} हटवली.`); }}>🗑️ Delete</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 7. 🤝 B2B CRM ADMIN */}
          {activeTab === 'b2b' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, margin: 0 }}>🤝 B2B CRM Administration</h2>
                <Btn variant="primary" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('b2b'); }}>+ Create Opportunity</Btn>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>ID</th>
                    <th style={{ padding: 10 }}>करार शीर्षक</th>
                    <th style={{ padding: 10 }}>मूल्य (₹ Cr)</th>
                    <th style={{ padding: 10 }}>संभाव्यता</th>
                    <th style={{ padding: 10 }}>टप्पा</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {b2bDeals.map(d => (
                    <tr key={d.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{d.id}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{d.title}</td>
                      <td style={{ padding: 10, color: S.green, fontWeight: 900 }}>₹ {d.valueCr} Cr</td>
                      <td style={{ padding: 10 }}>{d.probability}</td>
                      <td style={{ padding: 10 }}><Badge tone="saffron">{d.stage}</Badge></td>
                      <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                        <Btn variant="plain" onClick={() => { setEditingItem(d); setFormData(d); setActiveModal('b2b'); }}>✏️ Edit</Btn>
                        <Btn variant="danger" onClick={() => { setB2bDeals(b2bDeals.filter(x => x.id !== d.id)); triggerInlineNotice(`करार ${d.id} हटवला गेला.`); }}>🗑️ Delete</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 8. 🩸 SEVA & HELPDESK ADMIN */}
          {activeTab === 'seva' && (
            <Card>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, marginBottom: 16 }}>🩸 24×7 Seva & Helpdesk Command Desk</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Case ID</th>
                    <th style={{ padding: 10 }}>लाभार्थी</th>
                    <th style={{ padding: 10 }}>प्रकार</th>
                    <th style={{ padding: 10 }}>प्राधान्य</th>
                    <th style={{ padding: 10 }}>SLA</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sevaCases.map(s => (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{s.id}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{s.beneficiary} ({s.district})</td>
                      <td style={{ padding: 10 }}>{s.category}</td>
                      <td style={{ padding: 10, color: S.red, fontWeight: 800 }}>{s.priority}</td>
                      <td style={{ padding: 10 }}>{s.sla}</td>
                      <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                        <Btn variant="danger" onClick={() => { setSevaCases(sevaCases.filter(x => x.id !== s.id)); triggerInlineNotice(`केस ${s.id} बंद केली गेली.`); }}>Force Close</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 9. 🎫 COMPLAINTS & TICKETS */}
          {activeTab === 'tickets' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, margin: 0 }}>🎫 Complaints & Support Tickets Admin</h2>
                <Btn variant="primary" onClick={() => triggerInlineNotice('नवीन तक्रार तिकीट सिस्टीम मध्ये उघडले गेले.')}>+ Open Ticket</Btn>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Ticket ID</th>
                    <th style={{ padding: 10 }}>विषय (Subject)</th>
                    <th style={{ padding: 10 }}>वर्ग (Category)</th>
                    <th style={{ padding: 10 }}>प्राधान्य</th>
                    <th style={{ padding: 10 }}>नियोजित विभाग</th>
                    <th style={{ padding: 10 }}>Status</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{t.id}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{t.subject}</td>
                      <td style={{ padding: 10 }}>{t.category}</td>
                      <td style={{ padding: 10, color: t.priority === 'Critical' ? S.red : S.amber, fontWeight: 800 }}>{t.priority}</td>
                      <td style={{ padding: 10 }}>{t.assignedTo}</td>
                      <td style={{ padding: 10 }}><Badge tone={t.status === 'Open' ? 'amber' : 'green'}>{t.status}</Badge></td>
                      <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                        <Btn variant="success" onClick={() => { setTickets(tickets.map(x => x.id === t.id ? { ...x, status: 'Resolved' } : x)); triggerInlineNotice(`तक्रार ${t.id} चे निवारण झाले.`); }}>Resolve</Btn>
                        <Btn variant="danger" onClick={() => { setTickets(tickets.filter(x => x.id !== t.id)); triggerInlineNotice(`तक्रार तिकीट ${t.id} हटवले.`); }}>🗑️</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 10. 📅 EVENTS & PROGRAMS */}
          {activeTab === 'events' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, margin: 0 }}>📅 Events & Statewide Programs</h2>
                <Btn variant="primary" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('event'); }}>+ Add Event</Btn>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Event ID</th>
                    <th style={{ padding: 10 }}>कार्यक्रम नाव</th>
                    <th style={{ padding: 10 }}>प्रकार</th>
                    <th style={{ padding: 10 }}>दिनांक</th>
                    <th style={{ padding: 10 }}>स्थळ (Venue)</th>
                    <th style={{ padding: 10 }}>नोंदणी (Expected/Confirmed)</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{ev.id}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{ev.title}</td>
                      <td style={{ padding: 10, color: S.saffron, fontWeight: 700 }}>{ev.type}</td>
                      <td style={{ padding: 10 }}>{ev.date}</td>
                      <td style={{ padding: 10 }}>{ev.venue}</td>
                      <td style={{ padding: 10, fontWeight: 800, color: S.green }}>{ev.confirmed} / {ev.expected}</td>
                      <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                        <Btn variant="plain" onClick={() => { setEditingItem(ev); setFormData(ev); setActiveModal('event'); }}>✏️ Edit</Btn>
                        <Btn variant="danger" onClick={() => { setEvents(events.filter(x => x.id !== ev.id)); triggerInlineNotice(`कार्यक्रम ${ev.id} रद्द करण्यात आला.`); }}>🗑️</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 11. 📚 CONTENT / CMS ADMIN */}
          {activeTab === 'cms' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, margin: 0 }}>📚 Content & Knowledge Base (CMS)</h2>
                <Btn variant="primary" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('article'); }}>+ Create Article</Btn>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Article ID</th>
                    <th style={{ padding: 10 }}>लेख शीर्षक</th>
                    <th style={{ padding: 10 }}>लेखक</th>
                    <th style={{ padding: 10 }}>श्रेणी</th>
                    <th style={{ padding: 10 }}>वाचक (Views)</th>
                    <th style={{ padding: 10 }}>Status</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map(art => (
                    <tr key={art.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{art.id}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{art.title}</td>
                      <td style={{ padding: 10 }}>{art.author}</td>
                      <td style={{ padding: 10, color: S.saffron, fontWeight: 700 }}>{art.category}</td>
                      <td style={{ padding: 10, fontWeight: 800 }}>{art.views}</td>
                      <td style={{ padding: 10 }}><Badge tone={art.status === 'Published' ? 'green' : 'amber'}>{art.status}</Badge></td>
                      <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                        <Btn variant="plain" onClick={() => { setEditingItem(art); setFormData(art); setActiveModal('article'); }}>✏️ Edit</Btn>
                        <Btn variant="danger" onClick={() => { setArticles(articles.filter(x => x.id !== art.id)); triggerInlineNotice(`लेख ${art.id} हटवला.`); }}>🗑️</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 12. 💰 FINANCE ADMINISTRATION */}
          {activeTab === 'finance' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, margin: 0 }}>💰 Finance & Treasury Administration</h2>
                <Btn variant="primary" onClick={() => { setEditingItem(null); setFormData({}); setActiveModal('finance'); }}>+ Record Transaction</Btn>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Txn ID</th>
                    <th style={{ padding: 10 }}>तपशील (Description)</th>
                    <th style={{ padding: 10 }}>श्रेणी</th>
                    <th style={{ padding: 10 }}>प्रकार</th>
                    <th style={{ padding: 10 }}>रक्कम</th>
                    <th style={{ padding: 10 }}>Status</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {financeRecords.map(f => (
                    <tr key={f.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{f.id}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{f.desc}</td>
                      <td style={{ padding: 10 }}>{f.category}</td>
                      <td style={{ padding: 10, color: f.type === 'Income' ? S.green : S.red, fontWeight: 800 }}>{f.type}</td>
                      <td style={{ padding: 10, fontWeight: 900, color: S.deep }}>{f.amount}</td>
                      <td style={{ padding: 10 }}><Badge tone={f.status === 'Approved' ? 'green' : 'amber'}>{f.status}</Badge></td>
                      <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                        <Btn variant="plain" onClick={() => { setEditingItem(f); setFormData(f); setActiveModal('finance'); }}>✏️ Edit</Btn>
                        <Btn variant="danger" onClick={() => { setFinanceRecords(financeRecords.filter(x => x.id !== f.id)); triggerInlineNotice(`आर्थिक नोंद ${f.id} हटवली.`); }}>🗑️</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 13. 📋 WORKFLOWS & APPROVALS */}
          {activeTab === 'workflows' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, margin: 0 }}>📋 System Workflows & Approval Rules</h2>
                <Btn variant="primary" onClick={() => triggerInlineNotice('नवीन नियम वर्कफ्लो जोडला गेला.')}>+ Build Workflow</Btn>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Rule ID</th>
                    <th style={{ padding: 10 }}>वर्कफ्लो नाव</th>
                    <th style={{ padding: 10 }}>ट्रिगर (Trigger)</th>
                    <th style={{ padding: 10 }}>मंजुरी साखळी (Approval Chain)</th>
                    <th style={{ padding: 10 }}>सरासरी वेळ</th>
                    <th style={{ padding: 10 }}>Status</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map(w => (
                    <tr key={w.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{w.id}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{w.title}</td>
                      <td style={{ padding: 10, color: S.saffron, fontWeight: 700 }}>{w.trigger}</td>
                      <td style={{ padding: 10 }}>{w.approvers}</td>
                      <td style={{ padding: 10, fontWeight: 800 }}>{w.avgTime}</td>
                      <td style={{ padding: 10 }}><Badge tone="green">{w.status}</Badge></td>
                      <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                        <Btn variant="plain" onClick={() => triggerInlineNotice(`वर्कफ्लो ${w.id} कॉन्फिगरेशन उघडले.`)}>⚙️ Configure</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 14. 📝 AUDIT LOGS */}
          {activeTab === 'audit' && (
            <Card>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, marginBottom: 16 }}>📝 Complete System Audit Logs</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Log ID</th>
                    <th style={{ padding: 10 }}>चालक (Operator)</th>
                    <th style={{ padding: 10 }}>कृती कोड</th>
                    <th style={{ padding: 10 }}>लक्ष्य (Target Record)</th>
                    <th style={{ padding: 10 }}>बदल विवरण (Value Diff)</th>
                    <th style={{ padding: 10 }}>IP / Timestamp</th>
                    <th style={{ padding: 10 }}>Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{log.id}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{log.who}</td>
                      <td style={{ padding: 10, color: S.saffron, fontWeight: 800 }}>{log.action}</td>
                      <td style={{ padding: 10 }}>{log.target}</td>
                      <td style={{ padding: 10, fontSize: '0.82rem', color: S.muted }}>{log.diff}</td>
                      <td style={{ padding: 10, fontSize: '0.8rem' }}>{log.timestamp} ({log.ip})</td>
                      <td style={{ padding: 10 }}><Badge tone={log.severity === 'Critical' ? 'red' : 'amber'}>{log.severity}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 15. ⚙️ SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <Card>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, marginBottom: 16 }}>⚙️ Global System Configuration Settings</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Setting Key</th>
                    <th style={{ padding: 10 }}>वर्ग (Category)</th>
                    <th style={{ padding: 10 }}>शीर्षक (Setting Title)</th>
                    <th style={{ padding: 10 }}>वर्तमान मूल्य (Current Value)</th>
                    <th style={{ padding: 10 }}>अद्ययावत तारीख</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {systemSettings.map(set => (
                    <tr key={set.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{set.key}</td>
                      <td style={{ padding: 10, color: S.saffron, fontWeight: 700 }}>{set.category}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{set.title}</td>
                      <td style={{ padding: 10, fontWeight: 800 }}>{set.value}</td>
                      <td style={{ padding: 10, fontSize: '0.82rem' }}>{set.updated}</td>
                      <td style={{ padding: 10 }}>
                        <Btn variant="plain" onClick={() => { setEditingItem(set); setFormData(set); setActiveModal('setting'); }}>✏️ Edit</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 16. 🛡️ SECURITY & COMPLIANCE */}
          {activeTab === 'security' && (
            <Card>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, marginBottom: 16 }}>🛡️ Security Controls & Data Compliance</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Event ID</th>
                    <th style={{ padding: 10 }}>सुरक्षा घटक (Metric/Threat)</th>
                    <th style={{ padding: 10 }}>Status</th>
                    <th style={{ padding: 10 }}>पाहणी / स्रोत (Origin)</th>
                    <th style={{ padding: 10 }}>कारवाई विवरण</th>
                    <th style={{ padding: 10 }}>धोका पातळी (Risk)</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.map(sec => (
                    <tr key={sec.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{sec.id}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{sec.metric}</td>
                      <td style={{ padding: 10 }}><Badge tone={sec.status === 'Secure' ? 'green' : 'red'}>{sec.status}</Badge></td>
                      <td style={{ padding: 10 }}>{sec.ip}</td>
                      <td style={{ padding: 10, fontSize: '0.82rem' }}>{sec.actionTaken}</td>
                      <td style={{ padding: 10, fontWeight: 800, color: sec.risk === 'High Risk' ? S.red : S.green }}>{sec.risk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 17. 📊 REPORTS CENTER */}
          {activeTab === 'reports' && (
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: S.deep, margin: 0 }}>📊 Reports & Executive Analytics Center</h2>
                <Btn variant="primary" onClick={() => triggerInlineNotice('नवीन कस्टम अहवाल जनरेट झाला.')}>+ Generate Custom Report</Btn>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: S.cardSoft, color: S.saffron }}>
                    <th style={{ padding: 10 }}>Report ID</th>
                    <th style={{ padding: 10 }}>अहवाल नाव (Report Title)</th>
                    <th style={{ padding: 10 }}>श्रेणी</th>
                    <th style={{ padding: 10 }}>दिनांक</th>
                    <th style={{ padding: 10 }}>फाईल प्रकार व आकार</th>
                    <th style={{ padding: 10 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsCenter.map(rpt => (
                    <tr key={rpt.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{rpt.id}</td>
                      <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{rpt.title}</td>
                      <td style={{ padding: 10, color: S.saffron, fontWeight: 700 }}>{rpt.category}</td>
                      <td style={{ padding: 10 }}>{rpt.date}</td>
                      <td style={{ padding: 10, fontWeight: 800 }}>{rpt.size}</td>
                      <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                        <Btn variant="primary" onClick={() => triggerInlineNotice(`अहवाल "${rpt.title}" पीडीएफ / एक्सेल फॉरमॅट मध्ये डाउनलोड झाला.`)}>📥 Download</Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 18. 🔍 FULL TRANSPARENCY REGISTER */}
          {activeTab === 'transparency' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: S.deep, margin: 0 }}>🔍 Full System Transparency Register</h2>
                <p style={{ color: S.muted, fontSize: '0.9rem', margin: '4px 0 0' }}>
                  Registered Users, Unregistered Drafts, Businesses, Seva Services, and Real-Time Live Activity Tracker.
                </p>
              </div>

              {/* 1. REGISTERED USERS DIRECTORY */}
              <Card style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: S.deep, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🟢 नोंदणीकृत सर्व सदस्य (Registered Users Details)</span>
                  <Badge tone="green">{users.length} Registered Members</Badge>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: S.cardSoft, color: S.saffron }}>
                        <th style={{ padding: 10 }}>User ID</th>
                        <th style={{ padding: 10 }}>नाव (Name)</th>
                        <th style={{ padding: 10 }}>संपर्क (Mobile / Email)</th>
                        <th style={{ padding: 10 }}>पदभार (Role)</th>
                        <th style={{ padding: 10 }}>परमिशन सेट</th>
                        <th style={{ padding: 10 }}>जिल्हा</th>
                        <th style={{ padding: 10 }}>KYC Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                          <td style={{ padding: 10, fontWeight: 900, fontFamily: 'monospace', color: S.saffron }}>{u.id}</td>
                          <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{u.name}</td>
                          <td style={{ padding: 10, fontSize: '0.8rem' }}>{u.mobile}<br/>{u.email}</td>
                          <td style={{ padding: 10 }}><Badge tone="saffron">{u.role}</Badge></td>
                          <td style={{ padding: 10, fontSize: '0.78rem', color: S.text }}>{u.permissions || '✅ Standard Permissions'}</td>
                          <td style={{ padding: 10 }}>{u.geography}</td>
                          <td style={{ padding: 10 }}><Badge tone={u.kyc === 'Verified' ? 'green' : 'amber'}>{u.kyc}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* 2. UNREGISTERED USERS DIRECTORY */}
              <Card style={{ marginBottom: 24, border: `1.5px solid ${S.amber}` }}>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: S.deep, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>⚠️ अ-नोंदणीकृत व अपूर्ण नोंदणी अर्ज (Unregistered / Draft Users)</span>
                  <Badge tone="amber">{unregisteredUsers.length} Pending Registration</Badge>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: '#FEF3C7', color: S.amber }}>
                        <th style={{ padding: 10 }}>Temp ID</th>
                        <th style={{ padding: 10 }}>नाव व संपर्क</th>
                        <th style={{ padding: 10 }}>अपूर्ण टप्पा (Drop-off Stage)</th>
                        <th style={{ padding: 10 }}>क्षेत्र (District)</th>
                        <th style={{ padding: 10 }}>तारीख</th>
                        <th style={{ padding: 10 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unregisteredUsers.map(un => (
                        <tr key={un.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                          <td style={{ padding: 10, fontWeight: 800, fontFamily: 'monospace' }}>{un.id}</td>
                          <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{un.name}<br/><span style={{ fontSize: '0.78rem', color: S.muted }}>{un.mobile} • {un.email}</span></td>
                          <td style={{ padding: 10 }}><Badge tone="amber">{un.stage}</Badge></td>
                          <td style={{ padding: 10 }}>{un.geography}</td>
                          <td style={{ padding: 10, fontSize: '0.8rem' }}>{un.date}</td>
                          <td style={{ padding: 10, display: 'flex', gap: 6 }}>
                            <Btn variant="success" onClick={() => {
                              const newReg = { id: `CM-USR-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`, photo: '👤', name: un.name, mobile: un.mobile, email: un.email, role: 'District Member', permissions: '✅ Basic Member Access', geography: un.geography, status: 'Active', lastLogin: 'नुकतेच', kyc: 'Verified', date: un.date, isCreatedByAdmin: true };
                              setUsers([newReg, ...users]);
                              setUnregisteredUsers(unregisteredUsers.filter(x => x.id !== un.id));
                              triggerInlineNotice(`अ-नोंदणीकृत अर्जदार ${un.name} चे सदस्यत्व थेट मंजूर केले केले.`);
                            }}>Approve KYC</Btn>
                            <Btn variant="ghost" onClick={() => triggerInlineNotice(`SMS स्मरणपत्र ${un.mobile} वर पाठवले.`)}>📲 Remind SMS</Btn>
                            <Btn variant="danger" onClick={() => { setUnregisteredUsers(unregisteredUsers.filter(x => x.id !== un.id)); triggerInlineNotice(`अपूर्ण अर्ज ${un.id} काढून टाकला.`); }}>🗑️</Btn>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* 3. REGISTERED BUSINESSES DIRECTORY */}
              <Card style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: S.deep, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🏢 नोंदणीकृत व्यवसाय व नेटवर्किंग (Registered Businesses Details)</span>
                  <Badge tone="saffron">{registeredBusinesses.length} Verified Enterprises</Badge>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: S.cardSoft, color: S.saffron }}>
                        <th style={{ padding: 10 }}>Business ID</th>
                        <th style={{ padding: 10 }}>उद्योगाचे नाव (Business Name)</th>
                        <th style={{ padding: 10 }}>मालकाचे नाव (Owner)</th>
                        <th style={{ padding: 10 }}>श्रेणी</th>
                        <th style={{ padding: 10 }}>वार्षिक उलाढाल (Turnover)</th>
                        <th style={{ padding: 10 }}>GSTIN / Reg</th>
                        <th style={{ padding: 10 }}>Tier & Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredBusinesses.map(b => (
                        <tr key={b.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                          <td style={{ padding: 10, fontWeight: 900, color: S.saffron, fontFamily: 'monospace' }}>{b.id}</td>
                          <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{b.name}</td>
                          <td style={{ padding: 10 }}>{b.owner} ({b.district})</td>
                          <td style={{ padding: 10, color: S.saffron, fontWeight: 700 }}>{b.category}</td>
                          <td style={{ padding: 10, fontWeight: 800, color: S.green }}>{b.turnover}</td>
                          <td style={{ padding: 10, fontSize: '0.8rem', fontFamily: 'monospace' }}>{b.gst}</td>
                          <td style={{ padding: 10 }}><Badge tone="green">{b.tier}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* 4. REGISTERED SEVA SERVICES DIRECTORY */}
              <Card style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: S.deep, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🩸 नोंदणीकृत सेवा व मदत केंद्रे (Registered Seva Services Details)</span>
                  <Badge tone="red">{registeredServices.length} Active Desks</Badge>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: S.cardSoft, color: S.saffron }}>
                        <th style={{ padding: 10 }}>Service ID</th>
                        <th style={{ padding: 10 }}>सेवा नाव (Service Title)</th>
                        <th style={{ padding: 10 }}>वर्ग (Category)</th>
                        <th style={{ padding: 10 }}>जिल्हा / कार्यक्षेत्र</th>
                        <th style={{ padding: 10 }}>समन्वयक (Lead)</th>
                        <th style={{ padding: 10 }}>क्षमता / संख्या</th>
                        <th style={{ padding: 10 }}>SLA & Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredServices.map(s => (
                        <tr key={s.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                          <td style={{ padding: 10, fontWeight: 900, color: S.red, fontFamily: 'monospace' }}>{s.id}</td>
                          <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{s.serviceName}</td>
                          <td style={{ padding: 10 }}>{s.category}</td>
                          <td style={{ padding: 10 }}>{s.district}</td>
                          <td style={{ padding: 10, fontWeight: 700 }}>{s.lead}</td>
                          <td style={{ padding: 10, fontWeight: 800, color: S.saffron }}>{s.activeCount}</td>
                          <td style={{ padding: 10 }}><Badge tone="green">{s.status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* 5. LIVE SYSTEM ACTIVITY TRANSPARENCY TRACKER */}
              <Card>
                <div style={{ fontWeight: 900, fontSize: '1.05rem', color: S.deep, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📜 सर्व क्रियाकलाप व पारदर्शकता लाइव्ह ट्रॅकर (Live System Activity Transparency Tracker)</span>
                  <Badge tone="purple">Real-Time Transparency Stream</Badge>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: S.cardSoft, color: S.saffron }}>
                        <th style={{ padding: 10 }}>Event Time</th>
                        <th style={{ padding: 10 }}>चालक / ऑपरेटर (Actor)</th>
                        <th style={{ padding: 10 }}>Event Type</th>
                        <th style={{ padding: 10 }}>तपशील (Event Details)</th>
                        <th style={{ padding: 10 }}>मॉड्यूल (Module)</th>
                        <th style={{ padding: 10 }}>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityStream.map(act => (
                        <tr key={act.id} style={{ borderBottom: `1px solid ${S.cardSoft}` }}>
                          <td style={{ padding: 10, fontWeight: 800, fontFamily: 'monospace', color: S.saffron }}>{act.time}</td>
                          <td style={{ padding: 10, fontWeight: 700, color: S.deep }}>{act.actor}</td>
                          <td style={{ padding: 10 }}><Badge tone="saffron">{act.type}</Badge></td>
                          <td style={{ padding: 10 }}>{act.details}</td>
                          <td style={{ padding: 10, fontWeight: 700 }}>{act.module}</td>
                          <td style={{ padding: 10, fontSize: '0.8rem', color: S.muted, fontFamily: 'monospace' }}>{act.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

            </div>
          )}

        </main>
      </div>

      {/* ============================================================
         CRUD DYNAMIC MODALS FOR ALL ENTITIES
         ============================================================ */}
      {activeModal && (
        <Modal title={editingItem ? `✏️ Edit Record (${editingItem.id || editingItem.code})` : `➕ Create New ${activeModal.toUpperCase()}`} onClose={() => setActiveModal(null)}>
          <form onSubmit={handleSaveModalRecord}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>नाव / शीर्षक (Name/Title)</label>
              <input
                type="text"
                required
                defaultValue={editingItem?.name || editingItem?.title || editingItem?.candidate || editingItem?.desc || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value, title: e.target.value, candidate: e.target.value, desc: e.target.value })}
                style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box' }}
              />
            </div>

            {activeModal === 'user' && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>मोबाईल नंबर (Mobile Number)</label>
                  <input
                    type="text"
                    required
                    defaultValue={editingItem?.mobile || '+91 '}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>ईमेल आयडी (Email Address)</label>
                  <input
                    type="email"
                    required
                    defaultValue={editingItem?.email || 'user@connectmaratha.org'}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>नियुक्त प्रशासकीय पदभार (Assign Primary Role)</label>
                  <select
                    defaultValue={editingItem?.role || 'District Coordinator'}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box', background: S.cardSoft, fontWeight: 700 }}
                  >
                    <option value="Super Admin">सर्वोच्च प्रशासक (Super Admin)</option>
                    <option value="CEO (कार्याध्यक्ष)">कार्याध्यक्ष / राज्य अध्यक्ष (CEO)</option>
                    <option value="State Secretary">राज्य सचिव (State Secretary)</option>
                    <option value="District Coordinator">जिल्हा समन्वयक (District Coordinator)</option>
                    <option value="Taluka Lead">तालुका अध्यक्ष (Taluka Lead)</option>
                    <option value="Chapter Head">चॅप्टर प्रमुख (Chapter Head)</option>
                    <option value="General Member">सर्वसामान्य सभासद (General Member)</option>
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>नियुक्त परमिशन सेट (Assign Permission Rule)</label>
                  <select
                    defaultValue={editingItem?.permissions || '✅ District User CRUD + KYC Review'}
                    onChange={e => setFormData({ ...formData, permissions: e.target.value })}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box', background: S.cardSoft, fontWeight: 700 }}
                  >
                    <option value="✅ Full System Control (Super Admin)">✅ Full System Control (Super Admin)</option>
                    <option value="👁️ Strategic Read + Regional Approval">👁️ Strategic Read + Regional Approval (CEO)</option>
                    <option value="✅ District User CRUD + KYC Review">✅ District User CRUD + KYC Review (District Admin)</option>
                    <option value="✅ Taluka Scope Access">✅ Taluka Scope Access (Taluka Lead)</option>
                    <option value="👁️ Chapter Members View">👁️ Chapter Members View (Chapter Head)</option>
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>क्षेत्र / जिल्हा (Geography)</label>
                  <input
                    type="text"
                    required
                    defaultValue={editingItem?.geography || 'पुणे (हवेली)'}
                    onChange={e => setFormData({ ...formData, geography: e.target.value })}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>KYC स्थिती (KYC Status)</label>
                  <select
                    defaultValue={editingItem?.kyc || 'Verified'}
                    onChange={e => setFormData({ ...formData, kyc: e.target.value })}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box' }}
                  >
                    <option value="Verified">Verified (प्रमाणित)</option>
                    <option value="Pending">Pending (लंबित)</option>
                    <option value="Suspended">Suspended (निलंबित)</option>
                  </select>
                </div>
              </>
            )}

            {activeModal === 'b2b' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>मूल्य (₹ Cr)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  defaultValue={editingItem?.valueCr || ''}
                  onChange={e => setFormData({ ...formData, valueCr: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box' }}
                />
              </div>
            )}

            {activeModal === 'finance' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>रक्कम (Amount)</label>
                <input
                  type="text"
                  required
                  defaultValue={editingItem?.amount || ''}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box' }}
                />
              </div>
            )}

            {activeModal === 'setting' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>व्हॅल्यू (Setting Value)</label>
                <input
                  type="text"
                  required
                  defaultValue={editingItem?.value || ''}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box' }}
                />
              </div>
            )}

            {activeModal === 'permission' && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>Role Code</label>
                  <input
                    type="text"
                    required
                    defaultValue={editingItem?.roleCode || ''}
                    onChange={e => setFormData({ ...formData, roleCode: e.target.value })}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>User CRUD Level</label>
                  <input
                    type="text"
                    required
                    defaultValue={editingItem?.userCrud || '✅ Full Access'}
                    onChange={e => setFormData({ ...formData, userCrud: e.target.value })}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>Geography Scope</label>
                  <select
                    defaultValue={editingItem?.geoScope || 'Statewide'}
                    onChange={e => setFormData({ ...formData, geoScope: e.target.value })}
                    style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${S.border}`, boxSizing: 'border-box' }}
                  >
                    <option value="Statewide">Statewide</option>
                    <option value="District Only">District Only</option>
                    <option value="Taluka Only">Taluka Only</option>
                    <option value="Chapter Only">Chapter Only</option>
                  </select>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <Btn variant="ghost" type="button" onClick={() => setActiveModal(null)}>Cancel</Btn>
              <Btn variant="primary" type="submit">Save Record (जतन करा)</Btn>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
