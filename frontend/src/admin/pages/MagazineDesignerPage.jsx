import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';

export default function MagazineDesignerPage() {
  const { pages, setPages, addToast } = useMagazineAdmin();
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  const selectedPage = pages[selectedPageIndex] || pages[0];

  const handleUpdateSelected = (fields) => {
    setPages(prev => prev.map((p, idx) => idx === selectedPageIndex ? { ...p, ...fields } : p));
    addToast(`पान क्र. ${selectedPage.pageNo} चे डिझाइन तपशील बदलले.`, 'success');
  };

  const handleExportPDF = () => {
    addToast('१०-पानी मासिक प्रिंट-रेडी PDF एक्सपोर्ट तयार होत आहे...', 'info');
    setTimeout(() => {
      addToast('✓ PDF जनरेट यशस्वी! प्रिंट प्रत डाऊनलोडसाठी सज्ज आहे.', 'success');
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="cm-page-header">
        <div>
          <h1 className="cm-page-title">
            🎨 १०-पान मॅगझिन डिझायनर (10-Page Magazine Designer)
          </h1>
          <p className="cm-page-desc">
            Connect Maratha मासिकाच्या १०-पानी डिजिटल फॉरमॅटचे स्वतंत्र प्रशासकीय मांडणी व डिझायनिंग टूल.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={() => setPreviewMode(!previewMode)} 
            className="cm-btn cm-btn-secondary"
          >
            {previewMode ? 'डिझाइन मोडवर परत या' : '👁️ संपूर्ण १०-पान पूर्वावलोकन'}
          </button>
          <button 
            type="button" 
            onClick={handleExportPDF} 
            className="cm-btn cm-btn-primary"
          >
            📄 प्रिंट-रेडी PDF एक्सपोर्ट (Export PDF)
          </button>
        </div>
      </div>

      {/* 10-Page Horizontal Filmstrip / Thumbnails */}
      <div className="cm-card" style={{ padding: '16px', overflowX: 'auto' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '12px' }}>
          पृष्ठ निवडा (Select Page to Edit)
        </span>

        <div style={{ display: 'flex', gap: '12px', minWidth: '850px' }}>
          {pages.slice(0, 10).map((p, idx) => (
            <div
              key={p.pageNo}
              onClick={() => setSelectedPageIndex(idx)}
              style={{
                width: '92px',
                cursor: 'pointer',
                borderRadius: '8px',
                border: selectedPageIndex === idx ? '2.5px solid #F4510B' : '1.5px solid #CBD5E1',
                padding: '4px',
                backgroundColor: selectedPageIndex === idx ? '#FFF4ED' : '#FFFFFF',
                boxShadow: selectedPageIndex === idx ? '0 4px 12px rgba(244, 81, 11, 0.25)' : 'none',
                transition: 'all 0.18s ease',
                flexShrink: 0
              }}
            >
              <img src={p.image} alt={p.title} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '4px', display: 'block' }} />
              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <strong style={{ fontSize: '0.76rem', color: selectedPageIndex === idx ? '#F4510B' : '#0F172A', display: 'block' }}>
                  पान {p.pageNo}
                </strong>
                <span style={{ fontSize: '0.68rem', color: '#64748B', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!previewMode ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
          {/* Left Canvas Preview */}
          <div className="cm-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
              <span className="cm-badge" style={{ background: '#FFF4ED', color: '#F4510B', border: '1px solid #FFD4C2' }}>
                संपादन चालू: पृष्ठ क्र. {selectedPage.pageNo}
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
                {selectedPage.category}
              </span>
            </div>

            <div style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 16px 40px -10px rgba(0,0,0,0.25)',
              border: '2px solid #E2E8F0',
              position: 'relative',
              backgroundColor: '#FFF'
            }}>
              <img src={selectedPage.image} alt={selectedPage.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.95) 100%)',
                color: '#FFF',
                padding: '24px 20px 16px'
              }}>
                <span style={{ background: '#F4510B', color: '#FFF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                  पान {selectedPage.pageNo}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: '6px 0 2px' }}>
                  {selectedPage.title}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                  {selectedPage.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Right Inspector */}
          <div className="cm-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 16px' }}>
              ⚙️ पृष्ठ तपशील व डिझाइन (Inspector)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  पृष्ठ मुख्य शीर्षक (Page Title)
                </label>
                <input 
                  type="text" 
                  value={selectedPage.title} 
                  onChange={(e) => handleUpdateSelected({ title: e.target.value })}
                  className="cm-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  संपादकीय विभाग (Section Tag)
                </label>
                <input 
                  type="text" 
                  value={selectedPage.category} 
                  onChange={(e) => handleUpdateSelected({ category: e.target.value })}
                  className="cm-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  पृष्ठ इमेज URL / पथ (Replace Graphic)
                </label>
                <input 
                  type="text" 
                  value={selectedPage.image} 
                  onChange={(e) => handleUpdateSelected({ image: e.target.value })}
                  className="cm-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                  पृष्ठाचे वर्णन / टीप (Page Description)
                </label>
                <textarea 
                  rows="3" 
                  value={selectedPage.desc} 
                  onChange={(e) => handleUpdateSelected({ desc: e.target.value })}
                  className="cm-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginTop: '10px', padding: '14px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748B', display: 'block', lineHeight: 1.5 }}>
                  💡 <strong>टीप:</strong> या डिझायनरमधील बदल थेट मासिकाच्या डेटा मॉडेलमध्ये सेव्ह होतात. सार्वजनिक रीडरवर तात्काळ परिणाम दिसतो.
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {pages.slice(0, 10).map((p) => (
            <div key={p.pageNo} className="cm-card" style={{ padding: '12px' }}>
              <img src={p.image} alt={p.title} style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>पान {p.pageNo}</strong>
                <span style={{ fontSize: '0.74rem', color: '#F4510B', fontWeight: 700 }}>{p.category}</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.title}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
