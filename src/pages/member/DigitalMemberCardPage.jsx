import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DigitalMemberCardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Card Display Mode: 'certificate' (Royal Certificate Style) or 'pocket' (3D Flip Pocket ID)
  const [viewMode, setViewMode] = useState('certificate');
  const [isFlipped, setIsFlipped] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('member');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  // Defaults if guest/preview
  const defaultName = user?.name || user?.fullName || 'श्री. संभाजीराव जयसिंगराव मोहिते';
  const [candidateName, setCandidateName] = useState(defaultName);
  
  const memberRole = user?.profession || user?.persona || 'व्यावसायिक व समाजसेवक';
  const memberCity = user?.city ? `${user.city} • महाराष्ट्र` : 'पुणे • महाराष्ट्र';
  const memberChapter = user?.chapter || 'पुणे – शिवनेरी चॅप्टर';
  const memberId = user?.id || 'CM-MH-2026-8842';
  const memberTier = user?.tier || 'GOLD FOUNDER MEMBER';
  const bloodGroup = user?.bloodGroup || 'O +ve (नोंदणीकृत रक्तदाता)';
  const emergencyPhone = user?.phone || '+९१ ९८२२० ११९२४';
  const issueDate = '२३ सप्टेंबर २०२६';

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert('🔗 अधिकृत ओळखपत्र लिंक क्लिपबोर्डवर कॉपी केली!');
    } else {
      alert('🔗 लिंक: ' + url);
    }
  };

  const handleSimulateScan = () => {
    setScannerOpen(false);
    alert(`✓ QR कोड पडताळला! सदस्य: ${candidateName || defaultName} शी कनेक्शन विनंती पाठवली.`);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) {
      alert('कृपया पडताळणीसाठी कोड प्रविष्ट करा');
      return;
    }
    setVerifyResult({
      code: verifyCode.trim(),
      name: candidateName || defaultName,
      status: 'valid'
    });
    alert('✓ कोड वैध आढळला!');
  };

  return (
    <>
      <style>{`
        /* Print Styles: Isolates the Certificate ID card for clean print/PDF */
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-certificate-id, #printable-certificate-id * {
            visibility: visible !important;
          }
          #printable-certificate-id {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 30px !important;
            box-shadow: none !important;
            border-width: 8px !important;
          }
          .no-print {
            display: none !important;
          }
        }

        .card-perspective {
          perspective: 1200px;
          max-width: 480px;
          margin: 24px auto;
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

      {/* TOP NOTIFICATION STRIP */}
      <div className="topbar no-print">
        <div className="wrap topbar-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 24px', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: 'var(--gold-400)', fontWeight: 700 }}>🚩 CONNECT MARATHA</span>
            <span>अखिल भारतीय अधिकृत सभासद ओळखपत्र व डिजिटल QR प्रमाणीकरण</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>📞 २४x७ समाज हेल्पलाईन: <strong>१८००-१२३-१६७४</strong></span>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ maxWidth: '1100px', margin: '30px auto 50px', padding: '0 20px' }}>
        
        {/* Guest Preview Notice if not logged in */}
        {(!user || !user.id) && (
          <div className="no-print" style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '1px solid #F59E0B',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#92400E' }}>
              <span>💡</span>
              <span>
                <strong>नमुना ओळखपत्र दृश्य (Guest Preview):</strong> आपण अद्याप लॉगिन केलेले नाही. खालील नमुना ओळखपत्र तपासा किंवा आपल्या स्वतःच्या खात्यातील तपशीलासाठी लॉगिन करा.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" style={{ background: '#B91C1C', color: '#FFFFFF', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                लॉगिन करा
              </Link>
              <Link to="/register" style={{ background: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none' }}>
                नवीन नोंदणी
              </Link>
            </div>
          </div>
        )}

        {/* SECTION TITLE & VIEW TOGGLE */}
        <div className="no-print" style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 28px' }}>
          <span className="tag" style={{ background: 'var(--maroon-900)', color: 'var(--gold-400)', padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem' }}>
            अधिकृत ओळखपत्र • SPEC ROUTE /member/card & /card
          </span>
          <h1 style={{ fontSize: '2.4rem', margin: '12px 0 6px', fontFamily: 'Baloo 2', fontWeight: 800, color: 'var(--maroon-900)' }}>
            डिजिटल सभासद ओळखपत्र व प्रमाणीकरण
          </h1>
          <p style={{ color: 'var(--text-sec)', fontSize: '1rem', lineHeight: 1.5, margin: '0 0 20px' }}>
            इतिहास गौरव प्रमाणपत्राच्या राजेशाही शैलीतील अधिकृत ओळखपत्र, झटपट QR पडताळणी आणि स्मार्ट वॉलेट कार्ड.
          </p>

          {/* View Mode Toggle: Certificate Style vs Pocket 3D Card */}
          <div style={{
            display: 'inline-flex',
            background: '#F3F4F6',
            padding: '4px',
            borderRadius: '30px',
            border: '1px solid #E5E7EB',
            gap: '4px'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('certificate')}
              style={{
                padding: '8px 20px',
                borderRadius: '24px',
                border: 'none',
                background: viewMode === 'certificate' ? '#B91C1C' : 'transparent',
                color: viewMode === 'certificate' ? '#FFFFFF' : '#4B5563',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>📜</span>
              <span>प्रमाणपत्र शैली ओळखपत्र (Certificate Style)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('pocket')}
              style={{
                padding: '8px 20px',
                borderRadius: '24px',
                border: 'none',
                background: viewMode === 'pocket' ? '#B91C1C' : 'transparent',
                color: viewMode === 'pocket' ? '#FFFFFF' : '#4B5563',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>🪪</span>
              <span>पॉकेट ३D वॉलेट कार्ड (Pocket Card)</span>
            </button>
          </div>
        </div>

        {/* CONTROLS BAR: Name input & Print/Download buttons (Same as game certificate) */}
        <div className="no-print" style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '18px 24px',
          border: '1px solid #E5E7EB',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '0.9rem' }}>
              ओळखपत्रावरील नाव:
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="आपले संपूर्ण नाव प्रविष्ट करा"
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.95rem',
                width: '280px',
                fontWeight: 700,
                color: '#1F2937'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePrintCertificate}
              style={{
                padding: '9px 18px',
                background: '#1F2937',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🖨️</span> ओळखपत्र प्रिंट / PDF डाऊनलोड करा
            </button>

            <button
              type="button"
              onClick={handleShare}
              style={{
                padding: '9px 16px',
                background: '#F3F4F6',
                color: '#374151',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🔗</span> शेअर करा
            </button>

            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              style={{
                padding: '9px 16px',
                background: '#047857',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>📷</span> Scan & Connect
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 1. ROYAL CERTIFICATE-STYLE ID CARD (GAME CERTIFICATE STYLING) */}
        {/* ======================================================== */}
        {viewMode === 'certificate' && (
          <div style={{ marginBottom: '40px' }}>
            <div
              id="printable-certificate-id"
              className="certificate-card"
              style={{
                background: '#FFFDF9',
                border: '12px double #C73800',
                borderRadius: '16px',
                padding: '44px 36px',
                boxShadow: '0 12px 50px rgba(0,0,0,0.08)',
                position: 'relative',
                textAlign: 'center'
              }}
            >
              {/* Header Crest (Exact match to Game Certificate) */}
              <div style={{ marginBottom: '14px' }}>
                <img
                  src="/assets/images/logo.png"
                  alt="Connect Maratha Seal"
                  style={{ height: '70px', objectFit: 'contain', marginBottom: '8px' }}
                />
                <div style={{ fontFamily: 'Baloo 2', fontSize: '1.45rem', fontWeight: 800, color: 'var(--maroon-900)', letterSpacing: '1px' }}>
                  कनेक्ट मराठा — अखिल भारतीय अधिकृत सभासद ओळखपत्र
                </div>
                <div style={{ fontSize: '0.85rem', color: '#B45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  || स्वराज्य समाज संघटन व अधिकृत सभासदत्व गौरव पत्र ||
                </div>
              </div>

              {/* Saffron/Gold Gradient Divider (Exact match) */}
              <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #E65100, transparent)', margin: '14px 0 24px 0' }} />

              <p style={{ fontSize: '1.05rem', color: '#4B5563', margin: 0 }}>
                हे सन्मानपूर्वक अधिकृतरीत्या प्रमाणित करण्यात येते की,
              </p>

              {/* Member Name in large prominent Baloo 2 typography */}
              <h3 style={{
                fontFamily: 'Baloo 2',
                fontSize: '2.4rem',
                fontWeight: 800,
                color: '#C73800',
                margin: '12px 0',
                textDecoration: 'underline',
                textUnderlineOffset: '8px'
              }}>
                {candidateName || defaultName}
              </h3>

              <p style={{ fontSize: '1.02rem', lineHeight: 1.7, maxWidth: '72ch', margin: '0 auto 24px auto', color: '#1F2937' }}>
                यांना कनेक्ट मराठा व्यासपीठाचे अधिकृत सभासदत्व बहाल करण्यात आले असून, ते समाज संघटन, सहकार्य, व्यवसाय प्रगती 
                आणि छत्रपती शिवरायांच्या स्वराज्य मूल्यांशी बांधील असणारे 
                <strong style={{ color: 'var(--maroon-900)' }}> "{memberTier}" </strong> 
                श्रेणीचे प्रमाणित अधिकृत सभासद आहेत.
              </p>

              {/* Structured Identification Grid within the Certificate */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.75)',
                border: '1px solid #FDE68A',
                borderRadius: '12px',
                padding: '20px 24px',
                margin: '0 auto 28px',
                maxWidth: '820px',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '24px',
                alignItems: 'center',
                textAlign: 'left'
              }}>
                {/* Member Avatar / Photo with Gold Frame */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '12px',
                    border: '3px double #C73800',
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.8rem',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
                  }}>
                    {user?.avatar || '👤'}
                  </div>
                  <div style={{
                    marginTop: '6px',
                    background: '#C73800',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    प्रमाणित सदस्य
                  </div>
                </div>

                {/* Member Key Attributes */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px 16px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.74rem' }}>सभासद आयडी (Member ID):</span>
                    <div style={{ fontWeight: 800, color: '#C73800', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {memberId}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.74rem' }}>पद / व्यवसाय (Profession):</span>
                    <div style={{ fontWeight: 700, color: '#1F2937' }}>
                      {memberRole}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.74rem' }}>संबद्ध चॅप्टर (Chapter):</span>
                    <div style={{ fontWeight: 700, color: '#1F2937' }}>
                      {memberChapter}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.74rem' }}>रक्तगट (Blood Group):</span>
                    <div style={{ fontWeight: 700, color: '#DC2626' }}>
                      {bloodGroup}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.74rem' }}>वैधता (Validity):</span>
                    <div style={{ fontWeight: 700, color: '#059669' }}>
                      आजीवन (Lifetime Member)
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.74rem' }}>आपत्कालीन संपर्क:</span>
                    <div style={{ fontWeight: 700, color: '#1F2937' }}>
                      {emergencyPhone}
                    </div>
                  </div>
                </div>

                {/* Digital Verification QR Box */}
                <div style={{ textAlign: 'center' }}>
                  <div className="qr-box" style={{ width: '84px', height: '84px', border: '1px solid #D1D5DB', margin: '0 auto' }}>
                    <svg width="74" height="74" viewBox="0 0 25 25" fill="#111">
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
                  <div style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '4px', fontWeight: 600 }}>
                    Scan to Verify
                  </div>
                </div>
              </div>

              {/* Certificate Bottom Verification Data (Exact match to Game Certificate) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '36px',
                borderTop: '1px solid #FDE68A',
                paddingTop: '20px'
              }}>
                <div style={{ textAlign: 'left', fontSize: '0.82rem', color: '#6B7280' }}>
                  <div><strong>दिनांक:</strong> {issueDate}</div>
                  <div><strong>नोंदणी क्रमांक:</strong> {memberId}</div>
                  <div><strong>सत्यापित:</strong> connectmaratha.com/verify</div>
                  <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '2px', fontWeight: 700 }}>
                    ✓ DPDP कायदा २०२३ डिजिटल गोपनीयता प्रमाणित
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    border: '3px dashed #C73800',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#C73800',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    margin: '0 auto 4px auto'
                  }}>
                    <span>🚩</span>
                    <span>शिवमुद्रा</span>
                    <span>सील</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>अधिकृत मुद्रा</span>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#6B7280' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem', fontWeight: 700, color: '#1F2937' }}>
                    Dr. J. Pawar
                  </div>
                  <div><strong>मुख्य सचिव, कनेक्ट मराठा परिषद</strong></div>
                  <div>महाराष्ट्र राज्य, भारत</div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. POCKET 3D WALLET CARD (ALTERNATIVE FLIPPABLE VIEW) */}
        {/* ======================================================== */}
        {viewMode === 'pocket' && (
          <div style={{ marginBottom: '40px' }}>
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
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.2 }}>{candidateName || defaultName}</div>
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
                      <div style={{ fontWeight: 700, color: '#ff8a80' }}>{bloodGroup}</div>
                    </div>
                    <div>
                      <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>संबद्ध चॅप्टर (Chapter):</span>
                      <div style={{ fontWeight: 700 }}>{memberChapter}</div>
                    </div>
                    <div>
                      <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>वैधता (Valid Thru):</span>
                      <div style={{ fontWeight: 700 }}>आजीवन (Lifetime)</div>
                    </div>
                    <div>
                      <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>आपत्कालीन संपर्क:</span>
                      <div style={{ fontWeight: 700 }}>{emergencyPhone}</div>
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

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{
                  padding: '8px 20px',
                  background: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                🔄 कार्ड फिरवा (Flip Card)
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* QR SYSTEM SUITE TABS (MEMBER, BUSINESS, EVENT, RECEIPT) */}
        {/* ======================================================== */}
        <div className="card no-print" style={{ padding: '32px', borderRadius: '16px', marginBottom: '40px', background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ marginBottom: '24px' }}>
            <span className="tag" style={{ background: 'var(--saffron-600)', color: '#fff', padding: '4px 12px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 700 }}>
              SPEC SECTION T • QR SYSTEM
            </span>
            <h2 style={{ fontSize: '1.75rem', margin: '8px 0', fontFamily: 'Baloo 2', fontWeight: 800, color: 'var(--maroon-900)' }}>
              कनेक्ट मराठा एकात्मिक QR सुट (Dynamic QR Suite)
            </h2>
            <p style={{ color: 'var(--text-sec)', fontSize: '0.92rem', margin: 0 }}>
              व्यासपीठावरील सर्व ५ प्रमुख प्रणालींसाठी डायनॅमिक QR कोड्स.
            </p>
          </div>

          <div className="tabs" style={{ marginBottom: '24px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '10px', overflowX: 'auto' }}>
            <button
              className={`tab ${activeTab === 'member' ? 'active' : ''}`}
              onClick={() => setActiveTab('member')}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontWeight: activeTab === 'member' ? 800 : 600,
                color: activeTab === 'member' ? '#C73800' : 'var(--text)',
                borderBottom: activeTab === 'member' ? '3px solid #C73800' : 'none',
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
                fontWeight: activeTab === 'business' ? 800 : 600,
                color: activeTab === 'business' ? '#C73800' : 'var(--text)',
                borderBottom: activeTab === 'business' ? '3px solid #C73800' : 'none',
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
                fontWeight: activeTab === 'event' ? 800 : 600,
                color: activeTab === 'event' ? '#C73800' : 'var(--text)',
                borderBottom: activeTab === 'event' ? '3px solid #C73800' : 'none',
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
                fontWeight: activeTab === 'receipt' ? 800 : 600,
                color: activeTab === 'receipt' ? '#C73800' : 'var(--text)',
                borderBottom: activeTab === 'receipt' ? '3px solid #C73800' : 'none',
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
                fontWeight: activeTab === 'verify' ? 800 : 600,
                color: activeTab === 'verify' ? '#C73800' : 'var(--text)',
                borderBottom: activeTab === 'verify' ? '3px solid #C73800' : 'none',
                cursor: 'pointer'
              }}
            >
              🛡️ QR पडताळणी (/verify/qr)
            </button>
          </div>

          <div id="qrContentPane" style={{ background: '#F8FAFC', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            {activeTab === 'member' && (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="qr-box" style={{ width: '120px', height: '120px', border: '2px solid #CBD5E1' }}>
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
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#1F2937' }}>
                    {candidateName || defaultName} — सभासद प्रोफाइल QR
                  </h3>
                  <p style={{ color: '#4B5563', fontSize: '0.88rem', margin: '6px 0 12px', maxWidth: '600px', lineHeight: 1.5 }}>
                    हा QR कोड स्कॅन करून इतर सदस्य थेट आपल्या प्रोफाईलशी जोडू शकतात आणि व्यवसाय संदर्भ पाठवू शकतात.
                  </p>
                  <div style={{ fontFamily: 'monospace', background: '#FFFFFF', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #CBD5E1', display: 'inline-block' }}>
                    https://connectmaratha.com/qr/member/{memberId}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="qr-box" style={{ width: '120px', height: '120px', border: '2px solid #CBD5E1' }}>
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
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#1F2937' }}>
                    शिवमुद्रा टेक्नॉलॉजीज — व्यवसाय QR (/qr/business/BIZ-408)
                  </h3>
                  <p style={{ color: '#4B5563', fontSize: '0.88rem', margin: '6px 0 12px', maxWidth: '600px', lineHeight: 1.5 }}>
                    ग्राहकांना व B2B भागीदारांना आपल्या व्यवसाय कॅटलॉग, उत्पादने व सेवांकडे थेट नेण्यासाठी.
                  </p>
                  <div style={{ fontFamily: 'monospace', background: '#FFFFFF', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #CBD5E1', display: 'inline-block' }}>
                    https://connectmaratha.com/qr/business/BIZ-408
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'event' && (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="qr-box" style={{ width: '120px', height: '120px', border: '2px solid #CBD5E1' }}>
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
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#1F2937' }}>
                    पुणे बिझनेस संगम वार्षिक संमेलन — कार्यक्रम पास QR
                  </h3>
                  <p style={{ color: '#4B5563', fontSize: '0.88rem', margin: '6px 0 12px', maxWidth: '600px', lineHeight: 1.5 }}>
                    कार्यक्रमाच्या ठिकाणी थेट हजेरी नोंदणी व डिजिटल बॅज पडताळणीसाठी.
                  </p>
                  <div style={{ fontFamily: 'monospace', background: '#FFFFFF', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #CBD5E1', display: 'inline-block' }}>
                    https://connectmaratha.com/qr/event/EVT-2026-PUNE-01
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'receipt' && (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="qr-box" style={{ width: '120px', height: '120px', border: '2px solid #CBD5E1' }}>
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
                  <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#1F2937' }}>
                    दुर्ग संवर्धन देणगी अधिकृत पावती — ₹ ५,००० (80G करसवलत)
                  </h3>
                  <p style={{ color: '#4B5563', fontSize: '0.88rem', margin: '6px 0 12px', maxWidth: '600px', lineHeight: 1.5 }}>
                    आयकर कलम 80G अंतर्गत वैध देणगी पावती व डिजिटल सहीचा पडताळणी QR कोड.
                  </p>
                  <div style={{ fontFamily: 'monospace', background: '#FFFFFF', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #CBD5E1', display: 'inline-block' }}>
                    https://connectmaratha.com/qr/receipt/RCPT-883921-FORT
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'verify' && (
              <div>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', color: '#1F2937' }}>
                  🛡️ QR कोड पडताळणी केंद्र (/verify/qr/:code)
                </h3>
                <p style={{ color: '#4B5563', fontSize: '0.88rem', margin: '8px 0 16px', maxWidth: '640px', lineHeight: 1.5 }}>
                  कोणत्याही कनेक्ट मराठा कार्ड, पावती किंवा प्रमाणपत्राचा १२-अंकी पडताळणी कोड टाका आणि सत्यता तपासा.
                </p>
                <form onSubmit={handleVerify} style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    placeholder="उदा. CM-MH-2026-8842"
                    style={{ flex: 1, padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                  />
                  <button type="submit" style={{ background: '#B91C1C', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 700, cursor: 'pointer' }}>
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
            style={{ maxWidth: '380px', width: '100%', padding: '28px', textAlign: 'center', position: 'relative', background: '#FFFFFF', borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Baloo 2', fontWeight: 800 }}>📷 Scan & Connect</h3>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#6B7280' }}
              >
                ✕
              </button>
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.82rem', margin: '8px 0 16px' }}>
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
              style={{ width: '100%', marginTop: '12px', padding: '10px 16px', fontWeight: 700, background: '#047857', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              ⚡ चाचणी स्कॅन करा (Simulate Match)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
