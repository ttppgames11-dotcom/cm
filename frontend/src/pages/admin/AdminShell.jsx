// src/pages/admin/AdminShell.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../services/adminApi';
import {
  REFERRAL_BANDS,
  DEPARTMENT_WINGS,
  ADMINISTRATIVE_TIERS,
  MASTER_ROLES,
  evaluateCandidateEligibility
} from '../../data/rolesMatrixData';

// Import Non-Reusable Full Module Reports
import UsersFullReport from './reports/UsersFullReport';
import KYCFullReport from './reports/KYCFullReport';
import BusinessFullReport from './reports/BusinessFullReport';
import B2BReferralFullReport from './reports/B2BReferralFullReport';
import BloodHelpFullReport from './reports/BloodHelpFullReport';
import TicketFullReport from './reports/TicketFullReport';
import EventsFullReport from './reports/EventsFullReport';
import ContentFullReport from './reports/ContentFullReport';

/* ============================================================
   STYLE TOKENS
   ============================================================ */
const T = {
  bg: '#FFFDF9',
  panel: '#FFFFFF',
  softBg: '#FFF7ED',
  border: '#FED7AA',
  saffron: '#EA580C',
  amber: '#D97706',
  deep: '#C2410C',
  ink: '#431407',
  text: '#1E293B',
  muted: '#64748B',
  green: '#16A34A',
  red: '#DC2626',
  gradient: 'linear-gradient(135deg, #EA580C, #D97706)'
};

/* ============================================================
   NAVIGATION DEFINITION (7 groups, all modules)
   ============================================================ */
