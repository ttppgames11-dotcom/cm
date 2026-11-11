import React, { useState } from 'react';
import apiClient from '../../services/apiClient';
import { EXAMS, STAGES, MODES, label, requestPayload } from './officersHelp';

const field = { padding: '10px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', fontSize: '0.95rem' };

// Ask an officer for guidance: only the exams this officer guides for.
export default function OfficerRequestModal({ officer, onClose, onSent }) {
  const exams = officer.exams || [];
  const [form, setForm] = useState({ exam: exams[0] || '', stage: 'start', question: '', mode: 'phone', message: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await apiClient.sendOfficerRequest(officer.id, requestPayload(form));
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
          <h3 style={{ margin: 0, color: '#E65100' }}>🧭 {officer.name} यांच्याकडे मार्गदर्शन</h3>
          <button onClick={onClose} aria-label="बंद करा" style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p role="status" style={{ fontWeight: 700, color: '#166534', margin: '0 0 16px' }}>✅ विनंती पाठवली. उत्तर आल्यावर 🔔 सूचना मिळेल.</p>
            <button onClick={onClose} style={{ background: '#E65100', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>ठीक आहे</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '0.85rem', color: '#4B5563' }}>परीक्षा *
              <select required value={form.exam} onChange={set('exam')} style={field}>
                {exams.map((c) => <option key={c} value={c}>{label(EXAMS, c)}</option>)}
              </select>
            </label>
            <label style={{ fontSize: '0.85rem', color: '#4B5563' }}>तुमची तयारी कुठपर्यंत? *
              <select value={form.stage} onChange={set('stage')} style={field}>
                {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </label>
            <textarea required maxLength={500} value={form.question} onChange={set('question')} rows="3" placeholder="तुमचा प्रश्न * (उदा. अभ्यास कसा सुरू करू?)" style={field} />
            <label style={{ fontSize: '0.85rem', color: '#4B5563' }}>मार्गदर्शन कसे हवे?
              <select value={form.mode} onChange={set('mode')} style={field}>
                {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </label>
            <textarea value={form.message} onChange={set('message')} rows="2" placeholder="इतर संदेश (ऐच्छिक)" style={field} />
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>तुमचे नाव व मोबाईल नंबर (प्रोफाइलमधील) अधिकाऱ्यांना दिसेल.</p>
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
