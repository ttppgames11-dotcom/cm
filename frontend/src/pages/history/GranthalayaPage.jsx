import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GRANTH_COLLECTION = [
  // शिवशाहीर बाबासाहेब पुरंदरे - शिवचरित्र कथन (१५ भाग)
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-1',
    image: '/assets/images/real-maratha-army-panoramic.jpg',
    title: 'शिवचरित्र कथन — भाग १: यादवांचा अस्त, संतांचा आक्रोश, मालोजीराजे ते भातवडीचा रणसंग्राम (१६२४)',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'देवगिरीचे पतन, हरपालदेवाची अमानुष हत्या, ३०० वर्षांची सुलतानी गुलामी, संत एकनाथांचा आक्रोश, मालोजीराजे भोसले आणि शहाजीराजांचा भातवडीतील जागतिक कीर्तीचा महापराक्रम.',
    pages: 'व्याख्यान ग्रंथ (४५ मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग १ · उगम'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-2',
    image: '/assets/images/real-shivaji-portrait.jpg',
    title: 'शिवचरित्र कथन — भाग २: शहाजीराजे, जिजाऊंची स्वराज्य प्रेरणा व शिवनेरीवर शिवजन्माचा सुवर्णदिन',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'निजामशाहीचा अंत, जिजाऊंचे डोहाळे, सिंदखेडराजाची शिकवण आणि १९ फेब्रुवारी १६३० — शिवनेरीवर तोफांच्या कडकडाटात अवतरलेला सह्याद्रीचा शिवसूर्य!',
    pages: 'व्याख्यान ग्रंथ (५० मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग २ · शिवजन्म'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-3',
    image: '/assets/images/fort-wall.jpg',
    title: 'शिवचरित्र कथन — भाग ३: बाळ शिवबांचे शिक्षण, रोहिडेश्वराची स्वराज्य प्रतिज्ञा, तोरणा ते जावळी विजय',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'पुण्यात सोन्याचा नांगर, दादोजी कोंडदेव, रायरेश्वराच्या गाभाऱ्यात रक्ताने घेतलेली हिंदवी स्वराज्याची शपथ, तोरणा किल्ल्यावर बांधलेले तोरण आणि चाकण ते कल्याण विजय.',
    pages: 'व्याख्यान ग्रंथ (५५ मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग ३ · प्रतिज्ञा'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-4',
    image: '/assets/images/battles/purandar.jpg',
    title: 'शिवचरित्र कथन — भाग ४: पुरंदरचा रणसंग्राम, फत्तेखानाचा पराभव, शहाजीराजांची सुटका व बाजी पासलकर',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'आदिलशाही सेनापती फत्तेखानाचा पुरंदरवर हल्ला, बाजी पासलकरांचे असीम बलिदान, शहाजीराजांना विजापुरात झालेली अटक आणि शिवरायांची शहाजहानशी मुत्सद्देगिरी.',
    pages: 'व्याख्यान ग्रंथ (५० मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग ४ · मुत्सद्देगिरी'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-5',
    image: '/assets/images/real-pratapgad-fort.jpg',
    title: 'शिवचरित्र कथन — भाग ५: जावळीचा चंद्रराव मोरे, प्रतापगड दुर्ग निर्मिती व विजापुरात अफजलखानाचा विडा',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'जावळीच्या निबिड अरण्यात मोऱ्यांचे पारपत्य, मोरोपंत पिंगळे व हिरोजी इंदुलकरांकडून प्रतापगड किल्ल्याची निर्मिती आणि विजापूर दरबारात बडी बेगमसमोर अफजलखानाने उचललेला विडा.',
    pages: 'व्याख्यान ग्रंथ (५२ मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग ५ · प्रतापगड'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-6',
    image: '/assets/images/battles/pratapgad.jpg',
    title: 'शिवचरित्र कथन — भाग ६: तुळजापूर, पंढरपूर ते वाई; अफजलखानाचा चालून येणे, कान्होजी जेधे व कृष्णाजी भास्कर',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'तुळजाभवानी मंदिराची विटंबना करून महाराष्ट्रात घुसलेला अफजलखान, जिजाऊंची कणखरता, कान्होजी जेध्यांची स्वराज्याशी एकनिष्ठ प्रतिज्ञा आणि वाईत वकिलांची राजकीय भेट.',
    pages: 'व्याख्यान ग्रंथ (५५ मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग ६ · आव्हान'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-7',
    image: '/assets/images/warriors/shivakashid.jpg',
    title: 'शिवचरित्र कथन — भाग ७: १० नोव्हेंबर १६५९: प्रतापगडाच्या पायथ्याशी अफजलखान वध, जिवा महाला व महाविजय',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'शामियान्यातील मिठीतील कपटी वार, वाघनखे व बिचव्याने खानाचा कोथळा बाहेर काढणे, "होता जिवा म्हणून वाचला शिवा" आणि सह्याद्रीत विजापूर सैन्याचा संपूर्ण धुव्वा!',
    pages: 'व्याख्यान ग्रंथ (६० मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग ७ · महापराक्रम'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-8',
    image: '/assets/images/warriors/bajiprabhu.jpg',
    title: 'शिवचरित्र कथन — भाग ८: पन्हाळगडाचा वेढा, सिद्दी जोहर, शिवा काशिद यांचे प्रतिरूप व पावनखिंडीत बाजीप्रभूंचे अमर बलिदान',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'आषाढ पौर्णिमेच्या वादळी रात्री पन्हाळ्यावरून विशाळगडाकडे कूच, शिवा काशिद यांचे प्रतिशिवाजी रूप, घोडखिंडीत ३०० बांदल मावळ्यांची २१ तास झुंज आणि तोफांचे ३ बार!',
    pages: 'व्याख्यान ग्रंथ (६० मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग ८ · पावनखिंड'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-9',
    image: '/assets/images/warriors/firangoji.jpg',
    title: 'शिवचरित्र कथन — भाग ९: शाहिस्तेखानाचा पुण्यात तळ, चाकणच्या संग्रामदुर्गावर फिरंगोजी नरसाळांचा ५६ दिवसांचा लढा व जखमनामा दरबार',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'शाहिस्तेखानाचा १ लाखांच्या फौजेसह पुण्यात प्रवेश, चाकणच्या भुईकोट किल्ल्यावर फिरंगोजी नरसाळांची ५६ दिवस अभूतपूर्व झुंज, खंडूजी खोपड्याला शासन आणि जखमनामा दरबार.',
    pages: 'व्याख्यान ग्रंथ (६० मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग ९ · संग्रामदुर्ग'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-10',
    image: '/assets/images/real-maratha-arms.jpg',
    title: 'शिवचरित्र कथन — भाग १०: उंबरखिंडीत कारतलब-रायबागनचा दारुण पराभव, राजापूरची इंग्रज वखार ते लाल महालातील थरारक सर्जिकल स्ट्राईक',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'उंबरखिंडीच्या ९ मैल अरुंद दरीत कारतलब खानाचा दारुण पराभव, रायबागन सावित्रीबाईंचा सल्ला, राजापूरच्या इंग्रजांना २ वर्षे वासुलट्यावर कैद, बाळाजी आवजी चिटणीसांची भेट आणि ५ एप्रिल १६६३ — लाल महालावर रात्रीचा छापा व शाहिस्तेखानाची ३ बोटे छाटल्याचा थरार!',
    pages: 'व्याख्यान ग्रंथ (६५ मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग १० · सर्जिकल स्ट्राईक'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-11',
    image: '/assets/images/real-sindhudurg-fort.jpg',
    title: 'शिवचरित्र कथन — भाग ११: सुरतेची पहिली ऐतिहासिक स्वारी, शहाजीराजांचे महाप्रयाण, सिंधुदुर्ग व जयसिंगाची मोहीम',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'जानेवारी १६६४ मधील सुरत मोहीम, १ कोटी रुपयांची संपत्ती, फादर ॲम्ब्रोजचा आदर, शहाजीराजांचे होदेगेरे येथे महाप्रयाण, जिजाऊंचे सती जाणे रोखणे, सिंधुदुर्ग जलदुर्ग व मिर्झाराजे जयसिंगाची प्रचंड मोहीम.',
    pages: 'व्याख्यान ग्रंथ (५७ मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग ११ · सुरत स्वारी'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-12',
    image: '/assets/images/warriors/murarbaji.jpg',
    title: 'शिवचरित्र कथन — भाग १२: पुरंदरचा रणसंग्राम, मुरारबाजींचे अद्वितीय बलिदान व पुरंदरचा तह',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'कुडाळ विजय, सिंधुदुर्ग जलदुर्ग पायाभरणी, महाबळेश्वरात जिजाऊंची सुवर्णतुला, मिर्झाराजे जयसिंग-दिलेरखानाचे आक्रमण, वज्रगड पाडाव, मुरारबाजी देशपांडे यांचे असीम शौर्य आणि १६६५ चा पुरंदर तह.',
    pages: 'व्याख्यान ग्रंथ (६० मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग १२ · पुरंदर संग्राम'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-13',
    image: '/assets/images/real-babasaheb-purandare.jpg',
    title: 'शिवचरित्र कथन — भाग १३: आग्रा दरबारातील महानाट्य, नजरकैदेतून अशक्य सुटका व मिठाईच्या पेट्या',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: '१२ मे १६६६ रोजी आग्रा दरबारात औरंगजेबाच्या समोर शिवरायांची सिंहगर्जना, रामसिंगाची जामीनकी, फौलादखानाचा वेढा आणि १७ ऑगस्ट १६६६ रोजी मिठाईच्या पेट्यांतून ऐतिहासिक पलायन.',
    pages: 'व्याख्यान ग्रंथ (६० मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग १३ · आग्रा सुटका'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-14',
    image: '/assets/images/warriors/tanaji.jpg',
    title: 'शिवचरित्र कथन — भाग १४: आग्र्याहून राजगडी पुनरागमन, सिंहगडावर तानाजींचे बलिदान व पन्हाळा विजय',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: '१२ सप्टेंबर १६६६ रोजी गोसावी वेशात राजगडी आगमन, ४ फेब्रुवारी १६७० चा सिंहगड संग्राम, सुभेदार तानाजी मालुसरे यांचे अमर बलिदान, गड आला पण सिंह गेला आणि ६ मार्च १६७३ चा कोंडाजी फर्जंदांचा पन्हाळा विजय.',
    pages: 'व्याख्यान ग्रंथ (६० मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग १४ · तानाजी बलिदान'
  },
  {
    id: 'babasaheb-purandare-shivcharitra-kathan-bhag-15',
    image: '/assets/images/history/rajyabhishek.jpg',
    title: 'शिवचरित्र कथन — भाग १५: ६ जून १६७४: शिवराज्याभिषेक सोहळा — आनंदवनभुवन',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे (पुरंदरे प्रकाशन)',
    category: 'शिवचरित्र कथन (१५ भाग)',
    level: 'शिवचरित्र महागाथा',
    desc: 'समर्थ रामदास स्वामींचे निश्चयाचा महामेरू पत्र, छत्रसाल बुंदेला भेट, गागाभट्टांचे आगमन, ३२ मणांचे सुवर्णसिंहासन, ६ जून १६७४ चा ऐंद्र महाभिषेक, जिजाऊंचे जीवनसाफल्य आणि आनंदवनभुवन.',
    pages: 'व्याख्यान ग्रंथ (६५ मि.)',
    language: 'मराठी (ओजस्वी वाणी)',
    tag: 'भाग १५ · शिवराज्याभिषेक'
  },

  // विशेष चरित्र व ऐतिहासिक महागाथा
  {
    id: 'shiva-kashid-baji-prabhu',
    image: '/assets/images/battle_pavankhind_painting_1790397482278.jpg',
    title: 'अमर बलिदान: वीर शिवा काशिद आणि बाजीप्रभू देशपांडे — पन्हाळा ते पावनखिंड अखंड रणसंग्राम',
    author: 'इतिहास व्याख्याते व अस्सल ऐतिहासिक साधने',
    category: 'इतिहास संशोधन',
    level: 'अद्वितीय बलिदान',
    desc: 'सिद्दी जोहरचा ९ महिन्यांचा वेढा, शिवा काशिद यांचे प्रतिशिवाजी रूप व फाजलखानाची दगाबाजी, घोडखिंडीतील ३०० बांदल वीरांचे रणतांडव, तोफांचे तीन बार आणि शिवरायांची पहिली पेन्शन योजना.',
    pages: 'विशेष संशोधन आलेख',
    language: 'मराठी',
    tag: 'विशेष गाथा'
  },
  {
    id: 'hambirrao-mohite-bahadurgad',
    image: '/assets/images/warriors/hambirrao.jpg',
    title: 'सरसेनापती हंबीरराव मोहिते यांची बहादूरगडावरील गनिमी काव्याची लढाई',
    author: 'मराठा युद्धनीती संशोधन मंडळ',
    category: 'इतिहास संशोधन',
    level: 'गनिमी कावा',
    desc: 'बहादूरखानाने (खानजहान कोका) भीमा नदीकाठी उभारलेल्या छावणीवर हंबीररावांची विस्मयकारक रणनीती — २०० घोडदळाची बतावणी करून १ कोटींचा बादशाही खजिना व २०० उत्तम अरबी घोडे स्वराज्यात आणले!',
    pages: 'युद्धनीती आलेख',
    language: 'मराठी',
    tag: 'गनिमी कावा'
  },
  {
    id: 'babasaheb-purandare-shivrajyabhishek-mahasohala',
    image: '/assets/images/history/coronation.jpg',
    title: 'शिवराज्याभिषेक एक महासोहळा: ३२ मणांचे सुवर्णसिंहासन आणि छत्रपती शिवरायांचा राज्याभिषेक',
    author: 'शिवशाहीर बाबासाहेब पुरंदरे',
    category: 'ग्रंथ',
    level: 'सार्वभौम स्वातंत्र्य',
    desc: 'ज्येष्ठ शुद्ध त्रयोदशी (६ जून १६७४) दुर्गराज रायगडावर पंडित गागाभट्टांच्या उपस्थितीत संपन्न झालेला वैदिक राज्याभिषेक सोहळा, शिवराजमुद्रा, ३२ मण सुवर्णसिंहासन आणि स्वातंत्र्याची मंगल पहाट.',
    pages: 'राज्याभिषेक विशेषांक',
    language: 'मराठी',
    tag: 'राज्याभिषेक'
  },

  // अस्सल ऐतिहासिक बखरी व ग्रंथ
  {
    id: 'sabhasad-bakhar',
    image: '/assets/images/history/coronation.jpg',
    title: 'सभासद बखर (Sabhasad Bakhar)',
    author: 'कृष्णाजी अनंत सभासद (इ.स. १६९७)',
    category: 'बखर',
    level: 'मूलभूत संदर्भ',
    desc: 'छत्रपती शिवाजी महाराजांच्या समकालीन अधिकृत बखरींपैकी सर्वात महत्त्वाची बखर. जिंजी येथे छत्रपती राजाराम महाराजांच्या आज्ञेवरून लिहिली गेली.',
    pages: '१४२ पृष्ठे',
    language: 'मराठी (देवनागरी / मोडी संदर्भासह)',
    tag: 'अस्सल बखर'
  },
  {
    id: 'budhabhushanam',
    image: '/assets/images/real-sambhaji-photo.jpg',
    title: 'बुधभूषणम् (Budhabhushanam)',
    author: 'छत्रपती संभाजी महाराज',
    category: 'ग्रंथ',
    level: 'राजधर्म व नीती',
    desc: 'छत्रपती संभाजी महाराजांनी संस्कृत भाषेत रचलेला अलौकिक नीती व राज्यशास्त्र ग्रंथ. राजाची कर्तव्ये, राजकारण, सैन्य व्यवस्था व दुर्ग संरक्षणाचा अभ्यास.',
    pages: '२८० पृष्ठे',
    language: 'संस्कृत (मराठी अनुवादासह)',
    tag: 'शिवपुत्र रचना'
  },
  {
    id: 'agyapatra',
    image: '/assets/images/real-maratha-court-1792.jpg',
    title: 'आज्ञापत्र (Agyapatra)',
    author: 'रामचंद्रपंत अमात्य बावडेकर (इ.स. १७१५)',
    category: 'प्रशासन',
    level: 'मराठा राज्यशास्त्र',
    desc: 'शिवकालीन दुर्ग व्यवस्थापन, आरमार, परराष्ट्र धोरण व रयतेच्या रक्षणाविषयीचा जागतिक दर्जाचा प्रशासकीय मार्गदर्शक ग्रंथ.',
    pages: '९६ पृष्ठे',
    language: 'मराठी',
    tag: 'प्रशासकीय सनद'
  },
  {
    id: 'shivabharata',
    image: '/assets/images/real-shivaji-portrait.jpg',
    title: 'शिवभारत (Shivabharata)',
    author: 'कवींद्र परमानंद नेवासकर',
    category: 'महाकाव्य',
    level: 'समकालीन महाकाव्य',
    desc: 'छत्रपती शिवरायांच्या आज्ञेवरून रचलेले संस्कृत ऐतिहासिक महाकाव्य. शिवजन्मापासून पुरंदर तहापर्यंतचा समग्र इतिहास.',
    pages: '३२० पृष्ठे',
    language: 'संस्कृत',
    tag: 'समकालीन साक्ष'
  },
  {
    id: 'marathi-riyasat',
    image: '/assets/images/maratha-granthalaya.jpg',
    title: 'मराठी रियासत (Marathi Riyasat)',
    author: 'रियासतकार गोविंद सखाराम सरदेसाई',
    category: 'इतिहास संशोधन',
    level: 'समग्र इतिहास',
    desc: 'मराठा साम्राज्याचा १६०० ते १८४८ पर्यंतचा सविस्तर ऐतिहासिक आढावा घेणारा बहुखंडीय संशोधन ग्रंथ.',
    pages: '८ खंड (३२००+ पृष्ठे)',
    language: 'मराठी',
    tag: 'अभिजात इतिहास'
  },
  {
    id: 'modi-lipi-sangrah',
    image: '/assets/images/library.jpg',
    title: 'मोडी लिपी प्राथमिक पाठमाला व सनदा संग्रह',
    author: 'Connect Maratha अर्काईव्ह मंडळ',
    category: 'मोडी लिपी',
    level: 'संशोधक व विद्यार्थी',
    desc: 'शिवकालीन व पेशवेकालीन अस्सल मोडी हस्तलिखिते, आज्ञापत्रे, सनदा आणि पत्रव्यवहार वाचण्याचे सचित्र मार्गदर्शन.',
    pages: '८४ पृष्ठे (सचित्र)',
    language: 'मोडी / मराठी',
    tag: 'डिजिटल अर्काईव्ह'
  }
];

