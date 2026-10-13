import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const officersData = [
  {
    id: 1,
    service: 'IAS',
    name: 'श्री. तुकाराम मुंढे',
    image: '/assets/images/officers/officer_tukaram_mundhe_real.jpg',
    cadre: 'भारतीय प्रशासकीय सेवा (IAS - 2005)',
    designation: 'सचिव, महाराष्ट्र शासन',
    location: 'मंत्रालय, मुंबई',
    department: 'प्रशासकीय सुधारणा व सार्वजनिक आरोग्य',
    category: 'IAS अधिकारी',
    icon: '🏛️',
    contribution: 'कडक शिस्त, पारदर्शक कारभार, गैरप्रकारांवर आळा आणि जनतेभिमुख डिजिटल प्रशासनाची यशस्वी अंमलबजावणी.'
  },
  {
    id: 2,
    service: 'IPS',
    name: 'श्री. विश्वास नांगरे पाटील',
    image: '/assets/images/officers/officer_vishwas_face.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 1997)',
    designation: 'अपर पोलीस महासंचालक (ADGP)',
    location: 'महाराष्ट्र राज्य पोलीस मुख्यालय, मुंबई',
    department: 'गृह विभाग व कायदा सुव्यवस्था',
    category: 'IPS अधिकारी',
    icon: '⭐',
    contribution: '२६/११ मुंबई हल्ल्यातील असीम शौर्य (राष्ट्रपती पोलीस शौर्य पदक), सायबर सुरक्षा आणि युवा पिढीसाठी प्रेरणादायी व्याख्याने.'
  },
  {
    id: 3,
    service: 'IAS',
    name: 'सौ. अश्विनी भिडे',
    image: '/assets/images/officers/officer_ashwini_bhide_face.jpg',
    cadre: 'भारतीय प्रशासकीय सेवा (IAS - 1995)',
    designation: 'व्यवस्थापकीय संचालक, मुंबई मेट्रो रेल कॉर्पोरेशन',
    location: 'मुंबई, महाराष्ट्र',
    department: 'नगर विकास व मेट्रो पायाभूत सुविधा',
    category: 'IAS अधिकारी',
    icon: '🚇',
    contribution: 'मुंबई मेट्रो लाईन ३ (अंडरग्राउंड कुलाबा-वांद्रे-सीप्झ) प्रकल्पाचे धडाडीने व वेळेत यशस्वी नियोजन व अंमलबजावणी.'
  },
  {
    id: 4,
    service: 'IAS',
    name: 'सौ. सुजाता सौनिक',
    image: '/assets/images/officers/officer_sujata.jpg',
    cadre: 'भारतीय प्रशासकीय सेवा (IAS - 1987)',
    designation: 'मुख्य सचिव, महाराष्ट्र शासन',
    location: 'मंत्रालय, मुंबई',
    department: 'सामान्य प्रशासन व राज्य कारभार',
    category: 'IAS अधिकारी',
    icon: '🏛️',
    contribution: 'महाराष्ट्राच्या पहिल्या महिला मुख्य सचिव, आरोग्य, वित्त आणि प्रशासकीय सुधारणा क्षेत्रातील ३ दशकांहून अधिक निष्कलंक सेवा.'
  },
  {
    id: 5,
    service: 'IAS',
    name: 'श्री. महेश झगडे',
    image: '/assets/images/officers/officer_mahesh_face.jpg',
    cadre: 'भारतीय प्रशासकीय सेवा (IAS - निवृत्त)',
    designation: 'माजी आयुक्त, अन्न व औषध प्रशासन (FDA) व परिवहन',
    location: 'पुणे / मुंबई, महाराष्ट्र',
    department: 'अन्न व औषध प्रशासन / महसूल',
    category: 'IAS अधिकारी',
    icon: '⚖️',
    contribution: 'गुटखा व भेसळयुक्त औषधांवर ऐतिहासिक बंदी, पारदर्शक आरटीओ सेवा आणि सामान्य नागरिकांसाठी निर्भीड प्रशासकीय लढा.'
  },
  {
    id: 6,
    service: 'IPS',
    name: 'शहीद हेमंत करकरे',
    image: '/assets/images/officers/officer_karkare.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 1982)',
    designation: 'माजी प्रमुख, दहशतवाद विरोधी पथक (ATS - मरणोत्तर अशोक चक्र)',
    location: 'मुंबई, महाराष्ट्र',
    department: 'दहशतवाद विरोधी पथक व गृह विभाग',
    category: 'IPS अधिकारी',
    icon: '🎖️',
    contribution: '२६/११ मुंबई दहशतवादी हल्ल्यात देशाचे रक्षण करताना सर्वोच्च बलिदान, आंतरराष्ट्रीय स्तरावर सन्मानित कर्तव्यदक्ष अधिकारी.'
  },
  {
    id: 7,
    service: 'IPS',
    name: 'श्री. संदीप कर्णिक',
    image: '/assets/images/officers/officer_sandeep_face.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 2004)',
    designation: 'पोलीस आयुक्त (Commissioner of Police)',
    location: 'नाशिक शहर / महाराष्ट्र पोलीस',
    department: 'गृह व कायदा सुव्यवस्था',
    category: 'IPS अधिकारी',
    icon: '🛡️',
    contribution: 'नागरी सुरक्षा, अत्याधुनिक सीसीटीव्ही नियंत्रण कक्ष, सायबर क्राईम सेलचे बळकटीकरण आणि गतिमान पोलीस यंत्रणा.'
  },
  {
    id: 8,
    service: 'IPS',
    name: 'श्री. संजय बर्वे',
    image: '/assets/images/officers/officer_sanjay_barve.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 1987)',
    designation: 'माजी पोलीस आयुक्त, बृहन्मुंबई',
    location: 'मुंबई, महाराष्ट्र',
    department: 'गृह विभाग व पोलीस प्रशासन',
    category: 'IPS अधिकारी',
    icon: '⭐',
    contribution: 'मुंबई शहराची सुरक्षितता, अत्याधुनिक फॉरेन्सिक प्रणाली व पोलीस ठाण्यांचे डिजिटलायझेशन करण्यात मोलाचा वाटा.'
  },
  {
    id: 9,
    service: 'IPS',
    name: 'डॉ. सत्यपाल सिंह',
    image: '/assets/images/officers/officer_satyapal_singh.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 1980)',
    designation: 'माजी पोलीस आयुक्त (मुंबई व पुणे)',
    location: 'महाराष्ट्र / नवी दिल्ली',
    department: 'गृह मंत्रालय व कायदा प्रशासन',
    category: 'IPS अधिकारी',
    icon: '🎖️',
    contribution: 'अंडरवर्ल्ड गुन्हेगारीचे उच्चाटन, पोलीस दलातील मानवी हक्क जागृती आणि शिक्षण क्षेत्रातील उल्लेखनीय कार्य.'
  },
  {
    id: 10,
    service: 'IPS',
    name: 'श्री. अहमद जावेद',
    image: '/assets/images/officers/officer_ahmed_javed.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 1980)',
    designation: 'माजी पोलीस आयुक्त, मुंबई व माजी राजदूत',
    location: 'मुंबई / परराष्ट्र मंत्रालय',
    department: 'पोलीस व आंतरराष्ट्रीय मुत्सद्देगिरी',
    category: 'IPS अधिकारी',
    icon: '🌐',
    contribution: 'मुंबई शहरातील सण-उत्सवांचे शांततापूर्ण नियोजन, उच्च दर्जाची कायदा व सुव्यवस्था आणि परदेशात भारताचे प्रतिनिधित्व.'
  },
  {
    id: 11,
    service: 'IPS',
    name: 'श्री. सुबोध कुमार जायसवाल',
    image: '/assets/images/officers/officer_subodh_jaiswal.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 1985)',
    designation: 'माजी महासंचालक (DGP महाराष्ट्र) व माजी संचालक (CBI)',
    location: 'मुंबई / नवी दिल्ली',
    department: 'केंद्रीय अन्वेषण ब्युरो (CBI) व राज्य पोलीस',
    category: 'IPS अधिकारी',
    icon: '🔍',
    contribution: 'तेलगी मुद्रांक घोटाळा तपास, गुप्तचर विभाग (R&AW) मधील अतिमहत्त्वाची कामगिरी आणि सीबीआयचे पारदर्शक नेतृत्व.'
  },
  {
    id: 12,
    service: 'IPS',
    name: 'सौ. रूपा डी. मौदगिल',
    image: '/assets/images/officers/officer_roopa_face.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 2000)',
    designation: 'पोलीस महानिरीक्षक (Inspector General of Police)',
    location: 'पोलीस मुख्यालय',
    department: 'गृह व पोलीस संशोधन',
    category: 'IPS अधिकारी',
    icon: '🛡️',
    contribution: 'तुरुंगातील व्हीआयपी गैरव्यवहारांचा पर्दाफाश, सायबर गुन्हे अन्वेषण आणि निर्भिड जनसेवा (राष्ट्रपती पदक सन्मानित).'
  },
  {
    id: 13,
    service: 'IPS',
    name: 'डॉ. किरण बेदी',
    image: '/assets/images/officers/officer_kiran_bedi.jpg',
    cadre: 'भारतीय पोलीस सेवा (भारतातील पहिल्या महिला IPS - 1972)',
    designation: 'माजी पोलीस महासंचालक व माजी नायब राज्यपाल',
    location: 'नवी दिल्ली / पुद्दुचेरी',
    department: 'पोलीस सुधारणा व प्रशासन',
    category: 'IPS अधिकारी',
    icon: '🇮🇳',
    contribution: 'तिहार जेल सुधारणा (रॅमन मॅगसेसे पुरस्कार), वाहतूक शिस्त आणि महिला सबलीकरणाच्या अग्रदूत.'
  },
  {
    id: 14,
    service: 'IPS',
    name: 'श्री. शिवदीप लांडे',
    image: '/assets/images/officers/officer_shivdeep_lande.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 2006)',
    designation: 'पोलीस महानिरीक्षक (IGP)',
    location: 'महाराष्ट्र / बिहार',
    department: 'गुन्हे अन्वेषण व अमली पदार्थ विरोधी दल (ANC)',
    category: 'IPS अधिकारी',
    icon: '⚡',
    contribution: 'अमली पदार्थ माफियांचे कंबरडे मोडणे, महिला छेडछाड विरोधी मोहीम आणि युवकांचे अत्यंत लोकप्रिय कर्तव्यदक्ष पोलीस अधिकारी.'
  },
  {
    id: 15,
    service: 'केंद्र शासन',
    name: 'श्री. अजित डोवाल',
    image: '/assets/images/officers/officer_doval.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 1968 / कीर्ती चक्र)',
    designation: 'राष्ट्रीय सुरक्षा सल्लागार (NSA), भारत सरकार',
    location: 'पंतप्रधान कार्यालय (PMO), नवी दिल्ली',
    department: 'राष्ट्रीय सुरक्षा परिषद',
    category: 'केंद्र शासन',
    icon: '🛡️',
    contribution: 'भारताच्या सामरिक सुरक्षेचे शिल्पकार, सर्जिकल स्ट्राईक व बालाकोट मोहिमांचे धोरणात्मक नियोजन आणि आंतरराष्ट्रीय मुत्सद्देगिरी.'
  },
  {
    id: 16,
    service: 'IAS',
    name: 'सौ. टीना डाबी',
    image: '/assets/images/officers/officer_tina_dabi.jpg',
    cadre: 'भारतीय प्रशासकीय सेवा (IAS - 2016 UPSC Topper Rank 1)',
    designation: 'जिल्हाधिकारी व जिल्हा दंडाधिकारी',
    location: 'जिल्हाधिकारी कार्यालय',
    department: 'महसूल, शिक्षण व महिला सक्षमीकरण',
    category: 'IAS अधिकारी',
    icon: '🌟',
    contribution: 'मातृत्व व बाल संगोपन योजनांचा प्रभावी विस्तार, तळागाळातील लोकांचे प्रश्न प्रत्यक्ष दरबारात सोडवणे.'
  },
  {
    id: 17,
    service: 'IAS',
    name: 'सौ. हरी चंदना दासारी',
    image: '/assets/images/officers/officer_hari_chandana.jpg',
    cadre: 'भारतीय प्रशासकीय सेवा (IAS - 2010)',
    designation: 'संचालक व सहसचिव, शासन सेवा',
    location: 'सचिवालय / नागरी प्रशासन',
    department: 'नागरी पुनरुत्थान व शाश्वत विकास',
    category: 'IAS अधिकारी',
    icon: '🌱',
    contribution: 'प्लास्टिक कचऱ्यापासून रस्ते व उद्याने निर्मिती (ग्रीन इनोव्हेशन), महिला स्वयंरोजगार निर्मितीमध्ये राष्ट्रीय सन्मान.'
  },
  {
    id: 18,
    service: 'IAS',
    name: 'श्री. सुप्रिया कुमार रॉय',
    image: '/assets/images/officers/officer_ias_admin.jpg',
    cadre: 'भारतीय प्रशासकीय सेवा (IAS)',
    designation: 'विभागीय आयुक्त / सचिव',
    location: 'प्रशासकीय भवन',
    department: 'सामान्य प्रशासन व माहिती तंत्रज्ञान',
    category: 'IAS अधिकारी',
    icon: '💻',
    contribution: 'ई-ऑफिस सिस्टीम, सरकारी कार्यालयांचे पेपरलेस कामकाज आणि नागरिक सेवा हमी कायद्याची काटेकोर अंमलबजावणी.'
  },
  {
    id: 19,
    service: 'IFS',
    name: 'श्री. आनंद रेड्डी',
    image: '/assets/images/officers/officer_ifs_forest.jpg',
    cadre: 'भारतीय वन सेवा (IFS - 2008)',
    designation: 'मुख्य वनसंरक्षक व क्षेत्र संचालक',
    location: 'सह्याद्री व्याघ्र प्रकल्प, महाराष्ट्र',
    department: 'पर्यावरण, वने व वन्यजीव संवर्धन',
    category: 'IFS अधिकारी',
    icon: '🐅',
    contribution: 'वाघ व बिबट्या संवर्धन प्रकल्प, जंगलातील वणवे रोखण्यासाठी आधुनिक सॅटेलाइट यंत्रणा आणि वनपर्यटन विकास.'
  },
  {
    id: 20,
    service: 'IPS',
    name: 'श्री. के. विजय कुमार',
    image: '/assets/images/officers/officer_vijay_kumar_face.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 1975)',
    designation: 'माजी महासंचालक (DGP, CRPF) व सुरक्षा सल्लागार',
    location: 'नवी दिल्ली / गृह मंत्रालय',
    department: 'केंद्रीय राखीव पोलीस दल व गृह मंत्रालय',
    category: 'IPS अधिकारी',
    icon: '🎖️',
    contribution: "'ऑपरेशन कोकून' द्वारे कुख्यात वीरप्पनचा खात्मा करणाऱ्या विशेष कृती दलाचे (STF) ऐतिहासिक नेतृत्व, CRPF चे आधुनिकीकरण."
  },
  {
    id: 21,
    service: 'राज्यसेवा',
    name: 'श्री. संग्राम जगताप',
    image: '/assets/images/officers/officer_collector_face.jpg',
    cadre: 'महाराष्ट्र नागरी सेवा (MPSC Class-I)',
    designation: 'निवासी उपजिल्हाधिकारी (RDC)',
    location: 'जिल्हाधिकारी कार्यालय, छत्रपती संभाजीनगर',
    department: 'महसूल व जिल्हा प्रशासन',
    category: 'राज्यसेवा अधिकारी',
    icon: '📜',
    contribution: '७/१२ फेरफार डिजिटल स्वाक्षरीकरण मोहीम, शेतकऱ्यांचे जमीन वाद सामोपचाराने मिटवण्यासाठी विशेष लोकअदालत.'
  },
  {
    id: 22,
    service: 'IPS',
    name: 'सौ. अर्चना रामासुंदरम',
    image: '/assets/images/officers/officer_archana_face.jpg',
    cadre: 'भारतीय पोलीस सेवा (IPS - 1980 / माजी महासंचालक)',
    designation: 'माजी महासंचालक (DGP, SSB - सशस्त्र सीमा बल)',
    location: 'नवी दिल्ली / भारत सरकार',
    department: 'केंद्रीय निमलष्करी दल व गृह मंत्रालय',
    category: 'IPS अधिकारी',
    icon: '🇮🇳',
    contribution: 'भारतातील केंद्रीय निमलष्करी दलाचे (SSB) नेतृत्व करणाऱ्या पहिल्या महिला महासंचालक, सीबीआय अतिरिक्त संचालक म्हणून ऐतिहासिक कार्य.'
  },
  {
    id: 23,
    service: 'केंद्र शासन',
    name: 'श्री. राजीव गौबा',
    image: '/assets/images/officers/officer_rajiv_gauba_face.jpg',
    cadre: 'भारतीय प्रशासकीय सेवा (IAS - 1982)',
    designation: 'माजी कॅबिनेट सचिव (Cabinet Secretary of India)',
    location: 'मंत्रिमंडळ सचिवालय, नवी दिल्ली',
    department: 'पंतप्रधान कार्यालय व कॅबिनेट सचिवालय',
    category: 'केंद्र शासन',
    icon: '🏛️',
    contribution: 'देशातील सर्वोच्च प्रशासकीय पद भूषविणारे ज्येष्ठ अधिकारी, आंतरराष्ट्रीय धोरणे आणि राष्ट्रीय प्रशासकीय सुधारणांचे मुख्य समन्वयक.'
  },
  {
    id: 24,
    service: 'इतर',
    name: 'श्री. धनंजय कुलकर्णी',
    image: '/assets/images/officers/officer_district_judge.jpg',
    cadre: 'महाराष्ट्र उच्च न्यायिक सेवा (Higher Judicial Service)',
    designation: 'प्रधान जिल्हा व सत्र न्यायाधीश',
    location: 'जिल्हा व सत्र न्यायालय, कोल्हापूर',
    department: 'विधी व न्याय विभाग',
    category: 'इतर',
    icon: '⚖️',
    contribution: 'जलदगती न्यायालयांद्वारे प्रलंबित दाव्यांचा जलद निपटारा, मध्यस्थी केंद्र (Mediation Center) द्वारे हजारो वाद मिटवले.'
  },
  {
    id: 25,
    service: 'केंद्र शासन',
    name: 'डॉ. पी. के. मिश्रा',
    image: '/assets/images/officers/officer_pk_mishra_face.jpg',
    cadre: 'भारतीय प्रशासकीय सेवा (IAS - 1972)',
    designation: 'पंतप्रधानांचे प्रधान सचिव (Principal Secretary to PM)',
    location: 'पंतप्रधान कार्यालय (PMO), नवी दिल्ली',
    department: 'पंतप्रधान कार्यालय, भारत सरकार',
    category: 'केंद्र शासन',
    icon: '🇮🇳',
    contribution: 'आपत्ती व्यवस्थापन क्षेत्रातील आंतरराष्ट्रीय सासाकावा पुरस्कार विजेते, राष्ट्रीय विकासाच्या महत्त्वाकांक्षी प्रकल्पांचे नियोजन.'
  }
];

