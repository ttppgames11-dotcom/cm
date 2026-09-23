import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const doctorsData = [
  {
    id: 1,
    name: 'डॉ. सचिन देशमुख',
    specialty: 'हृदय रोग तज्ज्ञ',
    category: 'हृदय रोग',
    icon: '❤️',
    photo: '/assets/images/doctors/dr_patil.jpg',
    degree: 'MD, DM (Cardiology)',
    city: 'पुणे, महाराष्ट्र',
    experience: '१६+ वर्षे अनुभव',
    hospital: 'दीनानाथ मंगेशकर रुग्णालय, पुणे',
    phone: '+91 98220 12345',
    timing: 'सकाळी १० ते सायं ५',
    rating: '४.९ (२४०+ पुनरावलोकने)'
  },
  {
    id: 2,
    name: 'डॉ. अमोल पाटील',
    specialty: 'मेंदू व मज्जारोग तज्ज्ञ',
    category: 'मेंदू व मज्जारोग',
    icon: '🧠',
    photo: '/assets/images/doctors/dr_jadhav.jpg',
    degree: 'MCh (Neurosurgery)',
    city: 'मुंबई, महाराष्ट्र',
    experience: '१४+ वर्षे अनुभव',
    hospital: 'केईएम व हिंदुजा रुग्णालय, मुंबई',
    phone: '+91 98200 54321',
    timing: 'सकाळी ११ ते सायं ६',
    rating: '४.८ (१९५+ पुनरावलोकने)'
  },
  {
    id: 3,
    name: 'डॉ. वैशाली कदम',
    specialty: 'कॅन्सर तज्ज्ञ (ऑन्कोलॉजिस्ट)',
    category: 'कॅन्सर तज्ज्ञ',
    icon: '🎗️',
    photo: '/assets/images/doctors/dr_deshmukh.jpg',
    degree: 'MD, DM (Medical Oncology)',
    city: 'नाशिक, महाराष्ट्र',
    experience: '१२+ वर्षे अनुभव',
    hospital: 'अपोलो कॅन्सर सेंटर, नाशिक',
    phone: '+91 98500 87654',
    timing: 'सकाळी ९ ते दु. २',
    rating: '४.९ (३१०+ पुनरावलोकने)'
  },
  {
    id: 4,
    name: 'डॉ. नितीन शिंदे',
    specialty: 'हाडे व सांधे तज्ज्ञ (ऑर्थोपेडिक)',
    category: 'हाडे व सांधे',
    icon: '🦴',
    photo: '/assets/images/doctors/dr_shinde.jpg',
    degree: 'MS (Orthopaedics), Fellowship Joint Replacement',
    city: 'सांगली, महाराष्ट्र',
    experience: '१८+ वर्षे अनुभव',
    hospital: 'सह्याद्री ऑर्थो केअर, सांगली',
    phone: '+91 94220 33445',
    timing: 'सकाळी १० ते सायं ७',
    rating: '४.७ (१६०+ पुनरावलोकने)'
  },
  {
    id: 5,
    name: 'डॉ. श्रद्धा मोरे',
    specialty: 'बालरोग तज्ज्ञ (पीडियाट्रिशियन)',
    category: 'बालरोग',
    icon: '👶',
    photo: '/assets/images/doctors/dr_bhosale.jpg',
    degree: 'MD (Pediatrics), DNB',
    city: 'कोल्हापूर, महाराष्ट्र',
    experience: '१०+ वर्षे अनुभव',
    hospital: 'बालगोपाल चिल्ड्रन्स हॉस्पिटल, कोल्हापूर',
    phone: '+91 91580 99887',
    timing: 'सकाळी ९:३० ते दु. १:३०, सायं ५ ते ८',
    rating: '४.९ (२८५+ पुनरावलोकने)'
  },
  {
    id: 6,
    name: 'डॉ. प्राजक्ता देशमुख',
    specialty: 'स्त्रीरोग व प्रसूती तज्ज्ञ',
    category: 'स्त्रीरोग',
    icon: '♀️',
    photo: '/assets/images/doctors/dr_kadam.jpg',
    degree: 'MS (Obst. & Gynae), DGO',
    city: 'पुणे, महाराष्ट्र',
    experience: '१५+ वर्षे अनुभव',
    hospital: 'मातृसेवा हॉस्पिटल, कोथरूड, पुणे',
    phone: '+91 98224 45566',
    timing: 'सकाळी १० ते दु. २, सायं ६ ते ९',
    rating: '४.८ (३४०+ पुनरावलोकने)'
  },
  {
    id: 7,
    name: 'डॉ. राजेंद्र पवार',
    specialty: 'डोळे तज्ज्ञ (नेत्ररोग विशेषज्ञ)',
    category: 'डोळे',
    icon: '👁️',
    photo: '/assets/images/doctors/dr_patil.jpg',
    degree: 'MS (Ophthalmology), Phaco Specialist',
    city: 'छत्रपती संभाजीनगर, महाराष्ट्र',
    experience: '२०+ वर्षे अनुभव',
    hospital: 'दृष्टी आय इन्स्टिट्यूट, औरंगाबाद',
    phone: '+91 94230 77889',
    timing: 'सकाळी १० ते सायं ५:३०',
    rating: '४.९ (४२०+ पुनरावलोकने)'
  },
  {
    id: 8,
    name: 'डॉ. रोहित जाधव',
    specialty: 'त्वचारोग तज्ज्ञ (डर्मेटोलॉजिस्ट)',
    category: 'इतर',
    icon: '🩺',
    photo: '/assets/images/doctors/dr_jadhav.jpg',
    degree: 'MD (Dermatology), Cosmetologist',
    city: 'नागपूर, महाराष्ट्र',
    experience: '११+ वर्षे अनुभव',
    hospital: 'ग्लो स्किन अँड लेसर क्लिनिक, नागपूर',
    phone: '+91 97650 11223',
    timing: 'सकाळी ११ ते सायं ७',
    rating: '४.७ (१७५+ पुनरावलोकने)'
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
        if (data && data.length > 0) setDoctorsList(data);
        else setDoctorsList(doctorsData);
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
      if (res.doctor) {
        setDoctorsList(prev => [res.doctor, ...prev]);
      }
      setApiStatusBanner({ type: 'success', text: '✅ REST API Confirmation: ' + res.message });
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
    const matchCat = selectedCat === 'सर्व डॉक्टर' || doc.category === selectedCat;
    const matchSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCity = !selectedCity || doc.city.includes(selectedCity);
    return matchCat && matchSearch && matchCity;
  });

  return (
    <div className="doctors-directory-page" style={{ background: '#FBF8F3', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #7A1C1C 0%, #B71C1C 50%, #E65100 100%)',
        color: '#FFFFFF',
        padding: '48px 20px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 8px 24px rgba(122,28,28,0.25)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '6px 18px',
            borderRadius: '20px',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '14px',
            color: '#FFD54F'
          }}>
            🚩 CONNECT मराठा — एक लढा भगव्यासाठी | सर्वधर्म समभाव
          </div>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFE082', marginBottom: '8px' }}>
            आरोग्य हीच खरी सेवा,
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 10px', textShadow: '0 3px 8px rgba(0,0,0,0.3)' }}>
            मराठा डॉक्टर — समाजाचा अभिमान !
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, maxWidth: '720px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            तज्ज्ञ उपचार, संवेदनशील सेवा, समाजासाठी समर्पण || जय भवानी ! जय शिवाजी !
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: '#FFD54F',
                color: '#7A1C1C',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
            >
              ＋ आपला प्रोफाइल जोडा
            </button>
            <a
              href="#search-section"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              🔍 डॉक्टर शोधा ({doctorsData.length}+)
            </a>
          </div>
        </div>
      </section>

      {/* Main Search & Filter Section */}
      <div id="search-section" style={{ maxWidth: '1180px', margin: '-24px auto 0', padding: '0 16px', position: 'relative', zIndex: 10 }}>
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
                  border: selectedCat === cat ? '2px solid #B71C1C' : '1px solid #E0E0E0',
                  background: selectedCat === cat ? '#B71C1C' : '#FFFFFF',
                  color: selectedCat === cat ? '#FFFFFF' : '#424242',
                  fontSize: '0.9rem',
                  fontWeight: selectedCat === cat ? 700 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
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
              style={{ background: '#B71C1C', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
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
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '14px',
                      objectFit: 'cover',
                      border: '2px solid #FFCC80',
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
                    <div style={{ color: '#C62828', fontWeight: 700, fontSize: '0.92rem', marginBottom: '2px' }}>
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
                      background: '#B71C1C',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    अपॉइंटमेंट बुक करा
                  </button>
                  <button
                    onClick={() => alert(`${doc.name} यांचा संपर्क क्रमांक: ${doc.phone}`)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '8px',
                      border: '1.5px solid #B71C1C',
                      background: '#FFFFFF',
                      color: '#B71C1C',
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
                      background: '#B71C1C',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      marginTop: '8px'
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
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7A1C1C', margin: '0 0 6px' }}>
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
                  style={{ background: '#7A1C1C', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginTop: '12px' }}
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
                  <button type="submit" style={{ background: '#B71C1C', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
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
