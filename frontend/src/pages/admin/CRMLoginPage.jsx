import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CRM_AUTHORIZED_ROLES } from '../../components/auth/CRMProtectedRoute';

// Where each role lands dynamically after the database has confirmed the login
function routeForRole(role, member = {}) {
  // If user is a community center executive, route dynamically to their assigned center tier
  if (['center_manager', 'center_admin', 'center_staff', 'center_partner'].includes(role)) {
    const tier = member.center_tier || (member.unit_id && member.unit_id.toLowerCase().includes('mh') ? 'state' : null) || member.tier;
    if (tier === 'state') return '/crm/center-state';
    if (tier === 'division') return '/crm/center-division';
    if (tier === 'district') return '/crm/center-district';
    if (tier === 'taluka') return '/crm/center-taluka';
    return '/crm/center';
  }

  switch (role) {
    case 'superadmin': return '/superadmin';
    case 'admin': return '/admin';
    case 'ceo':
    case 'pradesh_head': return '/ceo';
    case 'division_admin':
    case 'division_head': return '/crm/division';
    case 'district_admin':
    case 'district_head': return '/crm/district';
    case 'taluka_admin':
    case 'taluka_head': return '/crm/taluka';
    case 'branch_head':
    case 'branch_admin':
    case 'branch': return '/crm/branch';
    case 'state_admin':
    case 'pradesh_admin': return '/crm/state';
    case 'chapter_president':
    case 'chapter_head': return '/crm/chapter';
    case 'seva_helpdesk': return '/crm/helpdesk';
    case 'finance_officer': return '/crm/finance';
    default: return null;
  }
}

