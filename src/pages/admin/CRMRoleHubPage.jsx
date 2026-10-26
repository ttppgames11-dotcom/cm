import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const CRM_ROLES = [
  {
    id: 'super_admin',
    name: 'केंद्रीय सुपर ॲडमिन (Super Admin)',
    subtitle: 'सर्वोच्च प्रशासकीय व तांत्रिक नियंत्रण कक्ष',
    route: '/admin',
    icon: '👑',
    gradient: 'linear-gradient(135deg, #7c2d12, #c2410c)',
    accentColor: '#ea580c',
    badge: 'सर्वोच्च अधिकार (ALL ACCESS)',
    targetOfficial: 'केंद्रीय अध्यक्ष, मुख्य तंत्रज्ञान अधिकारी (CTO), केंद्रीय प्रशासन',
    scopeText: 'सर्व राज्ये • ३६ जिल्हे • संपूर्ण भारत व जागतिक शाखा',
    features: [
      'मल्टिपल स्टेट्स व सर्व युनिट्सचे ३६०° थेट संनियंत्रण',
      'तपशीलवार ७-फिल्टर महा-अहवाल केंद्र (7-Filter Macro Reports)',
      'Section 8 वित्तीय ऑडिट, वर्गणी लेजर व व्हाउचर मंजुरी',
      'व्यवस्थापक वापरकर्ते (Admin Users) व भूमिका वाटप'
    ],
    demoLogin: { role: 'superadmin', id: '9876500011', name: 'प्रशासक अमोल जाधव' }
  },
  {
    id: 'pradesh_admin',
    name: 'राज्य परिषद / प्रदेशाध्यक्ष (State Command CRM)',
    subtitle: 'मल्टिपल स्टेट्स, ६ विभाग, राज्य सचिवालय व आदेश कक्ष',
    route: '/crm/pradesh',
    icon: '🚩',
    gradient: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    accentColor: '#6366f1',
    badge: 'राज्य नेतृत्व (STATE APEX)',
    targetOfficial: 'राज्य अध्यक्ष (Owner) / राज्य सचिवालय व्यवस्थापक (Manager)',
    scopeText: 'महाराष्ट्र, कर्नाटक, गोवा, गुजरात इ. सर्व राज्ये • ३६ जिल्हे',
    features: [
      'डायनॅमिक मल्टिपल स्टेट्स (नवीन राज्य जोडण्याची सुविधा)',
      '👑 Owner View vs 📋 Manager View स्वतंत्र कार्यपद्धती',
      'राज्यस्तरीय धोरणात्मक परिपत्रके व थेट आदेश जारी करणे',
      'राज्यस्तरीय एस्केलेशन्स व १२ मंत्रालयीन विभाग समन्वय'
    ],
    demoLogin: { role: 'state_admin', id: '9876500077', name: 'श्री. प्रतापराव पवार (प्रदेशाध्यक्ष)' }
  },
  {
    id: 'division_admin',
    name: 'विभागीय अध्यक्ष (Division Command CRM)',
    subtitle: 'महसूल विभाग, आंतर-जिल्हा समन्वय व क्षेत्रीय नेतृत्व',
    route: '/crm/division',
    icon: '🟣',
    gradient: 'linear-gradient(135deg, #581c87, #7e22ce)',
    accentColor: '#a855f7',
    badge: 'विभागीय कक्ष (DIVISION HEAD)',
    targetOfficial: 'विभागीय अध्यक्ष (Owner) / विभागीय व्यवस्थापक (Manager)',
    scopeText: 'पुणे, कोकण, नाशिक, छ. संभाजीनगर, अमरावती, नागपूर विभाग',
    features: [
      '५ ते ७ जिल्ह्यांचे एकत्रित संनियंत्रण व उद्दिष्ट पूर्तता आढावा',
      'विभागीय कम्युनिटी सेंटर्स व नेतृत्व फळी बैठक व्यवस्थापन',
      'विभागीय नोटीस व परिपत्रके थेट जिल्ह्यांना पाठवणे',
      'जिल्ह्यांची प्रगती तुलना व समस्या निवारण कक्ष'
    ],
    demoLogin: { role: 'division_admin', id: '9876500066', name: 'श्री. बाळासाहेब थोरात (विभागीय अध्यक्ष)' }
  },
  {
    id: 'district_admin',
    name: 'जिल्हा समन्वयक (District Coordinator CRM)',
    subtitle: 'जिल्हा प्रशासन, तालुका समन्वय व थेट ओळखपत्र पडताळणी',
    route: '/crm/district',
    icon: '🔵',
    gradient: 'linear-gradient(135deg, #0369a1, #0284c7)',
    accentColor: '#0284c7',
    badge: 'जिल्हा कक्ष (DISTRICT HEAD)',
    targetOfficial: 'जिल्हाध्यक्ष (Owner) / जिल्हा सरचिटणीस (Manager)',
    scopeText: 'जिल्ह्यातील सर्व तालुके • स्थानिक शाखा • तालुका समन्वयक',
    features: [
      'नवीन अर्जदार डिजिटल कार्ड पडताळणी (KYC Scrutiny Queue)',
      'तालुकानिहाय सदस्य संख्या व व्यवसाय नोंदणी सांख्यिकी',
      'जिल्ह्यातील सर्व व्यवसाय मंडळे व शाखांची प्रत्यक्ष स्थिती',
      'स्थानिक तक्रार निवारण व साहाय्य विनंत्यांचा निपटारा'
    ],
    demoLogin: { role: 'district_admin', id: '9876500022', name: 'आनंदराव देशमुख (जिल्हा समन्वयक)' }
  },
  {
    id: 'taluka_admin',
    name: 'तालुकाध्यक्ष (Taluka Operational CRM)',
    subtitle: 'तालुका मध्यवर्ती कक्ष, शाखा सनियंत्रण व सदस्य जोडणी',
    route: '/crm/taluka',
    icon: '🟢',
    gradient: 'linear-gradient(135deg, #14532d, #16a34a)',
    accentColor: '#22c55e',
    badge: 'तालुका कक्ष (TALUKA HEAD)',
    targetOfficial: 'तालुकाध्यक्ष (Owner) / तालुका समन्वयक (Manager)',
    scopeText: 'तालुक्यातील सर्व गावे, प्रभाग व स्थानिक शाखा',
    features: [
      'तालुक्यातील सर्व शाखा व कम्युनिटी केंद्रांचे थेट संनियंत्रण',
      'तालुकास्तरीय व्यवसाय व शेतकरी उत्पादक गट नोंदणी',
      'स्थानिक २४x७ आपत्कालीन रक्तदाता साहाय्य नेटवर्क',
      'गावपातळीवरील सदस्य नोंदणी व KYC मंजुरी'
    ],
    demoLogin: { role: 'taluka_admin', id: '9876500055', name: 'श्री. संभाजी जगताप (तालुकाध्यक्ष)' }
  },
  {
    id: 'branch_admin',
    name: 'शाखाध्यक्ष (Grassroots Branch CRM)',
    subtitle: 'स्थानिक गाव/शहर शाखा, मल्टिपल शाखा नेटवर्क व बैठका',
    route: '/crm/branch',
    icon: '🔴',
    gradient: 'linear-gradient(135deg, #701a75, #a21caf)',
    accentColor: '#c026d3',
    badge: 'स्थानिक शाखा (SHAKHA HEAD)',
    targetOfficial: 'शाखाध्यक्ष (Owner) / शाखा सचिव व व्यवस्थापक (Manager)',
    scopeText: 'स्थानिक प्रभाग, वॉर्ड, गाव किंवा एकाच तालुक्यातील मल्टिपल शाखा',
    features: [
      'एकाच तालुक्यात मल्टिपल शाखा तयार करणे (Add Multiple Branches)',
      '👑 Owner View vs 📋 Manager View स्वतंत्र कार्यप्रवाह',
      'शाखेतील सदस्य व कुटुंबांची थेट यादी व संपर्क',
      'स्थानिक बैठक इतिवृत्त (Meeting MOM) नोंदणी व कृती अहवाल'
    ],
    demoLogin: { role: 'branch_admin', id: '9876500033', name: 'श्री. विजय कदम (शाखाध्यक्ष)' }
  },
  {
    id: 'community_center',
    name: 'कम्युनिटी सेंटर व्यवस्थापक (Community Center CRM)',
    subtitle: 'भौतिक केंद्र, १२ वार्षिक उपक्रम, फ्रंट डेस्क व महसूल',
    route: '/crm/center',
    icon: '🏢',
    gradient: 'linear-gradient(135deg, #9a3412, #ea580c)',
    accentColor: '#f97316',
    badge: 'केंद्र व्यवस्थापन (CENTER OPS)',
    targetOfficial: 'केंद्र संचालक (Owner) / केंद्र व्यवस्थापक (Manager)',
    scopeText: 'कम्युनिटी सेंटर इमारत, सभागृह, वाचनालय व मदत कक्ष',
    features: [
      'वार्षिक १२ अनिवार्य उपक्रम (आरोग्य, रक्तदान, मेळावे इ.) प्रगती',
      'अभ्यागत नोंदणी (Visitor Intake) व सदस्य चौकशी',
      'हॉल व रिसॉर्ट बुकिंग, ऑफलाईन पावत्या व वर्गणी लेजर',
      'केंद्रातील कर्मचारी व डेस्क व्यवस्थापक (Counselor, Cashier)'
    ],
    demoLogin: { role: 'center_manager', id: '9876500099', name: 'श्री. महेश पाटील (केंद्र व्यवस्थापक)' }
  },
  {
    id: 'unified_ops',
    name: 'युनिफाइड ऑपरेशन्स (12 Golden Rules Engine)',
    subtitle: 'एकच मास्टर डेटाबेस → बहुस्तरीय शासन व प्रगती',
    route: '/crm/operations',
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #0f172a, #334155)',
    accentColor: '#e2e8f0',
    badge: 'शासन व नियम (GOVERNANCE)',
    targetOfficial: 'सर्व स्तरांतील पदाधिकारी व पर्यवेक्षक',
    scopeText: 'राज्य ➔ विभाग ➔ जिल्हा ➔ तालुका ➔ शाखा संपूर्ण साखळी',
    features: [
      '१२ सुवर्ण नियमांनुसार वर्क-क्यू (Work Queue) व अपवाद (Exceptions)',
      'एकाच डॅशबोर्डवरून सर्व स्तरांचे थेट स्विचिंग व विहंगावलोकन',
      'तिकीट व समस्या ट्रॅकिंग सिस्टीम (SLA आधारित निपटारा)',
      'अधीनस्थ युनिट्सची थेट प्रगती तुलना'
    ],
    demoLogin: { role: 'admin', id: '9876500000', name: 'पर्यवेक्षक अधिकारी' }
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
    scopeText: 'सर्व राज्ये • १८४+ व्यवसाय मंडळे • ₹ १८४+ कोटी टर्नओव्हर',
    features: [
      '₹ कोटी (Cr) मध्ये राज्यस्तरीय व्यवसाय वृद्धी व आर्थिक प्रवाह',
      'अव्वल परफॉर्मिंग मंडळे, चॅप्टर रँकिंग्ज व ग्रेड्स (A+ Elite)',
      'मोठ्या B2B डील पाइपलाइन्स व सामंजस्य करार (MoUs)',
      'धोरणात्मक अहवाल व केंद्रीय MIS संकलन'
    ],
    demoLogin: { role: 'ceo', id: '9876500088', name: 'राजेश पाटील (CEO)' }
  },
  {
    id: 'maha_events_crm',
    name: '१५ महा-उपक्रम व्यवस्थापन (15 Maha-Events CRM)',
    subtitle: 'जॉब फेयर, रक्तदान, वधू-वर मेळावा, B2B एक्स्पो, शेतकरी मेळावा इ.',
    route: '/crm/events',
    icon: '🎪',
    gradient: 'linear-gradient(135deg, #7c2d12, #ea580c)',
    accentColor: '#ea580c',
    badge: '१५ महा-उपक्रम (15 MAHA-EVENTS)',
    targetOfficial: 'केंद्रीय व जिल्हा इव्हेंट समन्वय समिती, सर्व स्तर',
    scopeText: 'वार्षिक १५ नियोजित महा-उपक्रम • प्रस्ताव • मंजुरी • अहवाल',
    features: [
      '१५ महा-उपक्रमांचे नियोजन, प्रस्ताव ते अंतिम अहवाल वर्कफ्लो',
      'प्रत्येक उपक्रमासाठी विशेष फॉर्म्स व KPI उद्दिष्टे',
      'सहभागी डिजिटल नोंदणी, पासेस व QR चेक-इन ट्रॅकिंग',
      'कर्मचारी कार्य नियोजन (Task Matrix) व बजेट मंजुरी'
    ],
    demoLogin: { role: 'superadmin', id: '9876500011', name: 'इव्हेंट संचालक (SuperAdmin)' }
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
            to="/crm"
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
            CRM प्रणाली उघडा ➔
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
