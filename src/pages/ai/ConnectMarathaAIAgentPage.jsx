import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';

// Trilingual Translations for the AI Agent
const translations = {
  mr: {
    langName: 'मराठी',
    title: 'CONNECT मराठा AI सहाय्यक',
    subtitle: 'मराठा इतिहास • गड-किल्ले • स्वराज्य • व्यवसाय संगम • समाज साहाय्य',
    placeholder: 'तुमचा प्रश्न येथे लिहा (उदा. रायगड किल्ला, व्यवसाय संगम कसा जोडायचा)...',
    thinking: 'AI विचार करत आहे...',
    voiceListening: 'ऐकत आहे... बोला...',
    voiceStart: 'प्रश्न बोला',
    voiceStop: 'बोलणे थांबवा',
    speakAnswer: 'उत्तर ऐका',
    stopSpeaking: 'आवाज थांबवा',
    voiceNotSupported: 'या ब्राउझरमध्ये स्पीच रिकग्निशन उपलब्ध नाही. कृपया मजकूर टाईप करा.',
    send: 'पाठवा',
    clearChat: 'संभाषण साफ करा',
    feedbackQ: 'तुम्हाला समाधानकारक उत्तर मिळाले का?',
    yes: 'होय, धन्यवाद! 👍',
    no: 'नाही, अधिक मदत हवी 👎',
    supportTitle: 'तांत्रिक टीमची मदत',
    supportSubtitle: 'आपल्या प्रश्नाचे समाधान न झाल्यास थेट केंद्रीय तांत्रिक पथकाशी संपर्क साधा.',
    mobileLabel: 'मोबाईल नंबर',
    emailLabel: 'ई-मेल पत्ता',
    issueLabel: 'समस्येचे संक्षिप्त वर्णन',
    submitSupport: 'तांत्रिक टीमकडे पाठवा',
    supportSubmitting: 'नोंदवत आहे...',
    supportSuccess: '🙏 आपली विनंती नोंदवली गेली आहे! तांत्रिक पथक लवकरच संपर्क करेल.',
    promptCategories: {
      forts: '🏰 गड-किल्ले',
      swarajya: '⚔️ स्वराज्य व इतिहास',
      sangam: '🤝 व्यवसाय संगम',
      seva: '🚑 आपत्कालीन व सेवा'
    },
    samplePrompts: [
      { text: 'शिवराज्याभिषेक सोहळा कधी झाला?', cat: 'swarajya' },
      { text: 'रायगड किल्ल्याबद्दल सविस्तर सांगा', cat: 'forts' },
      { text: 'प्रतापगड युद्धाचा इतिहास काय आहे?', cat: 'swarajya' },
      { text: 'अष्टप्रधान मंडळाची रचना कशी होती?', cat: 'swarajya' },
      { text: 'बिझनेस संगम म्हणजे काय आणि कसे जोडले जावे?', cat: 'sangam' },
      { text: 'आपत्कालीन रक्तदान साहाय्य कसे मिळवावे?', cat: 'seva' },
      { text: 'शिवनेरी किल्ल्याचे ऐतिहासिक महत्त्व सांगा', cat: 'forts' },
      { text: 'सिंधुदुर्ग जलदुर्गाची वैशिष्ट्ये काय आहेत?', cat: 'forts' }
    ],
    welcomeGreeting: '🙏 जय जिजाऊ! जय शिवराय! 🚩',
    welcomeMsg: 'मी Connect Maratha चा AI सहाय्यक आहे. मी आपल्याला मराठा इतिहास, ऐतिहासिक गड-किल्ले, स्वराज्य, व्यवसाय संगम व संस्थात्मक साहाय्याबद्दल अचूक माहिती देऊ शकतो. खालील विषयांपैकी एक निवडा किंवा स्वतःचा प्रश्न विचारा.'
  },
  hi: {
    langName: 'हिंदी',
    title: 'CONNECT मराठा AI सहायक',
    subtitle: 'मराठा इतिहास • ऐतिहासिक किले • स्वराज्य • व्यापार संगम • समाज सहायता',
    placeholder: 'अपना प्रश्न यहाँ लिखें (उदा. रायगढ़ किला, बिज़नेस संगम कैसे जुड़े)...',
    thinking: 'AI सोच रहा है...',
    voiceListening: 'सुन रहा हूँ... बोलिए...',
    voiceStart: 'प्रश्न बोलें',
    voiceStop: 'सुनना बंद करें',
    speakAnswer: 'उत्तर सुनें',
    stopSpeaking: 'आवाज़ बंद करें',
    voiceNotSupported: 'इस ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं है। कृपया लिखकर पूछें।',
    send: 'भेजें',
    clearChat: 'चैट साफ़ करें',
    feedbackQ: 'क्या आपको सही जानकारी मिली?',
    yes: 'हाँ, धन्यवाद! 👍',
    no: 'नहीं, अतिरिक्त सहायता चाहिए 👎',
    supportTitle: 'तकनीकी टीम सहायता',
    supportSubtitle: 'यदि आपका समाधान नहीं हुआ, तो सीधे तकनीकी टीम को टिकट भेजें।',
    mobileLabel: 'मोबाइल नंबर',
    emailLabel: 'ई-मेल पता',
    issueLabel: 'समस्या का संक्षिप्त विवरण',
    submitSupport: 'तकनीकी टीम को भेजें',
    supportSubmitting: 'भेज रहे हैं...',
    supportSuccess: '🙏 आपका अनुरोध दर्ज हो गया है! टीम जल्द ही संपर्क करेगी।',
    promptCategories: {
      forts: '🏰 ऐतिहासिक किले',
      swarajya: '⚔️ स्वराज्य व इतिहास',
      sangam: '🤝 व्यापार संगम',
      seva: '🚑 आपातकालीन सेवा'
    },
    samplePrompts: [
      { text: 'शिवराज्याभिषेक समारोह कब हुआ था?', cat: 'swarajya' },
      { text: 'रायगढ़ किले की विस्तृत जानकारी दें', cat: 'forts' },
      { text: 'प्रतापगढ़ के युद्ध का इतिहास क्या है?', cat: 'swarajya' },
      { text: 'अष्टप्रधान मंडल की रचना कैसी थी?', cat: 'swarajya' },
      { text: 'बिज़नेस संगम से व्यापारी कैसे जुड़ सकते हैं?', cat: 'sangam' },
      { text: 'आपातकालीन रक्तदान सहायता कैसे प्राप्त करें?', cat: 'seva' },
      { text: 'शिवनेरी किले का ऐतिहासिक महत्व क्या है?', cat: 'forts' }
    ],
    welcomeGreeting: '🙏 जय भवानी! जय शिवाजी! 🚩',
    welcomeMsg: 'मैं Connect Maratha का आधिकारिक AI सहायक हूँ। मराठा इतिहास, किलों, स्वराज्य, व्यापार और समाज सेवा से जुड़े किसी भी प्रश्न के लिए मुझसे पूछें।'
  },
  en: {
    langName: 'English',
    title: 'CONNECT Maratha AI Assistant',
    subtitle: 'Maratha History • Historic Forts • Swarajya • Business Sangam • Social Seva',
    placeholder: 'Type your question here (e.g., Raigad Fort, How to join Business Sangam)...',
    thinking: 'AI is processing...',
    voiceListening: 'Listening... Please speak...',
    voiceStart: 'Speak question',
    voiceStop: 'Stop listening',
    speakAnswer: 'Listen answer',
    stopSpeaking: 'Stop audio',
    voiceNotSupported: 'Speech recognition is not supported in this browser. Please type your query.',
    send: 'Send',
    clearChat: 'Clear Chat',
    feedbackQ: 'Did you find this answer helpful?',
    yes: 'Yes, thanks! 👍',
    no: 'Need more help 👎',
    supportTitle: 'Technical Support Desk',
    supportSubtitle: 'If the AI could not answer your query, escalate directly to our human engineering team.',
    mobileLabel: 'Mobile Number',
    emailLabel: 'Email Address',
    issueLabel: 'Describe your issue',
    submitSupport: 'Submit Support Ticket',
    supportSubmitting: 'Submitting...',
    supportSuccess: '🙏 Your ticket has been logged! Our support team will contact you shortly.',
    promptCategories: {
      forts: '🏰 Forts & Heritage',
      swarajya: '⚔️ Swarajya & History',
      sangam: '🤝 Business Sangam',
      seva: '🚑 Seva & Helpdesk'
    },
    samplePrompts: [
      { text: 'When was the grand Coronation (Shivrajyabhishek) held?', cat: 'swarajya' },
      { text: 'Tell me about Raigad Fort architecture and history', cat: 'forts' },
      { text: 'What is the history of the Battle of Pratapgad?', cat: 'swarajya' },
      { text: 'Explain the administrative structure of the Ashtapradhan Mandal', cat: 'swarajya' },
      { text: 'What is Business Sangam and how do entrepreneurs participate?', cat: 'sangam' },
      { text: 'How do I request emergency blood donation assistance?', cat: 'seva' },
      { text: 'What is the historical significance of Shivneri Fort?', cat: 'forts' },
      { text: 'What are the unique sea-defense features of Sindhudurg Fort?', cat: 'forts' }
    ],
    welcomeGreeting: '🙏 Jai Bhavani! Jai Shivaji! 🚩',
    welcomeMsg: 'Welcome to the official Connect Maratha AI Knowledge Agent. Ask me anything about Maratha history, heroic battles, historic hill & sea forts, the Swarajya administration, Business Sangam, and community services.'
  }
};

