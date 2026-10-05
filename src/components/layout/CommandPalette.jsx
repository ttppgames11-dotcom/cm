import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SEARCHABLE_ITEMS = [
  // Governance & Core
  { title: 'आमच्याबद्दल (About Connect Maratha)', path: '/about', category: 'संस्था', keywords: 'about us mahasangh sanstha info परिचय सनद' },
  { title: 'व्हिजन व ध्येय (Vision & Mission)', path: '/vision', category: 'संस्था', keywords: 'vision mission dhyey uddishte व्हिजन ध्येय' },
  { title: '५० विभाग मास्टर ब्लूप्रिंट व संकल्प (Blueprint)', path: '/blueprint', category: 'संस्था', keywords: 'blueprint sankalp uddishta master plan धोरण' },
  { title: 'सहभागी का व्हावे? (Why to Join Connect Maratha)', path: '/why-join', category: 'संस्था', keywords: 'why join benefits fayde सहभाग सामील' },
  { title: 'संपर्क व तक्रार निवारण (Contact & Support)', path: '/contact', category: 'संस्था', keywords: 'contact support phone email helpline संपर्क' },
  { title: '५६ पदे व पात्रता मॅट्रिक्स (56 Roles Matrix)', path: '/roles-matrix', category: 'प्रशासन', keywords: '56 roles pade eligibility matrix पात्रता पद पदे' },
  { title: 'DPDP २०२३ व संविधान धोरण (Governance)', path: '/governance', category: 'प्रशासन', keywords: 'dpdp privacy governance sanvidhan policy नियम' },
  
  // High-Impact Features
  { title: 'मराठा दिनदर्शिका (पंचांग, सण व इतिहास)', path: '/calendar', category: 'संस्कृती', keywords: 'calendar panchang dinvishesh dinadarshika दिनदर्शिका पंचांग' },
  { title: 'संपूर्ण महाराष्ट्र महाविश्व (४९ वैशिष्ट्ये)', path: '/universe', category: 'महाविश्व', keywords: 'universe mahavishwa 49 features features नकाशा' },
  { title: 'महाराष्ट्र डेटा प्लॅटफॉर्म (50+ Datasets)', path: '/platform', category: 'डेटा', keywords: 'data platform open data maharashtra आंकड़ेवारी' },
  { title: 'डिजिटल स्मार्ट सभासद ओळखपत्र (Smart Card)', path: '/card', category: 'सदस्य', keywords: 'card id identity smart card ओळखपत्र कार्ड' },
  { title: 'स्वराज्य इतिहास महाक्विझ (History Quiz)', path: '/quiz', category: 'इतिहास', keywords: 'quiz test exam prashnamanjusha महाक्विझ प्रश्नमंजुषा' },

  // History & Heritage
  { title: 'छत्रपती शिवाजी महाराज (चरित्र व राज्याभिषेक)', path: '/history/shivaji-maharaj', category: 'इतिहास', keywords: 'shivaji maharaj charitra shivray chhatrapati छत्रपती शिवाजी महाराज' },
  { title: 'छत्रपती संभाजी महाराज (शौर्यगाथा व बलिदान मास)', path: '/history/sambhaji-maharaj', category: 'इतिहास', keywords: 'sambhaji maharaj balidan maas dharmaveer शंभूराजे संभाजी' },
  { title: 'धर्मवीर बलिदान मास स्मरण (Balidan Maas)', path: '/history/balidan-maas', category: 'इतिहास', keywords: 'balidan maas march april smaran बलिदान मास' },
  { title: 'राष्ट्रमाता जिजाऊ माँसाहेब', path: '/history/rajmata-jijau', category: 'इतिहास', keywords: 'jijau maasaheb sindkhed raja जिजाऊ माँसाहेब' },
  { title: 'श्रीमंत थोरले बाजीराव पेशवे (अजिंक्य सेनापती)', path: '/history/bajirao-peshwa', category: 'इतिहास', keywords: 'bajirao peshwa battles mastani बाजीराव पेशवे' },
  { title: 'सह्याद्रीचे ३५०+ गडकिल्ले व नकाशे (Forts)', path: '/forts', category: 'किल्ले', keywords: 'forts gad kille sahyadri raigad rajgad shivneri किल्ले गड' },
  { title: 'किल्ले रायगड (राजधानी)', path: '/forts/raigad', category: 'किल्ले', keywords: 'raigad capital samadhi jagdishwar रायगड' },
  { title: 'किल्ले प्रतापगड व अफझलखान वध', path: '/forts/pratapgad', category: 'किल्ले', keywords: 'pratapgad afzalkhan bhavani mata प्रतापगड' },
  { title: 'किल्ले शिवनेरी (जन्मस्थान)', path: '/forts/shivneri', category: 'किल्ले', keywords: 'shivneri junnar birth place शिवनेरी' },
  { title: 'प्रमुख ७ ऐतिहासिक रणांगणे व व्यूहरचना', path: '/history/battles', category: 'इतिहास', keywords: 'battles ranangan panipat pavankhind war लढाया रणांगण' },
  { title: 'मराठा आरमार व जलदुर्ग (Maratha Navy)', path: '/history/navy', category: 'इतिहास', keywords: 'navy armar kanhoji angre vijaydurg sindhudurg आरमार' },
  { title: 'मराठा महाग्रंथालय व दुर्मीळ बखरी (Granthalaya)', path: '/granthalaya', category: 'इतिहास', keywords: 'granthalaya library bakhari modilipi books ग्रंथालय बखरी' },
  { title: 'मराठा ज्ञानकोश (Dnyankosh)', path: '/dnyankosh', category: 'इतिहास', keywords: 'dnyankosh encyclopedia gyan kosh ज्ञानकोश' },
  { title: 'शिवचरित्र अखंड कथन (१५ भाग)', path: '/shivcharitra', category: 'इतिहास', keywords: 'shivcharitra 15 parts audio katha शिवचरित्र' },
  { title: 'मराठा क्रांती मूक मोर्चे इतिहास (५८+)', path: '/history/movements', category: 'इतिहास', keywords: 'morcha kranti silent march kranti morcha मोर्चे' },

  // Business & Career
  { title: 'अखिल मराठा व्यवसाय निर्देशिका (Business Directory)', path: '/business/directory', category: 'व्यवसाय', keywords: 'business directory udyojak vyavasay shops कंपनी उद्योग' },
  { title: 'बिझनेस संगम व चॅप्टर्स (Business Sangam)', path: '/sangam', category: 'व्यवसाय', keywords: 'sangam chapters networking bni leads संगम चॅप्टर' },
  { title: 'रेफरल व व्यावसायिक देवाणघेवाण (Referral Hub)', path: '/referrals', category: 'व्यवसाय', keywords: 'referrals business leads connection संदर्भ रेफरल' },
  { title: '१-टू-१ व्यावसायिक विश्वास भेटी (Meetings)', path: '/meetings', category: 'व्यवसाय', keywords: 'meetings 1-to-1 appointments b2b भेटी' },
  { title: 'रोजगार केंद्र व भरती पोर्टल (Jobs Portal)', path: '/jobs', category: 'करिअर', keywords: 'jobs recruitment vacancy career nokari रोजगार नोकरी' },
  { title: 'मराठा बँक व पतसंस्था (Bank & Finance)', path: '/bank', category: 'व्यवसाय', keywords: 'bank finance patsanstha loan finance बँक कर्ज' },
  { title: 'मराठा बिल्डर्स व डेव्हलपर्स (Builders)', path: '/builders', category: 'व्यवसाय', keywords: 'builders construction real estate flat plots बिल्डर्स' },
  { title: 'मराठा मॅन्युफॅक्चरर्स व उद्योग (Manufacturers)', path: '/manufacturers', category: 'व्यवसाय', keywords: 'manufacturers factory industrial उत्पादन कारखाने' },
  { title: 'मराठा दूध व संकलन केंद्र (Dairy)', path: '/dairy', category: 'व्यवसाय', keywords: 'dairy milk dudh sangh दूध डेअरी' },

  // Professionals & Directory
  { title: 'मराठा तज्ज्ञ डॉक्टर्स डिरेक्टरी (Doctors)', path: '/doctors', category: 'सेवा', keywords: 'doctors hospital clinic vaidya medical डॉक्टर्स रुग्णालय' },
  { title: 'मराठा कलाकार, गायक व दिग्दर्शक (Artists)', path: '/artists', category: 'कला', keywords: 'artists actors singers directors कलावंत कलाकार गायक' },
  { title: 'मराठी चित्रपट व समीक्षा (Movies)', path: '/movies', category: 'कला', keywords: 'movies cinema marathi natak चित्रपट सिनेमा' },
  { title: 'मराठा ग्रंथ व साहित्य दालन (Books)', path: '/books', category: 'साहित्य', keywords: 'books literature granth pustake पुस्तके ग्रंथ' },
  { title: 'प्रेरक वक्ते व मार्गदर्शक (Speakers)', path: '/speakers', category: 'प्रबोधन', keywords: 'speakers pravachan vyakhyan वक्ते व्याख्याते' },
  { title: 'मराठा सनदी अधिकारी (IAS/IPS/MPSC)', path: '/officers', category: 'प्रशासन', keywords: 'officers ias ips mpsc upsc सनदी अधिकारी' },
  { title: 'मराठा निष्ठावंत समाजसेवक (Social Workers)', path: '/social-workers', category: 'समाज', keywords: 'social workers samajsevak karyakarta समाजसेवक' },
  { title: 'राजकीय नेतृत्व व पक्ष प्रतिनिधी (Political Leaders)', path: '/political', category: 'समाज', keywords: 'political leaders parties neta rajkiya नेते राजकीय' },
  { title: 'मराठा सामाजिक संघटना (Organizations)', path: '/organizations', category: 'समाज', keywords: 'organizations sanghatana trust mandal संघटना संस्था' },
  { title: 'मराठा न्यूज व ई-पेपर्स (News & Media)', path: '/maratha-news', category: 'माहिती', keywords: 'news epapers media batamya वृत्तपत्र बातम्या' },

  // Welfare & Community
  { title: 'मराठा डिजिटल कम्युनिटी व मंच (Community Feed)', path: '/community', category: 'समाज', keywords: 'community feed posts discussions मंच कम्युनिटी' },
  { title: '२४×७ आपत्कालीन रक्त मदत केंद्र (Blood Help)', path: '/blood', category: 'कल्याण', keywords: 'blood donation helpline rakta raktadan रक्त मदत' },
  { title: 'मराठा वधू-वर सूचक केंद्र (Matrimony)', path: '/matrimony', category: 'कल्याण', keywords: 'matrimony vadhu var vivah lagn विवाह वधू वर' },
  { title: 'महिला सक्षमीकरण कक्ष (Women Empowerment)', path: '/women', category: 'कल्याण', keywords: 'women mahila sakshamikaran bachat gat महिला' },
  { title: 'दुर्ग संवर्धन व देणगी कोष (Donations)', path: '/donation', category: 'सेवा', keywords: 'donation fund durg sanvardhan dangarh निधी देणगी' },
  { title: 'राष्ट्रीय मराठा गौरव व अचीव्हर्स (Achievers)', path: '/achievers', category: 'गौरव', keywords: 'achievers gaurav ratna awards पुरस्कार गौरव' },

  // User & Account
  { title: 'सदस्य नोंदणी व ऑनबोर्डिंग (Register)', path: '/register', category: 'सदस्य', keywords: 'register signup join nondani नोंदणी' },
  { title: 'सदस्य लॉगिन (Login)', path: '/login', category: 'सदस्य', keywords: 'login signin account प्रवेश लॉगिन' },
  { title: 'सदस्य डॅशबोर्ड (Dashboard)', path: '/dashboard', category: 'सदस्य', keywords: 'dashboard my profile home डॅशबोर्ड' },
  { title: 'अ‍ॅडमिन ईआरपी कन्सोल (Admin ERP)', path: '/admin', category: 'प्रशासन', keywords: 'admin erp console backend प्रशासन' },
  { title: 'सर्वोच्च प्रशासक कन्सोल (SuperAdmin)', path: '/superadmin', category: 'प्रशासन', keywords: 'superadmin super master admin सर्वोच्च' },
  { title: 'CMS मजकूर व चित्रे संपादक (Site Content Editor)', path: '/admin/cms', category: 'प्रशासन', keywords: 'cms editor content text images संपादन' }
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const q = query.trim().toLowerCase();

  const filtered = q
    ? SEARCHABLE_ITEMS.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.toLowerCase().includes(q)) ||
        item.path.toLowerCase().includes(q)
      )
    : SEARCHABLE_ITEMS.slice(0, 10);

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  const handleSearchAll = () => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filtered.length ? (prev + 1) % filtered.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (filtered.length ? (prev - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length > 0 && filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex]);
      } else if (query.trim()) {
        handleSearchAll();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '8vh',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '92%',
          maxWidth: '640px',
          background: '#FFFFFF',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 2px #F97316',
          animation: 'fadeInScale 0.18s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 18px',
            borderBottom: '1px solid #F1F5F9',
            background: '#FFFDF9',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '1.3rem' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="किल्ले, इतिहास, व्यवसाय, डॉक्टर्स, व्हिजन शोधा... (Search anything)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              fontFamily: 'inherit',
              background: 'transparent',
              color: '#1E293B',
              fontWeight: '500',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                background: '#F1F5F9',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
                fontSize: '0.8rem',
              }}
            >
              ✕
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              color: '#DC2626',
              fontWeight: '700',
            }}
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '6px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔎</div>
              <div style={{ color: '#475569', fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>
                '{query}' साठी थेट पर्याय सापडला नाही
              </div>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '16px' }}>
                संपूर्ण डेटाबेसमध्ये शोधण्यासाठी खालील बटण दाबा:
              </p>
              <button
                type="button"
                onClick={handleSearchAll}
                style={{
                  background: 'linear-gradient(135deg, #F97316, #EA580C)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                }}
              >
                🔎 संपूर्ण वेबसाईटवर शोधा →
              </button>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.path + idx}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isSelected ? '#FFF7ED' : 'transparent',
                    border: isSelected ? '1px solid #FFEDD5' : '1px solid transparent',
                    transition: 'all 0.12s ease',
                    marginBottom: '2px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div
                      style={{
                        fontWeight: isSelected ? '800' : '600',
                        color: isSelected ? '#C2410C' : '#1E293B',
                        fontSize: '0.92rem',
                      }}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                      {item.path}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      background: isSelected ? '#FFEDD5' : '#F1F5F9',
                      color: isSelected ? '#9A3412' : '#64748B',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hint */}
        <div
          style={{
            padding: '10px 16px',
            background: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.76rem',
            color: '#64748B',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <span><strong>↑ ↓</strong> नेव्हिगेट</span>
            <span><strong>Enter</strong> उघडा</span>
          </div>
          {query.trim() && (
            <button
              type="button"
              onClick={handleSearchAll}
              style={{
                background: 'none',
                border: 'none',
                color: '#EA580C',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.76rem',
                textDecoration: 'underline',
              }}
            >
              पूर्ण शोध पेज उघडा →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
