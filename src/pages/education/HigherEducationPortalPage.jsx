import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MAHARASHTRA_DISTRICTS, MASTER_MAHARASHTRA_COLLEGES } from '../../data/collegesData';

const SCHOLARSHIP_SCHEMES = [
  {
    id: 'SCH01',
    name: 'सारथी (SARTHI) छत्रपती शाहू महाराज परदेशी शिक्षण शिष्यवृत्ती',
    org: 'सारथी, महाराष्ट्र शासन (स्वायत्त संस्था)',
    eligible: 'मराठा, कुणबी व मराठा-कुणबी विद्यार्थी (वार्षिक उत्पन्न मर्यादा: ₹८ लाख आत)',
    benefit: 'परदेशातील QS रँकिंग ५०० मधील विद्यापीठांचे संपूर्ण शैक्षणिक शुल्क + विमान प्रवास + निर्वाह भत्ता (दरवर्षी ₹३० ते ₹४० लाख पर्यंत)',
    courses: 'MS, MBA, Ph.D, STEM व मानव्यविद्या (UK, US, Germany, Australia इ.)',
    portal: 'sarthi-maharashtragov.in',
    lastDate: '३० नोव्हेंबर २०२६ (वार्षिक प्रवेश सायकल)',
    image: '/assets/images/edu-scholarship-sarthi.jpg',
    badge: 'परदेशी शिक्षण (Study Abroad)'
  },
  {
    id: 'SCH02',
    name: 'राजर्षी छत्रपती शाहू महाराज शिक्षण शुल्क प्रतिपूर्ती योजना (EBC)',
    org: 'उच्च व तंत्रशिक्षण विभाग, महाराष्ट्र शासन',
    eligible: 'शासकीय व खाजगी विनाअनुदानित कॉलेजेसमध्ये शिकणारे मराठा/EWS/खुला प्रवर्ग विद्यार्थी',
    benefit: 'ट्युशन फी व परीक्षा शुल्कात ५०% ते १००% थेट परतावा (डीबीटी द्वारे थेट बँक खात्यात)',
    courses: 'Engineering, Medical, Pharmacy, Architecture, MBA, MCA, Law, B.Sc',
    portal: 'mahadbt.maharashtra.gov.in',
    lastDate: '३१ डिसेंबर २०२६ (महाडीबीटी पोर्टलवर)',
    image: '/assets/images/edu-scholarship-mpsc.jpg',
    badge: '५०% ते १००% फी माफी'
  },
  {
    id: 'SCH03',
    name: 'डॉ. पंजाबराव देशमुख वसतिगृह निर्वाह भत्ता योजना',
    org: 'तंत्रशिक्षण संचालनालय (DTE Maharashtra)',
    eligible: 'अल्पभूधारक शेतकरी व नोंदणीकृत मजुरांचे पाल्ये, ज्यांना शासकीय वसतिगृहात प्रवेश मिळाला नाही',
    benefit: 'मुंबई, पुणे, नागपूर शहरांसाठी ₹३०,००० / वर्ष; इतर जिल्ह्यांसाठी ₹२०,००० / वर्ष थेट भत्ता',
    courses: 'सर्व व्यावसायिक पदवी व पदविका अभ्यासक्रम',
    portal: 'mahadbt.maharashtra.gov.in',
    lastDate: '१५ जानेवारी २०२७',
    image: '/assets/images/edu-scholarship-hostel.jpg',
    badge: 'मेस व रूम निर्वाह भत्ता'
  },
  {
    id: 'SCH04',
    name: 'सारथी UPSC / MPSC नागरी सेवा परीक्षा प्रशिक्षण व मासिक विद्यावेतन',
    org: 'छत्रपती शाहू महाराज संशोधन, प्रशिक्षण व मानव विकास संस्था (सारथी)',
    eligible: 'मराठा समाजातील पदवीधर युवक-युवती (राज्यस्तरीय सीईटी परीक्षा उत्तीर्ण)',
    benefit: 'दिल्ली व पुण्यातील नामवंत अकॅडेमींमध्ये मोफत कोचिंग + दरमहा ₹१३,००० ते ₹१५,००० विद्यावेतन',
    courses: 'UPSC Civil Services, MPSC Rajyaseva, PSI, STI, Combined Exams',
    portal: 'sarthi-maharashtragov.in',
    lastDate: '१५ ऑक्टोबर २०२६ (CET फॉर्म)',
    image: '/assets/images/edu-scholarship-mpsc.jpg',
    badge: 'मोफत कोचिंग + विद्यावेतन'
  }
];