export default function ConnectMarathaAIAgentPage() {
  const [language, setLanguage] = useState('mr');
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Support ticket modal
  const [supportModal, setSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({ mobile: '', email: '', issue: '' });
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportStatus, setSupportStatus] = useState(null);

  // Chat message state
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      text: translations.mr.welcomeMsg,
      greeting: translations.mr.welcomeGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showFeedback: false
    }
  ]);

  const t = translations[language];
  const chatBottomRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Language switch handler
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const tr = translations[newLang];
    setMessages([
      {
        id: `init-${newLang}`,
        role: 'assistant',
        text: tr.welcomeMsg,
        greeting: tr.welcomeGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showFeedback: false
      }
    ]);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingIdx(null);
  };

  // Speech Recognition (Speech to Text)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t.voiceNotSupported);
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    const langCode = language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : 'mr-IN';
    rec.lang = langCode;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setInputMessage(transcript);
    };
    rec.onerror = (e) => {
      console.warn('Speech error:', e.error);
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;
    rec.start();
  };

  // Text to Speech (Audio playback)
  const speakText = (text, idx) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : 'mr-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);

    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  // Submit User Message to AI Endpoint
  const handleSendMessage = async (msgText) => {
    const query = (msgText || inputMessage).trim();
    if (!query || loading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        message: query,
        language: language,
        history: messages.slice(-4).map((m) => ({ role: m.role, text: m.text }))
      });

      const aiReply = res.data?.data?.response || res.data?.response || res.data?.data?.reply || 'माहिती उपलब्ध झाली नाही.';

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: aiReply,
        source: res.data?.data?.source || 'Knowledge Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showFeedback: true,
        feedbackGiven: null
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('AI chat error:', err);
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: language === 'mr'
          ? 'क्षमस्व! AI सर्व्हरशी संपर्क साधण्यात अडचण आली. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा किंवा थेट तांत्रिक साहाय्य मिळवा.'
          : language === 'hi'
          ? 'क्षमा करें! AI सर्वर से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें अथवा तकनीकी सहायता लें।'
          : 'Apologies, could not connect to the AI engine. Please retry or file a technical ticket below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showFeedback: false,
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Feedback
  const handleFeedback = (idx, value) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, feedbackGiven: value } : m))
    );
    if (value === 'no') {
      setSupportModal(true);
    }
  };

  // Submit Technical Support Ticket
  const handleSubmitSupport = async (e) => {
    e.preventDefault();
    if (!supportForm.mobile) return;

    setSupportSubmitting(true);
    setSupportStatus(null);

    try {
      await apiClient.post('/ai/support', {
        mobile: supportForm.mobile,
        email: supportForm.email,
        issue: supportForm.issue || 'AI मदत प्रतिसाद समाधानकारक नाही.',
        language: language
      });
      setSupportStatus({ type: 'success', text: t.supportSuccess });
      setSupportForm({ mobile: '', email: '', issue: '' });
      setTimeout(() => {
        setSupportModal(false);
        setSupportStatus(null);
      }, 3500);
    } catch (err) {
      setSupportStatus({
        type: 'error',
        text: err.response?.data?.message || 'तिकीट नोंदवण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
      });
    } finally {
      setSupportSubmitting(false);
    }
  };

  const filteredPrompts = t.samplePrompts.filter(
    (p) => activeCategory === 'all' || p.cat === activeCategory
  );

  return (
    <div style={{ background: '#0a0d14', color: '#f1f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Heritage App Header */}
      <header style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #431407 100%)',
        borderBottom: '2px solid rgba(245, 158, 11, 0.4)',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F59E0B, #DC2626)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
            }}>
              🚩
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                  {t.title}
                </h1>
                <span style={{ background: '#10B981', color: '#000', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                  🟢 LIVE RAG 2.0
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#FCD34D' }}>
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Language Switcher & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '3px' }}>
              {['mr', 'hi', 'en'].map((lng) => (
                <button
                  key={lng}
                  onClick={() => handleLanguageChange(lng)}
                  style={{
                    background: language === lng ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'transparent',
                    color: language === lng ? '#000000' : '#E2E8F0',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                  {translations[lng].langName}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSupportModal(true)}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#FCA5A5',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
              <span>🎫</span>
              <span>{t.supportTitle}</span>
            </button>

            <Link
              to="/crm"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: '#94A3B8',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
              <span>←</span>
              <span>CRM कन्सोल</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', padding: '16px' }}>
        
        {/* Suggestion Prompt Pills */}
        <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              💡 जलद विचारणा विषय (Suggested Prompts):
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setActiveCategory('all')}
                style={{
                  background: activeCategory === 'all' ? '#F59E0B' : 'rgba(255,255,255,0.05)',
                  color: activeCategory === 'all' ? '#000' : '#CBD5E1',
                  border: 'none',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}>
                सर्व (All)
              </button>
              {Object.entries(t.promptCategories).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  style={{
                    background: activeCategory === key ? '#F59E0B' : 'rgba(255,255,255,0.05)',
                    color: activeCategory === key ? '#000' : '#CBD5E1',
                    border: 'none',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {filteredPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.text)}
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#FDE68A',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '16px',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)';
                  e.currentTarget.style.borderColor = '#F59E0B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.25)';
                }}>
                {p.text}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Container */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(180deg, #0f172a 0%, #090d16 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px',
          overflowY: 'auto',
          minHeight: '440px',
          maxHeight: 'calc(100vh - 350px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id || idx}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                {!isUser && (
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #F59E0B, #DC2626)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                  }}>
                    🚩
                  </div>
                )}

                <div style={{
                  maxWidth: '78%',
                  background: isUser
                    ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                    : 'rgba(30, 41, 59, 0.95)',
                  border: isUser
                    ? '1px solid rgba(59, 130, 246, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '16px 20px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  color: isUser ? '#FFFFFF' : '#E2E8F0'
                }}>
                  {m.greeting && (
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#FCD34D', marginBottom: '6px' }}>
                      {m.greeting}
                    </div>
                  )}

                  <div style={{
                    fontSize: '0.92rem',
                    lineHeight: '1.65',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'Inter, Baloo 2, system-ui, sans-serif'
                  }}>
                    {m.text}
                  </div>

                  {/* Message Metadata & Audio Controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '10px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '0.72rem',
                    color: isUser ? '#BFDBFE' : '#94A3B8',
                    gap: '12px'
                  }}>
                    <span>{m.timestamp}</span>

                    {!isUser && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => speakText(m.text, idx)}
                          style={{
                            background: speakingIdx === idx ? '#EF4444' : 'rgba(255,255,255,0.08)',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                          <span>{speakingIdx === idx ? '⏹️' : '🔊'}</span>
                          <span>{speakingIdx === idx ? t.stopSpeaking : t.speakAnswer}</span>
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(m.text);
                            alert('मजकूर कॉपी झाला!');
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            color: '#CBD5E1',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            cursor: 'pointer'
                          }}>
                          📋 कॉपी
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Feedback Mechanism */}
                  {m.showFeedback && m.feedbackGiven === null && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      background: 'rgba(0,0,0,0.25)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
                        {t.feedbackQ}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleFeedback(idx, 'yes')}
                          style={{
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#34D399',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}>
                          {t.yes}
                        </button>
                        <button
                          onClick={() => handleFeedback(idx, 'no')}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#F87171',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}>
                          {t.no}
                        </button>
                      </div>
                    </div>
                  )}

                  {m.feedbackGiven === 'yes' && (
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#34D399', fontWeight: 600 }}>
                      ✓ आपल्या अभिप्रायाबद्दल धन्यवाद!
                    </div>
                  )}
                  {m.feedbackGiven === 'no' && (
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#FCA5A5' }}>
                      कृपया अधिक माहितीसाठी खालील 'तांत्रिक टीमची मदत' बटण वापरा.
                    </div>
                  )}
                </div>

                {isUser && (
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0
                  }}>
                    👤
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking / Loading indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #F59E0B, #DC2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                🚩
              </div>
              <div style={{
                background: 'rgba(30, 41, 59, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px 16px 16px 4px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#FCD34D',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                <span className="spin" style={{ display: 'inline-block' }}>⚙️</span>
                <span>{t.thinking}</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar & Voice Controls */}
        <div style={{
          marginTop: '16px',
          background: '#111827',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '16px',
          padding: '12px 16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
        }}>
          {isListening && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              background: 'rgba(239, 68, 68, 0.15)',
              borderRadius: '8px',
              marginBottom: '8px',
              color: '#FCA5A5',
              fontSize: '0.8rem',
              fontWeight: 700
            }}>
              <span style={{ animation: 'pulse 1s infinite' }}>🔴</span>
              <span>{t.voiceListening}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {/* Mic Speech Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              title={isListening ? t.voiceStop : t.voiceStart}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: isListening ? '#EF4444' : 'rgba(245, 158, 11, 0.15)',
                color: isListening ? '#FFFFFF' : '#F59E0B',
                border: isListening ? '2px solid #DC2626' : '1px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}>
              {isListening ? '🛑' : '🎤'}
            </button>

            {/* Query Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t.placeholder}
              style={{
                flex: 1,
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                outline: 'none'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#F59E0B')}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.15)')}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              style={{
                background: !inputMessage.trim() || loading
                  ? 'rgba(255,255,255,0.1)'
                  : 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: !inputMessage.trim() || loading ? '#64748B' : '#000000',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 22px',
                fontWeight: 900,
                fontSize: '0.9rem',
                cursor: !inputMessage.trim() || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0,
                boxShadow: inputMessage.trim() ? '0 4px 15px rgba(245, 158, 11, 0.4)' : 'none'
              }}>
              <span>{t.send}</span>
              <span>➔</span>
            </button>
          </form>
        </div>
      </div>

      {/* Technical Support Modal */}
      {supportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#111827',
            border: '2px solid rgba(245, 158, 11, 0.5)',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>🛠️</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#FCD34D', fontWeight: 800 }}>
                  {t.supportTitle}
                </h3>
              </div>
              <button
                onClick={() => setSupportModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.4rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#94A3B8', lineHeight: '1.5' }}>
              {t.supportSubtitle}
            </p>

            {supportStatus && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                background: supportStatus.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                color: supportStatus.type === 'success' ? '#34D399' : '#F87171',
                border: `1px solid ${supportStatus.type === 'success' ? '#10B981' : '#EF4444'}`,
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                {supportStatus.text}
              </div>
            )}

            <form onSubmit={handleSubmitSupport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                  {t.mobileLabel} *
                </label>
                <input
                  type="tel"
                  required
                  value={supportForm.mobile}
                  onChange={(e) => setSupportForm({ ...supportForm, mobile: e.target.value })}
                  placeholder="उदा. 9876543210"
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#FFF',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                  {t.emailLabel} (पर्यायी)
                </label>
                <input
                  type="email"
                  value={supportForm.email}
                  onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                  placeholder="उदा. info@connectmaratha.org"
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#FFF',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                  {t.issueLabel} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={supportForm.issue}
                  onChange={(e) => setSupportForm({ ...supportForm, issue: e.target.value })}
                  placeholder="आपला प्रश्न किंवा समस्या थोडक्यात सांगा..."
                  style={{
                    width: '100%',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#FFF',
                    boxSizing: 'border-box',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSupportModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#CBD5E1',
                    padding: '8px 16px',
                    cursor: 'pointer'
                  }}>
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={supportSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #DC2626)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontWeight: 800,
                    cursor: supportSubmitting ? 'not-allowed' : 'pointer'
                  }}>
                  {supportSubmitting ? t.supportSubmitting : t.submitSupport}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
