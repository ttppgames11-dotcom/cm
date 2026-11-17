import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function MonthlyIssueManagementPage() {
  const { issues, setIssues, addToast } = useMagazineAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const initialFormState = {
    title: '',
    month: 'जानेवारी',
    year: 2027,
    volume: 'वर्ष ३',
    issueNo: 'अंक १',
    publishDate: '2027-01-01',
    description: '',
    coverImage: '/assets/images/user-yuva-udyojak-visheshank.jpg',
    status: 'draft',
    totalPages: 10
  };
  const [formData, setFormData] = useState(initialFormState);

  const months = ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'];

  const handleOpenCreate = () => {
    setEditingIssue(null);
    setFormData(initialFormState);
    setModalOpen(true);
  };

  const handleOpenEdit = (issue) => {
    setEditingIssue(issue);
    setFormData({
      title: issue.title,
      month: issue.month,
      year: issue.year,
      volume: issue.volume,
      issueNo: issue.issueNo,
      publishDate: issue.publishDate,
      description: issue.description,
      coverImage: issue.coverImage,
      status: issue.status,
      totalPages: issue.totalPages
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingIssue) {
      setIssues(prev => prev.map(item => item.id === editingIssue.id ? { ...item, ...formData } : item));
      addToast(`"${formData.title}" अंकाचे तपशील यशस्वीरित्या अद्ययावत केले.`, 'success');
    } else {
      const newIssue = {
        id: `issue-${formData.year}-${Date.now().toString().slice(-4)}`,
        ...formData,
        slug: `cm-issue-${formData.month}-${formData.year}`,
        articlesCount: 0,
        views: 0,
        downloads: 0
      };
      setIssues(prev => [newIssue, ...prev]);
      addToast(`नवीन मासिक अंक "${formData.title}" यशस्वीरित्या तयार करण्यात आला.`, 'success');
    }
    setModalOpen(false);
  };

  const handleDuplicate = (issue) => {
    const duplicated = {
      ...issue,
      id: `issue-dup-${Date.now().toString().slice(-4)}`,
      title: `${issue.title} (प्रत/कॉपी)`,
      status: 'draft',
      publishDate: new Date().toISOString().split('T')[0],
      views: 0,
      downloads: 0
    };
    setIssues(prev => [duplicated, ...prev]);
    addToast(`"${issue.title}" अंकाची नवीन ड्राफ्ट प्रत तयार केली.`, 'info');
  };

  const handleStatusChange = (id, newStatus) => {
    setIssues(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    addToast(`अंकाची स्थिती बदलून "${newStatus}" केली.`, 'success');
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? "${title}" हा अंक कायमस्वरूपी हटवला जाईल.`)) {
      setIssues(prev => prev.filter(item => item.id !== id));
      addToast(`"${title}" अंक हटवण्यात आला.`, 'error');
    }
  };

  const filteredIssues = issues.filter(iss => {
    const matchesSearch = iss.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          iss.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(iss.year).includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || iss.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SaaS Page Header */}
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            📖 मासिक अंक व्यवस्थापन (Monthly Issues)
          </h1>
          <p className="cm-page-desc">
            प्रत्येक महिन्याचा अंक स्वतंत्रपणे साठवला जातो. मागील आवृत्त्या ओव्हरराईट न करता अमर्याद मासिक अंक तयार करा.
          </p>
        </div>

        <button type="button" onClick={handleOpenCreate} className="cm-btn cm-btn-primary">
          <span>+ नवीन मासिक अंक तयार करा (Create Issue)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="cm-filter-bar">
        <input 
          type="text"
          placeholder="अंकाचे नाव, महिना किंवा वर्ष शोधा..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="cm-input"
          style={{ flex: '1 1 280px' }}
        />

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="cm-input"
          style={{ background: '#FFF', fontWeight: 600 }}
        >
          <option value="all">सर्व स्थिती (All Status)</option>
          <option value="published">प्रकाशित (Published - Live)</option>
          <option value="draft">मसुदा (Draft)</option>
          <option value="archived">अर्काईव्ह (Archived)</option>
        </select>
      </div>

      {/* Issues Table */}
      <div className="cm-table-container">
        <table className="cm-table">
          <thead>
            <tr>
              <th>कव्हर</th>
              <th>अंक शीर्षक व महिना</th>
              <th>व्हॉल्यूम व अंक क्र.</th>
              <th>प्रकाशन तारीख</th>
              <th>पाने व वाचक</th>
              <th>स्थिती</th>
              <th>कृती (Actions)</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map((issue) => (
              <tr key={issue.id}>
                <td style={{ width: '80px' }}>
                  <img 
                    src={issue.coverImage} 
                    alt={issue.title} 
                    style={{ width: '56px', height: '74px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'block' }}
                  />
                </td>
                <td>
                  <strong style={{ display: 'block', fontSize: '0.96rem', color: '#0F172A', marginBottom: '3px' }}>
                    {issue.title}
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#F4510B', fontWeight: 700 }}>
                    {issue.month} {issue.year}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.86rem', color: '#334155', fontWeight: 600 }}>
                    {issue.volume} • {issue.issueNo}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.84rem', color: '#64748B' }}>
                    {issue.publishDate}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.84rem', color: '#0F172A', fontWeight: 700 }}>
                    {issue.totalPages} पृष्ठे
                  </span>
                  <span style={{ display: 'block', fontSize: '0.76rem', color: '#64748B' }}>
                    {issue.views?.toLocaleString() || 0} वाचक
                  </span>
                </td>
                <td>
                  <span className={`cm-badge cm-badge-${issue.status}`}>
                    {issue.status === 'published' ? '● प्रकाशित (LIVE)' : issue.status === 'draft' ? '● मसुदा (Draft)' : '● अर्काईव्ह'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      onClick={() => handleOpenEdit(issue)} 
                      className="cm-btn cm-btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      संपादित
                    </button>

                    {issue.status !== 'published' ? (
                      <button 
                        type="button" 
                        onClick={() => handleStatusChange(issue.id, 'published')} 
                        className="cm-btn cm-btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        प्रकाशित करा
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => handleStatusChange(issue.id, 'archived')} 
                        className="cm-btn cm-btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.78rem', color: '#D97706' }}
                      >
                        अर्काईव्ह करा
                      </button>
                    )}

                    <button 
                      type="button" 
                      onClick={() => handleDuplicate(issue)} 
                      className="cm-btn cm-btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      कॉपी
                    </button>

                    <button 
                      type="button" 
                      onClick={() => handleDelete(issue.id, issue.title)} 
                      className="cm-btn cm-btn-danger"
                      style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                    >
                      हटवा
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredIssues.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  कोणताही मासिक अंक सापडला नाही.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="cm-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="cm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                {editingIssue ? 'मासिक अंक संपादित करा' : 'नवीन मासिक अंक तयार करा'}
              </h3>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)} 
                style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  अंकाचे मुख्य शीर्षक (Magazine Title) *
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="उदा. युवा उद्योजक विशेषांक"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="cm-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    महिना (Month) *
                  </label>
                  <select 
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="cm-input"
                    style={{ width: '100%', background: '#FFF' }}
                  >
                    {months.map((m, idx) => <option key={idx} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                    वर्ष (Year) *
                  </label>
                  <input 
                    type="number" 
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || 2026 })}
                    className="cm-input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>व्हॉल्यूम</label>
                  <input type="text" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>अंक क्र.</label>
                  <input type="text" value={formData.issueNo} onChange={(e) => setFormData({ ...formData, issueNo: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>प्रकाशन तारीख</label>
                  <input type="date" required value={formData.publishDate} onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })} className="cm-input" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>कव्हर इमेज URL / पथ *</label>
                <input type="text" required value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} className="cm-input" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>संक्षिप्त वर्णन</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="cm-input" style={{ width: '100%', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>स्थिती</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="cm-input" style={{ width: '100%', background: '#FFF' }}>
                    <option value="draft">मसुदा (Draft)</option>
                    <option value="published">प्रकाशित (Live)</option>
                    <option value="archived">अर्काईव्ह (Archived)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>एकूण पृष्ठे</label>
                  <input type="number" value={formData.totalPages} onChange={(e) => setFormData({ ...formData, totalPages: parseInt(e.target.value) || 10 })} className="cm-input" style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
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
