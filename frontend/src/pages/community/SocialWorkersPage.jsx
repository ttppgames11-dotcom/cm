import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { id: 'all', label: 'सर्व समाजसेवक', icon: '🌟' },
  { id: 'water', label: 'जलसंधारण व दुष्काळ', icon: '💧' },
  { id: 'health', label: 'आरोग्य व रुग्णमित्र', icon: '🏥' },
  { id: 'farmers', label: 'शेतकरी कुटुंब आधार', icon: '🌾' },
  { id: 'legal', label: 'कायदेशीर विधी साहाय्य', icon: '⚖️' },
  { id: 'education', label: 'शिक्षण व वसतिगृह', icon: '📚' },
  { id: 'blood', label: 'रक्तदान व अवयवदान', icon: '🩸' },
  { id: 'heritage', label: 'गडकिल्ले संवर्धन', icon: '🏰' }
];

const MAHARASHTRA_DISTRICTS = [
  'सर्व जिल्हे',
  'पुणे',
  'सोलापूर',
  'बीड',
  'छत्रपती संभाजीनगर',
  'यवतमाळ',
  'मुंबई',
  'ठाणे',
  'कोल्हापूर',
  'सातारा',
  'सांगली',
  'नाशिक',
  'अमरावती',
  'नागपूर',
  'लातूर',
  'जालना',
  'रायगड'
];

