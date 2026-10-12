import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const BATTLES_LIST = [
  {
    id: "kanchan-bari",
    name: "कांचन बारी ची लढाई (Battle of Kanchan Bari)",
    year: "१६७०",
    location: "कांचन बारी, नाशिक-दिंडोरी परिसर",
    opponent: "दाऊद खान कुरेशी व इखलास खान (मोघल साम्राज्य)",
    result: "मराठ्यांचा ऐतिहासिक विजय (वृक युद्धनीती)",
    significance: "सुरतेहून आणलेला खजिना सुरक्षित ठेवून प्रत्यक्ष उघड्या मैदानात मोघलांच्या सेनेला चारही बाजूंनी घेरून दिलेला जबरदस्त तडाखा.",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=600",
    link: "/history/kanchan-bari"
  },
  {
    id: 'pratapgad-afzalkhan',
    era: 'shivaji',
    date: '१० नोव्हेंबर १६५९ (मार्गशीर्ष शुद्ध सप्तमी)',
    location: 'प्रतापगड पायथा व जावळीचे खोरे, सातारा',
    image: '/assets/images/battles/pratapgad.jpg',
    title: 'प्रतापगड रणसंग्राम व अफजलखान वध',
    desc: 'विजापूरचा बलाढ्य सेनापती अफजलखानाचा कोथळा बाहेर काढून विजापूरच्या ३५,००० फौजेचा जावळीच्या जंगलात केलेला संपूर्ण पराभव. "होता जीवा म्हणून वाचला शिवा" ही अजरामर घटना आणि १८ दिवसांत वाई ते पन्हाळगड विजय.',
    commander: 'छत्रपती शिवाजी महाराज, कान्होजी जेधे, मोरोपंत पिंगळे, नेताजी पालकर, जीवा महाला विरुद्ध अफजलखान, सय्यद बंडा, फाजलखान',
    importance: 'हिंदू समाजातील शतकांची भीती नष्ट करणारा आणि हिंदवी स्वराज्याला जागतिक ओळख मिळवून देणारा निर्णायक विजय',
    reference: 'सभासद बखर, जेधे शकावली, शिवभारत, इंग्रज-डच पत्रव्यवहार',
    link: '/history/afzal-khan',
    linkText: 'अफजलखान वध संपूर्ण गाथा वाचा →'
  },
  {
    id: 'pavankhind',
    era: 'shivaji',
    date: '१३ जुलै १६६०',
    location: 'पावनखिंड / विशाळगड',
    image: '/assets/images/battles/pavankhind.jpg',
    title: 'पावनखिंडीची ऐतिहासिक लढाई',
    desc: 'पन्हाळगडाच्या वेढ्यातून छत्रपती शिवाजी महाराजांची विशाळगडाकडे कूच. बाजीप्रभू देशपांडे, फुलाजी प्रभू व ३०० बांदल मावळ्यांनी सिद्धी मसूदच्या ४,००० फौजेला खिंडीत तोफांचे आवाज येईपर्यंत थोपवून धरले.',
    commander: 'बाजीप्रभू देशपांडे, फुलाजी प्रभू विरुद्ध सिद्धी मसूद',
    importance: 'महाराजांचे प्राणरक्षण व स्वराज्याची अखंडता',
    reference: 'सभासद बखर, जेधे शकावली',
    link: '/article/shiva-kashid-baji-prabhu',
    linkText: 'पावनखिंड रणसंग्राम सविस्तर वाचा →'
  },
  {
    id: 'purandar',
    era: 'shivaji',
    date: 'एप्रिल - जून १६६५',
    location: 'पुरंदर किल्ला',
    image: '/assets/images/battles/purandar.jpg',
    title: 'पुरंदरचा संग्राम व वेढा',
    desc: 'मिर्झाराजे जयसिंह व दिलेरखानाने पुरंदरला प्रचंड वेढा घातला. किल्लेदार मुरारबाजी देशपांडे यांनी मूठभर मावळ्यांसह वज्रगडावरून दिलेरखानाच्या फौजेवर केलेला अद्वितीय प्रतिहल्ला.',
    commander: 'मुरारबाजी देशपांडे विरुद्ध दिलेरखान',
    importance: 'पुरंदरच्या तहाची पार्श्वभूमी व मुत्सद्दीपणा',
    reference: 'हफ्त अंजुमन, आलमगीरनामा',
    link: '/history/warriors',
    linkText: 'मुरारबाजी चरित्र पहा →'
  },
  {
    id: 'sinhagad',
    era: 'shivaji',
    date: '४ फेब्रुवारी १६७०',
    location: 'सिंहगड (कोंढाणा)',
    image: '/assets/images/battles/sinhagad.jpg',
    title: 'सिंहगडची रात्रीची चढाई',
    desc: "सुभेदार तानाजी मालुसरे यांनी घोरपडीच्या साहाय्याने द्रोणागिरी कडा चढून कोंढाण्यावर केलेला हल्ला. उदयभानू राठोडशी तुंबळ युद्ध; 'गड आला पण सिंह गेला' हा अमर उद्गार.",
    commander: 'तानाजी मालुसरे, सूर्याजी मालुसरे विरुद्ध उदयभानू',
    importance: 'मुघलांकडून किल्ले परत मिळवण्याची मोहीम',
    reference: 'सभासद बखर, पोवाडे',
    link: '/article/tanaji-malusare',
    linkText: 'सुभेदार तानाजी मालुसरे चरित्र वाचा →'
  },
  {
    id: 'surat-kanchanbari',
    era: 'shivaji',
    date: '३–५ ऑक्टोबर १६७०',
    location: 'सुरत व कांचनबारी खिंड (नाशिक)',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    title: 'सुरतेची दुसरी स्वारी व कांचनबारी संग्राम — शिवकालीन दिवाळी',
    desc: 'लक्ष्मीपूजनाच्या दिवशी शिवरायांनी सुरतेवर आक्रमण करून ६६ लाखांहून अधिक संपत्ती स्वराज्यात आणली. परतीच्या वाटेवर कांचनबारीच्या खिंडीत मुघल सरदार दाऊदखानाचा दारुण पराभव केला.',
    commander: 'छत्रपती शिवाजी महाराज, मोरोपंत पिंगळे विरुद्ध दाऊदखान',
    importance: 'स्वराज्याच्या तिजोरीत विपुल धनसंचय व मुघल सत्तेला जबर तडाखा',
    reference: 'सभासद बखर, डच व इंग्रज फॅक्टरी रेकॉर्ड्स',
    link: '/history/shivaji-diwali',
    linkText: 'शिवकालीन दिवाळी गाथा वाचा →'
  },
  {
    id: 'shivaji-yudhniti',
    era: 'shivaji',
    date: '१६४५ – १६८० (अखंड रणसंग्राम)',
    location: 'पुरंदर, प्रतापगड, बहादूरगड, सिंधुदुर्ग, कनेरगड',
    image: '/assets/images/battles/pratapgad.jpg',
    title: 'छत्रपती शिवाजी महाराजांची युद्धनीती व गनिमी कावा',
    desc: 'गनिमी कावा, धक्कातंत्र, मानसशास्त्रीय युद्ध (Psychological Warfare), बहादूरगडावरील रक्तहीन खजिना मोहीम, आरमार निर्मिती आणि कनेरगडचे रामजी पांगरे यांचे बलिदान — संपूर्ण ऐतिहासिक विवरण.',
    commander: 'छत्रपती शिवाजी महाराज, तानाजी मालुसरे, गोदाजी जगताप, रामजी पांगरे विरुद्ध आदिलशाही व मुघल साम्राज्य',
    importance: 'अल्प सैन्यासह महाप्रचंड साम्राज्ये नमवणारी जागतिक दर्जाची युद्धनीती',
    reference: 'सभासद बखर, जेधे शकावली, ऐतिहासिक व्याख्यान संदर्भ',
    link: '/history/shivaji-yudhniti',
    linkText: 'संपूर्ण युद्धनीती गाथा वाचा →'
  },
  {
    id: 'panhala-kondaji',
    era: 'shivaji',
    date: '६ मार्च १६७३',
    location: 'किल्ले पन्हाळगड, कोल्हापूर',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    title: '६० मावळ्यांची पन्हाळगड मोहीम — सवाद्य विजय',
    desc: 'वीर कोंडाजी फर्जंद, अण्णाजी दत्तो व अवघ्या ६० मर्द मावळ्यांनी मध्यरात्री अभेद्य कडा चढून ३,००० विजापुरी सैन्यावर रणवाद्ये वाजवून केलेला अद्वितीय हल्ला. किल्लेदाराचा वध करून १२ वर्षांनंतर पन्हाळा स्वराज्यात आणला.',
    commander: 'वीर कोंडाजी फर्जंद, अण्णाजी दत्तो विरुद्ध विजापूर किल्लेदार',
    importance: 'शिवरायांचे कौतुक: "शाबास कोंडाजी! गडही जिंकला आणि सिंह वाचला!"',
    reference: 'सभासद बखर, जेधे शकावली, शाहिरी पोवाडे',
    link: '/forts/panhala',
    linkText: 'पन्हाळगड विजय गाथा वाचा →'
  },
  {
    id: 'wadgaon',
    era: 'peshwa',
    date: '१२–१४ जानेवारी १७७९',
    location: 'वडगाव मावळ व तळेगाव, पुणे',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    title: 'वडगावची ऐतिहासिक लढाई (पहिले इंग्रज-मराठा युद्ध)',
    desc: 'महादजी शिंदे व नाना फडणवीस यांच्या नेतृत्वाखाली मराठ्यांनी दग्धभू धोरण वापरून इंग्रज सेनेला तळेगाव-वडगाव मावळात घेरले. तोफखाना प्रमुख सरदार पानसे यांच्या तोफांनी इंग्रजांचा दारुण पराभव केला आणि इंग्रज सेनापतीला महादजींच्या तलवारीपुढे नतमस्तक व्हावे लागले.',
    commander: 'महादजी शिंदे, हरिपंत फडके, सरदार पानसे विरुद्ध कर्नल कॉकबर्न, जॉन स्टुअर्ट (इष्टूर फाकडा)',
    importance: 'एका भारतीय देशी सत्तेने आधुनिक युरोपियन ब्रिटिश सैन्याला बिनशर्त शरण येण्यास भाग पाडणारा जागतिक विजय',
    reference: 'पेशवे दप्तर, मॉस्टिन डायरी, ग्रांट डफ, विजयस्तंभ वडगाव',
    link: '/history/mahadji-shinde',
    linkText: 'वडगाव विजय व महादजी गाथा वाचा →'
  },
  {
    id: 'palkhed',
    era: 'peshwa',
    date: '२८ फेब्रुवारी १७२८',
    location: 'पालखेड, नाशिक',
    image: '/assets/images/battles/palkhed.jpg',
    title: 'पालखेडची ऐतिहासिक लढाई',
    desc: 'थोरले बाजीराव पेशव्यांची लष्करी रणनीतीची सर्वोत्तम किमया. तोफांचा वापर न करता केवळ वेगवान हालचालींनी निजामाला पाणी नसलेल्या पालखेडच्या मैदानात कोंडले व मुंगी-पैठणचा तह करण्यास भाग पाडले.',
    commander: 'बाजीराव पेशवे I विरुद्ध निजाम-उल-मुल्क',
    importance: 'छत्रपती शाहू महाराजांचे मराठा साम्राज्यावरील अधिपत्य सिद्ध',
    reference: 'पेशवे दप्तर खंड २२, फील्ड मार्शल मॉन्टगोमरी विश्लेषण',
    link: '/history/warriors',
    linkText: 'बाजीराव पेशवे चरित्र →'
  },
  {
    id: 'vasai',
    era: 'peshwa',
    date: '१२ मे १७३९',
    location: 'वसई किल्ला',
    image: '/assets/images/battles/vasai.jpg',
    title: 'वसईची प्रसिद्ध मोहीम',
    desc: 'पोर्तुगीजांच्या अत्याचारांविरुद्ध चिमाजी अप्पांच्या नेतृत्वाखालील दोन वर्षांचा प्रदीर्घ वेढा. खाणी उडवून आणि अद्वितीय तोफखान्याचा वापर करून युरोपीय सत्तेवर मराठ्यांनी मिळवलेला भव्य विजय.',
    commander: 'चिमाजी अप्पा, मानाजी आंग्रे विरुद्ध सिल्वा आल्बुकेर्क',
    importance: 'उत्तर कोकणातून पोर्तुगीज सत्तेचा अंत',
    reference: 'मराठ्यांच्या इतिहासाची साधने (राजवाडे), पोर्तुगीज दप्तर',
    link: '/history',
    linkText: 'इतिहास दालन पहा →'
  },
  {
    id: 'panipat',
    era: 'peshwa',
    date: '१४ जानेवारी १७६१',
    location: 'पानिपत, हरियाणा',
    image: '/assets/images/battles/panipat.jpg',
    title: 'पानिपतची तिसरी लढाई',
    desc: 'भारताच्या सार्वभौमत्वासाठी उत्तरेत लढलेली महाभीषण लढाई. सदाशिवराव भाऊ, विश्वासराव पेशवे, मल्हारराव होळकर व इब्राहिम खान गारदी यांनी अब्दालीच्या सैन्याविरुद्ध दिलेला असीम शौर्याचा लढा.',
    commander: 'सदाशिवराव भाऊ विरुद्ध अहमद शाह अब्दाली',
    importance: 'मराठ्यांचा राष्ट्रीय बलिदानाचा इतिहास',
    reference: 'भाऊसाहेबांची बखर, काशीराज अहवाल, सर जदुनाथ सरकार',
    link: '/history',
    linkText: 'भाऊसाहेबांची बखर वाचा →'
  },
  {
    id: 'wadgaon',
    era: 'anglo',
    date: '१२-१३ जानेवारी १७७९',
    location: 'तळेगाव - वडगाव मावळ',
    image: '/assets/images/battles/salher.jpg',
    title: 'वडगावची लढाई (पहिले इंग्रज-मराठा युद्ध)',
    desc: 'महादजी शिंदे व तुकोजी होळकर यांच्या संयुक्त फौजांनी ब्रिटिश ईस्ट इंडिया कंपनीच्या मुंबई सैन्याला तळेगाव-वडगावमध्ये कोंडीत पकडून शरणागती पत्करायला लावली. वडगावचा प्रसिद्ध तह.',
    commander: 'महादजी शिंदे, हरिपंत फडके विरुद्ध कर्नल कॉकबर्न',
    importance: 'ब्रिटिशांचा भारतात झालेला पहिला मोठा पराभव',
    reference: 'मराठ्यांच्या इतिहासाची साधने, बॉम्बे गॅझेटियर',
    link: '/forts',
    linkText: 'युद्ध नकाशा पहा →'
  }
];

