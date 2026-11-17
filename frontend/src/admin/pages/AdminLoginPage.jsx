import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMagazineAdmin } from '../context/MagazineAdminContext';
import '../styles/admin.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useMagazineAdmin();
  const [email, setEmail] = useState('admin@connectmaratha.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('कृपया ईमेल आणि पासवर्ड दोन्ही भरा.');
      return;
    }

    const success = login(email, password);
    if (success) {
      navigate('/admin/dashboard');
    } else {
      setError('लॉगिन अयशस्वी. कृपया तपशील तपासा.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0B1120',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(244, 81, 11, 0.12) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(30, 41, 59, 0.4) 0px, transparent 50%)',
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <div className="cm-card" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '36px 32px',
        borderRadius: '16px',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Logo and Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 14px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F4510B 0%, #D84315 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(244, 81, 11, 0.35)'
          }}>
            CM
          </div>

          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
            CONNECT MARATHA
          </h2>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#F4510B', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Magazine Administration Suite
          </span>
          <p style={{ color: '#64748B', fontSize: '0.84rem', margin: '8px 0 0', fontWeight: 500 }}>
            मासिक पत्रिका व्यवस्थापन, अंक निर्मिती व संपादकीय नियंत्रण पॅनेल
          </p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: '#FEE2E2',
            color: '#DC2626',
            borderRadius: '8px',
            marginBottom: '18px',
            fontSize: '0.84rem',
            fontWeight: 700
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              प्रशासकीय ईमेल (Admin Email)
            </label>
            <input 
              type="email"
              required
              className="cm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@connectmaratha.com"
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                पासवर्ड (Password)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#F4510B', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                {showPassword ? 'लपवा (Hide)' : 'दाखवा (Show)'}
              </button>
            </div>
            <input 
              type={showPassword ? 'text' : 'password'}
              required
              className="cm-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', cursor: 'pointer', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
                style={{ accentColor: '#F4510B' }}
              />
              लॉगिन लक्षात ठेवा
            </label>
            <span style={{ color: '#F4510B', fontWeight: 700, fontSize: '0.78rem' }}>
              डेमो: admin123
            </span>
          </div>

          <button
            type="submit"
            className="cm-btn cm-btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.94rem', marginTop: '4px' }}
          >
            सुरक्षित लॉगिन करा (Login to Admin) ➔
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
          <a href="/magazine" style={{ color: '#64748B', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}>
            ← मुख्य मॅगझिन वेबसाइटवर परत जा
          </a>
        </div>
      </div>
    </div>
  );
}
