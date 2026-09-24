import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CRM_ROLES = [
  {
    id: 'super_admin',
    name: 'केंद्रीय सुपर ॲडमिन (Super Admin)',
    subtitle: 'सर्वोच्च प्रशासकीय व तांत्रिक नियंत्रण कक्ष',
    route: '/superadmin',
    icon: '👑',
    gradient: 'linear-gradient(135deg, #7c2d12, #c2410c)',
    accentColor: '#ea580c',
    badge: 'सर्वोच्च अधिकार (ALL ACCESS)',
    targetOfficial: 'केंद्रीय अध्यक्ष, मुख्य तंत्रज्ञान अधिकारी (CTO), केंद्रीय प्रशासन',
    scopeText: 'सर्व ३६ जिल्हे • ६ विभाग • संपूर्ण महाराष्ट्र व जागतिक शाखा',
    features: [
      '३६ जिल्ह्यांचे केंद्रीय 360° विश्लेषण व थेट मॉनिटरिंग',
      'तपशीलवार ७-फिल्टर महा-अहवाल केंद्र (7-Filter Macro Reports)',
      'Section 8 वित्तीय ऑडिट, वर्गणी लेजर व व्हाउचर मंजुरी',
      'व्यवस्थापक वापरकर्ते (Admin Users) व भूमिका वाटप',
      'डेटाबेस बॅकअप, सिस्टीम ऑडिट ट्रेल्स व DPDP २०२३ सुरक्षा'
    ],
    demoLogin: { role: 'superadmin', id: 'CM-SUPER-001', name: 'छत्रपती शासन सर्वोच्च प्रशासक' }
  },
  {
    id: 'ceo',
    name: 'कार्याध्यक्ष / राज्य अध्यक्ष (CEO Macro Dashboard)',
    subtitle: 'राज्यस्तरीय व्यवसाय व आर्थिक वृद्धी नियंत्रण कक्ष',
    route: '/crm/ceo',
    icon: '🦅',
    gradient: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
    accentColor: '#2563eb',
    badge: 'राज्य नेतृत्व (STATE EXECUTIVE)',
    targetOfficial: 'राज्य कार्याध्यक्ष, राज्य उद्योग परिषद अध्यक्ष, प्रदेशाध्यक्ष',
    scopeText: '६ महसूल विभाग • १८४+ व्यवसाय मंडळे • ₹ १८४+ कोटी टर्नओव्हर',
    features: [
      '₹ कोटी (Cr) मध्ये राज्यस्तरीय व्यवसाय वृद्धी व आर्थिक प्रवाह',
      'विभागनिहाय (पुणे, कोकण, मराठवाडा इ.) प्रगती आलेख',
      'अव्वल परफॉर्मिंग मंडळे, चॅप्टर रँकिंग्ज व ग्रेड्स (A+ Elite)',
      'मोठ्या B2B डील पाइपलाइन्स व सामंजस्य करार (MoUs)',
      'राज्यव्यापी वार्षिक, मासिक व साप्ताहिक धोरणात्मक अहवाल'
    ],
    demoLogin: { role: 'ceo', id: '9876500088', name: 'राजेश पाटील (CEO)' }
  },
  {
    id: 'district_admin',
    name: 'जिल्हा समन्वयक (District Coordinator CRM)',
    subtitle: 'जिल्हा प्रशासन, तालुका समन्वय व ओळखपत्र पडताळणी',
    route: '/crm/district',
    icon: '📍',
    gradient: 'linear-gradient(135deg, #0369a1, #0284c7)',
    accentColor: '#0284c7',
    badge: 'जिल्हा कक्ष (DISTRICT HEAD)',
    targetOfficial: 'जिल्हाध्यक्ष, जिल्हा संपर्क प्रमुख, जिल्हा सरचिटणीस',
    scopeText: 'जिल्ह्यातील सर्व तालुके • स्थानिक शाखा • तालुका समन्वयक',
    features: [
      'नवीन अर्जदार डिजिटल कार्ड पडताळणी (KYC Scrutiny Queue)',
      'तालुकानिहाय सदस्य संख्या व व्यवसाय नोंदणी सांख्यिकी',
      'जिल्ह्यातील सर्व व्यवसाय मंडळे व शाखांची प्रत्यक्ष स्थिती',
      'जिल्हा आपत्कालीन रक्तदाता नेटवर्क व स्वयंसेवक संपर्क',
      'स्थानिक तक्रार निवारण व साहाय्य विनंत्यांचा निपटारा'
    ],
    demoLogin: { role: 'district_admin', id: '9876500022', name: 'आनंदराव देशमुख (जिल्हा समन्वयक)' }
  },
  {
    id: 'chapter_president',
    name: 'चॅप्टर अध्यक्ष (Chapter President CRM)',
    subtitle: 'स्थानिक व्यवसाय मंडळ, साप्ताहिक संगम व रेफरल इंजिन',
    route: '/crm/chapter',
    icon: '💼',
    gradient: 'linear-gradient(135deg, #15803d, #16a34a)',
    accentColor: '#16a34a',
    badge: 'चॅप्टर नेतृत्व (CHAPTER B2B)',
    targetOfficial: 'स्थानिक व्यवसाय मंडळ अध्यक्ष, उपाध्यक्ष, सेक्रेटरी',
    scopeText: 'स्थानिक चॅप्टर (उदा. पुणे शिवनेरी, मुंबई दादर, PCMC औद्योगिक)',
    features: [
      'साप्ताहिक बैठकींचे हजेरी व्यवस्थापन (Attendance Matrix)',
      'रेफरल स्लिप्स (TYFCB - Thank You For Closed Business) नोंदणी',
      'सदस्यांमधील १-ते-१ व्यावसायिक भेटींचे ट्रॅकिंग',
      'चॅप्टर अंतर्गत देवाणघेवाण झालेला प्रत्यक्ष व्यवसाय (₹ कोटी)',
      'नवीन व्यवसाय संधी घोषणा व आगामी बैठकींची माहिती'
    ],
    demoLogin: { role: 'chapter_president', id: '9876500033', name: 'राजेंद्र मोहिते (चॅप्टर अध्यक्ष)' }
  },
  {
    id: 'seva_head',
    name: 'समाज साहाय्यता कक्ष (Seva Helpdesk CRM)',
    subtitle: '२४x७ आपत्कालीन रक्तपेढी, रुग्ण साहाय्य व शिष्यवृत्ती',
    route: '/crm/helpdesk',
    icon: '🩺',
    gradient: 'linear-gradient(135deg, #991b1b, #dc2626)',
    accentColor: '#dc2626',
    badge: '२४x७ सेवा (EMERGENCY SEVA)',
    targetOfficial: 'सेवा विभाग प्रमुख, आरोग्य समन्वयक, शिक्षण साहाय्य समिती',
    scopeText: 'राज्यव्यापी २४x७ आपत्कालीन साहाय्य • सर्व रुग्णालय समन्वय',
    features: [
      '२४x७ आपत्कालीन रक्त विनंत्या (२ तासात / ६ तासात तात्काळ कृती)',
      'दुर्मीळ रक्तगट (O-, AB- इ.) स्वयंसेवक शोध व त्वरित नियुक्ती',
      'होतकरू विद्यार्थ्यांच्या उच्च शिक्षण शिष्यवृत्ती अर्जांची छाननी',
      'रुग्णालय बेड, ॲम्ब्युलन्स व वैद्यकीय साहाय्य समन्वय',
      'सेवा स्वयंसेवक पथक संपर्क व तातडीचा मेसेज ब्रॉडकास्ट'
    ],
    demoLogin: { role: 'seva_helpdesk', id: '9876500044', name: 'सुभाषराव मोरे (सेवा समन्वयक)' }
  },
  {
    id: 'finance_officer',
    name: 'वित्त व तिजोरी लेजर (Finance & 80G CRM)',
    subtitle: 'Section 8 वित्तीय ऑडिट, 80G पावत्या व खर्च मंजुरी',
    route: '/crm/finance',
    icon: '💰',
    gradient: 'linear-gradient(135deg, #0f766e, #0d9488)',
    accentColor: '#0d9488',
    badge: 'वित्तीय नियामक (TREASURY)',
    targetOfficial: 'केंद्रीय कोषाध्यक्ष, वित्त सचिव, सीए ऑडिट पथक',
    scopeText: 'सर्व महसूल नोंदी • 80G आयकर पावत्या • सदस्य वर्गणी लेजर',
    features: [
      '80G आयकर सवलत देणगी पावत्या निर्मिती व पडताळणी',
      'सदस्यत्व वर्गणी निधी (Gold, Platinum, Royal Patron) संकलन',
      'खर्च व्हाउचर मंजुरी व निधी वाटप नियंत्रण',
      'Section 8 कंपनी वार्षिक वित्तीय ताळेबंद व ऑडिट अहवाल',
      'बँक व्यवहार, राखीव शिल्लक व सीएसआर निधी समन्वय'
    ],
    demoLogin: { role: 'finance_officer', id: '9876500055', name: 'महेश शिंदे (कोषाध्यक्ष)' }
  },
  {
    id: 'member',
    name: 'वैयक्तिक सदस्य डॅशबोर्ड (Member Portal)',
    subtitle: 'डिजिटल ओळखपत्र, व्यवसाय संदर्भ व प्रोफाइल व्यवस्थापन',
    route: '/dashboard',
    icon: '👤',
    gradient: 'linear-gradient(135deg, #4338ca, #6366f1)',
    accentColor: '#6366f1',
    badge: 'सदस्य कक्ष (MEMBER)',
    targetOfficial: 'नोंदणीकृत मराठा महासंघ सदस्य व व्यावसायिक',
    scopeText: 'वैयक्तिक प्रोफाइल • डिजिटल कार्ड • स्थानिक चॅप्टर',
    features: [
      'राजमुद्रा प्रमाणित डिजिटल सदस्य ओळखपत्र डाउनलोड',
      'B2B व्यावसायिक रेफरल स्लिप्स देणे व स्वीकारणे',
      'समुदाय पोस्ट्स, रक्तदान विनंत्या व कार्यक्रम सहभाग',
      'वैयक्तिक संपर्क माहिती, रक्तगट व गोपनीयता सेटिंग्ज'
    ],
    demoLogin: { role: 'member', id: 'CM-96K-1001', name: 'अमोल जाधव (सदस्य)' }
  }
];

