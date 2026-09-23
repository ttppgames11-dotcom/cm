import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_NETWORK_DIVISIONS = [
  {
    id: 'pune',
    name: 'पुणे विभाग (पश्चिम महाराष्ट्र)',
    hq: 'शनिवार वाडा परिसर, पुणे',
    totalMembers: '१,८५,०००+',
    chapters: '६२ मंडळे',
    branches: '८५० शाखा',
    leadSecretary: 'श्री. संग्राम पाटील (विभागीय अध्यक्ष)',
    phone: '०२०-२४४५-१६७४',
    desc: 'शिवछत्रपतींच्या राजधानीचा, हिंदवी स्वराज्य उगम क्षेत्राचा आणि पश्चिम महाराष्ट्रातील औद्योगिक-सहकारी चळवळीचा बालेकिल्ला.',
    districts: [
      { name: 'पुणे', code: 'PN', members: '८२,०००+', talukas: ['हवेली', 'पुणे शहर', 'शिरूर', 'बारामती', 'जुन्नर', 'आंबेगाव', 'खेड', 'मावळ', 'मुळशी', 'वेल्हे', 'भोर', 'पुरंदर', 'दौंड', 'इंदापूर'] },
      { name: 'सातारा', code: 'ST', members: '३२,०००+', talukas: ['सातारा', 'कराड', 'वाई', 'महाबळेश्वर', 'जावळी', 'पाटण', 'कोरेगाव', 'खटाव', 'माण', 'फलटण', 'खंडाळा'] },
      { name: 'कोल्हापूर', code: 'KL', members: '३८,०००+', talukas: ['करवीर', 'पन्हाळा', 'शाहुवाडी', 'कागल', 'हातकणंगले', 'शिरोळ', 'राधानगरी', 'गगनबावडा', 'भुदरगड', 'आजरा', 'गडहिंग्लज', 'चंदगड'] },
      { name: 'सांगली', code: 'SG', members: '१८,०००+', talukas: ['मिरज', 'तासगाव', 'खानापूर (विटा)', 'आटपाडी', 'कवठे महांकाळ', 'जत', 'वाळवा (इस्लामपूर)', 'शिराळा', 'पलूस', 'कडेगाव'] },
      { name: 'सोलापूर', code: 'SO', members: '१५,०००+', talukas: ['उत्तर सोलापूर', 'दक्षिण सोलापूर', 'बार्शी', 'माढा', 'करमाळा', 'पंढरपूर', 'मोहोळ', 'माळशिरस', 'सांगोला', 'मंगळवेढा', 'अक्कलकोट'] }
    ]
  },
  {
    id: 'kokan',
    name: 'कोकण विभाग (सागरी आरमार व मुंबई महाक्षेत्र)',
    hq: 'दादर / नरिमन पॉईंट, मुंबई',
    totalMembers: '१,४०,०००+',
    chapters: '४८ मंडळे',
    branches: '७२० शाखा',
    leadSecretary: 'श्री. उदय सावंत (विभागीय अध्यक्ष)',
    phone: '०२२-२८३३-१६७४',
    desc: 'सागरी किल्ले, छत्रपती शिवरायांचे आरमार, आंतरराष्ट्रीय व्यापार आणि मराठा समाजाच्या आर्थिक सामर्थ्याचे महाद्वार.',
    districts: [
      { name: 'मुंबई शहर व उपनगर', code: 'MB', members: '६०,०००+', talukas: ['कुर्ला', 'अंधेरी', 'बोरिवली', 'दादर', 'वरळी', 'गिरगाव', 'भांडुप'] },
      { name: 'ठाणे व पालघर', code: 'TH', members: '३२,०००+', talukas: ['ठाणे', 'कल्याण', 'मुरबाड', 'भिवंडी', 'शहापूर', 'उल्हासनगर', 'अंबरनाथ', 'पालघर', 'वसई', 'डहाणू'] },
      { name: 'रायगड', code: 'RG', members: '२४,०००+', talukas: ['अलिबाग', 'पेण', 'महाड', 'माणगाव', 'रोहा', 'पनवेल', 'कर्जत', 'खालापूर', 'पोलादपूर', 'तळा', 'म्हसळा', 'श्रीवर्धन'] },
      { name: 'रत्नागिरी', code: 'RT', members: '१४,०००+', talukas: ['रत्नागिरी', 'चिपळूण', 'दापोली', 'खेड', 'गुहागर', 'संगमेश्वर', 'लांजा', 'राजापूर', 'मंडणगड'] },
      { name: 'सिंधुदुर्ग', code: 'SD', members: '१०,०००+', talukas: ['कुडाळ', 'मालवण', 'सावंतवाडी', 'कणकवली', 'देवगड', 'वेंगुर्ला', 'वैभववाडी', 'दोडामार्ग'] }
    ]
  },
  {
    id: 'sambhajinagar',
    name: 'छत्रपती संभाजीनगर विभाग (मराठवाडा)',
    hq: 'सिडको, छत्रपती संभाजीनगर',
    totalMembers: '९५,०००+',
    chapters: '३४ मंडळे',
    branches: '६५० शाखा',
    leadSecretary: 'श्री. विलास चव्हाण (विभागीय अध्यक्ष)',
    phone: '०२४०-२३३४-१६७४',
    desc: 'संतांची भूमी, मराठवाडा मुक्तीसंग्रामाचा दैदीप्यमान इतिहास आणि ५८ मराठा मूक मोर्चांची उगमभूमी.',
    districts: [
      { name: 'छत्रपती संभाजीनगर', code: 'CS', members: '२८,०००+', talukas: ['संभाजीनगर', 'पैठण', 'गंगापूर', 'वैजापूर', 'कन्नड', 'खुलताबाद', 'सिल्लोड', 'सोयगाव', 'फुलंब्री'] },
      { name: 'जालना', code: 'JL', members: '१२,०००+', talukas: ['जालना', 'भोकरदन', 'जाफ्राबाद', 'बदनापूर', 'अंबड', 'परतूर', 'मंठा', 'घनसावंगी'] },
      { name: 'बीड', code: 'BD', members: '१६,०००+', talukas: ['बीड', 'गेवराई', 'माजलगाव', 'आष्टी', 'पाटोदा', 'शिरूर कासार', 'अंबाजोगाई', 'परळी', 'केज', 'वडवणी', 'धारूर'] },
      { name: 'नांदेड', code: 'ND', members: '१४,०००+', talukas: ['नांदेड', 'लोहा', 'कंधार', 'मुखेड', 'देगलूर', 'बिलोली', 'धर्माबाद', 'उमरी', 'मुदखेड', 'भोकर', 'हदगाव', 'किनवट'] },
      { name: 'लातूर', code: 'LT', members: '१०,०००+', talukas: ['लातूर', 'औसा', 'रेणापूर', 'चाकूर', 'शिरूर अनंतपाळ', 'अहमदपूर', 'उदगीर', 'जळकोट', 'निलंगा', 'देवणी'] },
      { name: 'धाराशिव', code: 'DH', members: '८,०००+', talukas: ['धाराशिव', 'तुळजापूर', 'उमरगा', 'लोहारा', 'कळंब', 'भूम', 'परांडा', 'वाशी'] },
      { name: 'परभणी व हिंगोली', code: 'PB', members: '७,०००+', talukas: ['परभणी', 'गंगाखेड', 'जिंतूर', 'पूर्णा', 'हिंगोली', 'कळमनुरी', 'वसमत'] }
    ]
  },
  {
    id: 'nashik',
    name: 'नाशिक विभाग (उत्तर महाराष्ट्र व खान्देश)',
    hq: 'गंगापूर रोड, नाशिक',
    totalMembers: '७०,०००+',
    chapters: '२४ मंडळे',
    branches: '४८० शाखा',
    leadSecretary: 'श्री. नीलेश मोहिते (विभागीय अध्यक्ष)',
    phone: '०२५३-२५७१-१६७४',
    desc: 'गोदावरीचे उगमस्थान, कृषी क्रांती, द्राक्ष-कांदा पट्टा आणि सह्याद्रीच्या उत्तर रांगांमधील ऐतिहासिक गडकोट.',
    districts: [
      { name: 'नाशिक', code: 'NK', members: '३०,०००+', talukas: ['नाशिक', 'इगतपुरी', 'दिंडोरी', 'पेठ', 'त्र्यंबकेश्वर', 'कळवण', 'देवळा', 'सुरगाणा', 'सिन्नर', 'निफाड', 'चांदवड', 'नांदगाव', 'मालेगाव', 'सटाणा'] },
      { name: 'अहिल्यानगर (अहमदनगर)', code: 'AH', members: '२२,०००+', talukas: ['नगर', 'पारनेर', 'श्रीगोंदा', 'कर्जत', 'जामखेड', 'शेवगाव', 'पाथर्डी', 'नेवासा', 'राहाता', 'संगमनेर', 'कोपरगाव', 'श्रीरामपूर', 'राहुरी', 'अकोले'] },
      { name: 'जळगाव', code: 'JG', members: '१०,०००+', talukas: ['जळगाव', 'भुसावळ', 'एरंडोल', 'धरणगाव', 'यावल', 'रावेर', 'मुक्ताईनगर', 'बोदवड', 'चोपडा', 'पाचोरा', 'भडगाव', 'चाळीसगाव', 'पारोळा', 'अमळनेर'] },
      { name: 'धुळे व नंदुरबार', code: 'DH', members: '८,०००+', talukas: ['धुळे', 'साक्री', 'शिंदखेडा', 'शिरपूर', 'नंदुरबार', 'नवापूर', 'शहादा', 'तळोदा', 'अक्कलकुवा', 'धडगाव'] }
    ]
  },
  {
    id: 'nagpur',
    name: 'नागपूर विभाग (पूर्व विदर्भ)',
    hq: 'सिव्हिल लाईन्स, नागपूर',
    totalMembers: '२८,०००+',
    chapters: '१० मंडळे',
    branches: '२६० शाखा',
    leadSecretary: 'श्री. प्रफुल्ल भोसले (विभागीय अध्यक्ष)',
    phone: '०७१२-२५५२-१६७४',
    desc: 'रघूजीराजे भोसले यांच्या पराक्रमाचा, नागपूर मराठा गादीचा आणि मध्य भारत महाविस्ताराचा केंद्रबिंदू.',
    districts: [
      { name: 'नागपूर', code: 'NG', members: '१४,०००+', talukas: ['नागपूर शहर', 'नागपूर ग्रामीण', 'कामठी', 'हिंगणा', 'काटोल', 'नरखेड', 'सावनेर', 'कळमेश्वर', 'रामटेक', 'पारशिवनी', 'मौदा', 'उमरेड', 'कुही', 'भिवापूर'] },
      { name: 'वर्धा व चंद्रपूर', code: 'WR', members: '८,०००+', talukas: ['वर्धा', 'हिंगणघाट', 'आर्वी', 'चंद्रपूर', 'वरोरा', 'भद्रावती', 'चिमूर'] },
      { name: 'भंडारा, गोंदिया व गडचिरोली', code: 'BH', members: '६,०००+', talukas: ['भंडारा', 'तुमसर', 'गोंदिया', 'तिरोडा', 'गडचिरोली', 'चामोर्शी'] }
    ]
  },
  {
    id: 'amravati',
    name: 'अमरावती विभाग (पश्चिम विदर्भ)',
    hq: 'राजापेठ, अमरावती',
    totalMembers: '२२,०००+',
    chapters: '८ मंडळे',
    branches: '२२० शाखा',
    leadSecretary: 'श्री. गजानन देशमुख (विभागीय अध्यक्ष)',
    phone: '०७२१-२६६१-१६७४',
    desc: 'राजमाता राष्ट्रमाता जिजाऊंचे जन्मस्थान सिंदखेड राजा, कापूस-सोयाबीन पट्टा आणि मराठा-कुणबी एकजुटीची भूमी.',
    districts: [
      { name: 'बुलढाणा (सिंदखेड राजा)', code: 'BL', members: '८,५००+', talukas: ['सिंदखेड राजा', 'देऊळगाव राजा', 'चिखली', 'बुलढाणा', 'मेहकर', 'लोणार', 'खामगाव', 'शेगाव', 'मलकापूर', 'मोताळा', 'नांदुरा', 'जळगाव जामोद', 'संग्रामपूर'] },
      { name: 'अमरावती व अकोला', code: 'AM', members: '८,०००+', talukas: ['अमरावती', 'भातकुली', 'चांदूर रेल्वे', 'मोर्शी', 'वरुड', 'अचलपूर', 'अकोला', 'बाळापूर', 'बार्शीटाकळी'] },
      { name: 'यवतमाळ व वाशीम', code: 'YW', members: '५,५००+', talukas: ['यवतमाळ', 'पुसद', 'दिग्रस', 'उमरखेड', 'दारव्हा', 'वाशीम', 'रिसोड', 'कारंजा'] }
    ]
  }
];

