import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DigitalMemberCardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Card Display Mode: 'certificate' (Royal Certificate Style) or 'smartcard' (Executive Metallic Smart Card)
  const [viewMode, setViewMode] = useState('certificate');
  const [isFlipped, setIsFlipped] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('member');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  // Authenticated or default user data
  const memberName = user?.name || user?.fullName || 'अमोल तुकाराम जाधव';
  const [candidateName, setCandidateName] = useState(memberName);
  
  const memberRole = user?.profession || 'सॉफ्टवेअर आर्किटेक्ट व तंत्रज्ञान सल्लागार';
  const memberCity = user?.city ? `${user.city} • महाराष्ट्र` : 'पुणे • महाराष्ट्र';
  const memberChapter = user?.chapter || 'पुणे – शिवनेरी चॅप्टर';
  const memberId = user?.id || 'CM-MH-9876543210';
  const memberTier = user?.tier || 'GOLD FOUNDER MEMBER';
  const bloodGroup = user?.bloodGroup || 'O +ve (नोंदणीकृत रक्तदाता)';
  const emergencyPhone = user?.phone || '+९१ ९८२२० ११९२४';
  const issueDate = '२३ सप्टेंबर २०२६';

  // Professional real photograph instead of cartoon emoji
  const [selectedPhoto, setSelectedPhoto] = useState('/assets/images/officers/officer_tukaram.jpg');

  const handlePrintCertificate = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert('🔗 अधिकृत डिजिटल ओळखपत्र लिंक क्लिपबोर्डवर कॉपी केली!');
    } else {
      alert('🔗 लिंक: ' + url);
    }
  };

  const handleSimulateScan = () => {
    setScannerOpen(false);
    alert(`✓ QR कोड यशस्वीरित्या पडताळला!\nसदस्य: ${candidateName}\nआयडी: ${memberId}\nस्थिती: अधिकृत व सक्रिय सभासद`);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (!verifyCode.trim()) {
      alert('कृपया पडताळणीसाठी कोड प्रविष्ट करा');
      return;
    }
    setVerifyResult({
      code: verifyCode.trim(),
      name: candidateName,
      status: 'valid'
    });
    alert('✓ अधिकृत कोड वैध आढळला!');
  };

  return (
    <>
      <style>{`
        /* Print Styles: Isolates the Certificate ID card for high-resolution print/PDF */
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
            padding: 36px !important;
            box-shadow: none !important;
            border-width: 10px !important;
            background: #FFFDF9 !important;
          }
          .no-print {
            display: none !important;
          }
        }

        /* 3D Smart Card Flip Perspective */
        .card-perspective {
          perspective: 1400px;
          max-width: 520px;
          margin: 28px auto;
        }
        .executive-smart-card {
          width: 100%;
          height: 320px;
          border-radius: 18px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          box-shadow: 0 25px 60px rgba(0,0,0,0.35);
        }
        .executive-smart-card.flipped {
          transform: rotateY(180deg);
        }
        .smart-card-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 18px;
          backface-visibility: hidden;
          overflow: hidden;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #fff;
          box-sizing: border-box;
          border: 1px solid rgba(212, 175, 55, 0.4);
        }
        .smart-card-front {
          background: linear-gradient(135deg, #1C0F0F 0%, #2D1414 45%, #180909 100%);
          position: relative;
        }
        .smart-card-front::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(212, 175, 55, 0.12) 1px, transparent 1px);
          background-size: 16px 16px;
          pointer-events: none;
        }
        .smart-card-back {
          background: linear-gradient(135deg, #150A0A 0%, #220E0E 70%, #150A0A 100%);
          transform: rotateY(180deg);
        }
        .emv-chip {
          width: 44px;
          height: 34px;
          background: linear-gradient(135deg, #ECC86A 0%, #FFF3B3 50%, #C69830 100%);
          border-radius: 6px;
          border: 1px solid #7C5C00;
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
          position: relative;
        }
        .emv-chip::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(124, 92, 0, 0.6);
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
          border: 3px solid #D97706;
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
          background: #10B981;
          box-shadow: 0 0 12px #10B981;
          animation: scanLaser 2s infinite ease-in-out;
        }
        @keyframes scanLaser {
          0% { top: 0; }
          50% { top: 96%; }
          100% { top: 0; }
        }
      `}</style>

      {/* TOP NOTIFICATION STRIP */}
      <div className="topbar no-print" style={{ background: '#7C1D05', borderBottom: '1px solid #B45309' }}>
        <div className="wrap topbar-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 24px', fontSize: '0.82rem', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#FCD34D', fontWeight: 800 }}>🚩 CONNECT MARATHA</span>
            <span>•</span>
            <span>अखिल भारतीय अधिकृत सभासद ओळखपत्र व डिजिटल QR प्रमाणीकरण व्यासपीठ</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>२४x७ समाज हेल्पलाईन: <strong>१८००-१२३-१६७४</strong></span>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ maxWidth: '1120px', margin: '30px auto 60px', padding: '0 20px' }}>
        
        {/* HEADER SECTION */}
        <div className="no-print" style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
            color: '#991B1B',
            border: '1px solid #FECACA',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            fontWeight: 800,
            marginBottom: '10px'
          }}>
            <span>🏛️ अधिकृत राजेशाही ओळखपत्र</span>
            <span>•</span>
            <span>छत्रपती शिवराय स्वराज्य विचार मूल्य अधिष्ठान</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', margin: '8px 0 6px', fontFamily: 'Baloo 2', fontWeight: 800, color: '#7C1D05', lineHeight: 1.2 }}>
            अधिकृत डिजिटल सभासद ओळखपत्र (Official Member Credential)
          </h1>
          <p style={{ color: '#4B5563', fontSize: '1rem', lineHeight: 1.5, margin: '0 0 20px' }}>
            इतिहास गौरव प्रमाणपत्राच्या राजेशाही शैलीतील अधिकृत ओळखपत्र, उच्च सुरक्षा QR तंत्रज्ञान आणि कायदेशीर DPDP २०२३ प्रमाणीकरण.
          </p>

          {/* Dual Mode Switcher */}
          <div style={{
            display: 'inline-flex',
            background: '#F3F4F6',
            padding: '5px',
            borderRadius: '30px',
            border: '1px solid #E5E7EB',
            gap: '6px'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('certificate')}
              style={{
                padding: '9px 22px',
                borderRadius: '24px',
                border: 'none',
                background: viewMode === 'certificate' ? '#991B1B' : 'transparent',
                color: viewMode === 'certificate' ? '#FFFFFF' : '#4B5563',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: viewMode === 'certificate' ? '0 2px 8px rgba(153,27,27,0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>📜</span>
              <span>प्रमाणपत्र शैली ओळखपत्र (Royal Certificate ID)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('smartcard')}
              style={{
                padding: '9px 22px',
                borderRadius: '24px',
                border: 'none',
                background: viewMode === 'smartcard' ? '#991B1B' : 'transparent',
                color: viewMode === 'smartcard' ? '#FFFFFF' : '#4B5563',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: viewMode === 'smartcard' ? '0 2px 8px rgba(153,27,27,0.3)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>🪪</span>
              <span>एक्झिक्युटिव्ह स्मार्ट कार्ड (Smart Pocket ID)</span>
            </button>
          </div>
        </div>

        {/* CONTROLS BAR: Name input, Photo switch, Print and Download buttons */}
        <div className="no-print" style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid #E5E7EB',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          {/* Name Customization Field */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 800, color: '#1F2937', fontSize: '0.9rem' }}>
              ओळखपत्रावरील नाव:
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="आपले संपूर्ण नाव प्रविष्ट करा"
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.95rem',
                width: '280px',
                fontWeight: 700,
                color: '#1F2937',
                outline: 'none'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePrintCertificate}
              style={{
                padding: '10px 18px',
                background: '#1F2937',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              <span>🖨️</span> ओळखपत्र प्रिंट / PDF डाऊनलोड
            </button>

            <button
              type="button"
              onClick={handleShare}
              style={{
                padding: '10px 16px',
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
                padding: '10px 16px',
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
        {/* 1. ROYAL CERTIFICATE-STYLE OFFICIAL ID CARD (PRIMARY VIEW) */}
        {/* ======================================================== */}
        {viewMode === 'certificate' && (
          <div style={{ marginBottom: '40px' }}>
            <div
              id="printable-certificate-id"
              style={{
                background: '#FFFDF9',
                border: '12px double #C73800',
                borderRadius: '16px',
                padding: '48px 40px',
                boxShadow: '0 16px 60px rgba(124, 29, 5, 0.1)',
                position: 'relative',
                textAlign: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Subtle Guilloche Security Background Pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.03,
                backgroundImage: 'radial-gradient(#C73800 1.5px, transparent 1.5px)',
                backgroundSize: '20px 20px',
                pointerEvents: 'none'
              }} />

              {/* Header Crest: Exactly like Game Certificate */}
              <div style={{ marginBottom: '14px', position: 'relative', zIndex: 1 }}>
                <img
                  src="/assets/images/logo.png"
                  alt="Connect Maratha Seal"
                  style={{ height: '76px', objectFit: 'contain', marginBottom: '8px' }}
                />
                <div style={{ fontFamily: 'Baloo 2', fontSize: '1.45rem', fontWeight: 800, color: '#7C1D05', letterSpacing: '1px' }}>
                  अखिल भारतीय मराठा महासंघ • कनेक्ट मराठा परिषद
                </div>
                <div style={{ fontSize: '0.85rem', color: '#B45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  || स्वराज्य समाज संघटन व अधिकृत सभासदत्व गौरव पत्र ||
                </div>
                <div style={{ fontSize: '0.78rem', color: '#6B7280', fontFamily: 'serif', fontStyle: 'italic', marginTop: '4px' }}>
                  "प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते"
                </div>
              </div>

              {/* Saffron/Gold Gradient Divider */}
              <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #E65100, transparent)', margin: '14px 0 24px 0' }} />

              <p style={{ fontSize: '1.05rem', color: '#4B5563', margin: 0, position: 'relative', zIndex: 1 }}>
                हे सन्मानपूर्वक अधिकृतरीत्या प्रमाणित करण्यात येते की,
              </p>

              {/* Member Name in large royal Baloo 2 typography */}
              <h3 style={{
                fontFamily: 'Baloo 2',
                fontSize: '2.5rem',
                fontWeight: 800,
                color: '#C73800',
                margin: '10px 0',
                textDecoration: 'underline',
                textUnderlineOffset: '8px',
                position: 'relative',
                zIndex: 1
              }}>
                {candidateName}
              </h3>

              <p style={{ fontSize: '1.02rem', lineHeight: 1.7, maxWidth: '74ch', margin: '0 auto 24px auto', color: '#1F2937', position: 'relative', zIndex: 1 }}>
                यांना कनेक्ट मराठा व्यासपीठाचे अधिकृत सभासदत्व बहाल करण्यात आले असून, ते समाज संघटन, व्यवसाय सहकार्य, 
                युवा सक्षमीकरण आणि छत्रपती शिवरायांच्या स्वराज्य मूल्यांशी बांधील असणारे 
                <strong style={{ color: '#7C1D05' }}> "{memberTier}" </strong> 
                श्रेणीचे प्रमाणित अधिकृत सभासद आहेत.
              </p>

              {/* Structured Identification Grid within the Certificate */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1.5px solid #FDE68A',
                borderRadius: '14px',
                padding: '24px 28px',
                margin: '0 auto 30px',
                maxWidth: '840px',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '28px',
                alignItems: 'center',
                textAlign: 'left',
                boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                position: 'relative',
                zIndex: 1
              }}>
                {/* Member Passport Photograph (Real photo, not an emoji) */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '100px',
                    height: '115px',
                    borderRadius: '8px',
                    border: '3px double #C73800',
                    overflow: 'hidden',
                    background: '#F3F4F6',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    position: 'relative'
                  }}>
                    <img
                      src={selectedPhoto}
                      alt={candidateName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <div style={{
                    marginTop: '6px',
                    background: '#C73800',
                    color: '#FFFFFF',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    प्रमाणित छायाचित्र
                  </div>
                </div>

                {/* Member Key Attributes Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px 20px', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>सभासद नोंदणी आयडी:</span>
                    <div style={{ fontWeight: 800, color: '#C73800', fontFamily: 'monospace', fontSize: '1.05rem' }}>
                      {memberId}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>पद / व्यवसाय:</span>
                    <div style={{ fontWeight: 700, color: '#1F2937' }}>
                      {memberRole}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>संबद्ध चॅप्टर (Chapter):</span>
                    <div style={{ fontWeight: 700, color: '#1F2937' }}>
                      {memberChapter}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>रक्तगट (Blood Group):</span>
                    <div style={{ fontWeight: 700, color: '#DC2626' }}>
                      {bloodGroup}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>सदस्यता वैधता (Validity):</span>
                    <div style={{ fontWeight: 700, color: '#059669' }}>
                      आजीवन (Lifetime Valid)
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#6B7280', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>आपत्कालीन संपर्क:</span>
                    <div style={{ fontWeight: 700, color: '#1F2937' }}>
                      {emergencyPhone}
                    </div>
                  </div>
                </div>

                {/* Digital Verification QR Box */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: '#FFFFFF',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    width: '90px',
                    height: '90px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <svg width="78" height="78" viewBox="0 0 25 25" fill="#111">
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
                  <div style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '4px', fontWeight: 700 }}>
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
                paddingTop: '20px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{ textAlign: 'left', fontSize: '0.82rem', color: '#6B7280' }}>
                  <div><strong>दिनांक:</strong> {issueDate}</div>
                  <div><strong>नोंदणी क्रमांक:</strong> {memberId}</div>
                  <div><strong>सत्यापित:</strong> connectmaratha.com/verify</div>
                  <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '3px', fontWeight: 700 }}>
                    ✓ DPDP कायदा २०२३ डिजिटल गोपनीयता व ISO २७००१ प्रमाणित
                  </div>
                </div>

                {/* Royal Red Shivmudra Seal */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '84px',
                    height: '84px',
                    border: '3px dashed #C73800',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#C73800',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    margin: '0 auto 4px auto',
                    background: 'rgba(199, 56, 0, 0.04)'
                  }}>
                    <span style={{ fontSize: '1rem' }}>🚩</span>
                    <span>शिवमुद्रा</span>
                    <span>सील</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700 }}>अधिकृत मुद्रा</span>
                </div>

                {/* Official Signatures */}
                <div style={{ textAlign: 'right', fontSize: '0.82rem', color: '#6B7280' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', fontWeight: 700, color: '#1F2937' }}>
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
        {/* 2. EXECUTIVE METALLIC SMART CARD (OBSIDIAN & GOLD LUXURY) */}
        {/* ======================================================== */}
        {viewMode === 'smartcard' && (
          <div style={{ marginBottom: '40px' }}>
            <div className="card-perspective">
              <div
                id="digitalCard"
                className={`executive-smart-card ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                {/* FRONT OF SMART CARD */}
                <div className="smart-card-face smart-card-front">
                  {/* Top Bar: Seal & Micro-engraved title */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src="/assets/images/logo.png"
                        alt="Logo"
                        style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid #F59E0B' }}
                      />
                      <div>
                        <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.5px', color: '#F8FAFC' }}>
                          CONNECT MARATHA
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#CBD5E1', letterSpacing: '0.5px' }}>
                          अखिल भारतीय अधिकृत सभासद ओळखपत्र
                        </div>
                      </div>
                    </div>
                    <span style={{
                      background: 'rgba(217, 119, 6, 0.25)',
                      border: '1px solid #F59E0B',
                      color: '#FDE68A',
                      fontSize: '0.72rem',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: 800,
                      letterSpacing: '0.5px'
                    }}>
                      ⭐ {memberTier.split(' ')[0]}
                    </span>
                  </div>

                  {/* Middle Section: EMV Chip + Real Photo + Member Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', margin: '14px 0', position: 'relative', zIndex: 1 }}>
                    {/* Real Photo in Gold Filigree Border */}
                    <div style={{
                      width: '74px',
                      height: '86px',
                      borderRadius: '8px',
                      border: '2px solid #F59E0B',
                      overflow: 'hidden',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}>
                      <img
                        src={selectedPhoto}
                        alt={candidateName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <div className="emv-chip" title="EMV Smart Security Chip" />
                        <span style={{ fontSize: '0.65rem', color: '#94A3B8', letterSpacing: '1px' }}>SECURE ID CHIP</span>
                      </div>

                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                        {candidateName}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#FCD34D', fontWeight: 600, marginTop: '2px' }}>
                        {memberRole}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                        📍 {memberCity}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Bar: Member ID & Crisp Laser QR */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        MEMBER ID
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '1px', color: '#FDE68A', fontFamily: 'monospace' }}>
                        {memberId}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#34D399', marginTop: '2px', fontWeight: 600 }}>
                        ✓ DPDP २०२३ व ISO २७००१ प्रमाणित
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        background: '#FFFFFF',
                        padding: '4px',
                        borderRadius: '6px',
                        display: 'inline-block'
                      }}>
                        <svg width="60" height="60" viewBox="0 0 25 25" fill="#111">
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
                      <div style={{ fontSize: '0.62rem', color: '#94A3B8', marginTop: '2px' }}>Scan to Connect</div>
                    </div>
                  </div>
                </div>

                {/* BACK OF SMART CARD */}
                <div className="smart-card-face smart-card-back">
                  {/* Magnetic Stripe */}
                  <div style={{
                    width: 'calc(100% + 48px)',
                    height: '40px',
                    background: '#0B0B0E',
                    margin: '-24px -24px 16px -24px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                  }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FCD34D' }}>CONNECT MARATHA COUNCIL</span>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>हेल्पलाईन: १८००-२३३-१९२४</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', margin: '10px 0' }}>
                    <div>
                      <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>रक्तगट (Blood Group):</span>
                      <div style={{ fontWeight: 800, color: '#F87171' }}>{bloodGroup}</div>
                    </div>
                    <div>
                      <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>संबद्ध चॅप्टर (Chapter):</span>
                      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{memberChapter}</div>
                    </div>
                    <div>
                      <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>वैधता (Valid Thru):</span>
                      <div style={{ fontWeight: 700, color: '#34D399' }}>आजीवन (Lifetime)</div>
                    </div>
                    <div>
                      <span style={{ color: '#94A3B8', fontSize: '0.7rem' }}>आपत्कालीन संपर्क:</span>
                      <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{emergencyPhone}</div>
                    </div>
                  </div>

                  {/* Signature strip & Disclaimer */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8', maxWidth: '300px', lineHeight: 1.4 }}>
                      हे ओळखपत्र केवळ अधिकृत CONNECT MARATHA सदस्यासाठी वैध आहे. गैरवापर कायद्याने दंडनीय आहे.
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', color: '#FCD34D', fontWeight: 700 }}>
                        Dr. J. Pawar
                      </div>
                      <div style={{ fontSize: '0.6rem', color: '#94A3B8' }}>मुख्य सचिव अधिकृत स्वाक्षरी</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#6B7280', marginTop: '12px' }}>
                💡 कार्ड उलटे फिरवण्यासाठी कार्डवर क्लिक करा (Click to Flip Card)
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <button
                type="button"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{
                  padding: '9px 24px',
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '20px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  color: '#374151',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
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
            <span style={{ background: '#7C1D05', color: '#FCD34D', padding: '4px 12px', borderRadius: '14px', fontSize: '0.78rem', fontWeight: 800 }}>
              एकात्मिक QR प्रणाली (Integrated QR Suite)
            </span>
            <h2 style={{ fontSize: '1.75rem', margin: '8px 0', fontFamily: 'Baloo 2', fontWeight: 800, color: '#7C1D05' }}>
              कनेक्ट मराठा अधिकृत QR सुट
            </h2>
            <p style={{ color: '#4B5563', fontSize: '0.92rem', margin: 0 }}>
              व्यासपीठावरील सर्व ५ प्रमुख प्रणालींसाठी डायनॅमिक व सुरक्षित QR कोड्स.
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
                color: activeTab === 'member' ? '#C73800' : '#4B5563',
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
                color: activeTab === 'business' ? '#C73800' : '#4B5563',
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
                color: activeTab === 'event' ? '#C73800' : '#4B5563',
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
                color: activeTab === 'receipt' ? '#C73800' : '#4B5563',
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
                color: activeTab === 'verify' ? '#C73800' : '#4B5563',
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
                <div style={{
                  background: '#FFFFFF',
                  padding: '8px',
                  borderRadius: '10px',
                  border: '2px solid #CBD5E1',
                  width: '120px',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
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
                    {candidateName} — सभासद प्रोफाइल QR
                  </h3>
                  <p style={{ color: '#4B5563', fontSize: '0.88rem', margin: '6px 0 12px', maxWidth: '600px', lineHeight: 1.5 }}>
                    हा QR कोड स्कॅन करून इतर सदस्य थेट आपल्या अधिकृत प्रोफाईलशी जोडू शकतात आणि अधिकृत व्यावसायिक सहकार्य करू शकतात.
                  </p>
                  <div style={{ fontFamily: 'monospace', background: '#FFFFFF', padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid #CBD5E1', display: 'inline-block' }}>
                    https://connectmaratha.com/qr/member/{memberId}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  background: '#FFFFFF',
                  padding: '8px',
                  borderRadius: '10px',
                  border: '2px solid #CBD5E1',
                  width: '120px',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
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
                <div style={{
                  background: '#FFFFFF',
                  padding: '8px',
                  borderRadius: '10px',
                  border: '2px solid #CBD5E1',
                  width: '120px',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
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
                <div style={{
                  background: '#FFFFFF',
                  padding: '8px',
                  borderRadius: '10px',
                  border: '2px solid #CBD5E1',
                  width: '120px',
                  height: '120px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
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
                    placeholder="उदा. CM-MH-9876543210"
                    style={{ flex: 1, padding: '10px 14px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.9rem' }}
                  />
                  <button type="submit" style={{ background: '#7C1D05', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: 800, cursor: 'pointer' }}>
                    पडताळा
                  </button>
                </form>
                {verifyResult && (
                  <div style={{ marginTop: '16px', padding: '14px 18px', borderRadius: '8px', background: 'rgba(46,125,50,0.12)', border: '1px solid #2E7D32', color: '#2E7D32', fontWeight: 700 }}>
                    ✓ अधिकृत व सत्य पडताळणी: <strong>{verifyResult.name}</strong> (पुणे चॅप्टर, कोड: {verifyResult.code}, सभासद वैध, DPDP २०२३ व ISO २७००१ नोंदणीकृत)
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
            style={{ maxWidth: '380px', width: '100%', padding: '28px', textAlign: 'center', position: 'relative', background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Baloo 2', fontWeight: 800, color: '#1F2937' }}>
                📷 Scan & Connect
              </h3>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#6B7280' }}
              >
                ✕
              </button>
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.82rem', margin: '8px 0 16px' }}>
              कोणत्याही सभासदाचे डिजिटल कार्ड किंवा अधिकृत QR कोड स्कॅन करा.
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
              style={{ width: '100%', marginTop: '12px', padding: '10px 16px', fontWeight: 800, background: '#047857', color: '#FFFFFF', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              ⚡ चाचणी स्कॅन करा (Simulate Match)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
