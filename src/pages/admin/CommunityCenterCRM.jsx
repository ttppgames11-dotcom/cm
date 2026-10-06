import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

export default function CommunityCenterCRM() {
  const [centers, setCenters] = useState([]);
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [activeTab, setActiveTab] = useState('desk'); // 'desk', 'services', 'collection', 'register'
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);
  
  // Quick action states
  const [collectionAmount, setCollectionAmount] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('सदस्य नोंदणी व KYC');
  const [recentLogs, setRecentLogs] = useState([]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    loadCenters();
  }, []);

  const loadCenters = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getCommunityCenters();
      setCenters(data || []);
      if (data && data.length > 0 && !selectedCenterId) {
        setSelectedCenterId(data[0].id);
      }
    } catch (err) {
      console.warn('Center load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentCenter = centers.find(c => c.id === selectedCenterId) || centers[0] || {
    id: 'CC-DEFAULT-01',
    name: 'कम्युनिटी सेवा केंद्र',
    tier: 'taluka',
    district: 'पुणे',
    taluka: 'हवेली',
    address: 'शिवाजीनगर, पुणे',
    todayVisitors: 32,
    dailyCollection: 14500,
    activeMembers: 2100,
    kycPending: 12,
    partnerName: 'सह्याद्री प्रतिष्ठान',
    investmentTier: '₹३,६०,००० (तालुका मॉडेल)'
  };

  // Record visitor check-in to database
  const handleCheckinVisitor = async (e) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    try {
      await apiClient.recordCenterAction({
        centerId: currentCenter.id,
        actionType: 'visitor_checkin',
        notes: `अभ्यागत: ${visitorName} (${visitorPhone}) - हेतू: ${visitorPurpose}`
      });

      setRecentLogs(prev => [
        { time: new Date().toLocaleTimeString(), text: `👤 अभ्यागत: ${visitorName} (${visitorPurpose}) दाखल` },
        ...prev.slice(0, 9)
      ]);

      showToast(`✅ अभ्यागत ${visitorName} यांची नोंदणी केंद्राच्या डेटाबेसमध्ये झाली!`);
      setVisitorName('');
      setVisitorPhone('');
      loadCenters();
    } catch (err) {
      showToast('त्रुटी: अभ्यागत नोंदवता आला नाही.');
    }
  };

  // Record fee / donation collection to database
  const handleRecordCollection = async (e) => {
    e.preventDefault();
    const amt = Number(collectionAmount);
    if (!amt || amt <= 0) return;

    try {
      await apiClient.recordCenterAction({
        centerId: currentCenter.id,
        actionType: 'collection',
        amount: amt,
        notes: 'केंद्रावरील रोख/डिजिटल वर्गणी पावती'
      });

      setRecentLogs(prev => [
        { time: new Date().toLocaleTimeString(), text: `💰 वर्गणी जमा: ₹${amt.toLocaleString()} पावती क्रमांक CM-${Date.now().toString().slice(-4)}` },
        ...prev.slice(0, 9)
      ]);

      showToast(`💰 ₹${amt.toLocaleString()} ची वर्गणी केंद्राच्या लेजरमध्ये यशस्वीरीत्या जमा झाली!`);
      setCollectionAmount('');
      loadCenters();
    } catch (err) {
      showToast('त्रुटी: वर्गणी नोंदवता आली नाही.');
    }
  };

  return (
    <div style={{ background: '#FFFDF9', minHeight: '100vh', padding: '32px 16px 80px', color: '#1C1917', fontFamily: 'system-ui, sans-serif' }}>
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
          background: 'linear-gradient(135deg, #14532D 0%, #16A34A 60%, #22C55E 100%)',
          borderRadius: '20px',
          padding: '30px 26px',
          color: '#FFF',
          boxShadow: '0 12px 32px rgba(22,163,74,0.25)',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '8px' }}>
              🏢 PHYSICAL COMMUNITY CENTER OPERATING CRM
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, margin: '4px 0 8px' }}>
              {currentCenter.name}
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
              📍 {currentCenter.district} — {currentCenter.taluka} | भागीदार: <strong>{currentCenter.partnerName}</strong> ({currentCenter.investmentTier})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(e.target.value)}
              style={{
                background: '#FFF',
                color: '#14532D',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {centers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
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
              📍 तालुका CRM →
            </Link>
          </div>
        </div>

        {/* 4 Center Counters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700 }}>आजचे प्रत्यक्ष अभ्यागत (Visitors)</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#16A34A', marginTop: '4px' }}>
              {currentCenter.todayVisitors || 34}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 700, marginTop: '4px' }}>
              👥 प्रत्यक्ष काउंटरवर भेट दिली
            </div>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #BBF7D0' }}>
            <div style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 700 }}>आजची प्रत्यक्ष जमा (Daily Collection)</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#15803D', marginTop: '4px' }}>
              ₹{(currentCenter.dailyCollection || 14500).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#65A30D', fontWeight: 700, marginTop: '4px' }}>
              💰 वर्गणी व डिजिटल पावत्या
            </div>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #FED7AA' }}>
            <div style={{ fontSize: '0.85rem', color: '#9A3412', fontWeight: 700 }}>प्रलंबित ओळखपत्र छाननी (KYC)</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#EA580C', marginTop: '4px' }}>
              {currentCenter.kycPending || 12}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#EA580C', fontWeight: 700, marginTop: '4px' }}>
              🪪 केंद्रावर कागदपत्र सादर
            </div>
          </div>

          <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: '0.85rem', color: '#1E3A8A', fontWeight: 700 }}>केंद्राशी जोडलेले सदस्य</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#2563EB', marginTop: '4px' }}>
              {(currentCenter.activeMembers || 2400).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700, marginTop: '4px' }}>
              ✓ सक्रिय सभासद परिवार
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #E2E8F0', marginBottom: '24px' }}>
          {[
            { id: 'desk', label: '🧑‍💼 काउंटर व अभ्यागत नोंदणी (Front Desk)' },
            { id: 'services', label: '🛠️ १२ सेवा कक्ष (Center Desks)' },
            { id: 'collection', label: '💰 दैनिक वर्गणी नोंद (Cash / Ledger)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '12px 18px',
                fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? '#16A34A' : '#64748B',
                borderBottom: activeTab === tab.id ? '3px solid #16A34A' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Front Desk */}
        {activeTab === 'desk' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {/* Quick Checkin Form */}
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px', color: '#166534', fontSize: '1.15rem', fontWeight: 800 }}>
                + नवीन अभ्यागत नोंदणी (Walk-in Entry)
              </h3>
              <form onSubmit={handleCheckinVisitor}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>अभ्यागताचे पूर्ण नाव</label>
                  <input
                    type="text"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="उदा. राहुल संभाजी कदम"
                    required
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>मोबाईल नंबर</label>
                  <input
                    type="tel"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    placeholder="९८२२०XXXXX"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>भेटीचा हेतू (Purpose)</label>
                  <select
                    value={visitorPurpose}
                    onChange={(e) => setVisitorPurpose(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
                  >
                    <option value="सदस्य नोंदणी व KYC">सदस्य नोंदणी व KYC</option>
                    <option value="व्यवसाय व B2B मार्गदर्शन">व्यवसाय व B2B मार्गदर्शन</option>
                    <option value="शिक्षण व करिअर समुपदेशन">शिक्षण व करिअर समुपदेशन</option>
                    <option value="कायदेशीर / आर्थिक साहाय्य">कायदेशीर / आर्थिक साहाय्य</option>
                    <option value="आपत्कालीन सेवा मदत">आपत्कालीन सेवा मदत</option>
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: '#16A34A',
                    color: '#FFF',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  ✓ अभ्यागताची केंद्रावर नोंद करा
                </button>
              </form>
            </div>

            {/* Live Desk Feed */}
            <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px', color: '#166534', fontSize: '1.15rem', fontWeight: 800 }}>
                📋 आजच्या प्रत्यक्ष नोंदी (Live Center Log)
              </h3>
              {recentLogs.length === 0 ? (
                <div style={{ color: '#64748B', fontSize: '0.9rem', textAlign: 'center', padding: '30px' }}>
                  आजच्या ताज्या नोंदी येथे थेट दिसतील...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentLogs.map((log, idx) => (
                    <div key={idx} style={{ padding: '10px 14px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                      <span style={{ color: '#64748B', marginRight: '8px' }}>[{log.time}]</span>
                      <strong>{log.text}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: 12 Key Services Desks */}
        {activeTab === 'services' && (
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#166534', fontSize: '1.2rem', fontWeight: 800 }}>
              🏢 कम्युनिटी सेंटरमधील १२ मुख्य सेवा कक्ष (Service Desks)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {[
                { title: '👥 सदस्य नोंदणी व KYC', desc: 'नवीन सदस्य पडताळणी व डिजिटल ओळखपत्र वाटप', count: '14 आजच्या विनंत्या' },
                { title: '💼 व्यवसाय साहाय्य कक्ष', desc: 'B2B नोंदणी, उद्योग कॅटलॉग व व्यापारी जोडणी', count: '8 चालू केसेस' },
                { title: '🤝 नेटवर्किंग व बैठका कक्ष', desc: 'साप्ताहिक संगम, चॅप्टर हॉल व 1-to-1 बैठका', count: 'हॉल उपलब्ध' },
                { title: '🎓 शिक्षण व करिअर मार्गदर्शन', desc: 'विद्यार्थी शिष्यवृत्ती, समुपदेशन व भरती', count: '12 नोंदणी' },
                { title: '⚖️ कायदेशीर सल्ला कक्ष', desc: 'वकील पॅनेल, दस्तऐवज व कायदेविषयक मार्गदर्शन', count: 'सक्रिय' },
                { title: '💰 वित्त व कर्ज साहाय्यता कक्ष', desc: 'MSME, मुद्रा व बँकिंग कर्ज मार्गदर्शन', count: 'सक्रिय' },
                { title: '🧑‍🏫 कौशल्य व प्रशिक्षण कक्ष', desc: 'युवा उद्योजकता कार्यशाळा व मार्गदर्शन', count: '३ बॅचेस' },
                { title: '📣 सोशल मीडिया व प्रसिद्धी', desc: 'स्थानिक व्यवसाय जाहिरात व ब्रँडिंग सपोर्ट', count: 'सक्रिय' },
                { title: '👨‍💼 व्यावसायिक सूची (Directory)', desc: 'डॉक्टर, सीए, अभियंते थेट जोडणी', count: '४५ प्रोफाइल्स' },
                { title: '🎭 सांस्कृतिक व सामाजिक उपक्रम', desc: 'किल्ले मोहिमा, व्याख्याने व उत्सव समन्वय', count: '२ नियोजन' },
                { title: '🎧 अ‍ॅप सपोर्ट व हेल्पडेस्क', desc: 'मोबाईल अ‍ॅप तांत्रिक अडचण निवारण', count: '० तक्रारी' },
                { title: '🩸 आपत्कालीन सेवा कक्ष', desc: '२४x७ रक्त मदत व रुग्णालय साहाय्यता', count: '२ विनंत्या' }
              ].map((s, idx) => (
                <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', background: '#F8FAFC' }}>
                  <div style={{ fontWeight: 800, color: '#14532D', fontSize: '1rem' }}>{s.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 8px' }}>{s.desc}</div>
                  <span style={{ fontSize: '0.8rem', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>
                    {s.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Collection Log */}
        {activeTab === 'collection' && (
          <div style={{ background: '#FFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', maxWidth: '600px' }}>
            <h3 style={{ margin: '0 0 16px', color: '#166534', fontSize: '1.2rem', fontWeight: 800 }}>
              💰 दैनिक वर्गणी व पावती नोंदणी (Daily Collection)
            </h3>
            <form onSubmit={handleRecordCollection}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>जमा रक्कम (INR)</label>
                <input
                  type="number"
                  value={collectionAmount}
                  onChange={(e) => setCollectionAmount(e.target.value)}
                  placeholder="उदा. 500 किंवा 1500"
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '1.1rem', fontWeight: 800 }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: '#16A34A',
                  color: '#FFF',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                + केंद्राच्या खात्यात जमा करा
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
