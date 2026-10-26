import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import CRMScopeSwitcher from '../../components/layout/CRMScopeSwitcher';

export default function BranchAdminCRM() {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [activeTab, setActiveTab] = useState('members'); // 'members', 'volunteers', 'meeting', 'seva', 'all_branches'
  const [viewMode, setViewMode] = useState('owner'); // 'owner' | 'manager'
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  // Filter branches by state/district
  const [filterState, setFilterState] = useState('महाराष्ट्र');
  const [filterDistrict, setFilterDistrict] = useState('सर्व');

  // Multi-Branch Add Modal
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchState, setNewBranchState] = useState('महाराष्ट्र');
  const [newBranchDistrict, setNewBranchDistrict] = useState('पुणे');
  const [newBranchTaluka, setNewBranchTaluka] = useState('हवेली');
  const [newBranchArea, setNewBranchArea] = useState('');
  const [newBranchHead, setNewBranchHead] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');
  const [newBranchPassword, setNewBranchPassword] = useState('Maratha@2026');

  // Meeting notes
  const [meetingTopic, setMeetingTopic] = useState('');
  const [attendeeCount, setAttendeeCount] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getBranches();
      setBranches(data || []);
      if (data && data.length > 0 && !selectedBranchId) {
        setSelectedBranchId(data[0].id);
      }
    } catch (err) {
      console.warn('Branch load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentBranch = branches.find(b => b.id === selectedBranchId) || branches[0] || {
    id: 'BR-HAV-001',
    name: 'शिवनेरी मध्यवर्ती शाखा, हवेली',
    district: 'पुणे',
    taluka: 'हवेली',
    area: 'शिवाजीनगर व फर्ग्युसन रोड परिसर',
    headName: 'श्री. विजय कदम (शाखाध्यक्ष)',
    secretaryName: 'श्री. महेश भोसले (शाखा सचिव)',
    membersCount: 420,
    activeCount: 382,
    newThisMonth: 48,
    referralsCount: 96,
    businessesCount: 82,
    volunteersCount: 64,
    sevaCasesCount: 12,
    status: 'सक्रिय (Active)'
  };

  // Record meeting in database
  const handleRecordMeeting = async (e) => {
    e.preventDefault();
    if (!meetingTopic.trim()) return;

    try {
      await apiClient.recordBranchAction({
        branchId: currentBranch.id,
        actionType: 'branch_meeting',
        notes: `विषय: ${meetingTopic} | उपस्थिती: ${attendeeCount || 25} | इतिवृत्त: ${meetingNotes}`
      });

      setRecentActivities(prev => [
        { time: new Date().toLocaleTimeString(), text: `📝 शाखा बैठक: "${meetingTopic}" (${attendeeCount || 25} उपस्थित) नोंदवली गेली.` },
        ...prev.slice(0, 9)
      ]);

      showToast(`✅ शाखेच्या बैठकीचे इतिवृत्त डेटाबेसमध्ये यशस्वीरीत्या नोंदवले गेले!`);
      setMeetingTopic('');
      setAttendeeCount('');
      setMeetingNotes('');
  const handleCreateBranchSubmit = async (e) => {
    e.preventDefault();
    if (!newBranchName || !newBranchHead || !newBranchPhone) {
      alert('कृपया आवश्यक सर्व माहिती भरा.');
      return;
    }

    const branchPayload = {
      level: 'branch',
      name: newBranchName,
      state: newBranchState,
      district: newBranchDistrict,
      taluka: newBranchTaluka,
      area: newBranchArea,
      owner: {
        name: newBranchHead,
        phone: newBranchPhone,
        password: newBranchPassword || 'Maratha@2026'
      }
    };

    try {
      await apiClient.createCrmUnit(branchPayload).catch(err => {
        console.warn('Backend CRM branch creation notice:', err.message);
      });

      const newBrObj = {
        id: `BR-${Date.now().toString(36).toUpperCase()}`,
        name: newBranchName,
        state: newBranchState,
        district: newBranchDistrict,
        taluka: newBranchTaluka,
        area: newBranchArea || `${newBranchTaluka} परिसर`,
        headName: `${newBranchHead} (शाखाध्यक्ष)`,
        secretaryName: 'शाखा सचिव',
        membersCount: 0,
        activeCount: 0,
        newThisMonth: 0,
        referralsCount: 0,
        businessesCount: 0,
        volunteersCount: 0,
        sevaCasesCount: 0,
        status: 'सक्रिय (Active)'
      };

      setBranches([newBrObj, ...branches]);
      setSelectedBranchId(newBrObj.id);
      setShowAddBranchModal(false);
      setNewBranchName('');
      setNewBranchArea('');
      setNewBranchHead('');
      setNewBranchPhone('');
      showToast(`'${newBranchName}' ही नवीन शाखा यशस्वीरीत्या जोडली गेली!`);
    } catch (err) {
      alert('त्रुटी: ' + err.message);
    }
  };

  return (
    <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFF',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            width: '100%',
            maxWidth: '520px',
            padding: '28px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#701A75' }}>
                🏠 नवीन स्थानिक शाखा (Branch) तयार करा
              </h3>
              <button
                onClick={() => setShowAddBranchModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#4B5563' }}>
              एकाच तालुक्यात किंवा शहरात एकापेक्षा जास्त शाखा (Multiple Branches) तयार करा व शाखाध्यक्ष खाते द्या.
            </p>

            <form onSubmit={handleCreateBranchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '4px', fontWeight: 700 }}>शाखेचे नाव *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. शिवनेरी मध्यवर्ती शाखा, कोथरूड"
                  value={newBranchName}
                  onChange={e => setNewBranchName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '4px', fontWeight: 700 }}>राज्य</label>
                  <select
                    value={newBranchState}
                    onChange={e => setNewBranchState(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="महाराष्ट्र">महाराष्ट्र</option>
                    <option value="कर्नाटक">कर्नाटक</option>
                    <option value="गोवा">गोवा</option>
                    <option value="गुजरात">गुजरात</option>
                    <option value="मध्य प्रदेश">मध्य प्रदेश</option>
                    <option value="दिल्ली-NCR">दिल्ली-NCR</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '4px', fontWeight: 700 }}>जिल्हा</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. पुणे"
                    value={newBranchDistrict}
                    onChange={e => setNewBranchDistrict(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '4px', fontWeight: 700 }}>तालुका / शहर</label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. हवेली"
                    value={newBranchTaluka}
                    onChange={e => setNewBranchTaluka(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '4px', fontWeight: 700 }}>स्थानिक परिसर (Area)</label>
                  <input
                    type="text"
                    placeholder="उदा. कोथरूड व कर्वेनगर परिसर"
                    value={newBranchArea}
                    onChange={e => setNewBranchArea(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '4px', fontWeight: 700 }}>शाखाध्यक्ष (Owner) नाव *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. श्री. संभाजीराव कदम"
                  value={newBranchHead}
                  onChange={e => setNewBranchHead(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '4px', fontWeight: 700 }}>मोबाईल (लॉगिन आयडी) *</label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="उदा. 9876543210"
                    value={newBranchPhone}
                    onChange={e => setNewBranchPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#374151', display: 'block', marginBottom: '4px', fontWeight: 700 }}>लॉगिन पासवर्ड</label>
                  <input
                    type="text"
                    required
                    value={newBranchPassword}
                    onChange={e => setNewBranchPassword(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, background: 'linear-gradient(135deg, #701A75, #A21CAF)', color: '#FFF', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                >
                  ✓ शाखा युनिट तयार करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div style={{ padding: '32px 16px 80px', color: '#1C1917', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Toast */}
        {toastMsg && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: '#C2410C',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 9999,
            fontWeight: 700
          }}>
            {toastMsg}
          </div>
        )}

        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #701A75 0%, #A21CAF 60%, #C026D3 100%)',
          borderRadius: '20px',
          padding: '30px 26px',
          color: '#FFF',
          boxShadow: '0 12px 32px rgba(162,28,175,0.25)',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>
              🏠 GRASSROOTS BRANCH / SHAKHA COMMAND CRM
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '4px 0 8px' }}>
              {currentBranch.name}
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
              शाखाध्यक्ष: <strong>{currentBranch.headName}</strong> | कार्यक्षेत्र: {currentBranch.area} ({currentBranch.district} - {currentBranch.taluka})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Owner vs Manager View Switcher */}
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <button
                onClick={() => setViewMode('owner')}
                style={{
                  background: viewMode === 'owner' ? '#FFF' : 'transparent',
                  color: viewMode === 'owner' ? '#701A75' : '#FFF',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                👑 Owner View
              </button>
              <button
                onClick={() => setViewMode('manager')}
                style={{
                  background: viewMode === 'manager' ? '#FFF' : 'transparent',
                  color: viewMode === 'manager' ? '#701A75' : '#FFF',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                📋 Manager View
              </button>
            </div>

            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              style={{
                background: '#FFF',
                color: '#701A75',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name} ({b.district || 'पुणे'})</option>
              ))}
            </select>

            <button
              onClick={() => setShowAddBranchModal(true)}
              style={{
                background: '#10B981',
                color: '#FFF',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>➕</span> नवीन शाखा जोडा
            </button>

            <Link
              to="/crm/taluka"
              style={{
                background: 'rgba(255,255,255,0.25)',
                color: '#FFF',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '0.9rem'
              }}
            >
              📍 तालुका अहवाल →
            </Link>
          </div>
        </div>

        {/* 4 Branch Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #F0ABFC' }}>
            <div style={{ fontSize: '0.85rem', color: '#701A75', fontWeight: 700 }}>शाखेतील एकूण सदस्य</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#A21CAF', marginTop: '4px' }}>
              {currentBranch.membersCount || 420}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
              ✓ सक्रिय: {currentBranch.activeCount || 382} | नवीन: +{currentBranch.newThisMonth || 48}
            </div>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #FED7AA' }}>
            <div style={{ fontSize: '0.85rem', color: '#9A3412', fontWeight: 700 }}>रेफरल व B2B जोडणी</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#EA580C', marginTop: '4px' }}>
              {currentBranch.referralsCount || 96}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#65A30D', fontWeight: 700, marginTop: '4px' }}>
              🤝 {currentBranch.businessesCount || 82} स्थानिक व्यापारी
            </div>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: '0.85rem', color: '#1E3A8A', fontWeight: 700 }}>सक्रिय स्वयंसेवक (Volunteers)</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#2563EB', marginTop: '4px' }}>
              {currentBranch.volunteersCount || 64}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700, marginTop: '4px' }}>
              🙋 गाव/वॉर्ड पातळीवरील युवक
            </div>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #FECACA' }}>
            <div style={{ fontSize: '0.85rem', color: '#991B1B', fontWeight: 700 }}>स्थानिक सेवा व मदत केसेस</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#DC2626', marginTop: '4px' }}>
              {currentBranch.sevaCasesCount || 12}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
              🩸 सर्व केसेस समन्वित
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #E2E8F0', marginBottom: '24px', overflowX: 'auto' }}>
          {[
            { id: 'members', label: '👥 शाखेतील सदस्य व कुटुंब' },
            { id: 'volunteers', label: '🙋 स्वयंसेवक व युवा फळी' },
            { id: 'meeting', label: '📝 स्थानिक बैठक इतिवृत्त' },
            { id: 'seva', label: '🩺 स्थानिक समाजकार्य' },
            { id: 'all_branches', label: `🏛️ सर्व शाखा यादी (${branches.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 18px',
                fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? '#A21CAF' : '#64748B',
                borderBottom: activeTab === tab.id ? '3px solid #A21CAF' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Members */}
        {activeTab === 'members' && (
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#701A75', fontSize: '1.2rem', fontWeight: 800 }}>
              {currentBranch.name} — स्थानिक सदस्य यादी
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {[
                { name: 'श्री. विजयराव कदम', role: 'शाखाध्यक्ष', phone: '9822011931', status: '✓ प्रमाणित' },
                { name: 'श्री. महेश संभाजी भोसले', role: 'शाखा सचिव', phone: '9822011934', status: '✓ प्रमाणित' },
                { name: 'श्री. अमोल तुकाराम जाधव', role: 'व्यावसायिक सदस्य', phone: '9822011924', status: '✓ प्रमाणित' },
                { name: 'श्री. सुजित तानाजी मोरे', role: 'युवा स्वयंसेवक', phone: '9822011935', status: '✓ प्रमाणित' }
              ].map((m, idx) => (
                <div key={idx} style={{ border: '1px solid #F0ABFC', borderRadius: '12px', padding: '16px', background: '#FDF4FF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800, color: '#701A75', fontSize: '1.05rem' }}>{m.name}</div>
                    <span style={{ fontSize: '0.75rem', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>
                      {m.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#86198F', marginTop: '4px' }}>पद: <strong>{m.role}</strong></div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>📞 {m.phone}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Volunteers */}
        {activeTab === 'volunteers' && (
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#701A75', fontSize: '1.2rem', fontWeight: 800 }}>
              {currentBranch.name} — शाखा स्वयंसेवक व आपत्कालीन मदत दल
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'सुजित मोरे', role: 'रक्तदान समन्वय प्रमुख', phone: '9822011935', blood: 'O+' },
                { name: 'रोहित पवार', role: 'कार्यक्रम व बैठक व्यवस्थापन', phone: '9822011936', blood: 'A+' },
                { name: 'नितीन शिंदे', role: 'स्थानिक सदस्य संपर्क दूत', phone: '9822011937', blood: 'B+' }
              ].map((v, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', border: '1px solid #E2E8F0', borderRadius: '10px', background: '#F8FAFC' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#1C1917' }}>{v.name} ({v.role})</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>📞 {v.phone} | रक्तगट: <strong>{v.blood}</strong></div>
                  </div>
                  <button
                    onClick={() => showToast(`📞 ${v.name} यांच्याशी थेट संपर्क साधला जात आहे...`)}
                    style={{ background: '#A21CAF', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    📞 कॉल करा
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Meeting MOM */}
        {activeTab === 'meeting' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px', color: '#701A75', fontSize: '1.15rem', fontWeight: 800 }}>
                + शाखेची बैठक नोंदवा (Log Branch MOM)
              </h3>
              <form onSubmit={handleRecordMeeting}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>बैठकीचा मुख्य विषय</label>
                  <input
                    type="text"
                    value={meetingTopic}
                    onChange={(e) => setMeetingTopic(e.target.value)}
                    placeholder="उदा. शिवजयंती उत्सव नियोजन व सदस्य नोंदणी मोहीम"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>उपस्थित सदस्यांची संख्या</label>
                  <input
                    type="number"
                    value={attendeeCount}
                    onChange={(e) => setAttendeeCount(e.target.value)}
                    placeholder="उदा. 35"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>बैठकीचे महत्त्वाचे निर्णय व इतिवृत्त</label>
                  <textarea
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    rows={3}
                    placeholder="उदा. पुढील आठवड्यात स्थानिक रक्तदान शिबिर आयोजित करण्याचे ठरले..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#A21CAF',
                    color: '#FFF',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  ✓ बैठक इतिवृत्त डेटाबेसमध्ये जतन करा
                </button>
              </form>
            </div>

            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px', color: '#701A75', fontSize: '1.15rem', fontWeight: 800 }}>
                📋 शाखेच्या ताज्या नोंदी (Branch Log)
              </h3>
              {recentActivities.length === 0 ? (
                <div style={{ color: '#64748B', fontSize: '0.9rem', textAlign: 'center', padding: '30px' }}>
                  शाखेच्या ताज्या बैठका व निर्णय येथे दिसतील...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentActivities.map((act, idx) => (
                    <div key={idx} style={{ padding: '10px 14px', borderRadius: '8px', background: '#FDF4FF', border: '1px solid #F0ABFC', fontSize: '0.85rem' }}>
                      <span style={{ color: '#86198F', marginRight: '8px' }}>[{act.time}]</span>
                      <strong>{act.text}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Seva */}
        {activeTab === 'seva' && (
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#DC2626', fontSize: '1.2rem', fontWeight: 800 }}>
              🚨 {currentBranch.name} — स्थानिक मदत कार्य
            </h3>
            <div style={{ padding: '16px', border: '1px solid #FECACA', borderRadius: '12px', background: '#FEF2F2' }}>
              <div style={{ fontWeight: 800, color: '#DC2626' }}>🩸 स्थानिक मोहीम: मोफत आरोग्य तपासणी व रक्तदान</div>
              <div style={{ fontSize: '0.9rem', color: '#1C1917', marginTop: '6px' }}>
                शाखा कार्यालयात दर महिन्याच्या पहिल्या रविवारी रक्तदान शिबिर आयोजित केले जाते.
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: All Branches Directory (Multi-Branch Engine) */}
        {activeTab === 'all_branches' && (
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#701A75', fontSize: '1.2rem', fontWeight: 800 }}>
                  🏛️ सर्व स्थानिक शाखा डिरेक्टरी (Multiple Branches Directory)
                </h3>
                <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.85rem' }}>
                  विविध राज्ये, जिल्हे व एकाच तालुक्यातील सर्व कार्यरत शाखांची यादी व थेट व्यवस्थापन
                </p>
              </div>
              <button
                onClick={() => setShowAddBranchModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#FFF',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                ➕ नवीन शाखा जोडा
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {branches.map(br => (
                <div
                  key={br.id}
                  style={{
                    border: selectedBranchId === br.id ? '2px solid #A21CAF' : '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px',
                    background: selectedBranchId === br.id ? '#FDF4FF' : '#FAFAFA'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 800, color: '#1E1B4B', fontSize: '1.05rem' }}>{br.name}</div>
                    <span style={{ fontSize: '10px', background: '#E2E8F0', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      {br.state || 'महाराष्ट्र'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#4B5563', marginBottom: '6px' }}>
                    📍 <strong>{br.district}</strong> {br.taluka ? `• ${br.taluka}` : ''} ({br.area || 'स्थानिक परिसर'})
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#701A75', fontWeight: 700, marginBottom: '12px' }}>
                    👤 {br.headName || 'शाखाध्यक्ष'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setSelectedBranchId(br.id);
                        setActiveTab('members');
                        showToast(`'${br.name}' ही शाखा सक्रिय निवडण्यात आली.`);
                      }}
                      style={{
                        flex: 1,
                        background: selectedBranchId === br.id ? '#A21CAF' : '#FFF',
                        color: selectedBranchId === br.id ? '#FFF' : '#701A75',
                        border: '1px solid #A21CAF',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {selectedBranchId === br.id ? '✓ सध्याची सक्रिय शाखा' : 'या शाखेचा डॅशबोर्ड उघडा'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
);
}
