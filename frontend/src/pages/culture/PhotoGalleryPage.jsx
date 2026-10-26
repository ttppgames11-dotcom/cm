import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GALLERY_ITEMS = [
  // 🏰 दुर्गराज व गडकिल्ले (Forts)
  {
    id: 1,
    title: 'दुर्गराज रायगड — राज्याभिषेक सुवर्ण सिंहासन व राजसभा',
    category: 'forts',
    image: '/assets/images/real-raigad-panoramic.jpg',
    desc: 'दुर्गराज रायगड ही हिंदवी स्वराज्याची सार्वभौम राजधानी. ६ जून १६७४ रोजी येथे शिवरायांचा ऐतिहासिक सुवर्ण राज्याभिषेक संपन्न झाला. ३२ मण सुवर्ण सिंहासनाची जागा, भव्य नगारखाना, हिरकणी बुरुज, टकमक टोक, जगदीश्वर मंदिर आणि भव्य राजदरबार आजही शिववैभवाची साक्ष देतात.',
    tag: 'राजधानी'
  },
  {
    id: 2,
    title: 'किल्ले राजगड — बालेकिल्ला व संजीवनी माची',
    category: 'forts',
    image: '/assets/images/real-paschim-rajgad-fort.jpg',
    desc: 'स्वराज्याची सलग २६ वर्षे पहिली मुख्य राजधानी! सह्याद्रीच्या कुशीत वसलेला हा दुर्ग तिहेरी तटबंदी आणि दुहेरी बालेकिल्ल्याने सुसज्ज आहे. पद्मावती, संजीवनी आणि सुवेळा माचीची अभेद्य रचना स्थापत्यकलेचा सर्वोच्च नमुना मानली जाते.',
    tag: 'पहिली राजधानी'
  },
  {
    id: 3,
    title: 'किल्ले प्रतापगड — भवानी माता मंदिर व जावळी खोरे',
    category: 'forts',
    image: '/assets/images/real-pratapgad-fort.jpg',
    desc: '१० नोव्हेंबर १६५९ रोजी छत्रपती शिवाजी महाराजांनी बलाढ्य अफझलखानाचा कोथळा बाहेर काढून विजापूर सल्तनतीला पराभूत केले. गडावर तुळजाभवानी मातेचे स्वहस्ते स्थापन केलेले जागृत मंदिर असून घनदाट जावळीच्या जंगलात हा अजिंक्य पहारेकरी उभा आहे.',
    tag: 'महापराक्रम'
  },
  {
    id: 4,
    title: 'किल्ले सिंधुदुर्ग — मालवणचा अजिंक्य जलदुर्ग',
    category: 'forts',
    image: '/assets/images/real-sindhudurg-fort.jpg',
    desc: 'अरबी समुद्रात कुरटे बेटावरील काळ्या पाषाणावर शिशाचा रस ओतून पायाभरणी केलेला ४४ एकरांचा अभेद्य सागरी किल्ला. शिवरायांच्या दूरदृष्टीचे हे प्रमुख नौदल केंद्र असून गडावर शिवछत्रपतींचे जगातील एकमेव मंदिर आणि त्यांच्या हाता-पायांचे ठसे जपलेले आहेत.',
    tag: 'जलदुर्ग'
  },
  {
    id: 5,
    title: 'किल्ले सिंहगड — कल्याण दरवाजा व ऐतिहासिक दगडी बुरुज',
    category: 'forts',
    image: '/assets/images/Sinhagad.jpg',
    desc: 'पुण्याजवळील सह्याद्रीच्या पठारावर वसलेला कोंढाणा किल्ला. ४ फेब्रुवारी १६७० रोजी सुभेदार तानाजी मालुसरे यांनी घोरपडीच्या सहाय्याने द्रोणगिरी कडा सर करत प्राणांची आहुती दिली. "गड आला पण सिंह गेला!" या शब्दांनी शिवरायांनी गडाचे नामकरण सिंहगड केले.',
    tag: 'अमर बलिदान'
  },
  {
    id: 6,
    title: 'किल्ले पुरंदर — वज्रगड व ऐतिहासिक तह भूमी',
    category: 'forts',
    image: '/assets/images/real-purandar-fort.jpg',
    desc: 'छत्रपती संभाजी महाराजांचे जन्मस्थान आणि वीर मुरारबाजी देशपांडे यांच्या अतुलनीय बलिदानाची पावन भूमी. १६६५ मध्ये मिर्झाराजे जयसिंगाविरुद्ध झालेल्या ऐतिहासिक पुरंदर तहाचे हे महत्त्वाचे साक्षीदार स्थळ आहे.',
    tag: 'गिरीदुर्ग'
  },
  {
    id: 7,
    title: 'रायगड महादरवाजा — दुर्ग स्थापत्य व बुरुज रचना',
    category: 'forts',
    image: '/assets/images/real-raigad-mahadarwaja.jpg',
    desc: 'हिरोजी इंदुलकरांच्या स्थापत्यशास्त्राचा अजोड नमुना! दोन अजस्त्र बुरुजांच्या नैसर्गिक आडोशात बांधलेला गोमुखी महादरवाजा. शत्रूच्या तोफांचा थेट मारा दरवाजावर होऊ नये यासाठी केलेली रचना आणि भव्य हत्तीच्या धडकेला निष्प्रभ करणारे टोकदार खिळे येथे दिसतात.',
    tag: 'स्थापत्यशास्त्र'
  },
  {
    id: 8,
    title: 'वसई किल्ला — पेशवे चिमाजी आप्पा पोर्तुगीज विजय (१७३९)',
    category: 'forts',
    image: '/assets/images/real-vasai-fort.jpg',
    desc: 'श्रीमंत थोरले बाजीराव पेशव्यांचे पराक्रमी बंधू सेनापती चिमाजी आप्पा यांनी पोर्तुगीजांच्या बलाढ्य सैन्याचा दारुण पराभव करून उत्तर कोकण मुक्त केले. येथील भव्य चर्चचे ऐतिहासिक अवशेष आणि विजयाचे प्रतीक असणाऱ्या महाघंटा आजही मराठ्यांचा दरारा दाखवतात.',
    tag: 'विजय दुर्ग'
  },

  // 🪙 राजमुद्रा, शस्त्रे व नाणी (Symbols & Arms)
  {
    id: 9,
    title: 'छत्रपती शिवरायांची ऐतिहासिक संस्कृत राजमुद्रा',
    category: 'symbols',
    image: '/assets/images/real-rajmudra-seal.jpg',
    desc: '|| प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते || अर्थ: प्रतिपदेच्या चंद्रकलेप्रमाणे दिवसेंदिवस वृद्धिंगत होणारी आणि संपूर्ण जगाला वंद्य असणारी शहाजीपुत्र शिवाजींची ही राजमुद्रा लोककल्याणासाठी अधिराज्य गाजवते. अष्टकोनी आकारातील ही जगातील एकमेव कल्याणकारी राजमुद्रा आहे.',
    tag: 'पवित्र राजमुद्रा'
  },
  {
    id: 10,
    title: 'शिवकालीन सार्वभौम नाणी — सुवर्ण होन व तांब्याची शिवराई',
    category: 'symbols',
    image: '/assets/images/real-shivrai-coin.jpg',
    desc: '६ जून १६७४ च्या शिवराज्याभिषेकानंतर स्वराज्याची स्वतंत्र आर्थिक व्यवस्था म्हणून जारी करण्यात आलेली अधिकृत चलने. नाण्यावर देवनागरी लिपीत "श्री राजा शिवछत्रपती" असे सन्मानपूर्वक कोरलेले आहे. सुवर्ण होन आणि तांब्याची शिवराई स्वराज्याच्या सार्वभौम अस्तित्वाचा भक्कम पुरावा आहेत.',
    tag: 'स्वराज्य चलन'
  },
  {
    id: 11,
    title: 'अस्सल मराठा शस्त्रास्त्रे व जाळीदार चिलखत संग्रह',
    category: 'symbols',
    image: '/assets/images/real-maratha-arms.jpg',
    desc: 'मराठा गनिमी काव्याचा कणा असणारी शस्त्रे: शत्रूच्या गोटात धुमाकूळ घालणारा लवचिक दांडपट्टा, छाती भेदणारी कट्यार, वाघनखे, फिरंगी तलवार, गेंड्याच्या कातड्याची अभेद्य ढाल आणि बाण-तलवार निष्प्रभ करणारे लोखंडी जाळीदार चिलखत. मराठा योद्ध्यांच्या या शस्त्रास्त्रांचा दरारा जगभर गाजला.',
    tag: 'शस्त्रागार'
  },
  {
    id: 12,
    title: 'ऐतिहासिक सुवर्ण सिंहासन व मराठा राजदरबार',
    category: 'symbols',
    image: '/assets/images/rajmudra-darbar-bg.jpg',
    desc: 'दुर्गराज रायगडावर स्थापित ३२ मण शुद्ध सोन्याचे सिंहासन, ज्यावर आठ दिशांचे प्रतीक असलेले आठ सुवर्णस्तंभ आणि रत्नजडित छत्र विराजित होते. "क्षत्रियकुलावतंस श्री राजा शिवछत्रपती" म्हणून शिवरायांनी रयतेच्या स्वराज्याचा सार्वभौम मुकुट धारण केला.',
    tag: 'सुवर्ण सिंहासन'
  },

  // 🛕 मंदिरे, तीर्थक्षेत्रे व संस्कृती (Temples & Culture)
  {
    id: 13,
    title: 'कोल्हापूर करवीर निवासिनी — श्री अंबाबाई महालक्ष्मी महापीठ',
    category: 'culture',
    image: '/assets/images/real-kolhapur-mahalaxmi.jpg',
    desc: 'महाराष्ट्रातील साडेतीन शक्तिपीठांपैकी अत्यंत आद्य व पूर्ण शक्तिपीठ. चालुक्य व शिलाहार कालीन समृद्ध हेमाडपंती वास्तुकला, काळ्या पाषाणातील अष्टभुजा मूर्ती आणि वर्षातून दोनदा थेट देवीच्या मुखावर पडणारा सूर्यकिरणांचा अद्वितीय उत्सव (किरणोत्सव) हे याचे वैशिष्ट्य आहे.',
    tag: 'शक्तिपीठ'
  },
  {
    id: 14,
    title: 'पंढरपूर आषाढी वारी — वारकरी संप्रदाय व विठू माऊली',
    category: 'culture',
    image: '/assets/images/real-warkari-pandharpur.jpg',
    desc: 'संत ज्ञानेश्वर महाराज, संत तुकाराम महाराज यांच्या पालख्यांसोबत पायी चालणारी जगातील सर्वात मोठी अखंड शांततामय वारी! जात-पात विसरून "ज्ञानोबा माउली तुकाराम" च्या गजरात लाखो वैष्णवांचे चंद्रभागेच्या तीरावर विठ्ठल भेटीसाठी एकत्र येणे हा महाराष्ट्राचा आध्यात्मिक प्राण आहे.',
    tag: 'वारकरी परंपरा'
  },
  {
    id: 15,
    title: 'नासिक त्र्यंबकेश्वर — ब्रह्मगिरी पायथ्याशी ज्योतिर्लिंग',
    category: 'culture',
    image: '/assets/images/real-trimbakeshwar.jpg',
    desc: 'भारतातील १२ ज्योतिर्लिंगांपैकी एक प्रमुख ज्योतिर्लिंग, जिथे ब्रह्मा, विष्णू आणि महेश या तिन्ही देवांचे संयुक्त स्वरूप एकाच लिंगात पूजले जाते. पवित्र गोदावरी नदीचे उगमस्थान ब्रह्मगिरी पर्वतावर असून पेशवे बाळाजी बाजीराव (नानासाहेब) यांनी काळ्या पाषाणात हे मंदिर नव्याने उभारले.',
    tag: 'ज्योतिर्लिंग'
  },
  {
    id: 16,
    title: 'वेरूळ कैलास मंदिर — अखंड पाषाणात कोरलेले जागतिक आश्चर्य',
    category: 'culture',
    image: '/assets/images/real-ellora-kailash.jpg',
    desc: '८ व्या शतकात राष्ट्रकूट राजा कृष्ण प्रथम यांच्या काळात एकाच अजस्त्र डोंगराच्या वरून खाली अखंड दगड तासून कोरलेले जगातील एकमेव भव्य मंदिर (गुंफा १६). युनेस्को जागतिक वारसा स्थळ असलेले हे मंदिर प्राचीन भारतीय स्थापत्यकलेचा आणि गणिताचा अलौकिक चमत्कार मानले जाते.',
    tag: 'UNESCO वारसा'
  },
  {
    id: 17,
    title: 'खान्देश तोरणमाळ पठार व सातपुडा पर्वतश्रेणी',
    category: 'culture',
    image: '/assets/images/real-khandesh-toranmal.jpg',
    desc: 'नंदुरबार जिल्ह्यातील सातपुडा पर्वतमालेतील समृद्ध पठार. सीताखाई दरी, खडकी पॉइंट, यशवंत तलाव आणि आदिवासी भिल्ल संस्कृतीचा अनोखा संगम. निसर्गरम्य हिरवेगार डोंगर आणि समृद्ध वनसंपदा खान्देशच्या प्राचीन निसर्ग संस्कृतीचे दर्शन घडवते.',
    tag: 'खान्देश वारसा'
  },
  {
    id: 18,
    title: 'विदर्भ चिखलदरा पठार व मेळघाट व्याघ्र प्रकल्प',
    category: 'culture',
    image: '/assets/images/real-vidarbha-chikhaldara.jpg',
    desc: 'अमरावती जिल्ह्यातील सातपुडा पर्वतातील एकमेव थंड हवेचे निसर्गरम्य पठार. महाभारतकालीन कीचकवध कथा या भूमीशी जोडलेली आहे. जवळच पसरलेला मेळघाट व्याघ्र प्रकल्प, समृद्ध सागवान जंगले आणि कोरकू आदिवासी संस्कृती विदर्भाचे अनोखे सौंदर्य प्रतिबिंबित करतात.',
    tag: 'विदर्भ दर्शन'
  },

  // 🗺️ साम्राज्य नकाशे व ऐतिहासिक प्रसंग (History & Expansion)
  {
    id: 19,
    title: 'अखंड मराठा साम्राज्य विस्तार नकाशा — पेशवेकालीन अटकेपार साम्राज्य',
    category: 'history',
    image: '/assets/images/maratha-empire-accurate-map.jpg',
    desc: '१७५८ मध्ये श्रीमंत रघुनाथराव पेशवे व मल्हारराव होळकर यांनी सिंधू नदी पार करत अटकेच्या किल्ल्यावर मराठ्यांचा भगवा झेंडा फडकवला. लाहोर, पेशावर, दिल्ली, बुंदेलखंड, माळवा, गुजरात, ओडिशा ते तंजावरपर्यंत २८ लाख चौरस किलोमीटरवर पसरलेल्या अखंड मराठा साम्राज्याचा हा अधिकृत ऐतिहासिक नकाशा आहे.',
    tag: 'अटकेपार साम्राज्य'
  },
  {
    id: 20,
    title: 'शिवराज्याभिषेक सोहळा (६ जून १६७४) — समकालीन भित्तीचित्र',
    category: 'history',
    image: '/assets/images/real-shivaji-coronation.jpg',
    desc: 'काशीचे गागाभट्ट आणि सह्याद्रीतील शेकडो सरदारांच्या उपस्थितीत दुर्गराज रायगडावर संपन्न झालेला सुवर्ण राज्याभिषेक. परकीय मुघल व सुलतानशाहीच्या जोखडातून मुक्ती देत स्वतंत्र सार्वभौम लोककल्याणकारी हिंदवी स्वराज्य अस्तित्वात आल्याची ही जागतिक घोषणा होती.',
    tag: 'राज्याभिषेक'
  },
  {
    id: 21,
    title: 'अस्सल १८ वे शतक मराठा सैन्य युद्धमोहीम (Historical Fresco)',
    category: 'history',
    image: '/assets/images/real-maratha-army-panoramic.jpg',
    desc: 'वेगवान पागा (मराठा घोडदळ), तोफखाना, धारदार तलवारी व भाल्यांसह रणांगणात उतरणाऱ्या मराठा सेनेचे समकालीन दुर्मिळ भित्तीचित्र. मराठ्यांच्या या गनिमी काव्याने आणि शिस्तीने मुघल, अब्दाली आणि युरोपियन सैन्यांना धडकी भरवली होती.',
    tag: 'युद्धमोहीम'
  },
  {
    id: 22,
    title: 'मराठा घोडदळ शिलेदार (The Legendary Maratha Sowar)',
    category: 'history',
    image: '/assets/images/real-maratha-sowar.jpg',
    desc: 'भीमथडी तट्टू घोड्यावर मांड ठोकून २४ तासांत १०० मैलांचे अंतर कापणारा मराठा शिलेदार! अंगात जाळीदार चिलखत, हातात लांब बर्ची (भाला), कमरेला मराठा धोप तलवार आणि पाठीवर ढालीचा भार सांभाळत मुघल छावण्यांवर वादळासारखे तुटून पडणारे हे स्वार मराठा साम्राज्याचा खरा वेग होते.',
    tag: 'मराठा पागा'
  },
  {
    id: 23,
    title: 'पुणे शनिवार वाडा — पेशवाई सत्तेचे राजधानी केंद्र',
    category: 'history',
    image: '/assets/images/real-pune-shaniwarwada.jpg',
    desc: '१० जानेवारी १७३० रोजी श्रीमंत थोरले बाजीराव पेशव्यांनी पायाभरणी केलेला ऐतिहासिक वाडा. अणकुचीदार खिळे असलेला उत्तरेकडील दिल्ली दरवाजा, मस्तानी दरवाजा, गणेश महाल आणि कारंजे — जिथून संपूर्ण हिंदुस्थानचे राजकारण नियंत्रित केले जात असे.',
    tag: 'पेशवाई केंद्र'
  },
  {
    id: 24,
    title: 'सरखेल कान्होजी आंग्रे — अजिंक्य मराठा आरमार प्रमुख',
    category: 'history',
    image: '/assets/images/real-kanhoji-angre.jpg',
    desc: 'भारतीय आरमाराचे आद्य पितामह सरखेल कान्होजी आंग्रे! कुलाबा (अलिबाग), विजयदुर्ग व खांदेरी-उंदेरी बंदरांवरून त्यांनी इंग्रज, डच आणि पोर्तुगीज आरमारी जहाजांना तब्बल ३० वर्षे समुद्रात एकही लढाई न हरता पराभूत केले आणि स्वराज्याचा भगवा समुद्रावर सदैव फडकत ठेवला.',
    tag: 'आरमार पितामह'
  }
];

