import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SHIVCHARITRA_SERIES } from '../common/GenericArticlePage';

// Complete Detailed Shivcharitra Kathan Episodes Data (15 Parts)
const SHIVCHARITRA_EPISODES_METADATA = [
  {
    num: 1,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-1',
    title: 'भाग १: यादवांचा अस्त, संतांचा आक्रोश, मालोजीराजे ते भातवडीचा रणसंग्राम (१६२४)',
    period: 'इ.स. १२९४ ते १६२४',
    heroImage: '/assets/images/real-maratha-army-panoramic.jpg',
    readTime: '४५ मिनिटे',
    summary: 'देवगिरीच्या यादव साम्राज्याचा अल्लाउद्दीन खिलजीने केलेला विश्वासघातकी अस्त, संतांची ३०० वर्षांची मूक वेदना, मालोजीराजे भोसले यांची वेरूळ ते घृष्णेश्वर भक्ती आणि १६२४ चा ऐतिहासिक भातवडी रणसंग्राम!',
    highlights: ['यादवांचा अस्त (१२९४)', 'संत ज्ञानेश्वर व एकनाथ आक्रोश', 'मालोजीराजे भोसले', 'भातवडीचा संग्राम (१६२४)']
  },
  {
    num: 2,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-2',
    title: 'भाग २: शहाजीराजे, जिजाऊंची स्वराज्य प्रेरणा व शिवनेरीवर शिवजन्माचा सुवर्णदिन',
    period: '१९ फेब्रुवारी १६३०',
    heroImage: '/assets/images/real-shivaji-portrait.jpg',
    readTime: '५० मिनिटे',
    summary: 'निजामशाहीचा अंत, जिजाऊंचे डोहाळे, सिंदखेडराजाची शिकवण आणि १९ फेब्रुवारी १६३० — शिवनेरीवर तोफांच्या कडकडाटात अवतरलेला सह्याद्रीचा शिवसूर्य!',
    highlights: ['शहाजीराजांची स्वतंत्र दृष्टी', 'सिंदखेडराजाचे संस्कार', 'शिवनेरी किल्ला', '१९ फेब्रुवारी १६३० शिवजन्म']
  },
  {
    num: 3,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-3',
    title: 'भाग ३: बाळ शिवबांचे शिक्षण, रोहिडेश्वराची स्वराज्य प्रतिज्ञा, तोरणा ते जावळी विजय',
    period: '१६४५ ते १६५०',
    heroImage: '/assets/images/fort-wall.jpg',
    readTime: '५५ मिनिटे',
    summary: 'पुण्यात सोन्याचा नांगर, दादोजी कोंडदेव, रायरेश्वराच्या गाभाऱ्यात रक्ताने घेतलेली हिंदवी स्वराज्याची शपथ, तोरणा किल्ल्यावर बांधलेले तोरण आणि चाकण ते कल्याण विजय.',
    highlights: ['सोन्याचा नांगर', 'रायरेश्वरावर रक्ताची शपथ', 'तोरणा दुर्ग विजय', 'स्वराज्याचे पहिले तोरण']
  },
  {
    num: 4,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-4',
    title: 'भाग ४: पुरंदरचा रणसंग्राम, फत्तेखानाचा पराभव, शहाजीराजांची सुटका व बाजी पासलकर',
    period: '१६४८ ते १६५५',
    heroImage: '/assets/images/battles/purandar.jpg',
    readTime: '५० मिनिटे',
    summary: 'आदिलशाही सेनापती फत्तेखानाचा पुरंदरवर हल्ला, बाजी पासलकरांचे असीम बलिदान, शहाजीराजांना विजापुरात झालेली अटक आणि शिवरायांची शहाजहानशी मुत्सद्देगिरी.',
    highlights: ['फत्तेखानाचा पुरंदर वेढा', 'बाजी पासलकरांचे हौतात्म्य', 'शहाजीराजांची कैदेतून सुटका', 'शहाजहानशी मुत्सद्देगिरी']
  },
  {
    num: 5,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-5',
    title: 'भाग ५: जावळीचा चंद्रराव मोरे, प्रतापगड दुर्ग निर्मिती व विजापुरात अफजलखानाचा विडा',
    period: '१६५६ ते १६५९',
    heroImage: '/assets/images/real-pratapgad-fort.jpg',
    readTime: '५० मिनिटे',
    summary: 'जावळीच्या घनदाट खोऱ्यात चंद्रराव मोऱ्यांचे पारपत्य, प्रतापगड दुर्गाची निर्मिती, विजापूर दरबारात बडी बेगमसमोर अफजलखानाने शिवरायांना जिवंत आणण्याचा उचललेला विडा!',
    highlights: ['जावळी विजय', 'प्रतापगड दुर्ग उभारणी', 'विजापुरात खलबते', 'अफजलखानाचा विडा']
  },
  {
    num: 6,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-6',
    title: 'भाग ६: तुळजापूर, पंढरपूर ते वाई; अफजलखानाचा चालून येणे, कान्होजी जेधे व कृष्णाजी भास्कर',
    period: 'मे ते ऑक्टोबर १६५९',
    heroImage: '/assets/images/battles/pratapgad.jpg',
    readTime: '५५ मिनिटे',
    summary: 'तुळजापूर व पंढरपुरातील मंदिरांची विटंबना करून महाराजांना चिथवण्याचा खानाचा डाव, कान्होजी जेध्यांची स्वामिनिष्ठा आणि कृष्णाजी भास्करमार्फत खानाला प्रतापगडाच्या जाळ्यात ओढणे.',
    highlights: ['तुळजापूर विटंबना', 'कान्होजी जेधे प्रतिज्ञापत्र', 'वकील कृष्णाजी भास्कर', 'प्रतापगडाचे आमंत्रण']
  },
  {
    num: 7,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-7',
    title: 'भाग ७: १० नोव्हेंबर १६५९: प्रतापगडाच्या पायथ्याशी अफजलखान वध, जिवा महाला व महाविजय',
    period: '१० नोव्हेंबर १६५९',
    heroImage: '/assets/images/warriors/shivakashid.jpg',
    readTime: '६० मिनिटे',
    summary: 'श्यामियान्यातील अलिंगन आणि दगाबाजी, वाघनखांचा कोथळा, "होता जिवा म्हणून वाचला शिवा", सय्यद बंडाचा खात्मा आणि अवघ्या दीड तासात १ लाख आदिलशाही सैन्याची दाणादाण!',
    highlights: ['१० नोव्हेंबर १६५९', 'वाघनखे व बिचवा', 'जिवा महाला पराक्रम', 'प्रतापगड महाविजय']
  },
  {
    num: 8,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-8',
    title: 'भाग ८: पन्हाळगडाचा वेढा, सिद्दी जोहर, शिवा काशिद यांचे प्रतिरूप व पावनखिंडीत बाजीप्रभूंचे अमर बलिदान',
    period: '१२-१३ जुलै १६६०',
    heroImage: '/assets/images/warriors/bajiprabhu.jpg',
    readTime: '६५ मिनिटे',
    summary: 'सिद्दी जोहरचा ९ महिन्यांचा वेढा, धो-धो पावसात पन्हाळ्यावरून निसटणे, वीर शिवा काशिद यांचे प्रतिरूप बलिदान आणि घोडखिंडीत बाजीप्रभू देशपांडे व ३०० बांदलांची महासमर!',
    highlights: ['पन्हाळा वेढा', 'शिवा काशिद समर्पण', 'घोडखिंड/पावनखिंड', 'तोफांचे तीन बार व बाजीप्रभू']
  },
  {
    num: 9,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-9',
    title: 'भाग ९: शाहिस्तेखानाचा पुण्यात तळ, चाकणच्या संग्रामदुर्गावर फिरंगोजी नरसाळांचा ५६ दिवसांचा लढा व जखमनामा दरबार',
    period: 'मे १६६० ते जाने १६६१',
    heroImage: '/assets/images/warriors/firangoji.jpg',
    readTime: '५५ मिनिटे',
    summary: 'शाहिस्तेखानाचा १ लाखांच्या फौजेसह पुण्यात प्रवेश, चाकणच्या भुईकोट किल्ल्यावर फिरंगोजी नरसाळांची ५६ दिवस अभूतपूर्व झुंज, खंडूजी खोपड्याला शासन आणि जखमनामा दरबार.',
    highlights: ['चाकण संग्रामदुर्ग', 'फिरंगोजी नरसाळा ५६ दिवस झुंज', 'खंडूजी खोपडे शासन', 'जखमनामा दरबार']
  },
  {
    num: 10,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-10',
    title: 'भाग १०: उंबरखिंडीत कारतलब-रायबागनचा दारुण पराभव, राजापूरची इंग्रज वखार ते लाल महालातील थरारक सर्जिकल स्ट्राईक',
    period: 'जाने १६६१ ते ६ एप्रिल १६६३',
    heroImage: '/assets/images/real-maratha-arms.jpg',
    readTime: '६५ मिनिटे',
    summary: 'उंबरखिंडीच्या ९ मैल अरुंद दरीत कारतलब खानाचा दारुण पराभव, राजापूर इंग्रज वखार कारवाई, बाळाजी आवजी चिटणीस भेट आणि ५ एप्रिल १६६३ चा लाल महाल सर्जिकल स्ट्राईक!',
    highlights: ['उंबरखिंड युद्ध', 'रायबागन सावित्रीबाई', '५ एप्रिल १६६३ लाल महाल', 'शाहिस्तेखानाची ३ बोटे छाटली']
  },
  {
    num: 11,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-11',
    title: 'भाग ११: सुरतेची ऐतिहासिक पहिली स्वारी, शहाजीराजांचे महाप्रयाण व मिर्झाराजे जयसिंग-दिलेरखानाची महामोहीम',
    period: 'जानेवारी १६६४ ते मार्च १६६५',
    heroImage: '/assets/images/real-sindhudurg-fort.jpg',
    readTime: '५७ मिनिटे',
    summary: 'जानेवारी १६६४ मधील सुरत मोहीम, १ कोटी रुपयांची संपत्ती, फादर ॲम्ब्रोजचा आदर, शहाजीराजांचे होदेगेरे येथे महाप्रयाण, जिजाऊंचे सती जाणे रोखणे, सिंधुदुर्ग जलदुर्ग व मिर्झाराजे जयसिंगाची प्रचंड मोहीम.',
    highlights: ['सुरतेची पहिली स्वारी', 'फादर ॲम्ब्रोज आदर', 'शहाजीराजे महाप्रयाण', 'जिजाऊंचे सती जाणे रोखले']
  },
  {
    num: 12,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-12',
    title: 'भाग १२: पुरंदरचा रणसंग्राम, मुरारबाजींचे अद्वितीय बलिदान व पुरंदरचा तह (१६६५)',
    period: 'जानेवारी ते सप्टेंबर १६६५',
    heroImage: '/assets/images/warriors/murarbaji.jpg',
    readTime: '६० मिनिटे',
    summary: 'कुडाळ विजय, सिंधुदुर्ग जलदुर्ग पायाभरणी, महाबळेश्वरात जिजाऊंची सुवर्णतुला, वज्रगड पाडाव, मुरारबाजी देशपांडे यांचे असीम शौर्य, सुलतान धावा आणि १२ जून १६६५ चा पुरंदर तह.',
    highlights: ['सिंधुदुर्ग पायाभरणी', 'जिजाऊंची सुवर्णतुला', 'मुरारबाजी देशपांडे बलिदान', '२३ किल्ले पुरंदरचा तह']
  },
  {
    num: 13,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-13',
    title: 'भाग १३: आग्रा दरबारातील महानाट्य, नजरकैदेतून अशक्य सुटका व मिठाईच्या पेट्या',
    period: 'जानेवारी ते ऑगस्ट १६६६',
    heroImage: '/assets/images/real-babasaheb-purandare.jpg',
    readTime: '६० मिनिटे',
    summary: '१२ मे १६६६ रोजी आग्रा दरबारात औरंगजेबाच्या समोर शिवरायांची सिंहगर्जना, रामसिंगाची जामीनकी, फौलादखानाचा वेढा आणि १७ ऑगस्ट १६६६ रोजी मिठाईच्या पेट्यांतून ऐतिहासिक पलायन.',
    highlights: ['१२ मे १६६६ आग्रा दरबार', 'बादशहाला पाठ दाखवली', 'हिरोजी फर्जंद व मदारी मेहतर', 'मिठाईच्या पेट्यांतून सुटका']
  },
  {
    num: 14,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-14',
    title: 'भाग १४: आग्र्याहून राजगडी पुनरागमन, सिंहगडावर तानाजींचे बलिदान व पन्हाळा विजय',
    period: 'ऑगस्ट १६६६ ते मार्च १६७३',
    heroImage: '/assets/images/warriors/tanaji.jpg',
    readTime: '६० मिनिटे',
    summary: '१२ सप्टेंबर १६६६ रोजी गोसावी वेशात राजगडी आगमन, ४ फेब्रुवारी १६७० चा सिंहगड संग्राम, सुभेदार तानाजी मालुसरे यांचे अमर बलिदान, "गड आला पण सिंह गेला" आणि ६ मार्च १६७३ चा कोंडाजी फर्जंदांचा पन्हाळा विजय.',
    highlights: ['राजगडी पुनरागमन', 'तानाजी मालुसरे व सिंहगड', 'गड आला पण सिंह गेला', 'कोंडाजी फर्जंद पन्हाळा']
  },
  {
    num: 15,
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-15',
    title: 'भाग १५: ६ जून १६७४: शिवराज्याभिषेक सोहळा — आनंदवनभुवन',
    period: 'जून १६७३ ते ६ जून १६७४',
    heroImage: '/assets/images/history/rajyabhishek.jpg',
    readTime: '६५ मिनिटे',
    summary: 'समर्थ रामदास स्वामींचे "निश्चयाचा महामेरू..." पत्र, छत्रसाल बुंदेला भेट, गागाभट्टांचे आगमन, ३२ मणांचे सुवर्णसिंहासन, ६ जून १६७४ चा ऐंद्र महाभिषेक, जिजाऊंचे जीवनसाफल्य आणि आनंदवनभुवन.',
    highlights: ['निश्चयाचा महामेरू पत्र', 'गागाभट्ट व रायगड', '३२ मणांचे सुवर्णसिंहासन', '६ जून १६७४ शिवराज्याभिषेक']
  }
];

