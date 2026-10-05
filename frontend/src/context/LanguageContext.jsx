import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = [
  { code: 'mr', name: 'Marathi', label: 'मराठी', flag: '🚩', short: 'म' },
  { code: 'en', name: 'English', label: 'English', flag: '🌐', short: 'EN' },
  { code: 'hi', name: 'Hindi', label: 'हिंदी', flag: '🇮🇳', short: 'हि' },
];

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_preferred_lang');
      if (saved && ['mr', 'en', 'hi'].includes(saved)) {
        return saved;
      }
      // Also check googtrans cookie if previously set
      const match = document.cookie.match(/googtrans=\/mr\/(en|hi|mr)/);
      if (match && match[1]) {
        return match[1];
      }
    } catch (e) {
      console.warn('Language preference read error:', e);
    }
    return 'mr';
  });

  const [isTranslating, setIsTranslating] = useState(false);

  // Initialize headless Google Translate script for full website translation
  useEffect(() => {
    // Define global callback if not present
    window.googleTranslateElementInit = function () {
      try {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'mr',
              includedLanguages: 'mr,en,hi',
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
            },
            'google_translate_element'
          );
        }
      } catch (err) {
        console.warn('Google translate init error:', err);
      }
    };

    // Inject hidden container if missing
    if (!document.getElementById('google_translate_element')) {
      const div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.display = 'none';
      div.setAttribute('aria-hidden', 'true');
      document.body.appendChild(div);
    }

    // Inject Google Translate script if not loaded
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Function to apply language translation to the entire page
  const applyTranslation = useCallback((langCode) => {
    setIsTranslating(true);
    try {
      localStorage.setItem('cm_preferred_lang', langCode);

      // Set cookie for Google Translate
      const domain = window.location.hostname;
      if (langCode === 'mr') {
        // Reset to original Marathi
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`;
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain};`;
        document.cookie = `googtrans=/mr/mr; path=/;`;
        document.cookie = `googtrans=/mr/mr; path=/; domain=.${domain};`;
        document.cookie = `googtrans=/mr/mr; path=/; domain=${domain};`;
      } else {
        const transValue = `/mr/${langCode}`;
        document.cookie = `googtrans=${transValue}; path=/;`;
        document.cookie = `googtrans=${transValue}; path=/; domain=.${domain};`;
        document.cookie = `googtrans=${transValue}; path=/; domain=${domain};`;
      }

      // Trigger Google Translate dropdown element if present in DOM
      const selectElem = document.querySelector('.goog-te-combo');
      if (selectElem) {
        selectElem.value = langCode;
        selectElem.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        // If combo is not ready yet, reload or trigger when element is ready
        setTimeout(() => {
          const combo = document.querySelector('.goog-te-combo');
          if (combo) {
            combo.value = langCode;
            combo.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, 500);
      }
    } catch (e) {
      console.error('Translation trigger error:', e);
    } finally {
      setTimeout(() => setIsTranslating(false), 300);
    }
  }, []);

  const changeLanguage = (langCode) => {
    if (!['mr', 'en', 'hi'].includes(langCode)) return;
    setCurrentLang(langCode);
    applyTranslation(langCode);
  };

  // Re-apply translation on mount if not 'mr'
  useEffect(() => {
    if (currentLang && currentLang !== 'mr') {
      const timer = setTimeout(() => {
        applyTranslation(currentLang);
      }, 800);
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
