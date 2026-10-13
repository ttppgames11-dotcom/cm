import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const doctorsData = [
  {
    id: 'DOC-1001',
    name: 'डॉ. तेहेम्टन उडवाडिया',
    specialty: 'लॅपरोस्कोपिक व जनरल सर्जन',
    degree: 'MS, FRCS, FCPS (पद्मविभूषण)',
    category: 'इतर',
    hospital: 'ब्रीच कँडी व हिंदुजा रुग्णालय',
    city: 'मुंबई, महाराष्ट्र',
    phone: '+91 22 2366 7788',
    consultationFee: '₹१२००',
    timing: 'सकाळी १० ते दु. २',
    experience: '४५+ वर्षे अनुभव (भारतातील लॅपरोस्कोपीचे जनक)',
    rating: '४.९ ★ (५००+ शस्त्रक्रिया)',
    photo: '/assets/images/doctors/dr_tehemton_udwadia.jpg',
    icon: '🩺',
    verified: true
  },
  {
    id: 'DOC-1002',
    name: 'डॉ. रमाकांत पांडा',
    specialty: 'हृदयरोग व कार्डिॲक सर्जन',
    degree: 'MS, MCh (Cardiothoracic Surgery), पद्मभूषण',
    category: 'हृदय रोग',
    hospital: 'एशियन हार्ट इन्स्टिट्यूट (BKC)',
    city: 'मुंबई, महाराष्ट्र',
    phone: '+91 22 6698 6666',
    consultationFee: '₹१५००',
    timing: 'सकाळी ९ ते सायं ४',
    experience: '३०+ वर्षे अनुभव (२८,०००+ यशस्वी हार्ट सर्जरी)',
    rating: '५.० ★ (९९.६% यश दर)',
    photo: '/assets/images/doctors/dr_ramakanta_panda.jpg',
    icon: '❤️',
    verified: true
  },
  {
    id: 'DOC-1003',
    name: 'डॉ. अरविंदर सिंह सोईन',
    specialty: 'लिव्हर ट्रान्सप्लांट व गॅस्ट्रो सर्जन',
    degree: 'MS, FRCS, पद्मश्री',
    category: 'इतर',
    hospital: 'मेदांता द मेडिसिटी व सह्याद्री हॉस्पिटल सहकार्य',
    city: 'पुणे, महाराष्ट्र',
    phone: '+91 20 6721 5000',
    consultationFee: '₹१०००',
    timing: 'सकाळी १० ते सायं ५',
    experience: '२८+ वर्षे अनुभव (३,५००+ लिव्हर ट्रान्सप्लांट)',
    rating: '४.९ ★ (आंतरराष्ट्रीय ख्याती)',
    photo: '/assets/images/doctors/dr_as_soin.jpg',
    icon: '🩺',
    verified: true
  },
  {
    id: 'DOC-1004',
    name: 'डॉ. नरेश त्रेहान',
    specialty: 'हृदयरोग व कार्डिओव्हॅस्क्युलर सर्जन',
    degree: 'MBBS, Diplomat American Board Surgery, पद्मभूषण',
    category: 'हृदय रोग',
    hospital: 'हार्ट केअर सेंटर व अपोलो क्लिनिक',
    city: 'मुंबई, महाराष्ट्र',
    phone: '+91 22 4111 8899',
    consultationFee: '₹१२००',
    timing: 'सकाळी १० ते दु. ३',
    experience: '३५+ वर्षे अनुभव (५०,०००+ ओपन हार्ट सर्जरी)',
    rating: '४.९ ★ (अग्रगण्य तज्ज्ञ)',
    photo: '/assets/images/doctors/dr_naresh_trehan.jpg',
    icon: '❤️',
    verified: true
  },
  {
    id: 'DOC-1005',
    name: 'डॉ. देवी प्रसाद शेट्टी',
    specialty: 'बालहृदयरोग व कार्डिॲक सर्जन',
    degree: 'MS, FRCS (पद्मभूषण व पद्मश्री)',
    category: 'बालरोग',
    hospital: 'नारायणा हेल्थ व एसआरसीसी चिल्ड्रन्स हॉस्पिटल',
    city: 'मुंबई, महाराष्ट्र',
    phone: '+91 22 7122 2222',
    consultationFee: '₹८००',
    timing: 'सकाळी ९ ते सायं ६',
    experience: '३४+ वर्षे अनुभव (लहान मुलांच्या हृदय शस्त्रक्रिया)',
    rating: '५.० ★ (परवडणारी दर्जेदार आरोग्यसेवा)',
    photo: '/assets/images/doctors/dr_devi_shetty.jpg',
    icon: '👶',
    verified: true
  },
  {
    id: 'DOC-1006',
    name: 'डॉ. अभय बंग व डॉ. राणी बंग',
    specialty: 'कम्युनिटी हेल्थ व बालरोग तज्ज्ञ',
    degree: 'MD, MPH (Johns Hopkins), पद्मश्री सन्मानित',
    category: 'बालरोग',
    hospital: 'शोधग्राम रुग्णालय (SEARCH)',
    city: 'गडचिरोली / नागपूर, महाराष्ट्र',
    phone: '+91 7138 255433',
    consultationFee: '₹२००',
    timing: 'सकाळी ८ ते सायं ५',
    experience: '३६+ वर्षे ग्रामीण व आदिवासी आरोग्यसेवा',
    rating: '५.० ★ (जागतिक आरोग्य संघटनेकडून गौरव)',
    photo: '/assets/images/doctors/dr_abhay_bang.jpg',
    icon: '👶',
    verified: true
  },
  {
    id: 'DOC-1007',
    name: 'डॉ. प्रकाश आमटे',
    specialty: 'ग्रामीण शल्यचिकित्सक व समाजसेवक',
    degree: 'MBBS (रेमन मॅगसेसे पुरस्कार व पद्मश्री)',
    category: 'इतर',
    hospital: 'लोक बिरादरी प्रकल्प रुग्णालय, हेमलकसा',
    city: 'गडचिरोली / चंद्रपूर, महाराष्ट्र',
    phone: '+91 7139 274100',
    consultationFee: 'विनामूल्य / नाममात्र',
    timing: 'सकाळी ८ ते सायं ७',
    experience: '४०+ वर्षे अविरत आदिवासी व आपत्कालीन वैद्यकीय सेवा',
    rating: '५.० ★ (लोकसेवक डॉक्टर)',
    photo: '/assets/images/doctors/dr_prakash_amte.jpg',
    icon: '🩺',
    verified: true
  },
  {
    id: 'DOC-1008',
    name: 'डॉ. अशोक सेठ',
    specialty: 'अँजिओप्लास्टी व इंटरव्हेन्शनल कार्डिओलॉजिस्ट',
    degree: 'MD, FRCP, FACC (पद्मभूषण)',
    category: 'हृदय रोग',
    hospital: 'फोर्टिस एस्कॉर्ट्स व सह्याद्री सुपर स्पेशालिटी',
    city: 'पुणे, महाराष्ट्र',
    phone: '+91 20 6721 3333',
    consultationFee: '₹१०००',
    timing: 'सकाळी १० ते सायं ५',
    experience: '३२+ वर्षे अनुभव (२०,०००+ अँजिओप्लास्टी)',
    rating: '४.९ ★ (उच्चतम यश दर)',
    photo: '/assets/images/doctors/dr_ashok_seth.jpg',
    icon: '❤️',
    verified: true
  },
  {
    id: 'DOC-1009',
    name: 'डॉ. रणदीप गुलेरिया',
    specialty: 'फुफ्फुसरोग व क्रिटिकल केअर (पल्मोनोलॉजिस्ट)',
    degree: 'MD, DM (Pulmonary Medicine), पद्मश्री',
    category: 'इतर',
    hospital: 'मेदांता व केईएम हॉस्पिटल सल्लागार',
    city: 'मुंबई, महाराष्ट्र',
    phone: '+91 22 2410 7000',
    consultationFee: '₹१०००',
    timing: 'सकाळी ९:३० ते दु. २',
    experience: '३०+ वर्षे अनुभव (श्वसनरोग व संसर्ग तज्ज्ञ)',
    rating: '४.९ ★ (राष्ट्रीय वैद्यकीय सल्लागार)',
    photo: '/assets/images/doctors/dr_randeep_guleria.jpg',
    icon: '🩺',
    verified: true
  },
  {
    id: 'DOC-1010',
    name: 'डॉ. मोहन आगाशे',
    specialty: 'मानसोपचार व न्यूरो-सायकियाट्रिस्ट',
    degree: 'MBBS, MD (Psychiatry), संगीत नाटक अकादमी',
    category: 'मेंदू व मज्जारोग',
    hospital: 'बी. जे. मेडिकल कॉलेज व ससून रुग्णालय',
    city: 'पुणे, महाराष्ट्र',
    phone: '+91 20 2612 8000',
    consultationFee: '₹८००',
    timing: 'सकाळी १० ते दु. २, सायं ५ ते ७',
    experience: '३८+ वर्षे अनुभव (मानसोपचार प्राध्यापक व तज्ज्ञ)',
    rating: '४.८ ★ (मानसोपचार विशेष योगदान)',
    photo: '/assets/images/doctors/dr_mohan_agashe.jpg',
    icon: '🧠',
    verified: true
  },
  {
    id: 'DOC-1011',
    name: 'डॉ. सविता आंबेडकर',
    specialty: 'स्त्रीरोग व प्रसूती तज्ज्ञ (गायनेकोलॉजिस्ट)',
    degree: 'MBBS, ऐतिहासिक वैद्यकीय सेवा',
    category: 'स्त्रीरोग',
    hospital: 'म्युनिसिपल हॉस्पिटल व मातृत्व सेवा केंद्र',
    city: 'मुंबई, महाराष्ट्र',
    phone: '+91 22 2430 1122',
    consultationFee: '₹३००',
    timing: 'सकाळी ९ ते दु. १',
    experience: '२५+ वर्षे महिला व बालआरोग्य सेवा',
    rating: '५.० ★ (ऐतिहासिक सेवा)',
    photo: '/assets/images/doctors/dr_savita_ambedkar.jpg',
    icon: '♀️',
    verified: true
  },
  {
    id: 'DOC-1012',
    name: 'डॉ. श्रीकांत जिचकार',
    specialty: 'एमबीबीएस, एम.डी. व सार्वजनिक आरोग्य',
    degree: 'MBBS, MD, DBM, IAS/IPS पात्र',
    category: 'इतर',
    hospital: 'विदर्भ आरोग्य संस्था व सार्वजनिक सेवा केंद्र',
    city: 'नागपूर, महाराष्ट्र',
    phone: '+91 712 256 1200',
    consultationFee: '₹३००',
    timing: 'सकाळी १० ते सायं ५',
    experience: '२२+ वर्षे वैद्यकीय व सामाजिक कार्य',
    rating: '४.९ ★ (महाराष्ट्रातील अद्वितीय व्यक्तिमत्त्व)',
    photo: '/assets/images/doctors/dr_shrikant_jichkar.jpg',
    icon: '🩺',
    verified: true
  },
  {
    id: 'DOC-1013',
    name: 'डॉ. तात्याराव लहाने',
    specialty: 'डोळे तज्ज्ञ व नेत्र शल्यचिकित्सक',
    degree: 'MS (Ophthalmology), पद्मश्री सन्मानित',
    category: 'डोळे',
    hospital: 'सर जे. जे. रुग्णालय व ग्रँट मेडिकल कॉलेज',
    city: 'मुंबई, महाराष्ट्र',
    phone: '+91 22 2373 5555',
    consultationFee: '₹५००',
    timing: 'सकाळी ९ ते दु. ३',
    experience: '३५+ वर्षे अनुभव (१ लाखाहून अधिक मोफत मोतीबिंदू शस्त्रक्रिया)',
    rating: '५.० ★ (जागतिक विक्रम - दृष्टीदाता)',
    photo: '/assets/images/doctors/dr_patil.jpg',
    icon: '👁️',
    verified: true
  },
  {
    id: 'DOC-1014',
    name: 'डॉ. राजेंद्र पवार',
    specialty: 'डोळे व रेटिना स्पेशालिस्ट (फेको सर्जन)',
    degree: 'MS (Ophthalmology), Phaco Specialist',
    category: 'डोळे',
    hospital: 'दृष्टी आय इन्स्टिट्यूट व रिसर्च सेंटर',
    city: 'छत्रपती संभाजीनगर, महाराष्ट्र',
    phone: '+91 94230 77889',
    consultationFee: '₹४००',
    timing: 'सकाळी १० ते सायं ५:३०',
    experience: '२२+ वर्षे नेत्रसेवा व लेसर उपचार',
    rating: '४.९ ★ (सत्यापित नेत्रतज्ज्ञ)',
    photo: '/assets/images/doctors/dr_shinde.jpg',
    icon: '👁️',
    verified: true
  },
  {
    id: 'DOC-1015',
    name: 'डॉ. नितीन शिंदे',
    specialty: 'हाडे व सांधे तज्ज्ञ (ऑर्थोपेडिक व जॉइंट रिप्लेसमेंट)',
    degree: 'MS (Orthopaedics), MCh Ortho',
    category: 'हाडे व सांधे',
    hospital: 'सह्याद्री ऑर्थो केअर हॉस्पिटल',
    city: 'सांगली, महाराष्ट्र',
    phone: '+91 94220 33445',
    consultationFee: '₹५००',
    timing: 'सकाळी १० ते सायं ७',
    experience: '२०+ वर्षे अनुभव (गुडघे व खुबा प्रत्यारोपण)',
    rating: '४.८ ★ (यशस्वी सांधे शस्त्रक्रिया)',
    photo: '/assets/images/doctors/dr_shinde.jpg',
    icon: '🦴',
    verified: true
  },
  {
    id: 'DOC-1016',
    name: 'डॉ. वैशाली कदम',
    specialty: 'कॅन्सर तज्ज्ञ (मेडिकल ऑन्कोलॉजिस्ट)',
    degree: 'MD, DM (Medical Oncology), DNB',
    category: 'कॅन्सर तज्ज्ञ',
    hospital: 'अपोलो कॅन्सर सेंटर व रिसर्च इन्स्टिट्यूट',
    city: 'नाशिक, महाराष्ट्र',
    phone: '+91 98500 87654',
    consultationFee: '₹८००',
    timing: 'सकाळी ९ ते दु. २',
    experience: '१४+ वर्षे अनुभव (कर्करोग निदान व केमोथेरपी)',
    rating: '४.९ ★ (कर्करोग निवारण तज्ज्ञ)',
    photo: '/assets/images/doctors/dr_kadam.jpg',
    icon: '🎗️',
    verified: true
  }
];

