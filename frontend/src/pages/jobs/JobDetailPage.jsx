import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { timeAgo } from '../community/bloodHelp';
import { STATE_LABELS, closesInText, applyButton, whatsappLink } from './jobsHelp';
import JobApplyModal from './JobApplyModal';

const BUTTON_TEXT = { apply: 'अर्ज करा 🚀', login: 'सामील व्हा / लॉगिन करा व अर्ज करा', applied: '✅ अर्ज केला', own: 'तुमची जाहिरात', closed: '🔒 जागा बंद' };
const backLink = { display: 'inline-block', marginTop: '18px', color: '#C73800', fontWeight: 700, textDecoration: 'none' };

// One job, opened from a shared WhatsApp link: apply and share again; a closed job says so.
export default function JobDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const loggedIn = !!user;
  const navigate = useNavigate();
  const [job, setJob] = useState(undefined);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setJob(await apiClient.getJob(id));
    } catch (err) {
      setJob(null);
      setError(err.message || '');
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const onApply = () => {
    const kind = applyButton(job, loggedIn);
    if (kind === 'login') navigate('/login?redirect=' + encodeURIComponent(`/jobs/${id}`));
    else if (kind === 'apply') setApplying(true);
  };

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 16px' }}>
        {job === undefined && <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>लोड होत आहे... ⏳</div>}

        {job === null && (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '3rem' }}>💼</div>
            <h2 style={{ margin: '10px 0 6px' }}>ही नोकरी सापडली नाही</h2>
            {error && <p style={{ color: '#6B7280', margin: 0 }}>{error}</p>}
            <Link to="/jobs" style={backLink}>💼 अजून नोकऱ्या पहा</Link>
          </div>
        )}

        {job && (() => {
          const kind = applyButton(job, loggedIn);
          const active = kind === 'apply' || kind === 'login';
          return (
            <div style={{ background: '#fff', borderRadius: '16px', padding: 'clamp(20px, 4vw, 32px)', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
              {job.state !== 'open' && (
                <div role="status" style={{ background: '#FEF3C7', color: '#92400E', padding: '10px 14px', borderRadius: '8px', fontWeight: 700, marginBottom: '16px' }}>
                  🔒 ही जागा आता बंद आहे ({STATE_LABELS[job.state] || job.state})
                </div>
              )}
              <h1 style={{ margin: '0 0 6px', fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', color: '#1F2937' }}>{job.title}</h1>
              <div style={{ color: '#C73800', fontWeight: 700, marginBottom: '14px' }}>🏢 {job.company}</div>
              <div style={{ background: '#F9FAFB', padding: '12px 14px', borderRadius: '10px', lineHeight: 1.8, marginBottom: '16px' }}>
                <div>📍 ठिकाण: <strong>{job.district}</strong></div>
                <div>💰 पगार: <strong>{job.salary}</strong></div>
                <div>🕒 प्रकार: <strong>{job.job_type}</strong></div>
                <div>🎓 अनुभव: <strong>{job.experience}</strong></div>
                <div>🏷️ क्षेत्र: <strong>{job.category}</strong></div>
              </div>
              {job.desc && <p style={{ color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{job.desc}</p>}
              <div style={{ fontSize: '0.85rem', color: '#6B7280', margin: '12px 0' }}>
                {timeAgo(job.created_at)}{job.state === 'open' && job.closes_at ? ` · ${closesInText(job.closes_at)}` : ''}
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '18px' }}>
                {loggedIn ? (
                  <>
                    {job.phone && <div>📞 <a href={`tel:${job.phone}`} style={{ color: '#C73800', fontWeight: 700 }}>{job.phone}</a></div>}
                    {job.contact_email && <div>✉️ <a href={`mailto:${job.contact_email}`} style={{ color: '#C73800' }}>{job.contact_email}</a></div>}
                  </>
                ) : (
                  <span style={{ color: '#6B7280' }}>📞 संपर्कासाठी लॉगिन करा</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={onApply} disabled={!active}
                  style={{ background: active ? '#C73800' : '#E5E7EB', color: active ? '#fff' : '#4B5563', border: 'none', padding: '12px 22px', borderRadius: '8px', fontWeight: 800, cursor: active ? 'pointer' : 'default' }}>
                  {BUTTON_TEXT[kind]}
                </button>
                <a href={whatsappLink(job, window.location.origin)} target="_blank" rel="noopener noreferrer"
                  style={{ background: '#25D366', color: '#fff', padding: '12px 18px', borderRadius: '8px', fontWeight: 800, textDecoration: 'none' }}>
                  📲 WhatsApp शेअर
                </a>
              </div>
              <Link to="/jobs" style={backLink}>💼 अजून नोकऱ्या पहा</Link>
            </div>
          );
        })()}

        {applying && job && <JobApplyModal job={job} user={user} onClose={() => setApplying(false)} onApplied={load} />}
      </div>
    </div>
  );
}
