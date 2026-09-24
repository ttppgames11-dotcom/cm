import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';

const DEFAULT_MEMBERS = [
  { id: 'M-10291', name: 'राजेश पाटील', profession: 'Civil Infra & Earthmovers', company: 'पाटील इन्फ्रास्ट्रक्चर', city: 'पुणे', avatar: '👨‍💼', phone: '98221 44550' },
  { id: 'M-10292', name: 'सुप्रिया मोहिते', profession: 'Chartered Accountant (CA)', company: 'मोहिते & असोसिएट्स', city: 'मुंबई', avatar: '👩‍💼', phone: '98200 99881' },
  { id: 'M-10293', name: 'तानाजी जाधव', profession: 'Agri Processing & Export', company: 'सह्याद्री ॲग्रो फूड्स', city: 'सातारा', avatar: '👨‍🌾', phone: '98230 44556' },
  { id: 'M-10294', name: 'विक्रम सावंत', profession: 'Automobile Components', company: 'प्रिसिजन ऑटो टेक', city: 'पिंपरी-चिंचवड', avatar: '👨‍🔧', phone: '98500 22334' },
  { id: 'M-10295', name: 'महेश शिंदे', profession: 'Corporate Legal Counsel', company: 'शिंदे & चेंबर्स', city: 'पुणे', avatar: '⚖️', phone: '98663 32211' },
  { id: 'M-10296', name: 'अमोल तुकाराम जाधव', profession: 'Cloud ERP Architect', company: 'स्वराज्य टेक सोल्यूशन्स', city: 'पुणे', avatar: '👨‍💻', phone: '98765 00011' }
];

const INITIAL_SCHEDULED_MEETINGS = [
  {
    id: 'MTG-881',
    partnerName: 'राजेश पाटील',
    partnerCompany: 'पाटील इन्फ्रास्ट्रक्चर',
    partnerProfession: 'Civil Infra & Earthmovers',
    partnerCity: 'पुणे',
    partnerAvatar: '👨‍💼',
    partnerPhone: '98221 44550',
    mode: 'Offline', // 'Offline' | 'Online'
    category: '१-ते-१ व्यावसायिक विश्वास भेट',
    date: '२३ सप्टें २०२६',
    time: 'स. १०:३० वाजता',
    venue: 'हॉटेल प्राइड एक्झिक्युटिव्ह, शिवाजीनगर, पुणे',
    meetLink: '',
    purpose: 'नवीन रेसिडेन्शियल कमर्शियल टॉवरसाठी ERP व CCTV नेटवर्क पुरवठा चर्चा',
    topics: 'प्रोजेक्ट व्याप्ती, अंदाजपत्रक (Budget ₹४.५ लाख), डिलिव्हरी टाइमलाइन',
    status: 'Confirmed', // 'Confirmed' | 'Completed' | 'Cancelled'
    badge: 'उद्या सकाळी'
  },
  {
    id: 'MTG-882',
    partnerName: 'सुप्रिया मोहिते (CA)',
    partnerCompany: 'मोहिते & असोसिएट्स',
    partnerProfession: 'Chartered Accountant (CA)',
    partnerCity: 'मुंबई',
    partnerAvatar: '👩‍💼',
    partnerPhone: '98200 99881',
    mode: 'Online',
    category: 'कंपनी व्हॅल्यूएशन व GST सल्ला',
    date: '२५ सप्टें २०२६',
    time: 'दु. ०३:०० वाजता',
    venue: 'Google Meet व्हिडीओ कॉल',
    meetLink: 'https://meet.google.com/cm-oto-882',
    purpose: 'स्टार्टअप व्हॅल्यूएशन ऑडिट आणि आयकर सवलत मार्गदर्शन',
    topics: 'बॅलन्स शीट स्क्रूटिनी, शेअर्स वाटप, कंपनी नोंदणी दाखले',
    status: 'Confirmed',
    badge: '३ दिवसांत'
  }
];

const INITIAL_PAST_MEETINGS = [
  {
    id: 'MTG-875',
    partnerName: 'तानाजी जाधव',
    partnerCompany: 'सह्याद्री ॲग्रो फूड्स',
    partnerProfession: 'Agri Processing & Export',
    date: '१६ सप्टें २०२६',
    mode: 'Offline',
    venue: 'हॉटेल मराठा पॅलेस, सातारा',
    purpose: 'कोल्ड स्टोरेज ऑटोमेशन व क्लाउड इन्व्हेंटरी सॉफ्टवेअर',
    minutes: '३ कोल्ड स्टोरेज युनिट्ससाठी सॉफ्टवेअर देण्याचे ठरले. कोटेशन ₹२.८ लाखांचे मंजूर झाले.',
    referralDone: true,
    referralId: 'REF-203'
  },
  {
    id: 'MTG-871',
    partnerName: 'महेश शिंदे',
    partnerCompany: 'शिंदे & चेंबर्स',
    date: '१० सप्टें २०२६',
    mode: 'Online',
    venue: 'Google Meet',
    purpose: 'MIDC जमीन हस्तांतरण कायदेशीर कागदपत्रे पडताळणी',
    minutes: 'कायदेशीर छाननी अहवाल पूर्ण झाला. संयुक्त क्लायंट रेफरल देण्याचे मान्य केले.',
    referralDone: true,
    referralId: 'REF-204'
  }
];

