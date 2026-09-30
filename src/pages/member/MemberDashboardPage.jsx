import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CMDB from '../../services/cmdb';
import { CONTRIBUTOR_ROLES } from '../../data/maharashtraCoreUniverse';
import {
  REFERRAL_BANDS,
  DEPARTMENT_WINGS,
  ADMINISTRATIVE_TIERS,
  MASTER_ROLES,
  evaluateCandidateEligibility
} from '../../data/rolesMatrixData';

export default function MemberDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
  const memberIdRaw = member.id || '9876543210';
  const memberId = memberIdRaw;
  const memberIdFormatted = String(memberIdRaw).startsWith('CM-') ? memberIdRaw : `CM-MH-${memberIdRaw}`;
  const memberName = member.name || member.fullName || 'अमोल तुकाराम जाधव';
  const memberRole = member.profession || 'सॉफ्टवेअर आर्किटेक्ट व तंत्रज्ञान सल्लागार';
  const memberCity = member.city ? `${member.city} • महाराष्ट्र` : (member.district ? `${member.district} • महाराष्ट्र` : 'पुणे • महाराष्ट्र');
  const memberChapter = member.chapter || (member.district ? `${member.district} चॅप्टर` : 'पुणे – शिवनेरी चॅप्टर');
  const memberTier = member.tier || 'Gold Founder';
  const bloodGroup = member.bloodGroup || 'O +ve (नोंदणीकृत रक्तदाता)';
  const emergencyPhone = member.phone || '+९१ ९८२२० ११९२४';
  // Professional photograph instead of cartoon emoji
  const memberPhoto = (member.photo && !member.photo.includes('avatar') && !member.photo.startsWith('data:image/svg'))
    ? member.photo
    : '/assets/images/officers/officer_tukaram.jpg';

  const [cardMode, setCardMode] = useState('smartcard');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [activeDashTab, setActiveDashTab] = useState('overview');
  const [selectedRoleApp, setSelectedRoleApp] = useState(null);
  const [appliedRoles, setAppliedRoles] = useState({ heritage_contributor: true, volunteer: true });
  const [savedPlaces, setSavedPlaces] = useState([
    { id: 'raigad', name: 'दुर्गराज रायगड', district: 'रायगड', type: 'राजधानी व गिरीदुर्ग', link: '/forts/raigad', notes: 'शिवराज्याभिषेक भूमी, जगदीश्वर मंदिर दर्शन' },
    { id: 'sinhagad', name: 'किल्ले सिंहगड', district: 'पुणे', type: 'रणभूमी', link: '/forts/sinhagad', notes: 'नरवीर तानाजी मालुसरे समाधी व कल्याण दरवाजा' },
    { id: 'sindhudurg', name: 'किल्ले सिंधुदुर्ग', district: 'सिंधुदुर्ग', type: 'जलदुर्ग', link: '/forts', notes: 'आरमार केंद्र व श्री शिवराजेश्वर मंदिर' }
  ]);
  const [savedPeople, setSavedPeople] = useState([
    { id: 'shivaji', name: 'छत्रपती शिवाजी महाराज', era: '१६३०-१६८०', role: 'हिंदवी स्वराज्य संस्थापक', link: '/history/shivaji-maharaj' },
    { id: 'sambhaji', name: 'छत्रपती संभाजी महाराज', era: '१६५७-१६८९', role: 'अपराजित धर्मवीर छत्रपती', link: '/history/sambhaji-maharaj' },
    { id: 'jijau', name: 'राष्ट्रमाता जिजाऊ माँसाहेब', era: '१५९८-१६७४', role: 'स्वराज्य संकल्पक व मार्गदर्शक', link: '/history/rajmata-jijau' },
    { id: 'tukaram', name: 'संत जगद्गुरु तुकाराम महाराज', era: '१६०८-१६५०', role: 'वारकरी संप्रदाय व अभंग संपदा', link: '/history' }
  ]);
  const [reminders, setReminders] = useState([
    { id: 'r1', title: 'शिवराज्याभिषेक सुवर्ण दिनोत्सव (६ जून)', date: '६ जून', active: true },
    { id: 'r2', title: 'शिवजयंती महामहोत्सव (१९ फेब्रुवारी)', date: '१९ फेब्रुवारी', active: true },
    { id: 'r3', title: 'धर्मवीर बलिदान मास स्मरण', date: 'फाल्गुन मास', active: true }
  ]);

  const scoreInfo = CMDB.calculateMemberContributionScore ? CMDB.calculateMemberContributionScore(memberId) : { totalScore: 95, badge: 'रौप्य शिलेदार' };
  const referrals = CMDB.listReferrals ? CMDB.listReferrals().filter(r => r.creator === memberId || r.giverId === memberId || r.recipient === memberId) : [];
  const meetings = CMDB.getOneToOneMeetings ? CMDB.getOneToOneMeetings().filter(m => m.requesterId === memberId || m.recipientId === memberId) : [];

  return (
    <div className="container py-5" style={{ padding: '36px 16px', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #7C1D05, #C2410C)', borderRadius: '20px', color: '#fff', padding: '30px 28px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: '0 8px 24px rgba(124, 29, 5, 0.15)' }}>
        <div>
          <div style={{ background: 'rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '10px' }}>
            <span>🚩</span>
            <span>{member.tier || 'Gold'} सदस्य</span>
            <span>•</span>
            <span>Connect Maratha डॅशबोर्ड (Feature 28)</span>
          </div>
          <h1 style={{ fontSize: '2rem', margin: '0 0 6px', fontWeight: 900 }}>सस्नेह जय शिवराय, {member.name}!</h1>
          <p style={{ margin: 0, opacity: 0.92, fontSize: '0.96rem' }}>
            सदस्य आयडी: <strong>{memberId}</strong> | 📍 {member.district || 'पुणे'} | 🏆 योगदान गुण: <strong>{scoreInfo.totalScore} ({scoreInfo.badge})</strong>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/card" className="btn" style={{ background: '#FFFFFF', color: '#7C1D05', border: 'none', fontWeight: 800, padding: '10px 18px', borderRadius: '10px', textDecoration: 'none' }}>
            🪪 संपूर्ण ओळखपत्र
          </Link>
          <Link to="/referrals/create" className="btn" style={{ background: 'rgba(255,255,255,0.18)', border: '1.5px solid #FFFFFF', color: '#FFFFFF', fontWeight: 700, padding: '10px 18px', borderRadius: '10px', textDecoration: 'none' }}>
            🤝 व्यवसाय संदर्भ द्या
          </Link>
          <Link to="/calendar" className="btn" style={{ background: '#FEF3C7', color: '#92400E', border: 'none', fontWeight: 800, padding: '10px 18px', borderRadius: '10px', textDecoration: 'none' }}>
            📅 दिनदर्शिका २.०
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="btn"
            style={{
              background: 'rgba(254, 226, 226, 0.95)',
              border: '1.5px solid #FCA5A5',
              color: '#991B1B',
              fontWeight: 800,
              padding: '10px 18px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="आपल्या खात्यातून सुरक्षित बाहेर पडा">
            🚪 बाहेर पडा (Logout)
          </button>
        </div>
      </div>

      {/* DASHBOARD 6-TAB CONTROLLER (FEATURE 28) */}
      <div style={{
        background: '#FFFFFF',
        border: '1.5px solid #FED7AA',
        borderRadius: '16px',
        padding: '8px',
        marginBottom: '28px',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
      }}>
        {[
          { id: 'overview', label: '🏠 मुख्य डॅशबोर्ड व ओळखपत्र' },
          { id: 'saved_places', label: '🏰 जतन केलेली ठिकाणे व किल्ले (' + savedPlaces.length + ')' },
          { id: 'saved_people', label: '👑 ऐतिहासिक व्यक्ती (' + savedPeople.length + ')' },
          { id: 'calendar_events', label: '📅 दिनदर्शिका व स्मरणपत्रे (' + reminders.length + ')' },
          { id: 'contributor_hub', label: '🏆 कॉन्ट्रिब्युटर बॅजेस (Feature 27)' },
          { id: 'bookmarks', label: '🔖 ग्रंथ व वाचन यादी (Bookmarks)' }
        ].map((tab) => {
          const isSel = activeDashTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDashTab(tab.id)}
              style={{
                background: isSel ? 'linear-gradient(135deg, #7C1D05, #C2410C)' : '#FFFDF9',
                color: isSel ? '#FFFFFF' : '#431407',
                border: isSel ? '1.5px solid #7C1D05' : '1px solid #FED7AA',
                padding: '9px 16px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & SMART CARD */}
      {activeDashTab === 'overview' && (
        <>
          {/* Member Official Digital Smart Card Showcase */}
          <div style={{
            background: 'linear-gradient(135deg, #FFF8F0 0%, #FFFFFF 100%)',
            border: '1.5px solid #FFCC80',
            borderRadius: '20px',
            padding: '28px 24px',
            marginBottom: '28px',
            boxShadow: '0 8px 28px rgba(199,56,0,0.08)'
          }}>
            <style>{`
              .dash-card-perspective {
                perspective: 1200px;
                max-width: 560px;
                margin: 0 auto 20px;
              }
              .dash-smart-card {
                width: 100%;
                min-height: 315px;
                border-radius: 20px;
                position: relative;
                transform-style: preserve-3d;
                transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                cursor: pointer;
                box-shadow: 0 24px 60px rgba(0,0,0,0.38);
              }
              .dash-smart-card.flipped {
                transform: rotateY(180deg);
              }
              .dash-card-face {
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
                border: 1.5px solid rgba(212, 175, 55, 0.5);
              }
              .dash-card-front {
                background: linear-gradient(135deg, #1C0F0F 0%, #2D1414 45%, #180909 100%);
                position: relative;
              }
              .dash-card-front::before {
                content: '';
                position: absolute;
                inset: 0;
                background-image: radial-gradient(rgba(212, 175, 55, 0.14) 1.2px, transparent 1.2px);
                background-size: 16px 16px;
                pointer-events: none;
              }
              .dash-card-back {
                background: linear-gradient(135deg, #150A0A 0%, #220E0E 70%, #150A0A 100%);
                transform: rotateY(180deg);
              }
              .dash-emv-chip {
                width: 44px;
                height: 32px;
                background: linear-gradient(135deg, #ECC86A 0%, #FFF3B3 50%, #C69830 100%);
                border-radius: 6px;
                border: 1px solid #7C5C00;
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
                position: relative;
                flex-shrink: 0;
              }
              .dash-emv-chip::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 1px;
                background: rgba(124, 92, 0, 0.6);
              }
            `}</style>

            {/* Top Bar: Title & View Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem' }}>🪪</span>
                <div>
                  <h2 style={{ fontSize: '1.3rem', margin: 0, fontFamily: 'Baloo 2', color: '#8B1E0F', fontWeight: 800 }}>
                    आपले अधिकृत डिजिटल सभासद ओळखपत्र (Smart ID Card)
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                    अखिल भारतीय कनेक्ट मराठा महासंघ • प्रमाणित डिजिटल ओळख
                  </span>
                </div>
              </div>

              {/* Mode Switcher */}
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
                  onClick={() => setCardMode('smartcard')}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: cardMode === 'smartcard' ? 'linear-gradient(135deg, #991B1B, #C2410C)' : 'transparent',
                    color: cardMode === 'smartcard' ? '#FFFFFF' : '#4B5563',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: cardMode === 'smartcard' ? '0 2px 8px rgba(153,27,27,0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>🪪</span>
                  <span>एक्झिक्युटिव्ह स्मार्ट कार्ड</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCardMode('certificate')}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '20px',
                    border: 'none',
                    background: cardMode === 'certificate' ? 'linear-gradient(135deg, #991B1B, #C2410C)' : 'transparent',
                    color: cardMode === 'certificate' ? '#FFFFFF' : '#4B5563',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: cardMode === 'certificate' ? '0 2px 8px rgba(153,27,27,0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>📜</span>
                  <span>प्रमाणपत्र शैली</span>
                </button>
              </div>
            </div>

            {/* CARD VIEW 1: EXECUTIVE METALLIC SMART CARD (OBSIDIAN & GOLD LUXURY) */}
            {cardMode === 'smartcard' && (
              <div>
                <div className="dash-card-perspective">
                  <div
                    className={`dash-smart-card ${isCardFlipped ? 'flipped' : ''}`}
                    onClick={() => setIsCardFlipped(!isCardFlipped)}
                    title="कार्ड उलटे फिरवण्यासाठी क्लिक करा (Click to Flip 3D)"
                  >
                    {/* FRONT OF SMART CARD */}
                    <div className="dash-card-face dash-card-front">
                      {/* Top Bar: Seal & Micro-engraved title */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src="/assets/images/logo.png"
                            alt="Connect Maratha Seal"
                            style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid #F59E0B', background: '#FFFFFF', padding: '1px', objectFit: 'contain' }}
                          />
                          <div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '0.6px', color: '#F8FAFC' }}>
                              CONNECT MARATHA
                            </div>
                            <div style={{ fontSize: '0.64rem', color: '#CBD5E1', letterSpacing: '0.5px' }}>
                              अखिल भारतीय अधिकृत सभासद ओळखपत्र
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.35), rgba(245, 158, 11, 0.2))',
                            border: '1px solid #F59E0B',
                            color: '#FDE68A',
                            fontSize: '0.72rem',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            letterSpacing: '0.5px'
                          }}>
                            ⭐ {memberTier} सदस्य
                          </span>
                          <span style={{ fontSize: '1rem', color: '#F59E0B', opacity: 0.9, transform: 'rotate(90deg)', display: 'inline-block' }} title="Contactless NFC">
                            📶
                          </span>
                        </div>
                      </div>

                      {/* Middle Section: Real Photo + EMV Chip + Member Details */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '14px 0', position: 'relative', zIndex: 1 }}>
                        {/* Real Executive Photograph */}
                        <div style={{
                          width: '76px',
                          height: '90px',
                          borderRadius: '8px',
                          border: '2px solid #F59E0B',
                          overflow: 'hidden',
                          flexShrink: 0,
                          boxShadow: '0 6px 16px rgba(0,0,0,0.55)',
                          background: '#2D1414',
                          position: 'relative'
                        }}>
                          <img
                            src={memberPhoto}
                            alt={memberName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={(e) => { e.target.src = '/assets/images/officers/officer_tukaram.jpg'; }}
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div className="dash-emv-chip" title="EMV Smart Security Chip" />
                            <span style={{ fontSize: '0.62rem', color: '#94A3B8', letterSpacing: '1px', fontWeight: 700 }}>SECURE ID CHIP</span>
                            <span style={{ fontSize: '0.72rem', color: '#F59E0B', fontWeight: 700 }}>• NFC 2.0</span>
                          </div>

                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2, fontFamily: 'Baloo 2' }}>
                            {memberName}
                          </div>
                          <div style={{ fontSize: '0.84rem', color: '#FCD34D', fontWeight: 700, marginTop: '2px' }}>
                            {memberRole}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#CBD5E1', marginTop: '2px' }}>
                            📍 {memberCity}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Bar: Member ID & Crisp Laser QR */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
                        <div>
                          <div style={{ fontSize: '0.62rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>
                            MEMBER ID
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '1.5px', color: '#FDE68A', fontFamily: 'monospace' }}>
                            {memberIdFormatted}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#34D399', marginTop: '2px', fontWeight: 700 }}>
                            ✓ DPDP २०२३ व ISO २७००१ प्रमाणित • ✔ अधिकृत सक्रिय
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            background: '#FFFFFF',
                            padding: '4px',
                            borderRadius: '6px',
                            display: 'inline-block',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.35)'
                          }}>
                            <svg width="54" height="54" viewBox="0 0 25 25" fill="#111">
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
                          <div style={{ fontSize: '0.6rem', color: '#94A3B8', marginTop: '2px' }}>Scan to Verify</div>
                        </div>
                      </div>
                    </div>

                    {/* BACK OF SMART CARD */}
                    <div className="dash-card-face dash-card-back">
                      {/* Magnetic Stripe */}
                      <div style={{
                        width: 'calc(100% + 48px)',
                        height: '40px',
                        background: '#0B0B0E',
                        margin: '-24px -24px 14px -24px',
                        borderBottom: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.5)'
                      }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#FCD34D' }}>CONNECT MARATHA COUNCIL</span>
                        <span style={{ fontSize: '0.72rem', color: '#CBD5E1' }}>हेल्पलाईन: १८००-२३३-१९२४</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem', margin: '10px 0' }}>
                        <div>
                          <span style={{ color: '#94A3B8', fontSize: '0.68rem' }}>रक्तगट (Blood Group):</span>
                          <div style={{ fontWeight: 800, color: '#F87171' }}>{bloodGroup}</div>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', fontSize: '0.68rem' }}>संबद्ध चॅप्टर (Chapter):</span>
                          <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{memberChapter}</div>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', fontSize: '0.68rem' }}>वैधता (Valid Thru):</span>
                          <div style={{ fontWeight: 700, color: '#34D399' }}>आजीवन (Lifetime)</div>
                        </div>
                        <div>
                          <span style={{ color: '#94A3B8', fontSize: '0.68rem' }}>आपत्कालीन संपर्क:</span>
                          <div style={{ fontWeight: 700, color: '#FFFFFF' }}>{emergencyPhone}</div>
                        </div>
                      </div>

                      {/* Signature strip & Disclaimer */}
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.64rem', color: '#94A3B8', maxWidth: '300px', lineHeight: 1.4 }}>
                          हे ओळखपत्र केवळ अधिकृत CONNECT MARATHA सदस्यासाठी वैध आहे. गैरवापर कायद्याने दंडनीय आहे.
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.2rem', color: '#FCD34D', fontWeight: 700 }}>
                            Dr. J. Pawar
                          </div>
                          <div style={{ fontSize: '0.6rem', color: '#94A3B8' }}>मुख्य सचिव अधिकृत स्वाक्षरी</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#6B7280', marginBottom: '16px' }}>
                  💡 कार्ड उलटे फिरवण्यासाठी कार्डवर क्लिक करा किंवा खालील बटण दाबा
                </div>
              </div>
            )}

            {/* CARD VIEW 2: ROYAL CERTIFICATE STYLE ID */}
            {cardMode === 'certificate' && (
              <div style={{
                background: '#FFFDF9',
                border: '10px double #C73800',
                borderRadius: '16px',
                padding: '32px 28px',
                boxShadow: '0 16px 50px rgba(124, 29, 5, 0.08)',
                position: 'relative',
                textAlign: 'center',
                maxWidth: '680px',
                margin: '0 auto 20px',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.03,
                  backgroundImage: 'radial-gradient(#C73800 1.5px, transparent 1.5px)',
                  backgroundSize: '20px 20px',
                  pointerEvents: 'none'
                }} />

                <img
                  src="/assets/images/logo.png"
                  alt="Connect Maratha Seal"
                  style={{ height: '62px', objectFit: 'contain', marginBottom: '6px' }}
                />
                <div style={{ fontFamily: 'Baloo 2', fontSize: '1.28rem', fontWeight: 800, color: '#7C1D05' }}>
                  अखिल भारतीय मराठा महासंघ • कनेक्ट मराठा परिषद
                </div>
                <div style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: 800, letterSpacing: '1px' }}>
                  || स्वराज्य समाज संघटन व अधिकृत सभासदत्व गौरव पत्र ||
                </div>
                <div style={{ fontSize: '0.72rem', color: '#6B7280', fontStyle: 'italic', margin: '4px 0 14px' }}>
                  "प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते"
                </div>

                <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #E65100, transparent)', margin: '10px 0 16px 0' }} />

                <p style={{ fontSize: '0.92rem', color: '#4B5563', margin: 0 }}>हे सन्मानपूर्वक अधिकृतरीत्या प्रमाणित करण्यात येते की,</p>
                <h3 style={{ fontFamily: 'Baloo 2', fontSize: '1.85rem', fontWeight: 800, color: '#C73800', margin: '6px 0', textDecoration: 'underline', textUnderlineOffset: '6px' }}>
                  {memberName}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#1F2937', margin: '0 auto 18px', maxWidth: '540px', lineHeight: 1.5 }}>
                  यांना कनेक्ट मराठा व्यासपीठाचे <strong style={{ color: '#7C1D05' }}>"{memberTier} सदस्य"</strong> म्हणून अधिकृतरीत्या प्रमाणित करण्यात येत आहे.
                </p>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: '1.5px solid #FDE68A',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '20px',
                  alignItems: 'center',
                  textAlign: 'left'
                }}>
                  <div style={{ width: '74px', height: '88px', borderRadius: '8px', border: '2.5px double #C73800', overflow: 'hidden' }}>
                    <img
                      src={memberPhoto}
                      alt={memberName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/assets/images/officers/officer_tukaram.jpg'; }}
                    />
                  </div>

                  <div style={{ fontSize: '0.82rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px 14px' }}>
                    <div>
                      <span style={{ color: '#6B7280', fontSize: '0.7rem' }}>नोंदणी आयडी:</span>
                      <div style={{ fontWeight: 800, color: '#C73800', fontFamily: 'monospace' }}>{memberIdFormatted}</div>
                    </div>
                    <div>
                      <span style={{ color: '#6B7280', fontSize: '0.7rem' }}>व्यवसाय / पद:</span>
                      <div style={{ fontWeight: 700, color: '#1F2937' }}>{memberRole}</div>
                    </div>
                    <div>
                      <span style={{ color: '#6B7280', fontSize: '0.7rem' }}>संबद्ध चॅप्टर:</span>
                      <div style={{ fontWeight: 700, color: '#1F2937' }}>{memberChapter}</div>
                    </div>
                    <div>
                      <span style={{ color: '#6B7280', fontSize: '0.7rem' }}>रक्तगट:</span>
                      <div style={{ fontWeight: 700, color: '#DC2626' }}>{bloodGroup}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      border: '2px dashed #C73800',
                      borderRadius: '50%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                      color: '#C73800',
                      background: 'rgba(199, 56, 0, 0.04)'
                    }}>
                      <span>🚩</span>
                      <span>शिवमुद्रा</span>
                      <span>सील</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions Row */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
              {cardMode === 'smartcard' && (
                <button
                  type="button"
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  style={{
                    padding: '9px 18px',
                    background: '#FFFFFF',
                    color: '#7C1D05',
                    border: '1.5px solid #FFCC80',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                  }}
                >
                  <span>🔄</span> ३D फिरवा (Flip Card)
                </button>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  padding: '9px 18px',
                  background: '#1F2937',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                <span>🖨️</span> प्रिंट / PDF सेव्ह करा
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.origin + '/card');
                    alert('🔗 अधिकृत डिजिटल सभासद कार्ड लिंक क्लिपबोर्डवर कॉपी केली!');
                  } else {
                    alert('🔗 लिंक: ' + window.location.origin + '/card');
                  }
                }}
                style={{
                  padding: '9px 18px',
                  background: '#F3F4F6',
                  color: '#374151',
                  border: '1px solid #D1D5DB',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🔗</span> कार्ड लिंक कॉपी करा
              </button>

              <Link
                to="/card"
                style={{
                  padding: '9px 20px',
                  background: 'linear-gradient(135deg, #7C1D05, #C2410C)',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(124, 29, 5, 0.25)'
                }}
              >
                <span>🔍</span> संपूर्ण ओळखपत्र केंद्र (Full Card Page →)
              </Link>
            </div>
          </div>

          {/* Grid: Score & Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#7C1D05', fontWeight: 800 }}>🏆 योगदान गुण (Gamification)</h3>
                <span style={{ fontSize: '0.85rem', color: '#C2410C', fontWeight: 800 }}>{scoreInfo.badge}</span>
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#7C1D05', marginBottom: '8px' }}>
                {scoreInfo.totalScore} <span style={{ fontSize: '1rem', color: '#888', fontWeight: 400 }}>गुण</span>
              </div>
              <div style={{ background: '#EEEEEE', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ background: '#C2410C', height: '100%', width: `${Math.min(100, (scoreInfo.totalScore / 150) * 100)}%` }} />
              </div>
              <p style={{ fontSize: '0.82rem', color: '#666', margin: 0 }}>
                पुढील टप्पा गाठण्यासाठी नवीन व्यवसाय संदर्भ द्या (+१० गुण) किंवा १-टू-१ भेट पूर्ण करा (+५ गुण).
              </p>
            </div>

            <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px', color: '#7C1D05', fontWeight: 800 }}>💼 व्यवसाय संदर्भ (Referrals)</h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#15803D' }}>{referrals.length}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>सक्रिय संदर्भ</div>
                </div>
                <div style={{ borderRight: '1px solid #EEE' }} />
                <div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0369A1' }}>{meetings.length}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>१-टू-१ भेटी</div>
                </div>
              </div>
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Link to="/referrals" style={{ fontSize: '0.88rem', color: '#7C1D05', fontWeight: 700, textDecoration: 'none' }}>
                  सर्व संदर्भ व्यवस्थापन पहा →
                </Link>
              </div>
            </div>
          </div>

          {/* MASTER ROLE ELIGIBILITY & NOMINATION PIPELINE WIDGET */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '24px', marginBottom: '30px', boxShadow: '0 4px 15px rgba(234,88,12,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <span style={{ color: '#C2410C', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  REFERRAL NOMINATION MATRIX • ३-गेट्स पदोन्नती
                </span>
                <h3 style={{ fontSize: '1.4rem', color: '#7C1D05', fontWeight 900, margin: '4px 0 2px' }}>
                  🏛️ माझी संघटनात्मक पदोन्नती व पात्रता (Role Eligibility Matrix)
                </h3>
                <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B' }}>
                  तुमचे एकंदर रेफरल्स: <strong style={{ color: '#EA580C' }}>{(member.referrals || member.referralCount || 2870).toLocaleString()}</strong> • 
                  सध्याचा अनलॉक्ड बँड: <strong style={{ color: '#16A34A' }}>Band 4 (प्रभावी योगदानकर्ता)</strong>
                </p>
              </div>
              <Link to="/governance/roles-matrix" style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #EA580C', padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800, textDecoration: 'none' }}>
                सर्व ३०+ पदे पहा →
              </Link>
            </div>

            {/* Top 4 High-Impact Roles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {MASTER_ROLES.slice(0, 4).map(r => {
                const userRefs = member.referrals || member.referralCount || 2870;
                const isEligible = userRefs >= r.referralThreshold;
                const existingApps = JSON.parse(localStorage.getItem('cm_role_applications') || '[]');
                const hasApplied = existingApps.some(app => app.roleId === r.id);

                const handleMemberApply = () => {
                  const newApp = {
                    id: 'app_' + Date.now(),
                    userId: memberIdFormatted,
                    userName: memberName,
                    userDistrict: member.district || 'पुणे',
                    roleId: r.id,
                    roleTitleMr: r.titleMr,
                    referrals: userRefs,
                    gate1Status: 'Passed',
                    gate2Status: 'Qualified',
                    gate3Status: 'Interview Scheduled',
                    appliedAt: new Date().toISOString()
                  };
                  localStorage.setItem('cm_role_applications', JSON.stringify([newApp, ...existingApps]));
                  alert(`आपला "${r.titleMr}" पदासाठीचा उमेदवारी अर्ज जिल्हा व राज्य निवड समितीकडे वर्ग करण्यात आला आहे! 🚩`);
                  window.location.reload();
                };

                return (
                  <div key={r.id} style={{
                    background: isEligible ? '#F0FDF4' : '#FFFDF9',
                    border: isEligible ? '1.5px solid #86EFAC' : '1.5px solid #FED7AA',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.72rem', background: isEligible ? '#DCFCE7' : '#FEF3C7', color: isEligible ? '#166534' : '#92400E', padding: '3px 8px', borderRadius: 6, fontWeight: 800 }}>
                          {isEligible ? '✅ अर्ज करण्यास पात्र' : `🔒 आणखी ${(r.referralThreshold - userRefs).toLocaleString()} रेफरल्स आवश्यक`}
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>{r.tier.toUpperCase()}</span>
                      </div>
                      <h4 style={{ margin: '4px 0 2px', fontSize: '1.05rem', fontWeight: 900, color: '#7C1D05' }}>{r.titleMr}</h4>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: 8 }}>{r.title}</div>
                      <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.4 }}>{r.description}</div>
                    </div>

                    <div style={{ marginTop: 14 }}>
                      {hasApplied ? (
                        <div style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B', borderRadius: 8, padding: '8px 12px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                          ⏳ अर्ज दाखल (Gate 1 & 2 Passed - Pending Review)
                        </div>
                      ) : isEligible ? (
                        <button
                          onClick={handleMemberApply}
                          style={{ width: '100%', background: 'linear-gradient(135deg, #EA580C, #D97706)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 14px', fontSize: '0.82rem', fontWeight: 900, cursor: 'pointer', boxShadow: '0 2px 8px rgba(234,88,12,0.25)' }}
                        >
                          🚩 अर्जाची शिफारस करा (Apply for Gate 3)
                        </button>
                      ) : (
                        <button
                          disabled
                          style={{ width: '100%', background: '#F1F5F9', color: '#94A3B8', border: '1px solid #CBD5E1', borderRadius: 8, padding: '9px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: 'not-allowed' }}
                        >
                          🔒 अपात्र (Referrals Required)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </>
      )}

      {/* TAB 2: SAVED PLACES & FORTS (FEATURE 28) */}
      {activeDashTab === 'saved_places' && (
        <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '28px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                🏰 जतन केलेले गडकोट व वारसा ठिकाणे (Saved Places)
              </h3>
              <span style={{ fontSize: '0.84rem', color: '#6B7280' }}>आपल्या सहलींसाठी बुकमार्क केलेले किल्ले व मार्ग</span>
            </div>
            <Link to="/forts" style={{ background: '#7C1D05', color: '#FFFFFF', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
              + नवीन किल्ले शोधा व जोडा
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {savedPlaces.map((place) => (
              <div key={place.id} style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                    {place.type}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>📍 {place.district}</span>
                </div>
                <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.15rem', fontWeight: 800 }}>
                  {place.name}
                </h4>
                <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.4 }}>
                  {place.notes}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to={place.link} style={{ color: '#C2410C', fontWeight: 800, fontSize: '0.84rem', textDecoration: 'none' }}>
                    माहिती व ट्रेक मार्ग →
                  </Link>
                  <button
                    onClick={() => setSavedPlaces(prev => prev.filter(p => p.id !== place.id))}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    काढून टाका ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SAVED HISTORICAL PEOPLE (FEATURE 28 & 4) */}
      {activeDashTab === 'saved_people' && (
        <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '28px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                👑 जतन केलेल्या ऐतिहासिक व्यक्ती (Saved Personalities)
              </h3>
              <span style={{ fontSize: '0.84rem', color: '#6B7280' }}>"Know the Person" अंतर्गत अभ्यास व संदर्भासाठी जतन केलेले चरित्र</span>
            </div>
            <Link to="/history/warriors" style={{ background: '#7C1D05', color: '#FFFFFF', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
              + सरदार व महापुरुष शोधा
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {savedPeople.map((person) => (
              <div key={person.id} style={{ background: '#FFFDF9', border: '1.5px solid #FED7AA', borderRadius: '12px', padding: '18px' }}>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                  काळ: {person.era}
                </span>
                <h4 style={{ margin: '8px 0 4px', color: '#7C1D05', fontSize: '1.15rem', fontWeight: 800 }}>
                  {person.name}
                </h4>
                <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#4B5563' }}>
                  {person.role}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to={person.link} style={{ color: '#C2410C', fontWeight: 800, fontSize: '0.84rem', textDecoration: 'none' }}>
                    सविस्तर चरित्र व कालपट →
                  </Link>
                  <button
                    onClick={() => setSavedPeople(prev => prev.filter(p => p.id !== person.id))}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    काढून टाका ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CALENDAR REMINDERS (FEATURE 28 & 1) */}
      {activeDashTab === 'calendar_events' && (
        <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '28px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                📅 माझी दिनदर्शिका व स्मरणपत्रे (Personal Calendar)
              </h3>
              <span style={{ fontSize: '0.84rem', color: '#6B7280' }}>ऐतिहासिक दिनविशेष, तिथी व सणांचे स्वयंचलित रिमाइंडर्स</span>
            </div>
            <Link to="/calendar" style={{ background: '#C2410C', color: '#FFFFFF', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
              📅 मुख्य दिनदर्शिका उघडा
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reminders.map((rem) => (
              <div key={rem.id} style={{ background: '#FFFDF9', border: '1px solid #FED7AA', borderRadius: '10px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#7C1D05', fontSize: '0.98rem' }}>{rem.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>तारीख/कालावधी: {rem.date}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nSUMMARY:${rem.title}\nEND:VCALENDAR`;
                      const blob = new Blob([icsData], { type: 'text/calendar' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${rem.title}.ics`;
                      a.click();
                    }}
                    style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Google / Apple Calendar मध्ये जोडा 📥
                  </button>
                  <button
                    onClick={() => setReminders(prev => prev.filter(r => r.id !== rem.id))}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CONTRIBUTOR SYSTEM & BADGES (FEATURE 27) */}
      {activeDashTab === 'contributor_hub' && (
        <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '28px', marginBottom: '28px' }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: '#C2410C', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.82rem', letterSpacing: '0.5px' }}>
              FEATURE 27 • CONTRIBUTOR RECOGNITION SYSTEM
            </span>
            <h3 style={{ fontSize: '1.5rem', color: '#7C1D05', fontWeight: 900, margin: '4px 0 6px' }}>
              🏆 मराठा वारसा व समाज कॉन्ट्रिब्युटर मंडळ
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.5 }}>
              इतिहास संशोधन, छायाचित्रे, मौखिक इतिहास, भाषा अनुवाद किंवा सेवा उपक्रमांत योगदान द्या आणि अधिकृत डिजिटल मानांकन बॅजेस मिळवा.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {CONTRIBUTOR_ROLES.map((role) => {
              const isApplied = appliedRoles[role.id];
              return (
                <div
                  key={role.id}
                  style={{
                    background: isApplied ? '#F0FDF4' : '#FFFDF9',
                    border: isApplied ? '1.5px solid #86EFAC' : '1.5px solid #FED7AA',
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '2rem' }}>{role.icon}</span>
                      <span style={{ background: isApplied ? '#DCFCE7' : '#FEF3C7', color: isApplied ? '#166534' : '#92400E', padding: '2px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>
                        {isApplied ? '✔ प्रमाणित कॉन्ट्रिब्युटर' : `+${role.points} गुण`}
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 6px', color: '#7C1D05', fontSize: '1.05rem', fontWeight: 800 }}>
                      {role.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => {
                      if (!isApplied) {
                        setSelectedRoleApp(role);
                      } else {
                        alert(`आपण यापूर्वीच ${role.title} म्हणून प्रमाणित आहात!`);
                      }
                    }}
                    style={{
                      marginTop: '14px',
                      background: isApplied ? '#15803D' : '#7C1D05',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    {isApplied ? 'प्रमाणपत्र पहा 📜' : 'या भूमिकेसाठी अर्ज करा ✍️'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: BOOKMARKS & READING LIST (FEATURE 28) */}
      {activeDashTab === 'bookmarks' && (
        <div style={{ background: '#FFFFFF', border: '1.5px solid #FED7AA', borderRadius: '16px', padding: '28px', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.3rem', color: '#7C1D05', fontWeight: 800, margin: '0 0 16px' }}>
            🔖 वाचन यादी व जतन लेख (Bookmarks & Reading Lists)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#FFFDF9', border: '1px solid #FED7AA', borderRadius: '10px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#7C1D05' }}>सभासद बखर — अस्सल वाचन व समीक्षा</strong>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>मराठा ग्रंथालय • १६९७ चा समकालीन दस्तऐवज</div>
              </div>
              <Link to="/history/granthalaya" style={{ background: '#7C1D05', color: '#FFFFFF', padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 700 }}>
                वाचा 📖
              </Link>
            </div>

            <div style={{ background: '#FFFDF9', border: '1px solid #FED7AA', borderRadius: '10px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#7C1D05' }}>पालखेडची लढाई (१७२८) — थोरले बाजीराव पेशवे</strong>
                <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>रणसंग्राम दालन • जगातील सर्वोत्तम गनिमी हालचाल युद्धनीती</div>
              </div>
              <Link to="/history/battles" style={{ background: '#7C1D05', color: '#FFFFFF', padding: '6px 14px', borderRadius: '6px', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 700 }}>
                वाचा 📖
              </Link>
            </div>
          </div>
        </div>
      )}

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

      {/* Contributor Application Modal */}
      {selectedRoleApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '26px', border: '2px solid #FED7AA', position: 'relative' }}>
            <button onClick={() => setSelectedRoleApp(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#F3F4F6', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.2rem' }}>{selectedRoleApp.icon}</span>
              <div>
                <h3 style={{ margin: 0, color: '#7C1D05', fontSize: '1.25rem', fontWeight: 800 }}>{selectedRoleApp.title}</h3>
                <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700 }}>सहभागासाठी +{selectedRoleApp.points} गुण मिळतील</span>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, margin: '0 0 14px' }}>
              या भूमिकेअंतर्गत आपण महाराष्ट्राच्या संस्कृती, इतिहास किंवा समाजसेवेत योगदान देण्यास इच्छुक आहात. आपल्या अनुभवाची किंवा विषयाची थोडक्यात माहिती द्या:
            </p>
            <textarea placeholder="उदा. मी गेली ५ वर्षे गडकिल्ल्यांचे ऐतिहासिक दस्तऐवजीकरण करतो / स्थानिक लोककथा गोळा करतो..." rows={4} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', marginBottom: '14px', resize: 'none' }} />
            <button
              onClick={() => {
                setAppliedRoles(prev => ({ ...prev, [selectedRoleApp.id]: true }));
                alert(`${selectedRoleApp.title} नोंदणी यशस्वी! +${selectedRoleApp.points} गुण जोडले गेले.`);
                setSelectedRoleApp(null);
              }}
              style={{ width: '100%', background: '#7C1D05', color: '#FFFFFF', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
            >
              नोंदणी पूर्ण करा 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
