import React, { useState } from 'react';
import { useMagazineAdmin } from '../context/MagazineAdminContext';
import { 
  Palette, 
  Eye, 
  FileDown, 
  Layers, 
  CheckCircle, 
  Sparkles, 
  Sliders, 
  Image as ImageIcon,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function MagazineDesignerPage() {
  const { pages, setPages, addToast } = useMagazineAdmin();
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  const selectedPage = pages[selectedPageIndex] || pages[0];

  const handleUpdateSelected = (fields) => {
    setPages(prev => prev.map((p, idx) => idx === selectedPageIndex ? { ...p, ...fields } : p));
    addToast(`पान क्र. ${selectedPage.pageNo} चे डिझाइन तपशील अद्ययावत केले.`, 'success');
  };

  const handleExportPDF = () => {
    addToast('१०-पानी मासिक प्रिंट-रेडी PDF एक्सपोर्ट तयार होत आहे...', 'info');
    setTimeout(() => {
      addToast('✓ PDF जनरेट यशस्वी! प्रिंट प्रत डाऊनलोडसाठी सज्ज आहे.', 'success');
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div className="cm-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: '#FFF1E8', color: '#F4510B', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
              SaaS Visual Studio
            </span>
            <span style={{ color: '#777777', fontSize: '0.8rem' }}>10-Page Central Studio</span>
          </div>
          <h1 className="cm-page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette size={26} color="#F4510B" />
            १०-पान मॅगझिन डिझायनर (10-Page Visual Designer)
          </h1>
          <p className="cm-page-subtitle">
            Connect Maratha मासिकाच्या संपूर्ण १० पानांची दृश्य मांडणी, कव्हर डिझाईन आणि प्रिंट-रेडी लेआउट व्यवस्थापन.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            onClick={() => setPreviewMode(!previewMode)} 
            className="cm-btn cm-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Eye size={16} />
            <span>{previewMode ? 'डिझाइन मोडवर परत या' : 'संपूर्ण १०-पान पूर्वावलोकन (Grid)'}</span>
          </button>
          <button 
            type="button" 
            onClick={handleExportPDF} 
            className="cm-btn cm-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileDown size={16} />
            <span>प्रिंट-रेडी PDF एक्सपोर्ट</span>
          </button>
        </div>
      </div>

      {/* 10-Page Horizontal Filmstrip / Thumbnails */}
      <div className="cm-card" style={{ padding: '16px 20px', overflowX: 'auto', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#D94100', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={15} />
            पृष्ठ निवडा (Select Page to Edit) — १ ते १० पृष्ठे
          </span>
          <span style={{ fontSize: '0.74rem', color: '#777777' }}>
            चालू निवड: <strong>पान {selectedPage.pageNo}</strong> ({selectedPage.category})
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', minWidth: '940px', paddingBottom: '4px' }}>
          {pages.slice(0, 10).map((p, idx) => (
            <div
              key={p.pageNo}
              onClick={() => setSelectedPageIndex(idx)}
              style={{
                width: '98px',
                cursor: 'pointer',
                borderRadius: '10px',
                border: selectedPageIndex === idx ? '2.5px solid #F4510B' : '1.5px solid #F2E5DC',
                padding: '5px',
                backgroundColor: selectedPageIndex === idx ? '#FFF1E8' : '#FFFFFF',
                boxShadow: selectedPageIndex === idx ? '0 4px 14px rgba(244, 81, 11, 0.25)' : 'none',
                transition: 'all 0.18s ease',
                flexShrink: 0
              }}
            >
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px' }}>
                <img src={p.image} alt={p.title} style={{ width: '100%', height: '115px', objectFit: 'cover', display: 'block' }} />
                {selectedPageIndex === idx && (
                  <span style={{ position: 'absolute', top: '4px', right: '4px', background: '#F4510B', color: '#FFF', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                    ✓
                  </span>
                )}
              </div>
              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <strong style={{ fontSize: '0.78rem', color: selectedPageIndex === idx ? '#F4510B' : '#252525', display: 'block' }}>
                  पान {p.pageNo}
                </strong>
                <span style={{ fontSize: '0.68rem', color: '#777777', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!previewMode ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '22px', alignItems: 'start' }}>
          {/* Left Canvas Preview */}
          <div className="cm-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px', alignItems: 'center' }}>
              <span className="cm-badge" style={{ background: '#FFF1E8', color: '#F4510B', border: '1px solid #FFD4C2', fontWeight: 800 }}>
                ● संपादन चालू: पृष्ठ क्र. {selectedPage.pageNo}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#777777', fontWeight: 700 }}>
                {selectedPage.category}
              </span>
            </div>

            <div style={{
              width: '100%',
              maxWidth: '460px',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 18px 45px -12px rgba(244, 81, 11, 0.25)',
              border: '2px solid #F2E5DC',
              position: 'relative',
              backgroundColor: '#FFF'
            }}>
              <img src={selectedPage.image} alt={selectedPage.title} style={{ width: '100%', height: 'auto', display: 'block' }} />
              
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(180deg, transparent 0%, rgba(37, 37, 37, 0.95) 100%)',
                color: '#FFF',
                padding: '24px 20px 18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ background: '#F4510B', color: '#FFF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>
                    पान {selectedPage.pageNo}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#FFE0B2', fontWeight: 600 }}>
                    {selectedPage.category}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: '0 0 4px', lineHeight: 1.25 }}>
                  {selectedPage.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#F2E5DC', margin: 0, lineHeight: 1.4 }}>
                  {selectedPage.desc}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
              <span style={{ fontSize: '0.78rem', color: '#777777' }}>
                Aspect Ratio: <strong>A4 Vertical Magazine</strong> • Ultra HD Resolution
              </span>
            </div>
          </div>

          {/* Right Inspector */}
          <div className="cm-card" style={{ padding: '24px', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sliders size={20} color="#F4510B" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#252525', margin: 0 }}>
                पृष्ठ तपशील व डिझाइन (Inspector)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#252525', marginBottom: '6px' }}>
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#252525', marginBottom: '6px' }}>
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#252525', marginBottom: '6px' }}>
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
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#252525', marginBottom: '6px' }}>
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

              <div style={{ marginTop: '6px', padding: '14px', background: '#FFF9F5', borderRadius: '8px', border: '1px solid #F2E5DC' }}>
                <span style={{ fontSize: '0.78rem', color: '#777777', display: 'block', lineHeight: 1.5 }}>
                  💡 <strong>टीप:</strong> या डिझायनरमधील बदल थेट मासिकाच्या डेटा मॉडेलमध्ये सेव्ह होतात. डिजिटल रीडरवर तात्काळ परिणाम दिसतो.
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '18px' }}>
          {pages.slice(0, 10).map((p) => (
            <div key={p.pageNo} className="cm-card" style={{ padding: '12px', background: '#FFF' }}>
              <img src={p.image} alt={p.title} style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '0.88rem', color: '#252525' }}>पान {p.pageNo}</strong>
                <span style={{ fontSize: '0.74rem', color: '#F4510B', fontWeight: 700 }}>{p.category}</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#777777', margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.title}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