const CHAPTER_MEETINGS = [
  {
    id: 'CH-PUNE',
    name: 'पुणे – शिवनेरी व्यवसाय मंडळ (Chapter)',
    schedule: 'दर बुधवारी स. ०७:३० वाजता (Breakfast Meet)',
    venue: 'हॉटेल प्राइड एक्झिक्युटिव्ह, शिवाजीनगर, पुणे',
    agenda: 'पायाभूत सुविधा, ऑटोमोबाईल व आयटी क्षेत्रातील थेट B2B संधी',
    president: 'राजेंद्र मोहिते',
    contact: '98221 44550',
    confirmedAttendees: 46
  },
  {
    id: 'CH-DADAR',
    name: 'मुंबई – दादर व्यापार संगम (Chapter)',
    schedule: 'दर गुरुवारी स. ०७:३० वाजता (Breakfast Meet)',
    venue: 'कोहिनूर हॉल, दादर पश्चिम, मुंबई',
    agenda: 'निर्यात व्यापार, लॉजिस्टिक्स व रिटेल सप्लाय साखळी',
    president: 'प्रमोद सावंत',
    contact: '98200 99881',
    confirmedAttendees: 42
  },
  {
    id: 'CH-PCMC',
    name: 'पिंपरी-चिंचवड औद्योगिक मंडळ (Chapter)',
    schedule: 'दर शुक्रवारी स. ०७:४५ वाजता (Breakfast Meet)',
    venue: 'ऑटो क्लस्टर ऑडिटोरियम, चिंचवड',
    agenda: 'ऑटोमोबाईल व्हेंडर पुरवठा, डाईज, मोल्ड्स व CNC जॉब वर्क्स',
    president: 'सचिन जगताप',
    contact: '98500 22334',
    confirmedAttendees: 51
  },
  {
    id: 'CH-SATARA',
    name: 'सातारा अजिंक्यतारा व्यापारी मंडळ (Chapter)',
    schedule: 'दर गुरुवारी स. ०८:०० वाजता (Breakfast Meet)',
    venue: 'हॉटेल मराठा पॅलेस, सातारा',
    agenda: 'कृषी प्रक्रिया उद्योग, पॅकेजिंग व ट्रान्सपोर्ट सहकार्य',
    president: 'प्रशांत कदम',
    contact: '98220 11223',
    confirmedAttendees: 38
  }
];

