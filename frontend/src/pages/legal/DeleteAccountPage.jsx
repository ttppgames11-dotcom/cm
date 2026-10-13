import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function DeleteAccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Mode: if user logged in, default to authenticated deletion; otherwise request form
  const [activeTab, setActiveTab] = useState(user ? 'direct' : 'request');
  
  // Direct deletion state (for logged-in member)
  const [password, setPassword] = useState('');
  const [directConfirmText, setDirectConfirmText] = useState('');
  const [directConfirmed, setDirectConfirmed] = useState(false);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState('');
  const [directSuccess, setDirectSuccess] = useState(false);
  const [directResult, setDirectResult] = useState(null);

  // Web request form state (for unauthenticated / app-uninstalled users)
  const [requestForm, setRequestForm] = useState({
    identifier: '',
    reason: 'इतर (Other)',
    confirmation: false
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestResult, setRequestResult] = useState(null);
  const [deletedUser, setDeletedUser] = useState(null);

  // Handle direct deletion for logged-in user
  const handleDirectDelete = async (e) => {
    e.preventDefault();
    setDirectError('');

    if (!directConfirmed || directConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDirectError('कृपया पुष्टीकरणासाठी "DELETE" टाईप करा आणि चेकबॉक्स निवडा.');
      return;
    }

    setDirectLoading(true);
    try {
      const res = await api.auth.deleteAccount({
        id: user.id,
        identifier: user.phone || user.email || user.id,
        phone: user.phone || user.mobile,
        email: user.email,
        password,
        confirmation: true,
        reason: 'Direct deletion from Delete Account Page'
      });

      if (!res?.data?.deleted && !res?.deleted) {
        throw new Error(res?.error || 'हा सदस्य डेटाबेसमध्ये सापडला नाही किंवा आधीच हटवला गेला आहे.');
      }

      const deletedMemberSnapshot = user;
      setDeletedUser(deletedMemberSnapshot);
      setDirectSuccess(true);
      setDirectResult(res.data || res);
      
      // Immediately log out and purge all authentication and session storage
      logout();
      localStorage.removeItem('cm_logged_in');
      localStorage.removeItem('cm_user_data');
      localStorage.removeItem('cm_jwt_token');
      localStorage.removeItem('cm_user_mobile');
      localStorage.removeItem('token');
      try {
        sessionStorage.clear();
      } catch {}

      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
    } catch (err) {
      setDirectError(err.message || 'खाते हटवताना त्रुटी आली. कृपया पासवर्ड तपासा.');
    } finally {
      setDirectLoading(false);
    }
  };

  // Handle submission for unauthenticated web request
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestError('');

    if (!requestForm.identifier || !requestForm.confirmation) {
      setRequestError('कृपया नोंदणीकृत मोबाइल/ईमेल टाका आणि पुष्टीकरण चेकबॉक्स निवडा.');
      return;
    }

    setRequestLoading(true);
    try {
      const cleanInput = requestForm.identifier.trim();
      const res = await api.auth.deleteAccount({
        identifier: cleanInput,
        phone: cleanInput,
        email: cleanInput,
        id: cleanInput,
        reason: requestForm.reason,
        confirmation: true
      });

      if (!res?.data?.deleted && !res?.deleted) {
        throw new Error(res?.error || 'हा सदस्य डेटाबेसमध्ये सापडला नाही. कृपया नोंदणीकृत मोबाईल नंबर किंवा ईमेल तपासा.');
      }

      setRequestSuccess(true);
      setRequestResult(res.data || res);

      // If user is currently logged in, immediately log them out
      if (user) {
        logout();
        localStorage.removeItem('cm_logged_in');
        localStorage.removeItem('cm_user_data');
        localStorage.removeItem('cm_jwt_token');
        localStorage.removeItem('cm_user_mobile');
        localStorage.removeItem('token');
        try {
          sessionStorage.clear();
        } catch {}
      }
    } catch (err) {
      setRequestError(err.message || 'हा सदस्य किंवा मोबाईल नंबर डेटाबेसमध्ये आढळला नाही. कृपया नोंदणीकृत मोबाईल तपासा.');
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', padding: '36px 0 80px', fontFamily: "'Inter', sans-serif" }}>
      <div className="container" style={{ maxWidth: '980px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#8b1e1e',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.92rem'
            }}
          >
            ← मुख्य पृष्ठावर परत जा (Home)
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/privacy"
              style={{
                color: '#475569',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                background: '#ffffff',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              🔒 गोपनीयता धोरण (Privacy)
            </Link>
            <Link
              to="/terms"
              style={{
                color: '#475569',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                background: '#ffffff',
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              📜 नियम व अटी (Terms)
            </Link>
          </div>
        </div>

        {/* Hero Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
            borderRadius: '20px',
            color: '#FFFFFF',
            padding: '36px 32px',
            marginBottom: '28px',
            boxShadow: '0 12px 32px rgba(127, 29, 29, 0.25)',
            border: '1px solid rgba(254, 202, 202, 0.3)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.18)',
                padding: '4px 14px',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 800,
                marginBottom: '10px',
                letterSpacing: '0.5px'
              }}>
                ⚠️ Google Play Store & DPDP Act 2023 Compliant Deletion Portal
              </div>
              <h1 style={{ margin: '0 0 10px', fontSize: '2.3rem', fontFamily: 'Baloo 2, sans-serif', fontWeight: 800, lineHeight: 1.2 }}>
                खाते आणि डेटा कायमस्वरूपी हटवा
              </h1>
              <div style={{ fontSize: '1.15rem', opacity: 0.95, fontWeight: 600 }}>
                Delete Account & Associated Personal Data
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.82rem', opacity: 0.9 }}>
              <div>अधिकृत पोर्टल: <strong>Connect Maratha</strong></div>
              <div>SLA कालावधी: <strong>२४ ते ४८ तास</strong></div>
            </div>
          </div>
        </div>

        {/* Important Data Deletion Scope Notice Card */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '28px',
          border: '1px solid #fed7aa',
          boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
          marginBottom: '28px'
        }}>
          <h2 style={{ fontSize: '1.25rem', color: '#9a3412', fontFamily: 'Baloo 2, sans-serif', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>ℹ️</span> खाते हटवल्यावर काय होते? (Scope of Data Deletion)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#fef2f2', padding: '16px 20px', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: '8px', fontSize: '0.98rem' }}>
                ❌ कायमस्वरूपी नष्ट केले जाणारे तपशील:
              </div>
              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.88rem', color: '#374151', lineHeight: 1.7 }}>
                <li>संपूर्ण वैयक्तिक प्रोफाइल व छायाचित्र (Avatar/Photos)</li>
                <li>नोंदणीकृत मोबाइल क्रमांक, ईमेल पत्ता व पासवर्ड</li>
                <li>डिजिटल मराठा ओळखपत्र (Digital Membership ID Card)</li>
                <li>विवाह व व्यवसाय नोंदणी (Matrimony & Business listings)</li>
                <li>सर्व सामाजिक पोस्ट, कॉमेंट्स, पसंती व मेसेजेस</li>
              </ul>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, color: '#334155', marginBottom: '8px', fontSize: '0.98rem' }}>
                ⚖️ कायदेशीर व ऑडिट अपवाद (Statutory Retention):
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569', lineHeight: 1.7 }}>
                भारतीय आयकर कायदा व धर्मादाय आयुक्त नियमांनुसार, आपण दिलेल्या अधिकृत देणग्या किंवा आर्थिक पावत्यांच्या आर्थिक ऑडिट नोंदी कायद्यानुसार आवश्यक कालावधीसाठी सुरक्षित राखल्या जातात. इतर कोणताही वैयक्तिक डेटा राखला जात नाही.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          {(user || deletedUser) && (
            <button
              onClick={() => setActiveTab('direct')}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: activeTab === 'direct' ? '2px solid #b91c1c' : '1px solid #cbd5e1',
                background: activeTab === 'direct' ? '#fff1f2' : '#ffffff',
                color: activeTab === 'direct' ? '#991b1b' : '#475569',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              👤 सक्रिय खात्यातून त्वरित हटवा (Instant Delete)
            </button>
          )}
          <button
            onClick={() => setActiveTab('request')}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: '12px',
              border: activeTab === 'request' ? '2px solid #b91c1c' : '1px solid #cbd5e1',
              background: activeTab === 'request' ? '#fff1f2' : '#ffffff',
              color: activeTab === 'request' ? '#991b1b' : '#475569',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📋 वेब विनंती अर्ज (Web Request Form — Uninstalled App)
          </button>
        </div>

        {/* TAB 1: Direct Deletion for Authenticated Member */}
        {activeTab === 'direct' && (user || deletedUser) && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '36px',
            border: '2px solid #ef4444',
            boxShadow: '0 8px 30px rgba(239, 68, 68, 0.08)'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem', color: '#991b1b', fontFamily: 'Baloo 2, sans-serif' }}>
              सध्या लॉग-इन असलेले सदस्य खाते: {(user || deletedUser)?.name}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.92rem', color: '#64748b' }}>
              सदस्य आयडी: <strong>{(user || deletedUser)?.id || 'N/A'}</strong> | मोबाइल: <strong>{(user || deletedUser)?.phone || (user || deletedUser)?.mobile || 'N/A'}</strong> | ईमेल: <strong>{(user || deletedUser)?.email || 'N/A'}</strong>
            </p>

            {directSuccess ? (
              <div style={{
                background: '#ecfdf5',
                border: '2px solid #10b981',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
                <h4 style={{ margin: '0 0 8px', color: '#065f46', fontSize: '1.3rem' }}>
                  खाते यशस्वीरित्या नष्ट केले गेले!
                </h4>
                <p style={{ margin: '0 0 12px', color: '#047857', fontSize: '0.95rem' }}>
                  आपली सर्व वैयक्तिक माहिती सर्व्हर्सवरून कायमस्वरूपी हटवण्यात आली आहे.
                  {directResult?.requestId && (
                    <div style={{ marginTop: '8px', fontWeight: 700 }}>
                      तक्रार / विनंती क्रमांक: {directResult.requestId}
                    </div>
                  )}
                </p>
                <div style={{ fontSize: '0.92rem', color: '#065f46', fontWeight: 700, marginTop: '8px' }}>
                  🔒 आपण तात्काळ सुरक्षितपणे लॉग-आउट झाला आहात (You have been logged out immediately).
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Link
                    to="/login"
                    style={{
                      display: 'inline-block',
                      background: '#059669',
                      color: '#ffffff',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      fontSize: '0.9rem'
                    }}
                  >
                    लॉगिन पृष्ठावर जा (Go to Login)
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDirectDelete} style={{ display: 'grid', gap: '18px' }}>
                {directError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                    ❌ {directError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    खात्याचा पासवर्ड प्रविष्ट करा (Enter Password): *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="आपला पासवर्ड टाका"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1.5px solid #d1d5db',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    पुष्टीकरणासाठी खाली <strong>DELETE</strong> असे इंग्रजीत टाईप करा: *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DELETE"
                    value={directConfirmText}
                    onChange={(e) => setDirectConfirmText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1.5px solid #d1d5db',
                      fontSize: '0.95rem',
                      letterSpacing: '1px',
                      fontWeight: 700,
                      outline: 'none'
                    }}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                  <input
                    type="checkbox"
                    required
                    checked={directConfirmed}
                    onChange={(e) => setDirectConfirmed(e.target.checked)}
                    style={{ marginTop: '4px', accentColor: '#dc2626', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '0.88rem', color: '#991b1b', lineHeight: 1.5 }}>
                    <strong>मी पुष्टी करतो/करते:</strong> माझे खाते, डिजिटल सदस्य कार्ड, सामाजिक पोस्ट्स व संबंधित सर्व वैयक्तिक माहिती तात्काळ कायमस्वरूपी हटवली जावी. ही प्रक्रिया पूर्ववत (Undo) करता येणार नाही.
                  </span>
                </label>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={directLoading}
                    style={{
                      background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '14px 28px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: directLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                      opacity: directLoading ? 0.7 : 1
                    }}
                  >
                    {directLoading ? 'प्रक्रिया सुरू आहे...' : '🗑️ माझे खाते कायमचे हटवा (Permanently Delete)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    style={{
                      background: 'transparent',
                      color: '#64748b',
                      border: '1px solid #cbd5e1',
                      padding: '14px 20px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      cursor: 'pointer'
                    }}
                  >
                    रद्द करा (Cancel)
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: Web Deletion Request Form (Google Play Store compliance for all users) */}
        {activeTab === 'request' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '36px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.4rem', color: '#991b1b', fontFamily: 'Baloo 2, sans-serif' }}>
              ऑनलाइन खाते व डेटा हटवण्याची अधिकृत विनंती नोंदवा
            </h3>
            <p style={{ margin: '0 0 22px', fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6 }}>
              आपण मोबाइल अ‍ॅप अनइन्स्टॉल केले असल्यास किंवा पासवर्ड उपलब्ध नसल्यास, आपण खालील अधिकृत फॉर्मद्वारे खाते नष्ट करण्याची विनंती नोंदवू शकता. आमच्या डेटा प्रोटेक्शन अधिकाऱ्यांमार्फत २४ ते ४८ तासांत संपूर्ण डेटा सर्व्हर्सवरून नष्ट केला जातो.
            </p>

            {requestSuccess ? (
              <div style={{
                background: '#ecfdf5',
                border: '2px solid #10b981',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📋</div>
                <h4 style={{ margin: '0 0 8px', color: '#065f46', fontSize: '1.3rem' }}>
                  आपली विनंती यशस्वीरित्या नोंदवली गेली आहे!
                </h4>
                <p style={{ margin: '0 0 12px', color: '#047857', fontSize: '0.95rem' }}>
                  विनंती संदर्भ आयडी: <strong>{requestResult?.requestId || 'DEL-' + Math.floor(100000 + Math.random() * 900000)}</strong>
                </p>
                <p style={{ margin: '0', color: '#065f46', fontSize: '0.88rem', lineHeight: 1.6 }}>
                  आमच्या केंद्रीय डेटा सुरक्षा कक्षाकडून २४ ते ४८ तासांच्या आत आपल्या नोंदणीकृत संपर्कावर अंतिम पुष्टीकरण पाठवून संपूर्ण डेटा कायमचा नष्ट केला जाईल.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} style={{ display: 'grid', gap: '18px' }}>
                {requestError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                    ❌ {requestError}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    नोंदणीकृत मोबाइल क्रमांक / ईमेल किंवा सभासद आयडी (Member ID / Phone / Email): *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. 9822012345 किंवा patil@example.com किंवा CM-96K-0001"
                    value={requestForm.identifier}
                    onChange={(e) => setRequestForm({ ...requestForm, identifier: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1.5px solid #d1d5db',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#1f2937', marginBottom: '6px' }}>
                    खाते हटवण्याचे कारण (Reason for Account Deletion):
                  </label>
                  <select
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: '1.5px solid #d1d5db',
                      fontSize: '0.95rem',
                      outline: 'none',
                      background: '#fff'
                    }}
                  >
                    <option value="गोपनीयता चिंता (Privacy Concerns)">गोपनीयता चिंता (Privacy Concerns)</option>
                    <option value="नवीन खात्यासह नोंदणी करायची आहे">नवीन खात्यासह नोंदणी करायची आहे</option>
                    <option value="अ‍ॅप वापरणे थांबवले आहे">अ‍ॅप वापरणे थांबवले आहे</option>
                    <option value="खूप जास्त नोटिफिकेशन्स येतात">खूप जास्त नोटिफिकेशन्स येतात</option>
                    <option value="इतर (Other)">इतर (Other)</option>
                  </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                  <input
                    type="checkbox"
                    required
                    checked={requestForm.confirmation}
                    onChange={(e) => setRequestForm({ ...requestForm, confirmation: e.target.checked })}
                    style={{ marginTop: '4px', accentColor: '#dc2626', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '0.88rem', color: '#991b1b', lineHeight: 1.5 }}>
                    मी पुष्टी करतो/करते की या नोंदणीकृत ओळखीशी जोडलेले सर्व प्रोफाइल, सदस्य कार्ड व संबंधित डेटा २४ ते ४८ तासांत सर्व्हर्सवरून कायमस्वरूपी नष्ट केला जावा.
                  </span>
                </label>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                  <button
                    type="submit"
                    disabled={requestLoading}
                    style={{
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      padding: '14px 28px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: requestLoading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)',
                      opacity: requestLoading ? 0.7 : 1
                    }}
                  >
                    {requestLoading ? 'विनंती पाठवत आहे...' : '📋 विनंती सबमिट करा (Submit Deletion Request)'}
                  </button>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    किंवा थेट ईमेल करा: <a href="mailto:privacy@connectmaratha.com?subject=Account%20Deletion%20Request" style={{ color: '#b91c1c', fontWeight: 700 }}>privacy@connectmaratha.com</a>
                  </span>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Contact & Grievance Redressal Card */}
        <div style={{
          marginTop: '32px',
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px 28px',
          border: '1px solid #e2e8f0',
          fontSize: '0.88rem',
          lineHeight: 1.8,
          color: '#475569'
        }}>
          <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚖️</span> डेटा संरक्षण व तक्रार निवारण कक्ष (Data Protection Officer)
          </div>
          <div><strong>संस्था:</strong> अखिल भारतीय मराठा महासंघ — केंद्रीय विधी व तंत्रज्ञान विभाग</div>
          <div><strong>पत्ता:</strong> मराठा महासंघ भवन, नारायण पेठ, छत्रपती शिवाजी महाराज चौक, पुणे – ४११०३०, महाराष्ट्र.</div>
          <div><strong>ईमेल:</strong> <a href="mailto:privacy@connectmaratha.com" style={{ color: '#8b1e1e', fontWeight: 700 }}>privacy@connectmaratha.com</a> | <a href="mailto:grievance@connectmaratha.com" style={{ color: '#8b1e1e', fontWeight: 700 }}>grievance@connectmaratha.com</a></div>
          <div><strong>हेल्पलाईन:</strong> १८००-२३३-१९८१ (सोमवार ते शनिवार, सकाळी १० ते संध्याकाळी ६)</div>
        </div>

      </div>
    </div>
  );
}
