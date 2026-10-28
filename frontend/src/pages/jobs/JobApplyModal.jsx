import React, { useState } from 'react';
import apiClient from '../../services/apiClient';
import { applicationPayload } from './jobsHelp';

const input = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontFamily: 'inherit', boxSizing: 'border-box' };
const label = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' };

// The apply form for one job (used on the jobs board and the shared job page). Server errors show inside the form.
export default function JobApplyModal({ job, user, onClose, onApplied }) {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', summary: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await apiClient.applyToJob(job.id, applicationPayload(form));
      setDone(true);
      if (onApplied) onApplied();
    } catch (err) {
      setError(err.message || 'अर्ज पाठवता आला नाही.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
            <h3 style={{ color: '#2E7D32', margin: '0 0 8px' }}>अर्ज पाठवला!</h3>
            <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '20px' }}>
              जाहिरात देणाऱ्यांना कळवले आहे. स्थिती "माझे अर्ज" मध्ये पहा.
            </p>
            <button onClick={onClose} style={{ background: '#C73800', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>पूर्ण झाले</button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#C73800' }}>📄 नोकरीसाठी अर्ज करा</h3>
              <button onClick={onClose} aria-label="बंद करा" style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '16px' }}>
              <strong>{job.title}</strong> — {job.company}
            </p>
            <form onSubmit={submit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={label}>नाव *</label>
                <input type="text" required minLength={2} maxLength={100} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} style={input} />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={label}>फोन नंबर *</label>
                <input type="tel" required value={form.phone} placeholder="9876500000"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} style={input} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={label}>ईमेल</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={input} />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={label}>शिक्षण, अनुभव व कौशल्यांचा संक्षिप्त परिचय</label>
                <textarea rows="3" maxLength={500} value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="उदा. B.Com, २ वर्षे Tally अनुभव..." style={input} />
              </div>
              {error && <div role="alert" style={{ background: '#FEF2F2', color: '#B91C1C', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '0.9rem' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} style={{ background: '#F3F4F6', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>रद्द</button>
                <button type="submit" disabled={busy} style={{ background: '#C73800', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}>
                  {busy ? 'पाठवत आहे…' : 'अर्ज पाठवा 🚀'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
