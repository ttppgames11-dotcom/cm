import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// 4 Distinct & Authentic Campaigns
const DEFAULT_CAMPAIGNS = [
  {
    id: 'CAMP-01',
    cat: 'fort',
    category: 'दुर्ग संवर्धन',
    title: 'छत्रपती शिवाजी महाराज स्मारक व ऐतिहासिक दुर्ग संवर्धन निधी',
    target: 2500000,
    targetAmount: 2500000,
    collected: 1845000,
    raisedAmount: 1845000,
    donors: 684,
    donorsCount: 684,
    cover: '/assets/images/real-raigad-panoramic.jpg',
    icon: '🏰',
    image: '🏰',
    desc: 'सह्याद्रीतील दुर्लक्षित गडकिल्ल्यांच्या तटबंदी दुरुस्ती, स्वच्छता, सुरक्षा कठडे व माहिती फलक उभारणीसाठी थेट निधी.',
    description: 'सह्याद्रीतील दुर्लक्षित गडकिल्ल्यांच्या तटबंदी दुरुस्ती, स्वच्छता, सुरक्षा कठडे व माहिती फलक उभारणीसाठी थेट निधी.'
  },
  {
    id: 'CAMP-02',
    cat: 'education',
    category: 'शिक्षण सहाय्य',
    title: 'मराठा शेतकरी पाल्यांसाठी उच्च शिक्षण शिष्यवृत्ती निधी',
    target: 5000000,
    targetAmount: 5000000,
    collected: 3750000,
    raisedAmount: 3750000,
    donors: 1240,
    donorsCount: 1240,
    cover: '/assets/images/library.jpg',
    icon: '🎓',
    image: '🎓',
    desc: 'अल्पभूधारक शेतकरी व गरजू मराठा विद्यार्थ्यांच्या इंजिनिअरिंग, मेडिकल व UPSC/MPSC शिक्षणासाठी आर्थिक सहाय्य.',
    description: 'अल्पभूधारक शेतकरी व गरजू मराठा विद्यार्थ्यांच्या इंजिनिअरिंग, मेडिकल व UPSC/MPSC शिक्षणासाठी आर्थिक सहाय्य.'
  },
  {
    id: 'CAMP-03',
    cat: 'farmer',
    category: 'शेतकरी मदत',
    title: 'आपत्तीग्रस्त मराठा शेतकरी कुटुंबे मदत व पुनर्वसन निधी',
    target: 2000000,
    targetAmount: 2000000,
    collected: 1480000,
    raisedAmount: 1480000,
    donors: 589,
    donorsCount: 589,
    cover: '/assets/images/real-farmer-field.jpg',
    icon: '🌾',
    image: '🌾',
    desc: 'अतिवृष्टी, गारपीट व दुष्काळग्रस्त शेतकरी कुटुंबांना तात्काळ आर्थिक मदत, बियाणे व कृषी पुनर्वसन साहाय्य.',
    description: 'अतिवृष्टी, गारपीट व दुष्काळग्रस्त शेतकरी कुटुंबांना तात्काळ आर्थिक मदत, बियाणे व कृषी पुनर्वसन साहाय्य.'
  },
  {
    id: 'CAMP-04',
    cat: 'health',
    category: 'आरोग्य व रक्तदान',
    title: 'मराठा आरोग्य कवच व मोफत वैद्यकीय/रक्तदान सहाय्यता निधी',
    target: 1500000,
    targetAmount: 1500000,
    collected: 980000,
    raisedAmount: 980000,
    donors: 432,
    donorsCount: 432,
    cover: '/assets/images/generated/maratha_blood_help_hero.jpg',
    icon: '🩸',
    image: '🩸',
    desc: 'दुर्धर आजारग्रस्त मराठा बांधवांना औषधोपचार, मोफत शस्त्रक्रिया साहाय्य व २४x७ राज्यव्यापी आपत्कालीन रक्तदान सेवा शिबिरे.',
    description: 'दुर्धर आजारग्रस्त मराठा बांधवांना औषधोपचार, मोफत शस्त्रक्रिया साहाय्य व २४x७ राज्यव्यापी आपत्कालीन रक्तदान सेवा शिबिरे.'
  }
];

