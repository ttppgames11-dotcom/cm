import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function JobsPortalPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [applyingJob, setApplyingJob] = useState(null);
  const [applyForm, setApplyForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', summary: '' });
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Post Job Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    company: user?.business || '',
    district: 'पुणे',
    category: 'IT & Software',
    salary: '₹४,००,००० – ₹८,००,००० / वर्ष',
    job_type: 'Full-time',
    experience: '१-३ वर्षे',
    desc: '',
    contact_email: user?.email || '',
    phone: user?.phone || ''
  });

  useEffect(() => {
    loadJobs();
  }, [selectedCat, selectedDistrict]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await api.jobs.getAll({
        category: selectedCat !== 'all' ? selectedCat : undefined,
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
    } catch (err) {
      alert('अर्ज करताना त्रुटी: ' + err.message);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.jobs.create(postForm);
      if (res && res.job) {
        alert('नोकरी जाहिरात यशस्वीरित्या प्रसिद्ध झाली! 🚩');
        setJobs([res.job, ...jobs]);
        setShowPostModal(false);
      }
    } catch (err) {
      alert('जाहिरात प्रसिद्ध करताना त्रुटी: ' + err.message);
    }
  };

  return (
    <div style={{ background: '#FBF5EC', minHeight: '100vh', padding: '36px 0' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #C73800, #E65100)',
          borderRadius: '16px',
          color: '#fff',
          padding: '32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 10px 25px rgba(199,56,0,0.2)'
        }}>
          <div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
              💼 रोजगार, करिअर व युवा सक्षमीकरण
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '10px 0 6px', fontFamily: 'Baloo 2' }}>
              मराठा करिअर व नोकरी संधी केंद्र (Jobs Portal)
            </h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '1.05rem', maxWidth: '65ch' }}>
              मराठा उद्योजक आणि कंपन्यांमधील थेट नोकरी संधी, स्पर्धा परीक्षा मार्गदर्शन आणि इंटर्नशिप दालन.
            </p>
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            className="btn btn-primary"
            style={{ background: '#fff', color: '#C73800', border: 'none', padding: '12px 24px', fontWeight: 800, borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
            + नोकरी जाहिरात द्या
          </button>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '18px 24px', border: '1px solid #E5E7EB', marginBottom: '28px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="पदवी, कौशल्य किंवा कंपनी शोधा..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 2, minWidth: '220px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB' }}
          />

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            style={{ flex: 1, minWidth: '160px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff' }}>
            <option value="all">सर्व क्षेत्रे</option>
            <option value="IT & Software">IT & Software</option>
            <option value="Finance & Accounts">Finance & Accounts</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Marketing & Sales">Marketing & Sales</option>
          </select>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            style={{ flex: 1, minWidth: '140px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff' }}>
            <option value="सर्व">सर्व जिल्हे</option>
            <option value="पुणे">पुणे</option>
            <option value="मुंबई">मुंबई</option>
            <option value="नाशिक">नाशिक</option>
            <option value="नागपूर">नागपूर</option>
            <option value="कोल्हापूर">कोल्हापूर</option>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px', marginBottom: '40px' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', margin: '0 0 4px', color: '#1F2937' }}>
                        {job.title}
                      </h3>
                      <div style={{ fontWeight: 600, color: '#C73800', fontSize: '0.9rem' }}>
                        🏢 {job.company}
                      </div>
                    </div>
                    <span style={{ background: '#F0FDF4', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                      {job.job_type || 'Full-time'}
                    </span>
                  </div>

                  <div style={{ background: '#F9FAFB', padding: '10px 12px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.85rem' }}>
                    <div>📍 ठिकाण: <strong>{job.district}</strong></div>
                    <div>💰 पगार: <strong>{job.salary}</strong></div>
                    <div>🎓 अनुभव: <strong>{job.experience}</strong></div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 16px' }}>
                    {job.desc}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>आयडी: {job.id}</span>
                  <button
                    onClick={() => { setApplyingJob(job); setAppliedSuccess(false); }}
                    className="btn btn-primary"
                    style={{ background: '#C73800', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '6px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>
                    अर्ज करा (Apply) 🚀
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Apply */}
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
                        placeholder="उदा. B.E. Computer, २ वर्षे React/Node अनुभव..."
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

        {/* Modal: Post Job */}
        {showPostModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '540px', width: '100%', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#C73800' }}>📢 नोकरी जाहिरात प्रसिद्ध करा</h3>
                <button onClick={() => setShowPostModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handlePostSubmit}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>पदाचे नाव (Job Title) *</label>
                  <input
                    type="text"
                    required
                    value={postForm.title}
                    onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                    placeholder="उदा. सिनियर अकाउंटंट, CNC ऑपरेटर"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>कंपनी / उद्योग नाव *</label>
                    <input
                      type="text"
                      required
                      value={postForm.company}
                      onChange={(e) => setPostForm({ ...postForm, company: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>जिल्हा</label>
                    <input
                      type="text"
                      value={postForm.district}
                      onChange={(e) => setPostForm({ ...postForm, district: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>पगार / मानधन</label>
                    <input
                      type="text"
                      value={postForm.salary}
                      onChange={(e) => setPostForm({ ...postForm, salary: e.target.value })}
                      placeholder="उदा. ₹२५,००० / महिना"
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>अनुभव</label>
                    <input
                      type="text"
                      value={postForm.experience}
                      onChange={(e) => setPostForm({ ...postForm, experience: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>कामाचे स्वरूप व अटी</label>
                  <textarea
                    rows="3"
                    required
                    value={postForm.desc}
                    onChange={(e) => setPostForm({ ...postForm, desc: e.target.value })}
                    placeholder="कौशल्ये, कामाचे तास आणि जबाबदाऱ्या..."
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowPostModal(false)} style={{ background: '#F3F4F6', border: 'none', padding: '8px 16px', borderRadius: '6px' }}>रद्द</button>
                  <button type="submit" style={{ background: '#C73800', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 700 }}>प्रसिद्ध करा 📢</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
