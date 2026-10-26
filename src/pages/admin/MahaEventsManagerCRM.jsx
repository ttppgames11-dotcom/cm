import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MAHA_EVENTS_LIST, getMahaEventById } from '../../data/mahaEventsData';
import apiClient from '../../services/apiClient';
import { MAHARASHTRA_DISTRICTS } from '../../services/referralService';

/* =======================================================================
   🚩 CONNECT MARATHA — १५ महा-उपक्रम व्यवस्थापन प्रणाली (15 Maha-Events CRM)
   Full Lifecycle: Proposal -> Approvals -> Registration -> Tasks -> Final Report
   ======================================================================= */

export default function MahaEventsManagerCRM() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialEventId = searchParams.get('event') || 'EVT-01-JOBFAIR';

  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'proposals' | 'registrations' | 'tasks' | 'budget' | 'reports' | 'all_events'
  const [selectedDistrict, setSelectedDistrict] = useState('पुणे');
  const [selectedState, setSelectedState] = useState('महाराष्ट्र');
  const [toastMsg, setToastMsg] = useState(null);

  // Dynamic Event Proposal & Workflow States
  const [proposals, setProposals] = useState([
    {
      id: 'PROP-2026-081',
      eventNumber: 1,
      title: 'पुणे जिल्हास्तरीय भव्य मेगा जॉब फेयर २०२६',
      district: 'पुणे',
      taluka: 'हवेली',
      venue: 'बाणेर स्पोर्ट्स कॉम्प्लेक्स, पुणे',
      proposedDate: '2026-07-18',
      budget: 850000,
      expectedCandidates: 5000,
      status: 'मंजूर (Approved)',
      approvedBy: 'श्री. प्रतापराव पवार (प्रदेशाध्यक्ष)',
      submittedBy: 'आनंदराव देशमुख (जिल्हा समन्वयक)'
    },
    {
      id: 'PROP-2026-082',
      eventNumber: 2,
      title: 'क्रांतिदिन राज्यव्यापी रक्तदान शिबिर',
      district: 'छत्रपती संभाजीनगर',
      taluka: 'मध्यवर्ती',
      venue: 'जिल्हा मराठा भवन सभागृह',
      proposedDate: '2026-08-09',
      budget: 180000,
      expectedCandidates: 800,
      status: 'तपासणी सुरू (Under Review)',
      approvedBy: 'प्रलंबित (Pending)',
      submittedBy: 'श्री. संदीपान भुमरे (विभागीय अध्यक्ष)'
    },
    {
      id: 'PROP-2026-083',
      eventNumber: 4,
      title: 'पश्चिम महाराष्ट्र B2B इंडस्ट्रियल एक्स्पो',
      district: 'कोल्हापूर',
      taluka: 'करवीर',
      venue: 'मेरी वेदर ग्राउंड, कोल्हापूर',
      proposedDate: '2026-09-24',
      budget: 2500000,
      expectedCandidates: 12000,
      status: 'मंजूर (Approved)',
      approvedBy: 'केंद्रीय समिती (SuperAdmin)',
      submittedBy: 'संजय पाटील (जिल्हाध्यक्ष)'
    }
  ]);

  // Tasks Management
  const [tasks, setTasks] = useState([
    { id: 'TSK-101', eventId: 'EVT-01-JOBFAIR', title: '५० कॉर्पोरेट कंपन्यांशी HR सामंजस्य करार', assignee: 'रोजगार अधिकारी', due: '2026-07-05', priority: 'High', status: 'In Progress', progress: 70 },
    { id: 'TSK-102', eventId: 'EVT-01-JOBFAIR', title: 'हॉल आणि १०० मुलाखत बुथ मंडप आरक्षण', assignee: 'इव्हेंट मॅनेजर', due: '2026-07-10', priority: 'High', status: 'Completed', progress: 100 },
    { id: 'TSK-103', eventId: 'EVT-01-JOBFAIR', title: 'विद्यार्थी QR कोड पासेस ऑटो-जनरेशन टेस्ट', assignee: 'IT समन्वयक', due: '2026-07-12', priority: 'Medium', status: 'Completed', progress: 100 },
    { id: 'TSK-104', eventId: 'EVT-02-BLOOD', title: 'ससून ब्लड बँक व्हॅन व ६ डॉक्टरांचे पथक निश्चिती', assignee: 'सेवा प्रमुख', due: '2026-08-01', priority: 'High', status: 'In Progress', progress: 60 }
  ]);

  // Dynamic Registrations
  const [registrations, setRegistrations] = useState([
    { id: 'REG-8801', name: 'अमित संभाजी जाधव', eventId: 'EVT-01-JOBFAIR', phone: '9822114455', qualification: 'BE Mechanical', company: 'Tata Motors', status: 'Approved', pass: 'PASS-8801' },
    { id: 'REG-8802', name: 'पूजा विष्णू पाटील', eventId: 'EVT-01-JOBFAIR', phone: '9877223311', qualification: 'MBA HR', company: 'Infosys BPM', status: 'Approved', pass: 'PASS-8802' },
    { id: 'REG-8803', name: 'रोहन दत्तात्रय कदम', eventId: 'EVT-01-JOBFAIR', phone: '9866554433', qualification: 'BSc Computer', company: 'Cognizant', status: 'In Review', pass: 'PASS-8803' }
  ]);

  // New Proposal Form
  const [showNewProposalModal, setShowNewProposalModal] = useState(false);
  const [newPropTitle, setNewPropTitle] = useState('');
  const [newPropDate, setNewPropDate] = useState('2026-08-15');
  const [newPropVenue, setNewPropVenue] = useState('');
  const [newPropBudget, setNewPropBudget] = useState('500000');
  const [newPropBeneficiaries, setNewPropBeneficiaries] = useState('2000');
  const [newPropObjective, setNewPropObjective] = useState('');

  // New Registration Form
  const [showRegModal, setShowRegModal] = useState(false);
  const [newRegName, setNewRegName] = useState('');
  const [newRegPhone, setNewRegPhone] = useState('');
  const [newRegField1, setNewRegField1] = useState('');
  const [newRegField2, setNewRegField2] = useState('');

  const currentEvent = getMahaEventById(selectedEventId);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSelectEvent = (evtId) => {
    setSelectedEventId(evtId);
    setSearchParams({ event: evtId });
  };

  const handleCreateProposal = (e) => {
    e.preventDefault();
    if (!newPropTitle) return alert('प्रस्तावाचे नाव आवश्यक आहे.');
    const newP = {
      id: `PROP-2026-${Math.floor(100 + Math.random() * 900)}`,
      eventNumber: currentEvent.number,
      title: newPropTitle,
      district: selectedDistrict,
      taluka: 'मध्यवर्ती',
      venue: newPropVenue || `${selectedDistrict} मध्यवर्ती सभागृह`,
      proposedDate: newPropDate,
      budget: parseInt(newPropBudget, 10) || 100000,
      expectedCandidates: parseInt(newPropBeneficiaries, 10) || 500,
      status: 'मंजुरीसाठी प्रलंबित (Pending Approval)',
      approvedBy: 'जिल्हा / राज्य छाननी कक्ष',
      submittedBy: 'स्थानिक समन्वयक'
    };
    setProposals([newP, ...proposals]);
    setShowNewProposalModal(false);
    setNewPropTitle('');
    showToast(`✓ '${newPropTitle}' हा कार्यक्रम प्रस्ताव यशस्वीरीत्या सादर झाला!`);
  };

  const handleAddRegistration = (e) => {
    e.preventDefault();
    if (!newRegName || !newRegPhone) return alert('नाव व मोबाईल क्रमांक आवश्यक आहे.');
    const newReg = {
      id: `REG-${Math.floor(8000 + Math.random() * 1999)}`,
      name: newRegName,
      eventId: currentEvent.id,
      phone: newRegPhone,
      qualification: newRegField1 || 'पदवीधर',
      company: newRegField2 || 'सहभागी',
      status: 'Approved',
      pass: `PASS-${Math.floor(1000 + Math.random() * 9000)}`
    };
    setRegistrations([newReg, ...registrations]);
    setShowRegModal(false);
    setNewRegName('');
    setNewRegPhone('');
    setNewRegField1('');
    setNewRegField2('');
    showToast(`✓ '${newRegName}' यांची ${currentEvent.name} साठी थेट नोंदणी झाली!`);
  };

  const handleApproveProposal = (propId) => {
    setProposals(prev => prev.map(p => p.id === propId ? { ...p, status: 'मंजूर (Approved)', approvedBy: 'केंद्रीय समिती' } : p));
    showToast(`✓ प्रस्ताव #${propId} अधिकृतपणे मंजूर करण्यात आला!`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b1120', color: '#f8fafc', paddingBottom: '80px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#ea580c',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          zIndex: 99999,
          fontWeight: 700
        }}>
          {toastMsg}
        </div>
      )}

      {/* TOP COMMAND HEADER */}
      <div style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.8rem', background: 'rgba(234, 88, 12, 0.2)', padding: '6px 12px', borderRadius: '12px' }}>🚩</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', background: '#ea580c', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  15 MAHA-EVENTS CRM
                </span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Connect Maratha वार्षिक महा-उपक्रम व्यवस्थापन</span>
              </div>
              <h1 style={{ margin: '2px 0 0', fontSize: '1.35rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                १५ महा-उपक्रम मास्टर संचलन नियंत्रण कक्ष
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>राज्य:</label>
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                style={{ background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                <option value="महाराष्ट्र">महाराष्ट्र (Maharashtra)</option>
                <option value="कर्नाटक">कर्नाटक (Karnataka)</option>
                <option value="गोवा">गोवा (Goa)</option>
                <option value="गुजरात">गुजरात (Gujarat)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>जिल्हा:</label>
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                style={{ background: '#1e293b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowNewProposalModal(true)}
              style={{
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
              }}
            >
              <span>➕</span>
              <span>नवीन कार्यक्रम प्रस्ताव सादर करा</span>
            </button>

            <Link
              to="/crm"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '8px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              🏛️ CRM मुख्य हब
            </Link>
          </div>
        </div>
      </div>

      {/* 15 EVENTS SELECTOR HORIZONTAL CAROUSEL BAR */}
      <div style={{ background: '#090d16', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', overflowX: 'auto' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', gap: '8px', minWidth: '1300px' }}>
          {MAHA_EVENTS_LIST.map((evt) => {
            const isSelected = selectedEventId === evt.id;
            return (
              <button
                key={evt.id}
                onClick={() => handleSelectEvent(evt.id)}
                style={{
                  background: isSelected ? evt.gradient : 'rgba(255,255,255,0.03)',
                  border: isSelected ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                  color: isSelected ? '#fff' : '#94a3b8',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? `0 4px 16px ${evt.themeColor}55` : 'none'
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>{evt.icon}</span>
                <div>
                  <div style={{ fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 800 }}>
                    #{evt.number} • {evt.plannedMonth}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    {evt.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>

        {/* SELECTED EVENT HERO BANNER */}
        <div style={{
          background: currentEvent.gradient,
          borderRadius: '20px',
          padding: '30px 32px',
          marginBottom: '28px',
          boxShadow: `0 12px 36px ${currentEvent.themeColor}33`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 2 }}>
            <div style={{ maxWidth: '850px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                  उपक्रम #{currentEvent.number} • वर्गवारी: {currentEvent.category}
                </span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                  नियोजित स्तर: {currentEvent.level}
                </span>
                <span style={{ background: '#fff', color: currentEvent.themeColor, padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 900 }}>
                  📅 {currentEvent.plannedMonth}
                </span>
              </div>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 900, margin: '6px 0 8px', letterSpacing: '-0.02em', color: '#fff' }}>
                {currentEvent.icon} {currentEvent.name}
              </h2>
              <p style={{ margin: 0, fontSize: '1.05rem', color: '#f1f5f9', opacity: 0.95, lineHeight: 1.5 }}>
                {currentEvent.tagline}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowRegModal(true)}
                style={{
                  background: '#fff',
                  color: currentEvent.themeColor,
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                }}
              >
                <span>📝</span>
                <span>सहभागी नोंदणी फॉर्म</span>
              </button>
              <button
                onClick={() => setShowNewProposalModal(true)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                📋 नवीन प्रस्ताव
              </button>
            </div>
          </div>
        </div>

        {/* 4 DYNAMIC EVENT KPIS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {currentEvent.primaryKPIs.map((kpi, idx) => (
            <div
              key={idx}
              style={{
                background: '#131b2e',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '20px 22px',
                borderLeft: `4px solid ${currentEvent.themeColor}`
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '6px 0 2px' }}>
                {kpi.defaultTarget.toLocaleString('mr-IN')}
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginLeft: '6px' }}>{kpi.unit}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                ✓ {selectedDistrict} जिल्ह्यासाठी मंजूर वार्षिक उद्दिष्ट
              </div>
            </div>
          ))}
        </div>

        {/* NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'overview', label: '📊 उपक्रम आढावा व विशेष फील्ड्स', icon: '🔍' },
            { id: 'proposals', label: `📋 कार्यक्रम प्रस्ताव (${proposals.length})`, icon: '📝' },
            { id: 'registrations', label: `👥 नोंदणी व चेक-इन (${registrations.length})`, icon: '🎟️' },
            { id: 'tasks', label: `⚡ कार्य नियोजन (Tasks - ${tasks.length})`, icon: '📌' },
            { id: 'all_events', label: '📅 १५ महा-उपक्रम संपूर्ण कॅलेंडर', icon: '🏛️' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? 'rgba(234, 88, 12, 0.15)' : 'transparent',
                  color: isActive ? '#ea580c' : '#94a3b8',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #ea580c' : '2px solid transparent',
                  padding: '10px 18px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & SPECIAL FIELDS */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            
            {/* Special Configured Fields for this Event */}
            <div style={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚙️</span>
                <span>या उपक्रमाची विशेष फील्ड्स (Specialized Modules)</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '18px' }}>
                {currentEvent.name} साठी Connect Maratha CRM ने विशेष डेटा फील्ड्स आरक्षित केली आहेत:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentEvent.specialFields.map((f, i) => (
                  <div key={i} style={{ background: '#1e293b', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#f8fafc' }}>{f.label}</strong>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', color: '#94a3b8' }}>
                        {f.type}
                      </span>
                    </div>
                    {f.options ? (
                      <div style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                        पर्याय: {f.options.join(', ')}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        नमुना: {f.placeholder}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Standard Operating Action Checklist */}
            <div style={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '1.15rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span>
                <span>मानक कृती आराखडा (SOP Checklist)</span>
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '18px' }}>
                उपक्रमाच्या यशस्वी आयोजनासाठी प्रत्येक जिल्हा व तालुका स्तराने खालील टप्पे पूर्ण करणे अनिवार्य आहे:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentEvent.actionChecklist.map((act, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#1e293b', padding: '12px 14px', borderRadius: '10px' }}>
                    <span style={{ color: '#10b981', fontWeight: 900 }}>✓</span>
                    <span style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.4 }}>{act}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '24px', background: 'rgba(234, 88, 12, 0.1)', border: '1px solid rgba(234, 88, 12, 0.3)', padding: '16px', borderRadius: '12px' }}>
                <strong style={{ fontSize: '0.88rem', color: '#ea580c', display: 'block', marginBottom: '4px' }}>
                  🔒 Approval & Audit Control Policy
                </strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                  कार्यक्रमाचा अंतिम अहवाल (Final Report) व खर्च मंजुरी वरिष्ठ राज्य / विभागीय समितीच्या डिजिटल स्वाक्षरीनंतरच अधिकृतरीत्या बंद (Archived) होईल.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: PROPOSALS & APPROVAL WORKFLOW */}
        {activeTab === 'proposals' && (
          <div style={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  कार्यक्रम प्रस्ताव व मंजुरी वर्कफ्लो (Proposals Queue)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  शाखा व तालुका पातळीवरून आलेले प्रस्ताव, बजेट तपासणी व राज्यस्तरीय मंजुरी
                </p>
              </div>
              <button
                onClick={() => setShowNewProposalModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                ➕ नवीन प्रस्ताव जोडा
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', color: '#e2e8f0' }}>
                <thead>
                  <tr style={{ background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>प्रस्ताव क्र.</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>कार्यक्रमाचे नाव</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>जिल्हा / तालुका</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>नियोजित तारीख</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>अंदाजित बजेट</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>अपेक्षित लाभार्थी</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>स्थिती (Status)</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>कृती (Action)</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#ea580c' }}>{p.id}</td>
                      <td style={{ padding: '12px' }}>
                        <strong>{p.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>सादरकर्ता: {p.submittedBy}</div>
                      </td>
                      <td style={{ padding: '12px' }}>{p.district} ({p.taluka})</td>
                      <td style={{ padding: '12px' }}>{p.proposedDate}</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#38bdf8' }}>₹{p.budget.toLocaleString('mr-IN')}</td>
                      <td style={{ padding: '12px' }}>{p.expectedCandidates.toLocaleString('mr-IN')}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: p.status.includes('Approved') || p.status.includes('मंजूर') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 88, 12, 0.2)',
                          color: p.status.includes('Approved') || p.status.includes('मंजूर') ? '#10b981' : '#f97316',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {p.status.includes('मंजूर') ? (
                          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>✓ मंजूर झाले</span>
                        ) : (
                          <button
                            onClick={() => handleApproveProposal(p.id)}
                            style={{
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            मंजुरी द्या
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: REGISTRATIONS & CHECK-IN */}
        {activeTab === 'registrations' && (
          <div style={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  सहभागी नोंदणी व डिजिटल पासेस (Event Registrations & QR Check-in)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  कार्यक्रमासाठी आलेले अर्जदार, पडताळणी स्थिती आणि हजेरी नोंद
                </p>
              </div>
              <button
                onClick={() => setShowRegModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                ➕ नवीन सहभागी जोडा
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', color: '#e2e8f0' }}>
                <thead>
                  <tr style={{ background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>नोंदणी क्र.</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>सहभागीचे नाव</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>मोबाईल</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>तपशील / पात्रता</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>कंपनी / गट</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>डिजिटल पास</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>स्थिती</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontWeight: 800, color: '#ea580c' }}>{r.id}</td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>{r.name}</td>
                      <td style={{ padding: '12px', color: '#94a3b8' }}>{r.phone}</td>
                      <td style={{ padding: '12px' }}>{r.qualification}</td>
                      <td style={{ padding: '12px' }}>{r.company}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                          🎟️ {r.pass}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                          ✓ {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TASKS MANAGEMENT */}
        {activeTab === 'tasks' && (
          <div style={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  उपक्रम कार्य नियोजन व जबाबदारी वाटप (Task & Follow-up Matrix)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                  प्रत्येक कर्मचाऱ्याला काम, अंतिम मुदत आणि प्रगती अहवाल
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {tasks.map(t => (
                <div key={t.id} style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 800 }}>{t.id}</span>
                    <span style={{
                      fontSize: '0.7rem',
                      background: t.priority === 'High' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                      color: t.priority === 'High' ? '#ef4444' : '#38bdf8',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 800
                    }}>
                      {t.priority} Priority
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 10px', fontSize: '0.98rem', fontWeight: 800, color: '#fff' }}>
                    {t.title}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
                    👤 नियुक्त: <strong>{t.assignee}</strong> | 📅 मुदत: <strong>{t.due}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${t.progress}%`, background: t.progress === 100 ? '#10b981' : '#ea580c', height: '100%' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: t.progress === 100 ? '#10b981' : '#fff' }}>
                      {t.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ALL 15 EVENTS MASTER CALENDAR & DIRECTORY */}
        {activeTab === 'all_events' && (
          <div style={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 900, color: '#fff' }}>
              १५ वार्षिक महा-उपक्रम संपूर्ण वार्षिक कॅलेंडर व उद्दिष्ट आराखडा
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: '#94a3b8' }}>
              Connect Maratha अधिकृत वार्षिक उपक्रम मार्गदर्शक सूची:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {MAHA_EVENTS_LIST.map((evt) => (
                <div
                  key={evt.id}
                  onClick={() => handleSelectEvent(evt.id)}
                  style={{
                    background: selectedEventId === evt.id ? 'rgba(234, 88, 12, 0.15)' : '#1e293b',
                    border: selectedEventId === evt.id ? '1px solid #ea580c' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{evt.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#ea580c', fontWeight: 800 }}>
                        उपक्रम #{evt.number} • {evt.plannedMonth}
                      </div>
                      <strong style={{ fontSize: '0.98rem', color: '#fff' }}>
                        {evt.name}
                      </strong>
                    </div>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {evt.tagline}
                  </p>
                  <div style={{ fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '6px', color: '#cbd5e1' }}>
                    स्तर: <strong>{evt.level}</strong> | वर्गवारी: <strong>{evt.category}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: ADD NEW PROPOSAL */}
      {showNewProposalModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', maxWidth: '540px', width: '100%', color: '#fff', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                📋 {currentEvent.name} साठी नवीन प्रस्ताव सादर करा
              </h3>
              <button onClick={() => setShowNewProposalModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateProposal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>प्रस्तावाचे नाव / शीर्षक *</label>
                <input
                  type="text"
                  required
                  value={newPropTitle}
                  onChange={e => setNewPropTitle(e.target.value)}
                  placeholder={`उदा. ${selectedDistrict} ${currentEvent.name} २०२६`}
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>प्रस्तावित तारीख *</label>
                  <input
                    type="date"
                    required
                    value={newPropDate}
                    onChange={e => setNewPropDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>अंदाजित बजेट (₹)</label>
                  <input
                    type="number"
                    value={newPropBudget}
                    onChange={e => setNewPropBudget(e.target.value)}
                    placeholder="उदा. 500000"
                    style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>नियोजित स्थळ (Venue)</label>
                <input
                  type="text"
                  value={newPropVenue}
                  onChange={e => setNewPropVenue(e.target.value)}
                  placeholder={`उदा. ${selectedDistrict} मध्यवर्ती सभागृह / क्रीडा संकुल`}
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>अपेक्षित लाभार्थी संख्या</label>
                <input
                  type="number"
                  value={newPropBeneficiaries}
                  onChange={e => setNewPropBeneficiaries(e.target.value)}
                  placeholder="उदा. 2500"
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewProposalModal(false)}
                  style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', background: '#ea580c', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                >
                  प्रस्ताव सबमिट करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PARTICIPANT REGISTRATION */}
      {showRegModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', maxWidth: '500px', width: '100%', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                📝 {currentEvent.name} — थेट नोंदणी
              </h3>
              <button onClick={() => setShowRegModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>सहभागीचे पूर्ण नाव *</label>
                <input
                  type="text"
                  required
                  value={newRegName}
                  onChange={e => setNewRegName(e.target.value)}
                  placeholder="उदा. चि. अमित मारुती पाटील"
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>मोबाईल क्रमांक *</label>
                <input
                  type="tel"
                  required
                  value={newRegPhone}
                  onChange={e => setNewRegPhone(e.target.value)}
                  placeholder="उदा. 9822000000"
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  {currentEvent.specialFields[0]?.label || 'शिक्षण / पात्रता'}
                </label>
                <input
                  type="text"
                  value={newRegField1}
                  onChange={e => setNewRegField1(e.target.value)}
                  placeholder={currentEvent.specialFields[0]?.placeholder || 'उदा. BE Mechanical / 12th Pass'}
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                  {currentEvent.specialFields[1]?.label || 'कंपनी / गट / आवड'}
                </label>
                <input
                  type="text"
                  value={newRegField2}
                  onChange={e => setNewRegField2(e.target.value)}
                  placeholder={currentEvent.specialFields[1]?.placeholder || 'उदा. IT & Software / रक्तगट B+'}
                  style={{ width: '100%', padding: '10px 12px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', background: '#ea580c', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                >
                  नोंदणी करा व पास तयार करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
