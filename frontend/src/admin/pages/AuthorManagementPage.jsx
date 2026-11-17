import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function AuthorManagementPage() {
  const { authors, setAuthors, addToast } = useMagazineAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const initialForm = {
    name: '',
    designation: '',
    district: 'पुणे',
    email: '',
    mobile: '',
    bio: '',
    avatar: '/assets/images/user-yuva-udyojak-visheshank.jpg',
    status: 'active'
  };

  const [formData, setFormData] = useState(initialForm);

  const districts = [
    "पुणे", "मुंबई", "ठाणे", "कोल्हापूर", "सातारा", "सांगली", "नाशिक", "छत्रपती संभाजीनगर", 
    "सोलापूर", "नागपूर", "अमरावती", "जळगाव", "नांदेड", "लातूर", "अहमदनगर", "रत्नागिरी", "सिंधुदुर्ग"
  ];

  const handleOpenCreate = () => {
    setEditingAuthor(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (author) => {
    setEditingAuthor(author);
    setFormData({ ...author });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAuthor) {
      setAuthors(prev => prev.map(a => a.id === editingAuthor.id ? { ...a, ...formData } : a));
      addToast(`"${formData.name}" लेखकाची माहिती अद्ययावत केली.`, 'success');
    } else {
      const newAuth = {
        id: `auth-${Date.now().toString().slice(-4)}`,
        ...formData,
        articlesCount: 0
      };
      setAuthors(prev => [...prev, newAuth]);
      addToast(`नवीन लेखक "${formData.name}" जोडण्यात आले.`, 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? "${name}" यांचे प्रोफाइल हटवले जाईल.`)) {
      setAuthors(prev => prev.filter(a => a.id !== id));
      addToast(`"${name}" यांना हटवण्यात आले.`, 'error');
    }
  };

  const filteredAuthors = authors.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.designation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            👥 लेखक व जिल्हा प्रतिनिधी (Authors & Contributors)
          </h1>
          <p className="cm-page-desc">
            मासिकातील स्तंभलेखक, मुख्य संपादक व ३६ जिल्ह्यांमधील प्रतिनिधींचे प्रोफाइल व योगदान नियंत्रित करा.
          </p>
        </div>

        <button type="button" onClick={handleOpenCreate} className="cm-btn cm-btn-primary">
          <span>+ नवीन लेखक नोंदणी (Add Author)</span>
        </button>
      </div>

      <div className="cm-filter-bar">
        <input 
          type="text"
          placeholder="नाव, जिल्हा किंवा पद शोधा..."
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
              <th>प्रोफाइल</th>
              <th>नाव व पद</th>
              <th>जिल्हा (District)</th>
              <th>संपर्क (Email & Phone)</th>
              <th>योगदान</th>
              <th>स्थिती</th>
              <th>कृती (Actions)</th>
            </tr>
          </thead>
          <tbody>
            {filteredAuthors.map(auth => (
              <tr key={auth.id}>
                <td style={{ width: '60px' }}>
                  <img src={auth.avatar} alt={auth.name} style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #FFD4C2' }} />
                </td>
                <td>
                  <strong style={{ display: 'block', fontSize: '0.94rem', color: '#0F172A', marginBottom: '2px' }}>
                    {auth.name}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#F4510B', fontWeight: 700 }}>
                    {auth.designation}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.86rem', color: '#334155', fontWeight: 600 }}>
                    📍 {auth.district}
                  </span>
                </td>
                <td>
                  <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                    <div>✉️ {auth.email}</div>
                    <div>📞 {auth.mobile}</div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                    {auth.articlesCount || 0} लेख
                  </span>
                </td>
                <td>
                  <span className={`cm-badge cm-badge-${auth.status === 'active' ? 'success' : 'neutral'}`}>
                    {auth.status === 'active' ? '● सक्रिय' : '● निष्क्रिय'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => handleOpenEdit(auth)} className="cm-btn cm-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                      संपादित
                    </button>
                    <button type="button" onClick={() => handleDelete(auth.id, auth.name)} className="cm-btn cm-btn-danger" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
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
                {editingAuthor ? 'लेखक माहिती संपादित करा' : 'नवीन लेखक / प्रतिनिधी नोंदणी'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>पूर्ण नाव *</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>पद / भूमिका (Designation) *</label>
                  <input type="text" required placeholder="उदा. जिल्हा प्रतिनिधी / स्तंभलेखक" value={formData.designation} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>जिल्हा (District) *</label>
                  <select value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="cm-input" style={{ width: '100%', background: '#FFF' }}>
                    {districts.map((d, i) => <option key={i} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>ईमेल *</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>मोबाइल नंबर *</label>
                  <input type="tel" required value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>बायो व अनुभव (Bio)</label>
                <textarea rows="3" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
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