export default function HigherEducationPortalPage() {
  const [activeTab, setActiveTab] = useState('colleges'); // 'colleges' | 'scholarships' | 'guidance'
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedDivision, setSelectedDivision] = useState('all');
  const [selectedStream, setSelectedStream] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Guidance Consultation Modal
  const [showCounselModal, setShowCounselModal] = useState(false);
  const [counselCollege, setCounselCollege] = useState(null);
  const [counselSuccess, setCounselSuccess] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    phone: '',
    email: '',
    district: 'पुणे',
    currentEducation: '',
    interestedStream: 'Engineering',
    queryText: ''
  });

  // Unique list of divisions
  const divisions = useMemo(() => {
    return ['all', ...Array.from(new Set(MAHARASHTRA_DISTRICTS.map(d => d.division)))];
  }, []);

  // Filtered districts by division
  const availableDistricts = useMemo(() => {
    if (selectedDivision === 'all') return MAHARASHTRA_DISTRICTS;
    return MAHARASHTRA_DISTRICTS.filter(d => d.division === selectedDivision);
  }, [selectedDivision]);

  // Filtered Colleges list
  const filteredColleges = useMemo(() => {
    return MASTER_MAHARASHTRA_COLLEGES.filter((col) => {
      const matchDivision = selectedDivision === 'all' || col.division === selectedDivision;
      const matchDistrict = selectedDistrict === 'all' || col.city === selectedDistrict;
      const matchStream = selectedStream === 'all' || col.stream === selectedStream;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        col.name.toLowerCase().includes(q) ||
        col.city.toLowerCase().includes(q) ||
        col.streamLabel.toLowerCase().includes(q) ||
        col.courses.some(c => c.toLowerCase().includes(q));
      return matchDivision && matchDistrict && matchStream && matchQuery;
    });
  }, [selectedDivision, selectedDistrict, selectedStream, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredColleges.length / pageSize) || 1;
  const pagedColleges = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredColleges.slice(start, start + pageSize);
  }, [filteredColleges, page, pageSize]);

  const handleCounselSubmit = (e) => {
    e.preventDefault();
    setCounselSuccess(true);
  };

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', padding: '36px 0 60px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>

        {/* HERO BANNER - COMPACT & HIGH IMPACT */}
        <section
          style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '32px',
            boxShadow: '0 12px 36px rgba(122, 28, 8, 0.16)',
            border: '1px solid #E6D5C3',
            background: 'linear-gradient(135deg, #4A1005 0%, #7A1C08 50%, #C73800 100%)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url(/assets/images/edu-hero-banner.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.22,
              mixBlendMode: 'luminosity'
            }}
          />
          <div style={{ position: 'relative', zIndex: 2, padding: '38px 34px', color: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span
                style={{
                  background: 'rgba(251, 215, 107, 0.2)',
                  border: '1px solid #FBD76B',
                  color: '#FBD76B',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  letterSpacing: '0.5px'
                }}
              >
                🎓 महाराष्ट्र उच्च शिक्षण व शिष्यवृत्ती महापोर्टल
              </span>
              <span style={{ color: '#FBD76B', fontSize: '0.85rem' }}>★ ३६ जिल्हे • ७२०+ महाविद्यालये</span>
            </div>

            <h1
              style={{
                fontFamily: 'Baloo 2',
                fontSize: '2.4rem',
                fontWeight: 800,
                lineHeight: 1.2,
                margin: '0 0 12px',
                textShadow: '0 2px 8px rgba(0,0,0,0.4)'
              }}
            >
              महाराष्ट्रातील सर्व ३६ जिल्ह्यांतील टॉप कॉलेजेस व शिष्यवृत्ती दालन
            </h1>
            <p
              style={{
                fontSize: '1.02rem',
                lineHeight: 1.6,
                color: '#FFF3E0',
                maxWidth: '820px',
                margin: '0 0 24px'
              }}
            >
              प्रत्येक जिल्ह्यातील २० प्रमुख महाविद्यालये (अभियांत्रिकी, वैद्यकीय, कृषी, विधी, व्यवस्थापन, फार्मसी, 
              पॉलिटेक्निक, नर्सिंग व स्पर्धा परीक्षा केंद्रे), त्यांचे शुल्क, प्रवेश प्रक्रिया, वसतिगृहे आणि सारथी व महाडीबीटी शिष्यवृत्ती.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setActiveTab('colleges'); }}
                style={{
                  background: activeTab === 'colleges' ? '#FBD76B' : 'rgba(255,255,255,0.15)',
                  color: activeTab === 'colleges' ? '#4A1005' : '#FFFFFF',
                  border: '1px solid rgba(251, 215, 107, 0.4)',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.92rem'
                }}
              >
                🏛️ सर्व कॉलेजेस ({MASTER_MAHARASHTRA_COLLEGES.length})
              </button>
              <button
                onClick={() => { setActiveTab('scholarships'); }}
                style={{
                  background: activeTab === 'scholarships' ? '#FBD76B' : 'rgba(255,255,255,0.15)',
                  color: activeTab === 'scholarships' ? '#4A1005' : '#FFFFFF',
                  border: '1px solid rgba(251, 215, 107, 0.4)',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.92rem'
                }}
              >
                💰 शिष्यवृत्ती योजना ({SCHOLARSHIP_SCHEMES.length})
              </button>
              <button
                onClick={() => { setActiveTab('guidance'); }}
                style={{
                  background: activeTab === 'guidance' ? '#FBD76B' : 'rgba(255,255,255,0.15)',
                  color: activeTab === 'guidance' ? '#4A1005' : '#FFFFFF',
                  border: '1px solid rgba(251, 215, 107, 0.4)',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: '0.92rem'
                }}
              >
                🤝 मोफत प्रवेश समुपदेशन
              </button>
            </div>
          </div>
        </section>

        {/* TAB 1: MASTER COLLEGES DIRECTORY */}
        {activeTab === 'colleges' && (
          <div>
            {/* Quick District Selector Carousel / Badges */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#7A1C08' }}>
                  📍 लोकप्रिय शहरे / जिल्हे निवडा (३६ जिल्हे उपलब्ध):
                </span>
                {selectedDistrict !== 'all' && (
                  <button
                    onClick={() => { setSelectedDistrict('all'); setPage(1); }}
                    style={{ background: 'none', border: 'none', color: '#C73800', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    सर्व शहरे दाखवा (Reset)
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
                {['पुणे', 'मुंबई शहर', 'मुंबई उपनगर', 'ठाणे', 'छत्रपती संभाजीनगर', 'नाशिक', 'नागपूर', 'कोल्हापूर', 'सातारा', 'सोलापूर', 'सांगली', 'अहिल्यानगर (अहमदनगर)', 'जळगाव', 'अमरावती', 'नांदेड', 'लातूर', 'बीड'].map(dName => (
                  <button
                    key={dName}
                    onClick={() => { setSelectedDistrict(dName); setPage(1); }}
                    style={{
                      background: selectedDistrict === dName ? '#C73800' : '#FFFFFF',
                      color: selectedDistrict === dName ? '#FFFFFF' : '#374151',
                      border: '1px solid #D6D3CD',
                      padding: '5px 12px',
                      borderRadius: '16px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                  >
                    {dName}
                  </button>
                ))}
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '16px 20px',
                border: '1px solid #EADBCC',
                marginBottom: '24px',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                alignItems: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
              }}
            >
              <input
                type="text"
                placeholder="महाविद्यालय, अभ्यासक्रम किंवा शहर शोधा..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                style={{
                  flex: 2,
                  minWidth: '220px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #D6D3CD',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />

              {/* Division filter */}
              <select
                value={selectedDivision}
                onChange={(e) => { setSelectedDivision(e.target.value); setSelectedDistrict('all'); setPage(1); }}
                style={{
                  flex: 1,
                  minWidth: '150px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #D6D3CD',
                  fontSize: '0.86rem',
                  background: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value="all">सर्व विभाग (All Divisions)</option>
                {divisions.filter(d => d !== 'all').map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>

              {/* District filter */}
              <select
                value={selectedDistrict}
                onChange={(e) => { setSelectedDistrict(e.target.value); setPage(1); }}
                style={{
                  flex: 1,
                  minWidth: '150px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #D6D3CD',
                  fontSize: '0.86rem',
                  background: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value="all">सर्व ३६ जिल्हे (All Districts)</option>
                {availableDistricts.map(d => (
                  <option key={d.id} value={d.name}>{d.name} ({d.division.split(' ')[0]})</option>
                ))}
              </select>

              {/* Stream filter */}
              <select
                value={selectedStream}
                onChange={(e) => { setSelectedStream(e.target.value); setPage(1); }}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #D6D3CD',
                  fontSize: '0.86rem',
                  background: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value="all">सर्व २० विद्याशाखा (All Streams)</option>
                <option value="Engineering">अभियांत्रिकी (Engineering / Poly)</option>
                <option value="Medical">वैद्यकीय (MBBS / BAMS)</option>
                <option value="Pharmacy">औषधनिर्माण (Pharmacy)</option>
                <option value="Management">व्यवस्थापन (MBA & MCA)</option>
                <option value="Law">विधी व कायदे (Law / LL.B)</option>
                <option value="Agriculture">कृषी व तंत्रज्ञान (Agriculture)</option>
                <option value="University">कला, विज्ञान व वाणिज्य (Degree)</option>
                <option value="Nursing">नर्सिंग व पॅरामेडिकल (Nursing)</option>
                <option value="IT_Science">सायबर सुरक्षा व AI (IT/AI)</option>
                <option value="Architecture">वास्तुकला (Architecture)</option>
                <option value="Veterinary">पशुवैद्यकीय (Veterinary)</option>
                <option value="Hotel_Management">हॉटेल मॅनेजमेंट (BHMCT)</option>
                <option value="Competitive_Exams">स्पर्धा परीक्षा प्रबोधिनी (MPSC)</option>
              </select>

              <div style={{ fontSize: '0.86rem', color: '#7A1C08', fontWeight: 700, paddingLeft: '4px' }}>
                उपलब्ध: <strong>{filteredColleges.length}</strong> कॉलेजेस
              </div>
            </div>

            {/* Colleges Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              {pagedColleges.map((col) => (
                <div
                  key={col.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #EADBCC',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* College Campus Photo */}
                  <div style={{ position: 'relative', height: '185px', background: '#2D3748', overflow: 'hidden' }}>
                    <img
                      src={col.image}
                      alt={col.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        color: '#7A1C08',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: 700
                      }}
                    >
                      📍 {col.city} • स्था. {col.est}
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#FEF3C7',
                        color: '#92400E',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        border: '1px solid #FDE68A'
                      }}
                    >
                      {col.streamLabel.split(' ')[0]}
                    </div>

                    <div style={{ position: 'absolute', bottom: '10px', left: '16px', right: '16px' }}>
                      <div style={{ color: '#FBD76B', fontSize: '0.73rem', fontWeight: 600 }}>
                        🏆 {col.ranking}
                      </div>
                      <h3
                        style={{
                          margin: '2px 0 0',
                          fontFamily: 'Baloo 2',
                          fontSize: '1.18rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          lineHeight: 1.25,
                          textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                        }}
                      >
                        {col.name}
                      </h3>
                    </div>
                  </div>

                  {/* College Body */}
                  <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: '0 0 12px', lineHeight: 1.5 }}>
                      {col.highlight}
                    </p>

                    <div style={{ background: '#FAF7F2', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px', fontSize: '0.8rem', border: '1px solid #F0ECE4' }}>
                      <div style={{ marginBottom: '5px' }}>
                        <span style={{ color: '#7A1C08', fontWeight: 700 }}>प्रवेश परीक्षा: </span>
                        <strong>{col.admission}</strong>
                      </div>
                      <div style={{ marginBottom: '5px' }}>
                        <span style={{ color: '#7A1C08', fontWeight: 700 }}>अंदाजे शुल्क: </span>
                        {col.fees}
                      </div>
                      <div>
                        <span style={{ color: '#7A1C08', fontWeight: 700 }}>वसतिगृह: </span>
                        {col.hostel}
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                        उपलब्ध कोर्सेस:
                      </div>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {col.courses.map((crs, i) => (
                          <span
                            key={i}
                            style={{
                              background: '#FFF3E0',
                              color: '#C73800',
                              fontSize: '0.7rem',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontWeight: 600,
                              border: '1px solid #FFE0B2'
                            }}
                          >
                            • {crs}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', borderTop: '1px solid #F3F4F6', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => { setCounselCollege(col); setShowCounselModal(true); setCounselSuccess(false); }}
                        style={{
                          flex: 1,
                          background: '#C73800',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        🎓 प्रवेश साहाय्य
                      </button>
                      <a
                        href={col.website}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          background: '#FFFFFF',
                          color: '#1B2430',
                          border: '1px solid #D6D3CD',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          textDecoration: 'none'
                        }}
                      >
                        माहिती पहा ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 380, behavior: 'smooth' }); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #D6D3CD',
                    background: page <= 1 ? '#F3F4F6' : '#FFFFFF',
                    color: page <= 1 ? '#9CA3AF' : '#1B2430',
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 700
                  }}
                >
                  ← मागील
                </button>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#4B5563', padding: '0 8px' }}>
                  पान <strong>{page}</strong> / <strong>{totalPages}</strong> (एकूण {filteredColleges.length} कॉलेजेस)
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 380, behavior: 'smooth' }); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #D6D3CD',
                    background: page >= totalPages ? '#F3F4F6' : '#FFFFFF',
                    color: page >= totalPages ? '#9CA3AF' : '#1B2430',
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                    fontWeight: 700
                  }}
                >
                  पुढील →
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SCHOLARSHIPS DIRECTORY */}
        {activeTab === 'scholarships' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '26px' }}>
            {SCHOLARSHIP_SCHEMES.map((sch) => (
              <div
                key={sch.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1px solid #EADBCC',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={sch.image}
                    alt={sch.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)'
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: '#15803D',
                      color: '#FFFFFF',
                      padding: '3px 12px',
                      borderRadius: '20px',
                      fontSize: '0.74rem',
                      fontWeight: 700
                    }}
                  >
                    {sch.badge}
                  </div>
                  <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                    <div style={{ color: '#FBD76B', fontSize: '0.74rem', fontWeight: 600 }}>
                      संस्था: {sch.org}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.22rem', fontFamily: 'Baloo 2', margin: '0 0 10px', color: '#1B2430', lineHeight: 1.3 }}>
                    {sch.name}
                  </h3>

                  <div style={{ background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.76rem', color: '#166534', fontWeight: 700, marginBottom: '4px' }}>
                      मिळणारे थेट आर्थिक सहाय्य:
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#14532D', fontWeight: 600, lineHeight: 1.5 }}>
                      {sch.benefit}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '8px' }}>
                    <strong style={{ color: '#7A1C08' }}>पात्रता: </strong> {sch.eligible}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '8px' }}>
                    <strong style={{ color: '#7A1C08' }}>लागू अभ्यासक्रम: </strong> {sch.courses}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '16px' }}>
                    <strong style={{ color: '#7A1C08' }}>अंतिम मुदत: </strong> {sch.lastDate}
                  </div>

                  <div style={{ marginTop: 'auto', borderTop: '1px solid #F0ECE4', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>पोर्टल: {sch.portal}</span>
                    <a
                      href={`https://${sch.portal}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#15803D',
                        color: '#FFFFFF',
                        padding: '8px 18px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        textDecoration: 'none'
                      }}
                    >
                      थेट अर्ज करा ↗
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: GUIDANCE & HELPDESK */}
        {activeTab === 'guidance' && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #EADBCC',
              padding: '36px 30px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px' }}>
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
                🤝 विनामूल्य विद्यार्थी समुपदेशन कक्ष
              </span>
              <h2 style={{ fontSize: '1.9rem', margin: '4px 0 8px', fontFamily: 'Baloo 2', color: '#1B2430', fontWeight: 800 }}>
                प्रवेश व शिष्यवृत्ती मार्गदर्शनासाठी संपर्क करा
              </h2>
              <p style={{ color: '#5A626F', fontSize: '0.92rem', margin: 0 }}>
                मराठा समाजातील ज्येष्ठ प्राध्यापक, करिअर कौन्सिलर्स व सारथी शिष्यवृत्ती विजेत्यांकडून थेट सल्ला मिळवा.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <div style={{ background: '#FAF7F2', borderRadius: '12px', padding: '20px', border: '1px solid #EADBCC' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>📞</div>
                <h4 style={{ margin: '0 0 6px', fontFamily: 'Baloo 2', fontSize: '1.1rem' }}>उच्च शिक्षण हेल्पलाइन</h4>
                <p style={{ fontSize: '0.84rem', color: '#5A626F', margin: '0 0 10px' }}>सकाळी १०:०० ते सायं ६:०० दरम्यान चालू</p>
                <div style={{ fontWeight: 800, color: '#C73800' }}>+91 98220 12345 / ०२०-२५५०१०००</div>
              </div>

              <div style={{ background: '#FAF7F2', borderRadius: '12px', padding: '20px', border: '1px solid #EADBCC' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>✈️</div>
                <h4 style={{ margin: '0 0 6px', fontFamily: 'Baloo 2', fontSize: '1.1rem' }}>परदेशी शिक्षण कक्ष</h4>
                <p style={{ fontSize: '0.84rem', color: '#5A626F', margin: '0 0 10px' }}>GRE / IELTS / TOEFL व व्हिसा मार्गदर्शन</p>
                <div style={{ fontWeight: 800, color: '#15803D' }}>overseas@connectmaratha.com</div>
              </div>

              <div style={{ background: '#FAF7F2', borderRadius: '12px', padding: '20px', border: '1px solid #EADBCC' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🏢</div>
                <h4 style={{ margin: '0 0 6px', fontFamily: 'Baloo 2', fontSize: '1.1rem' }}>वसतिगृह व निवास साहाय्य</h4>
                <p style={{ fontSize: '0.84rem', color: '#5A626F', margin: '0 0 10px' }}>पुणे, मुंबई व छत्रपती संभाजीनगर हॉस्टेल समन्वय</p>
                <div style={{ fontWeight: 800, color: '#7A1C08' }}>hostel@connectmaratha.com</div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => { setCounselCollege(null); setShowCounselModal(true); setCounselSuccess(false); }}
                style={{
                  background: '#C73800',
                  color: '#FFFFFF',
                  padding: '12px 32px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(199, 56, 0, 0.3)'
                }}
              >
                📝 ऑनलाइन सल्लामसलत अर्ज भरा
              </button>
            </div>
          </div>
        )}

        {/* MODAL: COUNSELING FORM */}
        {showCounselModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                maxWidth: '520px',
                width: '100%',
                padding: '28px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              {counselSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🎉</div>
                  <h3 style={{ color: '#15803D', fontFamily: 'Baloo 2', fontSize: '1.6rem', margin: '0 0 8px' }}>
                    अर्ज यशस्वीरित्या नोंदवला गेला!
                  </h3>
                  <p style={{ color: '#4B5563', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
                    आमचे वरिष्ठ शिक्षण तज्ज्ञ व समुपदेशक पुढील २४ तासांत आपल्याशी थेट संपर्क साधतील आणि
                    योग्य मार्गदर्शन करतील.
                  </p>
                  <button
                    onClick={() => setShowCounselModal(false)}
                    style={{
                      background: '#C73800',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 28px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    पूर्ण झाले (Close)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCounselSubmit}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontFamily: 'Baloo 2', color: '#7A1C08', fontSize: '1.4rem' }}>
                      🎓 विनामूल्य प्रवेश व शिष्यवृत्ती समुपदेशन
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowCounselModal(false)}
                      style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#6B7280' }}
                    >
                      ✕
                    </button>
                  </div>

                  {counselCollege && (
                    <div style={{ background: '#FFF3E0', padding: '8px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.84rem', color: '#C73800', fontWeight: 600 }}>
                      संबंधित कॉलेज: {counselCollege.name}
                    </div>
                  )}

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#374151' }}>
                      विद्यार्थ्याचे पूर्ण नाव *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      placeholder="उदा. राहुल सचिन देशमुख"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D6D3CD', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#374151' }}>
                        मोबाईल नंबर *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98..."
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D6D3CD', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#374151' }}>
                        जिल्हा *
                      </label>
                      <select
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D6D3CD', boxSizing: 'border-box' }}
                      >
                        {MAHARASHTRA_DISTRICTS.map(d => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#374151' }}>
                      इच्छित विद्याशाखा / कोर्स *
                    </label>
                    <select
                      value={formData.interestedStream}
                      onChange={(e) => setFormData({ ...formData, interestedStream: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D6D3CD', boxSizing: 'border-box' }}
                    >
                      <option value="Engineering">अभियांत्रिकी (B.Tech / M.Tech / Poly)</option>
                      <option value="Medical">वैद्यकीय (MBBS / BAMS / Nursing)</option>
                      <option value="Pharmacy">औषधनिर्माण (B.Pharm / D.Pharm)</option>
                      <option value="Management">व्यवस्थापन (MBA / MCA)</option>
                      <option value="Law">विधी व न्यायशास्त्र (Law / LL.B)</option>
                      <option value="Agriculture">कृषी व तंत्रज्ञान (B.Sc Agri)</option>
                      <option value="Overseas">परदेशी शिक्षण (सारथी शिष्यवृत्ती)</option>
                      <option value="MPSC_UPSC">स्पर्धा परीक्षा (UPSC / MPSC)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px', color: '#374151' }}>
                      आपली अडचण किंवा प्रश्न
                    </label>
                    <textarea
                      rows="3"
                      value={formData.queryText}
                      onChange={(e) => setFormData({ ...formData, queryText: e.target.value })}
                      placeholder="उदा. मला सारथी शिष्यवृत्तीचे नियम व हॉस्टेल आरक्षणाबाबत मार्गदर्शन हवे आहे..."
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #D6D3CD', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      background: '#C73800',
                      color: '#FFFFFF',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    मार्गदर्शन विनंती पाठवा 🚀
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