export default function PhotoGalleryPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [lightboxItem, setLightboxItem] = useState(null);

  const filteredItems = activeTab === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeTab);

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #C73800, #E65100)',
          borderRadius: '16px',
          color: '#fff',
          padding: '32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(199,56,0,0.2)'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
              📸 मराठा वारसा व चित्रदालन
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '10px 0 6px', fontFamily: 'Baloo 2' }}>
              ऐतिहासिक छायाचित्र दालन व सांस्कृतिक वारसा (Gallery)
            </h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '1.05rem', maxWidth: '65ch' }}>
              सह्याद्रीचे ३५०+ अभेद्य गडकोट, शिवकालीन नाणी, राजमुद्रा, मराठा आरमार आणि सण-उत्सवांचे विहंगम दृश्य दालन.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/forts" className="btn btn-primary" style={{ background: '#fff', color: '#C73800', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
              🏰 ३५०+ गडकोट नकाशा
            </Link>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '28px', paddingBottom: '6px' }}>
          {[
            { id: 'all', label: 'सर्व छायाचित्रे (२४) 🖼️' },
            { id: 'forts', label: 'दुर्गराज व गडकिल्ले (८) 🏰' },
            { id: 'symbols', label: 'राजमुद्रा व शस्त्रागार (४) 🪙' },
            { id: 'culture', label: 'मंदिरे, वारी व निसर्ग (६) 🛕' },
            { id: 'history', label: 'साम्राज्य व सेना (६) 🗺️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 22px',
                borderRadius: '30px',
                border: activeTab === tab.id ? '2px solid #C73800' : '1.5px solid #E6DDCE',
                background: activeTab === tab.id ? '#FFF1E8' : '#fff',
                color: activeTab === tab.id ? '#C73800' : '#4B5563',
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(199,56,0,0.15)' : 'none'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '26px', marginBottom: '44px' }}>
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setLightboxItem(item)}
              style={{
                background: '#fff',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1.5px solid #E6DDCE',
                boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(199,56,0,0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.05)';
              }}>
              {/* Image Container with Ambient Background & Proper Fit */}
              <div style={{ height: '240px', overflow: 'hidden', position: 'relative', background: '#1A0B05' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: (item.category === 'symbols' || item.image.includes('map')) ? 'contain' : 'cover',
                    objectPosition: (item.category === 'symbols' || item.image.includes('map')) ? 'center center' : 'center 35%',
                    transition: 'transform 0.4s ease',
                    display: 'block'
                  }}
                  onError={(e) => { e.target.src = '/assets/images/real-raigad-panoramic.jpg'; }}
                />
                
                {/* Tag Badge */}
                {item.tag && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'rgba(38, 10, 8, 0.85)',
                    color: '#FED7AA',
                    border: '1px solid rgba(228, 162, 82, 0.4)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    letterSpacing: '0.3px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {item.tag}
                  </div>
                )}

                {/* Enlarge Hint */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  backdropFilter: 'blur(4px)'
                }}>
                  🔍 पूर्ण दृश्य
                </div>
              </div>

              {/* Content Description */}
              <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{
                  fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                  fontSize: '1.24rem',
                  color: '#2A0808',
                  margin: '0 0 8px',
                  fontWeight: 800,
                  lineHeight: 1.35
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '0.88rem',
                  color: '#57534E',
                  margin: 0,
                  lineHeight: 1.6,
                  fontWeight: 500,
                  flexGrow: 1
                }}>
                  {item.desc}
                </p>
                <div style={{ marginTop: '14px', color: '#C73800', fontSize: '0.82rem', fontWeight: 800 }}>
                  क्लिक करून मोठे चित्र पहा →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cultural Deep-Dive Strip */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#C73800', margin: '0 0 20px', fontFamily: 'Baloo 2', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🚩</span> स्वराज्य प्रतीके व ऐतिहासिक वारसा
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px' }}>
            {/* Card 1: Rajmudra */}
            <div style={{
              background: '#FFF8F2',
              borderRadius: '14px',
              border: '1px solid #FFCC80',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(199,56,0,0.06)'
            }}>
              <div style={{ height: '170px', background: '#1A0B05', position: 'relative', overflow: 'hidden' }}>
                <img
                  src="/assets/images/real-rajmudra-seal.jpg"
                  alt="छत्रपती शिवरायांची राजमुद्रा"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }}
                />
                <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(38,10,8,0.85)', color: '#FED7AA', padding: '3px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                  सार्वभौम प्रतीक
                </span>
              </div>
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.18rem', color: '#C73800', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src="/assets/images/real-rajmudra-seal.jpg"
                    alt="राजमुद्रा चिन्ह"
                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #C73800' }}
                  />
                  छत्रपती शिवरायांची राजमुद्रा
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                  <strong>प्रतिपच्चंद्रलेखेव वर्धिष्णुर्विश्ववंदिता शाहसूनोः शिवस्यैषा मुद्रा भद्राय राजते।</strong><br />
                  प्रतिपदेच्या चंद्रकलेप्रमाणे दिवसेंदिवस वृद्धिंगत होणारी आणि संपूर्ण विश्वाला वंदनीय ठरणारी शहाजीपुत्र शिवाजींची ही राजमुद्रा लोककल्याणासाठी अधिराज्य गाजवते. शिवरायांच्या अष्टकोनी राजमुद्रेने प्रजेच्या कल्याणाची आणि सार्वभौम हिंदवी स्वराज्याची स्वतंत्र राजसत्ता स्थापन केली.
                </p>
              </div>
            </div>

            {/* Card 2: Bhagwa Dhwaj */}
            <div style={{
              background: '#FFF8F2',
              borderRadius: '14px',
              border: '1px solid #FFCC80',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(199,56,0,0.06)'
            }}>
              <div style={{ height: '170px', background: '#2A0E08', position: 'relative', overflow: 'hidden' }}>
                <img
                  src="/assets/images/real-bhagwa-dhwaj.svg"
                  alt="जरीपटक व भगवा ध्वज"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '16px' }}
                />
                <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(38,10,8,0.85)', color: '#FED7AA', padding: '3px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                  स्वराज्य ध्वज
                </span>
              </div>
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.18rem', color: '#C73800', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🚩</span> जरीपटक व भगवा ध्वज
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                  स्वराज्याचे सार्वभौम प्रतीक आणि सह्याद्रीच्या बलिदानाचे जळजळीत तेज! दोन टोकांचा हा भगवा ध्वज त्याग, पराक्रम, धर्म आणि स्वातंत्र्याचे सर्वोच्च प्रतीक आहे. पेशवे आणि मराठा सरदारांनी हाच भगवा झेंडा अटकेपार सिंधू नदीच्या तीरावर आणि दिल्लीच्या लाल किल्ल्यावर स्वाभिमानाने फडकवून संपूर्ण हिंदुस्थानवर मराठ्यांचे वर्चस्व सिद्ध केले.
                </p>
              </div>
            </div>

            {/* Card 3: Maratha Navy */}
            <div style={{
              background: '#FFF8F2',
              borderRadius: '14px',
              border: '1px solid #FFCC80',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(199,56,0,0.06)'
            }}>
              <div style={{ height: '170px', background: '#0D1B2A', position: 'relative', overflow: 'hidden' }}>
                <img
                  src="/assets/images/navy/maratha_navy_hero.jpg"
                  alt="भारतीय आरमाराचे जनक"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = '/assets/images/real-sindhudurg-fort.jpg'; }}
                />
                <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(13,27,42,0.85)', color: '#93C5FD', padding: '3px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700 }}>
                  सागरी आरमार
                </span>
              </div>
              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.18rem', color: '#C73800', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚓</span> भारतीय आरमाराचे जनक
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#4B5563', lineHeight: 1.65, margin: 0 }}>
                  'ज्याचा समुद्र त्याचा देश' हे मर्म ओळखून छत्रपती शिवाजी महाराजांनी भारताचे पहिले स्वदेशी आरमार स्थापन केले. सिंधुदुर्ग, विजयदुर्ग, सुवर्णदुर्ग व पद्मदुर्ग यांसारखे जलदुर्ग उभारले; गुराब, गलबत, पाल, मचवा अशी शेकडो लढाऊ जहाजे सज्ज करून इंग्रज, पोर्तुगीज व सिद्दी यांच्या आरमारी आक्रमणांना समुद्रावरच थोपवून ठेवले.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {lightboxItem && (
          <div
            onClick={() => setLightboxItem(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', borderRadius: '16px', maxWidth: '800px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
              <div style={{ height: '480px', background: '#000' }}>
                <img src={lightboxItem.image} alt={lightboxItem.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#C73800' }}>{lightboxItem.title}</h3>
                  <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>{lightboxItem.desc}</p>
                </div>
                <button onClick={() => setLightboxItem(null)} style={{ background: '#C73800', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>बंद करा ✕</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
