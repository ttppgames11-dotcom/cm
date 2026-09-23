import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CMDB from '../../services/cmdb';

export default function DigitalMemberCardPage() {
  const { user } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);

  const member = user || (CMDB.currentMember ? CMDB.currentMember() : {
    name: 'अमोल तुकाराम जाधव',
    id: 'CM-MH-2026-8842',
    tier: 'Gold',
    city: 'पुणे',
    district: 'पुणे',
    profession: 'Software Architect',
    joined: '2025-11-02'
  });

  const memberId = member.id || 'CM-MH-2026-8842';
  const score = CMDB.calculateMemberContributionScore ? CMDB.calculateMemberContributionScore(member.id) : { totalScore: 95, badge: 'रौप्य शिलेदार' };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container py-5" style={{ padding: '40px 16px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="text-center mb-4" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: 'var(--maroon-900, #D84315)', fontSize: '2.2rem', marginBottom: '8px' }}>
          🪪 मराठा डिजिटल स्मार्ट ओळखपत्र
        </h1>
        <p style={{ color: '#666', fontSize: '1rem' }}>
          अखिल भारतीय मराठा महासंघाचे अधिकृत डिजिटल ओळखपत्र. कार्ड फिरवण्यासाठी त्यावर क्लिक करा.
        </p>
      </div>

      {/* 3D Flippable Card Container */}
      <div 
        style={{ perspective: '1000px', margin: '0 auto 30px', maxWidth: '480px', cursor: 'pointer' }}
        onClick={() => setIsFlipped(!isFlipped)}>
        <div style={{
          width: '100%',
          minHeight: '290px',
          borderRadius: '16px',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          boxShadow: '0 16px 36px rgba(199,56,0,0.25)',
          background: 'linear-gradient(135deg, #C73800 0%, #E65100 50%, #BF360C 100%)',
          color: '#FFFFFF',
          padding: '24px',
          boxSizing: 'border-box',
          border: '2px solid rgba(255,255,255,0.4)'
        }}>
          {/* Front Face */}
          {!isFlipped ? (
            <div>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.25)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="/assets/images/logo.png" alt="Logo" style={{ height: '38px', width: 'auto', background: '#fff', borderRadius: '50%', padding: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.1 }}>अखिल भारतीय मराठा महासंघ</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>CONNECT MARATHA SMART CARD</div>
                  </div>
                </div>
                <div style={{ background: '#FFE082', color: '#B71C1C', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                  {member.tier || 'Gold'} सदस्य
                </div>
              </div>

              {/* Card Body */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '3.2rem', background: 'rgba(255,255,255,0.2)', width: '70px', height: '70px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {member.avatar || '👨'}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', margin: '0 0 4px', fontWeight: 800 }}>{member.name}</h2>
                  <div style={{ fontSize: '0.88rem', opacity: 0.9 }}>{member.profession || 'व्यावसायिक सदस्य'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#FFE082', marginTop: '2px' }}>
                    📍 {member.city}, {member.district}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                <div>
                  <div style={{ opacity: 0.75, fontSize: '0.7rem' }}>सदस्य आयडी (MEMBER ID)</div>
                  <div style={{ fontWeight: 700, letterSpacing: '1px' }}>{memberId}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ opacity: 0.75, fontSize: '0.7rem' }}>योगदान सन्मान</div>
                  <div style={{ fontWeight: 700, color: '#FFE082' }}>{score.badge} ({score.totalScore} गुण)</div>
                </div>
              </div>
            </div>
          ) : (
            /* Back Face */
            <div style={{ transform: 'rotateY(180deg)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '8px', marginBottom: '12px' }}>
                  डिजिटल पडताळणी व सुरक्षा बारकोड
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Simulated QR Pattern */}
                    <div style={{ width: '100%', height: '100%', border: '3px dashed #C73800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#C73800', fontWeight: 800, textAlign: 'center' }}>
                      QR VERIFIED
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', lineHeight: 1.5, opacity: 0.9 }}>
                    <div>✅ मोबाईल पडताळणी पूर्ण</div>
                    <div>✅ महासंघ मान्यताप्राप्त</div>
                    <div>📅 नोंदणी: {member.joined ? member.joined.slice(0, 10) : '2025-11-02'}</div>
                    <div style={{ color: '#FFE082', marginTop: '4px' }}>🔒 256-Bit SSL Secured</div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', opacity: 0.8, borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '10px', textAlign: 'center' }}>
                हे अधिकृत डिजिटल कार्ड महासंघाच्या सर्व व्यवसाय बैठका व कार्यक्रमात वैध आहे.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
        <button onClick={() => setIsFlipped(!isFlipped)} className="btn btn-outline" style={{ padding: '10px 20px' }}>
          🔄 कार्ड फिरवा (Flip)
        </button>
        <button onClick={handlePrint} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          🖨️ कार्ड प्रिंट / सेव्ह करा
        </button>
        <Link to="/profile/edit" className="btn btn-outline" style={{ padding: '10px 20px' }}>
          ✏️ माहिती संपादित करा
        </Link>
      </div>
    </div>
  );
}
