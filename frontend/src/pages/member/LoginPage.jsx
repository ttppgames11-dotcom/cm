import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('password'); // 'password' or 'otp'
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [roleMode, setRoleMode] = useState('member'); // 'member', 'business', 'crm', 'ceo'
  const [rememberMe, setRememberMe] = useState(true);
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal state (matches mobile app: email -> OTP -> reset password)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: enter email, 2: enter OTP, 3: set new password, 4: success
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotResetToken, setForgotResetToken] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!loginId || !loginId.trim()) {
      setMessage('कृपया आपला मोबाईल नंबर किंवा सदस्य ID प्रविष्ट करा.');
      return;
    }
    if (!password) {
      setMessage('कृपया आपला पासवर्ड प्रविष्ट करा.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await login(loginId.trim(), password);
      if (res && res.success) {
        navigate('/dashboard');
      } else {
        setMessage(res?.error || 'लॉगिन अयशस्वी. कृपया आपले क्रेडेंशियल तपासा.');
      }
    } catch (err) {
      setMessage(err.message || 'सर्व्हरशी संपर्क साधता आला नाही.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Send OTP to user's registered email
  const handleRequestForgotOtp = async (e) => {
    if (e) e.preventDefault();
    setForgotError('');
    if (!forgotEmail || !forgotEmail.trim()) {
      setForgotError('कृपया आपला नोंदणीकृत ईमेल पत्ता प्रविष्ट करा.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await api.auth.forgotPassword(forgotEmail.trim());
      setForgotSuccessMsg(res?.message || 'आपल्या ईमेलवर ६-अंकी OTP पाठवण्यात आला आहे.');
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || 'OTP पाठवता आला नाही. ईमेल तपासा.');
    } finally {
      setForgotLoading(false);
    }
  };

  // 2. Verify OTP received in email
  const handleVerifyForgotOtp = async (e) => {
    if (e) e.preventDefault();
    setForgotError('');
    if (!forgotOtp || forgotOtp.trim().length < 4) {
      setForgotError('कृपया वैध OTP कोड प्रविष्ट करा.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await api.auth.verifyOtp(forgotEmail.trim(), forgotOtp.trim());
      const token = res?.resetToken || res?.data?.resetToken;
      if (!token) {
        throw new Error('अवैध रीसेट टोकन प्राप्त झाले.');
      }
      setForgotResetToken(token);
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.message || 'चुकीचा किंवा कालबाह्य झालेला OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  // 3. Reset password with new password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    setForgotError('');
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('पासवर्ड किमान ६ वर्णांचा असावा.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('दोन्ही पासवर्ड जुळत नाहीत (Passwords do not match).');
      return;
    }
    setForgotLoading(true);
    try {
      await api.auth.resetPassword(forgotEmail.trim(), forgotResetToken, forgotNewPassword);
      setForgotStep(4);
    } catch (err) {
      setForgotError(err.message || 'पासवर्ड रीसेट करताना त्रुटी आली.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotEmail('');
    setForgotOtp('');
    setForgotResetToken('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotError('');
    setForgotSuccessMsg('');
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '24px 16px 48px' }}>
      <div className="container" style={{ maxWidth: '1040px', margin: '0 auto' }}>
        
        {/* Main Split Authentication Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px -15px rgba(61,13,13,0.32), 0 0 0 1px rgba(221,138,46,0.15)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          minHeight: '620px',
          marginBottom: '24px'
        }}>
          
          {/* Left Visual Hero Side */}
          <div style={{
            position: 'relative',
            backgroundImage: 'url(/assets/images/real-raigad-panoramic.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            padding: '40px 36px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: '#FFFFFF',
            minHeight: '400px'
          }}>
            {/* Dark Dramatic Gradient Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(30,10,8,0.72) 0%, rgba(30,10,8,0.35) 42%, rgba(15,6,5,0.95) 100%)',
              zIndex: 1
            }} />

            {/* Content Layer */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Brand Top */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src="/assets/images/logo.png" 
                  alt="Connect Maratha" 
                  style={{ width: '44px', height: '44px', objectFit: 'contain', background: '#FFFFFF', borderRadius: '50%', padding: '3px' }} 
                />
                <div>
                  <div style={{ fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#F0DED0', fontWeight: 700 }}>
                    CONNECT
                  </div>
                  <div style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '24px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
                    मराठा
                  </div>
                </div>
              </div>

              {/* Big Slogan Headline */}
              <div style={{
                fontFamily: 'Baloo 2, sans-serif',
                fontSize: '2.2rem',
                fontWeight: 800,
                lineHeight: 1.35,
                margin: '50px 0 28px',
                color: '#FFFFFF',
                textShadow: '0 3px 14px rgba(0,0,0,0.85)'
              }}>
                जपा इतिहास<br />
                जोडा समाज<br />
                घडवा भविष्य
              </div>

              {/* Key Bullet Highlights */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🚩</span>
                  <span><strong>अधिकृत:</strong> Connect Maratha चे अधिकृत डिजिटल व्यासपीठ</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>❤️</span>
                  <span><strong>ऐक्य:</strong> ३६ जिल्हे, ३५०+ किल्ले व जागतिक नेटवर्क</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🛡️</span>
                  <span><strong>सुरक्षित:</strong> एन्क्रिप्टेड खाती व २-स्टेप पडताळणी</span>
                </div>
              </div>
            </div>

            {/* Bottom Foundation Label */}
            <div style={{ position: 'relative', zIndex: 2, marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: '16px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FFE082' }}>
                CONNECT MARATHA FOUNDATION
              </div>
              <div style={{ fontSize: '0.78rem', color: '#E9DCCB', marginTop: '2px' }}>
                संस्कृती, इतिहास, रोजगार व सामाजिक एकजुटीचा महासंगम
              </div>
            </div>
          </div>

          {/* Right Authentication Form Side */}
          <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            
            {/* Top Bar with Security Badge & Register Link */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <span style={{
                background: 'rgba(255,243,224,0.9)',
                border: '1px solid #FFE0B2',
                color: '#E65100',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.76rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                🔒 अधिकृत सुरक्षित लॉगिन
              </span>
              <div style={{ fontSize: '0.84rem', color: '#666' }}>
                नवीन सदस्य? <Link to="/register" style={{ color: '#C73800', fontWeight: 800, textDecoration: 'none' }}>येथे नोंदणी करा →</Link>
              </div>
            </div>

            {/* Mode Switch Tabs (Pills) */}
            <div style={{
              display: 'flex',
              gap: '6px',
              background: '#F5F2EC',
              borderRadius: '30px',
              padding: '4px',
              marginBottom: '20px',
              overflowX: 'auto'
            }}>
              <button
                type="button"
                onClick={() => { setActiveTab('password'); setMessage(''); }}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: '24px',
                  border: 'none',
                  background: activeTab === 'password' ? 'linear-gradient(135deg, #F4511E, #E65100)' : 'transparent',
                  color: activeTab === 'password' ? '#FFFFFF' : '#666',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'password' ? '0 2px 8px rgba(230,81,0,0.3)' : 'none',
                  whiteSpace: 'nowrap'
                }}>
                🔑 पासवर्ड लॉगिन
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('otp'); setMessage(''); }}
                style={{
                  flex: 1,
                  padding: '8px 16px',
                  borderRadius: '24px',
                  border: 'none',
                  background: activeTab === 'otp' ? 'linear-gradient(135deg, #F4511E, #E65100)' : 'transparent',
                  color: activeTab === 'otp' ? '#FFFFFF' : '#666',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'otp' ? '0 2px 8px rgba(230,81,0,0.3)' : 'none',
                  whiteSpace: 'nowrap'
                }}>
                📱 OTP लॉगिन
              </button>
            </div>

            {/* Title & Subtitle */}
            <h1 style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#1A1A1A', margin: '0 0 4px' }}>
              आपल्या खात्यात प्रवेश करा
            </h1>
            <p style={{ color: '#666', fontSize: '0.84rem', margin: '0 0 20px' }}>
              Connect Maratha — संस्कृती, उद्योग व सामाजिक एकात्मता.
            </p>

            {message && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                marginBottom: '16px',
                background: message.includes('पाठवला') || message.includes('स्वीकृत') ? '#E8F5E9' : '#FFEBEE',
                color: message.includes('पाठवला') || message.includes('स्वीकृत') ? '#2E7D32' : '#C62828',
                border: '1px solid currentColor'
              }}>
                {message}
              </div>
            )}

            {/* PANE 1: PASSWORD LOGIN */}
            {activeTab === 'password' && (
              <form onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    मोबाईल नंबर किंवा सदस्य ID (Mobile or CM ID)
                  </label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="उदा. 9876543210 किंवा CM-MH-2026-8842"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #D1D5DB',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    पासवर्ड (Password)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #D1D5DB',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    सभासद प्रकार (Member Type)
                  </label>
                  <select
                    value={roleMode}
                    onChange={(e) => setRoleMode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #D1D5DB',
                      fontSize: '0.88rem',
                      background: '#FFFFFF',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}>
                    <option value="member">सदस्य (General Member)</option>
                    <option value="business">व्यावसायिक / उद्योजक (Business Member)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', marginBottom: '18px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#374151', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: '#E65100', width: '16px', height: '16px' }}
                    />
                    मला आठवणीत ठेवा
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setForgotEmail(loginId.includes('@') ? loginId : '');
                      setShowForgotModal(true);
                      setForgotStep(1);
                      setForgotError('');
                    }}
                    style={{ background: 'none', border: 'none', padding: 0, color: '#E65100', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'none' }}
                  >
                    पासवर्ड विसरलात?
                  </button>
                </div>

                {/* Big Gradient Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #F4511E, #E65100)',
                    color: '#FFFFFF',
                    fontFamily: 'Baloo 2, sans-serif',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(244,81,30,0.35)',
                    transition: 'all 0.2s ease',
                    marginBottom: '14px'
                  }}>
                  {loading ? 'प्रवेश करत आहे...' : 'लॉगिन करा (Log In) ➔'}
                </button>
              </form>
            )}

            {/* PANE 2: OTP LOGIN */}
            {activeTab === 'otp' && (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    नोंदणीकृत मोबाईल नंबर
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="tel"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="१० अंकी मोबाईल नंबर"
                      style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #D1D5DB', fontSize: '0.92rem' }}
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1.5px solid #E65100',
                        background: '#FFF3E0',
                        color: '#E65100',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}>
                      OTP पाठवा
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    प्राप्त झालेला ६-अंकी OTP प्रविष्ट करा
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="उदा. 167430"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #D1D5DB', fontSize: '1.1rem', letterSpacing: '4px', textAlign: 'center', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleLoginSubmit()}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #F4511E, #E65100)',
                    color: '#FFFFFF',
                    fontFamily: 'Baloo 2, sans-serif',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(244,81,30,0.35)',
                    marginBottom: '14px'
                  }}>
                  ✓ पडताळा आणि लॉगिन करा ➔
                </button>
              </div>
            )}

            {/* Separator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0', color: '#9CA3AF', fontSize: '0.78rem' }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
              <span>किंवा (OR)</span>
              <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
            </div>

            {/* Quick Login Options */}
            <div style={{ marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setMessage('Google लॉगिन लवकरच उपलब्ध होत आहे.')}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: '#374151',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}>
                <svg width="16" height="16" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
                </svg>
                Google ने लॉगिन करा
              </button>
            </div>

            {/* Bottom Onboarding Link Box */}
            <div style={{
              background: '#FFF5F0',
              border: '1px dashed #FFAB91',
              borderRadius: '10px',
              padding: '10px 14px',
              textAlign: 'center',
              fontSize: '0.80rem',
              color: '#BF360C',
              marginBottom: '12px'
            }}>
              🚀 <strong>ऑनबोर्डिंग स्टुडिओ:</strong> सर्व ९ परस्परसंवादी स्क्रीन पाहण्यासाठी{' '}
              <Link to="/register" style={{ color: '#C73800', fontWeight: 800, textDecoration: 'underline' }}>
                येथे क्लिक करा →
              </Link>
            </div>

            {/* Staff / Admin Portal Link */}
            <div style={{
              padding: '10px 14px',
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '10px',
              textAlign: 'center',
              fontSize: '0.82rem',
              color: '#991B1B'
            }}>
              🏛️ <strong>प्रशासकीय अधिकारी / CRM कर्मचारी आहात का?</strong>{' '}
              <Link to="/crm/login" style={{ color: '#DC2626', fontWeight: 800, textDecoration: 'underline' }}>
                स्वतंत्र CRM लॉगिन येथे करा →
              </Link>
            </div>

          </div>
        </div>

        {/* Bottom Security Assurance Banner */}
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '12px',
          padding: '14px 20px',
          textAlign: 'center',
          color: '#166534',
          fontSize: '0.86rem',
          boxShadow: '0 2px 8px rgba(22,101,52,0.05)'
        }}>
          🔒 <strong>सुरक्षित व्यासपीठ:</strong> तुमचे वैयक्तिक तपशील, संपर्क आणि सेवा इतिहास पूर्णपणे सुरक्षित आणि गोपनीय ठेवला जातो.
        </div>

      </div>

      {/* ================= FORGOT PASSWORD MODAL (EMAIL OTP) ================= */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
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
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            border: '1.5px solid #F0B866'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #7A1C1C, #4A0E0E)',
              padding: '18px 22px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 style={{ fontFamily: 'Baloo 2, sans-serif', margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>
                  पासवर्ड रीसेट करा (Reset Password)
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#F3E5D8', marginTop: '2px' }}>
                  {forgotStep === 1 && 'पायरी १: ईमेल प्रविष्ट करा'}
                  {forgotStep === 2 && 'पायरी २: ईमेलवर पाठवलेला OTP प्रविष्ट करा'}
                  {forgotStep === 3 && 'पायरी ३: नवीन पासवर्ड सेट करा'}
                  {forgotStep === 4 && 'यशस्वी!'}
                </div>
              </div>
              <button
                type="button"
                onClick={closeForgotModal}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#FFFFFF',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 26px' }}>
              {/* Error banner */}
              {forgotError && (
                <div style={{
                  padding: '10px 14px',
                  background: '#FEE2E2',
                  border: '1.5px solid #F87171',
                  color: '#991B1B',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  marginBottom: '16px'
                }}>
                  ⚠️ {forgotError}
                </div>
              )}

              {/* STEP 1: Enter Email to Receive OTP */}
              {forgotStep === 1 && (
                <form onSubmit={handleRequestForgotOtp}>
                  <p style={{ color: '#4B5563', fontSize: '0.88rem', margin: '0 0 16px', lineHeight: 1.45 }}>
                    आपल्या खात्याचा नोंदणीकृत ईमेल पत्ता टाका. आम्ही त्यावर <strong>पासवर्ड रीसेट OTP</strong> पाठवू.
                  </p>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                      नोंदणीकृत ईमेल (Registered Email)
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="उदा. name@example.com"
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #D1D5DB',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #F4511E, #E65100)',
                      color: '#FFFFFF',
                      fontFamily: 'Baloo 2, sans-serif',
                      fontSize: '1rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(244,81,30,0.35)'
                    }}
                  >
                    {forgotLoading ? 'OTP पाठवत आहे...' : 'ईमेलवर OTP पाठवा (Send OTP) ➔'}
                  </button>
                </form>
              )}

              {/* STEP 2: Enter Email OTP */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyForgotOtp}>
                  <div style={{
                    padding: '10px 14px',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    marginBottom: '16px'
                  }}>
                    ✓ {forgotSuccessMsg || 'आपल्या ईमेलवर OTP पाठवण्यात आला आहे.'}
                  </div>
                  <p style={{ color: '#4B5563', fontSize: '0.88rem', margin: '0 0 16px' }}>
                    <strong>{forgotEmail}</strong> या पत्त्यावर आलेला ६-अंकी OTP प्रविष्ट करा:
                  </p>
                  <div style={{ marginBottom: '18px' }}>
                    <input
                      type="text"
                      maxLength="6"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value)}
                      placeholder="उदा. 482910"
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '2px solid #E65100',
                        fontSize: '1.25rem',
                        letterSpacing: '5px',
                        textAlign: 'center',
                        fontWeight: 800,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1.5px solid #D1D5DB',
                        background: '#FFFFFF',
                        color: '#374151',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ← मागे
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #F4511E, #E65100)',
                        color: '#FFFFFF',
                        fontFamily: 'Baloo 2, sans-serif',
                        fontSize: '1rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {forgotLoading ? 'पडताळत आहे...' : 'OTP पडताळा (Verify OTP) ➔'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Set New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword}>
                  <p style={{ color: '#4B5563', fontSize: '0.88rem', margin: '0 0 16px' }}>
                    OTP सत्यापित झाला आहे! आता नवीन पासवर्ड सेट करा:
                  </p>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                      नवीन पासवर्ड (New Password)
                    </label>
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="किमान ६ वर्ण"
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #D1D5DB',
                        fontSize: '0.92rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.80rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                      पासवर्ड पुन्हा प्रविष्ट करा (Confirm Password)
                    </label>
                    <input
                      type="password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="नवीन पासवर्ड पुन्हा टाका"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #D1D5DB',
                        fontSize: '0.92rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #16A34A, #15803D)',
                      color: '#FFFFFF',
                      fontFamily: 'Baloo 2, sans-serif',
                      fontSize: '1rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(22,163,74,0.35)'
                    }}
                  >
                    {forgotLoading ? 'अपडेट करत आहे...' : 'पासवर्ड बदला (Reset Password) ➔'}
                  </button>
                </form>
              )}

              {/* STEP 4: Success Message */}
              {forgotStep === 4 && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#DCFCE7',
                    color: '#16A34A',
                    fontSize: '28px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    ✓
                  </div>
                  <h4 style={{ fontFamily: 'Baloo 2, sans-serif', fontSize: '1.25rem', fontWeight: 800, margin: '0 0 8px', color: '#166534' }}>
                    पासवर्ड यशस्वीरित्या बदलला आहे!
                  </h4>
                  <p style={{ color: '#4B5563', fontSize: '0.88rem', margin: '0 0 20px' }}>
                    आता आपण आपल्या नवीन पासवर्डचा वापर करून लॉग इन करू शकता.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeForgotModal();
                      setLoginId(forgotEmail);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #F4511E, #E65100)',
                      color: '#FFFFFF',
                      fontFamily: 'Baloo 2, sans-serif',
                      fontSize: '1rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    आता लॉगिन करा (Log In Now) ➔
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
