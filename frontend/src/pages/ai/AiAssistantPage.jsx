import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function AiAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'जय शिवराय! 🙏 मी **कनेक्ट मराठा एआय सहाय्यक (Connect Maratha AI Agent)** आहे.\n\nमी आपल्याला खालील विषयांवर त्वरित मार्गदर्शन करू शकतो:\n• **अखिल भारतीय मराठा महासंघ व कनेक्ट मराठा व्यासपीठ**\n• **सभासद नोंदणी व डिजिटल आयडी कार्ड**\n• **व्यवसाय संगम (Business Sangam) व नेटवर्किंग**\n• **छत्रपती शिवाजी महाराज, संभाजी महाराज व गडकिल्ले इतिहास**\n• **नोकरी, व्यवसाय व समाज कल्याण उपक्रम**\n\nखालीलपैकी एक प्रश्न निवडा किंवा आपला प्रश्न थेट टाईप करा:',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: []
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('mr'); // 'mr', 'en', 'hi'
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({ mobile: '', email: '', issue: '' });
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickPrompts = {
    mr: [
      { text: "Connect Maratha म्हणजे काय?", category: "Ecosystem" },
      { text: "नवीन सभासद नोंदणी कशी करावी?", category: "Membership" },
      { text: "व्यवसाय संगम (Business Sangam) चे फायदे काय आहेत?", category: "Business" },
      { text: "छत्रपती शिवाजी महाराजांचा राज्याभिषेक कधी व कुठे झाला?", category: "History" },
      { text: "रायगड किल्ल्याचे ऐतिहासिक महत्त्व सांगा.", category: "Heritage" },
      { text: "अखिल भारतीय मराठा महासंघाची उद्दिष्टे काय आहेत?", category: "About" }
    ],
    en: [
      { text: "What is Connect Maratha?", category: "Ecosystem" },
      { text: "How do I register as a member?", category: "Membership" },
      { text: "What is Business Sangam?", category: "Business" },
      { text: "When and where was Chhatrapati Shivaji Maharaj coronated?", category: "History" },
      { text: "What is the historical significance of Raigad Fort?", category: "Heritage" },
      { text: "What are the core objectives of Maratha Mahasangh?", category: "About" }
    ],
    hi: [
      { text: "Connect Maratha क्या है?", category: "Ecosystem" },
      { text: "नए सदस्य के रूप में पंजीकरण कैसे करें?", category: "Membership" },
      { text: "बिजनेस संगम क्या है?", category: "Business" },
      { text: "छत्रपति शिवाजी महाराज का राज्याभिषेक कब हुआ था?", category: "History" },
      { text: "रायगढ़ किले का ऐतिहासिक महत्व बताइए।", category: "Heritage" }
    ]
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          language: language,
          session_id: 'cm-page-user'
        })
      });

      const data = await res.json();
      const botResponseText = data?.data?.response || data?.response || 'माफ करा, उत्तर मिळवण्यात अडचण आली.';
      const sources = data?.data?.sources || data?.sources || [];

      const botMsg = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: sources,
        mode: data?.data?.mode || 'rag'
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: 'सर्व्हरशी संपर्क होऊ शकला नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSupport = async (e) => {
    e.preventDefault();
    setSupportSubmitting(true);
    setSupportSuccess(null);

    try {
      const res = await fetch('/api/ai/technical-support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: supportForm.mobile,
          email: supportForm.email,
          issue: supportForm.issue,
          language: language
        })
      });

      const data = await res.json();
      if (res.ok && data?.success) {
        setSupportSuccess('तुमची विनंती यशस्वीरीत्या नोंदवली गेली! आमची टीम लवकरच संपर्क करेल.');
        setSupportForm({ mobile: '', email: '', issue: '' });
        setTimeout(() => {
          setShowSupportModal(false);
          setSupportSuccess(null);
        }, 2500);
      } else {
        alert(data?.message || 'तांत्रिक अडचण आली, कृपया माहिती तपासा.');
      }
    } catch (err) {
      alert('विनंती पाठवता आली नाही.');
    } finally {
      setSupportSubmitting(false);
    }
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: 'calc(100vh - 80px)', padding: '30px 16px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header Breadcrumb & Info */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748B', marginBottom: '6px' }}>
              <Link to="/" style={{ color: '#EA580C', textDecoration: 'none', fontWeight: 600 }}>मुख्यपृष्ठ</Link>
              <span>›</span>
              <span style={{ fontWeight: 700, color: '#1E293B' }}>Connect Maratha AI Agent</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '10px' }}>
              🚩 Connect Maratha AI सहाय्यक
              <span style={{ fontSize: '0.75rem', background: '#DCFCE7', color: '#15803D', padding: '4px 10px', borderRadius: '20px', fontWeight: 800 }}>
                1,147+ RAG Knowledge Graph
              </span>
            </h1>
          </div>

          {/* Language Selector & Support Button */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                background: '#FFFFFF',
                color: '#EA580C',
                border: '2px solid #FED7AA',
                borderRadius: '12px',
                padding: '8px 12px',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.1)'
              }}
            >
              <option value="mr">मराठी (MR)</option>
              <option value="en">English (EN)</option>
              <option value="hi">हिंदी (HI)</option>
            </select>

            <button
              onClick={() => setShowSupportModal(true)}
              style={{
                background: '#FFFFFF',
                color: '#334155',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '8px 14px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🛠️</span>
              <span>तांत्रिक मदत</span>
            </button>
          </div>
        </div>

        {/* Chat Window Container */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '70vh',
            minHeight: '520px'
          }}
        >
          {/* Messages Area with Logo Watermark Background */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: '#F8FAFC',
              backgroundImage: "linear-gradient(rgba(248, 250, 252, 0.95), rgba(248, 250, 252, 0.95)), url('/assets/images/logo.png')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              backgroundSize: '240px 240px'
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <div
                  style={{
                    background: m.sender === 'user' ? 'linear-gradient(135deg, #EA580C, #C2410C)' : '#FFFFFF',
                    color: m.sender === 'user' ? '#FFFFFF' : '#1E293B',
                    padding: '16px 20px',
                    borderRadius: m.sender === 'user' ? '22px 22px 6px 22px' : '22px 22px 22px 6px',
                    fontSize: '0.96rem',
                    lineHeight: '1.6',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
                    border: m.sender === 'user' ? 'none' : '1px solid #E2E8F0',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {m.text}
                </div>

                {m.sources && m.sources.length > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px', paddingLeft: '8px' }}>
                    📚 अधिकृत संदर्भ: {m.sources.map((s) => s.topic || s.category).filter(Boolean).join(', ')}
                  </div>
                )}

                <div
                  style={{
                    fontSize: '0.7rem',
                    color: '#94A3B8',
                    marginTop: '4px',
                    textAlign: m.sender === 'user' ? 'right' : 'left',
                    paddingRight: m.sender === 'user' ? '6px' : '0',
                    paddingLeft: m.sender === 'user' ? '0' : '6px'
                  }}
                >
                  {m.time}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                <div
                  style={{
                    background: '#FFFFFF',
                    padding: '14px 20px',
                    borderRadius: '22px 22px 22px 6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.9rem',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span className="cm-spinner" />
                  <span>Connect Maratha नॉलेज बेस शोधत आहे...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div
            style={{
              background: '#FFFFFF',
              padding: '12px 20px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {(quickPrompts[language] || quickPrompts.mr).map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.text)}
                style={{
                  background: '#FFF7ED',
                  color: '#C2410C',
                  border: '1px solid #FED7AA',
                  borderRadius: '20px',
                  padding: '7px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FED7AA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF7ED'; }}
              >
                {item.text}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div
            style={{
              padding: '16px 20px',
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                language === 'mr'
                  ? "येथे प्रश्न विचारा (उदा. व्यवसाय संगम, नोंदणी कशी करावी, किल्ले, इतिहास)..."
                  : language === 'hi'
                  ? "यहाँ प्रश्न पूछें (उदा. बिजनेस संगम, पंजीकरण, इतिहास)..."
                  : "Type your question here (e.g., membership, Business Sangam, forts)..."
              }
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '30px',
                border: '1.5px solid #CBD5E1',
                outline: 'none',
                fontSize: '0.95rem'
              }}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !inputText.trim()}
              style={{
                background: inputText.trim() && !loading ? 'linear-gradient(135deg, #EA580C, #C2410C)' : '#CBD5E1',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50px',
                padding: '14px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: inputText.trim() && !loading ? 'pointer' : 'not-allowed',
                fontSize: '0.95rem',
                fontWeight: 800,
                boxShadow: inputText.trim() && !loading ? '0 4px 15px rgba(234, 88, 12, 0.4)' : 'none'
              }}
            >
              <span>विचारा (Send)</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowSupportModal(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1E293B', fontWeight: 800 }}>
                🛠️ तांत्रिक सहाय्य विनंती (Technical Support)
              </h3>
              <button
                onClick={() => setShowSupportModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#64748B', marginBottom: '20px' }}>
              आपल्याला व्यासपीठावर काही अडचण येत असल्यास तपशील द्या, आमची टीम त्वरित संपर्क करेल.
            </p>

            {supportSuccess ? (
              <div
                style={{
                  background: '#DCFCE7',
                  color: '#166534',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textAlign: 'center'
                }}
              >
                ✓ {supportSuccess}
              </div>
            ) : (
              <form onSubmit={handleSubmitSupport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    मोबाईल क्रमांक (10 Digit Mobile) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={supportForm.mobile}
                    onChange={(e) => setSupportForm({ ...supportForm, mobile: e.target.value })}
                    placeholder="उदा. 9876543210"
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    ईमेल पत्ता (Email Address) *
                  </label>
                  <input
                    type="email"
                    required
                    value={supportForm.email}
                    onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                    placeholder="उदा. user@example.com"
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    समस्येचे वर्णन (Issue Details) *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={supportForm.issue}
                    onChange={(e) => setSupportForm({ ...supportForm, issue: e.target.value })}
                    placeholder="तुम्हाला येत असलेली अडचण सविस्तर सांगा..."
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={supportSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: supportSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {supportSubmitting ? 'नोंदणी करत आहे...' : 'विनंती पाठवा (Submit Request) ➔'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
