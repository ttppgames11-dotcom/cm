import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DigitalMemberCardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('member');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  // Strictly enforce login: If user is not logged in, render Login Gate Screen
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
            🪪
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
            डिजिटल सभासद ओळखपत्र
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, margin: '0 0 2rem' }}>
            आपले डिजिटल सभासद कार्ड (Digital Member ID Card) पाहण्यासाठी किंवा डाऊनलोड करण्यासाठी कृपया प्रथम आपल्या खात्यात लॉगिन करा.
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

  const memberName = user.name || user.fullName || 'मराठा सभासद';
  const memberRole = user.profession || user.persona || '💼 नोंदणीकृत सदस्य';
  const memberCity = user.city ? `${user.city} • महाराष्ट्र` : 'महाराष्ट्र';
  const memberId = user.id || 'CM-MH-2026-8842';
  const memberTier = user.tier || 'GOLD MEMBER';

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert('🔗 कार्ड लिंक क्लिपबोर्डवर कॉपी केली!');
    } else {
      alert('🔗 लिंक: ' + url);
    }
  };

  const handleDownload = () => {
    alert('📥 तुमचे डिजिटल सभासद कार्ड (PNG/PDF) तयार झाले!');
  };

  const handleSimulateScan = () => {
    setScannerOpen(false);
    alert(`✓ QR कोड पडताळला! सदस्य: ${memberName} शी कनेक्शन विनंती पाठवली.`);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) {
      alert('कृपया पडताळणीसाठी कोड प्रविष्ट करा');
      return;
    }
    setVerifyResult({
      code: verifyCode.trim(),
      name: memberName,
      status: 'valid'
    });
    alert('✓ कोड वैध आढळला!');
  };

  return (
    <>
      <style>{`
        .card-perspective {
          perspective: 1200px;
          max-width: 480px;
          margin: 32px auto;
        }
        .digital-id-card {
          width: 100%;
          height: 290px;
          border-radius: 20px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
        }
        .digital-id-card.flipped {
          transform: rotateY(180deg);
        }
        .card-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          backface-visibility: hidden;
          overflow: hidden;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #fff;
          box-sizing: border-box;
        }
        .card-front {
          background: linear-gradient(135deg, #3d0d0d 0%, #8f2020 50%, #c9701c 100%);
          border: 2px solid rgba(255, 215, 0, 0.4);
        }
        .card-back {
          background: linear-gradient(135deg, #1f0505 0%, #4a0d0d 70%, #1f0505 100%);
          border: 2px solid rgba(255, 215, 0, 0.3);
          transform: rotateY(180deg);
        }
        .chip {
          width: 42px;
          height: 32px;
          background: linear-gradient(135deg, #d4af37 0%, #fff6a6 50%, #aa8010 100%);
          border-radius: 6px;
          border: 1px solid #7c5c00;
        }
        .qr-box {
          background: #fff;
          padding: 6px;
          border-radius: 8px;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .scan-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .scanner-window {
          width: 260px;
          height: 260px;
          border: 3px solid #f0b866;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          margin: 20px auto;
          background: #111;
        }
        .scanner-laser {
          position: absolute;
          width: 100%;
          height: 3px;
          background: #00e676;
          box-shadow: 0 0 12px #00e676;
          animation: scanLaser 2s infinite ease-in-out;
        }
        @keyframes scanLaser {
          0% { top: 0; }
          50% { top: 96%; }
          100% { top: 0; }
        }
      `}</style>

      {/* Floating Toast */}
      {typeof toastMessage !== 'undefined' && toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: toastMessage.type === 'error' ? '#C62828' : '#2E7D32',
          color: '#FFF',
          padding: '12px 22px',
          borderRadius: '10px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toastMessage.msg}
        </div>
      )}

      {/* TOP NOTIFICATION STRIP */}
      <div className="topbar">
        <div className="wrap topbar-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 24px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>🚩 CONNECT MARATHA</span>
            <span>डिजिटल ओळखपत्र व QR प्रमाणीकरण व्यासपीठ</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>📞 समाज हेल्पलाईन: <strong>१८००-१२३-१६७४</strong></span>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }}>
        {/* SECTION TITLE */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 32px' }}>
          <span className="tag" style={{ background: 'var(--maroon-900)', color: 'var(--gold-400)' }}>
            अधिकृत ओळखपत्र • SPEC ROUTE /member/card
          </span>
          <h1 style={{ fontSize: '2.4rem', margin: '10px 0', fontFamily: 'Baloo 2' }}>
            डिजिटल सभासद कार्ड व QR प्रणाली
          </h1>
          <p style={{ color: 'var(--text-sec)', fontSize: '1rem' }}>
            स्मार्ट डिजिटल ओळखपत्र, झटपट Scan & Connect तंत्रज्ञान आणि अखिल भारतीय अधिकृत सभासद पडताळणी.
          </p>
        </div>

        {/* 3D FLIPPABLE DIGITAL ID CARD */}
        <div className="card-perspective">
          <div
            id="digitalCard"
            className={`digital-id-card ${isFlipped ? 'flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* FRONT OF CARD */}
            <div className="card-face card-front">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src="/assets/images/logo.png"
                    alt="Logo"
                    style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #fff' }}
                  />
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.5px' }}>CONNECT MARATHA</div>
                    <div style={{ fontSize: '0.68rem', opacity: 0.85 }}>अखिल भारतीय अधिकृत सभासद ओळखपत्र</div>
                  </div>
                </div>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,215,0,0.6)', color: '#fff', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                  ⭐ {memberTier}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', margin: '14px 0' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '14px', border: '2px solid var(--gold-400)', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', flexShrink: 0 }}>
                  {user?.avatar || '👤'}
                </div>
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.2 }}>{memberName}</div>
                  <div style={{ fontSize: '0.85rem', color: '#ffe082', fontWeight: 600, margin: '2px 0' }}>
                    {memberRole}
                  </div>
                  <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>📍 {memberCity}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.8, textTransform: 'uppercase' }}>Member ID</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '1px', color: '#fff6a6' }}>
                    {memberId}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#81c784', marginTop: '2px' }}>✓ DPDP २०२३ प्रमाणित</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="qr-box">
                    <svg width="68" height="68" viewBox="0 0 25 25" fill="#111">
                      <rect x="0" y="0" width="7" height="7"/>
                      <rect x="1" y="1" width="5" height="5" fill="#fff"/>
                      <rect x="2" y="2" width="3" height="3"/>
                      <rect x="18" y="0" width="7" height="7"/>
                      <rect x="19" y="1" width="5" height="5" fill="#fff"/>
                      <rect x="20" y="2" width="3" height="3"/>
                      <rect x="0" y="18" width="7" height="7"/>
                      <rect x="1" y="19" width="5" height="5" fill="#fff"/>
                      <rect x="2" y="20" width="3" height="3"/>
                      <rect x="9" y="2" width="2" height="2"/>
                      <rect x="13" y="4" width="2" height="2"/>
                      <rect x="9" y="9" width="7" height="7"/>
                      <rect x="10" y="10" width="5" height="5" fill="#fff"/>
                      <rect x="11" y="11" width="3" height="3"/>
                      <rect x="18" y="10" width="3" height="2"/>
                      <rect x="18" y="14" width="2" height="4"/>
                      <rect x="10" y="18" width="4" height="2"/>
                      <rect x="12" y="22" width="4" height="2"/>
                      <rect x="20" y="20" width="4" height="4"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '2px' }}>Scan to Connect</div>
                </div>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div className="card-face card-back">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>CONNECT MARATHA</span>
                <span style={{ fontSize: '0.75rem', color: '#ffe082' }}>हेल्पलाईन: १८००-२३३-१९२४</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', margin: '10px 0' }}>
                <div>
                  <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>रक्तगट (Blood Group):</span>
                  <div style={{ fontWeight: 700, color: '#ff8a80' }}>O +ve (रक्तदाता)</div>
                </div>
                <div>
                  <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>संबद्ध चॅप्टर (Chapter):</span>
                  <div style={{ fontWeight: 700 }}>पुणे – शिवनेरी चॅप्टर</div>
                </div>
                <div>
                  <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>वैधता (Valid Thru):</span>
                  <div style={{ fontWeight: 700 }}>आजीवन (Lifetime)</div>
                </div>
                <div>
                  <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>आपत्कालीन संपर्क:</span>
                  <div style={{ fontWeight: 700 }}>+९१ ९८२२० ११९२४</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.68rem', opacity: 0.8, maxWidth: '280px', lineHeight: 1.3 }}>
                  हे ओळखपत्र केवळ अधिकृत CONNECT MARATHA सदस्यासाठी वैध आहे. गैरवापर कायद्याने दंडनीय आहे.
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: "'Brush Script MT', cursive, serif", fontSize: '1.1rem', color: 'var(--gold-400)' }}>Dr. J. Pawar</div>
                  <div style={{ fontSize: '0.62rem', opacity: 0.7 }}>अधिकृत स्वाक्षरी</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-sec)', marginTop: '8px' }}>
            💡 कार्ड उलटे फिरवण्यासाठी कार्डवर क्लिक करा (Click to Flip)
          </div>
        </div>

        {/* CARD ACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setIsFlipped(!isFlipped)} className="btn btn-outline" style={{ padding: '10px 20px' }}>
            🔄 कार्ड फिरवा (Flip)
          </button>
          <button type="button" onClick={handleDownload} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            📥 कार्ड डाऊनलोड करा (Download ID)
          </button>
          <button type="button" onClick={handleShare} className="btn btn-outline" style={{ padding: '10px 20px' }}>
            🔗 शेअर करा (Share Link)
          </button>
          <button type="button" onClick={() => setScannerOpen(true)} className="btn btn-primary" style={{ padding: '10px 20px', background: '#2E7D32' }}>
            📷 Scan & Connect
          </button>
        </div>

        {/* QR SYSTEM SUITE TABS */}
        <div className="card" style={{ padding: '32px', borderRadius: '16px', marginBottom: '40px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="tag" style={{ background: 'var(--saffron-600)', color: '#fff' }}>
              SPEC SECTION T • QR SYSTEM
            </span>
            <h2 style={{ fontSize: '1.8rem', margin: '8px 0', fontFamily: 'Baloo 2' }}>
              कनेक्ट मराठा एकात्मिक QR सुट (QR Suite)
            </h2>
            <p style={{ color: 'var(--text-sec)', fontSize: '0.92rem' }}>
              व्यासपीठावरील सर्व ५ प्रमुख प्रणालींसाठी डायनॅमिक QR कोड्स.
            </p>
          </div>

          <div className="tabs" style={{ marginBottom: '24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '10px', overflowX: 'auto' }}>
            <button
              className={`tab ${activeTab === 'member' ? 'active' : ''}`}
              onClick={() => setActiveTab('member')}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontWeight: activeTab === 'member' ? 700 : 600,
                color: activeTab === 'member' ? 'var(--saffron-600)' : 'var(--text)',
                borderBottom: activeTab === 'member' ? '3px solid var(--saffron-600)' : 'none',
                cursor: 'pointer'
              }}
            >
              🪪 सभासद QR (/qr/member)
            </button>
            <button
              className={`tab ${activeTab === 'business' ? 'active' : ''}`}
              onClick={() => setActiveTab('business')}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontWeight: activeTab === 'business' ? 700 : 600,
                color: activeTab === 'business' ? 'var(--saffron-600)' : 'var(--text)',
                borderBottom: activeTab === 'business' ? '3px solid var(--saffron-600)' : 'none',
                cursor: 'pointer'
              }}
            >
              🏢 व्यवसाय QR (/qr/business)
            </button>
            <button
              className={`tab ${activeTab === 'event' ? 'active' : ''}`}
              onClick={() => setActiveTab('event')}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontWeight: activeTab === 'event' ? 700 : 600,
                color: activeTab === 'event' ? 'var(--saffron-600)' : 'var(--text)',
                borderBottom: activeTab === 'event' ? '3px solid var(--saffron-600)' : 'none',
                cursor: 'pointer'
              }}
            >
              🎟️ कार्यक्रम QR (/qr/event)
            </button>
            <button
              className={`tab ${activeTab === 'receipt' ? 'active' : ''}`}
              onClick={() => setActiveTab('receipt')}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontWeight: activeTab === 'receipt' ? 700 : 600,
                color: activeTab === 'receipt' ? 'var(--saffron-600)' : 'var(--text)',
                borderBottom: activeTab === 'receipt' ? '3px solid var(--saffron-600)' : 'none',
                cursor: 'pointer'
              }}
            >
              🧾 पावती QR (/qr/receipt)
            </button>
            <button
              className={`tab ${activeTab === 'verify' ? 'active' : ''}`}
              onClick={() => setActiveTab('verify')}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontWeight: activeTab === 'verify' ? 700 : 600,
                color: activeTab === 'verify' ? 'var(--saffron-600)' : 'var(--text)',
                borderBottom: activeTab === 'verify' ? '3px solid var(--saffron-600)' : 'none',
                cursor: 'pointer'
              }}
            >
              🛡️ QR पडताळणी (/verify/qr)
            </button>
          </div>

          <div id="qrContentPane" style={{ background: 'var(--paper-2)', padding: '24px', borderRadius: '12px' }}>
            {activeTab === 'member' && (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="qr-box" style={{ width: '120px', height: '120px', border: '2px solid var(--border)' }}>
                  <svg width="105" height="105" viewBox="0 0 25 25" fill="#111">
                    <rect x="0" y="0" width="7" height="7"/>
                    <rect x="1" y="1" width="5" height="5" fill="#fff"/>
                    <rect x="2" y="2" width="3" height="3"/>
                    <rect x="18" y="0" width="7" height="7"/>
                    <rect x="19" y="1" width="5" height="5" fill="#fff"/>
                    <rect x="20" y="2" width="3" height="3"/>
                    <rect x="0" y="18" width="7" height="7"/>
                    <rect x="1" y="19" width="5" height="5" fill="#fff"/>
                    <rect x="2" y="20" width="3" height="3"/>
                    <rect x="9" y="2" width="2" height="2"/>
                    <rect x="13" y="4" width="2" height="2"/>
                    <rect x="9" y="9" width="7" height="7"/>
                    <rect x="10" y="10" width="5" height="5" fill="#fff"/>
                    <rect x="11" y="11" width="3" height="3"/>
                    <rect x="18" y="10" width="3" height="2"/>
                    <rect x="18" y="14" width="2" height="4"/>
                    <rect x="10" y="18" width="4" height="2"/>
                    <rect x="12" y="22" width="4" height="2"/>
                    <rect x="20" y="20" width="4" height="4"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem' }}>{memberName} — सभासद प्रोफाइल QR</h3>
                  <p style={{ color: 'var(--text-sec)', fontSize: '0.88rem', margin: '6px 0 12px', maxWidth: '600px' }}>
                    हा QR कोड स्कॅन करून इतर सदस्य थेट आपल्या प्रोफाईलशी जोडू शकतात आणि व्यवसाय संदर्भ पाठवू शकतात.
                  </p>
                  <div style={{ fontFamily: 'monospace', background: 'var(--paper)', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                    https://connectmaratha.com/qr/member/{memberId}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="qr-box" style={{ width: '120px', height: '120px', border: '2px solid var(--border)' }}>
                  <svg width="105" height="105" viewBox="0 0 25 25" fill="#111">
                    <rect x="0" y="0" width="7" height="7"/>
                    <rect x="1" y="1" width="5" height="5" fill="#fff"/>
                    <rect x="2" y="2" width="3" height="3"/>
                    <rect x="18" y="0" width="7" height="7"/>
                    <rect x="19" y="1" width="5" height="5" fill="#fff"/>
                    <rect x="20" y="2" width="3" height="3"/>
                    <rect x="0" y="18" width="7" height="7"/>
                    <rect x="1" y="19" width="5" height="5" fill="#fff"/>
                    <rect x="2" y="20" width="3" height="3"/>
                    <rect x="10" y="2" width="4" height="3"/>
                    <rect x="14" y="6" width="3" height="2"/>
                    <rect x="8" y="10" width="8" height="6"/>
                    <rect x="18" y="14" width="4" height="4"/>
                    <rect x="10" y="19" width="6" height="4"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem' }}>शिवमुद्रा टेक्नॉलॉजीज — व्यवसाय QR (/qr/business/BIZ-408)</h3>
                  <p style={{ color: 'var(--text-sec)', fontSize: '0.88rem', margin: '6px 0 12px', maxWidth: '600px' }}>
                    ग्राहकांना व B2B भागीदारांना आपल्या व्यवसाय कॅटलॉग, उत्पादने व सेवांकडे थेट नेण्यासाठी.
                  </p>
                  <div style={{ fontFamily: 'monospace', background: 'var(--paper)', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                    https://connectmaratha.com/qr/business/BIZ-408
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'event' && (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="qr-box" style={{ width: '120px', height: '120px', border: '2px solid var(--border)' }}>
                  <svg width="105" height="105" viewBox="0 0 25 25" fill="#111">
                    <rect x="0" y="0" width="7" height="7"/>
                    <rect x="1" y="1" width="5" height="5" fill="#fff"/>
                    <rect x="2" y="2" width="3" height="3"/>
                    <rect x="18" y="0" width="7" height="7"/>
                    <rect x="19" y="1" width="5" height="5" fill="#fff"/>
                    <rect x="20" y="2" width="3" height="3"/>
                    <rect x="0" y="18" width="7" height="7"/>
                    <rect x="1" y="19" width="5" height="5" fill="#fff"/>
                    <rect x="2" y="20" width="3" height="3"/>
                    <rect x="8" y="4" width="6" height="4"/>
                    <rect x="14" y="12" width="8" height="3"/>
                    <rect x="10" y="16" width="4" height="6"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem' }}>पुणे बिझनेस संगम वार्षिक संमेलन — कार्यक्रम प्रवेश पास QR</h3>
                  <p style={{ color: 'var(--text-sec)', fontSize: '0.88rem', margin: '6px 0 12px', maxWidth: '600px' }}>
                    कार्यक्रमाच्या ठिकाणी थेट हजेरी नोंदणी व डिजिटल बॅज पडताळणीसाठी.
                  </p>
                  <div style={{ fontFamily: 'monospace', background: 'var(--paper)', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                    https://connectmaratha.com/qr/event/EVT-2026-PUNE-01
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'receipt' && (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="qr-box" style={{ width: '120px', height: '120px', border: '2px solid var(--border)' }}>
                  <svg width="105" height="105" viewBox="0 0 25 25" fill="#111">
                    <rect x="0" y="0" width="7" height="7"/>
                    <rect x="1" y="1" width="5" height="5" fill="#fff"/>
                    <rect x="2" y="2" width="3" height="3"/>
                    <rect x="18" y="0" width="7" height="7"/>
                    <rect x="19" y="1" width="5" height="5" fill="#fff"/>
                    <rect x="20" y="2" width="3" height="3"/>
                    <rect x="0" y="18" width="7" height="7"/>
                    <rect x="1" y="19" width="5" height="5" fill="#fff"/>
                    <rect x="2" y="20" width="3" height="3"/>
                    <rect x="10" y="8" width="4" height="8"/>
                    <rect x="16" y="8" width="4" height="4"/>
                    <rect x="12" y="18" width="8" height="4"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem' }}>दुर्ग संवर्धन देणगी अधिकृत पावती — ₹ ५,००० (80G करसवलत)</h3>
                  <p style={{ color: 'var(--text-sec)', fontSize: '0.88rem', margin: '6px 0 12px', maxWidth: '600px' }}>
                    आयकर कलम 80G अंतर्गत वैध देणगी पावती व डिजिटल सहीचा पडताळणी QR कोड.
                  </p>
                  <div style={{ fontFamily: 'monospace', background: 'var(--paper)', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                    https://connectmaratha.com/qr/receipt/RCPT-883921-FORT
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'verify' && (
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>🛡️ QR कोड पडताळणी केंद्र (/verify/qr/:code)</h3>
                <p style={{ color: 'var(--text-sec)', fontSize: '0.88rem', margin: '8px 0 16px', maxWidth: '640px' }}>
                  कोणत्याही कनेक्ट मराठा कार्ड, पावती किंवा प्रमाणपत्राचा १२-अंकी पडताळणी कोड टाका आणि सत्यता तपासा.
                </p>
                <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="उदा. CM-MH-2026-8842"
                    style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 700 }}>
                    पडताळा
                  </button>
                </form>
                {verifyResult && (
                  <div style={{ marginTop: '16px', padding: '14px 18px', borderRadius: '8px', background: 'rgba(46,125,50,0.12)', border: '1px solid #2E7D32', color: '#2E7D32', fontWeight: 600 }}>
                    ✓ अधिकृत व सत्य पडताळणी: <strong>{verifyResult.name}</strong> (पुणे चॅप्टर, कोड: {verifyResult.code}, सभासद वैध, DPDP २०२३ नोंदणीकृत)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SCAN & CONNECT CAMERA MODAL */}
      {scannerOpen && (
        <div className="scan-modal" onClick={() => setScannerOpen(false)}>
          <div
            className="card"
            style={{ maxWidth: '380px', width: '100%', padding: '28px', textAlign: 'center', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Baloo 2' }}>📷 Scan & Connect</h3>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text)' }}
              >
                ✕
              </button>
            </div>
            <p style={{ color: 'var(--text-sec)', fontSize: '0.82rem', margin: '8px 0 16px' }}>
              कोणत्याही सभासदाचे डिजिटल कार्ड किंवा QR कोड स्कॅन करा.
            </p>

            <div className="scanner-window">
              <div className="scanner-laser"></div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
                [ कॅमेरा सुरू आहे... ]
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateScan}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '12px', padding: '10px 16px', fontWeight: 700 }}
            >
              ⚡ चाचणी स्कॅन करा (Simulate Match)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
