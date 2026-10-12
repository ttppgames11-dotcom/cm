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
    thinking: 'AI विचार कर रहा है...',
    voiceListening: 'सुन रहा हूँ... बोलिए...',
    voiceStart: 'बोलकर पूछें',
    voiceStop: 'बोलना रोकें',
    speakAnswer: 'उत्तर सुनें',
    stopSpeaking: 'आवाज़ बंद करें',
    voiceNotSupported: 'इस ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं है।',
    send: 'भेजें',
    clearChat: 'चैट साफ़ करें',
    feedbackQ: 'क्या आपको संतोषजनक उत्तर मिला?',
    yes: 'हाँ, धन्यवाद! 👍',
    no: 'नहीं, सहायता चाहिए 👎',
    supportTitle: 'तकनीकी सहायता',
    supportSubtitle: 'यदि आपके प्रश्न का समाधान नहीं हुआ, तो हमारी तकनीकी टीम से संपर्क करें।',
    mobileLabel: 'मोबाइल नंबर',
    emailLabel: 'ई-मेल पता',
    issueLabel: 'समस्या का संक्षिप्त विवरण',
    submitSupport: 'तकनीकी टीम को भेजें',
    supportSubmitting: 'दर्ज हो रहा है...',
    supportSuccess: '🙏 आपका अनुरोध दर्ज कर लिया गया है! तकनीकी टीम जल्द संपर्क करेगी।',
    promptCategories: {
      forts: '🏰 ऐतिहासिक किले',
      swarajya: '⚔️ स्वराज्य व इतिहास',
      sangam: '🤝 व्यापार संगम',
      seva: '🚑 आपातकालीन सेवा'
    },
    samplePrompts: [
      { text: 'शिवराज्याभिषेक कब और कहाँ हुआ था?', cat: 'swarajya' },
      { text: 'रायगढ़ किले की प्रमुख विशेषताएँ क्या हैं?', cat: 'forts' },
      { text: 'प्रतापगढ़ के युद्ध का इतिहास क्या है?', cat: 'swarajya' },
      { text: 'अष्टप्रधान मंडल की संरचना कैसी थी?', cat: 'swarajya' },
      { text: 'बिज़नेस संगम से व्यापारी कैसे जुड़ सकते हैं?', cat: 'sangam' },
      { text: '२४x७ रक्त सहायता कैसे प्राप्त करें?', cat: 'seva' }
    ],
    welcomeGreeting: '🙏 जय भवानी! जय शिवाजी! 🚩',
    welcomeMsg: 'मैं Connect Maratha का AI सहायक हूँ। मैं मराठा इतिहास, ऐतिहासिक किलों, स्वराज्य तथा बिज़नेस संगम के बारे में आपकी सहायता कर सकता हूँ।'
  },
  en: {
    langName: 'English',
    title: 'CONNECT MARATHA AI ASSISTANT',
    subtitle: 'Maratha History • Heritage Forts • Swarajya • Business Sangam • 24x7 Seva',
    placeholder: 'Type your question here (e.g. Raigad Fort, Business Sangam networking)...',
    thinking: 'AI is thinking...',
    voiceListening: 'Listening... please speak...',
    voiceStart: 'Speak Query',
    voiceStop: 'Stop Listening',
    speakAnswer: 'Listen Answer',
    stopSpeaking: 'Stop Audio',
    voiceNotSupported: 'Speech recognition is not supported in this browser.',
    send: 'Send',
    clearChat: 'Clear Chat',
    feedbackQ: 'Was this answer helpful?',
    yes: 'Yes, thanks! 👍',
    no: 'Need more help 👎',
    supportTitle: 'Technical Support Desk',
    supportSubtitle: 'If the AI response was not satisfactory, raise a priority ticket with our central team.',
    mobileLabel: 'Mobile Number',
    emailLabel: 'Email Address',
    issueLabel: 'Describe your issue or question',
    submitSupport: 'Submit Support Ticket',
    supportSubmitting: 'Submitting...',
    supportSuccess: '🙏 Your support ticket has been registered! Our team will contact you shortly.',
    promptCategories: {
      forts: '🏰 Heritage Forts',
      swarajya: '⚔️ Swarajya & History',
      sangam: '🤝 Business Sangam',
      seva: '🚑 24x7 Emergency Seva'
    },
    samplePrompts: [
      { text: 'When was the Grand Coronation (Shivrajyabhishek) held?', cat: 'swarajya' },
      { text: 'Tell me about the historical significance of Raigad Fort', cat: 'forts' },
      { text: 'What happened at the Battle of Pratapgad?', cat: 'swarajya' },
      { text: 'What is Business Sangam and how do B2B referrals work?', cat: 'sangam' },
      { text: 'How do I access 24x7 emergency blood assistance?', cat: 'seva' }
    ],
    welcomeGreeting: '🙏 Jai Jijau! Jai Shivrai! 🚩',
    welcomeMsg: 'I am the Connect Maratha AI Assistant. I can assist you with verified knowledge on Maratha history, historic hill & sea forts, Swarajya governance, Business Sangam, and emergency blood services.'
  }
};

