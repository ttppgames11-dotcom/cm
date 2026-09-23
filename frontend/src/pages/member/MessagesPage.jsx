import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const DEFAULT_CONVERSATIONS = [
  {
    id: 'c1',
    name: 'राजेश पाटील (उद्योजक)',
    role: 'पुणे · स्टील व कन्स्ट्रक्शन सप्लाय',
    avatar: '👨‍💼',
    online: true,
    lastMsg: 'नमस्कार, आपण प्रस्तावित स्टील पुरवठा करारावर बोलू शकतो का?',
    time: '१२:४५ PM',
    unread: 2,
    messages: [
      { id: 'm1', sender: 'them', text: 'जय जिजाऊ, जय शिवराय!', time: '१२:४० PM' },
      { id: 'm2', sender: 'them', text: 'नमस्कार, आपण प्रस्तावित स्टील पुरवठा करारावर बोलू शकतो का? नवीन एमओयू ड्राफ्ट तयार आहे.', time: '१२:४५ PM' }
    ]
  },
  {
    id: 'c2',
    name: 'सुप्रिया मोहिते (CA)',
    role: 'मुंबई · कर सल्लागार व ऑडिट',
    avatar: '👩‍💼',
    online: true,
    lastMsg: 'जीएसटी रिटर्न आणि व्यवसाय नोंदणीची कागदपत्रे ईमेल केली आहेत.',
    time: '१०:३० AM',
    unread: 0,
    messages: [
      { id: 'm3', sender: 'me', text: 'नमस्कार सुप्रियाजी, या महिन्याचे जीएसटी ऑडिट रिपोर्ट कधीपर्यंत मिळेल?', time: '१०:१५ AM' },
      { id: 'm4', sender: 'them', text: 'जीएसटी रिटर्न आणि व्यवसाय नोंदणीची कागदपत्रे ईमेल केली आहेत. कृपया तपासावीत.', time: '१०:३० AM' }
    ]
  },
  {
    id: 'c3',
    name: 'अमोल शिंदे (पुणे चॅप्टर)',
    role: 'पुणे · बिझनेस संगम समन्वयक',
    avatar: '🧑‍💼',
    online: false,
    lastMsg: 'या शनिवारच्या बिझनेस संगम बैठकीला नक्की उपस्थित राहा.',
    time: 'काल',
    unread: 0,
    messages: [
      { id: 'm5', sender: 'them', text: 'या शनिवारच्या बिझनेस संगम बैठकीला नक्की उपस्थित राहा. ५०+ नवीन उद्योजक सहभागी होत आहेत.', time: 'काल' }
    ]
  },
  {
    id: 'c4',
    name: 'तानाजी जगताप (दुर्ग संवर्धन)',
    role: 'सातारा · सह्याद्री गड रक्षक दल',
    avatar: '🚩',
    online: true,
    lastMsg: 'राजगड स्वच्छता मोहिमेसाठी १०० स्वयंसेवकांची यादी तयार झाली आहे.',
    time: '३ दिवसांपूर्वी',
    unread: 0,
    messages: [
      { id: 'm6', sender: 'them', text: 'राजगड स्वच्छता मोहिमेसाठी १०० स्वयंसेवकांची यादी तयार झाली आहे. पाणी व प्रथमोपचार साहित्याची व्यवस्था झाली आहे.', time: '३ दिवसांपूर्वी' }
    ]
  },
  {
    id: 'c5',
    name: 'ॲड. विक्रम गायकवाड (विधी सल्ला)',
    role: 'उच्च न्यायालय · विधी साहाय्य कक्ष',
    avatar: '⚖️',
    online: false,
    lastMsg: 'जमीन हस्तांतरण आणि महसूल कागदपत्रांची पडताळणी पूर्ण झाली आहे.',
    time: '५ दिवसांपूर्वी',
    unread: 0,
    messages: [
      { id: 'm7', sender: 'them', text: 'जमीन हस्तांतरण आणि महसूल कागदपत्रांची पडताळणी पूर्ण झाली आहे. सोमवारी भेटून स्वाक्षरी करू शकता.', time: '५ दिवसांपूर्वी' }
    ]
  }
];

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const toParam = searchParams.get('to');
  const nameParam = searchParams.get('name');

  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_member_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CONVERSATIONS;
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    return conversations[0]?.id || 'c1';
  });

  // Handle incoming query params (?to=...&name=...) from Directory or Meeting booker
  useEffect(() => {
    if (!toParam && !nameParam) return;

    setConversations(prev => {
      const existing = prev.find(c => c.id === toParam || (nameParam && c.name.toLowerCase().includes(nameParam.toLowerCase())));
      if (existing) {
        setActiveChatId(existing.id);
        return prev;
      }

      // Create new conversation entry for the member
      const newConvId = toParam || ('c_' + Date.now());
      const newConv = {
        id: newConvId,
        name: nameParam || 'मराठा सदस्य',
        role: 'मराठा सदस्य · व्यावसायिक नेटवर्क',
        avatar: '👤',
        online: true,
        lastMsg: 'संभाषण सुरू करा...',
        time: 'आत्ताच',
        unread: 0,
        messages: []
      };
      setActiveChatId(newConvId);
      return [newConv, ...prev];
    });
  }, [toParam, nameParam]);

  const [inputMsg, setInputMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [newContactModal, setNewContactModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', role: '', avatar: '👤' });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('cm_member_messages', JSON.stringify(conversations));
    } catch (e) {
      console.error(e);
    }
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeChatId]);

  const activeChat = conversations.find(c => c.id === activeChatId) || conversations[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeChat) return;

    const timeStr = new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: 'm_' + Date.now(),
      sender: 'me',
      text: inputMsg.trim(),
      time: timeStr
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          lastMsg: inputMsg.trim(),
          time: timeStr,
          messages: [...(c.messages || []), newMsg]
        };
      }
      return c;
    }));

    setInputMsg('');
  };

  const handleStartEdit = (msg) => {
    setEditingMsgId(msg.id);
    setEditingText(msg.text);
  };

  const handleSaveEdit = (msgId) => {
    if (!editingText.trim()) return;
    setConversations(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        const updatedMsgs = (c.messages || []).map(m =>
          m.id === msgId ? { ...m, text: editingText.trim(), edited: true } : m
        );
        return {
          ...c,
          messages: updatedMsgs,
          lastMsg: updatedMsgs[updatedMsgs.length - 1]?.text || c.lastMsg
        };
      }
      return c;
    }));
    setEditingMsgId(null);
  };

  const handleDeleteMsg = (msgId) => {
    if (window.confirm('हा संदेश हटवायचा आहे का?')) {
      setConversations(prev => prev.map(c => {
        if (c.id === activeChat.id) {
          const updatedMsgs = (c.messages || []).filter(m => m.id !== msgId);
          return {
            ...c,
            messages: updatedMsgs,
            lastMsg: updatedMsgs[updatedMsgs.length - 1]?.text || 'संदेश हटवला'
          };
        }
        return c;
      }));
    }
  };

  const handleClearChat = () => {
    if (window.confirm('या चॅटमधील सर्व संभाषण पुसून टाकायचे आहे का?')) {
      setConversations(prev => prev.map(c => {
        if (c.id === activeChat.id) {
          return { ...c, messages: [], lastMsg: 'कोणतेही संभाषण नाही' };
        }
        return c;
      }));
    }
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContact.name.trim()) return;
    const newId = 'c_' + Date.now();
    const created = {
      id: newId,
      name: newContact.name,
      role: newContact.role || 'Connect Maratha सदस्य',
      avatar: newContact.avatar || '👤',
      online: true,
      lastMsg: 'नवीन संभाषण सुरू झाले',
      time: 'आत्ता',
      unread: 0,
      messages: [
        { id: 'm_init', sender: 'them', text: 'जय जिजाऊ! Connect Maratha मध्ये आपले स्वागत आहे.', time: 'आत्ता' }
      ]
    };
    setConversations([created, ...conversations]);
    setActiveChatId(newId);
    setNewContactModal(false);
    setNewContact({ name: '', role: '', avatar: '👤' });
  };

  const handleResetDefaults = () => {
    if (window.confirm('सर्व मेसेजेस मूळ स्थितीत रीसेट करायचे आहेत का?')) {
      setConversations(DEFAULT_CONVERSATIONS);
      setActiveChatId(DEFAULT_CONVERSATIONS[0].id);
      localStorage.setItem('cm_member_messages', JSON.stringify(DEFAULT_CONVERSATIONS));
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '28px 16px' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>

        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px'
        }}>
          <div>
            <h1 style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#3D0D0D',
              margin: '0 0 4px'
            }}>
              💬 संदेश व थेट संवाद केंद्र (Real-time Chat)
            </h1>
            <p style={{ color: '#666', fontSize: '0.88rem', margin: 0 }}>
              उद्योजक, व्यवसाय भागीदार व कार्यकारिणी पदाधिकाऱ्यांशी सुरक्षित व थेट संवाद.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setNewContactModal(true)}
              style={{
                background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                color: '#FFF',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234,88,12,0.3)'
              }}>
              ➕ नवीन संपर्क जोडा
            </button>
            <button
              onClick={handleResetDefaults}
              style={{
                background: '#FFF',
                border: '1.5px solid #E6DDCE',
                color: '#666',
                padding: '9px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}>
              ↺ रीसेट
            </button>
          </div>
        </div>

        {/* Chat Layout Window */}
        <div style={{
          background: '#FFF',
          borderRadius: '20px',
          border: '1.5px solid #E6DDCE',
          overflow: 'hidden',
          boxShadow: '0 10px 36px rgba(0,0,0,0.06)',
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 340px) 1fr',
          minHeight: '640px',
          maxHeight: '760px'
        }}>

          {/* Left Contacts Sidebar */}
          <div style={{ borderRight: '1.5px solid #E6DDCE', background: '#FAF6F0', display: 'flex', flexDirection: 'column' }}>
            {/* Search Filter */}
            <div style={{ padding: '16px', borderBottom: '1px solid #E6DDCE' }}>
              <input
                type="text"
                placeholder="नाव किंवा संदेश शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid #E6DDCE',
                  background: '#FFF',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Conversation List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredConversations.map(c => {
                const isActive = activeChat?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveChatId(c.id)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #EFE4D2',
                      background: isActive ? '#FFFFFF' : 'transparent',
                      borderLeft: isActive ? '4px solid #EA580C' : '4px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      transition: 'background 0.15s'
                    }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        fontSize: '24px',
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: '#FFF',
                        border: '1px solid #E6DDCE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {c.avatar}
                      </div>
                      {c.online && (
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          right: '0',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#16A34A',
                          border: '2px solid #FFF'
                        }} />
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#3D0D0D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.name}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#888' }}>{c.time}</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#DD8A2E', fontWeight: 600, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.role}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.lastMsg}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Chat Area */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FFF' }}>
            {activeChat ? (
              <>
                {/* Chat Top Header */}
                <div style={{
                  padding: '16px 22px',
                  borderBottom: '1.5px solid #E6DDCE',
                  background: '#FFFDF9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      fontSize: '26px',
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: '#FDF3E6',
                      border: '1px solid #DD8A2E',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {activeChat.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#3D0D0D' }}>
                        {activeChat.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {activeChat.role} · {activeChat.online ? <span style={{ color: '#16A34A', fontWeight: 700 }}>● ऑनलाइन</span> : 'ऑफलाइन'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link
                      to={`/meetings?recipient=${encodeURIComponent(activeChat.id)}&name=${encodeURIComponent(activeChat.name)}`}
                      style={{
                        background: '#C73800',
                        color: '#fff',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 2px 6px rgba(199,56,0,0.2)'
                      }}>
                      ☕ १-टू-१ भेट ठरवा
                    </Link>
                    <button
                      onClick={handleClearChat}
                      style={{
                        background: '#FFF',
                        border: '1px solid #E6DDCE',
                        color: '#666',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                      संभाषण साफ करा
                    </button>
                    <Link
                      to="/directory"
                      style={{
                        background: '#FAF6F0',
                        border: '1px solid #DD8A2E',
                        color: '#9A3412',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}>
                      प्रोफाइल पहा →
                    </Link>
                  </div>
                </div>

                {/* Messages Body */}
                <div style={{
                  flex: 1,
                  padding: '24px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  background: '#FCF9F5'
                }}>
                  {(activeChat.messages || []).map((m) => {
                    const isMe = m.sender === 'me';
                    return (
                      <div
                        key={m.id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '78%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start'
                        }}>
                        <div style={{
                          background: isMe ? 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 100%)' : '#FFFFFF',
                          color: isMe ? '#FFF' : '#2A0606',
                          border: isMe ? 'none' : '1px solid #E6DDCE',
                          padding: '12px 16px',
                          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          boxShadow: '0 3px 12px rgba(0,0,0,0.04)',
                          fontSize: '0.92rem',
                          lineHeight: 1.5,
                          position: 'relative'
                        }}>
                          {editingMsgId === m.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
                              <input
                                type="text"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #DD8A2E',
                                  color: '#000',
                                  fontSize: '0.9rem'
                                }}
                              />
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => setEditingMsgId(null)}
                                  style={{ padding: '3px 8px', fontSize: '0.75rem', background: '#EEE', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                  रद्द
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(m.id)}
                                  style={{ padding: '3px 10px', fontSize: '0.75rem', background: '#EA580C', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}>
                                  जतन
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div>{m.text}</div>
                              {m.edited && (
                                <span style={{ fontSize: '0.68rem', opacity: 0.7, fontStyle: 'italic', marginLeft: '4px' }}>
                                  (संपादित)
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Metadata & Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.72rem', color: '#888' }}>
                          <span>{m.time}</span>
                          {isMe && !editingMsgId && (
                            <>
                              <button
                                onClick={() => handleStartEdit(m)}
                                title="संदेश संपादित करा"
                                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 0 }}>
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteMsg(m.id)}
                                title="संदेश हटवा"
                                style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', padding: 0 }}>
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Quick Response Chips */}
                <div style={{
                  padding: '8px 20px',
                  background: '#FFF',
                  borderTop: '1px solid #EFE4D2',
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap'
                }}>
                  {[
                    '🚩 जय जिजाऊ, जय शिवराय!',
                    '🤝 नक्कीच, आपण उद्या फोनवर चर्चा करूया.',
                    '📄 मी ड्राफ्ट तपासून कळवतो.',
                    '✅ होय, मी बैठकीला उपस्थित राहीन.'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputMsg(chip)}
                      style={{
                        padding: '4px 12px',
                        background: '#FAF6F0',
                        border: '1px solid #E6DDCE',
                        borderRadius: '16px',
                        fontSize: '0.78rem',
                        color: '#5C534B',
                        cursor: 'pointer'
                      }}>
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input Box */}
                <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', borderTop: '1.5px solid #E6DDCE', display: 'flex', gap: '10px', background: '#FFF' }}>
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="आपला संदेश येथे टाइप करा..."
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1.5px solid #E6DDCE',
                      outline: 'none',
                      fontSize: '0.94rem'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(234,88,12,0.3)'
                    }}>
                    पाठवा ➔
                  </button>
                </form>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                संभाषण सुरू करण्यासाठी डावीकडून संपर्क निवडा.
              </div>
            )}
          </div>

        </div>

        {/* Modal for Add New Contact */}
        {newContactModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}>
            <div style={{
              background: '#FFF',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: '2px solid #DD8A2E',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3D0D0D 0%, #5C1414 100%)',
                color: '#FFF',
                padding: '18px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ fontFamily: "'Baloo 2', sans-serif", fontSize: '1.25rem', margin: 0 }}>
                  ➕ नवीन संपर्क जोडा
                </h3>
                <button
                  onClick={() => setNewContactModal(false)}
                  style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.4rem', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddContact} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    संपर्काचे नाव *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="उदा. महेश सावंत (उद्योजक)"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    पद / व्यवसाय व शहर
                  </label>
                  <input
                    type="text"
                    value={newContact.role}
                    onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                    placeholder="उदा. पुणे · ऑटोमोबाईल पार्ट पुरवठादार"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    अवतार (Emoji)
                  </label>
                  <input
                    type="text"
                    value={newContact.avatar}
                    onChange={(e) => setNewContact({ ...newContact, avatar: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setNewContactModal(false)}
                    style={{ padding: '9px 16px', background: '#FAF6F0', border: '1px solid #E6DDCE', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 20px', background: '#EA580C', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>
                    संपर्क जोडा ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
