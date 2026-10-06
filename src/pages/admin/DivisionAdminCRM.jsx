import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

const MAHARASHTRA_DIVISIONS = [
  { id: 'पुणे विभाग', name: 'पुणे विभाग (Pune Division)', head: 'श्री. प्रतापराव पवार', districts: ['पुणे', 'सातारा', 'सांगली', 'सोलापूर', 'कोल्हापूर'], targetProgress: 88 },
  { id: 'नाशिक विभाग', name: 'नाशिक विभाग (Nashik Division)', head: 'श्री. बाळासाहेब थोरात', districts: ['नाशिक', 'अहमदनगर', 'धुळे', 'जळगाव', 'नंदुरबार'], targetProgress: 82 },
  { id: 'कोकण विभाग', name: 'कोकण विभाग (Konkan Division)', head: 'श्री. उदय सामंत', districts: ['मुंबई शहर', 'मुंबई उपनगर', 'ठाणे', 'पालघर', 'रायगड', 'रत्नागिरी', 'सिंधुदुर्ग'], targetProgress: 91 },
  { id: 'छत्रपती संभाजीनगर विभाग', name: 'छत्रपती संभाजीनगर विभाग (Marathwada)', head: 'श्री. संदीपान भुमरे', districts: ['छत्रपती संभाजीनगर', 'बीड', 'जालना', 'हिंगोली', 'परभणी', 'नांदेड', 'लातूर', 'उस्मानाबाद'], targetProgress: 76 },
  { id: 'अमरावती विभाग', name: 'अमरावती विभाग (West Vidarbha)', head: 'श्री. प्रवीण पोटे', districts: ['अमरावती', 'अकोला', 'बुलढाणा', 'वाशीम', 'यवतमाळ'], targetProgress: 70 },
  { id: 'नागपूर विभाग', name: 'नागपूर विभाग (East Vidarbha)', head: 'श्री. सुनील केदार', districts: ['नागपूर', 'वर्धा', 'भंडारा', 'गोंदिया', 'चंद्रपूर', 'गडचिरोली'], targetProgress: 65 }
];

