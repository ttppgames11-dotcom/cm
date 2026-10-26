import React, { useRef, useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";

// ==================================================
// SESSION ID
// ==================================================
function createSessionId() {
  return "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
}

// ==================================================
// TRANSLATIONS
// ==================================================
const translations = {
  en: {
    language: "Language",
    languageName: "English",
    subtitle: "Maratha History • Forts • Swarajya • Businesses",
    placeholder: "Type your question here...",
    thinking: "AI is thinking",
    feedbackQuestion: "Did you get the answer you were looking for?",
    yes: "Yes",
    no: "No",
    noResponse: "Sorry that I couldn't provide the information you were looking for. 🙏 Please try asking in another way or contact our technical team below.",
    thankYou: "🙏 Thank you for using Connect Maratha AI Agent!",
    thankYouDescription: "We hope you enjoyed exploring Maratha history, forts, Swarajya, and our community business ecosystem.",
    visitWebsite: "🌐 Visit Connect Maratha Website",
    supportTitle: "Technical Team Support",
    supportDescription: "Please share your contact details so our technical team can assist you.",
    mobileLabel: "Mobile Number",
    emailLabel: "Email Address",
    issueLabel: "Describe your issue",
    mobilePlaceholder: "Enter 10-digit mobile number",
    emailPlaceholder: "Enter email address",
    issuePlaceholder: "Tell us about your issue or question...",
    submitSupport: "Contact Technical Team",
    supportSubmitting: "Submitting...",
    supportSuccess: "🙏 Thank you! Your request has been sent to our technical team. They will contact you soon.",
    supportError: "Sorry, we could not submit your support request. Please try again.",
    invalidMobile: "Please enter a valid 10-digit mobile number.",
    invalidEmail: "Please enter a valid email address.",
    requiredSupportFields: "Please fill in all required fields.",
    connectionError: "Sorry, I could not connect to the AI server. Please try again.",
    voiceListening: "Listening...",
    voiceStart: "Speak your question",
    voiceStop: "Stop listening",
    speakAnswer: "Listen to answer",
    stopSpeaking: "Stop speaking",
    voiceNotSupported: "Speech recognition is not supported in this browser.",
    welcome: (
      <>
        <div style={{ textAlign: "center", fontSize: "16px", fontWeight: "700", color: "#f57c00", marginBottom: "8px" }}>
          🙏 Hello! 🚩
        </div>
        <div style={{ textAlign: "center", fontSize: "15px", fontWeight: "800", color: "#222", marginBottom: "12px" }}>
          Welcome to <strong>CONNECT Maratha Assistant!</strong>
        </div>
        <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", marginBottom: "6px" }}>
          🏰 Discover the stories of <strong>Maratha Forts</strong>
        </div>
        <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", marginBottom: "6px" }}>
          ⚔️ Explore the spirit of <strong>Maratha Bravery & History</strong>
        </div>
        <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", marginBottom: "6px" }}>
          💼 Learn about <strong>Business Sangam & Services</strong>
        </div>
        <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", marginBottom: "12px" }}>
          🚩 Learn about the glorious history of <strong>Swarajya</strong>
        </div>
        <div style={{ textAlign: "center", color: "#f57c00", fontSize: "13px", marginBottom: "8px" }}>
          ✦ ✦ ✦
        </div>
        <div style={{ textAlign: "center", fontSize: "13px", fontWeight: "700", color: "#f57c00" }}>
          Jai Bhavani! Jai Shivaji! 🚩
        </div>
      </>
    )
  },
  hi: {
    language: "भाषा",
    languageName: "हिंदी",
    subtitle: "मराठा इतिहास • गढ़-किले • स्वराज्य • व्यवसाय",
    placeholder: "अपना प्रश्न यहाँ लिखें...",
    thinking: "AI विचार कर रहा है",
    feedbackQuestion: "क्या आपको अपना उत्तर मिला?",
    yes: "हाँ",
    no: "नहीं",
    noResponse: "क्षमा करें, मैं यह जानकारी नहीं ढूंढ सका। 🙏 कृपया प्रश्न पुनः पूछें अथवा तकनीकी टीम से संपर्क करें।",
    thankYou: "🙏 कनेक्ट मराठा AI सहायक उपयोग करने के लिए धन्यवाद!",
    thankYouDescription: "आशा है कि आपको मराठा इतिहास, किलों और व्यवसाय संगम की जानकारी पसंद आई होगी।",
    visitWebsite: "🌐 कनेक्ट मराठा वेबसाइट पर जाएं",
    supportTitle: "तकनीकी टीम सहायता",
    supportDescription: "कृपया संपर्क विवरण दें ताकि तकनीकी टीम आपसे संपर्क कर सके।",
    mobileLabel: "मोबाइल नंबर",
    emailLabel: "ई-मेल",
    issueLabel: "समस्या का विवरण",
    mobilePlaceholder: "10 अंकों का मोबाइल नंबर",
    emailPlaceholder: "ई-मेल पता",
    issuePlaceholder: "अपनी समस्या या प्रश्न लिखें...",
    submitSupport: "तकनीकी टीम से संपर्क करें",
    supportSubmitting: "भेजा जा रहा है...",
    supportSuccess: "🙏 धन्यवाद! आपका अनुरोध तकनीकी टीम को भेज दिया गया है।",
    supportError: "क्षमा करें, अनुरोध भेजा नहीं जा सका।",
    invalidMobile: "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।",
    invalidEmail: "कृपया वैध ई-मेल पता दर्ज करें।",
    requiredSupportFields: "कृपया सभी फ़ील्ड भरें।",
    connectionError: "सर्वर से संपर्क नहीं हो सका।",
    voiceListening: "सुन रहा हूँ...",
    voiceStart: "बोलें",
    voiceStop: "रोकें",
    speakAnswer: "उत्तर सुनें",
    stopSpeaking: "रोकें",
    voiceNotSupported: "स्पीच रिकग्निशन उपलब्ध नहीं है।",
    welcome: (
      <>
        <div style={{ textAlign: "center", fontSize: "16px", fontWeight: "700", color: "#f57c00", marginBottom: "8px" }}>
          🙏 नमस्ते! 🚩
        </div>
        <div style={{ textAlign: "center", fontSize: "15px", fontWeight: "800", color: "#222", marginBottom: "12px" }}>
          <strong>CONNECT मराठा सहायक</strong> में आपका स्वागत है!
        </div>
        <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", marginBottom: "6px" }}>
          🏰 <strong>ऐतिहासिक किलों</strong> को जानें
        </div>
        <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", marginBottom: "6px" }}>
          ⚔️ <strong>मराठा शौर्यगाथाओं</strong> को समझें
        </div>
        <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", marginBottom: "6px" }}>
          💼 <strong>बिजनेस संगम व सेवाओं</strong> की जानकारी लें
        </div>
        <div style={{ textAlign: "center", color: "#f57c00", fontSize: "13px", margin: "10px 0 6px" }}>
          ✦ ✦ ✦
        </div>
        <div style={{ textAlign: "center", fontSize: "13px", fontWeight: "700", color: "#f57c00" }}>
          जय भवानी! जय शिवाजी! 🚩
        </div>
      </>
    )
  },
  mr: {
    language: "भाषा",
    languageName: "मराठी",
    subtitle: "मराठा इतिहास • गड-किल्ले • स्वराज्य • व्यवसाय",
    placeholder: "तुमचा प्रश्न येथे लिहा...",
    thinking: "AI विचार करत आहे",
    feedbackQuestion: "तुम्हाला हवा असलेला उत्तर मिळाला का?",
    yes: "होय",
    no: "नाही",
    noResponse: "तुम्ही शोधत असलेली माहिती सापडली नाही. 🙏 कृपया प्रश्न वेगळ्या पद्धतीने विचारा किंवा खालील तांत्रिक टीमशी संपर्क साधा.",
    thankYou: "🙏 Connect Maratha AI Agent वापरल्याबद्दल धन्यवाद!",
    thankYouDescription: "आम्हाला आशा आहे की तुम्हाला मराठा इतिहास, गड-किल्ले, व्यवसाय संगम आणि सेवांची माहिती आवडली असेल.",
    visitWebsite: "🌐 Connect Maratha वेबसाइटला भेट द्या",
    supportTitle: "तांत्रिक टीमची मदत",
    supportDescription: "कृपया आपली संपर्क माहिती द्या, जेणेकरून आमची तांत्रिक टीम आपल्याशी संपर्क करू शकेल.",
    mobileLabel: "मोबाईल नंबर",
    emailLabel: "ई-मेल पत्ता",
    issueLabel: "तुमची समस्या सांगा",
    mobilePlaceholder: "१० अंकी मोबाईल नंबर लिहा",
    emailPlaceholder: "ई-मेल पत्ता लिहा",
    issuePlaceholder: "समस्या किंवा प्रश्न येथे लिहा...",
    submitSupport: "तांत्रिक टीमशी संपर्क करा",
    supportSubmitting: "पाठवत आहे...",
    supportSuccess: "🙏 धन्यवाद! आपली विनंती तांत्रिक टीमकडे पाठवण्यात आली आहे.",
    supportError: "क्षमस्व, विनंती पाठवण्यात अडचण आली.",
    invalidMobile: "कृपया १० अंकी वैध मोबाईल नंबर टाका.",
    invalidEmail: "कृपया वैध ई-मेल पत्ता टाका.",
    requiredSupportFields: "सर्व माहिती भरणे आवश्यक आहे.",
    connectionError: "AI सर्व्हरशी संपर्क होऊ शकला नाही.",
    voiceListening: "ऐकत आहे...",
    voiceStart: "प्रश्न बोला",
    voiceStop: "थांबवा",
    speakAnswer: "उत्तर ऐका",
    stopSpeaking: "थांबवा",
    voiceNotSupported: "ब्राउझरमध्ये स्पीच रिकग्निशन उपलब्ध नाही.",
    welcome: (
      <>
        <div style={{ textAlign: "center", fontSize: "16px", fontWeight: "700", color: "#f57c00", marginBottom: "8px" }}>
          🙏 नमस्कार! 🚩
        </div>
        <div style={{ textAlign: "center", fontSize: "15px", fontWeight: "800", color: "#222", marginBottom: "12px" }}>
          <strong>CONNECT मराठा सहायक</strong> मध्ये आपले सहर्ष स्वागत!
        </div>
        <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", marginBottom: "6px" }}>
          🏰 <strong>अभेद्य गड-किल्ल्यांचा</strong> गौरवशाली इतिहास
        </div>
        <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", marginBottom: "6px" }}>
          ⚔️ <strong>शूरवीर मावळ्यांच्या</strong> शौर्यगाथा
        </div>
        <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", marginBottom: "6px" }}>
          💼 <strong>व्यवसाय संगम, नोकरी व सेवा</strong> परिसंस्था
        </div>
        <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444", marginBottom: "12px" }}>
          🚩 <strong>हिंदवी स्वराज्याचा</strong> अमर प्रेरणादायी कालपट
        </div>
        <div style={{ textAlign: "center", color: "#f57c00", fontSize: "13px", marginBottom: "8px" }}>
          ✦ ✦ ✦
        </div>
        <div style={{ textAlign: "center", fontSize: "14px", fontWeight: "800", color: "#f57c00" }}>
          जय भवानी! जय शिवाजी! 🚩
        </div>
      </>
    )
  }
};

export default function AiAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLang, changeLanguage } = useLanguage();
  const [language, setLanguage] = useState(() => currentLang || "mr");
  const [sessionId] = useState(() => createSessionId());
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      type: "welcome",
      text: null
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportMobile, setSupportMobile] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportIssue, setSupportIssue] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Sync with global site language if changed externally
  useEffect(() => {
    if (currentLang && currentLang !== language && ['mr', 'en', 'hi'].includes(currentLang)) {
      setLanguage(currentLang);
    }
  }, [currentLang]);

  const t = translations[language] || translations.mr;

  const floatingGreetings = {
    en: "Hi! 👋",
    hi: "नमस्ते! 🙏",
    mr: "नमस्कार! 🙏"
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages, loading]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    
    // 1. Transmit to global language transmitter context
    if (changeLanguage) {
      changeLanguage(newLang);
    }

    // 2. Direct broadcast to Google Translate & Cookies
    try {
      localStorage.setItem('cm_preferred_lang', newLang);
      const hostname = window.location.hostname;
      const path = 'path=/;';
      if (newLang === 'mr') {
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${path}`;
        document.cookie = `googtrans=/auto/mr; ${path}`;
      } else {
        document.cookie = `googtrans=/auto/${newLang}; ${path}`;
        document.cookie = `googtrans=/mr/${newLang}; ${path}`;
      }
      
      const selectElem = document.querySelector('.goog-te-combo') || document.querySelector('select.goog-te-combo');
      if (selectElem) {
        selectElem.value = newLang;
        selectElem.dispatchEvent(new Event('change', { bubbles: true }));
        selectElem.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (err) {
      console.warn('Language transmit error:', err);
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);
  };

  const sendMessage = async (customText) => {
    const userMessage = (customText || message).trim();
    if (!userMessage || loading) return;

    setShowFeedback(false);
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage
      }
    ]);

    if (!customText) setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          language: language,
          session_id: sessionId
        })
      });

      if (!response.ok) throw new Error("Network error");
      const data = await response.json();
      const botResponse = data?.data?.response || data?.response || t.noResponse;

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: botResponse,
          sources: data?.data?.sources || []
        }
      ]);
      setShowFeedback(true);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: t.connectionError
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (responseType) => {
    setShowFeedback(false);
    if (responseType === "yes") {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          type: "thankyou",
          text: t.thankYou
        }
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: t.noResponse
        }
      ]);
      setShowSupportForm(true);
    }
  };

  const submitSupportRequest = async () => {
    if (!supportMobile || !supportEmail || !supportIssue) {
      alert(t.requiredSupportFields);
      return;
    }
    if (!/^\d{10}$/.test(supportMobile.trim())) {
      alert(t.invalidMobile);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail.trim())) {
      alert(t.invalidEmail);
      return;
    }

    setSupportSubmitting(true);
    try {
      const res = await fetch("/api/ai/technical-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: supportMobile.trim(),
          email: supportEmail.trim(),
          issue: supportIssue.trim(),
          language: language,
          session_id: sessionId
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed");

      setShowSupportForm(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          type: "thankyou",
          text: t.supportSuccess
        }
      ]);
      setSupportMobile("");
      setSupportEmail("");
      setSupportIssue("");
    } catch (err) {
      alert(t.supportError);
    } finally {
      setSupportSubmitting(false);
    }
  };

  const speakText = (text, index) => {
    if (!window.speechSynthesis) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(typeof text === "string" ? text : "नमस्कार! जय शिवराय!");
    speech.lang = language === "en" ? "en-IN" : language === "hi" ? "hi-IN" : "mr-IN";
    speech.rate = 0.95;

    speech.onstart = () => setSpeakingIndex(index);
    speech.onend = () => setSpeakingIndex(null);
    speech.onerror = () => setSpeakingIndex(null);

    window.speechSynthesis.speak(speech);
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t.voiceNotSupported);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "en" ? "en-IN" : language === "hi" ? "hi-IN" : "mr-IN";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <>
      {/* 1. FLOATING ORIGINAL BUTTON & GREETING (Exact Look & Feel) */}
      {!isOpen && (
        <div
          style={{
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            fontFamily: "Arial, sans-serif"
          }}
        >
          {/* Greeting Bubble */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Connect Maratha AI"
            style={{
              position: "relative",
              marginBottom: "10px",
              padding: "9px 16px",
              border: "none",
              borderRadius: "18px",
              background: "#f57c00",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 5px 18px rgba(0, 0, 0, 0.18)",
              animation: "floatingGreetingBlink 1.8s ease-in-out infinite"
            }}
          >
            {floatingGreetings[language]}
            <span
              style={{
                position: "absolute",
                right: "22px",
                bottom: "-5px",
                width: "10px",
                height: "10px",
                background: "#f57c00",
                transform: "rotate(45deg)"
              }}
            />
          </button>

          {/* Original Circular Logo Button */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Connect Maratha AI"
            style={{
              position: "relative",
              width: "68px",
              height: "68px",
              padding: "3px",
              border: "3px solid #f57c00",
              borderRadius: "50%",
              background: "#ffffff",
              cursor: "pointer",
              boxShadow: "0 5px 20px rgba(0, 0, 0, 0.22)",
              animation: "floatingLogoPulse 2.4s ease-in-out infinite",
              transition: "transform 0.2s ease"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <img
              src="/Connect_Maratha_Greeting.png"
              alt="Connect Maratha AI Agent"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/connect_maratha.jpeg";
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
                display: "block"
              }}
            />
            {/* Green Online Status Dot */}
            <span
              style={{
                position: "absolute",
                right: "1px",
                bottom: "2px",
                width: "14px",
                height: "14px",
                background: "#22c55e",
                border: "2.5px solid #ffffff",
                borderRadius: "50%",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)"
              }}
            />
          </button>
        </div>
      )}

      {/* 2. CHAT WINDOW (Original Orange + White Container) */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            right: "20px",
            bottom: "20px",
            zIndex: 999999,
            width: "min(430px, 94vw)",
            height: "min(650px, 86vh)",
            background: "#ffffff",
            borderRadius: "18px",
            overflow: "hidden",
            border: "1px solid #eeeeee",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            fontFamily: "Arial, Helvetica, sans-serif"
          }}
        >
          {/* Header */}
          <div
            style={{
              minHeight: "82px",
              background: "#f57c00",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  background: "#ffffff",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid rgba(255, 255, 255, 0.6)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
                }}
              >
                <img
                  src="/assets/images/logo.png"
                  alt="Connect Maratha Official Logo"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/connect_maratha.jpeg";
                  }}
                  style={{ width: "100%", height: "100%", objectFit: "contain", padding: "2px" }}
                />
              </div>
              <div>
                <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0, color: "#ffffff" }}>
                  CONNECT मराठा सहायक
                </h2>
                <span style={{ fontSize: "11px", opacity: 0.95, display: "block", marginTop: "2px" }}>
                  {t.subtitle}
                </span>
              </div>
            </div>

            {/* Language + Close */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700" }}>{t.language}:</span>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  disabled={loading}
                  style={{
                    background: "rgba(255, 255, 255, 0.25)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    borderRadius: "6px",
                    padding: "3px 6px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    outline: "none"
                  }}
                >
                  <option value="mr" style={{ color: "#000" }}>मराठी</option>
                  <option value="en" style={{ color: "#000" }}>English</option>
                  <option value="hi" style={{ color: "#000" }}>हिंदी</option>
                </select>
              </div>

              <button
                onClick={() => {
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setIsOpen(false);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "24px",
                  cursor: "pointer",
                  lineHeight: "1",
                  padding: "0 4px"
                }}
                title="Close chat"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages Container with Heritage Watermark Background */}
          <div
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              backgroundColor: "#ffffff",
              backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.94)), url('/assets/images/logo.png')",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center center",
              backgroundSize: "220px 220px",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: "8px"
                }}
              >
                {msg.role === "ai" && (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: "#fff3e0",
                      border: "1px solid #f57c00",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px"
                    }}
                  >
                    🚩
                  </div>
                )}

                <div style={{ maxWidth: "78%" }}>
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "15px",
                      fontSize: "13.5px",
                      lineHeight: "1.55",
                      background: msg.role === "user" ? "#f57c00" : "#f5f5f5",
                      color: msg.role === "user" ? "#ffffff" : "#222222",
                      border: msg.role === "user" ? "none" : "1px solid #eeeeee",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
                    }}
                  >
                    {msg.type === "welcome" ? (
                      t.welcome
                    ) : msg.type === "thankyou" ? (
                      <>
                        <div style={{ fontWeight: "700", marginBottom: "6px" }}>{msg.text}</div>
                        <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
                          {t.thankYouDescription}
                        </div>
                        <a
                          href="https://www.connectmaratha.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-block",
                            background: "#f57c00",
                            color: "#fff",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "700",
                            textDecoration: "none"
                          }}
                        >
                          {t.visitWebsite}
                        </a>
                      </>
                    ) : (
                      <>
                        <div style={{ whiteSpace: "pre-wrap" }}>{msg.text}</div>
                        {msg.role === "ai" && (
                          <div style={{ marginTop: "6px", display: "flex", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => speakText(msg.text, idx)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#f57c00",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <span>{speakingIndex === idx ? "⏹️" : "🔊"}</span>
                              <span>{speakingIndex === idx ? t.stopSpeaking : t.speakAnswer}</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#fff3e0",
                    border: "1px solid #f57c00",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  🚩
                </div>
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: "8px 14px",
                    borderRadius: "15px",
                    fontSize: "13px",
                    color: "#666"
                  }}
                >
                  {t.thinking}...
                </div>
              </div>
            )}

            {/* Feedback Prompt */}
            {showFeedback && (
              <div
                style={{
                  background: "#fff8e1",
                  border: "1px solid #ffe082",
                  borderRadius: "12px",
                  padding: "10px",
                  textAlign: "center"
                }}
              >
                <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#555", marginBottom: "8px" }}>
                  {t.feedbackQuestion}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                  <button
                    onClick={() => handleFeedback("yes")}
                    style={{
                      background: "#22c55e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "16px",
                      padding: "4px 14px",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    {t.yes}
                  </button>
                  <button
                    onClick={() => handleFeedback("no")}
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "16px",
                      padding: "4px 14px",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    {t.no}
                  </button>
                </div>
              </div>
            )}

            {/* Technical Support Form */}
            {showSupportForm && (
              <div
                style={{
                  background: "#ffffff",
                  border: "2px solid #f57c00",
                  borderRadius: "14px",
                  padding: "14px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                }}
              >
                <div style={{ fontWeight: "800", fontSize: "14px", color: "#f57c00", marginBottom: "4px" }}>
                  🛠️ {t.supportTitle}
                </div>
                <div style={{ fontSize: "11.5px", color: "#666", marginBottom: "10px" }}>
                  {t.supportDescription}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    type="tel"
                    maxLength={10}
                    value={supportMobile}
                    onChange={(e) => setSupportMobile(e.target.value)}
                    placeholder={t.mobilePlaceholder}
                    style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "12px" }}
                  />
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "12px" }}
                  />
                  <textarea
                    rows={2}
                    value={supportIssue}
                    onChange={(e) => setSupportIssue(e.target.value)}
                    placeholder={t.issuePlaceholder}
                    style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "12px", fontFamily: "inherit" }}
                  />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={submitSupportRequest}
                      disabled={supportSubmitting}
                      style={{
                        flex: 1,
                        background: "#f57c00",
                        color: "#fff",
                        border: "none",
                        padding: "8px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      {supportSubmitting ? t.supportSubmitting : t.submitSupport}
                    </button>
                    <button
                      onClick={() => setShowSupportForm(false)}
                      style={{
                        background: "#eee",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontWeight: "700",
                        fontSize: "12px",
                        cursor: "pointer"
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar with Voice & Send (Original Orange + White) */}
          <div
            style={{
              padding: "10px 12px",
              background: "#ffffff",
              borderTop: "1px solid #eeeeee",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder={t.placeholder}
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "1px solid #ddd",
                borderRadius: "24px",
                outline: "none",
                fontSize: "13px"
              }}
            />

            {/* Voice Mic Button */}
            <button
              onClick={toggleSpeechRecognition}
              style={{
                background: isListening ? "#ef4444" : "#f5f5f5",
                color: isListening ? "#fff" : "#f57c00",
                border: "1px solid #ddd",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "16px"
              }}
              title={isListening ? t.voiceStop : t.voiceStart}
            >
              🎤
            </button>

            {/* Send Button */}
            <button
              onClick={() => sendMessage()}
              disabled={loading || !message.trim()}
              style={{
                background: message.trim() && !loading ? "#f57c00" : "#ffd8a8",
                color: "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: message.trim() && !loading ? "pointer" : "not-allowed",
                fontSize: "16px",
                fontWeight: "700"
              }}
              title="Send"
            >
              ➔
            </button>
          </div>
        </div>
      )}

      {/* Floating animations */}
      <style>{`
        @keyframes floatingGreetingBlink {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.55; transform: translateY(-3px); }
        }
        @keyframes floatingLogoPulse {
          0%, 100% {
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.22), 0 0 0 0 rgba(245, 124, 0, 0.35);
          }
          50% {
            box-shadow: 0 7px 24px rgba(0, 0, 0, 0.25), 0 0 0 8px rgba(245, 124, 0, 0.08);
          }
        }
      `}</style>
    </>
  );
}
