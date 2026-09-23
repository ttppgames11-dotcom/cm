import React from 'react';
import { Link } from 'react-router-dom';

const PORTALS_GROUPS = [
  {
    title: '⚔️ इतिहास, दुर्ग व महापुरुष दालने',
    links: [
      { label: 'छत्रपती शिवाजी महाराज चरित्र', to: '/history/shivaji-maharaj' },
      { label: 'छत्रपती संभाजी महाराज शौर्यगाथा', to: '/history/sambhaji-maharaj' },
      { label: 'राष्ट्रमाता जिजाऊ माँसाहेब', to: '/history/rajmata-jijau' },
      { label: 'श्रीमंत बाजीराव पेशवे', to: '/history/bajirao-peshwa' },
      { label: 'सह्याद्रीचे ३५०+ गड-किल्ले', to: '/forts' },
      { label: 'मराठा लढाया व युद्धव्यूह', to: '/history/battles' },
      { label: 'अमर वीर व शिलेदार मावळे', to: '/history/warriors' },
      { label: 'मराठा आरमार व जलदुर्ग', to: '/history/navy' },
      { label: 'बलिदान मास स्मृती दालन', to: '/history/balidan-maas' },
      { label: 'मराठा महाग्रंथालय व बखरी', to: '/granthalaya' },
      { label: 'मराठा ज्ञानकोश (Dnyankosh)', to: '/dnyankosh' },
      { label: 'ऐतिहासिक दिनविशेष', to: '/history/dates' },
      { label: 'स्वराज्य प्रशासन व अष्टप्रधान', to: '/history/swarajya-administration' }
    ]
  },
  {
    title: '💼 व्यवसाय, उद्योग व करिअर',
    links: [
      { label: 'बिझनेस संगम (Business Sangam)', to: '/sangam' },
      { label: 'व्यवसाय निर्देशिका (Business Directory)', to: '/business/directory' },
      { label: 'रेफरल व लीड्स व्यवस्थापन', to: '/referrals' },
      { label: 'नवीन रेफरल पाठवा', to: '/create-referral' },
      { label: 'रोजगार व करिअर केंद्र (Jobs)', to: '/jobs' },
      { label: 'सामुदायिक सेवा बुकिंग विझार्ड', to: '/services/booking' },
      { label: 'उच्च शिक्षण व शिष्यवृत्ती', to: '/jobs' },
      { label: 'प्रोफेशनेल्स निर्देशिका', to: '/directory' }
    ]
  },
  {
    title: '🚩 समाज, कल्याण व प्रशासन',
    links: [
      { label: 'डिजिटल सदस्य ओळखपत्र (Smart Card)', to: '/card' },
      { label: 'नवीन सदस्य नोंदणी (Register)', to: '/register' },
      { label: 'सदस्य लॉगिन (Login)', to: '/login' },
      { label: 'माझा डॅशबोर्ड (Dashboard)', to: '/dashboard' },
      { label: 'महाराष्ट्र नेटवर्क (३६ जिल्हे)', to: '/network' },
      { label: 'समुदाय मंच व चर्चा गट', to: '/community' },
      { label: 'समाज सुरक्षा व मदत कक्ष', to: '/community/safety' },
      { label: 'सामाजिक चळवळी व ५८ मोर्चे', to: '/history/movements' },
      { label: 'बातम्या व अधिकृत घडामोडी', to: '/news' },
      { label: 'कार्यक्रम व दिनविशेष कॅलेंडर', to: '/events' },
      { label: 'दुर्ग संवर्धन व देणगी कोष', to: '/donation' },
      { label: '१०-वर्षीय महाब्लूप्रिंट', to: '/blueprint' },
      { label: 'संस्था परिचय व सनद', to: '/about' },
      { label: '🚩 भूमिका आधारित CRM पोर्टल (Role Hub)', to: '/crm' },
      { label: '👑 केंद्रीय सुपर ॲडमिन कन्सोल (Super Admin)', to: '/admin' },
      { label: '🦅 CEO एक्झिक्युटिव्ह डॅशबोर्ड (Macro ₹ Cr)', to: '/crm/ceo' },
      { label: '📍 जिल्हा समन्वयक CRM (District Head)', to: '/crm/district' },
      { label: '💼 चॅप्टर अध्यक्ष CRM (Chapter B2B)', to: '/crm/chapter' },
      { label: '🩺 समाज साहाय्यता कक्ष CRM (Seva 24x7)', to: '/crm/helpdesk' },
      { label: '📈 तपशीलवार महा-अहवाल केंद्र (7 Filters)', to: '/reports' }
    ]
  },
  {
    title: '🎨 संस्कृती, मानचिन्हे व मंदिरे',
    links: [
      { label: 'राजमुद्रा व मराठा मानचिन्हे', to: '/culture/symbols' },
      { label: 'शिवकालीन मंदिरे व तीर्थक्षेत्रे', to: '/culture/temples' },
      { label: 'आपुला महाराष्ट्र छायाचित्र दालन', to: '/gallery' },
      { label: 'सर्वत्र शोध केंद्र (Global Search)', to: '/search' }
    ]
  }
];

export default function MorePortalsPage() {
  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 100%)',
          borderRadius: '20px',
          padding: '40px 32px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          marginBottom: '32px',
          boxShadow: '0 16px 40px rgba(61,13,13,0.3)'
        }}>
          <span style={{
            background: '#DD8A2E',
            color: '#3D0D0D',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            📂 सर्व दालने व विभाग
          </span>
          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 800,
            margin: '12px 0 8px',
            color: '#FFF'
          }}>
            Connect Maratha संपूर्ण दालन निर्देशिका (७०+ दालने)
          </h1>
          <p style={{ color: '#E6DDCE', fontSize: '1rem', maxWidth: '720px', margin: 0, lineHeight: 1.6 }}>
            इतिहास, किल्ले, उद्योग, समाज, शिक्षण, विधी, प्रशासन, संस्कृती आणि सर्व ७०+ डिजिटल दालनांची एकाच ठिकाणी संपूर्ण यादी.
          </p>
        </div>

        {/* Categories Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {PORTALS_GROUPS.map((grp, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E6DDCE',
                boxShadow: '0 6px 20px rgba(199,56,0,0.05)'
              }}>
              <h3 style={{
                fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#3D0D0D',
                margin: '0 0 16px',
                paddingBottom: '10px',
                borderBottom: '2px solid #DD8A2E'
              }}>
                {grp.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {grp.links.map((link, lIdx) => (
                  <Link
                    key={lIdx}
                    to={link.to}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#FAF6F0',
                      color: '#2B2420',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s'
                    }}>
                    <span>{link.label}</span>
                    <span style={{ color: '#C9701C', fontWeight: 800 }}>→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
