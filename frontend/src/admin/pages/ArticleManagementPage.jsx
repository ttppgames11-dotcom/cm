import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function ArticleManagementPage() {
  const { articles, setArticles, authors, issues, addToast } = useMagazineAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [previewArticle, setPreviewArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const categories = [
    "Startup Maharashtra", "महिला उद्योजिका", "Business Blueprint", "पैसा आणि प्रगती",
    "मराठा वारसा", "Future Maharashtra", "युवा करिअर & Tech", "जिल्हा उद्योग संगम", "ॲग्रो-टेक क्रांती", "Success Stories"
  ];

  const initialForm = {
    title: '',
    shortDesc: '',
    content: '',
    category: 'Startup Maharashtra',
    authorId: authors[0]?.id || '',
    issueId: issues[0]?.id || '',
    featuredImage: '/assets/images/startup-maharashtra-hd.jpg',
    publishDate: new Date().toISOString().split('T')[0],
    status: 'published',
    readTime: '५ मिनिटे',
    pageNo: 2
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (art) => {
    setEditingArticle(art);
    setFormData({
      title: art.title,
      shortDesc: art.shortDesc,
      content: art.content,
      category: art.category,
      authorId: art.authorId,
      issueId: art.issueId,
      featuredImage: art.featuredImage,
      publishDate: art.publishDate,
      status: art.status,
      readTime: art.readTime,
      pageNo: art.pageNo
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const authorObj = authors.find(a => a.id === formData.authorId);
    const authorName = authorObj ? authorObj.name : 'संपादकीय मंडळ';

    if (editingArticle) {
      setArticles(prev => prev.map(item => item.id === editingArticle.id ? {
        ...item,
        ...formData,
        authorName,
        revisions: [
          ...(item.revisions || []),
          { date: new Date().toISOString().split('T')[0], author: 'प्रशासक', note: 'लेखात सुधारणा करण्यात आली.' }
        ]
      } : item));
      addToast(`"${formData.title}" लेख यशस्वीरीत्या अद्ययावत केला.`, 'success');
    } else {
      const newArt = {
        id: `art-${Date.now().toString().slice(-4)}`,
        ...formData,
        authorName,
        views: 0,
        likes: 0,
        revisions: [
          { date: new Date().toISOString().split('T')[0], author: authorName, note: 'नवीन लेख तयार केला.' }
        ]
      };
      setArticles(prev => [newArt, ...prev]);
      addToast(`नवीन लेख "${formData.title}" यशस्वीरीत्या जोडला.`, 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? "${title}" हा लेख कायमस्वरूपी हटवला जाईल.`)) {
      setArticles(prev => prev.filter(item => item.id !== id));
      addToast(`"${title}" लेख हटवण्यात आला.`, 'error');
    }
  };

  const filteredArticles = articles.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || art.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || art.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            ✍️ संपादकीय लेख व्यवस्थापन (Articles Management)
          </h1>
          <p className="cm-page-desc">
            १० संपादकीय स्तंभांमधील लेख, लेखक श्रेय, मजकूर संपादन, पान वाटप व पुनरावलोकन इतिहास नियंत्रित करा.
          </p>
        </div>

        <button type="button" onClick={handleOpenCreate} className="cm-btn cm-btn-primary">
          <span>+ नवीन लेख जोडा (Add Article)</span>
        </button>
      </div>

      <div className="cm-filter-bar">
        <input 
          type="text"
          placeholder="लेखाचे नाव किंवा लेखक शोधा..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="cm-input"
          style={{ flex: '1 1 260px' }}
        />

        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="cm-input"
          style={{ background: '#FFF' }}
        >
          <option value="all">सर्व विभाग (All Categories)</option>
          {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="cm-input"
          style={{ background: '#FFF' }}
        >
          <option value="all">सर्व स्थिती (All Status)</option>
          <option value="published">प्रकाशित (Published)</option>
          <option value="pending">प्रलंबित (Pending)</option>
          <option value="draft">मसुदा (Draft)</option>
        </select>
      </div>

      <div className="cm-table-container">
        <table className="cm-table">
          <thead>
            <tr>
              <th>छायाचित्र</th>
              <th>लेखाचे शीर्षक व विभाग</th>
              <th>लेखक (Author)</th>
              <th>अंक व पृष्ठ क्र.</th>
              <th>वाचन वेळ</th>
              <th>स्थिती</th>
              <th>कृती (Actions)</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map(art => (
              <tr key={art.id}>
                <td style={{ width: '70px' }}>
                  <img 
                    src={art.featuredImage} 
                    alt={art.title} 
                    style={{ width: '60px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                  />
                </td>
                <td>
                  <strong style={{ display: 'block', fontSize: '0.94rem', color: '#0F172A', marginBottom: '3px' }}>
                    {art.title}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#F4510B', fontWeight: 700 }}>
                    🏷️ {art.category}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.86rem', color: '#1E293B', fontWeight: 600 }}>
                    {art.authorName}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.84rem', color: '#64748B' }}>
                    पान {art.pageNo || '-'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    ⏱️ {art.readTime}
                  </span>
                </td>
                <td>
                  <span className={`cm-badge cm-badge-${art.status}`}>
                    {art.status === 'published' ? '● प्रकाशित' : art.status === 'pending' ? '● पुनरावलोकन' : '● मसुदा'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => setPreviewArticle(art)} className="cm-btn cm-btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                      पहा
                    </button>
                    <button type="button" onClick={() => handleOpenEdit(art)} className="cm-btn cm-btn-secondary" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
                      संपादित
                    </button>
                    <button type="button" onClick={() => handleDelete(art.id, art.title)} className="cm-btn cm-btn-danger" style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
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
          <div className="cm-modal-card" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingArticle ? 'लेख संपादित करा' : 'नवीन लेख जोडा'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>लेखाचे मुख्य शीर्षक *</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>संपादकीय स्तंभ *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="cm-input" style={{ width: '100%', background: '#FFF' }}>
                    {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>लेखक (Author Attribution) *</label>
                  <select value={formData.authorId} onChange={(e) => setFormData({ ...formData, authorId: e.target.value })} className="cm-input" style={{ width: '100%', background: '#FFF' }}>
                    {authors.map(a => <option key={a.id} value={a.id}>{a.name} ({a.district})</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>मासिक अंक</label>
                  <select value={formData.issueId} onChange={(e) => setFormData({ ...formData, issueId: e.target.value })} className="cm-input" style={{ width: '100%', background: '#FFF' }}>
                    {issues.map(iss => <option key={iss.id} value={iss.id}>{iss.month} {iss.year}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>नियत पृष्ठ क्र.</label>
                  <input type="number" value={formData.pageNo} onChange={(e) => setFormData({ ...formData, pageNo: parseInt(e.target.value) || 1 })} className="cm-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>स्थिती</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="cm-input" style={{ width: '100%', background: '#FFF' }}>
                    <option value="draft">मसुदा (Draft)</option>
                    <option value="pending">प्रलंबित (Pending)</option>
                    <option value="published">प्रकाशित (Published)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>फिचर्ड इमेज पथ</label>
                <input type="text" value={formData.featuredImage} onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>संक्षिप्त सारांश *</label>
                <textarea rows="2" required value={formData.shortDesc} onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>संपूर्ण मजकूर *</label>
                <textarea rows="6" required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="cm-input" style={{ width: '100%', lineHeight: 1.6 }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="cm-btn cm-btn-secondary">रद्द करा</button>
                <button type="submit" className="cm-btn cm-btn-primary">जतन करा</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewArticle && (
        <div className="cm-modal-backdrop" onClick={() => setPreviewArticle(null)}>
          <div className="cm-modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className={`cm-badge cm-badge-${previewArticle.status}`}>
                {previewArticle.category}
              </span>
              <button type="button" onClick={() => setPreviewArticle(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <img src={previewArticle.featuredImage} alt={previewArticle.title} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '12px', marginBottom: '16px' }} />

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: '0 0 8px', lineHeight: 1.3 }}>
              {previewArticle.title}
            </h2>

            <div style={{ display: 'flex', gap: '14px', fontSize: '0.82rem', color: '#64748B', marginBottom: '16px' }}>
              <span>✍️ {previewArticle.authorName}</span>
              <span>📅 {previewArticle.publishDate}</span>
              <span>⏱️ {previewArticle.readTime}</span>
            </div>

            <p style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.6, background: '#F8FAFC', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #F4510B', marginBottom: '18px' }}>
              {previewArticle.shortDesc}
            </p>

            <div style={{ color: '#1E293B', fontSize: '0.92rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {previewArticle.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
