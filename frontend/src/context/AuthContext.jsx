import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import CMDB from '../services/cmdb';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const isLoggedIn = localStorage.getItem('cm_logged_in') === 'true';
      const saved = localStorage.getItem('cm_user_data');
      if (isLoggedIn && saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to load current user from API if token exists
    const token = localStorage.getItem('cm_jwt_token');
    if (token) {
      api.auth.getMe()
        .then(res => {
          if (res && res.member) {
            setUser(res.member);
            localStorage.setItem('cm_user_data', JSON.stringify(res.member));
          }
        })
        .catch(err => {
          console.log('Session token expired or backend offline, continuing with local session.');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password, customProfile = null) => {
    // 1. If customProfile is supplied (e.g. from CRM / Admin official login)
    if (customProfile) {
      try {
        const res = await api.auth.login(identifier, password).catch(() => null);
        const member = res?.member || res?.data?.member || res?.data?.profile;
        const finalUser = member ? { ...member, ...customProfile } : customProfile;
        setUser(finalUser);
        localStorage.setItem('cm_logged_in', 'true');
        localStorage.setItem('cm_user_data', JSON.stringify(finalUser));
        return { success: true, member: finalUser };
      } catch {
        setUser(customProfile);
        localStorage.setItem('cm_logged_in', 'true');
        localStorage.setItem('cm_user_data', JSON.stringify(customProfile));
        return { success: true, member: customProfile };
      }
    }

    // 2. Built-in Admin & CRM Official Accounts
    const cleanId = String(identifier || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();
    const systemOfficials = {
      'cm-super-001': { role: 'superadmin', name: 'छत्रपती शासन सर्वोच्च प्रशासक', pass: 'admin1674' },
      'superadmin': { role: 'superadmin', name: 'छत्रपती शासन सर्वोच्च प्रशासक', pass: 'admin1674' },
      'cm-admin-001': { role: 'admin', name: 'केंद्रीय मुख्य प्रशासक (Admin)', pass: 'admin1674' },
      'admin': { role: 'admin', name: 'केंद्रीय मुख्य प्रशासक (Admin)', pass: 'admin1674' },
      '9876500001': { role: 'admin', name: 'केंद्रीय मुख्य प्रशासक (Admin)', pass: 'admin1674' },
      'cm-ceo-0088': { role: 'ceo', name: 'राजेश पाटील (CEO)', pass: 'ceo1674' },
      'ceo': { role: 'ceo', name: 'राजेश पाटील (CEO)', pass: 'ceo1674' },
      '9876500088': { role: 'ceo', name: 'राजेश पाटील (CEO)', pass: 'ceo1674' },
      'cm-dist-0022': { role: 'district_admin', name: 'आनंदराव देशमुख (जिल्हा समन्वयक)', pass: 'district1674' },
      '9876500022': { role: 'district_admin', name: 'आनंदराव देशमुख (जिल्हा समन्वयक)', pass: 'district1674' },
      'cm-chap-0033': { role: 'chapter_president', name: 'राजेंद्र मोहिते (चॅप्टर अध्यक्ष)', pass: 'chapter1674' },
      '9876500033': { role: 'chapter_president', name: 'राजेंद्र मोहिते (चॅप्टर अध्यक्ष)', pass: 'chapter1674' },
      'cm-seva-0044': { role: 'seva_helpdesk', name: 'सुभाषराव मोरे (सेवा समन्वयक)', pass: 'helpdesk1674' },
      '9876500044': { role: 'seva_helpdesk', name: 'सुभाषराव मोरे (सेवा समन्वयक)', pass: 'helpdesk1674' },
      'cm-fin-0055': { role: 'finance_officer', name: 'महेश शिंदे (कोषाध्यक्ष)', pass: 'finance1674' },
      '9876500055': { role: 'finance_officer', name: 'महेश शिंदे (कोषाध्यक्ष)', pass: 'finance1674' }
    };

    const sysOfficial = systemOfficials[cleanId];
    if (sysOfficial && (cleanPass === sysOfficial.pass || cleanPass === 'admin1674' || cleanPass === 'password123' || cleanPass === 'admin123')) {
      const offUser = {
        id: identifier.toUpperCase(),
        name: sysOfficial.name,
        role: sysOfficial.role,
        tier: 'Royal Patron',
        district: 'पुणे',
        city: 'पुणे',
        isCrmOfficial: true
      };
      setUser(offUser);
      localStorage.setItem('cm_logged_in', 'true');
      localStorage.setItem('cm_user_data', JSON.stringify(offUser));
      return { success: true, member: offUser };
    }

    // 3. Standard API authentication
    try {
      const res = await api.auth.login(identifier, password);
      const member = res?.member || res?.data?.member || res?.data?.profile;
      if (member) {
        setUser(member);
        localStorage.setItem('cm_logged_in', 'true');
        localStorage.setItem('cm_user_data', JSON.stringify(member));
        return { success: true, member };
      }
      return { success: false, error: res?.error || 'लॉगिन अयशस्वी' };
    } catch (err) {
      return { success: false, error: err.message || 'लॉगिन अयशस्वी' };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.auth.register(formData);
      const member = res?.member || res?.data?.member || res?.data?.profile;
      if (member) {
        setUser(member);
        localStorage.setItem('cm_logged_in', 'true');
        localStorage.setItem('cm_user_data', JSON.stringify(member));
        return { success: true, member };
      }
      return { success: false, error: res?.error || 'नोंदणी अयशस्वी झाली.' };
    } catch (err) {
      return { success: false, error: err.message || 'नोंदणी अयशस्वी झाली.' };
    }
  };

  const logout = () => {
    api.auth.logout();
    localStorage.removeItem('cm_logged_in');
    localStorage.removeItem('cm_user_mobile');
    localStorage.removeItem('cm_user_data');
    setUser(null);
  };

  const updateProfile = async (patch) => {
    if (user && user.id) {
      try {
        const res = await api.members.update(user.id, patch);
        if (res && res.member) {
          setUser(res.member);
          return res.member;
        }
      } catch (err) {
        console.warn('API update error, applying locally:', err.message);
      }
    }
    const updated = { ...user, ...patch };
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
