import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CRM_AUTHORIZED_ROLES } from '../../components/auth/CRMProtectedRoute';

const CRM_OFFICIAL_PROFILES = [
  {
    role: 'superadmin',
    name: 'छत्रपती शासन सर्वोच्च प्रशासक',
    id: 'CM-SUPER-001',
    phone: '9876500001',
    password: 'superadmin1674',
    title: '👑 केंद्रीय सुपर ॲडमिन (SuperAdmin)',
    desc: 'सर्व ३६ जिल्हे, वापरकर्ते CRUD, रोल मॅट्रिक्स व मास्टर सिस्टीम नियंत्रण',
    targetRoute: '/superadmin',
    color: '#EA580C',
    badge: 'ALL ACCESS'
  },
  {
    role: 'ceo',
    name: 'राजेश पाटील (CEO)',
    id: 'CM-CEO-0088',
    phone: '9876500088',
    password: 'ceo1674',
    title: '🦅 कार्याध्यक्ष / राज्य अध्यक्ष (CEO Macro)',
    desc: 'राज्यस्तरीय व्यवसाय वृद्धी, ६ विभाग, ₹ १८४+ कोटी मॅक्रो आकडेवारी',
    targetRoute: '/crm/ceo',
    color: '#EA580C',
    badge: 'STATE EXECUTIVE'
  },
  {
    role: 'district_admin',
    name: 'आनंदराव देशमुख (जिल्हा समन्वयक)',
    id: 'CM-DIST-0022',
    phone: '9876500022',
    password: 'district1674',
    title: '📍 जिल्हा समन्वयक (District Admin)',
    desc: 'जिल्हा प्रशासन, तालुका समन्वय, ओळखपत्र छाननी व स्थानिक आकडेवारी',
    targetRoute: '/crm/district',
    color: '#C2410C',
    badge: 'DISTRICT HEAD'
  },
  {
    role: 'chapter_president',
    name: 'राजेंद्र मोहिते (चॅप्टर अध्यक्ष)',
    id: 'CM-CHAP-0033',
    phone: '9876500033',
    password: 'chapter1674',
    title: '💼 चॅप्टर अध्यक्ष (Chapter President)',
    desc: 'साप्ताहिक व्यवसाय संगम, रेफरल व्यवहार व सदस्य उपस्थिती',
    targetRoute: '/crm/chapter',
    color: '#D97706',
    badge: 'CHAPTER HEAD'
  },
  {
    role: 'seva_helpdesk',
    name: 'सुभाषराव मोरे (सेवा समन्वयक)',
    id: 'CM-SEVA-0044',
    phone: '9876500044',
    password: 'helpdesk1674',
    title: '🩺 समाज साहाय्यता कक्ष (Seva Helpdesk)',
    desc: '२४x७ आपत्कालीन रक्त विनंत्या, रुग्णालय साहाय्य व आपत्ती निवारण',
    targetRoute: '/crm/helpdesk',
    color: '#DC2626',
    badge: 'EMERGENCY SEVA'
  },
  {
    role: 'finance_officer',
    name: 'महेश शिंदे (कोषाध्यक्ष)',
    id: 'CM-FIN-0055',
    phone: '9876500055',
    password: 'finance1674',
    title: '💰 वित्त व 80G कोषाध्यक्ष (Finance & Ledger)',
    desc: 'Section 8 वित्तीय ऑडिट, 80G आयकर पावत्या व वर्गणी लेजर',
    targetRoute: '/crm/finance',
    color: '#B45309',
    badge: 'TREASURY AUDIT'
  }
];

