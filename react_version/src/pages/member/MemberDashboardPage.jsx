import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CMDB from '../../services/cmdb';

export default function MemberDashboardPage() {
  const { user } = useAuth();
  const member = user || (CMDB.currentMember ? CMDB.currentMember() : {
    name: 'अमोल जाधव',
    id: 'M1001',
    district: 'पुणे',
    tier: 'Gold'
  });

  const memberId = member.id || 'M1001';
  const scoreInfo = CMDB.calculateMemberContributionScore ? CMDB.calculateMemberContributionScore(memberId) : { totalScore: 95, badge: 'रौप्य शिलेदार' };
  const referrals = CMDB.listReferrals ? CMDB.listReferrals().filter(r => r.creator === memberId || r.giverId === memberId || r.recipient === memberId) : [];
  const meetings = CMDB.getOneToOneMeetings ? CMDB.getOneToOneMeetings().filter(m => m.requesterId === memberId || m.recipientId === memberId) : [];

  return (
    <div className="container py-5" style={{ padding: '36px 16px' }}>
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #C73800, #E65100)', borderRadius: '16px', color: '#fff', padding: '28px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ background: 'rgba(255,255,255,0.2)', display: 'inline-block', padding: '3px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '8px' }}>
            🚩 {member.tier || 'Gold'} सदस्य
          </div>
          <h1 style={{ fontSize: '1.8rem', margin: 0 }}>सस्नेह जय शिवराय, {member.name}!</h1>
          <p style={{ margin: '6px 0 0', opacity: 0.9, fontSize: '0.95rem' }}>
            आपला सदस्य आयडी: <strong>{memberId}</strong> | 📍 {member.district || 'पुणे'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/card" className="btn btn-primary" style={{ background: '#FFFFFF', color: '#C73800', border: 'none', fontWeight: 700, padding: '10px 18px' }}>
            🪪 स्मार्ट कार्ड पहा
          </Link>
          <Link to="/referrals/create" className="btn btn-outline" style={{ borderColor: '#FFFFFF', color: '#FFFFFF', fontWeight: 700, padding: '10px 18px' }}>
            🤝 नवीन संदर्भ द्या
          </Link>
        </div>
      </div>

      {/* Grid: Score & Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {/* Contribution Gamification Card */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#333' }}>🏆 योगदान गुण (Gamification)</h3>
            <span style={{ fontSize: '0.85rem', color: '#E65100', fontWeight: 700 }}>{scoreInfo.badge}</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--maroon-900, #D84315)', marginBottom: '8px' }}>
            {scoreInfo.totalScore} <span style={{ fontSize: '1rem', color: '#888', fontWeight: 400 }}>गुण</span>
          </div>
          {/* Progress bar */}
          <div style={{ background: '#EEEEEE', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ background: 'var(--saffron-500, #F4511E)', height: '100%', width: `${Math.min(100, (scoreInfo.totalScore / 150) * 100)}%` }} />
          </div>
          <p style={{ fontSize: '0.82rem', color: '#666', margin: 0 }}>
            पुढील टप्पा गाठण्यासाठी नवीन व्यवसाय संदर्भ द्या (+१० गुण) किंवा १-टू-१ भेट पूर्ण करा (+५ गुण).
          </p>
        </div>

        {/* Referrals Stats */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px', color: '#333' }}>💼 व्यवसाय संदर्भ (Referrals)</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2E7D32' }}>{referrals.length}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>सक्रिय संदर्भ</div>
            </div>
            <div style={{ borderRight: '1px solid #EEE' }} />
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1565C0' }}>{meetings.length}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>१-टू-१ भेटी</div>
            </div>
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/referrals" style={{ fontSize: '0.88rem', color: 'var(--maroon-900)', fontWeight: 600, textDecoration: 'none' }}>
              सर्व संदर्भ व्यवस्थापन पहा →
            </Link>
          </div>
        </div>
      </div>

      {/* Action shortcuts */}
      <h2 style={{ fontSize: '1.3rem', color: 'var(--maroon-900)', marginBottom: '16px' }}>
        ⚡ जलद पर्याय (Quick Actions)
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Link to="/referrals/create" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🤝</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>संदर्भ द्या (Give Referral)</div>
            <div style={{ fontSize: '0.78rem', color: '#666' }}>इतर उद्योजकांना लीड पाठवा</div>
          </div>
        </Link>
        <Link to="/business/meetings" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>☕</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>१-टू-१ भेट ठरवा</div>
            <div style={{ fontSize: '0.78rem', color: '#666' }}>उद्योजकांशी बैठक ठरवा</div>
          </div>
        </Link>
        <Link to="/business/directory" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>📖</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>उद्योजक डिरेक्टरी</div>
            <div style={{ fontSize: '0.78rem', color: '#666' }}>राज्यभरातील मराठा व्यावसायिक</div>
          </div>
        </Link>
        <Link to="/donation" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🏰</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>दुर्ग संवर्धन निधी</div>
            <div style={{ fontSize: '0.78rem', color: '#666' }}>किल्ले संवर्धनासाठी देणगी द्या</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