export default function GranthalayaPage() {
  const [selectedCat, setSelectedCat] = useState('सर्व');
  const [search, setSearch] = useState('');

  const categories = [
    'सर्व',
    'शिवचरित्र कथन (१५ भाग)',
    'बखर',
    'ग्रंथ',
    'प्रशासन',
    'महाकाव्य',
    'इतिहास संशोधन',
    'मोडी लिपी'
  ];

  const filtered = GRANTH_COLLECTION.filter(g => {
    const matchCat = selectedCat === 'सर्व' || g.category === selectedCat;
    const matchSearch = search === '' ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.author.toLowerCase().includes(search.toLowerCase()) ||
      g.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        
        {/* Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 100%)',
          borderRadius: '20px',
          padding: '40px 32px',
          color: '#FFFFFF',
          marginBottom: '28px',
          boxShadow: '0 12px 36px rgba(61,13,13,0.3)',
          border: '2px solid #DD8A2E'
        }}>
          <span style={{
            background: '#DD8A2E',
            color: '#3D0D0D',
            fontSize: '0.8rem',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '20px',
            textTransform: 'uppercase'
          }}>
            🏛️ मराठा इतिहास महाग्रंथालय व डिजिटल अर्काईव्ह
          </span>
          <h1 style={{
            fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
            fontSize: 'clamp(1.9rem, 4vw, 2.7rem)',
            fontWeight: 800,
            margin: '12px 0 8px',
            color: '#FFFFFF'
          }}>
            अस्सल ऐतिहासिक ग्रंथ, बखरी व शिवचरित्र कथन
          </h1>
          <p style={{ color: '#E6DDCE', fontSize: '1rem', maxWidth: '750px', margin: 0, lineHeight: 1.6 }}>
            शिवशाहीर बाबासाहेब पुरंदरे यांच्या ओजस्वी वाणीतील १० भागांची शिवचरित्र महागाथा, समकालीन सभासद बखर, संभाजी महाराजांचे बुधभूषणम्, रामचंद्रपंत अमात्यांचे आज्ञापत्र आणि मोडी दस्तऐवजांचा अधिकृत संग्रह.
          </p>

          {/* Quick Jump Buttons for Shivcharitra 10 Parts */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(221,138,46,0.3)' }}>
            <span style={{ fontSize: '0.85rem', color: '#FDE047', fontWeight: 700, marginRight: '10px' }}>
              🚩 शिवचरित्र कथन झटपट वाचन:
            </span>
            <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(n => (
                <Link
                  key={n}
                  to={`/shivcharitra#bhag-${n}`}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid #DD8A2E',
                    color: '#FFF',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  भाग {n}
                </Link>
              ))}
              <Link
                to="/shivcharitra"
                style={{
                  background: '#DD8A2E',
                  color: '#1F0708',
                  padding: '3px 12px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  marginLeft: '4px'
                }}
              >
                सर्व १५ भाग एकाच पानावर →
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div style={{
          background: '#FFFFFF',
          padding: '16px 20px',
          borderRadius: '16px',
          border: '1px solid #E6DDCE',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: '1 1 300px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 ग्रंथ, बखर, व्याख्यान, लेखक किंवा विषय शोधा..."
              style={{
                width: '100%',
                padding: '10px 18px',
                borderRadius: '30px',
                border: '1.5px solid #DD8A2E',
                fontSize: '0.92rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: selectedCat === cat ? '1.5px solid #5C1414' : '1px solid #E6DDCE',
                  background: selectedCat === cat ? '#5C1414' : '#F8F5F0',
                  color: selectedCat === cat ? '#FFFFFF' : '#2B2420',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Granth Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '22px' }}>
          {filtered.map(granth => (
            <div
              key={granth.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #E6DDCE',
                boxShadow: '0 6px 20px rgba(199,56,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}>
              <div style={{
                background: 'linear-gradient(135deg, #FFFFFF, #FDF3E6)',
                padding: '20px',
                borderBottom: '1px solid rgba(221,138,46,0.25)'
              }}>
                {granth.image && (
                  <div style={{ height: '160px', margin: '-20px -20px 14px -20px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={granth.image}
                      alt={granth.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/assets/images/maratha-granthalaya.jpg'; }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)', padding: '4px 12px' }}>
                      <span style={{ color: '#FDE047', fontSize: '0.72rem', fontWeight: 800 }}>📜 {granth.level}</span>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    background: '#5C1414',
                    color: '#FFF',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {granth.tag}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#777', fontWeight: 600 }}>{granth.pages}</span>
                </div>
                <h3 style={{
                  fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#3D0D0D',
                  margin: '0 0 4px',
                  lineHeight: 1.35
                }}>
                  {granth.title}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#C9701C', fontWeight: 700 }}>
                  ✍️ {granth.author}
                </div>
              </div>

              <div style={{ padding: '20px', flexGrow: 1 }}>
                <p style={{ fontSize: '0.88rem', color: '#5C534B', lineHeight: 1.55, margin: '0 0 16px' }}>
                  {granth.desc}
                </p>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>
                  भाषा / स्वरूप: <strong>{granth.language}</strong>
                </div>
              </div>

              <div style={{ padding: '16px 20px', background: '#FAF6F0', borderTop: '1px solid #E6DDCE', display: 'flex', gap: '10px' }}>
                <Link
                  to={`/article/${granth.id}`}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '9px 12px',
                    background: 'linear-gradient(135deg, #E65100 0%, #EA580C 100%)',
                    color: '#FFF',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 10px rgba(234,88,12,0.3)'
                  }}>
                  📖 संपूर्ण आलेख / ग्रंथ वाचा →
                </Link>
                <a
                  href="#download"
                  onClick={(e) => { e.preventDefault(); alert(`'${granth.title}' डिजिटल आवृत्ती लवकरच पीडीएफ स्वरूपात उपलब्ध होईल.`); }}
                  style={{
                    padding: '9px 14px',
                    background: '#FFF',
                    border: '1.5px solid #DD8A2E',
                    color: '#DD8A2E',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textDecoration: 'none'
                  }}>
                  📥 PDF
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
