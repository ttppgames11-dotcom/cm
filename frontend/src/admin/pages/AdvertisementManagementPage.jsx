import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function AdvertisementManagementPage() {
  const { advertisements, setAdvertisements, issues, addToast } = useMagazineAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const adTypes = [
    "Magazine Advertisement",
    "Sponsored Articles",
    "Business Listings",
    "Brand Partnerships",
    "Featured Founder",
    "Recruitment Ads",
    "Education Ads",
    "Event Promotion",
    "District Business Special"
  ];

  const positions = [
    "Back Cover (अंतिम पृष्ठ)",
    "Inside Front Cover (पान २ स्लॉट)",
    "Inside Back Cover (पान ९ स्लॉट)",
    "Page 3 Inside Feature",
    "Page 5 Feature Strip",
    "Full Page Color Spread",
    "Directory Premium Box"
  ];

  const initialForm = {
    advertiserName: '',
    title: '',
    type: 'Magazine Advertisement',
    position: 'Back Cover (अंतिम पृष्ठ)',
    issueId: issues[0]?.id || '',
    bannerImage: '/assets/images/business-blueprint-hd.jpg',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    amount: '₹७,५००',
    status: 'active'
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenCreate = () => {
    setEditingAd(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (ad) => {
    setEditingAd(ad);
    setFormData({ ...ad });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAd) {
      setAdvertisements(prev => prev.map(a => a.id === editingAd.id ? { ...a, ...formData } : a));
      addToast(`"${formData.title}" जाहिरातीचे तपशील जतन केले.`, 'success');
    } else {
      const newAd = {
        id: `ad-${Date.now().toString().slice(-4)}`,
        ...formData,
        clicks: 0
      };
      setAdvertisements(prev => [newAd, ...prev]);
      addToast(`नवीन जाहिरात "${formData.title}" जोडण्यात आली.`, 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? "${title}" ही जाहिरात हटवली जाईल.`)) {
      setAdvertisements(prev => prev.filter(a => a.id !== id));
      addToast(`जाहिरात हटवण्यात आली.`, 'error');
    }
  };

  const filteredAds = advertisements.filter(a => {
    const matchesSearch = a.advertiserName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            📢 जाहिरात व्यवस्थापन (Advertisements Management)
          </h1>
          <p className="cm-page-desc">
            कव्हर स्पॉन्सरशिप्स, प्रायोजित लेख (Sponsored Articles), ब्रँड भागीदारी व आतल्या पानांचे स्लॉट्स व्यवस्थापित करा.
          </p>
        </div>

        <button type="button" onClick={handleOpenCreate} className="cm-btn cm-btn-primary">
          <span>+ नवीन जाहिरात जोडा (Add Advertisement)</span>
        </button>
      </div>

      <div className="cm-filter-bar">
        <input 
          type="text"
          placeholder="जाहिरातदार किंवा ब्रँड नाव शोधा..."
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
          <option value="all">सर्व जाहिरात प्रकार (All Types)</option>
          {adTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="cm-table-container">
        <table className="cm-table">
          <thead>
            <tr>
              <th>बॅनर</th>
              <th>जाहिरातदार व मोहीम</th>
              <th>प्रकार (Type)</th>
              <th>स्थान (Placement)</th>
              <th>दर (Package Amount)</th>
              <th>कालावधी</th>
              <th>स्थिती</th>
              <th>कृती (Actions)</th>
            </tr>
          </thead>
          <tbody>
            {filteredAds.map(ad => (
              <tr key={ad.id}>
                <td style={{ width: '70px' }}>
                  <img src={ad.bannerImage} alt={ad.title} style={{ width: '60px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }} />
                </td>
                <td>
                  <strong style={{ display: 'block', fontSize: '0.94rem', color: '#0F172A', marginBottom: '2px' }}>
                    {ad.advertiserName}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                    {ad.title}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem', color: '#F4510B', fontWeight: 700 }}>
                    {ad.type}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                    📍 {ad.position}
                  </span>
                </td>
                <td>
                  <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>
                    {ad.amount}
                  </strong>
                </td>
                <td>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {ad.startDate} ते {ad.endDate}
                  </span>
                </td>
                <td>
                  <span className={`cm-badge cm-badge-${ad.status === 'active' ? 'success' : 'neutral'}`}>
                    {ad.status === 'active' ? '● चालू (Active)' : '● समाप्त'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleOpenEdit(ad)} className="cm-btn cm-btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                      संपादित
                    </button>
                    <button type="button" onClick={() => handleDelete(ad.id, ad.title)} className="cm-btn cm-btn-danger" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                      हटवा
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="cm-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="cm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingAd ? 'जाहिरात संपादित करा' : 'नवीन जाहिरात नोंदणी करा'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>जाहिरातदाराचे नाव / कंपनी *</label>
                <input type="text" required value={formData.advertiserName} onChange={(e) => setFormData({ ...formData, advertiserName: e.target.value })} placeholder="उदा. सह्याद्री ॲग्रो फूड्स" className="cm-input" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>जाहिरात शीर्षक / मोहीम *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="उदा. सेंद्रिय गूळ पावडर स्पेशल ऑफर" className="cm-input" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>जाहिरात पॅकेज प्रकार *</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="cm-input" style={{ width: '100%', background: '#FFF' }}>
                    {adTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>स्थान / स्लॉट (Placement) *</label>
                  <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="cm-input" style={{ width: '100%', background: '#FFF' }}>
                    {positions.map((p, i) => <option key={i} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>दर / रक्कम (Amount)</label>
                  <input type="text" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="उदा. ₹७,५००" className="cm-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>स्थिती</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="cm-input" style={{ width: '100%', background: '#FFF' }}>
                    <option value="active">सक्रिय (Active)</option>
                    <option value="inactive">निष्क्रिय (Inactive)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>बॅनर इमेज URL</label>
                <input type="text" value={formData.bannerImage} onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="cm-btn cm-btn-secondary">रद्द करा</button>
                <button type="submit" className="cm-btn cm-btn-primary">जतन करा</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