const NAV_GROUPS = [
  { id: 'command', label: 'Command Center', icon: '📊', items: [
    { path: '/admin', label: 'Dashboard', icon: '🏠', exact: true },
    { path: '/admin/approvals', label: 'Approvals', icon: '✅' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' }
  ]},
  { id: 'full_reports', label: '📊 Full Reports (अहवाल)', icon: '📈', items: [
    { path: '/admin/users/report', label: '👥 Users Report', icon: '👥' },
    { path: '/admin/kyc/report', label: '🔐 KYC Report', icon: '🔐' },
    { path: '/admin/business/report', label: '🏢 Business Report', icon: '🏢' },
    { path: '/admin/b2b/referrals/report', label: '🤝 B2B CRM Report', icon: '🤝' },
    { path: '/admin/seva/report', label: '🩸 Blood & Seva Report', icon: '🩸' },
    { path: '/admin/tickets/report', label: '🎫 Ticket Report', icon: '🎫' },
    { path: '/admin/events/report', label: '📅 Event Report', icon: '📅' },
    { path: '/admin/content/report', label: '📚 Content CMS Report', icon: '📚' }
  ]},
  { id: 'people', label: 'People', icon: '👥', items: [
    { path: '/admin/members', label: 'Members & KYC', icon: '👤' },
    { path: '/admin/leads', label: 'Leads Pipeline', icon: '🎯' },
    { path: '/admin/businesses', label: 'Businesses', icon: '💼' },
    { path: '/admin/referrals', label: 'B2B Referrals', icon: '🤝' },
    { path: '/admin/chapters', label: 'Chapters', icon: '📍' },
    { path: '/admin/admins', label: 'Admin Users', icon: '🛡️' }
  ]},
  { id: 'content', label: 'Content & Knowledge', icon: '📚', items: [
    { path: '/admin/articles', label: 'Articles', icon: '📝' },
    { path: '/admin/history', label: 'History', icon: '📜' },
    { path: '/admin/forts', label: 'Forts', icon: '🏰' },
    { path: '/admin/temples', label: 'Temples', icon: '🛕' },
    { path: '/admin/personalities', label: 'Personalities', icon: '👑' },
    { path: '/admin/media', label: 'Media Library', icon: '🖼️' }
  ]},
  { id: 'engagement', label: 'Engagement', icon: '🎯', items: [
    { path: '/admin/events', label: 'Events', icon: '📅' },
    { path: '/admin/campaigns', label: 'Campaigns', icon: '📣' },
    { path: '/admin/communication', label: 'Communication', icon: '💬' }
  ]},
  { id: 'ops', label: 'Operations', icon: '⚙️', items: [
    { path: '/admin/workflows', label: 'Workflows', icon: '🔄' },
    { path: '/admin/tickets', label: 'Complaints', icon: '🎫' },
    { path: '/admin/seva', label: 'Blood Helpdesk', icon: '🩸' },
    { path: '/admin/reports', label: 'Reports Overview', icon: '📊' }
  ]},
  { id: 'system', label: 'System', icon: '🔒', items: [
    { path: '/admin/master-data', label: 'Master Data', icon: '🗃️' },
    { path: '/admin/roles-matrix', label: 'संरचना व पद मॅट्रिक्स', icon: '🏛️' },
    { path: '/admin/roles', label: 'Roles & Permissions', icon: '🔑' },
    { path: '/admin/audit', label: 'Audit Logs', icon: '🛡️' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
  ]}
];

/* ============================================================
   REUSABLE UI COMPONENTS
   ============================================================ */
const Card = ({ children, style }) => (
  <div style={{
    background: T.panel, border: `1px solid ${T.border}`,
    borderRadius: 12, padding: 16,
    boxShadow: '0 4px 15px rgba(234,88,12,0.06)', ...style
  }}>{children}</div>
);

const Btn = ({ children, variant = 'primary', onClick, style, ...rest }) => {
  const variants = {
    primary: { background: T.gradient, color: '#fff', border: 'none' },
    ghost: { background: T.softBg, color: T.saffron, border: `1px solid ${T.saffron}` },
    plain: { background: T.panel, color: T.ink, border: `1px solid ${T.border}` },
    danger: { background: '#FEE2E2', color: T.red, border: '1px solid #FCA5A5' },
    success: { background: '#DCFCE7', color: T.green, border: '1px solid #86EFAC' }
  };
  return (
    <button onClick={onClick} {...rest} style={{
      padding: '8px 14px', borderRadius: 8, fontSize: '0.78rem',
      fontWeight: 800, cursor: 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 6,
      ...variants[variant], ...style
    }}>{children}</button>
  );
};

const Input = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    {label && <label style={{ fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>{label}</label>}
    <input {...props} style={{
      width: '100%', padding: '8px 12px', borderRadius: 6,
      background: T.softBg, border: `1px solid ${T.border}`,
      color: T.text, fontSize: '0.82rem', fontWeight: 600,
      outline: 'none', boxSizing: 'border-box', ...props.style
    }} />
  </div>
);

const Select = ({ label, options = [], ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    {label && <label style={{ fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>{label}</label>}
    <select {...props} style={{
      width: '100%', padding: '8px 12px', borderRadius: 6,
      background: T.softBg, border: `1px solid ${T.border}`,
      color: T.text, fontSize: '0.82rem', fontWeight: 700,
      outline: 'none', cursor: 'pointer', boxSizing: 'border-box'
    }}>
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  </div>
);

const Badge = ({ children, tone = 'saffron' }) => {
  const tones = {
    saffron: { bg: '#FFEDD5', fg: T.deep, bd: T.border },
    green: { bg: '#ECFDF5', fg: '#059669', bd: '#A7F3D0' },
    red: { bg: '#FEE2E2', fg: T.red, bd: '#FCA5A5' },
    gray: { bg: '#F1F5F9', fg: '#475569', bd: '#CBD5E1' }
  };
  const t = tones[tone];
  return (
    <span style={{
      background: t.bg, color: t.fg, border: `1px solid ${t.bd}`,
      padding: '2px 8px', borderRadius: 4,
      fontSize: '0.68rem', fontWeight: 800,
      display: 'inline-block'
    }}>{children}</span>
  );
};

const KPI = ({ label, value, sub, icon, color = T.saffron }) => (
  <Card style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.75rem', color: T.ink, fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '1.7rem', fontWeight: 900, color, letterSpacing: -0.5 }}>
      {value}
    </div>
    <div style={{ fontSize: '0.72rem', color: T.muted, fontWeight: 600 }}>{sub}</div>
  </Card>
);

const Table = ({ headers, rows, onRowClick }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
      <thead>
        <tr style={{ background: T.softBg, borderBottom: `1px solid ${T.border}`, color: T.deep, fontWeight: 800 }}>
          {headers.map((h, i) => (
            <th key={i} style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={headers.length} style={{ padding: 32, textAlign: 'center', color: T.muted, fontWeight: 600 }}>
              कोणत्याही नोंदी नाहीत
            </td>
          </tr>
        )}
        {rows.map((row, ri) => (
          <tr key={ri} onClick={() => onRowClick?.(row)}
              style={{ borderBottom: `1px solid ${T.border}`, cursor: onRowClick ? 'pointer' : 'default' }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{ padding: '12px 16px' }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Modal = ({ title, children, onClose, width = 500 }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)', zIndex: 9999,
    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20
  }}>
    <div style={{
      background: T.panel, border: `2px solid ${T.saffron}`,
      borderRadius: 16, padding: 24, width: '100%', maxWidth: width,
      boxShadow: '0 20px 50px rgba(234,88,12,0.25)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: `1px solid ${T.border}`, paddingBottom: 10 }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: T.ink }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: T.saffron, fontSize: '1.2rem', cursor: 'pointer', fontWeight: 900 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const SectionTitle = ({ children, subtitle }) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: T.ink }}>{children}</h2>
    {subtitle && <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: T.muted, fontWeight: 600 }}>{subtitle}</p>}
  </div>
);

/* ============================================================
   MAIN ADMIN SHELL
   ============================================================ */
export default function AdminShell() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({
    command: true, people: true, content: false, engagement: false, ops: false, system: false
  });
  const [toast, setToast] = useState(null);

  // Global data (shared across views with robust fallback datasets)
  const defaultUsers = [
    { id: 'CM-MH-9876543210', name: 'अमोल तुकाराम जाधव', phone: '+91 98220 11924', district: 'पुणे (हवेली)', profession: 'उद्योगपती (IT)', verified: true, referralCount: 12450 },
    { id: 'CM-MH-4458129012', name: 'प्रियंका सुरेश शिर्के', phone: '+91 98221 44589', district: 'सातारा (कराड)', profession: 'शिक्षिका / समाजसेवी', verified: true, referralCount: 18200 },
    { id: 'CM-MH-7712398451', name: 'निलेश भगवान देशमुख', phone: '+91 98901 23456', district: 'नाशिक (मालेगाव)', profession: 'कृषी व्यावसायिक', verified: false, referralCount: 15600 },
    { id: 'CM-MH-1102938475', name: 'विक्रम संभाजी शेलार', phone: '+91 97654 32109', district: 'कोल्हापूर (कागल)', profession: 'बांधकाम व्यावसायिक', verified: true, referralCount: 8900 },
    { id: 'CM-MH-5564738291', name: 'प्रणाली दादासाहेब देसाई', phone: '+91 94220 98765', district: 'मुंबई (दादर)', profession: 'वकील (High Court)', verified: false, referralCount: 4200 },
    { id: 'CM-MH-8899001122', name: 'महेश आनंदा भोसले', phone: '+91 91580 44332', district: 'छत्रपती संभाजीनगर', profession: 'हॉटेल व्यावसायिक', verified: true, referralCount: 9400 },
    { id: 'CM-MH-3344556677', name: 'सुरेश भगवान मोहिते', phone: '+91 98233 44556', district: 'सोलापूर (उत्तर)', profession: 'कापड व्यापारी', verified: true, referralCount: 6700 },
    { id: 'CM-MH-9988776655', name: 'राजेश सर्जेराव कदम', phone: '+91 94211 22334', district: 'सांगली (मिरज)', profession: 'दूध संघ संचालक', verified: true, referralCount: 11200 }
  ];

  const defaultLeads = [
    { id: 'LD-01', name: 'राजेश निंबाळकर (सौर ऊर्जा प्रकल्प)', phone: '+91 98224 88776', stage: 'new' },
    { id: 'LD-02', name: 'सोमनाथ जगताप (कोल्ड स्टोरेज नेटवर्किंग)', phone: '+91 97631 22334', stage: 'contacted' },
    { id: 'LD-03', name: 'सचिन कदम (ऑटोमोबाईल पार्ट पुरवठा)', phone: '+91 98900 11223', stage: 'qualified' },
    { id: 'LD-04', name: 'मंगेश जगदाळे (कापड निर्यात करार)', phone: '+91 94235 66778', stage: 'meeting' },
    { id: 'LD-05', name: 'गणेश पवार (दूध संकलन क्लस्टर)', phone: '+91 98500 55443', stage: 'converted' }
  ];

  const defaultBusinesses = [
    { name: 'जाधव आयटी सोल्युशन्स प्रायव्हेट लिमिटेड', owner: 'अमोल तुकाराम जाधव', category: 'माहिती तंत्रज्ञान (IT)', district: 'पुणे', verified: true },
    { name: 'शिर्के टेक्स्टाईल्स व गारमेंट्स', owner: 'सुरेश शिर्के', category: 'कापड उद्योग', district: 'सातारा', verified: true },
    { name: 'देशमुख ऑरगॅनिक ॲग्रो एक्सपोर्ट्स', owner: 'निलेश देशमुख', category: 'कृषी व प्रक्रिया', district: 'नाशिक', verified: true },
    { name: 'शेलार इन्फ्रास्ट्रक्चर अँड डेव्हलपर्स', owner: 'विक्रम शेलार', category: 'बांधकाम व रिअल इस्टेट', district: 'कोल्हापूर', verified: true },
    { name: 'भोसले हॉस्पिटॅलिटी अँड रिसॉर्ट्स', owner: 'महेश भोसले', category: 'हॉटेल व पर्यटन', district: 'छत्रपती संभाजीनगर', verified: false },
    { name: 'मोहिते सिल्क मिल', owner: 'सुरेश मोहिते', category: 'कापड निर्मिती', district: 'सोलापूर', verified: true }
  ];

  const defaultReferrals = [
    { id: 'REF-MH-101', title: 'सॉफ्टवेअर विकास व ERP कंत्राट', value: 450000, giverName: 'अमोल जाधव (पुणे)', receiverName: 'विक्रम शेलार (कोल्हापूर)', createdAt: new Date() },
    { id: 'REF-MH-102', title: '५० टन ऑरगॅनिक फळे पुरवठा', value: 280000, giverName: 'निलेश देशमुख (नाशिक)', receiverName: 'महेश भोसले (संभाजीनगर)', createdAt: new Date() },
    { id: 'REF-MH-103', title: 'रिसॉर्ट इंटीरिअर डिझायनिंग कंत्राट', value: 850000, giverName: 'सुरेश शिर्के (सातारा)', receiverName: 'अमोल जाधव (पुणे)', createdAt: new Date() },
    { id: 'REF-MH-104', title: 'व्यावसायिक गार्मेंट्स बल्क ऑर्डर', value: 320000, giverName: 'सुरेश मोहिते (सोलापूर)', receiverName: 'सुरेश शिर्के (सातारा)', createdAt: new Date() }
  ];

  const defaultArticles = [
    { id: 'art-1', title: 'मराठा साम्राज्य इतिहास व प्रशासकीय व्यवस्था', status: 'published' },
    { id: 'art-2', title: 'शिवछत्रपतींचे दुर्ग संवर्धन व जलव्यवस्थापन सिद्धांत', status: 'published' },
    { id: 'art-3', title: 'मराठा उद्योजकतेची नवी पहाट: B2B नेटवर्किंग मार्गदर्शन', status: 'published' },
    { id: 'art-4', title: 'तरुणांसाठी डिजिटल कौशल्ये व रोजगार संधी', status: 'draft' }
  ];

  const defaultHistory = [
    { id: 'his-1', title: 'पावनखिंडीचा अमर संग्राम व बाजीप्रभू देशपांडे पराक्रम', status: 'published' },
    { id: 'his-2', title: 'छत्रपती शिवाजी महाराज शिवराज्याभिषेक सोहळा (१६७४)', status: 'published' },
    { id: 'his-3', title: 'पानिपतचा तिसरा संग्राम व मराठा शौर्यगाथा', status: 'published' },
    { id: 'his-4', title: 'मराठा आरमाराची स्थापना व कान्होजी आंग्रे यांचे योगदान', status: 'published' }
  ];

  const defaultForts = [
    { id: 'frt-1', title: 'किल्ले रायगड — स्वराज्याची राजधानी', status: 'published' },
    { id: 'frt-2', title: 'किल्ले राजगड — स्वराज्याची पहिली राजधानी', status: 'published' },
    { id: 'frt-3', title: 'किल्ले सिंहगड — नरवीर तानाजी मालुसरे स्मृती', status: 'published' },
    { id: 'frt-4', title: 'किल्ले प्रतापगड — अफझलखान वध रणसंग्राम', status: 'published' },
    { id: 'frt-5', title: 'जलदुर्ग सिंधुदुर्ग — छत्रपती शिवरायांचे जलसेना केंद्र', status: 'published' }
  ];

  const defaultTemples = [
    { id: 'tmp-1', title: 'श्री तुळजाभवानी मंदिर — तुळजापूर (कुलस्वामिनी)', status: 'published' },
    { id: 'tmp-2', title: 'श्री महालक्ष्मी मंदिर — कोल्हापूर (करवीर निवासिनी)', status: 'published' },
    { id: 'tmp-3', title: 'श्री खंडोबा देवस्थान — जेजुरी (गडकोटाचा राजा)', status: 'published' },
    { id: 'tmp-4', title: 'श्री त्र्यंबकेश्वर जोतीर्लिंग मंदिर — नाशिक', status: 'published' },
    { id: 'tmp-5', title: 'श्री घृष्णेश्वर ज्योतिर्लिंग मंदिर — संभाजीनगर', status: 'published' }
  ];

  const defaultPersonalities = [
    { id: 'per-1', title: 'छत्रपती शिवाजी महाराज (संस्थापक, स्वराज्य)', status: 'published' },
    { id: 'per-2', title: 'छत्रपती संभाजी महाराज (धर्मवीर, धर्मरक्षक)', status: 'published' },
    { id: 'per-3', title: 'राष्ट्रमाता राजमाता जिजाऊ माँसाहेब', status: 'published' },
    { id: 'per-4', title: 'राजर्षी छत्रपती शाहू महाराज (आरक्षणाचे जनक)', status: 'published' },
    { id: 'per-5', title: 'सेनापती बाजीप्रभू देशपांडे (नरवीर)', status: 'published' },
    { id: 'per-6', title: 'पुण्यश्लोक अहिल्यादेवी होळकर', status: 'published' }
  ];

  const defaultMedia = [
    { id: 'med-1', name: 'raigad_fort_hd.jpg', type: 'image' },
    { id: 'med-2', name: 'shivaji_maharaj_coronation.png', type: 'image' },
    { id: 'med-3', name: 'maratha_business_summit_2026.mp4', type: 'video' },
    { id: 'med-4', name: 'connect_maratha_constitution.pdf', type: 'pdf' },
    { id: 'med-5', name: 'b2b_referral_guidelines.pdf', type: 'pdf' },
    { id: 'med-6', name: 'mahajagruthi_banner.png', type: 'image' }
  ];

  const defaultEvents = [
    { id: 'ev-1', title: 'जागतिक मराठी उद्योजक परिषद २०२६', date: '२०२६-१०-१५', venue: 'बालेवाडी क्रीडा संकुल, पुणे' },
    { id: 'ev-2', title: 'महाराष्ट्रातील प्रमुख गडकोट संवर्धन मोहीम', date: '२०२६-१०-२८', venue: 'किल्ले रायगड परिसर' },
    { id: 'ev-3', title: 'मराठा वधू-वर परिचय मेळावा', date: '२०२६-११-०५', venue: 'सैनिक शाळा मैदान, सातारा' },
    { id: 'ev-4', title: 'B2B बिझनेस नेटवर्किंग अँड एक्स्पो', date: '२०२६-११-२०', venue: 'सिडको प्रदर्शन केंद्र, नवी मुंबई' }
  ];

  const defaultTickets = [
    { id: 'TCK-8801', subject: 'प्रोफाईल मधील व्यावसायिक श्रेणी अद्ययावत होत नाही', priority: 'high', status: 'open', category: 'Technical' },
    { id: 'TCK-8802', subject: 'KYC दस्तऐवज पडताळणी प्रलंबित तक्रार', priority: 'normal', status: 'in-progress', category: 'KYC' },
    { id: 'TCK-8803', subject: 'B2B रेफरल क्रेडिट न मिळाल्याची नोंद', priority: 'normal', status: 'resolved', category: 'Referral' },
    { id: 'TCK-8804', subject: 'नवीन शाखा सदस्य नोंदणी संदर्भात शंका', priority: 'high', status: 'open', category: 'General' }
  ];

  const defaultBlood = [
    { id: 'BLD-101', patientName: 'सुनील तानाजी पवार', bloodGroup: 'A+ve', hospital: 'दीनानाथ मंगेशकर हॉस्पिटल, पुणे', city: 'पुणे', contactNumber: '+91 98220 55443', units: 2, status: 'Urgent' },
    { id: 'BLD-102', patientName: 'रेश्मा सुरेश निंबाळकर', bloodGroup: 'O-ve', hospital: 'जिल्हा सरकारी रुग्णालय, सातारा', city: 'सातारा', contactNumber: '+91 98221 66778', units: 3, status: 'Fulfilled' },
    { id: 'BLD-103', patientName: 'गणेश आनंदा भोसले', bloodGroup: 'B+ve', hospital: 'घाटी रुग्णालय, छत्रपती संभाजीनगर', city: 'संभाजीनगर', contactNumber: '+91 91580 99887', units: 1, status: 'Pending' }
  ];

  const defaultAudit = [
    { action: 'LOGIN_SUCCESS', performedBy: 'Super Admin Central', module: 'Auth', timestamp: new Date() },
    { action: 'KYC_APPROVED', performedBy: 'अमोल जाधव (Division Admin)', module: 'KYC', timestamp: new Date(Date.now() - 3600000 * 2) },
    { action: 'ROLE_APPOINTED', performedBy: 'Super Admin Central', module: 'Roles Matrix', timestamp: new Date(Date.now() - 3600000 * 5) },
    { action: 'BUSINESS_VERIFIED', performedBy: 'राजेश निंबाळकर (District Admin)', module: 'Businesses', timestamp: new Date(Date.now() - 3600000 * 12) },
    { action: 'CHAPTER_CREATED', performedBy: 'Super Admin Central', module: 'Chapters', timestamp: new Date(Date.now() - 3600000 * 24) }
  ];

  const [data, setData] = useState({
    metrics: {},
    users: defaultUsers,
    leads: defaultLeads,
    businesses: defaultBusinesses,
    referrals: defaultReferrals,
    content: {
      articles: defaultArticles,
      history: defaultHistory,
      forts: defaultForts,
      temples: defaultTemples,
      personalities: defaultPersonalities
    },
    media: defaultMedia,
    events: defaultEvents,
    campaigns: [],
    tickets: defaultTickets,
    workflows: [],
    blood: defaultBlood,
    audit: defaultAudit,
    roles: []
  });
  const [loading, setLoading] = useState(true);

  const toast$ = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ---- Load everything once ----
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [
          metrics, users, leads, businesses, referrals,
          articles, history, forts, temples, personalities,
          media, events, campaigns, tickets, workflows,
          blood, audit, roles
        ] = await Promise.all([
          adminApi.getMetrics().catch(() => null),
          adminApi.getMembers().catch(() => null),
          adminApi.getLeads().catch(() => null),
          adminApi.getBusinesses().catch(() => null),
          adminApi.getReferrals().catch(() => null),
          adminApi.getContent('articles').catch(() => null),
          adminApi.getContent('history').catch(() => null),
          adminApi.getContent('forts').catch(() => null),
          adminApi.getContent('temples').catch(() => null),
          adminApi.getContent('personalities').catch(() => null),
          adminApi.getMedia().catch(() => null),
          adminApi.getEvents().catch(() => null),
          adminApi.getCampaigns().catch(() => null),
          adminApi.getTickets().catch(() => null),
          adminApi.getWorkflows().catch(() => null),
          adminApi.getBloodRequests().catch(() => null),
          adminApi.getAuditLogs().catch(() => null),
          adminApi.getRoles().catch(() => null)
        ]);

        const fetchedUsers = Array.isArray(users) ? users : users?.users;
        const fetchedArticles = Array.isArray(articles) ? articles : null;
        const fetchedHistory = Array.isArray(history) ? history : null;
        const fetchedForts = Array.isArray(forts) ? forts : null;
        const fetchedTemples = Array.isArray(temples) ? temples : null;
        const fetchedPersonalities = Array.isArray(personalities) ? personalities : null;

        setData({
          metrics: metrics || {},
          users: (fetchedUsers && fetchedUsers.length > 0) ? fetchedUsers : defaultUsers,
          leads: (Array.isArray(leads) && leads.length > 0) ? leads : defaultLeads,
          businesses: (Array.isArray(businesses) && businesses.length > 0) ? businesses : defaultBusinesses,
          referrals: (Array.isArray(referrals) && referrals.length > 0) ? referrals : defaultReferrals,
          content: {
            articles: (fetchedArticles && fetchedArticles.length > 0) ? fetchedArticles : defaultArticles,
            history: (fetchedHistory && fetchedHistory.length > 0) ? fetchedHistory : defaultHistory,
            forts: (fetchedForts && fetchedForts.length > 0) ? fetchedForts : defaultForts,
            temples: (fetchedTemples && fetchedTemples.length > 0) ? fetchedTemples : defaultTemples,
            personalities: (fetchedPersonalities && fetchedPersonalities.length > 0) ? fetchedPersonalities : defaultPersonalities
          },
          media: (Array.isArray(media) && media.length > 0) ? media : defaultMedia,
          events: (Array.isArray(events) && events.length > 0) ? events : defaultEvents,
          campaigns: Array.isArray(campaigns) ? campaigns : [],
          tickets: (Array.isArray(tickets) && tickets.length > 0) ? tickets : defaultTickets,
          workflows: Array.isArray(workflows) ? workflows : [],
          blood: (Array.isArray(blood) && blood.length > 0) ? blood : defaultBlood,
          audit: (Array.isArray(audit) && audit.length > 0) ? audit : defaultAudit,
          roles: Array.isArray(roles) ? roles : []
        });
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleGroup = (id) =>
    setOpenGroups(p => ({ ...p, [id]: !p[id] }));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg, color: T.text, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 10000,
          background: toast.type === 'error' ? T.red : T.saffron,
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(234,88,12,0.35)',
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: '0.85rem', fontWeight: 700
        }}>
          <span>🚩</span><span>{toast.msg}</span>
        </div>
      )}

      {/* ============== SIDEBAR ============== */}
      <aside style={{
        width: collapsed ? 68 : 270,
        background: T.panel, borderRight: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        transition: 'width .2s ease',
        boxShadow: '2px 0 10px rgba(234,88,12,0.04)', zIndex: 40
      }}>
        {/* Brand */}
        <div style={{
          padding: '16px', borderBottom: `1px solid ${T.border}`,
          background: T.softBg, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: T.gradient, color: '#fff',
            display: 'grid', placeItems: 'center',
            fontSize: '1.2rem', fontWeight: 900,
            boxShadow: '0 2px 8px rgba(234,88,12,0.35)', flexShrink: 0
          }}>🚩</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: T.ink, whiteSpace: 'nowrap' }}>
                CONNECT MARATHA
              </div>
              <div style={{ fontSize: '0.62rem', color: T.saffron, fontWeight: 800, letterSpacing: 1 }}>
                ADMIN CONSOLE
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              marginLeft: 'auto', background: T.panel,
              border: `1px solid ${T.border}`, color: T.saffron,
              width: 26, height: 26, borderRadius: 6,
              display: 'grid', placeItems: 'center',
              cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem'
            }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Super Admin badge */}
        {!collapsed && (
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{
              background: T.softBg, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: 10
            }}>
              <Badge>👑 ALL ACCESS</Badge>
              <div style={{ fontSize: '0.68rem', color: T.deep, fontWeight: 700, marginTop: 6, lineHeight: 1.4 }}>
                सर्व ३६ जिल्हे, वापरकर्ते, व्यवसाय, CMS व सुरक्षा नियंत्रण
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {NAV_GROUPS.map(g => (
            <div key={g.id} style={{ marginBottom: 4 }}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(g.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: 'transparent', border: 'none',
                    padding: '8px 10px', cursor: 'pointer',
                    fontSize: '0.68rem', fontWeight: 900,
                    color: T.deep, letterSpacing: 0.5,
                    textTransform: 'uppercase',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                  <span>{g.icon}</span>
                  <span style={{ flex: 1 }}>{g.label}</span>
                  <span style={{ fontSize: '0.6rem' }}>{openGroups[g.id] ? '▾' : '▸'}</span>
                </button>
              )}
              {(collapsed || openGroups[g.id]) && g.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', margin: '2px 4px',
                    borderRadius: 8, textDecoration: 'none',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 800 : 600,
                    background: isActive ? T.softBg : 'transparent',
                    color: isActive ? T.saffron : '#475569',
                    border: isActive ? `1px solid ${T.border}` : '1px solid transparent',
                    transition: 'all 0.12s'
                  })}>
                  <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '12px 14px', borderTop: `1px solid ${T.border}`,
          background: T.softBg, display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: T.gradient, color: '#fff',
            display: 'grid', placeItems: 'center',
            fontWeight: 900, fontSize: '0.75rem', flexShrink: 0
          }}>AD</div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: T.ink, whiteSpace: 'nowrap' }}>
                {user?.name || 'केंद्रीय ॲडमिन'}
              </div>
              <div style={{ fontSize: '0.65rem', color: T.green, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green }} />
                ऑनलाईन
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ============== MAIN ============== */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar navigate={navigate} toast={toast$} />
        <main style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
          {loading ? (
            <Card style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: T.saffron }}>
                ⏳ डेटा लोड होत आहे...
              </div>
            </Card>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard data={data} navigate={navigate} />} />

              {/* Full Module Reports */}
              <Route path="/users/report" element={<UsersFullReport />} />
              <Route path="/kyc/report" element={<KYCFullReport />} />
              <Route path="/business/report" element={<BusinessFullReport />} />
              <Route path="/b2b/referrals/report" element={<B2BReferralFullReport />} />
              <Route path="/seva/report" element={<BloodHelpFullReport />} />
              <Route path="/tickets/report" element={<TicketFullReport />} />
              <Route path="/events/report" element={<EventsFullReport />} />
              <Route path="/content/report" element={<ContentFullReport />} />

              <Route path="/members" element={<MembersView data={data} setData={setData} toast={toast$} />} />
              <Route path="/leads" element={<LeadsView data={data} toast={toast$} />} />
              <Route path="/businesses" element={<BusinessesView data={data} />} />
              <Route path="/referrals" element={<ReferralsView data={data} setData={setData} toast={toast$} />} />
              <Route path="/chapters" element={<ChaptersView toast={toast$} />} />
              <Route path="/admins" element={<AdminUsersView toast={toast$} />} />

              <Route path="/articles" element={<ContentView type="articles" data={data} toast={toast$} />} />
              <Route path="/history" element={<ContentView type="history" data={data} toast={toast$} />} />
              <Route path="/forts" element={<ContentView type="forts" data={data} toast={toast$} />} />
              <Route path="/temples" element={<ContentView type="temples" data={data} toast={toast$} />} />
              <Route path="/personalities" element={<ContentView type="personalities" data={data} toast={toast$} />} />
              <Route path="/media" element={<MediaView data={data} toast={toast$} />} />

              <Route path="/events" element={<EventsView data={data} toast={toast$} />} />
              <Route path="/campaigns" element={<CampaignsView data={data} toast={toast$} />} />
              <Route path="/communication" element={<CommunicationView data={data} toast={toast$} />} />

              <Route path="/workflows" element={<WorkflowsView data={data} />} />
              <Route path="/tickets" element={<TicketsView data={data} toast={toast$} />} />
              <Route path="/seva" element={<BloodView data={data} />} />
              <Route path="/reports" element={<ReportsView data={data} />} />
              <Route path="/analytics" element={<ReportsView data={data} />} />
              <Route path="/approvals" element={<ApprovalsView data={data} />} />

              <Route path="/master-data" element={<MasterDataView toast={toast$} />} />
              <Route path="/roles-matrix" element={<RolesMatrixPipelineView data={data} toast={toast$} />} />
              <Route path="/roles" element={<RolesView data={data} toast={toast$} />} />
              <Route path="/audit" element={<AuditView data={data} />} />
              <Route path="/settings" element={<SettingsView toast={toast$} />} />

              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   TOP BAR
   ============================================================ */
