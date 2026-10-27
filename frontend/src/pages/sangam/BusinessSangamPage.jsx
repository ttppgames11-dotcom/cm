import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import apiClient from '../../services/apiClient';
import {
  SEAT_STATUS_LABELS, CATEGORY_LABELS, seatsText, isFull, seatActions, joinableBusinesses, activeSeatIn, filterChapters, summary
} from './chapterList';

// Existing city photos; any other city gets the standard picture.
const CITY_IMAGES = {
  'पुणे': '/assets/images/sangam-ch-pune.jpg',
  'Pune': '/assets/images/sangam-ch-pune.jpg',
  'कोल्हापूर': '/assets/images/sangam-ch-kolhapur.jpg',
  'Kolhapur': '/assets/images/sangam-ch-kolhapur.jpg',
  'नाशिक': '/assets/images/sangam-ch-nashik.jpg',
  'Nashik': '/assets/images/sangam-ch-nashik.jpg',
  'छत्रपती संभाजीनगर': '/assets/images/sangam-ch-csmb.jpg',
  'संभाजीनगर': '/assets/images/sangam-ch-csmb.jpg',
  'Sambhajinagar': '/assets/images/sangam-ch-csmb.jpg',
  'ठाणे': '/assets/images/sangam-ch-thane.jpg',
  'Thane': '/assets/images/sangam-ch-thane.jpg'
};
const DEFAULT_IMAGE = '/assets/images/sangam-wf-mandal.jpg';

const ACTION_LABELS = {
  approve: '✓ मंजूर करा',
  decline: 'नाकारा',
  remove: 'काढा',
  cancel: 'विनंती रद्द करा',
  leave: 'चॅप्टर सोडा'
};
const ACTION_CONFIRM = {
  remove: 'हा व्यवसाय चॅप्टरमधून काढायचा?',
  leave: 'आपण हा चॅप्टर सोडू इच्छिता?'
};

const btn = (primary) => ({
  padding: '7px 12px',
  borderRadius: '6px',
  fontSize: '0.8rem',
  fontWeight: 700,
  cursor: 'pointer',
  border: primary ? 'none' : '1px solid #D6D3CD',
  background: primary ? '#C73800' : '#FFFFFF',
  color: primary ? '#FFFFFF' : '#1B2430'
});

