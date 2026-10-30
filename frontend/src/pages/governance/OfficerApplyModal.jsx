import React, { useState } from 'react';
import apiClient from '../../services/apiClient';
import { SERVICES, SERVICE_STATUSES, EXAMS, officerPayload } from './officersHelp';

const field = { padding: '10px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', fontSize: '0.95rem' };

function startForm(initial, user) {
  if (initial) {
    return {
      name: initial.name || '', service: initial.service || SERVICES[0].value, service_status: initial.service_status || 'serving',
      batch_year: initial.batch_year ? String(initial.batch_year) : '', post: initial.post || '', department: initial.department || '',
      city: initial.city || '', exams: [...(initial.exams || [])], intro: initial.intro || '', phone: initial.phone || ''
    };
  }
  return {
    name: user?.name || '', service: 'mpsc_1', service_status: 'serving', batch_year: '', post: '', department: '',
    city: user?.city || '', exams: [], intro: '', phone: user?.phone || ''
  };
}

// Apply as an officer mentor (initial = null) or edit my profile; an edit waits for approval again.
// `save(payload)` defaults to the member's own apply / edit call; the admin "add officer" form passes its own.
export default function OfficerApplyModal({ initial, user, onClose, onSaved, save, heading }) {
  const [form, setForm] = useState(() => startForm(initial, user));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const toggleExam = (code) => setForm({
    ...form, exams: form.exams.includes(code) ? form.exams.filter((c) => c !== code) : [...form.exams, code]
  });

  const submit = async (e) => {
    e.preventDefault();
    if (form.exams.length === 0) {
      setError('किमान एका परीक्षेसाठी मार्गदर्शन निवडा.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = officerPayload(form);
      const res = save ? await save(payload) : initial ? await apiClient.updateMyOfficer(payload) : await apiClient.applyOfficer(payload);
      setDone(save ? '✅ जतन झाले.' : '⏳ तुमचा अर्ज तपासणी व मंजुरीच्या प्रतीक्षेत आहे.');
      onSaved?.(res.officer || null);
    } catch (err) {
      setError(err.message || 'जतन करता आले नाही.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '560px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, color: '#E65100' }}>{heading || (initial ? '✏️ प्रोफाइल बदला' : '⭐ अधिकारी-मार्गदर्शक म्हणून अर्ज करा')}</h3>
          <button onClick={onClose} aria-label="बंद करा" style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p role="status" style={{ fontWeight: 700, color: '#166534', margin: '0 0 16px' }}>{done}</p>
            <button onClick={onClose} style={{ background: '#E65100', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>ठीक आहे</button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {initial && !save && <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400E' }}>बदल केल्यावर प्रोफाइल पुन्हा मंजुरीसाठी जाईल.</p>}
            {!initial && !save && <p style={{ margin: 0, fontSize: '0.85rem', color: '#4B5563' }}>प्रशासक तुम्ही अधिकारी असल्याची खात्री करून (उदा. फोनवर) प्रोफाइल मंजूर करतील.</p>}
            <input required value={form.name} onChange={set('name')} placeholder="पूर्ण नाव *" style={field} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
              <select value={form.service} onChange={set('service')} style={field} aria-label="सेवा">
                {SERVICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select value={form.service_status} onChange={set('service_status')} style={field} aria-label="स्थिती">
                {SERVICE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <input type="number" min="1950" max={new Date().getFullYear()} value={form.batch_year} onChange={set('batch_year')} placeholder="बॅच वर्ष (ऐच्छिक)" style={field} />
            </div>
            <input required value={form.post} onChange={set('post')} placeholder="सध्याचे / शेवटचे पद * (उदा. उपजिल्हाधिकारी)" style={field} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <input value={form.department} onChange={set('department')} placeholder="विभाग (उदा. महसूल)" style={field} />
              <input required value={form.city} onChange={set('city')} placeholder="शहर *" style={field} />
            </div>
            <fieldset style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px' }}>
              <legend style={{ fontSize: '0.88rem', fontWeight: 700, padding: '0 6px' }}>कोणत्या परीक्षांसाठी मार्गदर्शन करू शकता? *</legend>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: '0.9rem' }}>
                {EXAMS.map((x) => (
                  <label key={x.value}><input type="checkbox" checked={form.exams.includes(x.value)} onChange={() => toggleExam(x.value)} /> {x.label}</label>
                ))}
              </div>
            </fieldset>
            <input required type="tel" value={form.phone} onChange={set('phone')} placeholder="मोबाईल नंबर (१० अंकी) *" style={field} />
            <textarea value={form.intro} onChange={set('intro')} rows="3" placeholder="थोडक्यात परिचय / अनुभव" style={field} />
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>मोबाईल नंबर कार्डवर दिसत नाही; विनंती स्वीकारल्यावरच विद्यार्थ्याला दिसतो.</p>
            {error && <div role="alert" style={{ background: '#FEF2F2', color: '#B91C1C', padding: '8px 12px', borderRadius: '8px', fontSize: '0.88rem' }}>{error}</div>}
            <button type="submit" disabled={saving} style={{ background: '#E65100', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'जतन करत आहे...' : initial ? 'बदल जतन करा' : 'अर्ज पाठवा'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
