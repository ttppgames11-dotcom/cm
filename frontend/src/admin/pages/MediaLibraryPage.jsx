import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function MediaLibraryPage() {
  const { mediaList, setMediaList, addToast } = useMagazineAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const mediaTypes = ["Magazine Cover", "Article Image", "Page Artwork", "Portrait", "Historical Heritage"];

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'Article Image',
    size: '1.5 MB',
    copyright: 'Connect Maratha Official',
    attribution: 'Editorial Desk',
    usedIn: 'सामान्य मीडिया'
  });

  const handleUploadSimulate = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.url) return;

    const newMedia = {
      id: `med-${Date.now().toString().slice(-4)}`,
      ...formData,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setMediaList(prev => [newMedia, ...prev]);
    addToast(`"${formData.name}" मीडिया लायब्ररीमध्ये जोडली गेली.`, 'success');
    setModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? "${name}" ही फाईल मीडियामधून हटवली जाईल.`)) {
      setMediaList(prev => prev.filter(m => m.id !== id));
      addToast(`फाईल हटवली.`, 'error');
    }
  };

  const filtered = mediaList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.usedIn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            🖼️ सेंट्रलाइज्ड मीडिया लायब्ररी (Media Assets Library)
          </h1>
          <p className="cm-page-desc">
            मासिक कव्हर, फोटोग्राफ्स, कॉपीराइट परवानग्या, श्रेय (Attribution) व वापराची माहिती साठवा.
          </p>
        </div>

        <button type="button" onClick={() => setModalOpen(true)} className="cm-btn cm-btn-primary">
          <span>+ नवीन मीडिया अपलोड करा (Upload Media)</span>
        </button>
      </div>

      <div className="cm-filter-bar">
        <input 
          type="text"
          placeholder="इमेज नाव किंवा वापर शोधा..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="cm-input"
          style={{ flex: '1 1 260px' }}
        />

        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
          className="cm-input"
          style={{ background: '#FFF' }}
        >
          <option value="all">सर्व मीडिया प्रकार (All Types)</option>
          {mediaTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {filtered.map(med => (
          <div key={med.id} className="cm-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column' }}>
            <div 
              style={{ height: '170px', borderRadius: '8px', overflow: 'hidden', marginBottom: '10px', background: '#F8FAFC', cursor: 'pointer', border: '1px solid #E2E8F0' }}
              onClick={() => setPreviewMedia(med)}
            >
              <img src={med.url} alt={med.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <span style={{ fontSize: '0.72rem', color: '#F4510B', fontWeight: 800, textTransform: 'uppercase' }}>
              {med.type}
            </span>
            <strong style={{ fontSize: '0.9rem', color: '#0F172A', margin: '2px 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {med.name}
            </strong>
            <span style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '8px' }}>
              वापर: {med.usedIn} • {med.size}
            </span>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginTop: 'auto' }}>
              <button type="button" onClick={() => setPreviewMedia(med)} className="cm-btn cm-btn-secondary" style={{ padding: '5px 10px', fontSize: '0.76rem' }}>
                तपशील पहा
              </button>
              <button type="button" onClick={() => handleDelete(med.id, med.name)} className="cm-btn cm-btn-danger" style={{ padding: '5px 8px', fontSize: '0.76rem' }}>
                हटवा
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="cm-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="cm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>नवीन मीडिया अपलोड नोंदणी</h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleUploadSimulate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>फाईलचे नाव *</label>
                <input type="text" required placeholder="उदा. cover-story-interview.jpg" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>इमेज URL / पाथ *</label>
                <input type="text" required placeholder="/assets/images/sample.jpg" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>प्रकार</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="cm-input" style={{ width: '100%', background: '#FFF' }}>
                    {mediaTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>कॉपीराइट परवानगी</label>
                  <input type="text" value={formData.copyright} onChange={(e) => setFormData({ ...formData, copyright: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>फोटोग्राफर / श्रेय (Attribution)</label>
                <input type="text" value={formData.attribution} onChange={(e) => setFormData({ ...formData, attribution: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="cm-btn cm-btn-secondary">रद्द करा</button>
                <button type="submit" className="cm-btn cm-btn-primary">अपलोड नोंदवा</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewMedia && (
        <div className="cm-modal-backdrop" onClick={() => setPreviewMedia(null)}>
          <div className="cm-modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span className="cm-badge" style={{ background: '#FFF4ED', color: '#F4510B', border: '1px solid #FFD4C2' }}>{previewMedia.type}</span>
              <button type="button" onClick={() => setPreviewMedia(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <img src={previewMedia.url} alt={previewMedia.name} style={{ width: '100%', height: '280px', objectFit: 'contain', background: '#0F172A', borderRadius: '8px', marginBottom: '16px' }} />

            <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>{previewMedia.name}</h3>
            <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              <strong>कॉपीराइट:</strong> {previewMedia.copyright}<br />
              <strong>श्रेय (Attribution):</strong> {previewMedia.attribution}<br />
              <strong>वापर (Usage):</strong> {previewMedia.usedIn}<br />
              <strong>अपलोड तारीख:</strong> {previewMedia.uploadDate} • {previewMedia.size}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
