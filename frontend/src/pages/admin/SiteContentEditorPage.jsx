import React, { useState, useEffect } from 'react';
import { useSiteContent } from '../../context/SiteContentContext';
import { Link } from 'react-router-dom';

export default function SiteContentEditorPage() {
  const { content, saveAllContent, resetToDefault, isSaving } = useSiteContent();
  const [formData, setFormData] = useState(content);
  const [activeTab, setActiveTab] = useState('texts'); // texts, buttons, images, links, forms, header
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Sync state whenever context content changes
  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  // Nested property updater
  const handleFieldChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setSaveSuccess(false);
  };

  // Deep button updater
  const handleButtonChange = (btnKey, field, value) => {
    setFormData((prev) => ({
      ...prev,
      buttons: {
        ...prev.buttons,
        [btnKey]: {
          ...prev.buttons?.[btnKey],
          [field]: value
        }
      }
    }));
    setSaveSuccess(false);
  };

  // Navigation link updater
  const handleNavLinkChange = (index, field, value) => {
    setFormData((prev) => {
      const navList = [...(prev.links?.navigation || [])];
      navList[index] = { ...navList[index], [field]: value };
      return {
        ...prev,
        links: {
          ...prev.links,
          navigation: navList
        }
      };
    });
    setSaveSuccess(false);
  };

  // Save handler
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      await saveAllContent(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      alert('त्रुटी: बदल जतन करता आले नाहीत - ' + err.message);
    }
  };

  // Reset handler
  const handleReset = async () => {
    if (window.confirm('तुम्हाला सर्व वेबसाइट डेटा पूर्ववत (Default) करायचा आहे का? केलेले बदल पूर्ववत होतील.')) {
      try {
        const res = await resetToDefault();
        if (res?.reset) {
          setFormData(res.reset);
          alert('वेबसाइट डेटा यशस्वीरीत्या पूर्ववत केला गेला!');
        }
      } catch (err) {
        alert('त्रुटी: ' + err.message);
      }
    }
  };

  const tabs = [
    { id: 'texts', label: '📝 मजकूर व शीर्षके (Texts & Headings)', icon: '📝' },
    { id: 'buttons', label: '🔘 बटणे व क्रिया (Buttons & CTAs)', icon: '🔘' },
    { id: 'images', label: '🖼️ चित्रे व बॅनर (Images & Banners)', icon: '🖼️' },
    { id: 'links', label: '🔗 लिंक्स व मेन्यू (Links & Navigation)', icon: '🔗' },
    { id: 'forms', label: '📋 फॉर्म्स व संपर्क (Forms & Contact)', icon: '📋' },
    { id: 'header', label: '🚩 हेडर व फुटर (Header & Footer)', icon: '🚩' }
  ];

  return (
    <div style={{ background: '#F8F9FA', minHeight: '100vh', padding: '30px 20px', color: '#1A202C' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Top Header Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #BF360C 0%, #D84315 100%)',
          borderRadius: '16px',
          padding: '24px 30px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(191,54,12,0.25)',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '2rem' }}>🎨</span>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900 }}>
                  वेबसाइट डेटा व्यवस्थापन कक्ष (CMS Content Editor)
                </h1>
                <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '0.92rem' }}>
                  मजकूर, चित्रे, बटणे, लिंक्स व फॉर्म्स थेट संपादित करा — बदल डेटाबेसमध्ये लगेच जतन होतात.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link
              to="/"
              target="_blank"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.9rem'
              }}
            >
              👁️ थेट वेबसाइट पहा
            </Link>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: '#FFD54F',
                color: '#BF360C',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontWeight: 800,
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSaving ? '⏳ जतन करत आहे...' : '💾 बदल डेटाबेसमध्ये जतन करा'}
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccess && (
          <div style={{
            background: '#E8F5E9',
            border: '1.5px solid #2E7D32',
            color: '#1B5E20',
            padding: '14px 20px',
            borderRadius: '10px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontWeight: 700
          }}>
            <span>✅ बदल यशस्वीरीत्या backend/db.json व SQLite डेटाबेसमध्ये जतन झाले असून संपूर्ण वेबसाइटवर लगेच परावर्तित झाले आहेत!</span>
            <button onClick={() => setSaveSuccess(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '10px',
          marginBottom: '20px',
          borderBottom: '2px solid #E2E8F0'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                borderRadius: '10px 10px 0 0',
                border: 'none',
                background: activeTab === tab.id ? '#FFFFFF' : '#EDF2F7',
                color: activeTab === tab.id ? '#BF360C' : '#4A5568',
                fontWeight: activeTab === tab.id ? 800 : 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? '3px solid #BF360C' : 'none',
                boxShadow: activeTab === tab.id ? '0 -2px 8px rgba(0,0,0,0.05)' : 'none',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid #E2E8F0'
        }}>

          {/* TAB 1: TEXTS & HEADINGS */}
          {activeTab === 'texts' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#BF360C', marginBottom: '20px' }}>
                📝 मुख्य शीर्षके व मजकूर (Headings & Texts)
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>मुख्य शीर्षक (Hero Main Title)</label>
                  <input
                    type="text"
                    value={formData?.hero?.title || ''}
                    onChange={(e) => handleFieldChange('hero', 'title', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>उपशीर्षक (Hero Subtitle)</label>
                  <input
                    type="text"
                    value={formData?.hero?.subtitle || ''}
                    onChange={(e) => handleFieldChange('hero', 'subtitle', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>मुख्य परिचय वर्णन (Hero Description)</label>
                  <textarea
                    rows="3"
                    value={formData?.hero?.description || ''}
                    onChange={(e) => handleFieldChange('hero', 'description', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>स्क्रोलिंग घोषणा पट्टी (Announcement Marquee)</label>
                  <input
                    type="text"
                    value={formData?.hero?.announcementMarquee || ''}
                    onChange={(e) => handleFieldChange('hero', 'announcementMarquee', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0', fontSize: '0.95rem', color: '#BF360C', fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>ध्येय व मिशन (Mission Statement)</label>
                  <textarea
                    rows="3"
                    value={formData?.texts?.missionStatement || ''}
                    onChange={(e) => handleFieldChange('texts', 'missionStatement', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>दृष्टिकोन व व्हिजन (Vision Statement)</label>
                  <textarea
                    rows="3"
                    value={formData?.texts?.visionStatement || ''}
                    onChange={(e) => handleFieldChange('texts', 'visionStatement', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0', fontSize: '0.95rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>आपत्कालीन सूचना (Emergency Notice)</label>
                  <input
                    type="text"
                    value={formData?.texts?.emergencyNotice || ''}
                    onChange={(e) => handleFieldChange('texts', 'emergencyNotice', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0', fontSize: '0.95rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUTTONS & CTAS */}
          {activeTab === 'buttons' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#BF360C', marginBottom: '20px' }}>
                🔘 बटणे, लेबल्स व लिंक्स (Buttons & CTAs)
              </h2>
              <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '24px' }}>
                येथे बटणांचे नाव, लिंक, रंग व दृश्यमानता (Show/Hide) बदलू शकता.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {Object.entries(formData?.buttons || {}).map(([btnKey, btn]) => (
                  <div
                    key={btnKey}
                    style={{
                      background: '#F7FAFC',
                      padding: '18px 22px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 2fr 1fr 1fr',
                      gap: '16px',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 700, textTransform: 'uppercase' }}>बटन ओळख: {btnKey}</span>
                      <input
                        type="text"
                        value={btn.label || ''}
                        onChange={(e) => handleButtonChange(btnKey, 'label', e.target.value)}
                        placeholder="बटन मजकूर"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E0', marginTop: '4px', fontWeight: 700 }}
                      />
                    </div>

                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 700 }}>लक्ष्य लिंक (Target URL/Path)</span>
                      <input
                        type="text"
                        value={btn.link || ''}
                        onChange={(e) => handleButtonChange(btnKey, 'link', e.target.value)}
                        placeholder="उदा. /register किंवा tel:18002091674"
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E0', marginTop: '4px' }}
                      />
                    </div>

                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 700 }}>रंग (Color)</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <input
                          type="color"
                          value={btn.color || '#BF360C'}
                          onChange={(e) => handleButtonChange(btnKey, 'color', e.target.value)}
                          style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{btn.color}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 700, display: 'block' }}>स्थिती (Visibility)</span>
                      <button
                        type="button"
                        onClick={() => handleButtonChange(btnKey, 'visible', !btn.visible)}
                        style={{
                          marginTop: '6px',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: 'none',
                          background: btn.visible ? '#C6F6D5' : '#FED7D7',
                          color: btn.visible ? '#22543D' : '#742A2A',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        {btn.visible ? '✓ सक्रिय (Visible)' : '✕ लपवा (Hidden)'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: IMAGES & BANNERS */}
          {activeTab === 'images' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#BF360C', marginBottom: '20px' }}>
                🖼️ चित्रे, लोगो व बॅनर व्यवस्थापन (Images & Media)
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
                {Object.entries(formData?.images || {}).map(([imgKey, imgUrl]) => (
                  <div
                    key={imgKey}
                    style={{
                      background: '#F7FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2D3748' }}>
                        {imgKey}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewImage(imgUrl)}
                        style={{ background: 'none', border: 'none', color: '#BF360C', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                      >
                        मोठे करून पहा ↗
                      </button>
                    </div>

                    <div style={{ height: '140px', background: '#EDF2F7', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img
                        src={imgUrl}
                        alt={imgKey}
                        onError={(e) => { e.target.src = '/assets/images/maratha-samrajya.jpg'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#718096', fontWeight: 600 }}>इमेज URL / पाथ</label>
                      <input
                        type="text"
                        value={imgUrl || ''}
                        onChange={(e) => handleFieldChange('images', imgKey, e.target.value)}
                        placeholder="उदा. /assets/images/... किंवा https://..."
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E0', fontSize: '0.85rem', marginTop: '3px' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LINKS & NAVIGATION */}
          {activeTab === 'links' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#BF360C', marginBottom: '20px' }}>
                🔗 नेव्हिगेशन मेन्यू व सोशल मीडिया लिंक्स (Links & Navigation)
              </h2>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2D3748', margin: '20px 0 12px' }}>
                📌 मुख्य हेडर मेन्यू आयटम्स (Navbar Links)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(formData?.links?.navigation || []).map((nav, idx) => (
                  <div
                    key={nav.id || idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 3fr 1fr',
                      gap: '12px',
                      background: '#F7FAFC',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#718096', fontWeight: 600 }}>मेन्यू नाव (Label)</label>
                      <input
                        type="text"
                        value={nav.label || ''}
                        onChange={(e) => handleNavLinkChange(idx, 'label', e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E0', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: '#718096', fontWeight: 600 }}>राउट / पाथ (Path)</label>
                      <input
                        type="text"
                        value={nav.path || ''}
                        onChange={(e) => handleNavLinkChange(idx, 'path', e.target.value)}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E0' }}
                      />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleNavLinkChange(idx, 'visible', !nav.visible)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: 'none',
                          background: nav.visible ? '#C6F6D5' : '#E2E8F0',
                          color: nav.visible ? '#22543D' : '#4A5568',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          marginTop: '16px'
                        }}
                      >
                        {nav.visible ? 'सक्रिय' : 'लपवा'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2D3748', margin: '30px 0 12px' }}>
                🌐 सोशल मीडिया प्रोफाईल लिंक्स
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {Object.entries(formData?.links?.social || {}).map(([platform, url]) => (
                  <div key={platform}>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', textTransform: 'capitalize', marginBottom: '4px' }}>
                      {platform}
                    </label>
                    <input
                      type="text"
                      value={url || ''}
                      onChange={(e) => {
                        const updatedSocial = { ...formData.links.social, [platform]: e.target.value };
                        setFormData((prev) => ({ ...prev, links: { ...prev.links, social: updatedSocial } }));
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E0' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FORMS & CONTACT */}
          {activeTab === 'forms' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#BF360C', marginBottom: '20px' }}>
                📋 फॉर्म्स व संपर्क माहिती (Forms & Support Config)
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
                <div style={{ background: '#F7FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '1.05rem', color: '#BF360C' }}>📞 मध्यवर्ती संपर्क कक्ष</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem' }}>आपत्कालीन २४x७ हेल्पलाइन</label>
                      <input
                        type="text"
                        value={formData?.forms?.contactSupport?.emergencyHelpline || ''}
                        onChange={(e) => {
                          const updated = { ...formData.forms.contactSupport, emergencyHelpline: e.target.value };
                          handleFieldChange('forms', 'contactSupport', updated);
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E0' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem' }}>अधिकृत फोन</label>
                      <input
                        type="text"
                        value={formData?.forms?.contactSupport?.phone || ''}
                        onChange={(e) => {
                          const updated = { ...formData.forms.contactSupport, phone: e.target.value };
                          handleFieldChange('forms', 'contactSupport', updated);
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E0' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem' }}>ईमेल (Support Email)</label>
                      <input
                        type="email"
                        value={formData?.forms?.contactSupport?.email || ''}
                        onChange={(e) => {
                          const updated = { ...formData.forms.contactSupport, email: e.target.value };
                          handleFieldChange('forms', 'contactSupport', updated);
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E0' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem' }}>मुख्य कार्यालय पत्ता</label>
                      <textarea
                        rows="2"
                        value={formData?.forms?.contactSupport?.address || ''}
                        onChange={(e) => {
                          const updated = { ...formData.forms.contactSupport, address: e.target.value };
                          handleFieldChange('forms', 'contactSupport', updated);
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E0' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#F7FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '1.05rem', color: '#BF360C' }}>📝 फॉर्म्स मार्गदर्शक सूचना</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem' }}>सदस्यता फॉर्म शीर्षक</label>
                      <input
                        type="text"
                        value={formData?.forms?.memberRegistration?.title || ''}
                        onChange={(e) => {
                          const updated = { ...formData.forms.memberRegistration, title: e.target.value };
                          handleFieldChange('forms', 'memberRegistration', updated);
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E0' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem' }}>सदस्यता फॉर्म सूचना (Notice)</label>
                      <textarea
                        rows="2"
                        value={formData?.forms?.memberRegistration?.instructions || ''}
                        onChange={(e) => {
                          const updated = { ...formData.forms.memberRegistration, instructions: e.target.value };
                          handleFieldChange('forms', 'memberRegistration', updated);
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E0' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem' }}>रक्त मागणी सूचना (SOS Form Notice)</label>
                      <textarea
                        rows="2"
                        value={formData?.forms?.bloodSosForm?.urgentNotice || ''}
                        onChange={(e) => {
                          const updated = { ...formData.forms.bloodSosForm, urgentNotice: e.target.value };
                          handleFieldChange('forms', 'bloodSosForm', updated);
                        }}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E0' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: HEADER & FOOTER */}
          {activeTab === 'header' && (
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#BF360C', marginBottom: '20px' }}>
                🚩 हेडर, ब्रँडिंग व फुटर मजकूर (Header & Footer)
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>ब्रँड नाव (Brand Title)</label>
                  <input
                    type="text"
                    value={formData?.header?.brandTitle || ''}
                    onChange={(e) => handleFieldChange('header', 'brandTitle', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>ब्रँड उपशीर्षक (Brand Subtitle)</label>
                  <input
                    type="text"
                    value={formData?.header?.brandSubtitle || ''}
                    onChange={(e) => handleFieldChange('header', 'brandSubtitle', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>हेडर CTA बटण मजकूर</label>
                  <input
                    type="text"
                    value={formData?.header?.ctaButtonText || ''}
                    onChange={(e) => handleFieldChange('header', 'ctaButtonText', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>हेडर CTA बटण लिंक</label>
                  <input
                    type="text"
                    value={formData?.header?.ctaButtonLink || ''}
                    onChange={(e) => handleFieldChange('header', 'ctaButtonLink', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>फुटर कॉपीराइट मजकूर (Footer Copyright)</label>
                  <input
                    type="text"
                    value={formData?.footer?.copyright || ''}
                    onChange={(e) => handleFieldChange('footer', 'copyright', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '6px' }}>फुटर परिचय मजकूर (Footer About)</label>
                  <textarea
                    rows="3"
                    value={formData?.texts?.footerAbout || ''}
                    onChange={(e) => handleFieldChange('texts', 'footerAbout', e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E0' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div style={{
            marginTop: '36px',
            paddingTop: '20px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: '#FFF5F5',
                color: '#C53030',
                border: '1px solid #FEB2B2',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔄 मूळ डेटा पूर्ववत करा (Reset to Defaults)
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  background: '#BF360C',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(191,54,12,0.3)',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                {isSaving ? 'जतन करत आहे...' : '💾 सर्व बदल डेटाबेसमध्ये जतन करा'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modal: Full Preview of Image */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
        >
          <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
            <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px' }} />
            <div style={{ marginTop: '12px', color: '#fff', fontSize: '0.9rem' }}>क्लिक करून बंद करा</div>
          </div>
        </div>
      )}
    </div>
  );
}
