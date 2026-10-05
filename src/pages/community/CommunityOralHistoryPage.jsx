import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SOURCE_TIERS, CONFIDENCE_LEVELS } from '../../data/heritageKnowledgeGraph';

const INITIAL_COMMUNITY_STORIES = [
  {
    id: 'oral_01',
    title: 'पाचाड येथील जिजाऊ वाड्याची विहीर व भुयारी पाण्याचा झरा',
    author: 'बाळकृष्ण मोरे (वय ७८ वर्षे, स्थानिक रहिवासी)',
    village: 'पाचाड, जि. रायगड',
    category: 'स्थानिक लोककथा / आख्यायिका',
    submissionDate: '१४ ऑगस्ट २०२६',
    narrative: 'आमच्या आजोबांनी सांगितल्यानुसार, जिजाऊ वाड्यातून गडावरील गुप्त पहारेकऱ्यांना पाणी व संदेश पोहोचवण्यासाठी एका विशिष्ट नैसर्गिक झऱ्याचा वापर केला जाई. आजही त्या विहिरीचे पाणी बाराही महिने अत्यंत स्वच्छ, शीतल आणि गोड राहते.',
    sourceType: 'पाचाड ग्रामपंचायत दप्तर व स्थानिक मौखिक परंपरा',
    confidence: CONFIDENCE_LEVELS.COMMUNITY,
    tier: SOURCE_TIERS.TIER_4,
    status: 'सत्यापित (Community Verified)'
  },
  {
    id: 'oral_02',
    title: 'पावनखिंडीच्या युद्धातील घोडखिंडीचे स्थानिक वाटाडे',
    author: 'तानाजीराव खोत (वय ८२ वर्षे)',
    village: 'पांढरेपाणी (शाहूवाडी), जि. कोल्हापूर',
    category: 'स्थानिक लोककथा / आख्यायिका',
    submissionDate: '२१ जुलै २०२६',
    narrative: 'बाजीप्रभू देशपांडे आणि शिवा काशिद यांनी सिद्धी जौहरच्या सैन्याला खिंडीत अडवण्यापूर्वी स्थानिक धनगर बांधवांनी जंगलातील चोरवाटा दाखवल्या होत्या. त्या दुर्गम वाटेला आजही स्थानिक गावकरी अभिमानाने "मावळ्यांची वाट" म्हणून संबोधतात.',
    sourceType: 'विशाळगड परिसर स्थानिक कुटुंब नोंदी व मौखिक गाणी',
    confidence: CONFIDENCE_LEVELS.COMMUNITY,
    tier: SOURCE_TIERS.TIER_4,
    status: 'सत्यापित (Community Verified)'
  },
  {
    id: 'oral_03',
    title: 'किल्ले वासोटा परिसरातील चकवा आख्यायिका व गुराख्यांची लोककथा',
    author: 'आनंदराव मोरे (जावळी, सातारा)',
    village: 'बामणोली / वासोटा पायथा, जि. सातारा',
    category: 'स्थानिक लोककथा / आख्यायिका',
    submissionDate: '१४ ऑगस्ट २०२६',
    narrative: 'माझ्या पणजोबांच्या सांगण्यानुसार, वासोटा किल्ल्याच्या घनदाट जंगलात रात्रीच्या वेळी चकवा पडायचा. त्या वेळी गावातील वयस्कर लोक झाडांच्या पानांकडे व ताऱ्यांकडे पाहून दिशा ठरवत असत. कोयना खोऱ्यातील शिवकालीन मावळ्यांच्या शौर्याच्या अनेक मौखिक गोष्टी आमच्या भागात आजही शेकोटीभोवती रंगतात.',
    sourceType: 'आजोबांकडून ऐकलेली मौखिक परंपरा',
    confidence: CONFIDENCE_LEVELS.COMMUNITY,
    tier: SOURCE_TIERS.TIER_4,
    status: 'समीक्षित (Reviewed by Editorial Team)'
  },
  {
    id: 'oral_04',
    title: 'आंगणेवाडी भराडीदेवी मंदिराच्या जत्रेतील कौल लावण्याची १५० वर्षांची परंपरा',
    author: 'सुधाकर आंगणे (मालवण)',
    village: 'आंगणेवाडी, जि. सिंधुदुर्ग',
    category: 'स्थानिक श्रद्धा व परंपरा',
    submissionDate: '२ फेब्रुवारी २०२६',
    narrative: 'आमच्या गावात भराडीदेवीच्या जत्रेची तारीख पंचांग पाहून ठरत नाही, तर आंगणे कुटुंबीय एकत्र येऊन देवीचा कौल घेतात. कौल मिळाल्यावरच अवघ्या दीड दिवसांची जत्रा जाहीर होते. ही प्रथा आमच्या दप्तरात १८७० सालापासून अखंड नोंदवलेली आढळते.',
    sourceType: 'कौटुंबिक हस्तलिखित नोंदवही व प्रत्यक्ष परंपरा',
    confidence: CONFIDENCE_LEVELS.TRADITIONAL,
    tier: SOURCE_TIERS.TIER_4,
    status: 'समीक्षित (Verified Tradition)'
  },
  {
    id: 'oral_05',
    title: 'विदर्भातील पोळा सणात बैलांच्या झुलवर काढली जाणारी पारंपरिक चित्रे',
    author: 'गणेशराव देशमुख (अमरावती)',
    village: 'चांदूर बाजार, जि. अमरावती',
    category: 'लोककला व शेती संस्कृती',
    submissionDate: '२० सप्टेंबर २०२५',
    narrative: 'वऱ्हाडात पोळ्याच्या दिवशी सर्जा-राजाच्या अंगावर हिंगूळ आणि नीळ वापरून मारुती, मोर व सूर्यफुलांची चित्रे हाताने रंगवली जातात. याला ‘तोरण बांधणे’ म्हणतात. ही कला शेती संस्कृतीतील कृतज्ञतेची अद्वितीय लोकपरंपरा आहे.',
    sourceType: 'स्थानिक शेतकरी कुटुंबातील प्रत्यक्ष अनुभव',
    confidence: CONFIDENCE_LEVELS.COMMUNITY,
    tier: SOURCE_TIERS.TIER_4,
    status: 'समीक्षित'
  },
  {
    id: 'oral_06',
    title: 'कानबाई उत्सव व तापी खोऱ्यातील मौखिक अहिराणी लोकगीते',
    author: 'सौ. सुशीलाबाई पाटील (धुळे)',
    village: 'शिरपूर, जि. धुळे',
    category: 'लोककला व पारंपरिक खेळ',
    submissionDate: '१२ ऑगस्ट २०२६',
    narrative: 'श्रावण महिन्यातील कानबाईच्या उत्सवात खान्देशात रात्रभर जागरण करून तापी मातेचे आणि कानबाईचे अहिराणी बोलीतील मौखिक पद गाईले जातात. हे गीत कोणत्याही पुस्तकात न लिहिता आजीकडून नातीकडे मुखोद्गत पद्धतीने पिढ्यान्पिढ्या चालत आले आहे.',
    sourceType: 'खान्देशी मौखिक अहिराणी गीते व लोकसंस्कृती',
    confidence: CONFIDENCE_LEVELS.TRADITIONAL,
    tier: SOURCE_TIERS.TIER_4,
    status: 'समीक्षित (Reviewed)'
  },
  {
    id: 'oral_07',
    title: 'पैठणच्या गोदावरी तीरावरील संतांच्या मौखिक ओव्या व बखर परंपरा',
    author: 'केशवराव जोशी (पैठण)',
    village: 'पैठण, जि. छत्रपती संभाजीनगर',
    category: 'कौटुंबिक बखर / दस्तऐवज',
    submissionDate: '५ मे २०२६',
    narrative: 'पैठणमध्ये संत एकनाथ महाराजांच्या वाड्यात पहाटे जात्यावर दळताना गायल्या जाणाऱ्या ओव्या आजही जुन्या घरांमध्ये कानी पडतात. यात पैठणच्या सातवाहन काळापासूनच्या आणि छत्रपती शिवरायांच्या काळातील गोदाकाठच्या लोकजीवनाची अनेक मौखिक वर्णने मिळतात.',
    sourceType: 'गोदाकाठच्या जात्यावरील ओव्या व मौखिक संग्रह',
    confidence: CONFIDENCE_LEVELS.COMMUNITY,
    tier: SOURCE_TIERS.TIER_4,
    status: 'समीक्षित (Reviewed)'
  },
  {
    id: 'oral_08',
    title: 'किल्ले पुरंदर व मुरारबाजी देशपांडे यांचे मावळ्यांच्या मुखातील वीरगीत',
    author: 'रामचंद्र जगताप (वय ७५ वर्षे)',
    village: 'सासवड / पुरंदर पायथा, जि. पुणे',
    category: 'स्थानिक लोककथा / आख्यायिका',
    submissionDate: '१८ जून २०२६',
    narrative: 'दिलेरखानाविरुद्ध लढताना मुरारबाजींनी दाखवलेल्या अचाट शौर्यावर जुन्या मावळ्यांनी रचलेला एक दुर्मिळ मौखिक पोवाडा आमच्या वाड्यातील जुनी मंडळी खड्या आवाजात गात असत. "नाही झुकणार गड, नाही हटणार पाय" ही त्यातील लोकधून अजूनही पुरंदर खोऱ्यात जिवंत आहे.',
    sourceType: 'पुरंदर खोऱ्यातील परंपरागत शाहीर परंपरा',
    confidence: CONFIDENCE_LEVELS.COMMUNITY,
    tier: SOURCE_TIERS.TIER_4,
    status: 'सत्यापित (Community Verified)'
  },
  {
    id: 'oral_09',
    title: 'झाडीपट्टी लोकनाट्य व दंडारची १०० वर्षांची मौखिक परंपरा',
    author: 'नामदेवराव मेश्राम व बाबाराव बोधले',
    village: 'आरमोरी, जि. गडचिरोली',
    category: 'लोककला व पारंपरिक खेळ',
    submissionDate: '२८ फेब्रुवारी २०२६',
    narrative: 'विदर्भातील झाडीपट्टी भागात दिवाळीनंतर होणाऱ्या दंडार लोकनाट्यात रामायण-महाभारताच्या प्रसंगांसोबतच गोंडराजे आणि स्थानिक मराठा सरदारांच्या पराक्रमाच्या मौखिक आख्यायिका रात्रभर रंगभूमीवर गायल्या जातात.',
    sourceType: 'झाडीपट्टी मौखिक संवाद व लोकगीत संग्रह',
    confidence: CONFIDENCE_LEVELS.COMMUNITY,
    tier: SOURCE_TIERS.TIER_4,
    status: 'समीक्षित (Reviewed)'
  },
  {
    id: 'oral_10',
    title: 'कान्होजी आंग्रे यांच्या आरमारातील दर्यावर्दी आख्यायिका व सागरी पाहरे',
    author: 'प्रभाकर केळुसकर (वय ८० वर्षे)',
    village: 'विजयदुर्ग (देवगड), जि. सिंधुदुर्ग',
    category: 'स्थानिक लोककथा / आख्यायिका',
    submissionDate: '१० एप्रिल २०२६',
    narrative: 'विजयदुर्ग आणि कुलाबा किल्ल्याच्या आजूबाजूला समुद्रात खडक कुठे आहेत आणि भरती-ओहोटीत गलबते कशी वळवायची, याच्या खाचखळग्यांची माहिती आंग्र्यांच्या दर्यावर्दींनी मौखिक श्लोक आणि सागरी गाण्यांत साठवली होती, जी खलाशांच्या पिढ्यांनी तोंडपाठ ठेवली होती.',
    sourceType: 'विजयदुर्ग मच्छीमार व दर्यावर्दी मौखिक स्मृती',
    confidence: CONFIDENCE_LEVELS.TRADITIONAL,
    tier: SOURCE_TIERS.TIER_4,
    status: 'सत्यापित (Community Verified)'
  },
  {
    id: 'oral_11',
    title: 'शिवकालीन तोफगोळे निर्मितीचा वाई परिसरातील लोहार कारखाना',
    author: 'संजयराव मोहिते (इतिहास अभ्यासक)',
    village: 'वाई (कृष्णाकाठ), जि. सातारा',
    category: 'कौटुंबिक बखर / दस्तऐवज',
    submissionDate: '२३ सप्टेंबर २०२६',
    narrative: 'वाई येथील कृष्णा नदीकाठच्या जुन्या पेठेत शिवकाळात तोफांचे लोखंडी गोळे आणि घोड्यांच्या नाला तयार केल्या जात असल्याची नोंद जुन्या बखरीत आढळते. येथील लोहार गल्लीतील जुनी भट्टी आजही इतिहासाची साक्ष देते.',
    sourceType: 'वाई पेठ मौखिक कुटुंब परंपरा व जुनी दप्तरे',
    confidence: CONFIDENCE_LEVELS.COMMUNITY,
    tier: SOURCE_TIERS.TIER_4,
    status: 'पडताळणी अंतर्गत (Community Review)'
  },
  {
    id: 'oral_12',
    title: 'तोरणा किल्ल्याच्या झुंजार माचीवरील गुप्त पाण्याचे टाके व पहारेकरी परंपरा',
    author: 'दत्तात्रय निगडे (वेल्हे, पुणे)',
    village: 'वेल्हे बुद्रुक, जि. पुणे',
    category: 'स्थानिक लोककथा / आख्यायिका',
    submissionDate: '८ मे २०२६',
    narrative: 'तोष्टा-तोरणावरील झुंजार माचीवर एका अत्यंत अरुंद कातळात बारमाही गोड पाण्याचे गुप्त टाके आहे. शिवाजी महाराजांच्या काळात झुंजार पहारेकरी या टाक्यावर सलग अनेक दिवस पहारा देत असत, अशी मौखिक गाणी वेल्हे खोऱ्यात गुराखी पिढ्यानपिढ्या गातात.',
    sourceType: 'वेल्हे खोऱ्यातील गुराख्यांची तोंडी परंपरा',
    confidence: CONFIDENCE_LEVELS.COMMUNITY,
    tier: SOURCE_TIERS.TIER_4,
    status: 'सत्यापित (Community Verified)'
  },
  {
    id: 'oral_13',
    title: 'माहूरच्या रेणुकादेवी गडावरील दीपमाळा प्रज्वलन व गोंधळी परंपरा',
    author: 'महादेवराव कदम (नांदेड)',
    village: 'माहूर गड, जि. नांदेड',
    category: 'ग्रामदैवत पूजा परंपरा',
    submissionDate: '१५ मार्च २०२६',
    narrative: 'माहूर गडावर नवरात्रात पारंपरिक गोंधळी घराण्यांकडून संबळ व तुणतुण्याच्या तालावर गायले जाणारे मौखिक जोगवे आणि शक्तिपीठाची आख्यायिका ही केवळ मराठवाड्यातच नव्हे तर संपूर्ण महाराष्ट्रात श्रद्धेचा विषय आहे. यात अनेक जुन्या शिवकालीन वीरांचे चरण समाविष्ट आहेत.',
    sourceType: 'पारंपरिक माहूर गोंधळी मौखिक पदसंग्रह',
    confidence: CONFIDENCE_LEVELS.TRADITIONAL,
    tier: SOURCE_TIERS.TIER_4,
    status: 'समीक्षित (Reviewed)'
  },
  {
    id: 'oral_14',
    title: 'सिंधुदुर्ग किल्ल्याच्या तटबंदीतील नारळाच्या खोबऱ्याची व चुन्याची सांधणी',
    author: 'रत्नाकर सावंत (मालवण)',
    village: 'किल्ले सिंधुदुर्ग, जि. सिंधुदुर्ग',
    category: 'स्थानिक लोककथा / आख्यायिका',
    submissionDate: '२५ जानेवारी २०२६',
    narrative: 'समुद्राच्या लाटा झेलणाऱ्या सिंधुदुर्गच्या पायाभरणीत चुना, गूळ, शिसे आणि लाख यांसोबतच नारळाच्या खोबऱ्याचे तेल वापरून दगड सांधले गेले, ज्यामुळे ३५० वर्षे लाटांचा मारा सोसूनही ही तटबंदी अभेद्य उभी आहे, अशी दर्यावर्दींची अखंड मौखिक श्रद्धा आहे.',
    sourceType: 'मालवण बंदर मच्छीमार व स्थानिक रहिवासी मौखिक स्मृती',
    confidence: CONFIDENCE_LEVELS.COMMUNITY,
    tier: SOURCE_TIERS.TIER_4,
    status: 'सत्यापित (Community Verified)'
  }
];

