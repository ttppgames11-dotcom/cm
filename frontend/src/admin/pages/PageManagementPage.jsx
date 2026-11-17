import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function PageManagementPage() {
  const { pages, setPages, addToast } = useMagazineAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);

  const initialForm = {
    pageNo: pages.length + 1,
    title: '',
    category: 'विशेषांक',
    image: '/assets/images/user-yuva-udyojak-visheshank.jpg',
    desc: '',
    status: 'published'
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setEditingPage(null);
    setFormData({ ...initialForm, pageNo: pages.length + 1 });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingPage(p);
    setFormData({ ...p });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPage) {
      setPages(prev => prev.map(p => p.pageNo === editingPage.pageNo ? { ...formData } : p));
      addToast(`पान क्र. ${formData.pageNo} अद्ययावत केले.`, 'success');
    } else {
      setPages(prev => [...prev, { ...formData }]);
      addToast(`नवीन पृष्ठ (पान क्र. ${formData.pageNo}) यशस्वीरीत्या जोडले.`, 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (pageNo) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? पान क्र. ${pageNo} हटवले जाईल.`)) {
      setPages(prev => prev.filter(p => p.pageNo !== pageNo).map((p, i) => ({ ...p, pageNo: i + 1 })));
      addToast(`पृष्ठ हटवून उर्वरित पानांचे क्रमांक पुन्हा जुळवले.`, 'info');
    }
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    const newPages = [...pages];
    const temp = newPages[index];
    newPages[index] = newPages[targetIndex];
    newPages[targetIndex] = temp;

    const reordered = newPages.map((p, i) => ({ ...p, pageNo: i + 1 }));
    setPages(reordered);
    addToast('पृष्ठांचा क्रम बदलला.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            📑 पृष्ठ व्यवस्थापन (Page Management)
          </h1>
          <p className="cm-page-desc">
            मासिकातील पानांची संख्या डायनॅमिकपणे नियंत्रित करा. पृष्ठे जोडा, हटवा, क्रम बदला आणि प्रतिमा बदला.
          </p>
        </div>

        <button type="button" onClick={handleOpenAdd} className="cm-btn cm-btn-primary">
          <span>+ नवीन पृष्ठ जोडा (Add Page)</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '20px' }}>
        {pages.map((p, idx) => (
          <div key={p.pageNo} className="cm-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', height: '210px', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px', border: '1px solid #E2E8F0' }}>
              <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: '#F4510B',
                color: '#FFF',
                padding: '4px 10px',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '0.8rem'
              }}>
                पान {p.pageNo}
              </span>
              <span style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#FFF',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                {p.category}
              </span>
            </div>

            <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
              {p.title}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 16px', flex: 1 }}>
              {p.desc}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  type="button" 
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '5px 9px', borderRadius: '6px', cursor: idx === 0 ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}
                  title="डावीकडे / वर सरकवा"
                >
                  ◀
                </button>
                <button 
                  type="button" 
                  disabled={idx === pages.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', padding: '5px 9px', borderRadius: '6px', cursor: idx === pages.length - 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}
                  title="उजवीकडे / खाली सरकवा"
                >
                  ▶
                </button>
              </div>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button type="button" onClick={() => handleOpenEdit(p)} className="cm-btn cm-btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                  संपादित
                </button>
                <button type="button" onClick={() => handleDelete(p.pageNo)} className="cm-btn cm-btn-danger" style={{ padding: '6px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                  हटवा
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="cm-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="cm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingPage ? `पान क्र. ${editingPage.pageNo} संपादित करा` : 'नवीन पृष्ठ जोडा'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>पान क्र. *</label>
                  <input type="number" required value={formData.pageNo} onChange={(e) => setFormData({ ...formData, pageNo: parseInt(e.target.value) || 1 })} className="cm-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>पृष्ठ शीर्षक *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>विभाग / श्रेणी</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>पृष्ठ इमेज पथ *</label>
                <input type="text" required value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>पृष्ठाचे संक्षिप्त वर्णन</label>
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
