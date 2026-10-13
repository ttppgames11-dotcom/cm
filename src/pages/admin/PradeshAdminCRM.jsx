import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import CRMScopeSwitcher from '../../components/layout/CRMScopeSwitcher';

/* ============================================================
   🚩 CONNECT MARATHA — प्रदेशाध्यक्ष संघटनात्मक CRM (State Organizational CRM)
   State Strategic Leadership, 6 Divisions, State Secretariat & Escalations
   ============================================================ */

const STATE_DIVISIONS = [
  { id: 'पुणे विभाग', name: 'पुणे विभाग (Pune Division)', head: 'श्री. प्रतापराव पवार (विभागीय अध्यक्ष)', phone: '9876500011', districts: ['पुणे', 'सातारा', 'सांगली', 'सोलापूर', 'कोल्हापूर'], members: 45200, centers: 12, targetProgress: 92, status: 'उत्कृष्ट (High Performing)' },
  { id: 'कोकण विभाग', name: 'कोकण विभाग (Konkan Division)', head: 'श्री. एकनाथराव कदम (विभागीय अध्यक्ष)', phone: '9876500012', districts: ['मुंबई शहर', 'मुंबई उपनगर', 'ठाणे', 'पालघर', 'रायगड', 'रत्नागिरी', 'सिंधुदुर्ग'], members: 31800, centers: 9, targetProgress: 88, status: 'सक्रिय (Active)' },
  { id: 'नाशिक विभाग', name: 'नाशिक विभाग (Nashik Division)', head: 'श्री. रोहन सावंत (विभागीय अध्यक्ष)', phone: '9876500013', districts: ['नाशिक', 'अहमदनगर', 'धुळे', 'जळगाव', 'नंदुरबार'], members: 22400, centers: 7, targetProgress: 84, status: 'सक्रिय (Active)' },
  { id: 'छत्रपती संभाजीनगर विभाग', name: 'छत्रपती संभाजीनगर विभाग (Marathwada)', head: 'श्री. दिग्विजय राजे भोसले (विभागीय अध्यक्ष)', phone: '9876500014', districts: ['छत्रपती संभाजीनगर', 'बीड', 'जालना', 'हिंगोली', 'परभणी', 'नांदेड', 'लातूर', 'धाराशिव'], members: 18900, centers: 8, targetProgress: 79, status: 'सुधारणा आवश्यक (Needs Focus)' },
  { id: 'अमरावती विभाग', name: 'अमरावती विभाग (West Vidarbha)', head: 'श्री. विकास देशमुख (विभागीय अध्यक्ष)', phone: '9876500015', districts: ['अमरावती', 'अकोला', 'बुलढाणा', 'वाशीम', 'यवतमाळ'], members: 12100, centers: 4, targetProgress: 72, status: 'मोहीम सुरू (Campaign Active)' },
  { id: 'नागपूर विभाग', name: 'नागपूर विभाग (East Vidarbha)', head: 'श्री. सुहास काटकर (विभागीय अध्यक्ष)', phone: '9876500016', districts: ['नागपूर', 'वर्धा', 'भंडारा', 'गोंदिया', 'चंद्रपूर', 'गडचिरोली'], members: 9800, centers: 3, targetProgress: 68, status: 'विस्तार मोहीम (Expansion Phase)' }
];