function TopBar({ navigate, toast }) {
  const [q, setQ] = useState('');
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 30,
      background: T.panel, borderBottom: `1px solid ${T.border}`,
      padding: '12px 24px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12,
      boxShadow: '0 2px 10px rgba(234,88,12,0.05)'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: T.softBg, border: `1px solid ${T.border}`,
        borderRadius: 8, padding: '8px 14px', flex: 1, maxWidth: 460
      }}>
        <span style={{ color: T.saffron }}>🔍</span>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="सभासद, व्यवसाय, सामग्री शोधा..."
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: T.text, fontSize: '0.82rem', fontWeight: 600, width: '100%'
          }} />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Btn variant="primary" onClick={() => toast('नवीन नोंद तयार करा', 'success')}>
          + नवीन नोंद
        </Btn>
        <Btn variant="plain" onClick={() => window.location.reload()}>🔄 Refresh</Btn>
        <Btn variant="ghost" onClick={() => navigate('/ai')}>🤖 AI</Btn>
      </div>
    </header>
  );
}

/* ============================================================
   1. DASHBOARD — FULL EXECUTIVE COMMAND CENTER (23 SECTIONS)
   ============================================================ */
function Dashboard({ data, navigate }) {
  const m = data.metrics || {};
  const users = data.users || [];
  const businesses = data.businesses || [];
  const referrals = data.referrals || [];
  const blood = data.blood || [];
  const tickets = data.tickets || [];
  const events = data.events || [];
  const contentTotal = (data.content?.articles?.length || 0) + (data.content?.history?.length || 0) + (data.content?.forts?.length || 0) + (data.content?.temples?.length || 0) + (data.content?.personalities?.length || 0);

  const certifiedUsers = users.filter(u => u.verified).length;
  const pendingKyc = users.filter(u => !u.verified).length;
  const activeUsers = users.filter(u => u.status === 'Active' || u.verified).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #431407 0%, #7C2D12 50%, #C2410C 100%)',
        borderRadius: 16, padding: '24px 30px', color: '#FFF',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
        boxShadow: '0 10px 30px rgba(194,65,12,0.25)'
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', color: '#FDBA74' }}>
            CONNECT MARATHA ADMIN COMMAND CENTER
          </span>
          <h1 style={{ margin: '4px 0 0', fontSize: '1.6rem', fontWeight: 900 }}>
            Welcome, Super Admin 👑
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#FED7AA' }}>
            महाराष्ट्र राज्य संघटनात्मक व सेवासंबंधी सर्व ३६ जिल्हे, २८८ विधानसभा व ३५८ तालुक्यांचे केंद्रीय नियंत्रण केंद्र
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', padding: '6px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>
            ⏱️ Last Updated: Today, 03:15 PM
          </span>
          <Btn variant="primary" style={{ background: '#FFF', color: T.saffron, fontWeight: 900 }} onClick={() => navigate('/admin/users/report')}>
            📊 Full MIS Reports →
          </Btn>
        </div>
      </div>

      {/* 2. Executive KPI Cards */}
      <div>
        <div style={{ fontSize: '1rem', fontWeight: 900, color: T.ink, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>📊</span> Executive KPIs (कार्यकारी निर्देशांक)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {/* Card 1: Users */}
          <Card style={{ borderTop: `4px solid ${T.saffron}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: T.ink }}>👥 एकूण सदस्य</span>
              <span style={{ fontSize: '1.2rem' }}>👥</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: T.saffron, margin: '6px 0' }}>
              {(m.totalMembers || users.length || 2540).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', color: T.muted, lineHeight: 1.6 }}>
              <div>• <strong>{certifiedUsers || 1850}</strong> प्रमाणित</div>
              <div>• <strong>{pendingKyc || 690}</strong> प्रलंबित KYC</div>
              <div>• <strong>12</strong> नवीन सदस्य आज</div>
            </div>
            <button onClick={() => navigate('/admin/users/report')} style={{ marginTop: 10, background: 'none', border: 'none', color: T.saffron, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
              View Details →
            </button>
          </Card>

          {/* Card 2: KYC */}
          <Card style={{ borderTop: `4px solid ${T.amber}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: T.ink }}>⏳ प्रलंबित KYC</span>
              <span style={{ fontSize: '1.2rem' }}>🔐</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: T.amber, margin: '6px 0' }}>
              {pendingKyc || 690}
            </div>
            <div style={{ fontSize: '0.72rem', color: T.muted, lineHeight: 1.6 }}>
              <div>• <strong>140</strong> पडताळणी आवश्यक</div>
              <div>• <strong>85</strong> Documents Missing</div>
              <div>• <strong>Avg Time:</strong> 4.2 hrs</div>
            </div>
            <button onClick={() => navigate('/admin/kyc/report')} style={{ marginTop: 10, background: 'none', border: 'none', color: T.amber, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
              Open KYC Queue →
            </button>
          </Card>

          {/* Card 3: Business */}
          <Card style={{ borderTop: `4px solid ${T.deep}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: T.ink }}>🏢 व्यवसाय (Business)</span>
              <span style={{ fontSize: '1.2rem' }}>🏢</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: T.deep, margin: '6px 0' }}>
              {businesses.length || 420}
            </div>
            <div style={{ fontSize: '0.72rem', color: T.muted, lineHeight: 1.6 }}>
              <div>• <strong>380</strong> Verified</div>
              <div>• <strong>40</strong> Pending</div>
              <div>• <strong>18</strong> New This Month</div>
            </div>
            <button onClick={() => navigate('/admin/business/report')} style={{ marginTop: 10, background: 'none', border: 'none', color: T.deep, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
              Business Directory →
            </button>
          </Card>

          {/* Card 4: B2B CRM */}
          <Card style={{ borderTop: `4px solid ${T.green}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: T.ink }}>🤝 B2B Referrals</span>
              <span style={{ fontSize: '1.2rem' }}>🤝</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: T.green, margin: '6px 0' }}>
              {referrals.length || 185}
            </div>
            <div style={{ fontSize: '0.72rem', color: T.muted, lineHeight: 1.6 }}>
              <div>• <strong>45</strong> Converted</div>
              <div>• <strong>₹12,40,000</strong> Business Value</div>
              <div>• <strong>82%</strong> Success Rate</div>
            </div>
            <button onClick={() => navigate('/admin/b2b/referrals/report')} style={{ marginTop: 10, background: 'none', border: 'none', color: T.green, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
              Open B2B CRM →
            </button>
          </Card>

          {/* Card 5: Blood / Seva */}
          <Card style={{ borderTop: `4px solid ${T.red}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: T.ink }}>🩸 24×7 Seva Requests</span>
              <span style={{ fontSize: '1.2rem' }}>🩸</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: T.red, margin: '6px 0' }}>
              {blood.length || 94}
            </div>
            <div style={{ fontSize: '0.72rem', color: T.muted, lineHeight: 1.6 }}>
              <div>• <strong>12</strong> Emergency Open</div>
              <div>• <strong>78</strong> Resolved Today</div>
              <div>• <strong>Donor Match:</strong> 96%</div>
            </div>
            <button onClick={() => navigate('/admin/seva/report')} style={{ marginTop: 10, background: 'none', border: 'none', color: T.red, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
              24×7 Seva Center →
            </button>
          </Card>

          {/* Card 6: Tickets */}
          <Card style={{ borderTop: `4px solid ${T.amber}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: T.ink }}>🎫 तक्रारी / Tickets</span>
              <span style={{ fontSize: '1.2rem' }}>🎫</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: T.amber, margin: '6px 0' }}>
              {tickets.length || 42}
            </div>
            <div style={{ fontSize: '0.72rem', color: T.muted, lineHeight: 1.6 }}>
              <div>• <strong>5</strong> High Priority</div>
              <div>• <strong>2</strong> SLA Breached</div>
              <div>• <strong>35</strong> Resolved</div>
            </div>
            <button onClick={() => navigate('/admin/tickets/report')} style={{ marginTop: 10, background: 'none', border: 'none', color: T.amber, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
              Ticket Management →
            </button>
          </Card>

          {/* Card 7: Events */}
          <Card style={{ borderTop: `4px solid ${T.saffron}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: T.ink }}>📅 कार्यक्रम (Events)</span>
              <span style={{ fontSize: '1.2rem' }}>📅</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: T.saffron, margin: '6px 0' }}>
              {events.length || 28}
            </div>
            <div style={{ fontSize: '0.72rem', color: T.muted, lineHeight: 1.6 }}>
              <div>• <strong>3</strong> Today</div>
              <div>• <strong>8</strong> Upcoming</div>
              <div>• <strong>1,450</strong> Total Registrations</div>
            </div>
            <button onClick={() => navigate('/admin/events/report')} style={{ marginTop: 10, background: 'none', border: 'none', color: T.saffron, fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
              Event Calendar →
            </button>
          </Card>

          {/* Card 8: CMS Content */}
          <Card style={{ borderTop: `4px solid #8B5CF6` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: T.ink }}>📚 Content (CMS)</span>
              <span style={{ fontSize: '1.2rem' }}>📚</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#8B5CF6', margin: '6px 0' }}>
              {contentTotal || 156}
            </div>
            <div style={{ fontSize: '0.72rem', color: T.muted, lineHeight: 1.6 }}>
              <div>• <strong>120</strong> Published</div>
              <div>• <strong>24</strong> Under Review</div>
              <div>• <strong>12</strong> Draft</div>
            </div>
            <button onClick={() => navigate('/admin/content/report')} style={{ marginTop: 10, background: 'none', border: 'none', color: '#8B5CF6', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}>
              CMS Report →
            </button>
          </Card>
        </div>
      </div>

      {/* 3. Geographic Organization Coverage Report */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: T.ink }}>
              🗺️ महाराष्ट्र Organization Coverage (भौगोलिक रचना)
            </div>
            <div style={{ fontSize: '0.75rem', color: T.muted, marginTop: 2 }}>
              State ↓ 6 Divisions ↓ 36 Districts ↓ 358 Talukas ↓ Cities ↓ Wards ↓ Villages ↓ Chapters
            </div>
          </div>
          <Btn variant="ghost" onClick={() => navigate('/admin/chapters')}>View Geographic Command Map →</Btn>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: T.softBg, borderBottom: `1px solid ${T.border}`, color: T.deep, fontWeight: 800 }}>
                <th style={{ padding: '10px 14px' }}>Administrative Level</th>
                <th style={{ padding: '10px 14px' }}>Total Units</th>
                <th style={{ padding: '10px 14px' }}>Active Units</th>
                <th style={{ padding: '10px 14px' }}>Pending Units</th>
                <th style={{ padding: '10px 14px' }}>Coverage (%)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { level: 'Divisions (विभाग)', total: 6, active: 6, pending: 0, coverage: '100%' },
                { level: 'Districts (जिल्हे)', total: 36, active: 34, pending: 2, coverage: '94.4%' },
                { level: 'Talukas (तालुके)', total: 358, active: 280, pending: 78, coverage: '78.2%' },
                { level: 'Cities (शहरे)', total: 120, active: 95, pending: 25, coverage: '79.1%' },
                { level: 'Wards (प्रभाग)', total: 840, active: 610, pending: 230, coverage: '72.6%' },
                { level: 'Villages (गावे)', total: 43000, active: 18200, pending: 24800, coverage: '42.3%' },
                { level: 'Chapters (शाखा)', total: 1250, active: 980, pending: 270, coverage: '78.4%' },
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: T.ink }}>{row.level}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{row.total}</td>
                  <td style={{ padding: '10px 14px', color: '#16A34A', fontWeight: 800 }}>{row.active}</td>
                  <td style={{ padding: '10px 14px', color: T.amber, fontWeight: 600 }}>{row.pending}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, background: '#E2E8F0', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: row.coverage, background: T.saffron, height: '100%' }} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: '0.75rem', color: T.saffron }}>{row.coverage}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. 10-Wing Department Performance & Pending Approvals */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* 10-Wing Department Performance */}
        <Card>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: T.ink, marginBottom: 12 }}>
            🏢 10-Wing Department Performance (१० प्रमुख विभाग)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ background: T.softBg, color: T.deep, fontWeight: 800 }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Department Wing</th>
                  <th style={{ padding: '8px 12px' }}>Members</th>
                  <th style={{ padding: '8px 12px' }}>Activities</th>
                  <th style={{ padding: '8px 12px' }}>Events</th>
                  <th style={{ padding: '8px 12px' }}>Pending</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Admin Wing (प्रशासन)', members: 120, act: 45, events: 12, pending: 2, status: 'Active' },
                  { name: 'Membership Wing (संघटन)', members: 1450, act: 180, events: 35, pending: 18, status: 'Active' },
                  { name: 'Youth Wing (युवा)', members: 890, act: 95, events: 24, pending: 5, status: 'Active' },
                  { name: 'Women Wing (महिला)', members: 620, act: 70, events: 18, pending: 4, status: 'Active' },
                  { name: 'Education Wing (शिक्षण)', members: 340, act: 40, events: 8, pending: 1, status: 'Active' },
                  { name: 'Social Seva (सेवा)', members: 510, act: 110, events: 15, pending: 8, status: 'Active' },
                  { name: 'Digital Wing (डिजिटल)', members: 280, act: 85, events: 10, pending: 3, status: 'Active' },
                  { name: 'Media Wing (प्रसिद्धी)', members: 190, act: 60, events: 14, pending: 2, status: 'Active' },
                  { name: 'Finance Wing (अर्थ)', members: 95, act: 30, events: 4, pending: 0, status: 'Active' },
                  { name: 'Professional (व्यवसायिक)', members: 410, act: 50, events: 9, pending: 6, status: 'Active' },
                ].map((w, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: T.ink }}>{w.name}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{w.members}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{w.act}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>{w.events}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', color: T.amber, fontWeight: 700 }}>{w.pending}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: 4, fontWeight: 800, fontSize: '0.68rem' }}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Unified Approval Center */}
        <Card>
          <div style={{ fontSize: '0.95rem', fontWeight: 900, color: T.ink, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🔔 Unified Approval Center</span>
            <span style={{ background: T.saffron, color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 800 }}>8 Modules</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'KYC Applications', count: pendingKyc || 690, route: '/admin/kyc/report' },
              { label: 'Business Verifications', count: 40, route: '/admin/business/report' },
              { label: 'Event Approvals', count: 5, route: '/admin/events/report' },
              { label: 'Content Review (CMS)', count: 24, route: '/admin/content/report' },
              { label: 'Seva Requests', count: 12, route: '/admin/seva/report' },
              { label: 'Finance Approvals', count: 3, route: '/admin/reports' },
              { label: 'Role Appointments', count: 8, route: '/admin/roles-matrix' },
              { label: 'Chapter Applications', count: 14, route: '/admin/chapters' },
            ].map((app, i) => (
              <div key={i} onClick={() => navigate(app.route)} style={{
                background: T.softBg, border: `1px solid ${T.border}`, borderRadius: 8,
                padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', transition: 'all 0.15s'
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: T.ink }}>{app.label}</span>
                <span style={{ background: app.count > 0 ? T.amber : '#CBD5E1', color: app.count > 0 ? '#FFF' : '#475569', padding: '2px 8px', borderRadius: 6, fontWeight: 900, fontSize: '0.72rem' }}>
                  {app.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 5. Recent Activity & Admin Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Recent Activity */}
        <Card>
          <div style={{ fontWeight: 900, color: T.ink, marginBottom: 12, fontSize: '0.95rem' }}>
            🔥 अलीकडील क्रियाकलाप (Recent Audit Log & Activity Feed)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { time: '15:10', text: 'New member registered', who: 'अमिश कदम', loc: 'Pune', module: 'Membership', status: 'Pending KYC' },
              { time: '15:05', text: 'KYC approved', who: 'Super Admin', loc: 'Satara', module: 'KYC', status: 'Approved' },
              { time: '14:58', text: 'New business added', who: 'राजेश निंबाळकर', loc: 'Mumbai', module: 'Business', status: 'Pending' },
              { time: '14:45', text: 'Seva blood request created', who: 'सुरेश जाधव', loc: 'Kolhapur', module: 'Seva', status: 'Emergency' },
              { time: '14:32', text: 'Event published', who: 'प्रणाली देसाई', loc: 'Nashik', module: 'Events', status: 'Published' },
              { time: '14:10', text: 'Chapter meeting scheduled', who: 'विक्रम शेलार', loc: 'Sangli', module: 'Chapters', status: 'Active' },
              { time: '13:55', text: 'New B2B referral generated', who: 'अक्षय जगताप', loc: 'Solapur', module: 'B2B CRM', status: 'Assigned' },
            ].map((act, i) => (
              <div key={i} style={{
                background: T.softBg, border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.saffron}`,
                padding: '10px 14px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem'
              }}>
                <div>
                  <span style={{ color: T.muted, fontFamily: 'monospace', fontWeight: 800, marginRight: 8 }}>[{act.time}]</span>
                  <strong style={{ color: T.ink }}>{act.text}</strong>
                  <span style={{ color: T.muted }}> • {act.who} ({act.loc})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: '#FFEDD5', color: T.deep, padding: '2px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 800 }}>{act.module}</span>
                  <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 800 }}>{act.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Admin Alerts & Escalations */}
        <Card>
          <div style={{ fontWeight: 900, color: T.ink, marginBottom: 12, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🚨</span> Admin Alerts & SLA Escalations
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { type: 'Critical Seva', msg: '2 rare B-ve blood requests unmatched (>2 hrs)', level: 'Critical' },
              { type: 'SLA Breached', msg: '2 Helpdesk tickets overdue response', level: 'High' },
              { type: 'Pending KYC', msg: '45 applications pending > 3 days', level: 'Medium' },
              { type: 'Content Review', msg: '8 historical articles awaiting fact-check', level: 'Medium' },
              { type: 'Expiring Appointment', msg: '3 District leadership tenures expiring this month', level: 'Low' },
            ].map((al, idx) => (
              <div key={idx} style={{
                background: al.level === 'Critical' ? '#FEF2F2' : al.level === 'High' ? '#FFFBEB' : T.softBg,
                border: `1px solid ${al.level === 'Critical' ? '#FCA5A5' : al.level === 'High' ? '#FDE68A' : T.border}`,
                borderRadius: 8, padding: 10, fontSize: '0.76rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: al.level === 'Critical' ? T.red : T.ink }}>
                  <span>⚠️ {al.type}</span>
                  <span style={{ fontSize: '0.68rem', textTransform: 'uppercase' }}>{al.level}</span>
                </div>
                <p style={{ margin: '4px 0 0', color: T.muted }}>{al.msg}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   2. MEMBERS + KYC
   ============================================================ */
function MembersView({ data, setData, toast }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    return data.users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || u.name?.toLowerCase().includes(q)
        || u.phone?.includes(search)
        || (u.id || u._id)?.toLowerCase().includes(q);
      const matchFilter =
        filter === 'all'
        || (filter === 'verified' && u.verified)
        || (filter === 'unverified' && !u.verified);
      return matchSearch && matchFilter;
    });
  }, [data.users, search, filter]);

  const toggleVerify = async (u) => {
    const id = u.id || u._id;
    const newStatus = !u.verified;
    try {
      await adminApi.verifyMember(id, newStatus);
    } catch {}
    setData(prev => ({
      ...prev,
      users: prev.users.map(x => (x.id || x._id) === id ? { ...x, verified: newStatus } : x)
    }));
    toast(`${u.name} यांची पडताळणी ${newStatus ? 'मंजूर' : 'रद्द'}`, 'success');
  };

  return (
    <>
      <SectionTitle subtitle={`एकूण ${data.users.length} सदस्य`}>👤 Members & KYC</SectionTitle>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: 12, background: T.softBg, borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            placeholder="नाव, फोन किंवा ID शोधा..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 200, padding: '8px 12px',
              background: T.panel, border: `1px solid ${T.border}`,
              borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, outline: 'none'
            }} />
          <Select
            value={filter} onChange={e => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'सर्व' },
              { value: 'verified', label: 'प्रमाणित' },
              { value: 'unverified', label: 'प्रलंबित' }
            ]} />
        </div>

        <Table
          headers={['ID', 'नाव', 'फोन', 'जिल्हा', 'KYC', 'कृती']}
          onRowClick={setSelected}
          rows={filtered.map(u => [
            <span style={{ fontFamily: 'monospace', color: T.saffron, fontWeight: 800 }}>{u.id || u._id}</span>,
            <strong>{u.name}</strong>,
            u.phone || '—',
            u.district || '—',
            <Badge tone={u.verified ? 'green' : 'saffron'}>
              {u.verified ? '✓ प्रमाणित' : '⏳ प्रलंबित'}
            </Badge>,
            <Btn
              variant={u.verified ? 'danger' : 'success'}
              onClick={(e) => { e.stopPropagation(); toggleVerify(u); }}>
              {u.verified ? 'रद्द करा' : 'मंजूर करा'}
            </Btn>
          ])}
        />
      </Card>

      {selected && (
        <Modal title="👤 सदस्य डॉसियर" onClose={() => setSelected(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
            <div><strong style={{ color: T.deep }}>नाव:</strong> {selected.name}</div>
            <div><strong style={{ color: T.deep }}>ID:</strong> <span style={{ fontFamily: 'monospace', color: T.saffron }}>{selected.id || selected._id}</span></div>
            <div><strong style={{ color: T.deep }}>फोन:</strong> {selected.phone || '—'}</div>
            <div><strong style={{ color: T.deep }}>ईमेल:</strong> {selected.email || '—'}</div>
            <div><strong style={{ color: T.deep }}>जिल्हा:</strong> {selected.district || '—'}</div>
            <div><strong style={{ color: T.deep }}>व्यवसाय:</strong> {selected.profession || '—'}</div>
            <div><strong style={{ color: T.deep }}>KYC:</strong> <Badge tone={selected.verified ? 'green' : 'saffron'}>{selected.verified ? 'प्रमाणित' : 'प्रलंबित'}</Badge></div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="primary" onClick={() => { toggleVerify(selected); setSelected(null); }}>
              {selected.verified ? 'रद्द करा' : 'प्रमाणित करा'}
            </Btn>
            <Btn variant="plain" onClick={() => setSelected(null)}>बंद करा</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   3. LEADS PIPELINE (KANBAN)
   ============================================================ */
const LEAD_STAGES = [
  { id: 'new', label: '१. नवीन', color: '#F59E0B' },
  { id: 'contacted', label: '२. संपर्क', color: '#EA580C' },
  { id: 'qualified', label: '३. पात्र', color: '#D97706' },
  { id: 'meeting', label: '४. भेट', color: '#C2410C' },
  { id: 'converted', label: '५. रूपांतरित', color: '#16A34A' }
];

function LeadsView({ data, toast }) {
  const [leads, setLeads] = useState(data.leads);

  useEffect(() => setLeads(data.leads), [data.leads]);

  const moveLead = (leadId, newStage) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    adminApi.updateLeadStage(leadId, newStage);
    toast('लीड स्थिती अद्ययावत', 'success');
  };

  return (
    <>
      <SectionTitle subtitle="CRM Sales Pipeline">🎯 Leads Pipeline</SectionTitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, alignItems: 'flex-start' }}>
        {LEAD_STAGES.map(stage => {
          const stageLeads = leads.filter(l => (l.stage || 'new') === stage.id);
          return (
            <Card key={stage.id} style={{ background: T.softBg, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: stage.color }} />
                  <strong style={{ fontSize: '0.78rem', color: T.ink }}>{stage.label}</strong>
                </div>
                <Badge>{stageLeads.length}</Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stageLeads.map(l => (
                  <div key={l.id} style={{
                    background: T.panel, border: `1px solid ${T.border}`,
                    borderRadius: 8, padding: 10, fontSize: '0.78rem'
                  }}>
                    <div style={{ fontWeight: 800, color: T.text }}>{l.name || 'लीड'}</div>
                    <div style={{ color: T.muted, fontSize: '0.72rem' }}>📞 {l.phone || '—'}</div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {LEAD_STAGES.filter(s => s.id !== stage.id).slice(0, 2).map(s => (
                        <Btn key={s.id} variant="plain" style={{ padding: '4px 8px', fontSize: '0.65rem' }}
                          onClick={() => moveLead(l.id, s.id)}>→ {s.label}</Btn>
                      ))}
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 20, color: T.muted, fontSize: '0.72rem', fontWeight: 600 }}>
                    रिक्त
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

/* ============================================================
   4. BUSINESSES
   ============================================================ */
function BusinessesView({ data }) {
  return (
    <>
      <SectionTitle subtitle="व्यवसाय संगम नोंदणी">🏢 Businesses</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {data.businesses.map((b, i) => (
          <Card key={i}>
            <div style={{ fontWeight: 900, color: T.ink, fontSize: '0.95rem', marginBottom: 6 }}>
              {b.name || b.businessName || 'व्यवसाय'}
            </div>
            <div style={{ fontSize: '0.78rem', color: T.muted, marginBottom: 4 }}>
              👤 {b.owner || b.ownerName || '—'}
            </div>
            <div style={{ fontSize: '0.78rem', color: T.muted, marginBottom: 4 }}>
              📂 {b.category || '—'} • 📍 {b.district || '—'}
            </div>
            <div style={{ marginTop: 10 }}>
              <Badge tone={b.verified ? 'green' : 'saffron'}>
                {b.verified ? '✓ प्रमाणित' : '⏳ प्रलंबित'}
              </Badge>
            </div>
          </Card>
        ))}
        {data.businesses.length === 0 && (
          <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: T.muted }}>
            कोणतेही व्यवसाय नोंदवलेले नाहीत
          </Card>
        )}
      </div>
    </>
  );
}

/* ============================================================
   5. REFERRALS
   ============================================================ */
function ReferralsView({ data, setData, toast }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', value: '', giverName: '', receiverName: '' });

  const submit = async (e) => {
    e.preventDefault();
    await adminApi.createReferral(form);
    setData(prev => ({
      ...prev,
      referrals: [{ id: `REF-${Date.now()}`, ...form, createdAt: new Date() }, ...prev.referrals]
    }));
    toast('नवीन B2B रेफरल नोंदवला!', 'success');
    setShowModal(false);
    setForm({ title: '', value: '', giverName: '', receiverName: '' });
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle subtitle={`एकूण ${data.referrals.length} रेफरल्स`}>🤝 B2B Referrals</SectionTitle>
        <Btn variant="primary" onClick={() => setShowModal(true)}>+ नवीन रेफरल</Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {data.referrals.map((r, i) => (
          <Card key={r.id || i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: T.saffron, fontWeight: 800 }}>
                {r.id || `REF-${i}`}
              </span>
              <Badge>₹{Number(r.value || r.estimatedValue || 0).toLocaleString('en-IN')}</Badge>
            </div>
            <div style={{ fontWeight: 900, color: T.ink, marginBottom: 6 }}>{r.title}</div>
            <div style={{ fontSize: '0.75rem', color: T.muted }}>
              <strong>{r.giverName || '—'}</strong> → <strong>{r.receiverName || '—'}</strong>
            </div>
          </Card>
        ))}
        {data.referrals.length === 0 && (
          <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: T.muted }}>
            कोणतेही रेफरल्स नाहीत
          </Card>
        )}
      </div>

      {showModal && (
        <Modal title="🤝 नवीन B2B रेफरल" onClose={() => setShowModal(false)}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="शीर्षक *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input label="अंदाजे मूल्य (₹)" type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
            <Input label="देणारा" value={form.giverName} onChange={e => setForm({ ...form, giverName: e.target.value })} />
            <Input label="घेणारा" value={form.receiverName} onChange={e => setForm({ ...form, receiverName: e.target.value })} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Btn variant="plain" type="button" onClick={() => setShowModal(false)}>रद्द करा</Btn>
              <Btn variant="primary" type="submit">नोंदवा</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   6. CONTENT (articles / history / forts / temples / personalities)
   ============================================================ */
function ContentView({ type, data, toast }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', status: 'draft' });
  const items = data.content[type] || [];
  const labels = {
    articles: '📝 Articles',
    history: '📜 History',
    forts: '🏰 Forts',
    temples: '🛕 Temples',
    personalities: '👑 Personalities'
  };

  const submit = async (e) => {
    e.preventDefault();
    await adminApi.saveContent({ ...form, type });
    toast('सामग्री जतन केली', 'success');
    setShowModal(false);
    setForm({ title: '', body: '', status: 'draft' });
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle subtitle={`${items.length} नोंदी`}>{labels[type]}</SectionTitle>
        <Btn variant="primary" onClick={() => setShowModal(true)}>+ नवीन</Btn>
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          headers={['शीर्षक', 'प्रकार', 'स्थिती', 'कृती']}
          rows={items.map((c, i) => [
            <strong>{c.title || c.name || 'शीर्षक नाही'}</strong>,
            <Badge>{type}</Badge>,
            <Badge tone={c.status === 'published' ? 'green' : 'saffron'}>{c.status || 'draft'}</Badge>,
            <Btn variant="ghost" onClick={() => { adminApi.publishContent(c.id); toast('प्रकाशित!', 'success'); }}>प्रकाशित करा</Btn>
          ])}
        />
      </Card>

      {showModal && (
        <Modal title={`नवीन ${type}`} onClose={() => setShowModal(false)} width={600}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="शीर्षक *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>मजकूर</label>
              <textarea
                rows={6} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
                style={{
                  width: '100%', padding: 12, borderRadius: 6,
                  background: T.softBg, border: `1px solid ${T.border}`,
                  fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
                  resize: 'vertical', boxSizing: 'border-box'
                }} />
            </div>
            <Select label="स्थिती" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'review', label: 'Review' },
                { value: 'published', label: 'Published' }
              ]} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Btn variant="plain" type="button" onClick={() => setShowModal(false)}>रद्द करा</Btn>
              <Btn variant="primary" type="submit">जतन करा</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   7. MEDIA LIBRARY
   ============================================================ */
function MediaView({ data, toast }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle subtitle={`${data.media.length} फायली`}>🖼️ Media Library</SectionTitle>
        <label style={{
          background: T.gradient, color: '#fff', padding: '8px 14px',
          borderRadius: 8, fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer'
        }}>
          + अपलोड करा
          <input type="file" style={{ display: 'none' }} onChange={() => toast('अपलोड सुरू...', 'success')} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {data.media.map((m, i) => (
          <Card key={i} style={{ padding: 8, textAlign: 'center' }}>
            <div style={{
              height: 100, background: T.softBg, borderRadius: 6,
              display: 'grid', placeItems: 'center', fontSize: '2rem', marginBottom: 6
            }}>{m.type === 'video' ? '🎬' : m.type === 'pdf' ? '📄' : '🖼️'}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.name || `file-${i}`}
            </div>
          </Card>
        ))}
        {data.media.length === 0 && (
          <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: T.muted }}>
            मीडिया लायब्ररी रिकामी आहे
          </Card>
        )}
      </div>
    </>
  );
}

/* ============================================================
   8. EVENTS
   ============================================================ */
function EventsView({ data, toast }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', venue: '' });

  const submit = async (e) => {
    e.preventDefault();
    await adminApi.createEvent(form);
    toast('कार्यक्रम तयार झाला!', 'success');
    setShowModal(false);
    setForm({ title: '', date: '', venue: '' });
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle subtitle={`${data.events.length} कार्यक्रम`}>📅 Events</SectionTitle>
        <Btn variant="primary" onClick={() => setShowModal(true)}>+ नवीन कार्यक्रम</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {data.events.map((e, i) => (
          <Card key={i}>
            <div style={{ fontSize: '0.7rem', color: T.saffron, fontWeight: 800, marginBottom: 4 }}>
              📅 {e.date || '—'}
            </div>
            <div style={{ fontWeight: 900, color: T.ink, marginBottom: 6 }}>{e.title || 'कार्यक्रम'}</div>
            <div style={{ fontSize: '0.78rem', color: T.muted }}>📍 {e.venue || '—'}</div>
          </Card>
        ))}
        {data.events.length === 0 && (
          <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: T.muted }}>
            कोणतेही कार्यक्रम नाहीत
          </Card>
        )}
      </div>

      {showModal && (
        <Modal title="📅 नवीन कार्यक्रम" onClose={() => setShowModal(false)}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="शीर्षक *" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input label="दिनांक" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            <Input label="स्थळ" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Btn variant="plain" type="button" onClick={() => setShowModal(false)}>रद्द करा</Btn>
              <Btn variant="primary" type="submit">तयार करा</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   CHAPTERS VIEW
   ============================================================ */
function ChaptersView({ toast }) {
  const [chapters, setChapters] = useState([
    { id: 'CHP-MH-01', name: 'पुणे मध्यवर्ती शाखा', district: 'Pune', city: 'Pune', members: 450, leader: 'अमोल जाधव', status: 'Active' },
    { id: 'CHP-MH-02', name: 'सातारा छत्रपती शाखा', district: 'Satara', city: 'Satara', members: 380, leader: 'राजेश निंबाळकर', status: 'Active' },
    { id: 'CHP-MH-03', name: 'मुंबई पूर्व शाखा', district: 'Mumbai', city: 'Ghatkopar', members: 620, leader: 'सुरेश शिर्के', status: 'Active' },
    { id: 'CHP-MH-04', name: 'नाशिक गोदावरी शाखा', district: 'Nashik', city: 'Nashik', members: 290, leader: 'प्रणाली देसाई', status: 'Active' },
    { id: 'CHP-MH-05', name: 'कोल्हापूर करवीर शाखा', district: 'Kolhapur', city: 'Kolhapur', members: 410, leader: 'विक्रम शेलार', status: 'Active' },
    { id: 'CHP-MH-06', name: 'नागपूर उपराजधानी शाखा', district: 'Nagpur', city: 'Nagpur', members: 210, leader: 'अक्षय जगताप', status: 'Active' },
    { id: 'CHP-MH-07', name: 'सोलापूर सिद्धेश्वर शाखा', district: 'Solapur', city: 'Solapur', members: 310, leader: 'रुपेश पाटील', status: 'Active' },
    { id: 'CHP-MH-08', name: 'संभाजीनगर घृष्णेश्वर शाखा', district: 'Chhatrapati Sambhajinagar', city: 'Sambhajinagar', members: 270, leader: 'महेश भोसले', status: 'Active' }
  ]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', district: 'Pune', city: '', leader: '' });

  const filtered = chapters.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.district.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (e) => {
    e.preventDefault();
    const newCh = { id: `CHP-MH-0${chapters.length + 1}`, ...form, members: 1, status: 'Active' };
    setChapters([newCh, ...chapters]);
    setShowAdd(false);
    toast(`नवीन शाखा "${form.name}" जोडली!`, 'success');
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle subtitle={`एकूण ${chapters.length} नोंदणीकृत शाखा (Chapters)`}>📍 Chapters Command Center</SectionTitle>
        <Btn variant="primary" onClick={() => setShowAdd(true)}>+ नवीन शाखा जोडा</Btn>
      </div>

      <Card style={{ padding: 0 }}>
        <div style={{ padding: 12, background: T.softBg, borderBottom: `1px solid ${T.border}` }}>
          <input
            placeholder="शाखा नाव, जिल्हा किंवा शहर शोधा..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', maxWidth: 400, padding: '8px 12px', borderRadius: 6, border: `1px solid ${T.border}`, fontSize: '0.82rem' }}
          />
        </div>
        <Table
          headers={['ID', 'शाखा नाव', 'जिल्हा / शहर', 'एकूण सदस्य', 'शाखा प्रमुख', 'स्थिती', 'कृती']}
          rows={filtered.map(c => [
            <span style={{ fontFamily: 'monospace', color: T.saffron, fontWeight: 800 }}>{c.id}</span>,
            <strong>{c.name}</strong>,
            `${c.city}, ${c.district}`,
            <span style={{ fontWeight: 800, color: T.green }}>{c.members} सदस्य</span>,
            c.leader,
            <Badge tone="green">{c.status}</Badge>,
            <Btn variant="plain" onClick={() => toast(`${c.name} तपशील उघडत आहे`, 'success')}>तपशील (Details)</Btn>
          ])}
        />
      </Card>

      {showAdd && (
        <Modal title="📍 नवीन शाखा जोडणी (Create Chapter)" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="शाखेचे नाव *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="उदा. पुणे पश्चिम शाखा" />
            <Input label="जिल्हा *" required value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
            <Input label="शहर / तालुका *" required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
            <Input label="नियुक्त शाखा प्रमुख नाव *" required value={form.leader} onChange={e => setForm({ ...form, leader: e.target.value })} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Btn variant="plain" type="button" onClick={() => setShowAdd(false)}>रद्द करा</Btn>
              <Btn variant="primary" type="submit">शाखा तयार करा</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   ADMIN USERS VIEW
   ============================================================ */
function AdminUsersView({ toast }) {
  const [admins, setAdmins] = useState([
    { id: 'ADM-101', name: 'Super Admin Central', email: 'admin@connectmaratha.org', role: 'Super Admin', jurisdiction: 'सर्व ३६ जिल्हे (State Wide)', lastLogin: '15:10 Today', status: 'Active' },
    { id: 'ADM-102', name: 'अमोल जाधव (पुणे ॲडमिन)', email: 'pune.admin@connectmaratha.org', role: 'District Admin', jurisdiction: 'पुणे जिल्हा', lastLogin: '14:45 Today', status: 'Active' },
    { id: 'ADM-103', name: 'राजेश निंबाळकर (विभागप्रमुख)', email: 'satara.admin@connectmaratha.org', role: 'Division Admin', jurisdiction: 'पश्चिम महाराष्ट्र विभाग', lastLogin: 'Yesterday, 06:30 PM', status: 'Active' },
    { id: 'ADM-104', name: 'प्रणाली देसाई (CMS प्रमुख)', email: 'cms.lead@connectmaratha.org', role: 'Content Editor', jurisdiction: 'इतिहास व संस्कृती CMS', lastLogin: '14:20 Today', status: 'Active' },
    { id: 'ADM-105', name: 'सुरेश जाधव (सेवा कक्षप्रमुख)', email: 'seva.lead@connectmaratha.org', role: 'Seva Admin', jurisdiction: '२४x७ रक्त व मदत केंद्र', lastLogin: '15:02 Today', status: 'Active' },
    { id: 'ADM-106', name: 'अक्षय जगताप (B2B CRM प्रमुख)', email: 'b2b.admin@connectmaratha.org', role: 'CRM Lead', jurisdiction: 'व्यवसाय संगम', lastLogin: '12:15 Today', status: 'Active' }
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'District Admin', jurisdiction: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    const newAd = { id: `ADM-10${admins.length + 1}`, ...form, lastLogin: 'Never', status: 'Active' };
    setAdmins([newAd, ...admins]);
    setShowAdd(false);
    toast(`नवीन ॲडमिन युझर "${form.name}" जोडला!`, 'success');
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SectionTitle subtitle={`एकूण ${admins.length} ॲडमिनिस्ट्रेटर खाते`}>🛡️ Admin Users & Permission Delegation</SectionTitle>
        <Btn variant="primary" onClick={() => setShowAdd(true)}>+ नवीन ॲडमिन जोडा</Btn>
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          headers={['ID', 'नाव', 'ईमेल', 'भूमिका (Role)', 'अधिकार क्षेत्र (Jurisdiction)', 'शेवटचा लॉगिन', 'स्थिती', 'कृती']}
          rows={admins.map(a => [
            <span style={{ fontFamily: 'monospace', color: T.saffron, fontWeight: 800 }}>{a.id}</span>,
            <strong>{a.name}</strong>,
            a.email,
            <Badge tone="saffron">{a.role}</Badge>,
            a.jurisdiction,
            a.lastLogin,
            <Badge tone="green">{a.status}</Badge>,
            <Btn variant="ghost" onClick={() => toast(`${a.name} अधिकार संपादित करा`, 'success')}>अधिकार (Edit)</Btn>
          ])}
        />
      </Card>

      {showAdd && (
        <Modal title="🛡️ नवीन ॲडमिन युझर (Create Admin User)" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="ॲडमिनिस्ट्रेटर नाव *" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label="अधिकृत ईमेल *" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Select label="भूमिका (Role) *" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              options={[
                { value: 'Super Admin', label: 'Super Admin' },
                { value: 'Division Admin', label: 'Division Admin' },
                { value: 'District Admin', label: 'District Admin' },
                { value: 'Content Editor', label: 'Content Editor' },
                { value: 'Seva Admin', label: 'Seva Admin' },
                { value: 'CRM Lead', label: 'CRM Lead' }
              ]} />
            <Input label="अधिकार क्षेत्र (Jurisdiction) *" required value={form.jurisdiction} onChange={e => setForm({ ...form, jurisdiction: e.target.value })} placeholder="उदा. ठाणे जिल्हा / उत्तर महाराष्ट्र" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <Btn variant="plain" type="button" onClick={() => setShowAdd(false)}>रद्द करा</Btn>
              <Btn variant="primary" type="submit">ॲडमिन तयार करा</Btn>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

/* ============================================================
   9. CAMPAIGNS
   ============================================================ */
function CampaignsView({ data }) {
  const campaignsList = [
    { name: 'मराठा आरक्षण व रोजगार मार्गदर्शन अभियान 2026', type: 'Community Outreach', audience: 'युवा व विद्यार्थी (50,000+)', status: 'active', reach: '1,24,000' },
    { name: 'राज्यस्तरीय व्यवसाय संगम नोंदणी मोहीम', type: 'B2B Networking', audience: 'उद्योजक व व्यावसायिक (10,000+)', status: 'active', reach: '45,000' },
    { name: 'महाराष्ट्र २४x७ महारक्तदान शिबीर अभियान', type: 'Healthcare Seva', audience: 'सर्व सदस्य (1,00,000+)', status: 'active', reach: '2,10,000' },
    { name: 'छत्रपती शिवाजी महाराज स्मारक व दुर्ग जतन मोहीम', type: 'Cultural & Forts', audience: 'दुर्ग अभ्यासक व स्वयंसेवक', status: 'draft', reach: '18,500' }
  ];
  return (
    <>
      <SectionTitle subtitle="विशेष मोहीम व सामाजिक उपक्रम व्यवस्थापन">📣 Campaigns & Outreach Programs</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 16 }}>
        <Card style={{ borderLeft: `4px solid ${T.saffron}` }}>
          <div style={{ fontSize: '0.75rem', color: T.muted, fontWeight: 700 }}>सक्रिय मोहिमा</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: T.saffron, marginTop: 4 }}>3 Active</div>
        </Card>
        <Card style={{ borderLeft: `4px solid ${T.green}` }}>
          <div style={{ fontSize: '0.75rem', color: T.muted, fontWeight: 700 }}>एकूण पोहोच (Total Reach)</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: T.green, marginTop: 4 }}>3,97,500</div>
        </Card>
      </div>
      <Card style={{ padding: 0 }}>
        <Table
          headers={['मोहीम नाव (Campaign)', 'प्रकार (Type)', 'लक्ष्यित प्रेक्षक (Audience)', 'पोहोच (Reach)', 'स्थिती']}
          rows={campaignsList.map(c => [
            <strong>{c.name}</strong>,
            <Badge>{c.type}</Badge>,
            c.audience,
            <span style={{ fontWeight: 800, color: T.saffron }}>{c.reach}</span>,
            <Badge tone={c.status === 'active' ? 'green' : 'saffron'}>{c.status === 'active' ? 'सक्रिय (Active)' : 'मसुदा (Draft)'}</Badge>
          ])}
        />
      </Card>
    </>
  );
}

/* ============================================================
   10. COMMUNICATION
   ============================================================ */
function CommunicationView({ toast }) {
  const [channel, setChannel] = useState('sms');
  const [message, setMessage] = useState('');

  return (
    <>
      <SectionTitle subtitle="एकत्रित संवाद केंद्र">💬 Communication Center</SectionTitle>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Select label="चॅनेल" value={channel} onChange={e => setChannel(e.target.value)}
            options={[
              { value: 'sms', label: 'SMS' },
              { value: 'whatsapp', label: 'WhatsApp' },
              { value: 'email', label: 'Email' },
              { value: 'push', label: 'Push Notification' }
            ]} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: T.ink }}>संदेश</label>
            <textarea rows={5} value={message} onChange={e => setMessage(e.target.value)}
              style={{
                padding: 12, borderRadius: 6,
                background: T.softBg, border: `1px solid ${T.border}`,
                fontSize: '0.82rem', fontFamily: 'inherit',
                resize: 'vertical', boxSizing: 'border-box'
              }} />
          </div>
          <div>
            <Btn variant="primary" onClick={() => {
              adminApi.sendCampaign({ channel, message });
              toast('संदेश पाठवला!', 'success');
              setMessage('');
            }}>📤 पाठवा</Btn>
          </div>
        </div>
      </Card>
    </>
  );
}

/* ============================================================
   11. WORKFLOWS
   ============================================================ */
function WorkflowsView({ data }) {
  const [workflows, setWorkflows] = useState([
    { id: 'WF-01', name: 'Automated KYC Verification Reminder', trigger: 'New Registration', action: 'Send WhatsApp & SMS Link', enabled: true },
    { id: 'WF-02', name: 'Helpdesk Ticket SLA Escalation Trigger', trigger: 'Ticket Unresolved > 2 Hrs', action: 'Escalate to Department Lead', enabled: true },
    { id: 'WF-03', name: 'Emergency Blood Donor Push Notification', trigger: 'Rare Blood Request Created', action: 'Alert Donors within 10 km', enabled: true },
    { id: 'WF-04', name: 'B2B Referral Match Generator', trigger: 'Referral Submitted', action: 'Auto-Assign Business Owner', enabled: true },
    { id: 'WF-05', name: 'Leadership Nomination Dossier Unlock', trigger: 'Member Reaches Band 3', action: 'Unlock Application Form', enabled: false }
  ]);

  const toggleWf = (id) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w));
  };

  return (
    <>
      <SectionTitle subtitle="स्वयंचलित ट्रिगर्स व व्यवसाय प्रक्रिया">🔄 Workflows Automation Engine</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {workflows.map((w) => (
          <Card key={w.id} style={{ borderLeft: `4px solid ${w.enabled ? T.green : T.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: T.saffron, fontWeight: 800 }}>{w.id}</span>
                <strong style={{ display: 'block', color: T.ink, fontSize: '0.9rem', marginTop: 2 }}>{w.name}</strong>
              </div>
              <Btn variant={w.enabled ? 'success' : 'ghost'} style={{ fontSize: '0.7rem', padding: '4px 8px' }} onClick={() => toggleWf(w.id)}>
                {w.enabled ? '✓ सक्रिय (Active)' : '⏸️ बंद (Off)'}
              </Btn>
            </div>
            <div style={{ background: T.softBg, padding: 8, borderRadius: 6, fontSize: '0.75rem', color: T.muted }}>
              <div>⚡ <strong>ट्रिगर:</strong> {w.trigger}</div>
              <div style={{ marginTop: 2 }}>🎯 <strong>कृती:</strong> {w.action}</div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   12. TICKETS / COMPLAINTS
   ============================================================ */
function TicketsView({ data, toast }) {
  const resolve = (id) => {
    adminApi.updateTicket(id, { status: 'resolved' });
    toast('तिकीट निराकरण', 'success');
  };
  return (
    <>
      <SectionTitle subtitle={`${data.tickets.length} तिकिटे`}>🎫 Complaints & Tickets</SectionTitle>
      <Card style={{ padding: 0 }}>
        <Table
          headers={['ID', 'विषय', 'प्राधान्य', 'स्थिती', 'कृती']}
          rows={data.tickets.map(t => [
            <span style={{ fontFamily: 'monospace', color: T.saffron }}>{t.id}</span>,
            <strong>{t.subject || '—'}</strong>,
            <Badge tone={t.priority === 'high' ? 'red' : 'saffron'}>{t.priority || 'normal'}</Badge>,
            <Badge tone={t.status === 'resolved' ? 'green' : 'saffron'}>{t.status || 'open'}</Badge>,
            <Btn variant="success" onClick={() => resolve(t.id)}>निराकरण</Btn>
          ])}
        />
      </Card>
    </>
  );
}

/* ============================================================
   13. BLOOD / SEVA
   ============================================================ */
function BloodView({ data }) {
  return (
    <>
      <SectionTitle subtitle={`${data.blood.length} विनंत्या`}>🩸 Blood Helpdesk</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {data.blood.map((b, i) => (
          <Card key={i} style={{ borderColor: '#FCA5A5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Badge tone="red">🩸 {b.bloodGroup || 'सर्व'}</Badge>
              <Badge tone="red">तातडीची</Badge>
            </div>
            <div style={{ fontWeight: 900, color: T.ink }}>{b.patientName || 'रुग्ण'}</div>
            <div style={{ fontSize: '0.75rem', color: T.muted, marginTop: 6 }}>
              🏥 {b.hospital || '—'} • 📍 {b.city || '—'}
            </div>
            <div style={{ fontSize: '0.75rem', color: T.muted, marginTop: 4 }}>
              📞 {b.contactNumber || '—'}
            </div>
          </Card>
        ))}
        {data.blood.length === 0 && (
          <Card style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: T.muted }}>
            कोणत्याही विनंत्या नाहीत
          </Card>
        )}
      </div>
    </>
  );
}

/* ============================================================
   14. REPORTS / ANALYTICS
   ============================================================ */
function ReportsView({ data }) {
  const stats = [
    { label: 'एकूण सदस्य', value: data.users.length || 2540, color: T.saffron },
    { label: 'प्रमाणित KYC', value: data.users.filter(u => u.verified).length || 1850, color: T.green },
    { label: 'व्यवसाय', value: data.businesses.length || 420, color: T.amber },
    { label: 'B2B रेफरल्स', value: data.referrals.length || 185, color: T.deep },
    { label: '२४x७ सेवारक्त विनंत्या', value: data.blood.length || 94, color: T.red },
    { label: 'कार्यक्रम नोंदणी', value: data.events.length || 28, color: T.saffron }
  ];
  return (
    <>
      <SectionTitle subtitle="प्लॅटफॉर्म संपूर्ण सांख्यिकी व विश्लेषण">📊 Reports & Analytics MIS</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {stats.map((s, i) => (
          <Card key={i}>
            <div style={{ fontSize: '0.75rem', color: T.ink, fontWeight: 700 }}>{s.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, marginTop: 6 }}>{s.value}</div>
          </Card>
        ))}
      </div>
      <Card style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 900, color: T.ink, marginBottom: 12 }}>📈 जिल्हावार सदस्य वाढ व संघटनात्मक व्याप्ती (Regional Analytics)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { dist: 'पुणे जिल्हा', count: 1240, pct: '85%' },
            { dist: 'सातारा जिल्हा', count: 890, pct: '78%' },
            { dist: 'मुंबई व ठाणे', count: 1420, pct: '92%' },
            { dist: 'कोल्हापूर जिल्हा', count: 760, pct: '74%' },
            { dist: 'नाशिक जिल्हा', count: 650, pct: '68%' },
            { dist: 'छत्रपती संभाजीनगर', count: 540, pct: '62%' }
          ].map((r, i) => (
            <div key={i} style={{ fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: T.ink, marginBottom: 4 }}>
                <span>{r.dist}</span>
                <span style={{ color: T.saffron }}>{r.count} सदस्य ({r.pct})</span>
              </div>
              <div style={{ background: '#E2E8F0', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: r.pct, background: T.gradient, height: '100%' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/* ============================================================
   15. APPROVALS
   ============================================================ */
function ApprovalsView({ data, toast }) {
  const [approvalsList, setApprovalsList] = useState([
    { id: 'APP-01', module: 'KYC Verification', applicant: 'अमोल तुकाराम जाधव', location: 'Pune', submitted: '15:10 Today', status: 'Pending' },
    { id: 'APP-02', module: 'Business Verification', applicant: 'शिवनेरी टेक्स्टाईल्स (राजेश निंबाळकर)', location: 'Satara', submitted: '14:58 Today', status: 'Pending' },
    { id: 'APP-03', module: 'Content Review', applicant: 'रायगड रोपवे पर्यटन लेख (प्रणाली देसाई)', location: 'Raigad', submitted: '14:20 Today', status: 'Pending' },
    { id: 'APP-04', module: 'Event Approval', applicant: 'मराठा उद्योजक परिषद 2026 (विक्रम शेलार)', location: 'Mumbai', submitted: '13:45 Today', status: 'Pending' },
    { id: 'APP-05', module: 'Role Appointment', applicant: 'तालुका महिला अध्यक्ष (प्रियंका शिर्के)', location: 'Karad', submitted: 'Yesterday', status: 'Pending' },
    { id: 'APP-06', module: 'Chapter Application', applicant: 'सोलापूर सिद्धेश्वर शाखा (रुपेश पाटील)', location: 'Solapur', submitted: 'Yesterday', status: 'Pending' }
  ]);

  const handleApprove = (id, name) => {
    setApprovalsList(prev => prev.filter(x => x.id !== id));
    toast ? toast(`"${name}" मंजूर केले! ✓`, 'success') : alert(`Approved ${name}`);
  };

  const handleReject = (id, name) => {
    setApprovalsList(prev => prev.filter(x => x.id !== id));
    toast ? toast(`"${name}" फेटाळले. ✕`, 'error') : alert(`Rejected ${name}`);
  };

  return (
    <>
      <SectionTitle subtitle={`एकूण ${approvalsList.length} प्रलंबित मंजुऱ्या`}>✅ Unified Approval Command Center</SectionTitle>
      <Card style={{ padding: 0 }}>
        <Table
          headers={['आयडी', 'मॉड्यूल (Module)', 'अर्जदार / नोंद', 'स्थान', 'सादर वेळ', 'स्थिती', 'कृती']}
          rows={approvalsList.map(a => [
            <span style={{ fontFamily: 'monospace', color: T.saffron, fontWeight: 800 }}>{a.id}</span>,
            <Badge tone="saffron">{a.module}</Badge>,
            <strong>{a.applicant}</strong>,
            a.location,
            a.submitted,
            <Badge tone="saffron">⏳ {a.status}</Badge>,
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn variant="success" style={{ fontSize: '0.7rem', padding: '4px 8px' }} onClick={() => handleApprove(a.id, a.applicant)}>✓ मंजूर (Approve)</Btn>
              <Btn variant="danger" style={{ fontSize: '0.7rem', padding: '4px 8px' }} onClick={() => handleReject(a.id, a.applicant)}>✕ फेटाळा</Btn>
            </div>
          ])}
        />
      </Card>
    </>
  );
}

/* ============================================================
   16. MASTER DATA
   ============================================================ */
function MasterDataView({ toast }) {
  const [selectedTable, setSelectedTable] = useState('Districts');

  const districts = ['पुणे', 'सातारा', 'कोल्हापूर', 'मुंबई', 'ठाणे', 'नाशिक', 'नागपूर', 'सोलापूर', 'छत्रपती संभाजीनगर', 'रत्नागिरी', 'सांगली', 'अहमदनगर (अहिल्यानगर)', 'जळगाव', 'अमरावती', 'नांदेड', 'लातूर', 'बुलढाणा', 'यवतमाळ', 'धुळे', 'परभणी', 'चंद्रपूर', 'बीड', 'गोंदिया', 'गडचिरोली', 'हिंगोली', 'जालना', 'पालघर', 'रायगड', 'सिंधुदुर्ग', 'धाराशिव (उस्मानाबाद)', 'वाशिम', 'वर्धा', 'भंडारा', 'नंदुरबार', 'अकोला', 'अमरावती'];

  const categories = ['IT व तंत्रज्ञान', 'शिक्षण व प्रशिक्षण', 'वित्त व विमा (Finance)', 'आरोग्य व वैद्यकीय (Healthcare)', 'कृषी व प्रक्रिया (Agriculture)', 'पर्यटन व आदरातिथ्य (Travel)', 'उत्पादन (Manufacturing)', 'बांधकाम व रिअल इस्टेट', 'कायदेशीर सल्ला (Legal Services)', 'डिजिटल मीडिया'];

  return (
    <>
      <SectionTitle subtitle="संघटनात्मक ३६ जिल्हे, ३५८ तालुके व व्यवसाय मास्टर डेटा">🗃️ Master Data Administration</SectionTitle>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {['Districts (३६ जिल्हे)', 'Categories (व्यवसाय श्रेणी)', 'Talukas (३५८ तालुके)'].map((tab) => (
          <Btn key={tab} variant={selectedTable.includes(tab.split(' ')[0]) ? 'primary' : 'plain'} onClick={() => setSelectedTable(tab.split(' ')[0])}>
            {tab}
          </Btn>
        ))}
      </div>

      <Card style={{ padding: 0 }}>
        {selectedTable === 'Districts' && (
          <Table
            headers={['क्र.', 'जिल्हा नाव (District Name)', 'राज्य', 'तालुके संख्या', 'स्थिती']}
            rows={districts.map((d, i) => [
              i + 1,
              <strong>{d}</strong>,
              'महाराष्ट्र',
              '८-१५ तालुके',
              <Badge tone="green">Active</Badge>
            ])}
          />
        )}
        {selectedTable === 'Categories' && (
          <Table
            headers={['क्र.', 'श्रेणी नाव (Category)', 'क्षेत्र', 'नोंदणीकृत व्यवसाय', 'स्थिती']}
            rows={categories.map((c, i) => [
              i + 1,
              <strong>{c}</strong>,
              'व्यावसायिक',
              '४५+ व्यवसाय',
              <Badge tone="green">Active</Badge>
            ])}
          />
        )}
        {selectedTable === 'Talukas' && (
          <div style={{ padding: 20, fontSize: '0.85rem', color: T.ink }}>
            📍 महाराष्ट्रातील सर्व ३५८ तालुक्यांची यादी मास्टर डेटाबेसमध्ये अपडेटेड आहे.
          </div>
        )}
      </Card>
    </>
  );
}

/* ============================================================
   16.B ROLES MATRIX & 3-GATE PIPELINE VIEW
   ============================================================ */
function RolesMatrixPipelineView({ data, toast }) {
  const [selectedWing, setSelectedWing] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [search, setSearch] = useState('');
  const [activeRole, setActiveRole] = useState(null);
  const [nominatedUser, setNominatedUser] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');

  // Applications List from localStorage + initial mock
  const [applicationsList, setApplicationsList] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('cm_role_applications') || '[]');
    if (saved.length > 0) return saved;
    return [
      {
        id: 'app_demo_1',
        userId: 'CM-MH-9876543210',
        userName: 'अमोल तुकाराम जाधव',
        userDistrict: 'पुणे (हवेली)',
        roleId: 'adm-01',
        roleTitleMr: 'ग्रामाध्यक्ष (ग्राम अध्यक्ष)',
        referrals: 12450,
        status: 'Pending',
        appliedAt: new Date(Date.now() - 3600000 * 4).toISOString()
      },
      {
        id: 'app_demo_2',
        userId: 'CM-MH-4458129012',
        userName: 'प्रियंका सुरेश शिर्के',
        userDistrict: 'सातारा (कराड)',
        roleId: 'wmn-02',
        roleTitleMr: 'तालुका महिला अध्यक्ष',
        referrals: 18200,
        status: 'Pending',
        appliedAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'app_demo_3',
        userId: 'CM-MH-7712398451',
        userName: 'निलेश भगवान देशमुख',
        userDistrict: 'नाशिक (मालेगाव)',
        roleId: 'tech-03',
        roleTitleMr: 'तालुका डिजिटल प्रमुख (IT Head)',
        referrals: 15600,
        status: 'Pending',
        appliedAt: new Date(Date.now() - 3600000 * 48).toISOString()
      }
    ];
  });

  const handleApproveApp = (app) => {
    const updated = applicationsList.map(item =>
      item.id === app.id ? { ...item, status: 'Appointed' } : item
    );
    setApplicationsList(updated);
    localStorage.setItem('cm_role_applications', JSON.stringify(updated));
    toast(`"${app.userName}" यांना "${app.roleTitleMr}" पदाचे अधिकृत वाटप केले आहे! 🚩`, 'success');
  };

  const filtered = useMemo(() => {
    return MASTER_ROLES.filter(r => {
      if (selectedWing !== 'all' && r.department !== selectedWing) return false;
      if (selectedTier !== 'all' && r.tier !== selectedTier) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const text = `${r.title} ${r.titleMr} ${r.description} ${r.qualification}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [selectedWing, selectedTier, search]);

  const handleAppoint = (e) => {
    e.preventDefault();
    if (!activeRole) return;
    toast(`"${activeRole.titleMr}" पदासाठी ${nominatedUser || 'उमेदवार'} यांची अधिकृत नियुक्ती जाहीर करण्यात आली आहे! 🚩`, 'success');
    setActiveRole(null);
    setNominatedUser('');
    setAppointmentNotes('');
  };

  return (
    <>
      <SectionTitle subtitle="६ स्तर, १० आघाड्या, ९ रेफरल बँड्स व ३-गेट्स पारदर्शक निवड प्रणाली">
        🏛️ संघटनात्मक रचना व पदोन्नती मॅट्रिक्स (Master Roles Pipeline)
      </SectionTitle>

      {/* METRICS SUMMARY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <Card style={{ background: 'linear-gradient(135deg, #7C2D12, #C73800)', color: '#fff' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 700 }}>मास्टर रोल्स (Master Roles)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: 4 }}>{MASTER_ROLES.length}</div>
          <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: 4 }}>३०+ संघटनात्मक पदे</div>
        </Card>
        <Card style={{ background: T.softBg, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: '0.75rem', color: T.muted, fontWeight: 700 }}>संघटनात्मक आघाड्या (Wings)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: T.ink, marginTop: 4 }}>{DEPARTMENT_WINGS.length}</div>
          <div style={{ fontSize: '0.7rem', color: T.saffron, fontWeight: 700, marginTop: 4 }}>प्रशासन ते विधी सल्लागार</div>
        </Card>
        <Card style={{ background: T.softBg, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: '0.75rem', color: T.muted, fontWeight: 700 }}>प्रशासकीय स्तर (Tiers)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: T.ink, marginTop: 4 }}>{ADMINISTRATIVE_TIERS.length}</div>
          <div style={{ fontSize: '0.7rem', color: T.green, fontWeight: 700, marginTop: 4 }}>ग्राम ते राज्य/सर्वोच्च</div>
        </Card>
        <Card style={{ background: T.softBg, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: '0.75rem', color: T.muted, fontWeight: 700 }}>पात्र उमेदवार (Gate 1 Passed)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: T.saffron, marginTop: 4 }}>
            {data.users ? data.users.filter(u => (u.referralCount || 0) >= 5000).length : 14}
          </div>
          <div style={{ fontSize: '0.7rem', color: T.muted, fontWeight: 700, marginTop: 4 }}>५,०००+ रेफरल थ्रेशोल्ड पूर्ण</div>
        </Card>
      </div>

      {/* APPLICATIONS QUEUE & ALLOTMENT DECISION CONSOLE */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: T.ink }}>
              📩 प्राप्त पदोन्नती अर्ज व नियुक्ती कक्ष (Active Candidate Applications & Allotments)
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: T.muted }}>
              सदस्यांनी त्यांच्या डॅशबोर्डवरून पाठवलेले शिफारस अर्ज. ॲडमिन येथून थेट पडताळणी करून पदाचे अधिकृत वाटप करू शकतात.
            </p>
          </div>
          <Badge>{applicationsList.length} अर्ज प्राप्त</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {applicationsList.map((app, i) => (
            <div key={i} style={{
              background: T.softBg, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <strong style={{ fontSize: '0.95rem', color: T.ink }}>{app.userName || 'अमोल जाधव'}</strong>
                  <span style={{ fontSize: '0.72rem', background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>
                    {app.userId || 'CM-MH-9876543210'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: T.muted }}>• {app.userDistrict || 'पुणे'}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: T.saffron, fontWeight: 800 }}>
                  अर्ज केलेले पद: <span style={{ color: T.ink }}>{app.roleTitleMr}</span> ({app.roleId})
                </div>
                <div style={{ fontSize: '0.74rem', color: T.muted, marginTop: 4 }}>
                  🎯 रेफरल्स: <strong>{(app.referrals || 12450).toLocaleString()}</strong> | 📅 तारीख: {new Date(app.appliedAt || Date.now()).toLocaleDateString('mr-IN')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: 6,
                  background: app.status === 'Appointed' ? '#DCFCE7' : '#FEF3C7',
                  color: app.status === 'Appointed' ? '#166534' : '#92400E'
                }}>
                  {app.status === 'Appointed' ? '🎖️ पद मंजूर / नियुक्त' : '⏳ Gate 1 & 2 Passed - Pending Panel'}
                </span>

                {app.status !== 'Appointed' && (
                  <Btn variant="success" onClick={() => handleApproveApp(app)}>
                    🎖️ पद वाटप करा (Appoint Role)
                  </Btn>
                )}
              </div>
            </div>
          ))}

          {applicationsList.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: T.muted, fontWeight: 600 }}>
              सध्या कोणताही नवीन शिफारस अर्ज प्रलंबित नाही.
            </div>
          )}
        </div>
      </Card>

      {/* FILTER BAR */}
      <Card style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input placeholder="शोधा... (उदा. ग्रामाध्यक्ष, जिल्हाध्यक्ष, तालुका आयटी प्रमुख)" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={selectedWing} onChange={e => setSelectedWing(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: '0.8rem', fontWeight: 700, background: '#fff' }}>
          <option value="all">सर्व आघाड्या (All Wings - 10)</option>
          {DEPARTMENT_WINGS.map(w => (
            <option key={w.id} value={w.id}>{w.icon} {w.nameMr}</option>
          ))}
        </select>
        <select value={selectedTier} onChange={e => setSelectedTier(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: '0.8rem', fontWeight: 700, background: '#fff' }}>
          <option value="all">सर्व स्तर (All Tiers - 6)</option>
          {ADMINISTRATIVE_TIERS.map(t => (
            <option key={t.id} value={t.id}>Level {t.level}: {t.nameMr}</option>
          ))}
        </select>
      </Card>

      {/* ROLES GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {filtered.map(r => {
          const wing = DEPARTMENT_WINGS.find(w => w.id === r.department);
          const tier = ADMINISTRATIVE_TIERS.find(t => t.id === r.tier);
          return (
            <Card key={r.id} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', background: T.softBg, color: T.saffron, padding: '3px 8px', borderRadius: 6, fontWeight: 800 }}>
                      {wing?.icon} {wing?.nameMr}
                    </span>
                    <h3 style={{ margin: '8px 0 2px', fontSize: '1.05rem', fontWeight: 900, color: T.ink }}>
                      {r.titleMr}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: T.muted, fontWeight: 600 }}>{r.title}</div>
                  </div>
                  <Badge>{tier?.nameMr || r.tier}</Badge>
                </div>

                <p style={{ fontSize: '0.8rem', color: T.text, lineHeight: 1.5, margin: '8px 0 12px' }}>
                  {r.description}
                </p>

                <div style={{ background: T.softBg, borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div>🎯 <strong>रेफरल अट (Gate 1):</strong> <span style={{ color: T.saffron, fontWeight: 900 }}>{r.referralThreshold.toLocaleString()}</span> रेफरल्स</div>
                  <div>🎓 <strong>पात्रता:</strong> {r.qualification}</div>
                  <div>⏳ <strong>किमान अनुभव:</strong> {r.minExperience}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
                <Btn variant="primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveRole(r)}>
                  🎖️ नियुक्ती / शिफारस
                </Btn>
              </div>
            </Card>
          );
        })}
      </div>

      {/* APPOINTMENT & APPLICANTS DOSSIER MODAL */}
      {activeRole && (() => {
        const roleApplicants = applicationsList.filter(app => app.roleId === activeRole.id);
        const handleRejectApp = (app) => {
          const updated = applicationsList.map(item =>
            item.id === app.id ? { ...item, status: 'Rejected' } : item
          );
          setApplicationsList(updated);
          localStorage.setItem('cm_role_applications', JSON.stringify(updated));
          toast(`"${app.userName}" यांचा "${activeRole.titleMr}" पदाचा अर्ज नाकारला आहे.`, 'error');
        };

        const handleAppointSpecificCandidate = (app) => {
          const updated = applicationsList.map(item =>
            item.id === app.id ? { ...item, status: 'Appointed' } : item
          );
          setApplicationsList(updated);
          localStorage.setItem('cm_role_applications', JSON.stringify(updated));
          toast(`"${app.userName}" यांना "${activeRole.titleMr}" पदाचे अधिकृत वाटप करण्यात आले आहे! 🚩`, 'success');
          setActiveRole(null);
        };

        return (
          <Modal title={`🎖️ पद वाटप व अर्जदार - ${activeRole.titleMr}`} onClose={() => setActiveRole(null)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Role Header Info */}
              <div style={{ background: T.softBg, border: `1px solid ${T.border}`, padding: 14, borderRadius: 10, fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <strong style={{ fontSize: '1.05rem', color: T.ink }}>{activeRole.titleMr}</strong>
                  <Badge>{activeRole.tier.toUpperCase()}</Badge>
                </div>
                <div style={{ color: T.muted, marginBottom: 8 }}>{activeRole.title}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: '0.78rem' }}>
                  <div>🎯 <strong>रेफरल थ्रेशोल्ड (Gate 1):</strong> <span style={{ color: T.saffron, fontWeight: 900 }}>{activeRole.referralThreshold.toLocaleString()}</span></div>
                  <div>🎓 <strong>किमान पात्रता:</strong> {activeRole.qualification}</div>
                  <div>⏳ <strong>अनुभव:</strong> {activeRole.minExperience}</div>
                  <div>🏛️ <strong>Gate 3 निवड समिती:</strong> {activeRole.gate3Interview}</div>
                </div>
              </div>

              {/* APPLIED CANDIDATES FOR THIS SPECIFIC POST */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 900, color: T.ink, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📩 या पदासाठी आलेले अर्ज ({roleApplicants.length})</span>
                  {roleApplicants.length > 0 && <span style={{ fontSize: '0.75rem', color: T.saffron, fontWeight: 700 }}>३-गेट्स पडताळणी पूर्ण</span>}
                </h4>

                {roleApplicants.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 320, overflowY: 'auto' }}>
                    {roleApplicants.map((app, i) => (
                      <div key={i} style={{
                        background: '#FFFFFF', border: `1.5px solid ${app.status === 'Appointed' ? '#86EFAC' : T.border}`,
                        borderRadius: 10, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: '1rem', color: T.ink }}>{app.userName}</div>
                            <div style={{ fontSize: '0.75rem', color: T.muted }}>
                              आयडी: <span style={{ fontFamily: 'monospace', color: T.saffron, fontWeight: 800 }}>{app.userId || 'CM-MH-9876543210'}</span> • जिल्हा/तालुका: <strong>{app.userDistrict || 'पुणे (हवेली)'}</strong>
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                            background: app.status === 'Appointed' ? '#DCFCE7' : app.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                            color: app.status === 'Appointed' ? '#166534' : app.status === 'Rejected' ? '#991B1B' : '#92400E'
                          }}>
                            {app.status === 'Appointed' ? '🎖️ पद मंजूर / नियुक्त' : app.status === 'Rejected' ? '❌ फेटाळला' : '✅ Gate 1 & 2 Passed'}
                          </span>
                        </div>

                        {/* Personal & Referral Details */}
                        <div style={{ background: T.softBg, borderRadius: 8, padding: 10, fontSize: '0.76rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 12 }}>
                          <div>🎯 <strong>रेफरल जमा:</strong> <span style={{ color: '#16A34A', fontWeight: 900 }}>{(app.referrals || 12450).toLocaleString()}</span> (पात्रता १००%+)</div>
                          <div>📞 <strong>संपर्क:</strong> +९१ ९८२२० ११९२४</div>
                          <div>✉️ <strong>ईमेल:</strong> member.maratha@connectmaratha.org</div>
                          <div>📅 <strong>अर्ज तारीख:</strong> {new Date(app.appliedAt || Date.now()).toLocaleDateString('mr-IN')}</div>
                        </div>

                        {/* Decision Buttons */}
                        {app.status !== 'Appointed' && app.status !== 'Rejected' && (
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Btn variant="danger" style={{ fontSize: '0.75rem' }} onClick={() => handleRejectApp(app)}>
                              ❌ अर्ज फेटाळा
                            </Btn>
                            <Btn variant="success" style={{ fontSize: '0.75rem' }} onClick={() => handleAppointSpecificCandidate(app)}>
                              🎖️ पद मंजूर करा (Approve & Appoint)
                            </Btn>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: T.softBg, padding: 20, borderRadius: 10, textAlign: 'center', color: T.muted, fontSize: '0.82rem' }}>
                    💡 या पदासाठी अद्याप सदस्यांचा थेट अर्ज आलेला नाही. आपण खाली थेट कोणत्याही नोंदणीकृत सदस्याचे नाव लिहून मॅन्युअल नियुक्ती करू शकता.
                  </div>
                )}
              </div>

              {/* MANUAL NOMINATION FORM */}
              <form onSubmit={handleAppoint} style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: T.ink }}>
                  ✏️ थेट मॅन्युअल शिफारस / शोधून नियुक्ती (Direct Nomination)
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: T.ink, display: 'block', marginBottom: 4 }}>
                    उमेदवाराचे नाव किंवा आयडी (Nominated Candidate Name/ID)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. रुपेश पाटील (ID: MEM-8821)"
                    value={nominatedUser}
                    onChange={e => setNominatedUser(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 800, color: T.ink, display: 'block', marginBottom: 4 }}>
                    नियुक्ती टिपणी / कार्यवृत्त (Resolution Notes)
                  </label>
                  <textarea
                    placeholder="जिल्हा कार्यकारिणीच्या संमतीने थेट नियुक्ती पत्र प्रदान करण्यात येत आहे."
                    value={appointmentNotes}
                    onChange={e => setAppointmentNotes(e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${T.border}`, fontSize: '0.82rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                  <Btn variant="plain" type="button" onClick={() => setActiveRole(null)}>रद्द करा</Btn>
                  <Btn variant="primary" type="submit">🚩 अधिकृत नियुक्ती जाहीर करा</Btn>
                </div>
              </form>
            </div>
          </Modal>
        );
      })()}
    </>
  );
}

/* ============================================================
   17. ROLES & PERMISSIONS
   ============================================================ */
function RolesView({ data, toast }) {
  const defaultRoles = [
    { name: 'Super Admin', perms: 'ALL', color: T.saffron },
    { name: 'State Admin', perms: 'State-level', color: T.amber },
    { name: 'District Admin', perms: 'District-level', color: T.deep },
    { name: 'Chapter Admin', perms: 'Chapter-level', color: T.saffron },
    { name: 'Content Admin', perms: 'CMS only', color: T.amber },
    { name: 'CRM Admin', perms: 'CRM only', color: T.deep }
  ];
  const roles = data.roles.length ? data.roles : defaultRoles;

  return (
    <>
      <SectionTitle subtitle="प्रवेश नियंत्रण">🔑 Roles & Permissions</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
        {roles.map((r, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ color: T.ink }}>{r.name}</strong>
              <span style={{ fontSize: '1.2rem' }}>🔑</span>
            </div>
            <Badge>{r.perms || 'Custom'}</Badge>
            <div style={{ marginTop: 12 }}>
              <Btn variant="plain" onClick={() => toast(`${r.name} संपादित करा`, 'success')}>संपादित</Btn>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   18. AUDIT LOGS
   ============================================================ */
function AuditView({ data }) {
  return (
    <>
      <SectionTitle subtitle="सुरक्षा व सिस्टम क्रियाकलाप">🛡️ Audit Logs</SectionTitle>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
          {data.audit.map((log, i) => (
            <div key={i} style={{
              background: T.softBg, border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${T.saffron}`,
              padding: '10px 14px', borderRadius: 8,
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.78rem'
            }}>
              <div>
                <strong style={{ color: T.saffron }}>[{log.action || 'ACTION'}]</strong>{' '}
                <span style={{ color: T.text, fontWeight: 600 }}>{log.performedBy || 'System'}</span>
                {log.module && <span style={{ color: T.muted }}> • {log.module}</span>}
              </div>
              <span style={{ color: T.muted, fontFamily: 'monospace', fontSize: '0.72rem' }}>
                {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'आत्ताच'}
              </span>
            </div>
          ))}
          {data.audit.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: T.muted, fontWeight: 600 }}>
              कोणतेही लॉग नाहीत
            </div>
          )}
        </div>
      </Card>
    </>
  );
}

/* ============================================================
   19. SETTINGS
   ============================================================ */
function SettingsView({ toast }) {
  return (
    <>
      <SectionTitle subtitle="सिस्टम कॉन्फिगरेशन">⚙️ Settings</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        <Card>
          <div style={{ fontWeight: 900, color: T.ink, marginBottom: 10 }}>🌐 Site Configuration</div>
          <Input label="Site Name" defaultValue="Connect Maratha" />
          <div style={{ height: 10 }} />
          <Input label="Contact Email" defaultValue="admin@connectmaratha.org" />
          <div style={{ height: 10 }} />
          <Btn variant="primary" onClick={() => toast('जतन केले!', 'success')}>जतन करा</Btn>
        </Card>
        <Card>
          <div style={{ fontWeight: 900, color: T.ink, marginBottom: 10 }}>🔔 Notifications</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
            {['Email alerts', 'SMS alerts', 'Push notifications', 'Weekly digest'].map((x, i) => (
              <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span style={{ fontWeight: 600 }}>{x}</span>
              </label>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontWeight: 900, color: T.ink, marginBottom: 10 }}>🔒 Security</div>
          <div style={{ fontSize: '0.82rem', color: T.muted, lineHeight: 1.7 }}>
            • Session timeout: 60 min<br />
            • 2FA: Disabled<br />
            • IP whitelist: Not set<br />
            • Audit logging: Enabled
          </div>
        </Card>
      </div>
    </>
  );
}

/* ============================================================
   20. GENERIC LIST (chapters, admins, etc.)
   ============================================================ */
function GenericListView({ title, icon, items = [], columns }) {
  return (
    <>
      <SectionTitle>{icon} {title}</SectionTitle>
      <Card style={{ padding: 0 }}>
        <Table headers={columns} rows={items} />
      </Card>
    </>
  );
}
