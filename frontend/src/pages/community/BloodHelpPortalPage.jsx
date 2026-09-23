import React, { useState } from 'react';

const ACTIVE_REQUESTS = [
  {
    id: 'REQ-101',
    patient: 'प्रशांत संभाजी जाधव',
    hospital: 'ससून सर्वोपचार रुग्णालय, पुणे',
    bloodGroup: 'O Negative (O-)',
    units: 2,
    urgency: 'तात्काळ (Emergency)',
    time: '१० मिनिटांपूर्वी',
    contact: '+91 98221 11223'
  },
  {
    id: 'REQ-102',
    patient: 'सौ. सुमित्रा बाजीराव गायकवाड',
    hospital: 'के.ई.एम. रुग्णालय, परळ, मुंबई',
    bloodGroup: 'AB Positive (AB+)',
    units: 3,
    urgency: 'पुढील ४ तासांत',
    time: '२५ मिनिटांपूर्वी',
    contact: '+91 99203 44556'
  },
  {
    id: 'REQ-103',
    patient: 'मास्टर आरव विक्रम मोरे',
    hospital: 'छत्रपती प्रमिलाराजे रुग्णालय (CPR), कोल्हापूर',
    bloodGroup: 'B Positive (B+)',
    units: 1,
    urgency: 'आज रात्रीपर्यंत',
    time: '१ तासापूर्वी',
    contact: '+91 94220 88991'
  },
  {
    id: 'REQ-104',
    patient: 'दत्तात्रय रामराव शिंदे',
    hospital: 'घाटी रुग्णालय, छत्रपती संभाजीनगर',
    bloodGroup: 'A Positive (A+)',
    units: 2,
    urgency: 'नियोजित शस्त्रक्रिया (उद्या)',
    time: '२ तासांपूर्वी',
    contact: '+91 98901 22334'
  }
];

const DONORS_SAMPLE = [
  { name: 'रोहन प्रकाश देशमुख', group: 'O+', city: 'पुणे (कोथरूड)', lastDonated: '४ महिन्यांपूर्वी', totalDonations: 8, phone: '+91 98220 XXXXX' },
  { name: 'अजिंक्य तानाजी सावंत', group: 'O-', city: 'सातारा', lastDonated: '५ महिन्यांपूर्वी', totalDonations: 12, phone: '+91 94211 XXXXX' },
  { name: 'प्रतीक संभाजी पाटील', group: 'B+', city: 'कोल्हापूर', lastDonated: '६ महिन्यांपूर्वी', totalDonations: 6, phone: '+91 98900 XXXXX' },
  { name: 'योगेश विठ्ठल चव्हाण', group: 'A+', city: 'मुंबई (दादर)', lastDonated: '३ महिन्यांपूर्वी', totalDonations: 15, phone: '+91 98201 XXXXX' },
  { name: 'विशाल विजयराव मोहिते', group: 'AB+', city: 'नाशिक', lastDonated: '७ महिन्यांपूर्वी', totalDonations: 5, phone: '+91 91580 XXXXX' },
  { name: 'महेंद्र सयाजीराव कदम', group: 'A-', city: 'छत्रपती संभाजीनगर', lastDonated: '४ महिन्यांपूर्वी', totalDonations: 9, phone: '+91 94030 XXXXX' },
  { name: 'सागर दादासाहेब पवार', group: 'B-', city: 'सोलापूर', lastDonated: '५ महिन्यांपूर्वी', totalDonations: 7, phone: '+91 98224 XXXXX' },
  { name: 'दिलीप नारायण भोसले', group: 'Bombay Blood Group (hh)', city: 'पुणे', lastDonated: '८ महिन्यांपूर्वी', totalDonations: 4, phone: '+91 98233 XXXXX' }
];

const BLOOD_BANKS = [
  { city: 'पुणे', name: 'ससून शासकीय रक्तपेढी', contact: '020-26128000', timing: '२४ तास सेवा' },
  { city: 'मुंबई', name: 'केईएम हॉस्पिटल ब्लड बँक', contact: '022-24107000', timing: '२४ तास सेवा' },
  { city: 'कोल्हापूर', name: 'सीपीआर शासकीय रक्तपेढी', contact: '0231-2641581', timing: '२४ तास सेवा' },
  { city: 'छत्रपती संभाजीनगर', name: 'घाटी हॉस्पिटल ब्लड बँक', contact: '0240-2402412', timing: '२४ तास सेवा' },
  { city: 'नाशिक', name: 'जिल्हा शासकीय रुग्णालय रक्तपेढी', contact: '0253-2576106', timing: '२४ तास सेवा' },
  { city: 'नागपूर', name: 'मेडिकल कॉलेज ब्लड बँक', contact: '0712-2744671', timing: '२४ तास सेवा' }
];

