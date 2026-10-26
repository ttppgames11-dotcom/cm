import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CMDB from '../../services/cmdb';

export default function ReferralsTrackerPage() {
  const [activeMode, setActiveMode] = useState('members'); // 'members' (सभासद नोंदणी) vs 'business' (व्यवसाय लीड्स)
  const [filterStage, setFilterStage] = useState('all');
  const [businessReferrals, setBusinessReferrals] = useState(() => CMDB.listReferrals ? CMDB.listReferrals() : []);
  const [memberReferrals, setMemberReferrals] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Fetch live member registration referrals from backend SQLite
  useEffect(() => {
    let isMounted = true;
    const loadLiveMembers = async () => {
      setLoadingMembers(true);
      try {
        const token = localStorage.getItem('cm_jwt_token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        // Try my referrals first, fallback to all referrals
        let res = await fetch('/api/members/referrals/my', { headers });
        let data = await res.json();
        
        if (!data?.referrals || data.referrals.length === 0) {
          const resAll = await fetch('/api/members/referrals/all', { headers });
          const allData = await resAll.json();
          if (allData?.referrals) {
            data = allData;
          }
        }

        if (isMounted && data && Array.isArray(data.referrals)) {
          setMemberReferrals(data.referrals);
        }
      } catch (err) {
        console.warn('Could not fetch live member referrals:', err);
      } finally {
        if (isMounted) setLoadingMembers(false);
      }
    };

    loadLiveMembers();
  }, []);

  const totalBusinessGiven = businessReferrals.length;
  const totalBusinessWon = businessReferrals.filter(r => r.status === 'Won').length;
  const totalBusinessRevenue = businessReferrals.reduce((sum, r) => sum + (Number(r.actualValue || r.estimatedValue) || 0), 0);

  const totalMemberRefs = memberReferrals.length;
  const activeMemberRefs = memberReferrals.filter(r => (r.status || '').toLowerCase() === 'active').length;
  const totalMemberBonus = activeMemberRefs * 100;

  const filteredBusiness = filterStage === 'all'
    ? businessReferrals
    : businessReferrals.filter(r => (r.status || '').toLowerCase() === filterStage.toLowerCase());

  const handleStatusUpdate = (id, newStatus) => {
    if (CMDB.updateReferralStatus) {
      CMDB.updateReferralStatus(id, newStatus);
      setBusinessReferrals([...CMDB.listReferrals()]);
    }
  };

  return (
    <div className="container py-5" style={{ padding: '36px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--maroon-900, #D84315)', fontSize: '2rem', margin: 0 }}>
            🤝 संदर्भ व आमंत्रण व्यवस्थापन (Referral Pipeline)
          </h1>
          <p style={{ color: '#666', margin: '4px 0 0' }}>
            अखिल भारतीय मराठा महासंघ — सभासद आमंत्रण लेजर व व्यावसायिक देवाणघेवाण.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/register" className="btn btn-outline" style={{ padding: '10px 18px', fontSize: '0.9rem' }}>
            👥 नवीन सभासद जोडा
          </Link>
          <Link to="/referrals/create" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.95rem' }}>
            ➕ व्यवसाय संदर्भ द्या
          </Link>
        </div>
      </div>

      {/* Primary Toggle: Member Registration Referrals vs Business Referrals */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #EEE', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveMode('members')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px',
            border: 'none',
            background: activeMode === 'members' ? 'var(--maroon-900, #D84315)' : '#F5F5F5',
            color: activeMode === 'members' ? '#FFF' : '#444',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <span>👥 सभासद नोंदणी संदर्भ ({totalMemberRefs})</span>
          <span style={{ fontSize: '0.78rem', background: activeMode === 'members' ? 'rgba(255,255,255,0.25)' : '#E0E0E0', padding: '2px 8px', borderRadius: '12px' }}>
            डेटाबेस थेट
          </span>
        </button>

        <button
          onClick={() => setActiveMode('business')}
          style={{
            padding: '10px 22px',
            borderRadius: '10px',
            border: 'none',
            background: activeMode === 'business' ? 'var(--maroon-900, #D84315)' : '#F5F5F5',
            color: activeMode === 'business' ? '#FFF' : '#444',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <span>💼 व्यवसाय संगम लीड्स ({totalBusinessGiven})</span>
          <span style={{ fontSize: '0.78rem', background: activeMode === 'business' ? 'rgba(255,255,255,0.25)' : '#E0E0E0', padding: '2px 8px', borderRadius: '12px' }}>
            B2B Deals
          </span>
        </button>
      </div>

      {/* KPI Stats */}
      {activeMode === 'members' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#FFF3E0', borderRadius: '12px', padding: '18px', textAlign: 'center', border: '1px solid #FFE0B2' }}>
            <div style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>एकूण नोंदवलेले सभासद</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--maroon-900)' }}>{totalMemberRefs}</div>
          </div>
          <div style={{ background: '#E8F5E9', borderRadius: '12px', padding: '18px', textAlign: 'center', border: '1px solid #C8E6C9' }}>
            <div style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>सक्रिय सभासद (Active)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2E7D32' }}>{activeMemberRefs}</div>
          </div>
          <div style={{ background: '#E3F2FD', borderRadius: '12px', padding: '18px', textAlign: 'center', border: '1px solid #BBDEFB' }}>
            <div style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>एकूण जमा रेफरल बोनस</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1565C0' }}>
              ₹{totalMemberBonus.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: '#FFF3E0', borderRadius: '12px', padding: '18px', textAlign: 'center', border: '1px solid #FFE0B2' }}>
            <div style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>एकूण व्यवसाय संदर्भ</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--maroon-900)' }}>{totalBusinessGiven}</div>
          </div>
          <div style={{ background: '#E8F5E9', borderRadius: '12px', padding: '18px', textAlign: 'center', border: '1px solid #C8E6C9' }}>
            <div style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>यशस्वी पूर्ण (Closed Won)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2E7D32' }}>{totalBusinessWon}</div>
          </div>
          <div style={{ background: '#E3F2FD', borderRadius: '12px', padding: '18px', textAlign: 'center', border: '1px solid #BBDEFB' }}>
            <div style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>उत्पन्न व्यवसाय मूल्य (Revenue)</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1565C0' }}>
              ₹{totalBusinessRevenue.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* MEMBER REGISTRATION REFERRALS VIEW */}
      {activeMode === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {loadingMembers ? (
            <div style={{ background: '#FFF', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px solid #EEE' }}>
              🔄 डेटाबेसमधून रेफरल नोंदी लोड होत आहेत...
            </div>
          ) : memberReferrals.length === 0 ? (
            <div style={{ background: '#FFFFFF', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px dashed #CCC', color: '#888' }}>
              अद्याप कोणतेही सभासद रेफरल नोंदवले गेले नाहीत.
            </div>
          ) : (
            memberReferrals.map((ref, idx) => (
              <div key={ref.id || idx} style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.78rem', background: '#FFF3E0', color: 'var(--maroon-900)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        {ref.id}
                      </span>
                      <span style={{
                        fontSize: '0.78rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        background: (ref.status || '').toLowerCase() === 'active' ? '#E8F5E9' : '#FFF8E1',
                        color: (ref.status || '').toLowerCase() === 'active' ? '#2E7D32' : '#F57F17'
                      }}>
                        {ref.status || 'Active'}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#666' }}>📍 {ref.district || 'महाराष्ट्र'}{ref.taluka ? `, ${ref.taluka}` : ''}</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', color: '#222', margin: '0 0 6px' }}>
                      👤 {ref.name || ref.refereeName}
                    </h3>
                    <div style={{ color: '#555', fontSize: '0.88rem', display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span>📱 <strong>{ref.mobileNo || ref.refereePhone || '-'}</strong></span>
                      {ref.email && <span>✉️ {ref.email}</span>}
                      <span>📅 नोंदणी तारीख: <strong>{ref.joiningDate || (ref.created_at ? ref.created_at.slice(0, 10) : '')}</strong></span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#777', marginTop: '6px' }}>
                      आमंत्रक (Referrer): <strong>{ref.referralName || ref.referrerName}</strong> ({ref.referralId || ref.referrerId})
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>रेफरल रोख बोनस</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2E7D32' }}>
                      ₹{ref.bonusAmount || 100}
                    </div>
                    <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', color: '#2E7D32', background: '#E8F5E9', padding: '2px 8px', borderRadius: '4px' }}>
                      ✓ Verified Member
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* BUSINESS SANGAM REFERRALS VIEW */}
      {activeMode === 'business' && (
        <>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
            {[
              { id: 'all', label: 'सर्व संदर्भ' },
              { id: 'new', label: 'नवीन (New)' },
              { id: 'contacted', label: 'संपर्क झाला (Contacted)' },
              { id: 'qualified', label: 'पात्र (Qualified)' },
              { id: 'proposal', label: 'प्रस्ताव (Proposal)' },
              { id: 'won', label: 'यशस्वी (Won)' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStage(tab.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: filterStage === tab.id ? '2px solid var(--saffron-500, #F4511E)' : '1px solid #DDD',
                  background: filterStage === tab.id ? '#FFF3E0' : '#FFF',
                  color: filterStage === tab.id ? 'var(--maroon-900)' : '#555',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  whiteSpace: 'nowrap'
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredBusiness.length === 0 ? (
              <div style={{ background: '#FFFFFF', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px dashed #CCC', color: '#888' }}>
                या टप्प्यात कोणतेही व्यवसाय संदर्भ उपलब्ध नाहीत.
              </div>
            ) : (
              filteredBusiness.map(ref => (
                <div key={ref.id} style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.78rem', background: '#FFF3E0', color: 'var(--maroon-900)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {ref.id}
                        </span>
                        <span style={{
                          fontSize: '0.78rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          background: ref.status === 'Won' ? '#E8F5E9' : '#FFF8E1',
                          color: ref.status === 'Won' ? '#2E7D32' : '#F57F17'
                        }}>
                          {ref.status}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: '#666' }}>📍 {ref.location || 'पुणे'}</span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', color: '#222', margin: '0 0 6px' }}>{ref.prospect}</h3>
                      <p style={{ color: '#555', fontSize: '0.92rem', margin: '0 0 8px', lineHeight: 1.5 }}>
                        {ref.requirement}
                      </p>
                      <div style={{ fontSize: '0.82rem', color: '#777' }}>
                        श्रेणी: <strong>{ref.category || 'व्यावसायिक सेवा'}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>अपेक्षित मूल्य</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--maroon-900)' }}>
                        ₹{Number(ref.estimatedValue || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        {ref.status !== 'Won' && (
                          <button 
                            onClick={() => handleStatusUpdate(ref.id, 'Won')}
                            className="btn btn-sm btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#2E7D32', borderColor: '#2E7D32' }}>
                            🎉 Closed Won
                          </button>
                        )}
                        {ref.status === 'New' && (
                          <button 
                            onClick={() => handleStatusUpdate(ref.id, 'Contacted')}
                            className="btn btn-sm btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                            संपर्क केला
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
