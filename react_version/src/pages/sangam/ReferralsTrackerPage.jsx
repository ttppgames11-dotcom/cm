import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CMDB from '../../services/cmdb';

export default function ReferralsTrackerPage() {
  const [filterStage, setFilterStage] = useState('all');
  const [referrals, setReferrals] = useState(() => CMDB.listReferrals ? CMDB.listReferrals() : []);

  const totalGiven = referrals.length;
  const totalWon = referrals.filter(r => r.status === 'Won').length;
  const totalRevenue = referrals.reduce((sum, r) => sum + (Number(r.actualValue || r.estimatedValue) || 0), 0);

  const filteredReferrals = filterStage === 'all'
    ? referrals
    : referrals.filter(r => r.status.toLowerCase() === filterStage.toLowerCase());

  const handleStatusUpdate = (id, newStatus) => {
    if (CMDB.updateReferralStatus) {
      CMDB.updateReferralStatus(id, newStatus);
      setReferrals([...CMDB.listReferrals()]);
    }
  };

  return (
    <div className="container py-5" style={{ padding: '36px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: 'var(--maroon-900, #D84315)', fontSize: '2rem', margin: 0 }}>
            🤝 व्यवसाय संदर्भ व्यवस्थापन (Referral Pipeline)
          </h1>
          <p style={{ color: '#666', margin: '4px 0 0' }}>
            अखिल भारतीय मराठा महासंघाच्या व्यवसाय मंडळामधील व्यावसायिक देवाणघेवाण.
          </p>
        </div>
        <Link to="/referrals/create" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.95rem' }}>
          ➕ नवीन संदर्भ द्या (Give Referral)
        </Link>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: '#FFF3E0', borderRadius: '12px', padding: '18px', textAlign: 'center', border: '1px solid #FFE0B2' }}>
          <div style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>एकूण नोंदवलेले संदर्भ</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--maroon-900)' }}>{totalGiven}</div>
        </div>
        <div style={{ background: '#E8F5E9', borderRadius: '12px', padding: '18px', textAlign: 'center', border: '1px solid #C8E6C9' }}>
          <div style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>यशस्वी पूर्ण (Closed Won)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2E7D32' }}>{totalWon}</div>
        </div>
        <div style={{ background: '#E3F2FD', borderRadius: '12px', padding: '18px', textAlign: 'center', border: '1px solid #BBDEFB' }}>
          <div style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>उत्पन्न व्यवसाय मूल्य (Revenue)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1565C0' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

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

      {/* Referrals List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredReferrals.length === 0 ? (
          <div style={{ background: '#FFFFFF', padding: '40px', textAlign: 'center', borderRadius: '12px', border: '1px dashed #CCC', color: '#888' }}>
            या टप्प्यात कोणतेही संदर्भ उपलब्ध नाहीत.
          </div>
        ) : (
          filteredReferrals.map(ref => (
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
    </div>
  );
}
