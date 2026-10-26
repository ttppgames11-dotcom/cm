import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import CRMScopeSwitcher from '../../components/layout/CRMScopeSwitcher';
import { useAuth } from '../../context/AuthContext';

export default function CenterOperationsDeskCRM() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('daily_log'); // 'daily_log' | 'visitors' | 'bookings' | 'cash_counter' | 'counseling' | 'inventory'
  const [activeSubRole, setActiveSubRole] = useState('manager'); // 'manager' | 'cashier' | 'counselor' | 'operator' | 'clerk'
  const [selectedCenter, setSelectedCenter] = useState('मध्यवर्ती कम्युनिटी सेंटर, पुणे');
  const [toastMsg, setToastMsg] = useState(null);

  // Daily log state
  const [logs, setLogs] = useState([
    { id: 'LOG-001', time: '०९:३० AM', action: 'केंद्र उघडले, दैनिक स्वच्छता व बैठक व्यवस्था तपासली.', staff: 'महेश पाटील (व्यवस्थापक)' },
    { id: 'LOG-002', time: '१०:१५ AM', action: '१० नवीन वधू-वर बायोडाटा नोंदणी व प्राथमिक पडताळणी पूर्ण.', staff: 'सौ. अनिता कदम (Counselor)' },
    { id: 'LOG-003', time: '११:०० AM', action: 'कौशल्य प्रशिक्षण वर्गासाठी १५ युवकांचे मार्गदर्शन सत्र.', staff: 'श्री. सचिन मोरे (Operator)' },
    { id: 'LOG-004', time: '१२:३० PM', action: 'ऑफलाईन रक्तदान शिबिर देणगी पावती ₹११,००० जमा.', staff: 'श्री. आनंद पवार (Cashier)' }
  ]);
  const [newLogEntry, setNewLogEntry] = useState('');

  // Visitors queue
  const [visitors, setVisitors] = useState([
    { id: 'VIS-101', name: 'तानाजी विठ्ठलराव जाधव', phone: '9822011001', purpose: 'वधू-वर शोध व कुंडली नोंदणी', desk: 'मॅट्रिमोनी कक्ष', time: '१०:४५ AM', status: 'In Consultation' },
    { id: 'VIS-102', name: 'सुहास मारुती कदम', phone: '9822011002', purpose: 'नवीन व्यवसाय नोंदणी व B2B संगम', desk: 'उद्योग साहाय्य कक्ष', time: '११:१० AM', status: 'Waiting' },
    { id: 'VIS-103', name: 'संगीता विजय पाटील', phone: '9822011003', purpose: 'महिला बचत गट कर्ज मार्गदर्शन', desk: 'महिला कक्ष', time: '११:३० AM', status: 'Completed' },
    { id: 'VIS-104', name: 'ज्ञानेश्वर शिंदे', phone: '9822011004', purpose: 'उच्च शिक्षण शिष्यवृत्ती अर्ज', desk: 'शिक्षण डेस्क', time: '१२:०० PM', status: 'Waiting' }
  ]);

  // Visitor form
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('');
  const [visitorDesk, setVisitorDesk] = useState('सामान्य मदत कक्ष');

  // Cash Counter (Receipt Generation)
  const [receipts, setReceipts] = useState([
    { id: 'RCP-801', payer: 'तानाजी जाधव', amount: 500, category: 'वधू-वर नोंदणी फी', mode: 'Cash', date: '२६-१०-२०२६' },
    { id: 'RCP-802', payer: 'सुहास कदम', amount: 1200, category: 'B2B डिरेक्टरी वर्गणी', mode: 'UPI', date: '२६-१०-२०२६' },
    { id: 'RCP-803', payer: 'अनामिक देणगीदार', amount: 5000, category: 'केंद्र संवर्धन देणगी', mode: 'UPI', date: '२६-१०-२०२६' }
  ]);
  const [receiptPayer, setReceiptPayer] = useState('');
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptCategory, setReceiptCategory] = useState('वधू-वर नोंदणी फी');
  const [receiptMode, setReceiptMode] = useState('Cash');

  // Counseling Cases
  const [counselingCases, setCounselingCases] = useState([
    { id: 'CNS-01', candidate: 'रोहन दिलीप सावंत (वय २८, BE Mech)', category: 'मॅट्रिमोनी समुपदेशन', notes: 'अपेक्षा: आयटी किंवा इंजिनीअरिंग मधील अनुरूप स्थळ. २ स्थळांचे संपर्क दिले.', status: 'Active' },
    { id: 'CNS-02', candidate: 'पूजा संभाजी मोरे (वय २१, B.Sc)', category: 'करिअर व स्पर्धा परीक्षा', notes: 'MPSC राज्यसेवा परीक्षा तयारी साहाय्य व ग्रंथालय पास दिला.', status: 'Completed' },
    { id: 'CNS-03', candidate: 'गणेश तुकाराम जगताप', category: 'व्यवसाय मार्गदर्शन', notes: 'कृषी प्रक्रिया व पॅकेजिंग युनिट कर्ज प्रपोजल तयार करण्यास मदत.', status: 'Active' }
  ]);
  const [caseCandidate, setCaseCandidate] = useState('');
  const [caseCategory, setCaseCategory] = useState('मॅट्रिमोनी समुपदेशन');
  const [caseNotes, setCaseNotes] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    if (!newLogEntry.trim()) return;
    const newLog = {
      id: `LOG-${String(logs.length + 1).padStart(3, '0')}`,
      time: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
      action: newLogEntry,
      staff: `${user?.name || 'व्यवस्थापक'} (${activeSubRole.toUpperCase()})`
    };
    setLogs([newLog, ...logs]);
    setNewLogEntry('');
    showToast('दैनिक कार्यनोंद यशस्वीरीत्या जोडली गेली!');
  };

  const handleAddVisitor = (e) => {
    e.preventDefault();
    if (!visitorName || !visitorPhone) return;
    const newVis = {
      id: `VIS-${Date.now().toString().slice(-3)}`,
      name: visitorName,
      phone: visitorPhone,
      purpose: visitorPurpose || 'सामान्य चौकशी',
      desk: visitorDesk,
      time: new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Waiting'
    };
    setVisitors([newVis, ...visitors]);
    setVisitorName('');
    setVisitorPhone('');
    setVisitorPurpose('');
    showToast(`अभ्यागत '${visitorName}' ची नोंद करण्यात आली!`);
  };

  const handleGenerateReceipt = (e) => {
    e.preventDefault();
    if (!receiptPayer || !receiptAmount) return;
    const rcp = {
      id: `RCP-${Date.now().toString().slice(-3)}`,
      payer: receiptPayer,
      amount: Number(receiptAmount),
      category: receiptCategory,
      mode: receiptMode,
      date: new Date().toLocaleDateString('mr-IN')
    };
    setReceipts([rcp, ...receipts]);
    setReceiptPayer('');
    setReceiptAmount('');
    showToast(`₹${rcp.amount} ची अधिकृत पावती #${rcp.id} जारी करण्यात आली!`);
  };

  const handleAddCounseling = (e) => {
    e.preventDefault();
    if (!caseCandidate || !caseNotes) return;
    const cns = {
      id: `CNS-${String(counselingCases.length + 1).padStart(2, '0')}`,
      candidate: caseCandidate,
      category: caseCategory,
      notes: caseNotes,
      status: 'Active'
    };
    setCounselingCases([cns, ...counselingCases]);
    setCaseCandidate('');
    setCaseNotes('');
    showToast('समुपदेशन केस नोंदवली गेली!');
  };

  const SUB_ROLES = [
    { key: 'manager', label: 'फ्लोर मॅनेजर (Manager)', icon: '🏢' },
    { key: 'cashier', label: 'कॅशियर व पावती कक्ष (Cashier)', icon: '💰' },
    { key: 'counselor', label: 'समुपदेशक (Counselor Desk)', icon: '🤝' },
    { key: 'operator', label: 'डेटा ऑपरेटर (Operator)', icon: '💻' },
    { key: 'clerk', label: 'नोंदणी कारकून (Clerk)', icon: '📁' }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#0f172a', paddingBottom: '60px' }}>

      {/* Toast */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: '#059669',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '10px',
          fontWeight: 700,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 9999
        }}>
          {toastMsg}
        </div>
      )}

      {/* Top Header */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)', color: '#fff', padding: '26px 32px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '26px' }}>🏬</span>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 900 }}>
                कम्युनिटी सेंटर ऑपरेशन्स डेस्क — दैनिक कार्यप्रवाह व फ्रंट ऑफिस
              </h1>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                OPERATIONS MANAGER & DESK STAFF
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
              केंद्रातील दैनंदिन अभ्यागत (Visitors), पावती संकलन, समुपदेशन कक्ष व फ्रंट डेस्क ऑपरेशन्स
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Center Selector */}
            <select
              value={selectedCenter}
              onChange={e => setSelectedCenter(e.target.value)}
              style={{ background: '#fff', color: '#064e3b', border: 'none', padding: '9px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
            >
              <option value="मध्यवर्ती कम्युनिटी सेंटर, पुणे">मध्यवर्ती कम्युनिटी सेंटर, पुणे</option>
              <option value="छत्रपती शिवाजी महाराज केंद्र, कोल्हापूर">छत्रपती शिवाजी महाराज केंद्र, कोल्हापूर</option>
              <option value="जिजाऊ महिला साहाय्य केंद्र, सातारा">जिजाऊ महिला साहाय्य केंद्र, सातारा</option>
              <option value="नाशिक विभाग कम्युनिटी सेंटर">नाशिक विभाग कम्युनिटी सेंटर</option>
            </select>

            <Link
              to="/crm/center"
              style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', padding: '9px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}
            >
              🏢 केंद्र संचालक (Owner View) →
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 32px' }}>
        
        {/* Desk Role Sub-Switcher */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '12px 16px', border: '1px solid #e2e8f0', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>कार्यकारी डेस्क निवडा:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {SUB_ROLES.map(r => (
                <button
                  key={r.key}
                  onClick={() => setActiveSubRole(r.key)}
                  style={{
                    background: activeSubRole === r.key ? '#059669' : '#f1f5f9',
                    color: activeSubRole === r.key ? '#fff' : '#334155',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{r.icon}</span> {r.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
            ● आजचे सक्रिय केंद्र: <strong>{selectedCenter}</strong>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>आजचे अभ्यागत (Visitors)</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#047857', marginTop: '4px' }}>{visitors.length} व्यक्ती</div>
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>सर्व डेस्क चौकशी</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>दैनिक रोख संकलन (Cashier)</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>
              ₹{receipts.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{receipts.length} पावत्या जारी</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>समुपदेशन केसेस (Counseling)</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#2563eb', marginTop: '4px' }}>{counselingCases.length} प्रकरणे</div>
            <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '4px' }}>वधू-वर व करिअर मार्गदर्शन</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>दैनिक कार्य नोंदी (Log Entries)</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#7c3aed', marginTop: '4px' }}>{logs.length} नोंदी</div>
            <div style={{ fontSize: '11px', color: '#7c3aed', marginTop: '4px' }}>सुरक्षा व कार्यप्रवाह</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '24px', overflowX: 'auto' }}>
          {[
            { id: 'daily_log', label: '📋 दैनिक कार्यनोंद वही (Log Book)' },
            { id: 'visitors', label: `👥 अभ्यागत नोंदणी (${visitors.length})` },
            { id: 'cash_counter', label: `💰 कॅश काउंटर व पावत्या (${receipts.length})` },
            { id: 'counseling', label: `🤝 समुपदेशन कक्ष (${counselingCases.length})` }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 18px',
                fontWeight: activeTab === t.id ? 800 : 600,
                color: activeTab === t.id ? '#047857' : '#64748b',
                borderBottom: activeTab === t.id ? '3px solid #047857' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '13px',
                whiteSpace: 'nowrap'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: DAILY LOG BOOK */}
        {activeTab === 'daily_log' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#064e3b' }}>
                📋 केंद्राची आजची दैनंदिन कार्यनोंद वही (Daily Log)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {logs.map(l => (
                  <div key={l.id} style={{ padding: '12px 16px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#047857' }}>{l.id} • {l.time}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{l.staff}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: 600 }}>{l.action}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#064e3b' }}>
                ✍️ नवीन दैनिक नोंद जोडा
              </h3>
              <form onSubmit={handleAddLog} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', fontWeight: 700 }}>कृती किंवा घटनेचा तपशील *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="उदा. दुपारी २ वाजता तालुका अध्यक्षांची भेट, सभागृह पाहणी..."
                    value={newLogEntry}
                    onChange={e => setNewLogEntry(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ background: '#059669', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                >
                  ✓ लॉग बुकमध्ये नोंदवा
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: VISITORS INTAKE */}
        {activeTab === 'visitors' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#064e3b' }}>
                👥 आजचे प्रत्यक्ष अभ्यागत (Visitors In-Queue)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {visitors.map(v => (
                  <div key={v.id} style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{v.name}</span>
                      <span style={{ background: v.status === 'Completed' ? '#dcfce7' : '#fef3c7', color: v.status === 'Completed' ? '#166534' : '#92400e', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                        {v.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      📞 {v.phone} • वेळ: {v.time} • कक्ष: <strong>{v.desk}</strong>
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', marginTop: '6px' }}>
                      विषय: {v.purpose}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#064e3b' }}>
                ➕ नवीन अभ्यागत नोंदणी (Walk-in Form)
              </h3>
              <form onSubmit={handleAddVisitor} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 700 }}>अभ्यागताचे नाव *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. श्री. विकास कदम"
                    value={visitorName}
                    onChange={e => setVisitorName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 700 }}>मोबाईल नंबर *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="उदा. 9822000000"
                    value={visitorPhone}
                    onChange={e => setVisitorPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 700 }}>कोणत्या डेस्कवर भेटायचे आहे?</label>
                  <select
                    value={visitorDesk}
                    onChange={e => setVisitorDesk(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="सामान्य मदत कक्ष">सामान्य मदत कक्ष</option>
                    <option value="मॅट्रिमोनी कक्ष">वधू-वर (मॅट्रिमोनी) कक्ष</option>
                    <option value="उद्योग साहाय्य कक्ष">उद्योग व B2B संगम कक्ष</option>
                    <option value="महिला कक्ष">महिला बचत गट कक्ष</option>
                    <option value="शिक्षण डेस्क">शिक्षण व करिअर डेस्क</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 700 }}>चौकशीचे कारण / विषय</label>
                  <input
                    type="text"
                    placeholder="उदा. वधू-वर नोंदणी फी विचारणा"
                    value={visitorPurpose}
                    onChange={e => setVisitorPurpose(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ background: '#059669', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}
                >
                  ✓ अभ्यागत नोंदवा (Add Visitor)
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: CASH COUNTER */}
        {activeTab === 'cash_counter' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#064e3b' }}>
                💰 कॅश काउंटर संकलन व पावत्या (Cashier Desk)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {receipts.map(rcp => (
                  <div key={rcp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>{rcp.payer}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{rcp.id} • {rcp.category} ({rcp.mode})</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, color: '#047857', fontSize: '15px' }}>₹{rcp.amount.toLocaleString()}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{rcp.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#064e3b' }}>
                🧾 नवीन पावती जारी करा (Issue Receipt)
              </h3>
              <form onSubmit={handleGenerateReceipt} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 700 }}>पावती कोणाच्या नावे? *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. श्री. आनंद मोहिते"
                    value={receiptPayer}
                    onChange={e => setReceiptPayer(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 700 }}>रक्कम (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="उदा. 500"
                    value={receiptAmount}
                    onChange={e => setReceiptAmount(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 700 }}>प्रवर्ग (Category)</label>
                  <select
                    value={receiptCategory}
                    onChange={e => setReceiptCategory(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="वधू-वर नोंदणी फी">वधू-वर नोंदणी फी</option>
                    <option value="B2B डिरेक्टरी वर्गणी">B2B डिरेक्टरी वर्गणी</option>
                    <option value="सभागृह / हॉल बुकिंग">सभागृह / हॉल बुकिंग</option>
                    <option value="केंद्र संवर्धन देणगी">केंद्र संवर्धन देणगी</option>
                    <option value="इतर सेवा शुल्क">इतर सेवा शुल्क</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 700 }}>पेमेंट मोड</label>
                  <select
                    value={receiptMode}
                    onChange={e => setReceiptMode(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="Cash">रोख (Cash)</option>
                    <option value="UPI">UPI / QR कोड</option>
                    <option value="Cheque">धनादेश (Cheque)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  style={{ background: '#059669', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}
                >
                  ✓ पावती जारी करा व जतन करा
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: COUNSELING */}
        {activeTab === 'counseling' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#064e3b' }}>
                🤝 समुपदेशन कक्ष व केस फाइल्स (Counseling Desk)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {counselingCases.map(c => (
                  <div key={c.id} style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{c.candidate}</span>
                      <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                        {c.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                      <strong>समुपदेशन टिप्पणी:</strong> {c.notes}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#064e3b' }}>
                ✍️ नवीन समुपदेशन केस नोंदवा
              </h3>
              <form onSubmit={handleAddCounseling} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 700 }}>उमेदवार / व्यक्तीचे नाव *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. कु. स्वप्नाली कदम"
                    value={caseCandidate}
                    onChange={e => setCaseCandidate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 700 }}>मार्गदर्शन प्रकार</label>
                  <select
                    value={caseCategory}
                    onChange={e => setCaseCategory(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="मॅट्रिमोनी समुपदेशन">मॅट्रिमोनी समुपदेशन</option>
                    <option value="करिअर व स्पर्धा परीक्षा">करिअर व स्पर्धा परीक्षा</option>
                    <option value="व्यवसाय मार्गदर्शन">व्यवसाय मार्गदर्शन</option>
                    <option value="महिला साहाय्य व समुपदेशन">महिला साहाय्य व समुपदेशन</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px', fontWeight: 700 }}>मार्गदर्शन इतिवृत्त व पुढील कृती *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="समुपदेशनात दिलेले सल्ले व संदर्भ येथे लिहा..."
                    value={caseNotes}
                    onChange={e => setCaseNotes(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ background: '#059669', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}
                >
                  ✓ समुपदेशन केस जतन करा
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
