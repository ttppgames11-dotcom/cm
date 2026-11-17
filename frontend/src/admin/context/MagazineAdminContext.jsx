import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_ISSUES,
  INITIAL_ARTICLES,
  INITIAL_AUTHORS,
  INITIAL_PAGES_10,
  INITIAL_ADVERTISEMENTS,
  INITIAL_PACKAGES,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_APPROVALS,
  INITIAL_MEDIA
} from '../utils/initialData';

const MagazineAdminContext = createContext(null);

export const MagazineAdminProvider = ({ children }) => {
  // Admin Authentication State
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_magazine_admin_user');
      if (saved) return JSON.parse(saved);
      // Default logged in admin for preview & development convenience
      const defaultUser = {
        name: "प्रशासक (Admin)",
        email: "admin@connectmaratha.com",
        role: "Super Admin",
        avatar: "/assets/images/user-yuva-udyojak-visheshank.jpg"
      };
      localStorage.setItem('cm_magazine_admin_user', JSON.stringify(defaultUser));
      return defaultUser;
    } catch {
      return {
        name: "प्रशासक (Admin)",
        email: "admin@connectmaratha.com",
        role: "Super Admin"
      };
    }
  });

  // Toast System
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 1. Issues
  const [issues, setIssues] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_admin_issues');
      return saved ? JSON.parse(saved) : INITIAL_ISSUES;
    } catch {
      return INITIAL_ISSUES;
    }
  });

  useEffect(() => {
    localStorage.setItem('cm_admin_issues', JSON.stringify(issues));
  }, [issues]);

  // 2. Articles
  const [articles, setArticles] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_admin_articles');
      return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
    } catch {
      return INITIAL_ARTICLES;
    }
  });

  useEffect(() => {
    localStorage.setItem('cm_admin_articles', JSON.stringify(articles));
  }, [articles]);

  // 3. Authors
  const [authors, setAuthors] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_admin_authors');
      return saved ? JSON.parse(saved) : INITIAL_AUTHORS;
    } catch {
      return INITIAL_AUTHORS;
    }
  });

  useEffect(() => {
    localStorage.setItem('cm_admin_authors', JSON.stringify(authors));
  }, [authors]);

  // 4. Pages (10-Page Format & Dynamic)
  const [pages, setPages] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_admin_pages');
      return saved ? JSON.parse(saved) : INITIAL_PAGES_10;
    } catch {
      return INITIAL_PAGES_10;
    }
  });

  useEffect(() => {
    localStorage.setItem('cm_admin_pages', JSON.stringify(pages));
  }, [pages]);

  // 5. Advertisements
  const [advertisements, setAdvertisements] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_admin_advertisements');
      return saved ? JSON.parse(saved) : INITIAL_ADVERTISEMENTS;
    } catch {
      return INITIAL_ADVERTISEMENTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('cm_admin_advertisements', JSON.stringify(advertisements));
  }, [advertisements]);

  // 6. Packages
  const [packages, setPackages] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_admin_packages');
      return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
    } catch {
      return INITIAL_PACKAGES;
    }
  });

  useEffect(() => {
    localStorage.setItem('cm_admin_packages', JSON.stringify(packages));
  }, [packages]);

  // 7. Subscriptions
  const [subscriptions, setSubscriptions] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_admin_subscriptions');
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem('cm_admin_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  // 8. Approvals
  const [approvals, setApprovals] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_admin_approvals');
      return saved ? JSON.parse(saved) : INITIAL_APPROVALS;
    } catch {
      return INITIAL_APPROVALS;
    }
  });

  useEffect(() => {
    localStorage.setItem('cm_admin_approvals', JSON.stringify(approvals));
  }, [approvals]);

  // 9. Media Library
  const [mediaList, setMediaList] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_admin_media');
      return saved ? JSON.parse(saved) : INITIAL_MEDIA;
    } catch {
      return INITIAL_MEDIA;
    }
  });

  useEffect(() => {
    localStorage.setItem('cm_admin_media', JSON.stringify(mediaList));
  }, [mediaList]);

  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('cm_admin_settings');
      return saved ? JSON.parse(saved) : {
        adminName: "मुख्य प्रशासक (SuperAdmin)",
        email: "admin@connectmaratha.com",
        phone: "+91 98220 00000",
        magazineTitle: "Connect Maratha Magazine",
        publishingCycle: "Monthly (मासिक)",
        defaultLanguage: "मराठी (Marathi)",
        autoApproval: false,
        emailNotifications: true,
        allowPublicComments: true,
        theme: "light"
      };
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('cm_admin_settings', JSON.stringify(settings));
  }, [settings]);

  // Authentication Handlers
  const login = (email, password) => {
    if (email && password) {
      const user = {
        name: "प्रशासक (Admin)",
        email: email,
        role: "Super Admin",
        avatar: "/assets/images/user-yuva-udyojak-visheshank.jpg"
      };
      setAdminUser(user);
      localStorage.setItem('cm_magazine_admin_user', JSON.stringify(user));
      addToast("यशस्वीरीत्या लॉगिन झाले! स्वागत आहे.", "success");
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('cm_magazine_admin_user');
    addToast("लॉगआउट झाले.", "info");
  };

  return (
    <MagazineAdminContext.Provider value={{
      adminUser,
      login,
      logout,
      toasts,
      addToast,
      removeToast,
      // Issues
      issues,
      setIssues,
      // Articles
      articles,
      setArticles,
      // Authors
      authors,
      setAuthors,
      // Pages
      pages,
      setPages,
      // Ads
      advertisements,
      setAdvertisements,
      // Packages
      packages,
      setPackages,
      // Subscriptions
      subscriptions,
      setSubscriptions,
      // Approvals
      approvals,
      setApprovals,
      // Media
      mediaList,
      setMediaList,
      // Settings
      settings,
      setSettings
    }}>
      {children}
    </MagazineAdminContext.Provider>
  );
};

export const useMagazineAdmin = () => {
  const context = useContext(MagazineAdminContext);
  if (!context) {
    throw new Error('useMagazineAdmin must be used within a MagazineAdminProvider');
  }
  return context;
};

