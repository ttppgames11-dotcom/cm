import React from 'react';
import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="footer" style={{ background: 'var(--maroon-950, #C73800)', color: '#FFFFFF', paddingTop: '40px', paddingBottom: '20px', marginTop: '60px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px', marginBottom: '32px' }}>
          {/* Col 1: Brand & Seal */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <img src="/assets/images/logo.png" alt="Connect Maratha Seal" style={{ height: '48px', width: 'auto', background: '#fff', borderRadius: '50%', padding: '2px' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#FFFFFF' }}>कनेक्ट मराठा</h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>अखिल भारतीय मराठा महासंघ</span>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)' }}>
              मराठा समाजाच्या सामाजिक, शैक्षणिक, आर्थिक व सांस्कृतिक उन्नतीसाठी समर्पित अधिकृत डिजिटल व्यासपीठ.
            </p>
            <div style={{ marginTop: '14px', fontSize: '0.85rem' }}>
              <p>📍 केंद्रीय कार्यालय: नारायण पेठ, पुणे – ४११०३०</p>
              <p>📞 हेल्पलाइन: १८००-२३३-१९८१</p>
              <p>✉️ संपर्क: connect@marathamahasangh.org</p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px', marginBottom: '14px' }}>
              🚩 इतिहास व वारसा
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', lineHeight: 2.2 }}>
              <li><Link to="/history/shivaji-maharaj" style={{ color: '#FFFFFF', textDecoration: 'none' }}>छत्रपती शिवाजी महाराज</Link></li>
              <li><Link to="/history/sambhaji-maharaj" style={{ color: '#FFFFFF', textDecoration: 'none' }}>छत्रपती संभाजी महाराज</Link></li>
              <li><Link to="/forts" style={{ color: '#FFFFFF', textDecoration: 'none' }}>महाराष्ट्राचे ३५०+ किल्ले</Link></li>
              <li><Link to="/history/battles" style={{ color: '#FFFFFF', textDecoration: 'none' }}>ऐतिहासिक रणसंग्राम</Link></li>
              <li><Link to="/history/granthalaya" style={{ color: '#FFFFFF', textDecoration: 'none' }}>मराठा डिजिटल ग्रंथालय</Link></li>
            </ul>
          </div>

          {/* Col 3: Sangam & Network */}
          <div>
            <h4 style={{ color: '#FFFFFF', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px', marginBottom: '14px' }}>
              💼 व्यवसाय संगम व नेटवर्क
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', lineHeight: 2.2 }}>
              <li><Link to="/network" style={{ color: '#FFFFFF', textDecoration: 'none' }}>महाराष्ट्र राज्य नेटवर्क (३६ जिल्हे)</Link></li>
              <li><Link to="/business/directory" style={{ color: '#FFFFFF', textDecoration: 'none' }}>उद्योजक व व्यावसायिक डिरेक्टरी</Link></li>
              <li><Link to="/referrals" style={{ color: '#FFFFFF', textDecoration: 'none' }}>संदर्भ देवाणघेवाण प्लॅटफॉर्म</Link></li>
              <li><Link to="/card" style={{ color: '#FFFFFF', textDecoration: 'none' }}>डिजिटल सदस्य कार्ड मिळवा</Link></li>
              <li><Link to="/membership" style={{ color: '#FFFFFF', textDecoration: 'none' }}>महासंघ सभासदत्व योजना</Link></li>
            </ul>
          </div>

          {/* Col 4: Community & Support */}
          <div>
            <h4 style={{ color: '#FFFFFF', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px', marginBottom: '14px' }}>
              🤝 सेवा, सहकार्य व संपर्क
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', lineHeight: 2.2 }}>
              <li><Link to="/donation" style={{ color: '#FFFFFF', textDecoration: 'none' }}>दुर्ग संवर्धन निधी</Link></li>
              <li><Link to="/community" style={{ color: '#FFFFFF', textDecoration: 'none' }}>समुदाय चर्चा व संवाद</Link></li>
              <li><Link to="/events" style={{ color: '#FFFFFF', textDecoration: 'none' }}>आगामी मेळावे व स्नेहसंमेलन</Link></li>
              <li><Link to="/about" style={{ color: '#FFFFFF', textDecoration: 'none' }}>महासंघाचा गौरवशाली इतिहास</Link></li>
              <li><Link to="/contact" style={{ color: '#FFFFFF', textDecoration: 'none' }}>जिल्हावार संपर्क यादी</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem' }}>
          <div>
            © २०२६ <strong>कनेक्ट मराठा</strong> — अखिल भारतीय मराठा महासंघ अधिकृत डिजिटल व्यासपीठ. सर्व हक्क सुरक्षित.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/privacy" style={{ color: '#FFFFFF', textDecoration: 'none' }}>गोपनीयता धोरण (DPDP)</Link>
            <Link to="/terms" style={{ color: '#FFFFFF', textDecoration: 'none' }}>अटी व शर्ती</Link>
            <Link to="/admin" style={{ color: '#FFE082', textDecoration: 'none' }}>अ‍ॅडमिन लॉगिन</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