export default function CRMRoleHubPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [switchingRole, setSwitchingRole] = useState(null);

  const handleQuickDemoSwitch = (roleConfig) => {
    setSwitchingRole(roleConfig.id);
    const demo = roleConfig.demoLogin;
    
    // Perform demo login with custom role profile
    const roleUser = {
      name: demo.name,
      id: demo.id,
      role: demo.role,
      tier: 'Gold',
      district: 'पुणे',
      city: 'पुणे',
      profession: 'प्रशासकीय अधिकारी'
    };

    setTimeout(() => {
      login(demo.id, 'maratha1674', roleUser);
      setSwitchingRole(null);
      navigate(roleConfig.route);
    }, 300);
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: '100vh', padding: '32px 16px 64px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Breadcrumb & Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '0.85rem', color: '#78350f', fontWeight: 700 }}>
            <Link to="/" style={{ color: '#c2410c', textDecoration: 'none' }}>मुख्य पोर्टल</Link> ➔ <span style={{ color: '#431407' }}>CRM भूमिका नियंत्रण व्यवस्था</span>
          </div>

          {user && (
            <div style={{
              background: '#FFFFFF',
              border: '1.5px solid #fed7aa',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              color: '#9a3412',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}>
              <span>👤 सक्रिय लॉगिन:</span>
              <strong style={{ color: '#c2410c' }}>{user.name}</strong>
              <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem' }}>
                {user.role || 'Member'}
              </span>
            </div>
          )}
        </div>

        {/* Hero Section Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #9a3412 100%)',
          borderRadius: '20px',
          padding: '36px 32px',
          color: '#FFFFFF',
          boxShadow: '0 12px 32px rgba(67, 20, 7, 0.25)',
          marginBottom: '36px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            right: '-20px',
            top: '-30px',
            fontSize: '12rem',
            opacity: 0.08,
            userSelect: 'none',
            pointerEvents: 'none'
          }}>
            🚩
          </div>

          <div style={{ maxWidth: '820px', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '4px 14px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#FDE047',
              marginBottom: '12px'
            }}>
              ⚖️ CONNECT MARATHA — ROLE-BASED DEDICATED CRM
            </div>

            <h1 style={{
              fontSize: '2.4rem',
              margin: '0 0 12px',
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 800,
              lineHeight: 1.25,
              textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              प्रत्येक भूमिकेसाठी स्वतंत्र व सुरक्षित डॅशबोर्ड
            </h1>

            <p style={{
              fontSize: '1.05rem',
              lineHeight: 1.6,
              color: '#FFEDD5',
              margin: '0 0 20px',
              fontWeight: 500
            }}>
              Connect Maratha च्या पारदर्शक कारभारासाठी प्रत्येक पदाधिकाऱ्याला त्यांच्या कार्यक्षेत्रानुसार 
              <strong> पूर्णतः स्वतंत्र नियंत्रण कक्ष (Dedicated Dashboard)</strong> उपलब्ध करून देण्यात आला आहे. कोणतीही सामायिक (shared) किंवा मिश्र व्यवस्था नसून, अधिकारानुसार थेट व सुरक्षित प्रवेश मिळतो.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.15)' }}>
                🛡️ <strong>५ स्वतंत्र नियंत्रण कक्ष</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.15)' }}>
                🔒 <strong>भूमिका-विशिष्ट डेटा सुरक्षा</strong>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '8px 16px', borderRadius: '10px', fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.15)' }}>
                ⚡ <strong>थेट १-क्लिक चाचणी प्रवेश</strong>
              </div>
            </div>
          </div>
        </div>

        {/* The 5 Dedicated Role Cards Grid */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '1.4rem',
            color: '#431407',
            fontFamily: 'Baloo 2',
            fontWeight: 800,
            marginBottom: '6px'
          }}>
            📋 अधिकृत भूमिका निवडा (Select Your Specific CRM Dashboard)
          </h2>
          <p style={{ color: '#78350f', fontSize: '0.88rem', margin: '0 0 24px' }}>
            खालीलपैकी आपल्या अधिकृत पदाच्या डॅशबोर्डवर क्लिक करा किंवा चाचणीसाठी डेमो बटणाचा वापर करा:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {CRM_ROLES.map((role) => (
              <div
                key={role.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1.5px solid #fed7aa',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Header Banner */}
                <div style={{
                  background: role.gradient,
                  padding: '20px 22px',
                  color: '#FFFFFF'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: 'rgba(255,255,255,0.2)',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      letterSpacing: '0.04em'
                    }}>
                      {role.badge}
                    </span>
                    <span style={{ fontSize: '1.8rem' }}>{role.icon}</span>
                  </div>

                  <h3 style={{
                    fontSize: '1.25rem',
                    margin: '0 0 4px',
                    fontFamily: 'Baloo 2',
                    fontWeight: 800,
                    color: '#FFFFFF'
                  }}>
                    {role.name}
                  </h3>
                  <div style={{ fontSize: '0.80rem', opacity: 0.9, lineHeight: 1.4 }}>
                    {role.subtitle}
                  </div>
                </div>

                {/* Scope & Officials Info */}
                <div style={{ padding: '16px 22px', background: '#fff7ed', borderBottom: '1px solid #ffedd5', fontSize: '0.82rem' }}>
                  <div style={{ marginBottom: '6px', color: '#9a3412' }}>
                    <strong>🎯 कार्यक्षेत्र:</strong> {role.scopeText}
                  </div>
                  <div style={{ color: '#7c2d12' }}>
                    <strong>👔 पद / अधिकारी:</strong> {role.targetOfficial}
                  </div>
                </div>

                {/* Core Features List */}
                <div style={{ padding: '20px 22px', flexGrow: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9a3412', textTransform: 'uppercase', marginBottom: '10px' }}>
                    प्रमुख अधिकार व सुविधा (Dedicated Features):
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#374151', lineHeight: 1.7 }}>
                    {role.features.map((feat, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action Buttons */}
                <div style={{
                  padding: '16px 22px',
                  background: '#FFFFFF',
                  borderTop: '1px solid #f3f4f6',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center'
                }}>
                  <Link
                    to={role.route}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '11px 16px',
                      borderRadius: '8px',
                      background: role.accentColor,
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      fontFamily: 'Baloo 2',
                      fontWeight: 800,
                      fontSize: '0.94rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      transition: 'opacity 0.2s'
                    }}
                  >
                    स्वतंत्र डॅशबोर्ड उघडा ➔
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoSwitch(role)}
                    disabled={switchingRole === role.id}
                    title="या भूमिकेने डेमो लॉगिन करून डॅशबोर्ड उघडा"
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #fdba74',
                      background: '#fff7ed',
                      color: '#c2410c',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {switchingRole === role.id ? 'प्रवेश...' : '⚡ चाचणी'}
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Role Eligibility Matrix Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
          borderRadius: '16px',
          border: '1.5px solid #FDBA74',
          padding: '24px 28px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 14px rgba(194,65,12,0.08)'
        }}>
          <div>
            <span style={{ background: '#C2410C', color: '#FFF', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800 }}>
              नवे पात्रता मॉडेल (ROLE ELIGIBILITY SYSTEM)
            </span>
            <h3 style={{ margin: '8px 0 4px', fontSize: '1.3rem', color: '#9A3412', fontFamily: 'Baloo 2' }}>
              ⚖️ १००+ संघटनात्मक पदे, ९ रेफरल बँड्स व ३-गेट्स निवड चौकट
            </h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#431407', maxWidth: '65ch', lineHeight: 1.5 }}>
              प्रत्येक पदासाठी स्वतंत्र थेट रेफरल थ्रेशोल्ड (१०० ते १,००,०००+), पदनिहाय Gate 2 कौशल्ये आणि Gate 3 मुलाखत व निवड प्रक्रियेचे संपूर्ण तपशील.
            </p>
          </div>
          <Link
            to="/roles-matrix"
            style={{
              background: '#C73800',
              color: '#FFFFFF',
              padding: '12px 22px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.92rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(199,56,0,0.25)',
              whiteSpace: 'nowrap'
            }}>
            पात्रता मॅट्रिक्स उघडा ➔
          </Link>
        </div>

        {/* Security & Access Isolation Note */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #BBF7D0',
          padding: '20px 24px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}>
          <span style={{ fontSize: '2rem' }}>🔒</span>
          <div>
            <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#166534', fontFamily: 'Baloo 2' }}>
              कडक भूमिका विलगीकरण व डेटा गोपनीयता (Strict Role Isolation & Data Privacy)
            </h4>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#14532d', lineHeight: 1.5 }}>
              प्रत्येक डॅशबोर्ड स्वतंत्र घटकांवर (isolated modular architecture) आधारित आहे. चॅप्टर अध्यक्षांना केवळ त्यांच्या स्थानिक चॅप्टरचा डेटा, जिल्हा समन्वयकांना त्यांच्या संबंधित जिल्ह्याचा डेटा, तर सेवा समन्वयकांना केवळ साहाय्य विनंत्यांचा डेटा दिसतो. सर्वोच्च केंद्रीय नियंत्रणाचा अधिकार केवळ केंद्रीय सुपर ॲडमिनकडे सुरक्षित आहे.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
