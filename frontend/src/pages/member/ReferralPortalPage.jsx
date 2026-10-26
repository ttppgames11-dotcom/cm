import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import apiClient from '../../services/apiClient';
import {
  getMemberReferralData,
  exportReferralsToCSV,
  formatMemberReferralCode
} from '../../services/referralService';

export default function ReferralPortalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Primary Tab State: default to 'membership' (12-column rewards table), 'business', or 'tree' (Hierarchy Flow)
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get('tab') === 'business' ? 'business' : (searchParams.get('tab') === 'tree' ? 'tree' : 'membership');
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'business') {
      setActiveTab('business');
    } else if (params.get('tab') === 'membership') {
      setActiveTab('membership');
    } else if (params.get('tab') === 'tree') {
      setActiveTab('tree');
    }
  }, [location.search]);

  // Business Referral Sub-filters
  const [b2bFilter, setB2bFilter] = useState('all'); // 'all' | 'received' | 'given' | 'won'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Referral Data & Metrics
  const [referrals, setReferrals] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [statusModalRef, setStatusModalRef] = useState(null);
  const [newStatus, setNewStatus] = useState('संपर्क साधला (Contacted)');
  const [statusNotes, setStatusNotes] = useState('');
  const [statusValue, setStatusValue] = useState('');

  const [tyfcbModalRef, setTyfcbModalRef] = useState(null);
  const [tyfcbValue, setTyfcbValue] = useState('');
  const [tyfcbType, setTyfcbType] = useState('नवीन व्यवसाय (New Business)');
  const [tyfcbMessage, setTyfcbMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Membership Referral State
  const [copied, setCopied] = useState(false);
  const [memberReferrals, setMemberReferrals] = useState([]);
  const [memberScopeFilter, setMemberScopeFilter] = useState('all'); // 'all' (सर्व आधीचा व चालू डेटा) | 'my' (केवळ माझे संदर्भ)
  const [memberReferralMetrics, setMemberReferralMetrics] = useState(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all');
  const [memberPackageFilter, setMemberPackageFilter] = useState('all');
  const [selectedMemberModal, setSelectedMemberModal] = useState(null);

  // Hierarchy Flow & Tree State
  const [treeData, setTreeData] = useState([]);
  const [treeFlatList, setTreeFlatList] = useState([]);
  const [treeMetrics, setTreeMetrics] = useState(null);
  const [treeLoading, setTreeLoading] = useState(false);
  const [treeExpanded, setTreeExpanded] = useState({});
  const [treeLevelFilter, setTreeLevelFilter] = useState('all');
  const [treeSearchQuery, setTreeSearchQuery] = useState('');
  const [treeDisplayMode, setTreeDisplayMode] = useState('table'); // 'table' (सिम्पल टेबल) | 'cards' (कार्ड्स व्ह्यू)

  // Fetch referrals and chapter metrics
  const fetchSangamData = async () => {
    try {
      setLoading(true);
      const [refsRes, metRes] = await Promise.all([
        api.sangam ? api.sangam.getReferrals({ type: 'all' }) : apiClient.getReferrals({ type: 'all' }),
        api.sangam ? api.sangam.getMetrics() : apiClient.fetchJson('/sangam/metrics').catch(() => null)
      ]);

      if (refsRes && (refsRes.data?.referrals || refsRes.referrals)) {
        setReferrals(refsRes.data?.referrals || refsRes.referrals);
      }
      if (metRes && (metRes.data?.metrics || metRes.metrics)) {
        setMetrics(metRes.data?.metrics || metRes.metrics);
      }

      // Load registered member referrals from persistent SQLite:
      // Fetch both personal referrals and master historical CRM referrals so ALL past data is available!
      try {
        const [memRes, allCrm] = await Promise.all([
          apiClient.getMemberReferrals().catch(() => null),
          apiClient.getAllMemberReferrals().catch(() => [])
        ]);

        let combined = [];
        if (Array.isArray(allCrm) && allCrm.length > 0) {
          combined = allCrm;
        } else if (memRes && memRes.success && Array.isArray(memRes.referrals) && memRes.referrals.length > 0) {
          combined = memRes.referrals;
        } else {
          const localData = getMemberReferralData(user);
          combined = localData.referrals || [];
        }

        setMemberReferrals(combined);
        setMemberReferralMetrics({
          totalReferred: combined.length,
          activeSubscribed: combined.filter(r => (r.status || '').toLowerCase() === 'active').length,
          totalEarnings: combined.length * 100
        });
      } catch (_) {
        const localData = getMemberReferralData(user);
        setMemberReferrals(localData.referrals || []);
      }
    } catch (err) {
      console.warn('Error loading referrals data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTreeData = async () => {
    try {
      setTreeLoading(true);
      const memberId = user?.id || user?.member_id || user?.phone || 'M474782';
      const res = await apiClient.getMemberReferralTree(memberId);
      if (res && res.success) {
        setTreeData(res.tree || []);
        setTreeFlatList(res.flatList || []);
        setTreeMetrics(res.metrics || null);
        // Automatically expand all Level 1 nodes by default
        const initialExpanded = {};
        (res.tree || []).forEach(node => {
          initialExpanded[node.id] = true;
          if (node.children) {
            node.children.forEach(child => {
              initialExpanded[child.id] = true;
            });
          }
        });
        setTreeExpanded(initialExpanded);
      }
    } catch (err) {
      console.warn('Error loading referral tree:', err);
    } finally {
      setTreeLoading(false);
    }
  };

  useEffect(() => {
    fetchSangamData();
    fetchTreeData();

    const handleReferralUpdate = () => {
      fetchSangamData();
      fetchTreeData();
    };
    window.addEventListener('cm_referral_updated', handleReferralUpdate);
    return () => {
      window.removeEventListener('cm_referral_updated', handleReferralUpdate);
    };
  }, [user]);

  const toggleTreeNode = (id) => {
    setTreeExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle Status Update Submit
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalRef) return;
    try {
      setSubmitting(true);
      const updateFn = api.sangam ? api.sangam.updateReferralStatus : apiClient.updateReferralStatus;
      await updateFn(statusModalRef.id, newStatus, statusValue ? Number(statusValue) : undefined, statusNotes);
      setStatusModalRef(null);
      setStatusNotes('');
      setStatusValue('');
      await fetchSangamData();
    } catch (err) {
      alert(err.message || 'स्थिती अपडेट करताना त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle TYFCB Gratitude Submit
  const handleTyfcbSubmit = async (e) => {
    e.preventDefault();
    if (!tyfcbModalRef || !tyfcbValue) {
      alert('कृपया प्रत्यक्ष पूर्ण झालेली रक्कम (₹) प्रविष्ट करा.');
      return;
    }
    try {
      setSubmitting(true);
      if (api.sangam && api.sangam.submitTyfcb) {
        await api.sangam.submitTyfcb(tyfcbModalRef.id, {
          actualValue: Number(tyfcbValue),
          dealValue: Number(tyfcbValue),
          businessType: tyfcbType,
          message: tyfcbMessage || 'व्यवसाय यशस्वीरित्या पूर्ण झाला. मनापासून धन्यवाद!'
        });
      } else {
        await apiClient.updateReferralStatus(tyfcbModalRef.id, 'यशस्वी क्लोज (Won)', Number(tyfcbValue));
      }
      setTyfcbModalRef(null);
      setTyfcbValue('');
      setTyfcbMessage('');
      await fetchSangamData();
    } catch (err) {
      alert(err.message || 'धन्यवाद नोंद करताना त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Referrals
  const filteredReferrals = useMemo(() => {
    return referrals.filter(r => {
      // Sub-filter tabs
      if (b2bFilter === 'received' && user) {
        if (r.recipientId !== user.id) return false;
      } else if (b2bFilter === 'given' && user) {
        if (r.giverId !== user.id) return false;
      } else if (b2bFilter === 'won') {
        const s = (r.status || '').toLowerCase();
        if (!s.includes('क्लोज') && !s.includes('won') && !s.includes('closed') && !s.includes('success')) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if ((r.category || '').toLowerCase() !== categoryFilter.toLowerCase()) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.clientName && r.clientName.toLowerCase().includes(q)) ||
          (r.prospect && r.prospect.toLowerCase().includes(q)) ||
          (r.category && r.category.toLowerCase().includes(q)) ||
          (r.giverName && r.giverName.toLowerCase().includes(q)) ||
          (r.recipientName && r.recipientName.toLowerCase().includes(q)) ||
          (r.city && r.city.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [referrals, b2bFilter, categoryFilter, searchQuery, user]);

  // Categories list
  const categories = useMemo(() => {
    const list = Array.from(new Set(referrals.map(r => r.category).filter(Boolean)));
    return list.length ? list : ['औद्योगिक उत्पादन व मशिनरी', 'बांधकाम व साहित्य', 'अन्न प्रक्रिया व पॅकेजिंग', 'वाहतूक व पुरवठा साखळी', 'आयटी व सॉफ्टवेअर'];
  }, [referrals]);

  // Member invitation code
  const referralCode = formatMemberReferralCode(user);
  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${referralCode}`;

  // Filtered member referrals list for the 12-column table
  const filteredMemberReferrals = useMemo(() => {
    return memberReferrals.filter(r => {
      // Scope filter: 'all' shows all past and current referrals; 'my' shows only referrals by logged in user
      if (memberScopeFilter === 'my') {
        const myCode = (formatMemberReferralCode(user) || '').toLowerCase();
        const myId = (user?.id ? String(user.id) : '').toLowerCase();
        const myClean = myId.replace(/^cm-/, '').replace(/^m/, '');
        const myPhone = (user?.phone ? String(user.phone) : '').replace(/\D/g, '').slice(-4);
        const refId = (r.referralId || r.referrerId || '').toLowerCase();
        const matchesMe =
          refId === myCode ||
          refId === myId ||
          (myClean && refId.includes(myClean)) ||
          (myId && (refId.includes(myId) || myId.includes(refId))) ||
          (myPhone && refId.includes(myPhone));
        if (!matchesMe) return false;
      }
      if (memberStatusFilter !== 'all') {
        const s = (r.status || 'Active').toLowerCase();
        if (s !== memberStatusFilter.toLowerCase()) return false;
      }
      if (memberPackageFilter !== 'all') {
        const pkg = (r.package || 'Basic').toLowerCase();
        if (!pkg.includes(memberPackageFilter.toLowerCase())) return false;
      }
      if (memberSearchQuery.trim()) {
        const q = memberSearchQuery.toLowerCase();
        const mId = (r.memberId || r.refereeId || '').toLowerCase();
        const mName = (r.name || r.refereeName || '').toLowerCase();
        const rId = (r.referralId || r.referrerId || '').toLowerCase();
        const rName = (r.referralName || r.referrerName || '').toLowerCase();
        const phone = (r.mobileNo || r.refereePhone || '').toLowerCase();
        const email = (r.email || '').toLowerCase();
        const match =
          mId.includes(q) ||
          mName.includes(q) ||
          rId.includes(q) ||
          rName.includes(q) ||
          phone.includes(q) ||
          email.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [memberReferrals, memberScopeFilter, memberStatusFilter, memberPackageFilter, memberSearchQuery, user]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `🚩 जय शिवराय! Connect Maratha — महाराष्ट्रातील मराठा समाजाचे सर्वात मोठे डिजिटल व्यासपीठ. नोकरी, व्यवसाय, B2B लीड्स, इतिहास आणि समाज प्रगतीसाठी माझ्या रेफरल लिंकवरून आजच मोफत नोंदणी करा: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Referral Bands
  const bands = [
    { name: '🌱 Entry Level', min: 100, max: 499, stage: 'Initial Contribution', role: 'स्वयंसेवक / प्राथमिक सहाय्यक' },
    { name: '🌿 Active Volunteer', min: 500, max: 999, stage: 'Active Community Contributor', role: 'स्थानिक समन्वयक / सहाय्यक' },
    { name: '🌳 Established Rep', min: 1000, max: 2499, stage: 'Established Representative', role: 'शाखा प्रमुख / चॅप्टर प्रतिनिधी' },
    { name: '⭐ Core Pillar', min: 2500, max: 4999, stage: 'Core Community Pillar', role: 'तालुका समन्वयक' },
    { name: '🏆 Taluka Leader', min: 5000, max: 9999, stage: 'Taluka Level Leader', role: 'तालुकाध्यक्ष / प्रमुख' },
    { name: '🌟 District Pillar', min: 10000, max: 19999, stage: 'District Pillar', role: 'जिल्हा उपाध्यक्ष / संघटक' },
    { name: '🎖️ District Leader', min: 20000, max: 34999, stage: 'District Level Leader', role: 'जिल्हाध्यक्ष / प्रमुख प्रशासक' },
    { name: '👑 Vibhag Leader', min: 35000, max: 49999, stage: 'Vibhag Level Leader', role: 'विभागीय प्रमुख (पुणे, कोकण...)' },
    { name: '🚩 Prant Sanghatak', min: 50000, max: 999999, stage: 'State / Prant Level Leadership', role: 'प्रांत संघटक / राज्य मंडळ' }
  ];

  const currentReferrals = user?.referralCount || 12;

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh', padding: '36px 0', color: '#1F2937' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>

        {/* 1. Header Banner */}
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          marginBottom: '28px',
          boxShadow: '0 12px 30px rgba(67, 20, 7, 0.15)',
          background: 'linear-gradient(135deg, #1F2937 0%, #7C2D12 50%, #9A3412 100%)',
          color: '#FFFFFF',
          padding: '36px 32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ maxWidth: '780px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ background: '#EA580C', padding: '4px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.5px' }}>
                  ● B2B REFERRAL NETWORK
                </span>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800 }}>
                  व्यावसायिक देवाणघेवाण महाकक्ष
                </span>
              </div>
              <h1 style={{ margin: '0 0 10px', fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.5px' }}>
                🔗 रेफरल व व्यवसाय देवाणघेवाण केंद्र
              </h1>
              <p style={{ margin: 0, fontSize: '1rem', color: '#FED7AA', lineHeight: 1.6 }}>
                मराठा उद्योजकांना विश्वासार्ह ग्राहक व सौदे मिळवून द्या. थेट व्यवसाय देवाणघेवाण, पारदर्शक प्रगती ट्रॅकिंग आणि सन्मान नोंद.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <Link
                to="/create-referral"
                style={{
                  background: '#EA580C',
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)'
                }}>
                <span>🤝 नवीन संदर्भ द्या</span>
              </Link>
              <Link
                to="/referrals/tracker"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  color: '#FFFFFF',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  border: '1px solid rgba(255,255,255,0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                <span>📊 ७-फिल्टर महा-अहवाल</span>
              </Link>
            </div>
          </div>

          {/* Real-time Metrics Pill Strip */}
          {metrics && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              marginTop: '28px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: '#FED7AA', fontWeight: 700 }}>एकूण व्यवसाय देवाणघेवाण</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px', color: '#FEF08A' }}>
                  {metrics.totalBusinessFormatted || `₹${(metrics.totalBusinessExchanged || 0).toLocaleString('en-IN')}`}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: '#FED7AA', fontWeight: 700 }}>यशस्वी पूर्ण सौदे</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>
                  {metrics.closedReferralsCount || 0} सौदे
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: '#FED7AA', fontWeight: 700 }}>सक्रिय रेफरल्स पाइपलाइन</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>
                  {metrics.activeReferralsCount || 0}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.78rem', color: '#FED7AA', fontWeight: 700 }}>यशस्वी रूपांतरण दर</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px', color: '#86EFAC' }}>
                  {metrics.conversionRate || '0%'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Primary Tabs Switcher */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '28px',
          borderBottom: '2px solid #E2E8F0',
          paddingBottom: '12px'
        }}>
          <button
            onClick={() => setActiveTab('business')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '1rem',
              transition: 'all 0.2s',
              background: activeTab === 'business' ? '#7C2D12' : '#FFFFFF',
              color: activeTab === 'business' ? '#FFFFFF' : '#7C2D12',
              boxShadow: activeTab === 'business' ? '0 4px 12px rgba(124, 45, 18, 0.2)' : 'none',
              border: activeTab === 'business' ? 'none' : '1px solid #FED7AA'
            }}>
            💼 व्यावसायिक संदर्भ व देवाणघेवाण (B2B Exchange)
          </button>
          <button
            onClick={() => setActiveTab('membership')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '1rem',
              transition: 'all 0.2s',
              background: activeTab === 'membership' ? '#7C2D12' : '#FFFFFF',
              color: activeTab === 'membership' ? '#FFFFFF' : '#7C2D12',
              boxShadow: activeTab === 'membership' ? '0 4px 12px rgba(124, 45, 18, 0.2)' : 'none',
              border: activeTab === 'membership' ? 'none' : '1px solid #FED7AA'
            }}>
            🎁 सदस्य नोंदणी रेफरल व सन्मान (Member Rewards)
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '1rem',
              transition: 'all 0.2s',
              background: activeTab === 'tree' ? 'linear-gradient(135deg, #059669, #047857)' : '#FFFFFF',
              color: activeTab === 'tree' ? '#FFFFFF' : '#047857',
              boxShadow: activeTab === 'tree' ? '0 4px 12px rgba(4, 120, 87, 0.25)' : 'none',
              border: activeTab === 'tree' ? 'none' : '1.5px solid #A7F3D0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
            <span>🌳 रेफरल हायराॅर्की वंशवृक्ष (Network Tree & Flow)</span>
            {treeMetrics?.totalNetworkSize > 0 && (
              <span style={{
                background: activeTab === 'tree' ? '#FFFFFF' : '#047857',
                color: activeTab === 'tree' ? '#047857' : '#FFFFFF',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 900
              }}>
                {treeMetrics.totalNetworkSize}
              </span>
            )}
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: B2B COMMERCIAL REFERRALS & EXCHANGE                     */}
        {/* ============================================================== */}
        {activeTab === 'business' && (
          <div>
            {/* Filter and Search Bar */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px 24px',
              border: '1px solid #FED7AA',
              boxShadow: '0 4px 16px rgba(234, 88, 12, 0.05)',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                {/* Sub-filter chips */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'सर्व संदर्भ (All Chapters)' },
                    { id: 'received', label: 'मला मिळालेले (Received)' },
                    { id: 'given', label: 'मी दिलेले (Given)' },
                    { id: 'won', label: '🏆 यशस्वी क्लोज (Won Deals)' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setB2bFilter(tab.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        background: b2bFilter === tab.id ? '#EA580C' : '#FFF7ED',
                        color: b2bFilter === tab.id ? '#FFFFFF' : '#9A3412',
                        transition: 'all 0.15s'
                      }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search & Category Filter */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: '1', maxWidth: '540px', justifyContent: 'flex-end' }}>
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.86rem',
                      background: '#FFFFFF',
                      color: '#1F2937'
                    }}>
                    <option value="all">सर्व उद्योग क्षेत्रे (All)</option>
                    {categories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="शोध करा (क्लायंट, व्यवसाय, शहर)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.86rem',
                      width: '220px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Referrals Cards Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9A3412' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>रेफरल्स लोड होत आहेत...</div>
              </div>
            ) : filteredReferrals.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '60px 24px',
                textAlign: 'center',
                border: '1px dashed #CBD5E1'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🤝</div>
                <h3 style={{ margin: '0 0 8px', color: '#7C2D12', fontSize: '1.2rem' }}>सध्या कोणतेही संदर्भ आढळले नाहीत</h3>
                <p style={{ margin: '0 0 20px', color: '#64748B', fontSize: '0.92rem' }}>
                  आपल्या मराठा व्यवसाय बांधवांसाठी नवीन बिझनेस संधी नोंदवून सहकार्याचा हात पुढे करा.
                </p>
                <Link
                  to="/create-referral"
                  style={{
                    background: '#EA580C',
                    color: '#FFF',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}>
                  + पहिला संदर्भ द्या
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
                {filteredReferrals.map(ref => {
                  const isRecipient = user && (ref.recipientId === user.id || ref.recipientName === user.name);
                  const isGiver = user && (ref.giverId === user.id);
                  const isWon = (ref.status || '').toLowerCase().includes('won') || (ref.status || '').toLowerCase().includes('क्लोज');

                  return (
                    <div
                      key={ref.id}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '18px',
                        padding: '22px',
                        border: isWon ? '1.5px solid #86EFAC' : '1px solid #FED7AA',
                        boxShadow: '0 4px 14px rgba(67, 20, 7, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                      <div>
                        {/* Card Top: Badges & Urgency */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', gap: '8px' }}>
                          <span style={{
                            background: '#FFF7ED',
                            color: '#C2410C',
                            border: '1px solid #FFEDD5',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '0.76rem',
                            fontWeight: 800
                          }}>
                            {ref.category || 'व्यापार संदर्भ'}
                          </span>

                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{
                              background: isWon ? '#DCFCE7' : '#FEF3C7',
                              color: isWon ? '#15803D' : '#B45309',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '0.76rem',
                              fontWeight: 800
                            }}>
                              {ref.status || 'नवीन'}
                            </span>
                            {ref.urgency && (
                              <span style={{
                                background: ref.urgency.includes('उच्च') || ref.urgency.includes('High') ? '#FEE2E2' : '#F1F5F9',
                                color: ref.urgency.includes('उच्च') || ref.urgency.includes('High') ? '#B91C1C' : '#475569',
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: 700
                              }}>
                                ⚡ {ref.urgency}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Trust Badge */}
                        <h3 style={{ margin: '0 0 6px', fontSize: '1.12rem', fontWeight: 800, color: '#7C2D12', lineHeight: 1.4 }}>
                          {ref.title || ref.requirement}
                        </h3>

                        <div style={{ display: 'inline-block', background: '#F0FDF4', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '10px' }}>
                          {ref.trustBadge || '🟢 सप्रमाण / अधिकृत संदर्भ'}
                        </div>

                        {/* Requirement description */}
                        {ref.requirement && ref.requirement !== ref.title && (
                          <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                            {ref.requirement}
                          </p>
                        )}

                        {/* Involved Parties Strip */}
                        <div style={{
                          background: '#FAF7F2',
                          borderRadius: '12px',
                          padding: '12px',
                          marginBottom: '14px',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '10px',
                          fontSize: '0.82rem'
                        }}>
                          <div>
                            <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', fontWeight: 700 }}>संदर्भ देणारे (Giver):</span>
                            <strong style={{ color: '#7C2D12' }}>{ref.giverName || 'मराठा बंधू'}</strong>
                          </div>
                          <div>
                            <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', fontWeight: 700 }}>संदर्भ घेणारे (Recipient):</span>
                            <strong style={{ color: '#166534' }}>{ref.recipientName || 'उद्योजक'}</strong>
                          </div>
                        </div>

                        {/* Client & Financial Info */}
                        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginBottom: '14px', fontSize: '0.86rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ color: '#64748B' }}>ग्राहक / कंपनी:</span>
                            <strong>{ref.clientName || ref.prospect || 'अप्रत्यक्ष ग्राहक'}</strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                            <span style={{ color: '#64748B' }}>संपर्क क्रमांक:</span>
                            {ref.isMasked ? (
                              <span style={{ color: '#64748B', fontStyle: 'italic', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                🔒 {ref.clientPhone}
                                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }} title="फक्त संबंधित उद्योजकांसाठी दृश्यमान">(गोपनीय)</span>
                              </span>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <strong style={{ color: '#0369A1' }}>{ref.clientPhone}</strong>
                                <a
                                  href={`tel:${ref.clientPhone}`}
                                  style={{ background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem', textDecoration: 'none', fontWeight: 700 }}>
                                  📞 कॉल
                                </a>
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748B' }}>{isWon ? 'प्रत्यक्ष सौदा मूल्य (₹):' : 'अपेक्षित व्यवसाय मूल्य:'}</span>
                            <strong style={{ fontSize: '1.05rem', color: isWon ? '#15803D' : '#EA580C', fontWeight: 900 }}>
                              ₹{Number(isWon ? (ref.actualValue || ref.value) : (ref.estimatedValue || ref.value || 0)).toLocaleString('en-IN')}
                            </strong>
                          </div>
                        </div>

                        {/* TYFCB Banner if Won */}
                        {ref.tyfcb && (
                          <div style={{
                            background: '#F0FDF4',
                            border: '1px solid #BBF7D0',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            marginBottom: '14px',
                            fontSize: '0.82rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534', fontWeight: 800 }}>
                              <span>🏆 TYFCB पावती नोंदविली गेली</span>
                            </div>
                            <p style={{ margin: '4px 0 0', color: '#15803D', fontStyle: 'italic' }}>
                              "{ref.tyfcb.message}"
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                        {isRecipient && !isWon && (
                          <>
                            <button
                              onClick={() => {
                                setStatusModalRef(ref);
                                setNewStatus(ref.status || 'संपर्क साधला (Contacted)');
                                setStatusValue(String(ref.actualValue || ref.estimatedValue || ''));
                              }}
                              style={{
                                flex: 1,
                                background: '#FFF7ED',
                                color: '#C2410C',
                                border: '1px solid #FED7AA',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer'
                              }}>
                              ✏️ प्रगती नोंदवा
                            </button>
                            <button
                              onClick={() => {
                                setTyfcbModalRef(ref);
                                setTyfcbValue(String(ref.actualValue || ref.estimatedValue || ''));
                              }}
                              style={{
                                flex: 1,
                                background: '#16A34A',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontWeight: 800,
                                fontSize: '0.82rem',
                                cursor: 'pointer'
                              }}>
                              🏆 सौदा जिंकला (TYFCB)
                            </button>
                          </>
                        )}

                        {(!isRecipient || isWon) && (
                          <button
                            onClick={() => {
                              alert(`रेफरल ID: ${ref.id}\nतपशील: ${ref.title}\nस्थान: ${ref.city || 'पुणे'}`);
                            }}
                            style={{
                              width: '100%',
                              background: '#F8FAFC',
                              color: '#475569',
                              border: '1px solid #E2E8F0',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}>
                            🔍 सविस्तर माहिती
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MEMBERSHIP REWARDS & 9-TIER PROGRESSION                 */}
        {/* ============================================================== */}
        {activeTab === 'membership' && (
          <div>
            {/* Referral Link & WhatsApp Card */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 8px 24px rgba(67, 20, 7, 0.08)',
              marginBottom: '32px',
              border: '1px solid #FED7AA'
            }}>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 800, color: '#7C2D12' }}>
                🔗 आपली वैयक्तिक सभासद नोंदणी रेफरल लिंक
              </h2>
              <p style={{ margin: '0 0 20px', color: '#9A3412', fontSize: '0.94rem' }}>
                आपल्या संपर्कातील नातेवाईक व मित्रपरिवाराला ही लिंक पाठवा. नोंदणीनंतर अधिकृत समाज मानधन व पदोन्नती गुण मिळवा.
              </p>

              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                background: '#FFF7ED',
                padding: '12px 16px',
                borderRadius: '12px',
                border: '1px solid #FFEDD5',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  style={{
                    flex: '1',
                    minWidth: '260px',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#7C2D12',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={copyToClipboard}
                  style={{
                    background: copied ? '#16A34A' : '#7C2D12',
                    color: '#FFF',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}>
                  {copied ? '✓ कॉपी झाले!' : '📋 लिंक कॉपी करा'}
                </button>
                <button
                  onClick={shareOnWhatsApp}
                  style={{
                    background: '#25D366',
                    color: '#FFF',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}>
                  💬 WhatsApp वर पाठवा
                </button>
              </div>
            </div>

            {/* 9 Leadership Bands */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid #FED7AA'
            }}>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.4rem', fontWeight: 800, color: '#7C2D12' }}>
                🏆 मराठा संघटनात्मक सन्मान व पदोन्नती निकष (९ स्तर)
              </h2>
              <p style={{ margin: '0 0 24px', color: '#9A3412', fontSize: '0.94rem' }}>
                आपल्या नोंदणी संख्येनुसार मिळणारे संघटनात्मक अधिकार व मानधन श्रेणी.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {bands.map((band, idx) => {
                  const isCurrent = currentReferrals >= band.min && currentReferrals <= band.max;
                  return (
                    <div
                      key={idx}
                      style={{
                        background: isCurrent ? '#FFF7ED' : '#FAF7F2',
                        border: isCurrent ? '2px solid #EA580C' : '1px solid #E2E8F0',
                        borderRadius: '14px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <strong style={{ fontSize: '1rem', color: '#7C2D12' }}>{band.name}</strong>
                          {isCurrent && (
                            <span style={{ background: '#EA580C', color: '#FFF', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                              आपला स्तर
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '8px' }}>
                          नोंदणी उद्दिष्ट: <strong>{band.min.toLocaleString('en-IN')} - {band.max >= 999999 ? 'अमर्याद' : band.max.toLocaleString('en-IN')}</strong> सभासद
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                          पद: {band.role}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Member Referrals History Table (Exact 12-Column Ledger) */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '32px',
              marginTop: '32px',
              border: '1px solid #FED7AA',
              boxShadow: '0 8px 24px rgba(67, 20, 7, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: '0 0 6px', fontSize: '1.35rem', fontWeight: 800, color: '#7C2D12' }}>
                    📋 आपण शिफारस केलेले अधिकृत सभासद (Referred Members History)
                  </h2>
                  <p style={{ margin: 0, color: '#9A3412', fontSize: '0.9rem' }}>
                    आपल्या रेफरल लिंक किंवा कोडने नोंदणी केलेल्या सर्व बांधवांची थेट यादी. रिअल-टाइम नोंदणी ट्रॅकिंग.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => exportReferralsToCSV(filteredMemberReferrals)}
                    disabled={filteredMemberReferrals.length === 0}
                    style={{
                      background: filteredMemberReferrals.length === 0 ? '#E2E8F0' : '#15803D',
                      color: filteredMemberReferrals.length === 0 ? '#94A3B8' : '#FFFFFF',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.86rem',
                      cursor: filteredMemberReferrals.length === 0 ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: filteredMemberReferrals.length === 0 ? 'none' : '0 2px 8px rgba(21, 128, 61, 0.25)'
                    }}>
                    <span>📥 एक्सेल / CSV अहवाल</span>
                  </button>
                  <span style={{ background: '#FFF7ED', color: '#EA580C', border: '1.5px solid #FED7AA', padding: '6px 16px', borderRadius: '20px', fontWeight: 800, fontSize: '0.9rem' }}>
                    एकूण {filteredMemberReferrals.length} सभासद नोंदणी
                  </span>
                </div>
              </div>

              {/* Filter Controls Row */}
              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
                background: '#FFFDF9',
                border: '1px solid #FED7AA',
                borderRadius: '14px',
                padding: '14px 18px',
                marginBottom: '20px',
                alignItems: 'center'
              }}>
                {/* Scope selector: All historical vs My referrals */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setMemberScopeFilter('all')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: memberScopeFilter === 'all' ? '2px solid #EA580C' : '1px solid #CBD5E1',
                      background: memberScopeFilter === 'all' ? '#FFF7ED' : '#FFFFFF',
                      color: memberScopeFilter === 'all' ? '#EA580C' : '#475569',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}>
                    🌐 सर्व रेफरल्स (All Referrals)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMemberScopeFilter('my')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: memberScopeFilter === 'my' ? '2px solid #EA580C' : '1px solid #CBD5E1',
                      background: memberScopeFilter === 'my' ? '#FFF7ED' : '#FFFFFF',
                      color: memberScopeFilter === 'my' ? '#EA580C' : '#475569',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}>
                    👤 माझे संदर्भ (My Referrals)
                  </button>
                </div>

                <div style={{ flex: 2, minWidth: '220px' }}>
                  <input
                    type="text"
                    placeholder="शोध करा (Member ID, Name, Referral ID, Mobile, Email)..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      background: '#FFFFFF'
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: '150px' }}>
                  <select
                    value={memberPackageFilter}
                    onChange={(e) => setMemberPackageFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      background: '#FFFFFF',
                      color: '#1F2937',
                      fontWeight: 700
                    }}>
                    <option value="all">सर्व पॅकेजेस (All Packages)</option>
                    <option value="Basic">Basic (प्राथमिक)</option>
                    <option value="Silver">Silver (रौप्य)</option>
                    <option value="Gold">Gold (सुवर्ण)</option>
                    <option value="Platinum">Platinum (प्लॅटिनम)</option>
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: '140px' }}>
                  <select
                    value={memberStatusFilter}
                    onChange={(e) => setMemberStatusFilter(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.88rem',
                      background: '#FFFFFF',
                      color: '#1F2937',
                      fontWeight: 700
                    }}>
                    <option value="all">सर्व स्थिती (All Status)</option>
                    <option value="active">Active (सक्रिय)</option>
                    <option value="pending">Pending (प्रलंबित)</option>
                  </select>
                </div>

                {(memberSearchQuery || memberPackageFilter !== 'all' || memberStatusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setMemberSearchQuery('');
                      setMemberPackageFilter('all');
                      setMemberStatusFilter('all');
                    }}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}>
                    रीसेट करा
                  </button>
                )}
              </div>

              {filteredMemberReferrals.length === 0 ? (
                <div style={{ background: '#FFFDF9', border: '1.5px dashed #FED7AA', borderRadius: '16px', padding: '40px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🤝</div>
                  <h3 style={{ margin: '0 0 6px', color: '#7C2D12', fontSize: '1.1rem' }}>
                    {memberReferrals.length === 0 ? 'अद्याप कोणत्याही सभासदाने आपल्या लिंकवरून नोंदणी केलेली नाही.' : 'शोध निकषांशी जुळणारे कोणतेही सभासद आढळले नाहीत.'}
                  </h3>
                  <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: '0.9rem' }}>आपली वरील रेफरल लिंक किंवा कोड नातेवाईक व मित्रांना पाठवून आजच मराठा चळवळीत जोडा.</p>
                  <button
                    onClick={copyToClipboard}
                    style={{ background: '#EA580C', color: '#FFF', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>
                    📋 रेफरल लिंक कॉपी करा
                  </button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #FED7AA', borderRadius: '14px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem', minWidth: '1100px' }}>
                    <thead>
                      <tr style={{ background: '#FFF7ED', borderBottom: '2px solid #FED7AA' }}>
                        <th style={{ padding: '12px 14px', color: '#1F2937', fontWeight: 900, whiteSpace: 'nowrap' }}>SNo.</th>
                        <th style={{ padding: '12px 14px', color: '#1F2937', fontWeight: 900, whiteSpace: 'nowrap' }}>Member ID</th>
                        <th style={{ padding: '12px 14px', color: '#1F2937', fontWeight: 900, whiteSpace: 'nowrap' }}>Name</th>
                        <th style={{ padding: '12px 14px', color: '#1F2937', fontWeight: 900, whiteSpace: 'nowrap' }}>Referral ID</th>
                        <th style={{ padding: '12px 14px', color: '#1F2937', fontWeight: 900, whiteSpace: 'nowrap' }}>Referral Name</th>
                        <th style={{ padding: '12px 14px', color: '#1F2937', fontWeight: 900, whiteSpace: 'nowrap' }}>Joining Date</th>
                        <th style={{ padding: '12px 14px', color: '#EA580C', fontWeight: 900, whiteSpace: 'nowrap', textAlign: 'center' }}>Click Here!</th>
                        <th style={{ padding: '12px 14px', color: '#1F2937', fontWeight: 900, whiteSpace: 'nowrap' }}>Mobile No.</th>
                        <th style={{ padding: '12px 14px', color: '#1F2937', fontWeight: 900, whiteSpace: 'nowrap' }}>Email</th>
                        <th style={{ padding: '12px 14px', color: '#1F2937', fontWeight: 900, whiteSpace: 'nowrap' }}>Package</th>
                        <th style={{ padding: '12px 14px', color: '#1F2937', fontWeight: 900, whiteSpace: 'nowrap' }}>Activ.Date</th>
                        <th style={{ padding: '12px 14px', color: '#1F2937', fontWeight: 900, whiteSpace: 'nowrap', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMemberReferrals.map((r, idx) => {
                        const sNo = r.sno || idx + 1;
                        const mId = r.memberId || r.refereeId || '-';
                        const mName = r.name || r.refereeName || '-';
                        const refId = r.referralId || r.referrerId || '-';
                        const refName = r.referralName || r.referrerName || '-';
                        const joinDate = r.joiningDate || (r.registeredAt ? r.registeredAt.slice(0, 10) : '') || '-';
                        const mobileNo = r.mobileNo || r.refereePhone || '-';
                        const email = r.email || '-';
                        const pkg = r.package || 'Basic (प्राथमिक)';
                        const activDate = r.activDate || r.joiningDate || '-';
                        const status = r.status || 'Active';
                        const isActive = status.toLowerCase() === 'active';

                        return (
                          <tr key={r.id || idx} style={{ borderBottom: '1px solid #F1F5F9', background: idx % 2 === 0 ? '#FFFFFF' : '#FFFDF9' }}>
                            <td style={{ padding: '12px 14px', color: '#64748B', fontWeight: 700 }}>
                              {sNo}
                            </td>
                            <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#EA580C', background: '#FFF7ED', padding: '3px 8px', borderRadius: '6px', border: '1px solid #FED7AA' }}>
                                {mId}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FFF7ED', border: '1px solid #FED7AA', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>
                                  {mName.charAt(0) || 'म'}
                                </span>
                                <span>{mName}</span>
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1F2937', background: '#F8FAFC', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                                {refId}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', color: '#334155', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {refName}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                              {joinDate}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedMemberModal(r)}
                                style={{
                                  background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  padding: '6px 14px',
                                  borderRadius: '8px',
                                  fontWeight: 800,
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                                }}>
                                <span>🔍 Click Here!</span>
                              </button>
                            </td>
                            <td style={{ padding: '12px 14px', color: '#0369A1', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{mobileNo}</span>
                                {mobileNo !== '-' && (
                                  <a href={`tel:${mobileNo}`} title="Call Direct" style={{ textDecoration: 'none', fontSize: '0.75rem' }}>📞</a>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 14px', color: '#475569', fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                              {email}
                            </td>
                            <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                              <span style={{
                                background: pkg.includes('Gold') ? '#FEF9C3' : pkg.includes('Silver') ? '#F1F5F9' : '#FFF7ED',
                                color: pkg.includes('Gold') ? '#854D0E' : pkg.includes('Silver') ? '#334155' : '#EA580C',
                                border: `1px solid ${pkg.includes('Gold') ? '#FDE047' : pkg.includes('Silver') ? '#CBD5E1' : '#FED7AA'}`,
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '0.78rem',
                                fontWeight: 800
                              }}>
                                {pkg}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', color: '#64748B', fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                              {activDate}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                              {isActive ? (
                                <span style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800 }}>
                                  ✓ Active
                                </span>
                              ) : (
                                <span style={{ background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800 }}>
                                  ⏳ Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SIMPLE REFERRAL LEVEL HIERARCHY (सोपा रेफरल स्तर लेआऊट) */}
        {/* ============================================================== */}
        {activeTab === 'tree' && (
          <div>
            {/* 1. Simple Overview Stat Pills */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '20px'
            }}>
              {/* Total Card */}
              <div
                onClick={() => setTreeLevelFilter('all')}
                style={{
                  background: treeLevelFilter === 'all' ? '#065F46' : '#FFFFFF',
                  color: treeLevelFilter === 'all' ? '#FFFFFF' : '#1E293B',
                  borderRadius: '14px',
                  padding: '16px 18px',
                  border: treeLevelFilter === 'all' ? '2px solid #047857' : '1.5px solid #E2E8F0',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s'
                }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.85, marginBottom: '4px' }}>
                  🌐 एकूण नेटवर्क
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>
                  {treeMetrics?.totalNetworkSize || 0} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>सदस्य</span>
                </div>
                <div style={{ fontSize: '0.74rem', marginTop: '2px', color: treeLevelFilter === 'all' ? '#A7F3D0' : '#059669', fontWeight: 700 }}>
                  सर्व स्तर एकत्रित
                </div>
              </div>

              {/* Dynamic Level Pills - Supports unlimited levels (Level 1 to Level N) */}
              {Object.keys(treeMetrics?.levelCounts || { 1: 0, 2: 0, 3: 0 })
                .map(Number)
                .sort((a, b) => a - b)
                .map(lvl => {
                  const count = treeMetrics?.levelCounts?.[lvl] || 0;
                  const isSelected = String(treeLevelFilter) === String(lvl);
                  const colors = [
                    { bg: '#047857', border: '#BBF7D0', text: '#047857', light: '#DCFCE7' }, // L1
                    { bg: '#0284C7', border: '#BAE6FD', text: '#0284C7', light: '#E0F2FE' }, // L2
                    { bg: '#EA580C', border: '#FED7AA', text: '#EA580C', light: '#FFEDD5' }, // L3
                    { bg: '#7C3AED', border: '#DDD6FE', text: '#7C3AED', light: '#EDE9FE' }, // L4
                    { bg: '#DB2777', border: '#FBCFE8', text: '#DB2777', light: '#FCE7F3' }, // L5+
                  ];
                  const c = colors[(lvl - 1) % colors.length];

                  return (
                    <div
                      key={lvl}
                      onClick={() => setTreeLevelFilter(String(lvl))}
                      style={{
                        background: isSelected ? c.bg : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#1E293B',
                        borderRadius: '14px',
                        padding: '16px 18px',
                        border: isSelected ? `2px solid ${c.bg}` : `1.5px solid ${c.border}`,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.15s'
                      }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.85, marginBottom: '4px', color: isSelected ? '#FFFFFF' : c.text }}>
                        {lvl === 1 ? '🎯 Level 1 (माझे थेट)' : lvl === 2 ? '🌿 Level 2 (उप-रेफरल)' : lvl === 3 ? '🌳 Level 3 (३ री पिढी)' : `⚡ Level ${lvl} (${lvl} वी पिढी)`}
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>
                        {count} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>सदस्य</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', marginTop: '2px', color: isSelected ? '#FFFFFF' : c.text, fontWeight: 700 }}>
                        {lvl === 1 ? 'तुम्ही स्वतः जोडलेले' : `Level ${lvl - 1} च्या सदस्यांनी जोडलेले`}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* 2. Clean Action Bar: Search & View Switcher */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '14px 18px',
              border: '1.5px solid #E2E8F0',
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Left: Quick level indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#334155' }}>
                  सध्याचा स्तर:
                </span>
                <span style={{
                  background: treeLevelFilter === '1' ? '#DCFCE7' : (treeLevelFilter === '2' ? '#E0F2FE' : (treeLevelFilter === '3' ? '#FFEDD5' : '#F1F5F9')),
                  color: treeLevelFilter === '1' ? '#166534' : (treeLevelFilter === '2' ? '#0369A1' : (treeLevelFilter === '3' ? '#C2410C' : '#334155')),
                  padding: '3px 12px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 900
                }}>
                  {treeLevelFilter === 'all' ? 'सर्व स्तर एकत्रित (All)' : `Level ${treeLevelFilter}`}
                </span>
              </div>

              {/* Right: Search box & Table/Card View Toggle */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="नाव, मोबाईल किंवा जिल्हा शोधा..."
                  value={treeSearchQuery}
                  onChange={e => setTreeSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.86rem',
                    minWidth: '220px',
                    outline: 'none'
                  }}
                />

                {/* View Mode Toggle: Simple Table vs Flow Cards */}
                <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '8px', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setTreeDisplayMode('table')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: treeDisplayMode === 'table' ? '#FFFFFF' : 'transparent',
                      color: treeDisplayMode === 'table' ? '#0F172A' : '#64748B',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: treeDisplayMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}>
                    📋 सोपा टेबल (Table)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTreeDisplayMode('cards')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: treeDisplayMode === 'cards' ? '#FFFFFF' : 'transparent',
                      color: treeDisplayMode === 'cards' ? '#0F172A' : '#64748B',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: treeDisplayMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}>
                    🌿 हायराॅर्की कार्ड्स (Flow)
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Main Data Container */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              border: '1.5px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
            }}>
              {treeLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  ⏳ रेफरल माहिती लोड होत आहे...
                </div>
              ) : treeFlatList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌱</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B' }}>अद्याप कोणताही रेफरल सदस्य नाही.</div>
                  <p style={{ margin: '6px 0 0', fontSize: '0.86rem' }}>
                    आपला रेफरल कोड <strong>CM-MH-2026-{(user?.phone || '3476').slice(-4)}</strong> शेअर करा.
                  </p>
                </div>
              ) : (
                <>
                  {/* OPTION A: SIMPLE CLEAN TABLE VIEW (सोपा फॉरमॅट) */}
                  {treeDisplayMode === 'table' && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                        <thead>
                          <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                            <th style={{ padding: '12px 14px', fontWeight: 800, width: '90px' }}>स्तर (Level)</th>
                            <th style={{ padding: '12px 14px', fontWeight: 800 }}>सदस्याचे नाव (Member)</th>
                            <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center' }}>त्यांच्या हाताखाली (Team)</th>
                            <th style={{ padding: '12px 14px', fontWeight: 800 }}>कोणी जोडले? (Referred By)</th>
                            <th style={{ padding: '12px 14px', fontWeight: 800 }}>जिल्हा / तालुका</th>
                            <th style={{ padding: '12px 14px', fontWeight: 800 }}>मोबाईल नंबर</th>
                            <th style={{ padding: '12px 14px', fontWeight: 800 }}>पॅकेज</th>
                            <th style={{ padding: '12px 14px', fontWeight: 800, textAlign: 'center' }}>स्थिती</th>
                          </tr>
                        </thead>
                        <tbody>
                          {treeFlatList
                            .filter(item => {
                              if (treeLevelFilter !== 'all' && String(item.level) !== String(treeLevelFilter)) return false;
                              if (!treeSearchQuery) return true;
                              const q = treeSearchQuery.toLowerCase();
                              return (item.name || '').toLowerCase().includes(q) ||
                                     (item.phone || '').includes(q) ||
                                     (item.district || '').toLowerCase().includes(q) ||
                                     (item.sponsor_name || '').toLowerCase().includes(q);
                            })
                            .map((item, idx) => {
                              const isL1 = item.level === 1;
                              const isL2 = item.level === 2;
                              const isL3 = item.level === 3;
                              const badgeBg = isL1 ? '#DCFCE7' : (isL2 ? '#E0F2FE' : (isL3 ? '#FFEDD5' : '#EDE9FE'));
                              const badgeColor = isL1 ? '#166534' : (isL2 ? '#0369A1' : (isL3 ? '#C2410C' : '#6D28D9'));

                              return (
                                <tr
                                  key={item.id || idx}
                                  onClick={() => setSelectedMemberModal(item)}
                                  title="संपूर्ण माहिती व नेटवर्क तपशील पाहण्यासाठी क्लिक करा"
                                  style={{
                                    borderBottom: '1px solid #F1F5F9',
                                    background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s ease'
                                  }}
                                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F0FDF4'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.background = idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'; }}>
                                  {/* Level Tag */}
                                  <td style={{ padding: '12px 14px' }}>
                                    <span style={{
                                      background: badgeBg,
                                      color: badgeColor,
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      fontWeight: 900,
                                      fontSize: '0.74rem',
                                      display: 'inline-block'
                                    }}>
                                      {item.level === 1 ? '🎯 Level 1' : (item.level === 2 ? '🌿 Level 2' : (item.level === 3 ? '🌳 Level 3' : `⚡ Level ${item.level}`))}
                                    </span>
                                  </td>

                                  {/* Member Name */}
                                  <td style={{ padding: '12px 14px' }}>
                                    <div style={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span>{item.name}</span>
                                      <span style={{ fontSize: '0.7rem', color: '#0284C7', background: '#E0F2FE', padding: '1px 6px', borderRadius: '4px' }}>ℹ️ तपशील</span>
                                    </div>
                                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                                      ID: {item.id}
                                    </div>
                                  </td>

                                  {/* Under Them Count */}
                                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    {(item.underThemCount || 0) > 0 ? (
                                      <span style={{
                                        background: '#E0F2FE',
                                        color: '#0369A1',
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '0.78rem',
                                        fontWeight: 900,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        boxShadow: '0 1px 3px rgba(2, 132, 199, 0.15)'
                                      }}>
                                        👥 {item.underThemCount} सदस्य जोडले
                                      </span>
                                    ) : (
                                      <span style={{ color: '#94A3B8', fontSize: '0.76rem' }}>
                                        ० सदस्य
                                      </span>
                                    )}
                                  </td>

                                  {/* Lineage / Referred by whom */}
                                  <td style={{ padding: '12px 14px' }}>
                                    {isL1 ? (
                                      <span style={{ color: '#047857', fontWeight: 800, fontSize: '0.84rem' }}>
                                        ★ तुम्ही स्वतः (Direct)
                                      </span>
                                    ) : (
                                      <div>
                                        <div style={{ color: '#0369A1', fontWeight: 800, fontSize: '0.84rem' }}>
                                          ↳ {item.sponsor_name || 'वरिष्ठ सदस्य'}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                          (तुमचा Level {item.level - 1} रेफरल)
                                        </div>
                                      </div>
                                    )}
                                  </td>

                                  {/* Location */}
                                  <td style={{ padding: '12px 14px', color: '#334155' }}>
                                    📍 {item.taluka ? `${item.taluka}, ` : ''}{item.district || 'महाराष्ट्र'}
                                  </td>

                                  {/* Phone */}
                                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0F172A' }}>
                                    📞 {item.phone || '-'}
                                  </td>

                                  {/* Package */}
                                  <td style={{ padding: '12px 14px' }}>
                                    <span style={{
                                      background: '#FEF3C7',
                                      color: '#92400E',
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem',
                                      fontWeight: 800
                                    }}>
                                      {item.tier || 'Gold'}
                                    </span>
                                  </td>

                                  {/* Status */}
                                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    <span style={{
                                      background: '#DCFCE7',
                                      color: '#166534',
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      fontSize: '0.74rem',
                                      fontWeight: 800
                                    }}>
                                      ✓ सक्रिय
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* OPTION B: FLOW CARDS VIEW (विस्तारणीय कार्ड्स व्ह्यू) */}
                  {treeDisplayMode === 'cards' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {treeData
                        .filter(l1 => {
                          if (treeLevelFilter === '2' || treeLevelFilter === '3') {
                            // Only show if has children matching
                            return (l1.children || []).length > 0;
                          }
                          return true;
                        })
                        .map((l1, i1) => (
                          <div
                            key={l1.id || i1}
                            style={{
                              border: '1.5px solid #BBF7D0',
                              borderRadius: '14px',
                              overflow: 'hidden',
                              background: '#FFFFFF'
                            }}>
                            {/* Level 1 Header Row */}
                            <div
                              onClick={() => toggleTreeNode(l1.id)}
                              style={{
                                padding: '14px 18px',
                                background: '#F0FDF4',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px'
                              }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{
                                  background: '#047857',
                                  color: '#FFFFFF',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 900
                                }}>
                                  LEVEL 1
                                </span>
                                <div>
                                  <div style={{ fontWeight: 900, color: '#0F172A', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>{l1.name}</span>
                                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>({l1.id})</span>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); setSelectedMemberModal(l1); }}
                                      style={{
                                        background: '#ECFDF5',
                                        color: '#047857',
                                        border: '1px solid #A7F3D0',
                                        borderRadius: '6px',
                                        padding: '1px 8px',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                      }}>
                                      ℹ️ तपशील
                                    </button>
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: '#166534', marginTop: '1px' }}>
                                    📍 {l1.taluka ? `${l1.taluka}, ` : ''}{l1.district} • 📞 {l1.phone}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span
                                  onClick={(e) => { e.stopPropagation(); setSelectedMemberModal(l1); }}
                                  title="तपशील पाहण्यासाठी क्लिक करा"
                                  style={{
                                    background: (l1.children || []).length > 0 ? '#E0F2FE' : '#F1F5F9',
                                    color: (l1.children || []).length > 0 ? '#0369A1' : '#64748B',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.78rem',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                  }}>
                                  यांनी जोडलेले: {(l1.children || []).length} सदस्य ℹ️
                                </span>
                                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                                  {treeExpanded[l1.id] ? '▲' : '▼'}
                                </span>
                              </div>
                            </div>

                            {/* Level 2 Sub-list */}
                            {treeExpanded[l1.id] && (l1.children || []).length > 0 && (
                              <div style={{ padding: '12px 18px', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284C7' }}>
                                  ↳ {l1.name} यांचे थेट संदर्भ (Level 2):
                                </div>

                                {l1.children.map((l2, i2) => (
                                  <div
                                    key={l2.id || i2}
                                    style={{
                                      background: '#FFFFFF',
                                      border: '1px solid #BAE6FD',
                                      borderRadius: '10px',
                                      padding: '10px 14px'
                                    }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                      <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <span style={{ background: '#0284C7', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800 }}>
                                            LEVEL 2
                                          </span>
                                          <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{l2.name}</strong>
                                          <span style={{ fontSize: '0.74rem', color: '#64748B' }}>({l2.id})</span>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedMemberModal(l2)}
                                            style={{
                                              background: '#EFF6FF',
                                              color: '#0284C7',
                                              border: '1px solid #BAE6FD',
                                              borderRadius: '4px',
                                              padding: '1px 6px',
                                              fontSize: '0.68rem',
                                              fontWeight: 800,
                                              cursor: 'pointer'
                                            }}>
                                            ℹ️ तपशील
                                          </button>
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                                          📍 {l2.district} • 📞 {l2.phone}
                                        </div>
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span
                                          onClick={() => setSelectedMemberModal(l2)}
                                          title="माहिती पाहण्यासाठी क्लिक करा"
                                          style={{
                                            background: '#E0F2FE',
                                            color: '#0369A1',
                                            padding: '2px 8px',
                                            borderRadius: '8px',
                                            fontSize: '0.72rem',
                                            fontWeight: 800,
                                            cursor: 'pointer'
                                          }}>
                                          👥 {(l2.children || []).length} सदस्य ℹ️
                                        </span>
                                        {(l2.children || []).length > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => toggleTreeNode(l2.id)}
                                            style={{
                                              padding: '3px 8px',
                                              borderRadius: '6px',
                                              border: '1px solid #BAE6FD',
                                              background: '#E0F2FE',
                                              color: '#0369A1',
                                              fontSize: '0.72rem',
                                              fontWeight: 800,
                                              cursor: 'pointer'
                                            }}>
                                            {treeExpanded[l2.id] ? '▲ लपवा' : `▼ ३ री पिढी (${l2.children.length})`}
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {/* Level 3 */}
                                    {treeExpanded[l2.id] && (l2.children || []).length > 0 && (
                                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #E2E8F0', paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {l2.children.map((l3, i3) => (
                                          <div
                                            key={l3.id || i3}
                                            onClick={() => setSelectedMemberModal(l3)}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px',
                                              fontSize: '0.8rem',
                                              color: '#C2410C',
                                              cursor: 'pointer',
                                              padding: '4px 8px',
                                              borderRadius: '6px'
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF7ED'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                                            <span style={{ background: '#EA580C', color: '#FFFFFF', padding: '1px 5px', borderRadius: '4px', fontSize: '0.64rem', fontWeight: 800 }}>
                                              LEVEL 3
                                            </span>
                                            <strong>{l3.name}</strong>
                                            <span style={{ color: '#64748B' }}>({l3.district} • {l3.phone})</span>
                                            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#EA580C', fontWeight: 800 }}>ℹ️ तपशील</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 1: STATUS PROGRESS UPDATE                                 */}
        {/* ============================================================== */}
        {statusModalRef && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ margin: '0 0 6px', color: '#7C2D12', fontSize: '1.25rem' }}>
                ✏️ रेफरल प्रगती अपडेट करा
              </h3>
              <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: '0.86rem' }}>
                {statusModalRef.title}
              </p>

              <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                    नवीन स्थिती निवडा:
                  </label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}>
                    <option value="संपर्क साधला (Contacted)">📞 संपर्क साधला (Contacted)</option>
                    <option value="बैठक झाली / प्रस्ताव दिला">🤝 बैठक झाली / प्रस्ताव दिला (Meeting Done / Proposal)</option>
                    <option value="सौद्यावर चर्चा सुरू (In Negotiation)">💬 सौद्यावर चर्चा सुरू (In Negotiation)</option>
                    <option value="यशस्वी क्लोज (Won)">🏆 यशस्वी क्लोज (Won / Closed)</option>
                    <option value="अयशस्वी / रद्द (Lost)">❌ अयशस्वी / रद्द (Lost)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                    प्रगती नोंदी (Notes):
                  </label>
                  <textarea
                    rows="3"
                    placeholder="उदा. ग्राहकाशी प्राथमिक फोन चर्चा झाली असून सोमवारी दुपारी भेटायचे ठरले आहे..."
                    value={statusNotes}
                    onChange={e => setStatusNotes(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setStatusModalRef(null)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: 'pointer', fontWeight: 700 }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#EA580C', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}>
                    {submitting ? 'जतन होत आहे...' : 'जतन करा ✓'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: THANK YOU FOR CLOSED BUSINESS (TYFCB)                  */}
        {/* ============================================================== */}
        {tyfcbModalRef && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>🏆</span>
                <h3 style={{ margin: 0, color: '#166534', fontSize: '1.3rem', fontWeight: 800 }}>
                  सौदा यशस्वी पूर्ण (TYFCB नोंद)
                </h3>
              </div>
              <p style={{ margin: '0 0 16px', color: '#64748B', fontSize: '0.88rem' }}>
                संदर्भ देणारे <strong>{tyfcbModalRef.giverName}</strong> यांना प्रत्यक्ष व्यवसाय मूल्याची पावती व धन्यवाद पत्र पाठवा.
              </p>

              <form onSubmit={handleTyfcbSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                    प्रत्यक्ष मिळालेले व्यवसाय मूल्य (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="उदा. 850000"
                    value={tyfcbValue}
                    onChange={e => setTyfcbValue(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1.5px solid #16A34A', fontSize: '1.05rem', fontWeight: 800, color: '#166534' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                    व्यवसायाचा प्रकार:
                  </label>
                  <select
                    value={tyfcbType}
                    onChange={e => setTyfcbType(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}>
                    <option value="नवीन व्यवसाय (New Business)">नवीन व्यवसाय (New Business)</option>
                    <option value="पुनरावृत्ती व्यवसाय (Repeat Business)">पुनरावृत्ती व्यवसाय (Repeat Business)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, marginBottom: '4px' }}>
                    धन्यवाद संदेश (Gratitude Note):
                  </label>
                  <textarea
                    rows="3"
                    placeholder="उदा. आपल्या मोलाच्या संदर्भाने प्रकल्प यशस्वीरीत्या पूर्ण झाला. मनापासून धन्यवाद!"
                    value={tyfcbMessage}
                    onChange={e => setTyfcbMessage(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setTyfcbModalRef(null)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: 'pointer', fontWeight: 700 }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ padding: '8px 22px', borderRadius: '8px', border: 'none', background: '#16A34A', color: '#FFF', fontWeight: 800, cursor: 'pointer' }}>
                    {submitting ? 'नोंद होत आहे...' : 'धन्यवाद नोंदवा ✓'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 3: MEMBER PROFILE DETAILS & QUICK ACTION (CLICK HERE!)   */}
        {/* ============================================================== */}
        {selectedMemberModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
              border: '2px solid #FED7AA',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #1F2937 0%, #7C2D12 100%)',
                color: '#FFFFFF',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#FFF7ED',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                    fontWeight: 900,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    {(selectedMemberModal.name || selectedMemberModal.refereeName || 'म').charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', fontWeight: 900 }}>
                      {selectedMemberModal.name || selectedMemberModal.refereeName}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: 'rgba(255,255,255,0.2)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '0.82rem'
                      }}>
                        {selectedMemberModal.memberId || selectedMemberModal.refereeId}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#FED7AA' }}>
                        📍 {selectedMemberModal.district || 'महाराष्ट्र'}{selectedMemberModal.taluka ? `, ${selectedMemberModal.taluka}` : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMemberModal(null)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#FFFFFF',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  ✕
                </button>
              </div>

              {/* Body Details Grid */}
              <div style={{ padding: '24px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '14px',
                  marginBottom: '20px'
                }}>
                  <div style={{ background: '#FFF7ED', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FED7AA' }}>
                    <div style={{ fontSize: '0.76rem', color: '#9A3412', fontWeight: 800 }}>शिफारसकर्ता आयडी (Referral ID)</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#1F2937', fontFamily: 'monospace', marginTop: '2px' }}>
                      {selectedMemberModal.referralId || selectedMemberModal.referrerId || selectedMemberModal.sponsor_id || '-'}
                    </div>
                  </div>

                  <div style={{ background: '#FFF7ED', padding: '12px 14px', borderRadius: '12px', border: '1px solid #FED7AA' }}>
                    <div style={{ fontSize: '0.76rem', color: '#9A3412', fontWeight: 800 }}>शिफारसकर्ता नाव (Referral Name)</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#1F2937', marginTop: '2px' }}>
                      {selectedMemberModal.referralName || selectedMemberModal.referrerName || selectedMemberModal.sponsor_name || 'तुम्ही स्वतः (Direct)'}
                    </div>
                  </div>

                  {/* Level & Downline Team count */}
                  <div style={{ background: '#ECFDF5', padding: '12px 14px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                    <div style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 800 }}>हायराॅर्की स्तर (Hierarchy Level)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#065F46', marginTop: '2px' }}>
                      {selectedMemberModal.level ? `🎯 Level ${selectedMemberModal.level} (${selectedMemberModal.level === 1 ? 'थेट संदर्भ' : `${selectedMemberModal.level} री पिढी`})` : 'थेट सदस्य (Level 1)'}
                    </div>
                  </div>

                  <div style={{ background: '#EFF6FF', padding: '12px 14px', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                    <div style={{ fontSize: '0.76rem', color: '#1E40AF', fontWeight: 800 }}>यांच्या हाताखाली एकूण सदस्य (Team)</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1E3A8A', marginTop: '2px' }}>
                      👥 {selectedMemberModal.underThemCount !== undefined ? `${selectedMemberModal.underThemCount} सदस्य जोडले` : ((selectedMemberModal.children || []).length > 0 ? `${selectedMemberModal.children.length} सदस्य जोडले` : '० सदस्य')}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 800 }}>नोंदणी दिनांक (Joining Date)</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
                      {selectedMemberModal.joiningDate || (selectedMemberModal.registeredAt ? selectedMemberModal.registeredAt.slice(0, 10) : (selectedMemberModal.created_at ? selectedMemberModal.created_at.slice(0, 10) : 'उपलब्ध नाही'))}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 800 }}>सक्रिय दिनांक (Activ. Date)</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
                      {selectedMemberModal.activDate || selectedMemberModal.joiningDate || (selectedMemberModal.created_at ? selectedMemberModal.created_at.slice(0, 10) : 'सक्रिय')}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 800 }}>पॅकेज (Package)</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#B45309', marginTop: '2px' }}>
                      {selectedMemberModal.package || selectedMemberModal.tier || 'Gold (सुवर्ण)'}
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 800 }}>स्थिती (Status)</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 900, color: (selectedMemberModal.status || 'Active').toLowerCase() === 'active' ? '#15803D' : '#D97706', marginTop: '2px' }}>
                      {selectedMemberModal.status || 'Active'}
                    </div>
                  </div>
                </div>

                {/* Direct Action Contacts */}
                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <a
                      href={`tel:${selectedMemberModal.mobileNo || selectedMemberModal.refereePhone}`}
                      style={{
                        flex: 1,
                        background: '#0284C7',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                      📞 थेट कॉल करा ({selectedMemberModal.mobileNo || selectedMemberModal.refereePhone})
                    </a>

                    <a
                      href={`https://wa.me/91${(selectedMemberModal.mobileNo || selectedMemberModal.refereePhone || '').replace(/\D/g, '').slice(-10)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        background: '#16A34A',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                      💬 WhatsApp मेसेज
                    </a>
                  </div>

                  {selectedMemberModal.email && selectedMemberModal.email !== '-' && (
                    <a
                      href={`mailto:${selectedMemberModal.email}`}
                      style={{
                        background: '#FFF7ED',
                        color: '#C2410C',
                        border: '1.5px solid #FED7AA',
                        textDecoration: 'none',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}>
                      ✉️ ईमेल पाठवा ({selectedMemberModal.email})
                    </a>
                  )}

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedMemberModal.memberId || selectedMemberModal.refereeId);
                      alert(`सदस्य आयडी (${selectedMemberModal.memberId || selectedMemberModal.refereeId}) क्लिपबोर्डवर कॉपी केला!`);
                    }}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer'
                    }}>
                    📋 Member ID कॉपी करा
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
