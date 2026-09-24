import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

// Resilient Client Knowledge Fallback for Offline / Latency Resilience
function getClientFallback(query = '', lang = 'mr') {
  const q = String(query).toLowerCase();

  // Raigad & Forts
  if (q.includes('रायगड') || q.includes('raigad') || q.includes('किल्ला') || q.includes('fort') || q.includes('गड')) {
    if (lang === 'mr') return '🚩 रायगड किल्ला: छत्रपती शिवाजी महाराजांच्या हिंदवी स्वराज्याची राजधानी. ६ जून १६७४ रोजी येथे भव्य शिवराज्याभिषेक सोहळा संपन्न झाला. गडावर होळीचा माळ, जगदीश्वर मंदिर, नगारखाना, हिरकणी बुरूज आणि महाराजांची पवित्र समाधी आजही प्रेरणा देतात.';
    if (lang === 'hi') return '🚩 रायगढ़ किला: छत्रपति शिवाजी महाराज के हिंदवी स्वराज्य की राजधानी। ६ जून १६७४ को यहाँ भव्य राज्याभिषेक संपन्न हुआ था। यहाँ महादरवाजा, नगाड़ाखाना, जगदीश्वर मंदिर और महाराज की पावन समाधि स्थित है।';
    return '🚩 Raigad Fort: The historic capital of Chhatrapati Shivaji Maharaj’s Hindavi Swarajya. The grand Coronation took place here on 6th June 1674. Prominent monuments include the Nagarkhana, Jagdishwar Temple, and the Royal Samadhi.';
  }

  // Coronation / Shivrajyabhishek
  if (q.includes('राज्याभिषेक') || q.includes('coronation') || q.includes('शिवाजी') || q.includes('shivaji') || q.includes('महाराज')) {
    if (lang === 'mr') return '🚩 शिवराज्याभिषेक सोहळा: ६ जून १६७४ (ज्येष्ठ शुद्ध त्रयोदशी, शके १५९६) रोजी रायगडावर पंडित गागाभट्टांच्या उपस्थितीत छत्रपती शिवाजी महाराजांचा वैदिक राज्याभिषेक सोहळा संपन्न झाला आणि नवीन "शिवराज्याभिषेक शक" सुरू झाला.';
    if (lang === 'hi') return '🚩 शिवराज्याभिषेक: ६ जून १६७४ को रायगढ़ में छत्रपति शिवाजी महाराज का वैदिक राज्याभिषेक संपन्न हुआ और "शिवराज्याभिषेक शक" आरंभ हुआ।';
    return '🚩 The Grand Coronation (Shivrajyabhishek): Held on June 6, 1674, at Raigad Fort under the guidance of Pandit Gaga Bhatt, establishing Chhatrapati Shivaji Maharaj as the sovereign monarch of Swarajya.';
  }

  // Pratapgad & Battles
  if (q.includes('प्रतापगड') || q.includes('pratapgad') || q.includes('अफजल') || q.includes('युद्ध') || q.includes('battle')) {
    if (lang === 'mr') return '⚔️ प्रतापगडचे युद्ध: १० नोव्हेंबर १६५९ रोजी छत्रपती शिवाजी महाराजांनी अफजलखानाचा वध करून विजापुरी सैन्याचा निर्णायक पराभव केला. हे युद्ध मराठा गनिमी काव्याचे जागतिक दर्जाचे उदाहरण आहे.';
    if (lang === 'hi') return '⚔️ प्रतापगढ़ का युद्ध: १० नवंबर १६५९ को छत्रपति शिवाजी महाराज ने अफजल खान का अंत किया और ऐतिहासिक विजय प्राप्त की।';
    return '⚔️ Battle of Pratapgad: Fought on November 10, 1659, where Chhatrapati Shivaji Maharaj triumphed over Afzal Khan through brilliant guerrilla warfare (Ganimi Kava).';
  }

  // Business Sangam
  if (q.includes('संगम') || q.includes('व्यापार') || q.includes('व्यवसाय') || q.includes('business') || q.includes('sangam')) {
    if (lang === 'mr') return '🤝 बिझनेस संगम: मराठा उद्योजक, व्यापारी आणि व्यावसायिकांना परस्परांशी जोडून B2B रेफरल्स, उद्योग देवाणघेवाण व सहकार्य घडवून आणणारे Connect Maratha चे मुख्य व्यासपीठ आहे.';
    if (lang === 'hi') return '🤝 बिज़नेस संगम: मराठा उद्यमियों और व्यापारियों को जोड़ने वाला व्यावसायिक मंच है जो B2B रेफरल्स और व्यापार के अवसर प्रदान करता है।';
    return '🤝 Business Sangam: Connect Maratha’s flagship commerce ecosystem connecting Maratha entrepreneurs for B2B referrals, chapter meetings, and business growth.';
  }

  // Emergency Blood / Seva
  if (q.includes('रक्त') || q.includes('blood') || q.includes('मदत') || q.includes('help') || q.includes('सेवा')) {
    if (lang === 'mr') return '🩸 २४x७ आपत्कालीन रक्त साहाय्य: तात्काळ रक्तदाता शोधण्यासाठी आपण पोर्टलवरील /blood पेजला भेट देऊ शकता किंवा थेट २४x७ हेल्पलाईन १८००-१२३-१६७४ वर संपर्क करू शकता.';
    if (lang === 'hi') return '🩸 आपातकालीन रक्तदान: तत्काल रक्तदाता सहायता के लिए /blood पृष्ठ पर जाएँ या टोल-फ्री हेल्पलाइन १८००-१२३-१६७४ पर संपर्क करें।';
    return '🩸 24x7 Emergency Blood Help: Find donors immediately at the /blood portal or reach out to our emergency helpline at 1800-123-1674.';
  }

  // General Contextual Response
  if (lang === 'mr') return `🙏 आपण विचारलेला प्रश्न: "${query}". Connect Maratha ज्ञानकोशानुसार आपण गड-किल्ले, स्वराज्य इतिहास, व्यवसाय संगम किंवा २४x७ रक्त साहाय्याबद्दल विचारू शकता.`;
  if (lang === 'hi') return `🙏 आपके प्रश्न "${query}" के संबंध में: Connect Maratha ज्ञानकोश से आप किलों, स्वराज्य, व्यापार अथवा समाज सहायता की जानकारी प्राप्त कर सकते हैं।`;
  return `🙏 In response to "${query}": Connect Maratha provides verified knowledge on Maratha history, heritage hill & sea forts, Business Sangam, and community help.`;
}

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState('mr');
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 'widget-init',
      role: 'assistant',
      text: '🙏 जय जिजाऊ! जय शिवराय! मी Connect Maratha चा AI सहाय्यक आहे. मी आपल्याला मराठा इतिहास, किल्ले, स्वराज्य आणि व्यवसाय संगम याबद्दल मदत करू शकतो. आपला प्रश्न विचारा.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const chatBottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Language switch
  const handleLangChange = (lang) => {
    setLanguage(lang);
    const greeting = lang === 'en'
      ? '🙏 Hello! I am the Connect Maratha AI Assistant. Ask me anything about Maratha history, historic hill and sea forts, Swarajya, and Business Sangam.'
      : lang === 'hi'
      ? '🙏 जय भवानी! जय शिवाजी! मैं Connect Maratha AI सहायक हूँ। मराठा इतिहास, किलों और व्यापार संगम से जुड़े अपने प्रश्न पूछें।'
      : '🙏 जय जिजाऊ! जय शिवराय! मी Connect Maratha चा AI सहाय्यक आहे. मी आपल्याला मराठा इतिहास, किल्ले, स्वराज्य आणि व्यवसाय संगम याबद्दल मदत करू शकतो. आपला प्रश्न विचारा.';

    setMessages([
      {
        id: `widget-init-${lang}`,
        role: 'assistant',
        text: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Voice Speech Recognition
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : 'mr-IN';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      let tr = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        tr += e.results[i][0].transcript;
      }
      setInputMsg(tr);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
  };

  // Speak aloud
  const speakText = (txt, idx) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(txt);
    utt.lang = language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : 'mr-IN';
    utt.rate = 0.95;
    utt.onend = () => setSpeakingIdx(null);
    utt.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utt);
  };

  // Send message
  const handleSend = async (customQuery) => {
    const query = (customQuery || inputMsg).trim();
    if (!query || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg('');
    setLoading(true);

    try {
      let aiText = '';
      try {
        const res = await (apiClient.aiChat
          ? apiClient.aiChat(query, language, messages.slice(-4).map((m) => ({ role: m.role, text: m.text })))
          : apiClient.post('/ai/chat', {
              message: query,
              language: language,
              history: messages.slice(-4).map((m) => ({ role: m.role, text: m.text }))
            }));

        aiText = res?.data?.response || res?.response || res?.data?.reply || res?.reply || '';
      } catch (fErr) {
        console.warn('Backend call failed, using client fallback:', fErr.message);
      }

      if (!aiText) {
        aiText = getClientFallback(query, language);
      }

      const botMsg = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const fallbackText = getClientFallback(query, language);
      const botMsg = {
        id: `b-${Date.now()}`,
        role: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePills = language === 'en'
    ? ['Shivrajyabhishek Date', 'Raigad Fort Info', 'Business Sangam Help', '24x7 Blood Support']
    : language === 'hi'
    ? ['शिवराज्याभिषेक कब हुआ?', 'रायगढ़ किले की जानकारी', 'बिज़नेस संगम क्या है?', 'आपातकालीन रक्त']
    : ['शिवराज्याभिषेक सोहळा', 'रायगड किल्ला माहिती', 'बिझनेस संगम जोडणी', 'आपत्कालीन रक्त साहाय्य'];

  return (
    <>
      {/* Floating Widget Trigger Button (Pure Royal Bhagwa & White) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Connect Maratha AI Agent"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9990,
            background: 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)',
            color: '#FFFFFF',
            border: '2px solid #FED7AA',
            borderRadius: '50px',
            padding: '12px 20px',
            fontSize: '0.88rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(234, 88, 12, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            fontFamily: 'Inter, Baloo 2, sans-serif'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
          <span style={{ fontSize: '1.25rem' }}>🚩</span>
          <span>विचारणा करा (AI सहाय्यक)</span>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#FFFFFF',
            boxShadow: '0 0 8px #FFFFFF'
          }} />
        </button>
      )}

      {/* Floating Chat Modal (Strict White & Bhagwa Theme) */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '400px',
          maxWidth: 'calc(100vw - 32px)',
          height: '560px',
          maxHeight: 'calc(100vh - 48px)',
          zIndex: 9999,
          background: '#FFFFFF',
          border: '2px solid #EA580C',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(234, 88, 12, 0.25)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #EA580C 0%, #D97706 60%, #C2410C 100%)',
            borderBottom: '1px solid #FDBA74',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>🚩</span>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#FFFFFF', display: 'block', lineHeight: 1.2, fontWeight: 900 }}>
                  Connect Maratha AI
                </strong>
                <span style={{ fontSize: '0.68rem', color: '#FEF08A', fontWeight: 700 }}>
                  ● 84 ज्ञान शाखा • Active RAG
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Language Pills */}
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', padding: '2px', border: '1px solid rgba(255,255,255,0.4)' }}>
                {['mr', 'hi', 'en'].map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLangChange(l)}
                    style={{
                      background: language === l ? '#FFFFFF' : 'transparent',
                      color: language === l ? '#EA580C' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Fullscreen Expand Link */}
              <Link
                to="/ai"
                onClick={() => setIsOpen(false)}
                title="पूर्ण स्क्रीन उघडा"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                  fontWeight: 800
                }}>
                ↗
              </Link>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  fontWeight: 900
                }}>
                ✕
              </button>
            </div>
          </div>

          {/* Quick Prompt Pills */}
          <div style={{
            background: '#FFF7ED',
            padding: '8px 12px',
            borderBottom: '1px solid #FED7AA',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {samplePills.map((pill, i) => (
              <button
                key={i}
                onClick={() => handleSend(pill)}
                style={{
                  background: '#FFFFFF',
                  color: '#C2410C',
                  border: '1px solid #FED7AA',
                  borderRadius: '12px',
                  padding: '3px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0
                }}>
                {pill}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div style={{
            flex: 1,
            padding: '14px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#FFFDF9'
          }}>
            {messages.map((m, idx) => {
              const isU = m.role === 'user';
              return (
                <div
                  key={m.id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: isU ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                  {!isU && (
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🚩</span>
                  )}
                  <div style={{
                    maxWidth: '82%',
                    background: isU ? 'linear-gradient(135deg, #EA580C, #D97706)' : '#FFF7ED',
                    color: isU ? '#FFFFFF' : '#1E293B',
                    borderRadius: isU ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    padding: '10px 14px',
                    fontSize: '0.84rem',
                    lineHeight: '1.5',
                    border: isU ? 'none' : '1px solid #FED7AA',
                    boxShadow: isU ? '0 2px 8px rgba(234, 88, 12, 0.25)' : '0 2px 6px rgba(0,0,0,0.04)'
                  }}>
                    {m.text}

                    {!isU && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '4px', borderTop: '1px solid #FED7AA' }}>
                        <span style={{ fontSize: '0.65rem', color: '#7C2D12', fontWeight: 600 }}>{m.timestamp}</span>
                        <button
                          onClick={() => speakText(m.text, idx)}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #FED7AA',
                            borderRadius: '4px',
                            color: '#EA580C',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '2px 6px'
                          }}>
                          <span>{speakingIdx === idx ? '⏹️' : '🔊'}</span>
                          <span>{speakingIdx === idx ? 'थांबवा' : 'ऐका'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EA580C', fontSize: '0.78rem', fontWeight: 700 }}>
                <span className="spin">⚙️</span>
                <span>AI विचार करत आहे...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Footer */}
          <div style={{
            background: '#FFFFFF',
            padding: '10px 12px',
            borderTop: '1px solid #FED7AA'
          }}>
            {isListening && (
              <div style={{ fontSize: '0.72rem', color: '#DC2626', marginBottom: '6px', fontWeight: 800 }}>
                🔴 ऐकत आहे... कृपया बोला...
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              
              <button
                type="button"
                onClick={toggleListening}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: isListening ? '#DC2626' : '#FFF7ED',
                  color: isListening ? '#FFF' : '#EA580C',
                  border: '1px solid #FED7AA',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  flexShrink: 0
                }}>
                {isListening ? '🛑' : '🎤'}
              </button>

              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="प्रश्न विचारा..."
                style={{
                  flex: 1,
                  background: '#FFF7ED',
                  border: '1px solid #FED7AA',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#1E293B',
                  fontSize: '0.84rem',
                  outline: 'none',
                  fontWeight: 600
                }}
              />

              <button
                type="submit"
                disabled={loading || !inputMsg.trim()}
                style={{
                  background: !inputMsg.trim() || loading ? '#E2E8F0' : 'linear-gradient(135deg, #EA580C, #D97706)',
                  color: !inputMsg.trim() || loading ? '#94A3B8' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontWeight: 900,
                  fontSize: '0.82rem',
                  cursor: !inputMsg.trim() || loading ? 'not-allowed' : 'pointer',
                  boxShadow: inputMsg.trim() ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none'
                }}>
                ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
