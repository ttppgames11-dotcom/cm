import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import {
  SPEAKER_CATEGORIES, ALL_CATEGORIES, REQUEST_STATUSES, PROFILE_STATUSES, statusInfo, requestButton, speakerQuery
} from './speakersHelp';
import SpeakerApplyModal from './SpeakerApplyModal';
import SpeakerRequestModal from './SpeakerRequestModal';

const ORANGE = '#E65100';
const card = { background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8DFD8', boxShadow: '0 6px 16px rgba(0,0,0,0.04)' };
const primary = {
  background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)', color: '#FFFFFF', border: 'none', padding: '11px 18px',
  borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.92rem'
};
const secondary = { background: '#F3F4F6', color: '#374151', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' };
const errorBox = { background: '#FEF2F2', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', margin: '0 0 14px' };

const KIND_LABELS = { talk: '🎙️ व्याख्यान', guidance: '🧭 मार्गदर्शन' };
const MODE_LABELS = { phone: '📞 फोनवर', meeting: '🤝 प्रत्यक्ष भेट' };

export default function MotivationalSpeakersPage() {
  const { user } = useAuth();
  const loggedIn = !!user;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [mySpeaker, setMySpeaker] = useState(null);
  const tabs = [
    { id: 'all', label: '🎙️ सर्व वक्ते' },
    ...(loggedIn ? [{ id: 'mine', label: '📋 माझ्या विनंत्या' }] : []),
    ...(mySpeaker ? [{ id: 'incoming', label: '📥 मला आलेल्या विनंत्या' }] : []),
    ...(loggedIn ? [{ id: 'profile', label: '👤 माझे प्रोफाइल' }] : [])
  ];
  const wanted = params.get('tab');
  const tab = ['mine', 'incoming', 'profile'].includes(wanted) ? wanted : 'all';

  const [speakers, setSpeakers] = useState([]);
  const [selectedCat, setSelectedCat] = useState(ALL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [requesting, setRequesting] = useState(null);
  const [applying, setApplying] = useState(false);

  const loginFirst = (to = '/speakers') => navigate('/login?redirect=' + encodeURIComponent(to));
  const openTab = (id) => setParams(id === 'all' ? {} : { tab: id });

  // The search box is applied with the button or Enter, not on every key, so it is read from a ref (always the latest text).
  const searchRef = useRef(search);
  searchRef.current = search;

  const loadSpeakers = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      setSpeakers(await apiClient.getSpeakers(speakerQuery(selectedCat, '', searchRef.current)));
    } catch (err) {
      setListError(err.message || 'वक्ते लोड करता आले नाहीत.');
    } finally {
      setLoading(false);
    }
  }, [selectedCat, user?.id]);

  const loadMine = useCallback(async () => {
    if (!user?.id) {
      setMySpeaker(null);
      return;
    }
    try {
      setMySpeaker(await apiClient.getMySpeaker());
    } catch {
      setMySpeaker(null);
    }
  }, [user?.id]);

  useEffect(() => { loadMine(); }, [loadMine]);
  useEffect(() => { if (tab === 'all') loadSpeakers(); }, [tab, loadSpeakers]);

  const onApplyClick = () => {
    if (!loggedIn) return loginFirst('/speakers?tab=profile');
    if (mySpeaker) return openTab('profile');
    setApplying(true);
  };

  const onCardButton = (speaker) => {
    const kind = requestButton(speaker, loggedIn);
    if (kind === 'login') loginFirst('/speakers');
    if (kind === 'request') setRequesting(speaker);
  };

  return (
    <div className="speakers-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        backgroundImage: 'linear-gradient(rgba(18, 12, 8, 0.40), rgba(18, 12, 8, 0.58)), url("/assets/images/generated/maratha_speakers_hero.jpg")',
        backgroundPosition: 'center 30%', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', color: '#FFFFFF',
        padding: '54px 20px 48px', textAlign: 'center', position: 'relative', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        borderBottom: '4px solid #E65100'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block', background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)',
            border: '1px solid rgba(255,255,255,0.4)', padding: '6px 20px', borderRadius: '20px', fontSize: '0.88rem',
            fontWeight: 800, marginBottom: '14px', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(230,81,0,0.4)'
          }}>
            🚩 CONNECT मराठा — एक लढा भगव्यासाठी | सर्वधर्म समभाव
          </div>
          <p style={{ fontSize: '1.25rem', color: '#FFD54F', fontWeight: 800, margin: '0 0 8px', letterSpacing: '0.5px', textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.85)' }}>
            प्रेरणा जी घडवते यशस्वी भविष्य !
          </p>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', fontWeight: 900, margin: '0 0 14px', lineHeight: 1.25, color: '#FFFFFF', textShadow: '0 4px 18px rgba(0,0,0,0.98), 0 2px 6px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.9)' }}>
            मराठा वक्ते – प्रेरणा, मार्गदर्शन आणि नेतृत्व
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#FFF8E1', margin: '0 auto 24px', maxWidth: '720px', lineHeight: 1.6, fontWeight: 700, textShadow: '0 3px 12px rgba(0,0,0,0.98), 0 1px 4px rgba(0,0,0,0.95)' }}>
            व्याख्यान, सेमिनार, कार्यशाळा किंवा वैयक्तिक मार्गदर्शनासाठी मंजूर वक्त्यांना थेट विनंती पाठवा.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={onApplyClick} style={{
              background: 'linear-gradient(135deg, #FFD54F 0%, #FFCA28 100%)', color: '#3E2723', border: 'none', padding: '12px 28px',
              borderRadius: '8px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
            }}>
              ＋ वक्ता म्हणून अर्ज करा
            </button>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '1180px', margin: '24px auto 0', padding: '0 16px' }}>
        {/* Tabs */}
        <div role="tablist" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '18px' }}>
          {tabs.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => openTab(t.id)} style={{
              padding: '9px 18px', borderRadius: '20px', whiteSpace: 'nowrap', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
              border: tab === t.id ? `2px solid ${ORANGE}` : '1px solid #E0E0E0', background: tab === t.id ? ORANGE : '#FFFFFF',
              color: tab === t.id ? '#FFFFFF' : '#424242'
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'all' && (
          <>
            {/* Search & Filter */}
            <div style={{ ...card, borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
              <form onSubmit={(e) => { e.preventDefault(); loadSpeakers(); }} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input type="text" placeholder="वक्त्यांचे नाव, विषय किंवा शहर शोधा..." value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 0, padding: '12px 18px', borderRadius: '8px', border: '1.5px solid #D7CCC8', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} />
                <button type="submit" style={primary}>शोधा</button>
              </form>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {[ALL_CATEGORIES, ...SPEAKER_CATEGORIES].map((cat) => (
                  <button key={cat} onClick={() => setSelectedCat(cat)} style={{
                    padding: '7px 18px', borderRadius: '20px', fontSize: '0.88rem', cursor: 'pointer', whiteSpace: 'nowrap',
                    border: selectedCat === cat ? `2px solid ${ORANGE}` : '1px solid #E0E0E0', background: selectedCat === cat ? ORANGE : '#FFFFFF',
                    color: selectedCat === cat ? '#FFFFFF' : '#424242', fontWeight: selectedCat === cat ? 700 : 500
                  }}>{cat}</button>
                ))}
              </div>
            </div>

            {listError && <div role="alert" style={errorBox}>{listError}</div>}
            {loading ? (
              <p style={{ textAlign: 'center', color: '#6B7280' }}>लोड होत आहे...</p>
            ) : speakers.length === 0 ? (
              <EmptyState filtered={selectedCat !== ALL_CATEGORIES || !!search.trim()} onApply={onApplyClick} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '22px' }}>
                {speakers.map((s) => <SpeakerCard key={s.id} speaker={s} loggedIn={loggedIn} onButton={() => onCardButton(s)} />)}
              </div>
            )}
          </>
        )}

        {tab === 'mine' && (loggedIn ? <MyRequests /> : <LoginPrompt onLogin={() => loginFirst('/speakers?tab=mine')} />)}
        {tab === 'incoming' && (loggedIn ? <IncomingRequests hasProfile={!!mySpeaker} /> : <LoginPrompt onLogin={() => loginFirst('/speakers?tab=incoming')} />)}
        {tab === 'profile' && (loggedIn
          ? <MyProfile speaker={mySpeaker} user={user} onChanged={loadMine} />
          : <LoginPrompt onLogin={() => loginFirst('/speakers?tab=profile')} />)}
      </div>

      {requesting && (
        <SpeakerRequestModal speaker={requesting} onClose={() => setRequesting(null)} onSent={loadSpeakers} />
      )}
      {applying && (
        <SpeakerApplyModal initial={null} user={user} onClose={() => setApplying(false)} onSaved={loadMine} />
      )}
    </div>
  );
}