export default function ConnectMarathaAIAgentPage() {
  const [language, setLanguage] = useState('mr');
  const t = translations[language];

  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'assistant',
      greeting: t.welcomeGreeting,
      text: t.welcomeMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'System'
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Support Desk Modal
  const [supportModal, setSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({ mobile: '', email: '', issue: '' });
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportStatus, setSupportStatus] = useState(null);

  const chatBottomRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Language change handler
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const newT = translations[newLang];
    setMessages([
      {
        id: `init-${newLang}-${Date.now()}`,
        role: 'assistant',
        greeting: newT.welcomeGreeting,
        text: newT.welcomeMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'System'
      }
    ]);
  };

  // Speech Recognition (Mic Input)
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
      let aiReply = '';
      try {
        const res = await (apiClient.aiChat
          ? apiClient.aiChat(query, language, messages.slice(-4).map((m) => ({ role: m.role, text: m.text })))
          : apiClient.post('/ai/chat', {
              message: query,
              language: language,
              history: messages.slice(-4).map((m) => ({ role: m.role, text: m.text }))
            }));

        aiReply = res?.data?.response || res?.response || res?.data?.reply || res?.reply || '';
      } catch (fErr) {
        console.warn('Backend fetch fallback:', fErr.message);
      }

      if (!aiReply) {
        aiReply = getClientFallback(query, language);
      }

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: aiReply,
        source: 'Knowledge Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showFeedback: true,
        feedbackGiven: null
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackText = getClientFallback(query, language);
      const errorMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: fallbackText,
        source: 'Knowledge Engine (Local)',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showFeedback: true,
        feedbackGiven: null
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
    <div style={{ background: '#FFFDF9', color: '#1E293B', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Heritage App Header (Royal Bhagwa Gradient) */}
      <header style={{
        background: 'linear-gradient(135deg, #EA580C 0%, #D97706 60%, #C2410C 100%)',
        borderBottom: '2px solid #FDBA74',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(234, 88, 12, 0.25)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#FFFFFF',
              color: '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)'
            }}>
              🚩
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                  {t.title}
                </h1>
                <span style={{ background: '#FFFFFF', color: '#EA580C', fontSize: '0.65rem', fontWeight: 900, padding: '2px 8px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                  🟢 LIVE RAG 2.0
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#FEF08A', fontWeight: 600 }}>
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Language Switcher & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '8px', padding: '3px' }}>
              {['mr', 'hi', 'en'].map((lng) => (
                <button
                  key={lng}
                  onClick={() => handleLanguageChange(lng)}
                  style={{
                    background: language === lng ? '#FFFFFF' : 'transparent',
                    color: language === lng ? '#EA580C' : '#FFFFFF',
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
                background: '#FFFFFF',
                color: '#DC2626',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}>
              <span>🎫</span>
              <span>{t.supportTitle}</span>
            </button>

            <Link
              to="/crm"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
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
        <div style={{ background: '#FFFFFF', border: '1px solid #FED7AA', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', boxShadow: '0 2px 10px rgba(234, 88, 12, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7C2D12', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              💡 जलद विचारणा विषय (Suggested Prompts):
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setActiveCategory('all')}
                style={{
                  background: activeCategory === 'all' ? '#EA580C' : '#FFF7ED',
                  color: activeCategory === 'all' ? '#FFFFFF' : '#7C2D12',
                  border: '1px solid #FED7AA',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}>
                सर्व (All)
              </button>
              {Object.entries(t.promptCategories).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  style={{
                    background: activeCategory === key ? '#EA580C' : '#FFF7ED',
                    color: activeCategory === key ? '#FFFFFF' : '#7C2D12',
                    border: '1px solid #FED7AA',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
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
                  background: '#FFF7ED',
                  color: '#C2410C',
                  border: '1px solid #FED7AA',
                  borderRadius: '16px',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FFEDD5';
                  e.currentTarget.style.borderColor = '#EA580C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFF7ED';
                  e.currentTarget.style.borderColor = '#FED7AA';
                }}>
                {p.text}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Container (Pure White & Bhagwa) */}
        <div style={{
          flex: 1,
          background: '#FFFFFF',
          border: '1.5px solid #FED7AA',
          borderRadius: '16px',
          padding: '24px',
          overflowY: 'auto',
          minHeight: '440px',
          maxHeight: 'calc(100vh - 350px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 4px 20px rgba(234, 88, 12, 0.06)'
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
                    background: 'linear-gradient(135deg, #EA580C, #D97706)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
                  }}>
                    🚩
                  </div>
                )}

                <div style={{
                  maxWidth: '78%',
                  background: isUser
                    ? 'linear-gradient(135deg, #EA580C 0%, #D97706 100%)'
                    : '#FFF7ED',
                  border: isUser
                    ? 'none'
                    : '1.5px solid #FED7AA',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '16px 20px',
                  boxShadow: isUser
                    ? '0 4px 14px rgba(234, 88, 12, 0.25)'
                    : '0 3px 12px rgba(234, 88, 12, 0.06)',
                  color: isUser ? '#FFFFFF' : '#1E293B'
                }}>
                  {m.greeting && (
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: isUser ? '#FFFFFF' : '#C2410C', marginBottom: '6px' }}>
                      {m.greeting}
                    </div>
                  )}

                  <div style={{
                    fontSize: '0.92rem',
                    lineHeight: '1.65',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'Inter, Baloo 2, system-ui, sans-serif',
                    fontWeight: 500
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
                    borderTop: `1px solid ${isUser ? 'rgba(255,255,255,0.2)' : '#FED7AA'}`,
                    fontSize: '0.72rem',
                    color: isUser ? '#FFEDD5' : '#7C2D12',
                    gap: '12px'
                  }}>
                    <span>{m.timestamp}</span>

                    {!isUser && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => speakText(m.text, idx)}
                          style={{
                            background: speakingIdx === idx ? '#DC2626' : '#FFFFFF',
                            color: speakingIdx === idx ? '#FFFFFF' : '#EA580C',
                            border: '1px solid #FED7AA',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
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
                            background: '#FFFFFF',
                            color: '#7C2D12',
                            border: '1px solid #FED7AA',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
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
                      background: '#FFFFFF',
                      border: '1px solid #FED7AA',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: '#7C2D12', fontWeight: 600 }}>
                        {t.feedbackQ}
                      </span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleFeedback(idx, 'yes')}
                          style={{
                            background: '#DCFCE7',
                            color: '#16A34A',
                            border: '1px solid #86EFAC',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}>
                          {t.yes}
                        </button>
                        <button
                          onClick={() => handleFeedback(idx, 'no')}
                          style={{
                            background: '#FEE2E2',
                            color: '#DC2626',
                            border: '1px solid #FCA5A5',
                            borderRadius: '6px',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            fontWeight: 700
                          }}>
                          {t.no}
                        </button>
                      </div>
                    </div>
                  )}

                  {m.feedbackGiven === 'yes' && (
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#16A34A', fontWeight: 700 }}>
                      ✓ आपल्या अभिप्रायाबद्दल धन्यवाद!
                    </div>
                  )}
                  {m.feedbackGiven === 'no' && (
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>
                      कृपया अधिक माहितीसाठी खालील 'तांत्रिक टीमची मदत' बटण वापरा.
                    </div>
                  )}
                </div>

                {isUser && (
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#EA580C',
                    color: '#FFFFFF',
                    border: '2px solid #FED7AA',
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
                background: 'linear-gradient(135deg, #EA580C, #D97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                🚩
              </div>
              <div style={{
                background: '#FFF7ED',
                border: '1.5px solid #FED7AA',
                borderRadius: '16px 16px 16px 4px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#EA580C',
                fontSize: '0.85rem',
                fontWeight: 700
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
          background: '#FFFFFF',
          border: '1.5px solid #FED7AA',
          borderRadius: '16px',
          padding: '12px 16px',
          boxShadow: '0 8px 30px rgba(234, 88, 12, 0.08)'
        }}>
          {isListening && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 12px',
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              marginBottom: '8px',
              color: '#DC2626',
              fontSize: '0.8rem',
              fontWeight: 800
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
                background: isListening ? '#DC2626' : '#FFF7ED',
                color: isListening ? '#FFFFFF' : '#EA580C',
                border: isListening ? '2px solid #DC2626' : '1.5px solid #FED7AA',
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
                background: '#FFF7ED',
                border: '1.5px solid #FED7AA',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#1E293B',
                fontSize: '0.92rem',
                outline: 'none',
                fontWeight: 600
              }}
              onFocus={(e) => (e.target.style.borderColor = '#EA580C')}
              onBlur={(e) => (e.target.style.borderColor = '#FED7AA')}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              style={{
                background: !inputMessage.trim() || loading
                  ? '#E2E8F0'
                  : 'linear-gradient(135deg, #EA580C, #D97706)',
                color: !inputMessage.trim() || loading ? '#94A3B8' : '#FFFFFF',
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
                boxShadow: inputMessage.trim() ? '0 4px 15px rgba(234, 88, 12, 0.35)' : 'none'
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
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '2px solid #EA580C',
            borderRadius: '16px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(234, 88, 12, 0.25)',
            color: '#1E293B'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #FED7AA', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>🛠️</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#431407', fontWeight: 900 }}>
                  {t.supportTitle}
                </h3>
              </div>
              <button
                onClick={() => setSupportModal(false)}
                style={{ background: 'none', border: 'none', color: '#EA580C', fontSize: '1.4rem', cursor: 'pointer', fontWeight: 900 }}>
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#7C2D12', lineHeight: '1.5' }}>
              {t.supportSubtitle}
            </p>

            {supportStatus && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                background: supportStatus.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                color: supportStatus.type === 'success' ? '#16A34A' : '#DC2626',
                border: `1px solid ${supportStatus.type === 'success' ? '#86EFAC' : '#FCA5A5'}`,
                fontSize: '0.85rem',
                fontWeight: 700
              }}>
                {supportStatus.text}
              </div>
            )}

            <form onSubmit={handleSubmitSupport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#7C2D12', marginBottom: '4px', fontWeight: 700 }}>
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
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#1E293B',
                    boxSizing: 'border-box',
                    fontWeight: 600
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#7C2D12', marginBottom: '4px', fontWeight: 700 }}>
                  {t.emailLabel} (पर्यायी)
                </label>
                <input
                  type="email"
                  value={supportForm.email}
                  onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })}
                  placeholder="उदा. info@connectmaratha.org"
                  style={{
                    width: '100%',
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#1E293B',
                    boxSizing: 'border-box',
                    fontWeight: 600
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#7C2D12', marginBottom: '4px', fontWeight: 700 }}>
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
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#1E293B',
                    boxSizing: 'border-box',
                    resize: 'none',
                    fontWeight: 600
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSupportModal(false)}
                  style={{
                    background: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    borderRadius: '8px',
                    color: '#7C2D12',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}>
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={supportSubmitting}
                  style={{
                    background: 'linear-gradient(135deg, #EA580C, #D97706)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontWeight: 800,
                    cursor: supportSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
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
