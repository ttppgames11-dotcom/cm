import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function JobsPortalPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'my', 'moderation'
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Check if current user is manager/admin
  const isManager = user && ['superadmin', 'admin', 'ceo', 'center_manager', 'center_admin', 'district_admin', 'taluka_admin'].includes(user.role);

  // Apply Modal
  const [applyingJob, setApplyingJob] = useState(null);
  const [applyForm, setApplyForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', summary: '' });
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // View Applicants Modal
  const [viewingApplicantsJob, setViewingApplicantsJob] = useState(null);
  const [applicantsList, setApplicantsList] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Post Job Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    company: user?.business || '',
    district: user?.district || 'पुणे',
    taluka: user?.taluka || 'हवेली',
    category: 'IT & Software',
    salary: '₹२५,००० - ४०,००० / महिना',
    job_type: 'पूर्णवेळ (Full-time)',
    experience: '१-३ वर्षे',
    vacancies: 1,
    desc: '',
    contact_email: user?.email || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    loadJobs();
    if (user) {
      loadMyJobs();
    }
    if (isManager) {
      loadPendingJobs();
    }
  }, [selectedCat, selectedDistrict, user]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await api.jobs.getAll({
        industry: selectedCat !== 'all' ? selectedCat : undefined,
        district: selectedDistrict !== 'सर्व' ? selectedDistrict : undefined,
        search: search || undefined
      });
      if (res && res.jobs) setJobs(res.jobs);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyJobs = async () => {
    try {
      const res = await api.jobs.getMyJobs();
      if (res && res.jobs) setMyJobs(res.jobs);
    } catch (err) {
      console.warn('My jobs fetch:', err);
    }
  };

  const loadPendingJobs = async () => {
    try {
      const res = await api.jobs.getPendingJobs();
      if (res && res.pendingJobs) setPendingJobs(res.pendingJobs);
    } catch (err) {
      console.warn('Pending jobs fetch:', err);
    }
  };

  // View Applicants
  const handleViewApplicants = async (job) => {
    setViewingApplicantsJob(job);
    setLoadingApplicants(true);
    try {
      const res = await api.jobs.getApplications(job.id);
      if (res && res.applications) {
        setApplicantsList(res.applications);
      } else {
        setApplicantsList([]);
      }
    } catch (err) {
      alert('अर्जदार माहिती लोड करताना त्रुटी: ' + err.message);
      setApplicantsList([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Close Job
  const handleCloseJob = async (jobId) => {
    if (!window.confirm('आपण खात्रीपूर्वक ही जाहिरात बंद (भरती पूर्ण) करू इच्छिता?')) return;
    try {
      await api.jobs.closeJob(jobId);
      alert('नोकरी जाहिरात यशस्वीरित्या बंद झाली.');
      loadMyJobs();
      loadJobs();
    } catch (err) {
      alert('त्रुटी: ' + err.message);
    }
  };

  // Moderation: Approve or Reject
  const handleModerate = async (jobId, status) => {
    let rejectionReason = '';
    if (status === 'rejected') {
      rejectionReason = window.prompt('कृपया नाकारण्याचे कारण प्रविष्ट करा (उदा. अपूर्ण माहिती / अवैध फोन):');
      if (rejectionReason === null) return;
    }

    try {
      const res = await api.jobs.moderateJob(jobId, { status, rejectionReason });
      alert(res.message || 'पडताळणी प्रक्रिया पूर्ण झाली!');
      loadPendingJobs();
      loadJobs();
    } catch (err) {
      alert('पडताळणी करताना त्रुटी: ' + err.message);
    }
  };

  // Submit Application
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyingJob) return;

    try {
      await api.jobs.apply(applyingJob.id, {
        applicant_name: applyForm.name,
        phone: applyForm.phone,
        email: applyForm.email,
        resume_summary: applyForm.summary
      });
      setAppliedSuccess(true);
      loadJobs();
    } catch (err) {
      alert('अर्ज करताना त्रुटी: ' + err.message);
    }
  };

  // Post Job
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostSubmitting(true);
    try {
      const res = await api.jobs.create(postForm);
      if (res && res.job) {
        alert('🎉 नोकरी जाहिरात यशस्वीरित्या नोंदवली गेली!\nस्थानिक कम्युनिटी सेंटर / ॲडमिन पडताळणीनंतर २४ तासांत सार्वजनिक दिसेल. 🚩');
        setShowPostModal(false);
        loadMyJobs();
        if (isManager) loadPendingJobs();
        setActiveTab('my');
      }
    } catch (err) {
      alert('जाहिरात प्रसिद्ध करताना त्रुटी: ' + err.message);
    } finally {
      setPostSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Banner */}
        <div style={{
          background: "url('/assets/images/hero-cinematic-bg.jpg') center/cover no-repeat",
          borderRadius: '16px',
          color: '#fff',
          padding: 'clamp(18px, 4vw, 32px)',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(199,56,0,0.2)'
        }}>
          <div>
            <span style={{ background: 'rgba(0,0,0,0.4)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
              💼 रोजगार, करिअर व युवा सक्षमीकरण
            </span>
            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', margin: '10px 0 6px', fontFamily: 'Baloo 2', textShadow: '0 2px 10px rgba(0,0,0,0.7)', wordBreak: 'break-word' }}>
              मराठा करिअर व नोकरी संधी केंद्र (Jobs Portal)
            </h1>
            <p style={{ margin: 0, opacity: 0.95, fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', maxWidth: '65ch', textShadow: '0 1px 6px rgba(0,0,0,0.7)' }}>
              मराठा उद्योजक, कंपन्या व तालुका कम्युनिटी सेंटरमधील थेट पडताळणीकृत नोकरी संधी.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                if (!user) {
                  alert('कृपया नोकरी जाहिरात देण्यासाठी आधी लॉगिन करा.');
                  return;
                }
                setShowPostModal(true);
              }}
              style={{
                background: '#fff',
                color: '#C73800',
                border: 'none',
                padding: '12px 24px',
                fontWeight: 800,
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
              + नोकरी जाहिरात द्या
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px', flexWrap: 'wrap', borderBottom: '2px solid #E5E7EB', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              background: activeTab === 'all' ? '#C73800' : '#FFFFFF',
              color: activeTab === 'all' ? '#FFFFFF' : '#4B5563',
              border: '1px solid #D1D5DB',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            🔍 सर्व उपलब्ध नोकऱ्या ({jobs.length})
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('my')}
              style={{
                background: activeTab === 'my' ? '#C73800' : '#FFFFFF',
                color: activeTab === 'my' ? '#FFFFFF' : '#4B5563',
                border: '1px solid #D1D5DB',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              📋 माझ्या जाहिराती ({myJobs.length})
            </button>
          )}

          {isManager && (
            <button
              onClick={() => setActiveTab('moderation')}
              style={{
                background: activeTab === 'moderation' ? '#7C2D12' : '#FFFFFF',
                color: activeTab === 'moderation' ? '#FFFFFF' : '#7C2D12',
                border: '2px solid #EA580C',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🛡️ पडताळणी रांग (Approval Queue)</span>
              {pendingJobs.length > 0 && (
                <span style={{ background: '#EA580C', color: '#FFF', padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 900 }}>
                  {pendingJobs.length} नवीन
                </span>
              )}
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* TAB 1: ALL OPEN JOBS (PUBLIC VIEW) */}
        {/* ============================================================ */}
        {activeTab === 'all' && (
          <div>
            {/* 4 Category Quick Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflow: 'hidden', boxShadow: '0 4px 12px rgba(67, 20, 7, 0.05)' }}>
                <div style={{ height: '90px', position: 'relative', overflow: 'hidden' }}>
                  <img src="/assets/images/radar-jobs-card.jpg" alt="IT & Corporate Jobs" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(67, 20, 7, 0.75) 100%)' }} />
                  <span style={{ position: 'absolute', bottom: '8px', left: '10px', background: '#EA580C', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900 }}>
                    💻 IT & सॉफ्टवेअर
                  </span>
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', color: '#1F2937', fontWeight: 800 }}>आयटी व कॉर्पोरेट नोकऱ्या</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>पुणे, मुंबई व हायब्रिड कंपन्या</p>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflow: 'hidden', boxShadow: '0 4px 12px rgba(67, 20, 7, 0.05)' }}>
                <div style={{ height: '90px', position: 'relative', overflow: 'hidden' }}>
                  <img src="/assets/images/radar-customers-card.jpg" alt="Retail & Sales" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(67, 20, 7, 0.75) 100%)' }} />
                  <span style={{ position: 'absolute', bottom: '8px', left: '10px', background: '#15803D', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900 }}>
                    🏢 सेल्स व ग्राहक सेवा
                  </span>
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', color: '#1F2937', fontWeight: 800 }}>मार्केटिंग व रिटेल शोरूम</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>थेट ग्राहक समन्वय व इन्सेंटिव्ह</p>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflow: 'hidden', boxShadow: '0 4px 12px rgba(67, 20, 7, 0.05)' }}>
                <div style={{ height: '90px', position: 'relative', overflow: 'hidden' }}>
                  <img src="/assets/images/radar-b2b-card.jpg" alt="Manufacturing & Core Engg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(67, 20, 7, 0.75) 100%)' }} />
                  <span style={{ position: 'absolute', bottom: '8px', left: '10px', background: '#C2410C', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900 }}>
                    ⚙️ MIDC मॅन्युफॅक्चरिंग
                  </span>
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', color: '#1F2937', fontWeight: 800 }}>इंजिनिअरिंग व उत्पादन</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>चाकण, भोसरी, तळोजा कारखाने</p>
                </div>
              </div>

              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #FED7AA', overflow: 'hidden', boxShadow: '0 4px 12px rgba(67, 20, 7, 0.05)' }}>
                <div style={{ height: '90px', position: 'relative', overflow: 'hidden' }}>
                  <img src="/assets/images/radar-education-card.jpg" alt="Scholarships & Freshers" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(67, 20, 7, 0.75) 100%)' }} />
                  <span style={{ position: 'absolute', bottom: '8px', left: '10px', background: '#7C2D12', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900 }}>
                    🎓 शिक्षण व Internships
                  </span>
                </div>
                <div style={{ padding: '10px 14px' }}>
                  <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', color: '#1F2937', fontWeight: 800 }}>फ्रेशर्स व करिअर</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>विद्यार्थी व अप्रेंटिसशिप संधी</p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div style={{ background: '#fff', borderRadius: '14px', padding: '16px 20px', border: '1px solid #E5E7EB', marginBottom: '24px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="पदवी, कौशल्य किंवा कंपनी शोधा..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 2, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
              />

              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                style={{ flex: 1, minWidth: '150px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff' }}>
                <option value="all">सर्व उद्योग क्षेत्रे</option>
                <option value="IT & Software">IT & Software</option>
                <option value="वित्त">वित्त व कर सल्लागार</option>
                <option value="ऑटोमोबाईल">ऑटोमोबाईल व मॅन्युफॅक्चरिंग</option>
                <option value="बांधकाम">बांधकाम व रिअल इस्टेट</option>
                <option value="आरोग्य">हॉस्पिटल व आरोग्य</option>
              </select>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{ flex: 1, minWidth: '130px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff' }}>
                <option value="सर्व">सर्व जिल्हे</option>
                <option value="पुणे">पुणे</option>
                <option value="मुंबई">मुंबई</option>
                <option value="नाशिक">नाशिक</option>
                <option value="सातारा">सातारा</option>
                <option value="कोल्हापूर">कोल्हापूर</option>
                <option value="छत्रपती संभाजीनगर">छत्रपती संभाजीनगर</option>
              </select>

              <button
                onClick={loadJobs}
                style={{ background: '#C73800', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                शोधा 🔍
              </button>
            </div>

            {/* Jobs List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
                नोकऱ्या लोड होत आहेत... ⏳
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: '14px', padding: '60px', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💼</div>
                <h2>सध्या कोणतीही नोकरी उपलब्ध नाही</h2>
                <p>कृपया वेगळा शोध शब्द किंवा जिल्हा निवडून पहा किंवा स्वतः जाहिरात द्या!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {jobs.map(job => (
                  <div
                    key={job.id}
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      padding: '24px',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px', color: '#1F2937', fontWeight: 800 }}>
                            {job.title}
                          </h3>
                          <div style={{ fontWeight: 700, color: '#C73800', fontSize: '0.9rem' }}>
                            🏢 {job.company}
                          </div>
                        </div>
                        <span style={{ background: '#F0FDF4', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                          ✓ प्रमाणित जाहिरात
                        </span>
                      </div>

                      <div style={{ background: '#F9FAFB', padding: '10px 12px', borderRadius: '8px', margin: '12px 0', fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <div>📍 ठिकाण: <strong>{job.district} {job.taluka ? `(${job.taluka})` : ''}</strong></div>
                        <div>💰 पगार: <strong>{job.salary}</strong></div>
                        <div>🎓 अनुभव: <strong>{job.experience}</strong></div>
                        <div>👥 जागा: <strong>{job.vacancies || 1} पदे</strong></div>
                      </div>

                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, margin: '0 0 16px' }}>
                        {job.description || job.desc}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
                        अर्ज आलेले: <strong style={{ color: '#0F172A' }}>{job.applicationsCount || 0}</strong>
                      </span>
                      <button
                        onClick={() => {
                          if (!user) {
                            alert('अर्ज करण्यासाठी कृपया प्रथम लॉगिन करा.');
                            return;
                          }
                          setApplyingJob(job);
                          setAppliedSuccess(false);
                        }}
                        style={{ background: '#C73800', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                        अर्ज करा (Apply) 🚀
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MY POSTED JOBS (EMPLOYER DASHBOARD) */}
        {/* ============================================================ */}
        {activeTab === 'my' && (
          <div>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1F2937' }}>
                    📋 आपण प्रसिद्ध केलेल्या नोकऱ्या ({myJobs.length})
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                    येथे आपल्या जाहिरातींची पडताळणी स्थिती तपासा आणि आलेल्या उमेदवारांचे अर्ज पाहा.
                  </p>
                </div>
                <button
                  onClick={() => setShowPostModal(true)}
                  style={{ background: '#C73800', color: '#FFF', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  + नवीन जाहिरात द्या
                </button>
              </div>

              {myJobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748B' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📝</div>
                  <h4>आपण अद्याप कोणतीही नोकरी प्रसिद्ध केलेली नाही.</h4>
                  <p style={{ fontSize: '0.88rem' }}>आपल्या व्यवसायात नवीन कर्मचारी भरती करण्यासाठी वरील बटनावर क्लिक करा.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {myJobs.map(job => (
                    <div key={job.id} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', background: '#FAFAFA', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>{job.title}</h4>
                          
                          {/* Status Badges */}
                          {job.status === 'pending_approval' && (
                            <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: '100px', fontSize: '0.74rem', fontWeight: 800 }}>
                              ⏳ पडताळणी प्रलंबित (Pending Review)
                            </span>
                          )}
                          {job.status === 'approved' && (
                            <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: '100px', fontSize: '0.74rem', fontWeight: 800 }}>
                              ✓ मंजूर व सक्रिय (Live)
                            </span>
                          )}
                          {job.status === 'rejected' && (
                            <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 10px', borderRadius: '100px', fontSize: '0.74rem', fontWeight: 800 }}>
                              ✕ नाकारले (Rejected)
                            </span>
                          )}
                          {job.status === 'closed' && (
                            <span style={{ background: '#E2E8F0', color: '#475569', padding: '3px 10px', borderRadius: '100px', fontSize: '0.74rem', fontWeight: 800 }}>
                              ⚪ भरती पूर्ण (Closed)
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.84rem', color: '#475569', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                          <span>🏢 {job.company}</span>
                          <span>📍 {job.district} {job.taluka ? `(${job.taluka})` : ''}</span>
                          <span>💰 {job.salary}</span>
                          <span>📅 {new Date(job.postedAt).toLocaleDateString('mr-IN')}</span>
                        </div>

                        {job.status === 'pending_approval' && (
                          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#B45309' }}>
                            ℹ️ स्थानिक कम्युनिटी सेंटर / ॲडमिनद्वारे पडताळणी झाल्यानंतर ही जाहिरात सर्वांसाठी खुली होईल.
                          </div>
                        )}

                        {job.status === 'rejected' && job.rejectionReason && (
                          <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#991B1B', background: '#FFF1F2', padding: '6px 10px', borderRadius: '6px' }}>
                            कारण: {job.rejectionReason}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleViewApplicants(job)}
                          style={{
                            background: '#0F172A',
                            color: '#FFF',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          👥 अर्जदार ({job.applicationsCount || 0})
                        </button>

                        {job.status !== 'closed' && (
                          <button
                            onClick={() => handleCloseJob(job.id)}
                            style={{
                              background: '#F1F5F9',
                              color: '#64748B',
                              border: '1px solid #CBD5E1',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            बंद करा
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: MODERATION & APPROVAL QUEUE (MANAGERS ONLY) */}
        {/* ============================================================ */}
        {activeTab === 'moderation' && isManager && (
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #EA580C', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#7C2D12' }}>
                  🛡️ नोकरी जाहिरात पडताळणी कक्ष (Verification & Moderation Desk)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                  कम्युनिटी सेंटर मॅनेजर व तालुका/जिल्हा ॲडमिनसाठी: नवीन जाहिराती तपासून मंजूर किंवा नामंजूर करा.
                </p>
              </div>
              <span style={{ background: '#FFEDD5', color: '#9A3412', padding: '4px 12px', borderRadius: '100px', fontWeight: 800, fontSize: '0.82rem' }}>
                {pendingJobs.length} प्रलंबित अर्ज
              </span>
            </div>

            {pendingJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', color: '#166534', background: '#F0FDF4', borderRadius: '12px' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🎉</div>
                <h4 style={{ margin: 0 }}>सर्व जाहिरातींची पडताळणी पूर्ण झालेली आहे!</h4>
                <p style={{ fontSize: '0.85rem', color: '#15803D', margin: '4px 0 0' }}>सध्या कोणतीही प्रलंबित जाहिरात नाही.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingJobs.map(job => (
                  <div key={job.id} style={{ border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '20px', background: '#FFFDF9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#1F2937', fontWeight: 800 }}>{job.title}</h4>
                          <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                            पडताळणी प्रलंबित
                          </span>
                        </div>
                        <div style={{ fontSize: '0.88rem', color: '#C2410C', fontWeight: 700, marginTop: '2px' }}>
                          🏢 {job.company} — नोंदणीकर्ता: <strong>{job.posterName}</strong> (ID: {job.posterId})
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        सादर वेळ: {new Date(job.postedAt).toLocaleString('mr-IN')}
                      </div>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.85rem', marginBottom: '14px' }}>
                      <div>📍 कार्यक्षेत्र: <strong>{job.district} {job.taluka ? `(${job.taluka})` : ''}</strong></div>
                      <div>💰 वेतन / पगार: <strong>{job.salary}</strong></div>
                      <div>📞 संपर्क फोन: <strong>{job.contactPhone || 'उपलब्ध नाही'}</strong></div>
                      <div>✉️ ईमेल: <strong>{job.contactEmail || 'उपलब्ध नाही'}</strong></div>
                      <div>🎓 अनुभव: <strong>{job.experience}</strong></div>
                      <div>👥 रिक्त पदे: <strong>{job.vacancies || 1}</strong></div>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: '#334155', background: '#FFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
                      <strong>कामाचे स्वरूप:</strong> {job.description || job.desc}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button
                        onClick={() => handleModerate(job.id, 'rejected')}
                        style={{
                          background: '#FEE2E2',
                          color: '#991B1B',
                          border: '1px solid #F87171',
                          padding: '8px 18px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✕ नाकारा (Reject)
                      </button>

                      <button
                        onClick={() => handleModerate(job.id, 'approved')}
                        style={{
                          background: '#15803D',
                          color: '#FFF',
                          border: 'none',
                          padding: '8px 22px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
                        }}
                      >
                        ✓ मंजूर करा व थेट प्रसिद्ध करा (Approve) 🚩
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: VIEW APPLICANTS */}
        {/* ============================================================ */}
        {viewingApplicantsJob && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '650px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.2rem' }}>
                    👥 आलेले अर्जदार: {viewingApplicantsJob.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>{viewingApplicantsJob.company}</div>
                </div>
                <button onClick={() => setViewingApplicantsJob(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
              </div>

              {loadingApplicants ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>अर्जदार लोड होत आहेत... ⏳</div>
              ) : applicantsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748B' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📥</div>
                  <h4>या पदासाठी अद्याप कोणताही अर्ज आलेला नाही.</h4>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {applicantsList.map(app => (
                    <div key={app.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '14px', background: '#F8FAFC' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <strong style={{ fontSize: '1rem', color: '#0F172A' }}>{app.applicantName}</strong>
                          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                            अर्ज दिनांक: {new Date(app.appliedAt).toLocaleDateString('mr-IN')}
                          </div>
                        </div>
                        <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.74rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {app.status || 'Applied'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.84rem', color: '#334155', background: '#FFF', padding: '8px 12px', borderRadius: '6px', margin: '8px 0', border: '1px solid #E2E8F0' }}>
                        {app.resumeSummary}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                          📞 {app.applicantPhone || 'फोन उपलब्ध नाही'} {app.applicantEmail ? `| ✉️ ${app.applicantEmail}` : ''}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {app.applicantPhone && (
                            <>
                              <a
                                href={`tel:${app.applicantPhone}`}
                                style={{ background: '#0F172A', color: '#FFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 700 }}
                              >
                                📞 कॉल करा
                              </a>
                              <a
                                href={`https://wa.me/91${app.applicantPhone}?text=${encodeURIComponent(`नमस्कार ${app.applicantName}, आम्ही कनेक्ट मराठा जॉब्स पोर्टलवरून ${viewingApplicantsJob.title} पदाच्या अर्जासंदर्भात संपर्क साधत आहोत.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ background: '#16A34A', color: '#FFF', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', textDecoration: 'none', fontWeight: 700 }}
                              >
                                💬 WhatsApp
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: APPLY TO JOB */}
        {/* ============================================================ */}
        {applyingJob && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '28px' }}>
              {appliedSuccess ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✅</div>
                  <h3 style={{ color: '#2E7D32', margin: '0 0 8px' }}>अर्ज यशस्वीरित्या सादर केला!</h3>
                  <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '20px' }}>
                    कंपनीचे HR प्रतिनिधी लवकरच आपल्याशी फोन किंवा ईमेलवर संपर्क साधतील.
                  </p>
                  <button onClick={() => setApplyingJob(null)} style={{ background: '#C73800', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 700 }}>पूर्ण झाले</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: '#C73800' }}>📄 नोकरीसाठी अर्ज करा</h3>
                    <button onClick={() => setApplyingJob(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '16px' }}>
                    <strong>{applyingJob.title}</strong> — {applyingJob.company}
                  </p>

                  <form onSubmit={handleApplySubmit}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>नाव *</label>
                      <input
                        type="text"
                        required
                        value={applyForm.name}
                        onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>फोन नंबर *</label>
                      <input
                        type="tel"
                        required
                        value={applyForm.phone}
                        onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                        placeholder="9876500000"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>ईमेल</label>
                      <input
                        type="email"
                        value={applyForm.email}
                        onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>
                    <div style={{ marginBottom: '18px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>शिक्षण, अनुभव व कौशल्यांचा संक्षिप्त परिचय</label>
                      <textarea
                        rows="3"
                        required
                        value={applyForm.summary}
                        onChange={(e) => setApplyForm({ ...applyForm, summary: e.target.value })}
                        placeholder="उदा. B.E. Mechanical, २ वर्षे मॅन्युफॅक्चरिंग अनुभव..."
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontFamily: 'inherit' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setApplyingJob(null)} style={{ background: '#F3F4F6', border: 'none', padding: '8px 16px', borderRadius: '6px' }}>रद्द</button>
                      <button type="submit" style={{ background: '#C73800', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '6px', fontWeight: 700 }}>अर्ज पाठवा 🚀</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: POST JOB */}
        {/* ============================================================ */}
        {showPostModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, color: '#C73800', fontSize: '1.25rem' }}>📢 नवीन नोकरी जाहिरात द्या</h3>
                <button onClick={() => setShowPostModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
              </div>

              {/* Informative Security Banner */}
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.82rem', color: '#92400E' }}>
                <strong>🛡️ पडताळणी धोरण:</strong> सुरक्षा व विश्वासासाठी, प्रत्येक नवीन नोकरी जाहिरात तालुका कम्युनिटी सेंटर / ॲडमिन पडताळणीनंतर २४ तासांत सार्वजनिक दिसेल.
              </div>

              <form onSubmit={handlePostSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>पदाचे नाव (Job Title) *</label>
                  <input
                    type="text"
                    required
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="उदा. सिनियर अकाउंटंट, CNC ऑपरेटर, इंजिनिअर"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>कंपनी / आस्थापना नाव *</label>
                    <input
                      type="text"
                      required
                      value={postForm.company}
                      onChange={(e) => setPostForm({ ...postForm, company: e.target.value })}
                      placeholder="कंपनी नाव"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>उद्योग क्षेत्र</label>
                    <select
                      value={postForm.category}
                      onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#FFF' }}
                    >
                      <option value="IT & Software">IT & Software</option>
                      <option value="ऑटोमोबाईल व मॅन्युफॅक्चरिंग">ऑटोमोबाईल व मॅन्युफॅक्चरिंग</option>
                      <option value="वित्त व कर सल्लागार">वित्त व कर सल्लागार</option>
                      <option value="बांधकाम व इन्फ्रास्ट्रक्चर">बांधकाम व इन्फ्रास्ट्रक्चर</option>
                      <option value="आरोग्य व रुग्णालय">आरोग्य व रुग्णालय</option>
                      <option value="इतर उद्योग">इतर उद्योग</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>जिल्हा *</label>
                    <input
                      type="text"
                      required
                      value={postForm.district}
                      onChange={(e) => setPostForm({ ...postForm, district: e.target.value })}
                      placeholder="उदा. पुणे"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>तालुका</label>
                    <input
                      type="text"
                      value={postForm.taluka}
                      onChange={(e) => setPostForm({ ...postForm, taluka: e.target.value })}
                      placeholder="उदा. हवेली / कराड"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>पगार / वेतन</label>
                    <input
                      type="text"
                      value={postForm.salary}
                      onChange={(e) => setPostForm({ ...postForm, salary: e.target.value })}
                      placeholder="उदा. ₹२५,००० - ३५,००० दरमहा"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>अपेक्षित अनुभव</label>
                    <input
                      type="text"
                      value={postForm.experience}
                      onChange={(e) => setPostForm({ ...postForm, experience: e.target.value })}
                      placeholder="उदा. १-३ वर्षे / फ्रेशर्स"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>संपर्क फोन नंबर *</label>
                    <input
                      type="tel"
                      required
                      value={postForm.phone}
                      onChange={(e) => setPostForm({ ...postForm, phone: e.target.value })}
                      placeholder="9822000000"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>रिक्त पदे (Vacancies)</label>
                    <input
                      type="number"
                      min="1"
                      value={postForm.vacancies}
                      onChange={(e) => setPostForm({ ...postForm, vacancies: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>कामाचे स्वरूप व पात्रता (Description) *</label>
                  <textarea
                    rows="3"
                    required
                    value={postForm.desc}
                    onChange={(e) => setPostForm({ ...postForm, desc: e.target.value })}
                    placeholder="कौशल्ये, कामाचे तास, पात्रता व जबाबदाऱ्या..."
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowPostModal(false)} style={{ background: '#F3F4F6', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer' }}>रद्द</button>
                  <button type="submit" disabled={postSubmitting} style={{ background: '#C73800', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                    {postSubmitting ? 'नोंदणी होत आहे...' : 'जाहिरात सादर करा 📢'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
