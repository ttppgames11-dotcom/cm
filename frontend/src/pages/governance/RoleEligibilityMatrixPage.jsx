import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  REFERRAL_BANDS,
  DEPARTMENT_WINGS,
  ADMINISTRATIVE_TIERS,
  MASTER_ROLES,
  evaluateCandidateEligibility
} from '../../data/rolesMatrixData';

export default function RoleEligibilityMatrixPage() {
  const [selectedWing, setSelectedWing] = useState('all');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedBand, setSelectedBand] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleModal, setSelectedRoleModal] = useState(null);

  // Simulator State
  const [candidateReferrals, setCandidateReferrals] = useState(2873);
  const [simTargetRoleId, setSimTargetRoleId] = useState('tech-02'); // Gram Digital Head
  const [applicationSuccess, setApplicationSuccess] = useState(null);

  // Filtered Roles
  const filteredRoles = useMemo(() => {
    return MASTER_ROLES.filter(r => {
      if (selectedWing !== 'all' && r.department !== selectedWing) return false;
      if (selectedTier !== 'all' && r.tier !== selectedTier) return false;
      if (selectedBand !== 'all' && r.band !== selectedBand) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${r.title} ${r.titleMr} ${r.description} ${r.qualification} ${r.responsibilities.join(' ')}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [selectedWing, selectedTier, selectedBand, searchQuery]);

  // Active Simulated Role
  const simTargetRole = useMemo(() => {
    return MASTER_ROLES.find(r => r.id === simTargetRoleId) || MASTER_ROLES[0];
  }, [simTargetRoleId]);

  // Simulation Evaluation
  const evalResult = useMemo(() => {
    return evaluateCandidateEligibility(candidateReferrals, ['संगणक', 'अ‍ॅप', 'डेटा', 'संवाद'], simTargetRole);
  }, [candidateReferrals, simTargetRole]);

  // Handle Application
  const handleApply = (role) => {
    const existing = JSON.parse(localStorage.getItem('cm_role_applications') || '[]');
    const newApp = {
      id: 'app_' + Date.now(),
      roleId: role.id,
      roleTitle: role.titleMr,
      referralCount: candidateReferrals,
      date: new Date().toISOString(),
      status: candidateReferrals >= role.referralThreshold ? 'Gate 1 Passed - Pending Review' : 'Referral Threshold Incomplete'
    };
    localStorage.setItem('cm_role_applications', JSON.stringify([newApp, ...existing]));
    setApplicationSuccess(`आपला "${role.titleMr}" पदासाठीचा उमेदवारी अर्ज यशस्वीरीत्या नोंदवला गेला आहे! 🚩`);
    setTimeout(() => setApplicationSuccess(null), 6000);
  };

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0 80px' }}>
      <div className="container" style={{ maxWidth: '1320px', margin: '0 auto', padding: '0 20px' }}>

        {/* ================= HERO HEADER ================= */}
        <div style={{
          background: 'linear-gradient(135deg, #7C2D12 0%, #C73800 60%, #E65100 100%)',
          borderRadius: '20px',
          color: '#FFFFFF',
          padding: '40px 36px',
          marginBottom: '32px',
          boxShadow: '0 12px 30px rgba(199,56,0,0.22)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '850px', position: 'relative', zIndex: 1 }}>
            <span style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 800,
              display: 'inline-block',
              marginBottom: '12px'
            }}>
              ⚖️ Connect मराठा — संघटनात्मक पात्रता व नियुक्ती चौकट
            </span>
            <h1 style={{ fontSize: '2.4rem', margin: '0 0 12px', fontFamily: 'Baloo 2', lineHeight: 1.2 }}>
              भूमिका व रेफरल पात्रता मॅट्रिक्स (Role-by-Role Eligibility Matrix)
            </h1>
            <p style={{ margin: 0, fontSize: '1.05rem', opacity: 0.95, lineHeight: 1.6 }}>
              कोणत्याही पदासाठी सरसकट नियम नाही; प्रत्येक भूमिकेनुसार स्वतंत्र रेफरल थ्रेशोल्ड, किमान कौशल्य चाचणी व ३-गेट्स निवड प्रक्रियेवर आधारित १००% पारदर्शक व गुणवत्तेवर आधारित रचना.
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            marginTop: '28px',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Baloo 2' }}>९</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>रेफरल बँड्स (१०० ते १,००,०००+)</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Baloo 2' }}>१०</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>संघटनात्मक आघाड्या (Wings)</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Baloo 2' }}>६</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>प्रशासकीय स्तर (ग्राम ते राज्य)</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Baloo 2' }}>३</div>
              <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>कडक निवड गेट्स (Gates 1, 2, 3)</div>
            </div>
          </div>
        </div>

        {/* Application Success Toast */}
        {applicationSuccess && (
          <div style={{
            background: '#ECFDF5',
            border: '1.5px solid #10B981',
            color: '#065F46',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 16px rgba(16,185,129,0.15)',
            fontSize: '1rem',
            fontWeight: 700
          }}>
            <span>{applicationSuccess}</span>
            <button onClick={() => setApplicationSuccess(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#065F46' }}>✕</button>
          </div>
        )}

        {/* ================= SECTION 1: 3-GATE EVALUATION ENGINE & FUNNEL ================= */}
        <section style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          padding: '32px',
          border: '1px solid #E5E7EB',
          marginBottom: '36px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <span style={{ color: '#C73800', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                GATEWAY ARCHITECTURE
              </span>
              <h2 style={{ fontSize: '1.7rem', margin: '4px 0 0', color: '#1F2937', fontFamily: 'Baloo 2' }}>
                ३-गेट्स निवड व नियुक्ती प्रक्रिया (3-Gate Selection Funnel)
              </h2>
            </div>
            <span style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', color: '#C2410C', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
              केवळ रेफरल्स पुरेसे नाहीत — कौशल्य व मुलाखत अनिवार्य!
            </span>
          </div>

          {/* Interactive Flowchart Diagram */}
          <div style={{
            background: '#F8FAFC',
            borderRadius: '14px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '12px', textAlign: 'center' }}>
              <div style={{ background: '#FFFFFF', padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>
                📱 विनामूल्य नोंदणी<br /><span style={{ fontSize: '0.72rem', color: '#64748B' }}>Free Registration</span>
              </div>
              <span style={{ color: '#94A3B8', fontWeight: 900 }}>➔</span>
              <div style={{ background: '#FFFFFF', padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>
                👥 लोकांशी संपर्क व रेफरल<br /><span style={{ fontSize: '0.72rem', color: '#64748B' }}>Refer Community</span>
              </div>
              <span style={{ color: '#94A3B8', fontWeight: 900 }}>➔</span>
              <div style={{ background: '#EFF6FF', padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #3B82F6', fontSize: '0.86rem', fontWeight: 800, color: '#1D4ED8' }}>
                ✔️ थेट सत्यापित रेफरल्स<br /><span style={{ fontSize: '0.72rem', color: '#2563EB' }}>Verified Referrals</span>
              </div>
              <span style={{ color: '#94A3B8', fontWeight: 900 }}>➔</span>
              <div style={{ background: '#FEF3C7', padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #F59E0B', fontSize: '0.86rem', fontWeight: 800, color: '#92400E' }}>
                🚪 Gate 1: रेफरल थ्रेशोल्ड<br /><span style={{ fontSize: '0.72rem', color: '#B45309' }}>Referral Gate</span>
              </div>
              <span style={{ color: '#94A3B8', fontWeight: 900 }}>➔</span>
              <div style={{ background: '#F3E8FF', padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #A855F7', fontSize: '0.86rem', fontWeight: 800, color: '#6B21A8' }}>
                🧠 Gate 2: पदनिहाय कौशल्य<br /><span style={{ fontSize: '0.72rem', color: '#7E22CE' }}>Role Competency</span>
              </div>
              <span style={{ color: '#94A3B8', fontWeight: 900 }}>➔</span>
              <div style={{ background: '#ECFDF5', padding: '10px 18px', borderRadius: '10px', border: '1.5px solid #10B981', fontSize: '0.86rem', fontWeight: 800, color: '#065F46' }}>
                🎙️ Gate 3: मुलाखत व पडताळणी<br /><span style={{ fontSize: '0.72rem', color: '#047857' }}>Interview & Selection</span>
              </div>
              <span style={{ color: '#94A3B8', fontWeight: 900 }}>➔</span>
              <div style={{ background: '#C73800', color: '#FFFFFF', padding: '10px 20px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 800, boxShadow: '0 4px 12px rgba(199,56,0,0.3)' }}>
                🚩 पदवाटप व KPI उद्दिष्टे<br /><span style={{ fontSize: '0.72rem', opacity: 0.9 }}>Role Allotted</span>
              </div>
            </div>
          </div>

          {/* Interactive Candidate Simulator */}
          <div style={{
            background: '#FFFDF9',
            border: '1.5px solid #FED7AA',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', color: '#9A3412', fontFamily: 'Baloo 2', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚡</span> उमेदवार पात्रता सिम्युलेटर (Candidate Eligibility Simulator)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  १. आपले थेट सत्यापित रेफरल्स टाका (Direct Verified Referrals):
                </label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="number"
                    min="0"
                    max="500000"
                    step="100"
                    value={candidateReferrals}
                    onChange={(e) => setCandidateReferrals(Number(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      color: '#1E293B'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[500, 2500, 10000, 40000].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setCandidateReferrals(cnt)}
                        style={{
                          background: candidateReferrals === cnt ? '#C73800' : '#FFF',
                          color: candidateReferrals === cnt ? '#FFF' : '#64748B',
                          border: '1px solid #CBD5E1',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}>
                        {cnt >= 1000 ? (cnt / 1000) + 'k' : cnt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  २. इच्छित पद निवडा (Target Role):
                </label>
                <select
                  value={simTargetRoleId}
                  onChange={(e) => setSimTargetRoleId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    background: '#FFFFFF',
                    color: '#1E293B'
                  }}>
                  {MASTER_ROLES.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.titleMr} — (आवश्यक रेफरल: {r.referralThreshold.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Evaluation Results Card */}
            {evalResult && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 700 }}>सिम्युलेशन निष्कर्ष</span>
                    <h4 style={{ margin: '2px 0 0', fontSize: '1.2rem', color: '#1E293B', fontFamily: 'Baloo 2' }}>
                      {simTargetRole.titleMr} ({simTargetRole.title})
                    </h4>
                  </div>
                  <span style={{
                    background: evalResult.gate1.passed ? '#ECFDF5' : '#FEF2F2',
                    border: `1.5px solid ${evalResult.gate1.passed ? '#10B981' : '#EF4444'}`,
                    color: evalResult.gate1.passed ? '#065F46' : '#991B1B',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.88rem',
                    fontWeight: 800
                  }}>
                    {evalResult.gate1.passed ? '✓ GATE 1 पात्र (Passed)' : '✗ GATE 1 अपूर्ण (Referrals Short)'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {/* Gate 1 Box */}
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B' }}>🚪 Gate 1 — रेफरल संख्या</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: evalResult.gate1.passed ? '#059669' : '#DC2626' }}>
                        {evalResult.gate1.actual.toLocaleString('en-IN')} / {evalResult.gate1.required.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div style={{
                        width: `${evalResult.gate1.progress}%`,
                        height: '100%',
                        background: evalResult.gate1.passed ? '#10B981' : '#F59E0B',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {evalResult.gate1.passed
                        ? `✅ आवश्यकतेपेक्षा ${evalResult.gate1.actual - evalResult.gate1.required} अधिक रेफरल्स.`
                        : `⚠️ अजून ${evalResult.gate1.shortfall.toLocaleString('en-IN')} रेफरल्स आवश्यक आहेत.`}
                    </div>
                  </div>

                  {/* Gate 2 Box */}
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B' }}>🧠 Gate 2 — पदनिहाय कौशल्य</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB' }}>
                        {simTargetRole.gate2Competencies.length} निकष
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#334155', maxHeight: '72px', overflowY: 'auto' }}>
                      {simTargetRole.gate2Competencies.slice(0, 3).map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ color: '#10B981' }}>✓</span> {c}
                        </div>
                      ))}
                      {simTargetRole.gate2Competencies.length > 3 && (
                        <span style={{ color: '#64748B', fontSize: '0.74rem' }}>+ इतर {simTargetRole.gate2Competencies.length - 3} कौशल्ये...</span>
                      )}
                    </div>
                  </div>

                  {/* Gate 3 Box */}
                  <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1E293B' }}>🎙️ Gate 3 — निवड व मुलाखत</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7C3AED' }}>
                        {evalResult.gate3.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                      {simTargetRole.gate3Interview}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedRoleModal(simTargetRole)}
                    style={{
                      background: '#FFF',
                      border: '1.5px solid #CBD5E1',
                      color: '#475569',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    📄 संपूर्ण पद विवरण (Spec Sheet)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApply(simTargetRole)}
                    style={{
                      background: '#C73800',
                      border: 'none',
                      color: '#FFF',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(199,56,0,0.2)'
                    }}>
                    🚩 या पदासाठी उमेदवारी नोंदवा
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= SECTION 2: 9 REFERRAL BANDS ================= */}
        <section style={{ marginBottom: '36px' }}>
          <div style={{ marginBottom: '18px' }}>
            <span style={{ color: '#C73800', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              REFERRAL BANDS
            </span>
            <h2 style={{ fontSize: '1.7rem', margin: '4px 0 0', color: '#1F2937', fontFamily: 'Baloo 2' }}>
              ९ रेफरल बँड्स रचना (Referral Bands Hierarchy)
            </h2>
            <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.94rem' }}>
              रेफरल संख्येनुसार जबाबदारीचे टप्पे; कोणत्याही बँडवर क्लिक करून संबंधित पदे फिल्टर करा.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {REFERRAL_BANDS.map(band => {
              const isSelected = selectedBand === band.range;
              return (
                <div
                  key={band.id}
                  onClick={() => setSelectedBand(isSelected ? 'all' : band.range)}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '18px',
                    border: `1.5px solid ${isSelected ? band.color : '#E5E7EB'}`,
                    boxShadow: isSelected ? `0 6px 20px ${band.color}25` : '0 2px 8px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{band.icon}</span>
                    <span style={{
                      background: `${band.color}15`,
                      color: band.color,
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      {band.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: band.color, fontFamily: 'Baloo 2', marginBottom: '2px' }}>
                    {band.range}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>
                    {band.label}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                    {band.description}
                  </p>
                  {isSelected && (
                    <div style={{ marginTop: '10px', fontSize: '0.75rem', fontWeight: 800, color: band.color }}>
                      ✓ सध्या निवडलेले बँड (क्लिक करून काढा)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= SECTION 3: DEPARTMENT WINGS ================= */}
        <section style={{ marginBottom: '36px' }}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ color: '#C73800', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ORGANIZATIONAL DEPARTMENTS
            </span>
            <h2 style={{ fontSize: '1.7rem', margin: '4px 0 0', color: '#1F2937', fontFamily: 'Baloo 2' }}>
              १० संघटनात्मक आघाड्या (10 Departmental Wings)
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
            <button
              type="button"
              onClick={() => setSelectedWing('all')}
              style={{
                background: selectedWing === 'all' ? '#C73800' : '#FFFFFF',
                color: selectedWing === 'all' ? '#FFFFFF' : '#374151',
                border: '1px solid #E5E7EB',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
              🌐 सर्व आघाड्या ({MASTER_ROLES.length})
            </button>
            {DEPARTMENT_WINGS.map(w => {
              const isSel = selectedWing === w.id;
              const count = MASTER_ROLES.filter(r => r.department === w.id).length;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSelectedWing(w.id)}
                  style={{
                    background: isSel ? w.color : '#FFFFFF',
                    color: isSel ? '#FFFFFF' : '#374151',
                    border: `1px solid ${isSel ? w.color : '#E5E7EB'}`,
                    padding: '9px 18px',
                    borderRadius: '10px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                  <span>{w.icon}</span>
                  <span>{w.nameMr}</span>
                  <span style={{
                    background: isSel ? 'rgba(255,255,255,0.25)' : '#F3F4F6',
                    color: isSel ? '#FFF' : '#6B7280',
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    borderRadius: '10px'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================= SECTION 4: MASTER ROLE EXPLORER & FILTERS ================= */}
        <section>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '22px 24px',
            border: '1px solid #E5E7EB',
            marginBottom: '28px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ flex: 2, minWidth: '240px' }}>
                <input
                  type="text"
                  placeholder="पद, कौशल्य, जबाबदारी किंवा शिक्षणानुसार शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.94rem'
                  }}
                />
              </div>

              {/* Tier Filter */}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    background: '#FFFFFF',
                    fontSize: '0.94rem',
                    fontWeight: 600
                  }}>
                  <option value="all">📍 सर्व स्तर (All Tiers)</option>
                  {ADMINISTRATIVE_TIERS.map(t => (
                    <option key={t.id} value={t.id}>📍 {t.nameMr} ({t.nameEn})</option>
                  ))}
                </select>
              </div>

              {/* Active Filters Reset */}
              {(selectedWing !== 'all' || selectedTier !== 'all' || selectedBand !== 'all' || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedWing('all');
                    setSelectedTier('all');
                    setSelectedBand('all');
                    setSearchQuery('');
                  }}
                  style={{
                    background: '#FEE2E2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  ✕ फिल्टर्स रीसेट करा
                </button>
              )}
            </div>
          </div>

          {/* Roles Count & Summary */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1F2937', fontFamily: 'Baloo 2' }}>
              उपलब्ध संघटनात्मक पदे ({filteredRoles.length})
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
              प्रत्येक पदासाठी Gate 1 रेफरल्स + Gate 2 कौशल्ये + Gate 3 मुलाखत
            </span>
          </div>

          {/* Roles Grid */}
          {filteredRoles.length === 0 ? (
            <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '60px', textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
              <h3>कोणतेही पद आढळले नाही</h3>
              <p>कृपया वेगळे फिल्टर्स किंवा शोध शब्द वापरून पहा.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {filteredRoles.map(role => {
                const wing = DEPARTMENT_WINGS.find(w => w.id === role.department) || DEPARTMENT_WINGS[0];
                const tier = ADMINISTRATIVE_TIERS.find(t => t.id === role.tier) || ADMINISTRATIVE_TIERS[0];
                const band = REFERRAL_BANDS.find(b => b.range === role.band) || REFERRAL_BANDS[0];

                return (
                  <div
                    key={role.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                    }}>
                    <div>
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '1rem' }}>{wing.icon}</span>
                            <span style={{ fontSize: '0.74rem', color: wing.color, fontWeight: 800, textTransform: 'uppercase' }}>
                              {wing.nameMr}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.2rem', margin: '0 0 2px', color: '#1F2937', fontFamily: 'Baloo 2' }}>
                            {role.titleMr}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                            {role.title} · 📍 {tier.nameMr}
                          </span>
                        </div>

                        {/* Referral Badge */}
                        <div style={{
                          background: '#FFF7ED',
                          border: '1.5px solid #FDBA74',
                          color: '#C2410C',
                          padding: '6px 12px',
                          borderRadius: '10px',
                          textAlign: 'center',
                          minWidth: '90px'
                        }}>
                          <div style={{ fontSize: '1.15rem', fontWeight: 900, fontFamily: 'Baloo 2', lineHeight: 1 }}>
                            {role.referralThreshold.toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800 }}>थेट रेफरल्स</div>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.86rem', color: '#4B5563', lineHeight: 1.5, margin: '0 0 14px' }}>
                        {role.description}
                      </p>

                      {/* Competencies Preview */}
                      <div style={{ background: '#F8FAFC', borderRadius: '10px', padding: '10px 12px', marginBottom: '14px' }}>
                        <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 800, marginBottom: '6px' }}>
                          🧠 GATE 2 आवश्यक कौशल्ये ({role.gate2Competencies.length}):
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {role.gate2Competencies.slice(0, 3).map((comp, idx) => (
                            <span key={idx} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', color: '#334155' }}>
                              {comp}
                            </span>
                          ))}
                          {role.gate2Competencies.length > 3 && (
                            <span style={{ fontSize: '0.72rem', color: '#64748B', alignSelf: 'center' }}>
                              +{role.gate2Competencies.length - 3} आणखी
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Qualification & Reporting */}
                      <div style={{ fontSize: '0.78rem', color: '#6B7280', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '16px' }}>
                        <div>🎓 <strong>शिक्षण:</strong> {role.qualification}</div>
                        <div>💼 <strong>अनुभव:</strong> {role.minExperience}</div>
                        <div>👤 <strong>रिपोर्टिंग:</strong> {role.reportingTo}</div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedRoleModal(role)}
                        style={{
                          background: '#F3F4F6',
                          border: '1px solid #E5E7EB',
                          color: '#1F2937',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}>
                        📄 सविस्तर निकष
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApply(role)}
                        style={{
                          background: '#C73800',
                          border: 'none',
                          color: '#FFFFFF',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(199,56,0,0.18)'
                        }}>
                        🚩 उमेदवारी नोंदवा
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ================= SECTION 5: ROLE DETAIL MODAL ================= */}
        {selectedRoleModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
            backdropFilter: 'blur(3px)'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              position: 'relative'
            }}>
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedRoleModal(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#4B5563'
                }}>
                ✕
              </button>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ background: '#FFF3E0', color: '#C73800', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800 }}>
                  अधिकृत पद तपशील (Role Specification Sheet)
                </span>
                <h2 style={{ fontSize: '1.8rem', margin: '8px 0 2px', color: '#1F2937', fontFamily: 'Baloo 2' }}>
                  {selectedRoleModal.titleMr}
                </h2>
                <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                  {selectedRoleModal.title} · बँड: {selectedRoleModal.band}
                </div>
              </div>

              {/* 3 Gates Breakdown in Modal */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: '#FFF7ED', padding: '14px', borderRadius: '10px', border: '1px solid #FFEDD5' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 800 }}>GATE 1: रेफरल पात्रता</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#C73800', fontFamily: 'Baloo 2' }}>
                    {selectedRoleModal.referralThreshold.toLocaleString('en-IN')}+
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>थेट सत्यापित सभासद</div>
                </div>

                <div style={{ background: '#EFF6FF', padding: '14px', borderRadius: '10px', border: '1px solid #DBEAFE' }}>
                  <div style={{ fontSize: '0.75rem', color: '#1E40AF', fontWeight: 800 }}>GATE 2: कौशल्ये</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563EB', fontFamily: 'Baloo 2' }}>
                    {selectedRoleModal.gate2Competencies.length} निकष
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>तांत्रिक व नेतृत्व ज्ञान</div>
                </div>

                <div style={{ background: '#ECFDF5', padding: '14px', borderRadius: '10px', border: '1px solid #D1FAE5' }}>
                  <div style={{ fontSize: '0.75rem', color: '#065F46', fontWeight: 800 }}>GATE 3: निवड पद्धती</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669', fontFamily: 'Baloo 2' }}>
                    मुलाखत
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>पॅनल व पार्श्वभूमी तपासणी</div>
                </div>
              </div>

              {/* Competencies List */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1rem', color: '#1F2937', margin: '0 0 8px', fontWeight: 800 }}>
                  🧠 Gate 2: अनिवार्य कौशल्ये (Role Competencies):
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {selectedRoleModal.gate2Competencies.map((comp, idx) => (
                    <li key={idx}>{comp}</li>
                  ))}
                </ul>
              </div>

              {/* Responsibilities */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1rem', color: '#1F2937', margin: '0 0 8px', fontWeight: 800 }}>
                  📋 मुख्य जबाबदाऱ्या व कर्तव्ये (Responsibilities):
                </h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  {selectedRoleModal.responsibilities.map((resp, idx) => (
                    <li key={idx}>{resp}</li>
                  ))}
                </ul>
              </div>

              {/* Authority & Reporting */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                <div style={{ marginBottom: '8px', fontSize: '0.88rem' }}>
                  ⚖️ <strong>अधिकार क्षेत्र (Authority):</strong> {selectedRoleModal.authority}
                </div>
                <div style={{ marginBottom: '8px', fontSize: '0.88rem' }}>
                  👤 <strong>रिपोर्टिंग अधिकारी (Reporting To):</strong> {selectedRoleModal.reportingTo}
                </div>
                <div style={{ fontSize: '0.88rem' }}>
                  🎯 <strong>त्रैमासिक उद्दिष्टे (Key KPIs):</strong>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {selectedRoleModal.keyKPIs.map((kpi, idx) => (
                      <span key={idx} style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600 }}>
                        {kpi}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gate 3 Interview Info */}
              <div style={{ background: '#FFFBEB', padding: '14px 18px', borderRadius: '10px', border: '1px solid #FDE68A', marginBottom: '24px', fontSize: '0.86rem', color: '#92400E' }}>
                🎙️ <strong>मुलाखत व निवड प्रक्रिया:</strong> {selectedRoleModal.gate3Interview}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRoleModal(null)}
                  style={{
                    background: '#F3F4F6',
                    border: 'none',
                    color: '#4B5563',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  बंद करा
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleApply(selectedRoleModal);
                    setSelectedRoleModal(null);
                  }}
                  style={{
                    background: '#C73800',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(199,56,0,0.25)'
                  }}>
                  🚩 या पदासाठी अधिकृत उमेदवारी नोंदवा
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