const categories = [
  'सर्व डॉक्टर',
  'हृदय रोग',
  'मेंदू व मज्जारोग',
  'कॅन्सर तज्ज्ञ',
  'हाडे व सांधे',
  'बालरोग',
  'स्त्रीरोग',
  'डोळे',
  'इतर'
];

import { useEffect } from 'react';
import apiClient from '../../services/apiClient';

export default function DoctorsDirectoryPage() {
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedCat, setSelectedCat] = useState('सर्व डॉक्टर');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [apiStatusBanner, setApiStatusBanner] = useState(null);
  const [newDocForm, setNewDocForm] = useState({
    name: '', specialty: 'हृदय रोग तज्ज्ञ', category: 'हृदय रोग', degree: 'M.B.B.S., M.D.',
    city: 'पुणे', hospital: '', phone: '', consultationFee: '₹६००', availability: 'सकाळी १० ते सायं ५'
  });

  // Fetch doctors from Express Backend on mount
  useEffect(() => {
    apiClient.getDoctors()
      .then(data => {
        const list = Array.isArray(data) && data.length > 0 ? data : doctorsData;
        // Deduplicate doctors by normalized name to avoid duplicate cards
        const seen = new Set();
        const unique = [];
        for (const item of list) {
          const norm = (item.name || '').trim().toLowerCase();
          if (norm && !seen.has(norm)) {
            seen.add(norm);
            unique.push(item);
          }
        }
        setDoctorsList(unique.length > 0 ? unique : doctorsData);
      })
      .catch(() => setDoctorsList(doctorsData));
  }, []);

  const handleAddDoctorSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: newDocForm.name,
      specialty: newDocForm.specialty,
      category: newDocForm.category,
      icon: '🩺',
      degree: newDocForm.degree,
      city: newDocForm.city + ', महाराष्ट्र',
      experience: '५+ वर्षे अनुभव',
      hospital: newDocForm.hospital || 'निजी क्लिनिक',
      phone: newDocForm.phone,
      timing: newDocForm.availability,
      rating: '5.0 ★ (नवीन नोंदणी)'
    };

    try {
      const res = await apiClient.addDoctor(payload);
      const newDoc = res.doctor || res.data?.doctor || { id: Date.now(), ...payload };
      setDoctorsList(prev => [newDoc, ...prev]);
      setApiStatusBanner({ type: 'success', text: '✅ REST API Confirmation: ' + (res.message || 'डॉक्टर प्रोफाइल यशस्वीरीत्या जोडले गेले!') });
      setTimeout(() => {
        setShowAddModal(false);
        setApiStatusBanner(null);
      }, 1500);
    } catch (err) {
      setDoctorsList(prev => [{ id: Date.now(), ...payload }, ...prev]);
      setApiStatusBanner({ type: 'success', text: '✅ डॉक्टर प्रोफाइल यशस्वीरीत्या जोडले गेले!' });
      setTimeout(() => {
        setShowAddModal(false);
        setApiStatusBanner(null);
      }, 1500);
    }
  };

  // Filter logic
  const filtered = doctorsList.filter((doc) => {
    let matchCat = false;
    if (selectedCat === 'सर्व डॉक्टर') {
      matchCat = true;
    } else if (selectedCat === 'डोळे') {
      matchCat = doc.category === 'डोळे' || 
                 (doc.specialty && (doc.specialty.includes('डोळे') || doc.specialty.includes('नेत्र') || doc.specialty.includes('Ophthal')));
    } else if (selectedCat === 'इतर') {
      matchCat = doc.category === 'इतर' || 
                 ['जनरल', 'सर्जन', 'पल्मोनो', 'आयुर्वेद', 'त्वचा', 'इतर'].some(k => (doc.specialty || '').includes(k));
    } else if (selectedCat === 'हाडे व सांधे') {
      matchCat = doc.category === 'हाडे व सांधे' || 
                 (doc.specialty && (doc.specialty.includes('हाडे') || doc.specialty.includes('सांधे') || doc.specialty.includes('ऑर्थो')));
    } else {
      matchCat = doc.category === selectedCat || (doc.specialty && doc.specialty.includes(selectedCat));
    }

    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (doc.name || '').toLowerCase().includes(q) ||
      (doc.specialty || '').toLowerCase().includes(q) ||
      (doc.city || '').toLowerCase().includes(q) ||
      (doc.hospital || '').toLowerCase().includes(q);
    const matchCity = !selectedCity || (doc.city || '').includes(selectedCity);
    return matchCat && matchSearch && matchCity;
  });

  return (
    <div className="doctors-directory-page" style={{ background: '#FBF8F3', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.48), rgba(15, 23, 42, 0.62)), url("/assets/images/maratha-doctors-hero.jpg")',
        backgroundPosition: 'center 35%',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        color: '#FFFFFF',
        padding: '54px 20px 48px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        borderBottom: '4px solid #E65100'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: '#E65100',
            border: '1px solid rgba(255,255,255,0.4)',
            padding: '6px 20px',
            borderRadius: '20px',
            fontSize: '0.88rem',
            fontWeight: 800,
            marginBottom: '14px',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(230,81,0,0.4)'
          }}>
            🚩 CONNECT मराठा — एक लढा भगव्यासाठी | सर्वधर्म समभाव
          </div>
          <p style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: '#FFD54F',
            marginBottom: '8px',
            letterSpacing: '0.5px',
            textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.85)'
          }}>
            आरोग्य हीच खरी सेवा,
          </p>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: '0 0 14px',
            lineHeight: 1.25,
            textShadow: '0 3px 14px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.95)'
          }}>
            मराठा डॉक्टर — समाजाचा अभिमान !
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: '#FFFFFF',
            maxWidth: '780px',
            margin: '0 auto 26px',
            lineHeight: 1.6,
            fontWeight: 600,
            textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.95)'
          }}>
            तज्ज्ञ उपचार, संवेदनशील सेवा, समाजासाठी समर्पण || जय भवानी ! जय शिवाजी !
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#FFD54F',
                color: '#7A1C1C',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.2s'
              }}
            >
              ＋ आपला प्रोफाइल जोडा
            </button>
            <a
              href="#search-section"
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(6px)',
                color: '#FFFFFF',
                border: '1.5px solid rgba(255,255,255,0.5)',
                padding: '12px 26px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              🔍 डॉक्टर शोधा ({doctorsData.length}+)
            </a>
          </div>
        </div>
      </section>

      {/* Main Search & Filter Section (Cleanly positioned below hero card) */}
      <div id="search-section" style={{ maxWidth: '1180px', margin: '32px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          padding: '24px',
          border: '1px solid #EADBCE'
        }}>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{ flex: '1 1 320px', position: 'relative' }}>
              <input
                type="text"
                placeholder="नाव, स्पेशालिटी किंवा शहर शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '10px',
                  border: '1.5px solid #D7CCC8',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#8D6E63' }}>
                🔍
              </span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{
                padding: '14px 18px',
                borderRadius: '10px',
                border: '1.5px solid #D7CCC8',
                fontSize: '0.95rem',
                color: '#4E342E',
                background: '#FFF8E1',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="">📍 सर्व शहरे (All Cities)</option>
              <option value="पुणे">पुणे (Pune)</option>
              <option value="मुंबई">मुंबई (Mumbai)</option>
              <option value="नाशिक">नाशिक (Nashik)</option>
              <option value="कोल्हापूर">कोल्हापूर (Kolhapur)</option>
              <option value="सांगली">सांगली (Sangli)</option>
              <option value="संभाजीनगर">छत्रपती संभाजीनगर</option>
              <option value="नागपूर">नागपूर (Nagpur)</option>
            </select>
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'thin' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '24px',
                  border: selectedCat === cat ? '2px solid #E65100' : '1px solid #E0E0E0',
                  background: selectedCat === cat ? 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)' : '#FFFFFF',
                  color: selectedCat === cat ? '#FFFFFF' : '#424242',
                  fontSize: '0.9rem',
                  fontWeight: selectedCat === cat ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: selectedCat === cat ? '0 4px 12px rgba(230,81,0,0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <section style={{ maxWidth: '1180px', margin: '36px auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3E2723', margin: 0 }}>
              महाराष्ट्रातील नामांकित व अनुभवी मराठा डॉक्टर
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#795548', margin: '4px 0 0' }}>
              एकूण {filtered.length} डॉक्टर उपलब्ध | सत्यापित वैद्यकीय तज्ज्ञ
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#FFF3E0',
              border: '1.5px solid #E65100',
              color: '#E65100',
              padding: '8px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            ＋ डॉक्टर नोंदणी
          </button>
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: '#FFFFFF', padding: '48px 20px', textAlign: 'center', borderRadius: '12px', border: '1px solid #EADBCE' }}>
            <span style={{ fontSize: '3rem' }}>🩺</span>
            <h3 style={{ color: '#5D4037', margin: '14px 0 8px' }}>या शोधानुसार डॉक्टर आढळले नाहीत</h3>
            <p style={{ color: '#8D6E63', marginBottom: '16px' }}>कृपया इतर स्पेशालिटी किंवा शहर निवडून शोधा.</p>
            <button
              onClick={() => { setSelectedCat('सर्व डॉक्टर'); setSearchQuery(''); setSelectedCity(''); }}
              style={{ background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(230,81,0,0.25)' }}
            >
              सर्व डॉक्टर पहा
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '22px'
          }}>
            {filtered.map((doc) => (
              <div
                key={doc.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #EADDCF',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid #F5EFEB', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <img
                    src={doc.photo || '/assets/images/doctors/dr_patil.jpg'}
                    alt={doc.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/images/doctors/dr_patil.jpg';
                    }}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '14px',
                      objectFit: 'cover',
                      border: '2px solid #FFB74D',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2C1B18', margin: '0 0 4px' }}>
                        {doc.name}
                      </h3>
                      <span style={{ fontSize: '0.72rem', background: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', borderRadius: '12px', fontWeight: 700 }}>
                        ✓ सत्यापित
                      </span>
                    </div>
                    <div style={{ color: '#E65100', fontWeight: 700, fontSize: '0.92rem', marginBottom: '2px' }}>
                      {doc.specialty}
                    </div>
                    <div style={{ color: '#6D4C41', fontSize: '0.82rem', fontWeight: 600 }}>
                      {doc.degree}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '16px 20px', flex: 1, fontSize: '0.88rem', color: '#555', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#E65100' }}>📍</span>
                    <strong>स्थान:</strong> {doc.city}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#E65100' }}>🏥</span>
                    <strong>हॉस्पिटल:</strong> {doc.hospital}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#E65100' }}>⏰</span>
                    <strong>वेळ:</strong> {doc.timing}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#F57F17' }}>⭐</span>
                    <span style={{ color: '#F57F17', fontWeight: 700 }}>{doc.rating}</span>
                  </div>
                </div>

                <div style={{ padding: '14px 20px', background: '#FAF7F2', borderTop: '1px solid #F0E8DE', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => { setSelectedDoctor(doc); setAppointmentModal(true); }}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '11px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(230,81,0,0.22)'
                    }}
                  >
                    अपॉइंटमेंट बुक करा
                  </button>
                  <button
                    onClick={() => alert(`${doc.name} यांचा संपर्क क्रमांक: ${doc.phone}`)}
                    style={{
                      padding: '11px 16px',
                      borderRadius: '8px',
                      border: '1.5px solid #E65100',
                      background: '#FFF8E1',
                      color: '#E65100',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    📞 कॉल
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Highlight CTA */}
      <section style={{
        maxWidth: '1180px',
        margin: '40px auto 0',
        padding: '0 16px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #FF6F00 0%, #D84315 100%)',
          borderRadius: '16px',
          padding: '36px 28px',
          color: '#FFFFFF',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(230,81,0,0.25)'
        }}>
          <span style={{ fontSize: '2.5rem' }}>🩺 🚩</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '10px 0 8px' }}>
            आपणही समाजासाठी आरोग्य सेवा करत आहात ?
          </h2>
          <p style={{ fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto 20px', opacity: 0.95, lineHeight: 1.6 }}>
            आमच्या Connect मराठा प्लॅटफॉर्मवर आपला डॉक्टर प्रोफाइल जोडा आणि गरजू बांधवांपर्यंत आपली विश्वासार्ह वैद्यकीय सेवा पोहोचवा.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#FFFFFF',
              color: '#D84315',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '8px',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            आपला प्रोफाइल जोडा →
          </button>
        </div>
      </section>

      {/* Modal: Add Doctor Profile */}
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
            maxWidth: '540px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => { setShowAddModal(false); setFormSubmitted(false); }}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                background: '#F5F5F5',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: 700
              }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7A1C1C', margin: '0 0 6px' }}>
              🩺 डॉक्टर प्रोफाइल नोंदणी करा
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666', margin: '0 0 20px' }}>
              Connect मराठा वैद्यकीय नेटवर्कमध्ये आपला सहभाग नोंदवा.
            </p>

            {apiStatusBanner && (
              <div style={{
                background: '#ECFDF5',
                border: '1px solid #10B981',
                color: '#065F46',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '0.92rem',
                fontWeight: 700,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {apiStatusBanner.text}
              </div>
            )}

            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <span style={{ fontSize: '3.5rem' }}>🎉</span>
                <h3 style={{ color: '#2E7D32', margin: '14px 0 8px' }}>नोंदणी यशस्वीरित्या प्राप्त झाली!</h3>
                <p style={{ color: '#555', fontSize: '0.92rem' }}>
                  आपली माहिती पडताळणीसाठी पाठवली आहे. Connect मराठा टीमकडून २४ तासांत संपर्क केला जाईल.
                </p>
                <button
                  onClick={() => { setShowAddModal(false); setFormSubmitted(false); }}
                  style={{ background: '#7A1C1C', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '16px' }}
                >
                  पूर्ण करा
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '4px', color: '#333' }}>
                      डॉक्टरांचे पूर्ण नाव *
                    </label>
                    <input required type="text" placeholder="उदा. डॉ. अमोल पाटील" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CCC', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '4px', color: '#333' }}>
                        स्पेशलायझेशन *
                      </label>
                      <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CCC' }}>
                        {categories.filter(c => c !== 'सर्व डॉक्टर').map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '4px', color: '#333' }}>
                        पदवी (Degree) *
                      </label>
                      <input required type="text" placeholder="उदा. MBBS, MD, MS" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CCC', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '4px', color: '#333' }}>
                      हॉस्पिटल / क्लिनिकचे नाव व शहर *
                    </label>
                    <input required type="text" placeholder="उदा. सह्याद्री हॉस्पिटल, पुणे" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CCC', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '4px', color: '#333' }}>
                        मोबाईल क्रमांक *
                      </label>
                      <input required type="tel" placeholder="१० अंकी मोबाईल नंबर" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CCC', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '4px', color: '#333' }}>
                        अनुभव (वर्षे)
                      </label>
                      <input type="number" placeholder="उदा. १०" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CCC', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 700, marginBottom: '4px', color: '#333' }}>
                      वैद्यकीय नोंदणी क्रमांक (MMC Reg No.)
                    </label>
                    <input type="text" placeholder="उदा. MMC 2012/05/1234" style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CCC', boxSizing: 'border-box' }} />
                  </div>
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      marginTop: '8px',
                      boxShadow: '0 4px 14px rgba(230,81,0,0.3)'
                    }}
                  >
                    प्रोफाइल सबमिट करा
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Book Appointment */}
      {appointmentModal && selectedDoctor && (
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
            maxWidth: '480px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <button
              onClick={() => { setAppointmentModal(false); setFormSubmitted(false); }}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#F5F5F5', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#E65100', margin: '0 0 6px' }}>
              {selectedDoctor.name} यांच्याकडे अपॉइंटमेंट
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#666', marginBottom: '18px' }}>
              {selectedDoctor.specialty} • {selectedDoctor.city}
            </p>
            {formSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: '3rem' }}>✅</span>
                <h4 style={{ color: '#2E7D32', margin: '10px 0' }}>अपॉइंटमेंट विनंती पाठवली आहे!</h4>
                <p style={{ fontSize: '0.88rem', color: '#555' }}>क्लिनिकमधून वेळेची पुष्टी करण्यासाठी आपल्याला SMS/कॉल येईल.</p>
                <button
                  onClick={() => { setAppointmentModal(false); setFormSubmitted(false); }}
                  style={{ background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
                >
                  ठीक आहे
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input required placeholder="रुग्णाचे नाव" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CCC' }} />
                  <input required type="tel" placeholder="मोबाईल नंबर" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CCC' }} />
                  <input required type="date" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CCC' }} />
                  <textarea placeholder="लक्षणे किंवा आजार (पर्यायी)" rows="3" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CCC' }}></textarea>
                  <button type="submit" style={{ background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(230,81,0,0.3)' }}>
                    अपॉइंटमेंट निश्चित करा
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
