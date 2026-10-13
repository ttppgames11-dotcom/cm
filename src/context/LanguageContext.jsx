import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = [
  { code: 'mr', name: 'Marathi', label: 'मराठी', flag: '🚩', short: 'म' },
  { code: 'en', name: 'English', label: 'English', flag: '🌐', short: 'EN' },
  { code: 'hi', name: 'Hindi', label: 'हिंदी', flag: '🇮🇳', short: 'हि' },
];

function setCookieAllDomains(name, value) {
  const hostname = window.location.hostname;
  const path = 'path=/;';
  
  if (value === null) {
    // Delete cookie
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${path}`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${path} domain=${hostname};`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${path} domain=.${hostname};`;
    
    // Also remove parent domain variations
    const parts = hostname.split('.');
    if (parts.length > 2) {
      const rootDomain = parts.slice(-2).join('.');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${path} domain=${rootDomain};`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; ${path} domain=.${rootDomain};`;
    }
  } else {
    document.cookie = `${name}=${value}; ${path}`;
    document.cookie = `${name}=${value}; ${path} domain=${hostname};`;
    document.cookie = `${name}=${value}; ${path} domain=.${hostname};`;
    
    const parts = hostname.split('.');
    if (parts.length > 2) {
      const rootDomain = parts.slice(-2).join('.');
      document.cookie = `${name}=${value}; ${path} domain=${rootDomain};`;
      document.cookie = `${name}=${value}; ${path} domain=.${rootDomain};`;
    }
  }
}

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_preferred_lang');
      if (saved && ['mr', 'en', 'hi'].includes(saved)) {
        return saved;
      }
      const match = document.cookie.match(/googtrans=\/(mr|auto)\/(en|hi|mr)/);
      if (match && match[2] && ['mr', 'en', 'hi'].includes(match[2])) {
        return match[2];
      }
    } catch (e) {
      console.warn('Language preference read error:', e);
    }
    return 'mr';
  });

  const [isTranslating, setIsTranslating] = useState(false);

  // Apply translation via Google Translate combo or cookie reload
  const applyTranslation = useCallback((langCode, forceReload = false) => {
    setIsTranslating(true);
    try {
      localStorage.setItem('cm_preferred_lang', langCode);

      if (langCode === 'mr') {
        // Reset to original Marathi
        setCookieAllDomains('googtrans', null);
        setCookieAllDomains('googtrans', '/auto/mr');
        
        // Try to trigger select combo
        const selectElem = document.querySelector('.goog-te-combo') || document.querySelector('select.goog-te-combo');
        if (selectElem) {
          selectElem.value = 'mr';
          selectElem.dispatchEvent(new Event('change', { bubbles: true }));
          selectElem.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // If forceReload or returning from en/hi, do a clean reload if needed
        if (forceReload) {
          setTimeout(() => {
            window.location.reload();
          }, 150);
          return;
        }
      } else {
        const transVal = `/auto/${langCode}`;
        setCookieAllDomains('googtrans', transVal);
        setCookieAllDomains('googtrans', `/mr/${langCode}`);

        // Try triggering select directly
        const selectElem = document.querySelector('.goog-te-combo') || document.querySelector('select.goog-te-combo');
        if (selectElem) {
          selectElem.value = langCode;
          selectElem.dispatchEvent(new Event('change', { bubbles: true }));
          selectElem.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          // Poll for select element if Google Translate is still loading
          let attempts = 0;
          const interval = setInterval(() => {
            attempts++;
            const el = document.querySelector('.goog-te-combo') || document.querySelector('select.goog-te-combo');
            if (el) {
              el.value = langCode;
              el.dispatchEvent(new Event('change', { bubbles: true }));
              el.dispatchEvent(new Event('input', { bubbles: true }));
              clearInterval(interval);
            } else if (attempts > 10) {
              clearInterval(interval);
              if (forceReload) {
                window.location.reload();
              }
            }
          }, 150);
        }
      }
    } catch (e) {
      console.error('Translation error:', e);
    } finally {
      setTimeout(() => setIsTranslating(false), 400);
    }
  }, []);

  const changeLanguage = (langCode) => {
    if (!['mr', 'en', 'hi'].includes(langCode)) return;
    const previous = currentLang;
    setCurrentLang(langCode);
    
    // When switching from English/Hindi back to Marathi or vice versa, ensure full restoration
    const needsReload = (previous !== 'mr' && langCode === 'mr') || !document.querySelector('.goog-te-combo');
    applyTranslation(langCode, needsReload);
  };

  // Re-apply translation on mount if saved language is not 'mr'
  useEffect(() => {
    if (currentLang && currentLang !== 'mr') {
      const timer = setTimeout(() => {
        applyTranslation(currentLang, false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentLang, applyTranslation]);

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        changeLanguage,
        isTranslating,
        languages: SUPPORTED_LANGUAGES,
        currentLanguageObj: SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      currentLang: 'mr',
      changeLanguage: () => {},
      isTranslating: false,
      languages: SUPPORTED_LANGUAGES,
      currentLanguageObj: SUPPORTED_LANGUAGES[0],
    };
  }
  return context;
}
