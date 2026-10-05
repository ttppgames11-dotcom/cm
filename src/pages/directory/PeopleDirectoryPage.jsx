import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const DISTRICTS = [
  'सर्व', 'पुणे', 'मुंबई', 'मुंबई उपनगर', 'नाशिक', 'सातारा', 'कोल्हापूर', 'नागपूर', 'छत्रपती संभाजीनगर'
];

export default function PeopleDirectoryPage() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [district, setDistrict] = useState('सर्व');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Follow & Connect State
  const [connectedIds, setConnectedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cm_user_connections') || '["mem-102", "mem-105"]');
    } catch {
      return ['mem-102', 'mem-105'];
    }
  });

  const [followingIds, setFollowingIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cm_user_following') || '["mem-101", "mem-102"]');
    } catch {
      return ['mem-101', 'mem-102'];
    }
  });

  const [feedbackNotice, setFeedbackNotice] = useState(null);

  useEffect(() => {
    loadMembers();
  }, [district]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const [membersRes, statsRes] = await Promise.all([
        api.members.getAll({
          district: district !== 'सर्व' ? district : undefined,
          search: search || undefined
        }),
        api.members.getStats()
      ]);
      if (membersRes && membersRes.members) setMembers(membersRes.members);
      if (statsRes && statsRes.stats) setStats(statsRes.stats);
    } catch (err) {
      console.error('Error fetching members directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMembers();
  };

  const toggleConnect = (member) => {
    const isConn = connectedIds.includes(member.id);
    let next;
    if (isConn) {
      next = connectedIds.filter(id => id !== member.id);
      setFeedbackNotice(`🤝 ${member.name} यांच्याशी कनेक्शन काढले.`);
    } else {
      next = [...connectedIds, member.id];
      setFeedbackNotice(`🤝 ${member.name} यांच्याशी यशस्वीरित्या कनेक्ट झाले! आता थेट संदेश पाठवा किंवा 1-to-1 भेट ठरवा.`);
    }
    setConnectedIds(next);
    localStorage.setItem('cm_user_connections', JSON.stringify(next));
    setTimeout(() => setFeedbackNotice(null), 5000);
  };

  const toggleFollow = (member) => {
    const isFoll = followingIds.includes(member.id);
    let next;
    if (isFoll) {
      next = followingIds.filter(id => id !== member.id);
      setFeedbackNotice(`🔔 ${member.name} यांना अनफॉलो केले.`);
    } else {
      next = [...followingIds, member.id];
      setFeedbackNotice(`🔔 ${member.name} यांना फॉलो केले. त्यांचे अपडेट्स आपल्या फीडवर दिसतील.`);
    }
    setFollowingIds(next);
    localStorage.setItem('cm_user_following', JSON.stringify(next));
    setTimeout(() => setFeedbackNotice(null), 4000);
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
              👥 मराठा समाज निर्देशिका
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '10px 0 6px', fontFamily: 'Baloo 2' }}>
              मराठा सदस्य व व्यावसायिक निर्देशिका (People Directory)
            </h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '1.05rem', maxWidth: '65ch' }}>
              महाराष्ट्रासह जगभरातील मराठा व्यावसायिक, डॉक्टर, अभियंते, सीए, शिक्षक व तरुणांची सत्यापित डिरेक्टरी.
            </p>
          </div>

          {/* Quick Action Links & Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
            {stats && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 18px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>२४,०००+</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>नोंदणीकृत सदस्य</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 18px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>३६</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>जिल्हे कव्हरेज</div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link
                to="/meetings"
                style={{ background: '#fff', color: '#C73800', padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                ☕ १-टू-१ बैठका पोर्टल
              </Link>
              <Link
                to="/messages"
                style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '8px 14px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                💬 संदेश (Inbox)
              </Link>
            </div>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackNotice && (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #10B981',
            color: '#065F46',
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.92rem',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(16,185,129,0.15)'
          }}>
            <span>{feedbackNotice}</span>
            <button
              onClick={() => setFeedbackNotice(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065F46', fontSize: '1.2rem', padding: 0 }}>
              ✕
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '18px 24px', border: '1px solid #E5E7EB', marginBottom: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="नाव, व्यवसाय, पदवी किंवा कौशल्य शोधा..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '160px' }}>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff', fontSize: '0.95rem' }}>
                {DISTRICTS.map(d => (
                  <option key={d} value={d}>📍 जिल्हा: {d}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ background: '#C73800', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              शोधा 🔍
            </button>
          </form>
        </div>

        {/* Members Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888' }}>
            सदस्य यादी लोड होत आहे... ⏳
          </div>
        ) : members.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '14px', padding: '60px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>👤</div>
            <h2>कोणताही सदस्य आढळला नाही</h2>
            <p>कृपया वेगळा शोध शब्द किंवा जिल्हा निवडून पहा.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
            {members.map(m => {
              const isConnected = connectedIds.includes(m.id);
              const isFollowing = followingIds.includes(m.id);

              return (
                <div
                  key={m.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '2.4rem', background: '#FFF8F2', padding: '8px', borderRadius: '12px' }}>
                          {m.avatar || '👤'}
                        </span>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', margin: '0 0 2px', color: '#1F2937' }}>
                            {m.name}
                          </h3>
                          <div style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                            📍 {m.city} ({m.district})
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{
                          background: m.tier === 'Platinum' ? '#F3E8FF' : m.tier === 'Gold' ? '#FEF3C7' : '#E0F2FE',
                          color: m.tier === 'Platinum' ? '#6B21A8' : m.tier === 'Gold' ? '#92400E' : '#0369A1',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 800
                        }}>
                          🚩 {m.tier || 'Gold'}
                        </span>
                        {isFollowing && (
                          <span style={{ fontSize: '0.7rem', color: '#2563EB', fontWeight: 600 }}>
                            ✓ फॉलो करत आहात
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '0.85rem' }}>
                      <div style={{ color: '#1F2937', fontWeight: 600 }}>
                        💼 {m.profession || 'व्यावसायिक'}
                      </div>
                      {m.business && (
                        <div style={{ color: '#6B7280', marginTop: '2px' }}>
                          🏢 {m.business}
                        </div>
                      )}
                      {m.education && (
                        <div style={{ color: '#9CA3AF', marginTop: '2px', fontSize: '0.8rem' }}>
                          🎓 {m.education}
                        </div>
                      )}
                    </div>

                    {m.about && (
                      <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.5, margin: '0 0 14px' }}>
                        {m.about}
                      </p>
                    )}

                    {/* Skills Tags */}
                    {m.skills && m.skills.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        {m.skills.map((s, idx) => (
                          <span key={idx} style={{ background: '#FFF3E0', color: '#C73800', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#9CA3AF' }}>
                      <span>आयडी: {m.id}</span>
                      <span style={{ color: isConnected ? '#10B981' : '#6B7280', fontWeight: 600 }}>
                        {isConnected ? '✓ कनेक्टेड सदस्य' : 'अद्याप कनेक्ट नाही'}
                      </span>
                    </div>

                    {/* Interactive Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {/* Connect Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleConnect(m)}
                        style={{
                          background: isConnected ? '#ECFDF5' : '#fff',
                          border: `1px solid ${isConnected ? '#10B981' : '#C73800'}`,
                          color: isConnected ? '#065F46' : '#C73800',
                          padding: '7px 10px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}>
                        {isConnected ? '✓ कनेक्टेड' : '🤝 कनेक्ट व्हा'}
                      </button>

                      {/* Follow Toggle Button */}
                      <button
                        type="button"
                        onClick={() => toggleFollow(m)}
                        style={{
                          background: isFollowing ? '#EFF6FF' : '#fff',
                          border: `1px solid ${isFollowing ? '#3B82F6' : '#D1D5DB'}`,
                          color: isFollowing ? '#1D4ED8' : '#4B5563',
                          padding: '7px 10px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}>
                        {isFollowing ? '✓ फॉलो' : '+ फॉलो करा'}
                      </button>

                      {/* Chat / Message Button */}
                      <Link
                        to={`/messages?to=${m.id}&name=${encodeURIComponent(m.name)}`}
                        style={{
                          background: '#F3F4F6',
                          border: '1px solid #E5E7EB',
                          color: '#1F2937',
                          padding: '7px 10px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          textDecoration: 'none',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}>
                        💬 संदेश
                      </Link>

                      {/* Book 1-to-1 Meeting Button */}
                      <Link
                        to={`/meetings?recipient=${m.id}&name=${encodeURIComponent(m.name)}`}
                        style={{
                          background: '#C73800',
                          border: 'none',
                          color: '#fff',
                          padding: '7px 10px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          borderRadius: '8px',
                          textDecoration: 'none',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}>
                        ☕ भेट ठरवा
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