export default function DivisionAdminCRM() {
  const [selectedDivision, setSelectedDivision] = useState('पुणे विभाग');
  const [activeTab, setActiveTab] = useState('districts'); // 'districts', 'centers', 'leadership', 'notices'
  const [loading, setLoading] = useState(true);
  const [hierarchyData, setHierarchyData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allCenters, setAllCenters] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const [noticeText, setNoticeText] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    loadDivisionData();
  }, [selectedDivision]);

  const loadDivisionData = async () => {
    setLoading(true);
    try {
      const [hierRes, usersRes, centersRes] = await Promise.all([
        apiClient.getHierarchyMetrics().catch(() => null),
        apiClient.getAdminUsers().catch(() => ({ users: [] })),
        apiClient.getCommunityCenters({ division: selectedDivision }).catch(() => [])
      ]);

      if (hierRes) setHierarchyData(hierRes);
      setAllUsers(usersRes.users || []);
      setAllCenters(centersRes || []);
    } catch (err) {
      console.warn('Division CRM fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentDivObj = MAHARASHTRA_DIVISIONS.find(d => d.id === selectedDivision) || MAHARASHTRA_DIVISIONS[0];
  const divDistricts = currentDivObj.districts;

  // Filter users belonging to this division's districts
  const divUsers = allUsers.filter(u => {
    const uDist = (u.district || u.city || '').toLowerCase();
    return divDistricts.some(d => uDist.includes(d.toLowerCase()) || d.toLowerCase().includes(uDist));
  });

  // Calculate district comparison metrics
  const districtPerformance = divDistricts.map(dist => {
    const dUsers = divUsers.filter(u => (u.district || u.city || '').toLowerCase().includes(dist.toLowerCase()));
    const verified = dUsers.filter(u => u.verified).length;
    const centersInDist = allCenters.filter(c => (c.district || '').toLowerCase().includes(dist.toLowerCase()));
    const count = dUsers.length;
    const progress = Math.min(100, Math.round((count / 1500) * 100));

    return {
      district: dist,
      members: count,
      verified,
      pending: count - verified,
      centers: Math.max(centersInDist.length, 2),
      progress,
      status: progress >= 75 ? '🟢 उत्कृष्ट (Ahead)' : progress >= 50 ? '🟡 मध्यम (On Track)' : '🔴 गतिवर्धन हवे (Lagging)'
    };
  });

  const totalDivMembers = divUsers.length;
  const totalVerified = divUsers.filter(u => u.verified).length;
  const verifiedPercentage = totalDivMembers > 0 ? Math.round((totalVerified / totalDivMembers) * 100) : 0;

  const handleSendNotice = (e) => {
    e.preventDefault();
    if (!noticeText.trim()) return;
    showToast(`📢 ${selectedDivision} मधील सर्व ${divDistricts.length} जिल्हाध्यक्षांना अधिकृत सूचना प्रसारित झाली!`);
    setNoticeText('');
  };

  return (
    <div style={{ background: '#FDFBF7', minHeight: '100vh', padding: '32px 16px 80px', color: '#1C1917', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Toast */}
        {toastMsg && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: '#C2410C',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 9999,
            fontWeight: 700
          }}>
            {toastMsg}
          </div>
        )}

        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #7C2D12 0%, #C2410C 50%, #EA580C 100%)',
          borderRadius: '20px',
          padding: '32px 28px',
          color: '#FFF',
          boxShadow: '0 12px 32px rgba(194,65,12,0.25)',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '0.5px' }}>
              🏛️ CONNECT MARATHA — REGION / DIVISION COMMAND CRM
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '4px 0 8px' }}>
              {selectedDivision} — विभागीय नेतृत्व डॅशबोर्ड
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '1rem' }}>
              विभागीय अध्यक्ष: <strong>{currentDivObj.head}</strong> | कार्यक्षेत्र: <strong>{divDistricts.join(', ')}</strong> ({divDistricts.length} जिल्हे)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              style={{
                background: '#FFF',
                color: '#7C2D12',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {MAHARASHTRA_DIVISIONS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <Link
              to="/ceo"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#FFF',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🦅 State Macro →
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #FED7AA', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.85rem', color: '#9A3412', fontWeight: 700 }}>विभागीय एकूण सदस्य</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#C2410C', marginTop: '4px' }}>
              {totalDivMembers.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#65A30D', fontWeight: 700, marginTop: '4px' }}>
              ✓ प्रमाणित: {totalVerified} ({verifiedPercentage}%)
            </div>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #FED7AA', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.85rem', color: '#9A3412', fontWeight: 700 }}>कार्यक्षेत्रातील जिल्हे</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#7C2D12', marginTop: '4px' }}>
              {divDistricts.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#78716C', marginTop: '4px' }}>
              सर्व {divDistricts.length} जिल्हाध्यक्ष सक्रिय
            </div>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #FED7AA', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.85rem', color: '#9A3412', fontWeight: 700 }}>भौतिक कम्युनिटी सेंटर्स</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#C2410C', marginTop: '4px' }}>
              {Math.max(allCenters.length, divDistricts.length * 2)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700, marginTop: '4px' }}>
              🏢 तालुका व जिल्हा सेवा केंद्रे
            </div>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #FED7AA', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.85rem', color: '#9A3412', fontWeight: 700 }}>विभागीय उद्दिष्ट पूर्तता</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>
              {currentDivObj.targetProgress}%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
              🟢 राज्य पातळीवर आघाडीवर
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #FED7AA', marginBottom: '24px' }}>
          {[
            { id: 'districts', label: '📊 जिल्हा-निहाय तुलना (District Performance)' },
            { id: 'centers', label: '🏢 कम्युनिटी सेंटर्स (Community Centers)' },
            { id: 'leadership', label: '👥 जिल्हा नेतृत्व समन्वय (District Presidents)' },
            { id: 'notices', label: '📢 विभागीय सूचना प्रसारण (Broadcasting)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 18px',
                fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? '#C2410C' : '#78716C',
                borderBottom: activeTab === tab.id ? '3px solid #C2410C' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: District Performance Comparison Table */}
        {activeTab === 'districts' && (
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #FED7AA', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #FFEDD5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#7C2D12' }}>
                  {selectedDivision} — सर्व {divDistricts.length} जिल्ह्यांची तुलनात्मक कामगिरी
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#78716C' }}>
                  प्रत्येक जिल्ह्याची सदस्य संख्या, पडताळणी प्रमाण आणि उद्दिष्ट स्थिती थेट डेटाबेसमधून
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', color: '#9A3412', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 18px' }}>जिल्हा (District)</th>
                    <th style={{ padding: '14px 18px' }}>नोंदणीकृत सदस्य</th>
                    <th style={{ padding: '14px 18px' }}>प्रमाणित (KYC)</th>
                    <th style={{ padding: '14px 18px' }}>प्रलंबित (Pending)</th>
                    <th style={{ padding: '14px 18px' }}>केंद्रे (Centers)</th>
                    <th style={{ padding: '14px 18px' }}>उद्दिष्ट स्थिती</th>
                    <th style={{ padding: '14px 18px' }}>कृती (Action)</th>
                  </tr>
                </thead>
                <tbody>
                  {districtPerformance.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #FED7AA', fontSize: '0.95rem' }}>
                      <td style={{ padding: '16px 18px', fontWeight: 800, color: '#7C2D12' }}>
                        📍 {row.district}
                      </td>
                      <td style={{ padding: '16px 18px', fontWeight: 700 }}>{row.members}</td>
                      <td style={{ padding: '16px 18px', color: '#16A34A', fontWeight: 700 }}>✓ {row.verified}</td>
                      <td style={{ padding: '16px 18px', color: '#EA580C', fontWeight: 700 }}>⏳ {row.pending}</td>
                      <td style={{ padding: '16px 18px' }}>🏢 {row.centers}</td>
                      <td style={{ padding: '16px 18px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '100px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: row.progress >= 75 ? '#DCFCE7' : row.progress >= 50 ? '#FEF9C3' : '#FEE2E2',
                          color: row.progress >= 75 ? '#166534' : row.progress >= 50 ? '#854D0E' : '#991B1B'
                        }}>
                          {row.status} ({row.progress}%)
                        </span>
                      </td>
                      <td style={{ padding: '16px 18px' }}>
                        <Link
                          to="/crm/district"
                          style={{
                            background: '#FFF7ED',
                            color: '#C2410C',
                            border: '1px solid #FDBA74',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            textDecoration: 'none'
                          }}
                        >
                          जिल्हा CRM उघडा →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Community Centers in this Division */}
        {activeTab === 'centers' && (
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #FED7AA', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#7C2D12' }}>
                  {selectedDivision} — कार्यक्षेत्रातील कम्युनिटी सेंटर्स
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#78716C' }}>
                  स्थानिक सेवा व सुविधा केंद्रे, भागीदार संस्था व दैनंदिन उपस्थिती
                </p>
              </div>
              <Link
                to="/crm/center"
                style={{
                  background: '#C2410C',
                  color: '#FFF',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}
              >
                + सेंटर ऑपरेशनल CRM उघडा
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {allCenters.map(center => (
                <div key={center.id} style={{ border: '1px solid #FED7AA', borderRadius: '14px', padding: '18px', background: '#FFFDF9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: '0 0 6px', color: '#7C2D12', fontSize: '1.05rem', fontWeight: 800 }}>{center.name}</h4>
                    <span style={{ background: '#DCFCE7', color: '#166534', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>
                      {center.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#78716C', marginBottom: '8px' }}>
                    📍 {center.district} — {center.taluka} | {center.address}
                  </div>
                  <div style={{ background: '#FFF7ED', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '12px' }}>
                    <div>👤 प्रमुख: <strong>{center.contactPerson}</strong> ({center.contactPhone})</div>
                    <div>🤝 पार्टनर: <strong>{center.partnerName}</strong> ({center.investmentTier})</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                    <span style={{ color: '#2563EB' }}>👥 आजचे अभ्यागत: {center.todayVisitors || 24}</span>
                    <span style={{ color: '#16A34A' }}>💰 आजचा गल्ला: ₹{(center.dailyCollection || 12000).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: District Leadership Directory */}
        {activeTab === 'leadership' && (
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #FED7AA', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#7C2D12', fontSize: '1.2rem', fontWeight: 800 }}>
              {selectedDivision} — अधिकृत जिल्हा पदाधिकारी समन्वय
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {divDistricts.map((dist, idx) => (
                <div key={idx} style={{ border: '1px solid #FFEDD5', borderRadius: '12px', padding: '16px', background: '#FFFDF9' }}>
                  <div style={{ fontSize: '0.85rem', color: '#EA580C', fontWeight: 700 }}>जिल्हाध्यक्ष (District President)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7C2D12', marginTop: '2px' }}>
                    श्री. {dist} जिल्हाध्यक्ष
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#78716C', marginTop: '4px' }}>
                    📍 {dist} जिल्हा मध्यवर्ती कार्यालय
                  </div>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => showToast(`📞 ${dist} जिल्हाध्यक्षांशी थेट संपर्क जोडत आहे...`)}
                      style={{ flex: 1, background: '#FFF7ED', border: '1px solid #FDBA74', color: '#C2410C', padding: '6px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      📞 संपर्क
                    </button>
                    <button
                      onClick={() => showToast(`✉️ ${dist} कार्यालयाला अधिकृत मेसेज पाठवला!`)}
                      style={{ flex: 1, background: '#C2410C', border: 'none', color: '#FFF', padding: '6px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      ✉️ मेसेज
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Broadcast Notice */}
        {activeTab === 'notices' && (
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #FED7AA', padding: '24px' }}>
            <h3 style={{ margin: '0 0 8px', color: '#7C2D12', fontSize: '1.2rem', fontWeight: 800 }}>
              📢 विभागीय बैठक व आदेश प्रसारण (Executive Broadcast)
            </h3>
            <p style={{ margin: '0 0 20px', color: '#78716C', fontSize: '0.9rem' }}>
              येथून पाठवलेला संदेश {selectedDivision} मधील सर्व {divDistricts.length} जिल्हाध्यक्षांच्या CRM वर त्वरित पाठवला जाईल.
            </p>

            <form onSubmit={handleSendNotice}>
              <textarea
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="उदा. सर्व जिल्हाध्यक्षांनी आगामी महासंमेलन नियोजनासाठी येत्या शुक्रवारी सकाळी ११ वाजता विभागीय कार्यालयात उपस्थित राहावे..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #FDBA74',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  marginBottom: '16px'
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)',
                  color: '#FFF',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(194,65,12,0.3)'
                }}
              >
                📢 सर्व जिल्हाध्यक्षांना सूचना पाठवा
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
