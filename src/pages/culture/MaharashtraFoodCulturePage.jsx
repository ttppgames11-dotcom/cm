import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FOOD_CULTURE_DATA, 
  SOURCE_TIERS, 
  CONFIDENCE_LEVELS 
} from '../../data/heritageKnowledgeGraph';

export default function MaharashtraFoodCulturePage() {
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('all');
  const [selectedFoodId, setSelectedFoodId] = useState(FOOD_CULTURE_DATA[0].id);

  const filteredFoods = selectedRegionFilter === 'all' 
    ? FOOD_CULTURE_DATA 
    : FOOD_CULTURE_DATA.filter(f => f.region.toLowerCase().includes(selectedRegionFilter.toLowerCase()));

  const activeFood = FOOD_CULTURE_DATA.find(f => f.id === selectedFoodId) || FOOD_CULTURE_DATA[0];

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
            <span>🍲 CONNECT MARATHA</span>
            <span>•</span>
            <span>महाराष्ट्राची खाद्यसंस्कृती (Food Culture & Provenance)</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
            महाराष्ट्राची खाद्यसंस्कृती
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '850px', opacity: 0.95, lineHeight: 1.6, marginBottom: '20px' }}>
            केवळ रेसिपी नाही तर इतिहास, भौगोलिक उगम, घटक, पारंपरिक कृती, सण-उत्सव आणि समाजजीवनाशी जोडलेली अस्सल खाद्य परंपरा.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.4)' }}>
              🏛️ अधिकृत संदर्भ: महाराष्ट्र पर्यटन विकास महामंडळ (MTDC Flavors of Maharashtra)
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.4)' }}>
              📜 संदर्भ सूची: बॉम्बे गॅझेटिअर खाद्य व कृषी नोंदी
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px' }}>
        
        {/* Regional Filter Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', color: '#7C1D05', fontWeight: 800 }}>
              प्रदेशनिहाय पारंपरिक खाद्य संपदा
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
              कोकणची सोलकढी, कोल्हापूरचा तांबडा-पांढरा रस्सा, विदर्भाचे सावजी ते पश्चिम महाराष्ट्राचे पुरणपोळी व पिठलं-भाकरी.
            </p>
          </div>

          {/* Region Filter Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { id: 'all', label: 'सर्व प्रदेश' },
              { id: 'कोकण', label: 'कोकण' },
              { id: 'कोल्हापूर', label: 'कोल्हापूर' },
              { id: 'विदर्भ', label: 'विदर्भ (सावजी)' },
              { id: 'पश्चिम', label: 'पश्चिम महाराष्ट्र' },
              { id: 'खानदेश', label: 'खानदेश' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedRegionFilter(tab.id)}
                style={{
                  background: selectedRegionFilter === tab.id ? '#B91C1C' : '#FFFFFF',
                  color: selectedRegionFilter === tab.id ? '#FFFFFF' : '#374151',
                  border: selectedRegionFilter === tab.id ? '2px solid #7C1D05' : '1px solid #D1D5DB',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Layout: Food Items List + Active Food Knowledge Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(420px, 1.8fr)', gap: '28px', alignItems: 'flex-start' }}>
          
          {/* Left Column: Food List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredFoods.map(food => {
              const isSelected = food.id === selectedFoodId;
              return (
                <div
                  key={food.id}
                  onClick={() => setSelectedFoodId(food.id)}
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' : '#FFFFFF',
                    border: isSelected ? '2px solid #F59E0B' : '1px solid #E5E7EB',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 6px 16px rgba(245,158,11,0.2)' : '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1.15rem', color: isSelected ? '#78350F' : '#1F2937', fontWeight: 800, margin: 0 }}>
                      {food.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', background: '#FEE2E2', color: '#B91C1C', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                      {food.category}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '6px' }}>
                    📍 <strong>उगम:</strong> {food.region}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {food.traditionalPrep}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.75rem' }}>
                    <span style={{ color: food.sourceRef.confidence.color, fontWeight: 700 }}>
                      {food.sourceRef.confidence.icon} {food.sourceRef.confidence.label}
                    </span>
                    <span style={{ color: '#B91C1C', fontWeight: 700 }}>
                      सविस्तर ज्ञान कार्ड →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Food Knowledge Card (Every property from the user's specification) */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            border: '1px solid #F3E8D8',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            position: 'sticky',
            top: '20px'
          }}>
            {/* Top Header */}
            <div style={{
              background: 'linear-gradient(90deg, #7C1D05 0%, #B91C1C 100%)',
              color: '#FFFFFF',
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
                  {activeFood.category}
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0 4px' }}>
                  {activeFood.name}
                </h2>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  📍 {activeFood.region}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{
                  background: activeFood.sourceRef.confidence.bg,
                  color: activeFood.sourceRef.confidence.color,
                  border: `1px solid ${activeFood.sourceRef.confidence.color}`,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}>
                  {activeFood.sourceRef.confidence.icon} {activeFood.sourceRef.confidence.label}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#FCD34D' }}>
                  {activeFood.sourceRef.tier.badge}
                </span>
              </div>
            </div>

            {/* Structured Schema Grid */}
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Ingredients (घटक) */}
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#7C1D05', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🌿</span> मुख्य घटक व मसाले (Ingredients):
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {activeFood.ingredients.map((ing, i) => (
                    <span key={i} style={{ background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                      ✓ {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Traditional Preparation (पारंपरिक कृती) */}
              <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #B91C1C' }}>
                <h4 style={{ fontSize: '0.95rem', color: '#1F2937', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🥣</span> पारंपरिक बनवण्याची पद्धत (Traditional Preparation):
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, margin: 0 }}>
                  {activeFood.traditionalPrep}
                </p>
              </div>

              {/* History & Origin (इतिहास व भौगोलिक उगम) */}
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#7C1D05', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📜</span> इतिहास व पार्श्वभूमी (History & Heritage):
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>
                  {activeFood.history}
                </p>
              </div>

              {/* Occasion & Festival (प्रसंग व सण) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ background: '#FEF2F2', padding: '14px', borderRadius: '10px', border: '1px solid #FEE2E2' }}>
                  <div style={{ fontSize: '0.8rem', color: '#991B1B', fontWeight: 700, marginBottom: '4px' }}>
                    🎉 प्रसंग व सण-उत्सव (Occasion)
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#7F1D1D', fontWeight: 600 }}>
                    {activeFood.occasion}
                  </div>
                </div>

                <div style={{ background: '#FAF5FF', padding: '14px', borderRadius: '10px', border: '1px solid #F3E8FF' }}>
                  <div style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: 700, marginBottom: '4px' }}>
                    👥 सामाजिक / स्थानिक नाते (Community Association)
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#581C87', fontWeight: 600 }}>
                    {activeFood.communityAssociation}
                  </div>
                </div>
              </div>

              {/* Where to Experience It (कुठे चाखाल?) */}
              <div style={{ background: '#ECFDF5', padding: '14px', borderRadius: '12px', border: '1px solid #A7F3D0' }}>
                <h4 style={{ fontSize: '0.92rem', color: '#065F46', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📍</span> अस्सल चव कुठे अनुभवाल? (Where to Experience)
                </h4>
                <div style={{ fontSize: '0.88rem', color: '#047857', fontWeight: 600 }}>
                  {activeFood.whereToExperience}
                </div>
              </div>

              {/* References & Links */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem', color: '#6B7280' }}>
                <div>
                  <strong>स्रोत:</strong> {activeFood.sourceRef.source}
                </div>
                <Link to="/culture/diversity" style={{ color: '#B91C1C', fontWeight: 700 }}>
                  🗺️ या प्रदेशाचा सांस्कृतिक वारसा पहा →
                </Link>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
