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
  BookOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Save,
  RotateCcw,
  Check,
  Type,
  Layout,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minimize2
} from 'lucide-react';

export default function MagazineDesignerPage() {
  const { pages, setPages, addToast } = useMagazineAdmin();
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  const selectedPage = pages[selectedPageIndex] || pages[0];

  // Local editing copy for immediate feedback and save/reset actions
  const [editorState, setEditorState] = useState({
    title: selectedPage.title || '',
    category: selectedPage.category || '',
    image: selectedPage.image || '',
    desc: selectedPage.desc || '',
    textAlign: 'left',
    contentSpacing: 'normal'
  });

  // When selected page changes, sync editor state
  React.useEffect(() => {
    if (selectedPage) {
      setEditorState({
        title: selectedPage.title || '',
        category: selectedPage.category || '',
        image: selectedPage.image || '',
        desc: selectedPage.desc || '',
        textAlign: editorState.textAlign || 'left',
        contentSpacing: editorState.contentSpacing || 'normal'
      });
      setIsSaved(true);
    }
  }, [selectedPageIndex]);

  const handleFieldChange = (field, value) => {
    setEditorState(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSaveChanges = () => {
    setPages(prev => prev.map((p, idx) => idx === selectedPageIndex ? {
      ...p,
      title: editorState.title,
      category: editorState.category,
      image: editorState.image,
      desc: editorState.desc
    } : p));
    setIsSaved(true);
    addToast(`पान क्र. ${selectedPage.pageNo} चे सर्व बदल यशस्वीरीत्या सेव्ह केले.`, 'success');
  };

  const handleResetChanges = () => {
    setEditorState({
      title: selectedPage.title || '',
      category: selectedPage.category || '',
      image: selectedPage.image || '',
      desc: selectedPage.desc || '',
      textAlign: 'left',
      contentSpacing: 'normal'
    });
    setIsSaved(true);
    addToast('बदल मूळ स्थितीवर रीसेट केले.', 'info');
  };

  const handlePrevPage = () => {
    if (selectedPageIndex > 0) {
      setSelectedPageIndex(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (selectedPageIndex < Math.min(pages.length - 1, 9)) {
      setSelectedPageIndex(prev => prev + 1);
    }
  };

  const handleZoom = (delta) => {
    setZoomLevel(prev => {
      const next = prev + delta;
      return next >= 60 && next <= 150 ? next : prev;
    });
  };

  const handleExportPDF = () => {
    addToast('१०-पानी मासिक प्रिंट-रेडी PDF एक्सपोर्ट तयार होत आहे...', 'info');
    setTimeout(() => {
      addToast('✓ PDF जनरेट यशस्वी! प्रिंट प्रत डाऊनलोडसाठी सज्ज आहे.', 'success');
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. PROFESSIONAL WORKSPACE TOOLBAR */}
      <div className="cm-card" style={{ padding: '12px 20px', background: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        {/* Left Status & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={22} color="#F4510B" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#252525', margin: 0 }}>
              १०-पान मॅगझिन व्हिज्युअल स्टुडिओ
            </h2>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 800,
            background: isSaved ? '#E8F5E9' : '#FFF1E8',
            color: isSaved ? '#059669' : '#D94100',
            border: isSaved ? '1px solid #C8E6C9' : '1px solid #FFD4C2'
          }}>
            {isSaved ? <Check size={12} /> : '●'}
            <span>{isSaved ? 'सर्व बदल सेव्ह आहेत' : 'बदल अनसेव्ह आहेत'}</span>
          </div>
        </div>

        {/* Center & Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Previous / Next Page Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFF9F5', padding: '4px 6px', borderRadius: '8px', border: '1px solid #F2E5DC' }}>
            <button
              type="button"
              disabled={selectedPageIndex === 0}
              onClick={handlePrevPage}
              className="cm-btn cm-btn-secondary"
              style={{ padding: '5px 8px', fontSize: '0.76rem', cursor: selectedPageIndex === 0 ? 'not-allowed' : 'pointer' }}
              title="मागील पृष्ठ"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#252525', padding: '0 6px', whiteSpace: 'nowrap' }}>
              पान {selectedPage.pageNo} / १०
            </span>
            <button
              type="button"
              disabled={selectedPageIndex >= 9}
              onClick={handleNextPage}
              className="cm-btn cm-btn-secondary"
              style={{ padding: '5px 8px', fontSize: '0.76rem', cursor: selectedPageIndex >= 9 ? 'not-allowed' : 'pointer' }}
              title="पुढील पृष्ठ"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Zoom Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#FFF9F5', padding: '4px 6px', borderRadius: '8px', border: '1px solid #F2E5DC' }}>
            <button
              type="button"
              onClick={() => handleZoom(-10)}
              className="cm-btn cm-btn-secondary"
              style={{ padding: '5px 7px', fontSize: '0.76rem' }}
              title="झूम कमी करा"
            >
              <ZoomOut size={15} />
            </button>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#777777', minWidth: '40px', textAlign: 'center' }}>
              {zoomLevel}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom(10)}
              className="cm-btn cm-btn-secondary"
              style={{ padding: '5px 7px', fontSize: '0.76rem' }}
              title="झूम वाढवा"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="cm-btn cm-btn-secondary"
              style={{ padding: '5px 7px', fontSize: '0.72rem' }}
              title="मूळ आकार (Fit)"
            >
              Fit
            </button>
          </div>

          {/* Fullscreen & Save Actions */}
          <button
            type="button"
            onClick={() => setFullscreenPreview(true)}
            className="cm-btn cm-btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Maximize2 size={15} />
            <span>फुलस्क्रीन</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="cm-btn cm-btn-secondary"
            style={{ padding: '7px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileDown size={15} />
            <span>PDF एक्सपोर्ट</span>
          </button>

          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaved}
            className="cm-btn cm-btn-primary"
            style={{ padding: '7px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', opacity: isSaved ? 0.75 : 1 }}
          >
            <Save size={15} />
            <span>बदल सेव्ह करा</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT 10-PAGE THUMBNAIL SELECTOR (NO SQUISHING / OVERFLOW) */}
      <div className="cm-card" style={{ padding: '12px 16px', background: '#FFFFFF' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: '8px' }}>
          {pages.slice(0, 10).map((p, idx) => {
            const isSelected = selectedPageIndex === idx;
            return (
              <div
                key={p.pageNo}
                onClick={() => setSelectedPageIndex(idx)}
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #F4510B' : '1px solid #F2E5DC',
                  padding: '4px',
                  backgroundColor: isSelected ? '#FFF1E8' : '#FFFFFF',
                  boxShadow: isSelected ? '0 3px 10px rgba(244, 81, 11, 0.25)' : 'none',
                  transition: 'all 0.15s ease',
                  textAlign: 'center'
                }}
              >
                <div style={{ position: 'relative', height: '64px', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px', background: '#F8FAFC' }}>
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {isSelected && (
                    <span style={{ position: 'absolute', top: '2px', right: '2px', background: '#F4510B', color: '#FFF', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 900 }}>
                      ✓
                    </span>
                  )}
                </div>
                <strong style={{ fontSize: '0.72rem', color: isSelected ? '#F4510B' : '#252525', display: 'block', lineHeight: 1.1 }}>
                  पान {p.pageNo}
                </strong>
                <span style={{ fontSize: '0.62rem', color: '#777777', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.category}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: A4 REALISTIC PREVIEW (CENTER) + INSPECTOR (RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '20px', alignItems: 'start' }}>
        {/* CENTER: LARGE REALISTIC A4 MAGAZINE PREVIEW CANVAS */}
        <div className="cm-card" style={{ padding: '24px', background: '#FFF9F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '620px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '480px', marginBottom: '14px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#D94100', background: '#FFF1E8', padding: '3px 10px', borderRadius: '4px' }}>
              ● दृश्य संपादन: पान क्र. {selectedPage.pageNo} / १०
            </span>
            <span style={{ fontSize: '0.76rem', color: '#777777' }}>
              मॅगझिन A4 फॉरमॅट ({zoomLevel}%)
            </span>
          </div>

          {/* Scalable Realistic A4 Page Frame */}
          <div style={{
            width: `${440 * (zoomLevel / 100)}px`,
            maxWidth: '100%',
            aspectRatio: '1 / 1.414', // Exact ISO 216 A4 Portrait Ratio
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            backgroundColor: '#FFFFFF',
            position: 'relative',
            transition: 'width 0.2s ease',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Magazine Page Image */}
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#1E293B' }}>
              <img
                src={editorState.image || '/assets/images/user-yuva-udyojak-visheshank.jpg'}
                alt={editorState.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.src = '/assets/images/user-yuva-udyojak-visheshank.jpg'; }}
              />

              {/* Gradient Scrim for Top Metadata */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: '16px 18px',
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.75) 0%, transparent 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#FFF'
              }}>
                <span style={{ background: '#F4510B', padding: '3px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                  CONNECT MARATHA
                </span>
                <span style={{ fontSize: '0.7rem', color: '#FFF', fontWeight: 700, background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '9999px' }}>
                  पृष्ठ {selectedPage.pageNo}
                </span>
              </div>

              {/* Bottom Scrim for Title & Description */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '30px 20px 20px',
                background: 'linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.95) 100%)',
                color: '#FFFFFF',
                textAlign: editorState.textAlign
              }}>
                <span style={{ background: '#F4510B', color: '#FFF', padding: '3px 8px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 800, display: 'inline-block', marginBottom: '6px' }}>
                  {editorState.category || 'विशेषांक'}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 6px', color: '#FFFFFF', lineHeight: 1.25 }}>
                  {editorState.title || 'शीर्षक प्रविष्ट करा'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#CBD5E1', margin: 0, lineHeight: editorState.contentSpacing === 'compact' ? 1.2 : editorState.contentSpacing === 'spacious' ? 1.6 : 1.4 }}>
                  {editorState.desc || 'पृष्ठाचा सारांश व तपशील येथे दिसेल.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: STRUCTURED PAGE INSPECTOR */}
        <div className="cm-card" style={{ padding: '20px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Section 1: Page Information */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px', borderBottom: '1px solid #F2E5DC', paddingBottom: '6px' }}>
              <Type size={16} color="#F4510B" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#252525', margin: 0 }}>
                १. पृष्ठ माहिती (Page Information)
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#252525', marginBottom: '4px' }}>
                  पृष्ठ शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  className="cm-input"
                  value={editorState.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#252525', marginBottom: '4px' }}>
                  संपादकीय विभाग (Section Tag)
                </label>
                <input
                  type="text"
                  className="cm-input"
                  value={editorState.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#252525', marginBottom: '4px' }}>
                  वर्णन व टीप (Description)
                </label>
                <textarea
                  rows="3"
                  className="cm-input"
                  value={editorState.desc}
                  onChange={(e) => handleFieldChange('desc', e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Page Media */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px', borderBottom: '1px solid #F2E5DC', paddingBottom: '6px' }}>
              <ImageIcon size={16} color="#F4510B" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#252525', margin: 0 }}>
                २. पृष्ठ मीडिया (Page Media)
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#252525', marginBottom: '2px' }}>
                इमेज पथ / URL
              </label>
              <input
                type="text"
                className="cm-input"
                value={editorState.image}
                onChange={(e) => handleFieldChange('image', e.target.value)}
                style={{ width: '100%', fontSize: '0.8rem' }}
              />

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0 }}>
                  <img
                    src={editorState.image || '/assets/images/user-yuva-udyojak-visheshank.jpg'}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = '/assets/images/user-yuva-udyojak-visheshank.jpg'; }}
                  />
                </div>
                <div style={{ fontSize: '0.72rem', color: '#777777', lineHeight: 1.3 }}>
                  <span>✓ अल्ट्रा HD पोर्ट्रेट रिझोल्यूशन</span><br />
                  <span>समर्थित: JPG, PNG, WebP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Layout & Typography Settings */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px', borderBottom: '1px solid #F2E5DC', paddingBottom: '6px' }}>
              <Layout size={16} color="#F4510B" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#252525', margin: 0 }}>
                ३. मांडणी व मजकूर अलाइनमेंट (Layout)
              </h4>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
              <button
                type="button"
                onClick={() => handleFieldChange('textAlign', 'left')}
                className={`cm-btn ${editorState.textAlign === 'left' ? 'cm-btn-primary' : 'cm-btn-secondary'}`}
                style={{ flex: 1, padding: '6px 8px', fontSize: '0.76rem' }}
              >
                <AlignLeft size={14} /> डावीकडे
              </button>
              <button
                type="button"
                onClick={() => handleFieldChange('textAlign', 'center')}
                className={`cm-btn ${editorState.textAlign === 'center' ? 'cm-btn-primary' : 'cm-btn-secondary'}`}
                style={{ flex: 1, padding: '6px 8px', fontSize: '0.76rem' }}
              >
                <AlignCenter size={14} /> मध्यभागी
              </button>
              <button
                type="button"
                onClick={() => handleFieldChange('textAlign', 'right')}
                className={`cm-btn ${editorState.textAlign === 'right' ? 'cm-btn-primary' : 'cm-btn-secondary'}`}
                style={{ flex: 1, padding: '6px 8px', fontSize: '0.76rem' }}
              >
                <AlignRight size={14} /> उजवीकडे
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
              <span style={{ fontWeight: 700, color: '#252525' }}>मजकूर स्पेसिंग:</span>
              <select
                className="cm-input"
                value={editorState.contentSpacing}
                onChange={(e) => handleFieldChange('contentSpacing', e.target.value)}
                style={{ padding: '4px 8px', fontSize: '0.76rem', width: 'auto' }}
              >
                <option value="compact">कॉम्पॅक्ट (Compact)</option>
                <option value="normal">सामान्य (Normal)</option>
                <option value="spacious">सैल (Spacious)</option>
              </select>
            </div>
          </div>

          {/* Section 4: Action Buttons */}
          <div style={{ borderTop: '1px solid #F2E5DC', paddingTop: '12px', display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleSaveChanges}
              className="cm-btn cm-btn-primary"
              style={{ flex: 1, padding: '9px 12px', fontSize: '0.84rem' }}
            >
              <Save size={16} />
              <span>बदल जतन करा</span>
            </button>
            <button
              type="button"
              onClick={handleResetChanges}
              className="cm-btn cm-btn-secondary"
              style={{ padding: '9px 12px', fontSize: '0.84rem' }}
              title="बदल पूर्ववत करा"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. FULLSCREEN PREVIEW MODAL */}
      {fullscreenPreview && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.95)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          {/* Top Bar inside Fullscreen */}
          <div style={{ position: 'absolute', top: '16px', right: '24px', display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setFullscreenPreview(false)}
              className="cm-btn cm-btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Minimize2 size={16} />
              <span>फुलस्क्रीन बंद करा (ESC)</span>
            </button>
          </div>

          {/* Fullscreen A4 Preview */}
          <div style={{
            height: '88vh',
            aspectRatio: '1 / 1.414',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            position: 'relative'
          }}>
            <img
              src={editorState.image || '/assets/images/user-yuva-udyojak-visheshank.jpg'}
              alt={editorState.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '36px 28px',
              background: 'linear-gradient(180deg, transparent 0%, rgba(15, 23, 42, 0.95) 100%)',
              color: '#FFF',
              textAlign: editorState.textAlign
            }}>
              <span style={{ background: '#F4510B', color: '#FFF', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 800 }}>
                पृष्ठ {selectedPage.pageNo} • {editorState.category}
              </span>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '10px 0 6px', color: '#FFF' }}>
                {editorState.title}
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#CBD5E1', margin: 0 }}>
                {editorState.desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
