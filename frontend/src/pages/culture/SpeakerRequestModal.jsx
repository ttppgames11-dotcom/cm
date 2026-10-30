import React, { useState } from 'react';
import apiClient from '../../services/apiClient';
import { offeredKinds, requestPayload } from './speakersHelp';

const field = { padding: '10px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', fontSize: '0.95rem' };
const KIND_LABELS = { talk: '🎙️ कार्यक्रमात व्याख्यान', guidance: '🧭 वैयक्तिक मार्गदर्शन' };

// Today as YYYY-MM-DD in the visitor's own time zone (the date picker's minimum).
function today() {
  return new Date().toLocaleDateString('en-CA');
}

// Send a talk or guidance request: only the kinds this speaker offers.
export default function SpeakerRequestModal({ speaker, onClose, onSent }) {
  const kinds = offeredKinds(speaker);
  const [kind, setKind] = useState(kinds[0]);
  const [form, setForm] = useState({ event_date: '', place: '', event_type: '', audience: '', topic: '', mode: 'phone', message: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await apiClient.sendSpeakerRequest(speaker.id, requestPayload(kind, form));
      setDone(true);
      onSent?.();
    } catch (err) {
      setError(err.message || 'विनंती पाठवता आली नाही.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, color: '#E65100' }}>📨 {speaker.name} यांना विनंती</h3>
          <button onClick={onClose} aria-label="बंद करा" style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p role="status" style={{ fontWeight: 700, color: '#166534', margin: '0 0 16px' }}>✅ विनंती पाठवली. उत्तर आल्यावर 🔔 सूचना मिळेल.</p>
            <button onClick={onClose} style={{ background: '#E65100', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>ठीक आहे</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {kinds.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {kinds.map((k) => (
                  <button key={k} type="button" onClick={() => setKind(k)}
                    style={{ padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontWeight: 700,
                      border: kind === k ? '2px solid #E65100' : '1px solid #E0E0E0', background: kind === k ? '#E65100' : '#fff', color: kind === k ? '#fff' : '#424242' }}>
                    {KIND_LABELS[k]}
                  </button>
                ))}
              </div>
            )}
            {kinds.length === 1 && <p style={{ margin: 0, fontWeight: 700 }}>{KIND_LABELS[kind]}</p>}

            {kind === 'talk' ? (
              <>
                <label style={{ fontSize: '0.85rem', color: '#4B5563' }}>कार्यक्रमाची तारीख *
                  <input required type="date" min={today()} value={form.event_date} onChange={set('event_date')} style={field} />
                </label>
                <input required value={form.place} onChange={set('place')} placeholder="ठिकाण (गाव / शहर, सभागृह) *" style={field} />
                <input value={form.event_type} onChange={set('event_type')} placeholder="कार्यक्रम (उदा. शिवजयंती, कॉलेज सेमिनार)" style={field} />
                <input type="number" min="1" max="100000" value={form.audience} onChange={set('audience')} placeholder="अपेक्षित श्रोते (अंदाजे)" style={field} />
              </>
            ) : (
              <>
                <input required value={form.topic} onChange={set('topic')} placeholder="कशाबद्दल मार्गदर्शन हवे? *" style={field} />
                <select value={form.mode} onChange={set('mode')} style={field}>
                  <option value="phone">📞 फोनवर</option>
                  <option value="meeting">🤝 प्रत्यक्ष भेट</option>
                </select>
              </>
            )}
            <textarea value={form.message} onChange={set('message')} rows="3" placeholder="संदेश (ऐच्छिक)" style={field} />
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>तुमचे नाव व मोबाईल नंबर (प्रोफाइलमधील) वक्त्यांना दिसेल.</p>
            {error && <div role="alert" style={{ background: '#FEF2F2', color: '#B91C1C', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }}>{error}</div>}
            <button type="submit" disabled={sending} style={{ background: '#E65100', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', opacity: sending ? 0.7 : 1 }}>
              {sending ? 'पाठवत आहे...' : 'विनंती पाठवा'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