const categories = [
  'सर्व अधिकारी',
  'IAS अधिकारी',
  'IPS अधिकारी',
  'IFS अधिकारी',
  'राज्यसेवा अधिकारी',
  'केंद्र शासन',
  'इतर'
];

export default function GovernmentOfficersPage() {
  const [officersList, setOfficersList] = useState(officersData);
  const [selectedCat, setSelectedCat] = useState('सर्व अधिकारी');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [newOfficerForm, setNewOfficerForm] = useState({ name: '', category: 'IAS अधिकारी', designation: '', postingCity: 'मंत्रालय, मुंबई', department: 'सामान्य प्रशासन', contribution: '' });

  useEffect(() => {
    apiClient.getOfficers()
      .then(list => {
        if (Array.isArray(list) && list.length > 0) {
          const formatted = list.map(o => ({
            id: o.id,
            service: o.service || 'IAS',
            name: o.name,
            image: o.photo || null,
            cadre: o.batch || o.cadre || 'भारतीय प्रशासकीय सेवा',
            designation: o.designation || 'वरिष्ठ अधिकारी',
            location: o.postingCity || o.location || 'महाराष्ट्र',
            department: o.department || 'सामान्य प्रशासन',
            category: o.category || (o.designation && o.designation.includes('पोलीस') ? 'IPS अधिकारी' : 'IAS अधिकारी'),
            icon: o.icon || '🏛️',
            contribution: o.contribution || 'प्रशासकीय सेवा व जनकल्याण'
          }));
          setOfficersList(prev => {
            const existingNames = new Set(prev.map(p => p.name));
            const newEntries = formatted.filter(f => !existingNames.has(f.name));
            return [...newEntries, ...prev];
          });
        }
      })
      .catch(err => console.warn('Could not load live officers:', err.message));
  }, []);

  const handleAddOfficerSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.addOfficer({
        name: newOfficerForm.name,
        designation: newOfficerForm.designation,
        department: newOfficerForm.department,
        batch: newOfficerForm.category,
        postingCity: newOfficerForm.postingCity
      });
      const added = {
        id: 'OFF-' + Date.now(),
        service: newOfficerForm.category.replace(' अधिकारी', ''),
        name: newOfficerForm.name,
        image: '/assets/images/officers/officer_tukaram.jpg',
        cadre: newOfficerForm.category,
        designation: newOfficerForm.designation,
        location: newOfficerForm.postingCity,
        department: newOfficerForm.department,
        category: newOfficerForm.category,
        icon: '🏛️',
        contribution: newOfficerForm.contribution || 'प्रशासकीय सेवा'
      };
      setOfficersList(prev => [added, ...prev]);
      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    }
  };

  const filtered = officersList.filter((o) => {
    const matchCat = selectedCat === 'सर्व अधिकारी' || o.category === selectedCat;
    const matchSearch =
      (o.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.designation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="government-officers-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'url("/assets/images/connect-maratha-council.jpg") center 30%/cover no-repeat',
        color: '#FFFFFF',
        padding: '52px 20px 48px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(230, 81, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 213, 79, 0.6)',
            padding: '6px 18px',
            borderRadius: '20px',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '14px',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            🚩 CONNECT मराठा — एक लढा भगव्यासाठी | सर्वधर्म समभाव
          </div>
          <p style={{
            fontSize: '1.25rem',
            color: '#FFE082',
            fontWeight: 700,
            margin: '0 0 8px',
            textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.95)'
          }}>
            समाजाच्या प्रगतीसाठी, शासन सेवेत कार्यरत
          </p>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 2.7rem)',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0 0 12px',
            textShadow: '0 4px 16px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.95)'
          }}>
            आपले अभिमानास्पद शासकीय अधिकारी !
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: '#FFFFFF',
            opacity: 0.98,
            margin: '0 auto 24px',
            maxWidth: '720px',
            lineHeight: 1.6,
            fontWeight: 500,
            textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.95)'
          }}>
            प्रामाणिक सेवा, निष्ठावान नेतृत्व, समाज आणि राष्ट्रासाठी समर्पित ! || जय भवानी ! जय शिवाजी !
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#FFD54F',
                color: '#BF360C',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
              }}
            >
              ＋ अधिकारी नोंदणी / माहिती जोडा
            </button>
            <a
              href="#officers-list"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.6)',
                backdropFilter: 'blur(4px)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              अधिकारी यादी पहा ({officersData.length}+)
            </a>
          </div>
        </div>
      </section>

      {/* Search & Categories */}
      <div id="officers-list" style={{ maxWidth: '1180px', margin: '28px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '24px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.07)',
          border: '1px solid #EADBCE'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="नाव, पद, विभाग, शहर शोधा..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '8px',
                border: '1.5px solid #D7CCC8',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map((cat) => {
              const count = cat === 'सर्व अधिकारी'
                ? officersList.length
                : officersList.filter(o => o.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    border: selectedCat === cat ? '2px solid #E65100' : '1px solid #E0E0E0',
                    background: selectedCat === cat ? '#E65100' : '#FFFFFF',
                    color: selectedCat === cat ? '#FFFFFF' : '#424242',
                    fontSize: '0.9rem',
                    fontWeight: selectedCat === cat ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: selectedCat === cat ? '0 4px 10px rgba(230,81,0,0.25)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{cat}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '1px 7px',
                    borderRadius: '10px',
                    background: selectedCat === cat ? '#FFE0B2' : '#F0F0F0',
                    color: selectedCat === cat ? '#E65100' : '#616161',
                    fontWeight: 700
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Officers Grid */}
      <section style={{ maxWidth: '1180px', margin: '36px auto', padding: '0 16px' }}>
        {filtered.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '48px 20px',
            textAlign: 'center',
            border: '1px solid #EADBCE',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏛️</div>
            <h3 style={{ fontSize: '1.3rem', color: '#1B1B1B', fontWeight: 700, margin: '0 0 8px' }}>
              या प्रवर्गात सध्या अधिकारी माहिती उपलब्ध नाही
            </h3>
            <p style={{ color: '#666', fontSize: '0.95rem', margin: '0 auto 16px', maxWidth: '500px' }}>
              आपण स्वतः कर्तव्यदक्ष अधिकाऱ्यांची माहिती जोडून समाजाला मार्गदर्शन करू शकता.
            </p>
            <button
              onClick={() => setSelectedCat('सर्व अधिकारी')}
              style={{
                background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              सर्व अधिकारी पहा
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
            {filtered.map((o) => (
            <div
              key={o.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E8DFD8',
                overflow: 'hidden',
                boxShadow: '0 6px 16px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{
                background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                padding: '24px 20px',
                borderBottom: '1px solid #FFCC80',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                {o.image ? (
                  <img
                    src={o.image}
                    alt={o.name}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      objectFit: 'cover',
                      border: '2px solid #E65100',
                      boxShadow: '0 4px 10px rgba(230,81,0,0.2)',
                      flexShrink: 0
                    }}
                  />
                ) : (
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    boxShadow: '0 4px 10px rgba(230,81,0,0.2)'
                  }}>
                    {o.service}
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1B1B1B', margin: '0 0 4px' }}>
                    {o.name}
                  </h3>
                  <span style={{ fontSize: '0.8rem', background: '#E65100', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    {o.cadre}
                  </span>
                </div>
              </div>

              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ color: '#E65100', fontWeight: 700, fontSize: '0.95rem' }}>
                  🎖️ {o.designation}
                </div>
                <div>
                  <strong>📍 पोस्टिंग:</strong> {o.location}
                </div>
                <div>
                  <strong>🏛️ विभाग:</strong> {o.department}
                </div>
                <div style={{ color: '#666', fontSize: '0.82rem', marginTop: '4px' }}>
                  <strong>महत्त्वाचे कार्य:</strong> {o.contribution}
                </div>
              </div>

              <div style={{ padding: '14px 20px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE' }}>
                <button
                  onClick={() => setSelectedOfficer(o)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 6px rgba(230,81,0,0.25)'
                  }}
                >
                  अधिकारी तपशील पहा
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Bottom Highlight */}
      <section style={{ maxWidth: '1180px', margin: '30px auto 0', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #D84315 0%, #E65100 50%, #BF360C 100%)',
          borderRadius: '16px',
          padding: '36px 24px',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(216,67,21,0.25)'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px' }}>
            आपल्या समाजाचा अभिमान वाढवा !
          </h2>
          <p style={{ fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto 20px', opacity: 0.95 }}>
            आपल्याला माहिती असलेले कर्तव्यदक्ष शासकीय अधिकारी Connect Maratha वर जोडा आणि नवीन पिढीला प्रेरणा द्या.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#FFFFFF',
              color: '#D84315',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            अधिकारी प्रोफाइल जोडा →
          </button>
        </div>
      </section>

      {/* Modal: Officer Detail */}
      {selectedOfficer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedOfficer(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.5rem' }}>{selectedOfficer.icon}</span>
              <h2 style={{ color: '#1B1B1B', margin: '8px 0 4px', fontSize: '1.5rem', fontWeight: 800 }}>{selectedOfficer.name}</h2>
              <span style={{ background: '#FFE0B2', color: '#E65100', padding: '3px 12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.86rem' }}>
                {selectedOfficer.cadre}
              </span>
            </div>
            <div style={{ fontSize: '0.92rem', color: '#444', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><strong style={{ color: '#E65100' }}>🎖️ सध्याचे पद:</strong> {selectedOfficer.designation}</div>
              <div><strong>📍 कार्यक्षेत्र:</strong> {selectedOfficer.location}</div>
              <div><strong>🏛️ मंत्रालय / विभाग:</strong> {selectedOfficer.department}</div>
              <div><strong>✨ योगदान:</strong> {selectedOfficer.contribution}</div>
            </div>
            <button
              onClick={() => setSelectedOfficer(null)}
              style={{ width: '100%', marginTop: '20px', background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(230,81,0,0.25)' }}
            >
              बंद करा
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Officer */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '28px',
            position: 'relative'
          }}>
            <button
              onClick={() => { setShowAddModal(false); setSubmitted(false); }}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#eee', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1B1B1B', margin: '0 0 6px' }}>
              🏛️ शासकीय अधिकारी माहिती जोडा
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666', margin: '0 0 16px' }}>
              समाजातील प्रेरणादायी अधिकाऱ्यांची माहिती Connect Maratha वर सादर करा.
            </p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontSize: '3rem' }}>🎉</span>
                <h3 style={{ color: '#2E7D32', margin: '10px 0' }}>माहिती सादर झाली!</h3>
                <p style={{ color: '#555', fontSize: '0.9rem' }}>प्रशासकीय पडताळणीनंतर प्रोफाइल यादीत समाविष्ट केली जाईल.</p>
                <button
                  onClick={() => { setShowAddModal(false); setSubmitted(false); }}
                  style={{ background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                >
                  ठीक आहे
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddOfficerSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    required
                    placeholder="अधिकाऱ्यांचे नाव *"
                    value={newOfficerForm.name}
                    onChange={(e) => setNewOfficerForm({ ...newOfficerForm, name: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select
                      value={newOfficerForm.category}
                      onChange={(e) => setNewOfficerForm({ ...newOfficerForm, category: e.target.value })}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    >
                      <option>IAS अधिकारी</option>
                      <option>IPS अधिकारी</option>
                      <option>IFS अधिकारी</option>
                      <option>राज्यसेवा अधिकारी</option>
                      <option>महसूल व पोलीस</option>
                      <option>इतर</option>
                    </select>
                    <input
                      required
                      placeholder="सध्याचे पद (Designation) *"
                      value={newOfficerForm.designation}
                      onChange={(e) => setNewOfficerForm({ ...newOfficerForm, designation: e.target.value })}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                    />
                  </div>
                  <input
                    required
                    placeholder="पोस्टिंगचे ठिकाण / शहर *"
                    value={newOfficerForm.postingCity}
                    onChange={(e) => setNewOfficerForm({ ...newOfficerForm, postingCity: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                  <textarea
                    placeholder="उल्लेखनीय कामगिरी व कार्य"
                    rows="3"
                    value={newOfficerForm.contribution}
                    onChange={(e) => setNewOfficerForm({ ...newOfficerForm, contribution: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  ></textarea>
                  <button type="submit" style={{ background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 6px rgba(230,81,0,0.25)' }}>
                    माहिती थेट सादर करा ✓
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
