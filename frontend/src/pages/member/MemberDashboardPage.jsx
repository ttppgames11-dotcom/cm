import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CMDB from '../../services/cmdb';

export default function MemberDashboardPage() {
  const { user } = useAuth();

  if (!user || !user.id) {
    return (
      <div style={{
        background: '#f8fafc',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '3rem 2rem',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: '#fff7ed',
            color: '#c2410c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 1.5rem'
          }}>
            👤
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
            सभासद डॅशबोर्ड
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 2rem' }}>
            आपला डॅशबोर्ड व सर्व सामाजिक सुविधा पाहण्यासाठी कृपया प्रथम आपल्या खात्यात लॉगिन करा.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
            <Link
              to="/login"
              style={{
                background: '#ea580c',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '0.9rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
                display: 'block'
              }}
            >
              👤 लॉगिन करा (Login Now)
            </Link>
            <Link
              to="/register"
              style={{
                background: '#f1f5f9',
                color: '#334155',
                textDecoration: 'none',
                padding: '0.8rem',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'block'
              }}
            >
              🚩 नवीन सभासद नोंदणी (Register)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const member = user;
  const memberId = member.id;
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
            🪪 संपूर्ण कार्ड पहा
          </Link>
          <Link to="/referrals/create" className="btn btn-outline" style={{ borderColor: '#FFFFFF', color: '#FFFFFF', fontWeight: 700, padding: '10px 18px' }}>
            🤝 नवीन संदर्भ द्या
          </Link>
        </div>
      </div>

      {/* Member Official Digital Smart Card Showcase */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 100%)',
        border: '1.5px solid #FFCC80',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: '0 6px 20px rgba(199,56,0,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem' }}>🪪</span>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontFamily: 'Baloo 2', color: '#8B1E0F', fontWeight: 800 }}>
              आपले अधिकृत डिजिटल सभासद ओळखपत्र (Smart ID Card)
            </h2>
          </div>
          <Link to="/card" style={{ fontSize: '0.88rem', color: '#E65100', fontWeight: 700, textDecoration: 'none' }}>
            3D फिरवा व प्रिंट करा →
          </Link>
        </div>

        {/* Card Component Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #C73800 0%, #E65100 50%, #BF360C 100%)',
          borderRadius: '14px',
          color: '#FFFFFF',
          padding: '22px 26px',
          maxWidth: '520px',
          margin: '0 auto',
          boxShadow: '0 10px 28px rgba(199,56,0,0.25)',
          border: '1.5px solid rgba(255,255,255,0.35)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.25)', paddingBottom: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src="/assets/images/logo.png" alt="Logo" style={{ height: '34px', width: 'auto', background: '#fff', borderRadius: '50%', padding: '2px' }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.98rem', lineHeight: 1.1 }}>CONNECT MARATHA</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>CONNECT MARATHA SMART CARD</div>
              </div>
            </div>
            <span style={{ background: '#FFE082', color: '#B71C1C', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>
              {member.tier || 'Gold'} सदस्य
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '2.8rem', background: 'rgba(255,255,255,0.2)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {member.avatar || '👨'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', margin: '0 0 2px', fontWeight: 800, fontFamily: 'Baloo 2' }}>{member.name}</h3>
              <div style={{ fontSize: '0.84rem', opacity: 0.9 }}>{member.profession || 'व्यावसायिक सदस्य'}</div>
              <div style={{ fontSize: '0.82rem', color: '#FFE082', marginTop: '2px' }}>
                📍 {member.city || 'पुणे'}, {member.district || 'पुणे'}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
            <div>
              <div style={{ opacity: 0.75, fontSize: '0.68rem' }}>सदस्य आयडी (MEMBER ID)</div>
              <div style={{ fontWeight: 700, letterSpacing: '1px' }}>{memberId}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ opacity: 0.75, fontSize: '0.68rem' }}>सत्यापित नोंदणी</div>
              <div style={{ fontWeight: 700, color: '#FFE082' }}>✔ अधिकृत सक्रिय</div>
            </div>
          </div>
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
        <Link to="/roles-matrix" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>⚖️</div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#9A3412' }}>पद पात्रता मॅट्रिक्स</div>
            <div style={{ fontSize: '0.78rem', color: '#C2410C' }}>आपले रेफरल्स व पात्र पदे तपासा</div>
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
