import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CMDB from '../../services/cmdb';

const HISTORIC_CHAPTERS = [
  {
    id: 'CH01',
    slug: 'pune-shivneri-vyavsay-mandal',
    name: 'Pune Shivneri Business Mandal',
    marathiName: 'पुणे – शिवनेरी व्यवसाय मंडळ',
    historicTag: 'ऑटोमोटिव्ह, रोबोटिक्स व हेवी मॅन्युफॅक्चरिंग प्लांट (Bhosari)',
    city: 'पुणे',
    district: 'पुणे',
    territory: 'पुणे पश्चिम व उत्तर (भोसरी / चाकण MIDC / हिंजवडी)',
    meetingDay: 'प्रत्येक बुधवार',
    meetingTime: 'सकाळी ७:३० ते ९:००',
    venue: 'हॉटेल प्राइड एक्झिक्युटिव्ह, शिवाजीनगर, पुणे',
    capacity: 40,
    openSeats: 8,
    visitors: 24,
    monthlyBusiness: 5475000,
    monthlyOpportunities: 56,
    totalClosedValue: 24500000,
    image: '/assets/images/sangam-ch-pune.jpg', // पुणे ऑटो व रोबोटिक्स मॅन्युफॅक्चरिंग प्लांट
    specialties: ['IT व सॉफ्टवेअर', 'ऑटो कॉम्पोनंट्स', 'बांधकाम व इन्फ्रा', 'फायनान्शिअल कन्सल्टिंग'],
    coordinator: 'विक्रमसिंह जाधव (अध्यक्ष)',
    phone: '+91 98220 14455'
  },
  {
    id: 'CH02',
    slug: 'kolhapur-raigad-vyavsay-mandal',
    name: 'Kolhapur Raigad Business Mandal',
    marathiName: 'कोल्हापूर – रायगड व्यवसाय मंडळ',
    historicTag: 'फाउंड्री, मोल्टन मेटल कास्टिंग व हेवी इंडस्ट्री (Shiroli MIDC)',
    city: 'कोल्हापूर',
    district: 'कोल्हापूर',
    territory: 'कोल्हापूर मध्य व औद्योगिक क्षेत्र (शाहूपुरी / शिरोली MIDC)',
    meetingDay: 'प्रत्येक शुक्रवार',
    meetingTime: 'सकाळी ८:०० ते ९:३०',
    venue: 'हॉटेल सयाजी, कावळा नाका, कोल्हापूर',
    capacity: 35,
    openSeats: 7,
    visitors: 18,
    monthlyBusiness: 3810000,
    monthlyOpportunities: 42,
    totalClosedValue: 16800000,
    image: '/assets/images/sangam-ch-kolhapur.jpg', // कोल्हापूर हेवी फाउंड्री व मोल्टन कास्टिंग प्लांट
    specialties: ['फाउंड्री व कास्टिंग', 'टेक्स्टाईल व गारमेंट', 'ॲग्रो प्रोसेसिंग', 'लॉजिस्टिक्स'],
    coordinator: 'उदयसिंह घाटगे (संयोजक)',
    phone: '+91 98230 45566'
  },
  {
    id: 'CH03',
    slug: 'nashik-jijau-vyavsay-sangam',
    name: 'Nashik Jijau Business Sangam',
    marathiName: 'नाशिक – जिजाऊ व्यवसाय संगम',
    historicTag: 'कृषी अवजारे, ट्रॅक्टर व ऑटो मॅन्युफॅक्चरिंग हब (Ambad MIDC)',
    city: 'नाशिक',
    district: 'नाशिक',
    territory: 'नाशिक मध्य (गंगापूर रोड / सातपूर / अंबड MIDC)',
    meetingDay: 'प्रत्येक मंगळवार',
    meetingTime: 'सकाळी ७:०० ते ८:३०',
    venue: 'द गेटवे हॉटेल, अंबड, नाशिक',
    capacity: 42,
    openSeats: 5,
    visitors: 28,
    monthlyBusiness: 6840000,
    monthlyOpportunities: 64,
    totalClosedValue: 28400000,
    image: '/assets/images/sangam-ch-nashik.jpg', // नाशिक कृषी अवजारे व मशिनरी मॅन्युफॅक्चरिंग प्लांट
    specialties: ['ॲग्रो मॅन्युफॅक्चरिंग', 'वाइनरी व फूड प्रोसेसिंग', 'रिअल इस्टेट', 'ट्रेडमार्क व लीगल'],
    coordinator: 'अमोलराव शिंदे (अध्यक्ष)',
    phone: '+91 98902 33441'
  },
  {
    id: 'CH04',
    slug: 'csmb-daulatabad-vyavsay-mandal',
    name: 'CSMB Daulatabad Business Chapter',
    marathiName: 'संभाजीनगर – दौलताबाद व्यवसाय मंडळ',
    historicTag: 'प्रिसिजन CNC, हेवी इंजिनिअरिंग व फॅब्रिकेशन (Waluj MIDC)',
    city: 'छत्रपती संभाजीनगर',
    district: 'छत्रपती संभाजीनगर',
    territory: 'संभाजीनगर (जालना रोड / सिडको / वाळूज MIDC / शेंद्रा)',
    meetingDay: 'प्रत्येक गुरुवार',
    meetingTime: 'सकाळी ७:३० ते ९:००',
    venue: 'हॉटेल रामा इंटरनॅशनल, चिकलठाणा',
    capacity: 36,
    openSeats: 9,
    visitors: 16,
    monthlyBusiness: 4250000,
    monthlyOpportunities: 38,
    totalClosedValue: 19200000,
    image: '/assets/images/sangam-ch-csmb.jpg', // संभाजीनगर हेवी इंजिनिअरिंग व CNC मॅन्युफॅक्चरिंग वर्कशॉप
    specialties: ['फार्मास्युटिकल्स', 'ऑटो कॉम्पोनंट्स', 'सोलर एनर्जी', 'प्रिसिजन सीएनसी मशिनिंग'],
    coordinator: 'संजयराव देशमुख (अध्यक्ष)',
    phone: '+91 98224 88712'
  },
  {
    id: 'CH05',
    slug: 'thane-mumbai-pratapgad-sangam',
    name: 'Thane Mumbai Pratapgad Business Sangam',
    marathiName: 'ठाणे-मुंबई – प्रतापगड व्यवसाय संगम',
    historicTag: 'अत्याधुनिक फूड प्रोसेसिंग व ऑटोमेटेड इंडस्ट्रिअल प्लांट',
    city: 'ठाणे / मुंबई',
    district: 'ठाणे',
    territory: 'ठाणे-नवी मुंबई (वागळे इस्टेट / वाशी / बेलापूर CBD)',
    meetingDay: 'प्रत्येक शनिवार',
    meetingTime: 'सकाळी ८:०० ते ९:३०',
    venue: 'हॉटेल टिप टॉप प्लाझा, एलबीएस रोड, ठाणे',
    capacity: 45,
    openSeats: 6,
    visitors: 32,
    monthlyBusiness: 8920000,
    monthlyOpportunities: 72,
    totalClosedValue: 39500000,
    image: '/assets/images/sangam-ch-thane.jpg', // फूड प्रोसेसिंग व ऑटोमेटेड मॅन्युफॅक्चरिंग प्लांट
    specialties: ['कॉर्पोरेट टॅक्स व CA', 'फिनटेक व आयटी', 'कमर्शियल रिअल इस्टेट', 'लक्झरी हॉस्पिटॅलिटी'],
    coordinator: 'ॲड. नितीन सावंत (संयोजक)',
    phone: '+91 98205 99123'
  }
];

