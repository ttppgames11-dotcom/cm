import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function ApprovalWorkflowPage() {
  const { approvals, setApprovals, addToast } = useMagazineAdmin();
  const [selectedAppr, setSelectedAppr] = useState(null);
  const [reviewNote, setReviewNote] = useState('');

  const workflowStages = [
    "Article Submission", "Editor Review", "Fact Check", "Approval",
    "Page Assignment", "Magazine Designing", "Proofreading", "Publisher Approval",
    "Publish Magazine", "Export Print PDF", "Archive Issue"
  ];

  const handleStageAdvance = (id, nextStage) => {
    setApprovals(prev => prev.map(a => a.id === id ? {
      ...a,
      currentStage: nextStage,
      status: nextStage === 'Publish Magazine' || nextStage === 'Approval' ? 'approved' : 'pending'
    } : a));
    addToast(`मंजुरी टप्पा पुढे सरकवून "${nextStage}" करण्यात आला.`, 'success');
  };

  const handleReject = (id) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    addToast('लेख पुनरावलोकनासाठी परत पाठवला.', 'error');
  };

  const handleSaveNotes = (e) => {
    e.preventDefault();
    if (!selectedAppr) return;
    setApprovals(prev => prev.map(a => a.id === selectedAppr.id ? { ...a, editorNotes: reviewNote } : a));
    addToast('संपादकीय अभिप्राय जतन केला.', 'success');
    setSelectedAppr(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            🛡️ संपादकीय मंजुरी कार्यप्रवाह (Approval Workflow)
          </h1>
          <p className="cm-page-desc">
            लेख सादरीकरण ➔ संपादक पुनरावलोकन ➔ तथ्य तपासणी ➔ अंतिम मंजुरी ➔ मॅगझिन डिझाइनिंग ➔ प्रकाशन असा संपूर्ण ११-टप्प्यांचा कार्यप्रवाह.
          </p>
        </div>
      </div>

      {/* Visual Workflow Steps Strip */}
      <div className="cm-card" style={{ padding: '18px 20px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '980px' }}>
          {workflowStages.map((st, i) => (
            <React.Fragment key={i}>
              <div style={{
                padding: '7px 14px',
                borderRadius: '8px',
                background: i <= 3 ? '#FFF4ED' : '#F8FAFC',
                border: i <= 3 ? '1.5px solid #FFD4C2' : '1px solid #E2E8F0',
                fontSize: '0.76rem',
                fontWeight: 700,
                color: i <= 3 ? '#F4510B' : '#64748B',
                whiteSpace: 'nowrap'
              }}>
                {i + 1}. {st}
              </div>
              {i < workflowStages.length - 1 && <span style={{ color: '#CBD5E1', fontSize: '0.8rem' }}>➔</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="cm-table-container">
        <table className="cm-table">
          <thead>
            <tr>
              <th>लेखाचे शीर्षक व विभाग</th>
              <th>लेखक (Author)</th>
              <th>सादरीकरण तारीख</th>
              <th>लक्ष्य मासिक अंक</th>
              <th>सध्याचा टप्पा (Stage)</th>
              <th>संपादकीय टीप (Notes)</th>
              <th>कृती (Actions)</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map(app => (
              <tr key={app.id}>
                <td>
                  <strong style={{ fontSize: '0.94rem', color: '#0F172A', display: 'block', marginBottom: '2px' }}>
                    {app.articleTitle}
                  </strong>
                  <span style={{ fontSize: '0.76rem', color: '#F4510B', fontWeight: 700 }}>
                    {app.category}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.86rem', color: '#1E293B', fontWeight: 600 }}>
                    {app.author}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    {app.submittedDate}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: 600 }}>
                    {app.targetIssue}
                  </span>
                </td>
                <td>
                  <span className={`cm-badge cm-badge-${app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}`}>
                    {app.currentStage}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: '#475569', maxWidth: '240px', display: 'block' }}>
                    {app.editorNotes}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      onClick={() => handleStageAdvance(app.id, 'Page Assignment')} 
                      className="cm-btn cm-btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                    >
                      मंजूर करा ✓
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedAppr(app);
                        setReviewNote(app.editorNotes || '');
                      }} 
                      className="cm-btn cm-btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                    >
                      अभिप्राय
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleReject(app.id)} 
                      className="cm-btn cm-btn-danger" 
                      style={{ padding: '6px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                    >
                      परत पाठवा
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAppr && (
        <div className="cm-modal-backdrop" onClick={() => setSelectedAppr(null)}>
          <div className="cm-modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>संपादकीय अभिप्राय जोडा</h3>
              <button type="button" onClick={() => setSelectedAppr(null)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleSaveNotes} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <strong style={{ fontSize: '0.94rem', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                  {selectedAppr.articleTitle}
                </strong>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>लेखक: {selectedAppr.author}</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  तपासणी अभिप्राय / सूचना (Review Notes) *
                </label>
                <textarea 
                  rows="4" 
                  required
                  value={reviewNote} 
                  onChange={(e) => setReviewNote(e.target.value)} 
                  className="cm-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedAppr(null)} className="cm-btn cm-btn-secondary">रद्द करा</button>
                <button type="submit" className="cm-btn cm-btn-primary">अभिप्राय जतन करा</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