const STATE_SECRETARIAT_OFFICERS = [
  { role: 'राज्य सरचिटणीस', name: 'अ‍ॅड. शशिकांत पवार', phone: '9822011001', responsibility: 'सर्वसमावेशक संघटनात्मक प्रशासन व पत्रव्यवहार' },
  { role: 'राज्य प्रशासन समन्वयक', name: 'श्री. राजेंद्र देशमुख', phone: '9822011002', responsibility: 'राज्य मध्यवर्ती सचिवालय व दैनिक कार्यप्रवाह' },
  { role: 'राज्य कार्यक्रम समन्वयक', name: 'श्री. नितीन मोरे', phone: '9822011003', responsibility: 'राज्यस्तरीय अधिवेशने, मेळावे व दौरे नियोजन' },
  { role: 'राज्य सदस्यत्व समन्वयक', name: 'श्री. संभाजी जगताप', phone: '9822011004', responsibility: 'डिजिटल सदस्यत्व विस्तार व जिल्हा उद्दिष्टे' },
  { role: 'राज्य रोजगार समन्वयक', name: 'श्री. अमित भोसले', phone: '9822011005', responsibility: 'महाराष्ट्र महा-जॉब फेअर्स व कौशल्य केंद्रे' },
  { role: 'राज्य व्यवसाय / B2B समन्वयक', name: 'श्री. उदयसिंह पाटील', phone: '9822011006', responsibility: 'MSME उद्योग महासंघटन व B2B नेटवर्किंग' },
  { role: 'राज्य मदत कक्ष प्रमुख', name: 'डॉ. विक्रम तावडे', phone: '9822011007', responsibility: '२४x७ राज्य आपत्कालीन व रुग्णालय साहाय्यता' },
  { role: 'राज्य तक्रार / Escalation अधिकारी', name: 'अ‍ॅड. स्वाती कदम', phone: '9822011008', responsibility: 'जिल्हा व विभागीय स्तरावरून आलेल्या तक्रारींची सोडवणूक' },
  { role: 'राज्य प्रशिक्षण अधिकारी', name: 'प्रा. विजयराव माने', phone: '9822011009', responsibility: 'पदाधिकारी व कार्यकर्ता नेतृत्व प्रशिक्षण शिबिरे' },
  { role: 'अनुपालन / DPDP अधिकारी', name: 'श्री. रोहन जोशी (CISO)', phone: '9822011010', responsibility: 'डेटा गोपनीयता, सुरक्षितता व कायदेशीर पूर्तता' },
  { role: 'राज्य स्वयंसेवक समन्वयक', name: 'श्री. आकाश शिंदे', phone: '9822011011', responsibility: 'राज्यव्यापी ५०,०००+ सक्रिय स्वयंसेवक नेटवर्क' },
  { role: 'राज्य डेटा / CRM अधिकारी', name: 'श्री. संकेत पवार', phone: '9822011012', responsibility: 'केंद्रीय MIS, BI विश्लेषण व प्रणाली संनियंत्रण' }
];

