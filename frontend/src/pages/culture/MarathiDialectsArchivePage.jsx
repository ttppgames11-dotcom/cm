import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  DIALECTS_DATA, 
  PHRASE_COMPARISONS, 
  SOURCE_TIERS, 
  CONFIDENCE_LEVELS 
} from '../../data/heritageKnowledgeGraph';

export default function MarathiDialectsArchivePage() {
  const [searchParams] = useSearchParams();
  const dialectParam = searchParams.get('dialect');
  const regionParam = searchParams.get('region');

  const [selectedPhraseId, setSelectedPhraseId] = useState(PHRASE_COMPARISONS[0].id);
  const [activeDialectId, setActiveDialectId] = useState('malwani');
  const [customText, setCustomText] = useState('');
  const [speechNotice, setSpeechNotice] = useState('');

  // Handle URL params for direct dialect selection
  useEffect(() => {
    if (dialectParam) {
      const match = DIALECTS_DATA.find(d => d.id === dialectParam || d.name.toLowerCase().includes(dialectParam.toLowerCase()));
      if (match) setActiveDialectId(match.id);
    } else if (regionParam) {
      const match = DIALECTS_DATA.find(d => d.region?.toLowerCase().includes(regionParam.toLowerCase()));
      if (match) setActiveDialectId(match.id);
    }
  }, [dialectParam, regionParam]);

  const activePhrase = PHRASE_COMPARISONS.find(p => p.id === selectedPhraseId) || PHRASE_COMPARISONS[0];
  const activeDialect = DIALECTS_DATA.find(d => d.id === activeDialectId) || DIALECTS_DATA[1];

  // Web Speech API / TTS handler
  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'mr-IN';
      utterance.rate = 0.9;
      
      // Try to find Marathi or Hindi voice
      const voices = window.speechSynthesis.getVoices();
      const marathiVoice = voices.find(v => v.lang.includes('mr') || v.lang.includes('hi'));
      if (marathiVoice) {
        utterance.voice = marathiVoice;
      }

      utterance.onstart = () => {
        setSpeechNotice(`🔊 ऑडिओ ऐकत आहात: "${text}"`);
      };
      utterance.onend = () => {
        setTimeout(() => setSpeechNotice(''), 2000);
      };
      utterance.onerror = () => {
        setSpeechNotice(`🔊 उच्चार: "${text}"`);
        setTimeout(() => setSpeechNotice(''), 3000);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setSpeechNotice(`🔊 उच्चार: "${text}" (आपल्या ब्राउझरमध्ये प्रत्यक्ष ऑडिओ प्लेबॅक उपलब्ध नाही)`);
      setTimeout(() => setSpeechNotice(''), 3000);
    }
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
            <span>🗣️ CONNECT MARATHA</span>
            <span>•</span>
            <span>महाराष्ट्राच्या बोली व भाषा आर्काइव्ह</span>
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '12px', lineHeight: 1.2 }}>
            महाराष्ट्राच्या बोली (Marathi Dialects Archive)
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '850px', opacity: 0.95, lineHeight: 1.6, marginBottom: '20px' }}>
            "दर बारा कोसांवर भाषा बदलते"—प्रमाण मराठी, वर्हाडी, मालवणी, अहिराणी, आगरी, कोळी, मराठवाडी आणि झाडीबोली 
            यांच्या उच्चार, वाक्प्रचार, व लहेजांचे अधिकृत संकलन व थेट तुलना.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.4)' }}>
              🏛️ संदर्भ: मराठी भाषा विभाग, महाराष्ट्र शासन (marathi.gov.in)
            </span>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.4)' }}>
              📚 भाषाशास्त्र संदर्भ: प्रा. डॉ. अशोक केळकर व डॉ. ना. गो. कालेलकर
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '36px 20px' }}>
        
        {/* Floating notice for audio playback */}
        {speechNotice && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#1F2937',
            color: '#F9FAFB',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            borderLeft: '5px solid #F59E0B',
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            {speechNotice}
          </div>
        )}

        {/* Section 1: Interactive Phrase Comparison Matrix ("तू कुठं चाललास?") */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #F3E8D8',
          padding: '30px',
          marginBottom: '40px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: '#B91C1C', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              परस्परसंवादी भाषा प्रयोगशाळा (Interactive Dialect Comparison)
            </span>
            <h2 style={{ fontSize: '1.7rem', color: '#7C1D05', fontWeight: 800, marginTop: '4px' }}>
              "तू कुठं चाललास?" — एकाच वाक्याचे प्रादेशिक रूपे
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>
              खालीलपैकी वाक्य निवडा आणि संपूर्ण महाराष्ट्रातील बोलींमध्ये त्याचे उच्चार, व्याकरण रचना व ऑडिओ ऐका.
            </p>
          </div>

          {/* Preset Phrase Selector Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
            {PHRASE_COMPARISONS.map(ph => {
              const isSelected = ph.id === selectedPhraseId;
              return (
                <button
                  key={ph.id}
                  onClick={() => setSelectedPhraseId(ph.id)}
                  style={{
                    background: isSelected ? '#B91C1C' : '#F9FAFB',
                    color: isSelected ? '#FFFFFF' : '#374151',
                    border: isSelected ? '2px solid #7C1D05' : '1px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  "{ph.standardMarathi}"
                </button>
              );
            })}
          </div>

          {/* Selected Phrase Detailed Display */}
          <div style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            borderRadius: '16px',
            border: '1px solid #FCD34D',
            padding: '24px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', background: '#F59E0B', color: '#78350F', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                  प्रमाण मराठी (Standard Marathi)
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#78350F', marginTop: '6px' }}>
                  {activePhrase.standardMarathi}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#92400E', marginTop: '2px' }}>
                  English: <em>"{activePhrase.english}"</em>
                </div>
              </div>

              <button
                onClick={() => playAudio(activePhrase.standardMarathi)}
                style={{
                  background: '#B91C1C',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                🔊 प्रमाण उच्चार ऐका
              </button>
            </div>
          </div>

          {/* Dialect Comparisons Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {activePhrase.comparisons.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E5E7EB',
                  padding: '18px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#7C1D05' }}>
                      🚩 {item.dialect}
                    </span>
                    <span style={{ fontSize: '0.75rem', background: '#F3F4F6', color: '#4B5563', padding: '2px 8px', borderRadius: '12px' }}>
                      {item.region}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '8px 0 4px' }}>
                    "{item.text}"
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#6B7280', fontStyle: 'italic', marginBottom: '12px' }}>
                    वापर: {item.notes}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F3F4F6', paddingTop: '10px' }}>
                  <button
                    onClick={() => playAudio(item.text)}
                    style={{
                      background: '#FEE2E2',
                      color: '#B91C1C',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    🔊 ऐका (Listen)
                  </button>

                  <span style={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700 }}>
                    🟢 अस्सल लहेजा
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Complete Dialect Profiles Tree */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ color: '#B91C1C', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              विभाग २ • बोली ज्ञानकोश (Dialect Profiles)
            </span>
            <h2 style={{ fontSize: '1.7rem', color: '#7C1D05', fontWeight: 800 }}>
              महाराष्ट्राच्या प्रमुख बोलींचे सविस्तर स्वरूप
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.92rem' }}>
              बोली म्हणजे भाषेचे विकृत रूप नसून त्या त्या प्रदेशाचे निसर्गदत्त व समृद्ध मौखिक वैभव आहे.
            </p>
          </div>

          {/* Dialect Selector Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {DIALECTS_DATA.map(d => {
              const isSelected = d.id === activeDialectId;
              return (
                <button
                  key={d.id}
                  onClick={() => setActiveDialectId(d.id)}
                  style={{
                    background: isSelected ? '#B91C1C' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#374151',
                    border: isSelected ? '2px solid #7C1D05' : '1px solid #D1D5DB',
                    borderRadius: '24px',
                    padding: '8px 18px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {d.name}
                </button>
              );
            })}
          </div>

          {/* Detailed Dialect Profile Card */}
          {activeDialect && (
            <div style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #F3E8D8',
              padding: '30px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.8rem', color: '#7C1D05', fontWeight: 800, margin: 0 }}>
                      {activeDialect.name}
                    </h3>
                    <span style={{ background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}>
                      प्रदेश: {activeDialect.region}
                    </span>
                  </div>
                  {activeDialect.speakersApprox && (
                    <div style={{ color: '#6B7280', fontSize: '0.88rem', marginTop: '4px' }}>
                      अंदाजे भाषक संख्या: <strong>{activeDialect.speakersApprox}</strong>
                    </div>
                  )}
                </div>

                {/* Confidence Badge */}
                {activeDialect.sourceRef && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {activeDialect.sourceRef.confidence && (
                      <span style={{
                        background: activeDialect.sourceRef.confidence.bg,
                        color: activeDialect.sourceRef.confidence.color,
                        border: `1px solid ${activeDialect.sourceRef.confidence.color}`,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        {activeDialect.sourceRef.confidence.icon} {activeDialect.sourceRef.confidence.label}
                      </span>
                    )}
                    {activeDialect.sourceRef.tier && (
                      <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                        {activeDialect.sourceRef.tier.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Characteristics */}
              <div style={{
                background: '#F8FAFC',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #E2E8F0',
                marginBottom: '24px'
              }}>
                <h4 style={{ fontSize: '1rem', color: '#1E293B', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🔤</span> बोलीवैशिष्ट्ये व लहेजा (Phonetic & Dialect Characteristics)
                </h4>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {typeof activeDialect.characteristics === 'string' 
                    ? activeDialect.characteristics 
                    : Array.isArray(activeDialect.characteristics) 
                      ? activeDialect.characteristics.join(' • ') 
                      : ''}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                
                {/* Proverb & Cultural Meaning */}
                <div style={{ background: '#FFFBEB', borderRadius: '12px', padding: '20px', border: '1px solid #FEF3C7' }}>
                  <h4 style={{ fontSize: '1rem', color: '#78350F', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📜</span> प्रसिद्ध म्हणी व वाक्प्रचार (Traditional Proverb)
                  </h4>
                  {activeDialect.proverb && (
                    <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #FDE68A', marginBottom: '10px' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#B91C1C' }}>
                        "{activeDialect.proverb}"
                      </div>
                      {activeDialect.proverbMeaning && (
                        <div style={{ fontSize: '0.86rem', color: '#4B5563', marginTop: '6px' }}>
                          💡 भावार्थ: <strong>{activeDialect.proverbMeaning}</strong>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => playAudio(activeDialect.proverb)}
                    style={{
                      background: '#FEF3C7',
                      color: '#92400E',
                      border: '1px solid #FDE68A',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    🔊 म्हणीचा उच्चार ऐका
                  </button>
                </div>

                {/* Sample Sentence & Voice Playback */}
                <div style={{ background: '#F0FDF4', borderRadius: '12px', padding: '20px', border: '1px solid #DCFCE7' }}>
                  <h4 style={{ fontSize: '1rem', color: '#166534', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🗣️</span> प्रातिनिधिक बोली वाक्य (Sample Sentence)
                  </h4>
                  {activeDialect.sampleSentence && (
                    <div style={{ background: '#FFFFFF', padding: '12px 16px', borderRadius: '10px', border: '1px solid #86EFAC', marginBottom: '10px' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803D' }}>
                        "{activeDialect.sampleSentence}"
                      </div>
                      {activeDialect.englishTranslation && (
                        <div style={{ fontSize: '0.86rem', color: '#4B5563', marginTop: '6px' }}>
                          English: <em>"{activeDialect.englishTranslation}"</em>
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => playAudio(activeDialect.sampleSentence)}
                    style={{
                      background: '#15803D',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🔊 वाक्याचा लहेजा ऐका (Play Audio)
                  </button>
                </div>

              </div>

              {/* Official Source Footnote */}
              <div style={{ marginTop: '24px', background: '#F9FAFB', padding: '12px 18px', borderRadius: '10px', fontSize: '0.8rem', color: '#6B7280', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <strong>अभ्यास व शासन संदर्भ:</strong> {activeDialect.sourceRef?.source || 'महाराष्ट्र शासन भाषा संचालनालय व विद्यापीठ भाषाशास्त्र पुराभिलेख'}
                </div>
                <Link to="/culture/diversity" style={{ color: '#B91C1C', fontWeight: 700, textDecoration: 'none' }}>
                  ← संपूर्ण प्रादेशिक प्रोफाइल पहा
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
