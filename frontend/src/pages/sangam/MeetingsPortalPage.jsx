import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { useMeetingStream } from '../../hooks/useMeetingStream';
import { STATUS_LABELS, groupMeetings, actionsFor, validateBooking, eventConcernsMe, istNow } from './meetingList';

// 1-to-1 business meetings between members. Everything shown comes from the server: the people you can meet are
// members who own a business, a meeting is private to the two of them, and both pages update live.

const card = { background: '#FFFFFF', borderRadius: 16, border: '1.5px solid #fed7aa', padding: 20, boxShadow: '0 4px 14px rgba(0,0,0,0.04)' };
const input = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #fdba74', background: '#fff7ed', fontSize: '0.95rem', boxSizing: 'border-box' };
const label = { display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#7c2d12', marginBottom: 4 };
const primary = { background: '#ea580c', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 800, cursor: 'pointer' };
const ghost = { background: '#fff', color: '#c2410c', border: '1.5px solid #fdba74', borderRadius: 10, padding: '7px 12px', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' };

const ACTION_LABELS = {
  accept: '✓ स्वीकारा (Accept)',
  decline: '✕ नाकारा (Decline)',
  cancel: 'रद्द करा (Cancel)',
  complete: '✔ पूर्ण झाली (Done)',
  reschedule: '🕒 नवीन वेळ (New time)',
  note: '📝 नोंद (Note)'
};
const STATUS_COLORS = {
  Requested: ['#fef3c7', '#92400e'], Confirmed: ['#dcfce7', '#166534'], Declined: ['#fee2e2', '#991b1b'],
  Cancelled: ['#f1f5f9', '#475569'], Completed: ['#dbeafe', '#1e40af']
};

function tomorrow() {
  const today = istNow().slice(0, 10);
  return new Date(Date.parse(`${today}T00:00:00Z`) + 86400000).toISOString().slice(0, 10);
}

function newForm(recipientId) {
  return { recipientId: recipientId || '', date: tomorrow(), time: '10:30', mode: 'Offline', place: '', topic: '' };
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 10000, padding: 20 }}>
      <div style={{ ...card, maxWidth: 480, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: '#431407', fontFamily: 'Baloo 2' }}>{title}</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#ea580c' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MeetingCard({ meeting, actions, onAction }) {
  const [bg, fg] = STATUS_COLORS[meeting.status] || STATUS_COLORS.Cancelled;
  const isLink = meeting.mode === 'Online' && /^https?:\/\/\S+$/i.test(meeting.location || '');
  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#431407', fontFamily: 'Baloo 2' }}>
          {meeting.role === 'recipient' ? 'विनंती करणारे' : 'भेटणार'}: {meeting.partner_name || '—'}
        </h4>
        <span style={{ background: bg, color: fg, padding: '3px 10px', borderRadius: 12, fontSize: '0.74rem', fontWeight: 800 }}>
          {STATUS_LABELS[meeting.status] || meeting.status}
        </span>
      </div>
      <div style={{ fontSize: '0.9rem', color: '#7c2d12', fontWeight: 700 }}>
        📅 {meeting.date} · 🕒 {meeting.time} · {meeting.mode === 'Online' ? '💻 ऑनलाइन' : '📍 प्रत्यक्ष'}
      </div>
      <div style={{ fontSize: '0.88rem', color: '#431407', marginTop: 4, wordBreak: 'break-word' }}>
        {isLink
          ? <a href={meeting.location} target="_blank" rel="noopener noreferrer" style={{ color: '#c2410c', fontWeight: 700 }}>{meeting.location}</a>
          : (meeting.location || '')}
      </div>
      <div style={{ fontSize: '0.88rem', color: '#78350f', marginTop: 4 }}>विषय: {meeting.topic}</div>
      {meeting.notes ? (
        <div style={{ marginTop: 8, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '8px 10px', fontSize: '0.84rem', whiteSpace: 'pre-wrap' }}>
          📝 {meeting.notes}
        </div>
      ) : null}
      {actions.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {actions.map((a) => (
            <button key={a} type="button" onClick={() => onAction(a, meeting)}
              style={a === 'accept' ? { ...primary, padding: '7px 14px', fontSize: '0.82rem' } : ghost}>
              {ACTION_LABELS[a]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, empty, meetings, memberId, today, onAction }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <h3 style={{ margin: '0 0 10px', fontSize: '1.15rem', color: '#431407', fontFamily: 'Baloo 2' }}>{title} ({meetings.length})</h3>
      {meetings.length === 0
        ? <div style={{ ...card, color: '#78350f', fontSize: '0.9rem' }}>{empty}</div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {meetings.map((m) => <MeetingCard key={m.id} meeting={m} actions={actionsFor(m, memberId, today)} onAction={onAction} />)}
          </div>}
    </div>
  );
}

export default function MeetingsPortalPage() {
  const { user } = useAuth();
  const memberId = user?.id;
  const [searchParams] = useSearchParams();
  const recipientParam = searchParams.get('recipient') || '';

  const [meetings, setMeetings] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState(recipientParam ? 'book' : 'upcoming');
  const [form, setForm] = useState(() => newForm(recipientParam));
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [resched, setResched] = useState(null); // { meeting, date, time, place }
  const [reschedError, setReschedError] = useState('');
  const [noteFor, setNoteFor] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [toast, setToast] = useState('');

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(''), 4000);
  }, []);

  const load = useCallback(async () => {
    try {
      const [list, people] = await Promise.all([apiClient.getMeetings(), apiClient.getMeetingPartners()]);
      setMeetings(Array.isArray(list) ? list : []);
      setPartners(Array.isArray(people) ? people : []);
      setLoadError('');
    } catch (err) {
      setLoadError(err.message || 'बैठका लोड करता आल्या नाहीत (Could not load meetings).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useMeetingStream({ onChanged: (event) => { if (eventConcernsMe(event, memberId)) load(); }, onReconnect: load });

  const today = istNow().slice(0, 10);
  const groups = useMemo(() => groupMeetings(meetings, memberId, today), [meetings, memberId, today]);
  const completed = groups.past.filter((m) => m.status === 'Completed').length;

  const run = async (call, okMessage) => {
    try {
      await call();
      showToast(okMessage);
      await load();
      return true;
    } catch (err) {
      showToast(err.message || 'काहीतरी चुकले (Something went wrong).');
      return false;
    }
  };

  const onAction = (action, meeting) => {
    if (action === 'accept') run(() => apiClient.updateMeetingStatus(meeting.id, 'accepted'), '✓ बैठक निश्चित झाली!');
    else if (action === 'decline') run(() => apiClient.updateMeetingStatus(meeting.id, 'declined'), 'विनंती नाकारली.');
    else if (action === 'complete') run(() => apiClient.updateMeetingStatus(meeting.id, 'completed'), '✔ बैठक पूर्ण झाली म्हणून नोंदवली.');
    else if (action === 'cancel') {
      if (window.confirm('ही बैठक रद्द करायची का? (Cancel this meeting?)')) run(() => apiClient.updateMeetingStatus(meeting.id, 'cancelled'), 'बैठक रद्द केली.');
    } else if (action === 'reschedule') {
      setReschedError('');
      setResched({ meeting, date: meeting.date, time: meeting.time, place: '' });
    } else if (action === 'note') {
      setNoteFor(meeting);
      setNoteText(meeting.notes || '');
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    const problem = validateBooking(form, istNow());
    setFormError(problem);
    if (problem) return;
    setSaving(true);
    const ok = await run(() => apiClient.createMeeting({ ...form, place: form.place.trim(), topic: form.topic.trim() }), '✓ बैठकीची विनंती पाठवली!');
    setSaving(false);
    if (ok) {
      setForm(newForm(''));
      setActiveTab('upcoming');
    }
  };

  const submitReschedule = async (e) => {
    e.preventDefault();
    const m = resched.meeting;
    const problem = validateBooking({ recipientId: m.partner_id, date: resched.date, time: resched.time, mode: m.mode, place: resched.place.trim() || m.location, topic: m.topic }, istNow());
    setReschedError(problem);
    if (problem) return;
    const body = { date: resched.date, time: resched.time };
    if (resched.place.trim()) body.place = resched.place.trim();
    if (await run(() => apiClient.rescheduleMeeting(m.id, body), 'नवीन वेळ पाठवली, उत्तराची प्रतीक्षा.')) setResched(null);
  };

  const submitNote = async (e) => {
    e.preventDefault();
    if (await run(() => apiClient.saveMeetingNote(noteFor.id, noteText), 'नोंद जतन केली.')) setNoteFor(null);
  };

  const tabs = [
    { id: 'upcoming', label: '📅 आगामी भेटी (Upcoming)', count: groups.waiting.length + groups.sent.length + groups.confirmed.length },
    { id: 'book', label: '➕ नवीन भेट (Request a meeting)' },
    { id: 'past', label: '📝 झालेल्या भेटी (History)', count: groups.past.length },
    { id: 'how', label: '💡 कार्यपद्धती (How it works)' }
  ];

  return (
    <div style={{ background: '#FFFBF5', minHeight: '100vh', padding: '24px 0 60px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <Link to="/sangam" style={{ ...ghost, textDecoration: 'none' }}>← व्यवसाय संगम</Link>
          <Link to="/referrals" style={{ ...ghost, textDecoration: 'none' }}>🤝 रेफरल व देवाणघेवाण</Link>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #9a3412 100%)', borderRadius: 20, padding: '28px 26px', color: '#fff', marginBottom: 22 }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#FDE047', marginBottom: 8 }}>☕ 1-TO-1 BUSINESS MEETINGS</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '2rem', fontFamily: 'Baloo 2, sans-serif', fontWeight: 800 }}>१-ते-१ व्यावसायिक भेटी</h1>
          <p style={{ margin: 0, color: '#FFEDD5', lineHeight: 1.6 }}>
            व्यवसाय नोंदवलेल्या सदस्यांना भेटीची विनंती पाठवा. समोरचा सदस्य स्वीकारल्यावर बैठक निश्चित होते; ती फक्त तुम्हा दोघांना दिसते.
          </p>
        </div>

        {loadError && <div style={{ ...card, background: '#FFEBEE', color: '#C62828', fontWeight: 700, marginBottom: 16 }}>⚠️ {loadError}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 22 }}>
          {[['तुमच्या उत्तराची वाट पाहणाऱ्या विनंत्या', groups.waiting.length, '#c2410c'], ['निश्चित झालेल्या आगामी भेटी', groups.confirmed.length, '#16a34a'], ['पूर्ण झालेल्या भेटी', completed, '#2563eb']].map(([text, value, color]) => (
            <div key={text} style={card}>
              <div style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 700 }}>{text}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color, fontFamily: 'Baloo 2' }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, borderBottom: '2px solid #fed7aa', marginBottom: 22, overflowX: 'auto' }}>
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              style={{ padding: '10px 16px', border: 'none', borderRadius: '10px 10px 0 0', cursor: 'pointer', fontWeight: 800, whiteSpace: 'nowrap',
                background: activeTab === tab.id ? '#ea580c' : 'transparent', color: activeTab === tab.id ? '#fff' : '#7c2d12' }}>
              {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
            </button>
          ))}
        </div>

        {loading && <div style={{ ...card, color: '#78350f' }}>लोड होत आहे... (loading)</div>}

        {!loading && activeTab === 'upcoming' && (
          <>
            <Section title="तुमच्या उत्तराची वाट पाहणाऱ्या विनंत्या" empty="सध्या कोणतीही विनंती तुमच्या उत्तराची वाट पाहत नाही." meetings={groups.waiting} memberId={memberId} today={today} onAction={onAction} />
            <Section title="तुम्ही पाठवलेल्या विनंत्या" empty="तुम्ही पाठवलेली कोणतीही विनंती उत्तराच्या प्रतीक्षेत नाही." meetings={groups.sent} memberId={memberId} today={today} onAction={onAction} />
            <Section title="निश्चित झालेल्या भेटी" empty="अजून कोणतीही भेट निश्चित झालेली नाही. 'नवीन भेट' मधून विनंती पाठवा." meetings={groups.confirmed} memberId={memberId} today={today} onAction={onAction} />
          </>
        )}

        {!loading && activeTab === 'past' && (
          <Section title="झालेल्या, नाकारलेल्या व रद्द भेटी" empty="अजून कोणताही इतिहास नाही." meetings={groups.past} memberId={memberId} today={today} onAction={onAction} />
        )}

        {activeTab === 'book' && (
          <form onSubmit={submitBooking} style={{ ...card, maxWidth: 640 }}>
            <h3 style={{ margin: '0 0 12px', color: '#431407', fontFamily: 'Baloo 2' }}>नवीन भेटीची विनंती</h3>
            {partners.length === 0 && !loading && (
              <div style={{ background: '#fff7ed', borderRadius: 8, padding: 10, marginBottom: 12, color: '#78350f', fontSize: '0.88rem' }}>
                सध्या भेटण्यासाठी कोणताही सदस्य उपलब्ध नाही; फक्त व्यवसाय नोंदवलेले सदस्य दिसतात. (No member with a listed business is available yet.)
              </div>
            )}
            <label style={label}>कोणाला भेटायचे आहे? (Member)</label>
            <select style={input} value={form.recipientId} onChange={(e) => setForm({ ...form, recipientId: e.target.value })}>
              <option value="">— निवडा —</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {(p.businesses || []).map((b) => b.name).join(', ')}</option>
              ))}
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div><label style={label}>तारीख (Date)</label><input style={input} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><label style={label}>वेळ (Time)</label><input style={input} type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <label style={{ ...label, marginTop: 12 }}>प्रकार (How)</label>
            <select style={input} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>
              <option value="Offline">📍 प्रत्यक्ष भेट (In person)</option>
              <option value="Online">💻 ऑनलाइन (Online)</option>
            </select>
            <label style={{ ...label, marginTop: 12 }}>{form.mode === 'Online' ? 'मीटिंग लिंक (तुमची स्वतःची, https://...)' : 'ठिकाण (Place)'}</label>
            <input style={input} value={form.place} maxLength={200} onChange={(e) => setForm({ ...form, place: e.target.value })} />
            <label style={{ ...label, marginTop: 12 }}>विषय (Topic)</label>
            <textarea style={{ ...input, minHeight: 70 }} value={form.topic} maxLength={300} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            {formError && <div style={{ color: '#C62828', fontWeight: 700, marginTop: 10 }}>⚠️ {formError}</div>}
            <button type="submit" disabled={saving} style={{ ...primary, marginTop: 14, opacity: saving ? 0.6 : 1 }}>
              {saving ? 'पाठवत आहे...' : 'विनंती पाठवा'}
            </button>
          </form>
        )}

        {activeTab === 'how' && (
          <div style={{ ...card, lineHeight: 1.8, color: '#431407' }}>
            <h3 style={{ marginTop: 0, fontFamily: 'Baloo 2' }}>कार्यपद्धती</h3>
            <ol style={{ margin: 0, paddingLeft: 22 }}>
              <li>व्यवसाय नोंदवलेला सदस्य निवडा, तारीख, वेळ, ठिकाण किंवा ऑनलाइन लिंक व विषय द्या.</li>
              <li>समोरच्या सदस्याला कळवले जाते; तो स्वीकारतो किंवा नाकारतो. वेळ बदलायची असल्यास कोणीही नवीन वेळ सुचवू शकतो, पुन्हा स्वीकारावे लागते.</li>
              <li>भेट झाल्यावर दोघांपैकी कोणीही ती "पूर्ण" म्हणून नोंदवू शकतो व दोघांसाठी एक सामायिक नोंद ठेवू शकतो.</li>
              <li>भेटी फक्त तुम्हा दोघांना दिसतात; दुसरा बदल करताच तुमचे पान आपोआप अद्ययावत होते.</li>
            </ol>
          </div>
        )}
      </div>

      {resched && (
        <Modal title="नवीन वेळ सुचवा" onClose={() => setResched(null)}>
          <form onSubmit={submitReschedule}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={label}>तारीख</label><input style={input} type="date" value={resched.date} onChange={(e) => setResched({ ...resched, date: e.target.value })} /></div>
              <div><label style={label}>वेळ</label><input style={input} type="time" value={resched.time} onChange={(e) => setResched({ ...resched, time: e.target.value })} /></div>
            </div>
            <label style={{ ...label, marginTop: 12 }}>नवीन ठिकाण / लिंक (रिकामे ठेवल्यास आधीचेच राहील)</label>
            <input style={input} value={resched.place} maxLength={200} onChange={(e) => setResched({ ...resched, place: e.target.value })} />
            {reschedError && <div style={{ color: '#C62828', fontWeight: 700, marginTop: 10 }}>⚠️ {reschedError}</div>}
            <p style={{ fontSize: '0.8rem', color: '#78350f' }}>नवीन वेळेला समोरच्या सदस्याने पुन्हा स्वीकृती द्यावी लागेल.</p>
            <button type="submit" style={primary}>नवीन वेळ पाठवा</button>
          </form>
        </Modal>
      )}

      {noteFor && (
        <Modal title="सामायिक नोंद (Shared note)" onClose={() => setNoteFor(null)}>
          <form onSubmit={submitNote}>
            <textarea style={{ ...input, minHeight: 120 }} value={noteText} maxLength={2000} onChange={(e) => setNoteText(e.target.value)} />
            <p style={{ fontSize: '0.8rem', color: '#78350f' }}>ही नोंद फक्त तुम्हा दोघांना दिसते.</p>
            <button type="submit" style={primary}>जतन करा</button>
          </form>
        </Modal>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#431407', color: '#fff', padding: '12px 20px', borderRadius: 12, fontWeight: 700, zIndex: 10001 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
