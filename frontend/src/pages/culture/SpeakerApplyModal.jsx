import React, { useState } from 'react';
import apiClient from '../../services/apiClient';
import { SPEAKER_CATEGORIES, speakerPayload } from './speakersHelp';

const field = { padding: '10px', borderRadius: '8px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', fontSize: '0.95rem' };

function startForm(initial, user) {
  if (initial) {
    return {
      name: initial.name || '', title: initial.title || '', category: initial.category || SPEAKER_CATEGORIES[0],
      city: initial.city || '', topics: initial.topics || '', intro: initial.intro || '', phone: initial.phone || '',
      offers_talks: !!initial.offers_talks, offers_guidance: !!initial.offers_guidance
    };
  }
  return {
    name: user?.name || '', title: '', category: SPEAKER_CATEGORIES[0], city: user?.city || '', topics: '', intro: '',
    phone: user?.phone || '', offers_talks: true, offers_guidance: false
  };
}

// Apply as a speaker (initial = null) or edit my profile; an edit waits for approval again.
// `save(payload)` defaults to the member's own apply / edit call; the admin "add speaker" form passes its own.
export default function SpeakerApplyModal({ initial, user, onClose, onSaved, save, heading }) {
  const [form, setForm] = useState(() => startForm(initial, user));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState('');

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.offers_talks && !form.offers_guidance) {
      setError('व्याख्यान किंवा मार्गदर्शन यापैकी किमान एक निवडा.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = speakerPayload(form);
      const res = save ? await save(payload) : initial ? await apiClient.updateMySpeaker(payload) : await apiClient.applySpeaker(payload);
      setDone(save ? '✅ जतन झाले.' : '⏳ तुमचा अर्ज मंजुरीच्या प्रतीक्षेत आहे.');
      onSaved?.(res.speaker || null);
    } catch (err) {
      setError(err.message || 'जतन करता आले नाही.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, color: '#E65100' }}>{heading || (initial ? '✏️ प्रोफाइल बदला' : '🎙️ वक्ता / मार्गदर्शक म्हणून अर्ज करा')}</h3>
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
            <input required value={form.name} onChange={set('name')} placeholder="पूर्ण नाव *" style={field} />
            <input value={form.title} onChange={set('title')} placeholder="पद / ओळख (उदा. प्राध्यापक, उद्योजक)" style={field} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <select value={form.category} onChange={set('category')} style={field}>
                {SPEAKER_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input required value={form.city} onChange={set('city')} placeholder="शहर *" style={field} />
            </div>
            <input required value={form.topics} onChange={set('topics')} placeholder="मुख्य विषय *" style={field} />
            <input required type="tel" value={form.phone} onChange={set('phone')} placeholder="मोबाईल नंबर (१० अंकी) *" style={field} />
            <textarea value={form.intro} onChange={set('intro')} rows="3" placeholder="अनुभव व थोडक्यात परिचय" style={field} />
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '0.92rem' }}>
              <label><input type="checkbox" checked={form.offers_talks} onChange={set('offers_talks')} /> 🎙️ कार्यक्रमात व्याख्यान</label>
              <label><input type="checkbox" checked={form.offers_guidance} onChange={set('offers_guidance')} /> 🧭 वैयक्तिक मार्गदर्शन</label>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>मोबाईल नंबर कार्डवर दिसत नाही; विनंती स्वीकारल्यावरच आयोजकांना दिसतो.</p>
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
