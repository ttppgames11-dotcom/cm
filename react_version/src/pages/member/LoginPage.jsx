import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState('otp'); // 'otp' or 'password'
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setMessage('कृपया वैध १० अंकी मोबाईल नंबर प्रविष्ट करा.');
      return;
    }
    setOtpSent(true);
    setMessage('तुमच्या मोबाईलवर ६ अंकी ओटीपी पाठवला आहे: [123456]');
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === '123456' || otp.length === 6) {
      login(mobile, 'otp-verified');
      navigate('/dashboard');
    } else {
      setMessage('अवैध ओटीपी! कृपया पुन्हा प्रयत्न करा.');
    }
  };

  const handlePasswordLogin = (e) => {
    e.preventDefault();
    if (!mobile || !password) {
      setMessage('कृपया मोबाईल नंबर व पासवर्ड दोन्ही भरा.');
      return;
    }
    login(mobile, password);
    navigate('/dashboard');
  };

  return (
    <div className="container py-5" style={{ padding: '50px 16px', maxWidth: '440px', margin: '0 auto' }}>
      <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', textAlign: 'center' }}>
        <img src="/assets/images/logo.png" alt="Logo" style={{ height: '56px', marginBottom: '12px' }} />
        <h1 style={{ fontSize: '1.6rem', color: 'var(--maroon-900, #D84315)', marginBottom: '4px' }}>
          सदस्य लॉगिन
        </h1>
        <p style={{ color: '#666', fontSize: '0.88rem', marginBottom: '24px' }}>
          अखिल भारतीय मराठा महासंघ डिजिटल पोर्टल
        </p>

        {/* Toggle Mode */}
        <div style={{ display: 'flex', background: '#F5F5F5', borderRadius: '8px', padding: '4px', marginBottom: '20px' }}>
          <button 
            type="button"
            onClick={() => { setAuthMode('otp'); setMessage(''); }}
            style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: authMode === 'otp' ? '#FFFFFF' : 'transparent', fontWeight: 600, color: authMode === 'otp' ? 'var(--maroon-900)' : '#666', cursor: 'pointer', boxShadow: authMode === 'otp' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none' }}>
            📱 मोबाईल OTP
          </button>
          <button 
            type="button"
            onClick={() => { setAuthMode('password'); setMessage(''); }}
            style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', background: authMode === 'password' ? '#FFFFFF' : 'transparent', fontWeight: 600, color: authMode === 'password' ? 'var(--maroon-900)' : '#666', cursor: 'pointer', boxShadow: authMode === 'password' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none' }}>
            🔒 पासवर्ड लॉगिन
          </button>
        </div>

        {message && (
          <div style={{ padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '16px', background: message.includes('पाठवला') ? '#E8F5E9' : '#FFEBEE', color: message.includes('पाठवला') ? '#2E7D32' : '#C62828' }}>
            {message}
          </div>
        )}

        {authMode === 'otp' ? (
          !otpSent ? (
            <form onSubmit={handleSendOtp} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px' }}>मोबाईल नंबर</label>
                <input 
                  type="tel"
                  placeholder="१० अंकी मोबाईल नंबर"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                ओटीपी पाठवा (Send OTP) →
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ textAlign: 'left' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px' }}>प्राप्त झालेला ६-अंकी OTP</label>
                <input 
                  type="text"
                  placeholder="उदा. 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '1.1rem', letterSpacing: '4px', textAlign: 'center' }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                लॉगिन पूर्ण करा ✓
              </button>
              <button 
                type="button" 
                onClick={() => setOtpSent(false)} 
                style={{ background: 'none', border: 'none', color: '#666', fontSize: '0.8rem', width: '100%', marginTop: '10px', cursor: 'pointer' }}>
                मोबाईल नंबर बदला
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handlePasswordLogin} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px' }}>मोबाईल नंबर</label>
              <input 
                type="tel"
                placeholder="१० अंकी मोबाईल नंबर"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                required
              />
            </div>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px' }}>पासवर्ड</label>
              <input 
                type="password"
                placeholder="पासवर्ड प्रविष्ट करा"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCC', fontSize: '0.95rem' }}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
              लॉगिन करा →
            </button>
          </form>
        )}

        <div style={{ borderTop: '1px solid #EEE', marginTop: '24px', paddingTop: '16px', fontSize: '0.88rem' }}>
          नवीन सदस्य आहात का? <Link to="/register" style={{ color: 'var(--maroon-900)', fontWeight: 700 }}>येथे नोंदणी करा</Link>
        </div>
      </div>
    </div>
  );
}
