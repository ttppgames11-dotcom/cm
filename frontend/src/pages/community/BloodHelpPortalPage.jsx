import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { MAHARASHTRA_DISTRICTS } from '../../services/referralService';
import {
  BLOOD_GROUPS, STATE_LABELS, toMarathiDigits, timeAgo, closesInText, donorBadge, requestActions,
  filterDonors, filterRequests, requestPayload
} from './bloodHelp';

const BLOOD_BANKS = [
  { city: 'पुणे', name: 'ससून शासकीय रक्तपेढी', contact: '020-26128000', timing: '२४ तास सेवा' },
  { city: 'मुंबई', name: 'केईएम हॉस्पिटल ब्लड बँक', contact: '022-24107000', timing: '२४ तास सेवा' },
  { city: 'कोल्हापूर', name: 'सीपीआर शासकीय रक्तपेढी', contact: '0231-2641581', timing: '२४ तास सेवा' },
  { city: 'छत्रपती संभाजीनगर', name: 'घाटी हॉस्पिटल ब्लड बँक', contact: '0240-2402412', timing: '२४ तास सेवा' },
  { city: 'नाशिक', name: 'जिल्हा शासकीय रुग्णालय रक्तपेढी', contact: '0253-2576106', timing: '२४ तास सेवा' },
  { city: 'नागपूर', name: 'मेडिकल कॉलेज ब्लड बँक', contact: '0712-2744671', timing: '२४ तास सेवा' }
];

const URGENCY_OPTIONS = ['तात्काळ (२ तासांत)', 'आज संध्याकाळपर्यंत', 'उद्या सकाळपर्यंत', 'नियोजित शस्त्रक्रिया'];
const ACTION_LABELS = { received: 'रक्त मिळाले ✅', extend: 'अजून गरज आहे (+७ दिवस)', close: 'बंद करा' };

const emptyRequest = () => ({
  patientName: '', bloodGroup: 'O+', units: 1, hospital: '', city: '', district: 'पुणे',
  contactPhone: '', urgency: URGENCY_OPTIONS[0], note: ''
});

// Today as YYYY-MM-DD in the visitor's own time zone (the latest allowed donation date).
const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' };
const inputStyle = { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };
const pillStyle = (active) => ({
  background: active ? '#dc2626' : '#f1f5f9', color: active ? '#fff' : '#475569', border: 'none',
  padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer'
});
const errorStyle = { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.6rem 0.8rem', fontSize: '0.85rem' };
const modalBackdrop = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 9999 };
const modalBox = { background: '#fff', borderRadius: '20px', maxWidth: '520px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' };
const twoCols = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' };

