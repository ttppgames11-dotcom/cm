import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function BusinessRevenueManagementPage() {
  const { packages, setPackages, addToast } = useMagazineAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // all, sponsored, directory, branding

  const initialForm = {
    name: '',
    price: '₹२,९९९',
    period: '/ लेख',
    proposedPriceNum: 2999,
    desc: '',
    status: 'active'
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenEdit = (pkg) => {
    setEditingPkg(pkg);
    setFormData({ ...pkg });
    setModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingPkg(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPkg) {
      setPackages(prev => prev.map(p => p.id === editingPkg.id ? { ...p, ...formData } : p));
      addToast(`"${formData.name}" पॅकेजचे दर व तपशील अद्ययावत केले.`, 'success');
    } else {
      const newPkg = {
        id: `pkg-${Date.now().toString().slice(-4)}`,
        ...formData,
        salesCount: 0
      };
      setPackages(prev => [...prev, newPkg]);
      addToast(`नवीन व्यावसायिक पॅकेज तयार केले.`, 'success');
    }
    setModalOpen(false);
  };

  const handleToggleStatus = (id) => {
    setPackages(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));
    addToast('पॅकेजची स्थिती बदलण्यात आली.', 'info');
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? "${name}" हे पॅकेज हटवले जाईल.`)) {
      setPackages(prev => prev.filter(p => p.id !== id));
      addToast(`पॅकेज हटवण्यात आले.`, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            💼 बिझनेस लिस्टिंग्ज व महसूल व्यवस्थापन (Business & Revenue)
          </h1>
          <p className="cm-page-desc">
            प्रस्तावित व्यावसायिक दरपत्रक, स्पॉन्सर्ड आर्टिकल्स, बिझनेस लिस्टिंग्ज, फाउंडर मुलाखत व वार्षिक ब्रँड पार्टनरशिप पॅकेजेस.
          </p>
        </div>

        <button type="button" onClick={handleOpenAdd} className="cm-btn cm-btn-primary">
          <span>+ नवीन व्यावसायिक पॅकेज जोडा</span>
        </button>
      </div>

      {/* Commercial Tabs */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1.5px solid #E2E8F0', paddingBottom: '12px' }}>
        {[
          { id: 'all', label: 'सर्व पॅकेजेस (All Commercial)' },
          { id: 'sponsored', label: 'प्रायोजित लेख (Sponsored Articles)' },
          { id: 'directory', label: 'प्रीमियम बिझनेस लिस्टिंग्ज (₹४९९)' },
          { id: 'branding', label: 'ब्रँड पार्टनरशिप्स (₹२५,०००)' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? '#FFF4ED' : '#FFFFFF',
              border: activeTab === tab.id ? '1.5px solid #F4510B' : '1px solid #CBD5E1',
              color: activeTab === tab.id ? '#F4510B' : '#475569',
              fontWeight: 700,
              fontSize: '0.84rem',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pricing Table */}
      <div className="cm-table-container">
        <table className="cm-table">
          <thead>
            <tr>
              <th>पॅकेज / सेवा नाव</th>
              <th>प्रस्तावित दर (Proposed Price)</th>
              <th>कालावधी (Billing Period)</th>
              <th>वर्णन व स्वरूप</th>
              <th>नोंदणी संख्या</th>
              <th>स्थिती</th>
              <th>कृती (Actions)</th>
            </tr>
          </thead>
          <tbody>
            {packages.map(pkg => (
              <tr key={pkg.id}>
                <td>
                  <strong style={{ fontSize: '0.96rem', color: '#0F172A', display: 'block' }}>
                    {pkg.name}
                  </strong>
                </td>
                <td>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#F4510B' }}>
                    {pkg.price}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                    {pkg.period}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.84rem', color: '#475569', maxWidth: '320px', display: 'block' }}>
                    {pkg.desc}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                    {pkg.salesCount || 0} नोंदणी
                  </span>
                </td>
                <td>
                  <span className={`cm-badge cm-badge-${pkg.status === 'active' ? 'success' : 'neutral'}`}>
                    {pkg.status === 'active' ? '● सक्रिय (Active)' : '● निष्क्रिय'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleOpenEdit(pkg)} className="cm-btn cm-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                      दर बदला
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleToggleStatus(pkg.id)} 
                      className="cm-btn cm-btn-secondary" 
                      style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                    >
                      {pkg.status === 'active' ? 'बंद करा' : 'सुरू करा'}
                    </button>
                    <button type="button" onClick={() => handleDelete(pkg.id, pkg.name)} className="cm-btn cm-btn-danger" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
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
                {editingPkg ? 'पॅकेज दर व तपशील संपादित करा' : 'नवीन व्यावसायिक पॅकेज जोडा'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>पॅकेज / सेवेचे नाव *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>प्रस्तावित दर (Price) *</label>
                  <input type="text" required placeholder="उदा. ₹२,९९९ किंवा ₹४९९" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>कालावधी (Period)</label>
                  <input type="text" placeholder="उदा. / वर्ष किंवा / लेख" value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>पॅकेजचे तपशील व वाचक पोहोच</label>
                <textarea rows="3" value={formData.desc} onChange={(e) => setFormData({ ...formData, desc: e.target.value })} className="cm-input" style={{ width: '100%' }} />
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
