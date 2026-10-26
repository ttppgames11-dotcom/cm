import React, { useRef, useState } from "react";
import "./App.css";

// ==================================================
// SESSION ID
// ==================================================

function createSessionId() {
  return (
    "session_" +
    Date.now() +
    "_" +
    Math.random().toString(36).substring(2, 9)
  );
}

// ==================================================
// TRANSLATIONS
// ==================================================

const translations = {
  en: {

    languageName: "English",

    subtitle: "Maratha History • Forts • Swarajya",

    placeholder: "Type your question here...",

    thinking: "AI is thinking",

    feedbackQuestion:
      "Did you get the answer you were looking for?",

    yes: "Yes",
    no: "No",

    noResponse:
      "Sorry that I couldn't provide the information you were looking for. 🙏 Please try asking your question in another way.",

    thankYou:
      "🙏 Thank you for using Connect Maratha AI Agent!",

    thankYouDescription:
      "We hope you enjoyed exploring Maratha history, forts and Swarajya.",

    visitWebsite: "🌐 Visit Connect Maratha Website",

    supportTitle: "Technical Team Support",
    supportDescription: "Please share your contact details so our technical team can contact you.",
    mobileLabel: "Mobile Number",
    emailLabel: "Email Address",
    issueLabel: "Describe your issue",
    mobilePlaceholder: "Enter mobile number",
    emailPlaceholder: "Enter email address",
    issuePlaceholder: "Tell us about your issue...",
    submitSupport: "Contact Technical Team",
    supportSubmitting: "Submitting...",
    supportSuccess: "🙏 Thank you! Your request has been sent to our technical team. They will contact you soon.",
    supportError: "Sorry, we could not submit your support request. Please try again.",
    invalidMobile: "Please enter a valid 10-digit mobile number.",
    invalidEmail: "Please enter a valid email address.",
    requiredSupportFields: "Please fill in all required fields.",

    connectionError:
      "Sorry, I could not connect to the AI server. Please try again.",

    voiceListening: "Listening...",
    voiceStart: "Speak your question",
    voiceStop: "Stop listening",
    speakAnswer: "Listen to answer",
    stopSpeaking: "Stop speaking",
    voiceNotSupported:
      "Speech recognition is not supported in this browser.",

    welcome: (
      <>
        <div className="welcome-greeting">
          🙏 Hello! 🚩
        </div>

        <div className="welcome-title">
          Welcome to <strong>CONNECT Maratha Assistant!</strong>
        </div>

        <div className="welcome-line">
          🏰 Discover the stories of <strong>Maratha Forts</strong>
        </div>

        <div className="welcome-line">
          ⚔️ Explore the spirit of <strong>Maratha Bravery</strong>
        </div>

        <div className="welcome-line">
          🚩 Learn about the glorious history of <strong>Swarajya</strong>
        </div>

        <div className="welcome-divider">
          ✦ ✦ ✦
        </div>

        <div className="welcome-question">
          Have a <strong>question?</strong> Ask me...
        </div>

        <div className="welcome-final">
          Let's begin a journey through the
          <br />
          <strong>glorious heritage of Maratha history!</strong> 🚩
        </div>

        <div className="welcome-jai">
          Jai Bhavani! Jai Shivaji! 🚩
        </div>
      </>
    ),
  },

  hi: {

    languageName: "हिंदी",

    subtitle: "मराठा इतिहास • किले • स्वराज्य",

    placeholder: "अपना प्रश्न यहाँ लिखें...",

    thinking: "AI सोच रहा है",

    feedbackQuestion:
      "क्या आपको वह उत्तर मिला जिसकी आप तलाश कर रहे थे?",

    yes: "हाँ",
    no: "नहीं",

    noResponse:
      "मुझे खेद है कि मैं आपकी आवश्यक जानकारी नहीं दे सका। 🙏 कृपया अपना प्रश्न दूसरे तरीके से पूछने का प्रयास करें।",

    thankYou:
      "🙏 Connect Maratha AI Agent का उपयोग करने के लिए धन्यवाद!",

    thankYouDescription:
      "हमें उम्मीद है कि आपको मराठा इतिहास, किलों और स्वराज्य के बारे में जानकारी प्राप्त करके अच्छा लगा होगा।",

    visitWebsite: "🌐 Connect Maratha वेबसाइट पर जाएँ",

    supportTitle: "तकनीकी टीम सहायता",
    supportDescription: "कृपया अपनी संपर्क जानकारी साझा करें ताकि हमारी तकनीकी टीम आपसे संपर्क कर सके।",
    mobileLabel: "मोबाइल नंबर",
    emailLabel: "ई-मेल पता",
    issueLabel: "अपनी समस्या बताएं",
    mobilePlaceholder: "मोबाइल नंबर दर्ज करें",
    emailPlaceholder: "ई-मेल दर्ज करें",
    issuePlaceholder: "अपनी समस्या लिखें...",
    submitSupport: "तकनीकी टीम से संपर्क करें",
    supportSubmitting: "भेजा जा रहा है...",
    supportSuccess: "🙏 धन्यवाद! आपकी अनुरोध तकनीकी टीम को भेज दी गई है। टीम जल्द ही आपसे संपर्क करेगी।",
    supportError: "क्षमा करें, आपकी सहायता अनुरोध भेजी नहीं जा सकी। कृपया पुनः प्रयास करें।",
    invalidMobile: "कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।",
    invalidEmail: "कृपया सही ई-मेल पता दर्ज करें।",
    requiredSupportFields: "कृपया सभी आवश्यक जानकारी भरें।",

    connectionError:
      "क्षमा करें, मैं AI सर्वर से कनेक्ट नहीं हो सका। कृपया पुनः प्रयास करें।",

    voiceListening: "सुन रहा हूँ...",
    voiceStart: "अपना प्रश्न बोलें",
    voiceStop: "सुनना बंद करें",
    speakAnswer: "उत्तर सुनें",
    stopSpeaking: "बोलना बंद करें",
    voiceNotSupported:
      "इस ब्राउज़र में स्पीच रिकग्निशन उपलब्ध नहीं है।",

    welcome: (
      <>
        <div className="welcome-greeting">
          🙏 नमस्कार! 🚩
        </div>

        <div className="welcome-title">
          <strong>CONNECT मराठा सहायक</strong>
          में आपका हार्दिक स्वागत है!
        </div>

        <div className="welcome-line">
          🏰 <strong>ऐतिहासिक किलों</strong> को जानें
        </div>

        <div className="welcome-line">
          ⚔️ <strong>मराठा शौर्यगाथाओं</strong> को समझें
        </div>

        <div className="welcome-line">
          🚩 <strong>स्वराज्य के इतिहास</strong> को जानें
        </div>

        <div className="welcome-divider">
          ✦ ✦ ✦
        </div>

        <div className="welcome-question">
          अपने मन का <strong>प्रश्न पूछें...</strong>
        </div>

        <div className="welcome-final">
          आइए, <strong>मराठा इतिहास की गौरवशाली यात्रा</strong>
          <br />
          साथ मिलकर शुरू करें! 🚩
        </div>

        <div className="welcome-jai">
          जय भवानी! जय शिवाजी! 🚩
        </div>
      </>
    ),
  },

  mr: {

    languageName: "मराठी",

    subtitle: "मराठा इतिहास • गड-किल्ले • स्वराज्य",

    placeholder: "तुमचा प्रश्न येथे लिहा...",

    thinking: "AI विचार करत आहे",

    feedbackQuestion:
      "तुम्हाला हवा असलेला उत्तर मिळाला का?",

    yes: "होय",
    no: "नाही",

    noResponse:
      "तुम्ही शोधत असलेली माहिती मी देऊ शकलो नाही याबद्दल क्षमस्व. 🙏 कृपया तुमचा प्रश्न वेगळ्या पद्धतीने विचारून पहा.",

    thankYou:
      "🙏 Connect Maratha AI Agent वापरल्याबद्दल धन्यवाद!",

    thankYouDescription:
      "आम्हाला आशा आहे की तुम्हाला मराठा इतिहास, गड-किल्ले आणि स्वराज्याबद्दल माहिती जाणून घेण्याचा आनंद झाला असेल.",

    visitWebsite:
      "🌐 Connect Maratha वेबसाइटला भेट द्या",

    supportTitle: "तांत्रिक टीमची मदत",
    supportDescription: "कृपया आपली संपर्क माहिती द्या, जेणेकरून आमची तांत्रिक टीम आपल्याशी संपर्क करू शकेल.",
    mobileLabel: "मोबाईल नंबर",
    emailLabel: "ई-मेल पत्ता",
    issueLabel: "तुमची समस्या सांगा",
    mobilePlaceholder: "मोबाईल नंबर लिहा",
    emailPlaceholder: "ई-मेल पत्ता लिहा",
    issuePlaceholder: "तुमची समस्या येथे लिहा...",
    submitSupport: "तांत्रिक टीमशी संपर्क साधा",
    supportSubmitting: "पाठवत आहे...",
    supportSuccess: "🙏 धन्यवाद! तुमची विनंती आमच्या तांत्रिक टीमकडे पाठवण्यात आली आहे. टीम लवकरच तुमच्याशी संपर्क साधेल.",
    supportError: "क्षमस्व, तुमची विनंती पाठवता आली नाही. कृपया पुन्हा प्रयत्न करा.",
    invalidMobile: "कृपया योग्य १० अंकी मोबाईल नंबर टाका.",
    invalidEmail: "कृपया योग्य ई-मेल पत्ता टाका.",
    requiredSupportFields: "कृपया सर्व आवश्यक माहिती भरा.",

    connectionError:
      "क्षमस्व, AI सर्व्हरशी कनेक्ट करता आले नाही. कृपया पुन्हा प्रयत्न करा.",

    voiceListening: "ऐकत आहे...",
    voiceStart: "तुमचा प्रश्न बोला",
    voiceStop: "ऐकणे थांबवा",
    speakAnswer: "उत्तर ऐका",
    stopSpeaking: "बोलणे थांबवा",
    voiceNotSupported:
      "या ब्राउझरमध्ये स्पीच रिकग्निशन उपलब्ध नाही.",

    welcome: (
      <>
        <div className="welcome-greeting">
          🙏 नमस्कार! 🚩
        </div>

        <div className="welcome-title">
          <strong>CONNECT मराठा सहाय्यक</strong>
          मध्ये आपले मनःपूर्वक स्वागत आहे!
        </div>

        <div className="welcome-line">
          🏰 <strong>गड-किल्ले</strong> जाणून घ्या
        </div>

        <div className="welcome-line">
          ⚔️ <strong>मराठा शौर्यगाथा</strong> अनुभवूया
        </div>

        <div className="welcome-line">
          🚩 <strong>स्वराज्याचा इतिहास</strong> समजून घेऊया
        </div>

        <div className="welcome-divider">
          ✦ ✦ ✦
        </div>

        <div className="welcome-question">
          तुमच्या मनातला <strong>प्रश्न विचारा...</strong>
        </div>

        <div className="welcome-final">
          चला, <strong>मराठा इतिहासाच्या गौरवशाली प्रवासाला</strong>
          <br />
          एकत्र सुरुवात करूया! 🚩
        </div>

        <div className="welcome-jai">
          जय भवानी! जय शिवाजी! 🚩
        </div>
      </>
    ),
  },
};

