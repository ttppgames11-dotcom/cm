import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkRepetitiveInput } from '../../utils/memberValidation';

const PERSONAS = [
  { id: 'Professional', title: 'व्यावसायिक (Professional)', icon: '💼' },
  { id: 'Entrepreneur', title: 'उद्योजक (Entrepreneur)', icon: '🚀' },
  { id: 'Student', title: 'विद्यार्थी (Student)', icon: '🎓' },
  { id: 'Business Owner', title: 'व्यापारी (Business Owner)', icon: '🏢' },
  { id: 'Freelancer', title: 'फ्रीलान्सर (Freelancer)', icon: '🎯' },
  { id: 'Researcher', title: 'संशोधक (Researcher)', icon: '🔬' }
];

const INTERESTS = [
  { id: 'इतिहास', label: 'इतिहास (History)', icon: '📜' },
  { id: 'गड-किल्ले', label: 'गड-किल्ले (Forts)', icon: '🏰' },
  { id: 'उद्योग', label: 'उद्योग (Business)', icon: '📈' },
  { id: 'स्टार्टअप्स', label: 'स्टार्टअप्स (Startups)', icon: '🌱' },
  { id: 'शिक्षण', label: 'शिक्षण (Education)', icon: '📚' },
  { id: 'तंत्रज्ञान', label: 'तंत्रज्ञान (Tech)', icon: '💻' },
  { id: 'करिअर', label: 'करिअर (Career)', icon: '📊' },
  { id: 'जागतिक नेटवर्क', label: 'Global Network', icon: '🌍' },
  { id: 'संस्कृती', label: 'संस्कृती (Culture)', icon: '🎭' },
  { id: 'क्रीडा', label: 'क्रीडा (Sports)', icon: '🏆' },
  { id: 'पर्यटन', label: 'पर्यटन (Travel)', icon: '✈️' },
  { id: 'पर्यावरण', label: 'पर्यावरण व शेती', icon: '🌾' }
];

const CONNECT_GOALS = [
  'माझ्या क्षेत्रातील बांधव व तज्ज्ञांशी जोडले जाणे',
  'मराठा व्यवसाय व उद्योग शोधणे आणि सहकार्य करणे',
  'मार्गदर्शक (Mentors) मिळवणे',
  'करिअर संधी, नोकऱ्या व टेंडर्स शोधणे',
  'बिझनेस संगम (Business Sangam) मंडळात सहभागी होणे',
  'सामाजिक व सेवा उपक्रमांमध्ये योगदान देणे',
  'ऐतिहासिक संशोधन, गड-किल्ले संवर्धन अभ्यासणे',
  'मराठा विचारवंत व कर्तृत्ववान व्यक्तींचे विचार जाणून घेणे',
  'आगामी परिषद व कार्यक्रमांची माहिती मिळवणे'
];

