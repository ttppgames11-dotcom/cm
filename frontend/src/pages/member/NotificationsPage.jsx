import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'n1',
    category: 'business',
    categoryLabel: 'व्यवसाय संगम',
    title: 'नवीन बिझनेस संदर्भ प्राप्त झाला (₹५,००,०००)',
    time: '१० मिनिटांपूर्वी',
    icon: '🤝',
    text: 'राजेश पाटील (पुणे चॅप्टर) यांनी "सह्याद्री इन्फ्रा - स्टील व कन्स्ट्रक्शन पुरवठा" या कामासाठी आपल्याला संदर्भ दिला आहे. कृपया त्वरित संपर्क साधा.',
    link: '/referrals',
    linkLabel: 'रेफरल पाइपलाइन उघडा →',
    unread: true
  },
  {
    id: 'n2',
    category: 'community',
    categoryLabel: 'शिवराज्याभिषेक महोत्सव',
    title: 'शिवराज्याभिषेक ३५१ महोत्सव व्हीआयपी ई-पास मंजूर',
    time: '२ तासांपूर्वी',
    icon: '🚩',
    text: 'दुर्गराज रायगडावर ६ जून रोजी होणाऱ्या ३५१ व्या शिवराज्याभिषेक सोहळ्यासाठी आपला डिजिटल व्हीआयपी पास आणि वाहन प्रवेश पास जनरेट झाला आहे.',
    link: '/card',
    linkLabel: 'डिजिटल पास पहा →',
    unread: true
  },
  {
    id: 'n3',
    category: 'system',
    categoryLabel: 'डिजिटल व्यासपीठ',
    title: 'Connect Maratha डिजिटल स्मार्ट कार्ड सक्रिय',
    time: '१ दिवसापूर्वी',
    icon: '🪪',
    text: 'आपले अधिकृत सदस्यत्व डिजिटल स्मार्ट कार्ड (QR व्हेरिफाइड) यशस्वीरीत्या सक्रिय झाले आहे. आपण हे कार्ड ऑफलाइन ओळखीसाठी वापरू शकता.',
    link: '/card',
    linkLabel: 'कार्ड डाउनलोड करा →',
    unread: false
  },
  {
    id: 'n4',
    category: 'community',
    categoryLabel: 'जिल्हा कार्यकारणी',
    title: 'पुणे जिल्हा मध्यवर्ती कार्यकारणी मासिक बैठक',
    time: '२ दिवसांपूर्वी',
    icon: '📅',
    text: 'पुणे जिल्हा मध्यवर्ती कार्यकारणीची मासिक बैठक शनिवार वाडा परिसरातील मध्यवर्ती सभागृहात रविवारी सकाळी ११:०० वाजता आयोजित केली आहे.',
    link: '/events',
    linkLabel: 'कार्यक्रम तपशील →',
    unread: false
  },
  {
    id: 'n5',
    category: 'community',
    categoryLabel: 'दुर्ग संवर्धन',
    title: 'सह्याद्री गड संवर्धन श्रमदान शिबिर — किल्ले राजगड',
    time: '३ दिवसांपूर्वी',
    icon: '🏰',
    text: 'पुढील आठवड्यात होणाऱ्या राजगड स्वच्छता व शिलालेख जतन महाशिबिरासाठी आपली स्वयंसेवक म्हणून निवड झाली आहे. प्रवासाची वेळ तपासावी.',
    link: '/forts/trails',
    linkLabel: 'ट्रेक मार्गदर्शक पहा →',
    unread: false
  },
  {
    id: 'n6',
    category: 'business',
    categoryLabel: 'सारथी व युवा',
    title: 'सारथी परदेशी उच्च शिक्षण फेलोशिप २०२६ मुलाखत जाहीर',
    time: '५ दिवसांपूर्वी',
    icon: '🎓',
    text: 'सारथी संस्थेतर्फे उच्च शिक्षणासाठी परदेशी जाणाऱ्या मराठा विद्यार्थ्यांच्या मुलाखतींचे अंतिम वेळापत्रक जाहीर झाले आहे.',
    link: '/community/news',
    linkLabel: 'अधिकृत बातमी वाचा →',
    unread: false
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_user_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [filterCategory, setFilterCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'business',
    categoryLabel: 'व्यवसाय',
    icon: '🔔',
    text: '',
    link: '',
    linkLabel: 'तपशील पहा →'
  });

  useEffect(() => {
    try {
      localStorage.setItem('cm_user_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const filtered = notifications.filter(n => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'unread') return n.unread;
    return n.category === filterCategory;
  });

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const toggleReadStatus = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const handleDelete = (id) => {
    if (window.confirm('ही सूचना कायमची हटवायची आहे का?')) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('सर्व सूचना पुसून टाकायच्या आहेत का?')) {
      setNotifications([]);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('सर्व सूचना मूळ अधिकृत डेटावर रीसेट करायच्या आहेत का?')) {
      setNotifications(DEFAULT_NOTIFICATIONS);
      localStorage.setItem('cm_user_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
  };

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      title: '',
      category: 'business',
      categoryLabel: 'व्यवसाय',
      icon: '📢',
      text: '',
      link: '/community',
      linkLabel: 'तपशील पहा →'
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (n) => {
    setEditItem(n);
    setFormData({
      title: n.title,
      category: n.category,
      categoryLabel: n.categoryLabel,
      icon: n.icon || '🔔',
      text: n.text,
      link: n.link || '',
      linkLabel: n.linkLabel || 'तपशील पहा →'
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.text.trim()) {
      alert('कृपया शीर्षक आणि तपशील प्रविष्ट करा.');
      return;
    }

    if (editItem) {
      setNotifications(notifications.map(n => n.id === editItem.id ? { ...n, ...formData } : n));
    } else {
      const newNotif = {
        id: 'notif_' + Date.now(),
        ...formData,
        time: 'आत्ताच',
        unread: true
      };
      setNotifications([newNotif, ...notifications]);
    }
    setModalOpen(false);
  };

  return (
    <div style={{ background: '#F8F5F0', minHeight: 'calc(100vh - 120px)', padding: '36px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Top Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.6rem' }}>🔔</span>
              <h1 style={{
                fontFamily: "'Baloo 2', 'Noto Sans Devanagari', sans-serif",
                fontSize: '1.8rem',
                fontWeight: 800,
                color: '#3D0D0D',
                margin: 0
              }}>
                सूचना केंद्र (Notifications)
              </h1>
              {unreadCount > 0 && (
                <span style={{
                  background: '#EA580C',
                  color: '#FFF',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '2px 10px',
                  borderRadius: '12px'
                }}>
                  {unreadCount} नवीन
                </span>
              )}
            </div>
            <p style={{ color: '#666', fontSize: '0.88rem', margin: 0 }}>
              आपल्या खात्याशी, व्यवसायाशी, बैठकांशी व आगामी कार्यक्रमांशी संबंधित थेट रिअल-टाइम अद्यतने.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleOpenAdd}
              style={{
                padding: '9px 16px',
                background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
                color: '#FFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234,88,12,0.3)'
              }}>
              ➕ नवीन सूचना जोडा
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '9px 14px',
                  background: '#FFF',
                  border: '1.5px solid #DD8A2E',
                  color: '#C9701C',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}>
                सर्व वाचले ✓
              </button>
            )}
            <button
              onClick={handleResetDefaults}
              style={{
                padding: '9px 12px',
                background: '#FFF',
                border: '1px solid #E6DDCE',
                color: '#666',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}>
              ↺ रीसेट
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          marginBottom: '20px'
        }}>
          {[
            { id: 'all', label: `सर्व सूचना (${notifications.length})` },
            { id: 'unread', label: `🔴 न वाचलेल्या (${unreadCount})` },
            { id: 'business', label: '🤝 व्यवसाय संदर्भ' },
            { id: 'community', label: '🚩 समाज व उत्सव' },
            { id: 'system', label: '⚙️ सिस्टीम व ओळख' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: filterCategory === tab.id ? '2px solid #EA580C' : '1px solid #E6DDCE',
                background: filterCategory === tab.id ? '#FFF7ED' : '#FFF',
                color: filterCategory === tab.id ? '#9A3412' : '#5C534B',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(n => (
            <div
              key={n.id}
              style={{
                background: n.unread ? '#FFFDF8' : '#FFFFFF',
                borderRadius: '16px',
                padding: '20px 22px',
                border: n.unread ? '1.5px solid #DD8A2E' : '1px solid #E6DDCE',
                borderLeft: n.unread ? '5px solid #EA580C' : '5px solid #E6DDCE',
                boxShadow: n.unread ? '0 4px 16px rgba(221,138,46,0.12)' : '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                transition: 'transform 0.15s'
              }}>
              <div style={{
                fontSize: '24px',
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: n.unread ? '#FDF3E6' : '#F5F5F5',
                border: n.unread ? '1px solid #DD8A2E' : '1px solid #E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {n.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                  <div>
                    <span style={{
                      background: '#FAF0E6',
                      color: '#C9701C',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      marginRight: '8px'
                    }}>
                      {n.categoryLabel || n.category}
                    </span>
                    <h3 style={{ margin: '4px 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#3D0D0D', display: 'inline' }}>
                      {n.title}
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600 }}>⏱️ {n.time}</span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#5C534B', margin: '8px 0 12px', lineHeight: 1.55 }}>
                  {n.text}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  {n.link ? (
                    <Link
                      to={n.link}
                      style={{
                        color: '#EA580C',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        textDecoration: 'none'
                      }}>
                      {n.linkLabel || 'तपशील पहा →'}
                    </Link>
                  ) : <div />}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleReadStatus(n.id)}
                      style={{
                        background: '#FAF6F0',
                        border: '1px solid #E6DDCE',
                        color: '#5C534B',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}>
                      {n.unread ? 'वाचले म्हणून खूण करा' : 'न वाचलेले करा'}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(n)}
                      style={{
                        background: '#FAF6F0',
                        border: '1px solid #DD8A2E',
                        color: '#C9701C',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}>
                      ✏️ संपादित
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      style={{
                        background: '#FFF',
                        border: '1px solid #E6DDCE',
                        color: '#991B1B',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        cursor: 'pointer'
                      }}>
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{
              background: '#FFF',
              borderRadius: '16px',
              padding: '48px',
              textAlign: 'center',
              border: '1px dashed #DD8A2E',
              color: '#666'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📭</div>
              <h3 style={{ color: '#3D0D0D', margin: '0 0 6px' }}>या श्रेणीत कोणत्याही सूचना नाहीत</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>आपण नवीन सूचना जोडू शकता किंवा मूळ सूचना रीसेट करू शकता.</p>
            </div>
          )}
        </div>

        {/* Clear All Footer */}
        {notifications.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={handleClearAll}
              style={{
                background: 'none',
                border: 'none',
                color: '#991B1B',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}>
              सर्व सूचना पुसून टाका (Clear All)
            </button>
          </div>
        )}

        {/* Modal for Add / Edit Notification */}
        {modalOpen && (
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
              maxWidth: '560px',
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
                  {editItem ? '✏️ सूचना संपादित करा' : '➕ नवीन सूचना प्रसारित करा'}
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.4rem', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    सूचनेचे शीर्षक *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="उदा. पुणे चॅप्टर मासिक बैठक"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      श्रेणी *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        const labels = {
                          business: 'व्यवसाय संगम',
                          community: 'समाज व उत्सव',
                          system: 'सिस्टीम व ओळख'
                        };
                        setFormData({ ...formData, category: val, categoryLabel: labels[val] || 'सूचना' });
                      }}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}>
                      <option value="business">व्यवसाय संगम (Business)</option>
                      <option value="community">समाज व उत्सव (Community)</option>
                      <option value="system">सिस्टीम व ओळख (System)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      चिन्ह (Icon)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                    सूचनेचा तपशील *
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="सूचनेचे संपूर्ण विवरण येथे लिहा..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      लिंक (Path)
                    </label>
                    <input
                      type="text"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      placeholder="/referrals किंवा /card"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#3D0D0D', marginBottom: '6px' }}>
                      बटन मजकूर
                    </label>
                    <input
                      type="text"
                      value={formData.linkLabel}
                      onChange={(e) => setFormData({ ...formData, linkLabel: e.target.value })}
                      placeholder="उदा. तपशील पहा →"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E6DDCE', fontSize: '0.92rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    style={{ padding: '9px 16px', background: '#FAF6F0', border: '1px solid #E6DDCE', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '9px 20px', background: '#EA580C', color: '#FFF', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 800 }}>
                    {editItem ? 'बदल जतन करा ✓' : 'सूचना प्रसारित करा ✓'}
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