export default function BattlesPage() {
  const [activeEra, setActiveEra] = useState('all');

  const filteredBattles = activeEra === 'all'
    ? BATTLES_LIST
    : BATTLES_LIST.filter(b => b.era === activeEra);

  return (
    <>
      {/* HERO SECTION */}
      <div className="hero" style={{ position: 'relative', minHeight: '480px', overflow: 'hidden' }}>
        <img
          src="/assets/images/maratha-battles-palkhed.jpg"
          alt="मराठा युद्धे व रणव्यूह"
          className="hero-bg-img"
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.38)' }}
        />
        <div
          className="hero-overlay"
          style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(20,4,6,0.6), rgba(12,2,4,0.95) 85%)' }}
        />
        <div className="wrap hero-content" style={{ position: 'relative', zIndex: 2, maxWidth: '1300px', padding: '64px 24px', color: '#fff' }}>
          <div className="eyebrow" style={{ color: 'var(--gold-400)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1.5px', fontWeight: 700 }}>
            Spec Page 13 & 14 • Blueprint Section 4
          </div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)', lineHeight: 1.15, color: '#fff', margin: '8px 0 16px', fontFamily: 'Baloo 2' }}>
            मराठा युद्धे, लढाया व{' '}
            <span style={{ background: 'linear-gradient(90deg,var(--gold-400),var(--saffron-500))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              रणव्यूह दालन
            </span>
          </h1>
          <div style={{ background: 'var(--gold-500)', width: '80px', height: '4px', marginBottom: '18px' }} />
          <p style={{ color: 'var(--text-sec)', fontSize: '1.12rem', maxWidth: '68ch', lineHeight: 1.6 }}>
            गनिमी कावा, वेगवान अश्वदल, जलदुर्ग वेढा व डोंगररांगांमधील अजोड रणनीती • पावनखिंड ते पालखेड, वसई ते पानिपत — मराठा लष्करी इतिहासाची सत्य व संदर्भयुक्त शौर्यगाथा.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '28px', flexWrap: 'wrap' }}>
            <a href="#battlesList" className="btn btn-primary" style={{ padding: '12px 24px', fontWeight: 700 }}>
              ⚔️ प्रमुख लढाया पहा
            </a>
            <Link to="/forts" className="btn btn-outline" style={{ padding: '12px 24px', color: '#fff', borderColor: 'var(--gold-400)' }}>
              🗺️ युद्धस्थळांचा नकाशा
            </Link>
          </div>
        </div>
      </div>

      {/* TACTICAL STRATEGY OVERVIEW PILLARS */}
      <section className="section" style={{ padding: '56px 24px', background: 'var(--paper-2)' }}>
        <div className="wrap" style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 40px' }}>
            <span className="tag" style={{ background: 'var(--saffron-500)', color: '#fff' }}>
              रणनीती व लष्करी व्यवस्था
            </span>
            <h2 style={{ fontSize: '2.2rem', margin: '10px 0', fontFamily: 'Baloo 2' }}>
              मराठा लष्करी डावपेच — पाच मुख्य आधारस्तंभ
            </h2>
            <p style={{ color: 'var(--text-sec)' }}>
              ऐतिहासिक साधनांवर आधारित मराठा सैन्याची युद्धपद्धती, ज्याने समकालीन सत्तांना चकित केले.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid var(--saffron-600)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚡</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>गनिमी कावा (Guerrilla Warfare)</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                भौगोलिक परिस्थितीचा परिपूर्ण अभ्यास, आकस्मिक हल्ले, शत्रूचा रसद पुरवठा तोडणे आणि सुरक्षित आश्रयस्थानांत झटपट परतणे.
              </p>
            </div>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid var(--gold-500)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🐎</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>वेगवान अश्वदल (Light Cavalry)</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                थोरले बाजीराव पेशव्यांच्या काळात विकसित झालेली दिवसभरात ५०-६० मैल धाव घेण्याची क्षमता, हलकी शस्त्रे व वेगवान हालचाली.
              </p>
            </div>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid #C73800' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💣</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>तोफखाना व दारुगोळा</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                पुरंदर, रायगड, आणि वसईच्या वेढ्यात मराठा कारागिरांनी निर्माण केलेल्या तोफा व सुरूंग तंत्रज्ञानाचा प्रभावी रणवापर.
              </p>
            </div>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid #1E88E5' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚓</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>मराठा आरमार व सागरी वेढा</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                छत्रपती शिवाजी महाराजांनी स्थापलेले स्वतंत्र आरमार व कान्होजी आंग्रे यांनी राखलेले अरबी समुद्रावरील मराठा वर्चस्व.
              </p>
            </div>
            <div className="card" style={{ padding: '24px', borderRadius: '14px', borderTop: '3px solid var(--maroon-900)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🏰</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>दुर्ग संरक्षण व रसद साखळी</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-sec)', lineHeight: 1.5 }}>
                ३५० हून अधिक डोंगरी व जलदुर्गांचे अभेद्य जाळे, नैसर्गिक जलसाठे आणि आणीबाणीच्या वेळी स्वतंत्र प्रतिकार क्षमता.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BATTLES LIST SECTION */}
      <section className="section" id="battlesList" style={{ padding: '64px 24px' }}>
        <div className="wrap" style={{ maxWidth: '1300px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="tag" style={{ background: 'var(--maroon-900)', color: 'var(--gold-400)' }}>
                ऐतिहासिक लढायांचा विस्तृत संग्रह
              </span>
              <h2 style={{ fontSize: '2.2rem', margin: '8px 0 0', fontFamily: 'Baloo 2' }}>
                ७ ऐतिहासिक निर्णायक लढाया
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn btn-outline ${activeEra === 'all' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => setActiveEra('all')}
              >
                सर्व लढाया
              </button>
              <button
                type="button"
                className={`btn btn-outline ${activeEra === 'shivaji' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => setActiveEra('shivaji')}
              >
                शिवकाल (१६४५-१६८०)
              </button>
              <button
                type="button"
                className={`btn btn-outline ${activeEra === 'peshwa' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => setActiveEra('peshwa')}
              >
                पेशवे काल (१७०७-१७६१)
              </button>
              <button
                type="button"
                className={`btn btn-outline ${activeEra === 'anglo' ? 'active' : ''}`}
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={() => setActiveEra('anglo')}
              >
                ब्रिटिश संघर्ष (१७७५-१८१८)
              </button>
            </div>
          </div>

          <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {filteredBattles.map((b) => (
              <div
                key={b.id}
                className="card battle-card"
                data-era={b.era}
                style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}
              >
                {/* Relatable Battle Artwork Banner */}
                <div style={{ height: '190px', width: '100%', position: 'relative', overflow: 'hidden', background: '#1c1917' }}>
                  <img
                    src={b.image}
                    alt={b.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/battles/pratapgad.jpg'; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,4,6,0.9) 0%, rgba(20,4,6,0.3) 60%, transparent 100%)' }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'var(--gold-400)', fontSize: '0.75rem', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                    {b.date}
                  </div>
                  <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                    <span className="tag" style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.72rem', color: '#fff', backdropFilter: 'blur(4px)' }}>
                      📍 {b.location}
                    </span>
                    <h3 style={{ fontSize: '1.3rem', margin: '6px 0 0', color: '#fff', fontFamily: 'Baloo 2', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                      {b.title}
                    </h3>
                  </div>
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-sec)', marginBottom: '14px', lineHeight: 1.6 }}>
                      {b.desc}
                    </p>
                    <div style={{ fontSize: '0.82rem', background: 'var(--paper-3)', padding: '12px', borderRadius: '8px', marginBottom: '14px', lineHeight: 1.5 }}>
                      <div><strong>सेनापती:</strong> {b.commander}</div>
                      <div style={{ marginTop: '4px' }}><strong>महत्त्व:</strong> {b.importance}</div>
                      <div style={{ marginTop: '4px' }}><strong>संदर्भ:</strong> {b.reference}</div>
                    </div>
                  </div>
                  <Link
                    to={b.link}
                    className="btn btn-outline"
                    style={{ width: '100%', textAlign: 'center', justifyContent: 'center', boxSizing: 'border-box' }}
                  >
                    {b.linkText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
