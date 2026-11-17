import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function SubscriptionManagementPage() {
  const { subscriptions, setSubscriptions, addToast } = useMagazineAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const subTypes = [
    "Annual Print Subscription",
    "Annual Digital Subscription",
    "Print + Digital Subscription"
  ];

  const initialForm = {
    subscriberName: '',
    email: '',
    mobile: '',
    type: 'Print + Digital Subscription',
    district: 'पुणे',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '2027-11-17',
    status: 'active',
    paymentStatus: 'Paid (डेमो)'
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingSub(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (sub) => {
    setEditingSub(sub);
    setFormData({ ...sub });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSub) {
      setSubscriptions(prev => prev.map(s => s.id === editingSub.id ? { ...formData } : s));
      addToast(`"${formData.subscriberName}" यांचे वर्गणी रेकॉर्ड अद्ययावत केले.`, 'success');
    } else {
      const newSub = {
        id: `sub-${Date.now().toString().slice(-4)}`,
        ...formData
      };
      setSubscriptions(prev => [newSub, ...prev]);
      addToast(`नवीन वर्गणीदार यशस्वीरीत्या जोडला.`, 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? "${name}" यांचे रेकॉर्ड हटवले जाईल.`)) {
      setSubscriptions(prev => prev.filter(s => s.id !== id));
      addToast(`रेकॉर्ड हटवले.`, 'error');
    }
  };

  const filtered = subscriptions.filter(s => 
    s.subscriberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.district.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            🎟️ मासिक वर्गणीदार व्यवस्थापन (Subscriptions)
          </h1>
          <p className="cm-page-desc">
            वार्षिक प्रिंट, डिजिटल व कॉम्बो वर्गणीदार, एक्सपायरी व नमुना पेमेंट स्थिती नियंत्रित करा.
          </p>
        </div>

        <button type="button" onClick={handleOpenAdd} className="cm-btn cm-btn-primary">
          <span>+ नवीन वर्गणीदार नोंदवा (Add Subscriber)</span>
        </button>
      </div>

      <div className="cm-filter-bar">
        <input 
          type="text"
          placeholder="वर्गणीदाराचे नाव, ईमेल किंवा जिल्हा शोधा..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="cm-input"
          style={{ width: '100%', maxWidth: '380px' }}
        />
      </div>

      <div className="cm-table-container">
        <table className="cm-table">
          <thead>
            <tr>
              <th>वर्गणीदार नाव</th>
              <th>वर्गणी प्रकार (Subscription Plan)</th>
              <th>जिल्हा व संपर्क</th>
              <th>सुरुवात व समाप्ती तारीख</th>
              <th>पेमेंट स्थिती (डेमो)</th>
              <th>स्थिती</th>
              <th>कृती (Actions)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sub => (
              <tr key={sub.id}>
                <td>
                  <strong style={{ fontSize: '0.96rem', color: '#0F172A', display: 'block' }}>
                    {sub.subscriberName}
                  </strong>
                </td>
                <td>
                  <span style={{ fontSize: '0.84rem', color: '#F4510B', fontWeight: 700 }}>
                    {sub.type}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    <div>📍 {sub.district}</div>
                    <div>✉️ {sub.email}</div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    {sub.startDate} ते {sub.expiryDate}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0D9488' }}>
                    {sub.paymentStatus}
                  </span>
                </td>
                <td>
                  <span className={`cm-badge cm-badge-${sub.status === 'active' ? 'success' : 'neutral'}`}>
                    {sub.status === 'active' ? '● सक्रिय' : '● संपलेले'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleOpenEdit(sub)} className="cm-btn cm-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                      संपादित
                    </button>
                    <button type="button" onClick={() => handleDelete(sub.id, sub.subscriberName)} className="cm-btn cm-btn-danger" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
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
                {editingSub ? 'वर्गणीदार तपशील संपादित करा' : 'नवीन वर्गणीदार नोंदणी'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>वर्गणीदाराचे नाव *</label>
                <input type="text" required value={formData.subscriberName} onChange={(e) => setFormData({ ...formData, subscriberName: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>ईमेल *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>मोबाइल नंबर *</label>
                  <input type="tel" required value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>वर्गणी प्रकार</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="cm-input" style={{ width: '100%', background: '#FFF' }}>
                    {subTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>जिल्हा</label>
                  <input type="text" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>सुरुवात तारीख</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>समाप्ती तारीख</label>
                  <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
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
