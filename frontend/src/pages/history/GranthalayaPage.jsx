import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const GRANTH_COLLECTION = [
  {
    id: 'sabhasad-bakhar',
    title: 'सभासद बखर (Sabhasad Bakhar)',
    author: 'कृष्णाजी अनंत सभासद (इ.स. १६९७)',
    category: 'बखर',
    level: 'शिवकालीन अधिकृत साक्ष',
    image: '/assets/images/granthalaya/sabhasad-bakhar.jpg',
    desc: 'छत्रपती शिवाजी महाराजांच्या चरित्रावरील सर्वात अस्सल आणि आद्य बखर. जिंजी येथे मुघल वेढ्यात असताना छत्रपती राजाराम महाराजांच्या थेट आज्ञेवरून सभासदांनी ही बखर शब्दबद्ध केली.',
    details: [
      'शिवरायांचे बालपण, शहाजीराजांचे मार्गदर्शन ते स्वराज्य स्थापनेची अखंड वाटचाल.',
      'किल्ले बांधणी, अष्टप्रधान मंडळ, आरमार उभारणी व जावळी-अफजलखान युद्धाचे सविस्तर समालोचन.',
      'शिवरायांची शिस्त: "रयतेच्या भाजीच्या देठासही हात लावू नये" ही शिवकालीन आज्ञा याच बखरीत नोंदवली आहे.',
      'जिंजी येथे मुघलांशी झुंज देणाऱ्या मराठ्यांना छत्रपती शिवरायांच्या पराक्रमाची प्रेरणा देण्यासाठी लेखन.'
    ],
    highlight: '“शिवछत्रपती म्हणजे केवळ राजे नव्हे, तर साक्षात अवतारी पुरुष होते!” — कृष्णाजी अनंत सभासद',
    pages: '१४२ पृष्ठे (अस्सल पाठ)',
    language: 'मराठी (देवनागरी / मोडी संदर्भ)',
    tag: 'अस्सल बखर',
    preservation: 'तंजावर सरस्वती महाल ग्रंथालय व भारत इतिहास संशोधक मंडळ, पुणे'
  },
  {
    id: 'budhabhushanam',
    title: 'बुधभूषणम् (Budhabhushanam)',
    author: 'छत्रपती संभाजी महाराज (इ.स. १६७५-१६८०)',
    category: 'ग्रंथ',
    level: 'राजधर्म व नीतीशास्त्र',
    image: '/assets/images/granthalaya/budhabhushanam.jpg',
    desc: 'धर्मवीर छत्रपती संभाजी महाराजांनी अवघ्या १४ व्या-१६ व्या वर्षी शृंगारपूर येथे रचलेला अद्वितीय संस्कृत राजनीति ग्रंथ. राजाची कर्तव्ये, दुर्ग रचना, गुप्तहेर व्यवस्था व धर्मशास्त्राचे सखोल मार्गदर्शन.',
    details: [
      'तीन प्रमुख अध्याय: राजनिती, दुर्गव्यवस्थापन व सामाजिक-सैन्य संरचना.',
      'किल्ले कसे असावेत, जलदुर्ग व गिरिदुर्गांचे महत्त्व आणि धान्याची कोठारे भरलेली ठेवण्याचे नियम.',
      'शंभूराजांच्या अगाध संस्कृत विद्वत्तेचे, काव्यप्रतिभेचे आणि प्रशासकीय दूरदृष्टीचे जिवंत प्रतीक.',
      'अनेक संस्कृत कवी व पंडितांचे दाखले देत न्यायाधिष्ठित राज्यकारभाराचे विवेचन.'
    ],
    highlight: '“कलौ च छत्रपति संभूसिंहः” — कलीयुगात प्रजेचे रक्षण करणारा सिंहासारखा राजा!',
    pages: '२८० पृष्ठे (संस्कृत श्लोक व मराठी अनुवाद)',
    language: 'संस्कृत (मराठी भाष्य व टीका)',
    tag: 'शिवपुत्र रचना',
    preservation: 'भांडारकर प्राच्यविद्या संशोधन मंदिर (BORI), पुणे'
  },
  {
    id: 'agyapatra',
    title: 'आज्ञापत्र (Agyapatra - Royal Edict)',
    author: 'रामचंद्रपंत अमात्य बावडेकर (इ.स. १७१५)',
    category: 'प्रशासन',
    level: 'मराठा राज्यशास्त्र व दुर्गनीती',
    image: '/assets/images/granthalaya/agyapatra.jpg',
    desc: 'शिवछत्रपतींच्या प्रशासकीय व लष्करी तत्त्वांची अधिकृत संहिता. छत्रपती संभाजी महाराज (कोल्हापूर गादी) यांच्या आज्ञेने रामचंद्रपंत अमात्य यांनी शिवकालीन नीती भावी पिढ्यांसाठी नोंदवून ठेवली.',
    details: [
      'दुर्गव्यवस्था: "संपूर्ण राज्याचे सार ते दुर्ग... किल्ले नसता देश परचक्राच्या हाती जातो."',
      'आरमार: "ज्याचे आरमार त्याचा समुद्र... आरमार हे स्वतंत्र एक राज्यांगच आहे."',
      'वतनदारीवर नियंत्रण: वतनदारांना सैनिकी अधिकार न देणे आणि रयतेकडून थेट सारा गोळा करणे.',
      'सावकार व व्यापारी: सावकार म्हणजे राज्याचे भूषण; त्यांना सन्मान देऊन व्यापार वृद्धिंगत करणे.'
    ],
    highlight: '“किल्ले हेच राज्याचे मूळ, किल्ले हेच राज्याचे प्राण!” — रामचंद्रपंत अमात्य',
    pages: '९६ पृष्ठे (सविस्तर टिपणांसह)',
    language: 'अभिजात मराठी',
    tag: 'प्रशासकीय सनद',
    preservation: 'पुणे पुराभिलेखागार (Alienation Office) व ऐतिहासिक दप्तर'
  },
  {
    id: 'bhausaheb-bakhar',
    title: 'भाऊसाहेबांची बखर (Bhausahebanchi Bakhar)',
    author: 'अज्ञात मराठा साक्षीदार / इतिहासकार (इ.स. १७६२-१७७०)',
    category: 'बखर',
    level: 'पानिपत युद्ध महाकाव्य',
    image: '/assets/images/granthalaya/bhausaheb-bakhar.jpg',
    desc: '१४ जानेवारी १७६१ रोजी घडलेल्या तिसऱ्या पानिपत युद्धाचा अत्यंत ओजस्वी, थरारक आणि प्रत्यक्षदर्शी वाटणारा ऐतिहासिक वृत्तांत. सदाशिवराव भाऊ, विश्वासराव आणि मराठा वीरांच्या बलिदानाची अमर कहाणी.',
    details: [
      'अब्दाली, नजीबखान आणि मराठा फौजांमधील मुत्सद्देगिरी आणि राजकीय संघर्ष.',
      'इब्राहिम खान गारदी यांच्या तोफखान्याचा अद्वितीय मारा आणि मराठा गनिमांचे शौर्य.',
      'विश्वासराव गोळी लागून पडल्यानंतर सदाशिवराव भाऊंनी हत्तीवरून उतरून घोड्यावर स्वार होत दिलेली अखेरची झुंज.',
      'युद्धानंतर महाराष्ट्रातील प्रत्येक घरादारावर पसरलेली शोककळा आणि "दोन मोत्ये गळाली" हा सांकेतिक संदेश.'
    ],
    highlight: '“दोन मोत्ये गळाली, सत्तावीस मोहरा हरवल्या, आणि रुपयांची तर गणतीच नाही!”',
    pages: '१६८ पृष्ठे',
    language: 'जुनी मराठी (ओजस्वी भाषाशैली)',
    tag: 'ऐतिहासिक रणसंग्राम',
    preservation: 'डेक्कन कॉलेज व भारत इतिहास संशोधक मंडळ'
  },
  {
    id: 'shivabharata',
    title: 'श्रीशिवभारत (Shree Shivabharata)',
    author: 'कवींद्र परमानंद नेवासकर (इ.स. १६७४)',
    category: 'महाकाव्य',
    level: 'समकालीन संस्कृत महाकाव्य',
    image: '/assets/images/granthalaya/shivabharata.jpg',
    desc: 'छत्रपती शिवाजी महाराजांच्या स्वतःच्या प्रत्यक्ष प्रेरणेने आणि आज्ञेने रचलेले समकालीन अधिकृत चरित्र काव्य. मालोजीराजे, शहाजीराजे आणि शिवरायांच्या बालपणापासून आग्रा सुटकेपर्यंतचा साधार इतिहास.',
    details: [
      '३२ अध्यायांमध्ये गुंफलेले अनुष्टुभ छंदातील हजारो संस्कृत श्लोक.',
      'शहाजी महाराजांचे कर्नाटकातील दिग्विजय आणि शिवरायांच्या स्वराज्य प्रतिज्ञेचे समकालीन वर्णन.',
      'अफजलखान वध, पन्हाळगडाचा वेढा, शाहिस्तेखानाची बोटे छाटणे व मिर्झाराजा जयसिंग यांच्याशी झालेला पुरंदर तह.',
      'शिवकालीन भौगोलिक ठिकाणे, गडांची नावे आणि तत्कालीन घटनांची तंतोतंत तिथीवार नोंद.'
    ],
    highlight: '“साक्षात सूर्यवंशी प्रतापी छत्रपती शिवरायांची जगद्विख्यात कीर्ती!” — कवींद्र परमानंद',
    pages: '३२० पृष्ठे (संस्कृत मूल व मराठी अनुवाद)',
    language: 'अभिजात संस्कृत',
    tag: 'समकालीन साक्ष',
    preservation: 'तंजावर ग्रंथालय व बीओआरआय (BORI)'
  },
  {
    id: 'kalami-bakhar',
    title: '९१ कलमी बखर (91 Kalami Bakhar)',
    author: 'दत्ताजी त्रिंबक वाकेनीस / मल्हार रामराव (इ.स. १७०० च्या सुमारास)',
    category: 'बखर',
    level: '९१ कलमी ऐतिहासिक दस्तावेज',
    image: '/assets/images/granthalaya/kalami-bakhar.jpg',
    desc: 'छत्रपती शिवरायांच्या संपूर्ण जीवनप्रवासाचे ९१ विशिष्ट कलमांमध्ये विभाजन करून लिहिलेला अत्यंत प्राचीन व अस्सल वृत्तांत. मराठा दरबारातील दैनंदिन घडामोडी व राजकीय निर्णयांची नोंद.',
    details: [
      'शिवरायांच्या स्वराज्य स्थापनेची मुहूर्तमेढ आणि आदिलशाही-मुघलांशी झालेला संघर्ष.',
      'शिवरायांचे राज्याभिषेक विधी, सुवर्णहोन नाणी पाडणे आणि स्वराज्याचे कायदे.',
      'कर्नाटक मोहीम आणि जिंजी-तंजावर प्रांतातील मराठा राज्याचा पाया.',
      'प्रत्येक कलम एका स्वतंत्र राजकीय, सामाजिक किंवा लष्करी घटनेवर सविस्तर प्रकाश टाकतो.'
    ],
    highlight: '“९१ कलमांतून साकारलेली शिवप्रभूंची अलौकिक स्वराज्य गाथा.”',
    pages: '११२ पृष्ठे',
    language: 'मराठी (दरबारी दस्तऐवज)',
    tag: 'दरबारी नोंद',
    preservation: 'भारत इतिहास संशोधक मंडळ (BISM), पुणे'
  },
  {
    id: 'chitragupta-bakhar',
    title: 'चित्रगुप्त बखर (Chitragupta Bakhar)',
    author: 'रघुनाथ यादव चित्रगुप्त (इ.स. १७६० च्या सुमारास)',
    category: 'बखर',
    level: 'शिवकालीन विस्तारीत बखर',
    image: '/assets/images/granthalaya/chitragupta-bakhar.jpg',
    desc: 'सभासद बखरीचा विस्तार करून तत्कालीन कागदपत्रांच्या आधारे तयार केलेली अत्यंत महत्त्वपूर्ण बखर. शिवरायांच्या किल्ल्यांची संपूर्ण यादी, तोफा, जहाजे व सैन्याची सांख्यिकी माहिती या बखरीत आढळते.',
    details: [
      'शिवकालीन किल्ल्यांचे वर्गीकरण: जलदुर्ग, गिरिदुर्ग आणि भुईकोट किल्ल्यांची अद्ययावत यादी.',
      'स्वराज्यातील सैनिकांचे पगार, घोडदळाचे पागा व शिलेदार नियम.',
      'शिवछत्रपतींच्या आरमारात असलेल्या गुराब, गलबत, मचवा या युद्धनौकांची तपशीलवार नोंद.',
      'राज्याभिषेकावेळी विविध देशांतून आलेले राजदूत व शिवरायांचे परकीय धोरण.'
    ],
    highlight: '“शिवरायांच्या ३६० किल्ल्यांची आणि लष्करी वैभवाची सविस्तर नामावली.”',
    pages: '१३५ पृष्ठे',
    language: 'मराठी',
    tag: 'लष्करी सांख्यिकी',
    preservation: 'पुणे विद्यापीठ ऐतिहासिक संग्रह'
  },
  {
    id: 'peshwe-bakhar',
    title: 'पेशव्यांची बखर (Peshwyanchi Bakhar)',
    author: 'कृष्णाजी विनायक सोहोनी (इ.स. १८१८ च्या सुमारास)',
    category: 'बखर',
    level: 'पेशवेकालीन साम्राज्य विस्तार',
    image: '/assets/images/granthalaya/peshwe-bakhar.jpg',
    desc: 'बाळाजी विश्वनाथ, थोरले बाजीराव पेशवे, नानासाहेब पेशवे ते सवाई माधवराव यांच्या कारकिर्दीचा समग्र इतिहास. मराठा साम्राज्याने अटकेपार नेलेला भगवा आणि शनिवार वाड्याच्या राजकीय हालचालींची नोंद.',
    details: [
      'थोरले बाजीराव पेशव्यांचे उत्तर भारतातील अजेय पराक्रम: माळवा, बुंदेलखंड आणि दिल्ली मोहीम.',
      'चिमाजी अप्पांचा वसई विजय आणि पोर्तुगीजांच्या तावडीतून कोकणची सुटका.',
      'नाना फडणवीसांची जागतिक दर्जाची मुत्सद्देगिरी आणि बारभाईंचे कारस्थान.',
      'मराठा साम्राज्याचा भारतभर झालेला महाविस्तार आणि अंतर्गत राजकीय घटना.'
    ],
    highlight: '“अटकेपार झेंडा फडकवून मराठ्यांनी संपूर्ण हिंदुस्तान व्यापला!”',
    pages: '२१० पृष्ठे',
    language: 'मराठी (पेशवेकालीन मोडी संदर्भ)',
    tag: 'साम्राज्य विस्तार',
    preservation: 'शनिवार वाडा पुराभिलेखागार व बीआयएसएम'
  },
  {
    id: 'rajwade-sadhan',
    title: 'मराठ्यांच्या इतिहासाची साधने (Rajwade Sadhan Khand)',
    author: 'इतिहासचार्य वि. का. राजवाडे (२२ खंड)',
    category: 'इतिहास संशोधन',
    level: 'संशोधकांचा महामेरू',
    image: '/assets/images/granthalaya/rajwade-sadhan.jpg',
    desc: 'इतिहासचार्य वि. का. राजवाडे यांनी स्वतः गावोगावी, वाड्या-वस्त्यांवर फिरून गोळा केलेल्या हजारो मूळ पत्रांचा, फर्मानांचा व सनदांचा अद्वितीय २२ खंडांचा ऐतिहासिक संच.',
    details: [
      '२२ भव्य खंड आणि प्रत्येकाला राजवाडे यांनी लिहिलेल्या अत्यंत गाजलेल्या विद्वानांच्या प्रस्तावना.',
      'मूळ मोडी व फार्सी कागदपत्रांचे शास्त्रोक्त मराठी लिप्यंतर आणि कालनिर्णय.',
      'राधामाधवविलासचंपू ग्रंथाची शोधक प्रस्तावना — ज्याने मराठ्यांच्या प्राचीन इतिहासाची क्षितिजे बदलली.',
      '"कागदपत्रांशिवाय इतिहास नाही" हे ऐतिहासिक संशोधनाचे शाश्वत सूत्र जगाला दिले.'
    ],
    highlight: '“कागदपत्र नाही तर इतिहास नाही — अस्सल पुराव्यांशिवाय लिहिलेला इतिहास निरुपयोगी!” — वि. का. राजवाडे',
    pages: '२२ खंड (१२,०००+ मूळ अस्सल ऐतिहासिक पत्रे)',
    language: 'मराठी, मोडी व फार्सी संदर्भ',
    tag: 'अस्सल पुरावा',
    preservation: 'राजवाडे संशोधन मंदिर, धुळे व भारत इतिहास संशोधक मंडळ'
  },
  {
    id: 'marathi-riyasat',
    title: 'मराठी रियासत (Marathi Riyasat - Sardesai)',
    author: 'रियासतकार गोविंद सखाराम सरदेसाई',
    category: 'इतिहास संशोधन',
    level: 'समग्र मराठा साम्राज्य इतिहास',
    image: '/assets/images/granthalaya/marathi-riyasat.png',
    desc: 'मराठा साम्राज्याचा १६०० ते १८४८ पर्यंतचा सलग, साधार आणि कालानुक्रमे लिहिलेला अद्वितीय महाग्रंथ. भारतीय इतिहासातील सर्वात सखोल संदर्भग्रंथ म्हणून सर्वमान्य.',
    details: [
      'पूर्वार्ध, मध्यविभाग आणि उत्तरविभाग अशा आठ भव्य खंडांमध्ये विभागलेला इतिहास.',
      'शहाजीराजे, छत्रपती शिवाजी महाराज, संभाजी महाराज, राजाराम महाराज व महाराणी ताराबाईंचा स्वातंत्र्यसंग्राम.',
      'पेशवे काळ आणि मराठा महासंघाचे (शिंदे, होळकर, गायकवाड, भोसले) संपूर्ण भारतावरील साम्राज्य.',
      'ब्रिटिश सत्ता येईपर्यंतच्या सर्व लढाया, तह आणि मराठा मुत्सद्देगिरीचे सविस्तर विश्लेषण.'
    ],
    highlight: '“हिंदुस्थानच्या १८ व्या शतकाचा इतिहास म्हणजे मराठ्यांचाच इतिहास!” — सर जदुनाथ सरकार',
    pages: '८ भव्य खंड (३,२००+ पृष्ठे)',
    language: 'मराठी',
    tag: 'अभिजात इतिहास',
    preservation: 'राष्ट्रीय अभिलेखागार व प्रमुख विद्यापीठे'
  },
  {
    id: 'radhamadhav',
    title: 'राधामाधवविलासचंपू (Radhamadhavvilasachampu)',
    author: 'कवी जयराम पिंड्ये (संपादक: वि. का. राजवाडे)',
    category: 'महाकाव्य',
    level: 'शहाजीराजे कालीन समकालीन ग्रंथ',
    image: '/assets/images/granthalaya/radhamadhav.jpg',
    desc: 'शहाजीराजे भोसले यांच्या बंगळुरू दरबारातील दरबारी कवी जयराम पिंड्ये यांनी रचलेला अत्यंत दुर्मिळ चंपू ग्रंथ. शिवपूर्वकालीन मराठा सरदारांची माहिती देणारा सर्वात प्राचीन समकालीन पुरावा.',
    details: [
      'शहाजीराजांचा भव्य बंगळुरू दरबार, त्यांचे कर्नाटक दिग्विजय आणि विद्वानांना दिलेले राज्याश्रय.',
      '१२ विविध भाषांमधील कविता आणि संस्कृत-मराठी मिश्रित अप्रतिम काव्यशैली.',
      'छत्रपती शिवरायांच्या बालपणाचे आणि शहाजीराजांच्या मुत्सद्देगिरीचे अस्सल उल्लेख.',
      'वि. का. राजवाडे यांनी या ग्रंथाला जोडलेली २०० पानांची प्रस्तावना मराठा इतिहासाचा पाया मानली जाते.'
    ],
    highlight: '“शहाजीराजांच्या दरबारातील बहुभाषिक विद्वत्ता आणि दक्षिणेतील मराठा पराक्रमाचा ठेवा!”',
    pages: '३४० पृष्ठे (राजवाडे प्रस्तावनेसह)',
    language: 'संस्कृत / जुनी मराठी (चंपू काव्य)',
    tag: 'शिवपूर्वकालीन साक्ष',
    preservation: 'राजवाडे संशोधन मंदिर, धुळे'
  },
  {
    id: 'modi-archive',
    title: 'मोडी लिपी दस्तऐवज व सनदा संग्रह (Modi Script Archive)',
    author: 'मराठा पुराभिलेखागार व Connect Maratha अर्काईव्ह',
    category: 'मोडी लिपी',
    level: 'संशोधक व दस्तऐवज वाचक',
    image: '/assets/images/granthalaya/modi-archive.jpg',
    desc: 'शिवकालीन, संभाजीकालीन व पेशवेकालीन अस्सल मोडी हस्तलिखिते, आज्ञापत्रे, सनदा आणि पत्रव्यवहार वाचण्याचे सचित्र आधुनिक संकलन. ऐतिहासिक कागदपत्रांचे लिप्यंतर व मार्गदर्शन.',
    details: [
      'मोडी मुळाक्षरे, बाराखडी, जोडाक्षरे आणि प्राचीन वळणदार अक्षरे ओळखण्याचे नियम.',
      'शिवकालीन मुद्रा (राजमुद्रा), शिक्के, कट्यार चिन्हे आणि सनदांमधील सांकेतिक भाषा.',
      'हिशोबी मोडी, जकात वह्या, सैन्याच्या पगार पावत्या व ऐतिहासिक तहनामे वाचण्याचे प्रत्यक्ष नमुने.',
      'विद्यार्थी आणि संशोधकांसाठी अस्सल कागदपत्रांच्या हाय-रेझोल्यूशन प्रतिमांसह स्वाध्याय.'
    ],
    highlight: '“इतिहासाची खरी पाने उलगडण्याची किल्ली म्हणजे आपली समृद्ध मोडी लिपी!”',
    pages: '१८० पृष्ठे (सचित्र नमुन्यांसह)',
    language: 'मोडी / मराठी / इंग्रजी अनुवाद',
    tag: 'डिजिटल अर्काईव्ह',
    preservation: 'पुणे पुराभिलेखागार, भारत इतिहास संशोधक मंडळ व लंडन ब्रिटिश लायब्ररी'
  }
];