export default function MaharashtraNetworkPage() {
  const [divisions, setDivisions] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_maharashtra_network_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_NETWORK_DIVISIONS;
  });

  const [selectedDivId, setSelectedDivId] = useState('pune');
  const [activeTab, setActiveTab] = useState('divisions'); // divisions, talukas, leadership
  const [talukaSearch, setTalukaSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editDiv, setEditDiv] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    hq: '',
    totalMembers: '',
    chapters: '',
    branches: '',
    leadSecretary: '',
    phone: '',
    desc: ''
  });

  useEffect(() => {
    try {
      localStorage.setItem('cm_maharashtra_network_data', JSON.stringify(divisions));
    } catch (e) {
      console.error(e);
    }
  }, [divisions]);

  const currentDiv = divisions.find(d => d.id === selectedDivId) || divisions[0];

  const handleOpenEdit = (div) => {
    setEditDiv(div);
    setFormData({
      name: div.name,
      hq: div.hq,
      totalMembers: div.totalMembers,
      chapters: div.chapters,
      branches: div.branches,
      leadSecretary: div.leadSecretary,
      phone: div.phone,
      desc: div.desc
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setDivisions(divisions.map(d => d.id === editDiv.id ? { ...d, ...formData } : d));
    setModalOpen(false);
  };

  const handleResetDefaults = () => {
    if (window.confirm('महाराष्ट्र नेटवर्क मूळ अधिकृत रचनेवर रीसेट करायचे आहे का?')) {
      setDivisions(DEFAULT_NETWORK_DIVISIONS);
      localStorage.setItem('cm_maharashtra_network_data', JSON.stringify(DEFAULT_NETWORK_DIVISIONS));
    }
  };

  // Compute all talukas for the Taluka Finder tab
  const allTalukas = divisions.flatMap(d =>
    d.districts.flatMap(dist =>
      dist.talukas.map(t => ({
        taluka: t,
        district: dist.name,
        division: d.name.split(' (')[0],
        divId: d.id
      }))
    )
  );

  const filteredTalukas = allTalukas.filter(item =>
    item.taluka.toLowerCase().includes(talukaSearch.toLowerCase()) ||
    item.district.toLowerCase().includes(talukaSearch.toLowerCase()) ||
    item.division.toLowerCase().includes(talukaSearch.toLowerCase())
  );

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #1A0700 0%, #3D1400 50%, #5E2000 100%)',
          borderRadius: '24px',
          padding: '44px 36px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          marginBottom: '32px',
          boxShadow: '0 20px 50px rgba(45,15,0,0.4)',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(221,138,46,0.25)', border: '1px solid #DD8A2E', padding: '5px 16px', borderRadius: '24px', marginBottom: '14px' }}>
                <span style={{ color: '#FFD700' }}>🗺️</span>
                <span style={{ color: '#FDF3E6', fontSize: '0.84rem', fontWeight: 800 }}>
                  ३६ जिल्हे • ३५८ तालुके • ३,२००+ ग्रामशाखा
                </span>
              </div>
              <h1 style={{
                fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 800,
                margin: '0 0 10px',
                color: '#FFF',
                lineHeight: 1.2
              }}>
                महाराष्ट्र राज्य नेटवर्क विस्तार (State Network)
              </h1>
              <p style={{ color: '#F1E7D8', fontSize: '1.05rem', maxWidth: '780px', margin: 0, lineHeight: 1.65 }}>
                महाराष्ट्राच्या प्रत्येक कानाकोपऱ्यात मराठा समाजाची सांस्कृतिक, व्यावसायिक आणि सामाजिक एकजूट निर्माण करणारी ५-स्तरीय संघटनात्मक चौकट.
              </p>
            </div>

            <button
              onClick={handleResetDefaults}
              style={{
                background: 'rgba(255,255,255,0.12)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer'
              }}>
              ↺ मूळ नेटवर्क रीसेट
            </button>
          </div>

          {/* 5-Level Dynamic Hierarchy Flow */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(221,138,46,0.3)'
          }}>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center', flex: 1, minWidth: '130px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFD700' }}>१</div>
              <div style={{ fontSize: '0.8rem', color: '#E6DDCE' }}>महाराष्ट्र राज्य (State)</div>
            </div>
            <div style={{ color: '#DD8A2E', fontSize: '1.4rem' }}>➔</div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center', flex: 1, minWidth: '130px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFD700' }}>६</div>
              <div style={{ fontSize: '0.8rem', color: '#E6DDCE' }}>महसूल विभाग (Divisions)</div>
            </div>
            <div style={{ color: '#DD8A2E', fontSize: '1.4rem' }}>➔</div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center', flex: 1, minWidth: '130px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFD700' }}>३६</div>
              <div style={{ fontSize: '0.8rem', color: '#E6DDCE' }}>जिल्हे (Districts)</div>
            </div>
            <div style={{ color: '#DD8A2E', fontSize: '1.4rem' }}>➔</div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center', flex: 1, minWidth: '130px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFD700' }}>३५८+</div>
              <div style={{ fontSize: '0.8rem', color: '#E6DDCE' }}>तालुके (Talukas)</div>
            </div>
            <div style={{ color: '#DD8A2E', fontSize: '1.4rem' }}>➔</div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center', flex: 1, minWidth: '130px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4ADE80' }}>३,२००+</div>
              <div style={{ fontSize: '0.8rem', color: '#E6DDCE' }}>शाखा (Branches)</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          background: '#FFF',
          borderRadius: '16px',
          padding: '14px 20px',
          border: '1px solid #E6DDCE',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          marginBottom: '28px',
          display: 'flex',
          gap: '10px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'divisions', label: '🏢 ६ महसूल विभाग व ३६ जिल्हे' },
            { id: 'talukas', label: '📍 तालुका व शाखा शोधक' },
            { id: 'leadership', label: '👥 विभागीय नेतृत्व व संपर्क' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                borderRadius: '24px',
                border: activeTab === tab.id ? '2px solid #EA580C' : '1px solid #E6DDCE',
                background: activeTab === tab.id ? '#3D0D0D' : '#FAF6F0',
                color: activeTab === tab.id ? '#FFD700' : '#5C534B',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: DIVISIONS & DISTRICTS */}
        {activeTab === 'divisions' && (
          <div>
            {/* Division Selector Pills */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '24px' }}>
              {divisions.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDivId(d.id)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '20px',
                    border: selectedDivId === d.id ? '2px solid #EA580C' : '1px solid #DDD',
                    background: selectedDivId === d.id ? '#FFF7ED' : '#FFF',
                    color: selectedDivId === d.id ? '#9A3412' : '#555',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    boxShadow: selectedDivId === d.id ? '0 2px 8px rgba(234,88,12,0.15)' : 'none'
                  }}>
                  {d.name.split(' (')[0]}
                </button>
              ))}
            </div>

            {/* Selected Division Detailed Box */}
            <div style={{
              background: '#FFFFFF',
              border: '1.5px solid #E6DDCE',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #EEE', paddingBottom: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.8rem', color: '#2A0606', margin: '0 0 6px' }}>
                    {currentDiv.name}
                  </h2>
                  <p style={{ color: '#5C534B', fontSize: '0.96rem', margin: 0, maxWidth: '700px' }}>
                    {currentDiv.desc}
                  </p>
                  <div style={{ marginTop: '10px', fontSize: '0.86rem', color: '#888' }}>
                    📍 विभागीय मुख्यालय: <strong>{currentDiv.hq}</strong> · 📞 हेल्पलाईन: <strong>{currentDiv.phone}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', background: '#FFF7ED', padding: '10px 18px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#EA580C' }}>{currentDiv.totalMembers}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>सक्रिय सदस्य</div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#F0FDF4', padding: '10px 18px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16A34A' }}>{currentDiv.branches}</div>
                    <div style={{ fontSize: '0.75rem', color: '#666' }}>स्थानिक शाखा</div>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(currentDiv)}
                    style={{
                      padding: '10px 16px',
                      background: '#FFF',
                      border: '1.5px solid #DD8A2E',
                      color: '#C9701C',
                      borderRadius: '8px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.84rem'
                    }}>
                    ✏️ विभाग संपादित करा
                  </button>
                </div>
              </div>

              {/* Districts & Talukas Cards */}
              <h3 style={{ fontSize: '1.15rem', color: '#3D0D0D', marginBottom: '16px' }}>
                या विभागातील समाविष्ट जिल्हे व तालुके:
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {currentDiv.districts.map(dist => (
                  <div
                    key={dist.code}
                    style={{
                      background: '#FAF6F0',
                      border: '1px solid #E6DDCE',
                      borderRadius: '14px',
                      padding: '20px'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>📍</span>
                        <strong style={{ fontSize: '1.1rem', color: '#2A0606' }}>{dist.name} जिल्हा</strong>
                      </div>
                      <span style={{
                        background: '#FFF',
                        color: '#EA580C',
                        border: '1px solid #FED7AA',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {dist.members}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
                      समाविष्ट {dist.talukas.length} तालुके:
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {dist.talukas.map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: '#FFF',
                            border: '1px solid #EFE4D2',
                            color: '#4A3B32',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.78rem'
                          }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TALUKA & BRANCH FINDER */}
        {activeTab === 'talukas' && (
          <div style={{ background: '#FFF', borderRadius: '20px', border: '1.5px solid #E6DDCE', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
            <div style={{ maxWidth: '600px', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.5rem', color: '#2A0606', margin: '0 0 6px' }}>
                📍 ३५८+ तालुका व शाखा शोधक (Taluka Finder)
              </h2>
              <p style={{ color: '#666', fontSize: '0.9rem', margin: '0 0 14px' }}>
                आपल्या तालुक्याचे किंवा जिल्ह्याचे नाव टाइप करा आणि स्थानिक कार्यकारिणीची माहिती मिळवा.
              </p>
              <input
                type="text"
                placeholder="तालुका किंवा जिल्हा शोधा (उदा. हवेली, कराड, महाड, बारामती)..."
                value={talukaSearch}
                onChange={(e) => setTalukaSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1.5px solid #DD8A2E',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {filteredTalukas.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#FAF6F0',
                    border: '1px solid #E6DDCE',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#3D0D0D', fontSize: '0.95rem' }}>
                      📍 {item.taluka}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#888' }}>
                      {item.district} जिल्हा · {item.division}
                    </div>
                  </div>
                  <Link
                    to="/directory"
                    style={{
                      background: '#FFF',
                      border: '1px solid #DD8A2E',
                      color: '#C9701C',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}>
                    शाखा →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: LEADERSHIP & CONTACT */}
        {activeTab === 'leadership' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
            {divisions.map(d => (
              <div
                key={d.id}
                style={{
                  background: '#FFF',
                  borderRadius: '18px',
                  border: '1.5px solid #E6DDCE',
                  padding: '24px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                <div>
                  <span style={{
                    background: '#FFF7ED',
                    color: '#EA580C',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {d.name.split(' (')[0]}
                  </span>

                  <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', color: '#2A0606', margin: '8px 0 4px' }}>
                    {d.leadSecretary}
                  </h3>
                  <div style={{ fontSize: '0.84rem', color: '#888', marginBottom: '14px' }}>
                    📍 {d.hq}
                  </div>

                  <div style={{ background: '#FAF6F0', borderRadius: '10px', padding: '12px', border: '1px solid #E6DDCE', fontSize: '0.86rem', color: '#3D0D0D', lineHeight: 1.6, marginBottom: '16px' }}>
                    📞 हेल्पलाईन: <strong>{d.phone}</strong><br />
                    👥 सदस्य संख्या: <strong>{d.totalMembers}</strong><br />
                    🏢 कार्यरत मंडळे: <strong>{d.chapters}</strong> ({d.branches})
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleOpenEdit(d)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#FFF',
                      border: '1.5px solid #DD8A2E',
                      color: '#C9701C',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}>
                    ✏️ माहिती संपादित करा
                  </button>
                  <Link
                    to="/contact"
                    style={{
                      padding: '8px 16px',
                      background: '#3D0D0D',
                      color: '#FFF',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      textDecoration: 'none',
                      textAlign: 'center'
                    }}>
                    संपर्क →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Edit Division Details */}
        {modalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              background: '#FFF',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '2px solid #DD8A2E',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #1A0700 0%, #3D1400 100%)',
                color: '#FFF',
                padding: '18px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', margin: 0 }}>
                  ✏️ विभागीय नेटवर्क माहिती संपादित करा
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.4rem', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    विभागाचे नाव *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      मुख्यालय
                    </label>
                    <input
                      type="text"
                      value={formData.hq}
                      onChange={(e) => setFormData({ ...formData, hq: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      विभागीय अध्यक्ष / सचिव
                    </label>
                    <input
                      type="text"
                      value={formData.leadSecretary}
                      onChange={(e) => setFormData({ ...formData, leadSecretary: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      सदस्य संख्या
                    </label>
                    <input
                      type="text"
                      value={formData.totalMembers}
                      onChange={(e) => setFormData({ ...formData, totalMembers: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      मंडळे
                    </label>
                    <input
                      type="text"
                      value={formData.chapters}
                      onChange={(e) => setFormData({ ...formData, chapters: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      शाखा
                    </label>
                    <input
                      type="text"
                      value={formData.branches}
                      onChange={(e) => setFormData({ ...formData, branches: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    हेल्पलाईन फोन नंबर
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    विभागाचे वर्णन
                  </label>
                  <textarea
                    rows="3"
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{ padding: '9px 16px', background: '#FAF6F0', border: '1px solid #E6DDCE', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 22px', background: '#EA580C', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>
                    बदल जतन करा ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
