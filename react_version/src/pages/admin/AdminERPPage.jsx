import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CMDB from '../../services/cmdb';

export default function AdminERPPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    members: 14820,
    businesses: 4230,
    leads: 620,
    referrals: 890,
    revenue: '₹४.२ कोटी',
    pendingApprovals: 14
  });

  const [members, setMembers] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [leads, setLeads] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    try {
      const dbMembers = CMDB.getMembers ? CMDB.getMembers() : [];
      setMembers(dbMembers.slice(0, 15));

      const dbBiz = CMDB.getBusinesses ? CMDB.getBusinesses() : [];
      setBusinesses(dbBiz.slice(0, 15));

      const dbLeads = CMDB.getLeads ? CMDB.getLeads() : [];
      setLeads(dbLeads.slice(0, 15));

      if (CMDB.getAuditLogs) {
        setAuditLogs(CMDB.getAuditLogs().slice(0, 10));
      } else {
        setAuditLogs([
          { id: 1, action: 'नवीन सदस्य पडताळणी मंजूर', target: 'M-7829 Vikram Deshmukh', user: 'Admin Pune', time: '१० मिनिटांपूर्वी' },
          { id: 2, action: 'व्यवसाय रेफरल स्थिती अद्यतनित (Won)', target: 'REF-1044 IT Solutions', user: 'Chapter Miraj', time: '२५ मिनिटांपूर्वी' },
          { id: 3, action: 'वार्षिक सबस्क्रिप्शन पावती जारी', target: 'INV-2024-889', user: 'Finance Desk', time: '१ तासापूर्वी' },
          { id: 4, action: 'नवीन सेवा नोंदणी चौकशी प्राप्त', target: 'SRV-301 Solar Grid Setup', user: 'System Bot', time: '२ तासांपूर्वी' },
        ]);
      }
    } catch (e) {
      console.error('Error loading CMDB in Admin ERP:', e);
    }
  }, []);

  const navItems = [
    { id: 'dashboard', label: '📊 डॅशबोर्ड (Overview)', group: 'मुख्य' },
    { id: 'members', label: '👥 सदस्य व्यवस्थापन (Members)', group: 'समुदाय' },
    { id: 'businesses', label: '🏢 व्यवसाय नोंदी (Businesses)', group: 'व्यवसाय संगम' },
    { id: 'leads', label: '🎯 CRM Leads & Followups', group: 'CRM' },
    { id: 'subscriptions', label: '💳 सबस्क्रिप्शन महसूल (Revenue)', group: 'वित्त' },
    { id: 'audit', label: '🗂️ ऑडिट लॉग (Audit Trail)', group: 'प्रशासन' }
  ];

  return (
    <div style={{ background: 'var(--paper-2)', minHeight: '100vh' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(90deg, var(--maroon-900), var(--saffron-700))',
        color: '#FFFFFF',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.4rem' }}>🛡️</span>
          <div>
            <strong style={{ fontFamily: 'Baloo 2', fontSize: '1.15rem' }}>Connect Maratha — Admin ERP & CRM Portal</strong>
            <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>सुरक्षित केंद्रीय प्रशासकीय नियंत्रण प्रणाली</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/ceo" className="btn btn-outline" style={{ color: '#FFFFFF', borderColor: '#FFFFFF', padding: '6px 14px', fontSize: '0.8rem' }}>
            🦅 CEO Dashboard
          </Link>
          <Link to="/referrals" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
            💼 Referral Engine
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>
        {/* Left Sidebar */}
        <aside style={{
          width: '260px',
          background: 'var(--maroon-950)',
          color: '#FFF8F2',
          padding: '20px 0',
          flexShrink: 0
        }}>
          <div style={{ padding: '0 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontFamily: 'Baloo 2', fontWeight: 800, fontSize: '1.2rem', color: 'var(--gold-300)' }}>
              प्रशासकीय विभाग
            </div>
            <small style={{ color: '#e0e0e0', fontSize: '0.75rem' }}>Central Control System</small>
          </div>

          <div style={{ padding: '12px 0' }}>
            {navItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: activeTab === item.id ? 'rgba(255,107,0,0.18)' : 'transparent',
                  borderLeft: activeTab === item.id ? '4px solid var(--gold-500)' : '4px solid transparent',
                  color: activeTab === item.id ? '#FFFFFF' : '#d1d5db',
                  fontWeight: activeTab === item.id ? 700 : 500,
                  transition: 'all 0.15s'
                }}
              >
                {item.label}
              </div>
            ))}
          </div>

          <div style={{ padding: '20px', marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--gold-300)', marginBottom: '8px' }}>सिस्टम आरोग्य (System Health)</div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              सर्व सिस्टीम्स सुरळीत (Active)
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: 'Baloo 2', color: 'var(--maroon-900)' }}>प्रशासकीय सारांश (Admin Overview)</h2>
                  <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '0.9rem' }}>
                    राज्यभरातील ३६ जिल्हे, ६ विभाग व १८४ व्यवसाय मंडळांचा एकत्रित डेटा
                  </p>
                </div>
              </div>

              {/* Stat Tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '10px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontFamily: 'Baloo 2', fontSize: '1.8rem', fontWeight: 800, color: 'var(--maroon-900)' }}>{stats.members.toLocaleString('mr-IN')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>नोंदणीकृत सदस्य</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '10px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontFamily: 'Baloo 2', fontSize: '1.8rem', fontWeight: 800, color: '#C73800' }}>{stats.businesses.toLocaleString('mr-IN')}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>सत्यापित व्यवसाय</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '10px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontFamily: 'Baloo 2', fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>{stats.revenue}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>एकूण व्यावसायिक उलाढाल</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '10px', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontFamily: 'Baloo 2', fontSize: '1.8rem', fontWeight: 800, color: '#D97706' }}>{stats.leads}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>सक्रिय Leads & चौकशी</div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '10px', border: '1px solid var(--line)', marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 14px', fontFamily: 'Baloo 2', color: 'var(--maroon-900)' }}>तातडीच्या कृती (Pending Actions)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '12px 16px', background: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b', fontSize: '0.88rem' }}>
                    <strong>१४ नवीन सदस्य अर्ज</strong> पडताळणी प्रलंबित
                    <div style={{ marginTop: '6px' }}><button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>पडताळणी करा</button></div>
                  </div>
                  <div style={{ padding: '12px 16px', background: '#e0e7ff', borderRadius: '8px', borderLeft: '4px solid #6366f1', fontSize: '0.88rem' }}>
                    <strong>६ व्यवसाय चॅप्टर नोंदणी</strong> मंजुरीच्या प्रतीक्षेत
                    <div style={{ marginTop: '6px' }}><button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>तपासा</button></div>
                  </div>
                  <div style={{ padding: '12px 16px', background: '#dcfce7', borderRadius: '8px', borderLeft: '4px solid #10b981', fontSize: '0.88rem' }}>
                    <strong>२८ रेफरल यशोगाथा (Won)</strong> कमिशन वाटप तयार
                    <div style={{ marginTop: '6px' }}><button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>वितरण करा</button></div>
                  </div>
                </div>
              </div>

              {/* Recent Members & Leads Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                  <h4 style={{ margin: '0 0 12px', fontFamily: 'Baloo 2' }}>नुकतेच जोडलेले सदस्य</h4>
                  <table className="admin-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead><tr><th>नाव</th><th>जिल्हा</th><th>व्यवसाय</th></tr></thead>
                    <tbody>
                      {members.slice(0, 5).map((m, i) => (
                        <tr key={i}>
                          <td><strong>{m.name || 'सुभाष पाटील'}</strong></td>
                          <td>{m.district || 'पुणे'}</td>
                          <td>{m.profession || 'कृषी उद्योग'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                  <h4 style={{ margin: '0 0 12px', fontFamily: 'Baloo 2' }}>सक्रिय ऑडिट घडामोडी</h4>
                  <div style={{ fontSize: '0.85rem' }}>
                    {auditLogs.slice(0, 4).map((log, i) => (
                      <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div><strong>{log.action}</strong></div>
                          <small style={{ color: 'var(--muted)' }}>{log.target} • {log.user}</small>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEMBERS */}
          {activeTab === 'members' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontFamily: 'Baloo 2', color: 'var(--maroon-900)' }}>सदस्य निर्देशिका (Directory Management)</h2>
                <input
                  type="search"
                  placeholder="नाव किंवा जिल्हा शोधा..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid var(--line)', minWidth: '240px' }}
                />
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table" style={{ width: '100%', background: '#FFFFFF' }}>
                  <thead>
                    <tr>
                      <th>सदस्य ID</th>
                      <th>नाव</th>
                      <th>जिल्हा</th>
                      <th>व्यवसाय / क्षेत्र</th>
                      <th>भूमिका</th>
                      <th>स्थिती</th>
                      <th>कृती</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(members.length > 0 ? members : [
                      { id: 'CM-1001', name: 'आनंदराव देशमुख', district: 'सातारा', profession: 'शेती व दुग्धव्यवसाय', role: 'जिल्हा समन्वयक', status: 'सत्यापित' },
                      { id: 'CM-1002', name: 'राजेंद्र मोहिते', district: 'पुणे', profession: 'बांधकाम व रिअल इस्टेट', role: 'चॅप्टर अध्यक्ष', status: 'सत्यापित' },
                      { id: 'CM-1003', name: 'प्रवीण कदम', district: 'सांगली', profession: 'आयटी कन्सल्टन्सी', role: 'सदस्य', status: 'प्रलंबित' },
                      { id: 'CM-1004', name: 'सुप्रिया भोसले', district: 'कोल्हापूर', profession: 'वस्त्रोद्योग', role: 'महिला आघाडी', status: 'सत्यापित' },
                    ]).map((m, i) => (
                      <tr key={i}>
                        <td><code>{m.id || `CM-${1000 + i}`}</code></td>
                        <td><strong>{m.name}</strong></td>
                        <td>{m.district || 'पुणे'}</td>
                        <td>{m.profession || 'व्यापार'}</td>
                        <td><span className="admin-badge">{m.role || 'सदस्य'}</span></td>
                        <td><span className={`admin-badge ${m.status === 'सत्यापित' ? 'ok' : 'warn'}`}>{m.status || 'सत्यापित'}</span></td>
                        <td>
                          <button className="mini-btn btn btn-outline">तपासा</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BUSINESSES */}
          {activeTab === 'businesses' && (
            <div>
              <h2 style={{ margin: '0 0 16px', fontFamily: 'Baloo 2', color: 'var(--maroon-900)' }}>व्यवसाय सूची व मंडळे (Businesses)</h2>
              <div className="admin-table-wrap">
                <table className="admin-table" style={{ width: '100%', background: '#FFFFFF' }}>
                  <thead>
                    <tr>
                      <th>व्यवसाय नाव</th>
                      <th>मालक / संचालक</th>
                      <th>श्रेणी (Category)</th>
                      <th>शहर व जिल्हा</th>
                      <th>वार्षिक टर्नओव्हर</th>
                      <th>चॅप्टर</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(businesses.length > 0 ? businesses : [
                      { name: 'सह्याद्री ॲग्रो फूड्स', owner: 'नितीन जाधव', cat: 'अन्न प्रक्रिया', loc: 'बारामती, पुणे', turnover: '₹ ५ कोटी', chapter: 'शिवनेरी' },
                      { name: 'मराठा इन्फ्रास्ट्रक्चर', owner: 'विकास सावंत', cat: 'बांधकाम', loc: 'कराड, सातारा', turnover: '₹ १५ कोटी', chapter: 'प्रतापगड' },
                      { name: 'स्वराज्य डिझिटल सोल्युशन्स', owner: 'अमित कदम', cat: 'सॉफ्टवेअर', loc: 'कोल्हापूर', turnover: '₹ २.५ कोटी', chapter: 'पन्हाळा' },
                    ]).map((b, i) => (
                      <tr key={i}>
                        <td><strong>{b.name}</strong></td>
                        <td>{b.owner}</td>
                        <td><span className="admin-badge">{b.cat}</span></td>
                        <td>{b.loc}</td>
                        <td>{b.turnover}</td>
                        <td><strong>{b.chapter}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: LEADS */}
          {activeTab === 'leads' && (
            <div>
              <h2 style={{ margin: '0 0 16px', fontFamily: 'Baloo 2', color: 'var(--maroon-900)' }}>CRM Leads & Opportunities</h2>
              <div className="admin-table-wrap">
                <table className="admin-table" style={{ width: '100%', background: '#FFFFFF' }}>
                  <thead>
                    <tr>
                      <th>Lead ID</th>
                      <th>संदर्भ (Referral Title)</th>
                      <th>देणारा सदस्य</th>
                      <th>स्वीकारकर्ता</th>
                      <th>मूल्य</th>
                      <th>स्थिती</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(leads.length > 0 ? leads : [
                      { id: 'L-501', title: 'इंडस्ट्रियल सोलर प्लांट इन्स्टॉलेशन', from: 'सुनील पवार', to: 'स्वराज्य पॉवर', val: '₹ ४५ लाख', status: 'Won' },
                      { id: 'L-502', title: 'हॉटेल साखळीसाठी सेंद्रिय भाजीपाला पुरवठा', from: 'अनिल शिंदे', to: 'सह्याद्री ॲग्रो', val: '₹ १२ लाख', status: 'Contacted' },
                      { id: 'L-503', title: 'व्यावसायिक संकुल डिझाइन व स्ट्रक्चरल ऑडिट', from: 'रोहन जाधव', to: 'मराठा इन्फ्रा', val: '₹ १८ लाख', status: 'New' },
                    ]).map((l, i) => (
                      <tr key={i}>
                        <td><code>{l.id}</code></td>
                        <td><strong>{l.title}</strong></td>
                        <td>{l.from}</td>
                        <td>{l.to}</td>
                        <td style={{ color: '#059669', fontWeight: 700 }}>{l.val}</td>
                        <td><span className={`admin-badge ${l.status === 'Won' ? 'ok' : 'warn'}`}>{l.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div>
              <h2 style={{ margin: '0 0 16px', fontFamily: 'Baloo 2', color: 'var(--maroon-900)' }}>सबस्क्रिप्शन महसूल ट्रॅकर (Revenue Analytics)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>चालू महिना संकलन</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--maroon-900)', fontFamily: 'Baloo 2' }}>₹ २८.४ लाख</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>सक्रिय प्रीमियम सदस्य</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#C73800', fontFamily: 'Baloo 2' }}>१,८४०</div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>नूतनीकरण दर (Renewal Rate)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', fontFamily: 'Baloo 2' }}>९४.२%</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT */}
          {activeTab === 'audit' && (
            <div>
              <h2 style={{ margin: '0 0 16px', fontFamily: 'Baloo 2', color: 'var(--maroon-900)' }}>सुरक्षित ऑडिट ट्रेल (Security & Audit Logs)</h2>
              <div style={{ background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--line)', overflow: 'hidden' }}>
                {auditLogs.map((log, idx) => (
                  <div key={idx} className="audit-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{log.action}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>लक्ष्य: {log.target} | ऑपरेटर: {log.user}</div>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