export default function RegisterWizardPage() {
  const [activeScreen, setActiveScreen] = useState('signup');
  const [validationError, setValidationError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: 'पुरुष',
    state: 'महाराष्ट्र',
    city: 'पुणे',
    avatar: '👤',
    persona: 'Professional',
    profession: '',
    organization: '',
    experience: '',
    interests: ['इतिहास', 'गड-किल्ले', 'उद्योग', 'शिक्षण', 'करिअर'],
    goals: [
      'माझ्या क्षेत्रातील बांधव व तज्ज्ञांशी जोडले जाणे',
      'मराठा व्यवसाय व उद्योग शोधणे आणि सहकार्य करणे',
      'करिअर संधी, नोकऱ्या व टेंडर्स शोधणे',
      'बिझनेस संगम (Business Sangam) मंडळात सहभागी होणे',
      'ऐतिहासिक संशोधन, गड-किल्ले संवर्धन अभ्यासणे'
    ],
    language: 'mr'
  });

  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInterestToggle = (id) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id]
    }));
  };

  const handleGoalToggle = (goal) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    // Non-repetitive input validation
    const nameCheck = checkRepetitiveInput(formData.name, 'name');
    if (!nameCheck.isValid) {
      setValidationError(nameCheck.message);
      return;
    }

    const phoneCheck = checkRepetitiveInput(formData.mobile, 'phone');
    if (!phoneCheck.isValid) {
      setValidationError(phoneCheck.message);
      return;
    }

    const emailCheck = checkRepetitiveInput(formData.email, 'email');
    if (!emailCheck.isValid) {
      setValidationError(emailCheck.message);
      return;
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setValidationError('दोन्ही पासवर्ड जुळत नाहीत (Passwords do not match).');
      return;
    }

    setActiveScreen('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteRegistration = async () => {
    setValidationError('');
    const memberPayload = {
      name: formData.name.trim(),
      email: formData.email ? formData.email.trim() : '',
      phone: formData.mobile ? formData.mobile.trim() : '',
      password: formData.password,
      city: formData.city || 'पुणे',
      district: (formData.city || 'पुणे').split(' ')[0],
      state: formData.state || 'महाराष्ट्र',
      country: 'भारत',
      profession: formData.profession ? formData.profession.trim() : '',
      business: formData.organization ? formData.organization.trim() : '',
      education: formData.education || '',
      skills: formData.skills ? (Array.isArray(formData.skills) ? formData.skills : [formData.skills]) : [],
      about: formData.about || ''
    };

    if (register) {
      const res = await register(memberPayload);
      if (!res || !res.success) {
        setValidationError(res?.error || 'नोंदणी अयशस्वी झाली. कृपया माहिती तपासा.');
        return;
      }
    }

    setActiveScreen('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ background: '#f4efe6', color: '#2b2420', minHeight: 'calc(100vh - 120px)', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .devnav {
          position: sticky; top: 0; z-index: 1000;
          background: linear-gradient(90deg, #3d0d0d 0%, #5c1414 100%);
          display: flex; gap: 4px; overflow-x: auto;
          padding: 6px 14px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          border-bottom: 2px solid #f0b866;
        }
        .devnav button {
          appearance: none; border: none; background: transparent;
          color: #e8d9c8; font-size: 12.5px; font-weight: 600;
          padding: 10px 14px; cursor: pointer; white-space: nowrap;
          border-radius: 8px; border-bottom: 3px solid transparent;
          transition: all .18s ease;
        }
        .devnav button:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .devnav button.active { color: #fff; background: rgba(221,138,46,0.18); border-bottom-color: #dd8a2e; font-weight: 700; }

        .onboarding-stage {
          min-height: calc(100vh - 160px);
          display: flex; align-items: center; justify-content: center;
          padding: 36px 18px 60px;
        }
        .split-card {
          display: grid; grid-template-columns: 1.05fr 1fr;
          width: 100%; max-width: 1020px; min-height: 620px;
          background: #fff; border-radius: 22px; overflow: hidden;
          box-shadow: 0 24px 60px -18px rgba(61,13,13,0.45);
          border: 1px solid #e6ddce;
        }
        .visual-pane {
          position: relative; background-size: cover; background-position: center;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 36px; color: #fff;
        }
        .visual-pane::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(30,10,8,0.65) 0%, rgba(30,10,8,0.25) 38%, rgba(20,8,6,0.35) 62%, rgba(15,6,5,0.92) 100%);
        }
        .visual-pane > * { position: relative; z-index: 1; }
        .form-pane {
          padding: 40px 44px 36px;
          display: flex; flex-direction: column;
          overflow-y: auto; background: #fff;
        }
        .input-box {
          display: flex; align-items: center;
          border: 1.5px solid #e6ddce; border-radius: 10px;
          background: #fff; transition: border-color .15s, box-shadow .15s;
          overflow: hidden;
        }
        .input-box:focus-within {
          border-color: #c9701c;
          box-shadow: 0 0 0 3.5px rgba(201,112,28,0.18);
        }
        .input-box .prefix {
          padding: 0 12px; font-size: 14px; color: #5c534b; font-weight: 600;
          border-right: 1.5px solid #e6ddce; height: 44px; display: flex; align-items: center; background: #faf7f2;
        }
        .input-box input, .input-box select, .input-box textarea {
          border: none; outline: none; flex: 1; padding: 12px 14px; font-size: 14.5px;
          color: #2b2420; background: transparent; min-width: 0;
        }
        .opt-grid-card {
          border: 1.5px solid #e6ddce; border-radius: 12px; padding: 16px 10px;
          display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer;
          text-align: center; font-size: 13px; font-weight: 700; color: #2b2420;
          background: #fff; position: relative; transition: all .15s ease;
          user-select: none;
        }
        .opt-grid-card:hover { border-color: #dd8a2e; transform: translateY(-2px); }
        .opt-grid-card.selected { border-color: #c9701c; background: #fdf3e6; box-shadow: 0 0 0 3px rgba(221,138,46,0.18); }
        .btn-brand-primary {
          width: 100%; padding: 13px; border-radius: 10px; border: none; cursor: pointer;
          font-weight: 700; font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #7a1c1c, #3d0d0d); color: #fff;
          box-shadow: 0 10px 22px -8px rgba(92,20,20,0.55);
        }
        .btn-brand-primary:hover { background: linear-gradient(135deg, #8f2020, #5c1414); }
        .btn-brand-outline {
          padding: 13px 20px; border-radius: 10px; border: 1.5px solid #e6ddce; background: #fff;
          color: #2b2420; font-weight: 700; cursor: pointer;
        }
        .otp-inputs {
          display: flex; gap: 10px; justify-content: center; margin: 20px 0;
        }
        .otp-inputs input {
          width: 46px; height: 52px; text-align: center; font-size: 22px; font-weight: 800;
          border: 2px solid #e6ddce; border-radius: 10px; outline: none;
        }
        .otp-inputs input:focus { border-color: #c9701c; box-shadow: 0 0 0 3px rgba(201,112,28,0.2); }
        @media (max-width: 860px) {
          .split-card { grid-template-columns: 1fr; }
          .visual-pane { min-height: 200px; padding: 24px; }
          .form-pane { padding: 30px 20px; }
        }
      `}</style>

      {/* Screen Navigation Bar */}
      <nav className="devnav">
        {[
          { id: 'signup', label: '१. नवीन नोंदणी' },
          { id: 'profile', label: '२. प्रोफाईल' },
          { id: 'persona', label: '३. भूमिका' },
          { id: 'interests', label: '४. आवडी' },
          { id: 'connect', label: '५. जोडणी प्राधान्य' },
          { id: 'welcome', label: '६. पूर्ण' }
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            className={activeScreen === s.id ? 'active' : ''}
            onClick={() => setActiveScreen(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="onboarding-stage">
        {/* ============ 1. SIGNUP ============ */}
        {activeScreen === 'signup' && (
          <div className="split-card">
            <div className="visual-pane" style={{ backgroundImage: "url('/assets/images/real-pratapgad-fort.jpg')" }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/assets/images/logo.png" alt="Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
                <div>
                  <span style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#f0ded0', textTransform: 'uppercase', display: 'block' }}>Connect</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#fff', display: 'block' }}>मराठा</span>
                </div>
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, lineHeight: 1.8, textShadow: '0 2px 12px rgba(0,0,0,0.65)' }}>
                समाज संवर्धन<br />व्यक्ती विकास<br />समृद्ध महाराष्ट्र
              </div>
              <div style={{ fontSize: '13px', color: '#e9dccb' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Connect Maratha
                </div>
                A platform for community, culture, and opportunity
              </div>
            </div>

            <div className="form-pane">
              <div style={{ alignSelf: 'flex-end', fontSize: '13px', color: '#5c534b', marginBottom: '8px' }}>
                आधीच खाते आहे? <Link to="/login" style={{ color: '#7a1c1c', fontWeight: 700, textDecoration: 'none' }}>लॉगिन करा (Log in)</Link>
              </div>
              <h1 style={{ fontFamily: 'Baloo 2', fontSize: '26px', fontWeight: 700, margin: '12px 0 4px', color: '#2b2420' }}>
                नवीन खाते तयार करा
              </h1>
              <p style={{ color: '#5c534b', fontSize: '14px', margin: '0 0 24px' }}>
                स्वराज्य, संस्कृती आणि संधींच्या महाजालात सहभागी व्हा.
              </p>

              <form onSubmit={handleSignupSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>पूर्ण नाव (Full name)</label>
                  <div className="input-box">
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="उदा. संभाजी विलासराव पाटील"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>मोबाईल नंबर (Mobile number)</label>
                  <div className="input-box">
                    <span className="prefix">+91</span>
                    <input
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="९८७६५ ४३२१०"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>ईमेल पत्ता (Email address)</label>
                  <div className="input-box">
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>पासवर्ड</label>
                    <div className="input-box">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="किमान ८ अक्षरे"
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>पासवर्ड निश्चित करा</label>
                    <div className="input-box">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="पुन्हा पासवर्ड टाका"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#5c534b', margin: '10px 0 20px' }}>
                  <input type="checkbox" defaultChecked required style={{ marginTop: '3px', accentColor: '#7a1c1c' }} />
                  <span>
                    मी Connect Maratha चे नियम व अटी आणि गोपनीयता धोरण (DPDP 2023) मान्य करतो.
                  </span>
                </div>

                {validationError && (
                  <div style={{
                    color: '#991B1B',
                    background: '#FEE2E2',
                    border: '1.5px solid #F87171',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>⚠️</span>
                    <span>{validationError}</span>
                  </div>
                )}

                <button type="submit" className="btn-brand-primary">
                  खाते तयार करा (Create account) →
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13.5px', color: '#5c534b' }}>
                आधीच नोंदणीकृत आहात? <Link to="/login" style={{ color: '#7a1c1c', fontWeight: 700, textDecoration: 'none' }}>लॉगिन करा</Link>
              </div>
            </div>
          </div>
        )}

        {/* ============ 2. OTP ============ */}


        {/* ============ 3. PROFILE ============ */}
        {activeScreen === 'profile' && (
          <div style={{ width: '100%', maxWidth: '780px' }}>
            <div style={{ background: '#fff', borderRadius: '22px', boxShadow: '0 24px 60px -18px rgba(61,13,13,0.45)', overflow: 'hidden', border: '1px solid #e6ddce', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'Baloo 2', fontSize: '24px', fontWeight: 700, margin: 0 }}>
                  आपली प्रोफाईल पूर्ण करा (Step 1 of 4)
                </h2>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#a89d90', background: '#faf7f2', padding: '4px 10px', borderRadius: '6px' }}>
                  Step 1
                </span>
              </div>
              <p style={{ color: '#5c534b', fontSize: '14px', marginBottom: '24px' }}>
                आपल्याबद्दलची प्राथमिक माहिती द्या जेणेकरून समुदाय आपल्याला ओळखू शकेल.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#faf7f2', border: '2px dashed #a89d90', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                  {formData.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', marginBottom: '3px' }}>प्रोफाईल फोटो / चिन्ह</div>
                  <div style={{ fontSize: '12.5px', color: '#a89d90' }}>इतरांना आपली ओळख पटण्यास मदत होते</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>पूर्ण नाव (Full name)</label>
                <div className="input-box">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>प्रदर्शित नाव (Display name)</label>
                <div className="input-box">
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>राज्य (State)</label>
                  <div className="input-box">
                    <select value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })}>
                      <option>महाराष्ट्र (Maharashtra)</option>
                      <option>गोवा</option>
                      <option>कर्नाटक</option>
                      <option>इतर राज्य</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>शहर / जिल्हा</label>
                  <div className="input-box">
                    <select value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}>
                      <option>पुणे (Pune)</option>
                      <option>मुंबई (Mumbai)</option>
                      <option>सातारा (Satara)</option>
                      <option>कोल्हापूर (Kolhapur)</option>
                      <option>नाशिक (Nashik)</option>
                      <option>छत्रपती संभाजीनगर</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-brand-outline" onClick={() => setActiveScreen('signup')}>
                  ← मागे
                </button>
                <button type="button" className="btn-brand-primary" onClick={() => setActiveScreen('persona')}>
                  पुढे चला (Continue) →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ 4. PERSONA ============ */}
        {activeScreen === 'persona' && (
          <div style={{ width: '100%', maxWidth: '780px' }}>
            <div style={{ background: '#fff', borderRadius: '22px', boxShadow: '0 24px 60px -18px rgba(61,13,13,0.45)', overflow: 'hidden', border: '1px solid #e6ddce', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontFamily: 'Baloo 2', fontSize: '24px', fontWeight: 700, margin: 0 }}>
                  आपली मुख्य ओळख काय आहे? (Step 2 of 4)
                </h2>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#a89d90', background: '#faf7f2', padding: '4px 10px', borderRadius: '6px' }}>
                  Step 2
                </span>
              </div>
              <p style={{ color: '#5c534b', fontSize: '14px', marginBottom: '20px' }}>
                आपली प्राथमिक व्यावसायिक किंवा वैयक्तिक भूमिका निवडा.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {PERSONAS.map((p) => {
                  const isSel = formData.persona === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`opt-grid-card ${isSel ? 'selected' : ''}`}
                      onClick={() => setFormData({ ...formData, persona: p.id })}
                    >
                      <span style={{ fontSize: '24px' }}>{p.icon}</span>
                      <span>{p.title}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  व्यवसाय किंवा पद (Profession / Designation)
                </label>
                <div className="input-box">
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  कंपनी किंवा संस्थेचे नाव (Organization / Company)
                </label>
                <div className="input-box">
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-brand-outline" onClick={() => setActiveScreen('profile')}>
                  ← मागे
                </button>
                <button type="button" className="btn-brand-primary" onClick={() => setActiveScreen('interests')}>
                  पुढे चला (Continue) →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ 5. INTERESTS ============ */}
        {activeScreen === 'interests' && (
          <div style={{ width: '100%', maxWidth: '780px' }}>
            <div style={{ background: '#fff', borderRadius: '22px', boxShadow: '0 24px 60px -18px rgba(61,13,13,0.45)', overflow: 'hidden', border: '1px solid #e6ddce', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontFamily: 'Baloo 2', fontSize: '24px', fontWeight: 700, margin: 0 }}>
                  आपली आवड कशात आहे? (Step 3 of 4)
                </h2>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#a89d90', background: '#faf7f2', padding: '4px 10px', borderRadius: '6px' }}>
                  Step 3
                </span>
              </div>
              <p style={{ color: '#5c534b', fontSize: '14px', marginBottom: '20px' }}>
                आपल्याला ज्या विषयांमध्ये रस आहे ते निवडा — एकापेक्षा अधिक पर्याय निवडू शकता.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {INTERESTS.map((item) => {
                  const isSel = formData.interests.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`opt-grid-card ${isSel ? 'selected' : ''}`}
                      onClick={() => handleInterestToggle(item.id)}
                    >
                      <span style={{ fontSize: '22px' }}>{item.icon}</span>
                      <span style={{ fontSize: '12px' }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-brand-outline" onClick={() => setActiveScreen('persona')}>
                  ← मागे
                </button>
                <button type="button" className="btn-brand-primary" onClick={() => setActiveScreen('connect')}>
                  पुढे चला (Continue) →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ 6. CONNECT PREFERENCES ============ */}
        {activeScreen === 'connect' && (
          <div style={{ width: '100%', maxWidth: '780px' }}>
            <div style={{ background: '#fff', borderRadius: '22px', boxShadow: '0 24px 60px -18px rgba(61,13,13,0.45)', overflow: 'hidden', border: '1px solid #e6ddce', padding: '36px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={{ fontFamily: 'Baloo 2', fontSize: '24px', fontWeight: 700, margin: 0 }}>
                  आपण कसे जोडले जाऊ इच्छिता? (Step 4 of 4)
                </h2>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#a89d90', background: '#faf7f2', padding: '4px 10px', borderRadius: '6px' }}>
                  Step 4
                </span>
              </div>
              <p style={{ color: '#5c534b', fontSize: '14px', marginBottom: '20px' }}>
                आपल्या प्राधान्यानुसार उद्दिष्टे निवडा:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {CONNECT_GOALS.map((goal, idx) => {
                  const isChecked = formData.goals.includes(goal);
                  return (
                    <label
                      key={idx}
                      onClick={() => handleGoalToggle(goal)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: isChecked ? '#fdf3e6' : '#faf7f2',
                        border: isChecked ? '1.5px solid #c9701c' : '1px solid #e6ddce',
                        cursor: 'pointer',
                        fontSize: '13.5px',
                        fontWeight: isChecked ? 700 : 500
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ accentColor: '#7a1c1c', width: '16px', height: '16px' }}
                      />
                      <span>{goal}</span>
                    </label>
                  );
                })}
              </div>

              {validationError && (
                <div style={{
                  color: '#991B1B',
                  background: '#FEE2E2',
                  border: '1.5px solid #F87171',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  ⚠️ {validationError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-brand-outline" onClick={() => setActiveScreen('interests')}>
                  ← मागे
                </button>
                <button type="button" className="btn-brand-primary" onClick={handleCompleteRegistration}>
                  नोंदणी पूर्ण करा (Finish Registration) →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============ 7. WELCOME ============ */}
        {activeScreen === 'welcome' && (
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              textAlign: 'center',
              color: '#fff',
              padding: '60px 32px',
              borderRadius: '26px',
              position: 'relative',
              overflow: 'hidden',
              backgroundImage: "url('/assets/images/real-raigad-mahadarwaja.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: '0 24px 60px -18px rgba(61,13,13,0.45)',
              minHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(20,10,6,0.55), rgba(15,7,5,0.75) 55%, rgba(10,5,4,0.96) 100%)'
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#fff', color: '#7a1c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 20px', fontWeight: 800 }}>
                ✓
              </div>
              <h2 style={{ fontFamily: 'Baloo 2', fontSize: '28px', margin: '0 0 8px', color: '#fff' }}>
                Connect Maratha मध्ये स्वागत!
              </h2>
              <div style={{ color: '#e9dccb', fontSize: '15px', marginBottom: '18px' }}>
                आपले खाते यशस्वीरीत्या सक्रिय झाले आहे.
              </div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#f0ded0', marginBottom: '32px' }}>
                🚩 जपा इतिहास • जोडा समाज • घडवा भविष्य
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                <Link
                  to="/card"
                  className="btn btn-primary"
                  style={{ background: '#fff', color: '#7a1c1c', padding: '12px 24px', fontWeight: 800, textDecoration: 'none', borderRadius: '10px' }}
                >
                  🪪 माझे डिजिटल ओळखपत्र पहा →
                </Link>
                <Link
                  to="/dashboard"
                  className="btn btn-outline"
                  style={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', padding: '12px 24px', textDecoration: 'none', borderRadius: '10px' }}
                >
                  👤 सदस्य डॅशबोर्डवर जा
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