function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#FFFFFF', borderRadius: '14px', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto', padding: '22px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontFamily: 'Baloo 2', fontSize: '1.2rem' }}>{title}</h3>
          <button onClick={onClose} style={{ ...btn(false), padding: '4px 10px' }} aria-label="बंद करा">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function BusinessSangamPage() {
  const { user } = useAuth();
  const memberId = user?.id;
  const navigate = useNavigate();
  const location = useLocation();

  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');

  const [mine, setMine] = useState({ seats: [], coordinating: [] });
  const [coordSeats, setCoordSeats] = useState({}); // chapter id -> seats
  const [myBusinesses, setMyBusinesses] = useState([]);

  const [viewing, setViewing] = useState(null); // { chapter, businesses, loading }
  const [joining, setJoining] = useState(null); // { chapter, businessId, message }
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState(null); // { text, ok }

  const loadChapters = useCallback(async () => {
    try {
      setChapters(await apiClient.getChapters());
      setLoadError('');
    } catch (err) {
      setLoadError(err.message || 'चॅप्टर्स लोड करता आले नाहीत.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMine = useCallback(async () => {
    if (!memberId) return;
    try {
      const data = await apiClient.getMyChapters();
      setMine(data);
      const entries = await Promise.all(
        data.coordinating.map(async (c) => [c.id, await apiClient.getChapterSeats(c.id).catch(() => [])])
      );
      setCoordSeats(Object.fromEntries(entries));
    } catch (err) {
      setNotice({ text: err.message, ok: false });
    }
  }, [memberId]);

  useEffect(() => { loadChapters(); }, [loadChapters]);
  useEffect(() => { loadMine(); }, [loadMine]);

  const loginFirst = () => navigate('/login?redirect=' + encodeURIComponent(location.pathname));

  const openBusinesses = async (chapter) => {
    if (!memberId) return loginFirst();
    setViewing({ chapter, businesses: [], loading: true });
    try {
      const businesses = await apiClient.getChapterBusinesses(chapter.id);
      setViewing({ chapter, businesses, loading: false });
    } catch (err) {
      setViewing({ chapter, businesses: [], loading: false, error: err.message || 'व्यवसाय लोड करता आले नाहीत.' });
    }
  };

  const openJoin = async (chapter) => {
    if (!memberId) return loginFirst();
    let list = myBusinesses;
    try {
      const res = await api.businesses.mine();
      list = res?.businesses || [];
      setMyBusinesses(list);
    } catch (err) {
      setNotice({ text: err.message, ok: false });
      return;
    }
    const choices = joinableBusinesses(list, mine.seats);
    setJoining({ chapter, businessId: choices[0]?.id || '', message: '', error: '' });
  };

  const submitJoin = async (e) => {
    e.preventDefault();
    if (!joining?.businessId || busy) return;
    setBusy('join');
    try {
      const res = await apiClient.joinChapter(joining.chapter.id, { businessId: joining.businessId, message: joining.message.trim() });
      setNotice({ text: res.message || 'विनंती पाठवली!', ok: true });
      setJoining(null);
      await Promise.all([loadMine(), loadChapters()]);
    } catch (err) {
      // Shown inside the open window, where the member is looking.
      setJoining((j) => j && { ...j, error: err.message || 'विनंती पाठवता आली नाही.' });
    } finally {
      setBusy('');
    }
  };

  const runAction = async (seatId, action) => {
    if (busy) return;
    if (ACTION_CONFIRM[action] && !window.confirm(ACTION_CONFIRM[action])) return;
    setBusy(seatId);
    try {
      const res = await apiClient.chapterSeatAction(seatId, action);
      setNotice({ text: res.message || 'झाले.', ok: true });
      await Promise.all([loadMine(), loadChapters()]);
    } catch (err) {
      setNotice({ text: err.message, ok: false });
    } finally {
      setBusy('');
    }
  };

  const totals = summary(chapters);
  const cities = Array.from(new Set(chapters.map((c) => c.city).filter(Boolean)));
  const filteredChapters = filterChapters(chapters, { search: searchQuery, city: selectedCity });
  const joinChoices = joining ? joinableBusinesses(myBusinesses, mine.seats) : [];
  const showMyBox = memberId && (mine.seats.length > 0 || mine.coordinating.length > 0);


  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', color: '#1B2430' }}>
      {/* Topbar strip with authentic heritage branding */}
      <div style={{ background: '#7A1C08', color: '#FFF8E7', borderBottom: '1px solid rgba(218,165,32,0.3)', padding: '7px 0', fontSize: '0.82rem' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#F6B800', fontWeight: 800 }}>🚩 ओळखीतून संबंध · संबंधातून विश्वास · विश्वासातून स्वराज्य व्यापार</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>📞 व्यवसाय कक्ष: <strong style={{ color: '#FFF' }}>१८००-१२३-१६७४</strong></span>
            <span>|</span>
            <Link to="/contact" style={{ color: '#F6B800', textDecoration: 'none', fontWeight: 600 }}>
              संपर्क व थेट सहाय्यता →
            </Link>
          </div>
        </div>
      </div>

      {/* COMPACT HERO BANNER (Balanced width, authentic Maharashtrian business summit photo) */}
      <div style={{ position: 'relative', overflow: 'hidden', background: '#0e1118' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 20px', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 45px rgba(0,0,0,0.35)',
              border: '1px solid rgba(246, 184, 0, 0.25)'
            }}
          >
            {/* Background: Authentic Maratha Business Summit / Council */}
            <img
              src="/assets/images/maratha-business-sangam.jpg"
              alt="Connect Maratha व्यवसाय संगम परिषद"
              style={{
                width: '100%',
                height: '340px',
                objectFit: 'cover',
                display: 'block',
                filter: 'brightness(0.35) contrast(1.15)'
              }}
            />

            {/* Gradient Overlay for high text contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, rgba(20,8,4,0.92) 0%, rgba(30,12,5,0.78) 55%, rgba(15,6,3,0.45) 100%)'
              }}
            />

            {/* Content Box */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '30px 40px',
                maxWidth: '780px'
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(246, 184, 0, 0.2)',
                  border: '1px solid rgba(246, 184, 0, 0.55)',
                  color: '#FBD76B',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  width: 'fit-content',
                  marginBottom: '10px'
                }}
              >
                <span>🚩</span> CONNECT MARATHA • स्वराज्य व्यापार व व्यवसाय संगम
              </div>

              <h1
                style={{
                  fontFamily: "'Baloo 2', sans-serif",
                  fontSize: 'clamp(1.7rem, 3.2vw, 2.35rem)',
                  lineHeight: 1.25,
                  margin: '0 0 10px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)'
                }}
              >
                ओळखीतून संबंध • संबंधातून विश्वास • विश्वासातून व्यवसाय
              </h1>

              <p
                style={{
                  fontSize: '0.96rem',
                  lineHeight: 1.6,
                  color: '#F0ECE4',
                  margin: '0 0 20px',
                  maxWidth: '620px'
                }}
              >
                छत्रपती शिवरायांच्या व्यापारनीती आणि सहकार्य तत्त्वावर आधारित, महाराष्ट्रातील मराठी उद्योजक व व्यावसायिकांना जोडणारे अधिकृत स्थानिक मंडळ व्यासपीठ.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link
                  to="/meetings"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    background: '#C73800',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(199,56,0,0.4)'
                  }}
                >
                  ☕ १-टू-१ बैठका पोर्टल
                </Link>
                <Link
                  to="/business/directory"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(6px)',
                    color: '#FFF',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  🤝 व्यवसाय संधी व डिरेक्टरी
                </Link>
                <Link
                  to="/referrals"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    background: 'rgba(246,184,0,0.15)',
                    color: '#FBD76B',
                    border: '1px solid rgba(246,184,0,0.4)',
                    borderRadius: '8px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  🔗 रेफरल ट्रॅकर
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 20px 60px' }}>

        {notice && (
          <div
            role="status"
            style={{
              marginBottom: '20px', padding: '12px 16px', borderRadius: '10px', fontSize: '0.88rem', fontWeight: 600,
              display: 'flex', justifyContent: 'space-between', gap: '12px',
              background: notice.ok ? '#E8F5E9' : '#FDECEA', color: notice.ok ? '#1B5E20' : '#8A1C1C',
              border: `1px solid ${notice.ok ? '#C8E6C9' : '#F5C2C0'}`
            }}
          >
            <span>{notice.text}</span>
            <button onClick={() => setNotice(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800 }} aria-label="बंद करा">✕</button>
          </div>
        )}

        {/* STATS SUMMARY BAR (real counts only) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            background: '#FFFFFF',
            padding: '20px 24px',
            borderRadius: '16px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.04)',
            border: '1px solid #EADBCC',
            marginBottom: '32px'
          }}
        >
          {[
            { value: totals.chapters, label: 'सक्रिय व्यवसाय मंडळे (Chapters)', color: '#C73800' },
            { value: totals.businesses, label: 'चॅप्टर्समधील व्यवसाय', color: '#D97706' },
            { value: totals.cities, label: 'शहरे', color: '#15803D' }
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.1rem', fontWeight: 800, color: s.color, fontFamily: 'Baloo 2', lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: '0.84rem', color: '#6A7280', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* MY CHAPTERS (logged-in members with a request, a seat, or a chapter to coordinate) */}
        {showMyBox && (
          <section
            style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #EADBCC', padding: '20px 24px', marginBottom: '32px' }}
          >
            <h2 style={{ fontSize: '1.35rem', margin: '0 0 12px', fontFamily: 'Baloo 2' }}>माझे चॅप्टर्स (My chapters)</h2>

            {mine.seats.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: mine.coordinating.length ? '20px' : 0 }}>
                {mine.seats.map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 12px', background: '#FAF7F2', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.86rem' }}>
                      <strong>{s.chapter_name}</strong> · {s.business_name}
                      <span style={{ marginLeft: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#7A1C08' }}>{SEAT_STATUS_LABELS[s.status] || s.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {seatActions(s, { memberId, isCoordinator: false }).map((a) => (
                        <button key={a} style={btn(false)} disabled={busy === s.id} onClick={() => runAction(s.id, a)}>{ACTION_LABELS[a]}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {mine.coordinating.map((c) => {
              const rows = coordSeats[c.id] || [];
              const waiting = rows.filter((r) => r.status === 'waiting');
              const approved = rows.filter((r) => r.status === 'approved');
              const row = (r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
                    padding: '10px 12px', borderRadius: '10px',
                    background: r.status === 'waiting' && r.similar > 0 ? '#FFF4E5' : '#FAF7F2',
                    border: r.status === 'waiting' && r.similar > 0 ? '1px solid #F6C27A' : '1px solid transparent'
                  }}
                >
                  <div style={{ fontSize: '0.84rem' }}>
                    <strong>{r.business_name}</strong> · {CATEGORY_LABELS[r.cat] || r.cat} · {r.city} · {r.owner}
                    {r.business_hidden && <span style={{ marginLeft: '6px', fontSize: '0.72rem', color: '#6A7280' }}>(लपवलेला)</span>}
                    {r.status === 'waiting' && r.similar > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 700 }}>
                        ⚠ या चॅप्टरमध्ये याच प्रकारचे {r.similar} व्यवसाय आधीच आहेत
                      </div>
                    )}
                    {r.message && <div style={{ fontSize: '0.78rem', color: '#4B5563' }}>“{r.message}”</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {seatActions(r, { memberId, isCoordinator: true }).map((a) => (
                      <button key={a} style={btn(a === 'approve')} disabled={busy === r.id} onClick={() => runAction(r.id, a)}>{ACTION_LABELS[a]}</button>
                    ))}
                  </div>
                </div>
              );
              return (
                <div key={c.id} style={{ marginTop: '12px' }}>
                  <h3 style={{ fontSize: '1.05rem', margin: '0 0 8px', fontFamily: 'Baloo 2' }}>
                    समन्वयक: {c.name} {c.status === 'closed' && <span style={{ fontSize: '0.75rem', color: '#6A7280' }}>(बंद)</span>}
                  </h3>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5A626F', margin: '6px 0' }}>प्रलंबित विनंत्या ({waiting.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {waiting.length ? waiting.map(row) : <div style={{ fontSize: '0.82rem', color: '#6A7280' }}>कोणतीही विनंती नाही.</div>}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#5A626F', margin: '12px 0 6px' }}>सदस्य व्यवसाय ({approved.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {approved.length ? approved.map(row) : <div style={{ fontSize: '0.82rem', color: '#6A7280' }}>अद्याप कोणी सदस्य नाही.</div>}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* SECTION HEADER & CONTROLS */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span
              style={{
                display: 'inline-block',
                background: '#FFF3E0',
                color: '#C73800',
                fontWeight: 700,
                fontSize: '0.78rem',
                padding: '4px 10px',
                borderRadius: '6px',
                marginBottom: '6px',
                border: '1px solid #FFE0B2'
              }}
            >
              🚩 स्थानिक चॅप्टर्स व स्वराज्य मंडळे
            </span>
            <h2 style={{ fontSize: '1.75rem', margin: 0, fontFamily: 'Baloo 2', color: '#1B2430', fontWeight: 700 }}>
              सक्रिय व्यवसाय मंडळे (Active Business Chapters)
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#5A626F' }}>
              आपल्या परिसरातील मंडळाचे आठवडी बैठका, ठिकाण व सदस्य व्यवसाय
            </p>
          </div>

          {/* Search and City Filter */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="मंडळ, शहर किंवा परिसर शोधा..."
              style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #D6D3CD', fontSize: '0.86rem', width: '240px', maxWidth: '100%', background: '#FFFFFF' }}
            />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #D6D3CD', fontSize: '0.86rem', background: '#FFFFFF', cursor: 'pointer' }}
            >
              <option value="all">सर्व शहरे ({chapters.length})</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CHAPTERS GRID */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6A7280', marginBottom: '56px' }}>लोड होत आहे...</div>
        ) : loadError ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8A1C1C', marginBottom: '56px' }}>
            {loadError} <button style={btn(false)} onClick={loadChapters}>पुन्हा प्रयत्न करा</button>
          </div>
        ) : chapters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px dashed #EADBCC', marginBottom: '56px' }}>
            <div style={{ fontSize: '2rem' }}>🚩</div>
            <h3 style={{ fontFamily: 'Baloo 2', margin: '6px 0' }}>अद्याप चॅप्टर्स नाहीत — लवकरच सुरू होत आहेत</h3>
            <p style={{ color: '#5A626F', fontSize: '0.88rem', margin: 0 }}>नवीन चॅप्टर सुरू झाल्यावर तो येथे दिसेल.</p>
          </div>
        ) : filteredChapters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6A7280', marginBottom: '56px' }}>या शोधासाठी कोणताही चॅप्टर सापडला नाही.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(350px, 100%), 1fr))', gap: '24px', marginBottom: '56px' }}>
            {filteredChapters.map((ch) => (
              <div
                key={ch.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #EADBCC',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Card image with city badge, seats badge and name */}
                <div style={{ position: 'relative', height: '185px', overflow: 'hidden', background: '#2D3748' }}>
                  <img
                    src={CITY_IMAGES[ch.city] || DEFAULT_IMAGE}
                    alt={ch.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
                  <div
                    style={{
                      position: 'absolute', top: '12px', left: '12px', background: 'rgba(255, 255, 255, 0.95)', color: '#C73800',
                      padding: '3px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  >
                    📍 {ch.city}
                  </div>
                  <div
                    style={{
                      position: 'absolute', top: '12px', right: '12px',
                      background: isFull(ch) ? '#F3F4F6' : '#FEF3C7', color: isFull(ch) ? '#4B5563' : '#92400E',
                      padding: '3px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    {isFull(ch) ? 'सर्व जागा पूर्ण (Full)' : seatsText(ch)}
                  </div>
                  <div style={{ position: 'absolute', bottom: '10px', left: '16px', right: '16px' }}>
                    {ch.area && (
                      <div style={{ color: '#FBD76B', fontSize: '0.72rem', fontWeight: 600, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>📌 {ch.area}</div>
                    )}
                    <h3 style={{ margin: '2px 0 0', fontFamily: 'Baloo 2', fontSize: '1.24rem', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.25, textShadow: '0 2px 6px rgba(0,0,0,0.8)' }}>
                      {ch.name}
                    </h3>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', color: '#4B5563', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {(ch.meeting_day || ch.meeting_time) && (
                        <div>📅 <strong>{ch.meeting_day}</strong>{ch.meeting_time ? ` (${ch.meeting_time})` : ''}</div>
                      )}
                      {ch.venue && <div>🏨 <span>{ch.venue}</span></div>}
                      {ch.coordinator_name && <div>👤 समन्वयक: <strong>{ch.coordinator_name}</strong></div>}
                      <div>🏢 {seatsText(ch)}</div>
                    </div>
                    {ch.categories?.length > 0 && (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {ch.categories.map((c) => (
                          <span key={c.cat} style={{ background: '#FAF5EE', color: '#7A1C08', fontSize: '0.7rem', padding: '2px 7px', borderRadius: '4px', border: '1px solid #F0DEC9' }}>
                            • {CATEGORY_LABELS[c.cat] || c.cat} ({c.count})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid #F0ECE4' }}>
                    <button
                      onClick={() => openJoin(ch)}
                      disabled={isFull(ch)}
                      style={{ ...btn(true), flex: 1, opacity: isFull(ch) ? 0.5 : 1, cursor: isFull(ch) ? 'not-allowed' : 'pointer' }}
                    >
                      🚩 सामील होण्याची विनंती
                    </button>
                    <button onClick={() => openBusinesses(ch)} style={{ ...btn(false), flex: 1 }}>
                      व्यवसाय पहा
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WORKFLOW EXPLANATION SECTION - 100% SUITABLE BUSINESS & INDUSTRY IMAGES */}
        <section
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #EADBCC',
            padding: '36px 30px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span
              style={{
                background: '#FEF3C7',
                color: '#92400E',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '12px',
                display: 'inline-block',
                marginBottom: '8px'
              }}
            >
              🔄 पारदर्शक व्यावसायिक नेटवर्किंग पद्धती
            </span>
            <h2 style={{ fontSize: '1.9rem', margin: '4px 0 8px', fontFamily: 'Baloo 2', color: '#1B2430', fontWeight: 800 }}>
              व्यवसाय संगम कसे काम करते?
            </h2>
            <p style={{ color: '#5A626F', fontSize: '0.92rem', maxWidth: '640px', margin: '0 auto' }}>
              मराठी उद्योजकांच्या परस्पर सहकार्यातून व्यापार व समृद्धी वृद्धीचे ४ महत्त्वाचे टप्पे
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            {/* Step 1: Business Council Executive Round Table */}
            <div
              style={{
                background: '#FAF7F2',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #EADBCC',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '145px', overflow: 'hidden' }}>
                <img
                  src="/assets/images/sangam-wf-mandal.jpg"
                  alt="उद्योजक परिषद व व्यवसाय गोलमेज बैठक"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C73800', marginBottom: '4px' }}>
                  टप्पा १ • उद्योजक परिषद
                </div>
                <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px', fontFamily: 'Baloo 2', color: '#1B2430' }}>
                  १. शहरनिहाय मंडळात सहभाग
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#5A626F', lineHeight: 1.5, margin: 0 }}>
                  आपल्या शहराच्या स्थानिक चॅप्टरमध्ये सामील होण्याची विनंती करा. एकाच प्रकारचे व्यवसाय आपसात स्पर्धा करू नयेत याची काळजी समन्वयक घेतात.
                </p>
              </div>
            </div>

            {/* Step 2: 1-to-1 B2B Partnership Meeting */}
            <div
              style={{
                background: '#FAF7F2',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #EADBCC',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '145px', overflow: 'hidden' }}>
                <img
                  src="/assets/images/sangam-wf-meeting.jpg"
                  alt="१-टू-१ सखोल बी२बी व्यावसायिक चर्चा व भागीदारी"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706', marginBottom: '4px' }}>
                  टप्पा २ • ओळख व विश्वास
                </div>
                <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px', fontFamily: 'Baloo 2', color: '#1B2430' }}>
                  २. १-टू-१ सखोल बैठका
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#5A626F', lineHeight: 1.5, margin: 0 }}>
                  इतर मराठा उद्योजकांशी वैयक्तिक बैठक घेऊन एकमेकांची उत्पादने, क्षमता व ग्राहकांची अचूक गरज जाणून घ्या.
                </p>
              </div>
            </div>

            {/* Step 3: Project Blueprints & Commercial Opportunity */}
            <div
              style={{
                background: '#FAF7F2',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #EADBCC',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '145px', overflow: 'hidden', background: '#1c2420' }}>
                <img
                  src="/assets/images/sangam-wf-opportunity.jpg"
                  alt="प्रकल्प आराखडा व व्यावसायिक संधींचे नियोजन"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D', marginBottom: '4px' }}>
                  टप्पा ३ • थेट संधी व नियोजन
                </div>
                <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px', fontFamily: 'Baloo 2', color: '#1B2430' }}>
                  ३. उच्च-मूल्य संधींची देवाणघेवाण
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#5A626F', lineHeight: 1.5, margin: 0 }}>
                  आपल्या ओळखीतील विश्वासू व दर्जेदार व्यावसायिक ग्राहक, सप्लाय चेन व थेट खरेदीदारांचे रेफरल्स पोर्टलवरून पाठवा.
                </p>
              </div>
            </div>

            {/* Step 4: Executive Boardroom Deal Closure */}
            <div
              style={{
                background: '#FAF7F2',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid #EADBCC',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ height: '145px', overflow: 'hidden' }}>
                <img
                  src="/assets/images/sangam-wf-deal.jpg"
                  alt="एक्झिक्युटिव्ह बोर्डरूम क्लोज्ड डील व व्यावसायिक यश"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7A1C08', marginBottom: '4px' }}>
                  टप्पा ४ • क्लोज्ड डील व यश
                </div>
                <h4 style={{ fontSize: '1.05rem', margin: '0 0 6px', fontFamily: 'Baloo 2', color: '#1B2430' }}>
                  ४. रेफरल ट्रॅकिंग व क्लोज्ड डील
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#5A626F', lineHeight: 1.5, margin: 0 }}>
                  प्रत्येक यशस्वी कराराची नोंद ठेवा, व्यवसाय वृद्धी साजरी करा आणि संपूर्ण मराठा समाजातील उद्योगांचा विस्तार करा.
                </p>
              </div>
            </div>

          </div>
        </section>

      </div>

      {viewing && (
        <Modal title={`${viewing.chapter.name} — व्यवसाय`} onClose={() => setViewing(null)}>
          {viewing.loading ? (
            <div style={{ color: '#6A7280' }}>लोड होत आहे...</div>
          ) : viewing.error ? (
            <div role="alert" style={{ color: '#8A1C1C', fontWeight: 600 }}>{viewing.error}</div>
          ) : viewing.businesses.length === 0 ? (
            <div style={{ color: '#6A7280' }}>या चॅप्टरमध्ये अद्याप कोणताही व्यवसाय नाही.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {viewing.businesses.map((b) => (
                <div key={b.business_id} style={{ padding: '10px 12px', background: '#FAF7F2', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.86rem' }}>
                    <strong>{b.name}</strong>
                    <div style={{ fontSize: '0.76rem', color: '#5A626F' }}>{CATEGORY_LABELS[b.cat] || b.cat} · {b.city} · {b.owner}</div>
                  </div>
                  {b.owner_id && b.owner_id !== memberId && (
                    <Link to={`/meetings?recipient=${encodeURIComponent(b.owner_id)}`} style={{ ...btn(true), textDecoration: 'none' }}>
                      ☕ १-टू-१ बैठक
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '14px', fontSize: '0.82rem' }}>
            <Link to="/business" style={{ color: '#C73800', fontWeight: 700 }}>संपूर्ण व्यवसाय डिरेक्टरी पहा →</Link>
          </div>
        </Modal>
      )}

      {joining && (
        <Modal title={`${joining.chapter.name} — सामील होण्याची विनंती`} onClose={() => setJoining(null)}>
          {activeSeatIn(mine.seats, joining.chapter.id) ? (
            <div style={{ fontSize: '0.88rem' }}>
              <p style={{ margin: 0 }}>
                आपण या चॅप्टरमध्ये आधीच आहात किंवा आपली विनंती प्रलंबित आहे ({activeSeatIn(mine.seats, joining.chapter.id).business_name} —{' '}
                {SEAT_STATUS_LABELS[activeSeatIn(mine.seats, joining.chapter.id).status]}). एका चॅप्टरमध्ये एका सदस्याची एकच जागा असते.
              </p>
            </div>
          ) : joinChoices.length === 0 ? (
            <div style={{ fontSize: '0.88rem' }}>
              <p style={{ marginTop: 0 }}>
                आधी तुमचा व्यवसाय नोंदवा. चॅप्टरमध्ये सामील होण्यासाठी नोंदवलेला (लपवलेला नसलेला) आणि इतर चॅप्टरमध्ये नसलेला व्यवसाय आवश्यक आहे.
              </p>
              <Link to="/business" style={{ ...btn(true), textDecoration: 'none', display: 'inline-block' }}>व्यवसाय डिरेक्टरीमध्ये जा</Link>
            </div>
          ) : (
            <form onSubmit={submitJoin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 700 }}>
                कोणता व्यवसाय?
                <select
                  value={joining.businessId}
                  onChange={(e) => setJoining({ ...joining, businessId: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: '6px', padding: '9px', borderRadius: '8px', border: '1px solid #D6D3CD' }}
                >
                  {joinChoices.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({CATEGORY_LABELS[b.cat] || b.cat}, {b.city})</option>
                  ))}
                </select>
              </label>
              <label style={{ fontSize: '0.84rem', fontWeight: 700 }}>
                समन्वयकासाठी संदेश (ऐच्छिक)
                <textarea
                  value={joining.message}
                  maxLength={300}
                  rows={3}
                  onChange={(e) => setJoining({ ...joining, message: e.target.value })}
                  style={{ display: 'block', width: '100%', marginTop: '6px', padding: '9px', borderRadius: '8px', border: '1px solid #D6D3CD', fontFamily: 'inherit' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#6A7280' }}>{joining.message.length}/300</span>
              </label>
              {joining.error && (
                <div role="alert" style={{ padding: '10px 12px', borderRadius: '8px', background: '#FDECEA', color: '#8A1C1C', border: '1px solid #F5C2C0', fontSize: '0.84rem', fontWeight: 600 }}>
                  {joining.error}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" style={btn(false)} onClick={() => setJoining(null)}>रद्द करा</button>
                <button type="submit" style={btn(true)} disabled={busy === 'join'}>{busy === 'join' ? 'पाठवत आहे...' : 'विनंती पाठवा'}</button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
}
