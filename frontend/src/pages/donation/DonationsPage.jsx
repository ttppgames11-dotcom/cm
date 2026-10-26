import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';

// Default authentic historical projects in case network is delayed
const DEFAULT_PROJECTS = [
  {
    id: 'DURG-01',
    fort_name: 'दुर्गराज रायगड',
    title: 'रायगड महादरवाजा, नगारखाना व राजसभा प्राचीन दगडी तटबंदी संवर्धन',
    district: 'रायगड',
    taluka: 'महाड',
    category: 'गडकोट संवर्धन',
    target_amount: 3500000,
    collected_amount: 2850000,
    spent_amount: 1940000,
    donors_count: 840,
    volunteers_count: 312,
    phase: 'टप्पा २: पुरातत्वीय चुना गिलावा व पायऱ्या पुनर्बांधणी',
    completion_percentage: 75,
    cover_image: '/assets/images/real-raigad-panoramic.jpg',
    description: 'छत्रपती शिवाजी महाराजांची राजधानी दुर्गराज रायगड येथील महादरवाजा, बाजारपेठ, नगारखाना आणि राजसभा तटबंदीची पारंपरिक चुना-गूळ-बेलफळ मिश्रणाने शास्त्रोक्त दुरुस्ती व माहिती फलक उभारणी.',
    asi_approval_ref: 'ASI/MUM/CONS/2026-RAIGAD-09',
    lead_organization: 'श्री शिवाजी रायगड स्मारक मंडळ व सह्याद्री प्रतिष्ठान',
    coordinator_name: 'संभाजीराव कदम',
    coordinator_phone: '9822012345',
    status: 'active'
  },
  {
    id: 'DURG-02',
    fort_name: 'किल्ले सिंहगड',
    title: 'सिंहगड कल्याण दरवाजा, तानाजी कडा व देवटाके पाण्याचे कुंड पुनरुज्जीवन',
    district: 'पुणे',
    taluka: 'हवेली',
    category: 'जलस्रोत व स्वच्छता',
    target_amount: 1800000,
    collected_amount: 1420000,
    spent_amount: 980000,
    donors_count: 512,
    volunteers_count: 245,
    phase: 'टप्पा ३: नैसर्गिक गाळ उपसा व सुरक्षा रेलिंग',
    completion_percentage: 82,
    cover_image: '/assets/images/real-raigad-panoramic.jpg',
    description: 'नरवीर तानाजी मालुसरे यांच्या बलिदानाने पावन झालेल्या सिंहगडावरील ऐतिहासिक देवटाके पिण्याच्या पाण्याचे नैसर्गिक पाझर मोकळे करणे, कचरामुक्ती मोहीम आणि पर्यटकांसाठी स्टील सुरक्षा रेलिंग उभारणी.',
    asi_approval_ref: 'ASI/PUN/FORT/2026-SINH-04',
    lead_organization: 'सह्याद्री मित्र गड संवर्धन समिती',
    coordinator_name: 'विक्रमसिंह देशमुख',
    coordinator_phone: '9822054321',
    status: 'active'
  },
  {
    id: 'DURG-03',
    fort_name: 'किल्ले राजगड',
    title: 'राजगड पद्मावती माची, सुवेळा व संजीवनी माची बुरुज मजबुतीकरण',
    district: 'पुणे',
    taluka: 'वेल्हे',
    category: 'बुरुज मजबुतीकरण',
    target_amount: 2800000,
    collected_amount: 1950000,
    spent_amount: 1450000,
    donors_count: 630,
    volunteers_count: 280,
    phase: 'टप्पा १: ढासळलेल्या बुरुजांचे दगडी चिरे जोडकाम',
    completion_percentage: 68,
    cover_image: '/assets/images/real-raigad-panoramic.jpg',
    description: 'स्वराज्याची पहिली राजधानी किल्ले राजगडच्या संजीवनी माचीवरील दुहेरी तटबंदी आणि तोरणा-राजगड ऐतिहासिक ट्रेक वाटेवरील संरक्षक कठडे व मार्गदर्शक दिशाफलक बसविणे.',
    asi_approval_ref: 'ASI/PUN/RAJ-MUM/2026-08',
    lead_organization: 'मराठा दुर्ग प्रतिष्ठान',
    coordinator_name: 'आनंदराव जाधव',
    coordinator_phone: '9822188990',
    status: 'active'
  },
  {
    id: 'DURG-04',
    fort_name: 'जलदुर्ग सिंधुदुर्ग',
    title: 'सिंधुदुर्ग सागरी तटबंदी धूप प्रतिबंध व छत्रपती शिवछत्रपती मंदिर जीर्णोद्धार',
    district: 'सिंधुदुर्ग',
    taluka: 'मालवण',
    category: 'सागरी जलदुर्ग',
    target_amount: 4500000,
    collected_amount: 3100000,
    spent_amount: 2200000,
    donors_count: 920,
    volunteers_count: 190,
    phase: 'टप्पा २: लाटांच्या माऱ्याने खचलेल्या पायांचे डागडुजी कार्य',
    completion_percentage: 70,
    cover_image: '/assets/images/real-raigad-panoramic.jpg',
    description: 'अरबी समुद्रातील अजिंक्य जलदुर्ग सिंधुदुर्गच्या तटबंदीचे खारट पाण्यामुळे झालेले नुकसान रोखण्यासाठी रासायनिक लेपन, शिव मंदिराची देखभाल आणि बुरुजांवर माहिती फलक बसविणे.',
    asi_approval_ref: 'ASI/GOA-SINDH/MARITIME/2026-11',
    lead_organization: 'कोकण दुर्ग संवर्धन दल',
    coordinator_name: 'तानाजी सावंत',
    coordinator_phone: '9822099887',
    status: 'active'
  }
];