export default function GranthalayaPage() {
  const [selectedCat, setSelectedCat] = useState('सर्व');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const categories = ['सर्व', 'बखर', 'ग्रंथ', 'प्रशासन', 'महाकाव्य', 'इतिहास संशोधन', 'मोडी लिपी'];

  const filtered = GRANTH_COLLECTION.filter(g => {
    const matchCat = selectedCat === 'सर्व' || g.category === selectedCat;
    const matchSearch = search === '' ||
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.author.toLowerCase().includes(search.toLowerCase()) ||
      g.desc.toLowerCase().includes(search.toLowerCase()) ||
      (g.highlight && g.highlight.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Hero Header */}
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          padding: '48px 36px',
          color: '#FFF',
          border: '2px solid #DD8A2E',
          boxShadow: '0 20px 48px rgba(61,13,13,0.25)',
          marginBottom: '32px',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(90deg, rgba(35, 10, 10, 0.90) 0%, rgba(55, 14, 14, 0.78) 55%, rgba(45, 12, 12, 0.45) 100%), url(/assets/images/granthalaya/modi-archive.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '850px' }}>
            <span style={{
              background: '#DD8A2E',
              color: '#2D0B0B',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'inline-block',
              marginBottom: '14px'
            }}>
              📜 अस्सल ऐतिहासिक दस्तऐवज व बखर संग्रह
            </span>
            <h1 style={{
              fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
              fontSize: 'clamp(1.9rem, 4.5vw, 2.8rem)',
              fontWeight: 800,
              margin: '0 0 12px',
              color: '#FFF',
              lineHeight: 1.25
            }}>
              मराठा महाग्रंथालय, बखर व डिजिटल अर्काईव्ह
            </h1>
            <p style={{ color: '#E8DED2', fontSize: '1.05rem', margin: 0, lineHeight: 1.65 }}>
              सभासद बखर, भाऊसाहेबांची बखर, ९१ कलमी बखर, बुधभूषणम्, आज्ञापत्र, शिवभारत आणि इतिहासचार्य राजवाडे यांच्या अस्सल ऐतिहासिक संशोधन ग्रंथांचे सविस्तर, सचित्र व प्रमाणीकृत डिजिटल दालन.
            </p>

            {/* Quick Stats Banner */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(221,138,46,0.3)'
            }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                <span style={{ color: '#DD8A2E', fontWeight: 800, fontSize: '1.1rem' }}>१२+</span>
                <span style={{ color: '#F0ECE4', fontSize: '0.85rem', marginLeft: '6px' }}>प्रसिद्ध ग्रंथ व बखर संच</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                <span style={{ color: '#DD8A2E', fontWeight: 800, fontSize: '1.1rem' }}>१६००-१८१८</span>
                <span style={{ color: '#F0ECE4', fontSize: '0.85rem', marginLeft: '6px' }}>समकालीन कालखंड</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '8px 16px', borderRadius: '12px', backdropFilter: 'blur(4px)' }}>
                <span style={{ color: '#DD8A2E', fontWeight: 800, fontSize: '1.1rem' }}>१००% अस्सल</span>
                <span style={{ color: '#F0ECE4', fontSize: '0.85rem', marginLeft: '6px' }}>संदर्भ व ऐतिहासिक नोंदी</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          padding: '20px 24px',
          border: '1px solid #E6DDCE',
          boxShadow: '0 4px 20px rgba(199,56,0,0.06)',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: '1 1 320px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 ग्रंथ, बखर, लेखक, श्लोक किंवा विषय शोधा (उदा. सभासद, आज्ञापत्र, पानिपत)..."
              style={{
                width: '100%',
                padding: '12px 20px',
                borderRadius: '30px',
                border: '1.5px solid #DD8A2E',
                fontSize: '0.94rem',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#FAF8F5'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '24px',
                  border: selectedCat === cat ? '1.5px solid #5C1414' : '1px solid #E6DDCE',
                  background: selectedCat === cat ? 'linear-gradient(135deg, #5C1414 0%, #3D0D0D 100%)' : '#F8F5F0',
                  color: selectedCat === cat ? '#FFFFFF' : '#2B2420',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Granth Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '26px' }}>
          {filtered.map(granth => {
            const isExpanded = expandedId === granth.id;
            return (
              <div
                key={granth.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  border: '1px solid #E2D7C8',
                  boxShadow: '0 8px 24px rgba(61,13,13,0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}>
                
                {/* Visual Image Banner with Category Badge */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '220px',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #1F0808 0%, #340C0C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Blurred subtle ambient backdrop */}
                  <img
                    src={granth.image}
                    alt=""
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: 'blur(16px) brightness(0.4)',
                      transform: 'scale(1.15)',
                      opacity: 0.6
                    }}
                  />
                  {/* Main uncropped image */}
                  <img
                    src={granth.image}
                    alt={granth.title}
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: '100%',
                      objectFit: 'contain',
                      filter: 'contrast(1.03)',
                      transition: 'transform 0.3s ease'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/images/maratha-granthalaya.jpg';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 3,
                    display: 'flex',
                    gap: '6px'
                  }}>
                    <span style={{
                      background: '#5C1414',
                      color: '#FFF',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                      letterSpacing: '0.3px'
                    }}>
                      {granth.tag}
                    </span>
                    <span style={{
                      background: 'rgba(0,0,0,0.75)',
                      color: '#DD8A2E',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {granth.category}
                    </span>
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '12px',
                    zIndex: 3,
                    background: 'rgba(255,255,255,0.94)',
                    color: '#3D0D0D',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    📄 {granth.pages}
                  </div>
                </div>

                {/* Card Title & Author Header */}
                <div style={{
                  padding: '18px 20px 14px',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF8 100%)',
                  borderBottom: '1px solid #F0ECE4'
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#9C6218', fontWeight: 800, textTransform: 'uppercase', marginBottom: '4px' }}>
                    {granth.level}
                  </div>
                  <h3 style={{
                    fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                    fontSize: '1.28rem',
                    fontWeight: 800,
                    color: '#3D0D0D',
                    margin: '0 0 6px',
                    lineHeight: 1.35
                  }}>
                    {granth.title}
                  </h3>
                  <div style={{ fontSize: '0.86rem', color: '#C9701C', fontWeight: 700 }}>
                    ✍️ {granth.author}
                  </div>
                </div>

                {/* Card Content & Detailed Sections */}
                <div style={{ padding: '18px 20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '0.9rem', color: '#4A4036', lineHeight: 1.6, margin: 0 }}>
                    {granth.desc}
                  </p>

                  {/* Authentic Quote / Highlight Box */}
                  {granth.highlight && (
                    <div style={{
                      background: '#FFF9F0',
                      borderLeft: '3px solid #DD8A2E',
                      padding: '8px 12px',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.84rem',
                      fontStyle: 'italic',
                      color: '#6E4314',
                      lineHeight: 1.45
                    }}>
                      {granth.highlight}
                    </div>
                  )}

                  {/* Expandable Key Details Section */}
                  <div style={{ marginTop: '4px' }}>
                    <button
                      onClick={() => toggleExpand(granth.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#5C1414',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                      <span>{isExpanded ? '▲ कमी माहिती दाखवा' : '▼ प्रमुख मुद्दे व ऐतिहासिक प्रकरणे'}</span>
                    </button>

                    {isExpanded && (
                      <div style={{
                        marginTop: '10px',
                        padding: '12px 14px',
                        background: '#FAF6F0',
                        borderRadius: '10px',
                        border: '1px solid #EADBCC'
                      }}>
                        <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#3D0D0D', marginBottom: '8px' }}>
                          📌 या ग्रंथातील महत्त्वाचे विषय:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.83rem', color: '#4A4036', lineHeight: 1.55 }}>
                          {granth.details && granth.details.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                          ))}
                        </ul>
                        {granth.preservation && (
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #DCCBB5', fontSize: '0.78rem', color: '#7A6B5D' }}>
                            🏛️ <strong>मूळ प्रत / जतन:</strong> {granth.preservation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#666', marginTop: 'auto', paddingTop: '8px' }}>
                    भाषा: <strong style={{ color: '#2B2420' }}>{granth.language}</strong>
                  </div>
                </div>

                {/* Actions Bar */}
                <div style={{
                  padding: '14px 20px',
                  background: '#FAF6F0',
                  borderTop: '1px solid #E8DFD3',
                  display: 'flex',
                  gap: '10px'
                }}>
                  <Link
                    to={`/article/${granth.id}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '10px 14px',
                      background: 'linear-gradient(135deg, #DD8A2E 0%, #C73800 100%)',
                      color: '#FFF',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(199,56,0,0.25)',
                      transition: 'filter 0.2s'
                    }}>
                    📖 ग्रंथ अभ्यास व वाचन
                  </Link>
                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`'${granth.title}' ची सविस्तर डिजिटल संदर्भ आवृत्ती लवकरच पीडीएफ स्वरूपात उपलब्ध होईल.`);
                    }}
                    style={{
                      padding: '10px 16px',
                      background: '#FFF',
                      border: '1.5px solid #DD8A2E',
                      color: '#DD8A2E',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.86rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                    📥 PDF
                  </a>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