export default function CommunityOralHistoryPage() {
  const [stories, setStories] = useState(INITIAL_COMMUNITY_STORIES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch oral history stories from backend on mount & strictly deduplicate
  useEffect(() => {
    fetch('/api/culture/oral-history')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const apiStories = data.data.map(item => ({
            id: item.id || `oral_${Math.random()}`,
            title: item.title,
            author: item.contributor || item.author || 'अनामिक इतिहासप्रेमी',
            village: item.village ? (item.district ? `${item.village}, जि. ${item.district}` : item.village) : 'महाराष्ट्र',
            category: item.category || item.tier || 'स्थानिक लोककथा / आख्यायिका',
            submissionDate: item.dateSubmitted || 'सप्टेंबर २०२६',
            narrative: item.story || item.narrative,
            sourceType: item.historicalReference || item.sourceType || 'मौखिक कुटुंब परंपरा',
            confidence: CONFIDENCE_LEVELS.COMMUNITY,
            tier: SOURCE_TIERS.TIER_4,
            status: item.status || 'समीक्षित'
          }));

          // Strict deduplication by trimmed title to eliminate repeated entries
          const map = new Map();
          [...apiStories, ...INITIAL_COMMUNITY_STORIES].forEach(s => {
            const key = (s.title || '').trim().toLowerCase();
            if (key && !map.has(key)) {
              map.set(key, s);
            }
          });
          setStories(Array.from(map.values()));
        }
      })
      .catch(err => {
        console.log('Backend oral history using local dataset:', err.message);
      });
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    village: '',
    category: 'स्थानिक लोककथा / आख्यायिका',
    sourceType: 'आजोबांकडून ऐकलेली मौखिक परंपरा',
    narrative: '',
    agreedToTier4: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.narrative || !formData.author) {
      alert('कृपया सर्व आवश्यक माहिती भरा.');
      return;
    }

    const newStory = {
      id: `comm_${Date.now()}`,
      title: formData.title,
      author: formData.author,
      village: formData.village || 'महाराष्ट्र',
      category: formData.category,
      submissionDate: 'आज',
      narrative: formData.narrative,
      sourceType: formData.sourceType,
      confidence: CONFIDENCE_LEVELS.COMMUNITY,
      tier: SOURCE_TIERS.TIER_4,
      status: 'संपादकीय पुनरावलोकनाधीन (Under Review)'
    };

    // Optimistic UI update without duplicates
    setStories(prev => [newStory, ...prev.filter(s => s.title !== newStory.title)]);
    setShowSuccessModal(true);

    // Persist to backend database
    try {
      await fetch('/api/culture/oral-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          village: formData.village,
          contributor: formData.author,
          story: formData.narrative,
          historicalReference: formData.sourceType
        })
      });
    } catch (err) {
      console.warn('Could not persist oral history to backend:', err.message);
    }

    setFormData({
      title: '',
      author: '',
      village: '',
      category: 'स्थानिक लोककथा / आख्यायिका',
      sourceType: 'आजोबांकडून ऐकलेली मौखिक परंपरा',
      narrative: '',
      agreedToTier4: false
    });
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      
      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #7C1D05 0%, #B91C1C 60%, #E65100 100%)',
        color: '#FFFFFF',
        padding: '48px 20px 36px',
        borderBottom: '4px solid #F59E0B'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.85rem', marginBottom: '14px' }}>
            <span>📜 CONNECT MARATHA</span>
            <span>•</span>
            <span>समुदाय मौखिक इतिहास व लोककथा दालन</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
            मौखिक इतिहास व गाव आख्यायिका संकलन
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '850px', opacity: 0.95, lineHeight: 1.6, marginBottom: '20px' }}>
            आपल्या गावाचा, घराण्याचा किंवा परिसराचा अलिखित इतिहास, जुन्या पिढीकडून ऐकलेल्या गोष्टी व लोकपरंपरा जतन करा. 
            येथे प्रत्येक नोंदीला अधिकृतपणे <strong>'Tier 4: मौखिक परंपरा / लोकसमज'</strong> चा पारदर्शक दर्जा दिला जातो.
          </p>

          <button
            onClick={() => setIsSubmitting(!isSubmitting)}
            style={{
              background: '#F59E0B',
              color: '#78350F',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            {isSubmitting ? '✕ फॉर्म बंद करा' : '✍️ आपली कथा / मौखिक नोंद पाठवा'}
          </button>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px' }}>

        {/* Success Modal */}
        {showSuccessModal && (
          <div style={{
            background: '#ECFDF5',
            border: '2px solid #10B981',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 800, color: '#065F46', fontSize: '1.1rem' }}>
                🎉 आपली मौखिक नोंद यशस्वीरीत्या नोंदवली गेली आहे!
              </div>
              <div style={{ color: '#047857', fontSize: '0.9rem', marginTop: '4px' }}>
                ही नोंद पारदर्शकतेसाठी 🟣 Tier 4 (समुदाय योगदान) म्हणून प्रकाशित केली आहे. इतिहास अभ्यासक याच्या पुराव्यांची तपासणी करतील.
              </div>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{ background: '#10B981', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              समजले
            </button>
          </div>
        )}

        {/* Submission Form (Toggleable) */}
        {isSubmitting && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '2px solid #F59E0B',
            padding: '32px',
            marginBottom: '40px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '1.5rem', color: '#7C1D05', fontWeight: 800, marginBottom: '6px' }}>
              ✍️ मौखिक इतिहास / स्थानिक आख्यायिका नोंदवा
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '20px' }}>
              कृपया शक्य तितकी खरी व वडिलोपार्जित माहिती नोंदवा. कनेक्ट मराठा ऐतिहासिक सत्यता व लोकपरंपरा यातील फरक स्पष्ट राखते.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    शीर्षक / कथेचे नाव *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="उदा. आमच्या गावातील शिवकालीन विहीर व आख्यायिका"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    आपले नाव व संपर्क *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="उदा. राहुल पाटील, पुणे"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    गाव / तालुका / जिल्हा
                  </label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="उदा. किल्ले रोहिडा पायथा, भोर, पुणे"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    नोंदीचा प्रकार
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  >
                    <option value="स्थानिक लोककथा / आख्यायिका">स्थानिक लोककथा / आख्यायिका</option>
                    <option value="कौटुंबिक बखर / दस्तऐवज">कौटुंबिक बखर / जुना दस्तऐवज</option>
                    <option value="ग्रामदैवत पूजा परंपरा">ग्रामदैवत पूजा व यात्रा परंपरा</option>
                    <option value="लोककला व पारंपरिक खेळ">लोककला, लोकगीत किंवा पारंपरिक खेळ</option>
                    <option value="स्वातंत्र्य लढा आठवणी">स्वातंत्र्य लढा / संयुक्त महाराष्ट्र आठवणी</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  माहितीचा मूळ स्रोत (Source Type)
                </label>
                <input
                  type="text"
                  value={formData.sourceType}
                  onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                  placeholder="उदा. आजोबांकडून ऐकलेली कथा, गावचा जुना शिलालेख, मोडी लिपीतील कागद..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  सविस्तर हकीकत / माहिती (Narrative) *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.narrative}
                  onChange={(e) => setFormData({ ...formData, narrative: e.target.value })}
                  placeholder="आपल्याला माहिती असलेली संपूर्ण हकीकत येथे सविस्तर लिहा..."
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ background: '#FAF5FF', padding: '14px', borderRadius: '10px', border: '1px solid #F3E8FF', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <input
                  type="checkbox"
                  required
                  id="tier4_ack"
                  checked={formData.agreedToTier4}
                  onChange={(e) => setFormData({ ...formData, agreedToTier4: e.target.checked })}
                  style={{ marginTop: '3px' }}
                />
                <label htmlFor="tier4_ack" style={{ fontSize: '0.85rem', color: '#581C87', lineHeight: 1.5 }}>
                  <strong>मी मान्य करतो/करते:</strong> ही नोंद कनेक्ट मराठाच्या 'Tier 4: मौखिक परंपरा / समुदाय ज्ञान' अंतर्गत नोंदवली जाईल. 
                  शासकीय किंवा शैक्षणिक पुरावे उपलब्ध होईपर्यंत याला प्रमाणित इतिहास मानले जाणार नाही.
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsSubmitting(false)}
                  style={{ background: '#F3F4F6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ background: '#B91C1C', color: '#FFFFFF', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  नोंद सादर करा (Submit)
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Community Stories Feed (Original Single Column Vertical Feed Layout) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.6rem', color: '#7C1D05', fontWeight: 800 }}>
              प्रकाशित मौखिक नोंदी व लोककथा संग्रह ({stories.length})
            </h2>
            <span style={{ fontSize: '0.8rem', background: '#F3E8FF', color: '#7E22CE', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
              🟣 Tier 4: मौखिक इतिहास दालन
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {stories.map(st => (
              <div
                key={st.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #F3E8D8',
                  padding: '24px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                      {st.category}
                    </span>
                    <h3 style={{ fontSize: '1.3rem', color: '#7C1D05', fontWeight: 800, margin: '6px 0 2px' }}>
                      {st.title}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                      नोंदकर्ते: <strong>{st.author}</strong> ({st.village}) • दिनांक: {st.submissionDate}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{
                      background: st.confidence?.bg || '#faf5ff',
                      color: st.confidence?.color || '#9333ea',
                      border: `1px solid ${st.confidence?.color || '#d8b4fe'}`,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {st.confidence?.icon || '🟣'} {st.confidence?.label || 'समुदाय योगदान'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#7E22CE', fontWeight: 600 }}>
                      {st.tier?.badge || 'Tier 4: लोकपरंपरा'}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.92rem', color: '#374151', lineHeight: 1.6, background: '#FDFBF7', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #F59E0B' }}>
                  "{st.narrative}"
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '0.78rem', color: '#6B7280' }}>
                  <div>
                    <strong>स्रोत प्रकार:</strong> {st.sourceType}
                  </div>
                  <div style={{ color: '#15803D', fontWeight: 700 }}>
                    ✓ {st.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