function formatCurrency(amount) {
  if (!amount) return '₹०';
  if (amount >= 10000000) {
    return '₹' + (amount / 10000000).toFixed(2) + ' कोटी';
  }
  if (amount >= 100000) {
    return '₹' + (amount / 100000).toFixed(2) + ' लाख';
  }
  return '₹' + amount.toLocaleString('en-IN');
}

export default function BusinessSangamPage() {
  const [chapters, setChapters] = useState(HISTORIC_CHAPTERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.CMDB && window.CMDB.getChapters) {
      const dbChapters = window.CMDB.getChapters();
      if (dbChapters && dbChapters.length > 0) {
        setChapters(HISTORIC_CHAPTERS);
      }
    }
  }, []);

  const totals = chapters.reduce(
    (acc, ch) => {
      acc.members += (ch.capacity || 30) - (ch.openSeats || 0);
      acc.business += ch.totalClosedValue || 0;
      acc.opportunities += ch.monthlyOpportunities || 0;
      return acc;
    },
    { members: 0, business: 0, opportunities: 0 }
  );

  const cities = ['all', ...Array.from(new Set(chapters.map(c => c.city)))];

  const filteredChapters = chapters.filter((ch) => {
    const matchCity = selectedCity === 'all' || ch.city === selectedCity;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchCity;
    const hay = `${ch.marathiName || ''} ${ch.name || ''} ${ch.city || ''} ${ch.territory || ''} ${ch.coordinator || ''} ${ch.historicTag || ''}`.toLowerCase();
    return matchCity && hay.includes(q);
  });

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', color: '#1B2430' }}>
      {/* Topbar strip with authentic heritage branding */}
      <div style={{ background: '#7A1C08', color: '#FFF8E7', borderBottom: '1px solid rgba(218,165,32,0.3)', padding: '7px 0', fontSize: '0.82rem' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#F6B800', fontWeight: 800 }}>🚩 ओळखीतून संबंध · संबंधातून विश्वास · विश्वासातून स्वराज्य व्यापार</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>📞 व्यवसाय कक्ष: <strong style={{ color: '#FFF' }}>१८००-१२३-१६७४</strong></span>
            <span>|</span>
            <Link to="/contact" style={{ color: '#F6B800', textDecoration: 'none', fontWeight: 600 }}>
              संपर्क व थेट सहाय्यता →
            </Link>
          </div>
        </div>
      </div>

      {/* COMPACT HERO BANNER (Balanced width, authentic Maharashtrian business summit photo) */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#FAF7F2' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(122, 28, 8, 0.14)',
              border: '1.5px solid rgba(246, 184, 0, 0.40)'
            }}
          >
            {/* Background: Authentic Maratha Business Summit / Council */}
            <img
              src="/assets/images/maratha-business-sangam.jpg"
              alt="Connect Maratha व्यवसाय संगम परिषद"
              style={{
                width: '100%',
                height: '350px',
                objectFit: 'cover',
                display: 'block',
                filter: 'brightness(0.88)'
              }}
            />

            {/* Gradient Overlay for high text contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, rgba(40, 10, 5, 0.82) 0%, rgba(40, 10, 5, 0.55) 50%, rgba(15, 5, 2, 0.15) 100%)'
              }}
            />

            {/* Content Box */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '30px 40px',
                maxWidth: '780px'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(246, 184, 0, 0.2)',
                  border: '1px solid rgba(246, 184, 0, 0.55)',
                  color: '#FBD76B',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  width: 'fit-content',
                  marginBottom: '10px'
                }}
              >
                <span>🚩</span> CONNECT MARATHA • स्वराज्य व्यापार व व्यवसाय संगम
              </div>

              <h1
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontSize: 'clamp(1.7rem, 3.2vw, 2.35rem)',
                  lineHeight: 1.25,
                  margin: '0 0 10px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)'
                }}
              >
                ओळखीतून संबंध • संबंधातून विश्वास • विश्वासातून व्यवसाय
              </h1>

              <p
                style={{
                  fontSize: '0.96rem',
                  lineHeight: 1.6,
                  color: '#F0ECE4',
                  margin: '0 0 20px',
                  maxWidth: '620px'
                }}
              >
                छत्रपती शिवरायांच्या व्यापारनीती आणि सहकार्य तत्त्वावर आधारित, महाराष्ट्रातील मराठी उद्योजक व व्यावसायिकांना जोडणारे अधिकृत स्थानिक मंडळ व्यासपीठ.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link
                  to="/meetings"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    background: '#C73800',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(199,56,0,0.4)'
                  }}
                >
                  ☕ १-टू-१ बैठका पोर्टल
                </Link>
                <Link
                  to="/business/directory"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(6px)',
                    color: '#FFF',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  🤝 व्यवसाय संधी व डिरेक्टरी
                </Link>
                <Link
                  to="/referrals"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    background: 'rgba(246,184,0,0.15)',
                    color: '#FBD76B',
                    border: '1px solid rgba(246,184,0,0.4)',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  🔗 रेफरल ट्रॅकर
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 20px 60px' }}>
        
        {/* STATS SUMMARY BAR */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            background: '#FFFFFF',
            padding: '20px 24px',
            borderRadius: '16px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
            border: '1px solid #EADBCC',
            marginBottom: '40px'
          }}
        >
          <div style={{ textAlign: 'center', borderRight: '1px solid #F0E6D8' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#C73800', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>
              {chapters.length}
            </div>
            <div style={{ fontSize: '0.84rem', color: '#6A7280', fontWeight: 600, marginTop: '4px' }}>
              सक्रिय व्यवसाय मंडळे (Chapters)
            </div>
          </div>

          <div style={{ textAlign: 'center', borderRight: '1px solid #F0E6D8' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#D97706', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>
              {totals.members}+
            </div>
            <div style={{ fontSize: '0.84rem', color: '#6A7280', fontWeight: 600, marginTop: '4px' }}>
              सत्यापित मराठा व्यावसायिक
            </div>
          </div>

          <div style={{ textAlign: 'center', borderRight: '1px solid #F0E6D8' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#15803D', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>
              {formatCurrency(totals.business)}
            </div>
            <div style={{ fontSize: '0.84rem', color: '#6A7280', fontWeight: 600, marginTop: '4px' }}>
              एकत्रित निर्माण झालेला व्यवसाय
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#7A1C08', fontFamily: 'Baloo 2', lineHeight: 1.1 }}>
              {totals.opportunities}+
            </div>
            <div style={{ fontSize: '0.84rem', color: '#6A7280', fontWeight: 600, marginTop: '4px' }}>
              या महिन्यातील थेट संदर्भ संधी
            </div>
          </div>
        </div>

        {/* SECTION HEADER & CONTROLS */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span
              style={{
                display: 'inline-block',
                background: '#FFF3E0',
                color: '#C73800',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '4px 10px',
                borderRadius: '6px',
                marginBottom: '6px',
                border: '1px solid #FFE0B2'
              }}
            >
              🚩 स्थानिक चॅप्टर्स व स्वराज्य मंडळे
            </span>
            <h2 style={{ fontSize: '1.75rem', margin: 0, fontFamily: 'Baloo 2', color: '#1B2430', fontWeight: 700 }}>
              सक्रिय व्यवसाय मंडळे (Active Business Chapters)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#5A626F' }}>
              आपल्या परिसरातील अधिकृत स्थानिक मंडळाचे आठवडी बैठका, ठिकाण व सदस्य तपशील
            </p>
          </div>

          {/* Search and City Filter Tabs */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="मंडळ, शहर किंवा संयोजक शोधा..."
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #D6D3CD',
                fontSize: '0.86rem',
                width: '240px',
                background: '#FFFFFF'
              }}
            />

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                padding: '9px 14px',
                borderRadius: '8px',
                border: '1px solid #D6D3CD',
                fontSize: '0.86rem',
                background: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <option value="all">सर्व शहरे ({chapters.length})</option>
              {cities.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CHAPTERS GRID - AUTHENTIC HERITAGE & FORT IMAGERY WITH HISTORIC TAGS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px', marginBottom: '56px' }}>
          {filteredChapters.map((ch) => (
            <div
              key={ch.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #EADBCC',
                boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
            >
              {/* Card Image Banner with authentic landmark/fort photo */}
              <div style={{ position: 'relative', height: '185px', overflow: 'hidden', background: '#2D3748' }}>
                <img
                  src={`${ch.image}?v=20261001`}
                  alt={ch.marathiName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'
                  }}
                />

                {/* City badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(255, 255, 255, 0.95)',
                    color: '#C73800',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                  }}
                >
                  📍 {ch.city}
                </div>

                {/* Status / Open Seats Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: ch.openSeats > 0 ? '#FEF3C7' : '#F3F4F6',
                    color: ch.openSeats > 0 ? '#92400E' : '#4B5563',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  {ch.openSeats > 0 ? `संधी: ${ch.openSeats} जागा शिल्लक` : 'सर्व जागा पूर्ण'}
                </div>

                {/* Chapter Name & Historic Landmark Tag overlaid on image */}
                <div style={{ position: 'absolute', bottom: '10px', left: '16px', right: '16px' }}>
                  <div style={{ color: '#FBD76B', fontSize: '0.72rem', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    🏛️ {ch.historicTag}
                  </div>
                  <h3
                    style={{
                      margin: '2px 0 0',
                      fontFamily: 'Baloo 2',
                      fontSize: '1.24rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      lineHeight: 1.25,
                      textShadow: '0 2px 6px rgba(0,0,0,0.8)'
                    }}
                  >
                    {ch.marathiName}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Meeting Time & Venue Details */}
                  <div style={{ fontSize: '0.82rem', color: '#4B5563', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>
                      📅 <strong>{ch.meetingDay}</strong> ({ch.meetingTime})
                    </div>
                    <div>
                      🏨 <span>{ch.venue}</span>
                    </div>
                    <div>
                      👤 संयोजक: <strong>{ch.coordinator}</strong> ({ch.phone})
                    </div>
                  </div>

                  {/* Badges / Metrics */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <span style={{ background: '#F3F4F6', color: '#374151', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}>
                      सदस्य: {(ch.capacity || 30) - (ch.openSeats || 0)}
                    </span>
                    <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}>
                      नवे पाहुणे: {ch.visitors}
                    </span>
                    <span style={{ background: '#FFF8E1', color: '#B78103', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}>
                      मासिक संधी: {ch.monthlyOpportunities}
                    </span>
                  </div>

                  {/* Business Turnover Highlight */}
                  <div
                    style={{
                      background: '#F9FBF7',
                      border: '1px solid #DCE7D6',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginBottom: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#556B2F', fontWeight: 600 }}>एकूण निर्माण झालेला व्यवसाय:</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1B5E20', fontFamily: 'Baloo 2' }}>
                        {formatCurrency(ch.totalClosedValue)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: '#6A7280' }}>या महिन्यातील:</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151' }}>
                        {formatCurrency(ch.monthlyBusiness)}
                      </div>
                    </div>
                  </div>

                  {/* Domain tags */}
                  {ch.specialties && (
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {ch.specialties.map((s, idx) => (
                        <span key={idx} style={{ background: '#FAF5EE', color: '#7A1C08', fontSize: '0.7rem', padding: '2px 7px', borderRadius: '4px', border: '1px solid #F0DEC9' }}>
                          • {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action CTA Buttons */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #F0ECE4' }}>
                  <Link
                    to={`/meetings?chapter=${encodeURIComponent(ch.id)}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px 12px',
                      background: '#C73800',
                      color: '#FFF',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    ☕ बैठक बुक करा
                  </Link>
                  <Link
                    to={`/business/directory?city=${encodeURIComponent(ch.city)}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px 12px',
                      background: '#FFFFFF',
                      color: '#1B2430',
                      border: '1px solid #D6D3CD',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    व्यावसायिक पहा
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* WORKFLOW EXPLANATION SECTION - 100% SUITABLE BUSINESS & INDUSTRY IMAGES */}
        <section
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #EADBCC',
            padding: '36px 30px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span
              style={{
                background: '#FEF3C7',
                color: '#92400E',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '12px',
                display: 'inline-block',
                marginBottom: '8px'
              }}
            >
              🔄 पारदर्शक व्यावसायिक नेटवर्किंग पद्धती
            </span>
            <h2 style={{ fontSize: '1.9rem', margin: '4px 0 8px', fontFamily: 'Baloo 2', color: '#1B2430', fontWeight: 800 }}>
              व्यवसाय संगम कसे काम करते?
            </h2>
            <p style={{ color: '#5A626F', fontSize: '0.92rem', maxWidth: '640px', margin: '0 auto' }}>
              मराठी उद्योजकांच्या परस्पर सहकार्यातून व्यापार व समृद्धी वृद्धीचे ४ महत्त्वाचे टप्पे
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            {/* Step 1: Business Council Executive Round Table */}
            <div
              style={{
                background: '#FAF7F2',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #EADBCC',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '145px', overflow: 'hidden' }}>
                <img
                  src="/assets/images/sangam-wf-mandal.jpg"
                  alt="उद्योजक परिषद व व्यवसाय गोलमेज बैठक"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C73800', marginBottom: '4px' }}>
                  टप्पा १ • उद्योजक परिषद
                </div>
                <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px', fontFamily: 'Baloo 2', color: '#1B2430' }}>
                  १. शहरनिहाय मंडळात सहभाग
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#5A626F', lineHeight: 1.5, margin: 0 }}>
                  आपल्या शहराच्या स्थानिक चॅप्टरमध्ये सामील व्हा. प्रत्येक व्यवसायासाठी एकच सीट असल्याने अंतर्गत स्पर्धा टळते.
                </p>
              </div>
            </div>

            {/* Step 2: 1-to-1 B2B Partnership Meeting */}
            <div
              style={{
                background: '#FAF7F2',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #EADBCC',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '145px', overflow: 'hidden' }}>
                <img
                  src="/assets/images/sangam-wf-meeting.jpg"
                  alt="१-टू-१ सखोल बी२बी व्यावसायिक चर्चा व भागीदारी"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', marginBottom: '4px' }}>
                  टप्पा २ • ओळख व विश्वास
                </div>
                <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px', fontFamily: 'Baloo 2', color: '#1B2430' }}>
                  २. १-टू-१ सखोल बैठका
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#5A626F', lineHeight: 1.5, margin: 0 }}>
                  इतर मराठा उद्योजकांशी वैयक्तिक बैठक घेऊन एकमेकांची उत्पादने, क्षमता व ग्राहकांची अचूक गरज जाणून घ्या.
                </p>
              </div>
            </div>

            {/* Step 3: Project Blueprints & Commercial Opportunity */}
            <div
              style={{
                background: '#FAF7F2',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #EADBCC',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '145px', overflow: 'hidden', background: '#1c2420' }}>
                <img
                  src="/assets/images/sangam-wf-opportunity.jpg"
                  alt="प्रकल्प आराखडा व व्यावसायिक संधींचे नियोजन"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D', marginBottom: '4px' }}>
                  टप्पा ३ • थेट संधी व नियोजन
                </div>
                <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px', fontFamily: 'Baloo 2', color: '#1B2430' }}>
                  ३. उच्च-मूल्य संधींची देवाणघेवाण
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#5A626F', lineHeight: 1.5, margin: 0 }}>
                  आपल्या ओळखीतील विश्वासू व दर्जेदार व्यावसायिक ग्राहक, सप्लाय चेन व थेट खरेदीदारांचे रेफरल्स पोर्टलवरून पाठवा.
                </p>
              </div>
            </div>

            {/* Step 4: Executive Boardroom Deal Closure */}
            <div
              style={{
                background: '#FAF7F2',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #EADBCC',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '145px', overflow: 'hidden' }}>
                <img
                  src="/assets/images/sangam-wf-deal.jpg"
                  alt="एक्झिक्युटिव्ह बोर्डरूम क्लोज्ड डील व व्यावसायिक यश"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7A1C08', marginBottom: '4px' }}>
                  टप्पा ४ • क्लोज्ड डील व यश
                </div>
                <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px', fontFamily: 'Baloo 2', color: '#1B2430' }}>
                  ४. रेफरल ट्रॅकिंग व क्लोज्ड डील
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#5A626F', lineHeight: 1.5, margin: 0 }}>
                  प्रत्येक यशस्वी कराराची नोंद ठेवा, व्यवसाय वृद्धी साजरी करा आणि संपूर्ण मराठा समाजातील उद्योगांचा विस्तार करा.
                </p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
