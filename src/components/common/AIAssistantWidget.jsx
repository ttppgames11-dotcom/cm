import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

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

    const userEntry = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userEntry]);
    setInputMsg('');
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        message: query,
        language: language,
        history: messages.slice(-3).map((m) => ({ role: m.role, text: m.text }))
      });

      const reply = res.data?.data?.response || res.data?.response || 'माहिती उपलब्ध झाली नाही.';
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          text: 'क्षमस्व! AI सर्व्हरशी संपर्क होऊ शकला नाही. कृपया /ai वर भेट द्या.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePills = [
    'रायगड किल्ला',
    'शिवराज्याभिषेक सोहळा',
    'प्रतापगड युद्ध',
    'बिझनेस संगम',
    'रक्तदान साहाय्य'
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #DC2626 100%)',
            color: '#FFFFFF',
            border: '2px solid rgba(255,255,255,0.4)',
            borderRadius: '50px',
            padding: '12px 20px',
            fontSize: '0.92rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 10px 28px rgba(245, 158, 11, 0.5), 0 4px 12px rgba(0,0,0,0.4)',
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
            background: '#10B981',
            boxShadow: '0 0 8px #10B981'
          }} />
        </button>
      )}

      {/* Floating Chat Modal */}
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
          background: '#0F172A',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #431407 100%)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>🚩</span>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#FFFFFF', display: 'block', lineHeight: 1.2 }}>
                  Connect Maratha AI
                </strong>
                <span style={{ fontSize: '0.68rem', color: '#34D399', fontWeight: 600 }}>
                  ● 84 ज्ञान शाखा • Active RAG
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Language Pills */}
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', padding: '2px' }}>
                {['mr', 'hi', 'en'].map((l) => (
                  <button
                    key={l}
                    onClick={() => handleLangChange(l)}
                    style={{
                      background: language === l ? '#F59E0B' : 'transparent',
                      color: language === l ? '#000' : '#CBD5E1',
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
                  background: 'rgba(255,255,255,0.1)',
                  color: '#CBD5E1',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  textDecoration: 'none'
                }}>
                ↗
              </Link>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  padding: '2px 6px'
                }}>
                ✕
              </button>
            </div>
          </div>

          {/* Quick Prompt Pills */}
          <div style={{
            background: '#111827',
            padding: '8px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
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
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#FDE68A',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '12px',
                  padding: '3px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
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
            background: '#090D16'
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
                    background: isU ? '#2563EB' : 'rgba(30, 41, 59, 0.95)',
                    color: '#FFFFFF',
                    borderRadius: isU ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    padding: '10px 14px',
                    fontSize: '0.84rem',
                    lineHeight: '1.5',
                    border: isU ? 'none' : '1px solid rgba(255,255,255,0.08)'
                  }}>
                    {m.text}

                    {!isU && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{m.timestamp}</span>
                        <button
                          onClick={() => speakText(m.text, idx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#FCD34D',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FCD34D', fontSize: '0.78rem' }}>
                <span className="spin">⚙️</span>
                <span>AI विचार करत आहे...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Footer */}
          <div style={{
            background: '#111827',
            padding: '10px 12px',
            borderTop: '1px solid rgba(255,255,255,0.08)'
          }}>
            {isListening && (
              <div style={{ fontSize: '0.72rem', color: '#F87171', marginBottom: '6px', fontWeight: 700 }}>
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
                  background: isListening ? '#EF4444' : 'rgba(245, 158, 11, 0.15)',
                  color: isListening ? '#FFF' : '#F59E0B',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
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
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                  outline: 'none'
                }}
              />

              <button
                type="submit"
                disabled={loading || !inputMsg.trim()}
                style={{
                  background: !inputMsg.trim() || loading ? 'rgba(255,255,255,0.1)' : '#F59E0B',
                  color: !inputMsg.trim() || loading ? '#64748B' : '#000000',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: !inputMsg.trim() || loading ? 'not-allowed' : 'pointer'
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
