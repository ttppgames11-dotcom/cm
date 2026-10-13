import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import CRMScopeSwitcher from '../../components/layout/CRMScopeSwitcher';

export default function BranchAdminCRM() {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [activeTab, setActiveTab] = useState('members'); // 'members', 'volunteers', 'meeting', 'seva'
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

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
    } catch (err) {
      showToast('त्रुटी: बैठक नोंदवता आली नाही.');
    }
  };

  return (
    <div style={{ background: '#FFFDF9', minHeight: '100vh' }}>
      <CRMScopeSwitcher currentScope="branch" />
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

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

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
        <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #E2E8F0', marginBottom: '24px' }}>
          {[
            { id: 'members', label: '👥 शाखेतील सदस्य व कुटुंब (Members)' },
            { id: 'volunteers', label: '🙋 स्वयंसेवक व युवा फळी (Volunteers)' },
            { id: 'meeting', label: '📝 स्थानिक बैठक इतिवृत्त (Meeting MOM)' },
            { id: 'seva', label: '🩺 स्थानिक समाजकार्य (Seva)' }
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

      </div>
    </div>
  </div>
);
}