function EmptyState({ filtered, onApply }) {
  return (
    <div style={{ ...card, textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎙️</div>
      {filtered ? (
        <p style={{ margin: 0, color: '#4B5563' }}>या शोधासाठी वक्ते सापडले नाहीत.</p>
      ) : (
        <>
          <p style={{ margin: '0 0 16px', color: '#4B5563', fontWeight: 700 }}>अजून वक्ते नाहीत. पहिले व्हा! 🎙️</p>
          <button onClick={onApply} style={primary}>वक्ता म्हणून अर्ज करा</button>
        </>
      )}
    </div>
  );
}

function LoginPrompt({ onLogin }) {
  return (
    <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔐</div>
      <p style={{ margin: '0 0 16px', color: '#4B5563' }}>हे पाहण्यासाठी लॉगिन करा.</p>
      <button onClick={onLogin} style={primary}>लॉगिन करा</button>
    </div>
  );
}

const BUTTON_TEXT = { login: 'लॉगिन करा व विनंती पाठवा', own: 'हे तुमचे प्रोफाइल आहे', requested: '⏳ विनंती पाठवली', request: '📨 विनंती पाठवा' };

// One approved speaker: details (never a phone number) and the request button.
function SpeakerCard({ speaker, loggedIn, onButton }) {
  const kind = requestButton(speaker, loggedIn);
  const disabled = kind === 'own' || kind === 'requested';
  return (
    <div style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', padding: '22px 20px 16px', textAlign: 'center', borderBottom: '1px solid #FFCC80' }}>
        <div aria-hidden="true" style={{
          width: '84px', height: '84px', margin: '0 auto 12px', borderRadius: '50%', border: `3.5px solid ${ORANGE}`, background: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', fontWeight: 900, color: ORANGE
        }}>
          {(speaker.name || '?').trim().charAt(0) || '🎙️'}
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: ORANGE, margin: '0 0 6px' }}>{speaker.name}</h3>
        {speaker.title && (
          <span style={{ fontSize: '0.82rem', background: ORANGE, color: '#fff', padding: '3px 12px', borderRadius: '12px', fontWeight: 700, display: 'inline-block' }}>{speaker.title}</span>
        )}
      </div>
      <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem' }}>{speaker.category}</span>
          {speaker.offers_talks && <span style={{ background: '#E0F2FE', color: '#075985', padding: '2px 10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem' }}>🎙️ व्याख्यान</span>}
          {speaker.offers_guidance && <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem' }}>🧭 मार्गदर्शन</span>}
        </div>
        <div><strong style={{ color: ORANGE }}>🎯 मुख्य विषय:</strong> {speaker.topics}</div>
        <div><strong>📍 शहर:</strong> {speaker.city}</div>
        {speaker.intro && <div style={{ color: '#666', fontSize: '0.84rem' }}>{speaker.intro}</div>}
      </div>
      <div style={{ padding: '14px 20px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE' }}>
        <button onClick={onButton} disabled={disabled} style={{ ...primary, width: '100%', opacity: disabled ? 0.6 : 1, cursor: disabled ? 'default' : 'pointer' }}>
          {BUTTON_TEXT[kind]}
        </button>
      </div>
    </div>
  );
}

// The details of a request, by kind.
function RequestDetails({ request }) {
  return (
    <div style={{ fontSize: '0.88rem', color: '#374151', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontWeight: 700 }}>{KIND_LABELS[request.kind] || request.kind}</div>
      {request.kind === 'talk' ? (
        <>
          <div>📅 {request.event_date} · 📍 {request.place}</div>
          {request.event_type && <div>🎉 {request.event_type}</div>}
          {request.audience ? <div>👥 सुमारे {request.audience} श्रोते</div> : null}
        </>
      ) : (
        <>
          <div>📝 {request.topic}</div>
          {request.mode && <div>{MODE_LABELS[request.mode] || request.mode}</div>}
        </>
      )}
      {request.message && <div style={{ color: '#6B7280' }}>💬 {request.message}</div>}
    </div>
  );
}

function StatusBadge({ list, value }) {
  const s = statusInfo(list, value);
  return <span style={{ fontWeight: 800, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{s.icon} {s.label}</span>;
}

// Requests I sent: status, the speaker's phone once accepted, cancel while waiting.
function MyRequests() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setList(await apiClient.getMySpeakerRequests());
    } catch (err) {
      setError(err.message || 'विनंत्या लोड करता आल्या नाहीत.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const cancel = async (r) => {
    if (!window.confirm('ही विनंती रद्द करायची?')) return;
    setError('');
    try {
      await apiClient.answerSpeakerRequest(r.id, 'cancel');
      load();
    } catch (err) {
      setError(err.message || 'रद्द करता आले नाही.');
    }
  };

  if (loading) return <p style={{ textAlign: 'center', color: '#6B7280' }}>लोड होत आहे...</p>;
  return (
    <>
      {error && <div role="alert" style={errorBox}>{error}</div>}
      {list.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '40px', color: '#4B5563' }}>तुम्ही अजून कोणालाही विनंती पाठवलेली नाही.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map((r) => (
            <div key={r.id} style={{ ...card, padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <strong style={{ color: ORANGE }}>{r.speaker?.name}</strong>
                <StatusBadge list={REQUEST_STATUSES} value={r.status} />
              </div>
              <RequestDetails request={r} />
              {r.status === 'accepted' && r.speaker?.phone && (
                <div style={{ marginTop: '10px', background: '#F0FDF4', color: '#166534', padding: '8px 12px', borderRadius: '8px', fontWeight: 700 }}>
                  📞 संपर्क: <a href={`tel:${r.speaker.phone}`} style={{ color: '#166534' }}>{r.speaker.phone}</a>
                </div>
              )}
              {r.status === 'new' && (
                <button onClick={() => cancel(r)} style={{ ...secondary, marginTop: '10px' }}>विनंती रद्द करा</button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// Requests to my profile: the organiser's name and phone, accept / decline while waiting.
function IncomingRequests({ hasProfile }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setList(await apiClient.getIncomingSpeakerRequests());
    } catch (err) {
      setError(err.message || 'विनंत्या लोड करता आल्या नाहीत.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const reply = async (r, action) => {
    setError('');
    try {
      await apiClient.answerSpeakerRequest(r.id, action);
      load();
    } catch (err) {
      setError(err.message || 'उत्तर जतन करता आले नाही.');
      load();
    }
  };

  if (loading) return <p style={{ textAlign: 'center', color: '#6B7280' }}>लोड होत आहे...</p>;
  return (
    <>
      {error && <div role="alert" style={errorBox}>{error}</div>}
      {list.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '40px', color: '#4B5563' }}>
          {hasProfile ? 'अजून कोणतीही विनंती आलेली नाही.' : 'विनंत्या मिळवण्यासाठी आधी वक्ता म्हणून अर्ज करा.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map((r) => (
            <div key={r.id} style={{ ...card, padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <strong>👤 {r.organiser?.name}
                  {r.organiser?.phone && <> · <a href={`tel:${r.organiser.phone}`} style={{ color: ORANGE }}>{r.organiser.phone}</a></>}
                </strong>
                <StatusBadge list={REQUEST_STATUSES} value={r.status} />
              </div>
              <RequestDetails request={r} />
              {r.status === 'new' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  <button onClick={() => reply(r, 'accept')} style={{ ...primary, background: '#16A34A' }}>✅ स्वीकारा</button>
                  <button onClick={() => reply(r, 'decline')} style={secondary}>❌ नाकारा</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// My profile and its approval status, or the invitation to apply.
function MyProfile({ speaker, user, onChanged }) {
  const [editing, setEditing] = useState(false);

  if (!speaker) {
    return (
      <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎙️</div>
        <p style={{ margin: '0 0 6px', fontWeight: 700 }}>तुम्ही व्याख्यान देता किंवा मार्गदर्शन करता?</p>
        <p style={{ margin: '0 0 16px', color: '#4B5563', fontSize: '0.9rem' }}>अर्ज करा; मंजुरीनंतर तुमचे प्रोफाइल सर्वांना दिसेल आणि सदस्य थेट विनंती पाठवू शकतील.</p>
        <button onClick={() => setEditing(true)} style={primary}>वक्ता म्हणून अर्ज करा</button>
        {editing && <SpeakerApplyModal initial={null} user={user} onClose={() => setEditing(false)} onSaved={onChanged} />}
      </div>
    );
  }

  return (
    <div style={{ ...card, padding: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: ORANGE }}>{speaker.name}</h3>
        <StatusBadge list={PROFILE_STATUSES} value={speaker.status} />
      </div>
      {speaker.status === 'pending' && <p style={{ margin: '0 0 12px', color: '#92400E', fontSize: '0.9rem' }}>⏳ तुमचा अर्ज मंजुरीच्या प्रतीक्षेत आहे.</p>}
      {speaker.status === 'rejected' && (
        <p style={{ margin: '0 0 12px', color: '#B91C1C', fontSize: '0.9rem' }}>
          ❌ प्रोफाइल मंजूर झाले नाही{speaker.reject_reason ? `: ${speaker.reject_reason}` : '.'} माहिती बदलून पुन्हा पाठवा.
        </p>
      )}
      {speaker.hidden && <p style={{ margin: '0 0 12px', color: '#6B7280', fontSize: '0.9rem' }}>🙈 हे प्रोफाइल सध्या प्रशासकांनी लपवले आहे.</p>}
      <div style={{ fontSize: '0.9rem', color: '#374151', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {speaker.title && <div><strong>पद:</strong> {speaker.title}</div>}
        <div><strong>प्रकार:</strong> {speaker.category}</div>
        <div><strong>शहर:</strong> {speaker.city}</div>
        <div><strong>विषय:</strong> {speaker.topics}</div>
        <div><strong>मोबाईल:</strong> {speaker.phone}</div>
        <div><strong>उपलब्ध:</strong> {[speaker.offers_talks && '🎙️ व्याख्यान', speaker.offers_guidance && '🧭 मार्गदर्शन'].filter(Boolean).join(' · ')}</div>
        {speaker.intro && <div><strong>परिचय:</strong> {speaker.intro}</div>}
      </div>
      <button onClick={() => setEditing(true)} style={{ ...secondary, marginTop: '14px' }}>✏️ प्रोफाइल बदला</button>
      {editing && <SpeakerApplyModal initial={speaker} user={user} onClose={() => setEditing(false)} onSaved={onChanged} />}
    </div>
  );
}
