import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function MagazineArchivePage() {
  const { issues, setIssues, addToast } = useMagazineAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('all');

  const years = [2026, 2025, 2024];

  const handleRestore = (id, title) => {
    setIssues(prev => prev.map(iss => iss.id === id ? { ...iss, status: 'published' } : iss));
    addToast(`"${title}" अंक पुन्हा सार्वजनिक प्रकाशित (Live) केला.`, 'success');
  };

  const handleDuplicate = (issue) => {
    const dup = {
      ...issue,
      id: `issue-dup-${Date.now().toString().slice(-4)}`,
      title: `${issue.title} (पुनर्मुद्रण/प्रत)`,
      status: 'draft',
      views: 0
    };
    setIssues(prev => [dup, ...prev]);
    addToast(`"${issue.title}" ची नवीन ड्राफ्ट आवृत्ती तयार केली.`, 'info');
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`तुम्हाला खात्री आहे का? "${title}" हा अंक कायमस्वरूपी हटवला जाईल.`)) {
      setIssues(prev => prev.filter(iss => iss.id !== id));
      addToast(`अंक हटवण्यात आला.`, 'error');
    }
  };

  const archivedIssues = issues.filter(iss => {
    const matchesSearch = iss.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          iss.month?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === 'all' || String(iss.year) === String(yearFilter);
    return matchesSearch && matchesYear;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            🗄️ मासिक अर्काईव्ह (Magazine Archive & Repository)
          </h1>
          <p className="cm-page-subtitle">
            मागील सर्व वर्षांचे व महिन्यांचे ऐतिहासिक अंक सुरक्षितपणे जतन करा. कोणताही जुना अंक आपोआप हटवला किंवा ओव्हरराईट केला जात नाही.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="cm-filter-bar">
        <input 
          type="text"
          className="cm-input"
          placeholder="मागील अंकाचे नाव किंवा महिना शोधा..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1 1 260px' }}
        />

        <select 
          className="cm-input"
          value={yearFilter} 
          onChange={(e) => setYearFilter(e.target.value)}
          style={{ width: 'auto' }}
        >
          <option value="all">सर्व वर्षे (All Years)</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {archivedIssues.map(iss => (
          <div key={iss.id} className="cm-card" style={{ padding: '16px', display: 'flex', gap: '16px', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}>
            <img 
              src={iss.coverImage} 
              alt={iss.title} 
              style={{ width: '85px', height: '115px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0', flexShrink: 0 }}
            />

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span className={`cm-badge cm-badge-${iss.status}`}>
                  {iss.status}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                  {iss.month} {iss.year}
                </span>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px', lineHeight: 1.3 }}>
                {iss.title}
              </h4>

              <span style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '12px' }}>
                {iss.totalPages} पृष्ठे • {iss.views?.toLocaleString() || 0} वाचक
              </span>

              <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', flexWrap: 'wrap' }}>
                {iss.status !== 'published' && (
                  <button 
                    onClick={() => handleRestore(iss.id, iss.title)}
                    className="cm-btn cm-btn-secondary cm-btn-sm"
                  >
                    पुनर्प्रकाशित करा
                  </button>
                )}

                <button 
                  onClick={() => handleDuplicate(iss)}
                  className="cm-btn cm-btn-secondary cm-btn-sm"
                  title="नवीन ड्राफ्ट म्हणून कॉपी करा"
                >
                  कॉपी करा
                </button>

                <button 
                  onClick={() => handleDelete(iss.id, iss.title)}
                  className="cm-btn cm-btn-danger cm-btn-sm"
                >
                  हटवा
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {archivedIssues.length === 0 && (
        <div className="cm-card" style={{ textAlign: 'center', padding: '48px 24px', color: '#64748B' }}>
          <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>कोणतेही जुने किंवा अर्काईव्ह अंक सापडले नाहीत.</p>
        </div>
      )}
    </div>
  );
}
