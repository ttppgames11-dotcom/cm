import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Comprehensive Ashta Pradhan Council Data with primary source attributes
const ASHTAPRADHAN_DATA = [
  {
    id: 'peshwa',
    postMr: 'पंतप्रधान (पेशवे)',
    postEn: 'Prime Minister (Peshwa)',
    persianTitle: 'पेशवा (Peshwa)',
    sanskritTitle: 'मुख्य प्रधान (Mukhya Pradhan)',
    name: 'मोरोपंत त्र्यंबक पिंगळे',
    period: '१६७४ - १६८३',
    salaryHon: '१५,००० होन वार्षिक',
    motto: 'मर्यादेयं विराजते',
    color: '#9E2A2B',
    category: 'admin',
    icon: '👑',
    duties: 'समग्र राज्यकारभाराचे संचलन, छत्रपतींच्या अनुपस्थितीत राज्याचे रक्षण, युद्ध मोहीम नेतृत्व व सर्व प्रशासकीय विभागांवर देखरेख.',
    powers: [
      'छत्रपतींच्या आज्ञेने सर्व सनदा व हुकूम जारी करणे',
      'सैन्य मोहिमांचे थेट सेनापतीपद सांभाळणे (उदा. साल्हेरची लढाई)',
      'इतर सर्व प्रधानांच्या कामकाजात समन्वय राखणे'
    ],
    subordinates: ['दिवाण', 'मुजुमदार', 'फडणीस', 'सबनीस', 'कारखानीस', 'चिटणीस', 'जमादार', 'पोतनीस'],
    source: 'सभासद बखर (पृ. ७२), जेधे शकावली'
  },
  {
    id: 'amatya',
    postMr: 'पंत अमात्य (मुजुमदार)',
    postEn: 'Finance Minister (Amatya)',
    persianTitle: 'मुजुमदार (Majumdar)',
    sanskritTitle: 'अमात्य (Amatya)',
    name: 'रामचंद्र नीलकंठ मुजुमदार (अमात्य)',
    period: '१६७४ - १७१६',
    salaryHon: '१२,००० होन वार्षिक',
    motto: 'हिशोब शुद्ध तो राज्य दृढ',
    color: '#D47A1E',
    category: 'admin',
    icon: '💰',
    duties: 'राज्याचा समग्र जमाखर्च, महाल व परगण्यांचे हिशेब तपासणी, वार्षिक अर्थसंकल्प, खजिना नियंत्रण व महसूल संकलन व्यवस्था.',
    powers: [
      'सर्व सरकारी जमाखर्चावर स्वाक्षरी व मंजुरी देणे',
      'राज्यातील सर्व किल्ल्यांच्या व वतनांच्या दप्तरांचे ऑडिट करणे',
      'सुप्रसिद्ध \'आज्ञापत्र\' ग्रंथाचे कर्ते ज्यांनी मराठा राजनीतीचे तत्त्वज्ञान मांडले'
    ],
    subordinates: ['फडणीस', 'पोतनीस', 'हिशेब तपासणीस', 'दफ्तरदार'],
    source: 'आज्ञापत्र (१७१६), शिवचरित्र साहित्य'
  },
  {
    id: 'sachiv',
    postMr: 'पंत सचिव (सुरनीस)',
    postEn: 'Royal Secretary & Imperial Edicts',
    persianTitle: 'सुरनीस (Surnis)',
    sanskritTitle: 'सचिव (Sachiv)',
    name: 'अण्णाजी दत्तो',
    period: '१६७४ - १६८१',
    salaryHon: '१०,००० होन वार्षिक',
    motto: 'अक्षरं प्रमाणम् (लेखाचे प्रमाण)',
    color: '#588157',
    category: 'admin',
    icon: '📜',
    duties: 'शासकीय आज्ञापत्रे, सनदा व फर्मानांची भाषा तपासणे, दस्तऐवजांची सत्यता पडताळणे व ऐतिहासिक जमीन मोजणी (शिवशाही काठी पद्धत) राबवणे.',
    powers: [
      'राजमुद्रेखालील पत्रांवर \'स्वीकार\' किंवा \'संमत\' असा शेरा देणे',
      'शिवशाही काठीने संपूर्ण स्वराज्यातील शेतजमिनीची मोजणी करून महसूल निश्चित करणे',
      'किल्ल्यांच्या रसदीचे व दस्तऐवजांचे दप्तर सांभाळणे'
    ],
    subordinates: ['चिटणीस', 'लेखक', 'दप्तरदार', 'पारसनिस'],
    source: 'अण्णाजी दत्तो महसूल दस्तऐवज (१६७८), सरदेसाई रियासत'
  },
  {
    id: 'mantri',
    postMr: 'मंत्री (वाकनीस)',
    postEn: 'Home Minister & Chronicler',
    persianTitle: 'वाकियानवीस (Waqianavis)',
    sanskritTitle: 'मंत्री (Mantri)',
    name: 'दत्ताजी त्रिंबक वाकनीस',
    period: '१६७४ - १६८०',
    salaryHon: '१०,००० होन वार्षिक',
    motto: 'सतर्कता हाच स्वराज्याचा डोळा',
    color: '#3A5A40',
    category: 'intel',
    icon: '🕵️',
    duties: 'छत्रपतींची दैनंदिन दिनचर्या, खाजगी व्यवहार, राजदरबारातील घडामोडींची नोंद आणि अंतर्गत सुरक्षा व गुप्तहेर यंत्रणेवर बारीक नजर ठेवणे.',
    powers: [
      'महाराजांच्या जेवणाची व वैयक्तिक सुरक्षेची प्रत्यक्ष तपासणी',
      'राजदरबारातील दैनंदिनी (रोखवही) लिहिणे व जतन करणे',
      'बहिर्जी नाईक व गुप्तहेर खात्याच्या गोपनीय खबरांची प्रथम छाननी'
    ],
    subordinates: ['गुप्त बातमीदार', 'दिनचर्या लेखक', 'चौकीदार प्रमुख'],
    source: 'शिवकालीन रोजनिशी, सभासद बखर'
  },
  {
    id: 'senapati',
    postMr: 'सरसेनापती (सरनोबत)',
    postEn: 'Commander-in-Chief (Senapati)',
    persianTitle: 'सरनोबत (Sarnobat)',
    sanskritTitle: 'सेनापती (Senapati)',
    name: 'हंसाजी (हंबीरराव) मोहिते',
    period: '१६७४ - १६८७',
    salaryHon: '१०,००० होन + सैन्य व्यवस्थापन खर्च',
    motto: 'शस्त्रेण रक्षिते राष्ट्रे',
    color: '#B7094C',
    category: 'military',
    icon: '⚔️',
    duties: 'घोडदळ (बारगीर व शिलेदार) आणि पायदळ (मावळे) यांचे सर्वोच्च नेतृत्व, सैन्य भरती, छावण्यांची शिस्त, युद्ध व्यूहरचना व शस्त्रसामग्री व्यवस्थापन.',
    powers: [
      'स्वराज्याच्या लष्करामधील सर्वोच्च लष्करी सेनापतीपद',
      'मोहिमेदरम्यान सैन्याची कडक शिस्त राखणे (पिकांचे नुकसान करणाऱ्यास तात्काळ दंड)',
      'लुटीच्या मालाचा एक-एक पैचा हिशोब खजिन्यात जमा करून घेणे'
    ],
    subordinates: ['पंचहजारी', 'हजारी', 'जुमलेदार', 'हवालदार', 'नाईक'],
    source: 'जेधे शकावली, शिवभारत, समरभूमी नोंदी'
  },
  {
    id: 'sumant',
    postMr: 'सुमंत (डबीर)',
    postEn: 'Foreign Minister (Sumant)',
    persianTitle: 'डबीर (Dabir)',
    sanskritTitle: 'सुमंत (Sumant)',
    name: 'रामचंद्र त्रिंबक डबीर',
    period: '१६७४ - १६८०',
    salaryHon: '१०,००० होन वार्षिक',
    motto: 'नयविवेकेन संधानम्',
    color: '#005F73',
    category: 'foreign',
    icon: '🌍',
    duties: 'परराष्ट्र संबंध, विजापूर, दिल्ली, गोव्याचे पोर्तुगीज, इंग्रज व डच सत्तांशी मुत्सद्दीपणाचा पत्रव्यवहार आणि परकीय वकिलांचे आदरातिथ्य.',
    powers: [
      'परकीय दूतांशी प्रथम चर्चा करणे व छत्रपतींना अहवाल सादर करणे',
      'तह, करार व राजकीय वाटाघाटींचे प्रारूप तयार करणे',
      'परकीय सत्तांमधील अंतर्गत घडामोडींची बातमी मिळवणे'
    ],
    subordinates: ['पारसनिस (फारसी लेखक)', 'इंग्रजी व पोर्तुगीज दुभाषी', 'दूत'],
    source: 'इंग्रज फॅक्टरी रेकॉर्ड्स, शिवचरित्र निबंधावली'
  },
  {
    id: 'nyayadhish',
    postMr: 'न्यायाधीश (धर्मशास्त्री)',
    postEn: 'Chief Justice (Nyayadhish)',
    persianTitle: 'काझी/अदालत प्रमुख',
    sanskritTitle: 'न्यायाधीश (Nyayadhish)',
    name: 'निराजी रावजी',
    period: '१६७४ - १६८०',
    salaryHon: '१०,००० होन वार्षिक',
    motto: 'यतो धर्मस्ततो जयः (न्याय पक्षपातरहित असावा)',
    color: '#6B2D5C',
    category: 'justice',
    icon: '⚖️',
    duties: 'राज्यातील सर्वोच्च न्यायदान, दिवाणी व फौजदारी खटल्यांची निष्पक्ष सुनावणी, गोतसभा व स्थानिक पंचायतींच्या निर्णयांवर अंतिम अपिलांची सुनावणी.',
    powers: [
      'स्वराज्यात जात, धर्म किंवा नातेसंबंध न पाहता सर्वांना समान कायद्याची अंमलबजावणी',
      'गुन्हेगारांना शारीरिक शिक्षा, दंड किंवा चौरंग करण्याचे आदेश देणे (उदा. रांझ्याचा पाटील खटला)',
      '\'महजर\' व न्यायनिवाड्याचे अंतिम सनदपत्र जारी करणे'
    ],
    subordinates: ['मजालसी प्रमुख', 'धर्माधिकारी', 'अदालत लेखक'],
    source: 'शिवकालीन न्यायव्यवस्था (डॉ. बाळकृष्ण), वि. का. राजवाडे खंड'
  },
  {
    id: 'panditrao',
    postMr: 'पंडितराव (दानाध्यक्ष)',
    postEn: 'Ecclesiastical Affairs & Public Charities',
    persianTitle: 'सद्र (Sadr)',
    sanskritTitle: 'पंडितराव / दानाध्यक्ष',
    name: 'रघुनाथराव पंडितराव',
    period: '१६७४ - १६८०',
    salaryHon: '१०,००० होन वार्षिक',
    motto: 'विद्वत्पूजको धर्मसंरक्षकः',
    color: '#8338EC',
    category: 'justice',
    icon: '📿',
    duties: 'धर्मव्यवस्था, सार्वजनिक दानधर्म, वेदशास्त्रसंपन्न विद्वानांचे सत्कार, धार्मिक आचार-विचारांचे नियमन व दुर्बल घटकांसाठी अन्नसत्रे चालवणे.',
    powers: [
      'विद्वान पंडितांची परीक्षा घेऊन त्यांना वार्षिक वार्षिकी (दक्षिणा) मंजूर करणे',
      'धार्मिक वाद व प्रायश्चित्तांचे शास्त्रसंमत निवाडे करणे',
      'राज्याभिषेक, उत्सव व सार्वजनिक सांस्कृतिक सोहळ्यांचे नियोजन'
    ],
    subordinates: ['उपाध्ये', 'ज्योतिषी', 'धर्माधिकारी'],
    source: 'शिवराज्याभिषेक कल्पतरू, सभासद बखर'
  }
];