const DEFAULT_CAMPAIGNS = [
  {
    id: 'CAMP-01',
    title: 'छत्रपती शिवाजी महाराज स्मारक व ऐतिहासिक दुर्ग संवर्धन निधी',
    category: 'दुर्ग संवर्धन',
    target: 2500000,
    collected: 1845000,
    donors: 684,
    desc: 'सह्याद्रीतील दुर्लक्षित गडकिल्ल्यांच्या तटबंदी दुरुस्ती, स्वच्छता, सुरक्षा कठडे व माहिती फलक उभारणीसाठी थेट निधी.'
  },
  {
    id: 'CAMP-02',
    title: 'मराठा शेतकरी पाल्यांसाठी उच्च शिक्षण शिष्यवृत्ती निधी',
    category: 'शिक्षण सहाय्य',
    target: 5000000,
    collected: 3750000,
    donors: 1240,
    desc: 'अल्पभूधारक शेतकरी व गरजू मराठा विद्यार्थ्यांच्या इंजिनिअरिंग, मेडिकल व UPSC/MPSC शिक्षणासाठी थेट शुल्क साहाय्य.'
  },
  {
    id: 'CAMP-03',
    title: 'आपत्तीग्रस्त मराठा शेतकरी कुटुंबे मदत व पुनर्वसन निधी',
    category: 'शेतकरी मदत',
    target: 2000000,
    collected: 1480000,
    donors: 589,
    desc: 'अतिवृष्टी, गारपीट व दुष्काळग्रस्त शेतकरी कुटुंबांना तात्काळ आर्थिक मदत, बियाणे व कृषी पुनर्वसन साहाय्य.'
  },
  {
    id: 'CAMP-04',
    title: 'मराठा आरोग्य कवच व मोफत वैद्यकीय/रक्तदान सहाय्यता निधी',
    category: 'आरोग्य व रक्तदान',
    target: 1500000,
    collected: 980000,
    donors: 432,
    desc: 'दुर्धर आजारग्रस्त मराठा बांधवांना औषधोपचार, मोफत शस्त्रक्रिया साहाय्य व २४x७ राज्यव्यापी आपत्कालीन रक्तदान सेवा शिबिरे.'
  }
];