export default function MeetingsPortalPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const recipientParam = searchParams.get('recipient');
  const recipientNameParam = searchParams.get('name');

  const [activeTab, setActiveTab] = useState(recipientParam ? 'book' : 'upcoming'); // 'upcoming', 'book', 'past', 'chapter', 'howitworks'
  
  // Scheduled meetings state
  const [scheduledMeetings, setScheduledMeetings] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_scheduled_meetings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SCHEDULED_MEETINGS;
  });

  // Past meetings state
  const [pastMeetings, setPastMeetings] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_past_meetings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PAST_MEETINGS;
  });

  // Booking Form State
  const [bookingData, setBookingData] = useState({
    recipientId: recipientParam || DEFAULT_MEMBERS[0].id,
    mode: 'Offline',
    category: '१-ते-१ व्यावसायिक विश्वास भेट',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: 'स. १०:३० वाजता',
    venue: 'हॉटेल प्राइड एक्झिक्युटिव्ह, शिवाजीनगर, पुणे',
    purpose: '',
    topics: ''
  });

  // Log Minutes Modal
  const [minutesModalMeeting, setMinutesModalMeeting] = useState(null);
  const [minutesText, setMinutesText] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    apiClient.getMeetings()
      .then(liveMeetings => {
        if (Array.isArray(liveMeetings) && liveMeetings.length > 0) {
          const formatted = liveMeetings.map(m => ({
            id: m.id,
            partnerName: m.recipientName || m.partnerName || 'व्यावसायिक सदस्य',
            partnerCompany: m.partnerCompany || 'मराठा व्यावसायिक मंडळ',
            partnerProfession: m.partnerProfession || 'उद्योजक',
            partnerCity: m.partnerCity || 'पुणे',
            partnerAvatar: m.partnerAvatar || '👨‍💼',
            partnerPhone: m.partnerPhone || '98221 44550',
            mode: m.mode || 'Offline',
            category: m.category || '१-ते-१ भेट',
            date: m.date,
            time: m.time,
            venue: m.venue || m.location || 'पुणे',
            meetLink: m.meetLink || '',
            purpose: m.purpose || m.topic || 'व्यवसाय चर्चा',
            topics: m.topics || 'व्यवसाय वृद्धी',
            status: m.status || 'Confirmed',
            badge: 'नियोजित'
          }));
          setScheduledMeetings(formatted);
        }
      })
      .catch(err => console.warn('Could not load live meetings:', err.message));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cm_scheduled_meetings', JSON.stringify(scheduledMeetings));
    } catch (e) {
      console.error(e);
    }
  }, [scheduledMeetings]);

  useEffect(() => {
    try {
      localStorage.setItem('cm_past_meetings', JSON.stringify(pastMeetings));
    } catch (e) {
      console.error(e);
    }
  }, [pastMeetings]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const partner = DEFAULT_MEMBERS.find(m => m.id === bookingData.recipientId) || {
      name: recipientNameParam || 'व्यावसायिक सदस्य',
      company: 'मराठा एंटरप्राइझ',
      profession: 'उद्योजक',
      city: 'पुणे',
      avatar: '👨‍💼',
      phone: '98000 00000'
    };

    const newMeeting = {
      id: 'MTG-' + Math.floor(100 + Math.random() * 900),
      partnerName: partner.name,
      partnerCompany: partner.company,
      partnerProfession: partner.profession,
      partnerCity: partner.city,
      partnerAvatar: partner.avatar,
      partnerPhone: partner.phone,
      mode: bookingData.mode,
      category: bookingData.category,
      date: bookingData.date,
      time: bookingData.time,
      venue: bookingData.mode === 'Online' ? 'Google Meet व्हिडीओ कॉल' : bookingData.venue,
      meetLink: bookingData.mode === 'Online' ? `https://meet.google.com/cm-oto-${Math.floor(1000 + Math.random() * 9000)}` : '',
      purpose: bookingData.purpose || '१-ते-१ व्यावसायिक सहकार्य व नेटवर्किंग',
      topics: bookingData.topics || 'व्यवसाय ओळख, क्षमता, ग्राहक वर्ग व देवाणघेवाण',
      status: 'Confirmed',
      badge: 'नियोजित'
    };

    setScheduledMeetings(prev => [newMeeting, ...prev]);
    showToast(`✓ '${partner.name}' यांच्यासोबत भेट यशस्वीरीत्या निश्चित झाली!`);

    try {
      await apiClient.createMeeting({
        recipientId: bookingData.recipientId,
        recipientName: partner.name,
        date: bookingData.date,
        time: bookingData.time,
        topic: bookingData.purpose || '१-ते-१ व्यावसायिक बैठक',
        location: newMeeting.venue
      });
    } catch (err) {
      console.warn('Could not sync meeting to API:', err.message);
    }

    // Optionally post confirmation message in localStorage messages
    try {
      const savedMessages = localStorage.getItem('cm_member_messages');
      const messagesList = savedMessages ? JSON.parse(savedMessages) : [];
      const chatPartner = messagesList.find(c => c.name.includes(partner.name));
      const autoMsg = {
        id: 'm-' + Date.now(),
        sender: 'me',
        text: `📅 १-ते-१ भेट बुक झाली: ${newMeeting.date} (${newMeeting.time}) • माध्यम: ${newMeeting.mode} • उद्देश: ${newMeeting.purpose}`,
        time: 'आत्ता'
      };
      if (chatPartner) {
        chatPartner.messages.push(autoMsg);
        localStorage.setItem('cm_member_messages', JSON.stringify(messagesList));
      }
    } catch (err) {
      console.warn('Chat auto-message skipped:', err);
    }

    setActiveTab('upcoming');
  };

  const handleCancelMeeting = (id) => {
    setScheduledMeetings(scheduledMeetings.filter(m => m.id !== id));
    showToast(`भेट #${id} रद्द करण्यात आली.`);
  };

  const handleOpenMinutesModal = (m) => {
    setMinutesModalMeeting(m);
    setMinutesText('');
  };

  const handleSaveMinutes = () => {
    if (!minutesModalMeeting) return;
    const completed = {
      id: minutesModalMeeting.id,
      partnerName: minutesModalMeeting.partnerName,
      partnerCompany: minutesModalMeeting.partnerCompany,
      partnerProfession: minutesModalMeeting.partnerProfession,
      date: minutesModalMeeting.date,
      mode: minutesModalMeeting.mode,
      venue: minutesModalMeeting.venue,
      purpose: minutesModalMeeting.purpose,
      minutes: minutesText || 'सविस्तर चर्चा झाली. सहकार्याचे मुद्दे निश्चित झाले.',
      referralDone: false
    };

    setPastMeetings([completed, ...pastMeetings]);
    setScheduledMeetings(scheduledMeetings.filter(m => m.id !== minutesModalMeeting.id));
    setMinutesModalMeeting(null);
    showToast(`✓ भेट #${minutesModalMeeting.id} पूर्ण झाली व मिनिट्स नोंदवले गेले!`);
    setActiveTab('past');
  };

  const handleRSVPChapter = (chapterName) => {
    showToast(`✓ ${chapterName} मधील बैठकीसाठी तुमची उपस्थिती नोंदवली गेली!`);
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: '100vh', padding: '28px 16px 64px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Toast Alert */}
        {toastMessage && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#431407',
            color: '#FDE047',
            border: '1.5px solid #F59E0B',
            padding: '14px 22px',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            zIndex: 10000,
            fontWeight: 700,
            fontSize: '0.92rem'
          }}>
            {toastMessage}
          </div>
        )}

        {/* Breadcrumb Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '0.86rem', color: '#78350f', fontWeight: 700 }}>
            <Link to="/" style={{ color: '#c2410c', textDecoration: 'none' }}>मुख्य पोर्टल</Link> ➔ <Link to="/sangam" style={{ color: '#c2410c', textDecoration: 'none' }}>व्यवसाय संगम</Link> ➔ <span style={{ color: '#431407' }}>१-ते-१ व्यवसाय भेटी</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              to="/messages"
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1.5px solid #fed7aa',
                color: '#c2410c',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              💬 थेट संदेश (Messages)
            </Link>
            <Link
              to="/referrals"
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1.5px solid #fed7aa',
                color: '#c2410c',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🤝 रेफरल इंजिन
            </Link>
          </div>
        </div>

        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #9a3412 100%)',
          borderRadius: '20px',
          padding: '32px 30px',
          color: '#FFFFFF',
          boxShadow: '0 10px 30px rgba(67, 20, 7, 0.25)',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-25px', fontSize: '10rem', opacity: 0.07, userSelect: 'none', pointerEvents: 'none' }}>
            🤝
          </div>

          <div style={{ maxWidth: '820px', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '3px 12px',
              borderRadius: '20px',
              fontSize: '0.76rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              color: '#FDE047',
              marginBottom: '10px'
            }}>
              ☕ 1-TO-1 TRUST MEETINGS & CHAPTER CALENDAR
            </div>

            <h1 style={{
              fontSize: '2.2rem',
              margin: '0 0 10px',
              fontFamily: 'Baloo 2, sans-serif',
              fontWeight: 800,
              lineHeight: 1.25
            }}>
              १-ते-१ व्यावसायिक विश्वास भेटी व संगम कॅलेंडर
            </h1>

            <p style={{
              fontSize: '1rem',
              lineHeight: 1.6,
              color: '#FFEDD5',
              margin: '0 0 18px',
              fontWeight: 500
            }}>
              मराठा उद्योजकांशी प्रत्यक्ष किंवा ऑनलाईन भेट निश्चित करा. सखोल चर्चा, कामाचे प्रात्यक्षिक आणि परस्पर विश्वास संपादन करून मोठ्या B2B व्यवसाय संधी व रेफरल्स मिळवा.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveTab('book')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: '#ea580c',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)'
                }}
              >
                ➕ नवीन भेट बुक करा (Book Meeting)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chapter')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                🏢 साप्ताहिक संगम वेळापत्रक
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('howitworks')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#FDE047',
                  border: '1px solid rgba(253, 224, 71, 0.4)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                💡 कार्यपद्धती (How Connect & Meetings Work)
              </button>
            </div>
          </div>
        </div>

        {/* 4 TOP METRIC TILES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1.5px solid #fed7aa', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.80rem', color: '#9a3412', fontWeight: 700 }}>आगामी नियोजित भेटी</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              {scheduledMeetings.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>सक्रिय कॅलेंडर शेड्युल</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1.5px solid #fed7aa', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.80rem', color: '#9a3412', fontWeight: 700 }}>यशस्वी पूर्ण झालेल्या भेटी</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              {pastMeetings.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>१००% मिनिट्स नोंदणीकृत</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1.5px solid #fed7aa', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.80rem', color: '#9a3412', fontWeight: 700 }}>भेटींमधून झालेला व्यवसाय</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c2410c', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              ₹ २८.४ लाख
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>थेट TYFCB मूल्य</div>
          </div>

          <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '14px', border: '1.5px solid #fed7aa', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.80rem', color: '#9a3412', fontWeight: 700 }}>साप्ताहिक चॅप्टर संगम</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c', margin: '4px 0', fontFamily: 'Baloo 2' }}>
              {CHAPTER_MEETINGS.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#c2410c' }}>सक्रिय नागरी मंडळे</div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #fed7aa', marginBottom: '24px', overflowX: 'auto' }}>
          {[
            { id: 'upcoming', label: '📅 आगामी भेटी (Upcoming)', count: scheduledMeetings.length },
            { id: 'book', label: '➕ नवीन भेट बुक करा (Book Meeting)' },
            { id: 'past', label: '📝 झालेल्या भेटी व पाठपुरावा (Completed)', count: pastMeetings.length },
            { id: 'chapter', label: '🏢 साप्ताहिक चॅप्टर संगम (Chapter Meets)', count: CHAPTER_MEETINGS.length },
            { id: 'howitworks', label: '💡 कार्यपद्धती (Trust Pipeline)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#ea580c' : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : '#7c2d12',
                borderRadius: '8px 8px 0 0',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : '#ffedd5',
                  color: activeTab === tab.id ? '#FFFFFF' : '#c2410c',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.72rem'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: UPCOMING SCHEDULED MEETINGS */}
        {activeTab === 'upcoming' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#431407', fontFamily: 'Baloo 2' }}>
                  आगामी नियोजित १-ते-१ भेटी (Scheduled 1-to-1 Meetings)
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#78350f' }}>
                  नियोजित वेळेनुसार भेट पूर्ण करा, मिनिट्स नोंदवा आणि थेट व्यवसायाची देवाणघेवाण करा.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('book')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: '#ea580c',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer'
                }}
              >
                ➕ नवीन भेट बुक करा
              </button>
            </div>

            {scheduledMeetings.length === 0 ? (
              <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1.5px dashed #fed7aa', padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>☕</div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                  कोणतीही नियोजित भेट नाही
                </h4>
                <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: '#9a3412' }}>
                  डिरेक्टरीमधील उद्योजकांशी किंवा चॅप्टर सहकाऱ्यांशी संपर्क साधून पहिली १-ते-१ विश्वास भेट बुक करा.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('book')}
                  style={{ padding: '9px 18px', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  भेट शेड्यूल करा ➔
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                {scheduledMeetings.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1.5px solid #fed7aa',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                      padding: '22px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{
                          background: m.mode === 'Online' ? '#e0f2fe' : '#fef3c7',
                          color: m.mode === 'Online' ? '#0369a1' : '#92400e',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {m.mode === 'Online' ? '💻 व्हिडीओ कॉल (Online)' : '🏢 प्रत्यक्ष भेट (Offline)'}
                        </span>

                        <span style={{
                          background: '#dcfce7',
                          color: '#166534',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 800
                        }}>
                          {m.badge || 'Confirmed'}
                        </span>
                      </div>

                      {/* Partner Card */}
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                        <span style={{ fontSize: '2.5rem', background: '#fff7ed', padding: '8px', borderRadius: '50%', border: '1px solid #fed7aa' }}>
                          {m.partnerAvatar}
                        </span>
                        <div>
                          <h4 style={{ margin: '0 0 2px', fontSize: '1.15rem', color: '#431407', fontFamily: 'Baloo 2' }}>
                            {m.partnerName}
                          </h4>
                          <div style={{ fontSize: '0.82rem', color: '#ea580c', fontWeight: 700 }}>
                            {m.partnerCompany}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                            {m.partnerProfession} • 📍 {m.partnerCity}
                          </div>
                        </div>
                      </div>

                      {/* Date & Time Box */}
                      <div style={{ background: '#fff7ed', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', border: '1px solid #ffedd5' }}>
                        <div style={{ fontSize: '0.86rem', color: '#7c2d12', fontWeight: 800, marginBottom: '4px' }}>
                          📅 {m.date} • ⏰ {m.time}
                        </div>
                        <div style={{ fontSize: '0.80rem', color: '#9a3412' }}>
                          <strong>📍 ठिकाण:</strong> {m.venue}
                        </div>
                      </div>

                      {/* Purpose & Topics */}
                      <div style={{ fontSize: '0.84rem', color: '#374151', marginBottom: '16px', lineHeight: 1.5 }}>
                        <div style={{ marginBottom: '4px' }}>
                          <strong>🎯 मुख्य उद्देश:</strong> {m.purpose}
                        </div>
                        <div style={{ color: '#6b7280' }}>
                          <strong>📋 चर्चेचे मुद्दे:</strong> {m.topics}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {m.mode === 'Online' && m.meetLink && (
                        <a
                          href={m.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: '#0284c7',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.80rem',
                            textAlign: 'center'
                          }}
                        >
                          💻 कॉल सुरू करा
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenMinutesModal(m)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: '#15803d',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.80rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ मिनिट्स नोंदवा
                      </button>

                      <Link
                        to={`/messages?to=${m.id}&name=${encodeURIComponent(m.partnerName)}`}
                        style={{
                          padding: '8px 12px',
                          background: '#fff7ed',
                          border: '1px solid #fdba74',
                          color: '#c2410c',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.80rem'
                        }}
                      >
                        💬 चॅट
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleCancelMeeting(m.id)}
                        style={{
                          padding: '8px 10px',
                          background: '#fee2e2',
                          border: 'none',
                          color: '#dc2626',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                        title="भेट रद्द करा"
                      >
                        ✕
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BOOK A NEW MEETING FORM */}
        {activeTab === 'book' && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #fed7aa', padding: '32px', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.4rem', color: '#431407', fontFamily: 'Baloo 2' }}>
              ➕ नवीन १-ते-१ भेट बुक करा (Schedule 1-to-1 Trust Meeting)
            </h3>
            <p style={{ margin: '0 0 24px', fontSize: '0.88rem', color: '#78350f' }}>
              सदस्य निवडून भेटीचे स्वरूप, वेळ आणि चर्चेचा अजेंडा ठरवा. भेट निश्चित होताच दोघांच्या कॅलेंडरमध्ये नोंद होईल.
            </p>

            <form onSubmit={handleBookingSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                
                {/* Select Partner */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7c2d12', marginBottom: '6px' }}>
                    कोणासोबत भेट ठरवायची आहे? (Select Member):
                  </label>
                  <select
                    value={bookingData.recipientId}
                    onChange={(e) => setBookingData({ ...bookingData, recipientId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #fed7aa',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#431407',
                      background: '#fff7ed',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {DEFAULT_MEMBERS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.company} ({m.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meeting Category */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7c2d12', marginBottom: '6px' }}>
                    भेटीचा प्रकार (Meeting Purpose Category):
                  </label>
                  <select
                    value={bookingData.category}
                    onChange={(e) => setBookingData({ ...bookingData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #fed7aa',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#431407',
                      background: '#fff7ed',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="१-ते-१ व्यावसायिक विश्वास भेट">🤝 १-ते-१ व्यावसायिक विश्वास भेट</option>
                    <option value="रेफरल व व्यवसाय संधी चर्चा">💼 रेफरल व थेट डील चर्चा</option>
                    <option value="कंपनी व्हॅल्यूएशन व GST सल्ला">📊 कर व आर्थिक नियोजन सल्ला</option>
                    <option value="स्टार्टअप व करिअर मार्गदर्शन">🎯 मार्गदर्शन व मेंटॉरशिप</option>
                    <option value="चॅप्टर नेतृत्व व उपक्रम">🏛️ चॅप्टर नेतृत्व व उपक्रम</option>
                  </select>
                </div>

                {/* Meeting Mode */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7c2d12', marginBottom: '6px' }}>
                    भेटीचे माध्यम (Mode):
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setBookingData({ ...bookingData, mode: 'Offline' })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: bookingData.mode === 'Offline' ? '2px solid #ea580c' : '1px solid #fed7aa',
                        background: bookingData.mode === 'Offline' ? '#fff7ed' : '#fff',
                        color: bookingData.mode === 'Offline' ? '#ea580c' : '#7c2d12',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      🏢 प्रत्यक्ष भेट (Offline)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingData({ ...bookingData, mode: 'Online' })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: bookingData.mode === 'Online' ? '2px solid #0284c7' : '1px solid #fed7aa',
                        background: bookingData.mode === 'Online' ? '#f0f9ff' : '#fff',
                        color: bookingData.mode === 'Online' ? '#0284c7' : '#7c2d12',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        cursor: 'pointer'
                      }}
                    >
                      💻 ऑनलाईन कॉल (Video)
                    </button>
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7c2d12', marginBottom: '6px' }}>
                    दिनांक (Date):
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #fed7aa',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#431407',
                      background: '#fff7ed',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Time Slot Picker */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7c2d12', marginBottom: '6px' }}>
                    वेळ (Time Slot):
                  </label>
                  <select
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #fed7aa',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#431407',
                      background: '#fff7ed',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="स. ०७:३० वाजता">स. ०७:३० वाजता (Breakfast Meet)</option>
                    <option value="स. ०९:०० वाजता">स. ०९:०० वाजता</option>
                    <option value="स. १०:३० वाजता">स. १०:३० वाजता</option>
                    <option value="स. ११:४५ वाजता">स. ११:४५ वाजता</option>
                    <option value="दु. ०२:३० वाजता">दु. ०२:३० वाजता</option>
                    <option value="दु. ०४:०० वाजता">दु. ०४:०० वाजता</option>
                    <option value="सं. ०६:३० वाजता">सं. ०६:३० वाजता (Evening Meet)</option>
                  </select>
                </div>

                {/* Venue (if offline) */}
                {bookingData.mode === 'Offline' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7c2d12', marginBottom: '6px' }}>
                      भेटीचे ठिकाण (Venue / Address):
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="उदा. हॉटेल प्राइड एक्झिक्युटिव्ह / ऑफिस"
                      value={bookingData.venue}
                      onChange={(e) => setBookingData({ ...bookingData, venue: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #fed7aa',
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        color: '#431407',
                        background: '#fff7ed',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}

              </div>

              {/* Purpose & Topics */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7c2d12', marginBottom: '6px' }}>
                  भेटीचा मुख्य उद्देश व पार्श्वभूमी (Meeting Objective):
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. नवीन कमर्शियल प्रोजेक्टसाठी ERP व आयटी इन्फ्रास्ट्रक्चर पुरवठा चर्चा..."
                  value={bookingData.purpose}
                  onChange={(e) => setBookingData({ ...bookingData, purpose: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #fed7aa',
                    fontSize: '0.88rem',
                    color: '#431407',
                    background: '#fff7ed',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#7c2d12', marginBottom: '6px' }}>
                  चर्चेचे मुख्य मुद्दे व अजेंडा (Discussion Points):
                </label>
                <textarea
                  rows="3"
                  placeholder="१. कंपनी प्रोफाइल परिचय&#10;२. आवश्यक कौशल्ये व अंदाजपत्रक&#10;३. रेफरल देवाणघेवाण शक्यता..."
                  value={bookingData.topics}
                  onChange={(e) => setBookingData({ ...bookingData, topics: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #fed7aa',
                    fontSize: '0.88rem',
                    color: '#431407',
                    background: '#fff7ed',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('upcoming')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '11px 26px',
                    borderRadius: '8px',
                    background: '#ea580c',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.96rem',
                    cursor: 'pointer',
                    fontFamily: 'Baloo 2',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)'
                  }}
                >
                  भेट निश्चित करा (Confirm Meeting) ➔
                </button>
              </div>

            </form>
          </div>
        )}

        {/* TAB 3: PAST MEETINGS & MINUTES */}
        {activeTab === 'past' && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #fed7aa', padding: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#431407', fontFamily: 'Baloo 2' }}>
              📝 पूर्ण झालेल्या १-ते-१ भेटी व पाठपुरावा (Meeting Minutes & Outcomes)
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: '#78350f' }}>
              भेटींमध्ये ठरलेले निर्णय, मिनिट्स आणि त्यातून मिळालेल्या प्रत्यक्ष व्यावसायिक संधी.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#fff7ed', borderBottom: '2px solid #fed7aa', textAlign: 'left', color: '#7c2d12' }}>
                  <th style={{ padding: '12px 14px' }}>भेट आयडी</th>
                  <th style={{ padding: '12px 14px' }}>सदस्य नाव व फर्म</th>
                  <th style={{ padding: '12px 14px' }}>दिनांक व पद्धत</th>
                  <th style={{ padding: '12px 14px' }}>उद्देश</th>
                  <th style={{ padding: '12px 14px' }}>ठरलेले निर्णय (Minutes)</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>रेफरल रूपांतर</th>
                </tr>
              </thead>
              <tbody>
                {pastMeetings.map((pm) => (
                  <tr key={pm.id} style={{ borderBottom: '1px solid #ffedd5' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#ea580c' }}>{pm.id}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <strong style={{ color: '#431407' }}>{pm.partnerName}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#78350f' }}>{pm.partnerCompany}</div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#6b7280' }}>
                      <div>{pm.date}</div>
                      <span style={{ fontSize: '0.74rem', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>{pm.mode}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#374151' }}>{pm.purpose}</td>
                    <td style={{ padding: '12px 14px', color: '#15803d', fontWeight: 600 }}>{pm.minutes}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      {pm.referralDone ? (
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                          ✓ रेफरल नोंदवला ({pm.referralId})
                        </span>
                      ) : (
                        <Link
                          to={`/referrals/create?recipient=${encodeURIComponent(pm.partnerName)}`}
                          style={{
                            padding: '4px 10px',
                            background: '#ea580c',
                            color: '#fff',
                            borderRadius: '4px',
                            textDecoration: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}
                        >
                          🤝 रेफरल द्या
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: CHAPTER WEEKLY SANGAM MEETINGS */}
        {activeTab === 'chapter' && (
          <div>
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#431407', fontFamily: 'Baloo 2' }}>
                🏢 साप्ताहिक व्यवसाय मंडळ संगम (Weekly Chapter Meetings)
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#78350f' }}>
                दर आठवड्याला सकाळी ७:३० वाजता होणाऱ्या स्थानिक चॅप्टर संगम बैठकांचे वेळापत्रक व उपस्थिती नोंदणी.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
              {CHAPTER_MEETINGS.map((ch) => (
                <div
                  key={ch.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px solid #fed7aa',
                    padding: '24px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ background: '#ffedd5', color: '#c2410c', padding: '3px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                        {ch.id}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800 }}>
                        👥 {ch.confirmedAttendees} उद्योजक उपस्थित राहणार
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#431407', fontFamily: 'Baloo 2' }}>
                      {ch.name}
                    </h4>

                    <div style={{ background: '#fff7ed', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px', border: '1px solid #fed7aa' }}>
                      <div style={{ fontSize: '0.85rem', color: '#ea580c', fontWeight: 800, marginBottom: '2px' }}>
                        ⏰ {ch.schedule}
                      </div>
                      <div style={{ fontSize: '0.80rem', color: '#7c2d12' }}>
                        📍 {ch.venue}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#374151', marginBottom: '8px' }}>
                      <strong>🎯 मुख्य अजेंडा:</strong> {ch.agenda}
                    </div>

                    <div style={{ fontSize: '0.80rem', color: '#6b7280' }}>
                      <strong>👔 चॅप्टर अध्यक्ष:</strong> {ch.president} (संपर्क: {ch.contact})
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '14px', marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleRSVPChapter(ch.name)}
                      style={{
                        flex: 1,
                        padding: '9px',
                        background: '#15803d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      ✓ उपस्थिती नोंदवा (RSVP)
                    </button>
                    <Link
                      to={`/crm/chapter`}
                      style={{
                        padding: '9px 12px',
                        background: '#fff7ed',
                        border: '1px solid #fdba74',
                        color: '#c2410c',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.80rem'
                      }}
                    >
                      चॅप्टर CRM ➔
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: HOW CONNECT & MEETINGS WORK EXPLAINER */}
        {activeTab === 'howitworks' && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #fed7aa', padding: '32px', boxShadow: '0 4px 18px rgba(0,0,0,0.04)' }}>
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 32px' }}>
              <span style={{ background: '#ffedd5', color: '#c2410c', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase' }}>
                🔄 NETWORKING TRUST PIPELINE
              </span>
              <h2 style={{ fontSize: '1.8rem', margin: '8px 0 6px', color: '#431407', fontFamily: 'Baloo 2' }}>
                फॉलो, कनेक्ट, मेसेज व १-ते-१ भेट प्रणाली कशी काम करते?
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#78350f', margin: 0, lineHeight: 1.6 }}>
                Connect Maratha वरील व्यावसायिक संबंध हे केवळ संपर्क यादी नसून ती परस्पर विश्वासाची आणि थेट महसूल वाढीची एक अखंड साखळी आहे.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              
              {/* Step 1 */}
              <div style={{ background: '#fff7ed', borderRadius: '14px', border: '1.5px solid #fed7aa', padding: '22px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', marginBottom: '12px' }}>
                  १
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: '#7c2d12', fontFamily: 'Baloo 2' }}>
                  ➕ फॉलो (Follow)
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 800, marginBottom: '6px' }}>एकतर्फी माहिती प्रवाह</div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#431407', lineHeight: 1.5 }}>
                  डिरेक्टरीतील अग्रगण्य उद्योजक, नेते किंवा कंपन्यांना फॉलो करून त्यांच्या ताज्या व्यावसायिक पोस्ट, नोकऱ्या व उपक्रमांचे अपडेट्स मिळवा.
                </p>
              </div>

              {/* Step 2 */}
              <div style={{ background: '#f0fdf4', borderRadius: '14px', border: '1.5px solid #86efac', padding: '22px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#16a34a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', marginBottom: '12px' }}>
                  २
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: '#14532d', fontFamily: 'Baloo 2' }}>
                  🤝 कनेक्ट (Connect)
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 800, marginBottom: '6px' }}>दुतर्फा व्यावसायिक विश्वास बंध</div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#14532d', lineHeight: 1.5 }}>
                  दोन्ही बाजूंच्या मंजुरीने अधिकृत व्यावसायिक संबंध प्रस्थापित होतो. थेट मोबाईल, ईमेल व डिरेक्टरी प्राधान्य अनलॉक होते.
                </p>
              </div>

              {/* Step 3 */}
              <div style={{ background: '#f0f9ff', borderRadius: '14px', border: '1.5px solid #7dd3fc', padding: '22px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', marginBottom: '12px' }}>
                  ३
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: '#0c4a6e', fontFamily: 'Baloo 2' }}>
                  💬 थेट मेसेज (Direct Message)
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 800, marginBottom: '6px' }}>सुरक्षित अंतर्गत संवाद</div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#0c4a6e', lineHeight: 1.5 }}>
                  चॅट प्रणालीद्वारे प्राथमिक बोलणी, आवश्यकता विचारणा आणि प्रकल्पांची माहिती त्वरित देवाणघेवाण करा.
                </p>
              </div>

              {/* Step 4 */}
              <div style={{ background: '#fdf2f8', borderRadius: '14px', border: '1.5px solid #f472b6', padding: '22px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#db2777', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', marginBottom: '12px' }}>
                  ४
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', color: '#831843', fontFamily: 'Baloo 2' }}>
                  ☕ १-ते-१ भेट व डील (Meeting & Deals)
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#db2777', fontWeight: 800, marginBottom: '6px' }}>थेट व्यवसाय रूपांतर</div>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#831843', lineHeight: 1.5 }}>
                  चॅट किंवा डिरेक्टरीमधून प्रत्यक्ष किंवा ऑनलाईन भेट शेड्यूल करा. मिनिट्स नोंदवून थेट TYFCB रेफरल किंवा डील क्लोज करा!
                </p>
              </div>

            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setActiveTab('book')}
                style={{
                  padding: '12px 28px',
                  borderRadius: '8px',
                  background: '#ea580c',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.96rem',
                  cursor: 'pointer',
                  fontFamily: 'Baloo 2'
                }}
              >
                आता पहिली १-ते-१ भेट शेड्यूल करा ➔
              </button>
            </div>
          </div>
        )}

        {/* MODAL: LOG MEETING MINUTES */}
        {minutesModalMeeting && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '28px', boxShadow: '0 12px 36px rgba(0,0,0,0.3)' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.3rem', color: '#431407', fontFamily: 'Baloo 2' }}>
                📝 बैठकीचे मिनिट्स व निष्पन्न नोंदवा (Log Meeting Minutes)
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '0.84rem', color: '#6b7280' }}>
                <strong>{minutesModalMeeting.partnerName}</strong> ({minutesModalMeeting.partnerCompany}) यांच्यासोबत झालेल्या बैठकीचे महत्त्वाचे निष्कर्ष लिहा.
              </p>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>
                  बैठकीत ठरलेले महत्त्वाचे निर्णय (Key Decisions & Action Items):
                </label>
                <textarea
                  rows="4"
                  placeholder="उदा. क्लाउड सॉफ्टवेअर डेमो सादर केला. पुढील मंगळवारी ₹३.२ लाखांचे कोटेशन अंतिम करण्याचे ठरले..."
                  value={minutesText}
                  onChange={(e) => setMinutesText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setMinutesModalMeeting(null)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button
                  type="button"
                  onClick={handleSaveMinutes}
                  style={{ padding: '8px 20px', background: '#15803d', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  मिनिट्स सेव्ह करा ➔
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
