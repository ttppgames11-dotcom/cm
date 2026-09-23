import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SOURCE_TIERS, CONFIDENCE_LEVELS } from '../../data/heritageKnowledgeGraph';

const INITIAL_COMMUNITY_STORIES = [
  {
    id: 'comm_1',
    title: 'किल्ले वासोटा परिसरातील चकवा आख्यायिका व गुराख्यांची लोककथा',
    author: 'आनंदराव मोरे (जावळी, सातारा)',
    village: 'बामणोली / वासोटा पायथा',
    category: 'स्थानिक लोककथा / आख्यायिका',
    submissionDate: '१४ ऑगस्ट २०२६',
    narrative: 'माझ्या पणजोबांच्या सांगण्यानुसार, वासोटा किल्ल्याच्या घनदाट जंगलात रात्रीच्या वेळी चकवा पडायचा. त्या वेळी गावातील वयस्कर लोक झाडांच्या पानांकडे पाहून दिशा ठरवत असत. कोयना खोऱ्यातील शिवकालीन मावळ्यांच्या शौर्याच्या अनेक मौखिक गोष्टी आमच्या भागात आजही शेकोटीभोवती सांगितल्या जातात.',
    sourceType: 'आजोबांकडून ऐकलेली मौखिक परंपरा',
    confidence: CONFIDENCE_LEVELS.COMMUNITY,
    tier: SOURCE_TIERS.TIER_4,
    status: 'समीक्षित (Reviewed by Editorial Team)'
  },
  {
    id: 'comm_2',
    title: 'आंगणेवाडी भराडीदेवी मंदिराच्या जत्रेतील कौल लावण्याची १५० वर्षांची परंपरा',
    author: 'सुधाकर आंगणे (मालवण)',
    village: 'आंगणेवाडी, जि. सिंधुदुर्ग',
    category: 'स्थानिक श्रद्धा व परंपरा',
    submissionDate: '२ फेब्रुवारी २०२६',
    narrative: 'आमच्या गावात भराडीदेवीच्या जत्रेची तारीख पंचांग पाहून ठरत नाही, तर आंगणे कुटुंबीय एकत्र येऊन देवीचा कौल घेतात. कौल मिळाल्यावरच अवघ्या दीड दिवसांची जत्रा जाहीर होते. ही प्रथा आमच्या दप्तरात १८७० सालापासून नोंदवलेली आढळते.',
    sourceType: 'कौटुंबिक हस्तलिखित नोंदवही व प्रत्यक्ष परंपरा',
    confidence: CONFIDENCE_LEVELS.TRADITIONAL,
    tier: SOURCE_TIERS.TIER_4,
    status: 'समीक्षित (Verified Tradition)'
  },
  {
    id: 'comm_3',
    title: 'विदर्भातील पोळा सणात बैलांच्या झुलवर काढली जाणारी पारंपरिक चित्रे',
    author: 'गणेशराव देशमुख (अमरावती)',
    village: 'चांदूर बाजार, जि. अमरावती',
    category: 'लोककला व शेती संस्कृती',
    submissionDate: '२० सप्टेंबर २०२५',
    narrative: 'वऱ्हाडात पोळ्याच्या दिवशी सर्जा-राजाच्या अंगावर हिंगूळ आणि नीळ वापरून मारुती, मोर व सूर्यफुलांची चित्रे हाताने रंगवली जातात. याला ‘तोरण बांधणे’ म्हणतात. ही कला आता हळूहळू लोप पावत आहे, म्हणून त्याचे दस्तऐवजीकरण येथे करत आहे.',
    sourceType: 'स्थानिक शेतकरी कुटुंबातील प्रत्यक्ष अनुभव',
    confidence: CONFIDENCE_LEVELS.COMMUNITY,
    tier: SOURCE_TIERS.TIER_4,
    status: 'समीक्षित'
  }
];