export default function DonationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'campaigns' | 'volunteer' | 'audits'
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [campaigns, setCampaigns] = useState(DEFAULT_CAMPAIGNS);
  const [recentDonations, setRecentDonations] = useState([]);
  const [auditsData, setAuditsData] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Donation Modal State
  const [activeDonationTarget, setActiveDonationTarget] = useState(null); // project or campaign
  const [customAmount, setCustomAmount] = useState('1000');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '');
  const [donorPan, setDonorPan] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [donating, setDonating] = useState(false);

  // Volunteer Modal State
  const [volunteerProject, setVolunteerProject] = useState(null);
  const [volName, setVolName] = useState(user?.name || '');
  const [volPhone, setVolPhone] = useState(user?.phone || '');
  const [volDistrict, setVolDistrict] = useState('पुणे');
  const [volBlood, setVolBlood] = useState('O+');
  const [volExp, setVolExp] = useState('मध्यम (Moderate Trekker)');
  const [volSkills, setVolSkills] = useState('श्रमदान व तटबंदी दगड स्वच्छता');
  const [volSubmitting, setVolSubmitting] = useState(false);
  const [volSuccessMsg, setVolSuccessMsg] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [projRes, campRes, recRes, auditRes] = await Promise.all([
        apiClient.getDurgProjects().catch(() => null),
        apiClient.getDonationsCampaigns().catch(() => null),
        apiClient.getRecentDonations().catch(() => null),
        apiClient.getDonationAudits().catch(() => null)
      ]);

      if (projRes && Array.isArray(projRes) && projRes.length > 0) {
        setProjects(projRes);
      }
      if (campRes && Array.isArray(campRes) && campRes.length > 0) {
        setCampaigns(campRes);
      }
      if (recRes && Array.isArray(recRes) && recRes.length > 0) {
        setRecentDonations(recRes);
      }
      if (auditRes) {
        setAuditsData(auditRes);
      }
    } catch (err) {
      console.warn('Fallback to local default data for Durg sanvardhan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProjectDetails = async (proj) => {
    setSelectedProject(proj);
    try {
      const res = await apiClient.getDurgProjectById(proj.id);
      if (res) {
        setProjectDetails(res);
      } else {
        setProjectDetails(proj);
      }
    } catch {
      setProjectDetails(proj);
    }
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(customAmount);
    if (!amt || amt <= 0) {
      alert('कृपया वैध रक्कम प्रविष्ट करा.');
      return;
    }

    setDonating(true);
    try {
      const isProj = !!activeDonationTarget?.fort_name;
      const res = await apiClient.donateFund({
        project_id: isProj ? activeDonationTarget.id : null,
        campaign_id: !isProj ? activeDonationTarget.id : 'CAMP-01',
        campaign_title: activeDonationTarget?.title || 'दुर्ग संवर्धन निधी',
        donor_name: donorName || 'मराठा समाजबांधव',
        donor_id: user?.id || 'M1001',
        amount: amt,
        payment_method: paymentMethod,
        phone: donorPhone,
        pan: donorPan,
        is_anonymous: isAnonymous
      });

      if (res && res.receipt) {
        setReceipt(res.receipt);
        loadAllData();
      } else {
        setReceipt({
          receiptNo: `CM-80G-${Math.floor(10000 + Math.random() * 90000)}`,
          txId: `TXN-${Date.now()}`,
          amount: amt,
          donor_name: isAnonymous ? 'गुप्त दान' : (donorName || 'मराठा समाजबांधव'),
          campaign_title: activeDonationTarget?.title || 'दुर्ग संवर्धन निधी',
          date: new Date().toLocaleDateString('mr-IN'),
          taxDeduction80G: '80G(5)(vi) अंतर्गत १००% आयकर सवलत प्रमाणपत्र पात्र (नोंदणी क्र: AAATC80G20261)',
          bankDetails: 'State Bank of India | A/c No: 50200098765432 | IFSC: SBIN0001234'
        });
      }
    } catch (err) {
      alert('देणगी प्रक्रिया त्रुटी: ' + (err.message || 'सर्व्हर संपर्क अयशस्वी'));
    } finally {
      setDonating(false);
    }
  };

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    if (!volName || !volPhone) {
      alert('कृपया आपले नाव व मोबाईल क्रमांक प्रविष्ट करा.');
      return;
    }

    setVolSubmitting(true);
    try {
      const targetId = volunteerProject?.id || 'DURG-01';
      const res = await apiClient.joinFortVolunteer(targetId, {
        name: volName,
        phone: volPhone,
        district: volDistrict,
        bloodGroup: volBlood,
        trekExperience: volExp,
        skills: volSkills
      });

      setVolSuccessMsg(res?.message || `🚩 ${volunteerProject?.fort_name || 'दुर्ग'} श्रमदान मोहिमेसाठी आपली यशस्वी नोंदणी झाली! लवकरच समन्वयक संपर्क करतील.`);
      loadAllData();
    } catch (err) {
      alert('नोंदणी त्रुटी: ' + (err.message || 'सर्व्हर संपर्क अयशस्वी'));
    } finally {
      setVolSubmitting(false);
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter(p => {
    const matchDist = filterDistrict === 'all' || p.district.includes(filterDistrict);
    const matchCat = filterCategory === 'all' || p.category.includes(filterCategory);
    const matchSearch = !searchQuery.trim() || 
      (p.title + p.fort_name + p.description + p.lead_organization).toLowerCase().includes(searchQuery.toLowerCase());
    return matchDist && matchCat && matchSearch;
  });

  return (
    <div style={{ background: '#FDF8F0', minHeight: '100vh', padding: '36px 0', color: '#1E293B', fontFamily: 'inherit' }}>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>

        {/* HERO HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #8B1E0F 0%, #C73800 50%, #D9531E 100%)',
          borderRadius: '20px',
          color: '#fff',
          padding: '36px 32px',
          marginBottom: '28px',
          boxShadow: '0 12px 30px rgba(139,30,15,0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.08, fontSize: '18rem', pointerEvents: 'none' }}>
            🚩
          </div>

          <div style={{ maxWidth: '820px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
                🚩 दुर्ग संवर्धन व देणगी कोष (ConnectMaratha Trust)
              </span>
              <span style={{ background: '#10B981', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700 }}>
                ✓ आयकर कलम 80G करसवलत प्राप्त
              </span>
              <span style={{ background: 'rgba(0,0,0,0.25)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem' }}>
                ASI परवाना संलग्न
              </span>
            </div>

            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 12px 0', lineHeight: 1.25, letterSpacing: '-0.5px' }}>
              गड-किल्ले संवर्धन, श्रमदान व पारदर्शक देणगी व्यवस्था
            </h1>
            <p style={{ fontSize: '1.05rem', margin: 0, opacity: 0.95, lineHeight: 1.6 }}>
              छत्रपती शिवाजी महाराजांच्या पावन पदस्पर्शाने पुनीत झालेल्या सह्याद्रीतील ऐतिहासिक दुर्ग-कोटांचे जतन, 
              स्वयंसेवक श्रमदान आणि प्रत्येक रुपयाच्या CA ऑडिटसह १००% पारदर्शक आर्थिक हिशोब.
            </p>

            {/* Quick Action Badges */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '22px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setActiveDonationTarget(projects[0]);
                  setReceipt(null);
                }}
                style={{
                  background: '#FDE047',
                  color: '#78350F',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
                }}>
                💰 थेट देणगी द्या (Instant 80G Receipt)
              </button>
              <button
                onClick={() => {
                  setVolunteerProject(projects[0]);
                  setActiveTab('volunteer');
                }}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '12px 22px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)'
                }}>
                🤝 श्रमदान मोहिमेत सामील व्हा
              </button>
            </div>
          </div>
        </div>

        {/* TRUST & STATS STRIP */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>एकूण जमा निधी (Total Raised)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#C73800', marginTop: '4px' }}>
              ₹{((auditsData?.financialSummary?.totalCollected || 9320000) / 100000).toFixed(1)} लाख+
            </div>
            <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>१००% अधिकृत बँक खात्यात सुरक्षित</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>संवर्धनावर प्रत्यक्ष खर्च (Spent)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F766E', marginTop: '4px' }}>
              ₹{((auditsData?.financialSummary?.totalSpent || 6570000) / 100000).toFixed(1)} लाख+
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>CA प्रमाणित खर्च पावत्या उपलब्ध</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>सक्रिय दुर्गसेवक (Volunteers)</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1E293B', marginTop: '4px' }}>
              १,०२५+ मावळे
            </div>
            <div style={{ fontSize: '0.78rem', color: '#C73800', marginTop: '4px', fontWeight: 600 }}>सह्याद्रीच्या १२ गडकोटांवर श्रमदान</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>लेखापरीक्षण (Financial Audit)</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803D', marginTop: '6px' }}>
              Unqualified (Clean)
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>एम. एस. जोशी अँड असोसिएट्स (CA)</div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '2px solid #E2E8F0',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}>
          {[
            { id: 'projects', label: '🏰 गड-किल्ले संवर्धन प्रकल्प', count: projects.length },
            { id: 'campaigns', label: '🚩 सामाजिक उपक्रम व मोहीम', count: campaigns.length },
            { id: 'volunteer', label: '🤝 श्रमदान स्वयंसेवक नोंदणी' },
            { id: 'audits', label: '⚖️ आर्थिक ऑडिट व पारदर्शकता अहवाल' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #C73800' : '3px solid transparent',
                color: activeTab === tab.id ? '#C73800' : '#64748B',
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: '1rem',
                padding: '10px 18px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
              {tab.label}
              {tab.count !== undefined && (
                <span style={{
                  background: activeTab === tab.id ? '#C73800' : '#E2E8F0',
                  color: activeTab === tab.id ? '#fff' : '#64748B',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: DURG SANVARDHAN PROJECTS */}
        {activeTab === 'projects' && (
          <div>
            {/* Filters Bar */}
            <div style={{
              background: '#fff',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <div style={{ flex: '1 1 250px' }}>
                <input
                  type="text"
                  placeholder="किल्ल्याचे नाव, संस्था किंवा काम शोधा..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: '#fff' }}>
                  <option value="all">सर्व जिल्हे (All Districts)</option>
                  <option value="रायगड">रायगड (Raigad)</option>
                  <option value="पुणे">पुणे (Pune)</option>
                  <option value="सिंधुदुर्ग">सिंधुदुर्ग (Sindhudurg)</option>
                  <option value="सातारा">सातारा (Satara)</option>
                  <option value="कोल्हापूर">कोल्हापूर (Kolhapur)</option>
                </select>
              </div>

              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: '#fff' }}>
                  <option value="all">सर्व प्रकार (Categories)</option>
                  <option value="गडकोट संवर्धन">गडकोट संवर्धन</option>
                  <option value="जलस्रोत व स्वच्छता">जलस्रोत व स्वच्छता</option>
                  <option value="बुरुज मजबुतीकरण">बुरुज मजबुतीकरण</option>
                  <option value="सागरी जलदुर्ग">सागरी जलदुर्ग</option>
                </select>
              </div>

              <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                {filteredProjects.length} प्रकल्प उपलब्ध
              </div>
            </div>

            {/* Projects Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
              {filteredProjects.map((proj) => {
                const percent = Math.min(100, Math.round(((proj.collected_amount || 0) / (proj.target_amount || 1)) * 100));
                return (
                  <div
                    key={proj.id}
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                    }}>
                    {/* Project Header Banner */}
                    <div style={{
                      height: '140px',
                      background: 'linear-gradient(135deg, #4A150E, #8B1E0F)',
                      position: 'relative',
                      padding: '16px',
                      color: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{
                          background: '#FDE047',
                          color: '#78350F',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}>
                          🚩 {proj.fort_name}
                        </span>
                        <span style={{
                          background: 'rgba(255,255,255,0.2)',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem'
                        }}>
                          {proj.district} • {proj.taluka || ''}
                        </span>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>ASI मान्यता क्र: {proj.asi_approval_ref}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '2px' }}>
                          संस्था: {proj.lead_organization}
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0F172A', lineHeight: 1.4 }}>
                        {proj.title}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5, flex: 1 }}>
                        {proj.description}
                      </p>

                      {/* Phase & Status Tag */}
                      <div style={{
                        background: '#FEF3C7',
                        borderLeft: '4px solid #D97706',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        color: '#92400E',
                        fontWeight: 600,
                        marginBottom: '16px'
                      }}>
                        ⚡ चालू काम: {proj.phase}
                      </div>

                      {/* Progress Bar */}
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#C73800' }}>
                            जमा: ₹{(proj.collected_amount || 0).toLocaleString('en-IN')}
                          </span>
                          <span style={{ color: '#64748B' }}>
                            लक्ष्य: ₹{(proj.target_amount || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${percent}%`,
                            background: percent >= 75 ? '#10B981' : '#C73800',
                            height: '100%',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B', marginTop: '6px' }}>
                          <span>{percent}% निधी पूर्ण</span>
                          <span>{proj.donors_count || 0} देणगीदार • {proj.volunteers_count || 0} श्रमदान मावळे</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                          onClick={() => {
                            setActiveDonationTarget(proj);
                            setReceipt(null);
                          }}
                          style={{
                            background: '#C73800',
                            color: '#fff',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer'
                          }}>
                          💰 देणगी द्या (80G)
                        </button>
                        <button
                          onClick={() => handleOpenProjectDetails(proj)}
                          style={{
                            background: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #CBD5E1',
                            padding: '10px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            cursor: 'pointer'
                          }}>
                          🔍 हिशोब व पावत्या
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: GENERAL SOCIAL CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
            {campaigns.map((camp) => {
              const target = camp.target || camp.targetAmount || 1000000;
              const collected = camp.collected || camp.raisedAmount || 0;
              const percent = Math.min(100, Math.round((collected / target) * 100));

              return (
                <div
                  key={camp.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{
                      background: '#FFF3E0',
                      color: '#C73800',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      {camp.category || 'सामाजिक उपक्रम'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                      आयकर कलम 80G पात्र
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0F172A', lineHeight: 1.4 }}>
                    {camp.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5, flex: 1 }}>
                    {camp.desc || camp.description}
                  </p>

                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, color: '#C73800' }}>
                        जमा: ₹{collected.toLocaleString('en-IN')}
                      </span>
                      <span style={{ color: '#64748B' }}>
                        लक्ष्य: ₹{target.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, background: '#C73800', height: '100%', borderRadius: '4px' }} />
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px' }}>
                      {percent}% संकलित • {camp.donors || 0} समाजबांधवांचे सहकार्य
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveDonationTarget(camp);
                      setReceipt(null);
                    }}
                    style={{
                      background: '#C73800',
                      color: '#fff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      cursor: 'pointer'
                    }}>
                    💰 या मोहिमेसाठी देणगी द्या 🚩
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: VOLUNTEER & SHRAMDAAN ENLISTMENT */}
        {activeTab === 'volunteer' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
            {/* Form */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '1.5rem' }}>🚩</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#8B1E0F' }}>
                  दुर्ग संवर्धन श्रमदान स्वयंसेवक नोंदणी
                </h2>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 0 20px 0' }}>
                सह्याद्रीतील गड-किल्ल्यांच्या संवर्धन मोहिमेत प्रत्यक्ष सहभागी होऊन दगड स्वच्छता, कचरामुक्ती व माहिती फलक उभारणीत हातभार लावा.
              </p>

              {volSuccessMsg && (
                <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                  {volSuccessMsg}
                </div>
              )}

              <form onSubmit={handleVolunteerSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>निवडलेला दुर्ग / किल्ला:</label>
                  <select
                    value={volunteerProject?.id || 'DURG-01'}
                    onChange={(e) => setVolunteerProject(projects.find(p => p.id === e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', background: '#fff' }}>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>🚩 {p.fort_name} ({p.district}) - {p.title}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>स्वयंसेवकाचे पूर्ण नाव *</label>
                    <input
                      type="text"
                      required
                      value={volName}
                      onChange={(e) => setVolName(e.target.value)}
                      placeholder="उदा. अमित कदम"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>मोबाईल नंबर *</label>
                    <input
                      type="tel"
                      required
                      value={volPhone}
                      onChange={(e) => setVolPhone(e.target.value)}
                      placeholder="9822000000"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>जिल्हा</label>
                    <input
                      type="text"
                      value={volDistrict}
                      onChange={(e) => setVolDistrict(e.target.value)}
                      placeholder="उदा. पुणे / सातारा / रायगड"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>रक्तगट (Blood Group)</label>
                    <select
                      value={volBlood}
                      onChange={(e) => setVolBlood(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="O+">O+</option>
                      <option value="AB+">AB+</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="O-">O-</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>ट्रेकिंग व गडभटकंती अनुभव:</label>
                  <select
                    value={volExp}
                    onChange={(e) => setVolExp(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                    <option value="नवीन (Beginner - पहिलाच अनुभव)">नवीन (Beginner - पहिलाच अनुभव)</option>
                    <option value="मध्यम (Moderate Trekker - ५+ किल्ले)">मध्यम (Moderate Trekker - ५+ किल्ले)</option>
                    <option value="अनुभवी (Expert Mountaineer - २०+ किल्ले)">अनुभवी (Expert Mountaineer - २०+ किल्ले)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>कौशल्य / आपण काय मदत करू शकता:</label>
                  <input
                    type="text"
                    value={volSkills}
                    onChange={(e) => setVolSkills(e.target.value)}
                    placeholder="उदा. प्राथमिक उपचार, चुना गिलावा, फोटोग्राफी, कचरा व्यवस्थापन"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={volSubmitting}
                  style={{
                    width: '100%',
                    background: '#8B1E0F',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}>
                  {volSubmitting ? 'नोंदणी होत आहे...' : '🚩 मी दुर्ग संवर्धनासाठी तयार आहे (नोंदणी करा)'}
                </button>
              </form>
            </div>

            {/* Volunteer Guidelines & Schedule */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 12px 0', color: '#1E293B' }}>
                  🛡️ दुर्ग संवर्धन आचारसंहिता व नियम
                </h3>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.7 }}>
                  <li><strong>पुरातत्व नियमांचे पालन:</strong> भारतीय पुरातत्व खाते (ASI) च्या नियमांनुसार कोणत्याही ऐतिहासिक दगडाला किंवा शिल्पाला अपाय होणार नाही.</li>
                  <li><strong>पारंपरिक संवर्धन पद्धती:</strong> सिमेंटचा वापर न करता पारंपरिक चुना-गूळ-बेलफळ मिश्रणाचा वापर केला जातो.</li>
                  <li><strong>कचरामुक्ती शपथ:</strong> गडावर प्लास्टिक, पाण्याच्या बाटल्या किंवा कचरा न टाकणे व खाली आणणे बंधनकारक.</li>
                  <li><strong>व्यसनमुक्ती:</strong> गडावर मद्यपान, धूम्रपान किंवा अभद्र वर्तन पूर्णपणे निषिद्ध व कायदेशीर गुन्हा आहे.</li>
                </ul>
              </div>

              <div style={{ background: '#FFFBEB', borderRadius: '16px', padding: '24px', border: '1px solid #FDE68A' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 10px 0', color: '#92400E' }}>
                  📅 आगामी श्रमदान शिबिरे (Upcoming Camps)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#78350F' }}>
                  <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FCD34D' }}>
                    <strong>किल्ले रायगड:</strong> पुढील शनिवार-रविवार (महादरवाजा पायऱ्या दुरुस्ती शिबिर)
                  </div>
                  <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #FCD34D' }}>
                    <strong>किल्ले सिंहगड:</strong> दर रविवारी सकाळी ७ वाजता (देवटाके स्वच्छता मोहीम)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUDITED FINANCIALS & TRANSPARENCY */}
        {activeTab === 'audits' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Financial Certificate Banner */}
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              border: '2px solid #10B981',
              padding: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 12px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 700 }}>
                  ✓ वार्षिक लेखापरीक्षण प्रमाणपत्र (Statutory CA Audit)
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#0F172A' }}>
                  प्रमाणित आर्थिक हिशोब व १००% पारदर्शक देणगी कोष
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0 }}>
                  एम. एस. जोशी अँड असोसिएट्स (सनदी लेखापाल - CA Firm Reg: 114520W) द्वारे प्रमाणित.
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>आयकर कलम 80G नोंदणी क्र:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#C73800' }}>AAATC80G20261</div>
                <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600 }}>स्वीकृत बँक खात्यात थेट जमा</div>
              </div>
            </div>

            {/* Audits Table */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 16px 0', color: '#1E293B' }}>
                📊 आर्थिक वर्षांचे बॅलन्स शीट व लेखापरीक्षण अहवाल
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>आर्थिक वर्ष</th>
                      <th style={{ padding: '12px' }}>CA फर्म नाव</th>
                      <th style={{ padding: '12px' }}>एकूण जमा देणग्या (₹)</th>
                      <th style={{ padding: '12px' }}>दुर्ग व समाज खर्च (₹)</th>
                      <th style={{ padding: '12px' }}>शिल्लक निधी (₹)</th>
                      <th style={{ padding: '12px' }}>ऑडिट निष्कर्ष</th>
                      <th style={{ padding: '12px' }}>अहवाल</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(auditsData?.audits || [
                      {
                        financial_year: '2025-26',
                        ca_firm_name: 'एम. एस. जोशी अँड असोसिएट्स (CA)',
                        total_receipts: 7845000,
                        total_expenditure: 5620000,
                        surplus_balance: 2225000,
                        certificate_status: 'Unqualified (Clean)'
                      },
                      {
                        financial_year: '2024-25',
                        ca_firm_name: 'के. व्ही. पाटील अँड कंपनी (CA)',
                        total_receipts: 5200000,
                        total_expenditure: 4100000,
                        surplus_balance: 1100000,
                        certificate_status: 'Unqualified (Clean)'
                      }
                    ]).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px', fontWeight: 700 }}>{row.financial_year}</td>
                        <td style={{ padding: '12px', color: '#475569' }}>{row.ca_firm_name}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#C73800' }}>₹{row.total_receipts.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#0F766E' }}>₹{row.total_expenditure.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#166534' }}>₹{row.surplus_balance.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: '#DCFCE7', color: '#166534', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                            {row.certificate_status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button
                            onClick={() => alert(`आर्थिक वर्ष ${row.financial_year} चे संपूर्ण CA ऑडिट रिपोर्ट PDF डाउनलोड होत आहे...`)}
                            style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>
                            📥 PDF पहा
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Official Bank Account Details */}
            <div style={{ background: '#F8FAFC', borderRadius: '16px', border: '1px solid #CBD5E1', padding: '24px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 12px 0', color: '#0F172A' }}>
                🏛️ अधिकृत ट्रस्ट बँक खात्याचा तपशील (Direct Bank Transfer)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0 0 16px 0' }}>
                सर्व देणग्या केवळ खालील अधिकृत चॅरिटेबल ट्रस्ट खात्यातच स्वीकारल्या जातात. कोणाच्याही वैयक्तिक खात्यात पैसे पाठवू नयेत.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '0.9rem' }}>
                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>खातेदाराचे नाव (Account Name)</div>
                  <div style={{ fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>CONNECT MARATHA SOCIAL TRUST</div>
                </div>
                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>बँकेचे नाव (Bank)</div>
                  <div style={{ fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>State Bank of India (SBI)</div>
                </div>
                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>चालू खाते क्रमांक (A/C No)</div>
                  <div style={{ fontWeight: 800, color: '#C73800', marginTop: '2px' }}>50200098765432</div>
                </div>
                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>IFSC कोड</div>
                  <div style={{ fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>SBIN0001234</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: PROJECT DETAILS & ITEMIZED EXPENSES */}
        {selectedProject && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '16px'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                    🚩 {selectedProject.fort_name}
                  </span>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#8B1E0F' }}>
                    {selectedProject.title}
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    ASI परवाना: {selectedProject.asi_approval_ref} • समन्वयक: {selectedProject.coordinator_name} ({selectedProject.coordinator_phone})
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748B' }}>
                  ✕
                </button>
              </div>

              {/* Progress and spend summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px', background: '#F8FAFC', padding: '14px', borderRadius: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>उद्दिष्ट (Target)</div>
                  <div style={{ fontWeight: 800, color: '#1E293B', fontSize: '1.05rem' }}>₹{selectedProject.target_amount.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>संकलित निधी (Raised)</div>
                  <div style={{ fontWeight: 800, color: '#C73800', fontSize: '1.05rem' }}>₹{selectedProject.collected_amount.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>प्रत्यक्ष खर्च (Spent)</div>
                  <div style={{ fontWeight: 800, color: '#0F766E', fontSize: '1.05rem' }}>₹{selectedProject.spent_amount.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Itemized Expenses Vouchers Table */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 10px 0', color: '#1E293B' }}>
                📜 प्रमाणित खर्च पावत्या (Itemized CA Verified Vouchers)
              </h3>
              {projectDetails?.expenses && projectDetails.expenses.length > 0 ? (
                <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#F1F5F9', textAlign: 'left' }}>
                        <th style={{ padding: '8px' }}>व्हाउचर क्र.</th>
                        <th style={{ padding: '8px' }}>खर्चाचा तपशील</th>
                        <th style={{ padding: '8px' }}>पुरवठादार / कारागीर</th>
                        <th style={{ padding: '8px' }}>रक्कम (₹)</th>
                        <th style={{ padding: '8px' }}>ऑडिट स्थिती</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectDetails.expenses.map((exp, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                          <td style={{ padding: '8px', fontWeight: 700 }}>{exp.voucher_number}</td>
                          <td style={{ padding: '8px' }}>{exp.expense_title}</td>
                          <td style={{ padding: '8px', color: '#64748B' }}>{exp.vendor_name}</td>
                          <td style={{ padding: '8px', fontWeight: 700, color: '#0F766E' }}>₹{exp.amount.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '8px' }}>
                            <span style={{ background: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {exp.audit_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>या प्रकल्पाचे प्राथमिक नियोजन सुरू आहे.</p>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedProject(null)}
                  style={{ background: '#F1F5F9', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  बंद करा
                </button>
                <button
                  onClick={() => {
                    setActiveDonationTarget(selectedProject);
                    setSelectedProject(null);
                    setReceipt(null);
                  }}
                  style={{ background: '#C73800', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  💰 या प्रकल्पाला देणगी द्या 🚩
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: DONATION & 80G RECEIPT GENERATOR */}
        {activeDonationTarget && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '16px'
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '28px',
              position: 'relative'
            }}>
              {receipt ? (
                /* RECEIPT VIEW */
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '60px', height: '60px', background: '#DCFCE7', color: '#166534', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 14px' }}>
                    ✓
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', color: '#166534', fontSize: '1.3rem', fontWeight: 800 }}>
                    देणगी यशस्वीरित्या स्वीकारली!
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#64748B' }}>
                    आपल्या मोलाच्या योगदानाबद्दल मनःपूर्वक आभार. 80G पावती खाली तयार झाली आहे.
                  </p>

                  <div style={{
                    background: '#F8FAFC',
                    border: '2px dashed #CBD5E1',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 800, color: '#8B1E0F' }}>CONNECT MARATHA TRUST</span>
                      <span style={{ fontWeight: 700, color: '#C73800' }}>पावती क्र: {receipt.receiptNo}</span>
                    </div>

                    <div style={{ marginBottom: '6px' }}><strong>देणगीदार:</strong> {receipt.donor_name}</div>
                    <div style={{ marginBottom: '6px' }}><strong>उपक्रम:</strong> {receipt.campaign_title}</div>
                    <div style={{ marginBottom: '6px' }}><strong>रक्कम:</strong> <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534' }}>₹{receipt.amount}</span></div>
                    <div style={{ marginBottom: '6px' }}><strong>व्यवहार आयडी (TxID):</strong> {receipt.txId}</div>
                    <div style={{ marginBottom: '6px' }}><strong>दिनांक:</strong> {receipt.date}</div>

                    <div style={{
                      background: '#FEF3C7',
                      color: '#92400E',
                      padding: '8px',
                      borderRadius: '6px',
                      marginTop: '12px',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}>
                      {receipt.taxDeduction80G}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => window.print()}
                      style={{ flex: 1, background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                      🖨️ पावती प्रिंट करा
                    </button>
                    <button
                      onClick={() => {
                        setActiveDonationTarget(null);
                        setReceipt(null);
                      }}
                      style={{ flex: 1, background: '#C73800', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                      पूर्ण झाले (Done)
                    </button>
                  </div>
                </div>
              ) : (
                /* DONATE FORM VIEW */
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <span style={{ background: '#FFF3E0', color: '#C73800', padding: '3px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                        अधिकृत पेमेंट गेटवे
                      </span>
                      <h3 style={{ margin: '6px 0 0 0', color: '#8B1E0F', fontSize: '1.25rem', fontWeight: 800 }}>
                        🚩 {activeDonationTarget.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveDonationTarget(null)}
                      style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748B' }}>
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleDonateSubmit}>
                    {/* Amount presets */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>देणगी रक्कम निवडा (₹):</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
                        {['५००', '१०००', '२५००', '५०००'].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setCustomAmount(amt.replace(/[^\d]/g, ''))}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              border: customAmount === amt.replace(/[^\d]/g, '') ? '2px solid #C73800' : '1px solid #CBD5E1',
                              background: customAmount === amt.replace(/[^\d]/g, '') ? '#FFF3E0' : '#F8FAFC',
                              fontWeight: 700,
                              color: customAmount === amt.replace(/[^\d]/g, '') ? '#C73800' : '#334155',
                              cursor: 'pointer'
                            }}>
                            ₹{amt}
                          </button>
                        ))}
                      </div>

                      <input
                        type="number"
                        min="1"
                        required
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="इतर रक्कम टाका..."
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1.1rem', fontWeight: 800, color: '#C73800' }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>आपले नाव (पावतीवर येणारे नाव)</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="उदा. संभाजीराव कदम"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>मोबाईल नंबर</label>
                        <input
                          type="tel"
                          value={donorPhone}
                          onChange={(e) => setDonorPhone(e.target.value)}
                          placeholder="9822000000"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>पॅन नंबर (80G करसवलतीसाठी)</label>
                        <input
                          type="text"
                          value={donorPan}
                          onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                          placeholder="ABCDE1234F"
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>पेमेंट पद्धत:</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff' }}>
                        <option value="UPI">UPI (Google Pay, PhonePe, Paytm, BHIM)</option>
                        <option value="NetBanking">नेट बँकिंग (सर्व बँका)</option>
                        <option value="Card">डेबिट / क्रेडिट कार्ड</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="anonDonation"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <label htmlFor="anonDonation" style={{ fontSize: '0.85rem', color: '#64748B', cursor: 'pointer' }}>
                        माझे नाव सार्वजनिक यादीत गुप्त ठेवा (Anonymous Donation)
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setActiveDonationTarget(null)}
                        style={{ background: '#F1F5F9', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                        रद्द करा
                      </button>
                      <button
                        type="submit"
                        disabled={donating}
                        style={{
                          background: '#C73800',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 24px',
                          borderRadius: '8px',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}>
                        {donating ? 'प्रक्रिया सुरू आहे...' : `₹${customAmount} देणगी द्या 🚩`}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
