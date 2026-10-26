import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function SevaCommandCenterPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('emergencies'); // 'emergencies' | 'help' | 'services' | 'reports'
  const [stats, setStats] = useState({
    activeEmergencies: 0,
    pendingReview: 0,
    helpRequests: 0,
    openServices: 0,
    activeBloodSOS: 12
  });
  const [emergencies, setEmergencies] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('सर्व');

  // Status Action Modal
  const [actionItem, setActionItem] = useState(null);
  const [newStatus, setNewStatus] = useState('verified');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDistrict]);

  const loadData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.emergency.getSevaStats().catch(() => null);
      if (statsRes?.data?.stats) {
        setStats(statsRes.data.stats);
      }

      const params = selectedDistrict !== 'सर्व' ? { district: selectedDistrict, status: 'all' } : { status: 'all' };
      const [emgRes, hlpRes] = await Promise.all([
        api.emergency.getEmergencies(params).catch(() => ({ data: { emergencies: [] } })),
        api.emergency.getHelpRequests(params).catch(() => ({ data: { helpRequests: [] } }))
      ]);

      const emgList = emgRes?.data?.emergencies || emgRes?.emergencies || [];
      const hlpList = hlpRes?.data?.helpRequests || hlpRes?.helpRequests || [];

      setEmergencies(Array.isArray(emgList) ? emgList : []);
      setHelpRequests(Array.isArray(hlpList) ? hlpList : []);
    } catch (err) {
      console.warn('Error loading Seva CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!actionItem) return;
    setUpdating(true);
    try {
      await api.emergency.updateEmergencyStatus(actionItem.id, {
        status: newStatus,
        notes: statusNote
      });
      alert(`स्थिती यशस्वीरीत्या '${newStatus}' मध्ये बदलण्यात आली!`);
      setActionItem(null);
      setStatusNote('');
      loadData();
    } catch (err) {
      alert(err.message || 'स्थिती बदलताना त्रुटी.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', paddingBottom: '60px' }}>
      
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)', color: '#fff', padding: '36px 20px 48px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '8px' }}>
                <span>🛡️ प्रशासकीय नियंत्रण कक्ष</span>
                <span>•</span>
                <span>Seva Command Center CRM</span>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '4px 0 6px', letterSpacing: '0.5px' }}>
                🛡️ सेवा कमांड सेंटर (Seva Operations CRM)
              </h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: '0.98rem' }}>
                महाराष्ट्रातील ३६ जिल्हे • आपत्कालीन पडताळणी, स्वयंसेवक नियुक्ती आणि समाज साहाय्य समन्वयन कक्ष.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to="/emergency" style={{ background: '#EF4444', color: '#fff', padding: '10px 18px', borderRadius: '24px', fontWeight: 800, fontSize: '0.88rem', textDecoration: 'none' }}>
                🚨 आपत्कालीन पोर्टल
              </Link>
              <Link to="/crm/admin" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', padding: '10px 18px', borderRadius: '24px', fontWeight: 700, fontSize: '0.88rem', textDecoration: 'none' }}>
                📊 मुख्य Admin CRM
              </Link>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 700 }}>सक्रिय आणीबाणी अलर्ट्स</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FCA5A5', marginTop: '4px' }}>{stats.activeEmergencies}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '2px' }}>तातडीने कारवाई आवश्यक</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 700 }}>पडताळणी प्रलंबित (Review)</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#FDE68A', marginTop: '4px' }}>{stats.pendingReview}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '2px' }}>सत्यापन करणे बाकी</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 700 }}>समाज मदत विनंत्या</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#93C5FD', marginTop: '4px' }}>{stats.helpRequests}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '2px' }}>अन्न, निवारा व शिक्षण</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: 700 }}>२४×७ रक्त SOS विनंत्या</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F87171', marginTop: '4px' }}>{stats.activeBloodSOS}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '2px' }}>रुग्णालय रक्तपेढी समन्वय</div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Body */}
      <div style={{ maxWidth: '1240px', margin: '-20px auto 0', padding: '0 16px' }}>

        {/* Tab & District Filter Toolbar */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', border: '1px solid #E2E8F0' }}>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('emergencies')}
              style={{
                background: activeTab === 'emergencies' ? '#312E81' : '#F1F5F9',
                color: activeTab === 'emergencies' ? '#fff' : '#475569',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}>
              🚨 आपत्कालीन घटना ({emergencies.length})
            </button>

            <button
              onClick={() => setActiveTab('help')}
              style={{
                background: activeTab === 'help' ? '#312E81' : '#F1F5F9',
                color: activeTab === 'help' ? '#fff' : '#475569',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}>
              🤝 मदत प्रकरणे ({helpRequests.length})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>जिल्हा निवड:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}>
              <option value="सर्व">संपूर्ण महाराष्ट्र (सर्व)</option>
              <option value="पुणे">पुणे</option>
              <option value="मुंबई">मुंबई</option>
              <option value="नाशिक">नाशिक</option>
              <option value="छत्रपती संभाजीनगर">छत्रपती संभाजीनगर</option>
              <option value="कोल्हापूर">कोल्हापूर</option>
              <option value="सातारा">सातारा</option>
              <option value="नागपूर">नागपूर</option>
            </select>
          </div>

        </div>

        {/* Content Table / List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>लोड होत आहे...</div>
        ) : activeTab === 'emergencies' ? (
          <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: 800, fontSize: '1rem', color: '#1E293B' }}>
              सर्व आपत्कालीन घटना पडताळणी व समन्वयन
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                    <th style={{ padding: '12px 16px' }}>आयडी / श्रेणी</th>
                    <th style={{ padding: '12px 16px' }}>शीर्षक व तपशील</th>
                    <th style={{ padding: '12px 16px' }}>स्थान / जिल्हा</th>
                    <th style={{ padding: '12px 16px' }}>नोंदणीकर्ता / फोन</th>
                    <th style={{ padding: '12px 16px' }}>सद्यस्थिती</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>कृती (Action)</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencies.map(emg => (
                    <tr key={emg.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#312E81' }}>{emg.id}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{emg.category}</div>
                      </td>
                      <td style={{ padding: '12px 16px', maxWidth: '320px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>{emg.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emg.description}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{emg.city} ({emg.district})</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{emg.location}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{emg.reporter_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 600 }}>{emg.reporter_phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: emg.status === 'resolved' ? '#DCFCE7' : emg.status === 'verified' ? '#FEF3C7' : '#FEE2E2',
                          color: emg.status === 'resolved' ? '#166534' : emg.status === 'verified' ? '#92400E' : '#991B1B',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '0.75rem'
                        }}>
                          {emg.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setActionItem(emg);
                            setNewStatus(emg.status);
                          }}
                          style={{
                            background: '#312E81',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}>
                          स्थिती बदला ⚙️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontWeight: 800, fontSize: '1rem', color: '#1E293B' }}>
              सर्व समाज मदत विनंत्या
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569' }}>
                    <th style={{ padding: '12px 16px' }}>आयडी / श्रेणी</th>
                    <th style={{ padding: '12px 16px' }}>गरजेचे नाव व वर्णन</th>
                    <th style={{ padding: '12px 16px' }}>स्थान</th>
                    <th style={{ padding: '12px 16px' }}>विनंतीकर्ता</th>
                    <th style={{ padding: '12px 16px' }}>स्थिती</th>
                  </tr>
                </thead>
                <tbody>
                  {helpRequests.map(hlp => (
                    <tr key={hlp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#2563EB' }}>{hlp.id}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{hlp.category}</div>
                      </td>
                      <td style={{ padding: '12px 16px', maxWidth: '320px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{hlp.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#475569' }}>{hlp.description}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{hlp.city} ({hlp.district})</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{hlp.location}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{hlp.requester_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#2563EB' }}>{hlp.requester_phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: '8px', fontWeight: 700, fontSize: '0.75rem' }}>
                          {hlp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Status Update Modal */}
      {actionItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '460px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#1E1B4B' }}>
                ⚙️ घटना स्थिती अद्ययावत करा
              </h3>
              <button onClick={() => setActionItem(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '14px' }}>
              घटना: <strong>{actionItem.title}</strong> ({actionItem.id})
            </p>

            <form onSubmit={handleUpdateStatus}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>नवी स्थिती निवडा *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}>
                  <option value="under_review">⏳ पडताळणी सुरू (Under Review)</option>
                  <option value="verified">✅ सत्यापित (Verified - वैध घटना)</option>
                  <option value="responders_assigned">🏃 स्वयंसेवक नियुक्त / मदत सुरू (Responders Assigned)</option>
                  <option value="resolved">🏁 निवारण झाले (Resolved - मदत पूर्ण)</option>
                  <option value="closed">✕ बंद / खोटी तक्रार (Closed / False Report)</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>समन्वयक शेरा / नोंद</label>
                <textarea
                  rows="3"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="उदा. स्थानिक रुग्णवाहिकेशी संपर्क साधला, मदत जागेवर पोहोचली..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                style={{
                  width: '100%',
                  background: '#312E81',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: updating ? 'not-allowed' : 'pointer'
                }}>
                {updating ? 'बदलत आहे...' : 'निश्चित करा'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
