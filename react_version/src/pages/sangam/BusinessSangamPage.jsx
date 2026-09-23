import React from 'react';
import { Link } from 'react-router-dom';
import CMDB from '../../services/cmdb';

export default function BusinessSangamPage() {
  const chapters = CMDB.getChapters ? CMDB.getChapters() : [];

  return (
    <div className="container py-5" style={{ padding: '40px 16px' }}>
      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #C73800, #E65100)', color: '#fff', borderRadius: '16px', padding: '40px 28px', marginBottom: '36px', textAlign: 'center' }}>
        <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
          💼 मराठा व्यावसायिक सक्षमीकरण
        </span>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', margin: '14px 0 10px', fontWeight: 800 }}>
          मराठा व्यवसाय संगम (Business Sangam)
        </h1>
        <p style={{ maxWidth: '720px', margin: '0 auto 24px', opacity: 0.95, fontSize: '1.05rem', lineHeight: 1.6 }}>
          प्रत्येक व्यवसाय मंडळात (Chapter) एका व्यवसायाला एकाच सदस्यासाठी राखीव जागा (Exclusive Seat Lockout) देऊन स्पर्धाविरहित व्यवसाय वाढीचे क्रांतीकारी मॉडेल.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link to="/referrals" className="btn btn-primary" style={{ background: '#FFF', color: '#C73800', border: 'none', fontWeight: 700, padding: '12px 24px' }}>
            🤝 संदर्भ देवाणघेवाण प्लॅटफॉर्म
          </Link>
          <Link to="/business/directory" className="btn btn-outline" style={{ borderColor: '#FFF', color: '#FFF', fontWeight: 700, padding: '12px 24px' }}>
            📖 उद्योजक डिरेक्टरी
          </Link>
        </div>
      </div>

      {/* 3 Pillars of Sangam */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>🔒</div>
          <h3 style={{ fontSize: '1.25rem', color: '#222', marginBottom: '8px' }}>एक व्यवसाय — एक जागा</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6 }}>
            एका मंडळामध्ये एकाच क्षेत्रातील एकाच व्यक्तीला परवानगी असते, ज्यामुळे अंतर्गत स्पर्धा टळते आणि सर्व संदर्भ एकाच बांधवाला मिळतात.
          </p>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>🤝</div>
          <h3 style={{ fontSize: '1.25rem', color: '#222', marginBottom: '8px' }}>गुणवत्तेवर आधारित संदर्भ</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6 }}>
            मंडळातील सर्व सदस्य एकमेकांना व्यावसायिक ग्राहक मिळवून देण्यासाठी वचनबद्ध असतात. प्रत्येक संदर्भाची डिजिटल नोंद ठेवली जाते.
          </p>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '24px' }}>
          <div style={{ fontSize: '2.2rem', marginBottom: '10px' }}>☕</div>
          <h3 style={{ fontSize: '1.25rem', color: '#222', marginBottom: '8px' }}>१-टू-१ विश्वास भेटी</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6 }}>
            दोन उद्योजक समोरासमोर बसून एकमेकांच्या सेवा, विश्वासार्हता आणि ग्राहक प्रोफाइल समजून घेतात.
          </p>
        </div>
      </div>

      {/* Chapters Preview */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--maroon-900, #D84315)', margin: 0 }}>
            🏛️ सक्रिय व्यवसाय मंडळे (Chapters)
          </h2>
          <Link to="/business/directory" style={{ color: 'var(--maroon-900)', fontWeight: 600, textDecoration: 'none' }}>
            सर्व मंडळे पहा →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          {chapters.slice(0, 4).map(ch => (
            <div key={ch.id} style={{ background: '#FFFFFF', border: '1px solid #E0E0E0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', background: '#FFF3E0', color: 'var(--maroon-900)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  {ch.id}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#666' }}>📍 {ch.district}</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: '#222', margin: '0 0 6px' }}>{ch.marathiName || ch.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: '0 0 12px' }}>
                बैठक वेळ: {ch.meetingDay || 'प्रत्येक बुधवार'}, {ch.meetingTime || 'सकाळी ७:३०'}
              </p>
              <Link to="/business/mandal" className="btn btn-sm btn-outline" style={{ display: 'inline-block', padding: '6px 14px', fontSize: '0.82rem' }}>
                जागा उपलब्धता पहा →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
