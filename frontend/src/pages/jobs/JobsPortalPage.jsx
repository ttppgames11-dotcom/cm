import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/apiClient';
import { MAHARASHTRA_DISTRICTS } from '../../services/referralService';
import { timeAgo, toMarathiDigits } from '../community/bloodHelp';
import {
  APPLICATION_STATUSES, STATE_LABELS, closesInText, applyButton, whatsappLink, jobPayload, statusInfo
} from './jobsHelp';
import JobApplyModal from './JobApplyModal';

const CATEGORIES = ['IT & Software', 'Finance & Accounts', 'Manufacturing', 'Marketing & Sales', 'सामान्य'];
const TABS = [
  { id: 'all', label: 'सर्व नोकऱ्या' },
  { id: 'mine', label: 'माझ्या जाहिराती' },
  { id: 'applied', label: 'माझे अर्ज' }
];
const input = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontFamily: 'inherit', boxSizing: 'border-box' };
const label = { display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' };
const card = { background: '#fff', borderRadius: '16px', padding: '22px', border: '1px solid #E5E7EB', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' };
const primary = { background: '#C73800', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: '6px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' };
const secondary = { background: '#F3F4F6', border: 'none', color: '#374151', padding: '8px 14px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' };
const errorBox = { background: '#FEF2F2', color: '#B91C1C', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.9rem' };

const QUICK_CARDS = [
  { img: '/assets/images/radar-jobs-card.jpg', alt: 'IT & Corporate Jobs', color: '#EA580C', tag: '💻 IT & सॉफ्टवेअर', title: 'आयटी व कॉर्पोरेट नोकऱ्या', sub: 'पुणे, मुंबई व हायब्रिड कंपन्या' },
  { img: '/assets/images/radar-customers-card.jpg', alt: 'Retail & Sales', color: '#15803D', tag: '🏢 सेल्स व ग्राहक सेवा', title: 'मार्केटिंग व रिटेल शोरूम', sub: 'थेट ग्राहक समन्वय व इन्सेंटिव्ह' },
  { img: '/assets/images/radar-b2b-card.jpg', alt: 'Manufacturing & Core Engg', color: '#C2410C', tag: '⚙️ MIDC मॅन्युफॅक्चरिंग', title: 'इंजिनिअरिंग व उत्पादन', sub: 'चाकण, भोसरी, तळोजा कारखाने' },
  { img: '/assets/images/radar-education-card.jpg', alt: 'Scholarships & Freshers', color: '#7C2D12', tag: '🎓 शिक्षण व Internships', title: 'फ्रेशर्स व शिष्यवृत्ती', sub: 'कॉलेज विद्यार्थी व करिअर मार्गदर्शन' }
];

const STATE_COLORS ={ open: ['#F0FDF4', '#166534'], expired: ['#FEF3C7', '#92400E'], closed: ['#F3F4F6', '#4B5563'] };

function StateBadge({ state }) {
  const [bg, fg] = STATE_COLORS[state] || STATE_COLORS.closed;
  return <span style={{ background: bg, color: fg, padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>{STATE_LABELS[state] || state}</span>;
}

function emptyJobForm(user) {
  return {
    title: '', company: user?.business || '', district: 'पुणे', category: 'सामान्य', salary: '', job_type: 'Full-time',
    experience: '', desc: '', contact_email: user?.email || '', phone: user?.phone || ''
  };
}

export default function JobsPortalPage() {
  const { user } = useAuth();
  const loggedIn = !!user;
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = TABS.some((t) => t.id === params.get('tab')) ? params.get('tab') : 'all';

  const [stats, setStats] = useState({ open_jobs: 0, hired: 0 });
  const [jobs, setJobs] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [applyingJob, setApplyingJob] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState(() => emptyJobForm(user));
  const [postError, setPostError] = useState('');
  const [posting, setPosting] = useState(false);

  const loginFirst = (to = '/jobs') => navigate('/login?redirect=' + encodeURIComponent(to));
  const openTab = (id) => setParams(id === 'all' ? {} : { tab: id });

  const loadStats = useCallback(() => {
    apiClient.getJobStats().then(setStats).catch(() => {});
  }, []);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      setJobs(await apiClient.getJobs({
        category: selectedCat !== 'all' ? selectedCat : '',
        district: selectedDistrict !== 'सर्व' ? selectedDistrict : '',
        search
      }));
    } catch (err) {
      setListError(err.message || 'नोकऱ्या लोड करता आल्या नाहीत.');
    } finally {
      setLoading(false);
    }
    // search is applied with the button, not on every key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCat, selectedDistrict]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (tab === 'all') loadJobs(); }, [tab, loadJobs]);

  const openPostForm = () => {
    if (!loggedIn) return loginFirst();
    setPostForm(emptyJobForm(user));
    setPostError('');
    setShowPostModal(true);
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostError('');
    setPosting(true);
    try {
      await apiClient.postJob(jobPayload(postForm));
      setShowPostModal(false);
      loadStats();
      openTab('mine');
    } catch (err) {
      setPostError(err.message || 'जाहिरात प्रसिद्ध करता आली नाही.');
    } finally {
      setPosting(false);
    }
  };

  const onApplyClick = (job) => {
    const kind = applyButton(job, loggedIn);
    if (kind === 'login') loginFirst();
    else if (kind === 'apply') setApplyingJob(job);
  };

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>

        {/* Banner */}
        <div style={{
          background: "url('/assets/images/hero-cinematic-bg.jpg') center/cover no-repeat",
          borderRadius: '16px', color: '#fff', padding: 'clamp(18px, 4vw, 32px)', marginBottom: '20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
          boxShadow: '0 10px 25px rgba(199,56,0,0.2)'
        }}>
          <div>
            <span style={{ background: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
              💼 रोजगार, करिअर व युवा सक्षमीकरण
            </span>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', margin: '10px 0 6px', fontFamily: 'Baloo 2', textShadow: '0 2px 10px rgba(0,0,0,0.7)', wordBreak: 'break-word' }}>
              मराठा करिअर व नोकरी संधी केंद्र (Jobs Portal)
            </h1>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
              <span style={{ background: 'rgba(0,0,0,0.45)', padding: '6px 12px', borderRadius: '8px', fontWeight: 800 }}>
                🎉 {toMarathiDigits(stats.hired)} सदस्यांना नोकरी मिळाली
              </span>
              <span style={{ background: 'rgba(0,0,0,0.45)', padding: '6px 12px', borderRadius: '8px', fontWeight: 800 }}>
                📋 {toMarathiDigits(stats.open_jobs)} खुल्या जागा
              </span>
            </div>
          </div>
          <button onClick={openPostForm} className="btn btn-primary"
            style={{ background: '#fff', color: '#C73800', border: 'none', padding: '12px 24px', fontWeight: 800, borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
            + नोकरी जाहिरात द्या
          </button>
        </div>

        {/* Tabs */}
        <div role="tablist" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => openTab(t.id)}
              style={{
                padding: '10px 18px', borderRadius: '999px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
                border: tab === t.id ? '2px solid #C73800' : '1px solid #E5E7EB',
                background: tab === t.id ? '#C73800' : '#fff', color: tab === t.id ? '#fff' : '#431407'
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'all' && (
          <>
            {/* 4 Category Quick Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px', marginBottom: '24px' }}>
              {QUICK_CARDS.map((c) => (
                <div key={c.img} style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflow: 'hidden', boxShadow: '0 4px 12px rgba(67, 20, 7, 0.05)' }}>
                  <div style={{ height: '110px', position: 'relative', overflow: 'hidden' }}>
                    <img src={c.img} alt={c.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(67, 20, 7, 0.75) 100%)' }} />
                    <span style={{ position: 'absolute', bottom: '8px', left: '10px', background: c.color, color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900 }}>
                      {c.tag}
                    </span>
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <h4 style={{ margin: '0 0 2px', fontSize: '1rem', color: '#431407', fontWeight: 800 }}>{c.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '18px 24px', border: '1px solid #E5E7EB', marginBottom: '24px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input type="text" placeholder="पदवी, कौशल्य किंवा कंपनी शोधा..." value={search}
                onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') loadJobs(); }}
                style={{ flex: 2, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
              <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}
                style={{ flex: 1, minWidth: '160px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff' }}>
                <option value="all">सर्व क्षेत्रे</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{ flex: 1, minWidth: '140px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff' }}>
                <option value="सर्व">सर्व जिल्हे</option>
                {MAHARASHTRA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <button onClick={loadJobs} style={{ ...primary, padding: '10px 20px' }}>शोधा 🔍</button>
            </div>

            {listError && <div role="alert" style={errorBox}>{listError}</div>}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>नोकऱ्या लोड होत आहेत... ⏳</div>
            ) : jobs.length === 0 ? (
              <div style={{ ...card, padding: '60px', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💼</div>
                <h2 style={{ margin: '0 0 8px' }}>सध्या कोणतीही खुली जागा नाही</h2>
                <p style={{ margin: 0 }}>वेगळा जिल्हा किंवा शब्द निवडून पहा, किंवा स्वतः जाहिरात द्या!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '20px', marginBottom: '40px' }}>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} loggedIn={loggedIn} onApply={() => onApplyClick(job)} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'mine' && (loggedIn ? <MyJobs onChanged={loadStats} /> : <LoginPrompt onLogin={() => loginFirst('/jobs?tab=mine')} />)}
        {tab === 'applied' && (loggedIn ? <MyApplications /> : <LoginPrompt onLogin={() => loginFirst('/jobs?tab=applied')} />)}

        {applyingJob && (
          <JobApplyModal job={applyingJob} user={user} onClose={() => setApplyingJob(null)} onApplied={loadJobs} />
        )}

        {/* Modal: Post Job */}
        {showPostModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '560px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#C73800' }}>📢 नोकरी जाहिरात प्रसिद्ध करा</h3>
                <button onClick={() => setShowPostModal(false)} aria-label="बंद करा" style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
              </div>
              <form onSubmit={handlePostSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={label}>पदाचे नाव (Job Title) *</label>
                  <input type="text" required minLength={2} maxLength={100} value={postForm.title} placeholder="उदा. सिनियर अकाउंटंट, CNC ऑपरेटर"
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} style={input} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={label}>कंपनी / उद्योग नाव *</label>
                    <input type="text" required minLength={2} maxLength={100} value={postForm.company}
                      onChange={(e) => setPostForm({ ...postForm, company: e.target.value })} style={input} />
                  </div>
                  <div>
                    <label style={label}>जिल्हा *</label>
                    <select required value={postForm.district} onChange={(e) => setPostForm({ ...postForm, district: e.target.value })} style={{ ...input, background: '#fff' }}>
                      {MAHARASHTRA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={label}>क्षेत्र</label>
                    <select value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} style={{ ...input, background: '#fff' }}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={label}>प्रकार</label>
                    <select value={postForm.job_type} onChange={(e) => setPostForm({ ...postForm, job_type: e.target.value })} style={{ ...input, background: '#fff' }}>
                      {['Full-time', 'Part-time', 'Internship', 'Contract'].map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={label}>पगार / मानधन</label>
                    <input type="text" maxLength={50} value={postForm.salary} placeholder="उदा. ₹२५,००० / महिना"
                      onChange={(e) => setPostForm({ ...postForm, salary: e.target.value })} style={input} />
                  </div>
                  <div>
                    <label style={label}>अनुभव</label>
                    <input type="text" maxLength={30} value={postForm.experience} placeholder="उदा. १-३ वर्षे"
                      onChange={(e) => setPostForm({ ...postForm, experience: e.target.value })} style={input} />
                  </div>
                  <div>
                    <label style={label}>संपर्क फोन *</label>
                    <input type="tel" required value={postForm.phone} onChange={(e) => setPostForm({ ...postForm, phone: e.target.value })} style={input} />
                  </div>
                  <div>
                    <label style={label}>संपर्क ईमेल</label>
                    <input type="email" value={postForm.contact_email} onChange={(e) => setPostForm({ ...postForm, contact_email: e.target.value })} style={input} />
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={label}>कामाचे स्वरूप व अटी</label>
                  <textarea rows="3" maxLength={1000} value={postForm.desc} placeholder="कौशल्ये, कामाचे तास आणि जबाबदाऱ्या..."
                    onChange={(e) => setPostForm({ ...postForm, desc: e.target.value })} style={input} />
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 12px' }}>जाहिरात ३० दिवस दिसेल; नंतर "माझ्या जाहिराती" मधून वाढवता येईल.</p>
                {postError && <div role="alert" style={errorBox}>{postError}</div>}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowPostModal(false)} style={secondary}>रद्द</button>
                  <button type="submit" disabled={posting} style={{ ...primary, opacity: posting ? 0.6 : 1 }}>{posting ? 'प्रसिद्ध करत आहे…' : 'प्रसिद्ध करा 📢'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoginPrompt({ onLogin }) {
  return (
    <div style={{ ...card, textAlign: 'center', padding: '48px' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🔐</div>
      <p style={{ margin: '0 0 16px', color: '#4B5563' }}>हे पाहण्यासाठी लॉगिन करा.</p>
      <button onClick={onLogin} style={primary}>लॉगिन करा</button>
    </div>
  );
}

const BUTTON_TEXT = { apply: 'अर्ज करा 🚀', login: 'अर्ज करा 🚀', applied: '✅ अर्ज केला', own: 'तुमची जाहिरात', closed: '🔒 जागा बंद' };

// One job on the board: details, contact for members, apply and WhatsApp share.
export function JobCard({ job, loggedIn, onApply }) {
  const kind = applyButton(job, loggedIn);
  const active = kind === 'apply' || kind === 'login';
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px', color: '#1F2937' }}>
              <Link to={`/jobs/${encodeURIComponent(job.id)}`} style={{ color: 'inherit', textDecoration: 'none' }}>{job.title}</Link>
            </h3>
            <div style={{ fontWeight: 600, color: '#C73800', fontSize: '0.9rem' }}>🏢 {job.company}</div>
          </div>
          <span style={{ background: '#F0FDF4', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {job.job_type || 'Full-time'}
          </span>
        </div>
        <div style={{ background: '#F9FAFB', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem', lineHeight: 1.7 }}>
          <div>📍 ठिकाण: <strong>{job.district}</strong></div>
          <div>💰 पगार: <strong>{job.salary}</strong></div>
          <div>🎓 अनुभव: <strong>{job.experience}</strong></div>
        </div>
        {job.desc && <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 12px' }}>{job.desc}</p>}
        <div style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '12px' }}>
          {timeAgo(job.created_at)}{job.closes_at ? ` · ${closesInText(job.closes_at)}` : ''}
        </div>
        <div style={{ fontSize: '0.85rem', marginBottom: '12px' }}>
          {loggedIn ? (
            <>
              {job.phone && <div>📞 <a href={`tel:${job.phone}`} style={{ color: '#C73800', fontWeight: 700 }}>{job.phone}</a></div>}
              {job.contact_email && <div>✉️ <a href={`mailto:${job.contact_email}`} style={{ color: '#C73800' }}>{job.contact_email}</a></div>}
            </>
          ) : (
            <span style={{ color: '#6B7280' }}>📞 संपर्कासाठी लॉगिन करा</span>
          )}
        </div>
      </div>
      <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <a href={whatsappLink(job, window.location.origin)} target="_blank" rel="noopener noreferrer"
          style={{ background: '#25D366', color: '#fff', padding: '8px 14px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>
          📲 WhatsApp शेअर
        </a>
        <button onClick={onApply} disabled={!active}
          style={{ ...primary, background: active ? '#C73800' : '#E5E7EB', color: active ? '#fff' : '#4B5563', cursor: active ? 'pointer' : 'default' }}>
          {BUTTON_TEXT[kind]}
        </button>
      </div>
    </div>
  );
}

// "माझ्या जाहिराती": the poster's jobs with close/extend and the applicant list.
function MyJobs({ onChanged }) {
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      setJobs(await apiClient.getMyJobs());
    } catch (err) {
      setError(err.message || 'जाहिराती लोड करता आल्या नाहीत.');
      setJobs([]);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (job, action) => {
    if (action === 'close' && !window.confirm(`"${job.title}" ही जागा बंद करायची?`)) return;
    setBusy(job.id + action);
    setError('');
    try {
      await apiClient.jobAction(job.id, action);
      await load();
      onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  if (jobs === null) return <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>लोड होत आहे... ⏳</div>;
  return (
    <div style={{ display: 'grid', gap: '16px', marginBottom: '40px' }}>
      {error && <div role="alert" style={errorBox}>{error}</div>}
      {jobs.length === 0 && <div style={{ ...card, textAlign: 'center', padding: '48px', color: '#666' }}>तुम्ही अजून नोकरी जाहिरात दिलेली नाही.</div>}
      {jobs.map((job) => (
        <div key={job.id} style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem' }}>
                <Link to={`/jobs/${encodeURIComponent(job.id)}`} style={{ color: '#1F2937', textDecoration: 'none' }}>{job.title}</Link>
              </h3>
              <div style={{ color: '#C73800', fontWeight: 600, fontSize: '0.9rem' }}>🏢 {job.company} · {job.district}</div>
              <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '6px' }}>
                <StateBadge state={job.state} />{job.state === 'open' && job.closes_at ? ` ${closesInText(job.closes_at)}` : ''}
                {job.hidden && <span style={{ marginLeft: '8px', color: '#B91C1C', fontWeight: 700 }}>(प्रशासकाने लपवली)</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(job.state === 'open' || job.state === 'expired') && (
                <button onClick={() => act(job, 'extend')} disabled={!!busy} style={secondary}>+३० दिवस</button>
              )}
              {(job.state === 'open' || job.state === 'expired') && (
                <button onClick={() => act(job, 'close')} disabled={!!busy} style={{ ...secondary, color: '#B91C1C' }}>जागा बंद करा</button>
              )}
            </div>
          </div>
          <button onClick={() => setOpenId(openId === job.id ? null : job.id)} aria-expanded={openId === job.id}
            style={{ ...secondary, marginTop: '14px' }}>
            👥 {toMarathiDigits(job.applications)} अर्ज ({toMarathiDigits(job.new_applications)} नवीन) {openId === job.id ? '▴' : '▾'}
          </button>
          {openId === job.id && <Applicants jobId={job.id} onChanged={load} />}
        </div>
      ))}
    </div>
  );
}

// The applicants of one job, with a status selector (poster and admin).
export function Applicants({ jobId, onChanged }) {
  const [apps, setApps] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setApps(await apiClient.getJobApplications(jobId));
    } catch (err) {
      setError(err.message || 'अर्ज लोड करता आले नाहीत.');
      setApps([]);
    }
  }, [jobId]);
  useEffect(() => { load(); }, [load]);

  const change = async (app, status) => {
    setBusy(app.id);
    setError('');
    try {
      await apiClient.setApplicationStatus(app.id, status);
      await load();
      if (onChanged) onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  if (apps === null) return <div style={{ padding: '12px', color: '#888' }}>लोड होत आहे... ⏳</div>;
  return (
    <div style={{ marginTop: '12px', display: 'grid', gap: '10px' }}>
      {error && <div role="alert" style={errorBox}>{error}</div>}
      {apps.length === 0 && <div style={{ color: '#6B7280', fontSize: '0.9rem' }}>अजून कोणीही अर्ज केलेला नाही.</div>}
      {apps.map((app) => (
        <div key={app.id} style={{ border: '1px solid #F3F4F6', background: '#FAFAF9', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <div>
              <strong>{app.applicant_name}</strong>
              <span style={{ color: '#6B7280', fontSize: '0.8rem' }}> · {timeAgo(app.created_at)}</span>
              <div style={{ fontSize: '0.88rem', marginTop: '4px' }}>
                📞 <a href={`tel:${app.phone}`} style={{ color: '#C73800', fontWeight: 700 }}>{app.phone}</a>
                {app.email && <> · ✉️ <a href={`mailto:${app.email}`} style={{ color: '#C73800' }}>{app.email}</a></>}
              </div>
              {app.resume_summary && <div style={{ fontSize: '0.88rem', color: '#4B5563', marginTop: '4px' }}>"{app.resume_summary}"</div>}
            </div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              स्थिती:{' '}
              <select value={app.status} disabled={busy === app.id} onChange={(e) => change(app, e.target.value)}
                style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#fff' }}>
                {APPLICATION_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
              </select>
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

// "माझे अर्ज": the member's applications with the job and status.
function MyApplications() {
  const [apps, setApps] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.getMyApplications()
      .then(setApps)
      .catch((err) => { setError(err.message || 'अर्ज लोड करता आले नाहीत.'); setApps([]); });
  }, []);

  if (apps === null) return <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>लोड होत आहे... ⏳</div>;
  return (
    <div style={{ display: 'grid', gap: '12px', marginBottom: '40px' }}>
      {error && <div role="alert" style={errorBox}>{error}</div>}
      {apps.length === 0 && <div style={{ ...card, textAlign: 'center', padding: '48px', color: '#666' }}>तुम्ही अजून अर्ज केलेला नाही.</div>}
      {apps.map((app) => {
        const s = statusInfo(app.status);
        return (
          <div key={app.id} style={{ ...card, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <Link to={`/jobs/${encodeURIComponent(app.job.id)}`} style={{ fontWeight: 800, color: '#1F2937', textDecoration: 'none' }}>{app.job.title}</Link>
              <div style={{ fontSize: '0.88rem', color: '#6B7280' }}>{app.job.company} · {app.job.district} · {timeAgo(app.created_at)}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: '#FFF7ED', color: '#9A3412', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem' }}>{s.icon} {s.label}</span>
              {app.job.state !== 'open' && <span style={{ color: '#4B5563', fontSize: '0.85rem' }}>🔒 जागा बंद</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