export default function ShivcharitraKathanHubPage() {
  const [search, setSearch] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('सर्व');

  const filteredEpisodes = useMemo(() => {
    return SHIVCHARITRA_EPISODES_METADATA.filter(ep => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q ||
        ep.title.toLowerCase().includes(q) ||
        ep.summary.toLowerCase().includes(q) ||
        ep.highlights.some(h => h.toLowerCase().includes(q));
      return matchesSearch;
    });
  }, [search]);

  return (
    <div style={{ background: '#FDFBF7', minHeight: '100vh', paddingBottom: '90px' }}>
      {/* Breadcrumbs */}
      <div style={{ background: '#FAF5EE', borderBottom: '1px solid #EADCC8' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '12px 24px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
          <Link to="/" style={{ color: '#8C1D18', textDecoration: 'none', fontWeight: 600 }}>🏠 होम</Link>
          <span style={{ color: '#9CA3AF' }}>›</span>
          <Link to="/history" style={{ color: '#8C1D18', textDecoration: 'none', fontWeight: 600 }}>इतिहास व वारसा</Link>
          <span style={{ color: '#9CA3AF' }}>›</span>
          <Link to="/article" style={{ color: '#8C1D18', textDecoration: 'none', fontWeight: 600 }}>आलेख दालन</Link>
          <span style={{ color: '#9CA3AF' }}>›</span>
          <span style={{ fontWeight: 800, color: '#8C1D18' }}>शिवशाहीर बाबासाहेब पुरंदरे — शिवचरित्र कथन (समग्र १५ भाग)</span>
        </div>
      </div>

      {/* War Cry Banner */}
      <div style={{ background: 'linear-gradient(90deg, #3D0D0D, #8C1D18, #C73800)', color: '#FFF', textAlign: 'center', padding: '12px 16px', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
        🔥 || निश्चयाचा महामेरू | बहुत जनांसी आधारू | अखंड स्थितीचा निर्धारू | श्रीमंत योगी || 🔥
      </div>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1F0708 0%, #3D0D11 50%, #68171E 100%)',
        color: '#FFFFFF',
        padding: '60px 24px 50px',
        boxShadow: '0 8px 30px rgba(31,7,8,0.4)'
      }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: '#DD8A2E', color: '#1F0708', fontWeight: 800, fontSize: '0.82rem', padding: '5px 16px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
            🚩 पुरंदरे प्रकाशन अधिकृत समग्र व्याख्यानमाला
          </div>
          <h1 style={{ fontFamily: 'Baloo 2', fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', lineHeight: 1.15, color: '#FDE047', margin: '0 0 16px', fontWeight: 800 }}>
            शिवशाहीर बाबासाहेब पुरंदरे — शिवचरित्र कथन (१ ते १५ भाग समग्र महागाथा)
          </h1>
          <p style={{ fontSize: '1.2rem', maxWidth: '90ch', color: '#FDF3E6', lineHeight: 1.6, margin: '0 0 32px' }}>
            यादवांच्या अस्तापासून, शिवजन्माची मंगल पहाट, रोहिडेश्वराची प्रतिज्ञा, अफजलखान वध, पावनखिंड, लाल महाल छापा, सुरत स्वारी, पुरंदर संग्राम, आग्रा सुटका, सिंहगड ते ६ जून १६७४ चा भव्य शिवराज्याभिषेक सोहळा!
          </p>

          {/* Metrics Tiles */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 22px', borderRadius: '12px' }}>
              <b style={{ color: '#FDE047', fontSize: '1.4rem', display: 'block' }}>१५ भाग संपूर्ण</b>
              <span style={{ fontSize: '0.82rem', color: '#E6DDCE' }}>अखंड ओजस्वी महागाथा</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 22px', borderRadius: '12px' }}>
              <b style={{ color: '#FDE047', fontSize: '1.4rem', display: 'block' }}>१४+ तास</b>
              <span style={{ fontSize: '0.82rem', color: '#E6DDCE' }}>सखोल ऐतिहासिक वाचन</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 22px', borderRadius: '12px' }}>
              <b style={{ color: '#FDE047', fontSize: '1.4rem', display: 'block' }}>१६२४ ते १६७४</b>
              <span style={{ fontSize: '0.82rem', color: '#E6DDCE' }}>५० वर्षांचा समग्र कालपट</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 22px', borderRadius: '12px' }}>
              <b style={{ color: '#FDE047', fontSize: '1.4rem', display: 'block' }}>१००% अस्सल</b>
              <span style={{ fontSize: '0.82rem', color: '#E6DDCE' }}>बखरी व ऐतिहासिक साधने</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '36px 24px' }}>
        
        {/* Quick Numbers Jump Grid */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid #E6DDCE',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#3D0D0D' }}>
              ⚡ झटपट भाग निवडा (Quick Episode Jump):
            </span>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>
              कोणत्याही भागावर क्लिक करून थेट संपूर्ण वाचन करा
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(68px, 1fr))', gap: '8px' }}>
            {SHIVCHARITRA_EPISODES_METADATA.map(ep => (
              <Link
                key={ep.num}
                to={`/article/${ep.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #FAF5EE 0%, #F5EBE1 100%)',
                  border: '1px solid #DD8A2E',
                  textDecoration: 'none',
                  color: '#3D0D0D',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#8C1D18'; e.currentTarget.style.color = '#FFF'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, #FAF5EE 0%, #F5EBE1 100%)'; e.currentTarget.style.color = '#3D0D0D'; }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 700, opacity: 0.8 }}>अध्याय</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'inherit' }}>{ep.num}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #E6DDCE',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
          marginBottom: '36px',
          display: 'flex',
          gap: '14px',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '1.4rem' }}>🔍</span>
          <input
            type="text"
            placeholder="शिवचरित्र कथनातील प्रसंग, नाव, किल्ला किंवा प्रसंग शोधा (उदा. पुरंदर, आग्रा, अफजलखान, तानाजी, राज्याभिषेक)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 auto',
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              fontFamily: 'inherit'
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: '#E5E7EB',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              रद्द करा
            </button>
          )}
        </div>

        {/* Section Heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontFamily: 'Baloo 2', fontSize: '1.8rem', color: '#3D0D0D', margin: 0, fontWeight: 800 }}>
              समग्र १५ भागांची सविस्तर अनुक्रमणिका
            </h2>
            <p style={{ color: '#666', fontSize: '0.92rem', margin: '4px 0 0' }}>
              प्रत्येक भागामध्ये उपलब्ध संपूर्ण अस्सल ऐतिहासिक तपशील, संवाद, प्रसंग व विश्लेषण
            </p>
          </div>
          <span style={{ background: '#DD8A2E', color: '#1F0708', fontWeight: 800, padding: '4px 12px', borderRadius: '14px', fontSize: '0.85rem' }}>
            {filteredEpisodes.length} अध्याय प्रदर्शित
          </span>
        </div>

        {/* Detailed 15 Episodes Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {filteredEpisodes.map(ep => (
            <div
              key={ep.num}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #EADCC8',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: 'minmax(280px, 340px) 1fr',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(61,13,13,0.12)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
            >
              {/* Left Image & Badge */}
              <div style={{ position: 'relative', height: '100%', minHeight: '220px' }}>
                <img
                  src={ep.heroImage}
                  alt={ep.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = '/assets/images/maratha-samrajya.jpg'; }}
                />
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  background: 'linear-gradient(135deg, #DD8A2E 0%, #C73800 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                  🚩 भाग {ep.num}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '14px',
                  background: 'rgba(0,0,0,0.75)',
                  color: '#FDE047',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backdropFilter: 'blur(4px)'
                }}>
                  📅 {ep.period}
                </div>
              </div>

              {/* Right Content */}
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#8C1D18', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      शिवशाहीर बाबासाहेब पुरंदरे व्याख्यान ग्रंथ
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>
                      ⏱️ {ep.readTime}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'Baloo 2', fontSize: '1.35rem', color: '#3D0D0D', margin: '0 0 12px', lineHeight: 1.3, fontWeight: 800 }}>
                    {ep.title}
                  </h3>

                  <p style={{ color: '#5C534B', fontSize: '0.94rem', lineHeight: 1.6, margin: '0 0 16px' }}>
                    {ep.summary}
                  </p>

                  {/* Highlights Pills */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {ep.highlights.map((h, i) => (
                      <span
                        key={i}
                        style={{
                          background: '#FAF5EE',
                          border: '1px solid #EADCC8',
                          color: '#7C1D05',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '12px'
                        }}
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Read Button */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', borderTop: '1px solid #F3EDE2', paddingTop: '16px' }}>
                  <Link
                    to={`/article/${ep.id}`}
                    style={{
                      background: 'linear-gradient(135deg, #DD8A2E 0%, #C73800 100%)',
                      color: '#FFFFFF',
                      padding: '10px 22px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(199,56,0,0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    📖 भाग {ep.num} संपूर्ण आलेख वाचा →
                  </Link>

                  <span style={{ fontSize: '0.82rem', color: '#888' }}>
                    अस्सल मोडी व बखर पुराव्यांसह
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