export default function CRMLoginPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 🚀 If an admin/officer is ALREADY logged in, do not make them login again — auto-route to their dashboard!
  React.useEffect(() => {
    if (user && CRM_AUTHORIZED_ROLES.includes(user.role)) {
      const destination = (location.state && location.state.from && location.state.from.pathname) || routeForRole(user.role, user);
      if (destination && destination !== '/admin/crm-login' && destination !== '/crm/login') {
        navigate(destination, { replace: true });
      }
    }
  }, [user, navigate, location]);

  // The database checks the credentials and decides the user's role and access level
  const handleOfficialLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanId = String(officerId || '').trim();
    const cleanPass = String(password || '').trim();

    if (!cleanId) {
      setErrorMsg('कृपया आपला नोंदणीकृत अधिकारी आयडी किंवा मोबाईल नंबर प्रविष्ट करा.');
      return;
    }
    if (!cleanPass) {
      setErrorMsg('कृपया संकेतशब्द (Password) प्रविष्ट करा.');
      return;
    }

    setLoading(true);
    const result = await login(cleanId, cleanPass);
    setLoading(false);

    if (!result.success) {
      setErrorMsg('अवैध क्रेडेंशियल्स. कृपया डेटाबेसमध्ये नोंदणीकृत आयडी व पासवर्ड तपासा.');
      return;
    }

    const memberData = result.member || result.data?.member || {};
    const target = routeForRole(memberData.role, memberData);
    if (!target) {
      logout();
      setErrorMsg('या खात्याला प्रशासकीय CRM अधिकार नियुक्त केलेले नाहीत (डेटाबेस Role: ' + (memberData.role || 'member') + ').');
      return;
    }
    const destination = (location.state && location.state.from && location.state.from.pathname) || target;
    navigate(destination, { replace: true });
  };

  const isCurrentStaff = user && CRM_AUTHORIZED_ROLES.includes(user.role);

  return (
    <div style={{
      background: '#FFFDF9',
      minHeight: '100vh',
      padding: '40px 16px 80px',
      color: '#1C1917',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        
        {/* Top Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFF7ED',
            border: '1.5px solid #FED7AA',
            color: '#EA580C',
            padding: '6px 20px',
            borderRadius: '999px',
            fontSize: '0.88rem',
            fontWeight: 900,
            marginBottom: '14px',
            boxShadow: '0 2px 10px rgba(234, 88, 12, 0.08)'
          }}>
            <span>🔒 RESTRICTED ADMINISTRATIVE GATEWAY</span>
            <span>•</span>
            <span>DPDP २०२३ COMPLIANT</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
            fontWeight: 900,
            margin: '0 0 10px',
            color: '#EA580C'
          }}>
            🏛️ प्रशासकीय व कार्यकारी CRM लॉगिन
          </h1>
          <p style={{
            color: '#7C2D12',
            fontSize: '1rem',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: 1.6,
            fontWeight: 600
          }}>
            आपला आयडी व पासवर्ड प्रविष्ट करा. सिस्टीम आपल्या पदानुसार संबंधित नियंत्रण कक्ष स्वयंचलित उघडेल.
          </p>
        </div>

        {/* If Already Logged In: Give clean choice to proceed or switch account */}
        {isCurrentStaff && (
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid #FED7AA',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            maxWidth: '560px',
            margin: '0 auto 24px',
            boxShadow: '0 4px 16px rgba(234, 88, 12, 0.06)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.88rem', color: '#7C2D12', marginBottom: '8px', fontWeight: 600 }}>
              सध्याचे सक्रिय सत्र (Active Session): <strong>{user.name}</strong> ({user.role})
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to={routeForRole(user.role, user) || '/crm'}
                style={{
                  background: 'linear-gradient(135deg, #FF6A00, #EA580C)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  textDecoration: 'none'
                }}>
                या खात्यासह डॅशबोर्डवर जा ➔
              </Link>
              <button
                type="button"
                onClick={logout}
                style={{
                  background: '#FFF7ED',
                  border: '1px solid #FED7AA',
                  color: '#C2410C',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                लॉगआउट करा (दुसऱ्या खात्याने लॉगिन)
              </button>
            </div>
          </div>
        )}

        <div style={{
          maxWidth: '480px',
          margin: '0 auto'
        }}>
          {/* Main Credentials Box */}
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #FED7AA',
            borderRadius: '20px',
            padding: '36px 30px',
            boxShadow: '0 12px 36px rgba(234, 88, 12, 0.1)'
          }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 6px', color: '#EA580C', textAlign: 'center' }}>
              अधिकारी लॉगिन
            </h2>
            <p style={{ color: '#7C2D12', fontSize: '0.90rem', margin: '0 0 24px', fontWeight: 600, textAlign: 'center' }}>
              आपला अधिकृत अधिकारी आयडी व पासवर्ड प्रविष्ट करा.
            </p>

            {errorMsg && (
              <div style={{
                background: '#FFF7ED',
                border: '1.5px solid #EA580C',
                color: '#EA580C',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 800,
                marginBottom: '18px'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleOfficialLogin}>
              {/* ID Input */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#EA580C', marginBottom: '6px' }}>
                  अधिकारी आयडी / अधिकृत मोबाईल नंबर
                </label>
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  placeholder="आपला अधिकृत आयडी किंवा मोबाईल नंबर"
                  required
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    borderRadius: '10px',
                    background: '#FFFDF9',
                    border: '1.5px solid #FED7AA',
                    color: '#1C1917',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 800, color: '#EA580C', marginBottom: '6px' }}>
                  गोपनीय पासवर्ड (Password)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="आपला गोपनीय पासवर्ड"
                    required
                    style={{
                      width: '100%',
                      padding: '13px 44px 13px 14px',
                      borderRadius: '10px',
                      background: '#FFFDF9',
                      border: '1.5px solid #FED7AA',
                      color: '#1C1917',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                      color: '#EA580C'
                    }}
                    title={showPassword ? 'लपवा' : 'दाखवा'}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  padding: '15px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 4px 18px rgba(234, 88, 12, 0.35)',
                  transition: 'transform 0.15s ease'
                }}>
                {loading ? '🔐 पडताळणी चालू आहे...' : 'प्रशासकीय CRM मध्ये प्रवेश करा ➔'}
              </button>
            </form>

            <div style={{
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid #FED7AA',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#7C2D12'
            }}>
              सामान्य सभासद आहात का?{' '}
              <Link to="/login" style={{ color: '#EA580C', fontWeight: 800, textDecoration: 'underline' }}>
                सार्वजनिक सभासद लॉगिन येथे करा →
              </Link>
            </div>
          </div>

          {/* Security Notice */}
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: '#FFF7ED',
            borderRadius: '12px',
            border: '1px solid #FED7AA',
            fontSize: '0.84rem',
            color: '#7C2D12',
            lineHeight: 1.5,
            fontWeight: 600,
            textAlign: 'center'
          }}>
            ⚖️ <strong>सुरक्षा सूचना:</strong> हे पोर्टल फक्त अधिकृत प्रशासकीय कामकाजासाठी आहे. प्रत्येक लॉगिनचा ऑडिट लॉग (Audit Trail) DPDP कायदा २०२३ अंतर्गत स्वयंचलित नोंदवला जातो.
          </div>
        </div>

      </div>
    </div>
  );
}
