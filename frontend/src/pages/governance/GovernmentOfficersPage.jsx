import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import {
  SERVICES, SERVICE_STATUSES, EXAMS, STAGES, MODES, REQUEST_STATUSES, PROFILE_STATUSES, label, statusInfo, examList,
  requestButton, officerQuery
} from './officersHelp';
import OfficerApplyModal from './OfficerApplyModal';
import OfficerRequestModal from './OfficerRequestModal';

const ORANGE = '#E65100';
const card = { background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E8DFD8', boxShadow: '0 6px 16px rgba(0,0,0,0.04)' };
const primary = {
  background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)', color: '#FFFFFF', border: 'none', padding: '11px 18px',
  borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.92rem'
};
const secondary = { background: '#F3F4F6', color: '#374151', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' };
const errorBox = { background: '#FEF2F2', color: '#B91C1C', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', margin: '0 0 14px' };
const select = { padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #D7CCC8', fontSize: '0.95rem', background: '#fff' };

export default function GovernmentOfficersPage() {
  const { user } = useAuth();
  const loggedIn = !!user;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [myOfficer, setMyOfficer] = useState(null);
  const tabs = [
    { id: 'all', label: '⭐ सर्व अधिकारी' },
    ...(loggedIn ? [{ id: 'mine', label: '📋 माझ्या विनंत्या' }] : []),
    ...(myOfficer ? [{ id: 'incoming', label: '📥 मला आलेल्या विनंत्या' }] : []),
    ...(loggedIn ? [{ id: 'profile', label: '👤 माझे प्रोफाइल' }] : [])
  ];
  const wanted = params.get('tab');
  const tab = ['mine', 'incoming', 'profile'].includes(wanted) ? wanted : 'all';

  const [officers, setOfficers] = useState([]);
  const [exam, setExam] = useState('all');
  const [service, setService] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [requesting, setRequesting] = useState(null);
  const [applying, setApplying] = useState(false);

  const loginFirst = (to = '/officers') => navigate('/login?redirect=' + encodeURIComponent(to));
  const openTab = (id) => setParams(id === 'all' ? {} : { tab: id });

  // The search box is applied with the button or Enter, not on every key, so it is read from a ref (always the latest text).
  const searchRef = useRef(search);
  searchRef.current = search;

  const loadOfficers = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      setOfficers(await apiClient.getOfficers(officerQuery(exam, service, searchRef.current)));
    } catch (err) {
      setListError(err.message || 'अधिकारी लोड करता आले नाहीत.');
    } finally {
      setLoading(false);
    }
  }, [exam, service, user?.id]);

  const loadMine = useCallback(async () => {
    if (!user?.id) {
      setMyOfficer(null);
      return;
    }
    try {
      setMyOfficer(await apiClient.getMyOfficer());
    } catch {
      setMyOfficer(null);
    }
  }, [user?.id]);

  useEffect(() => { loadMine(); }, [loadMine]);
  useEffect(() => { if (tab === 'all') loadOfficers(); }, [tab, loadOfficers]);

  const onApplyClick = () => {
    if (!loggedIn) return loginFirst('/officers?tab=profile');
    if (myOfficer) return openTab('profile');
    setApplying(true);
  };

  const onCardButton = (officer) => {
    const kind = requestButton(officer, loggedIn);
    if (kind === 'login') loginFirst('/officers');
    if (kind === 'request') setRequesting(officer);
  };

  return (
    <div className="government-officers-page" style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'url("/assets/images/connect-maratha-council.jpg") center 30%/cover no-repeat', color: '#FFFFFF',
        padding: '52px 20px 48px', textAlign: 'center', position: 'relative'
      }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(230, 81, 0, 0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 213, 79, 0.6)',
            padding: '6px 18px', borderRadius: '20px', fontSize: '0.88rem', fontWeight: 700, marginBottom: '14px', color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            🚩 CONNECT मराठा — एक लढा भगव्यासाठी | सर्वधर्म समभाव
          </div>
          <p style={{ fontSize: '1.25rem', color: '#FFE082', fontWeight: 700, margin: '0 0 8px', textShadow: '0 2px 10px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.95)' }}>
            सनदी अधिकारी स्पर्धा परीक्षा केंद्र
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.7rem)', fontWeight: 900, color: '#FFFFFF', margin: '0 0 12px', textShadow: '0 4px 16px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.95)' }}>
            अधिकाऱ्यांकडून थेट मार्गदर्शन — MPSC / UPSC
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#FFFFFF', opacity: 0.98, margin: '0 auto 24px', maxWidth: '720px', lineHeight: 1.6, fontWeight: 500, textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.95)' }}>
            कार्यरत व निवृत्त अधिकारी स्पर्धा परीक्षेची तयारी करणाऱ्या विद्यार्थ्यांना मार्गदर्शन करतात. तुमचा प्रश्न विचारा!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button onClick={onApplyClick} style={{
              background: '#FFD54F', color: '#BF360C', border: 'none', padding: '12px 26px', borderRadius: '8px', fontWeight: 800,
              fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
            }}>
              ＋ अधिकारी आहात? मार्गदर्शक व्हा
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
            {/* Search & Filters */}
            <div style={{ ...card, borderRadius: '14px', padding: '20px', marginBottom: '24px' }}>
              <form onSubmit={(e) => { e.preventDefault(); loadOfficers(); }} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input type="text" placeholder="नाव, पद, विभाग किंवा शहर शोधा..." value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1, minWidth: 0, padding: '12px 18px', borderRadius: '8px', border: '1.5px solid #D7CCC8', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} />
                <button type="submit" style={primary}>शोधा</button>
              </form>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <select value={exam} onChange={(e) => setExam(e.target.value)} style={select} aria-label="परीक्षा">
                  <option value="all">सर्व परीक्षा</option>
                  {EXAMS.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
                </select>
                <select value={service} onChange={(e) => setService(e.target.value)} style={select} aria-label="सेवा">
                  <option value="all">सर्व सेवा</option>
                  {SERVICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            {listError && <div role="alert" style={errorBox}>{listError}</div>}
            {loading ? (
              <p style={{ textAlign: 'center', color: '#6B7280' }}>लोड होत आहे...</p>
            ) : officers.length === 0 ? (
              <EmptyState filtered={exam !== 'all' || service !== 'all' || !!search.trim()} onApply={onApplyClick} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '22px' }}>
                {officers.map((o) => <OfficerCard key={o.id} officer={o} loggedIn={loggedIn} onButton={() => onCardButton(o)} />)}
              </div>
            )}
          </>
        )}

        {tab === 'mine' && (loggedIn ? <MyRequests /> : <LoginPrompt onLogin={() => loginFirst('/officers?tab=mine')} />)}
        {tab === 'incoming' && (loggedIn ? <IncomingRequests hasProfile={!!myOfficer} /> : <LoginPrompt onLogin={() => loginFirst('/officers?tab=incoming')} />)}
        {tab === 'profile' && (loggedIn
          ? <MyProfile officer={myOfficer} user={user} onChanged={loadMine} />
          : <LoginPrompt onLogin={() => loginFirst('/officers?tab=profile')} />)}
      </div>

      {requesting && <OfficerRequestModal officer={requesting} onClose={() => setRequesting(null)} onSent={loadOfficers} />}
      {applying && <OfficerApplyModal initial={null} user={user} onClose={() => setApplying(false)} onSaved={loadMine} />}
    </div>
  );
}

