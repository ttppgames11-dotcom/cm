import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MARATHI_MONTHS,
  TITHI_NAMES,
  NAKSHATRAS,
  HISTORICAL_CHRONICLES,
  SAINTS_OF_MAHARASHTRA,
  MAHARASHTRA_FESTIVALS,
  FESTIVAL_MAP_LOCATIONS,
  INITIAL_COMMUNITY_EVENTS,
  getPanchangForDate,
  MAHARASHTRA_GOVT_HOLIDAYS_MAP,
  MONTHLY_SHUBH_MUHURATS,
  SANKASHTI_MOONRISE_DATA,
  RASHI_BHAVISHYA_DATA,
  KALNIRNAY_HEALTH_TIPS,
  KALNIRNAY_SUBHASHITS
} from '../../data/marathaCalendarData';

export default function MarathaCalendarPage() {
  const { user } = useAuth();

  // Active View Tab: 'kalnirnay' | 'today' | 'muhurat' | 'history' | 'saints' | 'festivals' | 'map' | 'community'
  const [activeTab, setActiveTab] = useState('kalnirnay');

  // Selected date for panchang and inspection
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Month navigation in Kalnirnay Grid view
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Selected Day Cell for comprehensive Kalnirnay Panchang modal
  const [selectedDayCell, setSelectedDayCell] = useState(null);

  // Selected Rashi in Monthly Horoscope
  const [selectedRashiIdx, setSelectedRashiIdx] = useState(0);

  // Selected Muhurat Subtab ('vivah' | 'vastu' | 'namkaran' | 'vahanKharidi')
  const [activeMuhuratTab, setActiveMuhuratTab] = useState('vivah');

  // Search & Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyCategory, setHistoryCategory] = useState('all');
  const [festivalFilter, setFestivalFilter] = useState('all');
  const [communityDistrict, setCommunityDistrict] = useState('सर्व');
  const [communityCategory, setCommunityCategory] = useState('all');

  // Selected Historical Event for Detail Modal
  const [detailEvent, setDetailEvent] = useState(null);

  // Selected Map Festival
  const [selectedMapLocation, setSelectedMapLocation] = useState(FESTIVAL_MAP_LOCATIONS[0]);

  // Community Events with LocalStorage persistence
  const [communityEvents, setCommunityEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_community_events');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COMMUNITY_EVENTS;
  });

  // Add Event Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'व्याख्यान',
    date: new Date().toISOString().split('T')[0],
    time: 'सकाळी १०:००',
    venue: '',
    district: 'पुणे',
    seats: 100,
    organizer: '',
    desc: '',
    phone: ''
  });

  // RSVP success alert state
  const [rsvpNotice, setRsvpNotice] = useState(null);

  // Computed Panchang for the currently selected date
  const panchang = useMemo(() => getPanchangForDate(selectedDate), [selectedDate]);

  // Historical event for selected day
  const todayHistory = useMemo(() => {
    const selDay = selectedDate.getDate();
    const selMonth = selectedDate.getMonth() + 1;
    // Match exact day & month, or fallback to the closest milestone
    const match = HISTORICAL_CHRONICLES.find(h => h.day === selDay && h.month === selMonth);
    return match || HISTORICAL_CHRONICLES[0];
  }, [selectedDate]);

  // Filtered History Events
  const filteredHistory = useMemo(() => {
    return HISTORICAL_CHRONICLES.filter(item => {
      const matchCat = historyCategory === 'all' || item.category === historyCategory;
      const q = historySearch.toLowerCase().trim();
      const matchSearch = !q ||
        item.title.toLowerCase().includes(q) ||
        item.place.toLowerCase().includes(q) ||
        item.figures.some(f => f.toLowerCase().includes(q)) ||
        item.summary.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [historySearch, historyCategory]);

  // Filtered Festivals
  const filteredFestivals = useMemo(() => {
    if (festivalFilter === 'all') return MAHARASHTRA_FESTIVALS;
    return MAHARASHTRA_FESTIVALS.filter(f => f.type.includes(festivalFilter));
  }, [festivalFilter]);

  // Filtered Community Events
  const filteredCommunity = useMemo(() => {
    return communityEvents.filter(ev => {
      const matchDist = communityDistrict === 'सर्व' || ev.district === communityDistrict;
      const matchCat = communityCategory === 'all' || ev.category.includes(communityCategory);
      return matchDist && matchCat;
    });
  }, [communityEvents, communityDistrict, communityCategory]);

  // Handle Event Creation
  const handleAddEventSubmit = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.venue || !newEvent.phone) {
      alert('कृपया सर्व आवश्यक माहिती भरा!');
      return;
    }

    const created = {
      ...newEvent,
      id: 'comm-' + Date.now(),
      rsvpCount: 1,
      status: 'Pending Review',
      verifiedBy: 'Connect Maratha स्थानिक समिती पडताळणी'
    };

    const updated = [created, ...communityEvents];
    setCommunityEvents(updated);
    try {
      localStorage.setItem('cm_community_events', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setShowAddModal(false);
    setNewEvent({
      title: '',
      category: 'व्याख्यान',
      date: new Date().toISOString().split('T')[0],
      time: 'सकाळी १०:००',
      venue: '',
      district: 'पुणे',
      seats: 100,
      organizer: '',
      desc: '',
      phone: ''
    });

    alert('🚩 आपला कार्यक्रम यशस्वीरित्या सबमिट झाला आहे! प्रशासक पडताळणीनंतर तो दिसेल.');
  };

  // Handle RSVP
  const handleRsvp = (eventId, eventTitle) => {
    setCommunityEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        return { ...ev, rsvpCount: (ev.rsvpCount || 0) + 1 };
      }
      return ev;
    }));
    setRsvpNotice(`आपली उपस्थिती "${eventTitle}" साठी नोंदवली गेली आहे! 🚩`);
    setTimeout(() => setRsvpNotice(null), 4000);
  };

  // Marathi numeral converter
  const toMarathiDigits = (num) => {
    return String(num).replace(/[0-9]/g, d => '०१२३४५६७८९'[d]);
  };

  // Month Grid Calculation with Kalnirnay specifics
  const monthDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of month
    const now = new Date();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateInstance = new Date(currentYear, currentMonth, d);
      const p = getPanchangForDate(dateInstance);
      const hist = HISTORICAL_CHRONICLES.find(h => h.day === d && h.month === (currentMonth + 1));
      const fest = MAHARASHTRA_FESTIVALS.find(f => f.marathiDate.includes(p.tithi) || (d === 6 && currentMonth === 5));
      const holidayKey = `${currentMonth + 1}-${d}`;
      const holidayName = MAHARASHTRA_GOVT_HOLIDAYS_MAP[holidayKey] || (dateInstance.getDay() === 0 ? 'रविवार' : null);
      const isSunday = dateInstance.getDay() === 0;
      const isToday = (
        d === now.getDate() &&
        currentMonth === now.getMonth() &&
        currentYear === now.getFullYear()
      );

      days.push({
        dayNumber: d,
        dayNumberMarathi: toMarathiDigits(d),
        date: dateInstance,
        panchang: p,
        history: hist,
        festival: fest,
        holidayName,
        isSunday,
        isHoliday: !!holidayName,
        isToday
      });
    }
    return days;
  }, [currentYear, currentMonth]);

  const monthNamesMr = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];
  const monthNamesEn = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

  const currentMonthPanchang = useMemo(() => {
    return getPanchangForDate(new Date(currentYear, currentMonth, 15));
  }, [currentYear, currentMonth]);

  const currentMonthMuhurat = useMemo(() => {
    return MONTHLY_SHUBH_MUHURATS[currentMonth + 1] || MONTHLY_SHUBH_MUHURATS[1];
  }, [currentMonth]);

  const currentMonthSankashti = useMemo(() => {
    return SANKASHTI_MOONRISE_DATA[currentMonth + 1] || SANKASHTI_MOONRISE_DATA[1];
  }, [currentMonth]);

  const currentMonthHealthTip = useMemo(() => {
    return KALNIRNAY_HEALTH_TIPS[currentMonth + 1] || KALNIRNAY_HEALTH_TIPS[1];
  }, [currentMonth]);

  const currentMonthSubhashit = useMemo(() => {
    return KALNIRNAY_SUBHASHITS[currentMonth + 1] || KALNIRNAY_SUBHASHITS[1];
  }, [currentMonth]);

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', paddingBottom: '60px', color: '#1F2937' }}>
      
      {/* ========== TOP HERO BANNER ========== */}
      <section style={{
        background: 'linear-gradient(135deg, #7C1D05 0%, #C2410C 50%, #7C1D05 100%)',
        color: '#FFFFFF',
        padding: '38px 20px 30px',
        borderBottom: '3px solid #F59E0B',
        boxShadow: '0 8px 30px rgba(124, 29, 5, 0.28)'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.15)', padding: '5px 14px', borderRadius: '30px', fontSize: '0.82rem', fontWeight: 800, color: '#FEF3C7', marginBottom: '10px' }}>
              <span>📅</span>
              <span>कालनिर्णय पारंपरिक दिनदर्शिका व सांस्कृतिक ज्ञानप्रणाली • ३६५ दिवस</span>
            </div>
            <h1 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: 'clamp(1.9rem, 3.8vw, 2.8rem)', fontWeight: 800, margin: '4px 0 8px', color: '#FFFFFF', lineHeight: 1.15 }}>
              कालनिर्णय दिनदर्शिका • शुभ मुहूर्त • इतिहास • पंचांग
            </h1>
            <p style={{ margin: 0, fontSize: '0.96rem', color: '#FED7AA', maxWidth: '780px', lineHeight: 1.5 }}>
              शालिवाहन शक, तिथी, नक्षत्र, संकष्टी चंद्रोदय वेळ, विवाह व वास्तू मुहूर्त, १२ राशींचे मासिक भविष्य आणि ३६५ दिवसांचे प्रमाणित शिवकालीन दिनविशेष.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentMonth(now.getMonth());
                setCurrentYear(now.getFullYear());
                setSelectedDate(now);
                setActiveTab('kalnirnay');
              }}
              style={{
                background: '#FEF3C7',
                color: '#7C1D05',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '30px',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)'
              }}>
              <span>⚡</span>
              <span>चालू महिना कालनिर्णय</span>
            </button>

            <button
              onClick={() => window.print()}
              style={{
                background: 'rgba(255, 255, 255, 0.20)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                padding: '9px 16px',
                borderRadius: '30px',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
              <span>🖨️</span>
              <span>दिनदर्शिका प्रिंट करा</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#000000',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '30px',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)'
              }}>
              <span>➕</span>
              <span>कार्यक्रम सादर करा</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========== MAIN NAVIGATION TABS ========== */}
      <div style={{
        background: '#FFFFFF',
        borderBottom: '2px solid #FED7AA',
        position: 'sticky',
        top: '60px',
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          whiteSpace: 'nowrap'
        }}>
          {[
            { id: 'kalnirnay', label: '📅 कालनिर्णय दिनदर्शिका', badge: 'पारंपरिक' },
            { id: 'today', label: '🔥 आजचा इतिहास व पंचांग', badge: 'लाईव्ह' },
            { id: 'muhurat', label: '✨ शुभ मुहूर्त व राशी', badge: '२०२६' },
            { id: 'history', label: '🏰 इतिहास कालपट', badge: '३६५ दिवस' },
            { id: 'saints', label: '🙏 संत व परंपरा', badge: 'वारकरी' },
            { id: 'festivals', label: '🎉 सण व उत्सव', badge: 'संस्कृती' },
            { id: 'map', label: '🗺️ उत्सव नकाशा', badge: 'यात्रा' },
            { id: 'community', label: '👥 समुदाय कार्यक्रम', badge: `${communityEvents.length}+` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 18px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #C2410C' : '3px solid transparent',
                background: 'transparent',
                color: activeTab === tab.id ? '#7C1D05' : '#4B5563',
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: '0.90rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}>
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{
                  fontSize: '0.70rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: activeTab === tab.id ? '#FFEDD5' : '#F3F4F6',
                  color: activeTab === tab.id ? '#C2410C' : '#6B7280',
                  fontWeight: 700
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ========== NOTIFICATION TOAST ========== */}
      {rsvpNotice && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #15803D, #166534)',
          color: '#FFFFFF',
          padding: '14px 22px',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          zIndex: 9999,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>✅</span>
          <span>{rsvpNotice}</span>
        </div>
      )}

      {/* ========== MAIN CONTENT CONTAINER ========== */}
      <main style={{ maxWidth: '1440px', margin: '28px auto 0', padding: '0 20px' }}>

        {/* ---------------------------------------------------- */}
        {/* TAB 1: आजचा इतिहास & लाईव्ह पंचांग */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'today' && (
          <div>
            {/* Live Panchang Strip */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '1.5px solid #FFEDD5',
              padding: '20px 24px',
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
              marginBottom: '26px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid #FED7AA', paddingBottom: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🚩</span>
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#9A3412', fontWeight: 700 }}>महाराष्ट्रीय पंचांग व कालमापन</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7C1D05' }}>
                      {panchang.gregorianDate} • {panchang.dayOfWeekMarathi}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="calendar-date-input" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#4B5563' }}>तारीख बदला:</label>
                  <input
                    id="calendar-date-input"
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #F97316',
                      fontWeight: 700,
                      outline: 'none',
                      fontSize: '0.86rem',
                      background: '#FFF7ED'
                    }}
                  />
                </div>
              </div>

              {/* 6-grid Panchang highlights */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#FFF7ED', padding: '12px 14px', borderRadius: '12px', borderLeft: '4px solid #EA580C' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 700 }}>मराठी महिना व ऋतू</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7C1D05' }}>{panchang.marathiMonth} मास</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{panchang.marathiSeason} ऋतू</div>
                </div>

                <div style={{ background: '#FFF7ED', padding: '12px 14px', borderRadius: '12px', borderLeft: '4px solid #EA580C' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 700 }}>पक्ष व तिथी</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7C1D05' }}>{panchang.tithi}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{panchang.paksha}</div>
                </div>

                <div style={{ background: '#FFF7ED', padding: '12px 14px', borderRadius: '12px', borderLeft: '4px solid #EA580C' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 700 }}>नक्षत्र व वार</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7C1D05' }}>{panchang.nakshatra}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>ग्रह: {panchang.rulingPlanet}</div>
                </div>

                <div style={{ background: '#FFF7ED', padding: '12px 14px', borderRadius: '12px', borderLeft: '4px solid #EA580C' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 700 }}>सूर्योदय / सूर्यास्त</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7C1D05' }}>🌅 {panchang.sunrise}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>🌇 सूर्यास्त: {panchang.sunset}</div>
                </div>

                <div style={{ background: '#FFF7ED', padding: '12px 14px', borderRadius: '12px', borderLeft: '4px solid #EA580C' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 700 }}>शालिवाहन शक</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7C1D05' }}>{panchang.shakaYear}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{panchang.shivrajyabhishekShak}</div>
                </div>

                <div style={{ background: '#FFF7ED', padding: '12px 14px', borderRadius: '12px', borderLeft: '4px solid #EA580C' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 700 }}>विशेष दिवस स्थिती</div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#C2410C' }}>
                    {panchang.isPoornima ? '🌕 पौर्णिमा' : panchang.isAmavasya ? '🌑 अमावस्या' : panchang.isEkadashi ? '🙏 एकादशी व्रत' : 'शुभ दिवस'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>महाराष्ट्र प्रमाणवेळ</div>
                </div>
              </div>
            </div>

            {/* Featured: आजच्या दिवशी महाराष्ट्राच्या इतिहासात */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '2px solid #FFEDD5',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(124, 29, 5, 0.08)'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #7C1D05, #9A3412)',
                color: '#FFFFFF',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>⚔️</span>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>आजच्या दिवशी महाराष्ट्राच्या इतिहासात...</h2>
                    <span style={{ fontSize: '0.80rem', color: '#FED7AA' }}>तारीख: {todayHistory.displayDate} ({todayHistory.year}) • {todayHistory.place}</span>
                  </div>
                </div>
                <span style={{ background: '#FEF3C7', color: '#7C1D05', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800 }}>
                  {todayHistory.category}
                </span>
              </div>

              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7C1D05', margin: '0 0 10px', lineHeight: 1.25 }}>
                    {todayHistory.title}
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.84rem', color: '#4B5563', marginBottom: '14px' }}>
                    <span>📍 <strong>स्थळ:</strong> {todayHistory.place}</span>
                    <span>👑 <strong>व्यक्ती:</strong> {todayHistory.figures.join(', ')}</span>
                  </div>

                  <p style={{ fontSize: '0.96rem', lineHeight: 1.6, color: '#374151', marginBottom: '16px' }}>
                    {todayHistory.summary}
                  </p>

                  <div style={{ background: '#FFF7ED', padding: '14px 18px', borderRadius: '12px', borderLeft: '4px solid #C2410C', marginBottom: '18px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9A3412', marginBottom: '4px' }}>📖 सविस्तर पार्श्वभूमी व संदर्भ:</div>
                    <div style={{ fontSize: '0.90rem', color: '#4B5563', lineHeight: 1.5 }}>{todayHistory.detail}</div>
                  </div>

                  {/* Verified Sources Badge */}
                  <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '0.72rem' }}>
                        ✅ {todayHistory.references.status} ऐतिहासिक पुरावा
                      </span>
                      <span style={{ color: '#64748B' }}>प्रमाणित संदर्भ</span>
                    </div>
                    <div style={{ color: '#334155' }}><strong>प्राथमिक स्रोत:</strong> {todayHistory.references.primarySource}</div>
                    <div style={{ color: '#334155' }}><strong>ग्रंथ व लेखक:</strong> {todayHistory.references.book} — {todayHistory.references.author}</div>
                    <div style={{ color: '#64748B', fontSize: '0.76rem', marginTop: '2px' }}><strong>संग्रहालय / अभिलेखागार:</strong> {todayHistory.references.archive}</div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setDetailEvent(todayHistory)}
                      style={{
                        background: 'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer'
                      }}>
                      🔍 पूर्ण ऐतिहासिक दस्तावेज उघडा
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${todayHistory.title} (${todayHistory.date}) - ${todayHistory.summary} via Connect Maratha Dinadarshika`);
                        alert('ऐतिहासिक संदर्भ कॉपी झाला!');
                      }}
                      style={{
                        background: '#FFF7ED',
                        color: '#C2410C',
                        border: '1.5px solid #F97316',
                        padding: '9px 16px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.86rem',
                        cursor: 'pointer'
                      }}>
                      📤 संदर्भ शेअर करा
                    </button>
                  </div>
                </div>

                <div>
                  <img
                    src={todayHistory.image}
                    alt={todayHistory.title}
                    style={{
                      width: '100%',
                      maxHeight: '380px',
                      objectFit: 'cover',
                      borderRadius: '16px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      border: '2px solid #FFEDD5'
                    }}
                    onError={(e) => { e.currentTarget.src = '/assets/images/real-shivaji-portrait.jpg'; }}
                  />
                  <div style={{ textAlign: 'center', fontSize: '0.78rem', color: '#6B7280', marginTop: '6px' }}>
                    ऐतिहासिक छायाचित्र / रेखाचित्र संदर्भ: {todayHistory.place}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: कालनिर्णय पारंपरिक दिनदर्शिका (Classic Kalnirnay Wall Calendar) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'kalnirnay' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>

            {/* === KALNIRNAY WALL CALENDAR SHEET (पारंपरिक कालनिर्णय दिनदर्शिका) === */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              border: '3px solid #7C1D05',
              boxShadow: '0 16px 45px rgba(124, 29, 5, 0.16)',
              overflow: 'hidden'
            }}>
              
              {/* TOP RED & GOLD MASTHEAD (कालनिर्णय पारंपरिक शीर्षपट्टी) */}
              <div style={{
                background: 'linear-gradient(135deg, #7C1D05 0%, #991B1B 50%, #7C1D05 100%)',
                color: '#FFFFFF',
                padding: '20px 24px 16px',
                borderBottom: '4px solid #F59E0B',
                position: 'relative'
              }}>
                {/* Traditional Sanskrit Shloka Ribbon */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  borderBottom: '1px solid rgba(254, 215, 170, 0.35)',
                  paddingBottom: '8px',
                  marginBottom: '14px',
                  fontSize: '0.80rem',
                  color: '#FEF3C7',
                  fontWeight: 700
                }}>
                  <span>॥ श्री गणेशाय नमः ॥</span>
                  <span style={{ letterSpacing: '0.5px' }}>॥ कालज्ञानं प्रवृत्तीनां प्रवर्तकमुदाहृतम् ॥</span>
                  <span>॥ स्वराज्य हा माझा जन्मसिद्ध हक्क आहे ॥</span>
                </div>

                {/* Main Masthead Banner */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}>
                  {/* Left: Suryaoday / Suryast & Chhatrapati Shaka */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    fontSize: '0.82rem',
                    lineHeight: 1.5
                  }}>
                    <div style={{ color: '#FDE68A', fontWeight: 800 }}>🌅 सूर्योदय: {currentMonthPanchang.sunrise} | 🌇 सूर्यास्त: {currentMonthPanchang.sunset}</div>
                    <div style={{ color: '#FED7AA' }}>महाराष्ट्र प्रमाणवेळ • {currentMonthPanchang.ayana}</div>
                  </div>

                  {/* Center: Brand Title & Month Header */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '0.90rem',
                      fontWeight: 800,
                      color: '#FDE68A',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginBottom: '2px'
                    }}>
                      कालनिर्णय पारंपरिक दिनदर्शिका • CONNECT MARATHA
                    </div>
                    <h2 style={{
                      margin: '0',
                      fontFamily: "'Baloo 2', sans-serif",
                      fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      textShadow: '0 2px 10px rgba(0,0,0,0.4)',
                      lineHeight: 1.15
                    }}>
                      {monthNamesMr[currentMonth]} {toMarathiDigits(currentYear)}
                      <span style={{ fontSize: '1.25rem', color: '#FED7AA', fontWeight: 700, marginLeft: '12px' }}>
                        / {monthNamesEn[currentMonth]} {currentYear}
                      </span>
                    </h2>
                    <div style={{
                      fontSize: '0.88rem',
                      color: '#FEF3C7',
                      fontWeight: 700,
                      marginTop: '4px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      display: 'inline-block',
                      padding: '3px 14px',
                      borderRadius: '20px'
                    }}>
                      {currentMonthPanchang.marathiMonth} मास • {currentMonthPanchang.shakaYear} • {currentMonthPanchang.samvatsar} • {currentMonthPanchang.marathiSeason} ऋतू
                    </div>
                  </div>

                  {/* Right: Shivrajyabhishek Shaka & Region */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    textAlign: 'right'
                  }}>
                    <div style={{ color: '#FDE68A', fontWeight: 800 }}>👑 {currentMonthPanchang.shivrajyabhishekShak}</div>
                    <div style={{ color: '#FED7AA' }}>सह्याद्री-महाराष्ट्र सांस्कृतिक पंचांग</div>
                  </div>
                </div>

                {/* MONTH NAVIGATION CONTROLLER BAR */}
                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  background: 'rgba(0, 0, 0, 0.35)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(254, 215, 170, 0.2)'
                }}>
                  {/* Prev Button */}
                  <button
                    onClick={() => {
                      if (currentMonth === 0) {
                        setCurrentMonth(11);
                        setCurrentYear(y => y - 1);
                      } else {
                        setCurrentMonth(m => m - 1);
                      }
                    }}
                    style={{
                      background: '#FEF3C7',
                      color: '#7C1D05',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                    ◀ मागील महिना
                  </button>

                  {/* Month & Year Quick Selectors */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <select
                      value={currentMonth}
                      onChange={(e) => setCurrentMonth(Number(e.target.value))}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1.5px solid #F59E0B',
                        background: '#FFFBEB',
                        color: '#7C1D05',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}>
                      {monthNamesMr.map((m, idx) => (
                        <option key={m} value={idx}>{m} ({monthNamesEn[idx]})</option>
                      ))}
                    </select>

                    <select
                      value={currentYear}
                      onChange={(e) => setCurrentYear(Number(e.target.value))}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1.5px solid #F59E0B',
                        background: '#FFFBEB',
                        color: '#7C1D05',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}>
                      {[2024, 2025, 2026, 2027, 2028].map(yr => (
                        <option key={yr} value={yr}>{toMarathiDigits(yr)} ({yr})</option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        const now = new Date();
                        setCurrentMonth(now.getMonth());
                        setCurrentYear(now.getFullYear());
                        setSelectedDate(now);
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        color: '#000000',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}>
                      ⚡ चालू महिना
                    </button>
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => {
                      if (currentMonth === 11) {
                        setCurrentMonth(0);
                        setCurrentYear(y => y + 1);
                      } else {
                        setCurrentMonth(m => m + 1);
                      }
                    }}
                    style={{
                      background: '#FEF3C7',
                      color: '#7C1D05',
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                    पुढील महिना ▶
                  </button>
                </div>
              </div>

              {/* CALENDAR LEGEND STRIP */}
              <div style={{
                background: '#FFFBEB',
                borderBottom: '1px solid #FED7AA',
                padding: '8px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '0.78rem',
                color: '#4B5563'
              }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#B91C1C' }}>
                    <span style={{ width: '12px', height: '12px', background: '#DC2626', borderRadius: '3px', display: 'inline-block' }}></span>
                    रविवार / शासकीय सुट्टी (लाल तारीख)
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#92400E' }}>
                    🌕 पौर्णिमा • 🌑 अमावस्या • 🌙 संकष्टी चतुर्थी
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#C2410C' }}>
                    ⚔️ शिवकालीन ऐतिहासिक दिनविशेष
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#047857' }}>
                    🙏 एकादशी व्रत
                  </span>
                </div>
                <div style={{ fontStyle: 'italic', color: '#7C1D05', fontWeight: 700 }}>
                  👉 कोणत्याही तारखेवर क्लिक करून संपूर्ण पंचांग व इतिहास पहा
                </div>
              </div>

              {/* 7-DAY KALNIRNAY WALL GRID HEADER */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                borderBottom: '2px solid #7C1D05'
              }}>
                {[
                  { mr: 'रविवार', en: 'SUN', isSun: true },
                  { mr: 'सोमवार', en: 'MON' },
                  { mr: 'मंगळवार', en: 'TUE' },
                  { mr: 'बुधवार', en: 'WED' },
                  { mr: 'गुरुवार', en: 'THU' },
                  { mr: 'शुक्रवार', en: 'FRI' },
                  { mr: 'शनिवार', en: 'SAT' }
                ].map((dayItem) => (
                  <div
                    key={dayItem.mr}
                    style={{
                      background: dayItem.isSun ? '#B91C1C' : '#7C1D05',
                      color: '#FFFFFF',
                      padding: '12px 6px',
                      textAlign: 'center',
                      fontWeight: 800,
                      borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                    <div style={{ fontSize: '1.02rem', letterSpacing: '0.5px' }}>{dayItem.mr}</div>
                    <div style={{ fontSize: '0.68rem', color: dayItem.isSun ? '#FECDD3' : '#FED7AA', fontWeight: 600 }}>{dayItem.en}</div>
                  </div>
                ))}
              </div>

              {/* 7-DAY KALNIRNAY WALL GRID CELLS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                background: '#E5E7EB',
                gap: '1px'
              }}>
                {monthDays.map((cell, idx) => {
                  if (!cell) {
                    return (
                      <div
                        key={'empty-' + idx}
                        style={{
                          minHeight: '130px',
                          background: idx % 7 === 0 ? '#FEF2F2' : '#F9FAFB',
                          opacity: 0.5
                        }}
                      />
                    );
                  }

                  const isSun = cell.isSunday;
                  const isRedDate = isSun || cell.isHoliday;
                  const isToday = cell.isToday;

                  return (
                    <div
                      key={'cell-' + cell.dayNumber}
                      onClick={() => {
                        setSelectedDate(cell.date);
                        setSelectedDayCell(cell);
                      }}
                      style={{
                        minHeight: '130px',
                        background: isToday
                          ? '#FEF9C3'
                          : isSun
                            ? '#FFF5F5'
                            : '#FFFFFF',
                        border: isToday
                          ? '2.5px solid #D97706'
                          : 'none',
                        padding: '8px 7px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.18s ease',
                        boxShadow: isToday ? 'inset 0 0 10px rgba(217, 119, 6, 0.2)' : 'none'
                      }}>
                      
                      {/* Top Row: Dates & Moon Discs */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          {/* Prominent Date Numerals */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                            <span style={{
                              fontSize: '1.45rem',
                              fontWeight: 900,
                              lineHeight: 1,
                              color: isRedDate ? '#DC2626' : '#111827',
                              fontFamily: "'Baloo 2', sans-serif"
                            }}>
                              {cell.dayNumber}
                            </span>
                            <span style={{
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              color: isRedDate ? '#B91C1C' : '#6B7280'
                            }}>
                              {cell.dayNumberMarathi}
                            </span>
                          </div>

                          {/* Tithi Display */}
                          <div style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: '#9A3412',
                            marginTop: '2px',
                            lineHeight: 1.15
                          }}>
                            {cell.panchang.tithi.replace('पौर्णिमा / अमावस्या', cell.panchang.isPoornima ? 'पौर्णिमा' : 'अमावस्या')}
                          </div>
                        </div>

                        {/* Top-Right: Moon Phase Discs & Badges */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                          {isToday && (
                            <span style={{
                              background: '#D97706',
                              color: '#FFFFFF',
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}>
                              आज
                            </span>
                          )}

                          {cell.panchang.isPoornima && (
                            <span
                              title="पौर्णिमा (पूर्ण चंद्र)"
                              style={{
                                background: '#FEF08A',
                                color: '#854D0E',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                padding: '2px 5px',
                                borderRadius: '12px',
                                border: '1px solid #FACC15',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}>
                              🌕 पौर्णिमा
                            </span>
                          )}

                          {cell.panchang.isAmavasya && (
                            <span
                              title="दर्श अमावस्या"
                              style={{
                                background: '#1F2937',
                                color: '#F9FAFB',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                padding: '2px 5px',
                                borderRadius: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}>
                              🌑 अमावस्या
                            </span>
                          )}

                          {cell.panchang.isSankashti && (
                            <span
                              title={`संकष्टी चतुर्थी चंद्रोदय: ${cell.panchang.chandrodaya}`}
                              style={{
                                background: '#EDE9FE',
                                color: '#5B21B6',
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                padding: '2px 5px',
                                borderRadius: '10px',
                                border: '1px solid #DDD6FE'
                              }}>
                              🌙 संकष्टी
                            </span>
                          )}

                          {cell.panchang.isEkadashi && (
                            <span
                              title="एकादशी उपवास व्रत"
                              style={{
                                background: '#ECFDF5',
                                color: '#065F46',
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                padding: '2px 5px',
                                borderRadius: '10px',
                                border: '1px solid #A7F3D0'
                              }}>
                              🙏 एकादशी
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Nakshatra */}
                      <div style={{ fontSize: '0.68rem', color: '#6B7280', margin: '4px 0 2px' }}>
                        नक्षत्र: <strong>{cell.panchang.nakshatra}</strong>
                      </div>

                      {/* Bottom: Festival, Holiday & Historical Badges */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {/* Statutory Holiday / Major Festival */}
                        {cell.holidayName && cell.holidayName !== 'रविवार' && (
                          <div style={{
                            background: '#FEE2E2',
                            color: '#991B1B',
                            fontSize: '0.64rem',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            fontWeight: 800,
                            borderLeft: '2.5px solid #DC2626',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            🚩 {cell.holidayName}
                          </div>
                        )}

                        {/* Cultural Festival (if not identical to holidayName) */}
                        {cell.festival && (!cell.holidayName || !cell.holidayName.includes(cell.festival.name.slice(0, 4))) && (
                          <div style={{
                            background: '#FEF3C7',
                            color: '#92400E',
                            fontSize: '0.63rem',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            borderLeft: '2.5px solid #F59E0B',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            🎉 {cell.festival.name}
                          </div>
                        )}

                        {/* Historical Maratha Milestone */}
                        {cell.history && (
                          <div style={{
                            background: '#FFF7ED',
                            color: '#C2410C',
                            fontSize: '0.63rem',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            borderLeft: '2.5px solid #EA580C',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            ⚔️ {cell.history.title}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* === SIGNATURE KALNIRNAY PERIPHERAL PANELS (कालनिर्णय पारंपरिक माहिती विभाग) === */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
              
              {/* PANEL 1: चालू महिन्यातील शुभ मुहूर्त (Shubh Muhurats) */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '2px solid #FED7AA',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #7C1D05, #9A3412)',
                  color: '#FFFFFF',
                  padding: '12px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>✨</span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                      या महिन्यातील शुभ मुहूर्त ({monthNamesMr[currentMonth]})
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#FEF3C7', color: '#7C1D05', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                    शके १९४८
                  </span>
                </div>

                {/* Subtabs for Muhurat Categories */}
                <div style={{ display: 'flex', borderBottom: '1px solid #FED7AA', background: '#FFFBEB' }}>
                  {[
                    { id: 'vivah', label: 'विवाह', icon: '💍' },
                    { id: 'vastu', label: 'वास्तू / गृहप्रवेश', icon: '🏡' },
                    { id: 'namkaran', label: 'नामकरण', icon: '👶' },
                    { id: 'vahanKharidi', label: 'वाहन खरेदी', icon: '🚗' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMuhuratTab(tab.id)}
                      style={{
                        flex: 1,
                        padding: '9px 4px',
                        border: 'none',
                        borderBottom: activeMuhuratTab === tab.id ? '3px solid #C2410C' : '3px solid transparent',
                        background: activeMuhuratTab === tab.id ? '#FFFFFF' : 'transparent',
                        color: activeMuhuratTab === tab.id ? '#7C1D05' : '#4B5563',
                        fontWeight: activeMuhuratTab === tab.id ? 800 : 600,
                        fontSize: '0.80rem',
                        cursor: 'pointer'
                      }}>
                      <span>{tab.icon} {tab.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(currentMonthMuhurat[activeMuhuratTab] || []).map((mDate, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#FFF7ED',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          borderLeft: '4px solid #EA580C',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.88rem'
                        }}>
                        <span style={{ fontWeight: 800, color: '#7C1D05' }}>{mDate}</span>
                        <span style={{ fontSize: '0.74rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          अतिउत्कृष्ट मुहूर्त
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '14px', fontSize: '0.74rem', color: '#6B7280', fontStyle: 'italic', borderTop: '1px dashed #E5E7EB', paddingTop: '8px' }}>
                    * विशेष टीप: विशिष्ट लग्न व पत्रिकेनुसार अधिक नेमका मुहूर्त ठरवण्यासाठी स्थानिक उपाध्यायांचा सल्ला घ्यावा.
                  </div>
                </div>
              </div>

              {/* PANEL 2: संकष्टी चतुर्थी चंद्रोदय वेळ सारणी (Sankashti Moonrise Table) */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '2px solid #FED7AA',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #5B21B6, #7C3AED)',
                  color: '#FFFFFF',
                  padding: '12px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🌙</span>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                      संकष्टी चतुर्थी चंद्रोदय वेळ सारणी
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.72rem', background: '#EDE9FE', color: '#5B21B6', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                    प्रमुख शहरे
                  </span>
                </div>

                <div style={{ padding: '16px 18px' }}>
                  <div style={{
                    background: '#F5F3FF',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    fontSize: '0.82rem',
                    color: '#4C1D95',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}>
                    {currentMonthSankashti.date} • ({currentMonthSankashti.tithi})
                  </div>

                  {/* 8 Cities Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    {Object.entries(currentMonthSankashti.cities).map(([city, time]) => (
                      <div
                        key={city}
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #DDD6FE',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                        <span style={{ fontWeight: 800, color: '#1F2937', fontSize: '0.88rem' }}>📍 {city}</span>
                        <span style={{ fontWeight: 800, color: '#6D28D9', fontSize: '0.90rem', background: '#EDE9FE', padding: '2px 8px', borderRadius: '6px' }}>
                          {time}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '14px', fontSize: '0.74rem', color: '#6B7280', textAlign: 'center' }}>
                    संकष्टी व्रत चंद्रदर्शन व चंद्रार्घ्य दिल्यानंतरच सोडले जाते.
                  </div>
                </div>
              </div>

            </div>

            {/* === PANEL 3: मासिक राशीभविष्य (Monthly 12-Rashi Horoscope) === */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '2px solid #FED7AA',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #7C1D05, #B45309)',
                color: '#FFFFFF',
                padding: '16px 22px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🔮</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                      कालनिर्णय मासिक राशीभविष्य ({monthNamesMr[currentMonth]} {toMarathiDigits(currentYear)})
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#FED7AA' }}>१२ राशींचे ग्रहमान, आर्थिक, आरोग्य व विशेष उपासना</span>
                  </div>
                </div>
                <span style={{ background: '#FEF3C7', color: '#7C1D05', padding: '3px 12px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 800 }}>
                  ज्योतिष शास्त्र सल्ला
                </span>
              </div>

              {/* 12 Rashis Selector Strip */}
              <div style={{
                display: 'flex',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                background: '#FFFBEB',
                borderBottom: '1px solid #FED7AA',
                padding: '8px 12px',
                gap: '6px'
              }}>
                {RASHI_BHAVISHYA_DATA.map((rashi, idx) => (
                  <button
                    key={rashi.name}
                    onClick={() => setSelectedRashiIdx(idx)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '12px',
                      border: selectedRashiIdx === idx ? '2px solid #C2410C' : '1px solid #E5E7EB',
                      background: selectedRashiIdx === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                      color: selectedRashiIdx === idx ? '#7C1D05' : '#4B5563',
                      fontWeight: selectedRashiIdx === idx ? 800 : 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: selectedRashiIdx === idx ? '0 2px 8px rgba(194, 65, 12, 0.2)' : 'none'
                    }}>
                    <span style={{ fontSize: '1.1rem' }}>{rashi.symbol}</span>
                    <span>{rashi.name}</span>
                  </button>
                ))}
              </div>

              {/* Active Rashi Detailed View */}
              {(() => {
                const activeRashi = RASHI_BHAVISHYA_DATA[selectedRashiIdx];
                return (
                  <div style={{ padding: '22px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '2.4rem', background: '#FFF7ED', padding: '10px 18px', borderRadius: '16px', border: '1.5px solid #FDBA74' }}>
                          {activeRashi.symbol}
                        </span>
                        <div>
                          <h4 style={{ margin: '0', fontSize: '1.45rem', fontWeight: 900, color: '#7C1D05' }}>
                            {activeRashi.name} रास ({activeRashi.en})
                          </h4>
                          <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                            स्वामी ग्रह: <strong>{activeRashi.ruling}</strong> • तत्व: <strong>{activeRashi.element}</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ background: '#FFF7ED', padding: '6px 14px', borderRadius: '10px', fontSize: '0.80rem', border: '1px solid #FFEDD5' }}>
                          🎨 शुभ रंग: <strong>{activeRashi.color}</strong>
                        </div>
                        <div style={{ background: '#FFF7ED', padding: '6px 14px', borderRadius: '10px', fontSize: '0.80rem', border: '1px solid #FFEDD5' }}>
                          🔢 शुभ अंक: <strong>{activeRashi.luckyNo}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', borderLeft: '4px solid #2563EB' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E40AF', marginBottom: '4px' }}>🌟 सर्वसाधारण अंदाज:</div>
                        <div style={{ fontSize: '0.90rem', color: '#334155', lineHeight: 1.55 }}>{activeRashi.overview}</div>
                      </div>

                      <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', borderLeft: '4px solid #16A34A' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803D', marginBottom: '4px' }}>💰 आर्थिक व व्यवसाय:</div>
                        <div style={{ fontSize: '0.90rem', color: '#334155', lineHeight: 1.55 }}>{activeRashi.finance}</div>
                      </div>

                      <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '12px', borderLeft: '4px solid #DC2626' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#B91C1C', marginBottom: '4px' }}>🩺 आरोग्य सल्ला:</div>
                        <div style={{ fontSize: '0.90rem', color: '#334155', lineHeight: 1.55 }}>{activeRashi.health}</div>
                      </div>

                      <div style={{ background: '#FFFBEB', padding: '14px 16px', borderRadius: '12px', borderLeft: '4px solid #D97706' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400E', marginBottom: '4px' }}>🙏 विशेष उपाय व उपासना:</div>
                        <div style={{ fontSize: '0.90rem', color: '#78350F', lineHeight: 1.55 }}>{activeRashi.advice}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* === PANEL 4: कालनिर्णय आरोग्य कोपरा & संत सुविचार === */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '22px' }}>
              
              {/* Ayurvedic Health Tips */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '2px solid #BBF7D0',
                padding: '20px 22px',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.4rem' }}>🌿</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#166534' }}>
                      कालनिर्णय आरोग्य सल्ला — {currentMonthHealthTip.season}
                    </h3>
                    <span style={{ fontSize: '0.78rem', color: '#4B5563' }}>{currentMonthHealthTip.title}</span>
                  </div>
                </div>

                <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#374151', lineHeight: 1.5 }}>
                  {currentMonthHealthTip.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Subhashit / Saint Quote */}
              <div style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                borderRadius: '18px',
                border: '2px solid #FDE68A',
                padding: '20px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.04)'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>📜</span>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#92400E' }}>
                      मासिक सुविचार व संत वचन ({monthNamesMr[currentMonth]})
                    </h3>
                  </div>
                  <div style={{
                    fontSize: '1.02rem',
                    fontWeight: 800,
                    color: '#78350F',
                    fontFamily: "'Baloo 2', sans-serif",
                    lineHeight: 1.45,
                    marginBottom: '8px',
                    fontStyle: 'italic'
                  }}>
                    "{currentMonthSubhashit.quote}"
                  </div>
                  <div style={{ fontSize: '0.86rem', color: '#92400E', lineHeight: 1.5 }}>
                    <strong>अर्थ:</strong> {currentMonthSubhashit.meaning}
                  </div>
                </div>

                <div style={{ marginTop: '14px', textAlign: 'right', fontSize: '0.74rem', color: '#B45309', fontWeight: 700 }}>
                  — सह्याद्रीचे संचित व कालनिर्णय विचारधन
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB: शुभ मुहूर्त व राशी (Dedicated Deep-dive tab) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'muhurat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
            {/* Shubh Muhurats Deep Dive for All 12 Months */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '2px solid #FED7AA',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#7C1D05' }}>
                    ✨ वर्ष २०२६ सर्व शुभ मुहूर्त (विवाह, वास्तू, नामकरण व वाहन)
                  </h2>
                  <span style={{ fontSize: '0.86rem', color: '#6B7280' }}>शालिवाहन शके १९४८ मधील सर्व श्रेष्ठ मुहूर्तांची अधिकृत सूची</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(Number(e.target.value))}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #F97316', fontWeight: 800 }}>
                    {monthNamesMr.map((m, idx) => (
                      <option key={m} value={idx}>{m} महिना</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
                <div style={{ background: '#FFF7ED', padding: '18px', borderRadius: '14px', borderLeft: '4px solid #EA580C' }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: 800, color: '#7C1D05' }}>💍 विवाह मुहूर्त</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(currentMonthMuhurat.vivah || []).map((v, i) => (
                      <div key={i} style={{ fontSize: '0.88rem', color: '#1F2937', fontWeight: 700 }}>• {v}</div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#FFF7ED', padding: '18px', borderRadius: '14px', borderLeft: '4px solid #16A34A' }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: 800, color: '#166534' }}>🏡 वास्तू व गृहप्रवेश</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(currentMonthMuhurat.vastu || []).map((v, i) => (
                      <div key={i} style={{ fontSize: '0.88rem', color: '#1F2937', fontWeight: 700 }}>• {v}</div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#FFF7ED', padding: '18px', borderRadius: '14px', borderLeft: '4px solid #2563EB' }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: 800, color: '#1E40AF' }}>👶 नामकरण व जावळ</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(currentMonthMuhurat.namkaran || []).map((v, i) => (
                      <div key={i} style={{ fontSize: '0.88rem', color: '#1F2937', fontWeight: 700 }}>• {v}</div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#FFF7ED', padding: '18px', borderRadius: '14px', borderLeft: '4px solid #D97706' }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem', fontWeight: 800, color: '#92400E' }}>🚗 वाहन व सुवर्ण खरेदी</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(currentMonthMuhurat.vahanKharidi || []).map((v, i) => (
                      <div key={i} style={{ fontSize: '0.88rem', color: '#1F2937', fontWeight: 700 }}>• {v}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: इतिहास कालपट (History Timeline & Verified Sources) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'history' && (
          <div>
            <div style={{
              background: '#FFFFFF',
              padding: '20px 24px',
              borderRadius: '16px',
              border: '1.5px solid #FFEDD5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ flex: 1, minWidth: '260px' }}>
                <input
                  type="text"
                  placeholder="🔍 ऐतिहासिक घटना, व्यक्ती किंवा किल्ला शोधा (उदा. राज्याभिषेक, प्रतापगड, बाजीराव)..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 16px',
                    borderRadius: '10px',
                    border: '1.5px solid #F97316',
                    fontSize: '0.90rem',
                    outline: 'none',
                    background: '#FFF7ED',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'महापुरुष जन्म', 'स्वराज्य शपथ', 'किल्ले विजय', 'राज्याभिषेक सोहळा', 'सर्वोच्च बलिदान'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setHistoryCategory(cat)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '20px',
                      border: historyCategory === cat ? '1px solid #7C1D05' : '1px solid #E5E7EB',
                      background: historyCategory === cat ? '#7C1D05' : '#FFFFFF',
                      color: historyCategory === cat ? '#FFFFFF' : '#4B5563',
                      fontSize: '0.80rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    {cat === 'all' ? 'सर्व घटना' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Historical Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {filteredHistory.map(item => (
                <div
                  key={item.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px solid #FFEDD5',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                  <div style={{ position: 'relative' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = '/assets/images/real-shivaji-portrait.jpg'; }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(124, 29, 5, 0.90)',
                      color: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      📅 {item.date}
                    </span>
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#FEF3C7',
                      color: '#7C1D05',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>
                      {item.category}
                    </span>
                  </div>

                  <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#7C1D05', margin: '0 0 8px', lineHeight: 1.25 }}>
                        {item.title}
                      </h3>
                      <div style={{ fontSize: '0.80rem', color: '#6B7280', marginBottom: '10px' }}>
                        📍 {item.place} • 👑 {item.figures.join(', ')}
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.5, margin: '0 0 14px' }}>
                        {item.summary}
                      </p>
                    </div>

                    <div>
                      {/* Verified Source Capsule */}
                      <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.75rem', marginBottom: '14px' }}>
                        <div style={{ color: '#166534', fontWeight: 800 }}>✅ स्रोत: {item.references.primarySource}</div>
                        <div style={{ color: '#64748B' }}>{item.references.book} — {item.references.author}</div>
                      </div>

                      <button
                        onClick={() => setDetailEvent(item)}
                        style={{
                          width: '100%',
                          background: '#FFF7ED',
                          border: '1.5px solid #F97316',
                          color: '#C2410C',
                          padding: '8px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer'
                        }}>
                        📖 सविस्तर इतिहास व संदर्भ वाचा →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: संत आणि परंपरा (Saints & Warkari Layer) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'saints' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
              border: '1.5px solid #FDBA74',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '26px'
            }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7C1D05', margin: '0 0 6px' }}>
                🚩 महाराष्ट्राची संत परंपरा व वारकरी महासंस्कृती
              </h2>
              <p style={{ fontSize: '0.90rem', color: '#7C2D12', margin: 0, lineHeight: 1.5 }}>
                ज्ञानेश्वरांनी रचिला पाया, तुकारामांनी केला कळस. महाराष्ट्रातील संतांनी समाजाला सामाजिक समता, भक्ती आणि नैतिक सामर्थ्य दिले, ज्या पायावर शिवरायांचे स्वराज्य उभे राहिले.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '22px' }}>
              {SAINTS_OF_MAHARASHTRA.map(saint => (
                <div
                  key={saint.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px solid #FFEDD5',
                    padding: '22px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.30rem', fontWeight: 800, color: '#7C1D05', margin: '0 0 4px' }}>
                          {saint.name}
                        </h3>
                        <div style={{ fontSize: '0.80rem', color: '#9A3412', fontWeight: 700 }}>
                          कालखंड: {saint.period} • समाधी: {saint.samadhiPlace}
                        </div>
                      </div>
                      <span style={{ background: '#FEF3C7', color: '#7C1D05', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {saint.samadhiTithi}
                      </span>
                    </div>

                    <div style={{ background: '#FFFBEB', padding: '12px 14px', borderRadius: '10px', borderLeft: '3px solid #D97706', marginBottom: '14px', fontStyle: 'italic', fontSize: '0.88rem', color: '#78350F' }}>
                      "{saint.quote}"
                    </div>

                    <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.5, marginBottom: '14px' }}>
                      {saint.contribution}
                    </p>

                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#9A3412', marginBottom: '6px' }}>📚 प्रमुख संत साहित्य व ग्रंथ:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {saint.literature.map((lit, idx) => (
                          <div key={idx} style={{ fontSize: '0.82rem', color: '#4B5563' }}>
                            • <strong>{lit.title}:</strong> {lit.desc}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.80rem' }}>
                    <span style={{ color: '#166534', fontWeight: 700 }}>🎯 {saint.tithiHighlight}</span>
                    <Link to="/culture" style={{ color: '#C2410C', fontWeight: 700, textDecoration: 'underline' }}>अधिक माहिती →</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: सण व उत्सव (Maharashtra Festivals) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'festivals' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
              {[
                { id: 'all', label: 'सर्व सण व उत्सव' },
                { id: 'धार्मिक', label: '🛕 धार्मिक उत्सव' },
                { id: 'कृषी', label: '🌾 कृषी व लोकसंस्कृती' },
                { id: 'शौर्य', label: '⚔️ शौर्य व ऐतिहासिक' },
                { id: 'वारकरी', label: '🚩 वारकरी महापरंपरा' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFestivalFilter(f.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: festivalFilter === f.id ? '1px solid #7C1D05' : '1px solid #E5E7EB',
                    background: festivalFilter === f.id ? '#7C1D05' : '#FFFFFF',
                    color: festivalFilter === f.id ? '#FFFFFF' : '#4B5563',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {filteredFestivals.map(fest => (
                <div
                  key={fest.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px solid #FFEDD5',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
                  }}>
                  <div style={{ background: 'linear-gradient(90deg, #7C1D05, #C2410C)', color: '#FFFFFF', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800 }}>{fest.name}</h3>
                    <span style={{ background: '#FEF3C7', color: '#7C1D05', padding: '3px 8px', borderRadius: '12px', fontSize: '0.70rem', fontWeight: 800 }}>
                      {fest.type}
                    </span>
                  </div>

                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.80rem', color: '#9A3412', fontWeight: 700, marginBottom: '8px' }}>
                      <span>📅 मराठी तिथी: {fest.marathiDate}</span>
                      <span>ग्रेगोरियन: {fest.gregorianMonth}</span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.5, marginBottom: '12px' }}>
                      <strong>महत्त्व:</strong> {fest.significance}
                    </div>

                    <div style={{ background: '#FFF7ED', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', color: '#7C2D12', marginBottom: '12px' }}>
                      <strong>परंपरा व विधी:</strong> {fest.rituals}
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#6B7280' }}>
                      📍 <strong>प्रमुख प्रदेश:</strong> {fest.regions}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: उत्सव नकाशा (Interactive Festival Map & Wari Route) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'map' && (
          <div>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px solid #FFEDD5',
              padding: '24px',
              marginBottom: '26px'
            }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7C1D05', margin: '0 0 8px' }}>
                🗺️ महाराष्ट्र उत्सव, वारी मार्ग व यात्रा नकाशा
              </h2>
              <p style={{ fontSize: '0.90rem', color: '#6B7280', margin: '0 0 20px' }}>
                महाराष्ट्रातील प्रमुख तीर्थस्थळे, आषाढी वारी पालखी थांबे आणि सांस्कृतिक उत्सवांची परस्परसंवादी सूची.
              </p>

              {/* Map Location Selector */}
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' }}>
                {FESTIVAL_MAP_LOCATIONS.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedMapLocation(loc)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: selectedMapLocation.id === loc.id ? '2px solid #C2410C' : '1px solid #E5E7EB',
                      background: selectedMapLocation.id === loc.id ? '#FFF7ED' : '#FFFFFF',
                      color: selectedMapLocation.id === loc.id ? '#7C1D05' : '#374151',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                    <span>📍</span>
                    <span>{loc.name}</span>
                  </button>
                ))}
              </div>

              {/* Active Selected Location Card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'center', background: '#FFF7ED', padding: '20px', borderRadius: '16px', border: '1px solid #FED7AA' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    {selectedMapLocation.tags.map(t => (
                      <span key={t} style={{ background: '#FDBA74', color: '#7C1D05', padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7C1D05', margin: '0 0 8px' }}>
                    {selectedMapLocation.name}
                  </h3>

                  <div style={{ fontSize: '0.86rem', color: '#9A3412', fontWeight: 700, marginBottom: '12px' }}>
                    जिल्हा: {selectedMapLocation.district} • तालुका: {selectedMapLocation.taluka} • स्थळ: {selectedMapLocation.place}
                  </div>

                  <p style={{ fontSize: '0.90rem', color: '#374151', lineHeight: 1.5, marginBottom: '14px' }}>
                    <strong>इतिहास व परंपरा:</strong> {selectedMapLocation.history}
                  </p>

                  <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #FDBA74', fontSize: '0.84rem', marginBottom: '14px' }}>
                    <div style={{ fontWeight: 800, color: '#C2410C', marginBottom: '4px' }}>🚶‍♂️ यात्रा / पालखी मार्ग थांबे:</div>
                    <div style={{ color: '#4B5563' }}>{selectedMapLocation.routeHighlight}</div>
                  </div>

                  <div style={{ fontSize: '0.80rem', color: '#6B7280' }}>
                    भौगोलिक स्थान निर्देशांक: Lat {selectedMapLocation.coordinates.lat}, Lng {selectedMapLocation.coordinates.lng}
                  </div>
                </div>

                <div>
                  <img
                    src={selectedMapLocation.image}
                    alt={selectedMapLocation.name}
                    style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #FFFFFF', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
                    onError={(e) => { e.currentTarget.src = '/assets/images/real-sahyadri-forest.jpg'; }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: समुदाय दिनदर्शिका (Community Events & Submissions) */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'community' && (
          <div>
            <div style={{
              background: '#FFFFFF',
              padding: '18px 22px',
              borderRadius: '16px',
              border: '1.5px solid #FFEDD5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <label htmlFor="calendar-district-filter" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#4B5563' }}>जिल्हा:</label>
                <select
                  id="calendar-district-filter"
                  value={communityDistrict}
                  onChange={(e) => setCommunityDistrict(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #F97316', background: '#FFF7ED', fontWeight: 700, outline: 'none', fontSize: '0.84rem' }}>
                  {['सर्व', 'पुणे', 'सातारा', 'कोल्हापूर', 'छ. संभाजीनगर', 'नाशिक', 'ठाणे', 'मुंबई', 'नागपूर'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <label htmlFor="calendar-category-filter" style={{ fontSize: '0.84rem', fontWeight: 700, color: '#4B5563', marginLeft: '8px' }}>प्रवर्ग:</label>
                <select
                  id="calendar-category-filter"
                  value={communityCategory}
                  onChange={(e) => setCommunityCategory(e.target.value)}
                  style={{ padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #F97316', background: '#FFF7ED', fontWeight: 700, outline: 'none', fontSize: '0.84rem' }}>
                  {['all', 'किल्ले संवर्धन', 'व्याख्यान', 'रक्तदान', 'शिवजयंती', 'सामाजिक'].map(c => (
                    <option key={c} value={c}>{c === 'all' ? 'सर्व प्रवर्ग' : c}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #C2410C 0%, #EA580C 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: '30px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                <span>➕</span>
                <span>तुमचा कार्यक्रम जोडा</span>
              </button>
            </div>

            {/* Events Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              {filteredCommunity.map(ev => (
                <div
                  key={ev.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1.5px solid #FFEDD5',
                    padding: '22px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{
                        background: ev.status === 'Approved' ? '#DCFCE7' : '#FEF3C7',
                        color: ev.status === 'Approved' ? '#166534' : '#92400E',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800
                      }}>
                        {ev.status === 'Approved' ? '✅ अधिकृत मान्य कार्यक्रम' : '⏳ पडताळणी सुरू'}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: '#9A3412', fontWeight: 800 }}>
                        {ev.category}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7C1D05', margin: '0 0 8px', lineHeight: 1.25 }}>
                      {ev.title}
                    </h3>

                    <div style={{ fontSize: '0.84rem', color: '#4B5563', marginBottom: '10px' }}>
                      <div>📅 <strong>दिनांक:</strong> {ev.date} • {ev.time}</div>
                      <div>📍 <strong>स्थळ:</strong> {ev.venue}, {ev.district}</div>
                      <div>🏛️ <strong>आयोजक:</strong> {ev.organizer}</div>
                    </div>

                    <p style={{ fontSize: '0.86rem', color: '#374151', lineHeight: 1.5, margin: '0 0 14px' }}>
                      {ev.desc}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF7ED', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.78rem' }}>
                      <span style={{ color: '#9A3412', fontWeight: 700 }}>नोंदणीकृत जागा: {ev.rsvpCount || 0} / {ev.seats}</span>
                      <span style={{ color: '#6B7280' }}>📞 {ev.phone}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleRsvp(ev.id, ev.title)}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '9px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer'
                        }}>
                        ✋ उपस्थिती नोंदवा (RSVP)
                      </button>
                      <button
                        onClick={() => {
                          const icsData = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${ev.title}\nLOCATION:${ev.venue}, ${ev.district}\nDESCRIPTION:${ev.desc}\nEND:VEVENT\nEND:VCALENDAR`;
                          const blob = new Blob([icsData], { type: 'text/calendar' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${ev.title}.ics`;
                          a.click();
                        }}
                        title="Google / Apple कॅलेंडरमध्ये जोडा"
                        style={{
                          background: '#FFF7ED',
                          border: '1.5px solid #F97316',
                          color: '#C2410C',
                          padding: '9px 14px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer'
                        }}>
                        📥 जोडा
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========== MODAL: COMPREHENSIVE KALNIRNAY DAILY PANCHANG & HISTORY ========== */}
      {selectedDayCell && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px',
          zIndex: 9999
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            border: '3px solid #7C1D05',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #7C1D05 0%, #991B1B 50%, #7C1D05 100%)',
              color: '#FFFFFF',
              padding: '18px 24px',
              borderBottom: '3px solid #F59E0B',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.78rem', color: '#FED7AA', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  कालनिर्णय दैनिक पंचांग व दिनविशेष
                </div>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.35rem', fontWeight: 900, fontFamily: "'Baloo 2', sans-serif" }}>
                  {selectedDayCell.dayNumber} {monthNamesMr[selectedDayCell.date.getMonth()]} {selectedDayCell.date.getFullYear()} ({selectedDayCell.panchang.dayOfWeekMarathi})
                </h3>
                <div style={{ fontSize: '0.80rem', color: '#FEF3C7', marginTop: '2px' }}>
                  {selectedDayCell.panchang.marathiMonth} मास • {selectedDayCell.panchang.paksha} • {selectedDayCell.panchang.tithi}
                </div>
              </div>
              <button
                onClick={() => setSelectedDayCell(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#FFFFFF',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  fontSize: '1.2rem',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  fontWeight: 800
                }}>
                ✕
              </button>
            </div>

            <div style={{ padding: '22px 24px' }}>
              
              {/* Special Day Badges Banner */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {selectedDayCell.holidayName && (
                  <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800, border: '1px solid #F87171' }}>
                    🚩 शासकीय सुट्टी: {selectedDayCell.holidayName}
                  </span>
                )}
                {selectedDayCell.panchang.isPoornima && (
                  <span style={{ background: '#FEF08A', color: '#854D0E', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800, border: '1px solid #FACC15' }}>
                    🌕 पौर्णिमा (सत्यनारायण पूजा)
                  </span>
                )}
                {selectedDayCell.panchang.isAmavasya && (
                  <span style={{ background: '#1F2937', color: '#F9FAFB', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800 }}>
                    🌑 दर्श अमावस्या (पितृतर्पण)
                  </span>
                )}
                {selectedDayCell.panchang.isSankashti && (
                  <span style={{ background: '#EDE9FE', color: '#5B21B6', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800, border: '1px solid #DDD6FE' }}>
                    🌙 संकष्टी चतुर्थी (चंद्रोदय: {selectedDayCell.panchang.chandrodaya})
                  </span>
                )}
                {selectedDayCell.panchang.isEkadashi && (
                  <span style={{ background: '#ECFDF5', color: '#065F46', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800, border: '1px solid #A7F3D0' }}>
                    🙏 पवित्र एकादशी उपवास व्रत
                  </span>
                )}
              </div>

              {/* SECTION 1: पंचांग तपशील (Core Panchang Grid) */}
              <div style={{
                background: '#FFFBEB',
                borderRadius: '16px',
                border: '1.5px solid #FED7AA',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#7C1D05', marginBottom: '10px' }}>
                  📜 पंचांग मुख्य घटक (महाराष्ट्र प्रमाणवेळ):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                    <div style={{ fontSize: '0.72rem', color: '#9A3412', fontWeight: 700 }}>तिथी व पक्ष</div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1F2937' }}>{selectedDayCell.panchang.tithi}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{selectedDayCell.panchang.paksha}</div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                    <div style={{ fontSize: '0.72rem', color: '#9A3412', fontWeight: 700 }}>नक्षत्र</div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1F2937' }}>{selectedDayCell.panchang.nakshatra}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>ग्रह: {selectedDayCell.panchang.rulingPlanet}</div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                    <div style={{ fontSize: '0.72rem', color: '#9A3412', fontWeight: 700 }}>योग व करण</div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1F2937' }}>योग: {selectedDayCell.panchang.yog}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>करण: {selectedDayCell.panchang.karan}</div>
                  </div>

                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #FED7AA' }}>
                    <div style={{ fontSize: '0.72rem', color: '#9A3412', fontWeight: 700 }}>सूर्योदय व सूर्यास्त</div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1F2937' }}>🌅 {selectedDayCell.panchang.sunrise}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>🌇 सूर्यास्त: {selectedDayCell.panchang.sunset}</div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: शुभ व वर्ज्य काळ (Auspicious & Avoidable timings) */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: '16px',
                border: '1.5px solid #E2E8F0',
                padding: '16px',
                marginBottom: '18px'
              }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#334155', marginBottom: '10px' }}>
                  ⏳ शुभ मुहूर्त व वर्ज्य काळ:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '10px 12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#065F46', fontWeight: 800 }}>⭐ अभिजित मुहूर्त (अतिशुभ काळ):</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#047857' }}>{selectedDayCell.panchang.abhijitMuhurat}</div>
                    <div style={{ fontSize: '0.70rem', color: '#6B7280' }}>कोणतेही शुभ कार्य सुरू करण्यास सर्वोत्तम</div>
                  </div>

                  <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', padding: '10px 12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#9F1239', fontWeight: 800 }}>⚠️ राहू काळ (वर्ज्य वेळ):</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#BE123C' }}>{selectedDayCell.panchang.rahuKaal}</div>
                    <div style={{ fontSize: '0.70rem', color: '#6B7280' }}>या काळात नवीन कामे सुरू करणे टाळावे</div>
                  </div>

                  <div style={{ background: '#FFF7ED', border: '1px solid #FFEDD5', padding: '10px 12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#9A3412', fontWeight: 800 }}>⌛ यमगंड काळ:</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#C2410C' }}>{selectedDayCell.panchang.yamagand}</div>
                    <div style={{ fontSize: '0.70rem', color: '#6B7280' }}>प्रवास व व्यवहार सावधगिरीने करा</div>
                  </div>

                  <div style={{ background: '#F5F3FF', border: '1px solid #DDD6FE', padding: '10px 12px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#5B21B6', fontWeight: 800 }}>🌙 चंद्रोदय वेळ:</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#6D28D9' }}>{selectedDayCell.panchang.chandrodaya}</div>
                    <div style={{ fontSize: '0.70rem', color: '#6B7280' }}>रात्रीचे चंद्र दर्शन</div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: सण / उत्सव असल्यास */}
              {selectedDayCell.festival && (
                <div style={{
                  background: '#FFFBEB',
                  borderRadius: '16px',
                  border: '1.5px solid #F59E0B',
                  padding: '16px',
                  marginBottom: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.3rem' }}>🎉</span>
                    <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#78350F' }}>
                      {selectedDayCell.festival.name}
                    </h4>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, marginBottom: '6px' }}>
                    <strong>धार्मिक व सांस्कृतिक महत्त्व:</strong> {selectedDayCell.festival.significance}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#92400E' }}>
                    <strong>विधी व परंपरा:</strong> {selectedDayCell.festival.rituals}
                  </div>
                </div>
              )}

              {/* SECTION 4: या दिवसाचा शिवकालीन इतिहास */}
              {selectedDayCell.history && (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '2px solid #FED7AA',
                  overflow: 'hidden',
                  marginBottom: '18px'
                }}>
                  <div style={{ background: 'linear-gradient(90deg, #7C1D05, #C2410C)', color: '#FFFFFF', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.90rem' }}>⚔️ आजच्या दिवशी महाराष्ट्राच्या इतिहासात</span>
                    <span style={{ background: '#FEF3C7', color: '#7C1D05', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800 }}>
                      {selectedDayCell.history.category}
                    </span>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 800, color: '#7C1D05' }}>
                      {selectedDayCell.history.title} ({selectedDayCell.history.year})
                    </h4>
                    <div style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '8px' }}>
                      📍 स्थळ: {selectedDayCell.history.place} • 👑 संबंधित: {selectedDayCell.history.figures.join(', ')}
                    </div>
                    <p style={{ fontSize: '0.90rem', color: '#374151', lineHeight: 1.55, margin: '0 0 12px' }}>
                      {selectedDayCell.history.summary}
                    </p>
                    <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.76rem' }}>
                      <div style={{ color: '#166534', fontWeight: 800 }}>✅ प्रमाणित स्रोत: {selectedDayCell.history.references.primarySource}</div>
                      <div style={{ color: '#64748B' }}>{selectedDayCell.history.references.book} ({selectedDayCell.history.references.author})</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={() => {
                    const text = `${selectedDayCell.dayNumber} ${monthNamesMr[selectedDayCell.date.getMonth()]} ${selectedDayCell.date.getFullYear()} - ${selectedDayCell.panchang.tithi}, ${selectedDayCell.panchang.nakshatra}। कालनिर्णय दिनदर्शिका द्वारे Connect Maratha`;
                    navigator.clipboard.writeText(text);
                    alert('दैनिक पंचांग माहिती कॉपी झाली!');
                  }}
                  style={{
                    background: '#FFF7ED',
                    color: '#C2410C',
                    border: '1.5px solid #F97316',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}>
                  📤 पंचांग शेअर करा
                </button>
                <button
                  onClick={() => setSelectedDayCell(null)}
                  style={{
                    background: '#7C1D05',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 22px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    cursor: 'pointer'
                  }}>
                  बंद करा
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: DETAIL HISTORICAL DOCUMENT ========== */}
      {detailEvent && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.70)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          zIndex: 9999
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '2px solid #FED7AA',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
            position: 'relative'
          }}>
            <div style={{ background: 'linear-gradient(90deg, #7C1D05, #9A3412)', color: '#FFFFFF', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px' }}>
                  {detailEvent.date}
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.25rem', fontWeight: 800 }}>{detailEvent.title}</h3>
              </div>
              <button
                onClick={() => setDetailEvent(null)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.5rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <img
                src={detailEvent.image}
                alt={detailEvent.title}
                style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }}
                onError={(e) => { e.currentTarget.src = '/assets/images/real-shivaji-portrait.jpg'; }}
              />

              <div style={{ fontSize: '0.84rem', color: '#9A3412', fontWeight: 700, marginBottom: '8px' }}>
                📍 स्थळ: {detailEvent.place} • 👑 संबंधित महापुरुष: {detailEvent.figures.join(', ')}
              </div>

              <div style={{ fontSize: '0.94rem', color: '#1F2937', lineHeight: 1.6, marginBottom: '16px' }}>
                <strong>घटनाक्रम:</strong> {detailEvent.detail}
              </div>

              <div style={{ background: '#FFF7ED', padding: '14px 18px', borderRadius: '12px', borderLeft: '4px solid #C2410C', marginBottom: '18px' }}>
                <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#9A3412', marginBottom: '4px' }}>ऐतिहासिक पार्श्वभूमी:</div>
                <div style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5 }}>{detailEvent.background}</div>
              </div>

              <div style={{ background: '#F8FAFC', padding: '14px 18px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 800, color: '#166534', marginBottom: '6px' }}>📚 प्रमाणित ऐतिहासिक संदर्भ व स्रोत तपशील:</div>
                <div style={{ color: '#334155' }}>• <strong>प्राथमिक दस्तऐवज:</strong> {detailEvent.references.primarySource}</div>
                <div style={{ color: '#334155' }}>• <strong>ग्रंथ व लेखक:</strong> {detailEvent.references.book} ({detailEvent.references.author})</div>
                <div style={{ color: '#334155' }}>• <strong>संग्रहालय व पुराभिलेख संदर्भ:</strong> {detailEvent.references.archive}</div>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button
                  onClick={() => setDetailEvent(null)}
                  style={{
                    background: '#7C1D05',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  बंद करा
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== MODAL: SUBMIT COMMUNITY EVENT ========== */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.70)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          zIndex: 9999
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            maxWidth: '580px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            border: '2px solid #FED7AA',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)'
          }}>
            <div style={{ background: 'linear-gradient(90deg, #7C1D05, #C2410C)', color: '#FFFFFF', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>➕ नवीन समुदाय कार्यक्रम सादर करा</h3>
                <span style={{ fontSize: '0.78rem', color: '#FED7AA' }}>प्रशासक मान्यतेनंतर संपूर्ण महाराष्ट्रातील दिनदर्शिकेत दिसेल</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '1.5rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>कार्यक्रमाचे शीर्षक *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. किल्ले रायगड स्वच्छता व शिवकालीन व्याख्यान"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #FED7AA', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>प्रवर्ग *</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #FED7AA', fontSize: '0.88rem' }}>
                    <option value="व्याख्यान">व्याख्यान</option>
                    <option value="किल्ले संवर्धन">किल्ले संवर्धन</option>
                    <option value="शिवजयंती कार्यक्रम">शिवजयंती कार्यक्रम</option>
                    <option value="रक्तदान शिबिर">रक्तदान शिबिर</option>
                    <option value="सांस्कृतिक कार्यक्रम">सांस्कृतिक कार्यक्रम</option>
                    <option value="पुस्तक प्रकाशन">पुस्तक प्रकाशन</option>
                    <option value="यात्रा / उत्सव">यात्रा / उत्सव</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>जिल्हा *</label>
                  <select
                    value={newEvent.district}
                    onChange={(e) => setNewEvent({ ...newEvent, district: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #FED7AA', fontSize: '0.88rem' }}>
                    {['पुणे', 'सातारा', 'कोल्हापूर', 'छ. संभाजीनगर', 'नाशिक', 'ठाणे', 'मुंबई', 'सोलापूर', 'नागपूर', 'सांगली'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>दिनांक *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #FED7AA', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>वेळ</label>
                  <input
                    type="text"
                    placeholder="उदा. सकाळी १०:००"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #FED7AA', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>स्थळ व पत्ता *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. बालगंधर्व रंगमंदिर, झाशीची राणी चौक"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #FED7AA', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>आयोजक संस्था / व्यक्ती *</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. मराठा सेवा संघ"
                    value={newEvent.organizer}
                    onChange={(e) => setNewEvent({ ...newEvent, organizer: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #FED7AA', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>संपर्क मोबाईल *</label>
                  <input
                    type="tel"
                    required
                    placeholder="उदा. ९८२२०१२३४५"
                    value={newEvent.phone}
                    onChange={(e) => setNewEvent({ ...newEvent, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #FED7AA', fontSize: '0.88rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>कार्यक्रमाची सविस्तर माहिती</label>
                <textarea
                  rows="3"
                  placeholder="कार्यक्रमाचा उद्देश, मुख्य पाहुणे किंवा सहभागी होण्यासाठी मार्गदर्शक सूचना..."
                  value={newEvent.desc}
                  onChange={(e) => setNewEvent({ ...newEvent, desc: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #FED7AA', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}>
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #7C1D05 0%, #C2410C 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '9px 22px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}>
                  🚩 कार्यक्रम सादर करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