// ==================================================
// MAIN APP
// ==================================================

function App() {
  const [language, setLanguage] = useState("mr");

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: translations.mr.welcome,
    },
  ]);

  const [loading, setLoading] = useState(false);

  const [isOpen, setIsOpen] = useState(true);

  const [sessionId] = useState(createSessionId());

  const [showFeedback, setShowFeedback] = useState(false);

  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportMobile, setSupportMobile] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportIssue, setSupportIssue] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);

  // ==================================================
  // VOICE
  // ==================================================

  const [isListening, setIsListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const recognitionRef = useRef(null);

  const t = translations[language];

  // ==================================================
  // CHANGE LANGUAGE
  // ==================================================

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;

    setLanguage(newLanguage);

    // Change welcome message when language changes
    setMessages([
      {
        role: "ai",
        text: translations[newLanguage].welcome,
      },
    ]);

    setMessage("");

    setShowFeedback(false);
    setShowSupportForm(false);

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setSpeakingIndex(null);
  };

  // ==================================================
  // SPEECH TO TEXT
  // ==================================================

  const getSpeechLanguage = () => {
    if (language === "en") {
      return "en-IN";
    }

    if (language === "hi") {
      return "hi-IN";
    }

    return "mr-IN";
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(t.voiceNotSupported);
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = getSpeechLanguage();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      setMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // ==================================================
  // SPOKEN WELCOME MESSAGE
  // ==================================================
  const getWelcomeSpeech = () => {
    if (language === "mr") {
      return "कनेक्ट मराठा सहाय्यक मध्ये आपले मनःपूर्वक स्वागत आहे! गड-किल्ले, मराठा शौर्यगाथा आणि स्वराज्याचा इतिहास जाणून घेण्यासाठी तुमचा प्रश्न विचारा. जय भवानी! जय शिवाजी!";
    }

    if (language === "hi") {
      return "कनेक्ट मराठा असिस्टेंट में आपका हार्दिक स्वागत है! ऐतिहासिक किलों, मराठा शौर्यगाथाओं और स्वराज्य के इतिहास को जानने के लिए अपना प्रश्न पूछें। जय भवानी! जय शिवाजी!";
    }

    return "Welcome to Connect Maratha Assistant! Ask me anything about Maratha forts, Maratha bravery and the glorious history of Swarajya. Jai Bhavani! Jai Shivaji!";
  };

  const speakWelcome = () => {
    if (!window.speechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(getWelcomeSpeech());

    if (language === "en") {
      speech.lang = "en-IN";
    } else if (language === "hi") {
      speech.lang = "hi-IN";
    } else {
      speech.lang = "mr-IN";
    }

    speech.rate = 0.95;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => {
      setSpeakingIndex("welcome");
    };

    speech.onend = () => {
      setSpeakingIndex(null);
    };

    speech.onerror = () => {
      setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(speech);
  };

  // ==================================================
  // TEXT TO SPEECH
  // ==================================================

  const speakText = (text, index) => {
    if (!window.speechSynthesis) {
      return;
    }

    // The welcome message is React JSX, not plain text.
    // Use the dedicated spoken welcome message instead of passing
    // the JSX object to SpeechSynthesisUtterance.
    if (index === 0 && messages[0]?.role === "ai") {
      speakWelcome();
      return;
    }

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Make sure only a string is passed to SpeechSynthesisUtterance.
    const speechText =
      typeof text === "string"
        ? text
        : getWelcomeSpeech();

    const speech = new SpeechSynthesisUtterance(speechText);

    if (language === "en") {
      speech.lang = "en-IN";
    } else if (language === "hi") {
      speech.lang = "hi-IN";
    } else {
      speech.lang = "mr-IN";
    }

    speech.rate = 0.95;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => {
      setSpeakingIndex(index);
    };

    speech.onend = () => {
      setSpeakingIndex(null);
    };

    speech.onerror = () => {
      setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(speech);
  };

  // ==================================================
  // SEND MESSAGE
  // ==================================================

  const sendMessage = async () => {
    if (!message.trim() || loading) {
      return;
    }

    const userMessage = message.trim();

    // Hide previous feedback
    setShowFeedback(false);

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: userMessage,

            // Selected frontend language
            language: language,

            session_id: sessionId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            data.response ||
            "No matching information found in the Connect Maratha knowledge base.",
        },
      ]);

      // Show feedback
      setShowFeedback(true);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: t.connectionError,
        },
      ]);

      setShowFeedback(false);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // ENTER KEY
  // ==================================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      sendMessage();
    }
  };

  // ==================================================
  // YES FEEDBACK
  // ==================================================

  const handleYes = () => {
    setShowFeedback(false);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        type: "thankyou",
        text: t.thankYou,
      },
    ]);
  };

  // ==================================================
  // NO FEEDBACK
  // ==================================================

  const handleNo = () => {
    setShowFeedback(false);
    setShowSupportForm(true);

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: t.noResponse,
      },
    ]);
  };

  // ==================================================
  // TECHNICAL SUPPORT
  // ==================================================

  const submitSupportRequest = async () => {
    const mobile = supportMobile.trim();
    const email = supportEmail.trim();
    const issue = supportIssue.trim();

    if (!mobile || !email || !issue) {
      alert(t.requiredSupportFields);
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      alert(t.invalidMobile);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert(t.invalidEmail);
      return;
    }

    setSupportSubmitting(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/technical-support",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobile,
            email,
            issue,
            user_question: issue,
            language,
            session_id: sessionId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Support request failed");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Support request failed");
      }

      setShowSupportForm(false);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          type: "thankyou",
          text: t.supportSuccess,
        },
      ]);

      setSupportMobile("");
      setSupportEmail("");
      setSupportIssue("");
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: t.supportError,
        },
      ]);
    } finally {
      setSupportSubmitting(false);
    }
  };

  // ==================================================
  // CLOSE CHAT
  // ==================================================

  const closeChat = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsListening(false);
    setSpeakingIndex(null);
    setIsOpen(false);
  };

  // ==================================================
  // OPEN CHAT
  // ==================================================

  const openChat = () => {
    setIsOpen(true);
  };

  //=================================================
  // FLOATING GREETINGS
  //=================================================

  const floatingGreetings = {
    en: "Hi! 👋",
    hi: "नमस्ते! 🙏",
    mr: "नमस्कार! 🙏",
  };

  // ==================================================
  // CLOSED CHAT
  // ==================================================

  if (!isOpen) {
    return (
      <div className="app">
        <div className="floating-ai-wrapper">

          {/* Greeting */}
          <button
            className="floating-greeting"
            onClick={openChat}
            aria-label="Open Connect Maratha AI"
          >
            {floatingGreetings[language]}
          </button>

          {/* NEW AI AGENT LOGO */}
          <button
            className="floating-ai-logo"
            onClick={openChat}
            aria-label="Open Connect Maratha AI"
          >
            <img
              src="/Connect_Maratha_Greeting.png"
              alt="AI Agent"
            />
          </button>

        </div>
      </div>
    );
  }

  // ==================================================
  // OPEN CHAT
  // ==================================================

  return (
    <>
      <div className="app">

        <div className="chat-container">

          {/* ==========================================
            HEADER
        ========================================== */}

          <div className="chat-header">

            <div className="header-left">

              <div className="ai-avatar">

                <img
                  src="/connect_maratha.jpeg"
                  alt="Connect Maratha"
                />

              </div>

              <div>

                <h2>
                  CONNECT मराठा सहायक
                </h2>

                <span className="assistant-subtitle">
                  {t.subtitle}
                </span>

              </div>

            </div>


            {/* LANGUAGE + CLOSE */}

            <div className="header-actions">

              <div className="language-selector">

                <span className="language-label">
                  {t.language}:
                </span>

                <select
                  value={language}
                  onChange={handleLanguageChange}
                  disabled={loading}
                >

                  <option value="en">
                    English
                  </option>

                  <option value="hi">
                    हिंदी
                  </option>

                  <option value="mr">
                    मराठी
                  </option>

                </select>

              </div>


              <button
                className="close-button"
                onClick={closeChat}
                title="Close chat"
              >
                ×
              </button>

            </div>

          </div>


          {/* ==========================================
            MESSAGES
        ========================================== */}

          <div className="chat-messages">

            {messages.map((msg, index) => (

              <div
                key={index}
                className={`message-row ${msg.role}`}
              >

                {/* AI AVATAR */}

                {msg.role === "ai" && (
                  <div className="message-avatar">
                    🚩
                  </div>
                )}


                <div className="message-content">

                  <div className="message-bubble">

                    {msg.type === "thankyou" ? (
                      <>

                        <div>
                          {msg.text}
                        </div>

                        <div className="website-message">
                          {t.thankYouDescription}
                        </div>

                        <a
                          href="https://www.connectmaratha.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="website-link"
                        >
                          {t.visitWebsite}
                        </a>

                      </>
                    ) : (
                      <>
                        <div className="message-text">
                          {msg.text}
                        </div>

                        {msg.role === "ai" && (
                          <button
                            type="button"
                            className={`speaker-button ${speakingIndex === index
                              ? "speaking"
                              : ""
                              }`}
                            onClick={() =>
                              speakText(msg.text, index)
                            }
                            title={
                              speakingIndex === index
                                ? t.stopSpeaking
                                : t.speakAnswer
                            }
                          >
                            {speakingIndex === index
                              ? "🔇"
                              : "🔊"}
                          </button>
                        )}
                      </>
                    )}

                  </div>

                </div>


                {/* USER AVATAR */}

                {msg.role === "user" && (
                  <div className="message-avatar user-avatar">
                    👤
                  </div>
                )}

              </div>

            ))}


            {/* ==========================================
              LOADING
          ========================================== */}

            {loading && (

              <div className="message-row ai">

                <div className="message-avatar">
                  🚩
                </div>

                <div className="message-content">

                  <div className="message-bubble loading-bubble">

                    {t.thinking}

                    <span className="dots">

                      <span>.</span>
                      <span>.</span>
                      <span>.</span>

                    </span>

                  </div>

                </div>

              </div>

            )}


            {/* ==========================================
              FEEDBACK
          ========================================== */}

            {showFeedback && !loading && (

              <div className="feedback-container">

                <div className="feedback-question">
                  {t.feedbackQuestion}
                </div>

                <div className="feedback-buttons">

                  <button
                    className="feedback-yes"
                    onClick={handleYes}
                  >
                    ✅ {t.yes}
                  </button>

                  <button
                    className="feedback-no"
                    onClick={handleNo}
                  >
                    ❌ {t.no}
                  </button>

                </div>

              </div>

            )}

            {/* ==========================================
              TECHNICAL SUPPORT FORM
          ========================================== */}

            {showSupportForm && (
              <div className="support-form">

                <div className="support-title">
                  {t.supportTitle}
                </div>

                <div className="support-description">
                  {t.supportDescription}
                </div>

                <div className="support-field">
                  <label>{t.mobileLabel}</label>

                  <input
                    type="tel"
                    value={supportMobile}
                    placeholder={t.mobilePlaceholder}
                    maxLength={10}
                    onChange={(event) => {
                      const value = event.target.value.replace(/\D/g, "");
                      setSupportMobile(value);
                    }}
                  />
                </div>

                <div className="support-field">
                  <label>{t.emailLabel}</label>

                  <input
                    type="email"
                    value={supportEmail}
                    placeholder={t.emailPlaceholder}
                    onChange={(event) => {
                      setSupportEmail(event.target.value);
                    }}
                  />
                </div>

                <div className="support-field">
                  <label>{t.issueLabel}</label>

                  <textarea
                    value={supportIssue}
                    placeholder={t.issuePlaceholder}
                    rows={4}
                    onChange={(event) => {
                      setSupportIssue(event.target.value);
                    }}
                  />
                </div>

                <button
                  type="button"
                  className="support-submit-button"
                  onClick={submitSupportRequest}
                  disabled={supportSubmitting}
                >
                  {supportSubmitting
                    ? t.supportSubmitting
                    : t.submitSupport}
                </button>

              </div>
            )}

          </div>


          {/* ==========================================
            INPUT
        ========================================== */}

          <div className="chat-input-area">

            <input
              type="text"
              value={message}
              placeholder={
                isListening
                  ? t.voiceListening
                  : t.placeholder
              }
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={loading}
            />

            <button
              type="button"
              className={`voice-button ${isListening ? "listening" : ""
                }`}
              onClick={startVoiceInput}
              disabled={loading}
              title={
                isListening
                  ? t.voiceStop
                  : t.voiceStart
              }
            >
              {isListening ? "⏹" : "🎤"}
            </button>

            <button
              className="send-button"
              onClick={sendMessage}
              disabled={
                loading || !message.trim()
              }
              title="Send"
            >
              ➤
            </button>

          </div>

        </div>

      </div>
    </>

  );
}

export default App;