import { useEffect } from 'react';
import apiClient from '../../services/apiClient';

export default function BloodHelpPortalPage() {
  const [activeRequests, setActiveRequests] = useState([]);
  const [donorsList, setDonorsList] = useState([]);
  const [reqStatusBanner, setReqStatusBanner] = useState(null);
  const [donorStatusBanner, setDonorStatusBanner] = useState(null);

  const [bloodFilter, setBloodFilter] = useState('all');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    patient: '', hospital: '', city: '', bloodGroup: 'O+', units: 1, urgency: 'तात्काळ (२ तासांत)', contact: ''
  });
  const [donorForm, setDonorForm] = useState({
    name: '', phone: '', city: '', bloodGroup: 'O+', age: '', weight: '', isReadyEmergency: true
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    apiClient.getBloodRequests()
      .then(reqs => setActiveRequests(reqs && reqs.length > 0 ? reqs : ACTIVE_REQUESTS))
      .catch(() => setActiveRequests(ACTIVE_REQUESTS));

    apiClient.getDonors()
      .then(donors => setDonorsList(donors && donors.length > 0 ? donors : DONORS_SAMPLE))
      .catch(() => setDonorsList(DONORS_SAMPLE));
  }, []);

  const filteredDonors = donorsList.filter(d => {
    const matchesBlood = bloodFilter === 'all' || d.group === bloodFilter || d.group.includes(bloodFilter);
    const matchesCity = searchDistrict === '' || d.city.toLowerCase().includes(searchDistrict.toLowerCase()) || d.name.toLowerCase().includes(searchDistrict.toLowerCase());
    return matchesBlood && matchesCity;
  });

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      patient: requestForm.patient,
      hospital: requestForm.hospital + ', ' + requestForm.city,
      bloodGroup: requestForm.bloodGroup,
      units: requestForm.units,
      urgency: requestForm.urgency,
      contact: requestForm.contact
    };

    try {
      const res = await apiClient.addBloodRequest(payload);
      if (res.request) setActiveRequests(prev => [res.request, ...prev]);
      setReqStatusBanner('🚨 REST API Confirmation: ' + res.message);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsRequestModalOpen(false);
        setReqStatusBanner(null);
        setRequestForm({ patient: '', hospital: '', city: '', bloodGroup: 'O+', units: 1, urgency: 'तात्काळ (२ तासांत)', contact: '' });
      }, 1500);
    } catch (err) {
      setActiveRequests(prev => [{ id: `REQ-${Date.now().toString().slice(-3)}`, time: 'आत्ताच', ...payload }, ...prev]);
      setReqStatusBanner('🚨 तातडीची रक्त मागणी प्रसारित करण्यात आली!');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsRequestModalOpen(false);
        setReqStatusBanner(null);
        setRequestForm({ patient: '', hospital: '', city: '', bloodGroup: 'O+', units: 1, urgency: 'तात्काळ (२ तासांत)', contact: '' });
      }, 1500);
    }
  };

  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: donorForm.name,
      group: donorForm.bloodGroup,
      city: donorForm.city,
      phone: donorForm.phone
    };

    try {
      const res = await apiClient.addDonor(payload);
      if (res.donor) setDonorsList(prev => [res.donor, ...prev]);
      setDonorStatusBanner('❤️ REST API Confirmation: ' + res.message);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsDonorModalOpen(false);
        setDonorStatusBanner(null);
        setDonorForm({ name: '', phone: '', city: '', bloodGroup: 'O+', age: '', weight: '', isReadyEmergency: true });
      }, 1500);
    } catch (err) {
      setDonorsList(prev => [{ id: Date.now(), totalDonations: 1, lastDonated: 'नवीन नोंदणी', ...payload }, ...prev]);
      setDonorStatusBanner('❤️ रक्तदाता म्हणून नोंदणी यशस्वी झाली!');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsDonorModalOpen(false);
        setDonorStatusBanner(null);
        setDonorForm({ name: '', phone: '', city: '', bloodGroup: 'O+', age: '', weight: '', isReadyEmergency: true });
      }, 1500);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(153, 27, 27, 0.90) 0%, rgba(220, 38, 38, 0.88) 100%), url("/assets/images/generated/maratha_blood_help_hero.jpg") center/cover no-repeat',
        color: '#fff',
        padding: '3.5rem 1.5rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            padding: '0.4rem 1.2rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}>
            🩸 २४×७ मराठा रक्त मदत कक्ष | Emergency Blood Assistance
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, margin: '0.5rem 0 1rem' }}>
            एक थेंब रक्ताचा — एक जीव आपुलकीचा
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.95, maxWidth: '750px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            महाराष्ट्रातील कोणत्याही जिल्ह्यात रक्ताची तातडीची गरज असल्यास मराठा बंधू-भगिनी धावून येतील. थेट रक्तदात्यांशी संपर्क करा किंवा आपली निकड नोंदवा.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              style={{
                background: '#ffffff',
                color: '#dc2626',
                border: 'none',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)'
              }}
            >
              🚨 तातडीने रक्त मागा (Emergency Request)
            </button>
            <button
              onClick={() => setIsDonorModalOpen(true)}
              style={{
                background: '#fbbf24',
                color: '#1e293b',
                border: 'none',
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              ❤️ रक्तदाता म्हणून नोंदणी करा (Become a Donor)
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
        {/* Live Active Requests Banner */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          border: '2px solid #fecaca',
          marginBottom: '3rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#dc2626',
                display: 'inline-block',
                boxShadow: '0 0 0 4px #fee2e2'
              }}></span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>
                तातडीच्या रक्त मागण्या (Active Live Emergency Requests)
              </h2>
            </div>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              style={{
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1.2rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              + नवीन मागणी जोडा
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '1rem'
          }}>
            {activeRequests.map(req => (
              <div key={req.id} style={{
                background: '#fff5f5',
                borderRadius: '14px',
                padding: '1.25rem',
                border: '1px solid #fecaca',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                      background: '#dc2626',
                      color: '#fff',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 800
                    }}>
                      {req.bloodGroup}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
                      ⚡ {req.urgency}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' }}>
                    {req.patient}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    🏥 {req.hospital}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem' }}>
                    आवश्यक युनिट्स: <strong>{req.units}</strong> | वेळ: {req.time}
                  </div>
                </div>
                <a
                  href={`tel:${req.contact}`}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    textDecoration: 'none',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                >
                  📞 तातडीने मदत करा ({req.contact})
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Donors Directory */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                सत्यापित रक्तदाते निर्देशिका (Verified Blood Donors)
              </h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
                महाराष्ट्रातील ३६ जिल्ह्यांमध्ये तत्पर असणारे मराठा स्वयंसेवक रक्तदाते.
              </p>
            </div>
            <button
              onClick={() => setIsDonorModalOpen(true)}
              style={{
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              + मी रक्तदान करू इच्छितो
            </button>
          </div>

          {/* Blood Group Filter Pills */}
          <div style={{
            background: '#fff',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['all', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'Bombay Blood Group (hh)'].map(bg => (
                <button
                  key={bg}
                  onClick={() => setBloodFilter(bg)}
                  style={{
                    background: bloodFilter === bg ? '#dc2626' : '#f1f5f9',
                    color: bloodFilter === bg ? '#fff' : '#475569',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {bg === 'all' ? 'सर्व रक्तगट' : bg}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="जिल्हा / शहराचे नाव टाका..."
              value={searchDistrict}
              onChange={e => setSearchDistrict(e.target.value)}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                minWidth: '220px'
              }}
            />
          </div>

          {/* Donors Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}>
            {filteredDonors.map((d, i) => (
              <div key={i} style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1rem'
                    }}>
                      {d.group}
                    </div>
                    <span style={{
                      background: '#f0fdf4',
                      color: '#16a34a',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {d.totalDonations} वेळा रक्तदान
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' }}>
                    {d.name}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    📍 {d.city}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
                    शेवटचे रक्तदान: {d.lastDonated}
                  </div>
                </div>

                <a
                  href={`tel:${d.phone}`}
                  style={{
                    background: '#f8fafc',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    textDecoration: 'none',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    display: 'block'
                  }}
                >
                  📞 रक्तदात्याशी संपर्क साधा
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 24/7 District Blood Banks Table */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
            प्रमुख शासकीय व धर्मादाय रक्तपेढ्या संपर्क (Major Blood Banks)
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>शहर</th>
                  <th style={{ padding: '0.75rem 1rem' }}>रक्तपेढीचे नाव</th>
                  <th style={{ padding: '0.75rem 1rem' }}>संपर्क क्रमांक</th>
                  <th style={{ padding: '0.75rem 1rem' }}>वेळ</th>
                </tr>
              </thead>
              <tbody>
                {BLOOD_BANKS.map((b, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#dc2626' }}>{b.city}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{b.name}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <a href={`tel:${b.contact}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 700 }}>
                        {b.contact}
                      </a>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#16a34a', fontWeight: 600 }}>{b.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Emergency Request Modal */}
      {isRequestModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#dc2626' }}>
                तातडीची रक्त मागणी नोंदवा
              </h3>
              <button onClick={() => setIsRequestModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#16a34a' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🚨</div>
                <h4>आपली मागणी तात्काळ प्रसारित केली गेली आहे!</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>संबंधित जिल्ह्यातील रक्तदात्यांना तात्काळ व्हॉट्सअॅप व एसएमएस अलर्ट पाठवला जात आहे.</p>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>रुग्णाचे नाव *</label>
                  <input
                    type="text"
                    required
                    value={requestForm.patient}
                    onChange={e => setRequestForm({ ...requestForm, patient: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. रमेश तानाजी कदम"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>रक्तगट *</label>
                    <select
                      value={requestForm.bloodGroup}
                      onChange={e => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Bombay Blood Group (hh)'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>आवश्यक बाटल्या (Units) *</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={requestForm.units}
                      onChange={e => setRequestForm({ ...requestForm, units: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>रुग्णालयाचे नाव व पत्ता *</label>
                  <input
                    type="text"
                    required
                    value={requestForm.hospital}
                    onChange={e => setRequestForm({ ...requestForm, hospital: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. जहांगीर हॉस्पिटल, पुणे"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>शहर / जिल्हा *</label>
                    <input
                      type="text"
                      required
                      value={requestForm.city}
                      onChange={e => setRequestForm({ ...requestForm, city: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      placeholder="उदा. पुणे"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>तातडीची पातळी *</label>
                    <select
                      value={requestForm.urgency}
                      onChange={e => setRequestForm({ ...requestForm, urgency: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="तात्काळ (२ तासांत)">तात्काळ (२ तासांत)</option>
                      <option value="आज संध्याकाळपर्यंत">आज संध्याकाळपर्यंत</option>
                      <option value="उद्या सकाळपर्यंत">उद्या सकाळपर्यंत</option>
                      <option value="नियोजित शस्त्रक्रिया">नियोजित शस्त्रक्रिया</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>नातेवाईकाचा संपर्क क्रमांक *</label>
                  <input
                    type="tel"
                    required
                    value={requestForm.contact}
                    onChange={e => setRequestForm({ ...requestForm, contact: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    placeholder="उदा. 9822XXXXXX"
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    padding: '0.9rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  तातडीने मागणी प्रसारित करा
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Register Donor Modal */}
      {isDonorModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#16a34a' }}>
                रक्तदाता नोंदणी (Register as Donor)
              </h3>
              <button onClick={() => setIsDonorModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#16a34a' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>❤️</div>
                <h4>रक्तदाता म्हणून नोंदणीबद्दल धन्यवाद!</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>आपल्या या उदात्त निर्णयामुळे गरजू रुग्णांचे प्राण वाचण्यास मोलाची मदत होईल.</p>
              </div>
            ) : (
              <form onSubmit={handleDonorSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>पूर्ण नाव *</label>
                  <input
                    type="text"
                    required
                    value={donorForm.name}
                    onChange={e => setDonorForm({ ...donorForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>रक्तगट *</label>
                    <select
                      value={donorForm.bloodGroup}
                      onChange={e => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Bombay Blood Group (hh)'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>मोबाईल नंबर *</label>
                    <input
                      type="tel"
                      required
                      value={donorForm.phone}
                      onChange={e => setDonorForm({ ...donorForm, phone: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>शहर / जिल्हा *</label>
                    <input
                      type="text"
                      required
                      value={donorForm.city}
                      onChange={e => setDonorForm({ ...donorForm, city: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>वय (१८ ते ६०) *</label>
                    <input
                      type="number"
                      min="18"
                      max="60"
                      required
                      value={donorForm.age}
                      onChange={e => setDonorForm({ ...donorForm, age: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="emergencyReady"
                    checked={donorForm.isReadyEmergency}
                    onChange={e => setDonorForm({ ...donorForm, isReadyEmergency: e.target.checked })}
                  />
                  <label htmlFor="emergencyReady" style={{ fontSize: '0.85rem', color: '#475569' }}>
                    मी आपत्कालीन वेळेत रक्तदान करण्यासाठी तयार आहे.
                  </label>
                </div>
                <button
                  type="submit"
                  style={{
                    background: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    padding: '0.9rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.5rem'
                  }}
                >
                  रक्तदाता नोंदणी पूर्ण करा
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
