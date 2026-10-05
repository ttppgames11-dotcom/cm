import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CRM_AUTHORIZED_ROLES } from '../../components/auth/CRMProtectedRoute';

const CRM_OFFICIAL_PROFILES = [
  {
    role: 'admin',
    name: 'केंद्रीय मुख्य प्रशासक (Admin)',
    id: 'CM-ADMIN-001',
    phone: '9876500001',
    password: 'admin1674',
    title: '👑 केंद्रीय ॲडमिन (Admin Console)',
    desc: 'सर्व ३६ जिल्हे, वापरकर्ते CRUD, रोल मॅट्रिक्स व मास्टर सिस्टीम नियंत्रण',
    targetRoute: '/admin',
    color: '#FF6B00',
    badge: 'ADMIN ACCESS'
  },
  {
    role: 'ceo',
    name: 'राजेश पाटील (CEO)',
    id: 'CM-CEO-0088',
    phone: '9876500088',
    password: 'ceo1674',
    title: '🦅 मुख्य कार्यकारी अधिकारी / राज्य अध्यक्ष (CEO Macro)',
    desc: 'राज्यस्तरीय व्यवसाय वृद्धी, ६ विभाग, ₹ १८४+ कोटी मॅक्रो आकडेवारी',
    targetRoute: '/ceo',
    color: '#FF6B00',
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
    color: '#FF6B00',
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
    color: '#FF6B00',
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
    color: '#FF6B00',
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
    color: '#FF6B00',
    badge: 'TREASURY AUDIT'
  }
];

