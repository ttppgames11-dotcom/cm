import React from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';
import { 
  ChartNoAxesCombined, 
  TrendingUp, 
  Users, 
  Clock, 
  Download, 
  MousePointerClick, 
  Award, 
  Flame, 
  Calendar,
  Eye,
  Heart
} from 'lucide-react';

export default function AnalyticsDashboardPage() {
  const { issues, articles, advertisements } = useMagazineAdmin();

  const metrics = [
    { label: "एकूण मासिक पृष्ठ व्ह्यूज (Pageviews)", value: "१,४२,५००", change: "+२८% मागील महिन्यापेक्षा", icon: Eye, color: "#F4510B" },
    { label: "सरासरी वाचन वेळ (Avg Read Time)", value: "६ मि. ४२ से.", change: "+१४% उच्च एंगेजमेंट", icon: Clock, color: "#D94100" },
    { label: "डिजिटल अंक डाऊनलोड्स (Downloads)", value: "१२,८४०", change: "PDF आवृत्ती वाचक", icon: Download, color: "#059669" },
    { label: "जाहिरात क्लिक्स (CTR & Leads)", value: "५,२४०", change: "३.८% सरासरी CTR", icon: MousePointerClick, color: "#7C3AED" }
  ];

  const topArticles = [
    { title: "कमी भांडवलात सुरू करता येणारे ५ हाय-प्रॉफिट स्टार्टअप्स", category: "Startup Maharashtra", views: "४,५२०", readTime: "५ मि.", likes: 312 },
    { title: "शिवरायांचे व्यवस्थापनशास्त्र: दुर्ग, आरमार आणि आर्थिक स्वावलंबन", category: "मराठा वारसा", views: "६,८४०", readTime: "७ मि.", likes: 620 },
    { title: "माझा पहिला ₹१ लाख नफा: व्यवसायातील कॅश-फ्लो कसा मॅनेज करावा?", category: "पैसा आणि प्रगती", views: "५,२१०", readTime: "६ मि.", likes: 410 },
    { title: "किचनपासून कॉर्पोरेटपर्यंत: कोल्हापूरच्या मसाले उद्योगाची जागतिक भरारी", category: "महिला उद्योजिका", views: "३,८९०", readTime: "४ मि.", likes: 275 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div className="cm-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: '#FFF1E8', color: '#F4510B', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
              Live Telemetry & Metrics
            </span>
            <span style={{ color: '#777777', fontSize: '0.8rem' }}>Realtime Reader Insights</span>
          </div>
          <h1 className="cm-page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ChartNoAxesCombined size={26} color="#F4510B" />
            वाचक विश्लेषण व आकडेवारी (Reader Analytics)
          </h1>
          <p className="cm-page-subtitle">
            मासिकाची वाचक पोहोच, लेखांची लोकप्रियता, डिजिटल रीडर पृष्ठ व्ह्यूज व जाहिरात परिणामकारकता तपशील.
          </p>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
        {metrics.map((m, i) => {
          const IconComp = m.icon;
          return (
            <div key={i} className="cm-card" style={{ padding: '20px', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#777777', display: 'block' }}>
                  {m.label}
                </span>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.color }}>
                  <IconComp size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#252525', marginBottom: '4px', lineHeight: 1.1 }}>
                {m.value}
              </div>
              <span style={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={14} />
                {m.change}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Trends & Top Reads Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '22px', alignItems: 'start' }}>
        {/* Left: Monthly Trend Bar Visualization */}
        <div className="cm-card" style={{ padding: '24px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#252525', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#F4510B" />
              मासिक वाचक संख्या ट्रेंड (Monthly Readership Trend)
            </h3>
            <span style={{ fontSize: '0.74rem', background: '#FFF1E8', color: '#F4510B', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
              २०२६ प्रगती आलेख
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { month: 'ऑगस्ट २०२६', count: 18400, percent: 45 },
              { month: 'सप्टेंबर २०२६', count: 26200, percent: 62 },
              { month: 'ऑक्टोबर २०२६', count: 35800, percent: 80 },
              { month: 'नोव्हेंबर २०२६ (चालू अंक - LIVE)', count: 50400, percent: 100 }
            ].map((bar, i) => (
              <div key={i} style={{ background: '#FFF9F5', padding: '12px 16px', borderRadius: '10px', border: '1px solid #F2E5DC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '6px', fontWeight: 700 }}>
                  <span style={{ color: '#252525' }}>{bar.month}</span>
                  <span style={{ color: '#F4510B', fontWeight: 800 }}>{bar.count.toLocaleString()} वाचक</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${bar.percent}%`, height: '100%', background: 'linear-gradient(90deg, #F4510B, #D94100)', borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '18px', padding: '12px 14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.78rem', color: '#777777' }}>
            💡 <strong>वाचक निष्कर्ष:</strong> दिवाळी व युवा विशेषांकामुळे डिजिटल वाचकसंख्येत चालू महिन्यात विक्रमी <strong>+४२% वाढ</strong> नोंदवली गेली आहे.
          </div>
        </div>

        {/* Right: Top Articles */}
        <div className="cm-card" style={{ padding: '24px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#252525', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Flame size={18} color="#F4510B" />
              सर्वाधिक वाचलेले लेख (Top Reads)
            </h3>
            <span style={{ fontSize: '0.74rem', color: '#777777', fontWeight: 600 }}>रँकिंग</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topArticles.map((art, idx) => (
              <div key={idx} style={{ padding: '12px 14px', borderRadius: '10px', background: '#FFF9F5', border: '1px solid #F2E5DC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#F4510B', fontWeight: 800 }}>
                    #{idx + 1} • {art.category}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#777777', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Eye size={12} /> {art.views}
                  </span>
                </div>
                <h5 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#252525', margin: '0 0 6px', lineHeight: 1.3 }}>
                  {art.title}
                </h5>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#777777' }}>
                  <span>वाचन वेळ: {art.readTime}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#E11D48' }}>
                    <Heart size={12} /> {art.likes} पसंती
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