export default function SocialWorkersPage() {
  const { showToast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('workers'); // 'workers' | 'help' | 'missions' | 'crm'
  const [workersList, setWorkersList] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [missions, setMissions] = useState([]);
  const [crmStats, setCrmStats] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व जिल्हे');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerDetail, setWorkerDetail] = useState(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);

  // Form Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [selectedCategory, selectedDistrict]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedDistrict !== 'सर्व जिल्हे') params.district = selectedDistrict;

      const [workersRes, helpRes, missionsRes, statsRes] = await Promise.all([
        apiClient.getSocialWorkers(params).catch(() => []),
        apiClient.getSocialHelpRequests().catch(() => []),
        apiClient.getSocialMissions().catch(() => []),
        apiClient.getSocialWorkerCrmStats().catch(() => null)
      ]);

      if (Array.isArray(workersRes) && workersRes.length > 0) {
        setWorkersList(workersRes);
      }
      if (Array.isArray(helpRes) && helpRes.length > 0) {
        setHelpRequests(helpRes);
      }
      if (Array.isArray(missionsRes) && missionsRes.length > 0) {
        setMissions(missionsRes);
      }
      if (statsRes) {
        setCrmStats(statsRes);
      }
    } catch (err) {
      console.warn('Error loading social workers suite:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWorkerDetail = async (worker) => {
    setSelectedWorker(worker);
    try {
      const res = await apiClient.getSocialWorkerById(worker.id);
      if (res) {
        setWorkerDetail(res);
      } else {
        setWorkerDetail(worker);
      }
    } catch {
      setWorkerDetail(worker);
    }
  };

  // 1. Citizen Request Help Submit
  const handleRequestHelpSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.target);

    try {
      const res = await apiClient.requestSocialHelp({
        citizenName: fd.get('citizenName'),
        citizenPhone: fd.get('citizenPhone'),
        district: fd.get('district'),
        taluka: fd.get('taluka'),
        category: fd.get('category'),
        urgency: fd.get('urgency'),
        description: fd.get('description'),
        preferredWorkerId: selectedWorker?.id || null
      });

      showToast(res?.message || '🚩 आपली मदत विनंती यशस्वी नोंदवली गेली!', 'success');
      setIsHelpModalOpen(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'मदत विनंती सादर करताना त्रुटी आली.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Register New Social Worker / Volunteer Submit
  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.target);

    try {
      const res = await apiClient.addSocialWorker({
        name: fd.get('name'),
        field: fd.get('field'),
        category: fd.get('category'),
        district: fd.get('district'),
        taluka: fd.get('taluka'),
        phone: fd.get('phone'),
        email: fd.get('email'),
        organization: fd.get('organization'),
        skills: fd.get('skills'),
        availability: fd.get('availability'),
        experience: fd.get('experience'),
        impact: fd.get('impact')
      });

      showToast(res?.message || '🚩 समाजसेवक स्वयंसेवा नोंदणी यशस्वी झाली!', 'success');
      setIsVolunteerModalOpen(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'नोंदणी त्रुटी', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Submit Testimonial
  const handleTestimonialSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorker) return;
    setIsSubmitting(true);
    const fd = new FormData(e.target);

    try {
      await apiClient.addSocialTestimonial(selectedWorker.id, {
        citizenName: fd.get('citizenName'),
        citizenCity: fd.get('citizenCity'),
        testimonial: fd.get('testimonial'),
        rating: fd.get('rating'),
        impactStory: fd.get('impactStory')
      });

      showToast(`🚩 ${selectedWorker.name} यांच्यासाठी आपले प्रशंसापत्र जोडले गेले!`, 'success');
      setIsTestimonialModalOpen(false);
      handleOpenWorkerDetail(selectedWorker);
    } catch (err) {
      showToast(err.message || 'प्रशंसापत्र त्रुटी', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. CRM Status Update
  const handleUpdateRequestStatus = async (reqId, newStatus) => {
    try {
      await apiClient.updateSocialHelpRequest(reqId, { status: newStatus });
      showToast(`प्रकरण स्थिती अद्ययावत: ${newStatus}`, 'success');
      loadAllData();
    } catch (err) {
      showToast(err.message || 'त्रुटी', 'error');
    }
  };

  // Filter in-memory for instant search
  const filteredWorkers = workersList.filter(w => {
    const q = searchQuery.toLowerCase();
    return (
      (w.name || '').toLowerCase().includes(q) ||
      (w.field || '').toLowerCase().includes(q) ||
      (w.location || '').toLowerCase().includes(q) ||
      (w.district || '').toLowerCase().includes(q) ||
      (w.impact || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', paddingBottom: '60px', color: '#1E293B', fontFamily: 'inherit' }}>
      
      {/* HERO BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
        color: '#FFFFFF',
        padding: '52px 20px 48px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 12px 30px rgba(30,27,75,0.25)',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-30px', opacity: 0.08, fontSize: '18rem', pointerEvents: 'none' }}>
          🤝
        </div>

        <div style={{ maxWidth: '980px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{
              background: 'rgba(255, 213, 79, 0.2)',
              border: '1px solid #FFD54F',
              padding: '4px 16px',
              borderRadius: '24px',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#FFD54F'
            }}>
              🤝 CONNECT MARATHA — निष्ठावंत समाजसेवक व मदत कक्ष
            </span>
            <span style={{ background: '#10B981', color: '#fff', padding: '4px 14px', borderRadius: '24px', fontSize: '0.82rem', fontWeight: 700 }}>
              ✓ सेवा परमो धर्मः (२४x७ जनसाहाय्य)
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.1rem, 3.8vw, 2.9rem)', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.25 }}>
            समाजातील शेवटच्या घटकासाठी अहोरात्र झटणारे निष्ठावंत समाजसेवक
          </h1>
          <p style={{ fontSize: '1.08rem', color: '#E0E7FF', margin: '0 auto 24px', maxWidth: '800px', lineHeight: 1.6, opacity: 0.95 }}>
            जलसंधारण, शेतकरी कुटुंब आधार, मोफत कायदेशीर विधी सेवा, आपत्कालीन रुग्ण मित्र व अनाथ बालसंगोपन 
            क्षेत्रात निःस्वार्थपणे कार्यरत असलेल्या मराठा समाजसेवकांशी थेट संपर्क व नागरिक मदत जुळवणी.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                color: '#fff',
                border: 'none',
                padding: '12px 26px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(220,38,38,0.35)'
              }}>
              🆘 तातडीने मदत हवी आहे? (विनंती नोंदवा)
            </button>
            <button
              onClick={() => setIsVolunteerModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #FFD54F 0%, #FFB300 100%)',
                color: '#78350F',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.98rem',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
              }}>
              ＋ समाजसेवक / स्वयंसेवक म्हणून जुळा
            </button>
          </div>
        </div>
      </section>

      {/* METRICS STRIP */}
      <div style={{ maxWidth: '1240px', margin: '-22px auto 24px', padding: '0 16px', position: 'relative', zIndex: 5 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}>
          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>सत्यापित समाजसेवक</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#312E81', marginTop: '2px' }}>
              {crmStats?.totalSocialWorkers || workersList.length || 6}+
            </div>
            <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>राज्यव्यापी समर्पित कार्यकर्ते</div>
          </div>

          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>नागरिक मदत प्रकरणे सोडवली</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F766E', marginTop: '2px' }}>
              {crmStats?.resolvedRequests || 7,500}+
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>आरोग्य, विधी व आपत्ती साहाय्य</div>
          </div>

          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>समर्पित कामाचे तास (Hours)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>
              {crmStats?.totalVolunteerHours ? `${crmStats.totalVolunteerHours.toLocaleString('en-IN')}+` : '२९,५००+'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>अविरत जनसेवा तास</div>
          </div>

          <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>सक्रिय सामाजिक मोहिमा</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#DC2626', marginTop: '2px' }}>
              {crmStats?.totalMissions || missions.length || 2}+
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>दुष्काळमुक्ती व दुर्ग श्रमदान</div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ maxWidth: '1240px', margin: '0 auto 20px', padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'workers', label: '🤝 निष्ठावंत समाजसेवक रोस्टर', count: workersList.length },
            { id: 'help', label: '🆘 नागरिक मदत मागणी व स्थिती', count: helpRequests.length },
            { id: 'missions', label: '🚩 सक्रिय सामाजिक मोहिमा', count: missions.length },
            { id: 'crm', label: '📊 CRM कार्य वाटप व मोजमाप' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === t.id ? '3px solid #312E81' : '3px solid transparent',
                color: activeTab === t.id ? '#312E81' : '#64748B',
                fontWeight: activeTab === t.id ? 800 : 600,
                fontSize: '1rem',
                padding: '10px 18px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  background: activeTab === t.id ? '#312E81' : '#E2E8F0',
                  color: activeTab === t.id ? '#fff' : '#64748B',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SOCIAL WORKERS DIRECTORY */}
      {activeTab === 'workers' && (
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
          {/* Filters Bar */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            padding: '18px 20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <input
                type="text"
                placeholder="नाव, कार्यक्षेत्र, कौशल्य किंवा जिल्हा शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
              />

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: '#fff' }}>
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: selectedCategory === cat.id ? '1px solid #312E81' : '1px solid #E2E8F0',
                    background: selectedCategory === cat.id ? '#312E81' : '#F8FAFC',
                    color: selectedCategory === cat.id ? '#fff' : '#475569',
                    fontSize: '0.84rem',
                    fontWeight: selectedCategory === cat.id ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Workers Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>समाजसेवक यादी लोड होत आहे...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
              {filteredWorkers.map(w => (
                <div
                  key={w.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '22px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                  <div>
                    {/* Top Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{
                        background: '#EEF2FF',
                        color: '#312E81',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        {w.field}
                      </span>
                      <span style={{
                        background: '#DCFCE7',
                        color: '#166534',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        ✓ {w.verification_status || 'सत्यापित'}
                      </span>
                    </div>

                    {/* Name & Location */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ fontSize: '2.2rem', lineHeight: 1 }}>{w.icon || '🤝'}</div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                          {w.name}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          📍 {w.location || w.district} • {w.experience}
                        </div>
                      </div>
                    </div>

                    {/* Impact description */}
                    <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                      <strong>साध्य केलेले कार्य:</strong> {w.impact}
                    </p>

                    {/* Details Box */}
                    <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                      <div><strong>संघटना:</strong> {w.organization || 'मराठा समाजकार्य मंच'}</div>
                      <div><strong>उपलब्धता:</strong> {w.availability || 'पूर्णवेळ'}</div>
                      <div><strong>समर्पित कामाचे तास:</strong> <span style={{ color: '#312E81', fontWeight: 800 }}>{w.volunteer_hours || 500}+ तास</span></div>
                      <div><strong>सोडवलेली प्रकरणे:</strong> <span style={{ color: '#0F766E', fontWeight: 800 }}>{w.cases_resolved || 50}+ नागरिक</span></div>
                      {w.awards && <div><strong>सन्मान:</strong> 🏆 {w.awards}</div>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      onClick={() => handleOpenWorkerDetail(w)}
                      style={{
                        background: '#F1F5F9',
                        color: '#334155',
                        border: '1px solid #CBD5E1',
                        padding: '9px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}>
                      🔍 सविस्तर प्रोफाइल
                    </button>
                    <button
                      onClick={() => {
                        setSelectedWorker(w);
                        setIsHelpModalOpen(true);
                      }}
                      style={{
                        background: '#312E81',
                        color: '#fff',
                        border: 'none',
                        padding: '9px',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}>
                      🆘 मदत विनंती पाठवा
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CITIZEN HELP REQUESTS (मदत मागणी व प्रगती) */}
      {activeTab === 'help' && (
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px 0', color: '#0F172A' }}>
                🆘 नागरिक मदत विनंत्या व प्रगती (Live Help Desk)
              </h2>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B' }}>
                गरजू नागरिकांच्या मदतीसाठी थेट नियुक्त समाजसेवक व कामाचा प्रत्यक्ष निकाल.
              </p>
            </div>
            <button
              onClick={() => setIsHelpModalOpen(true)}
              style={{
                background: '#DC2626',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}>
              ＋ नवीन मदत विनंती टाका
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '18px' }}>
            {helpRequests.map((hr) => (
              <div key={hr.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{
                    background: hr.urgency?.includes('तातडीचे') ? '#FEE2E2' : '#FEF3C7',
                    color: hr.urgency?.includes('तातडीचे') ? '#991B1B' : '#92400E',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {hr.urgency}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#312E81' }}>
                    केस क्र: {hr.case_number}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0', color: '#0F172A' }}>
                  {hr.category}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '8px' }}>
                  नागरिक: <strong>{hr.citizen_name}</strong> • जिल्हा: {hr.district} ({hr.taluka || ''})
                </div>

                <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                  {hr.description}
                </p>

                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '12px' }}>
                  <div><strong>नियुक्त समाजसेवक:</strong> <span style={{ color: '#312E81', fontWeight: 700 }}>{hr.assigned_worker_name || 'पडताळणी कक्ष'}</span></div>
                  <div><strong>स्थिती:</strong> <span style={{ color: hr.status?.includes('पूर्ण') ? '#16A34A' : '#D97706', fontWeight: 700 }}>{hr.status}</span></div>
                  {hr.outcome_notes && (
                    <div style={{ marginTop: '4px', color: '#0F766E' }}>
                      <strong>परिणाम:</strong> {hr.outcome_notes}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textAlign: 'right' }}>
                  दिनांक: {hr.created_at?.split('T')[0] || '२०२६-१०-१९'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL MISSIONS */}
      {activeTab === 'missions' && (
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0', color: '#0F172A' }}>
            🚩 राज्यव्यापी सामाजिक मोहिमा व सामूहिक श्रमदान (Social Missions)
          </h2>
          <p style={{ margin: '0 0 20px 0', fontSize: '0.88rem', color: '#64748B' }}>
            निष्ठावंत समाजसेवकांच्या नेतृत्वाखाली सुरू असलेले मोठे जनआंदोलन व पुनर्वसन प्रकल्प.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
            {missions.map((m) => (
              <div key={m.id} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700 }}>
                    {m.status}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>{m.category} • {m.district}</span>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px 0', color: '#0F172A' }}>{m.title}</h3>
                <div style={{ fontSize: '0.85rem', color: '#312E81', fontWeight: 700, marginBottom: '10px' }}>
                  प्रकल्प प्रमुख: {m.lead_worker_name}
                </div>

                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  {m.description}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: '#F8FAFC', padding: '12px', borderRadius: '10px', textAlign: 'center', fontSize: '0.82rem' }}>
                  <div>
                    <div style={{ color: '#64748B', fontSize: '0.75rem' }}>लाभार्थी</div>
                    <div style={{ fontWeight: 800, color: '#312E81', fontSize: '1rem' }}>{m.beneficiaries_count.toLocaleString('en-IN')}+</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', fontSize: '0.75rem' }}>स्वयंसेवक</div>
                    <div style={{ fontWeight: 800, color: '#0F766E', fontSize: '1rem' }}>{m.volunteers_engaged}+ मावळे</div>
                  </div>
                  <div>
                    <div style={{ color: '#64748B', fontSize: '0.75rem' }}>श्रमदान तास</div>
                    <div style={{ fontWeight: 800, color: '#D97706', fontSize: '1rem' }}>{m.hours_invested}+ तास</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CRM GOVERNANCE */}
      {activeTab === 'crm' && (
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 16px 0', color: '#0F172A' }}>
              📊 CRM कार्य वाटप, सोडवणूक व निकाल नियंत्रण (Helpdesk Dispatch CRM)
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>केस क्र.</th>
                    <th style={{ padding: '10px' }}>नागरिक नाव</th>
                    <th style={{ padding: '10px' }}>जिल्हा / प्रकार</th>
                    <th style={{ padding: '10px' }}>तातडी</th>
                    <th style={{ padding: '10px' }}>नियुक्त समाजसेवक</th>
                    <th style={{ padding: '10px' }}>सद्य स्थिती</th>
                    <th style={{ padding: '10px' }}>कृती (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {helpRequests.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#312E81' }}>{r.case_number}</td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{r.citizen_name} ({r.citizen_phone})</td>
                      <td style={{ padding: '10px', color: '#475569' }}>{r.district} • {r.category}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          background: r.urgency?.includes('तातडीचे') ? '#FEE2E2' : '#FEF3C7',
                          color: r.urgency?.includes('तातडीचे') ? '#991B1B' : '#92400E',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {r.urgency}
                        </span>
                      </td>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#0F172A' }}>{r.assigned_worker_name || 'समन्वयक'}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          background: r.status?.includes('पूर्ण') ? '#DCFCE7' : '#FEF3C7',
                          color: r.status?.includes('पूर्ण') ? '#166534' : '#92400E',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleUpdateRequestStatus(r.id, 'यशस्वी पूर्ण (Resolved)')}
                            style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                            ✓ पूर्ण झाले
                          </button>
                          <button
                            onClick={() => handleUpdateRequestStatus(r.id, 'प्रगतीपथावर (In Progress)')}
                            style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                            ⚡ काम सुरू
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: WORKER DETAIL & TESTIMONIALS */}
      {selectedWorker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '26px',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedWorker(null)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>
              ✕
            </button>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '2.5rem' }}>{selectedWorker.icon || '🤝'}</span>
              <div>
                <h2 style={{ color: '#312E81', margin: '0 0 4px', fontSize: '1.35rem', fontWeight: 800 }}>{selectedWorker.name}</h2>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ background: '#EEF2FF', color: '#312E81', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem' }}>
                    {selectedWorker.field}
                  </span>
                  <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.78rem' }}>
                    📍 {selectedWorker.location || selectedWorker.district}
                  </span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
              {selectedWorker.bio || selectedWorker.impact}
            </p>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#F8FAFC', padding: '12px', borderRadius: '10px', marginBottom: '16px', textAlign: 'center', fontSize: '0.82rem' }}>
              <div>
                <div style={{ color: '#64748B' }}>कामाचे तास</div>
                <div style={{ fontWeight: 800, color: '#312E81', fontSize: '1.1rem' }}>{selectedWorker.volunteer_hours || 500}+</div>
              </div>
              <div>
                <div style={{ color: '#64748B' }}>प्रकरणे पूर्ण</div>
                <div style={{ fontWeight: 800, color: '#0F766E', fontSize: '1.1rem' }}>{selectedWorker.cases_resolved || 50}+</div>
              </div>
              <div>
                <div style={{ color: '#64748B' }}>रेटींग</div>
                <div style={{ fontWeight: 800, color: '#D97706', fontSize: '1.1rem' }}>⭐ {selectedWorker.rating || 4.9}</div>
              </div>
            </div>

            {/* Testimonials */}
            {workerDetail?.testimonials && workerDetail.testimonials.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                  💬 नागरिकांची प्रशंसापत्रे (Citizen Testimonials)
                </h4>
                {workerDetail.testimonials.map((t, idx) => (
                  <div key={idx} style={{ background: '#F1F5F9', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>{t.citizen_name} ({t.citizen_city}): ⭐⭐⭐⭐⭐</div>
                    <div style={{ color: '#475569', marginTop: '2px' }}>"{t.testimonial}"</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                onClick={() => setIsTestimonialModalOpen(true)}
                style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D', padding: '9px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                ✍️ प्रशंसापत्र लिहा
              </button>
              <button
                onClick={() => setIsHelpModalOpen(true)}
                style={{ background: '#312E81', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                🆘 मदत मागा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REQUEST HELP MODAL */}
      {isHelpModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '560px',
            width: '100%',
            padding: '26px',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsHelpModalOpen(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>
              ✕
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#DC2626', margin: '0 0 6px' }}>
              🆘 तातडीने मदत विनंती फॉर्म (Help Request)
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 16px' }}>
              {selectedWorker ? `प्राधान्य समाजसेवक: ${selectedWorker.name}` : 'आपली विनंती योग्य समाजसेवकाकडे तातडीने सोपवली जाईल.'}
            </p>

            <form onSubmit={handleRequestHelpSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>आपले नाव *</label>
                    <input name="citizenName" required defaultValue={user?.name || ''} placeholder="उदा. अमोल देशमुख" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>मोबाईल नंबर *</label>
                    <input name="citizenPhone" required type="tel" defaultValue={user?.phone || ''} placeholder="9822000000" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>जिल्हा *</label>
                    <select name="district" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                      {MAHARASHTRA_DISTRICTS.filter(d => d !== 'सर्व जिल्हे').map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>तातडीचे स्वरूप *</label>
                    <select name="urgency" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                      <option value="तातडीचे (Emergency)">तातडीचे (Emergency - २४ तासांत)</option>
                      <option value="उच्च (High)">उच्च (High - २ ते ३ दिवस)</option>
                      <option value="मध्यम">मध्यम</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>मदतीचा प्रकार *</label>
                  <select name="category" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                    <option value="वैद्यकीय उपचार व रुग्ण मदत">वैद्यकीय उपचार व रुग्ण मदत</option>
                    <option value="शेतकरी कुटुंब पुनर्वसन">शेतकरी कुटुंब पुनर्वसन</option>
                    <option value="कायदेशीर सल्ला व जात पडताळणी">कायदेशीर सल्ला व जात पडताळणी</option>
                    <option value="शैक्षणिक वसतिगृह व फी साहाय्य">शैक्षणिक वसतिगृह व फी साहाय्य</option>
                    <option value="आपत्कालीन रक्तदान">आपत्कालीन रक्तदान</option>
                    <option value="इतर सामाजिक मदत">इतर सामाजिक मदत</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>समस्येचा सविस्तर तपशील *</label>
                  <textarea name="description" required placeholder="आपल्याला कोणती मदत हवी आहे? रुग्णालय, गाव किंवा परिस्थिती..." rows="3" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }}></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#DC2626',
                    color: '#fff',
                    border: 'none',
                    padding: '11px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}>
                  {isSubmitting ? 'नोंद होत आहे...' : '🆘 मदत विनंती सादर करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VOLUNTEER REGISTRATION MODAL */}
      {isVolunteerModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '26px',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsVolunteerModalOpen(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>
              ✕
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#312E81', margin: '0 0 6px' }}>
              🤝 समाजसेवक / स्वयंसेवक नावनोंदणी अर्ज
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 16px' }}>
              समाजातील गरजूंना मदत करण्यासाठी आपले योगदान नोंदवा.
            </p>

            <form onSubmit={handleVolunteerSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>पूर्ण नाव *</label>
                    <input name="name" required placeholder="आपले नाव" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>मोबाईल नंबर *</label>
                    <input name="phone" required type="tel" placeholder="9822000000" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>जिल्हा *</label>
                    <select name="district" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                      {MAHARASHTRA_DISTRICTS.filter(d => d !== 'सर्व जिल्हे').map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>कार्यक्षेत्र (Field) *</label>
                    <select name="field" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                      <option value="जलसंधारण व दुष्काळ मुक्ती">जलसंधारण व दुष्काळ मुक्ती</option>
                      <option value="ग्रामीण आरोग्य व रुग्णमित्र">ग्रामीण आरोग्य व रुग्णमित्र</option>
                      <option value="शेतकरी कुटुंब आधार">शेतकरी कुटुंब आधार</option>
                      <option value="मोफत कायदेशीर सल्ला">मोफत कायदेशीर सल्ला</option>
                      <option value="रक्तदान व अवयवदान">रक्तदान व अवयवदान</option>
                      <option value="गडकिल्ले संवर्धन">गडकिल्ले संवर्धन</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>उपलब्धता (Availability)</label>
                    <select name="availability" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                      <option value="पूर्णवेळ (Full-time)">पूर्णवेळ (Full-time)</option>
                      <option value="शनिवार-रविवार">शनिवार-रविवार</option>
                      <option value="आपत्कालीन २४x७">आपत्कालीन २४x७</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>संघटना / ट्रस्ट (असल्यास)</label>
                    <input name="organization" placeholder="उदा. सह्याद्री प्रतिष्ठान" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>आपली विशेष कौशल्ये (Skills)</label>
                  <input name="skills" placeholder="उदा. समुपदेशन, रुग्णालय समन्वय, प्राथमिक उपचार, कायदेशीर मसुदा" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                </div>

                <input type="hidden" name="category" value="social" />
                <input type="hidden" name="experience" value="नवीन स्वयंसेवक" />
                <input type="hidden" name="impact" value="मराठा समाजकार्य मंच सक्रिय स्वयंसेवक" />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#312E81',
                    color: '#fff',
                    border: 'none',
                    padding: '11px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}>
                  {isSubmitting ? 'नोंद होत आहे...' : '🤝 स्वयंसेवक म्हणून सामील व्हा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: WRITE TESTIMONIAL MODAL */}
      {isTestimonialModalOpen && selectedWorker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsTestimonialModalOpen(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 700 }}>
              ✕
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#312E81', margin: '0 0 4px' }}>
              ✍️ प्रशंसापत्र नोंदवा (Citizen Appreciation)
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', margin: '0 0 14px' }}>
              समाजसेवक: <strong>{selectedWorker.name}</strong>
            </p>

            <form onSubmit={handleTestimonialSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input name="citizenName" required defaultValue={user?.name || ''} placeholder="आपले नाव *" style={{ padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                <input name="citizenCity" required placeholder="आपले शहर / गाव *" style={{ padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                <textarea name="testimonial" required placeholder="त्यांनी आपल्याला कशी मदत केली? आपला अनुभव लिहा..." rows="3" style={{ padding: '9px', borderRadius: '8px', border: '1px solid #CBD5E1' }}></textarea>
                <input type="hidden" name="rating" value="5" />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#312E81',
                    color: '#fff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}>
                  {isSubmitting ? 'सादर करत आहे...' : 'प्रशंसापत्र प्रकाशित करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