export default function CRMLoginPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('admin');
  const [officerId, setOfficerId] = useState('CM-ADMIN-001');
  const [password, setPassword] = useState('admin1674');
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
      background: '#0A0A0C',
      minHeight: '100vh',
      padding: '48px 16px 80px',
      color: '#FFFFFF',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Top Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FF6B00',
            border: '2px solid #FFFFFF',
            color: '#FFFFFF',
            padding: '6px 20px',
            borderRadius: '999px',
            fontSize: '0.88rem',
            fontWeight: 900,
            marginBottom: '16px',
            boxShadow: '0 4px 15px rgba(255, 107, 0, 0.4)'
          }}>
            <span>🔒 RESTRICTED ADMINISTRATIVE GATEWAY</span>
            <span>•</span>
            <span>DPDP २०२३ COMPLIANT</span>
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            margin: '0 0 12px',
            color: '#FFFFFF'
          }}>
            🏛️ प्रशासकीय व कार्यकारी CRM लॉगिन
          </h1>
          <p style={{
            color: '#FF8C00',
            fontSize: '1.05rem',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6,
            fontWeight: 700
          }}>
            Connect Maratha केंद्रीय नियंत्रण कक्ष, जिल्हा प्रशासन, चॅप्टर व्यवस्थापन व २४x७ सेवा कक्ष यांसाठी स्वतंत्र व सुरक्षित प्रवेशद्वार.
          </p>
        </div>

        {/* If Already Logged In */}
        {isCurrentStaff && (
          <div style={{
            background: '#18181B',
            border: '2px solid #FF6B00',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 20px rgba(255, 107, 0, 0.25)'
          }}>
            <div>
              <div style={{ color: '#FF8C00', fontWeight: 900, fontSize: '0.92rem', marginBottom: '4px' }}>
                ✓ अधिकृत प्रशासकीय सत्र चालू आहे
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>
                👤 {user.name} ({user.role})
              </div>
              <div style={{ color: '#FFFFFF', fontSize: '0.88rem', fontWeight: 700 }}>
                अधिकृत आयडी: {user.id}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link
                to={user.role === 'superadmin' || user.role === 'admin' ? '/admin' : (user.role === 'ceo' ? '/ceo' : '/crm')}
                style={{
                  background: 'linear-gradient(135deg, #FF6B00, #EA580C)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  padding: '12px 22px',
                  borderRadius: '10px',
                  border: '2px solid #FFFFFF',
                  textDecoration: 'none',
                  boxShadow: '0 4px 15px rgba(255, 107, 0, 0.4)'
                }}>
                डॅशबोर्ड उघडा ➔
              </Link>
              <button
                onClick={logout}
                style={{
                  background: '#18181B',
                  border: '1.5px solid #FF6B00',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  padding: '12px 20px',
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
            background: '#18181B',
            border: '2px solid #FF6B00',
            borderRadius: '20px',
            padding: '32px 28px',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.6)'
          }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 8px', color: '#FFFFFF' }}>
              अधिकृत अधिकारी लॉगिन
            </h2>
            <p style={{ color: '#FF8C00', fontSize: '0.92rem', margin: '0 0 24px', fontWeight: 700 }}>
              आपला प्रशासकीय पदभार निवडा व अधिकृत क्रेडेंशियल्स प्रविष्ट करा.
            </p>

            {errorMsg && (
              <div style={{
                background: '#7F1D1D',
                border: '1.5px solid #FFFFFF',
                color: '#FFFFFF',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 800,
                marginBottom: '18px'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleOfficialLogin}>
              {/* Role Select */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#FF8C00', marginBottom: '6px' }}>
                  प्रशासकीय पदभार निवडा (Official Designation)
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleSelect(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#111113',
                    border: '1.5px solid #FF6B00',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 800,
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
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#FF8C00', marginBottom: '6px' }}>
                  अधिकारी आयडी / अधिकृत मोबाईल
                </label>
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="उदा. CM-ADMIN-001 किंवा 9876500001"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#111113',
                    border: '1.5px solid #FF6B00',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#FF8C00', marginBottom: '6px' }}>
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
                    background: '#111113',
                    border: '1.5px solid #FF6B00',
                    color: '#FFFFFF',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* 2FA Token */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FF8C00' }}>
                    २-स्टेप सुरक्षा पिन (2FA Authenticator Token)
                  </label>
                  <span style={{ fontSize: '0.78rem', color: '#FFFFFF', fontWeight: 800, background: '#FF6B00', padding: '2px 8px', borderRadius: '4px' }}>✓ Verified Token</span>
                </div>
                <input
                  type="text"
                  value={securityPin}
                  onChange={(e) => setSecurityPin(e.target.value)}
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#111113',
                    border: '2px solid #FF6B00',
                    color: '#FFFFFF',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    letterSpacing: '4px',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #FF6B00 0%, #EA580C 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  padding: '15px',
                  borderRadius: '12px',
                  border: '2px solid #FFFFFF',
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 20px rgba(255, 107, 0, 0.45)',
                  transition: 'transform 0.15s ease'
                }}>
                {loading ? '🔐 पडताळत आहे...' : 'प्रशासकीय CRM मध्ये प्रवेश करा (Access CRM) ➔'}
              </button>
            </form>

            <div style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 107, 0, 0.3)',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#FFFFFF'
            }}>
              सामान्य सभासद आहात का?{' '}
              <Link to="/login" style={{ color: '#FF8C00', fontWeight: 800, textDecoration: 'underline' }}>
                सार्वजनिक सभासद लॉगिन येथे करा →
              </Link>
            </div>
          </div>

          {/* Quick Officer Switch Cards */}
          <div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 6px', color: '#FFFFFF' }}>
                ⚡ अधिकृत पदभार प्रोफाइल सूची (Quick Role Portals)
              </h3>
              <p style={{ color: '#FF8C00', fontSize: '0.88rem', margin: 0, fontWeight: 700 }}>
                खालीलपैकी कोणत्याही अधिकृत पदावर क्लिक करून थेट संबंधित नियंत्रण कक्ष उघडा:
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {CRM_OFFICIAL_PROFILES.map((p) => (
                <div
                  key={p.role}
                  onClick={() => handleQuickOfficialAuth(p)}
                  style={{
                    background: '#18181B',
                    border: '2px solid #FF6B00',
                    borderRadius: '14px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
                  }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#FFFFFF' }}>{p.title}</span>
                      <span style={{
                        background: '#FF6B00',
                        color: '#FFFFFF',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {p.badge}
                      </span>
                    </div>
                    <div style={{ color: '#FF8C00', fontSize: '0.85rem', marginBottom: '2px', fontWeight: 700 }}>
                      अधिकारी: <strong style={{ color: '#FFFFFF' }}>{p.name}</strong> • आयडी: {p.id}
                    </div>
                    <div style={{ color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 600 }}>
                      {p.desc}
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #FF6B00, #EA580C)',
                    border: '1.5px solid #FFFFFF',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap'
                  }}>
                    प्रवेश करा →
                  </div>
                </div>
              ))}
            </div>

            {/* Security Disclaimer */}
            <div style={{
              marginTop: '22px',
              padding: '14px 18px',
              background: '#18181B',
              borderRadius: '12px',
              border: '2px solid #FF6B00',
              fontSize: '0.85rem',
              color: '#FFFFFF',
              lineHeight: 1.5,
              fontWeight: 600
            }}>
              ⚖️ <strong style={{ color: '#FF8C00' }}>सुरक्षा सूचना:</strong> हे पोर्टल फक्त अधिकृत प्रशासकीय कामकाजासाठी आहे. प्रत्येक लॉगिनचा आयपी ॲड्रेस, वेळ व बदल सिस्टीम ऑडिट लॉग (Audit Trail) मध्ये DPDP कायदा २०२३ अंतर्गत स्वयंचलित नोंदवला जातो.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