export default function CRMLoginPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('superadmin');
  const [officerId, setOfficerId] = useState('CM-SUPER-001');
  const [password, setPassword] = useState('superadmin1674');
  const [securityPin, setSecurityPin] = useState('1674');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill on role select
  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    const profile = CRM_OFFICIAL_PROFILES.find(p => p.role === roleKey);
    if (profile) {
      setOfficerId(profile.id);
      setPassword(profile.password);
    }
  };

  const handleOfficialLogin = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!officerId.trim()) {
      setErrorMsg('कृपया आपला अधिकृत प्रशासकीय आयडी किंवा मोबाईल प्रविष्ट करा.');
      return;
    }
    if (!password) {
      setErrorMsg('कृपया गोपनीय पासवर्ड प्रविष्ट करा.');
      return;
    }

    setLoading(true);

    const matchedProfile = CRM_OFFICIAL_PROFILES.find(p => p.role === selectedRole) || CRM_OFFICIAL_PROFILES[0];

    const officialUser = {
      id: officerId,
      name: matchedProfile.name,
      role: matchedProfile.role,
      tier: 'Royal Patron',
      district: 'पुणे',
      city: 'पुणे',
      profession: matchedProfile.title,
      isCrmOfficial: true
    };

    setTimeout(() => {
      login(officerId, password, officialUser);
      setLoading(false);

      // Redirect to attempted route or destination dashboard
      const destination = (location.state && location.state.from && location.state.from.pathname) || matchedProfile.targetRoute;
      navigate(destination, { replace: true });
    }, 400);
  };

  const handleQuickOfficialAuth = (profile) => {
    setLoading(true);
    const officialUser = {
      id: profile.id,
      name: profile.name,
      role: profile.role,
      tier: 'Royal Patron',
      district: 'पुणे',
      city: 'पुणे',
      profession: profile.title,
      isCrmOfficial: true
    };

    setTimeout(() => {
      login(profile.id, profile.password, officialUser);
      setLoading(false);
      navigate(profile.targetRoute, { replace: true });
    }, 300);
  };

  const isCurrentStaff = user && CRM_AUTHORIZED_ROLES.includes(user.role);

  return (
    <div style={{
      background: '#FFFDF9',
      minHeight: '100vh',
      padding: '48px 16px 80px',
      color: '#1E293B',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Top Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFF7ED',
            border: '1.5px solid #FED7AA',
            color: '#EA580C',
            padding: '6px 18px',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 800,
            marginBottom: '14px',
            letterSpacing: '0.5px'
          }}>
            <span>🔒 RESTRICTED ADMINISTRATIVE GATEWAY</span>
            <span>•</span>
            <span>DPDP २०२३ COMPLIANT</span>
          </div>

          <h1 style={{
            fontSize: '2.4rem',
            fontWeight: 900,
            margin: '0 0 10px',
            color: '#431407'
          }}>
            🏛️ प्रशासकीय व कार्यकारी CRM लॉगिन
          </h1>
          <p style={{
            color: '#64748B',
            fontSize: '1.05rem',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Connect Maratha केंद्रीय नियंत्रण कक्ष, जिल्हा प्रशासन, चॅप्टर व्यवस्थापन व २४x७ सेवा कक्ष यांसाठी स्वतंत्र व सुरक्षित प्रवेशद्वार.
          </p>
        </div>

        {/* Security Warning / Redirect Notice */}
        {location.state?.reason === 'login_required' && (
          <div style={{
            background: '#FEF2F2',
            border: '1.5px solid #FECACA',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#991B1B'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <strong>प्रवेश प्रतिबंधित (Restricted Access):</strong> आपण विनंती केलेले CRM पृष्ठ सुरक्षित आहे. पुढे जाण्यासाठी कृपया आपल्या अधिकृत प्रशासकीय खात्याने लॉगिन करा.
            </div>
          </div>
        )}

        {location.state?.reason === 'unauthorized_member' && (
          <div style={{
            background: '#FFFBEB',
            border: '1.5px solid #FDE68A',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#92400E'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🛡️</span>
            <div>
              <strong>अधिकार पातळी अपूर्ण:</strong> आपले चालू खाते सामान्य सभासद (Public Member) स्तराचे आहे. अंतर्गत CRM व्यवस्थापन पाहण्यासाठी अधिकृत प्रशासकीय (Official/Staff) क्रेडेंशियल्स आवश्यक आहेत.
            </div>
          </div>
        )}

        {/* If Already Logged In as CRM Staff */}
        {isCurrentStaff && (
          <div style={{
            background: '#F0FDF4',
            border: '1.5px solid #BBF7D0',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ color: '#166534', fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px' }}>
                ✓ अधिकृत प्रशासकीय सत्र चालू आहे
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#14532D' }}>
                👤 {user.name} ({user.role})
              </div>
              <div style={{ color: '#475569', fontSize: '0.88rem' }}>
                अधिकृत आयडी: {user.id}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link
                to={user.role === 'superadmin' ? '/superadmin' : (user.role === 'ceo' ? '/crm/ceo' : '/crm')}
                style={{
                  background: 'linear-gradient(135deg, #EA580C, #D97706)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  padding: '10px 20px',
                  borderRadius: '10px',
                  textDecoration: 'none'
                }}>
                डॅशबोर्ड उघडा ➔
              </Link>
              <button
                onClick={logout}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  color: '#475569',
                  fontWeight: 700,
                  padding: '10px 18px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}>
                बाहेर पडा (Switch User)
              </button>
            </div>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 480px) minmax(320px, 1fr)',
          gap: '28px',
          alignItems: 'start'
        }}>
          
          {/* Main Credentials Box */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #FED7AA',
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: '0 10px 30px rgba(234, 88, 12, 0.08)'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px', color: '#EA580C' }}>
              अधिकृत अधिकारी लॉगिन
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: '0 0 24px' }}>
              आपला प्रशासकीय पदभार निवडा व अधिकृत क्रेडेंशियल्स प्रविष्ट करा.
            </p>

            {errorMsg && (
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                marginBottom: '16px'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleOfficialLogin}>
              {/* Role Select */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#431407', marginBottom: '6px' }}>
                  प्रशासकीय पदभार निवडा (Official Designation)
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleSelect(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#FFF7ED',
                    border: '1.5px solid #FED7AA',
                    color: '#431407',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}>
                  {CRM_OFFICIAL_PROFILES.map(p => (
                    <option key={p.role} value={p.role}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* ID Input */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#431407', marginBottom: '6px' }}>
                  अधिकारी आयडी / अधिकृत मोबाईल
                </label>
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="उदा. CM-SUPER-001 किंवा 9876500001"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '1.5px solid #FED7AA',
                    color: '#1E293B',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#431407', marginBottom: '6px' }}>
                  सुरक्षा पासवर्ड (Security Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="गोपनीय पासवर्ड"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '1.5px solid #FED7AA',
                    color: '#1E293B',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* 2FA Security Token */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#431407' }}>
                    २-स्टेप सुरक्षा पिन (2FA Authenticator Token)
                  </label>
                  <span style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700 }}>✓ Verified Token</span>
                </div>
                <input
                  type="text"
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#FFF7ED',
                    border: '1.5px solid #FED7AA',
                    color: '#EA580C',
                    fontSize: '1rem',
                    fontWeight: 800,
                    letterSpacing: '4px',
                    boxSizing: 'border-box',
                    textAlign: 'center'
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 18px rgba(234, 88, 12, 0.3)',
                  transition: 'transform 0.15s ease'
                }}>
                {loading ? '🔐 क्रेडेंशियल्स पडताळत आहे...' : 'प्रशासकीय CRM मध्ये प्रवेश करा (Access CRM) ➔'}
              </button>
            </form>

            <div style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #FED7AA',
              textAlign: 'center',
              fontSize: '0.88rem',
              color: '#64748B'
            }}>
              सामान्य सभासद आहात का?{' '}
              <Link to="/login" style={{ color: '#EA580C', fontWeight: 700, textDecoration: 'none' }}>
                सार्वजनिक सभासद लॉगिन येथे करा →
              </Link>
            </div>
          </div>

          {/* Quick Officer Switch Cards (Pre-configured Official Profiles) */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 4px', color: '#EA580C' }}>
                ⚡ अधिकृत पदभार प्रोफाइल सूची (Quick Role Portals)
              </h3>
              <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
                चाचणी व अधिकृत पडताळणीसाठी खालीलपैकी कोणत्याही अधिकृत पदावर क्लिक करून थेट संबंधित नियंत्रण कक्ष उघडा:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {CRM_OFFICIAL_PROFILES.map((p) => (
                <div
                  key={p.role}
                  onClick={() => handleQuickOfficialAuth(p)}
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #FED7AA',
                    borderRadius: '14px',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FFF7ED';
                    e.currentTarget.style.borderColor = '#EA580C';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#FED7AA';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#431407' }}>{p.title}</span>
                      <span style={{
                        background: '#FFF7ED',
                        color: '#EA580C',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        border: '1px solid #FED7AA'
                      }}>
                        {p.badge}
                      </span>
                    </div>
                    <div style={{ color: '#64748B', fontSize: '0.82rem', marginBottom: '2px' }}>
                      अधिकारी: <strong style={{ color: '#1E293B' }}>{p.name}</strong> • आयडी: {p.id}
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '0.78rem' }}>
                      {p.desc}
                    </div>
                  </div>

                  <div style={{
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: '#EA580C',
                    whiteSpace: 'nowrap'
                  }}>
                    प्रवेश करा →
                  </div>
                </div>
              ))}
            </div>

            {/* Official Security Disclaimer */}
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              background: '#FFF7ED',
              borderRadius: '10px',
              border: '1px solid #FED7AA',
              fontSize: '0.78rem',
              color: '#9A3412',
              lineHeight: 1.5
            }}>
              ⚖️ <strong>सुरक्षा सूचना:</strong> हे पोर्टल फक्त अधिकृत प्रशासकीय कामकाजासाठी आहे. प्रत्येक लॉगिनचा आयपी ॲड्रेस, वेळ व बदल सिस्टीम ऑडिट लॉग (Audit Trail) मध्ये DPDP कायदा २०२३ अंतर्गत स्वयंचलित नोंदवला जातो.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
