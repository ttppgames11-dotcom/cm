import React from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function AnalyticsDashboardPage() {
  const { issues, articles, advertisements } = useMagazineAdmin();

  const metrics = [
    { label: "एकूण मासिक पृष्ठ व्ह्यूज", value: "१,४२,५००", change: "+२८% मागील महिन्यापेक्षा", trend: "up" },
    { label: "सरासरी वाचन वेळ", value: "६ मि. ४२ सेकंद", change: "+१४% उच्च एंगेजमेंट", trend: "up" },
    { label: "डिजिटल अंक डाऊनलोड्स", value: "१२,८४०", change: "PDF आवृत्ती वाचक", trend: "up" },
    { label: "जाहिरात क्लिक्स (CTR)", value: "५,२४०", change: "३.८% सरासरी CTR", trend: "up" }
  ];

  const topArticles = [
    { title: "कमी भांडवलात सुरू करता येणारे ५ हाय-प्रॉफिट स्टार्टअप्स", views: "४,५२०", readTime: "५ मि.", likes: 312 },
    { title: "शिवरायांचे व्यवस्थापनशास्त्र: दुर्ग, आरमार आणि आर्थिक स्वावलंबन", views: "६,८४०", readTime: "७ मि.", likes: 620 },
    { title: "माझा पहिला ₹१ लाख नफा: व्यवसायातील कॅश-फ्लो कसा मॅनेज करावा?", views: "५,२१०", readTime: "६ मि.", likes: 410 },
    { title: "किचनपासून कॉर्पोरेटपर्यंत: कोल्हापूरच्या मसाले उद्योगाची जागतिक भरारी", views: "३,८९०", readTime: "४ मि.", likes: 275 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            📈 वाचक विश्लेषण व आकडेवारी (Reader Analytics)
          </h1>
          <p className="cm-page-desc">
            मासिकाची वाचक पोहोच, लेखांची लोकप्रियता, डिजिटल रीडर पृष्ठ व्ह्यूज व जाहिरात परिणामकारकता (डेमो नमुना डेटा).
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        {metrics.map((m, i) => (
          <div key={i} className="cm-card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '8px' }}>
              {m.label}
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0F172A', marginBottom: '4px' }}>
              {m.value}
            </div>
            <span style={{ fontSize: '0.78rem', color: '#0D9488', fontWeight: 700 }}>
              ↑ {m.change}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
        <div className="cm-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 18px' }}>
            📊 मासिक वाचक संख्या ट्रेंड (Monthly Readership)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { month: 'ऑगस्ट २०२६', count: 18400, percent: 55 },
              { month: 'सप्टेंबर २०२६', count: 24200, percent: 70 },
              { month: 'ऑक्टोबर २०२६', count: 32600, percent: 85 },
              { month: 'नोव्हेंबर २०२६ (चालू)', count: 48500, percent: 100 }
            ].map((bar, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px', fontWeight: 600 }}>
                  <span style={{ color: '#0F172A' }}>{bar.month}</span>
                  <span style={{ color: '#F4510B', fontWeight: 800 }}>{bar.count.toLocaleString()} वाचक</span>
                </div>
                <div style={{ width: '100%', height: '10px', background: '#F1F5F9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${bar.percent}%`, height: '100%', background: '#F4510B', borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cm-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>
            ⭐ सर्वाधिक वाचले गेलेले लेख (Top Reads)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topArticles.map((art, idx) => (
              <div key={idx} style={{ padding: '12px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.74rem', color: '#F4510B', fontWeight: 800 }}>
                  #{idx + 1} सर्वाधिक लोकप्रिय
                </span>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', margin: '4px 0 6px', lineHeight: 1.3 }}>
                  {art.title}
                </h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B' }}>
                  <span>👁️ {art.views} वाचक</span>
                  <span>⏱️ {art.readTime}</span>
                  <span>❤️ {art.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