const DEFAULT_RECENT_DONATIONS = [
  { donor_name: 'संभाजीराव मोहिते', amount: 51000, campaign_title: 'दुर्ग संवर्धन निधी', is_anonymous: false },
  { donor_name: 'विक्रमसिंह कदम', amount: 25000, campaign_title: 'उच्च शिक्षण शिष्यवृत्ती निधी', is_anonymous: false },
  { donor_name: 'सौ. सुजाता घोरपडे', amount: 11000, campaign_title: 'दुर्ग संवर्धन निधी', is_anonymous: false },
  { donor_name: 'गुप्त दान', amount: 100000, campaign_title: 'आपत्तीग्रस्त शेतकरी मदत निधी', is_anonymous: true },
  { donor_name: 'डॉ. अमित भोसले', amount: 15000, campaign_title: 'आरोग्य व रक्तदान निधी', is_anonymous: false }
];

const CAMPAIGN_COVERS_MAP = {
  'CAMP-01': '/assets/images/real-raigad-panoramic.jpg',
  'C01': '/assets/images/real-raigad-panoramic.jpg',
  'fort': '/assets/images/real-raigad-panoramic.jpg',
  'दुर्ग संवर्धन': '/assets/images/real-raigad-panoramic.jpg',

  'CAMP-02': '/assets/images/library.jpg',
  'C02': '/assets/images/library.jpg',
  'education': '/assets/images/library.jpg',
  'edu': '/assets/images/library.jpg',
  'शिक्षण सहाय्य': '/assets/images/library.jpg',
  'शिक्षण': '/assets/images/library.jpg',

  'CAMP-03': '/assets/images/real-farmer-field.jpg',
  'C03': '/assets/images/real-farmer-field.jpg',
  'farmer': '/assets/images/real-farmer-field.jpg',
  'आपत्ती निवारण': '/assets/images/real-farmer-field.jpg',
  'शेतकरी मदत': '/assets/images/real-farmer-field.jpg',
  'शेतकरी साहाय्य': '/assets/images/real-farmer-field.jpg',

  'CAMP-04': '/assets/images/generated/maratha_blood_help_hero.jpg',
  'C04': '/assets/images/generated/maratha_blood_help_hero.jpg',
  'health': '/assets/images/generated/maratha_blood_help_hero.jpg',
  'आरोग्य व रक्तदान': '/assets/images/generated/maratha_blood_help_hero.jpg',
  'रक्तदान': '/assets/images/generated/maratha_blood_help_hero.jpg',
  'आरोग्य': '/assets/images/generated/maratha_blood_help_hero.jpg'
};

const FOUR_DISTINCT_COVERS = [
  '/assets/images/real-raigad-panoramic.jpg',
  '/assets/images/library.jpg',
  '/assets/images/real-farmer-field.jpg',
  '/assets/images/generated/maratha_blood_help_hero.jpg'
];