export default function PradeshAdminCRM() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('divisions'); // 'divisions' | 'secretariat' | 'escalations' | 'directives'
  const [loading, setLoading] = useState(true);
  const [stateMetrics, setStateMetrics] = useState(null);
  const [stateTickets, setStateTickets] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  // New Directive state
  const [directiveTitle, setDirectiveTitle] = useState('');
  const [directiveTarget, setDirectiveTarget] = useState('सर्व ६ विभाग व ३६ जिल्हे');
  const [directiveText, setDirectiveText] = useState('');
  const [directivesList, setDirectivesList] = useState([
    { id: 'DIR-2026-01', title: 'छत्रपती संभाजी महाराज जयंती उत्सव व रक्तदान महा-शिबिर', target: 'सर्व ६ विभाग', date: '०८ ऑक्टोबर २०२६', status: 'सक्रिय (Active)' },
    { id: 'DIR-2026-02', title: 'तालुका कम्युनिटी सेंटर्समध्ये B2B उद्योग नोंदणी विशेष मोहीम', target: 'पुणे व नाशिक विभाग', date: '०५ ऑक्टोबर २०२६', status: 'प्रक्रियेत (In Progress)' },
    { id: 'DIR-2026-03', title: 'विभागीय स्तरावर उच्च शिक्षण व स्पर्धा परीक्षा अभ्यासिका आढावा', target: 'सर्व जिल्हे', date: '२८ सप्टेंबर २०२६', status: 'पूर्ण (Completed)' }
  ]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    loadStateData();
  }, []);

  const loadStateData = async () => {
    setLoading(true);
    try {
      const [dashRes, ticketsRes] = await Promise.all([
        apiClient.getUnifiedCRMDashboard({ scope: 'pradesh' }).catch(() => null),
        apiClient.getUnifiedTickets({ scope: 'pradesh' }).catch(() => [])
      ]);
      setStateMetrics(dashRes?.kpis || null);
      setStateTickets(ticketsRes || []);
    } catch (err) {
      console.warn('Pradesh CRM load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueDirective = (e) => {
    e.preventDefault();
    if (!directiveTitle || !directiveText) {
      alert('कृपया शीर्षक व तपशील भरा.');
      return;
    }
    const newDir = {
      id: `DIR-2026-${String(directivesList.length + 1).padStart(2, '0')}`,
      title: directiveTitle,
      target: directiveTarget,
      date: new Date().toLocaleDateString('mr-IN'),
      status: 'जारी केले (Issued)'
    };
    setDirectivesList([newDir, ...directivesList]);
    setDirectiveTitle('');
    setDirectiveText('');
    showToast('राज्यस्तरीय संघटनात्मक आदेश यशस्वीरित्या जारी करण्यात आला!');
  };

  const handleResolveTicket = async (ticketId) => {
    try {
      await apiClient.updateUnifiedTicketStatus(ticketId, 'Resolved', 'प्रदेशाध्यक्ष कार्यालयाकडून थेट मंजुरी व आदेश जारी.');
      showToast('तिकीट प्रदेश स्तरावर यशस्वीरित्या निकाली काढले!');
      loadStateData();
    } catch (err) {
      alert('त्रुटी: ' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b1120', color: '#f8fafc', paddingBottom: '60px' }}>
      <CRMScopeSwitcher currentScope="pradesh" />
      
      {/* Top Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '24px 32px' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <span style={{ fontSize: '28px' }}>🚩</span>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, background: 'linear-gradient(90deg, #ea580c, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                महाराष्ट्र राज्य मध्यवर्ती परिषद — प्रदेशाध्यक्ष CRM
              </h1>
              <span style={{ background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', border: '1px solid rgba(234, 88, 12, 0.4)', borderRadius: '20px', padding: '3px 12px', fontSize: '11px', fontWeight: 800 }}>
                STATE APEX GOVERNANCE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
              संपूर्ण महाराष्ट्र संघटनात्मक नेतृत्व • ६ महसूल विभाग • ३६ जिल्हे • ३५०+ तालुके • ग्राम शाखा समन्वय
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/crm/operations"
              style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '10px 16px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '13px' }}
            >
              ⚡ युनिफाइड ऑपरेशन्स
            </Link>
            <Link
              to="/ceo"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 16px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '13px' }}
            >
              🦅 CEO कमांड सेंटर
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 32px' }}>
        
        {toastMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#6ee7b7', padding: '12px 18px', borderRadius: '8px', marginBottom: '20px' }}>
            {toastMsg}
          </div>
        )}

        {/* State Macro KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>राज्य एकूण सभासद</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#f97316', marginTop: '4px' }}>१,४०,२००+</div>
            <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>६ विभागांमधील नोंदणी</div>
          </div>
          <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>सक्रिय स्वयंसेवक फळी</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>४,८८०</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>प्रभाग व गाव पातळीवर</div>
          </div>
          <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>कार्यरत कम्युनिटी सेंटर्स</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>४३ केंद्रे</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>तालुका व जिल्हा हब</div>
          </div>
          <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>राज्यस्तरीय एस्केलेशन्स</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#ef4444', marginTop: '4px' }}>
              {stateTickets.filter(t => t.currentOwnerLevel === 'state' || t.status === 'Escalated').length || 2}
            </div>
            <div style={{ fontSize: '11px', color: '#fca5a5', marginTop: '4px' }}>तातडीचे धोरणात्मक विषय</div>
          </div>
          <div style={{ background: '#1e293b', padding: '18px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>दैनिक केंद्र महसूल लेजर</div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>₹३,१४,४००</div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>राज्यव्यापी पारदर्शक संकलन</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '24px' }}>
          {[
            { id: 'divisions', label: '🏛️ ६ महसूल विभाग संनियंत्रण (6 Divisions Review)', icon: '🏛️' },
            { id: 'secretariat', label: '👥 राज्य सचिवालय व आघाड्या (State Secretariat & Wings)', icon: '👥' },
            { id: 'escalations', label: `⚠️ राज्यस्तरीय एस्केलेशन्स (${stateTickets.length})`, icon: '🚨' },
            { id: 'directives', label: '📢 राज्यव्यापी मोहिमा व आदेश (Directives)', icon: '📢' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: activeTab === t.id ? '#ea580c' : 'rgba(255,255,255,0.04)',
                color: activeTab === t.id ? '#fff' : '#94a3b8',
                border: activeTab === t.id ? '1px solid #ea580c' : '1px solid rgba(255,255,255,0.08)',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* TAB 1: 6 DIVISIONS REVIEW */}
        {activeTab === 'divisions' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            {STATE_DIVISIONS.map(div => (
              <div key={div.id} style={{ background: '#1e293b', borderRadius: '12px', padding: '22px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#f59e0b' }}>{div.name}</h3>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginTop: '4px' }}>
                      {div.head} • <span style={{ color: '#38bdf8' }}>{div.phone}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: div.targetProgress >= 85 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: div.targetProgress >= 85 ? '#34d399' : '#fbbf24' }}>
                    {div.status}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>नोंदणी सदस्य</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>{div.members.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>कम्युनिटी सेंटर्स</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>{div.centers}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>उद्दिष्ट पूर्तता</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>{div.targetProgress}%</div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '16px' }}>
                  <strong>जिल्हे:</strong> {div.districts.join(', ')}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    to={`/crm/division`}
                    style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}
                  >
                    विभागीय CRM उघडा →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: STATE SECRETARIAT & WINGS */}
        {activeTab === 'secretariat' && (
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800 }}>
              👥 महाराष्ट्र राज्य मध्यवर्ती सचिवालय व विषय समित्या
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#94a3b8' }}>
              प्रदेशाध्यक्षांच्या मार्गदर्शनाखाली कार्यरत असलेले १२ राज्य समन्वयक व अधिकारी:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
              {STATE_SECRETARIAT_OFFICERS.map((officer, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b' }}>{officer.role}</span>
                    <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>{officer.phone}</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>{officer.name}</div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.4' }}>{officer.responsibility}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STATE ESCALATIONS */}
        {activeTab === 'escalations' && (
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>
              🚨 राज्यस्तरीय वर्ग झालेल्या तक्रारी व मागण्या (State Escalations War-Room)
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#94a3b8' }}>
              जिल्हा व विभागीय स्तरावर अनिर्णित राहिल्यामुळे प्रदेशाध्यक्ष कार्यालयाकडे वर्ग झालेली प्रकरणे:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stateTickets.map(ticket => (
                <div key={ticket.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '12px' }}>{ticket.ticketNumber} • {ticket.district}</span>
                    <span style={{ background: '#7f1d1d', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>{ticket.priority}</span>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#fff' }}>{ticket.title}</h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#cbd5e1' }}>{ticket.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>अर्जदार: {ticket.requesterName} ({ticket.requesterPhone})</span>
                    <button
                      onClick={() => handleResolveTicket(ticket.id)}
                      style={{ background: '#059669', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      प्रदेशाध्यक्ष आदेश जारी करा (Resolve) ✅
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DIRECTIVES */}
        {activeTab === 'directives' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px' }}>
            {/* Directives List */}
            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>
                📢 नुकतीच जारी केलेली राज्यस्तरीय परिपत्रके व आदेश
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {directivesList.map(dir => (
                  <div key={dir.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700 }}>{dir.id} • {dir.date}</span>
                      <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>{dir.status}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{dir.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>लक्ष्य: {dir.target}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issue New Directive Form */}
            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800, color: '#ea580c' }}>
                ✍️ नवीन राज्यस्तरीय आदेश जारी करा
              </h3>
              <form onSubmit={handleIssueDirective} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>आदेशाचे शीर्षक *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. शिवजयंती उत्सव नियोजन व सर्व जिल्ह्यांना सूचना"
                    value={directiveTitle}
                    onChange={e => setDirectiveTitle(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>कोणासाठी (Target)</label>
                  <select
                    value={directiveTarget}
                    onChange={e => setDirectiveTarget(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  >
                    <option value="सर्व ६ विभाग व ३६ जिल्हे">सर्व ६ विभाग व ३६ जिल्हे</option>
                    <option value="फक्त ६ विभागीय अध्यक्ष">फक्त ६ विभागीय अध्यक्ष</option>
                    <option value="पुणे विभाग (पुणे, सातारा, सांगली, सोलापूर, कोल्हापूर)">पुणे विभाग</option>
                    <option value="कोकण विभाग (मुंबई, ठाणे, पालघर, कोकण)">कोकण विभाग</option>
                    <option value="नाशिक व छ. संभाजीनगर विभाग">नाशिक व छ. संभाजीनगर विभाग</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>आदेशाचा तपशील व सूचना *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="सविस्तर मार्गदर्शक सूचना येथे लिहा..."
                    value={directiveText}
                    onChange={e => setDirectiveText(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '13px' }}
                  />
                </div>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}
                >
                  🚀 सर्व संबंधित अध्यक्षांना पाठवा
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
