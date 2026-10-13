import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { getAllReferrals } from '../../services/referralService';

export default function ChapterPresidentCRM() {
  const [selectedChapter, setSelectedChapter] = useState('pune');
  const [activeTab, setActiveTab] = useState('roster'); // 'roster', 'referrals', 'meetings'
  const [loading, setLoading] = useState(true);
  const [realMembers, setRealMembers] = useState([]);
  const [realReferrals, setRealReferrals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // New referral modal
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [slipForm, setSlipForm] = useState({
    giver: '',
    receiver: '',
    requirement: '',
    amount: ''
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, refs] = await Promise.all([
        apiClient.getAdminUsers().catch(() => ({ users: [] })),
        Promise.resolve(getAllReferrals())
      ]);

      setRealMembers(usersRes.users || []);
      setRealReferrals(refs || []);
    } catch (e) {
      console.warn('Chapter CRM loading error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chapterDistricts = {
    pune: 'पुणे',
    mumbai: 'मुंबई',
    pcmc: 'हवेली'
  };

  const targetDist = chapterDistricts[selectedChapter] || 'पुणे';

  // Real members matching chapter geography
  const chapterMembers = realMembers.filter(m => {
    const d = (m.district || m.city || '').toLowerCase();
    return d.includes(targetDist.toLowerCase()) || targetDist.toLowerCase().includes(d);
  });

  // Real referrals associated
  const chapterReferrals = realReferrals.filter(r => {
    const d = (r.district || r.referrerDistrict || '').toLowerCase();
    return d.includes(targetDist.toLowerCase()) || targetDist.toLowerCase().includes(d);
  });

  const handleRecordSlip = (e) => {
    e.preventDefault();
    if (!slipForm.giver || !slipForm.receiver || !slipForm.requirement) {
      showToast('कृपया सर्व आवश्यक माहिती भरा.');
      return;
    }

    const newSlip = {
      id: `SLIP-${Date.now().toString().slice(-5)}`,
      giver: slipForm.giver,
      receiver: slipForm.receiver,
      requirement: slipForm.requirement,
      amount: slipForm.amount ? `₹${slipForm.amount}` : 'चर्चेत',
      date: new Date().toLocaleDateString('mr-IN'),
      status: 'Open'
    };

    setRealReferrals(prev => [newSlip, ...prev]);
    setShowSlipModal(false);
    setSlipForm({ giver: '', receiver: '', requirement: '', amount: '' });
    showToast('✓ नवीन B2B व्यवसाय संदर्भ (Referral Slip) नोंदवला गेला!');
  };

  const filteredMembers = chapterMembers.filter(m => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.profession || '').toLowerCase().includes(q) ||
      (m.business || '').toLowerCase().includes(q) ||
      String(m.id || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ background: '#FFFDF9', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: '#431407',
          color: '#FED7AA',
          border: '1px solid #EA580C',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
          zIndex: 9999,
          fontWeight: 600
        }}>
          {toastMessage}
        </div>
      )}

      {/* TOP HEADER */}
      <div style={{ background: '#FFFFFF', color: '#1E293B', padding: '12px 24px', borderBottom: '1.5px solid #FED7AA' }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>💼</span>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#431407', fontFamily: 'Baloo 2' }}>
                CONNECT MARATHA — चॅप्टर अध्यक्ष CRM (Live Database)
              </strong>
              <div style={{ fontSize: '0.75rem', color: '#7C2D12' }}>
                स्थानिक व्यवसाय मंडळ, थेट सदस्य रोस्टर व B2B रेफरल्स
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={loadData}
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: '#EA580C',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer'
              }}>
              🔄 रीफ्रेश डेटा
            </button>
            <Link
              to="/crm"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: '#FFF7ED',
                color: '#EA580C',
                border: '1px solid #FED7AA',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              CRM मुख्य कक्ष
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '24px' }}>
        
        {/* CHAPTER BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, #15803D, #16A34A)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(22, 163, 74, 0.25)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
              💼 CHAPTER LEADERSHIP DASHBOARD (LIVE)
            </span>
            <h1 style={{ fontSize: '1.9rem', margin: '8px 0 4px', fontFamily: 'Baloo 2', fontWeight: 800 }}>
              {targetDist} चॅप्टर — व्यावसायिक संगम कक्ष
            </h1>
            <p style={{ margin: 0, fontSize: '0.92rem', opacity: 0.9 }}>
              एकूण नोंदणीकृत सदस्य: <strong>{chapterMembers.length}</strong> • थेट रेफरल्स: <strong>{chapterReferrals.length}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 800, color: '#DCFCE7' }}>चॅप्टर निवडा:</label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#fff',
                color: '#0f172a',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              <option value="pune">पुणे चॅप्टर (Pune)</option>
              <option value="mumbai">मुंबई चॅप्टर (Mumbai)</option>
              <option value="pcmc">PCMC औद्योगिक चॅप्टर</option>
            </select>
          </div>
        </div>

        {/* METRIC CARDS (REAL DATA ONLY) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1.5px solid #FED7AA', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>चॅप्टरमधील एकूण सदस्य (Live)</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              {chapterMembers.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>थेट डेटाबेस संख्या</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1.5px solid #FED7AA', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>सत्यापित व्यावसायिक (Verified)</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#16a34a', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              {chapterMembers.filter(m => m.verified).length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>प्रमाणित ओळखपत्रे</div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1.5px solid #FED7AA', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>नोंदणीकृत व्यवसाय संदर्भ (Referrals)</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#EA580C', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              {chapterReferrals.length}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>थेट B2B देवाणघेवाण</div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #FED7AA', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('roster')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'roster' ? '#EA580C' : 'transparent',
              color: activeTab === 'roster' ? '#fff' : '#7C2D12',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            👥 चॅप्टर सदस्य रोस्टर ({chapterMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === 'referrals' ? '#EA580C' : 'transparent',
              color: activeTab === 'referrals' ? '#fff' : '#7C2D12',
              borderRadius: '8px 8px 0 0',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            🤝 व्यवसाय संदर्भ (Referrals)
          </button>
        </div>

        {/* ROSTER TAB */}
        {activeTab === 'roster' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #FED7AA', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#431407', fontWeight: 900 }}>
                👥 {targetDist} चॅप्टर अधिकृत सदस्य यादी (Live Database)
              </h3>
              <input
                type="text"
                placeholder="🔎 नाव, ID किंवा व्यवसाय शोधा..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '6px', border: '1.5px solid #FED7AA', fontSize: '0.84rem', minWidth: '220px' }}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#EA580C', fontWeight: 800 }}>
                सदस्य यादी डेटाबेसमधून लोड होत आहे...
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA', textAlign: 'left', color: '#7C2D12' }}>
                      <th style={{ padding: '12px 14px' }}>सदस्य आयडी</th>
                      <th style={{ padding: '12px 14px' }}>नाव</th>
                      <th style={{ padding: '12px 14px' }}>संपर्क</th>
                      <th style={{ padding: '12px 14px' }}>व्यवसाय / पेशा</th>
                      <th style={{ padding: '12px 14px' }}>तालुका</th>
                      <th style={{ padding: '12px 14px' }}>स्थिती</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                          या चॅप्टरमध्ये अद्याप सदस्य आढळले नाहीत.
                        </td>
                      </tr>
                    ) : (
                      filteredMembers.map((m) => (
                        <tr key={m.id} style={{ borderBottom: '1px solid #FED7AA' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#EA580C', fontFamily: 'monospace' }}>
                            {m.id}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1E293B' }}>
                            {m.name}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569', fontSize: '0.82rem' }}>
                            {m.phone || m.mobile || '—'}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {m.profession || m.business || 'सभासद'}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>
                            {m.taluka || '—'}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              background: m.verified ? '#DCFCE7' : '#FEF3C7',
                              color: m.verified ? '#15803D' : '#B45309'
                            }}>
                              {m.verified ? '✓ प्रमाणित' : '⏳ प्रलंबित'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REFERRALS TAB */}
        {activeTab === 'referrals' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1.5px solid #FED7AA', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#431407', fontWeight: 900 }}>
                🤝 चॅप्टर व्यवसाय संदर्भ (B2B Referrals)
              </h3>
              <button
                type="button"
                onClick={() => setShowSlipModal(true)}
                style={{
                  background: '#16A34A',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}>
                ➕ नवीन संदर्भ नोंदवा (Give Slip)
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA', textAlign: 'left', color: '#7C2D12' }}>
                    <th style={{ padding: '12px 14px' }}>संदर्भ क्र.</th>
                    <th style={{ padding: '12px 14px' }}>दिनांक</th>
                    <th style={{ padding: '12px 14px' }}>संदर्भ देणारा</th>
                    <th style={{ padding: '12px 14px' }}>संदर्भ घेणारा</th>
                    <th style={{ padding: '12px 14px' }}>कामाचा तपशील</th>
                    <th style={{ padding: '12px 14px' }}>अंदाजे रक्कम</th>
                  </tr>
                </thead>
                <tbody>
                  {realReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                        या चॅप्टरमध्ये अद्याप कोणताही B2B संदर्भ नोंदवला गेलेला नाही.
                      </td>
                    </tr>
                  ) : (
                    realReferrals.map((r, idx) => (
                      <tr key={r.id || idx} style={{ borderBottom: '1px solid #FED7AA' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: '#EA580C', fontFamily: 'monospace' }}>
                          {r.id || `REF-${idx + 1}`}
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: '#64748B' }}>
                          {r.registeredAt || r.date || 'नुकतेच'}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1E293B' }}>
                          {r.referrerName || r.giver || 'सभासद'}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1E293B' }}>
                          {r.refereeName || r.receiver || 'नवीन सभासद'}
                        </td>
                        <td style={{ padding: '12px 14px', color: '#475569' }}>
                          {r.requirement || 'नवीन व्यवसाय शिफारस'}
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 800, color: '#16A34A' }}>
                          {r.amount || (r.bonusAmount ? `₹${r.bonusAmount}` : '—')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL TO ADD B2B SLIP */}
      {showSlipModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', border: '2px solid #EA580C' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#431407', fontWeight: 900 }}>
              ➕ नवीन B2B व्यवसाय संदर्भ (Referral Slip)
            </h3>
            <form onSubmit={handleRecordSlip} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '4px' }}>संदर्भ देणारा सदस्य:</label>
                <input
                  type="text"
                  required
                  placeholder="नाव"
                  value={slipForm.giver}
                  onChange={(e) => setSlipForm({ ...slipForm, giver: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '4px' }}>संदर्भ घेणारा सदस्य:</label>
                <input
                  type="text"
                  required
                  placeholder="नाव"
                  value={slipForm.receiver}
                  onChange={(e) => setSlipForm({ ...slipForm, receiver: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '4px' }}>व्यवसाय संधी / कामाचा तपशील:</label>
                <textarea
                  required
                  placeholder="कामाचे स्वरूप..."
                  value={slipForm.requirement}
                  onChange={(e) => setSlipForm({ ...slipForm, requirement: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA', boxSizing: 'border-box', minHeight: '60px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7C2D12', marginBottom: '4px' }}>अंदाजे रक्कम (₹):</label>
                <input
                  type="text"
                  placeholder="उदा. ५०,०००"
                  value={slipForm.amount}
                  onChange={(e) => setSlipForm({ ...slipForm, amount: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FED7AA', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowSlipModal(false)}
                  style={{ padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#EA580C', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}>
                  संदर्भ सेव्ह करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
