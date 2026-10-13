import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';

const isUserLoggedIn = (user) => {
  if (!user) return false;
  if (!user.id && !user._id && !user.phone) return false;
  if (typeof window !== 'undefined') {
    if (localStorage.getItem('cm_logged_in') !== 'true') return false;
  }
  return true;
};

export default function SiteFooter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getContent } = useSiteContent();

  const loggedIn = isUserLoggedIn(user);

  const handleFooterClickCapture = (e) => {
    if (loggedIn) return;

    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Allow auth pages and direct protocols
    if (
      href === '/login' ||
      href.startsWith('/login?') ||
      href.startsWith('/login/') ||
      href === '/register' ||
      href.startsWith('/register?') ||
      href.startsWith('/register/') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('http')
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const title = (anchor.textContent || anchor.getAttribute('title') || 'सुविधा').trim().replace(/\s+/g, ' ').slice(0, 50);
    sessionStorage.setItem('cm_login_redirect', href);

    if (typeof window !== 'undefined' && typeof window.__cmOpenLoginPrompt === 'function') {
      window.__cmOpenLoginPrompt(href, title);
    } else {
      navigate(`/login?redirect=${encodeURIComponent(href)}`);
    }
  };

  return (
    <>
      {/* ========== QUOTE BANNER ========== */}
      <div style={{
        position: 'relative',
        background: 'url("/assets/images/foot2.jpeg") center/cover no-repeat',
        color: '#431407',
        textAlign: 'center',
        padding: '50px 24px',
        borderTop: '2px solid rgba(254, 215, 170, 0.35)'
      }}>
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '860px',
          margin: '0 auto'
        }}>
          <div className="quote-banner-text" style={{ fontSize: 'clamp(1.15rem, 3.8vw, 1.55rem)', fontWeight: 900, color: '#431407', fontFamily: 'Baloo 2, sans-serif', letterSpacing: '0.5px', textShadow: '0 1px 3px rgba(255, 255, 255, 0.9)', wordBreak: 'break-word', padding: '0 10px', lineHeight: 1.35 }}>
            " मराठा तितुका मेळवावा । महाराष्ट्र धर्म वाढवावा ॥ "
          </div>
          <span style={{ display: 'block', margin: '8px 0 0', fontSize: 'clamp(0.82rem, 2.6vw, 1rem)', color: '#7C2D12', fontWeight: 800, textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)', padding: '0 10px' }}>
            — समर्थ रामदास स्वामी · शिवकालीन ऐतिहासिक संदेश
          </span>
        </div>
      </div>

      {/* ========== FOOTER (Streamlined, Non-repetitive, High-Trust) ========== */}
      <footer className="website-footer" onClickCapture={handleFooterClickCapture}>
        <div className="footer-grid">
          {/* Column 1: Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <img src={getContent('images.brandLogo', '/assets/images/logo.png')} alt="Connect Maratha" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>{getContent('header.brandTitle', 'CONNECT मराठा')}</span>
            </div>
            <p className="footer-brand-copy" style={{ fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '14px', color: '#FFFFFF', opacity: 0.95 }}>
              {getContent('texts.footerAbout', 'Connect Maratha (कनेक्ट मराठा) हे जागतिक मराठा समाजाचे अधिकृत डिजिटल व्यासपीठ आहे — रोजगार संधी, बिझनेस संगम, ऐतिहासिक वारसा आणि समाज सक्षमीकरण.')}
            </p>
            <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,204,128,0.3)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.8rem', color: '#FFF3E0' }}>
              📞 समाज हेल्पलाईन: <strong>{getContent('forms.contactSupport.emergencyHelpline', '१८००-१२३-१६७४')}</strong><br />
              ✉️ अधिकृत ईमेल: <a href="mailto:support@connectmaratha.com" style={{ color: '#FDE047', fontWeight: 700, textDecoration: 'none' }}>support@connectmaratha.com</a><br />
              🔒 <strong>DPDP Act, 2023 सुसंगत:</strong> डेटा गोपनीयता व एन्क्रिप्शन.
            </div>
          </div>

          {/* Column 2: इतिहास व वारसा */}
          <div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.35)', paddingBottom: '8px' }}>
              इतिहास व वारसा
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/article/babasaheb-purandare-shivcharitra-kathan-bhag-1" style={{ color: '#FDE047', fontWeight: 700, textDecoration: 'none' }}>🚩 शिवचरित्र कथन (१० भाग)</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/history/granthalaya" style={{ color: '#FFFFFF', textDecoration: 'none' }}>📚 मराठा महाग्रंथालय व बखरी</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/history" style={{ color: '#FFFFFF', textDecoration: 'none' }}>📜 मराठा इतिहास कालपट</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/culture" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🌍 ८ प्रादेशिक सांस्कृतिक प्रोफाइल</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/culture/dialects" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🗣️ महाराष्ट्राच्या बोली व उच्चार</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/culture/food" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🍲 खाद्यसंस्कृती व उगम इतिहास</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/culture/gramdevat-jatra" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🛕 ग्रामदैवत, जत्रा व पारंपरिक खेळ</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/culture/heritage-map" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🗺️ परस्परसंवादी वारसा नकाशा</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/history/knowledge-graph" style={{ color: '#FFFFFF', textDecoration: 'none' }}>⚡ घटना ↔ स्थळे नॉलेज ग्राफ</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/community/oral-history" style={{ color: '#FFFFFF', textDecoration: 'none' }}>✍️ मौखिक इतिहास संकलन (Tier 4)</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/forts" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🏰 सह्याद्रीचे ३५०+ गडकिल्ले</Link></li>
            </ul>
          </div>

          {/* Column 3: व्यवसाय व संगम */}
          <div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.35)', paddingBottom: '8px' }}>
              व्यवसाय व करिअर
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/business/directory" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🏢 मराठा व्यवसाय निर्देशिका</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/sangam" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🤝 व्यवसाय संगम (Chapters)</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/jobs" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🛠️ व्यावसायिक सेवा बुकिंग</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/jobs" style={{ color: '#FFFFFF', textDecoration: 'none' }}>💼 रोजगार व करिअर केंद्र</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/jobs" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🎓 उच्च शिक्षण व शिष्यवृत्ती</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/about" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🌟 राष्ट्रीय मराठा गौरव</Link></li>
            </ul>
          </div>

          {/* Column 4: संस्था व धोरणे */}
          <div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.35)', paddingBottom: '8px' }}>
              संस्था व प्रशासन
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/roles-matrix" style={{ color: '#FFE082', fontWeight: 800, textDecoration: 'none' }}>⚖️ ५६ पदे व पात्रता मॅट्रिक्स (Roles Matrix)</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/about" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🏛️ संस्था परिचय व सल्लागार मंडळ</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/governance" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🎯 व्हिजन, मिशन व धोरण</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/privacy" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🔒 गोपनीयता धोरण (Privacy Policy)</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/terms" style={{ color: '#FFFFFF', textDecoration: 'none' }}>📜 नियम व अटी (Terms & Conditions)</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/profile" style={{ color: '#FFFFFF', textDecoration: 'none' }}>⚙️ खाते व वैयक्तिक सेटिंग्ज</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/community" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🔔 एकात्मिक सूचना केंद्र</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/goals" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🏆 प्रमुख उद्दिष्टे व संकल्प</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/contact" style={{ color: '#FFFFFF', textDecoration: 'none' }}>☎️ संपर्क व तक्रार निवारण</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy" style={{ color: '#FFFFFF', opacity: 0.95, fontSize: '0.85rem' }}>
            {getContent('footer.copyright', '© २०२६ Connect Maratha · सर्व हक्क सुरक्षित')}
          </p>
          <p className="footer-jai" style={{ color: '#FFFFFF', fontWeight: 700, margin: '6px 0' }}>
            ॥ जय भवानी, जय शिवाजी ॥ प्रौढ प्रताप पुरंधर क्षत्रियकुलावतंस सिंहासनाधीश्वर छत्रपती शिवाजी महाराज की जय!
          </p>
          <p className="footer-admin" style={{ fontSize: '0.75rem', marginTop: '8px' }}>
            <Link to="/governance" style={{ color: '#FFF3E0', opacity: 0.9 }}>DPDP धोरण व सनद</Link> | <Link to="/goals" style={{ color: '#FFF3E0', opacity: 0.9 }}>उद्दिष्टे व संकल्प</Link> | <Link to="/contact" style={{ color: '#FFF3E0', opacity: 0.9 }}>मदत व संपर्क</Link> | <Link to="/login" style={{ color: '#FFF3E0', opacity: 0.9 }}>सभासद लॉगिन</Link>
          </p>
        </div>
      </footer>
    </>
  );
}
