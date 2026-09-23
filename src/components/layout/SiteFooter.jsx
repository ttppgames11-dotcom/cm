import React from 'react';
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <>
      {/* ========== QUOTE BANNER ========== */}
      <div style={{ background: 'linear-gradient(135deg, var(--maroon-900, #D84315), var(--maroon-800, #E65100))', color: '#FFFFFF', textAlign: 'center', padding: '44px 24px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFE082', maxWidth: '800px', margin: '0 auto' }}>
          " मराठा तितुका मेळवावा । महाराष्ट्र धर्म वाढवावा ॥ "
        </div>
        <span style={{ display: 'block', margin: '10px 0 0', fontSize: '0.88rem', color: 'rgba(255,255,255,0.92)' }}>
          — समर्थ रामदास स्वामी · शिवकालीन ऐतिहासिक संदेश
        </span>
      </div>

      {/* ========== FOOTER (Streamlined, Non-repetitive, High-Trust) ========== */}
      <footer className="website-footer">
        <div className="footer-grid">
          {/* Column 1: Brand & Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <img src="/assets/images/logo.png" alt="Connect Maratha" style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '50%' }} />
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>CONNECT मराठा</span>
            </div>
            <p className="footer-brand-copy" style={{ fontSize: '0.86rem', lineHeight: 1.6, marginBottom: '14px', color: '#FFFFFF', opacity: 0.95 }}>
              भूतकाळातून प्रेरणा • वर्तमानात जोडणी • भविष्यासाठी उभारणी. अखंड मराठा इतिहास, संस्कृती, व्यवसाय आणि सामाजिक एकतेचे अधिकृत डिजिटल व्यासपीठ.
            </p>
            <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,204,128,0.3)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.8rem', color: '#FFF3E0' }}>
              📞 समाज हेल्पलाईन: <strong>१८००-१२३-१६७४</strong><br />
              🔒 <strong>DPDP Act, 2023 सुसंगत:</strong> डेटा गोपनीयता व एन्क्रिप्शन.
            </div>
          </div>

          {/* Column 2: इतिहास व वारसा */}
          <div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.35)', paddingBottom: '8px' }}>
              इतिहास व वारसा
            </h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><Link to="/history" style={{ color: '#FFFFFF', textDecoration: 'none' }}>📜 मराठा इतिहास कालपट</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/history/battles" style={{ color: '#FFFFFF', textDecoration: 'none' }}>⚔️ प्रमुख ७ रणांगणे व व्यूहरचना</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/forts" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🏰 महाराष्ट्रातील ३५०+ किल्ले नकाशा</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/history/balidan-maas" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🕯️ धर्मवीर बलिदान मास स्मरण</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/history/granthalaya" style={{ color: '#FFFFFF', textDecoration: 'none' }}>📚 मराठा महाग्रंथालय व बखरी</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/gallery" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🖼️ आपुला महाराष्ट्र छायाचित्र दालन</Link></li>
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
              <li style={{ marginBottom: '8px' }}><Link to="/about" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🏛️ संस्था परिचय व सल्लागार मंडळ</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/governance" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🎯 व्हिजन, मिशन व धोरण</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/governance" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🔒 DPDP २०२३ गोपनीयता धोरण</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/profile" style={{ color: '#FFFFFF', textDecoration: 'none' }}>⚙️ खाते व वैयक्तिक सेटिंग्ज</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/community" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🔔 एकात्मिक सूचना केंद्र</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/governance" style={{ color: '#FFFFFF', textDecoration: 'none' }}>🧭 मास्टर ब्लूप्रिंट (५० विभाग)</Link></li>
              <li style={{ marginBottom: '8px' }}><Link to="/contact" style={{ color: '#FFFFFF', textDecoration: 'none' }}>☎️ संपर्क व तक्रार निवारण</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy" style={{ color: '#FFFFFF', opacity: 0.95, fontSize: '0.85rem' }}>
            © २०२६ Connect Maratha · सर्व हक्क सुरक्षित
          </p>
          <p className="footer-jai" style={{ color: '#FFFFFF', fontWeight: 700, margin: '6px 0' }}>
            ॥ जय भवानी, जय शिवाजी ॥ प्रौढ प्रताप पुरंधर क्षत्रियकुलावतंस सिंहासनाधीश्वर छत्रपती शिवाजी महाराज की जय!
          </p>
          <p className="footer-admin" style={{ fontSize: '0.75rem', marginTop: '8px' }}>
            <Link to="/admin" style={{ color: '#FFF3E0', opacity: 0.9 }}>CRM Console</Link> | <Link to="/governance" style={{ color: '#FFF3E0', opacity: 0.9 }}>Master Blueprint</Link> | <Link to="/login" style={{ color: '#FFF3E0', opacity: 0.9 }}>लॉगिन</Link>
          </p>
        </div>
      </footer>
    </>
  );
}