export default function SwarajyaAdminPage() {
  const [activeTab, setActiveTab] = useState('ashtapradhan');
  const [selectedPradhan, setSelectedPradhan] = useState(ASHTAPRADHAN_DATA[0]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Land Revenue Calculator States
  const [landBigha, setLandBigha] = useState(5);
  const [cropYieldQuintal, setCropYieldQuintal] = useState(60);
  const [isDrought, setIsDrought] = useState(false);

  // Calculations: 60% Farmers, 40% State Revenue
  const farmerShare = isDrought ? cropYieldQuintal : (cropYieldQuintal * 0.6).toFixed(1);
  const sarkarShare = isDrought ? 0 : (cropYieldQuintal * 0.4).toFixed(1);
  const tagaiAmount = isDrought ? landBigha * 500 : 0;

  const filteredPradhans = categoryFilter === 'all'
    ? ASHTAPRADHAN_DATA
    : ASHTAPRADHAN_DATA.filter(p => p.category === categoryFilter);

  return (
    <div style={{ background: '#FDFBF7', minHeight: '100vh', padding: '30px 16px 80px', color: '#2B2118' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Breadcrumb Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: '#7D6E63', marginBottom: '20px' }}>
          <Link to="/" style={{ color: '#8F2800', textDecoration: 'none', fontWeight: 600 }}>होम</Link>
          <span>›</span>
          <Link to="/history/maratha-navy" style={{ color: '#8F2800', textDecoration: 'none', fontWeight: 600 }}>इतिहास</Link>
          <span>›</span>
          <span style={{ fontWeight: 700, color: '#2B2118' }}>स्वराज्य आणि प्रशासन</span>
        </div>

        {/* Grand Hero Section */}
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #2D0808 0%, #4A0E0E 40%, #7A1C1C 100%)',
          color: '#FFF',
          padding: '48px 36px',
          marginBottom: '32px',
          border: '2px solid rgba(221,138,46,0.3)',
          boxShadow: '0 20px 50px rgba(45,8,8,0.25)'
        }}>
          {/* Subtle Background Watermark Shield */}
          <div style={{
            position: 'absolute',
            right: '-20px',
            bottom: '-30px',
            fontSize: '240px',
            opacity: 0.06,
            userSelect: 'none',
            pointerEvents: 'none'
          }}>
            ⚖️
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(221,138,46,0.2)', border: '1px solid #DD8A2E', padding: '6px 16px', borderRadius: '30px', fontSize: '0.82rem', fontWeight: 800, color: '#F7C978', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '16px' }}>
            <span>🚩</span> फक्त युद्ध नव्हे — लोककल्याणकारी राज्यव्यवस्था
          </div>

          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(2.1rem, 4.5vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            margin: '0 0 16px',
            color: '#FFFFFF'
          }}>
            शिवकालीन स्वराज्य प्रशासन व अष्टप्रधान मंडळ
          </h1>

          <p style={{
            fontSize: '1.05rem',
            lineHeight: 1.7,
            maxWidth: '820px',
            color: '#E8DED1',
            margin: '0 0 28px'
          }}>
            तलवारीने जिंकलेले राज्य टिकते ते पारदर्शक व न्याय्य व्यवस्थेने. छत्रपती शिवाजी महाराजांनी एकाच वेळी महसूल मोजणी, त्रिस्तरीय गडकोट संरक्षण, स्वतंत्र न्यायदान, कडक पर्यावरण रक्षण आणि गुणवत्तेवर आधारित मंत्रिमंडळ निर्माण करून आधुनिक कल्याणकारी राज्याचा पाया घातला.
          </p>

          {/* Quick Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            padding: '16px 20px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#E0C8B1', textTransform: 'uppercase' }}>मंत्रिमंडळ स्वरूप</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F7C978' }}>अष्टप्रधान पद्धत (८ खाती)</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#E0C8B1', textTransform: 'uppercase' }}>वेतन पद्धती</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>१००% थेट रोख (No Jahagir)</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#E0C8B1', textTransform: 'uppercase' }}>जमीन मोजणी प्रमाण</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F7C978' }}>शिवशाही काठी (८० तसू)</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#E0C8B1', textTransform: 'uppercase' }}>गड नियंत्रण तत्त्व</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>त्रिस्तरीय परस्पर तपासणी</div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '28px',
          borderBottom: '2px solid #EADBCC'
        }}>
          {[
            { id: 'ashtapradhan', label: '👑 अष्टप्रधान मंडळ (मंत्रिमंडळ)' },
            { id: 'revenue', label: '🌾 महसूल व काठी मोजणी गणक' },
            { id: 'forts_triad', label: '🏰 किल्ले प्रशासनाची त्रिमूर्ती' },
            { id: 'adnyapatra', label: '📜 आज्ञापत्र व पर्यावरण नीती' },
            { id: 'currency_intel', label: '🪙 नाणी, गुप्तहेर व न्यायव्यवस्था' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                borderRadius: '12px 12px 0 0',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Baloo 2', sans-serif",
                fontSize: '0.98rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                background: activeTab === tab.id ? '#8F2800' : '#EFE7DA',
                color: activeTab === tab.id ? '#FFF' : '#5E4C3E'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ASHTAPRADHAN COUNCIL */}
        {activeTab === 'ashtapradhan' && (
          <div>
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[
                { id: 'all', label: 'सर्व ८ मंत्री' },
                { id: 'admin', label: '🏛️ प्रशासन व महसूल' },
                { id: 'military', label: '⚔️ सेनापती' },
                { id: 'intel', label: '🕵️ गुप्तहेर व दिनचर्या' },
                { id: 'foreign', label: '🌍 परराष्ट्र संबंध' },
                { id: 'justice', label: '⚖️ न्याय व धर्म' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: '1px solid #D8C7B5',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: categoryFilter === f.id ? '#3D0D0D' : '#FFF',
                    color: categoryFilter === f.id ? '#F7C978' : '#5C4E43'
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Split Screen Layout: Ministers List + Detailed Minister Inspector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', alignItems: 'start' }}>
              
              {/* Left Column: Ministers Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filteredPradhans.map(p => {
                  const isSelected = selectedPradhan.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPradhan(p)}
                      style={{
                        background: isSelected ? '#FFF8F0' : '#FFFFFF',
                        border: isSelected ? '2px solid #8F2800' : '1px solid #E6D8C8',
                        borderRadius: '16px',
                        padding: '18px 20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 8px 24px rgba(143,40,0,0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: isSelected ? '#8F2800' : '#F5EBE0',
                        color: isSelected ? '#FFF' : '#8F2800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0
                      }}>
                        {p.icon}
                      </div>

                      <div style={{ flexGrow: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <h3 style={{
                            fontFamily: "'Baloo 2', sans-serif",
                            fontSize: '1.15rem',
                            fontWeight: 800,
                            margin: 0,
                            color: isSelected ? '#8F2800' : '#2D1B13'
                          }}>
                            {p.postMr}
                          </h3>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#A06828', background: '#FBF2E6', padding: '2px 8px', borderRadius: '12px' }}>
                            {p.salaryHon}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.86rem', color: '#5C4E43', fontWeight: 600 }}>
                          प्रथम पदसिद्ध अधिकारी: <strong>{p.name}</strong>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#8C7C71', marginTop: '4px' }}>
                          संस्कृत संज्ञा: <em>{p.sanskritTitle}</em> · फारसी: <em>{p.persianTitle}</em>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Detailed Minister Inspector Dossier */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                border: '2px solid #8F2800',
                padding: '28px',
                boxShadow: '0 12px 32px rgba(143,40,0,0.08)',
                position: 'sticky',
                top: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px dashed #EEDDCF', paddingBottom: '16px', marginBottom: '18px' }}>
                  <div>
                    <span style={{ background: '#8F2800', color: '#FFF', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
                      अधिकृत शासकीय सनद
                    </span>
                    <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.6rem', fontWeight: 800, color: '#2D0808', margin: '8px 0 2px' }}>
                      {selectedPradhan.postMr}
                    </h2>
                    <div style={{ fontSize: '0.9rem', color: '#A06828', fontWeight: 700 }}>
                      {selectedPradhan.postEn}
                    </div>
                  </div>
                  <div style={{ fontSize: '40px' }}>
                    {selectedPradhan.icon}
                  </div>
                </div>

                {/* Primary Holder Info */}
                <div style={{ background: '#FBF5EE', borderRadius: '12px', padding: '14px 16px', marginBottom: '18px', borderLeft: '4px solid #8F2800' }}>
                  <div style={{ fontSize: '0.8rem', color: '#7D6A5D', textTransform: 'uppercase', fontWeight: 700 }}>१६७४ शिवराज्याभिषेक कालीन नियुक्ती</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#3D0D0D', marginTop: '2px' }}>
                    {selectedPradhan.name}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.82rem', color: '#5C4E43' }}>
                    <span>📅 कार्यकाळ: <strong>{selectedPradhan.period}</strong></span>
                    <span>🪙 मानधन: <strong>{selectedPradhan.salaryHon}</strong></span>
                  </div>
                </div>

                {/* Duty Summary */}
                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1rem', color: '#8F2800', margin: '0 0 6px' }}>
                    📜 मूलभूत कार्यभार व कर्तव्ये:
                  </h4>
                  <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: '#3C2E25', margin: 0 }}>
                    {selectedPradhan.duties}
                  </p>
                </div>

                {/* Powers & Key Decisions */}
                <div style={{ marginBottom: '18px' }}>
                  <h4 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1rem', color: '#8F2800', margin: '0 0 8px' }}>
                    ⚖️ विशेष अधिकार व स्वाक्षरीचे अधिकार:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.88rem', color: '#4A3B31', lineHeight: 1.6 }}>
                    {selectedPradhan.powers.map((pwr, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{pwr}</li>
                    ))}
                  </ul>
                </div>

                {/* Karbhari Ashtak (Subordinate Officers) */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1rem', color: '#8F2800', margin: '0 0 8px' }}>
                    👥 कारभारी अष्टक (खात्यातील ८ साहाय्यक अधिकारी):
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedPradhan.subordinates.map((sub, idx) => (
                      <span key={idx} style={{ background: '#F1E8DC', color: '#4E3E33', fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: '8px' }}>
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Source Citation Badge */}
                <div style={{ background: '#F4EFEB', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', color: '#6A584C', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📖</span>
                  <span><strong>ऐतिहासिक संदर्भ:</strong> {selectedPradhan.source}</span>
                </div>
              </div>

            </div>

            {/* Crucial Constitutional Rule of Swarajya */}
            <div style={{
              background: '#FFF4E5',
              border: '2px solid #D47A1E',
              borderRadius: '16px',
              padding: '24px 28px',
              marginTop: '32px',
              display: 'flex',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '42px', flexShrink: 0 }}>🛡️</div>
              <div>
                <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#7D3B00', margin: '0 0 6px' }}>
                  शिवकालीन अष्टप्रधान मंडळाचा मूलभूत नियम: कोणतीही जहागीर वा वतनदारी नाही!
                </h3>
                <p style={{ fontSize: '0.92rem', color: '#543615', lineHeight: 1.6, margin: 0 }}>
                  शिवरायांनी अष्टप्रधानांना गावे वा वतने जहागीर म्हणून दिली नाहीत, कारण वतनदार स्वतःचे सैन्य बाळगून राज्याविरुद्ध बंड करू शकतात. त्याऐवजी सर्वांना <strong>थेट राजकोषातून रोकड वेतन</strong> दिले जाई. प्रधानाचे पद वंशपरंपरागत नव्हते; केवळ गुणवत्तेवर छत्रपती त्यांची नेमणूक किंवा हकालपट्टी करू शकत होते.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REVENUE & LAND MEASUREMENT CALCULATOR */}
        {activeTab === 'revenue' && (
          <div>
            <div style={{ background: '#FFF', borderRadius: '20px', border: '1px solid #E6D8C8', padding: '32px', marginBottom: '32px', boxShadow: '0 6px 24px rgba(0,0,0,0.04)' }}>
              
              <div style={{ maxWidth: '800px', marginBottom: '28px' }}>
                <span style={{ background: '#EAF3DE', color: '#275216', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  🌾 अण्णाजी दत्तो यांची महसूल सुधारणा (१६७८)
                </span>
                <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#204010', margin: '10px 0 8px' }}>
                  शिवशाही काठी व बिघा मोजणी पद्धत
                </h2>
                <p style={{ color: '#574A3E', fontSize: '0.96rem', lineHeight: 1.65 }}>
                  मोगल व आदिलशाहीत शेतजमिनीचा अंदाज न घेता वतनदार मनमानी कर (६०-७०%) आणि सक्तीची वेठबिगारी लादत. शिवरायांचे सचिव <strong>अण्णाजी दत्तो</strong> यांनी प्रत्यक्ष शेतात जाऊन <strong>\'शिवशाही काठी\'</strong>ने अचूक मोजणी केली आणि पिकाच्या वास्तविक उत्पन्नावर सारा ठरवला.
                </p>
              </div>

              {/* Units Conversion Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: '#F8FBF5', border: '1px solid #C8DEC0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#416333', fontWeight: 700 }}>१ शिवशाही काठी</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B3B0F' }}>५ हात ५ मुठी</div>
                  <div style={{ fontSize: '0.78rem', color: '#687B60', marginTop: '4px' }}>अंदाजे ८० तसू (८२ ते ८४ इंच लांबी)</div>
                </div>

                <div style={{ background: '#F8FBF5', border: '1px solid #C8DEC0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#416333', fontWeight: 700 }}>१ बिघा क्षेत्रफळ</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B3B0F' }}>४०० चौरस काठ्या</div>
                  <div style={{ fontSize: '0.78rem', color: '#687B60', marginTop: '4px' }}>२० काठ्या लांब × २० काठ्या रुंद</div>
                </div>

                <div style={{ background: '#F8FBF5', border: '1px solid #C8DEC0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#416333', fontWeight: 700 }}>१ चावर (मोठे क्षेत्र)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B3B0F' }}>१२० बिघे</div>
                  <div style={{ fontSize: '0.78rem', color: '#687B60', marginTop: '4px' }}>गाव शिवाराचे मोठे प्रमाण</div>
                </div>

                <div style={{ background: '#FDF5EC', border: '1px solid #ECC89F', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#884D13', fontWeight: 700 }}>हक्काची वाटणी</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8F2800' }}>६०% रयत : ४०% सरकार</div>
                  <div style={{ fontSize: '0.78rem', color: '#87694E', marginTop: '4px' }}>३/५ वाटा शेतकऱ्याला, २/५ सरकारला</div>
                </div>
              </div>

              {/* Interactive Land Revenue Simulator */}
              <div style={{
                background: 'linear-gradient(135deg, #1C3311 0%, #2A4C1B 100%)',
                borderRadius: '20px',
                padding: '30px',
                color: '#FFF',
                border: '1px solid #486E32'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                  <div>
                    <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px', color: '#F7C978' }}>
                      🧮 शिवशाही महसूल व रयत वाटा गणक (Simulator)
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#D4E8C8' }}>
                      आपली शेती व उत्पन्न निवडून शिवशाहीतील महसूल आणि दुष्काळ सवलतींचे प्रत्यक्ष गणित पाहा.
                    </p>
                  </div>
                  
                  {/* Drought Toggle Button */}
                  <button
                    onClick={() => setIsDrought(!isDrought)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '20px',
                      border: isDrought ? '2px solid #FF8484' : '1px solid #84B56C',
                      background: isDrought ? '#8A1515' : 'rgba(255,255,255,0.1)',
                      color: isDrought ? '#FFF' : '#EAF7E2',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    {isDrought ? '⚠️ दुष्काळ जाहीर (करमाफी सक्रिय)' : '☀️ सर्वसाधारण हंगाम'}
                  </button>
                </div>

                {/* Input Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '28px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#D4E8C8', marginBottom: '8px' }}>
                      शेतजमीन आकार: <strong>{landBigha} बिघा</strong> ({landBigha * 400} चौरस काठ्या)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={landBigha}
                      onChange={(e) => setLandBigha(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#F7C978', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9BB88B', marginTop: '4px' }}>
                      <span>१ बिघा</span>
                      <span>१५ बिघे</span>
                      <span>३० बिघे</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', color: '#D4E8C8', marginBottom: '8px' }}>
                      एकूण शेतपीक धान्य: <strong>{cropYieldQuintal} क्विंटल</strong> (अंदाजे {Math.round(cropYieldQuintal / 3)} खंडी)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="5"
                      value={cropYieldQuintal}
                      onChange={(e) => setCropYieldQuintal(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#F7C978', cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9BB88B', marginTop: '4px' }}>
                      <span>१० क्विंटल</span>
                      <span>१५० क्विंटल</span>
                      <span>३०० क्विंटल</span>
                    </div>
                  </div>
                </div>

                {/* Results Visualizer Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  
                  {/* Farmer Share */}
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <div style={{ fontSize: '0.8rem', color: '#F7C978', textTransform: 'uppercase', fontWeight: 700 }}>
                      🌾 रयतेचा हक्काचा वाटा ({isDrought ? '१००%' : '६०%'})
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFF', margin: '4px 0' }}>
                      {farmerShare} <span style={{ fontSize: '1rem', fontWeight: 600 }}>क्विंटल</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#C8DEC0', margin: 0 }}>
                      शेतकऱ्याला घरखर्च, पुढील बियाणे व बाजारात विक्रीसाठी पूर्ण स्वातंत्र्य.
                    </p>
                  </div>

                  {/* Sarkar Revenue */}
                  <div style={{ background: isDrought ? 'rgba(138,21,21,0.3)' : 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', border: isDrought ? '1px solid #FF8484' : '1px solid rgba(255,255,255,0.15)' }}>
                    <div style={{ fontSize: '0.8rem', color: isDrought ? '#FFB2B2' : '#F7C978', textTransform: 'uppercase', fontWeight: 700 }}>
                      🏛️ सरकारी महसूल ({isDrought ? '०% माफी' : '४०% सारा'})
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: isDrought ? '#FF8484' : '#FFF', margin: '4px 0' }}>
                      {sarkarShare} <span style={{ fontSize: '1rem', fontWeight: 600 }}>क्विंटल</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: isDrought ? '#FFD4D4' : '#C8DEC0', margin: 0 }}>
                      {isDrought ? 'दुष्काळामुळे सारा पूर्णपणे माफ करण्यात आला आहे.' : 'किल्ले, सैन्य रसद व जनकल्याण कामांसाठी वापर.'}
                    </p>
                  </div>

                  {/* Tagai Famine Support */}
                  <div style={{ background: 'rgba(247,201,120,0.12)', borderRadius: '16px', padding: '20px', border: '1px solid #F7C978' }}>
                    <div style={{ fontSize: '0.8rem', color: '#F7C978', textTransform: 'uppercase', fontWeight: 700 }}>
                      🪙 तगाई कर्ज व मदत
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#F7C978', margin: '4px 0' }}>
                      {isDrought ? `₹${tagaiAmount}` : 'लागू नाही'}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#EEDBCE', margin: 0 }}>
                      {isDrought
                        ? 'दुष्काळात बैलजोडी व बियाण्यांसाठी बिनव्याजी सरकारी तगाई कर्ज, जे पीक आल्यावर हप्त्यांनी फेडायचे.'
                        : 'अतिवृष्टी किंवा दुष्काळात सरकारकडून मोफत बी-बियाणे व बैल खरेदीसाठी मदत.'}
                    </p>
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 3: FORTS ADMINISTRATION TRIAD */}
        {activeTab === 'forts_triad' && (
          <div>
            <div style={{ background: '#FFF', borderRadius: '20px', border: '1px solid #E6D8C8', padding: '32px', marginBottom: '32px', boxShadow: '0 6px 24px rgba(0,0,0,0.04)' }}>
              
              <div style={{ maxWidth: '820px', marginBottom: '32px' }}>
                <span style={{ background: '#FBE9E7', color: '#B71C1C', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  🏰 रामचंद्रपंत अमात्य आज्ञापत्र सूत्र
                </span>
                <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#3D0D0D', margin: '10px 0 8px' }}>
                  किल्ले प्रशासनाची त्रिस्तरीय नियंत्रण व्यवस्था (Checks & Balances)
                </h2>
                <p style={{ color: '#574A3E', fontSize: '0.96rem', lineHeight: 1.65 }}>
                  "किल्ले हेच राज्याचे मूळ, किल्ले हेच राज्याचे वैभव, किल्ले हेच राज्याचे सैन्य." कोणत्याही एका अधिकाऱ्याने फितूर होऊन गड शत्रूच्या हवाली करू नये म्हणून शिवरायांनी <strong>प्रत्येक किल्ल्यावर तीन वेगवेगळ्या जातींतील व कौशल्यांतील स्वतंत्र अधिकाऱ्यांची त्रिस्तरीय नियुक्ती</strong> केली.
                </p>
              </div>

              {/* The 3 Fort Guardians Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                
                {/* 1. Havaldar */}
                <div style={{ background: '#FFF9F5', borderRadius: '18px', border: '2px solid #8F2800', padding: '24px', boxShadow: '0 6px 18px rgba(143,40,0,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '32px', width: '56px', height: '56px', borderRadius: '14px', background: '#8F2800', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      🗡️
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#8F2800', margin: 0 }}>
                        हवालदार (किल्लेदार)
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: '#7D4524', fontWeight: 700 }}>
                        पद: मराठा समाजातील शूर सरदार
                      </div>
                    </div>
                  </div>
                  <ul style={{ fontSize: '0.88rem', color: '#4E3C30', lineHeight: 1.65, paddingLeft: '18px', margin: 0 }}>
                    <li>गडाचा सर्वोच्च लष्करी अधिकारी व मुख्य रक्षक</li>
                    <li>किल्ल्याच्या सर्व दरवाजांच्या <strong>चाव्यांचा प्रत्यक्ष ताबा</strong> हवालदाराकडे असे</li>
                    <li>संध्याकाळी तोफेच्या आवाजानंतर दरवाजा बंद करणे व सकाळी उघडणे</li>
                    <li>शत्रूशी युद्धप्रसंगी गडावरील सैन्याचे प्रत्यक्ष सेनापतीपद</li>
                  </ul>
                </div>

                {/* 2. Sabnis */}
                <div style={{ background: '#F8F9FA', borderRadius: '18px', border: '2px solid #1E517B', padding: '24px', boxShadow: '0 6px 18px rgba(30,81,123,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '32px', width: '56px', height: '56px', borderRadius: '14px', background: '#1E517B', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✍️
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#1E517B', margin: 0 }}>
                        सबनीस
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: '#2B577E', fontWeight: 700 }}>
                        पद: ब्राह्मण मुत्सद्दी / हिशेबनीस
                      </div>
                    </div>
                  </div>
                  <ul style={{ fontSize: '0.88rem', color: '#4E3C30', lineHeight: 1.65, paddingLeft: '18px', margin: 0 }}>
                    <li>किल्ल्याचा दफ्तरदार, हिशेब व पत्रव्यवहार प्रमुख</li>
                    <li>गडावरील सैनिकांचे हजेरी पुस्तक व रोख वेतन वाटप</li>
                    <li>राजधानीकडून येणाऱ्या सर्व शासकीय आज्ञापत्रांची नोंद ठेवणे</li>
                    <li><strong>हवालदाराच्या परवानगीशिवाय कोणतेही पत्र किंवा वेतन मंजूर न करणे</strong></li>
                  </ul>
                </div>

                {/* 3. Karkhanis */}
                <div style={{ background: '#FAF8F5', borderRadius: '18px', border: '2px solid #7D4C1E', padding: '24px', boxShadow: '0 6px 18px rgba(125,76,30,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ fontSize: '32px', width: '56px', height: '56px', borderRadius: '14px', background: '#7D4C1E', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      📦
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: '#7D4C1E', margin: 0 }}>
                        कारखानीस
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: '#885E38', fontWeight: 700 }}>
                        पद: प्रभू / कायस्थ प्रशासकीय तज्ज्ञ
                      </div>
                    </div>
                  </div>
                  <ul style={{ fontSize: '0.88rem', color: '#4E3C30', lineHeight: 1.65, paddingLeft: '18px', margin: 0 }}>
                    <li>रसद, धान्य कोठारे, दारूगोळा व तोफखान्याचा कारभारी</li>
                    <li>गडावरील पाणी टाक्यांची स्वच्छता व अन्नधान्याची साठवणूक</li>
                    <li>किल्ल्याच्या तटबंदी, बुरूज व दरवाजांच्या दुरुस्तीचे व्यवस्थापन</li>
                    <li><strong>हवालदार व सबनीस या दोघांच्या संयुक्त मंजुरीशिवाय साठा न देणे</strong></li>
                  </ul>
                </div>

              </div>

              {/* Anti-Treachery Mechanism Callout */}
              <div style={{ background: '#F4ECE4', borderRadius: '16px', padding: '24px 28px', borderLeft: '6px solid #8F2800' }}>
                <h4 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.15rem', color: '#3D0D0D', margin: '0 0 6px', fontWeight: 800 }}>
                  🔒 फितुरीला शून्य वाव — ऐतिहासिक तपासणी सूत्र
                </h4>
                <p style={{ fontSize: '0.92rem', color: '#4E3E34', lineHeight: 1.6, margin: 0 }}>
                  कोणत्याही किल्ल्यावर हवालदार, सबनीस व कारखानीस हे तिघेही एकत्र आल्याशिवाय गड शत्रूच्या ताब्यात देणे किंवा दरवाजा उघडणे तांत्रिकदृष्ट्या अशक्य होते. याव्यतिरिक्त तटबंदीवर <strong>तटसरनोबत</strong> आणि डोंगर पायथ्याशी <strong>रामोशी, कोळी, भिल्ल व मातंग गडकरी</strong> यांची कडक रात्रगस्त असे. त्यामुळेच मुघल सैन्याला एका साध्या गडाला जिंकण्यासाठीही कित्येक वर्षे लढावे लागत असे.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: ADNYAPATRA & ENVIRONMENTAL ETHICS */}
        {activeTab === 'adnyapatra' && (
          <div>
            <div style={{ background: '#FFF', borderRadius: '20px', border: '1px solid #E6D8C8', padding: '32px', marginBottom: '32px', boxShadow: '0 6px 24px rgba(0,0,0,0.04)' }}>
              
              <div style={{ maxWidth: '820px', marginBottom: '28px' }}>
                <span style={{ background: '#E6F4EA', color: '#137333', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  🌲 जगातील पहिली पर्यावरण व नागरी आचारसंहिता
                </span>
                <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#1B4D24', margin: '10px 0 8px' }}>
                  रामचंद्रपंत अमात्यांचे 'आज्ञापत्र' (१७१६) व वृक्षसंवर्धन
                </h2>
                <p style={{ color: '#574A3E', fontSize: '0.96rem', lineHeight: 1.65 }}>
                  मराठा आरमारात जहाजे व गलबते बांधण्यासाठी प्रचंड लाकूड लागत असे. परंतु छत्रपती शिवाजी महाराजांनी रयतेने पोटच्या लेकरासारखी वाढवलेली फळझाडे तोडण्यास <strong>सक्त मनाई</strong> करणारा जगातील पहिला पर्यावरण संरक्षण कायदा जारी केला.
                </p>
              </div>

              {/* Direct Historical Decree Quotes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                
                {/* Decree 1: Tree conservation */}
                <div style={{ background: '#F6FAF4', borderRadius: '16px', border: '1px solid #B8DCB0', padding: '22px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#2F6824', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                    📜 आज्ञापत्र: वृक्षसंरक्षण कलम
                  </div>
                  <div style={{ fontStyle: 'italic', fontSize: '0.94rem', color: '#1E4215', lineHeight: 1.6, marginBottom: '12px', borderLeft: '3px solid #3E842E', paddingLeft: '12px' }}>
                    "आरमारास लाकूड पाहिजे म्हणून आंबा, फणस आदी वृक्ष तोडू नयेत. हे वृक्ष काही एका वर्षात तयार होत नाहीत. रयतेने पोटच्या मुलांसारखी झाडे वाढविली असतात. ती तोडल्यास रयतेस दुःख होते. झाड वाळले असेल तर मालकास रास्त द्रव्य देऊन त्याचे संमतीने तोडावे."
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#5C7456' }}>
                    — रामचंद्रपंत अमात्य, आज्ञापत्र (आरमार प्रकरण)
                  </div>
                </div>

                {/* Decree 2: Soldier ethics at Chiplun */}
                <div style={{ background: '#FCF8F2', borderRadius: '16px', border: '1px solid #E4CCAC', padding: '22px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#8F4E08', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                    📜 चिपळूणचे पत्र (१६७४): रयतेचे संरक्षण
                  </div>
                  <div style={{ fontStyle: 'italic', fontSize: '0.94rem', color: '#5E3305', lineHeight: 1.6, marginBottom: '12px', borderLeft: '3px solid #BC6C14', paddingLeft: '12px' }}>
                    "रयतेच्या भाजीच्या देठासही हात न लावणे. सैन्याने कोणाकडून फुकट काही घेऊ नये. शेतकऱ्यांचे लाकूड, पेंढा, दाणा फुकट नेल्यास ते उपाशी मरतील आणि मोगल बरे, तुम्ही वाईट असे म्हणतील! तेव्हा लष्कराने रयतेला अजिबात उपद्रव देऊ नये."
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#7E6347' }}>
                    — छत्रपती शिवाजी महाराज, चिपळूण छावणीस पत्र (१४ एप्रिल १६७४)
                  </div>
                </div>

                {/* Decree 3: Women's Honor */}
                <div style={{ background: '#FFF5F5', borderRadius: '16px', border: '1px solid #F5C6C6', padding: '22px' }}>
                  <div style={{ fontSize: '0.78rem', color: '#9E1B1B', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                    📜 स्त्रियांचा सन्मान व कठोर आचारसंहिता
                  </div>
                  <div style={{ fontStyle: 'italic', fontSize: '0.94rem', color: '#680C0C', lineHeight: 1.6, marginBottom: '12px', borderLeft: '3px solid #D63030', paddingLeft: '12px' }}>
                    "शत्रूच्या प्रदेशातही स्त्री, बालक, गोमाता व धर्मस्थाने यांना अभय असणे. युद्धात बंदीवान झालेल्या महिलांचा मातेसमान आदर करून त्यांना सन्मानाने त्यांच्या कुटुंबियांकडे पाठवावे. जो सैनिक स्त्रीवर हात टाकेल त्याचा तात्काळ शिरच्छेद करावा."
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#884D4D' }}>
                    — सभासद बखर व कल्याण सुभेदार सून प्रसंग (१६५७)
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 5: CURRENCY, INTEL & JUSTICE */}
        {activeTab === 'currency_intel' && (
          <div>
            <div style={{ background: '#FFF', borderRadius: '20px', border: '1px solid #E6D8C8', padding: '32px', marginBottom: '32px', boxShadow: '0 6px 24px rgba(0,0,0,0.04)' }}>
              
              <div style={{ maxWidth: '820px', marginBottom: '28px' }}>
                <span style={{ background: '#FFF3E0', color: '#E65100', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  🪙 सार्वभौम अर्थव्यवस्था व सुरक्षा यंत्रणा
                </span>
                <h2 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.8rem', fontWeight: 800, color: '#3D0D0D', margin: '10px 0 8px' }}>
                  शिवकालीन नाणी, गुप्तहेर जाळे व न्यायनिवाडा
                </h2>
                <p style={{ color: '#574A3E', fontSize: '0.96rem', lineHeight: 1.65 }}>
                  स्वतंत्र राज्याचे स्वतःचे चलन आणि अंतर्गत सुरक्षेसाठी अचूक माहिती देणारे गुप्तहेर असणे अनिवार्य होते. १६७४ च्या राज्याभिषेकानंतर शिवरायांनी परकीय चलनावरचे अवलंबित्व संपवून स्वतःची मुद्रांकित नाणी चलनात आणली.
                </p>
              </div>

              {/* 3 Pillars Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                
                {/* 1. Currency */}
                <div style={{ background: '#FFFDF9', borderRadius: '16px', border: '1px solid #EADBCC', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '32px' }}>🪙</span>
                    <div>
                      <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#8F2800', margin: 0 }}>
                        सुवर्ण 'होन' व तांब्याची 'शिवराई'
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#946624', fontWeight: 700 }}>शिवराज्याभिषेक शक १६७४</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#4E3E34', lineHeight: 1.6 }}>
                    <strong>शिवराई (तांबे):</strong> सर्वसामान्य व्यवहारांसाठी वजन सु. १० ते १२ ग्रॅम. दर्शनी भागावर \'श्री / राजा / शिव\' आणि मागील भागावर \'छ / त्र / पती\' देवनागरी लिपीत कोरलेले.<br/>
                    <strong>होन (सुवर्ण):</strong> उच्च दर्जाचे शुद्ध सोने, वजन सु. २.८ ते ३.० ग्रॅम. आंतरराष्ट्रीय व्यापारात प्रचंड विश्वासार्हता.
                  </p>
                </div>

                {/* 2. Intelligence Network */}
                <div style={{ background: '#FFFDF9', borderRadius: '16px', border: '1px solid #EADBCC', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '32px' }}>🕵️</span>
                    <div>
                      <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#3A5A40', margin: 0 }}>
                        बहिर्जी नाईक व गुप्तहेर यंत्रणा
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#527A59', fontWeight: 700 }}>माहितीचा अचूक धागा</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#4E3E34', lineHeight: 1.6 }}>
                    स्वराज्याचे गुप्तहेर प्रमुख <strong>बहिर्जी नाईक</strong> यांच्या हाताखाली ३००० पेक्षा जास्त वाकबगार गुप्तहेर कार्यरत होते. वेशांतर करणे, सांकेतिक शिट्ट्या, पक्ष्यांचे आवाज काढणे आणि शत्रूच्या छावणीतील रस्ते, दरवाजे व खजिने यांची आधीच नकाशासहित माहिती गोळा करणे हे त्यांचे मुख्य काम होते (उदा. सुरत लुटणे व शाहिस्तेखान छापा).
                  </p>
                </div>

                {/* 3. Judiciary */}
                <div style={{ background: '#FFFDF9', borderRadius: '16px', border: '1px solid #EADBCC', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '32px' }}>⚖️</span>
                    <div>
                      <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', fontWeight: 800, color: '#6B2D5C', margin: 0 }}>
                        गोतसभा, पंचायत व निष्पक्ष न्याय
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#884976', fontWeight: 700 }}>समान कायदे व निःपक्षपाती दंड</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#4E3E34', lineHeight: 1.6 }}>
                    गाव पातळीवर भांडणे सोडवण्यासाठी स्थानिक पाटील व गोतसभा (गावकरी पंचायत) होती. अपील मुख्य न्यायाधीश व छत्रपतींच्या दरबारात होत असे. <strong>रांझ्याच्या पाटलाने स्त्रीवर अन्याय केला असता त्याचे दोन्ही हात व पाय तोडण्याचा (चौरंग) कठोर निर्णय</strong> शिवरायांनी घेतला, ज्यामुळे स्वराज्यात गुन्हेगारीला मोठा आळा बसला.
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Primary Source Attributions & Cross-Links */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E6D8C8',
          padding: '24px 28px',
          marginTop: '40px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #EFE4D6', paddingBottom: '16px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#3D0D0D', margin: 0 }}>
                📖 अस्सल ऐतिहासिक संदर्भ व संशोधन आधार
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#7D6A5D', margin: '4px 0 0' }}>
                Connect Maratha डिजिटल ज्ञानकोशातील सर्व माहिती प्राथमिक समकालीन ऐतिहासिक कागदपत्रांवर आधारित आहे.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ background: '#E6F4EA', color: '#137333', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
                ✓ Tier 1 Primary Sources
              </span>
              <span style={{ background: '#E8F0FE', color: '#1967D2', fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px' }}>
                ✓ Academic Peer-Reviewed
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', fontSize: '0.84rem', color: '#5C4E43' }}>
            <div>• <strong>सभासद बखर:</strong> कृष्णाजी अनंत सभासद (१६९७)</div>
            <div>• <strong>आज्ञापत्र:</strong> रामचंद्रपंत अमात्य (१७१६)</div>
            <div>• <strong>जेधे शकावली व करीना:</strong> समकालीन नोंदी</div>
            <div>• <strong>शिवभारत:</strong> कवींद्र परमानंद (१६७४)</div>
            <div>• <strong>मराठ्यांच्या इतिहासाची साधने:</strong> वि. का. राजवाडे (२२ खंड)</div>
            <div>• <strong>मराठी रियासत:</strong> रियासतकार गो. स. सरदेसाई</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed #EFE4D6' }}>
            <span style={{ fontSize: '0.86rem', color: '#7D6A5D' }}>इतर संबंधित ऐतिहासिक विभाग:</span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link to="/history/navy" style={{ textDecoration: 'none', background: '#F5EBE0', color: '#8F2800', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                ⚓ मराठा आरमार
              </Link>
              <Link to="/culture/heritage-map" style={{ textDecoration: 'none', background: '#F5EBE0', color: '#8F2800', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                🗺️ ऐतिहासिक दुर्ग नकाशा
              </Link>
              <Link to="/history/knowledge-graph" style={{ textDecoration: 'none', background: '#F5EBE0', color: '#8F2800', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                🕸️ ज्ञानकोश नॉलेज ग्राफ
              </Link>
              <Link to="/maratha-quiz" style={{ textDecoration: 'none', background: '#8F2800', color: '#FFF', padding: '6px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                🏆 इतिहास ज्ञान क्विझ
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