function EmptyState({ filtered, onApply }) {
  return (
    <div style={{ ...card, textAlign: 'center', padding: '48px 20px' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⭐</div>
      {filtered ? (
        <p style={{ margin: 0, color: '#4B5563' }}>या शोधासाठी अधिकारी सापडले नाहीत.</p>
      ) : (
        <>
          <p style={{ margin: '0 0 16px', color: '#4B5563', fontWeight: 700 }}>अजून अधिकारी नाहीत. तुम्ही अधिकारी असाल तर मार्गदर्शक व्हा!</p>
          <button onClick={onApply} style={primary}>अर्ज करा</button>
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

const BUTTON_TEXT = {
  login: 'लॉगिन करा व मार्गदर्शन मागा', own: 'हे तुमचे प्रोफाइल आहे', paused: '⏸️ सध्या विनंत्या घेत नाहीत',
  requested: '⏳ विनंती पाठवली', request: '🧭 मार्गदर्शन मागा'
};

// One approved officer: details (never a phone number) and the request button.
function OfficerCard({ officer, loggedIn, onButton }) {
  const kind = requestButton(officer, loggedIn);
  const disabled = kind === 'own' || kind === 'paused' || kind === 'requested';
  return (
    <div style={{ ...card, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)', padding: '20px', borderBottom: '1px solid #FFCC80', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div aria-hidden="true" style={{
          width: '56px', height: '56px', borderRadius: '12px', background: 'linear-gradient(135deg, #FF6F00 0%, #E65100 100%)', color: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, flexShrink: 0
        }}>
          {(officer.name || '?').trim().charAt(0) || '⭐'}
        </div>
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1B1B1B', margin: '0 0 4px' }}>{officer.name}</h3>
          <div style={{ fontSize: '0.85rem', color: ORANGE, fontWeight: 700 }}>
            {label(SERVICES, officer.service)}{officer.batch_year ? ` · ${officer.batch_year}` : ''} · {label(SERVICE_STATUSES, officer.service_status)}
          </div>
        </div>
      </div>
      <div style={{ padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
        <div><strong style={{ color: ORANGE }}>🎖️ पद:</strong> {officer.post}{officer.department ? ` · ${officer.department}` : ''}</div>
        <div><strong>📍 शहर:</strong> {officer.city}</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {(officer.exams || []).map((c) => (
            <span key={c} style={{ background: '#E0F2FE', color: '#075985', padding: '2px 10px', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem' }}>{label(EXAMS, c)}</span>
          ))}
        </div>
        {officer.intro && <div style={{ color: '#666', fontSize: '0.84rem' }}>{officer.intro}</div>}
      </div>
      <div style={{ padding: '14px 20px', background: '#FAFAFA', borderTop: '1px solid #EEEEEE' }}>
        <button onClick={onButton} disabled={disabled} style={{ ...primary, width: '100%', opacity: disabled ? 0.6 : 1, cursor: disabled ? 'default' : 'pointer' }}>
          {BUTTON_TEXT[kind]}
        </button>
      </div>
    </div>
  );
}

// The details of a guidance request.
function RequestDetails({ request }) {
  return (
    <div style={{ fontSize: '0.88rem', color: '#374151', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ fontWeight: 700 }}>📚 {label(EXAMS, request.exam)} · {label(STAGES, request.stage)} · {label(MODES, request.mode)}</div>
      <div>❓ {request.question}</div>
      {request.message && <div style={{ color: '#6B7280' }}>💬 {request.message}</div>}
    </div>
  );
}

function StatusBadge({ list, value }) {
  const s = statusInfo(list, value);
  return <span style={{ fontWeight: 800, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{s.icon} {s.label}</span>;
}

// Requests I sent: status, the officer's phone once accepted, cancel while waiting.
function MyRequests() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setList(await apiClient.getMyOfficerRequests());
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
      await apiClient.answerOfficerRequest(r.id, 'cancel');
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
        <div style={{ ...card, textAlign: 'center', padding: '40px', color: '#4B5563' }}>तुम्ही अजून कोणाकडेही मार्गदर्शन मागितलेले नाही.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map((r) => (
            <div key={r.id} style={{ ...card, padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <strong style={{ color: ORANGE }}>{r.officer?.name}</strong>
                <StatusBadge list={REQUEST_STATUSES} value={r.status} />
              </div>
              <RequestDetails request={r} />
              {r.status === 'accepted' && r.officer?.phone && (
                <div style={{ marginTop: '10px', background: '#F0FDF4', color: '#166534', padding: '8px 12px', borderRadius: '8px', fontWeight: 700 }}>
                  📞 संपर्क: <a href={`tel:${r.officer.phone}`} style={{ color: '#166534' }}>{r.officer.phone}</a>
                </div>
              )}
              {r.status === 'new' && <button onClick={() => cancel(r)} style={{ ...secondary, marginTop: '10px' }}>विनंती रद्द करा</button>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// Requests to my profile: the student's name and phone, accept / decline while waiting.
function IncomingRequests({ hasProfile }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setList(await apiClient.getIncomingOfficerRequests());
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
      await apiClient.answerOfficerRequest(r.id, action);
    } catch (err) {
      setError(err.message || 'उत्तर जतन करता आले नाही.');
    }
    load();
  };

  if (loading) return <p style={{ textAlign: 'center', color: '#6B7280' }}>लोड होत आहे...</p>;
  return (
    <>
      {error && <div role="alert" style={errorBox}>{error}</div>}
      {list.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '40px', color: '#4B5563' }}>
          {hasProfile ? 'अजून कोणतीही विनंती आलेली नाही.' : 'विनंत्या मिळवण्यासाठी आधी मार्गदर्शक म्हणून अर्ज करा.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map((r) => (
            <div key={r.id} style={{ ...card, padding: '16px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <strong>👤 {r.student?.name}
                  {r.student?.phone && <> · <a href={`tel:${r.student.phone}`} style={{ color: ORANGE }}>{r.student.phone}</a></>}
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

// My profile, its approval status and the accepting switch, or the invitation to apply.
function MyProfile({ officer, user, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState('');

  if (!officer) {
    return (
      <div style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⭐</div>
        <p style={{ margin: '0 0 6px', fontWeight: 700 }}>तुम्ही कार्यरत किंवा निवृत्त अधिकारी आहात?</p>
        <p style={{ margin: '0 0 16px', color: '#4B5563', fontSize: '0.9rem' }}>अर्ज करा; तपासणी व मंजुरीनंतर विद्यार्थी तुमच्याकडे MPSC / UPSC मार्गदर्शन मागू शकतील.</p>
        <button onClick={() => setEditing(true)} style={primary}>मार्गदर्शक म्हणून अर्ज करा</button>
        {editing && <OfficerApplyModal initial={null} user={user} onClose={() => setEditing(false)} onSaved={onChanged} />}
      </div>
    );
  }

  const toggle = async () => {
    setSwitching(true);
    setError('');
    try {
      await apiClient.setOfficerAccepting(!officer.accepting);
      await onChanged();
    } catch (err) {
      setError(err.message || 'बदल जतन करता आला नाही.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div style={{ ...card, padding: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <h3 style={{ margin: 0, color: ORANGE }}>{officer.name}</h3>
        <StatusBadge list={PROFILE_STATUSES} value={officer.status} />
      </div>
      {officer.status === 'pending' && <p style={{ margin: '0 0 12px', color: '#92400E', fontSize: '0.9rem' }}>⏳ तुमचा अर्ज तपासणी व मंजुरीच्या प्रतीक्षेत आहे.</p>}
      {officer.status === 'rejected' && (
        <p style={{ margin: '0 0 12px', color: '#B91C1C', fontSize: '0.9rem' }}>
          ❌ प्रोफाइल मंजूर झाले नाही{officer.reject_reason ? `: ${officer.reject_reason}` : '.'} माहिती बदलून पुन्हा पाठवा.
        </p>
      )}
      {officer.hidden && <p style={{ margin: '0 0 12px', color: '#6B7280', fontSize: '0.9rem' }}>🙈 हे प्रोफाइल सध्या प्रशासकांनी लपवले आहे.</p>}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', background: officer.accepting ? '#F0FDF4' : '#FEF3C7', padding: '10px 14px', borderRadius: '10px', marginBottom: '14px' }}>
        <strong>{officer.accepting ? '⏯️ नवीन विनंत्या घेत आहे' : '⏸️ नवीन विनंत्या बंद'}</strong>
        <button onClick={toggle} disabled={switching} style={{ ...secondary, opacity: switching ? 0.7 : 1 }}>
          {officer.accepting ? 'विनंत्या थांबवा' : 'विनंत्या पुन्हा सुरू करा'}
        </button>
        <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>आधी आलेल्या विनंत्यांना उत्तर देता येते.</span>
      </div>
      {error && <div role="alert" style={errorBox}>{error}</div>}

      <div style={{ fontSize: '0.9rem', color: '#374151', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div><strong>सेवा:</strong> {label(SERVICES, officer.service)}{officer.batch_year ? ` (${officer.batch_year})` : ''} · {label(SERVICE_STATUSES, officer.service_status)}</div>
        <div><strong>पद:</strong> {officer.post}{officer.department ? ` · ${officer.department}` : ''}</div>
        <div><strong>शहर:</strong> {officer.city}</div>
        <div><strong>मार्गदर्शन:</strong> {examList(officer.exams)}</div>
        <div><strong>मोबाईल:</strong> {officer.phone}</div>
        {officer.intro && <div><strong>परिचय:</strong> {officer.intro}</div>}
      </div>
      <button onClick={() => setEditing(true)} style={{ ...secondary, marginTop: '14px' }}>✏️ प्रोफाइल बदला</button>
      {editing && <OfficerApplyModal initial={officer} user={user} onClose={() => setEditing(false)} onSaved={onChanged} />}
    </div>
  );
}
