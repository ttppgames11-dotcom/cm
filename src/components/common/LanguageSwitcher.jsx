import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitcher({ variant = 'topbar' }) {
  const { currentLang, changeLanguage, languages, currentLanguageObj, isTranslating } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  const isTopbar = variant === 'topbar';

  return (
    <div
      ref={dropdownRef}
      className={`cm-lang-switcher cm-lang-${variant}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="भाषा निवडा / Select Language / भाषा चुनें"
        aria-label="Language Selector"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          background: isTopbar ? 'rgba(255, 255, 255, 0.18)' : '#FFF8F0',
          border: isTopbar ? '1px solid rgba(253, 230, 138, 0.4)' : '1.5px solid #FFCC80',
          color: isTopbar ? '#FFFFFF' : '#8C1D03',
          padding: isTopbar ? '2px 9px' : '6px 12px',
          borderRadius: '20px',
          fontSize: isTopbar ? '0.78rem' : '0.86rem',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isTopbar ? '0 1px 4px rgba(0,0,0,0.15)' : '0 2px 6px rgba(194, 65, 12, 0.1)',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: isTopbar ? '0.9rem' : '1rem' }}>{currentLanguageObj.flag}</span>
        <span style={{ letterSpacing: '0.2px' }}>{currentLanguageObj.label}</span>
        <span style={{ fontSize: '0.65rem', opacity: 0.8, marginLeft: '2px' }}>▾</span>
        {isTranslating && <span style={{ fontSize: '0.7rem', animation: 'spin 1s linear infinite' }}>⏳</span>}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: '#FFFFFF',
            borderRadius: '10px',
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0,0,0,0.06)',
            padding: '6px',
            minWidth: '150px',
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            zIndex: 99999,
            border: '1px solid #FED7AA',
            animation: 'fadeInDown 0.18s ease-out',
          }}
        >
          <div style={{ padding: '4px 8px 2px', fontSize: '0.68rem', fontWeight: 800, color: '#9A3412', borderBottom: '1px solid #FEE2E2', letterSpacing: '0.5px' }}>
            भाषा / LANGUAGE
          </div>
          {languages.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isSelected ? '#FFF7ED' : 'transparent',
                  color: isSelected ? '#C2410C' : '#334155',
                  fontWeight: isSelected ? '800' : '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>{lang.flag}</span>
                  <span>{lang.label}</span>
                </div>
                {isSelected && <span style={{ color: '#EA580C', fontWeight: '900', fontSize: '0.9rem' }}>✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