export default function CommunityOralHistoryPage() {
  const [stories, setStories] = useState(INITIAL_COMMUNITY_STORIES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    village: '',
    category: 'स्थानिक लोककथा / आख्यायिका',
    sourceType: 'आजोबांकडून ऐकलेली मौखिक परंपरा',
    narrative: '',
    agreedToTier4: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.narrative || !formData.author) {
      alert('कृपया सर्व आवश्यक माहिती भरा.');
      return;
    }

    const newStory = {
      id: `comm_${Date.now()}`,
      title: formData.title,
      author: formData.author,
      village: formData.village || 'महाराष्ट्र',
      category: formData.category,
      submissionDate: 'आज',
      narrative: formData.narrative,
      sourceType: formData.sourceType,
      confidence: CONFIDENCE_LEVELS.COMMUNITY,
      tier: SOURCE_TIERS.TIER_4,
      status: 'संपादकीय पुनरावलोकनाधीन (Under Review)'
    };

    setStories([newStory, ...stories]);
    setShowSuccessModal(true);
    setFormData({
      title: '',
      author: '',
      village: '',
      category: 'स्थानिक लोककथा / आख्यायिका',
      sourceType: 'आजोबांकडून ऐकलेली मौखिक परंपरा',
      narrative: '',
      agreedToTier4: false
    });
    setIsSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FDFBF7' }}>
      
      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #7C1D05 0%, #B91C1C 60%, #E65100 100%)',
        color: '#FFFFFF',
        padding: '48px 20px 36px',
        borderBottom: '4px solid #F59E0B'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.85rem', marginBottom: '14px' }}>
            <span>📜 CONNECT MARATHA</span>
            <span>•</span>
            <span>समुदाय मौखिक इतिहास व लोककथा दालन</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
            मौखिक इतिहास व गाव आख्यायिका संकलन
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '850px', opacity: 0.95, lineHeight: 1.6, marginBottom: '20px' }}>
            आपल्या गावाचा, घराण्याचा किंवा परिसराचा अलिखित इतिहास, जुन्या पिढीकडून ऐकलेल्या गोष्टी व लोकपरंपरा जतन करा. 
            येथे प्रत्येक नोंदीला अधिकृतपणे <strong>'Tier 4: मौखिक परंपरा / लोकसमज'</strong> चा पारदर्शक दर्जा दिला जातो.
          </p>

          <button
            onClick={() => setIsSubmitting(!isSubmitting)}
            style={{
              background: '#F59E0B',
              color: '#78350F',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}
          >
            {isSubmitting ? '✕ फॉर्म बंद करा' : '✍️ आपली कथा / मौखिक नोंद पाठवा'}
          </button>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px' }}>

        {/* Success Modal */}
        {showSuccessModal && (
          <div style={{
            background: '#ECFDF5',
            border: '2px solid #10B981',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 800, color: '#065F46', fontSize: '1.1rem' }}>
                🎉 आपली मौखिक नोंद यशस्वीरीत्या नोंदवली गेली आहे!
              </div>
              <div style={{ color: '#047857', fontSize: '0.9rem', marginTop: '4px' }}>
                ही नोंद पारदर्शकतेसाठी 🟣 Tier 4 (समुदाय योगदान) म्हणून प्रकाशित केली आहे. इतिहास अभ्यासक याच्या पुराव्यांची तपासणी करतील.
              </div>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{ background: '#10B981', color: '#FFFFFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              समजले
            </button>
          </div>
        )}

        {/* Submission Form (Toggleable) */}
        {isSubmitting && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '2px solid #F59E0B',
            padding: '32px',
            marginBottom: '40px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '1.5rem', color: '#7C1D05', fontWeight: 800, marginBottom: '6px' }}>
              ✍️ मौखिक इतिहास / स्थानिक आख्यायिका नोंदवा
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '20px' }}>
              कृपया शक्य तितकी खरी व वडिलोपार्जित माहिती नोंदवा. कनेक्ट मराठा ऐतिहासिक सत्यता व लोकपरंपरा यातील फरक स्पष्ट राखते.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    शीर्षक / कथेचे नाव *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="उदा. आमच्या गावातील शिवकालीन विहीर व आख्यायिका"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    आपले नाव व संपर्क *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="उदा. राहुल पाटील, पुणे"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    गाव / तालुका / जिल्हा
                  </label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="उदा. किल्ले रोहिडा पायथा, भोर, पुणे"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    नोंदीचा प्रकार
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                  >
                    <option value="स्थानिक लोककथा / आख्यायिका">स्थानिक लोककथा / आख्यायिका</option>
                    <option value="कौटुंबिक बखर / दस्तऐवज">कौटुंबिक बखर / जुना दस्तऐवज</option>
                    <option value="ग्रामदैवत पूजा परंपरा">ग्रामदैवत पूजा व यात्रा परंपरा</option>
                    <option value="लोककला व पारंपरिक खेळ">लोककला, लोकगीत किंवा पारंपरिक खेळ</option>
                    <option value="स्वातंत्र्य लढा आठवणी">स्वातंत्र्य लढा / संयुक्त महाराष्ट्र आठवणी</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  माहितीचा मूळ स्रोत (Source Type)
                </label>
                <input
                  type="text"
                  value={formData.sourceType}
                  onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                  placeholder="उदा. आजोबांकडून ऐकलेली कथा, गावचा जुना शिलालेख, मोडी लिपीतील कागद..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  सविस्तर हकीकत / माहिती (Narrative) *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.narrative}
                  onChange={(e) => setFormData({ ...formData, narrative: e.target.value })}
                  placeholder="आपल्याला माहिती असलेली संपूर्ण हकीकत येथे सविस्तर लिहा..."
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ background: '#FAF5FF', padding: '14px', borderRadius: '10px', border: '1px solid #F3E8FF', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <input
                  type="checkbox"
                  required
                  id="tier4_ack"
                  checked={formData.agreedToTier4}
                  onChange={(e) => setFormData({ ...formData, agreedToTier4: e.target.checked })}
                  style={{ marginTop: '3px' }}
                />
                <label htmlFor="tier4_ack" style={{ fontSize: '0.85rem', color: '#581C87', lineHeight: 1.5 }}>
                  <strong>मी मान्य करतो/करते:</strong> ही नोंद कनेक्ट मराठाच्या 'Tier 4: मौखिक परंपरा / समुदाय ज्ञान' अंतर्गत नोंदवली जाईल. 
                  शासकीय किंवा शैक्षणिक पुरावे उपलब्ध होईपर्यंत याला प्रमाणित इतिहास मानले जाणार नाही.
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsSubmitting(false)}
                  style={{ background: '#F3F4F6', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  style={{ background: '#B91C1C', color: '#FFFFFF', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  नोंद सादर करा (Submit)
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Community Stories Feed */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.6rem', color: '#7C1D05', fontWeight: 800 }}>
              प्रकाशित मौखिक नोंदी व लोककथा संग्रह ({stories.length})
            </h2>
            <span style={{ fontSize: '0.8rem', background: '#F3E8FF', color: '#7E22CE', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
              🟣 Tier 4: मौखिक इतिहास दालन
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {stories.map(st => (
              <div
                key={st.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #F3E8D8',
                  padding: '24px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>
                      {st.category}
                    </span>
                    <h3 style={{ fontSize: '1.3rem', color: '#7C1D05', fontWeight: 800, margin: '6px 0 2px' }}>
                      {st.title}
                    </h3>
                    <div style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                      नोंदकर्ते: <strong>{st.author}</strong> ({st.village}) • दिनांक: {st.submissionDate}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{
                      background: st.confidence.bg,
                      color: st.confidence.color,
                      border: `1px solid ${st.confidence.color}`,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {st.confidence.icon} {st.confidence.label}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#7E22CE', fontWeight: 600 }}>
                      {st.tier.badge}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.92rem', color: '#374151', lineHeight: 1.6, background: '#FDFBF7', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #F59E0B' }}>
                  "{st.narrative}"
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', fontSize: '0.78rem', color: '#6B7280' }}>
                  <div>
                    <strong>स्रोत प्रकार:</strong> {st.sourceType}
                  </div>
                  <div style={{ color: '#15803D', fontWeight: 700 }}>
                    ✓ {st.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