export default function DonationsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState(DEFAULT_CAMPAIGNS);
  const [recentDonations, setRecentDonations] = useState(DEFAULT_RECENT_DONATIONS);
  const [loading, setLoading] = useState(true);

  // Donation Modal State
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [customAmount, setCustomAmount] = useState('1000');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [donorName, setDonorName] = useState(user?.name || '');
  const [donorPhone, setDonorPhone] = useState(user?.phone || '');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [donating, setDonating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [campRes, recRes] = await Promise.all([
        api.donations.getCampaigns().catch(() => null),
        api.donations.getRecent().catch(() => null)
      ]);

      const fetchedCampaigns = campRes?.campaigns || campRes?.data?.campaigns;
      if (fetchedCampaigns && Array.isArray(fetchedCampaigns) && fetchedCampaigns.length > 0) {
        if (fetchedCampaigns.length === 3 && !fetchedCampaigns.find(c => c.id === 'CAMP-04')) {
          setCampaigns([...fetchedCampaigns, DEFAULT_CAMPAIGNS[3]]);
        } else {
          setCampaigns(fetchedCampaigns);
        }
      } else {
        setCampaigns(DEFAULT_CAMPAIGNS);
      }

      const fetchedRecent = recRes?.donations || recRes?.recentDonations || recRes?.data?.recentDonations;
      if (fetchedRecent && Array.isArray(fetchedRecent) && fetchedRecent.length > 0) {
        setRecentDonations(fetchedRecent.map(d => ({
          donor_name: d.donor_name || d.donorName || (d.anonymous || d.is_anonymous ? 'गुप्त दान' : 'मराठा समाजबांधव'),
          amount: d.amount,
          campaign_title: d.campaign_title || d.campaignTitle || 'समाज निधी',
          is_anonymous: d.is_anonymous || d.anonymous || false
        })));
      } else {
        setRecentDonations(DEFAULT_RECENT_DONATIONS);
      }
    } catch (err) {
      console.error('Error fetching donations data:', err);
      setCampaigns(DEFAULT_CAMPAIGNS);
      setRecentDonations(DEFAULT_RECENT_DONATIONS);
    } finally {
      setLoading(false);
    }
  };

  const getCampaignCover = (c, index) => {
    // If cover is provided and is not the default raigad (unless it's truly fort)
    if (c.cover) {
      if (c.cover !== '/assets/images/real-raigad-panoramic.jpg' || c.cat === 'fort' || c.id === 'CAMP-01' || c.id === 'C01') {
        return c.cover;
      }
    }
    if (c.id && CAMPAIGN_COVERS_MAP[c.id]) return CAMPAIGN_COVERS_MAP[c.id];
    if (c.cat && CAMPAIGN_COVERS_MAP[c.cat]) return CAMPAIGN_COVERS_MAP[c.cat];
    if (c.category && CAMPAIGN_COVERS_MAP[c.category]) return CAMPAIGN_COVERS_MAP[c.category];
    return FOUR_DISTINCT_COVERS[index % FOUR_DISTINCT_COVERS.length];
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    if (!customAmount || parseFloat(customAmount) <= 0) {
      alert('कृपया वैध रक्कम प्रविष्ट करा.');
      return;
    }

    setDonating(true);
    try {
      const res = await api.donations.donate({
        campaign_id: activeCampaign?.id || 'CAMP-01',
        campaign_title: activeCampaign?.title || 'छत्रपती शिवाजी महाराज स्मारक व ऐतिहासिक दुर्ग संवर्धन निधी',
        donor_name: donorName,
        donor_id: user?.id || 'M1001',
        amount: customAmount,
        payment_method: paymentMethod,
        phone: donorPhone,
        is_anonymous: isAnonymous
      });

      if (res) {
        const receiptData = res.receipt || {
          receiptNumber: res.data?.receiptNo || `80G-${Date.now().toString().slice(-6)}`,
          txId: res.data?.donation?.id || `TXN-${Date.now()}`,
          donor_name: donorName || 'मराठा समाजबांधव',
          campaign_title: activeCampaign?.title || 'समाज संवर्धन निधी',
          amount: customAmount,
          date: new Date().toLocaleDateString('mr-IN'),
          taxDeduction80G: 'आयकर कलम 80G अंतर्गत १००% कर सवलत प्रमाणपत्र पात्र'
        };
        setReceipt(receiptData);
        loadData();
      }
    } catch (err) {
      alert('देणगी प्रक्रिया करताना त्रुटी: ' + err.message);
    } finally {
      setDonating(false);
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
              🚩 शिवकार्य व समाज साहाय्यता निधी
            </span>
            <h1 style={{ fontSize: '2.2rem', margin: '10px 0 6px', fontFamily: 'Baloo 2' }}>
              Connect Maratha समाज संवर्धन व साहाय्यता निधी (Donations)
            </h1>
            <p style={{ margin: 0, opacity: 0.92, fontSize: '1.05rem', maxWidth: '65ch' }}>
              दुर्ग संवर्धन, गुणवंत विद्यार्थ्यांची शिष्यवृत्ती, दुष्काळग्रस्त शेतकरी साहाय्य आणि मोफत आरोग्य सेवेसाठी थेट पारदर्शक योगदान द्या. आयकर कलम 80G अंतर्गत १००% सवलत पात्र.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>१००% पारदर्शक</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>80G कर सवलत पावती उपलब्ध</div>
          </div>
        </div>

        {/* 2-Column: Active Campaigns + Recent Donors Wall */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', alignItems: 'start' }}>
          
          {/* Active Campaigns */}
          <div>
            <h2 style={{ fontSize: '1.5rem', color: '#C73800', margin: '0 0 16px', fontFamily: 'Baloo 2' }}>
              🚩 सक्रिय संवर्धन व समाज अभियाने (४ मुख्य विभाग)
            </h2>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                अभियान माहिती लोड होत आहे... ⏳
              </div>
            ) : (
              campaigns.map((c, idx) => {
                const target = c.target || c.targetAmount || 1000000;
                const collected = c.collected || c.raisedAmount || 0;
                const percent = Math.min(100, Math.round((collected / target) * 100));
                const coverImg = getCampaignCover(c, idx);
                const categoryBadge = c.category || (c.cat === 'fort' ? 'दुर्ग संवर्धन' : c.cat === 'education' || c.cat === 'edu' ? 'शिक्षण सहाय्य' : c.cat === 'farmer' ? 'शेतकरी मदत' : c.cat === 'health' ? 'आरोग्य व रक्तदान' : 'समाज साहाय्यता');
                const icon = c.icon || c.image || (idx === 0 ? '🏰' : idx === 1 ? '🎓' : idx === 2 ? '🌾' : '🩸');
                const desc = c.desc || c.description || '';
                const donors = c.donors || c.donorsCount || 0;

                return (
                  <div
                    key={c.id || idx}
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid #E5E7EB',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                      marginBottom: '24px'
                    }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr' }}>
                      <div style={{ height: '100%', minHeight: '200px', position: 'relative', overflow: 'hidden', background: '#F3F4F6' }}>
                        <img
                          src={coverImg}
                          alt={c.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FOUR_DISTINCT_COVERS[idx % FOUR_DISTINCT_COVERS.length];
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          background: 'rgba(0,0,0,0.75)',
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          backdropFilter: 'blur(4px)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <span>{icon}</span> {categoryBadge}
                        </div>
                      </div>

                      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', margin: '0 0 8px', color: '#1F2937', fontWeight: 700, lineHeight: 1.4 }}>
                            {c.title}
                          </h3>
                          <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, margin: '0 0 16px' }}>
                            {desc}
                          </p>

                          {/* Progress Bar */}
                          <div style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                              <span style={{ color: '#C73800' }}>संकलित: ₹{Number(collected).toLocaleString('en-IN')}</span>
                              <span style={{ color: '#6B7280' }}>ध्येय: ₹{Number(target).toLocaleString('en-IN')} ({percent}%)</span>
                            </div>
                            <div style={{ background: '#F3F4F6', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                              <div style={{ background: 'linear-gradient(90deg, #F4511E, #2E7D32)', height: '100%', width: `${percent}%` }} />
                            </div>
                          </div>

                          <div style={{ fontSize: '0.82rem', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            👥 <span>{Number(donors).toLocaleString('en-IN')} समाज बांधवांनी योगदान दिले</span>
                          </div>
                        </div>

                        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => { setActiveCampaign(c); setReceipt(null); }}
                            className="btn btn-primary"
                            style={{ background: '#C73800', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            देणगी द्या (Donate Now) 🚩
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Recent Donors Wall & 80G Tax Exemption Info */}
          <div>
            <div style={{ background: '#fff', borderRadius: '14px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px', color: '#C73800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📜</span> नुकतेच दिलेले योगदान
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentDonations.length > 0 ? (
                  recentDonations.map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #F3F4F6' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2937' }}>
                          {d.is_anonymous ? 'गुप्त दान' : d.donor_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                          {d.campaign_title}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: '#2E7D32', fontSize: '0.95rem' }}>
                        +₹{Number(d.amount).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#888', fontSize: '0.85rem' }}>अजून देणग्या लोड होत आहेत...</div>
                )}
              </div>
            </div>

            {/* 80G Tax Exemption Card */}
            <div style={{ background: '#F0FDF4', borderRadius: '14px', padding: '20px', border: '1px solid #BBF7D0' }}>
              <div style={{ fontWeight: 800, color: '#166534', marginBottom: '8px', fontSize: '1rem' }}>
                🛡️ आयकर कलम 80G सवलत
              </div>
              <p style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5, margin: 0 }}>
                Connect Maratha ला दिलेल्या सर्व देणग्यांवर आयकर कायदा १९६१ च्या कलम 80G(5)(vi) अंतर्गत ५०% कर सवलत मिळते. देणगी दिल्यानंतर तात्काळ अधिकृत डिजिटल पावती प्राप्त होते.
              </p>
            </div>
          </div>

        </div>

        {/* Modal: Make Donation */}
        {activeCampaign && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: '#fff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              
              {receipt ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🚩</div>
                  <h2 style={{ color: '#2E7D32', margin: '0 0 8px', fontSize: '1.5rem' }}>
                    देणगी यशस्वीरित्या स्वीकारली!
                  </h2>
                  <p style={{ color: '#555', fontSize: '0.95rem', margin: '0 0 18px' }}>
                    शिवकार्यासाठी आणि समाज विकासासाठी केलेल्या योगदानाबद्दल मनःपूर्वक धन्यवाद.
                  </p>

                  {/* Receipt Preview */}
                  <div style={{ background: '#FFF8F2', border: '2px dashed #C73800', borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '20px' }}>
                    <div style={{ textAlign: 'center', fontWeight: 800, color: '#C73800', fontSize: '1.1rem', marginBottom: '12px' }}>
                      Connect Maratha — अधिकृत पावती
                    </div>
                    <div style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
                      <div><strong>पावती क्र.:</strong> {receipt.receiptNumber}</div>
                      <div><strong>व्यवहार आयडी (TxID):</strong> {receipt.txId}</div>
                      <div><strong>दाता:</strong> {receipt.donor_name}</div>
                      <div><strong>अभियान:</strong> {receipt.campaign_title}</div>
                      <div><strong>रक्कम:</strong> <span style={{ fontSize: '1.2rem', color: '#2E7D32', fontWeight: 800 }}>₹{Number(receipt.amount).toLocaleString('en-IN')}</span></div>
                      <div><strong>तारीख:</strong> {receipt.date}</div>
                      <div style={{ color: '#C73800', fontWeight: 700, marginTop: '6px' }}>✔ {receipt.taxDeduction80G}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setActiveCampaign(null); setReceipt(null); }}
                    style={{ background: '#C73800', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                    पूर्ण झाले (Done)
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: '#C73800', fontSize: '1.3rem' }}>
                      🚩 {activeCampaign.title}
                    </h3>
                    <button onClick={() => setActiveCampaign(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
                  </div>

                  <form onSubmit={handleDonateSubmit}>
                    {/* Quick Presets */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>रक्कम निवडा (₹):</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '10px' }}>
                        {['५००', '१०००', '२५००', '५०००'].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setCustomAmount(amt.replace(/[^\d]/g, ''))}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              border: customAmount === amt.replace(/[^\d]/g, '') ? '2px solid #C73800' : '1px solid #D1D5DB',
                              background: customAmount === amt.replace(/[^\d]/g, '') ? '#FFF3E0' : '#F9FAFB',
                              fontWeight: 700,
                              color: customAmount === amt.replace(/[^\d]/g, '') ? '#C73800' : '#333',
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
                        placeholder="इतर रक्कम प्रविष्ट करा..."
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '1rem', fontWeight: 700 }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>आपले नाव</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="उदा. अमोल जाधव"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>मोबाईल नंबर (80G पावती SMS साठी)</label>
                      <input
                        type="tel"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        placeholder="9876500000"
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>देयकाची पद्धत (Payment Method):</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB', background: '#fff' }}>
                        <option value="UPI">UPI (Google Pay / PhonePe / Paytm / BHIM)</option>
                        <option value="NetBanking">नेट बँकिंग (सर्व प्रमुख बँका)</option>
                        <option value="Card">डेबिट / क्रेडिट कार्ड</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="anonCheck"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <label htmlFor="anonCheck" style={{ fontSize: '0.85rem', color: '#555', cursor: 'pointer' }}>
                        सार्वजनिक यादीमध्ये माझे नाव गुप्त ठेवा (Anonymous Donation)
                      </label>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setActiveCampaign(null)} style={{ background: '#F3F4F6', border: 'none', padding: '10px 18px', borderRadius: '6px' }}>रद्द</button>
                      <button
                        type="submit"
                        disabled={donating}
                        style={{ background: '#C73800', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
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
