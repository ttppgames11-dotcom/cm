import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const SiteContentContext = createContext(null);

export const defaultSiteContent = {
  header: {
    brandTitle: "CONNECT मराठा",
    brandSubtitle: "एक लढा! एक समाज! एक भविष्य!",
    logoIcon: "🚩",
    logoUrl: "/assets/images/maratha_samrajya_logo.png",
    ctaButtonText: "सदस्य व्हा",
    ctaButtonLink: "/register",
    ctaButtonVisible: true
  },
  hero: {
    badgeText: "🚩 CONNECT मराठा — एक लढा! एक समाज! एक भविष्य!",
    title: "मराठा समाजाचे जागतिक डिजिटल व्यासपीठ",
    subtitle: "एकत्र येऊया, संघटित होऊया, समृद्ध होऊया || जय भवानी ! जय शिवाजी !",
    description: "व्यापार, संस्कृती, रोजगार, सामाजिक साहाय्य आणि गड-किल्ले संवर्धन — संपूर्ण मराठा समाजाला एका सशक्त डिजिटल सूत्रात बांधणारे सर्वोच्च नेटवर्क.",
    bannerImageUrl: "/assets/images/maratha-samrajya.jpg",
    primaryButtonText: "डिजिटल सदस्य व्हा 🚩",
    primaryButtonLink: "/register",
    primaryButtonVisible: true,
    secondaryButtonText: "बिझनेस संगम (B2B)",
    secondaryButtonLink: "/sangam",
    secondaryButtonVisible: true,
    announcementMarquee: "🚩 सर्व मराठा बांधवांना डिजिटल जोडणारा महा-प्लॅटफॉर्म — आजच आपले अधिकृत डिजिटल ओळखपत्र मिळवा!"
  },
  buttons: {
    joinMember: { label: "डिजिटल सदस्य व्हा 🚩", link: "/register", color: "#E65100", visible: true },
    businessSangam: { label: "बिझनेस संगम (B2B)", link: "/sangam", color: "#1B5E20", visible: true },
    bloodSos: { label: "तातडीने रक्त हवे (SOS)", link: "/community/blood", color: "#C62828", visible: true },
    donate: { label: "देणगी द्या", link: "/donation", color: "#F57C00", visible: true },
    jobs: { label: "रोजगार शोधा", link: "/jobs", color: "#0277BD", visible: true },
    matrimony: { label: "मराठा वधू-वर", link: "/community/matrimony", color: "#AD1457", visible: true },
    emergencyHelpline: { label: "हेल्पलाइन डायल करा", link: "tel:18002091674", color: "#D84315", visible: true }
  },
  images: {
    heroBanner: "/assets/images/maratha-samrajya.jpg",
    brandLogo: "/assets/images/maratha_samrajya_logo.png",
    fortsBanner: "/assets/images/generated/forts_hero_banner.jpg",
    cultureHero: "/assets/images/generated/maratha_culture_hero.jpg",
    sangamHero: "/assets/images/generated/business_sangam_hero.jpg",
    donationHero: "/assets/images/generated/donation_campaigns_hero.jpg",
    emergencyBanner: "/assets/images/generated/emergency_blood_hero.jpg",
    dairyHero: "/assets/images/generated/maratha_dairy_hero.jpg",
    buildersHero: "/assets/images/generated/maratha_builders_hero.jpg",
    speakersHero: "/assets/images/generated/maratha_speakers_hero.jpg",
    manufacturersHero: "/assets/images/generated/maratha_manufacturers_hero.jpg"
  },
  texts: {
    tagline: "अखिल भारतीय मराठा समाजाचे अधिकृत डिजिटल व्यासपीठ",
    missionStatement: "मराठा समाजातील प्रत्येक घटकाचा सर्वांगीण आर्थिक, शैक्षणिक, सांस्कृतिक व सामाजिक विकास साधणे.",
    visionStatement: "जागतिक पातळीवर संघटित, स्वाभिमानी व आत्मनिर्भर मराठा समाज आणि उद्योजक पिढीची निर्मिती करणे.",
    emergencyNotice: "२४x७ मराठा समाज साहाय्य व आपत्कालीन रक्तदाता समन्वय कक्ष सदैव तत्पर.",
    footerAbout: "Connect Maratha हे जागतिक मराठा बांधवांना व्यापार, समाजकार्य, संस्कृती आणि रोजगार क्षेत्रात एकत्र आणणारे सर्वोच्च व्यासपीठ आहे."
  },
  links: {
    navigation: [
      { id: 'nav-home', label: 'मुखपृष्ठ', path: '/', visible: true },
      { id: 'nav-sangam', label: 'बिझनेस संगम', path: '/sangam', visible: true },
      { id: 'nav-directory', label: 'निर्देशिका', path: '/directory', visible: true },
      { id: 'nav-culture', label: 'संस्कृती', path: '/culture', visible: true },
      { id: 'nav-forts', label: 'दुर्ग व किल्ले', path: '/forts', visible: true },
      { id: 'nav-history', label: 'इतिहास', path: '/history', visible: true },
      { id: 'nav-donation', label: 'देणगी', path: '/donation', visible: true },
      { id: 'nav-safety', label: 'मदत कक्ष', path: '/community/safety', visible: true }
    ],
    social: {
      facebook: "https://facebook.com/connectmaratha",
      twitter: "https://twitter.com/connectmaratha",
      instagram: "https://instagram.com/connectmaratha",
      youtube: "https://youtube.com/connectmaratha",
      whatsapp: "+919822011223",
      telegram: "https://t.me/connectmaratha"
    },
    footerLinks: [
      { label: "डिजिटल ओळखपत्र", path: "/card" },
      { label: "व्यवसाय नोंदणी", path: "/business" },
      { label: "नोकरी व करिअर", path: "/jobs" },
      { label: "रक्तदान साहाय्य", path: "/community/blood" },
      { label: "मराठा वधू-वर", path: "/community/matrimony" },
      { label: "गोपनीयता धोरण", path: "/privacy" },
      { label: "नियम व अटी", path: "/terms" }
    ]
  },
  forms: {
    memberRegistration: {
      title: "महासंघ अधिकृत डिजिटल सदस्यता नोंदणी",
      enabled: true,
      instructions: "कृपया आधार/ओळखपत्रावरील नाव आणि अचूक तपशील प्रविष्ट करा.",
      welcomeNotice: "नोंदणीनंतर लगेच डिजिटल ओळखपत्र सक्रिय होईल."
    },
    bloodSosForm: {
      title: "तातडीने रक्त मागणी (SOS)",
      enabled: true,
      helpline: "1800-209-1674",
      urgentNotice: "तातडीच्या रक्त गरजेसाठी थेट रुग्णालय तपशील भरा. समन्वय कक्ष २४x७ कार्यरत आहे."
    },
    businessRegistration: {
      title: "मराठा व्यवसाय / फर्म नोंदणी",
      enabled: true,
      approvalRequired: true,
      discountNotice: "मराठा महासंघ सदस्यांसाठी विशेष व्यावसायिक सवलत."
    },
    contactSupport: {
      email: "support@connectmaratha.org",
      phone: "+91 98220 11223",
      emergencyHelpline: "1800-209-1674",
      address: "छत्रपती संभाजी महाराज भवन, एफसी रोड, शिवाजीनगर, पुणे, महाराष्ट्र - ४११००४"
    }
  },
  footer: {
    copyright: "© २०२६ Connect Maratha (कनेक्ट मराठा) • सर्व हक्क राखीव",
    poweredBy: "अखिल भारतीय मराठा महासंघ डिजिटल मिशन"
  }
};

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState(() => {
    try {
      const cached = localStorage.getItem('cm_site_content');
      return cached ? JSON.parse(cached) : defaultSiteContent;
    } catch {
      return defaultSiteContent;
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load latest content from API on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    apiClient.getSiteContent()
      .then((data) => {
        if (isMounted && data && typeof data === 'object') {
          setContent((prev) => {
            const merged = { ...defaultSiteContent, ...prev, ...data };
            localStorage.setItem('cm_site_content', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch((err) => {
        console.warn('[SiteContent] Could not fetch live content, using cached/defaults:', err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Helper to extract nested values with fallback: getContent('hero.title', 'fallback')
  const getContent = (path, fallback = '') => {
    if (!content) return fallback;
    const parts = path.split('.');
    let cur = content;
    for (const p of parts) {
      if (cur === undefined || cur === null) return fallback;
      cur = cur[p];
    }
    return cur !== undefined && cur !== null && cur !== '' ? cur : fallback;
  };

  // Update specific section
  const updateSection = async (section, data) => {
    setIsSaving(true);
    try {
      const res = await apiClient.updateSiteSection(section, data);
      const updated = res || { ...content, [section]: { ...content[section], ...data } };
      setContent(updated);
      localStorage.setItem('cm_site_content', JSON.stringify(updated));
      return { success: true, updated };
    } catch (err) {
      console.error('[SiteContent] Error updating section:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Save entire modified content tree
  const saveAllContent = async (newContent) => {
    setIsSaving(true);
    try {
      const res = await apiClient.updateSiteContent(newContent);
      const updated = res || newContent;
      setContent(updated);
      localStorage.setItem('cm_site_content', JSON.stringify(updated));
      return { success: true, updated };
    } catch (err) {
      console.error('[SiteContent] Error saving content:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const resetToDefault = async () => {
    setIsSaving(true);
    try {
      const res = await apiClient.resetSiteContent();
      const reset = res || defaultSiteContent;
      setContent(reset);
      localStorage.setItem('cm_site_content', JSON.stringify(reset));
      return { success: true, reset };
    } catch (err) {
      console.error('[SiteContent] Error resetting:', err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SiteContentContext.Provider
      value={{
        content,
        getContent,
        updateSection,
        saveAllContent,
        resetToDefault,
        isLoading,
        isSaving
      }}
    >
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    return {
      content: defaultSiteContent,
      getContent: (path, fallback = '') => fallback,
      updateSection: async () => {},
      saveAllContent: async () => {},
      resetToDefault: async () => {},
      isLoading: false,
      isSaving: false
    };
  }
  return ctx;
}

export default SiteContentContext;
