import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CRM_AUTHORIZED_ROLES } from '../../components/auth/CRMProtectedRoute';
import { api } from '../../services/api';

// Officer accounts are real member accounts with an officer role, checked by the server.

export default function CRMLoginPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Login: checks ID and password, identifies role, opens role-wise portal
  const handleOfficialLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanId = String(officerId || '').trim();
    const cleanPass = String(password || '').trim();

    if (!cleanId) {
      setErrorMsg('कृपया आपला अधिकृत प्रशासकीय आयडी किंवा मोबाईल नंबर प्रविष्ट करा.');
      return;
    }
    if (!cleanPass) {
      setErrorMsg('कृपया गोपनीय पासवर्ड प्रविष्ट करा.');
      return;
    }

    setLoading(true);

    // Check the ID and password with the server; the role comes from the member record.
    try {
      const res = await api.auth.login(cleanId, cleanPass);
      const member = res?.member || res?.data?.member || res?.data?.profile;
      if (member) {
        setLoading(false);
        const role = member.role || 'member';
        let targetRoute = '/dashboard';
        if (role === 'superadmin') targetRoute = '/superadmin';
        else if (role === 'admin') targetRoute = '/admin';
        else if (role === 'ceo' || role === 'pradesh_head') targetRoute = '/ceo';
        else if (role === 'division_admin' || role === 'division_head') targetRoute = '/crm/division';
        else if (role === 'district_admin' || role === 'district_head') targetRoute = '/crm/district';
        else if (role === 'taluka_admin' || role === 'taluka_head') targetRoute = '/crm/taluka';
        else if (role === 'branch_head' || role === 'branch_admin' || role === 'branch') targetRoute = '/crm/branch';
        else if (role === 'center_manager' || role === 'center_admin' || role === 'center_partner') targetRoute = '/crm/center';
        else if (role === 'chapter_president' || role === 'chapter_head') targetRoute = '/crm/chapter';
        else if (role === 'seva_helpdesk') targetRoute = '/crm/helpdesk';
        else if (role === 'finance_officer') targetRoute = '/crm/finance';

        navigate(targetRoute, { replace: true });
        return;
      }
    } catch (err) {
      // Backend error will show friendly message below
    }

    setLoading(false);
    setErrorMsg('अवैध प्रशासकीय आयडी किंवा पासवर्ड. कृपया नोंदणीकृत अधिकारी क्रेडेंशियल्स प्रविष्ट करा.');
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
            आपला अधिकृत प्रशासकीय आयडी व पासवर्ड प्रविष्ट करा. सिस्टीम आपल्या पदभारानुसार संबंधित नियंत्रण कक्ष स्वयंचलित उघडेल.
          </p>
        </div>

        {/* If Already Logged In Banner */}
        {isCurrentStaff && (
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #EA580C',
            borderRadius: '16px',
            padding: '18px 24px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 20px rgba(234, 88, 12, 0.1)'
          }}>
            <div>
              <div style={{ color: '#EA580C', fontWeight: 900, fontSize: '0.90rem', marginBottom: '4px' }}>
                ✓ अधिकृत प्रशासकीय सत्र सक्रिय आहे
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#EA580C' }}>
                👤 {user.name} ({user.role})
              </div>
              <div style={{ color: '#7C2D12', fontSize: '0.86rem', fontWeight: 600 }}>
                अधिकृत आयडी: {user.id}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link
                to={user.role === 'superadmin' ? '/superadmin' : (user.role === 'admin' ? '/admin' : (user.role === 'ceo' ? '/ceo' : '/crm'))}
                style={{
                  background: 'linear-gradient(135deg, #FF6A00, #EA580C)',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  padding: '10px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)'
                }}>
                डॅशबोर्ड उघडा ➔
              </Link>
              <button
                onClick={logout}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #FED7AA',
                  color: '#EA580C',
                  fontWeight: 800,
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
                  placeholder="उदा. CM-ADMIN-001 किंवा 9876500001"
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