export default function BloodHelpPortalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loggedIn = !!user;

  const [requests, setRequests] = useState([]);
  const [donors, setDonors] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myDonor, setMyDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [myError, setMyError] = useState('');

  const [reqGroup, setReqGroup] = useState('all');
  const [reqSearch, setReqSearch] = useState('');
  const [donorGroup, setDonorGroup] = useState('all');
  const [donorSearch, setDonorSearch] = useState('');

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestForm, setRequestForm] = useState(emptyRequest);
  const [requestError, setRequestError] = useState('');
  const [requestDone, setRequestDone] = useState('');

  const [isDonorModalOpen, setIsDonorModalOpen] = useState(false);
  const [donorForm, setDonorForm] = useState({});
  const [donorError, setDonorError] = useState('');
  const [busy, setBusy] = useState('');

  const loginFirst = () => navigate('/login?redirect=' + encodeURIComponent(location.pathname));

  const loadAll = useCallback(async () => {
    setListError('');
    try {
      const [reqs, dons] = await Promise.all([apiClient.getBloodRequests(), apiClient.getDonors()]);
      setRequests(reqs);
      setDonors(dons);
    } catch (err) {
      setListError('माहिती लोड करता आली नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.');
    }
    if (loggedIn) {
      try {
        const [mine, me] = await Promise.all([apiClient.getMyBloodRequests(), apiClient.getMyDonor()]);
        setMyRequests(mine);
        setMyDonor(me);
      } catch (err) {
        setMyError(err.message);
      }
    } else {
      setMyRequests([]);
      setMyDonor(null);
    }
    setLoading(false);
  }, [loggedIn]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const openRequestForm = () => {
    if (!loggedIn) return loginFirst();
    setRequestForm({ ...emptyRequest(), contactPhone: user?.phone || '' });
    setRequestError('');
    setRequestDone('');
    setIsRequestModalOpen(true);
  };

  const openDonorForm = () => {
    if (!loggedIn) return loginFirst();
    setDonorForm(myDonor ? {
      name: myDonor.name, bloodGroup: myDonor.blood_group, city: myDonor.city, district: myDonor.district || 'पुणे',
      phone: myDonor.phone || '', available: myDonor.available_setting !== false, lastDonated: myDonor.last_donated || ''
    } : {
      name: user?.name || '', bloodGroup: 'O+', city: '', district: user?.district || 'पुणे',
      phone: user?.phone || '', available: true, lastDonated: ''
    });
    setDonorError('');
    setIsDonorModalOpen(true);
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setBusy('request');
    setRequestError('');
    try {
      const res = await apiClient.addBloodRequest(requestPayload(requestForm));
      setRequestDone(`✅ मागणी प्रसिद्ध झाली. ${toMarathiDigits(res.notified || 0)} रक्तदात्यांना कळवले.`);
      loadAll();
    } catch (err) {
      setRequestError(err.message);
    } finally {
      setBusy('');
    }
  };

  const doAction = async (request, action) => {
    if (action === 'close' && !window.confirm('ही मागणी बंद करायची का?')) return;
    setBusy(request.id + action);
    setMyError('');
    try {
      await apiClient.bloodRequestAction(request.id, action);
      await loadAll();
    } catch (err) {
      setMyError(err.message);
    } finally {
      setBusy('');
    }
  };

  const saveDonor = async (e) => {
    e.preventDefault();
    setBusy('donor');
    setDonorError('');
    try {
      await apiClient.saveMyDonor({
        name: donorForm.name, bloodGroup: donorForm.bloodGroup, city: donorForm.city, district: donorForm.district,
        phone: donorForm.phone, available: donorForm.available, lastDonated: donorForm.lastDonated || null
      });
      setIsDonorModalOpen(false);
      await loadAll();
    } catch (err) {
      setDonorError(err.message);
    } finally {
      setBusy('');
    }
  };

  const removeDonor = async () => {
    if (!window.confirm('आपले रक्तदाता प्रोफाइल काढायचे का?')) return;
    setBusy('delete');
    setMyError('');
    try {
      await apiClient.deleteMyDonor();
      await loadAll();
    } catch (err) {
      setMyError(err.message);
    } finally {
      setBusy('');
    }
  };

  const shownRequests = filterRequests(requests, { group: reqGroup, search: reqSearch });
  const shownDonors = filterDonors(donors, { group: donorGroup, search: donorSearch });

  const phoneButton = (phone, label, dark) => (loggedIn ? (
    <a href={`tel:${phone}`} style={{
      background: dark ? '#dc2626' : '#f8fafc', color: dark ? '#fff' : '#0f172a', border: dark ? 'none' : '1px solid #cbd5e1',
      textDecoration: 'none', padding: '0.6rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', display: 'block'
    }}>
      📞 {label} ({phone})
    </a>
  ) : (
    <button onClick={loginFirst} style={{
      background: '#f8fafc', color: '#0f172a', border: '1px dashed #94a3b8', padding: '0.6rem', borderRadius: '8px',
      fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', width: '100%'
    }}>
      🔒 लॉगिन करा व नंबर पहा
    </button>
  ));

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Hero Header */}
      <div style={{
        position: 'relative',
        color: '#fff',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Background Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/assets/images/generated/maratha_blood_help_hero.jpg")',
          backgroundPosition: 'center 35%',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          zIndex: 1
        }} />

        {/* Normal balanced overlay - keeps hospital scene visible while making all text 100% crisp and readable */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.72) 0%, rgba(136, 19, 55, 0.65) 45%, rgba(15, 23, 42, 0.82) 100%)',
          zIndex: 2
        }} />

        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 3 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255, 255, 255, 0.22)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.45)',
            padding: '0.45rem 1.4rem',
            borderRadius: '999px',
            fontSize: '0.9rem',
            fontWeight: 800,
            marginBottom: '1.25rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            color: '#fff'
          }}>
            🩸 २४×७ मराठा रक्त मदत कक्ष | Emergency Blood Assistance
          </div>

          <h1 style={{
            fontSize: 'clamp(2.1rem, 5.5vw, 3.4rem)',
            fontWeight: 900,
            margin: '0.3rem 0 1.1rem',
            fontFamily: 'Baloo 2, sans-serif',
            color: '#ffffff',
            lineHeight: 1.25,
            textShadow: '0 3px 12px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9)'
          }}>
            एक थेंब रक्ताचा — एक जीव आपुलकीचा
          </h1>

          <p style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#f8fafc',
            maxWidth: '820px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.65,
            textShadow: '0 2px 8px rgba(0,0,0,0.9)'
          }}>
            महाराष्ट्रातील कोणत्याही जिल्ह्यात रक्ताची तातडीची गरज असल्यास मराठा बंधू-भगिनी धावून येतील. थेट रक्तदात्यांशी संपर्क करा किंवा आपली निकड नोंदवा.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={openRequestForm}
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
              onClick={openDonorForm}
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
        {listError && <div style={{ ...errorStyle, marginBottom: '1.5rem' }}>{listError}</div>}

        {/* My requests and my donor profile (logged in) */}
        {loggedIn && (
          <div style={{ background: '#fff', borderRadius: '20px', padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
            {myError && <div style={{ ...errorStyle, marginBottom: '1rem' }}>{myError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#991b1b', margin: '0 0 0.75rem' }}>माझ्या मागण्या</h3>
                {myRequests.length === 0 && <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>आपण अद्याप कोणतीही रक्त मागणी केलेली नाही.</p>}
                {myRequests.map((r) => (
                  <div key={r.id} style={{ border: '1px solid #fecaca', borderRadius: '12px', padding: '0.9rem', marginBottom: '0.75rem', background: '#fff5f5' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong>{r.blood_group} · {r.patient_name}</strong>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: r.state === 'open' ? '#16a34a' : '#64748b' }}>
                        {STATE_LABELS[r.state] || r.state}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.3rem 0 0.6rem' }}>
                      🏥 {r.hospital}, {r.city} · {timeAgo(r.created_at)}
                      {r.state === 'open' && <> · {closesInText(r.closes_at)}</>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {requestActions(r).map((a) => (
                        <button key={a} disabled={!!busy} onClick={() => doAction(r, a)} style={{
                          background: a === 'received' ? '#16a34a' : a === 'extend' ? '#0f172a' : '#fff',
                          color: a === 'close' ? '#b91c1c' : '#fff', border: a === 'close' ? '1px solid #fecaca' : 'none',
                          padding: '0.4rem 0.7rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700,
                          cursor: busy ? 'wait' : 'pointer', opacity: busy === r.id + a ? 0.6 : 1
                        }}>
                          {ACTION_LABELS[a]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#166534', margin: '0 0 0.75rem' }}>माझे रक्तदाता प्रोफाइल</h3>
                {myDonor ? (
                  <div style={{ border: '1px solid #bbf7d0', borderRadius: '12px', padding: '0.9rem', background: '#f0fdf4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <strong>{myDonor.blood_group} · {myDonor.name}</strong>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: donorBadge(myDonor).tone === 'green' ? '#16a34a' : '#b45309' }}>
                        {donorBadge(myDonor).text}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.3rem 0 0.6rem' }}>
                      📍 {myDonor.city}, {myDonor.district} · 📞 {myDonor.phone}
                      {myDonor.last_donated && <> · शेवटचे रक्तदान: {myDonor.last_donated.split('-').reverse().join('-')}</>}
                      {myDonor.hidden && <> · <strong style={{ color: '#b91c1c' }}>प्रशासकांनी लपवले आहे</strong></>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button onClick={openDonorForm} disabled={!!busy} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                        ✏️ बदला
                      </button>
                      <button onClick={removeDonor} disabled={!!busy} style={{ background: '#fff', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                        प्रोफाइल काढा
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 0.75rem' }}>आपण अद्याप रक्तदाता म्हणून नोंदणी केलेली नाही.</p>
                    <button onClick={openDonorForm} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                      ❤️ रक्तदाता म्हणून नोंदणी करा
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active requests */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '2px solid #fecaca', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#dc2626', display: 'inline-block', boxShadow: '0 0 0 4px #fee2e2' }}></span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>तातडीच्या रक्त मागण्या (Active Requests)</h2>
            </div>
            <button onClick={openRequestForm} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              + नवीन मागणी जोडा
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginBottom: '1.25rem' }}>
            {['all', ...BLOOD_GROUPS].map((bg) => (
              <button key={bg} onClick={() => setReqGroup(bg)} style={pillStyle(reqGroup === bg)}>{bg === 'all' ? 'सर्व रक्तगट' : bg}</button>
            ))}
            <input type="text" placeholder="रुग्णालय / शहर / जिल्हा शोधा..." value={reqSearch} onChange={(e) => setReqSearch(e.target.value)}
              style={{ padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', minWidth: '200px', flex: '1 1 200px' }} />
          </div>

          {loading && <p style={{ color: '#64748b' }}>लोड होत आहे...</p>}
          {!loading && shownRequests.length === 0 && (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem 0', margin: 0 }}>सध्या कोणतीही सुरू मागणी नाही</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1rem' }}>
            {shownRequests.map((req) => (
              <div key={req.id} style={{ background: '#fff5f5', borderRadius: '14px', padding: '1.25rem', border: '1px solid #fecaca', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                    <span style={{ background: '#dc2626', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 800 }}>{req.blood_group}</span>
                    {req.urgency && <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>⚡ {req.urgency}</span>}
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' }}>{req.patient_name}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>🏥 {req.hospital}, {req.city} ({req.district})</div>
                  {req.note && <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.5rem' }}>📝 {req.note}</div>}
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.75rem' }}>
                    युनिट्स: <strong>{toMarathiDigits(req.units)}</strong> · {timeAgo(req.created_at)} · {closesInText(req.closes_at)}
                  </div>
                </div>
                {req.mine
                  ? <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>ही आपली मागणी आहे</div>
                  : phoneButton(req.contact_phone, 'मदत करा', true)}
              </div>
            ))}
          </div>
        </div>

        {/* Donors */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>रक्तदाते (Blood Donors)</h2>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>नोंदणी केलेले मराठा रक्तदाते. शेवटच्या रक्तदानानंतर ९० दिवसांनी पुन्हा उपलब्ध.</p>
            </div>
            <button onClick={openDonorForm} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              {myDonor ? '✏️ माझे प्रोफाइल बदला' : '+ मी रक्तदान करू इच्छितो'}
            </button>
          </div>

          <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['all', ...BLOOD_GROUPS].map((bg) => (
                <button key={bg} onClick={() => setDonorGroup(bg)} style={pillStyle(donorGroup === bg)}>{bg === 'all' ? 'सर्व रक्तगट' : bg}</button>
              ))}
            </div>
            <input type="text" placeholder="नाव / शहर / जिल्हा टाका..." value={donorSearch} onChange={(e) => setDonorSearch(e.target.value)}
              style={{ padding: '0.5rem 0.9rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', minWidth: '200px', flex: '1 1 200px' }} />
          </div>

          {!loading && shownDonors.length === 0 && (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '1.5rem 0', margin: 0 }}>अद्याप रक्तदाते नोंदवलेले नाहीत</p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {shownDonors.map((d) => {
              const badge = donorBadge(d);
              return (
                <div key={d.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem' }}>
                        {d.blood_group}
                      </div>
                      <span style={{
                        background: badge.tone === 'green' ? '#f0fdf4' : '#fffbeb', color: badge.tone === 'green' ? '#16a34a' : '#b45309',
                        fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px'
                      }}>
                        {badge.tone === 'green' ? '🟢' : '⏳'} {badge.text}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: '0 0 0.25rem' }}>{d.name}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>📍 {d.city}{d.district ? `, ${d.district}` : ''}</div>
                  </div>
                  {d.mine
                    ? <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>हे आपले प्रोफाइल आहे</div>
                    : phoneButton(d.phone, 'संपर्क साधा', false)}
                </div>
              );
            })}
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

      {/* Request form */}
      {isRequestModalOpen && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#dc2626' }}>तातडीची रक्त मागणी नोंदवा</h3>
              <button onClick={() => setIsRequestModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {requestDone ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <h4 style={{ color: '#16a34a', margin: '0 0 0.5rem' }}>{requestDone}</h4>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>रक्त मिळाल्यावर "माझ्या मागण्या" मध्ये "रक्त मिळाले ✅" दाबा. मागणी ७ दिवसांनी आपोआप बंद होईल.</p>
                <button onClick={() => setIsRequestModalOpen(false)} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>ठीक आहे</button>
              </div>
            ) : (
              <form onSubmit={submitRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>रुग्णाचे नाव *</label>
                  <input type="text" required minLength={2} maxLength={100} value={requestForm.patientName}
                    onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })} style={inputStyle} placeholder="उदा. रमेश तानाजी कदम" />
                </div>
                <div style={twoCols}>
                  <div>
                    <label style={labelStyle}>रक्तगट *</label>
                    <select value={requestForm.bloodGroup} onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })} style={inputStyle}>
                      {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>आवश्यक युनिट्स *</label>
                    <input type="number" min="1" max="20" required value={requestForm.units}
                      onChange={(e) => setRequestForm({ ...requestForm, units: e.target.value })} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>रुग्णालयाचे नाव *</label>
                  <input type="text" required minLength={2} maxLength={150} value={requestForm.hospital}
                    onChange={(e) => setRequestForm({ ...requestForm, hospital: e.target.value })} style={inputStyle} placeholder="उदा. जहांगीर हॉस्पिटल" />
                </div>
                <div style={twoCols}>
                  <div>
                    <label style={labelStyle}>शहर *</label>
                    <input type="text" required minLength={2} maxLength={100} value={requestForm.city}
                      onChange={(e) => setRequestForm({ ...requestForm, city: e.target.value })} style={inputStyle} placeholder="उदा. पुणे" />
                  </div>
                  <div>
                    <label style={labelStyle}>जिल्हा *</label>
                    <select value={requestForm.district} onChange={(e) => setRequestForm({ ...requestForm, district: e.target.value })} style={inputStyle}>
                      {MAHARASHTRA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div style={twoCols}>
                  <div>
                    <label style={labelStyle}>संपर्क क्रमांक *</label>
                    <input type="tel" required value={requestForm.contactPhone}
                      onChange={(e) => setRequestForm({ ...requestForm, contactPhone: e.target.value })} style={inputStyle} placeholder="उदा. 9822XXXXXX" />
                  </div>
                  <div>
                    <label style={labelStyle}>तातडीची पातळी</label>
                    <select value={requestForm.urgency} onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })} style={inputStyle}>
                      {URGENCY_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>टीप (ऐच्छिक)</label>
                  <textarea maxLength={300} rows={2} value={requestForm.note}
                    onChange={(e) => setRequestForm({ ...requestForm, note: e.target.value })} style={inputStyle} placeholder="उदा. वॉर्ड क्र. ५, डॉ. पाटील" />
                </div>
                {requestError && <div style={errorStyle}>{requestError}</div>}
                <button type="submit" disabled={busy === 'request'} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', opacity: busy === 'request' ? 0.6 : 1 }}>
                  {busy === 'request' ? 'पाठवत आहे...' : 'मागणी प्रसिद्ध करा'}
                </button>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  याच रक्तगटाच्या व याच जिल्ह्यातील उपलब्ध रक्तदात्यांना सूचना पाठवली जाईल. संपर्क क्रमांक फक्त लॉगिन केलेल्या सदस्यांना दिसेल.
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Donor profile form */}
      {isDonorModalOpen && (
        <div style={modalBackdrop}>
          <div style={modalBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#16a34a' }}>
                {myDonor ? 'माझे रक्तदाता प्रोफाइल बदला' : 'रक्तदाता नोंदणी (Register as Donor)'}
              </h3>
              <button onClick={() => setIsDonorModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={saveDonor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>पूर्ण नाव *</label>
                <input type="text" required minLength={2} maxLength={100} value={donorForm.name || ''}
                  onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })} style={inputStyle} />
              </div>
              <div style={twoCols}>
                <div>
                  <label style={labelStyle}>रक्तगट *</label>
                  <select value={donorForm.bloodGroup} onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })} style={inputStyle}>
                    {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>मोबाईल नंबर *</label>
                  <input type="tel" required value={donorForm.phone || ''}
                    onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div style={twoCols}>
                <div>
                  <label style={labelStyle}>शहर *</label>
                  <input type="text" required minLength={2} maxLength={100} value={donorForm.city || ''}
                    onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>जिल्हा *</label>
                  <select value={donorForm.district} onChange={(e) => setDonorForm({ ...donorForm, district: e.target.value })} style={inputStyle}>
                    {(MAHARASHTRA_DISTRICTS.includes(donorForm.district) ? MAHARASHTRA_DISTRICTS : [donorForm.district, ...MAHARASHTRA_DISTRICTS])
                      .filter(Boolean).map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>शेवटचे रक्तदान (ऐच्छिक)</label>
                <input type="date" max={todayLocal()} value={donorForm.lastDonated || ''}
                  onChange={(e) => setDonorForm({ ...donorForm, lastDonated: e.target.value })} style={inputStyle} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
                <input type="checkbox" checked={donorForm.available !== false}
                  onChange={(e) => setDonorForm({ ...donorForm, available: e.target.checked })} />
                सध्या रक्तदानासाठी उपलब्ध आहे (आजारी / बाहेरगावी असल्यास बंद करा)
              </label>
              {donorError && <div style={errorStyle}>{donorError}</div>}
              <button type="submit" disabled={busy === 'donor'} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.9rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', opacity: busy === 'donor' ? 0.6 : 1 }}>
                {busy === 'donor' ? 'जतन करत आहे...' : myDonor ? 'बदल जतन करा' : 'रक्तदाता नोंदणी पूर्ण करा'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
