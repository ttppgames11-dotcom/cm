import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMemberReferrals, getMemberReferralStats } from '../../services/referralService';

export default function ReferralPortalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      sessionStorage.setItem('cm_login_redirect', '/referrals');
      navigate('/login?redirect=%2Freferrals');
    }
  }, [user, navigate]);

  const referralCode = user?.referralCode || user?.phone?.slice(-6) || 'CM9901';
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `🚩 जय शिवराय! Connect Maratha — महाराष्ट्रातील मराठा समाजाचे सर्वात मोठे डिजिटल व्यासपीठ. नोकरी, व्यवसाय, B2B लीड्स, इतिहास आणि समाज प्रगतीसाठी माझ्या रेफरल लिंकवरून आजच मोफत नोंदणी करा: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Referral Bands
  const bands = [
    { name: '🌱 Entry Level', min: 100, max: 499, stage: 'Initial Contribution', role: 'स्वयंसेवक / प्राथमिक सहाय्यक' },
    { name: '🌿 Active Volunteer', min: 500, max: 999, stage: 'Active Community Contributor', role: 'स्थानिक समन्वयक / सहाय्यक' },
    { name: '🌳 Established Rep', min: 1000, max: 2499, stage: 'Established Representative', role: 'शाखा प्रमुख / चॅप्टर प्रतिनिधी' },
    { name: '⭐ Core Pillar', min: 2500, max: 4999, stage: 'Core Community Pillar', role: 'तालुका समन्वयक' },
    { name: '🏆 Taluka Leader', min: 5000, max: 9999, stage: 'Taluka Level Leader', role: 'तालुकाध्यक्ष / प्रमुख' },
    { name: '🌟 District Pillar', min: 10000, max: 19999, stage: 'District Pillar', role: 'जिल्हा उपाध्यक्ष / संघटक' },
    { name: '🎖️ District Leader', min: 20000, max: 34999, stage: 'District Level Leader', role: 'जिल्हाध्यक्ष / प्रमुख प्रशासक' },
    { name: '👑 Vibhag Leader', min: 35000, max: 49999, stage: 'Vibhag Level Leader', role: 'विभागीय प्रमुख (पुणे, कोकण...)' },
    { name: '🚩 Prant Sanghatak', min: 50000, max: 999999, stage: 'State / Prant Level Leadership', role: 'प्रांत संघटक / राज्य मंडळ' }
  ];

  const currentReferrals = user?.referralCount || 12;
  const currentBand = bands.find(b => currentReferrals >= b.min && currentReferrals <= b.max) || {
    name: '🌱 नवशिका (Beginner)',
    stage: 'प्रारंभिक नोंदणी',
    role: 'सक्रिय सभासद'
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', padding: '36px 0' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>

        {/* 1. Header Banner */}
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: '0 12px 30px rgba(67, 20, 7, 0.15)',
          background: '#431407'
        }}>
          <img
            src="/assets/images/referral-rewards-banner.jpg"
            alt="Referral Rewards Banner"
            style={{
              width: '100%',
              height: '240px',
              objectFit: 'cover',
              opacity: 0.35,
              display: 'block'
            }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '24px 36px',
            color: '#FFFFFF'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: '#EA580C', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 900 }}>
                ● REWARDS & RECOGNITION
              </span>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800 }}>
                रेफरल सन्मान व मानधन केंद्र
              </span>
            </div>
            <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)', fontFamily: 'Baloo 2', fontWeight: 900 }}>
              🎁 Referral मधून सन्मान, मानधन व नेतृत्व
            </h1>
            <p style={{ margin: 0, maxWidth: '750px', fontSize: '0.98rem', color: '#FED7AA', lineHeight: 1.5 }}>
              आपल्या कुटुंबातील व मित्रपरिवारातील बांधवांना Connect Maratha मध्ये सहभागी करा. प्रत्येक पडताळणीनंतर अधिकृत मानधन व संघटनात्मक पदांसाठी पात्रता गुण मिळवा.
            </p>
          </div>
        </div>

        {/* 2. Referral Link Share Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '2px solid #FED7AA',
          padding: '28px',
          marginBottom: '32px',
          boxShadow: '0 10px 25px rgba(234, 88, 12, 0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase' }}>YOUR UNIQUE REFERRAL LINK</span>
              <h2 style={{ margin: '4px 0 0', fontSize: '1.4rem', fontFamily: 'Baloo 2', color: '#431407' }}>
                आपला वैयक्तिक रेफरल कोड: <span style={{ color: '#EA580C' }}>{referralCode}</span>
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={copyToClipboard}
                style={{
                  background: copied ? '#15803D' : '#FFF7ED',
                  color: copied ? '#FFFFFF' : '#C2410C',
                  border: '1.5px solid #FED7AA',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{copied ? '✓ कॉपी झाले!' : '📋 लिंक कॉपी करा'}</span>
              </button>

              <button
                onClick={shareOnWhatsApp}
                style={{
                  background: '#25D366',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: 900,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                }}
              >
                <span>💬 WhatsApp वर शेअर करा</span>
              </button>
            </div>
          </div>

          <div style={{
            background: '#F8FAFC',
            padding: '12px 18px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            fontFamily: 'monospace',
            color: '#1E293B',
            wordBreak: 'break-all',
            fontSize: '0.92rem'
          }}>
            {referralLink}
          </div>
        </div>

        {/* 3. Stats & Band Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '36px' }}>
          
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#C2410C' }}>{currentReferrals}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#78350F' }}>एकूण थेट रेफरल्स (Direct Referrals)</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>सत्यापित नोंदींची संख्या</div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💰</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#15803D' }}>₹{(currentReferrals * 25).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#166534' }}>पात्र मानधन / कमिशन (Honorarium)</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>संघटनात्मक नियमांनुसार देय</div>
          </div>

          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1.5px solid #FED7AA', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏅</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#431407', margin: '4px 0' }}>{currentBand.name}</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#EA580C' }}>{currentBand.role}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>सध्याचा पात्रता स्तर (Current Band)</div>
          </div>

        </div>

        {/* 4. The 9 Referral Bands Framework */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1.5px solid #E2E8F0',
          padding: '30px',
          marginBottom: '36px'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase' }}>
            ORGANIZATIONAL FRAMEWORK
          </span>
          <h2 style={{ margin: '4px 0 10px', fontSize: '1.5rem', fontFamily: 'Baloo 2', color: '#1E293B' }}>
            🚩 ९ संघटनात्मक रेफरल बँड्स व पद पात्रता (Referral Bands)
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Connect Maratha मध्ये केवळ रेफरल्सची संख्या वाढवून थेट पद मिळत नाही; ती पहिली पात्रता पायरी (Gate 1) आहे. त्यानंतर कौशल्य व मुलाखत प्रक्रियेद्वारे अधिकृत पदावर नियुक्ती केली जाते.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA', color: '#78350F' }}>
                  <th style={{ padding: '12px 14px' }}>बँड (Band)</th>
                  <th style={{ padding: '12px 14px' }}>रेफरल मर्यादा</th>
                  <th style={{ padding: '12px 14px' }}>उमेदवार टप्पा</th>
                  <th style={{ padding: '12px 14px' }}>संभाव्य जबाबदारी</th>
                </tr>
              </thead>
              <tbody>
                {bands.map((b, idx) => {
                  const isCurrent = currentReferrals >= b.min && currentReferrals <= b.max;
                  return (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        background: isCurrent ? '#FEF3C7' : 'transparent',
                        fontWeight: isCurrent ? 800 : 500
                      }}
                    >
                      <td style={{ padding: '12px 14px', color: '#1E293B' }}>{b.name}</td>
                      <td style={{ padding: '12px 14px', color: '#C2410C', fontWeight: 700 }}>
                        {b.min.toLocaleString('en-IN')} – {b.max > 100000 ? '५०,०००+' : b.max.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{b.stage}</td>
                      <td style={{ padding: '12px 14px', color: '#0F172A' }}>{b.role}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. 5 Candidate Evaluation Gates */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
          borderRadius: '20px',
          border: '1.5px solid #FED7AA',
          padding: '28px'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontFamily: 'Baloo 2', color: '#431407' }}>
            🎯 संघटनात्मक नियुक्तीच्या ५ पायऱ्या (Selection Engine)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #FED7AA' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#EA580C' }}>पायरी १</div>
              <h4 style={{ margin: '6px 0', fontSize: '1rem', color: '#1E293B' }}>Gate 1: रेफरल्स पात्रता</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>थेट सत्यापित सभासद संख्या पूर्ण करणे</p>
            </div>
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #FED7AA' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#EA580C' }}>पायरी २</div>
              <h4 style={{ margin: '6px 0', fontSize: '1rem', color: '#1E293B' }}>Gate 2: कौशल्य व शिक्षण</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>शिक्षण, सामाजिक अनुभव व कार्यक्षमता</p>
            </div>
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #FED7AA' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#EA580C' }}>पायरी ३</div>
              <h4 style={{ margin: '6px 0', fontSize: '1rem', color: '#1E293B' }}>Gate 3: निवड मुलाखत</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>जिल्हा / राज्य समितीद्वारे थेट संवाद</p>
            </div>
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '12px', border: '1px solid #FED7AA' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#EA580C' }}>पायरी ४</div>
              <h4 style={{ margin: '6px 0', fontSize: '1rem', color: '#1E293B' }}>Gate 4: नियुक्ती पत्र</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>अधिकृत डिजिटल नियुक्ती पत्र व ओळखपत्र</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
